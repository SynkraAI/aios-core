/**
 * Immutable append-only audit log with SHA-256 checksum chain.
 * GDPR compliance: all data lifecycle events are logged.
 *
 * @module gdpr/audit-log
 */

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, appendFileSync } from 'node:fs';
import { dirname } from 'node:path';

import type { AuditEventType, AuditLogEntry, AuditVerificationResult } from './types';
import { GDPR_PATHS } from './types';

/** Genesis checksum for the first entry in the chain. */
const GENESIS_CHECKSUM = '0'.repeat(64);

/**
 * Compute SHA-256 checksum for an audit entry.
 *
 * @param entryJson - JSON string of the entry (without checksum fields)
 * @param previousChecksum - Checksum of the previous entry
 * @returns Hex-encoded SHA-256 hash
 */
function computeChecksum(entryJson: string, previousChecksum: string): string {
  return createHash('sha256')
    .update(entryJson + previousChecksum)
    .digest('hex');
}

/**
 * Get the checksum of the last entry in the audit log.
 * Returns genesis checksum if log is empty or doesn't exist.
 *
 * @param logPath - Path to the audit log file
 * @returns The last checksum in the chain
 */
function getLastChecksum(logPath: string): string {
  if (!existsSync(logPath)) {
    return GENESIS_CHECKSUM;
  }

  const content = readFileSync(logPath, 'utf-8').trim();
  if (content === '') {
    return GENESIS_CHECKSUM;
  }

  const lines = content.split('\n');
  const lastLine = lines[lines.length - 1];

  try {
    const entry = JSON.parse(lastLine) as AuditLogEntry;
    return entry.checksum;
  } catch {
    return GENESIS_CHECKSUM;
  }
}

/**
 * Append an entry to the immutable audit log.
 * Computes checksum chain automatically.
 *
 * @param event - The audit event type
 * @param clientId - Client identifier
 * @param details - Event details
 * @param actorId - Optional actor identifier
 * @param logPath - Path to audit log file (defaults to GDPR_PATHS.AUDIT_LOG)
 */
export function appendAuditLog(
  event: AuditEventType,
  clientId: string,
  details: Record<string, unknown>,
  actorId?: string,
  logPath: string = GDPR_PATHS.AUDIT_LOG,
): void {
  // Ensure directory exists
  const dir = dirname(logPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const previousChecksum = getLastChecksum(logPath);

  const partialEntry = {
    timestamp: new Date().toISOString(),
    event,
    clientId,
    ...(actorId ? { actorId } : {}),
    details,
  };

  const entryJson = JSON.stringify(partialEntry);
  const checksum = computeChecksum(entryJson, previousChecksum);

  const fullEntry: AuditLogEntry = {
    ...partialEntry,
    previousChecksum,
    checksum,
  };

  appendFileSync(logPath, JSON.stringify(fullEntry) + '\n', 'utf-8');
}

/**
 * Verify the integrity of the audit log checksum chain.
 *
 * @param logPath - Path to audit log file (defaults to GDPR_PATHS.AUDIT_LOG)
 * @returns Verification result with validity status
 */
export function verifyAuditLog(logPath: string = GDPR_PATHS.AUDIT_LOG): AuditVerificationResult {
  if (!existsSync(logPath)) {
    return { valid: true, entries: 0 };
  }

  const content = readFileSync(logPath, 'utf-8').trim();
  if (content === '') {
    return { valid: true, entries: 0 };
  }

  const lines = content.split('\n');
  let expectedPreviousChecksum = GENESIS_CHECKSUM;

  for (let i = 0; i < lines.length; i++) {
    let entry: AuditLogEntry;
    try {
      entry = JSON.parse(lines[i]) as AuditLogEntry;
    } catch {
      return { valid: false, entries: lines.length, firstCorruptedAt: i };
    }

    // Verify previous checksum link
    if (entry.previousChecksum !== expectedPreviousChecksum) {
      return { valid: false, entries: lines.length, firstCorruptedAt: i };
    }

    // Recompute checksum
    const partialEntry: Record<string, unknown> = {
      timestamp: entry.timestamp,
      event: entry.event,
      clientId: entry.clientId,
    };
    if (entry.actorId !== undefined) {
      partialEntry['actorId'] = entry.actorId;
    }
    partialEntry['details'] = entry.details;

    const entryJson = JSON.stringify(partialEntry);
    const expectedChecksum = computeChecksum(entryJson, expectedPreviousChecksum);

    if (entry.checksum !== expectedChecksum) {
      return { valid: false, entries: lines.length, firstCorruptedAt: i };
    }

    expectedPreviousChecksum = entry.checksum;
  }

  return { valid: true, entries: lines.length };
}
