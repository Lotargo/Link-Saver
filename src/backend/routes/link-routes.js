const express = require('express');

function createLinkRouter({ linkService }) {
  const router = express.Router();

  router.get('/', async (request, response, next) => {
    try {
      response.json({ links: await linkService.list() });
    } catch (error) {
      next(error);
    }
  });

  router.post('/', async (request, response, next) => {
    try {
      const link = await linkService.create(request.body?.url);
      response.status(201).json({ link });
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:id', async (request, response, next) => {
    try {
      await linkService.delete(request.params.id);
      response.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = { createLinkRouter };
