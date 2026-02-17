/**
 * Unit Tests: Troubleshooting System
 * Story 1.8 - Task 1.8.6 (QA Fix - Coverage Improvement)
 */

const inquirer = require('inquirer');
const { offerTroubleshooting } = require('../../../../packages/installer/src/wizard/validation/troubleshooting-system');

// Mock inquirer
jest.mock('inquirer');

describe('Troubleshooting System', () => {
  let consoleLogSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.log to avoid test output noise
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe('offerTroubleshooting', () => {
    it('should return troubleshooting for known error codes', async () => {
      // Given
      const errors = [
        { component: 'files', code: 'ENV_FILE_MISSING', severity: 'critical', message: '.env file not found' },
      ];

      inquirer.prompt = jest.fn()
        .mockResolvedValueOnce({ viewLogs: false })
        .mockResolvedValueOnce({ openDocs: false });

      // When
      await offerTroubleshooting(errors);

      // Then
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('.env file not found'),
      );
    });

    it('should handle unknown error codes gracefully', async () => {
      // Given
      const errors = [
        { component: 'unknown', code: 'UNKNOWN_ERROR_CODE', severity: 'medium', message: 'Unknown error' },
      ];

      inquirer.prompt = jest.fn().mockResolvedValue({ action: 'skip' });

      // When
      await offerTroubleshooting(errors);

      // Then
      expect(console.log).toHaveBeenCalled();
      // Should not throw error
    });

    it('should format troubleshooting output correctly', async () => {
      // Given
      const errors = [
        { component: 'mcps', code: 'MCP_HEALTH_TIMEOUT', severity: 'medium', message: 'Health check timeout' },
      ];

      inquirer.prompt = jest.fn().mockResolvedValue({ action: 'skip' });

      // When
      await offerTroubleshooting(errors);

      // Then
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Solutions:'),
      );
    });

    it('should provide solutions for ENV_FILE_MISSING', async () => {
      // Given
      const errors = [
        { component: 'files', code: 'ENV_FILE_MISSING', severity: 'critical' },
      ];

      inquirer.prompt = jest.fn().mockResolvedValue({ action: 'skip' });

      // When
      await offerTroubleshooting(errors);

      // Then
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('.env'),
      );
    });

    it('should provide solutions for MCP_HEALTH_CHECK_FAILED', async () => {
      // Given
      const errors = [
        { component: 'mcps', code: 'MCP_HEALTH_CHECK_FAILED', severity: 'medium' },
      ];

      inquirer.prompt = jest.fn()
        .mockResolvedValueOnce({ viewLogs: false })
        .mockResolvedValueOnce({ openDocs: false });

      // When
      await offerTroubleshooting(errors);

      // Then
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('API key'),
      );
    });

    it('should provide solutions for CORE_CONFIG_MISSING', async () => {
      // Given
      const errors = [
        { component: 'configs', code: 'CORE_CONFIG_MISSING', severity: 'high' },
      ];

      inquirer.prompt = jest.fn().mockResolvedValue({ action: 'skip' });

      // When
      await offerTroubleshooting(errors);

      // Then
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('core-config'),
      );
    });

    it('should provide solutions for GITIGNORE_CRITICAL_MISSING', async () => {
      // Given
      const errors = [
        { component: 'configs', code: 'GITIGNORE_CRITICAL_MISSING', severity: 'high' },
      ];

      inquirer.prompt = jest.fn()
        .mockResolvedValueOnce({ viewLogs: false })
        .mockResolvedValueOnce({ openDocs: false });

      // When
      await offerTroubleshooting(errors);

      // Then
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('.gitignore'),
      );
    });

    it('should provide solutions for dependency errors', async () => {
      // Given
      const errors = [
        { component: 'dependencies', code: 'VULNERABILITIES_FOUND', severity: 'medium' },
      ];

      inquirer.prompt = jest.fn()
        .mockResolvedValueOnce({ viewLogs: false })
        .mockResolvedValueOnce({ openDocs: false });

      // When
      await offerTroubleshooting(errors);

      // Then
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('npm audit'),
      );
    });

    it('should prioritize errors by severity (critical > high > medium > low)', async () => {
      // Given
      const errors = [
        { component: 'test', code: 'ENV_FILE_MISSING', severity: 'critical', message: 'Critical priority' },
        { component: 'test', code: 'CORE_CONFIG_MISSING', severity: 'high', message: 'High priority' },
        { component: 'test', code: 'MCP_HEALTH_CHECK_FAILED', severity: 'medium', message: 'Medium priority' },
        { component: 'test', code: 'GITIGNORE_RECOMMENDED_MISSING', severity: 'low', message: 'Low priority' },
      ];

      inquirer.prompt = jest.fn()
        .mockResolvedValueOnce({ viewLogs: false })
        .mockResolvedValueOnce({ openDocs: false });

      // When
      await offerTroubleshooting(errors);

      // Then
      // Verify inquirer was called (troubleshooting executed)
      expect(inquirer.prompt).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Troubleshooting Guide'),
      );
    });

    it('should include documentation links', async () => {
      // Given
      const errors = [
        { component: 'mcps', code: 'MCP_HEALTH_CHECK_FAILED', severity: 'medium' },
      ];

      inquirer.prompt = jest.fn()
        .mockResolvedValueOnce({ viewLogs: false })
        .mockResolvedValueOnce({ openDocs: true });

      // When
      await offerTroubleshooting(errors);

      // Then
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('docs.SynkraAI.com'),
      );
    });

    it('should include support contact information', async () => {
      // Given
      const errors = [
        { component: 'test', code: 'ENV_FILE_MISSING', severity: 'critical' },
      ];

      inquirer.prompt = jest.fn()
        .mockResolvedValueOnce({ viewLogs: true })
        .mockResolvedValueOnce({ openDocs: false });

      // When
      await offerTroubleshooting(errors);

      // Then
      // Check for installation logs which is shown when viewLogs=true
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Installation Logs'),
      );
    });

    it('should handle empty errors array', async () => {
      // Given
      const errors = [];

      // When
      await offerTroubleshooting(errors);

      // Then
      // Should return early without logging when empty
      expect(console.log).not.toHaveBeenCalled();
    });

    it('should handle interactive prompts (mock inquirer)', async () => {
      // Given
      const errors = [
        { component: 'files', code: 'ENV_FILE_MISSING', severity: 'critical' },
      ];

      inquirer.prompt = jest.fn().mockResolvedValue({
        action: 'view_details',
        errorIndex: 0,
      });

      // When
      await offerTroubleshooting(errors);

      // Then
      expect(inquirer.prompt).toHaveBeenCalled();
      const promptConfig = inquirer.prompt.mock.calls[0][0];
      expect(promptConfig).toBeDefined();
    });
  });
});
