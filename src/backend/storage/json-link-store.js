const { randomUUID } = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');

const { StorageError } = require('../errors');

class JsonLinkStore {
  constructor({ filePath }) {
    this.filePath = path.resolve(filePath);
  }

  async initialise() {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });

    try {
      await fs.access(this.filePath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw new StorageError('Saved links could not be accessed.');
      }

      await this.#write([]);
    }

    await this.#read();
  }

  async list() {
    return this.#read();
  }

  async create(link) {
    const links = await this.#read();
    links.push(link);
    await this.#write(links);
    return link;
  }

  async update(id, changes) {
    const links = await this.#read();
    const index = links.findIndex((link) => link.id === id);

    if (index === -1) {
      return null;
    }

    const updatedLink = { ...links[index], ...changes, id };
    links[index] = updatedLink;
    await this.#write(links);
    return updatedLink;
  }

  async delete(id) {
    const links = await this.#read();
    const index = links.findIndex((link) => link.id === id);

    if (index === -1) {
      return null;
    }

    const [deletedLink] = links.splice(index, 1);
    await this.#write(links);
    return deletedLink;
  }

  async #read() {
    let contents;

    try {
      contents = await fs.readFile(this.filePath, 'utf8');
    } catch {
      throw new StorageError('Saved links could not be read.');
    }

    try {
      const links = JSON.parse(contents);

      if (!Array.isArray(links)) {
        throw new Error('Saved links must be an array.');
      }

      return links.map((link) => ({ ...link, favourite: link.favourite === true }));
    } catch {
      throw new StorageError('Saved links are invalid. Fix the data file before restarting.');
    }
  }

  async #write(links) {
    const temporaryPath = `${this.filePath}.${randomUUID()}.tmp`;

    try {
      await fs.writeFile(temporaryPath, `${JSON.stringify(links, null, 2)}\n`, 'utf8');
      await fs.rename(temporaryPath, this.filePath);
    } catch {
      await fs.rm(temporaryPath, { force: true }).catch(() => {});
      throw new StorageError('Saved links could not be written.');
    }
  }
}

module.exports = { JsonLinkStore };
