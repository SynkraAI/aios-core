#!/usr/bin/env node

/**
 * Health Check Script
 * Enterprise QA DevOps Squad
 *
 * Validates connectivity to all integrated services.
 */

require('dotenv').config();

const { JiraClient } = require('../tools/jira-client');
const { XrayClient } = require('../tools/xray-client');
const { ConfluenceClient } = require('../tools/confluence-client');
const { GraphClient } = require('../tools/graph-client');

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m'
};

function colorize(text, color) {
  return `${COLORS[color]}${text}${COLORS.reset}`;
}

function printHeader(title) {
  console.log('\n' + colorize('═'.repeat(50), 'cyan'));
  console.log(colorize(`  ${title}`, 'cyan'));
  console.log(colorize('═'.repeat(50), 'cyan'));
}

function printResult(service, status, message) {
  const icon = status === 'healthy' ? '✓' : status === 'warning' ? '!' : '✗';
  const color = status === 'healthy' ? 'green' : status === 'warning' ? 'yellow' : 'red';

  console.log(`  ${colorize(icon, color)} ${service.padEnd(20)} ${colorize(status.toUpperCase(), color)}`);
  if (message) {
    console.log(`    ${colorize(message, 'dim')}`);
  }
}

async function checkService(name, checkFn) {
  try {
    const result = await checkFn();
    return { name, ...result };
  } catch (error) {
    return {
      name,
      status: 'unhealthy',
      message: error.message
    };
  }
}

async function checkJira() {
  if (!process.env.ATLASSIAN_DOMAIN || !process.env.ATLASSIAN_EMAIL || !process.env.ATLASSIAN_API_TOKEN) {
    return { status: 'skipped', message: 'Credentials not configured' };
  }

  const client = new JiraClient();
  const result = await client.healthCheck();

  if (result.status === 'healthy') {
    // Additional check: can we search?
    try {
      await client.search({ jql: 'created >= -1d', maxResults: 1 });
      result.message = 'Connected and can search issues';
    } catch (e) {
      result.status = 'warning';
      result.message = 'Connected but search may be limited';
    }
  }

  return result;
}

async function checkXray() {
  if (!process.env.XRAY_CLIENT_ID || !process.env.XRAY_CLIENT_SECRET) {
    return { status: 'skipped', message: 'Credentials not configured' };
  }

  const client = new XrayClient();
  return await client.healthCheck();
}

async function checkConfluence() {
  if (!process.env.ATLASSIAN_DOMAIN || !process.env.ATLASSIAN_EMAIL || !process.env.ATLASSIAN_API_TOKEN) {
    return { status: 'skipped', message: 'Credentials not configured' };
  }

  const client = new ConfluenceClient();
  const result = await client.healthCheck();

  if (result.status === 'healthy') {
    result.message = 'Connected and can access spaces';
  }

  return result;
}

async function checkMicrosoft365() {
  if (!process.env.MS365_CLIENT_ID || !process.env.MS365_CLIENT_SECRET || !process.env.MS365_TENANT_ID) {
    return { status: 'skipped', message: 'Credentials not configured' };
  }

  const client = new GraphClient();
  return await client.healthCheck();
}

async function checkEnvironment() {
  const checks = [];

  // Required variables
  const required = [
    'ATLASSIAN_DOMAIN',
    'ATLASSIAN_EMAIL',
    'ATLASSIAN_API_TOKEN',
    'XRAY_CLIENT_ID',
    'XRAY_CLIENT_SECRET'
  ];

  const optional = [
    'MS365_CLIENT_ID',
    'MS365_CLIENT_SECRET',
    'MS365_TENANT_ID'
  ];

  let allRequired = true;
  let anyOptional = false;

  for (const v of required) {
    if (!process.env[v]) {
      checks.push({ var: v, status: 'missing', required: true });
      allRequired = false;
    } else {
      checks.push({ var: v, status: 'set', required: true });
    }
  }

  for (const v of optional) {
    if (process.env[v]) {
      checks.push({ var: v, status: 'set', required: false });
      anyOptional = true;
    } else {
      checks.push({ var: v, status: 'not set', required: false });
    }
  }

  return {
    checks,
    allRequired,
    anyOptional,
    status: allRequired ? 'healthy' : 'unhealthy'
  };
}

async function main() {
  console.log(colorize('\n  Enterprise QA DevOps Squad - Health Check', 'cyan'));
  console.log(colorize('  =========================================\n', 'dim'));

  // Check environment variables
  printHeader('Environment Variables');
  const envCheck = await checkEnvironment();

  for (const check of envCheck.checks) {
    const status = check.status === 'set' ? 'healthy' :
      (check.required ? 'unhealthy' : 'warning');
    const label = check.required ? '(required)' : '(optional)';
    printResult(check.var, status, `${check.status} ${label}`);
  }

  // Check services
  printHeader('Service Connectivity');

  const services = [
    { name: 'Jira', check: checkJira },
    { name: 'Xray', check: checkXray },
    { name: 'Confluence', check: checkConfluence },
    { name: 'Microsoft 365', check: checkMicrosoft365 }
  ];

  const results = [];

  for (const service of services) {
    const result = await checkService(service.name, service.check);
    results.push(result);
    printResult(result.name, result.status, result.message);
  }

  // Summary
  printHeader('Summary');

  const healthy = results.filter(r => r.status === 'healthy').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  const unhealthy = results.filter(r => r.status === 'unhealthy').length;

  console.log(`  Services healthy: ${colorize(healthy.toString(), 'green')}`);
  console.log(`  Services skipped: ${colorize(skipped.toString(), 'yellow')}`);
  console.log(`  Services failing: ${colorize(unhealthy.toString(), unhealthy > 0 ? 'red' : 'green')}`);

  if (unhealthy > 0) {
    console.log(colorize('\n  ⚠ Some services are not configured or failing.', 'yellow'));
    console.log(colorize('  Run: node scripts/setup-credentials.js', 'dim'));
  } else if (skipped > 0) {
    console.log(colorize('\n  ℹ Some optional services are not configured.', 'yellow'));
    console.log(colorize('  Run: node scripts/setup-credentials.js to configure them.', 'dim'));
  } else {
    console.log(colorize('\n  ✓ All services are healthy!', 'green'));
  }

  console.log('');

  // Exit with appropriate code
  process.exit(unhealthy > 0 ? 1 : 0);
}

main().catch(error => {
  console.error(colorize(`\nFatal error: ${error.message}`, 'red'));
  process.exit(1);
});
