const { parseDocument } = require('htmlparser2');

const { RemoteFetchError } = require('../errors');

function extractTitle(html) {
  const document = parseDocument(html);
  const titleElement = findTitle(document.children);

  if (!titleElement) {
    return null;
  }

  const title = textContent(titleElement.children).replace(/\s+/g, ' ').trim();
  return title || null;
}

function findTitle(nodes) {
  for (const node of nodes || []) {
    if (node.type === 'tag' && node.name === 'title') {
      return node;
    }

    const nestedTitle = findTitle(node.children);
    if (nestedTitle) {
      return nestedTitle;
    }
  }

  return null;
}

function textContent(nodes) {
  return (nodes || []).map((node) => {
    if (node.type === 'text') {
      return node.data;
    }

    return textContent(node.children);
  }).join('');
}

async function fetchPageTitle(url, { fetchImpl = fetch, timeoutMs = 5000 } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(url, {
      headers: { accept: 'text/html,application/xhtml+xml' },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new RemoteFetchError('The page could not be retrieved.');
    }

    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.toLowerCase().includes('html')) {
      throw new RemoteFetchError('The URL does not point to an HTML page.');
    }

    const title = extractTitle(await response.text());
    if (!title) {
      throw new RemoteFetchError('The page does not have a usable title.');
    }

    return title;
  } catch (error) {
    if (error instanceof RemoteFetchError) {
      throw error;
    }

    if (error.name === 'AbortError') {
      throw new RemoteFetchError('The page took too long to respond.');
    }

    throw new RemoteFetchError('The page could not be retrieved.');
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { extractTitle, fetchPageTitle };
