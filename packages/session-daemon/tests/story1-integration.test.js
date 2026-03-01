import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import { mkdirSync, writeFileSync, readFileSync, readdirSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { InboxWatcher } from '../src/inbox-watcher.js';
import { OutboxWriter } from '../src/outbox-writer.js';
import { CommandQueue } from '../src/command-queue.js';
import { validateInboxMessage, validateOutboxMessage, createInboxMessage, createOutboxMessage } from '../src/schema-validator.js';

const TEST_DIR = '/tmp/aios-test-' + Date.now();
const INBOX_DIR = join(TEST_DIR, 'inbox');
const OUTBOX_DIR = join(TEST_DIR, 'outbox');
const DAEMON_DIR = join(TEST_DIR, 'daemon');

const silentLogger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
};

before(() => {
  for (const sub of ['inbox/pending', 'inbox/in_progress', 'inbox/processed', 'inbox/failed', 'outbox/pending', 'outbox/sent', 'outbox/failed', 'daemon']) {
    mkdirSync(join(TEST_DIR, sub), { recursive: true });
  }
});

after(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
});

// ============================================================
// Schema Validator Tests
// ============================================================
describe('Schema Validator', () => {
  it('validates a correct inbox message', () => {
    const msg = createInboxMessage({
      channel: 'telegram',
      senderId: '123456',
      senderName: 'Lucas',
      command: 'Fix the auth bug',
      messageId: 'tg-12345',
    });
    const result = validateInboxMessage(msg);
    assert.strictEqual(result.valid, true, `Errors: ${result.errors.join(', ')}`);
  });

  it('rejects inbox message with missing command', () => {
    const msg = {
      schema_version: '2.0',
      id: 'msg-1234567890-abcd',
      timestamp: new Date().toISOString(),
      source: { channel: 'telegram', sender_id: '123' },
      priority: 'normal',
      status: 'pending',
    };
    const result = validateInboxMessage(msg);
    assert.strictEqual(result.valid, false);
  });

  it('rejects inbox message with invalid channel', () => {
    const msg = createInboxMessage({
      channel: 'discord',
      senderId: '123',
      command: 'test',
    });
    const result = validateInboxMessage(msg);
    assert.strictEqual(result.valid, false);
  });

  it('validates a correct outbox message', () => {
    const msg = createOutboxMessage({
      inReplyTo: 'msg-1234567890-abcd',
      channel: 'telegram',
      contentType: 'final',
      message: 'Task completed.',
      agent: 'aios-master',
    });
    const result = validateOutboxMessage(msg);
    assert.strictEqual(result.valid, true, `Errors: ${result.errors.join(', ')}`);
  });

  it('rejects outbox message with invalid content type', () => {
    const msg = createOutboxMessage({
      inReplyTo: 'msg-123',
      channel: 'telegram',
      contentType: 'invalid_type',
      message: 'test',
    });
    const result = validateOutboxMessage(msg);
    assert.strictEqual(result.valid, false);
  });
});

