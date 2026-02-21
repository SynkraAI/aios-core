/**
 * Unit tests for subagent-prompt-builder module
 *
 * Tests the SubagentPromptBuilder class that assembles prompts
 * from real agent definitions, task files, checklists, and templates.
 */

jest.mock('fs-extra');
jest.mock('js-yaml');

const fs = require('fs-extra');
const yaml = require('js-yaml');

const SubagentPromptBuilder = require('../../../.aios-core/core/orchestration/subagent-prompt-builder');

describe('SubagentPromptBuilder', () => {
  let builder;

  beforeEach(() => {
    jest.resetAllMocks();
    builder = new SubagentPromptBuilder('/project');
  });

  // ============================================================
  // Constructor
  // ============================================================
  describe('constructor', () => {
    test('sets project root and paths', () => {
      expect(builder.projectRoot).toBe('/project');
      expect(builder.aiosCoreRoot).toBe('/project/.aios-core');
      expect(builder.paths.agents).toContain('development/agents');
      expect(builder.paths.tasks).toContain('development/tasks');
      expect(builder.paths.checklists).toContain('product/checklists');
      expect(builder.paths.templates).toContain('product/templates');
    });
  });

  // ============================================================
  // loadAgentDefinition
  // ============================================================
  describe('loadAgentDefinition', () => {
    test('loads agent definition file', async () => {
      fs.pathExists.mockResolvedValueOnce(true);
      fs.readFile.mockResolvedValueOnce('# Agent: architect\nYou are Aria.');

      const result = await builder.loadAgentDefinition('architect');

      expect(result).toBe('# Agent: architect\nYou are Aria.');
    });

    test('tries alternative naming pattern with underscores', async () => {
      fs.pathExists
        .mockResolvedValueOnce(false)    // architect.md not found
        .mockResolvedValueOnce(true);    // architect.md (no dash to underscore here)
      fs.readFile.mockResolvedValueOnce('# Data Engineer');

      const result = await builder.loadAgentDefinition('data-engineer');

      expect(fs.pathExists).toHaveBeenCalledTimes(2);
      expect(result).toBe('# Data Engineer');
    });

    test('returns minimal definition when not found', async () => {
      fs.pathExists.mockResolvedValue(false);
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = await builder.loadAgentDefinition('unknown-agent');

      expect(result).toContain('# Agent: unknown-agent');
      expect(result).toContain('No definition file found');
      consoleSpy.mockRestore();
    });
  });

  // ============================================================
  // loadTaskDefinition
  // ============================================================
  describe('loadTaskDefinition', () => {
    test('loads task definition by filename', async () => {
      fs.pathExists.mockResolvedValueOnce(true);
      fs.readFile.mockResolvedValueOnce('# Document Project\nSteps...');

      const result = await builder.loadTaskDefinition('document-project.md');

      expect(result).toBe('# Document Project\nSteps...');
    });

    test('appends .md extension if missing', async () => {
      fs.pathExists.mockResolvedValueOnce(true);
      fs.readFile.mockResolvedValueOnce('# Task Content');

      const result = await builder.loadTaskDefinition('document-project');

      expect(result).toBe('# Task Content');
    });

    test('tries alternative path for action names', async () => {
      fs.pathExists
        .mockResolvedValueOnce(false)   // primary path not found
        .mockResolvedValueOnce(true);   // alt path found
      fs.readFile.mockResolvedValueOnce('# Alt Task');

      const result = await builder.loadTaskDefinition('*create-story');

      expect(result).toBe('# Alt Task');
    });

    test('returns minimal definition when not found', async () => {
      fs.pathExists.mockResolvedValue(false);
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = await builder.loadTaskDefinition('missing-task');

      expect(result).toContain('# Task: missing-task');
      consoleSpy.mockRestore();
    });
  });

  // ============================================================
  // extractAndLoadChecklists
  // ============================================================
  describe('extractAndLoadChecklists', () => {
    test('loads override checklist from phase config', async () => {
      fs.pathExists.mockResolvedValueOnce(true);
      fs.readFile.mockResolvedValueOnce('- [ ] Check 1\n- [ ] Check 2');

      const result = await builder.extractAndLoadChecklists('No frontmatter', 'quality-gate');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('quality-gate');
      expect(result[0].content).toContain('Check 1');
    });

    test('loads checklists from task frontmatter', async () => {
      const taskDef = '---\nchecklists:\n  - code-review\n  - testing\n---\n# Task';
      yaml.load.mockReturnValue({ checklists: ['code-review', 'testing'] });
      fs.pathExists.mockResolvedValue(true);
      fs.readFile
        .mockResolvedValueOnce('Code review checklist')
        .mockResolvedValueOnce('Testing checklist');

      const result = await builder.extractAndLoadChecklists(taskDef);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('code-review');
      expect(result[1].name).toBe('testing');
    });

    test('skips duplicate checklist from override', async () => {
      const taskDef = '---\nchecklists:\n  - quality-gate\n  - testing\n---\n# Task';
      yaml.load.mockReturnValue({ checklists: ['quality-gate', 'testing'] });
      fs.pathExists.mockResolvedValue(true);
      fs.readFile
        .mockResolvedValueOnce('Override checklist')
        .mockResolvedValueOnce('Testing checklist');

      const result = await builder.extractAndLoadChecklists(taskDef, 'quality-gate');

      // quality-gate loaded once (override), testing loaded from frontmatter
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('quality-gate');
      expect(result[1].name).toBe('testing');
    });

    test('handles missing frontmatter gracefully', async () => {
      const result = await builder.extractAndLoadChecklists('# No frontmatter here');
      expect(result).toHaveLength(0);
    });

    test('handles invalid YAML in frontmatter', async () => {
      const taskDef = '---\n{invalid yaml\n---\n# Task';
      yaml.load.mockImplementation(() => { throw new Error('parse error'); });

      const result = await builder.extractAndLoadChecklists(taskDef);
      expect(result).toHaveLength(0);
    });
  });

  // ============================================================
  // loadChecklist
  // ============================================================
  describe('loadChecklist', () => {
    test('loads checklist file', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readFile.mockResolvedValue('- [ ] Item 1');

      const result = await builder.loadChecklist('quality-gate');
      expect(result).toBe('- [ ] Item 1');
    });

    test('appends .md extension', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readFile.mockResolvedValue('content');

      await builder.loadChecklist('code-review');
      expect(fs.pathExists).toHaveBeenCalledWith(expect.stringContaining('code-review.md'));
    });

    test('returns null when not found', async () => {
      fs.pathExists.mockResolvedValue(false);

      const result = await builder.loadChecklist('missing');
      expect(result).toBeNull();
    });
  });

  // ============================================================
  // extractAndLoadTemplates
  // ============================================================
  describe('extractAndLoadTemplates', () => {
    test('loads override template from phase config', async () => {
      fs.pathExists.mockResolvedValueOnce(true);
      fs.readFile.mockResolvedValueOnce('template: content');

      const result = await builder.extractAndLoadTemplates('No frontmatter', 'report.yaml');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('report.yaml');
    });

    test('loads templates from task frontmatter', async () => {
      const taskDef = '---\ntemplates:\n  - report\n  - schema\n---\n# Task';
      yaml.load.mockReturnValue({ templates: ['report', 'schema'] });
      fs.pathExists.mockResolvedValue(true);
      fs.readFile
        .mockResolvedValueOnce('report template')
        .mockResolvedValueOnce('schema template');

      const result = await builder.extractAndLoadTemplates(taskDef);

      expect(result).toHaveLength(2);
    });

    test('handles invalid YAML frontmatter', async () => {
      const taskDef = '---\n{bad\n---\n# Task';
      yaml.load.mockImplementation(() => { throw new Error('parse'); });

      const result = await builder.extractAndLoadTemplates(taskDef);
      expect(result).toHaveLength(0);
    });
  });

  // ============================================================
  // loadTemplate
  // ============================================================
  describe('loadTemplate', () => {
    test('tries .yaml, .yml, and .md extensions', async () => {
      fs.pathExists
        .mockResolvedValueOnce(false)   // .yaml not found
        .mockResolvedValueOnce(false)   // .yml not found
        .mockResolvedValueOnce(true);   // .md found
      fs.readFile.mockResolvedValueOnce('# Template');

      const result = await builder.loadTemplate('report');

      expect(result).toBe('# Template');
      expect(fs.pathExists).toHaveBeenCalledTimes(3);
    });

    test('strips existing extension before trying', async () => {
      fs.pathExists.mockResolvedValueOnce(true);
      fs.readFile.mockResolvedValueOnce('content');

      await builder.loadTemplate('report.yaml');

      expect(fs.pathExists).toHaveBeenCalledWith(expect.stringContaining('report.yaml'));
    });

    test('returns null when not found', async () => {
      fs.pathExists.mockResolvedValue(false);

      const result = await builder.loadTemplate('missing');
      expect(result).toBeNull();
    });
  });

  // ============================================================
  // formatContextSection
  // ============================================================
  describe('formatContextSection', () => {
    test('returns empty message when no previous phases', () => {
      expect(builder.formatContextSection({})).toContain('No previous phase outputs');
      expect(builder.formatContextSection({ previousPhases: {} })).toContain('No previous phase outputs');
    });

    test('formats previous phases with details', () => {
      const context = {
        previousPhases: {
          1: { agent: 'architect', action: 'design', result: { output_path: '/out/arch.md', summary: 'Architecture designed' } },
          2: { agent: 'dev', action: 'implement', result: { summary: 'Code implemented' } },
        },
      };

      const result = builder.formatContextSection(context);

      expect(result).toContain('Phase 1: architect');
      expect(result).toContain('Action: design');
      expect(result).toContain('Output: /out/arch.md');
      expect(result).toContain('Summary: Architecture designed');
      expect(result).toContain('Phase 2: dev');
    });

    test('handles phase without output_path', () => {
      const context = {
        previousPhases: {
          1: { agent: 'qa', action: 'test', result: {} },
        },
      };

      const result = builder.formatContextSection(context);
      expect(result).toContain('Phase 1: qa');
      expect(result).not.toContain('Output:');
    });
  });

  // ============================================================
  // assemblePrompt
  // ============================================================
  describe('assemblePrompt', () => {
    test('assembles complete prompt with all components', () => {
      const result = builder.assemblePrompt({
        agentId: 'architect',
        agentDef: '# Aria\nYou are the architect.',
        taskFile: 'design-system.md',
        taskDef: '# Design System\n1. Create architecture',
        checklists: [{ name: 'quality-gate', content: '- [ ] Review design' }],
        templates: [{ name: 'arch-template', content: 'structure: layers' }],
        context: {
          creates: 'docs/architecture.md',
          yoloMode: true,
          executionProfile: 'fast',
          elicit: false,
          executionPolicy: { risk: 'low' },
        },
        contextSection: 'Phase 1 output here',
      });

      expect(result).toContain('AGENT TRANSFORMATION');
      expect(result).toContain('@architect');
      expect(result).toContain('# Aria');
      expect(result).toContain('design-system.md');
      expect(result).toContain('# Design System');
      expect(result).toContain('QUALITY CHECKLISTS');
      expect(result).toContain('quality-gate');
      expect(result).toContain('OUTPUT TEMPLATES');
      expect(result).toContain('arch-template');
      expect(result).toContain('YOLO (autonomous)');
      expect(result).toContain('Phase 1 output here');
      expect(result).toContain('EXECUTION INSTRUCTIONS');
    });

    test('omits checklists section when empty', () => {
      const result = builder.assemblePrompt({
        agentId: 'dev',
        agentDef: 'Agent',
        taskFile: 'task.md',
        taskDef: 'Task',
        checklists: [],
        templates: [],
        context: {},
        contextSection: '',
      });

      expect(result).not.toContain('QUALITY CHECKLISTS');
      expect(result).not.toContain('OUTPUT TEMPLATES');
    });

    test('uses default values for missing context fields', () => {
      const result = builder.assemblePrompt({
        agentId: 'dev',
        agentDef: 'Agent',
        taskFile: 'task.md',
        taskDef: 'Task',
        checklists: [],
        templates: [],
        context: {},
        contextSection: '',
      });

      expect(result).toContain('See task definition');
      expect(result).toContain('Interactive');
      expect(result).toContain('balanced');
    });
  });

  // ============================================================
  // buildPrompt (integration)
  // ============================================================
  describe('buildPrompt', () => {
    test('builds complete prompt from files', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readFile.mockImplementation((path) => {
        if (path.includes('agents')) return Promise.resolve('# Agent Definition');
        if (path.includes('tasks')) return Promise.resolve('# Task Definition');
        return Promise.resolve('content');
      });

      const result = await builder.buildPrompt('architect', 'design.md', {
        creates: 'output.md',
      });

      expect(result).toContain('AGENT TRANSFORMATION');
      expect(result).toContain('# Agent Definition');
      expect(result).toContain('# Task Definition');
    });

    test('builds prompt with checklists from frontmatter', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readFile.mockImplementation((path) => {
        if (path.includes('agents')) return Promise.resolve('# Agent');
        if (path.includes('tasks')) {
          return Promise.resolve('---\nchecklists:\n  - qa\n---\n# Task');
        }
        if (path.includes('checklists')) return Promise.resolve('- [ ] Check');
        return Promise.resolve('');
      });
      yaml.load.mockReturnValue({ checklists: ['qa'] });

      const result = await builder.buildPrompt('qa', 'run-tests.md', {});

      expect(result).toContain('QUALITY CHECKLISTS');
    });
  });
});
