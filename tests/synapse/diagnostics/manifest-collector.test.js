/**
 * Tests for Manifest Collector
 * @see .aios-core/core/synapse/diagnostics/collectors/manifest-collector.js
 */

'use strict';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readdirSync: jest.fn().mockReturnValue([]),
  statSync: jest.fn().mockReturnValue({ isDirectory: () => false }),
}));

jest.mock('../../../.aios-core/core/synapse/domain/domain-loader', () => ({
  parseManifest: jest.fn().mockReturnValue({ domains: {} }),
}));

const fs = require('fs');
const { parseManifest } = require('../../../.aios-core/core/synapse/domain/domain-loader');
const { collectManifestIntegrity } = require('../../../.aios-core/core/synapse/diagnostics/collectors/manifest-collector');

describe('collectManifestIntegrity', () => {
  const ROOT = '/test/project';

  beforeEach(() => {
    jest.clearAllMocks();
    fs.existsSync.mockReturnValue(false);
    fs.readdirSync.mockReturnValue([]);
    parseManifest.mockReturnValue({ domains: {} });
  });

  it('should return entries and orphanedFiles arrays', () => {
    const result = collectManifestIntegrity(ROOT);
    expect(result).toHaveProperty('entries');
    expect(result).toHaveProperty('orphanedFiles');
    expect(Array.isArray(result.entries)).toBe(true);
    expect(Array.isArray(result.orphanedFiles)).toBe(true);
  });

  it('should return empty entries when no domains in manifest', () => {
    const result = collectManifestIntegrity(ROOT);
    expect(result.entries).toHaveLength(0);
  });

  it('should PASS when domain file exists', () => {
    parseManifest.mockReturnValue({
      domains: {
        constitution: { file: 'constitution.md', state: 'active' },
      },
    });
    fs.existsSync.mockReturnValue(true);

    const result = collectManifestIntegrity(ROOT);
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].status).toBe('PASS');
    expect(result.entries[0].fileExists).toBe(true);
  });

  it('should FAIL when domain file is missing', () => {
    parseManifest.mockReturnValue({
      domains: {
        constitution: { file: 'constitution.md', state: 'active' },
      },
    });
    fs.existsSync.mockReturnValue(false);

    const result = collectManifestIntegrity(ROOT);
    expect(result.entries[0].status).toBe('FAIL');
    expect(result.entries[0].fileExists).toBe(false);
  });

  it('should include trigger info in inManifest field', () => {
    parseManifest.mockReturnValue({
      domains: {
        agent: { file: 'agent.md', state: 'active', agentTrigger: 'dev' },
      },
    });
    fs.existsSync.mockReturnValue(true);

    const result = collectManifestIntegrity(ROOT);
    expect(result.entries[0].inManifest).toContain('trigger=dev');
  });

  it('should include ALWAYS_ON flag', () => {
    parseManifest.mockReturnValue({
      domains: {
        global: { file: 'global.md', state: 'active', alwaysOn: true },
      },
    });
    fs.existsSync.mockReturnValue(true);

    const result = collectManifestIntegrity(ROOT);
    expect(result.entries[0].inManifest).toContain('ALWAYS_ON');
  });

  it('should detect orphaned files not in manifest', () => {
    parseManifest.mockReturnValue({ domains: {} });
    fs.readdirSync.mockReturnValue(['orphan.md', 'manifest', '.gitignore']);
    fs.statSync.mockReturnValue({ isDirectory: () => false });

    const result = collectManifestIntegrity(ROOT);
    expect(result.orphanedFiles).toContain('orphan.md');
  });

  it('should not flag manifest file as orphaned', () => {
    parseManifest.mockReturnValue({ domains: {} });
    fs.readdirSync.mockReturnValue(['manifest']);
    fs.statSync.mockReturnValue({ isDirectory: () => false });

    const result = collectManifestIntegrity(ROOT);
    expect(result.orphanedFiles).not.toContain('manifest');
  });

  it('should not flag .gitignore as orphaned', () => {
    parseManifest.mockReturnValue({ domains: {} });
    fs.readdirSync.mockReturnValue(['.gitignore']);

    const result = collectManifestIntegrity(ROOT);
    expect(result.orphanedFiles).not.toContain('.gitignore');
  });

  it('should not flag directories as orphaned', () => {
    parseManifest.mockReturnValue({ domains: {} });
    fs.readdirSync.mockReturnValue(['sessions']);
    fs.statSync.mockReturnValue({ isDirectory: () => true });

    const result = collectManifestIntegrity(ROOT);
    expect(result.orphanedFiles).not.toContain('sessions');
  });

  it('should handle readdir errors gracefully', () => {
    parseManifest.mockReturnValue({ domains: {} });
    fs.readdirSync.mockImplementation(() => { throw new Error('ENOENT'); });

    const result = collectManifestIntegrity(ROOT);
    expect(result.orphanedFiles).toEqual([]);
  });

  it('should not flag known domain files as orphaned', () => {
    parseManifest.mockReturnValue({
      domains: { constitution: { file: 'constitution.md', state: 'active' } },
    });
    fs.existsSync.mockReturnValue(true);
    fs.readdirSync.mockReturnValue(['constitution.md']);
    fs.statSync.mockReturnValue({ isDirectory: () => false });

    const result = collectManifestIntegrity(ROOT);
    expect(result.orphanedFiles).toEqual([]);
  });
});
