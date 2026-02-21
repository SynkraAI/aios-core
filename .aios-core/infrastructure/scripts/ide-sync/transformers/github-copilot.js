/**
 * GitHub Copilot Transformer - Converts AIOS agents to Copilot Custom Agents format
 * @story 6.19 - IDE Command Auto-Sync System
 *
 * Format: YAML frontmatter + markdown body
 * Target: .github/agents/*.agent.md
 * Spec: https://docs.github.com/en/copilot/reference/custom-agents-configuration
 */

/**
 * Transform agent data to GitHub Copilot Custom Agent format
 * @param {object} agentData - Parsed agent data from agent-parser
 * @returns {string} - Transformed content in Copilot .agent.md format
 */
function transform(agentData) {
  const agent = agentData.agent || {};
  const persona = agentData.persona_profile || {};

  const name = agent.name || agentData.id || 'agent';
  const title = agent.title || 'AIOS Agent';
  const icon = agent.icon || '🤖';
  const description = agent.whenToUse || `${title} agent for AIOS development workflows`;
  const filename = agentData.filename || `${agentData.id || 'unknown'}.md`;

  // Build YAML frontmatter (Copilot spec requires at minimum 'description')
  const frontmatter = [
    '---',
    `name: "${escapeYamlString(name)}"`,
    `description: "${escapeYamlString(description)}"`,
    '---',
  ].join('\n');

  // Build markdown body
  let body = `# ${icon} ${name} — ${title}\n\n`;
  body += `> ${description}\n\n`;

  // Add persona info if available
  if (persona.archetype) {
    body += `**Archetype:** ${persona.archetype}\n\n`;
  }

  // Add communication style
  if (persona.communication) {
    body += `**Tone:** ${persona.communication.tone || 'professional'}\n\n`;
  }

  // Add commands if available
  if (agentData.commands && agentData.commands.length > 0) {
    body += '## Commands\n\n';
    for (const cmd of agentData.commands) {
      const cmdName = typeof cmd === 'string' ? cmd : (cmd.name || String(cmd));
      const cmdDesc = typeof cmd === 'string' ? 'No description' : (cmd.description || 'No description');
      body += `- \`*${cmdName}\` — ${cmdDesc}\n`;
    }
    body += '\n';
  }

  // Add dependencies if available
  if (agentData.dependencies) {
    const deps = agentData.dependencies;
    const depTypes = ['tasks', 'templates', 'checklists'];
    const hasDeps = depTypes.some((t) => deps[t] && deps[t].length > 0);

    if (hasDeps) {
      body += '## Dependencies\n\n';
      for (const type of depTypes) {
        if (deps[type] && deps[type].length > 0) {
          body += `**${type.charAt(0).toUpperCase() + type.slice(1)}:** `;
          body += deps[type].map((d) => `\`${d}\``).join(', ');
          body += '\n\n';
        }
      }
    }
  }

  body += `---\n*AIOS Agent — Synced from .aios-core/development/agents/${filename}*\n`;

  return `${frontmatter}\n\n${body}`;
}

/**
 * Escape special characters for YAML string values
 * @param {string} str - String to escape
 * @returns {string} - Escaped string
 */
function escapeYamlString(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')  // Escape backslashes first
    .replace(/"/g, '\\"')     // Escape double quotes
    .replace(/\n/g, ' ');     // Replace newlines with spaces
}

/**
 * Get the target filename for this agent in Copilot format
 * @param {object} agentData - Parsed agent data
 * @returns {string} - Target filename with .agent.md extension
 */
function getFilename(agentData) {
  // Copilot requires .agent.md extension
  const filename = agentData.filename || `${agentData.id || 'unknown'}.md`;
  const baseName = filename.replace(/\.md$/, '');
  return `${baseName}.agent.md`;
}

module.exports = {
  transform,
  getFilename,
  format: 'copilot-agent-md',
};
