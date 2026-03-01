import Ajv from 'ajv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemasDir = join(__dirname, '..', 'schemas');

const ajv = new Ajv({ allErrors: true, strict: false });

try {
  const { default: addFormats } = await import('ajv-formats');
  addFormats(ajv);
} catch {
  // ajv-formats not installed, date-time format validation skipped
}

const inboxSchema = JSON.parse(readFileSync(join(schemasDir, 'inbox-message.json'), 'utf8'));
const outboxSchema = JSON.parse(readFileSync(join(schemasDir, 'outbox-message.json'), 'utf8'));

const validateInbox = ajv.compile(inboxSchema);
const validateOutbox = ajv.compile(outboxSchema);

/**
 * Validate an inbox message against the schema.
 * @param {unknown} data
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateInboxMessage(data) {
  const valid = validateInbox(data);
  if (valid) return { valid: true, errors: [] };
  const errors = (validateInbox.errors || []).map(
    (e) => `${e.instancePath || '/'} ${e.message}`
  );
  return { valid: false, errors };
}

/**
 * Validate an outbox message against the schema.
 * @param {unknown} data
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateOutboxMessage(data) {
  const valid = validateOutbox(data);
  if (valid) return { valid: true, errors: [] };
  const errors = (validateOutbox.errors || []).map(
    (e) => `${e.instancePath || '/'} ${e.message}`
  );
  return { valid: false, errors };
}

/**
 * Generate a unique message ID.
 * @param {string} prefix - 'msg' for inbox, 'reply' for outbox
 * @returns {string}
 */
export function generateId(prefix = 'msg') {
  const epoch = Date.now();
  const hex = Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0');
  return `${prefix}-${epoch}-${hex}`;
}

/**
 * Create a well-formed inbox message.
 * @param {object} opts
 * @returns {object}
 */
export function createInboxMessage({ channel, senderId, senderName, command, priority = 'normal', messageId, metadata }) {
  const id = generateId('msg');
  return {
    schema_version: '2.0',
    id,
    timestamp: new Date().toISOString(),
    source: {
      channel,
      sender_id: senderId,
      ...(senderName && { sender_name: senderName }),
      ...(messageId && { message_id: messageId }),
    },
    command,
    priority,
    thread: {
      thread_id: id,
      is_followup: false,
      parent_id: null,
    },
    reply_to: {
      channel,
      target: senderId,
    },
    status: 'pending',
    ...(metadata && { metadata }),
  };
}

/**
 * Create a well-formed outbox message.
 * @param {object} opts
 * @returns {object}
 */
export function createOutboxMessage({ inReplyTo, channel, target, contentType, message, agent, tool, expectsReply = false }) {
  return {
    schema_version: '2.0',
    id: generateId('reply'),
    in_reply_to: inReplyTo,
    timestamp: new Date().toISOString(),
    channel,
    ...(target && { target }),
    content: {
      type: contentType,
      message,
      ...(agent && { agent }),
      ...(tool && { tool }),
      ...(expectsReply && { expects_reply: expectsReply }),
    },
    status: 'pending',
  };
}
