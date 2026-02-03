/**
 * Microsoft Graph API Client
 * Enterprise QA DevOps Squad
 *
 * Handles all interactions with Microsoft 365 via Graph API.
 */

const axios = require('axios');
const { ConfidentialClientApplication } = require('@azure/msal-node');

class GraphClient {
  constructor(options = {}) {
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

  // ==================== Mail Operations ====================

  async sendMail(payload, userId = 'me') {
    const client = await this.getClient();
    const response = await client.post(`/users/${userId}/sendMail`, payload);
    return response.data;
  }

  async getMessages(userId = 'me', options = {}) {
    const client = await this.getClient();
    const params = {
      $top: options.limit || 10,
      $orderby: 'receivedDateTime desc',
      $filter: options.filter
    };

    const response = await client.get(`/users/${userId}/messages`, { params });
    return response.data;
  }

  async getUnreadMessages(userId = 'me', limit = 10) {
    return this.getMessages(userId, {
      limit,
      filter: 'isRead eq false'
    });
  }

  async getMessage(messageId, userId = 'me') {
    const client = await this.getClient();
    const response = await client.get(`/users/${userId}/messages/${messageId}`);
    return response.data;
  }

  async markAsRead(messageId, userId = 'me') {
    const client = await this.getClient();
    const response = await client.patch(`/users/${userId}/messages/${messageId}`, {
      isRead: true
    });
    return response.data;
  }

  // ==================== Calendar Operations ====================

  async createEvent(event, userId = 'me') {
    const client = await this.getClient();
    const response = await client.post(`/users/${userId}/events`, event);
    return response.data;
  }

  async getEvents(userId = 'me', options = {}) {
    const client = await this.getClient();
    const params = {
      $top: options.limit || 10,
      $orderby: 'start/dateTime'
    };

    if (options.startDateTime && options.endDateTime) {
      params.$filter = `start/dateTime ge '${options.startDateTime}' and end/dateTime le '${options.endDateTime}'`;
    }

    const response = await client.get(`/users/${userId}/events`, { params });
    return response.data;
  }

  async getEvent(eventId, userId = 'me') {
    const client = await this.getClient();
    const response = await client.get(`/users/${userId}/events/${eventId}`);
    return response.data;
  }

  async updateEvent(eventId, updates, userId = 'me') {
    const client = await this.getClient();
    const response = await client.patch(`/users/${userId}/events/${eventId}`, updates);
    return response.data;
  }

  async deleteEvent(eventId, userId = 'me') {
    const client = await this.getClient();
    await client.delete(`/users/${userId}/events/${eventId}`);
    return { success: true };
  }

  // ==================== Teams Operations ====================

  async getJoinedTeams(userId = 'me') {
    const client = await this.getClient();
    const response = await client.get(`/users/${userId}/joinedTeams`);
    return response.data;
  }

  async getTeam(teamId) {
    const client = await this.getClient();
    const response = await client.get(`/teams/${teamId}`);
    return response.data;
  }

  async getChannels(teamId) {
    const client = await this.getClient();
    const response = await client.get(`/teams/${teamId}/channels`);
    return response.data;
  }

  async getChannel(teamId, channelId) {
    const client = await this.getClient();
    const response = await client.get(`/teams/${teamId}/channels/${channelId}`);
    return response.data;
  }

  async postChannelMessage(teamId, channelId, message) {
    const client = await this.getClient();
    const response = await client.post(
      `/teams/${teamId}/channels/${channelId}/messages`,
      message
    );
    return response.data;
  }

  async getChannelMessages(teamId, channelId, options = {}) {
    const client = await this.getClient();
    const params = {
      $top: options.limit || 20
    };
    const response = await client.get(
      `/teams/${teamId}/channels/${channelId}/messages`,
      { params }
    );
    return response.data;
  }

  // ==================== User Operations ====================

  async getUser(userId) {
    const client = await this.getClient();
    const response = await client.get(`/users/${userId}`);
    return response.data;
  }

  async getUserByEmail(email) {
    const client = await this.getClient();
    const response = await client.get('/users', {
      params: {
        $filter: `mail eq '${email}' or userPrincipalName eq '${email}'`
      }
    });

    if (response.data.value.length === 0) {
      throw new Error(`User not found: ${email}`);
    }

    return response.data.value[0];
  }

  async searchUsers(query) {
    const client = await this.getClient();
    const response = await client.get('/users', {
      params: {
        $filter: `startsWith(displayName, '${query}') or startsWith(mail, '${query}')`
      }
    });
    return response.data;
  }

  // ==================== OneDrive/SharePoint Operations ====================

  async uploadFile(content, path, driveId = null) {
    const client = await this.getClient();
    const endpoint = driveId
      ? `/drives/${driveId}/root:${path}:/content`
      : `/me/drive/root:${path}:/content`;

    const response = await client.put(endpoint, content, {
      headers: {
        'Content-Type': 'application/octet-stream'
      }
    });
    return response.data;
  }

  async getFile(path, driveId = null) {
    const client = await this.getClient();
    const endpoint = driveId
      ? `/drives/${driveId}/root:${path}`
      : `/me/drive/root:${path}`;

    const response = await client.get(endpoint);
    return response.data;
  }

  async listFolder(path, driveId = null) {
    const client = await this.getClient();
    const endpoint = driveId
      ? `/drives/${driveId}/root:${path}:/children`
      : `/me/drive/root:${path}:/children`;

    const response = await client.get(endpoint);
    return response.data;
  }

  async createSharingLink(itemId, type = 'view', driveId = null) {
    const client = await this.getClient();
    const endpoint = driveId
      ? `/drives/${driveId}/items/${itemId}/createLink`
      : `/me/drive/items/${itemId}/createLink`;

    const response = await client.post(endpoint, {
      type,
      scope: 'organization'
    });
    return response.data;
  }

  // ==================== Presence ====================

  async getUserPresence(userId) {
    const client = await this.getClient();
    const response = await client.get(`/users/${userId}/presence`);
    return response.data;
  }

  // ==================== Health Check ====================

  async healthCheck() {
    try {
      await this.getToken();
      return { status: 'healthy', message: 'Connected to Microsoft Graph successfully' };
    } catch (error) {
      return { status: 'unhealthy', message: error.message };
    }
  }
}

module.exports = { GraphClient };
