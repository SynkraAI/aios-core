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
    // Full surface: 25 agents + 31 skills + 12 roles + 12 personas + hooks
    // (4 required + vendored wrappers) + rules + config.toml + README ≈ 91.
    // Floor of 87 guards against silent partial output.
    expect(result.files).toBeGreaterThanOrEqual(87);

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

    // Short agent spawn aliases (dev, po, devops, …)
    expect(fs.existsSync(path.join(grokRoot, 'agents', 'dev.md'))).toBe(true);
    expect(fs.existsSync(path.join(grokRoot, 'agents', 'devops.md'))).toBe(true);
    expect(fs.readFileSync(path.join(grokRoot, 'agents', 'dev.md'), 'utf8')).toContain(
      '.grok/agents/aiox-dev.md',
    );

    expect(fs.existsSync(path.join(grokRoot, 'hooks', 'git-push-authority.json'))).toBe(true);
    expect(fs.existsSync(path.join(grokRoot, 'hooks', 'synapse-prompt.json'))).toBe(true);
    expect(fs.existsSync(path.join(grokRoot, 'hooks', 'precompact.json'))).toBe(true);
    expect(fs.existsSync(path.join(grokRoot, 'hooks', 'enforce-git-push-authority.cjs'))).toBe(true);
    expect(fs.existsSync(path.join(grokRoot, 'config.toml'))).toBe(true);
    expect(fs.existsSync(path.join(grokRoot, 'rules', 'aiox-core.md'))).toBe(true);

    // Activation protocol must register active-agent bridge
    const devopsSkill = fs.readFileSync(
      path.join(grokRoot, 'skills', 'aiox-devops', 'SKILL.md'),
      'utf8',
    );
    expect(devopsSkill).toContain('.aiox/active-agent');
    expect(devopsSkill).toContain('Register active agent');

    const hookJson = JSON.parse(
      fs.readFileSync(path.join(grokRoot, 'hooks', 'git-push-authority.json'), 'utf8'),
    );
    expect(JSON.stringify(hookJson.hooks.PreToolUse)).toContain('run_terminal_command');

    // The freshly generated tree must itself pass strict validation —
    // otherwise a sync bug only surfaces after the broken tree is committed.
    const freshValidation = validateGrok({
      projectRoot: repoRoot,
      grokRoot,
      strict: true,
      quiet: true,
    });
    if (!freshValidation.ok) {
      console.error(freshValidation.errors, freshValidation.warnings);
    }
    expect(freshValidation.ok).toBe(true);

    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('validates the committed .grok tree (strict)', () => {
    const result = validateGrok({ projectRoot: repoRoot, strict: true, quiet: true });
    if (!result.ok) {
      // Surface diagnostics in failure output
       
      console.error(result.errors, result.warnings);
    }
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });
});
