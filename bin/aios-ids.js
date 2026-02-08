#!/usr/bin/env node

/**
 * AIOS IDS CLI — Incremental Development System
 * Standalone (no external dependencies for npx compatibility)
 *
 * Commands:
 *   aios ids:query {intent}     — Query registry for matching artifacts
 *   aios ids:create-review      — Review CREATE decisions for promotion/deprecation
 *
 * Flags:
 *   --json                      — Machine-readable JSON output
 *   --type {type}               — Filter by entity type
 *   --category {category}       — Filter by category
 *
 * Story: IDS-2 (Incremental Decision Engine)
 */

'use strict';

const path = require('path');
const { RegistryLoader } = require(path.resolve(__dirname, '..', '.aios-core', 'core', 'ids', 'registry-loader'));
const { IncrementalDecisionEngine } = require(path.resolve(__dirname, '..', '.aios-core', 'core', 'ids', 'incremental-decision-engine'));

// Parse arguments
const args = process.argv.slice(2);
const command = args[0];
const flags = args.filter((a) => a.startsWith('--'));
const jsonOutput = flags.includes('--json');

function showHelp() {
  console.log(`
AIOS IDS — Incremental Development System

Commands:
  ids:query {intent}       Query registry for matching artifacts
  ids:create-review        Review CREATE decisions (30-day review)

Flags:
  --json                   Output as JSON
  --type {type}            Filter by entity type (task, script, agent, etc.)
  --category {category}    Filter by category

Examples:
  aios ids:query "validate story drafts"
  aios ids:query "template rendering engine" --json
  aios ids:query "database migration" --type script
  aios ids:create-review
  aios ids:create-review --json
`);
}

function getFlag(name) {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1 || idx + 1 >= args.length) return undefined;
  return args[idx + 1];
}

function formatRecommendation(rec, index) {
  const lines = [];
  const icon = rec.decision === 'REUSE' ? '\u2705' : rec.decision === 'ADAPT' ? '\u{1F504}' : '\u2728';
  lines.push(`  ${index + 1}. ${icon} ${rec.decision} (${rec.confidence}) — ${rec.entityId}`);
  lines.push(`     Path: ${rec.entityPath}`);
  lines.push(`     Type: ${rec.entityType} | Relevance: ${(rec.relevanceScore * 100).toFixed(1)}%`);
  lines.push(`     ${rec.rationale}`);
  if (rec.adaptationImpact) {
    lines.push(`     Impact: ${rec.adaptationImpact.directCount} direct, ${rec.adaptationImpact.indirectCount} indirect consumers`);
  }
  return lines.join('\n');
}

function formatCreateReviewEntry(entry) {
  const statusIcon = {
    'promotion-candidate': '\u{1F31F}',
    'monitoring': '\u{1F50D}',
    'deprecation-review': '\u26A0\uFE0F',
  };
  const icon = statusIcon[entry.status] || '\u2753';
  return `  ${icon} ${entry.entityId} — reused ${entry.reusageCount}x — status: ${entry.status}`;
}

function runQuery() {
  // Collect intent: skip flag names and their values positionally
  const flagNames = new Set(['--json', '--type', '--category']);
  const intentParts = [];
  let skipNext = false;
  for (let i = 1; i < args.length; i++) {
    if (skipNext) {
      skipNext = false;
      continue;
    }
    if (args[i] === '--type' || args[i] === '--category') {
      skipNext = true; // skip the flag's value
      continue;
    }
    if (flagNames.has(args[i])) {
      continue; // skip standalone flags like --json
    }
    intentParts.push(args[i]);
  }
  const intent = intentParts.join(' ').trim();

  if (!intent) {
    console.error('Error: Intent is required. Usage: aios ids:query "your intent here"');
    process.exit(1);
  }

  const loader = new RegistryLoader();
  try {
    loader.load();
  } catch (err) {
    console.error(`Error: Failed to load registry — ${err.message}`);
    process.exit(1);
  }

  const engine = new IncrementalDecisionEngine(loader);
  const context = {};
  const typeFilter = getFlag('type');
  const categoryFilter = getFlag('category');
  if (typeFilter) context.type = typeFilter;
  if (categoryFilter) context.category = categoryFilter;

  const result = engine.analyze(intent, context);

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // Formatted output
  console.log(`\nIDS Analysis: "${intent}"`);
  console.log(`${'─'.repeat(60)}`);
  console.log(`Registry: ${result.summary.totalEntities} entities | Matches: ${result.summary.matchesFound}`);
  console.log(`Decision: ${result.summary.decision} (${result.summary.confidence} confidence)`);

  if (result.warnings && result.warnings.length > 0) {
    for (const w of result.warnings) {
      console.log(`\u26A0\uFE0F  ${w}`);
    }
  }

  console.log(`\nRationale: ${result.rationale}`);

  if (result.recommendations.length > 0) {
    console.log('\nRecommendations:');
    for (let i = 0; i < result.recommendations.length; i++) {
      console.log(formatRecommendation(result.recommendations[i], i));
    }
  }

  if (result.justification) {
    console.log('\nCREATE Justification:');
    console.log(`  Evaluated: ${result.justification.evaluated_patterns.join(', ') || 'none'}`);
    if (Object.keys(result.justification.rejection_reasons).length > 0) {
      console.log('  Rejections:');
      for (const [id, reason] of Object.entries(result.justification.rejection_reasons)) {
        console.log(`    - ${id}: ${reason}`);
      }
    }
    console.log(`  New capability: ${result.justification.new_capability}`);
    console.log(`  Review scheduled: ${result.justification.review_scheduled}`);
  }

  console.log('');
}

function runCreateReview() {
  const loader = new RegistryLoader();
  try {
    loader.load();
  } catch (err) {
    console.error(`Error: Failed to load registry — ${err.message}`);
    process.exit(1);
  }

  const engine = new IncrementalDecisionEngine(loader);
  const report = engine.reviewCreateDecisions();

  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log('\nIDS CREATE Decision Review');
  console.log(`${'─'.repeat(60)}`);
  console.log(`Total entities with CREATE justification: ${report.totalReviewed}`);

  if (report.totalReviewed === 0) {
    console.log('\nNo entities with CREATE justification metadata found.');
    console.log('CREATE justifications are stored when new entities are registered via IDS.');
    console.log('');
    return;
  }

  if (report.pendingReview.length > 0) {
    console.log(`\nPending Review (${report.pendingReview.length}):`);
    for (const entry of report.pendingReview) {
      console.log(formatCreateReviewEntry(entry));
    }
  }

  if (report.promotionCandidates.length > 0) {
    console.log(`\nPromotion Candidates (${report.promotionCandidates.length}):`);
    for (const entry of report.promotionCandidates) {
      console.log(formatCreateReviewEntry(entry));
    }
  }

  if (report.deprecationReview.length > 0) {
    console.log(`\nDeprecation Review (${report.deprecationReview.length}):`);
    for (const entry of report.deprecationReview) {
      console.log(formatCreateReviewEntry(entry));
    }
  }

  if (report.monitoring.length > 0) {
    console.log(`\nMonitoring (${report.monitoring.length}):`);
    for (const entry of report.monitoring) {
      console.log(formatCreateReviewEntry(entry));
    }
  }

  console.log('');
}

// Main dispatch
switch (command) {
  case 'ids:query':
  case 'query':
    runQuery();
    break;

  case 'ids:create-review':
  case 'create-review':
    runCreateReview();
    break;

  case '--help':
  case '-h':
  case 'help':
  case undefined:
    showHelp();
    break;

  default:
    console.error(`Unknown command: ${command}`);
    showHelp();
    process.exit(1);
}
