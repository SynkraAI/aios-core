/**
 * Workflow Engine — Unit Tests
 *
 * Tests for SDC workflow, QA Loop, backward-jump retry, max retries abort,
 * budget exceeded abort, crash recovery, context passing, and dirty state detection.
 *
 * Story: E7.1.3 (Task 10)
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync, existsSync, rmSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import {
  createWorkflowEngine,
  WorkflowAbortError,
  BudgetExceededError,
} from '../src/workflow-engine.mjs';

// ---------------------------------------------------------------------------
// Test Helpers
// ---------------------------------------------------------------------------

/** Create a unique temp directory for each test */
function createTempDir() {
  const dir = join(tmpdir(), `wf-test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}

/** Create a mock story file */
function createStoryFile(projectRoot, storyPath, content) {
  const fullPath = join(projectRoot, storyPath);
  const dir = join(fullPath, '..');
  mkdirSync(dir, { recursive: true });
  writeFileSync(fullPath, content || '# Test Story\n\n## AC1\n- [ ] Test criterion\n');
  return storyPath;
}

/**
 * Create a mock SessionManager that returns configurable results per agent.
 *
 * @param {Record<string, (params) => object>} agentHandlers - Map of agentId to handler function
 * @returns {{ run: Function, calls: Array }}
 */
function createMockSessionManager(agentHandlers = {}) {
  const calls = [];
  const defaultHandler = () => ({
    summary: 'Phase completed successfully.',
    costUsd: 0.50,
    messages: [],
    toolCalls: [],
    durationMs: 1000,
  });

  return {
    calls,
    run: async (params) => {
      calls.push(params);
      const handler = agentHandlers[params.agentId] || defaultHandler;
      return handler(params);
    },
  };
}

/**
 * Create a mock CommsBridge that records all notifications.
 */
function createMockCommsBridge() {
  const notifications = [];
  return {
    notifications,
    notifyPhaseStart(phase, agentId, storyFile, attempt) {
      notifications.push({ type: 'phaseStart', phase, agentId, storyFile, attempt });
    },
    notifyPhaseEnd(phase, agentId, verdict, costUsd, durationMs) {
      notifications.push({ type: 'phaseEnd', phase, agentId, verdict, costUsd });
    },
    notifyError(errorType, message, phase, costUsd) {
      notifications.push({ type: 'error', errorType, message, phase, costUsd });
    },
    notifyBudgetAlert(currentCostUsd, maxCostUsd, storyFile) {
      notifications.push({ type: 'budgetAlert', currentCostUsd, maxCostUsd, storyFile });
    },
    notifyWorkflowComplete(report) {
      notifications.push({ type: 'workflowComplete', report });
    },
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('WorkflowEngine', () => {
  let projectRoot;

  beforeEach(() => {
    projectRoot = createTempDir();
  });

  afterEach(() => {
    try {
      rmSync(projectRoot, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors on Windows
    }
  });

  // =========================================================================
  // SDC Happy Path
  // =========================================================================

  describe('runSDC — happy path', () => {
    it('should complete all 5 SDC phases in order', async () => {
      const storyFile = createStoryFile(projectRoot, 'docs/stories/active/test.story.md');
      const sessionManager = createMockSessionManager({
        // SM is skipped because story file exists
        po: () => ({ summary: 'Verdict: GO. Score: 9/10.', costUsd: 0.20, messages: [] }),
        dev: () => ({ summary: 'Implementation complete.', costUsd: 2.00, messages: [] }),
        qa: () => ({ summary: 'QA verdict: PASS. All checks passed.', costUsd: 0.50, messages: [] }),
        devops: () => ({ summary: 'Pushed to remote.', costUsd: 0.10, messages: [] }),
      });

      const comms = createMockCommsBridge();

      const engine = createWorkflowEngine({
        sessionManager,
        commsBridge: comms,
        projectRoot,
      });

      const report = await engine.runSDC({ storyFile, maxBudgetUsd: 30 });

      assert.equal(report.status, 'success');
      assert.equal(report.storyFile, storyFile);
      assert.ok(report.totalCostUsd > 0);
      assert.ok(report.totalDurationMs >= 0);
      assert.ok(report.workflowId);

      // SM skipped (story exists), so 4 phases executed
      assert.equal(sessionManager.calls.length, 4);
      assert.equal(sessionManager.calls[0].agentId, 'po');
      assert.equal(sessionManager.calls[1].agentId, 'dev');
      assert.equal(sessionManager.calls[2].agentId, 'qa');
      assert.equal(sessionManager.calls[3].agentId, 'devops');

      // Notifications
      const phaseStarts = comms.notifications.filter(n => n.type === 'phaseStart');
      assert.equal(phaseStarts.length, 4);

      // Report saved
      const reportsDir = join(projectRoot, '.aios', 'orchestrator', 'reports');
      assert.ok(existsSync(reportsDir));
    });

    it('should run SM:CREATE when story file does not exist', async () => {
      const storyFile = 'docs/stories/active/new.story.md'; // Does NOT exist on disk
      const sessionManager = createMockSessionManager({
        sm: () => ({ summary: 'Story created.', costUsd: 0.30, messages: [] }),
        po: () => ({ summary: 'GO. Score: 8/10.', costUsd: 0.20, messages: [] }),
        dev: () => ({ summary: 'Done.', costUsd: 1.00, messages: [] }),
        qa: () => ({ summary: 'PASS', costUsd: 0.30, messages: [] }),
        devops: () => ({ summary: 'Pushed.', costUsd: 0.10, messages: [] }),
      });

      const engine = createWorkflowEngine({
        sessionManager,
        projectRoot,
      });

      const report = await engine.runSDC({ storyFile, maxBudgetUsd: 30 });

      assert.equal(report.status, 'success');
      // All 5 phases executed
      assert.equal(sessionManager.calls.length, 5);
      assert.equal(sessionManager.calls[0].agentId, 'sm');
    });
  });

  // =========================================================================
  // PO NO-GO Retry (AC2)
  // =========================================================================

  describe('runSDC — PO NO-GO retry', () => {
    it('should retry SM:CREATE on PO NO-GO and succeed on second attempt', async () => {
      const storyFile = 'docs/stories/active/retry.story.md';
      let poCallCount = 0;

      const sessionManager = createMockSessionManager({
        sm: () => ({ summary: 'Story created/rewritten.', costUsd: 0.30, messages: [] }),
        po: () => {
          poCallCount++;
          if (poCallCount === 1) {
            return { summary: 'NO-GO. Score: 4/10. Missing AC3.', costUsd: 0.20, messages: [] };
          }
          return { summary: 'GO. Score: 8/10.', costUsd: 0.20, messages: [] };
        },
        dev: () => ({ summary: 'Implemented.', costUsd: 1.50, messages: [] }),
        qa: () => ({ summary: 'PASS', costUsd: 0.30, messages: [] }),
        devops: () => ({ summary: 'Pushed.', costUsd: 0.10, messages: [] }),
      });

      const engine = createWorkflowEngine({
        sessionManager,
        projectRoot,
      });

      const report = await engine.runSDC({ storyFile, maxBudgetUsd: 30 });

      assert.equal(report.status, 'success');
      // SM called twice (initial + retry), PO called twice, DEV, QA, DEVOPS
      assert.equal(sessionManager.calls.length, 7);
      assert.equal(sessionManager.calls[0].agentId, 'sm');  // First SM
      assert.equal(sessionManager.calls[1].agentId, 'po');  // First PO (NO-GO)
      assert.equal(sessionManager.calls[2].agentId, 'sm');  // Retry SM
      assert.equal(sessionManager.calls[3].agentId, 'po');  // Second PO (GO)
    });

    it('should disable SM skip on retry (CP-10)', async () => {
      // Story file exists on disk, so first SM:CREATE is skipped.
      // But after PO NO-GO, SM must re-run (skip disabled).
      const storyFile = createStoryFile(projectRoot, 'docs/stories/active/cp10.story.md');
      let poCallCount = 0;

      const sessionManager = createMockSessionManager({
        sm: () => ({ summary: 'Story rewritten.', costUsd: 0.30, messages: [] }),
        po: () => {
          poCallCount++;
          if (poCallCount === 1) {
            return { summary: 'NO-GO. Score: 3/10.', costUsd: 0.20, messages: [] };
          }
          return { summary: 'GO. Score: 9/10.', costUsd: 0.20, messages: [] };
        },
        dev: () => ({ summary: 'Done.', costUsd: 1.00, messages: [] }),
        qa: () => ({ summary: 'PASS', costUsd: 0.30, messages: [] }),
        devops: () => ({ summary: 'Pushed.', costUsd: 0.10, messages: [] }),
      });

      const engine = createWorkflowEngine({
        sessionManager,
        projectRoot,
      });

      const report = await engine.runSDC({ storyFile, maxBudgetUsd: 30 });

      assert.equal(report.status, 'success');
      // First iteration: SM skipped, PO fails.
      // Second iteration: SM NOT skipped (CP-10), PO passes.
      const agentOrder = sessionManager.calls.map(c => c.agentId);
      assert.deepEqual(agentOrder, ['po', 'sm', 'po', 'dev', 'qa', 'devops']);
    });
  });

  // =========================================================================
  // QA FAIL Retry (AC3)
  // =========================================================================

  describe('runSDC — QA FAIL retry', () => {
    it('should retry DEV:IMPLEMENT on QA FAIL and succeed', async () => {
      const storyFile = createStoryFile(projectRoot, 'docs/stories/active/qafail.story.md');
      let qaCallCount = 0;

      const sessionManager = createMockSessionManager({
        po: () => ({ summary: 'GO', costUsd: 0.20, messages: [] }),
        dev: () => ({ summary: 'Implementation done.', costUsd: 1.00, messages: [] }),
        qa: () => {
          qaCallCount++;
          if (qaCallCount === 1) {
            return { summary: 'FAIL. Missing tests for edge cases.', costUsd: 0.30, messages: [] };
          }
          return { summary: 'PASS. All checks passed.', costUsd: 0.30, messages: [] };
        },
        devops: () => ({ summary: 'Pushed.', costUsd: 0.10, messages: [] }),
      });

      const engine = createWorkflowEngine({
        sessionManager,
        projectRoot,
      });

      const report = await engine.runSDC({ storyFile, maxBudgetUsd: 30 });

      assert.equal(report.status, 'success');
      // PO, DEV, QA(FAIL), DEV(retry), QA(PASS), DEVOPS
      assert.equal(sessionManager.calls.length, 6);
      const agentOrder = sessionManager.calls.map(c => c.agentId);
      assert.deepEqual(agentOrder, ['po', 'dev', 'qa', 'dev', 'qa', 'devops']);
    });
  });

  // =========================================================================
  // QA CONCERNS (AC4, CP-11)
  // =========================================================================

  describe('runSDC — QA CONCERNS', () => {
    it('should proceed with note on QA CONCERNS', async () => {
      const storyFile = createStoryFile(projectRoot, 'docs/stories/active/concerns.story.md');

      const sessionManager = createMockSessionManager({
        po: () => ({ summary: 'GO', costUsd: 0.20, messages: [] }),
        dev: () => ({ summary: 'Done.', costUsd: 1.00, messages: [] }),
        qa: () => ({ summary: 'CONCERNS: Minor code style issues but implementation is correct.', costUsd: 0.30, messages: [] }),
        devops: () => ({ summary: 'Pushed.', costUsd: 0.10, messages: [] }),
      });

      const comms = createMockCommsBridge();

      const engine = createWorkflowEngine({
        sessionManager,
        commsBridge: comms,
        projectRoot,
      });

      const report = await engine.runSDC({ storyFile, maxBudgetUsd: 30 });

      assert.equal(report.status, 'success');
      assert.ok(report.concerns.length > 0);
      // DEVOPS still executed (non-blocking)
      assert.equal(sessionManager.calls.length, 4);
      assert.equal(sessionManager.calls[3].agentId, 'devops');
    });
  });

  // =========================================================================
  // Max Retries Exhausted (AC5, CP-4)
  // =========================================================================

  describe('runSDC — max retries exhausted', () => {
    it('should abort when PO retries reach 2 without GO', async () => {
      const storyFile = 'docs/stories/active/abort.story.md';

      const sessionManager = createMockSessionManager({
        sm: () => ({ summary: 'Story created.', costUsd: 0.30, messages: [] }),
        po: () => ({ summary: 'NO-GO. Needs rework.', costUsd: 0.20, messages: [] }),
      });

      const comms = createMockCommsBridge();

      const engine = createWorkflowEngine({
        sessionManager,
        commsBridge: comms,
        projectRoot,
      });

      await assert.rejects(
        () => engine.runSDC({ storyFile, maxBudgetUsd: 30 }),
        (err) => {
          assert.ok(err instanceof WorkflowAbortError);
          assert.equal(err.reason, 'max_retries');
          assert.equal(err.phase, 'PO:VALIDATE');
          assert.equal(err.retriesUsed, 2);
          assert.ok(err.workflowState);
          return true;
        }
      );

      // SM called 3 times (initial + 2 retries), PO called 3 times
      assert.equal(sessionManager.calls.length, 6);

      // Error notification sent
      const errors = comms.notifications.filter(n => n.type === 'error');
      assert.ok(errors.length > 0);
      assert.ok(errors[0].errorType === 'max_retries_exhausted');
    });

    it('should abort when QA retries reach 3 without PASS', async () => {
      const storyFile = createStoryFile(projectRoot, 'docs/stories/active/qamax.story.md');

      const sessionManager = createMockSessionManager({
        po: () => ({ summary: 'GO', costUsd: 0.20, messages: [] }),
        dev: () => ({ summary: 'Done.', costUsd: 1.00, messages: [] }),
        qa: () => ({ summary: 'FAIL. Tests still failing.', costUsd: 0.30, messages: [] }),
      });

      const engine = createWorkflowEngine({ sessionManager, projectRoot });

      await assert.rejects(
        () => engine.runSDC({ storyFile, maxBudgetUsd: 50 }),
        (err) => {
          assert.ok(err instanceof WorkflowAbortError);
          assert.equal(err.reason, 'max_retries');
          assert.equal(err.phase, 'QA:GATE');
          assert.equal(err.retriesUsed, 3);
          return true;
        }
      );

      // PO, DEV, QA(fail), DEV(retry1), QA(fail), DEV(retry2), QA(fail), DEV(retry3), QA(fail=abort)
      // Wait -- let me recalculate:
      // PO (GO) -> DEV -> QA (FAIL, retries[QA]=0, 0<3, retries becomes 1, jump to DEV)
      // DEV -> QA (FAIL, retries[QA]=1, 1<3, retries becomes 2, jump to DEV)
      // DEV -> QA (FAIL, retries[QA]=2, 2<3, retries becomes 3, jump to DEV)
      // DEV -> QA (FAIL, retries[QA]=3, 3>=3, ABORT)
      // So: PO + 4*DEV + 4*QA = 9 calls
      assert.equal(sessionManager.calls.length, 9);
    });
  });

  // =========================================================================
  // Budget Exceeded (AC7)
  // =========================================================================

  describe('runSDC — budget exceeded', () => {
    it('should abort when total cost exceeds budget', async () => {
      const storyFile = createStoryFile(projectRoot, 'docs/stories/active/budget.story.md');

      const sessionManager = createMockSessionManager({
        po: () => ({ summary: 'GO', costUsd: 5.00, messages: [] }),
        dev: () => ({ summary: 'Done.', costUsd: 10.00, messages: [] }),
        qa: () => ({ summary: 'PASS', costUsd: 3.00, messages: [] }),
      });

      const comms = createMockCommsBridge();

      const engine = createWorkflowEngine({
        sessionManager,
        commsBridge: comms,
        projectRoot,
      });

      await assert.rejects(
        () => engine.runSDC({ storyFile, maxBudgetUsd: 10 }),
        (err) => {
          assert.ok(err instanceof BudgetExceededError);
          assert.ok(err.totalCostUsd > 10);
          return true;
        }
      );

      // Budget alert should have been sent at 80%
      const alerts = comms.notifications.filter(n => n.type === 'budgetAlert');
      assert.ok(alerts.length > 0);
    });

    it('should send budget alert at 80% threshold', async () => {
      const storyFile = createStoryFile(projectRoot, 'docs/stories/active/alert.story.md');

      const sessionManager = createMockSessionManager({
        po: () => ({ summary: 'GO', costUsd: 8.50, messages: [] }),   // 8.5 / 10 = 85% > 80%
        dev: () => ({ summary: 'Done.', costUsd: 0.50, messages: [] }),
        qa: () => ({ summary: 'PASS', costUsd: 0.50, messages: [] }),
        devops: () => ({ summary: 'Pushed.', costUsd: 0.10, messages: [] }),
      });

      const comms = createMockCommsBridge();

      const engine = createWorkflowEngine({
        sessionManager,
        commsBridge: comms,
        projectRoot,
      });

      const report = await engine.runSDC({ storyFile, maxBudgetUsd: 10 });
      assert.equal(report.status, 'success');

      const alerts = comms.notifications.filter(n => n.type === 'budgetAlert');
      assert.ok(alerts.length >= 1);
    });
  });

  // =========================================================================
  // Crash Recovery (AC10)
  // =========================================================================

  describe('runSDC — crash recovery', () => {
    it('should save state after each phase', async () => {
      const storyFile = createStoryFile(projectRoot, 'docs/stories/active/state.story.md');

      const sessionManager = createMockSessionManager({
        po: () => ({ summary: 'GO', costUsd: 0.20, messages: [] }),
        dev: () => ({ summary: 'Done.', costUsd: 1.00, messages: [] }),
        qa: () => ({ summary: 'PASS', costUsd: 0.30, messages: [] }),
        devops: () => ({ summary: 'Pushed.', costUsd: 0.10, messages: [] }),
      });

      const engine = createWorkflowEngine({ sessionManager, projectRoot });
      await engine.runSDC({ storyFile, maxBudgetUsd: 30 });

      // State file should be cleared after successful completion (per-story name)
      const stateFile = join(projectRoot, '.aios', 'orchestrator', 'workflow-state-state_story.json');
      assert.ok(!existsSync(stateFile), 'State file should be cleared on success');

      // But reports should exist
      const reportsDir = join(projectRoot, '.aios', 'orchestrator', 'reports');
      assert.ok(existsSync(reportsDir));
    });

    it('should resume from currentPhase on restart', async () => {
      const storyFile = createStoryFile(projectRoot, 'docs/stories/active/resume.story.md');

      // Pre-seed a crash state at DEV:IMPLEMENT (per-story state file)
      const stateDir = join(projectRoot, '.aios', 'orchestrator');
      mkdirSync(stateDir, { recursive: true });

      const crashState = {
        workflowId: 'sdc-crash-test',
        workflow: 'sdc',
        storyFile,
        currentPhase: 'DEV:IMPLEMENT',
        phaseHistory: [
          { phase: 'SM:CREATE', status: 'skipped' },
          { phase: 'PO:VALIDATE', status: 'completed', verdict: 'proceed', costUsd: 0.20 },
        ],
        retries: { 'PO:VALIDATE': 0, 'QA:GATE': 0 },
        totalCostUsd: 0.20,
        maxCostUsd: 30,
        startedAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
        status: 'running',
        error: null,
        concerns: [],
      };
      writeFileSync(
        join(stateDir, 'workflow-state-resume_story.json'),
        JSON.stringify(crashState, null, 2)
      );

      const sessionManager = createMockSessionManager({
        dev: () => ({ summary: 'Done.', costUsd: 1.00, messages: [] }),
        qa: () => ({ summary: 'PASS', costUsd: 0.30, messages: [] }),
        devops: () => ({ summary: 'Pushed.', costUsd: 0.10, messages: [] }),
      });

      const engine = createWorkflowEngine({ sessionManager, projectRoot });
      const report = await engine.runSDC({ storyFile, maxBudgetUsd: 30 });

      assert.equal(report.status, 'success');
      // Should only run DEV, QA, DEVOPS (SM and PO already done)
      assert.equal(sessionManager.calls.length, 3);
      assert.equal(sessionManager.calls[0].agentId, 'dev');
      assert.equal(sessionManager.calls[1].agentId, 'qa');
      assert.equal(sessionManager.calls[2].agentId, 'devops');
    });

    it('should return already_done for completed workflow via resume()', async () => {
      const storyFile = createStoryFile(projectRoot, 'docs/stories/active/done.story.md');

      const stateDir = join(projectRoot, '.aios', 'orchestrator');
      mkdirSync(stateDir, { recursive: true });

      const doneState = {
        workflowId: 'sdc-done-test',
        workflow: 'sdc',
        storyFile,
        currentPhase: '',
        phaseHistory: [],
        retries: {},
        totalCostUsd: 5.0,
        maxCostUsd: 30,
        startedAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
        status: 'done',
        error: null,
      };
      writeFileSync(
        join(stateDir, 'workflow-state.json'),
        JSON.stringify(doneState, null, 2)
      );

      const sessionManager = createMockSessionManager();
      const engine = createWorkflowEngine({ sessionManager, projectRoot });
      const report = await engine.resume('sdc-done-test');

      assert.equal(report.status, 'already_done');
      assert.equal(sessionManager.calls.length, 0);
    });
  });

  // =========================================================================
  // Context Passing
  // =========================================================================

  describe('runSDC — context passing', () => {
    it('should pass previous phase output to next phase prompt', async () => {
      const storyFile = createStoryFile(projectRoot, 'docs/stories/active/ctx.story.md');

      const sessionManager = createMockSessionManager({
        po: () => ({ summary: 'GO. Score: 9/10. All criteria met.', costUsd: 0.20, messages: [] }),
        dev: () => ({ summary: 'Implementation done. Files changed: 3.', costUsd: 1.00, messages: [] }),
        qa: () => ({ summary: 'PASS. All 7 checks passed.', costUsd: 0.30, messages: [] }),
        devops: () => ({ summary: 'Pushed to main.', costUsd: 0.10, messages: [] }),
      });

      const engine = createWorkflowEngine({ sessionManager, projectRoot });
      await engine.runSDC({ storyFile, maxBudgetUsd: 30 });

      // DEV should receive PO's output
      const devCall = sessionManager.calls.find(c => c.agentId === 'dev');
      assert.ok(devCall.prompt.includes('GO. Score: 9/10'));

      // QA should receive DEV's output
      const qaCall = sessionManager.calls.find(c => c.agentId === 'qa');
      assert.ok(qaCall.prompt.includes('Implementation done'));

      // DEVOPS should receive QA's output
      const devopsCall = sessionManager.calls.find(c => c.agentId === 'devops');
      assert.ok(devopsCall.prompt.includes('PASS'));
    });

    it('should include story content in prompts (except DEVOPS)', async () => {
      const storyContent = '# Test Story\n\n## AC1\n- [ ] Must implement feature X\n';
      const storyFile = createStoryFile(projectRoot, 'docs/stories/active/content.story.md', storyContent);

      const sessionManager = createMockSessionManager({
        po: () => ({ summary: 'GO', costUsd: 0.20, messages: [] }),
        dev: () => ({ summary: 'Done.', costUsd: 1.00, messages: [] }),
        qa: () => ({ summary: 'PASS', costUsd: 0.30, messages: [] }),
        devops: () => ({ summary: 'Pushed.', costUsd: 0.10, messages: [] }),
      });

      const engine = createWorkflowEngine({ sessionManager, projectRoot });
      await engine.runSDC({ storyFile, maxBudgetUsd: 30 });

      // PO, DEV, and QA prompts should include story content
      const contentAgents = ['po', 'dev', 'qa'];
      for (const call of sessionManager.calls) {
        if (contentAgents.includes(call.agentId)) {
          assert.ok(call.prompt.includes('Must implement feature X'),
            `Agent ${call.agentId} prompt should include story content`);
        }
      }

      // DEVOPS should include the story file path
      const devopsCall = sessionManager.calls.find(c => c.agentId === 'devops');
      assert.ok(devopsCall.prompt.includes(storyFile),
        'DEVOPS prompt should include story file path');
    });
  });

  // =========================================================================
  // QA Loop (AC12)
  // =========================================================================

  describe('runQALoop', () => {
    it('should approve on first iteration if QA passes', async () => {
      const storyFile = createStoryFile(projectRoot, 'docs/stories/active/qaloop.story.md');

      const sessionManager = createMockSessionManager({
        qa: () => ({ summary: 'APPROVED. Everything looks good.', costUsd: 0.30, messages: [] }),
      });

      const engine = createWorkflowEngine({ sessionManager, projectRoot });
      const report = await engine.runQALoop({ storyFile, maxIterations: 5, maxBudgetUsd: 15 });

      assert.equal(report.status, 'APPROVED');
      assert.equal(report.iterations, 1);
      assert.equal(sessionManager.calls.length, 1); // Only QA, no DEV fix needed
    });

    it('should run DEV:FIX after QA rejection and succeed', async () => {
      const storyFile = createStoryFile(projectRoot, 'docs/stories/active/qaloop2.story.md');
      let qaCallCount = 0;

      const sessionManager = createMockSessionManager({
        qa: () => {
          qaCallCount++;
          if (qaCallCount === 1) {
            return { summary: 'REJECTED. Missing error handling.', costUsd: 0.30, messages: [] };
          }
          return { summary: 'APPROVED. Issues fixed.', costUsd: 0.30, messages: [] };
        },
        dev: () => ({ summary: 'Fixed error handling.', costUsd: 1.00, messages: [] }),
      });

      const engine = createWorkflowEngine({ sessionManager, projectRoot });
      const report = await engine.runQALoop({ storyFile, maxIterations: 5, maxBudgetUsd: 15 });

      assert.equal(report.status, 'APPROVED');
      assert.equal(report.iterations, 2);
      // QA(reject) -> DEV(fix) -> QA(approve)
      assert.equal(sessionManager.calls.length, 3);
    });

    it('should abort after max iterations without approval', async () => {
      const storyFile = createStoryFile(projectRoot, 'docs/stories/active/qamax.story.md');

      const sessionManager = createMockSessionManager({
        qa: () => ({ summary: 'REJECTED. Still has issues.', costUsd: 0.30, messages: [] }),
        dev: () => ({ summary: 'Attempted fix.', costUsd: 1.00, messages: [] }),
      });

      const engine = createWorkflowEngine({ sessionManager, projectRoot });

      await assert.rejects(
        () => engine.runQALoop({ storyFile, maxIterations: 3, maxBudgetUsd: 50 }),
        (err) => {
          assert.ok(err instanceof WorkflowAbortError);
          assert.equal(err.reason, 'max_iterations');
          return true;
        }
      );

      // 3 iterations: QA+DEV, QA+DEV, QA (last iteration no DEV since we're at max)
      assert.equal(sessionManager.calls.length, 5);
    });

    it('should handle QA CONCERNS as approval', async () => {
      const storyFile = createStoryFile(projectRoot, 'docs/stories/active/qaloop-concerns.story.md');

      const sessionManager = createMockSessionManager({
        qa: () => ({ summary: 'CONCERNS: Minor style issues but code is correct.', costUsd: 0.30, messages: [] }),
      });

      const engine = createWorkflowEngine({ sessionManager, projectRoot });
      const report = await engine.runQALoop({ storyFile, maxIterations: 5, maxBudgetUsd: 15 });

      assert.equal(report.status, 'APPROVED');
      assert.ok(report.concerns.length > 0);
    });
  });

  // =========================================================================
  // Error handling
  // =========================================================================

  describe('error handling', () => {
    it('should throw if storyFile is missing', async () => {
      const sessionManager = createMockSessionManager();
      const engine = createWorkflowEngine({ sessionManager, projectRoot });

      await assert.rejects(
        () => engine.runSDC({}),
        { message: 'storyFile is required' }
      );
    });

    it('should throw if sessionManager is missing', () => {
      assert.throws(
        () => createWorkflowEngine({ projectRoot }),
        { message: 'sessionManager is required' }
      );
    });

    it('should abort if a phase throws an error', async () => {
      const storyFile = createStoryFile(projectRoot, 'docs/stories/active/error.story.md');

      const sessionManager = createMockSessionManager({
        po: () => { throw new Error('SDK connection failed'); },
      });

      const comms = createMockCommsBridge();

      const engine = createWorkflowEngine({
        sessionManager,
        commsBridge: comms,
        projectRoot,
      });

      await assert.rejects(
        () => engine.runSDC({ storyFile, maxBudgetUsd: 30 }),
        (err) => {
          assert.ok(err instanceof WorkflowAbortError);
          assert.ok(err.message.includes('SDK connection failed'));
          return true;
        }
      );

      // Error notification sent
      const errors = comms.notifications.filter(n => n.type === 'error');
      assert.ok(errors.length > 0);
    });
  });

  // =========================================================================
  // Workflow Report (AC13)
  // =========================================================================

  describe('workflow report', () => {
    it('should generate complete report on success', async () => {
      const storyFile = createStoryFile(projectRoot, 'docs/stories/active/report.story.md');

      const sessionManager = createMockSessionManager({
        po: () => ({ summary: 'GO', costUsd: 0.20, messages: [] }),
        dev: () => ({ summary: 'Done.', costUsd: 1.00, messages: [] }),
        qa: () => ({ summary: 'PASS', costUsd: 0.30, messages: [] }),
        devops: () => ({ summary: 'Pushed.', costUsd: 0.10, messages: [] }),
      });

      const engine = createWorkflowEngine({ sessionManager, projectRoot });
      const report = await engine.runSDC({ storyFile, maxBudgetUsd: 30 });

      // Verify report schema
      assert.ok(report.workflowId);
      assert.equal(report.workflow, 'sdc');
      assert.equal(report.status, 'success');
      assert.equal(report.storyFile, storyFile);
      assert.ok(Array.isArray(report.phases));
      assert.ok(typeof report.totalCostUsd === 'number');
      assert.ok(typeof report.totalDurationMs === 'number');
      assert.ok(Array.isArray(report.concerns));

      // Report file should be saved
      const reportsDir = join(projectRoot, '.aios', 'orchestrator', 'reports');
      const reportFile = join(reportsDir, `${report.workflowId}.json`);
      assert.ok(existsSync(reportFile), 'Report file should exist on disk');

      const savedReport = JSON.parse(readFileSync(reportFile, 'utf8'));
      assert.equal(savedReport.workflowId, report.workflowId);
      assert.ok(savedReport.generatedAt);
    });
  });
});
