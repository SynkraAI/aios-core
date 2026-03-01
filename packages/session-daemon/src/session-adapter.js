import { query, unstable_v2_createSession, unstable_v2_resumeSession } from '@anthropic-ai/claude-agent-sdk';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * SessionAdapter — Thin wrapper over Claude Agent SDK V2 (with V1 fallback).
 *
 * Isolates V2 API instability per architecture decision (Section 3.6).
 * If V2 fails, falls back to V1 query() with resume option.
 *
 * Key behavior:
 * - Creates persistent sessions with full AIOS context (settingSources, CLAUDE.md, rules)
 * - Maintains session ID for resume after crash
 * - Provides send() + stream() interface regardless of V1/V2 backend
 * - Persists session metadata to .aios/daemon/session.json
 */
export class SessionAdapter {
  /**
   * @param {object} opts
   * @param {object} opts.sessionConfig - SDK session config
   * @param {string} opts.stateDir - .aios/daemon/
   * @param {object} opts.logger
   */
  constructor({ sessionConfig, stateDir, logger }) {
    this.config = {
      model: 'claude-sonnet-4-5-20250929',
      cwd: process.cwd(),
      settingSources: ['user', 'project', 'local'],
      systemPrompt: { type: 'preset', preset: 'claude_code' },
      permissionMode: 'bypassPermissions',
      includePartialMessages: true,
      persistSession: true,
      ...sessionConfig,
    };
    this.stateDir = stateDir;
    this.sessionFile = join(stateDir, 'session.json');
    this.logger = logger || console;

    /** @type {string|null} */
    this.sessionId = null;
    this.useV2 = true;
    this.session = null;
    this.resumeCount = 0;
    this.createdAt = null;
  }

  /**
   * Create a new session or resume an existing one.
   * @param {string} [resumeId] - Session ID to resume
   * @returns {Promise<string>} Session ID
   */
  async initialize(resumeId) {
    // Try to load saved session ID if not provided
    if (!resumeId) {
      resumeId = this.loadSessionId();
    }

    if (resumeId) {
      return this.resumeSession(resumeId);
    }
    return this.createSession();
  }

  /**
   * Create a fresh session.
   * @returns {Promise<string>} Session ID
   */
  async createSession() {
    if (this.useV2) {
      try {
        return await this.createSessionV2();
      } catch (err) {
        this.logger.warn({ err: err.message }, 'V2 createSession failed, falling back to V1');
        this.useV2 = false;
      }
    }
    // V1 fallback: we'll get session ID from first query
    this.sessionId = null;
    this.createdAt = new Date().toISOString();
    this.resumeCount = 0;
    this.logger.info('Session will be created on first command (V1 mode)');
    return 'pending-v1';
  }

  /** @private */
  async createSessionV2() {
    this.logger.info('Creating V2 session...');
    this.session = unstable_v2_createSession({
      model: this.config.model,
      cwd: this.config.cwd,
      settingSources: this.config.settingSources,
      systemPrompt: this.config.systemPrompt,
      permissionMode: this.config.permissionMode,
      includePartialMessages: this.config.includePartialMessages,
      persistSession: this.config.persistSession,
      env: this._getCleanEnv(),
    });

    // V2 session has sessionId available after creation
    this.sessionId = this.session.sessionId;
    this.createdAt = new Date().toISOString();
    this.resumeCount = 0;
    this.persistSessionMeta();
    this.logger.info({ sessionId: this.sessionId }, 'V2 session created');
    return this.sessionId;
  }

  /**
   * Resume an existing session.
   * @param {string} sessionId
   * @returns {Promise<string>} Session ID
   */
  async resumeSession(sessionId) {
    if (this.useV2) {
      try {
        return await this.resumeSessionV2(sessionId);
      } catch (err) {
        this.logger.warn({ err: err.message, sessionId }, 'V2 resumeSession failed, falling back to V1');
        this.useV2 = false;
      }
    }
    // V1 fallback: store session ID for query resume option
    this.sessionId = sessionId;
    this.resumeCount++;
    this.persistSessionMeta();
    this.logger.info({ sessionId }, 'Session will be resumed on next command (V1 mode)');
    return sessionId;
  }

