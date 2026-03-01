/**
 * Unit tests for Session Manager (E7.1.2)
 *
 * Uses Node.js built-in test runner (node --test).
 * All tests mock the SDK query() function — no real API calls.
 *
 * Tests cover:
 *   AC1:  Core session execution, registry lookup, ConfigError
 *   AC2:  System prompt 3-layer assembly
 *   AC3:  Tool restrictions passed to query()
 *   AC4:  Budget enforcement via maxCostUsd
 *   AC5:  permissionMode always set from agentConfig
 *   AC6:  Governance hooks injection (optional)
 *   AC7:  Result object shape (agentId, messages, costUsd, summary, toolCalls, durationMs)
 *   AC8:  Defensive cost extraction (extractCost)
 *   AC9:  Transient error retry with exponential backoff
 *   AC10: Fatal error propagation (BudgetError, ConfigError, OrchestratorError)
 *   AC11: No session resume — stateless per call
 *   AC12: Logging at INFO and DEBUG levels
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';

import { createSessionManager, extractCost } from '../src/session-manager.mjs';
import {
  OrchestratorError,
  ConfigError,
  BudgetError,
  TransientError,
} from '../src/errors.mjs';

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

let tmpDir;
let projectRoot;
let agentFile;

/**
 * Create a minimal fake registry that mimics the real registry API.
 */
function createFakeRegistry(overrides = {}) {
  const agents = {
    dev: {
      id: 'dev',
      persona: 'Dex',
      role: 'Implementation',
      model: 'claude-sonnet-4-6',
      maxBudgetUsd: 15.0,
      permissionMode: 'bypassPermissions',
      allowedTools: ['Read', 'Edit', 'Write', 'Bash', 'Grep', 'Glob'],
      disallowedTools: [],
      systemPromptFile: '.claude/agents/dev.md',
      systemPromptAppend: '',
      bashRestrictions: { blocked: ['git push'], reason: 'Delegate to @devops' },
      workflows: ['sdc:implement'],
      ...overrides,
    },
  };

  return {
    agents,
    getAgent(id) {
      if (!agents[id]) throw new Error(`Agent "${id}" not found in registry`);
      return agents[id];
    },
    listAgents() {
      return Object.keys(agents);
    },
  };
}

/**
 * Create a mock query function that yields the given messages.
 */
function createMockQuery(messages) {
  return function mockQuery(options) {
    // Store options for assertions
    mockQuery._lastOptions = options;
    mockQuery._callCount = (mockQuery._callCount || 0) + 1;

    return {
      async *[Symbol.asyncIterator]() {
        for (const msg of messages) {
          yield msg;
        }
      },
    };
  };
}

/**
 * Create a mock query that throws on specific attempts.
 */
function createFailingQuery(errorOrErrors, succeedAfter = Infinity) {
  let callCount = 0;
  const errors = Array.isArray(errorOrErrors) ? errorOrErrors : [errorOrErrors];

  return function failingQuery(options) {
    failingQuery._lastOptions = options;
    failingQuery._callCount = (failingQuery._callCount || 0) + 1;
    const currentCall = callCount++;

    if (currentCall < succeedAfter && currentCall < errors.length) {
      const err = errors[currentCall];
      // Return an async iterable that throws
      return {
        async *[Symbol.asyncIterator]() {
          throw err;
        },
      };
    }

    if (currentCall < succeedAfter) {
      // Re-throw the last error
      const err = errors[errors.length - 1];
      return {
        async *[Symbol.asyncIterator]() {
          throw err;
        },
      };
    }

    // Succeed after N failures
    return {
      async *[Symbol.asyncIterator]() {
        yield { role: 'assistant', content: 'Success after retry' };
      },
    };
  };
}

/**
 * Create a logger that captures log entries.
 */
function createCapturingLogger() {
  const entries = { info: [], warn: [], error: [], debug: [] };
  return {
    entries,
    info(obj, msg) { entries.info.push({ obj, msg }); },
    warn(obj, msg) { entries.warn.push({ obj, msg }); },
    error(obj, msg) { entries.error.push({ obj, msg }); },
    debug(obj, msg) { entries.debug.push({ obj, msg }); },
  };
}

// ---------------------------------------------------------------------------
// Setup / Teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  tmpDir = mkdtempSync(resolve(tmpdir(), 'session-mgr-test-'));
  projectRoot = tmpDir;

  // Create agent persona file
  const agentDir = resolve(tmpDir, '.claude', 'agents');
  mkdirSync(agentDir, { recursive: true });
  agentFile = resolve(agentDir, 'dev.md');
  writeFileSync(agentFile, '# Dex the Builder\n\nYou are Dex, expert developer.');
});

