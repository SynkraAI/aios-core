/**
 * Registry Syncer Tests
 *
 * Tests for the RegistrySyncer class, inferRole helper, and ROLE_MAP constant.
 *
 * Covers:
 * - ROLE_MAP structure and entries
 * - inferRole path-to-role inference (null, empty, backslash normalization, all patterns)
 * - RegistrySyncer constructor defaults and option injection
 * - _getClient() lazy/injected behavior
 * - _isProviderAvailable() injected vs fallback
 * - _shouldSkipIncremental() mtime gating logic
 * - syncEntity() enrichment pipeline (usedBy, dependencies, codeIntelMetadata)
 * - _findUsedBy() cross-reference and deduplication
 * - _findDependencies() JS/TS filtering and internal dep extraction
 * - _findEntityByPath() normalized path matching
 * - _atomicWrite() temp-file-then-rename strategy
 * - sync() full workflow with stats tracking
 * - getStats() returns a copy
 */

'use strict';

const path = require('path');

// --- Mocks ---

jest.mock('fs', () => ({
  statSync: jest.fn(),
  writeFileSync: jest.fn(),
  renameSync: jest.fn(),
}));

jest.mock('js-yaml', () => ({
  dump: jest.fn(() => 'yaml-content'),
}));

jest.mock('../../../.aios-core/core/code-intel/index', () => ({
  getClient: jest.fn(() => ({ _activeProvider: { name: 'fallback-provider' } })),
  isCodeIntelAvailable: jest.fn(() => false),
}));

jest.mock('../../../.aios-core/core/ids/registry-loader', () => ({
  RegistryLoader: jest.fn().mockImplementation(() => ({
    load: jest.fn(() => ({ entities: {}, metadata: {} })),
  })),
  DEFAULT_REGISTRY_PATH: '/default/registry.yaml',
}));

const fs = require('fs');
const yaml = require('js-yaml');
const { getClient, isCodeIntelAvailable } = require('../../../.aios-core/core/code-intel/index');
const { RegistryLoader } = require('../../../.aios-core/core/ids/registry-loader');

const { RegistrySyncer, inferRole, ROLE_MAP } = require('../../../.aios-core/core/code-intel/registry-syncer');

jest.setTimeout(30000);

// --- Helpers ---

/** Create a mock code-intel client with controllable responses. */
function createMockClient(overrides = {}) {
  return {
    findReferences: jest.fn().mockResolvedValue([]),
    analyzeDependencies: jest.fn().mockResolvedValue(null),
    _activeProvider: { name: 'test-provider' },
    ...overrides,
  };
}

/** Build a minimal syncer with sensible test defaults. */
function createSyncer(opts = {}) {
  return new RegistrySyncer({
    registryPath: '/test/registry.yaml',
    repoRoot: '/test/repo',
    client: createMockClient(),
    logger: jest.fn(),
    ...opts,
  });
}

// ──────────────────────────────────────────
// 1. ROLE_MAP
// ──────────────────────────────────────────

describe('ROLE_MAP', () => {
  it('should be an array of 7 [pattern, role] pairs', () => {
    expect(Array.isArray(ROLE_MAP)).toBe(true);
    expect(ROLE_MAP).toHaveLength(7);
    for (const entry of ROLE_MAP) {
      expect(entry).toHaveLength(2);
      expect(typeof entry[0]).toBe('string');
      expect(typeof entry[1]).toBe('string');
    }
  });

  it('should contain expected pattern-role mappings', () => {
    const map = Object.fromEntries(ROLE_MAP);
    expect(map['tasks/']).toBe('task');
    expect(map['templates/']).toBe('template');
    expect(map['agents/']).toBe('agent');
    expect(map['workflows/']).toBe('workflow');
    expect(map['scripts/']).toBe('script');
    expect(map['/data/']).toBe('config');
    expect(map['/core/']).toBe('module');
  });
});

// ──────────────────────────────────────────
// 2. inferRole
// ──────────────────────────────────────────

