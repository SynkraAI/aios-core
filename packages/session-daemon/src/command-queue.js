import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { EventEmitter } from 'events';

/**
 * CommandQueue — FIFO queue with sequential processing guarantee.
 *
 * Design decisions:
 * - Strict FIFO (priority field is informational, not used for sorting — R3/V6.4)
 * - max_size=50 with reject overflow (R3 from validation)
 * - Persists state to .aios/daemon/queue.json for crash recovery
 * - One command at a time: dequeue blocks until current stream completes
 */
export class CommandQueue extends EventEmitter {
  /**
   * @param {object} opts
   * @param {number} opts.maxSize
   * @param {number} opts.maxRetries
   * @param {number[]} opts.retryBackoffMs
   * @param {string} opts.stateDir - .aios/daemon/
   * @param {object} opts.logger
   */
  constructor({ maxSize = 50, maxRetries = 3, retryBackoffMs = [5000, 15000, 45000], stateDir, logger }) {
    super();
    this.maxSize = maxSize;
    this.maxRetries = maxRetries;
    this.retryBackoffMs = retryBackoffMs;
    this.stateDir = stateDir;
    this.stateFile = join(stateDir, 'queue.json');
    this.logger = logger || console;

    /** @type {Array<{ id: string, filename: string, data: object, path: string, retryCount: number, enqueuedAt: number }>} */
    this.pending = [];
    /** @type {{ id: string, filename: string, data: object, path: string, retryCount: number, startedAt: number } | null} */
    this.current = null;
    this.processing = false;
    this.paused = false;
    this.totalProcessed = 0;
    this.totalFailed = 0;
  }

  /**
   * Restore queue state from disk after crash.
   */
  restore() {
    if (!existsSync(this.stateFile)) return;
    try {
      const state = JSON.parse(readFileSync(this.stateFile, 'utf8'));
      if (state.current) {
        // Re-enqueue the interrupted command at the front
        this.pending.unshift({
          ...state.current,
          retryCount: (state.current.retryCount || 0) + 1,
          enqueuedAt: Date.now(),
        });
        this.logger.warn({ id: state.current.id }, 'Re-enqueued interrupted command');
      }
      this.totalProcessed = state.totalProcessed || 0;
      this.totalFailed = state.totalFailed || 0;
      this.logger.info({ pending: this.pending.length }, 'Queue state restored');
    } catch (err) {
      this.logger.error({ err }, 'Failed to restore queue state');
    }
  }

  /** Persist queue state to disk */
  persistState() {
    const state = {
      current: this.current
        ? { id: this.current.id, filename: this.current.filename, retryCount: this.current.retryCount, startedAt: this.current.startedAt }
        : null,
      pending: this.pending.map((c) => c.id),
      totalProcessed: this.totalProcessed,
      totalFailed: this.totalFailed,
      updatedAt: new Date().toISOString(),
    };
    try {
      writeFileSync(this.stateFile, JSON.stringify(state, null, 2), 'utf8');
    } catch (err) {
      this.logger.error({ err }, 'Failed to persist queue state');
    }
  }

  /**
   * Enqueue a command.
   * @param {{ filename: string, data: object, path: string }} cmd
   * @returns {{ accepted: boolean, reason?: string }}
   */
  enqueue({ filename, data, path }) {
    if (this.pending.length >= this.maxSize) {
      this.logger.warn({ filename, queueSize: this.pending.length }, 'Queue full, rejecting');
      return { accepted: false, reason: 'queue_full' };
    }

    const entry = {
      id: data.id,
      filename,
      data,
      path,
      retryCount: 0,
      enqueuedAt: Date.now(),
    };

    this.pending.push(entry);
    this.persistState();
    this.logger.info({ id: data.id, queueSize: this.pending.length }, 'Command enqueued');

    // Try to process next if idle
    this.processNext();

    return { accepted: true };
  }

  /**
   * Process next command in queue.
   * Emits 'process' event with the command for the SessionAdapter to handle.
   */
  processNext() {
    if (this.processing || this.paused || this.pending.length === 0) return;

    this.processing = true;
    this.current = this.pending.shift();
    this.current.startedAt = Date.now();
    this.persistState();

    this.logger.info({ id: this.current.id, filename: this.current.filename }, 'Processing command');
    this.emit('process', this.current);
  }

  /**
   * Mark current command as completed.
   * Call this when the SessionAdapter finishes processing.
   */
  complete() {
    if (!this.current) return;
    this.logger.info({ id: this.current.id }, 'Command completed');
    this.totalProcessed++;
    const filename = this.current.filename;
    this.current = null;
    this.processing = false;
    this.persistState();
    this.emit('completed', { filename });
    this.processNext();
  }

  /**
   * Mark current command as failed.
   * Retries with backoff if under maxRetries, otherwise moves to failed.
   */
  fail(error) {
    if (!this.current) return;

    const cmd = this.current;
    cmd.retryCount++;

    if (cmd.retryCount <= this.maxRetries) {
      const backoff = this.retryBackoffMs[cmd.retryCount - 1] || this.retryBackoffMs[this.retryBackoffMs.length - 1];
      this.logger.warn({ id: cmd.id, retry: cmd.retryCount, backoffMs: backoff, error: error?.message }, 'Retrying command');
      this.current = null;
      this.processing = false;

      // Re-enqueue at front after backoff
      setTimeout(() => {
        this.pending.unshift(cmd);
        this.persistState();
        this.processNext();
      }, backoff);
    } else {
      this.logger.error({ id: cmd.id, retries: cmd.retryCount, error: error?.message }, 'Command failed after max retries');
      this.totalFailed++;
      const filename = cmd.filename;
      this.current = null;
      this.processing = false;
      this.persistState();
      this.emit('failed', { filename, error });
      this.processNext();
    }
  }

  /** Pause processing (complete current, stop dequeuing) */
  pause() {
    this.paused = true;
    this.logger.info('Queue paused');
  }

  /** Resume processing */
  resume() {
    this.paused = false;
    this.logger.info('Queue resumed');
    this.processNext();
  }

  /** Get queue stats */
  stats() {
    return {
      pending: this.pending.length,
      in_progress: this.current ? 1 : 0,
      current_id: this.current?.id || null,
      total_processed: this.totalProcessed,
      total_failed: this.totalFailed,
      paused: this.paused,
    };
  }
}
