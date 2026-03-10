/**
 * AIOS Recovery Tracker
 * Tracks command failures and suggests recovery paths.
 */
module.exports = {
  logFailure: (cmd, error) => {
    console.log(`[RECOVERY] Command ${cmd} failed: ${error}`);
    return { status: 'logged', action: 'retry-with-context' };
  }
};
