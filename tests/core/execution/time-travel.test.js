/**
 * Execution Time Travel Tests
 * Story EXE-4 - Checkpoint, replay, fork and rewind agent executions
 */

const {
  TimeTravelEngine,
  TimelineStatus,
  CheckpointStatus,
} = require('../../../.aiox-core/core/execution/time-travel');

// Mock fs module for persistence tests
jest.mock('fs', () => {
  const actualFs = jest.requireActual('fs');
  const store = new Map();

  const mockPromises = {
    mkdir: jest.fn().mockResolvedValue(undefined),
    writeFile: jest.fn().mockImplementation((filePath, data) => {
      store.set(filePath, data);
      return Promise.resolve();
    }),
    readFile: jest.fn().mockImplementation((filePath) => {
      if (store.has(filePath)) {
        return Promise.resolve(store.get(filePath));
      }
      return Promise.reject(new Error('ENOENT: no such file'));
    }),
    readdir: jest.fn().mockImplementation(() => {
      const files = [];
      for (const key of store.keys()) {
        const parts = key.split('/');
        files.push(parts[parts.length - 1]);
      }
      return Promise.resolve(files);
    }),
    unlink: jest.fn().mockImplementation((filePath) => {
      store.delete(filePath);
      return Promise.resolve();
    }),
  };

  // Expose store for test inspection
  mockPromises._store = store;
  mockPromises._clearStore = () => store.clear();

  return {
    ...actualFs,
    promises: mockPromises,
  };
});

const fs = require('fs').promises;

