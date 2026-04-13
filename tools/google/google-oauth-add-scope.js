#!/usr/bin/env node
'use strict';

/**
 * Google OAuth Scope Adder — generates auth URL and exchanges code for new refresh token
 *
 * Usage:
 *   node tools/google-oauth-add-scope.js auth     # Opens browser for authorization
 *   node tools/google-oauth-add-scope.js exchange <code>  # Exchanges code for refresh token
 *
 * This adds forms.body scope while keeping existing spreadsheets scope.
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/forms.body',
  'https://www.googleapis.com/auth/forms.responses.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
];

const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob';

function getClientCredentials() {
  // Try .env
  const envFile = path.join(process.env.HOME, 'CODE/Projects/whatsapp-prospector/.env');
  if (fs.existsSync(envFile)) {
    const content = fs.readFileSync(envFile, 'utf-8');
    const vars = {};
    for (const line of content.split('\n')) {
      const match = line.match(/^([A-Z_]+)=(.+)$/);
      if (match) vars[match[1]] = match[2].trim();
    }
    if (vars.GOOGLE_CLIENT_ID && vars.GOOGLE_CLIENT_SECRET) {
      return { clientId: vars.GOOGLE_CLIENT_ID, clientSecret: vars.GOOGLE_CLIENT_SECRET };
    }
  }

  // Try ~/.claude.json
  const claudeJsonPath = path.join(require('os').homedir(), '.claude.json');
  if (fs.existsSync(claudeJsonPath)) {
    const config = JSON.parse(fs.readFileSync(claudeJsonPath, 'utf-8'));
    const locations = [
      config.mcpServers?.['google-workspace']?.env,
      ...Object.values(config.projects || {}).map(p => p.mcpServers?.['google-workspace']?.env),
    ].filter(Boolean);
    for (const env of locations) {
      const clientId = env.GOOGLE_OAUTH_CLIENT_ID || env.GOOGLE_CLIENT_ID;
      const clientSecret = env.GOOGLE_OAUTH_CLIENT_SECRET || env.GOOGLE_CLIENT_SECRET;
      if (clientId && clientSecret) return { clientId, clientSecret };
    }
  }

  return null;
}

async function cmdAuth() {
  const creds = getClientCredentials();
  if (!creds) {
    console.error('Error: No Google client credentials found.');
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(creds.clientId, creds.clientSecret, REDIRECT_URI);

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });

  console.log('\n=== Google OAuth — Add Forms Scope ===\n');
  console.log('Scopes requested:');
  SCOPES.forEach(s => console.log(`  - ${s}`));
  console.log('\n1. Open this URL in your browser:\n');
  console.log(authUrl);
  console.log('\n2. Authorize and copy the code');
  console.log('3. Run: node tools/google-oauth-add-scope.js exchange <CODE>\n');

  // Try to open browser automatically
  const { exec } = require('child_process');
  exec(`open "${authUrl}"`);
}

async function cmdExchange(code) {
  const creds = getClientCredentials();
  if (!creds) {
    console.error('Error: No Google client credentials found.');
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(creds.clientId, creds.clientSecret, REDIRECT_URI);

  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log('\n=== New Tokens ===\n');
    console.log('Refresh Token:', tokens.refresh_token);
    console.log('Access Token:', tokens.access_token?.substring(0, 30) + '...');
    console.log('Scopes:', tokens.scope);

    if (tokens.refresh_token) {
      // Update .env file
      const envFile = path.join(process.env.HOME, 'CODE/Projects/whatsapp-prospector/.env');
      if (fs.existsSync(envFile)) {
        let content = fs.readFileSync(envFile, 'utf-8');
        if (content.includes('GOOGLE_REFRESH_TOKEN=')) {
          content = content.replace(/GOOGLE_REFRESH_TOKEN=.+/, `GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
        } else {
          content += `\nGOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`;
        }
        fs.writeFileSync(envFile, content);
        console.log('\n.env updated with new refresh token.');
      }
    }

    console.log('\nDone! Now try: node tools/google-forms-editor.js read <formId>');
  } catch (error) {
    console.error('Error exchanging code:', error.message);
    process.exit(1);
  }
}

async function main() {
  const [command, code] = process.argv.slice(2);

  switch (command) {
    case 'auth':
      await cmdAuth();
      break;
    case 'exchange':
      if (!code) {
        console.error('Usage: google-oauth-add-scope.js exchange <code>');
        process.exit(1);
      }
      await cmdExchange(code);
      break;
    default:
      console.error('Usage:');
      console.error('  google-oauth-add-scope.js auth           # Generate auth URL');
      console.error('  google-oauth-add-scope.js exchange <code> # Exchange code for tokens');
      process.exit(1);
  }
}

main();