// ---------------------------------------------------------------------------
// AC1: Core Session Execution
// ---------------------------------------------------------------------------

describe('AC1: Core Session Execution', () => {
  it('should create a session manager with run() method', () => {
    const registry = createFakeRegistry();
    const sm = createSessionManager({
      registry,
      projectRoot,
      queryFn: createMockQuery([]),
    });

    assert.ok(typeof sm.run === 'function', 'run should be a function');
  });

  it('should execute query() and return a SessionResult', async () => {
    const registry = createFakeRegistry();
    const mockQuery = createMockQuery([
      { role: 'assistant', content: 'Task completed successfully.' },
    ]);

    const sm = createSessionManager({ registry, projectRoot, queryFn: mockQuery });
    const result = await sm.run({ agentId: 'dev', prompt: 'Implement feature X' });

    assert.equal(result.agentId, 'dev');
    assert.equal(result.messages.length, 1);
    assert.equal(result.summary, 'Task completed successfully.');
    assert.equal(typeof result.durationMs, 'number');
    assert.ok(result.durationMs >= 0);
  });

  it('should throw ConfigError if agentId is not in registry', async () => {
    const registry = createFakeRegistry();
    const sm = createSessionManager({ registry, projectRoot, queryFn: createMockQuery([]) });

    await assert.rejects(
      () => sm.run({ agentId: 'nonexistent', prompt: 'test' }),
      (err) => {
        assert.ok(err instanceof ConfigError);
        assert.equal(err.agentId, 'nonexistent');
        return true;
      }
    );
  });

  it('should throw ConfigError if registry is not provided', () => {
    assert.throws(
      () => createSessionManager({ projectRoot, queryFn: createMockQuery([]) }),
      (err) => err instanceof ConfigError && /registry is required/.test(err.message)
    );
  });

  it('should throw ConfigError if projectRoot is not provided', () => {
    const registry = createFakeRegistry();
    assert.throws(
      () => createSessionManager({ registry, queryFn: createMockQuery([]) }),
      (err) => err instanceof ConfigError && /projectRoot is required/.test(err.message)
    );
  });

  it('each run() call should be stateless (AC11)', async () => {
    const registry = createFakeRegistry();
    let callCount = 0;
    const mockQuery = createMockQuery([{ role: 'assistant', content: 'done' }]);

    const sm = createSessionManager({ registry, projectRoot, queryFn: mockQuery });

    const r1 = await sm.run({ agentId: 'dev', prompt: 'task 1' });
    const r2 = await sm.run({ agentId: 'dev', prompt: 'task 2' });

    // Both should be independent results
    assert.equal(r1.agentId, 'dev');
    assert.equal(r2.agentId, 'dev');
    assert.equal(r1.messages.length, 1);
    assert.equal(r2.messages.length, 1);
  });
});

// ---------------------------------------------------------------------------
// AC2: System Prompt Assembly
// ---------------------------------------------------------------------------

