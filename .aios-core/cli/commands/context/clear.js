/**
 * Context Clear Command
 * Reset session context to defaults
 *
 * Usage: aios context clear [--archive]
 *
 * @module cli/commands/context/clear
 */

const SessionStateManager = require('../../../core/session/state-manager');
const { clearTerminalTitle } = require('../../../../bin/utils/terminal-title');
const path = require('path');

async function execute(args) {
  const shouldArchive = args.includes('--archive');

  try {
    const manager = SessionStateManager;

    // Get current session for archive filename
    const currentSession = await manager.read();

    // Clear (which archives automatically if session has data)
    await manager.clear();

    // Clear terminal title
    clearTerminalTitle();

    // Show confirmation
    console.log('✓ Context cleared');

    // If session was archived, show path
    if (shouldArchive && currentSession.project.name) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const archivePath = path.join('.aios', 'sessions', 'history', `session-${timestamp}.json`);
      console.log(`  Session archived to: ${archivePath}`);
    }
  } catch (error) {
    console.error(`Error clearing context: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { execute };
