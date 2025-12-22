/**
 * Trae Transformer - Project rules format
 * @story 6.19 - IDE Command Auto-Sync System
 *
 * Format: Structured project rules with identity, core commands, all commands
 * Target: .trae/rules/agents/*.md
 */

const { getVisibleCommands } = require('../agent-parser');

/**
 * Transform agent data to Trae format
 * @param {object} agentData - Parsed agent data from agent-parser
 * @returns {string} - Transformed content
 */
function transform(agentData) {
  const agent = agentData.agent || {};
  const persona = agentData.persona_profile || {};

  const icon = agent.icon || '🤖';
  const name = agent.name || agentData.id;
  const title = agent.title || 'AIOS Agent';
  const whenToUse = agent.whenToUse || 'Use this agent for specific tasks';
  const archetype = persona.archetype || '';

  // Get commands by visibility
  const allCommands = agentData.commands || [];
  const keyCommands = getVisibleCommands(allCommands, 'key');
  const quickCommands = getVisibleCommands(allCommands, 'quick');

  // Build content in project rules format
  let content = `# AIOS Agent: ${name}

## Identity

| Property | Value |
|----------|-------|
| ID | @${agentData.id} |
| Name | ${name} |
| Title | ${title} |
| Icon | ${icon} |
${archetype ? `| Archetype | ${archetype} |\n` : ''}

## When to Use

${whenToUse}

`;

  // Core commands (key visibility)
  if (keyCommands.length > 0) {
    content += `## Core Commands

| Command | Description |
|---------|-------------|
`;
    for (const cmd of keyCommands) {
      content += `| \`*${cmd.name}\` | ${cmd.description || '-'} |\n`;
    }
    content += '\n';
  }

  // Quick commands
  if (quickCommands.length > 0) {
    content += `## Quick Reference

`;
    for (const cmd of quickCommands) {
      content += `- \`*${cmd.name}\` - ${cmd.description || 'No description'}\n`;
    }
    content += '\n';
  }

  // All commands
  if (allCommands.length > 0) {
    content += `## All Commands

`;
    for (const cmd of allCommands) {
      content += `- \`*${cmd.name}\` - ${cmd.description || 'No description'}\n`;
    }
    content += '\n';
  }

  // Dependencies
  if (agentData.dependencies) {
    const deps = agentData.dependencies;
    content += `## Dependencies

`;
    if (deps.tasks && deps.tasks.length > 0) {
      content += `### Tasks
${deps.tasks.map(t => `- ${t}`).join('\n')}

`;
    }
    if (deps.tools && deps.tools.length > 0) {
      content += `### Tools
${deps.tools.map(t => `- ${t}`).join('\n')}

`;
    }
  }

  content += `---
*AIOS Agent - Synced from .aios-core/development/agents/${agentData.filename}*
`;

  return content;
}

/**
 * Get the target filename for this agent
 * @param {object} agentData - Parsed agent data
 * @returns {string} - Target filename
 */
function getFilename(agentData) {
  return agentData.filename;
}

module.exports = {
  transform,
  getFilename,
  format: 'project-rules',
};
