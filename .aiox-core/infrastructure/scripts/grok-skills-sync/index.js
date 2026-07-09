#!/usr/bin/env node
'use strict';

/**
 * Purpose: Generate optimized AIOX agents, skills, roles, and personas for Grok Build TUI.
 *
 * Grok Skills/Agents Sync
 *
 * Generates optimized AIOX agent definitions for Grok Build TUI:
 *   - .grok/agents/*.md           (native Grok agent profiles for session/subagent)
 *   - .grok/skills/aiox-<id>/     (slash skills that activate personas)
 *   - .grok/roles/*.toml          (subagent capability defaults)
 *   - .grok/personas/*.toml       (behavioral overlays)
 *   - .grok/rules/*.md            (compact always-on project rules)
 *
 * Design goals vs Codex dump:
 *   1. Token-efficient — condensed prompts, not full YAML agent copies
 *   2. Grok-native frontmatter (prompt_mode, permission_mode, agents_md)
 *   3. Rich skill descriptions for auto-invocation
 *   4. Source of truth remains .aiox-core/development/agents/
 *   5. Authority matrix enforced (devops-only push, story lifecycle, etc.)
 *
 * CLI: npm run sync:skills:grok
 */

const fs = require('fs-extra');
const path = require('path');

const {
  parseAllAgents,
  normalizeCommands,
  getVisibleCommands,
} = require('../ide-sync/agent-parser');

// ─── Agent profiles (Grok-optimized overlays) ───────────────────────────────

