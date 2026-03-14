'use strict';

/**
 * Utilities for WhatsApp JID (Jabber ID) manipulation.
 *
 * JID formats:
 *   - Individual: "5531999887766@s.whatsapp.net"
 *   - Group:      "120363012345678901@g.us"
 */

/**
 * Convert a WhatsApp JID to E.164 phone format.
 * @param {string} jid - e.g. "5531999887766@s.whatsapp.net"
 * @returns {string} E.164 phone, e.g. "+5531999887766"
 * @throws {Error} If jid is a group JID or invalid
 */
function jidToE164(jid) {
  if (!jid || typeof jid !== 'string') {
    throw new Error('Invalid JID: must be a non-empty string');
  }

  if (!jid.includes('@')) {
    throw new Error(`Invalid JID format: ${jid}`);
  }

  if (isGroupJid(jid)) {
    throw new Error(`Cannot convert group JID to phone: ${jid}`);
  }

  const number = jid.split('@')[0];
  if (!number || !/^\d+$/.test(number)) {
    throw new Error(`Invalid JID format: ${jid}`);
  }

  return `+${number}`;
}

/**
 * Check if a JID belongs to a group.
 * @param {string} jid
 * @returns {boolean}
 */
function isGroupJid(jid) {
  return typeof jid === 'string' && jid.endsWith('@g.us');
}

/**
 * Check if a JID belongs to an individual user.
 * @param {string} jid
 * @returns {boolean}
 */
function isIndividualJid(jid) {
  return typeof jid === 'string' && jid.endsWith('@s.whatsapp.net');
}

/**
 * Extract the raw number from any JID.
 * @param {string} jid
 * @returns {string} The part before @
 */
function extractNumber(jid) {
  if (!jid || typeof jid !== 'string') return '';
  return jid.split('@')[0] || '';
}

module.exports = {
  jidToE164,
  isGroupJid,
  isIndividualJid,
  extractNumber,
};
