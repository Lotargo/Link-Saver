class AppError extends Error {
  constructor(message, { statusCode, code }) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.expose = true;
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, { statusCode: 400, code: 'VALIDATION_ERROR' });
  }
}

class NotFoundError extends AppError {
  constructor(message) {
    super(message, { statusCode: 404, code: 'NOT_FOUND' });
  }
}

class RemoteFetchError extends AppError {
  constructor(message) {
    super(message, { statusCode: 422, code: 'REMOTE_FETCH_ERROR' });
  }
}

class StorageError extends AppError {
  constructor(message) {
    super(message, { statusCode: 500, code: 'STORAGE_ERROR' });
  }
}

module.exports = { NotFoundError, RemoteFetchError, StorageError, ValidationError };
