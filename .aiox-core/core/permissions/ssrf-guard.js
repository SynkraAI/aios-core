/**
 * SSRF Guard
 *
 * Prevents Server-Side Request Forgery by blocking requests to private,
 * loopback, link-local, and metadata IP ranges. Absorbed from OpenClaw pattern.
 *
 * Blocked ranges (RFC 1918 + special-purpose):
 *   - 10.0.0.0/8       — Private class A
 *   - 172.16.0.0/12    — Private class B (172.16.x – 172.31.x)
 *   - 192.168.0.0/16   — Private class C
 *   - 127.0.0.0/8      — Loopback (localhost)
 *   - 169.254.0.0/16   — Link-local / APIPA (AWS metadata: 169.254.169.254)
 *   - ::1              — IPv6 loopback
 *   - fc00::/7         — IPv6 unique local
 *
 * @module permissions/ssrf-guard
 * @version 1.0.0
 * @story CORE-SU.A3
 *
 * ─── STANDALONE LIBRARY — NOT WIRED TO RUNTIME ENFORCEMENT ───────────────
 *
 * This module is exported from `permissions/index.js` but is NOT called by
 * `operation-guard.js`'s `guard()` path, and is NOT registered as a
 * PreToolUse hook. No outbound request (WebFetch, MCP call, HTTP client) is
 * validated against this guard automatically today. Callers must invoke
 * `validateUrl()` / `isUrlAllowed()` explicitly wherever SSRF protection is
 * required (e.g. app code fetching a user- or agent-supplied URL).
 *
 * If/when this is wired into `OperationGuard.guard()` or a hook, remove
 * this notice and document the integration point here.
 *
 * ─── USAGE ────────────────────────────────────────────────────────────────
 *
 *   const ssrfGuard = require('.aiox-core/core/permissions/ssrf-guard');
 *   const result = ssrfGuard.validateUrl(untrustedUrl);
 *   if (!result.allowed) {
 *     // Block: result.reason available
 *   }
 */

'use strict';

const { URL } = require('url');
const net = require('net');

/**
 * Private IPv4 CIDR blocks to block.
 * Each entry: { label, baseInt, maskBits }
 */
const PRIVATE_IPV4_BLOCKS = [
  { label: 'loopback',           cidr: '127.0.0.0/8',    baseInt: ipv4ToInt('127.0.0.0'),   maskBits: 8  },
  { label: 'private-class-a',    cidr: '10.0.0.0/8',     baseInt: ipv4ToInt('10.0.0.0'),    maskBits: 8  },
  { label: 'private-class-b',    cidr: '172.16.0.0/12',  baseInt: ipv4ToInt('172.16.0.0'),  maskBits: 12 },
  { label: 'private-class-c',    cidr: '192.168.0.0/16', baseInt: ipv4ToInt('192.168.0.0'), maskBits: 16 },
  { label: 'link-local-apipa',   cidr: '169.254.0.0/16', baseInt: ipv4ToInt('169.254.0.0'), maskBits: 16 },
  { label: 'private-class-c-b',  cidr: '192.0.0.0/24',   baseInt: ipv4ToInt('192.0.0.0'),   maskBits: 24 }, // IANA shared
  { label: 'documentation',      cidr: '198.51.100.0/24',baseInt: ipv4ToInt('198.51.100.0'), maskBits: 24 },
  { label: 'test-net',           cidr: '203.0.113.0/24', baseInt: ipv4ToInt('203.0.113.0'),  maskBits: 24 },
];

/**
 * Private/local IPv6 prefixes to block (string startsWith for nibble-aligned ranges).
 * Link-local fe80::/10 is handled numerically in checkIPv6 (not nibble-aligned).
 * IPv4-mapped ::ffff:x.x.x.x is delegated to checkIPv4 (not blanket-blocked here).
 */
const BLOCKED_IPV6_PREFIXES = [
  '::1', // loopback exact / start
  'fc', // unique local fc00::/7
  'fd', // unique local fd00::/7
];
/**
 * Hostnames that always resolve to blocked addresses.
 */
const BLOCKED_HOSTNAMES = [
  'localhost',
  'ip6-localhost',
  'ip6-loopback',
  '0.0.0.0',
  '0',             // shorthand for 0.0.0.0
];

/**
 * Convert a dotted-decimal IPv4 string to a 32-bit integer.
 * @param {string} ip
 * @returns {number}
 */
