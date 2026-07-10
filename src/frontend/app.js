function normaliseLinks(links) {
  if (!Array.isArray(links)) {
    return [];
  }

  return links.filter((link) => link && typeof link.id === 'string' && typeof link.title === 'string' && typeof link.url === 'string' && typeof link.savedAt === 'string');
}

function removeLink(links, id) {
  return links.filter((link) => link.id !== id);
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
    async list() {
      const payload = await request('/api/links');
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
  const state = { links: [], saving: false };

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
      details.append(title, anchor, time);
      item.append(details, deleteButton);
      list.append(item);
    }
  }

  async function loadLinks() {
    clearError();
    try {
      state.links = await api.list();
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
      state.links = normaliseLinks([...state.links, link]);
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

  form.addEventListener('submit', saveLink);
  loadLinks();
  return { loadLinks, render, state };
}

if (typeof module !== 'undefined') {
  module.exports = { formatApiError, formatTimestamp, normaliseLinks, removeLink };
}

if (typeof document !== 'undefined') {
  createPage(document);
}
