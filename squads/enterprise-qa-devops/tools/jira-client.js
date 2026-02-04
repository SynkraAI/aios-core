/**
 * Jira REST API Client
 * Enterprise QA DevOps Squad
 *
 * Handles all interactions with Jira Cloud/Server REST API.
 * Extends ResilientClient for circuit breaker, retry, and rate limiting.
 */

const axios = require('axios');
const { ResilientClient } = require('./resilient-client');

class JiraClient extends ResilientClient {
  constructor(options = {}) {
    // Initialize resilience patterns
    super({
      serviceName: 'Jira',
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
      throw new Error('Jira credentials not configured. Set ATLASSIAN_DOMAIN, ATLASSIAN_EMAIL, and ATLASSIAN_API_TOKEN');
    }

    this.baseUrl = `https://${this.domain}/rest/api/3`;
    this.agileUrl = `https://${this.domain}/rest/agile/1.0`;
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

  // ==================== Issue Operations ====================

  async createIssue(payload) {
    return this._request('post', '/issue', payload);
  }

  async getIssue(issueKey, expand = []) {
    const params = expand.length > 0 ? { expand: expand.join(',') } : {};
    return this._request('get', `/issue/${issueKey}`, null, { params });
  }

  async updateIssue(issueKey, payload) {
    return this._request('put', `/issue/${issueKey}`, payload);
  }

  async deleteIssue(issueKey, deleteSubtasks = false) {
    const params = deleteSubtasks ? { deleteSubtasks: 'true' } : {};
    return this._request('delete', `/issue/${issueKey}`, null, { params });
  }

  // ==================== Search Operations ====================

  async search(params) {
    return this._request('post', '/search', {
      jql: params.jql,
      maxResults: params.maxResults || 50,
      startAt: params.startAt || 0,
      fields: params.fields || ['summary', 'status', 'assignee', 'priority', 'issuetype']
    });
  }

  async searchWithJql(jql, options = {}) {
    return this.search({
      jql,
      maxResults: options.maxResults,
      startAt: options.startAt,
      fields: options.fields
    });
  }

  // ==================== Transitions ====================

  async getTransitions(issueKey) {
    return this._request('get', `/issue/${issueKey}/transitions`);
  }

  async doTransition(issueKey, payload) {
    return this._request('post', `/issue/${issueKey}/transitions`, payload);
  }

  async transitionTo(issueKey, statusName, comment = null) {
    const transitions = await this.getTransitions(issueKey);
    const target = transitions.transitions.find(
      t => t.to.name.toLowerCase() === statusName.toLowerCase()
    );

    if (!target) {
      throw new Error(`Cannot transition to "${statusName}". Available: ${transitions.transitions.map(t => t.to.name).join(', ')}`);
    }

    const payload = { transition: { id: target.id } };

    if (comment) {
      payload.update = {
        comment: [{
          add: {
            body: {
              type: 'doc',
              version: 1,
              content: [{ type: 'paragraph', content: [{ type: 'text', text: comment }] }]
            }
          }
        }]
      };
    }

    return this.doTransition(issueKey, payload);
  }

  // ==================== Comments ====================

  async addComment(issueKey, body) {
    const payload = {
      body: {
        type: 'doc',
        version: 1,
        content: [{ type: 'paragraph', content: [{ type: 'text', text: body }] }]
      }
    };
    return this._request('post', `/issue/${issueKey}/comment`, payload);
  }

  async getComments(issueKey) {
    return this._request('get', `/issue/${issueKey}/comment`);
  }

  // ==================== Issue Links ====================

  async linkIssues(inwardIssue, outwardIssue, linkType) {
    const payload = {
      type: { name: linkType },
      inwardIssue: { key: inwardIssue },
      outwardIssue: { key: outwardIssue }
    };
    return this._request('post', '/issueLink', payload);
  }

  // ==================== User Operations ====================

  async searchUsers(query) {
    return this._request('get', '/user/search', null, { params: { query } });
  }

  async getAccountId(email) {
    const users = await this.searchUsers(email);
    const user = users.find(u => u.emailAddress === email);
    if (!user) {
      throw new Error(`User not found: ${email}`);
    }
    return user.accountId;
  }

  async getCurrentUser() {
    return this._request('get', '/myself');
  }

  // ==================== Project Operations ====================

  async getProject(projectKey) {
    return this._request('get', `/project/${projectKey}`);
  }

  async getProjects() {
    return this._request('get', '/project');
  }

  // ==================== Sprint Operations ====================

  async getSprints(boardId) {
    return this.executeWithResilience(
      async () => {
        const response = await this.client.get(`/board/${boardId}/sprint`, {
          baseURL: this.agileUrl
        });
        return response.data;
      },
      { operation: 'getSprints' }
    );
  }

  async getActiveSprint(boardId) {
    const sprints = await this.getSprints(boardId);
    return sprints.values.find(s => s.state === 'active');
  }

  async addToSprint(issueKey, sprintId) {
    return this.executeWithResilience(
      async () => {
        const response = await this.client.post(`/sprint/${sprintId}/issue`, {
          issues: [issueKey]
        }, {
          baseURL: this.agileUrl
        });
        return response.data;
      },
      { operation: 'addToSprint' }
    );
  }

  // ==================== Version Operations ====================

  async getVersions(projectKey) {
    return this._request('get', `/project/${projectKey}/versions`);
  }

  async createVersion(projectKey, name, options = {}) {
    const payload = {
      name,
      project: projectKey,
      ...options
    };
    return this._request('post', '/version', payload);
  }

  async updateVersion(versionId, payload) {
    return this._request('put', `/version/${versionId}`, payload);
  }

  async releaseVersion(versionId) {
    return this.updateVersion(versionId, {
      released: true,
      releaseDate: new Date().toISOString().split('T')[0]
    });
  }

  // ==================== Bulk Operations ====================

  async bulkCreateIssues(issues) {
    const payload = {
      issueUpdates: issues.map(issue => ({ fields: issue }))
    };
    return this._request('post', '/issue/bulk', payload);
  }

  // ==================== Health Check ====================

  async healthCheck() {
    // Get base health from ResilientClient
    const baseHealth = await super.healthCheck();

    try {
      await this.getCurrentUser();
      return {
        ...baseHealth,
        status: baseHealth.status === 'degraded' ? 'degraded' : 'healthy',
        service: 'Jira',
        message: 'Connected to Jira successfully',
        domain: this.domain
      };
    } catch (error) {
      return {
        ...baseHealth,
        status: 'unhealthy',
        service: 'Jira',
        message: error.message,
        domain: this.domain
      };
    }
  }
}

module.exports = { JiraClient };
