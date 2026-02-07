#!/usr/bin/env node
// GarimpoAI CLI entry point - delegates to tsx for TypeScript execution
const { execSync } = require('child_process');
const path = require('path');

const srcPath = path.join(__dirname, '..', 'src', 'index.ts');
const args = process.argv.slice(2).join(' ');

try {
  execSync(`npx tsx ${srcPath} ${args}`, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  });
} catch (error) {
  // Exit code is already propagated by execSync
  process.exit(error.status || 1);
}
