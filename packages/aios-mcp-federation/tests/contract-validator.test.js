'use strict';

const path = require('path');
const { ContractLoader } = require('../src/contract-loader');
const { ContractValidator } = require('../src/contract-validator');

const CONTRACT_PATH = path.join(__dirname, '..', 'contracts', 'aios-openclaw-contract.yaml');

describe('ContractLoader', () => {
  let loader;

  beforeEach(() => {
    loader = new ContractLoader(CONTRACT_PATH);
  });

  test('loads contract YAML successfully', () => {
    const contract = loader.load();
    expect(contract).toBeDefined();
    expect(contract.version).toBe('1.0.0');
    expect(contract.protocol).toBe('mcp/2024-11-05');
  });

  test('caches contract on subsequent loads', () => {
    const first = loader.load();
    const second = loader.load();
    expect(first).toBe(second);
  });

  test('throws on missing file', () => {
    const bad = new ContractLoader('/nonexistent/contract.yaml');
    expect(() => bad.load()).toThrow('Contract file not found');
  });

  test('getAiosTools returns 3 tools', () => {
    const tools = loader.getAiosTools();
    expect(tools).toHaveLength(3);
    expect(tools.map(t => t.name)).toEqual([
      'aios_agent_execute',
      'aios_system_status',
      'aios_story_list'
    ]);
  });

  test('getOpenclawTools returns 3 tools', () => {
    const tools = loader.getOpenclawTools();
    expect(tools).toHaveLength(3);
    expect(tools.map(t => t.name)).toEqual([
      'openclaw_send_message',
      'openclaw_channel_status',
      'openclaw_session_info'
    ]);
  });

  test('getAllTools returns 6 tools', () => {
    expect(loader.getAllTools()).toHaveLength(6);
  });

  test('getTool finds existing tool', () => {
    const tool = loader.getTool('aios_agent_execute');
    expect(tool).toBeDefined();
    expect(tool.name).toBe('aios_agent_execute');
    expect(tool.input_schema).toBeDefined();
  });

  test('getTool returns null for unknown tool', () => {
    expect(loader.getTool('nonexistent')).toBeNull();
  });

  test('getMetadata returns contract metadata', () => {
    const meta = loader.getMetadata();
    expect(meta.version).toBe('1.0.0');
    expect(meta.parties.provider.name).toBe('aios-core');
    expect(meta.parties.consumer.name).toBe('openclaw-gateway');
  });

  test('getToolErrors returns error definitions', () => {
    const errors = loader.getToolErrors('aios_agent_execute');
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toHaveProperty('code');
    expect(errors[0]).toHaveProperty('description');
  });

  test('getHandoffProtocol returns handoff config', () => {
    const handoff = loader.getHandoffProtocol();
    expect(handoff.format).toBe('structured');
    expect(handoff.max_payload_tokens).toBe(500);
    expect(handoff.required_fields).toContain('from');
  });
});

describe('ContractValidator', () => {
  let validator;
  let loader;

  beforeEach(() => {
    validator = new ContractValidator();
    loader = new ContractLoader(CONTRACT_PATH);
  });

  describe('validateContract', () => {
    test('validates the real contract successfully', () => {
      const contract = loader.load();
      const result = validator.validateContract(contract);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('rejects null contract', () => {
      const result = validator.validateContract(null);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('null or undefined');
    });

    test('rejects contract missing required fields', () => {
      const result = validator.validateContract({ version: '1.0.0' });
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('rejects invalid version format', () => {
      const result = validator.validateContract({
        version: 'bad',
        protocol: 'mcp/2024-11-05',
        parties: { provider: { name: 'a' }, consumer: { name: 'b' } },
        aios_tools: [],
        openclaw_tools: [],
        handoff: { format: 'structured', required_fields: ['from'], schema: { type: 'object' } }
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('semver'))).toBe(true);
    });

    test('rejects tool missing name', () => {
      const result = validator.validateContract({
        version: '1.0.0',
        protocol: 'mcp/2024-11-05',
        parties: { provider: { name: 'a' }, consumer: { name: 'b' } },
        aios_tools: [{ description: 'no name' }],
        openclaw_tools: [],
        handoff: { format: 'structured', required_fields: ['from'], schema: { type: 'object' } }
      });
      expect(result.valid).toBe(false);
    });
  });

  describe('validateInput', () => {
    test('validates valid aios_agent_execute input', () => {
      const toolDef = loader.getTool('aios_agent_execute');
      const result = validator.validateInput('aios_agent_execute', {
        agent: 'dev',
        prompt: 'Hello agent'
      }, toolDef);
      expect(result.valid).toBe(true);
    });

    test('rejects invalid agent enum', () => {
      const toolDef = loader.getTool('aios_agent_execute');
      const result = validator.validateInput('aios_agent_execute', {
        agent: 'nonexistent_agent',
        prompt: 'Hello'
      }, toolDef);
      expect(result.valid).toBe(false);
    });

    test('rejects missing required fields', () => {
      const toolDef = loader.getTool('aios_agent_execute');
      const result = validator.validateInput('aios_agent_execute', {
        agent: 'dev'
        // missing prompt
      }, toolDef);
      expect(result.valid).toBe(false);
    });

    test('validates openclaw_send_message input', () => {
      const toolDef = loader.getTool('openclaw_send_message');
      const result = validator.validateInput('openclaw_send_message', {
        target: '+5528999301848',
        message: 'Test message'
      }, toolDef);
      expect(result.valid).toBe(true);
    });

    test('rejects missing tool definition', () => {
      const result = validator.validateInput('test', {}, null);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateOutput', () => {
    test('validates valid aios_system_status output', () => {
      const toolDef = loader.getTool('aios_system_status');
      const result = validator.validateOutput('aios_system_status', {
        status: 'healthy',
        timestamp: '2026-02-28T12:00:00.000Z',
        version: '1.0.0'
      }, toolDef);
      expect(result.valid).toBe(true);
    });

    test('rejects invalid status enum', () => {
      const toolDef = loader.getTool('aios_system_status');
      const result = validator.validateOutput('aios_system_status', {
        status: 'invalid_status',
        timestamp: '2026-02-28T12:00:00.000Z'
      }, toolDef);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateHandoffMessage', () => {
    test('validates valid handoff message', () => {
      const handoff = loader.getHandoffProtocol();
      const result = validator.validateHandoffMessage({
        from: 'aios:@dev',
        to: 'openclaw:whatsapp',
        action: 'notify',
        timestamp: '2026-02-28T12:00:00.000Z',
        payload: 'Task completed'
      }, handoff);
      expect(result.valid).toBe(true);
    });

    test('rejects invalid action enum', () => {
      const handoff = loader.getHandoffProtocol();
      const result = validator.validateHandoffMessage({
        from: 'aios:@dev',
        to: 'openclaw:whatsapp',
        action: 'invalid_action',
        timestamp: '2026-02-28T12:00:00.000Z'
      }, handoff);
      expect(result.valid).toBe(false);
    });

    test('rejects missing required fields', () => {
      const handoff = loader.getHandoffProtocol();
      const result = validator.validateHandoffMessage({
        from: 'aios:@dev'
        // missing to, action, timestamp
      }, handoff);
      expect(result.valid).toBe(false);
    });
  });
});
