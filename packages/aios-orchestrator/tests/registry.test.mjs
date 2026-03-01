/**
 * Unit tests for Agent Registry Loader
 *
 * Uses Node.js built-in test runner (node --test).
 * Tests: AC2 (all 11 agents), AC3 (model assignment), AC4 (tool restrictions),
 *        AC5 (budget values), AC6 (bash restrictions), AC7 (system prompt files),
 *        AC8 (loader validation), AC9 (test coverage).
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, rmSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the loader
import { loadRegistry } from '../src/registry.mjs';

// Paths
const REGISTRY_PATH = resolve(__dirname, '..', 'agent-registry.json');
const PROJECT_ROOT = resolve(__dirname, '..', '..', '..');

// Load the real registry for reference in tests
const registryData = JSON.parse(readFileSync(REGISTRY_PATH, 'utf-8'));

// All 11 expected agent IDs
const ALL_AGENT_IDS = [
  'sm', 'po', 'dev', 'qa', 'devops',
  'architect', 'pm', 'analyst',
  'data-engineer', 'ux-design-expert', 'aios-master',
];

// ============================================================
// AC2: Agent Registry Content — all 11 agents loadable
// ============================================================

describe('AC2: Agent Registry Content', () => {
  it('should load all 11 agents from agent-registry.json', () => {
    const registry = loadRegistry(REGISTRY_PATH, PROJECT_ROOT);
    const agents = registry.listAgents();

    assert.equal(agents.length, 11, `Expected 11 agents, got ${agents.length}`);

    for (const id of ALL_AGENT_IDS) {
      assert.ok(agents.includes(id), `Agent "${id}" missing from registry`);
    }
  });

  it('each agent should have all required fields', () => {
    const registry = loadRegistry(REGISTRY_PATH, PROJECT_ROOT);
    const requiredFields = [
      'id', 'persona', 'role', 'model', 'maxBudgetUsd',
      'permissionMode', 'allowedTools', 'disallowedTools',
      'systemPromptFile', 'systemPromptAppend', 'bashRestrictions', 'workflows',
    ];

    for (const id of ALL_AGENT_IDS) {
      const agent = registry.getAgent(id);
      for (const field of requiredFields) {
        assert.ok(
          field in agent,
          `Agent "${id}" missing required field "${field}"`
        );
      }
    }
  });

  it('each agent id field should match its registry key', () => {
    const registry = loadRegistry(REGISTRY_PATH, PROJECT_ROOT);
    for (const id of ALL_AGENT_IDS) {
      const agent = registry.getAgent(id);
      assert.equal(agent.id, id, `Agent key "${id}" has mismatched id field "${agent.id}"`);
    }
  });

  it('each agent should have permissionMode set to "bypassPermissions"', () => {
    const registry = loadRegistry(REGISTRY_PATH, PROJECT_ROOT);
    for (const id of ALL_AGENT_IDS) {
      const agent = registry.getAgent(id);
      assert.equal(
        agent.permissionMode, 'bypassPermissions',
        `Agent "${id}" permissionMode should be "bypassPermissions", got "${agent.permissionMode}"`
      );
    }
  });
});

// ============================================================
// AC3: Model Assignment (FR-029)
// ============================================================

describe('AC3: Model Assignment', () => {
  it('architect should use claude-opus-4-6', () => {
    const registry = loadRegistry(REGISTRY_PATH, PROJECT_ROOT);
    assert.equal(registry.getAgent('architect').model, 'claude-opus-4-6');
  });

  it('aios-master should use claude-opus-4-6', () => {
    const registry = loadRegistry(REGISTRY_PATH, PROJECT_ROOT);
    assert.equal(registry.getAgent('aios-master').model, 'claude-opus-4-6');
  });

  it('all other 9 agents should use claude-sonnet-4-6', () => {
    const registry = loadRegistry(REGISTRY_PATH, PROJECT_ROOT);
    const sonnetAgents = ALL_AGENT_IDS.filter((id) => id !== 'architect' && id !== 'aios-master');

    for (const id of sonnetAgents) {
      assert.equal(
        registry.getAgent(id).model, 'claude-sonnet-4-6',
        `Agent "${id}" should use claude-sonnet-4-6, got "${registry.getAgent(id).model}"`
      );
    }
  });
});

// ============================================================
// AC4: Tool Restrictions (FR-010)
// ============================================================

describe('AC4: Tool Restrictions', () => {
  const expectedTools = {
    sm:               { allowed: ['Read', 'Write', 'Grep', 'Glob'], disallowed: ['Bash', 'Edit'] },
    po:               { allowed: ['Read', 'Grep', 'Glob'], disallowed: ['Edit', 'Write', 'Bash'] },
    dev:              { allowed: ['Read', 'Edit', 'Write', 'Bash', 'Grep', 'Glob'], disallowed: [] },
    qa:               { allowed: ['Read', 'Grep', 'Glob', 'Bash'], disallowed: ['Edit', 'Write'] },
    devops:           { allowed: ['Read', 'Bash', 'Grep', 'Glob'], disallowed: ['Edit', 'Write'] },
    architect:        { allowed: ['Read', 'Grep', 'Glob', 'WebSearch', 'WebFetch'], disallowed: ['Edit', 'Write', 'Bash'] },
    pm:               { allowed: ['Read', 'Write', 'Grep', 'Glob'], disallowed: ['Bash', 'Edit'] },
    analyst:          { allowed: ['Read', 'Grep', 'Glob', 'WebSearch', 'WebFetch'], disallowed: ['Edit', 'Write', 'Bash'] },
    'data-engineer':  { allowed: ['Read', 'Edit', 'Write', 'Bash', 'Grep', 'Glob'], disallowed: [] },
    'ux-design-expert': { allowed: ['Read', 'Grep', 'Glob', 'WebSearch'], disallowed: ['Edit', 'Write', 'Bash'] },
    'aios-master':    { allowed: [], disallowed: [] },
  };

  for (const [id, expected] of Object.entries(expectedTools)) {
    it(`${id}: allowedTools should match FR-010`, () => {
      const registry = loadRegistry(REGISTRY_PATH, PROJECT_ROOT);
      const agent = registry.getAgent(id);
      assert.deepEqual(
        agent.allowedTools, expected.allowed,
        `Agent "${id}" allowedTools mismatch`
      );
    });

    it(`${id}: disallowedTools should match FR-010`, () => {
      const registry = loadRegistry(REGISTRY_PATH, PROJECT_ROOT);
      const agent = registry.getAgent(id);
      assert.deepEqual(
        agent.disallowedTools, expected.disallowed,
        `Agent "${id}" disallowedTools mismatch`
      );
    });
  }
});

// ============================================================
// AC5: Budget Values (FR-013)
// ============================================================

describe('AC5: Budget Values', () => {
  const expectedBudgets = {
    sm: 3.0,
    po: 2.0,
    dev: 15.0,
    qa: 5.0,
    devops: 3.0,
    architect: 5.0,
    'aios-master': 20.0,
    pm: 3.0,
    analyst: 3.0,
    'data-engineer': 10.0,
    'ux-design-expert': 2.0,
  };

  for (const [id, expectedBudget] of Object.entries(expectedBudgets)) {
    it(`${id}: maxBudgetUsd should be ${expectedBudget}`, () => {
      const registry = loadRegistry(REGISTRY_PATH, PROJECT_ROOT);
      assert.equal(
        registry.getAgent(id).maxBudgetUsd, expectedBudget,
        `Agent "${id}" budget mismatch`
      );
    });
  }
});

// ============================================================
// AC6: Bash Restrictions
// ============================================================

describe('AC6: Bash Restrictions', () => {
  it('dev.bashRestrictions.blocked should contain git push, gh pr create, gh pr merge, git push --force', () => {
    const registry = loadRegistry(REGISTRY_PATH, PROJECT_ROOT);
    const dev = registry.getAgent('dev');
    assert.notEqual(dev.bashRestrictions, null);
    assert.ok(dev.bashRestrictions.blocked.includes('git push'));
    assert.ok(dev.bashRestrictions.blocked.includes('gh pr create'));
    assert.ok(dev.bashRestrictions.blocked.includes('gh pr merge'));
    assert.ok(dev.bashRestrictions.blocked.includes('git push --force'));
  });

  it('qa.bashRestrictions.blocked should contain git push, gh pr create, gh pr merge', () => {
    const registry = loadRegistry(REGISTRY_PATH, PROJECT_ROOT);
    const qa = registry.getAgent('qa');
    assert.notEqual(qa.bashRestrictions, null);
    assert.ok(qa.bashRestrictions.blocked.includes('git push'));
    assert.ok(qa.bashRestrictions.blocked.includes('gh pr create'));
    assert.ok(qa.bashRestrictions.blocked.includes('gh pr merge'));
  });

  it('data-engineer.bashRestrictions.blocked should contain git push, gh pr create, gh pr merge', () => {
    const registry = loadRegistry(REGISTRY_PATH, PROJECT_ROOT);
    const de = registry.getAgent('data-engineer');
    assert.notEqual(de.bashRestrictions, null);
    assert.ok(de.bashRestrictions.blocked.includes('git push'));
    assert.ok(de.bashRestrictions.blocked.includes('gh pr create'));
    assert.ok(de.bashRestrictions.blocked.includes('gh pr merge'));
  });

  it('devops.bashRestrictions should be null (full git authority)', () => {
    const registry = loadRegistry(REGISTRY_PATH, PROJECT_ROOT);
    assert.equal(registry.getAgent('devops').bashRestrictions, null);
  });

  it('aios-master.bashRestrictions should be null', () => {
    const registry = loadRegistry(REGISTRY_PATH, PROJECT_ROOT);
    assert.equal(registry.getAgent('aios-master').bashRestrictions, null);
  });

  it('agents with Bash in disallowedTools should have bashRestrictions: null', () => {
    const registry = loadRegistry(REGISTRY_PATH, PROJECT_ROOT);
    const agentsWithBashDisallowed = ALL_AGENT_IDS.filter((id) =>
      registry.getAgent(id).disallowedTools.includes('Bash')
    );

    for (const id of agentsWithBashDisallowed) {
      assert.equal(
        registry.getAgent(id).bashRestrictions, null,
        `Agent "${id}" has Bash disallowed but bashRestrictions is not null`
      );
    }
  });
});

// ============================================================
// AC7: System Prompt Files
// ============================================================

describe('AC7: System Prompt Files', () => {
  it('each agent systemPromptFile should point to an existing file', () => {
    const registry = loadRegistry(REGISTRY_PATH, PROJECT_ROOT);
    // loadRegistry already checks this during validation, but let us verify explicitly
    for (const id of ALL_AGENT_IDS) {
      const agent = registry.getAgent(id);
      assert.ok(
        agent.systemPromptFile.startsWith('.claude/commands/AIOS/agents/'),
        `Agent "${id}" systemPromptFile should be in .claude/commands/AIOS/agents/, got "${agent.systemPromptFile}"`
      );
    }
  });
});

// ============================================================
// AC8: Registry Loader — validation errors
// ============================================================

describe('AC8: Registry Loader Validation', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = mkdtempSync(resolve(tmpdir(), 'aios-registry-test-'));
    // Create a dummy agent file so systemPromptFile checks pass in valid tests
    const agentsDir = resolve(tmpDir, '.claude', 'commands', 'AIOS', 'agents');
    mkdirSync(agentsDir, { recursive: true });
    writeFileSync(resolve(agentsDir, 'test.md'), '# Test agent');
  });

  it('should throw if registry file does not exist', () => {
    assert.throws(
      () => loadRegistry('/nonexistent/path.json', PROJECT_ROOT),
      /Failed to read agent registry/
    );
  });

  it('should throw if registry JSON is malformed', () => {
    const badFile = resolve(tmpDir, 'bad.json');
    writeFileSync(badFile, 'not valid json {{{');

    assert.throws(
      () => loadRegistry(badFile, PROJECT_ROOT),
      /Failed to parse agent registry JSON/
    );
  });

  it('should throw if top-level agents key is missing', () => {
    const noAgents = resolve(tmpDir, 'no-agents.json');
    writeFileSync(noAgents, JSON.stringify({ version: '1.0' }));

    assert.throws(
      () => loadRegistry(noAgents, PROJECT_ROOT),
      /must have a top-level "agents" object/
    );
  });

  it('should throw if a required field is missing', () => {
    const incomplete = resolve(tmpDir, 'incomplete.json');
    writeFileSync(incomplete, JSON.stringify({
      agents: {
        sm: { id: 'sm' },
        po: { id: 'po' },
        dev: { id: 'dev' },
        qa: { id: 'qa' },
        devops: { id: 'devops' },
        architect: { id: 'architect' },
        pm: { id: 'pm' },
        analyst: { id: 'analyst' },
        'data-engineer': { id: 'data-engineer' },
        'ux-design-expert': { id: 'ux-design-expert' },
        'aios-master': { id: 'aios-master' },
      },
    }));

    assert.throws(
      () => loadRegistry(incomplete, tmpDir),
      /Missing required field/
    );
  });

  it('should throw if model is not a valid value', () => {
    const badModel = resolve(tmpDir, 'bad-model.json');
    const agents = {};
    for (const id of ALL_AGENT_IDS) {
      agents[id] = {
        id,
        persona: 'Test',
        role: 'Test',
        model: id === 'dev' ? 'claude-invalid-model' : 'claude-sonnet-4-6',
        maxBudgetUsd: 5.0,
        permissionMode: 'bypassPermissions',
        allowedTools: [],
        disallowedTools: [],
        systemPromptFile: '.claude/commands/AIOS/agents/test.md',
        systemPromptAppend: '',
        bashRestrictions: null,
        workflows: [],
      };
    }
    writeFileSync(badModel, JSON.stringify({ agents }));

    assert.throws(
      () => loadRegistry(badModel, tmpDir),
      /must be one of/
    );
  });

  it('should throw if systemPromptFile does not exist on disk', () => {
    const badPrompt = resolve(tmpDir, 'bad-prompt.json');
    const agents = {};
    for (const id of ALL_AGENT_IDS) {
      agents[id] = {
        id,
        persona: 'Test',
        role: 'Test',
        model: 'claude-sonnet-4-6',
        maxBudgetUsd: 5.0,
        permissionMode: 'bypassPermissions',
        allowedTools: [],
        disallowedTools: [],
        systemPromptFile: '.claude/commands/AIOS/agents/nonexistent.md',
        systemPromptAppend: '',
        bashRestrictions: null,
        workflows: [],
      };
    }
    writeFileSync(badPrompt, JSON.stringify({ agents }));

    assert.throws(
      () => loadRegistry(badPrompt, tmpDir),
      /systemPromptFile not found on disk/
    );
  });

  it('should throw if an expected agent is missing from registry', () => {
    const missingAgent = resolve(tmpDir, 'missing.json');
    const agents = {};
    // Only include 10 agents -- omit "aios-master"
    for (const id of ALL_AGENT_IDS.filter((i) => i !== 'aios-master')) {
      agents[id] = {
        id,
        persona: 'Test',
        role: 'Test',
        model: 'claude-sonnet-4-6',
        maxBudgetUsd: 5.0,
        permissionMode: 'bypassPermissions',
        allowedTools: [],
        disallowedTools: [],
        systemPromptFile: '.claude/commands/AIOS/agents/test.md',
        systemPromptAppend: '',
        bashRestrictions: null,
        workflows: [],
      };
    }
    writeFileSync(missingAgent, JSON.stringify({ agents }));

    assert.throws(
      () => loadRegistry(missingAgent, tmpDir),
      /Missing agents in registry.*aios-master/
    );
  });

  it('getAgent should throw for unknown agent ID', () => {
    const registry = loadRegistry(REGISTRY_PATH, PROJECT_ROOT);

    assert.throws(
      () => registry.getAgent('nonexistent'),
      /not found in registry/
    );
  });

  it('should throw if maxBudgetUsd is not a number', () => {
    const badBudget = resolve(tmpDir, 'bad-budget.json');
    const agents = {};
    for (const id of ALL_AGENT_IDS) {
      agents[id] = {
        id,
        persona: 'Test',
        role: 'Test',
        model: 'claude-sonnet-4-6',
        maxBudgetUsd: id === 'dev' ? 'not-a-number' : 5.0,
        permissionMode: 'bypassPermissions',
        allowedTools: [],
        disallowedTools: [],
        systemPromptFile: '.claude/commands/AIOS/agents/test.md',
        systemPromptAppend: '',
        bashRestrictions: null,
        workflows: [],
      };
    }
    writeFileSync(badBudget, JSON.stringify({ agents }));

    assert.throws(
      () => loadRegistry(badBudget, tmpDir),
      /must be a number/
    );
  });

  // Clean up temp dirs
  it('cleanup temp directory', () => {
    if (tmpDir) {
      rmSync(tmpDir, { recursive: true, force: true });
    }
    assert.ok(true);
  });
});

// ============================================================
// Additional: validateConfig API
// ============================================================

describe('validateConfig API', () => {
  it('should validate a correct config without errors', () => {
    const registry = loadRegistry(REGISTRY_PATH, PROJECT_ROOT);

    assert.doesNotThrow(() => {
      registry.validateConfig(registry.getAgent('dev'));
    });
  });

  it('should throw for config with missing fields', () => {
    const registry = loadRegistry(REGISTRY_PATH, PROJECT_ROOT);

    assert.throws(
      () => registry.validateConfig({ id: 'test' }),
      /Missing required field/
    );
  });
});