describe('inferRole', () => {
  it('should return "unknown" for null or undefined', () => {
    expect(inferRole(null)).toBe('unknown');
    expect(inferRole(undefined)).toBe('unknown');
  });

  it('should return "unknown" for empty string', () => {
    expect(inferRole('')).toBe('unknown');
  });

  it('should return "unknown" for paths matching no pattern', () => {
    expect(inferRole('/some/random/path.js')).toBe('unknown');
  });

  it.each([
    ['tasks/build.js', 'task'],
    ['templates/greeting.yaml', 'template'],
    ['agents/dev/config.yaml', 'agent'],
    ['workflows/deploy.yaml', 'workflow'],
    ['scripts/setup.sh', 'script'],
    ['/data/config.yaml', 'config'],
    ['/core/orchestration/engine.js', 'module'],
  ])('should infer "%s" as role "%s"', (inputPath, expectedRole) => {
    expect(inferRole(inputPath)).toBe(expectedRole);
  });

  it('should normalize backslashes before matching', () => {
    expect(inferRole('tasks\\build.js')).toBe('task');
    expect(inferRole('agents\\dev\\config.yaml')).toBe('agent');
    expect(inferRole('\\core\\engine.js')).toBe('module');
  });

  it('should match the first pattern when multiple could match', () => {
    // "tasks/" appears before "/core/", so tasks wins
    expect(inferRole('tasks/core/something.js')).toBe('task');
  });
});

// ──────────────────────────────────────────
// 3. RegistrySyncer constructor
// ──────────────────────────────────────────

describe('RegistrySyncer constructor', () => {
  it('should use defaults when no options are provided', () => {
    const syncer = new RegistrySyncer();
    expect(syncer._registryPath).toBe('/default/registry.yaml');
    expect(typeof syncer._repoRoot).toBe('string');
    expect(syncer._client).toBeNull();
    expect(syncer._logger).toBe(console.log);
    expect(syncer._stats).toEqual({ processed: 0, skipped: 0, errors: 0, total: 0 });
  });

  it('should accept injected options', () => {
    const client = createMockClient();
    const logger = jest.fn();
    const syncer = new RegistrySyncer({
      registryPath: '/custom/path.yaml',
      repoRoot: '/custom/root',
      client,
      logger,
    });
    expect(syncer._registryPath).toBe('/custom/path.yaml');
    expect(syncer._repoRoot).toBe('/custom/root');
    expect(syncer._client).toBe(client);
    expect(syncer._logger).toBe(logger);
  });
});

// ──────────────────────────────────────────
// 4. _getClient
// ──────────────────────────────────────────

describe('_getClient', () => {
  it('should return injected client when present', () => {
    const client = createMockClient();
    const syncer = createSyncer({ client });
    expect(syncer._getClient()).toBe(client);
  });

  it('should fall back to getClient() when no injected client', () => {
    const syncer = new RegistrySyncer({ logger: jest.fn() });
    const result = syncer._getClient();
    expect(getClient).toHaveBeenCalled();
    expect(result).toBeDefined();
  });
});

// ──────────────────────────────────────────
// 5. _isProviderAvailable
// ──────────────────────────────────────────

describe('_isProviderAvailable', () => {
  it('should return true if injected client has findReferences method', () => {
    const syncer = createSyncer({ client: createMockClient() });
    expect(syncer._isProviderAvailable()).toBe(true);
  });

  it('should return false if injected client lacks findReferences', () => {
    const syncer = createSyncer({ client: { analyzeDependencies: jest.fn() } });
    expect(syncer._isProviderAvailable()).toBe(false);
  });

  it('should fall back to isCodeIntelAvailable() when no injected client', () => {
    isCodeIntelAvailable.mockReturnValue(true);
    const syncer = new RegistrySyncer({ logger: jest.fn() });
    expect(syncer._isProviderAvailable()).toBe(true);
    expect(isCodeIntelAvailable).toHaveBeenCalled();
  });

  it('should return false when fallback says unavailable', () => {
    isCodeIntelAvailable.mockReturnValue(false);
    const syncer = new RegistrySyncer({ logger: jest.fn() });
    expect(syncer._isProviderAvailable()).toBe(false);
  });
});

// ──────────────────────────────────────────
// 6. _shouldSkipIncremental
// ──────────────────────────────────────────

