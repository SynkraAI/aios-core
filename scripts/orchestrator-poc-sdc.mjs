#!/usr/bin/env node

/**
 * orchestrator-poc-sdc.mjs
 *
 * Phase 0 PoC — Story E7.0.2
 * Executes the full SDC cycle (SM -> PO -> DEV -> QA -> DEVOPS) via 5
 * sequential `claude -p` calls. Output of each phase feeds the next.
 *
 * Features:
 *   - 5-phase sequential execution with context passing
 *   - PO GO/NO-GO parsing with SM retry (max 2)
 *   - QA PASS/FAIL/CONCERNS parsing with DEV retry (max 3)
 *   - Per-phase timing and cost tracking
 *   - Budget caps per agent (from poc-agent-config.json)
 *   - Tool restrictions per agent (from authority matrix)
 *   - Final notification via OpenClaw
 *   - --setting-sources user,project for CLAUDE.md loading
 *   - --permission-mode bypassPermissions for autonomous execution
 *
 * Exit codes:
 *   0 — success (SDC completed)
 *   1 — agent/workflow error (parse failure, max retries, budget exceeded)
 *   2 — configuration error (missing files, claude not in PATH)
 *
 * Usage:
 *   node scripts/orchestrator-poc-sdc.mjs --story docs/stories/active/X.story.md
 */

import { resolve } from 'node:path';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import {
  PROJECT_ROOT,
  log,
  ensureClaudeCLI,
  ensureFileExists,
  ensureDir,
  runAgent,
  parseAgentOutput,
  extractResponseText,
  verifyToolRestrictions,
  extractCost,
  saveJson,
  readFile,
  logPhase,
  parseGoNoGo,
  parseQaVerdict,
} from './poc-lib.mjs';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const OUTPUT_DIR = resolve(PROJECT_ROOT, 'scripts/poc-output');
const MAX_PO_RETRIES = 2;
const MAX_QA_RETRIES = 3;

// SDC phase order
const PHASE_ORDER = ['sm', 'po', 'dev', 'qa', 'devops'];

// ---------------------------------------------------------------------------
// Load agent configs
// ---------------------------------------------------------------------------

function loadAgentConfigs() {
  const configPath = resolve(PROJECT_ROOT, 'scripts/poc-agent-config.json');
  ensureFileExists(configPath, 'Agent config file');
  return JSON.parse(readFile(configPath));
}

// ---------------------------------------------------------------------------
// Parse CLI arguments
// ---------------------------------------------------------------------------

function parseArgs() {
  const args = process.argv.slice(2);
  let storyPath = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--story' && args[i + 1]) {
      storyPath = args[i + 1];
      i++;
    }
  }

  if (!storyPath) {
    log('error', 'Usage: node scripts/orchestrator-poc-sdc.mjs --story <path-to-story>');
    process.exit(2);
  }

  // Resolve relative to PROJECT_ROOT if not absolute
  if (!storyPath.startsWith('/')) {
    storyPath = resolve(PROJECT_ROOT, storyPath);
  }

  ensureFileExists(storyPath, 'Story file');
  return { storyPath };
}

// ---------------------------------------------------------------------------
// Git status helper (for DEV re-run context)
// ---------------------------------------------------------------------------

function getGitStatus() {
  try {
    return execSync('git status --short', {
      cwd: PROJECT_ROOT,
      encoding: 'utf-8',
      timeout: 10_000,
    }).trim();
  } catch {
    return '(git status unavailable)';
  }
}

// ---------------------------------------------------------------------------
// Prompt builders for each phase
// ---------------------------------------------------------------------------

function buildSmPrompt(storyContent) {
  return `You are executing the SM:CREATE phase of the Story Development Cycle (SDC).

Story file content:
---
${storyContent}
---

Your task: Review this story and ensure it is well-structured. Verify it has all required sections (Status, Story, Acceptance Criteria, Tasks, File List, Definition of Done). If any section is missing or incomplete, note what needs to be added. Provide your assessment as a structured response.

IMPORTANT: Only use Read, Write, Grep, and Glob tools. Do NOT use Bash or Edit.`;
}

