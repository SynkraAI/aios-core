/**
 * Doctor Check: npm Packages
 *
 * Validates node_modules/ exists in project root (quick sanity check).
 *
 * @module aios-core/doctor/checks/npm-packages
 * @story INS-4.1
 */

const path = require('path');
const fs = require('fs');

const name = 'npm-packages';

async function run(context) {
  const nodeModulesPath = path.join(context.projectRoot, 'node_modules');

  if (fs.existsSync(nodeModulesPath)) {
    return {
      check: name,
      status: 'PASS',
      message: 'node_modules present',
      fixCommand: null,
    };
  }

  return {
    check: name,
    status: 'FAIL',
    message: 'node_modules not found',
    fixCommand: 'npm install',
  };
}

module.exports = { name, run };
