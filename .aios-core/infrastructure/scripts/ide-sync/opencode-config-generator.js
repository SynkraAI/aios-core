/**
 * OpenCode Config Generator - Creates the opencode.json configuration file
 * @story 6.19 - IDE Command Auto-Sync System
 */

const fs = require('fs-extra');
const path = require('path');

/**
 * Generate opencode.json file
 * @param {string} projectRoot - Project root directory
 * @param {object} options - Generation options
 */
async function generateOpencodeConfig(projectRoot, options = {}) {
  const targetPath = path.join(projectRoot, 'opencode.json');

  let existingConfig = {};
  if (fs.existsSync(targetPath)) {
    try {
      existingConfig = await fs.readJson(targetPath);
    } catch (e) {
      console.warn('Warning: Could not parse existing opencode.json, creating new one.');
    }
  }

  // Framework-owned instructions
  const frameworkInstructions = ['.opencode/rules/opencode-rules.md', '.opencode/rules/AGENTS.md'];
  const existingInstructions = existingConfig.instructions || [];

  // Smart merge: preserve user instructions while ensuring framework ones exist
  const combinedInstructions = [...new Set([...frameworkInstructions, ...existingInstructions])];

  // Merge with existing config, preserving all user settings (MCPs, themes, etc.)
  const config = {
    ...existingConfig,
    $schema: 'https://opencode.ai/config.json',

    // Sync mandatory framework paths without erasing user custom paths
    agentPaths: [...new Set(['.opencode/agents', ...(existingConfig.agentPaths || [])])],
    commandPaths: [...new Set(['.opencode/commands', ...(existingConfig.commandPaths || [])])],

    instructions: combinedInstructions,

    // Simplification based on OpenCode permissive defaults (mantendo apenas o deny crítico)
    permission: {
      ...(existingConfig.permission || {}),
      bash: {
        ...(existingConfig.permission?.bash || {}),
        'rm -rf /': 'deny',
        'rm -rf /*': 'deny',
        'sudo rm -rf *': 'deny',
      },
    },
  };

  if (!options.dryRun) {
    await fs.writeJson(targetPath, config, { spaces: 2 });
  }

  return {
    path: targetPath,
    config,
  };
}

module.exports = {
  generateOpencodeConfig,
};
