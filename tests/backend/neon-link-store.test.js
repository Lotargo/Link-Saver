const assert = require('node:assert/strict');
const test = require('node:test');

const { NeonLinkStore, normaliseLink } = require('../../src/backend/storage/neon-link-store');

function createSqlStub(responses) {
  const calls = [];
  const sql = async (strings, ...values) => {
    const query = strings.join('?').replace(/\s+/g, ' ').trim();
    calls.push({ query, values });
    return responses.shift();
  };

  return { calls, sql };
}

test('normaliseLink preserves database fields used by the API', () => {
  assert.deepEqual(
    normaliseLink({ id: 'one', url: 'https://example.com/', title: 'Example', savedAt: '2026-07-11T00:00:00.000Z', favourite: true, titleStatus: 'unavailable' }),
    { id: 'one', url: 'https://example.com/', title: 'Example', savedAt: '2026-07-11T00:00:00.000Z', favourite: true, titleStatus: 'unavailable' }
  );
});

test('initialises and performs CRUD queries through injected Neon SQL', async () => {
  const link = { id: 'one', url: 'https://example.com/', title: 'Example', savedAt: '2026-07-11T00:00:00.000Z', favourite: false, titleStatus: 'fetched' };
  const updatedLink = { ...link, favourite: true };
  const { calls, sql } = createSqlStub([[], [link], [link], [updatedLink], [updatedLink], []]);
  const store = new NeonLinkStore({ sql });

  await store.initialise();
  assert.deepEqual(await store.list(), [link]);
  assert.deepEqual(await store.create(link), link);
  assert.deepEqual(await store.update('one', { favourite: true }), updatedLink);
  assert.deepEqual(await store.delete('one'), updatedLink);
  assert.equal(await store.delete('missing'), null);
  assert.match(calls[0].query, /CREATE TABLE IF NOT EXISTS saved_links/);
  assert.match(calls[3].query, /UPDATE saved_links/);
  assert.deepEqual(calls[3].values, [true, 'one']);
});

test('rejects an invalid Neon update before executing SQL', async () => {
  const { calls, sql } = createSqlStub([]);
  const store = new NeonLinkStore({ sql });

  await assert.rejects(store.update('one', { favourite: 'yes' }), /Saved link update is invalid/);
  assert.equal(calls.length, 0);
});
