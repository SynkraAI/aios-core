'use strict';

const {
  EvolutionApiError,
  AuthenticationError,
  InstanceNotFoundError,
  RateLimitError,
} = require('./errors');

const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 1_000;

class EvolutionClient {
  /**
   * @param {object} opts
   * @param {string} opts.baseUrl  - Evolution API base URL (no trailing slash)
   * @param {string} opts.apiKey   - API key for authentication
   * @param {string} opts.instance - Default instance name
   * @param {number} [opts.timeoutMs] - Request timeout in ms (default 30s)
   */
  constructor({ baseUrl, apiKey, instance, timeoutMs } = {}) {
    if (!baseUrl) throw new Error('baseUrl is required');
    if (!apiKey) throw new Error('apiKey is required');
    if (!instance) throw new Error('instance is required');

    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.apiKey = apiKey;
    this.instance = instance;
    this.timeoutMs = timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  /**
   * Core HTTP request with retry + timeout.
   * @param {string} method - HTTP method
   * @param {string} path   - Path (instance name is interpolated by caller)
   * @param {object} [data] - JSON body
   * @returns {Promise<object>}
   */
  async _request(method, path, data) {
    const url = `${this.baseUrl}${path}`;
    let lastError;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        const delay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        await this.constructor._sleep(delay);
      }

      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeoutMs);

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            apikey: this.apiKey,
          },
          body: data ? JSON.stringify(data) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timer);

        if (response.ok) {
          const text = await response.text();
          return text ? JSON.parse(text) : {};
        }

        const body = await response.text().catch(() => '');
        lastError = EvolutionClient._mapError(response.status, url, body, this.instance);

        // Only retry on 429 or 5xx
        if (response.status === 429 || response.status >= 500) {
          continue;
        }

        throw lastError;
      } catch (err) {
        if (err instanceof EvolutionApiError) {
          throw err;
        }
        if (err.name === 'AbortError') {
          lastError = new EvolutionApiError(`Request timed out after ${this.timeoutMs}ms`, {
            endpoint: url,
          });
          continue;
        }
        lastError = new EvolutionApiError(err.message, { endpoint: url });
        continue;
      }
    }

    throw lastError;
  }

  static _mapError(status, endpoint, body, instance) {
    if (status === 401) return new AuthenticationError(endpoint);
    if (status === 404) return new InstanceNotFoundError(instance, endpoint);
    if (status === 429) {
      const err = new RateLimitError(endpoint);
      try {
        const parsed = JSON.parse(body);
        err.retryAfter = parsed.retryAfter ?? null;
      } catch { /* ignore */ }
      return err;
    }
    return new EvolutionApiError(`HTTP ${status}: ${body}`, {
      statusCode: status,
      endpoint,
      body,
    });
  }

  static _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = { EvolutionClient };
