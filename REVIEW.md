# Existing-code review

## Reviewed source material

```js
const express = require('express');
const fs = require('fs');
const app = express();

app.use(express.json());

let links = JSON.parse(fs.readFileSync('links.json'));

app.post('/links', async (req, res) => {
 const { url } = req.body;
 const html = await fetch(url).then(r => r.text());
 const title = html.match(/<title>(.*)<\/title>/)[1];
 const link = { id: Date.now(), url, title, savedAt: new Date() };
 links.push(link);
 fs.writeFileSync('links.json', JSON.stringify(links));
 res.json(link);
});

app.delete('/links/:id', (req, res) => {
 links = links.filter(l => l.id === req.params.id);
 fs.writeFileSync('links.json', JSON.stringify(links));
 res.sendStatus(200);
});

app.listen(3000);
```

## Summary

The code has one confirmed data-loss risk, startup paths that can crash the process, and a deletion route that cannot delete records created by this application. The highest-priority corrections are atomic persistence, explicit storage failures, safe URL/title handling, and a stable string ID.

## Findings

| Severity | Finding | What breaks and when | Correction |
| --- | --- | --- | --- |
| P1 — high | `writeFileSync('links.json', ...)` overwrites the only data file in place. | A process crash, disk-full error, or interruption during the write can leave a truncated/invalid file. The next startup then fails in `JSON.parse`; previously saved links may be unrecoverable. | Write a temporary file in the same directory, then rename it over the data file. Propagate a storage error if either step fails. |
| P1 — high | IDs are numbers but `req.params.id` is always a string. | A created record has `id: 123`; `123 === '123'` is false, so `DELETE /links/123` retains it. The route returns 200 even though nothing was deleted. | Use `randomUUID()` string IDs, or parse and validate the parameter. Return 404 when no matching link exists. |
| P1 — high | Startup performs an unchecked synchronous read and parse of a relative path. | First run without `links.json`, malformed JSON, a changed working directory, or an unreadable file throws before the server starts. | Resolve an application-owned path, create the directory and `[]` file when absent, and raise a concise storage error for malformed or unreadable data. |
| P1 — high | Remote fetches have no timeout or error handling. | A slow/unreachable host can keep a request open indefinitely; DNS/TLS/fetch failures reject the async handler. | Validate the URL first, use `AbortController` with a finite timeout, and map expected fetch failures to a concise 422 response. |
| P1 — high | `html.match(/<title>(.*)<\/title>/)[1]` assumes one one-line title. | Pages with no title, line breaks inside the title, uppercase tags, or malformed HTML make `match(...)` return `null`, then `[1]` throws. The expression is also greedy. | Check successful HTML responses and parse the document with an HTML parser; reject only when no usable title remains. |
| P2 — medium | The request body is used as a fetch target without validation. | Missing, non-string, malformed, or non-HTTP URLs cause errors. Server-side requests can also reach addresses the browser could not, so this is not safe to describe as SSRF-protected. | Require a non-empty string, parse it with `URL`, and accept only `http:` or `https:`. Document that complete SSRF defence needs additional address and redirect checks. |
| P2 — medium | HTTP status and content type are ignored. | A 404/500 HTML error page can be saved as a title; JSON, a download, or another non-HTML response is parsed as though it were a page. | Require `response.ok` and an HTML content type before reading and parsing the body. |
| P2 — medium | The route sends raw operational exceptions through Express defaults. | Fetch, parsing, or disk errors can yield inconsistent responses and may expose implementation details depending on configuration. | Use a central error handler with explicit validation, remote-fetch, not-found, and storage error types. |
| P2 — medium | The code is only safe for one process and has no update serialization. | A second server process with the same file can overwrite changes made by the first. | State the one-process limitation for this JSON design; use a real database or locking if multi-process access is required. |
| P3 — low | API semantics are incomplete and ambiguous. | There is no list route, creating returns 200 instead of 201, and deletion reports success for an unknown ID. | Add `GET /api/links`, return 201 for creates, 204 for successful deletes, and 404 for unknown IDs. |

## Corrected code

The corrected implementation separates storage, URL/title retrieval, service behavior, and HTTP routes. The following excerpts show the changes that remove the failures above.

### Safe storage

```js
const { randomUUID } = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');

class JsonLinkStore {
  constructor({ filePath }) {
    this.filePath = path.resolve(filePath);
  }

  async initialise() {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    try {
      await fs.access(this.filePath);
    } catch (error) {
      if (error.code !== 'ENOENT') throw new Error('Saved links could not be accessed.');
      await this.#write([]);
    }
    await this.#read();
  }

  async #read() {
    const contents = await fs.readFile(this.filePath, 'utf8');
    const links = JSON.parse(contents);
    if (!Array.isArray(links)) throw new Error('Saved links must be an array.');
    return links;
  }

  async #write(links) {
    const temporaryPath = `${this.filePath}.${randomUUID()}.tmp`;
    await fs.writeFile(temporaryPath, `${JSON.stringify(links, null, 2)}\n`, 'utf8');
    await fs.rename(temporaryPath, this.filePath);
  }
}
```

### Validated URL and robust title retrieval

```js
function normaliseUrl(value) {
  if (typeof value !== 'string' || value.trim() === '') throw new Error('Enter a URL to save.');
  const url = new URL(value.trim());
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Only HTTP and HTTPS URLs can be saved.');
  return url.toString();
}

async function fetchPageTitle(url, { fetchImpl = fetch, timeoutMs = 5000 } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url, { signal: controller.signal, headers: { accept: 'text/html,application/xhtml+xml' } });
    if (!response.ok) throw new Error('The page could not be retrieved.');
    if (!response.headers.get('content-type')?.toLowerCase().includes('html')) throw new Error('The URL does not point to an HTML page.');
    const title = extractTitleWithHtmlParser(await response.text());
    if (!title) throw new Error('The page does not have a usable title.');
    return title;
  } finally {
    clearTimeout(timeout);
  }
}
```

### Correct deletion semantics

```js
async function deleteLink(store, id) {
  const deletedLink = await store.delete(id);
  if (!deletedLink) throw new Error('The saved link was not found.');
}

router.delete('/:id', async (request, response, next) => {
  try {
    await deleteLink(store, request.params.id);
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});
```

The repository implementation applies these ideas in `src/backend/storage/json-link-store.js`, `src/backend/lib/url.js`, `src/backend/lib/title-fetcher.js`, `src/backend/services/link-service.js`, and `src/backend/routes/link-routes.js`.

## Regression confirmation

The deletion regression is covered by tests that create two links, delete one by its stable string ID, and assert that only the selected link is removed. This demonstrates that the original number-versus-string comparison failure cannot recur in the corrected behavior.
