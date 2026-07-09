/**
 * Doctor Check Registry
 *
 * Exports all 18 check modules in execution order.
 *
 * @module aiox-core/doctor/checks
 * @story INS-4.1, INS-4.8
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
const skillsCount = require('./skills-count');
const commandsCount = require('./commands-count');
const hooksClaudeCount = require('./hooks-claude-count');
const portDenylist = require('./port-denylist');
const windowsNpxInstall = require('./windows-npx-install');
const framework3wayDiff = require('./framework-3way-diff');

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
    skillsCount,
    commandsCount,
    hooksClaudeCount,
    portDenylist,
    windowsNpxInstall,
    framework3wayDiff,
  ];
}

module.exports = { loadChecks };
