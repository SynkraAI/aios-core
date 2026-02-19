/**
 * SessionContextLoader - Test Suite
 *
 * Tests: constructor, loadContext, loadSessionState, getPreviousAgent,
 * generateContextMessage, updateSession, clearSession, formatForGreeting,
 * onTaskComplete, _inferWorkflowState, getWorkflowState, getTaskHistory
 */

const path = require('path');

// ── Mocks ─────────────────────────────────────────────────────────────

jest.mock('fs', () => ({
  existsSync: jest.fn(() => false),
  readFileSync: jest.fn(() => '{}'),
  unlinkSync: jest.fn(),
}));

const mockDetector = {
  detectSessionType: jest.fn(() => 'new'),
  updateSessionState: jest.fn(),
};

jest.mock('../../../.aios-core/core/session/context-detector', () => {
  return jest.fn().mockImplementation(() => mockDetector);
});

const fs = require('fs');
const SessionContextLoader = require('../../../.aios-core/core/session/context-loader');

// ── Helpers ───────────────────────────────────────────────────────────

function buildSessionState(overrides = {}) {
  return {
    sessionId: 'session-123',
    startTime: Date.now() - 300000,
    lastActivity: Date.now() - 60000,
    agentSequence: [],
    lastCommands: [],
    taskHistory: [],
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────

describe('SessionContextLoader', () => {
  let loader;

  beforeEach(() => {
    jest.clearAllMocks();
    loader = new SessionContextLoader();
  });

  // ── Constructor ───────────────────────────────────────────────────

  describe('Constructor', () => {
    test('creates a ContextDetector instance', () => {
      const ContextDetector = require('../../../.aios-core/core/session/context-detector');
      expect(ContextDetector).toHaveBeenCalled();
      expect(loader.detector).toBe(mockDetector);
    });

    test('sets sessionStatePath using process.cwd()', () => {
      const expected = path.join(process.cwd(), '.aios', 'session-state.json');
      expect(loader.sessionStatePath).toBe(expected);
    });
  });

  // ── loadContext ───────────────────────────────────────────────────

  describe('loadContext', () => {
    test('returns new session context when detector returns "new"', () => {
      mockDetector.detectSessionType.mockReturnValue('new');

      const ctx = loader.loadContext('dev');

      expect(ctx).toEqual({
        sessionType: 'new',
        message: null,
        previousAgent: null,
        lastCommands: [],
        workflowActive: null,
      });
    });

    test('passes sessionStatePath to detector', () => {
      mockDetector.detectSessionType.mockReturnValue('new');
      loader.loadContext('dev');

      expect(mockDetector.detectSessionType).toHaveBeenCalledWith(
        [],
        loader.sessionStatePath,
      );
    });

    test('returns full context for existing session', () => {
      mockDetector.detectSessionType.mockReturnValue('existing');
      const state = buildSessionState({
        agentSequence: [
          { agentId: 'po', agentName: 'Pax', activatedAt: Date.now() - 120000, lastCommand: '*create-story' },
        ],
        lastCommands: ['*create-story', '*help'],
        workflowActive: 'story_development',
        currentStory: 'docs/stories/active/STORY-1.md',
        sessionId: 'session-abc',
        startTime: 1000,
      });
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(state));

      const ctx = loader.loadContext('dev');

      expect(ctx.sessionType).toBe('existing');
      expect(ctx.previousAgent).toEqual(expect.objectContaining({ agentId: 'po' }));
      expect(ctx.lastCommands).toEqual(['*create-story', '*help']);
      expect(ctx.workflowActive).toBe('story_development');
      expect(ctx.currentStory).toBe('docs/stories/active/STORY-1.md');
      expect(ctx.sessionId).toBe('session-abc');
      expect(ctx.sessionStartTime).toBe(1000);
      expect(ctx.message).toEqual(expect.any(String));
    });

    test('returns null previousAgent when only same agent in sequence', () => {
      mockDetector.detectSessionType.mockReturnValue('existing');
      const state = buildSessionState({
        agentSequence: [
          { agentId: 'dev', agentName: 'Dex', activatedAt: Date.now(), lastCommand: '*help' },
        ],
      });
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(state));

      const ctx = loader.loadContext('dev');

      expect(ctx.previousAgent).toBeNull();
    });

    test('returns null workflowActive when session has none', () => {
      mockDetector.detectSessionType.mockReturnValue('existing');
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(buildSessionState()));

      const ctx = loader.loadContext('dev');

      expect(ctx.workflowActive).toBeNull();
    });
  });

  // ── loadSessionState ──────────────────────────────────────────────

  describe('loadSessionState', () => {
    test('returns empty object when file does not exist', () => {
      fs.existsSync.mockReturnValue(false);

      expect(loader.loadSessionState()).toEqual({});
    });

    test('returns parsed JSON when file exists', () => {
      const state = buildSessionState();
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(state));

      expect(loader.loadSessionState()).toEqual(state);
    });

    test('returns empty object on JSON parse error', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('not-valid-json{{{');

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const result = loader.loadSessionState();

      expect(result).toEqual({});
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[SessionContext]'),
        expect.any(String),
      );
      warnSpy.mockRestore();
    });

    test('returns empty object when readFileSync throws', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation(() => { throw new Error('EACCES'); });

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      expect(loader.loadSessionState()).toEqual({});
      warnSpy.mockRestore();
    });
  });

  // ── getPreviousAgent ──────────────────────────────────────────────

  describe('getPreviousAgent', () => {
    test('returns null when agentSequence is empty', () => {
      expect(loader.getPreviousAgent({}, 'dev')).toBeNull();
    });

    test('returns null when agentSequence is missing', () => {
      expect(loader.getPreviousAgent({ agentSequence: [] }, 'dev')).toBeNull();
    });

    test('returns null when all entries match currentAgentId', () => {
      const state = {
        agentSequence: [
          { agentId: 'dev', agentName: 'Dex', activatedAt: 1000, lastCommand: '*help' },
          { agentId: 'dev', agentName: 'Dex', activatedAt: 2000, lastCommand: '*build' },
        ],
      };
      expect(loader.getPreviousAgent(state, 'dev')).toBeNull();
    });

    test('returns last different agent from sequence', () => {
      const state = {
        agentSequence: [
          { agentId: 'po', agentName: 'Pax', activatedAt: 1000, lastCommand: '*create-story' },
          { agentId: 'qa', agentName: 'Quinn', activatedAt: 2000, lastCommand: '*review-qa' },
          { agentId: 'dev', agentName: 'Dex', activatedAt: 3000, lastCommand: '*help' },
        ],
      };

      const result = loader.getPreviousAgent(state, 'dev');

      expect(result).toEqual({
        agentId: 'qa',
        agentName: 'Quinn',
        activatedAt: 2000,
        lastCommand: '*review-qa',
      });
    });

    test('skips trailing entries with same agentId', () => {
      const state = {
        agentSequence: [
          { agentId: 'po', agentName: 'Pax', activatedAt: 1000, lastCommand: '*approve' },
          { agentId: 'dev', agentName: 'Dex', activatedAt: 2000, lastCommand: null },
          { agentId: 'dev', agentName: 'Dex', activatedAt: 3000, lastCommand: '*help' },
        ],
      };

      const result = loader.getPreviousAgent(state, 'dev');

      expect(result).toEqual({
        agentId: 'po',
        agentName: 'Pax',
        activatedAt: 1000,
        lastCommand: '*approve',
      });
    });
  });

  // ── generateContextMessage ────────────────────────────────────────

  describe('generateContextMessage', () => {
    test('returns null for new session type', () => {
      expect(loader.generateContextMessage({ sessionType: 'new' })).toBeNull();
    });

    test('returns null when no context parts exist', () => {
      const result = loader.generateContextMessage({
        sessionType: 'existing',
        previousAgent: null,
        lastCommands: [],
        workflowActive: null,
      });
      expect(result).toBeNull();
    });

    test('includes previous agent info with "just now" for <1 minute', () => {
      const result = loader.generateContextMessage({
        sessionType: 'existing',
        previousAgent: {
          agentId: 'po',
          agentName: 'Pax',
          activatedAt: Date.now() - 30000, // 30 seconds ago
          lastCommand: null,
        },
        lastCommands: [],
        workflowActive: null,
      });

      expect(result).toContain('@po');
      expect(result).toContain('Pax');
      expect(result).toContain('just now');
    });

    test('includes "1 minute ago" for exactly 1 minute', () => {
      const result = loader.generateContextMessage({
        sessionType: 'existing',
        previousAgent: {
          agentId: 'qa',
          agentName: 'Quinn',
          activatedAt: Date.now() - 60000,
          lastCommand: null,
        },
        lastCommands: [],
        workflowActive: null,
      });

      expect(result).toContain('1 minute ago');
    });

    test('includes "N minutes ago" for multiple minutes', () => {
      const result = loader.generateContextMessage({
        sessionType: 'existing',
        previousAgent: {
          agentId: 'architect',
          agentName: 'Aria',
          activatedAt: Date.now() - 300000, // 5 minutes ago
          lastCommand: null,
        },
        lastCommands: [],
        workflowActive: null,
      });

      expect(result).toContain('5 minutes ago');
    });

    test('includes last command from previous agent', () => {
      const result = loader.generateContextMessage({
        sessionType: 'existing',
        previousAgent: {
          agentId: 'po',
          agentName: 'Pax',
          activatedAt: Date.now() - 5000,
          lastCommand: '*create-story',
        },
        lastCommands: [],
        workflowActive: null,
      });

      expect(result).toContain('*create-story');
      expect(result).toContain('Last action');
    });

    test('uses agentId as fallback when agentName is missing', () => {
      const result = loader.generateContextMessage({
        sessionType: 'existing',
        previousAgent: {
          agentId: 'custom-agent',
          agentName: null,
          activatedAt: Date.now() - 5000,
          lastCommand: null,
        },
        lastCommands: [],
        workflowActive: null,
      });

      expect(result).toContain('custom-agent');
    });

    test('includes recent commands (last 5)', () => {
      const result = loader.generateContextMessage({
        sessionType: 'existing',
        previousAgent: null,
        lastCommands: ['cmd1', 'cmd2', 'cmd3', 'cmd4', 'cmd5', 'cmd6'],
        workflowActive: null,
      });

      // Should show last 5: cmd2..cmd6
      expect(result).toContain('cmd2');
      expect(result).toContain('cmd6');
    });

    test('includes active workflow', () => {
      const result = loader.generateContextMessage({
        sessionType: 'existing',
        previousAgent: null,
        lastCommands: [],
        workflowActive: 'story_development',
      });

      expect(result).toContain('story_development');
      expect(result).toContain('Active Workflow');
    });

    test('combines all context parts with newlines', () => {
      const result = loader.generateContextMessage({
        sessionType: 'existing',
        previousAgent: {
          agentId: 'po',
          agentName: 'Pax',
          activatedAt: Date.now() - 120000,
          lastCommand: '*approve',
        },
        lastCommands: ['*create-story'],
        workflowActive: 'epic_creation',
      });

      expect(result).toContain('@po');
      expect(result).toContain('*approve');
      expect(result).toContain('*create-story');
      expect(result).toContain('epic_creation');
      expect(result.split('\n').length).toBeGreaterThanOrEqual(3);
    });
  });

  // ── updateSession ─────────────────────────────────────────────────

  describe('updateSession', () => {
    test('initializes new session with sessionId and startTime', () => {
      fs.existsSync.mockReturnValue(false);

      loader.updateSession('dev', 'Dex', '*help');

      expect(mockDetector.updateSessionState).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: expect.stringMatching(/^session-\d+-\w+$/),
          startTime: expect.any(Number),
        }),
        loader.sessionStatePath,
      );
    });

    test('preserves existing sessionId', () => {
      const state = buildSessionState({ sessionId: 'session-existing' });
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(state));

      loader.updateSession('dev', 'Dex');

      expect(mockDetector.updateSessionState).toHaveBeenCalledWith(
        expect.objectContaining({ sessionId: 'session-existing' }),
        loader.sessionStatePath,
      );
    });

    test('pushes agent to agentSequence', () => {
      fs.existsSync.mockReturnValue(false);

      loader.updateSession('dev', 'Dex', '*build');

      const savedState = mockDetector.updateSessionState.mock.calls[0][0];
      expect(savedState.agentSequence).toHaveLength(1);
      expect(savedState.agentSequence[0]).toEqual(expect.objectContaining({
        agentId: 'dev',
        agentName: 'Dex',
        lastCommand: '*build',
        activatedAt: expect.any(Number),
      }));
    });

    test('trims agentSequence to last 20 entries', () => {
      const longSequence = Array.from({ length: 25 }, (_, i) => ({
        agentId: `agent-${i}`,
        agentName: `Agent ${i}`,
        activatedAt: i * 1000,
        lastCommand: null,
      }));
      const state = buildSessionState({ agentSequence: longSequence });
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(state));

      loader.updateSession('dev', 'Dex');

      const savedState = mockDetector.updateSessionState.mock.calls[0][0];
      // 25 existing + 1 new = 26, trimmed to last 20
      expect(savedState.agentSequence.length).toBeLessThanOrEqual(20);
    });

    test('adds lastCommand to command history', () => {
      fs.existsSync.mockReturnValue(false);

      loader.updateSession('dev', 'Dex', '*build');

      const savedState = mockDetector.updateSessionState.mock.calls[0][0];
      expect(savedState.lastCommands).toContain('*build');
    });

    test('does not add null lastCommand to history', () => {
      fs.existsSync.mockReturnValue(false);

      loader.updateSession('dev', 'Dex', null);

      const savedState = mockDetector.updateSessionState.mock.calls[0][0];
      expect(savedState.lastCommands).toBeUndefined();
    });

    test('trims lastCommands to MAX_COMMANDS_HISTORY (10)', () => {
      const state = buildSessionState({
        lastCommands: Array.from({ length: 12 }, (_, i) => `cmd-${i}`),
      });
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(state));

      loader.updateSession('dev', 'Dex', '*new-cmd');

      const savedState = mockDetector.updateSessionState.mock.calls[0][0];
      expect(savedState.lastCommands.length).toBeLessThanOrEqual(10);
      expect(savedState.lastCommands[savedState.lastCommands.length - 1]).toBe('*new-cmd');
    });

    test('sets workflowActive from options', () => {
      fs.existsSync.mockReturnValue(false);

      loader.updateSession('dev', 'Dex', null, { workflowActive: 'story_development' });

      const savedState = mockDetector.updateSessionState.mock.calls[0][0];
      expect(savedState.workflowActive).toBe('story_development');
    });

    test('does not change workflowActive when not in options', () => {
      const state = buildSessionState({ workflowActive: 'epic_creation' });
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(state));

      loader.updateSession('dev', 'Dex');

      const savedState = mockDetector.updateSessionState.mock.calls[0][0];
      expect(savedState.workflowActive).toBe('epic_creation');
    });

    test('updates lastActivity timestamp', () => {
      const beforeTime = Date.now();
      fs.existsSync.mockReturnValue(false);

      loader.updateSession('dev', 'Dex');

      const savedState = mockDetector.updateSessionState.mock.calls[0][0];
      expect(savedState.lastActivity).toBeGreaterThanOrEqual(beforeTime);
    });

    test('handles errors gracefully', () => {
      fs.existsSync.mockImplementation(() => { throw new Error('EPERM'); });
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      expect(() => loader.updateSession('dev', 'Dex')).not.toThrow();
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[SessionContext]'),
        expect.any(String),
      );
      warnSpy.mockRestore();
    });

    test('defaults lastCommand to null and options to empty object', () => {
      fs.existsSync.mockReturnValue(false);

      loader.updateSession('dev', 'Dex');

      const savedState = mockDetector.updateSessionState.mock.calls[0][0];
      expect(savedState.agentSequence[0].lastCommand).toBeNull();
    });
  });

  // ── clearSession ──────────────────────────────────────────────────

  describe('clearSession', () => {
    test('deletes session file when it exists', () => {
      fs.existsSync.mockReturnValue(true);

      loader.clearSession();

      expect(fs.unlinkSync).toHaveBeenCalledWith(loader.sessionStatePath);
    });

    test('does nothing when file does not exist', () => {
      fs.existsSync.mockReturnValue(false);

      loader.clearSession();

      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });

    test('handles errors gracefully', () => {
      fs.existsSync.mockReturnValue(true);
      fs.unlinkSync.mockImplementation(() => { throw new Error('EBUSY'); });

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      expect(() => loader.clearSession()).not.toThrow();
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[SessionContext]'),
        expect.any(String),
      );
      warnSpy.mockRestore();
    });
  });

  // ── formatForGreeting ─────────────────────────────────────────────

  describe('formatForGreeting', () => {
    test('returns empty string when no context message', () => {
      mockDetector.detectSessionType.mockReturnValue('new');

      expect(loader.formatForGreeting('dev')).toBe('');
    });

    test('wraps message with newlines when context exists', () => {
      mockDetector.detectSessionType.mockReturnValue('existing');
      const state = buildSessionState({
        agentSequence: [
          { agentId: 'po', agentName: 'Pax', activatedAt: Date.now() - 5000, lastCommand: '*approve' },
        ],
      });
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(state));

      const result = loader.formatForGreeting('dev');

      expect(result).toMatch(/^\n.+\n$/s);
      expect(result).toContain('@po');
    });
  });

  // ── onTaskComplete ────────────────────────────────────────────────

  describe('onTaskComplete', () => {
    test('initializes new session if none exists', () => {
      fs.existsSync.mockReturnValue(false);

      const result = loader.onTaskComplete('develop', { success: true, agentId: 'dev' });

      expect(result.success).toBe(true);
      expect(result.sessionId).toMatch(/^session-\d+-\w+$/);
      const savedState = mockDetector.updateSessionState.mock.calls[0][0];
      expect(savedState.sessionId).toBeDefined();
      expect(savedState.startTime).toBeDefined();
    });

    test('adds task to command history with asterisk prefix', () => {
      fs.existsSync.mockReturnValue(false);

      loader.onTaskComplete('develop', {});

      const savedState = mockDetector.updateSessionState.mock.calls[0][0];
      expect(savedState.lastCommands).toContain('*develop');
    });

    test('does not double-prefix tasks already starting with asterisk', () => {
      fs.existsSync.mockReturnValue(false);

      loader.onTaskComplete('*develop', {});

      const savedState = mockDetector.updateSessionState.mock.calls[0][0];
      expect(savedState.lastCommands).toContain('*develop');
      expect(savedState.lastCommands).not.toContain('**develop');
    });

    test('trims lastCommands to MAX_COMMANDS_HISTORY (10)', () => {
      const state = buildSessionState({
        lastCommands: Array.from({ length: 11 }, (_, i) => `*cmd-${i}`),
      });
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(state));

      loader.onTaskComplete('new-task', {});

      const savedState = mockDetector.updateSessionState.mock.calls[0][0];
      expect(savedState.lastCommands.length).toBeLessThanOrEqual(10);
    });

    test('records task in taskHistory', () => {
      fs.existsSync.mockReturnValue(false);

      loader.onTaskComplete('review-qa', {
        success: true,
        agentId: 'qa',
        storyPath: 'docs/stories/active/STORY-1.md',
      });

      const savedState = mockDetector.updateSessionState.mock.calls[0][0];
      expect(savedState.taskHistory).toHaveLength(1);
      expect(savedState.taskHistory[0]).toEqual(expect.objectContaining({
        task: 'review-qa',
        success: true,
        agentId: 'qa',
        storyPath: 'docs/stories/active/STORY-1.md',
        completedAt: expect.any(Number),
      }));
    });

    test('defaults success to true when not explicitly false', () => {
      fs.existsSync.mockReturnValue(false);

      loader.onTaskComplete('develop', {});

      const savedState = mockDetector.updateSessionState.mock.calls[0][0];
      expect(savedState.taskHistory[0].success).toBe(true);
    });

    test('records success: false when result.success is false', () => {
      fs.existsSync.mockReturnValue(false);

      loader.onTaskComplete('develop', { success: false });

      const savedState = mockDetector.updateSessionState.mock.calls[0][0];
      expect(savedState.taskHistory[0].success).toBe(false);
    });

    test('defaults agentId and storyPath to null', () => {
      fs.existsSync.mockReturnValue(false);

      loader.onTaskComplete('develop', {});

      const savedState = mockDetector.updateSessionState.mock.calls[0][0];
      expect(savedState.taskHistory[0].agentId).toBeNull();
      expect(savedState.taskHistory[0].storyPath).toBeNull();
    });

    test('trims taskHistory to last 20 entries', () => {
      const state = buildSessionState({
        taskHistory: Array.from({ length: 22 }, (_, i) => ({
          task: `task-${i}`,
          completedAt: i * 1000,
          success: true,
          agentId: null,
          storyPath: null,
        })),
      });
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(state));

      loader.onTaskComplete('new-task', {});

      const savedState = mockDetector.updateSessionState.mock.calls[0][0];
      expect(savedState.taskHistory.length).toBeLessThanOrEqual(20);
    });

    test('updates currentStory when storyPath is provided', () => {
      fs.existsSync.mockReturnValue(false);

      loader.onTaskComplete('develop', { storyPath: 'docs/stories/active/WIS-3.md' });

      const savedState = mockDetector.updateSessionState.mock.calls[0][0];
      expect(savedState.currentStory).toBe('docs/stories/active/WIS-3.md');
    });

    test('does not update currentStory when storyPath is absent', () => {
      const state = buildSessionState({ currentStory: 'existing-story.md' });
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(state));

      loader.onTaskComplete('develop', {});

      const savedState = mockDetector.updateSessionState.mock.calls[0][0];
      expect(savedState.currentStory).toBe('existing-story.md');
    });

    test('infers workflow state for known tasks', () => {
      fs.existsSync.mockReturnValue(false);

      const result = loader.onTaskComplete('develop', {});

      const savedState = mockDetector.updateSessionState.mock.calls[0][0];
      expect(savedState.workflowActive).toBe('story_development');
      expect(savedState.workflowState).toBe('in_development');
      expect(result.workflowState).toBe('in_development');
    });

    test('does not set workflow for unknown tasks', () => {
      fs.existsSync.mockReturnValue(false);

      loader.onTaskComplete('unknown-custom-task', {});

      const savedState = mockDetector.updateSessionState.mock.calls[0][0];
      expect(savedState.workflowActive).toBeUndefined();
      expect(savedState.workflowState).toBeUndefined();
    });

    test('handles default empty result parameter', () => {
      fs.existsSync.mockReturnValue(false);

      const result = loader.onTaskComplete('develop');

      expect(result.success).toBe(true);
    });

    test('handles errors gracefully and returns failure object', () => {
      fs.existsSync.mockReturnValue(false);
      mockDetector.updateSessionState.mockImplementation(() => { throw new Error('DISK_FULL'); });
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const result = loader.onTaskComplete('develop', {});

      expect(result.success).toBe(false);
      expect(result.error).toBe('DISK_FULL');
      warnSpy.mockRestore();
    });

    test('calls detector.updateSessionState with correct path', () => {
      fs.existsSync.mockReturnValue(false);

      loader.onTaskComplete('develop', {});

      expect(mockDetector.updateSessionState).toHaveBeenCalledWith(
        expect.any(Object),
        loader.sessionStatePath,
      );
    });
  });

  // ── _inferWorkflowState ───────────────────────────────────────────

  describe('_inferWorkflowState', () => {
    const taskMappings = [
      ['validate-story-draft', 'story_development', 'validated'],
      ['validate-next-story', 'story_development', 'validated'],
      ['develop', 'story_development', 'in_development'],
      ['develop-yolo', 'story_development', 'in_development'],
      ['develop-interactive', 'story_development', 'in_development'],
      ['review-qa', 'story_development', 'qa_reviewed'],
      ['apply-qa-fixes', 'story_development', 'qa_reviewed'],
      ['pre-push-quality-gate', 'git_workflow', 'staged'],
      ['create-epic', 'epic_creation', 'epic_drafted'],
      ['create-story', 'epic_creation', 'stories_created'],
      ['create-next-story', 'epic_creation', 'stories_created'],
      ['backlog-review', 'backlog_management', 'reviewed'],
      ['backlog-prioritize', 'backlog_management', 'prioritized'],
      ['analyze-impact', 'architecture_review', 'analyzed'],
      ['create-doc', 'documentation_workflow', 'drafted'],
      ['db-domain-modeling', 'database_workflow', 'designed'],
      ['db-apply-migration', 'database_workflow', 'migrated'],
    ];

    test.each(taskMappings)(
      'maps "%s" to workflow "%s" with state "%s"',
      (taskName, workflow, state) => {
        const result = loader._inferWorkflowState(taskName, {});
        expect(result).toEqual({ workflow, state });
      },
    );

    test('handles case-insensitive task names', () => {
      const result = loader._inferWorkflowState('DEVELOP', {});
      expect(result).toEqual({ workflow: 'story_development', state: 'in_development' });
    });

    test('strips leading asterisk from task name', () => {
      const result = loader._inferWorkflowState('*develop', {});
      expect(result).toEqual({ workflow: 'story_development', state: 'in_development' });
    });

    test('strips asterisk and handles uppercase', () => {
      const result = loader._inferWorkflowState('*Review-QA', {});
      expect(result).toEqual({ workflow: 'story_development', state: 'qa_reviewed' });
    });

    test('returns null for unknown task names', () => {
      expect(loader._inferWorkflowState('unknown-task', {})).toBeNull();
      expect(loader._inferWorkflowState('random', {})).toBeNull();
      expect(loader._inferWorkflowState('', {})).toBeNull();
    });
  });

  // ── getWorkflowState ──────────────────────────────────────────────

  describe('getWorkflowState', () => {
    test('returns null when no workflow is active', () => {
      fs.existsSync.mockReturnValue(false);

      expect(loader.getWorkflowState()).toBeNull();
    });

    test('returns workflow state when active', () => {
      const state = buildSessionState({
        workflowActive: 'story_development',
        workflowState: 'in_development',
        lastActivity: 5000,
      });
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(state));

      const result = loader.getWorkflowState();

      expect(result).toEqual({
        workflow: 'story_development',
        state: 'in_development',
        lastActivity: 5000,
      });
    });

    test('returns null workflowState when only workflow is set', () => {
      const state = buildSessionState({ workflowActive: 'epic_creation' });
      delete state.workflowState;
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(state));

      const result = loader.getWorkflowState();

      expect(result.workflow).toBe('epic_creation');
      expect(result.state).toBeNull();
    });

    test('handles errors gracefully and returns null', () => {
      fs.existsSync.mockImplementation(() => { throw new Error('ENOENT'); });

      expect(loader.getWorkflowState()).toBeNull();
    });
  });

  // ── getTaskHistory ────────────────────────────────────────────────

  describe('getTaskHistory', () => {
    test('returns empty array when no history exists', () => {
      fs.existsSync.mockReturnValue(false);

      expect(loader.getTaskHistory()).toEqual([]);
    });

    test('returns last N entries based on limit', () => {
      const history = Array.from({ length: 15 }, (_, i) => ({
        task: `task-${i}`,
        completedAt: i * 1000,
        success: true,
      }));
      const state = buildSessionState({ taskHistory: history });
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(state));

      const result = loader.getTaskHistory(5);

      expect(result).toHaveLength(5);
      expect(result[0].task).toBe('task-10');
      expect(result[4].task).toBe('task-14');
    });

    test('defaults to limit of 10', () => {
      const history = Array.from({ length: 15 }, (_, i) => ({
        task: `task-${i}`,
        completedAt: i * 1000,
        success: true,
      }));
      const state = buildSessionState({ taskHistory: history });
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(state));

      const result = loader.getTaskHistory();

      expect(result).toHaveLength(10);
    });

    test('returns all entries when fewer than limit', () => {
      const history = [
        { task: 'develop', completedAt: 1000, success: true },
        { task: 'review-qa', completedAt: 2000, success: true },
      ];
      const state = buildSessionState({ taskHistory: history });
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(state));

      const result = loader.getTaskHistory(10);

      expect(result).toHaveLength(2);
    });

    test('handles errors gracefully and returns empty array', () => {
      fs.existsSync.mockImplementation(() => { throw new Error('fail'); });

      expect(loader.getTaskHistory()).toEqual([]);
    });
  });
});
