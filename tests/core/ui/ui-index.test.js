'use strict';

jest.mock('../../../.aios-core/core/ui/observability-panel', () => ({
  ObservabilityPanel: class ObservabilityPanel {},
  createPanel: jest.fn(() => ({})),
  PanelMode: { COMPACT: 'compact', FULL: 'full' },
  PipelineStage: { INIT: 'init', RUN: 'run' },
  createDefaultState: jest.fn(() => ({})),
}));

jest.mock('../../../.aios-core/core/ui/panel-renderer', () => ({
  PanelRenderer: class PanelRenderer {},
  BOX: { TOP_LEFT: '+' },
  STATUS: { OK: 'ok' },
}));

const uiIndex = require('../../../.aios-core/core/ui/index');

describe('ui/index facade module', () => {
  const expectedExports = [
    'ObservabilityPanel',
    'createPanel',
    'PanelMode',
    'PipelineStage',
    'createDefaultState',
    'PanelRenderer',
    'BOX',
    'STATUS',
  ];

  describe('all exports are defined', () => {
    it.each(expectedExports)('should export %s as truthy', (name) => {
      expect(uiIndex[name]).toBeTruthy();
    });

    it('should export exactly 8 members', () => {
      expect(Object.keys(uiIndex)).toHaveLength(8);
    });
  });

  describe('constructors', () => {
    it('ObservabilityPanel should be a constructor', () => {
      expect(typeof uiIndex.ObservabilityPanel).toBe('function');
      const instance = new uiIndex.ObservabilityPanel();
      expect(instance).toBeInstanceOf(uiIndex.ObservabilityPanel);
    });

    it('PanelRenderer should be a constructor', () => {
      expect(typeof uiIndex.PanelRenderer).toBe('function');
      const instance = new uiIndex.PanelRenderer();
      expect(instance).toBeInstanceOf(uiIndex.PanelRenderer);
    });
  });

  describe('factory functions', () => {
    it('createPanel should be a function', () => {
      expect(typeof uiIndex.createPanel).toBe('function');
    });

    it('createDefaultState should be a function', () => {
      expect(typeof uiIndex.createDefaultState).toBe('function');
    });
  });

  describe('enum/config objects', () => {
    it('PanelMode should be a plain object', () => {
      expect(typeof uiIndex.PanelMode).toBe('object');
      expect(uiIndex.PanelMode).not.toBeNull();
      expect(Array.isArray(uiIndex.PanelMode)).toBe(false);
    });

    it('PipelineStage should be a plain object', () => {
      expect(typeof uiIndex.PipelineStage).toBe('object');
      expect(uiIndex.PipelineStage).not.toBeNull();
      expect(Array.isArray(uiIndex.PipelineStage)).toBe(false);
    });

    it('BOX should be a plain object', () => {
      expect(typeof uiIndex.BOX).toBe('object');
      expect(uiIndex.BOX).not.toBeNull();
      expect(Array.isArray(uiIndex.BOX)).toBe(false);
    });

    it('STATUS should be a plain object', () => {
      expect(typeof uiIndex.STATUS).toBe('object');
      expect(uiIndex.STATUS).not.toBeNull();
      expect(Array.isArray(uiIndex.STATUS)).toBe(false);
    });
  });
});
