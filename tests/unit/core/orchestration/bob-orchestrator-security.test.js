/**
 * Bob Orchestrator Security Tests
 *
 * Task #3: UID validation before process.kill()
 * Security: Prevents attempting to kill processes owned by other users
 *
 * @module tests/unit/core/orchestration/bob-orchestrator-security
 */

'use strict';

const { BobOrchestrator } = require('../../../../.aios-core/core/orchestration/bob-orchestrator');
const os = require('os');
const { execSync } = require('child_process');

describe('BobOrchestrator - Security (Task #3)', () => {
  let orchestrator;
  const projectRoot = '/tmp/test-project';

  beforeEach(() => {
    orchestrator = new BobOrchestrator(projectRoot, {
      debug: false,
      observability: false,
    });
  });

  describe('_isProcessOwnedByCurrentUser() - UID Validation', () => {
    test('returns true for current process (own PID)', () => {
      const currentPid = process.pid;
      const result = orchestrator._isProcessOwnedByCurrentUser(currentPid);

      expect(result).toBe(true);
    });

    test('returns true for parent process (Node.js parent)', () => {
      const ppid = process.ppid;
      if (ppid) {
        const result = orchestrator._isProcessOwnedByCurrentUser(ppid);
        expect(result).toBe(true);
      } else {
        // No parent (unlikely but handle gracefully)
        expect(true).toBe(true);
      }
    });

    test('returns false for non-existent PID', () => {
      // Use a very high PID that definitely doesn't exist
      const nonExistentPid = 99999999;
      const result = orchestrator._isProcessOwnedByCurrentUser(nonExistentPid);

      expect(result).toBe(false);
    });

    test('returns false for invalid PID (string)', () => {
      const result = orchestrator._isProcessOwnedByCurrentUser('invalid-pid');

      expect(result).toBe(false);
    });

    test('returns false for negative PID', () => {
      const result = orchestrator._isProcessOwnedByCurrentUser(-1);

      expect(result).toBe(false);
    });

    test('returns false for PID 0', () => {
      const result = orchestrator._isProcessOwnedByCurrentUser(0);

      expect(result).toBe(false);
    });

    test('verifies current user UID matches process UID', () => {
      const currentPid = process.pid;
      const currentUid = os.userInfo().uid;

      // Get process UID
      const processUidOutput = execSync(`ps -p ${currentPid} -o uid=`, {
        encoding: 'utf8',
      }).trim();
      const processUid = parseInt(processUidOutput, 10);

      // UIDs should match
      expect(processUid).toBe(currentUid);

      // And our function should return true
      const result = orchestrator._isProcessOwnedByCurrentUser(currentPid);
      expect(result).toBe(true);
    });

    test('handles ps command failure gracefully', () => {
      // Mock execSync to throw error
      const originalExecSync = require('child_process').execSync;
      jest.spyOn(require('child_process'), 'execSync').mockImplementation(() => {
        throw new Error('ps command failed');
      });

      const result = orchestrator._isProcessOwnedByCurrentUser(process.pid);

      // Should return false on error (safe default)
      expect(result).toBe(false);

      // Restore original
      require('child_process').execSync = originalExecSync;
    });
  });

  describe('_cleanupOrphanMonitors() - Security Integration', () => {
    test('skips processes not owned by current user', () => {
      // This test verifies the security check is integrated
      // Since we can't easily create processes owned by other users in a test,
      // we verify the logic flow

      const logs = [];
      orchestrator._log = (msg) => logs.push(msg);
      orchestrator.options.debug = true;

      // Mock execSync to return a fake monitor PID
      const originalExecSync = require('child_process').execSync;
      let execCallCount = 0;

      jest.spyOn(require('child_process'), 'execSync').mockImplementation((cmd) => {
        execCallCount++;

        // First call: pgrep for monitors
        if (cmd.includes('pgrep')) {
          return '12345\n67890'; // Two fake PIDs
        }

        // Second call: get UID for PID 12345
        if (cmd.includes('ps -p 12345 -o uid=')) {
          // Return different UID than current user
          const currentUid = os.userInfo().uid;
          return String(currentUid + 1000); // Different UID
        }

        // Third call: get UID for PID 67890
        if (cmd.includes('ps -p 67890 -o uid=')) {
          // Return same UID as current user
          return String(os.userInfo().uid);
        }

        // Fourth call: get PPID for PID 67890
        if (cmd.includes('ps -p 67890 -o ppid=')) {
          return '99999'; // Fake parent PID
        }

        // Fifth call: check if parent exists
        if (cmd.includes('ps -p 99999')) {
          throw new Error('Parent does not exist'); // Orphan detected
        }

        return '';
      });

      // Run cleanup
      orchestrator._cleanupOrphanMonitors();

      // Verify PID 12345 was skipped (UID mismatch)
      expect(logs.some((log) => log.includes('Skipped monitor 12345'))).toBe(true);

      // Verify PID 67890 was processed (but we can't actually kill it in test)
      // The process.kill() would be called for 67890, but we can't verify that easily

      // Restore original
      require('child_process').execSync = originalExecSync;
    });

    test('handles empty monitor list gracefully', () => {
      // Mock execSync to return empty result
      const originalExecSync = require('child_process').execSync;
      jest.spyOn(require('child_process'), 'execSync').mockImplementation((cmd) => {
        if (cmd.includes('pgrep')) {
          return ''; // No monitors
        }
        return '';
      });

      // Should not throw
      expect(() => {
        orchestrator._cleanupOrphanMonitors();
      }).not.toThrow();

      // Restore original
      require('child_process').execSync = originalExecSync;
    });

    test('handles pgrep failure gracefully', () => {
      // Mock execSync to throw on pgrep
      const originalExecSync = require('child_process').execSync;
      jest.spyOn(require('child_process'), 'execSync').mockImplementation((cmd) => {
        if (cmd.includes('pgrep')) {
          throw new Error('pgrep failed');
        }
        return '';
      });

      // Should not throw - errors are caught
      expect(() => {
        orchestrator._cleanupOrphanMonitors();
      }).not.toThrow();

      // Restore original
      require('child_process').execSync = originalExecSync;
    });
  });

  describe('Security Properties', () => {
    test('_isProcessOwnedByCurrentUser is a private method', () => {
      expect(orchestrator._isProcessOwnedByCurrentUser).toBeDefined();
      expect(typeof orchestrator._isProcessOwnedByCurrentUser).toBe('function');

      // Method name starts with underscore (private convention)
      expect(orchestrator._isProcessOwnedByCurrentUser.name).toMatch(/^_/);
    });

    test('UID validation happens before process.kill()', () => {
      // This is a code structure test - verifying the order of operations
      // We verify this by reading the code (which we did in implementation)
      // and ensuring the UID check is BEFORE the kill

      const orchestratorCode = require('fs').readFileSync(
        require('path').join(__dirname, '../../../../.aios-core/core/orchestration/bob-orchestrator.js'),
        'utf8',
      );

      // Find the _cleanupOrphanMonitors function
      const functionMatch = orchestratorCode.match(/_cleanupOrphanMonitors\(\) \{[\s\S]*?\n  \}/);
      expect(functionMatch).toBeTruthy();

      const functionBody = functionMatch[0];

      // Verify UID check comes before process.kill
      const uidCheckIndex = functionBody.indexOf('_isProcessOwnedByCurrentUser');
      const killIndex = functionBody.indexOf('process.kill');

      expect(uidCheckIndex).toBeGreaterThan(0);
      expect(killIndex).toBeGreaterThan(0);
      expect(uidCheckIndex).toBeLessThan(killIndex);
    });

    test('process.kill() has security comment', () => {
      const orchestratorCode = require('fs').readFileSync(
        require('path').join(__dirname, '../../../../.aios-core/core/orchestration/bob-orchestrator.js'),
        'utf8',
      );

      // Verify security comment exists near process.kill
      expect(orchestratorCode).toContain('SECURITY: Verify process belongs to current user');
      expect(orchestratorCode).toContain('Safe to kill: ownership already validated');
    });
  });

  describe('Error Handling', () => {
    test('handles timeout in UID check gracefully', () => {
      // Create orchestrator with very short timeout
      const fastOrchestrator = new BobOrchestrator(projectRoot, {
        debug: false,
        observability: false,
      });

      // Mock slow ps command
      const originalExecSync = require('child_process').execSync;
      jest.spyOn(require('child_process'), 'execSync').mockImplementation((cmd, options) => {
        if (cmd.includes('ps -p') && cmd.includes('uid')) {
          // Simulate timeout by taking longer than 5 seconds (mocked)
          throw new Error('Command timed out');
        }
        return originalExecSync(cmd, options);
      });

      const result = fastOrchestrator._isProcessOwnedByCurrentUser(process.pid);

      // Should return false on timeout (safe default)
      expect(result).toBe(false);

      // Restore original
      require('child_process').execSync = originalExecSync;
    });

    test('handles invalid UID output gracefully', () => {
      // Mock ps to return invalid UID
      const originalExecSync = require('child_process').execSync;
      jest.spyOn(require('child_process'), 'execSync').mockImplementation((cmd) => {
        if (cmd.includes('uid=')) {
          return 'not-a-number'; // Invalid UID
        }
        return '';
      });

      const result = orchestrator._isProcessOwnedByCurrentUser(12345);

      // Should return false for invalid UID
      expect(result).toBe(false);

      // Restore original
      require('child_process').execSync = originalExecSync;
    });
  });

  describe('Platform Compatibility', () => {
    test('works on current platform', () => {
      // Verify os.userInfo().uid is available on this platform
      const userInfo = os.userInfo();
      expect(userInfo).toBeDefined();
      expect(typeof userInfo.uid).toBe('number');

      // Verify ps command works
      const psOutput = execSync(`ps -p ${process.pid} -o uid=`, {
        encoding: 'utf8',
      }).trim();
      expect(psOutput).toMatch(/^\d+$/); // Should be a number
    });

    test('ps command format matches expected', () => {
      // Verify ps -o uid= returns just the UID (no header)
      const output = execSync(`ps -p ${process.pid} -o uid=`, {
        encoding: 'utf8',
      });

      // Should be whitespace + number + newline
      expect(output.trim()).toMatch(/^\d+$/);

      // Should NOT contain header like "UID"
      expect(output.toLowerCase()).not.toContain('uid');
    });
  });
});
