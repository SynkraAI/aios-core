/**
 * Testes unitarios para ResultAggregator
 *
 * Cobre aggregate, aggregateAll, detectFileConflicts,
 * assessConflictSeverity, suggestResolution, extractFilesFromOutput,
 * metrics, warnings e history.
 *
 * @see .aiox-core/core/execution/result-aggregator.js
 * @issue #52
 */

'use strict';

const path = require('path');
const os = require('os');
const fs = require('fs');
const ResultAggregator = require('../../../.aiox-core/core/execution/result-aggregator');

// ============================================================================
// Constructor
// ============================================================================

describe('ResultAggregator -- constructor', () => {
  it('deve usar defaults quando sem config', () => {
    const agg = new ResultAggregator();
    expect(agg.detectConflicts).toBe(true);
    expect(agg.maxHistory).toBe(50);
  });

  it('deve aceitar config custom', () => {
    const agg = new ResultAggregator({
      detectConflicts: false,
      maxHistory: 10,
    });
    expect(agg.detectConflicts).toBe(false);
    expect(agg.maxHistory).toBe(10);
  });

  it('deve ser EventEmitter', () => {
    const agg = new ResultAggregator();
    expect(typeof agg.on).toBe('function');
    expect(typeof agg.emit).toBe('function');
  });
});

// ============================================================================
// detectFileConflicts
// ============================================================================

describe('ResultAggregator -- detectFileConflicts', () => {
  let agg;
  beforeEach(() => { agg = new ResultAggregator(); });

  it('deve detectar conflito quando dois tasks modificam mesmo arquivo', () => {
    const tasks = [
      { taskId: 'task-1', filesModified: ['src/index.js', 'src/utils.js'] },
      { taskId: 'task-2', filesModified: ['src/index.js'] },
    ];
    const conflicts = agg.detectFileConflicts(tasks);

    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].file).toBe('src/index.js');
    expect(conflicts[0].tasks).toEqual(['task-1', 'task-2']);
    expect(conflicts[0].type).toBe('concurrent_modification');
  });

  it('deve retornar array vazio sem conflitos', () => {
    const tasks = [
      { taskId: 'task-1', filesModified: ['src/a.js'] },
      { taskId: 'task-2', filesModified: ['src/b.js'] },
    ];
    expect(agg.detectFileConflicts(tasks)).toEqual([]);
  });

  it('deve lidar com tasks sem filesModified', () => {
    const tasks = [
      { taskId: 'task-1' },
      { taskId: 'task-2', filesModified: [] },
    ];
    expect(agg.detectFileConflicts(tasks)).toEqual([]);
  });
});

// ============================================================================
// assessConflictSeverity
// ============================================================================

describe('ResultAggregator -- assessConflictSeverity', () => {
  let agg;
  beforeEach(() => { agg = new ResultAggregator(); });

  it('deve retornar critical para package.json', () => {
    expect(agg.assessConflictSeverity('package.json')).toBe('critical');
  });

  it('deve retornar critical para tsconfig.json', () => {
    expect(agg.assessConflictSeverity('tsconfig.json')).toBe('critical');
  });

  it('deve retornar critical para .env', () => {
    expect(agg.assessConflictSeverity('.env')).toBe('critical');
  });

  it('deve retornar critical para index.js', () => {
    expect(agg.assessConflictSeverity('src/index.js')).toBe('critical');
  });

  it('deve retornar high para arquivos de config', () => {
    expect(agg.assessConflictSeverity('config/database.js')).toBe('high');
  });

  it('deve retornar high para schemas', () => {
    expect(agg.assessConflictSeverity('db/schema.sql')).toBe('high');
  });

  it('deve retornar high para migrations', () => {
    expect(agg.assessConflictSeverity('migrations/001.sql')).toBe('high');
  });

  it('deve retornar medium para outros arquivos', () => {
    expect(agg.assessConflictSeverity('src/utils/helper.js')).toBe('medium');
  });
});

// ============================================================================
// suggestResolution
// ============================================================================

describe('ResultAggregator -- suggestResolution', () => {
  let agg;
  beforeEach(() => { agg = new ResultAggregator(); });

  it('deve sugerir merge manual para JSON', () => {
    const res = agg.suggestResolution('package.json', 'a', 'b');
    expect(res).toContain('Merge JSON');
    expect(res).toContain('a');
    expect(res).toContain('b');
  });

  it('deve sugerir merge automatico para testes', () => {
    expect(agg.suggestResolution('test/foo.test.js', 'a', 'b')).toContain('automatically');
    expect(agg.suggestResolution('spec/bar.spec.js', 'a', 'b')).toContain('automatically');
  });

  it('deve sugerir review para outros arquivos', () => {
    expect(agg.suggestResolution('src/app.js', 'a', 'b')).toContain('Review');
  });
});

