/**
 * OpenCode Transformer - Standard Markdown with Frontmatter
 *
 * Format: Markdown file with specific Frontmatter for OpenCode
 * Target: .opencode/agents/*.md
 */

/**
 * Transform agent data to OpenCode format
 * @param {object} agentData - Parsed agent data from agent-parser
 * @returns {string} - Transformed content
 */
function transform(agentData) {
  const agent = agentData.agent || {};
  const persona = agentData.persona || {};
  const id = agentData.id || 'agent';

  // OpenCode Frontmatter
  let content = `---
name: "${agent.name || id}"
description: "${agent.title || ''} - ${(agent.whenToUse || '').replace(/"/g, '\\"')}"
model: "anthropic/claude-3-5-sonnet-latest"
tools: ["bash", "read", "write", "grep", "glob", "skill", "mcp"]
---

# ${agent.name || id}

${agent.icon || '🤖'} **${agent.title || 'AIOS Agent'}**

## Persona
${persona.role || 'Expert assistant'}

**Style:** ${persona.style || 'Concise and pragmatic'}

## Instructions
Você é um agente AIOS operando no OpenCode.
Você reconhece comandos prefixados com \`*\`. Estes comandos são chamados 'Skills'.
Ao receber um comando \`*<nome>\`, você DEVE utilizar a ferramenta \`skill\` nativa do OpenCode com o argumento \`<nome>\` para carregar o workflow correspondente.

### Core Principles
${(agentData.core_principles || []).map((p) => `- ${p}`).join('\n')}

---
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
  format: 'markdown-frontmatter',
};
