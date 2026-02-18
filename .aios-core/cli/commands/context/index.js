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
const setTitle = require('./set-title');
const setEpic = require('./set-epic');
const setStory = require('./set-story');
const setTask = require('./set-task');

async function run(args) {
  const subcommand = args[3] || 'show'; // Default to 'show'

  switch (subcommand) {
    case 'set':
      await set.execute(args.slice(4));
      break;
    case 'set-title':
      await setTitle.execute(args.slice(4));
      break;
    case 'set-epic':
      await setEpic.execute(args.slice(4));
      break;
    case 'set-story':
      await setStory.execute(args.slice(4));
      break;
    case 'set-task':
      await setTask.execute(args.slice(4));
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
  set <name>            Set context manually
  set-title <title>     Lock a fixed display title
  set-epic <epic>       Set epic (main context - always visible)
  set-story <story>     Set story (mid-level context)
  set-task <task>       Set task (momentary context)
  show                  Display current context (default)
  clear                 Reset context
  auto                  Auto-detect context from project

Options for 'set':
  --emoji <emoji>       Project emoji
  --type <type>         Project type (framework/squad/app/tool/design-system)
  --status <emoji>      Status emoji
  --phase <phase>       Work phase
  --progress <n/m>      Progress (e.g., "2/5")
  --agent <agent>       Active agent
  --story <story>       Story ID

Options for 'set-title':
  --emoji <emoji>       Title emoji (shown in tab)
  --clear               Remove locked title (restore dynamic title)

Options for 'set-epic', 'set-story', 'set-task':
  --clear               Clear the epic/story/task

Options for 'show':
  --json                Output as JSON

Options for 'clear':
  --archive             Archive session before clearing

Options for 'auto':
  --dry-run             Show detection without applying

Examples:
  aios context set "aios-core" --emoji 🏗️ --progress 2/5
  aios context set-title "Tim Ferris Mind Cloning"
  aios context set-title "Design Futurista" --emoji 🎨
  aios context set-title --clear
  aios context set-epic "Baixar vídeos YouTube"
  aios context set-story "Implementar playlist"
  aios context set-task "Commit GitHub"
  aios context set-task --clear
  aios context show
  aios context show --json
  aios context clear --archive
  aios context auto
  aios context auto --dry-run
  `);
}

module.exports = { run };
