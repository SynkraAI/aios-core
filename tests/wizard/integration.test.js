/**
 * Wizard Integration Tests
 *
 * Story 1.7: Dependency Installation Integration
 * Tests the full wizard flow including dependency installation
 */

const inquirer = require('inquirer');
const { runWizard } = require('../../src/wizard/index');
const { installDependencies } = require('../../src/installer/dependency-installer');
const { configureEnvironment } = require('../../packages/installer/src/config/configure-environment');
const { generateIDEConfigs } = require('../../src/wizard/ide-config-generator');

// Mock dependencies
jest.mock('inquirer');
jest.mock('../../src/installer/dependency-installer');
jest.mock('../../packages/installer/src/config/configure-environment');
jest.mock('../../src/wizard/ide-config-generator');
jest.mock('../../src/wizard/feedback', () => ({
  showWelcome: jest.fn(),
  showCompletion: jest.fn(),
  showCancellation: jest.fn()
}));

describe('Wizard Integration - Story 1.7', () => {
  let consoleLogSpy, consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Default mocks for successful flow
    inquirer.prompt.mockResolvedValue({
      projectType: 'greenfield',
      selectedIDEs: ['vscode'],
      packageManager: 'npm'
    });

    generateIDEConfigs.mockResolvedValue({
      success: true,
      configs: [{ ide: 'vscode', path: '.vscode/settings.json' }]
    });

    configureEnvironment.mockResolvedValue({
      envCreated: true,
      envExampleCreated: true,
      coreConfigCreated: true,
      gitignoreUpdated: true,
      errors: []
    });

    installDependencies.mockResolvedValue({
      success: true,
      packageManager: 'npm'
    });
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('Full Wizard Flow (AC Integration)', () => {
    it('should complete full wizard with dependency installation', async () => {
      const answers = await runWizard();

      expect(answers.projectType).toBe('greenfield');
      expect(answers.selectedIDEs).toContain('vscode');
      expect(answers.packageManager).toBe('npm');
      expect(answers.envConfigured).toBe(true);
      expect(answers.depsInstalled).toBe(true);
      expect(answers.depsResult.success).toBe(true);
    });

    it('should install dependencies after env configuration', async () => {
      await runWizard();

      // Verify order of operations
      const envCallOrder = configureEnvironment.mock.invocationCallOrder[0];
      const depsCallOrder = installDependencies.mock.invocationCallOrder[0];

      expect(envCallOrder).toBeLessThan(depsCallOrder);
    });

    it('should pass selected package manager to installDependencies', async () => {
      inquirer.prompt.mockResolvedValue({
        projectType: 'greenfield',
        selectedIDEs: ['vscode'],
        packageManager: 'yarn'
      });

      await runWizard();

      expect(installDependencies).toHaveBeenCalledWith({
        packageManager: 'yarn',
        projectPath: process.cwd()
      });
    });
  });

  describe('Package Manager Selection (AC1)', () => {
    it('should accept npm', async () => {
      inquirer.prompt.mockResolvedValue({
        projectType: 'greenfield',
        packageManager: 'npm'
      });

      const answers = await runWizard();
      expect(answers.packageManager).toBe('npm');
    });

    it('should accept yarn', async () => {
      inquirer.prompt.mockResolvedValue({
        projectType: 'greenfield',
        packageManager: 'yarn'
      });

      const answers = await runWizard();
      expect(answers.packageManager).toBe('yarn');
    });

    it('should accept pnpm', async () => {
      inquirer.prompt.mockResolvedValue({
        projectType: 'greenfield',
        packageManager: 'pnpm'
      });

      const answers = await runWizard();
      expect(answers.packageManager).toBe('pnpm');
    });

    it('should accept bun', async () => {
      inquirer.prompt.mockResolvedValue({
        projectType: 'greenfield',
        packageManager: 'bun'
      });

      const answers = await runWizard();
      expect(answers.packageManager).toBe('bun');
    });
  });

  describe('Offline Mode (AC6)', () => {
    it('should handle offline mode gracefully', async () => {
      installDependencies.mockResolvedValue({
        success: true,
        offlineMode: true,
        packageManager: 'npm'
      });

      const answers = await runWizard();

      expect(answers.depsInstalled).toBe(true);
      expect(answers.depsResult.offlineMode).toBe(true);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('offline mode')
      );
    });
  });

  describe('Error Handling (AC4, AC5)', () => {
    it('should offer retry on installation failure', async () => {
      installDependencies
        .mockResolvedValueOnce({
          success: false,
          errorMessage: 'Network connection failed',
          solution: 'Check your internet connection',
          errorCategory: 'network'
        })
        .mockResolvedValueOnce({
          success: true,
          packageManager: 'npm'
        });

      inquirer.prompt
        .mockResolvedValueOnce({
          projectType: 'greenfield',
          selectedIDEs: [],
          packageManager: 'npm'
        })
        .mockResolvedValueOnce({
          retryDeps: true
        });

      const answers = await runWizard();

      expect(installDependencies).toHaveBeenCalledTimes(2);
      expect(answers.depsInstalled).toBe(true);
    });

    it('should allow skipping installation on failure', async () => {
      installDependencies.mockResolvedValue({
        success: false,
        errorMessage: 'Network connection failed',
        solution: 'Check your internet connection'
      });

      inquirer.prompt
        .mockResolvedValueOnce({
          projectType: 'greenfield',
          selectedIDEs: [],
          packageManager: 'npm'
        })
        .mockResolvedValueOnce({
          retryDeps: false
        });

      const answers = await runWizard();

      expect(answers.depsInstalled).toBe(false);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('manually')
      );
    });

    it('should display clear error messages', async () => {
      installDependencies.mockResolvedValue({
        success: false,
        errorMessage: 'Permission denied',
        solution: 'Try running with elevated permissions',
        errorCategory: 'permission'
      });

      inquirer.prompt
        .mockResolvedValueOnce({
          projectType: 'greenfield',
          packageManager: 'npm'
        })
        .mockResolvedValueOnce({
          retryDeps: false
        });

      await runWizard();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Permission denied')
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('elevated permissions')
      );
    });
  });

  describe('Progress Feedback (AC3)', () => {
    it('should show installation progress messages', async () => {
      await runWizard();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Installing dependencies')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('installed')
      );
    });
  });

  describe('Wizard State Flow', () => {
    it('should maintain correct state through all steps', async () => {
      const answers = await runWizard();

      // Verify all story steps completed
      expect(answers.projectType).toBeDefined(); // Story 1.3
      expect(answers.selectedIDEs).toBeDefined(); // Story 1.4
      expect(answers.envConfigured).toBeDefined(); // Story 1.6
      expect(answers.packageManager).toBeDefined(); // Story 1.7
      expect(answers.depsInstalled).toBeDefined(); // Story 1.7
    });

    it('should handle environment config failure gracefully', async () => {
      configureEnvironment.mockRejectedValue(new Error('Env config failed'));
      inquirer.prompt
        .mockResolvedValueOnce({
          projectType: 'greenfield',
          packageManager: 'npm'
        })
        .mockResolvedValueOnce({
          continueWithoutEnv: true
        });

      const answers = await runWizard();

      expect(answers.envConfigured).toBe(false);
      // Should still proceed to dependency installation
      expect(installDependencies).toHaveBeenCalled();
    });
  });
});
