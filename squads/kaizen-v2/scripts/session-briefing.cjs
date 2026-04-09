#!/usr/bin/env node

/**
 * kaizen-v2 SessionStart Hook — Pattern Briefing Injection
 * =========================================================
 * Triggered: SessionStart event (session begins)
 * Timeout: 3 seconds (fail-silent if exceeds)
 * Mode: Async (never blocks session start)
 * Size: <= 2KB (compressed briefing)
 *
 * Pipeline:
 * 1. Read patterns.yaml → extract top patterns by decay_score
 * 2. Read last 3 daily YAMLs → extract recent learnings
 * 3. Build ≤ 2KB briefing (patterns + recent activity)
 * 4. Output via additionalContext
 *
 * Windows-Safe Pattern:
 * - No process.exit()
 * - timer.unref() for safety
 * - Fail-silent always (never crashes session start)
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// Paths are relative to project root (process.cwd() when running as hook)
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
  timeout_ms: 3000,
  project_root: path.resolve(__dirname, '..', '..', '..'),
  patterns_file: 'squads/kaizen-v2/data/intelligence/knowledge/patterns.yaml',
  daily_dir: 'squads/kaizen-v2/data/intelligence/daily',
  log_file: '.aios/logs/kaizen-session-briefing.log',
  max_briefing_bytes: 2048,
  max_patterns: 5,
  min_decay_score: 0.3,
  max_recent_dailies: 3,
  fail_silent: true,
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

function log(level, message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level}] ${message}\n`;
  try {
    fs.appendFileSync(path.join(CONFIG.project_root, CONFIG.log_file), logEntry);
  } catch (err) {
    // Silently ignore
  }
}

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    return null;
  }
}

/**
 * Parse patterns from YAML content.
 * Handles the block-style YAML format used in patterns.yaml.
 * Each pattern starts with "  - pattern_id:" and has fields indented below.
 */
