/**
 * Tests for SYNAPSE Context Bracket Tracker
 *
 * @module tests/synapse/context-tracker
 * @story SYN-3 - Context Bracket Tracker
 */

const {
  calculateBracket,
  estimateContextPercent,
  getTokenBudget,
  getActiveLayers,
  needsHandoffWarning,
  needsMemoryHints,
  BRACKETS,
  TOKEN_BUDGETS,
  DEFAULTS,
} = require('../../.aios-core/core/synapse/context/context-tracker');

// =============================================================================
// calculateBracket
// =============================================================================

describe('calculateBracket', () => {
  // --- FRESH bracket (>= 60%) ---
  test('should return FRESH for 100% context remaining', () => {
    expect(calculateBracket(100)).toBe('FRESH');
  });

  test('should return FRESH for exactly 60% (lower boundary)', () => {
    expect(calculateBracket(60)).toBe('FRESH');
  });

  test('should return FRESH for 60.01%', () => {
    expect(calculateBracket(60.01)).toBe('FRESH');
  });

  test('should return FRESH for 75%', () => {
    expect(calculateBracket(75)).toBe('FRESH');
  });

  // --- MODERATE bracket (>= 40%, < 60%) ---
  test('should return MODERATE for 59.99% (just below FRESH)', () => {
    expect(calculateBracket(59.99)).toBe('MODERATE');
  });

  test('should return MODERATE for exactly 40% (lower boundary)', () => {
    expect(calculateBracket(40)).toBe('MODERATE');
  });

  test('should return MODERATE for 50%', () => {
    expect(calculateBracket(50)).toBe('MODERATE');
  });

  // --- DEPLETED bracket (>= 25%, < 40%) ---
  test('should return DEPLETED for 39.99% (just below MODERATE)', () => {
    expect(calculateBracket(39.99)).toBe('DEPLETED');
  });

  test('should return DEPLETED for exactly 25% (lower boundary)', () => {
    expect(calculateBracket(25)).toBe('DEPLETED');
  });

  test('should return DEPLETED for 25.01%', () => {
    expect(calculateBracket(25.01)).toBe('DEPLETED');
  });

  test('should return DEPLETED for 30%', () => {
    expect(calculateBracket(30)).toBe('DEPLETED');
  });

  // --- CRITICAL bracket (< 25%) ---
  test('should return CRITICAL for 24.99% (just below DEPLETED)', () => {
    expect(calculateBracket(24.99)).toBe('CRITICAL');
  });

  test('should return CRITICAL for 0%', () => {
    expect(calculateBracket(0)).toBe('CRITICAL');
  });

  test('should return CRITICAL for 10%', () => {
    expect(calculateBracket(10)).toBe('CRITICAL');
  });

  // --- Edge cases ---
  test('should return FRESH for values above 100%', () => {
    expect(calculateBracket(150)).toBe('FRESH');
  });

  test('should return CRITICAL for negative values', () => {
    expect(calculateBracket(-10)).toBe('CRITICAL');
  });

  test('should return CRITICAL for NaN', () => {
    expect(calculateBracket(NaN)).toBe('CRITICAL');
  });

  test('should return CRITICAL for non-number input', () => {
    expect(calculateBracket('fifty')).toBe('CRITICAL');
    expect(calculateBracket(undefined)).toBe('CRITICAL');
    expect(calculateBracket(null)).toBe('CRITICAL');
  });
});

// =============================================================================
// estimateContextPercent
// =============================================================================

