/**
 * Workers Command Module
 *
 * Entry point for all workers-related CLI commands.
 * Includes search, list, and info subcommands.
 *
 * @module cli/commands/workers
 * @version 1.1.0
 * @story 2.7 - Discovery CLI Search
 * @story 2.8-2.9 - Discovery CLI Info & List
 */

const { Command } = require('commander');
const { createSearchCommand } = require('./search');
const { createInfoCommand } = require('./info');
const { createListCommand } = require('./list');

/**
 * Create the workers command with all subcommands
 * @returns {Command} Commander command instance
 */
function createWorkersCommand() {
  const workers = new Command('workers');

  workers
    .description('Manage and discover workers in the service registry')
    .addHelpText('after', `
Commands:
  search <query>    Search for workers matching a query
  list              List all workers grouped by category
  info <id>         Show detailed information about a worker

Examples:
  $ aios workers search "json transformation"
  $ aios workers search "data" --category=etl
  $ aios workers list --category=testing
  $ aios workers list --format=table --page=2
  $ aios workers info json-csv-transformer
  $ aios workers info architect-checklist --format=json
`);

  // Add search subcommand (Story 2.7)
  workers.addCommand(createSearchCommand());

  // Add info subcommand (Story 2.8)
  workers.addCommand(createInfoCommand());

  // Add list subcommand (Story 2.9)
  workers.addCommand(createListCommand());

  return workers;
}

module.exports = {
  createWorkersCommand,
};
