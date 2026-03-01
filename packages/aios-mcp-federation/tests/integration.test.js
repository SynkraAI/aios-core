'use strict';

const path = require('path');
const { ContractLoader } = require('../src/contract-loader');
const { ContractValidator } = require('../src/contract-validator');
const { AiosMcpServer } = require('../src/aios-mcp-server');
const { OpenclawToolsAdapter } = require('../src/openclaw-tools-adapter');

const CONTRACT_PATH = path.join(__dirname, '..', 'contracts', 'aios-openclaw-contract.yaml');
const PROJECT_ROOT = path.join(__dirname, '..', '..', '..'); // aios-core root

// Mock child_process for OpenClaw adapter
jest.mock('child_process', () => ({
  execFile: jest.fn((cmd, args, opts, cb) => {
    if (typeof opts === 'function') {
      cb = opts;
      opts = {};
    }
    if (cb) cb(null, 'OK\nwhatsapp linked: true', '');
  })
}));

describe('Integration: Contract-First Flow', () => {
  let loader;
  let validator;

  beforeAll(() => {
    loader = new ContractLoader(CONTRACT_PATH);
    validator = new ContractValidator();
  });

  test('contract loads and validates end-to-end', () => {
    const contract = loader.load();
    const result = validator.validateContract(contract);

    expect(result.valid).toBe(true);
    expect(loader.getAiosTools()).toHaveLength(3);
    expect(loader.getOpenclawTools()).toHaveLength(3);
  });

  test('all AIOS tool schemas compile in AJV', () => {
    for (const tool of loader.getAiosTools()) {
      const validInput = validator.validateInput(tool.name, {}, tool);
      // We expect validation to run (may fail due to required fields, but no compile error)
      expect(validInput).toHaveProperty('valid');
      expect(validInput).toHaveProperty('errors');
    }
  });

  test('all OpenClaw tool schemas compile in AJV', () => {
    for (const tool of loader.getOpenclawTools()) {
      const validInput = validator.validateInput(tool.name, {}, tool);
      expect(validInput).toHaveProperty('valid');
      expect(validInput).toHaveProperty('errors');
    }
  });

  test('handoff message validates against protocol schema', () => {
    const handoff = loader.getHandoffProtocol();
    const message = {
      from: 'aios:@dev',
      to: 'openclaw:whatsapp:+5528999301848',
      action: 'notify',
      timestamp: new Date().toISOString(),
      context: {
        story_id: 'MCPF-1',
        agent: 'dev',
        channel: 'whatsapp'
      },
      payload: 'Story MCPF-1 implementation complete. All tests passing.'
    };

    const result = validator.validateHandoffMessage(message, handoff);
    expect(result.valid).toBe(true);
  });

  describe('AIOS MCP Server roundtrip', () => {
    let server;

    beforeEach(() => {
      server = new AiosMcpServer({
        contractPath: CONTRACT_PATH,
        projectRoot: PROJECT_ROOT
      });
      server.create();
    });

    test('agent execute → validate output against contract', async () => {
      const result = await server._handleAgentExecute({
        agent: 'architect',
        prompt: 'Review system architecture',
        channel: 'api'
      });

      const toolDef = loader.getTool('aios_agent_execute');
      const validation = validator.validateOutput('aios_agent_execute', result, toolDef);
      expect(validation.valid).toBe(true);
    });

    test('system status → validate output against contract', async () => {
      const result = await server._handleSystemStatus({
        include_agents: true,
        include_stories: true,
        include_health: true
      });

      const toolDef = loader.getTool('aios_system_status');
      const validation = validator.validateOutput('aios_system_status', result, toolDef);
      expect(validation.valid).toBe(true);
    });

    test('story list → validate output against contract', async () => {
      const result = await server._handleStoryList({ status: 'all', limit: 5 });

      const toolDef = loader.getTool('aios_story_list');
      const validation = validator.validateOutput('aios_story_list', result, toolDef);
      expect(validation.valid).toBe(true);
    });
  });

  describe('OpenClaw Adapter roundtrip', () => {
    let adapter;

    beforeEach(() => {
      adapter = new OpenclawToolsAdapter({
        contractPath: CONTRACT_PATH,
        useSudo: false
      });
    });

    test('send message → validate output against contract', async () => {
      const result = await adapter._handleSendMessage({
        target: '+5528999301848',
        message: 'Integration test message',
        agent_tag: '[AIOS-Test]'
      });

      const toolDef = loader.getTool('openclaw_send_message');
      const validation = validator.validateOutput('openclaw_send_message', result, toolDef);
      expect(validation.valid).toBe(true);
    });

    test('channel status → validate output against contract', async () => {
      const result = await adapter._handleChannelStatus({ channel: 'all' });

      const toolDef = loader.getTool('openclaw_channel_status');
      const validation = validator.validateOutput('openclaw_channel_status', result, toolDef);
      expect(validation.valid).toBe(true);
    });

    test('session info → validate output against contract', async () => {
      const result = await adapter._handleSessionInfo({
        include_conversations: true,
        include_agent_map: true
      });

      const toolDef = loader.getTool('openclaw_session_info');
      const validation = validator.validateOutput('openclaw_session_info', result, toolDef);
      expect(validation.valid).toBe(true);
    });
  });

  describe('Cross-system handoff flow', () => {
    test('AIOS agent execute → handoff message → OpenClaw send', async () => {
      // 1. Agent executes and produces result
      const mcpServer = new AiosMcpServer({
        contractPath: CONTRACT_PATH,
        projectRoot: PROJECT_ROOT
      });
      mcpServer.create();

      const agentResult = await mcpServer._handleAgentExecute({
        agent: 'dev',
        prompt: 'Complete task X',
        story_id: 'MCPF-1'
      });

      expect(agentResult.success).toBe(true);

      // 2. Build handoff message from agent result
      const handoffMessage = {
        from: `aios:@${agentResult.agent}`,
        to: 'openclaw:whatsapp:+5528999301848',
        action: 'notify',
        timestamp: agentResult.timestamp,
        context: {
          story_id: agentResult.story_id,
          agent: agentResult.agent
        },
        payload: agentResult.response
      };

      const handoffValidation = validator.validateHandoffMessage(
        handoffMessage,
        loader.getHandoffProtocol()
      );
      expect(handoffValidation.valid).toBe(true);

      // 3. Send via OpenClaw adapter
      const adapter = new OpenclawToolsAdapter({
        contractPath: CONTRACT_PATH,
        useSudo: false
      });

      const sendResult = await adapter._handleSendMessage({
        target: '+5528999301848',
        message: agentResult.response,
        agent_tag: `[@${agentResult.agent}]`
      });

      expect(sendResult.success).toBe(true);
      expect(sendResult.delivery_status).toBe('sent');
    });
  });
});
