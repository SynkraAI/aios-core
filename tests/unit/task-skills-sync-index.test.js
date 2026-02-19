'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  syncTaskSkills,
  inferAgentFromFilename,
} = require('../../.aios-core/infrastructure/scripts/task-skills-sync/index');

describe('task-skills-sync index', () => {
  let tmpRoot;
  let sourceDir;
  let sourceAgentsDir;
  let catalogPath;

  function write(file, content = '') {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content, 'utf8');
  }

  beforeEach(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'aios-task-skills-sync-'));
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
        '  claude:',
        '    enabled: true',
        '    path: .claude/skills',
        'allowlist:',
        '  - task_id: execute-checklist',
        '    agent: qa',
        '  - task_id: create-doc',
        '    agent: po',
      ].join('\n'),
    );
  });

  afterEach(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  it('generates task skills for all enabled targets', () => {
    const result = syncTaskSkills({
      projectRoot: tmpRoot,
      sourceDir,
      sourceAgentsDir,
      catalogPath,
      scope: 'catalog',
      dryRun: false,
    });

    expect(result.targets).toHaveLength(2);
    expect(fs.existsSync(path.join(tmpRoot, '.codex', 'skills', 'qa-execute-checklist', 'SKILL.md'))).toBe(true);
    expect(fs.existsSync(path.join(tmpRoot, '.claude', 'skills', 'po-create-doc', 'SKILL.md'))).toBe(true);
  });

  it('prunes orphaned task skill dirs when prune is enabled', () => {
    const orphanDir = path.join(tmpRoot, '.codex', 'skills', 'dev-legacy');
    write(path.join(orphanDir, 'SKILL.md'), 'Load .aios-core/development/tasks/legacy.md');

    const result = syncTaskSkills({
      projectRoot: tmpRoot,
      sourceDir,
      sourceAgentsDir,
      catalogPath,
      target: 'codex',
      scope: 'catalog',
      dryRun: false,
      prune: true,
    });

    expect(result.targets).toHaveLength(1);
    expect(result.targets[0].pruned).toContain('dev-legacy');
    expect(fs.existsSync(orphanDir)).toBe(false);
  });

  it('supports full scope with fallback agent and task-owned agent extraction', () => {
    const sourceTaskCount = fs.readdirSync(sourceDir).filter((name) => name.endsWith('.md')).length;

    const result = syncTaskSkills({
      projectRoot: tmpRoot,
      sourceDir,
      sourceAgentsDir,
      catalogPath,
      target: 'codex',
      scope: 'full',
      fallbackAgent: 'master',
      dryRun: false,
    });

    expect(result.targets).toHaveLength(1);
    expect(result.targets[0].generated).toBe(sourceTaskCount);
    expect(fs.existsSync(path.join(tmpRoot, '.codex', 'skills', 'devops-environment-bootstrap', 'SKILL.md'))).toBe(true);
    expect(fs.existsSync(path.join(tmpRoot, '.codex', 'skills', 'architect-analyze-brownfield', 'SKILL.md'))).toBe(true);
  });

  it('normalizes github-devops alias to devops in catalog entries', () => {
    write(
      catalogPath,
      [
        'schema_version: 1',
        'targets:',
        '  codex:',
        '    enabled: true',
        '    path: .codex/skills',
        'agent_aliases:',
        '  github-devops: devops',
        'allowlist:',
        '  - task_id: publish-npm',
        '    agent: github-devops',
      ].join('\n'),
    );

    const result = syncTaskSkills({
      projectRoot: tmpRoot,
      sourceDir,
      sourceAgentsDir,
      catalogPath,
      target: 'codex',
      scope: 'catalog',
      dryRun: false,
    });

    expect(result.targets).toHaveLength(1);
    expect(result.targets[0].generated).toBe(1);
    expect(fs.existsSync(path.join(tmpRoot, '.codex', 'skills', 'devops-publish-npm', 'SKILL.md'))).toBe(true);
  });
});

describe('inferAgentFromFilename', () => {
  const emptyMap = new Map();
  const aliasMap = new Map([
    ['github-devops', 'devops'],
    ['db', 'data-engineer'],
    ['ux', 'ux-design-expert'],
    ['aios-developer', 'dev'],
  ]);

  it('returns qa for qa-prefixed tasks', () => {
    expect(inferAgentFromFilename('qa-gate', emptyMap)).toBe('qa');
    expect(inferAgentFromFilename('qa-review-story', emptyMap)).toBe('qa');
  });

  it('returns dev for dev-prefixed tasks', () => {
    expect(inferAgentFromFilename('dev-develop-story', emptyMap)).toBe('dev');
  });

  it('returns po for po-prefixed tasks', () => {
    expect(inferAgentFromFilename('po-backlog-add', emptyMap)).toBe('po');
  });

  it('returns squad-creator for squad-creator-prefixed tasks (longest match)', () => {
    expect(inferAgentFromFilename('squad-creator-analyze', emptyMap)).toBe('squad-creator');
  });

  it('resolves db- prefix via alias to data-engineer', () => {
    expect(inferAgentFromFilename('db-schema-audit', aliasMap)).toBe('data-engineer');
  });

  it('resolves ux- prefix via alias to ux-design-expert', () => {
    expect(inferAgentFromFilename('ux-create-wireframe', aliasMap)).toBe('ux-design-expert');
  });

  it('resolves github-devops- prefix via alias to devops', () => {
    expect(inferAgentFromFilename('github-devops-pre-push-quality-gate', aliasMap)).toBe('devops');
  });

  it('returns null for tasks without known prefix', () => {
    expect(inferAgentFromFilename('execute-checklist', emptyMap)).toBeNull();
    expect(inferAgentFromFilename('build', emptyMap)).toBeNull();
    expect(inferAgentFromFilename('waves', emptyMap)).toBeNull();
  });

  it('returns sm for sm-prefixed tasks', () => {
    expect(inferAgentFromFilename('sm-create-next-story', emptyMap)).toBe('sm');
  });

  it('returns architect for architect-prefixed tasks', () => {
    expect(inferAgentFromFilename('architect-analyze-impact', emptyMap)).toBe('architect');
  });
});
