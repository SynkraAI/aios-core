import { watch } from 'chokidar';
import { readFileSync, renameSync, readdirSync, existsSync, mkdirSync } from 'fs';
import { join, basename } from 'path';
import { EventEmitter } from 'events';
import { validateInboxMessage } from './schema-validator.js';

/**
 * InboxWatcher — Watches .aios/inbox/pending/ for new JSON files.
 *
 * Design decisions (from architecture + Pedro Valerio validation):
 * - Uses full readdir() scan on trigger, NOT individual file events (R7)
 * - Deduplication via source.message_id (in-memory set, last 1000)
 * - On startup, scans in_progress/ to detect orphaned files
 * - Validates JSON against inbox schema before emitting
 */
export class InboxWatcher extends EventEmitter {
  /** @param {object} opts */
  constructor({ baseDir, pollIntervalMs = 5000, allowedSenders = [], rejectUnknown = true, logger }) {
    super();
    this.pendingDir = join(baseDir, 'inbox', 'pending');
    this.inProgressDir = join(baseDir, 'inbox', 'in_progress');
    this.processedDir = join(baseDir, 'inbox', 'processed');
    this.failedDir = join(baseDir, 'inbox', 'failed');
    this.pollIntervalMs = pollIntervalMs;
    this.allowedSenders = allowedSenders;
    this.rejectUnknown = rejectUnknown;
    this.logger = logger || console;

    /** @type {Set<string>} recent message IDs for dedup */
    this.seenIds = new Set();
    this.maxSeenIds = 1000;

    this.watcher = null;
    this.pollTimer = null;
    this.scanning = false;
  }

  /** Ensure all directories exist */
  ensureDirs() {
    for (const dir of [this.pendingDir, this.inProgressDir, this.processedDir, this.failedDir]) {
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    }
  }

  /** Start watching */
  start() {
    this.ensureDirs();
    this.rebuildDedup();
    this.recoverOrphans();

    // chokidar watcher on pending dir
    this.watcher = watch(this.pendingDir, {
      ignoreInitial: false,
      awaitWriteFinish: { stabilityThreshold: 300, pollInterval: 100 },
      depth: 0,
    });

    this.watcher.on('add', () => this.scan());
    this.watcher.on('error', (err) => this.logger.error({ err }, 'Watcher error'));

    // Polling fallback (R7: full readdir scan)
    this.pollTimer = setInterval(() => this.scan(), this.pollIntervalMs);

    this.logger.info('InboxWatcher started');
  }

