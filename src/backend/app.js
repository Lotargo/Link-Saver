const express = require('express');
const path = require('node:path');

const frontendDirectory = path.resolve(__dirname, '..', 'frontend');

function createApp() {
  const app = express();

  app.use(express.static(frontendDirectory));

  return app;
}

module.exports = { createApp };
