/**
 * Unit tests for events/types
 *
 * Tests DashboardEventType enum values and completeness.
 */

const { DashboardEventType } = require('../../../.aios-core/core/events/types');

describe('events/types', () => {
  describe('DashboardEventType', () => {
    test('exports DashboardEventType object', () => {
      expect(DashboardEventType).toBeDefined();
      expect(typeof DashboardEventType).toBe('object');
    });

    test('defines core agent events', () => {
      expect(DashboardEventType.AGENT_ACTIVATED).toBe('AgentActivated');
      expect(DashboardEventType.AGENT_DEACTIVATED).toBe('AgentDeactivated');
    });

    test('defines command events', () => {
      expect(DashboardEventType.COMMAND_START).toBe('CommandStart');
      expect(DashboardEventType.COMMAND_COMPLETE).toBe('CommandComplete');
      expect(DashboardEventType.COMMAND_ERROR).toBe('CommandError');
    });

    test('defines session events', () => {
      expect(DashboardEventType.SESSION_START).toBe('SessionStart');
      expect(DashboardEventType.SESSION_END).toBe('SessionEnd');
    });

    test('defines story event', () => {
      expect(DashboardEventType.STORY_STATUS_CHANGE).toBe('StoryStatusChange');
    });

    test('defines Bob-specific events', () => {
      expect(DashboardEventType.BOB_PHASE_CHANGE).toBe('BobPhaseChange');
      expect(DashboardEventType.BOB_AGENT_SPAWNED).toBe('BobAgentSpawned');
      expect(DashboardEventType.BOB_AGENT_COMPLETED).toBe('BobAgentCompleted');
      expect(DashboardEventType.BOB_SURFACE_DECISION).toBe('BobSurfaceDecision');
      expect(DashboardEventType.BOB_ERROR).toBe('BobError');
    });

    test('has exactly 13 event types', () => {
      expect(Object.keys(DashboardEventType)).toHaveLength(13);
    });

    test('all values are unique strings', () => {
      const values = Object.values(DashboardEventType);
      const unique = new Set(values);
      expect(unique.size).toBe(values.length);
      values.forEach(v => expect(typeof v).toBe('string'));
    });
  });
});
