#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

function getDefaultOptions() {
  const projectRoot = process.cwd();
  return {
    projectRoot,
    rulesFile: path.join(projectRoot, '.gemini', 'rules.md'),
    agentsDir: path.join(projectRoot, '.gemini', 'rules', 'AIOS', 'agents'),
    commandsDir: path.join(projectRoot, '.gemini', 'commands'),
    skillsDir: path.join(projectRoot, 'packages', 'gemini-aios-extension', 'skills'),
    extensionDir: path.join(projectRoot, 'packages', 'gemini-aios-extension'),
    extensionFile: path.join(projectRoot, 'packages', 'gemini-aios-extension', 'extension.json'),
    sourceAgentsDir: path.join(projectRoot, '.aios-core', 'development', 'agents'),
    quiet: false,
    json: false,
  };
}

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

function toSkillIdFromFilename(filename) {
  const id = path.basename(filename, '.md');
  if (id === 'aios-master') return 'aios-master';
  if (id.startsWith('aios-')) return id.slice(5);
  return id;
}

function listSkillIds(skillsDir) {
  if (!fs.existsSync(skillsDir)) return [];
  return fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => fs.existsSync(path.join(skillsDir, entry.name, 'SKILL.md')))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function normalizeManifestPath(relPath) {
  return String(relPath || '').replace(/\\/g, '/');
}

function validateGeminiIntegration(options = {}) {
  const projectRoot = options.projectRoot || process.cwd();
  const resolved = {
    ...getDefaultOptions(),
    ...options,
    projectRoot,
    rulesFile: options.rulesFile || path.join(projectRoot, '.gemini', 'rules.md'),
    agentsDir: options.agentsDir || path.join(projectRoot, '.gemini', 'rules', 'AIOS', 'agents'),
    commandsDir: options.commandsDir || path.join(projectRoot, '.gemini', 'commands'),
    skillsDir: options.skillsDir || path.join(projectRoot, 'packages', 'gemini-aios-extension', 'skills'),
    extensionDir: options.extensionDir || path.join(projectRoot, 'packages', 'gemini-aios-extension'),
    extensionFile: options.extensionFile || path.join(projectRoot, 'packages', 'gemini-aios-extension', 'extension.json'),
    sourceAgentsDir: options.sourceAgentsDir || path.join(projectRoot, '.aios-core', 'development', 'agents'),
  };
  const errors = [];
  const warnings = [];

  if (!fs.existsSync(resolved.rulesFile)) {
    warnings.push(`Gemini rules file not found yet: ${path.relative(resolved.projectRoot, resolved.rulesFile)}`);
  }

  if (!fs.existsSync(resolved.agentsDir)) {
    errors.push(`Missing Gemini agents dir: ${path.relative(resolved.projectRoot, resolved.agentsDir)}`);
  }
  if (!fs.existsSync(resolved.skillsDir)) {
    errors.push(`Missing Gemini skills dir: ${path.relative(resolved.projectRoot, resolved.skillsDir)}`);
  }

  const sourceFiles = listMarkdownFilenames(resolved.sourceAgentsDir);
  const sourceCount = sourceFiles.length;
  const expectedSkillIds = sourceFiles.map(toSkillIdFromFilename);
  const expectedSkillPaths = expectedSkillIds.map((skillId) => `skills/${skillId}/SKILL.md`);

  const geminiCount = countMarkdownFiles(resolved.agentsDir);
  const geminiSkills = listSkillIds(resolved.skillsDir);
  const geminiSkillSet = new Set(geminiSkills);
  const commandFiles = fs.existsSync(resolved.commandsDir)
    ? fs.readdirSync(resolved.commandsDir).filter((f) => f.endsWith('.toml'))
    : [];
  if (commandFiles.length > 0) {
    errors.push(`Gemini command adapters must be removed: ${commandFiles.join(', ')}`);
  }
  if (sourceCount > 0 && geminiCount !== sourceCount) {
    warnings.push(`Gemini agent count differs from source (${geminiCount}/${sourceCount})`);
  }
  if (sourceCount > 0 && geminiSkills.length !== sourceCount) {
    warnings.push(`Gemini skill count differs from source (${geminiSkills.length}/${sourceCount})`);
  }

  const missingSkills = expectedSkillIds.filter((skillId) => !geminiSkillSet.has(skillId));
  if (missingSkills.length > 0) {
    errors.push(`Missing Gemini skill files: ${missingSkills.join(', ')}`);
  }

  const requiredExtensionFiles = [
    'extension.json',
    'README.md',
    path.join('commands', 'aios-status.js'),
    path.join('commands', 'aios-agents.js'),
    path.join('commands', 'aios-validate.js'),
    path.join('hooks', 'hooks.json'),
  ];

  for (const rel of requiredExtensionFiles) {
    const abs = path.join(resolved.extensionDir, rel);
    if (!fs.existsSync(abs)) {
      errors.push(`Missing Gemini extension file: ${path.relative(resolved.projectRoot, abs)}`);
    }
  }

  if (fs.existsSync(resolved.extensionFile)) {
    try {
      const extension = JSON.parse(fs.readFileSync(resolved.extensionFile, 'utf8'));
      const manifestSkills = Array.isArray(extension.skills) ? extension.skills : [];
      const manifestSkillPaths = new Set(
        manifestSkills.map((skill) => normalizeManifestPath(skill.path)),
      );
      const missingManifestPaths = expectedSkillPaths.filter(
        (relPath) => !manifestSkillPaths.has(relPath),
      );

      if (missingManifestPaths.length > 0) {
        errors.push(`Gemini extension skills map missing paths: ${missingManifestPaths.join(', ')}`);
      }
    } catch (error) {
      errors.push(`Invalid Gemini extension manifest JSON: ${error.message}`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    metrics: {
      sourceAgents: sourceCount,
      geminiAgents: geminiCount,
      geminiCommands: commandFiles.length,
      geminiSkills: geminiSkills.length,
    },
  };
}

function formatHumanReport(result) {
  if (result.ok) {
    const lines = [
      `✅ Gemini integration validation passed (agents: ${result.metrics.geminiAgents}, skills: ${result.metrics.geminiSkills}, adapters: ${result.metrics.geminiCommands})`,
    ];
    if (result.warnings.length > 0) {
      lines.push(...result.warnings.map((w) => `⚠️ ${w}`));
    }
    return lines.join('\n');
  }
  const lines = [
    `❌ Gemini integration validation failed (${result.errors.length} issue(s))`,
    ...result.errors.map((e) => `- ${e}`),
  ];
  if (result.warnings.length > 0) {
    lines.push(...result.warnings.map((w) => `⚠️ ${w}`));
  }
  return lines.join('\n');
}

function main() {
  const args = parseArgs();
  const result = validateGeminiIntegration(args);

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
  validateGeminiIntegration,
  parseArgs,
  getDefaultOptions,
  countMarkdownFiles,
  listMarkdownFilenames,
  toSkillIdFromFilename,
  listSkillIds,
  normalizeManifestPath,
};
