#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const { parseAllAgents } = require('../ide-sync/agent-parser');
const { parseAllTasks } = require('../ide-sync/task-parser');
const { getTaskSkillId, normalizeAgentSlug } = require('../skills-sync/renderers/task-skill');
const {
  readCatalog: readTaskSkillCatalog,
  normalizeAllowlist,
  buildAliasMap: buildTaskAliasMap,
  buildScopedEntries,
} = require('../task-skills-sync/validate');
const { getSkillId } = require('./index');

function normalizeTaskId(value) {
  return String(value || '').trim().replace(/^aios-task-/, '');
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

function canonicalizeAgent(value, aliasMap = new Map()) {
  const normalized = normalizeAgentSlug(value).replace(/_/g, '-');
  return aliasMap.get(normalized) || normalized;
}

function loadExpectedCodexTaskSkillIds(projectRoot, catalogPath) {
  const resolvedCatalogPath = catalogPath
    || path.join(projectRoot, '.aios-core', 'infrastructure', 'contracts', 'task-skill-catalog.yaml');

  if (!fs.existsSync(resolvedCatalogPath)) {
    return new Set();
  }

  let parsed;
  try {
    parsed = yaml.load(fs.readFileSync(resolvedCatalogPath, 'utf8')) || {};
  } catch (_) {
    return new Set();
  }

  const aliasMap = buildAliasMap(parsed);

  const codexConfig = parsed.targets && parsed.targets.codex ? parsed.targets.codex : null;
  if (!codexConfig || codexConfig.enabled !== true) {
    return new Set();
  }

  const allowlist = Array.isArray(parsed.allowlist) ? parsed.allowlist : [];
  const expected = new Set();

  for (const row of allowlist) {
    if (!row || row.enabled === false) continue;

    if (row.targets && Object.prototype.hasOwnProperty.call(row.targets, 'codex')) {
      if (row.targets.codex !== true) {
        continue;
      }
    }

    const taskId = normalizeTaskId(row.task_id);
    if (!taskId) continue;
    const agent = canonicalizeAgent(row.agent, aliasMap);
    if (!agent) continue;
    expected.add(getTaskSkillId(taskId, agent));
  }

  return expected;
}

function loadSourceDerivedCodexTaskSkillIds(options = {}) {
  const resolved = {
    projectRoot: process.cwd(),
    sourceTasksDir: '',
    sourceAgentsDir: '',
    taskSkillCatalogPath: path.join(
      process.cwd(),
      '.aios-core',
      'infrastructure',
      'contracts',
      'task-skill-catalog.yaml',
    ),
    fallbackAgent: 'master',
    ...options,
  };

  if (!fs.existsSync(resolved.sourceTasksDir) || !fs.existsSync(resolved.sourceAgentsDir)) {
    return new Set();
  }

  // Keep Codex strict-mode aligned with task-skills-sync scope=full mapping
  // (catalog aliases + declared owners + fallback owner), not cartesian products.
  let catalog;
  try {
    catalog = readTaskSkillCatalog(resolved.taskSkillCatalogPath);
  } catch (_) {
    catalog = {
      allowlist: [],
      targets: {},
      agent_aliases: {},
    };
  }

  const aliasMap = buildTaskAliasMap(catalog);
  const parsedAgents = parseAllAgents(resolved.sourceAgentsDir).filter(isParsableAgent);
  const validAgentSlugs = new Set(parsedAgents.map((agent) => normalizeAgentSlug(agent.id)).filter(Boolean));
  const parsedTasks = parseAllTasks(resolved.sourceTasksDir).filter((task) => !task.error);
  const { entries } = normalizeAllowlist(catalog, validAgentSlugs, aliasMap);

  let scoped;
  try {
    scoped = buildScopedEntries({
      scope: 'full',
      catalogEntries: entries,
      parsedTasks,
      validAgentSlugs,
      fallbackAgent: resolved.fallbackAgent,
      aliasMap,
    });
  } catch (_) {
    return new Set();
  }

  return new Set(
    scoped.entries
      .filter((entry) => entry.enabled !== false)
      .map((entry) => getTaskSkillId(entry.taskId, entry.agent)),
  );
}

function getDefaultOptions(projectRoot = process.cwd()) {
  return {
    projectRoot,
    sourceDir: path.join(projectRoot, '.aios-core', 'development', 'agents'),
    sourceTasksDir: path.join(projectRoot, '.aios-core', 'development', 'tasks'),
    skillsDir: path.join(projectRoot, '.codex', 'skills'),
    taskSkillCatalogPath: path.join(
      projectRoot,
      '.aios-core',
      'infrastructure',
      'contracts',
      'task-skill-catalog.yaml',
    ),
    strict: false,
    quiet: false,
    json: false,
  };
}

function parseArgs(argv = process.argv.slice(2)) {
  const args = new Set(argv);
  return {
    strict: args.has('--strict'),
    quiet: args.has('--quiet') || args.has('-q'),
    json: args.has('--json'),
  };
}

function isParsableAgent(agent) {
  return !agent.error || agent.error === 'YAML parse failed, using fallback extraction';
}

function validateSkillContent(content, expected) {
  const issues = [];
  const requiredChecks = [
    { ok: content.includes(`name: ${expected.skillId}`), reason: `missing frontmatter name "${expected.skillId}"` },
    {
      ok: content.includes(`.aios-core/development/agents/${expected.filename}`),
      reason: `missing canonical agent path "${expected.filename}"`,
    },
    // generate-greeting.js removed — greeting is now inline in agent activation flow
    {
      ok: content.includes('source of truth'),
      reason: 'missing source-of-truth activation note',
    },
  ];

  for (const check of requiredChecks) {
    if (!check.ok) {
      issues.push(check.reason);
    }
  }

  return issues;
}

function validateCodexSkills(options = {}) {
  const projectRoot = options.projectRoot || process.cwd();
  const resolved = {
    ...getDefaultOptions(projectRoot),
    ...options,
    projectRoot,
    sourceDir: options.sourceDir || path.join(projectRoot, '.aios-core', 'development', 'agents'),
    sourceTasksDir: options.sourceTasksDir || path.join(projectRoot, '.aios-core', 'development', 'tasks'),
    skillsDir: options.skillsDir || path.join(projectRoot, '.codex', 'skills'),
    taskSkillCatalogPath: options.taskSkillCatalogPath || path.join(
      projectRoot,
      '.aios-core',
      'infrastructure',
      'contracts',
      'task-skill-catalog.yaml',
    ),
  };
  const errors = [];
  const warnings = [];

  if (!fs.existsSync(resolved.skillsDir)) {
    errors.push(`Skills directory not found: ${resolved.skillsDir}`);
    return { ok: false, checked: 0, expected: 0, errors, warnings, missing: [], orphaned: [] };
  }

  const agents = parseAllAgents(resolved.sourceDir).filter(isParsableAgent);
  const expected = agents.map(agent => ({
    agentId: agent.id,
    filename: agent.filename,
    skillId: getSkillId(agent.id),
  }));
  const expectedTaskSkillIds = loadExpectedCodexTaskSkillIds(
    resolved.projectRoot,
    resolved.taskSkillCatalogPath,
  );
  const sourceDerivedTaskSkillIds = loadSourceDerivedCodexTaskSkillIds({
    projectRoot: resolved.projectRoot,
    sourceTasksDir: resolved.sourceTasksDir,
    sourceAgentsDir: resolved.sourceDir,
    taskSkillCatalogPath: resolved.taskSkillCatalogPath,
    fallbackAgent: 'master',
  });

  const missing = [];
  for (const item of expected) {
    const skillPath = path.join(resolved.skillsDir, item.skillId, 'SKILL.md');
    if (!fs.existsSync(skillPath)) {
      missing.push(item.skillId);
      errors.push(`Missing skill file: ${path.relative(resolved.projectRoot, skillPath)}`);
      continue;
    }

    let content;
    try {
      content = fs.readFileSync(skillPath, 'utf8');
    } catch (error) {
      errors.push(`${item.skillId}: unable to read skill file (${error.message})`);
      continue;
    }
    const issues = validateSkillContent(content, item);
    for (const issue of issues) {
      errors.push(`${item.skillId}: ${issue}`);
    }
  }

  const expectedIds = new Set(expected.map(item => item.skillId));
  const orphaned = [];
  if (resolved.strict) {
    const dirs = fs.readdirSync(resolved.skillsDir, { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name);
    for (const dir of dirs) {
      if (expectedTaskSkillIds.has(dir)) {
        continue;
      }
      if (sourceDerivedTaskSkillIds.has(dir)) {
        continue;
      }
      if (!expectedIds.has(dir)) {
        orphaned.push(dir);
        errors.push(`Orphaned skill directory: ${path.join(path.relative(resolved.projectRoot, resolved.skillsDir), dir)}`);
      }
    }
  }

  if (expected.length === 0) {
    warnings.push('No parseable agents found in sourceDir');
  }

  return {
    ok: errors.length === 0,
    checked: expected.length,
    expected: expected.length,
    errors,
    warnings,
    missing,
    orphaned,
  };
}

function formatHumanReport(result) {
  if (result.ok) {
    return `✅ Codex skills validation passed (${result.checked} skills checked)`;
  }

  const lines = [
    `❌ Codex skills validation failed (${result.errors.length} issue(s))`,
    ...result.errors.map(error => `- ${error}`),
  ];

  if (result.warnings.length > 0) {
    lines.push(...result.warnings.map(warning => `⚠️ ${warning}`));
  }
  return lines.join('\n');
}

function main() {
  const args = parseArgs();
  const result = validateCodexSkills(args);

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
  validateCodexSkills,
  validateSkillContent,
  loadExpectedCodexTaskSkillIds,
  loadSourceDerivedCodexTaskSkillIds,
  buildAliasMap,
  canonicalizeAgent,
  normalizeTaskId,
  parseArgs,
  getDefaultOptions,
};
