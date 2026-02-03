#!/usr/bin/env node

/**
 * Credential Setup Script
 * Enterprise QA DevOps Squad
 *
 * Interactive setup for Atlassian and Microsoft 365 credentials.
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

const REQUIRED_VARS = {
  atlassian: [
    { key: 'ATLASSIAN_DOMAIN', prompt: 'Atlassian domain (e.g., company.atlassian.net): ', secret: false },
    { key: 'ATLASSIAN_EMAIL', prompt: 'Atlassian account email: ', secret: false },
    { key: 'ATLASSIAN_API_TOKEN', prompt: 'Atlassian API token: ', secret: true }
  ],
  xray: [
    { key: 'XRAY_CLIENT_ID', prompt: 'Xray Cloud client ID: ', secret: false },
    { key: 'XRAY_CLIENT_SECRET', prompt: 'Xray Cloud client secret: ', secret: true }
  ],
  microsoft: [
    { key: 'MS365_CLIENT_ID', prompt: 'Azure AD application (client) ID: ', secret: false },
    { key: 'MS365_CLIENT_SECRET', prompt: 'Azure AD client secret: ', secret: true },
    { key: 'MS365_TENANT_ID', prompt: 'Azure AD tenant ID: ', secret: false }
  ]
};

async function main() {
  console.log('\n===========================================');
  console.log('  Enterprise QA DevOps Squad - Setup');
  console.log('===========================================\n');

  console.log('This script will help you configure credentials for:');
  console.log('  - Atlassian (Jira, Confluence)');
  console.log('  - Xray Test Management');
  console.log('  - Microsoft 365 (Email, Teams, Calendar)\n');

  const envPath = await question('Path to .env file (default: .env): ') || '.env';
  const existingEnv = loadExistingEnv(envPath);

  console.log('\n--- Atlassian Configuration ---');
  console.log('Get API token from: https://id.atlassian.com/manage-profile/security/api-tokens\n');

  const atlassianVars = await collectVars(REQUIRED_VARS.atlassian, existingEnv);

  console.log('\n--- Xray Configuration ---');
  console.log('Get credentials from: Xray Cloud > Settings > API Keys\n');

  const xrayVars = await collectVars(REQUIRED_VARS.xray, existingEnv);

  const setupMs365 = await question('\nSetup Microsoft 365 integration? (y/N): ');

  let msVars = {};
  if (setupMs365.toLowerCase() === 'y') {
    console.log('\n--- Microsoft 365 Configuration ---');
    console.log('Create an Azure AD app registration:');
    console.log('  1. Go to Azure Portal > Azure Active Directory > App registrations');
    console.log('  2. Create new registration');
    console.log('  3. Add API permissions: Mail.Send, Calendars.ReadWrite, ChannelMessage.Send');
    console.log('  4. Create a client secret\n');

    msVars = await collectVars(REQUIRED_VARS.microsoft, existingEnv);
  }

  // Combine all variables
  const allVars = { ...atlassianVars, ...xrayVars, ...msVars };

  // Preview
  console.log('\n--- Configuration Preview ---');
  for (const [key, value] of Object.entries(allVars)) {
    const displayValue = key.includes('SECRET') || key.includes('TOKEN')
      ? maskSecret(value)
      : value;
    console.log(`  ${key}=${displayValue}`);
  }

  const confirm = await question('\nSave configuration? (Y/n): ');

  if (confirm.toLowerCase() !== 'n') {
    saveEnvFile(envPath, allVars, existingEnv);
    console.log(`\nConfiguration saved to ${envPath}`);
    console.log('\nNext steps:');
    console.log('  1. Run: node scripts/health-check.js');
    console.log('  2. Test: @jira *search "project = PROJ" --maxResults 1');
  } else {
    console.log('\nConfiguration not saved.');
  }

  rl.close();
}

async function collectVars(vars, existing) {
  const result = {};

  for (const v of vars) {
    const existingValue = existing[v.key];
    const defaultDisplay = existingValue ? ` [${v.secret ? '****' : existingValue}]` : '';
    const prompt = `${v.prompt}${defaultDisplay}`;

    let value = await question(prompt);

    if (!value && existingValue) {
      value = existingValue;
    }

    if (value) {
      result[v.key] = value.trim();
    }
  }

  return result;
}

function loadExistingEnv(envPath) {
  const result = {};

  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    const lines = content.split('\n');

    for (const line of lines) {
      const match = line.match(/^([A-Z_]+)=(.*)$/);
      if (match) {
        result[match[1]] = match[2].replace(/^["']|["']$/g, '');
      }
    }
  }

  return result;
}

function saveEnvFile(envPath, newVars, existingVars) {
  const merged = { ...existingVars, ...newVars };
  const lines = [];

  // Group by category
  const categories = {
    '# Atlassian Configuration': ['ATLASSIAN_DOMAIN', 'ATLASSIAN_EMAIL', 'ATLASSIAN_API_TOKEN'],
    '# Xray Configuration': ['XRAY_CLIENT_ID', 'XRAY_CLIENT_SECRET'],
    '# Microsoft 365 Configuration': ['MS365_CLIENT_ID', 'MS365_CLIENT_SECRET', 'MS365_TENANT_ID']
  };

  const written = new Set();

  for (const [header, keys] of Object.entries(categories)) {
    const categoryVars = keys.filter(k => merged[k]);
    if (categoryVars.length > 0) {
      lines.push('');
      lines.push(header);
      for (const key of categoryVars) {
        lines.push(`${key}="${merged[key]}"`);
        written.add(key);
      }
    }
  }

  // Add any remaining vars
  const remaining = Object.entries(merged).filter(([k]) => !written.has(k));
  if (remaining.length > 0) {
    lines.push('');
    lines.push('# Other Configuration');
    for (const [key, value] of remaining) {
      lines.push(`${key}="${value}"`);
    }
  }

  fs.writeFileSync(envPath, lines.join('\n').trim() + '\n');
}

function maskSecret(value) {
  if (!value || value.length < 8) return '****';
  return value.substring(0, 4) + '****' + value.substring(value.length - 4);
}

main().catch(console.error);
