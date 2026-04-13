#!/usr/bin/env node

/**
 * Socrática Stop Flag — Detect sessions that need reflection
 * ===========================================================
 * Called BY stop-capture.cjs (not directly by hook).
 * Reads the daily YAML and checks for friction signals.
 * If friction detected → writes pending-reflection.json flag.
 *
 * The SessionStart hook reads this flag and injects a reminder
 * for Claude to run /socratica automatically.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const FLAG_PATH = path.join(PROJECT_ROOT, 'skills', 'socratica', 'pending-reflection.json');
const LOG_PATH = path.join(PROJECT_ROOT, '.aios', 'logs', 'socratica.log');

function log(message) {
  try {
    const dir = path.dirname(LOG_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const timestamp = new Date().toISOString();
    fs.appendFileSync(LOG_PATH, `[${timestamp}] ${message}\n`);
  } catch (e) { /* silent */ }
}

// Friction signals in session context
const FRICTION_SIGNALS = [
  /\berro\b/i,
  /\bfalh[aoue]/i,
  /\bbug\b/i,
  /\bworkaround\b/i,
  /\bfix\b/i,
  /\bcorrig/i,
  /\brevert/i,
  /\brefator/i,
  /\brefactor/i,
  /\btentativa/i,
  /\bretry/i,
  /\bfailed\b/i,
  /\bbroken\b/i,
  /\bconflict/i,
  /\breincid/i,
  /\bnunca mais\b/i,
  /\bnever again\b/i,
];

// Always-trigger signals (serious enough to always reflect)
const ALWAYS_TRIGGER = [
  /\breincid/i,
  /\bnunca mais\b/i,
  /\bnever again\b/i,
  /\bdados perdidos\b/i,
  /\bdata loss\b/i,
  /\bforce push\b/i,
];

function detectFriction(dailyPath, lastMessage) {
  let frictionCount = 0;
  let alwaysTrigger = false;
  const signals = [];

  // Check daily YAML
  if (fs.existsSync(dailyPath)) {
    const content = fs.readFileSync(dailyPath, 'utf8');
    for (const signal of FRICTION_SIGNALS) {
      if (signal.test(content)) {
        frictionCount++;
        signals.push(signal.source);
      }
    }
    for (const signal of ALWAYS_TRIGGER) {
      if (signal.test(content)) {
        alwaysTrigger = true;
        signals.push(`CRITICAL:${signal.source}`);
      }
    }
  }

  // Check last assistant message
  if (lastMessage) {
    for (const signal of FRICTION_SIGNALS) {
      if (signal.test(lastMessage)) {
        frictionCount++;
      }
    }
    for (const signal of ALWAYS_TRIGGER) {
      if (signal.test(lastMessage)) {
        alwaysTrigger = true;
      }
    }
  }

  return { frictionCount, alwaysTrigger, signals };
}

function writeFlag(reason, signalCount, signals) {
  const flag = {
    created: new Date().toISOString(),
    date: new Date().toISOString().split('T')[0],
    reason,
    signal_count: signalCount,
    signals: signals.slice(0, 5),
  };

  fs.writeFileSync(FLAG_PATH, JSON.stringify(flag, null, 2), 'utf8');
}

function clearFlag() {
  if (fs.existsSync(FLAG_PATH)) {
    fs.unlinkSync(FLAG_PATH);
  }
}

// Entry point — called from stop-capture or standalone
function run(dailyPath, lastMessage) {
  const { frictionCount, alwaysTrigger, signals } = detectFriction(dailyPath, lastMessage);

  // Threshold: 2+ friction signals OR any always-trigger
  if (alwaysTrigger || frictionCount >= 2) {
    const reason = alwaysTrigger
      ? 'critical-signal'
      : `${frictionCount}-friction-signals`;
    writeFlag(reason, frictionCount, signals);
    log(`FLAG SET — reason: ${reason}, signals: ${frictionCount}, details: [${signals.slice(0, 3).join(', ')}]`);
    return true;
  }

  // Clean old flags if session was clean
  log(`CLEAN — session sem fricção suficiente (${frictionCount} sinais, threshold: 2)`);
  clearFlag();
  return false;
}

// CLI mode
if (require.main === module) {
  const today = new Date().toISOString().split('T')[0];
  const dailyPath = path.join(PROJECT_ROOT, 'squads', 'kaizen-v2', 'data', 'intelligence', 'daily', `${today}.yaml`);

  // Read stdin for last message (optional)
  let lastMessage = '';
  try {
    const raw = fs.readFileSync(0, 'utf8');
    if (raw) {
      const data = JSON.parse(raw);
      lastMessage = data.last_assistant_message || '';
    }
  } catch (e) { /* no stdin */ }

  const triggered = run(dailyPath, lastMessage);
  if (triggered) {
    process.stderr.write('[socratica] Reflection flag set\n');
  }
}

module.exports = { run, clearFlag, FLAG_PATH };
