/**
 * Unit tests for global-config-manager
 *
 * Tests global MCP config management: directory/config existence checks,
 * structure creation, config CRUD, server add/remove/enable, listing,
 * and templates.
 */

jest.mock('fs');
jest.mock('../../../.aios-core/core/mcp/os-detector', () => ({
  getGlobalAiosDir: () => '/home/user/.aios',
  getGlobalMcpDir: () => '/home/user/.aios/mcp',
  getGlobalConfigPath: () => '/home/user/.aios/mcp/global-config.json',
  getServersDir: () => '/home/user/.aios/mcp/servers',
  getCacheDir: () => '/home/user/.aios/mcp/cache',
  getCredentialsDir: () => '/home/user/.aios/credentials',
}));

const fs = require('fs');

const {
  DEFAULT_CONFIG,
  SERVER_TEMPLATES,
  globalDirExists,
  globalMcpDirExists,
  globalConfigExists,
  createGlobalStructure,
  createGlobalConfig,
  readGlobalConfig,
  writeGlobalConfig,
  addServer,
  removeServer,
  setServerEnabled,
  listServers,
  getAvailableTemplates,
  getServerTemplate,
} = require('../../../.aios-core/core/mcp/global-config-manager');

describe('global-config-manager', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    console.error.mockRestore();
    console.warn.mockRestore();
  });

  describe('DEFAULT_CONFIG', () => {
    test('has version and servers', () => {
      expect(DEFAULT_CONFIG.version).toBe('1.0');
      expect(DEFAULT_CONFIG.servers).toEqual({});
      expect(DEFAULT_CONFIG.defaults.timeout).toBe(30000);
    });
  });

  describe('SERVER_TEMPLATES', () => {
    test('includes common MCP servers', () => {
      expect(SERVER_TEMPLATES.context7).toBeDefined();
      expect(SERVER_TEMPLATES.exa).toBeDefined();
      expect(SERVER_TEMPLATES.github).toBeDefined();
      expect(SERVER_TEMPLATES.puppeteer).toBeDefined();
    });

    test('context7 uses SSE type', () => {
      expect(SERVER_TEMPLATES.context7.type).toBe('sse');
    });
  });

  describe('existence checks', () => {
    test('globalDirExists checks .aios directory', () => {
      fs.existsSync.mockReturnValue(true);
      expect(globalDirExists()).toBe(true);
      expect(fs.existsSync).toHaveBeenCalledWith('/home/user/.aios');
    });

    test('globalMcpDirExists checks mcp directory', () => {
      fs.existsSync.mockReturnValue(false);
      expect(globalMcpDirExists()).toBe(false);
    });

    test('globalConfigExists checks config file', () => {
      fs.existsSync.mockReturnValue(true);
      expect(globalConfigExists()).toBe(true);
    });
  });

  describe('createGlobalStructure', () => {
    test('creates all directories when none exist', () => {
      fs.existsSync.mockReturnValue(false);
      fs.mkdirSync.mockImplementation(() => {});
      fs.writeFileSync.mockImplementation(() => {});
      const result = createGlobalStructure();
      expect(result.success).toBe(true);
      expect(result.created.length).toBeGreaterThan(0);
    });

    test('skips existing directories', () => {
      fs.existsSync.mockReturnValue(true);
      const result = createGlobalStructure();
      expect(result.success).toBe(true);
      expect(result.created).toEqual([]);
    });

    test('reports errors on mkdir failure', () => {
      fs.existsSync.mockReturnValue(false);
      fs.mkdirSync.mockImplementation(() => { throw new Error('permission denied'); });
      fs.writeFileSync.mockImplementation(() => { throw new Error('permission denied'); });
      const result = createGlobalStructure();
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('createGlobalConfig', () => {
    test('creates config file when not exists', () => {
      fs.existsSync.mockReturnValue(false);
      fs.writeFileSync.mockImplementation(() => {});
      const result = createGlobalConfig();
      expect(result.success).toBe(true);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    test('returns error when config already exists', () => {
      fs.existsSync.mockReturnValue(true);
      const result = createGlobalConfig();
      expect(result.success).toBe(false);
      expect(result.error).toContain('already exists');
    });

    test('accepts initial servers', () => {
      fs.existsSync.mockReturnValue(false);
      fs.writeFileSync.mockImplementation(() => {});
      createGlobalConfig({ myserver: { command: 'node' } });
      const written = JSON.parse(fs.writeFileSync.mock.calls[0][1]);
      expect(written.servers.myserver).toBeDefined();
    });

    test('handles write error', () => {
      fs.existsSync.mockReturnValue(false);
      fs.writeFileSync.mockImplementation(() => { throw new Error('disk full'); });
      const result = createGlobalConfig();
      expect(result.success).toBe(false);
    });
  });

  describe('readGlobalConfig', () => {
    test('reads and parses config file', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({ version: '1.0', servers: {} }));
      const config = readGlobalConfig();
      expect(config.version).toBe('1.0');
    });

    test('returns null when file not exists', () => {
      fs.existsSync.mockReturnValue(false);
      expect(readGlobalConfig()).toBeNull();
    });

    test('returns null on parse error', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('invalid json');
      expect(readGlobalConfig()).toBeNull();
    });
  });

  describe('writeGlobalConfig', () => {
    test('writes config to file', () => {
      fs.writeFileSync.mockImplementation(() => {});
      const result = writeGlobalConfig({ version: '1.0' });
      expect(result.success).toBe(true);
    });

    test('handles write error', () => {
      fs.writeFileSync.mockImplementation(() => { throw new Error('disk full'); });
      const result = writeGlobalConfig({});
      expect(result.success).toBe(false);
    });
  });

  describe('addServer', () => {
    test('adds server with template', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({ servers: {} }));
      fs.writeFileSync.mockImplementation(() => {});
      const result = addServer('context7');
      expect(result.success).toBe(true);
      expect(result.server).toBe('context7');
    });

    test('adds server with custom config', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({ servers: {} }));
      fs.writeFileSync.mockImplementation(() => {});
      const result = addServer('custom', { command: 'node', args: ['server.js'] });
      expect(result.success).toBe(true);
    });

    test('fails when config not found', () => {
      fs.existsSync.mockReturnValue(false);
      const result = addServer('context7');
      expect(result.success).toBe(false);
    });

    test('fails when server already exists', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({ servers: { context7: {} } }));
      const result = addServer('context7');
      expect(result.success).toBe(false);
      expect(result.error).toContain('already exists');
    });

    test('fails when no template and no config', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({ servers: {} }));
      const result = addServer('unknown-server');
      expect(result.success).toBe(false);
      expect(result.error).toContain('No template');
    });
  });

  describe('removeServer', () => {
    test('removes existing server', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({ servers: { myserver: {} } }));
      fs.writeFileSync.mockImplementation(() => {});
      fs.unlinkSync.mockImplementation(() => {});
      const result = removeServer('myserver');
      expect(result.success).toBe(true);
    });

    test('fails when config not found', () => {
      fs.existsSync.mockReturnValue(false);
      const result = removeServer('myserver');
      expect(result.success).toBe(false);
    });

    test('fails when server not in config', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({ servers: {} }));
      const result = removeServer('nonexistent');
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('setServerEnabled', () => {
    test('enables a server', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({ servers: { myserver: { enabled: false } } }));
      fs.writeFileSync.mockImplementation(() => {});
      const result = setServerEnabled('myserver', true);
      expect(result.success).toBe(true);
    });

    test('fails when config not found', () => {
      fs.existsSync.mockReturnValue(false);
      const result = setServerEnabled('myserver', true);
      expect(result.success).toBe(false);
    });

    test('fails when server not found', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({ servers: {} }));
      const result = setServerEnabled('nonexistent', true);
      expect(result.success).toBe(false);
    });
  });

  describe('listServers', () => {
    test('lists configured servers', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({
        servers: {
          context7: { type: 'sse', url: 'https://mcp.context7.com/sse', enabled: true },
          exa: { command: 'npx', enabled: false },
        },
      }));
      const result = listServers();
      expect(result.total).toBe(2);
      expect(result.enabled).toBe(1);
      expect(result.servers[0].name).toBe('context7');
    });

    test('returns empty list when no config', () => {
      fs.existsSync.mockReturnValue(false);
      const result = listServers();
      expect(result.total).toBe(0);
      expect(result.servers).toEqual([]);
    });
  });

  describe('getAvailableTemplates', () => {
    test('returns template names', () => {
      const templates = getAvailableTemplates();
      expect(templates).toContain('context7');
      expect(templates).toContain('exa');
      expect(templates).toContain('github');
    });
  });

  describe('getServerTemplate', () => {
    test('returns template for known server', () => {
      const template = getServerTemplate('context7');
      expect(template).toBeDefined();
      expect(template.type).toBe('sse');
    });

    test('returns null for unknown server', () => {
      expect(getServerTemplate('nonexistent')).toBeNull();
    });

    test('returns a copy, not the original', () => {
      const t1 = getServerTemplate('exa');
      const t2 = getServerTemplate('exa');
      expect(t1).not.toBe(t2);
      expect(t1).toEqual(t2);
    });
  });
});
