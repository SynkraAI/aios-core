/**
 * Unit tests for EnvFileCheck
 *
 * Tests .env file detection: main, example, local env files,
 * variable counting, missing example warning, and var mismatch.
 */

const fs = require('fs').promises;
const path = require('path');
const EnvFileCheck = require('../../../../../.aios-core/core/health-check/checks/deployment/env-file');

jest.mock('path');
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
  },
}));

describe('EnvFileCheck', () => {
  let check;

  beforeEach(() => {
    jest.resetAllMocks();
    path.join.mockImplementation((...args) => args.join('/'));
    check = new EnvFileCheck();
  });

  describe('constructor', () => {
    test('has correct id', () => {
      expect(check.id).toBe('deployment.env-file');
    });

    test('has HIGH severity', () => {
      expect(check.severity).toBe('HIGH');
    });
  });

  describe('execute - no env files', () => {
    test('passes when no .env files found', async () => {
      fs.readFile.mockRejectedValue(new Error('ENOENT'));

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('No .env files');
    });
  });

  describe('execute - properly configured', () => {
    test('passes with .env and .env.example', async () => {
      fs.readFile.mockImplementation((p) => {
        if (p.includes('.env.example')) return Promise.resolve('DB_HOST=\nDB_PORT=\n');
        if (p.includes('.env.local')) return Promise.reject(new Error('ENOENT'));
        if (p.includes('.env')) return Promise.resolve('DB_HOST=localhost\nDB_PORT=5432\n');
        return Promise.reject(new Error('ENOENT'));
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('.env');
    });
  });

  describe('execute - missing example', () => {
    test('warns when .env exists but .env.example missing', async () => {
      fs.readFile.mockImplementation((p) => {
        if (p.endsWith('.env')) return Promise.resolve('SECRET=abc\n');
        return Promise.reject(new Error('ENOENT'));
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.message).toContain('.env.example');
    });
  });

  describe('execute - var mismatch', () => {
    test('warns when .env has fewer vars than .env.example', async () => {
      fs.readFile.mockImplementation((p) => {
        if (p.includes('.env.example')) return Promise.resolve('A=\nB=\nC=\n');
        if (p.includes('.env.local')) return Promise.reject(new Error('ENOENT'));
        if (p.includes('.env')) return Promise.resolve('A=1\n');
        return Promise.reject(new Error('ENOENT'));
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.message).toContain('missing');
      expect(result.message).toContain('2');
    });
  });

  describe('execute - comments and blank lines', () => {
    test('ignores comments and blank lines', async () => {
      fs.readFile.mockImplementation((p) => {
        if (p.includes('.env.example')) return Promise.resolve('# comment\nKEY=\n\n');
        if (p.includes('.env.local')) return Promise.reject(new Error('ENOENT'));
        if (p.includes('.env')) return Promise.resolve('# comment\nKEY=val\n\n');
        return Promise.reject(new Error('ENOENT'));
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
    });
  });
});
