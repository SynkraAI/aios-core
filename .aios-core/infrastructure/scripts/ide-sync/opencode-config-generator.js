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

  // Framework-owned sections (always synced)
  const frameworkConfig = {
    $schema: 'https://opencode.ai/config.json',
    agentPaths: ['.opencode/agents'],
    commandPaths: ['.opencode/commands'],
    instructions: ['.opencode/rules/opencode-rules.md', '.opencode/rules/AGENTS.md'],
  };

  // Merge with existing config, preserving user-defined sections if they exist
  const config = {
    ...frameworkConfig,
    // Preserve or use defaults for user-controlled sections
    permission: existingConfig.permission || {
      edit: 'allow',
      webfetch: 'allow',
      skill: 'allow',
      task: 'allow',
      bash: {
        'rm -rf /': 'deny',
        'rm -rf ~': 'deny',
        'rm -rf /*': 'deny',
        'sudo rm -rf *': 'deny',
        'mkfs *': 'deny',
        'dd if=/dev/zero *': 'deny',
        'chmod -R 777 /': 'deny',
        'git pull *': 'allow',
        '*': 'allow',
      },
    },
    mcp: existingConfig.mcp || {}, // Start empty if not defined, allowing user to set via OpenCode
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