describe('estimateContextPercent', () => {
  test('should return 100% for 0 prompts', () => {
    expect(estimateContextPercent(0)).toBe(100);
  });

  test('should return 98.5% for 2 prompts with defaults (2*1500/200000)', () => {
    // 100 - (2 * 1500 / 200000 * 100) = 100 - 1.5 = 98.5
    expect(estimateContextPercent(2)).toBeCloseTo(98.5, 5);
  });

  test('should return 77.5% for 30 prompts with defaults', () => {
    // 100 - (30 * 1500 / 200000 * 100) = 100 - 22.5 = 77.5
    expect(estimateContextPercent(30)).toBeCloseTo(77.5, 5);
  });

  test('should return 25% for 100 prompts with defaults', () => {
    // 100 - (100 * 1500 / 200000 * 100) = 100 - 75 = 25
    expect(estimateContextPercent(100)).toBeCloseTo(25, 5);
  });

  test('should clamp to 0% when tokens exceed max context', () => {
    // 200 prompts * 1500 = 300000 > 200000
    expect(estimateContextPercent(200)).toBe(0);
  });

  test('should support custom avgTokensPerPrompt', () => {
    // 100 - (10 * 2000 / 200000 * 100) = 100 - 10 = 90
    expect(estimateContextPercent(10, { avgTokensPerPrompt: 2000 })).toBeCloseTo(90, 5);
  });

  test('should support custom maxContext', () => {
    // 100 - (10 * 1500 / 100000 * 100) = 100 - 15 = 85
    expect(estimateContextPercent(10, { maxContext: 100000 })).toBeCloseTo(85, 5);
  });

  test('should support both custom options', () => {
    // 100 - (5 * 1000 / 50000 * 100) = 100 - 10 = 90
    expect(estimateContextPercent(5, {
      avgTokensPerPrompt: 1000,
      maxContext: 50000,
    })).toBeCloseTo(90, 5);
  });

  test('should return 100% for negative promptCount (graceful)', () => {
    expect(estimateContextPercent(-5)).toBe(100);
  });

  test('should return 100% for NaN promptCount (graceful)', () => {
    expect(estimateContextPercent(NaN)).toBe(100);
  });

  test('should return 100% for non-number promptCount (graceful)', () => {
    expect(estimateContextPercent('abc')).toBe(100);
    expect(estimateContextPercent(undefined)).toBe(100);
  });

  test('should return 0% when maxContext is 0 or negative', () => {
    expect(estimateContextPercent(5, { maxContext: 0 })).toBe(0);
    expect(estimateContextPercent(5, { maxContext: -100 })).toBe(0);
  });

  test('should return exactly 1 prompt worth of usage', () => {
    // 100 - (1 * 1500 / 200000 * 100) = 100 - 0.75 = 99.25
    expect(estimateContextPercent(1)).toBeCloseTo(99.25, 5);
  });
});

// =============================================================================
// getTokenBudget
// =============================================================================

describe('getTokenBudget', () => {
  test('should return 800 for FRESH', () => {
    expect(getTokenBudget('FRESH')).toBe(800);
  });

  test('should return 1500 for MODERATE', () => {
    expect(getTokenBudget('MODERATE')).toBe(1500);
  });

  test('should return 2000 for DEPLETED', () => {
    expect(getTokenBudget('DEPLETED')).toBe(2000);
  });

  test('should return 2500 for CRITICAL', () => {
    expect(getTokenBudget('CRITICAL')).toBe(2500);
  });

  test('should return null for invalid bracket', () => {
    expect(getTokenBudget('INVALID')).toBeNull();
    expect(getTokenBudget('')).toBeNull();
    expect(getTokenBudget('fresh')).toBeNull();
  });
});

// =============================================================================
// getActiveLayers
// =============================================================================

describe('getActiveLayers', () => {
  test('should return L0, L1, L2, L7 for FRESH', () => {
    const result = getActiveLayers('FRESH');
    expect(result).toEqual({
      layers: [0, 1, 2, 7],
      memoryHints: false,
      handoffWarning: false,
    });
  });

  test('should return all layers for MODERATE', () => {
    const result = getActiveLayers('MODERATE');
    expect(result).toEqual({
      layers: [0, 1, 2, 3, 4, 5, 6, 7],
      memoryHints: false,
      handoffWarning: false,
    });
  });

  test('should return all layers + memory hints for DEPLETED', () => {
    const result = getActiveLayers('DEPLETED');
    expect(result).toEqual({
      layers: [0, 1, 2, 3, 4, 5, 6, 7],
      memoryHints: true,
      handoffWarning: false,
    });
  });

  test('should return all layers + memory + handoff for CRITICAL', () => {
    const result = getActiveLayers('CRITICAL');
    expect(result).toEqual({
      layers: [0, 1, 2, 3, 4, 5, 6, 7],
      memoryHints: true,
      handoffWarning: true,
    });
  });

  test('should return null for invalid bracket (graceful degradation)', () => {
    expect(getActiveLayers('INVALID')).toBeNull();
    expect(getActiveLayers('')).toBeNull();
    expect(getActiveLayers(null)).toBeNull();
    expect(getActiveLayers(undefined)).toBeNull();
  });

  test('should return a copy (not mutate internal config)', () => {
    const result1 = getActiveLayers('FRESH');
    result1.layers.push(99);
    result1.memoryHints = true;

    const result2 = getActiveLayers('FRESH');
    expect(result2.layers).toEqual([0, 1, 2, 7]);
    expect(result2.memoryHints).toBe(false);
  });
});

// =============================================================================
// needsHandoffWarning
// =============================================================================

describe('needsHandoffWarning', () => {
  test('should return false for FRESH', () => {
    expect(needsHandoffWarning('FRESH')).toBe(false);
  });

  test('should return false for MODERATE', () => {
    expect(needsHandoffWarning('MODERATE')).toBe(false);
  });

  test('should return false for DEPLETED', () => {
    expect(needsHandoffWarning('DEPLETED')).toBe(false);
  });

  test('should return true for CRITICAL', () => {
    expect(needsHandoffWarning('CRITICAL')).toBe(true);
  });

  test('should return false for invalid bracket', () => {
    expect(needsHandoffWarning('INVALID')).toBe(false);
  });
});

