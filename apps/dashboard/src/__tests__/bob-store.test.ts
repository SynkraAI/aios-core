import { describe, it, expect, beforeEach } from 'vitest';
import { useBobStore } from '@/stores/bob-store';

// Helper to get store actions/state
function getStore() {
  return useBobStore.getState();
}

// Sample bob-status data
const SAMPLE_STATUS = {
  active: true,
  version: '1.0',
  timestamp: new Date().toISOString(),
  orchestration: { active: true, mode: 'bob', epic_id: 'epic-12', current_story: '12.3' },
  pipeline: {
    stages: ['validation', 'development', 'self_healing', 'quality_gate', 'push', 'checkpoint'],
    current_stage: 'development',
    story_progress: '3/8',
    completed_stages: ['validation'],
  },
  current_agent: {
    id: 'dev',
    name: 'Dex',
    task: 'implementing jwt-handler',
    reason: 'Story type: code_general → executor: dev',
    started_at: new Date().toISOString(),
  },
  active_terminals: [
    { agent: 'dev', pid: 12345, task: 'jwt-handler', elapsed: '4m32s' },
  ],
  surface_decisions: [],
  elapsed: { story_seconds: 272, session_seconds: 1380 },
  errors: [],
  educational: { enabled: false, tradeoffs: [], reasoning: [] },
};

describe('bob-store', () => {
  beforeEach(() => {
    getStore().reset();
  });

  describe('initial state', () => {
    it('should start inactive', () => {
      expect(getStore().active).toBe(false);
      expect(getStore().isInactive).toBe(true);
      expect(getStore().pipeline).toBeNull();
      expect(getStore().currentAgent).toBeNull();
      expect(getStore().terminals).toEqual([]);
      expect(getStore().surfaceDecisions).toEqual([]);
      expect(getStore().errors).toEqual([]);
    });
  });

  describe('updateFromStatus', () => {
    it('should update store with bob-status data', () => {
      getStore().updateFromStatus(SAMPLE_STATUS);

      expect(getStore().active).toBe(true);
      expect(getStore().pipeline).not.toBeNull();
      expect(getStore().pipeline?.current_stage).toBe('development');
      expect(getStore().pipeline?.story_progress).toBe('3/8');
      expect(getStore().pipeline?.completed_stages).toEqual(['validation']);
    });

    it('should parse current agent correctly', () => {
      getStore().updateFromStatus(SAMPLE_STATUS);

      expect(getStore().currentAgent).not.toBeNull();
      expect(getStore().currentAgent?.id).toBe('dev');
      expect(getStore().currentAgent?.name).toBe('Dex');
      expect(getStore().currentAgent?.task).toBe('implementing jwt-handler');
    });

    it('should parse terminals correctly', () => {
      getStore().updateFromStatus(SAMPLE_STATUS);

      expect(getStore().terminals).toHaveLength(1);
      expect(getStore().terminals[0].agent).toBe('dev');
      expect(getStore().terminals[0].pid).toBe(12345);
    });

    it('should parse elapsed correctly', () => {
      getStore().updateFromStatus(SAMPLE_STATUS);

      expect(getStore().elapsed.story_seconds).toBe(272);
      expect(getStore().elapsed.session_seconds).toBe(1380);
    });

    it('should handle inactive status (no file / bob off)', () => {
      getStore().updateFromStatus({ active: false, message: 'Bob is not running' });

      expect(getStore().active).toBe(false);
      expect(getStore().pipeline).toBeNull();
    });

    it('should detect inactivity when timestamp is old', () => {
      const oldTimestamp = new Date(Date.now() - 6 * 60 * 1000).toISOString();
      getStore().updateFromStatus({ ...SAMPLE_STATUS, timestamp: oldTimestamp });

      expect(getStore().isInactive).toBe(true);
    });
  });

  describe('handleBobEvent', () => {
    it('should handle BobPhaseChange event', () => {
      getStore().updateFromStatus(SAMPLE_STATUS);
      getStore().handleBobEvent({
        type: 'BobPhaseChange',
        data: { phase: 'self_healing' },
      });

      expect(getStore().pipeline?.current_stage).toBe('self_healing');
      expect(getStore().pipeline?.completed_stages).toContain('development');
    });

    it('should handle BobAgentSpawned event', () => {
      getStore().updateFromStatus(SAMPLE_STATUS);
      getStore().handleBobEvent({
        type: 'BobAgentSpawned',
        data: { id: 'qa', name: 'Quinn', task: 'running tests', reason: 'QA phase', started_at: new Date().toISOString() },
      });

      expect(getStore().currentAgent?.id).toBe('qa');
      expect(getStore().currentAgent?.name).toBe('Quinn');
    });

    it('should handle BobAgentCompleted event', () => {
      getStore().updateFromStatus(SAMPLE_STATUS);
      getStore().handleBobEvent({ type: 'BobAgentCompleted', data: {} });

      expect(getStore().currentAgent).toBeNull();
    });

    it('should handle BobSurfaceDecision event', () => {
      getStore().updateFromStatus(SAMPLE_STATUS);
      getStore().handleBobEvent({
        type: 'BobSurfaceDecision',
        data: { criteria: 'C003', action: 'present_options' },
      });

      expect(getStore().surfaceDecisions).toHaveLength(1);
      expect(getStore().surfaceDecisions[0].criteria).toBe('C003');
      expect(getStore().surfaceDecisions[0].resolved).toBe(false);
    });

    it('should handle BobError event', () => {
      getStore().updateFromStatus(SAMPLE_STATUS);
      getStore().handleBobEvent({
        type: 'BobError',
        data: { phase: 'development', message: 'Test failure', recoverable: true },
      });

      expect(getStore().errors).toHaveLength(1);
      expect(getStore().errors[0].phase).toBe('development');
      expect(getStore().errors[0].recoverable).toBe(true);
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      getStore().updateFromStatus(SAMPLE_STATUS);
      expect(getStore().active).toBe(true);

      getStore().reset();
      expect(getStore().active).toBe(false);
      expect(getStore().pipeline).toBeNull();
      expect(getStore().currentAgent).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle corrupted data gracefully', () => {
      getStore().updateFromStatus({
        active: true,
        pipeline: 'invalid',
        current_agent: 42,
        active_terminals: 'not-an-array',
        errors: null,
      } as unknown as Record<string, unknown>);

      expect(getStore().active).toBe(true);
      expect(getStore().pipeline).toBeNull();
      expect(getStore().currentAgent).toBeNull();
      expect(getStore().terminals).toEqual([]);
      expect(getStore().errors).toEqual([]);
    });

    it('should handle missing fields gracefully', () => {
      getStore().updateFromStatus({ active: true });

      expect(getStore().active).toBe(true);
      expect(getStore().pipeline).toBeNull();
      expect(getStore().elapsed.story_seconds).toBe(0);
    });
  });
});
