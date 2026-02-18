/**
 * Session State Schema Validation Tests
 *
 * Task #2: JSON Schema validation for session-state.yaml
 * Security: Prevents corrupted data from crashing Bob Orchestrator
 *
 * @module tests/unit/core/orchestration/session-state-schema
 */

'use strict';

const { SessionState, ActionType } = require('../../../../.aios-core/core/orchestration/session-state');

describe('SessionState - JSON Schema Validation (Task #2)', () => {
  describe('validateSchema() - Valid States', () => {
    test('validates complete valid session state', () => {
      const validState = {
        session_state: {
          version: '1.2',
          last_updated: '2026-02-14T10:30:00.000Z',
          epic: {
            id: 'epic-bob-refinement',
            title: 'Magic Bob Refinement',
            total_stories: 4,
          },
          progress: {
            current_story: 'BOB-P0-1-VAL',
            stories_done: [],
            stories_pending: ['BOB-P0-1-VAL', 'BOB-P0-2-VAL', 'BOB-P0-3-VAL', 'BOB-P0-4-VAL'],
          },
          workflow: {
            current_phase: 'validation',
            attempt_count: 0,
            phase_results: {},
            started_at: '2026-02-14T09:00:00.000Z',
          },
          last_action: {
            type: 'EPIC_STARTED',
            timestamp: '2026-02-14T09:00:00.000Z',
            story: 'BOB-P0-1-VAL',
            phase: null,
          },
          context_snapshot: {
            files_modified: 0,
            executor_distribution: {},
            last_executor: null,
            branch: 'main',
          },
          resume_instructions: 'Story BOB-P0-1-VAL ready to start.',
          overrides: {
            educational_mode: null,
          },
        },
      };

      const result = SessionState.validateSchema(validState);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('validates state with null current_story', () => {
      const state = {
        session_state: {
          version: '1.2',
          last_updated: '2026-02-14T10:30:00.000Z',
          epic: { id: 'test', title: 'Test Epic', total_stories: 0 },
          progress: {
            current_story: null,
            stories_done: [],
            stories_pending: [],
          },
          workflow: {
            current_phase: null,
            attempt_count: 0,
            phase_results: {},
            started_at: '2026-02-14T09:00:00.000Z',
          },
          last_action: {
            type: 'EPIC_STARTED',
            timestamp: '2026-02-14T09:00:00.000Z',
            story: null,
            phase: null,
          },
          context_snapshot: {
            files_modified: 0,
            executor_distribution: {},
            last_executor: null,
            branch: 'main',
          },
          resume_instructions: 'No stories to resume.',
        },
      };

      const result = SessionState.validateSchema(state);

      expect(result.isValid).toBe(true);
    });

    test('validates state with all action types', () => {
      const actionTypes = [
        'GO',
        'PAUSE',
        'REVIEW',
        'ABORT',
        'PHASE_CHANGE',
        'EPIC_STARTED',
        'STORY_STARTED',
        'STORY_COMPLETED',
        'CHECKPOINT_REACHED',
        'ERROR_OCCURRED',
      ];

      actionTypes.forEach((actionType) => {
        const state = {
          session_state: {
            version: '1.2',
            last_updated: '2026-02-14T10:30:00.000Z',
            epic: { id: 'test', title: 'Test', total_stories: 1 },
            progress: {
              current_story: 'story-1',
              stories_done: [],
              stories_pending: ['story-1'],
            },
            workflow: {
              current_phase: 'validation',
              attempt_count: 0,
              phase_results: {},
              started_at: '2026-02-14T09:00:00.000Z',
            },
            last_action: {
              type: actionType,
              timestamp: '2026-02-14T09:00:00.000Z',
              story: 'story-1',
              phase: 'validation',
            },
            context_snapshot: {
              files_modified: 0,
              executor_distribution: {},
              last_executor: 'dev',
              branch: 'main',
            },
            resume_instructions: 'Test instructions.',
          },
        };

        const result = SessionState.validateSchema(state);

        expect(result.isValid).toBe(true);
      });
    });

    test('validates state with all phase types', () => {
      const phases = ['validation', 'development', 'self_healing', 'quality_gate', 'push', 'checkpoint'];

      phases.forEach((phase) => {
        const state = {
          session_state: {
            version: '1.2',
            last_updated: '2026-02-14T10:30:00.000Z',
            epic: { id: 'test', title: 'Test', total_stories: 1 },
            progress: {
              current_story: 'story-1',
              stories_done: [],
              stories_pending: ['story-1'],
            },
            workflow: {
              current_phase: phase,
              attempt_count: 2,
              phase_results: { [phase]: { status: 'PASS' } },
              started_at: '2026-02-14T09:00:00.000Z',
            },
            last_action: {
              type: 'PHASE_CHANGE',
              timestamp: '2026-02-14T09:00:00.000Z',
              story: 'story-1',
              phase: phase,
            },
            context_snapshot: {
              files_modified: 5,
              executor_distribution: { dev: 3, qa: 2 },
              last_executor: 'dev',
              branch: 'feat/test',
            },
            resume_instructions: 'Resume from phase.',
          },
        };

        const result = SessionState.validateSchema(state);

        expect(result.isValid).toBe(true);
      });
    });

    test('validates state with educational_mode override', () => {
      const state = {
        session_state: {
          version: '1.2',
          last_updated: '2026-02-14T10:30:00.000Z',
          epic: { id: 'test', title: 'Test', total_stories: 1 },
          progress: {
            current_story: 'story-1',
            stories_done: [],
            stories_pending: ['story-1'],
          },
          workflow: {
            current_phase: null,
            attempt_count: 0,
            phase_results: {},
            started_at: '2026-02-14T09:00:00.000Z',
          },
          last_action: {
            type: 'EPIC_STARTED',
            timestamp: '2026-02-14T09:00:00.000Z',
            story: 'story-1',
            phase: null,
          },
          context_snapshot: {
            files_modified: 0,
            executor_distribution: {},
            last_executor: null,
            branch: 'main',
          },
          resume_instructions: 'Test',
          overrides: {
            educational_mode: true, // Session override active
          },
        },
      };

      const result = SessionState.validateSchema(state);

      expect(result.isValid).toBe(true);
    });
  });

  describe('validateSchema() - Invalid States (Security Tests)', () => {
    test('rejects missing session_state root', () => {
      const invalidState = {
        some_other_field: 'value',
      };

      const result = SessionState.validateSchema(invalidState);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.join('')).toContain('session_state');
    });

    test('rejects missing version', () => {
      const invalidState = {
        session_state: {
          // version missing
          last_updated: '2026-02-14T10:30:00.000Z',
          epic: { id: 'test', title: 'Test', total_stories: 1 },
          progress: {
            current_story: 'story-1',
            stories_done: [],
            stories_pending: ['story-1'],
          },
          workflow: {
            current_phase: null,
            attempt_count: 0,
            phase_results: {},
            started_at: '2026-02-14T09:00:00.000Z',
          },
          last_action: {
            type: 'EPIC_STARTED',
            timestamp: '2026-02-14T09:00:00.000Z',
            story: 'story-1',
            phase: null,
          },
          context_snapshot: {
            files_modified: 0,
            executor_distribution: {},
            last_executor: null,
            branch: 'main',
          },
          resume_instructions: 'Test',
        },
      };

      const result = SessionState.validateSchema(invalidState);

      expect(result.isValid).toBe(false);
      expect(result.errors.join('')).toContain('version');
    });

    test('rejects invalid version format', () => {
      const invalidState = {
        session_state: {
          version: 'invalid-version', // Must be "X.Y" format
          last_updated: '2026-02-14T10:30:00.000Z',
          epic: { id: 'test', title: 'Test', total_stories: 1 },
          progress: {
            current_story: 'story-1',
            stories_done: [],
            stories_pending: ['story-1'],
          },
          workflow: {
            current_phase: null,
            attempt_count: 0,
            phase_results: {},
            started_at: '2026-02-14T09:00:00.000Z',
          },
          last_action: {
            type: 'EPIC_STARTED',
            timestamp: '2026-02-14T09:00:00.000Z',
            story: 'story-1',
            phase: null,
          },
          context_snapshot: {
            files_modified: 0,
            executor_distribution: {},
            last_executor: null,
            branch: 'main',
          },
          resume_instructions: 'Test',
        },
      };

      const result = SessionState.validateSchema(invalidState);

      expect(result.isValid).toBe(false);
      expect(result.errors.join('')).toContain('version');
    });

    test('rejects missing epic fields', () => {
      const invalidState = {
        session_state: {
          version: '1.2',
          last_updated: '2026-02-14T10:30:00.000Z',
          epic: {
            id: 'test',
            // title missing
            // total_stories missing
          },
          progress: {
            current_story: 'story-1',
            stories_done: [],
            stories_pending: ['story-1'],
          },
          workflow: {
            current_phase: null,
            attempt_count: 0,
            phase_results: {},
            started_at: '2026-02-14T09:00:00.000Z',
          },
          last_action: {
            type: 'EPIC_STARTED',
            timestamp: '2026-02-14T09:00:00.000Z',
            story: 'story-1',
            phase: null,
          },
          context_snapshot: {
            files_modified: 0,
            executor_distribution: {},
            last_executor: null,
            branch: 'main',
          },
          resume_instructions: 'Test',
        },
      };

      const result = SessionState.validateSchema(invalidState);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('rejects invalid action type', () => {
      const invalidState = {
        session_state: {
          version: '1.2',
          last_updated: '2026-02-14T10:30:00.000Z',
          epic: { id: 'test', title: 'Test', total_stories: 1 },
          progress: {
            current_story: 'story-1',
            stories_done: [],
            stories_pending: ['story-1'],
          },
          workflow: {
            current_phase: null,
            attempt_count: 0,
            phase_results: {},
            started_at: '2026-02-14T09:00:00.000Z',
          },
          last_action: {
            type: 'INVALID_ACTION', // Not in enum
            timestamp: '2026-02-14T09:00:00.000Z',
            story: 'story-1',
            phase: null,
          },
          context_snapshot: {
            files_modified: 0,
            executor_distribution: {},
            last_executor: null,
            branch: 'main',
          },
          resume_instructions: 'Test',
        },
      };

      const result = SessionState.validateSchema(invalidState);

      expect(result.isValid).toBe(false);
      expect(result.errors.join('')).toContain('type');
    });

    test('rejects invalid phase name', () => {
      const invalidState = {
        session_state: {
          version: '1.2',
          last_updated: '2026-02-14T10:30:00.000Z',
          epic: { id: 'test', title: 'Test', total_stories: 1 },
          progress: {
            current_story: 'story-1',
            stories_done: [],
            stories_pending: ['story-1'],
          },
          workflow: {
            current_phase: 'invalid_phase', // Not in enum
            attempt_count: 0,
            phase_results: {},
            started_at: '2026-02-14T09:00:00.000Z',
          },
          last_action: {
            type: 'PHASE_CHANGE',
            timestamp: '2026-02-14T09:00:00.000Z',
            story: 'story-1',
            phase: 'invalid_phase',
          },
          context_snapshot: {
            files_modified: 0,
            executor_distribution: {},
            last_executor: null,
            branch: 'main',
          },
          resume_instructions: 'Test',
        },
      };

      const result = SessionState.validateSchema(invalidState);

      expect(result.isValid).toBe(false);
    });

    test('rejects negative attempt_count', () => {
      const invalidState = {
        session_state: {
          version: '1.2',
          last_updated: '2026-02-14T10:30:00.000Z',
          epic: { id: 'test', title: 'Test', total_stories: 1 },
          progress: {
            current_story: 'story-1',
            stories_done: [],
            stories_pending: ['story-1'],
          },
          workflow: {
            current_phase: null,
            attempt_count: -1, // Must be >= 0
            phase_results: {},
            started_at: '2026-02-14T09:00:00.000Z',
          },
          last_action: {
            type: 'EPIC_STARTED',
            timestamp: '2026-02-14T09:00:00.000Z',
            story: 'story-1',
            phase: null,
          },
          context_snapshot: {
            files_modified: 0,
            executor_distribution: {},
            last_executor: null,
            branch: 'main',
          },
          resume_instructions: 'Test',
        },
      };

      const result = SessionState.validateSchema(invalidState);

      expect(result.isValid).toBe(false);
      expect(result.errors.join('')).toContain('attempt_count');
    });

    test('rejects non-array stories_done', () => {
      const invalidState = {
        session_state: {
          version: '1.2',
          last_updated: '2026-02-14T10:30:00.000Z',
          epic: { id: 'test', title: 'Test', total_stories: 1 },
          progress: {
            current_story: 'story-1',
            stories_done: 'not-an-array', // Must be array
            stories_pending: ['story-1'],
          },
          workflow: {
            current_phase: null,
            attempt_count: 0,
            phase_results: {},
            started_at: '2026-02-14T09:00:00.000Z',
          },
          last_action: {
            type: 'EPIC_STARTED',
            timestamp: '2026-02-14T09:00:00.000Z',
            story: 'story-1',
            phase: null,
          },
          context_snapshot: {
            files_modified: 0,
            executor_distribution: {},
            last_executor: null,
            branch: 'main',
          },
          resume_instructions: 'Test',
        },
      };

      const result = SessionState.validateSchema(invalidState);

      expect(result.isValid).toBe(false);
      expect(result.errors.join('')).toContain('stories_done');
    });

    test('rejects additional properties in session_state', () => {
      const invalidState = {
        session_state: {
          version: '1.2',
          last_updated: '2026-02-14T10:30:00.000Z',
          epic: { id: 'test', title: 'Test', total_stories: 1 },
          progress: {
            current_story: 'story-1',
            stories_done: [],
            stories_pending: ['story-1'],
          },
          workflow: {
            current_phase: null,
            attempt_count: 0,
            phase_results: {},
            started_at: '2026-02-14T09:00:00.000Z',
          },
          last_action: {
            type: 'EPIC_STARTED',
            timestamp: '2026-02-14T09:00:00.000Z',
            story: 'story-1',
            phase: null,
          },
          context_snapshot: {
            files_modified: 0,
            executor_distribution: {},
            last_executor: null,
            branch: 'main',
          },
          resume_instructions: 'Test',
          unexpected_field: 'not allowed', // Additional property
        },
      };

      const result = SessionState.validateSchema(invalidState);

      expect(result.isValid).toBe(false);
      expect(result.errors.join('')).toContain('additional');
    });

    test('rejects invalid ISO 8601 timestamp', () => {
      const invalidState = {
        session_state: {
          version: '1.2',
          last_updated: 'not-a-timestamp', // Must be ISO 8601
          epic: { id: 'test', title: 'Test', total_stories: 1 },
          progress: {
            current_story: 'story-1',
            stories_done: [],
            stories_pending: ['story-1'],
          },
          workflow: {
            current_phase: null,
            attempt_count: 0,
            phase_results: {},
            started_at: '2026-02-14T09:00:00.000Z',
          },
          last_action: {
            type: 'EPIC_STARTED',
            timestamp: '2026-02-14T09:00:00.000Z',
            story: 'story-1',
            phase: null,
          },
          context_snapshot: {
            files_modified: 0,
            executor_distribution: {},
            last_executor: null,
            branch: 'main',
          },
          resume_instructions: 'Test',
        },
      };

      const result = SessionState.validateSchema(invalidState);

      expect(result.isValid).toBe(false);
      expect(result.errors.join('')).toContain('date-time');
    });
  });

  describe('validateSchema() - Edge Cases', () => {
    test('handles null state gracefully', () => {
      const result = SessionState.validateSchema(null);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('handles undefined state gracefully', () => {
      const result = SessionState.validateSchema(undefined);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('handles empty object', () => {
      const result = SessionState.validateSchema({});

      expect(result.isValid).toBe(false);
      expect(result.errors.join('')).toContain('session_state');
    });
  });

  describe('Crash Detection Prevention (Security)', () => {
    test('validateSchema prevents process.kill() from invalid data', () => {
      // Simulate corrupted state that could cause undefined access
      const corruptedState = {
        session_state: {
          version: '1.2',
          // Missing required fields that could cause crash
        },
      };

      const result = SessionState.validateSchema(corruptedState);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      // Validation should catch this BEFORE it reaches code that accesses undefined fields
    });

    test('validateSchema catches malformed executor_distribution', () => {
      const invalidState = {
        session_state: {
          version: '1.2',
          last_updated: '2026-02-14T10:30:00.000Z',
          epic: { id: 'test', title: 'Test', total_stories: 1 },
          progress: {
            current_story: 'story-1',
            stories_done: [],
            stories_pending: ['story-1'],
          },
          workflow: {
            current_phase: null,
            attempt_count: 0,
            phase_results: {},
            started_at: '2026-02-14T09:00:00.000Z',
          },
          last_action: {
            type: 'EPIC_STARTED',
            timestamp: '2026-02-14T09:00:00.000Z',
            story: 'story-1',
            phase: null,
          },
          context_snapshot: {
            files_modified: 0,
            executor_distribution: {
              dev: -5, // Negative count should be invalid
            },
            last_executor: null,
            branch: 'main',
          },
          resume_instructions: 'Test',
        },
      };

      const result = SessionState.validateSchema(invalidState);

      expect(result.isValid).toBe(false);
    });
  });
});
