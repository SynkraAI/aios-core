'use strict';

const { EvolutionClient } = require('../index');

const mockFetch = jest.fn();
global.fetch = mockFetch;

jest.spyOn(EvolutionClient, '_sleep').mockResolvedValue(undefined);

const CLIENT_OPTS = {
  baseUrl: 'https://evo.example.com',
  apiKey: 'test-key',
  instance: 'test-instance',
};

function jsonResponse(data) {
  return {
    ok: true,
    status: 200,
    text: () => Promise.resolve(JSON.stringify(data)),
  };
}

describe('Instances', () => {
  let client;

  beforeEach(() => {
    mockFetch.mockReset();
    client = new EvolutionClient(CLIENT_OPTS);
  });

  describe('createInstance', () => {
    it('creates instance with correct payload', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ instance: { instanceName: 'new-one' } }));

      const result = await client.createInstance({ instanceName: 'new-one' });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://evo.example.com/instance/create',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ instanceName: 'new-one', qrcode: true }),
        }),
      );
      expect(result.instance.instanceName).toBe('new-one');
    });

    it('respects qrcode=false', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({}));

      await client.createInstance({ instanceName: 'no-qr', qrcode: false });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.qrcode).toBe(false);
    });
  });

  describe('getConnectionState', () => {
    it('calls correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({ instance: 'test-instance', state: 'open' }),
      );

      const result = await client.getConnectionState();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://evo.example.com/instance/connectionState/test-instance',
        expect.objectContaining({ method: 'GET' }),
      );
      expect(result.state).toBe('open');
    });
  });

  describe('fetchInstance', () => {
    it('fetches instance info', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse([{ instance: { instanceName: 'test-instance', status: 'open' } }]),
      );

      const result = await client.fetchInstance();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://evo.example.com/instance/fetchInstances?instanceName=test-instance',
        expect.objectContaining({ method: 'GET' }),
      );
      expect(result).toHaveLength(1);
    });
  });
});
