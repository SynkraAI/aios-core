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
const crypto = require('crypto');

const {
  parseAllAgents,
  normalizeCommands,
  getVisibleCommands,
} = require('../ide-sync/agent-parser');

const MANAGED_MANIFEST_FILENAME = 'aiox-managed.json';
const MANAGED_MANIFEST_GENERATOR = 'aiox-grok-skills-sync';
const GROK_RULES_TEMPLATE = path.join(
  '.aiox-core',
  'product',
  'templates',
  'ide-rules',
  'grok-rules.md'
);
const GROK_HOOK_SOURCE_FILES = [
  'enforce-git-push-authority.cjs',
  'synapse-wrapper.cjs',
  'precompact-wrapper.cjs',
  'synapse-engine.cjs',
  'precompact-session-digest.cjs',
];

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
      'Work from a Ready story under docs/framework/epics/ (framework OSS) or docs/stories/ (project L4) — never invent AC.',
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

/**
 * Lean SDC + misc workflow skills under .aiox-core/development/skills/.
 * Synced to .grok/skills/aiox-<name>/ (name already aiox-* stays as-is).
 * SOT = those SKILL.md files — prefer editing them, not inline bodies here.
 */
const DEVELOPMENT_WORKFLOW_SKILLS = [
  'validate-story-draft',
  'develop-story',
  'review-story',
  'apply-qa-fixes',
  'close-story',
  'full-sdc',
  'wave-execute',
  'aiox-commit',
];

