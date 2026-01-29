/**
 * Agent Rule Generator - Extracts persona and principles from agents to OpenCode rules
 * @story 6.19 - IDE Command Auto-Sync System
 */

const fs = require('fs-extra');
const path = require('path');
const { translateContent } = require('./rule-porter');

/**
 * Generate specific rule files for each agent
 * @param {string} projectRoot - Project root directory
 * @param {object[]} agents - List of parsed agents
 * @param {object} options - Generation options
 */
async function generateAgentRules(projectRoot, agents, options = {}) {
  const targetDir = path.join(projectRoot, '.opencode', 'rules');
  await fs.ensureDir(targetDir);

  const generated = [];

  for (const agentData of agents) {
    const id = agentData.id;
    const agent = agentData.agent || {};
    const persona = agentData.persona_profile || {};
    const identity = agentData.persona || {};
    const corePrinciples = agentData.yaml?.core_principles || [];
    const formattedPrinciples = corePrinciples.map((p) => {
      if (typeof p === 'string') return p;
      // Handle key-value objects like { CRITICAL: 'message' }
      const keys = Object.keys(p);
      if (keys.length > 0) {
        return `**${keys[0]}**: ${p[keys[0]]}`;
      }
      return JSON.stringify(p);
    });

    const customization = agentData.yaml?.agent?.customization || '';

    let content = `---
description: "Rules and principles for @${id}"
---

# @${id} Operating Rules

## Persona & Role
- **Role**: ${identity.role || agent.title || id}
- **Archetype**: ${persona.archetype || 'Expert'}
- **Style**: ${identity.style || 'Pragmatic'}

## Identity
${identity.identity || agent.description || ''}

## Core Principles
${formattedPrinciples.map((p) => `- ${p}`).join('\n')}

${customization ? `## Customization\n${customization}` : ''}

## Collaboration
${agentData.sections?.collaboration || `Collaborates with other AIOS agents via @mention.`}

---
*AIOS Agent Rule - Synced for @${id}*
`;

    // Translate content (Claude -> OpenCode)
    content = translateContent(content);

    const filename = `agent-${id}.md`;
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
  generateAgentRules,
};
