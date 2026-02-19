/**
 * Manifest Generator Tests
 *
 * Story: 2.13 - Manifest System
 *
 * Tests for the manifest generator module which produces
 * CSV manifest files for agents, workers, and tasks.
 *
 * @author @dev (Dex)
 * @version 1.0.0
 */

const path = require('path');

jest.mock('fs', () => ({
  promises: {
    readdir: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn(),
    mkdir: jest.fn(),
  },
}));

jest.mock('js-yaml', () => ({
  load: jest.fn(),
}));

const fs = require('fs').promises;
const yaml = require('js-yaml');

const {
  ManifestGenerator,
  createManifestGenerator,
  escapeCSV,
  parseYAMLFromMarkdown,
  extractAgentSection,
} = require('../../../.aios-core/core/manifest/manifest-generator');

describe('Manifest Generator (Story 2.13)', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  // ─── escapeCSV ───────────────────────────────────────────────

  describe('escapeCSV', () => {
    it('should return empty string for null', () => {
      expect(escapeCSV(null)).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(escapeCSV(undefined)).toBe('');
    });

    it('should return plain string when no special characters', () => {
      expect(escapeCSV('hello')).toBe('hello');
    });

    it('should wrap value in quotes when it contains a comma', () => {
      expect(escapeCSV('hello, world')).toBe('"hello, world"');
    });

    it('should wrap value in quotes when it contains double quotes and escape them', () => {
      expect(escapeCSV('say "hi"')).toBe('"say ""hi"""');
    });

    it('should wrap value in quotes when it contains a newline', () => {
      expect(escapeCSV('line1\nline2')).toBe('"line1\nline2"');
    });

    it('should handle value with commas, quotes, and newlines together', () => {
      expect(escapeCSV('a "b", c\nd')).toBe('"a ""b"", c\nd"');
    });

    it('should convert numeric values to string', () => {
      expect(escapeCSV(42)).toBe('42');
    });

    it('should convert boolean values to string', () => {
      expect(escapeCSV(true)).toBe('true');
    });

    it('should return empty string as-is', () => {
      expect(escapeCSV('')).toBe('');
    });
  });

  // ─── extractAgentSection ─────────────────────────────────────

  describe('extractAgentSection', () => {
    it('should extract agent fields from YAML content', () => {
      const yamlContent = [
        'agent:',
        '  name: TestAgent',
        '  id: test-agent',
        '  title: Test Title',
        '  icon: 🧪',
        '  whenToUse: For testing',
      ].join('\n') + '\n';

      const result = extractAgentSection(yamlContent);

      expect(result).not.toBeNull();
      expect(result.agent.name).toBe('TestAgent');
      expect(result.agent.id).toBe('test-agent');
      expect(result.agent.title).toBe('Test Title');
      expect(result.agent.icon).toBe('🧪');
      expect(result.agent.whenToUse).toBe('For testing');
    });

    it('should extract persona_profile archetype when present', () => {
      const yamlContent = [
        'agent:',
        '  name: TestAgent',
        '  id: test-agent',
        'persona_profile:',
        '  archetype: Builder',
      ].join('\n') + '\n';

      const result = extractAgentSection(yamlContent);

      expect(result).not.toBeNull();
      expect(result.persona_profile).toEqual({ archetype: 'Builder' });
    });

    it('should return null persona_profile when archetype is missing', () => {
      const yamlContent = [
        'agent:',
        '  name: TestAgent',
        '  id: test-agent',
      ].join('\n') + '\n';

      const result = extractAgentSection(yamlContent);

      expect(result).not.toBeNull();
      expect(result.persona_profile).toBeNull();
    });

    it('should return null when no agent block is found', () => {
      const yamlContent = 'some_other_key: value\n';
      const result = extractAgentSection(yamlContent);
      expect(result).toBeNull();
    });

    it('should return null when agent block has no id or name', () => {
      const yamlContent = [
        'agent:',
        '  title: Only Title',
      ].join('\n') + '\n';

      const result = extractAgentSection(yamlContent);
      expect(result).toBeNull();
    });

    it('should handle partial agent data (only id, no name)', () => {
      const yamlContent = [
        'agent:',
        '  id: partial-agent',
      ].join('\n') + '\n';

      const result = extractAgentSection(yamlContent);

      expect(result).not.toBeNull();
      expect(result.agent.id).toBe('partial-agent');
      expect(result.agent.name).toBeNull();
    });

    it('should handle partial agent data (only name, no id)', () => {
      const yamlContent = [
        'agent:',
        '  name: PartialAgent',
      ].join('\n') + '\n';

      const result = extractAgentSection(yamlContent);

      expect(result).not.toBeNull();
      expect(result.agent.name).toBe('PartialAgent');
      expect(result.agent.id).toBeNull();
    });
  });

  // ─── parseYAMLFromMarkdown ───────────────────────────────────

  describe('parseYAMLFromMarkdown', () => {
    it('should parse YAML from ```yaml code block', () => {
      const content = '# Title\n\n```yaml\nkey: value\n```\n';
      yaml.load.mockReturnValue({ key: 'value' });

      const result = parseYAMLFromMarkdown(content);

      expect(yaml.load).toHaveBeenCalledWith('key: value\n');
      expect(result).toEqual({ key: 'value' });
    });

    it('should parse YAML from --- front matter', () => {
      const content = '---\ntitle: test\n---\n\n# Content\n';
      yaml.load.mockReturnValue({ title: 'test' });

      const result = parseYAMLFromMarkdown(content);

      expect(yaml.load).toHaveBeenCalledWith('title: test');
      expect(result).toEqual({ title: 'test' });
    });

    it('should return null when no YAML is found', () => {
      const content = '# Just a title\n\nSome text.\n';
      const result = parseYAMLFromMarkdown(content);
      expect(result).toBeNull();
    });

    it('should fall back to extractAgentSection when yaml code block parse fails', () => {
      const yamlBlock = 'agent:\n  name: FallbackAgent\n  id: fallback\n';
      const content = '```yaml\n' + yamlBlock + '```\n';
      yaml.load.mockImplementation(() => {
        throw new Error('parse error');
      });

      const result = parseYAMLFromMarkdown(content);

      expect(result).not.toBeNull();
      expect(result.agent.name).toBe('FallbackAgent');
      expect(result.agent.id).toBe('fallback');
    });

    it('should fall back to extractAgentSection when front matter parse fails', () => {
      const yamlContent = 'agent:\n  name: FrontAgent\n  id: front\n';
      const content = '---\n' + yamlContent + '\n---\n';
      yaml.load.mockImplementation(() => {
        throw new Error('parse error');
      });

      const result = parseYAMLFromMarkdown(content);

      expect(result).not.toBeNull();
      expect(result.agent.name).toBe('FrontAgent');
      expect(result.agent.id).toBe('front');
    });

    it('should prefer yaml code block over front matter', () => {
      const content = '---\nfm: data\n---\n\n```yaml\nblock: data\n```\n';
      yaml.load.mockReturnValue({ block: 'data' });

      const result = parseYAMLFromMarkdown(content);

      expect(yaml.load).toHaveBeenCalledWith('block: data\n');
      expect(result).toEqual({ block: 'data' });
    });
  });

  // ─── ManifestGenerator constructor ──────────────────────────

  describe('ManifestGenerator constructor', () => {
    it('should set defaults when no options provided', () => {
      const gen = new ManifestGenerator();

      expect(gen.basePath).toBe(process.cwd());
      expect(gen.aiosCoreDir).toBe(path.join(process.cwd(), '.aios-core'));
      expect(gen.manifestDir).toBe(path.join(process.cwd(), '.aios-core', 'manifests'));
      expect(gen.version).toBe('2.1.0');
    });

    it('should use provided basePath', () => {
      const gen = new ManifestGenerator({ basePath: '/custom/path' });

      expect(gen.basePath).toBe('/custom/path');
      expect(gen.aiosCoreDir).toBe(path.join('/custom/path', '.aios-core'));
      expect(gen.manifestDir).toBe(path.join('/custom/path', '.aios-core', 'manifests'));
    });
  });

  // ─── generateAll ─────────────────────────────────────────────

  describe('generateAll', () => {
    let gen;

    beforeEach(() => {
      gen = new ManifestGenerator({ basePath: '/test' });
      fs.mkdir.mockResolvedValue(undefined);
    });

    it('should create manifest directory and run all generators', async () => {
      fs.readdir.mockResolvedValue([]);
      fs.readFile.mockResolvedValueOnce(JSON.stringify({ workers: [] }));
      fs.writeFile.mockResolvedValue(undefined);

      const results = await gen.generateAll();

      expect(fs.mkdir).toHaveBeenCalledWith(gen.manifestDir, { recursive: true });
      expect(results.agents).toBeDefined();
      expect(results.workers).toBeDefined();
      expect(results.tasks).toBeDefined();
      expect(results.errors).toEqual([]);
      expect(typeof results.duration).toBe('number');
    });

    it('should capture errors when mkdir fails', async () => {
      fs.mkdir.mockRejectedValue(new Error('mkdir failed'));

      const results = await gen.generateAll();

      expect(results.errors).toContain('mkdir failed');
    });
  });

  // ─── generateAgentsManifest ──────────────────────────────────

  describe('generateAgentsManifest', () => {
    let gen;

    beforeEach(() => {
      gen = new ManifestGenerator({ basePath: '/test' });
      fs.writeFile.mockResolvedValue(undefined);
    });

    it('should generate agents CSV from markdown files with YAML', async () => {
      fs.readdir.mockResolvedValue(['agent-one.md', 'agent-two.md', 'readme.txt']);
      fs.readFile
        .mockResolvedValueOnce('```yaml\nagent:\n  id: agent-one\n  name: Agent One\n```\n')
        .mockResolvedValueOnce('```yaml\nagent:\n  id: agent-two\n  name: Agent Two\n```\n');

      yaml.load
        .mockReturnValueOnce({
          agent: { id: 'agent-one', name: 'Agent One', title: 'Builder', icon: '🔨', whenToUse: 'building' },
          persona_profile: { archetype: 'Engineer' },
        })
        .mockReturnValueOnce({
          agent: { id: 'agent-two', name: 'Agent Two', title: 'Tester', icon: '🧪', whenToUse: 'testing' },
        });

      const result = await gen.generateAgentsManifest();

      expect(result.success).toBe(true);
      expect(result.count).toBe(2);
      expect(result.errors).toEqual([]);

      const csvCall = fs.writeFile.mock.calls[0];
      expect(csvCall[0]).toContain('agents.csv');
      expect(csvCall[1]).toContain('id,name,archetype,icon,version,status,file_path,when_to_use');
      expect(csvCall[1]).toContain('agent-one');
      expect(csvCall[1]).toContain('agent-two');
    });

    it('should use file name as id when agent has no id', async () => {
      fs.readdir.mockResolvedValue(['my-agent.md']);
      fs.readFile.mockResolvedValueOnce('```yaml\nagent:\n  name: My Agent\n```\n');
      yaml.load.mockReturnValueOnce({
        agent: { name: 'My Agent' },
      });

      const result = await gen.generateAgentsManifest();

      expect(result.success).toBe(true);
      const csv = fs.writeFile.mock.calls[0][1];
      expect(csv).toContain('my-agent');
    });

    it('should use defaults for missing agent fields', async () => {
      fs.readdir.mockResolvedValue(['minimal.md']);
      fs.readFile.mockResolvedValueOnce('```yaml\nagent:\n  id: minimal\n```\n');
      yaml.load.mockReturnValueOnce({
        agent: { id: 'minimal' },
      });

      const result = await gen.generateAgentsManifest();

      expect(result.success).toBe(true);
      const csv = fs.writeFile.mock.calls[0][1];
      // Default name: 'Unknown', default icon: '🤖', default archetype: 'Agent'
      expect(csv).toContain('Unknown');
    });

    it('should skip files that fail to parse without failing the whole manifest', async () => {
      fs.readdir.mockResolvedValue(['good.md', 'bad.md']);
      fs.readFile
        .mockResolvedValueOnce('```yaml\nagent:\n  id: good\n  name: Good\n```\n')
        .mockRejectedValueOnce(new Error('read error'));

      yaml.load.mockReturnValueOnce({
        agent: { id: 'good', name: 'Good' },
      });

      const result = await gen.generateAgentsManifest();

      expect(result.success).toBe(true);
      expect(result.count).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('bad.md');
    });

    it('should return failure when readdir fails', async () => {
      fs.readdir.mockRejectedValue(new Error('ENOENT'));

      const result = await gen.generateAgentsManifest();

      expect(result.success).toBe(false);
      expect(result.count).toBe(0);
      expect(result.errors).toContain('ENOENT');
    });

    it('should skip markdown files with no parsed agent data', async () => {
      fs.readdir.mockResolvedValue(['no-yaml.md']);
      fs.readFile.mockResolvedValueOnce('# Just markdown\n\nNo YAML here.\n');

      const result = await gen.generateAgentsManifest();

      expect(result.success).toBe(true);
      expect(result.count).toBe(0);
    });

    it('should use persona.archetype for archetype, then agent.title as fallback', async () => {
      fs.readdir.mockResolvedValue(['with-persona.md', 'with-title.md']);
      fs.readFile
        .mockResolvedValueOnce('```yaml\ndata\n```\n')
        .mockResolvedValueOnce('```yaml\ndata\n```\n');

      yaml.load
        .mockReturnValueOnce({
          agent: { id: 'a1', name: 'A1', title: 'ShouldNotUse' },
          persona_profile: { archetype: 'Strategist' },
        })
        .mockReturnValueOnce({
          agent: { id: 'a2', name: 'A2', title: 'Analyst' },
        });

      const result = await gen.generateAgentsManifest();
      const csv = fs.writeFile.mock.calls[0][1];

      expect(csv).toContain('Strategist');
      expect(csv).toContain('Analyst');
      expect(csv).not.toContain('ShouldNotUse');
    });
  });

  // ─── generateWorkersManifest ─────────────────────────────────

  describe('generateWorkersManifest', () => {
    let gen;

    beforeEach(() => {
      gen = new ManifestGenerator({ basePath: '/test' });
      fs.writeFile.mockResolvedValue(undefined);
    });

    it('should generate workers CSV from service registry', async () => {
      const registry = {
        workers: [
          {
            id: 'w1',
            name: 'Worker One',
            category: 'compute',
            subcategory: 'gpu',
            executorTypes: ['docker', 'local'],
            tags: ['fast', 'reliable'],
            path: 'workers/w1.js',
          },
          {
            id: 'w2',
            name: 'Worker Two',
            category: 'storage',
            executorTypes: [],
            tags: [],
            path: 'workers/w2.js',
          },
        ],
      };

      fs.readFile.mockResolvedValue(JSON.stringify(registry));

      const result = await gen.generateWorkersManifest();

      expect(result.success).toBe(true);
      expect(result.count).toBe(2);
      expect(result.errors).toEqual([]);

      const csvCall = fs.writeFile.mock.calls[0];
      expect(csvCall[0]).toContain('workers.csv');
      expect(csvCall[1]).toContain('id,name,category,subcategory,executor_types,tags,file_path,status');
      expect(csvCall[1]).toContain('docker;local');
      expect(csvCall[1]).toContain('fast;reliable');
    });

    it('should handle missing subcategory, executorTypes, and tags', async () => {
      const registry = {
        workers: [
          {
            id: 'w3',
            name: 'Minimal Worker',
            category: 'general',
            path: 'workers/w3.js',
          },
        ],
      };

      fs.readFile.mockResolvedValue(JSON.stringify(registry));

      const result = await gen.generateWorkersManifest();

      expect(result.success).toBe(true);
      expect(result.count).toBe(1);
    });

    it('should return failure when registry file cannot be read', async () => {
      fs.readFile.mockRejectedValue(new Error('ENOENT'));

      const result = await gen.generateWorkersManifest();

      expect(result.success).toBe(false);
      expect(result.count).toBe(0);
      expect(result.errors).toContain('ENOENT');
    });

    it('should return failure when registry has invalid JSON', async () => {
      fs.readFile.mockResolvedValue('not json');

      const result = await gen.generateWorkersManifest();

      expect(result.success).toBe(false);
      expect(result.count).toBe(0);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  // ─── generateTasksManifest ───────────────────────────────────

  describe('generateTasksManifest', () => {
    let gen;

    beforeEach(() => {
      gen = new ManifestGenerator({ basePath: '/test' });
      fs.writeFile.mockResolvedValue(undefined);
    });

    it('should generate tasks CSV from markdown files', async () => {
      fs.readdir.mockResolvedValue(['build-app.md']);
      fs.readFile.mockResolvedValueOnce('```yaml\ntask:\n  name: Build App\n  category: dev\n```\n');
      yaml.load.mockReturnValueOnce({
        task: { name: 'Build App', category: 'dev' },
      });

      const result = await gen.generateTasksManifest();

      expect(result.success).toBe(true);
      expect(result.count).toBe(1);
      const csv = fs.writeFile.mock.calls[0][1];
      expect(csv).toContain('id,name,category,format,has_elicitation,file_path,status');
      expect(csv).toContain('build-app');
      expect(csv).toContain('Build App');
    });

    it('should detect category from filename prefix: db-', async () => {
      fs.readdir.mockResolvedValue(['db-migrate.md']);
      fs.readFile.mockResolvedValueOnce('# DB Migrate\n');

      const result = await gen.generateTasksManifest();
      const csv = fs.writeFile.mock.calls[0][1];

      expect(csv).toContain('database');
    });

    it('should detect category from filename prefix: qa-', async () => {
      fs.readdir.mockResolvedValue(['qa-check.md']);
      fs.readFile.mockResolvedValueOnce('# QA Check\n');

      const result = await gen.generateTasksManifest();
      const csv = fs.writeFile.mock.calls[0][1];

      expect(csv).toContain('quality');
    });

    it('should detect category from filename prefix: dev-', async () => {
      fs.readdir.mockResolvedValue(['dev-setup.md']);
      fs.readFile.mockResolvedValueOnce('# Dev Setup\n');

      const result = await gen.generateTasksManifest();
      const csv = fs.writeFile.mock.calls[0][1];

      expect(csv).toContain('development');
    });

    it('should detect category from filename prefix: po-', async () => {
      fs.readdir.mockResolvedValue(['po-backlog.md']);
      fs.readFile.mockResolvedValueOnce('# PO Backlog\n');

      const result = await gen.generateTasksManifest();
      const csv = fs.writeFile.mock.calls[0][1];

      expect(csv).toContain('product');
    });

    it('should detect category from filename prefix: github-', async () => {
      fs.readdir.mockResolvedValue(['github-deploy.md']);
      fs.readFile.mockResolvedValueOnce('# GitHub Deploy\n');

      const result = await gen.generateTasksManifest();
      const csv = fs.writeFile.mock.calls[0][1];

      expect(csv).toContain('devops');
    });

    it('should generate task name from filename when YAML has no name', async () => {
      fs.readdir.mockResolvedValue(['my-cool-task.md']);
      fs.readFile.mockResolvedValueOnce('# No yaml here\n');

      const result = await gen.generateTasksManifest();
      const csv = fs.writeFile.mock.calls[0][1];

      // my-cool-task -> My Cool Task
      expect(csv).toContain('My Cool Task');
    });

    it('should detect elicitation from task.elicit in YAML', async () => {
      fs.readdir.mockResolvedValue(['elicit-task.md']);
      fs.readFile.mockResolvedValueOnce('```yaml\ntask:\n  name: Elicit\n  elicit: true\n```\n');
      yaml.load.mockReturnValueOnce({
        task: { name: 'Elicit', elicit: true },
      });

      const result = await gen.generateTasksManifest();
      const csv = fs.writeFile.mock.calls[0][1];

      expect(csv).toContain('true');
    });

    it('should detect elicitation from content string "elicit: true"', async () => {
      fs.readdir.mockResolvedValue(['content-elicit.md']);
      fs.readFile.mockResolvedValueOnce('# Task\n\nelicit: true\n');

      const result = await gen.generateTasksManifest();
      const csv = fs.writeFile.mock.calls[0][1];

      expect(csv).toContain('true');
    });

    it('should detect elicitation from content string "elicit=true"', async () => {
      fs.readdir.mockResolvedValue(['content-elicit2.md']);
      fs.readFile.mockResolvedValueOnce('# Task\n\nelicit=true\n');

      const result = await gen.generateTasksManifest();
      const csv = fs.writeFile.mock.calls[0][1];

      expect(csv).toContain('true');
    });

    it('should use top-level parsed fields as fallback (name, category, format)', async () => {
      fs.readdir.mockResolvedValue(['top-level.md']);
      fs.readFile.mockResolvedValueOnce('```yaml\nname: TopName\ncategory: topcat\nformat: TOP-V2\n```\n');
      yaml.load.mockReturnValueOnce({
        name: 'TopName',
        category: 'topcat',
        format: 'TOP-V2',
      });

      const result = await gen.generateTasksManifest();
      const csv = fs.writeFile.mock.calls[0][1];

      // Filename prefix override: top-level doesn't match any prefix, so category stays topcat
      // But wait -- prefix detection runs AFTER yaml extraction and overwrites.
      // Actually looking at the code: prefix detection always runs and overwrites.
      // "top-level" doesn't start with db-, qa-, dev-, po-, github- so category stays 'topcat'
      expect(csv).toContain('TopName');
      expect(csv).toContain('topcat');
      expect(csv).toContain('TOP-V2');
    });

    it('should override YAML category with filename prefix category', async () => {
      fs.readdir.mockResolvedValue(['db-custom.md']);
      fs.readFile.mockResolvedValueOnce('```yaml\ntask:\n  name: Custom\n  category: custom-cat\n```\n');
      yaml.load.mockReturnValueOnce({
        task: { name: 'Custom', category: 'custom-cat' },
      });

      const result = await gen.generateTasksManifest();
      const csv = fs.writeFile.mock.calls[0][1];

      // db- prefix should override custom-cat with 'database'
      expect(csv).toContain('database');
    });

    it('should skip files that fail to parse without failing', async () => {
      fs.readdir.mockResolvedValue(['good.md', 'bad.md']);
      fs.readFile
        .mockResolvedValueOnce('# Good\n')
        .mockRejectedValueOnce(new Error('read error'));

      const result = await gen.generateTasksManifest();

      expect(result.success).toBe(true);
      expect(result.count).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('bad.md');
    });

    it('should return failure when readdir fails', async () => {
      fs.readdir.mockRejectedValue(new Error('ENOENT'));

      const result = await gen.generateTasksManifest();

      expect(result.success).toBe(false);
      expect(result.count).toBe(0);
      expect(result.errors).toContain('ENOENT');
    });

    it('should use elicit from top-level parsed data', async () => {
      fs.readdir.mockResolvedValue(['elicit-top.md']);
      fs.readFile.mockResolvedValueOnce('```yaml\nelicit: true\n```\n');
      yaml.load.mockReturnValueOnce({
        elicit: true,
      });

      const result = await gen.generateTasksManifest();
      const csv = fs.writeFile.mock.calls[0][1];

      expect(csv).toContain('true');
    });

    it('should default to general category and TASK-FORMAT-V1', async () => {
      fs.readdir.mockResolvedValue(['plain.md']);
      fs.readFile.mockResolvedValueOnce('# Plain task\n');

      const result = await gen.generateTasksManifest();
      const csv = fs.writeFile.mock.calls[0][1];

      expect(csv).toContain('general');
      expect(csv).toContain('TASK-FORMAT-V1');
    });
  });

  // ─── createManifestGenerator ─────────────────────────────────

  describe('createManifestGenerator', () => {
    it('should return a ManifestGenerator instance', () => {
      const gen = createManifestGenerator();
      expect(gen).toBeInstanceOf(ManifestGenerator);
    });

    it('should pass options to the constructor', () => {
      const gen = createManifestGenerator({ basePath: '/custom' });
      expect(gen.basePath).toBe('/custom');
    });

    it('should work with empty options', () => {
      const gen = createManifestGenerator({});
      expect(gen.basePath).toBe(process.cwd());
    });
  });
});
