/**
 * Unit tests for Comms Bridge
 *
 * Uses Node.js built-in test runner (node --test).
 * Tests: AC1 (OutboxWriter integration), AC2 (schema compliance),
 *        AC3 (notification events), AC4 (streaming hook),
 *        AC5 (post-workflow report), AC6 (independence/error handling),
 *        AC7 (rate limiting), AC8 (notification text quality).
 *
 * Strategy: Mock OutboxWriter to verify correct payloads without filesystem.
 */

import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

// Import the module under test
import { CommsBridge, createCommsBridge } from '../src/comms-bridge.mjs';

// ──────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────

/**
 * Create a silent logger that captures log calls for assertion.
 */
function createTestLogger() {
  const logs = { debug: [], error: [], warn: [], info: [] };
  return {
    debug: (...args) => logs.debug.push(args),
    error: (...args) => logs.error.push(args),
    warn: (...args) => logs.warn.push(args),
    info: (...args) => logs.info.push(args),
    _logs: logs,
  };
}

/**
 * Create a spy wrapper around OutboxWriter to capture write calls
 * without actually writing to the filesystem.
 */
function createSpyOutbox() {
  const calls = [];
  return {
    write: (opts) => {
      calls.push(opts);
      return `reply-${Date.now()}-test-0001.json`;
    },
    writeAgentSwitch: (opts) => {
      calls.push({ ...opts, _method: 'writeAgentSwitch' });
      return `reply-${Date.now()}-test-0002.json`;
    },
    writeToolUse: (opts) => {
      calls.push({ ...opts, _method: 'writeToolUse' });
      return `reply-${Date.now()}-test-0003.json`;
    },
    writeError: (opts) => {
      calls.push({ ...opts, _method: 'writeError' });
      return `reply-${Date.now()}-test-0004.json`;
    },
    writeFinal: (opts) => {
      calls.push({ ...opts, _method: 'writeFinal' });
      return `reply-${Date.now()}-test-0005.json`;
    },
    writeProgress: (opts) => {
      calls.push({ ...opts, _method: 'writeProgress' });
      return `reply-${Date.now()}-test-0006.json`;
    },
    _calls: calls,
  };
}

// ──────────────────────────────────────────────────────
// AC1: OutboxWriter Integration (CON-003, CP-7)
// ──────────────────────────────────────────────────────

describe('AC1: OutboxWriter Integration', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'comms-bridge-test-'));
  });

  afterEach(() => {
    if (tmpDir) rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should create CommsBridge via factory function', () => {
    const bridge = createCommsBridge({ baseDir: tmpDir, logger: createTestLogger() });
    assert.ok(bridge instanceof CommsBridge);
  });

  it('should throw if baseDir is not provided', () => {
    assert.throws(
      () => new CommsBridge({ logger: createTestLogger() }),
      /requires baseDir/
    );
  });

  it('should initialize OutboxWriter on construction', () => {
    const bridge = new CommsBridge({
      baseDir: tmpDir,
      workflowId: 'test-wf-001',
      logger: createTestLogger(),
    });
    // OutboxWriter should have been created
    assert.ok(bridge.outbox !== null, 'OutboxWriter should be initialized');
  });

  it('should create outbox/pending directory under .aios/', () => {
    new CommsBridge({
      baseDir: tmpDir,
      logger: createTestLogger(),
    });
    const pendingDir = join(tmpDir, '.aios', 'outbox', 'pending');
    assert.ok(existsSync(pendingDir), `Expected ${pendingDir} to exist`);
  });

  it('should use OutboxWriter.write() for all notifications (not raw fs.writeFile)', () => {
    const logger = createTestLogger();
    const bridge = new CommsBridge({
      baseDir: tmpDir,
      workflowId: 'test-wf-001',
      logger,
    });

    // Replace outbox with spy
    const spy = createSpyOutbox();
    bridge.outbox = spy;

    bridge.notifyPhaseStart('DEV:IMPLEMENT', 'dev', '3.2.story.md', 1);
    assert.ok(spy._calls.length >= 1, 'Expected at least 1 write call');
    assert.equal(spy._calls[0].inReplyTo, 'test-wf-001');
  });
});

