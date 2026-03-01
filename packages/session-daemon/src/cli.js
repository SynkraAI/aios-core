#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { createInboxMessage } from './schema-validator.js';
import { writeFileSync, mkdirSync } from 'fs';

const BASE_DIR = resolve(process.env.AIOS_CWD || '/home/ubuntu/aios-core', '.aios');
const DAEMON_DIR = join(BASE_DIR, 'daemon');
const HEALTH_FILE = join(DAEMON_DIR, 'health.json');
const SESSION_FILE = join(DAEMON_DIR, 'session.json');
const QUEUE_FILE = join(DAEMON_DIR, 'queue.json');

const USAGE = `
aios-daemon — AIOS Session Daemon CLI

Usage:
  aios-daemon health          Show daemon health status
  aios-daemon status          Show queue and session status
  aios-daemon send <command>  Send a command to the daemon via inbox
  aios-daemon restart         Request daemon session restart
  aios-daemon start           Start the daemon (foreground)
  aios-daemon help            Show this help

Options:
  --channel <ch>    Channel for send (default: cli)
  --sender <id>     Sender ID for send (default: system)
  --priority <p>    Priority: critical|high|normal|low (default: normal)
  --json            Output as JSON
`.trim();

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'health':
      return cmdHealth(args);
    case 'status':
      return cmdStatus(args);
    case 'send':
      return cmdSend(args);
    case 'restart':
      return cmdRestart(args);
    case 'start':
      return cmdStart(args);
    case 'help':
    case '--help':
    case '-h':
    case undefined:
      console.log(USAGE);
      return;
    default:
      console.error(`Unknown command: ${command}\n`);
      console.log(USAGE);
      process.exit(1);
  }
}

/** Show daemon health */
function cmdHealth(args) {
  if (!existsSync(HEALTH_FILE)) {
    console.error('Daemon not running (no health file found)');
    process.exit(1);
  }

  const health = JSON.parse(readFileSync(HEALTH_FILE, 'utf8'));
  const asJson = args.includes('--json');

  if (asJson) {
    console.log(JSON.stringify(health, null, 2));
    return;
  }

  const stateColors = {
    STARTING: '\x1b[33m', // yellow
    READY: '\x1b[32m',    // green
    BUSY: '\x1b[36m',     // cyan
    RECOVERY: '\x1b[33m', // yellow
    FAILED: '\x1b[31m',   // red
    PAUSED: '\x1b[35m',   // magenta
    STOPPED: '\x1b[90m',  // gray
  };
  const reset = '\x1b[0m';
  const color = stateColors[health.state] || '';

  console.log(`Session Daemon Health`);
  console.log(`${'─'.repeat(40)}`);
  console.log(`Status:     ${health.status === 'alive' ? '\x1b[32malive' : '\x1b[31m' + health.status}${reset}`);
  console.log(`State:      ${color}${health.state}${reset}`);
  console.log(`PID:        ${health.pid}`);
  console.log(`Uptime:     ${formatUptime(health.uptime_seconds)}`);
  console.log(`Agent:      ${health.current_agent || '-'}`);
  console.log(`Command:    ${health.current_command || '(idle)'}`);
  console.log(`Processed:  ${health.commands_processed} ok / ${health.commands_failed} failed`);
  console.log(`Recovery:   ${health.recovery_count || 0} attempts`);
  console.log(`Memory:     ${health.memory_mb} MB`);
  console.log(`Updated:    ${health.updated_at}`);
  if (health.last_error) {
    console.log(`Last Error: \x1b[31m${health.last_error}${reset}`);
  }
  if (health.cumulative_tokens) {
    const t = health.cumulative_tokens;
    console.log(`Tokens:     ${t.input} in / ${t.output} out`);
  }
}

