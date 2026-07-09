#!/usr/bin/env node
/**
 * Asynchronous worker for SYNAPSE Memory Bridge.
 *
 * Updates `reinforcement_count` in the canonical L1 heuristic hints YAML.
 * Single Source of Truth: .aiox-core/governance/global-heuristic-hints.yaml
 *
 * Invoked as detached child by MemoryBridge._reinforceHeuristics().
 */
'use strict';

const fs = require('fs');
const path = require('path');

const HINTS_PATH = path.join(__dirname, '..', 'governance', 'global-heuristic-hints.yaml');

const heuristicIds = process.argv.slice(2);
if (heuristicIds.length === 0) process.exit(0);

try {
  if (!fs.existsSync(HINTS_PATH)) {
    console.warn('[synapse:heuristic-worker] Hints file not found:', HINTS_PATH);
    process.exit(1);
  }

  const lines = fs.readFileSync(HINTS_PATH, 'utf8').split('\n');
  let modified = false;

  for (const targetId of heuristicIds) {
    const idPattern = `- id: "${targetId}"`;
    const entryIndex = lines.findIndex((line) => line.trim() === idPattern);
    if (entryIndex === -1) continue;

    let countLineIndex = -1;
    let blockEnd = lines.length;
    for (let i = entryIndex + 1; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (trimmed.startsWith('- id:')) {
        blockEnd = i;
        break;
      }
      if (trimmed.startsWith('reinforcement_count:')) {
        countLineIndex = i;
        break;
      }
    }

    if (countLineIndex !== -1) {
      const indent = lines[countLineIndex].match(/^(\s*)/)[1];
      const currentCount = parseInt(
        lines[countLineIndex].match(/:\s*(\d+)/)?.[1] || '0',
        10,
      );
      lines[countLineIndex] = `${indent}reinforcement_count: ${currentCount + 1}`;
      modified = true;
    } else {
      const labelIndex = lines.findIndex(
        (line, idx) =>
          idx > entryIndex && idx < blockEnd && line.trim().startsWith('label:'),
      );
      const insertAt = labelIndex !== -1 ? labelIndex + 1 : entryIndex + 1;
      const indent = `${lines[entryIndex].match(/^(\s*)/)[1]}  `;
      lines.splice(insertAt, 0, `${indent}reinforcement_count: 1`);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(HINTS_PATH, lines.join('\n'), 'utf8');
  }
} catch (error) {
  console.error(`[synapse:heuristic-worker] ${error.message}`);
  process.exit(1);
}
