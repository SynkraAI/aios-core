/**
 * Context Snapshot - Story 12.6
 *
 * Capture and restore development context for session recovery.
 * Enables resuming work after interruptions.
 *
 * @module context-snapshot
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG = {
  snapshotsDir: '.aios/snapshots',
  maxSnapshots: 50,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  autoCleanup: true,
  captureGitState: true,
  captureEnv: false, // Don't capture env vars by default (security)
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CONTEXT SNAPSHOT CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

class ContextSnapshot {
  /**
   * Create a new ContextSnapshot manager
   *
   * @param {Object} options - Configuration options
   * @param {string} [options.rootPath] - Project root path
   * @param {Object} [options.config] - Config overrides
   */
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.config = { ...DEFAULT_CONFIG, ...options.config };
    this.snapshotsDir = path.join(this.rootPath, this.config.snapshotsDir);
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              CAPTURE SNAPSHOT
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Capture current development context
   *
   * @param {Object} context - Context to capture
   * @param {string} [context.storyId] - Current story
   * @param {string} [context.subtaskId] - Current subtask
   * @param {string} [context.agent] - Active agent
   * @param {Object} [context.state] - Custom state data
   * @param {string} [context.description] - Human-readable description
   * @returns {Object} Created snapshot
   */
  capture(context = {}) {
    const snapshot = {
      id: this._generateId(),
      timestamp: new Date().toISOString(),
      description: context.description || this._generateDescription(context),

      // Context data
      storyId: context.storyId || null,
      subtaskId: context.subtaskId || null,
      agent: context.agent || null,

      // Working state
      workingDirectory: process.cwd(),
      modifiedFiles: this._getModifiedFiles(),

      // Git state
      git: this.config.captureGitState ? this._captureGitState() : null,

      // Custom state
      state: context.state || {},

      // Build state reference
      buildStateRef: context.buildStateRef || null,

      // Metadata
      metadata: {
        version: '1.0.0',
        platform: process.platform,
        nodeVersion: process.version,
      },
    };

    // Save snapshot
    this._saveSnapshot(snapshot);

    // Auto cleanup old snapshots
    if (this.config.autoCleanup) {
      this._cleanup();
    }

    return snapshot;
  }

  /**
   * Generate snapshot description
   * @private
   */
  _generateDescription(context) {
    const parts = [];

    if (context.agent) {
      parts.push(`Agent: ${context.agent}`);
    }

    if (context.storyId) {
      parts.push(`Story: ${context.storyId}`);
    }

    if (context.subtaskId) {
      parts.push(`Subtask: ${context.subtaskId}`);
    }

    return parts.length > 0 ? parts.join(' | ') : 'Context snapshot';
  }

  /**
   * Get modified files from git
   * @private
   */
  _getModifiedFiles() {
    try {
      const output = execSync('git status --porcelain', {
        cwd: this.rootPath,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      return output
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => ({
          status: line.substring(0, 2).trim(),
          file: line.substring(3),
        }));
    } catch {
      return [];
    }
  }

  /**
   * Capture git state
   * @private
   */
  _captureGitState() {
    try {
      const branch = execSync('git rev-parse --abbrev-ref HEAD', {
        cwd: this.rootPath,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      }).trim();

      const commit = execSync('git rev-parse HEAD', {
        cwd: this.rootPath,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      }).trim();

      const commitMessage = execSync('git log -1 --pretty=%B', {
        cwd: this.rootPath,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      }).trim();

      // Check for uncommitted changes
      const hasChanges = this._getModifiedFiles().length > 0;

      // Get stash list
      const stashList = execSync('git stash list --format="%h %s"', {
        cwd: this.rootPath,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      })
        .trim()
        .split('\n')
        .filter(Boolean);

      return {
        branch,
        commit,
        commitMessage,
        hasUncommittedChanges: hasChanges,
        stashCount: stashList.length,
      };
    } catch {
      return null;
    }
  }

  /**
   * Generate unique snapshot ID
   * @private
   */
  _generateId() {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(4).toString('hex');
    return `snap-${timestamp}-${random}`;
  }

  /**
   * Save snapshot to file
   * @private
   */
  _saveSnapshot(snapshot) {
    // Ensure directory exists
    if (!fs.existsSync(this.snapshotsDir)) {
      fs.mkdirSync(this.snapshotsDir, { recursive: true });
    }

    const filePath = path.join(this.snapshotsDir, `${snapshot.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2), 'utf-8');

    // Update index
    this._updateIndex(snapshot);
  }

  /**
   * Update snapshots index
   * @private
   */
  _updateIndex(snapshot) {
    const indexPath = path.join(this.snapshotsDir, 'index.json');

    let index = { snapshots: [] };
    if (fs.existsSync(indexPath)) {
      try {
        index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
      } catch {
        // Reset index if corrupted
      }
    }

    index.snapshots.push({
      id: snapshot.id,
      timestamp: snapshot.timestamp,
      description: snapshot.description,
      storyId: snapshot.storyId,
      agent: snapshot.agent,
    });

    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf-8');
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              RESTORE SNAPSHOT
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Restore context from snapshot
   *
   * @param {string} snapshotId - Snapshot ID to restore
   * @param {Object} options - Restore options
   * @returns {Object} Restore result
   */
  restore(snapshotId, options = {}) {
    const snapshot = this.getSnapshot(snapshotId);

    if (!snapshot) {
      throw new Error(`Snapshot not found: ${snapshotId}`);
    }

    const result = {
      success: true,
      snapshot,
      actions: [],
      warnings: [],
    };

    // Check git state compatibility
    if (snapshot.git && this.config.captureGitState) {
      const currentGit = this._captureGitState();

      if (currentGit && currentGit.branch !== snapshot.git.branch) {
        result.warnings.push({
          type: 'branch_mismatch',
          message: `Current branch (${currentGit.branch}) differs from snapshot (${snapshot.git.branch})`,
          suggestion: `git checkout ${snapshot.git.branch}`,
        });
      }

      if (currentGit && currentGit.hasUncommittedChanges && !options.force) {
        result.warnings.push({
          type: 'uncommitted_changes',
          message: 'You have uncommitted changes that may conflict',
          suggestion: 'Commit or stash changes before restoring',
        });
      }
    }

    // Restore working directory if different
    if (snapshot.workingDirectory !== process.cwd() && !options.keepCwd) {
      result.actions.push({
        type: 'change_directory',
        from: process.cwd(),
        to: snapshot.workingDirectory,
      });
    }

    // Return context for agent to use
    result.context = {
      storyId: snapshot.storyId,
      subtaskId: snapshot.subtaskId,
      agent: snapshot.agent,
      state: snapshot.state,
      modifiedFiles: snapshot.modifiedFiles,
      buildStateRef: snapshot.buildStateRef,
    };

    return result;
  }

  /**
   * Get snapshot by ID
   *
   * @param {string} snapshotId - Snapshot ID
   * @returns {Object|null} Snapshot or null
   */
  getSnapshot(snapshotId) {
    const filePath = path.join(this.snapshotsDir, `${snapshotId}.json`);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
      return null;
    }
  }

  /**
   * Get latest snapshot
   *
   * @param {Object} filter - Filter options
   * @returns {Object|null} Latest matching snapshot or null
   */
  getLatest(filter = {}) {
    const snapshots = this.listSnapshots(filter);
    return snapshots.length > 0 ? this.getSnapshot(snapshots[0].id) : null;
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              LIST & SEARCH
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * List all snapshots
   *
   * @param {Object} filter - Filter options
   * @returns {Object[]} List of snapshots (summary)
   */
  listSnapshots(filter = {}) {
    const indexPath = path.join(this.snapshotsDir, 'index.json');

    if (!fs.existsSync(indexPath)) {
      return [];
    }

    try {
      const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
      let snapshots = index.snapshots || [];

      // Apply filters
      if (filter.storyId) {
        snapshots = snapshots.filter((s) => s.storyId === filter.storyId);
      }

      if (filter.agent) {
        snapshots = snapshots.filter((s) => s.agent === filter.agent);
      }

      if (filter.since) {
        const sinceDate = new Date(filter.since);
        snapshots = snapshots.filter((s) => new Date(s.timestamp) >= sinceDate);
      }

      // Sort by timestamp descending (most recent first)
      snapshots.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Apply limit
      if (filter.limit) {
        snapshots = snapshots.slice(0, filter.limit);
      }

      return snapshots;
    } catch {
      return [];
    }
  }

  /**
   * Search snapshots by description
   *
   * @param {string} query - Search query
   * @returns {Object[]} Matching snapshots
   */
  searchSnapshots(query) {
    const snapshots = this.listSnapshots();
    const queryLower = query.toLowerCase();

    return snapshots.filter(
      (s) =>
        s.description?.toLowerCase().includes(queryLower) ||
        s.storyId?.toLowerCase().includes(queryLower) ||
        s.agent?.toLowerCase().includes(queryLower),
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              CLEANUP
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Delete snapshot
   *
   * @param {string} snapshotId - Snapshot ID to delete
   * @returns {boolean} Success
   */
  deleteSnapshot(snapshotId) {
    const filePath = path.join(this.snapshotsDir, `${snapshotId}.json`);

    if (!fs.existsSync(filePath)) {
      return false;
    }

    fs.unlinkSync(filePath);
    this._removeFromIndex(snapshotId);

    return true;
  }

  /**
   * Remove snapshot from index
   * @private
   */
  _removeFromIndex(snapshotId) {
    const indexPath = path.join(this.snapshotsDir, 'index.json');

    if (!fs.existsSync(indexPath)) {
      return;
    }

    try {
      const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
      index.snapshots = (index.snapshots || []).filter((s) => s.id !== snapshotId);
      fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf-8');
    } catch {
      // Ignore errors
    }
  }

  /**
   * Cleanup old snapshots
   * @private
   */
  _cleanup() {
    const snapshots = this.listSnapshots();
    const now = Date.now();
    let deleted = 0;

    // Delete old snapshots
    for (const snapshot of snapshots) {
      const age = now - new Date(snapshot.timestamp).getTime();

      if (age > this.config.maxAge) {
        this.deleteSnapshot(snapshot.id);
        deleted++;
      }
    }

    // Enforce max snapshots
    const remaining = this.listSnapshots();
    if (remaining.length > this.config.maxSnapshots) {
      const toDelete = remaining.slice(this.config.maxSnapshots);
      for (const snapshot of toDelete) {
        this.deleteSnapshot(snapshot.id);
        deleted++;
      }
    }

    return deleted;
  }

  /**
   * Force cleanup all old snapshots
   *
   * @param {Object} options - Cleanup options
   * @returns {Object} Cleanup result
   */
  cleanup(options = {}) {
    const maxAge = options.maxAge || this.config.maxAge;
    const maxSnapshots = options.maxSnapshots || this.config.maxSnapshots;

    const before = this.listSnapshots().length;

    // Temporarily override config
    const originalConfig = { ...this.config };
    this.config.maxAge = maxAge;
    this.config.maxSnapshots = maxSnapshots;

    const deleted = this._cleanup();

    this.config = originalConfig;

    return {
      before,
      after: this.listSnapshots().length,
      deleted,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              STATISTICS
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Get snapshot statistics
   *
   * @returns {Object} Statistics
   */
  getStatistics() {
    const snapshots = this.listSnapshots();

    if (snapshots.length === 0) {
      return {
        total: 0,
        byAgent: {},
        byStory: {},
        oldestSnapshot: null,
        newestSnapshot: null,
        diskUsage: 0,
      };
    }

    // Count by agent
    const byAgent = {};
    for (const s of snapshots) {
      const agent = s.agent || 'unknown';
      byAgent[agent] = (byAgent[agent] || 0) + 1;
    }

    // Count by story
    const byStory = {};
    for (const s of snapshots) {
      if (s.storyId) {
        byStory[s.storyId] = (byStory[s.storyId] || 0) + 1;
      }
    }

    // Calculate disk usage
    let diskUsage = 0;
    try {
      const files = fs.readdirSync(this.snapshotsDir);
      for (const file of files) {
        const stat = fs.statSync(path.join(this.snapshotsDir, file));
        diskUsage += stat.size;
      }
    } catch {
      // Ignore errors
    }

    return {
      total: snapshots.length,
      byAgent,
      byStory,
      oldestSnapshot: snapshots[snapshots.length - 1],
      newestSnapshot: snapshots[0],
      diskUsage,
      diskUsageFormatted: this._formatBytes(diskUsage),
    };
  }

  /**
   * Format bytes to human readable
   * @private
   */
  _formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  // ─────────────────────────────────────────────────────────────────────────────────
  //                              FORMATTING
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Format snapshot for display
   *
   * @param {Object} snapshot - Snapshot to format
   * @returns {string} Formatted string
   */
  formatSnapshot(snapshot) {
    const lines = [];

    lines.push(`📸 Snapshot: ${snapshot.id}`);
    lines.push(`   ${snapshot.description}`);
    lines.push(`   Created: ${snapshot.timestamp}`);

    if (snapshot.storyId) {
      lines.push(`   Story: ${snapshot.storyId}`);
    }

    if (snapshot.subtaskId) {
      lines.push(`   Subtask: ${snapshot.subtaskId}`);
    }

    if (snapshot.agent) {
      lines.push(`   Agent: ${snapshot.agent}`);
    }

    if (snapshot.git) {
      lines.push(`   Git: ${snapshot.git.branch} @ ${snapshot.git.commit.substring(0, 7)}`);
      if (snapshot.git.hasUncommittedChanges) {
        lines.push('   ⚠️  Has uncommitted changes');
      }
    }

    if (snapshot.modifiedFiles?.length > 0) {
      lines.push(`   Modified: ${snapshot.modifiedFiles.length} files`);
    }

    return lines.join('\n');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════

module.exports = {
  ContextSnapshot,
  DEFAULT_CONFIG,
};
