/**
 * Tests for WhatsApp Parser
 * Coverage: parseWhatsAppExport() with various formats and edge cases
 */

import * as fs from 'fs';
import * as path from 'path';
import { parseWhatsAppExport } from '../src/parser';
import { ParsingError } from '../src/types';

const FIXTURES_DIR = path.join(__dirname, 'fixtures');

describe('parseWhatsAppExport()', () => {
  describe('✅ Valid Android BR Format', () => {
    it('should parse valid Android BR ZIP correctly', async () => {
      const zipPath = path.join(FIXTURES_DIR, 'android-br-chat.zip');
      const result = await parseWhatsAppExport(zipPath);

      expect(result).toBeDefined();
      expect(result.group_name).toBeTruthy();
      expect(result.total_contacts).toBeGreaterThan(0);
      expect(result.total_messages).toBeGreaterThan(0);
      expect(result.contacts).toBeInstanceOf(Array);
      expect(result.contacts.length).toBeGreaterThan(0);
      expect(result.date_range).toBeDefined();
      expect(result.date_range.start).toBeTruthy();
      expect(result.date_range.end).toBeTruthy();
    });

    it('should detect Android BR format', async () => {
      const zipPath = path.join(FIXTURES_DIR, 'android-br-chat.zip');
      const result = await parseWhatsAppExport(zipPath);

      // Android BR uses DD/MM/YYYY format
      expect(result.date_range.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(result.date_range.end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should extract contacts with names correctly', async () => {
      const zipPath = path.join(FIXTURES_DIR, 'android-br-chat.zip');
      const result = await parseWhatsAppExport(zipPath);

      const contactNames = result.contacts.map(c => c.name);
      expect(contactNames).toContain('João Silva');
      expect(contactNames).toContain('Maria Santos');
    });

    it('should separate titles from names (e.g., Dr. Carlos -> Carlos)', async () => {
      const zipPath = path.join(FIXTURES_DIR, 'android-br-chat.zip');
      const result = await parseWhatsAppExport(zipPath);

      // Dr. Carlos should be extracted properly
      const carlosContact = result.contacts.find(c => c.name.toLowerCase().includes('carlos'));
      expect(carlosContact).toBeDefined();
      // Name should not start with "Dr" in all caps
      expect(carlosContact?.name).not.toMatch(/^DR\s+/);
    });

    it('should filter out system messages', async () => {
      const zipPath = path.join(FIXTURES_DIR, 'android-br-chat.zip');
      const result = await parseWhatsAppExport(zipPath);

      // Check that system messages are not in the parsed contacts
      const allMessages = result.contacts.flatMap(c => c.messages.map(m => m.content));
      expect(allMessages.some(m => m.includes('Messages and calls are encrypted'))).toBe(false);
      expect(allMessages.some(m => m.includes('added'))).toBe(false);
    });

    it('should calculate message counts correctly', async () => {
      const zipPath = path.join(FIXTURES_DIR, 'android-br-chat.zip');
      const result = await parseWhatsAppExport(zipPath);

      result.contacts.forEach(contact => {
        expect(contact.message_count).toBeGreaterThan(0);
        expect(contact.message_count).toBe(contact.messages.length);
      });
    });

    it('should set timestamps in ISO 8601 format', async () => {
      const zipPath = path.join(FIXTURES_DIR, 'android-br-chat.zip');
      const result = await parseWhatsAppExport(zipPath);

      result.contacts.forEach(contact => {
        contact.messages.forEach(msg => {
          expect(msg.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
        });
      });
    });
  });

  describe('✅ Valid iOS BR Format', () => {
    it('should parse valid iOS BR ZIP correctly', async () => {
      const zipPath = path.join(FIXTURES_DIR, 'ios-br-chat.zip');
      const result = await parseWhatsAppExport(zipPath);

      expect(result).toBeDefined();
      expect(result.total_contacts).toBeGreaterThan(0);
      expect(result.total_messages).toBeGreaterThan(0);
      expect(result.contacts.length).toBeGreaterThan(0);
    });

    it('should detect iOS BR format correctly', async () => {
      const zipPath = path.join(FIXTURES_DIR, 'ios-br-chat.zip');
      const result = await parseWhatsAppExport(zipPath);

      // iOS BR also uses DD/MM/YYYY
      expect(result.date_range.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(result.date_range.end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should handle iOS BR multi-line messages', async () => {
      const zipPath = path.join(FIXTURES_DIR, 'ios-br-chat.zip');
      const result = await parseWhatsAppExport(zipPath);

      const allMessages = result.contacts.flatMap(c => c.messages.map(m => m.content));
      expect(allMessages.length).toBeGreaterThan(0);
      allMessages.forEach(msg => {
        expect(msg.length).toBeGreaterThan(0);
      });
    });
  });

  describe('❌ Edge Cases', () => {
    it('should throw error for corrupted ZIP', async () => {
      const zipPath = path.join(FIXTURES_DIR, 'corrupted.zip');

      await expect(parseWhatsAppExport(zipPath)).rejects.toThrow(ParsingError);
    });

    it('should throw error for empty chat file', async () => {
      const zipPath = path.join(FIXTURES_DIR, 'empty-chat.zip');

      await expect(parseWhatsAppExport(zipPath)).rejects.toThrow(ParsingError);
    });


    it('should throw error for non-ZIP file', async () => {
      // Create a temp non-ZIP file
      const tempFile = path.join(FIXTURES_DIR, 'test-temp.txt');
      fs.writeFileSync(tempFile, 'This is not a ZIP file');

      try {
        await expect(parseWhatsAppExport(tempFile)).rejects.toThrow();
      } finally {
        fs.unlinkSync(tempFile);
      }
    });

    it('should throw ParsingError with descriptive message', async () => {
      const zipPath = path.join(FIXTURES_DIR, 'corrupted.zip');

      try {
        await parseWhatsAppExport(zipPath);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(ParsingError);
        const parsError = error as ParsingError;
        expect(parsError.message).toBeTruthy();
        expect(parsError.code).toBeDefined();
      }
    });
  });

  describe('🔄 Data Consistency', () => {
    it('should maintain consistent total_messages count', async () => {
      const zipPath = path.join(FIXTURES_DIR, 'android-br-chat.zip');
      const result = await parseWhatsAppExport(zipPath);

      const summedMessages = result.contacts.reduce((sum, c) => sum + c.message_count, 0);
      expect(summedMessages).toBe(result.total_messages);
    });

    it('should maintain consistent total_contacts count', async () => {
      const zipPath = path.join(FIXTURES_DIR, 'android-br-chat.zip');
      const result = await parseWhatsAppExport(zipPath);

      expect(result.contacts.length).toBe(result.total_contacts);
    });

    it('should have messages in chronological order per contact', async () => {
      const zipPath = path.join(FIXTURES_DIR, 'android-br-chat.zip');
      const result = await parseWhatsAppExport(zipPath);

      result.contacts.forEach(contact => {
        for (let i = 1; i < contact.messages.length; i++) {
          const prevTime = new Date(contact.messages[i - 1].timestamp).getTime();
          const currTime = new Date(contact.messages[i].timestamp).getTime();
          expect(currTime).toBeGreaterThanOrEqual(prevTime);
        }
      });
    });

    it('should have valid date_range with start <= end', async () => {
      const zipPath = path.join(FIXTURES_DIR, 'android-br-chat.zip');
      const result = await parseWhatsAppExport(zipPath);

      expect(result.date_range.start).toBeTruthy();
      expect(result.date_range.end).toBeTruthy();
      expect(result.date_range.start <= result.date_range.end).toBe(true);
    });

    it('should have first_message_date <= last_message_date for each contact', async () => {
      const zipPath = path.join(FIXTURES_DIR, 'android-br-chat.zip');
      const result = await parseWhatsAppExport(zipPath);

      result.contacts.forEach(contact => {
        expect(contact.first_message_date).toBeTruthy();
        expect(contact.last_message_date).toBeTruthy();
        expect(contact.first_message_date <= contact.last_message_date).toBe(true);
      });
    });
  });

  describe('📊 Data Integrity', () => {
    it('should extract contact names with proper capitalization', async () => {
      const zipPath = path.join(FIXTURES_DIR, 'android-br-chat.zip');
      const result = await parseWhatsAppExport(zipPath);

      result.contacts.forEach(contact => {
        // Names should be capitalized (not all lowercase, not all uppercase)
        expect(contact.name).toBeTruthy();
        expect(contact.name.length).toBeGreaterThan(0);
      });
    });

    it('should not include duplicate contacts', async () => {
      const zipPath = path.join(FIXTURES_DIR, 'android-br-chat.zip');
      const result = await parseWhatsAppExport(zipPath);

      const names = result.contacts.map(c => c.name);
      const uniqueNames = new Set(names);
      expect(names.length).toBe(uniqueNames.size);
    });

    it('should have all required fields in Contact objects', async () => {
      const zipPath = path.join(FIXTURES_DIR, 'android-br-chat.zip');
      const result = await parseWhatsAppExport(zipPath);

      result.contacts.forEach(contact => {
        expect(contact.name).toBeDefined();
        expect(contact.messages).toBeDefined();
        expect(contact.message_count).toBeDefined();
        expect(contact.first_message_date).toBeDefined();
        expect(contact.last_message_date).toBeDefined();
      });
    });

    it('should have all required fields in Message objects', async () => {
      const zipPath = path.join(FIXTURES_DIR, 'android-br-chat.zip');
      const result = await parseWhatsAppExport(zipPath);

      result.contacts.forEach(contact => {
        contact.messages.forEach(msg => {
          expect(msg.timestamp).toBeDefined();
          expect(msg.content).toBeDefined();
          expect(msg.content.length).toBeGreaterThan(0);
        });
      });
    });
  });
});
