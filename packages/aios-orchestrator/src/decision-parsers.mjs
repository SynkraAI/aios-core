/**
 * Decision Parsers — Structured + Regex parsing for PO and QA verdicts.
 *
 * Parsing strategy (CP-9 fix):
 *   1. First, attempt JSON extraction: look for `{"decision": "GO"}` or similar
 *   2. If no JSON found, fall back to regex on the full text output
 *   3. If neither matches, use a conservative fallback (NO-GO / retry)
 *
 * Story: E7.1.3
 * Architecture: sdk-orchestrator-architecture.md Section 6.3
 * Validation: CP-9 (fragile decision parsing)
 *
 * @module decision-parsers
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Decision values returned by parsers.
 * 'proceed'           — move to the next phase
 * 'proceed_with_note' — move forward but log a concern
 * 'retry'             — jump back to the retry target phase
 */
export const DECISIONS = {
  PROCEED: 'proceed',
  PROCEED_WITH_NOTE: 'proceed_with_note',
  RETRY: 'retry',
};

// ---------------------------------------------------------------------------
// JSON Extraction Helpers
// ---------------------------------------------------------------------------

/**
 * Try to extract a JSON object from a text string.
 * Looks for `{...}` patterns and attempts to parse them.
 *
 * @param {string} text
 * @returns {object|null} Parsed JSON object, or null if not found
 */
function extractJSON(text) {
  if (!text || typeof text !== 'string') return null;

  // Match all {...} blocks (non-greedy, nested not supported)
  const jsonRegex = /\{[^{}]*\}/g;
  let match;
  while ((match = jsonRegex.exec(text)) !== null) {
    try {
      const parsed = JSON.parse(match[0]);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    } catch {
      // Not valid JSON, try next match
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// PO Decision Parser — checkGoNoGo
// ---------------------------------------------------------------------------

/**
 * Parse PO validation output for GO / NO-GO decision.
 *
 * Strategy:
 *   1. Check for structured JSON: `{"decision": "GO"}` or `{"verdict": "GO"}`
 *   2. Regex: `/\bNO[-_.\s]?GO\b/i` for NO-GO (checked FIRST, more specific)
 *   3. Regex: `/\bGO\b/i` for GO
 *   4. Fallback: NO-GO (conservative — if we can't tell, assume rejection)
 *
 * @param {{ summary: string, messages?: Array }} result - Session result from SessionManager.run()
 * @returns {'proceed' | 'retry'} Decision for the workflow engine
 */
export function checkGoNoGo(result) {
  const text = _extractText(result);

  if (!text) {
    return DECISIONS.RETRY; // No output -> conservative fallback
  }

  // Strategy 1: Structured JSON
  const json = extractJSON(text);
  if (json) {
    const decision = (json.decision || json.verdict || '').toString().toUpperCase().trim();
    if (decision === 'GO') return DECISIONS.PROCEED;
    if (/NO[-_.\s]?GO/i.test(decision)) return DECISIONS.RETRY;
    // JSON found but no recognizable decision -> continue to regex
  }

  // Strategy 2: Regex — check NO-GO first (more specific, avoids false match on "GO" inside "NO-GO")
  if (/\bNO[-_.\s]?GO\b/i.test(text)) {
    return DECISIONS.RETRY;
  }

  // Strategy 3: Regex — GO
  if (/\bGO\b/i.test(text)) {
    return DECISIONS.PROCEED;
  }

  // Strategy 4: Fallback — NO-GO (conservative)
  return DECISIONS.RETRY;
}

// ---------------------------------------------------------------------------
// QA Decision Parser — checkQaVerdict
// ---------------------------------------------------------------------------

/**
 * Parse QA gate output for PASS / CONCERNS / FAIL verdict.
 *
 * Strategy:
 *   1. Check for structured JSON: `{"verdict": "PASS"}` or `{"decision": "FAIL"}`
 *   2. Regex: `/\bPASS(ED)?\b/i` for PASS
 *   3. Regex: `/\bCONCERNS?\b/i` for CONCERNS (non-blocking)
 *   4. Regex: `/\bFAIL(ED)?\b/i` for FAIL
 *   5. Regex: `/\bAPPROV(E|ED)\b/i` for approved (equivalent to PASS)
 *   6. Regex: `/\bREJECT(ED)?\b/i` for rejected (equivalent to FAIL)
 *   7. Fallback: retry (conservative — if we can't tell, assume failure)
 *
 * @param {{ summary: string, messages?: Array }} result - Session result from SessionManager.run()
 * @returns {'proceed' | 'proceed_with_note' | 'retry'} Decision for the workflow engine
 */
export function checkQaVerdict(result) {
  const text = _extractText(result);

  if (!text) {
    return DECISIONS.RETRY; // No output -> conservative fallback
  }

  // Strategy 1: Structured JSON
  const json = extractJSON(text);
  if (json) {
    const verdict = (json.verdict || json.decision || json.status || '').toString().toUpperCase().trim();
    if (verdict === 'PASS' || verdict === 'PASSED' || verdict === 'APPROVED' || verdict === 'APPROVE') {
      return DECISIONS.PROCEED;
    }
    if (/CONCERN/i.test(verdict)) {
      return DECISIONS.PROCEED_WITH_NOTE;
    }
    if (verdict === 'FAIL' || verdict === 'FAILED' || verdict === 'REJECTED' || verdict === 'REJECT') {
      return DECISIONS.RETRY;
    }
    // JSON found but no recognizable verdict -> continue to regex
  }

  // Strategy 2-6: Regex patterns on full text
  // Order matters: check PASS/APPROVED before FAIL to handle "PASSED" correctly
  // But also check for explicit FAIL markers that might appear alongside other text

  // Check for PASS / APPROVED
  if (/\bPASS(?:ED)?\b/i.test(text)) {
    // Make sure there is not also a FAIL verdict (e.g., "PASSED 3 tests, FAILED 2 tests")
    // In ambiguous cases, look for a clear verdict line
    const hasExplicitFail = /\b(?:verdict|decision|status)\s*[:=]\s*FAIL/i.test(text);
    if (!hasExplicitFail) {
      return DECISIONS.PROCEED;
    }
  }

  // Check for APPROVED
  if (/\bAPPROV(?:E|ED)\b/i.test(text)) {
    return DECISIONS.PROCEED;
  }

  // Check for CONCERNS (non-blocking — CP-11)
  if (/\bCONCERNS?\b/i.test(text)) {
    return DECISIONS.PROCEED_WITH_NOTE;
  }

  // Check for FAIL / REJECTED
  if (/\bFAIL(?:ED)?\b/i.test(text)) {
    return DECISIONS.RETRY;
  }

  if (/\bREJECT(?:ED)?\b/i.test(text)) {
    return DECISIONS.RETRY;
  }

  // Strategy 7: Fallback — retry (conservative)
  return DECISIONS.RETRY;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Extract text content from a session result.
 * Supports both `result.summary` (preferred) and raw message extraction.
 *
 * @param {object} result
 * @returns {string}
 */
function _extractText(result) {
  if (!result) return '';

  // Prefer summary (already extracted by SessionManager)
  if (typeof result.summary === 'string' && result.summary.length > 0) {
    return result.summary;
  }

  // Fallback: stringify the entire result for regex scanning
  if (typeof result === 'string') return result;

  try {
    return JSON.stringify(result);
  } catch {
    return '';
  }
}
