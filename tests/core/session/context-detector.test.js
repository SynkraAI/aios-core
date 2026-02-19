/**
 * Unit tests for context-detector
 *
 * Tests ContextDetector: hybrid session type detection (conversation vs file),
 * command extraction, workflow pattern matching, session state updates,
 * and expired session cleanup.
 */

jest.mock('fs');

const fs = require('fs');
const ContextDetector = require('../../../.aios-core/core/session/context-detector');

describe('context-detector', () => {
  let detector;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(console, 'warn').mockImplementation();
    detector = new ContextDetector();
  });

  afterEach(() => {
    console.warn.mockRestore();
  });

  describe('detectSessionType', () => {
    test('returns type from conversation when history provided', () => {
      const history = [{ content: 'hello world' }];
      expect(detector.detectSessionType(history)).toBe('existing');
    });

    test('falls back to file when history is empty', () => {
      fs.existsSync.mockReturnValue(false);
      expect(detector.detectSessionType([])).toBe('new');
    });

    test('falls back to file when history is null', () => {
      fs.existsSync.mockReturnValue(false);
      expect(detector.detectSessionType(null)).toBe('new');
    });

    test('falls back to file when history is undefined', () => {
      fs.existsSync.mockReturnValue(false);
      expect(detector.detectSessionType(undefined)).toBe('new');
    });
  });

  describe('_detectFromConversation', () => {
    test('returns new for empty history', () => {
      expect(detector._detectFromConversation([])).toBe('new');
    });

    test('returns existing for non-workflow messages', () => {
      const history = [{ content: '*help' }, { content: '*info' }];
      expect(detector._detectFromConversation(history)).toBe('existing');
    });

    test('returns workflow when workflow pattern detected', () => {
      const history = [
        { content: '*validate-story-draft' },
        { content: '*develop' },
        { content: '*review-qa' },
      ];
      expect(detector._detectFromConversation(history)).toBe('workflow');
    });
  });

  describe('_extractCommands', () => {
    test('extracts commands from messages', () => {
      const history = [
        { content: '*help' },
        { content: '*create-story then *validate-story-draft' },
      ];
      const commands = detector._extractCommands(history);
      expect(commands).toContain('help');
      expect(commands).toContain('create-story');
      expect(commands).toContain('validate-story-draft');
    });

    test('uses text field as fallback', () => {
      const history = [{ text: '*deploy' }];
      const commands = detector._extractCommands(history);
      expect(commands).toContain('deploy');
    });

    test('returns empty array for messages without commands', () => {
      const history = [{ content: 'no commands here' }];
      expect(detector._extractCommands(history)).toEqual([]);
    });

    test('limits to last 10 messages', () => {
      const history = Array.from({ length: 20 }, (_, i) => ({ content: `*cmd-${i}` }));
      const commands = detector._extractCommands(history);
      // Should only process last 10 messages
      expect(commands).not.toContain('cmd-0');
      expect(commands).toContain('cmd-19');
    });
  });

  describe('_detectWorkflowPattern', () => {
    test('returns false for fewer than 2 commands', () => {
      expect(detector._detectWorkflowPattern(['help'])).toBe(false);
    });

    test('detects story development workflow', () => {
      expect(detector._detectWorkflowPattern([
        'validate-story-draft', 'develop',
      ])).toBe(true);
    });

    test('detects epic creation workflow', () => {
      expect(detector._detectWorkflowPattern([
        'create-epic', 'create-story',
      ])).toBe(true);
    });

    test('detects backlog management workflow', () => {
      expect(detector._detectWorkflowPattern([
        'backlog-review', 'backlog-prioritize',
      ])).toBe(true);
    });

    test('returns false for non-matching commands', () => {
      expect(detector._detectWorkflowPattern(['help', 'info'])).toBe(false);
    });
  });

  describe('_matchesPattern', () => {
    test('returns true when at least 2 commands match pattern', () => {
      expect(detector._matchesPattern(
        ['a', 'b', 'c'],
        ['a', 'b', 'd'],
      )).toBe(true);
    });

    test('returns false when fewer than 2 match', () => {
      expect(detector._matchesPattern(
        ['a', 'x', 'y'],
        ['a', 'b', 'c'],
      )).toBe(false);
    });
  });

  describe('_detectFromFile', () => {
    test('returns new when file does not exist', () => {
      fs.existsSync.mockReturnValue(false);
      expect(detector._detectFromFile('/tmp/session.json')).toBe('new');
    });

    test('returns new when session expired', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({
        lastActivity: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
        lastCommands: ['help'],
      }));
      expect(detector._detectFromFile('/tmp/session.json')).toBe('new');
    });

    test('returns workflow when workflowActive with commands', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({
        lastActivity: Date.now(),
        workflowActive: true,
        lastCommands: ['develop'],
      }));
      expect(detector._detectFromFile('/tmp/session.json')).toBe('workflow');
    });

    test('returns existing when has commands but no workflow', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({
        lastActivity: Date.now(),
        lastCommands: ['help'],
      }));
      expect(detector._detectFromFile('/tmp/session.json')).toBe('existing');
    });

    test('returns new when no commands in session', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({
        lastActivity: Date.now(),
        lastCommands: [],
      }));
      expect(detector._detectFromFile('/tmp/session.json')).toBe('new');
    });

    test('returns new on file read error', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation(() => { throw new Error('read error'); });
      expect(detector._detectFromFile('/tmp/session.json')).toBe('new');
    });
  });

  describe('updateSessionState', () => {
    test('writes session state to file', () => {
      fs.existsSync.mockReturnValue(true);
      fs.writeFileSync.mockImplementation(() => {});
      detector.updateSessionState({ sessionId: 'test-123', lastCommands: ['help'] }, '/tmp/session.json');
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        '/tmp/session.json',
        expect.stringContaining('test-123'),
        'utf8',
      );
    });

    test('creates directory if not exists', () => {
      fs.existsSync.mockReturnValue(false);
      fs.mkdirSync.mockImplementation(() => {});
      fs.writeFileSync.mockImplementation(() => {});
      detector.updateSessionState({}, '/tmp/new-dir/session.json');
      expect(fs.mkdirSync).toHaveBeenCalledWith(expect.any(String), { recursive: true });
    });

    test('handles write errors gracefully', () => {
      fs.existsSync.mockReturnValue(true);
      fs.writeFileSync.mockImplementation(() => { throw new Error('write error'); });
      expect(() => detector.updateSessionState({}, '/tmp/session.json')).not.toThrow();
    });

    test('generates sessionId when not provided', () => {
      fs.existsSync.mockReturnValue(true);
      fs.writeFileSync.mockImplementation(() => {});
      detector.updateSessionState({}, '/tmp/session.json');
      const written = fs.writeFileSync.mock.calls[0][1];
      expect(JSON.parse(written).sessionId).toMatch(/^session-/);
    });
  });

  describe('clearExpiredSession', () => {
    test('does nothing when file does not exist', () => {
      fs.existsSync.mockReturnValue(false);
      detector.clearExpiredSession('/tmp/session.json');
      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });

    test('deletes expired session file', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({
        lastActivity: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
      }));
      fs.unlinkSync.mockImplementation(() => {});
      detector.clearExpiredSession('/tmp/session.json');
      expect(fs.unlinkSync).toHaveBeenCalledWith('/tmp/session.json');
    });

    test('keeps non-expired session file', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({
        lastActivity: Date.now(),
      }));
      detector.clearExpiredSession('/tmp/session.json');
      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });

    test('handles errors gracefully', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation(() => { throw new Error('read error'); });
      expect(() => detector.clearExpiredSession('/tmp/session.json')).not.toThrow();
    });
  });

  describe('_generateSessionId', () => {
    test('generates session ID with prefix', () => {
      const id = detector._generateSessionId();
      expect(id).toMatch(/^session-\d+-[a-z0-9]+$/);
    });

    test('generates unique IDs', () => {
      const id1 = detector._generateSessionId();
      const id2 = detector._generateSessionId();
      expect(id1).not.toBe(id2);
    });
  });
});
