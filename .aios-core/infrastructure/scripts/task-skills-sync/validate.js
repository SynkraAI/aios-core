#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const { parseAllTasks } = require('../ide-sync/task-parser');
const { parseAllAgents } = require('../ide-sync/agent-parser');
const { isParsableAgent } = require('../skills-sync/contracts');
const {
  getTaskSkillId,
  normalizeAgentSlug,
  getAgentSourceFilename,
} = require('../skills-sync/renderers/task-skill');

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
    scope: 'full',
    fallbackAgent: 'master',
    strict: false,
    quiet: false,
    json: false,
  };
}

function parseArgs(argv = process.argv.slice(2)) {
  const options = {
    strict: false,
    quiet: false,
    json: false,
    catalogPath: undefined,
    scope: 'full',
    fallbackAgent: 'master',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--strict') {
      options.strict = true;
      continue;
    }

    if (arg === '--quiet' || arg === '-q') {
      options.quiet = true;
      continue;
    }

    if (arg === '--json') {
      options.json = true;
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

function parseScope(value) {
  const normalized = String(value || 'full').trim().toLowerCase();
  const scope = normalized || 'full';

  if (!SUPPORTED_SCOPES.includes(scope)) {
    throw new Error(`Unsupported task-skill scope: ${scope}`);
  }

  return scope;
}

function normalizeAllowlist(catalog, validAgentSlugs, aliasMap = new Map()) {
  const entries = [];
  const duplicates = [];
  const missingAgent = [];
  const invalidAgent = [];
  const seen = new Set();

  for (const row of catalog.allowlist) {
    const taskId = normalizeTaskId(row && row.task_id);
    if (!taskId) continue;

    if (seen.has(taskId)) {
      duplicates.push(taskId);
      continue;
    }

    seen.add(taskId);
    const agent = canonicalizeAgent(row && row.agent, aliasMap);
    if (!agent) {
      missingAgent.push(taskId);
      continue;
    }

    if (validAgentSlugs && !validAgentSlugs.has(agent)) {
      invalidAgent.push({ taskId, agent });
      continue;
    }

    entries.push({
      taskId,
      agent,
      enabled: row.enabled !== false,
      targets: row.targets || {},
    });
  }

  return {
    entries: entries.sort((left, right) => left.taskId.localeCompare(right.taskId)),
    duplicates,
    missingAgent,
    invalidAgent,
  };
}

function resolveFallbackAgent(value, validAgentSlugs, aliasMap = new Map()) {
  const fallbackAgent = canonicalizeAgent(value || 'master', aliasMap);
  if (!fallbackAgent) {
    throw new Error('Task skills validation fallback agent cannot be empty');
  }

  if (validAgentSlugs && !validAgentSlugs.has(fallbackAgent)) {
    throw new Error(`Task skills validation fallback agent is invalid: ${fallbackAgent}`);
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
    const agent = isDeclaredAgentValid ? declaredAgent : fallback;

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
    },
  };
}

function resolveEnabledTargets(catalog, projectRoot) {
  const targets = [];

  for (const [targetName, config] of Object.entries(catalog.targets || {})) {
    if (!config || config.enabled !== true) continue;

    const relPath = String(config.path || '').trim();
    if (!relPath) continue;

    targets.push({
      name: targetName,
      relPath,
      absPath: path.resolve(projectRoot, relPath),
    });
  }

  return targets.sort((left, right) => left.name.localeCompare(right.name));
}

function isEnabledForTarget(entry, targetName) {
  if (!entry.enabled) return false;

  if (entry.targets && Object.prototype.hasOwnProperty.call(entry.targets, targetName)) {
    return entry.targets[targetName] === true;
  }

  return true;
}

function toAgentSkillId(agentId) {
  const normalized = String(agentId || '').trim();
  if (normalized === 'aios-master') return 'aios-master';
  if (normalized.startsWith('aios-')) return normalized.slice(5);
  return normalized;
}

function toAgentSlug(agentId) {
  return normalizeAgentSlug(agentId);
}

function validateTaskSkillContent(content, expected) {
  const issues = [];

  const checks = [
    {
      ok: content.includes(`name: ${expected.skillId}`),
      reason: `missing frontmatter name "${expected.skillId}"`,
    },
    {
      ok: content.includes(`.aios-core/development/tasks/${expected.filename}`),
      reason: `missing canonical task path "${expected.filename}"`,
    },
    {
      ok: content.includes(`.aios-core/development/agents/${expected.agentFilename}`),
      reason: `missing owner agent preload "${expected.agentFilename}"`,
    },
    {
      ok: content.includes('AIOS Task Skill'),
      reason: 'missing AIOS task skill header',
    },
  ];

  for (const check of checks) {
    if (!check.ok) {
      issues.push(check.reason);
    }
  }

  return issues;
}

function listTaskSkillDirs(skillsDir) {
  if (!fs.existsSync(skillsDir)) return [];

  return fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => fs.existsSync(path.join(skillsDir, entry.name, 'SKILL.md')))
    .filter((entry) => {
      try {
        const content = fs.readFileSync(path.join(skillsDir, entry.name, 'SKILL.md'), 'utf8');
        return content.includes('.aios-core/development/tasks/');
      } catch (_) {
        return false;
      }
    })
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
}

