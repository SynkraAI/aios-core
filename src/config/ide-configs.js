/**
 * IDE Configuration Metadata
 *
 * Story 1.4: IDE Selection
 * Defines supported IDEs with their config file paths and template information
 *
 * @module config/ide-configs
 */

const path = require('path');

/**
 * IDE Configuration Metadata
 * Maps IDE identifiers to their configuration requirements
 *
 * @typedef {Object} IDEConfig
 * @property {string} name - Display name of the IDE
 * @property {string} description - Brief description for selection prompt
 * @property {string} configFile - Relative path to config file from project root
 * @property {string} template - Path to template file
 * @property {boolean} requiresDirectory - Whether config file needs a directory created
 * @property {string} format - Config file format: 'text', 'json', or 'yaml'
 */

/**
 * IDE Configuration Metadata
 *
 * Synkra AIOS v2.1 supports 6 main IDEs:
 * - Claude Code (Anthropic's official CLI) - Recommended
 * - Cursor (AI-first code editor)
 * - Windsurf (AI-powered development)
 * - Gemini CLI (Google's AI assistant)
 * - GitHub Copilot (GitHub's AI pair programmer)
 * - AntiGravity (Google agentic platform)
 */
const IDE_CONFIGS = {
  'claude-code': {
    name: 'Claude Code',
    description: '', // Simplified - no description needed
    configFile: path.join('.claude', 'CLAUDE.md'),
    template: 'ide-rules/claude-rules.md',
    requiresDirectory: true,
    format: 'text',
    recommended: true,
    agentFolder: path.join('.claude', 'commands', 'AIOS', 'agents'),
  },
  cursor: {
    name: 'Cursor',
    description: '',
    configFile: path.join('.cursor', 'rules.md'),
    template: 'ide-rules/cursor-rules.md',
    requiresDirectory: true,
    format: 'text',
    agentFolder: path.join('.cursor', 'rules'),
  },
  windsurf: {
    name: 'Windsurf',
    description: '',
    configFile: '.windsurfrules',
    template: 'ide-rules/windsurf-rules.md',
    requiresDirectory: false,
    format: 'text',
    agentFolder: path.join('.windsurf', 'rules'),
  },
  'gemini-cli': {
    name: 'Gemini CLI',
    description: '',
    configFile: path.join('.gemini', 'rules.md'),
    template: 'ide-rules/gemini-rules.md',
    requiresDirectory: true,
    format: 'text',
    agentFolder: path.join('.gemini', 'agents'),
  },
  'github-copilot': {
    name: 'GitHub Copilot',
    description: '',
    configFile: path.join('.github', 'copilot-instructions.md'),
    template: 'ide-rules/copilot-rules.md',
    requiresDirectory: true,
    format: 'text',
    agentFolder: path.join('.github', 'agents'),
  },
  antigravity: {
    name: 'AntiGravity',
    description: '',
    configFile: path.join('.antigravity', 'rules.md'),
    template: 'ide-rules/antigravity-rules.md',
    requiresDirectory: true,
    format: 'text',
    agentFolder: path.join('.agent', 'workflows'),
    specialConfig: {
      type: 'antigravity',
      configJsonPath: path.join('.antigravity', 'antigravity.json'),
      workflowsFolder: path.join('.agent', 'workflows'),
      agentsFolder: path.join('.antigravity', 'agents'),
    },
  },
};

/**
 * Get all IDE keys
 * @returns {string[]} Array of IDE identifiers
 */
function getIDEKeys() {
  return Object.keys(IDE_CONFIGS);
}

/**
 * Get IDE config by key
 * @param {string} ideKey - IDE identifier
 * @returns {IDEConfig|null} IDE config object or null if not found
 */
function getIDEConfig(ideKey) {
  return IDE_CONFIGS[ideKey] || null;
}

/**
 * Validate IDE key exists
 * @param {string} ideKey - IDE identifier to validate
 * @returns {boolean} True if IDE exists
 */
function isValidIDE(ideKey) {
  return ideKey in IDE_CONFIGS;
}

/**
 * Get formatted choices for inquirer prompt
 * @returns {Array<{name: string, value: string, checked?: boolean}>} Inquirer-compatible choices
 */
function getIDEChoices() {
  const { colors } = require('../utils/aios-colors');

  return getIDEKeys().map((key) => {
    const config = IDE_CONFIGS[key];
    const isRecommended = config.recommended === true;

    // Simplified format: just "IDE Name" with optional (Recommended) tag
    let displayName = config.name;
    if (isRecommended) {
      displayName = colors.highlight(config.name) + colors.success(' (Recommended)');
    }

    return {
      name: displayName,
      value: key,
      checked: isRecommended,
    };
  });
}

module.exports = {
  IDE_CONFIGS,
  getIDEKeys,
  getIDEConfig,
  isValidIDE,
  getIDEChoices,
};
