/**
 * Unit tests for health-check service checks
 *
 * Tests all 5 service checks:
 * - ApiEndpointsCheck
 * - ClaudeCodeCheck
 * - GeminiCliCheck
 * - GithubCliCheck
 * - McpIntegrationCheck
 */

jest.mock('child_process', () => ({
  execSync: jest.fn(),
}));

jest.mock('os', () => ({
  homedir: jest.fn(() => '/home/testuser'),
}));

jest.mock('https', () => ({
  request: jest.fn(),
}));

const mockFsPromises = {
  access: jest.fn(),
  readFile: jest.fn(),
  readdir: jest.fn(),
};
jest.mock('fs', () => ({
  promises: mockFsPromises,
}));

const { execSync } = require('child_process');
const os = require('os');
const https = require('https');

const ApiEndpointsCheck = require('../../.aios-core/core/health-check/checks/services/api-endpoints');
const ClaudeCodeCheck = require('../../.aios-core/core/health-check/checks/services/claude-code');
const GeminiCliCheck = require('../../.aios-core/core/health-check/checks/services/gemini-cli');
const GithubCliCheck = require('../../.aios-core/core/health-check/checks/services/github-cli');
const McpIntegrationCheck = require('../../.aios-core/core/health-check/checks/services/mcp-integration');

beforeEach(() => {
  jest.resetAllMocks();
  os.homedir.mockReturnValue('/home/testuser');
});

// ============================================================
// ApiEndpointsCheck
// ============================================================
describe('ApiEndpointsCheck', () => {
  let check;

  beforeEach(() => {
    check = new ApiEndpointsCheck();
  });

  test('constructor sets correct properties', () => {
    expect(check.id).toBe('services.api-endpoints');
    expect(check.severity).toBe('LOW');
    expect(check.domain).toBe('services');
  });

  test('execute returns pass when all endpoints reachable', async () => {
    https.request.mockImplementation((options, callback) => {
      const req = { on: jest.fn(), end: jest.fn(), destroy: jest.fn() };
      process.nextTick(() => callback({ statusCode: 200 }));
      return req;
    });

    const result = await check.execute({});

    expect(result.status).toBe('pass');
    expect(result.message).toContain('2 API endpoints reachable');
  });

  test('execute returns fail when critical endpoint unreachable', async () => {
    https.request.mockImplementation((_options, _callback) => {
      const req = {
        on: jest.fn((event, handler) => {
          if (event === 'error') {
            process.nextTick(() => handler(new Error('ECONNREFUSED')));
          }
        }),
        end: jest.fn(),
        destroy: jest.fn(),
      };
      return req;
    });

    const result = await check.execute({});

    expect(result.status).toBe('fail');
    expect(result.message).toContain('Critical API endpoint');
    expect(result.message).toContain('npm Registry');
  });

  test('execute returns warning when non-critical endpoint fails', async () => {
    https.request.mockImplementation((options, callback) => {
      if (options.hostname && options.hostname.includes('npm')) {
        // npm Registry (critical) succeeds
        const req = { on: jest.fn(), end: jest.fn(), destroy: jest.fn() };
        process.nextTick(() => callback({ statusCode: 200 }));
        return req;
      }
      // GitHub API (non-critical) fails
      const req = {
        on: jest.fn((event, handler) => {
          if (event === 'error') {
            process.nextTick(() => handler(new Error('timeout')));
          }
        }),
        end: jest.fn(),
        destroy: jest.fn(),
      };
      return req;
    });

    const result = await check.execute({});

    expect(result.status).toBe('warning');
    expect(result.message).toContain('GitHub API');
  });

  test('checkEndpoint resolves for 401/403 (auth required but reachable)', async () => {
    https.request.mockImplementation((options, callback) => {
      const req = { on: jest.fn(), end: jest.fn(), destroy: jest.fn() };
      process.nextTick(() => callback({ statusCode: 403 }));
      return req;
    });

    const time = await check.checkEndpoint('api.example.com', '/');
    expect(typeof time).toBe('number');
  });

  test('checkEndpoint rejects for server errors', async () => {
    https.request.mockImplementation((options, callback) => {
      callback({ statusCode: 500 });
      return { on: jest.fn(), end: jest.fn(), destroy: jest.fn() };
    });

    await expect(check.checkEndpoint('api.example.com', '/')).rejects.toThrow('HTTP 500');
  });

  test('getHealer returns connectivity guide', () => {
    const healer = check.getHealer();
    expect(healer.name).toBe('api-connectivity-guide');
    expect(healer.steps.length).toBeGreaterThan(0);
  });
});

