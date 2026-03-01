/**
 * Comms Bridge — Orchestrator-to-Telegram notification bridge via outbox IPC.
 *
 * Writes structured JSON messages to `.aios/outbox/pending/` using the existing
 * OutboxWriter from session-daemon. The Telegram Bridge watches this directory
 * and delivers messages to the user.
 *
 * Design:
 * - Reuses OutboxWriter (CON-003) — zero schema drift
 * - Fire-and-forget writes — never blocks the orchestrator critical path
 * - Rate limiting: max 1 notification/second (phase start/end/errors bypass)
 * - Graceful degradation: write failures are logged and swallowed (AC6)
 *
 * @module comms-bridge
 */

import { mkdirSync, existsSync, writeFileSync, renameSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import OutboxWriter from session-daemon (CON-003: reuse, not re-implement)
import { OutboxWriter } from '../../session-daemon/src/outbox-writer.js';

/**
 * NOTABLE_TOOLS — tool names that trigger streaming notifications (AC4).
 * Only tool calls for these tools generate tool_use outbox messages.
 */
const NOTABLE_TOOLS = new Set(['Bash', 'Write', 'Edit']);

/**
 * RATE_LIMIT_MS — minimum interval between rate-limited notifications (AC7).
 * Phase start/end, errors, and budget alerts bypass this limit.
 */
const RATE_LIMIT_MS = 1000;

/**
 * Creates a CommsBridge instance.
 *
 * @param {object} opts
 * @param {string} opts.baseDir - Project root (parent of `.aios/`)
 * @param {string} [opts.workflowId] - Unique workflow identifier
 * @param {string} [opts.channel='telegram'] - Default outbox channel
 * @param {object} [opts.target] - Default message target
 * @param {object} [opts.logger=console] - Logger instance
 * @returns {CommsBridge}
 */
export function createCommsBridge({
  baseDir,
  workflowId,
  channel = 'telegram',
  target,
  logger = console,
} = {}) {
  return new CommsBridge({ baseDir, workflowId, channel, target, logger });
}

/**
 * CommsBridge — Writes orchestrator notifications to the outbox for Telegram delivery.
 */
export class CommsBridge {
  /**
   * @param {object} opts
   * @param {string} opts.baseDir - Project root directory (parent of `.aios/`)
   * @param {string} [opts.workflowId] - Unique workflow ID (used as in_reply_to)
   * @param {string} [opts.channel='telegram'] - Default channel for messages
   * @param {object} [opts.target] - Default target (sender_id, chat_id)
   * @param {object} [opts.logger=console] - Logger
   */
  constructor({ baseDir, workflowId, channel = 'telegram', target, logger = console }) {
    if (!baseDir) {
      throw new Error('CommsBridge requires baseDir (project root)');
    }

    this.baseDir = baseDir;
    this.workflowId = workflowId || `orchestrator-${Date.now()}`;
    this.channel = channel;
    this.target = target || { sender_id: '', chat_id: '' };
    this.logger = logger;

    // Rate limiting state (AC7)
    this._lastNotifyTime = 0;
    this._queue = [];
    this._flushing = false;

    // Reports directory (AC5)
    this.reportsDir = join(baseDir, '.aios', 'orchestrator', 'reports');

    // Initialize OutboxWriter (creates .aios/outbox/pending/ if needed)
    try {
      const aiosDir = join(baseDir, '.aios');
      this.outbox = new OutboxWriter({ baseDir: aiosDir, logger });
    } catch (err) {
      this.logger.error({ err }, 'Failed to initialize OutboxWriter — notifications will be silently dropped');
      this.outbox = null;
    }
  }

  // ──────────────────────────────────────────────────────
  // Notification methods (AC3)
  // ──────────────────────────────────────────────────────

  /**
   * Notify phase start (AC3, AC8).
   * Bypasses rate limit — always sent immediately.
   *
   * @param {string} phase - e.g. 'SM:CREATE', 'DEV:IMPLEMENT'
   * @param {string} agentId - e.g. 'dev', 'qa'
   * @param {string} [storyFile] - Story being processed
   * @param {number} [attempt=1] - Attempt number for this phase
   */
  notifyPhaseStart(phase, agentId, storyFile, attempt = 1) {
    const storyPart = storyFile ? ` for story ${storyFile}` : '';
    const message = `[AIOS] Starting ${phase} (${this._persona(agentId)})${storyPart} — attempt ${attempt}`;
    this._writeImmediate('agent_switch', message, agentId);
  }

  /**
   * Notify phase end (AC3, AC8).
   * Bypasses rate limit — always sent immediately.
   *
   * @param {string} phase - e.g. 'PO:VALIDATE'
   * @param {string} agentId - e.g. 'po'
   * @param {string} verdict - e.g. 'GO', 'FAIL', 'proceed'
   * @param {number} [costUsd=0] - Phase cost in USD
   * @param {number} [durationMs=0] - Phase duration in ms
   */
  notifyPhaseEnd(phase, agentId, verdict, costUsd = 0, durationMs = 0) {
    const timeStr = this._formatDuration(durationMs);
    const message = `[AIOS] ${phase} complete — ${verdict}. Cost: $${costUsd.toFixed(2)}, Time: ${timeStr}`;
    this._writeImmediate('progress', message, agentId);
  }

  /**
   * Notify error (AC3, AC8).
   * Bypasses rate limit — always sent immediately.
   *
   * @param {string} errorType - e.g. 'budget_exceeded', 'qa_retries_exhausted'
   * @param {string} message - Human-readable error description
   * @param {string} [phase] - Phase where error occurred
   * @param {number} [costUsd=0] - Total cost at time of error
   */
  notifyError(errorType, message, phase, costUsd = 0) {
    const phasePart = phase ? ` in ${phase}` : '';
    const costPart = costUsd > 0 ? `. Total cost: $${costUsd.toFixed(2)}` : '';
    const fullMessage = `[AIOS] WORKFLOW ABORTED — ${message}${phasePart}${costPart}`;
    this._writeImmediate('error', fullMessage, 'orchestrator');
  }

  /**
   * Notify budget alert at 80% (AC3, AC8).
   * Bypasses rate limit — always sent immediately.
   *
   * @param {number} currentCostUsd - Current cumulative cost
   * @param {number} maxCostUsd - Maximum budget
   * @param {string} [storyFile] - Story being processed
   */
  notifyBudgetAlert(currentCostUsd, maxCostUsd, storyFile) {
    const pct = Math.round((currentCostUsd / maxCostUsd) * 100);
    const storyPart = storyFile ? `. Story: ${storyFile}` : '';
    const message = `[AIOS] Budget alert: $${currentCostUsd.toFixed(2)}/$${maxCostUsd.toFixed(2)} used (${pct}%)${storyPart}`;
    this._writeImmediate('progress', message, 'orchestrator');
  }

  /**
   * Notify workflow completion (AC3, AC5, AC8).
   * Bypasses rate limit — always sent immediately.
   * Also saves full report to `.aios/orchestrator/reports/`.
   *
   * @param {object} report - Full workflow report (AC5 schema)
   * @param {string} report.workflowId
   * @param {string} report.status - 'success' | 'aborted' | 'budget_exceeded'
   * @param {string} report.storyFile
   * @param {number} report.totalCostUsd
   * @param {number} report.totalDurationMs
   * @param {Array} report.phases
   * @param {Array} [report.concerns]
   */
  notifyWorkflowComplete(report) {
    // Save full report to disk (AC5)
    this._saveReport(report);

    // Send summary via Telegram (AC5, AC8)
    const timeStr = this._formatDuration(report.totalDurationMs || 0);
    const message = `[AIOS] SDC complete for ${report.storyFile}: ${report.status}. Cost: $${(report.totalCostUsd || 0).toFixed(2)}. Duration: ${timeStr}.`;
    this._writeImmediate('final', message, 'orchestrator');
  }

  // ──────────────────────────────────────────────────────
  // Streaming hook (AC4)
  // ──────────────────────────────────────────────────────

  /**
   * Real-time streaming hook for agent messages (AC4).
   * Called by Session Manager for each streaming message from the agent.
   * Only writes notifications for notable tool calls (Bash, Write, Edit).
   * Fire-and-forget — does NOT block the caller.
   *
   * @param {string} agentId - Agent generating the message
   * @param {object} message - SDK streaming message
   * @param {string} [message.type] - 'tool_use', 'text', etc.
   * @param {string} [message.name] - Tool name (for tool_use type)
   * @param {string} [message.input] - Tool input (for tool_use type)
   */
  onAgentMessage(agentId, message) {
    if (!message || message.type !== 'tool_use') {
      return; // Only stream tool calls, not every token
    }

    if (!NOTABLE_TOOLS.has(message.name)) {
      return; // Only notable tools
    }

    const inputSummary = typeof message.input === 'string'
      ? message.input.slice(0, 200)
      : JSON.stringify(message.input || '').slice(0, 200);

    const text = `@${agentId} using ${message.name}: ${inputSummary}`;
    this._writeRateLimited('tool_use', text, agentId, message.name);
  }

  // ──────────────────────────────────────────────────────
  // Internal: write methods
  // ──────────────────────────────────────────────────────

  /**
   * Write a notification immediately, bypassing rate limiter.
   * Used for phase start/end, errors, budget alerts, completion.
   * Failures are caught, logged, and silently swallowed (AC6).
   */
  _writeImmediate(contentType, message, agent, tool) {
    if (!this.outbox) return;

    try {
      this.outbox.write({
        inReplyTo: this.workflowId,
        channel: this.channel,
        target: this.target,
        contentType,
        message,
        agent,
        ...(tool && { tool }),
      });
    } catch (err) {
      this.logger.error({ err, contentType, agent }, 'CommsBridge write failed (silently swallowed)');
    }
  }

  /**
   * Write a notification with rate limiting (AC7).
   * Max 1 message per RATE_LIMIT_MS. Queues excess messages.
   */
  _writeRateLimited(contentType, message, agent, tool) {
    const now = Date.now();
    const elapsed = now - this._lastNotifyTime;

    if (elapsed >= RATE_LIMIT_MS) {
      this._lastNotifyTime = now;
      this._writeImmediate(contentType, message, agent, tool);
    } else {
      // Queue for later delivery
      this._queue.push({ contentType, message, agent, tool });
      this._scheduleFlush(RATE_LIMIT_MS - elapsed);
    }
  }

  /**
   * Schedule a flush of the rate-limited queue.
   */
  _scheduleFlush(delayMs) {
    if (this._flushing) return;
    this._flushing = true;

    setTimeout(() => {
      this._flushing = false;
      const item = this._queue.shift();
      if (item) {
        this._lastNotifyTime = Date.now();
        this._writeImmediate(item.contentType, item.message, item.agent, item.tool);
        // Continue flushing if more items queued
        if (this._queue.length > 0) {
          this._scheduleFlush(RATE_LIMIT_MS);
        }
      }
    }, delayMs);
  }

  // ──────────────────────────────────────────────────────
  // Internal: report persistence (AC5)
  // ──────────────────────────────────────────────────────

  /**
   * Save workflow report to `.aios/orchestrator/reports/{workflowId}.json`.
   * Uses atomic write: write to tmp, then rename.
   */
  _saveReport(report) {
    try {
      if (!existsSync(this.reportsDir)) {
        mkdirSync(this.reportsDir, { recursive: true });
      }

      const enrichedReport = {
        ...report,
        generatedAt: new Date().toISOString(),
      };

      const filename = `${report.workflowId || this.workflowId}.json`;
      const filepath = join(this.reportsDir, filename);
      const tmpPath = join(this.reportsDir, `.tmp-${filename}`);

      // Atomic write: tmp -> rename
      writeFileSync(tmpPath, JSON.stringify(enrichedReport, null, 2), 'utf8');
      renameSync(tmpPath, filepath);

      this.logger.debug({ filepath }, 'Workflow report saved');
    } catch (err) {
      this.logger.error({ err }, 'Failed to save workflow report (silently swallowed)');
    }
  }

  // ──────────────────────────────────────────────────────
  // Internal: formatting helpers
  // ──────────────────────────────────────────────────────

  /**
   * Map agentId to persona name for human-readable messages.
   */
  _persona(agentId) {
    const personas = {
      sm: 'River',
      po: 'Pax',
      dev: 'Dex',
      qa: 'Quinn',
      devops: 'Gage',
      architect: 'Aria',
      pm: 'Morgan',
      analyst: 'Alex',
      'data-engineer': 'Dara',
      'ux-design-expert': 'Uma',
      'aios-master': 'AIOS Master',
    };
    return personas[agentId] || agentId;
  }

  /**
   * Format milliseconds to a human-readable duration string.
   */
  _formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;
    const seconds = Math.round(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }
}
