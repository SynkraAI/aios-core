/**
 * Execution Time Travel
 * Story EXE-4 - Checkpoint, replay, fork and rewind agent executions
 *
 * Provides "git for agent sessions" — timeline-based checkpoint, replay,
 * fork and rewind capabilities for agent execution state.
 *
 * @module aiox-core/execution/time-travel
 * @version 1.0.0
 * @story EXE-4 - Execution Time Travel
 */

const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');

/**
 * Timeline statuses
 * @enum {string}
 */
const TimelineStatus = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
};

/**
 * Checkpoint statuses
 * @enum {string}
 */
const CheckpointStatus = {
  ACTIVE: 'active',
  REWOUND: 'rewound',
};

let idCounter = 0;

/**
 * Generate a unique ID with prefix
 * @param {string} prefix - ID prefix
 * @returns {string} Unique ID
 */
function generateId(prefix) {
  idCounter += 1;
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}${random}${idCounter}`;
}

/**
 * Deep clone a value using structured clone or JSON fallback
 * @param {*} value - Value to clone
 * @returns {*} Deep cloned value
 */
function deepClone(value) {
  if (value === null || value === undefined) return value;
  return JSON.parse(JSON.stringify(value));
}

/**
 * Execution Time Travel Engine
 *
 * Manages timeline-based execution history with checkpoint, replay,
 * fork and rewind capabilities. Each agent session can have multiple
 * timelines, and timelines can be forked at any checkpoint.
 *
 * @class TimeTravelEngine
 * @extends EventEmitter
 */
class TimeTravelEngine extends EventEmitter {
  /**
   * Create a new TimeTravelEngine
   * @param {Object} [config={}] - Configuration options
   * @param {string} [config.storageDir='.aiox/timelines'] - Directory for timeline persistence
   * @param {number} [config.maxCheckpointsPerTimeline=500] - Max checkpoints per timeline
   * @param {boolean} [config.autoPersist=true] - Auto-persist timelines to disk
   */
  constructor(config = {}) {
    super();

    this.storageDir = config.storageDir ?? '.aiox/timelines';
    this.maxCheckpointsPerTimeline = config.maxCheckpointsPerTimeline ?? 500;
    this.autoPersist = config.autoPersist ?? true;

    /** @type {Map<string, Object>} */
    this.timelines = new Map();

    this._stats = {
      timelinesCreated: 0,
      checkpointsCreated: 0,
      forksCreated: 0,
      rewindsPerformed: 0,
      restoresPerformed: 0,
    };
  }

  // ---------------------------------------------------------------------------
  // createTimeline
  // ---------------------------------------------------------------------------

  /**
   * Create a new timeline for a session
   * @param {string} sessionId - Session identifier
   * @param {Object} [metadata={}] - Additional metadata
   * @returns {Promise<Object>} Created timeline
   */
  async createTimeline(sessionId, metadata = {}) {
    if (!sessionId) {
      throw new Error('sessionId is required');
    }

    const id = generateId('tl');
    const now = new Date().toISOString();

    const timeline = {
      id,
      sessionId,
      parentId: null,
      parentCheckpointId: null,
      metadata: deepClone(metadata),
      checkpoints: [],
      forks: [],
      createdAt: now,
      updatedAt: now,
      status: TimelineStatus.ACTIVE,
    };

    this.timelines.set(id, timeline);
    this._stats.timelinesCreated += 1;

    this.emit('timeline:created', {
      timelineId: id,
      sessionId,
      metadata: deepClone(metadata),
    });

    await this._persist(timeline);

    return deepClone(timeline);
  }

  // ---------------------------------------------------------------------------
  // checkpoint
  // ---------------------------------------------------------------------------

  /**
   * Save a checkpoint on a timeline
   * @param {string} timelineId - Timeline ID
   * @param {*} state - State to checkpoint (will be deep-cloned)
   * @param {string} [label=''] - Human-readable label
   * @returns {Promise<Object>} Created checkpoint
   */
  async checkpoint(timelineId, state, label = '') {
    const timeline = this._getTimeline(timelineId);

    const activeCount = timeline.checkpoints.filter(
      (cp) => cp.status === CheckpointStatus.ACTIVE
    ).length;

    if (activeCount >= this.maxCheckpointsPerTimeline) {
      throw new Error(
        `Timeline has reached maximum of ${this.maxCheckpointsPerTimeline} checkpoints`
      );
    }

    const id = generateId('cp');
    const checkpoint = {
      id,
      timelineId,
      state: deepClone(state),
      label: label ?? '',
      timestamp: new Date().toISOString(),
      index: activeCount,
      status: CheckpointStatus.ACTIVE,
    };

    timeline.checkpoints.push(checkpoint);
    timeline.updatedAt = new Date().toISOString();
    this._stats.checkpointsCreated += 1;

    this.emit('checkpoint:created', {
      timelineId,
      checkpointId: id,
      label: checkpoint.label,
      index: checkpoint.index,
    });

    await this._persist(timeline);

    return deepClone(checkpoint);
  }

  // ---------------------------------------------------------------------------
  // restoreCheckpoint
  // ---------------------------------------------------------------------------

  /**
   * Restore state from a checkpoint
   * @param {string} timelineId - Timeline ID
   * @param {string} checkpointId - Checkpoint ID
   * @returns {Promise<Object>} Restored checkpoint data
   */
  async restoreCheckpoint(timelineId, checkpointId) {
    const timeline = this._getTimeline(timelineId);
    const checkpoint = this._getCheckpoint(timeline, checkpointId);

    this._stats.restoresPerformed += 1;

    this.emit('checkpoint:restored', {
      timelineId,
      checkpointId,
      label: checkpoint.label,
      index: checkpoint.index,
    });

    return {
      checkpointId: checkpoint.id,
      state: deepClone(checkpoint.state),
      label: checkpoint.label,
      index: checkpoint.index,
      timestamp: checkpoint.timestamp,
    };
  }

  // ---------------------------------------------------------------------------
  // fork
  // ---------------------------------------------------------------------------

  /**
   * Fork a timeline from a specific checkpoint
   * @param {string} timelineId - Source timeline ID
   * @param {string} checkpointId - Checkpoint to fork from
   * @param {Object} [metadata={}] - Fork metadata
   * @returns {Promise<Object>} New forked timeline
   */
  async fork(timelineId, checkpointId, metadata = {}) {
    const sourceTimeline = this._getTimeline(timelineId);
    const checkpoint = this._getCheckpoint(sourceTimeline, checkpointId);

    const cpIndex = sourceTimeline.checkpoints.indexOf(checkpoint);
    const copiedCheckpoints = sourceTimeline.checkpoints
      .slice(0, cpIndex + 1)
      .map((cp) => deepClone(cp));

    const forkId = generateId('tl');
    const now = new Date().toISOString();

    // Update copied checkpoints to reference the new timeline
    copiedCheckpoints.forEach((cp) => {
      cp.timelineId = forkId;
    });

    const forkTimeline = {
      id: forkId,
      sessionId: sourceTimeline.sessionId,
      parentId: timelineId,
      parentCheckpointId: checkpointId,
      metadata: deepClone(metadata),
      checkpoints: copiedCheckpoints,
      forks: [],
      createdAt: now,
      updatedAt: now,
      status: TimelineStatus.ACTIVE,
    };

    this.timelines.set(forkId, forkTimeline);

    // Register fork on source timeline
    sourceTimeline.forks.push({
      timelineId: forkId,
      checkpointId,
      createdAt: now,
    });
    sourceTimeline.updatedAt = now;

    this._stats.timelinesCreated += 1;
    this._stats.forksCreated += 1;

    this.emit('timeline:forked', {
      sourceTimelineId: timelineId,
      forkTimelineId: forkId,
      checkpointId,
      metadata: deepClone(metadata),
    });

    await this._persist(sourceTimeline);
    await this._persist(forkTimeline);

    return deepClone(forkTimeline);
  }

  // ---------------------------------------------------------------------------
  // rewind
  // ---------------------------------------------------------------------------

  /**
   * Rewind a timeline to a previous checkpoint
   * Marks all checkpoints after the target as 'rewound'
   * @param {string} timelineId - Timeline ID
   * @param {string} checkpointId - Target checkpoint ID
   * @returns {Promise<Object>} Rewind result
   */
  async rewind(timelineId, checkpointId) {
    const timeline = this._getTimeline(timelineId);
    const checkpoint = this._getCheckpoint(timeline, checkpointId);

    const cpIndex = timeline.checkpoints.indexOf(checkpoint);
    const rewoundCheckpoints = [];

    for (let i = cpIndex + 1; i < timeline.checkpoints.length; i++) {
      const cp = timeline.checkpoints[i];
      if (cp.status === CheckpointStatus.ACTIVE) {
        cp.status = CheckpointStatus.REWOUND;
        rewoundCheckpoints.push(cp.id);
      }
    }

    timeline.updatedAt = new Date().toISOString();
    this._stats.rewindsPerformed += 1;

    this.emit('timeline:rewound', {
      timelineId,
      checkpointId,
      rewoundCheckpoints,
    });

    await this._persist(timeline);

    return {
      timelineId,
      checkpointId,
      state: deepClone(checkpoint.state),
      rewoundCheckpoints,
    };
  }

  // ---------------------------------------------------------------------------
  // getReplayPlan
  // ---------------------------------------------------------------------------

  /**
   * Get a plan to replay between two checkpoints
   * @param {string} timelineId - Timeline ID
   * @param {string} fromCheckpointId - Starting checkpoint ID
   * @param {string} toCheckpointId - Ending checkpoint ID
   * @returns {Object} Replay plan with steps
   */
  getReplayPlan(timelineId, fromCheckpointId, toCheckpointId) {
    const timeline = this._getTimeline(timelineId);
    const fromCp = this._getCheckpoint(timeline, fromCheckpointId);
    const toCp = this._getCheckpoint(timeline, toCheckpointId);

    const fromIndex = timeline.checkpoints.indexOf(fromCp);
    const toIndex = timeline.checkpoints.indexOf(toCp);

    if (fromIndex >= toIndex) {
      throw new Error('fromCheckpoint must precede toCheckpoint in the timeline');
    }

    const steps = timeline.checkpoints.slice(fromIndex + 1, toIndex + 1).map((cp) => ({
      checkpointId: cp.id,
      label: cp.label,
      index: cp.index,
      status: cp.status,
      timestamp: cp.timestamp,
    }));

    return {
      timelineId,
      from: {
        checkpointId: fromCp.id,
        label: fromCp.label,
        index: fromCp.index,
      },
      to: {
        checkpointId: toCp.id,
        label: toCp.label,
        index: toCp.index,
      },
      totalSteps: steps.length,
      steps,
    };
  }

  // ---------------------------------------------------------------------------
  // compareTimelines
  // ---------------------------------------------------------------------------

  /**
   * Compare two timelines (useful for forks)
   * @param {string} timelineId1 - First timeline ID
   * @param {string} timelineId2 - Second timeline ID
   * @returns {Object} Comparison result
   */
  compareTimelines(timelineId1, timelineId2) {
    const tl1 = this._getTimeline(timelineId1);
    const tl2 = this._getTimeline(timelineId2);

    // Find shared checkpoints by comparing state content
    const sharedCheckpoints = [];
    let commonAncestorIndex = -1;

    const minLen = Math.min(tl1.checkpoints.length, tl2.checkpoints.length);
    for (let i = 0; i < minLen; i++) {
      const s1 = JSON.stringify(tl1.checkpoints[i].state);
      const s2 = JSON.stringify(tl2.checkpoints[i].state);

      if (s1 === s2) {
        sharedCheckpoints.push({
          index: i,
          label: tl1.checkpoints[i].label,
          state: deepClone(tl1.checkpoints[i].state),
        });
        commonAncestorIndex = i;
      } else {
        break;
      }
    }

    // Divergent checkpoints
    const onlyInTimeline1 = tl1.checkpoints.slice(sharedCheckpoints.length).map((cp) => ({
      checkpointId: cp.id,
      label: cp.label,
      index: cp.index,
    }));

    const onlyInTimeline2 = tl2.checkpoints.slice(sharedCheckpoints.length).map((cp) => ({
      checkpointId: cp.id,
      label: cp.label,
      index: cp.index,
    }));

    return {
      timeline1: {
        id: tl1.id,
        sessionId: tl1.sessionId,
        totalCheckpoints: tl1.checkpoints.length,
      },
      timeline2: {
        id: tl2.id,
        sessionId: tl2.sessionId,
        totalCheckpoints: tl2.checkpoints.length,
      },
      sharedCheckpoints,
      commonAncestorIndex,
      divergentCheckpoints: {
        onlyInTimeline1,
        onlyInTimeline2,
      },
    };
  }

  // ---------------------------------------------------------------------------
  // getTimelineTree
  // ---------------------------------------------------------------------------

  /**
   * Get the full tree of a timeline and its forks
   * @param {string} timelineId - Root timeline ID
   * @returns {Object} Tree structure
   */
  getTimelineTree(timelineId) {
    const timeline = this._getTimeline(timelineId);

    const activeCheckpointCount = timeline.checkpoints.filter(
      (cp) => cp.status === CheckpointStatus.ACTIVE
    ).length;

    const children = timeline.forks
      .map((fork) => {
        if (this.timelines.has(fork.timelineId)) {
          return this.getTimelineTree(fork.timelineId);
        }
        return null;
      })
      .filter(Boolean);

    return {
      id: timeline.id,
      sessionId: timeline.sessionId,
      parentId: timeline.parentId,
      status: timeline.status,
      checkpointCount: timeline.checkpoints.length,
      activeCheckpointCount,
      forkCount: timeline.forks.length,
      children,
      createdAt: timeline.createdAt,
    };
  }

  // ---------------------------------------------------------------------------
  // listTimelines
  // ---------------------------------------------------------------------------

  /**
   * List all timelines with optional filtering
   * @param {Object} [filter={}] - Filter options
   * @param {string} [filter.sessionId] - Filter by session ID
   * @param {string} [filter.status] - Filter by status
   * @param {string} [filter.parentId] - Filter by parent ID
   * @returns {Promise<Object[]>} Filtered timeline list
   */
  async listTimelines(filter = {}) {
    // If no timelines loaded, try to load from disk
    if (this.timelines.size === 0) {
      await this._loadFromDisk();
    }

    let timelines = Array.from(this.timelines.values());

    if (filter.sessionId) {
      timelines = timelines.filter((tl) => tl.sessionId === filter.sessionId);
    }

    if (filter.status) {
      timelines = timelines.filter((tl) => tl.status === filter.status);
    }

    if (filter.parentId) {
      timelines = timelines.filter((tl) => tl.parentId === filter.parentId);
    }

    return timelines.map((tl) => deepClone(tl));
  }

  // ---------------------------------------------------------------------------
  // deleteTimeline
  // ---------------------------------------------------------------------------

  /**
   * Delete a timeline
   * @param {string} timelineId - Timeline ID to delete
   * @param {Object} [options={}] - Delete options
   * @param {boolean} [options.deleteForks=false] - Also delete all forks
   * @returns {Promise<Object>} Deletion result
   */
  async deleteTimeline(timelineId, options = {}) {
    const timeline = this._getTimeline(timelineId);
    const deleted = [];

    // Recursively delete forks if requested
    if (options.deleteForks) {
      for (const fork of timeline.forks) {
        if (this.timelines.has(fork.timelineId)) {
          const result = await this.deleteTimeline(fork.timelineId, { deleteForks: true });
          deleted.push(...result.deleted);
        }
      }
    }

    // Remove fork reference from parent
    if (timeline.parentId) {
      const parent = this.timelines.get(timeline.parentId);
      if (parent) {
        parent.forks = parent.forks.filter((f) => f.timelineId !== timelineId);
        parent.updatedAt = new Date().toISOString();
        await this._persist(parent);
      }
    }

    // Remove from memory
    this.timelines.delete(timelineId);
    deleted.push(timelineId);

    // Remove from disk
    try {
      const filePath = path.join(this.storageDir, `${timelineId}.json`);
      await fs.promises.unlink(filePath);
    } catch (_err) {
      // File may not exist, that's fine
    }

    return { deleted, count: deleted.length };
  }

  // ---------------------------------------------------------------------------
  // getStats
  // ---------------------------------------------------------------------------

  /**
   * Get engine statistics
   * @returns {Object} Statistics
   */
  getStats() {
    let totalCheckpoints = 0;
    let activeTimelines = 0;

    for (const tl of this.timelines.values()) {
      totalCheckpoints += tl.checkpoints.length;
      if (tl.status === TimelineStatus.ACTIVE) {
        activeTimelines += 1;
      }
    }

    return {
      ...this._stats,
      totalTimelines: this.timelines.size,
      activeTimelines,
      totalCheckpoints,
    };
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Get a timeline by ID or throw
   * @private
   * @param {string} timelineId - Timeline ID
   * @returns {Object} Timeline object
   */
  _getTimeline(timelineId) {
    const timeline = this.timelines.get(timelineId);
    if (!timeline) {
      throw new Error(`Timeline not found: ${timelineId}`);
    }
    return timeline;
  }

  /**
   * Get a checkpoint from a timeline or throw
   * @private
   * @param {Object} timeline - Timeline object
   * @param {string} checkpointId - Checkpoint ID
   * @returns {Object} Checkpoint object
   */
  _getCheckpoint(timeline, checkpointId) {
    const checkpoint = timeline.checkpoints.find((cp) => cp.id === checkpointId);
    if (!checkpoint) {
      throw new Error(`Checkpoint not found: ${checkpointId}`);
    }
    return checkpoint;
  }

  /**
   * Persist a timeline to disk
   * @private
   * @param {Object} timeline - Timeline to persist
   */
  async _persist(timeline) {
    if (!this.autoPersist) return;

    try {
      await fs.promises.mkdir(this.storageDir, { recursive: true });
      const filePath = path.join(this.storageDir, `${timeline.id}.json`);
      await fs.promises.writeFile(filePath, JSON.stringify(timeline, null, 2), 'utf-8');
    } catch (error) {
      this.emit('error', {
        operation: 'persist',
        timelineId: timeline.id,
        error: error.message,
      });
    }
  }

  /**
   * Load all timelines from disk
   * @private
   */
  async _loadFromDisk() {
    try {
      const files = await fs.promises.readdir(this.storageDir);
      const jsonFiles = files.filter((f) => f.endsWith('.json'));

      for (const file of jsonFiles) {
        try {
          const filePath = path.join(this.storageDir, file);
          const data = await fs.promises.readFile(filePath, 'utf-8');
          const timeline = JSON.parse(data);
          if (timeline.id) {
            this.timelines.set(timeline.id, timeline);
          }
        } catch (_err) {
          // Skip corrupt files
        }
      }
    } catch (_err) {
      // Directory may not exist yet
    }
  }
}

module.exports = TimeTravelEngine;
module.exports.TimeTravelEngine = TimeTravelEngine;
module.exports.TimelineStatus = TimelineStatus;
module.exports.CheckpointStatus = CheckpointStatus;