describe('_shouldSkipIncremental', () => {
  let syncer;

  beforeEach(() => {
    syncer = createSyncer();
    fs.statSync.mockReset();
  });

  it('should return false when no codeIntelMetadata exists', () => {
    expect(syncer._shouldSkipIncremental({ path: 'foo.js' })).toBe(false);
  });

  it('should return false when lastSynced is missing', () => {
    expect(syncer._shouldSkipIncremental({
      path: 'foo.js',
      codeIntelMetadata: {},
    })).toBe(false);
  });

  it('should return true when mtime <= lastSynced', () => {
    const lastSynced = '2026-01-15T00:00:00.000Z';
    fs.statSync.mockReturnValue({ mtimeMs: new Date('2026-01-14T00:00:00.000Z').getTime() });

    const result = syncer._shouldSkipIncremental({
      path: 'foo.js',
      codeIntelMetadata: { lastSynced },
    });
    expect(result).toBe(true);
  });

  it('should return false when mtime > lastSynced (file changed)', () => {
    const lastSynced = '2026-01-15T00:00:00.000Z';
    fs.statSync.mockReturnValue({ mtimeMs: new Date('2026-01-16T00:00:00.000Z').getTime() });

    const result = syncer._shouldSkipIncremental({
      path: 'foo.js',
      codeIntelMetadata: { lastSynced },
    });
    expect(result).toBe(false);
  });

  it('should return true on stat error (file not found)', () => {
    fs.statSync.mockImplementation(() => { throw new Error('ENOENT'); });

    const result = syncer._shouldSkipIncremental({
      path: 'missing.js',
      codeIntelMetadata: { lastSynced: '2026-01-15T00:00:00.000Z' },
    });
    expect(result).toBe(true);
  });

  it('should return true when entityData has no path but has metadata', () => {
    const result = syncer._shouldSkipIncremental({
      codeIntelMetadata: { lastSynced: '2026-01-15T00:00:00.000Z' },
    });
    expect(result).toBe(true);
  });
});

// ──────────────────────────────────────────
// 7. syncEntity
// ──────────────────────────────────────────

describe('syncEntity', () => {
  let syncer;
  let client;

  beforeEach(() => {
    client = createMockClient({
      findReferences: jest.fn().mockResolvedValue([]),
      analyzeDependencies: jest.fn().mockResolvedValue(null),
    });
    syncer = createSyncer({ client });
    fs.statSync.mockReset();
  });

  it('should return false (skip) when entity has no path', async () => {
    const entity = { id: 'test-entity', category: 'core', data: {} };
    const result = await syncer.syncEntity(entity, {}, false);
    expect(result).toBe(false);
  });

  it('should respect incremental skip when isFull=false', async () => {
    const lastSynced = '2026-01-15T00:00:00.000Z';
    fs.statSync.mockReturnValue({ mtimeMs: new Date('2026-01-14T00:00:00.000Z').getTime() });

    const entity = {
      id: 'test-entity',
      category: 'core',
      data: {
        path: 'src/foo.js',
        codeIntelMetadata: { lastSynced },
      },
    };

    const result = await syncer.syncEntity(entity, {}, false);
    expect(result).toBe(false);
  });

  it('should NOT skip in full mode even if mtime <= lastSynced', async () => {
    const lastSynced = '2026-01-15T00:00:00.000Z';
    fs.statSync.mockReturnValue({ mtimeMs: new Date('2026-01-14T00:00:00.000Z').getTime() });

    const entity = {
      id: 'test-entity',
      category: 'core',
      data: {
        path: 'tasks/foo.js',
        codeIntelMetadata: { lastSynced },
      },
    };

    const result = await syncer.syncEntity(entity, {}, true);
    expect(result).toBe(true);
  });

  it('should populate usedBy from findReferences', async () => {
    const entities = {
      core: {
        'entity-a': { path: 'src/a.js' },
        'entity-b': { path: 'src/b.js' },
      },
    };
    client.findReferences.mockResolvedValue([
      { file: 'src/b.js' },
    ]);

    const entity = {
      id: 'entity-a',
      category: 'core',
      data: { path: 'tasks/a.js' },
    };

    await syncer.syncEntity(entity, entities, true);
    expect(entity.data.usedBy).toEqual(['entity-b']);
  });

  it('should populate dependencies for JS files', async () => {
    client.analyzeDependencies.mockResolvedValue({
      dependencies: [
        { path: './utils.js' },
        { path: 'lodash' },
      ],
    });

    const entity = {
      id: 'entity-a',
      category: 'core',
      data: { path: 'tasks/a.js' },
    };

    await syncer.syncEntity(entity, {}, true);
    expect(entity.data.dependencies).toEqual(['./utils.js']);
  });

  it('should populate codeIntelMetadata with callerCount, role, lastSynced, provider', async () => {
    client.findReferences.mockResolvedValue([]);

    const entity = {
      id: 'test-entity',
      category: 'core',
      data: { path: 'agents/dev/config.yaml' },
    };

    await syncer.syncEntity(entity, {}, true);

    const meta = entity.data.codeIntelMetadata;
    expect(meta).toBeDefined();
    expect(meta.callerCount).toBe(0);
    expect(meta.role).toBe('agent');
    expect(typeof meta.lastSynced).toBe('string');
    expect(meta.provider).toBe('test-provider');
  });

  it('should set provider to "unknown" when _activeProvider is absent', async () => {
    const bareClient = createMockClient({ _activeProvider: undefined });
    const s = createSyncer({ client: bareClient });

    const entity = {
      id: 'test-entity',
      category: 'core',
      data: { path: 'tasks/run.js' },
    };

    await s.syncEntity(entity, {}, true);
    expect(entity.data.codeIntelMetadata.provider).toBe('unknown');
  });
});

