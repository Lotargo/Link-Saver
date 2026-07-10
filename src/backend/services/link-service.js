const { randomUUID } = require('node:crypto');

const { NotFoundError } = require('../errors');
const { normaliseUrl } = require('../lib/url');
const { fetchPageTitle } = require('../lib/title-fetcher');

class LinkService {
  constructor({ store, titleFetcher = fetchPageTitle }) {
    this.store = store;
    this.titleFetcher = titleFetcher;
  }

  async list() {
    return this.store.list();
  }

  async create(url) {
    const normalisedUrl = normaliseUrl(url);
    const title = await this.titleFetcher(normalisedUrl);
    const link = {
      id: randomUUID(),
      url: normalisedUrl,
      title,
      savedAt: new Date().toISOString()
    };

    return this.store.create(link);
  }

  async delete(id) {
    const deletedLink = await this.store.delete(id);
    if (!deletedLink) {
      throw new NotFoundError('The saved link was not found.');
    }
  }
}

module.exports = { LinkService };
