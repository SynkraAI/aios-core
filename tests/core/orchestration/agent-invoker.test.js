/**
 * Unit tests for agent-invoker module
 *
 * Tests the AgentInvoker class that provides an interface to invoke
 * agents for tasks during orchestration, with retry logic and audit logging.
 */

jest.mock('fs-extra');
jest.mock('js-yaml');

const fs = require('fs-extra');
const yaml = require('js-yaml');

const {
  AgentInvoker,
  SUPPORTED_AGENTS,
  InvocationStatus,
} = require('../../../.aios-core/core/orchestration/agent-invoker');

describe('AgentInvoker', () => {
  let invoker;

  beforeEach(() => {
    jest.resetAllMocks();
    invoker = new AgentInvoker({ projectRoot: '/project' });
  });

  // ============================================================
  // Constants
  // ============================================================
  describe('constants', () => {
    test('SUPPORTED_AGENTS has all expected agents', () => {
      expect(SUPPORTED_AGENTS.pm).toBeDefined();
      expect(SUPPORTED_AGENTS.architect).toBeDefined();
      expect(SUPPORTED_AGENTS.analyst).toBeDefined();
      expect(SUPPORTED_AGENTS.dev).toBeDefined();
      expect(SUPPORTED_AGENTS.qa).toBeDefined();
      expect(SUPPORTED_AGENTS.devops).toBeDefined();
      expect(SUPPORTED_AGENTS.po).toBeDefined();
    });

    test('each agent has required fields', () => {
      for (const [, agent] of Object.entries(SUPPORTED_AGENTS)) {
        expect(agent.name).toBeDefined();
        expect(agent.displayName).toBeDefined();
        expect(agent.file).toBeDefined();
        expect(Array.isArray(agent.capabilities)).toBe(true);
      }
    });

    test('InvocationStatus has all statuses', () => {
      expect(InvocationStatus.SUCCESS).toBe('success');
      expect(InvocationStatus.FAILED).toBe('failed');
      expect(InvocationStatus.TIMEOUT).toBe('timeout');
      expect(InvocationStatus.SKIPPED).toBe('skipped');
    });
  });

  // ============================================================
  // Constructor
  // ============================================================
  describe('constructor', () => {
    test('sets project root', () => {
      expect(invoker.projectRoot).toBe('/project');
    });

    test('sets default timeout to 300000', () => {
      expect(invoker.defaultTimeout).toBe(300000);
    });

    test('sets default maxRetries to 3', () => {
      expect(invoker.maxRetries).toBe(3);
    });

    test('initializes empty invocations and logs', () => {
      expect(invoker.invocations).toEqual([]);
      expect(invoker.logs).toEqual([]);
    });

    test('accepts custom options', () => {
      const custom = new AgentInvoker({
        projectRoot: '/custom',
        defaultTimeout: 60000,
        maxRetries: 5,
        validateOutput: false,
      });
      expect(custom.projectRoot).toBe('/custom');
      expect(custom.defaultTimeout).toBe(60000);
      expect(custom.maxRetries).toBe(5);
      expect(custom.validateOutput).toBe(false);
    });
  });

  // ============================================================
  // invokeAgent
  // ============================================================
  describe('invokeAgent', () => {
    beforeEach(() => {
      // Default: agent file exists, task file exists
      fs.pathExists.mockResolvedValue(true);
      fs.readFile.mockResolvedValue('# Task content');
    });

    test('returns success for known agent and existing task', async () => {
      const result = await invoker.invokeAgent('dev', 'my-task');

      expect(result.success).toBe(true);
      expect(result.agentName).toBe('dev');
      expect(result.taskPath).toBe('my-task');
      expect(result.invocationId).toBeDefined();
      expect(result.duration).toBeDefined();
    });

    test('strips @ prefix from agent name', async () => {
      const result = await invoker.invokeAgent('@dev', 'my-task');
      expect(result.success).toBe(true);
    });

    test('returns failure for unknown agent', async () => {
      fs.pathExists.mockResolvedValue(false);

      const result = await invoker.invokeAgent('unknown-agent', 'my-task');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown agent');
    });

    test('returns failure when task not found', async () => {
      fs.pathExists.mockResolvedValue(false);

      const result = await invoker.invokeAgent('dev', 'nonexistent-task');

      // Agent also not found since pathExists returns false
      expect(result.success).toBe(false);
    });

    test('records invocation in history', async () => {
      await invoker.invokeAgent('dev', 'my-task');

      expect(invoker.invocations).toHaveLength(1);
      expect(invoker.invocations[0].agentName).toBe('dev');
      expect(invoker.invocations[0].status).toBe('success');
    });

    test('emits invocationComplete on success', async () => {
      const handler = jest.fn();
      invoker.on('invocationComplete', handler);

      await invoker.invokeAgent('dev', 'my-task');

      expect(handler).toHaveBeenCalledWith(expect.objectContaining({
        agentName: 'dev',
        status: 'success',
      }));
    });

    test('emits invocationFailed on failure', async () => {
      fs.pathExists.mockResolvedValue(false);
      const handler = jest.fn();
      invoker.on('invocationFailed', handler);

      await invoker.invokeAgent('unknown-agent', 'task');

      expect(handler).toHaveBeenCalled();
    });

    test('uses custom executor when provided', async () => {
      const executor = jest.fn().mockResolvedValue({ custom: true });
      invoker.executor = executor;

      const result = await invoker.invokeAgent('dev', 'my-task');

      expect(result.success).toBe(true);
      expect(executor).toHaveBeenCalled();
    });

    test('logs invocation messages', async () => {
      await invoker.invokeAgent('dev', 'my-task');

      const logs = invoker.getLogs();
      expect(logs.length).toBeGreaterThan(0);
      expect(logs.some(l => l.message.includes('@dev'))).toBe(true);
    });
  });

  // ============================================================
  // _loadAgent
  // ============================================================
  describe('_loadAgent', () => {
    test('loads known agent with file', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readFile.mockResolvedValue('# Agent definition');

      const agent = await invoker._loadAgent('dev');

      expect(agent.name).toBe('dev');
      expect(agent.loaded).toBe(true);
      expect(agent.content).toBe('# Agent definition');
    });

    test('returns agent config without file when file missing', async () => {
      fs.pathExists.mockResolvedValue(false);

      const agent = await invoker._loadAgent('dev');

      expect(agent.name).toBe('dev');
      expect(agent.loaded).toBe(false);
      expect(agent.content).toBeNull();
    });

    test('returns null for unknown agent', async () => {
      const agent = await invoker._loadAgent('nobody');
      expect(agent).toBeNull();
    });

    test('handles @ prefix', async () => {
      fs.pathExists.mockResolvedValue(false);

      const agent = await invoker._loadAgent('@architect');
      expect(agent.name).toBe('architect');
    });
  });

  // ============================================================
  // _parseTaskMetadata
  // ============================================================
  describe('_parseTaskMetadata', () => {
    test('parses YAML frontmatter', () => {
      yaml.load.mockReturnValue({ title: 'My Task', agent: 'dev' });
      const content = '---\ntitle: My Task\nagent: dev\n---\n# Content';

      const meta = invoker._parseTaskMetadata(content);
      expect(meta.title).toBe('My Task');
      expect(meta.agent).toBe('dev');
    });

    test('extracts title from heading when no frontmatter title', () => {
      const content = '# My Task Title\nSome content';

      const meta = invoker._parseTaskMetadata(content);
      expect(meta.title).toBe('My Task Title');
    });

    test('handles missing frontmatter', () => {
      const content = '# Simple Task\nJust content';

      const meta = invoker._parseTaskMetadata(content);
      expect(meta.title).toBe('Simple Task');
      expect(meta.inputs).toEqual([]);
    });

    test('handles invalid YAML gracefully', () => {
      yaml.load.mockImplementation(() => { throw new Error('parse error'); });
      const content = '---\n{invalid\n---\n# Task';

      const meta = invoker._parseTaskMetadata(content);
      expect(meta.title).toBe('Task');
    });
  });

  // ============================================================
  // _buildContext
  // ============================================================
  describe('_buildContext', () => {
    test('builds structured context', () => {
      const agent = { name: 'dev', displayName: 'Developer', capabilities: ['coding'] };
      const task = { name: 'impl', path: '/task.md', title: 'Implement' };
      const inputs = { feature: 'auth' };

      const ctx = invoker._buildContext(agent, task, inputs);

      expect(ctx.agent.name).toBe('dev');
      expect(ctx.task.name).toBe('impl');
      expect(ctx.inputs.feature).toBe('auth');
      expect(ctx.projectRoot).toBe('/project');
      expect(ctx.orchestration.timeout).toBe(300000);
    });
  });

  // ============================================================
  // _isTransientError
  // ============================================================
  describe('_isTransientError', () => {
    test('timeout is transient', () => {
      expect(invoker._isTransientError(new Error('Connection timeout'))).toBe(true);
    });

    test('ECONNRESET is transient', () => {
      expect(invoker._isTransientError(new Error('ECONNRESET'))).toBe(true);
    });

    test('rate limit is transient', () => {
      expect(invoker._isTransientError(new Error('rate limit exceeded'))).toBe(true);
    });

    test('503 is transient', () => {
      expect(invoker._isTransientError(new Error('HTTP 503'))).toBe(true);
    });

    test('unknown error is not transient', () => {
      expect(invoker._isTransientError(new Error('null pointer'))).toBe(false);
    });

    test('syntax error is not transient', () => {
      expect(invoker._isTransientError(new Error('SyntaxError: unexpected'))).toBe(false);
    });
  });

  // ============================================================
  // _validateTaskOutput
  // ============================================================
  describe('_validateTaskOutput', () => {
    test('passes valid output', () => {
      const schema = {
        required: ['status'],
        properties: { status: { type: 'string' } },
      };

      expect(() => invoker._validateTaskOutput({ status: 'ok' }, schema)).not.toThrow();
    });

    test('throws on missing required field', () => {
      const schema = { required: ['status'] };

      expect(() => invoker._validateTaskOutput({}, schema)).toThrow('Missing required field');
    });

    test('throws on wrong type', () => {
      const schema = {
        properties: { count: { type: 'number' } },
      };

      expect(() => invoker._validateTaskOutput({ count: 'not-a-number' }, schema)).toThrow('expected number');
    });

    test('handles array type check', () => {
      const schema = {
        properties: { items: { type: 'array' } },
      };

      expect(() => invoker._validateTaskOutput({ items: [1, 2] }, schema)).not.toThrow();
      expect(() => invoker._validateTaskOutput({ items: 'not-array' }, schema)).toThrow('expected array');
    });

    test('skips when no schema', () => {
      expect(() => invoker._validateTaskOutput({}, null)).not.toThrow();
    });
  });

  // ============================================================
  // isAgentSupported / getSupportedAgents
  // ============================================================
  describe('agent queries', () => {
    test('isAgentSupported returns true for known agents', () => {
      expect(invoker.isAgentSupported('dev')).toBe(true);
      expect(invoker.isAgentSupported('@qa')).toBe(true);
      expect(invoker.isAgentSupported('ARCHITECT')).toBe(true);
    });

    test('isAgentSupported returns false for unknown agents', () => {
      expect(invoker.isAgentSupported('nobody')).toBe(false);
    });

    test('getSupportedAgents returns copy', () => {
      const agents = invoker.getSupportedAgents();
      agents.custom = { name: 'custom' };
      expect(SUPPORTED_AGENTS.custom).toBeUndefined();
    });
  });

  // ============================================================
  // Invocation audit (AC7)
  // ============================================================
  describe('invocation audit', () => {
    beforeEach(() => {
      fs.pathExists.mockResolvedValue(true);
      fs.readFile.mockResolvedValue('# Task');
    });

    test('getInvocations returns copy', async () => {
      await invoker.invokeAgent('dev', 'task');

      const invocations = invoker.getInvocations();
      invocations.push({ fake: true });

      expect(invoker.invocations).toHaveLength(1);
    });

    test('getInvocation finds by id', async () => {
      await invoker.invokeAgent('dev', 'task');

      const id = invoker.invocations[0].id;
      expect(invoker.getInvocation(id)).toBeDefined();
      expect(invoker.getInvocation('nonexistent')).toBeNull();
    });

    test('getInvocationsForAgent filters by agent', async () => {
      await invoker.invokeAgent('dev', 'task1');
      await invoker.invokeAgent('qa', 'task2');
      await invoker.invokeAgent('dev', 'task3');

      expect(invoker.getInvocationsForAgent('dev')).toHaveLength(2);
      expect(invoker.getInvocationsForAgent('@qa')).toHaveLength(1);
    });

    test('getInvocationSummary returns stats', async () => {
      await invoker.invokeAgent('dev', 'task1');
      await invoker.invokeAgent('qa', 'task2');

      const summary = invoker.getInvocationSummary();

      expect(summary.total).toBe(2);
      expect(summary.byAgent.dev).toBe(1);
      expect(summary.byAgent.qa).toBe(1);
      expect(summary.totalDuration).toBeGreaterThanOrEqual(0);
    });

    test('getInvocationSummary handles empty', () => {
      const summary = invoker.getInvocationSummary();

      expect(summary.total).toBe(0);
      expect(summary.averageDuration).toBe(0);
    });

    test('clearInvocations removes all', async () => {
      await invoker.invokeAgent('dev', 'task');
      invoker.clearInvocations();

      expect(invoker.invocations).toHaveLength(0);
      expect(invoker.logs).toHaveLength(0);
    });

    test('getLogs returns copy', async () => {
      await invoker.invokeAgent('dev', 'task');

      const logs = invoker.getLogs();
      logs.push({ fake: true });

      expect(invoker.logs.length).toBeLessThan(logs.length);
    });
  });
});