// ──────────────────────────────────────────
// 8. _findUsedBy
// ──────────────────────────────────────────

describe('_findUsedBy', () => {
  let syncer;
  let client;

  beforeEach(() => {
    client = createMockClient();
    syncer = createSyncer({ client });
  });

  it('should return null when findReferences returns null', async () => {
    client.findReferences.mockResolvedValue(null);
    const result = await syncer._findUsedBy(client, 'entity-a', {});
    expect(result).toBeNull();
  });

  it('should return null when findReferences returns non-array', async () => {
    client.findReferences.mockResolvedValue('not-an-array');
    const result = await syncer._findUsedBy(client, 'entity-a', {});
    expect(result).toBeNull();
  });

  it('should return null when findReferences throws', async () => {
    client.findReferences.mockRejectedValue(new Error('provider down'));
    const result = await syncer._findUsedBy(client, 'entity-a', {});
    expect(result).toBeNull();
  });

  it('should cross-reference and return matching entity IDs', async () => {
    const entities = {
      core: {
        'entity-a': { path: 'src/a.js' },
        'entity-b': { path: 'src/b.js' },
        'entity-c': { path: 'src/c.js' },
      },
    };
    client.findReferences.mockResolvedValue([
      { file: 'src/b.js' },
      { path: 'src/c.js' },
    ]);

    const result = await syncer._findUsedBy(client, 'entity-a', entities);
    expect(result).toEqual(expect.arrayContaining(['entity-b', 'entity-c']));
    expect(result).toHaveLength(2);
  });

  it('should exclude self-references', async () => {
    const entities = {
      core: {
        'entity-a': { path: 'src/a.js' },
      },
    };
    client.findReferences.mockResolvedValue([
      { file: 'src/a.js' },
    ]);

    const result = await syncer._findUsedBy(client, 'entity-a', entities);
    expect(result).toEqual([]);
  });

  it('should deduplicate results', async () => {
    const entities = {
      core: {
        'entity-a': { path: 'src/a.js' },
        'entity-b': { path: 'src/b.js' },
      },
    };
    client.findReferences.mockResolvedValue([
      { file: 'src/b.js' },
      { file: 'src/b.js' },
      { path: 'src/b.js' },
    ]);

    const result = await syncer._findUsedBy(client, 'entity-a', entities);
    expect(result).toEqual(['entity-b']);
  });

  it('should handle string references (not objects)', async () => {
    const entities = {
      core: {
        'entity-a': { path: 'src/a.js' },
        'entity-b': { path: 'src/b.js' },
      },
    };
    client.findReferences.mockResolvedValue(['src/b.js']);

    const result = await syncer._findUsedBy(client, 'entity-a', entities);
    expect(result).toEqual(['entity-b']);
  });

  it('should return null when references contain null (property access error)', async () => {
    client.findReferences.mockResolvedValue([42, null, { noFileOrPath: true }]);
    const result = await syncer._findUsedBy(client, 'entity-a', {});
    expect(result).toBeNull();
  });

  it('should skip non-string references that are not null', async () => {
    client.findReferences.mockResolvedValue([42, { noFileOrPath: true }]);
    const result = await syncer._findUsedBy(client, 'entity-a', {});
    expect(result).toEqual([]);
  });
});

// ──────────────────────────────────────────
// 9. _findDependencies
// ──────────────────────────────────────────

