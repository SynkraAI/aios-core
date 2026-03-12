'use strict';

/**
 * Mixin: instance management methods for EvolutionClient.
 */
const InstancesMixin = (Base) =>
  class extends Base {
    /**
     * Create a new Evolution API instance.
     * @param {object} config
     * @param {string} config.instanceName - Name for the new instance
     * @param {boolean} [config.qrcode=true] - Return QR code on creation
     * @returns {Promise<object>}
     */
    async createInstance(config) {
      const body = {
        instanceName: config.instanceName,
        qrcode: config.qrcode ?? true,
      };
      return this._request('POST', '/instance/create', body);
    }

    /**
     * Get connection state of the current instance.
     * @returns {Promise<object>} - { instance, state }
     */
    async getConnectionState() {
      return this._request('GET', `/instance/connectionState/${this.instance}`);
    }

    /**
     * Fetch instance info.
     * @returns {Promise<object>}
     */
    async fetchInstance() {
      return this._request('GET', `/instance/fetchInstances?instanceName=${this.instance}`);
    }
  };

module.exports = { InstancesMixin };
