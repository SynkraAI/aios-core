#!/usr/bin/env node

/**
 * kaizen-v2 Stop Hook — Daily Intelligence Capture
 * ================================================
 * Triggered: Stop event (session exit)
 * Timeout: 5 seconds (fail-silent if exceeds)
 * Mode: Reads stdin JSON, never blocks session exit
 *
 * Pipeline:
 * 1. Read stdin → get session_id, last_assistant_message, stop_hook_active
 * 2. If stop_hook_active → skip (avoid infinite loop)
 * 3. Extract learnings from last_assistant_message
 * 4. Extract agents mentioned (@agent-name patterns)
 * 5. git log --since=today → capture git activity
 * 6. Append/create daily/YYYY-MM-DD.yaml
 * 7. Never crash, never block
 *
 * Windows-Safe Pattern:
 * - No process.exit() (cuts stdout on Windows)
 * - timer.unref() for safety timeout
 * - Let Node exit naturally
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// Paths are relative to project root (process.cwd() when running as hook)
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
  timeout_ms: 5000,
  project_root: path.resolve(__dirname, '..', '..', '..'),
  daily_dir: 'squads/kaizen-v2/data/intelligence/daily',
  frontmatter_cache: 'squads/kaizen-v2/data/intelligence/frontmatter-health.json',
  log_file: '.aiox/logs/kaizen-stop.log',
  fail_silent: true,
};

// Learning signal patterns (borrowed from stop-session-learnings.cjs)
const LEARNING_SIGNALS = [
  /\blembre(?:-se)?\b.*?que\b/i,
  /\bremember\b.*?\bthat\b/i,
  /\bsempre\b.*?\buse\b/i,
  /\bnunca\b.*?\bfaça\b/i,
  /\bpadrão\b.*?\bé\b/i,
  /\bdecisão\b.*?:/i,
  /\bdecidimos\b/i,
  /\bconvenção\b/i,
  /\bregra\b.*?\b(nova|importante)\b/i,
  /\baprendizado\b/i,
  /\binsight\b/i,
  /\bdescobri\b/i,
  /\bresolvido\b.*?\bcom\b/i,
  /\bfix\b.*?\bfor\b/i,
  /\bworkaround\b/i,
  /\bimportante\b.*?:/i,
  /\bnote\b.*?:/i,
];

// Decision signal patterns
const DECISION_SIGNALS = [
  /\bdecidimos\b/i,
  /\bdecisão\b.*?:/i,
  /\bvamos\b.*?\busa[r]?\b/i,
  /\boptamos\b.*?\bpo[r]?\b/i,
  /\bvamos\b.*?\bimplementa[r]?\b/i,
];

// ═══════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

function log(level, message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level}] ${message}\n`;
  try {
    fs.appendFileSync(path.join(CONFIG.project_root, CONFIG.log_file), logEntry);
  } catch (err) {
    // Silently ignore log failures
  }
}

function getTodayDate() {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD
}

function getGitActivity() {
  try {
    const commitsCmd = 'git log --since="today" --oneline';
    const commits = execSync(commitsCmd, { encoding: 'utf8' }).trim().split('\n').filter(Boolean);

    let filesChanged = 0;
    let linesAdded = 0;
    let linesRemoved = 0;
    try {
      const statCmd = 'git diff --stat HEAD~1..HEAD --shortstat 2>/dev/null || true';
      const stat = execSync(statCmd, { encoding: 'utf8' }).trim();
      const filesMatch = stat.match(/(\d+) file/);
      const addMatch = stat.match(/(\d+) insertion/);
      const delMatch = stat.match(/(\d+) deletion/);
      if (filesMatch) filesChanged = parseInt(filesMatch[1]);
      if (addMatch) linesAdded = parseInt(addMatch[1]);
      if (delMatch) linesRemoved = parseInt(delMatch[1]);
    } catch (e) { /* ignore */ }

    return { commits, filesChanged, linesAdded, linesRemoved };
  } catch (err) {
    log('WARN', `Git log failed: ${err.message}`);
    return { commits: [], filesChanged: 0, linesAdded: 0, linesRemoved: 0 };
  }
}

function extractLearnings(message) {
  if (!message || message.length < 50) return [];

  const learnings = [];
  for (const signal of LEARNING_SIGNALS) {
    const match = message.match(signal);
    if (match) {
      const idx = match.index;
      const start = Math.max(0, idx - 30);
      const end = Math.min(message.length, idx + 200);
      const snippet = message.substring(start, end).trim().replace(/\n/g, ' ').substring(0, 250);
      learnings.push({
        signal: signal.source,
        snippet,
        verified: false,
      });
    }
  }
  return learnings;
}

