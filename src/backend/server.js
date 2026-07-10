const path = require('node:path');

require('dotenv').config();

const { createApp } = require('./app');
const { LinkService } = require('./services/link-service');
const { JsonLinkStore } = require('./storage/json-link-store');
const { NeonLinkStore } = require('./storage/neon-link-store');

const port = Number(process.env.PORT) || 3000;
const storageFilePath = path.resolve(__dirname, '..', '..', 'data', 'links.json');

function createStore() {
  if (process.env.DATABASE_URL) {
    return new NeonLinkStore({ databaseUrl: process.env.DATABASE_URL });
  }

  return new JsonLinkStore({ filePath: storageFilePath });
}

async function start() {
  const store = createStore();
  await store.initialise();
  const app = createApp({ linkService: new LinkService({ store }) });

  return app.listen(port, () => {
    console.log(`Link Saver is listening on http://localhost:${port}`);
  });
}

if (require.main === module) {
  start().catch(() => {
    console.error('Link Saver could not start because its saved data is unavailable.');
    process.exitCode = 1;
  });
}

module.exports = { createStore, start };
