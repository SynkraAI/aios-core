/**
 * Confluence REST API Client
 * Enterprise QA DevOps Squad
 *
 * Handles all interactions with Confluence Cloud/Server REST API.
 * Extends ResilientClient for circuit breaker, retry, and rate limiting.
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { ResilientClient } = require('./resilient-client');

class ConfluenceClient extends ResilientClient {
  constructor(options = {}) {
    // Initialize resilience patterns
    super({
      serviceName: 'Confluence',
      timeout: options.timeout || 30000,
      circuitBreaker: {
        failureThreshold: options.failureThreshold || 5,
        resetTimeout: options.resetTimeout || 30000
      },
      rateLimiter: {
        maxTokens: options.maxTokens || 100,  // Atlassian: ~100 req/min
        refillRate: options.refillRate || 2    // 2 tokens/sec
      },
      retry: {
        maxRetries: options.maxRetries || 3,
        baseDelay: options.baseDelay || 1000
      }
    });

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
  }

  /**
   * Execute request with resilience patterns
   */
  async _request(method, url, data = null, config = {}) {
    return this.executeWithResilience(
      async () => {
        const response = await this.client.request({
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

  // ==================== Content Operations ====================

  async createContent(payload) {
    return this._request('post', '/content', payload);
  }

  async getContentById(contentId, expand = []) {
    const params = expand.length > 0 ? { expand: expand.join(',') } : {};
    return this._request('get', `/content/${contentId}`, null, { params });
  }

  async updateContent(contentId, payload) {
    return this._request('put', `/content/${contentId}`, payload);
  }

  async deleteContent(contentId) {
    return this._request('delete', `/content/${contentId}`);
  }

  // ==================== Search Operations ====================

  async searchContent(cql, options = {}) {
    const params = {
      cql,
      limit: options.limit || 25,
      start: options.start || 0,
      expand: options.expand?.join(',') || 'space,version'
    };
    return this._request('get', '/content/search', null, { params });
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
    return this._request('get', `/space/${spaceKey}`);
  }

  async getSpaces() {
    return this._request('get', '/space');
  }

  async getSpaceContent(spaceKey, type = 'page', options = {}) {
    const params = {
      type,
      limit: options.limit || 25,
      start: options.start || 0,
      expand: options.expand?.join(',') || 'version'
    };
    return this._request('get', `/space/${spaceKey}/content`, null, { params });
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
    return this._request('get', `/content/${contentId}/label`);
  }

  async addLabels(contentId, labels) {
    const labelPayload = labels.map(label => ({
      prefix: 'global',
      name: label
    }));
    return this._request('post', `/content/${contentId}/label`, labelPayload);
  }

  async removeLabel(contentId, label) {
    return this._request('delete', `/content/${contentId}/label/${label}`);
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
    return this._request('get', `/content/${contentId}/child/attachment`);
  }

  async addAttachment(contentId, filePath, comment = null) {
    return this.executeWithResilience(
      async () => {
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
      },
      { operation: 'addAttachment' }
    );
  }

  // ==================== Template Operations ====================

  async getTemplates(spaceKey = null) {
    const params = spaceKey ? { spaceKey } : {};
    return this._request('get', '/template/page', null, { params });
  }

  async getTemplate(templateId) {
    return this._request('get', `/template/${templateId}`);
  }

  // ==================== History Operations ====================

  async getContentHistory(contentId) {
    return this._request('get', `/content/${contentId}/history`);
  }

  async getContentVersion(contentId, versionNumber) {
    return this._request('get', `/content/${contentId}/version/${versionNumber}`, null, {
      params: { expand: 'content' }
    });
  }

  // ==================== Children/Ancestors ====================

  async getChildren(contentId, type = 'page') {
    return this._request('get', `/content/${contentId}/child/${type}`);
  }

  async getAncestors(contentId) {
    const content = await this.getContentById(contentId, ['ancestors']);
    return content.ancestors;
  }

  // ==================== Health Check ====================

  async healthCheck() {
    const baseHealth = await super.healthCheck();

    try {
      await this.getSpaces();
      return {
        ...baseHealth,
        status: baseHealth.status === 'degraded' ? 'degraded' : 'healthy',
        service: 'Confluence',
        message: 'Connected to Confluence successfully',
        domain: this.domain
      };
    } catch (error) {
      return {
        ...baseHealth,
        status: 'unhealthy',
        service: 'Confluence',
        message: error.message,
        domain: this.domain
      };
    }
  }
}

module.exports = { ConfluenceClient };
