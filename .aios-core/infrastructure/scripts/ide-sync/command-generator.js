/**
 * Command Generator - Converts AIOS agent commands to OpenCode slash commands
 * @story 6.19 - IDE Command Auto-Sync System
 */

const fs = require('fs-extra');
const path = require('path');
const { translateContent } = require('./rule-porter');

/**
 * Generate slash command files for each agent command
 * @param {string} projectRoot - Project root directory
 * @param {object[]} agents - List of parsed agents
 * @param {object} options - Generation options
 */
async function generateSlashCommands(projectRoot, agents, options = {}) {
  const targetDir = path.join(projectRoot, '.opencode', 'commands');
  await fs.ensureDir(targetDir);

  const generated = [];
  const commandMap = new Map();

  // 1. Generate slash commands for Agents (match Claude Code behavior: /dev, /qa, etc.)
  for (const agentData of agents) {
    const agentId = agentData.id;
    const agent = agentData.agent || {};

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
    commandMap.set(agentId, true);
  }

  // 2. Generate slash commands for Agent Commands (*help, *develop, etc.)
  for (const agentData of agents) {
    const agentId = agentData.id;
    const commands = agentData.commands || [];

    if (!Array.isArray(commands)) continue;

    for (const cmd of commands) {
      const cmdName = cmd.name;
      const description = cmd.description || `Execute ${cmdName} command`;

      // Handle naming conflicts by namespacing
      // If multiple agents have 'help', we get 'help' (first one) then 'dev-help', etc.
      let finalName = cmdName;
      if (commandMap.has(cmdName)) {
        finalName = `${agentId}-${cmdName}`;
      }
      commandMap.set(finalName, true);

      let content = `---
description: "${description.replace(/"/g, '\\"')}"
agent: "${agentId}"
---

Invoke the @${agentId} agent to execute the *${cmdName} command with the following context: $ARGUMENTS

Instructions:
1. Load @${agentId}
2. Execute \`*${cmdName} $ARGUMENTS\`
3. Follow the agent's specialized workflow for this task.

---
*AIOS Slash Command - Synced from @${agentId}*
`;

      // Translate content
      content = translateContent(content);

      const filename = `${finalName}.md`;
      const targetPath = path.join(targetDir, filename);

      if (!options.dryRun) {
        await fs.writeFile(targetPath, content, 'utf8');
      }

      generated.push(filename);
    }
  }

  return {
    dir: targetDir,
    files: generated,
  };
}

module.exports = {
  generateSlashCommands,
};
