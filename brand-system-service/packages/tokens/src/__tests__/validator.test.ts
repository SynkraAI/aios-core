import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { TokenValidator } from '../validator';
import { getPrimitiveToken } from '../types';
import type { TokenSchema, TokenPath } from '../types';

/**
 * Helper: create a temporary tokens directory with the given structure.
 */
function createTempTokensDir(structure: Record<string, Record<string, unknown>>): string {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bss-tokens-test-'));
  const tokensDir = tmpDir;

  for (const [filePath, content] of Object.entries(structure)) {
    const fullPath = path.join(tokensDir, filePath);
    const dir = path.dirname(fullPath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fullPath, JSON.stringify(content, null, 2), 'utf-8');
  }

  return tokensDir;
}

/**
 * Helper: cleanup temp directory.
 */
function cleanupTempDir(dirPath: string): void {
  fs.rmSync(dirPath, { recursive: true, force: true });
}

describe('TokenValidator', () => {
  describe('valid DTCG token files', () => {
    let tokensDir: string;

    beforeAll(() => {
      tokensDir = createTempTokensDir({
        'client.config.json': {
          prefix: 'test',
          client_id: 'test-client',
          brand_name: 'Test Brand',
        },
        'primitive/colors.json': {
          color: {
            blue: {
              '500': {
                $value: '#0057FF',
                $type: 'color',
                $description: 'Primary blue',
              },
            },
            white: {
              $value: '#FFFFFF',
              $type: 'color',
              $description: 'White',
            },
          },
        },
        'semantic/colors.json': {
          interactive: {
            default: {
              $value: '{color.blue.500}',
              $type: 'color',
              $description: 'Interactive default',
            },
          },
          text: {
            inverse: {
              $value: '{color.white}',
              $type: 'color',
              $description: 'Inverse text',
            },
          },
        },
        'component/button.json': {
          button: {
            primary: {
              background: {
                $value: '{interactive.default}',
                $type: 'color',
                $description: 'Button primary background',
              },
              text: {
                $value: '{text.inverse}',
                $type: 'color',
                $description: 'Button primary text',
              },
            },
          },
        },
      });
    });

    afterAll(() => {
      cleanupTempDir(tokensDir);
    });

    it('should pass validation for valid DTCG token files', () => {
      const validator = new TokenValidator(tokensDir);
      const result = validator.validate();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.totalTokens).toBeGreaterThan(0);
    });

    it('should count tokens across all files', () => {
      const validator = new TokenValidator(tokensDir);
      const result = validator.validate();

      // 2 primitive + 2 semantic + 2 component = 6 tokens
      expect(result.totalTokens).toBe(6);
      expect(result.fileResults).toHaveLength(3);
    });

    it('should read prefix from client config', () => {
      const validator = new TokenValidator(tokensDir);
      validator.validate();

      expect(validator.getPrefix()).toBe('test');
    });
  });

  describe('missing $type', () => {
    let tokensDir: string;

    beforeAll(() => {
      tokensDir = createTempTokensDir({
        'primitive/colors.json': {
          color: {
            red: {
              '500': {
                $value: '#FF0000',
                // Missing $type
                $description: 'Red color',
              },
            },
          },
        },
      });
    });

    afterAll(() => {
      cleanupTempDir(tokensDir);
    });

    it('should fail on missing $type', () => {
      const validator = new TokenValidator(tokensDir);
      const result = validator.validate();

      expect(result.valid).toBe(false);
      const typeErrors = result.errors.filter((e) => e.code === 'MISSING_TYPE');
      expect(typeErrors.length).toBeGreaterThanOrEqual(1);
      expect(typeErrors[0].tokenPath).toBe('color.red.500');
    });
  });

  describe('invalid $type', () => {
    let tokensDir: string;

    beforeAll(() => {
      tokensDir = createTempTokensDir({
        'primitive/colors.json': {
          color: {
            red: {
              '500': {
                $value: '#FF0000',
                $type: 'invalidType',
                $description: 'Red color',
              },
            },
          },
        },
      });
    });

    afterAll(() => {
      cleanupTempDir(tokensDir);
    });

    it('should fail on invalid $type value', () => {
      const validator = new TokenValidator(tokensDir);
      const result = validator.validate();

      expect(result.valid).toBe(false);
      const typeErrors = result.errors.filter((e) => e.code === 'INVALID_TYPE');
      expect(typeErrors.length).toBeGreaterThanOrEqual(1);
      expect(typeErrors[0].message).toContain('invalidType');
    });
  });

  describe('unresolved reference', () => {
    let tokensDir: string;

    beforeAll(() => {
      tokensDir = createTempTokensDir({
        'semantic/colors.json': {
          interactive: {
            default: {
              $value: '{color.blue.600}',
              $type: 'color',
              $description: 'Interactive element referencing non-existent token',
            },
          },
        },
      });
    });

    afterAll(() => {
      cleanupTempDir(tokensDir);
    });

    it('should detect unresolved reference', () => {
      const validator = new TokenValidator(tokensDir);
      const result = validator.validate();

      expect(result.valid).toBe(false);
      const refErrors = result.errors.filter((e) => e.code === 'UNRESOLVED_REFERENCE');
      expect(refErrors.length).toBeGreaterThanOrEqual(1);
      expect(refErrors[0].message).toContain('color.blue.600');
    });
  });

  describe('circular reference', () => {
    let tokensDir: string;

    beforeAll(() => {
      tokensDir = createTempTokensDir({
        'primitive/colors.json': {
          color: {
            a: {
              $value: '{color.b}',
              $type: 'color',
              $description: 'Color A references B',
            },
            b: {
              $value: '{color.a}',
              $type: 'color',
              $description: 'Color B references A (circular)',
            },
          },
        },
      });
    });

    afterAll(() => {
      cleanupTempDir(tokensDir);
    });

    it('should detect circular reference', () => {
      const validator = new TokenValidator(tokensDir);
      const result = validator.validate();

      expect(result.valid).toBe(false);
      const circularErrors = result.errors.filter((e) => e.code === 'CIRCULAR_REFERENCE');
      expect(circularErrors.length).toBeGreaterThanOrEqual(1);
      expect(circularErrors[0].message).toContain('Circular reference');
    });
  });

  describe('missing $description', () => {
    let tokensDir: string;

    beforeAll(() => {
      tokensDir = createTempTokensDir({
        'primitive/colors.json': {
          color: {
            red: {
              '500': {
                $value: '#FF0000',
                $type: 'color',
                // Missing $description
              },
            },
          },
        },
      });
    });

    afterAll(() => {
      cleanupTempDir(tokensDir);
    });

    it('should fail on missing $description', () => {
      const validator = new TokenValidator(tokensDir);
      const result = validator.validate();

      expect(result.valid).toBe(false);
      const descErrors = result.errors.filter((e) => e.code === 'MISSING_DESCRIPTION');
      expect(descErrors.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('default prefix', () => {
    let tokensDir: string;

    beforeAll(() => {
      tokensDir = createTempTokensDir({
        'primitive/colors.json': {
          color: {
            blue: {
              '500': {
                $value: '#0057FF',
                $type: 'color',
                $description: 'Blue',
              },
            },
          },
        },
      });
    });

    afterAll(() => {
      cleanupTempDir(tokensDir);
    });

    it('should default prefix to bss when no client config exists', () => {
      const validator = new TokenValidator(tokensDir);
      validator.validate();

      expect(validator.getPrefix()).toBe('bss');
    });
  });
});

describe('TypeScript types', () => {
  it('should compile TokenPath type without errors', () => {
    // This test verifies that the type system works at compile time.
    // If this file compiles, the types are correct.
    const path: TokenPath = 'color.blue.500';
    expect(path).toBe('color.blue.500');
  });

  it('should access primitive tokens via getPrimitiveToken', () => {
    const tokens: TokenSchema = {
      color: {
        blue: {
          '500': {
            $value: '#0057FF',
            $type: 'color',
            $description: 'Primary blue',
          },
        },
      },
    };

    const value = getPrimitiveToken(tokens, 'color.blue.500');
    expect(value).toBe('#0057FF');
  });

  it('should throw for non-existent token path', () => {
    const tokens: TokenSchema = {
      color: {
        blue: {
          '500': {
            $value: '#0057FF',
            $type: 'color',
            $description: 'Primary blue',
          },
        },
      },
    };

    // 'color.blue.600' is not in tokens but is a valid TokenPath type at the union level
    // We cast to test the runtime behavior
    expect(() => getPrimitiveToken(tokens, 'color.blue.100' as TokenPath)).toThrow();
  });
});
