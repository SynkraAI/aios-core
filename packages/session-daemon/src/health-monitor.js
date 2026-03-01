import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { EventEmitter } from 'events';
import { execSync } from 'child_process';

/**
 * Session state machine:
 *
 *   STARTING -> READY -> BUSY -> READY
 *                  |               |
 *                  v               v
 *               PAUSED         RECOVERY -> READY
 *                                  |
 *                                  v
 *                               FAILED
 */
export const SessionState = {
  STARTING: 'STARTING',
  READY: 'READY',
  BUSY: 'BUSY',
  RECOVERY: 'RECOVERY',
  FAILED: 'FAILED',
  PAUSED: 'PAUSED',
};

const VALID_TRANSITIONS = {
  [SessionState.STARTING]: [SessionState.READY, SessionState.FAILED],
  [SessionState.READY]: [SessionState.BUSY, SessionState.PAUSED, SessionState.RECOVERY, SessionState.FAILED],
  [SessionState.BUSY]: [SessionState.READY, SessionState.RECOVERY],
  [SessionState.RECOVERY]: [SessionState.READY, SessionState.FAILED],
  [SessionState.PAUSED]: [SessionState.READY, SessionState.FAILED],
  [SessionState.FAILED]: [SessionState.STARTING],
};

/**
 * HealthMonitor — Tracks daemon & session state, writes health.json periodically.
 *
 * Responsibilities:
 * - Session state machine (STARTING → READY → BUSY → READY)
 * - Periodic health.json writes (every 10s)
 * - Session recovery on failure (max 3 attempts)
 * - Cumulative token/cost tracking
 * - systemd watchdog integration (sd_notify)
 */
export class HealthMonitor extends EventEmitter {
  /**
   * @param {object} opts
   * @param {string} opts.stateDir - .aios/daemon/
   * @param {number} opts.writeIntervalMs - Health write interval (default 10000)
   * @param {number} opts.maxRecoveries - Max recovery attempts before FAILED (default 3)
   * @param {object} opts.logger
   */
  constructor({ stateDir, writeIntervalMs = 10000, maxRecoveries = 3, logger }) {
    super();
    this.stateDir = stateDir;
    this.healthFile = join(stateDir, 'health.json');
    this.writeIntervalMs = writeIntervalMs;
    this.maxRecoveries = maxRecoveries;
    this.logger = logger || console;

    if (!existsSync(stateDir)) mkdirSync(stateDir, { recursive: true });

    // State
    this.state = SessionState.STARTING;
    this.previousState = null;
    this.stateChangedAt = new Date().toISOString();
    this.startedAt = new Date().toISOString();
    this.recoveryCount = 0;
    this.lastError = null;

    // Tracking
    this.currentAgent = 'aios-master';
    this.currentCommandId = null;
    this.commandsProcessed = 0;
    this.commandsFailed = 0;
    this.cumulativeTokens = { input: 0, output: 0 };

    // Timer
    this.timer = null;
  }

  /** Start periodic health writes */
  start() {
    this.timer = setInterval(() => this.writeHealth(), this.writeIntervalMs);
    this.writeHealth();
    this.logger.info({ interval: this.writeIntervalMs }, 'HealthMonitor started');
  }

  /** Stop health writes */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Transition to a new state.
   * @param {string} newState - Target state from SessionState
   * @param {string} [reason] - Reason for transition
   * @returns {boolean} Whether transition was valid
   */
  transition(newState, reason) {
    const valid = VALID_TRANSITIONS[this.state];
    if (!valid || !valid.includes(newState)) {
      this.logger.warn(
        { from: this.state, to: newState, reason },
        'Invalid state transition'
      );
      return false;
    }

    this.previousState = this.state;
    this.state = newState;
    this.stateChangedAt = new Date().toISOString();
    this.logger.info({ from: this.previousState, to: newState, reason }, 'State transition');
    this.emit('state_change', { from: this.previousState, to: newState, reason });
    this.writeHealth();
    return true;
  }

  /** Mark session as ready */
  markReady() {
    this.recoveryCount = 0;
    return this.transition(SessionState.READY, 'session_initialized');
  }

  /** Mark session as busy (processing a command) */
  markBusy(commandId) {
    this.currentCommandId = commandId;
    return this.transition(SessionState.BUSY, `processing ${commandId}`);
  }

