/**
 * Tests for Agent Reflection Engine
 *
 * Story: 9.6 - Agent Reflection Engine
 * Epic: Epic 9 - Persistent Memory Layer
 */

const fs = require('fs');
const path = require('path');
const ReflectionEngine = require('../../../.aios-core/core/memory/reflection-engine');
const { Outcome, TaskType, Events, CONFIG } = ReflectionEngine;

// ═══════════════════════════════════════════════════════════════════════════════════
//                              TEST SETUP
// ═══════════════════════════════════════════════════════════════════════════════════

const TEST_DIR = path.join(__dirname, '__test-reflections__');

function createEngine(overrides = {}) {
  return new ReflectionEngine({
    projectRoot: TEST_DIR,
    config: {
      reflectionsPath: '.aiox/reflections.json',
      ...overrides,
    },
  });
}

function makeReflection(overrides = {}) {
  return {
    taskType: TaskType.IMPLEMENTATION,
    agentId: 'dev',
    outcome: Outcome.SUCCESS,
    strategy: 'test-first',
    description: 'Implemented feature with TDD',
    tags: ['nodejs', 'testing'],
    durationMs: 5000,
    lesson: 'TDD catches edge cases early',
    ...overrides,
  };
}

beforeEach(() => {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(TEST_DIR, { recursive: true });
});

