/**
 * Terminal Title Helper
 * ANSI escape sequences for updating terminal title in Node.js
 *
 * @module bin/utils/terminal-title
 */

/**
 * Update terminal title with session context
 * @param {Object} session - Session object from SessionStateManager
 */
function updateTerminalTitle(session) {
  if (!session || !session.project) {
    return;
  }

  const { project, status } = session;

  // Build title: {emoji} {name} [{progress}] {status_emoji} · {phase}
  let title = '';

  if (project.emoji) title += project.emoji + ' ';
  if (project.name) title += project.name;
  if (status?.progress) title += ` [${status.progress}]`;
  if (status?.emoji) title += ` ${status.emoji}`;
  if (status?.phase) title += ` · ${status.phase}`;

  // ANSI OSC 0 sequence: Set window + tab title
  // \x1b]0; = Start title sequence
  // \x07 = Bell (end of sequence)
  process.stdout.write(`\x1b]0;${title}\x07`);
}

/**
 * Clear terminal title (reset to default)
 */
function clearTerminalTitle() {
  // Reset to default (usually current directory)
  process.stdout.write('\x1b]0;\x07');
}

/**
 * Set custom terminal title
 * @param {string} title - Custom title string
 */
function setTerminalTitle(title) {
  process.stdout.write(`\x1b]0;${title}\x07`);
}

module.exports = {
  updateTerminalTitle,
  clearTerminalTitle,
  setTerminalTitle,
};
