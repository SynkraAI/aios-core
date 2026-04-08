#!/usr/bin/env node

/**
 * Frontmatter Check — PostToolUse Hook (Write/Edit)
 * ==================================================
 * Triggered: After Write or Edit on files in skills/, squads/, .aios-core/development/agents/
 * Purpose: Warn when a file is created/modified without proper frontmatter
 * Timeout: 3s (fail-silent)
 *
 * Does NOT block — only warns via additionalContext.
 */

'use strict';

const fs = require('fs');
const path = require('path');

// Paths that should have frontmatter
const WATCHED_PATTERNS = [
  { regex: /skills\/[^/]+\/SKILL\.md$/, type: 'skill', required: ['name', 'description'] },
  { regex: /squads\/[^/]+\/README\.md$/, type: 'squad', required: ['name', 'description'] },
  { regex: /squads\/[^/]+\/agents\/[^/]+\.md$/, type: 'agent', required: ['name', 'description'] },
  { regex: /\.aios-core\/development\/agents\/[^/]+\.md$/, type: 'agent', required: ['name', 'description'] },
];

function main() {
  try {
    const input = JSON.parse(fs.readFileSync('/dev/stdin', 'utf-8'));
    const toolName = input.tool_name;
    const filePath = input.tool_input?.file_path || '';

    // Only check Write and Edit
    if (toolName !== 'Write' && toolName !== 'Edit') {
      console.log(JSON.stringify({ result: 'ok' }));
      return;
    }

    // Check if file matches watched patterns
    const match = WATCHED_PATTERNS.find((p) => p.regex.test(filePath));
    if (!match) {
      console.log(JSON.stringify({ result: 'ok' }));
      return;
    }

    // Read the file
    if (!fs.existsSync(filePath)) {
      console.log(JSON.stringify({ result: 'ok' }));
      return;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const trimmed = content.trimStart();

    // Check for YAML frontmatter
    if (!trimmed.startsWith('---')) {
      const fileName = path.basename(filePath);
      console.log(
        JSON.stringify({
          result: 'warn',
          additionalContext: `⚠️ FRONTMATTER MISSING: ${fileName} (${match.type}) has no YAML frontmatter. Standard: add --- block with ${match.required.join(', ')} fields. Run: node tools/frontmatter-lint.js --scope=${match.type}s`,
        })
      );
      return;
    }

    // Parse frontmatter fields
    const endIdx = trimmed.indexOf('---', 3);
    if (endIdx === -1) {
      console.log(
        JSON.stringify({
          result: 'warn',
          additionalContext: `⚠️ FRONTMATTER MALFORMED: ${path.basename(filePath)} has unclosed --- block.`,
        })
      );
      return;
    }

    const fmBlock = trimmed.slice(3, endIdx);
    const missing = [];
    for (const field of match.required) {
      const fieldRegex = new RegExp(`^${field}\\s*:`, 'm');
      if (!fieldRegex.test(fmBlock)) {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      console.log(
        JSON.stringify({
          result: 'warn',
          additionalContext: `⚠️ FRONTMATTER INCOMPLETE: ${path.basename(filePath)} missing required fields: ${missing.join(', ')}. Run: node tools/frontmatter-lint.js`,
        })
      );
      return;
    }

    // All good
    console.log(JSON.stringify({ result: 'ok' }));
  } catch {
    // Fail-silent — never block the user
    console.log(JSON.stringify({ result: 'ok' }));
  }
}

main();