// ============================================================
// ClaudeCodeCheck
// ============================================================
describe('ClaudeCodeCheck', () => {
  let check;

  beforeEach(() => {
    check = new ClaudeCodeCheck();
  });

  test('constructor sets correct properties', () => {
    expect(check.id).toBe('services.claude-code');
    expect(check.severity).toBe('LOW');
    expect(check.tags).toContain('claude');
  });

  test('execute returns pass when not using Claude Code', async () => {
    execSync.mockImplementation(() => { throw new Error('not found'); });
    mockFsPromises.access.mockRejectedValue(new Error('ENOENT'));

    const result = await check.execute({ projectRoot: '/test' });

    expect(result.status).toBe('pass');
    expect(result.message).toContain('not detected');
  });

  test('execute returns pass when fully configured', async () => {
    execSync.mockReturnValue('2.1.0');
    mockFsPromises.access.mockResolvedValue(undefined);
    mockFsPromises.readFile.mockResolvedValue('{}');

    const result = await check.execute({ projectRoot: '/test' });

    expect(result.status).toBe('pass');
    expect(result.message).toContain('CLI v2.1.0');
    expect(result.message).toContain('project config');
  });

  test('execute returns warning when project config missing', async () => {
    execSync.mockReturnValue('2.1.0');
    mockFsPromises.access.mockImplementation((path) => {
      // Only global config exists
      if (path.includes('.claude.json')) return Promise.resolve();
      return Promise.reject(new Error('ENOENT'));
    });

    const result = await check.execute({ projectRoot: '/test' });

    expect(result.status).toBe('warning');
    expect(result.message).toContain('No project-level .claude directory');
  });

  test('execute returns warning when CLAUDE.md missing', async () => {
    execSync.mockReturnValue('2.1.0');
    mockFsPromises.access.mockImplementation((p) => {
      if (p.endsWith('.claude')) return Promise.resolve();
      if (p.endsWith('CLAUDE.md')) return Promise.reject(new Error('ENOENT'));
      if (p.endsWith('.claude.json')) return Promise.resolve();
      return Promise.reject(new Error('ENOENT'));
    });

    const result = await check.execute({ projectRoot: '/test' });

    expect(result.status).toBe('warning');
    expect(result.message).toContain('CLAUDE.md not found');
  });

  test('execute detects global config', async () => {
    execSync.mockImplementation(() => { throw new Error('not found'); });
    mockFsPromises.access.mockImplementation((p) => {
      if (p.includes('.claude.json')) return Promise.resolve();
      return Promise.reject(new Error('ENOENT'));
    });

    const result = await check.execute({ projectRoot: '/test' });

    expect(result.status).toBe('warning');
    expect(result.details.globalConfig).toBe(true);
  });
});

