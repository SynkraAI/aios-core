/**
 * Jira REST API Client
 * Enterprise QA DevOps Squad
 *
 * Handles all interactions with Jira Cloud/Server REST API.
 */

const axios = require('axios');

class JiraClient {
  constructor(options = {}) {
    this.domain = options.domain || process.env.ATLASSIAN_DOMAIN;
    this.email = options.email || process.env.ATLASSIAN_EMAIL;
    this.apiToken = options.apiToken || process.env.ATLASSIAN_API_TOKEN;

    if (!this.domain || !this.email || !this.apiToken) {
      throw new Error('Jira credentials not configured. Set ATLASSIAN_DOMAIN, ATLASSIAN_EMAIL, and ATLASSIAN_API_TOKEN');
    }

    this.baseUrl = `https://${this.domain}/rest/api/3`;
    this.auth = Buffer.from(`${this.email}:${this.apiToken}`).toString('base64');

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Basic ${this.auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      error => this.handleError(error)
    );
  }

  handleError(error) {
    if (error.response) {
      const { status, data } = error.response;
      const message = data.errorMessages?.join(', ') || data.message || 'Unknown error';

      switch (status) {
        case 401:
          throw new Error(`Authentication failed: ${message}`);
        case 403:
          throw new Error(`Permission denied: ${message}`);
        case 404:
          throw new Error(`Not found: ${message}`);
        case 400:
          throw new Error(`Bad request: ${message}`);
        default:
          throw new Error(`Jira API error (${status}): ${message}`);
      }
    }
    throw error;
  }

  // ==================== Issue Operations ====================

  async createIssue(payload) {
    const response = await this.client.post('/issue', payload);
    return response.data;
  }

  async getIssue(issueKey, expand = []) {
    const params = expand.length > 0 ? { expand: expand.join(',') } : {};
    const response = await this.client.get(`/issue/${issueKey}`, { params });
    return response.data;
  }

  async updateIssue(issueKey, payload) {
    const response = await this.client.put(`/issue/${issueKey}`, payload);
    return response.data;
  }

  async deleteIssue(issueKey, deleteSubtasks = false) {
    const params = deleteSubtasks ? { deleteSubtasks: 'true' } : {};
    const response = await this.client.delete(`/issue/${issueKey}`, { params });
    return response.data;
  }

  // ==================== Search Operations ====================

  async search(params) {
    const response = await this.client.post('/search', {
      jql: params.jql,
      maxResults: params.maxResults || 50,
      startAt: params.startAt || 0,
      fields: params.fields || ['summary', 'status', 'assignee', 'priority', 'issuetype']
    });
    return response.data;
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
    const response = await this.client.get(`/issue/${issueKey}/transitions`);
    return response.data;
  }

  async doTransition(issueKey, payload) {
    const response = await this.client.post(`/issue/${issueKey}/transitions`, payload);
    return response.data;
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
    const response = await this.client.post(`/issue/${issueKey}/comment`, payload);
    return response.data;
  }

  async getComments(issueKey) {
    const response = await this.client.get(`/issue/${issueKey}/comment`);
    return response.data;
  }

  // ==================== Issue Links ====================

  async linkIssues(inwardIssue, outwardIssue, linkType) {
    const payload = {
      type: { name: linkType },
      inwardIssue: { key: inwardIssue },
      outwardIssue: { key: outwardIssue }
    };
    const response = await this.client.post('/issueLink', payload);
    return response.data;
  }

  // ==================== User Operations ====================

  async searchUsers(query) {
    const response = await this.client.get('/user/search', {
      params: { query }
    });
    return response.data;
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
    const response = await this.client.get('/myself');
    return response.data;
  }

  // ==================== Project Operations ====================

  async getProject(projectKey) {
    const response = await this.client.get(`/project/${projectKey}`);
    return response.data;
  }

  async getProjects() {
    const response = await this.client.get('/project');
    return response.data;
  }

  // ==================== Sprint Operations ====================

  async getSprints(boardId) {
    const response = await this.client.get(`/board/${boardId}/sprint`, {
      baseURL: `https://${this.domain}/rest/agile/1.0`
    });
    return response.data;
  }

  async getActiveSprint(boardId) {
    const sprints = await this.getSprints(boardId);
    return sprints.values.find(s => s.state === 'active');
  }

  async addToSprint(issueKey, sprintId) {
    const response = await this.client.post(`/sprint/${sprintId}/issue`, {
      issues: [issueKey]
    }, {
      baseURL: `https://${this.domain}/rest/agile/1.0`
    });
    return response.data;
  }

  // ==================== Version Operations ====================

  async getVersions(projectKey) {
    const response = await this.client.get(`/project/${projectKey}/versions`);
    return response.data;
  }

  async createVersion(projectKey, name, options = {}) {
    const payload = {
      name,
      project: projectKey,
      ...options
    };
    const response = await this.client.post('/version', payload);
    return response.data;
  }

  async updateVersion(versionId, payload) {
    const response = await this.client.put(`/version/${versionId}`, payload);
    return response.data;
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
    const response = await this.client.post('/issue/bulk', payload);
    return response.data;
  }

  // ==================== Health Check ====================

  async healthCheck() {
    try {
      await this.getCurrentUser();
      return { status: 'healthy', message: 'Connected to Jira successfully' };
    } catch (error) {
      return { status: 'unhealthy', message: error.message };
    }
  }
}

module.exports = { JiraClient };