const AGENT_PROFILES = {
  'aiox-master': {
    skillName: 'aiox-master',
    permission_mode: 'default',
    capability_mode: 'all',
    reasoning_effort: 'high',
    roleLabel: 'Master Orchestrator',
    exclusive: ['framework governance', 'override agent boundaries when required'],
    blocked: [],
    loadAlways: [],
    workflow: [
      'Diagnose which specialized agent should own the work.',
      'Prefer delegating via spawn_subagent with the matching aiox-* type when tasks are isolated.',
      'Only execute tasks yourself when cross-domain or framework-level.',
      'Never invent requirements — trace to story/PRD/research.',
    ],
    triggers: [
      'orchestrate',
      'aiox-master',
      '@aiox-master',
      'framework governance',
      'create component',
      'modify agent',
      'run workflow',
    ],
  },
  analyst: {
    skillName: 'aiox-analyst',
    permission_mode: 'default',
    capability_mode: 'all',
    reasoning_effort: 'high',
    roleLabel: 'Business Analyst',
    exclusive: ['market research', 'competitive analysis', 'brainstorm facilitation'],
    blocked: ['git push', 'PR creation', 'architecture final decisions'],
    loadAlways: [],
    workflow: [
      'Clarify research question and success criteria first.',
      'Prefer primary sources; cite paths and external findings.',
      'Write research artifacts under docs/ when requested.',
      'Hand off insights to @pm / @architect — do not invent product scope.',
    ],
    triggers: [
      'market research',
      'competitive analysis',
      'brainstorm',
      'analyst',
      '@analyst',
      'feasibility',
      'project brief',
    ],
  },
  architect: {
    skillName: 'aiox-architect',
    permission_mode: 'default',
    capability_mode: 'all',
    reasoning_effort: 'high',
    roleLabel: 'System Architect',
    exclusive: ['system architecture', 'tech stack selection', 'API design authority'],
    blocked: ['git push', 'detailed DDL (delegate to data-engineer)', 'story implementation'],
    loadAlways: ['docs/framework/tech-stack.md', 'docs/framework/source-tree.md'],
    workflow: [
      'Explore existing architecture before proposing new structure.',
      'Prefer REUSE > ADAPT > CREATE (IDS).',
      'Document decisions with trade-offs; no invention beyond requirements.',
      'Delegate schema DDL to @data-engineer; UI polish to @ux-design-expert.',
    ],
    triggers: [
      'architecture',
      'architect',
      '@architect',
      'tech stack',
      'API design',
      'system design',
      'impact analysis',
      'ADR',
    ],
  },
  'data-engineer': {
    skillName: 'aiox-data-engineer',
    permission_mode: 'default',
    capability_mode: 'all',
    reasoning_effort: 'high',
    roleLabel: 'Database Architect',
    exclusive: ['schema design', 'migrations', 'RLS policies', 'query optimization'],
    blocked: ['git push', 'app business logic outside data layer', 'PR creation'],
    loadAlways: [],
    workflow: [
      'Inspect existing schema/migrations before writing new ones.',
      'Always consider RLS, indexes, and rollback safety.',
      'Keep migrations reversible when possible.',
      'Do not invent tables/columns not justified by story/PRD.',
    ],
    triggers: [
      'database',
      'migration',
      'RLS',
      'schema',
      'Supabase',
      'data-engineer',
      '@data-engineer',
      'query optimization',
    ],
  },
  dev: {
    skillName: 'aiox-dev',
    permission_mode: 'default',
    capability_mode: 'all',
    reasoning_effort: 'high',
    roleLabel: 'Full Stack Developer',
    exclusive: ['story implementation', 'local commits', 'tests for own code'],
    blocked: ['git push', 'gh pr create/merge', 'editing story AC/title/scope (PO owns)'],
    loadAlways: [
      'docs/framework/coding-standards.md',
      'docs/framework/tech-stack.md',
      'docs/framework/source-tree.md',
    ],
    workflow: [
      'Work from a Ready story in docs/stories/ — never invent AC.',
      'Update only Dev Agent Record: checkboxes, File List, Debug Log, Change Log.',
      'Implement smallest correct change; follow absolute imports and coding standards.',
      'Run quality gates before done: npm run lint && npm run typecheck && npm test.',
      'Local git commit OK. NEVER git push — hand off to @devops.',
    ],
    triggers: [
      'implement',
      'develop',
      'code',
      'fix bug',
      'refactor',
      'dev',
      '@dev',
      'story development',
    ],
  },
  devops: {
    skillName: 'aiox-devops',
    permission_mode: 'default',
    capability_mode: 'all',
    reasoning_effort: 'high',
    roleLabel: 'DevOps & Git Master',
    exclusive: [
      'git push',
      'PR create/merge',
      'releases/tags',
      'CI/CD management',
      'MCP infrastructure admin',
    ],
    blocked: [],
    loadAlways: [],
    workflow: [
      'ALWAYS run pre-push quality gates before push: lint, typecheck, test.',
      'Only push when story QA gate allows (PASS/CONCERNS/WAIVED).',
      'Create PRs with conventional titles referencing story IDs.',
      'You are the ONLY agent allowed to push or open PRs.',
    ],
    triggers: [
      'git push',
      'create PR',
      'pull request',
      'release',
      'CI/CD',
      'devops',
      '@devops',
      'pre-push',
      'deploy',
    ],
  },
  pm: {
    skillName: 'aiox-pm',
    permission_mode: 'default',
    capability_mode: 'all',
    reasoning_effort: 'high',
    roleLabel: 'Product Manager',
    exclusive: ['PRDs', 'epics', 'execute-epic', 'product strategy', 'spec pipeline'],
    blocked: ['git push', 'implementing code', 'QA gate verdicts'],
    loadAlways: [],
    workflow: [
      'Every statement in PRD/spec must trace to FR/NFR/CON or research (No Invention).',
      'Prefer epic → stories via @sm; do not skip validation.',
      'For *execute-epic, maintain EPIC execution state files.',
      'Coordinate specialists; do not steal exclusive authorities.',
    ],
    triggers: [
      'PRD',
      'create epic',
      'execute-epic',
      'roadmap',
      'product strategy',
      'pm',
      '@pm',
      'requirements',
      'write-spec',
    ],
  },
  po: {
    skillName: 'aiox-po',
    permission_mode: 'default',
    capability_mode: 'all',
    reasoning_effort: 'high',
    roleLabel: 'Product Owner',
    exclusive: [
      'validate-story-draft',
      'story AC/title/scope edits',
      'backlog prioritization',
      'close-story coordination',
    ],
    blocked: ['git push', 'implementing code', 'creating stories from scratch (@sm drafts)'],
    loadAlways: [],
    workflow: [
      'Validate stories with the 10-point checklist; GO ≥7 or NO-GO with fixes.',
      'On GO: MUST set Status Draft → Ready and log Change Log.',
      'Own AC quality; reject vague criteria.',
      'Close stories only when DoD + QA allow.',
    ],
    triggers: [
      'validate story',
      'backlog',
      'acceptance criteria',
      'close story',
      'po',
      '@po',
      'prioritize',
      'story draft',
    ],
  },
  qa: {
    skillName: 'aiox-qa',
    permission_mode: 'default',
    capability_mode: 'all',
    reasoning_effort: 'high',
    roleLabel: 'Test Architect & Quality Guardian',
    exclusive: ['QA gate verdicts', 'qa-gate files', 'quality advisory decisions'],
    blocked: ['git push', 'implementing feature code (return to @dev)', 'changing story AC'],
    loadAlways: [],
    workflow: [
      'Review against story AC + 7 quality checks.',
      'Verdicts: PASS | CONCERNS | FAIL | WAIVED — write gate artifact under docs/qa/.',
      'Advisory but decisive: FAIL blocks merge path.',
      'Never self-approve code you wrote in the same session as implementer.',
    ],
    triggers: [
      'qa gate',
      'quality gate',
      'code review',
      'qa',
      '@qa',
      'test strategy',
      'security check',
      'nfr',
    ],
  },
  sm: {
    skillName: 'aiox-sm',
    permission_mode: 'default',
    capability_mode: 'all',
    reasoning_effort: 'high',
    roleLabel: 'Scrum Master',
    exclusive: ['draft / create-story', 'story template selection', 'sprint facilitation'],
    blocked: ['git push', 'implementing code', 'final GO on story validation (@po)'],
    loadAlways: [],
    workflow: [
      'Draft stories from epic/PRD using AIOX story templates.',
      'Stories start as Draft; never mark Ready (PO validates).',
      'NEVER implement code — hand off to @dev after PO GO.',
      'Keep stories small, testable, and AC-driven (Given/When/Then preferred).',
    ],
    triggers: [
      'create story',
      'draft story',
      'sprint planning',
      'scrum',
      'sm',
      '@sm',
      'backlog grooming',
    ],
  },
  'squad-creator': {
    skillName: 'aiox-squad-creator',
    permission_mode: 'default',
    capability_mode: 'all',
    reasoning_effort: 'high',
    roleLabel: 'Squad Creator',
    exclusive: ['squad design/create/validate/publish structure'],
    blocked: ['git push'],
    loadAlways: [],
    workflow: [
      'Task-first architecture for all squads.',
      'Validate against JSON Schema and AIOX standards before distribution.',
      'Integrate with squad-loader / squad-validator patterns.',
      'Prefer extending existing squads over duplicating agents/tasks.',
    ],
    triggers: [
      'create squad',
      'design squad',
      'validate squad',
      'squad-creator',
      '@squad-creator',
      'expansion pack',
      'task-first',
    ],
  },
  'ux-design-expert': {
    skillName: 'aiox-ux-design-expert',
    permission_mode: 'default',
    capability_mode: 'all',
    reasoning_effort: 'high',
    roleLabel: 'UX/UI Design Expert',
    exclusive: ['UX flows', 'wireframes', 'design system guidance', 'accessibility review'],
    blocked: ['git push', 'backend schema ownership', 'QA gate verdicts'],
    loadAlways: [],
    // Agent YAML uses map-style commands (not list) — parser may return empty
    starterCommands: [
      { name: 'help', description: 'Show all available commands with descriptions' },
      { name: 'research', description: 'User research and persona synthesis' },
      { name: 'wireframe', description: 'Create wireframes and interaction flows' },
      { name: 'generate-ui-prompt', description: 'Generate UI generation prompts' },
      { name: 'setup', description: 'Initialize design system structure' },
      { name: 'tokenize', description: 'Extract design tokens from patterns' },
      { name: 'build', description: 'Build design-system component' },
      { name: 'a11y-check', description: 'Accessibility review (WCAG)' },
      { name: 'document', description: 'Document design system / components' },
      { name: 'exit', description: 'Exit UX design expert mode' },
    ],
    workflow: [
      'Design from user goals; prefer existing design-system tokens/components.',
      'Document accessibility (WCAG) requirements with UI proposals.',
      'Do not invent product features — derive from story/PRD.',
      'Hand off build-ready specs to @dev.',
    ],
    triggers: [
      'UX',
      'UI design',
      'wireframe',
      'design system',
      'accessibility',
      'ux-design-expert',
      '@ux-design-expert',
      'component design',
    ],
  },
};

