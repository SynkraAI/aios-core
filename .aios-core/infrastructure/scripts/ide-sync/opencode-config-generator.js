/**
 * OpenCode Config Generator - Creates the opencode.json configuration file
 * @story 6.19 - IDE Command Auto-Sync System
 */

const fs = require('fs-extra');
const path = require('path');

/**
 * Map AIOS MCP identifiers to OpenCode commands
 * @param {string} mcpId - AIOS MCP ID
 * @returns {string[]} - Command array
 */
function getMcpCommand(mcpId) {
  const commands = {
    browser: ['npx', '-y', '@modelcontextprotocol/server-playwright'],
    context7: ['npx', '-y', '@synkra/mcp-context7'],
    exa: ['npx', '-y', '@modelcontextprotocol/server-exa'],
    'desktop-commander': ['npx', '-y', '@modelcontextprotocol/server-desktop-commander'],
  };
  return commands[mcpId] || ['npx', '-y', `@synkra/mcp-${mcpId}`];
}

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
  const frameworkInstructions = [
    '.opencode/rules/opencode-rules.md',
    '.opencode/rules/AGENTS.md',
    '.opencode/rules/agent-*.md',
  ];
  const existingInstructions = existingConfig.instructions || [];

  // Smart merge: preserve user instructions while ensuring framework ones exist
  const combinedInstructions = [...new Set([...frameworkInstructions, ...existingInstructions])];

  // Map selected MCPs from wizard if provided
  const mcpConfig = { ...(existingConfig.mcp || {}) };
  if (options.selectedMCPs && Array.isArray(options.selectedMCPs)) {
    for (const mcpId of options.selectedMCPs) {
      if (!mcpConfig[mcpId]) {
        mcpConfig[mcpId] = {
          type: 'local',
          command: getMcpCommand(mcpId),
          enabled: true,
        };
      }
    }
  }

  // Build the minimalist but robust permissions object
  // We only specify Bash protections. Other tools (skill, task, read, etc.)
  // use OpenCode's permissive defaults (allow) unless the user overrides them.
  const permissionConfig = {
    ...(existingConfig.permission || {}),
    bash: {
      // Core protections (Framework safety layer)
      'rm -rf /': 'deny',
      'rm -rf ~': 'deny',
      'rm -rf /*': 'deny',
      'sudo rm -rf *': 'deny',
      'mkfs *': 'deny',
      'dd if=/dev/zero *': 'deny',
      'chmod -R 777 /': 'deny',

      // Merge with user's existing bash permissions if any
      ...(existingConfig.permission?.bash || {}),

      // Explicit automation bypasses for AIOS workflows
      'git pull *': 'allow',

      // Default autonomy
      '*': 'allow',
    },
  };

  // Merge with existing config, preserving all user settings (MCPs, themes, etc.)
  const config = {
    ...existingConfig,
    $schema: 'https://opencode.ai/config.json',

    // Infrastructure paths
    agentPaths: [...new Set(['.opencode/agents', ...(existingConfig.agentPaths || [])])],
    commandPaths: [...new Set(['.opencode/commands', ...(existingConfig.commandPaths || [])])],

    instructions: combinedInstructions,
    permission: permissionConfig,
    mcp: mcpConfig,
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
