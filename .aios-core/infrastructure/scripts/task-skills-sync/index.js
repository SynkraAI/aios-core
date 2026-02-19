#!/usr/bin/env node
'use strict';

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');

const { parseAllAgents } = require('../ide-sync/agent-parser');
const { parseAllTasks } = require('../ide-sync/task-parser');
const { isParsableAgent } = require('../skills-sync/contracts');
const { getTaskSkillId, normalizeAgentSlug, buildClaudeTaskSkillContent } = require('../skills-sync/renderers/task-skill');
const {
  buildTaskSpecsFromParsedTasks,
  buildTaskSkillPlan,
  writeSkillPlan,
} = require('../skills-sync');

const SUPPORTED_TARGETS = ['codex', 'claude', 'gemini'];
const SUPPORTED_SCOPES = ['catalog', 'full'];

function getDefaultOptions(projectRoot = process.cwd()) {
  return {
    projectRoot,
    sourceDir: path.join(projectRoot, '.aios-core', 'development', 'tasks'),
    sourceAgentsDir: path.join(projectRoot, '.aios-core', 'development', 'agents'),
    catalogPath: path.join(
      projectRoot,
      '.aios-core',
      'infrastructure',
      'contracts',
      'task-skill-catalog.yaml',
    ),
    target: 'all',
    scope: 'full',
    fallbackAgent: 'master',
    dryRun: false,
    prune: true,
    quiet: false,
  };
}

function parseArgs(argv = process.argv.slice(2)) {
  const options = {
    target: 'all',
    scope: 'full',
    fallbackAgent: 'master',
    dryRun: false,
    prune: true,
    quiet: false,
    catalogPath: undefined,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--target' && argv[i + 1]) {
      options.target = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg.startsWith('--target=')) {
      options.target = arg.slice('--target='.length);
      continue;
    }

    if (arg === '--scope' && argv[i + 1]) {
      options.scope = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg.startsWith('--scope=')) {
      options.scope = arg.slice('--scope='.length);
      continue;
    }

    if (arg === '--full') {
      options.scope = 'full';
      continue;
    }

    if (arg === '--fallback-agent' && argv[i + 1]) {
      options.fallbackAgent = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg.startsWith('--fallback-agent=')) {
      options.fallbackAgent = arg.slice('--fallback-agent='.length);
      continue;
    }

    if (arg === '--catalog' && argv[i + 1]) {
      options.catalogPath = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg.startsWith('--catalog=')) {
      options.catalogPath = arg.slice('--catalog='.length);
      continue;
    }

    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }

    if (arg === '--no-prune') {
      options.prune = false;
      continue;
    }

    if (arg === '--quiet' || arg === '-q') {
      options.quiet = true;
    }
  }

  return options;
}

function readCatalog(catalogPath) {
  if (!fs.existsSync(catalogPath)) {
    throw new Error(`Task skill catalog not found: ${catalogPath}`);
  }

  const raw = fs.readFileSync(catalogPath, 'utf8');
  const parsed = yaml.load(raw) || {};

  if (!Array.isArray(parsed.allowlist)) {
    throw new Error('Task skill catalog must define an allowlist array');
  }

  if (!parsed.targets || typeof parsed.targets !== 'object') {
    throw new Error('Task skill catalog must define targets');
  }

  return parsed;
}

function normalizeTaskId(value) {
  return String(value || '').trim().replace(/^aios-task-/, '');
}

function canonicalizeAgent(value, aliasMap = new Map()) {
  const normalized = normalizeAgentSlug(value).replace(/_/g, '-');
  return aliasMap.get(normalized) || normalized;
}

function buildAliasMap(catalog = {}) {
  const aliasMap = new Map();
  const aliases = catalog && typeof catalog.agent_aliases === 'object'
    ? catalog.agent_aliases
    : {};

  for (const [alias, target] of Object.entries(aliases)) {
    const normalizedAlias = normalizeAgentSlug(alias).replace(/_/g, '-');
    const normalizedTarget = normalizeAgentSlug(target).replace(/_/g, '-');
    if (!normalizedAlias || !normalizedTarget) continue;
    aliasMap.set(normalizedAlias, normalizedTarget);
  }

  return aliasMap;
}

function getCanonicalAgentSlugs(sourceAgentsDir) {
  const parsedAgents = parseAllAgents(sourceAgentsDir).filter(isParsableAgent);
  const slugs = new Set(parsedAgents.map((agent) => normalizeAgentSlug(agent.id)).filter(Boolean));

  if (slugs.size === 0) {
    throw new Error(`No parseable agents found in source dir: ${sourceAgentsDir}`);
  }

  return slugs;
}