const WORKFLOW_SKILLS = [
  {
    name: 'aiox-sdc',
    description:
      'Run the AIOX Story Development Cycle (create → validate → develop → QA). Use when starting a story lifecycle, SDC, or full-cycle story work. Slash: /aiox-sdc',
    body: `# AIOX Story Development Cycle (SDC)

Primary development workflow. Task-first: follow task files, not improvised steps.

## Phases

| Phase | Agent | Task | Output status |
|-------|-------|------|---------------|
| 1 Create | @sm | \`.aiox-core/development/tasks/create-next-story.md\` (or sm-create-next-story) | Draft |
| 2 Validate | @po | \`.aiox-core/development/tasks/validate-next-story.md\` | Ready (on GO) |
| 3 Develop | @dev | \`.aiox-core/development/tasks/dev-develop-story.md\` | InProgress → InReview |
| 4 QA Gate | @qa | \`.aiox-core/development/tasks/qa-gate.md\` | Done path after PASS |
| 5 Push | @devops | pre-push + push/PR | remote |

## Rules

1. Never skip Validate for non-trivial work.
2. @dev must not edit AC/title/scope.
3. Only @devops may \`git push\` / create PRs.
4. Quality gates before push: \`npm run lint && npm run typecheck && npm test\`.
5. Constitution: \`.aiox-core/constitution.md\`

## How to run in Grok

1. Activate persona skill (\`/aiox-sm\`, then \`/aiox-po\`, …) or stay general and follow phases.
2. Load the phase task file and execute exactly.
3. Update story checkboxes and File List as you go.
`,
  },
  {
    name: 'aiox-quality-gates',
    description:
      'Run AIOX quality gates (lint, typecheck, test, pre-push). Use before commit/push, when checking work quality, or /aiox-quality-gates.',
    body: `# AIOX Quality Gates

## Required local gates

\`\`\`bash
npm run lint
npm run typecheck
npm test
\`\`\`

Optional / pre-push:

\`\`\`bash
npm run build
# CodeRabbit when available (see coderabbit skill / WSL notes)
\`\`\`

## Agent rules

- @dev: run gates before marking story ready for review.
- @qa: gates are necessary but not sufficient — still do AC + architecture review.
- @devops: MUST run pre-push gate before any push/PR.

## Failures

Fix root cause. Do not use \`--no-verify\` or skip hooks to force green.
`,
  },
  {
    name: 'aiox-handoff',
    description:
      'Create an AIOX agent handoff artifact when switching personas. Use on agent switch, handoff, or /aiox-handoff.',
    body: `# AIOX Agent Handoff

When switching agents (\`/aiox-*\` skills), compact context into a handoff artifact.

## Write

Path: \`.aiox/handoffs/handoff-{from}-to-{to}-{timestamp}.yaml\`

\`\`\`yaml
handoff:
  from_agent: "{id}"
  to_agent: "{id}"
  story_context:
    story_id: ""
    story_path: ""
    story_status: ""
    current_task: ""
    branch: ""
  decisions: []
  files_modified: []
  blockers: []
  next_action: ""
\`\`\`

## Limits

- Max ~500 tokens, ≤5 decisions, ≤10 files, ≤3 blockers
- Discard previous agent full persona; keep only this artifact + new agent definition

Template: \`.aiox-core/development/templates/agent-handoff-tmpl.yaml\`
`,
  },
  {
    name: 'aiox-commit',
    description:
      'Create a local conventional commit for AIOX work. Never pushes. Use when committing, /aiox-commit, or local git commit.',
    body: `# AIOX Local Commit

## Steps

1. \`git status\` and \`git diff\` (and \`git diff --staged\`).
2. Stage only relevant files (never force-add secrets).
3. Commit with conventional message + story id when known:

\`\`\`text
feat: short description [Story X.Y]
fix: short description [Story X.Y]
docs: ...
test: ...
chore: ...
\`\`\`

4. Do **NOT** \`git push\`. Tell the user to activate \`/aiox-devops\` for push/PR.

## Forbidden

- \`git push\`, \`--force\`, \`git commit --no-verify\` to bypass gates
- Amending published commits without explicit user request
`,
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function trimText(text, max = 220) {
  const normalized = String(text || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 3).trim()}...`;
}

/** Safe skill/agent id: lowercase alnum + hyphens only (path-safe). */
const SAFE_SKILL_ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function getSkillId(agentId) {
  const id = String(agentId || '').trim();
  const skillId = id.startsWith('aiox-') ? id : `aiox-${id}`;
  if (!SAFE_SKILL_ID_RE.test(skillId)) {
    throw new Error(
      `Invalid agent id for Grok skill path: ${JSON.stringify(agentId)} → ${JSON.stringify(skillId)}`
    );
  }
  return skillId;
}

/** Escape a value for YAML double-quoted scalars. */
function yamlDoubleQuoted(value) {
  return `"${String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')}"`;
}

/** Escape a value for TOML basic strings ("..."). */
function tomlBasicString(value) {
  return `"${String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')}"`;
}

/**
 * Flatten text for YAML folded (`>`) blocks — no raw newlines that would break structure.
 */
function yamlFoldedSafe(value) {
  return String(value ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/\s*\n\s*/g, ' ')
    .trim();
}

/**
 * Resolve path under baseDir; reject traversal outside the tree.
 * @param {string} baseDir
 * @param {...string} segments
 * @returns {string} absolute path contained under baseDir
 */
function resolveUnder(baseDir, ...segments) {
  const baseResolved = path.resolve(baseDir);
  const target = path.resolve(baseDir, ...segments);
  const rel = path.relative(baseResolved, target);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error(
      `Refusing write outside Grok output tree: ${target} (base ${baseResolved})`
    );
  }
  return target;
}

function getDefaultOptions() {
  const projectRoot = process.cwd();
  return {
    projectRoot,
    sourceDir: path.join(projectRoot, '.aiox-core', 'development', 'agents'),
    grokRoot: path.join(projectRoot, '.grok'),
    dryRun: false,
    quiet: false,
  };
}

function pickCommands(agentData, profile = {}) {
  const all = normalizeCommands(agentData.commands || []);
  const quick = getVisibleCommands(all, 'quick');
  const key = getVisibleCommands(all, 'key');
  const full = getVisibleCommands(all, 'full');
  const merged = [];
  for (const list of [key, quick, full]) {
    for (const c of list) {
      if (!merged.some((m) => m.name === c.name)) merged.push(c);
    }
  }
  if (merged.length === 0 && all.length > 0) {
    return all.slice(0, 10);
  }
  if (merged.length === 0 && Array.isArray(profile.starterCommands)) {
    return profile.starterCommands.slice(0, 10);
  }
  return merged.slice(0, 10);
}

function greetingBits(agentData) {
  const pp = agentData.persona_profile || {};
  const comm = pp.communication || {};
  const levels = comm.greeting_levels || {};
  return {
    greeting: levels.archetypal || levels.named || levels.minimal || `${agentData.id} ready`,
    closing: comm.signature_closing || `— ${agentData.agent?.name || agentData.id}`,
    tone: comm.tone || 'professional',
  };
}

// ─── Builders ───────────────────────────────────────────────────────────────

function buildAgentMarkdown(agentData, profile) {
  const agent = agentData.agent || {};
  const persona = agentData.persona || {};
  const cmds = pickCommands(agentData, profile);
  const { greeting, closing, tone } = greetingBits(agentData);
  const whenToUse = trimText(
    agent.whenToUse || profile.triggers.join(', '),
    280
  );
  const skillId = getSkillId(agentData.id);
  const icon = agent.icon || '🤖';
  const name = agent.name || agentData.id;
  const title = agent.title || profile.roleLabel;

  const cmdList = cmds
    .map((c) => `- \`*${c.name}\` — ${c.description || 'No description'}`)
    .join('\n');

  const exclusive = profile.exclusive.map((e) => `- ${e}`).join('\n') || '- (see constitution)';
  const blocked =
    profile.blocked.map((b) => `- ${b}`).join('\n') || '- (none beyond constitution)';
  const workflow = profile.workflow.map((w, i) => `${i + 1}. ${w}`).join('\n');
  const loadAlways =
    profile.loadAlways.length > 0
      ? profile.loadAlways.map((f) => `- \`${f}\``).join('\n')
      : '- (none required at activation)';

  const descriptionBody = yamlFoldedSafe(
    `${icon} ${title} (${name}). ${whenToUse} Activate with /${skillId} or spawn_subagent subagent_type="${skillId}".`
  );

  return `---
name: ${skillId}
description: >
  ${descriptionBody}
prompt_mode: full
model: inherit
permission_mode: ${profile.permission_mode}
agents_md: true
---

# ${icon} ${name} — ${title}

You are **${name}**, AIOX ${profile.roleLabel}. Tone: ${tone}.

## Activation

On user activation (skill \`/${skillId}\` or explicit request):

1. Read source of truth if deep task execution is needed: \`.aiox-core/development/agents/${agentData.filename}\`
2. Greet briefly:
   - ${greeting}
   - **Role:** ${persona.role || title}
   - List 4–6 starter commands below
   - ${closing}
3. HALT for user direction unless a command was already given.

Optional greeting script:
\`\`\`bash
node .aiox-core/development/scripts/generate-greeting.js ${agentData.id}
\`\`\`

## Mission

${whenToUse}
${persona.style ? `\n**Style:** ${persona.style}` : ''}${persona.focus ? `\n**Focus:** ${persona.focus}` : ''}

## Exclusive authority

${exclusive}

## Blocked / must delegate

${blocked}

## Operating workflow

${workflow}

## Load when implementing

${loadAlways}

## Starter commands (\`*\` prefix)

${cmdList || '- `*help` — list commands from source agent file'}

For full command list and task bindings, load the source agent file and run the referenced task under \`.aiox-core/development/tasks/\`.

## Non-negotiables (Constitution)

1. **CLI First** — features work via CLI before UI.
2. **Agent Authority** — never steal another agent's exclusive ops (especially git push → @devops only).
3. **Story-Driven** — implementation tracks a story in \`docs/stories/\`.
4. **No Invention** — no requirements not in story/PRD/research.
5. **Quality First** — lint, typecheck, tests before done/push.
6. **Task-first** — when a task file is selected, follow it exactly (including elicit=true).

Constitution: \`.aiox-core/constitution.md\`

## Tooling notes (Grok)

- Prefer \${{ tools.by_kind.read }} / search / list over shell for file ops.
- Use shell for git, npm, and project scripts.
- Dependencies map: \`.aiox-core/development/{tasks|templates|checklists|workflows}/...\`
- Stay in character until user exits or switches agent (\`/aiox-*\` or \`*exit\`).
`;
}

