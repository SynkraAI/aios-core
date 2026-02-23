/**
 * Doctor Check Registry
 *
 * Exports all 12 check modules in execution order.
 *
 * @module aios-core/doctor/checks
 * @story INS-4.1
 */

const settingsJson = require('./settings-json');
const rulesFiles = require('./rules-files');
const agentMemory = require('./agent-memory');
const entityRegistry = require('./entity-registry');
const gitHooks = require('./git-hooks');
const coreConfig = require('./core-config');
const claudeMd = require('./claude-md');
const ideSync = require('./ide-sync');
const graphDashboard = require('./graph-dashboard');
const codeIntel = require('./code-intel');
const nodeVersion = require('./node-version');
const npmPackages = require('./npm-packages');

function loadChecks() {
  return [
    settingsJson,
    rulesFiles,
    agentMemory,
    entityRegistry,
    gitHooks,
    coreConfig,
    claudeMd,
    ideSync,
    graphDashboard,
    codeIntel,
    nodeVersion,
    npmPackages,
  ];
}

module.exports = { loadChecks };
