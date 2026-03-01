#!/usr/bin/env node

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { parse as parseYaml } from 'yaml';
import pino from 'pino';

import { InboxWatcher } from './inbox-watcher.js';
import { OutboxWriter } from './outbox-writer.js';
import { CommandQueue } from './command-queue.js';
import { SessionAdapter } from './session-adapter.js';
import { StreamProcessor } from './stream-processor.js';
import { HealthMonitor } from './health-monitor.js';

/**
 * SessionDaemon — Main entry point.
 *
 * Wires all components together:
 *   InboxWatcher -> CommandQueue -> SessionAdapter -> StreamProcessor -> OutboxWriter
 *
 * Lifecycle:
 *   1. Load config
 *   2. Initialize logger
 *   3. Create components
 *   4. Wire event handlers
 *   5. Initialize SDK session
 *   6. Start inbox watcher
 *   7. Write health file periodically
 */
export class SessionDaemon {
  /**
   * @param {object} opts
   * @param {string} [opts.configPath] - Path to daemon.yaml
   * @param {string} [opts.cwd] - Working directory (default: process.cwd())
   */
  constructor({ configPath, cwd } = {}) {
    this.cwd = cwd || process.cwd();
    this.configPath = configPath || join(this.cwd, 'packages/session-daemon/config/daemon.yaml');
    this.config = null;
    this.baseDir = null;
    this.stateDir = null;
    this.logger = null;

    // Components
    this.inboxWatcher = null;
    this.outboxWriter = null;
    this.commandQueue = null;
    this.sessionAdapter = null;
    this.streamProcessor = null;
    this.healthMonitor = null;

    // State
    this.startedAt = null;
    this.shuttingDown = false;
  }

  /** Load and parse daemon.yaml */
  loadConfig() {
    if (!existsSync(this.configPath)) {
      throw new Error(`Config not found: ${this.configPath}`);
    }
    const raw = readFileSync(this.configPath, 'utf8');
    this.config = parseYaml(raw);

    // Resolve base directory (.aios/)
    this.baseDir = resolve(this.cwd, '.aios');
    this.stateDir = join(this.baseDir, 'daemon');

    // Ensure directories
    for (const dir of [this.stateDir, join(this.baseDir, 'logs')]) {
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    }
  }

  /** Initialize pino logger */
  initLogger() {
    const logFile = join(this.baseDir, 'logs', 'daemon.log');

    this.logger = pino({
      level: process.env.AIOS_DEBUG ? 'debug' : 'info',
      transport: {
        targets: [
          { target: 'pino/file', options: { destination: logFile }, level: 'debug' },
          { target: 'pino/file', options: { destination: 1 }, level: 'info' },
        ],
      },
    });
  }

  /** Create all components */
  createComponents() {
    const cfg = this.config;

    this.inboxWatcher = new InboxWatcher({
      baseDir: this.baseDir,
      pollIntervalMs: cfg.inbox?.poll_interval_ms || 5000,
      allowedSenders: cfg.authorization?.allowed_senders || [],
      rejectUnknown: cfg.authorization?.reject_unknown ?? true,
      logger: this.logger.child({ component: 'inbox' }),
    });

    this.outboxWriter = new OutboxWriter({
      baseDir: this.baseDir,
      logger: this.logger.child({ component: 'outbox' }),
    });

    this.commandQueue = new CommandQueue({
      maxSize: cfg.queue?.max_size || 50,
      maxRetries: cfg.queue?.max_retries || 3,
      retryBackoffMs: cfg.queue?.retry_backoff_ms || [5000, 15000, 45000],
      stateDir: this.stateDir,
      logger: this.logger.child({ component: 'queue' }),
    });

    this.sessionAdapter = new SessionAdapter({
      sessionConfig: {
        model: cfg.session?.model || 'claude-sonnet-4-5-20250929',
        cwd: cfg.session?.cwd || this.cwd,
        settingSources: cfg.session?.setting_sources || ['user', 'project', 'local'],
        systemPrompt: cfg.session?.system_prompt || { type: 'preset', preset: 'claude_code' },
        permissionMode: cfg.session?.permission_mode || 'bypassPermissions',
        includePartialMessages: cfg.session?.include_partial_messages ?? true,
        persistSession: cfg.session?.persist_session ?? true,
        allowedTools: cfg.session?.allowed_tools,
      },
      stateDir: this.stateDir,
      logger: this.logger.child({ component: 'session' }),
    });

    this.streamProcessor = new StreamProcessor({
      outboxWriter: this.outboxWriter,
      logger: this.logger.child({ component: 'stream' }),
      progressThrottleMs: 3000,
      toolSummaryMaxLen: cfg.observability?.truncate_max_chars || 500,
    });

    this.healthMonitor = new HealthMonitor({
      stateDir: this.stateDir,
      writeIntervalMs: cfg.health?.write_interval_ms || 10000,
      maxRecoveries: cfg.recovery?.max_session_retries || 3,
      logger: this.logger.child({ component: 'health' }),
    });
  }

