const { neon } = require('@neondatabase/serverless');

const { StorageError } = require('../errors');

function normaliseLink(row) {
  return {
    id: row.id,
    url: row.url,
    title: row.title,
    savedAt: row.savedAt instanceof Date ? row.savedAt.toISOString() : row.savedAt,
    favourite: row.favourite === true,
    titleStatus: row.titleStatus === 'unavailable' ? 'unavailable' : 'fetched'
  };
}

class NeonLinkStore {
  constructor({ databaseUrl, sql = databaseUrl ? neon(databaseUrl) : null }) {
    if (!sql) {
      throw new StorageError('Saved links storage is not configured.');
    }

    this.sql = sql;
  }

  async initialise() {
    try {
      await this.sql`
        CREATE TABLE IF NOT EXISTS saved_links (
          id TEXT PRIMARY KEY,
          url TEXT NOT NULL,
          title TEXT NOT NULL,
          saved_at TIMESTAMPTZ NOT NULL,
          favourite BOOLEAN NOT NULL DEFAULT FALSE,
          title_status TEXT NOT NULL DEFAULT 'fetched' CHECK (title_status IN ('fetched', 'unavailable'))
        )
      `;
    } catch {
      throw new StorageError('Saved links storage could not be initialised.');
    }
  }

  async list() {
    try {
      const links = await this.sql`
        SELECT id, url, title, saved_at AS "savedAt", favourite, title_status AS "titleStatus"
        FROM saved_links
        ORDER BY saved_at ASC, id ASC
      `;
      return links.map(normaliseLink);
    } catch {
      throw new StorageError('Saved links could not be read.');
    }
  }

  async create(link) {
    try {
      const [createdLink] = await this.sql`
        INSERT INTO saved_links (id, url, title, saved_at, favourite, title_status)
        VALUES (${link.id}, ${link.url}, ${link.title}, ${link.savedAt}, ${link.favourite}, ${link.titleStatus})
        RETURNING id, url, title, saved_at AS "savedAt", favourite, title_status AS "titleStatus"
      `;
      return normaliseLink(createdLink);
    } catch {
      throw new StorageError('Saved links could not be written.');
    }
  }

  async update(id, changes) {
    if (typeof changes.favourite !== 'boolean') {
      throw new StorageError('Saved link update is invalid.');
    }

    try {
      const [updatedLink] = await this.sql`
        UPDATE saved_links
        SET favourite = ${changes.favourite}
        WHERE id = ${id}
        RETURNING id, url, title, saved_at AS "savedAt", favourite, title_status AS "titleStatus"
      `;
      return updatedLink ? normaliseLink(updatedLink) : null;
    } catch {
      throw new StorageError('Saved links could not be written.');
    }
  }

  async delete(id) {
    try {
      const [deletedLink] = await this.sql`
        DELETE FROM saved_links
        WHERE id = ${id}
        RETURNING id, url, title, saved_at AS "savedAt", favourite, title_status AS "titleStatus"
      `;
      return deletedLink ? normaliseLink(deletedLink) : null;
    } catch {
      throw new StorageError('Saved links could not be written.');
    }
  }
}

module.exports = { NeonLinkStore, normaliseLink };
