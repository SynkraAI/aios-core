#!/usr/bin/env node
'use strict';

/**
 * Validate AIOX Grok integration under .grok/
 *
 * Checks:
 *  - Agent profiles for every AGENT_PROFILES id
 *  - Persona activation skills + workflow skills
 *  - Short workflow aliases
 *  - Roles / personas TOML
 *  - Rules, README, project config, push-authority hooks
 *  - Authority hook dual-payload behavior (Claude + Grok)
 *
 * CLI: npm run validate:skills:grok [-- --strict]
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const {
  AGENT_PROFILES,
  WORKFLOW_SKILLS,
  DEVELOPMENT_WORKFLOW_SKILLS,
  SHORT_WORKFLOW_ALIASES,
  SHORT_AGENT_ALIASES,
  syncGrok,
  readManagedManifest,
  serializeManagedRuleSections,
  MANAGED_MANIFEST_FILENAME,
  getSkillId,
  grokSkillIdFromDevSkill,
} = require('./index');

function getDefaultOptions() {
  const projectRoot = process.cwd();
  return {
    projectRoot,
    grokRoot: path.join(projectRoot, '.grok'),
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

function exists(filePath) {
  return fs.existsSync(filePath);
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function hasFrontmatterName(content, name) {
  return new RegExp(`^name:\\s*${name}\\s*$`, 'm').test(content);
}

function sha256(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function getManifestEntryContent(grokRoot, entry) {
  const absolutePath = path.resolve(grokRoot, entry.path);
  const relative = path.relative(path.resolve(grokRoot), absolutePath);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Managed manifest path escapes .grok: ${entry.path}`);
  }
  const content = readText(absolutePath);
  return entry.mode === 'managed-sections'
    ? serializeManagedRuleSections(content)
    : content;
}

function validateDeterministicProjection(projectRoot, grokRoot, errors) {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'aiox-grok-validate-'));
  try {
    syncGrok({ projectRoot, grokRoot: tempRoot, quiet: true });
    const expectedManifest = readManagedManifest(path.join(tempRoot, MANAGED_MANIFEST_FILENAME));
    const actualManifest = readManagedManifest(path.join(grokRoot, MANAGED_MANIFEST_FILENAME));
    if (!actualManifest) {
      errors.push(`Missing managed manifest: .grok/${MANAGED_MANIFEST_FILENAME}`);
      return;
    }

    const expectedByPath = new Map(expectedManifest.files.map((entry) => [entry.path, entry]));
    const actualByPath = new Map(actualManifest.files.map((entry) => [entry.path, entry]));
    for (const expected of expectedManifest.files) {
      const actual = actualByPath.get(expected.path);
      if (!actual) {
        errors.push(`Managed manifest missing expected path: ${expected.path}`);
        continue;
      }
      const actualPath = path.join(grokRoot, ...expected.path.split('/'));
      if (!exists(actualPath)) {
        errors.push(`Missing managed Grok artifact: ${expected.path}`);
        continue;
      }
      const expectedContent = getManifestEntryContent(tempRoot, expected);
      const actualContent = getManifestEntryContent(grokRoot, actual);
      const actualHash = sha256(actualContent);
      if (actual.mode !== expected.mode || actual.sha256 !== expected.sha256) {
        errors.push(`Managed manifest drift: ${expected.path}`);
      }
      if (actualHash !== expected.sha256 || actualContent !== expectedContent) {
        errors.push(`Managed content drift: ${expected.path}`);
      }
    }
    for (const actual of actualManifest.files) {
      if (!expectedByPath.has(actual.path)) {
        errors.push(`Stale managed Grok artifact: ${actual.path}`);
      }
    }
  } catch (error) {
    errors.push(`Deterministic Grok validation failed: ${error.message}`);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

function collectSkillNames(root) {
  const names = new Map();
  if (!exists(root)) return names;
  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(absolutePath);
      if (!entry.isFile() || entry.name !== 'SKILL.md') continue;
      const match = readText(absolutePath).match(/^name:\s*([^\s]+)\s*$/m);
      if (match) names.set(match[1], absolutePath);
    }
  };
  visit(root);
  return names;
}

function getRuntimeDiagnostics(projectRoot, grokRoot) {
  const diagnostics = [];
  const grokSkills = collectSkillNames(path.join(grokRoot, 'skills'));
  const universalSkills = collectSkillNames(path.join(projectRoot, '.agents', 'skills'));
  const collisions = [...grokSkills.keys()].filter((name) => universalSkills.has(name)).sort();
  if (collisions.length > 0) {
    diagnostics.push(
      `Grok runtime skill collision (${collisions.length}): ${collisions.join(', ')}. ` +
      'The .agents tree is external to this projection; configure user-global skills.ignore if Grok does not deduplicate it.'
    );
  }
  const claudeSettings = path.join(projectRoot, '.claude', 'settings.local.json');
  if (
    exists(claudeSettings) &&
    readText(claudeSettings).includes('enforce-git-push-authority.cjs') &&
    exists(path.join(grokRoot, 'hooks', 'git-push-authority.json'))
  ) {
    diagnostics.push(
      'Grok discovers native and Claude-compatible authority registrations; matchers are harness-specific, but both remain visible in grok inspect.'
    );
  }
  return diagnostics;
}

function validateGrok(options = {}) {
  const resolved = { ...getDefaultOptions(), ...options };
  // Derive grokRoot from the caller's projectRoot (not process.cwd()) unless
  // explicitly overridden.
  if (options.projectRoot && !options.grokRoot) {
    resolved.grokRoot = path.join(options.projectRoot, '.grok');
  }
  const { projectRoot, grokRoot } = resolved;
  const errors = [];
  const warnings = [];
  const diagnostics = [];

  const push = (list, msg) => list.push(msg);

  if (!exists(grokRoot)) {
    push(errors, `Missing .grok root at ${grokRoot}`);
    return { ok: false, errors, warnings, diagnostics, counts: {} };
  }

  const expectedAgentIds = Object.keys(AGENT_PROFILES);
  const skillIds = expectedAgentIds.map((id) => getSkillId(id));

  for (const skillId of skillIds) {
    const agentMd = path.join(grokRoot, 'agents', `${skillId}.md`);
    const skillMd = path.join(grokRoot, 'skills', skillId, 'SKILL.md');
    const roleToml = path.join(grokRoot, 'roles', `${skillId}.toml`);
    const personaToml = path.join(grokRoot, 'personas', `${skillId}.toml`);

    for (const [label, filePath] of [
      ['agent', agentMd],
      ['skill', skillMd],
      ['role', roleToml],
      ['persona', personaToml],
    ]) {
      if (!exists(filePath)) {
        push(errors, `Missing ${label} for ${skillId}: ${path.relative(projectRoot, filePath)}`);
        continue;
      }
      const content = readText(filePath);
      if (label === 'agent' || label === 'skill') {
        if (!hasFrontmatterName(content, skillId)) {
          push(errors, `${label} ${skillId} missing frontmatter name: ${skillId}`);
        }
      }
      if (label === 'skill' && !content.includes(`.grok/agents/${skillId}.md`)) {
        push(errors, `skill ${skillId} does not load .grok/agents/${skillId}.md`);
      }
      if (label === 'role' && !content.includes(`prompt_file = ".grok/agents/${skillId}.md"`)) {
        push(warnings, `role ${skillId} missing prompt_file to agent profile`);
      }
      if (label === 'persona' && !content.includes('instructions')) {
        push(errors, `persona ${skillId} missing instructions`);
      }
    }
  }

  for (const wf of WORKFLOW_SKILLS) {
    const skillMd = path.join(grokRoot, 'skills', wf.name, 'SKILL.md');
    if (!exists(skillMd)) {
      push(errors, `Missing workflow skill: ${wf.name}`);
      continue;
    }
    if (!hasFrontmatterName(readText(skillMd), wf.name)) {
      push(errors, `Workflow skill ${wf.name} missing frontmatter name`);
    }
  }

  for (const dirName of DEVELOPMENT_WORKFLOW_SKILLS) {
    const skillId = grokSkillIdFromDevSkill(dirName);
    const skillMd = path.join(grokRoot, 'skills', skillId, 'SKILL.md');
    const source = path.join(
      projectRoot,
      '.aiox-core',
      'development',
      'skills',
      dirName,
      'SKILL.md'
    );
    if (!exists(source)) {
      push(warnings, `Development skill source missing (skipped at sync): ${dirName}`);
      continue;
    }
    if (!exists(skillMd)) {
      push(errors, `Missing synced development skill: ${skillId}`);
    } else if (!hasFrontmatterName(readText(skillMd), skillId)) {
      push(errors, `Development skill ${skillId} missing frontmatter name`);
    }
  }

  for (const { name, target } of SHORT_WORKFLOW_ALIASES) {
    const aliasMd = path.join(grokRoot, 'skills', name, 'SKILL.md');
    const targetMd = path.join(grokRoot, 'skills', target, 'SKILL.md');
    if (!exists(aliasMd)) {
      // The sync skips aliases whose canonical target was not generated —
      // absence is only an error when the target itself exists.
      if (exists(targetMd)) {
        push(errors, `Missing short alias skill: ${name} → ${target}`);
      } else {
        push(warnings, `Alias ${name} absent (target ${target} not generated)`);
      }
      continue;
    }
    if (!exists(targetMd)) {
      push(errors, `Alias ${name} redirects to missing skill: ${target}`);
    }
    const content = readText(aliasMd);
    if (!hasFrontmatterName(content, name)) {
      push(errors, `Alias ${name} missing frontmatter name`);
    }
    if (!content.includes(`.grok/skills/${target}/SKILL.md`)) {
      push(errors, `Alias ${name} does not redirect to ${target}`);
    }
  }

  for (const { alias, target } of SHORT_AGENT_ALIASES) {
    const agentMd = path.join(grokRoot, 'agents', `${alias}.md`);
    if (!exists(agentMd)) {
      push(errors, `Missing short agent alias: ${alias} → ${target}`);
      continue;
    }
    const content = readText(agentMd);
    if (!hasFrontmatterName(content, alias)) {
      push(errors, `Agent alias ${alias} missing frontmatter name`);
    }
    if (!content.includes(`.grok/agents/${target}.md`)) {
      push(errors, `Agent alias ${alias} does not load ${target}`);
    }
  }

  const canonicalHookDir = path.join(
    projectRoot,
    '.aiox-core',
    'infrastructure',
    'templates',
    'grok-hooks',
  );
  const requiredFiles = [
    path.join(grokRoot, 'rules', 'aiox-core.md'),
    path.join(grokRoot, 'README.md'),
    path.join(grokRoot, 'config.toml'),
    path.join(grokRoot, 'hooks', 'git-push-authority.json'),
    path.join(grokRoot, 'hooks', 'synapse-prompt.json'),
    path.join(grokRoot, 'hooks', 'precompact.json'),
    path.join(grokRoot, 'hooks', 'enforce-git-push-authority.cjs'),
    // Vendored copies under .grok/hooks (parity with Claude surface)
    path.join(grokRoot, 'hooks', 'synapse-wrapper.cjs'),
    path.join(grokRoot, 'hooks', 'precompact-wrapper.cjs'),
    // Canonical entrypoints referenced by shared hook commands
    path.join(canonicalHookDir, 'synapse-wrapper.cjs'),
    path.join(canonicalHookDir, 'precompact-wrapper.cjs'),
    path.join(canonicalHookDir, 'enforce-git-push-authority.cjs'),
    path.join(grokRoot, MANAGED_MANIFEST_FILENAME),
  ];
  for (const filePath of requiredFiles) {
    if (!exists(filePath)) {
      push(errors, `Missing harness file: ${path.relative(projectRoot, filePath)}`);
    }
  }

  if (exists(path.join(grokRoot, 'hooks', 'git-push-authority.json'))) {
    try {
      const hookJson = JSON.parse(
        readText(path.join(grokRoot, 'hooks', 'git-push-authority.json'))
      );
      const pre = hookJson?.hooks?.PreToolUse || [];
      const blob = JSON.stringify(pre);
      if (!blob.includes('enforce-git-push-authority.cjs')) {
        push(errors, 'Grok git-push-authority hook does not reference enforce-git-push-authority.cjs');
      }
      if (!blob.includes('run_terminal_command') && !blob.includes('Bash')) {
        push(errors, 'Grok git-push-authority matcher must cover Bash/run_terminal_command');
      }
    } catch (err) {
      push(errors, `Invalid git-push-authority.json: ${err.message}`);
    }
  }

  if (exists(path.join(grokRoot, 'config.toml'))) {
    const cfg = readText(path.join(grokRoot, 'config.toml'));
    // Project config documents harness; authority lives in hooks (not empty [permission]).
    if (!cfg.includes('git-push-authority') && !cfg.includes('Native authority')) {
      push(warnings, '.grok/config.toml should document native authority hook');
    }
  }

  // Dual-payload authority hook smoke test (isolated workspace — no bridge leaks)
  const hookPath = path.join(grokRoot, 'hooks', 'enforce-git-push-authority.cjs');
  if (exists(hookPath)) {
    const os = require('os');
    const cleanEnv = () => {
      const env = { ...process.env };
      for (const key of [
        'AIOX_ACTIVE_AGENT',
        'AIOX_AGENT',
        'ACTIVE_AGENT',
        'CLAUDE_AGENT_NAME',
        'CLAUDE_CODE_AGENT',
        'AIOX_CURRENT_AGENT',
        'GROK_ACTIVE_AGENT',
      ]) {
        delete env[key];
      }
      return env;
    };

    const emptyRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'aiox-hook-empty-'));
    const cases = [
      {
        label: 'claude tool_input',
        input: {
          hook_event_name: 'PreToolUse',
          tool_name: 'Bash',
          tool_input: { command: 'git push origin main' },
          cwd: emptyRoot,
          workspaceRoot: emptyRoot,
        },
        env: { AIOX_ACTIVE_AGENT: 'dev' },
        expectDeny: true,
      },
      {
        label: 'grok toolInput',
        input: {
          hookEventName: 'pre_tool_use',
          toolName: 'run_terminal_command',
          toolInput: { command: 'git push origin main' },
          cwd: emptyRoot,
          workspaceRoot: emptyRoot,
        },
        env: { AIOX_ACTIVE_AGENT: 'dev' },
        expectDeny: true,
      },
      {
        label: 'devops allow env',
        input: {
          toolInput: { command: 'git push origin main' },
          cwd: emptyRoot,
          workspaceRoot: emptyRoot,
        },
        env: { AIOX_ACTIVE_AGENT: 'devops' },
        expectDeny: false,
      },
    ];

    for (const testCase of cases) {
      const result = spawnSync(process.execPath, [hookPath], {
        input: JSON.stringify(testCase.input),
        encoding: 'utf8',
        env: { ...cleanEnv(), ...testCase.env },
        timeout: 5000,
      });
      if (result.error) {
        push(
          errors,
          `Authority hook spawn failed (${testCase.label}): ${result.error.message}`
        );
        continue;
      }
      // Deny paths emit JSON and exit 2; allow paths exit 0 without output.
      const expectedStatus = testCase.expectDeny ? 2 : 0;
      if (result.status !== expectedStatus) {
        push(
          errors,
          `Authority hook wrong exit status (${testCase.label}): expected ${expectedStatus}, got ${result.status} ${result.stderr || ''}`
        );
        continue;
      }
      const out = (result.stdout || '').trim();
      if (testCase.expectDeny) {
        if (!out) {
          push(errors, `Authority hook did not deny ${testCase.label}`);
          continue;
        }
        let parsed;
        try {
          parsed = JSON.parse(out);
        } catch {
          push(errors, `Authority hook invalid JSON for ${testCase.label}`);
          continue;
        }
        const denied =
          parsed.decision === 'deny' ||
          parsed?.hookSpecificOutput?.permissionDecision === 'deny';
        if (!denied) {
          push(errors, `Authority hook missing deny decision for ${testCase.label}`);
        }
      } else if (out) {
        push(errors, `Authority hook should allow devops (${testCase.label}), got: ${out}`);
      }
    }

    // Bridge-file allow path (Grok skill activation without env)
    const tmpBridge = fs.mkdtempSync(path.join(os.tmpdir(), 'aiox-bridge-'));
    fs.mkdirSync(path.join(tmpBridge, '.aiox'), { recursive: true });
    fs.writeFileSync(path.join(tmpBridge, '.aiox', 'active-agent'), 'devops\n', 'utf8');
    const bridgeResult = spawnSync(process.execPath, [hookPath], {
      input: JSON.stringify({
        toolInput: { command: 'git push origin main' },
        cwd: tmpBridge,
        workspaceRoot: tmpBridge,
      }),
      encoding: 'utf8',
      env: cleanEnv(),
      timeout: 5000,
    });
    if (bridgeResult.error) {
      push(errors, `Authority bridge test spawn failed: ${bridgeResult.error.message}`);
    } else if (bridgeResult.status !== 0) {
      push(errors, `Authority bridge test crashed: ${bridgeResult.stderr || bridgeResult.status}`);
    } else if ((bridgeResult.stdout || '').trim()) {
      push(
        errors,
        `Authority hook should allow bridge-file devops, got: ${bridgeResult.stdout}`
      );
    }
    for (const dir of [emptyRoot, tmpBridge]) {
      try {
        fs.rmSync(dir, { recursive: true, force: true });
      } catch {
        /* ignore */
      }
    }
  }

  validateDeterministicProjection(projectRoot, grokRoot, errors);
  diagnostics.push(...getRuntimeDiagnostics(projectRoot, grokRoot));

  const ok = errors.length === 0 && (!resolved.strict || warnings.length === 0);
  return {
    ok,
    errors,
    warnings,
    diagnostics,
    counts: {
      agents: skillIds.length,
      workflowSkills: WORKFLOW_SKILLS.length,
      developmentSkills: DEVELOPMENT_WORKFLOW_SKILLS.length,
      shortAliases: SHORT_WORKFLOW_ALIASES.length,
      agentAliases: SHORT_AGENT_ALIASES.length,
    },
  };
}

function main() {
  const cli = parseArgs();
  const result = validateGrok(cli);

  if (cli.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else if (!cli.quiet) {
    console.log(
      `Grok validate: agents=${result.counts.agents} workflows=${result.counts.workflowSkills} aliases=${result.counts.shortAliases}`
    );
    for (const w of result.warnings) console.warn(`⚠️  ${w}`);
    for (const diagnostic of result.diagnostics) console.info(`ℹ️  ${diagnostic}`);
    for (const e of result.errors) console.error(`❌ ${e}`);
    if (result.ok) {
      console.log('✅ Grok skills/agents/hooks validation passed');
    } else {
      console.error('❌ Grok validation failed');
    }
  }

  process.exitCode = result.ok ? 0 : 1;
}

if (require.main === module) {
  main();
}

module.exports = {
  validateGrok,
  parseArgs,
  getDefaultOptions,
};
