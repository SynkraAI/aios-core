'use strict';

/**
 * Mixin: message-related methods for EvolutionClient.
 */
const MessagesMixin = (Base) =>
  class extends Base {
    /**
     * Send a text message.
     * @param {string} number  - Recipient phone (E.164 without +, e.g. "5511999999999")
     * @param {string} text    - Message body
     * @param {object} [opts]
     * @param {number} [opts.delay] - Typing simulation delay in ms
     * @returns {Promise<object>}
     */
    async sendText(number, text, opts = {}) {
      const body = {
        number,
        text,
      };
      if (opts.delay) body.delay = opts.delay;

      return this._request('POST', `/message/sendText/${this.instance}`, body);
    }

    /**
     * Send a media message (image, document, audio, video).
     * @param {string} number  - Recipient phone
     * @param {object} media
     * @param {string} media.mediatype - "image" | "document" | "audio" | "video"
     * @param {string} media.url       - Public URL of the media
     * @param {string} [media.caption] - Caption text
     * @param {string} [media.fileName] - File name for documents
     * @param {object} [opts]
     * @param {number} [opts.delay] - Typing simulation delay in ms
     * @returns {Promise<object>}
     */
    async sendMedia(number, media, opts = {}) {
      const body = {
        number,
        mediatype: media.mediatype ?? 'document',
        media: media.url,
      };
      if (media.caption) body.caption = media.caption;
      if (media.fileName) body.fileName = media.fileName;
      if (opts.delay) body.delay = opts.delay;

      return this._request('POST', `/message/sendMedia/${this.instance}`, body);
    }

    /**
     * Send messages in batch with pacing to avoid rate limits.
     * @param {Array<{number: string, [key: string]: any}>} contacts
     * @param {function} templateFn - (contact) => { text } or { media }
     * @param {object} [opts]
     * @param {number} [opts.intervalMs=3000] - Delay between sends
     * @param {function} [opts.onProgress]    - Called after each send with result
     * @returns {Promise<{sent: number, failed: number, results: Array}>}
     */
    async sendBatch(contacts, templateFn, opts = {}) {
      const intervalMs = opts.intervalMs ?? 3000;
      const results = [];
      let sent = 0;
      let failed = 0;

      for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];

        if (i > 0) {
          await this.constructor._sleep(intervalMs);
        }

        try {
          const msg = templateFn(contact);
          let response;

          if (msg.media) {
            response = await this.sendMedia(contact.number, msg.media, msg.options);
          } else {
            response = await this.sendText(contact.number, msg.text, msg.options);
          }

          const result = { contact, status: 'sent', response };
          results.push(result);
          sent++;
          if (opts.onProgress) opts.onProgress(result);
        } catch (err) {
          const result = { contact, status: 'failed', error: err.message };
          results.push(result);
          failed++;
          if (opts.onProgress) opts.onProgress(result);
        }
      }

      return { sent, failed, results };
    }
  };

module.exports = { MessagesMixin };
