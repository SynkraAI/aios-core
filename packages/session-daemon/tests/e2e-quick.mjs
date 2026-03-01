#!/usr/bin/env node
/**
 * Quick E2E test — runs the full daemon pipeline once with real SDK.
 * Run: env -u CLAUDECODE -u CLAUDE_CODE_ENTRYPOINT node tests/e2e-quick.mjs
 */

import { writeFileSync, readFileSync, readdirSync, mkdirSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { SessionAdapter } from '../src/session-adapter.js';
import { StreamProcessor } from '../src/stream-processor.js';
import { OutboxWriter } from '../src/outbox-writer.js';
import { HealthMonitor } from '../src/health-monitor.js';
import { createInboxMessage } from '../src/schema-validator.js';

const TEST_DIR = '/tmp/aios-e2e-quick-' + Date.now();
const BASE_DIR = join(TEST_DIR, '.aios');
const DAEMON_DIR = join(BASE_DIR, 'daemon');

const log = (msg) => process.stderr.write(`[E2E] ${msg}\n`);

// Create dirs
for (const sub of ['.aios/outbox/pending', '.aios/daemon']) {
  mkdirSync(join(TEST_DIR, sub), { recursive: true });
}

const logger = {
  info: (o, m) => log(m || JSON.stringify(o)),
  warn: (o, m) => log(`WARN: ${m || JSON.stringify(o)}`),
  error: (o, m) => log(`ERROR: ${m || JSON.stringify(o)}`),
  debug: () => {},
  child: () => logger,
};

try {
  log('1. Creating components...');
  const outbox = new OutboxWriter({ baseDir: BASE_DIR, logger });
  const session = new SessionAdapter({
    sessionConfig: {
      model: 'claude-sonnet-4-5-20250929',
      cwd: '/home/ubuntu/aios-core',
      settingSources: [],
      systemPrompt: 'Reply exactly what is asked. Do not use tools. Be very brief.',
      permissionMode: 'bypassPermissions',
      includePartialMessages: true,
      maxTurns: 1,
    },
    stateDir: DAEMON_DIR,
    logger,
  });
  const stream = new StreamProcessor({ outboxWriter: outbox, logger, progressThrottleMs: 0 });
  const health = new HealthMonitor({ stateDir: DAEMON_DIR, writeIntervalMs: 60000, logger });

  log('2. Initializing session...');
  const sid = await session.initialize();
  log(`   Session: ${sid}`);
  health.markReady();

  log('3. Sending command...');
  health.markBusy('e2e-test');
  stream.reset();

  const cmdStream = session.sendCommand('Reply with exactly: E2E_PASS_OK');
  const result = await stream.process(cmdStream, {
    commandId: 'e2e-cmd-001',
    channel: 'cli',
  });

  health.markIdle();
  log(`4. Result: success=${result.success}, messages=${result.messageCount}`);
  log(`   Final text: ${(result.finalText || '').slice(0, 200)}`);

  // Check outbox
  const outboxFiles = readdirSync(join(BASE_DIR, 'outbox', 'pending')).filter(f => f.endsWith('.json'));
  log(`5. Outbox files: ${outboxFiles.length}`);

  let finalMsg = null;
  for (const f of outboxFiles) {
    const data = JSON.parse(readFileSync(join(BASE_DIR, 'outbox', 'pending', f), 'utf8'));
    log(`   - ${f}: type=${data.content.type}`);
    if (data.content.type === 'final') {
      finalMsg = data.content.message;
    }
  }

  // Write health
  health.writeHealth();
  const healthData = JSON.parse(readFileSync(join(DAEMON_DIR, 'health.json'), 'utf8'));
  log(`6. Health: state=${healthData.state}, processed=${healthData.commands_processed}`);

  // Assertions
  const passed = [];
  const failed = [];

  const check = (name, condition) => {
    if (condition) { passed.push(name); log(`   ✓ ${name}`); }
    else { failed.push(name); log(`   ✗ ${name}`); }
  };

  log('7. Assertions:');
  check('Stream success', result.success === true);
  check('Messages received', result.messageCount > 0);
  check('Outbox has files', outboxFiles.length >= 1);
  check('Final response exists', !!finalMsg);
  check('Final contains E2E_PASS_OK', finalMsg && finalMsg.includes('E2E_PASS_OK'));
  check('Health is READY', healthData.state === 'READY');
  check('Commands processed = 1', healthData.commands_processed === 1);
  check('Session persisted', existsSync(join(DAEMON_DIR, 'session.json')));

  session.close();
  health.stop();

  log(`\n========================================`);
  log(`Results: ${passed.length} passed, ${failed.length} failed`);
  if (failed.length > 0) {
    log(`FAILED: ${failed.join(', ')}`);
    process.exit(1);
  } else {
    log('ALL E2E TESTS PASSED');
    process.exit(0);
  }
} catch (err) {
  log(`FATAL: ${err.message}\n${err.stack}`);
  process.exit(1);
} finally {
  rmSync(TEST_DIR, { recursive: true, force: true });
}
