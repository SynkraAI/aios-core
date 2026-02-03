/**
 * Xray Test Management API Client
 * Enterprise QA DevOps Squad
 *
 * Handles all interactions with Xray Cloud/Server API.
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

class XrayClient {
  constructor(options = {}) {
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

    // Cloud: Get OAuth token
    const response = await axios.post('https://xray.cloud.getxray.app/api/v2/authenticate', {
      client_id: this.clientId,
      client_secret: this.clientSecret
    });

    this.token = response.data;
    this.tokenExpiry = Date.now() + (3600 * 1000); // 1 hour
    return this.token;
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

  // ==================== Import Operations ====================

  async importJunit(file, params = {}) {
    const token = await this.getToken();
    const formData = new FormData();

    if (typeof file === 'string') {
      formData.append('file', fs.createReadStream(file));
    } else {
      formData.append('file', file);
    }

    const queryString = new URLSearchParams(params).toString();
    const url = this.isCloud
      ? `${this.baseUrl}/import/execution/junit?${queryString}`
      : `${this.baseUrl}/import/execution/junit?${queryString}`;

    const response = await axios.post(url, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': this.isCloud ? `Bearer ${token}` : `Basic ${token}`
      }
    });

    return response.data;
  }

  async importCucumber(data, params = {}) {
    const client = await this.getClient();
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/import/execution/cucumber?${queryString}`;

    const response = await client.post(endpoint, data);
    return response.data;
  }

  async importRobotFramework(file, params = {}) {
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
  }

  // ==================== Export Operations ====================

  async exportCucumberTests(testKeys) {
    const client = await this.getClient();
    const keys = Array.isArray(testKeys) ? testKeys.join(';') : testKeys;

    const response = await client.get(`/export/cucumber?keys=${keys}`);
    return response.data;
  }

  // ==================== Test Operations ====================

  async setTestType(testKey, testType) {
    const client = await this.getClient();

    if (this.isCloud) {
      const response = await client.put(`/test/${testKey}`, {
        testType: { name: testType }
      });
      return response.data;
    } else {
      // Server API is different
      const response = await client.put(`/api/test/${testKey}`, {
        type: testType
      });
      return response.data;
    }
  }

  async setTestSteps(testKey, steps) {
    const client = await this.getClient();
    const response = await client.put(`/test/${testKey}/steps`, steps);
    return response.data;
  }

  async setGherkinDefinition(testKey, gherkin) {
    const client = await this.getClient();
    const response = await client.put(`/test/${testKey}`, {
      gherkin
    });
    return response.data;
  }

  async getTestsCovering(requirementKey) {
    const client = await this.getClient();

    if (this.isCloud) {
      const response = await client.get(`/graphql`, {
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
      return response.data.data.getTests;
    } else {
      const response = await client.get(`/api/test?requirement=${requirementKey}`);
      return response.data;
    }
  }

  // ==================== Test Execution Operations ====================

  async addTestsToExecution(executionKey, testKeys) {
    const client = await this.getClient();
    const response = await client.post(`/testexec/${executionKey}/test`, {
      add: testKeys
    });
    return response.data;
  }

  async removeTestsFromExecution(executionKey, testKeys) {
    const client = await this.getClient();
    const response = await client.post(`/testexec/${executionKey}/test`, {
      remove: testKeys
    });
    return response.data;
  }

  async setExecutionEnvironments(executionKey, environments) {
    const client = await this.getClient();
    const response = await client.put(`/testexec/${executionKey}`, {
      testEnvironments: environments
    });
    return response.data;
  }

  async setExecutionDates(executionKey, dates) {
    const client = await this.getClient();
    const response = await client.put(`/testexec/${executionKey}`, dates);
    return response.data;
  }

  // ==================== Test Set Operations ====================

  async getTestsInSet(testSetKey) {
    const client = await this.getClient();
    const response = await client.get(`/testset/${testSetKey}/test`);
    return response.data;
  }

  async addTestsToSet(testSetKey, testKeys) {
    const client = await this.getClient();
    const response = await client.post(`/testset/${testSetKey}/test`, {
      add: testKeys
    });
    return response.data;
  }

  // ==================== Test Plan Operations ====================

  async getTestPlanTests(testPlanKey) {
    const client = await this.getClient();
    const response = await client.get(`/testplan/${testPlanKey}/test`);
    return response.data;
  }

  async getTestPlanCoverage(testPlanKey) {
    const client = await this.getClient();

    // Get tests in plan
    const tests = await this.getTestPlanTests(testPlanKey);

    // Get requirements linked to tests
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
    const client = await this.getClient();
    const response = await client.put(`/test/${testKey}`, {
      folder: folderPath
    });
    return response.data;
  }

  // ==================== Health Check ====================

  async healthCheck() {
    try {
      await this.getToken();
      return { status: 'healthy', message: 'Connected to Xray successfully' };
    } catch (error) {
      return { status: 'unhealthy', message: error.message };
    }
  }
}

module.exports = { XrayClient };
