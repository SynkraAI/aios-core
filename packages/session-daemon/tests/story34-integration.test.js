import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import { mkdirSync, writeFileSync, readFileSync, readdirSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { HealthMonitor, SessionState } from '../src/health-monitor.js';
import { execSync } from 'child_process';

const TEST_ROOT = '/tmp/aios-test-s34-' + Date.now();
const TEST_DIR = join(TEST_ROOT, '.aios');  // Simulates .aios/ dir
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
  rmSync(TEST_ROOT, { recursive: true, force: true });
});

// ============================================================
// HealthMonitor Tests
// ============================================================
describe('HealthMonitor', () => {
  let monitor;

  beforeEach(() => {
    monitor = new HealthMonitor({
      stateDir: DAEMON_DIR,
      writeIntervalMs: 60000, // No auto-write in tests
      maxRecoveries: 3,
      logger: silentLogger,
    });
  });

  after(() => {
    if (monitor) monitor.stop();
  });

  it('starts in STARTING state', () => {
    assert.strictEqual(monitor.state, SessionState.STARTING);
  });

  it('transitions STARTING -> READY', () => {
    const result = monitor.markReady();
    assert.strictEqual(result, true);
    assert.strictEqual(monitor.state, SessionState.READY);
  });

  it('transitions READY -> BUSY -> READY', () => {
    monitor.markReady();
    monitor.markBusy('cmd-001');
    assert.strictEqual(monitor.state, SessionState.BUSY);
    assert.strictEqual(monitor.currentCommandId, 'cmd-001');

    monitor.markIdle();
    assert.strictEqual(monitor.state, SessionState.READY);
    assert.strictEqual(monitor.currentCommandId, null);
    assert.strictEqual(monitor.commandsProcessed, 1);
  });

  it('rejects invalid transitions', () => {
    // STARTING -> BUSY is not valid
    const result = monitor.transition(SessionState.BUSY);
    assert.strictEqual(result, false);
    assert.strictEqual(monitor.state, SessionState.STARTING);
  });

  it('tracks command failures', () => {
    monitor.markReady();
    monitor.markBusy('cmd-002');
    monitor.markCommandFailed(new Error('timeout'));
    assert.strictEqual(monitor.state, SessionState.READY);
    assert.strictEqual(monitor.commandsFailed, 1);
    assert.strictEqual(monitor.lastError, 'timeout');
  });

  it('enters RECOVERY state and counts attempts', () => {
    monitor.markReady();

    // First recovery
    const r1 = monitor.enterRecovery('session_crash');
    assert.strictEqual(r1, true);
    assert.strictEqual(monitor.state, SessionState.RECOVERY);
    assert.strictEqual(monitor.recoveryCount, 1);

    // Recover back to READY (resets recovery count)
    monitor.markReady();
    assert.strictEqual(monitor.recoveryCount, 0);

    // Simulate 3 recoveries WITHOUT markReady (which resets count)
    monitor.enterRecovery('crash_1'); // count=1
    monitor.transition(SessionState.READY, 'recovered');
    monitor.enterRecovery('crash_2'); // count=2, but markReady reset it...

    // Actually, transition(READY) doesn't reset count, only markReady() does.
    // So let's test the max properly: 3 enterRecovery calls without markReady between them.
    const m2 = new HealthMonitor({ stateDir: DAEMON_DIR, maxRecoveries: 3, logger: silentLogger });
    m2.markReady();
    m2.enterRecovery('c1');           // count=1
    m2.transition(SessionState.READY, 'ok');
    m2.enterRecovery('c2');           // count=2
    m2.transition(SessionState.READY, 'ok');
    m2.enterRecovery('c3');           // count=3
    m2.transition(SessionState.READY, 'ok');

    // 4th exceeds max (3)
    const r4 = m2.enterRecovery('c4');
    assert.strictEqual(r4, false);
    assert.strictEqual(m2.state, SessionState.FAILED);
  });

  it('emits events on state change', () => {
    const changes = [];
    monitor.on('state_change', (e) => changes.push(e));

    monitor.markReady();
    monitor.markBusy('cmd-003');
    monitor.markIdle();

    assert.strictEqual(changes.length, 3);
    assert.strictEqual(changes[0].from, SessionState.STARTING);
    assert.strictEqual(changes[0].to, SessionState.READY);
    assert.strictEqual(changes[1].to, SessionState.BUSY);
    assert.strictEqual(changes[2].to, SessionState.READY);
  });

  it('emits failed event when max recoveries exceeded', () => {
    let failedEvent = null;
    monitor.on('failed', (e) => { failedEvent = e; });

    monitor.markReady();
    for (let i = 0; i < 3; i++) {
      monitor.enterRecovery(`crash_${i}`);
      monitor.transition(SessionState.READY, 'ok');
    }
    monitor.enterRecovery('final_crash');

    assert.ok(failedEvent);
    assert.strictEqual(failedEvent.reason, 'final_crash');
  });

  it('writes health.json to disk', () => {
    monitor.markReady();
    const health = monitor.writeHealth();

    assert.strictEqual(health.status, 'alive');
    assert.strictEqual(health.state, SessionState.READY);
    assert.strictEqual(health.pid, process.pid);
    assert.strictEqual(typeof health.uptime_seconds, 'number');
    assert.strictEqual(typeof health.memory_mb, 'number');

    // Verify file exists and is valid JSON
    const filepath = join(DAEMON_DIR, 'health.json');
    assert.ok(existsSync(filepath));
    const fromDisk = JSON.parse(readFileSync(filepath, 'utf8'));
    assert.strictEqual(fromDisk.state, SessionState.READY);
  });

  it('writes stopped health on shutdown', () => {
    monitor.markReady();
    monitor.writeStopped('SIGTERM');

    const filepath = join(DAEMON_DIR, 'health.json');
    const health = JSON.parse(readFileSync(filepath, 'utf8'));
    assert.strictEqual(health.status, 'stopped');
    assert.strictEqual(health.state, 'STOPPED');
    assert.strictEqual(health.reason, 'SIGTERM');
  });

  it('tracks cumulative tokens', () => {
    monitor.addTokens(1000, 500);
    monitor.addTokens(2000, 800);

    assert.strictEqual(monitor.cumulativeTokens.input, 3000);
    assert.strictEqual(monitor.cumulativeTokens.output, 1300);
  });

  it('pauses and resumes', () => {
    monitor.markReady();
    monitor.markPaused('manual');
    assert.strictEqual(monitor.state, SessionState.PAUSED);

    monitor.transition(SessionState.READY, 'resumed');
    assert.strictEqual(monitor.state, SessionState.READY);
  });

  it('provides snapshot', () => {
    monitor.markReady();
    monitor.setAgent('dev');
    const snap = monitor.snapshot();

    assert.strictEqual(snap.state, SessionState.READY);
    assert.strictEqual(snap.currentAgent, 'dev');
    assert.strictEqual(typeof snap.uptimeSeconds, 'number');
  });
});

