'use strict';

jest.mock('../../../.aios-core/core/code-intel/providers/provider-interface', () => ({
  CodeIntelProvider: class {
    constructor(name, options) {
      this.name = name;
      this.options = options;
    }
  },
}));

const {
  CodeGraphProvider,
  TOOL_MAP,
} = require('../../../.aios-core/core/code-intel/providers/code-graph-provider');

// ---------------------------------------------------------------------------
// TOOL_MAP
// ---------------------------------------------------------------------------
describe('TOOL_MAP', () => {
  it('maps all 8 capability names to MCP tool names', () => {
    expect(Object.keys(TOOL_MAP)).toHaveLength(8);
  });

  it.each([
    ['findDefinition', 'find_definition'],
    ['findReferences', 'find_references'],
    ['findCallers', 'find_callers'],
    ['findCallees', 'find_callees'],
    ['analyzeDependencies', 'dependency_analysis'],
    ['analyzeComplexity', 'complexity_analysis'],
    ['analyzeCodebase', 'analyze_codebase'],
    ['getProjectStats', 'project_statistics'],
  ])('maps %s → %s', (capability, mcpTool) => {
    expect(TOOL_MAP[capability]).toBe(mcpTool);
  });
});

// ---------------------------------------------------------------------------
// Constructor
// ---------------------------------------------------------------------------
describe('CodeGraphProvider constructor', () => {
  it('sets name to "code-graph"', () => {
    const provider = new CodeGraphProvider();
    expect(provider.name).toBe('code-graph');
  });

  it('stores options', () => {
    const opts = { foo: 'bar' };
    const provider = new CodeGraphProvider(opts);
    expect(provider.options).toBe(opts);
  });

  it('defaults mcpServerName to "code-graph"', () => {
    const provider = new CodeGraphProvider();
    expect(provider._mcpServerName).toBe('code-graph');
  });

  it('accepts custom mcpServerName from options', () => {
    const provider = new CodeGraphProvider({ mcpServerName: 'custom-server' });
    expect(provider._mcpServerName).toBe('custom-server');
  });

  it('defaults options to empty object when not provided', () => {
    const provider = new CodeGraphProvider();
    expect(provider.options).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// _callMcpTool
// ---------------------------------------------------------------------------
describe('_callMcpTool', () => {
  it('calls mcpCallFn with server name, tool name and params', async () => {
    const mcpCallFn = jest.fn().mockResolvedValue({ ok: true });
    const provider = new CodeGraphProvider({ mcpCallFn });

    const result = await provider._callMcpTool('find_definition', { symbol: 'foo' });

    expect(mcpCallFn).toHaveBeenCalledWith('code-graph', 'find_definition', { symbol: 'foo' });
    expect(result).toEqual({ ok: true });
  });

  it('returns null when mcpCallFn is not configured', async () => {
    const provider = new CodeGraphProvider();
    const result = await provider._callMcpTool('find_definition', {});
    expect(result).toBeNull();
  });

  it('returns null when mcpCallFn is not a function', async () => {
    const provider = new CodeGraphProvider({ mcpCallFn: 'not-a-function' });
    const result = await provider._callMcpTool('find_definition', {});
    expect(result).toBeNull();
  });

  it('defaults params to empty object', async () => {
    const mcpCallFn = jest.fn().mockResolvedValue(null);
    const provider = new CodeGraphProvider({ mcpCallFn });

    await provider._callMcpTool('find_definition');

    expect(mcpCallFn).toHaveBeenCalledWith('code-graph', 'find_definition', {});
  });

  it('uses custom mcpServerName', async () => {
    const mcpCallFn = jest.fn().mockResolvedValue(null);
    const provider = new CodeGraphProvider({ mcpCallFn, mcpServerName: 'my-server' });

    await provider._callMcpTool('find_definition', {});

    expect(mcpCallFn).toHaveBeenCalledWith('my-server', 'find_definition', {});
  });
});

// ---------------------------------------------------------------------------
// Capability methods — routing & parameter forwarding
// ---------------------------------------------------------------------------
describe('capability methods', () => {
  let provider;
  let mcpCallFn;

  beforeEach(() => {
    mcpCallFn = jest.fn().mockResolvedValue(null);
    provider = new CodeGraphProvider({ mcpCallFn });
  });

  describe('findDefinition', () => {
    it('calls _callMcpTool with find_definition and forwards symbol + options', async () => {
      await provider.findDefinition('MyClass', { includeTests: true });
      expect(mcpCallFn).toHaveBeenCalledWith('code-graph', 'find_definition', {
        symbol: 'MyClass',
        includeTests: true,
      });
    });

    it('defaults options to empty object', async () => {
      await provider.findDefinition('MyClass');
      expect(mcpCallFn).toHaveBeenCalledWith('code-graph', 'find_definition', {
        symbol: 'MyClass',
      });
    });
  });

  describe('findReferences', () => {
    it('calls _callMcpTool with find_references', async () => {
      await provider.findReferences('myFunc', { scope: 'project' });
      expect(mcpCallFn).toHaveBeenCalledWith('code-graph', 'find_references', {
        symbol: 'myFunc',
        scope: 'project',
      });
    });
  });

  describe('findCallers', () => {
    it('calls _callMcpTool with find_callers', async () => {
      await provider.findCallers('handleClick', { depth: 2 });
      expect(mcpCallFn).toHaveBeenCalledWith('code-graph', 'find_callers', {
        symbol: 'handleClick',
        depth: 2,
      });
    });
  });

  describe('findCallees', () => {
    it('calls _callMcpTool with find_callees', async () => {
      await provider.findCallees('processData', {});
      expect(mcpCallFn).toHaveBeenCalledWith('code-graph', 'find_callees', {
        symbol: 'processData',
      });
    });
  });

  describe('analyzeDependencies', () => {
    it('calls _callMcpTool with dependency_analysis and forwards path + options', async () => {
      await provider.analyzeDependencies('/src', { maxDepth: 3 });
      expect(mcpCallFn).toHaveBeenCalledWith('code-graph', 'dependency_analysis', {
        path: '/src',
        maxDepth: 3,
      });
    });
  });

  describe('analyzeComplexity', () => {
    it('calls _callMcpTool with complexity_analysis', async () => {
      await provider.analyzeComplexity('/src/utils.js', { threshold: 10 });
      expect(mcpCallFn).toHaveBeenCalledWith('code-graph', 'complexity_analysis', {
        path: '/src/utils.js',
        threshold: 10,
      });
    });
  });

  describe('analyzeCodebase', () => {
    it('calls _callMcpTool with analyze_codebase', async () => {
      await provider.analyzeCodebase('/project', { includeHidden: false });
      expect(mcpCallFn).toHaveBeenCalledWith('code-graph', 'analyze_codebase', {
        path: '/project',
        includeHidden: false,
      });
    });
  });

  describe('getProjectStats', () => {
    it('calls _callMcpTool with project_statistics and forwards options directly', async () => {
      await provider.getProjectStats({ format: 'json' });
      expect(mcpCallFn).toHaveBeenCalledWith('code-graph', 'project_statistics', {
        format: 'json',
      });
    });

    it('defaults options to empty object', async () => {
      await provider.getProjectStats();
      expect(mcpCallFn).toHaveBeenCalledWith('code-graph', 'project_statistics', {});
    });
  });
});

// ---------------------------------------------------------------------------
// Normalization: _normalizeDefinitionResult
// ---------------------------------------------------------------------------
describe('_normalizeDefinitionResult', () => {
  let provider;

  beforeEach(() => {
    provider = new CodeGraphProvider();
  });

  it('returns null for null input', () => {
    expect(provider._normalizeDefinitionResult(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(provider._normalizeDefinitionResult(undefined)).toBeNull();
  });

  it('normalizes standard fields (file, line, column, context)', () => {
    const result = provider._normalizeDefinitionResult({
      file: '/src/app.js',
      line: 42,
      column: 10,
      context: 'function app() {',
    });
    expect(result).toEqual({
      file: '/src/app.js',
      line: 42,
      column: 10,
      context: 'function app() {',
    });
  });

  it('maps path → file', () => {
    const result = provider._normalizeDefinitionResult({ path: '/src/index.js' });
    expect(result.file).toBe('/src/index.js');
  });

  it('maps row → line', () => {
    const result = provider._normalizeDefinitionResult({ row: 15 });
    expect(result.line).toBe(15);
  });

  it('maps col → column', () => {
    const result = provider._normalizeDefinitionResult({ col: 5 });
    expect(result.column).toBe(5);
  });

  it('maps snippet → context', () => {
    const result = provider._normalizeDefinitionResult({ snippet: 'const x = 1;' });
    expect(result.context).toBe('const x = 1;');
  });

  it('prefers file over path', () => {
    const result = provider._normalizeDefinitionResult({ file: 'a.js', path: 'b.js' });
    expect(result.file).toBe('a.js');
  });

  it('prefers line over row', () => {
    const result = provider._normalizeDefinitionResult({ line: 10, row: 20 });
    expect(result.line).toBe(10);
  });

  it('prefers column over col', () => {
    const result = provider._normalizeDefinitionResult({ column: 3, col: 7 });
    expect(result.column).toBe(3);
  });

  it('prefers context over snippet', () => {
    const result = provider._normalizeDefinitionResult({ context: 'ctx', snippet: 'snip' });
    expect(result.context).toBe('ctx');
  });

  it('returns nulls for missing fields', () => {
    const result = provider._normalizeDefinitionResult({});
    expect(result).toEqual({
      file: null,
      line: null,
      column: null,
      context: null,
    });
  });

  it('handles line=0 correctly (falsy but valid)', () => {
    const result = provider._normalizeDefinitionResult({ line: 0 });
    expect(result.line).toBe(0);
  });

  it('handles column=0 correctly', () => {
    const result = provider._normalizeDefinitionResult({ column: 0 });
    expect(result.column).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Normalization: _normalizeReferencesResult
// ---------------------------------------------------------------------------
describe('_normalizeReferencesResult', () => {
  let provider;

  beforeEach(() => {
    provider = new CodeGraphProvider();
  });

  it('returns null for null input', () => {
    expect(provider._normalizeReferencesResult(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(provider._normalizeReferencesResult(undefined)).toBeNull();
  });

  it('handles array input directly', () => {
    const items = [
      { file: 'a.js', line: 1, context: 'import a' },
      { file: 'b.js', line: 2, context: 'use a' },
    ];
    const result = provider._normalizeReferencesResult(items);
    expect(result).toEqual([
      { file: 'a.js', line: 1, context: 'import a' },
      { file: 'b.js', line: 2, context: 'use a' },
    ]);
  });

  it('extracts from { references: [...] }', () => {
    const result = provider._normalizeReferencesResult({
      references: [{ file: 'x.js', line: 5, context: 'ref' }],
    });
    expect(result).toHaveLength(1);
    expect(result[0].file).toBe('x.js');
  });

  it('extracts from { results: [...] }', () => {
    const result = provider._normalizeReferencesResult({
      results: [{ path: 'y.js', row: 10, snippet: 'code' }],
    });
    expect(result).toEqual([{ file: 'y.js', line: 10, context: 'code' }]);
  });

  it('maps path → file, row → line, snippet → context in each item', () => {
    const result = provider._normalizeReferencesResult([
      { path: 'c.js', row: 3, snippet: 'snippet text' },
    ]);
    expect(result[0]).toEqual({ file: 'c.js', line: 3, context: 'snippet text' });
  });

  it('returns empty array for object without references/results', () => {
    const result = provider._normalizeReferencesResult({});
    expect(result).toEqual([]);
  });

  it('handles items with missing fields', () => {
    const result = provider._normalizeReferencesResult([{}]);
    expect(result[0]).toEqual({ file: null, line: null, context: null });
  });
});

// ---------------------------------------------------------------------------
// Normalization: _normalizeCallersResult
// ---------------------------------------------------------------------------
describe('_normalizeCallersResult', () => {
  let provider;

  beforeEach(() => {
    provider = new CodeGraphProvider();
  });

  it('returns null for null input', () => {
    expect(provider._normalizeCallersResult(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(provider._normalizeCallersResult(undefined)).toBeNull();
  });

  it('handles array input', () => {
    const result = provider._normalizeCallersResult([
      { caller: 'main', file: 'app.js', line: 1 },
    ]);
    expect(result).toEqual([{ caller: 'main', file: 'app.js', line: 1 }]);
  });

  it('extracts from { callers: [...] }', () => {
    const result = provider._normalizeCallersResult({
      callers: [{ caller: 'init', file: 'boot.js', line: 10 }],
    });
    expect(result).toHaveLength(1);
    expect(result[0].caller).toBe('init');
  });

  it('extracts from { results: [...] }', () => {
    const result = provider._normalizeCallersResult({
      results: [{ name: 'setup', path: 'config.js', row: 5 }],
    });
    expect(result[0]).toEqual({ caller: 'setup', file: 'config.js', line: 5 });
  });

  it('maps name → caller, path → file, row → line', () => {
    const result = provider._normalizeCallersResult([
      { name: 'run', path: 'exec.js', row: 20 },
    ]);
    expect(result[0]).toEqual({ caller: 'run', file: 'exec.js', line: 20 });
  });

  it('returns empty array for object without callers/results', () => {
    expect(provider._normalizeCallersResult({})).toEqual([]);
  });

  it('handles items with missing fields', () => {
    const result = provider._normalizeCallersResult([{}]);
    expect(result[0]).toEqual({ caller: null, file: null, line: null });
  });
});

// ---------------------------------------------------------------------------
// Normalization: _normalizeCalleesResult
// ---------------------------------------------------------------------------
describe('_normalizeCalleesResult', () => {
  let provider;

  beforeEach(() => {
    provider = new CodeGraphProvider();
  });

  it('returns null for null input', () => {
    expect(provider._normalizeCalleesResult(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(provider._normalizeCalleesResult(undefined)).toBeNull();
  });

  it('handles array input', () => {
    const result = provider._normalizeCalleesResult([
      { callee: 'doStuff', file: 'helpers.js', line: 30 },
    ]);
    expect(result).toEqual([{ callee: 'doStuff', file: 'helpers.js', line: 30 }]);
  });

  it('extracts from { callees: [...] }', () => {
    const result = provider._normalizeCalleesResult({
      callees: [{ callee: 'parse', file: 'parser.js', line: 7 }],
    });
    expect(result).toHaveLength(1);
    expect(result[0].callee).toBe('parse');
  });

  it('extracts from { results: [...] }', () => {
    const result = provider._normalizeCalleesResult({
      results: [{ name: 'format', path: 'fmt.js', row: 12 }],
    });
    expect(result[0]).toEqual({ callee: 'format', file: 'fmt.js', line: 12 });
  });

  it('maps name → callee, path → file, row → line', () => {
    const result = provider._normalizeCalleesResult([
      { name: 'validate', path: 'val.js', row: 100 },
    ]);
    expect(result[0]).toEqual({ callee: 'validate', file: 'val.js', line: 100 });
  });

  it('returns empty array for object without callees/results', () => {
    expect(provider._normalizeCalleesResult({})).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Normalization: _normalizeDependenciesResult
// ---------------------------------------------------------------------------
describe('_normalizeDependenciesResult', () => {
  let provider;

  beforeEach(() => {
    provider = new CodeGraphProvider();
  });

  it('returns null for null input', () => {
    expect(provider._normalizeDependenciesResult(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(provider._normalizeDependenciesResult(undefined)).toBeNull();
  });

  it('normalizes standard fields (nodes, edges)', () => {
    const result = provider._normalizeDependenciesResult({
      nodes: ['a.js', 'b.js'],
      edges: [{ from: 'a.js', to: 'b.js' }],
    });
    expect(result).toEqual({
      nodes: ['a.js', 'b.js'],
      edges: [{ from: 'a.js', to: 'b.js' }],
    });
  });

  it('maps files → nodes', () => {
    const result = provider._normalizeDependenciesResult({
      files: ['x.js'],
    });
    expect(result.nodes).toEqual(['x.js']);
  });

  it('maps dependencies → edges', () => {
    const result = provider._normalizeDependenciesResult({
      dependencies: [{ src: 'a', dst: 'b' }],
    });
    expect(result.edges).toEqual([{ src: 'a', dst: 'b' }]);
  });

  it('defaults nodes and edges to empty arrays', () => {
    const result = provider._normalizeDependenciesResult({});
    expect(result).toEqual({ nodes: [], edges: [] });
  });
});

// ---------------------------------------------------------------------------
// Normalization: _normalizeComplexityResult
// ---------------------------------------------------------------------------
describe('_normalizeComplexityResult', () => {
  let provider;

  beforeEach(() => {
    provider = new CodeGraphProvider();
  });

  it('returns null for null input', () => {
    expect(provider._normalizeComplexityResult(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(provider._normalizeComplexityResult(undefined)).toBeNull();
  });

  it('normalizes standard fields (score, details)', () => {
    const result = provider._normalizeComplexityResult({
      score: 15,
      details: { cyclomatic: 15, halstead: 30 },
    });
    expect(result).toEqual({
      score: 15,
      details: { cyclomatic: 15, halstead: 30 },
    });
  });

  it('maps complexity → score', () => {
    const result = provider._normalizeComplexityResult({ complexity: 8 });
    expect(result.score).toBe(8);
  });

  it('maps metrics → details', () => {
    const result = provider._normalizeComplexityResult({
      metrics: { loc: 200 },
    });
    expect(result.details).toEqual({ loc: 200 });
  });

  it('defaults score to 0 and details to empty object', () => {
    const result = provider._normalizeComplexityResult({});
    expect(result).toEqual({ score: 0, details: {} });
  });

  it('handles score=0 correctly (falsy but valid)', () => {
    const result = provider._normalizeComplexityResult({ score: 0 });
    expect(result.score).toBe(0);
  });

  it('prefers score over complexity', () => {
    const result = provider._normalizeComplexityResult({ score: 5, complexity: 10 });
    expect(result.score).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// Normalization: _normalizeCodebaseResult
// ---------------------------------------------------------------------------
describe('_normalizeCodebaseResult', () => {
  let provider;

  beforeEach(() => {
    provider = new CodeGraphProvider();
  });

  it('returns null for null input', () => {
    expect(provider._normalizeCodebaseResult(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(provider._normalizeCodebaseResult(undefined)).toBeNull();
  });

  it('normalizes standard fields (files, structure, patterns)', () => {
    const result = provider._normalizeCodebaseResult({
      files: ['a.js', 'b.js'],
      structure: { root: '/src' },
      patterns: ['singleton'],
    });
    expect(result).toEqual({
      files: ['a.js', 'b.js'],
      structure: { root: '/src' },
      patterns: ['singleton'],
    });
  });

  it('defaults files to empty array, structure to empty object, patterns to empty array', () => {
    const result = provider._normalizeCodebaseResult({});
    expect(result).toEqual({ files: [], structure: {}, patterns: [] });
  });
});

// ---------------------------------------------------------------------------
// Normalization: _normalizeStatsResult
// ---------------------------------------------------------------------------
describe('_normalizeStatsResult', () => {
  let provider;

  beforeEach(() => {
    provider = new CodeGraphProvider();
  });

  it('returns null for null input', () => {
    expect(provider._normalizeStatsResult(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(provider._normalizeStatsResult(undefined)).toBeNull();
  });

  it('normalizes standard fields (files, lines, languages)', () => {
    const result = provider._normalizeStatsResult({
      files: 120,
      lines: 8500,
      languages: { javascript: 80, typescript: 40 },
    });
    expect(result).toEqual({
      files: 120,
      lines: 8500,
      languages: { javascript: 80, typescript: 40 },
    });
  });

  it('maps total_files → files', () => {
    const result = provider._normalizeStatsResult({ total_files: 50 });
    expect(result.files).toBe(50);
  });

  it('maps total_lines → lines', () => {
    const result = provider._normalizeStatsResult({ total_lines: 3000 });
    expect(result.lines).toBe(3000);
  });

  it('prefers files over total_files', () => {
    const result = provider._normalizeStatsResult({ files: 10, total_files: 20 });
    expect(result.files).toBe(10);
  });

  it('prefers lines over total_lines', () => {
    const result = provider._normalizeStatsResult({ lines: 100, total_lines: 200 });
    expect(result.lines).toBe(100);
  });

  it('defaults files and lines to 0, languages to empty object', () => {
    const result = provider._normalizeStatsResult({});
    expect(result).toEqual({ files: 0, lines: 0, languages: {} });
  });

  it('handles files=0 correctly (falsy but valid)', () => {
    const result = provider._normalizeStatsResult({ files: 0 });
    expect(result.files).toBe(0);
  });

  it('handles lines=0 correctly', () => {
    const result = provider._normalizeStatsResult({ lines: 0 });
    expect(result.lines).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Integration: full round-trip (capability → normalize)
// ---------------------------------------------------------------------------
describe('full round-trip integration', () => {
  it('findDefinition returns normalized result from MCP response', async () => {
    const mcpCallFn = jest.fn().mockResolvedValue({
      path: '/src/app.js',
      row: 42,
      col: 10,
      snippet: 'function app() {',
    });
    const provider = new CodeGraphProvider({ mcpCallFn });

    const result = await provider.findDefinition('app');
    expect(result).toEqual({
      file: '/src/app.js',
      line: 42,
      column: 10,
      context: 'function app() {',
    });
  });

  it('findReferences returns normalized array from MCP response', async () => {
    const mcpCallFn = jest.fn().mockResolvedValue({
      references: [
        { path: 'a.js', row: 1, snippet: 'import app' },
        { file: 'b.js', line: 5, context: 'app()' },
      ],
    });
    const provider = new CodeGraphProvider({ mcpCallFn });

    const result = await provider.findReferences('app');
    expect(result).toEqual([
      { file: 'a.js', line: 1, context: 'import app' },
      { file: 'b.js', line: 5, context: 'app()' },
    ]);
  });

  it('findCallers returns normalized array from MCP response', async () => {
    const mcpCallFn = jest.fn().mockResolvedValue([
      { name: 'bootstrap', path: 'init.js', row: 8 },
    ]);
    const provider = new CodeGraphProvider({ mcpCallFn });

    const result = await provider.findCallers('start');
    expect(result).toEqual([
      { caller: 'bootstrap', file: 'init.js', line: 8 },
    ]);
  });

  it('findCallees returns normalized array from MCP response', async () => {
    const mcpCallFn = jest.fn().mockResolvedValue({
      callees: [{ callee: 'log', file: 'logger.js', line: 3 }],
    });
    const provider = new CodeGraphProvider({ mcpCallFn });

    const result = await provider.findCallees('process');
    expect(result).toEqual([
      { callee: 'log', file: 'logger.js', line: 3 },
    ]);
  });

  it('analyzeDependencies returns normalized graph from MCP response', async () => {
    const mcpCallFn = jest.fn().mockResolvedValue({
      files: ['a.js', 'b.js'],
      dependencies: [{ from: 'a.js', to: 'b.js' }],
    });
    const provider = new CodeGraphProvider({ mcpCallFn });

    const result = await provider.analyzeDependencies('/src');
    expect(result).toEqual({
      nodes: ['a.js', 'b.js'],
      edges: [{ from: 'a.js', to: 'b.js' }],
    });
  });

  it('analyzeComplexity returns normalized metrics from MCP response', async () => {
    const mcpCallFn = jest.fn().mockResolvedValue({
      complexity: 12,
      metrics: { cyclomatic: 12 },
    });
    const provider = new CodeGraphProvider({ mcpCallFn });

    const result = await provider.analyzeComplexity('/src/utils.js');
    expect(result).toEqual({
      score: 12,
      details: { cyclomatic: 12 },
    });
  });

  it('analyzeCodebase returns normalized codebase from MCP response', async () => {
    const mcpCallFn = jest.fn().mockResolvedValue({
      files: ['index.js'],
      structure: { type: 'module' },
      patterns: ['observer'],
    });
    const provider = new CodeGraphProvider({ mcpCallFn });

    const result = await provider.analyzeCodebase('/project');
    expect(result).toEqual({
      files: ['index.js'],
      structure: { type: 'module' },
      patterns: ['observer'],
    });
  });

  it('getProjectStats returns normalized stats from MCP response', async () => {
    const mcpCallFn = jest.fn().mockResolvedValue({
      total_files: 200,
      total_lines: 15000,
      languages: { javascript: 150, css: 50 },
    });
    const provider = new CodeGraphProvider({ mcpCallFn });

    const result = await provider.getProjectStats();
    expect(result).toEqual({
      files: 200,
      lines: 15000,
      languages: { javascript: 150, css: 50 },
    });
  });

  it('returns null for all capabilities when MCP call returns null', async () => {
    const mcpCallFn = jest.fn().mockResolvedValue(null);
    const provider = new CodeGraphProvider({ mcpCallFn });

    expect(await provider.findDefinition('x')).toBeNull();
    expect(await provider.findReferences('x')).toBeNull();
    expect(await provider.findCallers('x')).toBeNull();
    expect(await provider.findCallees('x')).toBeNull();
    expect(await provider.analyzeDependencies('/src')).toBeNull();
    expect(await provider.analyzeComplexity('/src')).toBeNull();
    expect(await provider.analyzeCodebase('/src')).toBeNull();
    expect(await provider.getProjectStats()).toBeNull();
  });
});
