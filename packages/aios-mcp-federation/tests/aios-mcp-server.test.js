'use strict';

const path = require('path');
const fs = require('fs');
const { AiosMcpServer } = require('../src/aios-mcp-server');

const CONTRACT_PATH = path.join(__dirname, '..', 'contracts', 'aios-openclaw-contract.yaml');
const PROJECT_ROOT = path.join(__dirname, '..', '..', '..'); // aios-core root

describe('AiosMcpServer', () => {
  let server;

  beforeEach(() => {
    server = new AiosMcpServer({
      contractPath: CONTRACT_PATH,
      projectRoot: PROJECT_ROOT
    });
  });

  describe('create', () => {
    test('creates MCP server successfully', () => {
      const mcpServer = server.create();
      expect(mcpServer).toBeDefined();
    });

    test('throws on invalid contract', () => {
      const badServer = new AiosMcpServer({
        contractPath: '/nonexistent/contract.yaml'
      });
      expect(() => badServer.create()).toThrow('Contract file not found');
    });
  });

  describe('_handleAgentExecute', () => {
    test('accepts valid agent and prompt', async () => {
      server.create();
      const result = await server._handleAgentExecute({
        agent: 'dev',
        prompt: 'Implement the login feature'
      });

      expect(result.success).toBe(true);
      expect(result.agent).toBe('dev');
      expect(result.response).toContain('@dev');
      expect(result.timestamp).toBeDefined();
      expect(result.execution_ms).toBeGreaterThanOrEqual(0);
    });

    test('includes story_id when provided', async () => {
      server.create();
      const result = await server._handleAgentExecute({
        agent: 'qa',
        prompt: 'Run QA gate',
        story_id: 'MCPF-1',
        channel: 'whatsapp'
      });

      expect(result.success).toBe(true);
      expect(result.story_id).toBe('MCPF-1');
      expect(result.response).toContain('MCPF-1');
      expect(result.response).toContain('whatsapp');
    });

    test('rejects unknown agent', async () => {
      server.create();
      await expect(
        server._handleAgentExecute({ agent: 'nonexistent', prompt: 'test' })
      ).rejects.toMatchObject({ code: 'AGENT_NOT_FOUND' });
    });

    test('rejects empty prompt', async () => {
      server.create();
      await expect(
        server._handleAgentExecute({ agent: 'dev', prompt: '' })
      ).rejects.toMatchObject({ code: 'INVALID_PROMPT' });
    });

    test('truncates long prompts in response', async () => {
      server.create();
      const longPrompt = 'x'.repeat(500);
      const result = await server._handleAgentExecute({
        agent: 'dev',
        prompt: longPrompt
      });

      expect(result.response).toContain('...');
      expect(result.response.length).toBeLessThan(longPrompt.length + 200);
    });
  });

  describe('_handleSystemStatus', () => {
    test('returns healthy status with defaults', async () => {
      server.create();
      const result = await server._handleSystemStatus({});

      expect(result.status).toBe('healthy');
      expect(result.timestamp).toBeDefined();
      expect(result.version).toBe('1.0.0');
      expect(result.agents).toBeDefined();
      expect(result.active_stories).toBeDefined();
    });

    test('includes health metrics when requested', async () => {
      server.create();
      const result = await server._handleSystemStatus({ include_health: true });

      expect(result.health).toBeDefined();
      expect(result.health.uptime_seconds).toBeGreaterThanOrEqual(0);
      expect(result.health.memory_mb).toBeGreaterThan(0);
    });

    test('excludes agents when not requested', async () => {
      server.create();
      const result = await server._handleSystemStatus({
        include_agents: false,
        include_stories: false
      });

      expect(result.agents).toBeUndefined();
      expect(result.active_stories).toBeUndefined();
    });

    test('lists all valid agents', async () => {
      server.create();
      const result = await server._handleSystemStatus({ include_agents: true });

      const agentNames = result.agents.map(a => a.name);
      expect(agentNames).toContain('dev');
      expect(agentNames).toContain('qa');
      expect(agentNames).toContain('architect');
      expect(agentNames).toContain('aios-master');
    });
  });

  describe('_handleStoryList', () => {
    test('returns stories from active directory', async () => {
      server.create();
      const result = await server._handleStoryList({ status: 'all', limit: 10 });

      expect(result.stories).toBeDefined();
      expect(Array.isArray(result.stories)).toBe(true);
      expect(result.total).toBeDefined();
    });

    test('respects limit parameter', async () => {
      server.create();
      const result = await server._handleStoryList({ limit: 1 });

      expect(result.stories.length).toBeLessThanOrEqual(1);
    });

    test('each story has required fields', async () => {
      server.create();
      const result = await server._handleStoryList({ limit: 5 });

      for (const story of result.stories) {
        expect(story.id).toBeDefined();
        expect(story.title).toBeDefined();
        expect(story.status).toBeDefined();
      }
    });
  });

  describe('_parseStoryMetadata', () => {
    test('parses standard story format', () => {
      const content = `# Story: TEST-1 — Test Story Title

**Current:** InProgress
**Lead:** @dev (Dex)`;

      const result = server._parseStoryMetadata(content, 'TEST-1.story.md');
      expect(result).toEqual({
        id: 'TEST-1',
        title: 'Test Story Title',
        status: 'InProgress',
        lead: '@dev (Dex)',
        path: 'docs/stories/active/TEST-1.story.md'
      });
    });

    test('returns null for non-story content', () => {
      const result = server._parseStoryMetadata('# Not a story', 'random.md');
      expect(result).toBeNull();
    });
  });
});
