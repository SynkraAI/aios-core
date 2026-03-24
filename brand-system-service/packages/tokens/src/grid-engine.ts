/**
 * GridEngine - Grid System & Spacing Generator
 *
 * Generates W3C DTCG design tokens for grid system (breakpoints, columns, gutters, margins)
 * and 8px-base spacing scale. Supports customization via grid.config.json.
 *
 * @module grid-engine
 */

import fs from 'fs';
import path from 'path';
import { TokenGroup } from './types';

/**
 * Grid configuration options
 */
export interface GridConfig {
  /** Base unit for spacing scale (default: 8px) */
  baseUnit: number;
  /** Maximum content width for centered layouts (default: 1280px) */
  maxWidth: number;
  /** Breakpoint definitions in pixels */
  breakpoints: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
  };
}

/**
 * Default grid configuration
 */
const DEFAULT_GRID_CONFIG: GridConfig = {
  baseUnit: 8,
  maxWidth: 1280,
  breakpoints: {
    xs: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
};

/**
 * Spacing scale entry
 */
export interface SpacingEntry {
  name: string;
  value: string;
  description: string;
}

/**
 * Spacing scale collection
 */
export type SpacingScale = SpacingEntry[];

/**
 * Grid System Engine
 *
 * Generates grid tokens (breakpoints, columns, gutters, margins) and spacing scale
 * based on an 8px base grid system.
 */
export class GridEngine {
  private config: GridConfig;

  /**
   * Create a new GridEngine instance
   *
   * @param configPath - Optional path to grid.config.json
   */
  constructor(configPath?: string) {
    this.config = this.loadConfig(configPath);
  }

  /**
   * Load grid configuration from file or use defaults
   */
  private loadConfig(configPath?: string): GridConfig {
    if (!configPath) {
      return DEFAULT_GRID_CONFIG;
    }

    try {
      const configFile = fs.readFileSync(configPath, 'utf-8');
      const customConfig = JSON.parse(configFile) as Partial<GridConfig>;

      // Merge with defaults
      return {
        baseUnit: customConfig.baseUnit ?? DEFAULT_GRID_CONFIG.baseUnit,
        maxWidth: customConfig.maxWidth ?? DEFAULT_GRID_CONFIG.maxWidth,
        breakpoints: {
          ...DEFAULT_GRID_CONFIG.breakpoints,
          ...customConfig.breakpoints,
        },
      };
    } catch (error) {
      // If config file doesn't exist or is invalid, use defaults
      return DEFAULT_GRID_CONFIG;
    }
  }

  /**
   * Generate breakpoint tokens
   *
   * @returns Token group for breakpoints
   */
  public generateBreakpoints(): TokenGroup {
    const tokens: Record<string, TokenGroup> = {};

    Object.entries(this.config.breakpoints).forEach(([name, value]) => {
      tokens[name] = {
        $value: `${value}px`,
        $type: 'dimension',
        $description: `Breakpoint ${name} — ${value}px`,
      };
    });

    return tokens;
  }

  /**
   * Generate column count tokens per breakpoint
   *
   * @returns Token group for column counts
   */
  public generateColumns(): TokenGroup {
    const columnCounts: Record<string, number> = {
      xs: 4,
      sm: 8,
      md: 8,
      lg: 12,
      xl: 12,
      '2xl': 12,
    };

    const tokens: Record<string, TokenGroup> = {};

    Object.entries(columnCounts).forEach(([name, count]) => {
      tokens[name] = {
        $value: count,
        $type: 'number',
        $description: `${count} columns at ${name} breakpoint`,
      };
    });

    return tokens;
  }

  /**
   * Generate gutter size tokens per breakpoint
   *
   * @returns Token group for gutter sizes
   */
  public generateGutters(): TokenGroup {
    const gutterSizes: Record<string, number> = {
      xs: 16,
      sm: 16,
      md: 24,
      lg: 24,
      xl: 32,
      '2xl': 32,
    };

    const tokens: Record<string, TokenGroup> = {};

    Object.entries(gutterSizes).forEach(([name, size]) => {
      tokens[name] = {
        $value: `${size}px`,
        $type: 'dimension',
        $description: `${size}px gutter at ${name} breakpoint`,
      };
    });

    return tokens;
  }

  /**
   * Generate margin tokens per breakpoint
   *
   * @returns Token group for margins
   */
  public generateMargins(): TokenGroup {
    const marginSizes: Record<string, string> = {
      xs: '16px',
      sm: '24px',
      md: '32px',
      lg: '40px',
      xl: 'auto',
      '2xl': 'auto',
    };

    const tokens: Record<string, TokenGroup> = {};

    Object.entries(marginSizes).forEach(([name, size]) => {
      const description =
        size === 'auto'
          ? `Auto margin at ${name} breakpoint (max-width: ${this.config.maxWidth}px)`
          : `${size} margin at ${name} breakpoint`;

      tokens[name] = {
        $value: size,
        $type: 'dimension',
        $description: description,
      };
    });

    return tokens;
  }

  /**
   * Generate complete grid token structure
   *
   * @returns Complete grid token group with breakpoints, columns, gutters, margins
   */
  public generateGridTokens(): Record<string, unknown> {
    return {
      grid: {
        $description: `Grid system based on ${this.config.baseUnit}px base unit. All spacing aligns to a 4px sub-grid and ${this.config.baseUnit}px primary grid for vertical rhythm. Touch targets satisfy 44x44px minimum via padding (e.g., button height = 5×8px = 40px + padding).`,
        breakpoint: this.generateBreakpoints(),
        columns: this.generateColumns(),
        gutter: this.generateGutters(),
        margin: this.generateMargins(),
        maxWidth: {
          $value: `${this.config.maxWidth}px`,
          $type: 'dimension',
          $description: `Maximum content width for centered layouts`,
        },
      },
    };
  }

  /**
   * Generate 8px-base spacing scale with 17 entries
   *
   * Scale: 0, px, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 7, 8, 10, 12, 14, 16
   * All values are multiples of 4px (primary grid uses 8px intervals)
   *
   * @param baseUnit - Base unit for spacing scale (default: 8)
   * @returns Spacing scale with 17 entries
   */
  public generateSpacingScale(baseUnit: number = 8): SpacingScale {
    const scale: SpacingScale = [
      { name: '0', value: '0', description: 'No spacing' },
      { name: 'px', value: '1px', description: '1px — hairline borders' },
      { name: '0.5', value: '4px', description: '4px — smallest spacing unit (sub-grid)' },
      { name: '1', value: `${baseUnit}px`, description: `${baseUnit}px — base grid unit, tight spacing` },
      { name: '1.5', value: `${baseUnit * 1.5}px`, description: `${baseUnit * 1.5}px — compact spacing` },
      { name: '2', value: `${baseUnit * 2}px`, description: `${baseUnit * 2}px — default element spacing` },
      { name: '2.5', value: `${baseUnit * 2.5}px`, description: `${baseUnit * 2.5}px — comfortable spacing` },
      { name: '3', value: `${baseUnit * 3}px`, description: `${baseUnit * 3}px — section inner padding` },
      { name: '4', value: `${baseUnit * 4}px`, description: `${baseUnit * 4}px — section spacing` },
      { name: '5', value: `${baseUnit * 5}px`, description: `${baseUnit * 5}px — touch target height (40px + padding = 44px)` },
      { name: '6', value: `${baseUnit * 6}px`, description: `${baseUnit * 6}px — large gaps` },
      { name: '7', value: `${baseUnit * 7}px`, description: `${baseUnit * 7}px — section dividers` },
      { name: '8', value: `${baseUnit * 8}px`, description: `${baseUnit * 8}px — major layout gaps` },
      { name: '10', value: `${baseUnit * 10}px`, description: `${baseUnit * 10}px — large section spacing` },
      { name: '12', value: `${baseUnit * 12}px`, description: `${baseUnit * 12}px — page sections` },
      { name: '14', value: `${baseUnit * 14}px`, description: `${baseUnit * 14}px — major page dividers` },
      { name: '16', value: `${baseUnit * 16}px`, description: `${baseUnit * 16}px — largest spacing unit` },
    ];

    return scale;
  }

  /**
   * Convert spacing scale to W3C DTCG token group
   *
   * @returns Token group for spacing scale
   */
  public generateSpacingTokens(): Record<string, unknown> {
    const scale = this.generateSpacingScale(this.config.baseUnit);
    const tokens: Record<string, TokenGroup> = {};

    scale.forEach(({ name, value, description }) => {
      tokens[name] = {
        $value: value,
        $type: 'dimension',
        $description: description,
      };
    });

    return {
      spacing: {
        $description: `Spacing scale based on ${this.config.baseUnit}px base grid. All values (except 'px') are multiples of 4px for sub-grid alignment and ${this.config.baseUnit}px for primary vertical rhythm.`,
        ...tokens,
      },
    };
  }

  /**
   * Write grid tokens to file
   *
   * @param outputPath - Path to write grid.json
   */
  public writeGridTokens(outputPath: string): void {
    const tokens = this.generateGridTokens();
    const dir = path.dirname(outputPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(tokens, null, 2), 'utf-8');
  }

  /**
   * Write spacing tokens to file
   *
   * @param outputPath - Path to write spacing.json
   */
  public writeSpacingTokens(outputPath: string): void {
    const tokens = this.generateSpacingTokens();
    const dir = path.dirname(outputPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(tokens, null, 2), 'utf-8');
  }
}
