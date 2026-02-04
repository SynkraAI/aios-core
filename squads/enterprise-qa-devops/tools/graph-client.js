/**
 * Microsoft Graph API Client
 * Enterprise QA DevOps Squad
 *
 * Handles all interactions with Microsoft 365 via Graph API.
 * Extends ResilientClient for circuit breaker, retry, and rate limiting.
 */

const axios = require('axios');
const { ConfidentialClientApplication } = require('@azure/msal-node');
const { ResilientClient } = require('./resilient-client');

class GraphClient extends ResilientClient {
  constructor(options = {}) {
    // Initialize resilience patterns
    super({
      serviceName: 'Microsoft Graph',
      timeout: options.timeout || 30000,
      circuitBreaker: {
        failureThreshold: options.failureThreshold || 5,
        resetTimeout: options.resetTimeout || 30000
      },
      rateLimiter: {
        maxTokens: options.maxTokens || 100,  // Graph: 10,000 req/10min = ~17/sec
        refillRate: options.refillRate || 10   // 10 tokens/sec
      },
      retry: {
        maxRetries: options.maxRetries || 3,
        baseDelay: options.baseDelay || 1000
      }
    });

    this.clientId = options.clientId || process.env.MS365_CLIENT_ID;
    this.clientSecret = options.clientSecret || process.env.MS365_CLIENT_SECRET;
    this.tenantId = options.tenantId || process.env.MS365_TENANT_ID;

    if (!this.clientId || !this.clientSecret || !this.tenantId) {
      throw new Error('Microsoft 365 credentials not configured. Set MS365_CLIENT_ID, MS365_CLIENT_SECRET, and MS365_TENANT_ID');
    }

    this.baseUrl = 'https://graph.microsoft.com/v1.0';
    this.scopes = ['https://graph.microsoft.com/.default'];

    this.msalConfig = {
      auth: {
        clientId: this.clientId,
        clientSecret: this.clientSecret,
        authority: `https://login.microsoftonline.com/${this.tenantId}`
      }
    };

    this.msalClient = new ConfidentialClientApplication(this.msalConfig);
    this.token = null;
    this.tokenExpiry = null;
  }

  async getToken() {
    if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    const tokenRequest = {
      scopes: this.scopes
    };

    const response = await this.msalClient.acquireTokenByClientCredential(tokenRequest);
    this.token = response.accessToken;
    this.tokenExpiry = response.expiresOn.getTime();

    return this.token;
  }

