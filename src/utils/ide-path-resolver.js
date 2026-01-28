/**
 * IDE Path Resolver
 *
 * Provides a unified way to resolve configuration paths based on the active IDE.
 * Helps decouple scripts from hardcoded .claude or .opencode paths.
 */

const fs = require('fs-extra');
const path = require('path');

/**
 * Detects the active IDE based on environment variables or project files
 * @param {string} projectRoot - Root directory of the project
 * @returns {string} 'opencode', 'claude-code', or 'unknown'
 */
function detectActiveIDE(projectRoot = process.cwd()) {
  // Check environment variable first (highest priority)
  if (process.env.AIOS_IDE) {
    return process.env.AIOS_IDE;
  }

  // Check for OpenCode specific files
  if (fs.existsSync(path.join(projectRoot, 'opencode.json')) || fs.existsSync(path.join(projectRoot, '.opencode'))) {
    return 'opencode';
  }
  
  // Check for Claude Code specific files
  if (fs.existsSync(path.join(projectRoot, '.claude'))) {
    return 'claude-code';
  }
  
  return 'unknown';
}
  if (fs.existsSync(path.join(projectRoot, '.claude'))) {
    return 'claude-code';
  }
  return 'unknown';
}

/**
 * Gets the configuration directory for the active IDE
 * @param {string} ide - Active IDE key
 * @returns {Object} Directory structure
 */
function getIDEPaths(ide) {
  const isOpenCode = ide === 'opencode';

  return {
    root: isOpenCode ? '.opencode' : '.claude',
    agents: isOpenCode
      ? path.join('.opencode', 'agents')
      : path.join('.claude', 'commands', 'AIOS', 'agents'),
    rules: isOpenCode ? path.join('.opencode', 'rules') : path.join('.claude', 'rules'),
    skills: isOpenCode
      ? path.join('.opencode', 'skills')
      : path.join('.claude', 'commands', 'AIOS', 'tasks'),
    mainConfig: isOpenCode ? 'AGENTS.md' : 'CLAUDE.md',
    identity: isOpenCode ? 'OpenCode' : 'Claude Code',
  };
}

module.exports = {
  detectActiveIDE,
  getIDEPaths,
};