const WORKFLOW_SKILLS = [
  {
    name: 'aiox-sdc',
    description:
      'Run the AIOX Story Development Cycle. Prefer /aiox-full-sdc (lean orchestrator). Slash: /aiox-sdc',
    body: `# AIOX Story Development Cycle (SDC)

Primary development workflow. **Task-first.** Prefer the lean orchestrator skill:

\`.aiox-core/development/skills/full-sdc/SKILL.md\` → Grok: \`/aiox-full-sdc\`

## Phases

| Phase | Skill | Agent | Task SOT |
|-------|-------|-------|----------|
| 1 Create | (sm create) | @sm | \`create-next-story.md\` |
| 2 Validate | \`validate-story-draft\` | @po | \`validate-next-story.md\` → Ready on GO |
| 3 Develop | \`develop-story\` | @dev | \`dev-develop-story.md\` |
| 4 Review | \`review-story\` | @qa | \`qa-gate.md\` — approved → **Done** |
| 4b Fix | \`apply-qa-fixes\` | @dev | \`apply-qa-fixes.md\` (QG loop ≤3) |
| 5 Close | \`close-story\` | @po | \`po-close-story.md\` — administrative |
| 6 Push | @devops | @devops | pre-push + push/PR |

## Rules

1. Never skip Validate for non-trivial work.
2. @dev must not edit AC/title/scope.
3. Only @devops may \`git push\` / create PRs.
4. Only QA review sets Status Done; close-story never changes lifecycle status.
5. Quality gates: \`npm run lint && npm run typecheck && npm test\`.
6. Constitution: \`.aiox-core/constitution.md\`
7. No product harvest trees (ARCH-A denylist).
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
];

function grokSkillIdFromDevSkill(dirName) {
  return dirName.startsWith('aiox-') ? dirName : `aiox-${dirName}`;
}

/**
 * Copy lean SDC skills from development/skills → .grok/skills/aiox-*
 * Rewrites frontmatter name to the Grok skill id when needed.
 */
function syncDevelopmentWorkflowSkills(repoRoot, targets, options = {}) {
  const written = [];
  const skillsRoot = path.join(repoRoot, '.aiox-core', 'development', 'skills');
  for (const dirName of DEVELOPMENT_WORKFLOW_SKILLS) {
    const src = path.join(skillsRoot, dirName, 'SKILL.md');
    if (!fs.existsSync(src)) {
      if (!options.quiet) {
        console.warn(`⚠️  Missing development skill ${dirName} — skipped`);
      }
      continue;
    }
    const skillId = grokSkillIdFromDevSkill(dirName);
    if (!SAFE_SKILL_ID_RE.test(skillId)) {
      if (!options.quiet) {
        console.warn(`⚠️  Invalid skill id ${JSON.stringify(skillId)} — skipped`);
      }
      continue;
    }
    let content = fs.readFileSync(src, 'utf8');
    // Ensure Grok-facing name matches directory skill id
    content = content.replace(/^name:\s*.+$/m, `name: ${skillId}`);
    if (!content.includes('metadata:')) {
      content = content.replace(
        /^---\n/,
        `---\nmetadata:\n  short-description: ${yamlDoubleQuoted(`AIOX workflow: ${skillId}`)}\n`
      );
    }
    const dest = resolveUnder(targets.skills, skillId, 'SKILL.md');
    if (!options.dryRun) {
      fs.ensureDirSync(path.dirname(dest));
      fs.writeFileSync(dest, content, 'utf8');
    }
    written.push(dest);
  }
  return written;
}

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

function isPathInside(baseDir, targetPath) {
  const relative = path.relative(path.resolve(baseDir), path.resolve(targetPath));
  return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
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

/**
 * Merge caller options over defaults, deriving dependent paths from the
 * caller's projectRoot (instead of process.cwd()) unless explicitly given.
 */
function resolveOptions(options = {}) {
  const resolved = { ...getDefaultOptions(), ...options };
  if (options.projectRoot) {
    if (!options.sourceDir) {
      resolved.sourceDir = path.join(options.projectRoot, '.aiox-core', 'development', 'agents');
    }
    if (!options.grokRoot) {
      resolved.grokRoot = path.join(options.projectRoot, '.grok');
    }
  }
  return resolved;
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

1. **Register active agent** (required for authority hooks — git push / PR):
   \`\`\`bash
   mkdir -p .aiox .synapse/sessions
   printf '%s\\n' '${agentData.id}' > .aiox/active-agent
   printf '%s\\n' '{"id":"${agentData.id}","source":"grok-agent","activated_at":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}' > .aiox/active-agent.json
   printf '%s\\n' '{"id":"${agentData.id}","source":"grok-agent","activated_at":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}' > .synapse/sessions/_active-agent.json
   export AIOX_ACTIVE_AGENT=${agentData.id}
   \`\`\`
2. Read source of truth if deep task execution is needed: \`.aiox-core/development/agents/${agentData.filename}\`
3. Greet briefly:
   - ${greeting}
   - **Role:** ${persona.role || title}
   - List 4–6 starter commands below
   - ${closing}
4. HALT for user direction unless a command was already given.

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
3. **Story-Driven** — implementation tracks a story in \`docs/framework/epics/\` (framework) or \`docs/stories/\` (project L4).
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
user-invocable: true
metadata:
  short-description: ${yamlDoubleQuoted(shortDescription)}
  aiox-agent-id: ${yamlDoubleQuoted(agentData.id)}
  aiox-source: ${yamlDoubleQuoted(sourcePath)}
---

# Activate AIOX ${title}

## Protocol

1. **Register active agent** (Constitution Article II — required before git push / PR):
   \`\`\`bash
   mkdir -p .aiox .synapse/sessions
   printf '%s\\n' '${agentData.id}' > .aiox/active-agent
   printf '%s\\n' '{"id":"${agentData.id}","source":"grok-skill","activated_at":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}' > .aiox/active-agent.json
   printf '%s\\n' '{"id":"${agentData.id}","source":"grok-skill","activated_at":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}' > .synapse/sessions/_active-agent.json
   export AIOX_ACTIVE_AGENT=${agentData.id}
   \`\`\`
2. **Load persona** from \`.grok/agents/${skillId}.md\` (session agent profile).
3. **Source of truth** for full commands/tasks: \`.aiox-core/development/agents/${agentData.filename}\`
   - Fallback only if missing: \`.codex/agents/${agentData.filename}\`
4. **Adopt** persona, authorities, and blocked operations from the agent profile.
5. **Greet** (compact):
   - Name/title/icon
   - Role one-liner
   - 4–6 starter commands
   - Optional: \`node .aiox-core/development/scripts/generate-greeting.js ${agentData.id}\`
6. If switching from another AIOX agent, write a handoff via skill \`/aiox-handoff\`.
7. **Stay in persona** until \`*exit\` or another \`/aiox-*\` skill.
${
  agentData.id === 'devops' || skillId === 'aiox-devops'
    ? `
## Remote Git (exclusive)

You are the **only** agent allowed to \`git push\` / \`gh pr create|merge\`.

Before every remote op, ensure identity is registered (step 1) **or** prefix the command:

\`\`\`bash
AIOX_ACTIVE_AGENT=devops git push
AIOX_ACTIVE_AGENT=devops gh pr create ...
\`\`\`
`
    : ''
}
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

function getCanonicalGrokHookSourceDir(projectRoot) {
  return path.join(projectRoot, '.aiox-core', 'infrastructure', 'templates', 'grok-hooks');
}

function assertCanonicalGrokHookSources(sourceDir) {
  const missingSources = GROK_HOOK_SOURCE_FILES.filter(
    (fileName) => !fs.existsSync(path.join(sourceDir, fileName))
  );
  if (missingSources.length > 0) {
    throw new Error(
      `Missing canonical Grok hook source(s) in ${sourceDir}: ${missingSources.join(', ')}`
    );
  }
}

function buildRulesMarkdown(projectRoot = process.cwd()) {
  const templatePath = path.join(projectRoot, GROK_RULES_TEMPLATE);
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Canonical Grok rules template not found: ${templatePath}`);
  }
  return fs.readFileSync(templatePath, 'utf8');
}

function getManagedRuleSections(content) {
  const sections = new Map();
  const pattern = /<!-- AIOX-MANAGED-START:\s*([a-z0-9-]+)\s*-->[\s\S]*?<!-- AIOX-MANAGED-END:\s*\1\s*-->/gi;
  for (const match of String(content || '').matchAll(pattern)) {
    sections.set(match[1].toLowerCase(), match[0]);
  }
  return sections;
}

function serializeManagedRuleSections(content) {
  return [...getManagedRuleSections(content).entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, block]) => `${name}\0${block}`)
    .join('\0');
}

function mergeGrokRules(existingContent, generatedContent) {
  const existing = String(existingContent || '');
  const generated = String(generatedContent || '');
  const generatedSections = getManagedRuleSections(generated);
  if (generatedSections.size === 0) {
    throw new Error('Canonical Grok rules template has no AIOX-MANAGED sections');
  }
  if (!existing.trim()) return generated;

  const existingSections = getManagedRuleSections(existing);
  if (existingSections.size === 0) {
    if (/^# AIOX × Grok(?: Build)? — (?:Compact|Project) Rules\s*$/m.test(existing)) {
      return generated;
    }
    return `${existing.trimEnd()}\n\n${generated}`;
  }

  let merged = existing;
  for (const [name, block] of generatedSections) {
    const sectionPattern = new RegExp(
      `<!-- AIOX-MANAGED-START:\\s*${name}\\s*-->[\\s\\S]*?<!-- AIOX-MANAGED-END:\\s*${name}\\s*-->`,
      'i'
    );
    if (sectionPattern.test(merged)) {
      merged = merged.replace(sectionPattern, block);
    } else {
      merged = `${merged.trimEnd()}\n\n${block}\n`;
    }
  }
  return merged.endsWith('\n') ? merged : `${merged}\n`;
}

function sha256(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function normalizeManagedPath(grokRoot, filePath) {
  const relative = path.relative(grokRoot, filePath).split(path.sep).join('/');
  if (!relative || relative.startsWith('../') || path.isAbsolute(relative)) {
    throw new Error(`Managed Grok path escapes root: ${filePath}`);
  }
  return relative;
}

function buildManagedManifest(grokRoot, written) {
  const files = [...new Set(written.map((filePath) => normalizeManagedPath(grokRoot, filePath)))]
    .sort()
    .map((relativePath) => {
      const absolutePath = path.join(grokRoot, ...relativePath.split('/'));
      const content = fs.readFileSync(absolutePath, 'utf8');
      const managedRules = relativePath === 'rules/aiox-core.md';
      return {
        path: relativePath,
        mode: managedRules ? 'managed-sections' : 'full',
        sha256: sha256(managedRules ? serializeManagedRuleSections(content) : content),
      };
    });
  return {
    schemaVersion: 1,
    generatedBy: MANAGED_MANIFEST_GENERATOR,
    files,
  };
}

function readManagedManifest(manifestPath, options = {}) {
  if (!fs.existsSync(manifestPath)) return null;
  // Recoverable by design: a corrupt or foreign manifest must not brick the
  // sync (the installer propagates a throw and leaves the user with manual
  // file surgery). Treat it as absent — the sync rebuilds a fresh manifest
  // and, with no stale file list, never deletes anything it does not own.
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (error) {
    if (!options.quiet) {
      console.warn(`⚠️  Corrupt Grok managed manifest (rebuilding): ${manifestPath} — ${error.message}`);
    }
    return null;
  }
  if (
    manifest?.schemaVersion !== 1 ||
    manifest?.generatedBy !== MANAGED_MANIFEST_GENERATOR ||
    !Array.isArray(manifest?.files)
  ) {
    if (!options.quiet) {
      console.warn(`⚠️  Unrecognized Grok managed manifest (rebuilding, no stale cleanup): ${manifestPath}`);
    }
    return null;
  }
  return manifest;
}

function pruneEmptyManagedParents(grokRoot, filePath) {
  let current = path.dirname(filePath);
  const root = path.resolve(grokRoot);
  while (current !== root && isPathInside(root, current)) {
    if (fs.readdirSync(current).length > 0) return;
    fs.rmdirSync(current);
    current = path.dirname(current);
  }
}

function removeStaleManagedFiles(grokRoot, previousManifest, currentManifest) {
  if (!previousManifest) return [];
  const currentPaths = new Set(currentManifest.files.map(({ path: filePath }) => filePath));
  const removed = [];
  for (const entry of previousManifest.files) {
    if (!entry?.path || currentPaths.has(entry.path)) continue;
    const target = resolveUnder(grokRoot, ...entry.path.split('/'));
    if (!fs.existsSync(target)) continue;
    if (!fs.statSync(target).isFile()) {
      throw new Error(`Refusing to remove non-file managed Grok path: ${entry.path}`);
    }
    fs.unlinkSync(target);
    pruneEmptyManagedParents(grokRoot, target);
    removed.push(target);
  }
  return removed;
}

function buildReadme() {
  return `# AIOX Grok Integration

Optimized agents, skills, roles, personas, hooks, and project config for [Grok Build TUI](https://grok.x.ai).

## Layout

| Path | Purpose |
|------|---------|
| \`agents/\` | Native Grok agent profiles (session + spawnable types) |
| \`skills/aiox-*/\` | Slash skills to activate personas |
| \`skills/aiox-sdc/\`, \`aiox-full-sdc/\`, atomics | Workflow skills (lean SDC + gates + handoff) |
| \`skills/develop-story/\`, etc. | Short aliases (\`/develop-story\` → \`/aiox-develop-story\`) |
| \`roles/\` | Subagent capability defaults |
| \`personas/\` | Behavioral overlays for subagents |
| \`rules/\` | Always-on compact AIOX rules |
| \`hooks/\` | PreToolUse git-push authority (Article II) |
| \`aiox-managed.json\` | Ownership and hashes for generated artifacts |
| \`config.toml\` | Project harness notes and native hook registration |

## Activate an agent

\`\`\`text
/aiox-dev
/aiox-qa
/aiox-devops
/aiox-squad-creator
\`\`\`

Short workflow aliases (no Claude compat required):

\`\`\`text
/develop-story
/validate-story-draft
/review-story
/full-sdc
/commit
\`\`\`

Or ask in natural language ("implement this story", "create a PR") — skill descriptions drive auto-invocation.

## Authority (git push)

\`hooks/git-push-authority.json\` runs \`enforce-git-push-authority.cjs\` on
\`Bash|run_terminal_command\`. Only devops may \`git push\` / \`gh pr create|merge\`.

Identity resolution order:

1. Env \`AIOX_ACTIVE_AGENT\` / command-scoped export
2. Bridge files written on skill/agent activation:
   - \`.aiox/active-agent\`
   - \`.aiox/active-agent.json\`
   - \`.synapse/sessions/_active-agent.json\`

Also: \`hooks/synapse-prompt.json\`, \`hooks/precompact.json\` — fully Grok-native. Their commands run wrappers vendored under \`.grok/hooks/\` from canonical sources in \`.aiox-core/infrastructure/templates/grok-hooks/\`; no Claude files are required.

Short agent spawn aliases: \`dev\`, \`po\`, \`qa\`, \`devops\`, … under \`agents/\`.

## Regenerate

From repo root:

\`\`\`bash
npm run sync:skills:grok
npm run validate:skills:grok
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
4. **Grok-native** — frontmatter \`permission_mode\`, roles, personas, hooks fully self-contained under \`.grok/hooks/\`
5. **Brownfield-safe** — only paths owned by \`aiox-managed.json\` are replaced or removed; custom project artifacts remain untouched

## Related

- Codex skills: \`npm run sync:skills:codex\`
- IDE sync: \`npm run sync:ide\`
- Constitution: \`.aiox-core/constitution.md\`
- Verify discovery: \`grok inspect\`
`;
}

// ─── Sync ───────────────────────────────────────────────────────────────────

function syncGrok(options = {}) {
  const resolved = resolveOptions(options);

  // Guard against running from a subdirectory: with a cwd-derived sourceDir a
  // missing agents dir would silently generate a near-empty .grok tree.
  if (!fs.existsSync(resolved.sourceDir)) {
    throw new Error(
      `Agent source dir not found: ${resolved.sourceDir}. ` +
      'Run from the repo root or pass { projectRoot }.'
    );
  }
  buildRulesMarkdown(resolved.projectRoot);
  assertCanonicalGrokHookSources(getCanonicalGrokHookSourceDir(resolved.projectRoot));

  const agents = [];
  for (const parsed of parseAllAgents(resolved.sourceDir)) {
    if (!parsed.error || parsed.error === 'YAML parse failed, using fallback extraction') {
      agents.push(parsed);
    } else if (!resolved.quiet) {
      console.warn(`⚠️  Agent "${parsed.id || parsed.filename || 'unknown'}" skipped: ${parsed.error}`);
    }
  }

  const written = [];
  const grok = resolved.grokRoot;
  const manifestPath = path.join(grok, MANAGED_MANIFEST_FILENAME);
  const previousManifest = readManagedManifest(manifestPath, { quiet: resolved.quiet });

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

  // Workflow skills (inline legacy: SDC index, quality-gates, handoff)
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
user-invocable: true
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

  // Lean SDC skills from .aiox-core/development/skills/ (Wave B)
  written.push(
    ...syncDevelopmentWorkflowSkills(resolved.projectRoot, targets, {
      dryRun: resolved.dryRun,
      quiet: resolved.quiet,
    })
  );

  // Short slash aliases (Claude-parity names without aiox- prefix).
  // Aliases must never point at a skill that was skipped (missing source) —
  // pass the set of targets that actually exist in this sync.
  const availableSkillTargets = new Set([
    ...agents.filter((a) => AGENT_PROFILES[a.id]).map((a) => getSkillId(a.id)),
    ...WORKFLOW_SKILLS.map(({ name }) => name),
    ...DEVELOPMENT_WORKFLOW_SKILLS.filter((dirName) =>
      fs.existsSync(
        path.join(resolved.projectRoot, '.aiox-core', 'development', 'skills', dirName, 'SKILL.md')
      )
    ).map((dirName) => grokSkillIdFromDevSkill(dirName)),
  ]);
  written.push(
    ...syncShortWorkflowAliases(targets, {
      dryRun: resolved.dryRun,
      quiet: resolved.quiet,
      availableTargets: availableSkillTargets,
    })
  );

  // Short agent type aliases (spawn_subagent subagent_type="dev", etc.)
  written.push(
    ...syncShortAgentAliases(targets, {
      dryRun: resolved.dryRun,
      quiet: resolved.quiet,
    })
  );

  // Native Grok hooks + project config (Constitution Article II, skill hygiene)
  written.push(
    ...syncGrokHarnessFiles(resolved.projectRoot, grok, {
      dryRun: resolved.dryRun,
      quiet: resolved.quiet,
    })
  );

  // Rules + README
  const rulesPath = resolveUnder(targets.rules, 'aiox-core.md');
  const generatedRules = buildRulesMarkdown(resolved.projectRoot);
  const existingRules = fs.existsSync(rulesPath) ? fs.readFileSync(rulesPath, 'utf8') : '';
  const extras = [
    { path: rulesPath, content: mergeGrokRules(existingRules, generatedRules) },
    { path: resolveUnder(grok, 'README.md'), content: buildReadme() },
  ];
  for (const file of extras) {
    if (!resolved.dryRun) {
      fs.ensureDirSync(path.dirname(file.path));
      fs.writeFileSync(file.path, file.content, 'utf8');
    }
    written.push(file.path);
  }

  let removed = [];
  if (!resolved.dryRun) {
    const manifest = buildManagedManifest(grok, written);
    removed = removeStaleManagedFiles(grok, previousManifest, manifest);
    fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  }
  written.push(manifestPath);

  return {
    agents: agents.filter((a) => AGENT_PROFILES[a.id]).length,
    files: written.length,
    written,
    grokRoot: grok,
    dryRun: resolved.dryRun,
    removed,
  };
}

/**
 * Short-name aliases for workflow skills so `/develop-story` works without Claude
 * compat (pure Grok). Bodies redirect to the aiox-* skill SOT.
 */
const SHORT_WORKFLOW_ALIASES = [
  { name: 'develop-story', target: 'aiox-develop-story' },
  { name: 'validate-story-draft', target: 'aiox-validate-story-draft' },
  { name: 'review-story', target: 'aiox-review-story' },
  { name: 'apply-qa-fixes', target: 'aiox-apply-qa-fixes' },
  { name: 'close-story', target: 'aiox-close-story' },
  { name: 'full-sdc', target: 'aiox-full-sdc' },
  { name: 'wave-execute', target: 'aiox-wave-execute' },
  { name: 'commit', target: 'aiox-commit' },
];

function buildShortAliasSkill(name, target) {
  return `---
name: ${name}
description: >
  Alias for /${target}. Use when the user runs /${name} or mentions ${name}.
user-invocable: true
metadata:
  short-description: ${yamlDoubleQuoted(`Alias → /${target}`)}
  aiox-alias-of: ${yamlDoubleQuoted(target)}
---

# ${name} (alias)

This is a **short alias** for the AIOX Grok skill \`/${target}\`.

## Protocol

1. Load and follow \`.grok/skills/${target}/SKILL.md\` exactly.
2. If that file is missing, regenerate with \`npm run sync:skills:grok\`.
3. Do not invent a parallel workflow — the aliased skill is the source of truth.
`;
}

function syncShortWorkflowAliases(targets, options = {}) {
  const written = [];
  for (const { name, target } of SHORT_WORKFLOW_ALIASES) {
    if (!SAFE_SKILL_ID_RE.test(name) || !SAFE_SKILL_ID_RE.test(target)) {
      if (!options.quiet) {
        console.warn(`⚠️  Invalid short alias ${name} → ${target} — skipped`);
      }
      continue;
    }
    // Never emit an alias whose canonical target was skipped — a redirect to
    // a missing skill validates textually but cannot run.
    if (options.availableTargets && !options.availableTargets.has(target)) {
      if (!options.quiet) {
        console.warn(`⚠️  Alias ${name} → ${target} skipped: target skill not generated`);
      }
      continue;
    }
    const dest = resolveUnder(targets.skills, name, 'SKILL.md');
    const content = buildShortAliasSkill(name, target);
    if (!options.dryRun) {
      fs.ensureDirSync(path.dirname(dest));
      fs.writeFileSync(dest, content, 'utf8');
    }
    written.push(dest);
  }
  return written;
}

/**
 * Project harness files that make Grok self-sufficient without relying only on
 * Claude-compat discovery of hooks/settings.
 */
function buildGrokConfigToml() {
  return `# AIOX × Grok Build — project config (committed)
# Docs: ~/.grok/docs/user-guide/05-configuration.md
#
# Project scope contributes [mcp_servers], [plugins], and [permission] only.
# Skill discovery prefers higher-priority .grok/skills over Claude/Codex dumps
# on name collision. Optional user-global skill hygiene lives in ~/.grok/config.toml
# (not committed).
#
# Native and Claude-compatible hook definitions share canonical commands so
# Grok deduplicates multi-harness discovery instead of executing hooks twice.
# Native authority: .grok/hooks/git-push-authority.json remains devops-only
# for git push / PR.
`;
}

function buildGrokPushAuthorityHookJson() {
  return `${JSON.stringify(
    {
      hooks: {
        PreToolUse: [
          {
            matcher: 'Bash|run_terminal_command',
            hooks: [
              {
                type: 'command',
                command: 'node .aiox-core/infrastructure/templates/grok-hooks/enforce-git-push-authority.cjs',
                timeout: 10,
              },
            ],
          },
        ],
      },
    },
    null,
    2
  )}\n`;
}

/** Native Grok hooks share canonical entrypoints with Claude compatibility. */
function buildGrokSynapseHookJson() {
  return `${JSON.stringify(
    {
      hooks: {
        UserPromptSubmit: [
          {
            hooks: [
              {
                type: 'command',
                command: 'node .aiox-core/infrastructure/templates/grok-hooks/synapse-wrapper.cjs',
                timeout: 10,
              },
            ],
          },
        ],
      },
    },
    null,
    2
  )}\n`;
}

function buildGrokPrecompactHookJson() {
  return `${JSON.stringify(
    {
      hooks: {
        PreCompact: [
          {
            hooks: [
              {
                type: 'command',
                command: 'node .aiox-core/infrastructure/templates/grok-hooks/precompact-wrapper.cjs',
                timeout: 10,
              },
            ],
          },
        ],
      },
    },
    null,
    2
  )}\n`;
}

/**
 * Short agent type aliases so spawn_subagent subagent_type="dev" works without
 * user-global Claude agents. Body points at the canonical aiox-* profile.
 */
const SHORT_AGENT_ALIASES = [
  { alias: 'dev', target: 'aiox-dev', agentId: 'dev' },
  { alias: 'qa', target: 'aiox-qa', agentId: 'qa' },
  { alias: 'po', target: 'aiox-po', agentId: 'po' },
  { alias: 'pm', target: 'aiox-pm', agentId: 'pm' },
  { alias: 'sm', target: 'aiox-sm', agentId: 'sm' },
  { alias: 'devops', target: 'aiox-devops', agentId: 'devops' },
  { alias: 'architect', target: 'aiox-architect', agentId: 'architect' },
  { alias: 'analyst', target: 'aiox-analyst', agentId: 'analyst' },
  { alias: 'data-engineer', target: 'aiox-data-engineer', agentId: 'data-engineer' },
  { alias: 'squad-creator', target: 'aiox-squad-creator', agentId: 'squad-creator' },
  { alias: 'ux-design-expert', target: 'aiox-ux-design-expert', agentId: 'ux-design-expert' },
  // Claude native short name used in some spawns / legacy docs
  { alias: 'aiox-ux', target: 'aiox-ux-design-expert', agentId: 'ux-design-expert' },
  { alias: 'master', target: 'aiox-master', agentId: 'aiox-master' },
];

function buildShortAgentAliasMarkdown(alias, target, agentId) {
  return `---
name: ${alias}
description: >
  Alias for ${target}. Spawn with subagent_type="${alias}" or use /${target}.
prompt_mode: full
model: inherit
permission_mode: default
agents_md: true
---

# Alias → \`${target}\`

You are the **${alias}** short alias for AIOX agent \`${target}\`.

## Protocol

1. Load and follow \`.grok/agents/${target}.md\` as your full persona (authorities, workflow, commands).
2. Register active agent id \`${agentId}\`:
   \`\`\`bash
   mkdir -p .aiox .synapse/sessions
   printf '%s\\n' '${agentId}' > .aiox/active-agent
   printf '%s\\n' '{"id":"${agentId}","source":"grok-alias","activated_at":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}' > .aiox/active-agent.json
   printf '%s\\n' '{"id":"${agentId}","source":"grok-alias","activated_at":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}' > .synapse/sessions/_active-agent.json
   export AIOX_ACTIVE_AGENT=${agentId}
   \`\`\`
3. Source of truth for deep tasks: \`.aiox-core/development/agents/${agentId}.md\`
4. Prefer the long skill \`/${target}\` when activating from slash commands.

Constitution: \`.aiox-core/constitution.md\`
`;
}

function syncShortAgentAliases(targets, options = {}) {
  const written = [];
  const canonicalNames = new Set();
  for (const id of Object.keys(AGENT_PROFILES)) {
    try {
      canonicalNames.add(getSkillId(id));
    } catch {
      // skip invalid ids
    }
  }

  for (const { alias, target, agentId } of SHORT_AGENT_ALIASES) {
    if (!SAFE_SKILL_ID_RE.test(alias) || !SAFE_SKILL_ID_RE.test(target)) {
      if (!options.quiet) {
        console.warn(`⚠️  Invalid agent alias ${alias} → ${target} — skipped`);
      }
      continue;
    }
    if (canonicalNames.has(alias)) {
      if (!options.quiet) {
        console.warn(
          `⚠️  Alias ${alias} collides with a canonical agent profile — skipped`
        );
      }
      continue;
    }
    const dest = resolveUnder(targets.agents, `${alias}.md`);
    const content = buildShortAgentAliasMarkdown(alias, target, agentId);
    if (!options.dryRun) {
      fs.ensureDirSync(path.dirname(dest));
      fs.writeFileSync(dest, content, 'utf8');
    }
    written.push(dest);
  }
  return written;
}

function syncGrokHarnessFiles(projectRoot, grokRoot, options = {}) {
  const written = [];
  const hooksDir = path.join(grokRoot, 'hooks');
  const sourceDir =
    options.hookSourceDir ||
    getCanonicalGrokHookSourceDir(projectRoot);
  assertCanonicalGrokHookSources(sourceDir);

  const hookJsonDest = resolveUnder(hooksDir, 'git-push-authority.json');
  const synapseJsonDest = resolveUnder(hooksDir, 'synapse-prompt.json');
  const precompactJsonDest = resolveUnder(hooksDir, 'precompact.json');
  const configDest = resolveUnder(grokRoot, 'config.toml');
  const sourceCopies = GROK_HOOK_SOURCE_FILES.map((fileName) => ({
    source: path.join(sourceDir, fileName),
    destination: resolveUnder(hooksDir, fileName),
  }));

  if (!options.dryRun) {
    fs.ensureDirSync(hooksDir);
    for (const { source, destination } of sourceCopies) {
      fs.copyFileSync(source, destination);
      written.push(destination);
    }
    fs.writeFileSync(hookJsonDest, buildGrokPushAuthorityHookJson(), 'utf8');
    fs.writeFileSync(synapseJsonDest, buildGrokSynapseHookJson(), 'utf8');
    fs.writeFileSync(precompactJsonDest, buildGrokPrecompactHookJson(), 'utf8');
    fs.writeFileSync(configDest, buildGrokConfigToml(), 'utf8');
    written.push(hookJsonDest, synapseJsonDest, precompactJsonDest, configDest);
  } else {
    written.push(
      ...sourceCopies.map(({ destination }) => destination),
      hookJsonDest,
      synapseJsonDest,
      precompactJsonDest,
      configDest
    );
  }

  return written;
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
  DEVELOPMENT_WORKFLOW_SKILLS,
  SHORT_WORKFLOW_ALIASES,
  SHORT_AGENT_ALIASES,
  syncDevelopmentWorkflowSkills,
  syncShortWorkflowAliases,
  syncShortAgentAliases,
  syncGrokHarnessFiles,
  buildRulesMarkdown,
  getManagedRuleSections,
  serializeManagedRuleSections,
  mergeGrokRules,
  buildManagedManifest,
  readManagedManifest,
  buildGrokConfigToml,
  buildGrokPushAuthorityHookJson,
  grokSkillIdFromDevSkill,
  getSkillId,
  parseArgs,
  yamlDoubleQuoted,
  tomlBasicString,
  yamlFoldedSafe,
  resolveUnder,
  SAFE_SKILL_ID_RE,
  MANAGED_MANIFEST_FILENAME,
  MANAGED_MANIFEST_GENERATOR,
  GROK_HOOK_SOURCE_FILES,
};