function buildPoPrompt(storyContent, smOutputText) {
  return `You are executing the PO:VALIDATE phase of the Story Development Cycle (SDC).

Story file content:
---
${storyContent}
---

Previous phase (SM:CREATE) output:
---
${smOutputText}
---

Your task: Validate this story using the standard 10-point checklist. Evaluate:
1. Clear title
2. Sufficient context
3. Complete ACs
4. Actionable ACs
5. Adequate technical notes
6. Correct dependencies
7. File list present
8. Reasonable estimate
9. PRD alignment
10. Clear DoD

Provide your score (X/10) and a clear **GO** or **NO-GO** decision with reasoning.

IMPORTANT: Only use Read, Grep, and Glob tools. Do NOT use Edit, Write, or Bash.`;
}

function buildDevPrompt(storyContent, poOutputText) {
  return `You are executing the DEV:IMPLEMENT phase of the Story Development Cycle (SDC).

Story file content:
---
${storyContent}
---

Previous phase (PO:VALIDATE) output:
---
${poOutputText}
---

Your task: Review the story tasks and acceptance criteria. For this PoC, provide an implementation plan listing:
1. Files to create/modify
2. Key code patterns to use
3. Testing approach
4. Any risks or concerns

This is a DRY RUN — analyze and plan, but describe what you WOULD implement. List specific file paths, function signatures, and code structure.

You may use any tools available to you (Read, Edit, Write, Bash, Grep, Glob).`;
}

function buildDevRetryPrompt(storyContent, poOutputText, qaOutputText, gitStatus) {
  return `You are RE-EXECUTING the DEV:IMPLEMENT phase after QA feedback.

Story file content:
---
${storyContent}
---

PO:VALIDATE output:
---
${poOutputText}
---

QA feedback (FAIL):
---
${qaOutputText}
---

Git status (current state):
---
${gitStatus}
---

Your task: Address the QA feedback. Review the issues raised by QA and provide an updated implementation plan that resolves them. For this PoC, describe the specific fixes you would make.

You may use any tools available to you (Read, Edit, Write, Bash, Grep, Glob).`;
}

function buildQaPrompt(storyContent, devOutputText) {
  return `You are executing the QA:GATE phase of the Story Development Cycle (SDC).

Story file content:
---
${storyContent}
---

Previous phase (DEV:IMPLEMENT) output:
---
${devOutputText}
---

Your task: Review the implementation output from the DEV phase against the story's acceptance criteria. Evaluate:
1. Are all ACs addressed?
2. Is the implementation approach sound?
3. Are there testing gaps?
4. Are there any security concerns?
5. Does it follow coding standards?
6. Are there edge cases not handled?
7. Is the file list complete?

Provide a clear verdict: **PASS**, **CONCERNS** (with details), or **FAIL** (with specific issues to fix).

IMPORTANT: Only use Read, Grep, Glob, and Bash tools. Do NOT use Edit or Write.`;
}

function buildDevopsPrompt(storyContent, qaOutputText) {
  return `You are executing the DEVOPS:PUSH phase of the Story Development Cycle (SDC).

Story file content:
---
${storyContent}
---

Previous phase (QA:GATE) output:
---
${qaOutputText}
---

Your task: This is a DRY RUN of the push phase. Review the QA verdict and determine if the story is ready for merge. Provide:
1. Pre-push checklist assessment
2. Branch strategy recommendation
3. Any CI/CD considerations
4. Whether a PR draft or direct push is appropriate

DO NOT actually push or create PRs. This is a PoC analysis only.

IMPORTANT: Only use Read, Bash, Grep, and Glob tools. Do NOT use Edit or Write.`;
}

// ---------------------------------------------------------------------------
// Execute a single phase
// ---------------------------------------------------------------------------

