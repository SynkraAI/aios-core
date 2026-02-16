'use strict';

const fs = require('fs-extra');
const path = require('path');
const os = require('os');

const ContextManager = require('../../../.aios-core/core/orchestration/context-manager');

describe('ContextManager structured handoff package', () => {
  let tempDir;
  let manager;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aios-handoff-'));
    manager = new ContextManager('test-workflow', tempDir);
    await manager.initialize();
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it('saves standardized handoff package in phase output', async () => {
    await manager.savePhaseOutput(
      1,
      {
        agent: 'architect',
        task: 'spec-write-spec.md',
        result: {
          decisions: [{ id: 'D1', summary: 'Use API gateway' }],
          evidence_links: ['docs/spec.md'],
          open_risks: ['Gateway latency spike'],
        },
        validation: {
          checks: [{ type: 'file_exists', path: 'docs/spec.md', passed: true }],
        },
      },
      { handoffTarget: { phase: 2, agent: 'dev' } },
    );

    const state = await manager.loadState();
    const handoff = state.phases[1].handoff;

    expect(handoff).toBeDefined();
    expect(handoff.workflow_id).toBe('test-workflow');
    expect(handoff.from.phase).toBe(1);
    expect(handoff.from.agent).toBe('architect');
    expect(handoff.to.phase).toBe(2);
    expect(handoff.to.agent).toBe('dev');
    expect(handoff.decision_log.count).toBe(1);
    expect(handoff.evidence_links).toContain('docs/spec.md');
    expect(handoff.open_risks).toContain('Gateway latency spike');
  });

  it('writes handoff artifact file to handoffs directory', async () => {
    await manager.savePhaseOutput(
      2,
      {
        agent: 'dev',
        task: 'dev-develop-story.md',
        result: { decisions: [] },
      },
      { handoffTarget: { phase: 3, agent: 'qa' } },
    );

    const handoffPath = path.join(
      tempDir,
      '.aios',
      'workflow-state',
      'handoffs',
      'test-workflow-phase-2.handoff.json',
    );
    const exists = await fs.pathExists(handoffPath);
    const content = await fs.readJson(handoffPath);

    expect(exists).toBe(true);
    expect(content.from.phase).toBe(2);
    expect(content.to.agent).toBe('qa');
  });

  it('provides previous handoffs in getContextForPhase', async () => {
    await manager.savePhaseOutput(
      1,
      {
        agent: 'architect',
        result: { decisions: [{ id: 'D1' }] },
      },
      { handoffTarget: { phase: 2, agent: 'dev' } },
    );

    const phase2Context = await manager.getContextForPhase(2);
    expect(phase2Context.previousHandoffs).toBeDefined();
    expect(phase2Context.previousHandoffs['1']).toBeDefined();
    expect(phase2Context.previousHandoffs['1'].to.agent).toBe('dev');
  });
});
