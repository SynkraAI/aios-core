#!/usr/bin/env node

/**
 * Ecosystem Index Trigger Hook
 *
 * Wrapper for PostToolUse hook that checks if modified files are agents/minds
 * before triggering index regeneration.
 *
 * Only triggers if:
 * - File is in .aiox-core/development/agents/
 * - File is in squads/*/agents/
 * - File is squads/mind-cloning/minds/INDEX.md
 *
 * This prevents unnecessary executions on non-agent file edits.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const cwd = process.env.CLAUDE_PROJECT_DIR || process.cwd();

// Check if any modified files match agent/mind paths
function shouldTrigger() {
  // Get list of recently modified files from git (last 5 seconds)
  try {
    const output = execSync('git status --porcelain', { cwd, encoding: 'utf8' });
    const lines = output.split('\n').filter(line => line.trim());

    for (const line of lines) {
      const file = line.substring(3).trim(); // Remove status prefix

      // Check if file matches trigger patterns
      if (file.includes('.aiox-core/development/agents/') ||
          file.includes('squads/') && file.includes('/agents/') ||
          file === 'squads/mind-cloning/minds/INDEX.md') {
        return true;
      }
    }

    return false;

  } catch (error) {
    // If git command fails, don't trigger (graceful degradation)
    return false;
  }
}

// Main execution
if (shouldTrigger()) {
  try {
    execSync('node scripts/generate-ecosystem-index.js --quiet', {
      cwd,
      stdio: 'inherit'
    });
  } catch (error) {
    // Graceful failure: don't block hook pipeline
    console.error(`[ecosystem-index-trigger] Warning: ${error.message}`);
  }
}

// Always exit 0 (never block hook pipeline)
process.exit(0);
