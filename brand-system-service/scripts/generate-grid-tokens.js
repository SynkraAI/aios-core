#!/usr/bin/env node
/**
 * Generate grid and spacing tokens (JavaScript version)
 */

const fs = require('fs');
const path = require('path');

// Default grid configuration
const DEFAULT_GRID_CONFIG = {
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

// Load config
const rootDir = path.join(__dirname, '..');
const configPath = path.join(rootDir, 'tokens', 'grid.config.json');
const config = fs.existsSync(configPath)
  ? JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  : DEFAULT_GRID_CONFIG;

// Generate breakpoint tokens
function generateBreakpoints(breakpoints) {
  const tokens = {};
  Object.entries(breakpoints).forEach(([name, value]) => {
    tokens[name] = {
      $value: `${value}px`,
      $type: 'dimension',
      $description: `Breakpoint ${name} — ${value}px`,
    };
  });
  return tokens;
}

// Generate column count tokens
function generateColumns() {
  const columnCounts = {
    xs: 4,
    sm: 8,
    md: 8,
    lg: 12,
    xl: 12,
    '2xl': 12,
  };

  const tokens = {};
  Object.entries(columnCounts).forEach(([name, count]) => {
    tokens[name] = {
      $value: count,
      $type: 'number',
      $description: `${count} columns at ${name} breakpoint`,
    };
  });
  return tokens;
}

// Generate gutter size tokens
function generateGutters() {
  const gutterSizes = {
    xs: 16,
    sm: 16,
    md: 24,
    lg: 24,
    xl: 32,
    '2xl': 32,
  };

  const tokens = {};
  Object.entries(gutterSizes).forEach(([name, size]) => {
    tokens[name] = {
      $value: `${size}px`,
      $type: 'dimension',
      $description: `${size}px gutter at ${name} breakpoint`,
    };
  });
  return tokens;
}

// Generate margin tokens
function generateMargins(maxWidth) {
  const marginSizes = {
    xs: '16px',
    sm: '24px',
    md: '32px',
    lg: '40px',
    xl: 'auto',
    '2xl': 'auto',
  };

  const tokens = {};
  Object.entries(marginSizes).forEach(([name, size]) => {
    const description =
      size === 'auto'
        ? `Auto margin at ${name} breakpoint (max-width: ${maxWidth}px)`
        : `${size} margin at ${name} breakpoint`;

    tokens[name] = {
      $value: size,
      $type: 'dimension',
      $description: description,
    };
  });
  return tokens;
}

// Generate complete grid tokens
function generateGridTokens(config) {
  return {
    grid: {
      $description: `Grid system based on ${config.baseUnit}px base unit. All spacing aligns to a 4px sub-grid and ${config.baseUnit}px primary grid for vertical rhythm. Touch targets satisfy 44x44px minimum via padding (e.g., button height = 5×8px = 40px + padding).`,
      breakpoint: generateBreakpoints(config.breakpoints),
      columns: generateColumns(),
      gutter: generateGutters(),
      margin: generateMargins(config.maxWidth),
      maxWidth: {
        $value: `${config.maxWidth}px`,
        $type: 'dimension',
        $description: `Maximum content width for centered layouts`,
      },
    },
  };
}

// Generate spacing scale
function generateSpacingScale(baseUnit) {
  return [
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
    { name: '16', value: `${baseUnit * 16}px`, description: `${baseUnit * 128}px — largest spacing unit` },
  ];
}

// Generate spacing tokens
function generateSpacingTokens(baseUnit) {
  const scale = generateSpacingScale(baseUnit);
  const tokens = {};

  scale.forEach(({ name, value, description }) => {
    tokens[name] = {
      $value: value,
      $type: 'dimension',
      $description: description,
    };
  });

  return {
    spacing: {
      $description: `Spacing scale based on ${baseUnit}px base grid. All values (except 'px') are multiples of 4px for sub-grid alignment and ${baseUnit}px for primary vertical rhythm.`,
      ...tokens,
    },
  };
}

// Generate and write grid tokens
const gridTokens = generateGridTokens(config);
const gridPath = path.join(rootDir, 'tokens', 'primitive', 'grid.json');
fs.writeFileSync(gridPath, JSON.stringify(gridTokens, null, 2), 'utf-8');
console.log('✓ Grid tokens written to:', gridPath);

// Generate and write spacing tokens
const spacingTokens = generateSpacingTokens(config.baseUnit);
const spacingPath = path.join(rootDir, 'tokens', 'primitive', 'spacing.json');
fs.writeFileSync(spacingPath, JSON.stringify(spacingTokens, null, 2), 'utf-8');
console.log('✓ Spacing tokens written to:', spacingPath);

console.log('\nTokens generated successfully!');
