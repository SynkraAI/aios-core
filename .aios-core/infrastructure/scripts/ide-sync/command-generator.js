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
/**
 * Generate slash command files for agent activation and skill execution
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

  // 1. Generate commands for Agent Activation (/dev, /qa, etc.)
  for (const agentData of agents) {
    const agentId = agentData.id;
    const agent = agentData.agent || {};

    const content = `---
description: "Ativar agente @${agentId} (${agent.title || agentId})"
agent: "${agentId}"
---

Ative o agente @${agentId} para processar sua solicitação: $ARGUMENTS

Instruções:
1. Carregar persona @${agentId}
2. Processar a solicitação: $ARGUMENTS
3. Manter o personagem conforme definido.

---
*AIOS Agent Command - Sincronizado para @${agentId}*
`;

    const filename = `${agentId}.md`;
    await fs.writeFile(path.join(targetDir, filename), content, 'utf8');
    generated.push(filename);
  }

  // 2. Generate commands for Skills (/create-story, /develop-story, etc.)
  if (options.skills && Array.isArray(options.skills)) {
    for (const skill of options.skills) {
      // Determine which agent should handle this skill based on original prefix
      let targetAgent = "aios-master"; // Default
      const prefixMatch = skill.originalName.match(/^(dev|po|sm|pm|qa|architect|analyst)-/);
      if (prefixMatch) {
        targetAgent = prefixMatch[1];
      }

      const content = `---
description: "${skill.description || 'Executar skill do AIOS'}"
agent: "${targetAgent}"
---

Execute a skill **${skill.name}** com os seguintes argumentos: $ARGUMENTS

Instruções:
1. Usar a ferramenta nativa \`skill\` para executar: \`*${skill.name}\`
2. Passar os argumentos: $ARGUMENTS
3. Permanecer como @${targetAgent} durante a execução.

---
*AIOS Skill Command - Sincronizado para /${skill.name}*
`;

      const filename = `${skill.name}.md`;
      await fs.writeFile(path.join(targetDir, filename), content, 'utf8');
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
