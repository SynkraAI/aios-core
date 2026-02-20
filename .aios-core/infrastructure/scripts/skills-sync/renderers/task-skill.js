'use strict';

const { trimText, readSourceFile, stripFrontmatter } = require('./agent-skill');

function normalizeTaskId(taskId) {
  const id = String(taskId || '').trim().replace(/^aios-task-/, '');
  return id;
}

function normalizeAgentSlug(agent) {
  return String(agent || '').trim().replace(/^aios-/, '');
}

function getAgentSourceFilename(agent) {
  const agentSlug = normalizeAgentSlug(agent);
  if (!agentSlug) {
    throw new Error('Task skill requires owner agent');
  }
  const name = agentSlug === 'master' ? 'aios-master' : agentSlug;
  return `${name}/${name}.md`;
}

function getTaskSkillId(taskId, agent) {
  const id = normalizeTaskId(taskId);
  const agentSlug = normalizeAgentSlug(agent);

  if (!id) {
    throw new Error('Task skill id requires taskId');
  }

  if (!agentSlug) {
    throw new Error(`Task skill id requires agent slug for task "${id}"`);
  }

  const prefix = agentSlug === 'master' ? 'aios-master' : agentSlug;
  // Strip agent slug from task ID to prevent double prefix (e.g., dev-dev-develop-story)
  const cleanId = id.startsWith(`${agentSlug}-`) ? id.slice(agentSlug.length + 1) : id;
  return `${prefix}-${cleanId}`;
}

