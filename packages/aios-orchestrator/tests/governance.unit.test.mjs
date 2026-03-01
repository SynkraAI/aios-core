/**
 * Unit Tests — Governance Hooks
 *
 * Story: E7.1.4 (AC1, AC2, AC6, AC7, AC8, AC9)
 * Tests the hook factory, tool disallow, persona protection, return format,
 * budget tracking, and integration points.
 *
 * Uses Node.js built-in test runner (node --test).
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  createGovernanceHooks,
  createBudgetTracker,
  setLogger,
  _internals,
} from '../src/governance-hooks.mjs';
import { loadRegistry } from '../src/registry.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REGISTRY_PATH = resolve(__dirname, '..', 'agent-registry.json');
const PROJECT_ROOT = resolve(__dirname, '..', '..', '..');

// Load real registry
const registry = loadRegistry(REGISTRY_PATH, PROJECT_ROOT);

// ============================================================================
// AC1: Hook Factory
// ============================================================================

describe('AC1: Hook Factory', () => {
  it('forAgent returns object with preToolUse function', () => {
    const hooks = createGovernanceHooks(registry);
    const devHooks = hooks.forAgent('dev');

    assert.ok(devHooks, 'forAgent should return non-null for dev');
    assert.equal(typeof devHooks.preToolUse, 'function', 'should have preToolUse function');
  });

  it('forAgent("aios-master") returns null', () => {
    const hooks = createGovernanceHooks(registry);
    const result = hooks.forAgent('aios-master');

    assert.equal(result, null, 'aios-master should get null (no restrictions)');
  });

  it('forAgent("unknown-id") throws ConfigError', () => {
    const hooks = createGovernanceHooks(registry);

    assert.throws(
      () => hooks.forAgent('unknown-id'),
      (err) => {
        return (
          err.message.includes('ConfigError') &&
          err.message.includes('unknown-id') &&
          err.code === 'CONFIG_ERROR'
        );
      },
      'Should throw ConfigError for unknown agent'
    );
  });

  it('forAgent works for all 11 agents', () => {
    const hooks = createGovernanceHooks(registry);
    const agentIds = registry.listAgents();

    for (const id of agentIds) {
      if (id === 'aios-master') {
        assert.equal(hooks.forAgent(id), null, `aios-master returns null`);
      } else {
        const result = hooks.forAgent(id);
        assert.ok(result, `forAgent("${id}") should return non-null`);
        assert.equal(typeof result.preToolUse, 'function', `${id} should have preToolUse`);
      }
    }
  });
});

// ============================================================================
// AC2: Tool Disallow Hook
// ============================================================================

describe('AC2: Tool Disallow Hook', () => {
  it('denies disallowed tool for an agent', async () => {
    const hooks = createGovernanceHooks(registry);
    const smHooks = hooks.forAgent('sm');

    // sm has Bash in disallowedTools
    const result = await smHooks.preToolUse('Bash', { command: 'ls' });

    assert.equal(result.decision, 'deny');
    assert.ok(result.reason.includes('Bash'), 'reason should mention the tool');
    assert.ok(result.reason.includes('sm'), 'reason should mention the agent');
  });

  it('allows non-disallowed tool for an agent', async () => {
    const hooks = createGovernanceHooks(registry);
    const smHooks = hooks.forAgent('sm');

    // sm has Read in allowedTools
    const result = await smHooks.preToolUse('Read', { file_path: '/tmp/test.txt' });

    assert.equal(result.decision, 'allow');
  });

  it('denies Edit for po agent', async () => {
    const hooks = createGovernanceHooks(registry);
    const poHooks = hooks.forAgent('po');

    const result = await poHooks.preToolUse('Edit', { file_path: '/tmp/test.txt' });

    assert.equal(result.decision, 'deny');
    assert.ok(result.reason.includes('Edit'));
  });

  it('denies Write for qa agent', async () => {
    const hooks = createGovernanceHooks(registry);
    const qaHooks = hooks.forAgent('qa');

    const result = await qaHooks.preToolUse('Write', { file_path: '/tmp/test.txt' });

    assert.equal(result.decision, 'deny');
  });

  it('allows all tools for dev agent (empty disallowedTools)', async () => {
    const hooks = createGovernanceHooks(registry);
    const devHooks = hooks.forAgent('dev');

    // dev has no disallowed tools
    const result = await devHooks.preToolUse('Read', { file_path: '/tmp/test.txt' });
    assert.equal(result.decision, 'allow');

    const result2 = await devHooks.preToolUse('Write', { file_path: '/tmp/test.txt' });
    assert.equal(result2.decision, 'allow');
  });
});

// ============================================================================
// AC6: Persona File Protection
// ============================================================================

describe('AC6: Persona File Protection', () => {
  it('denies Write to persona file for non-aios-master agent', async () => {
    const hooks = createGovernanceHooks(registry);
    const devHooks = hooks.forAgent('dev');

    const result = await devHooks.preToolUse('Write', {
      file_path: '/home/ubuntu/aios-core/.claude/commands/AIOS/agents/sm.md',
    });

    assert.equal(result.decision, 'deny');
    assert.ok(result.reason.includes('persona files'), 'reason mentions persona files');
    assert.ok(result.reason.includes('dev'), 'reason mentions the agent');
    assert.ok(result.reason.includes('aios-master'), 'reason mentions aios-master');
  });

  it('denies Edit to persona file for non-aios-master agent', async () => {
    const hooks = createGovernanceHooks(registry);
    const devHooks = hooks.forAgent('dev');

    const result = await devHooks.preToolUse('Edit', {
      file_path: '.claude/commands/AIOS/agents/qa.md',
    });

    assert.equal(result.decision, 'deny');
    assert.ok(result.reason.includes('persona files'));
  });

  it('normalizes backslash paths for persona protection', async () => {
    const hooks = createGovernanceHooks(registry);
    const devHooks = hooks.forAgent('dev');

    const result = await devHooks.preToolUse('Write', {
      file_path: '.claude\\commands\\AIOS\\agents\\pm.md',
    });

    assert.equal(result.decision, 'deny', 'backslash paths should be caught');
  });

  it('allows Write to non-persona files', async () => {
    const hooks = createGovernanceHooks(registry);
    const devHooks = hooks.forAgent('dev');

    const result = await devHooks.preToolUse('Write', {
      file_path: '/home/ubuntu/aios-core/packages/test.mjs',
    });

    assert.equal(result.decision, 'allow');
  });

  it('allows Read of persona files (Read is not restricted)', async () => {
    const hooks = createGovernanceHooks(registry);
    const devHooks = hooks.forAgent('dev');

    const result = await devHooks.preToolUse('Read', {
      file_path: '.claude/commands/AIOS/agents/sm.md',
    });

    assert.equal(result.decision, 'allow', 'Read is always allowed');
  });

  it('persona protection applies to all agents except aios-master', async () => {
    const hooks = createGovernanceHooks(registry);
    const agentsToTest = ['dev', 'qa', 'sm', 'po', 'pm', 'architect', 'analyst', 'devops', 'data-engineer', 'ux-design-expert'];

    for (const agentId of agentsToTest) {
      const agentHooks = hooks.forAgent(agentId);
      // Only test Write/Edit for agents that don't have them disallowed
      // (for agents with disallowed Write, the disallow check fires first)
      const config = registry.getAgent(agentId);
      if (!config.disallowedTools.includes('Write')) {
        const result = await agentHooks.preToolUse('Write', {
          file_path: '.claude/commands/AIOS/agents/dev.md',
        });
        assert.equal(result.decision, 'deny', `${agentId} should be denied persona write`);
      }
    }
  });
});

// ============================================================================
// AC7: Governance Audit Log
// ============================================================================

describe('AC7: Governance Audit Log', () => {
  it('logs WARN on deny decision', async () => {
    const warnLogs = [];
    const mockLogger = {
      warn(obj) { warnLogs.push(obj); },
      debug() {},
      error() {},
    };
    setLogger(mockLogger);

    const hooks = createGovernanceHooks(registry);
    const devHooks = hooks.forAgent('dev');

    await devHooks.preToolUse('Bash', { command: 'git push' });

    assert.ok(warnLogs.length > 0, 'should have logged at least one WARN');
    const log = warnLogs[0];
    assert.equal(log.event, 'governance_deny');
    assert.equal(log.agentId, 'dev');
    assert.equal(log.tool, 'Bash');
    assert.ok(log.reason, 'log should have reason');
    assert.ok(log.blockedPattern, 'log should have blockedPattern');

    // Reset logger
    setLogger({
      warn() {},
      debug() {},
      error() {},
    });
  });

  it('logs DEBUG on allowed Bash command (with restrictions)', async () => {
    const debugLogs = [];
    const mockLogger = {
      warn() {},
      debug(obj) { debugLogs.push(obj); },
      error() {},
    };

    // Enable debug logging
    const origDebug = process.env.AIOS_DEBUG;
    process.env.AIOS_DEBUG = 'true';
    setLogger(mockLogger);

    const hooks = createGovernanceHooks(registry);
    const devHooks = hooks.forAgent('dev');

    await devHooks.preToolUse('Bash', { command: 'git status' });

    assert.ok(debugLogs.length > 0, 'should have logged at least one DEBUG');
    const log = debugLogs[0];
    assert.equal(log.event, 'governance_allow');
    assert.equal(log.agentId, 'dev');
    assert.equal(log.tool, 'Bash');

    // Restore
    process.env.AIOS_DEBUG = origDebug;
    setLogger({
      warn() {},
      debug() {},
      error() {},
    });
  });

  it('does not log sensitive data (tokens/keys) in input', async () => {
    const warnLogs = [];
    const mockLogger = {
      warn(obj) { warnLogs.push(obj); },
      debug() {},
      error() {},
    };
    setLogger(mockLogger);

    const hooks = createGovernanceHooks(registry);
    const smHooks = hooks.forAgent('sm');

    await smHooks.preToolUse('Bash', {
      command: 'git push',
      token: 'secret-token-123',
      apiKey: 'sk-abc123',
    });

    if (warnLogs.length > 0) {
      const logStr = JSON.stringify(warnLogs[0]);
      assert.ok(!logStr.includes('secret-token-123'), 'should not log token value');
      assert.ok(!logStr.includes('sk-abc123'), 'should not log API key value');
    }

    // Reset
    setLogger({
      warn() {},
      debug() {},
      error() {},
    });
  });
});

// ============================================================================
// AC8: Hook Return Format
// ============================================================================

describe('AC8: Hook Return Format', () => {
  it('DENY returns { decision: "deny", reason: "..." }', async () => {
    const hooks = createGovernanceHooks(registry);
    const devHooks = hooks.forAgent('dev');

    const result = await devHooks.preToolUse('Bash', { command: 'git push' });

    assert.equal(typeof result.decision, 'string');
    assert.equal(result.decision, 'deny');
    assert.equal(typeof result.reason, 'string');
    assert.ok(result.reason.length > 0, 'reason should not be empty');
  });

  it('ALLOW returns { decision: "allow" }', async () => {
    const hooks = createGovernanceHooks(registry);
    const devHooks = hooks.forAgent('dev');

    const result = await devHooks.preToolUse('Bash', { command: 'git status' });

    assert.equal(result.decision, 'allow');
    assert.equal(result.reason, undefined, 'allow should not have reason');
  });

  it('hook error results in ALLOW (fail-open)', async () => {
    // Create a registry mock that causes the preToolUse to throw internally
    const errorLogs = [];
    const mockLogger = {
      warn() { throw new Error('Logger itself throws!'); },
      debug() {},
      error(obj) { errorLogs.push(obj); },
    };
    setLogger(mockLogger);

    const hooks = createGovernanceHooks(registry);
    const devHooks = hooks.forAgent('dev');

    // The warn call inside the hook will throw, triggering fail-open
    const result = await devHooks.preToolUse('Bash', { command: 'git push' });

    // Fail-open: should be allow
    assert.equal(result.decision, 'allow', 'should fail open on error');

    // Reset
    setLogger({
      warn() {},
      debug() {},
      error() {},
    });
  });

  it('preToolUse is async', () => {
    const hooks = createGovernanceHooks(registry);
    const devHooks = hooks.forAgent('dev');

    const result = devHooks.preToolUse('Read', { file_path: '/tmp/test' });
    assert.ok(result instanceof Promise, 'preToolUse should return a Promise');
  });
});

// ============================================================================
// AC9: Integration with Session Manager (documentation test)
// ============================================================================

describe('AC9: Integration with Session Manager', () => {
  it('hooks object shape is compatible with SDK query() hooks parameter', () => {
    const hooks = createGovernanceHooks(registry);
    const devHooks = hooks.forAgent('dev');

    // SDK expects hooks.preToolUse to be a function that takes (toolName, toolInput)
    assert.equal(typeof devHooks.preToolUse, 'function');
    assert.equal(devHooks.preToolUse.length, 2, 'preToolUse should accept 2 parameters');
  });

  it('createGovernanceHooks accepts a registry object', () => {
    assert.equal(typeof createGovernanceHooks, 'function');
    const hooks = createGovernanceHooks(registry);
    assert.ok(hooks, 'should return hooks object');
    assert.equal(typeof hooks.forAgent, 'function');
  });
});

// ============================================================================
// Budget Tracker
// ============================================================================

describe('Budget Tracker', () => {
  it('tracks cumulative cost', () => {
    const tracker = createBudgetTracker(10.0);

    const r1 = tracker.track(3.0);
    assert.equal(r1.allowed, true);
    assert.equal(r1.total, 3.0);
    assert.equal(r1.remaining, 7.0);

    const r2 = tracker.track(5.0);
    assert.equal(r2.allowed, true);
    assert.equal(r2.total, 8.0);
    assert.equal(r2.remaining, 2.0);
  });

  it('denies when budget exceeded', () => {
    const tracker = createBudgetTracker(5.0);

    tracker.track(3.0);
    tracker.track(2.5);

    const r = tracker.track(0.1);
    assert.equal(r.allowed, false);
    assert.equal(r.remaining, 0);
  });

  it('allows exactly at budget', () => {
    const tracker = createBudgetTracker(5.0);

    const r = tracker.track(5.0);
    assert.equal(r.allowed, true);
    assert.equal(r.remaining, 0);
  });

  it('reset clears the total', () => {
    const tracker = createBudgetTracker(5.0);
    tracker.track(4.0);
    tracker.reset();

    assert.equal(tracker.getTotal(), 0);
    const r = tracker.track(3.0);
    assert.equal(r.allowed, true);
    assert.equal(r.total, 3.0);
  });

  it('getTotal returns current total', () => {
    const tracker = createBudgetTracker(10.0);
    tracker.track(2.5);
    tracker.track(1.5);

    assert.equal(tracker.getTotal(), 4.0);
  });

  it('track with default cost (0) does not increase total', () => {
    const tracker = createBudgetTracker(5.0);
    const r = tracker.track();
    assert.equal(r.total, 0);
    assert.equal(r.allowed, true);
  });
});

// ============================================================================
// Internal helpers
// ============================================================================

describe('Internal: buildBlockPatterns', () => {
  it('returns array of pattern objects', () => {
    const patterns = _internals.buildBlockPatterns('git push');
    assert.ok(Array.isArray(patterns));
    assert.ok(patterns.length >= 5, 'should have at least 5 layers');

    for (const p of patterns) {
      assert.ok(p.pattern instanceof RegExp, 'each entry should have a RegExp');
      assert.equal(typeof p.layer, 'string', 'each entry should have a layer name');
    }
  });

  it('direct pattern matches the command', () => {
    const patterns = _internals.buildBlockPatterns('git push');
    const directPattern = patterns.find((p) => p.layer === 'direct');
    assert.ok(directPattern.pattern.test('git push'));
    assert.ok(directPattern.pattern.test('GIT PUSH'));
    assert.ok(directPattern.pattern.test('git  push'));
    assert.ok(!directPattern.pattern.test('git pull'));
  });
});

describe('Internal: checkBase64Payload', () => {
  it('detects base64-encoded blocked command', () => {
    const blocks = [{ command: 'git push' }];
    const cmd = 'echo Z2l0IHB1c2g= | base64 -d | bash';
    const result = _internals.checkBase64Payload(cmd, blocks);

    assert.equal(result.blocked, true);
    assert.equal(result.command, 'git push');
  });

  it('does not block non-matching base64', () => {
    const blocks = [{ command: 'git push' }];
    const cmd = 'echo aGVsbG8= | base64 -d'; // "hello"
    const result = _internals.checkBase64Payload(cmd, blocks);

    assert.equal(result.blocked, false);
  });
});

describe('Internal: normalizePath', () => {
  it('converts backslashes to forward slashes', () => {
    assert.equal(
      _internals.normalizePath('C:\\Users\\test\\.claude\\commands\\AIOS\\agents\\dev.md'),
      'C:/Users/test/.claude/commands/AIOS/agents/dev.md'
    );
  });

  it('leaves forward slashes unchanged', () => {
    assert.equal(
      _internals.normalizePath('/home/user/.claude/commands/AIOS/agents/dev.md'),
      '/home/user/.claude/commands/AIOS/agents/dev.md'
    );
  });
});
