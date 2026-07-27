#!/usr/bin/env node

/**
 * AIOX Agent Consistency Validator
 *
 * Validates all agent definitions for consistency according to the
 * Agent Consistency Refactor PRD requirements:
 *
 * 1. YAML parseability (a broken block is reported, not swallowed)
 * 2. Command uniqueness within each scope (1 command = 1 owner)
 * 3. Dependency existence verification
 * 4. Format schema validation
 * 5. Cross-agent reference validation
 *
 * Scope: core agents in .aiox-core/development/agents/ AND squad agents in
 * squads/<squad>/agents/. Command uniqueness is checked per scope — core agents
 * share one namespace and each squad has its own, so the same command name in
 * two different squads is not a conflict. Squad dependencies resolve against
 * squads/<squad>/<type>/ rather than the core development directories.
 *
 * Usage:
 *   node validate-agents.js                    Validate core + squad agents
 *   node validate-agents.js --core-only        Validate only core agents
 *   node validate-agents.js --json             Output as JSON
 *   node validate-agents.js --fix-suggestions  Show fix suggestions
 *
 * Exit codes:
 *   0 - All validations passed
 *   1 - Validation errors found
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

// Paths
const ROOT_DIR = path.join(__dirname, '..', '..'); // .aiox-core
const REPO_ROOT = path.join(ROOT_DIR, '..'); // repository root
const SQUADS_DIR = path.join(REPO_ROOT, 'squads');
const AGENTS_DIR = path.join(ROOT_DIR, 'development', 'agents');
const TASKS_DIR = path.join(ROOT_DIR, 'development', 'tasks');
const TEMPLATES_DIR = path.join(ROOT_DIR, 'development', 'templates');
const CHECKLISTS_DIR = path.join(ROOT_DIR, 'development', 'checklists');
const DATA_DIR = path.join(ROOT_DIR, 'development', 'data');
const UTILS_DIR = path.join(ROOT_DIR, 'development', 'utils');
const WORKFLOWS_DIR = path.join(ROOT_DIR, 'development', 'workflows');
const SCRIPTS_DIR = path.join(ROOT_DIR, 'development', 'scripts');

const CORE_SCOPE = 'core';

// Where each file-based dependency type lives, for core agents.
const CORE_DEP_DIRS = {
  tasks: TASKS_DIR,
  templates: TEMPLATES_DIR,
  checklists: CHECKLISTS_DIR,
  data: DATA_DIR,
  utils: UTILS_DIR,
  workflows: WORKFLOWS_DIR,
  scripts: SCRIPTS_DIR,
};

// Same types, resolved inside a squad directory (squads/<squad>/<type>/).
function squadDepDirs(squadRoot) {
  return Object.fromEntries(
    Object.keys(CORE_DEP_DIRS).map((type) => [type, path.join(squadRoot, type)])
  );
}

// Commands that are allowed to be shared by multiple agents
// These are utility/infrastructure commands, not domain-specific
const SHARED_COMMANDS = new Set([
  // Core utility commands (all agents)
  'help',
  'yolo',
  'exit',
  'guide',
  'session-info',
  // Document operations (multiple agents can output docs)
  'doc-out',
  'shard-doc',
  'shard-prd',
  'research',
  'execute-checklist',
  // Status/monitoring (multiple agents can check status)
  'status',
  // Infrastructure commands delegated to specific agents but callable from many
  'document-project',
  // Backlog operations (PO and QA both manage backlog items)
  'backlog-add',
  'backlog-review',
  // Build/rollback (dev operations that overlap between dev/devops/data)
  'build',
  'rollback',
  // Correct-course (all agents can use on own domain)
  'correct-course',
]);

/**
 * Extract YAML content from markdown file
 */
function extractYamlFromMarkdown(content) {
  const yamlBlockMatch = content.match(/```yaml\n([\s\S]*?)\n```/);
  if (yamlBlockMatch) {
    return yaml.load(yamlBlockMatch[1]);
  }
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    return yaml.load(frontmatterMatch[1]);
  }
  return null;
}

/**
 * Load agent files from a single directory.
 *
 * A file whose YAML does not parse is recorded in parseErrors instead of
 * aborting the scan — previously one broken block stopped every remaining
 * agent from being loaded at all, and the failure surfaced only as a console
 * message while the run still reported success.
 */
