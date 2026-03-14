'use strict';

const {
  buildParsedExport,
  extractMessageContent,
} = require('../lib/fetch-group-via-api');

describe('fetch-group-via-api', () => {
  describe('buildParsedExport', () => {
    const mockGroup = {
      id: '120363001@g.us',
      subject: 'Mentoria 50K',
    };

    const mockParticipants = [
      {
        phone: '+5531999887766',
        jid: '5531999887766@s.whatsapp.net',
        admin: true,
        pushName: 'Joao Silva',
      },
      {
        phone: '+5511888776655',
        jid: '5511888776655@s.whatsapp.net',
        admin: false,
        pushName: 'Maria Santos',
      },
    ];

    const mockMessages = [
      {
        key: {
          participant: '5531999887766@s.whatsapp.net',
          remoteJid: '120363001@g.us',
        },
        messageTimestamp: String(Math.floor(Date.now() / 1000)),
        message: { conversation: 'Bom dia pessoal!' },
      },
      {
        key: {
          participant: '5511888776655@s.whatsapp.net',
          remoteJid: '120363001@g.us',
        },
        messageTimestamp: String(Math.floor(Date.now() / 1000) + 60),
        message: { conversation: 'Oi! Tudo bem?' },
      },
    ];

    it('produces ParsedExport-compatible output', () => {
      const result = buildParsedExport(mockGroup, mockParticipants, mockMessages);

      expect(result).toHaveProperty('group_name', 'Mentoria 50K');
      expect(result).toHaveProperty('date_range');
      expect(result.date_range).toHaveProperty('start');
      expect(result.date_range).toHaveProperty('end');
      expect(result).toHaveProperty('total_messages', 2);
      expect(result).toHaveProperty('total_contacts', 2);
      expect(result).toHaveProperty('contacts');
      expect(result.contacts).toHaveLength(2);
    });

    it('contacts have required fields', () => {
      const result = buildParsedExport(mockGroup, mockParticipants, mockMessages);
      const contact = result.contacts[0];

      expect(contact).toHaveProperty('name', 'Joao Silva');
      expect(contact).toHaveProperty('phone', '+5531999887766');
      expect(contact).toHaveProperty('message_count');
      expect(contact).toHaveProperty('first_message_date');
      expect(contact).toHaveProperty('last_message_date');
      expect(contact).toHaveProperty('messages');
      expect(contact).toHaveProperty('name_source', 'evolution_api');
      expect(contact).toHaveProperty('name_confidence', 'high');
    });

    it('resolves phones from JIDs (100% coverage)', () => {
      const result = buildParsedExport(mockGroup, mockParticipants, mockMessages);

      const phonesResolved = result.contacts.filter((c) => c.phone).length;
      expect(phonesResolved).toBe(result.total_contacts);
    });

    it('groups messages by sender correctly', () => {
      const result = buildParsedExport(mockGroup, mockParticipants, mockMessages);

      const joao = result.contacts.find((c) => c.name === 'Joao Silva');
      const maria = result.contacts.find((c) => c.name === 'Maria Santos');

      expect(joao.message_count).toBe(1);
      expect(maria.message_count).toBe(1);
      expect(joao.messages[0].content).toBe('Bom dia pessoal!');
    });

    it('includes _meta with source info', () => {
      const result = buildParsedExport(mockGroup, mockParticipants, mockMessages);

      expect(result._meta).toHaveProperty('source', 'evolution_api');
      expect(result._meta).toHaveProperty('phones_resolved', true);
      expect(result._meta).toHaveProperty('fetched_at');
    });

    it('handles participants with no messages', () => {
      const result = buildParsedExport(mockGroup, mockParticipants, []);

      expect(result.contacts).toHaveLength(2);
      expect(result.contacts[0].message_count).toBe(0);
      expect(result.contacts[0].messages).toEqual([]);
    });

    it('handles empty participants', () => {
      const result = buildParsedExport(mockGroup, [], mockMessages);

      expect(result.total_contacts).toBe(0);
      expect(result.contacts).toEqual([]);
    });

    it('uses group subject as group_name', () => {
      const result = buildParsedExport(
        { id: '120363001@g.us', name: 'Fallback Name' },
        [], []
      );
      expect(result.group_name).toBe('Fallback Name');
    });

    it('falls back to "Unknown Group" when no name', () => {
      const result = buildParsedExport({ id: '120363001@g.us' }, [], []);
      expect(result.group_name).toBe('Unknown Group');
    });
  });

  describe('extractMessageContent', () => {
    it('extracts conversation text', () => {
      const msg = { message: { conversation: 'Hello!' } };
      expect(extractMessageContent(msg)).toBe('Hello!');
    });

    it('extracts extended text message', () => {
      const msg = { message: { extendedTextMessage: { text: 'Extended hello' } } };
      expect(extractMessageContent(msg)).toBe('Extended hello');
    });

    it('extracts image caption', () => {
      const msg = { message: { imageMessage: { caption: 'Look at this' } } };
      expect(extractMessageContent(msg)).toBe('[image] Look at this');
    });

    it('extracts video caption', () => {
      const msg = { message: { videoMessage: { caption: 'Watch this' } } };
      expect(extractMessageContent(msg)).toBe('[video] Watch this');
    });

    it('returns [audio] for audio messages', () => {
      const msg = { message: { audioMessage: { seconds: 30 } } };
      expect(extractMessageContent(msg)).toBe('[audio]');
    });

    it('returns null for sticker messages', () => {
      const msg = { message: { stickerMessage: {} } };
      expect(extractMessageContent(msg)).toBeNull();
    });

    it('returns null for messages without content', () => {
      expect(extractMessageContent({ message: null })).toBeNull();
      expect(extractMessageContent({})).toBeNull();
    });
  });
});
