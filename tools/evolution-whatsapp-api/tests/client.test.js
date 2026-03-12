'use strict';

const { EvolutionClient } = require('../index');
const {
  EvolutionApiError,
  AuthenticationError,
  InstanceNotFoundError,
  RateLimitError,
} = require('../lib/errors');

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Speed up retries for tests
jest.spyOn(EvolutionClient, '_sleep').mockResolvedValue(undefined);

const CLIENT_OPTS = {
  baseUrl: 'https://evo.example.com',
  apiKey: 'test-key',
  instance: 'test-instance',
  timeoutMs: 5000,
};

function jsonResponse(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(JSON.stringify(data)),
  };
}

function errorResponse(body, status) {
  return {
    ok: false,
    status,
    text: () => Promise.resolve(typeof body === 'string' ? body : JSON.stringify(body)),
  };
}

describe('EvolutionClient', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe('constructor', () => {
    it('throws if baseUrl is missing', () => {
      expect(() => new EvolutionClient({ apiKey: 'k', instance: 'i' }))
        .toThrow('baseUrl is required');
    });

    it('throws if apiKey is missing', () => {
      expect(() => new EvolutionClient({ baseUrl: 'u', instance: 'i' }))
        .toThrow('apiKey is required');
    });

    it('throws if instance is missing', () => {
      expect(() => new EvolutionClient({ baseUrl: 'u', apiKey: 'k' }))
        .toThrow('instance is required');
    });

    it('strips trailing slashes from baseUrl', () => {
      const client = new EvolutionClient({ ...CLIENT_OPTS, baseUrl: 'https://example.com///' });
      expect(client.baseUrl).toBe('https://example.com');
    });
  });

  describe('_request', () => {
    it('sends correct headers and JSON body', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ ok: true }));
      const client = new EvolutionClient(CLIENT_OPTS);

      await client._request('POST', '/test', { foo: 'bar' });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://evo.example.com/test',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: 'test-key',
          },
          body: JSON.stringify({ foo: 'bar' }),
        }),
      );
    });

    it('handles empty response body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(''),
      });
      const client = new EvolutionClient(CLIENT_OPTS);
      const result = await client._request('GET', '/empty');
      expect(result).toEqual({});
    });

    it('throws AuthenticationError on 401', async () => {
      mockFetch.mockResolvedValueOnce(errorResponse('Unauthorized', 401));
      const client = new EvolutionClient(CLIENT_OPTS);
      await expect(client._request('GET', '/test')).rejects.toThrow(AuthenticationError);
    });

    it('throws InstanceNotFoundError on 404', async () => {
      mockFetch.mockResolvedValueOnce(errorResponse('Not found', 404));
      const client = new EvolutionClient(CLIENT_OPTS);
      await expect(client._request('GET', '/test')).rejects.toThrow(InstanceNotFoundError);
    });

    it('retries on 429 and throws RateLimitError after exhausting retries', async () => {
      mockFetch.mockResolvedValue(errorResponse('{}', 429));
      const client = new EvolutionClient(CLIENT_OPTS);
      await expect(client._request('GET', '/test')).rejects.toThrow(RateLimitError);
      // 1 initial + 3 retries = 4 calls
      expect(mockFetch).toHaveBeenCalledTimes(4);
    });

    it('retries on 5xx and succeeds on second attempt', async () => {
      mockFetch
        .mockResolvedValueOnce(errorResponse('Server error', 500))
        .mockResolvedValueOnce(jsonResponse({ recovered: true }));

      const client = new EvolutionClient(CLIENT_OPTS);
      const result = await client._request('GET', '/test');
      expect(result).toEqual({ recovered: true });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('handles network errors with retry', async () => {
      mockFetch
        .mockRejectedValueOnce(new TypeError('fetch failed'))
        .mockResolvedValueOnce(jsonResponse({ ok: true }));

      const client = new EvolutionClient(CLIENT_OPTS);
      const result = await client._request('GET', '/test');
      expect(result).toEqual({ ok: true });
    });

    it('handles abort (timeout) with retry', async () => {
      const abortError = new Error('aborted');
      abortError.name = 'AbortError';

      mockFetch
        .mockRejectedValueOnce(abortError)
        .mockResolvedValueOnce(jsonResponse({ ok: true }));

      const client = new EvolutionClient(CLIENT_OPTS);
      const result = await client._request('GET', '/test');
      expect(result).toEqual({ ok: true });
    });
  });
});