  /** Mark command completed, return to ready */
  markIdle() {
    this.currentCommandId = null;
    this.commandsProcessed++;
    return this.transition(SessionState.READY, 'command_completed');
  }

  /** Mark command failed */
  markCommandFailed(error) {
    this.commandsFailed++;
    this.lastError = error?.message || String(error);
    this.currentCommandId = null;
    return this.transition(SessionState.READY, 'command_failed');
  }

  /**
   * Enter recovery mode. Returns whether recovery should be attempted.
   * @param {string} reason
   * @returns {boolean} true if recovery should proceed, false if max reached
   */
  enterRecovery(reason) {
    this.recoveryCount++;
    this.lastError = reason;

    if (this.recoveryCount > this.maxRecoveries) {
      this.transition(SessionState.FAILED, `max_recoveries_exceeded (${this.maxRecoveries})`);
      this.emit('failed', { reason, recoveryCount: this.recoveryCount });
      return false;
    }

    this.transition(SessionState.RECOVERY, `recovery_attempt_${this.recoveryCount}: ${reason}`);
    this.emit('recovery', { attempt: this.recoveryCount, reason });
    return true;
  }

  /** Pause the daemon */
  markPaused(reason = 'manual') {
    return this.transition(SessionState.PAUSED, reason);
  }

  /** Update current agent tracking */
  setAgent(agent) {
    this.currentAgent = agent;
  }

  /** Add token usage */
  addTokens(input, output) {
    this.cumulativeTokens.input += input || 0;
    this.cumulativeTokens.output += output || 0;
  }

  /** Write health.json to disk */
  writeHealth() {
    const health = {
      status: this.state === SessionState.FAILED ? 'dead' : 'alive',
      state: this.state,
      previous_state: this.previousState,
      state_changed_at: this.stateChangedAt,
      pid: process.pid,
      started_at: this.startedAt,
      updated_at: new Date().toISOString(),
      uptime_seconds: Math.floor(process.uptime()),
      current_agent: this.currentAgent,
      current_command: this.currentCommandId,
      commands_processed: this.commandsProcessed,
      commands_failed: this.commandsFailed,
      recovery_count: this.recoveryCount,
      last_error: this.lastError,
      cumulative_tokens: this.cumulativeTokens,
      memory_mb: Math.round(process.memoryUsage().rss / 1024 / 1024),
    };

    try {
      writeFileSync(this.healthFile, JSON.stringify(health, null, 2), 'utf8');
    } catch (err) {
      this.logger.error({ err }, 'Failed to write health file');
    }

    // systemd watchdog: notify alive via sd_notify if available
    this.notifyWatchdog();

    return health;
  }

  /** Write final stopped health on shutdown */
  writeStopped(reason) {
    const health = {
      status: 'stopped',
      state: 'STOPPED',
      previous_state: this.state,
      pid: process.pid,
      started_at: this.startedAt,
      stopped_at: new Date().toISOString(),
      reason,
      commands_processed: this.commandsProcessed,
      commands_failed: this.commandsFailed,
      cumulative_tokens: this.cumulativeTokens,
    };

    try {
      writeFileSync(this.healthFile, JSON.stringify(health, null, 2), 'utf8');
    } catch {
      // Best effort
    }
  }

  /**
   * Notify systemd watchdog (if running under systemd).
   * @param {string} [state='WATCHDOG=1']
   */
  notifyWatchdog(state = 'WATCHDOG=1') {
    const notifySocket = process.env.NOTIFY_SOCKET;
    if (!notifySocket) return;

    try {
      execSync(`echo -n "${state}" | socat - UNIX-SENDTO:${notifySocket}`, {
        timeout: 1000,
        stdio: 'ignore',
      });
    } catch {
      // sd_notify not available or socat not installed — non-fatal
    }
  }

  /** Send sd_notify READY=1 */
  notifyReady() {
    this.notifyWatchdog('READY=1');
  }

  /** Get current health snapshot */
  snapshot() {
    return {
      state: this.state,
      currentAgent: this.currentAgent,
      currentCommand: this.currentCommandId,
      commandsProcessed: this.commandsProcessed,
      commandsFailed: this.commandsFailed,
      recoveryCount: this.recoveryCount,
      lastError: this.lastError,
      uptimeSeconds: Math.floor(process.uptime()),
    };
  }
}
