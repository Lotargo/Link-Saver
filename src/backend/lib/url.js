const { ValidationError } = require('../errors');

function normaliseUrl(value) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ValidationError('Enter a URL to save.');
  }

  let url;
  try {
    url = new URL(value.trim());
  } catch {
    throw new ValidationError('Enter a valid URL.');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new ValidationError('Only HTTP and HTTPS URLs can be saved.');
  }

  return url.toString();
}

module.exports = { normaliseUrl };