function ipv4ToInt(ip) {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

/**
 * Check if an IPv4 address (as integer) is within a CIDR block.
 * @param {number} ipInt
 * @param {number} baseInt
 * @param {number} maskBits
 * @returns {boolean}
 */
function ipv4InCidr(ipInt, baseInt, maskBits) {
  const mask = maskBits === 0 ? 0 : (~0 << (32 - maskBits)) >>> 0;
  return (ipInt & mask) === (baseInt & mask);
}

/**
 * Check if a string is a valid IPv4 address.
 * @param {string} host
 * @returns {boolean}
 */
function isIPv4(host) {
  return net.isIPv4(host);
}

/**
 * Check if a string is a valid IPv6 address.
 * @param {string} host
 * @returns {boolean}
 */
function isIPv6(host) {
  return net.isIPv6(host);
}

/**
 * Check whether an IPv4 address string falls in any blocked range.
 * @param {string} ip
 * @returns {{ blocked: boolean, reason: string|null }}
 */
function checkIPv4(ip) {
  const ipInt = ipv4ToInt(ip);
  for (const block of PRIVATE_IPV4_BLOCKS) {
    if (ipv4InCidr(ipInt, block.baseInt, block.maskBits)) {
      return { blocked: true, reason: `IPv4 ${ip} is in blocked range ${block.cidr} (${block.label})` };
    }
  }
  return { blocked: false, reason: null };
}

/**
 * Check whether an IPv6 address string falls in any blocked prefix.
 * @param {string} ip
 * @returns {{ blocked: boolean, reason: string|null }}
 */
function checkIPv6(ip) {
  // Normalize: remove brackets (e.g. [::1] → ::1)
  const normalized = ip.replace(/^\[|\]$/g, '').toLowerCase();

  // IPv4-mapped IPv6: ::ffff:a.b.c.d → check embedded IPv4 policy
  const ipv4Mapped = normalized.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (ipv4Mapped) {
    return checkIPv4(ipv4Mapped[1]);
  }

  // Loopback
  if (normalized === '::1' || normalized === '0:0:0:0:0:0:0:1') {
    return { blocked: true, reason: `IPv6 ${ip} is loopback` };
  }

  // Unique local fc00::/7 (fc… / fd…)
  for (const prefix of BLOCKED_IPV6_PREFIXES) {
    if (normalized === prefix || normalized.startsWith(prefix)) {
      return { blocked: true, reason: `IPv6 ${ip} matches blocked prefix ${prefix}` };
    }
  }

  // Link-local fe80::/10 (first 10 bits = 1111111010) — not nibble-aligned for startsWith
  const firstHextet = normalized.split(/:|%/)[0] || '';
  const hextet = parseInt(firstHextet, 16);
  if (Number.isFinite(hextet) && (hextet & 0xffc0) === 0xfe80) {
    return { blocked: true, reason: `IPv6 ${ip} is in link-local fe80::/10` };
  }

  return { blocked: false, reason: null };
}

/**
 * Check a hostname against the blocked hostname list and IP ranges.
 * Does NOT perform DNS resolution (to avoid TOCTOU issues).
 *
 * @param {string} hostname - Raw hostname or IP from the URL
 * @returns {{ blocked: boolean, reason: string|null }}
 */
function checkHostname(hostname) {
  if (!hostname) {
    return { blocked: true, reason: 'Empty hostname is not allowed' };
  }

  const lower = hostname.toLowerCase();

  // Check exact blocked hostnames
  for (const blocked of BLOCKED_HOSTNAMES) {
    if (lower === blocked) {
      return { blocked: true, reason: `Hostname "${hostname}" is in blocked list` };
    }
  }

  // Check IPv4
  if (isIPv4(hostname)) {
    return checkIPv4(hostname);
  }

  // Check IPv6 (strip brackets for parsing)
  const strippedIpv6 = hostname.replace(/^\[|\]$/g, '');
  if (isIPv6(strippedIpv6)) {
    return checkIPv6(strippedIpv6);
  }

  // IPv4-mapped IPv6 notation: ::ffff:10.0.0.1 style embedded in hostname
  const ipv4MappedMatch = strippedIpv6.match(/^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/i);
  if (ipv4MappedMatch) {
    return checkIPv4(ipv4MappedMatch[1]);
  }

  return { blocked: false, reason: null };
}

/**
 * Validate a URL against SSRF policy.
 *
 * @param {string} urlString - The URL to validate
 * @returns {SSRFGuardResult}
 *
 * @typedef {Object} SSRFGuardResult
 * @property {boolean} allowed - true if URL passes SSRF policy
 * @property {string|null} hostname - Parsed hostname, or null if parse failed
 * @property {boolean} hostnameBlocked - true if hostname/IP is in a blocked range
 * @property {string|null} reason - Human-readable denial reason, or null if allowed
 * @property {'CRITICAL'|'HIGH'|null} severity - Severity if blocked
 */
function validateUrl(urlString) {
  if (typeof urlString !== 'string') {
    throw new TypeError('ssrf-guard: urlString must be a string');
  }

  let parsed;
  try {
    parsed = new URL(urlString);
  } catch {
    return {
      allowed: false,
      hostname: null,
      hostnameBlocked: false,
      reason: `Invalid URL: "${urlString.substring(0, 100)}"`,
      severity: 'HIGH',
    };
  }

  const hostname = parsed.hostname;
  const check = checkHostname(hostname);

  if (check.blocked) {
    return {
      allowed: false,
      hostname,
      hostnameBlocked: true,
      reason: check.reason,
      severity: 'CRITICAL',
    };
  }

  return {
    allowed: true,
    hostname,
    hostnameBlocked: false,
    reason: null,
    severity: null,
  };
}

/**
 * Quick check: is this URL safe from SSRF perspective?
 * @param {string} urlString
 * @returns {boolean}
 */
function isUrlAllowed(urlString) {
  return validateUrl(urlString).allowed;
}

/**
 * Get the list of blocked IPv4 CIDR ranges.
 * @returns {Array<{label: string, cidr: string}>}
 */
function getBlockedRanges() {
  return PRIVATE_IPV4_BLOCKS.map(({ label, cidr }) => ({ label, cidr }));
}

module.exports = {
  validateUrl,
  isUrlAllowed,
  checkHostname,
  checkIPv4,
  checkIPv6,
  ipv4ToInt,
  getBlockedRanges,
  PRIVATE_IPV4_BLOCKS,
  BLOCKED_IPV6_PREFIXES,
  BLOCKED_HOSTNAMES,
};
