/**
 * API Contracts and Abstraction Layer
 * Enterprise QA DevOps Squad
 *
 * Defines stable interfaces that abstract away API version differences.
 * Protects against breaking changes when APIs evolve.
 */

/**
 * API Version Registry
 * Tracks current API versions and compatibility
 */
const API_VERSIONS = {
  jira: {
    current: '3',
    supported: ['2', '3'],
    deprecated: ['1'],
    migrationGuide: 'https://developer.atlassian.com/cloud/jira/platform/rest/v3/'
  },
  confluence: {
    current: 'v2',
    supported: ['v1', 'v2'],
    deprecated: [],
    migrationGuide: 'https://developer.atlassian.com/cloud/confluence/rest/v2/'
  },
  xray: {
    current: 'v2',
    supported: ['v1', 'v2'],
    deprecated: [],
    migrationGuide: 'https://docs.getxray.app/display/XRAYCLOUD/REST+API'
  },
  graph: {
    current: 'v1.0',
    supported: ['v1.0', 'beta'],
    deprecated: [],
    migrationGuide: 'https://docs.microsoft.com/en-us/graph/api/overview'
  }
};

/**
 * Base API Contract
 * All API contracts should extend this
 */
class APIContract {
  constructor(client) {
    this.client = client;
    this.apiName = 'unknown';
    this.version = 'unknown';
  }

  /**
   * Get API version info
   */
  getVersionInfo() {
    return API_VERSIONS[this.apiName] || { current: this.version };
  }

  /**
   * Check if current version is deprecated
   */
  isDeprecated() {
    const info = this.getVersionInfo();
    return info.deprecated?.includes(this.version) || false;
  }

  /**
   * Log deprecation warning if applicable
   */
  checkDeprecation() {
    if (this.isDeprecated()) {
      console.warn(
        `[DEPRECATION WARNING] ${this.apiName} API version ${this.version} is deprecated. ` +
        `Please upgrade. See: ${this.getVersionInfo().migrationGuide}`
      );
    }
  }
}

/**
 * Issue Contract
 * Stable interface for issue operations across Jira API versions
 */
class IssueContract extends APIContract {
  constructor(client) {
    super(client);
    this.apiName = 'jira';
  }

  /**
   * Create an issue
   * @param {Object} params - Issue parameters
   * @param {string} params.project - Project key
   * @param {string} params.summary - Issue summary
   * @param {string} params.type - Issue type (Task, Bug, Story, etc.)
   * @param {string} [params.description] - Issue description
   * @param {string} [params.assignee] - Assignee account ID
   * @param {Object} [params.customFields] - Custom field values
   * @returns {Promise<Issue>} Created issue
   */
  async create(params) {
    this.checkDeprecation();

    const payload = this._buildCreatePayload(params);
    const response = await this.client.createIssue(payload);

    return this._normalizeIssue(response);
  }

  /**
   * Get an issue by key
   * @param {string} key - Issue key (e.g., PROJ-123)
   * @param {string[]} [expand] - Fields to expand
   * @returns {Promise<Issue>} Issue data
   */
  async get(key, expand = []) {
    this.checkDeprecation();

    const response = await this.client.getIssue(key, expand);
    return this._normalizeIssue(response);
  }

  /**
   * Update an issue
   * @param {string} key - Issue key
   * @param {Object} updates - Fields to update
   * @returns {Promise<void>}
   */
  async update(key, updates) {
    this.checkDeprecation();

    const payload = this._buildUpdatePayload(updates);
    await this.client.updateIssue(key, payload);
  }

  /**
   * Transition an issue to a new status
   * @param {string} key - Issue key
   * @param {string} status - Target status name
   * @param {string} [comment] - Transition comment
   * @returns {Promise<void>}
   */
  async transition(key, status, comment = null) {
    this.checkDeprecation();

    await this.client.transitionTo(key, status, comment);
  }