describe('AC2: System Prompt Assembly', () => {
  it('should read persona file and pass as systemPrompt', async () => {
    const registry = createFakeRegistry();
    const mockQuery = createMockQuery([{ role: 'assistant', content: 'ok' }]);
    const sm = createSessionManager({ registry, projectRoot, queryFn: mockQuery });

    await sm.run({ agentId: 'dev', prompt: 'test' });

    assert.ok(mockQuery._lastOptions.systemPrompt.includes('Dex the Builder'));
  });

  it('should append systemPromptAppend to persona', async () => {
    const registry = createFakeRegistry({ systemPromptAppend: '\nAlways follow TDD.' });
    const mockQuery = createMockQuery([{ role: 'assistant', content: 'ok' }]);
    const sm = createSessionManager({ registry, projectRoot, queryFn: mockQuery });

    await sm.run({ agentId: 'dev', prompt: 'test' });

    assert.ok(mockQuery._lastOptions.systemPrompt.includes('Always follow TDD.'));
    assert.ok(mockQuery._lastOptions.systemPrompt.includes('Dex the Builder'));
  });

  it('should pass settingSources for Layer 2 (CLAUDE.md auto-load)', async () => {
    const registry = createFakeRegistry();
    const mockQuery = createMockQuery([{ role: 'assistant', content: 'ok' }]);
    const sm = createSessionManager({ registry, projectRoot, queryFn: mockQuery });

    await sm.run({ agentId: 'dev', prompt: 'test' });

    assert.deepEqual(mockQuery._lastOptions.settingSources, ['user', 'project']);
  });

  it('should append workflow context to prompt (Layer 3)', async () => {
    const registry = createFakeRegistry();
    const mockQuery = createMockQuery([{ role: 'assistant', content: 'ok' }]);
    const sm = createSessionManager({ registry, projectRoot, queryFn: mockQuery });

    await sm.run({
      agentId: 'dev',
      prompt: 'Implement story E7.1.2',
      workflowContext: {
        storyFile: 'docs/stories/active/7.1.2.story.md',
        phase: 'DEV:IMPLEMENT',
        previousResult: 'PO validated: GO',
      },
    });

    const sentPrompt = mockQuery._lastOptions.prompt;
    assert.ok(sentPrompt.includes('Implement story E7.1.2'));
    assert.ok(sentPrompt.includes('docs/stories/active/7.1.2.story.md'));
    assert.ok(sentPrompt.includes('DEV:IMPLEMENT'));
    assert.ok(sentPrompt.includes('PO validated: GO'));
  });

  it('should throw ConfigError if persona file does not exist', async () => {
    const registry = createFakeRegistry({ systemPromptFile: '.claude/agents/nonexistent.md' });
    const mockQuery = createMockQuery([]);
    const sm = createSessionManager({ registry, projectRoot, queryFn: mockQuery });

    await assert.rejects(
      () => sm.run({ agentId: 'dev', prompt: 'test' }),
      (err) => {
        assert.ok(err instanceof ConfigError);
        assert.ok(err.message.includes('Failed to read system prompt'));
        return true;
      }
    );
  });

  it('should log system prompt length at DEBUG level (AC12)', async () => {
    const registry = createFakeRegistry();
    const mockQuery = createMockQuery([{ role: 'assistant', content: 'ok' }]);
    const logger = createCapturingLogger();
    const sm = createSessionManager({ registry, projectRoot, queryFn: mockQuery, logger });

    await sm.run({ agentId: 'dev', prompt: 'test' });

    const debugEntry = logger.entries.debug.find((e) => e.obj.event === 'system_prompt_loaded');
    assert.ok(debugEntry, 'Should have a debug log for system_prompt_loaded');
    assert.equal(debugEntry.obj.agentId, 'dev');
    assert.ok(typeof debugEntry.obj.length === 'number');
  });
});

// ---------------------------------------------------------------------------
// AC3: Tool Restrictions
// ---------------------------------------------------------------------------

describe('AC3: Tool Restrictions', () => {
  it('should pass allowedTools to query options', async () => {
    const registry = createFakeRegistry({
      allowedTools: ['Read', 'Grep'],
    });
    const mockQuery = createMockQuery([{ role: 'assistant', content: 'ok' }]);
    const sm = createSessionManager({ registry, projectRoot, queryFn: mockQuery });

    await sm.run({ agentId: 'dev', prompt: 'test' });

    assert.deepEqual(mockQuery._lastOptions.allowedTools, ['Read', 'Grep']);
  });

  it('should pass disallowedTools to query options', async () => {
    const registry = createFakeRegistry({
      allowedTools: [],
      disallowedTools: ['Bash', 'Edit'],
    });
    const mockQuery = createMockQuery([{ role: 'assistant', content: 'ok' }]);
    const sm = createSessionManager({ registry, projectRoot, queryFn: mockQuery });

    await sm.run({ agentId: 'dev', prompt: 'test' });

    assert.deepEqual(mockQuery._lastOptions.disallowedTools, ['Bash', 'Edit']);
    assert.equal(mockQuery._lastOptions.allowedTools, undefined);
  });

  it('should not add default tools beyond registry specs', async () => {
    const registry = createFakeRegistry({
      allowedTools: [],
      disallowedTools: [],
    });
    const mockQuery = createMockQuery([{ role: 'assistant', content: 'ok' }]);
    const sm = createSessionManager({ registry, projectRoot, queryFn: mockQuery });

    await sm.run({ agentId: 'dev', prompt: 'test' });

    // Empty arrays should result in undefined (not passed)
    assert.equal(mockQuery._lastOptions.allowedTools, undefined);
    assert.equal(mockQuery._lastOptions.disallowedTools, undefined);
  });
});

// ---------------------------------------------------------------------------
// AC4: Budget Enforcement
// ---------------------------------------------------------------------------

