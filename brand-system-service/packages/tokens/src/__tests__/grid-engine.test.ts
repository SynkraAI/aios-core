/**
 * GridEngine Tests - BSS-2.5
 *
 * Tests for grid system and spacing scale generation
 */

import { GridEngine, GridConfig, SpacingScale } from '../grid-engine';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('GridEngine', () => {
  describe('constructor', () => {
    it('should use default config when no path provided', () => {
      const engine = new GridEngine();
      const breakpoints = engine.generateBreakpoints();

      expect(breakpoints).toHaveProperty('xs');
      expect(breakpoints).toHaveProperty('sm');
      expect(breakpoints).toHaveProperty('2xl');
    });

    it('should load config from file when path provided', () => {
      const tempDir = os.tmpdir();
      const configPath = path.join(tempDir, 'test-grid-config.json');
      const customConfig: GridConfig = {
        baseUnit: 10,
        maxWidth: 1400,
        breakpoints: {
          xs: 0,
          sm: 700,
          md: 900,
          lg: 1100,
          xl: 1400,
          '2xl': 1700,
        },
      };

      fs.writeFileSync(configPath, JSON.stringify(customConfig), 'utf-8');

      try {
        const engine = new GridEngine(configPath);
        const breakpoints = engine.generateBreakpoints();

        expect((breakpoints as any).sm.$value).toBe('700px');
      } finally {
        fs.unlinkSync(configPath);
      }
    });

    it('should use defaults if config file does not exist', () => {
      const engine = new GridEngine('/nonexistent/path.json');
      const breakpoints = engine.generateBreakpoints();

      expect((breakpoints as any).sm.$value).toBe('640px');
    });
  });

  describe('generateBreakpoints', () => {
    it('should generate exactly 6 breakpoints', () => {
      const engine = new GridEngine();
      const breakpoints = engine.generateBreakpoints();

      const keys = Object.keys(breakpoints);
      expect(keys).toHaveLength(6);
      expect(keys).toEqual(['xs', 'sm', 'md', 'lg', 'xl', '2xl']);
    });

    it('should generate breakpoints in ascending order', () => {
      const engine = new GridEngine();
      const breakpoints = engine.generateBreakpoints() as any;

      const values = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'].map(
        (key) => parseInt(breakpoints[key].$value, 10)
      );

      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeGreaterThanOrEqual(values[i - 1]);
      }
    });

    it('should generate dimension tokens with correct DTCG format', () => {
      const engine = new GridEngine();
      const breakpoints = engine.generateBreakpoints() as any;

      expect(breakpoints.md).toHaveProperty('$value', '768px');
      expect(breakpoints.md).toHaveProperty('$type', 'dimension');
      expect(breakpoints.md).toHaveProperty('$description');
    });
  });

  describe('generateColumns', () => {
    it('should generate column counts for all 6 breakpoints', () => {
      const engine = new GridEngine();
      const columns = engine.generateColumns();

      const keys = Object.keys(columns);
      expect(keys).toHaveLength(6);
      expect(keys).toEqual(['xs', 'sm', 'md', 'lg', 'xl', '2xl']);
    });

    it('should generate number tokens with correct values', () => {
      const engine = new GridEngine();
      const columns = engine.generateColumns() as any;

      expect(columns.xs.$value).toBe(4);
      expect(columns.sm.$value).toBe(8);
      expect(columns.lg.$value).toBe(12);
      expect(columns.xs.$type).toBe('number');
    });
  });

  describe('generateGutters', () => {
    it('should generate gutter sizes for all 6 breakpoints', () => {
      const engine = new GridEngine();
      const gutters = engine.generateGutters();

      const keys = Object.keys(gutters);
      expect(keys).toHaveLength(6);
    });

    it('should generate dimension tokens with px values', () => {
      const engine = new GridEngine();
      const gutters = engine.generateGutters() as any;

      expect(gutters.xs.$value).toBe('16px');
      expect(gutters.xl.$value).toBe('32px');
      expect(gutters.xs.$type).toBe('dimension');
    });
  });

  describe('generateMargins', () => {
    it('should generate margins for all 6 breakpoints', () => {
      const engine = new GridEngine();
      const margins = engine.generateMargins();

      const keys = Object.keys(margins);
      expect(keys).toHaveLength(6);
    });

    it('should use auto for xl and 2xl breakpoints', () => {
      const engine = new GridEngine();
      const margins = engine.generateMargins() as any;

      expect(margins.xl.$value).toBe('auto');
      expect(margins['2xl'].$value).toBe('auto');
      expect(margins.xs.$value).toBe('16px');
    });
  });

  describe('generateSpacingScale', () => {
    it('should generate exactly 17 entries', () => {
      const engine = new GridEngine();
      const scale = engine.generateSpacingScale(8);

      expect(scale).toHaveLength(17);
    });

    it('should include all required scale entries', () => {
      const engine = new GridEngine();
      const scale = engine.generateSpacingScale(8);

      const names = scale.map((entry) => entry.name);
      expect(names).toEqual([
        '0',
        'px',
        '0.5',
        '1',
        '1.5',
        '2',
        '2.5',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '10',
        '12',
        '14',
        '16',
      ]);
    });

    it('should have all values (except px) as multiples of 4', () => {
      const engine = new GridEngine();
      const scale = engine.generateSpacingScale(8);

      scale.forEach((entry) => {
        if (entry.name === 'px' || entry.name === '0') {
          return; // Skip px and 0
        }

        const value = parseInt(entry.value, 10);
        expect(value % 4).toBe(0);
      });
    });

    it('should scale values based on baseUnit parameter', () => {
      const engine = new GridEngine();
      const scale8 = engine.generateSpacingScale(8);
      const scale10 = engine.generateSpacingScale(10);

      const entry8 = scale8.find((e) => e.name === '4');
      const entry10 = scale10.find((e) => e.name === '4');

      expect(entry8?.value).toBe('32px'); // 8 * 4
      expect(entry10?.value).toBe('40px'); // 10 * 4
    });
  });

  describe('generateSpacingTokens', () => {
    it('should generate spacing token group with $description', () => {
      const engine = new GridEngine();
      const tokens = engine.generateSpacingTokens() as any;

      expect(tokens).toHaveProperty('spacing');
      expect(tokens.spacing).toHaveProperty('$description');
      expect(tokens.spacing.$description).toContain('8px base grid');
    });

    it('should generate dimension tokens for all scale entries', () => {
      const engine = new GridEngine();
      const tokens = engine.generateSpacingTokens() as any;

      expect(tokens.spacing['1'].$value).toBe('8px');
      expect(tokens.spacing['1'].$type).toBe('dimension');
      expect(tokens.spacing['16'].$value).toBe('128px');
    });
  });

  describe('generateGridTokens', () => {
    it('should generate complete grid structure', () => {
      const engine = new GridEngine();
      const tokens = engine.generateGridTokens() as any;

      expect(tokens).toHaveProperty('grid');
      expect(tokens.grid).toHaveProperty('$description');
      expect(tokens.grid).toHaveProperty('breakpoint');
      expect(tokens.grid).toHaveProperty('columns');
      expect(tokens.grid).toHaveProperty('gutter');
      expect(tokens.grid).toHaveProperty('margin');
      expect(tokens.grid).toHaveProperty('maxWidth');
    });

    it('should include maxWidth token', () => {
      const engine = new GridEngine();
      const tokens = engine.generateGridTokens() as any;

      expect(tokens.grid.maxWidth.$value).toBe('1280px');
      expect(tokens.grid.maxWidth.$type).toBe('dimension');
    });

    it('should reflect custom config values', () => {
      const tempDir = os.tmpdir();
      const configPath = path.join(tempDir, 'test-grid-config-custom.json');
      const customConfig: GridConfig = {
        baseUnit: 10,
        maxWidth: 1400,
        breakpoints: {
          xs: 0,
          sm: 640,
          md: 768,
          lg: 1024,
          xl: 1280,
          '2xl': 1536,
        },
      };

      fs.writeFileSync(configPath, JSON.stringify(customConfig), 'utf-8');

      try {
        const engine = new GridEngine(configPath);
        const tokens = engine.generateGridTokens() as any;

        expect(tokens.grid.maxWidth.$value).toBe('1400px');
        expect(tokens.grid.$description).toContain('10px base unit');
      } finally {
        fs.unlinkSync(configPath);
      }
    });
  });

  describe('writeGridTokens and writeSpacingTokens', () => {
    it('should write grid tokens to file', () => {
      const engine = new GridEngine();
      const tempDir = os.tmpdir();
      const outputPath = path.join(tempDir, 'test-grid.json');

      engine.writeGridTokens(outputPath);

      expect(fs.existsSync(outputPath)).toBe(true);

      const content = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
      expect(content).toHaveProperty('grid');

      fs.unlinkSync(outputPath);
    });

    it('should write spacing tokens to file', () => {
      const engine = new GridEngine();
      const tempDir = os.tmpdir();
      const outputPath = path.join(tempDir, 'test-spacing.json');

      engine.writeSpacingTokens(outputPath);

      expect(fs.existsSync(outputPath)).toBe(true);

      const content = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
      expect(content).toHaveProperty('spacing');

      fs.unlinkSync(outputPath);
    });

    it('should create directory if it does not exist', () => {
      const engine = new GridEngine();
      const tempDir = os.tmpdir();
      const nestedDir = path.join(tempDir, 'test-nested', 'tokens');
      const outputPath = path.join(nestedDir, 'grid.json');

      engine.writeGridTokens(outputPath);

      expect(fs.existsSync(outputPath)).toBe(true);

      // Cleanup
      fs.unlinkSync(outputPath);
      fs.rmdirSync(nestedDir);
      fs.rmdirSync(path.dirname(nestedDir));
    });
  });

  describe('semantic spacing references', () => {
    it('should resolve semantic spacing tokens via DTCG reference syntax', () => {
      // Read the actual semantic spacing file
      const semanticPath = path.join(
        __dirname,
        '..',
        '..',
        '..',
        '..',
        'tokens',
        'semantic',
        'spacing.json'
      );

      if (fs.existsSync(semanticPath)) {
        const semanticTokens = JSON.parse(fs.readFileSync(semanticPath, 'utf-8'));

        expect(semanticTokens.component.sm.$value).toBe('{spacing.1}');
        expect(semanticTokens.layout.section.$value).toBe('{spacing.10}');
        expect(semanticTokens.component.sm.$type).toBe('dimension');
      }
    });
  });
});
