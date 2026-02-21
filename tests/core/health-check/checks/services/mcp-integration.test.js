/**
 * Unit tests for McpIntegrationCheck
 *
 * Tests MCP server configuration detection: project config, global config,
 * local settings, server counting, and edge cases.
 */

const fs = require('fs').promises;
const os = require('os');
const McpIntegrationCheck = require('../../../../../.aios-core/core/health-check/checks/services/mcp-integration');

jest.mock('os');
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
  },
}));

describe('McpIntegrationCheck', () => {
  let check;

  beforeEach(() => {
    jest.resetAllMocks();
    os.homedir.mockReturnValue('/home/user');
    check = new McpIntegrationCheck();
  });

  describe('constructor', () => {
    test('has correct id', () => {
      expect(check.id).toBe('services.mcp-integration');
    });

    test('has MEDIUM severity', () => {
      expect(check.severity).toBe('MEDIUM');
    });
  });

  describe('execute - no MCP', () => {
    test('passes when no MCP config found', async () => {
      fs.readFile.mockRejectedValue(new Error('ENOENT'));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('not using MCP');
    });
  });

  describe('execute - configured', () => {
    test('passes with servers configured', async () => {
      fs.readFile.mockImplementation((filePath) => {
        if (filePath.includes('.mcp.json')) {
          return Promise.resolve(JSON.stringify({
            mcpServers: { playwright: {}, exa: {} }
          }));
        }
        return Promise.reject(new Error('ENOENT'));
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('2 server');
    });
  });

  describe('execute - warning', () => {
    test('warns when config found but no servers', async () => {
      fs.readFile.mockImplementation((filePath) => {
        if (filePath.includes('.mcp.json')) {
          return Promise.resolve(JSON.stringify({}));
        }
        return Promise.reject(new Error('ENOENT'));
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.message).toContain('no servers');
    });
  });

  describe('execute - multiple configs', () => {
    test('aggregates servers from multiple config files', async () => {
      fs.readFile.mockImplementation((filePath) => {
        if (filePath.includes('.mcp.json')) {
          return Promise.resolve(JSON.stringify({ mcpServers: { playwright: {} } }));
        }
        if (filePath.includes('.claude.json')) {
          return Promise.resolve(JSON.stringify({ mcpServers: { exa: {} } }));
        }
        return Promise.reject(new Error('ENOENT'));
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('2 server');
    });
  });
});
