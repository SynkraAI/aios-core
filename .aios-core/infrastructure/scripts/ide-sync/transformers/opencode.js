const claudeTransformer = require('./claude-code');
const { translateContent } = require('../rule-porter');

/**
 * OpenCode Transformer - Structural Adaptation with Literal Body
 *
 * Format: OpenCode Frontmatter (Config) + Literal AIOS Content (Instructions)
 * Target: .opencode/agents/*.md
 */

/**
 * Transform agent data to OpenCode format
 * @param {object} agentData - Parsed agent data from agent-parser
 * @returns {string} - Transformed content
 */
function transform(agentData) {
  const agent = agentData.agent || {};
  const id = agentData.id || 'agent';

  // 1. OpenCode Frontmatter (Configuration only)
  let description = agent.whenToUse || agent.description || agent.title || '';

  // Strict mode: aios-master is the entry point (primary), others are specialized helpers (subagent)
  const mode = id === 'aios-master' ? 'primary' : 'subagent';

  let toolsStr = 'tools:\n  skill: true\n'; // Always enable skill tool for AIOS commands (*)
  if (
    agentData.dependencies &&
    agentData.dependencies.tools &&
    agentData.dependencies.tools.length > 0
  ) {
    for (const tool of agentData.dependencies.tools) {
      if (tool !== 'skill') {
        // Avoid duplication
        toolsStr += `  ${tool}: true\n`;
      }
    }
  }

  // Header with quotes for safety (robust format)
  let output = `---\n`;
  if (description) {
    output += `description: "${description.replace(/"/g, '\\"')}"\n`;
  } else {
    output += `description: "AIOS Agent - ${id}"\n`;
  }
  output += `mode: ${mode}\n`;
  if (toolsStr) output += toolsStr;
  output += `---\n\n`;

  // 2. Instructions (Inherited from Claude Code + Translated)
  // Instead of inventing content, we take exactly what Claude Code uses and translate it
  const claudeContent = claudeTransformer.transform(agentData);
  const translatedBody = translateContent(claudeContent);

  output += translatedBody;

  return output;
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
  format: 'full-markdown-yaml',
};