function extractDecisions(message) {
  if (!message || message.length < 50) return [];

  const decisions = [];
  for (const signal of DECISION_SIGNALS) {
    const match = message.match(signal);
    if (match) {
      const idx = match.index;
      const start = Math.max(0, idx - 10);
      const end = Math.min(message.length, idx + 200);
      const snippet = message.substring(start, end).trim().replace(/\n/g, ' ').substring(0, 200);
      // Avoid duplicates
      if (!decisions.some(d => d.snippet === snippet)) {
        decisions.push({ context: 'session', decision: snippet });
      }
    }
  }
  return decisions;
}

function extractAgents(message) {
  if (!message) return [];
  const matches = message.match(/@[a-z][a-z0-9\-]*/g) || [];
  return [...new Set(matches)].slice(0, 10);
}

function extractStoriesTouched(commits) {
  const storyPattern = /\[story[\s\-]*([\d.]+)\]|story[\s\-]*([\d.]+)/i;
  const stories = new Set();
  for (const commit of commits) {
    const match = commit.match(storyPattern);
    if (match) stories.add(match[1] || match[2]);
  }
  return [...stories];
}

function getDailyPath() {
  const today = getTodayDate();
  return path.join(CONFIG.project_root, CONFIG.daily_dir, `${today}.yaml`);
}

function getExistingSessionCount(dailyPath) {
  if (!fs.existsSync(dailyPath)) return 0;
  try {
    const content = fs.readFileSync(dailyPath, 'utf8');
    const match = content.match(/^session_count:\s*(\d+)/m);
    return match ? parseInt(match[1]) : 1;
  } catch (e) {
    return 1;
  }
}

function serializeYAML(obj, indent = '') {
  let yaml = '';
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      yaml += `${indent}${key}: null\n`;
    } else if (typeof value === 'boolean') {
      yaml += `${indent}${key}: ${value}\n`;
    } else if (typeof value === 'number') {
      yaml += `${indent}${key}: ${value}\n`;
    } else if (typeof value === 'string') {
      // Escape strings that need quoting
      const needsQuote = value.includes(':') || value.includes('#') || value.includes('\n') || value.startsWith(' ');
      yaml += `${indent}${key}: ${needsQuote ? `"${value.replace(/"/g, '\\"')}"` : value}\n`;
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        yaml += `${indent}${key}: []\n`;
      } else if (typeof value[0] === 'string') {
        yaml += `${indent}${key}:\n`;
        value.forEach(item => {
          yaml += `${indent}  - "${item.replace(/"/g, '\\"')}"\n`;
        });
      } else {
        yaml += `${indent}${key}:\n`;
        value.forEach(item => {
          const lines = serializeYAML(item, indent + '    ');
          yaml += `${indent}  -\n${lines}`;
        });
      }
    } else if (typeof value === 'object') {
      yaml += `${indent}${key}:\n`;
      yaml += serializeYAML(value, indent + '  ');
    }
  }
  return yaml;
}

function buildDailyYAML(sessionId, gitActivity, learnings, decisions, agents) {
  const today = getTodayDate();
  const now = new Date().toISOString();
  const { commits, filesChanged, linesAdded, linesRemoved } = gitActivity;

  const activitySummary = commits.length > 0
    ? `${commits.length} commits, ${filesChanged} files changed (+${linesAdded}/-${linesRemoved} lines)`
    : 'Session completed (no commits)';

  const daily = {
    date: today,
    capture_time: now,
    session_id: sessionId ? sessionId.substring(0, 8) : 'unknown',
    session_count: 1,
    providers_active: ['claude-sonnet-4-6'],
    activity_summary: activitySummary,
    highlights: commits.slice(0, 5),
    decisions,
    stories_touched: extractStoriesTouched(commits),
    learnings,
    agents_involved: agents,
  };

  return `# Kaizen v2 Daily Digest — ${today}\n${serializeYAML(daily)}`;
}