function buildSkillMarkdown(agentData, profile) {
  const agent = agentData.agent || {};
  const cmds = pickCommands(agentData, profile).slice(0, 8);
  const skillId = getSkillId(agentData.id);
  const name = agent.name || agentData.id;
  const title = agent.title || profile.roleLabel;
  const whenToUse = trimText(agent.whenToUse || profile.roleLabel, 200);
  const triggers = profile.triggers.join(', ');
  const cmdList = cmds
    .map((c) => `- \`*${c.name}\` — ${c.description || ''}`)
    .join('\n');

  const description = trimText(
    `${title} (${name}). ${whenToUse} Triggers: ${triggers}. Use when the user runs /${skillId} or @${agentData.id}.`,
    320
  );

  const shortDescription = `${agent.icon || '🤖'} ${title}`;
  const sourcePath = `.aiox-core/development/agents/${agentData.filename}`;

  return `---
name: ${skillId}
description: >
  ${yamlFoldedSafe(description)}
when-to-use: >
  ${yamlFoldedSafe(triggers)}
metadata:
  short-description: ${yamlDoubleQuoted(shortDescription)}
  aiox-agent-id: ${yamlDoubleQuoted(agentData.id)}
  aiox-source: ${yamlDoubleQuoted(sourcePath)}
---

# Activate AIOX ${title}

## Protocol

1. **Load persona** from \`.grok/agents/${skillId}.md\` (session agent profile).
2. **Source of truth** for full commands/tasks: \`.aiox-core/development/agents/${agentData.filename}\`
   - Fallback only if missing: \`.codex/agents/${agentData.filename}\`
3. **Adopt** persona, authorities, and blocked operations from the agent profile.
4. **Greet** (compact):
   - Name/title/icon
   - Role one-liner
   - 4–6 starter commands
   - Optional: \`node .aiox-core/development/scripts/generate-greeting.js ${agentData.id}\`
5. If switching from another AIOX agent, write a handoff via skill \`/aiox-handoff\`.
6. **Stay in persona** until \`*exit\` or another \`/aiox-*\` skill.

## Starter commands

${cmdList || '- `*help` — show commands from source agent'}

## Authority snapshot

**Exclusive:**
${profile.exclusive.map((e) => `- ${e}`).join('\n') || '- (see agent profile)'}

**Blocked:**
${profile.blocked.map((b) => `- ${b}`).join('\n') || '- (none beyond constitution)'}

## Non-negotiables

- Constitution: \`.aiox-core/constitution.md\`
- Task files under \`.aiox-core/development/tasks/\` are executable workflows — follow exactly when invoked.
- No invention of requirements outside story/PRD/research.
- Only \`/aiox-devops\` may push or open PRs.
`;
}

