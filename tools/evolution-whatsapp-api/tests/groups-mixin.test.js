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

describe('GroupsMixin', () => {
  let client;

  beforeEach(() => {
    mockFetch.mockReset();
    client = new EvolutionClient(CLIENT_OPTS);
  });

  describe('fetchAllGroups', () => {
    it('fetches groups without participants', async () => {
      const groups = [{ id: '120363001@g.us', subject: 'Mentoria 50K' }];
      mockFetch.mockResolvedValueOnce(jsonResponse(groups));

      const result = await client.fetchAllGroups();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://evo.example.com/group/fetchAllGroups/test-instance?getParticipants=false',
        expect.objectContaining({ method: 'GET' }),
      );
      expect(result).toEqual(groups);
    });

    it('fetches groups with participants when requested', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse([]));

      await client.fetchAllGroups({ getParticipants: true });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://evo.example.com/group/fetchAllGroups/test-instance?getParticipants=true',
        expect.anything(),
      );
    });
  });

  describe('getParticipants', () => {
    it('fetches participants for a valid group JID', async () => {
      const participants = [
        { id: '5531999887766@s.whatsapp.net', admin: 'admin' },
        { id: '5511888776655@s.whatsapp.net', admin: null },
      ];
      mockFetch.mockResolvedValueOnce(jsonResponse(participants));

      const result = await client.getParticipants('120363001@g.us');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/group/participants/test-instance?groupJid='),
        expect.anything(),
      );
      expect(result).toEqual(participants);
    });

    it('throws on non-group JID', async () => {
      await expect(client.getParticipants('5531999887766@s.whatsapp.net'))
        .rejects.toThrow('Invalid group JID');
    });

    it('throws on invalid JID', async () => {
      await expect(client.getParticipants('not-a-jid'))
        .rejects.toThrow('Invalid group JID');
    });
  });

  describe('findMessages', () => {
    it('sends correct payload', async () => {
      const messages = [{ key: { id: 'msg-1' }, message: { conversation: 'Hello' } }];
      mockFetch.mockResolvedValueOnce(jsonResponse(messages));

      const result = await client.findMessages('120363001@g.us');

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.where.key.remoteJid).toBe('120363001@g.us');
      expect(result).toEqual(messages);
    });

    it('includes limit when provided', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse([]));

      await client.findMessages('120363001@g.us', { limit: 100 });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.limit).toBe(100);
    });

    it('includes offset when provided', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse([]));

      await client.findMessages('120363001@g.us', { offset: 50 });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.offset).toBe(50);
    });

    it('works with individual JIDs too', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse([]));

      await client.findMessages('5531999887766@s.whatsapp.net');

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.where.key.remoteJid).toBe('5531999887766@s.whatsapp.net');
    });
  });

  describe('getParticipantsWithPhones', () => {
    it('converts participant JIDs to phones', async () => {
      const rawParticipants = [
        { id: '5531999887766@s.whatsapp.net', admin: 'admin', name: 'Joao' },
        { id: '5511888776655@s.whatsapp.net', admin: null, pushName: 'Maria' },
      ];
      mockFetch.mockResolvedValueOnce(jsonResponse(rawParticipants));

      const result = await client.getParticipantsWithPhones('120363001@g.us');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        phone: '+5531999887766',
        jid: '5531999887766@s.whatsapp.net',
        admin: true,
        pushName: 'Joao',
      });
      expect(result[1]).toEqual({
        phone: '+5511888776655',
        jid: '5511888776655@s.whatsapp.net',
        admin: false,
        pushName: 'Maria',
      });
    });

    it('handles nested participants object', async () => {
      const response = {
        participants: [
          { id: '5531999887766@s.whatsapp.net', admin: 'superadmin', name: 'Admin' },
        ],
      };
      mockFetch.mockResolvedValueOnce(jsonResponse(response));

      const result = await client.getParticipantsWithPhones('120363001@g.us');

      expect(result).toHaveLength(1);
      expect(result[0].admin).toBe(true);
      expect(result[0].phone).toBe('+5531999887766');
    });

    it('filters out group JIDs from participants', async () => {
      const rawParticipants = [
        { id: '5531999887766@s.whatsapp.net', admin: null },
        { id: '120363001@g.us', admin: null }, // group JID, should be filtered
      ];
      mockFetch.mockResolvedValueOnce(jsonResponse(rawParticipants));

      const result = await client.getParticipantsWithPhones('120363001@g.us');

      expect(result).toHaveLength(1);
    });

    it('skips participants with invalid JIDs gracefully', async () => {
      const rawParticipants = [
        { id: '5531999887766@s.whatsapp.net', admin: null },
        { id: 'invalid-jid', admin: null },
      ];
      mockFetch.mockResolvedValueOnce(jsonResponse(rawParticipants));

      const result = await client.getParticipantsWithPhones('120363001@g.us');

      expect(result).toHaveLength(1);
    });

    it('returns empty array for empty response', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse([]));

      const result = await client.getParticipantsWithPhones('120363001@g.us');

      expect(result).toEqual([]);
    });
  });
});
