/**
 * Unit tests for panel-renderer
 *
 * Tests PanelRenderer class: box drawing, borders, content lines,
 * ANSI stripping, elapsed time formatting, pipeline rendering,
 * minimal mode, and detailed mode panels.
 */

const { PanelRenderer, BOX, STATUS } = require('../../../.aios-core/core/ui/panel-renderer');

describe('panel-renderer', () => {
  let renderer;

  beforeEach(() => {
    renderer = new PanelRenderer({ width: 60 });
  });

  describe('BOX constants', () => {
    test('defines box drawing characters', () => {
      expect(BOX.topLeft).toBe('┌');
      expect(BOX.topRight).toBe('┐');
      expect(BOX.bottomLeft).toBe('└');
      expect(BOX.bottomRight).toBe('┘');
      expect(BOX.horizontal).toBe('─');
      expect(BOX.vertical).toBe('│');
      expect(BOX.teeRight).toBe('├');
      expect(BOX.teeLeft).toBe('┤');
    });
  });

  describe('STATUS constants', () => {
    test('defines status indicators as strings', () => {
      expect(typeof STATUS.completed).toBe('string');
      expect(typeof STATUS.current).toBe('string');
      expect(typeof STATUS.pending).toBe('string');
      expect(typeof STATUS.error).toBe('string');
      expect(typeof STATUS.bullet).toBe('string');
    });
  });

  describe('constructor', () => {
    test('uses default width of 60', () => {
      const r = new PanelRenderer();
      expect(r.options.width).toBe(60);
    });

    test('accepts custom width', () => {
      const r = new PanelRenderer({ width: 80 });
      expect(r.options.width).toBe(80);
    });
  });

  describe('horizontalLine', () => {
    test('creates line of correct length', () => {
      const line = renderer.horizontalLine(10);
      expect(line).toBe('─'.repeat(8));
    });
  });

  describe('topBorder', () => {
    test('returns string with border characters', () => {
      const border = renderer.stripAnsi(renderer.topBorder(10));
      expect(border).toMatch(/^┌─+┐$/);
    });
  });

  describe('bottomBorder', () => {
    test('returns string with border characters', () => {
      const border = renderer.stripAnsi(renderer.bottomBorder(10));
      expect(border).toMatch(/^└─+┘$/);
    });
  });

  describe('separator', () => {
    test('returns string with tee characters', () => {
      const sep = renderer.stripAnsi(renderer.separator(10));
      expect(sep).toMatch(/^├─+┤$/);
    });
  });

  describe('contentLine', () => {
    test('wraps content with vertical borders', () => {
      const line = renderer.stripAnsi(renderer.contentLine('Hello'));
      expect(line).toMatch(/^│.*Hello.*│$/);
    });
  });

  describe('stripAnsi', () => {
    test('removes ANSI escape codes', () => {
      expect(renderer.stripAnsi('\x1B[32mgreen\x1B[0m')).toBe('green');
    });

    test('returns plain string unchanged', () => {
      expect(renderer.stripAnsi('hello')).toBe('hello');
    });
  });

  describe('formatElapsedTime', () => {
    test('formats seconds', () => {
      const now = Date.now();
      const state = { elapsed: { story_start: now - 30000, session_start: now - 45000 } };
      const elapsed = renderer.formatElapsedTime(state);
      expect(elapsed.story).toMatch(/^\d+s$/);
      expect(elapsed.session).toMatch(/^\d+s$/);
    });

    test('formats minutes and seconds', () => {
      const now = Date.now();
      const state = { elapsed: { story_start: now - 125000 } };
      const elapsed = renderer.formatElapsedTime(state);
      expect(elapsed.story).toMatch(/^\d+m\d+s$/);
    });

    test('formats hours and minutes', () => {
      const now = Date.now();
      const state = { elapsed: { story_start: now - 3700000 } };
      const elapsed = renderer.formatElapsedTime(state);
      expect(elapsed.story).toMatch(/^\d+h\d+m$/);
    });

    test('returns -- when no start time', () => {
      const state = { elapsed: {} };
      const elapsed = renderer.formatElapsedTime(state);
      expect(elapsed.story).toBe('--');
      expect(elapsed.session).toBe('--');
    });
  });

  describe('renderPipeline', () => {
    test('renders pipeline stages', () => {
      const pipeline = {
        stages: ['Plan', 'Dev', 'Test'],
        completed_stages: ['Plan'],
        current_stage: 'Dev',
      };
      const output = renderer.stripAnsi(renderer.renderPipeline(pipeline));
      expect(output).toContain('Plan');
      expect(output).toContain('Dev');
      expect(output).toContain('Test');
    });

    test('renders Story stage with progress', () => {
      const pipeline = {
        stages: ['Story'],
        completed_stages: [],
        current_stage: 'Story',
        story_progress: '3/5',
      };
      const output = renderer.stripAnsi(renderer.renderPipeline(pipeline));
      expect(output).toContain('3/5');
    });
  });

  describe('renderMinimal', () => {
    const mockState = {
      pipeline: {
        stages: ['Plan', 'Dev'],
        completed_stages: ['Plan'],
        current_stage: 'Dev',
      },
      current_agent: { id: 'dev', task: 'coding' },
      active_terminals: { count: 1, list: [{ agent: 'dev' }] },
      elapsed: { story_start: Date.now() - 10000, session_start: Date.now() - 20000 },
      errors: [],
    };

    test('renders minimal panel with all sections', () => {
      const output = renderer.stripAnsi(renderer.renderMinimal(mockState));
      expect(output).toContain('Bob Status');
      expect(output).toContain('Pipeline');
      expect(output).toContain('dev');
      expect(output).toContain('coding');
      expect(output).toContain('Terminals');
      expect(output).toContain('Elapsed');
    });

    test('renders errors when present', () => {
      const stateWithErrors = {
        ...mockState,
        errors: [{ message: 'Something went wrong' }],
      };
      const output = renderer.stripAnsi(renderer.renderMinimal(stateWithErrors));
      expect(output).toContain('Something went wrong');
    });

    test('shows none when no terminals', () => {
      const stateNoTerminals = {
        ...mockState,
        active_terminals: { count: 0, list: [] },
      };
      const output = renderer.stripAnsi(renderer.renderMinimal(stateNoTerminals));
      expect(output).toContain('none');
    });
  });

  describe('renderDetailed', () => {
    const mockState = {
      pipeline: {
        stages: ['Plan', 'Dev'],
        completed_stages: [],
        current_stage: 'Plan',
      },
      current_agent: { id: 'architect', name: 'Aria', task: 'designing', reason: 'Architecture phase' },
      active_terminals: { count: 1, list: [{ agent: 'dev', pid: 1234, task: 'compiling' }] },
      elapsed: { story_start: Date.now() - 60000, session_start: Date.now() - 120000 },
      errors: [],
      tradeoffs: [{ choice: 'DB', selected: 'PostgreSQL', reason: 'ACID compliance' }],
      next_steps: ['Implement service layer', 'Write tests'],
    };

    test('renders detailed panel with all sections', () => {
      const output = renderer.stripAnsi(renderer.renderDetailed(mockState));
      expect(output).toContain('Modo Educativo');
      expect(output).toContain('Pipeline');
      expect(output).toContain('Current Agent');
      expect(output).toContain('architect');
      expect(output).toContain('Active Terminals');
      expect(output).toContain('Elapsed');
    });

    test('renders agent reason when present', () => {
      const output = renderer.stripAnsi(renderer.renderDetailed(mockState));
      expect(output).toContain('Architecture phase');
    });

    test('renders tradeoffs section', () => {
      const output = renderer.stripAnsi(renderer.renderDetailed(mockState));
      expect(output).toContain('Trade-offs');
      expect(output).toContain('PostgreSQL');
    });

    test('renders next steps section', () => {
      const output = renderer.stripAnsi(renderer.renderDetailed(mockState));
      expect(output).toContain('Next Steps');
      expect(output).toContain('Implement service layer');
    });

    test('renders no active terminals message', () => {
      const stateNoTerminals = {
        ...mockState,
        active_terminals: { count: 0, list: [] },
        tradeoffs: [],
        next_steps: [],
      };
      const output = renderer.stripAnsi(renderer.renderDetailed(stateNoTerminals));
      expect(output).toContain('No active terminals');
    });

    test('renders errors in detailed mode', () => {
      const stateWithErrors = {
        ...mockState,
        errors: [{ message: 'Build failed with error code 1' }],
      };
      const output = renderer.stripAnsi(renderer.renderDetailed(stateWithErrors));
      expect(output).toContain('Errors');
      expect(output).toContain('Build failed');
    });
  });
});
