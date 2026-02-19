#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

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

function listMarkdownFilenames(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  return fs.readdirSync(dirPath)
    .filter((f) => f.endsWith('.md'))
    .sort((a, b) => a.localeCompare(b));
}

function listExpectedSourceAgents(sourceAgentsDir) {
  return listMarkdownFilenames(sourceAgentsDir);
}

function toSkillIdFromFilename(filename) {
  const id = path.basename(filename, '.md');
  if (id === 'aios-master') return 'aios-master';
  if (id.startsWith('aios-')) return id.slice(5);
  return id;
}

function listSkillIds(skillsDir) {
  if (!fs.existsSync(skillsDir)) return [];
  const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .filter((entry) => fs.existsSync(path.join(skillsDir, entry.name, 'SKILL.md')))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function readFrontmatterName(filePath) {
  if (!fs.existsSync(filePath)) return null;
  let content = '';

  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (_) {
    return null;
  }

  const match = content.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return null;

  try {
    const parsed = yaml.load(match[1]) || {};
    const name = String(parsed.name || '').trim();
    return name || null;
  } catch (_) {
    return null;
  }
}

function findDuplicateNativeAgentNames(nativeAgentsDir) {
  const duplicates = [];
  const byName = new Map();
  const files = listMarkdownFilenames(nativeAgentsDir);

  for (const filename of files) {
    const frontmatterName = readFrontmatterName(path.join(nativeAgentsDir, filename));
    if (!frontmatterName) continue;
    if (!byName.has(frontmatterName)) {
      byName.set(frontmatterName, []);
    }
    byName.get(frontmatterName).push(filename);
  }

  for (const [name, filenames] of byName.entries()) {
    if (filenames.length <= 1) continue;
    duplicates.push({
      name,
      files: filenames.sort((left, right) => left.localeCompare(right)),
    });
  }

  return duplicates.sort((left, right) => left.name.localeCompare(right.name));
}

function validateClaudeIntegration(options = {}) {
  const projectRoot = options.projectRoot || process.cwd();
  const rulesFile = options.rulesFile || path.join(projectRoot, '.claude', 'CLAUDE.md');
  const nativeAgentsDir = options.nativeAgentsDir || path.join(projectRoot, '.claude', 'agents');
  const commandAgentsDir =
    options.commandAgentsDir || path.join(projectRoot, '.claude', 'commands', 'AIOS', 'agents');
  const skillsDir = options.skillsDir || path.join(projectRoot, '.claude', 'skills');
  const hooksDir = options.hooksDir || path.join(projectRoot, '.claude', 'hooks');
  const sourceAgentsDir =
    options.sourceAgentsDir || path.join(projectRoot, '.aios-core', 'development', 'agents');

  const errors = [];
  const warnings = [];

  if (!fs.existsSync(nativeAgentsDir)) {
    errors.push(`Missing Claude native agents dir: ${path.relative(projectRoot, nativeAgentsDir)}`);
  }
  if (!fs.existsSync(rulesFile)) {
    warnings.push(`Claude rules file not found yet: ${path.relative(projectRoot, rulesFile)}`);
  }
  if (!fs.existsSync(hooksDir)) {
    warnings.push(`Claude hooks dir not found yet: ${path.relative(projectRoot, hooksDir)}`);
  }

  const sourceFiles = listExpectedSourceAgents(sourceAgentsDir);
  const expectedNativeFiles = sourceFiles;
  const expectedSkillIds = sourceFiles.map(toSkillIdFromFilename);
  const nativeFiles = new Set(listMarkdownFilenames(nativeAgentsDir));
  const commandFiles = listMarkdownFilenames(commandAgentsDir);
  const skillIds = new Set(listSkillIds(skillsDir));

  const missingNative = expectedNativeFiles.filter((filename) => !nativeFiles.has(filename));
  const missingSkills = expectedSkillIds.filter((skillId) => !skillIds.has(skillId));
  const duplicateNativeAgentNames = findDuplicateNativeAgentNames(nativeAgentsDir);

  if (missingNative.length > 0) {
    errors.push(`Missing Claude native agent files: ${missingNative.join(', ')}`);
  }
  if (commandFiles.length > 0) {
    errors.push(`Claude command adapters must be removed: ${commandFiles.join(', ')}`);
  }
  if (missingSkills.length > 0) {
    errors.push(`Missing Claude skill files: ${missingSkills.join(', ')}`);
  }
  if (duplicateNativeAgentNames.length > 0) {
    for (const duplicate of duplicateNativeAgentNames) {
      errors.push(`Duplicate Claude native agent name "${duplicate.name}": ${duplicate.files.join(', ')}`);
    }
  }

  const sourceCount = sourceFiles.length;
  const nativeCount = nativeFiles.size;
  const commandCount = commandFiles.length;
  const skillsCount = skillIds.size;

  if (sourceCount > 0 && nativeCount < sourceCount) {
    warnings.push(`Claude native agent inventory is lower than source (${nativeCount}/${sourceCount})`);
  }
  if (sourceCount > 0 && skillsCount < sourceCount) {
    warnings.push(`Claude skills inventory is lower than source (${skillsCount}/${sourceCount})`);
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    metrics: {
      sourceAgents: sourceCount,
      claudeNativeAgents: nativeCount,
      claudeCommandAdapters: commandCount,
      claudeSkills: skillsCount,
    },
  };
}

function formatHumanReport(result) {
  if (result.ok) {
    const lines = [
      `✅ Claude integration validation passed (native: ${result.metrics.claudeNativeAgents}, skills: ${result.metrics.claudeSkills}, adapters: ${result.metrics.claudeCommandAdapters})`,
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
  listMarkdownFilenames,
  listExpectedSourceAgents,
  toSkillIdFromFilename,
  listSkillIds,
  readFrontmatterName,
  findDuplicateNativeAgentNames,
};