  async getClient() {
    const token = await this.getToken();

    return axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Execute request with resilience patterns
   */
  async _request(method, url, data = null, config = {}) {
    return this.executeWithResilience(
      async () => {
        const client = await this.getClient();
        const response = await client.request({
          method,
          url,
          data,
          ...config
        });
        return response.data;
      },
      { operation: `${method} ${url}` }
    );
  }

  // ==================== Mail Operations ====================

  async sendMail(payload, userId = 'me') {
    return this._request('post', `/users/${userId}/sendMail`, payload);
  }

  async getMessages(userId = 'me', options = {}) {
    const params = {
      $top: options.limit || 10,
      $orderby: 'receivedDateTime desc',
      $filter: options.filter
    };
    return this._request('get', `/users/${userId}/messages`, null, { params });
  }

  async getUnreadMessages(userId = 'me', limit = 10) {
    return this.getMessages(userId, {
      limit,
      filter: 'isRead eq false'
    });
  }

  async getMessage(messageId, userId = 'me') {
    return this._request('get', `/users/${userId}/messages/${messageId}`);
  }

  async markAsRead(messageId, userId = 'me') {
    return this._request('patch', `/users/${userId}/messages/${messageId}`, {
      isRead: true
    });
  }

  // ==================== Calendar Operations ====================

  async createEvent(event, userId = 'me') {
    return this._request('post', `/users/${userId}/events`, event);
  }

  async getEvents(userId = 'me', options = {}) {
    const params = {
      $top: options.limit || 10,
      $orderby: 'start/dateTime'
    };

    if (options.startDateTime && options.endDateTime) {
      params.$filter = `start/dateTime ge '${options.startDateTime}' and end/dateTime le '${options.endDateTime}'`;
    }

    return this._request('get', `/users/${userId}/events`, null, { params });
  }

  async getEvent(eventId, userId = 'me') {
    return this._request('get', `/users/${userId}/events/${eventId}`);
  }

  async updateEvent(eventId, updates, userId = 'me') {
    return this._request('patch', `/users/${userId}/events/${eventId}`, updates);
  }

  async deleteEvent(eventId, userId = 'me') {
    await this._request('delete', `/users/${userId}/events/${eventId}`);
    return { success: true };
  }

  // ==================== Teams Operations ====================

  async getJoinedTeams(userId = 'me') {
    return this._request('get', `/users/${userId}/joinedTeams`);
  }

  async getTeam(teamId) {
    return this._request('get', `/teams/${teamId}`);
  }

  async getChannels(teamId) {
    return this._request('get', `/teams/${teamId}/channels`);
  }

  async getChannel(teamId, channelId) {
    return this._request('get', `/teams/${teamId}/channels/${channelId}`);
  }

  async postChannelMessage(teamId, channelId, message) {
    return this._request('post', `/teams/${teamId}/channels/${channelId}/messages`, message);
  }

  async getChannelMessages(teamId, channelId, options = {}) {
    const params = {
      $top: options.limit || 20
    };
    return this._request('get', `/teams/${teamId}/channels/${channelId}/messages`, null, { params });
  }

  // ==================== User Operations ====================

  async getUser(userId) {
    return this._request('get', `/users/${userId}`);
  }

  async getUserByEmail(email) {
    const response = await this._request('get', '/users', null, {
      params: {
        $filter: `mail eq '${email}' or userPrincipalName eq '${email}'`
      }
    });

    if (response.value.length === 0) {
      throw new Error(`User not found: ${email}`);
    }

    return response.value[0];
  }

  async searchUsers(query) {
    return this._request('get', '/users', null, {
      params: {
        $filter: `startsWith(displayName, '${query}') or startsWith(mail, '${query}')`
      }
    });
  }

  // ==================== OneDrive/SharePoint Operations ====================

  async uploadFile(content, path, driveId = null) {
    const endpoint = driveId
      ? `/drives/${driveId}/root:${path}:/content`
      : `/me/drive/root:${path}:/content`;

    return this.executeWithResilience(
      async () => {
        const client = await this.getClient();
        const response = await client.put(endpoint, content, {
          headers: {
            'Content-Type': 'application/octet-stream'
          }
        });
        return response.data;
      },
      { operation: 'uploadFile' }
    );
  }

  async getFile(path, driveId = null) {
    const endpoint = driveId
      ? `/drives/${driveId}/root:${path}`
      : `/me/drive/root:${path}`;
    return this._request('get', endpoint);
  }

  async listFolder(path, driveId = null) {
    const endpoint = driveId
      ? `/drives/${driveId}/root:${path}:/children`
      : `/me/drive/root:${path}:/children`;
    return this._request('get', endpoint);
  }

  async createSharingLink(itemId, type = 'view', driveId = null) {
    const endpoint = driveId
      ? `/drives/${driveId}/items/${itemId}/createLink`
      : `/me/drive/items/${itemId}/createLink`;
    return this._request('post', endpoint, {
      type,
      scope: 'organization'
    });
  }

  // ==================== Presence ====================

  async getUserPresence(userId) {
    return this._request('get', `/users/${userId}/presence`);
  }

  // ==================== Health Check ====================

  async healthCheck() {
    const baseHealth = await super.healthCheck();

    try {
      await this.getToken();
      return {
        ...baseHealth,
        status: baseHealth.status === 'degraded' ? 'degraded' : 'healthy',
        service: 'Microsoft Graph',
        message: 'Connected to Microsoft Graph successfully',
        tenantId: this.tenantId
      };
    } catch (error) {
      return {
        ...baseHealth,
        status: 'unhealthy',
        service: 'Microsoft Graph',
        message: error.message,
        tenantId: this.tenantId
      };
    }
  }
}

module.exports = { GraphClient };
