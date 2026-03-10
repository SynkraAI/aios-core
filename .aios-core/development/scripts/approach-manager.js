/**
 * AIOS Approach Manager
 * Decides between different coding approaches (Surgical, Refactor, Greenfield).
 */
module.exports = {
  decide: (task) => {
    if (task.includes('fix')) return 'surgical';
    if (task.includes('create')) return 'greenfield';
    return 'standard';
  }
};