// ──────────────────────────────────────────────────────
// AC2: Schema Compliance (FR-016) — via OutboxWriter
// ──────────────────────────────────────────────────────

describe('AC2: Schema Compliance', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'comms-bridge-schema-'));
  });

  afterEach(() => {
    if (tmpDir) rmSync(tmpDir, { recursive: true, force: true });
  });

  it('all messages should have source="orchestrator" or agent name as agent field', () => {
    const bridge = new CommsBridge({
      baseDir: tmpDir,
      workflowId: 'schema-test-001',
      logger: createTestLogger(),
    });
    const spy = createSpyOutbox();
    bridge.outbox = spy;

    bridge.notifyPhaseStart('DEV:IMPLEMENT', 'dev', 'story.md');
    bridge.notifyPhaseEnd('DEV:IMPLEMENT', 'dev', 'PASS', 1.50, 30000);
    bridge.notifyError('budget_exceeded', 'Budget exceeded', 'DEV:IMPLEMENT', 15.0);

    // All writes should have agent field
    for (const call of spy._calls) {
      assert.ok(call.agent, 'Every message should have an agent field');
    }
  });

  it('all messages should use the workflow ID as in_reply_to', () => {
    const bridge = new CommsBridge({
      baseDir: tmpDir,
      workflowId: 'schema-inreply-001',
      logger: createTestLogger(),
    });
    const spy = createSpyOutbox();
    bridge.outbox = spy;

    bridge.notifyPhaseStart('SM:CREATE', 'sm');
    bridge.notifyPhaseEnd('SM:CREATE', 'sm', 'proceed', 0.5, 10000);

    for (const call of spy._calls) {
      assert.equal(call.inReplyTo, 'schema-inreply-001');
    }
  });

  it('should use configured channel for all messages', () => {
    const bridge = new CommsBridge({
      baseDir: tmpDir,
      channel: 'whatsapp',
      logger: createTestLogger(),
    });
    const spy = createSpyOutbox();
    bridge.outbox = spy;

    bridge.notifyPhaseStart('QA:REVIEW', 'qa');
    assert.equal(spy._calls[0].channel, 'whatsapp');
  });

  it('messages written to filesystem should pass outbox schema validation', () => {
    // This test uses the REAL OutboxWriter to verify schema compliance end-to-end
    const bridge = new CommsBridge({
      baseDir: tmpDir,
      workflowId: 'schema-e2e-001',
      channel: 'telegram',
      logger: createTestLogger(),
    });

    bridge.notifyPhaseStart('DEV:IMPLEMENT', 'dev', 'story.md', 1);

    // Read the file from outbox/pending
    const pendingDir = join(tmpDir, '.aios', 'outbox', 'pending');
    const files = readdirSync(pendingDir).filter(f => f.endsWith('.json'));
    assert.ok(files.length >= 1, 'Should have written at least one outbox file');

    const content = JSON.parse(readFileSync(join(pendingDir, files[0]), 'utf8'));
    assert.equal(content.schema_version, '2.0');
    assert.ok(content.id.startsWith('reply-'));
    assert.ok(content.id.match(/^reply-[0-9]+-[a-f0-9]{4}$/));
    assert.equal(content.in_reply_to, 'schema-e2e-001');
    assert.ok(content.timestamp);
    assert.equal(content.channel, 'telegram');
    assert.equal(content.content.type, 'agent_switch');
    assert.ok(content.content.message.includes('[AIOS]'));
    assert.equal(content.status, 'pending');
  });
});

// ──────────────────────────────────────────────────────
// AC3: Automatic Notification Events (FR-017)
// ──────────────────────────────────────────────────────