describe('AC4: Budget Enforcement', () => {
  it('should pass maxBudgetUsd as maxCostUsd to query', async () => {
    const registry = createFakeRegistry({ maxBudgetUsd: 15.0 });
    const mockQuery = createMockQuery([{ role: 'assistant', content: 'ok' }]);
    const sm = createSessionManager({ registry, projectRoot, queryFn: mockQuery });

    await sm.run({ agentId: 'dev', prompt: 'test' });

    assert.equal(mockQuery._lastOptions.maxCostUsd, 15.0);
  });

  it('should catch SDK budget error and throw BudgetError', async () => {
    const registry = createFakeRegistry();
    const budgetErr = new Error('Budget exceeded: $15.00 limit reached');
    budgetErr.code = 'BUDGET_EXCEEDED';

    const failQuery = createFailingQuery(budgetErr);
    const sm = createSessionManager({ registry, projectRoot, queryFn: failQuery });

    await assert.rejects(
      () => sm.run({ agentId: 'dev', prompt: 'test' }),
      (err) => {
        assert.ok(err instanceof BudgetError, `Expected BudgetError, got ${err.name}`);
        assert.equal(err.agentId, 'dev');
        assert.ok(err.cause);
        return true;
      }
    );
  });
});

// ---------------------------------------------------------------------------
// AC5: Permission Mode
// ---------------------------------------------------------------------------

describe('AC5: Permission Mode', () => {
  it('should pass permissionMode from agentConfig to query', async () => {
    const registry = createFakeRegistry({ permissionMode: 'bypassPermissions' });
    const mockQuery = createMockQuery([{ role: 'assistant', content: 'ok' }]);
    const sm = createSessionManager({ registry, projectRoot, queryFn: mockQuery });

    await sm.run({ agentId: 'dev', prompt: 'test' });

    assert.equal(mockQuery._lastOptions.permissionMode, 'bypassPermissions');
  });
});

// ---------------------------------------------------------------------------
// AC6: Governance Hooks Integration
// ---------------------------------------------------------------------------

describe('AC6: Governance Hooks', () => {
  it('should pass hooks to query when provided', async () => {
    const registry = createFakeRegistry();
    const mockQuery = createMockQuery([{ role: 'assistant', content: 'ok' }]);
    const sm = createSessionManager({ registry, projectRoot, queryFn: mockQuery });

    const testHooks = { PreToolUse: [{ hooks: [async () => {}] }] };
    await sm.run({ agentId: 'dev', prompt: 'test', hooks: testHooks });

    assert.deepEqual(mockQuery._lastOptions.hooks, testHooks);
  });

  it('should not set hooks when not provided (graceful degradation)', async () => {
    const registry = createFakeRegistry();
    const mockQuery = createMockQuery([{ role: 'assistant', content: 'ok' }]);
    const sm = createSessionManager({ registry, projectRoot, queryFn: mockQuery });

    await sm.run({ agentId: 'dev', prompt: 'test' });

    assert.equal(mockQuery._lastOptions.hooks, undefined);
  });
});

// ---------------------------------------------------------------------------
// AC7: Result Object
// ---------------------------------------------------------------------------

