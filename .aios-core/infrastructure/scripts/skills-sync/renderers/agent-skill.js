'use strict';

const fs = require('fs');
const path = require('path');

function trimText(text, max = 220) {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 3).trim()}...`;
}

function getAgentSkillId(agentId) {
  const id = String(agentId || '').trim();
  if (id === 'aios-master') return 'aios-master';
  if (id.startsWith('aios-')) return id.slice(5);
  return id;
}

function getVisibleCommands(commands, visibility) {
  return (commands || []).filter((command) => {
    const levels = Array.isArray(command.visibility) ? command.visibility : ['full', 'quick'];
    return levels.includes(visibility);
  });
}

function buildStarterCommands(commands) {
  const quick = getVisibleCommands(commands, 'quick');
  const key = getVisibleCommands(commands, 'key');

  return [...quick, ...key.filter((entry) => !quick.some((quickEntry) => quickEntry.name === entry.name))]
    .slice(0, 8)
    .map((entry) => `- \`*${entry.name}\` - ${entry.description || 'No description'}`)
    .join('\n');
}

function readSourceFile(relativePath) {
  const fullPath = path.join(process.cwd(), relativePath);
  try {
    return fs.readFileSync(fullPath, 'utf8');
  } catch {
    return null;
  }
}

function stripFrontmatter(content) {
  const match = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return match ? content.slice(match[0].length) : content;
}

function buildAgentSkillContent(agentSpec) {
  const metadata = agentSpec.metadata || {};
  const name = metadata.name || agentSpec.id;
  const title = metadata.title || 'AIOS Agent';
  const whenToUse = trimText(metadata.whenToUse || `Use @${agentSpec.id} for specialized tasks.`);
  const skillName = getAgentSkillId(agentSpec.id);
  const description = trimText(`${title} (${name}). ${whenToUse}`, 180);
  const starterCommands = buildStarterCommands(agentSpec.commands || []);
  const agentDir = path.dirname(`.aios-core/development/agents/${agentSpec.filename}`);

  const sourcePath = `.aios-core/development/agents/${agentSpec.filename}`;
  const sourceContent = readSourceFile(sourcePath);

  if (sourceContent) {
    return `---
name: ${skillName}
description: ${description}
---

${sourceContent}
`;
  }

  return `---
name: ${skillName}
description: ${description}
---

# AIOS ${title} Activator

## When To Use
${whenToUse}

## Activation Protocol
1. Read the COMPLETE source agent definition: \`.aios-core/development/agents/${agentSpec.filename}\`
2. Read the agent memory file: \`${agentDir}/MEMORY.md\`
3. Read the agent context (authority, rules, config): \`${agentDir}/agent-context.md\`
4. Adopt this agent persona, commands, and constraints exactly as defined.
5. Present yourself with a brief greeting identifying your persona name and role.
6. Stay in this persona until the user asks to switch or exit.

## Starter Commands
${starterCommands || '- `*help` - List available commands'}

## Non-Negotiables
- Follow \`.aios-core/constitution.md\`.
- Execute workflows/tasks only from declared dependencies.
- Do not invent requirements outside the project artifacts.
`;
}

module.exports = {
  trimText,
  getAgentSkillId,
  readSourceFile,
  stripFrontmatter,
  buildAgentSkillContent,
};