  /**
   * Search issues
   * @param {Object} params - Search parameters
   * @param {string} params.jql - JQL query
   * @param {number} [params.maxResults] - Maximum results
   * @param {number} [params.startAt] - Start index
   * @returns {Promise<SearchResult>}
   */
  async search(params) {
    this.checkDeprecation();

    const response = await this.client.search(params);

    return {
      total: response.total,
      issues: response.issues.map(issue => this._normalizeIssue(issue)),
      pagination: {
        startAt: response.startAt,
        maxResults: response.maxResults,
        hasMore: response.startAt + response.issues.length < response.total
      }
    };
  }

  /**
   * Build create payload (handles version differences)
   */
  _buildCreatePayload(params) {
    return {
      fields: {
        project: { key: params.project },
        summary: params.summary,
        issuetype: { name: params.type },
        ...(params.description && {
          description: this._formatDescription(params.description)
        }),
        ...(params.assignee && { assignee: { accountId: params.assignee } }),
        ...params.customFields
      }
    };
  }

  /**
   * Build update payload
   */
  _buildUpdatePayload(updates) {
    const fields = {};

    if (updates.summary) fields.summary = updates.summary;
    if (updates.description) {
      fields.description = this._formatDescription(updates.description);
    }
    if (updates.assignee) fields.assignee = { accountId: updates.assignee };
    if (updates.priority) fields.priority = { name: updates.priority };

    return { fields, ...updates.customFields };
  }

  /**
   * Format description for ADF (Atlassian Document Format)
   */
  _formatDescription(text) {
    return {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text }]
        }
      ]
    };
  }

  /**
   * Normalize issue response to stable format
   */
  _normalizeIssue(response) {
    return {
      id: response.id,
      key: response.key,
      summary: response.fields?.summary,
      description: this._extractPlainText(response.fields?.description),
      status: response.fields?.status?.name,
      statusCategory: response.fields?.status?.statusCategory?.name,
      type: response.fields?.issuetype?.name,
      priority: response.fields?.priority?.name,
      assignee: response.fields?.assignee ? {
        id: response.fields.assignee.accountId,
        name: response.fields.assignee.displayName,
        email: response.fields.assignee.emailAddress
      } : null,
      reporter: response.fields?.reporter ? {
        id: response.fields.reporter.accountId,
        name: response.fields.reporter.displayName
      } : null,
      project: {
        key: response.fields?.project?.key,
        name: response.fields?.project?.name
      },
      created: response.fields?.created,
      updated: response.fields?.updated,
      _raw: response
    };
  }

  /**
   * Extract plain text from ADF
   */
  _extractPlainText(adf) {
    if (!adf) return null;
    if (typeof adf === 'string') return adf;

    // Extract text from ADF structure
    const extractText = (node) => {
      if (node.type === 'text') return node.text;
      if (node.content) return node.content.map(extractText).join('');
      return '';
    };

    return extractText(adf);
  }
}

/**
 * Test Management Contract
 * Stable interface for Xray test operations
 */
class TestManagementContract extends APIContract {
  constructor(client) {
    super(client);
    this.apiName = 'xray';
  }

  /**
   * Import test results
   * @param {Object} params - Import parameters
   * @param {string} params.format - Result format (junit, cucumber, robot)
   * @param {string|Buffer} params.data - Result data or file path
   * @param {string} params.projectKey - Target project
   * @param {string} [params.testPlanKey] - Test plan to associate
   * @returns {Promise<ImportResult>}
   */
  async importResults(params) {
    this.checkDeprecation();

    let response;

    switch (params.format.toLowerCase()) {
      case 'junit':
        response = await this.client.importJunit(params.data, {
          projectKey: params.projectKey,
          testPlanKey: params.testPlanKey
        });
        break;

      case 'cucumber':
        response = await this.client.importCucumber(params.data, {
          projectKey: params.projectKey,
          testPlanKey: params.testPlanKey
        });
        break;

      case 'robot':
        response = await this.client.importRobotFramework(params.data, {
          projectKey: params.projectKey,
          testPlanKey: params.testPlanKey
        });
        break;

      default:
        throw new Error(`Unsupported format: ${params.format}`);
    }

    return this._normalizeImportResult(response);
  }

  /**
   * Get test coverage for a requirement
   * @param {string} requirementKey - Requirement issue key
   * @returns {Promise<Coverage>}
   */
  async getCoverage(requirementKey) {
    this.checkDeprecation();

    const tests = await this.client.getTestsCovering(requirementKey);

    return {
      requirement: requirementKey,
      tests: tests.results?.map(t => ({
        key: t.issueId,
        type: t.testType?.name
      })) || [],
      count: tests.results?.length || 0
    };
  }