function parseRequestedTargets(value) {
  const normalized = String(value || 'all').trim();
  if (!normalized || normalized === 'all') {
    return SUPPORTED_TARGETS;
  }

  const requested = normalized
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

  const invalid = requested.filter((name) => !SUPPORTED_TARGETS.includes(name));
  if (invalid.length > 0) {
    throw new Error(`Unsupported task-skill target(s): ${invalid.join(', ')}`);
  }

  return [...new Set(requested)];
}

function parseScope(value) {
  const normalized = String(value || 'full').trim().toLowerCase();
  const scope = normalized || 'full';

  if (!SUPPORTED_SCOPES.includes(scope)) {
    throw new Error(`Unsupported task-skill scope: ${scope}`);
  }

  return scope;
}

function resolveTargets(catalog, options) {
  const requestedTargets = parseRequestedTargets(options.target);
  const targets = [];

  for (const targetName of requestedTargets) {
    const config = catalog.targets[targetName];
    if (!config || config.enabled !== true) {
      continue;
    }

    const relPath = String(config.path || '').trim();
    if (!relPath) {
      throw new Error(`Task skill target "${targetName}" is missing path in catalog`);
    }

    targets.push({
      name: targetName,
      relPath,
      absPath: path.resolve(options.projectRoot, relPath),
    });
  }

  if (targets.length === 0) {
    throw new Error('No enabled task-skill targets resolved from catalog/flags');
  }

  return targets;
}

function normalizeAllowlistEntries(catalog, validAgentSlugs, aliasMap = new Map()) {
  const entries = [];
  const seen = new Set();

  for (const row of catalog.allowlist) {
    const taskId = normalizeTaskId(row && row.task_id);
    if (!taskId) {
      continue;
    }

    if (seen.has(taskId)) {
      throw new Error(`Duplicate task_id in task skill catalog: ${taskId}`);
    }

    const agent = canonicalizeAgent(row && row.agent, aliasMap);
    if (!agent) {
      throw new Error(`Task skill catalog entry missing agent for task_id: ${taskId}`);
    }

    if (validAgentSlugs && !validAgentSlugs.has(agent)) {
      throw new Error(`Task skill catalog has invalid agent "${agent}" for task_id: ${taskId}`);
    }

    seen.add(taskId);
    entries.push({
      taskId,
      agent,
      enabled: row.enabled !== false,
      targets: row.targets || {},
    });
  }

  return entries.sort((left, right) => left.taskId.localeCompare(right.taskId));
}

function resolveFallbackAgent(value, validAgentSlugs, aliasMap = new Map()) {
  const fallbackAgent = canonicalizeAgent(value || 'master', aliasMap);
  if (!fallbackAgent) {
    throw new Error('Task skill sync fallback agent cannot be empty');
  }

  if (validAgentSlugs && !validAgentSlugs.has(fallbackAgent)) {
    throw new Error(`Task skill sync fallback agent is invalid: ${fallbackAgent}`);
  }

  return fallbackAgent;
}