// ============================================================
// GeminiCliCheck
// ============================================================
describe('GeminiCliCheck', () => {
  let check;

  beforeEach(() => {
    check = new GeminiCliCheck();
  });

  test('constructor sets correct properties', () => {
    expect(check.id).toBe('services.gemini-cli');
    expect(check.tags).toContain('gemini');
  });

  test('execute returns pass when not using Gemini CLI', async () => {
    execSync.mockImplementation(() => { throw new Error('not found'); });
    mockFsPromises.access.mockRejectedValue(new Error('ENOENT'));

    const result = await check.execute({ projectRoot: '/test' });

    expect(result.status).toBe('pass');
    expect(result.message).toContain('not detected');
  });

  test('execute returns pass when fully configured', async () => {
    execSync
      .mockImplementationOnce(() => '1.5.0')             // gemini --version
      .mockImplementationOnce(() => 'Authenticated as test@gmail.com')  // auth status
      .mockImplementationOnce(() => JSON.stringify([{ name: 'web-search' }]));  // extensions

    mockFsPromises.access.mockResolvedValue(undefined);
    mockFsPromises.readFile.mockImplementation((p) => {
      if (p.includes('settings.json') && p.includes('/test/')) {
        return Promise.resolve(JSON.stringify({ hooks: { preToolCall: true }, previewFeatures: true }));
      }
      if (p.includes('settings.json')) {
        return Promise.resolve(JSON.stringify({ previewFeatures: true }));
      }
      return Promise.reject(new Error('ENOENT'));
    });
    mockFsPromises.readdir.mockResolvedValue(['dev.md', 'qa.md']);

    const result = await check.execute({ projectRoot: '/test' });

    expect(result.status).toBe('pass');
    expect(result.message).toContain('CLI v1.5.0');
    expect(result.message).toContain('authenticated');
    expect(result.details.details.features.hooks).toBe(true);
    expect(result.details.details.features.extensions).toEqual(['web-search']);
  });

  test('execute returns warning when not authenticated', async () => {
    execSync
      .mockImplementationOnce(() => '1.5.0')
      .mockImplementationOnce(() => 'not authenticated');

    mockFsPromises.access.mockImplementation((p) => {
      if (p.endsWith('.gemini')) return Promise.resolve();
      if (p.endsWith('rules.md')) return Promise.resolve();
      return Promise.reject(new Error('ENOENT'));
    });
    mockFsPromises.readFile.mockImplementation((p) => {
      if (p.includes('settings.json')) {
        return Promise.resolve(JSON.stringify({ previewFeatures: true }));
      }
      return Promise.reject(new Error('ENOENT'));
    });
    mockFsPromises.readdir.mockResolvedValue(['dev.md']);

    const result = await check.execute({ projectRoot: '/test' });

    expect(result.status).toBe('warning');
    expect(result.message).toContain('Not authenticated');
  });

  test('execute returns warning when project config missing', async () => {
    execSync
      .mockImplementationOnce(() => '1.5.0')
      .mockImplementationOnce(() => 'Authenticated');

    mockFsPromises.access.mockImplementation((p) => {
      if (p.includes('/home/')) return Promise.resolve();
      return Promise.reject(new Error('ENOENT'));
    });
    mockFsPromises.readFile.mockResolvedValue(JSON.stringify({ previewFeatures: true }));

    const result = await check.execute({ projectRoot: '/test' });

    expect(result.status).toBe('warning');
    expect(result.message).toContain('No project-level .gemini');
  });

  test('execute detects preview features not enabled', async () => {
    execSync
      .mockImplementationOnce(() => '1.5.0')
      .mockImplementationOnce(() => 'Authenticated');

    mockFsPromises.access.mockResolvedValue(undefined);
    mockFsPromises.readFile.mockResolvedValue(JSON.stringify({}));
    mockFsPromises.readdir.mockResolvedValue(['dev.md']);

    const result = await check.execute({ projectRoot: '/test' });

    expect(result.status).toBe('warning');
    expect(result.message).toContain('Preview features not enabled');
  });
});

// ============================================================
// GithubCliCheck
// ============================================================
describe('GithubCliCheck', () => {
  let check;

  beforeEach(() => {
    check = new GithubCliCheck();
  });

  test('constructor sets correct properties', () => {
    expect(check.id).toBe('services.github-cli');
    expect(check.severity).toBe('MEDIUM');
  });

  test('execute returns pass when gh is installed and authenticated', async () => {
    execSync
      .mockImplementationOnce(() => 'gh version 2.40.0 (2024-01-15)')
      .mockImplementationOnce(() => 'Logged in to github.com as nikolasdehor');

    const result = await check.execute({});

    expect(result.status).toBe('pass');
    expect(result.message).toContain('v2.40.0');
    expect(result.message).toContain('nikolasdehor');
  });

  test('execute returns pass when gh is not installed (optional)', async () => {
    execSync.mockImplementation(() => { throw new Error('not found'); });

    const result = await check.execute({});

    expect(result.status).toBe('pass');
    expect(result.message).toContain('not installed (optional)');
  });

  test('execute returns warning when gh is installed but not authenticated', async () => {
    execSync
      .mockImplementationOnce(() => 'gh version 2.40.0')
      .mockImplementationOnce(() => { throw new Error('not logged in'); });

    const result = await check.execute({});

    expect(result.status).toBe('warning');
    expect(result.message).toContain('not authenticated');
    expect(result.recommendation).toContain('gh auth login');
  });

  test('execute handles version without semver match', async () => {
    execSync
      .mockImplementationOnce(() => 'gh version unknown-dev')
      .mockImplementationOnce(() => 'Logged in to github.com as user');

    const result = await check.execute({});

    expect(result.status).toBe('pass');
    expect(result.details.details.version).toBe('unknown');
  });

  test('execute extracts username from auth status', async () => {
    execSync
      .mockImplementationOnce(() => 'gh version 2.40.0')
      .mockImplementationOnce(() => 'Logged in to github.com as testuser (oauth_token)');

    const result = await check.execute({});

    expect(result.details.details.user).toBe('testuser');
  });

  test('getHealer returns setup guide', () => {
    const healer = check.getHealer();
    expect(healer.name).toBe('github-cli-setup');
    expect(healer.documentation).toContain('cli.github.com');
  });
});

