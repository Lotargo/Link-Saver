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
    async update(id, changes) {
      const index = links.findIndex((link) => link.id === id);
      if (index === -1) return null;
      links[index] = { ...links[index], ...changes };
      return links[index];
    },
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

test('saves a link with a title-unavailable marker when title retrieval is blocked', async () => {
  const store = createStore();
  const linkService = new LinkService({
    store,
    titleFetcher: async () => ({ title: 'chatgpt.com', titleStatus: 'unavailable' })
  });
  const server = http.createServer(createApp({ linkService }));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/links`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ url: 'https://chatgpt.com/' })
    });
    const payload = await response.json();
    assert.equal(response.status, 201);
    assert.equal(payload.link.title, 'chatgpt.com');
    assert.equal(payload.link.titleStatus, 'unavailable');
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});

test('updates favourites and filters the saved-link list', async () => {
  await withApi(async (baseUrl) => {
    const create = async (url) => (await (await fetch(`${baseUrl}/api/links`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ url })
    })).json()).link;
    const first = await create('https://one.example');
    const second = await create('https://two.example');

    const update = await fetch(`${baseUrl}/api/links/${second.id}/favourite`, {
      method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ favourite: true })
    });
    assert.equal(update.status, 200);
    assert.equal((await update.json()).link.favourite, true);

    const favourites = await (await fetch(`${baseUrl}/api/links?favourites=true`)).json();
    assert.deepEqual(favourites.links.map((link) => link.id), [second.id]);
    assert.equal(first.favourite, false);
  });
});

test('rejects invalid favourite updates and filters', async () => {
  await withApi(async (baseUrl) => {
    const invalidUpdate = await fetch(`${baseUrl}/api/links/missing/favourite`, {
      method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ favourite: 'yes' })
    });
    assert.equal(invalidUpdate.status, 400);
    assert.equal((await invalidUpdate.json()).error.code, 'VALIDATION_ERROR');

    const invalidFilter = await fetch(`${baseUrl}/api/links?favourites=false`);
    assert.equal(invalidFilter.status, 400);
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