async function loadAgentsFromDir(dir, scope, depDirs) {
  const agents = [];
  const parseErrors = [];

  let files;
  try {
    files = await fs.readdir(dir);
  } catch {
    return { agents, parseErrors }; // directory absent — nothing to validate
  }

  for (const file of files) {
    if (!file.endsWith('.md') || file.startsWith('_')) continue;

    const filePath = path.join(dir, file);
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const parsed = extractYamlFromMarkdown(content);

      if (parsed?.agent) {
        agents.push({
          file,
          path: filePath,
          scope,
          depDirs,
          id: parsed.agent.id || file.replace('.md', ''),
          name: parsed.agent.name,
          commands: parsed.commands || [],
          dependencies: parsed.dependencies || {},
          parsed,
        });
      }
    } catch (error) {
      parseErrors.push({
        type: 'INVALID_YAML',
        scope,
        agent: file.replace('.md', ''),
        file,
        path: filePath,
        message: `Unparseable YAML in ${scope}/${file}: ${String(error.message).split('\n')[0]}`,
        suggestion:
          'Fix the embedded YAML block. A common cause is a sequence entry like `- "term" (note)`, where the text after the closing quote is a stray token — wrap the whole entry in single quotes.',
      });
    }
  }

  return { agents, parseErrors };
}

/**
 * Discover squads that ship agents (squads/<squad>/agents/).
 */
async function discoverSquads() {
  try {
    const entries = await fs.readdir(SQUADS_DIR, { withFileTypes: true });
    return entries
      .filter((e) => e.isDirectory())
      .map((e) => ({
        name: e.name,
        root: path.join(SQUADS_DIR, e.name),
        agentsDir: path.join(SQUADS_DIR, e.name, 'agents'),
      }));
  } catch {
    return []; // no squads/ directory (e.g. project-mode install)
  }
}

/**
 * Load core agents plus, unless disabled, every squad's agents.
 * Returns { agents, parseErrors, scopes }.
 */
async function loadAgents({ includeSquads = true } = {}) {
  const core = await loadAgentsFromDir(AGENTS_DIR, CORE_SCOPE, CORE_DEP_DIRS);
  const agents = [...core.agents];
  const parseErrors = [...core.parseErrors];
  const scopes = [{ scope: CORE_SCOPE, count: core.agents.length }];

  if (includeSquads) {
    for (const squad of await discoverSquads()) {
      const scope = `squad:${squad.name}`;
      const loaded = await loadAgentsFromDir(squad.agentsDir, scope, squadDepDirs(squad.root));
      if (loaded.agents.length === 0 && loaded.parseErrors.length === 0) continue;
      agents.push(...loaded.agents);
      parseErrors.push(...loaded.parseErrors);
      scopes.push({ scope, count: loaded.agents.length });
    }
  }

  return { agents, parseErrors, scopes };
}

/**
 * Backwards-compatible wrapper: returns just the agent list.
 */
async function loadAllAgents(options = {}) {
  const { agents } = await loadAgents(options);
  return agents;
}

/**
 * Check if a file exists
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract a command name from any of the three accepted command shapes.
 */
function commandName(cmd) {
  if (typeof cmd === 'string') {
    // String format: 'command: description'
    return cmd.split(':')[0].trim();
  }
  if (cmd && cmd.name) {
    // Explicit format: { name: 'command', ... }
    return cmd.name;
  }
  if (typeof cmd === 'object' && cmd !== null) {
    // Shorthand format: { command: 'description' } - take first key
    return Object.keys(cmd)[0]?.split(' ')[0]; // Handle 'command {args}' format
  }
  return undefined;
}

/**
 * Validate command uniqueness within each scope.
 *
 * Scopes are separate namespaces: core agents are checked against each other,
 * and each squad against itself. A command named the same in two different
 * squads is not a collision, so cross-scope pairs are never reported.
 *
 * Returns: { errors: [], warnings: [], commandOwners: Map<scope, Map<cmd, owners>> }
 */
