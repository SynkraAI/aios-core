import { createHash } from 'node:crypto';

/**
 * AgentRouter — Maps agentId to the correct Telegram bot and chat.
 * Uses bots.yaml agent_to_bot_map for routing, with fallback to master bot.
 * Detects agent mentions in message content for smart routing.
 * Time-windowed dedup prevents duplicate messages within 30s.
 */

// Pattern to detect agent references in message content
const AGENT_MENTION_PATTERN = /\baios[-_]?(dev|qa|architect|pm|devops|analyst|po|sm|data-engineer|ux-design-expert)\b/i;
const AGENT_LABEL_PATTERN = /\*\*aios[-_]?(dev|qa|architect|pm|devops|analyst|po|sm|data-engineer|ux-design-expert)\b.*?\*\*/i;

const DEDUP_WINDOW_MS = 30_000;

export class AgentRouter {
  constructor(botManager, rateLimiter, messageFormatter, logger) {
    this.botManager = botManager;
    this.rateLimiter = rateLimiter;
    this.messageFormatter = messageFormatter;
    this.logger = logger;
    this.currentAgent = 'aios-master';
    this._recentMessages = new Map(); // hash -> timestamp
    this.digestMode = false;
    this._suppressedMessages = []; // stored when in digest mode
  }

  /**
   * Check if a message was recently sent (within dedup window).
   */
  _isDuplicate(formatted) {
    const hash = createHash('md5').update(formatted).digest('hex').slice(0, 12);
    const now = Date.now();

    // Clean expired entries
    for (const [k, t] of this._recentMessages) {
      if (now - t > DEDUP_WINDOW_MS) this._recentMessages.delete(k);
    }

    if (this._recentMessages.has(hash)) {
      return true;
    }
    this._recentMessages.set(hash, now);
    return false;
  }

  /**
   * Route a formatted message to the correct agent's bot.
   * Sends to both the detected agent bot AND master (for full observability).
   */
  async route(agentId, outboxMessage) {
    const formatted = this.messageFormatter.format(outboxMessage);
    if (!formatted) return;

    // Time-windowed dedup
    if (this._isDuplicate(formatted)) {
      this.logger.debug({ type: outboxMessage.content?.type, id: outboxMessage.id }, 'Skipping duplicate message');
      return;
    }

    // Digest mode: suppress tool_use and progress, only deliver agent_switch/error/final
    if (this.digestMode) {
      const type = outboxMessage.content?.type;
      if (type === 'tool_use' || type === 'progress') {
        this._suppressedMessages.push({ formatted, type, timestamp: Date.now() });
        // Cap suppressed buffer at 200 entries
        if (this._suppressedMessages.length > 200) this._suppressedMessages.shift();
        return;
      }
    }

    // Track agent switches
    if (outboxMessage.content?.type === 'agent_switch' && outboxMessage.content?.agent) {
      const previousAgent = this.currentAgent;
      this.currentAgent = outboxMessage.content.agent;
      this.logger.info({ from: previousAgent, to: this.currentAgent }, 'Agent switch detected');
    }

    // Detect mentioned agent from message content
    const mentionedAgent = this._detectAgentInContent(outboxMessage);
    const targetAgent = mentionedAgent || agentId || this.currentAgent;

    await this.rateLimiter.execute(async () => {
      // Always send to master for full observability
      await this.botManager.sendToAgent('aios-master', formatted);

      // If target is a different agent, also send to that agent's bot
      if (targetAgent !== 'aios-master') {
        const sent = await this.botManager.sendToAgent(targetAgent, formatted);
        if (!sent) {
          this.logger.warn({ targetAgent }, 'Agent bot not available, master-only delivery');
        }
      }
    });
  }

  /**
   * Detect which agent is referenced in the message content.
   */
  _detectAgentInContent(outboxMessage) {
    const msg = outboxMessage.content?.message || '';

    const labelMatch = msg.match(AGENT_LABEL_PATTERN);
    if (labelMatch) {
      return labelMatch[1].toLowerCase();
    }

    if (outboxMessage.content?.type === 'tool_use' && outboxMessage.content?.tool === 'Agent') {
      const mentionMatch = msg.match(AGENT_MENTION_PATTERN);
      if (mentionMatch) {
        return mentionMatch[1].toLowerCase();
      }
    }

    return null;
  }

  /**
   * Resolve which agent should receive a message based on outbox content.
   */
  resolveAgent(outboxMessage) {
    const mentioned = this._detectAgentInContent(outboxMessage);
    if (mentioned) return mentioned;

    if (outboxMessage.content?.agent) {
      return outboxMessage.content.agent;
    }
    return this.currentAgent;
  }

  /**
   * Get suppressed messages from digest mode and clear buffer.
   * @returns {Array} Suppressed messages
   */
  flushSuppressed() {
    const messages = [...this._suppressedMessages];
    this._suppressedMessages = [];
    return messages;
  }
}