afterAll(() => {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CONSTRUCTOR
// ═══════════════════════════════════════════════════════════════════════════════════

describe('ReflectionEngine - constructor', () => {
  test('initializes with defaults', () => {
    const engine = createEngine();
    expect(engine.reflections).toEqual([]);
    expect(engine.patterns).toEqual([]);
    expect(engine._loaded).toBe(false);
  });

  test('accepts custom config', () => {
    const engine = createEngine({ maxReflections: 100 });
    expect(engine.config.maxReflections).toBe(100);
  });

  test('is an EventEmitter', () => {
    const engine = createEngine();
    expect(typeof engine.on).toBe('function');
    expect(typeof engine.emit).toBe('function');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════
//                              LOAD / SAVE
// ═══════════════════════════════════════════════════════════════════════════════════

describe('ReflectionEngine - load/save', () => {
  test('loads from empty state', async () => {
    const engine = createEngine();
    await engine.load();
    expect(engine._loaded).toBe(true);
    expect(engine.reflections).toEqual([]);
  });

  test('save creates directory and file', async () => {
    const engine = createEngine();
    await engine.load();
    engine.recordReflection(makeReflection());
    await engine.save();

    const filePath = path.join(TEST_DIR, '.aiox/reflections.json');
    expect(fs.existsSync(filePath)).toBe(true);

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    expect(data.schemaVersion).toBe(CONFIG.schemaVersion);
    expect(data.reflections).toHaveLength(1);
  });

  test('round-trip: save then load', async () => {
    const engine1 = createEngine();
    await engine1.load();
    engine1.recordReflection(makeReflection());
    engine1.recordReflection(makeReflection({ outcome: Outcome.FAILURE }));
    await engine1.save();

    const engine2 = createEngine();
    await engine2.load();
    expect(engine2.reflections).toHaveLength(2);
  });

  test('handles corrupted file gracefully', async () => {
    const dir = path.join(TEST_DIR, '.aiox');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'reflections.json'), 'NOT JSON!!!');

    const engine = createEngine();
    await engine.load();
    expect(engine._loaded).toBe(true);
    expect(engine.reflections).toEqual([]);
  });

  test('resets on schema version mismatch', async () => {
    const dir = path.join(TEST_DIR, '.aiox');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, 'reflections.json'),
      JSON.stringify({
        schemaVersion: 'old-schema-v0',
        reflections: [{ id: 'old' }],
        patterns: [{ id: 'old-pattern' }],
      }),
    );

    const engine = createEngine();
    await engine.load();
    expect(engine.reflections).toEqual([]);
    expect(engine.patterns).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════
//                              RECORD REFLECTION
// ═══════════════════════════════════════════════════════════════════════════════════

describe('ReflectionEngine - recordReflection', () => {
  test('records a reflection with all fields', () => {
    const engine = createEngine();
    const r = engine.recordReflection(makeReflection());

    expect(r.id).toMatch(/^ref_/);
    expect(r.taskType).toBe(TaskType.IMPLEMENTATION);
    expect(r.agentId).toBe('dev');
    expect(r.outcome).toBe(Outcome.SUCCESS);
    expect(r.strategy).toBe('test-first');
    expect(r.tags).toEqual(['nodejs', 'testing']);
    expect(r.durationMs).toBe(5000);
    expect(r.lesson).toBe('TDD catches edge cases early');
    expect(r.createdAt).toBeDefined();
  });

  test('records minimal reflection', () => {
    const engine = createEngine();
    const r = engine.recordReflection({
      taskType: TaskType.DEBUGGING,
      agentId: 'qa',
      outcome: Outcome.FAILURE,
      strategy: 'log-analysis',
    });

    expect(r.description).toBe('');
    expect(r.tags).toEqual([]);
    expect(r.durationMs).toBeNull();
    expect(r.lesson).toBeNull();
  });

  test('throws on missing required fields', () => {
    const engine = createEngine();
    expect(() => engine.recordReflection({ taskType: TaskType.TESTING })).toThrow('Required fields');
    expect(() => engine.recordReflection({})).toThrow('Required fields');
  });

  test('emits REFLECTION_RECORDED event', () => {
    const engine = createEngine();
    const handler = jest.fn();
    engine.on(Events.REFLECTION_RECORDED, handler);

    engine.recordReflection(makeReflection());
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].id).toMatch(/^ref_/);
  });

  test('enforces maxReflections limit', () => {
    const engine = createEngine({ maxReflections: 3 });
    const pruneHandler = jest.fn();
    engine.on(Events.REFLECTIONS_PRUNED, pruneHandler);

    engine.recordReflection(makeReflection({ strategy: 's1' }));
    engine.recordReflection(makeReflection({ strategy: 's2' }));
    engine.recordReflection(makeReflection({ strategy: 's3' }));
    expect(engine.reflections).toHaveLength(3);

    engine.recordReflection(makeReflection({ strategy: 's4' }));
    expect(engine.reflections).toHaveLength(3);
    expect(engine.reflections[0].strategy).toBe('s2'); // s1 was removed
    expect(pruneHandler).toHaveBeenCalledWith(
      expect.objectContaining({ count: 1, reason: 'max_limit' }),
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════
//                              RECOMMENDATIONS
// ═══════════════════════════════════════════════════════════════════════════════════

describe('ReflectionEngine - getRecommendations', () => {
  test('returns empty for unknown task type', () => {
    const engine = createEngine();
    engine.recordReflection(makeReflection());
    const recs = engine.getRecommendations({ taskType: TaskType.DEPLOYMENT });
    expect(recs).toEqual([]);
  });

  test('returns empty when no taskType provided', () => {
    const engine = createEngine();
    expect(engine.getRecommendations({})).toEqual([]);
  });

  test('ranks successful strategies higher', () => {
    const engine = createEngine();

    // 3 successes with TDD
    for (let i = 0; i < 3; i++) {
      engine.recordReflection(makeReflection({ strategy: 'tdd', outcome: Outcome.SUCCESS }));
    }
    // 3 failures with hack-first
    for (let i = 0; i < 3; i++) {
      engine.recordReflection(makeReflection({ strategy: 'hack-first', outcome: Outcome.FAILURE }));
    }

    const recs = engine.getRecommendations({ taskType: TaskType.IMPLEMENTATION });
    expect(recs.length).toBeGreaterThanOrEqual(2);
    expect(recs[0].strategy).toBe('tdd');
    expect(recs[0].successRate).toBe(1.0);
    expect(recs[1].strategy).toBe('hack-first');
    expect(recs[1].successRate).toBe(0.0);
  });

  test('filters by agentId when provided', () => {
    const engine = createEngine();
    engine.recordReflection(makeReflection({ agentId: 'dev', strategy: 'strategy-a' }));
    engine.recordReflection(makeReflection({ agentId: 'qa', strategy: 'strategy-b' }));

    const recs = engine.getRecommendations({
      taskType: TaskType.IMPLEMENTATION,
      agentId: 'dev',
    });
    expect(recs).toHaveLength(1);
    expect(recs[0].strategy).toBe('strategy-a');
  });

  test('boosts score with tag overlap', () => {
    const engine = createEngine();
    engine.recordReflection(makeReflection({ strategy: 'with-tags', tags: ['react', 'frontend'] }));
    engine.recordReflection(
      makeReflection({ strategy: 'no-tags', tags: ['backend', 'database'] }),
    );

    const recs = engine.getRecommendations({
      taskType: TaskType.IMPLEMENTATION,
      tags: ['react', 'frontend'],
    });

    // with-tags should be ranked higher due to tag overlap
    expect(recs[0].strategy).toBe('with-tags');
  });

  test('collects lessons in recommendations', () => {
    const engine = createEngine();
    engine.recordReflection(
      makeReflection({ strategy: 'tdd', lesson: 'Write tests first' }),
    );
    engine.recordReflection(
      makeReflection({ strategy: 'tdd', lesson: 'Mock external deps' }),
    );

    const recs = engine.getRecommendations({ taskType: TaskType.IMPLEMENTATION });
    expect(recs[0].lessons).toContain('Write tests first');
    expect(recs[0].lessons).toContain('Mock external deps');
  });

  test('calculates average duration', () => {
    const engine = createEngine();
    engine.recordReflection(makeReflection({ strategy: 'fast', durationMs: 1000 }));
    engine.recordReflection(makeReflection({ strategy: 'fast', durationMs: 3000 }));

    const recs = engine.getRecommendations({ taskType: TaskType.IMPLEMENTATION });
    expect(recs[0].avgDurationMs).toBe(2000);
  });

  test('emits STRATEGY_RECOMMENDED event', () => {
    const engine = createEngine();
    const handler = jest.fn();
    engine.on(Events.STRATEGY_RECOMMENDED, handler);

    engine.recordReflection(makeReflection());
    engine.getRecommendations({ taskType: TaskType.IMPLEMENTATION });

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        taskType: TaskType.IMPLEMENTATION,
        topStrategy: 'test-first',
      }),
    );
  });

  test('respects maxRecommendations limit', () => {
    const engine = createEngine({ maxRecommendations: 2 });
    for (let i = 0; i < 5; i++) {
      engine.recordReflection(makeReflection({ strategy: `strategy-${i}` }));
    }

    const recs = engine.getRecommendations({ taskType: TaskType.IMPLEMENTATION });
    expect(recs.length).toBeLessThanOrEqual(2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CONTEXT INJECTION
// ═══════════════════════════════════════════════════════════════════════════════════

describe('ReflectionEngine - injectContext', () => {
  test('injects recommendations and patterns', () => {
    const engine = createEngine({ minReflectionsForPattern: 2 });
    engine.recordReflection(makeReflection({ strategy: 'tdd' }));
    engine.recordReflection(makeReflection({ strategy: 'tdd' }));

    const ctx = engine.injectContext({
      taskType: TaskType.IMPLEMENTATION,
      agentId: 'dev',
    });

    expect(ctx.reflections).toBeDefined();
    expect(ctx.reflections.recommendations.length).toBeGreaterThan(0);
    expect(ctx.reflections.totalReflections).toBe(2);
  });

  test('preserves original context properties', () => {
    const engine = createEngine();
    const ctx = engine.injectContext({
      taskType: TaskType.TESTING,
      agentId: 'qa',
      customField: 'preserved',
    });

    expect(ctx.customField).toBe('preserved');
    expect(ctx.agentId).toBe('qa');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════
//                              PATTERN DETECTION
// ═══════════════════════════════════════════════════════════════════════════════════

describe('ReflectionEngine - pattern detection', () => {
  test('detects pattern after minReflectionsForPattern', () => {
    const engine = createEngine({ minReflectionsForPattern: 3 });
    const handler = jest.fn();
    engine.on(Events.PATTERN_DETECTED, handler);

    engine.recordReflection(makeReflection({ strategy: 'tdd' }));
    engine.recordReflection(makeReflection({ strategy: 'tdd' }));
    expect(handler).not.toHaveBeenCalled();

    engine.recordReflection(makeReflection({ strategy: 'tdd' }));
    expect(handler).toHaveBeenCalledTimes(1);

    const pattern = handler.mock.calls[0][0];
    expect(pattern.taskType).toBe(TaskType.IMPLEMENTATION);
    expect(pattern.strategy).toBe('tdd');
    expect(pattern.sampleSize).toBe(3);
    expect(pattern.verdict).toBe('recommended');
  });

  test('marks failing patterns as avoid', () => {
    const engine = createEngine({ minReflectionsForPattern: 3 });

    for (let i = 0; i < 3; i++) {
      engine.recordReflection(
        makeReflection({ strategy: 'cowboy-coding', outcome: Outcome.FAILURE }),
      );
    }

    expect(engine.patterns).toHaveLength(1);
    expect(engine.patterns[0].verdict).toBe('avoid');
    expect(engine.patterns[0].successRate).toBe(0);
  });

  test('updates existing pattern on new data', () => {
    const engine = createEngine({ minReflectionsForPattern: 3 });

    for (let i = 0; i < 3; i++) {
      engine.recordReflection(makeReflection({ strategy: 'incremental' }));
    }
    expect(engine.patterns).toHaveLength(1);
    expect(engine.patterns[0].sampleSize).toBe(3);

    engine.recordReflection(makeReflection({ strategy: 'incremental' }));
    expect(engine.patterns).toHaveLength(1);
    expect(engine.patterns[0].sampleSize).toBe(4);
  });

  test('collects tags from all reflections into pattern', () => {
    const engine = createEngine({ minReflectionsForPattern: 3 });

    engine.recordReflection(makeReflection({ strategy: 's1', tags: ['a'] }));
    engine.recordReflection(makeReflection({ strategy: 's1', tags: ['b'] }));
    engine.recordReflection(makeReflection({ strategy: 's1', tags: ['a', 'c'] }));

    const tags = engine.patterns[0].tags;
    expect(tags).toContain('a');
    expect(tags).toContain('b');
    expect(tags).toContain('c');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════
//                              TRENDS
// ═══════════════════════════════════════════════════════════════════════════════════

describe('ReflectionEngine - getTrends', () => {
  test('returns insufficient_data for empty', () => {
    const engine = createEngine();
    const trends = engine.getTrends();
    expect(trends.trend).toBe('insufficient_data');
    expect(trends.total).toBe(0);
  });

  test('calculates success rate', () => {
    const engine = createEngine();
    engine.recordReflection(makeReflection({ outcome: Outcome.SUCCESS }));
    engine.recordReflection(makeReflection({ outcome: Outcome.SUCCESS }));
    engine.recordReflection(makeReflection({ outcome: Outcome.FAILURE }));

    const trends = engine.getTrends();
    expect(trends.total).toBe(3);
    expect(trends.successes).toBe(2);
    expect(trends.successRate).toBeCloseTo(0.667, 2);
  });

  test('detects improving trend', () => {
    const engine = createEngine();
    // First half: failures
    for (let i = 0; i < 4; i++) {
      engine.recordReflection(makeReflection({ outcome: Outcome.FAILURE }));
    }
    // Second half: successes
    for (let i = 0; i < 4; i++) {
      engine.recordReflection(makeReflection({ outcome: Outcome.SUCCESS }));
    }

    const trends = engine.getTrends();
    expect(trends.trend).toBe('improving');
  });

  test('detects declining trend', () => {
    const engine = createEngine();
    // First half: successes
    for (let i = 0; i < 4; i++) {
      engine.recordReflection(makeReflection({ outcome: Outcome.SUCCESS }));
    }
    // Second half: failures
    for (let i = 0; i < 4; i++) {
      engine.recordReflection(makeReflection({ outcome: Outcome.FAILURE }));
    }

    const trends = engine.getTrends();
    expect(trends.trend).toBe('declining');
  });

  test('filters by agentId', () => {
    const engine = createEngine();
    engine.recordReflection(makeReflection({ agentId: 'dev' }));
    engine.recordReflection(makeReflection({ agentId: 'qa' }));

    const trends = engine.getTrends({ agentId: 'dev' });
    expect(trends.total).toBe(1);
  });

  test('filters by taskType', () => {
    const engine = createEngine();
    engine.recordReflection(makeReflection({ taskType: TaskType.DEBUGGING }));
    engine.recordReflection(makeReflection({ taskType: TaskType.TESTING }));

    const trends = engine.getTrends({ taskType: TaskType.DEBUGGING });
    expect(trends.total).toBe(1);
  });

  test('calculates average duration', () => {
    const engine = createEngine();
    engine.recordReflection(makeReflection({ durationMs: 2000 }));
    engine.recordReflection(makeReflection({ durationMs: 4000 }));

    const trends = engine.getTrends();
    expect(trends.avgDurationMs).toBe(3000);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════
//                              PRUNE
// ═══════════════════════════════════════════════════════════════════════════════════

describe('ReflectionEngine - prune', () => {
  test('removes old reflections beyond retention window', () => {
    const engine = createEngine({ retentionDays: 30 });

    // Add a reflection with old date
    engine.reflections.push({
      id: 'old_1',
      taskType: TaskType.GENERAL,
      agentId: 'dev',
      outcome: Outcome.SUCCESS,
      strategy: 'old-strategy',
      createdAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString(),
    });

    // Add a recent one
    engine.recordReflection(makeReflection());

    expect(engine.reflections).toHaveLength(2);
    const pruned = engine.prune();
    expect(pruned).toBe(1);
    expect(engine.reflections).toHaveLength(1);
  });

  test('emits REFLECTIONS_PRUNED event', () => {
    const engine = createEngine({ retentionDays: 1 });
    const handler = jest.fn();
    engine.on(Events.REFLECTIONS_PRUNED, handler);

    engine.reflections.push({
      id: 'old_2',
      taskType: TaskType.GENERAL,
      agentId: 'dev',
      outcome: Outcome.SUCCESS,
      strategy: 'x',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    });

    engine.prune();
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ count: 1, reason: 'retention_window' }),
    );
  });

  test('returns 0 when nothing to prune', () => {
    const engine = createEngine();
    engine.recordReflection(makeReflection());
    expect(engine.prune()).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════
//                              STATS & LIST
// ═══════════════════════════════════════════════════════════════════════════════════

describe('ReflectionEngine - getStats', () => {
  test('returns complete statistics', () => {
    const engine = createEngine();
    engine.recordReflection(makeReflection({ outcome: Outcome.SUCCESS, agentId: 'dev' }));
    engine.recordReflection(makeReflection({ outcome: Outcome.FAILURE, agentId: 'qa' }));
    engine.recordReflection(
      makeReflection({ outcome: Outcome.SUCCESS, taskType: TaskType.TESTING, agentId: 'qa' }),
    );

    const stats = engine.getStats();
    expect(stats.totalReflections).toBe(3);
    expect(stats.byOutcome[Outcome.SUCCESS]).toBe(2);
    expect(stats.byOutcome[Outcome.FAILURE]).toBe(1);
    expect(stats.byAgent['dev']).toBe(1);
    expect(stats.byAgent['qa']).toBe(2);
    expect(stats.byTaskType[TaskType.IMPLEMENTATION]).toBe(2);
    expect(stats.byTaskType[TaskType.TESTING]).toBe(1);
  });
});

describe('ReflectionEngine - listReflections', () => {
  test('lists all reflections', () => {
    const engine = createEngine();
    engine.recordReflection(makeReflection());
    engine.recordReflection(makeReflection());
    expect(engine.listReflections()).toHaveLength(2);
  });

  test('filters by taskType', () => {
    const engine = createEngine();
    engine.recordReflection(makeReflection({ taskType: TaskType.DEBUGGING }));
    engine.recordReflection(makeReflection({ taskType: TaskType.TESTING }));

    expect(engine.listReflections({ taskType: TaskType.DEBUGGING })).toHaveLength(1);
  });

  test('filters by outcome', () => {
    const engine = createEngine();
    engine.recordReflection(makeReflection({ outcome: Outcome.SUCCESS }));
    engine.recordReflection(makeReflection({ outcome: Outcome.FAILURE }));

    expect(engine.listReflections({ outcome: Outcome.FAILURE })).toHaveLength(1);
  });

  test('filters by tag', () => {
    const engine = createEngine();
    engine.recordReflection(makeReflection({ tags: ['react'] }));
    engine.recordReflection(makeReflection({ tags: ['vue'] }));

    expect(engine.listReflections({ tag: 'react' })).toHaveLength(1);
  });

  test('applies limit', () => {
    const engine = createEngine();
    for (let i = 0; i < 10; i++) {
      engine.recordReflection(makeReflection());
    }

    expect(engine.listReflections({ limit: 3 })).toHaveLength(3);
  });
});
