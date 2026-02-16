#!/usr/bin/env node
'use strict';

const path = require('path');
const { spawnSync } = require('child_process');
const { validateClaudeIntegration } = require('./validate-claude-integration');
const { validateCodexIntegration } = require('./validate-codex-integration');
const { validateGeminiIntegration } = require('./validate-gemini-integration');
const { validateCodexSkills } = require('./codex-skills-sync/validate');
const { validatePaths } = require('./validate-paths');

function parseArgs(argv = process.argv.slice(2)) {
  const args = new Set(argv);
  return {
    quiet: args.has('--quiet') || args.has('-q'),
    json: args.has('--json'),
  };
}

function runSyncValidate(ide, projectRoot) {
  const script = path.join('.aios-core', 'infrastructure', 'scripts', 'ide-sync', 'index.js');
  const result = spawnSync('node', [script, 'validate', '--ide', ide, '--strict'], {
    cwd: projectRoot,
    encoding: 'utf8',
  });
  return {
    ok: result.status === 0,
    errors: result.status === 0 ? [] : [`Sync validation failed for ${ide}`],
    warnings: [],
    raw: result.stdout || result.stderr || '',
  };
}

function normalizeResult(input) {
  if (!input || typeof input !== 'object') {
    return { ok: false, errors: ['Validator returned invalid result'], warnings: [] };
  }
  return {
    ok: Boolean(input.ok),
    errors: Array.isArray(input.errors) ? input.errors : [],
    warnings: Array.isArray(input.warnings) ? input.warnings : [],
    metrics: input.metrics || {},
  };
}

function runParityValidation(options = {}, deps = {}) {
  const projectRoot = options.projectRoot || process.cwd();
  const runSync = deps.runSyncValidate || runSyncValidate;
  const runClaudeIntegration = deps.validateClaudeIntegration || validateClaudeIntegration;
  const runCodexIntegration = deps.validateCodexIntegration || validateCodexIntegration;
  const runGeminiIntegration = deps.validateGeminiIntegration || validateGeminiIntegration;
  const runCodexSkills = deps.validateCodexSkills || validateCodexSkills;
  const runPaths = deps.validatePaths || validatePaths;
  const checks = [
    { id: 'claude-sync', exec: () => runSync('claude-code', projectRoot) },
    { id: 'claude-integration', exec: () => runClaudeIntegration({ projectRoot }) },
    { id: 'codex-sync', exec: () => runSync('codex', projectRoot) },
    { id: 'codex-integration', exec: () => runCodexIntegration({ projectRoot }) },
    { id: 'gemini-sync', exec: () => runSync('gemini', projectRoot) },
    { id: 'gemini-integration', exec: () => runGeminiIntegration({ projectRoot }) },
    { id: 'codex-skills', exec: () => runCodexSkills({ projectRoot, strict: true, quiet: true }) },
    { id: 'paths', exec: () => runPaths({ projectRoot }) },
  ];

  const results = checks.map((check) => {
    const normalized = normalizeResult(check.exec());
    return { id: check.id, ...normalized };
  });

  return {
    ok: results.every((r) => r.ok),
    checks: results,
  };
}

function formatHumanReport(result) {
  const lines = [];
  for (const check of result.checks) {
    lines.push(`${check.ok ? '✅' : '❌'} ${check.id}`);
    if (check.errors.length > 0) {
      lines.push(...check.errors.map((e) => `- ${e}`));
    }
    if (check.warnings.length > 0) {
      lines.push(...check.warnings.map((w) => `⚠️ ${w}`));
    }
  }
  lines.push('');
  lines.push(result.ok ? '✅ Parity validation passed' : '❌ Parity validation failed');
  return lines.join('\n');
}

function main() {
  const args = parseArgs();
  const result = runParityValidation(args);

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
  parseArgs,
  runSyncValidate,
  runParityValidation,
  normalizeResult,
  formatHumanReport,
};