describe('_findDependencies', () => {
  let syncer;
  let client;

  beforeEach(() => {
    client = createMockClient();
    syncer = createSyncer({ client });
  });

  it('should return null for non-JS/TS files', async () => {
    expect(await syncer._findDependencies(client, 'config.yaml')).toBeNull();
    expect(await syncer._findDependencies(client, 'readme.md')).toBeNull();
    expect(await syncer._findDependencies(client, 'image.png')).toBeNull();
  });

  it.each(['.js', '.ts', '.mjs', '.cjs'])(
    'should analyze %s files',
    async (ext) => {
      client.analyzeDependencies.mockResolvedValue({
        dependencies: [{ path: './local-dep.js' }],
      });

      const result = await syncer._findDependencies(client, `src/file${ext}`);
      expect(result).toEqual(['./local-dep.js']);
      expect(client.analyzeDependencies).toHaveBeenCalled();
    },
  );

  it('should return null when analyzeDependencies returns null', async () => {
    client.analyzeDependencies.mockResolvedValue(null);
    const result = await syncer._findDependencies(client, 'src/foo.js');
    expect(result).toBeNull();
  });

  it('should filter to internal dependencies only (relative, absolute, .aios-core)', async () => {
    client.analyzeDependencies.mockResolvedValue({
      dependencies: [
        { path: './utils.js' },
        { path: '/absolute/module.js' },
        { path: '.aios-core/core/engine.js' },
        { path: 'lodash' },
        { path: 'express' },
      ],
    });

    const result = await syncer._findDependencies(client, 'src/foo.js');
    expect(result).toEqual([
      './utils.js',
      '/absolute/module.js',
      '.aios-core/core/engine.js',
    ]);
  });

  it('should handle result.imports format', async () => {
    client.analyzeDependencies.mockResolvedValue({
      imports: [
        { source: './local.js' },
        { source: 'react' },
      ],
    });

    const result = await syncer._findDependencies(client, 'src/foo.ts');
    expect(result).toEqual(['./local.js']);
  });

  it('should handle raw array format', async () => {
    client.analyzeDependencies.mockResolvedValue([
      './dep-a.js',
      'lodash',
    ]);

    const result = await syncer._findDependencies(client, 'src/foo.js');
    expect(result).toEqual(['./dep-a.js']);
  });

  it('should return null when result is not an array and has no dependencies/imports', async () => {
    client.analyzeDependencies.mockResolvedValue({ something: 'else' });
    const result = await syncer._findDependencies(client, 'src/foo.js');
    expect(result).toBeNull();
  });

  it('should return null when analyzeDependencies throws', async () => {
    client.analyzeDependencies.mockRejectedValue(new Error('parse error'));
    const result = await syncer._findDependencies(client, 'src/foo.js');
    expect(result).toBeNull();
  });

  it('should return null when dependency entries contain null (property access error)', async () => {
    client.analyzeDependencies.mockResolvedValue({
      dependencies: [42, null, { noPathOrSource: true }, { path: './valid.js' }],
    });

    const result = await syncer._findDependencies(client, 'src/foo.js');
    expect(result).toBeNull();
  });

  it('should skip non-string dependency entries that are not null', async () => {
    client.analyzeDependencies.mockResolvedValue({
      dependencies: [42, { noPathOrSource: true }, { path: './valid.js' }],
    });

    const result = await syncer._findDependencies(client, 'src/foo.js');
    expect(result).toEqual(['./valid.js']);
  });
});

// ──────────────────────────────────────────
// 10. _findEntityByPath
// ──────────────────────────────────────────

