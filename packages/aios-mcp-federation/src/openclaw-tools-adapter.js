'use strict';

const { execFile } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const { ContractLoader } = require('./contract-loader');
const { ContractValidator } = require('./contract-validator');

const execFileAsync = promisify(execFile);

const OPENCLAW_BIN = '/usr/bin/openclaw';
const DEFAULT_TIMEOUT_MS = 15000;

/**
 * Circuit breaker states for OpenClaw availability.
 */
const CircuitState = {
  CLOSED: 'closed',       // Normal operation
  OPEN: 'open',           // Failing, reject calls
  HALF_OPEN: 'half_open'  // Testing recovery
};

/**
 * OpenClaw Tools Adapter — Wraps OpenClaw CLI commands as typed MCP tool calls.
 * Provides contract-validated access to OpenClaw messaging capabilities.
 */
class OpenclawToolsAdapter {
  constructor(options = {}) {
    const contractPath = options.contractPath ||
      path.join(__dirname, '..', 'contracts', 'aios-openclaw-contract.yaml');

    this._loader = new ContractLoader(contractPath);
    this._validator = new ContractValidator();
    this._openclawBin = options.openclawBin || OPENCLAW_BIN;
    this._timeout = options.timeout || DEFAULT_TIMEOUT_MS;
    this._useSudo = options.useSudo !== false;

    // Circuit breaker state
    this._circuitState = CircuitState.CLOSED;
    this._failureCount = 0;
    this._failureThreshold = options.failureThreshold || 3;
    this._recoveryTimeMs = options.recoveryTimeMs || 30000;
    this._lastFailureTime = 0;
  }

  /**
   * Execute a named OpenClaw tool with validated input.
   * @param {string} toolName - Name of the tool (e.g., 'openclaw_send_message')
   * @param {object} input - Tool input parameters
   * @returns {Promise<object>} Validated output
   */
  async execute(toolName, input) {
    // Circuit breaker check
    if (!this._checkCircuit()) {
      throw this._makeError('GATEWAY_UNREACHABLE',
        `OpenClaw circuit breaker is open (${this._failureCount} failures). Will retry after recovery period.`);
    }

    const toolDef = this._loader.getTool(toolName);
    if (!toolDef) {
      throw this._makeError('INVALID_TOOL', `Tool '${toolName}' not found in contract`);
    }

    // Validate input
    const inputValidation = this._validator.validateInput(toolName, input, toolDef);
    if (!inputValidation.valid) {
      throw this._makeError('VALIDATION_ERROR',
        `Input validation failed: ${inputValidation.errors.map(e => e.message).join(', ')}`);
    }

    // Dispatch to handler
    const handler = this._getHandler(toolName);
    if (!handler) {
      throw this._makeError('NOT_IMPLEMENTED', `No handler for tool: ${toolName}`);
    }

    try {
      const result = await handler(input);
      this._onSuccess();

      // Validate output
      const outputValidation = this._validator.validateOutput(toolName, result, toolDef);
      if (!outputValidation.valid) {
        // Log but don't fail — output validation issues are warnings
        result._validation_warnings = outputValidation.errors;
      }

      return result;
    } catch (err) {
      if (err.code !== 'VALIDATION_ERROR' && err.code !== 'NOT_IMPLEMENTED') {
        this._onFailure();
      }
      throw err;
    }
  }

  /**
   * Get all available OpenClaw tool names.
   * @returns {Array<string>} Tool names
   */
  getAvailableTools() {
    return this._loader.getOpenclawTools().map(t => t.name);
  }

  /**
   * Get current circuit breaker state.
   * @returns {{ state: string, failures: number, threshold: number }}
   */
  getCircuitState() {
    return {
      state: this._circuitState,
      failures: this._failureCount,
      threshold: this._failureThreshold
    };
  }

  /**
   * Get handler for a tool name.
   * @private
   */
  _getHandler(toolName) {
    const handlers = {
      'openclaw_send_message': (input) => this._handleSendMessage(input),
      'openclaw_channel_status': (input) => this._handleChannelStatus(input),
      'openclaw_session_info': (input) => this._handleSessionInfo(input)
    };
    return handlers[toolName] || null;
  }

