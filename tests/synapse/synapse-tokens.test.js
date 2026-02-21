/**
 * SYNAPSE Token Utilities Tests
 *
 * Comprehensive tests for the estimateTokens heuristic used by the
 * formatter and memory bridge.
 *
 * @module tests/synapse/synapse-tokens
 * @story SYN-10 - Pro Memory Bridge (extracted from formatter.js)
 */

'use strict';

const { estimateTokens } = require('../../.aios-core/core/synapse/utils/tokens');

// =============================================================================
// estimateTokens
// =============================================================================

describe('estimateTokens', () => {
  // -------------------------------------------------------------------------
  // Basic behavior
  // -------------------------------------------------------------------------

  describe('basic token estimation', () => {
    test('returns 0 for empty string', () => {
      expect(estimateTokens('')).toBe(0);
    });

    test('returns 1 for a single character', () => {
      // ceil(1 / 4) = 1
      expect(estimateTokens('a')).toBe(1);
    });

    test('returns 1 for strings of length 1-4', () => {
      expect(estimateTokens('ab')).toBe(1);    // ceil(2/4)
      expect(estimateTokens('abc')).toBe(1);   // ceil(3/4)
      expect(estimateTokens('abcd')).toBe(1);  // ceil(4/4)
    });

    test('returns 2 for a 5-character string', () => {
      // ceil(5 / 4) = 2
      expect(estimateTokens('hello')).toBe(2);
    });

    test('returns correct estimate for typical English sentence', () => {
      const sentence = 'The quick brown fox jumps over the lazy dog';
      // 43 chars => ceil(43 / 4) = 11
      expect(estimateTokens(sentence)).toBe(11);
    });

    test('returns correct estimate for known length', () => {
      const text = 'a'.repeat(100);
      // ceil(100 / 4) = 25
      expect(estimateTokens(text)).toBe(25);
    });
  });

  // -------------------------------------------------------------------------
  // Math.ceil boundary cases
  // -------------------------------------------------------------------------

  describe('ceiling arithmetic boundaries', () => {
    test('length divisible by 4 returns exact division', () => {
      expect(estimateTokens('a'.repeat(4))).toBe(1);
      expect(estimateTokens('a'.repeat(8))).toBe(2);
      expect(estimateTokens('a'.repeat(100))).toBe(25);
      expect(estimateTokens('a'.repeat(400))).toBe(100);
    });

    test('length NOT divisible by 4 rounds up', () => {
      expect(estimateTokens('a'.repeat(5))).toBe(2);   // ceil(5/4) = 2
      expect(estimateTokens('a'.repeat(9))).toBe(3);   // ceil(9/4) = 3
      expect(estimateTokens('a'.repeat(101))).toBe(26); // ceil(101/4) = 26
      expect(estimateTokens('a'.repeat(401))).toBe(101);
    });

    test('boundary at length 1 returns 1', () => {
      expect(estimateTokens('x')).toBe(1);
    });
  });

  // -------------------------------------------------------------------------
  // Null / undefined / falsy safety
  // -------------------------------------------------------------------------

  describe('null and undefined safety', () => {
    test('returns 0 for null', () => {
      expect(estimateTokens(null)).toBe(0);
    });

    test('returns 0 for undefined', () => {
      expect(estimateTokens(undefined)).toBe(0);
    });

    test('returns 0 for no argument', () => {
      expect(estimateTokens()).toBe(0);
    });

    test('returns 0 for empty string (falsy)', () => {
      expect(estimateTokens('')).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // Various content types
  // -------------------------------------------------------------------------

  describe('various content types', () => {
    test('handles code snippets', () => {
      const code = 'function hello() { return "world"; }';
      // 36 chars => ceil(36/4) = 9
      expect(estimateTokens(code)).toBe(9);
    });

    test('handles JSON strings', () => {
      const json = JSON.stringify({ key: 'value', nested: { a: 1 } });
      expect(estimateTokens(json)).toBe(Math.ceil(json.length / 4));
    });

    test('handles multiline text', () => {
      const multiline = 'line one\nline two\nline three';
      expect(estimateTokens(multiline)).toBe(Math.ceil(multiline.length / 4));
    });

    test('handles text with tabs and special whitespace', () => {
      const tabbed = '\t\tindented\n\t\tcontent';
      expect(estimateTokens(tabbed)).toBe(Math.ceil(tabbed.length / 4));
    });

    test('handles unicode / emoji characters', () => {
      const emoji = 'Hello \uD83D\uDE80';
      expect(estimateTokens(emoji)).toBe(Math.ceil(emoji.length / 4));
    });

    test('handles string with only spaces', () => {
      const spaces = '    ';
      // 4 chars => ceil(4/4) = 1
      expect(estimateTokens(spaces)).toBe(1);
    });

    test('handles string with only newlines', () => {
      const newlines = '\n\n\n';
      // 3 chars => ceil(3/4) = 1
      expect(estimateTokens(newlines)).toBe(1);
    });

    test('handles markdown content', () => {
      const markdown = '# Heading\n\n- Item 1\n- Item 2\n\n**bold** _italic_';
      expect(estimateTokens(markdown)).toBe(Math.ceil(markdown.length / 4));
    });

    test('handles URL strings', () => {
      const url = 'https://github.com/SynkraAI/aios-core/pull/123';
      expect(estimateTokens(url)).toBe(Math.ceil(url.length / 4));
    });
  });

  // -------------------------------------------------------------------------
  // Long strings / performance
  // -------------------------------------------------------------------------

  describe('long strings', () => {
    test('handles 10,000 character string', () => {
      const long = 'a'.repeat(10000);
      expect(estimateTokens(long)).toBe(2500);
    });

    test('handles 100,000 character string', () => {
      const veryLong = 'x'.repeat(100000);
      expect(estimateTokens(veryLong)).toBe(25000);
    });

    test('handles 1,000,000 character string without error', () => {
      const massive = 'z'.repeat(1000000);
      expect(estimateTokens(massive)).toBe(250000);
    });
  });

  // -------------------------------------------------------------------------
  // Return type guarantee
  // -------------------------------------------------------------------------

  describe('return type', () => {
    test('always returns a number', () => {
      expect(typeof estimateTokens('hello')).toBe('number');
      expect(typeof estimateTokens('')).toBe('number');
      expect(typeof estimateTokens(null)).toBe('number');
      expect(typeof estimateTokens(undefined)).toBe('number');
    });

    test('always returns a non-negative integer', () => {
      const cases = ['', 'a', 'hello world', 'a'.repeat(999), null, undefined];
      for (const input of cases) {
        const result = estimateTokens(input);
        expect(Number.isInteger(result)).toBe(true);
        expect(result).toBeGreaterThanOrEqual(0);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Heuristic accuracy (documentation / contract)
  // -------------------------------------------------------------------------

  describe('heuristic contract: tokens ~ length / 4', () => {
    test('follows the ceil(length / 4) formula precisely', () => {
      // Exhaustive check for lengths 0-20
      for (let len = 0; len <= 20; len++) {
        const text = 'a'.repeat(len);
        const expected = len === 0 ? 0 : Math.ceil(len / 4);
        expect(estimateTokens(text)).toBe(expected);
      }
    });
  });
});
