const { randomUUID } = require('node:crypto');

const { NotFoundError, ValidationError } = require('../errors');
const { normaliseUrl } = require('../lib/url');
const { fetchPageTitle } = require('../lib/title-fetcher');

class LinkService {
  constructor({ store, titleFetcher = fetchPageTitle }) {
    this.store = store;
    this.titleFetcher = titleFetcher;
  }

  async list({ favouritesOnly = false } = {}) {
    const links = await this.store.list();
    return favouritesOnly ? links.filter((link) => link.favourite) : links;
  }

  async create(url) {
    const normalisedUrl = normaliseUrl(url);
    const title = await this.titleFetcher(normalisedUrl);
    const link = {
      id: randomUUID(),
      url: normalisedUrl,
      title,
      savedAt: new Date().toISOString(),
      favourite: false
    };

    return this.store.create(link);
  }

  async delete(id) {
    const deletedLink = await this.store.delete(id);
    if (!deletedLink) {
      throw new NotFoundError('The saved link was not found.');
    }
  }

  async setFavourite(id, favourite) {
    if (typeof favourite !== 'boolean') {
      throw new ValidationError('Favourite must be true or false.');
    }

    const updatedLink = await this.store.update(id, { favourite });
    if (!updatedLink) {
      throw new NotFoundError('The saved link was not found.');
    }

    return updatedLink;
  }
}

module.exports = { LinkService };
