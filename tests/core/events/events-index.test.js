/**
 * Tests for events/index.js facade module
 *
 * Validates that the events index correctly re-exports
 * DashboardEventType, DashboardEmitter, and getDashboardEmitter
 * from their respective source modules.
 */

'use strict';

jest.mock('../../../.aios-core/core/events/types', () => ({
  DashboardEventType: { AGENT_START: 'agent:start', TASK_COMPLETE: 'task:complete' },
}));
jest.mock('../../../.aios-core/core/events/dashboard-emitter', () => ({
  DashboardEmitter: class DashboardEmitter {},
  getDashboardEmitter: jest.fn(() => ({})),
}));

const eventsIndex = require('../../../.aios-core/core/events/index');

describe('events/index facade', () => {
  describe('exported members', () => {
    it('should export DashboardEventType', () => {
      expect(eventsIndex.DashboardEventType).toBeDefined();
    });

    it('should export DashboardEmitter', () => {
      expect(eventsIndex.DashboardEmitter).toBeDefined();
    });

    it('should export getDashboardEmitter', () => {
      expect(eventsIndex.getDashboardEmitter).toBeDefined();
    });

    it('should export exactly 3 members', () => {
      const keys = Object.keys(eventsIndex);
      expect(keys).toHaveLength(3);
      expect(keys).toEqual(
        expect.arrayContaining(['DashboardEventType', 'DashboardEmitter', 'getDashboardEmitter']),
      );
    });
  });

  describe('DashboardEventType', () => {
    it('should be a plain object', () => {
      expect(typeof eventsIndex.DashboardEventType).toBe('object');
      expect(eventsIndex.DashboardEventType).not.toBeNull();
    });

    it('should contain expected event type keys', () => {
      expect(eventsIndex.DashboardEventType).toHaveProperty('AGENT_START');
      expect(eventsIndex.DashboardEventType).toHaveProperty('TASK_COMPLETE');
    });

    it('should have string values for event types', () => {
      expect(typeof eventsIndex.DashboardEventType.AGENT_START).toBe('string');
      expect(typeof eventsIndex.DashboardEventType.TASK_COMPLETE).toBe('string');
    });
  });

  describe('DashboardEmitter', () => {
    it('should be a constructor (class/function)', () => {
      expect(typeof eventsIndex.DashboardEmitter).toBe('function');
    });

    it('should be instantiable with new', () => {
      const instance = new eventsIndex.DashboardEmitter();
      expect(instance).toBeDefined();
      expect(instance).toBeInstanceOf(eventsIndex.DashboardEmitter);
    });
  });

  describe('getDashboardEmitter', () => {
    it('should be a function', () => {
      expect(typeof eventsIndex.getDashboardEmitter).toBe('function');
    });

    it('should return an object when called', () => {
      const result = eventsIndex.getDashboardEmitter();
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });
  });
});
