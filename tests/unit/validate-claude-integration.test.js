'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  validateClaudeIntegration,
} = require('../../.aios-core/infrastructure/scripts/validate-claude-integration');

describe('validate-claude-integration', () => {
  let tmpRoot;

  function write(file, content = '') {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content, 'utf8');
  }

  beforeEach(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'validate-claude-'));
  });

  afterEach(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  it('passes when required Claude files exist', () => {
    write(path.join(tmpRoot, '.claude', 'CLAUDE.md'), '# rules');
    write(path.join(tmpRoot, '.claude', 'hooks', 'hook.js'), '');
    write(path.join(tmpRoot, '.claude', 'agents', 'dev.md'), '# native dev');
    write(path.join(tmpRoot, '.claude', 'skills', 'dev', 'SKILL.md'), '# skill');
    write(path.join(tmpRoot, '.aios-core', 'development', 'agents', 'dev.md'), '# dev');

    const result = validateClaudeIntegration({ projectRoot: tmpRoot });
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.metrics.claudeNativeAgents).toBeGreaterThanOrEqual(1);
    expect(result.metrics.claudeCommandAdapters).toBe(0);
    expect(result.metrics.claudeSkills).toBeGreaterThanOrEqual(1);
  });

  it('fails when Claude native directory is missing', () => {
    const result = validateClaudeIntegration({ projectRoot: tmpRoot });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('Missing Claude native agents dir'))).toBe(true);
  });

  it('fails when source agent files are missing from native/skills outputs', () => {
    write(path.join(tmpRoot, '.claude', 'agents', 'dev.md'), '# native dev');
    write(path.join(tmpRoot, '.claude', 'skills', 'dev', 'SKILL.md'), '# skill');
    write(path.join(tmpRoot, '.aios-core', 'development', 'agents', 'dev.md'), '# dev');
    write(path.join(tmpRoot, '.aios-core', 'development', 'agents', 'qa.md'), '# qa');

    const result = validateClaudeIntegration({ projectRoot: tmpRoot });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('Missing Claude native agent files'))).toBe(true);
    expect(result.errors.some((e) => e.includes('Missing Claude skill files'))).toBe(true);
  });

  it('fails when native agents have duplicate frontmatter names', () => {
    write(
      path.join(tmpRoot, '.claude', 'agents', 'dev.md'),
      ['---', 'name: aios-dev', '---', '# dev'].join('\n'),
    );
    write(
      path.join(tmpRoot, '.claude', 'agents', 'aios-dev.md'),
      ['---', 'name: aios-dev', '---', '# legacy dev'].join('\n'),
    );
    write(path.join(tmpRoot, '.claude', 'skills', 'dev', 'SKILL.md'), '# skill');
    write(path.join(tmpRoot, '.aios-core', 'development', 'agents', 'dev.md'), '# dev');

    const result = validateClaudeIntegration({ projectRoot: tmpRoot });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('Duplicate Claude native agent name'))).toBe(true);
  });

  it('fails when command adapter files still exist', () => {
    write(path.join(tmpRoot, '.claude', 'CLAUDE.md'), '# rules');
    write(path.join(tmpRoot, '.claude', 'agents', 'dev.md'), '# native dev');
    write(path.join(tmpRoot, '.claude', 'commands', 'AIOS', 'agents', 'dev.md'), '# old adapter');
    write(path.join(tmpRoot, '.claude', 'skills', 'dev', 'SKILL.md'), '# skill');
    write(path.join(tmpRoot, '.aios-core', 'development', 'agents', 'dev.md'), '# dev');

    const result = validateClaudeIntegration({ projectRoot: tmpRoot });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('command adapters must be removed'))).toBe(true);
  });
});
