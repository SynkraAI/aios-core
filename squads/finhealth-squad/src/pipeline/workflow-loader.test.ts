/**
 * Tests for Workflow Loader
 * FinHealth Squad — YAML Loading & Validation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  readdirSync: vi.fn(),
}));

import { loadWorkflow, loadWorkflowsFromDir } from './workflow-loader';
import * as fs from 'fs';

// ============================================================================
// Fixtures
// ============================================================================

const VALID_YAML = `
name: test-pipeline
version: 1.0.0
description: "Test pipeline"
metadata:
  squad: finhealth-squad
  category: billing
  priority: high
input:
  type: object
  required:
    - accountId
  properties:
    accountId:
      type: string
steps:
  - id: step-a
    name: "Step A"
    task: task-a
    agent: agent-a
    input:
      value: "{{input.accountId}}"
    output:
      result: "{{result.data}}"
  - id: step-b
    name: "Step B"
    task: task-b
    agent: agent-b
    dependsOn: [step-a]
    input:
      prev: "{{steps.step-a.output.result}}"
output:
  type: object
  properties:
    finalResult:
      type: string
      source: "{{steps.step-b.output.result}}"
onError:
  - condition: "steps.step-a.failed"
    action: retry
    maxRetries: 2
    backoff: exponential
`;

const MINIMAL_YAML = `
name: minimal
version: 1.0.0
description: "Minimal workflow"
steps:
  - id: only-step
    task: do-thing
    agent: some-agent
    input:
      key: value
`;

const MISSING_STEPS_YAML = `
name: bad
version: 1.0.0
description: "No steps"
steps: []
`;

const INVALID_STEP_YAML = `
name: bad-step
version: 1.0.0
description: "Bad step"
steps:
  - id: ""
    task: ""
    agent: ""
    input: {}
`;

const DUPLICATE_IDS_YAML = `
name: dupes
version: 1.0.0
description: "Duplicate step IDs"
steps:
  - id: same
    task: task-a
    agent: agent-a
    input: {}
  - id: same
    task: task-b
    agent: agent-b
    input: {}
`;

const BAD_DEPENDS_YAML = `
name: bad-deps
version: 1.0.0
description: "Invalid dependsOn"
steps:
  - id: step-a
    task: task-a
    agent: agent-a
    dependsOn: [nonexistent]
    input: {}
`;

// ============================================================================
// Tests
// ============================================================================

describe('loadWorkflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load and parse a valid workflow YAML', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(VALID_YAML);

    const wf = loadWorkflow('/test/workflow.yaml');
    expect(wf.name).toBe('test-pipeline');
    expect(wf.version).toBe('1.0.0');
    expect(wf.steps).toHaveLength(2);
    expect(wf.steps[0].id).toBe('step-a');
    expect(wf.steps[1].dependsOn).toEqual(['step-a']);
    expect(wf.onError).toHaveLength(1);
    expect(wf.input?.required).toEqual(['accountId']);
  });

  it('should load a minimal workflow', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(MINIMAL_YAML);

    const wf = loadWorkflow('/test/minimal.yaml');
    expect(wf.name).toBe('minimal');
    expect(wf.steps).toHaveLength(1);
    expect(wf.metadata).toBeUndefined();
    expect(wf.onError).toBeUndefined();
  });

  it('should throw when file does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    expect(() => loadWorkflow('/missing.yaml')).toThrow('Workflow file not found');
  });

  it('should throw on invalid YAML syntax', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue('{ invalid yaml ::');
    expect(() => loadWorkflow('/bad.yaml')).toThrow('Invalid YAML');
  });

  it('should throw when steps array is empty', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(MISSING_STEPS_YAML);
    expect(() => loadWorkflow('/empty-steps.yaml')).toThrow('Invalid workflow definition');
  });

  it('should throw on invalid step fields', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(INVALID_STEP_YAML);
    expect(() => loadWorkflow('/bad-step.yaml')).toThrow('Invalid workflow definition');
  });

  it('should throw on duplicate step IDs', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(DUPLICATE_IDS_YAML);
    expect(() => loadWorkflow('/dupes.yaml')).toThrow('Duplicate step IDs');
  });

  it('should throw on invalid dependsOn reference', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(BAD_DEPENDS_YAML);
    expect(() => loadWorkflow('/bad-deps.yaml')).toThrow('depends on unknown step');
  });
});

describe('loadWorkflowsFromDir', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load all .yaml files from directory', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue([
      'billing.yaml',
      'audit.yaml',
      'readme.txt',
    ] as any);
    vi.mocked(fs.readFileSync).mockImplementation((p: any) => {
      if (String(p).includes('billing')) {
        return VALID_YAML;
      }
      return MINIMAL_YAML.replace('minimal', 'audit-pipeline');
    });

    const workflows = loadWorkflowsFromDir('/test/workflows');
    expect(workflows.size).toBe(2);
    expect(workflows.has('test-pipeline')).toBe(true);
    expect(workflows.has('audit-pipeline')).toBe(true);
  });

  it('should also load .yml files', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue(['flow.yml'] as any);
    vi.mocked(fs.readFileSync).mockReturnValue(MINIMAL_YAML);

    const workflows = loadWorkflowsFromDir('/test/workflows');
    expect(workflows.size).toBe(1);
  });

  it('should throw when directory does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    expect(() => loadWorkflowsFromDir('/missing')).toThrow('Workflows directory not found');
  });

  it('should skip non-yaml files', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue(['readme.md', '.gitkeep'] as any);

    const workflows = loadWorkflowsFromDir('/test/workflows');
    expect(workflows.size).toBe(0);
  });
});
