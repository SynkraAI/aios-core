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

describe('Messages', () => {
  let client;

  beforeEach(() => {
    mockFetch.mockReset();
    client = new EvolutionClient(CLIENT_OPTS);
  });

  describe('sendText', () => {
    it('sends text to correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ key: { id: 'msg-1' } }));

      const result = await client.sendText('5511999999999', 'Hello!');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://evo.example.com/message/sendText/test-instance',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ number: '5511999999999', text: 'Hello!' }),
        }),
      );
      expect(result.key.id).toBe('msg-1');
    });

    it('includes delay option when provided', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({}));

      await client.sendText('5511999999999', 'Hi', { delay: 2000 });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.delay).toBe(2000);
    });
  });

  describe('sendMedia', () => {
    it('sends media with caption', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ key: { id: 'media-1' } }));

      await client.sendMedia('5511999999999', {
        mediatype: 'image',
        url: 'https://cdn.example.com/photo.jpg',
        caption: 'Look at this',
      });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.number).toBe('5511999999999');
      expect(body.mediatype).toBe('image');
      expect(body.media).toBe('https://cdn.example.com/photo.jpg');
      expect(body.caption).toBe('Look at this');
    });

    it('defaults mediatype to document', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({}));

      await client.sendMedia('5511999999999', {
        url: 'https://cdn.example.com/file.pdf',
      });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.mediatype).toBe('document');
    });
  });

  describe('sendBatch', () => {
    it('sends to all contacts and returns report', async () => {
      mockFetch.mockResolvedValue(jsonResponse({ key: { id: 'ok' } }));

      const contacts = [
        { number: '5511111111111', name: 'Alice' },
        { number: '5522222222222', name: 'Bob' },
      ];

      const result = await client.sendBatch(
        contacts,
        (c) => ({ text: `Hi ${c.name}` }),
        { intervalMs: 0 },
      );

      expect(result.sent).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.results).toHaveLength(2);
    });

    it('handles partial failures', async () => {
      mockFetch
        .mockResolvedValueOnce(jsonResponse({ key: { id: 'ok' } }))
        .mockRejectedValueOnce(new Error('network error'));

      // Exhaust retries by mocking continued failures for the second contact
      mockFetch
        .mockRejectedValueOnce(new Error('network error'))
        .mockRejectedValueOnce(new Error('network error'))
        .mockRejectedValueOnce(new Error('network error'));

      const contacts = [
        { number: '5511111111111' },
        { number: '5522222222222' },
      ];

      const result = await client.sendBatch(
        contacts,
        (c) => ({ text: 'Hi' }),
        { intervalMs: 0 },
      );

      expect(result.sent).toBe(1);
      expect(result.failed).toBe(1);
    });

    it('calls onProgress for each contact', async () => {
      mockFetch.mockResolvedValue(jsonResponse({}));

      const progress = [];
      await client.sendBatch(
        [{ number: '5511111111111' }],
        () => ({ text: 'Hi' }),
        { intervalMs: 0, onProgress: (r) => progress.push(r) },
      );

      expect(progress).toHaveLength(1);
      expect(progress[0].status).toBe('sent');
    });

    it('supports media in batch via templateFn', async () => {
      mockFetch.mockResolvedValue(jsonResponse({}));

      await client.sendBatch(
        [{ number: '5511111111111' }],
        () => ({
          media: { mediatype: 'image', url: 'https://cdn.example.com/img.jpg', caption: 'test' },
        }),
        { intervalMs: 0 },
      );

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.mediatype).toBe('image');
    });
  });
});