// =============================================================================
// needsMemoryHints
// =============================================================================

describe('needsMemoryHints', () => {
  test('should return false for FRESH', () => {
    expect(needsMemoryHints('FRESH')).toBe(false);
  });

  test('should return false for MODERATE', () => {
    expect(needsMemoryHints('MODERATE')).toBe(false);
  });

  test('should return true for DEPLETED', () => {
    expect(needsMemoryHints('DEPLETED')).toBe(true);
  });

  test('should return true for CRITICAL', () => {
    expect(needsMemoryHints('CRITICAL')).toBe(true);
  });

  test('should return false for invalid bracket', () => {
    expect(needsMemoryHints('INVALID')).toBe(false);
  });
});

// =============================================================================
// Constants
// =============================================================================

describe('BRACKETS constant', () => {
  test('should have exactly 4 brackets', () => {
    expect(Object.keys(BRACKETS)).toHaveLength(4);
  });

  test('should have correct structure for each bracket', () => {
    for (const [name, config] of Object.entries(BRACKETS)) {
      expect(config).toHaveProperty('min');
      expect(config).toHaveProperty('max');
      expect(config).toHaveProperty('tokenBudget');
      expect(typeof config.min).toBe('number');
      expect(typeof config.max).toBe('number');
      expect(typeof config.tokenBudget).toBe('number');
    }
  });

  test('should match DESIGN doc thresholds exactly', () => {
    expect(BRACKETS.FRESH).toEqual({ min: 60, max: 100, tokenBudget: 800 });
    expect(BRACKETS.MODERATE).toEqual({ min: 40, max: 60, tokenBudget: 1500 });
    expect(BRACKETS.DEPLETED).toEqual({ min: 25, max: 40, tokenBudget: 2000 });
    expect(BRACKETS.CRITICAL).toEqual({ min: 0, max: 25, tokenBudget: 2500 });
  });
});

describe('TOKEN_BUDGETS constant', () => {
  test('should have exactly 4 entries', () => {
    expect(Object.keys(TOKEN_BUDGETS)).toHaveLength(4);
  });

  test('should match BRACKETS tokenBudget values', () => {
    for (const [name, budget] of Object.entries(TOKEN_BUDGETS)) {
      expect(budget).toBe(BRACKETS[name].tokenBudget);
    }
  });
});

describe('DEFAULTS constant', () => {
  test('should have avgTokensPerPrompt = 1500', () => {
    expect(DEFAULTS.avgTokensPerPrompt).toBe(1500);
  });

  test('should have maxContext = 200000', () => {
    expect(DEFAULTS.maxContext).toBe(200000);
  });
});

// =============================================================================
// Integration: estimateContextPercent + calculateBracket
// =============================================================================

describe('integration: estimate → bracket pipeline', () => {
  test('should be FRESH at session start (0 prompts)', () => {
    const percent = estimateContextPercent(0);
    expect(calculateBracket(percent)).toBe('FRESH');
  });

  test('should be FRESH at 30 prompts (77.5%)', () => {
    const percent = estimateContextPercent(30);
    expect(calculateBracket(percent)).toBe('FRESH');
  });

  test('should be MODERATE at 60 prompts (55%)', () => {
    // 100 - (60 * 1500 / 200000 * 100) = 100 - 45 = 55
    const percent = estimateContextPercent(60);
    expect(calculateBracket(percent)).toBe('MODERATE');
  });

  test('should be DEPLETED at 100 prompts (25%)', () => {
    const percent = estimateContextPercent(100);
    expect(calculateBracket(percent)).toBe('DEPLETED');
  });

  test('should be CRITICAL at 120 prompts (10%)', () => {
    // 100 - (120 * 1500 / 200000 * 100) = 100 - 90 = 10
    const percent = estimateContextPercent(120);
    expect(calculateBracket(percent)).toBe('CRITICAL');
  });

  test('should be CRITICAL when context is fully used', () => {
    const percent = estimateContextPercent(200);
    expect(calculateBracket(percent)).toBe('CRITICAL');
    expect(percent).toBe(0);
  });
});

// =============================================================================
// AC8: Zero External Dependencies
// =============================================================================

describe('AC8: zero external dependencies', () => {
  test('module source should not contain require statements', () => {
    const fs = require('fs');
    const path = require('path');
    const source = fs.readFileSync(
      path.join(__dirname, '../../.aios-core/core/synapse/context/context-tracker.js'),
      'utf8',
    );
    // Should not have any require() calls (only module.exports)
    const requireMatches = source.match(/\brequire\s*\(/g);
    expect(requireMatches).toBeNull();
  });
});