// ============================================================
// CLI Tests (invoke via subprocess)
// ============================================================
describe('CLI', () => {
  const CLI_PATH = join(process.cwd(), 'src', 'cli.js');

  it('shows help text', () => {
    const output = execSync(`node ${CLI_PATH} help`, { encoding: 'utf8' });
    assert.ok(output.includes('aios-daemon'));
    assert.ok(output.includes('health'));
    assert.ok(output.includes('send'));
  });

  it('sends a command to inbox', () => {
    const output = execSync(
      `node ${CLI_PATH} send "Test command from CLI"`,
      { encoding: 'utf8', env: { ...process.env, AIOS_CWD: TEST_ROOT } }
    );

    assert.ok(output.includes('Command sent'));
  });

  it('shows health from file', () => {
    // Write a mock health file
    writeFileSync(join(DAEMON_DIR, 'health.json'), JSON.stringify({
      status: 'alive',
      state: 'READY',
      pid: 12345,
      uptime_seconds: 300,
      current_agent: 'dev',
      current_command: null,
      commands_processed: 10,
      commands_failed: 1,
      recovery_count: 0,
      memory_mb: 256,
      updated_at: new Date().toISOString(),
      cumulative_tokens: { input: 5000, output: 2000 },
    }));

    const output = execSync(
      `node ${CLI_PATH} health --json`,
      { encoding: 'utf8', env: { ...process.env, AIOS_CWD: TEST_ROOT } }
    );

    const health = JSON.parse(output);
    assert.strictEqual(health.status, 'alive');
    assert.strictEqual(health.state, 'READY');
    assert.strictEqual(health.pid, 12345);
  });

  it('shows status from files', () => {
    // Write mock session and queue files
    writeFileSync(join(DAEMON_DIR, 'session.json'), JSON.stringify({
      session_id: 'test-sess-123',
      model: 'claude-opus-4-6',
      use_v2: true,
      created_at: '2026-01-01T00:00:00Z',
      resumed_count: 2,
    }));

    writeFileSync(join(DAEMON_DIR, 'queue.json'), JSON.stringify({
      current: null,
      pending: [],
      totalProcessed: 5,
      totalFailed: 0,
    }));

    const output = execSync(
      `node ${CLI_PATH} status --json`,
      { encoding: 'utf8', env: { ...process.env, AIOS_CWD: TEST_ROOT } }
    );

    const status = JSON.parse(output);
    assert.strictEqual(status.session.session_id, 'test-sess-123');
    assert.strictEqual(status.queue.totalProcessed, 5);
  });
});