describe('AC3: Notification Events', () => {
  let bridge;
  let spy;

  beforeEach(() => {
    const tmpDir = mkdtempSync(join(tmpdir(), 'comms-bridge-events-'));
    bridge = new CommsBridge({
      baseDir: tmpDir,
      workflowId: 'events-001',
      logger: createTestLogger(),
    });
    spy = createSpyOutbox();
    bridge.outbox = spy;
    // Store tmpDir for cleanup
    bridge._tmpDir = tmpDir;
  });

  afterEach(() => {
    if (bridge._tmpDir) rmSync(bridge._tmpDir, { recursive: true, force: true });
  });

  it('notifyPhaseStart should write agent_switch with correct payload', () => {
    bridge.notifyPhaseStart('DEV:IMPLEMENT', 'dev', '3.2.story.md', 1);

    assert.equal(spy._calls.length, 1);
    assert.equal(spy._calls[0].contentType, 'agent_switch');
    assert.equal(spy._calls[0].agent, 'dev');
    assert.ok(spy._calls[0].message.includes('DEV:IMPLEMENT'));
    assert.ok(spy._calls[0].message.includes('Dex'));
    assert.ok(spy._calls[0].message.includes('3.2.story.md'));
    assert.ok(spy._calls[0].message.includes('attempt 1'));
  });

  it('notifyPhaseEnd should write progress with verdict and cost', () => {
    bridge.notifyPhaseEnd('PO:VALIDATE', 'po', 'GO', 0.45, 45000);

    assert.equal(spy._calls.length, 1);
    assert.equal(spy._calls[0].contentType, 'progress');
    assert.ok(spy._calls[0].message.includes('PO:VALIDATE'));
    assert.ok(spy._calls[0].message.includes('GO'));
    assert.ok(spy._calls[0].message.includes('$0.45'));
    assert.ok(spy._calls[0].message.includes('45s'));
  });

  it('notifyError should write error with type and message', () => {
    bridge.notifyError('qa_retries_exhausted', 'QA retries exhausted (3/3)', 'QA:REVIEW', 8.20);

    assert.equal(spy._calls.length, 1);
    assert.equal(spy._calls[0].contentType, 'error');
    assert.ok(spy._calls[0].message.includes('WORKFLOW ABORTED'));
    assert.ok(spy._calls[0].message.includes('QA retries exhausted'));
    assert.ok(spy._calls[0].message.includes('$8.20'));
  });

  it('notifyBudgetAlert should write progress with percentage', () => {
    bridge.notifyBudgetAlert(18.50, 25.00, '3.2.story.md');

    assert.equal(spy._calls.length, 1);
    assert.equal(spy._calls[0].contentType, 'progress');
    assert.ok(spy._calls[0].message.includes('$18.50'));
    assert.ok(spy._calls[0].message.includes('$25.00'));
    assert.ok(spy._calls[0].message.includes('74%'));
    assert.ok(spy._calls[0].message.includes('3.2.story.md'));
  });

  it('notifyWorkflowComplete should write final with summary', () => {
    const report = {
      workflowId: 'events-001',
      status: 'success',
      storyFile: '3.2.story.md',
      totalCostUsd: 4.32,
      totalDurationMs: 120000,
      phases: [],
      concerns: [],
    };

    bridge.notifyWorkflowComplete(report);

    const finalCall = spy._calls.find(c => c.contentType === 'final');
    assert.ok(finalCall, 'Should have written a final notification');
    assert.ok(finalCall.message.includes('SDC complete'));
    assert.ok(finalCall.message.includes('3.2.story.md'));
    assert.ok(finalCall.message.includes('success'));
    assert.ok(finalCall.message.includes('$4.32'));
    assert.ok(finalCall.message.includes('2m'));
  });
});

// ──────────────────────────────────────────────────────
// AC4: Real-Time Streaming Hook (FR-017)
// ──────────────────────────────────────────────────────

