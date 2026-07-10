const assert = require('node:assert/strict');
const http = require('node:http');
const test = require('node:test');

const { createApp } = require('../../src/backend/app');
const { LinkService } = require('../../src/backend/services/link-service');

function createStore() {
  const links = [];
  return {
    async list() { return links; },
    async create(link) { links.push(link); return link; },
    async delete(id) {
      const index = links.findIndex((link) => link.id === id);
      return index === -1 ? null : links.splice(index, 1)[0];
    }
  };
}

async function withApi(run) {
  const linkService = new LinkService({ store: createStore(), titleFetcher: async () => 'Fetched title' });
  const server = http.createServer(createApp({ linkService }));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

  try {
    await run(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
}

test('creates, lists, and deletes only the selected saved link', async () => {
  await withApi(async (baseUrl) => {
    const create = (url) => fetch(`${baseUrl}/api/links`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ url })
    });
    const first = await (await create('https://one.example')).json();
    const second = await (await create('https://two.example')).json();

    assert.equal((await fetch(`${baseUrl}/api/links`)).status, 200);
    assert.equal((await (await fetch(`${baseUrl}/api/links`)).json()).links.length, 2);
    assert.equal((await fetch(`${baseUrl}/api/links/${first.link.id}`, { method: 'DELETE' })).status, 204);

    const remaining = await (await fetch(`${baseUrl}/api/links`)).json();
    assert.deepEqual(remaining.links.map((link) => link.id), [second.link.id]);
  });
});

test('returns clear errors for invalid URLs and unknown saved links', async () => {
  await withApi(async (baseUrl) => {
    const invalid = await fetch(`${baseUrl}/api/links`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ url: 'ftp://example.com' })
    });
    assert.equal(invalid.status, 400);
    assert.equal((await invalid.json()).error.code, 'VALIDATION_ERROR');

    const missing = await fetch(`${baseUrl}/api/links/missing`, { method: 'DELETE' });
    assert.equal(missing.status, 404);
    assert.equal((await missing.json()).error.message, 'The saved link was not found.');
  });
});
