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

  // Pure Translation Logic: Only framework paths, instructions, and critical terminal safety
  // All other permissions (read, edit, skill, task, etc.) rely on IDE defaults or user global config
  const config = {
    ...existingConfig,
    $schema: 'https://opencode.ai/config.json',

    // Essential Infrastructure
    agentPaths: [...new Set(['.opencode/agents', ...(existingConfig.agentPaths || [])])],
    commandPaths: [...new Set(['.opencode/commands', ...(existingConfig.commandPaths || [])])],
    instructions: combinedInstructions,

    // Minimalist Permission Block (Safety + Terminal Autonomy only)
    permission: {
      ...existingConfig.permission,
      bash: {
        // Critical Denies (Framework Safety Guardrails)
        'rm -rf /': 'deny',
        'rm -rf ~': 'deny',
        'rm -rf /*': 'deny',
        'sudo rm -rf *': 'deny',
        'mkfs *': 'deny',
        'dd if=/dev/zero *': 'deny',
        'chmod -R 777 /': 'deny',

        // Explicit user preference for automation (if not already restricted)
        'git pull *': 'allow',
        '*': 'allow',

        // Preserve any other user-defined bash permissions
        ...(existingConfig.permission?.bash || {}),
      },
    },

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
