#!/usr/bin/env node

/**
 * Project Pulse Generator
 *
 * Scans all projects, collects git activity, and POSTs
 * a context summary to the telegram-agenda-bot API.
 *
 * Usage:
 *   node scripts/generate-project-pulse.js
 *   node scripts/generate-project-pulse.js --dry-run
 *
 * Env vars:
 *   BOT_API_URL   - Bot base URL (default: http://localhost:3000)
 *   SYNC_API_KEY  - API key for authentication
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');
const http = require('http');

// ── Config ──────────────────────────────────────────────

const HOME = require('os').homedir();
const DRY_RUN = process.argv.includes('--dry-run');

const SCAN_PATHS = [
  { dir: path.join(HOME, 'CODE', 'Projects'), type: 'app' },
  { dir: path.join(HOME, 'CODE', 'design-systems'), type: 'design-system' },
  { dir: path.join(HOME, 'CODE', 'frameworks'), type: 'framework' },
  { dir: path.join(HOME, 'CODE', 'tools'), type: 'tool' },
];

const IGNORE_DIRS = new Set([
  'node_modules', '.git', '__MACOSX', '.DS_Store',
  '_example', '_imports', '_deprecated',
]);

const BOT_API_URL = process.env.BOT_API_URL || 'http://localhost:3000';
const SYNC_API_KEY = process.env.SYNC_API_KEY || '';

// ── Helpers ─────────────────────────────────────────────

function gitLog(projectPath, count = 5) {
  try {
    const result = execSync(
      `git log --oneline -${count} --no-decorate 2>/dev/null`,
      { cwd: projectPath, encoding: 'utf-8', timeout: 5000 }
    );
    return result.trim().split('\n').filter(Boolean).map(line => {
      // Remove hash, keep message
      const spaceIdx = line.indexOf(' ');
      return spaceIdx > 0 ? line.slice(spaceIdx + 1) : line;
    });
  } catch {
    return [];
  }
}

function gitLastDate(projectPath) {
  try {
    const result = execSync(
      'git log -1 --format=%aI 2>/dev/null',
      { cwd: projectPath, encoding: 'utf-8', timeout: 5000 }
    );
    return result.trim() || null;
  } catch {
    return null;
  }
}

function readPackageJson(projectPath) {
  const pkgPath = path.join(projectPath, 'package.json');
  if (!fs.existsSync(pkgPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  } catch {
    return null;
  }
}

function detectStack(pkg) {
  if (!pkg) return [];
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const stack = [];

  if (deps['next']) stack.push('Next.js');
  else if (deps['react']) stack.push('React');
  if (deps['vue']) stack.push('Vue');
  if (deps['express']) stack.push('Express');
  if (deps['grammy'] || deps['telegraf']) stack.push('Telegram Bot');
  if (deps['typescript']) stack.push('TypeScript');
  if (deps['tailwindcss']) stack.push('Tailwind');
  if (deps['supabase'] || deps['@supabase/supabase-js']) stack.push('Supabase');

  return stack;
}

function readIndexStatus(projectPath) {
  // Check .aiox/INDEX.md (hybrid) or look for status in README
  const indexPaths = [
    path.join(projectPath, '.aios', 'INDEX.md'),
    path.join(projectPath, 'INDEX.md'),
  ];

  for (const indexPath of indexPaths) {
    if (!fs.existsSync(indexPath)) continue;
    try {
      const content = fs.readFileSync(indexPath, 'utf-8');
      const statusMatch = content.match(/Status:\s*(.+)/i);
      if (statusMatch) return statusMatch[1].trim();
    } catch {
      // ignore
    }
  }
  return null;
}

// ── Scan ────────────────────────────────────────────────

function scanProjects() {
  const projects = [];

  for (const { dir, type } of SCAN_PATHS) {
    if (!fs.existsSync(dir)) continue;

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (IGNORE_DIRS.has(entry.name)) continue;
      if (entry.name.startsWith('.')) continue;

      const projectPath = path.join(dir, entry.name);
      const pkg = readPackageJson(projectPath);
      const lastActivity = gitLastDate(projectPath);
      const recentChanges = gitLog(projectPath, 5);
      const stack = detectStack(pkg);
      const status = readIndexStatus(projectPath);

      projects.push({
        name: entry.name,
        type,
        path: projectPath,
        description: pkg?.description || null,
        stack: stack.length ? stack : undefined,
        lastActivity: lastActivity || undefined,
        recentChanges: recentChanges.length ? recentChanges : undefined,
        status: status || undefined,
      });
    }
  }

  // Sort by last activity (most recent first)
  projects.sort((a, b) => {
    if (!a.lastActivity) return 1;
    if (!b.lastActivity) return -1;
    return b.lastActivity.localeCompare(a.lastActivity);
  });

  return projects;
}

// ── POST to bot ─────────────────────────────────────────

function postToBot(payload) {
  return new Promise((resolve, reject) => {
    const url = new URL('/api/projects/sync', BOT_API_URL);
    const isHttps = url.protocol === 'https:';
    const transport = isHttps ? https : http;

    const data = JSON.stringify(payload);

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'x-api-key': SYNC_API_KEY,
      },
    };

    const req = transport.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(body));
          } catch {
            resolve(body);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// ── Main ────────────────────────────────────────────────

async function main() {
  console.log('Scanning projects...');

  const projects = scanProjects();
  console.log(`Found ${projects.length} projects`);

  const payload = {
    projects,
    syncedAt: new Date().toISOString(),
    source: 'claude-code-local',
  };

  if (DRY_RUN) {
    console.log('\n--- DRY RUN (would send this payload) ---');
    // Show compact summary
    for (const p of projects) {
      const stack = p.stack ? ` [${p.stack.join(', ')}]` : '';
      const changes = p.recentChanges ? ` (${p.recentChanges.length} commits)` : '';
      console.log(`  ${p.name}${stack}${changes}`);
    }
    console.log(`\nTotal: ${projects.length} projects`);

    // Also save locally for inspection
    const outPath = path.join(process.cwd(), 'data', 'project-pulse-preview.json');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));
    console.log(`Preview saved to: ${outPath}`);
    return;
  }

  if (!SYNC_API_KEY) {
    console.error('ERROR: SYNC_API_KEY env var is required (set it in .env or export it)');
    process.exit(1);
  }

  try {
    console.log(`Sending to ${BOT_API_URL}/api/projects/sync...`);
    const result = await postToBot(payload);
    console.log(`Synced! ${result.count || projects.length} projects sent.`);
  } catch (err) {
    console.error(`Failed to sync: ${err.message}`);
    process.exit(1);
  }
}

main();
