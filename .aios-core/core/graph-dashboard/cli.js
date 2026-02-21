'use strict';

const { CodeIntelSource } = require('./data-sources/code-intel-source');
const { RegistrySource } = require('./data-sources/registry-source');
const { MetricsSource } = require('./data-sources/metrics-source');
const { renderTree } = require('./renderers/tree-renderer');
const { renderStats } = require('./renderers/stats-renderer');
const { renderStatus } = require('./renderers/status-renderer');
const { formatAsJson } = require('./formatters/json-formatter');
const { formatAsDot } = require('./formatters/dot-formatter');
const { formatAsMermaid } = require('./formatters/mermaid-formatter');

const MAX_SUMMARY_PER_CATEGORY = 5;

const FORMAT_MAP = {
  json: formatAsJson,
  dot: formatAsDot,
  mermaid: formatAsMermaid,
};

const VALID_FORMATS = ['ascii', ...Object.keys(FORMAT_MAP)];

const COMMANDS = {
  '--deps': handleDeps,
  '--stats': handleStats,
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
    } else if (arg === '--stats') {
      args.command = '--stats';
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
 * Handle --deps command: render dependency tree or formatted output.
 * @param {Object} args - Parsed CLI args
 */
async function handleDeps(args) {
  const format = args.format || 'ascii';

  if (format !== 'ascii' && !FORMAT_MAP[format]) {
    console.error(`Unknown format: ${format}. Valid formats: ${VALID_FORMATS.join(', ')}`);
    process.exit(1);
  }

  const source = new CodeIntelSource();
  const graphData = await source.getData();

  if (format !== 'ascii') {
    const formatter = FORMAT_MAP[format];
    process.stdout.write(formatter(graphData) + '\n');
    return;
  }

  const isTTY = process.stdout.isTTY;
  const output = renderTree(graphData, { color: isTTY, unicode: isTTY });
  console.log(output);
}

/**
 * Handle --stats command: render entity statistics and cache metrics.
 * @param {Object} args - Parsed CLI args
 */
async function handleStats(_args) {
  const registrySource = new RegistrySource();
  const metricsSource = new MetricsSource();
  const [registryData, metricsData] = await Promise.all([
    registrySource.getData(),
    metricsSource.getData(),
  ]);
  const isTTY = process.stdout.isTTY;
  const output = renderStats(registryData, metricsData, { isTTY: !!isTTY });

  process.stdout.write(output + '\n');
}

/**
 * Handle --help command: show usage text.
 */
function handleHelp() {
  const usage = `
Usage: aios graph [command] [options]

Commands:
  --deps          Show dependency tree as ASCII text
  --stats         Show entity statistics and cache metrics
  --help, -h      Show this help message

Options:
  --format=FORMAT Output format: ascii (default), json, dot, mermaid

Examples:
  aios graph --deps                 Show dependency tree
  aios graph --deps --format=json   Output as JSON
  aios graph --stats                Show entity stats and cache metrics
  aios graph --stats | head -10     Pipe-friendly stats output
`.trim();

  console.log(usage);
}

/**
 * Handle default summary view: dependency tree (compact) + stats + provider status.
 * @param {Object} args - Parsed CLI args
 */
async function handleSummary(args) {
  const codeIntelSource = new CodeIntelSource();
  const registrySource = new RegistrySource();
  const metricsSource = new MetricsSource();

  const [graphData, registryData, metricsData] = await Promise.all([
    codeIntelSource.getData(),
    registrySource.getData(),
    metricsSource.getData(),
  ]);

  const isTTY = !!process.stdout.isTTY;
  const sections = [];

  sections.push('AIOS Graph Dashboard');
  sections.push(isTTY ? '\u2550'.repeat(35) : '='.repeat(35));
  sections.push('');

  const treeOutput = renderTree(graphData, {
    color: isTTY,
    unicode: isTTY,
    maxPerCategory: MAX_SUMMARY_PER_CATEGORY,
  });
  sections.push(treeOutput);
  sections.push('');

  const statsOutput = renderStats(registryData, metricsData, { isTTY });
  sections.push(statsOutput);
  sections.push('');

  const statusOutput = renderStatus(metricsData, { isTTY });
  sections.push(statusOutput);

  process.stdout.write(sections.join('\n') + '\n');
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
  handleStats,
  handleHelp,
  handleSummary,
  MAX_SUMMARY_PER_CATEGORY,
  FORMAT_MAP,
  VALID_FORMATS,
};
