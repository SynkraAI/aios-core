'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const { syncSkills } = require('../../.aios-core/infrastructure/scripts/codex-skills-sync/index');
const { validateCodexSkills } = require('../../.aios-core/infrastructure/scripts/codex-skills-sync/validate');

describe('Codex Skills Validator', () => {
  let tmpRoot;
  let sourceDir;
  let sourceTasksDir;
  let skillsDir;
  let taskCatalogPath;
  let expectedAgentCount;

  beforeEach(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'aios-codex-validate-'));
    sourceDir = path.join(process.cwd(), '.aios-core', 'development', 'agents');
    sourceTasksDir = path.join(process.cwd(), '.aios-core', 'development', 'tasks');
    skillsDir = path.join(tmpRoot, '.codex', 'skills');
    taskCatalogPath = path.join(
      tmpRoot,
      '.aios-core',
      'infrastructure',
      'contracts',
      'task-skill-catalog.yaml',
    );
    expectedAgentCount = fs.readdirSync(sourceDir, { withFileTypes: true })
      .filter(entry => entry.isDirectory() && fs.existsSync(path.join(sourceDir, entry.name, `${entry.name}.md`)))
      .length;
  });

  afterEach(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  it('passes when all generated skills are present and valid', () => {
    syncSkills({ sourceDir, localSkillsDir: skillsDir, dryRun: false });

    const result = validateCodexSkills({
      projectRoot: tmpRoot,
      sourceDir,
      sourceTasksDir,
      skillsDir,
      strict: true,
    });

    expect(result.ok).toBe(true);
    expect(result.checked).toBe(expectedAgentCount);
    expect(result.errors).toEqual([]);
  });

  it('fails when a generated skill is missing', () => {
    syncSkills({ sourceDir, localSkillsDir: skillsDir, dryRun: false });
    fs.rmSync(path.join(skillsDir, 'architect', 'SKILL.md'), { force: true });

    const result = validateCodexSkills({
      projectRoot: tmpRoot,
      sourceDir,
      sourceTasksDir,
      skillsDir,
      strict: true,
    });

    expect(result.ok).toBe(false);
    expect(result.errors.some(error => error.includes('Missing skill file'))).toBe(true);
  });

  it('passes when skill content uses inline greeting (no generate-greeting.js)', () => {
    syncSkills({ sourceDir, localSkillsDir: skillsDir, dryRun: false });
    const target = path.join(skillsDir, 'dev', 'SKILL.md');
    const content = fs.readFileSync(target, 'utf8');

    // Skills should NOT reference generate-greeting.js (removed)
    expect(content).not.toContain('generate-greeting.js');
    expect(content).toContain('Present yourself with a brief greeting');

    const result = validateCodexSkills({
      projectRoot: tmpRoot,
      sourceDir,
      sourceTasksDir,
      skillsDir,
      strict: true,
    });

    expect(result.ok).toBe(true);
  });

  it('fails in strict mode when orphaned aios-* skill dir exists', () => {
    syncSkills({ sourceDir, localSkillsDir: skillsDir, dryRun: false });
    const orphanPath = path.join(skillsDir, 'aios-legacy');
    fs.mkdirSync(orphanPath, { recursive: true });
    fs.writeFileSync(path.join(orphanPath, 'SKILL.md'), '# legacy', 'utf8');

    const result = validateCodexSkills({
      projectRoot: tmpRoot,
      sourceDir,
      sourceTasksDir,
      skillsDir,
      strict: true,
    });

    expect(result.ok).toBe(false);
    expect(result.orphaned).toContain('aios-legacy');
  });

  it('allows catalog-listed task skills in strict mode', () => {
    syncSkills({ sourceDir, localSkillsDir: skillsDir, dryRun: false });

    fs.mkdirSync(path.dirname(taskCatalogPath), { recursive: true });
    fs.writeFileSync(
      taskCatalogPath,
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
      'utf8',
    );

    const taskSkillDir = path.join(skillsDir, 'qa-execute-checklist');
    fs.mkdirSync(taskSkillDir, { recursive: true });
    fs.writeFileSync(path.join(taskSkillDir, 'SKILL.md'), '# task skill', 'utf8');

    const result = validateCodexSkills({
      projectRoot: tmpRoot,
      sourceDir,
      sourceTasksDir,
      skillsDir,
      strict: true,
      taskSkillCatalogPath: taskCatalogPath,
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('allows source-derived task skills in strict mode even when not catalog-listed', () => {
    syncSkills({ sourceDir, localSkillsDir: skillsDir, dryRun: false });

    const taskSkillDir = path.join(skillsDir, 'aios-master-analyze-brownfield');
    fs.mkdirSync(taskSkillDir, { recursive: true });
    fs.writeFileSync(path.join(taskSkillDir, 'SKILL.md'), '# task skill', 'utf8');

    const result = validateCodexSkills({
      projectRoot: tmpRoot,
      sourceDir,
      sourceTasksDir,
      skillsDir,
      strict: true,
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('normalizes task skill agent alias from catalog (github-devops -> devops)', () => {
    syncSkills({ sourceDir, localSkillsDir: skillsDir, dryRun: false });

    fs.mkdirSync(path.dirname(taskCatalogPath), { recursive: true });
    fs.writeFileSync(
      taskCatalogPath,
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
      'utf8',
    );

    const taskSkillDir = path.join(skillsDir, 'devops-publish-npm');
    fs.mkdirSync(taskSkillDir, { recursive: true });
    fs.writeFileSync(path.join(taskSkillDir, 'SKILL.md'), '# task skill', 'utf8');

    const result = validateCodexSkills({
      projectRoot: tmpRoot,
      sourceDir,
      sourceTasksDir,
      skillsDir,
      strict: true,
      taskSkillCatalogPath: taskCatalogPath,
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('flags invalid source-derived task/agent combinations in strict mode', () => {
    syncSkills({ sourceDir, localSkillsDir: skillsDir, dryRun: false });

    // "spec-write-spec" is owned by PM in full mapping, so devops binding must be rejected.
    const invalidTaskSkillDir = path.join(skillsDir, 'devops-spec-write-spec');
    fs.mkdirSync(invalidTaskSkillDir, { recursive: true });
    fs.writeFileSync(path.join(invalidTaskSkillDir, 'SKILL.md'), '# task skill', 'utf8');

    const result = validateCodexSkills({
      projectRoot: tmpRoot,
      sourceDir,
      sourceTasksDir,
      skillsDir,
      strict: true,
    });

    expect(result.ok).toBe(false);
    expect(result.orphaned).toContain('devops-spec-write-spec');
  });
});