function parsePatterns(yamlContent) {
  if (!yamlContent) return [];

  const patterns = [];

  // Split into pattern blocks: each starts with "  - pattern_id:" or "  -"
  // We look for lines starting with "  - pattern_id:" (2-space indent)
  const lines = yamlContent.split('\n');
  let currentPattern = null;
  let currentField = null;
  let currentValue = '';

  for (const line of lines) {
    // New pattern block
    if (/^\s{2}-\s+pattern_id:\s+(.+)/.test(line)) {
      // Save previous pattern
      if (currentPattern) {
        if (currentField) currentPattern[currentField] = currentValue.trim();
        patterns.push(currentPattern);
      }
      const match = line.match(/pattern_id:\s+(.+)/);
      currentPattern = { pattern_id: match ? match[1].replace(/^["']|["']$/g, '') : '' };
      currentField = null;
      currentValue = '';
    } else if (currentPattern) {
      // Field line: "    name: value" or "    heuristic: >"
      const fieldMatch = line.match(/^\s{4}(\w+):\s*(.*)/);
      if (fieldMatch) {
        // Save previous field
        if (currentField) currentPattern[currentField] = currentValue.trim();
        currentField = fieldMatch[1];
        currentValue = fieldMatch[2];
      } else if (currentField && line.match(/^\s{6}/)) {
        // Continuation of multi-line field (block scalar)
        currentValue += ' ' + line.trim();
      }
    }
  }

  // Save last pattern
  if (currentPattern) {
    if (currentField) currentPattern[currentField] = currentValue.trim();
    patterns.push(currentPattern);
  }

  return patterns.filter(p => p.pattern_id && p.pattern_id !== '');
}

/**
 * Parse a simple key-value field from a YAML string.
 */
function parseField(yaml, key) {
  const regex = new RegExp(`^\\s*${key}:\\s*(.*)$`, 'm');
  const match = yaml.match(regex);
  return match ? match[1].replace(/^["']|["']$/g, '').trim() : null;
}

/**
 * Parse array items from YAML (simple list format).
 */
function parseArray(yaml, key) {
  const startIdx = yaml.indexOf(`${key}:`);
  if (startIdx === -1) return [];

  const items = [];
  const section = yaml.substring(startIdx);
  const lines = section.split('\n').slice(1); // skip the key: line

  for (const line of lines) {
    if (/^\s{2,}-\s+/.test(line)) {
      const item = line.replace(/^\s{2,}-\s+/, '').replace(/^["']|["']$/g, '').trim();
      if (item) items.push(item);
    } else if (!/^\s/.test(line) && line.trim() !== '') {
      break; // End of array
    }
  }
  return items;
}

function getRecentDailies() {
  const dailyDirPath = path.join(CONFIG.project_root, CONFIG.daily_dir);
  try {
    if (!fs.existsSync(dailyDirPath)) return [];
    return fs.readdirSync(dailyDirPath)
      .filter(f => f.endsWith('.yaml') && /^\d{4}-\d{2}-\d{2}/.test(f))
      .sort()
      .reverse()
      .slice(0, CONFIG.max_recent_dailies)
      .map(f => ({ name: f.replace('.yaml', ''), path: path.join(dailyDirPath, f) }));
  } catch (err) {
    log('WARN', `Failed to read daily dir: ${err.message}`);
    return [];
  }
}

function buildBriefing(patterns, recentDailies) {
  let sections = [];

  // Section 1: Active patterns
  const activePatterns = patterns
    .filter(p => {
      const score = parseFloat(p.decay_score || '1.0');
      return !isNaN(score) && score >= CONFIG.min_decay_score;
    })
    .sort((a, b) => parseFloat(b.decay_score || '1.0') - parseFloat(a.decay_score || '1.0'))
    .slice(0, CONFIG.max_patterns);

  if (activePatterns.length > 0) {
    let patternSection = '## kaizen-v2 Active Patterns\n';
    for (const p of activePatterns) {
      const score = parseFloat(p.decay_score || '1.0').toFixed(2);
      const name = p.name || p.pattern_id;
      const heuristic = p.heuristic
        ? p.heuristic.replace(/^[">|]\s*/, '').substring(0, 150).replace(/\s+/g, ' ')
        : '';
      patternSection += `- [${p.pattern_id}] ${name} (score: ${score})\n`;
      if (heuristic) patternSection += `  → ${heuristic}\n`;
    }
    sections.push(patternSection);
  } else {
    sections.push('## kaizen-v2 Patterns\n- Aguardando primeiras capturas (patterns emergem após 2+ sessões)\n');
  }

  // Section 2: Recent activity
  if (recentDailies.length > 0) {
    let activitySection = '\n## Atividade Recente\n';
    for (const daily of recentDailies) {
      const content = readFile(daily.path);
      if (!content) continue;

      const summary = parseField(content, 'activity_summary');
      const learnings = parseArray(content, 'learnings');

      if (summary) {
        activitySection += `**${daily.name}:** ${summary}\n`;
      }
      if (learnings.length > 0) {
        const firstLearning = learnings[0];
        if (firstLearning && firstLearning.length > 10) {
          activitySection += `  → ${firstLearning.substring(0, 120)}\n`;
        }
      }
    }
    sections.push(activitySection);
  }

  // Section 3: Frontmatter health (from cache)
  try {
    const fmCachePath = path.join(CONFIG.project_root, 'squads/kaizen-v2/data/intelligence/frontmatter-health.json');
    if (fs.existsSync(fmCachePath)) {
      const fmData = JSON.parse(fs.readFileSync(fmCachePath, 'utf-8'));
      const score = fmData.health_score;
      const icon = score >= 90 ? '🟢' : score >= 50 ? '🟡' : '🔴';
      let fmSection = `\n## Frontmatter Health\n${icon} **${score}/100** (${fmData.total_files} files)`;
      if (fmData.high_issues > 0) fmSection += ` | ${fmData.high_issues} HIGH`;
      if (fmData.medium_issues > 0) fmSection += ` | ${fmData.medium_issues} MEDIUM`;
      sections.push(fmSection);
    }
  } catch (fmErr) {
    // Silently skip — cache may not exist yet
  }

  // Footer
  sections.push(`\n---\n*kaizen-v2 | ${patterns.length} patterns | /kaizen-v2:*health para diagnóstico*`);

  return sections.join('\n');
}

function truncateBriefing(briefing) {
  const bytes = Buffer.byteLength(briefing, 'utf8');
  if (bytes <= CONFIG.max_briefing_bytes) return briefing;

  // Truncate to fit using byte length (UTF-8 safe)
  const suffix = '\n...(truncated)';
  const maxBytes = CONFIG.max_briefing_bytes - Buffer.byteLength(suffix, 'utf8');
  let truncated = briefing;
  while (Buffer.byteLength(truncated, 'utf8') > maxBytes) {
    truncated = truncated.substring(0, truncated.length - 1);
  }
  return truncated + suffix;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN EXECUTION
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  // Safety timeout
  const timer = setTimeout(() => {
    log('WARN', 'SessionStart hook safety timeout exceeded');
  }, CONFIG.timeout_ms);
  timer.unref();

  try {
    log('INFO', 'SessionStart hook triggered');

    // Read patterns.yaml
    const patternsPath = path.join(CONFIG.project_root, CONFIG.patterns_file);
    const patternsContent = readFile(patternsPath);
    const patterns = patternsContent ? parsePatterns(patternsContent) : [];
    log('INFO', `Patterns loaded: ${patterns.length}`);

    // Get recent dailies
    const recentDailies = getRecentDailies();
    log('INFO', `Recent dailies: ${recentDailies.length}`);

    // Build briefing
    let briefing = buildBriefing(patterns, recentDailies);
    briefing = truncateBriefing(briefing);

    log('INFO', `Briefing size: ${Buffer.byteLength(briefing, 'utf8')} bytes`);

    // Output hook result
    console.log(JSON.stringify({
      hookEventName: 'SessionStart',
      hookSpecificOutput: {
        additionalContext: briefing,
      },
    }));

  } catch (err) {
    if (!CONFIG.fail_silent) {
      console.error('SessionStart hook error:', err);
    }
    log('ERROR', `Uncaught error: ${err.message}`);

    // Fail-silent: output minimal context
    console.log(JSON.stringify({
      hookEventName: 'SessionStart',
      hookSpecificOutput: {
        additionalContext: '## kaizen-v2\nReady. Use /kaizen-v2:*health para verificar status.\n',
      },
    }));
  }
}

main();