async function executePhase(agentConfig, prompt, phaseNum) {
  const outputPath = resolve(OUTPUT_DIR, `phase-${phaseNum}-${agentConfig.id}.json`);

  const result = await runAgent(agentConfig, prompt);

  log('info', `Phase ${phaseNum} (${agentConfig.phaseName}) exited with code ${result.code} in ${result.durationMs}ms`);

  if (result.code !== 0) {
    log('error', `Phase ${phaseNum} (${agentConfig.phaseName}) failed with exit code ${result.code}`);
    log('error', `stdout: ${result.stdout.slice(0, 500)}`);
    return { success: false, durationMs: result.durationMs, costUsd: null, text: '', violations: [] };
  }

  const parsed = parseAgentOutput(result.stdout);
  if (!parsed) {
    log('error', `Phase ${phaseNum} (${agentConfig.phaseName}): failed to parse JSON output`);
    return { success: false, durationMs: result.durationMs, costUsd: null, text: '', violations: [] };
  }

  const text = extractResponseText(parsed);
  const cost = extractCost(parsed);
  const { toolsUsed, violations } = verifyToolRestrictions(parsed, agentConfig.disallowedTools || []);

  log('info', `Phase ${phaseNum} tools used: ${toolsUsed.length > 0 ? toolsUsed.join(', ') : '(none detected)'}`);
  if (violations.length > 0) {
    log('warn', `TOOL VIOLATION in phase ${phaseNum}: ${violations.join(', ')}`);
  }

  // Save output
  saveJson(outputPath, parsed);
  logPhase(agentConfig.id, result.durationMs, cost);

  return { success: true, durationMs: result.durationMs, costUsd: cost, text, violations, parsed };
}

// ---------------------------------------------------------------------------
// OpenClaw notification
// ---------------------------------------------------------------------------

function sendNotification(storyPath, resultStatus, totalCostUsd, totalDurationMs, poRetries, qaRetries) {
  const storyName = storyPath.split('/').pop();
  const durationMin = (totalDurationMs / 60_000).toFixed(1);
  const costStr = totalCostUsd !== null ? `$${totalCostUsd.toFixed(2)}` : '$N/A';

  const message = `[AIOS-PoC] SDC completed: story=${storyName} result=${resultStatus} cost=${costStr} time=${durationMin}min po_retries=${poRetries} qa_retries=${qaRetries}`;

  log('info', `Sending notification: ${message}`);

  try {
    execSync(
      `sudo /usr/bin/openclaw message send --target +5528999301848 --message "${message.replace(/"/g, '\\"')}"`,
      { cwd: PROJECT_ROOT, timeout: 30_000, stdio: 'pipe' }
    );
    log('info', 'OpenClaw notification sent successfully');
  } catch (err) {
    log('warn', `OpenClaw notification failed (non-fatal): ${err.message}`);
  }
}

// ---------------------------------------------------------------------------
// Main SDC workflow
// ---------------------------------------------------------------------------

