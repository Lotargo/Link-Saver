const assert = require('node:assert/strict');
const test = require('node:test');

const { RemoteFetchError, ValidationError } = require('../../src/backend/errors');
const { extractTitle, fetchPageTitle } = require('../../src/backend/lib/title-fetcher');
const { normaliseUrl } = require('../../src/backend/lib/url');

test('normalises valid HTTP URLs and rejects invalid input', () => {
  assert.equal(normaliseUrl(' https://example.com '), 'https://example.com/');
  assert.throws(() => normaliseUrl(), ValidationError);
  assert.throws(() => normaliseUrl('ftp://example.com'), /Only HTTP and HTTPS/);
  assert.throws(() => normaliseUrl('not a URL'), /Enter a valid URL/);
});

test('extracts and normalises a page title with an HTML parser', () => {
  assert.equal(extractTitle('<html><head><title>  Example &amp;   Site </title></head></html>'), 'Example & Site');
  assert.equal(extractTitle('<html><head></head></html>'), null);
});

test('fetches titles and reports unsuccessful or non-HTML responses', async () => {
  const successfulFetch = async () => new Response('<title>Saved page</title>', {
    headers: { 'content-type': 'text/html; charset=utf-8' },
    status: 200
  });

  assert.equal(await fetchPageTitle('https://example.com/', { fetchImpl: successfulFetch }), 'Saved page');
  await assert.rejects(
    fetchPageTitle('https://example.com/', { fetchImpl: async () => new Response('', { status: 503 }) }),
    RemoteFetchError
  );
  await assert.rejects(
    fetchPageTitle('https://example.com/', { fetchImpl: async () => new Response('data', { headers: { 'content-type': 'application/json' } }) }),
    /does not point to an HTML page/
  );
});

test('returns a title-unavailable result when a site blocks automated retrieval', async () => {
  const blockedFetch = async () => new Response('', { status: 403 });

  assert.deepEqual(
    await fetchPageTitle('https://chatgpt.com/', { fetchImpl: blockedFetch }),
    { title: 'chatgpt.com', titleStatus: 'unavailable' }
  );
});

test('reports a timed-out title request', async () => {
  const slowFetch = (url, { signal }) => new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
  });

  await assert.rejects(
    fetchPageTitle('https://example.com/', { fetchImpl: slowFetch, timeoutMs: 10 }),
    /took too long/
  );
});
