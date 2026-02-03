/**
 * Confluence REST API Client
 * Enterprise QA DevOps Squad
 *
 * Handles all interactions with Confluence Cloud/Server REST API.
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

class ConfluenceClient {
  constructor(options = {}) {
    this.domain = options.domain || process.env.ATLASSIAN_DOMAIN;
    this.email = options.email || process.env.ATLASSIAN_EMAIL;
    this.apiToken = options.apiToken || process.env.ATLASSIAN_API_TOKEN;

    if (!this.domain || !this.email || !this.apiToken) {
      throw new Error('Confluence credentials not configured. Set ATLASSIAN_DOMAIN, ATLASSIAN_EMAIL, and ATLASSIAN_API_TOKEN');
    }

    this.baseUrl = `https://${this.domain}/wiki/rest/api`;
    this.auth = Buffer.from(`${this.email}:${this.apiToken}`).toString('base64');

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Basic ${this.auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    this.client.interceptors.response.use(
      response => response,
      error => this.handleError(error)
    );
  }

  handleError(error) {
    if (error.response) {
      const { status, data } = error.response;
      const message = data.message || JSON.stringify(data) || 'Unknown error';

      switch (status) {
        case 401:
          throw new Error(`Authentication failed: ${message}`);
        case 403:
          throw new Error(`Permission denied: ${message}`);
        case 404:
          throw new Error(`Not found: ${message}`);
        case 400:
          throw new Error(`Bad request: ${message}`);
        case 409:
          throw new Error(`Conflict (page may already exist): ${message}`);
        default:
          throw new Error(`Confluence API error (${status}): ${message}`);
      }
    }
    throw error;
  }

  // ==================== Content Operations ====================

  async createContent(payload) {
    const response = await this.client.post('/content', payload);
    return response.data;
  }

  async getContentById(contentId, expand = []) {
    const params = expand.length > 0 ? { expand: expand.join(',') } : {};
    const response = await this.client.get(`/content/${contentId}`, { params });
    return response.data;
  }

  async updateContent(contentId, payload) {
    const response = await this.client.put(`/content/${contentId}`, payload);
    return response.data;
  }

  async deleteContent(contentId) {
    const response = await this.client.delete(`/content/${contentId}`);
    return response.data;
  }

  // ==================== Search Operations ====================

  async searchContent(cql, options = {}) {
    const params = {
      cql,
      limit: options.limit || 25,
      start: options.start || 0,
      expand: options.expand?.join(',') || 'space,version'
    };
    const response = await this.client.get('/content/search', { params });
    return response.data;
  }

  async findPage(spaceKey, title) {
    const cql = `space = "${spaceKey}" AND title = "${title}" AND type = "page"`;
    const results = await this.searchContent(cql);

    if (results.results.length === 0) {
      throw new Error(`Page not found: "${title}" in space "${spaceKey}"`);
    }

    return results.results[0];
  }

  // ==================== Space Operations ====================

  async getSpace(spaceKey) {
    const response = await this.client.get(`/space/${spaceKey}`);
    return response.data;
  }

  async getSpaces() {
    const response = await this.client.get('/space');
    return response.data;
  }

  async getSpaceContent(spaceKey, type = 'page', options = {}) {
    const params = {
      type,
      limit: options.limit || 25,
      start: options.start || 0,
      expand: options.expand?.join(',') || 'version'
    };
    const response = await this.client.get(`/space/${spaceKey}/content`, { params });
    return response.data;
  }

  // ==================== Page Operations ====================

  async createPage(space, title, content, options = {}) {
    const payload = {
      type: 'page',
      title,
      space: { key: space },
      body: {
        storage: {
          value: content,
          representation: 'storage'
        }
      },
      status: options.status || 'current'
    };

    if (options.parentId) {
      payload.ancestors = [{ id: options.parentId }];
    } else if (options.parentTitle) {
      const parent = await this.findPage(space, options.parentTitle);
      payload.ancestors = [{ id: parent.id }];
    }

    const page = await this.createContent(payload);

    if (options.labels) {
      await this.addLabels(page.id, options.labels);
    }

    return page;
  }

  async updatePage(pageId, title, content, message = null) {
    // Get current version
    const page = await this.getContentById(pageId, ['version']);
    const newVersion = page.version.number + 1;

    const payload = {
      type: 'page',
      title,
      body: {
        storage: {
          value: content,
          representation: 'storage'
        }
      },
      version: {
        number: newVersion,
        message: message || 'Updated by AIOS'
      }
    };

    return this.updateContent(pageId, payload);
  }

  async appendToPage(pageId, content) {
    const page = await this.getContentById(pageId, ['body.storage', 'version']);
    const existingContent = page.body.storage.value;
    const newContent = existingContent + content;

    return this.updatePage(pageId, page.title, newContent, 'Content appended');
  }

  // ==================== Label Operations ====================

  async getLabels(contentId) {
    const response = await this.client.get(`/content/${contentId}/label`);
    return response.data;
  }

  async addLabels(contentId, labels) {
    const labelPayload = labels.map(label => ({
      prefix: 'global',
      name: label
    }));
    const response = await this.client.post(`/content/${contentId}/label`, labelPayload);
    return response.data;
  }

  async removeLabel(contentId, label) {
    const response = await this.client.delete(`/content/${contentId}/label/${label}`);
    return response.data;
  }

  async removeLabels(contentId, labels) {
    const results = [];
    for (const label of labels) {
      try {
        await this.removeLabel(contentId, label);
        results.push({ label, success: true });
      } catch (error) {
        results.push({ label, success: false, error: error.message });
      }
    }
    return results;
  }

  // ==================== Attachment Operations ====================

  async getAttachments(contentId) {
    const response = await this.client.get(`/content/${contentId}/child/attachment`);
    return response.data;
  }

  async addAttachment(contentId, filePath, comment = null) {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));

    if (comment) {
      formData.append('comment', comment);
    }

    const response = await axios.post(
      `${this.baseUrl}/content/${contentId}/child/attachment`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Basic ${this.auth}`,
          'X-Atlassian-Token': 'nocheck'
        }
      }
    );

    return response.data;
  }

  // ==================== Template Operations ====================

  async getTemplates(spaceKey = null) {
    const params = spaceKey ? { spaceKey } : {};
    const response = await this.client.get('/template/page', { params });
    return response.data;
  }

  async getTemplate(templateId) {
    const response = await this.client.get(`/template/${templateId}`);
    return response.data;
  }

  // ==================== History Operations ====================

  async getContentHistory(contentId) {
    const response = await this.client.get(`/content/${contentId}/history`);
    return response.data;
  }

  async getContentVersion(contentId, versionNumber) {
    const response = await this.client.get(`/content/${contentId}/version/${versionNumber}`, {
      params: { expand: 'content' }
    });
    return response.data;
  }

  // ==================== Children/Ancestors ====================

  async getChildren(contentId, type = 'page') {
    const response = await this.client.get(`/content/${contentId}/child/${type}`);
    return response.data;
  }

  async getAncestors(contentId) {
    const content = await this.getContentById(contentId, ['ancestors']);
    return content.ancestors;
  }

  // ==================== Health Check ====================

  async healthCheck() {
    try {
      await this.getSpaces();
      return { status: 'healthy', message: 'Connected to Confluence successfully' };
    } catch (error) {
      return { status: 'unhealthy', message: error.message };
    }
  }
}

module.exports = { ConfluenceClient };
