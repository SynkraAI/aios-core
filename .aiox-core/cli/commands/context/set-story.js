/**
 * AIOS Context - Set Story
 *
 * Sets the story (mid-level context) for the current session.
 * Story appears after epic in the hierarchy.
 *
 * Usage:
 *   npx aios-core context set-story "Implementar playlist"
 *   npx aios-core context set-story --clear
 */

const fs = require('fs');
const path = require('path');
const dashboardWriter = require('../../../infrastructure/scripts/dashboard-status-writer.js');

async function execute(args) {
  // Check for --clear flag
  const shouldClear = args.includes('--clear') || args.includes('-c');

  if (!shouldClear && args.length === 0) {
    console.error('❌ Error: Please provide a story name');
    console.log('\nUsage:');
    console.log('  npx aios-core context set-story "Story Name"');
    console.log('  npx aios-core context set-story --clear');
    process.exit(1);
  }

  // Get project root (current directory)
  const projectRoot = process.cwd();
  const stateFile = path.join(projectRoot, '.aios', 'session.json');

  // Check if session.json exists
  if (!fs.existsSync(stateFile)) {
    console.error('❌ Error: Not an AIOS project (no .aiox/session.json found)');
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

  // Update story
  if (shouldClear) {
    delete session.context.story;
    console.log('✓ Story cleared');
  } else {
    const story = args.filter(arg => !arg.startsWith('--')).join(' ');
    session.context.story = story;
    console.log(`✓ Story set: ${story}`);
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


  // Update dashboard status
  try {
    const context = session.context || {};
    await dashboardWriter.updateContext(context, projectRoot);
  } catch (error) {
    // Dashboard update is non-critical, just log
    console.warn('Warning: Failed to update dashboard status:', error.message);
  }

  if (!shouldClear) {
    console.log('\n💡 Tip: Use "npx aios-core context set-task" for momentary tasks.');
  }
}

module.exports = { execute };
