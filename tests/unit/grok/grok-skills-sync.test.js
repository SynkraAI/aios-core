'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  syncGrok,
  AGENT_PROFILES,
  SHORT_WORKFLOW_ALIASES,
  getSkillId,
} = require('../../../.aiox-core/infrastructure/scripts/grok-skills-sync/index');
const { validateGrok } = require('../../../.aiox-core/infrastructure/scripts/grok-skills-sync/validate');

const repoRoot = path.resolve(__dirname, '..', '..', '..');

describe('Grok skills sync + validate', () => {
  it('syncs agents, short aliases, hooks, and config into a temp .grok tree', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'aiox-grok-sync-'));
    const grokRoot = path.join(tmp, '.grok');

    // Authority hook source must exist for harness copy
    const claudeHook = path.join(repoRoot, '.claude', 'hooks', 'enforce-git-push-authority.cjs');
    expect(fs.existsSync(claudeHook)).toBe(true);

    const result = syncGrok({
      projectRoot: repoRoot,
      sourceDir: path.join(repoRoot, '.aiox-core', 'development', 'agents'),
      grokRoot,
      quiet: true,
    });

    expect(result.agents).toBe(Object.keys(AGENT_PROFILES).length);
    expect(result.files).toBeGreaterThan(40);

    for (const id of Object.keys(AGENT_PROFILES)) {
      const skillId = getSkillId(id);
      expect(fs.existsSync(path.join(grokRoot, 'agents', `${skillId}.md`))).toBe(true);
      expect(fs.existsSync(path.join(grokRoot, 'skills', skillId, 'SKILL.md'))).toBe(true);
      expect(fs.existsSync(path.join(grokRoot, 'roles', `${skillId}.toml`))).toBe(true);
      expect(fs.existsSync(path.join(grokRoot, 'personas', `${skillId}.toml`))).toBe(true);
    }

    for (const { name, target } of SHORT_WORKFLOW_ALIASES) {
      const aliasPath = path.join(grokRoot, 'skills', name, 'SKILL.md');
      expect(fs.existsSync(aliasPath)).toBe(true);
      const body = fs.readFileSync(aliasPath, 'utf8');
      expect(body).toContain(`name: ${name}`);
      expect(body).toContain(`.grok/skills/${target}/SKILL.md`);
    }

    expect(fs.existsSync(path.join(grokRoot, 'hooks', 'git-push-authority.json'))).toBe(true);
    expect(fs.existsSync(path.join(grokRoot, 'hooks', 'enforce-git-push-authority.cjs'))).toBe(true);
    expect(fs.existsSync(path.join(grokRoot, 'config.toml'))).toBe(true);
    expect(fs.existsSync(path.join(grokRoot, 'rules', 'aiox-core.md'))).toBe(true);

    // Validate against the temp tree by temporarily not — validate uses cwd .grok.
    // Instead assert harness JSON shape here.
    const hookJson = JSON.parse(
      fs.readFileSync(path.join(grokRoot, 'hooks', 'git-push-authority.json'), 'utf8')
    );
    expect(JSON.stringify(hookJson.hooks.PreToolUse)).toContain('run_terminal_command');
  });

  it('validates the committed .grok tree (strict)', () => {
    const result = validateGrok({ projectRoot: repoRoot, strict: true, quiet: true });
    if (!result.ok) {
      // Surface diagnostics in failure output
      // eslint-disable-next-line no-console
      console.error(result.errors, result.warnings);
    }
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });
});
