#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ALLOWED_NATIVE_SUBAGENTS = new Set([
  'aiox-analyst',
  'aiox-architect',
  'aiox-data-engineer',
  'aiox-dev',
  'aiox-devops',
  'aiox-pm',
  'aiox-po',
  'aiox-qa',
  'aiox-sm',
  'aiox-ux',
]);

const ALLOWED_CLAUDE_COMMAND_ENTRIES = new Set([
  'AIOX',
  'greet.md',
  'synapse',
]);

const ALLOWED_CLAUDE_SKILL_ENTRIES = new Set([
  'AIOX',
  'aiox-commit',
  'apply-qa-fixes',
  'architect-first',
  'checklist-runner',
  'close-story',
  'coderabbit-review',
  'develop-story',
  'full-sdc',
  'mcp-builder',
  'review-story',
  'skill-creator',
  'synapse',
  'tech-search',
  'validate-story-draft',
  'wave-execute',
]);

function parseArgs(argv = process.argv.slice(2)) {
  const args = new Set(argv);
  return {
    quiet: args.has('--quiet') || args.has('-q'),
    json: args.has('--json'),
  };
}

function countMarkdownFiles(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;
  return fs.readdirSync(dirPath).filter((f) => f.endsWith('.md')).length;
}

function listMarkdownBasenames(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  return fs.readdirSync(dirPath)
    .filter((f) => f.endsWith('.md'))
    .map((f) => path.basename(f, '.md'))
    .sort();
}

function listClaudeAgentSkillIds(skillsAgentsDir) {
  if (!fs.existsSync(skillsAgentsDir)) return [];
  return fs.readdirSync(skillsAgentsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(skillsAgentsDir, entry.name, 'SKILL.md')))
    .map((entry) => entry.name)
    .sort();
}

function isGitIgnored(projectRoot, relativePath) {
  const result = spawnSync('git', ['check-ignore', '--quiet', '--', relativePath], {
    cwd: projectRoot,
    encoding: 'utf8',
  });
  return result.status === 0;
}

function listTopLevelNames(dirPath, projectRoot) {
  if (!fs.existsSync(dirPath)) return [];
  return fs.readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() || entry.isFile())
    .filter((entry) => {
      if (!projectRoot) return true;
      const relativePath = path.relative(projectRoot, path.join(dirPath, entry.name)).split(path.sep).join('/');
      return !isGitIgnored(projectRoot, relativePath);
    })
    .map((entry) => entry.name)
    .sort();
}

