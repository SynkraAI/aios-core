/**
 * Unit tests for elicitation session-manager module
 *
 * Tests the ElicitationSessionManager class that handles saving,
 * loading, and managing elicitation sessions.
 */

jest.mock('fs-extra');
jest.mock('js-yaml');

const fs = require('fs-extra');
const yaml = require('js-yaml');

const ElicitationSessionManager = require('../../../.aios-core/core/elicitation/session-manager');

describe('ElicitationSessionManager', () => {
  let manager;
  const VALID_SESSION_ID = 'a1b2c3d4e5f67890';

  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(console, 'warn').mockImplementation();
    fs.ensureDir.mockResolvedValue();
    fs.writeJson.mockResolvedValue();
    manager = new ElicitationSessionManager('/test/sessions');
  });

  // ============================================================
  // Constructor
  // ============================================================
  describe('constructor', () => {
    test('sets session directory', () => {
      expect(manager.sessionDir).toContain('sessions');
    });

    test('starts with no active session', () => {
      expect(manager.activeSession).toBeNull();
    });
  });

  // ============================================================
  // init
  // ============================================================
  describe('init', () => {
    test('creates session directory', async () => {
      await manager.init();
      expect(fs.ensureDir).toHaveBeenCalledWith(manager.sessionDir);
    });
  });

  // ============================================================
  // createSession
  // ============================================================
  describe('createSession', () => {
    test('creates session with type and returns id', async () => {
      const id = await manager.createSession('agent');

      expect(typeof id).toBe('string');
      expect(id.length).toBe(16);
    });

    test('sets session as active', async () => {
      await manager.createSession('task', { project: 'test' });

      expect(manager.activeSession).toBeDefined();
      expect(manager.activeSession.type).toBe('task');
      expect(manager.activeSession.status).toBe('active');
      expect(manager.activeSession.metadata.project).toBe('test');
    });

    test('initializes session with defaults', async () => {
      await manager.createSession('workflow');

      expect(manager.activeSession.version).toBe('1.0');
      expect(manager.activeSession.currentStep).toBe(0);
      expect(manager.activeSession.totalSteps).toBe(0);
      expect(manager.activeSession.answers).toEqual({});
    });

    test('saves session to disk', async () => {
      await manager.createSession('agent');
      expect(fs.writeJson).toHaveBeenCalled();
    });
  });

  // ============================================================
  // saveSession
  // ============================================================
  describe('saveSession', () => {
    test('throws when no active session and no arg', async () => {
      await expect(manager.saveSession()).rejects.toThrow('No active session');
    });

    test('saves provided session', async () => {
      const session = { id: VALID_SESSION_ID, data: 'test' };
      await manager.saveSession(session);

      expect(fs.writeJson).toHaveBeenCalledWith(
        expect.stringContaining(`${VALID_SESSION_ID}.json`),
        expect.objectContaining({ id: VALID_SESSION_ID }),
        { spaces: 2 }
      );
    });

    test('saves active session when no arg', async () => {
      await manager.createSession('agent');
      fs.writeJson.mockClear();

      await manager.saveSession();

      expect(fs.writeJson).toHaveBeenCalled();
    });

    test('updates timestamp on save', async () => {
      const session = { id: VALID_SESSION_ID, updated: 'old' };
      await manager.saveSession(session);

      expect(session.updated).not.toBe('old');
    });
  });

  // ============================================================
  // loadSession
  // ============================================================
  describe('loadSession', () => {
    test('loads session from file', async () => {
      const sessionData = { id: VALID_SESSION_ID, type: 'agent', status: 'active' };
      fs.pathExists.mockResolvedValue(true);
      fs.readJson.mockResolvedValue(sessionData);

      const session = await manager.loadSession(VALID_SESSION_ID);

      expect(session).toEqual(sessionData);
      expect(manager.activeSession).toEqual(sessionData);
    });

    test('throws when session not found', async () => {
      fs.pathExists.mockResolvedValue(false);

      await expect(manager.loadSession(VALID_SESSION_ID)).rejects.toThrow('not found');
    });
  });

  // ============================================================
  // updateAnswers
  // ============================================================
  describe('updateAnswers', () => {
    test('throws when no active session', async () => {
      await expect(manager.updateAnswers({ q1: 'a1' })).rejects.toThrow('No active session');
    });

    test('merges answers into session', async () => {
      await manager.createSession('task');
      fs.writeJson.mockClear();

      await manager.updateAnswers({ q1: 'a1', q2: 'a2' });

      expect(manager.activeSession.answers.q1).toBe('a1');
      expect(manager.activeSession.answers.q2).toBe('a2');
    });

    test('updates step index when provided', async () => {
      await manager.createSession('task');

      await manager.updateAnswers({ q1: 'a1' }, 3);

      expect(manager.activeSession.currentStep).toBe(3);
    });

    test('does not update step when null', async () => {
      await manager.createSession('task');

      await manager.updateAnswers({ q1: 'a1' });

      expect(manager.activeSession.currentStep).toBe(0);
    });

    test('saves session after update', async () => {
      await manager.createSession('task');
      fs.writeJson.mockClear();

      await manager.updateAnswers({ q1: 'a1' });

      expect(fs.writeJson).toHaveBeenCalled();
    });
  });

  // ============================================================
  // listSessions
  // ============================================================
  describe('listSessions', () => {
    test('lists all json sessions', async () => {
      fs.readdir.mockResolvedValue(['session1.json', 'session2.json', 'readme.txt']);
      fs.readJson.mockResolvedValue({
        id: 'abc',
        type: 'agent',
        created: '2026-01-01T00:00:00Z',
        updated: '2026-01-02T00:00:00Z',
        status: 'active',
        currentStep: 2,
        totalSteps: 5,
      });

      const sessions = await manager.listSessions();

      expect(sessions).toHaveLength(2);
      expect(sessions[0].progress).toBe(40);
    });

    test('filters by type', async () => {
      fs.readdir.mockResolvedValue(['s1.json', 's2.json']);
      fs.readJson
        .mockResolvedValueOnce({ id: '1', type: 'agent', created: '2026-01-01', updated: '2026-01-01', status: 'active', currentStep: 0, totalSteps: 0 })
        .mockResolvedValueOnce({ id: '2', type: 'task', created: '2026-01-01', updated: '2026-01-01', status: 'active', currentStep: 0, totalSteps: 0 });

      const sessions = await manager.listSessions({ type: 'task' });
      expect(sessions).toHaveLength(1);
    });

    test('filters by status', async () => {
      fs.readdir.mockResolvedValue(['s1.json']);
      fs.readJson.mockResolvedValue({ id: '1', type: 'agent', created: '2026-01-01', updated: '2026-01-01', status: 'completed', currentStep: 0, totalSteps: 0 });

      const sessions = await manager.listSessions({ status: 'active' });
      expect(sessions).toHaveLength(0);
    });

    test('skips invalid session files', async () => {
      fs.readdir.mockResolvedValue(['bad.json']);
      fs.readJson.mockRejectedValue(new Error('invalid json'));

      const sessions = await manager.listSessions();
      expect(sessions).toHaveLength(0);
      expect(console.warn).toHaveBeenCalled();
    });

    test('sorts by updated date newest first', async () => {
      fs.readdir.mockResolvedValue(['s1.json', 's2.json']);
      fs.readJson
        .mockResolvedValueOnce({ id: '1', type: 'a', created: '2026-01-01', updated: '2026-01-01', status: 'active', currentStep: 0, totalSteps: 0 })
        .mockResolvedValueOnce({ id: '2', type: 'a', created: '2026-01-01', updated: '2026-01-05', status: 'active', currentStep: 0, totalSteps: 0 });

      const sessions = await manager.listSessions();
      expect(sessions[0].id).toBe('2');
    });

    test('progress is 0 when totalSteps is 0', async () => {
      fs.readdir.mockResolvedValue(['s1.json']);
      fs.readJson.mockResolvedValue({ id: '1', type: 'a', created: '2026-01-01', updated: '2026-01-01', status: 'active', currentStep: 0, totalSteps: 0 });

      const sessions = await manager.listSessions();
      expect(sessions[0].progress).toBe(0);
    });
  });

  // ============================================================
  // resumeSession
  // ============================================================
  describe('resumeSession', () => {
    test('loads session and adds resume info', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readJson.mockResolvedValue({
        id: VALID_SESSION_ID,
        type: 'task',
        currentStep: 3,
        totalSteps: 10,
        answers: { q1: 'a', q2: 'b', q3: 'c' },
      });

      const info = await manager.resumeSession(VALID_SESSION_ID);

      expect(info.resumeFrom).toBe(3);
      expect(info.completedSteps).toBe(3);
      expect(info.remainingSteps).toBe(7);
      expect(info.percentComplete).toBe(30);
    });

    test('handles zero totalSteps', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readJson.mockResolvedValue({
        id: VALID_SESSION_ID,
        type: 'task',
        currentStep: 0,
        totalSteps: 0,
        answers: {},
      });

      const info = await manager.resumeSession(VALID_SESSION_ID);
      expect(info.percentComplete).toBe(0);
    });
  });

  // ============================================================
  // completeSession
  // ============================================================
  describe('completeSession', () => {
    test('throws when no active session', async () => {
      await expect(manager.completeSession()).rejects.toThrow('No active session');
    });

    test('marks session as completed', async () => {
      await manager.createSession('task');

      await manager.completeSession('success');

      expect(manager.activeSession).toBeNull();
    });

    test('moves to completed dir on success', async () => {
      await manager.createSession('task');
      fs.move.mockResolvedValue();

      await manager.completeSession('success');

      expect(fs.ensureDir).toHaveBeenCalledWith(expect.stringContaining('completed'));
      expect(fs.move).toHaveBeenCalled();
    });

    test('does not move file on non-success', async () => {
      await manager.createSession('task');
      fs.move.mockResolvedValue();

      await manager.completeSession('cancelled');

      expect(fs.move).not.toHaveBeenCalled();
    });
  });

  // ============================================================
  // deleteSession
  // ============================================================
  describe('deleteSession', () => {
    test('deletes from active directory', async () => {
      fs.pathExists.mockResolvedValueOnce(true);
      fs.remove.mockResolvedValue();

      await manager.deleteSession(VALID_SESSION_ID);

      expect(fs.remove).toHaveBeenCalled();
    });

    test('deletes from completed directory', async () => {
      fs.pathExists.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
      fs.remove.mockResolvedValue();

      await manager.deleteSession(VALID_SESSION_ID);

      expect(fs.remove).toHaveBeenCalled();
    });

    test('throws when session not found in either directory', async () => {
      fs.pathExists.mockResolvedValue(false);

      await expect(manager.deleteSession(VALID_SESSION_ID)).rejects.toThrow('not found');
    });

    test('clears active session if it matches', async () => {
      await manager.createSession('task');
      const id = manager.activeSession.id;
      fs.pathExists.mockResolvedValueOnce(true);
      fs.remove.mockResolvedValue();

      await manager.deleteSession(id);

      expect(manager.activeSession).toBeNull();
    });
  });

  // ============================================================
  // exportSession
  // ============================================================
  describe('exportSession', () => {
    beforeEach(() => {
      fs.pathExists.mockResolvedValue(true);
      fs.readJson.mockResolvedValue({ id: VALID_SESSION_ID, type: 'agent' });
    });

    test('exports as JSON', async () => {
      const result = await manager.exportSession(VALID_SESSION_ID, 'json');
      const parsed = JSON.parse(result);
      expect(parsed.type).toBe('agent');
    });

    test('exports as YAML', async () => {
      yaml.dump.mockReturnValue('id: abc\ntype: agent\n');

      const result = await manager.exportSession(VALID_SESSION_ID, 'yaml');
      expect(result).toContain('agent');
      expect(yaml.dump).toHaveBeenCalled();
    });

    test('defaults to JSON', async () => {
      const result = await manager.exportSession(VALID_SESSION_ID);
      expect(() => JSON.parse(result)).not.toThrow();
    });

    test('throws on unsupported format', async () => {
      await expect(manager.exportSession(VALID_SESSION_ID, 'xml')).rejects.toThrow('Unsupported export format');
    });
  });

  // ============================================================
  // isValidSessionId / getSessionPath
  // ============================================================
  describe('session ID validation', () => {
    test('valid 16-char hex id passes', () => {
      expect(manager.isValidSessionId('a1b2c3d4e5f67890')).toBe(true);
    });

    test('invalid ids fail', () => {
      expect(manager.isValidSessionId('')).toBe(false);
      expect(manager.isValidSessionId(null)).toBe(false);
      expect(manager.isValidSessionId('short')).toBe(false);
      expect(manager.isValidSessionId('../../../etc/passwd')).toBe(false);
    });

    test('getSessionPath throws on invalid id', () => {
      expect(() => manager.getSessionPath('../hack')).toThrow('Invalid sessionId');
    });

    test('getSessionPath returns valid path', () => {
      const sessionPath = manager.getSessionPath(VALID_SESSION_ID);
      expect(sessionPath).toContain(`${VALID_SESSION_ID}.json`);
    });
  });

  // ============================================================
  // getActiveSession / clearActiveSession
  // ============================================================
  describe('active session management', () => {
    test('getActiveSession returns null initially', () => {
      expect(manager.getActiveSession()).toBeNull();
    });

    test('getActiveSession returns session after create', async () => {
      await manager.createSession('task');
      expect(manager.getActiveSession()).toBeDefined();
    });

    test('clearActiveSession sets null', async () => {
      await manager.createSession('task');
      manager.clearActiveSession();
      expect(manager.getActiveSession()).toBeNull();
    });
  });
});
