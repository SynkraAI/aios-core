'use strict';

const { jidToE164, isGroupJid } = require('./jid-utils');

/**
 * Mixin: group-related methods for EvolutionClient.
 */
const GroupsMixin = (Base) =>
  class extends Base {
    /**
     * Fetch all groups the instance belongs to.
     * @param {object} [opts]
     * @param {boolean} [opts.getParticipants=false] - Include participant list
     * @returns {Promise<Array<object>>} Array of group objects
     */
    async fetchAllGroups(opts = {}) {
      const getParticipants = opts.getParticipants ? 'true' : 'false';
      return this._request('GET', `/group/fetchAllGroups/${this.instance}?getParticipants=${getParticipants}`);
    }

    /**
     * Get participants of a specific group.
     * @param {string} groupJid - Group JID (e.g. "120363012345678901@g.us")
     * @returns {Promise<Array<object>>} Array of participant objects
     */
    async getParticipants(groupJid) {
      if (!isGroupJid(groupJid)) {
        throw new Error(`Invalid group JID: ${groupJid}`);
      }
      return this._request(
        'GET',
        `/group/participants/${this.instance}?groupJid=${encodeURIComponent(groupJid)}`
      );
    }

    /**
     * Find messages from a specific chat (group or individual).
     * Uses the chat/findMessages endpoint with a where clause.
     * @param {string} remoteJid - Chat JID (group or individual)
     * @param {object} [opts]
     * @param {number} [opts.limit] - Max messages to return
     * @param {number} [opts.offset] - Skip N messages
     * @returns {Promise<Array<object>>} Array of message objects
     */
    async findMessages(remoteJid, opts = {}) {
      const where = { key: { remoteJid } };
      const body = { where };
      if (opts.limit) body.limit = opts.limit;
      if (opts.offset) body.offset = opts.offset;

      return this._request('POST', `/chat/findMessages/${this.instance}`, body);
    }

    /**
     * Extract participants from a group with phone numbers resolved.
     * Convenience method that combines getParticipants + jidToE164.
     * @param {string} groupJid - Group JID
     * @returns {Promise<Array<{phone: string, jid: string, admin: boolean}>>}
     */
    async getParticipantsWithPhones(groupJid) {
      const rawParticipants = await this.getParticipants(groupJid);

      // Evolution API returns { participants: [...] } or direct array
      const participants = Array.isArray(rawParticipants)
        ? rawParticipants
        : rawParticipants?.participants ?? [];

      return participants
        .filter((p) => p.id && !isGroupJid(p.id))
        .map((p) => {
          try {
            return {
              phone: jidToE164(p.id),
              jid: p.id,
              admin: p.admin === 'admin' || p.admin === 'superadmin',
              pushName: p.name || p.pushName || '',
            };
          } catch {
            return null;
          }
        })
        .filter(Boolean);
    }
  };

module.exports = { GroupsMixin };