function appendOrCreateDaily(dailyPath, sessionId, content) {
  const dirPath = path.dirname(dailyPath);

  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  } catch (err) {
    log('WARN', `Failed to create directory: ${err.message}`);
    return false;
  }

  try {
    if (fs.existsSync(dailyPath)) {
      // Increment session count in existing file
      let existingContent = fs.readFileSync(dailyPath, 'utf8');
      const sessionCount = getExistingSessionCount(dailyPath) + 1;
      existingContent = existingContent.replace(/^session_count:\s*\d+/m, `session_count: ${sessionCount}`);
      // Append new session block
      const sessionBlock = `\n# --- Session ${sessionId ? sessionId.substring(0, 8) : 'unknown'} (${new Date().toISOString()}) ---\n${content}`;
      fs.writeFileSync(dailyPath, existingContent + sessionBlock, 'utf8');
    } else {
      fs.writeFileSync(dailyPath, content, 'utf8');
    }
    log('INFO', `Daily captured: ${dailyPath}`);
    return true;
  } catch (err) {
    log('ERROR', `Failed to write daily: ${err.message}`);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN EXECUTION
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  // Safety timeout — never keep process alive
  const timer = setTimeout(() => {
    log('WARN', 'Stop hook safety timeout exceeded');
  }, CONFIG.timeout_ms);
  timer.unref();

  try {
    log('INFO', 'Stop hook triggered');

    // Read stdin (hook data from Claude Code)
    let stdinData = {};
    try {
      const raw = fs.readFileSync(0, 'utf8');
      if (raw && raw.trim()) {
        stdinData = JSON.parse(raw);
      }
    } catch (e) {
      // No stdin or invalid JSON — continue without it
      log('WARN', `stdin read failed: ${e.message}`);
    }

    const { session_id, stop_hook_active, last_assistant_message } = stdinData;

    // Avoid infinite loop: if hook already triggered continuation, skip
    if (stop_hook_active) {
      log('INFO', 'stop_hook_active=true, skipping to avoid loop');
      return;
    }

    log('INFO', `Session: ${session_id ? session_id.substring(0, 8) : 'unknown'}, message_len: ${last_assistant_message ? last_assistant_message.length : 0}`);

    // Extract intelligence from session
    const learnings = extractLearnings(last_assistant_message || '');
    const decisions = extractDecisions(last_assistant_message || '');
    const agents = extractAgents(last_assistant_message || '');

    log('INFO', `Extracted: ${learnings.length} learnings, ${decisions.length} decisions, ${agents.length} agents`);

    // Get git activity
    const gitActivity = getGitActivity();
    log('INFO', `Git: ${gitActivity.commits.length} commits today`);

    // Build daily YAML
    const dailyContent = buildDailyYAML(session_id, gitActivity, learnings, decisions, agents);

    // Write daily
    const dailyPath = getDailyPath();
    const success = appendOrCreateDaily(dailyPath, session_id, dailyContent);

    if (success) {
      log('INFO', `Daily saved: ${path.basename(dailyPath)}`);
    }

    // Capture frontmatter health score (non-blocking)
    try {
      const lintScript = path.join(CONFIG.project_root, 'tools', 'frontmatter-lint.js');
      if (fs.existsSync(lintScript)) {
        const tmpFile = path.join(require('os').tmpdir(), 'fm-lint-cache.json');
        execSync(`node "${lintScript}" --json > "${tmpFile}" 2>/dev/null`, { timeout: 4000 });
        const lintOutput = fs.readFileSync(tmpFile, 'utf-8');
        const lintData = JSON.parse(lintOutput);
        const grades = {};
        let highCount = 0;
        let medCount = 0;
        for (const r of lintData) {
          grades[r.grade] = (grades[r.grade] || 0) + 1;
          for (const i of r.issues) {
            if (i.severity === 'HIGH') highCount++;
            if (i.severity === 'MEDIUM') medCount++;
          }
        }
        const totalLow = lintData.reduce((sum, r) => sum + r.issues.filter(i => i.severity === 'LOW').length, 0);
        const weightedIssues = (highCount * 10) + (medCount * 3) + (totalLow * 1);
        const maxPossible = lintData.length * 15;
        const healthScore = Math.max(0, Math.round(100 - (weightedIssues / Math.max(maxPossible, 1)) * 100));

        const cacheData = {
          timestamp: new Date().toISOString(),
          total_files: lintData.length,
          health_score: healthScore,
          high_issues: highCount,
          medium_issues: medCount,
          grades,
        };
        const cachePath = path.join(CONFIG.project_root, CONFIG.frontmatter_cache);
        fs.mkdirSync(path.dirname(cachePath), { recursive: true });
        fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2), 'utf-8');
        log('INFO', `Frontmatter health cached: ${healthScore}/100`);
      }
    } catch (fmErr) {
      log('WARN', `Frontmatter health capture failed: ${fmErr.message}`);
    }

    // Trigger socrática reflection flag if session had friction
    try {
      const socraticaFlag = path.join(CONFIG.project_root, 'skills', 'socratica', 'stop-flag.cjs');
      if (fs.existsSync(socraticaFlag)) {
        const { run } = require(socraticaFlag);
        run(dailyPath, last_assistant_message || '');
      }
    } catch (sfErr) {
      log('WARN', `Socrática flag check failed: ${sfErr.message}`);
    }

    // No stdout output — avoid Claude Code interpreting it as hook control

  } catch (err) {
    if (!CONFIG.fail_silent) {
      console.error('Stop hook error:', err);
    }
    log('ERROR', `Uncaught error: ${err.message}`);
    // Fail-silent: no output
  }
}

main();
