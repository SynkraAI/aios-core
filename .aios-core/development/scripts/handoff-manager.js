/**
 * Handoff Manager
 *
 * Creates, stores, and reads session handoff documents.
 * Works with budget-awareness.js to enforce the handoff-over-autocompact pattern.
 *
 * Storage: .aios/handoffs/
 *   - handoff-YYYY-MM-DD-HHMMSS.md (individual handoffs)
 *   - LATEST.md (copy of most recent handoff)
 *   - index.json (metadata index of all handoffs)
 *
 * @version 1.0.0
 * @author Orion (AIOS Master)
 * @created 2026-02-09
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// --- Constants ---

const HANDOFFS_DIR = '.aios/handoffs';
const LATEST_FILE = 'LATEST.md';
const INDEX_FILE = 'index.json';
const MAX_HANDOFFS = 30; // Keep last 30 handoffs

// --- Handoff Manager Class ---

class HandoffManager {
  /**
   * @param {object} options
   * @param {string} options.projectRoot - Project root directory
   * @param {number} options.maxHandoffs - Max handoffs to retain (default: 30)
   */
  constructor(options = {}) {
    this.projectRoot = options.projectRoot || process.cwd();
    this.handoffsDir = path.join(this.projectRoot, HANDOFFS_DIR);
    this.maxHandoffs = options.maxHandoffs || MAX_HANDOFFS;
  }

  /**
   * Create a new handoff document.
   *
   * @param {object} data - Handoff data
   * @param {string} data.topic - Short title for the handoff
   * @param {string} data.project - Project name
   * @param {Array} data.completed - Completed tasks [{description, commit?, tests?}]
   * @param {Array} data.pending - Pending tasks [{description, status, blocked?, blocker?}]
   * @param {Array} data.blockers - Active blockers [{title, description, since?}]
   * @param {Array} data.nextSteps - Next steps [{priority, description, complexity, note?}]
   * @param {object} data.context - Context for next session
   * @param {number} data.budgetPercent - Budget % at time of handoff
   * @returns {object} {filePath, fileName, success}
   */
  create(data) {
    this._ensureDir();

    const now = new Date();
    const timestamp = this._formatTimestamp(now);
    const fileName = `handoff-${timestamp}.md`;
    const filePath = path.join(this.handoffsDir, fileName);

    // Gather git context
    const git = this._getGitContext();

    // Build markdown document
    const content = this._buildMarkdown({
      ...data,
      date: now.toISOString().split('T')[0],
      branch: git.branch,
      commit_short: git.commitShort,
      budget_percent: data.budgetPercent || '??',
      budget_status: this._budgetLabel(data.budgetPercent),
      session_duration: data.sessionDuration || 'unknown',
    });

    // Write handoff file
    fs.writeFileSync(filePath, content, 'utf-8');

    // Update LATEST.md
    const latestPath = path.join(this.handoffsDir, LATEST_FILE);
    fs.writeFileSync(latestPath, content, 'utf-8');

    // Update index
    this._updateIndex({
      fileName,
      topic: data.topic,
      date: now.toISOString(),
      branch: git.branch,
      commit: git.commitShort,
      budgetPercent: data.budgetPercent,
      completedCount: (data.completed || []).length,
      pendingCount: (data.pending || []).length,
      blockersCount: (data.blockers || []).length,
    });

    // Cleanup old handoffs
    this._cleanup();

    return { filePath, fileName, success: true };
  }

  /**
   * Read the latest handoff document.
   *
   * @returns {string|null} Content of LATEST.md or null
   */
  readLatest() {
    const latestPath = path.join(this.handoffsDir, LATEST_FILE);
    try {
      if (fs.existsSync(latestPath)) {
        return fs.readFileSync(latestPath, 'utf-8');
      }
    } catch {
      // Graceful degradation
    }
    return null;
  }

  /**
   * Read a specific handoff by filename.
   *
   * @param {string} fileName - Handoff filename
   * @returns {string|null} Content or null
   */
  read(fileName) {
    const filePath = path.join(this.handoffsDir, fileName);
    try {
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf-8');
      }
    } catch {
      // Graceful degradation
    }
    return null;
  }

  /**
   * List all handoffs with metadata.
   *
   * @returns {Array} Handoff index entries, newest first
   */
  list() {
    const indexPath = path.join(this.handoffsDir, INDEX_FILE);
    try {
      if (fs.existsSync(indexPath)) {
        const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
        return index.handoffs || [];
      }
    } catch {
      // Graceful degradation
    }
    return [];
  }

  /**
   * Check if a handoff exists for the current session (today).
   *
   * @returns {boolean}
   */
  hasRecentHandoff() {
    const today = new Date().toISOString().split('T')[0];
    const handoffs = this.list();
    return handoffs.some((h) => h.date && h.date.startsWith(today));
  }

  // --- Private Methods ---

  _ensureDir() {
    if (!fs.existsSync(this.handoffsDir)) {
      fs.mkdirSync(this.handoffsDir, { recursive: true });
    }
  }

  _formatTimestamp(date) {
    const pad = (n) => String(n).padStart(2, '0');
    return [
      date.getFullYear(),
      pad(date.getMonth() + 1),
      pad(date.getDate()),
      '-',
      pad(date.getHours()),
      pad(date.getMinutes()),
      pad(date.getSeconds()),
    ].join('');
  }

  _getGitContext() {
    try {
      const branch = execSync('git rev-parse --abbrev-ref HEAD', {
        cwd: this.projectRoot,
        encoding: 'utf-8',
      }).trim();

      const commitShort = execSync('git rev-parse --short HEAD', {
        cwd: this.projectRoot,
        encoding: 'utf-8',
      }).trim();

      return { branch, commitShort };
    } catch {
      return { branch: 'unknown', commitShort: 'unknown' };
    }
  }

  _budgetLabel(percent) {
    if (!percent || percent === '??') return 'unknown';
    if (percent >= 95) return 'CRITICAL — forced handoff';
    if (percent >= 85) return 'HIGH — recommended handoff';
    if (percent >= 70) return 'WARNING — approaching limit';
    return 'SAFE — proactive handoff';
  }

  _buildMarkdown(data) {
    const lines = [];

    // Header
    lines.push(`# Handoff: ${data.topic}`);
    lines.push('');
    lines.push(`**Date:** ${data.date}`);
    lines.push(`**Project:** ${data.project || 'unknown'}`);
    lines.push(`**Branch:** \`${data.branch}\` @ \`${data.commit_short}\``);
    lines.push(`**Budget at handoff:** ${data.budget_percent}% (${data.budget_status})`);
    if (data.session_duration !== 'unknown') {
      lines.push(`**Session duration:** ${data.session_duration}`);
    }
    lines.push('');
    lines.push('---');
    lines.push('');

    // Completed
    lines.push('## Completed');
    lines.push('');
    if (data.completed && data.completed.length > 0) {
      for (const item of data.completed) {
        let line = `- ${item.description}`;
        if (item.commit) line += ` (commit: \`${item.commit}\`)`;
        if (item.tests) line += ` [${item.tests} tests passing]`;
        lines.push(line);
      }
    } else {
      lines.push('- No tasks completed this session (context/research only)');
    }
    lines.push('');

    // Pending
    lines.push('## Pending');
    lines.push('');
    if (data.pending && data.pending.length > 0) {
      for (const item of data.pending) {
        if (item.blocked) {
          lines.push(`- [ ] ${item.description} (**blocked by:** ${item.blocker})`);
        } else {
          lines.push(`- [ ] ${item.description} (**${item.status || 'ready'}**)`);
        }
      }
    } else {
      lines.push('- All planned tasks completed');
    }
    lines.push('');

    // Blockers
    lines.push('## Blockers');
    lines.push('');
    if (data.blockers && data.blockers.length > 0) {
      for (const item of data.blockers) {
        let line = `- **${item.title}:** ${item.description}`;
        if (item.since) line += ` (since ${item.since})`;
        lines.push(line);
      }
    } else {
      lines.push('- No active blockers');
    }
    lines.push('');

    // Next Steps
    lines.push('## Next Steps');
    lines.push('');
    if (data.nextSteps && data.nextSteps.length > 0) {
      for (const item of data.nextSteps) {
        let line = `${item.priority}. ${item.description} [${item.complexity || 'M'}]`;
        if (item.note) line += ` — *${item.note}*`;
        lines.push(line);
      }
    }
    lines.push('');

    // Context for Next Session
    lines.push('## Context for Next Session');
    lines.push('');

    const ctx = data.context || {};

    if (ctx.architectureDecisions && ctx.architectureDecisions.length > 0) {
      lines.push('### Architecture Decisions Made');
      for (const d of ctx.architectureDecisions) lines.push(`- ${d}`);
      lines.push('');
    }

    if (ctx.patterns && ctx.patterns.length > 0) {
      lines.push('### Patterns Established');
      for (const p of ctx.patterns) lines.push(`- ${p}`);
      lines.push('');
    }

    if (ctx.criticalFiles && ctx.criticalFiles.length > 0) {
      lines.push('### Critical Files to Understand');
      for (const f of ctx.criticalFiles) lines.push(`- \`${f.path}\` — ${f.reason}`);
      lines.push('');
    }

    if (ctx.workarounds && ctx.workarounds.length > 0) {
      lines.push('### Temporary Workarounds');
      for (const w of ctx.workarounds) lines.push(`- ${w.description} — **TODO:** ${w.resolution}`);
      lines.push('');
    }

    if (ctx.testStatus) {
      lines.push('### Test Status');
      lines.push(`- **Passing:** ${ctx.testStatus.passing || 0}`);
      lines.push(`- **Failing:** ${ctx.testStatus.failing || 0}`);
      lines.push(`- **Skipped:** ${ctx.testStatus.skipped || 0}`);
      lines.push('');
    }

    if (ctx.notes) {
      lines.push('### Key Context');
      lines.push(ctx.notes);
      lines.push('');
    }

    // Footer
    lines.push('---');
    lines.push('');
    lines.push('## Quick Resume Commands');
    lines.push('');
    lines.push('```bash');
    lines.push('# Read this handoff in next session');
    lines.push('cat .aios/handoffs/LATEST.md');
    lines.push('');
    lines.push('# Or use AIOS command');
    lines.push('# *handoff-read');
    lines.push('```');
    lines.push('');
    lines.push('---');
    lines.push('*Handoff created by AIOS Session Handoff System v1.0*');
    lines.push('*Fresh sessions don\'t lose context. They lose noise.*');

    return lines.join('\n');
  }

  _updateIndex(entry) {
    const indexPath = path.join(this.handoffsDir, INDEX_FILE);
    let index = { handoffs: [] };

    try {
      if (fs.existsSync(indexPath)) {
        index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
      }
    } catch {
      // Start fresh if corrupt
    }

    index.handoffs.unshift(entry); // Newest first
    index.lastUpdated = new Date().toISOString();

    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf-8');
  }

  _cleanup() {
    try {
      const indexPath = path.join(this.handoffsDir, INDEX_FILE);
      if (!fs.existsSync(indexPath)) return;

      const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
      if (index.handoffs.length <= this.maxHandoffs) return;

      // Remove oldest handoffs beyond limit
      const toRemove = index.handoffs.splice(this.maxHandoffs);
      for (const entry of toRemove) {
        const filePath = path.join(this.handoffsDir, entry.fileName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf-8');
    } catch {
      // Non-blocking cleanup
    }
  }
}

// --- Exports ---

module.exports = {
  HandoffManager,
  HANDOFFS_DIR,
  MAX_HANDOFFS,
};