describe('AC7: Result Object', () => {
  it('should return all required fields', async () => {
    const registry = createFakeRegistry();
    const mockQuery = createMockQuery([
      {
        role: 'assistant',
        content: [
          { type: 'tool_use', name: 'Read', input: { file_path: '/tmp/test.txt' } },
          { type: 'text', text: 'File contents read.' },
        ],
      },
      { role: 'assistant', content: 'Final summary of the task.' },
    ]);
    const sm = createSessionManager({ registry, projectRoot, queryFn: mockQuery });

    const result = await sm.run({ agentId: 'dev', prompt: 'test' });

    assert.equal(result.agentId, 'dev');
    assert.equal(result.messages.length, 2);
    assert.equal(typeof result.costUsd, 'number');
    assert.equal(result.summary, 'Final summary of the task.');
    assert.ok(Array.isArray(result.toolCalls));
    assert.equal(result.toolCalls.length, 1);
    assert.equal(result.toolCalls[0].name, 'Read');
    assert.equal(typeof result.durationMs, 'number');
  });

  it('should handle messages with content array for summary', async () => {
    const registry = createFakeRegistry();
    const mockQuery = createMockQuery([
      {
        role: 'assistant',
        content: [
          { type: 'text', text: 'Part 1.' },
          { type: 'text', text: 'Part 2.' },
        ],
      },
    ]);
    const sm = createSessionManager({ registry, projectRoot, queryFn: mockQuery });

    const result = await sm.run({ agentId: 'dev', prompt: 'test' });

    assert.equal(result.summary, 'Part 1.\nPart 2.');
  });

  it('should handle result-type messages for summary', async () => {
    const registry = createFakeRegistry();
    const mockQuery = createMockQuery([
      { type: 'result', result: 'Final result text.' },
    ]);
    const sm = createSessionManager({ registry, projectRoot, queryFn: mockQuery });

    const result = await sm.run({ agentId: 'dev', prompt: 'test' });

    assert.equal(result.summary, 'Final result text.');
  });

  it('should return empty summary if no assistant messages', async () => {
    const registry = createFakeRegistry();
    const mockQuery = createMockQuery([
      { role: 'user', content: 'hello' },
    ]);
    const sm = createSessionManager({ registry, projectRoot, queryFn: mockQuery });

    const result = await sm.run({ agentId: 'dev', prompt: 'test' });

    assert.equal(result.summary, '');
  });

  it('should extract tool_calls from flat tool_use messages', async () => {
    const registry = createFakeRegistry();
    const mockQuery = createMockQuery([
      { type: 'tool_use', name: 'Bash', input: { command: 'ls' } },
      { type: 'tool_use', name: 'Read', input: { file_path: '/tmp/f.txt' } },
      { role: 'assistant', content: 'Done.' },
    ]);
    const sm = createSessionManager({ registry, projectRoot, queryFn: mockQuery });

    const result = await sm.run({ agentId: 'dev', prompt: 'test' });

    assert.equal(result.toolCalls.length, 2);
    assert.equal(result.toolCalls[0].name, 'Bash');
    assert.equal(result.toolCalls[1].name, 'Read');
  });
});

// ---------------------------------------------------------------------------
// AC8: Defensive Cost Extraction
// ---------------------------------------------------------------------------

describe('AC8: Defensive Cost Extraction', () => {
  it('should extract cost from usage.cost field', () => {
    const messages = [{ usage: { cost: 0.0042 } }];
    assert.equal(extractCost(messages), 0.0042);
  });

  it('should extract cost from costUsd field', () => {
    const messages = [{ costUsd: 0.015 }];
    assert.equal(extractCost(messages), 0.015);
  });

  it('should extract cost from usage.total_cost on last message', () => {
    const messages = [
      { role: 'assistant', content: 'hello' },
      { usage: { total_cost: 0.008 } },
    ];
    assert.equal(extractCost(messages), 0.008);
  });

  it('should compute cost from token counts as fallback', () => {
    const messages = [
      { usage: { input_tokens: 1000, output_tokens: 500 } },
    ];
    const cost = extractCost(messages);
    // 1000/1M * 3 + 500/1M * 15 = 0.003 + 0.0075 = 0.0105
    assert.ok(Math.abs(cost - 0.0105) < 0.0001, `Expected ~0.0105, got ${cost}`);
  });

  it('should return 0 for empty messages array', () => {
    assert.equal(extractCost([]), 0);
  });

  it('should return 0 for null/undefined messages', () => {
    assert.equal(extractCost(null), 0);
    assert.equal(extractCost(undefined), 0);
  });

  it('should never throw even with malformed data', () => {
    assert.equal(extractCost([{ usage: null }]), 0);
    assert.equal(extractCost([{ usage: { cost: 'invalid' } }]), 0);
    assert.equal(extractCost('not an array'), 0);
  });

  it('should log warning when no cost data found', () => {
    const logger = createCapturingLogger();
    extractCost([{ role: 'assistant', content: 'hello' }], logger);

    const warn = logger.entries.warn.find((e) => e.obj.event === 'cost_extraction_fallback');
    assert.ok(warn, 'Should log warning about cost fallback');
  });
});

// ---------------------------------------------------------------------------
// AC9: Transient Error Retry
// ---------------------------------------------------------------------------