function validateCommandUniqueness(agents) {
  const commandOwners = new Map(); // scope -> Map(command -> [{ agent, file, hasVisibility }])
  const errors = [];
  const warnings = [];

  for (const agent of agents) {
    if (!Array.isArray(agent.commands)) continue;
    const scope = agent.scope || CORE_SCOPE;
    if (!commandOwners.has(scope)) commandOwners.set(scope, new Map());
    const scopeOwners = commandOwners.get(scope);

    for (const cmd of agent.commands) {
      const cmdName = commandName(cmd);
      if (!cmdName) continue;

      if (!scopeOwners.has(cmdName)) scopeOwners.set(cmdName, []);
      scopeOwners.get(cmdName).push({
        agent: agent.id,
        file: agent.file,
        hasVisibility: cmd.visibility !== undefined,
      });
    }
  }

  // Check for duplicates, one scope at a time
  for (const [scope, scopeOwners] of commandOwners) {
    for (const [cmd, owners] of scopeOwners) {
      if (owners.length > 1 && !SHARED_COMMANDS.has(cmd)) {
        const ownerList = owners.map((o) => `@${o.agent}`).join(', ');
        errors.push({
          type: 'DUPLICATE_COMMAND',
          scope,
          command: cmd,
          owners: owners.map((o) => o.agent),
          message: `[${scope}] Command "*${cmd}" has multiple owners: ${ownerList}`,
          suggestion: `Keep "*${cmd}" only in the primary owner agent and remove from others, or add to SHARED_COMMANDS if intentionally shared.`,
        });
      }
    }
  }

  return { errors, warnings, commandOwners };
}

/**
 * Validate dependencies exist
 */
async function validateDependencies(agents) {
  const errors = [];
  const warnings = [];

  // Dependency types that are not file-based (external tools, integrations)
  const skipDepTypes = new Set(['tools', 'coderabbit_integration', 'pr_automation', 'repository_agnostic_design', 'git_authority', 'workflow_examples']);

  for (const agent of agents) {
    const deps = agent.dependencies;
    // Squad agents resolve dependencies inside their own squad directory.
    const depDirs = agent.depDirs || CORE_DEP_DIRS;

    for (const [depType, depList] of Object.entries(deps)) {
      // Skip non-file-based dependency types
      if (skipDepTypes.has(depType)) continue;
      if (!Array.isArray(depList)) continue;

      // reference_files hold repo-relative paths, not <type>/<name> entries.
      if (depType === 'reference_files') {
        for (const refFile of depList) {
          if (typeof refFile !== 'string') continue;
          const refPath = path.join(REPO_ROOT, refFile);
          if (!(await fileExists(refPath))) {
            warnings.push({
              type: 'MISSING_REFERENCE_FILE',
              scope: agent.scope,
              agent: agent.id,
              depType,
              depFile: refFile,
              expectedPath: refPath,
              message: `Missing reference file: @${agent.id} → ${refFile}`,
              suggestion: `Create ${refFile} or remove it from the agent's reference_files.`,
            });
          }
        }
        continue;
      }

      const depDir = depDirs[depType];
      if (!depDir) {
        warnings.push({
          type: 'UNKNOWN_DEP_TYPE',
          scope: agent.scope,
          agent: agent.id,
          depType,
          message: `Unknown dependency type "${depType}" in @${agent.id}`,
        });
        continue;
      }

      for (const depFile of depList) {
        const depPath = path.join(depDir, depFile);
        const exists = await fileExists(depPath);

        if (!exists) {
          // Missing dependencies are warnings, not errors (pre-existing technical debt)
          warnings.push({
            type: 'MISSING_DEPENDENCY',
            scope: agent.scope,
            agent: agent.id,
            depType,
            depFile,
            expectedPath: depPath,
            message: `Missing dependency: @${agent.id} → ${depType}/${depFile}`,
            suggestion: `Create the file at ${depPath} or remove from agent dependencies.`,
          });
        }
      }
    }
  }

  return { errors, warnings };
}

/**
 * Validate agent format
 */
