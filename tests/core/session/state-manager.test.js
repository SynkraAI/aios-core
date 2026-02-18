/**
 * SessionStateManager Unit Tests
 *
 * Tests for session state management including:
 * - CRUD operations
 * - Concurrent write handling
 * - Cache behavior
 * - Event emission
 * - Garbage collection (PID-based cleanup)
 * - Performance benchmarks
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Create isolated test environment
const TEST_DIR = path.join(os.tmpdir(), `aios-session-test-${Date.now()}`);
const AIOS_DIR = path.join(TEST_DIR, '.aios');
const SESSION_PATH = path.join(AIOS_DIR, 'session.json');
const HISTORY_DIR = path.join(AIOS_DIR, 'sessions', 'history');

// Setup test environment before each test
beforeEach(() => {
  // Create test directory structure
  fs.mkdirSync(AIOS_DIR, { recursive: true });
  fs.mkdirSync(HISTORY_DIR, { recursive: true });

  // Mock process.cwd to return test directory
  jest.spyOn(process, 'cwd').mockReturnValue(TEST_DIR);

  // Clear module cache to get fresh instance
  jest.resetModules();
});

// Cleanup after each test
afterEach(() => {
  // Restore process.cwd
  process.cwd.mockRestore();

  // Remove test directory
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
});

describe('SessionStateManager', () => {
  describe('Initialization', () => {
    it('should create session file on init if not exists', async () => {
      const stateManager = require('../../../.aios-core/core/session/state-manager');

      await stateManager.init();

      expect(fs.existsSync(SESSION_PATH)).toBe(true);

      const data = JSON.parse(fs.readFileSync(SESSION_PATH, 'utf8'));
      expect(data.version).toBe('1.0.0');
      expect(data.pid).toBe(process.pid);
      expect(data.sessionId).toBeTruthy();
      expect(data.metadata.startedAt).toBeTruthy();
    });

    it('should not overwrite existing session on init', async () => {
      const stateManager = require('../../../.aios-core/core/session/state-manager');

      // Create existing session
      const existingSession = {
        version: '1.0.0',
        sessionId: 'existing-session',
        pid: process.pid,
        project: { type: 'test', name: 'Test Project', emoji: '🔥' },
        status: { phase: 'testing', progress: '1/5', currentTask: 'test', emoji: '🧪' },
        metadata: { startedAt: '2026-01-01T00:00:00.000Z', lastUpdatedAt: '2026-01-01T00:00:00.000Z', activeAgent: 'dev', story: 'STORY-1' }
      };
      fs.writeFileSync(SESSION_PATH, JSON.stringify(existingSession));

      await stateManager.init();

      const data = JSON.parse(fs.readFileSync(SESSION_PATH, 'utf8'));
      expect(data.sessionId).toBe('existing-session');
      expect(data.project.name).toBe('Test Project');
    });

    it('should fail fast if not AIOS project', async () => {
      // Remove .aios directory
      fs.rmSync(AIOS_DIR, { recursive: true, force: true });

      const stateManager = require('../../../.aios-core/core/session/state-manager');

      // Should not throw, just return silently
      await expect(stateManager.init()).resolves.toBeUndefined();

      // Should not create .aios directory
      expect(fs.existsSync(AIOS_DIR)).toBe(false);
    });
  });

  describe('CRUD Operations', () => {
    it('should read session from file', async () => {
      const stateManager = require('../../../.aios-core/core/session/state-manager');
      await stateManager.init();

      const session = await stateManager.read();

      expect(session).toHaveProperty('version');
      expect(session).toHaveProperty('sessionId');
      expect(session).toHaveProperty('project');
      expect(session).toHaveProperty('status');
      expect(session).toHaveProperty('metadata');
    });

    it('should update session with partial data', async () => {
      const stateManager = require('../../../.aios-core/core/session/state-manager');
      await stateManager.init();

      const updates = {
        project: { name: 'Updated Project', emoji: '⚡' },
        status: { phase: 'development' }
      };

      const updated = await stateManager.update(updates);

      expect(updated.project.name).toBe('Updated Project');
      expect(updated.project.emoji).toBe('⚡');
      expect(updated.status.phase).toBe('development');
      expect(updated.metadata.lastUpdatedAt).toBeTruthy();

      // Verify file was updated
      const data = JSON.parse(fs.readFileSync(SESSION_PATH, 'utf8'));
      expect(data.project.name).toBe('Updated Project');
    });

    it('should clear session and archive old one', async () => {
      const stateManager = require('../../../.aios-core/core/session/state-manager');
      await stateManager.init();

      // Update session first
      await stateManager.update({
        project: { name: 'To Be Cleared' }
      });

      const cleared = await stateManager.clear();

      expect(cleared.project.name).toBe('');
      expect(cleared.sessionId).toBeTruthy();

      // Verify file was cleared
      const data = JSON.parse(fs.readFileSync(SESSION_PATH, 'utf8'));
      expect(data.project.name).toBe('');
    });
  });

  describe('Caching', () => {
    it('should return cached value within TTL (<5ms)', async () => {
      const stateManager = require('../../../.aios-core/core/session/state-manager');
      await stateManager.init();

      // First read (uncached)
      await stateManager.read();

      // Second read (cached) - benchmark
      const start = Date.now();
      await stateManager.read();
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(5);
    });

    it('should invalidate cache after update', async () => {
      const stateManager = require('../../../.aios-core/core/session/state-manager');
      await stateManager.init();

      await stateManager.read(); // Prime cache

      await stateManager.update({
        project: { name: 'Cache Test' }
      });

      const session = await stateManager.read();
      expect(session.project.name).toBe('Cache Test');
    });

    it('should refresh cache after TTL expires', async () => {
      const stateManager = require('../../../.aios-core/core/session/state-manager');
      await stateManager.init();

      await stateManager.read(); // Prime cache

      // Wait for cache to expire (5s + buffer)
      await new Promise(resolve => setTimeout(resolve, 5100));

      // Modify file directly (bypass cache)
      const data = JSON.parse(fs.readFileSync(SESSION_PATH, 'utf8'));
      data.project.name = 'Modified Directly';
      fs.writeFileSync(SESSION_PATH, JSON.stringify(data));

      // Read should fetch from file
      const session = await stateManager.read();
      expect(session.project.name).toBe('Modified Directly');
    }, 10000); // Increase timeout for this test
  });

  describe('Event Emission', () => {
    it('should emit session:updated event on update', async () => {
      const stateManager = require('../../../.aios-core/core/session/state-manager');
      await stateManager.init();

      const listener = jest.fn();
      stateManager.on('session:updated', listener);

      await stateManager.update({ project: { name: 'Event Test' } });

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          project: expect.objectContaining({ name: 'Event Test' })
        })
      );
    });

    it('should emit session:cleared event on clear', async () => {
      const stateManager = require('../../../.aios-core/core/session/state-manager');
      await stateManager.init();

      const listener = jest.fn();
      stateManager.on('session:cleared', listener);

      await stateManager.clear();

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should emit session:archived event on archive', async () => {
      const stateManager = require('../../../.aios-core/core/session/state-manager');
      await stateManager.init();

      // Update session first to make it archive-worthy
      await stateManager.update({ project: { name: 'Archive Event Test' } });

      const listener = jest.fn();
      stateManager.on('session:archived', listener);

      await stateManager.archive();

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          session: expect.any(Object),
          archivePath: expect.stringContaining(HISTORY_DIR)
        })
      );
    });

    it('should emit session:gc event on garbage collection', async () => {
      const stateManager = require('../../../.aios-core/core/session/state-manager');
      await stateManager.init();

      const listener = jest.fn();
      stateManager.on('session:gc', listener);

      await stateManager.gc();

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          staleSessionsRemoved: expect.any(Number),
          archivedSessionsRemoved: expect.any(Number)
        })
      );
    });
  });

  describe('Archival', () => {
    it('should archive session to history directory', async () => {
      const stateManager = require('../../../.aios-core/core/session/state-manager');
      await stateManager.init();

      await stateManager.update({ project: { name: 'Archive Test' } });
      await stateManager.archive();

      const files = fs.readdirSync(HISTORY_DIR);
      expect(files.length).toBeGreaterThan(0);

      const archivePath = path.join(HISTORY_DIR, files[0]);
      const archived = JSON.parse(fs.readFileSync(archivePath, 'utf8'));
      expect(archived.project.name).toBe('Archive Test');
    });

    it('should not archive default session', async () => {
      const stateManager = require('../../../.aios-core/core/session/state-manager');
      await stateManager.init();

      // Immediately archive without updates
      await stateManager.archive();

      const files = fs.readdirSync(HISTORY_DIR);
      expect(files.length).toBe(0);
    });
  });

  describe('Garbage Collection', () => {
    it('should detect stale sessions with dead PID', async () => {
      const stateManager = require('../../../.aios-core/core/session/state-manager');
      await stateManager.init();

      // Create session with fake dead PID (write directly to file to bypass update() override)
      const deadPid = 999999;
      const session = await stateManager.read();
      session.pid = deadPid;
      await fs.promises.writeFile(
        path.join(TEST_DIR, '.aios', 'session.json'),
        JSON.stringify(session, null, 2)
      );

      // Mock process.kill to throw for dead PID
      const originalKill = process.kill;
      process.kill = jest.fn((pid, signal) => {
        if (pid === deadPid) {
          const error = new Error('ESRCH');
          error.code = 'ESRCH';
          throw error;
        }
        return originalKill(pid, signal);
      });

      // Clear cache to force read from file
      stateManager.cache = null;
      stateManager.cacheTimestamp = null;

      const results = await stateManager.gc();

      expect(results.staleSessionsRemoved).toBe(1);

      // Restore process.kill
      process.kill = originalKill;
    });

    it('should remove old archived sessions (>30 days)', async () => {
      const stateManager = require('../../../.aios-core/core/session/state-manager');
      await stateManager.init();

      // Create old archive (simulate 31 days old)
      const oldArchivePath = path.join(HISTORY_DIR, 'session-old.json');
      fs.writeFileSync(oldArchivePath, JSON.stringify({ test: 'old' }));

      // Set file mtime to 31 days ago
      const oldDate = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
      fs.utimesSync(oldArchivePath, oldDate, oldDate);

      const results = await stateManager.gc(30);

      expect(results.archivedSessionsRemoved).toBe(1);
      expect(fs.existsSync(oldArchivePath)).toBe(false);
    });

    it('should keep recent archived sessions', async () => {
      const stateManager = require('../../../.aios-core/core/session/state-manager');
      await stateManager.init();

      // Create recent archive
      const recentArchivePath = path.join(HISTORY_DIR, 'session-recent.json');
      fs.writeFileSync(recentArchivePath, JSON.stringify({ test: 'recent' }));

      const results = await stateManager.gc(30);

      expect(results.archivedSessionsRemoved).toBe(0);
      expect(fs.existsSync(recentArchivePath)).toBe(true);
    });
  });

  describe('Concurrent Write Handling', () => {
    it('should handle concurrent updates without corruption', async () => {
      const stateManager = require('../../../.aios-core/core/session/state-manager');
      await stateManager.init();

      // Perform 10 concurrent updates
      const updates = Array.from({ length: 10 }, (_, i) => ({
        project: { name: `Concurrent ${i}` }
      }));

      await Promise.all(updates.map(update => stateManager.update(update)));

      // Verify file is valid JSON
      const data = JSON.parse(fs.readFileSync(SESSION_PATH, 'utf8'));
      expect(data).toHaveProperty('version');
      expect(data).toHaveProperty('sessionId');
    });

    it('should use atomic writes (temp file + rename)', async () => {
      const stateManager = require('../../../.aios-core/core/session/state-manager');
      await stateManager.init();

      // Spy on fs operations
      const renameSpy = jest.spyOn(fs.promises, 'rename');

      await stateManager.update({ project: { name: 'Atomic Test' } });

      expect(renameSpy).toHaveBeenCalled();

      renameSpy.mockRestore();
    });
  });

  describe('Performance Benchmarks', () => {
    it('should read from file in <20ms (uncached)', async () => {
      const stateManager = require('../../../.aios-core/core/session/state-manager');
      await stateManager.init();

      // Clear cache
      stateManager.cache = null;
      stateManager.cacheTimestamp = null;

      const start = Date.now();
      await stateManager.read();
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(20);
    });

    it('should read from cache in <5ms', async () => {
      const stateManager = require('../../../.aios-core/core/session/state-manager');
      await stateManager.init();

      // Prime cache
      await stateManager.read();

      const start = Date.now();
      await stateManager.read();
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(5);
    });

    it('should have zero overhead in non-AIOS project', () => {
      // Remove .aios directory
      fs.rmSync(AIOS_DIR, { recursive: true, force: true });

      const stateManager = require('../../../.aios-core/core/session/state-manager');

      const start = Date.now();
      const isAios = stateManager.isAiosProject();
      const duration = Date.now() - start;

      expect(isAios).toBe(false);
      expect(duration).toBeLessThan(1); // <1ms overhead
    });
  });

  describe('Error Handling', () => {
    it('should handle corrupted session file', async () => {
      const stateManager = require('../../../.aios-core/core/session/state-manager');
      await stateManager.init();

      // Corrupt session file
      fs.writeFileSync(SESSION_PATH, 'invalid json {{{');

      // Should throw JSON parse error
      await expect(stateManager.read()).rejects.toThrow();
    });

    it('should handle missing session file', async () => {
      const stateManager = require('../../../.aios-core/core/session/state-manager');

      // Don't call init, session file won't exist
      fs.rmSync(SESSION_PATH, { force: true });

      // Should create default session
      const session = await stateManager.read();
      expect(session).toHaveProperty('sessionId');
    });

    it('should handle write failures gracefully', async () => {
      const stateManager = require('../../../.aios-core/core/session/state-manager');
      await stateManager.init();

      // Make directory read-only
      fs.chmodSync(AIOS_DIR, 0o444);

      // Should throw write error
      await expect(stateManager.update({ project: { name: 'Fail' } })).rejects.toThrow();

      // Restore permissions
      fs.chmodSync(AIOS_DIR, 0o755);
    });
  });

  describe('isAiosProject', () => {
    it('should return true for AIOS project', () => {
      const stateManager = require('../../../.aios-core/core/session/state-manager');
      expect(stateManager.isAiosProject()).toBe(true);
    });

    it('should return false for non-AIOS project', () => {
      // Remove .aios directory
      fs.rmSync(AIOS_DIR, { recursive: true, force: true });

      const stateManager = require('../../../.aios-core/core/session/state-manager');
      expect(stateManager.isAiosProject()).toBe(false);
    });
  });
});