describe('AC4: Streaming Hook', () => {
  let bridge;
  let spy;
  let tmpDir;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'comms-bridge-stream-'));
    bridge = new CommsBridge({
      baseDir: tmpDir,
      logger: createTestLogger(),
    });
    spy = createSpyOutbox();
    bridge.outbox = spy;
    // Reset rate limiter
    bridge._lastNotifyTime = 0;
  });

  afterEach(() => {
    if (tmpDir) rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should write tool_use for notable tools (Bash, Write, Edit)', () => {
    bridge.onAgentMessage('dev', { type: 'tool_use', name: 'Bash', input: 'npm test' });
    assert.equal(spy._calls.length, 1);
    assert.equal(spy._calls[0].contentType, 'tool_use');
    assert.ok(spy._calls[0].message.includes('@dev using Bash'));
  });

  it('should NOT write for non-notable tools (Read, Grep, Glob)', () => {
    bridge.onAgentMessage('dev', { type: 'tool_use', name: 'Read', input: 'file.js' });
    bridge.onAgentMessage('dev', { type: 'tool_use', name: 'Grep', input: 'pattern' });
    bridge.onAgentMessage('dev', { type: 'tool_use', name: 'Glob', input: '*.js' });
    assert.equal(spy._calls.length, 0);
  });

  it('should NOT write for non-tool_use messages (text, etc)', () => {
    bridge.onAgentMessage('dev', { type: 'text', text: 'thinking...' });
    bridge.onAgentMessage('dev', { type: 'result', text: 'done' });
    bridge.onAgentMessage('dev', null);
    bridge.onAgentMessage('dev', undefined);
    assert.equal(spy._calls.length, 0);
  });

  it('should truncate tool input to 200 chars', () => {
    const longInput = 'x'.repeat(500);
    bridge.onAgentMessage('dev', { type: 'tool_use', name: 'Write', input: longInput });
    assert.equal(spy._calls.length, 1);
    // message = "@dev using Write: " + truncated input
    assert.ok(spy._calls[0].message.length < 300, 'Message should be truncated');
  });

  it('should handle object input by JSON.stringify then truncate', () => {
    const objInput = { file_path: '/some/path', content: 'a'.repeat(500) };
    bridge.onAgentMessage('dev', { type: 'tool_use', name: 'Edit', input: objInput });
    assert.equal(spy._calls.length, 1);
    assert.ok(spy._calls[0].message.includes('@dev using Edit'));
  });
});

// ──────────────────────────────────────────────────────
// AC5: Post-Workflow Report (FR-018, NFR-013)
// ──────────────────────────────────────────────────────