function extractDeclaredAgent(task = {}, aliasMap = new Map()) {
  const fromFrontmatter = task.frontmatter && task.frontmatter.agent;
  const fromTaskDefinition = task.taskDefinition && task.taskDefinition.agent;
  const raw = String(task.raw || '');
  const ownerMatch = raw.match(/owner\s+agent\s*:\s*@?([a-z0-9-]+)/i);
  const markdownAgentMatch = raw.match(/\*\*\s*(?:owner\s+)?agent:\s*\*\*\s*@?([a-z0-9-]+)/i);
  const markdownLabelMatch = raw.match(/(?:^|\n)\s*>?\s*\*{0,2}\s*(?:owner\s+)?agent\s*\*{0,2}\s*:\s*@?([a-z0-9-]+)/i);
  const inlineMatch = raw.match(/^\s*agent\s*:\s*["']?@?([a-z0-9-]+)["']?\s*$/im);

  return canonicalizeAgent(
    fromFrontmatter
      || fromTaskDefinition
      || (ownerMatch ? ownerMatch[1] : '')
      || (markdownAgentMatch ? markdownAgentMatch[1] : '')
      || (markdownLabelMatch ? markdownLabelMatch[1] : '')
      || (inlineMatch ? inlineMatch[1] : ''),
    aliasMap,
  );
}

/**
 * Infer agent from task filename prefix.
 * Used as fallback when no agent: frontmatter exists.
 * Longest-prefix-first to avoid false matches (e.g., "squad-creator-" before "squad-").
 */
function inferAgentFromFilename(taskId, aliasMap = new Map()) {
  const KNOWN_PREFIXES = [
    'squad-creator-',
    'github-devops-',
    'ux-design-expert-',
    'data-engineer-',
    'architect-',
    'analyst-',
    'devops-',
    'dev-',
    'qa-',
    'po-',
    'sm-',
    'pm-',
    'ux-',
    'db-',
  ];
  for (const prefix of KNOWN_PREFIXES) {
    if (taskId.startsWith(prefix)) {
      const slug = prefix.slice(0, -1);
      return aliasMap.get(slug) || slug;
    }
  }
  return null;
}

function buildScopedEntries({
  scope,
  catalogEntries,
  parsedTasks,
  validAgentSlugs,
  fallbackAgent,
  aliasMap,
}) {
  if (scope !== 'full') {
    return {
      entries: catalogEntries,
      metadata: {
        fallbackAgent: null,
        autoMapped: 0,
        catalogMapped: catalogEntries.length,
      },
    };
  }

  const fallback = resolveFallbackAgent(fallbackAgent, validAgentSlugs, aliasMap);
  const byTaskId = new Map((catalogEntries || []).map((entry) => [entry.taskId, entry]));
  const entries = [];
  let autoMapped = 0;

  for (const task of parsedTasks || []) {
    if (!task || task.error) continue;

    const existing = byTaskId.get(task.id);
    if (existing) {
      entries.push(existing);
      continue;
    }

    const declaredAgent = extractDeclaredAgent(task, aliasMap);
    const isDeclaredAgentValid = declaredAgent && validAgentSlugs.has(declaredAgent);
    const inferredAgent = isDeclaredAgentValid ? null : inferAgentFromFilename(task.id, aliasMap);
    const isInferredAgentValid = inferredAgent && validAgentSlugs.has(inferredAgent);
    const agent = isDeclaredAgentValid ? declaredAgent : (isInferredAgentValid ? inferredAgent : fallback);

    entries.push({
      taskId: task.id,
      agent,
      enabled: true,
      targets: {},
    });
    autoMapped += 1;
  }

  return {
    entries: entries.sort((left, right) => left.taskId.localeCompare(right.taskId)),
    metadata: {
      fallbackAgent: fallback,
      autoMapped,
      catalogMapped: entries.length - autoMapped,
    },
  };
}

function isEntryEnabledForTarget(entry, targetName) {
  if (!entry.enabled) return false;

  if (entry.targets && Object.prototype.hasOwnProperty.call(entry.targets, targetName)) {
    return entry.targets[targetName] === true;
  }

  return true;
}

function collectSelectedTaskSpecs(entries, taskSpecsById, targetName) {
  const specs = [];
  const skillIds = [];

  for (const entry of entries) {
    if (!isEntryEnabledForTarget(entry, targetName)) {
      continue;
    }

    const spec = taskSpecsById.get(entry.taskId);
    if (!spec) {
      throw new Error(`Task from catalog not found in source: ${entry.taskId}`);
    }

    specs.push({
      ...spec,
      agent: entry.agent,
    });
    skillIds.push(getTaskSkillId(entry.taskId, entry.agent));
  }

  return {
    specs,
    expectedSkillIds: skillIds,
  };
}

function pruneOrphanTaskSkills(targetDir, expectedSkillIds, options = {}) {
  const resolved = { dryRun: false, ...options };

  if (!fs.existsSync(targetDir)) {
    return [];
  }

  const expected = new Set(expectedSkillIds || []);
  const existing = fs.readdirSync(targetDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((skillId) => {
      const skillPath = path.join(targetDir, skillId, 'SKILL.md');
      if (!fs.existsSync(skillPath)) return false;

      try {
        const content = fs.readFileSync(skillPath, 'utf8');
        return content.includes('.aios-core/development/tasks/');
      } catch (_) {
        return false;
      }
    })
    .sort((left, right) => left.localeCompare(right));

  const orphaned = existing.filter((skillId) => !expected.has(skillId));

  if (!resolved.dryRun) {
    for (const skillId of orphaned) {
      fs.removeSync(path.join(targetDir, skillId));
    }
  }

  return orphaned;
}

function syncTaskSkills(options = {}) {
  const projectRoot = options.projectRoot || process.cwd();
  const resolved = {
    ...getDefaultOptions(projectRoot),
    ...options,
    projectRoot,
    sourceDir: options.sourceDir || path.join(projectRoot, '.aios-core', 'development', 'tasks'),
    sourceAgentsDir: options.sourceAgentsDir || path.join(projectRoot, '.aios-core', 'development', 'agents'),
    catalogPath: options.catalogPath || path.join(
      projectRoot,
      '.aios-core',
      'infrastructure',
      'contracts',
      'task-skill-catalog.yaml',
    ),
  };

  const scope = parseScope(resolved.scope);
  const catalog = readCatalog(resolved.catalogPath);
  const aliasMap = buildAliasMap(catalog);
  const targets = resolveTargets(catalog, resolved);
  const validAgentSlugs = getCanonicalAgentSlugs(resolved.sourceAgentsDir);
  const parsedTasks = parseAllTasks(resolved.sourceDir);
  const taskSpecs = buildTaskSpecsFromParsedTasks(parsedTasks);
  const taskSpecsById = new Map(taskSpecs.map((task) => [task.id, task]));
  const catalogEntries = normalizeAllowlistEntries(catalog, validAgentSlugs, aliasMap);
  const scoped = buildScopedEntries({
    scope,
    catalogEntries,
    parsedTasks,
    validAgentSlugs,
    fallbackAgent: resolved.fallbackAgent,
    aliasMap,
  });
  const entries = scoped.entries;

  const targetResults = [];

  for (const target of targets) {
    const selected = collectSelectedTaskSpecs(entries, taskSpecsById, target.name);
    const contentBuilder = target.name === 'claude' ? buildClaudeTaskSkillContent : undefined;
    const plan = buildTaskSkillPlan(selected.specs, target.absPath, contentBuilder);
    writeSkillPlan(plan, resolved);

    const pruned = resolved.prune
      ? pruneOrphanTaskSkills(target.absPath, selected.expectedSkillIds, resolved)
      : [];

    targetResults.push({
      target: target.name,
      targetPath: target.relPath,
      generated: plan.length,
      pruned,
    });
  }

  return {
    catalogPath: path.relative(resolved.projectRoot, resolved.catalogPath),
    sourceDir: path.relative(resolved.projectRoot, resolved.sourceDir),
    scope,
    fallbackAgent: scoped.metadata.fallbackAgent,
    sourceTasks: taskSpecs.length,
    selectedTasks: entries.filter((entry) => entry.enabled).length,
    autoMappedTasks: scoped.metadata.autoMapped,
    dryRun: resolved.dryRun,
    targets: targetResults,
  };
}

function formatSummary(result) {
  const lines = [
    `✅ Task skills sync complete (${result.targets.reduce((sum, target) => sum + target.generated, 0)} generated)`,
    `- catalog: ${result.catalogPath}`,
    `- source: ${result.sourceDir}`,
    `- scope: ${result.scope}`,
    `- tasks: ${result.selectedTasks}/${result.sourceTasks}`,
  ];

  if (result.scope === 'full') {
    lines.push(`- auto-mapped: ${result.autoMappedTasks} (fallback: ${result.fallbackAgent})`);
  }

  for (const target of result.targets) {
    lines.push(`- ${target.target}: ${target.generated} generated${target.pruned.length > 0 ? `, ${target.pruned.length} pruned` : ''}`);
  }

  if (result.dryRun) {
    lines.push('ℹ️ Dry-run mode: no files written');
  }

  return lines.join('\n');
}

function main() {
  const cli = parseArgs();
  const runtimeOptions = { ...cli };

  if (cli.catalogPath) {
    runtimeOptions.catalogPath = path.resolve(process.cwd(), cli.catalogPath);
  } else {
    delete runtimeOptions.catalogPath;
  }

  const result = syncTaskSkills(runtimeOptions);

  if (!cli.quiet) {
    console.log(formatSummary(result));
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  SUPPORTED_TARGETS,
  SUPPORTED_SCOPES,
  getDefaultOptions,
  parseArgs,
  readCatalog,
  parseScope,
  parseRequestedTargets,
  resolveTargets,
  normalizeAllowlistEntries,
  buildAliasMap,
  canonicalizeAgent,
  resolveFallbackAgent,
  extractDeclaredAgent,
  inferAgentFromFilename,
  buildScopedEntries,
  getCanonicalAgentSlugs,
  collectSelectedTaskSpecs,
  isEntryEnabledForTarget,
  pruneOrphanTaskSkills,
  syncTaskSkills,
  formatSummary,
};
