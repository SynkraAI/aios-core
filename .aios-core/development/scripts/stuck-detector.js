/**
 * AIOS Stuck Detector
 * Detects if an agent is repeating the same action or stuck in a loop.
 */
module.exports = {
  checkStuck: (history) => {
    const lastThree = history.slice(-3);
    if (lastThree.length < 3) return false;
    return lastThree.every(h => h.action === lastThree[0].action);
  },
  suggestFix: () => "Agent seems stuck. Switching strategy or requesting user hint."
};
