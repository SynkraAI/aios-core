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

    // Permissions with high-precedence for safety and fluid operation
    permission: {
      ...existingConfig.permission,
      bash: {
        // Core protections (Deny always wins)
        'rm -rf /': 'deny',
        'rm -rf ~': 'deny',
        'rm -rf /*': 'deny',
        'sudo rm -rf *': 'deny',
        'mkfs *': 'deny',
        'dd if=/dev/zero *': 'deny',
        'chmod -R 777 /': 'deny',

        // Inherit user's existing bash permissions
        ...(existingConfig.permission?.bash || {}),

        // Explicit bypasses for automation
        'git pull *': 'allow',

        // Default catch-all (OpenCode is permissive, but we make it explicit here)
        '*': 'allow',
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