describe('AC9: Transient Error Retry', () => {
  it('should retry on ECONNRESET and succeed', async () => {
    const registry = createFakeRegistry();
    const econnErr = new Error('read ECONNRESET');
    econnErr.code = 'ECONNRESET';

    const failQuery = createFailingQuery([econnErr], 1);
    const sm = createSessionManager({ registry, projectRoot, queryFn: failQuery });

    const result = await sm.run({ agentId: 'dev', prompt: 'test', maxRetries: 2 });

    assert.equal(result.summary, 'Success after retry');
    assert.equal(failQuery._callCount, 2);
  });

  it('should retry on HTTP 429 and succeed', async () => {
    const registry = createFakeRegistry();
    const rateLimitErr = new Error('Rate limited');
    rateLimitErr.status = 429;

    const failQuery = createFailingQuery([rateLimitErr], 1);
    const sm = createSessionManager({ registry, projectRoot, queryFn: failQuery });

    const result = await sm.run({ agentId: 'dev', prompt: 'test', maxRetries: 2 });

    assert.equal(result.summary, 'Success after retry');
  });

  it('should retry on HTTP 500 and succeed', async () => {
    const registry = createFakeRegistry();
    const serverErr = new Error('Internal server error');
    serverErr.status = 500;

    const failQuery = createFailingQuery([serverErr], 1);
    const sm = createSessionManager({ registry, projectRoot, queryFn: failQuery });

    const result = await sm.run({ agentId: 'dev', prompt: 'test', maxRetries: 2 });

    assert.equal(result.summary, 'Success after retry');
  });

  it('should throw TransientError after all retries exhausted', async () => {
    const registry = createFakeRegistry();
    const err = new Error('connection timeout');

    const failQuery = createFailingQuery([err, err, err]);
    const sm = createSessionManager({ registry, projectRoot, queryFn: failQuery });

    await assert.rejects(
      () => sm.run({ agentId: 'dev', prompt: 'test', maxRetries: 2 }),
      (thrown) => {
        assert.ok(thrown instanceof TransientError, `Expected TransientError, got ${thrown.name}`);
        assert.equal(thrown.agentId, 'dev');
        assert.equal(thrown.attempts, 3);
        assert.ok(thrown.cause);
        return true;
      }
    );
  });

  it('should log retry attempts at INFO level', async () => {
    const registry = createFakeRegistry();
    const err = new Error('EPIPE');
    err.code = 'EPIPE';

    const failQuery = createFailingQuery([err], 1);
    const logger = createCapturingLogger();
    const sm = createSessionManager({ registry, projectRoot, queryFn: failQuery, logger });

    await sm.run({ agentId: 'dev', prompt: 'test', maxRetries: 2 });

    const retryLog = logger.entries.info.find((e) => e.obj.event === 'session_retry');
    assert.ok(retryLog, 'Should log retry attempt');
    assert.equal(retryLog.obj.attempt, 1);
  });

  it('should default to 2 max retries', async () => {
    const registry = createFakeRegistry();
    const err = new Error('ECONNRESET');
    err.code = 'ECONNRESET';

    const failQuery = createFailingQuery([err, err, err]);
    const sm = createSessionManager({ registry, projectRoot, queryFn: failQuery });

    await assert.rejects(
      () => sm.run({ agentId: 'dev', prompt: 'test' }),
      (thrown) => {
        assert.ok(thrown instanceof TransientError);
        assert.equal(thrown.attempts, 3); // initial + 2 retries
        return true;
      }
    );

    // Should have been called 3 times (initial + 2 retries)
    assert.equal(failQuery._callCount, 3);
  });
});

// ---------------------------------------------------------------------------
// AC10: Fatal Error Propagation
// ---------------------------------------------------------------------------

describe('AC10: Fatal Error Propagation', () => {
  it('should propagate budget error as BudgetError', async () => {
    const registry = createFakeRegistry();
    const err = new Error('Budget exceeded');
    err.code = 'BUDGET_EXCEEDED';

    const failQuery = createFailingQuery(err);
    const sm = createSessionManager({ registry, projectRoot, queryFn: failQuery });

    await assert.rejects(
      () => sm.run({ agentId: 'dev', prompt: 'test' }),
      (thrown) => {
        assert.ok(thrown instanceof BudgetError);
        assert.equal(thrown.agentId, 'dev');
        return true;
      }
    );
  });

  it('should propagate auth error as ConfigError', async () => {
    const registry = createFakeRegistry();
    const err = new Error('Invalid API key');
    err.code = 'AUTH_ERROR';

    const failQuery = createFailingQuery(err);
    const sm = createSessionManager({ registry, projectRoot, queryFn: failQuery });

    await assert.rejects(
      () => sm.run({ agentId: 'dev', prompt: 'test' }),
      (thrown) => {
        assert.ok(thrown instanceof ConfigError);
        assert.equal(thrown.agentId, 'dev');
        return true;
      }
    );
  });

  it('should wrap unknown errors as OrchestratorError', async () => {
    const registry = createFakeRegistry();
    const err = new Error('Something completely unexpected');

    const failQuery = createFailingQuery(err);
    const sm = createSessionManager({ registry, projectRoot, queryFn: failQuery });

    await assert.rejects(
      () => sm.run({ agentId: 'dev', prompt: 'test' }),
      (thrown) => {
        assert.ok(thrown instanceof OrchestratorError);
        assert.equal(thrown.agentId, 'dev');
        assert.ok(thrown.cause);
        return true;
      }
    );
  });

  it('all error types should include agentId', async () => {
    const registry = createFakeRegistry();

    // BudgetError
    const budgetErr = new Error('budget limit');
    budgetErr.code = 'BUDGET_EXCEEDED';
    const q1 = createFailingQuery(budgetErr);
    const sm1 = createSessionManager({ registry, projectRoot, queryFn: q1 });
    try { await sm1.run({ agentId: 'dev', prompt: 'test' }); } catch (e) {
      assert.equal(e.agentId, 'dev');
    }

    // ConfigError
    const configErr = new Error('authentication failed');
    const q2 = createFailingQuery(configErr);
    const sm2 = createSessionManager({ registry, projectRoot, queryFn: q2 });
    try { await sm2.run({ agentId: 'dev', prompt: 'test' }); } catch (e) {
      assert.equal(e.agentId, 'dev');
    }
  });
});

