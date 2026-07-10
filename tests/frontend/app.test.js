const assert = require('node:assert/strict');
const test = require('node:test');

const { filterFavourites, formatApiError, formatTimestamp, normaliseLinks, removeLink, replaceLink } = require('../../src/frontend/app');

test('normaliseLinks keeps renderable API link records only', () => {
  const valid = { id: 'one', title: 'Example', url: 'https://example.com', savedAt: '2026-07-10T00:00:00.000Z', favourite: false };
  assert.deepEqual(normaliseLinks([valid, null, { id: 'two', title: 'Missing URL' }, { id: 'three', title: 'Missing timestamp', url: 'https://example.test' }]), [valid]);
  assert.deepEqual(normaliseLinks({ links: [valid] }), []);
});

test('formatTimestamp presents valid dates and handles invalid values', () => {
  assert.notEqual(formatTimestamp('2026-07-10T00:00:00.000Z'), 'Unknown date');
  assert.equal(formatTimestamp('not-a-date'), 'Unknown date');
});

test('removeLink removes exactly the selected saved link', () => {
  const links = [{ id: 'one' }, { id: 'two' }, { id: 'three' }];
  assert.deepEqual(removeLink(links, 'two'), [{ id: 'one' }, { id: 'three' }]);
});

test('normaliseLinks defaults missing favourite state and filters favourites only', () => {
  const links = normaliseLinks([
    { id: 'one', title: 'One', url: 'https://one.example', savedAt: '2026-07-10T00:00:00.000Z' },
    { id: 'two', title: 'Two', url: 'https://two.example', savedAt: '2026-07-10T00:00:00.000Z', favourite: true }
  ]);
  assert.equal(links[0].favourite, false);
  assert.deepEqual(filterFavourites(links).map((link) => link.id), ['two']);
});

test('replaceLink changes only the selected favourite state', () => {
  const links = [{ id: 'one', favourite: false }, { id: 'two', favourite: false }];
  assert.deepEqual(replaceLink(links, { id: 'two', favourite: true }), [{ id: 'one', favourite: false }, { id: 'two', favourite: true }]);
});

test('formatApiError exposes only a user-facing API message or a safe fallback', () => {
  assert.equal(formatApiError({ error: { message: 'Enter a valid URL.' } }), 'Enter a valid URL.');
  assert.equal(formatApiError({ error: { message: '   ' } }), 'Something went wrong. Please try again.');
  assert.equal(formatApiError(null), 'Something went wrong. Please try again.');
});