  /** @private */
  async resumeSessionV2(sessionId) {
    this.logger.info({ sessionId }, 'Resuming V2 session...');
    this.session = unstable_v2_resumeSession(sessionId, {
      model: this.config.model,
      cwd: this.config.cwd,
      settingSources: this.config.settingSources,
      systemPrompt: this.config.systemPrompt,
      permissionMode: this.config.permissionMode,
      includePartialMessages: this.config.includePartialMessages,
      env: this._getCleanEnv(),
    });

    this.sessionId = sessionId;
    this.resumeCount++;
    this.persistSessionMeta();
    this.logger.info({ sessionId, resumeCount: this.resumeCount }, 'V2 session resumed');
    return sessionId;
  }

  /**
   * Send a command and return an async generator of SDK messages.
   * This is the core interface — CommandQueue calls this, StreamProcessor consumes the generator.
   *
   * @param {string} command - The raw command text
   * @param {object} [opts] - Override options
   * @param {boolean} [opts.isRetry] - If true, prepend retry context (R4 from validation)
   * @param {number} [opts.retryCount] - Current retry number
   * @param {string} [opts.commandId] - Original command ID for retry context
   * @returns {AsyncGenerator<object>} SDK message stream
   */
  async *sendCommand(command, opts = {}) {
    // R4: Add retry context if this is a retry
    let prompt = command;
    if (opts.isRetry && opts.retryCount > 0) {
      prompt = `[SYSTEM NOTE: This is retry ${opts.retryCount} of command '${opts.commandId || 'unknown'}'. The previous attempt may have partially executed. Check git status and recent file modifications before proceeding.]\n\n${command}`;
    }

    if (this.useV2 && this.session) {
      yield* this.sendV2(prompt);
    } else {
      yield* this.sendV1(prompt);
    }
  }

  /** @private V2: send via session.send() + session.stream() */
  async *sendV2(prompt) {
    await this.session.send(prompt);
    for await (const msg of this.session.stream()) {
      yield msg;
    }
  }

  /** @private Build clean env for SDK (strips nested-session guard) */
  _getCleanEnv() {
    const env = { ...process.env };
    delete env.CLAUDECODE;
    return env;
  }

  /** @private V1: send via query() with resume */
  async *sendV1(prompt) {
    const options = {
      cwd: this.config.cwd,
      settingSources: this.config.settingSources,
      systemPrompt: this.config.systemPrompt,
      permissionMode: this.config.permissionMode,
      model: this.config.model,
      includePartialMessages: this.config.includePartialMessages,
      allowedTools: this.config.allowedTools,
      env: this._getCleanEnv(),
      ...(this.config.maxTurns && { maxTurns: this.config.maxTurns }),
    };

    if (this.sessionId && this.sessionId !== 'pending-v1') {
      options.resume = this.sessionId;
    }

    const q = query({ prompt, options });

    for await (const msg of q) {
      // Capture session ID from init message
      if (msg.type === 'system' && msg.subtype === 'init' && msg.session_id) {
        this.sessionId = msg.session_id;
        this.persistSessionMeta();
      }
      yield msg;
    }
  }

  /**
   * Close the current session gracefully.
   */
  close() {
    if (this.session && typeof this.session.close === 'function') {
      try {
        this.session.close();
      } catch {
        // Session may already be closed
      }
    }
    this.session = null;
    this.logger.info({ sessionId: this.sessionId }, 'Session closed');
  }

  /** Persist session metadata to disk for crash recovery */
  persistSessionMeta() {
    const meta = {
      session_id: this.sessionId,
      created_at: this.createdAt,
      resumed_count: this.resumeCount,
      last_resumed_at: new Date().toISOString(),
      use_v2: this.useV2,
      model: this.config.model,
    };
    try {
      writeFileSync(this.sessionFile, JSON.stringify(meta, null, 2), 'utf8');
    } catch (err) {
      this.logger.error({ err }, 'Failed to persist session metadata');
    }
  }

  /** Load saved session ID from disk */
  loadSessionId() {
    if (!existsSync(this.sessionFile)) return null;
    try {
      const meta = JSON.parse(readFileSync(this.sessionFile, 'utf8'));
      if (meta.session_id && meta.session_id !== 'pending-v1') {
        this.logger.info({ sessionId: meta.session_id }, 'Loaded saved session ID');
        return meta.session_id;
      }
    } catch {
      // Corrupt file, start fresh
    }
    return null;
  }

  /** Get current session info */
  info() {
    return {
      sessionId: this.sessionId,
      useV2: this.useV2,
      createdAt: this.createdAt,
      resumeCount: this.resumeCount,
      model: this.config.model,
    };
  }
}
