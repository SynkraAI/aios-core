import * as fs from 'fs';
import * as path from 'path';
import {
  checkContrast,
  parseHex,
  relativeLuminance,
  contrastRatio,
  getWCAGLevel,
} from '../check-contrast';
import {
  checkDimensions,
  parseDimensions,
  readImageDimensions,
} from '../check-dimensions';
import type { ContrastResult, WCAGLevel } from '../types';

// ============================================================
// check-contrast tests
// ============================================================

describe('check-contrast', () => {
  describe('parseHex', () => {
    it('should parse 6-digit hex with #', () => {
      expect(parseHex('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should parse 6-digit hex without #', () => {
      expect(parseHex('00ff00')).toEqual({ r: 0, g: 255, b: 0 });
    });

    it('should parse 3-digit hex with #', () => {
      expect(parseHex('#f00')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should parse 3-digit hex without #', () => {
      expect(parseHex('0f0')).toEqual({ r: 0, g: 255, b: 0 });
    });

    it('should parse case-insensitive hex', () => {
      expect(parseHex('#FF00ff')).toEqual({ r: 255, g: 0, b: 255 });
    });

    it('should throw on invalid hex', () => {
      expect(() => parseHex('#xyz')).toThrow('Invalid hex color');
    });

    it('should throw on wrong length hex', () => {
      expect(() => parseHex('#12345')).toThrow('Invalid hex color');
    });

    it('should throw on empty string', () => {
      expect(() => parseHex('')).toThrow('Invalid hex color');
    });
  });

  describe('relativeLuminance', () => {
    it('should return 0 for black', () => {
      expect(relativeLuminance(0, 0, 0)).toBeCloseTo(0, 4);
    });

    it('should return 1 for white', () => {
      expect(relativeLuminance(255, 255, 255)).toBeCloseTo(1, 4);
    });

    it('should return correct luminance for mid-gray', () => {
      const lum = relativeLuminance(128, 128, 128);
      expect(lum).toBeGreaterThan(0.2);
      expect(lum).toBeLessThan(0.3);
    });
  });

  describe('contrastRatio', () => {
    it('should return 21 for black on white', () => {
      const ratio = contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 });
      expect(ratio).toBeCloseTo(21, 0);
    });

    it('should return 1 for same colors', () => {
      const ratio = contrastRatio({ r: 128, g: 128, b: 128 }, { r: 128, g: 128, b: 128 });
      expect(ratio).toBeCloseTo(1, 2);
    });

    it('should be order-independent', () => {
      const ratio1 = contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 });
      const ratio2 = contrastRatio({ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 });
      expect(ratio1).toBeCloseTo(ratio2, 2);
    });
  });

  describe('getWCAGLevel', () => {
    it('should return AAA for ratio >= 7', () => {
      expect(getWCAGLevel(7)).toBe('AAA');
      expect(getWCAGLevel(21)).toBe('AAA');
    });

    it('should return AA for ratio >= 4.5 and < 7', () => {
      expect(getWCAGLevel(4.5)).toBe('AA');
      expect(getWCAGLevel(6.99)).toBe('AA');
    });

    it('should return AA-large for ratio >= 3 and < 4.5', () => {
      expect(getWCAGLevel(3)).toBe('AA-large');
      expect(getWCAGLevel(4.49)).toBe('AA-large');
    });

    it('should return fail for ratio < 3', () => {
      expect(getWCAGLevel(2.99)).toBe('fail');
      expect(getWCAGLevel(1)).toBe('fail');
    });
  });

  describe('checkContrast', () => {
    it('should return maximum contrast for black on white', () => {
      const result = checkContrast('#000000', '#ffffff');
      expect(result.ratio).toBe(21);
      expect(result.level).toBe('AAA');
      expect(result.passesAA).toBe(true);
      expect(result.passesAALarge).toBe(true);
      expect(result.passesAAA).toBe(true);
    });

    it('should return minimum contrast for same colors', () => {
      const result = checkContrast('#808080', '#808080');
      expect(result.ratio).toBe(1);
      expect(result.level).toBe('fail');
      expect(result.passesAA).toBe(false);
      expect(result.passesAALarge).toBe(false);
      expect(result.passesAAA).toBe(false);
    });

    it('should normalize hex colors in result', () => {
      const result = checkContrast('#F00', '#FFF');
      expect(result.foreground).toBe('#ff0000');
      expect(result.background).toBe('#ffffff');
    });

    it('should calculate known contrast ratio for blue on white', () => {
      // Blue (#0000FF) on white has a contrast ratio of ~8.59
      const result = checkContrast('#0000ff', '#ffffff');
      expect(result.ratio).toBeGreaterThan(8);
      expect(result.ratio).toBeLessThan(9);
      expect(result.level).toBe('AAA');
    });

    it('should detect AA-large for moderate contrast', () => {
      // Light gray on white has low contrast
      const result = checkContrast('#767676', '#ffffff');
      // #767676 on #ffffff is approximately 4.54 — just passes AA
      expect(result.passesAA).toBe(true);
      expect(result.passesAALarge).toBe(true);
    });

    it('should fail for insufficient contrast', () => {
      // Light yellow on white
      const result = checkContrast('#ffff00', '#ffffff');
      expect(result.passesAA).toBe(false);
    });

    it('should throw for invalid foreground hex', () => {
      expect(() => checkContrast('invalid', '#ffffff')).toThrow('Invalid hex color');
    });

    it('should throw for invalid background hex', () => {
      expect(() => checkContrast('#000000', 'xyz')).toThrow('Invalid hex color');
    });
  });
});

