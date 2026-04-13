/**
 * AIOS Context - Set Task
 *
 * Sets the task (momentary context) for the current session.
 * Task appears at the end of the hierarchy and can be cleared frequently.
 *
 * Usage:
 *   npx aios-core context set-task "Commit GitHub"
 *   npx aios-core context set-task --clear
 */

const fs = require('fs');
const path = require('path');
const dashboardWriter = require('../../../infrastructure/scripts/dashboard-status-writer.js');

async function execute(args) {
  // Check for --clear flag
  const shouldClear = args.includes('--clear') || args.includes('-c');

  if (!shouldClear && args.length === 0) {
    console.error('❌ Error: Please provide a task name');
    console.log('\nUsage:');
    console.log('  npx aios-core context set-task "Task Name"');
    console.log('  npx aios-core context set-task --clear');
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

  // Update task
  if (shouldClear) {
    delete session.context.task;
    console.log('✓ Task cleared');
  } else {
    const task = args.filter(arg => !arg.startsWith('--')).join(' ');
    session.context.task = task;
    console.log(`✓ Task set: ${task}`);
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
    console.log('\n💡 Tip: Use "npx aios-core context set-task --clear" when task is done.');
  }
}

module.exports = { execute };
