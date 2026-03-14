'use strict';

const {
  jidToE164,
  isGroupJid,
  isIndividualJid,
  extractNumber,
} = require('../lib/jid-utils');

describe('jid-utils', () => {
  describe('jidToE164', () => {
    it('converts standard individual JID', () => {
      expect(jidToE164('5531999887766@s.whatsapp.net')).toBe('+5531999887766');
    });

    it('converts JID without country code prefix', () => {
      expect(jidToE164('1234567890@s.whatsapp.net')).toBe('+1234567890');
    });

    it('throws on group JID', () => {
      expect(() => jidToE164('120363012345678901@g.us'))
        .toThrow('Cannot convert group JID to phone');
    });

    it('throws on null/undefined', () => {
      expect(() => jidToE164(null)).toThrow('Invalid JID');
      expect(() => jidToE164(undefined)).toThrow('Invalid JID');
    });

    it('throws on empty string', () => {
      expect(() => jidToE164('')).toThrow('Invalid JID');
    });

    it('throws on non-string input', () => {
      expect(() => jidToE164(12345)).toThrow('Invalid JID');
    });

    it('throws on JID with non-numeric prefix', () => {
      expect(() => jidToE164('abc@s.whatsapp.net')).toThrow('Invalid JID format');
    });

    it('throws on JID without @ separator', () => {
      expect(() => jidToE164('5531999887766')).toThrow('Invalid JID format');
    });
  });

  describe('isGroupJid', () => {
    it('returns true for group JID', () => {
      expect(isGroupJid('120363012345678901@g.us')).toBe(true);
    });

    it('returns false for individual JID', () => {
      expect(isGroupJid('5531999887766@s.whatsapp.net')).toBe(false);
    });

    it('returns false for non-string', () => {
      expect(isGroupJid(null)).toBe(false);
      expect(isGroupJid(123)).toBe(false);
    });
  });

  describe('isIndividualJid', () => {
    it('returns true for individual JID', () => {
      expect(isIndividualJid('5531999887766@s.whatsapp.net')).toBe(true);
    });

    it('returns false for group JID', () => {
      expect(isIndividualJid('120363012345678901@g.us')).toBe(false);
    });

    it('returns false for non-string', () => {
      expect(isIndividualJid(undefined)).toBe(false);
    });
  });

  describe('extractNumber', () => {
    it('extracts number from individual JID', () => {
      expect(extractNumber('5531999887766@s.whatsapp.net')).toBe('5531999887766');
    });

    it('extracts number from group JID', () => {
      expect(extractNumber('120363012345678901@g.us')).toBe('120363012345678901');
    });

    it('returns empty string for null/undefined', () => {
      expect(extractNumber(null)).toBe('');
      expect(extractNumber(undefined)).toBe('');
    });
  });
});
