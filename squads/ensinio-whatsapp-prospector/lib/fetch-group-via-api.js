'use strict';

/**
 * Phase 1a: Fetch group data via Evolution API
 *
 * Alternative to ZIP-based parsing (Phase 1b).
 * Uses a "reader" Evolution API instance to fetch group participants
 * and messages directly, producing output compatible with ParsedExport.
 *
 * Key advantage: phone numbers come 100% resolved from JIDs,
 * eliminating the need for Phase 4 (manual phone resolution).
 *
 * Limitation: only captures messages stored AFTER the instance was connected.
 * For full historical data, use ZIP export (Phase 1b).
 */

const { EvolutionClient } = require('../../../tools/evolution-whatsapp-api');
const { jidToE164 } = require('../../../tools/evolution-whatsapp-api/lib/jid-utils');

/**
 * Fetch group data from Evolution API and convert to ParsedExport format.
 *
 * @param {object} opts
 * @param {string} opts.baseUrl    - Evolution API base URL
 * @param {string} opts.apiKey     - API key
 * @param {string} opts.instance   - Reader instance name (e.g. "fosc-personal")
 * @param {string} opts.groupJid   - Group JID to fetch (e.g. "120363001@g.us")
 * @param {number} [opts.messageLimit] - Max messages to fetch (default: no limit)
 * @param {function} [opts.onProgress] - Progress callback
 * @returns {Promise<object>} ParsedExport-compatible object
 */
async function fetchGroupViaApi(opts) {
  const { baseUrl, apiKey, instance, groupJid, messageLimit, onProgress } = opts;

  if (!baseUrl || !apiKey || !instance || !groupJid) {
    throw new Error('Missing required options: baseUrl, apiKey, instance, groupJid');
  }

  const client = new EvolutionClient({ baseUrl, apiKey, instance });

  // Step 1: Verify connection
  if (onProgress) onProgress({ step: 'connection', status: 'checking' });
  const state = await client.getConnectionState();
  if (state?.state !== 'open' && state?.instance?.state !== 'open') {
    throw new Error(`Instance "${instance}" is not connected (state: ${JSON.stringify(state)})`);
  }
  if (onProgress) onProgress({ step: 'connection', status: 'connected' });

  // Step 2: Fetch group info + participants
  if (onProgress) onProgress({ step: 'participants', status: 'fetching' });
  const groups = await client.fetchAllGroups({ getParticipants: true });

  const group = Array.isArray(groups)
    ? groups.find((g) => g.id === groupJid || g.jid === groupJid)
    : null;

  if (!group) {
    throw new Error(`Group not found: ${groupJid}. Available: ${
      Array.isArray(groups) ? groups.map((g) => g.subject || g.id).join(', ') : 'none'
    }`);
  }

  // Step 3: Extract participants with phones
  const participantsWithPhones = await client.getParticipantsWithPhones(groupJid);
  if (onProgress) onProgress({ step: 'participants', status: 'done', count: participantsWithPhones.length });

  // Step 4: Fetch messages
  if (onProgress) onProgress({ step: 'messages', status: 'fetching' });
  const fetchOpts = {};
  if (messageLimit) fetchOpts.limit = messageLimit;
  const rawMessages = await client.findMessages(groupJid, fetchOpts);
  const messages = Array.isArray(rawMessages) ? rawMessages : [];
  if (onProgress) onProgress({ step: 'messages', status: 'done', count: messages.length });

  // Step 5: Build ParsedExport
  if (onProgress) onProgress({ step: 'building', status: 'processing' });
  const result = buildParsedExport(group, participantsWithPhones, messages);
  if (onProgress) onProgress({ step: 'complete', status: 'done', result });

  return result;
}

/**
 * Build a ParsedExport-compatible object from API data.
 *
 * @param {object} group - Group info from fetchAllGroups
 * @param {Array} participants - Participants with phones from getParticipantsWithPhones
 * @param {Array} messages - Raw messages from findMessages
 * @returns {object} ParsedExport-compatible object
 */
