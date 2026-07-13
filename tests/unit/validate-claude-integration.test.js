'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const {
  validateClaudeIntegration,
  listTopLevelNames,
} = require('../../.aiox-core/infrastructure/scripts/validate-claude-integration');

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
    jest.restoreAllMocks();
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  it('passes when required Claude files exist', () => {
    write(path.join(tmpRoot, '.claude', 'CLAUDE.md'), '# rules');
    write(path.join(tmpRoot, '.claude', 'hooks', 'hook.js'), '');
    write(path.join(tmpRoot, '.claude', 'commands', 'AIOX', 'agents', 'dev.md'), '# dev');
    write(
      path.join(tmpRoot, '.claude', 'skills', 'AIOX', 'agents', 'dev', 'SKILL.md'),
      '---\nactivation_type: pipeline\n---\n# dev',
    );
    write(path.join(tmpRoot, '.aiox-core', 'development', 'agents', 'dev.md'), '# dev');

    const result = validateClaudeIntegration({ projectRoot: tmpRoot });
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.metrics.claudeSkills).toBe(1);
    expect(result.metrics.claudeCommands).toBe(1);
  });

  it('allows versioned Claude SDC skill artifacts', () => {
    write(path.join(tmpRoot, '.claude', 'commands', 'AIOX', 'agents', 'dev.md'), '# dev');
    write(
      path.join(tmpRoot, '.claude', 'skills', 'AIOX', 'agents', 'dev', 'SKILL.md'),
      '---\nactivation_type: pipeline\n---\n# dev',
    );
    write(path.join(tmpRoot, '.claude', 'skills', 'full-sdc', 'SKILL.md'), '# full-sdc');
    write(path.join(tmpRoot, '.claude', 'skills', 'wave-execute', 'SKILL.md'), '# wave-execute');
    write(path.join(tmpRoot, '.aiox-core', 'development', 'agents', 'dev.md'), '# dev');

    const result = validateClaudeIntegration({ projectRoot: tmpRoot });
    expect(result.ok).toBe(true);
  });

  it('ignores local Claude artifacts excluded by gitignore', () => {
    const init = spawnSync('git', ['init'], { cwd: tmpRoot, encoding: 'utf8' });
    expect(init.status).toBe(0);

    write(
      path.join(tmpRoot, '.gitignore'),
      [
        '.claude/commands/hybridOps/',
        '.claude/skills/aios-*/',
        '',
      ].join('\n'),
    );
    write(path.join(tmpRoot, '.claude', 'commands', 'AIOX', 'agents', 'dev.md'), '# dev');
    write(path.join(tmpRoot, '.claude', 'commands', 'hybridOps', 'legacy.md'), '# legacy');
    write(
      path.join(tmpRoot, '.claude', 'skills', 'AIOX', 'agents', 'dev', 'SKILL.md'),
      '---\nactivation_type: pipeline\n---\n# dev',
    );
    write(path.join(tmpRoot, '.claude', 'skills', 'aios-dev', 'SKILL.md'), '# local legacy');
    write(path.join(tmpRoot, '.aiox-core', 'development', 'agents', 'dev.md'), '# dev');

    const result = validateClaudeIntegration({ projectRoot: tmpRoot });
    expect(result.ok).toBe(true);
  });

  it('includes symbolic links when inspecting top-level Claude entries', () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fs, 'readdirSync').mockReturnValue([
      {
        name: 'linked-skill',
        isDirectory: () => false,
        isFile: () => false,
        isSymbolicLink: () => true,
      },
    ]);

    expect(listTopLevelNames('/tmp/.claude/skills', null)).toEqual(['linked-skill']);
  });

  it('fails when Claude agent skills dir is missing', () => {
    write(path.join(tmpRoot, '.aiox-core', 'development', 'agents', 'dev.md'), '# dev');

    const result = validateClaudeIntegration({ projectRoot: tmpRoot });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('Missing Claude agent skills dir'))).toBe(true);
  });

  it('warns when legacy Claude commands dir is missing but skills are present', () => {
    write(
      path.join(tmpRoot, '.claude', 'skills', 'AIOX', 'agents', 'dev', 'SKILL.md'),
      '---\nactivation_type: pipeline\n---\n# dev',
    );
    write(path.join(tmpRoot, '.aiox-core', 'development', 'agents', 'dev.md'), '# dev');

    const result = validateClaudeIntegration({ projectRoot: tmpRoot });
    expect(result.ok).toBe(true);
    expect(result.warnings.some((e) => e.includes('Missing legacy Claude commands dir'))).toBe(true);
  });

  it('fails when a Claude agent skill is missing pipeline activation type', () => {
    write(path.join(tmpRoot, '.claude', 'commands', 'AIOX', 'agents', 'dev.md'), '# dev');
    write(path.join(tmpRoot, '.claude', 'skills', 'AIOX', 'agents', 'dev', 'SKILL.md'), '# dev');
    write(path.join(tmpRoot, '.aiox-core', 'development', 'agents', 'dev.md'), '# dev');

    const result = validateClaudeIntegration({ projectRoot: tmpRoot });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('activation_type: pipeline'))).toBe(true);
  });

  it('fails when non-core Claude native subagents are present', () => {
    write(path.join(tmpRoot, '.claude', 'commands', 'AIOX', 'agents', 'dev.md'), '# dev');
    write(
      path.join(tmpRoot, '.claude', 'skills', 'AIOX', 'agents', 'dev', 'SKILL.md'),
      '---\nactivation_type: pipeline\n---\n# dev',
    );
    write(path.join(tmpRoot, '.claude', 'agents', 'aiox-dev.md'), '# native dev');
    write(path.join(tmpRoot, '.claude', 'agents', 'copy-chief.md'), '# leaked pro agent');
    write(path.join(tmpRoot, '.aiox-core', 'development', 'agents', 'dev.md'), '# dev');

    const result = validateClaudeIntegration({ projectRoot: tmpRoot });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('Disallowed Claude native subagent'))).toBe(true);
    expect(result.errors.some((e) => e.includes('copy-chief'))).toBe(true);
  });

  it('fails when non-core Claude command namespaces are present', () => {
    write(path.join(tmpRoot, '.claude', 'commands', 'AIOX', 'agents', 'dev.md'), '# dev');
    write(path.join(tmpRoot, '.claude', 'commands', 'design-system', 'agents', 'brad-frost.md'), '# leaked');
    write(
      path.join(tmpRoot, '.claude', 'skills', 'AIOX', 'agents', 'dev', 'SKILL.md'),
      '---\nactivation_type: pipeline\n---\n# dev',
    );
    write(path.join(tmpRoot, '.aiox-core', 'development', 'agents', 'dev.md'), '# dev');

    const result = validateClaudeIntegration({ projectRoot: tmpRoot });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('Disallowed Claude command namespace'))).toBe(true);
    expect(result.errors.some((e) => e.includes('design-system'))).toBe(true);
  });

  it('fails when non-core Claude skill artifacts are present', () => {
    write(path.join(tmpRoot, '.claude', 'commands', 'AIOX', 'agents', 'dev.md'), '# dev');
    write(
      path.join(tmpRoot, '.claude', 'skills', 'AIOX', 'agents', 'dev', 'SKILL.md'),
      '---\nactivation_type: pipeline\n---\n# dev',
    );
    write(path.join(tmpRoot, '.claude', 'skills', 'clone-mind.md'), '# leaked');
    write(path.join(tmpRoot, '.aiox-core', 'development', 'agents', 'dev.md'), '# dev');

    const result = validateClaudeIntegration({ projectRoot: tmpRoot });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('Disallowed Claude skill artifact'))).toBe(true);
    expect(result.errors.some((e) => e.includes('clone-mind.md'))).toBe(true);
  });

  it('fails when non-core Claude agent memories are present', () => {
    write(path.join(tmpRoot, '.claude', 'commands', 'AIOX', 'agents', 'dev.md'), '# dev');
    write(
      path.join(tmpRoot, '.claude', 'skills', 'AIOX', 'agents', 'dev', 'SKILL.md'),
      '---\nactivation_type: pipeline\n---\n# dev',
    );
    write(path.join(tmpRoot, '.claude', 'agent-memory', 'aiox-dev', 'MEMORY.md'), '# allowed');
    write(path.join(tmpRoot, '.claude', 'agent-memory', 'oalanicolas', 'MEMORY.md'), '# leaked');
    write(path.join(tmpRoot, '.aiox-core', 'development', 'agents', 'dev.md'), '# dev');

    const result = validateClaudeIntegration({ projectRoot: tmpRoot });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('Disallowed Claude agent memory namespace'))).toBe(true);
    expect(result.errors.some((e) => e.includes('oalanicolas'))).toBe(true);
  });
});
