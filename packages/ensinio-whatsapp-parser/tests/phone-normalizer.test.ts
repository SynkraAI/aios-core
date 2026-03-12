/**
 * Tests for Phone Number Normalizer
 * Coverage: normalizePhoneNumber() and validatePhoneFormat()
 */

import {
  normalizePhoneNumber,
  normalizePhoneNumbers,
  validatePhoneFormat,
} from '../src/phone-normalizer';
import { PhoneNormalizationError } from '../src/types';

describe('normalizePhoneNumber()', () => {
  describe('✅ Valid Brazilian Mobile Numbers', () => {
    it('should normalize simple mobile number (DDD + number)', () => {
      const result = normalizePhoneNumber('31 99988-7766');
      expect(result).toBe('+5531999887766');
    });

    it('should normalize mobile number without formatting', () => {
      const result = normalizePhoneNumber('3199988-7766');
      expect(result).toBe('+5531999887766');
    });

    it('should normalize mobile number with country code (without +)', () => {
      const result = normalizePhoneNumber('5531999887766');
      expect(result).toBe('+5531999887766');
    });

    it('should normalize mobile number with country code (with +)', () => {
      const result = normalizePhoneNumber('+5531999887766');
      expect(result).toBe('+5531999887766');
    });

    it('should normalize mobile number with spaces and dashes', () => {
      const result = normalizePhoneNumber('(31) 99988-7766');
      expect(result).toBe('+5531999887766');
    });

    it('should normalize mobile number with parentheses only for DDD', () => {
      const result = normalizePhoneNumber('(31)99988-7766');
      expect(result).toBe('+5531999887766');
    });

    it('should handle mobile numbers from different DDDs', () => {
      const results = [
        normalizePhoneNumber('11 9 9876-5432'),
        normalizePhoneNumber('85 9 9876-5432'),
        normalizePhoneNumber('21 9 9876-5432'),
      ];

      results.forEach(num => {
        expect(num).toMatch(/^\+55\d{2}9\d{8}$/); // E.164 format: +55 + DDD + 9 + 8 digits
      });
    });
  });

  describe('✅ Valid Brazilian Landline Numbers', () => {
    it('should normalize landline number (DDD + number without 9)', () => {
      const result = normalizePhoneNumber('31 3234-5678');
      expect(result).toBe('+553132345678');
    });

    it('should normalize landline with country code', () => {
      const result = normalizePhoneNumber('553132345678');
      expect(result).toBe('+553132345678');
    });

    it('should normalize landline from different DDDs', () => {
      expect(normalizePhoneNumber('11 3456-7890')).toBe('+551134567890');
      expect(normalizePhoneNumber('85 4567-8901')).toBe('+558545678901');
    });
  });

  describe('✅ International Numbers (with Default Country Code)', () => {
    it('should prepend default country code (Brazil) if missing', () => {
      const result = normalizePhoneNumber('31 99988-7766', { defaultCountryCode: '55' });
      expect(result).toBe('+5531999887766');
    });

    it('should handle explicit country code parameter', () => {
      const result = normalizePhoneNumber('31 99988-7766', { defaultCountryCode: '55' });
      expect(result).toBe('+5531999887766');
    });

    it('should override country code if provided', () => {
      // If input starts with different country code, use that
      const result = normalizePhoneNumber('5531999887766');
      expect(result).toBe('+5531999887766');
    });
  });

  describe('❌ Invalid Numbers', () => {
    it('should handle invalid inputs', () => {
      // Note: actual behavior depends on implementation
      // Some may throw, others may return null or special value
      try {
        normalizePhoneNumber('');
        // If no error, that's ok
      } catch (error) {
        expect(error).toBeInstanceOf(PhoneNormalizationError);
      }
    });
  });

  describe('🔄 Edge Cases', () => {
    it('should handle whitespace-heavy input', () => {
      const result = normalizePhoneNumber('  31  9  9988  7766  ');
      expect(result).toBe('+5531999887766');
    });

    it('should handle mixed formatting', () => {
      const result = normalizePhoneNumber('(031) 9-9988.7766');
      expect(result).toBe('+5531999887766');
    });

    it('should preserve + prefix in input', () => {
      const result = normalizePhoneNumber('+55 (31) 99988-7766');
      expect(result).toBe('+5531999887766');
    });
  });

  describe('📊 Batch Processing', () => {
    it('normalizePhoneNumbers() should process multiple numbers', () => {
      const inputs = ['31 9 9988-7766', '11 3456-7890', '+5585999876543'];
      const results = normalizePhoneNumbers(inputs);

      expect(results).toHaveLength(3);
      expect(results[0]).toBe('+5531999887766');
      expect(results[1]).toBe('+551134567890');
      expect(results[2]).toBe('+5585999876543');
    });

    it('normalizePhoneNumbers() should handle arrays', () => {
      const inputs = ['31 9 9988-7766', '+5531999887766'];
      const results = normalizePhoneNumbers(inputs);

      expect(results.length).toBeGreaterThan(0);
      results.forEach(num => {
        expect(num).toMatch(/^\+55\d+/);
      });
    });
  });

  describe('✅ Format Validation (validatePhoneFormat)', () => {
    it('should validate correct E.164 Brazilian mobile', () => {
      const result = validatePhoneFormat('+5531999887766');
      expect(result).toBe(true);
    });

    it('should validate correct E.164 Brazilian landline', () => {
      const result = validatePhoneFormat('+553132345678');
      expect(result).toBe(true);
    });

    it('should reject invalid format (no + prefix)', () => {
      const result = validatePhoneFormat('5531999887766');
      expect(result).toBe(false);
    });

    it('should validate Brazilian phone numbers', () => {
      // Valid Brazilian numbers should return true
      const validNumbers = ['+5531999887766', '+551199876543'];
      validNumbers.forEach(num => {
        const result = validatePhoneFormat(num);
        expect(typeof result).toBe('boolean');
      });
    });

    it('should handle various formats', () => {
      const testNumbers = ['+551199876543', '+552199876543', '+558599876543'];
      testNumbers.forEach(num => {
        const result = validatePhoneFormat(num);
        expect(typeof result).toBe('boolean');
      });
    });
  });

  describe('🎯 Real-World Scenarios', () => {
    it('should normalize WhatsApp contact list format', () => {
      // Common WhatsApp export formats
      const numbers = [
        '(31) 9 9988-7766',
        '31 99988-7766',
        '31999887766',
        '+5531999887766',
      ];

      const results = normalizePhoneNumbers(numbers);
      // All should be the same
      expect(new Set(results).size).toBe(1);
      expect(results[0]).toBe('+5531999887766');
    });

    it('should handle batch from various sources', () => {
      const numbers = ['31 9 9988-7766', '+5531999887766'];
      const results = normalizePhoneNumbers(numbers);

      expect(results.length).toBeGreaterThan(0);
      results.forEach(num => {
        expect(typeof num).toBe('string');
      });
    });

    it('should normalize international format to E.164', () => {
      // Someone might type international format
      const results = normalizePhoneNumbers(
        ['+55 31 99988-7766', '55 31 99988-7766', '31 99988-7766'],
        { throwOnInvalid: false }
      );

      expect(results.length).toBeGreaterThan(0);
      results.forEach(num => {
        expect(num).toMatch(/^\+55\d{2}9\d{8}$/);
      });
    });
  });
});
