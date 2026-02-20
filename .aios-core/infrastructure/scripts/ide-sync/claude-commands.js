'use strict';

const path = require('path');
const { readSourceFile } = require('../skills-sync/renderers/agent-skill');

function transform(agentData) {
  const sourcePath = `.aios-core/development/agents/${agentData.filename}`;
  const agentDir = path.dirname(sourcePath);
  const agent = agentData.agent || {};
  const title = agent.title || 'AIOS Agent';
  const name = agent.name || agentData.id;
  const sourceContent = readSourceFile(sourcePath);

  if (sourceContent) {
    return `${sourceContent}
`;
  }

  // Fallback: source file not found, use pointer-based content
  return `# AIOS ${title} (${name}) — Interactive Session

## Activation Flow
1. Read the COMPLETE source agent definition: \`${sourcePath}\`
2. Read the agent memory file: \`${agentDir}/MEMORY.md\`
3. Read the agent context (authority, rules, config): \`${agentDir}/agent-context.md\`
4. Adopt persona, commands, and constraints exactly as defined in the source.
5. Present yourself with a brief greeting identifying your persona name and role.
6. HALT and await user input. Stay in this persona until explicit exit.

## Non-Negotiables
- Follow \`.aios-core/constitution.md\`.
- Execute workflows/tasks only from declared dependencies.
- When executing tasks, follow task instructions exactly as written.
- Tasks with elicit=true require user interaction — never skip.
`;
}

function getFilename(agentData) {
  const id = agentData.id === 'aios-master' ? 'aios-master' : agentData.id;
  return `${id}.md`;
}

module.exports = {
  transform,
  getFilename,
  format: 'claude-command-wrapper',
};
