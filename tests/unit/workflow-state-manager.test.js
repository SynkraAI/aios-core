'use strict';

const fs = require('fs').promises;
const os = require('os');
const path = require('path');

const {
  WorkflowStateManager,
} = require('../../.aios-core/development/scripts/workflow-state-manager');

describe('WorkflowStateManager runtime-first recommendations', () => {
  it('creates state with version metadata', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'aios-wsm-'));
    const manager = new WorkflowStateManager({ basePath: tmp });

    const workflowData = {
      workflow: {
        id: 'test-workflow',
        name: 'Test Workflow',
        sequence: [{ agent: 'dev', creates: 'artifact.md' }],
      },
    };

    const state = await manager.createState(workflowData);
    expect(state.state_version).toBe('2.0');
    expect(state.workflow_id).toBe('test-workflow');
  });

  it('prioritizes blocked over other runtime states', () => {
    const manager = new WorkflowStateManager();
    const result = manager.evaluateExecutionState({
      story_status: 'blocked',
      qa_status: 'rejected',
      ci_status: 'red',
      has_uncommitted_changes: true,
    });

    expect(result.state).toBe('blocked');
  });

  it('maps qa rejection to apply-qa-fixes', () => {
    const manager = new WorkflowStateManager();
    const next = manager.getNextActionRecommendation(
      { story_status: 'in_progress', qa_status: 'rejected', ci_status: 'green' },
      { story: 'docs/stories/example.story.md' },
    );

    expect(next.state).toBe('qa_rejected');
    expect(next.command).toContain('*apply-qa-fixes');
    expect(next.agent).toBe('@dev');
  });

  it('maps red ci to run-tests', () => {
    const manager = new WorkflowStateManager();
    const next = manager.getNextActionRecommendation({
      story_status: 'in_progress',
      qa_status: 'pass',
      ci_status: 'red',
      has_uncommitted_changes: false,
    });

    expect(next.state).toBe('ci_red');
    expect(next.command).toBe('*run-tests');
  });

  it('maps in-progress + clean tree to qa review', () => {
    const manager = new WorkflowStateManager();
    const next = manager.getNextActionRecommendation(
      {
        story_status: 'in_progress',
        qa_status: 'pass',
        ci_status: 'green',
        has_uncommitted_changes: false,
      },
      { story: 'story.md' },
    );

    expect(next.state).toBe('ready_for_validation');
    expect(next.command).toContain('*review-build');
    expect(next.agent).toBe('@qa');
  });
});