// ============================================================
// check-dimensions tests
// ============================================================

describe('check-dimensions', () => {
  describe('parseDimensions', () => {
    it('should parse WIDTHxHEIGHT format', () => {
      expect(parseDimensions('1080x1920')).toEqual({ width: 1080, height: 1920 });
    });

    it('should parse with uppercase X', () => {
      expect(parseDimensions('1080X1920')).toEqual({ width: 1080, height: 1920 });
    });

    it('should parse with spaces around x', () => {
      expect(parseDimensions('1080 x 1920')).toEqual({ width: 1080, height: 1920 });
    });

    it('should parse with unicode multiplication sign', () => {
      expect(parseDimensions('1080×1920')).toEqual({ width: 1080, height: 1920 });
    });

    it('should throw on invalid format', () => {
      expect(() => parseDimensions('invalid')).toThrow('Invalid dimension format');
    });

    it('should throw on missing height', () => {
      expect(() => parseDimensions('1080x')).toThrow('Invalid dimension format');
    });
  });

  describe('readImageDimensions', () => {
    const fixturesDir = path.join(__dirname, '__fixtures__');

    beforeAll(() => {
      // Create fixtures directory and test images
      fs.mkdirSync(fixturesDir, { recursive: true });

      // Create a minimal valid 2x3 PNG
      const pngHeader = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
        0x00, 0x00, 0x00, 0x0d, // IHDR chunk length
        0x49, 0x48, 0x44, 0x52, // 'IHDR'
        0x00, 0x00, 0x00, 0x02, // width = 2
        0x00, 0x00, 0x00, 0x03, // height = 3
        0x08, 0x02,             // bit depth = 8, color type = 2 (RGB)
        0x00, 0x00, 0x00,       // compression, filter, interlace
        0x00, 0x00, 0x00, 0x00, // CRC (placeholder)
      ]);
      fs.writeFileSync(path.join(fixturesDir, 'test.png'), pngHeader);

      // Create a minimal GIF 4x5
      const gifHeader = Buffer.from([
        0x47, 0x49, 0x46, 0x38, 0x39, 0x61, // GIF89a
        0x04, 0x00, // width = 4 (LE)
        0x05, 0x00, // height = 5 (LE)
      ]);
      fs.writeFileSync(path.join(fixturesDir, 'test.gif'), gifHeader);
    });

    afterAll(() => {
      // Cleanup fixtures
      fs.rmSync(fixturesDir, { recursive: true, force: true });
    });

    it('should read PNG dimensions', () => {
      const result = readImageDimensions(path.join(fixturesDir, 'test.png'));
      expect(result).toEqual({ width: 2, height: 3 });
    });

    it('should read GIF dimensions', () => {
      const result = readImageDimensions(path.join(fixturesDir, 'test.gif'));
      expect(result).toEqual({ width: 4, height: 5 });
    });

    it('should return null for non-existent file', () => {
      const result = readImageDimensions('/tmp/does-not-exist-12345.png');
      expect(result).toBeNull();
    });

    it('should return null for unsupported format', () => {
      const txtFile = path.join(fixturesDir, 'test.txt');
      fs.writeFileSync(txtFile, 'not an image');
      const result = readImageDimensions(txtFile);
      expect(result).toBeNull();
    });
  });

  describe('checkDimensions', () => {
    const fixturesDir = path.join(__dirname, '__fixtures__');

    beforeAll(() => {
      fs.mkdirSync(fixturesDir, { recursive: true });

      // Create a 10x20 PNG
      const pngHeader = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
        0x00, 0x00, 0x00, 0x0d,
        0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x00, 0x0a, // width = 10
        0x00, 0x00, 0x00, 0x14, // height = 20
        0x08, 0x02,
        0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
      ]);
      fs.writeFileSync(path.join(fixturesDir, 'banner.png'), pngHeader);
    });

    afterAll(() => {
      fs.rmSync(fixturesDir, { recursive: true, force: true });
    });

    it('should pass when dimensions match', () => {
      const result = checkDimensions(path.join(fixturesDir, 'banner.png'), '10x20');
      expect(result.pass).toBe(true);
      expect(result.actual).toBe('10x20');
      expect(result.message).toContain('PASS');
    });

    it('should fail when dimensions do not match', () => {
      const result = checkDimensions(path.join(fixturesDir, 'banner.png'), '1080x1920');
      expect(result.pass).toBe(false);
      expect(result.actual).toBe('10x20');
      expect(result.expected).toBe('1080x1920');
      expect(result.message).toContain('FAIL');
    });

    it('should fail for non-existent file', () => {
      const result = checkDimensions('/tmp/nope-12345.png', '100x100');
      expect(result.pass).toBe(false);
      expect(result.actual).toBeNull();
      expect(result.message).toContain('Could not read');
    });

    it('should include expected dimensions in result', () => {
      const result = checkDimensions(path.join(fixturesDir, 'banner.png'), '1080x1920');
      expect(result.expectedWidth).toBe(1080);
      expect(result.expectedHeight).toBe(1920);
    });

    it('should include actual dimensions in result', () => {
      const result = checkDimensions(path.join(fixturesDir, 'banner.png'), '10x20');
      expect(result.actualWidth).toBe(10);
      expect(result.actualHeight).toBe(20);
    });
  });
});

