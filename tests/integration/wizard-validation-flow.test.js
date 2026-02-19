/**
 * Integration Tests: Wizard Validation Flow
 * Story 1.8 - Complete wizard flow including validation
 */

const { validateInstallation } = require('../../packages/installer/src/wizard/validation');

// Mock fs module to prevent real I/O
jest.mock('fs', () => ({
  existsSync: jest.fn(() => true),
  readFileSync: jest.fn((path) => {
    if (path.includes('.env')) {
      return 'NODE_ENV=development';
    }
    if (path.includes('core-config.yaml')) {
      return 'markdownExploder: {}\nqa: {}\nprd: {}\narchitecture: {}';
    }
    if (path.includes('.mcp.json')) {
      return JSON.stringify({
        mcpServers: {
          browser: { command: 'npx', args: [] },
          context7: { command: 'npx', args: [] },
        },
      });
    }
    if (path.includes('package.json')) {
      return JSON.stringify({
        dependencies: { inquirer: '^1.0.0', chalk: '^1.0.0' },
        devDependencies: {},
      });
    }
    if (path.includes('.gitignore')) {
      return '.env\nnode_modules/';
    }
    return '';
  }),
  statSync: jest.fn(() => ({
    isDirectory: () => true,
    mode: parseInt('600', 8),
  })),
  readdirSync: jest.fn(() => ['inquirer', 'chalk', 'yaml', 'fs-extra', '@clack']),
}));

// Mock child_process to prevent real command execution
jest.mock('child_process', () => ({
  exec: jest.fn((cmd, opts, callback) => {
    // Simulate successful npm audit with no vulnerabilities
    const mockAuditResult = JSON.stringify({
      metadata: {
        vulnerabilities: {
          low: 0,
          moderate: 0,
          high: 0,
          critical: 0,
        },
      },
    });

    if (typeof opts === 'function') {
      callback = opts;
    }

    callback(null, { stdout: mockAuditResult, stderr: '' });
  }),
}));

describe('Wizard Validation Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should validate complete installation successfully', async () => {
    // Given - mock installation context
    const installationContext = {
      files: {
        ideConfigs: [],
        env: '.env',
        coreConfig: '.aios-core/core-config.yaml',
        mcpConfig: '.mcp.json',
      },
      configs: {
        env: { envCreated: true, coreConfigCreated: true },
        mcps: {},
        coreConfig: '.aios-core/core-config.yaml',
      },
      dependencies: {
        success: true,
        packageManager: 'npm',
        offlineMode: false,
      },
    };

    // When
    const validation = await validateInstallation(installationContext);

    // Then
    expect(validation).toHaveProperty('overallStatus');
    expect(validation).toHaveProperty('components');
    expect(validation).toHaveProperty('errors');
    expect(validation).toHaveProperty('warnings');
  });

  it('should handle validation with MCP health checks', async () => {
    // Given
    const installationContext = {
      files: { env: '.env' },
      configs: {},
      mcps: {
        installedMCPs: {
          browser: { status: 'success', message: 'Installed' },
          context7: { status: 'success', message: 'Installed' },
        },
        configPath: '.mcp.json',
      },
      dependencies: { success: true, packageManager: 'npm' },
    };

    // When
    const validation = await validateInstallation(installationContext);

    // Then
    expect(validation.components).toHaveProperty('mcps');
  });

  it('should call progress callback during validation', async () => {
    // Given
    const installationContext = {
      files: { env: '.env' },
      configs: {},
      dependencies: { success: true },
    };

    const progressCalls = [];
    const onProgress = (status) => progressCalls.push(status);

    // When
    await validateInstallation(installationContext, onProgress);

    // Then
    expect(progressCalls.length).toBeGreaterThan(0);
    expect(progressCalls[progressCalls.length - 1].step).toBe('complete');
  });
});
