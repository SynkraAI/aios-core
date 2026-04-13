#!/usr/bin/env node
'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { WebSocketServer } = require('ws');

// --- Port Manager integration ---
const PORT_MANAGER = path.join(__dirname, '..', 'port-manager.js');
const { execSync } = require('node:child_process');

function getProjectPort(projectName) {
  // If user set PORT explicitly, use it
  if (process.env.PORT) return parseInt(process.env.PORT, 10);

  try {
    // Check if project already has an allocated port
    const registryPath = path.join(__dirname, '..', '..', '.aiox-core', 'data', 'port-registry.json');
    if (fs.existsSync(registryPath)) {
      const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
      const key = `quest-${projectName}`;
      if (registry[key]) return registry[key].port;
    }

    // Allocate a new port via port-manager (range: pipeline 5000-5099)
    execSync(`node "${PORT_MANAGER}" allocate "quest-${projectName}" pipeline`, { stdio: 'pipe' });

    // Read back the allocated port
    const registry = JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', '..', '.aiox-core', 'data', 'port-registry.json'), 'utf-8'
    ));
    const key = `quest-${projectName}`;
    if (registry[key]) return registry[key].port;
  } catch {
    // Fallback: deterministic port from project name hash
  }

  // Deterministic fallback: hash project name to port 5000-5099
  let hash = 0;
  for (const ch of projectName) hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0;
  return 5000 + (Math.abs(hash) % 100);
}

// --- Config ---
const PROJECT_PATH = process.argv[2] || process.cwd();
const PROJECT_NAME = path.basename(PROJECT_PATH);
const PORT = getProjectPort(PROJECT_NAME);
const CHECKLIST_FILE = path.join(PROJECT_PATH, '.aios', 'pipeline-checklist.yaml');
const PUBLIC_DIR = path.join(__dirname, 'public');

// --- MIME types ---
const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ico': 'image/x-icon',
};

// --- Static file server ---
const server = http.createServer((req, res) => {
  const url = req.url === '/' ? '/index.html' : req.url;
  const filePath = path.join(PUBLIC_DIR, url);
  const ext = path.extname(filePath);

  // Security: prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Serve API endpoint for initial data
      if (req.url === '/api/checklist') {
        serveChecklist(res);
        return;
      }
      if (req.url === '/api/project-info') {
        serveProjectInfo(res);
        return;
      }
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

// --- API helpers ---
function serveChecklist(res) {
  try {
    const content = fs.readFileSync(CHECKLIST_FILE, 'utf-8');
    res.writeHead(200, { 'Content-Type': 'text/yaml' });
    res.end(content);
  } catch {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Checklist not found', path: CHECKLIST_FILE }));
  }
}

function serveProjectInfo(res) {
  const info = {
    project_path: PROJECT_PATH,
    project_name: path.basename(PROJECT_PATH),
    checklist_path: CHECKLIST_FILE,
    checklist_exists: fs.existsSync(CHECKLIST_FILE),
  };

  // Try to read package.json for project name
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(PROJECT_PATH, 'package.json'), 'utf-8'));
    info.project_name = pkg.name || info.project_name;
  } catch { /* ignore */ }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(info));
}

// --- WebSocket server ---
const wss = new WebSocketServer({ server });
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log(`[WS] Client connected (${clients.size} total)`);

  // Send initial data
  try {
    const content = fs.readFileSync(CHECKLIST_FILE, 'utf-8');
    ws.send(JSON.stringify({ type: 'checklist_update', data: content, timestamp: Date.now() }));
  } catch {
    ws.send(JSON.stringify({ type: 'no_checklist', path: CHECKLIST_FILE }));
  }

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`[WS] Client disconnected (${clients.size} total)`);
  });

  ws.on('error', () => clients.delete(ws));
});

function broadcast(message) {
  const payload = JSON.stringify(message);
  for (const client of clients) {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(payload);
    }
  }
}

// --- File watcher ---
let watchDebounce = null;

function startWatching() {
  const dir = path.dirname(CHECKLIST_FILE);

  if (!fs.existsSync(dir)) {
    console.log(`[WATCH] Directory ${dir} does not exist yet. Polling every 5s...`);
    const poll = setInterval(() => {
      if (fs.existsSync(dir)) {
        clearInterval(poll);
        startWatching();
      }
    }, 5000);
    return;
  }

  try {
    fs.watch(dir, { recursive: false }, (eventType, filename) => {
      if (filename && filename.includes('pipeline-checklist')) {
        // Debounce: wait 300ms for writes to settle
        clearTimeout(watchDebounce);
        watchDebounce = setTimeout(() => {
          try {
            const content = fs.readFileSync(CHECKLIST_FILE, 'utf-8');
            console.log(`[WATCH] Checklist updated — broadcasting to ${clients.size} clients`);
            broadcast({ type: 'checklist_update', data: content, timestamp: Date.now() });
          } catch (err) {
            console.error('[WATCH] Error reading checklist:', err.message);
          }
        }, 300);
      }
    });
    console.log(`[WATCH] Watching ${dir} for changes`);
  } catch (err) {
    console.error('[WATCH] Error starting watcher:', err.message);
  }
}

// --- Start ---
server.listen(PORT, () => {
  console.log('');
  console.log('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  PIPELINE QUEST DASHBOARD');
  console.log('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Dashboard:  http://localhost:${PORT}`);
  console.log(`  Project:    ${PROJECT_PATH}`);
  console.log(`  Watching:   ${CHECKLIST_FILE}`);
  console.log('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  startWatching();
});
