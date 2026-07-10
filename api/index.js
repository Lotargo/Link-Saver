const { createApp } = require('../src/backend/app');
const { LinkService } = require('../src/backend/services/link-service');
const { NeonLinkStore } = require('../src/backend/storage/neon-link-store');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be configured for the Vercel deployment.');
}

const store = new NeonLinkStore({ databaseUrl: process.env.DATABASE_URL });
const initialiseStore = store.initialise();
const app = createApp({ linkService: new LinkService({ store }) });

module.exports = async (request, response) => {
  await initialiseStore;
  return app(request, response);
};
