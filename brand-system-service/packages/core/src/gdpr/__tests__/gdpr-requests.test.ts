/**
 * Tests for GDPR request tracking.
 * Story: BSS-1.5 AC-5
 */

import { existsSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';

import { createGdprRequest, getGdprRequest, updateGdprRequestStatus } from '../gdpr-requests';

// Suppress console output
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

const TEST_BASE_DIR = path.join('output', 'test-gdpr-requests');
const TEST_AUDIT_LOG = path.join('output', 'test-logs', 'audit-gdpr.jsonl');

beforeEach(() => {
  for (const dir of [TEST_BASE_DIR, path.dirname(TEST_AUDIT_LOG)]) {
    if (existsSync(dir)) rmSync(dir, { recursive: true });
    mkdirSync(dir, { recursive: true });
  }
});

afterEach(() => {
  for (const dir of [TEST_BASE_DIR, path.dirname(TEST_AUDIT_LOG)]) {
    if (existsSync(dir)) rmSync(dir, { recursive: true });
  }
});

describe('createGdprRequest', () => {
  it('creates a request with pending status', () => {
    const request = createGdprRequest('client-1', 'export', TEST_BASE_DIR, TEST_AUDIT_LOG);

    expect(request.clientId).toBe('client-1');
    expect(request.type).toBe('export');
    expect(request.status).toBe('pending');
    expect(request.requestId).toBeDefined();
    expect(request.createdAt).toBeDefined();
    expect(request.deadlineAt).toBeDefined();
  });

  it('sets 30-day deadline', () => {
    const request = createGdprRequest('client-1', 'delete', TEST_BASE_DIR, TEST_AUDIT_LOG);

    const created = new Date(request.createdAt).getTime();
    const deadline = new Date(request.deadlineAt).getTime();
    const diffDays = (deadline - created) / (24 * 60 * 60 * 1000);

    expect(Math.round(diffDays)).toBe(30);
  });

  it('generates unique request IDs', () => {
    const r1 = createGdprRequest('client-1', 'export', TEST_BASE_DIR, TEST_AUDIT_LOG);
    const r2 = createGdprRequest('client-1', 'export', TEST_BASE_DIR, TEST_AUDIT_LOG);
    expect(r1.requestId).not.toBe(r2.requestId);
  });
});

describe('getGdprRequest', () => {
  it('retrieves an existing request', () => {
    const created = createGdprRequest('client-2', 'rectification', TEST_BASE_DIR, TEST_AUDIT_LOG);
    const retrieved = getGdprRequest('client-2', created.requestId, TEST_BASE_DIR);

    expect(retrieved).not.toBeNull();
    expect(retrieved!.requestId).toBe(created.requestId);
    expect(retrieved!.type).toBe('rectification');
  });

  it('returns null for non-existent request', () => {
    const result = getGdprRequest('client-x', 'non-existent-id', TEST_BASE_DIR);
    expect(result).toBeNull();
  });
});

describe('updateGdprRequestStatus', () => {
  it('updates status to processing', () => {
    const request = createGdprRequest('client-3', 'export', TEST_BASE_DIR, TEST_AUDIT_LOG);
    updateGdprRequestStatus(
      'client-3',
      request.requestId,
      'processing',
      TEST_BASE_DIR,
      TEST_AUDIT_LOG,
    );

    const updated = getGdprRequest('client-3', request.requestId, TEST_BASE_DIR);
    expect(updated!.status).toBe('processing');
  });

  it('sets completedAt when status is complete', () => {
    const request = createGdprRequest('client-4', 'delete', TEST_BASE_DIR, TEST_AUDIT_LOG);
    updateGdprRequestStatus(
      'client-4',
      request.requestId,
      'complete',
      TEST_BASE_DIR,
      TEST_AUDIT_LOG,
    );

    const updated = getGdprRequest('client-4', request.requestId, TEST_BASE_DIR);
    expect(updated!.status).toBe('complete');
    expect(updated!.completedAt).toBeDefined();
  });

  it('throws for non-existent request', () => {
    expect(() =>
      updateGdprRequestStatus('client-x', 'missing', 'complete', TEST_BASE_DIR, TEST_AUDIT_LOG),
    ).toThrow('not found');
  });
});
