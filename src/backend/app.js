const express = require('express');
const path = require('node:path');

const { createLinkRouter } = require('./routes/link-routes');

const frontendDirectory = path.resolve(__dirname, '..', 'frontend');

function createApp({ linkService } = {}) {
  const app = express();

  app.use(express.json());

  if (linkService) {
    app.use('/api/links', createLinkRouter({ linkService }));
  }

  app.use(express.static(frontendDirectory));

  app.use((error, request, response, next) => {
    if (response.headersSent) {
      next(error);
      return;
    }

    const statusCode = error.statusCode || 500;
    const message = error.expose ? error.message : 'An unexpected error occurred.';
    response.status(statusCode).json({ error: { code: error.code || 'INTERNAL_ERROR', message } });
  });

  return app;
}

module.exports = { createApp };