describe('AC5: Post-Workflow Report', () => {
  let bridge;
  let tmpDir;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'comms-bridge-report-'));
    bridge = new CommsBridge({
      baseDir: tmpDir,
      workflowId: 'report-001',
      logger: createTestLogger(),
    });
    // Replace outbox with spy to avoid needing real OutboxWriter for report tests
    bridge.outbox = createSpyOutbox();
  });

  afterEach(() => {
    if (tmpDir) rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should save report to .aios/orchestrator/reports/{workflowId}.json', () => {
    const report = {
      workflowId: 'report-001',
      status: 'success',
      storyFile: '3.2.story.md',
      totalCostUsd: 4.32,
      totalDurationMs: 120000,
      phases: [
        { phase: 'SM:CREATE', agentId: 'sm', verdict: 'proceed', costUsd: 0.50, durationMs: 15000, toolCalls: 5 },
        { phase: 'PO:VALIDATE', agentId: 'po', verdict: 'GO', costUsd: 0.30, durationMs: 10000, toolCalls: 3 },
      ],
      concerns: [],
    };

    bridge.notifyWorkflowComplete(report);

    const reportPath = join(tmpDir, '.aios', 'orchestrator', 'reports', 'report-001.json');
    assert.ok(existsSync(reportPath), 'Report file should exist');

    const saved = JSON.parse(readFileSync(reportPath, 'utf8'));
    assert.equal(saved.workflowId, 'report-001');
    assert.equal(saved.status, 'success');
    assert.equal(saved.storyFile, '3.2.story.md');
    assert.equal(saved.totalCostUsd, 4.32);
    assert.equal(saved.phases.length, 2);
    assert.ok(saved.generatedAt, 'Should have generatedAt timestamp');
  });

  it('report should match the AC5 schema shape', () => {
    const report = {
      workflowId: 'report-002',
      status: 'aborted',
      storyFile: '5.1.story.md',
      totalCostUsd: 8.20,
      totalDurationMs: 300000,
      phases: [
        { phase: 'DEV:IMPLEMENT', agentId: 'dev', verdict: 'FAIL', costUsd: 7.00, durationMs: 250000, toolCalls: 42 },
      ],
      concerns: ['QA retries exhausted'],
    };

    bridge.notifyWorkflowComplete(report);

    const reportPath = join(tmpDir, '.aios', 'orchestrator', 'reports', 'report-002.json');
    const saved = JSON.parse(readFileSync(reportPath, 'utf8'));

    // Verify all required fields from AC5
    assert.ok('workflowId' in saved);
    assert.ok('status' in saved);
    assert.ok('storyFile' in saved);
    assert.ok('totalCostUsd' in saved);
    assert.ok('totalDurationMs' in saved);
    assert.ok('phases' in saved);
    assert.ok(Array.isArray(saved.phases));
    assert.ok('concerns' in saved);
    assert.ok('generatedAt' in saved);

    // Verify phase shape
    const phase = saved.phases[0];
    assert.ok('phase' in phase);
    assert.ok('agentId' in phase);
    assert.ok('verdict' in phase);
    assert.ok('costUsd' in phase);
    assert.ok('durationMs' in phase);
    assert.ok('toolCalls' in phase);
  });

  it('report summary text should follow AC8 format', () => {
    const spy = createSpyOutbox();
    bridge.outbox = spy;

    bridge.notifyWorkflowComplete({
      workflowId: 'report-003',
      status: 'success',
      storyFile: '3.2.story.md',
      totalCostUsd: 4.32,
      totalDurationMs: 120000,
      phases: [],
    });

    const finalCall = spy._calls.find(c => c.contentType === 'final');
    assert.ok(finalCall);
    // Verify format: "[AIOS] SDC complete for {storyFile}: {status}. Cost: ${totalCostUsd:.2f}. Duration: {time}."
    assert.ok(finalCall.message.startsWith('[AIOS] SDC complete for'));
    assert.ok(finalCall.message.includes('3.2.story.md'));
    assert.ok(finalCall.message.includes('success'));
    assert.ok(finalCall.message.includes('$4.32'));
  });

  it('should use atomic write (tmp -> rename)', () => {
    // After writing, no .tmp files should remain
    bridge.notifyWorkflowComplete({
      workflowId: 'report-atomic',
      status: 'success',
      storyFile: 'test.md',
      totalCostUsd: 0,
      totalDurationMs: 0,
      phases: [],
    });

    const reportsDir = join(tmpDir, '.aios', 'orchestrator', 'reports');
    if (existsSync(reportsDir)) {
      const files = readdirSync(reportsDir);
      const tmpFiles = files.filter(f => f.startsWith('.tmp-'));
      assert.equal(tmpFiles.length, 0, 'No temp files should remain after atomic write');
    }
  });
});

// ──────────────────────────────────────────────────────
// AC6: Independence from Telegram Bridge (R7 mitigation)
// ──────────────────────────────────────────────────────