describe('_findEntityByPath', () => {
  let syncer;

  beforeEach(() => {
    syncer = createSyncer();
  });

  it('should return matching entity ID', () => {
    const entities = {
      core: {
        'entity-a': { path: 'src/a.js' },
        'entity-b': { path: 'src/b.js' },
      },
    };
    expect(syncer._findEntityByPath('src/a.js', entities)).toBe('entity-a');
  });

  it('should normalize backslashes in filePath', () => {
    const entities = {
      core: {
        'entity-a': { path: 'src/a.js' },
      },
    };
    expect(syncer._findEntityByPath('src\\a.js', entities)).toBe('entity-a');
  });

  it('should normalize backslashes in entity paths', () => {
    const entities = {
      core: {
        'entity-a': { path: 'src\\a.js' },
      },
    };
    expect(syncer._findEntityByPath('src/a.js', entities)).toBe('entity-a');
  });

  it('should return null when no entity matches', () => {
    const entities = {
      core: {
        'entity-a': { path: 'src/a.js' },
      },
    };
    expect(syncer._findEntityByPath('src/z.js', entities)).toBeNull();
  });

  it('should skip categories that are null or not objects', () => {
    const entities = {
      nullCategory: null,
      stringCategory: 'not-an-object',
      core: {
        'entity-a': { path: 'src/a.js' },
      },
    };
    expect(syncer._findEntityByPath('src/a.js', entities)).toBe('entity-a');
  });

  it('should match partial paths (includes check)', () => {
    const entities = {
      core: {
        'entity-a': { path: 'core/engine.js' },
      },
    };
    // filePath is a full path that includes the entity path
    expect(syncer._findEntityByPath('/Users/repo/core/engine.js', entities)).toBe('entity-a');
  });

  it('should skip entities without a path property', () => {
    const entities = {
      core: {
        'no-path': { name: 'no path entity' },
        'has-path': { path: 'src/match.js' },
      },
    };
    expect(syncer._findEntityByPath('src/match.js', entities)).toBe('has-path');
  });
});

// ──────────────────────────────────────────
// 11. _atomicWrite
// ──────────────────────────────────────────

describe('_atomicWrite', () => {
  let syncer;

  beforeEach(() => {
    syncer = createSyncer();
    fs.writeFileSync.mockReset();
    fs.renameSync.mockReset();
    yaml.dump.mockReturnValue('yaml-content');
  });

  it('should write to .tmp file then rename to target', () => {
    const registry = { entities: {}, metadata: {} };
    syncer._atomicWrite('/path/to/registry.yaml', registry);

    expect(yaml.dump).toHaveBeenCalledWith(registry, { lineWidth: 120, noRefs: true });
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      '/path/to/registry.yaml.tmp',
      'yaml-content',
      'utf8',
    );
    expect(fs.renameSync).toHaveBeenCalledWith(
      '/path/to/registry.yaml.tmp',
      '/path/to/registry.yaml',
    );
  });

  it('should call writeFileSync before renameSync', () => {
    const callOrder = [];
    fs.writeFileSync.mockImplementation(() => callOrder.push('write'));
    fs.renameSync.mockImplementation(() => callOrder.push('rename'));

    syncer._atomicWrite('/path/to/registry.yaml', {});
    expect(callOrder).toEqual(['write', 'rename']);
  });
});

// ──────────────────────────────────────────
// 12. sync (full workflow)
// ──────────────────────────────────────────

