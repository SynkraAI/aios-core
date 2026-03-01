/**
 * End-to-End Live Test — Session Daemon with real Claude Agent SDK.
 *
 * This test:
 * 1. Writes an inbox file with a simple command
 * 2. Runs the daemon pipeline (InboxWatcher → CommandQueue → SessionAdapter → StreamProcessor → OutboxWriter)
 * 3. Verifies outbox response files appear with correct content
 *
 * REQUIRES: env -u CLAUDECODE (must not run inside Claude Code session)
 * REQUIRES: ANTHROPIC_API_KEY set
 *
 * Run: env -u CLAUDECODE -u CLAUDE_CODE_ENTRYPOINT node --test tests/e2e-live.test.js
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { mkdirSync, writeFileSync, readFileSync, readdirSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { InboxWatcher } from '../src/inbox-watcher.js';
import { OutboxWriter } from '../src/outbox-writer.js';
import { CommandQueue } from '../src/command-queue.js';
import { SessionAdapter } from '../src/session-adapter.js';
import { StreamProcessor } from '../src/stream-processor.js';
import { HealthMonitor } from '../src/health-monitor.js';
import { createInboxMessage } from '../src/schema-validator.js';

const TEST_DIR = '/tmp/aios-e2e-' + Date.now();
const BASE_DIR = join(TEST_DIR, '.aios');
const DAEMON_DIR = join(BASE_DIR, 'daemon');

// Use pino-like logger that actually logs for debugging
const logger = {
  info: (...args) => process.stderr.write(`[INFO] ${JSON.stringify(args)}\n`),
  warn: (...args) => process.stderr.write(`[WARN] ${JSON.stringify(args)}\n`),
  error: (...args) => process.stderr.write(`[ERROR] ${JSON.stringify(args)}\n`),
  debug: () => {},
  fatal: (...args) => process.stderr.write(`[FATAL] ${JSON.stringify(args)}\n`),
  child: () => logger,
};

before(() => {
  for (const sub of [
    '.aios/inbox/pending', '.aios/inbox/in_progress', '.aios/inbox/processed', '.aios/inbox/failed',
    '.aios/outbox/pending', '.aios/outbox/sent', '.aios/outbox/failed',
    '.aios/daemon',
  ]) {
    mkdirSync(join(TEST_DIR, sub), { recursive: true });
  }
});

after(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
});

describe('E2E Live Test', { timeout: 180000 }, () => {
  // Skip if running inside Claude Code (CLAUDECODE env var set)
  const isNested = !!process.env.CLAUDECODE;
  const skipMsg = isNested ? 'Cannot run inside Claude Code session (CLAUDECODE set)' : null;

  it('processes a command end-to-end via real SDK', { skip: skipMsg, timeout: 120000 }, async () => {
    // 1. Create components
    const outboxWriter = new OutboxWriter({ baseDir: BASE_DIR, logger });
    const commandQueue = new CommandQueue({
      maxSize: 10,
      maxRetries: 1,
      retryBackoffMs: [1000],
      stateDir: DAEMON_DIR,
      logger,
    });
    const sessionAdapter = new SessionAdapter({
      sessionConfig: {
        model: 'claude-sonnet-4-5-20250929',
        cwd: '/home/ubuntu/aios-core',
        settingSources: [],
        systemPrompt: 'You are a test assistant. Reply exactly what is asked. Do not use any tools.',
        permissionMode: 'bypassPermissions',
        includePartialMessages: true,
        maxTurns: 1,
      },
      stateDir: DAEMON_DIR,
      logger,
    });
    const streamProcessor = new StreamProcessor({
      outboxWriter,
      logger,
      progressThrottleMs: 0,
    });
    const healthMonitor = new HealthMonitor({
      stateDir: DAEMON_DIR,
      writeIntervalMs: 60000,
      logger,
    });

    // 2. Initialize session (will fallback to V1 since V2 is unstable)
    const sessionId = await sessionAdapter.initialize();
    process.stderr.write(`Session initialized: ${sessionId}\n`);
    healthMonitor.markReady();

    // 3. Create inbox message
    const inboxMsg = createInboxMessage({
      channel: 'cli',
      senderId: 'system',
      command: 'Reply with exactly: E2E_TEST_PASSED',
      messageId: `e2e-${Date.now()}`,
    });

    // 4. Write inbox file
    const filename = `${Date.now()}-cli-e2e.json`;
    writeFileSync(join(BASE_DIR, 'inbox', 'pending', filename), JSON.stringify(inboxMsg, null, 2));

    // 5. Simulate the daemon pipeline manually (without InboxWatcher for determinism)
    // Read and validate
    const inboxData = JSON.parse(readFileSync(join(BASE_DIR, 'inbox', 'pending', filename), 'utf8'));

    // Enqueue
    const enqueueResult = commandQueue.enqueue({
      filename,
      data: inboxData,
      path: join(BASE_DIR, 'inbox', 'in_progress', filename),
    });
    assert.strictEqual(enqueueResult.accepted, true);

    // 6. Process the command (intercept the 'process' event)
    const processPromise = new Promise((resolve, reject) => {
      commandQueue.on('process', async (cmd) => {
        healthMonitor.markBusy(cmd.id);

        try {
          // Write ACK
          outboxWriter.writeAck({
            inReplyTo: cmd.data.id,
            channel: 'cli',
          });

          streamProcessor.reset();

          const stream = sessionAdapter.sendCommand(cmd.data.command, {
            isRetry: false,
            retryCount: 0,
            commandId: cmd.id,
          });

          const result = await streamProcessor.process(stream, {
            commandId: cmd.data.id,
            channel: 'cli',
          });

          commandQueue.complete();
          healthMonitor.markIdle();
          resolve(result);
        } catch (err) {
          commandQueue.fail(err);
          healthMonitor.markCommandFailed(err);
          reject(err);
        }
      });
    });

    // 7. Wait for processing to complete
    const result = await processPromise;
    process.stderr.write(`Stream result: success=${result.success}, messages=${result.messageCount}\n`);

    // 8. Verify results
    assert.strictEqual(result.success, true, 'Stream processing should succeed');
    assert.ok(result.messageCount > 0, 'Should have received SDK messages');

    // 9. Check outbox files
    const outboxFiles = readdirSync(join(BASE_DIR, 'outbox', 'pending')).filter(f => f.endsWith('.json'));
    process.stderr.write(`Outbox files: ${outboxFiles.length}\n`);
    assert.ok(outboxFiles.length >= 2, 'Should have at least ACK + final response');

    // Find the final response
    let finalFound = false;
    for (const f of outboxFiles) {
      const data = JSON.parse(readFileSync(join(BASE_DIR, 'outbox', 'pending', f), 'utf8'));
      if (data.content.type === 'final') {
        finalFound = true;
        process.stderr.write(`Final response: ${data.content.message.slice(0, 200)}\n`);
        assert.ok(
          data.content.message.includes('E2E_TEST_PASSED'),
          `Final message should contain E2E_TEST_PASSED, got: ${data.content.message.slice(0, 100)}`
        );
      }
    }
    assert.ok(finalFound, 'Should have a final response in outbox');

    // 10. Verify health state
    healthMonitor.writeHealth();
    const health = JSON.parse(readFileSync(join(DAEMON_DIR, 'health.json'), 'utf8'));
    assert.strictEqual(health.state, 'READY');
    assert.strictEqual(health.commands_processed, 1);

    // 11. Verify session persisted
    assert.ok(existsSync(join(DAEMON_DIR, 'session.json')), 'Session metadata should be persisted');

    // Cleanup
    sessionAdapter.close();
    healthMonitor.stop();

    process.stderr.write('E2E test PASSED\n');
  });
});
