/**
 * Unit tests for context-manager module
 *
 * Tests the ContextManager class that persists workflow state,
 * manages phase outputs, handoff packages, and delivery confidence.
 */

jest.mock('fs-extra');

const fs = require('fs-extra');

const ContextManager = require('../../../.aios-core/core/orchestration/context-manager');

describe('ContextManager', () => {
  let mgr;
  const WORKFLOW_ID = 'wf-test-001';
  const PROJECT_ROOT = '/project';

  beforeEach(() => {
    jest.resetAllMocks();
    fs.ensureDir.mockResolvedValue(undefined);
    fs.writeJson.mockResolvedValue(undefined);
    mgr = new ContextManager(WORKFLOW_ID, PROJECT_ROOT);
  });

  // ============================================================
  // Constructor
  // ============================================================
  describe('constructor', () => {
    test('sets paths correctly', () => {
      expect(mgr.workflowId).toBe(WORKFLOW_ID);
      expect(mgr.projectRoot).toBe(PROJECT_ROOT);
      expect(mgr.stateDir).toContain('.aios/workflow-state');
      expect(mgr.statePath).toContain(`${WORKFLOW_ID}.json`);
      expect(mgr.handoffDir).toContain('handoffs');
      expect(mgr.confidenceDir).toContain('confidence');
      expect(mgr._stateCache).toBeNull();
    });
  });

  // ============================================================
  // ensureStateDir
  // ============================================================
  describe('ensureStateDir', () => {
    test('creates all required directories', async () => {
      await mgr.ensureStateDir();
      expect(fs.ensureDir).toHaveBeenCalledTimes(3);
    });
  });

  // ============================================================
  // initialize
  // ============================================================
  describe('initialize', () => {
    test('loads existing state from file', async () => {
      const existingState = {
        workflowId: WORKFLOW_ID,
        status: 'in_progress',
        phases: { 1: { completedAt: '2025-01-01' } },
      };
      fs.pathExists.mockResolvedValue(true);
      fs.readJson.mockResolvedValue(existingState);

      const state = await mgr.initialize();

      expect(state).toEqual(existingState);
      expect(mgr._stateCache).toEqual(existingState);
    });

    test('creates initial state when no file exists', async () => {
      fs.pathExists.mockResolvedValue(false);

      const state = await mgr.initialize();

      expect(state.workflowId).toBe(WORKFLOW_ID);
      expect(state.status).toBe('initialized');
      expect(state.currentPhase).toBe(0);
      expect(state.phases).toEqual({});
      expect(fs.writeJson).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================
  // loadState
  // ============================================================
  describe('loadState', () => {
    test('returns cache when available', async () => {
      mgr._stateCache = { workflowId: WORKFLOW_ID, phases: {} };

      const state = await mgr.loadState();
      expect(state.workflowId).toBe(WORKFLOW_ID);
      expect(fs.pathExists).not.toHaveBeenCalled();
    });

    test('loads from file when no cache', async () => {
      const fileState = { workflowId: WORKFLOW_ID, status: 'completed' };
      fs.pathExists.mockResolvedValue(true);
      fs.readJson.mockResolvedValue(fileState);

      const state = await mgr.loadState();
      expect(state).toEqual(fileState);
      expect(mgr._stateCache).toEqual(fileState);
    });

    test('returns initial state when no cache and no file', async () => {
      fs.pathExists.mockResolvedValue(false);

      const state = await mgr.loadState();
      expect(state.status).toBe('initialized');
      expect(mgr._stateCache).toBeNull(); // doesn't set cache
    });
  });

  // ============================================================
  // savePhaseOutput
  // ============================================================
  describe('savePhaseOutput', () => {
    beforeEach(async () => {
      fs.pathExists.mockResolvedValue(false);
      await mgr.initialize();
      jest.clearAllMocks();
      fs.ensureDir.mockResolvedValue(undefined);
      fs.writeJson.mockResolvedValue(undefined);
    });

    test('saves phase output and updates state', async () => {
      const output = {
        agent: 'architect',
        action: 'design',
        task: 'design-system.md',
        result: { summary: 'Architecture designed' },
      };

      await mgr.savePhaseOutput(1, output);

      expect(mgr._stateCache.currentPhase).toBe(1);
      expect(mgr._stateCache.status).toBe('in_progress');
      expect(mgr._stateCache.phases[1]).toBeDefined();
      expect(mgr._stateCache.phases[1].agent).toBe('architect');
      expect(mgr._stateCache.phases[1].completedAt).toBeDefined();
      expect(mgr._stateCache.phases[1].handoff).toBeDefined();
      expect(mgr._stateCache.metadata.delivery_confidence).toBeDefined();
    });

    test('saves handoff file', async () => {
      await mgr.savePhaseOutput(1, { agent: 'dev' });

      // writeJson called for: state file + handoff file + confidence file
      expect(fs.writeJson).toHaveBeenCalledTimes(3);
    });

    test('builds handoff with target info', async () => {
      await mgr.savePhaseOutput(1, { agent: 'architect' }, {
        handoffTarget: { phase: 2, agent: 'dev' },
      });

      const handoff = mgr._stateCache.phases[1].handoff;
      expect(handoff.from.agent).toBe('architect');
      expect(handoff.to.phase).toBe(2);
      expect(handoff.to.agent).toBe('dev');
    });
  });

  // ============================================================
  // getContextForPhase
  // ============================================================
  describe('getContextForPhase', () => {
    beforeEach(async () => {
      fs.pathExists.mockResolvedValue(false);
      await mgr.initialize();
      fs.ensureDir.mockResolvedValue(undefined);
      fs.writeJson.mockResolvedValue(undefined);
    });

    test('returns context with previous phases', async () => {
      await mgr.savePhaseOutput(1, { agent: 'architect', result: {} });
      await mgr.savePhaseOutput(2, { agent: 'dev', result: {} });

      const context = await mgr.getContextForPhase(3);

      expect(context.workflowId).toBe(WORKFLOW_ID);
      expect(context.currentPhase).toBe(3);
      expect(context.previousPhases[1]).toBeDefined();
      expect(context.previousPhases[2]).toBeDefined();
      expect(context.previousPhases[3]).toBeUndefined();
    });

    test('returns empty previous phases for phase 1', async () => {
      const context = await mgr.getContextForPhase(1);
      expect(context.previousPhases).toEqual({});
    });

    test('includes handoffs from previous phases', async () => {
      await mgr.savePhaseOutput(1, { agent: 'architect', result: {} });

      const context = await mgr.getContextForPhase(2);
      expect(context.previousHandoffs[1]).toBeDefined();
    });
  });

  // ============================================================
  // getPreviousPhaseOutputs / getPhaseOutput
  // ============================================================
  describe('phase output getters', () => {
    test('getPreviousPhaseOutputs returns empty when no cache', () => {
      expect(mgr.getPreviousPhaseOutputs()).toEqual({});
    });

    test('getPreviousPhaseOutputs returns phases from cache', async () => {
      fs.pathExists.mockResolvedValue(false);
      await mgr.initialize();
      fs.ensureDir.mockResolvedValue(undefined);
      fs.writeJson.mockResolvedValue(undefined);
      await mgr.savePhaseOutput(1, { agent: 'dev' });

      const outputs = mgr.getPreviousPhaseOutputs();
      expect(outputs[1]).toBeDefined();
    });

    test('getPhaseOutput returns null for missing phase', () => {
      mgr._stateCache = { phases: {} };
      expect(mgr.getPhaseOutput(99)).toBeNull();
    });

    test('getPhaseOutput returns phase data', () => {
      mgr._stateCache = { phases: { 1: { agent: 'dev', completedAt: 'time' } } };
      expect(mgr.getPhaseOutput(1).agent).toBe('dev');
    });
  });

  // ============================================================
  // markCompleted / markFailed
  // ============================================================
  describe('status marking', () => {
    beforeEach(async () => {
      fs.pathExists.mockResolvedValue(false);
      await mgr.initialize();
      jest.clearAllMocks();
      fs.ensureDir.mockResolvedValue(undefined);
      fs.writeJson.mockResolvedValue(undefined);
    });

    test('markCompleted sets completed status', async () => {
      await mgr.markCompleted();

      expect(mgr._stateCache.status).toBe('completed');
      expect(mgr._stateCache.completedAt).toBeDefined();
      expect(fs.writeJson).toHaveBeenCalled();
    });

    test('markFailed sets failed status with error info', async () => {
      await mgr.markFailed('Something broke', 3);

      expect(mgr._stateCache.status).toBe('failed');
      expect(mgr._stateCache.error).toBe('Something broke');
      expect(mgr._stateCache.failedPhase).toBe(3);
      expect(mgr._stateCache.failedAt).toBeDefined();
    });
  });

  // ============================================================
  // updateMetadata
  // ============================================================
  describe('updateMetadata', () => {
    test('merges new metadata', async () => {
      fs.pathExists.mockResolvedValue(false);
      await mgr.initialize();
      fs.ensureDir.mockResolvedValue(undefined);
      fs.writeJson.mockResolvedValue(undefined);

      await mgr.updateMetadata({ customField: 'value' });

      expect(mgr._stateCache.metadata.customField).toBe('value');
      expect(mgr._stateCache.metadata.projectRoot).toBe(PROJECT_ROOT);
    });
  });

  // ============================================================
  // getLastCompletedPhase / isPhaseCompleted
  // ============================================================
  describe('phase completion checks', () => {
    test('getLastCompletedPhase returns 0 when empty', () => {
      mgr._stateCache = { phases: {} };
      expect(mgr.getLastCompletedPhase()).toBe(0);
    });

    test('getLastCompletedPhase returns max phase number', () => {
      mgr._stateCache = { phases: { 1: {}, 3: {}, 2: {} } };
      expect(mgr.getLastCompletedPhase()).toBe(3);
    });

    test('isPhaseCompleted returns true for completed phase', () => {
      mgr._stateCache = { phases: { 1: { completedAt: '2025-01-01' } } };
      expect(mgr.isPhaseCompleted(1)).toBe(true);
    });

    test('isPhaseCompleted returns false for missing phase', () => {
      mgr._stateCache = { phases: {} };
      expect(mgr.isPhaseCompleted(5)).toBe(false);
    });

    test('isPhaseCompleted returns false when no completedAt', () => {
      mgr._stateCache = { phases: { 1: { agent: 'dev' } } };
      expect(mgr.isPhaseCompleted(1)).toBe(false);
    });
  });

  // ============================================================
  // getSummary
  // ============================================================
  describe('getSummary', () => {
    test('returns summary from cached state', async () => {
      fs.pathExists.mockResolvedValue(false);
      await mgr.initialize();
      fs.ensureDir.mockResolvedValue(undefined);
      fs.writeJson.mockResolvedValue(undefined);
      await mgr.savePhaseOutput(1, { result: {} });

      const summary = mgr.getSummary();

      expect(summary.workflowId).toBe(WORKFLOW_ID);
      expect(summary.status).toBe('in_progress');
      expect(summary.completedPhases).toContain(1);
      expect(summary.totalPhases).toBe(1);
    });

    test('returns initial summary when no cache', () => {
      const summary = mgr.getSummary();

      expect(summary.workflowId).toBe(WORKFLOW_ID);
      expect(summary.status).toBe('initialized');
      expect(summary.totalPhases).toBe(0);
    });
  });

  // ============================================================
  // getDeliveryConfidence
  // ============================================================
  describe('getDeliveryConfidence', () => {
    test('returns null when no cache', () => {
      expect(mgr.getDeliveryConfidence()).toBeNull();
    });

    test('returns confidence from metadata', async () => {
      fs.pathExists.mockResolvedValue(false);
      await mgr.initialize();
      fs.ensureDir.mockResolvedValue(undefined);
      fs.writeJson.mockResolvedValue(undefined);
      await mgr.savePhaseOutput(1, { result: {} });

      const confidence = mgr.getDeliveryConfidence();
      expect(confidence).toBeDefined();
      expect(confidence.score).toBeDefined();
      expect(confidence.threshold).toBeDefined();
      expect(confidence.gate_passed).toBeDefined();
    });
  });

  // ============================================================
  // _buildHandoffPackage (tested through savePhaseOutput)
  // ============================================================
  describe('handoff packages', () => {
    beforeEach(async () => {
      fs.pathExists.mockResolvedValue(false);
      await mgr.initialize();
      fs.ensureDir.mockResolvedValue(undefined);
      fs.writeJson.mockResolvedValue(undefined);
    });

    test('handoff has correct structure', async () => {
      await mgr.savePhaseOutput(1, {
        agent: 'architect',
        action: 'design',
        task: 'design.md',
        result: {
          decisions: [{ id: 'd1', reason: 'scalability' }],
          evidence_links: ['/docs/spec.md'],
          open_risks: [{ id: 'r1', desc: 'performance' }],
        },
      });

      const handoff = mgr._stateCache.phases[1].handoff;

      expect(handoff.version).toBe('1.0.0');
      expect(handoff.workflow_id).toBe(WORKFLOW_ID);
      expect(handoff.from.phase).toBe(1);
      expect(handoff.from.agent).toBe('architect');
      expect(handoff.decision_log.count).toBe(1);
      expect(handoff.evidence_links).toContain('/docs/spec.md');
      expect(handoff.open_risks).toHaveLength(1);
    });

    test('extracts decision_log from result.decision_log', async () => {
      await mgr.savePhaseOutput(1, {
        result: { decision_log: [{ id: 'd1' }] },
      });

      const handoff = mgr._stateCache.phases[1].handoff;
      expect(handoff.decision_log.entries).toHaveLength(1);
    });

    test('extracts evidence from validation checks', async () => {
      await mgr.savePhaseOutput(1, {
        result: {},
        validation: {
          checks: [
            { path: '/file1.js', passed: true },
            { checklist: 'review.md', passed: false },
          ],
        },
      });

      const handoff = mgr._stateCache.phases[1].handoff;
      expect(handoff.evidence_links).toContain('/file1.js');
      expect(handoff.evidence_links).toContain('review.md');
    });

    test('deduplicates evidence links', async () => {
      await mgr.savePhaseOutput(1, {
        result: { evidence_links: ['/file.md', '/file.md'] },
        validation: { checks: [{ path: '/file.md' }] },
      });

      const handoff = mgr._stateCache.phases[1].handoff;
      expect(handoff.evidence_links).toEqual(['/file.md']);
    });

    test('extracts risks from multiple fields', async () => {
      await mgr.savePhaseOutput(1, {
        result: {
          open_risks: ['risk1'],
          risks: ['risk2'],
          risk_register: ['risk3'],
        },
      });

      const handoff = mgr._stateCache.phases[1].handoff;
      expect(handoff.open_risks).toHaveLength(3);
    });
  });

  // ============================================================
  // _calculateDeliveryConfidence
  // ============================================================
  describe('delivery confidence calculation', () => {
    beforeEach(async () => {
      fs.pathExists.mockResolvedValue(false);
      await mgr.initialize();
      fs.ensureDir.mockResolvedValue(undefined);
      fs.writeJson.mockResolvedValue(undefined);
    });

    test('returns score with all components', async () => {
      await mgr.savePhaseOutput(1, {
        result: { ac_total: 5, ac_completed: 5 },
        validation: { checks: [{ passed: true }, { passed: true }] },
      });

      const confidence = mgr.getDeliveryConfidence();

      expect(confidence.version).toBe('1.0.0');
      expect(confidence.score).toBeGreaterThan(0);
      expect(confidence.formula).toBeDefined();
      expect(confidence.components).toBeDefined();
      expect(confidence.components.test_coverage).toBeDefined();
      expect(confidence.components.ac_completion).toBeDefined();
    });

    test('uses custom threshold from env', async () => {
      process.env.AIOS_DELIVERY_CONFIDENCE_THRESHOLD = '85';

      await mgr.savePhaseOutput(1, { result: {} });

      const confidence = mgr.getDeliveryConfidence();
      expect(confidence.threshold).toBe(85);

      delete process.env.AIOS_DELIVERY_CONFIDENCE_THRESHOLD;
    });

    test('defaults to threshold 70', async () => {
      await mgr.savePhaseOutput(1, { result: {} });

      const confidence = mgr.getDeliveryConfidence();
      expect(confidence.threshold).toBe(70);
    });

    test('test_coverage returns 1 for phases without checks', async () => {
      await mgr.savePhaseOutput(1, { result: {} });

      const confidence = mgr.getDeliveryConfidence();
      expect(confidence.components.test_coverage).toBe(1);
    });

    test('test_coverage calculates from validation checks', async () => {
      await mgr.savePhaseOutput(1, {
        result: {},
        validation: {
          checks: [
            { passed: true },
            { passed: false },
            { passed: true },
            { passed: true },
          ],
        },
      });

      const confidence = mgr.getDeliveryConfidence();
      expect(confidence.components.test_coverage).toBe(0.75); // 3/4
    });

    test('ac_completion from explicit counts', async () => {
      await mgr.savePhaseOutput(1, {
        result: { ac_total: 10, ac_completed: 7 },
      });

      const confidence = mgr.getDeliveryConfidence();
      expect(confidence.components.ac_completion).toBe(0.7);
    });

    test('ac_completion from acceptance_criteria array', async () => {
      await mgr.savePhaseOutput(1, {
        result: {
          acceptance_criteria: [
            { done: true },
            { status: 'done' },
            { done: false },
          ],
        },
      });

      const confidence = mgr.getDeliveryConfidence();
      expect(confidence.components.ac_completion).toBeCloseTo(2 / 3);
    });

    test('ac_completion fallback uses successful phases', async () => {
      await mgr.savePhaseOutput(1, { result: { status: 'ok' } });
      await mgr.savePhaseOutput(2, { result: { status: 'failed' } });

      const confidence = mgr.getDeliveryConfidence();
      expect(confidence.components.ac_completion).toBe(0.5);
    });

    test('risk inverse score decreases with more risks', async () => {
      await mgr.savePhaseOutput(1, {
        result: { open_risks: ['r1', 'r2', 'r3', 'r4', 'r5'] },
      });

      const confidence = mgr.getDeliveryConfidence();
      expect(confidence.components.risk_score_inv).toBe(0.5); // 1 - 5/10
    });

    test('debt inverse score decreases with debt items', async () => {
      await mgr.savePhaseOutput(1, {
        result: {
          technical_debt: ['td1', 'td2'],
          todos: ['t1'],
          hacks: ['h1', 'h2'],
        },
      });

      const confidence = mgr.getDeliveryConfidence();
      expect(confidence.components.debt_score_inv).toBe(0.5); // 1 - 5/10
    });

    test('debt score uses explicit debt_count', async () => {
      await mgr.savePhaseOutput(1, {
        result: { technical_debt_count: 3 },
      });

      const confidence = mgr.getDeliveryConfidence();
      expect(confidence.components.debt_score_inv).toBe(0.7); // 1 - 3/10
    });

    test('regression_clear falls back to test_coverage', async () => {
      await mgr.savePhaseOutput(1, {
        result: {},
        validation: { checks: [{ passed: true }] }, // no regression checks
      });

      const confidence = mgr.getDeliveryConfidence();
      expect(confidence.components.regression_clear).toBe(confidence.components.test_coverage);
    });

    test('regression_clear calculates from regression checks', async () => {
      await mgr.savePhaseOutput(1, {
        result: {},
        validation: {
          checks: [
            { type: 'regression', passed: true },
            { type: 'regression', passed: false },
            { type: 'unit', passed: true },
          ],
        },
      });

      const confidence = mgr.getDeliveryConfidence();
      expect(confidence.components.regression_clear).toBe(0.5); // 1/2 regression checks
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    beforeEach(async () => {
      fs.pathExists.mockResolvedValue(false);
      await mgr.initialize();
      fs.ensureDir.mockResolvedValue(undefined);
      fs.writeJson.mockResolvedValue(undefined);
      await mgr.savePhaseOutput(1, { agent: 'dev' });
    });

    test('resets state but keeps metadata', async () => {
      await mgr.updateMetadata({ customField: 'keep' });
      await mgr.reset(true);

      expect(mgr._stateCache.status).toBe('initialized');
      expect(mgr._stateCache.phases).toEqual({});
      expect(mgr._stateCache.metadata.customField).toBe('keep');
    });

    test('resets state and clears metadata', async () => {
      await mgr.updateMetadata({ customField: 'remove' });
      await mgr.reset(false);

      expect(mgr._stateCache.status).toBe('initialized');
      expect(mgr._stateCache.metadata.customField).toBeUndefined();
    });
  });

  // ============================================================
  // exportState / importState
  // ============================================================
  describe('state export/import', () => {
    test('exportState returns copy of state', async () => {
      fs.pathExists.mockResolvedValue(false);
      await mgr.initialize();

      const exported = mgr.exportState();
      exported.extra = true;
      expect(mgr._stateCache.extra).toBeUndefined();
    });

    test('importState sets cache and saves', async () => {
      fs.ensureDir.mockResolvedValue(undefined);
      fs.writeJson.mockResolvedValue(undefined);
      const state = { workflowId: 'imported', status: 'completed', phases: {} };

      await mgr.importState(state);

      expect(mgr._stateCache).toEqual(expect.objectContaining({ workflowId: 'imported' }));
      expect(fs.writeJson).toHaveBeenCalled();
    });
  });
});
