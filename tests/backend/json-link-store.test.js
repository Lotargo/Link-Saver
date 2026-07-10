const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { JsonLinkStore } = require('../../src/backend/storage/json-link-store');

async function createTemporaryStore() {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'link-saver-'));
  return {
    directory,
    filePath: path.join(directory, 'nested', 'links.json'),
    store: new JsonLinkStore({ filePath: path.join(directory, 'nested', 'links.json') })
  };
}

async function removeTemporaryStore(directory) {
  await fs.rm(directory, { recursive: true, force: true });
}

test('initialises missing storage and reloads saved links', async () => {
  const { directory, filePath, store } = await createTemporaryStore();

  try {
    await store.initialise();
    assert.deepEqual(JSON.parse(await fs.readFile(filePath, 'utf8')), []);

    const link = { id: 'first', url: 'https://example.com/', title: 'Example', savedAt: '2026-01-01T00:00:00.000Z' };
    await store.create(link);

    const reloadedStore = new JsonLinkStore({ filePath });
    await reloadedStore.initialise();
    assert.deepEqual(await reloadedStore.list(), [link]);
  } finally {
    await removeTemporaryStore(directory);
  }
});

test('rejects malformed persisted data without replacing it', async () => {
  const { directory, filePath, store } = await createTemporaryStore();

  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, '{not valid JSON', 'utf8');

    await assert.rejects(store.initialise(), { message: 'Saved links are invalid. Fix the data file before restarting.' });
    assert.equal(await fs.readFile(filePath, 'utf8'), '{not valid JSON');
  } finally {
    await removeTemporaryStore(directory);
  }
});

test('updates and deletes only the selected link', async () => {
  const { directory, store } = await createTemporaryStore();
  const first = { id: 'first', url: 'https://one.example/', title: 'One', savedAt: '2026-01-01T00:00:00.000Z' };
  const second = { id: 'second', url: 'https://two.example/', title: 'Two', savedAt: '2026-01-02T00:00:00.000Z' };

  try {
    await store.initialise();
    await store.create(first);
    await store.create(second);

    assert.deepEqual(await store.update('second', { title: 'Updated two' }), { ...second, title: 'Updated two' });
    assert.deepEqual(await store.delete('first'), first);
    assert.deepEqual(await store.list(), [{ ...second, title: 'Updated two' }]);
    assert.equal(await store.delete('missing'), null);
  } finally {
    await removeTemporaryStore(directory);
  }
});
