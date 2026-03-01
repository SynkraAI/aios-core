import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, rm, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { InboxWriter } from '../src/inbox-writer.js';

const noopLogger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
};

describe('InboxWriter', () => {
  let testDir;
  let writer;

  beforeEach(async () => {
    testDir = join(tmpdir(), `aios-inbox-test-${Date.now()}`);
    await mkdir(testDir, { recursive: true });
    writer = new InboxWriter(testDir, noopLogger);
    // Override inbox dir to point to test directory
    writer.inboxDir = join(testDir, 'pending');
    await writer.ensureDir();
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  describe('write()', () => {
    it('creates a JSON file in the pending directory', async () => {
      const id = await writer.write({
        command: 'npm test',
        senderId: '123456',
      });

      const filePath = join(writer.inboxDir, `${id}.json`);
      const raw = await readFile(filePath, 'utf8');
      const message = JSON.parse(raw);

      assert.ok(message);
      assert.equal(message.command, 'npm test');
    });

    it('generates valid message IDs', async () => {
      const id = await writer.write({
        command: 'test',
        senderId: '123',
      });
      assert.match(id, /^msg-\d+-[a-f0-9]{4}$/);
    });

    it('sets schema_version to 2.0', async () => {
      const id = await writer.write({
        command: 'test',
        senderId: '123',
      });

      const filePath = join(writer.inboxDir, `${id}.json`);
      const message = JSON.parse(await readFile(filePath, 'utf8'));
      assert.equal(message.schema_version, '2.0');
    });

    it('sets source channel to telegram', async () => {
      const id = await writer.write({
        command: 'test',
        senderId: '123',
      });

      const filePath = join(writer.inboxDir, `${id}.json`);
      const message = JSON.parse(await readFile(filePath, 'utf8'));
      assert.equal(message.source.channel, 'telegram');
      assert.equal(message.source.sender_id, '123');
    });

    it('sets reply_to channel to telegram', async () => {
      const id = await writer.write({
        command: 'test',
        senderId: '456',
      });

      const filePath = join(writer.inboxDir, `${id}.json`);
      const message = JSON.parse(await readFile(filePath, 'utf8'));
      assert.equal(message.reply_to.channel, 'telegram');
      assert.equal(message.reply_to.target, '456');
    });

    it('sets status to pending', async () => {
      const id = await writer.write({
        command: 'test',
        senderId: '123',
      });

      const filePath = join(writer.inboxDir, `${id}.json`);
      const message = JSON.parse(await readFile(filePath, 'utf8'));
      assert.equal(message.status, 'pending');
    });

    it('sets priority (default normal)', async () => {
      const id = await writer.write({
        command: 'test',
        senderId: '123',
      });

      const filePath = join(writer.inboxDir, `${id}.json`);
      const message = JSON.parse(await readFile(filePath, 'utf8'));
      assert.equal(message.priority, 'normal');
    });

    it('accepts custom priority', async () => {
      const id = await writer.write({
        command: 'urgent fix',
        senderId: '123',
        priority: 'critical',
      });

      const filePath = join(writer.inboxDir, `${id}.json`);
      const message = JSON.parse(await readFile(filePath, 'utf8'));
      assert.equal(message.priority, 'critical');
    });

    it('includes optional sender_name and message_id', async () => {
      const id = await writer.write({
        command: 'test',
        senderId: '123',
        senderName: 'lucas',
        messageId: 'msg-42',
      });

      const filePath = join(writer.inboxDir, `${id}.json`);
      const message = JSON.parse(await readFile(filePath, 'utf8'));
      assert.equal(message.source.sender_name, 'lucas');
      assert.equal(message.source.message_id, 'msg-42');
    });

    it('has valid ISO timestamp', async () => {
      const id = await writer.write({
        command: 'test',
        senderId: '123',
      });

      const filePath = join(writer.inboxDir, `${id}.json`);
      const message = JSON.parse(await readFile(filePath, 'utf8'));
      const date = new Date(message.timestamp);
      assert.ok(!isNaN(date.getTime()), 'Timestamp should be valid ISO date');
    });
  });
});
