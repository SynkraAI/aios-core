/**
 * Command Generator - Converts AIOS agent activation to OpenCode slash commands
 * @story 6.19 - IDE Command Auto-Sync System
 */

const fs = require('fs-extra');
const path = require('path');
const { translateContent } = require('./rule-porter');

/**
 * Generate slash command files for agent activation
 * @param {string} projectRoot - Project root directory
 * @param {object[]} agents - List of parsed agents
 * @param {object} options - Generation options
 */
async function generateSlashCommands(projectRoot, agents, options = {}) {
  const { getIDEConfig } = require('../../../../src/config/ide-configs');
  const opencodeConfig = getIDEConfig('opencode');
  const targetDir = opencodeConfig?.commandFolder
    ? path.join(projectRoot, opencodeConfig.commandFolder)
    : path.join(projectRoot, '.opencode', 'commands');

  await fs.ensureDir(targetDir);

  const generated = [];

  // Generate slash commands ONLY for Agent Activation (match Claude Code behavior: /dev, /qa, etc.)
  for (const agentData of agents) {
    const agentId = agentData.id;
    const agent = agentData.agent || {};

    // We only create commands for top-level agents, matching the expected /name syntax
    const content = `---
description: "Activate the @${agentId} (${agent.title || agentId}) agent"
agent: "${agentId}"
---

Invoke the @${agentId} agent to handle your request: $ARGUMENTS

Instructions:
1. Load @${agentId}
2. Process the request: $ARGUMENTS
3. Stay in character as defined by the agent's persona.

---
*AIOS Agent Command - Synced for @${agentId}*
`;

    const filename = `${agentId}.md`;
    const targetPath = path.join(targetDir, filename);

    if (!options.dryRun) {
      await fs.writeFile(targetPath, content, 'utf8');
    }

    generated.push(filename);
  }

  return {
    dir: targetDir,
    files: generated,
  };
}

module.exports = {
  generateSlashCommands,
};
