/**
 * Unit tests for MCP index facade module.
 *
 * Validates that the barrel file correctly re-exports all symbols from
 * os-detector, global-config-manager, symlink-manager, and config-migrator
 * both as spread (top-level) exports and as namespaced objects.
 */

jest.mock('../../../.aios-core/core/mcp/os-detector', () => ({
  isWindows: jest.fn(() => false),
  getGlobalAiosDir: jest.fn(() => '/home/.aios'),
}));
jest.mock('../../../.aios-core/core/mcp/global-config-manager', () => ({
  loadGlobalConfig: jest.fn(() => ({})),
  saveGlobalConfig: jest.fn(),
}));
jest.mock('../../../.aios-core/core/mcp/symlink-manager', () => ({
  LINK_STATUS: { LINKED: 'linked' },
  createLink: jest.fn(),
}));
jest.mock('../../../.aios-core/core/mcp/config-migrator', () => ({
  migrateConfig: jest.fn(),
  MIGRATION_VERSION: '2.0',
}));

const mcpIndex = require('../../../.aios-core/core/mcp/index');

describe('MCP index facade (core/mcp/index)', () => {
  describe('spread exports (top-level)', () => {
    it('exports isWindows from os-detector', () => {
      expect(mcpIndex.isWindows).toBeDefined();
      expect(typeof mcpIndex.isWindows).toBe('function');
      expect(mcpIndex.isWindows()).toBe(false);
    });

    it('exports getGlobalAiosDir from os-detector', () => {
      expect(mcpIndex.getGlobalAiosDir).toBeDefined();
      expect(typeof mcpIndex.getGlobalAiosDir).toBe('function');
      expect(mcpIndex.getGlobalAiosDir()).toBe('/home/.aios');
    });

    it('exports loadGlobalConfig from global-config-manager', () => {
      expect(mcpIndex.loadGlobalConfig).toBeDefined();
      expect(typeof mcpIndex.loadGlobalConfig).toBe('function');
      expect(mcpIndex.loadGlobalConfig()).toEqual({});
    });

    it('exports saveGlobalConfig from global-config-manager', () => {
      expect(mcpIndex.saveGlobalConfig).toBeDefined();
      expect(typeof mcpIndex.saveGlobalConfig).toBe('function');
    });

    it('exports LINK_STATUS from symlink-manager', () => {
      expect(mcpIndex.LINK_STATUS).toBeDefined();
      expect(mcpIndex.LINK_STATUS).toEqual({ LINKED: 'linked' });
    });

    it('exports createLink from symlink-manager', () => {
      expect(mcpIndex.createLink).toBeDefined();
      expect(typeof mcpIndex.createLink).toBe('function');
    });

    it('exports migrateConfig from config-migrator', () => {
      expect(mcpIndex.migrateConfig).toBeDefined();
      expect(typeof mcpIndex.migrateConfig).toBe('function');
    });

    it('exports MIGRATION_VERSION from config-migrator', () => {
      expect(mcpIndex.MIGRATION_VERSION).toBeDefined();
      expect(mcpIndex.MIGRATION_VERSION).toBe('2.0');
    });
  });

  describe('namespaced exports', () => {
    it('exports osDetector namespace object', () => {
      expect(mcpIndex.osDetector).toBeDefined();
      expect(typeof mcpIndex.osDetector).toBe('object');
    });

    it('exports globalConfigManager namespace object', () => {
      expect(mcpIndex.globalConfigManager).toBeDefined();
      expect(typeof mcpIndex.globalConfigManager).toBe('object');
    });

    it('exports symlinkManager namespace object', () => {
      expect(mcpIndex.symlinkManager).toBeDefined();
      expect(typeof mcpIndex.symlinkManager).toBe('object');
    });

    it('exports configMigrator namespace object', () => {
      expect(mcpIndex.configMigrator).toBeDefined();
      expect(typeof mcpIndex.configMigrator).toBe('object');
    });
  });

  describe('namespace-to-spread consistency', () => {
    it('osDetector namespace contains the same functions as spread exports', () => {
      expect(mcpIndex.osDetector.isWindows).toBe(mcpIndex.isWindows);
      expect(mcpIndex.osDetector.getGlobalAiosDir).toBe(mcpIndex.getGlobalAiosDir);
    });

    it('globalConfigManager namespace contains the same functions as spread exports', () => {
      expect(mcpIndex.globalConfigManager.loadGlobalConfig).toBe(mcpIndex.loadGlobalConfig);
      expect(mcpIndex.globalConfigManager.saveGlobalConfig).toBe(mcpIndex.saveGlobalConfig);
    });

    it('symlinkManager namespace contains the same symbols as spread exports', () => {
      expect(mcpIndex.symlinkManager.LINK_STATUS).toBe(mcpIndex.LINK_STATUS);
      expect(mcpIndex.symlinkManager.createLink).toBe(mcpIndex.createLink);
    });

    it('configMigrator namespace contains the same symbols as spread exports', () => {
      expect(mcpIndex.configMigrator.migrateConfig).toBe(mcpIndex.migrateConfig);
      expect(mcpIndex.configMigrator.MIGRATION_VERSION).toBe(mcpIndex.MIGRATION_VERSION);
    });
  });
});