function sanitizeDescription(text) {
  return String(text || '')
    .replace(/^>\s*/, '')
    .replace(/^[-*+]\s+/, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function toYamlString(value) {
  return JSON.stringify(String(value || '').replace(/\s+/g, ' ').trim());
}

function buildTaskSkillContent(taskSpec) {
  const skillId = getTaskSkillId(taskSpec.id, taskSpec.agent);
  const title = taskSpec.title || taskSpec.id;
  const summary = sanitizeDescription(trimText(
    taskSpec.summary || `Reusable AIOS task workflow skill for ${taskSpec.id}.`,
    180,
  ));
  const description = summary || `Execute AIOS task workflow ${taskSpec.id}.`;
  const commandHint = String(taskSpec.command || '').trim();
  const normalizedAgent = normalizeAgentSlug(taskSpec.agent);
  const ownerAgentFile = getAgentSourceFilename(taskSpec.agent);
  const interactionNote = taskSpec.elicit
    ? '- This task requires user interaction points (`elicit=true`). Do not skip them.'
    : '- Execute non-interactive flow unless blocked by missing context.';

  return `---
name: ${skillId}
description: ${toYamlString(description)}
owner: ${toYamlString(normalizedAgent)}
intent: "aios-task-workflow"
source: ${toYamlString(`.aios-core/development/tasks/${taskSpec.filename}`)}
${commandHint ? `command: ${toYamlString(commandHint)}\n` : ''}---

# AIOS Task Skill: ${title}

## Agent Context
1. Load \`.aios-core/development/agents/${ownerAgentFile}\` before this task.
2. Adopt the owner agent persona (\`@${normalizedAgent}\`) for the entire execution.
3. Only then execute the task workflow below.

## Source of Truth
- Load \`.aios-core/development/tasks/${taskSpec.filename}\`.
- Follow the task workflow exactly as written.

## Execution Protocol
1. Read the task fully before execution.
2. Respect pre-conditions, post-conditions, and acceptance criteria.
3. Use only declared tools/scripts and canonical project paths.
4. Record assumptions explicitly when context is missing.

## Interaction Rules
${interactionNote}

${commandHint ? `## Canonical Command\n- \`${commandHint}\`\n\n` : ''}## Guardrails
- Do not invent requirements outside the task definition.
- Keep outputs aligned with the active story/epic scope.
- Escalate when constitutional or quality gates would be violated.
`;
}

function getRequiredContextPaths(agentSlug) {
  const agentName = agentSlug === 'master' ? 'aios-master' : agentSlug;
  return [
    `.aios-core/development/agents/${agentName}/${agentName}.md`,
    `.aios-core/development/agents/${agentName}/MEMORY.md`,
    `.aios-core/development/agents/${agentName}/agent-context.md`,
  ];
}

function buildClaudeTaskSkillContent(taskSpec) {
  const skillId = getTaskSkillId(taskSpec.id, taskSpec.agent);
  const title = taskSpec.title || taskSpec.id;
  const summary = sanitizeDescription(trimText(
    taskSpec.summary || `Reusable AIOS task workflow skill for ${taskSpec.id}.`,
    180,
  ));
  const description = summary || `Execute AIOS task workflow ${taskSpec.id}.`;
  const commandHint = String(taskSpec.command || '').trim();
  const normalizedAgent = normalizeAgentSlug(taskSpec.agent);
  const agentName = normalizedAgent === 'master' ? 'aios-master' : normalizedAgent;
  const interactionNote = taskSpec.elicit
    ? '- This task requires user interaction points (`elicit=true`). Do not skip them.'
    : '- Execute non-interactive flow unless blocked by missing context.';
  const requiredContext = getRequiredContextPaths(normalizedAgent);

  const taskSourcePath = `.aios-core/development/tasks/${taskSpec.filename}`;
  const taskSourceContent = readSourceFile(taskSourcePath);

  if (taskSourceContent) {
    const taskBody = stripFrontmatter(taskSourceContent);
    return `---
name: ${skillId}
description: ${toYamlString(description)}
context: fork
agent: ${agentName}
owner: ${toYamlString(normalizedAgent)}
intent: "aios-task-workflow"
source: ${toYamlString(taskSourcePath)}
required-context:
${requiredContext.map((p) => `  - "${p}"`).join('\n')}
${commandHint ? `command: ${toYamlString(commandHint)}\n` : ''}---

${taskBody.trim()}

## Guardrails
- Do not invent requirements outside the task definition.
- Keep outputs aligned with the active story/epic scope.
- Escalate when constitutional or quality gates would be violated.
`;
  }

  return `---
name: ${skillId}
description: ${toYamlString(description)}
context: fork
agent: ${agentName}
owner: ${toYamlString(normalizedAgent)}
intent: "aios-task-workflow"
source: ${toYamlString(taskSourcePath)}
required-context:
${requiredContext.map((p) => `  - "${p}"`).join('\n')}
${commandHint ? `command: ${toYamlString(commandHint)}\n` : ''}---

# AIOS Task: ${title}

## Required Context Loading
Before execution, read these files:
${requiredContext.map((p) => `- \`${p}\``).join('\n')}

## Mission
Execute the ${title} task autonomously as @${normalizedAgent} and return the result.

## Source of Truth
- Load \`.aios-core/development/tasks/${taskSpec.filename}\`.
- Follow the task workflow exactly as written.

## Execution Protocol
1. Read the task fully before execution.
2. Respect pre-conditions, post-conditions, and acceptance criteria.
3. Use only declared tools/scripts and canonical project paths.
4. Record assumptions explicitly when context is missing.
5. Report results back to the caller upon completion.

## Interaction Rules
${interactionNote}

${commandHint ? `## Canonical Command\n- \`${commandHint}\`\n\n` : ''}## Guardrails
- Do not invent requirements outside the task definition.
- Keep outputs aligned with the active story/epic scope.
- Escalate when constitutional or quality gates would be violated.
`;
}

module.exports = {
  normalizeTaskId,
  normalizeAgentSlug,
  getAgentSourceFilename,
  getTaskSkillId,
  sanitizeDescription,
  toYamlString,
  getRequiredContextPaths,
  buildTaskSkillContent,
  buildClaudeTaskSkillContent,
};
