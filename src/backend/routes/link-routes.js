const express = require('express');
const { ValidationError } = require('../errors');

function createLinkRouter({ linkService }) {
  const router = express.Router();

  router.get('/', async (request, response, next) => {
    try {
      const favourites = request.query.favourites;
      if (favourites !== undefined && favourites !== 'true') {
        throw new ValidationError('Favourites filter must be true.');
      }
      response.json({ links: await linkService.list({ favouritesOnly: favourites === 'true' }) });
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

  router.patch('/:id/favourite', async (request, response, next) => {
    try {
      const link = await linkService.setFavourite(request.params.id, request.body?.favourite);
      response.json({ link });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = { createLinkRouter };
