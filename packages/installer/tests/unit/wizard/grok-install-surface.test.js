'use strict';

const fs = require('fs-extra');
const os = require('os');
const path = require('path');

const {
  IDE_CONFIGS,
  getIDEKeys,
  getIDEConfig,
  isValidIDE,
  getIDEChoices,
} = require('../../../src/config/ide-configs');
const {
  generateGrokSkills,
  generateIDEConfigs,
} = require('../../../src/wizard/ide-config-generator');
const { generateCoreConfig } = require('../../../src/config/templates/core-config-template');

const repoRoot = path.resolve(__dirname, '..', '..', '..', '..', '..');

describe('Grok Build install surface', () => {
  it('registers grok as a recommended IDE choice', () => {
    expect(isValidIDE('grok')).toBe(true);
    expect(getIDEKeys()).toContain('grok');

    const config = getIDEConfig('grok');
    expect(config.name).toBe('Grok Build');
    expect(config.recommended).toBe(true);
    expect(config.configFile).toBe(path.join('.grok', 'rules', 'aiox-core.md'));
    expect(config.template).toBe('ide-rules/grok-rules.md');
    expect(config.agentFolder).toBeUndefined();

    const choices = getIDEChoices();
    const grokChoice = choices.find((c) => c.value === 'grok');
    expect(grokChoice).toBeTruthy();
    expect(grokChoice.checked).toBe(true);
  });

  it('includes grok in default core-config when no IDEs are selected', () => {
    const yaml = generateCoreConfig({ projectType: 'GREENFIELD', selectedIDEs: [] });
    expect(yaml).toContain('grok');
    expect(yaml).toMatch(/selected:[\s\S]*grok/);
  });

  it('includes grok flag when selected', () => {
    const yaml = generateCoreConfig({
      projectType: 'GREENFIELD',
      selectedIDEs: ['claude-code', 'grok'],
    });
    expect(yaml).toMatch(/grok:\s*true/);
  });

  it('generateGrokSkills writes .grok surface from canonical agents', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'aiox-grok-install-'));
    const projectRoot = path.join(tmp, 'project');
    fs.ensureDirSync(projectRoot);

    // Minimal package layout: agents source under project .aiox-core
    const agentsSrc = path.join(repoRoot, '.aiox-core', 'development', 'agents');
    const agentsDst = path.join(projectRoot, '.aiox-core', 'development', 'agents');
    fs.copySync(agentsSrc, agentsDst);

    // Authority hook source used by harness copy
    const hookSrc = path.join(repoRoot, '.claude', 'hooks', 'enforce-git-push-authority.cjs');
    if (fs.existsSync(hookSrc)) {
      fs.ensureDirSync(path.join(projectRoot, '.claude', 'hooks'));
      fs.copySync(hookSrc, path.join(projectRoot, '.claude', 'hooks', 'enforce-git-push-authority.cjs'));
    }

    // Development workflow skills (optional for sync)
    const skillsSrc = path.join(repoRoot, '.aiox-core', 'development', 'skills');
    if (fs.existsSync(skillsSrc)) {
      fs.copySync(skillsSrc, path.join(projectRoot, '.aiox-core', 'development', 'skills'));
    }

    const result = generateGrokSkills(projectRoot);
    expect(result.skipped).toBe(false);
    expect(result.agents).toBeGreaterThanOrEqual(12);
    expect(result.files).toBeGreaterThan(40);

    expect(fs.existsSync(path.join(projectRoot, '.grok', 'agents', 'aiox-dev.md'))).toBe(true);
    expect(fs.existsSync(path.join(projectRoot, '.grok', 'skills', 'aiox-dev', 'SKILL.md'))).toBe(true);
    expect(fs.existsSync(path.join(projectRoot, '.grok', 'hooks', 'git-push-authority.json'))).toBe(true);
    expect(fs.existsSync(path.join(projectRoot, '.grok', 'config.toml'))).toBe(true);
    expect(fs.existsSync(path.join(projectRoot, '.grok', 'rules', 'aiox-core.md'))).toBe(true);

    fs.removeSync(tmp);
  });

  it('generateIDEConfigs configures grok and runs sync', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'aiox-grok-ide-cfg-'));
    const projectRoot = path.join(tmp, 'project');
    fs.ensureDirSync(projectRoot);

    // Provide template source via AIOX package root resolution (uses local repo)
    // and agents source inside project for generateGrokSkills.
    fs.copySync(
      path.join(repoRoot, '.aiox-core', 'development', 'agents'),
      path.join(projectRoot, '.aiox-core', 'development', 'agents'),
    );
    const hookSrc = path.join(repoRoot, '.claude', 'hooks', 'enforce-git-push-authority.cjs');
    if (fs.existsSync(hookSrc)) {
      fs.ensureDirSync(path.join(projectRoot, '.claude', 'hooks'));
      fs.copySync(hookSrc, path.join(projectRoot, '.claude', 'hooks', 'enforce-git-push-authority.cjs'));
    }
    const skillsSrc = path.join(repoRoot, '.aiox-core', 'development', 'skills');
    if (fs.existsSync(skillsSrc)) {
      fs.copySync(skillsSrc, path.join(projectRoot, '.aiox-core', 'development', 'skills'));
    }

    // Ensure product template exists for resolveAioxCorePath
    const templatePath = path.join(
      repoRoot,
      '.aiox-core',
      'product',
      'templates',
      'ide-rules',
      'grok-rules.md',
    );
    expect(fs.existsSync(templatePath)).toBe(true);

    const result = await generateIDEConfigs(
      ['grok'],
      {
        projectName: 'test-project',
        projectType: 'greenfield',
        selectedIDEs: ['grok'],
      },
      {
        projectRoot,
        ci: true,
        yes: true,
        forceMerge: true,
        skipPrompts: true,
      },
    );

    expect(result.success).toBe(true);
    expect(result.errors || []).toEqual([]);
    expect(fs.existsSync(path.join(projectRoot, '.grok', 'rules', 'aiox-core.md'))).toBe(true);
    expect(fs.existsSync(path.join(projectRoot, '.grok', 'agents', 'aiox-dev.md'))).toBe(true);
    expect(fs.existsSync(path.join(projectRoot, '.grok', 'skills', 'aiox-devops', 'SKILL.md'))).toBe(true);

    fs.removeSync(tmp);
  }, 60000);

  it('exposes IDE_CONFIGS with seven primary surfaces including grok', () => {
    const keys = Object.keys(IDE_CONFIGS);
    expect(keys).toEqual(
      expect.arrayContaining([
        'claude-code',
        'codex',
        'grok',
        'gemini',
        'cursor',
        'github-copilot',
        'antigravity',
      ]),
    );
    expect(keys.length).toBe(7);
  });
});
