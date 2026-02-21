/**
 * Unit tests for DockerConfigCheck
 *
 * Tests Docker configuration detection: Dockerfile, docker-compose,
 * .dockerignore, Docker CLI availability, and Dockerfile validation.
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const DockerConfigCheck = require('../../../../../.aios-core/core/health-check/checks/deployment/docker-config');

jest.mock('child_process');
jest.mock('path');
jest.mock('fs', () => ({
  promises: {
    access: jest.fn(),
    readFile: jest.fn(),
  },
}));

describe('DockerConfigCheck', () => {
  let check;

  beforeEach(() => {
    jest.resetAllMocks();
    path.join.mockImplementation((...args) => args.join('/'));
    check = new DockerConfigCheck();
  });

  describe('constructor', () => {
    test('has correct id', () => {
      expect(check.id).toBe('deployment.docker-config');
    });

    test('has INFO severity', () => {
      expect(check.severity).toBe('INFO');
    });
  });

  describe('execute - no docker', () => {
    test('passes when no Docker files found', async () => {
      fs.access.mockRejectedValue(new Error('ENOENT'));
      execSync.mockImplementation(() => { throw new Error('not found'); });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('not using Docker');
    });
  });

  describe('execute - valid config', () => {
    test('passes with Dockerfile and .dockerignore', async () => {
      fs.access.mockImplementation((p) => {
        if (p.includes('Dockerfile') || p.includes('.dockerignore')) {
          return Promise.resolve(undefined);
        }
        return Promise.reject(new Error('ENOENT'));
      });
      fs.readFile.mockResolvedValue('FROM node:18\nUSER node\nCOPY . .\n');
      execSync.mockReturnValue('Docker version 24.0.0');

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('Dockerfile');
    });
  });

  describe('execute - missing FROM', () => {
    test('warns when Dockerfile has no FROM', async () => {
      fs.access.mockImplementation((p) => {
        if (p.includes('Dockerfile') || p.includes('.dockerignore')) {
          return Promise.resolve(undefined);
        }
        return Promise.reject(new Error('ENOENT'));
      });
      fs.readFile.mockResolvedValue('COPY . .\nRUN npm install\n');
      execSync.mockImplementation(() => { throw new Error('not found'); });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.message).toContain('FROM');
    });
  });

  describe('execute - running as root', () => {
    test('warns when Dockerfile may run as root', async () => {
      fs.access.mockImplementation((p) => {
        if (p.includes('Dockerfile') || p.includes('.dockerignore')) {
          return Promise.resolve(undefined);
        }
        return Promise.reject(new Error('ENOENT'));
      });
      fs.readFile.mockResolvedValue('FROM node:18\nRUN chown root /app\n');
      execSync.mockImplementation(() => { throw new Error('not found'); });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.message).toContain('root');
    });
  });

  describe('execute - missing .dockerignore', () => {
    test('warns when Dockerfile exists but no .dockerignore', async () => {
      fs.access.mockImplementation((p) => {
        if (p.includes('Dockerfile') && !p.includes('.dockerignore')) {
          return Promise.resolve(undefined);
        }
        return Promise.reject(new Error('ENOENT'));
      });
      fs.readFile.mockResolvedValue('FROM node:18\nUSER node\n');
      execSync.mockImplementation(() => { throw new Error('not found'); });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.message).toContain('.dockerignore');
    });
  });
});
