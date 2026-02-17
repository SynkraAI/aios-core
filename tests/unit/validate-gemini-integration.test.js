'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  validateGeminiIntegration,
} = require('../../.aios-core/infrastructure/scripts/validate-gemini-integration');

describe('validate-gemini-integration', () => {
  let tmpRoot;

  function write(file, content = '') {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content, 'utf8');
  }

  beforeEach(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'validate-gemini-'));
  });

  afterEach(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  it('passes when required Gemini files exist', () => {
    write(path.join(tmpRoot, '.gemini', 'rules', 'AIOS', 'agents', 'dev.md'), '# dev');
    write(path.join(tmpRoot, '.gemini', 'commands', 'aios-menu.toml'), 'description = "menu"');
    write(path.join(tmpRoot, '.gemini', 'commands', 'aios-dev.toml'), 'description = "dev"');
    write(path.join(tmpRoot, '.aios-core', 'development', 'agents', 'dev.md'), '# dev');
    write(path.join(tmpRoot, 'packages', 'gemini-aios-extension', 'extension.json'), '{}');
    write(path.join(tmpRoot, 'packages', 'gemini-aios-extension', 'README.md'), '# readme');
    write(path.join(tmpRoot, 'packages', 'gemini-aios-extension', 'commands', 'aios-status.js'), '');
    write(path.join(tmpRoot, 'packages', 'gemini-aios-extension', 'commands', 'aios-agents.js'), '');
    write(path.join(tmpRoot, 'packages', 'gemini-aios-extension', 'commands', 'aios-validate.js'), '');
    write(path.join(tmpRoot, 'packages', 'gemini-aios-extension', 'hooks', 'hooks.json'), '{}');

    const result = validateGeminiIntegration({ projectRoot: tmpRoot });
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('warns (but passes) when rules file is missing', () => {
    const result = validateGeminiIntegration({ projectRoot: tmpRoot });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('Missing Gemini agents dir'))).toBe(true);
    expect(result.errors.some((e) => e.includes('Missing Gemini commands dir'))).toBe(true);
    expect(result.warnings.some((w) => w.includes('Gemini rules file not found yet'))).toBe(true);
  });
});
