#!/usr/bin/env node
'use strict';

/**
 * PostToolUse hook: validates that docs/projects/{name}/ always has INDEX.md
 * Triggers on Write/Edit tools when path matches docs/projects/
 * Returns warning if INDEX.md is missing for the project being modified
 */

const fs = require('fs');
const path = require('path');

function main() {
  try {
    const input = JSON.parse(fs.readFileSync('/dev/stdin', 'utf-8'));
    const toolName = input.tool_name || '';
    const toolInput = input.tool_input || {};

    // Only check Write/Edit/Bash tools
    if (!['Write', 'Edit', 'Bash'].includes(toolName)) {
      process.exit(0);
    }

    // Get the file path being operated on
    const filePath = toolInput.file_path || toolInput.command || '';

    // Check if operating in docs/projects/
    const match = filePath.match(/docs\/projects\/([^/]+)\//);
    if (!match) {
      process.exit(0);
    }

    const projectName = match[1];

    // Skip ACTIVE.md itself
    if (projectName === 'ACTIVE.md') {
      process.exit(0);
    }

    const projectRoot = process.env.CLAUDE_PROJECT_DIR || process.cwd();
    const projectDir = path.join(projectRoot, 'docs', 'projects', projectName);
    const indexPath = path.join(projectDir, 'INDEX.md');
    const sessionsDir = path.join(projectDir, 'sessions');

    const warnings = [];

    // Check INDEX.md exists
    if (!fs.existsSync(indexPath)) {
      warnings.push(`INDEX.md missing for project "${projectName}"`);
    }

    // Check sessions/ exists
    if (!fs.existsSync(sessionsDir)) {
      warnings.push(`sessions/ directory missing for project "${projectName}"`);
    }

    // Check ACTIVE.md has a row for this project
    const activePath = path.join(projectRoot, 'docs', 'projects', 'ACTIVE.md');
    if (fs.existsSync(activePath)) {
      const activeContent = fs.readFileSync(activePath, 'utf-8');
      if (!activeContent.includes(projectName)) {
        warnings.push(`Project "${projectName}" not listed in ACTIVE.md`);
      }
    }

    if (warnings.length > 0) {
      // Output warning to stderr (shown to user)
      const msg = [
        `Project structure incomplete for "${projectName}":`,
        ...warnings.map((w) => `  - ${w}`),
        'Use /new-project to create projects with proper structure.',
      ].join('\n');
      process.stderr.write(msg + '\n');
    }

    process.exit(0);
  } catch (err) {
    // Don't block on hook errors
    process.exit(0);
  }
}

main();