  /** Stop watching */
  stop() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    this.logger.info('InboxWatcher stopped');
  }

  /**
   * Rebuild dedup set from in_progress/ and processed/ (last 24h).
   * Called on startup to prevent reprocessing after crash.
   */
  rebuildDedup() {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    for (const dir of [this.inProgressDir, this.processedDir]) {
      if (!existsSync(dir)) continue;
      for (const file of readdirSync(dir)) {
        if (!file.endsWith('.json')) continue;
        try {
          const data = JSON.parse(readFileSync(join(dir, file), 'utf8'));
          const msgId = data.source?.message_id || data.id;
          if (msgId) this.addToDedup(msgId);
        } catch {
          // Skip corrupt files
        }
      }
    }
    this.logger.info({ count: this.seenIds.size }, 'Dedup set rebuilt');
  }

  /**
   * Recover orphaned files in in_progress/ that were abandoned after crash.
   * Moves them back to pending/ for reprocessing (R1 from validation).
   */
  recoverOrphans() {
    if (!existsSync(this.inProgressDir)) return;
    const files = readdirSync(this.inProgressDir).filter((f) => f.endsWith('.json'));
    for (const file of files) {
      const src = join(this.inProgressDir, file);
      const dest = join(this.pendingDir, file);
      try {
        renameSync(src, dest);
        this.logger.warn({ file }, 'Recovered orphaned inbox file');
      } catch (err) {
        this.logger.error({ err, file }, 'Failed to recover orphaned file');
      }
    }
  }

  /** Full directory scan (R7: always readdir, never individual events) */
  async scan() {
    if (this.scanning) return;
    this.scanning = true;

    try {
      const files = readdirSync(this.pendingDir)
        .filter((f) => f.endsWith('.json'))
        .sort(); // Alphabetical = chronological with epoch-prefixed names

      for (const file of files) {
        await this.processFile(file);
      }
    } catch (err) {
      this.logger.error({ err }, 'Scan error');
    } finally {
      this.scanning = false;
    }
  }

  /** Process a single inbox file */
  async processFile(filename) {
    const filepath = join(this.pendingDir, filename);

    // 1. Read file
    let raw;
    try {
      raw = readFileSync(filepath, 'utf8');
    } catch (err) {
      if (err.code === 'ENOENT') return; // File was already picked up
      this.logger.error({ err, filename }, 'Failed to read inbox file');
      return;
    }

    // 2. Parse JSON
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      this.logger.error({ filename }, 'Invalid JSON in inbox file');
      this.moveToFailed(filename, 'invalid_json');
      return;
    }

    // 3. Validate schema
    const validation = validateInboxMessage(data);
    if (!validation.valid) {
      this.logger.error({ filename, errors: validation.errors }, 'Schema validation failed');
      this.moveToFailed(filename, 'schema_invalid');
      return;
    }

    // 4. Check deduplication
    const dedupKey = data.source.message_id || data.id;
    if (this.seenIds.has(dedupKey)) {
      this.logger.warn({ filename, dedupKey }, 'Duplicate message, skipping');
      this.moveToFailed(filename, 'duplicate');
      return;
    }

    // 5. Check authorization
    if (this.rejectUnknown && !this.isAuthorized(data.source)) {
      this.logger.warn({ filename, source: data.source }, 'Unauthorized sender');
      this.moveToFailed(filename, 'unauthorized');
      return;
    }

    // 6. Add to dedup set
    this.addToDedup(dedupKey);

    // 7. Move to in_progress (atomic rename on same filesystem)
    const inProgressPath = join(this.inProgressDir, filename);
    try {
      renameSync(filepath, inProgressPath);
    } catch (err) {
      this.logger.error({ err, filename }, 'Failed to move to in_progress');
      return;
    }

    // 8. Emit command event
    this.emit('command', { filename, data, path: inProgressPath });
  }

  /** Check if sender is in allowlist */
  isAuthorized(source) {
    if (!this.allowedSenders.length) return true;
    return this.allowedSenders.some(
      (s) => s.channel === source.channel && s.sender_id === source.sender_id
    );
  }

  /** Add to dedup set with eviction */
  addToDedup(key) {
    this.seenIds.add(key);
    if (this.seenIds.size > this.maxSeenIds) {
      // Evict oldest (first inserted)
      const first = this.seenIds.values().next().value;
      this.seenIds.delete(first);
    }
  }

  /** Move file to failed/ directory */
  moveToFailed(filename, reason) {
    const src = join(this.pendingDir, filename);
    const dest = join(this.failedDir, `${reason}-${filename}`);
    try {
      renameSync(src, dest);
    } catch {
      // File may already be gone
    }
  }

  /** Move completed file from in_progress to processed */
  markProcessed(filename) {
    const src = join(this.inProgressDir, filename);
    const dest = join(this.processedDir, filename);
    try {
      renameSync(src, dest);
    } catch (err) {
      this.logger.error({ err, filename }, 'Failed to move to processed');
    }
  }

  /** Move failed file from in_progress to failed */
  markFailed(filename, reason = 'processing_error') {
    const src = join(this.inProgressDir, filename);
    const dest = join(this.failedDir, `${reason}-${filename}`);
    try {
      renameSync(src, dest);
    } catch (err) {
      this.logger.error({ err, filename }, 'Failed to move to failed');
    }
  }
}
