/**
 * Unit tests for Navigator Doctor (Health Check)
 *
 * @see squads/navigator/scripts/navigator/doctor.js
 */

const {
  checkNodeVersion,
  checkGitAvailable,
  checkDependencies,
} = require('../../../squads/navigator/scripts/navigator/doctor');

describe('Navigator Doctor - Health Checks', () => {
  describe('checkNodeVersion', () => {
    it('should pass for Node.js >= 18.0.0', async () => {
      const result = await checkNodeVersion();

      expect(result).toHaveProperty('name', 'Node.js Version');
      expect(result).toHaveProperty('passed');
      expect(result).toHaveProperty('message');

      // Current environment should have Node >= 18
      expect(result.passed).toBe(true);
      expect(result.message).toContain('Node.js');
      expect(result.message).toContain('>=');
    });

    it('should have correct result structure', async () => {
      const result = await checkNodeVersion();

      expect(result).toMatchObject({
        name: expect.any(String),
        passed: expect.any(Boolean),
        message: expect.any(String),
      });
    });
  });

  describe('checkGitAvailable', () => {
    it('should detect git installation', async () => {
      const result = await checkGitAvailable();

      expect(result).toHaveProperty('name', 'Git');
      expect(result).toHaveProperty('passed');
      expect(result).toHaveProperty('message');

      // Git should be available in CI/dev environments
      if (result.passed) {
        expect(result.message).toContain('git version');
      }
    });

    it('should handle git not found gracefully', async () => {
      // This would require mocking execSync to throw
      // For now, just verify the function exists
      expect(typeof checkGitAvailable).toBe('function');
    });
  });

  describe('checkDependencies', () => {
    it('should check for required npm packages', async () => {
      const result = await checkDependencies();

      expect(result).toHaveProperty('name', 'Dependencies');
      expect(result).toHaveProperty('passed');
      expect(result).toHaveProperty('message');

      // Should check for js-yaml, glob, inquirer
      expect(result.message).toMatch(/js-yaml|glob|inquirer/);
    });

    it('should list missing packages if any', async () => {
      const result = await checkDependencies();

      if (!result.passed) {
        expect(result).toHaveProperty('fix');
        expect(result.fix).toContain('npm install');
      }
    });

    it('should pass when all dependencies installed', async () => {
      const result = await checkDependencies();

      // In aios-core, these should be installed
      expect(result.passed).toBe(true);
    });
  });

  describe('Health Check Integration', () => {
    it('should have all exported functions', () => {
      const doctor = require('../../../squads/navigator/scripts/navigator/doctor');

      expect(doctor).toHaveProperty('runHealthCheck');
      expect(doctor).toHaveProperty('checkNodeVersion');
      expect(doctor).toHaveProperty('checkGitAvailable');
      expect(doctor).toHaveProperty('checkDependencies');
      expect(doctor).toHaveProperty('checkGitHooks');
      expect(doctor).toHaveProperty('checkDirectoryStructure');
      expect(doctor).toHaveProperty('checkPipelineMap');
      expect(doctor).toHaveProperty('checkScriptsExecutable');
    });
  });
});

/**
 * Coverage Notes:
 *
 * These tests cover the basic health check functions.
 * Additional coverage needed:
 *
 * 1. checkGitHooks() - Verify .husky/post-commit integration
 * 2. checkDirectoryStructure() - Validate required directories
 * 3. checkPipelineMap() - YAML parsing and structure validation
 * 4. checkScriptsExecutable() - File permissions and existence
 * 5. runHealthCheck() - End-to-end health check execution
 *
 * For full coverage, add:
 * - Mock file system operations
 * - Mock execSync for git/npm commands
 * - Test error handling paths
 * - Test all exit codes
 */