  /**
   * Get tests in a test plan
   * @param {string} testPlanKey - Test plan key
   * @returns {Promise<Test[]>}
   */
  async getTestPlanTests(testPlanKey) {
    this.checkDeprecation();

    const tests = await this.client.getTestPlanTests(testPlanKey);

    return tests.map(t => ({
      key: t.key,
      status: t.status,
      latestResult: t.latestResult
    }));
  }

  /**
   * Normalize import result
   */
  _normalizeImportResult(response) {
    return {
      executionKey: response.key || response.testExecIssue?.key,
      executionId: response.id || response.testExecIssue?.id,
      testsImported: response.testIssues?.success?.length || 0,
      testsFailed: response.testIssues?.failed?.length || 0,
      _raw: response
    };
  }
}

/**
 * Documentation Contract
 * Stable interface for Confluence operations
 */
class DocumentationContract extends APIContract {
  constructor(client) {
    super(client);
    this.apiName = 'confluence';
  }

  /**
   * Create a page
   * @param {Object} params - Page parameters
   * @param {string} params.space - Space key
   * @param {string} params.title - Page title
   * @param {string} params.content - Page content (HTML or Storage format)
   * @param {string} [params.parentId] - Parent page ID
   * @param {string[]} [params.labels] - Labels to add
   * @returns {Promise<Page>}
   */
  async createPage(params) {
    this.checkDeprecation();

    const page = await this.client.createPage(
      params.space,
      params.title,
      params.content,
      {
        parentId: params.parentId,
        labels: params.labels
      }
    );

    return this._normalizePage(page);
  }

  /**
   * Update a page
   * @param {string} pageId - Page ID
   * @param {Object} updates - Updates to apply
   * @param {string} [updates.title] - New title
   * @param {string} [updates.content] - New content
   * @param {string} [updates.message] - Version message
   * @returns {Promise<Page>}
   */
  async updatePage(pageId, updates) {
    this.checkDeprecation();

    const page = await this.client.updatePage(
      pageId,
      updates.title,
      updates.content,
      updates.message
    );

    return this._normalizePage(page);
  }

  /**
   * Get a page by ID
   * @param {string} pageId - Page ID
   * @returns {Promise<Page>}
   */
  async getPage(pageId) {
    this.checkDeprecation();

    const page = await this.client.getContentById(pageId, ['body.storage', 'version', 'space']);
    return this._normalizePage(page);
  }

  /**
   * Find a page by title
   * @param {string} space - Space key
   * @param {string} title - Page title
   * @returns {Promise<Page>}
   */
  async findPage(space, title) {
    this.checkDeprecation();

    const page = await this.client.findPage(space, title);
    return this._normalizePage(page);
  }

  /**
   * Search pages
   * @param {Object} params - Search parameters
   * @param {string} params.query - CQL query or text search
   * @param {string} [params.space] - Limit to space
   * @param {number} [params.limit] - Max results
   * @returns {Promise<SearchResult>}
   */
  async search(params) {
    this.checkDeprecation();

    let cql = params.query;
    if (params.space && !cql.includes('space')) {
      cql = `space = "${params.space}" AND ${cql}`;
    }

    const results = await this.client.searchContent(cql, { limit: params.limit });

    return {
      results: results.results.map(p => this._normalizePage(p)),
      total: results.size,
      hasMore: results.size === (params.limit || 25)
    };
  }

  /**
   * Normalize page response
   */
  _normalizePage(response) {
    return {
      id: response.id,
      title: response.title,
      space: response.space?.key,
      version: response.version?.number,
      content: response.body?.storage?.value,
      url: response._links?.webui,
      created: response.history?.createdDate,
      updated: response.version?.when,
      _raw: response
    };
  }
}

/**
 * Communication Contract
 * Stable interface for Microsoft Graph operations
 */
class CommunicationContract extends APIContract {
  constructor(client) {
    super(client);
    this.apiName = 'graph';
  }

