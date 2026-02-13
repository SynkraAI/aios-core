/**
 * AIOS Context - Set Epic
 *
 * Sets the epic (main context) for the current session.
 * Epic is the highest level of context and always remains visible.
 *
 * Usage:
 *   npx aios-core context set-epic "Baixar vídeos YouTube"
 *   npx aios-core context set-epic --clear
 */

const fs = require('fs');
const path = require('path');
const { updateTerminalTitle } = require('../../../../bin/utils/terminal-title.js');
const dashboardWriter = require('../../../infrastructure/scripts/dashboard-status-writer.js');

async function execute(args) {
  // Check for --clear flag
  const shouldClear = args.includes('--clear') || args.includes('-c');

  if (!shouldClear && args.length === 0) {
    console.error('❌ Error: Please provide an epic name');
    console.log('\nUsage:');
    console.log('  npx aios-core context set-epic "Epic Name"');
    console.log('  npx aios-core context set-epic --clear');
    process.exit(1);
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

  // Ensure context object exists
  session.context = session.context || {};

  // Update epic
  if (shouldClear) {
    delete session.context.epic;
    console.log('✓ Epic cleared');
  } else {
    const epic = args.filter(arg => !arg.startsWith('--')).join(' ');
    session.context.epic = epic;
    console.log(`✓ Epic set: ${epic}`);
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

  // Update dashboard status
  try {
    const context = session.context || {};
    await dashboardWriter.updateContext(context, projectRoot);
  } catch (error) {
    // Dashboard update is non-critical, just log
    console.warn('Warning: Failed to update dashboard status:', error.message);
  }

  if (!shouldClear) {
    console.log('\n💡 Tip: Use "npx aios-core context set-story" to add a story within this epic.');
  }
}

module.exports = { execute };
