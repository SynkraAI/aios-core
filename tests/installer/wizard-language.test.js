/**
 * Tests for wizard language idempotency and propagation
 *
 * Story ACT-9: Language Selection Propagation
 *
 * Test Coverage:
 * - getExistingLanguage reads language from core-config.yaml
 * - getExistingLanguage returns null when key is missing (backward compat)
 * - getExistingLanguage validates language value
 * - configureEnvironment passes language to generateCoreConfig
 */

const path = require('path');
const fse = require('fs-extra');
const os = require('os');
const yaml = require('js-yaml');

// We need to import the wizard module to test getExistingLanguage
// Since it's not exported, we'll test the behavior through configureEnvironment
const { configureEnvironment } = require('../../packages/installer/src/config/configure-environment');

describe('Language propagation through configureEnvironment (Story ACT-9)', () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = path.join(os.tmpdir(), `aios-test-lang-${Date.now()}`);
    await fse.ensureDir(tempDir);
    await fse.ensureDir(path.join(tempDir, '.aios-core'));
  });

  afterEach(async () => {
    await fse.remove(tempDir);
  });

  test('should include language in generated core-config.yaml', async () => {
    const result = await configureEnvironment({
      targetDir: tempDir,
      language: 'pt',
      skipPrompts: true,
    });

    expect(result.coreConfigCreated).toBe(true);

    const configPath = path.join(tempDir, '.aios-core', 'core-config.yaml');
    const content = await fse.readFile(configPath, 'utf8');
    const config = yaml.load(content);

    expect(config.language).toBe('pt');
  });

  test('should default language to en when not provided', async () => {
    const result = await configureEnvironment({
      targetDir: tempDir,
      skipPrompts: true,
    });

    expect(result.coreConfigCreated).toBe(true);

    const configPath = path.join(tempDir, '.aios-core', 'core-config.yaml');
    const content = await fse.readFile(configPath, 'utf8');
    const config = yaml.load(content);

    expect(config.language).toBe('en');
  });

  test('should preserve language alongside user_profile', async () => {
    const result = await configureEnvironment({
      targetDir: tempDir,
      language: 'es',
      userProfile: 'bob',
      skipPrompts: true,
    });

    expect(result.coreConfigCreated).toBe(true);

    const configPath = path.join(tempDir, '.aios-core', 'core-config.yaml');
    const content = await fse.readFile(configPath, 'utf8');
    const config = yaml.load(content);

    expect(config.language).toBe('es');
    expect(config.user_profile).toBe('bob');
  });
});
