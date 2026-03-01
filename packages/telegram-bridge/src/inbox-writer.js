import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';

/**
 * InboxWriter — Creates JSON messages in the session daemon's inbox/pending directory.
 * Messages follow the inbox-message.json schema (v2.0).
 */
export class InboxWriter {
  constructor(aiosCwd, logger) {
    this.inboxDir = join(aiosCwd, '.aios', 'inbox', 'pending');
    this.logger = logger;
  }

  async ensureDir() {
    await mkdir(this.inboxDir, { recursive: true });
  }

  /**
   * Generate a unique message ID matching schema pattern: msg-{epoch}-{hex4}
   * @returns {string}
   */
  _generateId() {
    const epoch = Date.now();
    const hex = randomBytes(2).toString('hex');
    return `msg-${epoch}-${hex}`;
  }

  /**
   * Write a command to the inbox for the session daemon to process.
   * @param {object} params
   * @param {string} params.command - The command text
   * @param {string} params.senderId - Telegram user ID (as string)
   * @param {string} [params.senderName] - Telegram username
   * @param {string} [params.messageId] - Telegram message ID
   * @param {string} [params.priority] - Message priority
   * @returns {string} The generated message ID
   */
  async write({ command, senderId, senderName, messageId, priority = 'normal' }) {
    const id = this._generateId();
    const message = {
      schema_version: '2.0',
      id,
      timestamp: new Date().toISOString(),
      source: {
        channel: 'telegram',
        sender_id: senderId,
        ...(senderName && { sender_name: senderName }),
        ...(messageId && { message_id: messageId }),
      },
      command,
      priority,
      status: 'pending',
      reply_to: {
        channel: 'telegram',
        target: senderId,
      },
    };

    const filePath = join(this.inboxDir, `${id}.json`);
    await writeFile(filePath, JSON.stringify(message, null, 2), 'utf8');
    this.logger.info({ id, command: command.slice(0, 80) }, 'Inbox message written');
    return id;
  }
}
