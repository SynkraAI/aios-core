/**
 * Metrics Command Module
 *
 * Entry point for all quality metrics CLI commands.
 * Includes record, show, seed, and cleanup subcommands.
 *
 * @module cli/commands/metrics
 * @version 1.0.0
 * @story 3.11a - Quality Gates Metrics Collector
 */

const { Command } = require('commander');
const { createRecordCommand } = require('./record');
const { createShowCommand } = require('./show');
const { createSeedCommand } = require('./seed');
const { createCleanupCommand } = require('./cleanup');

/**
 * Create the metrics command with all subcommands
 * @returns {Command} Commander command instance
 */
function createMetricsCommand() {
  const metrics = new Command('metrics');

  metrics
    .description('Quality Gates Metrics - collect and analyze quality data')
    .addHelpText('after', `
Commands:
  record            Record a quality gate run
  show              Display current metrics
  seed              Generate seed data for testing
  cleanup           Remove old records beyond retention period

Data Storage:
  Metrics are stored in .aios/data/quality-metrics.json
  History is retained for 30 days by default

Layers:
  Layer 1: Pre-commit (lint, test, typecheck)
  Layer 2: PR Automation (CodeRabbit, Quinn)
  Layer 3: Human Review (checklist, sign-off)

Examples:
  $ aios metrics record --layer 1 --passed --duration 3200
  $ aios metrics record --layer 2 --passed --findings 3 --coderabbit
  $ aios metrics show
  $ aios metrics show --layer 2
  $ aios metrics show --format json
  $ aios metrics seed --days 30
  $ aios metrics cleanup
  $ aios metrics cleanup --dry-run
`);

  // Add subcommands
  metrics.addCommand(createRecordCommand());
  metrics.addCommand(createShowCommand());
  metrics.addCommand(createSeedCommand());
  metrics.addCommand(createCleanupCommand());

  return metrics;
}

module.exports = {
  createMetricsCommand,
};