async function main() {
  log('info', '=== AIOS SDK Orchestrator PoC — SDC Sequential Chain ===');

  // Pre-flight
  ensureClaudeCLI();
  const { storyPath } = parseArgs();
  ensureDir(OUTPUT_DIR);

  const configs = loadAgentConfigs();
  const storyContent = readFile(storyPath);

  log('info', `Story: ${storyPath}`);
  log('info', `Story length: ${storyContent.length} chars`);
  log('info', `Phases: ${PHASE_ORDER.join(' -> ')}`);

  // Metrics accumulators
  const metrics = {
    phases: {},
    totalDurationMs: 0,
    totalCostUsd: 0,
    poRetries: 0,
    qaRetries: 0,
  };

  const sdcStartMs = Date.now();
  let abortReason = null;

  // =======================================================================
  // Phase 1: SM:CREATE
  // =======================================================================
  let smOutputText = '';
  let smDone = false;

  for (let attempt = 0; attempt <= MAX_PO_RETRIES; attempt++) {
    log('info', `\n=== Phase 1: SM:CREATE ${attempt > 0 ? `(retry ${attempt})` : ''} ===`);

    const smPrompt = buildSmPrompt(storyContent);
    const smResult = await executePhase(configs.sm, smPrompt, 1);

    metrics.phases.sm = { durationMs: smResult.durationMs, costUsd: smResult.costUsd, violations: smResult.violations };
    metrics.totalDurationMs += smResult.durationMs;
    if (smResult.costUsd) metrics.totalCostUsd += smResult.costUsd;

    if (!smResult.success) {
      abortReason = 'SM:CREATE failed';
      break;
    }

    smOutputText = smResult.text;

    // =======================================================================
    // Phase 2: PO:VALIDATE
    // =======================================================================
    log('info', '\n=== Phase 2: PO:VALIDATE ===');

    const poPrompt = buildPoPrompt(storyContent, smOutputText);
    const poResult = await executePhase(configs.po, poPrompt, 2);

    metrics.phases.po = { durationMs: poResult.durationMs, costUsd: poResult.costUsd, violations: poResult.violations };
    metrics.totalDurationMs += poResult.durationMs;
    if (poResult.costUsd) metrics.totalCostUsd += poResult.costUsd;

    if (!poResult.success) {
      abortReason = 'PO:VALIDATE failed';
      break;
    }

    // Parse GO/NO-GO
    const decision = parseGoNoGo(poResult.text);
    log('info', `PO decision: ${decision || 'PARSE_FAILURE (treating as NO-GO)'}`);

    if (decision === 'GO') {
      smDone = true;
      // Store PO output for DEV phase
      metrics.phases.po.outputText = poResult.text;
      break;
    }

    // NO-GO or parse failure
    if (attempt < MAX_PO_RETRIES) {
      metrics.poRetries++;
      log('info', `RETRY: po_no_go retry=${metrics.poRetries}`);
    } else {
      abortReason = `ABORTED: po_no_go max_retries=${MAX_PO_RETRIES}`;
    }
  }

  if (abortReason) {
    log('error', abortReason);
    const totalMs = Date.now() - sdcStartMs;
    printSummary(metrics, totalMs, 'FAILED');
    sendNotification(storyPath, 'FAILED', metrics.totalCostUsd, totalMs, metrics.poRetries, metrics.qaRetries);
    process.exit(1);
  }

  if (!smDone) {
    log('error', 'SM/PO loop did not complete successfully');
    process.exit(1);
  }

  const poOutputText = metrics.phases.po.outputText;

  // =======================================================================
  // Phase 3: DEV:IMPLEMENT (with QA retry loop)
  // =======================================================================
  let devOutputText = '';
  let qaOutputText = '';
  let devQaDone = false;

  for (let qaAttempt = 0; qaAttempt <= MAX_QA_RETRIES; qaAttempt++) {
    // DEV phase
    log('info', `\n=== Phase 3: DEV:IMPLEMENT ${qaAttempt > 0 ? `(retry ${qaAttempt} after QA FAIL)` : ''} ===`);

    let devPrompt;
    if (qaAttempt === 0) {
      devPrompt = buildDevPrompt(storyContent, poOutputText);
    } else {
      const gitStatus = getGitStatus();
      devPrompt = buildDevRetryPrompt(storyContent, poOutputText, qaOutputText, gitStatus);
    }

    const devResult = await executePhase(configs.dev, devPrompt, 3);

    metrics.phases.dev = { durationMs: (metrics.phases.dev?.durationMs || 0) + devResult.durationMs, costUsd: (metrics.phases.dev?.costUsd || 0) + (devResult.costUsd || 0), violations: devResult.violations };
    metrics.totalDurationMs += devResult.durationMs;
    if (devResult.costUsd) metrics.totalCostUsd += devResult.costUsd;

    if (!devResult.success) {
      abortReason = 'DEV:IMPLEMENT failed';
      break;
    }

    devOutputText = devResult.text;

    // =======================================================================
    // Phase 4: QA:GATE
    // =======================================================================
    log('info', '\n=== Phase 4: QA:GATE ===');

    const qaPrompt = buildQaPrompt(storyContent, devOutputText);
    const qaResult = await executePhase(configs.qa, qaPrompt, 4);

    metrics.phases.qa = { durationMs: (metrics.phases.qa?.durationMs || 0) + qaResult.durationMs, costUsd: (metrics.phases.qa?.costUsd || 0) + (qaResult.costUsd || 0), violations: qaResult.violations };
    metrics.totalDurationMs += qaResult.durationMs;
    if (qaResult.costUsd) metrics.totalCostUsd += qaResult.costUsd;

    if (!qaResult.success) {
      abortReason = 'QA:GATE failed';
      break;
    }

    qaOutputText = qaResult.text;

    // Parse verdict
    const verdict = parseQaVerdict(qaOutputText);
    log('info', `QA verdict: ${verdict || 'PARSE_FAILURE (treating as FAIL)'}`);

    if (verdict === 'PASS') {
      devQaDone = true;
      break;
    }

    if (verdict === 'CONCERNS') {
      log('warn', 'WARNING: qa_concerns — continuing to DEVOPS');
      devQaDone = true;
      break;
    }

    // FAIL or parse failure
    if (qaAttempt < MAX_QA_RETRIES) {
      metrics.qaRetries++;
      log('info', `RETRY: qa_fail retry=${metrics.qaRetries}`);
    } else {
      abortReason = `ABORTED: qa_fail max_retries=${MAX_QA_RETRIES}`;
    }
  }

  if (abortReason) {
    log('error', abortReason);
    const totalMs = Date.now() - sdcStartMs;
    printSummary(metrics, totalMs, 'FAILED');
    sendNotification(storyPath, 'FAILED', metrics.totalCostUsd, totalMs, metrics.poRetries, metrics.qaRetries);
    process.exit(1);
  }

  if (!devQaDone) {
    log('error', 'DEV/QA loop did not complete successfully');
    process.exit(1);
  }

  // =======================================================================
  // Phase 5: DEVOPS:PUSH
  // =======================================================================
  log('info', '\n=== Phase 5: DEVOPS:PUSH ===');

  const devopsPrompt = buildDevopsPrompt(storyContent, qaOutputText);
  const devopsResult = await executePhase(configs.devops, devopsPrompt, 5);

  metrics.phases.devops = { durationMs: devopsResult.durationMs, costUsd: devopsResult.costUsd, violations: devopsResult.violations };
  metrics.totalDurationMs += devopsResult.durationMs;
  if (devopsResult.costUsd) metrics.totalCostUsd += devopsResult.costUsd;

  if (!devopsResult.success) {
    log('error', 'DEVOPS:PUSH failed');
    const totalMs = Date.now() - sdcStartMs;
    printSummary(metrics, totalMs, 'FAILED');
    sendNotification(storyPath, 'FAILED', metrics.totalCostUsd, totalMs, metrics.poRetries, metrics.qaRetries);
    process.exit(1);
  }

  // =======================================================================
  // Success
  // =======================================================================
  const totalMs = Date.now() - sdcStartMs;
  printSummary(metrics, totalMs, 'SUCCESS');
  sendNotification(storyPath, 'SUCCESS', metrics.totalCostUsd, totalMs, metrics.poRetries, metrics.qaRetries);

  process.exit(0);
}

// ---------------------------------------------------------------------------
// Summary printer
// ---------------------------------------------------------------------------

function printSummary(metrics, totalMs, status) {
  log('info', '\n=== SDC Execution Summary ===');
  log('info', `status=${status}`);
  log('info', `total_duration_ms=${totalMs} total_cost_usd=${metrics.totalCostUsd.toFixed(4)}`);
  log('info', `po_retries=${metrics.poRetries} qa_retries=${metrics.qaRetries}`);

  for (const [phase, data] of Object.entries(metrics.phases)) {
    if (data) {
      const costStr = data.costUsd !== null && data.costUsd !== undefined ? data.costUsd.toFixed(4) : 'N/A';
      const violationCount = data.violations ? data.violations.length : 0;
      log('info', `  phase=${phase} duration_ms=${data.durationMs} cost_usd=${costStr} violations=${violationCount}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

main().catch((err) => {
  log('error', `Unhandled error: ${err.message}`);
  process.exit(1);
});
