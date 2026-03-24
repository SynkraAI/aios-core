/**
 * Tests for audit log — SHA-256 checksum chain, append-only, verification.
 * Story: BSS-1.5 AC-6
 */

import { existsSync, mkdirSync, rmSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { appendAuditLog, verifyAuditLog } from '../audit-log';
import type { AuditLogEntry } from '../types';

const TEST_LOG_DIR = path.join('output', 'test-logs');
const TEST_LOG_PATH = path.join(TEST_LOG_DIR, 'audit-test.jsonl');

beforeEach(() => {
  if (existsSync(TEST_LOG_DIR)) {
    rmSync(TEST_LOG_DIR, { recursive: true });
  }
  mkdirSync(TEST_LOG_DIR, { recursive: true });
});

afterEach(() => {
  if (existsSync(TEST_LOG_DIR)) {
    rmSync(TEST_LOG_DIR, { recursive: true });
  }
});

describe('appendAuditLog', () => {
  it('creates log file and writes first entry with genesis checksum', () => {
    appendAuditLog('SOFT_DELETE', 'client-1', { r2Key: 'test/file.png' }, undefined, TEST_LOG_PATH);

    expect(existsSync(TEST_LOG_PATH)).toBe(true);
    const content = readFileSync(TEST_LOG_PATH, 'utf-8').trim();
    const entry = JSON.parse(content) as AuditLogEntry;

    expect(entry.event).toBe('SOFT_DELETE');
    expect(entry.clientId).toBe('client-1');
    expect(entry.previousChecksum).toBe('0'.repeat(64));
    expect(entry.checksum).toHaveLength(64);
  });

  it('appends multiple entries with correct checksum chain', () => {
    appendAuditLog('SOFT_DELETE', 'client-1', { key: 'a' }, undefined, TEST_LOG_PATH);
    appendAuditLog('PERMANENT_DELETE', 'client-1', { key: 'b' }, undefined, TEST_LOG_PATH);
    appendAuditLog('DATA_EXPORT', 'client-2', { key: 'c' }, undefined, TEST_LOG_PATH);

    const lines = readFileSync(TEST_LOG_PATH, 'utf-8').trim().split('\n');
    expect(lines).toHaveLength(3);

    const entry1 = JSON.parse(lines[0]) as AuditLogEntry;
    const entry2 = JSON.parse(lines[1]) as AuditLogEntry;
    const entry3 = JSON.parse(lines[2]) as AuditLogEntry;

    // Chain: entry1.checksum === entry2.previousChecksum
    expect(entry2.previousChecksum).toBe(entry1.checksum);
    expect(entry3.previousChecksum).toBe(entry2.checksum);
  });

  it('includes actorId when provided', () => {
    appendAuditLog('PERMANENT_DELETE', 'client-1', { key: 'x' }, 'admin', TEST_LOG_PATH);

    const content = readFileSync(TEST_LOG_PATH, 'utf-8').trim();
    const entry = JSON.parse(content) as AuditLogEntry;
    expect(entry.actorId).toBe('admin');
  });

  it('omits actorId when not provided', () => {
    appendAuditLog('DATA_EXPORT', 'client-1', {}, undefined, TEST_LOG_PATH);

    const content = readFileSync(TEST_LOG_PATH, 'utf-8').trim();
    const entry = JSON.parse(content) as AuditLogEntry;
    expect(entry.actorId).toBeUndefined();
  });
});

describe('verifyAuditLog', () => {
  it('returns valid=true for empty/non-existent log', () => {
    const result = verifyAuditLog(TEST_LOG_PATH);
    expect(result.valid).toBe(true);
    expect(result.entries).toBe(0);
  });

  it('returns valid=true for an intact chain', () => {
    appendAuditLog('SOFT_DELETE', 'c1', { key: 'a' }, undefined, TEST_LOG_PATH);
    appendAuditLog('PERMANENT_DELETE', 'c1', { key: 'b' }, undefined, TEST_LOG_PATH);
    appendAuditLog('DATA_EXPORT', 'c2', { key: 'c' }, undefined, TEST_LOG_PATH);

    const result = verifyAuditLog(TEST_LOG_PATH);
    expect(result.valid).toBe(true);
    expect(result.entries).toBe(3);
  });

  it('detects tampered entry (modified checksum)', () => {
    appendAuditLog('SOFT_DELETE', 'c1', { key: 'a' }, undefined, TEST_LOG_PATH);
    appendAuditLog('PERMANENT_DELETE', 'c1', { key: 'b' }, undefined, TEST_LOG_PATH);

    // Tamper with first entry
    const content = readFileSync(TEST_LOG_PATH, 'utf-8');
    const lines = content.trim().split('\n');
    const entry = JSON.parse(lines[0]) as AuditLogEntry;
    const tampered = { ...entry, details: { key: 'TAMPERED' } };
    lines[0] = JSON.stringify(tampered);
    const { writeFileSync } = require('node:fs');
    writeFileSync(TEST_LOG_PATH, lines.join('\n') + '\n', 'utf-8');

    const result = verifyAuditLog(TEST_LOG_PATH);
    expect(result.valid).toBe(false);
    expect(result.firstCorruptedAt).toBe(0);
  });

  it('detects broken chain (modified previousChecksum)', () => {
    appendAuditLog('SOFT_DELETE', 'c1', { key: 'a' }, undefined, TEST_LOG_PATH);
    appendAuditLog('PERMANENT_DELETE', 'c1', { key: 'b' }, undefined, TEST_LOG_PATH);

    // Break chain on second entry
    const content = readFileSync(TEST_LOG_PATH, 'utf-8');
    const lines = content.trim().split('\n');
    const entry = JSON.parse(lines[1]) as AuditLogEntry;
    const broken = { ...entry, previousChecksum: 'wrong' };
    lines[1] = JSON.stringify(broken);
    const { writeFileSync } = require('node:fs');
    writeFileSync(TEST_LOG_PATH, lines.join('\n') + '\n', 'utf-8');

    const result = verifyAuditLog(TEST_LOG_PATH);
    expect(result.valid).toBe(false);
    expect(result.firstCorruptedAt).toBe(1);
  });
});
