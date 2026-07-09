'use strict';

const {
  validateUrl,
  isUrlAllowed,
  checkHostname,
  checkIPv4,
  getBlockedRanges,
} = require('../ssrf-guard');

describe('ssrf-guard (CORE-SU.A3)', () => {
  it('allows public https URLs', () => {
    const result = validateUrl('https://example.com/api');
    expect(result.allowed).toBe(true);
    expect(result.hostname).toBe('example.com');
    expect(isUrlAllowed('https://example.com/api')).toBe(true);
  });

  it('blocks localhost and loopback', () => {
    expect(validateUrl('http://localhost:3000').allowed).toBe(false);
    expect(validateUrl('http://127.0.0.1/admin').allowed).toBe(false);
    expect(checkHostname('localhost').blocked).toBe(true);
  });

  it('blocks private RFC1918 and metadata IP', () => {
    expect(checkIPv4('10.0.0.5').blocked).toBe(true);
    expect(checkIPv4('192.168.1.1').blocked).toBe(true);
    expect(checkIPv4('172.16.0.1').blocked).toBe(true);
    expect(validateUrl('http://169.254.169.254/latest/meta-data/').allowed).toBe(false);
  });

  it('blocks invalid URLs', () => {
    const result = validateUrl('not a url');
    expect(result.allowed).toBe(false);
    expect(result.severity).toBe('HIGH');
  });

  it('throws on non-string', () => {
    expect(() => validateUrl(42)).toThrow(TypeError);
  });

  it('exports blocked ranges metadata', () => {
    const ranges = getBlockedRanges();
    expect(ranges.some((r) => r.cidr.startsWith('10.'))).toBe(true);
  });

  it('blocks IPv4-mapped IPv6 by embedded IPv4 policy', () => {
    expect(checkHostname('::ffff:10.0.0.1').blocked).toBe(true);
    expect(checkHostname('::ffff:8.8.8.8').blocked).toBe(false);
  });

  it('blocks full fe80::/10 link-local range', () => {
    const { checkIPv6 } = require('../ssrf-guard');
    expect(checkIPv6('fe80::1').blocked).toBe(true);
    expect(checkIPv6('fe90::1').blocked).toBe(true);
    expect(checkIPv6('febf::1').blocked).toBe(true);
    expect(checkIPv6('fec0::1').blocked).toBe(false);
  });
});
