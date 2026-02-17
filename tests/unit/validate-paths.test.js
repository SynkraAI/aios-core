'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const { validatePaths } = require('../../.aios-core/infrastructure/scripts/validate-paths');

describe('Path Validator', () => {
  let tmpRoot;
  let skillsDir;

  function write(file, content) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content, 'utf8');
  }

  beforeEach(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'aios-path-validate-'));
    skillsDir = path.join(tmpRoot, '.codex', 'skills');
  });

  afterEach(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  it('passes with relative canonical paths', () => {
    write(path.join(tmpRoot, 'AGENTS.md'), '# Agents\n');
    write(path.join(tmpRoot, '.aios-core', 'product', 'templates', 'ide-rules', 'codex-rules.md'), '# codex\n');
    write(
      path.join(skillsDir, 'aios-dev', 'SKILL.md'),
      [
        '# Skill',
        'Load .aios-core/development/agents/dev.md',
        'Run node .aios-core/development/scripts/generate-greeting.js dev',
      ].join('\n'),
    );

    const result = validatePaths({
      projectRoot: tmpRoot,
      skillsDir,
      requiredFiles: [
        path.join(tmpRoot, 'AGENTS.md'),
        path.join(tmpRoot, '.aios-core', 'product', 'templates', 'ide-rules', 'codex-rules.md'),
      ],
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('fails when absolute user path is found', () => {
    write(path.join(tmpRoot, 'AGENTS.md'), 'Path /Users/alan/Code/aios-core');
    write(path.join(tmpRoot, '.aios-core', 'product', 'templates', 'ide-rules', 'codex-rules.md'), '# codex\n');
    write(
      path.join(skillsDir, 'aios-dev', 'SKILL.md'),
      [
        '# Skill',
        'Load .aios-core/development/agents/dev.md',
        'Run node .aios-core/development/scripts/generate-greeting.js dev',
      ].join('\n'),
    );

    const result = validatePaths({
      projectRoot: tmpRoot,
      skillsDir,
      requiredFiles: [
        path.join(tmpRoot, 'AGENTS.md'),
        path.join(tmpRoot, '.aios-core', 'product', 'templates', 'ide-rules', 'codex-rules.md'),
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.errors.some(error => error.includes('forbidden absolute path'))).toBe(true);
  });

  it('fails when skill lacks canonical activation paths', () => {
    write(path.join(tmpRoot, 'AGENTS.md'), '# Agents\n');
    write(path.join(tmpRoot, '.aios-core', 'product', 'templates', 'ide-rules', 'codex-rules.md'), '# codex\n');
    write(path.join(skillsDir, 'aios-dev', 'SKILL.md'), '# Skill\nUse dev\n');

    const result = validatePaths({
      projectRoot: tmpRoot,
      skillsDir,
      requiredFiles: [
        path.join(tmpRoot, 'AGENTS.md'),
        path.join(tmpRoot, '.aios-core', 'product', 'templates', 'ide-rules', 'codex-rules.md'),
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.errors.some(error => error.includes('missing canonical source path'))).toBe(true);
    expect(result.errors.some(error => error.includes('missing canonical greeting script path'))).toBe(true);
  });
});