function validateTaskSkills(options = {}) {
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
  const errors = [];
  const warnings = [];
  let scope;

  try {
    scope = parseScope(resolved.scope);
  } catch (error) {
    return {
      ok: false,
      errors: [error.message],
      warnings,
      metrics: {
        sourceTasks: 0,
        catalogTasks: 0,
        expectedTasks: 0,
        autoMappedTasks: 0,
        checkedSkills: 0,
      },
    };
  }

  let catalog;
  try {
    catalog = readCatalog(resolved.catalogPath);
  } catch (error) {
    return {
      ok: false,
      errors: [error.message],
      warnings,
      metrics: {
        sourceTasks: 0,
        catalogTasks: 0,
        expectedTasks: 0,
        autoMappedTasks: 0,
        checkedSkills: 0,
      },
    };
  }
  const aliasMap = buildAliasMap(catalog);

  const parsedAgents = parseAllAgents(resolved.sourceAgentsDir)
    .filter(isParsableAgent);
  const validAgentSlugs = new Set(parsedAgents.map((agent) => toAgentSlug(agent.id)).filter(Boolean));

  if (validAgentSlugs.size === 0) {
    errors.push(`No parseable agents found in source: ${path.relative(resolved.projectRoot, resolved.sourceAgentsDir)}`);
  }

  const { entries, duplicates, missingAgent, invalidAgent } = normalizeAllowlist(
    catalog,
    validAgentSlugs,
    aliasMap,
  );
  if (duplicates.length > 0) {
    errors.push(`Duplicate task_id in task skill catalog: ${duplicates.join(', ')}`);
  }
  if (missingAgent.length > 0) {
    errors.push(`Task skill catalog entries missing agent: ${missingAgent.join(', ')}`);
  }
  if (invalidAgent.length > 0) {
    errors.push(
      `Task skill catalog has invalid agent mapping: ${invalidAgent.map((entry) => `${entry.taskId}->${entry.agent}`).join(', ')}`,
    );
  }

  if (scope === 'catalog' && entries.length === 0) {
    warnings.push('Task skill catalog allowlist is empty');
  }

  const parsedTasks = parseAllTasks(resolved.sourceDir).filter((task) => !task.error);
  const tasksById = new Map(parsedTasks.map((task) => [task.id, task]));

  for (const entry of entries) {
    if (!entry.enabled) continue;
    if (!tasksById.has(entry.taskId)) {
      errors.push(`Task from catalog not found in source: ${entry.taskId}`);
    }
  }

  let scoped;
  try {
    scoped = buildScopedEntries({
      scope,
      catalogEntries: entries,
      parsedTasks,
      validAgentSlugs,
      fallbackAgent: resolved.fallbackAgent,
      aliasMap,
    });
  } catch (error) {
    errors.push(error.message);
    scoped = {
      entries: entries,
      metadata: {
        fallbackAgent: null,
        autoMapped: 0,
      },
    };
  }
  const effectiveEntries = scoped.entries;

  const agentSkillIds = new Set(parsedAgents.map((agent) => toAgentSkillId(agent.id)));

  for (const entry of effectiveEntries) {
    if (!entry.enabled) continue;
    const skillId = getTaskSkillId(entry.taskId, entry.agent);
    if (agentSkillIds.has(skillId)) {
      errors.push(`Task skill id collides with agent skill id: ${skillId}`);
    }
  }

  const targets = resolveEnabledTargets(catalog, resolved.projectRoot);
  if (targets.length === 0) {
    warnings.push('No enabled targets in task skill catalog');
  }

  let checkedSkills = 0;

  for (const target of targets) {
    const expected = effectiveEntries
      .filter((entry) => isEnabledForTarget(entry, target.name))
      .map((entry) => ({
        ...entry,
        skillId: getTaskSkillId(entry.taskId, entry.agent),
      }));

    if (expected.length > 0 && !fs.existsSync(target.absPath)) {
      errors.push(`Missing task skill target dir: ${path.relative(resolved.projectRoot, target.absPath)}`);
      continue;
    }

    for (const item of expected) {
      const task = tasksById.get(item.taskId);
      if (!task) continue;

      const skillPath = path.join(target.absPath, item.skillId, 'SKILL.md');
      if (!fs.existsSync(skillPath)) {
        errors.push(`Missing task skill file: ${path.relative(resolved.projectRoot, skillPath)}`);
        continue;
      }

      let content = '';
      try {
        content = fs.readFileSync(skillPath, 'utf8');
      } catch (error) {
        errors.push(`${item.skillId}: unable to read skill file (${error.message})`);
        continue;
      }

      const issues = validateTaskSkillContent(content, {
        skillId: item.skillId,
        filename: task.filename,
        agentFilename: getAgentSourceFilename(item.agent),
      });
      for (const issue of issues) {
        errors.push(`${item.skillId}: ${issue}`);
      }

      checkedSkills += 1;
    }

    if (resolved.strict) {
      const expectedSkillIds = new Set(expected.map((item) => item.skillId));
      const actualSkillIds = listTaskSkillDirs(target.absPath);

      for (const actualSkillId of actualSkillIds) {
        if (!expectedSkillIds.has(actualSkillId)) {
          errors.push(`Orphaned task skill directory: ${path.join(path.relative(resolved.projectRoot, target.absPath), actualSkillId)}`);
        }
      }
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    metrics: {
      scope,
      sourceTasks: parsedTasks.length,
      catalogTasks: entries.filter((entry) => entry.enabled).length,
      expectedTasks: effectiveEntries.filter((entry) => entry.enabled).length,
      autoMappedTasks: scoped.metadata.autoMapped,
      fallbackAgent: scoped.metadata.fallbackAgent,
      checkedSkills,
    },
  };
}

function formatHumanReport(result) {
  if (result.ok) {
    const lines = [
      `✅ Task skills validation passed (${result.metrics.checkedSkills} skills checked)`,
    ];

    if (result.warnings.length > 0) {
      lines.push(...result.warnings.map((warning) => `⚠️ ${warning}`));
    }

    return lines.join('\n');
  }

  const lines = [
    `❌ Task skills validation failed (${result.errors.length} issue(s))`,
    ...result.errors.map((error) => `- ${error}`),
  ];

  if (result.warnings.length > 0) {
    lines.push(...result.warnings.map((warning) => `⚠️ ${warning}`));
  }

  return lines.join('\n');
}

function main() {
  const args = parseArgs();
  const runtimeOptions = { ...args };

  if (args.catalogPath) {
    runtimeOptions.catalogPath = path.resolve(process.cwd(), args.catalogPath);
  } else {
    delete runtimeOptions.catalogPath;
  }

  const result = validateTaskSkills(runtimeOptions);

  if (!args.quiet) {
    if (args.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatHumanReport(result));
    }
  }

  if (!result.ok) {
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  SUPPORTED_SCOPES,
  getDefaultOptions,
  parseArgs,
  readCatalog,
  normalizeAllowlist,
  buildAliasMap,
  canonicalizeAgent,
  parseScope,
  resolveFallbackAgent,
  extractDeclaredAgent,
  buildScopedEntries,
  resolveEnabledTargets,
  isEnabledForTarget,
  validateTaskSkillContent,
  listTaskSkillDirs,
  validateTaskSkills,
  formatHumanReport,
};
