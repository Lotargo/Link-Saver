const assert = require('node:assert/strict');
const http = require('node:http');
const test = require('node:test');

const { createApp } = require('../../src/backend/app');

test('serves the initial Link Saver page', async () => {
  const server = http.createServer(createApp());

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/`);
    const page = await response.text();

    assert.equal(response.status, 200);
    assert.match(page, /<title>Link Saver<\/title>/);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});