function validateClaudeIntegration(options = {}) {
  const projectRoot = options.projectRoot || process.cwd();
  const rulesFile = options.rulesFile || path.join(projectRoot, '.claude', 'CLAUDE.md');
  const commandsRoot = options.commandsRoot || path.join(projectRoot, '.claude', 'commands');
  const skillsRoot = options.skillsRoot || path.join(projectRoot, '.claude', 'skills');
  const agentMemoryRoot = options.agentMemoryRoot || path.join(projectRoot, '.claude', 'agent-memory');
  const agentsDir = options.agentsDir || path.join(projectRoot, '.claude', 'commands', 'AIOX', 'agents');
  const skillsAgentsDir =
    options.skillsAgentsDir || path.join(projectRoot, '.claude', 'skills', 'AIOX', 'agents');
  const hooksDir = options.hooksDir || path.join(projectRoot, '.claude', 'hooks');
  const nativeAgentsDir = options.nativeAgentsDir || path.join(projectRoot, '.claude', 'agents');
  const sourceAgentsDir =
    options.sourceAgentsDir || path.join(projectRoot, '.aiox-core', 'development', 'agents');

  const errors = [];
  const warnings = [];

  if (!fs.existsSync(agentsDir)) {
    warnings.push(`Missing legacy Claude commands dir: ${path.relative(projectRoot, agentsDir)}`);
  }
  if (!fs.existsSync(skillsAgentsDir)) {
    errors.push(`Missing Claude agent skills dir: ${path.relative(projectRoot, skillsAgentsDir)}`);
  }
  if (!fs.existsSync(rulesFile)) {
    warnings.push(`Claude rules file not found yet: ${path.relative(projectRoot, rulesFile)}`);
  }
  if (!fs.existsSync(hooksDir)) {
    warnings.push(`Claude hooks dir not found yet: ${path.relative(projectRoot, hooksDir)}`);
  }

  const sourceAgents = listMarkdownBasenames(sourceAgentsDir);
  const commandAgents = listMarkdownBasenames(agentsDir);
  const skillAgents = listClaudeAgentSkillIds(skillsAgentsDir);
  const nativeAgents = listMarkdownBasenames(nativeAgentsDir);
  const disallowedNativeAgents = nativeAgents.filter((agentId) => !ALLOWED_NATIVE_SUBAGENTS.has(agentId));
  const commandEntries = listTopLevelNames(commandsRoot, projectRoot);
  const skillEntries = listTopLevelNames(skillsRoot, projectRoot);
  const agentMemoryEntries = listTopLevelNames(agentMemoryRoot, projectRoot);
  const disallowedCommandEntries = commandEntries.filter((entry) => !ALLOWED_CLAUDE_COMMAND_ENTRIES.has(entry));
  const disallowedSkillEntries = skillEntries.filter((entry) => !ALLOWED_CLAUDE_SKILL_ENTRIES.has(entry));
  const disallowedAgentMemoryEntries = agentMemoryEntries.filter((entry) => !entry.startsWith('aiox-'));

  if (disallowedNativeAgents.length > 0) {
    errors.push(
      `Disallowed Claude native subagent(s) in .claude/agents: ${disallowedNativeAgents.join(', ')}`,
    );
  }
  if (disallowedCommandEntries.length > 0) {
    errors.push(
      `Disallowed Claude command namespace(s) in .claude/commands: ${disallowedCommandEntries.join(', ')}`,
    );
  }
  if (disallowedSkillEntries.length > 0) {
    errors.push(
      `Disallowed Claude skill artifact(s) in .claude/skills: ${disallowedSkillEntries.join(', ')}`,
    );
  }
  if (disallowedAgentMemoryEntries.length > 0) {
    errors.push(
      `Disallowed Claude agent memory namespace(s) in .claude/agent-memory: ${disallowedAgentMemoryEntries.join(', ')}`,
    );
  }

  if (sourceAgents.length > 0 && skillAgents.length !== sourceAgents.length) {
    errors.push(`Claude agent skill count differs from source (${skillAgents.length}/${sourceAgents.length})`);
  }

  for (const sourceAgent of sourceAgents) {
    if (!skillAgents.includes(sourceAgent)) {
      errors.push(`Missing Claude agent skill: ${sourceAgent}`);
      continue;
    }

    const skillPath = path.join(skillsAgentsDir, sourceAgent, 'SKILL.md');
    let skillContent = '';
    try {
      skillContent = fs.readFileSync(skillPath, 'utf8');
    } catch (_error) {
      errors.push(`Cannot read Claude agent skill: ${sourceAgent}`);
      continue;
    }

    if (!skillContent.includes('activation_type: pipeline')) {
      errors.push(`Claude agent skill missing activation_type: pipeline: ${sourceAgent}`);
    }
  }

  if (sourceAgents.length > 0 && commandAgents.length !== sourceAgents.length) {
    warnings.push(`Legacy Claude command count differs from source (${commandAgents.length}/${sourceAgents.length})`);
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    metrics: {
      sourceAgents: sourceAgents.length,
      claudeCommands: commandAgents.length,
      claudeSkills: skillAgents.length,
      claudeNativeAgents: nativeAgents.length,
      claudeCommandNamespaces: commandEntries.length,
      claudeSkillArtifacts: skillEntries.length,
      claudeAgentMemoryNamespaces: agentMemoryEntries.length,
    },
  };
}

function formatHumanReport(result) {
  if (result.ok) {
    const lines = [
      `✅ Claude integration validation passed (skills: ${result.metrics.claudeSkills}, legacy commands: ${result.metrics.claudeCommands})`,
    ];
    if (result.warnings.length > 0) {
      lines.push(...result.warnings.map((w) => `⚠️ ${w}`));
    }
    return lines.join('\n');
  }
  const lines = [
    `❌ Claude integration validation failed (${result.errors.length} issue(s))`,
    ...result.errors.map((e) => `- ${e}`),
  ];
  if (result.warnings.length > 0) {
    lines.push(...result.warnings.map((w) => `⚠️ ${w}`));
  }
  return lines.join('\n');
}

function main() {
  const args = parseArgs();
  const result = validateClaudeIntegration(args);

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
  validateClaudeIntegration,
  parseArgs,
  countMarkdownFiles,
  listMarkdownBasenames,
  listClaudeAgentSkillIds,
  listTopLevelNames,
  ALLOWED_NATIVE_SUBAGENTS,
  ALLOWED_CLAUDE_COMMAND_ENTRIES,
  ALLOWED_CLAUDE_SKILL_ENTRIES,
};
