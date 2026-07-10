#!/usr/bin/env node
/**
 * CLI bridge for automated model dispatch governance.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const {
  assertDispatchGovernance,
} = require('../../core/permissions/dispatch-governance');

/**
 * Load the optional JSON context supplied to a model dispatch.
 * @param {string} [filePath] - Context JSON path; empty means no context.
 * @returns {object} Parsed context object.
 * @throws {SyntaxError|Error} When the file cannot be read or parsed.
 */
function loadContext(filePath) {
  if (!filePath) return {};
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/**
 * Run the pre-dispatch gate from exact environment variables set by pm.sh.
 *
 * @param {NodeJS.ProcessEnv} [env] - Environment source.
 * @param {string} [projectRoot] - Repository root.
 * @returns {{ budgetCeilingUsd: number, story: object|null, scan: object }} Evidence.
 */
function run(env = process.env, projectRoot = env.AIOX_PROJECT_ROOT || process.cwd()) {
  const contextFile = env.AIOX_DISPATCH_CONTEXT || '';
  const context = loadContext(contextFile);
  const task = env.AIOX_DISPATCH_TASK || '';
  const params = env.AIOX_DISPATCH_PARAMS || '';
  const story =
    context.storyPath || context.story || context.storyId || context.metadata?.storyPath || params;
  const intent = JSON.stringify({
    agent: env.AIOX_DISPATCH_AGENT || '',
    task,
    params,
    context,
  });
  return assertDispatchGovernance({
    budgetCeilingUsd: env.AIOX_MODEL_BUDGET_CEILING_USD,
    task,
    intent,
    story,
    projectRoot: path.resolve(projectRoot),
  });
}

/**
 * Execute the environment-backed guard and expose a stable CLI exit contract.
 * @returns {void}
 */
function main() {
  try {
    const evidence = run();
    process.stdout.write(
      `Dispatch governance: OK (budget ceiling USD ${evidence.budgetCeilingUsd.toFixed(2)})\n`,
    );
  } catch (error) {
    process.stderr.write(`[${error.code || 'DISPATCH_GOVERNANCE'}] ${error.message}\n`);
    process.exitCode = 5;
  }
}

if (require.main === module) main();

module.exports = { loadContext, run, main };
