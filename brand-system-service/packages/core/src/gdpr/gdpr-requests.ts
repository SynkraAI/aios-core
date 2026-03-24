/**
 * GDPR request tracking — CRUD for data subject requests.
 * Tracks export, delete, and rectification requests per GDPR Article 12.
 *
 * @module gdpr/gdpr-requests
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

import type { GdprRequest, GdprRequestType, GdprRequestStatus } from './types';
import { GDPR_PATHS, RETENTION_PERIODS } from './types';
import { appendAuditLog } from './audit-log';

/**
 * Create a new GDPR data subject request.
 * 30-day deadline per GDPR Article 12.
 *
 * @param clientId - Client identifier
 * @param type - Request type (export, delete, rectification)
 * @param baseDir - Base directory for request storage
 * @param logPath - Optional audit log path
 * @returns Created GdprRequest
 */
export function createGdprRequest(
  clientId: string,
  type: GdprRequestType,
  baseDir: string = GDPR_PATHS.GDPR_REQUESTS_DIR,
  logPath?: string,
): GdprRequest {
  const now = new Date();
  const requestId = randomUUID();
  const deadlineAt = new Date(now.getTime() + RETENTION_PERIODS.GDPR_RESPONSE_MS);

  const request: GdprRequest = {
    requestId,
    clientId,
    type,
    status: 'pending',
    createdAt: now.toISOString(),
    deadlineAt: deadlineAt.toISOString(),
    details: {},
  };

  const dir = path.join(baseDir, clientId);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const filePath = path.join(dir, `${requestId}.json`);
  writeFileSync(filePath, JSON.stringify(request, null, 2), 'utf-8');

  appendAuditLog(
    'GDPR_REQUEST_CREATED',
    clientId,
    { requestId, type, deadlineAt: deadlineAt.toISOString() },
    undefined,
    logPath,
  );

  return request;
}

/**
 * Get a GDPR request by ID.
 *
 * @param clientId - Client identifier
 * @param requestId - Request UUID
 * @param baseDir - Base directory for request storage
 * @returns GdprRequest or null if not found
 */
export function getGdprRequest(
  clientId: string,
  requestId: string,
  baseDir: string = GDPR_PATHS.GDPR_REQUESTS_DIR,
): GdprRequest | null {
  const filePath = path.join(baseDir, clientId, `${requestId}.json`);

  if (!existsSync(filePath)) {
    return null;
  }

  try {
    const content = readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as GdprRequest;
  } catch {
    return null;
  }
}

/**
 * Update the status of a GDPR request.
 *
 * @param clientId - Client identifier
 * @param requestId - Request UUID
 * @param status - New status
 * @param baseDir - Base directory for request storage
 * @param logPath - Optional audit log path
 */
export function updateGdprRequestStatus(
  clientId: string,
  requestId: string,
  status: GdprRequestStatus,
  baseDir: string = GDPR_PATHS.GDPR_REQUESTS_DIR,
  logPath?: string,
): void {
  const filePath = path.join(baseDir, clientId, `${requestId}.json`);

  if (!existsSync(filePath)) {
    throw new Error(`GDPR request "${requestId}" not found for client "${clientId}"`);
  }

  const content = readFileSync(filePath, 'utf-8');
  const request = JSON.parse(content) as GdprRequest;

  const updated: GdprRequest = {
    ...request,
    status,
    completedAt:
      status === 'complete' || status === 'failed' ? new Date().toISOString() : undefined,
  };

  writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf-8');

  if (status === 'complete') {
    appendAuditLog(
      'GDPR_REQUEST_COMPLETED',
      clientId,
      { requestId, type: request.type, status },
      undefined,
      logPath,
    );
  }
}