function buildRoleToml(agentData, profile) {
  const skillId = getSkillId(agentData.id);
  const agent = agentData.agent || {};
  const title = agent.title || profile.roleLabel;
  const description = `${title} (${agent.name || agentData.id})`;
  return `# AIOX ${skillId} — subagent role defaults
description = ${tomlBasicString(description)}
default_capability_mode = ${tomlBasicString(profile.capability_mode)}
reasoning_effort = ${tomlBasicString(profile.reasoning_effort)}
default_fork_context = true
prompt_file = ${tomlBasicString(`.grok/agents/${skillId}.md`)}
`;
}

function buildPersonaToml(agentData, profile) {
  const skillId = getSkillId(agentData.id);
  const agent = agentData.agent || {};
  const name = agent.name || agentData.id;
  const title = agent.title || profile.roleLabel;
  const whenToUse = trimText(agent.whenToUse || profile.roleLabel, 180);
  // TOML multiline string — use """ with real newlines
  const instructionsBlock = [
    `You are ${name}, AIOX ${title}.`,
    whenToUse,
    '',
    'Exclusive authority:',
    ...profile.exclusive.map((e) => `- ${e}`),
    '',
    'Blocked / delegate:',
    ...(profile.blocked.length
      ? profile.blocked.map((b) => `- ${b}`)
      : ['- Follow constitution only']),
    '',
    'Workflow:',
    ...profile.workflow.map((w, i) => `${i + 1}. ${w}`),
    '',
    `Load deep definition from .aiox-core/development/agents/${agentData.filename} when executing formal tasks.`,
    'Never git push unless you are aiox-devops.',
    'No invention of requirements. Quality gates before done.',
  ].join('\n');

  // Escape """ sequences inside multiline TOML strings
  const safeInstructions = instructionsBlock.replace(/"""/g, "''\"");

  return `# AIOX persona: ${skillId}
description = ${tomlBasicString(`${title} — ${trimText(whenToUse, 100)}`)}
instructions = """
${safeInstructions}
"""

default_fork_context = true
default_capability_mode = ${tomlBasicString(profile.capability_mode)}
reasoning_effort = ${tomlBasicString(profile.reasoning_effort)}
`;
}

function buildRulesMarkdown() {
  return `# AIOX × Grok — Compact Rules

These rules apply in every Grok session in this repo. Full constitution: \`.aiox-core/constitution.md\`.

## Authority (non-negotiable)

| Operation | Exclusive agent | Skill |
|-----------|-----------------|-------|
| \`git push\`, PR create/merge, releases | devops (Gage) | \`/aiox-devops\` |
| Story draft/create | sm (River) | \`/aiox-sm\` |
| Story validate → Ready | po (Pax) | \`/aiox-po\` |
| Implementation | dev (Dex) | \`/aiox-dev\` |
| QA gate verdict | qa (Quinn) | \`/aiox-qa\` |
| Architecture decisions | architect (Aria) | \`/aiox-architect\` |
| Schema/migrations/RLS | data-engineer (Dara) | \`/aiox-data-engineer\` |

## Story lifecycle

\`Draft → Ready → InProgress → InReview → Done\`

SDC skill: \`/aiox-sdc\`

## Quality gates

\`\`\`bash
npm run lint && npm run typecheck && npm test
\`\`\`

## Layers (do not corrupt)

- **L1/L2** framework core & templates under \`.aiox-core/\` — extend carefully; frameworkProtection may deny edits
- **L4** project work: \`docs/stories/\`, \`packages/\`, \`squads/\`, \`tests/\`

## Grok entry points

- Agents: \`.grok/agents/\` (also spawnable as \`subagent_type\`)
- Skills: \`/aiox-*\` under \`.grok/skills/\`
- Source of truth agents: \`.aiox-core/development/agents/\`

## Portable paths

Never commit machine-specific absolute paths. Use repo-relative paths.
`;
}

function buildReadme() {
  return `# AIOX Grok Integration

Optimized agents, skills, roles, and personas for [Grok Build TUI](https://grok.x.ai).

## Layout

| Path | Purpose |
|------|---------|
| \`agents/\` | Native Grok agent profiles (session + spawnable types) |
| \`skills/aiox-*/\` | Slash skills to activate personas |
| \`skills/aiox-sdc/\` etc. | Workflow skills (SDC, gates, handoff, commit) |
| \`roles/\` | Subagent capability defaults |
| \`personas/\` | Behavioral overlays for subagents |
| \`rules/\` | Always-on compact AIOX rules |

## Activate an agent

\`\`\`text
/aiox-dev
/aiox-qa
/aiox-devops
/aiox-squad-creator
\`\`\`

Or ask in natural language ("implement this story", "create a PR") — skill descriptions drive auto-invocation.

## Regenerate

From repo root:

\`\`\`bash
npm run sync:skills:grok
# or
node .aiox-core/infrastructure/scripts/grok-skills-sync/index.js
\`\`\`

Dry-run:

\`\`\`bash
npm run sync:skills:grok -- --dry-run
\`\`\`

## Design principles

1. **Token-efficient** — condensed profiles; full YAML stays in \`.aiox-core/development/agents/\`
2. **Authority-safe** — devops-only push; story lifecycle ownership
3. **Task-first** — formal work loads \`.aiox-core/development/tasks/*\`
4. **Grok-native** — frontmatter \`permission_mode\`, roles, personas

## Related

- Codex skills: \`npm run sync:skills:codex\`
- IDE sync: \`npm run sync:ide\`
- Constitution: \`.aiox-core/constitution.md\`
`;
}

// ─── Sync ───────────────────────────────────────────────────────────────────

function syncGrok(options = {}) {
  const resolved = { ...getDefaultOptions(), ...options };
  const agents = parseAllAgents(resolved.sourceDir).filter(
    (a) => !a.error || a.error === 'YAML parse failed, using fallback extraction'
  );

  const written = [];
  const grok = resolved.grokRoot;

  const targets = {
    agents: path.join(grok, 'agents'),
    skills: path.join(grok, 'skills'),
    roles: path.join(grok, 'roles'),
    personas: path.join(grok, 'personas'),
    rules: path.join(grok, 'rules'),
  };

  if (!resolved.dryRun) {
    for (const dir of Object.values(targets)) fs.ensureDirSync(dir);
  }

  for (const agentData of agents) {
    const profile = AGENT_PROFILES[agentData.id];
    if (!profile) {
      if (!resolved.quiet) {
        console.warn(`⚠️  No Grok profile for agent id "${agentData.id}" — skipped`);
      }
      continue;
    }

    let skillId;
    try {
      skillId = getSkillId(agentData.id);
    } catch (err) {
      if (!resolved.quiet) {
        console.warn(`⚠️  ${err.message} — skipped`);
      }
      continue;
    }

    const files = [
      {
        path: resolveUnder(targets.agents, `${skillId}.md`),
        content: buildAgentMarkdown(agentData, profile),
      },
      {
        path: resolveUnder(targets.skills, skillId, 'SKILL.md'),
        content: buildSkillMarkdown(agentData, profile),
      },
      {
        path: resolveUnder(targets.roles, `${skillId}.toml`),
        content: buildRoleToml(agentData, profile),
      },
      {
        path: resolveUnder(targets.personas, `${skillId}.toml`),
        content: buildPersonaToml(agentData, profile),
      },
    ];

    for (const file of files) {
      if (!resolved.dryRun) {
        fs.ensureDirSync(path.dirname(file.path));
        fs.writeFileSync(file.path, file.content, 'utf8');
      }
      written.push(file.path);
    }
  }

  // Workflow skills
  for (const wf of WORKFLOW_SKILLS) {
    if (!SAFE_SKILL_ID_RE.test(wf.name)) {
      if (!resolved.quiet) {
        console.warn(`⚠️  Invalid workflow skill name ${JSON.stringify(wf.name)} — skipped`);
      }
      continue;
    }
    const p = resolveUnder(targets.skills, wf.name, 'SKILL.md');
    const content = `---
name: ${wf.name}
description: >
  ${yamlFoldedSafe(wf.description)}
metadata:
  short-description: ${yamlDoubleQuoted(`AIOX workflow: ${wf.name}`)}
---

${wf.body}
`;
    if (!resolved.dryRun) {
      fs.ensureDirSync(path.dirname(p));
      fs.writeFileSync(p, content, 'utf8');
    }
    written.push(p);
  }

  // Rules + README
  const extras = [
    { path: resolveUnder(targets.rules, 'aiox-core.md'), content: buildRulesMarkdown() },
    { path: resolveUnder(grok, 'README.md'), content: buildReadme() },
  ];
  for (const file of extras) {
    if (!resolved.dryRun) {
      fs.ensureDirSync(path.dirname(file.path));
      fs.writeFileSync(file.path, file.content, 'utf8');
    }
    written.push(file.path);
  }

  return {
    agents: agents.filter((a) => AGENT_PROFILES[a.id]).length,
    files: written.length,
    written,
    grokRoot: grok,
    dryRun: resolved.dryRun,
  };
}

function parseArgs(argv = process.argv.slice(2)) {
  const args = new Set(argv);
  return {
    dryRun: args.has('--dry-run'),
    quiet: args.has('--quiet') || args.has('-q'),
  };
}

function main() {
  const options = parseArgs();
  const result = syncGrok(options);
  if (!options.quiet) {
    console.log(
      `✅ Grok sync: ${result.agents} agents → ${result.files} files in ${result.grokRoot}`
    );
    if (result.dryRun) console.log('ℹ️  Dry-run: no files written');
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  syncGrok,
  buildAgentMarkdown,
  buildSkillMarkdown,
  AGENT_PROFILES,
  WORKFLOW_SKILLS,
  getSkillId,
  parseArgs,
  yamlDoubleQuoted,
  tomlBasicString,
  yamlFoldedSafe,
  resolveUnder,
  SAFE_SKILL_ID_RE,
};
