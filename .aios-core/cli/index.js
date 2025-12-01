/**
 * AIOS CLI Entry Point
 *
 * Main entry point for the AIOS CLI with Commander.js integration.
 * Registers all subcommands including workers, agents, etc.
 *
 * @module cli
 * @version 1.0.0
 * @story 2.7 - Discovery CLI Search
 */

const { Command } = require('commander');
const path = require('path');
const fs = require('fs');

// Import command modules
const { createWorkersCommand } = require('./commands/workers');
const { createManifestCommand } = require('./commands/manifest');
const { createQaCommand } = require('./commands/qa');
const { createMcpCommand } = require('./commands/mcp');
const { createMigrateCommand } = require('./commands/migrate');

// Read package.json for version
const packageJsonPath = path.join(__dirname, '..', '..', 'package.json');
let packageVersion = '0.0.0';
try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageVersion = packageJson.version;
} catch (error) {
  // Fallback version if package.json not found
}

/**
 * Create the main CLI program
 * @returns {Command} Commander program instance
 */
function createProgram() {
  const program = new Command();

  program
    .name('aios')
    .version(packageVersion)
    .description('AIOS-FullStack: AI-Orchestrated System for Full Stack Development')
    .addHelpText('after', `
Commands:
  workers           Manage and discover workers
  manifest          Manage manifest files (validate, regenerate)
  qa                Quality Gate Manager (run, status)
  mcp               Manage global MCP configuration
  migrate           Migrate from v2.0 to v2.1 structure
  install           Install AIOS in current project
  init <name>       Create new AIOS project
  info              Show system information
  doctor            Run system diagnostics

For command help:
  $ aios <command> --help

Examples:
  $ aios workers search "json transformation"
  $ aios workers list --category=data
  $ aios manifest validate
  $ aios manifest regenerate
  $ aios qa run
  $ aios qa status
  $ aios mcp setup --with-defaults
  $ aios mcp link
  $ aios mcp status
  $ aios migrate --dry-run
  $ aios migrate --from=2.0 --to=2.1
  $ aios install
  $ aios doctor
`);

  // Add workers command
  program.addCommand(createWorkersCommand());

  // Add manifest command (Story 2.13)
  program.addCommand(createManifestCommand());

  // Add qa command (Story 2.10)
  program.addCommand(createQaCommand());

  // Add mcp command (Story 2.11)
  program.addCommand(createMcpCommand());

  // Add migrate command (Story 2.14)
  program.addCommand(createMigrateCommand());

  return program;
}

/**
 * Run the CLI
 * @param {string[]} args - Command line arguments
 * @returns {Promise<void>}
 */
async function run(args = process.argv) {
  const program = createProgram();

  try {
    await program.parseAsync(args);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = {
  createProgram,
  run
};