// ============================================================
// Checklist file validation
// ============================================================

describe('Checklist files', () => {
  const checklistDir = path.resolve(__dirname, '../../../../../docs/qa/checklists');

  const CHECKLIST_FILES = [
    { file: 'brand-identity-checklist.md', category: 'Brand Identity', items: 7 },
    { file: 'social-media-checklist.md', category: 'Social Media', items: 6 },
    { file: 'web-design-checklist.md', category: 'Web Design', items: 8 },
    { file: 'email-checklist.md', category: 'Email', items: 8 },
    { file: 'motion-checklist.md', category: 'Motion', items: 7 },
    { file: 'ads-checklist.md', category: 'Ads', items: 7 },
  ];

  for (const { file, category, items } of CHECKLIST_FILES) {
    describe(category, () => {
      let content: string;

      beforeAll(() => {
        content = fs.readFileSync(path.join(checklistDir, file), 'utf-8');
      });

      it(`should have exactly ${items} checklist items`, () => {
        const checkboxCount = (content.match(/^- \[ \] \*\*\[(AUTO|MANUAL)\]\*\*/gm) || []).length;
        expect(checkboxCount).toBe(items);
      });

      it('should classify each item as AUTO or MANUAL', () => {
        const itemLines = content.match(/^- \[ \] .+$/gm) || [];
        for (const line of itemLines) {
          expect(line).toMatch(/\*\*\[(AUTO|MANUAL)\]\*\*/);
        }
      });

      it('should include verification method for each item', () => {
        const itemLines = content.match(/^- \[ \] .+$/gm) || [];
        for (const line of itemLines) {
          expect(line).toContain('verification method:');
        }
      });

      it('should have items count in header', () => {
        expect(content).toContain(`**Items:** ${items}`);
      });
    });
  }

  it('should have a master index README', () => {
    const readme = fs.readFileSync(path.join(checklistDir, 'README.md'), 'utf-8');
    expect(readme).toContain('Master Index');
    expect(readme).toContain('Brand Identity');
    expect(readme).toContain('Social Media');
    expect(readme).toContain('Web Design');
    expect(readme).toContain('Email');
    expect(readme).toContain('Motion');
    expect(readme).toContain('Ads');
  });

  it('should list correct total counts in README', () => {
    const readme = fs.readFileSync(path.join(checklistDir, 'README.md'), 'utf-8');
    expect(readme).toContain('**Total Categories:** 6');
    expect(readme).toContain('**Total Items:** 43');
  });
});

// ============================================================
// Package structure validation
// ============================================================

describe('Package structure', () => {
  const pkgDir = path.resolve(__dirname, '../..');

  it('should have correct package name', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf-8'));
    expect(pkg.name).toBe('@brand-system/qa-tools');
  });

  it('should have zero runtime dependencies', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf-8'));
    expect(pkg.dependencies).toBeUndefined();
  });

  it('should export all public APIs from index', () => {
    const indexContent = fs.readFileSync(path.join(pkgDir, 'src', 'index.ts'), 'utf-8');
    expect(indexContent).toContain('checkContrast');
    expect(indexContent).toContain('checkDimensions');
    expect(indexContent).toContain('parseHex');
    expect(indexContent).toContain('parseDimensions');
    expect(indexContent).toContain('readImageDimensions');
    expect(indexContent).toContain('contrastRatio');
    expect(indexContent).toContain('getWCAGLevel');
    expect(indexContent).toContain('relativeLuminance');
  });

  it('should have bin entries for CLI tools', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf-8'));
    expect(pkg.bin).toHaveProperty('check-contrast');
    expect(pkg.bin).toHaveProperty('check-dimensions');
  });
});
