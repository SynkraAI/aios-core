/**
 * Windsurf Transformer - XML-tagged markdown sections
 * @story 6.19 - IDE Command Auto-Sync System
 *
 * Format: Markdown with XML tags for agent sections
 * Target: .windsurf/rules/agents/*.md
 */

const { getVisibleCommands } = require('../agent-parser');

/**
 * Transform agent data to Windsurf format
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

  // Get all commands
  const allCommands = agentData.commands || [];
  const quickCommands = getVisibleCommands(allCommands, 'quick');

  // Build content with XML tags
  let content = `# ${name} Agent

<agent-identity>
${icon} **${name}** - ${title}
ID: @${agentData.id}
${archetype ? `Archetype: ${archetype}` : ''}
</agent-identity>

<when-to-use>
${whenToUse}
</when-to-use>

`;

  // Add commands section with XML tags
  if (allCommands.length > 0) {
    content += `<commands>
`;
    for (const cmd of allCommands) {
      const isQuick = quickCommands.some(q => q.name === cmd.name);
      content += `- *${cmd.name}: ${cmd.description || 'No description'}${isQuick ? ' (quick)' : ''}\n`;
    }
    content += `</commands>

`;
  }

  // Add collaboration section if available
  if (agentData.sections.collaboration) {
    content += `<collaboration>
${agentData.sections.collaboration}
</collaboration>

`;
  }

  // Add dependencies if available
  if (agentData.dependencies) {
    const deps = agentData.dependencies;
    content += `<dependencies>
`;
    if (deps.tasks && deps.tasks.length > 0) {
      content += `Tasks: ${deps.tasks.join(', ')}\n`;
    }
    if (deps.checklists && deps.checklists.length > 0) {
      content += `Checklists: ${deps.checklists.join(', ')}\n`;
    }
    if (deps.tools && deps.tools.length > 0) {
      content += `Tools: ${deps.tools.join(', ')}\n`;
    }
    content += `</dependencies>

`;
  }

  content += `---
*Synced from .aios-core/development/agents/${agentData.filename}*
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
  format: 'xml-tagged-markdown',
};