describe('AC6: Independence / Error Handling', () => {
  it('should NOT check if Telegram Bridge is running', () => {
    const tmpDir = mkdtempSync(join(tmpdir(), 'comms-bridge-indep-'));
    try {
      // Bridge should construct even if nothing is watching outbox
      const bridge = new CommsBridge({
        baseDir: tmpDir,
        logger: createTestLogger(),
      });
      assert.ok(bridge.outbox !== null);
    } finally {
      rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('should silently swallow write failures (never throw)', () => {
    const tmpDir = mkdtempSync(join(tmpdir(), 'comms-bridge-err-'));
    const logger = createTestLogger();
    try {
      const bridge = new CommsBridge({
        baseDir: tmpDir,
        workflowId: 'err-test',
        logger,
      });

      // Replace outbox with one that throws
      bridge.outbox = {
        write: () => { throw new Error('Simulated write failure'); },
      };

      // This should NOT throw
      assert.doesNotThrow(() => {
        bridge.notifyPhaseStart('DEV:IMPLEMENT', 'dev');
      });

      // Error should be logged
      assert.ok(
        logger._logs.error.length >= 1,
        'Write failure should be logged'
      );
    } finally {
      rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('should handle null outbox gracefully', () => {
    const tmpDir = mkdtempSync(join(tmpdir(), 'comms-bridge-null-'));
    const logger = createTestLogger();
    try {
      const bridge = new CommsBridge({
        baseDir: tmpDir,
        logger,
      });

      // Simulate failed OutboxWriter initialization
      bridge.outbox = null;

      // None of these should throw
      assert.doesNotThrow(() => {
        bridge.notifyPhaseStart('SM:CREATE', 'sm');
        bridge.notifyPhaseEnd('SM:CREATE', 'sm', 'proceed', 0.5, 10000);
        bridge.notifyError('test', 'test error');
        bridge.notifyBudgetAlert(10, 20);
        bridge.onAgentMessage('dev', { type: 'tool_use', name: 'Bash', input: 'test' });
      });
    } finally {
      rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});

// ──────────────────────────────────────────────────────
// AC7: Rate Limiting
// ──────────────────────────────────────────────────────

describe('AC7: Rate Limiting', () => {
  let bridge;
  let spy;
  let tmpDir;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'comms-bridge-rate-'));
    bridge = new CommsBridge({
      baseDir: tmpDir,
      logger: createTestLogger(),
    });
    spy = createSpyOutbox();
    bridge.outbox = spy;
  });

  afterEach(() => {
    if (tmpDir) rmSync(tmpDir, { recursive: true, force: true });
  });

  it('phase start/end and errors should bypass rate limit', () => {
    // All of these should write immediately regardless of timing
    bridge.notifyPhaseStart('SM:CREATE', 'sm');
    bridge.notifyPhaseEnd('SM:CREATE', 'sm', 'proceed', 0.5, 10000);
    bridge.notifyError('test', 'test error');
    bridge.notifyBudgetAlert(10, 20);

    // All 4 should have been written immediately
    assert.equal(spy._calls.length, 4, 'All 4 calls should bypass rate limit');
  });

  it('rapid tool_use messages should be rate-limited', () => {
    // First message goes through immediately
    bridge.onAgentMessage('dev', { type: 'tool_use', name: 'Bash', input: 'cmd1' });
    assert.equal(spy._calls.length, 1, 'First message should go through');

    // Subsequent rapid messages should be queued (within 1s window)
    bridge._lastNotifyTime = Date.now(); // Simulate recent write
    bridge.onAgentMessage('dev', { type: 'tool_use', name: 'Write', input: 'cmd2' });
    bridge.onAgentMessage('dev', { type: 'tool_use', name: 'Edit', input: 'cmd3' });

    // Only first message should have been written; rest are queued
    assert.equal(spy._calls.length, 1, 'Subsequent messages should be queued');
    assert.ok(bridge._queue.length >= 1, 'Queue should have pending items');
  });
});

// ──────────────────────────────────────────────────────
// AC8: Notification Text Quality
// ──────────────────────────────────────────────────────

describe('AC8: Notification Text Quality', () => {
  let bridge;
  let spy;
  let tmpDir;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'comms-bridge-text-'));
    bridge = new CommsBridge({
      baseDir: tmpDir,
      workflowId: 'text-test-001',
      logger: createTestLogger(),
    });
    spy = createSpyOutbox();
    bridge.outbox = spy;
  });

  afterEach(() => {
    if (tmpDir) rmSync(tmpDir, { recursive: true, force: true });
  });

  it('phase start should match: "[AIOS] Starting {phase} ({persona}) for story {file} — attempt {n}"', () => {
    bridge.notifyPhaseStart('SM:CREATE', 'sm', '3.2.story.md', 1);
    const msg = spy._calls[0].message;
    assert.ok(msg.startsWith('[AIOS] Starting SM:CREATE'));
    assert.ok(msg.includes('(River)'));
    assert.ok(msg.includes('for story 3.2.story.md'));
    assert.ok(msg.includes('attempt 1'));
  });

  it('phase end should match: "[AIOS] {phase} complete — {verdict}. Cost: ${cost}, Time: {time}"', () => {
    bridge.notifyPhaseEnd('PO:VALIDATE', 'po', 'GO', 0.45, 45000);
    const msg = spy._calls[0].message;
    assert.ok(msg.startsWith('[AIOS] PO:VALIDATE complete'));
    assert.ok(msg.includes('GO'));
    assert.ok(msg.includes('$0.45'));
    assert.ok(msg.includes('45s'));
  });

  it('error should match: "[AIOS] WORKFLOW ABORTED — {message}"', () => {
    bridge.notifyError('qa_retries', 'QA retries exhausted (3/3). Story: 3.2.story.md', 'QA:REVIEW', 8.20);
    const msg = spy._calls[0].message;
    assert.ok(msg.startsWith('[AIOS] WORKFLOW ABORTED'));
    assert.ok(msg.includes('QA retries exhausted'));
    assert.ok(msg.includes('$8.20'));
  });

  it('budget alert should match: "[AIOS] Budget alert: ${current}/${max} used ({pct}%)"', () => {
    bridge.notifyBudgetAlert(18.50, 25.00, '3.2.story.md');
    const msg = spy._calls[0].message;
    assert.ok(msg.startsWith('[AIOS] Budget alert'));
    assert.ok(msg.includes('$18.50'));
    assert.ok(msg.includes('$25.00'));
    assert.ok(msg.includes('74%'));
    assert.ok(msg.includes('3.2.story.md'));
  });

  it('duration formatting: ms, seconds, minutes', () => {
    bridge.notifyPhaseEnd('T1', 'dev', 'OK', 0, 500);
    assert.ok(spy._calls[0].message.includes('500ms'));

    bridge.notifyPhaseEnd('T2', 'dev', 'OK', 0, 30000);
    assert.ok(spy._calls[1].message.includes('30s'));

    bridge.notifyPhaseEnd('T3', 'dev', 'OK', 0, 125000);
    assert.ok(spy._calls[2].message.includes('2m 5s'));
  });

  it('persona mapping should be correct for all agents', () => {
    const agents = [
      ['sm', 'River'], ['po', 'Pax'], ['dev', 'Dex'],
      ['qa', 'Quinn'], ['devops', 'Gage'], ['architect', 'Aria'],
      ['pm', 'Morgan'], ['analyst', 'Alex'],
      ['data-engineer', 'Dara'], ['ux-design-expert', 'Uma'],
      ['aios-master', 'AIOS Master'],
    ];

    for (const [agentId, persona] of agents) {
      spy._calls.length = 0; // Reset
      bridge.notifyPhaseStart('TEST', agentId);
      assert.ok(
        spy._calls[0].message.includes(`(${persona})`),
        `Agent ${agentId} should map to persona ${persona}, got: ${spy._calls[0].message}`
      );
    }
  });

  it('unknown agent should fall back to agent ID', () => {
    bridge.notifyPhaseStart('TEST', 'custom-agent');
    assert.ok(spy._calls[0].message.includes('(custom-agent)'));
  });
});

// ──────────────────────────────────────────────────────
// Factory function
// ──────────────────────────────────────────────────────

describe('createCommsBridge factory', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'comms-bridge-factory-'));
  });

  afterEach(() => {
    if (tmpDir) rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should create a CommsBridge with default values', () => {
    const bridge = createCommsBridge({ baseDir: tmpDir, logger: createTestLogger() });
    assert.ok(bridge instanceof CommsBridge);
    assert.equal(bridge.channel, 'telegram');
    assert.ok(bridge.workflowId.startsWith('orchestrator-'));
  });

  it('should accept custom workflowId, channel, target', () => {
    const bridge = createCommsBridge({
      baseDir: tmpDir,
      workflowId: 'custom-wf',
      channel: 'whatsapp',
      target: { sender_id: '123', chat_id: '456' },
      logger: createTestLogger(),
    });
    assert.equal(bridge.workflowId, 'custom-wf');
    assert.equal(bridge.channel, 'whatsapp');
    assert.deepEqual(bridge.target, { sender_id: '123', chat_id: '456' });
  });
});
