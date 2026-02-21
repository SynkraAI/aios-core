'use strict';

const { CodeIntelSource } = require('./data-sources/code-intel-source');
const { renderTree } = require('./renderers/tree-renderer');

const COMMANDS = {
  '--deps': handleDeps,
  '--help': handleHelp,
  '-h': handleHelp,
};

/**
 * Parse CLI arguments into structured args object.
 * @param {string[]} argv - Raw CLI arguments
 * @returns {Object} Parsed args
 */
function parseArgs(argv) {
  const args = {
    command: null,
    format: 'ascii',
    file: null,
    interval: 5,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === '--help' || arg === '-h') {
      args.help = true;
      args.command = '--help';
    } else if (arg === '--deps') {
      args.command = '--deps';
    } else if (arg === '--format' && i + 1 < argv.length) {
      args.format = argv[++i];
    } else if (arg.startsWith('--format=')) {
      args.format = arg.split('=')[1];
    } else if (arg === '--interval' && i + 1 < argv.length) {
      args.interval = parseInt(argv[++i], 10);
    } else if (arg.startsWith('--') && !args.command) {
      args.command = arg;
    }
  }

  return args;
}

/**
 * Handle --deps command: render dependency tree.
 * @param {Object} args - Parsed CLI args
 */
async function handleDeps(args) {
  const source = new CodeIntelSource();
  const graphData = await source.getData();
  const isTTY = process.stdout.isTTY;
  const output = renderTree(graphData, { color: isTTY, unicode: isTTY });

  console.log(output);
}

/**
 * Handle --help command: show usage text.
 */
function handleHelp() {
  const usage = `
Usage: aios graph [command] [options]

Commands:
  --deps          Show dependency tree as ASCII text
  --help, -h      Show this help message

Options:
  --format=FORMAT Output format: ascii (default), json, dot, mermaid

Examples:
  aios graph --deps                 Show dependency tree
  aios graph --deps --format=json   Output as JSON
  aios graph --deps | grep helper   Search in dependency tree
`.trim();

  console.log(usage);
}

/**
 * Handle default summary view (placeholder, calls handleDeps for now).
 * @param {Object} args - Parsed CLI args
 */
async function handleSummary(args) {
  return handleDeps(args);
}

/**
 * Main CLI entry point.
 * @param {string[]} argv - Raw CLI arguments
 */
async function run(argv) {
  const args = parseArgs(argv);

  if (args.help) {
    handleHelp();
    return;
  }

  if (args.command === null) {
    return handleSummary(args);
  }

  const handler = COMMANDS[args.command];
  if (!handler) {
    console.error(`Unknown command: ${args.command}`);
    handleHelp();
    process.exit(1);
  }

  return handler(args);
}

module.exports = {
  run,
  parseArgs,
  handleDeps,
  handleHelp,
  handleSummary,
};
