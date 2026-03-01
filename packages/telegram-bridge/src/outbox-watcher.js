import { watch } from 'chokidar';
import { readFile, readdir, rename, mkdir, stat, unlink } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { EventEmitter } from 'node:events';

/**
 * OutboxWatcher — Watches the session daemon's outbox/pending directory for new messages.
 * Reads JSON, validates, emits events by content.type, then moves to sent/ or failed/.
 * Processes existing files on startup to recover from bridge restarts.
 */
export class OutboxWatcher extends EventEmitter {
  constructor(aiosCwd, logger) {
    super();
    this.pendingDir = join(aiosCwd, '.aios', 'outbox', 'pending');
    this.sentDir = join(aiosCwd, '.aios', 'outbox', 'sent');
    this.failedDir = join(aiosCwd, '.aios', 'outbox', 'failed');
    this.logger = logger;
    this.watcher = null;
    this.processedCount = 0;
    this.failedCount = 0;
    this.lastProcessedAt = null;
  }

  async ensureDirs() {
    await mkdir(this.sentDir, { recursive: true });
    await mkdir(this.failedDir, { recursive: true });
  }

  /**
   * Start watching for new outbox messages.
   * Processes any existing files in pending/ first (catch-up from downtime).
   */
  async start() {
    await this.ensureDirs();

    // Catch-up: process files that arrived while bridge was down
    await this._processExisting();

    this.watcher = watch(this.pendingDir, {
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 200,
        pollInterval: 50,
      },
    });

    this.watcher.on('add', async (filePath) => {
      if (!filePath.endsWith('.json')) return;
      await this._processFile(filePath);
    });

    this.watcher.on('error', (err) => {
      this.logger.error({ err: err.message }, 'OutboxWatcher chokidar error, restarting watcher');
      this._restartWatcher();
    });

    this.logger.info({ dir: this.pendingDir }, 'OutboxWatcher started');
  }

  async _processExisting() {
    try {
      const files = await readdir(this.pendingDir);
      const jsonFiles = files.filter(f => f.endsWith('.json')).sort();
      if (jsonFiles.length > 0) {
        this.logger.info({ count: jsonFiles.length }, 'Processing existing pending files (catch-up)');
        for (const file of jsonFiles) {
          await this._processFile(join(this.pendingDir, file));
        }
      }
    } catch (err) {
      this.logger.warn({ err: err.message }, 'Failed to read existing pending files');
    }
  }

  async _restartWatcher() {
    try {
      if (this.watcher) await this.watcher.close();
    } catch { /* ignore */ }

    // Re-create watcher after a short delay
    setTimeout(async () => {
      try {
        await this._processExisting();
        this.watcher = watch(this.pendingDir, {
          ignoreInitial: true,
          awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 50 },
        });
        this.watcher.on('add', async (filePath) => {
          if (!filePath.endsWith('.json')) return;
          await this._processFile(filePath);
        });
        this.watcher.on('error', (err) => {
          this.logger.error({ err: err.message }, 'OutboxWatcher error again, restarting');
          this._restartWatcher();
        });
        this.logger.info('OutboxWatcher restarted after error');
      } catch (err) {
        this.logger.fatal({ err: err.message }, 'Failed to restart OutboxWatcher');
      }
    }, 2000);
  }

  async _processFile(filePath) {
    try {
      const raw = await readFile(filePath, 'utf8');
      const message = JSON.parse(raw);

      // Basic validation
      if (!message.schema_version || !message.content?.type) {
        this.logger.warn({ file: filePath }, 'Invalid outbox message, missing required fields');
        await this._moveToFailed(filePath);
        return;
      }

      // Only process messages for telegram channel
      if (message.channel && message.channel !== 'telegram') {
        this.logger.debug({ file: filePath, channel: message.channel }, 'Skipping non-telegram message');
        await this._moveToSent(filePath);
        return;
      }

      this.logger.info(
        { id: message.id, type: message.content.type, agent: message.content.agent },
        'Outbox message received'
      );

      // Emit by content type
      this.emit('message', message);
      this.emit(message.content.type, message);

      await this._moveToSent(filePath);
      this.processedCount++;
      this.lastProcessedAt = Date.now();
    } catch (err) {
      this.logger.error({ file: filePath, err: err.message }, 'Failed to process outbox message');
      await this._moveToFailed(filePath);
      this.failedCount++;
    }
  }

  async _moveToSent(filePath) {
    try {
      await rename(filePath, join(this.sentDir, basename(filePath)));
    } catch (err) {
      this.logger.warn({ file: filePath, err: err.message }, 'Failed to move to sent/');
    }
  }

  async _moveToFailed(filePath) {
    try {
      await rename(filePath, join(this.failedDir, basename(filePath)));
    } catch (err) {
      this.logger.warn({ file: filePath, err: err.message }, 'Failed to move to failed/');
    }
  }

  /**
   * Clean up old files from sent/ and failed/ directories.
   * sent/: remove files older than 24 hours.
   * failed/: remove files older than 7 days.
   */
  async cleanup() {
    const now = Date.now();
    const SENT_MAX_AGE = 24 * 60 * 60 * 1000;    // 24h
    const FAILED_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

    let cleaned = 0;
    cleaned += await this._cleanDir(this.sentDir, now, SENT_MAX_AGE);
    cleaned += await this._cleanDir(this.failedDir, now, FAILED_MAX_AGE);
    if (cleaned > 0) {
      this.logger.info({ cleaned }, 'Cleaned up old outbox files');
    }
    return cleaned;
  }

  async _cleanDir(dir, now, maxAge) {
    let count = 0;
    try {
      const files = await readdir(dir);
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        try {
          const filePath = join(dir, file);
          const info = await stat(filePath);
          if (now - info.mtimeMs > maxAge) {
            await unlink(filePath);
            count++;
          }
        } catch { /* skip individual file errors */ }
      }
    } catch { /* skip if dir doesn't exist */ }
    return count;
  }

  /**
   * Start periodic cleanup (every hour).
   */
  startCleanupTimer() {
    this._cleanupTimer = setInterval(() => this.cleanup(), 60 * 60 * 1000);
    // Also run once immediately
    this.cleanup();
  }

  /** Health stats for monitoring */
  getStats() {
    return {
      processedCount: this.processedCount,
      failedCount: this.failedCount,
      lastProcessedAt: this.lastProcessedAt,
      watcherActive: this.watcher !== null,
    };
  }

  async stop() {
    if (this._cleanupTimer) clearInterval(this._cleanupTimer);
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
      this.logger.info('OutboxWatcher stopped');
    }
  }
}
