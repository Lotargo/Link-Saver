const assert = require('node:assert/strict');
const test = require('node:test');

const { formatApiError, formatTimestamp, normaliseLinks, removeLink } = require('../../src/frontend/app');

test('normaliseLinks keeps renderable API link records only', () => {
  const valid = { id: 'one', title: 'Example', url: 'https://example.com', savedAt: '2026-07-10T00:00:00.000Z' };
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

test('formatApiError exposes only a user-facing API message or a safe fallback', () => {
  assert.equal(formatApiError({ error: { message: 'Enter a valid URL.' } }), 'Enter a valid URL.');
  assert.equal(formatApiError({ error: { message: '   ' } }), 'Something went wrong. Please try again.');
  assert.equal(formatApiError(null), 'Something went wrong. Please try again.');
});
