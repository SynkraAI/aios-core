#!/usr/bin/env node

/**
 * Test Results Sync Script
 * Enterprise QA DevOps Squad
 *
 * Syncs test results from CI/CD to Xray and generates reports.
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { JiraClient } = require('../tools/jira-client');
const { XrayClient } = require('../tools/xray-client');
const { ConfluenceClient } = require('../tools/confluence-client');

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function parseArgs(args) {
  const parsed = {
    file: null,
    format: 'junit',
    project: null,
    testPlan: null,
    summary: null,
    createPage: false,
    notify: false,
    dryRun: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    switch (arg) {
      case '--file':
      case '-f':
        parsed.file = next;
        i++;
        break;
      case '--format':
        parsed.format = next;
        i++;
        break;
      case '--project':
      case '-p':
        parsed.project = next;
        i++;
        break;
      case '--test-plan':
        parsed.testPlan = next;
        i++;
        break;
      case '--summary':
      case '-s':
        parsed.summary = next;
        i++;
        break;
      case '--create-page':
        parsed.createPage = true;
        break;
      case '--notify':
        parsed.notify = true;
        break;
      case '--dry-run':
        parsed.dryRun = true;
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
    }
  }

  return parsed;
}

function printHelp() {
  console.log(`
Usage: node sync-test-results.js [options]

Options:
  -f, --file <path>     Path to test results file (required)
  --format <type>       Result format: junit, cucumber, robot (default: junit)
  -p, --project <key>   Jira project key (required)
  --test-plan <key>     Test plan issue key
  -s, --summary <text>  Execution summary
  --create-page         Create Confluence report page
  --notify              Send Teams notification
  --dry-run             Validate without importing
  -h, --help            Show this help

Examples:
  node sync-test-results.js -f results.xml -p PROJ
  node sync-test-results.js -f cucumber.json --format cucumber -p PROJ --test-plan PROJ-100
  node sync-test-results.js -f results.xml -p PROJ --create-page --notify
`);
}

async function importResults(xray, options) {
  const { file, format, project, testPlan, summary } = options;

  const params = {
    projectKey: project
  };

  if (testPlan) params.testPlanKey = testPlan;
  if (summary) params.summary = summary;

  log(`\nImporting ${format} results from: ${file}`, 'cyan');

  let result;

  switch (format) {
    case 'junit':
      result = await xray.importJunit(file, params);
      break;
    case 'cucumber':
      const cucumberData = JSON.parse(fs.readFileSync(file, 'utf-8'));
      result = await xray.importCucumber(cucumberData, params);
      break;
    case 'robot':
      result = await xray.importRobotFramework(file, params);
      break;
    default:
      throw new Error(`Unsupported format: ${format}`);
  }

  return result;
}

function parseResults(file, format) {
  const content = fs.readFileSync(file, 'utf-8');
  let stats = { total: 0, passed: 0, failed: 0, skipped: 0, duration: 0 };

  if (format === 'junit') {
    // Simple JUnit parsing
    const testsMatch = content.match(/tests="(\d+)"/g);
    const failuresMatch = content.match(/failures="(\d+)"/g);
    const errorsMatch = content.match(/errors="(\d+)"/g);
    const skippedMatch = content.match(/skipped="(\d+)"/g);
    const timeMatch = content.match(/time="([\d.]+)"/g);

    if (testsMatch) {
      stats.total = testsMatch.reduce((sum, m) => sum + parseInt(m.match(/\d+/)[0]), 0);
    }
    if (failuresMatch) {
      stats.failed = failuresMatch.reduce((sum, m) => sum + parseInt(m.match(/\d+/)[0]), 0);
    }
    if (errorsMatch) {
      stats.failed += errorsMatch.reduce((sum, m) => sum + parseInt(m.match(/\d+/)[0]), 0);
    }
    if (skippedMatch) {
      stats.skipped = skippedMatch.reduce((sum, m) => sum + parseInt(m.match(/\d+/)[0]), 0);
    }
    if (timeMatch) {
      stats.duration = timeMatch.reduce((sum, m) => sum + parseFloat(m.match(/[\d.]+/)[0]), 0);
    }

    stats.passed = stats.total - stats.failed - stats.skipped;

  } else if (format === 'cucumber') {
    const data = JSON.parse(content);
    for (const feature of data) {
      for (const scenario of feature.elements || []) {
        if (scenario.type !== 'scenario') continue;
        stats.total++;

        let status = 'passed';
        for (const step of scenario.steps || []) {
          stats.duration += (step.result?.duration || 0) / 1e9;
          if (step.result?.status === 'failed') status = 'failed';
          else if (step.result?.status === 'skipped' && status !== 'failed') status = 'skipped';
        }

        stats[status]++;
      }
    }
  }

  return stats;
}

async function createConfluencePage(confluence, options, importResult, stats) {
  const { project, testPlan, summary } = options;

  const title = `Test Report - ${importResult.key || 'Execution'} - ${new Date().toISOString().split('T')[0]}`;
  const passRate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : 0;

  const content = `
<h1>Test Execution Report</h1>

<ac:structured-macro ac:name="status">
  <ac:parameter ac:name="title">${stats.failed === 0 ? 'PASSED' : 'FAILED'}</ac:parameter>
  <ac:parameter ac:name="colour">${stats.failed === 0 ? 'Green' : 'Red'}</ac:parameter>
</ac:structured-macro>

<h2>Summary</h2>
<table>
  <tr><th>Metric</th><th>Value</th></tr>
  <tr><td>Total Tests</td><td>${stats.total}</td></tr>
  <tr><td>Passed</td><td>${stats.passed} ✅</td></tr>
  <tr><td>Failed</td><td>${stats.failed} ❌</td></tr>
  <tr><td>Skipped</td><td>${stats.skipped} ⏭️</td></tr>
  <tr><td>Pass Rate</td><td>${passRate}%</td></tr>
  <tr><td>Duration</td><td>${stats.duration.toFixed(2)}s</td></tr>
</table>

<h2>Links</h2>
<ul>
  <li><a href="https://${process.env.ATLASSIAN_DOMAIN}/browse/${importResult.key}">Test Execution in Xray</a></li>
  ${testPlan ? `<li><a href="https://${process.env.ATLASSIAN_DOMAIN}/browse/${testPlan}">Test Plan</a></li>` : ''}
</ul>

<p><em>Generated by AIOS Enterprise QA DevOps Squad</em></p>
`;

  const page = await confluence.createPage(project, title, content, {
    parentTitle: 'Test Reports',
    labels: ['test-report', 'automated']
  });

  return page;
}

async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  // Validate required options
  if (!options.file) {
    log('Error: --file is required', 'red');
    printHelp();
    process.exit(1);
  }

  if (!options.project) {
    log('Error: --project is required', 'red');
    printHelp();
    process.exit(1);
  }

  if (!fs.existsSync(options.file)) {
    log(`Error: File not found: ${options.file}`, 'red');
    process.exit(1);
  }

  log('\n=== Test Results Sync ===', 'cyan');
  log(`File: ${options.file}`);
  log(`Format: ${options.format}`);
  log(`Project: ${options.project}`);
  if (options.testPlan) log(`Test Plan: ${options.testPlan}`);
  if (options.dryRun) log('Mode: DRY RUN', 'yellow');

  // Parse results locally first
  const stats = parseResults(options.file, options.format);

  log('\n--- Local Analysis ---');
  log(`  Total: ${stats.total}`);
  log(`  Passed: ${stats.passed}`, stats.passed === stats.total ? 'green' : 'reset');
  log(`  Failed: ${stats.failed}`, stats.failed > 0 ? 'red' : 'green');
  log(`  Skipped: ${stats.skipped}`);
  log(`  Duration: ${stats.duration.toFixed(2)}s`);

  if (options.dryRun) {
    log('\nDry run complete. No changes made.', 'yellow');
    process.exit(0);
  }

  // Import to Xray
  const xray = new XrayClient();
  const importResult = await importResults(xray, options);

  log('\n--- Import Result ---', 'green');
  log(`  Execution Key: ${importResult.key}`);

  // Create Confluence page if requested
  if (options.createPage) {
    const confluence = new ConfluenceClient();
    const page = await createConfluencePage(confluence, options, importResult, stats);
    log(`  Confluence Page: ${page.url || page._links?.webui}`, 'cyan');
  }

  // Notify if requested
  if (options.notify) {
    log('\n  Teams notification would be sent here (not implemented in script)', 'yellow');
  }

  log('\n=== Sync Complete ===', 'green');
}

main().catch(error => {
  log(`\nError: ${error.message}`, 'red');
  if (process.env.DEBUG) {
    console.error(error.stack);
  }
  process.exit(1);
});
