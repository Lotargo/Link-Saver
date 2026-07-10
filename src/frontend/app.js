function normaliseLinks(links) {
  if (!Array.isArray(links)) {
    return [];
  }

  return links
    .filter((link) => link && typeof link.id === 'string' && typeof link.title === 'string' && typeof link.url === 'string' && typeof link.savedAt === 'string')
    .map((link) => ({ ...link, favourite: link.favourite === true }));
}

function removeLink(links, id) {
  return links.filter((link) => link.id !== id);
}

function replaceLink(links, updatedLink) {
  return links.map((link) => (link.id === updatedLink.id ? updatedLink : link));
}

function filterFavourites(links) {
  return links.filter((link) => link.favourite);
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? 'Unknown date' : date.toLocaleString();
}

function formatApiError(payload) {
  const message = payload && payload.error && payload.error.message;
  return typeof message === 'string' && message.trim() ? message : 'Something went wrong. Please try again.';
}

async function request(url, options) {
  const response = await fetch(url, options);
  if (response.ok) {
    return response.status === 204 ? null : response.json();
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  throw new Error(formatApiError(payload));
}

function createLinkApi() {
  return {
    async list(favouritesOnly = false) {
      const payload = await request(favouritesOnly ? '/api/links?favourites=true' : '/api/links');
      return normaliseLinks(payload.links);
    },
    async create(url) {
      const payload = await request('/api/links', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url })
      });
      return payload.link;
    },
    delete(id) {
      return request(`/api/links/${encodeURIComponent(id)}`, { method: 'DELETE' });
    },
    async setFavourite(id, favourite) {
      const payload = await request(`/api/links/${encodeURIComponent(id)}/favourite`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ favourite })
      });
      return payload.link;
    }
  };
}

function createPage(document, api = createLinkApi()) {
  const form = document.querySelector('#link-form');
  const input = document.querySelector('#url');
  const saveButton = document.querySelector('#save-button');
  const list = document.querySelector('#link-list');
  const emptyState = document.querySelector('#empty-state');
  const errorMessage = document.querySelector('#error-message');
  const loadingMessage = document.querySelector('#loading-message');
  const favouritesOnly = document.querySelector('#favourites-only');
  const state = { links: [], saving: false, favouritesOnly: false };

  function clearError() {
    errorMessage.textContent = '';
    errorMessage.hidden = true;
  }

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.hidden = false;
  }

  function setSaving(saving) {
    state.saving = saving;
    input.disabled = saving;
    saveButton.disabled = saving;
    saveButton.textContent = saving ? 'Saving…' : 'Save link';
    loadingMessage.textContent = saving ? 'Saving link…' : '';
    loadingMessage.hidden = !saving;
  }

  function render() {
    list.replaceChildren();
    emptyState.textContent = state.favouritesOnly ? 'No favourite links saved yet.' : 'No links saved yet. Add a page above to get started.';
    emptyState.hidden = state.links.length !== 0;
    for (const link of state.links) {
      const item = document.createElement('li');
      item.className = 'link-card';
      const details = document.createElement('div');
      const title = document.createElement('h3');
      title.className = 'link-title';
      title.textContent = link.title;
      const anchor = document.createElement('a');
      anchor.className = 'link-url';
      anchor.href = link.url;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.textContent = link.url;
      const time = document.createElement('time');
      time.className = 'link-time';
      time.dateTime = link.savedAt;
      time.textContent = `Saved ${formatTimestamp(link.savedAt)}`;
      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'delete-button';
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', () => deleteSavedLink(link.id, deleteButton));
      const favouriteButton = document.createElement('button');
      favouriteButton.type = 'button';
      favouriteButton.className = `favourite-button${link.favourite ? ' is-favourite' : ''}`;
      favouriteButton.setAttribute('aria-pressed', String(link.favourite));
      favouriteButton.textContent = link.favourite ? 'Remove favourite' : 'Add favourite';
      favouriteButton.addEventListener('click', () => toggleFavourite(link, favouriteButton));
      const actions = document.createElement('div');
      actions.className = 'link-actions';
      actions.append(favouriteButton, deleteButton);
      details.append(title, anchor, time);
      item.append(details, actions);
      list.append(item);
    }
  }

  async function loadLinks() {
    clearError();
    try {
      state.links = await api.list(state.favouritesOnly);
      render();
    } catch (error) {
      showError(error.message);
    }
  }

  async function saveLink(event) {
    event.preventDefault();
    if (state.saving) {
      return;
    }
    clearError();
    setSaving(true);
    try {
      const link = await api.create(input.value.trim());
      state.links = state.favouritesOnly ? await api.list(true) : normaliseLinks([...state.links, link]);
      input.value = '';
      render();
    } catch (error) {
      showError(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteSavedLink(id, button) {
    clearError();
    button.disabled = true;
    try {
      await api.delete(id);
      state.links = removeLink(state.links, id);
      render();
    } catch (error) {
      button.disabled = false;
      showError(error.message);
    }
  }

  async function toggleFavourite(link, button) {
    clearError();
    button.disabled = true;
    try {
      const updatedLink = await api.setFavourite(link.id, !link.favourite);
      state.links = state.favouritesOnly && !updatedLink.favourite
        ? removeLink(state.links, updatedLink.id)
        : replaceLink(state.links, updatedLink);
      render();
    } catch (error) {
      button.disabled = false;
      showError(error.message);
    }
  }

  function changeFilter() {
    state.favouritesOnly = favouritesOnly.checked;
    loadLinks();
  }

  form.addEventListener('submit', saveLink);
  favouritesOnly.addEventListener('change', changeFilter);
  loadLinks();
  return { loadLinks, render, state };
}

if (typeof module !== 'undefined') {
  module.exports = { filterFavourites, formatApiError, formatTimestamp, normaliseLinks, removeLink, replaceLink };
}

if (typeof document !== 'undefined') {
  createPage(document);
}