/** Show queue and session status */
function cmdStatus(args) {
  const asJson = args.includes('--json');
  const status = {};

  // Session info
  if (existsSync(SESSION_FILE)) {
    status.session = JSON.parse(readFileSync(SESSION_FILE, 'utf8'));
  }

  // Queue info
  if (existsSync(QUEUE_FILE)) {
    status.queue = JSON.parse(readFileSync(QUEUE_FILE, 'utf8'));
  }

  // Health
  if (existsSync(HEALTH_FILE)) {
    status.health = JSON.parse(readFileSync(HEALTH_FILE, 'utf8'));
  }

  if (asJson) {
    console.log(JSON.stringify(status, null, 2));
    return;
  }

  console.log('Session Daemon Status');
  console.log(`${'─'.repeat(40)}`);

  if (status.session) {
    const s = status.session;
    console.log(`\nSession:`);
    console.log(`  ID:       ${s.session_id || '(none)'}`);
    console.log(`  Model:    ${s.model}`);
    console.log(`  V2:       ${s.use_v2 ? 'yes' : 'no (V1 fallback)'}`);
    console.log(`  Created:  ${s.created_at}`);
    console.log(`  Resumes:  ${s.resumed_count}`);
  } else {
    console.log('\nSession: not initialized');
  }

  if (status.queue) {
    const q = status.queue;
    console.log(`\nQueue:`);
    console.log(`  Current:   ${q.current?.id || '(idle)'}`);
    console.log(`  Pending:   ${q.pending?.length || 0}`);
    console.log(`  Processed: ${q.totalProcessed}`);
    console.log(`  Failed:    ${q.totalFailed}`);
  } else {
    console.log('\nQueue: not initialized');
  }
}

/** Send a command to the daemon */
function cmdSend(args) {
  const commandParts = [];
  let channel = 'cli';
  let senderId = 'system';
  let priority = 'normal';

  // Parse args
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--channel' && args[i + 1]) {
      channel = args[++i];
    } else if (args[i] === '--sender' && args[i + 1]) {
      senderId = args[++i];
    } else if (args[i] === '--priority' && args[i + 1]) {
      priority = args[++i];
    } else if (args[i] !== '--json') {
      commandParts.push(args[i]);
    }
  }

  const command = commandParts.join(' ');
  if (!command) {
    console.error('Usage: aios-daemon send <command text>');
    process.exit(1);
  }

  const msg = createInboxMessage({
    channel,
    senderId,
    command,
    priority,
    messageId: `cli-${Date.now()}`,
  });

  // Write to inbox/pending
  const inboxDir = join(BASE_DIR, 'inbox', 'pending');
  if (!existsSync(inboxDir)) mkdirSync(inboxDir, { recursive: true });

  const filename = `${Date.now()}-${channel}-${msg.id.split('-').pop()}.json`;
  const filepath = join(inboxDir, filename);

  writeFileSync(filepath, JSON.stringify(msg, null, 2), 'utf8');
  console.log(`Command sent: ${filename}`);
  console.log(`  ID:       ${msg.id}`);
  console.log(`  Channel:  ${channel}`);
  console.log(`  Command:  ${command}`);
  console.log(`  Priority: ${priority}`);
}

/** Request daemon session restart */
function cmdRestart(args) {
  // Write a special restart control message to inbox
  const msg = createInboxMessage({
    channel: 'cli',
    senderId: 'system',
    command: '__DAEMON_RESTART__',
    priority: 'critical',
    messageId: `restart-${Date.now()}`,
    metadata: { type: 'control', action: 'restart' },
  });

  const inboxDir = join(BASE_DIR, 'inbox', 'pending');
  if (!existsSync(inboxDir)) mkdirSync(inboxDir, { recursive: true });

  const filename = `${Date.now()}-control-restart.json`;
  writeFileSync(join(inboxDir, filename), JSON.stringify(msg, null, 2), 'utf8');
  console.log('Restart requested. Daemon will restart on next health check cycle.');
}

/** Start daemon (foreground) */
async function cmdStart() {
  // Dynamic import to avoid loading all deps for simple CLI commands
  const { default: SessionDaemon } = await import('./index.js');
  const cwd = process.env.AIOS_CWD || '/home/ubuntu/aios-core';
  const daemon = new SessionDaemon({ cwd });

  daemon.loadConfig();
  daemon.initLogger();
  daemon.createComponents();
  daemon.wireEvents();
  await daemon.start();
}

/** Format uptime in human-readable form */
function formatUptime(seconds) {
  if (!seconds && seconds !== 0) return '-';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

main();
