/**
 * Tests for soft delete and permanent delete.
 * Story: BSS-1.5 AC-2, AC-3
 */

import { mockClient } from 'aws-sdk-client-mock';
import {
  S3Client,
  CopyObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { existsSync, mkdirSync, rmSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { softDeleteAsset } from '../soft-delete';
import { permanentDeleteAsset, permanentDeleteClient } from '../permanent-delete';
import type { AuditLogEntry } from '../types';

const s3Mock = mockClient(S3Client);

const TEST_AUDIT_DIR = path.join('output', 'test-logs-delete');
const TEST_AUDIT_LOG = path.join(TEST_AUDIT_DIR, 'audit-delete.jsonl');

beforeEach(() => {
  s3Mock.reset();
  if (existsSync(TEST_AUDIT_DIR)) rmSync(TEST_AUDIT_DIR, { recursive: true });
  mkdirSync(TEST_AUDIT_DIR, { recursive: true });
});

afterEach(() => {
  if (existsSync(TEST_AUDIT_DIR)) rmSync(TEST_AUDIT_DIR, { recursive: true });
});

describe('softDeleteAsset', () => {
  it('copies to _deleted/ and deletes original', async () => {
    s3Mock.on(CopyObjectCommand).resolves({});
    s3Mock.on(DeleteObjectCommand).resolves({});

    const client = new S3Client({});
    await softDeleteAsset(
      'acme',
      'acme/01-brand-identity/logo.png',
      client,
      'test-bucket',
      TEST_AUDIT_LOG,
    );

    const copyCalls = s3Mock.commandCalls(CopyObjectCommand);
    expect(copyCalls).toHaveLength(1);
    expect(copyCalls[0].args[0].input.Key).toContain('acme/_deleted/');

    const deleteCalls = s3Mock.commandCalls(DeleteObjectCommand);
    expect(deleteCalls).toHaveLength(1);
    expect(deleteCalls[0].args[0].input.Key).toBe('acme/01-brand-identity/logo.png');
  });

  it('writes audit log entry', async () => {
    s3Mock.on(CopyObjectCommand).resolves({});
    s3Mock.on(DeleteObjectCommand).resolves({});

    const client = new S3Client({});
    await softDeleteAsset(
      'acme',
      'acme/01-brand-identity/logo.png',
      client,
      'bucket',
      TEST_AUDIT_LOG,
    );

    const content = readFileSync(TEST_AUDIT_LOG, 'utf-8').trim();
    const entry = JSON.parse(content) as AuditLogEntry;
    expect(entry.event).toBe('SOFT_DELETE');
    expect(entry.clientId).toBe('acme');
  });

  it('rejects deleting from _deleted/ prefix', async () => {
    const client = new S3Client({});
    await expect(
      softDeleteAsset('acme', 'acme/_deleted/old-file.png', client, 'bucket', TEST_AUDIT_LOG),
    ).rejects.toThrow('already-deleted');
  });

  it('rejects deleting from _backups/ prefix', async () => {
    const client = new S3Client({});
    await expect(
      softDeleteAsset(
        'acme',
        'acme/_backups/2026-01-01/file.png',
        client,
        'bucket',
        TEST_AUDIT_LOG,
      ),
    ).rejects.toThrow('backup');
  });

  it('rejects keys not belonging to client', async () => {
    const client = new S3Client({});
    await expect(
      softDeleteAsset(
        'acme',
        'other-client/01-brand-identity/logo.png',
        client,
        'bucket',
        TEST_AUDIT_LOG,
      ),
    ).rejects.toThrow('does not belong');
  });
});

describe('permanentDeleteAsset', () => {
  it('rejects keys not in _deleted/ prefix', async () => {
    const client = new S3Client({});
    await expect(
      permanentDeleteAsset(
        'acme',
        'acme/01-brand-identity/logo.png',
        client,
        'bucket',
        undefined,
        TEST_AUDIT_LOG,
      ),
    ).rejects.toThrow('_deleted/');
  });

  it('rejects keys not belonging to client', async () => {
    const client = new S3Client({});
    await expect(
      permanentDeleteAsset(
        'acme',
        'evil/_deleted/file.png',
        client,
        'bucket',
        undefined,
        TEST_AUDIT_LOG,
      ),
    ).rejects.toThrow('does not belong');
  });
});

describe('permanentDeleteClient', () => {
  it('deletes all objects under client prefix', async () => {
    s3Mock.on(ListObjectsV2Command).resolves({
      Contents: [{ Key: 'acme/01-brand-identity/logo.png' }, { Key: 'acme/_deleted/old.png' }],
    });
    s3Mock.on(DeleteObjectCommand).resolves({});

    const client = new S3Client({});
    await permanentDeleteClient('acme', client, 'bucket', 'admin', TEST_AUDIT_LOG);

    const deleteCalls = s3Mock.commandCalls(DeleteObjectCommand);
    expect(deleteCalls).toHaveLength(2);

    // Verify audit log
    const content = readFileSync(TEST_AUDIT_LOG, 'utf-8').trim();
    const entry = JSON.parse(content) as AuditLogEntry;
    expect(entry.event).toBe('PERMANENT_DELETE');
    expect(entry.details).toHaveProperty('scope', 'full-client');
    expect(entry.actorId).toBe('admin');
  });
});