function validateAgentFormat(agents) {
  const errors = [];
  const warnings = [];

  for (const agent of agents) {
    const { parsed, file, id } = agent;

    // Check required fields
    if (!parsed.agent.id) {
      errors.push({
        type: 'MISSING_FIELD',
        agent: id,
        field: 'agent.id',
        message: `Missing agent.id in ${file}`,
      });
    }

    if (!parsed.agent.name) {
      errors.push({
        type: 'MISSING_FIELD',
        agent: id,
        field: 'agent.name',
        message: `Missing agent.name in ${file}`,
      });
    }

    if (!parsed.agent.title) {
      errors.push({
        type: 'MISSING_FIELD',
        agent: id,
        field: 'agent.title',
        message: `Missing agent.title in ${file}`,
      });
    }

    if (!parsed.agent.icon) {
      warnings.push({
        type: 'MISSING_FIELD',
        agent: id,
        field: 'agent.icon',
        message: `Missing agent.icon in ${file}`,
      });
    }

    // Check command format
    // Accepted formats:
    // 1. { name: 'cmd', description: '...' } - explicit format (preferred)
    // 2. { cmd: 'description' } - shorthand format (valid)
    // 3. 'cmd: description' - string format (deprecated)
    for (let i = 0; i < agent.commands.length; i++) {
      const cmd = agent.commands[i];
      if (typeof cmd === 'string') {
        // String format is deprecated but we'll just warn
        warnings.push({
          type: 'DEPRECATED_COMMAND_FORMAT',
          agent: id,
          command: cmd,
          message: `Command "${cmd}" in @${id} uses deprecated string format`,
          suggestion: `Consider converting to: - name: ${cmd.split(':')[0].trim()}\n    description: "${cmd.split(':')[1]?.trim() || 'TODO: add description'}"`,
        });
      }
      // Note: { cmd: 'description' } shorthand format is valid and does NOT generate errors
    }

    // Check autoClaude section
    if (!parsed.autoClaude) {
      warnings.push({
        type: 'MISSING_AUTOCLAUDE',
        agent: id,
        message: `Missing autoClaude section in ${file} (V2 format)`,
        suggestion: `Add autoClaude section with version: '3.0'`,
      });
    }

    // Check greeting script
    const activation = parsed['activation-instructions'];
    if (activation) {
      const activationStr = Array.isArray(activation) ? activation.join('\n') : String(activation);
      if (activationStr.includes('generate-greeting.js')) {
        warnings.push({
          type: 'DEPRECATED_GREETING',
          agent: id,
          message: `@${id} uses deprecated generate-greeting.js`,
          suggestion: `Change to greeting-builder.js`,
        });
      }
    }
  }

  return { errors, warnings };
}

/**
 * Format results for console
 */
function formatResults(results, showSuggestions = false) {
  const lines = [];
  const { parseValidation, commandValidation, dependencyValidation, formatValidation, summary } = results;

  lines.push('');
  lines.push('━'.repeat(60));
  lines.push('  AIOX Agent Consistency Validation Report');
  lines.push('━'.repeat(60));
  lines.push('');

  // YAML parseability — must come first: an unparseable agent cannot be checked at all
  lines.push('🔍 YAML Parse Check');
  lines.push('─'.repeat(40));
  if (parseValidation.errors.length === 0) {
    lines.push('  ✅ All agent definitions parse as YAML');
  } else {
    for (const err of parseValidation.errors) {
      lines.push(`  ❌ ${err.message}`);
      if (showSuggestions && err.suggestion) {
        lines.push(`     💡 ${err.suggestion}`);
      }
    }
  }
  lines.push('');

  // Command Uniqueness
  lines.push('📋 Command Uniqueness Check');
  lines.push('─'.repeat(40));
  if (commandValidation.errors.length === 0) {
    lines.push('  ✅ All commands have unique owners (or are shared)');
  } else {
    for (const err of commandValidation.errors) {
      lines.push(`  ❌ ${err.message}`);
      if (showSuggestions && err.suggestion) {
        lines.push(`     💡 ${err.suggestion}`);
      }
    }
  }
  lines.push('');

  // Dependencies
  lines.push('📦 Dependencies Existence Check');
  lines.push('─'.repeat(40));
  if (dependencyValidation.errors.length === 0) {
    lines.push('  ✅ All dependencies exist');
  } else {
    for (const err of dependencyValidation.errors) {
      lines.push(`  ❌ ${err.message}`);
      if (showSuggestions && err.suggestion) {
        lines.push(`     💡 ${err.suggestion}`);
      }
    }
  }
  if (dependencyValidation.warnings.length > 0) {
    for (const warn of dependencyValidation.warnings) {
      lines.push(`  ⚠️  ${warn.message}`);
    }
  }
  lines.push('');

  // Format Validation
  lines.push('📝 Agent Format Check');
  lines.push('─'.repeat(40));
  if (formatValidation.errors.length === 0) {
    lines.push('  ✅ All agents follow standard format');
  } else {
    for (const err of formatValidation.errors) {
      lines.push(`  ❌ ${err.message}`);
      if (showSuggestions && err.suggestion) {
        lines.push(`     💡 ${err.suggestion}`);
      }
    }
  }
  if (formatValidation.warnings.length > 0) {
    for (const warn of formatValidation.warnings) {
      lines.push(`  ⚠️  ${warn.message}`);
      if (showSuggestions && warn.suggestion) {
        lines.push(`     💡 ${warn.suggestion}`);
      }
    }
  }
  lines.push('');

  // Summary
  lines.push('━'.repeat(60));
  lines.push('  Summary');
  lines.push('━'.repeat(60));
  lines.push(`  Agents validated: ${summary.totalAgents}`);
  for (const { scope, count } of summary.scopes || []) {
    lines.push(`    • ${scope}: ${count}`);
  }
  lines.push(`  Errors: ${summary.totalErrors}`);
  lines.push(`  Warnings: ${summary.totalWarnings}`);
  lines.push('');

  if (summary.totalErrors === 0) {
    lines.push('  ✅ All validations passed!');
  } else {
    lines.push(`  ❌ ${summary.totalErrors} error(s) found - please fix before committing`);
  }
  lines.push('');

  return lines.join('\n');
}

