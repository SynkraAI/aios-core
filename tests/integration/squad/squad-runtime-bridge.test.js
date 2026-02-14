/**
 * Squad Runtime Bridge — Integration Tests
 *
 * Tests the process-based bridge between AIOS orchestration
 * and squad agent runtimes (entry.ts ↔ SquadExecutor ↔ AgentInvoker).
 *
 * @version 1.0.0
 */

const path = require('path');
const fs = require('fs-extra');
const os = require('os');

const {
  AgentInvoker,
  SUPPORTED_AGENTS,
} = require('../../../.aios-core/core/orchestration/agent-invoker');

const {
  SquadExecutor,
  DEFAULT_TIMEOUT,
  ENTRY_POINT_FILE,
} = require('../../../.aios-core/core/orchestration/squad-executor');

const {
  SquadLoader,
} = require('../../../.aios-core/development/scripts/squad/squad-loader');

const {
  detectStoryType,
  assignExecutor,
  EXECUTOR_ASSIGNMENT_TABLE,
} = require('../../../.aios-core/core/orchestration/executor-assignment');

// ═══════════════════════════════════════════════════════════════════════════════
//                          FIXTURES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Create a minimal squad structure for testing
 */
async function createTestSquad(baseDir, squadName = 'test-squad') {
  const squadPath = path.join(baseDir, 'squads', squadName);
  await fs.ensureDir(path.join(squadPath, 'agents'));
  await fs.ensureDir(path.join(squadPath, 'tasks'));
  await fs.ensureDir(path.join(squadPath, 'src'));

  // Create squad.yaml manifest
  await fs.writeFile(
    path.join(squadPath, 'squad.yaml'),
    `name: ${squadName}
version: 1.0.0
description: Test squad for integration testing
slashPrefix: test
aios:
  type: squad
  minVersion: "2.1.0"
components:
  agents:
    - alpha-agent.md
    - beta-agent.md
  tasks:
    - do-something.md
`,
  );

  // Create agent files
  await fs.writeFile(
    path.join(squadPath, 'agents', 'alpha-agent.md'),
    '# Alpha Agent\n\n## Role\nTest agent alpha\n\n## Capabilities\n- testing\n- validation\n',
  );
  await fs.writeFile(
    path.join(squadPath, 'agents', 'beta-agent.md'),
    '# Beta Agent\n\n## Role\nTest agent beta\n\n## Capabilities\n- processing\n',
  );

  // Create task file
  await fs.writeFile(
    path.join(squadPath, 'tasks', 'do-something.md'),
    '# Do Something\n\ntask: do-something\nresponsavel: alpha-agent\nresponsavel_type: agent\natomic_layer: execution\nEntrada: { data: string }\nSaida: { result: string }\nChecklist:\n- [ ] Process data\n',
  );

  // Create a simple entry.ts that echoes back input as a successful result
  await fs.writeFile(
    path.join(squadPath, 'src', 'entry.ts'),
    `// Test entry point — echoes input back as result
const chunks: Buffer[] = [];
process.stdin.on('data', (chunk) => chunks.push(chunk));
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(Buffer.concat(chunks).toString('utf-8'));
    const result = {
      success: true,
      output: {
        echo: true,
        agentId: input.agentId,
        taskName: input.taskName,
        parameters: input.parameters,
      },
      metadata: {
        bridge: 'test-entry',
        timestamp: new Date().toISOString(),
      },
    };
    process.stdout.write(JSON.stringify(result) + '\\n');
    process.exit(0);
  } catch (err: any) {
    const errorResult = {
      success: false,
      output: null,
      errors: [err.message],
    };
    process.stdout.write(JSON.stringify(errorResult) + '\\n');
    process.exit(1);
  }
});
`,
  );

  return squadPath;
}