// ============================================================
// State Machine Transition Matrix Tests
// ============================================================
describe('State Machine Transitions', () => {
  it('validates all legal transitions', () => {
    const legal = [
      [SessionState.STARTING, SessionState.READY],
      [SessionState.STARTING, SessionState.FAILED],
      [SessionState.READY, SessionState.BUSY],
      [SessionState.READY, SessionState.PAUSED],
      [SessionState.READY, SessionState.RECOVERY],
      [SessionState.READY, SessionState.FAILED],
      [SessionState.BUSY, SessionState.READY],
      [SessionState.BUSY, SessionState.RECOVERY],
      [SessionState.RECOVERY, SessionState.READY],
      [SessionState.RECOVERY, SessionState.FAILED],
      [SessionState.PAUSED, SessionState.READY],
      [SessionState.PAUSED, SessionState.FAILED],
      [SessionState.FAILED, SessionState.STARTING],
    ];

    for (const [from, to] of legal) {
      const monitor = new HealthMonitor({ stateDir: DAEMON_DIR, logger: silentLogger });
      // Force state to 'from'
      monitor.state = from;
      const result = monitor.transition(to, 'test');
      assert.strictEqual(result, true, `${from} -> ${to} should be valid`);
    }
  });

  it('rejects all illegal transitions', () => {
    const illegal = [
      [SessionState.STARTING, SessionState.BUSY],
      [SessionState.STARTING, SessionState.PAUSED],
      [SessionState.STARTING, SessionState.RECOVERY],
      [SessionState.READY, SessionState.STARTING],
      [SessionState.BUSY, SessionState.STARTING],
      [SessionState.BUSY, SessionState.PAUSED],
      [SessionState.BUSY, SessionState.FAILED],
      [SessionState.RECOVERY, SessionState.BUSY],
      [SessionState.RECOVERY, SessionState.PAUSED],
      [SessionState.RECOVERY, SessionState.STARTING],
      [SessionState.PAUSED, SessionState.BUSY],
      [SessionState.PAUSED, SessionState.RECOVERY],
      [SessionState.PAUSED, SessionState.STARTING],
      [SessionState.FAILED, SessionState.READY],
      [SessionState.FAILED, SessionState.BUSY],
      [SessionState.FAILED, SessionState.RECOVERY],
      [SessionState.FAILED, SessionState.PAUSED],
    ];

    for (const [from, to] of illegal) {
      const monitor = new HealthMonitor({ stateDir: DAEMON_DIR, logger: silentLogger });
      monitor.state = from;
      const result = monitor.transition(to, 'test');
      assert.strictEqual(result, false, `${from} -> ${to} should be invalid`);
    }
  });
});
