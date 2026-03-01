import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createOutboxMessage, validateOutboxMessage } from './schema-validator.js';

/**
 * OutboxWriter — Writes response JSON files to .aios/outbox/pending/.
 *
 * Design decisions:
 * - Millisecond timestamps in filenames for ordering (R2 from validation)
 * - Synchronous writes (one file at a time, guarantees write order = logical order)
 * - Schema validation before write
 */
export class OutboxWriter {
  /** @param {object} opts */
  constructor({ baseDir, logger }) {
    this.pendingDir = join(baseDir, 'outbox', 'pending');
    this.logger = logger || console;

    if (!existsSync(this.pendingDir)) {
      mkdirSync(this.pendingDir, { recursive: true });
    }
  }

  /**
   * Write a response to the outbox.
   * @param {object} opts
   * @returns {string|null} The outbox filename, or null on error
   */
  write({ inReplyTo, channel, target, contentType, message, agent, tool, expectsReply }) {
    const outMsg = createOutboxMessage({
      inReplyTo,
      channel,
      target,
      contentType,
      message,
      agent,
      tool,
      expectsReply,
    });

    // Validate before writing
    const validation = validateOutboxMessage(outMsg);
    if (!validation.valid) {
      this.logger.error({ errors: validation.errors, outMsg }, 'Outbox message validation failed');
      return null;
    }

    // Filename with millisecond timestamp (R2)
    const epoch = Date.now();
    const hex = outMsg.id.split('-').pop();
    const filename = `reply-${epoch}-${channel}-${hex}.json`;
    const filepath = join(this.pendingDir, filename);

    try {
      writeFileSync(filepath, JSON.stringify(outMsg, null, 2), 'utf8');
      this.logger.debug({ filename, type: contentType, agent }, 'Outbox message written');
      return filename;
    } catch (err) {
      this.logger.error({ err, filename }, 'Failed to write outbox file');
      return null;
    }
  }

  /**
   * Write an acknowledgment message.
   */
  writeAck({ inReplyTo, channel, target }) {
    return this.write({
      inReplyTo,
      channel,
      target,
      contentType: 'ack',
      message: 'Command received, processing...',
    });
  }

  /**
   * Write a progress update.
   */
  writeProgress({ inReplyTo, channel, target, message, agent }) {
    return this.write({
      inReplyTo,
      channel,
      target,
      contentType: 'progress',
      message,
      agent,
    });
  }

  /**
   * Write an agent switch notification.
   */
  writeAgentSwitch({ inReplyTo, channel, target, fromAgent, toAgent }) {
    return this.write({
      inReplyTo,
      channel,
      target,
      contentType: 'agent_switch',
      message: `Agent switch: ${fromAgent} -> ${toAgent}`,
      agent: toAgent,
    });
  }

  /**
   * Write a tool use notification.
   */
  writeToolUse({ inReplyTo, channel, target, agent, tool, summary }) {
    return this.write({
      inReplyTo,
      channel,
      target,
      contentType: 'tool_use',
      message: summary,
      agent,
      tool,
    });
  }

  /**
   * Write an error message.
   */
  writeError({ inReplyTo, channel, target, message, agent }) {
    return this.write({
      inReplyTo,
      channel,
      target,
      contentType: 'error',
      message,
      agent,
    });
  }

  /**
   * Write the final response.
   */
  writeFinal({ inReplyTo, channel, target, message, agent }) {
    return this.write({
      inReplyTo,
      channel,
      target,
      contentType: 'final',
      message,
      agent,
    });
  }
}
