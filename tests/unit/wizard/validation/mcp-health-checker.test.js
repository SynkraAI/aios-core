/**
 * Unit Tests: MCP Health Checker
 * Story 1.8 - Task 1.8.3 (QA Fix - Coverage Improvement)
 */

const fs = require('fs');
const { validateMCPs, runHealthCheck } = require('../../../../packages/installer/src/wizard/validation/validators/mcp-health-checker');

// Mock dependencies
jest.mock('fs');

describe('MCP Health Checker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateMCPs', () => {
    it('should validate MCPs with all installations successful', async () => {
      // Given
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({
        mcpServers: {
          browser: { command: 'npx', args: ['-y', '@modelcontextprotocol/server-puppeteer'] },
          context7: { command: 'npx', args: ['-y', '@upstash/context7-mcp'] },
        },
      }));

      const mcpContext = {
        installedMCPs: {
          browser: { status: 'success' },
          context7: { status: 'success' },
        },
        configPath: '.mcp.json',
      };

      // When
      const result = await validateMCPs(mcpContext);

      // Then
      expect(result.success).toBe(true);
      expect(result.healthChecks).toHaveLength(2);
      expect(result.healthChecks[0].mcp).toBe('browser');
      expect(result.healthChecks[1].mcp).toBe('context7');
    });

    it('should skip health checks when no MCPs installed', async () => {
      // Given
      const mcpContext = {
        installedMCPs: {},
      };

      // When
      const result = await validateMCPs(mcpContext);

      // Then
      expect(result.checks).toBeDefined();
      expect(result.checks[0].status).toBe('skipped');
      expect(result.checks[0].message).toBe('No MCPs installed');
    });

    it('should handle missing .mcp.json gracefully', async () => {
      // Given
      fs.existsSync.mockReturnValue(false);

      const mcpContext = {
        installedMCPs: {
          browser: { status: 'success' },
        },
        configPath: '.mcp.json',
      };

      // When
      const result = await validateMCPs(mcpContext);

      // Then
      expect(result.warnings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'MCP_CONFIG_MISSING',
          }),
        ]),
      );
    });

    it('should skip health check for failed installations', async () => {
      // Given
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({
        mcpServers: {
          browser: { command: 'npx', args: [] },
        },
      }));

      const mcpContext = {
        installedMCPs: {
          browser: { status: 'failed', error: 'Installation error' },
        },
      };

      // When
      const result = await validateMCPs(mcpContext);

      // Then
      const browserCheck = result.healthChecks.find(c => c.mcp === 'browser');
      expect(browserCheck.status).toBe('skipped');
      expect(browserCheck.message).toContain('Installation failed');
    });

    it('should aggregate health check results correctly', async () => {
      // Given
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({
        mcpServers: {
          browser: { command: 'npx' },
          exa: { command: 'npx', env: { EXA_API_KEY: 'test-key-123' } },
        },
      }));

      const mcpContext = {
        installedMCPs: {
          browser: { status: 'success' },
          exa: { status: 'success' },
        },
      };

      // When
      const result = await validateMCPs(mcpContext);

      // Then
      expect(result.healthChecks).toHaveLength(2);
      expect(result.healthChecks.every(c => c.mcp && c.status)).toBe(true);
    });

    it('should aggregate health checks even when configuration is minimal', async () => {
      // Given
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({
        mcpServers: {
          browser: { command: 'npx' },
        },
      }));

      const mcpContext = {
        installedMCPs: {
          browser: { status: 'success' },
        },
      };

      // When
      const result = await validateMCPs(mcpContext);

      // Then - at least one health check should be present
      expect(result.healthChecks.length).toBeGreaterThan(0);
      expect(result.healthChecks[0].mcp).toBe('browser');
    });

    it('should handle health check errors gracefully', async () => {
      // Given
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation(() => {
        throw new Error('File read error');
      });

      const mcpContext = {
        installedMCPs: {
          browser: { status: 'success' },
        },
      };

      // When
      const result = await validateMCPs(mcpContext);

      // Then
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'MCP_HEALTH_CHECK_ERROR',
          }),
        ]),
      );
    });
  });

  describe('runHealthCheck', () => {
    it('should validate Browser MCP configuration', async () => {
      // Given
      const mcpConfig = {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-puppeteer'],
      };

      // When
      const result = await runHealthCheck('browser', mcpConfig);

      // Then
      expect(result.success).toBe(true);
      expect(result.message).toContain('Configuration valid');
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it('should validate Context7 MCP npx/stdio configuration', async () => {
      // Given
      const mcpConfig = {
        command: 'npx',
        args: ['-y', '@upstash/context7-mcp'],
      };

      // When
      const result = await runHealthCheck('context7', mcpConfig);

      // Then
      expect(result.success).toBe(true);
      expect(result.message).toContain('Configuration valid');
    });

    it('should detect Exa API key placeholder', async () => {
      // Given
      const mcpConfig = {
        command: 'npx',
        env: {
          EXA_API_KEY: 'your-api-key-here',
        },
      };

      // When
      const result = await runHealthCheck('exa', mcpConfig);

      // Then
      expect(result.success).toBe(false);
      expect(result.message).toContain('placeholder');
      expect(result.details.solution).toContain('.env');
    });

    it('should validate Exa with real API key configured', async () => {
      // Given
      const mcpConfig = {
        command: 'npx',
        env: {
          EXA_API_KEY: 'your-actual-exa-api-key',
        },
      };

      // When
      const result = await runHealthCheck('exa', mcpConfig);

      // Then
      expect(result.success).toBe(true);
      expect(result.message).toContain('Configuration valid');
      expect(result.details.apiKeyConfigured).toBe(true);
    });

    it('should validate Desktop Commander MCP configuration', async () => {
      // Given
      const mcpConfig = {
        command: 'npx',
        args: ['-y', '@desktopcommander/server'],
      };

      // When
      const result = await runHealthCheck('desktop-commander', mcpConfig);

      // Then
      expect(result.success).toBe(true);
      expect(result.message).toContain('Configuration valid');
    });

    it('should handle missing Context7 command gracefully', async () => {
      // Given
      const mcpConfig = {
        // Missing command - invalid configuration
      };

      // When
      const result = await runHealthCheck('context7', mcpConfig);

      // Then - should report invalid configuration
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid configuration');
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });
  });
});
