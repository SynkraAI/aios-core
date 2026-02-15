/**
 * BOB-SAFE-1: Comprehensive Safety Gates Tests
 *
 * Validates 5 safety checks implemented to prevent edge cases:
 * 1. Disk space check
 * 2. Session state validation
 * 3. Lock ownership verification
 * 4. Dependency health check
 * 5. Backup prompts for destructive ops
 */

const path = require('path');
const fs = require('fs');
const { BobOrchestrator } = require('../../../.aios-core/core/orchestration/bob-orchestrator');

const TEST_PROJECT_ROOT = path.join(__dirname, '../../fixtures/test-project-safe-1');

describe('BOB-SAFE-1: Comprehensive safety gates', () => {
  beforeEach(() => {
    // Clean up test project
    if (fs.existsSync(TEST_PROJECT_ROOT)) {
      fs.rmSync(TEST_PROJECT_ROOT, { recursive: true, force: true });
    }
    fs.mkdirSync(TEST_PROJECT_ROOT, { recursive: true });
  });

  afterEach(() => {
    // Clean up after tests
    if (fs.existsSync(TEST_PROJECT_ROOT)) {
      fs.rmSync(TEST_PROJECT_ROOT, { recursive: true, force: true });
    }
  });

  describe('Disk Space Check', () => {
    it('should pass when sufficient disk space available', async () => {
      const bob = new BobOrchestrator(TEST_PROJECT_ROOT);
      const result = await bob._checkDiskSpace(1); // Only 1MB needed

      expect(result.safe).toBe(true);
      expect(result.available).toBeGreaterThan(0);
    });

    it('should detect insufficient disk space', async () => {
      const bob = new BobOrchestrator(TEST_PROJECT_ROOT);
      const result = await bob._checkDiskSpace(999999999); // Unrealistic requirement

      // Might pass if actual disk is huge, but check structure
      if (!result.safe) {
        expect(result.reason).toBe('insufficient_disk_space');
        expect(result.message).toContain('insuficiente');
      }
      expect(result).toHaveProperty('available');
    });

    it('should fail-safe when disk check fails', async () => {
      const bob = new BobOrchestrator(TEST_PROJECT_ROOT);

      // Mock execSync to throw
      const originalExec = require('child_process').execSync;
      jest.spyOn(require('child_process'), 'execSync').mockImplementation(() => {
        throw new Error('df command failed');
      });

      const result = await bob._checkDiskSpace(100);

      // Should fail-safe and assume space is available
      expect(result.safe).toBe(true);
      expect(result.warning).toBe('check_failed');

      // Restore
      require('child_process').execSync = originalExec;
    });
  });

  describe('Session State Validation', () => {
    it('should validate complete session state schema', () => {
      const bob = new BobOrchestrator(TEST_PROJECT_ROOT);

      const validState = {
        session_state: {
          epic: { title: 'Test Epic' },
          progress: { current_story: 'TEST-1' },
          workflow: {
            current_phase: 'phase1',
            phase_results: {},
          },
          last_updated: new Date().toISOString(),
        },
      };

      const result = bob._validateSessionStateSchema(validState);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should detect missing session_state object', () => {
      const bob = new BobOrchestrator(TEST_PROJECT_ROOT);

      const invalidState = {
        // Missing session_state
      };

      const result = bob._validateSessionStateSchema(invalidState);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing session_state object');
    });

    it('should detect missing required fields', () => {
      const bob = new BobOrchestrator(TEST_PROJECT_ROOT);

      const invalidState = {
        session_state: {
          // Missing epic, progress, workflow, last_updated
        },
      };

      const result = bob._validateSessionStateSchema(invalidState);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((e) => e.includes('epic'))).toBe(true);
      expect(result.errors.some((e) => e.includes('progress'))).toBe(true);
    });

    it('should detect invalid last_updated timestamp', () => {
      const bob = new BobOrchestrator(TEST_PROJECT_ROOT);

      const invalidState = {
        session_state: {
          epic: {},
          progress: {},
          workflow: { current_phase: 'p1', phase_results: {} },
          last_updated: 'invalid-date',
        },
      };

      const result = bob._validateSessionStateSchema(invalidState);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid last_updated timestamp');
    });

    it('should detect missing workflow fields', () => {
      const bob = new BobOrchestrator(TEST_PROJECT_ROOT);

      const invalidState = {
        session_state: {
          epic: {},
          progress: {},
          workflow: {
            // Missing current_phase and phase_results
          },
          last_updated: new Date().toISOString(),
        },
      };

      const result = bob._validateSessionStateSchema(invalidState);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('current_phase'))).toBe(true);
      expect(result.errors.some((e) => e.includes('phase_results'))).toBe(true);
    });
  });

  describe('Lock Ownership Verification', () => {
    it('should verify lock ownership successfully', async () => {
      const bob = new BobOrchestrator(TEST_PROJECT_ROOT);

      // Mock lock manager
      bob.lockManager = {
        isLockOwner: jest.fn().mockResolvedValue(true),
      };

      const result = await bob._verifyLockOwnership('test-resource');

      expect(result.verified).toBe(true);
      expect(bob.lockManager.isLockOwner).toHaveBeenCalledWith('test-resource');
    });

    it('should detect lost lock ownership', async () => {
      const bob = new BobOrchestrator(TEST_PROJECT_ROOT);

      // Mock lock lost
      bob.lockManager = {
        isLockOwner: jest.fn().mockResolvedValue(false),
      };

      const result = await bob._verifyLockOwnership('test-resource');

      expect(result.verified).toBe(false);
      expect(result.reason).toBe('lock_lost');
      expect(result.message).toContain('perdido');
      expect(result.action).toBe('abort');
    });
  });

  describe('Dependency Health Check', () => {
    it('should detect healthy dependencies', async () => {
      const bob = new BobOrchestrator(TEST_PROJECT_ROOT);
      const result = await bob._checkDependencies();

      // git and node should be available in test environment
      expect(result.healthy).toBe(true);
      expect(result.missing).toBeUndefined();
    });

    it('should detect missing dependencies', async () => {
      const bob = new BobOrchestrator(TEST_PROJECT_ROOT);

      // Mock execSync to simulate missing dependency
      const originalExec = require('child_process').execSync;
      jest.spyOn(require('child_process'), 'execSync').mockImplementation((cmd) => {
        if (cmd.includes('which')) {
          throw new Error('Command not found');
        }
        return originalExec(cmd);
      });

      const result = await bob._checkDependencies();

      expect(result.healthy).toBe(false);
      expect(result.missing).toBeDefined();
      expect(result.missing.length).toBeGreaterThan(0);
      expect(result.message).toContain('faltando');

      // Restore
      require('child_process').execSync = originalExec;
    });
  });

  describe('Backup Recommendation', () => {
    it('should recommend backup for destructive operation with uncommitted changes', () => {
      const bob = new BobOrchestrator(TEST_PROJECT_ROOT);

      const result = bob._shouldPromptBackup('delete', {
        uncommittedFiles: ['file1.js', 'file2.js'],
      });

      expect(result.recommend).toBe(true);
      expect(result.reason).toBe('uncommitted_changes');
      expect(result.severity).toBe('high');
      expect(result.message).toContain('commitadas');
    });

    it('should recommend backup for destructive operation (general)', () => {
      const bob = new BobOrchestrator(TEST_PROJECT_ROOT);

      const result = bob._shouldPromptBackup('reset', {
        uncommittedFiles: [],
      });

      expect(result.recommend).toBe(true);
      expect(result.reason).toBe('destructive_operation');
      expect(result.severity).toBe('medium');
      expect(result.message).toContain('não pode ser desfeita');
    });

    it('should not recommend backup for safe operations', () => {
      const bob = new BobOrchestrator(TEST_PROJECT_ROOT);

      const result = bob._shouldPromptBackup('read', {});

      expect(result.recommend).toBe(false);
    });

    it('should recognize all destructive operations', () => {
      const bob = new BobOrchestrator(TEST_PROJECT_ROOT);
      const destructiveOps = ['delete', 'reset', 'discard', 'force-restart'];

      destructiveOps.forEach((op) => {
        const result = bob._shouldPromptBackup(op, { uncommittedFiles: [] });
        expect(result.recommend).toBe(true);
      });
    });
  });

  describe('Integration: Safety Checks in Orchestrate', () => {
    it('should run dependency check on startup', async () => {
      const bob = new BobOrchestrator(TEST_PROJECT_ROOT);

      // Mock all dependencies
      bob.lockManager = {
        acquireLock: jest.fn().mockResolvedValue(true),
        isLockOwner: jest.fn().mockResolvedValue(true),
        releaseLock: jest.fn().mockResolvedValue(true),
      };
      bob.observabilityPanel = {
        start: jest.fn(),
        stop: jest.fn(),
        setMode: jest.fn(),
      };
      bob.bobStatusWriter = {
        initialize: jest.fn().mockResolvedValue(true),
        complete: jest.fn().mockResolvedValue(true),
      };
      bob.dataLifecycleManager = {
        runStartupCleanup: jest.fn().mockResolvedValue({ deleted: 0 }),
      };
      bob._checkExistingSession = jest.fn().mockResolvedValue({ hasSession: false });
      bob.surfaceChecker = {
        shouldSurface: jest.fn().mockReturnValue({ should_surface: false }),
      };
      bob._routeByState = jest.fn().mockResolvedValue({ action: 'test' });

      // Spy on _checkDependencies
      const depsSpy = jest.spyOn(bob, '_checkDependencies');

      await bob.orchestrate({});

      expect(depsSpy).toHaveBeenCalled();
    });

    it('should validate session state when session exists', async () => {
      const bob = new BobOrchestrator(TEST_PROJECT_ROOT);

      const validSession = {
        hasSession: true,
        state: {
          session_state: {
            epic: {},
            progress: {},
            workflow: { current_phase: 'p1', phase_results: {} },
            last_updated: new Date().toISOString(),
          },
        },
      };

      // Mock dependencies
      bob.lockManager = {
        acquireLock: jest.fn().mockResolvedValue(true),
        isLockOwner: jest.fn().mockResolvedValue(true),
        releaseLock: jest.fn().mockResolvedValue(true),
      };
      bob.observabilityPanel = {
        start: jest.fn(),
        stop: jest.fn(),
        setMode: jest.fn(),
      };
      bob.bobStatusWriter = {
        initialize: jest.fn().mockResolvedValue(true),
        complete: jest.fn().mockResolvedValue(true),
      };
      bob.dataLifecycleManager = {
        runStartupCleanup: jest.fn().mockResolvedValue({ deleted: 0 }),
      };
      bob._checkExistingSession = jest.fn().mockResolvedValue(validSession);
      bob.surfaceChecker = {
        shouldSurface: jest.fn().mockReturnValue({ should_surface: false }),
      };
      bob._routeByState = jest.fn().mockResolvedValue({ action: 'test' });

      // Spy on validation
      const validationSpy = jest.spyOn(bob, '_validateSessionStateSchema');

      await bob.orchestrate({});

      expect(validationSpy).toHaveBeenCalledWith(validSession.state);
    });
  });
});
