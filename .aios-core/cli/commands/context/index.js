/**
 * Context Command Router
 * Routes aios context subcommands to appropriate handlers
 *
 * @module cli/commands/context
 */

const set = require('./set');
const show = require('./show');
const clear = require('./clear');
const auto = require('./auto');

async function run(args) {
  const subcommand = args[3] || 'show'; // Default to 'show'

  switch (subcommand) {
    case 'set':
      await set.execute(args.slice(4));
      break;
    case 'show':
      await show.execute(args.slice(4));
      break;
    case 'clear':
      await clear.execute(args.slice(4));
      break;
    case 'auto':
      await auto.execute(args.slice(4));
      break;
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
    default:
      console.error(`Unknown subcommand: ${subcommand}`);
      console.log('Run "aios context help" for usage');
      process.exit(1);
  }
}

function showHelp() {
  console.log(`
Usage: aios context <command> [options]

Commands:
  set <name>    Set context manually
  show          Display current context (default)
  clear         Reset context
  auto          Auto-detect context from project

Options for 'set':
  --emoji <emoji>       Project emoji
  --type <type>         Project type (framework/squad/app/tool/design-system)
  --status <emoji>      Status emoji
  --phase <phase>       Work phase
  --progress <n/m>      Progress (e.g., "2/5")
  --agent <agent>       Active agent
  --story <story>       Story ID

Options for 'show':
  --json                Output as JSON

Options for 'clear':
  --archive             Archive session before clearing

Options for 'auto':
  --dry-run             Show detection without applying

Examples:
  aios context set "aios-core" --emoji 🏗️ --progress 2/5
  aios context show
  aios context show --json
  aios context clear --archive
  aios context auto
  aios context auto --dry-run
  `);
}

module.exports = { run };