function buildParsedExport(group, participants, messages) {
  // Build participant map: jid -> participant info
  const participantMap = new Map();
  for (const p of participants) {
    participantMap.set(p.jid, p);
  }

  // Group messages by sender JID
  const messagesBySender = new Map();
  for (const msg of messages) {
    const senderJid = msg.key?.participant || msg.key?.remoteJid || '';
    if (!senderJid || !participantMap.has(senderJid)) continue;

    if (!messagesBySender.has(senderJid)) {
      messagesBySender.set(senderJid, []);
    }

    const content = extractMessageContent(msg);
    if (content) {
      messagesBySender.get(senderJid).push({
        timestamp: msg.messageTimestamp
          ? new Date(Number(msg.messageTimestamp) * 1000).toISOString()
          : new Date().toISOString(),
        content,
      });
    }
  }

  // Build contacts array
  const contacts = [];
  for (const p of participants) {
    const senderMessages = messagesBySender.get(p.jid) || [];

    // Sort messages by timestamp
    senderMessages.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    contacts.push({
      name: p.pushName || p.phone,
      phone: p.phone,
      message_count: senderMessages.length,
      first_message_date: senderMessages.length > 0
        ? senderMessages[0].timestamp.split('T')[0]
        : new Date().toISOString().split('T')[0],
      last_message_date: senderMessages.length > 0
        ? senderMessages[senderMessages.length - 1].timestamp.split('T')[0]
        : new Date().toISOString().split('T')[0],
      messages: senderMessages,
      name_source: 'evolution_api',
      name_confidence: 'high',
    });
  }

  // Calculate date range
  const allTimestamps = messages
    .map((m) => m.messageTimestamp ? Number(m.messageTimestamp) * 1000 : null)
    .filter(Boolean);

  const today = new Date().toISOString().split('T')[0];
  const dateRange = {
    start: allTimestamps.length > 0
      ? new Date(Math.min(...allTimestamps)).toISOString().split('T')[0]
      : today,
    end: allTimestamps.length > 0
      ? new Date(Math.max(...allTimestamps)).toISOString().split('T')[0]
      : today,
  };

  return {
    group_name: group.subject || group.name || 'Unknown Group',
    date_range: dateRange,
    total_messages: messages.length,
    total_contacts: contacts.length,
    contacts,
    _meta: {
      source: 'evolution_api',
      instance: undefined, // filled by caller
      fetched_at: new Date().toISOString(),
      phones_resolved: true,
    },
  };
}

/**
 * Extract text content from an Evolution API message object.
 * Messages can have different structures depending on type.
 *
 * @param {object} msg - Raw message from findMessages
 * @returns {string|null} Text content or null if not text
 */
function extractMessageContent(msg) {
  const m = msg.message;
  if (!m) return null;

  // Text message
  if (m.conversation) return m.conversation;
  if (m.extendedTextMessage?.text) return m.extendedTextMessage.text;

  // Media with caption
  if (m.imageMessage?.caption) return `[image] ${m.imageMessage.caption}`;
  if (m.videoMessage?.caption) return `[video] ${m.videoMessage.caption}`;
  if (m.documentMessage?.caption) return `[document] ${m.documentMessage.caption}`;

  // Audio/sticker (no text content)
  if (m.audioMessage) return '[audio]';
  if (m.stickerMessage) return null;

  return null;
}

/**
 * List available groups from the reader instance.
 * Utility for users to discover groupJid before running fetchGroupViaApi.
 *
 * @param {object} opts
 * @param {string} opts.baseUrl  - Evolution API base URL
 * @param {string} opts.apiKey   - API key
 * @param {string} opts.instance - Reader instance name
 * @returns {Promise<Array<{jid: string, name: string, participants: number}>>}
 */
async function listAvailableGroups(opts) {
  const { baseUrl, apiKey, instance } = opts;
  const client = new EvolutionClient({ baseUrl, apiKey, instance });

  const groups = await client.fetchAllGroups({ getParticipants: true });
  if (!Array.isArray(groups)) return [];

  return groups.map((g) => ({
    jid: g.id || g.jid,
    name: g.subject || g.name || 'Unknown',
    participants: g.participants?.length || g.size || 0,
  }));
}

module.exports = {
  fetchGroupViaApi,
  buildParsedExport,
  listAvailableGroups,
  extractMessageContent,
};