// ---------------------------------------------------------------------------
// AC11: No Session Resume
// ---------------------------------------------------------------------------

describe('AC11: No Session Resume', () => {
  it('run() should not accept or return sessionId', async () => {
    const registry = createFakeRegistry();
    const mockQuery = createMockQuery([{ role: 'assistant', content: 'ok' }]);
    const sm = createSessionManager({ registry, projectRoot, queryFn: mockQuery });

    const result = await sm.run({ agentId: 'dev', prompt: 'test' });

    // No sessionId in result
    assert.equal(result.sessionId, undefined);

    // No sessionId in query options
    assert.equal(mockQuery._lastOptions.sessionId, undefined);
    assert.equal(mockQuery._lastOptions.threadId, undefined);
    assert.equal(mockQuery._lastOptions.resumeToken, undefined);
  });
});

// ---------------------------------------------------------------------------
// AC12: Logging
// ---------------------------------------------------------------------------

describe('AC12: Logging', () => {
  it('should log session_start at INFO with agentId, model, maxBudgetUsd', async () => {
    const registry = createFakeRegistry();
    const mockQuery = createMockQuery([{ role: 'assistant', content: 'ok' }]);
    const logger = createCapturingLogger();
    const sm = createSessionManager({ registry, projectRoot, queryFn: mockQuery, logger });

    await sm.run({ agentId: 'dev', prompt: 'test' });

    const startLog = logger.entries.info.find((e) => e.obj.event === 'session_start');
    assert.ok(startLog, 'Should have session_start log');
    assert.equal(startLog.obj.agentId, 'dev');
    assert.equal(startLog.obj.model, 'claude-sonnet-4-6');
    assert.equal(startLog.obj.maxBudgetUsd, 15.0);
  });

  it('should log session_end at INFO with agentId, costUsd, durationMs, toolCallCount', async () => {
    const registry = createFakeRegistry();
    const mockQuery = createMockQuery([
      {
        role: 'assistant',
        content: [
          { type: 'tool_use', name: 'Read', input: {} },
          { type: 'text', text: 'Done' },
        ],
      },
    ]);
    const logger = createCapturingLogger();
    const sm = createSessionManager({ registry, projectRoot, queryFn: mockQuery, logger });

    await sm.run({ agentId: 'dev', prompt: 'test' });

    const endLog = logger.entries.info.find((e) => e.obj.event === 'session_end');
    assert.ok(endLog, 'Should have session_end log');
    assert.equal(endLog.obj.agentId, 'dev');
    assert.equal(typeof endLog.obj.costUsd, 'number');
    assert.equal(typeof endLog.obj.durationMs, 'number');
    assert.equal(endLog.obj.toolCallCount, 1);
  });

  it('should log system prompt length at DEBUG', async () => {
    const registry = createFakeRegistry();
    const mockQuery = createMockQuery([{ role: 'assistant', content: 'ok' }]);
    const logger = createCapturingLogger();
    const sm = createSessionManager({ registry, projectRoot, queryFn: mockQuery, logger });

    await sm.run({ agentId: 'dev', prompt: 'test' });

    const debugLog = logger.entries.debug.find((e) => e.obj.event === 'system_prompt_loaded');
    assert.ok(debugLog, 'Should have system_prompt_loaded debug log');
    assert.ok(debugLog.obj.length > 0, 'Length should be positive');
  });

  it('should work without a logger (null logger fallback)', async () => {
    const registry = createFakeRegistry();
    const mockQuery = createMockQuery([{ role: 'assistant', content: 'ok' }]);
    const sm = createSessionManager({ registry, projectRoot, queryFn: mockQuery });

    // Should not throw
    const result = await sm.run({ agentId: 'dev', prompt: 'test' });
    assert.ok(result);
  });
});

