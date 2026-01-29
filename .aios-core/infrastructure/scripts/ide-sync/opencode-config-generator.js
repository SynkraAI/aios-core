/**
 * OpenCode Config Generator - Creates the opencode.json configuration file
 * @story 6.19 - IDE Command Auto-Sync System
 */

const fs = require('fs-extra');
const path = require('path');

/**
 * Map AIOS MCP identifiers to OpenCode commands
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
 */
async function generateOpencodeConfig(projectRoot, options = {}) {
  const targetPath = path.join(projectRoot, 'opencode.json');

  let existingConfig = {};
  if (fs.existsSync(targetPath)) {
    try {
      existingConfig = await fs.readJson(targetPath);
    } catch (e) {}
  }

  // 1. Build dynamic MCP section from installation options
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

  // 2. The Final Config - Purist implementation based on user design
  const config = {
    $schema: 'https://opencode.ai/config.json',
    agentPaths: ['.opencode/agents'],
    commandPaths: ['.opencode/commands'],
    instructions: [
      '.opencode/rules/opencode-rules.md',
      '.opencode/rules/AGENTS.md',
      '.opencode/rules/agent-*.md',
    ],
    permission: {
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
    mcp: mcpConfig,
  };

  // Preserve any other top-level user keys not managed by framework
  const finalConfig = { ...existingConfig, ...config };

  if (!options.dryRun) {
    await fs.writeJson(targetPath, finalConfig, { spaces: 2 });
  }

  return { path: targetPath, config: finalConfig };
}

module.exports = {
  generateOpencodeConfig,
};
