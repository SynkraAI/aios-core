'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  syncTaskSkills,
} = require('../../.aios-core/infrastructure/scripts/task-skills-sync/index');
const {
  validateTaskSkills,
} = require('../../.aios-core/infrastructure/scripts/task-skills-sync/validate');

describe('task-skills-sync validate', () => {
  let tmpRoot;
  let sourceDir;
  let sourceAgentsDir;
  let catalogPath;

  function write(file, content = '') {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content, 'utf8');
  }

  beforeEach(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'aios-task-skills-validate-'));
    sourceDir = path.join(process.cwd(), '.aios-core', 'development', 'tasks');
    sourceAgentsDir = path.join(process.cwd(), '.aios-core', 'development', 'agents');
    catalogPath = path.join(
      tmpRoot,
      '.aios-core',
      'infrastructure',
      'contracts',
      'task-skill-catalog.yaml',
    );

    write(
      catalogPath,
      [
        'schema_version: 1',
        'targets:',
        '  codex:',
        '    enabled: true',
        '    path: .codex/skills',
        'allowlist:',
        '  - task_id: execute-checklist',
        '    agent: qa',
      ].join('\n'),
    );
  });

  afterEach(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  it('passes when expected task skills exist', () => {
    syncTaskSkills({
      projectRoot: tmpRoot,
      sourceDir,
      sourceAgentsDir,
      catalogPath,
      target: 'codex',
      scope: 'catalog',
      dryRun: false,
    });

    const result = validateTaskSkills({
      projectRoot: tmpRoot,
      sourceDir,
      sourceAgentsDir,
      catalogPath,
      scope: 'catalog',
      strict: true,
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.metrics.checkedSkills).toBe(1);
  });

  it('fails when expected task skill file is missing', () => {
    syncTaskSkills({
      projectRoot: tmpRoot,
      sourceDir,
      sourceAgentsDir,
      catalogPath,
      target: 'codex',
      scope: 'catalog',
      dryRun: false,
    });

    fs.rmSync(path.join(tmpRoot, '.codex', 'skills', 'qa-execute-checklist', 'SKILL.md'));

    const result = validateTaskSkills({
      projectRoot: tmpRoot,
      sourceDir,
      sourceAgentsDir,
      catalogPath,
      scope: 'catalog',
      strict: true,
    });

    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('Missing task skill file'))).toBe(true);
  });

  it('fails when catalog entry does not declare an agent', () => {
    write(
      catalogPath,
      [
        'schema_version: 1',
        'targets:',
        '  codex:',
        '    enabled: true',
        '    path: .codex/skills',
        'allowlist:',
        '  - task_id: execute-checklist',
      ].join('\n'),
    );

    const result = validateTaskSkills({
      projectRoot: tmpRoot,
      sourceDir,
      sourceAgentsDir,
      catalogPath,
      scope: 'catalog',
      strict: true,
    });

    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('missing agent'))).toBe(true);
  });

  it('passes in full scope with fallback agent and validates all source tasks', () => {
    syncTaskSkills({
      projectRoot: tmpRoot,
      sourceDir,
      sourceAgentsDir,
      catalogPath,
      target: 'codex',
      scope: 'full',
      fallbackAgent: 'master',
      dryRun: false,
    });

    const result = validateTaskSkills({
      projectRoot: tmpRoot,
      sourceDir,
      sourceAgentsDir,
      catalogPath,
      scope: 'full',
      fallbackAgent: 'master',
      strict: true,
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.metrics.expectedTasks).toBe(result.metrics.sourceTasks);
    expect(result.metrics.checkedSkills).toBe(result.metrics.sourceTasks);
  });
});