// ============================================================
// InboxWatcher Tests
// ============================================================
describe('InboxWatcher', () => {
  let watcher;

  beforeEach(() => {
    // Clean pending dir
    for (const f of readdirSync(join(TEST_DIR, 'inbox', 'pending'))) {
      rmSync(join(TEST_DIR, 'inbox', 'pending', f));
    }
    for (const f of readdirSync(join(TEST_DIR, 'inbox', 'in_progress'))) {
      rmSync(join(TEST_DIR, 'inbox', 'in_progress', f));
    }
    for (const f of readdirSync(join(TEST_DIR, 'inbox', 'failed'))) {
      rmSync(join(TEST_DIR, 'inbox', 'failed', f));
    }
  });

  after(() => {
    if (watcher) watcher.stop();
  });

  it('picks up a valid inbox file and emits command event', async () => {
    watcher = new InboxWatcher({
      baseDir: TEST_DIR,
      pollIntervalMs: 60000,
      allowedSenders: [{ channel: 'cli', sender_id: 'system' }],
      rejectUnknown: true,
      logger: silentLogger,
    });

    const msg = createInboxMessage({
      channel: 'cli',
      senderId: 'system',
      command: 'What is the project status?',
      messageId: 'test-001',
    });

    const filename = `${Date.now()}-cli-0001.json`;
    writeFileSync(join(TEST_DIR, 'inbox', 'pending', filename), JSON.stringify(msg));

    const commandPromise = new Promise((resolve) => {
      watcher.on('command', resolve);
    });

    await watcher.scan();

    const event = await commandPromise;
    assert.strictEqual(event.data.command, 'What is the project status?');
    assert.strictEqual(event.filename, filename);

    // File should be in in_progress
    assert.ok(existsSync(join(TEST_DIR, 'inbox', 'in_progress', filename)));
    assert.ok(!existsSync(join(TEST_DIR, 'inbox', 'pending', filename)));
  });

  it('rejects invalid JSON files', async () => {
    watcher = new InboxWatcher({
      baseDir: TEST_DIR,
      pollIntervalMs: 60000,
      logger: silentLogger,
    });

    const filename = 'bad-file.json';
    writeFileSync(join(TEST_DIR, 'inbox', 'pending', filename), 'not json{{{');

    await watcher.scan();

    // File should be in failed
    const failed = readdirSync(join(TEST_DIR, 'inbox', 'failed'));
    assert.ok(failed.some((f) => f.includes(filename)));
  });

  it('rejects unauthorized senders', async () => {
    watcher = new InboxWatcher({
      baseDir: TEST_DIR,
      pollIntervalMs: 60000,
      allowedSenders: [{ channel: 'telegram', sender_id: '999' }],
      rejectUnknown: true,
      logger: silentLogger,
    });

    const msg = createInboxMessage({
      channel: 'cli',
      senderId: 'hacker',
      command: 'delete everything',
      messageId: 'hack-001',
    });

    const filename = 'hack.json';
    writeFileSync(join(TEST_DIR, 'inbox', 'pending', filename), JSON.stringify(msg));

    await watcher.scan();

    const failed = readdirSync(join(TEST_DIR, 'inbox', 'failed'));
    assert.ok(failed.some((f) => f.includes('unauthorized')));
  });

  it('deduplicates messages with same message_id', async () => {
    watcher = new InboxWatcher({
      baseDir: TEST_DIR,
      pollIntervalMs: 60000,
      logger: silentLogger,
    });

    const msg = createInboxMessage({
      channel: 'cli',
      senderId: 'system',
      command: 'test',
      messageId: 'dedup-test-001',
    });

    // Write first copy
    const f1 = 'first.json';
    writeFileSync(join(TEST_DIR, 'inbox', 'pending', f1), JSON.stringify(msg));
    let emitted = 0;
    watcher.on('command', () => emitted++);
    await watcher.scan();
    assert.strictEqual(emitted, 1);

    // Write second copy with same message_id
    const f2 = 'second.json';
    writeFileSync(join(TEST_DIR, 'inbox', 'pending', f2), JSON.stringify(msg));
    await watcher.scan();
    assert.strictEqual(emitted, 1); // Should not increase
  });

  it('recovers orphaned files from in_progress on startup', () => {
    const orphan = 'orphan.json';
    const msg = createInboxMessage({ channel: 'cli', senderId: 'system', command: 'orphan test' });
    writeFileSync(join(TEST_DIR, 'inbox', 'in_progress', orphan), JSON.stringify(msg));

    watcher = new InboxWatcher({
      baseDir: TEST_DIR,
      pollIntervalMs: 60000,
      logger: silentLogger,
    });
    watcher.ensureDirs();
    watcher.recoverOrphans();

    assert.ok(existsSync(join(TEST_DIR, 'inbox', 'pending', orphan)));
    assert.ok(!existsSync(join(TEST_DIR, 'inbox', 'in_progress', orphan)));
  });
});

// ============================================================
// OutboxWriter Tests
// ============================================================
describe('OutboxWriter', () => {
  it('writes a valid outbox file with millisecond timestamp', () => {
    const writer = new OutboxWriter({ baseDir: TEST_DIR, logger: silentLogger });

    const filename = writer.writeFinal({
      inReplyTo: 'msg-1234567890-abcd',
      channel: 'telegram',
      target: { sender_id: '123' },
      message: 'Task completed successfully.',
      agent: 'aios-master',
    });

    assert.ok(filename);
    assert.ok(filename.startsWith('reply-'));
    assert.ok(filename.includes('telegram'));

    // Verify the file is valid JSON and passes schema
    const filepath = join(TEST_DIR, 'outbox', 'pending', filename);
    const data = JSON.parse(readFileSync(filepath, 'utf8'));
    assert.strictEqual(data.content.type, 'final');
    assert.strictEqual(data.channel, 'telegram');

    const validation = validateOutboxMessage(data);
    assert.strictEqual(validation.valid, true, `Errors: ${validation.errors.join(', ')}`);
  });

  it('writes all content types correctly', () => {
    const writer = new OutboxWriter({ baseDir: TEST_DIR, logger: silentLogger });
    const base = { inReplyTo: 'msg-1-0000', channel: 'cli', target: { sender_id: 'system' } };

    assert.ok(writer.writeAck(base));
    assert.ok(writer.writeProgress({ ...base, message: 'Working...', agent: 'dev' }));
    assert.ok(writer.writeAgentSwitch({ ...base, fromAgent: 'master', toAgent: 'dev' }));
    assert.ok(writer.writeToolUse({ ...base, agent: 'dev', tool: 'Edit', summary: 'Editing auth.ts' }));
    assert.ok(writer.writeError({ ...base, message: 'Something failed', agent: 'dev' }));
    assert.ok(writer.writeFinal({ ...base, message: 'Done', agent: 'master' }));
  });
});