// ============================================================
// McpIntegrationCheck
// ============================================================
describe('McpIntegrationCheck', () => {
  let check;

  beforeEach(() => {
    check = new McpIntegrationCheck();
  });

  test('constructor sets correct properties', () => {
    expect(check.id).toBe('services.mcp-integration');
    expect(check.tags).toContain('mcp');
  });

  test('execute returns pass when no MCP config found', async () => {
    mockFsPromises.readFile.mockRejectedValue(new Error('ENOENT'));

    const result = await check.execute({ projectRoot: '/test' });

    expect(result.status).toBe('pass');
    expect(result.message).toContain('No MCP configuration found');
  });

  test('execute returns pass when MCP configured with servers', async () => {
    mockFsPromises.readFile.mockImplementation((p) => {
      if (p.includes('.mcp.json')) {
        return Promise.resolve(JSON.stringify({
          mcpServers: { playwright: {}, exa: {} },
        }));
      }
      return Promise.reject(new Error('ENOENT'));
    });

    const result = await check.execute({ projectRoot: '/test' });

    expect(result.status).toBe('pass');
    expect(result.message).toContain('2 server(s)');
    expect(result.details.details.servers).toContain('playwright (project)');
    expect(result.details.details.servers).toContain('exa (project)');
  });

  test('execute returns warning when config found but no servers', async () => {
    mockFsPromises.readFile.mockImplementation((p) => {
      if (p.includes('.mcp.json')) {
        return Promise.resolve(JSON.stringify({}));
      }
      return Promise.reject(new Error('ENOENT'));
    });

    const result = await check.execute({ projectRoot: '/test' });

    expect(result.status).toBe('warning');
    expect(result.message).toContain('no servers defined');
  });

  test('execute detects global Claude config MCP servers', async () => {
    mockFsPromises.readFile.mockImplementation((p) => {
      if (p.includes('.claude.json')) {
        return Promise.resolve(JSON.stringify({
          mcpServers: { 'desktop-commander': {} },
        }));
      }
      return Promise.reject(new Error('ENOENT'));
    });

    const result = await check.execute({ projectRoot: '/test' });

    expect(result.status).toBe('pass');
    expect(result.details.details.servers).toContain('desktop-commander (global)');
  });

  test('execute detects local .claude/settings.json MCP servers', async () => {
    mockFsPromises.readFile.mockImplementation((p) => {
      if (p.includes('settings.json')) {
        return Promise.resolve(JSON.stringify({
          mcpServers: { context7: {} },
        }));
      }
      return Promise.reject(new Error('ENOENT'));
    });

    const result = await check.execute({ projectRoot: '/test' });

    expect(result.status).toBe('pass');
    expect(result.details.details.servers).toContain('context7 (local)');
  });

  test('execute merges servers from multiple configs', async () => {
    mockFsPromises.readFile.mockImplementation((p) => {
      if (p.includes('.mcp.json')) {
        return Promise.resolve(JSON.stringify({ mcpServers: { playwright: {} } }));
      }
      if (p.includes('.claude.json')) {
        return Promise.resolve(JSON.stringify({ mcpServers: { exa: {} } }));
      }
      if (p.includes('settings.json')) {
        return Promise.resolve(JSON.stringify({ mcpServers: { context7: {} } }));
      }
      return Promise.reject(new Error('ENOENT'));
    });

    const result = await check.execute({ projectRoot: '/test' });

    expect(result.status).toBe('pass');
    expect(result.details.details.serverCount).toBe(3);
  });
});
