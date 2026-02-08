/**
 * Unit Tests for core-config-template
 *
 * Story ACT-9: Language Selection Propagation
 *
 * Test Coverage:
 * - generateCoreConfig includes language field
 * - Default language is 'en'
 * - Custom language (pt, es) is preserved
 * - YAML output parses correctly with language
 */

const yaml = require('js-yaml');
const { generateCoreConfig } = require('../../packages/installer/src/config/templates/core-config-template');

describe('core-config-template', () => {
  describe('generateCoreConfig - language support (Story ACT-9)', () => {
    test('should include language field in generated config', () => {
      const output = generateCoreConfig({ language: 'pt' });
      const parsed = yaml.load(output);

      expect(parsed).toHaveProperty('language');
      expect(parsed.language).toBe('pt');
    });

    test('should default language to en when not provided', () => {
      const output = generateCoreConfig();
      const parsed = yaml.load(output);

      expect(parsed.language).toBe('en');
    });

    test('should accept es language', () => {
      const output = generateCoreConfig({ language: 'es' });
      const parsed = yaml.load(output);

      expect(parsed.language).toBe('es');
    });

    test('should place language near user_profile in config', () => {
      const output = generateCoreConfig({ language: 'pt', userProfile: 'advanced' });
      const lines = output.split('\n');

      const userProfileLine = lines.findIndex(l => l.includes('user_profile:'));
      const languageLine = lines.findIndex(l => l.match(/^language:/));

      expect(userProfileLine).toBeGreaterThan(-1);
      expect(languageLine).toBeGreaterThan(-1);
      // language should be near user_profile (within 5 lines)
      expect(Math.abs(languageLine - userProfileLine)).toBeLessThan(5);
    });

    test('should generate valid YAML with language field', () => {
      const output = generateCoreConfig({ language: 'pt' });

      // Should not throw
      const parsed = yaml.load(output);

      expect(parsed).toBeDefined();
      expect(typeof parsed).toBe('object');
      expect(parsed.language).toBe('pt');
      expect(parsed.user_profile).toBeDefined();
      expect(parsed.project).toBeDefined();
    });

    test('should preserve language alongside other config options', () => {
      const output = generateCoreConfig({
        projectType: 'BROWNFIELD',
        selectedIDEs: ['vscode', 'cursor'],
        userProfile: 'bob',
        language: 'es',
        aiosVersion: '3.0.0',
      });
      const parsed = yaml.load(output);

      expect(parsed.language).toBe('es');
      expect(parsed.user_profile).toBe('bob');
      expect(parsed.project.type).toBe('BROWNFIELD');
      expect(parsed.ide.selected).toContain('vscode');
      expect(parsed.ide.selected).toContain('cursor');
    });
  });
});
