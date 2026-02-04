/**
 * Xray Test Management API Client
 * Enterprise QA DevOps Squad
 *
 * Handles all interactions with Xray Cloud/Server API.
 * Extends ResilientClient for circuit breaker, retry, and rate limiting.
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { ResilientClient } = require('./resilient-client');

class XrayClient extends ResilientClient {
  constructor(options = {}) {
    // Initialize resilience patterns
    super({
      serviceName: 'Xray',
      timeout: options.timeout || 60000, // Longer timeout for file uploads
      circuitBreaker: {
        failureThreshold: options.failureThreshold || 5,
        resetTimeout: options.resetTimeout || 30000
      },
      rateLimiter: {
        maxTokens: options.maxTokens || 50,   // Xray: ~5000 req/hour = ~83/min
        refillRate: options.refillRate || 1.4  // ~1.4 tokens/sec
      },
      retry: {
        maxRetries: options.maxRetries || 3,
        baseDelay: options.baseDelay || 2000   // Longer base delay for Xray
      }
    });

    this.clientId = options.clientId || process.env.XRAY_CLIENT_ID;
    this.clientSecret = options.clientSecret || process.env.XRAY_CLIENT_SECRET;
    this.isCloud = options.isCloud !== false;

    // Server/DC configuration
    this.serverUrl = options.serverUrl || process.env.XRAY_API_BASE_URL;
    this.serverUser = options.serverUser || process.env.XRAY_API_USER;
    this.serverPassword = options.serverPassword || process.env.XRAY_API_PASSWORD;

    if (this.isCloud && (!this.clientId || !this.clientSecret)) {
      throw new Error('Xray Cloud credentials not configured. Set XRAY_CLIENT_ID and XRAY_CLIENT_SECRET');
    }

    this.baseUrl = this.isCloud
      ? 'https://xray.cloud.getxray.app/api/v2'
      : `${this.serverUrl}/rest/raven/1.0`;

    this.token = null;
    this.tokenExpiry = null;
  }

  async getToken() {
    if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    if (!this.isCloud) {
      // Server/DC uses basic auth
      this.token = Buffer.from(`${this.serverUser}:${this.serverPassword}`).toString('base64');
      return this.token;
    }

    // Cloud: Get OAuth token with resilience
    return this.executeWithResilience(
      async () => {
        const response = await axios.post('https://xray.cloud.getxray.app/api/v2/authenticate', {
          client_id: this.clientId,
          client_secret: this.clientSecret
        });

        this.token = response.data;
        this.tokenExpiry = Date.now() + (3600 * 1000); // 1 hour
        return this.token;
      },
      { operation: 'authenticate' }
    );
  }

  async getClient() {
    const token = await this.getToken();

    return axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': this.isCloud ? `Bearer ${token}` : `Basic ${token}`,
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

  // ==================== Import Operations ====================

  async importJunit(file, params = {}) {
    return this.executeWithResilience(
      async () => {
        const token = await this.getToken();
        const formData = new FormData();

        if (typeof file === 'string') {
          formData.append('file', fs.createReadStream(file));
        } else {
          formData.append('file', file);
        }

        const queryString = new URLSearchParams(params).toString();
        const url = `${this.baseUrl}/import/execution/junit?${queryString}`;

        const response = await axios.post(url, formData, {
          headers: {
            ...formData.getHeaders(),
            'Authorization': this.isCloud ? `Bearer ${token}` : `Basic ${token}`
          }
        });

        return response.data;
      },
      { operation: 'importJunit' }
    );
  }

  async importCucumber(data, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this._request('post', `/import/execution/cucumber?${queryString}`, data);
  }

  async importRobotFramework(file, params = {}) {
    return this.executeWithResilience(
      async () => {
        const token = await this.getToken();
        const formData = new FormData();
        formData.append('file', fs.createReadStream(file));

        const queryString = new URLSearchParams(params).toString();
        const response = await axios.post(
          `${this.baseUrl}/import/execution/robot?${queryString}`,
          formData,
          {
            headers: {
              ...formData.getHeaders(),
              'Authorization': this.isCloud ? `Bearer ${token}` : `Basic ${token}`
            }
          }
        );

        return response.data;
      },
      { operation: 'importRobotFramework' }
    );
  }

  // ==================== Export Operations ====================

  async exportCucumberTests(testKeys) {
    const keys = Array.isArray(testKeys) ? testKeys.join(';') : testKeys;
    return this._request('get', `/export/cucumber?keys=${keys}`);
  }

  // ==================== Test Operations ====================

  async setTestType(testKey, testType) {
    if (this.isCloud) {
      return this._request('put', `/test/${testKey}`, {
        testType: { name: testType }
      });
    } else {
      return this._request('put', `/api/test/${testKey}`, {
        type: testType
      });
    }
  }

  async setTestSteps(testKey, steps) {
    return this._request('put', `/test/${testKey}/steps`, steps);
  }

  async setGherkinDefinition(testKey, gherkin) {
    return this._request('put', `/test/${testKey}`, { gherkin });
  }

  async getTestsCovering(requirementKey) {
    if (this.isCloud) {
      return this._request('get', '/graphql', null, {
        data: {
          query: `
            query {
              getTests(jql: "requirement = ${requirementKey}") {
                results {
                  issueId
                  testType { name }
                }
              }
            }
          `
        }
      });
    } else {
      return this._request('get', `/api/test?requirement=${requirementKey}`);
    }
  }

  // ==================== Test Execution Operations ====================

  async addTestsToExecution(executionKey, testKeys) {
    return this._request('post', `/testexec/${executionKey}/test`, {
      add: testKeys
    });
  }

  async removeTestsFromExecution(executionKey, testKeys) {
    return this._request('post', `/testexec/${executionKey}/test`, {
      remove: testKeys
    });
  }

  async setExecutionEnvironments(executionKey, environments) {
    return this._request('put', `/testexec/${executionKey}`, {
      testEnvironments: environments
    });
  }

  async setExecutionDates(executionKey, dates) {
    return this._request('put', `/testexec/${executionKey}`, dates);
  }

  // ==================== Test Set Operations ====================

  async getTestsInSet(testSetKey) {
    return this._request('get', `/testset/${testSetKey}/test`);
  }

  async addTestsToSet(testSetKey, testKeys) {
    return this._request('post', `/testset/${testSetKey}/test`, {
      add: testKeys
    });
  }

  // ==================== Test Plan Operations ====================

  async getTestPlanTests(testPlanKey) {
    return this._request('get', `/testplan/${testPlanKey}/test`);
  }

  async getTestPlanCoverage(testPlanKey) {
    const tests = await this.getTestPlanTests(testPlanKey);
    const requirements = new Map();

    for (const test of tests) {
      const links = await this.getTestsCovering(test.key);
      for (const req of links.requirements || []) {
        if (!requirements.has(req.key)) {
          requirements.set(req.key, {
            key: req.key,
            summary: req.summary,
            tests: [],
            isCovered: true
          });
        }
        requirements.get(req.key).tests.push(test);
      }
    }

    return {
      tests,
      requirements: Array.from(requirements.values())
    };
  }

  // ==================== Test Repository ====================

  async moveToFolder(testKey, folderPath) {
    return this._request('put', `/test/${testKey}`, {
      folder: folderPath
    });
  }

  // ==================== Health Check ====================

  async healthCheck() {
    const baseHealth = await super.healthCheck();

    try {
      await this.getToken();
      return {
        ...baseHealth,
        status: baseHealth.status === 'degraded' ? 'degraded' : 'healthy',
        service: 'Xray',
        message: 'Connected to Xray successfully',
        mode: this.isCloud ? 'Cloud' : 'Server/DC'
      };
    } catch (error) {
      return {
        ...baseHealth,
        status: 'unhealthy',
        service: 'Xray',
        message: error.message,
        mode: this.isCloud ? 'Cloud' : 'Server/DC'
      };
    }
  }
}

module.exports = { XrayClient };