// ============================================================================
// extractFilesFromOutput
// ============================================================================

describe('ResultAggregator -- extractFilesFromOutput', () => {
  let agg;
  beforeEach(() => { agg = new ResultAggregator(); });

  it('deve retornar array vazio para output nulo', () => {
    expect(agg.extractFilesFromOutput(null)).toEqual([]);
    expect(agg.extractFilesFromOutput(undefined)).toEqual([]);
    expect(agg.extractFilesFromOutput('')).toEqual([]);
  });

  it('deve extrair arquivos de padroes "created/modified"', () => {
    const output = 'created file `src/index.js`\nmodified "config/app.js"';
    const files = agg.extractFilesFromOutput(output);
    expect(files).toContain('src/index.js');
    expect(files).toContain('config/app.js');
  });

  it('deve extrair arquivos de padroes "file:" e "path:"', () => {
    const output = 'file: src/utils.js\npath: "config.json"';
    const files = agg.extractFilesFromOutput(output);
    expect(files).toContain('src/utils.js');
  });
});

// ============================================================================
// aggregate
// ============================================================================

describe('ResultAggregator -- aggregate', () => {
  let agg;
  beforeEach(() => {
    agg = new ResultAggregator({ detectConflicts: true });
  });

  it('deve agregar resultados de wave simples', async () => {
    const waveResults = {
      waveIndex: 1,
      results: [
        { taskId: 'task-1', agentId: 'dev', success: true, duration: 100, output: 'done' },
        { taskId: 'task-2', agentId: 'qa', success: true, duration: 200, output: 'ok' },
      ],
    };

    const result = await agg.aggregate(waveResults);

    expect(result.waveIndex).toBe(1);
    expect(result.tasks).toHaveLength(2);
    expect(result.tasks[0].taskId).toBe('task-1');
    expect(result.tasks[0].success).toBe(true);
    expect(result.conflicts).toEqual([]);
    expect(result.metrics).toHaveProperty('totalTasks');
  });

  it('deve detectar conflitos entre tasks', async () => {
    const events = [];
    agg.on('conflicts_detected', (data) => events.push(data));

    const waveResults = {
      waveIndex: 1,
      results: [
        { taskId: 'task-1', success: true, filesModified: ['src/index.js'] },
        { taskId: 'task-2', success: true, filesModified: ['src/index.js', 'src/b.js'] },
      ],
    };

    const result = await agg.aggregate(waveResults);

    expect(result.conflicts).toHaveLength(1);
    expect(events).toHaveLength(1);
  });

  it('deve adicionar ao history', async () => {
    await agg.aggregate({ waveIndex: 0, results: [] });
    await agg.aggregate({ waveIndex: 1, results: [] });

    expect(agg.history).toHaveLength(2);
  });

  it('deve emitir aggregation_complete', async () => {
    const events = [];
    agg.on('aggregation_complete', (data) => events.push(data));

    await agg.aggregate({ waveIndex: 0, results: [] });
    expect(events).toHaveLength(1);
  });

  it('deve respeitar maxHistory', async () => {
    agg.maxHistory = 3;
    for (let i = 0; i < 5; i++) {
      await agg.aggregate({ waveIndex: i, results: [] });
    }
    expect(agg.history).toHaveLength(3);
  });

  it('deve pular deteccao de conflitos quando desabilitado', async () => {
    agg.detectConflicts = false;
    const waveResults = {
      waveIndex: 0,
      results: [
        { taskId: 'task-1', success: true, filesModified: ['a.js'] },
        { taskId: 'task-2', success: true, filesModified: ['a.js'] },
      ],
    };

    const result = await agg.aggregate(waveResults);
    expect(result.conflicts).toEqual([]);
  });
});

// ============================================================================
// aggregateAll
// ============================================================================

describe('ResultAggregator -- aggregateAll', () => {
  let agg;
  beforeEach(() => { agg = new ResultAggregator(); });

  it('deve consolidar multiplas waves', async () => {
    const waves = [
      { waveIndex: 0, results: [{ taskId: 'a', success: true }] },
      { waveIndex: 1, results: [{ taskId: 'b', success: true }] },
    ];

    const result = await agg.aggregateAll(waves);
    expect(result.waves).toHaveLength(2);
    expect(result.allTasks).toHaveLength(2);
    expect(result.overallMetrics).toHaveProperty('totalTasks');
  });

  it('deve coletar conflitos de todas as waves', async () => {
    const waves = [
      {
        waveIndex: 0,
        results: [
          { taskId: 'a', success: true, filesModified: ['x.js'] },
          { taskId: 'b', success: true, filesModified: ['x.js'] },
        ],
      },
    ];

    const result = await agg.aggregateAll(waves);
    expect(result.allConflicts.length).toBeGreaterThan(0);
    expect(result.allConflicts[0]).toHaveProperty('waveIndex');
  });
});
