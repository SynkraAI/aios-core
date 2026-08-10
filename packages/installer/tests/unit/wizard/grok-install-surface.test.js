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

function copyGrokCanonicalSources(projectRoot) {
  for (const relativePath of [
    path.join('development', 'agents'),
    path.join('development', 'skills'),
    path.join('infrastructure', 'templates', 'grok-hooks'),
    path.join('product', 'templates', 'ide-rules', 'grok-rules.md'),
  ]) {
    fs.copySync(
      path.join(repoRoot, '.aiox-core', relativePath),
      path.join(projectRoot, '.aiox-core', relativePath),
    );
  }
}

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
    // configs flags must match default selected list
    expect(yaml).toMatch(/grok:\s*true/);
    expect(yaml).toMatch(/claude-code:\s*true/);
    expect(yaml).toMatch(/codex:\s*true/);
  });

  it('includes grok flag when selected', () => {
    const yaml = generateCoreConfig({
      projectType: 'GREENFIELD',
      selectedIDEs: ['claude-code', 'grok'],
    });
    expect(yaml).toMatch(/grok:\s*true/);
    expect(yaml).toMatch(/codex:\s*false/);
  });

  it('generateGrokSkills writes .grok surface from canonical agents', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'aiox-grok-install-'));
    const projectRoot = path.join(tmp, 'project');
    fs.ensureDirSync(projectRoot);

    copyGrokCanonicalSources(projectRoot);

    const result = generateGrokSkills(projectRoot);
    expect(result.skipped).toBe(false);
    expect(result.agents).toBeGreaterThanOrEqual(12);
    expect(result.files).toBeGreaterThan(40);

    expect(fs.existsSync(path.join(projectRoot, '.grok', 'agents', 'aiox-dev.md'))).toBe(true);
    expect(fs.existsSync(path.join(projectRoot, '.grok', 'skills', 'aiox-dev', 'SKILL.md'))).toBe(true);
    expect(fs.existsSync(path.join(projectRoot, '.grok', 'hooks', 'git-push-authority.json'))).toBe(true);
    expect(fs.existsSync(path.join(projectRoot, '.grok', 'config.toml'))).toBe(true);
    expect(fs.existsSync(path.join(projectRoot, '.grok', 'rules', 'aiox-core.md'))).toBe(true);
    expect(fs.existsSync(path.join(projectRoot, '.grok', 'aiox-managed.json'))).toBe(true);
    expect(fs.existsSync(path.join(projectRoot, '.claude'))).toBe(false);

    fs.removeSync(tmp);
  });

  it('generateIDEConfigs configures grok and runs sync', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'aiox-grok-ide-cfg-'));
    const projectRoot = path.join(tmp, 'project');
    fs.ensureDirSync(projectRoot);

    copyGrokCanonicalSources(projectRoot);

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
    expect(fs.existsSync(path.join(projectRoot, '.grok', 'hooks', 'precompact-wrapper.cjs'))).toBe(true);
    expect(fs.existsSync(path.join(projectRoot, '.claude'))).toBe(false);

    fs.removeSync(tmp);
  }, 60000);

  it('preserves brownfield Grok rules through installer and sync', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'aiox-grok-brownfield-'));
    const projectRoot = path.join(tmp, 'project');
    copyGrokCanonicalSources(projectRoot);
    const rulesPath = path.join(projectRoot, '.grok', 'rules', 'aiox-core.md');
    fs.ensureDirSync(path.dirname(rulesPath));
    fs.writeFileSync(rulesPath, '# Company Rules\n\nKEEP-BROWNFIELD-SENTINEL\n', 'utf8');

    const result = await generateIDEConfigs(
      ['grok'],
      { projectName: 'existing', projectType: 'brownfield', selectedIDEs: ['grok'] },
      { projectRoot, ci: true, yes: true, forceMerge: true, skipPrompts: true },
    );

    expect(result.success).toBe(true);
    expect(fs.readFileSync(rulesPath, 'utf8')).toContain('KEEP-BROWNFIELD-SENTINEL');
    expect(fs.readFileSync(rulesPath, 'utf8')).toContain('AIOX-MANAGED-START');
    fs.removeSync(tmp);
  }, 60000);

  it('fails a Grok install when canonical hook sources are absent', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'aiox-grok-missing-hooks-'));
    const projectRoot = path.join(tmp, 'project');
    for (const relativePath of [
      path.join('development', 'agents'),
      path.join('development', 'skills'),
      path.join('product', 'templates', 'ide-rules', 'grok-rules.md'),
    ]) {
      fs.copySync(
        path.join(repoRoot, '.aiox-core', relativePath),
        path.join(projectRoot, '.aiox-core', relativePath),
      );
    }
    const rulesPath = path.join(projectRoot, '.grok', 'rules', 'aiox-core.md');
    const originalRules = '# Existing Company Rules\n\nDO-NOT-DELETE\n';
    fs.ensureDirSync(path.dirname(rulesPath));
    fs.writeFileSync(rulesPath, originalRules, 'utf8');

    const result = await generateIDEConfigs(
      ['grok'],
      { projectName: 'broken', projectType: 'brownfield', selectedIDEs: ['grok'] },
      { projectRoot, ci: true, yes: true, forceMerge: true, skipPrompts: true },
    );

    expect(result.success).toBe(false);
    expect(result.errors[0].error).toContain('Missing canonical Grok hook source');
    expect(fs.readFileSync(rulesPath, 'utf8')).toBe(originalRules);
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
