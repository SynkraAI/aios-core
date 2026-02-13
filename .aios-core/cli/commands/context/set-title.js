/**
 * AIOS Context - Set Display Title
 *
 * Locks a fixed display title for the terminal tab.
 * This title persists across the entire session and doesn't change
 * even when progress or phase updates.
 *
 * Usage:
 *   npx aios-core context set-title "Tim Ferris Mind Cloning"
 *   npx aios-core context set-title "Design Futurista" --emoji 🎨
 *   npx aios-core context set-title --clear  (removes locked title)
 */

const fs = require('fs');
const path = require('path');
const { updateTerminalTitle } = require('../../../../bin/utils/terminal-title.js');

async function execute(args) {
  if (args.length === 0) {
    console.error('❌ Error: Please provide a title');
    console.log('\nUsage:');
    console.log('  npx aios-core context set-title "Project Name"');
    console.log('  npx aios-core context set-title "Project Name" --emoji 🎨');
    console.log('  npx aios-core context set-title --clear');
    process.exit(1);
  }

  // Check for --clear flag
  const shouldClear = args.includes('--clear') || args.includes('-c');

  // Parse --emoji flag
  let emoji = null;
  const emojiIndex = args.findIndex(arg => arg === '--emoji' || arg === '-e');
  if (emojiIndex !== -1 && args[emojiIndex + 1]) {
    emoji = args[emojiIndex + 1];
  }

  // Get project root (current directory)
  const projectRoot = process.cwd();
  const stateFile = path.join(projectRoot, '.aios', 'session.json');

  // Check if session.json exists
  if (!fs.existsSync(stateFile)) {
    console.error('❌ Error: Not an AIOS project (no .aios/session.json found)');
    console.log('\nRun this command from an AIOS project directory.');
    process.exit(1);
  }

  // Read current session state
  let session;
  try {
    const content = fs.readFileSync(stateFile, 'utf8');
    session = JSON.parse(content);
  } catch (error) {
    console.error('❌ Error: Failed to read session state');
    console.error(error.message);
    process.exit(1);
  }

  // Update display title
  if (shouldClear) {
    // Clear locked title (remove fields)
    delete session.project.displayTitle;
    delete session.project.titleEmoji;
    console.log('✓ Display title unlocked');
    console.log('\nTitle will now update dynamically based on progress and phase.');
  } else {
    // Set locked title (filter out flags and emoji value)
    const title = args
      .filter((arg, idx) => {
        // Skip flags
        if (arg.startsWith('--')) return false;
        // Skip emoji value if it follows --emoji flag
        if (idx > 0 && (args[idx - 1] === '--emoji' || args[idx - 1] === '-e')) return false;
        return true;
      })
      .join(' ');

    if (!title) {
      console.error('❌ Error: Please provide a title');
      process.exit(1);
    }

    session.project.displayTitle = title;

    // Save emoji if provided
    if (emoji) {
      session.project.titleEmoji = emoji;
    } else {
      // Clear emoji if not provided
      delete session.project.titleEmoji;
    }

    console.log('✓ Display title locked:');
    if (emoji) {
      console.log(`  ${emoji} ${title}`);
    } else {
      console.log(`  ${title}`);
    }
    console.log('\nThis title will remain fixed until you clear it or change projects.');
  }

  // Update metadata
  session.metadata = session.metadata || {};
  session.metadata.lastUpdatedAt = new Date().toISOString();

  // Write updated state
  try {
    fs.writeFileSync(stateFile, JSON.stringify(session, null, 2), 'utf8');
  } catch (error) {
    console.error('❌ Error: Failed to save session state');
    console.error(error.message);
    process.exit(1);
  }

  // Update terminal title immediately
  updateTerminalTitle(session);

  if (!shouldClear) {
    console.log('\n💡 Tip: Use "npx aios-core context set-title --clear" to unlock the title.');
  }
}

module.exports = { execute };