// ---------------------------------------------------------------------------
// Streaming callback (onMessage)
// ---------------------------------------------------------------------------

describe('Streaming callback', () => {
  it('should call onMessage for each streamed message', async () => {
    const registry = createFakeRegistry();
    const mockQuery = createMockQuery([
      { role: 'assistant', content: 'msg 1' },
      { role: 'assistant', content: 'msg 2' },
      { role: 'assistant', content: 'msg 3' },
    ]);
    const sm = createSessionManager({ registry, projectRoot, queryFn: mockQuery });

    const received = [];
    await sm.run({
      agentId: 'dev',
      prompt: 'test',
      onMessage: (msg) => received.push(msg),
    });

    assert.equal(received.length, 3);
    assert.equal(received[0].content, 'msg 1');
  });

  it('should not break if onMessage throws', async () => {
    const registry = createFakeRegistry();
    const mockQuery = createMockQuery([
      { role: 'assistant', content: 'msg 1' },
      { role: 'assistant', content: 'msg 2' },
    ]);
    const sm = createSessionManager({ registry, projectRoot, queryFn: mockQuery });

    const result = await sm.run({
      agentId: 'dev',
      prompt: 'test',
      onMessage: () => { throw new Error('callback error'); },
    });

    // Session should complete despite callback errors
    assert.equal(result.messages.length, 2);
  });
});

// ---------------------------------------------------------------------------
// Error class hierarchy
// ---------------------------------------------------------------------------

describe('Error class hierarchy', () => {
  it('all errors should extend OrchestratorError', () => {
    assert.ok(new ConfigError('test') instanceof OrchestratorError);
    assert.ok(new BudgetError('test') instanceof OrchestratorError);
    assert.ok(new TransientError('test') instanceof OrchestratorError);
  });

  it('all errors should extend Error', () => {
    assert.ok(new OrchestratorError('test') instanceof Error);
    assert.ok(new ConfigError('test') instanceof Error);
    assert.ok(new BudgetError('test') instanceof Error);
    assert.ok(new TransientError('test') instanceof Error);
  });

  it('OrchestratorError should have agentId and cause', () => {
    const cause = new Error('original');
    const err = new OrchestratorError('wrapper', { agentId: 'dev', cause });
    assert.equal(err.agentId, 'dev');
    assert.equal(err.cause, cause);
    assert.equal(err.name, 'OrchestratorError');
  });

  it('BudgetError should have costUsd', () => {
    const err = new BudgetError('budget', { agentId: 'qa', costUsd: 5.23 });
    assert.equal(err.costUsd, 5.23);
    assert.equal(err.name, 'BudgetError');
  });

  it('TransientError should have attempts', () => {
    const err = new TransientError('timeout', { agentId: 'dev', attempts: 3 });
    assert.equal(err.attempts, 3);
    assert.equal(err.name, 'TransientError');
  });
});

// ---------------------------------------------------------------------------
// SDK not available (queryFn not provided and SDK not installed)
// ---------------------------------------------------------------------------

describe('SDK not available', () => {
  it('should throw ConfigError when query function is not available', async () => {
    const registry = createFakeRegistry();
    // Create SM without queryFn and with no SDK installed
    const sm = createSessionManager({
      registry,
      projectRoot,
      queryFn: null, // Explicitly null
    });

    await assert.rejects(
      () => sm.run({ agentId: 'dev', prompt: 'test' }),
      (err) => {
        assert.ok(err instanceof ConfigError);
        assert.ok(err.message.includes('query() function is not available'));
        return true;
      }
    );
  });
});

// ---------------------------------------------------------------------------
// cwd passed to query
// ---------------------------------------------------------------------------

describe('cwd configuration', () => {
  it('should pass projectRoot as cwd to query', async () => {
    const registry = createFakeRegistry();
    const mockQuery = createMockQuery([{ role: 'assistant', content: 'ok' }]);
    const sm = createSessionManager({ registry, projectRoot, queryFn: mockQuery });

    await sm.run({ agentId: 'dev', prompt: 'test' });

    assert.equal(mockQuery._lastOptions.cwd, projectRoot);
  });
});
