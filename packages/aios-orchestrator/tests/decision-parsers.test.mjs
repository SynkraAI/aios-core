/**
 * Decision Parsers — Unit Tests
 *
 * Tests for checkGoNoGo() and checkQaVerdict() with 10+ input variants each.
 * Covers: structured JSON, regex, ambiguous, empty, partial text, edge cases.
 *
 * Story: E7.1.3 (Task 5, Task 10)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { checkGoNoGo, checkQaVerdict, DECISIONS } from '../src/decision-parsers.mjs';

// ---------------------------------------------------------------------------
// Helper: wrap text in a result-like object
// ---------------------------------------------------------------------------

function makeResult(summary) {
  return { summary };
}

// ===========================================================================
// checkGoNoGo — 15 variants
// ===========================================================================

describe('checkGoNoGo', () => {
  // --- JSON variants ---

  it('should parse structured JSON with decision: GO', () => {
    const result = makeResult('Here is my analysis.\n\n{"decision": "GO"}\n\nScore: 9/10');
    assert.equal(checkGoNoGo(result), DECISIONS.PROCEED);
  });

  it('should parse structured JSON with verdict: GO', () => {
    const result = makeResult('{"verdict": "GO", "score": 8}');
    assert.equal(checkGoNoGo(result), DECISIONS.PROCEED);
  });

  it('should parse structured JSON with decision: NO-GO', () => {
    const result = makeResult('Review complete.\n{"decision": "NO-GO"}\n\nNeeds rework.');
    assert.equal(checkGoNoGo(result), DECISIONS.RETRY);
  });

  it('should parse structured JSON with verdict: NO_GO (underscore)', () => {
    const result = makeResult('{"verdict": "NO_GO"}');
    assert.equal(checkGoNoGo(result), DECISIONS.RETRY);
  });

  // --- Regex variants ---

  it('should parse plain text GO (uppercase)', () => {
    const result = makeResult('After reviewing all criteria, my decision is GO. Score: 8/10.');
    assert.equal(checkGoNoGo(result), DECISIONS.PROCEED);
  });

  it('should parse plain text GO (lowercase)', () => {
    const result = makeResult('The story meets all criteria. Verdict: go');
    assert.equal(checkGoNoGo(result), DECISIONS.PROCEED);
  });

  it('should parse plain text NO-GO (uppercase)', () => {
    const result = makeResult('Story is incomplete. Decision: NO-GO. Score: 4/10.');
    assert.equal(checkGoNoGo(result), DECISIONS.RETRY);
  });

  it('should parse plain text NO-GO (mixed case)', () => {
    const result = makeResult('The story is No-Go because AC3 is missing.');
    assert.equal(checkGoNoGo(result), DECISIONS.RETRY);
  });

  it('should parse NOGO (no separator)', () => {
    const result = makeResult('Verdict: NOGO. Multiple ACs are missing.');
    assert.equal(checkGoNoGo(result), DECISIONS.RETRY);
  });

  it('should parse NO GO (space separator)', () => {
    const result = makeResult('My verdict is NO GO because the tasks are incomplete.');
    assert.equal(checkGoNoGo(result), DECISIONS.RETRY);
  });

  // --- Priority: NO-GO detected even with GO substring ---

  it('should detect NO-GO even when text contains "GO" as substring', () => {
    const result = makeResult('The story has some GO items but overall verdict is NO-GO.');
    assert.equal(checkGoNoGo(result), DECISIONS.RETRY);
  });

  // --- Edge cases ---

  it('should return retry for empty result', () => {
    assert.equal(checkGoNoGo(makeResult('')), DECISIONS.RETRY);
  });

  it('should return retry for null result', () => {
    assert.equal(checkGoNoGo(null), DECISIONS.RETRY);
  });

  it('should return retry for undefined result', () => {
    assert.equal(checkGoNoGo(undefined), DECISIONS.RETRY);
  });

  it('should return retry for ambiguous text with no clear verdict', () => {
    const result = makeResult('I reviewed the story. It has some good points and some bad points. Hard to say.');
    assert.equal(checkGoNoGo(result), DECISIONS.RETRY); // Conservative fallback
  });
});

// ===========================================================================
// checkQaVerdict — 18 variants
// ===========================================================================

describe('checkQaVerdict', () => {
  // --- JSON variants ---

  it('should parse structured JSON with verdict: PASS', () => {
    const result = makeResult('All tests passing.\n\n{"verdict": "PASS"}\n\nGreat work!');
    assert.equal(checkQaVerdict(result), DECISIONS.PROCEED);
  });

  it('should parse structured JSON with decision: PASS', () => {
    const result = makeResult('{"decision": "PASS", "score": 9}');
    assert.equal(checkQaVerdict(result), DECISIONS.PROCEED);
  });

  it('should parse structured JSON with verdict: FAIL', () => {
    const result = makeResult('{"verdict": "FAIL", "issues": ["missing tests"]}');
    assert.equal(checkQaVerdict(result), DECISIONS.RETRY);
  });

  it('should parse structured JSON with verdict: CONCERNS', () => {
    const result = makeResult('{"verdict": "CONCERNS", "notes": ["minor type issues"]}');
    assert.equal(checkQaVerdict(result), DECISIONS.PROCEED_WITH_NOTE);
  });

  it('should parse structured JSON with status: APPROVED', () => {
    const result = makeResult('{"status": "APPROVED"}');
    assert.equal(checkQaVerdict(result), DECISIONS.PROCEED);
  });

  it('should parse structured JSON with verdict: REJECTED', () => {
    const result = makeResult('{"verdict": "REJECTED"}');
    assert.equal(checkQaVerdict(result), DECISIONS.RETRY);
  });

  // --- Regex variants ---

  it('should parse plain text PASS', () => {
    const result = makeResult('QA Gate verdict: PASS. All 7 checks passed.');
    assert.equal(checkQaVerdict(result), DECISIONS.PROCEED);
  });

  it('should parse plain text PASSED', () => {
    const result = makeResult('The implementation has PASSED all quality checks.');
    assert.equal(checkQaVerdict(result), DECISIONS.PROCEED);
  });

  it('should parse plain text FAIL (uppercase)', () => {
    const result = makeResult('QA verdict: FAIL. Missing test coverage for edge cases.');
    assert.equal(checkQaVerdict(result), DECISIONS.RETRY);
  });

  it('should parse plain text FAILED', () => {
    const result = makeResult('Several checks have FAILED. Need rework.');
    assert.equal(checkQaVerdict(result), DECISIONS.RETRY);
  });

  it('should parse plain text CONCERNS (singular)', () => {
    const result = makeResult('I have some CONCERN about the error handling.');
    assert.equal(checkQaVerdict(result), DECISIONS.PROCEED_WITH_NOTE);
  });

  it('should parse plain text CONCERNS (plural)', () => {
    const result = makeResult('Verdict: CONCERNS. The implementation works but has minor issues.');
    assert.equal(checkQaVerdict(result), DECISIONS.PROCEED_WITH_NOTE);
  });

  it('should parse plain text APPROVED', () => {
    const result = makeResult('After thorough review, the implementation is APPROVED.');
    assert.equal(checkQaVerdict(result), DECISIONS.PROCEED);
  });

  it('should parse plain text REJECTED', () => {
    const result = makeResult('The code is REJECTED due to missing error handling.');
    assert.equal(checkQaVerdict(result), DECISIONS.RETRY);
  });

  it('should handle lowercase pass', () => {
    const result = makeResult('All checks pass. Good to go.');
    assert.equal(checkQaVerdict(result), DECISIONS.PROCEED);
  });

  // --- Edge cases ---

  it('should return retry for empty result', () => {
    assert.equal(checkQaVerdict(makeResult('')), DECISIONS.RETRY);
  });

  it('should return retry for null result', () => {
    assert.equal(checkQaVerdict(null), DECISIONS.RETRY);
  });

  it('should return retry for ambiguous text', () => {
    const result = makeResult('The code looks okay but I need to check more things.');
    assert.equal(checkQaVerdict(result), DECISIONS.RETRY); // Conservative fallback
  });

  // --- Disambiguation ---

  it('should detect explicit FAIL verdict even when PASS appears in text', () => {
    const result = makeResult('Some tests passed but overall verdict: FAIL due to missing AC3 coverage.');
    assert.equal(checkQaVerdict(result), DECISIONS.RETRY);
  });

  it('should handle result with empty summary (fallback to stringify)', () => {
    // When summary is empty, _extractText stringifies the entire result object.
    // The stringified JSON contains "PASS" so it should be found via regex.
    const result = { summary: '', messages: [{ text: 'PASS' }] };
    assert.equal(checkQaVerdict(result), DECISIONS.PROCEED);
  });

  it('should return retry when result has empty summary and no recognizable text', () => {
    const result = { summary: '', messages: [{ data: 123 }] };
    assert.equal(checkQaVerdict(result), DECISIONS.RETRY);
  });
});
