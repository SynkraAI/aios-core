/**
 * Prompt Guard
 *
 * Detects prompt injection attempts using regex-based threat pattern matching
 * and invisible unicode detection. Absorbed from GSD-1 and Hermes frameworks.
 *
 * @module permissions/prompt-guard
 * @version 1.0.0
 * @story CORE-SU.A3
 *
 * ─── WHEN TO USE THIS LIBRARY ────────────────────────────────────────────
 *
 * USE IN apps deployed as services where untrusted input reaches the LLM:
 *   - Public chatbots / SaaS APIs accepting prompts from external users
 *   - Multi-tenant agent platforms (one tenant could attack another)
 *   - RAG pipelines ingesting external documents (PDFs, scraped web content,
 *     YouTube transcripts) before injection into LLM context
 *   - Batch pipelines processing prompts from heterogeneous sources
 *
 * DO NOT USE as a Claude Code PreToolUse hook for local single-user dev:
 *   - The local CC operator is the only "user" — there is no attacker
 *   - PreToolUse only sees tool_input (operator's own typing), not tool RESULTS
 *     (where malicious content from WebFetch/MCP would actually arrive)
 *   - Editing files that legitimately contain these patterns (e.g. this file,
 *     security training docs, prompt-injection test cases) triggers false
 *     positives in your own workflow
 *   - Cost: ~50-150ms cold start per Bash/Write/Edit/Agent/Skill call,
 *     blocking the operator's flow with no real attacker present
 *
 * Removed from .claude/settings.json hooks on 2026-05-08. The library itself
 * stays available here for future use in deployed apps (apps/*) that DO have
 * the right threat model.
 *
 * ─── USAGE (in deployed app code) ────────────────────────────────────────
 *
 *   const { scan } = require('.aiox-core/core/permissions/prompt-guard');
 *   const result = scan(untrustedInput);
 *   if (!result.safe) {
 *     // Block: result.threats[] + result.maxSeverity available
 *     return { error: 'prompt_injection_detected', threats: result.threats };
 *   }
 */

'use strict';

/**
 * 10+ regex-based threat signatures covering:
 * - System prompt override attempts (GSD-1)
 * - Role hijacking patterns
 * - Instruction injection via delimiter tricks
 * - Context escape sequences
 * - Jailbreak incantations
 * - Base64 payload carriers
 * - XML/JSON bracket injection
 * - DAN / "do anything now" patterns
 * - Exfiltration commands
 * - Chain-of-thought manipulation
 */