// ============================================================
// CommandQueue Tests
// ============================================================
describe('CommandQueue', () => {
  it('processes commands in FIFO order', async () => {
    const queue = new CommandQueue({
      maxSize: 10,
      maxRetries: 3,
      retryBackoffMs: [10, 20, 30],
      stateDir: DAEMON_DIR,
      logger: silentLogger,
    });

    const order = [];
    queue.on('process', (cmd) => {
      order.push(cmd.id);
      // Simulate async processing, then complete
      setTimeout(() => queue.complete(), 10);
    });

    const msg1 = createInboxMessage({ channel: 'cli', senderId: 'system', command: 'first' });
    const msg2 = createInboxMessage({ channel: 'cli', senderId: 'system', command: 'second' });
    const msg3 = createInboxMessage({ channel: 'cli', senderId: 'system', command: 'third' });

    queue.enqueue({ filename: 'f1.json', data: msg1, path: '/tmp/f1' });
    queue.enqueue({ filename: 'f2.json', data: msg2, path: '/tmp/f2' });
    queue.enqueue({ filename: 'f3.json', data: msg3, path: '/tmp/f3' });

    // Wait for all to process
    await new Promise((resolve) => setTimeout(resolve, 200));

    assert.strictEqual(order[0], msg1.id);
    assert.strictEqual(order[1], msg2.id);
    assert.strictEqual(order[2], msg3.id);
  });

  it('rejects commands when queue is full', () => {
    const queue = new CommandQueue({
      maxSize: 2,
      stateDir: DAEMON_DIR,
      logger: silentLogger,
    });

    // Don't process — just enqueue
    queue.on('process', () => {}); // no-op

    const msg = () => createInboxMessage({ channel: 'cli', senderId: 'system', command: 'test' });
    assert.strictEqual(queue.enqueue({ filename: 'f1.json', data: msg(), path: '/tmp' }).accepted, true);

    // First is being processed, so queue has 0 pending but 1 in process
    // Let's fill it without processing
    queue.processing = true; // simulate busy
    assert.strictEqual(queue.enqueue({ filename: 'f2.json', data: msg(), path: '/tmp' }).accepted, true);
    assert.strictEqual(queue.enqueue({ filename: 'f3.json', data: msg(), path: '/tmp' }).accepted, true);
    assert.strictEqual(queue.enqueue({ filename: 'f4.json', data: msg(), path: '/tmp' }).accepted, false);
  });

  it('retries failed commands with backoff', async () => {
    const queue = new CommandQueue({
      maxSize: 10,
      maxRetries: 2,
      retryBackoffMs: [10, 20],
      stateDir: DAEMON_DIR,
      logger: silentLogger,
    });

    let attempts = 0;
    queue.on('process', () => {
      attempts++;
      queue.fail(new Error('test error'));
    });

    const msg = createInboxMessage({ channel: 'cli', senderId: 'system', command: 'will fail' });
    queue.enqueue({ filename: 'fail.json', data: msg, path: '/tmp/fail' });

    // Wait for retries
    await new Promise((resolve) => setTimeout(resolve, 300));

    // 1 initial + 2 retries = 3 attempts
    assert.strictEqual(attempts, 3);
  });

  it('persists and restores state', () => {
    const queue1 = new CommandQueue({
      maxSize: 10,
      stateDir: DAEMON_DIR,
      logger: silentLogger,
    });

    queue1.on('process', () => {}); // don't auto-complete
    const msg = createInboxMessage({ channel: 'cli', senderId: 'system', command: 'persist test' });
    queue1.enqueue({ filename: 'persist.json', data: msg, path: '/tmp/persist' });

    // State should be persisted
    assert.ok(existsSync(join(DAEMON_DIR, 'queue.json')));

    // New queue should restore
    const queue2 = new CommandQueue({
      maxSize: 10,
      stateDir: DAEMON_DIR,
      logger: silentLogger,
    });
    queue2.restore();
    assert.strictEqual(queue2.pending.length, 1);
  });

  it('reports correct stats', () => {
    const queue = new CommandQueue({
      maxSize: 10,
      stateDir: DAEMON_DIR,
      logger: silentLogger,
    });
    const stats = queue.stats();
    assert.strictEqual(typeof stats.pending, 'number');
    assert.strictEqual(typeof stats.in_progress, 'number');
    assert.strictEqual(typeof stats.total_processed, 'number');
    assert.strictEqual(typeof stats.total_failed, 'number');
    assert.strictEqual(typeof stats.paused, 'boolean');
  });
});
