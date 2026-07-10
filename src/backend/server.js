const path = require('node:path');

const { createApp } = require('./app');
const { LinkService } = require('./services/link-service');
const { JsonLinkStore } = require('./storage/json-link-store');

const port = Number(process.env.PORT) || 3000;
const storageFilePath = path.resolve(__dirname, '..', '..', 'data', 'links.json');

async function start() {
  const store = new JsonLinkStore({ filePath: storageFilePath });
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

module.exports = { start };
