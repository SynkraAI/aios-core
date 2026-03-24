#!/usr/bin/env ts-node
/**
 * Generate grid and spacing tokens
 */

import { GridEngine } from '../packages/tokens/src/grid-engine';
import * as path from 'path';
import * as fs from 'fs';

const rootDir = path.join(__dirname, '..');
const configPath = path.join(rootDir, 'tokens', 'grid.config.json');
const engine = new GridEngine(configPath);

// Generate and write grid tokens
const gridTokens = engine.generateGridTokens();
const gridPath = path.join(rootDir, 'tokens', 'primitive', 'grid.json');
fs.writeFileSync(gridPath, JSON.stringify(gridTokens, null, 2), 'utf-8');
console.log('✓ Grid tokens written to:', gridPath);

// Generate and write spacing tokens
const spacingTokens = engine.generateSpacingTokens();
const spacingPath = path.join(rootDir, 'tokens', 'primitive', 'spacing.json');
fs.writeFileSync(spacingPath, JSON.stringify(spacingTokens, null, 2), 'utf-8');
console.log('✓ Spacing tokens written to:', spacingPath);

console.log('\nTokens generated successfully!');
