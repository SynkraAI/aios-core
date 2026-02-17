'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const { syncSkills } = require('../../.aios-core/infrastructure/scripts/codex-skills-sync/index');
const { validateCodexSkills } = require('../../.aios-core/infrastructure/scripts/codex-skills-sync/validate');

describe('Codex Skills Validator', () => {
  let tmpRoot;
  let sourceDir;
  let skillsDir;
  let expectedAgentCount;

  beforeEach(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'aios-codex-validate-'));
    sourceDir = path.join(process.cwd(), '.aios-core', 'development', 'agents');
    skillsDir = path.join(tmpRoot, '.codex', 'skills');
    expectedAgentCount = fs.readdirSync(sourceDir).filter(name => name.endsWith('.md')).length;
  });

  afterEach(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  it('passes when all generated skills are present and valid', () => {
    syncSkills({ sourceDir, localSkillsDir: skillsDir, dryRun: false });

    const result = validateCodexSkills({
      projectRoot: tmpRoot,
      sourceDir,
      skillsDir,
      strict: true,
    });

    expect(result.ok).toBe(true);
    expect(result.checked).toBe(expectedAgentCount);
    expect(result.errors).toEqual([]);
  });

  it('fails when a generated skill is missing', () => {
    syncSkills({ sourceDir, localSkillsDir: skillsDir, dryRun: false });
    fs.rmSync(path.join(skillsDir, 'aios-architect', 'SKILL.md'), { force: true });

    const result = validateCodexSkills({
      projectRoot: tmpRoot,
      sourceDir,
      skillsDir,
      strict: true,
    });

    expect(result.ok).toBe(false);
    expect(result.errors.some(error => error.includes('Missing skill file'))).toBe(true);
  });

  it('fails when greeting command is removed from a skill', () => {
    syncSkills({ sourceDir, localSkillsDir: skillsDir, dryRun: false });
    const target = path.join(skillsDir, 'aios-dev', 'SKILL.md');
    const original = fs.readFileSync(target, 'utf8');
    fs.writeFileSync(target, original.replace('generate-greeting.js dev', 'generate-greeting.js'), 'utf8');

    const result = validateCodexSkills({
      projectRoot: tmpRoot,
      sourceDir,
      skillsDir,
      strict: true,
    });

    expect(result.ok).toBe(false);
    expect(result.errors.some(error => error.includes('missing canonical greeting command'))).toBe(true);
  });

  it('fails in strict mode when orphaned aios-* skill dir exists', () => {
    syncSkills({ sourceDir, localSkillsDir: skillsDir, dryRun: false });
    const orphanPath = path.join(skillsDir, 'aios-legacy');
    fs.mkdirSync(orphanPath, { recursive: true });
    fs.writeFileSync(path.join(orphanPath, 'SKILL.md'), '# legacy', 'utf8');

    const result = validateCodexSkills({
      projectRoot: tmpRoot,
      sourceDir,
      skillsDir,
      strict: true,
    });

    expect(result.ok).toBe(false);
    expect(result.orphaned).toContain('aios-legacy');
  });
});