describe('TimeTravelEngine', () => {
  let engine;

  beforeEach(() => {
    fs._clearStore();
    engine = new TimeTravelEngine({
      storageDir: '/tmp/test-timelines',
      autoPersist: true,
    });
  });

  // ---------------------------------------------------------------------------
  // Constants
  // ---------------------------------------------------------------------------

  describe('constants', () => {
    it('should export TimelineStatus with correct values', () => {
      expect(TimelineStatus.ACTIVE).toBe('active');
      expect(TimelineStatus.ARCHIVED).toBe('archived');
    });

    it('should export CheckpointStatus with correct values', () => {
      expect(CheckpointStatus.ACTIVE).toBe('active');
      expect(CheckpointStatus.REWOUND).toBe('rewound');
    });
  });

  // ---------------------------------------------------------------------------
  // Constructor
  // ---------------------------------------------------------------------------

  describe('constructor', () => {
    it('should use default config values', () => {
      const defaultEngine = new TimeTravelEngine();
      expect(defaultEngine.storageDir).toBe('.aiox/timelines');
      expect(defaultEngine.maxCheckpointsPerTimeline).toBe(500);
      expect(defaultEngine.autoPersist).toBe(true);
    });

    it('should accept custom config with nullish coalescing', () => {
      const custom = new TimeTravelEngine({
        storageDir: '/custom/path',
        maxCheckpointsPerTimeline: 100,
        autoPersist: false,
      });
      expect(custom.storageDir).toBe('/custom/path');
      expect(custom.maxCheckpointsPerTimeline).toBe(100);
      expect(custom.autoPersist).toBe(false);
    });

    it('should initialize empty timelines map', () => {
      expect(engine.timelines.size).toBe(0);
    });

    it('should initialize stats to zero', () => {
      const stats = engine.getStats();
      expect(stats.timelinesCreated).toBe(0);
      expect(stats.checkpointsCreated).toBe(0);
      expect(stats.forksCreated).toBe(0);
      expect(stats.rewindsPerformed).toBe(0);
      expect(stats.restoresPerformed).toBe(0);
    });

    it('should be an EventEmitter', () => {
      expect(typeof engine.on).toBe('function');
      expect(typeof engine.emit).toBe('function');
    });
  });

  // ---------------------------------------------------------------------------
  // createTimeline
  // ---------------------------------------------------------------------------

  describe('createTimeline', () => {
    it('should create a timeline with correct structure', async () => {
      const tl = await engine.createTimeline('session-1', { agent: 'dev' });

      expect(tl.id).toMatch(/^tl_/);
      expect(tl.sessionId).toBe('session-1');
      expect(tl.parentId).toBeNull();
      expect(tl.parentCheckpointId).toBeNull();
      expect(tl.metadata).toEqual({ agent: 'dev' });
      expect(tl.checkpoints).toEqual([]);
      expect(tl.forks).toEqual([]);
      expect(tl.status).toBe(TimelineStatus.ACTIVE);
      expect(tl.createdAt).toBeDefined();
      expect(tl.updatedAt).toBeDefined();
    });

    it('should throw if sessionId is missing', async () => {
      await expect(engine.createTimeline('')).rejects.toThrow('sessionId is required');
      await expect(engine.createTimeline(null)).rejects.toThrow('sessionId is required');
      await expect(engine.createTimeline(undefined)).rejects.toThrow('sessionId is required');
    });

    it('should emit timeline:created event', async () => {
      const handler = jest.fn();
      engine.on('timeline:created', handler);

      const tl = await engine.createTimeline('session-1', { agent: 'dev' });

      expect(handler).toHaveBeenCalledWith({
        timelineId: tl.id,
        sessionId: 'session-1',
        metadata: { agent: 'dev' },
      });
    });

    it('should increment timelinesCreated stat', async () => {
      await engine.createTimeline('s1');
      await engine.createTimeline('s2');

      expect(engine.getStats().timelinesCreated).toBe(2);
    });

    it('should persist timeline to disk', async () => {
      await engine.createTimeline('session-1');

      expect(fs.mkdir).toHaveBeenCalledWith('/tmp/test-timelines', { recursive: true });
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should deep-clone metadata so mutations do not leak', async () => {
      const meta = { tags: ['important'] };
      const tl = await engine.createTimeline('s1', meta);

      meta.tags.push('mutated');
      const stored = engine.timelines.get(tl.id);
      expect(stored.metadata.tags).toEqual(['important']);
    });

    it('should create multiple timelines with unique IDs', async () => {
      const tl1 = await engine.createTimeline('s1');
      const tl2 = await engine.createTimeline('s1');

      expect(tl1.id).not.toBe(tl2.id);
    });
  });

  // ---------------------------------------------------------------------------
  // checkpoint
  // ---------------------------------------------------------------------------

  describe('checkpoint', () => {
    let timeline;

    beforeEach(async () => {
      timeline = await engine.createTimeline('session-1');
    });

    it('should create a checkpoint with correct structure', async () => {
      const cp = await engine.checkpoint(timeline.id, { step: 1, data: 'hello' }, 'First step');

      expect(cp.id).toMatch(/^cp_/);
      expect(cp.timelineId).toBe(timeline.id);
      expect(cp.state).toEqual({ step: 1, data: 'hello' });
      expect(cp.label).toBe('First step');
      expect(cp.index).toBe(0);
      expect(cp.status).toBe(CheckpointStatus.ACTIVE);
      expect(cp.timestamp).toBeDefined();
    });

    it('should assign sequential indices', async () => {
      const cp1 = await engine.checkpoint(timeline.id, { v: 1 }, 'cp1');
      const cp2 = await engine.checkpoint(timeline.id, { v: 2 }, 'cp2');
      const cp3 = await engine.checkpoint(timeline.id, { v: 3 }, 'cp3');

      expect(cp1.index).toBe(0);
      expect(cp2.index).toBe(1);
      expect(cp3.index).toBe(2);
    });

    it('should deep-clone state so mutations do not leak', async () => {
      const state = { items: [1, 2, 3] };
      await engine.checkpoint(timeline.id, state, 'test');

      state.items.push(999);
      const stored = engine.timelines.get(timeline.id).checkpoints[0];
      expect(stored.state.items).toEqual([1, 2, 3]);
    });

    it('should emit checkpoint:created event', async () => {
      const handler = jest.fn();
      engine.on('checkpoint:created', handler);

      const cp = await engine.checkpoint(timeline.id, { x: 1 }, 'label');

      expect(handler).toHaveBeenCalledWith({
        timelineId: timeline.id,
        checkpointId: cp.id,
        label: 'label',
        index: 0,
      });
    });

    it('should increment checkpointsCreated stat', async () => {
      await engine.checkpoint(timeline.id, { a: 1 });
      await engine.checkpoint(timeline.id, { a: 2 });

      expect(engine.getStats().checkpointsCreated).toBe(2);
    });

    it('should throw if timeline does not exist', async () => {
      await expect(engine.checkpoint('nonexistent', {})).rejects.toThrow('Timeline not found');
    });

    it('should enforce maximum checkpoints per timeline', async () => {
      const small = new TimeTravelEngine({
        maxCheckpointsPerTimeline: 3,
        autoPersist: false,
      });
      const tl = await small.createTimeline('s1');

      await small.checkpoint(tl.id, { v: 1 });
      await small.checkpoint(tl.id, { v: 2 });
      await small.checkpoint(tl.id, { v: 3 });

      await expect(small.checkpoint(tl.id, { v: 4 })).rejects.toThrow(
        'maximum of 3 checkpoints'
      );
    });

    it('should default label to empty string', async () => {
      const cp = await engine.checkpoint(timeline.id, { x: 1 });
      expect(cp.label).toBe('');
    });
  });

  // ---------------------------------------------------------------------------
  // restoreCheckpoint
  // ---------------------------------------------------------------------------

  describe('restoreCheckpoint', () => {
    it('should return the full state at the checkpoint', async () => {
      const tl = await engine.createTimeline('s1');
      const cp = await engine.checkpoint(tl.id, { model: 'gpt-4', tokens: 500 }, 'snapshot');

      const restored = await engine.restoreCheckpoint(tl.id, cp.id);

      expect(restored.state).toEqual({ model: 'gpt-4', tokens: 500 });
      expect(restored.checkpointId).toBe(cp.id);
      expect(restored.label).toBe('snapshot');
      expect(restored.index).toBe(0);
    });

    it('should emit checkpoint:restored event', async () => {
      const handler = jest.fn();
      engine.on('checkpoint:restored', handler);

      const tl = await engine.createTimeline('s1');
      const cp = await engine.checkpoint(tl.id, { v: 1 }, 'test');

      await engine.restoreCheckpoint(tl.id, cp.id);

      expect(handler).toHaveBeenCalledWith({
        timelineId: tl.id,
        checkpointId: cp.id,
        label: 'test',
        index: 0,
      });
    });

    it('should increment restoresPerformed stat', async () => {
      const tl = await engine.createTimeline('s1');
      const cp = await engine.checkpoint(tl.id, { v: 1 });

      await engine.restoreCheckpoint(tl.id, cp.id);

      expect(engine.getStats().restoresPerformed).toBe(1);
    });

    it('should throw if checkpoint does not exist', async () => {
      const tl = await engine.createTimeline('s1');

      await expect(engine.restoreCheckpoint(tl.id, 'cp_nonexistent')).rejects.toThrow(
        'Checkpoint not found'
      );
    });

    it('should return a deep clone so caller cannot mutate internal state', async () => {
      const tl = await engine.createTimeline('s1');
      const cp = await engine.checkpoint(tl.id, { items: [1, 2] });

      const restored = await engine.restoreCheckpoint(tl.id, cp.id);
      restored.state.items.push(999);

      const restoredAgain = await engine.restoreCheckpoint(tl.id, cp.id);
      expect(restoredAgain.state.items).toEqual([1, 2]);
    });
  });

  // ---------------------------------------------------------------------------
  // fork
  // ---------------------------------------------------------------------------

  describe('fork', () => {
    let tl;
    let cp1;
    let cp2;

    beforeEach(async () => {
      tl = await engine.createTimeline('session-1', { agent: 'main' });
      cp1 = await engine.checkpoint(tl.id, { step: 1 }, 'step-1');
      cp2 = await engine.checkpoint(tl.id, { step: 2 }, 'step-2');
    });

    it('should create a fork timeline with parent reference', async () => {
      const fork = await engine.fork(tl.id, cp1.id, { branch: 'experiment' });

      expect(fork.id).toMatch(/^tl_/);
      expect(fork.parentId).toBe(tl.id);
      expect(fork.parentCheckpointId).toBe(cp1.id);
      expect(fork.sessionId).toBe('session-1');
      expect(fork.metadata).toEqual({ branch: 'experiment' });
      expect(fork.status).toBe(TimelineStatus.ACTIVE);
    });

    it('should copy checkpoints up to and including the fork point', async () => {
      const fork = await engine.fork(tl.id, cp1.id);

      // cp1 is at index 0, so 1 checkpoint should be copied
      expect(fork.checkpoints).toHaveLength(1);
      expect(fork.checkpoints[0].state).toEqual({ step: 1 });
      expect(fork.checkpoints[0].timelineId).toBe(fork.id);
    });

    it('should register the fork on the source timeline', async () => {
      const fork = await engine.fork(tl.id, cp2.id);

      const source = engine.timelines.get(tl.id);
      expect(source.forks).toHaveLength(1);
      expect(source.forks[0].timelineId).toBe(fork.id);
      expect(source.forks[0].checkpointId).toBe(cp2.id);
    });

    it('should emit timeline:forked event', async () => {
      const handler = jest.fn();
      engine.on('timeline:forked', handler);

      const fork = await engine.fork(tl.id, cp1.id, { reason: 'test' });

      expect(handler).toHaveBeenCalledWith({
        sourceTimelineId: tl.id,
        forkTimelineId: fork.id,
        checkpointId: cp1.id,
        metadata: { reason: 'test' },
      });
    });

    it('should increment forksCreated and timelinesCreated stats', async () => {
      await engine.fork(tl.id, cp1.id);

      const stats = engine.getStats();
      expect(stats.forksCreated).toBe(1);
      // 1 original + 1 fork
      expect(stats.timelinesCreated).toBe(2);
    });

    it('should allow forking at the last checkpoint', async () => {
      const fork = await engine.fork(tl.id, cp2.id);
      expect(fork.checkpoints).toHaveLength(2);
    });

    it('should throw if timeline does not exist', async () => {
      await expect(engine.fork('nonexistent', cp1.id)).rejects.toThrow('Timeline not found');
    });

    it('should throw if checkpoint does not exist', async () => {
      await expect(engine.fork(tl.id, 'cp_nonexistent')).rejects.toThrow('Checkpoint not found');
    });

    it('should allow adding checkpoints to the forked timeline', async () => {
      const fork = await engine.fork(tl.id, cp1.id);
      const newCp = await engine.checkpoint(fork.id, { step: 'fork-2' }, 'forked step');

      expect(newCp.timelineId).toBe(fork.id);
      const storedFork = engine.timelines.get(fork.id);
      expect(storedFork.checkpoints).toHaveLength(2);
    });
  });

  // ---------------------------------------------------------------------------
  // rewind
  // ---------------------------------------------------------------------------

  describe('rewind', () => {
    let tl;
    let cp1;
    let cp2;
    let cp3;

    beforeEach(async () => {
      tl = await engine.createTimeline('session-1');
      cp1 = await engine.checkpoint(tl.id, { v: 1 }, 'v1');
      cp2 = await engine.checkpoint(tl.id, { v: 2 }, 'v2');
      cp3 = await engine.checkpoint(tl.id, { v: 3 }, 'v3');
    });

    it('should mark subsequent checkpoints as rewound', async () => {
      const result = await engine.rewind(tl.id, cp1.id);

      expect(result.rewoundCheckpoints).toHaveLength(2);
      expect(result.rewoundCheckpoints).toContain(cp2.id);
      expect(result.rewoundCheckpoints).toContain(cp3.id);

      const storedTl = engine.timelines.get(tl.id);
      expect(storedTl.checkpoints[0].status).toBe(CheckpointStatus.ACTIVE);
      expect(storedTl.checkpoints[1].status).toBe(CheckpointStatus.REWOUND);
      expect(storedTl.checkpoints[2].status).toBe(CheckpointStatus.REWOUND);
    });

    it('should return the state at the rewind target', async () => {
      const result = await engine.rewind(tl.id, cp1.id);
      expect(result.state).toEqual({ v: 1 });
    });

    it('should not mark the target checkpoint as rewound', async () => {
      await engine.rewind(tl.id, cp2.id);

      const storedTl = engine.timelines.get(tl.id);
      expect(storedTl.checkpoints[1].status).toBe(CheckpointStatus.ACTIVE);
      expect(storedTl.checkpoints[2].status).toBe(CheckpointStatus.REWOUND);
    });

    it('should be a no-op when rewinding to the last checkpoint', async () => {
      const result = await engine.rewind(tl.id, cp3.id);

      expect(result.rewoundCheckpoints).toHaveLength(0);
    });

    it('should emit timeline:rewound event', async () => {
      const handler = jest.fn();
      engine.on('timeline:rewound', handler);

      await engine.rewind(tl.id, cp1.id);

      expect(handler).toHaveBeenCalledWith({
        timelineId: tl.id,
        checkpointId: cp1.id,
        rewoundCheckpoints: expect.arrayContaining([cp2.id, cp3.id]),
      });
    });

    it('should increment rewindsPerformed stat', async () => {
      await engine.rewind(tl.id, cp1.id);
      expect(engine.getStats().rewindsPerformed).toBe(1);
    });

    it('should skip already-rewound checkpoints', async () => {
      await engine.rewind(tl.id, cp2.id); // rewinds cp3
      const result = await engine.rewind(tl.id, cp1.id); // should only rewind cp2

      expect(result.rewoundCheckpoints).toHaveLength(1);
      expect(result.rewoundCheckpoints).toContain(cp2.id);
    });

    it('should throw if timeline does not exist', async () => {
      await expect(engine.rewind('nonexistent', cp1.id)).rejects.toThrow('Timeline not found');
    });

    it('should throw if checkpoint does not exist', async () => {
      await expect(engine.rewind(tl.id, 'cp_nonexistent')).rejects.toThrow(
        'Checkpoint not found'
      );
    });
  });

  // ---------------------------------------------------------------------------
  // getReplayPlan
  // ---------------------------------------------------------------------------

  describe('getReplayPlan', () => {
    let tl;
    let cp1;
    let cp2;
    let cp3;

    beforeEach(async () => {
      tl = await engine.createTimeline('session-1');
      cp1 = await engine.checkpoint(tl.id, { v: 1 }, 'step-1');
      cp2 = await engine.checkpoint(tl.id, { v: 2 }, 'step-2');
      cp3 = await engine.checkpoint(tl.id, { v: 3 }, 'step-3');
    });

    it('should return steps between two checkpoints', () => {
      const plan = engine.getReplayPlan(tl.id, cp1.id, cp3.id);

      expect(plan.totalSteps).toBe(2);
      expect(plan.steps).toHaveLength(2);
      expect(plan.steps[0].checkpointId).toBe(cp2.id);
      expect(plan.steps[1].checkpointId).toBe(cp3.id);
    });

    it('should return correct from/to metadata', () => {
      const plan = engine.getReplayPlan(tl.id, cp1.id, cp3.id);

      expect(plan.from.checkpointId).toBe(cp1.id);
      expect(plan.to.checkpointId).toBe(cp3.id);
      expect(plan.timelineId).toBe(tl.id);
    });

    it('should return single step for adjacent checkpoints', () => {
      const plan = engine.getReplayPlan(tl.id, cp1.id, cp2.id);

      expect(plan.totalSteps).toBe(1);
      expect(plan.steps[0].checkpointId).toBe(cp2.id);
    });

    it('should throw if from comes after to', () => {
      expect(() => engine.getReplayPlan(tl.id, cp3.id, cp1.id)).toThrow(
        'must precede toCheckpoint'
      );
    });

    it('should throw if from and to are the same', () => {
      expect(() => engine.getReplayPlan(tl.id, cp1.id, cp1.id)).toThrow(
        'must precede toCheckpoint'
      );
    });

    it('should include rewound checkpoints in the plan', async () => {
      await engine.rewind(tl.id, cp1.id);

      const plan = engine.getReplayPlan(tl.id, cp1.id, cp3.id);
      expect(plan.steps[0].status).toBe(CheckpointStatus.REWOUND);
    });

    it('should throw if timeline does not exist', () => {
      expect(() => engine.getReplayPlan('nonexistent', 'a', 'b')).toThrow('Timeline not found');
    });
  });

  // ---------------------------------------------------------------------------
  // compareTimelines
  // ---------------------------------------------------------------------------

  describe('compareTimelines', () => {
    it('should identify shared and divergent checkpoints', async () => {
      const tl = await engine.createTimeline('s1');
      const cp1 = await engine.checkpoint(tl.id, { v: 1 }, 'shared');
      await engine.checkpoint(tl.id, { v: 2 }, 'original-only');

      const fork = await engine.fork(tl.id, cp1.id);
      await engine.checkpoint(fork.id, { v: 'fork-2' }, 'fork-only');

      const comparison = engine.compareTimelines(tl.id, fork.id);

      expect(comparison.sharedCheckpoints.length).toBeGreaterThan(0);
      expect(comparison.divergentCheckpoints.onlyInTimeline1.length).toBeGreaterThan(0);
      expect(comparison.divergentCheckpoints.onlyInTimeline2.length).toBeGreaterThan(0);
    });

    it('should return correct timeline metadata', async () => {
      const tl1 = await engine.createTimeline('s1');
      const tl2 = await engine.createTimeline('s2');
      await engine.checkpoint(tl1.id, { v: 1 });
      await engine.checkpoint(tl2.id, { v: 1 });

      const comparison = engine.compareTimelines(tl1.id, tl2.id);

      expect(comparison.timeline1.id).toBe(tl1.id);
      expect(comparison.timeline2.id).toBe(tl2.id);
      expect(comparison.timeline1.totalCheckpoints).toBe(1);
      expect(comparison.timeline2.totalCheckpoints).toBe(1);
    });

    it('should handle timelines with no shared checkpoints', async () => {
      const tl1 = await engine.createTimeline('s1');
      const tl2 = await engine.createTimeline('s2');
      await engine.checkpoint(tl1.id, { x: 'a' });
      await engine.checkpoint(tl2.id, { x: 'b' });

      const comparison = engine.compareTimelines(tl1.id, tl2.id);

      expect(comparison.sharedCheckpoints).toHaveLength(0);
      expect(comparison.commonAncestorIndex).toBe(-1);
    });

    it('should throw if either timeline does not exist', async () => {
      const tl = await engine.createTimeline('s1');

      expect(() => engine.compareTimelines(tl.id, 'nonexistent')).toThrow('Timeline not found');
      expect(() => engine.compareTimelines('nonexistent', tl.id)).toThrow('Timeline not found');
    });
  });

  // ---------------------------------------------------------------------------
  // getTimelineTree
  // ---------------------------------------------------------------------------

  describe('getTimelineTree', () => {
    it('should build a tree with no children for a simple timeline', async () => {
      const tl = await engine.createTimeline('s1');
      await engine.checkpoint(tl.id, { v: 1 });

      const tree = engine.getTimelineTree(tl.id);

      expect(tree.id).toBe(tl.id);
      expect(tree.children).toHaveLength(0);
      expect(tree.checkpointCount).toBe(1);
      expect(tree.forkCount).toBe(0);
    });

    it('should include forked timelines as children', async () => {
      const tl = await engine.createTimeline('s1');
      const cp = await engine.checkpoint(tl.id, { v: 1 });
      const fork = await engine.fork(tl.id, cp.id, { name: 'fork-1' });

      const tree = engine.getTimelineTree(tl.id);

      expect(tree.children).toHaveLength(1);
      expect(tree.children[0].id).toBe(fork.id);
      expect(tree.children[0].parentId).toBe(tl.id);
    });

    it('should build nested trees for multi-level forks', async () => {
      const tl = await engine.createTimeline('s1');
      const cp1 = await engine.checkpoint(tl.id, { v: 1 });

      const fork1 = await engine.fork(tl.id, cp1.id);
      const cpFork = await engine.checkpoint(fork1.id, { v: 'fork-2' });
      const fork2 = await engine.fork(fork1.id, cpFork.id);

      const tree = engine.getTimelineTree(tl.id);

      expect(tree.children).toHaveLength(1);
      expect(tree.children[0].id).toBe(fork1.id);
      expect(tree.children[0].children).toHaveLength(1);
      expect(tree.children[0].children[0].id).toBe(fork2.id);
    });

    it('should include activeCheckpointCount in tree nodes', async () => {
      const tl = await engine.createTimeline('s1');
      const cp1 = await engine.checkpoint(tl.id, { v: 1 });
      await engine.checkpoint(tl.id, { v: 2 });
      await engine.rewind(tl.id, cp1.id);

      const tree = engine.getTimelineTree(tl.id);

      expect(tree.checkpointCount).toBe(2);
      expect(tree.activeCheckpointCount).toBe(1);
    });

    it('should throw if timeline does not exist', () => {
      expect(() => engine.getTimelineTree('nonexistent')).toThrow('Timeline not found');
    });
  });

  // ---------------------------------------------------------------------------
  // listTimelines
  // ---------------------------------------------------------------------------

  describe('listTimelines', () => {
    it('should return all timelines when no filter is given', async () => {
      await engine.createTimeline('s1');
      await engine.createTimeline('s2');

      const list = await engine.listTimelines();

      expect(list.length).toBe(2);
    });

    it('should filter by sessionId', async () => {
      await engine.createTimeline('s1');
      await engine.createTimeline('s2');
      await engine.createTimeline('s1');

      const list = await engine.listTimelines({ sessionId: 's1' });

      expect(list.length).toBe(2);
      list.forEach((tl) => expect(tl.sessionId).toBe('s1'));
    });

    it('should filter by status', async () => {
      const tl1 = await engine.createTimeline('s1');
      await engine.createTimeline('s2');

      // Manually archive one
      engine.timelines.get(tl1.id).status = TimelineStatus.ARCHIVED;

      const active = await engine.listTimelines({ status: TimelineStatus.ACTIVE });
      const archived = await engine.listTimelines({ status: TimelineStatus.ARCHIVED });

      expect(active.length).toBe(1);
      expect(archived.length).toBe(1);
    });

    it('should filter by parentId', async () => {
      const tl = await engine.createTimeline('s1');
      const cp = await engine.checkpoint(tl.id, { v: 1 });
      await engine.fork(tl.id, cp.id);
      await engine.fork(tl.id, cp.id);

      const forks = await engine.listTimelines({ parentId: tl.id });

      expect(forks.length).toBe(2);
    });

    it('should return deep clones', async () => {
      await engine.createTimeline('s1', { mutable: true });

      const list = await engine.listTimelines();
      list[0].metadata.mutable = false;

      const listAgain = await engine.listTimelines();
      expect(listAgain[0].metadata.mutable).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // deleteTimeline
  // ---------------------------------------------------------------------------

  describe('deleteTimeline', () => {
    it('should remove a timeline from memory and disk', async () => {
      const tl = await engine.createTimeline('s1');

      const result = await engine.deleteTimeline(tl.id);

      expect(result.deleted).toContain(tl.id);
      expect(result.count).toBe(1);
      expect(engine.timelines.has(tl.id)).toBe(false);
      expect(fs.unlink).toHaveBeenCalled();
    });

    it('should recursively delete forks when deleteForks is true', async () => {
      const tl = await engine.createTimeline('s1');
      const cp = await engine.checkpoint(tl.id, { v: 1 });
      const fork = await engine.fork(tl.id, cp.id);

      const result = await engine.deleteTimeline(tl.id, { deleteForks: true });

      expect(result.deleted).toContain(tl.id);
      expect(result.deleted).toContain(fork.id);
      expect(result.count).toBe(2);
    });

    it('should not delete forks when deleteForks is false', async () => {
      const tl = await engine.createTimeline('s1');
      const cp = await engine.checkpoint(tl.id, { v: 1 });
      const fork = await engine.fork(tl.id, cp.id);

      await engine.deleteTimeline(tl.id);

      expect(engine.timelines.has(fork.id)).toBe(true);
    });

    it('should remove fork reference from parent', async () => {
      const parent = await engine.createTimeline('s1');
      const cp = await engine.checkpoint(parent.id, { v: 1 });
      const fork = await engine.fork(parent.id, cp.id);

      await engine.deleteTimeline(fork.id);

      const parentTimeline = engine.timelines.get(parent.id);
      expect(parentTimeline.forks).toHaveLength(0);
    });

    it('should throw if timeline does not exist', async () => {
      await expect(engine.deleteTimeline('nonexistent')).rejects.toThrow('Timeline not found');
    });
  });

  // ---------------------------------------------------------------------------
  // getStats
  // ---------------------------------------------------------------------------

  describe('getStats', () => {
    it('should return comprehensive statistics', async () => {
      const tl = await engine.createTimeline('s1');
      const cp1 = await engine.checkpoint(tl.id, { v: 1 });
      await engine.checkpoint(tl.id, { v: 2 });
      await engine.fork(tl.id, cp1.id);
      await engine.rewind(tl.id, cp1.id);
      await engine.restoreCheckpoint(tl.id, cp1.id);

      const stats = engine.getStats();

      expect(stats.timelinesCreated).toBe(2); // 1 original + 1 fork
      expect(stats.checkpointsCreated).toBe(2);
      expect(stats.forksCreated).toBe(1);
      expect(stats.rewindsPerformed).toBe(1);
      expect(stats.restoresPerformed).toBe(1);
      expect(stats.totalTimelines).toBe(2);
      expect(stats.activeTimelines).toBe(2);
      expect(stats.totalCheckpoints).toBeGreaterThan(0);
    });

    it('should count archived timelines separately', async () => {
      const tl = await engine.createTimeline('s1');
      await engine.createTimeline('s2');

      engine.timelines.get(tl.id).status = TimelineStatus.ARCHIVED;

      const stats = engine.getStats();
      expect(stats.activeTimelines).toBe(1);
      expect(stats.totalTimelines).toBe(2);
    });
  });

  // ---------------------------------------------------------------------------
  // Persistence
  // ---------------------------------------------------------------------------

  describe('persistence', () => {
    it('should create storage directory on persist', async () => {
      await engine.createTimeline('s1');

      expect(fs.mkdir).toHaveBeenCalledWith('/tmp/test-timelines', { recursive: true });
    });

    it('should write timeline as JSON', async () => {
      const tl = await engine.createTimeline('s1');

      const call = fs.writeFile.mock.calls.find((c) => c[0].includes(tl.id));
      expect(call).toBeDefined();

      const written = JSON.parse(call[1]);
      expect(written.id).toBe(tl.id);
      expect(written.sessionId).toBe('s1');
    });

    it('should skip persistence when autoPersist is false', async () => {
      const noPersist = new TimeTravelEngine({ autoPersist: false });
      fs.writeFile.mockClear();

      await noPersist.createTimeline('s1');

      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    it('should emit error event on persistence failure (not throw)', async () => {
      fs.mkdir.mockRejectedValueOnce(new Error('disk full'));

      const handler = jest.fn();
      engine.on('error', handler);

      await engine.createTimeline('s1');

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({ operation: 'persist' })
      );
    });

    it('should load all timelines from disk', async () => {
      // Create and persist a timeline
      const tl = await engine.createTimeline('s1');
      await engine.checkpoint(tl.id, { data: 'persisted' }, 'label');

      // Create a new engine instance (simulating restart)
      const engine2 = new TimeTravelEngine({
        storageDir: '/tmp/test-timelines',
        autoPersist: false,
      });

      // Load from disk
      const list = await engine2.listTimelines();

      expect(list.length).toBeGreaterThan(0);
      expect(list.find((t) => t.id === tl.id)).toBeDefined();
    });

    it('should handle corrupt JSON files gracefully', async () => {
      // Write a corrupt file
      fs._store.set('/tmp/test-timelines/corrupt.json', 'not valid json {{{');

      const engine2 = new TimeTravelEngine({
        storageDir: '/tmp/test-timelines',
        autoPersist: false,
      });

      // Should not throw
      const list = await engine2.listTimelines();
      expect(Array.isArray(list)).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Edge cases & integration
  // ---------------------------------------------------------------------------

  describe('edge cases', () => {
    it('should handle checkpoint with null state', async () => {
      const tl = await engine.createTimeline('s1');
      const cp = await engine.checkpoint(tl.id, null, 'null state');

      expect(cp.state).toBeNull();
      const restored = await engine.restoreCheckpoint(tl.id, cp.id);
      expect(restored.state).toBeNull();
    });

    it('should handle checkpoint with undefined state', async () => {
      const tl = await engine.createTimeline('s1');
      const cp = await engine.checkpoint(tl.id, undefined, 'undefined state');

      const restored = await engine.restoreCheckpoint(tl.id, cp.id);
      expect(restored.state).toBeUndefined();
    });

    it('should handle complex nested state objects', async () => {
      const complexState = {
        agents: [{ id: 1, config: { nested: { deep: true } } }],
        execution: { steps: [1, 2, 3], results: { a: { b: { c: 'd' } } } },
      };

      const tl = await engine.createTimeline('s1');
      const cp = await engine.checkpoint(tl.id, complexState, 'complex');

      const restored = await engine.restoreCheckpoint(tl.id, cp.id);
      expect(restored.state).toEqual(complexState);
    });

    it('should allow forking and continuing independently', async () => {
      const tl = await engine.createTimeline('s1');
      const cp1 = await engine.checkpoint(tl.id, { step: 1 });

      const fork = await engine.fork(tl.id, cp1.id);

      // Both can add checkpoints independently
      await engine.checkpoint(tl.id, { step: 2, branch: 'main' });
      await engine.checkpoint(fork.id, { step: 2, branch: 'fork' });

      const mainTl = engine.timelines.get(tl.id);
      const forkTl = engine.timelines.get(fork.id);

      expect(mainTl.checkpoints).toHaveLength(2);
      expect(forkTl.checkpoints).toHaveLength(2);
      expect(mainTl.checkpoints[1].state.branch).toBe('main');
      expect(forkTl.checkpoints[1].state.branch).toBe('fork');
    });

    it('should handle rewind then new checkpoints correctly', async () => {
      const tl = await engine.createTimeline('s1');
      const cp1 = await engine.checkpoint(tl.id, { v: 1 });
      await engine.checkpoint(tl.id, { v: 2 });

      await engine.rewind(tl.id, cp1.id);

      // Add new checkpoint after rewind
      const cpNew = await engine.checkpoint(tl.id, { v: 'new' }, 'after-rewind');

      // Index should be based on active checkpoints only
      expect(cpNew.index).toBe(1);
      expect(cpNew.status).toBe(CheckpointStatus.ACTIVE);
    });

    it('should handle multiple forks from the same checkpoint', async () => {
      const tl = await engine.createTimeline('s1');
      const cp = await engine.checkpoint(tl.id, { v: 1 });

      const fork1 = await engine.fork(tl.id, cp.id, { name: 'fork-1' });
      const fork2 = await engine.fork(tl.id, cp.id, { name: 'fork-2' });

      const source = engine.timelines.get(tl.id);
      expect(source.forks).toHaveLength(2);
      expect(fork1.id).not.toBe(fork2.id);
    });
  });
});
