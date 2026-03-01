import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import { mkdirSync, writeFileSync, readFileSync, readdirSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { SessionAdapter } from '../src/session-adapter.js';
import { StreamProcessor } from '../src/stream-processor.js';
import { OutboxWriter } from '../src/outbox-writer.js';
import { createInboxMessage } from '../src/schema-validator.js';

const TEST_DIR = '/tmp/aios-test-s2-' + Date.now();
const DAEMON_DIR = join(TEST_DIR, 'daemon');

const silentLogger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
  fatal: () => {},
  child: () => silentLogger,
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
// SessionAdapter Tests (unit — no real SDK)
// ============================================================
describe('SessionAdapter', () => {
  it('initializes with default config', () => {
    const adapter = new SessionAdapter({
      sessionConfig: { model: 'claude-sonnet-4-5-20250929' },
      stateDir: DAEMON_DIR,
      logger: silentLogger,
    });

    assert.strictEqual(adapter.config.model, 'claude-sonnet-4-5-20250929');
    assert.strictEqual(adapter.config.permissionMode, 'bypassPermissions');
    assert.deepStrictEqual(adapter.config.settingSources, ['user', 'project', 'local']);
    assert.strictEqual(adapter.sessionId, null);
    assert.strictEqual(adapter.useV2, true);
  });

  it('falls back to V1 when V2 createSession fails', async () => {
    const adapter = new SessionAdapter({
      sessionConfig: {},
      stateDir: DAEMON_DIR,
      logger: silentLogger,
    });

    // V2 will fail because we're not actually running SDK
    const sessionId = await adapter.createSession();
    // Should fallback to V1 and return 'pending-v1'
    assert.strictEqual(sessionId, 'pending-v1');
    assert.strictEqual(adapter.useV2, false);
  });

  it('persists and loads session metadata', () => {
    const adapter = new SessionAdapter({
      sessionConfig: {},
      stateDir: DAEMON_DIR,
      logger: silentLogger,
    });

    adapter.sessionId = 'test-session-123';
    adapter.createdAt = '2026-01-01T00:00:00Z';
    adapter.resumeCount = 2;
    adapter.persistSessionMeta();

    // Verify file was written
    const meta = JSON.parse(readFileSync(join(DAEMON_DIR, 'session.json'), 'utf8'));
    assert.strictEqual(meta.session_id, 'test-session-123');
    assert.strictEqual(meta.resumed_count, 2);

    // Verify loadSessionId reads it back
    const loadedId = adapter.loadSessionId();
    assert.strictEqual(loadedId, 'test-session-123');
  });

  it('returns null when loading non-existent session', () => {
    const adapter = new SessionAdapter({
      sessionConfig: {},
      stateDir: join(TEST_DIR, 'nonexistent'),
      logger: silentLogger,
    });

    const id = adapter.loadSessionId();
    assert.strictEqual(id, null);
  });

  it('returns session info', () => {
    const adapter = new SessionAdapter({
      sessionConfig: { model: 'claude-opus-4-6' },
      stateDir: DAEMON_DIR,
      logger: silentLogger,
    });

    adapter.sessionId = 'info-test';
    adapter.createdAt = '2026-01-01';
    adapter.resumeCount = 1;

    const info = adapter.info();
    assert.strictEqual(info.sessionId, 'info-test');
    assert.strictEqual(info.model, 'claude-opus-4-6');
    assert.strictEqual(info.resumeCount, 1);
  });

  it('prepends retry context on retried commands', async () => {
    const adapter = new SessionAdapter({
      sessionConfig: {},
      stateDir: DAEMON_DIR,
      logger: silentLogger,
    });

    // Force V1 mode without real SDK — we'll test the prompt construction
    adapter.useV2 = false;
    adapter.sessionId = null;

    // Override sendV1 to capture the prompt
    let capturedPrompt = null;
    adapter.sendV1 = async function* (prompt) {
      capturedPrompt = prompt;
    };

    const gen = adapter.sendCommand('Fix bug', { isRetry: true, retryCount: 2, commandId: 'cmd-123' });
    // Consume the generator
    for await (const _ of gen) { /* no-op */ }

    assert.ok(capturedPrompt.includes('retry 2'));
    assert.ok(capturedPrompt.includes('cmd-123'));
    assert.ok(capturedPrompt.includes('Fix bug'));
  });
});

// ============================================================
// StreamProcessor Tests (with mock stream)
// ============================================================
describe('StreamProcessor', () => {
  let outbox;
  let processor;

  beforeEach(() => {
    // Clean outbox
    const pendingDir = join(TEST_DIR, 'outbox', 'pending');
    if (existsSync(pendingDir)) {
      for (const f of readdirSync(pendingDir)) {
        rmSync(join(pendingDir, f));
      }
    }

    outbox = new OutboxWriter({ baseDir: TEST_DIR, logger: silentLogger });
    processor = new StreamProcessor({
      outboxWriter: outbox,
      logger: silentLogger,
      progressThrottleMs: 0, // No throttling in tests
    });
  });

  /** Helper: create async generator from array */
  async function* mockStream(messages) {
    for (const msg of messages) {
      yield msg;
    }
  }

  it('processes a simple text result stream', async () => {
    const stream = mockStream([
      { type: 'system', subtype: 'init', session_id: 'sess-001' },
      { type: 'assistant', message: { content: [{ type: 'text', text: 'Working on it...' }] } },
      { type: 'result', subtype: 'success', result: 'Task completed.' },
    ]);

    const result = await processor.process(stream, {
      commandId: 'msg-1-0000',
      channel: 'cli',
      target: { sender_id: 'system' },
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.messageCount, 3);
    assert.strictEqual(result.finalText, 'Task completed.');

    // Check outbox files were written
    const outboxFiles = readdirSync(join(TEST_DIR, 'outbox', 'pending'));
    assert.ok(outboxFiles.length >= 2); // at least progress + final
  });

  it('detects agent switches from @agent pattern', async () => {
    const switches = [];
    processor.on('agent_switch', (e) => switches.push(e));

    const stream = mockStream([
      { type: 'assistant', message: { content: [{ type: 'text', text: 'Delegating to @dev for this task.' }] } },
      { type: 'assistant', message: { content: [{ type: 'text', text: 'Investigating the issue...' }] } },
      { type: 'assistant', message: { content: [{ type: 'text', text: 'Handing off to @qa for review.' }] } },
      { type: 'result', subtype: 'success', result: 'Done' },
    ]);

    await processor.process(stream, {
      commandId: 'msg-2-0000',
      channel: 'cli',
    });

    assert.strictEqual(switches.length, 2);
    assert.strictEqual(switches[0].from, 'aios-master');
    assert.strictEqual(switches[0].to, 'dev');
    assert.strictEqual(switches[1].from, 'dev');
    assert.strictEqual(switches[1].to, 'qa');
  });

  it('detects agent switches from persona greetings', async () => {
    const switches = [];
    processor.on('agent_switch', (e) => switches.push(e));

    const stream = mockStream([
      { type: 'assistant', message: { content: [{ type: 'text', text: "I'm Dex, the Dev agent. Let me look at this." }] } },
      { type: 'result', subtype: 'success', result: 'Done' },
    ]);

    await processor.process(stream, {
      commandId: 'msg-3-0000',
      channel: 'cli',
    });

    assert.strictEqual(switches.length, 1);
    assert.strictEqual(switches[0].to, 'dev');
  });

  it('handles tool_use blocks', async () => {
    const tools = [];
    processor.on('tool_use', (e) => tools.push(e));

    const stream = mockStream([
      {
        type: 'assistant',
        message: {
          content: [
            { type: 'tool_use', name: 'Grep', input: { pattern: 'authenticate', path: 'src/' } },
          ],
        },
      },
      {
        type: 'assistant',
        message: {
          content: [
            { type: 'tool_use', name: 'Edit', input: { file_path: 'src/auth.ts' } },
          ],
        },
      },
      { type: 'result', subtype: 'success', result: 'Fixed' },
    ]);

    await processor.process(stream, {
      commandId: 'msg-4-0000',
      channel: 'telegram',
    });

    assert.strictEqual(tools.length, 2);
    assert.strictEqual(tools[0].tool, 'Grep');
    assert.strictEqual(tools[1].tool, 'Edit');

    // Check tool_use outbox messages
    const outboxFiles = readdirSync(join(TEST_DIR, 'outbox', 'pending'));
    const toolFiles = outboxFiles.filter((f) => {
      const data = JSON.parse(readFileSync(join(TEST_DIR, 'outbox', 'pending', f), 'utf8'));
      return data.content.type === 'tool_use';
    });
    assert.strictEqual(toolFiles.length, 2);
  });

  it('handles error results', async () => {
    const stream = mockStream([
      { type: 'result', subtype: 'error', error: { message: 'Context limit exceeded' } },
    ]);

    const result = await processor.process(stream, {
      commandId: 'msg-5-0000',
      channel: 'whatsapp',
    });

    assert.strictEqual(result.success, false);

    // Check error outbox message
    const outboxFiles = readdirSync(join(TEST_DIR, 'outbox', 'pending'));
    const errorFile = outboxFiles.find((f) => {
      const data = JSON.parse(readFileSync(join(TEST_DIR, 'outbox', 'pending', f), 'utf8'));
      return data.content.type === 'error';
    });
    assert.ok(errorFile);
  });

  it('handles stream errors gracefully', async () => {
    async function* failingStream() {
      yield { type: 'assistant', message: { content: [{ type: 'text', text: 'Starting...' }] } };
      throw new Error('Connection lost');
    }

    const result = await processor.process(failingStream(), {
      commandId: 'msg-6-0000',
      channel: 'cli',
    });

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.finalText, null);
  });

  it('throttles progress messages', async () => {
    const throttledProcessor = new StreamProcessor({
      outboxWriter: outbox,
      logger: silentLogger,
      progressThrottleMs: 100000, // Very high — effectively blocks all but first
    });

    const stream = mockStream([
      { type: 'assistant', message: { content: [{ type: 'text', text: 'Message 1' }] } },
      { type: 'assistant', message: { content: [{ type: 'text', text: 'Message 2' }] } },
      { type: 'assistant', message: { content: [{ type: 'text', text: 'Message 3' }] } },
      { type: 'result', subtype: 'success', result: 'Done' },
    ]);

    await throttledProcessor.process(stream, {
      commandId: 'msg-7-0000',
      channel: 'cli',
    });

    // Only 1 progress + 1 final should be written (throttle blocks msg 2 & 3 progress)
    const outboxFiles = readdirSync(join(TEST_DIR, 'outbox', 'pending'));
    const progressFiles = outboxFiles.filter((f) => {
      const data = JSON.parse(readFileSync(join(TEST_DIR, 'outbox', 'pending', f), 'utf8'));
      return data.content.type === 'progress';
    });
    assert.strictEqual(progressFiles.length, 1);
  });

  it('summarizes tool inputs correctly', () => {
    assert.strictEqual(
      processor.summarizeToolInput('Read', { file_path: '/src/auth.ts' }),
      'Reading /src/auth.ts'
    );
    assert.strictEqual(
      processor.summarizeToolInput('Bash', { command: 'npm test' }),
      'Running: npm test'
    );
    assert.strictEqual(
      processor.summarizeToolInput('Grep', { pattern: 'TODO', path: 'src/' }),
      'Searching for "TODO" in src/'
    );
    assert.strictEqual(
      processor.summarizeToolInput('Glob', { pattern: '**/*.ts' }),
      'Finding files: **/*.ts'
    );
    assert.ok(
      processor.summarizeToolInput('Task', { subagent_type: 'Explore', description: 'Find auth files' })
        .includes('Explore')
    );
  });

  it('resets state between commands', () => {
    processor.currentAgent = 'dev';
    processor.lastProgressAt = 999999;
    processor.messageCount = 42;

    processor.reset();

    assert.strictEqual(processor.currentAgent, 'aios-master');
    assert.strictEqual(processor.lastProgressAt, 0);
    assert.strictEqual(processor.messageCount, 0);
  });
});
