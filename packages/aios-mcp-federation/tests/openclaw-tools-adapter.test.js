'use strict';

const path = require('path');
const { OpenclawToolsAdapter } = require('../src/openclaw-tools-adapter');

const CONTRACT_PATH = path.join(__dirname, '..', 'contracts', 'aios-openclaw-contract.yaml');

// Mock execFile to avoid actual CLI calls in tests
jest.mock('child_process', () => ({
  execFile: jest.fn((cmd, args, opts, callback) => {
    // If called via promisify, the callback is the 3rd arg
    if (typeof opts === 'function') {
      callback = opts;
      opts = {};
    }
    // Default mock: simulate successful openclaw command
    if (callback) {
      callback(null, { stdout: 'OK\nwhatsapp linked: true', stderr: '' });
    }
  })
}));

const { execFile } = require('child_process');

describe('OpenclawToolsAdapter', () => {
  let adapter;

  beforeEach(() => {
    adapter = new OpenclawToolsAdapter({
      contractPath: CONTRACT_PATH,
      useSudo: false,
      openclawBin: '/usr/bin/openclaw',
      timeout: 5000
    });
    jest.clearAllMocks();

    // Reset execFile to return success by default via promisify pattern
    execFile.mockImplementation((cmd, args, opts, cb) => {
      if (typeof opts === 'function') {
        cb = opts;
        opts = {};
      }
      if (cb) cb(null, 'OK\nwhatsapp linked: true', '');
    });
  });

  describe('getAvailableTools', () => {
    test('returns 3 openclaw tool names', () => {
      const tools = adapter.getAvailableTools();
      expect(tools).toEqual([
        'openclaw_send_message',
        'openclaw_channel_status',
        'openclaw_session_info'
      ]);
    });
  });

  describe('getCircuitState', () => {
    test('starts in closed state', () => {
      const state = adapter.getCircuitState();
      expect(state.state).toBe('closed');
      expect(state.failures).toBe(0);
    });
  });

  describe('execute', () => {
    test('rejects unknown tool', async () => {
      await expect(adapter.execute('unknown_tool', {})).rejects.toMatchObject({
        code: 'INVALID_TOOL'
      });
    });

    test('rejects invalid input against schema', async () => {
      await expect(adapter.execute('openclaw_send_message', {
        // missing required fields: target, message
      })).rejects.toMatchObject({
        code: 'VALIDATION_ERROR'
      });
    });
  });

  describe('_handleSendMessage', () => {
    test('sends message successfully', async () => {
      const result = await adapter._handleSendMessage({
        target: '+5528999301848',
        message: 'Test message'
      });

      expect(result.success).toBe(true);
      expect(result.delivery_status).toBe('sent');
      expect(result.timestamp).toBeDefined();
    });

    test('prepends agent tag when provided', async () => {
      await adapter._handleSendMessage({
        target: '+5528999301848',
        message: 'Test',
        agent_tag: '[AIOS-Master]'
      });

      expect(execFile).toHaveBeenCalled();
      const callArgs = execFile.mock.calls[0][1];
      expect(callArgs).toContain('[AIOS-Master] Test');
    });
  });

  describe('_handleChannelStatus', () => {
    test('returns channel status', async () => {
      const result = await adapter._handleChannelStatus({ channel: 'all' });

      expect(result.channels).toBeDefined();
      expect(result.channels.length).toBeGreaterThan(0);
      expect(result.gateway_status).toBe('running');
      expect(result.timestamp).toBeDefined();
    });

    test('filters by channel', async () => {
      const result = await adapter._handleChannelStatus({ channel: 'whatsapp' });

      expect(result.channels).toHaveLength(1);
      expect(result.channels[0].name).toBe('whatsapp');
    });
  });

  describe('_handleSessionInfo', () => {
    test('returns session info', async () => {
      const result = await adapter._handleSessionInfo({});

      expect(result.session_id).toBe('openclaw-main');
      expect(result.dm_policy).toBe('open');
      expect(result.heartbeat_seconds).toBe(30);
      expect(result.timestamp).toBeDefined();
    });

    test('includes conversations when requested', async () => {
      const result = await adapter._handleSessionInfo({
        include_conversations: true
      });

      expect(result.active_conversations).toBeDefined();
      expect(Array.isArray(result.active_conversations)).toBe(true);
    });

    test('includes agent map when requested', async () => {
      const result = await adapter._handleSessionInfo({
        include_agent_map: true
      });

      expect(result.agent_map).toBeDefined();
      expect(result.agent_map[0].agent).toBe('aios-bridge');
    });
  });

  describe('circuit breaker', () => {
    test('opens circuit after threshold failures', async () => {
      // Force failures by making execFile throw
      execFile.mockImplementation((cmd, args, opts, cb) => {
        if (typeof opts === 'function') {
          cb = opts;
        }
        const err = new Error('Connection refused');
        err.code = 'ECONNREFUSED';
        if (cb) cb(err);
      });

      const failAdapter = new OpenclawToolsAdapter({
        contractPath: CONTRACT_PATH,
        useSudo: false,
        failureThreshold: 2,
        recoveryTimeMs: 100
      });

      // First failure
      try { await failAdapter._handleSendMessage({ target: '+1', message: 'a' }); } catch (e) { /* expected */ }
      failAdapter._onFailure();
      expect(failAdapter.getCircuitState().state).toBe('closed');

      // Second failure (threshold = 2)
      try { await failAdapter._handleSendMessage({ target: '+1', message: 'a' }); } catch (e) { /* expected */ }
      failAdapter._onFailure();
      expect(failAdapter.getCircuitState().state).toBe('open');
    });

    test('resets circuit on success after half-open', async () => {
      adapter._circuitState = 'half_open';
      adapter._failureCount = 3;

      adapter._onSuccess();

      expect(adapter.getCircuitState().state).toBe('closed');
      expect(adapter.getCircuitState().failures).toBe(0);
    });
  });
});
