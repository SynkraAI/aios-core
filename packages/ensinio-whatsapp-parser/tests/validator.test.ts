/**
 * Tests for Data Validator
 * Coverage: validateParsedData() with valid/invalid data
 */

import { validateParsedData } from '../src/validator';
import { ParsedExport } from '../src/types';

describe('validateParsedData()', () => {
  // Valid test data template
  function createValidExport(): ParsedExport {
    return {
      group_name: 'Test Group',
      date_range: {
        start: '2026-03-01',
        end: '2026-03-12',
      },
      total_messages: 50,
      total_contacts: 3,
      contacts: [
        {
          name: 'João Silva',
          phone: '+5531999887766',
          message_count: 25,
          first_message_date: '2026-03-01T10:00:00Z',
          last_message_date: '2026-03-12T16:30:00Z',
          messages: Array.from({ length: 25 }, (_, i) => ({
            timestamp: new Date(new Date('2026-03-01').getTime() + i * 3600000).toISOString(),
            content: `Message ${i + 1}`,
          })),
        },
        {
          name: 'Maria Santos',
          phone: '+551199876543',
          message_count: 15,
          first_message_date: '2026-03-02T09:00:00Z',
          last_message_date: '2026-03-12T14:00:00Z',
          messages: Array.from({ length: 15 }, (_, i) => ({
            timestamp: new Date(new Date('2026-03-02').getTime() + i * 3600000).toISOString(),
            content: `Message ${i + 1}`,
          })),
        },
        {
          name: 'Dr. Carlos Mendes',
          phone: '+552199654321',
          message_count: 10,
          first_message_date: '2026-03-03T11:00:00Z',
          last_message_date: '2026-03-12T13:00:00Z',
          messages: Array.from({ length: 10 }, (_, i) => ({
            timestamp: new Date(new Date('2026-03-03').getTime() + i * 3600000).toISOString(),
            content: `Message ${i + 1}`,
          })),
        },
      ],
    };
  }

  describe('✅ Valid Data', () => {
    it('should PASS validation for valid export', () => {
      const data = createValidExport();
      const report = validateParsedData(data);

      expect(report.status).toBe('PASS');
      expect(report.blocking_checks.failed).toBe(0);
    });

    it('should have all blocking checks passed', () => {
      const data = createValidExport();
      const report = validateParsedData(data);

      expect(report.blocking_checks.passed).toBeGreaterThan(0);
      expect(report.blocking_checks.failed).toBe(0);
    });

    it('should not have failed checks', () => {
      const data = createValidExport();
      const report = validateParsedData(data);

      expect(report.failed_checks).toBeUndefined();
    });
  });

  describe('❌ Blocking Checks - Must Fail', () => {
    it('should FAIL when 0 contacts', () => {
      const data = createValidExport();
      data.total_contacts = 0;
      data.contacts = [];

      const report = validateParsedData(data);

      expect(report.status).toBe('FAIL');
      expect(report.blocking_checks.failed).toBeGreaterThan(0);
    });

    it('should FAIL when < 10 total messages', () => {
      const data = createValidExport();
      data.total_messages = 5;

      const report = validateParsedData(data);

      expect(report.status).toBe('FAIL');
      expect(report.blocking_checks.failed).toBeGreaterThan(0);
    });

    it('should FAIL when contacts array is empty', () => {
      const data = createValidExport();
      data.contacts = [];

      const report = validateParsedData(data);

      expect(report.status).toBe('FAIL');
    });

    it('should FAIL when contact has no messages', () => {
      const data = createValidExport();
      data.contacts[0].messages = [];
      data.contacts[0].message_count = 0;

      const report = validateParsedData(data);

      expect(report.status).toBe('FAIL');
    });

    it('should FAIL when date_range is invalid (start > end)', () => {
      const data = createValidExport();
      data.date_range = {
        start: '2026-03-12',
        end: '2026-03-01', // end < start
      };

      const report = validateParsedData(data);

      expect(report.status).toBe('FAIL');
    });

    it('should FAIL when messages are not in chronological order', () => {
      const data = createValidExport();
      // Reverse message order
      const messages = data.contacts[0].messages;
      data.contacts[0].messages = messages.reverse();

      const report = validateParsedData(data);

      expect(report.status).toBe('FAIL');
    });

    it('should FAIL when contact is missing required fields', () => {
      const data = createValidExport();
      data.contacts[0].name = ''; // Empty name

      const report = validateParsedData(data);

      expect(report.status).toBe('FAIL');
    });
  });

  describe('⚠️ Warning Checks - Non-Blocking', () => {
    it('should still PASS with warnings when phone coverage < 50%', () => {
      const data = createValidExport();
      data.contacts[0].phone = ''; // Missing phone
      data.contacts[1].phone = '';

      const report = validateParsedData(data);

      // Should still PASS but have warnings
      expect(report.status).toBe('PASS');
      expect(report.warning_checks.warnings).toBeGreaterThan(0);
    });

    it('should have warning checks available', () => {
      const data = createValidExport();
      const report = validateParsedData(data);

      // Should have warning checks structure
      expect(report.warning_checks).toBeDefined();
      expect(report.warning_checks.passed).toBeGreaterThanOrEqual(0);
    });
  });

  describe('📊 Metrics Calculation', () => {
    it('should calculate correct contact count', () => {
      const data = createValidExport();
      const report = validateParsedData(data);

      expect(report.metrics.total_contacts).toBe(data.total_contacts);
    });

    it('should calculate correct message count', () => {
      const data = createValidExport();
      const report = validateParsedData(data);

      expect(report.metrics.total_messages).toBe(data.total_messages);
    });

    it('should calculate phone coverage correctly', () => {
      const data = createValidExport();
      const report = validateParsedData(data);

      expect(report.metrics.phone_coverage).toBeTruthy();
      expect(report.metrics.phone_coverage).toMatch(/%$/); // Should end with %
    });

    it('should calculate average messages per contact', () => {
      const data = createValidExport();
      const report = validateParsedData(data);

      expect(report.metrics.avg_messages_per_contact).toBeGreaterThan(0);
      expect(typeof report.metrics.avg_messages_per_contact).toBe('number');
    });

    it('should count system messages filtered', () => {
      const data = createValidExport();
      const report = validateParsedData(data);

      expect(report.metrics.system_messages_filtered).toBeGreaterThanOrEqual(0);
    });

    it('should identify contacts with phone numbers', () => {
      const data = createValidExport();
      data.contacts[0].phone = ''; // Remove phone from first contact

      const report = validateParsedData(data);

      expect(report.metrics.contacts_with_phone).toBe(2); // 2 out of 3
    });

    it('should identify most active contacts', () => {
      const data = createValidExport();
      const report = validateParsedData(data);

      expect(report.metrics.most_active_contacts_top5).toBeDefined();
      expect(report.metrics.most_active_contacts_top5.length).toBeGreaterThan(0);
      expect(report.metrics.most_active_contacts_top5.length).toBeLessThanOrEqual(5);
    });

    it('should calculate date range days', () => {
      const data = createValidExport();
      const report = validateParsedData(data);

      // 2026-03-01 to 2026-03-12 = 11 days
      expect(report.metrics.date_range_days).toBeGreaterThan(0);
    });
  });

  describe('📋 Recommendations', () => {
    it('should include recommendation for valid data', () => {
      const data = createValidExport();
      const report = validateParsedData(data);

      expect(report.recommendation).toBeTruthy();
      expect(report.recommendation.length).toBeGreaterThan(0);
    });

    it('should include recommendation for failing validation', () => {
      const data = createValidExport();
      data.total_messages = 5; // Fail validation

      const report = validateParsedData(data);

      expect(report.recommendation).toBeTruthy();
      expect(report.recommendation.length).toBeGreaterThan(0);
    });

    it('should include recommendations when available', () => {
      const data = createValidExport();
      const report = validateParsedData(data);

      expect(report.recommendation).toBeDefined();
      expect(typeof report.recommendation).toBe('string');
    });
  });

  describe('🔍 Detailed Report Structure', () => {
    it('should include all required report fields', () => {
      const data = createValidExport();
      const report = validateParsedData(data);

      expect(report).toHaveProperty('status');
      expect(report).toHaveProperty('blocking_checks');
      expect(report).toHaveProperty('warning_checks');
      expect(report).toHaveProperty('metrics');
      expect(report).toHaveProperty('recommendation');
    });

    it('should have blocking_checks with passed and failed counts', () => {
      const data = createValidExport();
      const report = validateParsedData(data);

      expect(report.blocking_checks.passed).toBeGreaterThanOrEqual(0);
      expect(report.blocking_checks.failed).toBeGreaterThanOrEqual(0);
    });

    it('should have warning_checks with passed and warnings counts', () => {
      const data = createValidExport();
      const report = validateParsedData(data);

      expect(report.warning_checks.passed).toBeGreaterThanOrEqual(0);
      expect(report.warning_checks.warnings).toBeGreaterThanOrEqual(0);
    });

    it('should have metrics with all quality indicators', () => {
      const data = createValidExport();
      const report = validateParsedData(data);

      expect(report.metrics).toHaveProperty('total_contacts');
      expect(report.metrics).toHaveProperty('total_messages');
      expect(report.metrics).toHaveProperty('phone_coverage');
      expect(report.metrics).toHaveProperty('avg_messages_per_contact');
      expect(report.metrics).toHaveProperty('date_range_days');
      expect(report.metrics).toHaveProperty('most_active_contacts_top5');
    });
  });

  describe('🎯 Real-World Scenarios', () => {
    it('should validate a small group chat', () => {
      const data = createValidExport();
      data.total_contacts = 2;
      data.contacts = data.contacts.slice(0, 2);

      const report = validateParsedData(data);

      expect(report.status).toBe('PASS');
    });

    it('should validate a large group with uneven participation', () => {
      const data = createValidExport();
      data.total_contacts = 10;
      data.contacts.push(
        ...Array.from({ length: 7 }, (_, i) => ({
          name: `Participant ${i}`,
          phone: `+5531999887${800 + i}`,
          message_count: 2,
          first_message_date: '2026-03-05T10:00:00Z',
          last_message_date: '2026-03-05T11:00:00Z',
          messages: Array.from({ length: 2 }, (_, j) => ({
            timestamp: new Date(new Date('2026-03-05').getTime() + j * 3600000).toISOString(),
            content: `Quick msg ${j}`,
          })),
        }))
      );
      data.total_messages = 50 + 14;

      const report = validateParsedData(data);

      expect(report.status).toBe('PASS');
      expect(report.metrics.total_contacts).toBe(10);
    });

    it('should fail validation for bot/empty exports', () => {
      const data = createValidExport();
      data.total_messages = 2;
      data.contacts[0].message_count = 2;
      data.contacts[0].messages = data.contacts[0].messages.slice(0, 2);
      data.contacts = [data.contacts[0]];
      data.total_contacts = 1;

      const report = validateParsedData(data);

      expect(report.status).toBe('FAIL');
    });

    it('should provide helpful message for passing validation', () => {
      const data = createValidExport();
      const report = validateParsedData(data);

      expect(report.status).toBe('PASS');
      expect(report.recommendation).toBeTruthy();
    });

    it('should provide helpful message for failing validation', () => {
      const data = createValidExport();
      data.total_messages = 3; // Too few messages

      const report = validateParsedData(data);

      expect(report.status).toBe('FAIL');
      expect(report.recommendation).toBeTruthy();
    });
  });
});