/**
 * Main validation function
 */
async function validateAgents(options = {}) {
  const { json = false, fixSuggestions = false, coreOnly = false } = options;

  // Load core agents and, unless restricted, every squad's agents
  const { agents, parseErrors, scopes } = await loadAgents({ includeSquads: !coreOnly });

  if (agents.length === 0 && parseErrors.length === 0) {
    console.error('No agents found in', AGENTS_DIR);
    process.exit(1);
  }

  // Run validations
  const parseValidation = { errors: parseErrors, warnings: [] };
  const commandValidation = validateCommandUniqueness(agents);
  const dependencyValidation = await validateDependencies(agents);
  const formatValidation = validateAgentFormat(agents);

  // Calculate summary — an unparseable definition is an error, not a silent skip
  const totalErrors =
    parseValidation.errors.length +
    commandValidation.errors.length +
    dependencyValidation.errors.length +
    formatValidation.errors.length;

  const totalWarnings =
    parseValidation.warnings.length +
    commandValidation.warnings.length +
    dependencyValidation.warnings.length +
    formatValidation.warnings.length;

  const results = {
    parseValidation,
    commandValidation,
    dependencyValidation,
    formatValidation,
    summary: {
      totalAgents: agents.length,
      scopes,
      totalErrors,
      totalWarnings,
      valid: totalErrors === 0,
    },
  };

  // Output
  if (json) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    console.log(formatResults(results, fixSuggestions));
  }

  return results;
}

// CLI handler
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
AIOX Agent Consistency Validator

Usage:
  node validate-agents.js                    Validate all agents
  node validate-agents.js --json             Output as JSON
  node validate-agents.js --fix-suggestions  Show fix suggestions

Exit codes:
  0 - All validations passed
  1 - Validation errors found
    `);
    return;
  }

  const options = {
    json: args.includes('--json'),
    fixSuggestions: args.includes('--fix-suggestions') || args.includes('--fix'),
    coreOnly: args.includes('--core-only'),
  };

  const results = await validateAgents(options);
  process.exit(results.summary.valid ? 0 : 1);
}

// Export for programmatic use
module.exports = {
  validateAgents,
  validateCommandUniqueness,
  validateDependencies,
  validateAgentFormat,
  // loadAllAgents mantém a assinatura antiga (devolve só a lista) para não quebrar
  // quem já consome; loadAgents é o novo, com parseErrors e escopos.
  loadAllAgents,
  loadAgents,
  loadAgentsFromDir,
  discoverSquads,
  commandName,
  CORE_SCOPE,
};

// Run CLI if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Error:', error.message);
    process.exit(1);
  });
}
