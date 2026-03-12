'use strict';

class EvolutionApiError extends Error {
  constructor(message, { statusCode, endpoint, body } = {}) {
    super(message);
    this.name = 'EvolutionApiError';
    this.statusCode = statusCode ?? null;
    this.endpoint = endpoint ?? null;
    this.body = body ?? null;
  }
}

class AuthenticationError extends EvolutionApiError {
  constructor(endpoint) {
    super('Invalid or missing API key', { statusCode: 401, endpoint });
    this.name = 'AuthenticationError';
  }
}

class InstanceNotFoundError extends EvolutionApiError {
  constructor(instance, endpoint) {
    super(`Instance "${instance}" not found`, { statusCode: 404, endpoint });
    this.name = 'InstanceNotFoundError';
    this.instance = instance;
  }
}

class RateLimitError extends EvolutionApiError {
  constructor(endpoint, retryAfter) {
    super('Rate limit exceeded', { statusCode: 429, endpoint });
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter ?? null;
  }
}

module.exports = {
  EvolutionApiError,
  AuthenticationError,
  InstanceNotFoundError,
  RateLimitError,
};