  /**
   * Send an email
   * @param {Object} params - Email parameters
   * @param {string|string[]} params.to - Recipients
   * @param {string} params.subject - Email subject
   * @param {string} params.body - Email body
   * @param {string} [params.bodyType] - Body type (text/html)
   * @param {string[]} [params.cc] - CC recipients
   * @returns {Promise<void>}
   */
  async sendEmail(params) {
    this.checkDeprecation();

    const toRecipients = (Array.isArray(params.to) ? params.to : [params.to])
      .map(email => ({ emailAddress: { address: email } }));

    const ccRecipients = params.cc?.map(email => ({ emailAddress: { address: email } }));

    await this.client.sendMail({
      message: {
        subject: params.subject,
        body: {
          contentType: params.bodyType || 'text',
          content: params.body
        },
        toRecipients,
        ...(ccRecipients && { ccRecipients })
      }
    });
  }

  /**
   * Post a Teams message
   * @param {Object} params - Message parameters
   * @param {string} params.teamId - Team ID
   * @param {string} params.channelId - Channel ID
   * @param {string} params.content - Message content
   * @param {string} [params.contentType] - Content type (text/html)
   * @returns {Promise<Message>}
   */
  async postTeamsMessage(params) {
    this.checkDeprecation();

    const message = await this.client.postChannelMessage(
      params.teamId,
      params.channelId,
      {
        body: {
          contentType: params.contentType || 'html',
          content: params.content
        }
      }
    );

    return {
      id: message.id,
      content: message.body?.content,
      createdAt: message.createdDateTime,
      _raw: message
    };
  }

  /**
   * Create a calendar event
   * @param {Object} params - Event parameters
   * @param {string} params.subject - Event subject
   * @param {Date|string} params.start - Start time
   * @param {Date|string} params.end - End time
   * @param {string[]} [params.attendees] - Attendee emails
   * @param {string} [params.body] - Event body
   * @returns {Promise<Event>}
   */
  async createEvent(params) {
    this.checkDeprecation();

    const attendees = params.attendees?.map(email => ({
      emailAddress: { address: email },
      type: 'required'
    }));

    const event = await this.client.createEvent({
      subject: params.subject,
      start: {
        dateTime: new Date(params.start).toISOString(),
        timeZone: 'UTC'
      },
      end: {
        dateTime: new Date(params.end).toISOString(),
        timeZone: 'UTC'
      },
      ...(params.body && {
        body: { contentType: 'html', content: params.body }
      }),
      ...(attendees && { attendees })
    });

    return {
      id: event.id,
      subject: event.subject,
      start: event.start?.dateTime,
      end: event.end?.dateTime,
      webLink: event.webLink,
      _raw: event
    };
  }
}

/**
 * Contract Factory
 * Creates the appropriate contract for a given client
 */
class ContractFactory {
  static createIssueContract(jiraClient) {
    return new IssueContract(jiraClient);
  }

  static createTestManagementContract(xrayClient) {
    return new TestManagementContract(xrayClient);
  }

  static createDocumentationContract(confluenceClient) {
    return new DocumentationContract(confluenceClient);
  }

  static createCommunicationContract(graphClient) {
    return new CommunicationContract(graphClient);
  }
}

/**
 * Version Compatibility Checker
 */
class VersionChecker {
  static checkAll() {
    const results = {};

    for (const [api, info] of Object.entries(API_VERSIONS)) {
      results[api] = {
        current: info.current,
        isSupported: info.supported.includes(info.current),
        hasDeprecated: info.deprecated.length > 0,
        migrationGuide: info.migrationGuide
      };
    }

    return results;
  }

  static getDeprecationWarnings() {
    const warnings = [];

    for (const [api, info] of Object.entries(API_VERSIONS)) {
      if (info.deprecated.length > 0) {
        warnings.push({
          api,
          deprecatedVersions: info.deprecated,
          currentVersion: info.current,
          migrationGuide: info.migrationGuide
        });
      }
    }

    return warnings;
  }
}

module.exports = {
  API_VERSIONS,
  APIContract,
  IssueContract,
  TestManagementContract,
  DocumentationContract,
  CommunicationContract,
  ContractFactory,
  VersionChecker
};