const THREAT_PATTERNS = [
  // 1. System prompt override — direct instruction replacement
  {
    id: 'PT-001',
    name: 'system-prompt-override',
    pattern: /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?|rules?|constraints?)/i,
    severity: 'CRITICAL',
  },
  // 2. Role hijacking — pretend to be a different AI
  {
    id: 'PT-002',
    name: 'role-hijacking',
    pattern: /you\s+are\s+now\s+(a\s+)?(an?\s+)?(jailbroken|uncensored|unrestricted|evil|DAN|free|unfiltered)\b/i,
    severity: 'CRITICAL',
  },
  // 3. DAN / "do anything now" jailbreak pattern
  {
    id: 'PT-003',
    name: 'dan-jailbreak',
    pattern: /\b(DAN|do\s+anything\s+now|pretend\s+you\s+have\s+no\s+restrictions|act\s+as\s+if\s+you\s+have\s+no\s+limits)\b/i,
    severity: 'CRITICAL',
  },
  // 4. Context escape via delimiter injection
  {
    id: 'PT-004',
    name: 'delimiter-injection',
    pattern: /(<\/?system>|<\/?human>|<\/?assistant>|\[SYSTEM\]|\[INST\]|\[\/INST\]|###\s*System|###\s*Instruction)/i,
    severity: 'HIGH',
  },
  // 5. Base64 encoded payload carrier
  {
    id: 'PT-005',
    name: 'base64-payload',
    pattern: /(?:base64|b64)[_\s]?(?:decode|eval|exec)\s*\(/i,
    severity: 'HIGH',
  },
  // 6. Exfiltration command — send/POST data to external URL
  {
    id: 'PT-006',
    name: 'exfiltration-command',
    pattern: /(?:send|post|fetch|curl|wget|transmit)\s+(?:all\s+)?(?:the\s+)?(?:system\s+prompt|conversation|context|history|memory|secrets?)\s+to\b/i,
    severity: 'CRITICAL',
  },
  // 7. Instruction injection via "new task" framing
  {
    id: 'PT-007',
    name: 'new-task-injection',
    pattern: /(?:^|\n)\s*(?:new\s+task|actual\s+task|real\s+instruction|hidden\s+instruction)\s*:/im,
    severity: 'HIGH',
  },
  // 8. Prompt leakage request
  {
    id: 'PT-008',
    name: 'prompt-leak-request',
    pattern: /(?:print|output|reveal|show|repeat|display|tell\s+me)\s+(?:your\s+)?(?:system\s+prompt|initial\s+prompt|full\s+prompt|all\s+instructions|all\s+rules)/i,
    severity: 'HIGH',
  },
  // 9. Chain-of-thought manipulation — "think step by step and ignore..."
  {
    id: 'PT-009',
    name: 'cot-manipulation',
    pattern: /think\s+step\s+by\s+step\s+(?:and\s+)?(?:then\s+)?(?:ignore|bypass|override|forget|disregard)/i,
    severity: 'MEDIUM',
  },
  // 10. XML injection in structured inputs
  {
    id: 'PT-010',
    name: 'xml-injection',
    pattern: /<(?:inject|payload|override|cmd|exec|eval|script)\s*(?:type\s*=\s*['"]?(?:text\/javascript|application\/x-www-form-urlencoded)['"]?)?\s*>/i,
    severity: 'HIGH',
  },
  // 11. Nested prompt — "pretend the following is a new conversation"
  {
    id: 'PT-011',
    name: 'nested-prompt',
    pattern: /(?:pretend|imagine|assume|consider)\s+(?:that\s+)?(?:the\s+)?(?:following|below|next)\s+(?:is|are)\s+(?:a\s+new|your\s+real|the\s+actual)\s+(?:conversation|instruction|prompt|task)/i,
    severity: 'HIGH',
  },
  // 12. Override safety filters
  {
    id: 'PT-012',
    name: 'safety-override',
    pattern: /(?:disable|bypass|remove|ignore|override)\s+(?:your\s+)?(?:safety|content|ethical|moral|alignment)\s+(?:filters?|guardrails?|restrictions?|constraints?|checks?)/i,
    severity: 'CRITICAL',
  },
];

/**
 * Invisible unicode characters used for steganographic prompt injection (Hermes pattern).
 * These characters are zero-width or directional overrides that can hide malicious content.
 */
const INVISIBLE_UNICODE_RANGES = [
  // Zero-width characters
  [0x200B, 0x200F], // Zero-width space, ZWNJ, ZWJ, LRM, RLM
  [0x2028, 0x202F], // Line/paragraph separator + formatting chars
  [0xFEFF, 0xFEFF], // BOM / Zero-width no-break space
  [0x2060, 0x206F], // Word joiner, invisible separators
  // Directional overrides (Hermes: used to reverse-render text)
  [0x202A, 0x202E], // LRE, RLE, PDF, LRO, RLO
  [0x2066, 0x2069], // LRI, RLI, FSI, PDI
  // Tags block (completely invisible, used in advanced injection)
  [0xE0000, 0xE007F],
];

/**
 * Scan a string for invisible unicode characters.
 * @param {string} input - The string to scan
 * @returns {{ detected: boolean, codePoints: number[], positions: number[] }}
 */
function scanInvisibleUnicode(input) {
  const codePoints = [];
  const positions = [];

  for (let i = 0; i < input.length; i++) {
    const cp = input.codePointAt(i);
    if (cp === undefined) continue;

    for (const [start, end] of INVISIBLE_UNICODE_RANGES) {
      if (cp >= start && cp <= end) {
        codePoints.push(cp);
        positions.push(i);
        break;
      }
    }

    // Skip surrogate pair second code unit
    if (cp > 0xFFFF) i++;
  }

  return {
    detected: codePoints.length > 0,
    codePoints,
    positions,
  };
}

/**
 * Scan a prompt for threat patterns and invisible unicode.
 *
 * @param {string} input - The prompt text to scan
 * @returns {ScanResult}
 *
 * @typedef {Object} ScanResult
 * @property {boolean} safe - true if no threats detected
 * @property {ThreatMatch[]} threats - Array of detected threats
 * @property {UnicodeResult} unicode - Invisible unicode scan result
 * @property {'CRITICAL'|'HIGH'|'MEDIUM'|'LOW'|null} maxSeverity - Highest severity found
 *
 * @typedef {Object} ThreatMatch
 * @property {string} id - Pattern ID (PT-001 … PT-012)
 * @property {string} name - Pattern name
 * @property {'CRITICAL'|'HIGH'|'MEDIUM'} severity - Threat severity
 * @property {string} matchedText - The matching excerpt (first 100 chars)
 */
function scan(input) {
  if (typeof input !== 'string') {
    throw new TypeError('prompt-guard: input must be a string');
  }

  const threats = [];

  for (const { id, name, pattern, severity } of THREAT_PATTERNS) {
    const match = pattern.exec(input);
    if (match) {
      threats.push({
        id,
        name,
        severity,
        matchedText: match[0].substring(0, 100),
      });
    }
  }

  const unicodeResult = scanInvisibleUnicode(input);

  if (unicodeResult.detected) {
    threats.push({
      id: 'PT-UNI',
      name: 'invisible-unicode',
      severity: 'HIGH',
      matchedText: `${unicodeResult.codePoints.length} invisible character(s) at positions: ${unicodeResult.positions.slice(0, 5).join(', ')}`,
    });
  }

  const SEVERITY_ORDER = { CRITICAL: 3, HIGH: 2, MEDIUM: 1, LOW: 0 };
  let maxSeverity = null;
  for (const t of threats) {
    if (maxSeverity === null || SEVERITY_ORDER[t.severity] > SEVERITY_ORDER[maxSeverity]) {
      maxSeverity = t.severity;
    }
  }

  return {
    safe: threats.length === 0,
    threats,
    unicode: unicodeResult,
    maxSeverity,
  };
}

/**
 * Quick check: is the prompt safe? Returns boolean.
 * Use `scan()` for detailed results.
 *
 * @param {string} input
 * @returns {boolean}
 */
function isSafe(input) {
  return scan(input).safe;
}

/**
 * Get all registered threat pattern definitions.
 * @returns {Array} Pattern definitions (id, name, severity — no regex exposed)
 */
function getPatterns() {
  return THREAT_PATTERNS.map(({ id, name, severity }) => ({ id, name, severity }));
}

module.exports = {
  scan,
  isSafe,
  scanInvisibleUnicode,
  getPatterns,
  THREAT_PATTERNS,
};