  /**
   * Handler: openclaw_send_message
   */
  async _handleSendMessage(input) {
    const { target, message, agent_tag } = input;

    const fullMessage = agent_tag ? `${agent_tag} ${message}` : message;

    const args = ['message', 'send', '--target', target, '--message', fullMessage];
    const result = await this._execOpenclaw(args);

    return {
      success: result.exitCode === 0,
      message_id: undefined,
      timestamp: new Date().toISOString(),
      delivery_status: result.exitCode === 0 ? 'sent' : 'failed'
    };
  }

  /**
   * Handler: openclaw_channel_status
   */
  async _handleChannelStatus(input) {
    const { channel = 'all' } = input;

    const args = ['status'];
    const result = await this._execOpenclaw(args);

    // Parse openclaw status output
    const channels = this._parseStatusOutput(result.stdout, channel);

    return {
      channels,
      gateway_status: result.exitCode === 0 ? 'running' : 'error',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Handler: openclaw_session_info
   */
  async _handleSessionInfo(input) {
    const args = ['status', '--deep'];
    const result = await this._execOpenclaw(args);

    const sessionData = {
      session_id: 'openclaw-main',
      started_at: undefined,
      dm_policy: 'open',
      model: 'anthropic/claude-sonnet-4-5-20250929',
      heartbeat_seconds: 30,
      timestamp: new Date().toISOString()
    };

    if (input.include_conversations) {
      sessionData.active_conversations = [];
    }

    if (input.include_agent_map) {
      sessionData.agent_map = [
        { agent: 'aios-bridge', channel: 'whatsapp', active: result.exitCode === 0 }
      ];
    }

    return sessionData;
  }

  /**
   * Execute an openclaw CLI command.
   * @private
   */
  async _execOpenclaw(args) {
    try {
      const cmd = this._useSudo ? 'sudo' : this._openclawBin;
      const fullArgs = this._useSudo ? [this._openclawBin, ...args] : args;

      const { stdout, stderr } = await execFileAsync(cmd, fullArgs, {
        timeout: this._timeout,
        encoding: 'utf8'
      });

      return { stdout: stdout || '', stderr: stderr || '', exitCode: 0 };
    } catch (err) {
      if (err.killed || err.signal === 'SIGTERM') {
        throw this._makeError('EXECUTION_TIMEOUT', `OpenClaw command timed out after ${this._timeout}ms`);
      }

      // Command executed but returned non-zero
      if (err.stdout !== undefined) {
        return { stdout: err.stdout || '', stderr: err.stderr || '', exitCode: err.code || 1 };
      }

      // Command failed to execute (binary not found, permission denied, etc.)
      throw this._makeError('GATEWAY_UNREACHABLE', `OpenClaw command failed: ${err.message}`);
    }
  }

  /**
   * Parse openclaw status command output into structured channel data.
   * @private
   */
  _parseStatusOutput(stdout, channelFilter) {
    const channels = [];

    // Basic parsing — openclaw status output varies
    const whatsappLinked = /whatsapp.*linked/i.test(stdout) || /linked.*true/i.test(stdout);

    if (channelFilter === 'all' || channelFilter === 'whatsapp') {
      channels.push({
        name: 'whatsapp',
        linked: whatsappLinked,
        phone: '+5528999301848'
      });
    }

    if (channelFilter === 'all' || channelFilter === 'telegram') {
      channels.push({
        name: 'telegram',
        linked: false
      });
    }

    return channels;
  }

  /**
   * Check if circuit allows execution.
   * @private
   */
  _checkCircuit() {
    if (this._circuitState === CircuitState.CLOSED) return true;

    if (this._circuitState === CircuitState.OPEN) {
      const timeSinceFailure = Date.now() - this._lastFailureTime;
      if (timeSinceFailure >= this._recoveryTimeMs) {
        this._circuitState = CircuitState.HALF_OPEN;
        return true;
      }
      return false;
    }

    // HALF_OPEN — allow one test request
    return true;
  }

  /**
   * Record successful execution.
   * @private
   */
  _onSuccess() {
    this._failureCount = 0;
    this._circuitState = CircuitState.CLOSED;
  }

  /**
   * Record failed execution.
   * @private
   */
  _onFailure() {
    this._failureCount++;
    this._lastFailureTime = Date.now();

    if (this._failureCount >= this._failureThreshold) {
      this._circuitState = CircuitState.OPEN;
    }
  }

  /**
   * Create a typed error.
   * @private
   */
  _makeError(code, message) {
    const err = new Error(message);
    err.code = code;
    return err;
  }
}

module.exports = { OpenclawToolsAdapter };
