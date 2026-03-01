import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, rm, mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { OutboxWatcher } from '../src/outbox-watcher.js';

const noopLogger = {
  info: () => {}, warn: () => {}, error: () => {}, debug: () => {}, fatal: () => {},
};

describe('OutboxWatcher', () => {
  let testDir;
  let watcher;

  beforeEach(async () => {
    testDir = join(tmpdir(), `aios-outbox-test-${Date.now()}`);
    await mkdir(join(testDir, '.aios', 'outbox', 'pending'), { recursive: true });
    watcher = new OutboxWatcher(testDir, noopLogger);
  });

  afterEach(async () => {
    await watcher.stop();
    await rm(testDir, { recursive: true, force: true });
  });

  describe('_processFile()', () => {
    it('emits message event for valid outbox JSON', async () => {
      await watcher.ensureDirs();
      const filePath = join(watcher.pendingDir, 'test-valid.json');
      const msg = {
        schema_version: '2.0',
        id: 'reply-123-abcd',
        in_reply_to: 'msg-123-0000',
        timestamp: new Date().toISOString(),
        channel: 'telegram',
        content: { type: 'progress', message: 'Hello' },
        status: 'pending',
      };
      await writeFile(filePath, JSON.stringify(msg));

      const received = [];
      watcher.on('message', (m) => received.push(m));
      await watcher._processFile(filePath);

      assert.equal(received.length, 1);
      assert.equal(received[0].content.message, 'Hello');
    });

    it('moves valid messages to sent/', async () => {
      await watcher.ensureDirs();
      const filePath = join(watcher.pendingDir, 'test-move.json');
      await writeFile(filePath, JSON.stringify({
        schema_version: '2.0', id: 'reply-1', in_reply_to: 'msg-1',
        timestamp: new Date().toISOString(), channel: 'telegram',
        content: { type: 'ack', message: 'ok' }, status: 'pending',
      }));

      await watcher._processFile(filePath);
      const sentFiles = await readdir(watcher.sentDir);
      assert.ok(sentFiles.includes('test-move.json'));
    });

    it('moves invalid JSON to failed/', async () => {
      await watcher.ensureDirs();
      const filePath = join(watcher.pendingDir, 'test-bad.json');
      await writeFile(filePath, 'not json at all');

      await watcher._processFile(filePath);
      const failedFiles = await readdir(watcher.failedDir);
      assert.ok(failedFiles.includes('test-bad.json'));
    });

    it('moves messages with missing required fields to failed/', async () => {
      await watcher.ensureDirs();
      const filePath = join(watcher.pendingDir, 'test-missing.json');
      await writeFile(filePath, JSON.stringify({ foo: 'bar' }));

      await watcher._processFile(filePath);
      const failedFiles = await readdir(watcher.failedDir);
      assert.ok(failedFiles.includes('test-missing.json'));
    });

    it('skips non-telegram channel messages', async () => {
      await watcher.ensureDirs();
      const filePath = join(watcher.pendingDir, 'test-whatsapp.json');
      await writeFile(filePath, JSON.stringify({
        schema_version: '2.0', id: 'reply-2', in_reply_to: 'msg-2',
        timestamp: new Date().toISOString(), channel: 'whatsapp',
        content: { type: 'progress', message: 'wa msg' }, status: 'pending',
      }));

      const received = [];
      watcher.on('message', (m) => received.push(m));
      await watcher._processFile(filePath);

      assert.equal(received.length, 0);
      const sentFiles = await readdir(watcher.sentDir);
      assert.ok(sentFiles.includes('test-whatsapp.json'));
    });

    it('increments processedCount and failedCount', async () => {
      await watcher.ensureDirs();

      const validPath = join(watcher.pendingDir, 'count-valid.json');
      await writeFile(validPath, JSON.stringify({
        schema_version: '2.0', id: 'r1', in_reply_to: 'm1',
        timestamp: new Date().toISOString(), channel: 'telegram',
        content: { type: 'ack', message: 'ok' }, status: 'pending',
      }));
      await watcher._processFile(validPath);

      const badPath = join(watcher.pendingDir, 'count-bad.json');
      await writeFile(badPath, 'invalid');
      await watcher._processFile(badPath);

      const stats = watcher.getStats();
      assert.equal(stats.processedCount, 1);
      assert.equal(stats.failedCount, 1);
    });
  });

  describe('_processExisting()', () => {
    it('processes files already in pending/ on startup', async () => {
      await watcher.ensureDirs();
      await writeFile(join(watcher.pendingDir, 'existing.json'), JSON.stringify({
        schema_version: '2.0', id: 'r-exist', in_reply_to: 'm-exist',
        timestamp: new Date().toISOString(), channel: 'telegram',
        content: { type: 'final', message: 'Recovered' }, status: 'pending',
      }));

      const received = [];
      watcher.on('message', (m) => received.push(m));
      await watcher._processExisting();

      assert.equal(received.length, 1);
      assert.equal(received[0].content.message, 'Recovered');
    });
  });

  describe('cleanup()', () => {
    it('removes old files from sent/', async () => {
      await watcher.ensureDirs();
      const filePath = join(watcher.sentDir, 'old-file.json');
      await writeFile(filePath, '{}');
      // Manually set mtime to 2 days ago
      const { utimes } = await import('node:fs/promises');
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      await utimes(filePath, twoDaysAgo, twoDaysAgo);

      const cleaned = await watcher.cleanup();
      assert.ok(cleaned >= 1);
    });
  });
});
