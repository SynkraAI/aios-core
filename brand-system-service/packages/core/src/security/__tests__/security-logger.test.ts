/**
 * Tests for security event logger.
 * Story: BSS-1.4 AC-7
 */

import { logSecurityEvent, type SecurityEvent } from '../security-logger';

describe('logSecurityEvent', () => {
  let consoleSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('logs INFO events to stdout', () => {
    const event: SecurityEvent = {
      event: 'MALWARE_SCAN_CLEAN',
      severity: 'INFO',
      timestamp: '2026-03-16T12:00:00.000Z',
      details: { filename: 'logo.png' },
    };

    logSecurityEvent(event);

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const logged = JSON.parse(consoleSpy.mock.calls[0][0]);
    expect(logged.type).toBe('security');
    expect(logged.event).toBe('MALWARE_SCAN_CLEAN');
    expect(logged.severity).toBe('INFO');
  });

  it('logs WARN events to stdout', () => {
    const event: SecurityEvent = {
      event: 'RATE_LIMIT_BREACH',
      severity: 'WARN',
      clientId: 'acme',
      timestamp: '2026-03-16T12:00:00.000Z',
      details: { currentCount: 101 },
    };

    logSecurityEvent(event);
    expect(consoleSpy).toHaveBeenCalledTimes(1);
  });

  it('logs CRITICAL events to stderr', () => {
    const event: SecurityEvent = {
      event: 'MALWARE_DETECTED',
      severity: 'CRITICAL',
      timestamp: '2026-03-16T12:00:00.000Z',
      details: { filename: 'virus.exe', threat: 'Eicar-Test-Signature' },
    };

    logSecurityEvent(event);

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it('includes clientId when provided', () => {
    const event: SecurityEvent = {
      event: 'PATH_TRAVERSAL_ATTEMPT',
      severity: 'WARN',
      clientId: 'client-123',
      timestamp: '2026-03-16T12:00:00.000Z',
      details: { path: '../../../etc/passwd' },
    };

    logSecurityEvent(event);

    const logged = JSON.parse(consoleSpy.mock.calls[0][0]);
    expect(logged.clientId).toBe('client-123');
  });

  it('omits clientId when not provided', () => {
    const event: SecurityEvent = {
      event: 'INVALID_CREDENTIALS',
      severity: 'WARN',
      timestamp: '2026-03-16T12:00:00.000Z',
      details: {},
    };

    logSecurityEvent(event);

    const logged = JSON.parse(consoleSpy.mock.calls[0][0]);
    expect(logged.clientId).toBeUndefined();
  });

  it('outputs valid JSON format', () => {
    const event: SecurityEvent = {
      event: 'UPLOAD_SIZE_EXCEEDED',
      severity: 'WARN',
      timestamp: '2026-03-16T12:00:00.000Z',
      details: { sizeBytes: 52_428_801, maxBytes: 52_428_800 },
    };

    logSecurityEvent(event);

    const output = consoleSpy.mock.calls[0][0];
    expect(() => JSON.parse(output)).not.toThrow();

    const parsed = JSON.parse(output);
    expect(parsed).toHaveProperty('type', 'security');
    expect(parsed).toHaveProperty('event');
    expect(parsed).toHaveProperty('severity');
    expect(parsed).toHaveProperty('timestamp');
    expect(parsed).toHaveProperty('details');
  });
});