// ═══════════════════════════════════════════════════════════════════════════════
//                          TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Squad Runtime Bridge', () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = path.join(os.tmpdir(), `squad-bridge-test-${Date.now()}`);
    await fs.ensureDir(tempDir);
    // Create AIOS structure
    await fs.ensureDir(path.join(tempDir, '.aios-core', 'development', 'agents'));
    await fs.ensureDir(path.join(tempDir, '.aios-core', 'development', 'tasks'));
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 1. SquadExecutor
  // ═════════════════════════════════════════════════════════════════════════

  describe('SquadExecutor', () => {
    it('should initialize with default options', () => {
      const executor = new SquadExecutor({ projectRoot: tempDir });
      expect(executor.projectRoot).toBe(tempDir);
      expect(executor.timeout).toBe(DEFAULT_TIMEOUT);
    });

    it('should detect entry point existence', async () => {
      await createTestSquad(tempDir, 'my-squad');

      const executor = new SquadExecutor({
        projectRoot: tempDir,
        squadsPath: path.join(tempDir, 'squads'),
      });

      const hasEntry = await executor.hasEntryPoint('my-squad');
      expect(hasEntry).toBe(true);
    });

    it('should return false for squad without entry point', async () => {
      const squadPath = path.join(tempDir, 'squads', 'empty-squad');
      await fs.ensureDir(squadPath);
      await fs.writeFile(
        path.join(squadPath, 'squad.yaml'),
        'name: empty-squad\nversion: 1.0.0\naios:\n  type: squad\n  minVersion: "2.1.0"\n',
      );

      const executor = new SquadExecutor({
        projectRoot: tempDir,
        squadsPath: path.join(tempDir, 'squads'),
      });

      const hasEntry = await executor.hasEntryPoint('empty-squad');
      expect(hasEntry).toBe(false);
    });

    it('should execute squad task via entry point', async () => {
      await createTestSquad(tempDir, 'echo-squad');

      const executor = new SquadExecutor({
        projectRoot: tempDir,
        squadsPath: path.join(tempDir, 'squads'),
        timeout: 30000,
      });

      const result = await executor.executeSquadTask(
        'echo-squad',
        'alpha-agent',
        'do-something',
        { data: 'hello' },
      );

      expect(result.success).toBe(true);
      expect(result.output).toBeDefined();
      expect(result.output.echo).toBe(true);
      expect(result.output.agentId).toBe('alpha-agent');
      expect(result.output.taskName).toBe('do-something');
      expect(result.output.parameters).toEqual({ data: 'hello' });
    }, 30000);

    it('should handle non-existent squad gracefully', async () => {
      const executor = new SquadExecutor({
        projectRoot: tempDir,
        squadsPath: path.join(tempDir, 'squads'),
      });

      await expect(
        executor.executeSquadTask('nonexistent-squad', 'agent', 'task', {}),
      ).rejects.toThrow(/not found/i);
    });

    it('should create executor function for AgentInvoker', () => {
      const executor = new SquadExecutor({ projectRoot: tempDir });
      const fn = executor.createExecutorFn();
      expect(typeof fn).toBe('function');
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 2. AgentInvoker — Squad Registration
  // ═════════════════════════════════════════════════════════════════════════

  describe('AgentInvoker — Squad Registration', () => {
    let invoker;

    beforeEach(() => {
      invoker = new AgentInvoker({ projectRoot: tempDir });
    });

    it('should register squad agents with namespace prefix', () => {
      invoker.registerSquadAgents('test-squad', 'test', [
        'alpha-agent.md',
        'beta-agent.md',
      ]);

      expect(invoker.isSquadAgent('test:alpha-agent')).toBe(true);
      expect(invoker.isSquadAgent('test:beta-agent')).toBe(true);
      expect(invoker.isSquadAgent('dev')).toBe(false);
    });

    it('should make squad agents pass isAgentSupported()', () => {
      invoker.registerSquadAgents('test-squad', 'test', ['alpha-agent.md']);

      expect(invoker.isAgentSupported('test:alpha-agent')).toBe(true);
      expect(invoker.isAgentSupported('@test:alpha-agent')).toBe(true);
    });

    it('should return squad agent config from getSquadAgents()', () => {
      invoker.registerSquadAgents('test-squad', 'test', ['alpha-agent.md']);

      const agents = invoker.getSquadAgents();
      expect(agents.size).toBe(1);

      const config = agents.get('test:alpha-agent');
      expect(config.squadName).toBe('test-squad');
      expect(config.squadAgentId).toBe('alpha-agent');
      expect(config.isSquadAgent).toBe(true);
    });

    it('should not interfere with core SUPPORTED_AGENTS', () => {
      invoker.registerSquadAgents('test-squad', 'test', ['alpha-agent.md']);

      // Core agents still work
      expect(invoker.isAgentSupported('dev')).toBe(true);
      expect(invoker.isAgentSupported('architect')).toBe(true);

      // Core agent is NOT a squad agent
      expect(invoker.isSquadAgent('dev')).toBe(false);
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 3. AgentInvoker — loadSquads()
  // ═════════════════════════════════════════════════════════════════════════

  describe('AgentInvoker — loadSquads()', () => {
    it('should auto-discover and register squad agents', async () => {
      await createTestSquad(tempDir, 'test-squad');

      const invoker = new AgentInvoker({ projectRoot: tempDir });
      const summary = await invoker.loadSquads(path.join(tempDir, 'squads'));

      expect(summary.squadsFound).toBe(1);
      expect(summary.agentsRegistered).toBe(2);
      expect(summary.errors).toHaveLength(0);

      // Verify agents registered with prefix from manifest
      expect(invoker.isSquadAgent('test:alpha-agent')).toBe(true);
      expect(invoker.isSquadAgent('test:beta-agent')).toBe(true);
    });

    it('should skip squads without entry point', async () => {
      const squadPath = path.join(tempDir, 'squads', 'no-entry-squad');
      await fs.ensureDir(path.join(squadPath, 'agents'));
      await fs.ensureDir(path.join(squadPath, 'tasks'));
      await fs.writeFile(
        path.join(squadPath, 'squad.yaml'),
        'name: no-entry-squad\nversion: 1.0.0\nslashPrefix: noentry\naios:\n  type: squad\n  minVersion: "2.1.0"\ncomponents:\n  agents:\n    - orphan-agent.md\n  tasks: []\n',
      );
      await fs.writeFile(
        path.join(squadPath, 'agents', 'orphan-agent.md'),
        '# Orphan Agent\n',
      );

      const invoker = new AgentInvoker({ projectRoot: tempDir });
      const summary = await invoker.loadSquads(path.join(tempDir, 'squads'));

      expect(summary.squadsFound).toBe(1);
      expect(summary.agentsRegistered).toBe(0);
      expect(summary.errors.length).toBeGreaterThan(0);
    });

    it('should handle empty squads directory', async () => {
      await fs.ensureDir(path.join(tempDir, 'squads'));

      const invoker = new AgentInvoker({ projectRoot: tempDir });
      const summary = await invoker.loadSquads(path.join(tempDir, 'squads'));

      expect(summary.squadsFound).toBe(0);
      expect(summary.agentsRegistered).toBe(0);
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 4. AgentInvoker — Squad Task Routing
  // ═════════════════════════════════════════════════════════════════════════

  describe('AgentInvoker — Squad Task Routing', () => {
    it('should route squad agent invocation through SquadExecutor', async () => {
      await createTestSquad(tempDir, 'route-squad');

      const invoker = new AgentInvoker({ projectRoot: tempDir });
      await invoker.loadSquads(path.join(tempDir, 'squads'));

      // Create a task file for the invoker
      const tasksDir = path.join(tempDir, '.aios-core', 'development', 'tasks');
      await fs.writeFile(
        path.join(tasksDir, 'do-something.md'),
        '# Do Something\n\nA test task.',
      );

      const result = await invoker.invokeAgent(
        'test:alpha-agent',
        'do-something',
        { data: 'test-payload' },
      );

      expect(result.success).toBe(true);
      expect(result.result).toBeDefined();
      expect(result.result.output.echo).toBe(true);
      expect(result.result.output.agentId).toBe('alpha-agent');
    }, 30000);

    it('should still route core agents normally', async () => {
      const invoker = new AgentInvoker({ projectRoot: tempDir });

      // Create dev agent file
      await fs.writeFile(
        path.join(tempDir, '.aios-core', 'development', 'agents', 'dev.md'),
        '# Developer Agent\n',
      );

      // Create task file
      await fs.writeFile(
        path.join(tempDir, '.aios-core', 'development', 'tasks', 'sample.md'),
        '# Sample Task\n',
      );

      const result = await invoker.invokeAgent('dev', 'sample', {});

      expect(result.success).toBe(true);
      // Core agents use simulated result
      expect(result.result.status).toBe('simulated');
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 5. Executor Assignment — Healthcare Story Type
  // ═════════════════════════════════════════════════════════════════════════

  describe('Executor Assignment — Healthcare', () => {
    it('should have healthcare story type in assignment table', () => {
      expect(EXECUTOR_ASSIGNMENT_TABLE.healthcare).toBeDefined();
      expect(EXECUTOR_ASSIGNMENT_TABLE.healthcare.executor).toBe('@finhealth:supervisor-agent');
      expect(EXECUTOR_ASSIGNMENT_TABLE.healthcare.quality_gate).toBe('@architect');
    });

    it('should detect healthcare story type from billing content', () => {
      const type = detectStoryType('Validate TISS billing guide for hospital insurer');
      expect(type).toBe('healthcare');
    });

    it('should detect healthcare story type from glosa content', () => {
      const type = detectStoryType('Audit medical account and check glosa risk score');
      expect(type).toBe('healthcare');
    });

    it('should detect healthcare story type from SUS content', () => {
      const type = detectStoryType('Generate SUS BPA report for hospital faturamento');
      expect(type).toBe('healthcare');
    });

    it('should detect healthcare story type from reconciliation content', () => {
      const type = detectStoryType('Reconciliation of cashflow payments from health insurer');
      expect(type).toBe('healthcare');
    });

    it('should assign supervisor agent for healthcare stories', () => {
      const assignment = assignExecutor('healthcare');
      expect(assignment.executor).toBe('@finhealth:supervisor-agent');
      expect(assignment.quality_gate).toBe('@architect');
      expect(assignment.quality_gate_tools).toContain('healthcare_compliance');
    });

    it('should not affect core story type detection', () => {
      // Code general should still work
      expect(detectStoryType('Implement user authentication handler')).toBe('code_general');
      // Database should still work
      expect(detectStoryType('Create RLS policies for user table schema')).toBe('database');
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 6. SquadLoader — Discovery
  // ═════════════════════════════════════════════════════════════════════════

  describe('SquadLoader — Discovery for Bridge', () => {
    it('should find squad with manifest', async () => {
      await createTestSquad(tempDir, 'disco-squad');

      const loader = new SquadLoader({
        squadsPath: path.join(tempDir, 'squads'),
      });

      const squads = await loader.listLocal();
      expect(squads.length).toBe(1);
      expect(squads[0].name).toBe('disco-squad');
    });

    it('should load manifest with agents list', async () => {
      const squadPath = await createTestSquad(tempDir, 'manifest-squad');

      const loader = new SquadLoader({
        squadsPath: path.join(tempDir, 'squads'),
      });

      const manifest = await loader.loadManifest(squadPath);
      expect(manifest.components.agents).toEqual([
        'alpha-agent.md',
        'beta-agent.md',
      ]);
      expect(manifest.slashPrefix).toBe('test');
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 7. Real finhealth-squad (if present)
  // ═════════════════════════════════════════════════════════════════════════

  describe('FinHealth Squad (real)', () => {
    const realSquadsPath = path.join(__dirname, '..', '..', '..', 'squads');
    const finhealthPath = path.join(realSquadsPath, 'finhealth-squad');

    // Skip if finhealth-squad doesn't exist in the repo
    const squadExists = fs.existsSync(path.join(finhealthPath, 'squad.yaml'));

    (squadExists ? it : it.skip)(
      'should discover finhealth-squad and its 5 agents',
      async () => {
        const loader = new SquadLoader({ squadsPath: realSquadsPath });
        const manifest = await loader.loadManifest(finhealthPath);

        expect(manifest.name).toBe('finhealth-squad');
        expect(manifest.slashPrefix).toBe('finhealth');
        expect(manifest.components.agents).toHaveLength(5);
        expect(manifest.components.agents).toContain('billing-agent.md');
        expect(manifest.components.agents).toContain('supervisor-agent.md');
      },
    );

    (squadExists ? it : it.skip)(
      'should have entry point at src/entry.ts',
      () => {
        const entryPath = path.join(finhealthPath, ENTRY_POINT_FILE);
        expect(fs.existsSync(entryPath)).toBe(true);
      },
    );

    (squadExists ? it : it.skip)(
      'should register all finhealth agents via loadSquads()',
      async () => {
        const projectRoot = path.join(__dirname, '..', '..', '..');
        const invoker = new AgentInvoker({ projectRoot });
        const summary = await invoker.loadSquads(realSquadsPath);

        expect(summary.agentsRegistered).toBeGreaterThanOrEqual(5);
        expect(invoker.isSquadAgent('finhealth:billing-agent')).toBe(true);
        expect(invoker.isSquadAgent('finhealth:auditor-agent')).toBe(true);
        expect(invoker.isSquadAgent('finhealth:reconciliation-agent')).toBe(true);
        expect(invoker.isSquadAgent('finhealth:cashflow-agent')).toBe(true);
        expect(invoker.isSquadAgent('finhealth:supervisor-agent')).toBe(true);
      },
    );
  });
});
