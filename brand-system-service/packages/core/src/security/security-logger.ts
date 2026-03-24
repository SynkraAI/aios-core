/**
 * Structured security event logging for Brand System Service.
 * Logs security events as structured JSON to stdout/stderr.
 *
 * Events: MALWARE_DETECTED, PATH_TRAVERSAL_ATTEMPT, RATE_LIMIT_BREACH,
 *         INVALID_CREDENTIALS, MALWARE_SCAN_CLEAN, CLAMAV_UNAVAILABLE,
 *         MALWARE_SCAN_TIMEOUT, MALWARE_SCAN_ERROR, UPLOAD_SIZE_EXCEEDED
 *
 * @module security/security-logger
 */

/** Severity levels for security events. */
export type SecuritySeverity = 'INFO' | 'WARN' | 'CRITICAL';

/** Structured security event. */
export interface SecurityEvent {
  readonly event: string;
  readonly severity: SecuritySeverity;
  readonly clientId?: string;
  readonly timestamp: string;
  readonly details: Record<string, unknown>;
}

/** Internal log entry format. */
interface SecurityLogEntry {
  readonly type: 'security';
  readonly event: string;
  readonly severity: SecuritySeverity;
  readonly clientId?: string;
  readonly timestamp: string;
  readonly details: Record<string, unknown>;
}

/**
 * Log a security event as structured JSON.
 * CRITICAL events go to stderr, others to stdout.
 *
 * @param event - The security event to log
 */
export function logSecurityEvent(event: SecurityEvent): void {
  const entry: SecurityLogEntry = {
    type: 'security',
    event: event.event,
    severity: event.severity,
    ...(event.clientId ? { clientId: event.clientId } : {}),
    timestamp: event.timestamp,
    details: event.details,
  };

  const output = JSON.stringify(entry);

  if (event.severity === 'CRITICAL') {
    console.error(output);
  } else {
    // eslint-disable-next-line no-console
    console.log(output);
  }
}