  /** Wire event handlers between components */
  wireEvents() {
    // InboxWatcher -> CommandQueue (with control message interception)
    this.inboxWatcher.on('command', ({ filename, data, path }) => {
      // Intercept control messages
      if (data.command === '__DAEMON_RESTART__') {
        this.logger.info('Restart control message received');
        this.inboxWatcher.markProcessed(filename);
        this.restartSession('control_message');
        return;
      }

      const result = this.commandQueue.enqueue({ filename, data, path });
      if (!result.accepted) {
        this.outboxWriter.writeError({
          inReplyTo: data.id,
          channel: data.reply_to?.channel || data.source.channel,
          target: data.reply_to?.target ? { sender_id: data.reply_to.target } : undefined,
          message: `Command rejected: ${result.reason}`,
        });
        this.inboxWatcher.markFailed(filename, result.reason);
      } else {
        this.outboxWriter.writeAck({
          inReplyTo: data.id,
          channel: data.reply_to?.channel || data.source.channel,
          target: data.reply_to?.target ? { sender_id: data.reply_to.target } : undefined,
        });
      }
    });

    // CommandQueue -> SessionAdapter -> StreamProcessor
    this.commandQueue.on('process', async (cmd) => {
      const { id, data, filename } = cmd;
      const channel = data.reply_to?.channel || data.source.channel;
      const target = data.reply_to?.target ? { sender_id: data.reply_to.target } : undefined;

      this.healthMonitor.markBusy(id);

      try {
        this.streamProcessor.reset();

        const stream = this.sessionAdapter.sendCommand(data.command, {
          isRetry: cmd.retryCount > 0,
          retryCount: cmd.retryCount,
          commandId: id,
        });

        const result = await this.streamProcessor.process(stream, {
          commandId: id,
          channel,
          target,
        });

        if (result.success) {
          this.commandQueue.complete();
          this.inboxWatcher.markProcessed(filename);
          this.healthMonitor.markIdle();
        } else {
          this.commandQueue.fail(new Error('Stream processing returned failure'));
          this.healthMonitor.markCommandFailed('stream_failure');
        }
      } catch (err) {
        this.logger.error({ err, commandId: id }, 'Command execution failed');
        this.commandQueue.fail(err);
        this.healthMonitor.markCommandFailed(err);
      }
    });

    // CommandQueue failed after all retries -> attempt recovery
    this.commandQueue.on('failed', ({ filename, error }) => {
      this.inboxWatcher.markFailed(filename, 'max_retries_exceeded');
      this.restartSession(`command_failed_max_retries: ${error?.message || 'unknown'}`);
    });

    // StreamProcessor events -> HealthMonitor
    this.streamProcessor.on('agent_switch', ({ to }) => {
      this.healthMonitor.setAgent(to);
    });

    this.streamProcessor.on('session_init', () => {
      this.healthMonitor.writeHealth();
    });

    // HealthMonitor recovery -> restart session
    this.healthMonitor.on('failed', ({ reason }) => {
      this.logger.fatal({ reason }, 'Daemon entering FAILED state — max recoveries exceeded');
      this.outboxWriter.writeError({
        inReplyTo: 'daemon-system',
        channel: 'cli',
        message: `Session daemon FAILED: ${reason}. Manual intervention required.`,
      });
    });
  }

  /**
   * Restart the SDK session (recovery).
   * @param {string} reason
   */
  async restartSession(reason) {
    const shouldRecover = this.healthMonitor.enterRecovery(reason);
    if (!shouldRecover) return;

    this.logger.info({ reason, attempt: this.healthMonitor.recoveryCount }, 'Restarting session...');

    try {
      this.sessionAdapter.close();
      const sessionId = await this.sessionAdapter.initialize();
      this.logger.info({ sessionId }, 'Session restarted successfully');
      this.healthMonitor.markReady();
    } catch (err) {
      this.logger.error({ err }, 'Session restart failed');
      this.restartSession(`restart_failed: ${err.message}`);
    }
  }

  /** Start the daemon */
  async start() {
    this.logger.info('Starting Session Daemon...');
    this.startedAt = new Date().toISOString();

    // Restore queue state from crash
    this.commandQueue.restore();

    // Initialize SDK session
    const sessionId = await this.sessionAdapter.initialize();
    this.logger.info({ sessionId }, 'SDK session ready');
    this.healthMonitor.markReady();

    // Start inbox watcher
    this.inboxWatcher.start();

    // Start health monitor
    this.healthMonitor.start();

    // Signal handlers
    this.setupSignalHandlers();

    this.logger.info('Session Daemon started');
  }

  /** Graceful shutdown */
  async shutdown(signal) {
    if (this.shuttingDown) return;
    this.shuttingDown = true;

    this.logger.info({ signal }, 'Shutting down...');

    // Stop accepting new commands
    this.inboxWatcher.stop();
    this.commandQueue.pause();

    // Stop health monitor
    this.healthMonitor.stop();

    // Close SDK session
    this.sessionAdapter.close();

    // Write final health
    this.healthMonitor.writeStopped(signal);

    this.logger.info('Session Daemon stopped');
    process.exit(0);
  }

  /** Setup signal handlers for graceful shutdown */
  setupSignalHandlers() {
    for (const signal of ['SIGTERM', 'SIGINT', 'SIGHUP']) {
      process.on(signal, () => this.shutdown(signal));
    }

    process.on('uncaughtException', (err) => {
      this.logger.fatal({ err }, 'Uncaught exception');
      this.shutdown('uncaughtException');
    });

    process.on('unhandledRejection', (err) => {
      this.logger.fatal({ err }, 'Unhandled rejection');
      this.shutdown('unhandledRejection');
    });
  }
}

/**
 * Main entry point — run daemon.
 */
async function main() {
  const cwd = process.env.AIOS_CWD || '/home/ubuntu/aios-core';
  const configPath = process.env.AIOS_DAEMON_CONFIG || undefined;

  const daemon = new SessionDaemon({ configPath, cwd });

  daemon.loadConfig();
  daemon.initLogger();
  daemon.createComponents();
  daemon.wireEvents();

  await daemon.start();
}

// Auto-start if run directly
const isDirectRun = process.argv[1]?.endsWith('index.js') || process.argv[1]?.endsWith('session-daemon');
if (isDirectRun) {
  main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

export default SessionDaemon;