describe('sync', () => {
  let client;
  let logger;

  beforeEach(() => {
    client = createMockClient({
      findReferences: jest.fn().mockResolvedValue([]),
      analyzeDependencies: jest.fn().mockResolvedValue(null),
    });
    logger = jest.fn();
    fs.writeFileSync.mockReset();
    fs.renameSync.mockReset();
    fs.statSync.mockReset();
    yaml.dump.mockReturnValue('yaml-content');
  });

  it('should abort with aborted=true when no provider is available', async () => {
    const syncer = createSyncer({
      client: { /* no findReferences */ },
      logger,
    });

    const result = await syncer.sync();
    expect(result.aborted).toBe(true);
    expect(result.processed).toBe(0);
  });

  it('should process all entities from loaded registry', async () => {
    RegistryLoader.mockImplementation(() => ({
      load: jest.fn(() => ({
        entities: {
          core: {
            'entity-a': { path: 'tasks/a.js' },
            'entity-b': { path: 'agents/b.yaml' },
          },
        },
        metadata: {},
      })),
    }));

    const syncer = createSyncer({ client, logger });
    const result = await syncer.sync({ full: true });

    expect(result.total).toBe(2);
    expect(result.processed).toBe(2);
    expect(result.skipped).toBe(0);
    expect(result.errors).toBe(0);
  });

  it('should track skipped entities in incremental mode', async () => {
    const lastSynced = '2026-01-15T00:00:00.000Z';
    fs.statSync.mockReturnValue({ mtimeMs: new Date('2026-01-14T00:00:00.000Z').getTime() });

    RegistryLoader.mockImplementation(() => ({
      load: jest.fn(() => ({
        entities: {
          core: {
            'entity-a': {
              path: 'tasks/a.js',
              codeIntelMetadata: { lastSynced },
            },
          },
        },
        metadata: {},
      })),
    }));

    const syncer = createSyncer({ client, logger });
    const result = await syncer.sync({ full: false });

    expect(result.skipped).toBe(1);
    expect(result.processed).toBe(0);
  });

  it('should track errors when syncEntity throws', async () => {
    client.findReferences.mockRejectedValue(new Error('boom'));

    RegistryLoader.mockImplementation(() => ({
      load: jest.fn(() => ({
        entities: {
          core: {
            'entity-a': { path: 'tasks/a.js' },
          },
        },
        metadata: {},
      })),
    }));

    // Override syncEntity to throw
    const syncer = createSyncer({ client, logger });
    jest.spyOn(syncer, 'syncEntity').mockRejectedValue(new Error('test error'));

    const result = await syncer.sync({ full: true });
    expect(result.errors).toBe(1);
  });

  it('should perform atomic write after enrichment', async () => {
    RegistryLoader.mockImplementation(() => ({
      load: jest.fn(() => ({
        entities: {
          core: { 'entity-a': { path: 'tasks/a.js' } },
        },
        metadata: {},
      })),
    }));

    const syncer = createSyncer({ client, logger });
    await syncer.sync({ full: true });

    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(fs.renameSync).toHaveBeenCalled();
  });

  it('should update metadata with lastUpdated and entityCount', async () => {
    let writtenRegistry = null;
    yaml.dump.mockImplementation((data) => {
      writtenRegistry = data;
      return 'yaml-content';
    });

    RegistryLoader.mockImplementation(() => ({
      load: jest.fn(() => ({
        entities: {
          core: { 'entity-a': { path: 'tasks/a.js' } },
        },
        metadata: {},
      })),
    }));

    const syncer = createSyncer({ client, logger });
    await syncer.sync({ full: true });

    expect(writtenRegistry.metadata.lastUpdated).toBeDefined();
    expect(writtenRegistry.metadata.entityCount).toBe(1);
  });

  it('should skip non-object categories', async () => {
    RegistryLoader.mockImplementation(() => ({
      load: jest.fn(() => ({
        entities: {
          validCategory: { 'entity-a': { path: 'tasks/a.js' } },
          nullCategory: null,
          stringCategory: 'not-an-object',
        },
        metadata: {},
      })),
    }));

    const syncer = createSyncer({ client, logger });
    const result = await syncer.sync({ full: true });

    expect(result.total).toBe(1);
    expect(result.processed).toBe(1);
  });

  it('should log sync start and completion messages', async () => {
    RegistryLoader.mockImplementation(() => ({
      load: jest.fn(() => ({ entities: {}, metadata: {} })),
    }));

    const syncer = createSyncer({ client, logger });
    await syncer.sync({ full: true });

    const startMsg = logger.mock.calls.find(([msg]) =>
      msg.includes('Starting full sync'),
    );
    const completeMsg = logger.mock.calls.find(([msg]) =>
      msg.includes('Sync complete'),
    );
    expect(startMsg).toBeDefined();
    expect(completeMsg).toBeDefined();
  });

  it('should log incremental mode in start message', async () => {
    RegistryLoader.mockImplementation(() => ({
      load: jest.fn(() => ({ entities: {}, metadata: {} })),
    }));

    const syncer = createSyncer({ client, logger });
    await syncer.sync({ full: false });

    const startMsg = logger.mock.calls.find(([msg]) =>
      msg.includes('incremental'),
    );
    expect(startMsg).toBeDefined();
  });

  it('should handle empty entities gracefully', async () => {
    RegistryLoader.mockImplementation(() => ({
      load: jest.fn(() => ({ entities: {}, metadata: {} })),
    }));

    const syncer = createSyncer({ client, logger });
    const result = await syncer.sync({ full: true });

    expect(result.total).toBe(0);
    expect(result.processed).toBe(0);
    expect(result.skipped).toBe(0);
    expect(result.errors).toBe(0);
  });
});

// ──────────────────────────────────────────
// 13. getStats
// ──────────────────────────────────────────

describe('getStats', () => {
  it('should return initial stats before any sync', () => {
    const syncer = createSyncer();
    const stats = syncer.getStats();
    expect(stats).toEqual({ processed: 0, skipped: 0, errors: 0, total: 0 });
  });

  it('should return a copy (not a reference to internal stats)', () => {
    const syncer = createSyncer();
    const stats1 = syncer.getStats();
    stats1.processed = 999;
    const stats2 = syncer.getStats();
    expect(stats2.processed).toBe(0);
  });
});
