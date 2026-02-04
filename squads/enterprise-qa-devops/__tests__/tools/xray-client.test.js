/**
 * Xray Client Unit Tests
 * Enterprise QA DevOps Squad
 */

const axios = require('axios');
const fs = require('fs');
const { XrayClient } = require('../../tools/xray-client');
const mockResponses = require('../mocks/atlassian-responses.json');

// Mock axios and fs
jest.mock('axios');
jest.mock('fs');

describe('XrayClient', () => {
  let client;
  let mockAxiosInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn()
    };

    axios.create.mockReturnValue(mockAxiosInstance);
    axios.post.mockResolvedValue({ data: mockResponses.xray.authenticate });

    client = new XrayClient({
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      isCloud: true
    });
  });

  describe('constructor', () => {
    it('should create cloud client with provided options', () => {
      expect(client.clientId).toBe('test-client-id');
      expect(client.isCloud).toBe(true);
      expect(client.baseUrl).toBe('https://xray.cloud.getxray.app/api/v2');
    });

    it('should create server client when isCloud is false', () => {
      const serverClient = new XrayClient({
        isCloud: false,
        serverUrl: 'https://jira.company.com',
        serverUser: 'user',
        serverPassword: 'pass'
      });

      expect(serverClient.isCloud).toBe(false);
      expect(serverClient.baseUrl).toBe('https://jira.company.com/rest/raven/1.0');
    });

    it('should throw error when cloud credentials are missing', () => {
      const originalClientId = process.env.XRAY_CLIENT_ID;
      delete process.env.XRAY_CLIENT_ID;

      expect(() => new XrayClient({ clientId: '', clientSecret: '' })).toThrow(
        'Xray Cloud credentials not configured'
      );

      process.env.XRAY_CLIENT_ID = originalClientId;
    });
  });

  describe('Authentication', () => {
    describe('getToken', () => {
      it('should authenticate and return token for cloud', async () => {
        axios.post.mockResolvedValue({ data: mockResponses.xray.authenticate });

        const token = await client.getToken();

        expect(axios.post).toHaveBeenCalledWith(
          'https://xray.cloud.getxray.app/api/v2/authenticate',
          {
            client_id: 'test-client-id',
            client_secret: 'test-client-secret'
          }
        );
        expect(token).toBe(mockResponses.xray.authenticate);
      });

      it('should cache token and not re-authenticate', async () => {
        axios.post.mockResolvedValue({ data: mockResponses.xray.authenticate });

        await client.getToken();
        await client.getToken();

        expect(axios.post).toHaveBeenCalledTimes(1);
      });

      it('should use basic auth for server', async () => {
        const serverClient = new XrayClient({
          isCloud: false,
          serverUrl: 'https://jira.company.com',
          serverUser: 'user',
          serverPassword: 'pass'
        });

        const token = await serverClient.getToken();

        expect(token).toBe(Buffer.from('user:pass').toString('base64'));
        expect(axios.post).not.toHaveBeenCalled();
      });
    });
  });

  describe('Import Operations', () => {
    describe('importJunit', () => {
      it('should import JUnit XML file', async () => {
        const mockStream = { pipe: jest.fn() };
        fs.createReadStream.mockReturnValue(mockStream);
        axios.post.mockResolvedValueOnce({ data: mockResponses.xray.authenticate });
        axios.post.mockResolvedValueOnce({ data: mockResponses.xray.importJunit });

        const result = await client.importJunit('/path/to/junit.xml', {
          projectKey: 'PROJ'
        });

        expect(result.key).toBe('PROJ-EXEC-1');
      });

      it('should handle file buffer input', async () => {
        const fileBuffer = Buffer.from('<testsuites></testsuites>');
        axios.post.mockResolvedValueOnce({ data: mockResponses.xray.authenticate });
        axios.post.mockResolvedValueOnce({ data: mockResponses.xray.importJunit });

        const result = await client.importJunit(fileBuffer, { projectKey: 'PROJ' });

        expect(result.key).toBe('PROJ-EXEC-1');
      });
    });

    describe('importCucumber', () => {
      it('should import Cucumber JSON results', async () => {
        axios.post.mockResolvedValueOnce({ data: mockResponses.xray.authenticate });
        mockAxiosInstance.post.mockResolvedValue({ data: mockResponses.xray.importCucumber });

        const cucumberData = [{ name: 'Feature', elements: [] }];
        const result = await client.importCucumber(cucumberData, {
          projectKey: 'PROJ'
        });

        expect(result.testExecIssue.key).toBe('PROJ-EXEC-2');
      });
    });

    describe('importRobotFramework', () => {
      it('should import Robot Framework output', async () => {
        const mockStream = { pipe: jest.fn() };
        fs.createReadStream.mockReturnValue(mockStream);
        axios.post.mockResolvedValueOnce({ data: mockResponses.xray.authenticate });
        axios.post.mockResolvedValueOnce({ data: mockResponses.xray.importJunit });

        const result = await client.importRobotFramework('/path/to/output.xml', {
          projectKey: 'PROJ'
        });

        expect(result).toBeDefined();
      });
    });
  });

  describe('Export Operations', () => {
    describe('exportCucumberTests', () => {
      it('should export Cucumber feature files', async () => {
        axios.post.mockResolvedValueOnce({ data: mockResponses.xray.authenticate });
        mockAxiosInstance.get.mockResolvedValue({
          data: 'Feature: Test\n  Scenario: Example'
        });

        const result = await client.exportCucumberTests(['PROJ-TEST-1', 'PROJ-TEST-2']);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          '/export/cucumber?keys=PROJ-TEST-1;PROJ-TEST-2'
        );
      });

      it('should handle single test key', async () => {
        axios.post.mockResolvedValueOnce({ data: mockResponses.xray.authenticate });
        mockAxiosInstance.get.mockResolvedValue({ data: 'Feature: Test' });

        await client.exportCucumberTests('PROJ-TEST-1');

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/export/cucumber?keys=PROJ-TEST-1');
      });
    });
  });

  describe('Test Operations', () => {
    describe('setTestType', () => {
      it('should set test type for cloud', async () => {
        axios.post.mockResolvedValueOnce({ data: mockResponses.xray.authenticate });
        mockAxiosInstance.put.mockResolvedValue({ data: mockResponses.xray.test });

        await client.setTestType('PROJ-TEST-1', 'Cucumber');

        expect(mockAxiosInstance.put).toHaveBeenCalledWith('/test/PROJ-TEST-1', {
          testType: { name: 'Cucumber' }
        });
      });

      it('should use different endpoint for server', async () => {
        const serverClient = new XrayClient({
          isCloud: false,
          serverUrl: 'https://jira.company.com',
          serverUser: 'user',
          serverPassword: 'pass'
        });

        axios.create.mockReturnValue(mockAxiosInstance);
        mockAxiosInstance.put.mockResolvedValue({ data: {} });

        await serverClient.setTestType('PROJ-TEST-1', 'Manual');

        expect(mockAxiosInstance.put).toHaveBeenCalledWith('/api/test/PROJ-TEST-1', {
          type: 'Manual'
        });
      });
    });

    describe('setTestSteps', () => {
      it('should set test steps', async () => {
        axios.post.mockResolvedValueOnce({ data: mockResponses.xray.authenticate });
        mockAxiosInstance.put.mockResolvedValue({ data: {} });

        const steps = [
          { action: 'Step 1', data: 'Data', result: 'Expected' }
        ];

        await client.setTestSteps('PROJ-TEST-1', steps);

        expect(mockAxiosInstance.put).toHaveBeenCalledWith('/test/PROJ-TEST-1/steps', steps);
      });
    });

    describe('setGherkinDefinition', () => {
      it('should set Gherkin definition', async () => {
        axios.post.mockResolvedValueOnce({ data: mockResponses.xray.authenticate });
        mockAxiosInstance.put.mockResolvedValue({ data: {} });

        const gherkin = 'Scenario: Test\n  Given step';

        await client.setGherkinDefinition('PROJ-TEST-1', gherkin);

        expect(mockAxiosInstance.put).toHaveBeenCalledWith('/test/PROJ-TEST-1', { gherkin });
      });
    });
  });

  describe('Test Execution Operations', () => {
    describe('addTestsToExecution', () => {
      it('should add tests to execution', async () => {
        axios.post.mockResolvedValueOnce({ data: mockResponses.xray.authenticate });
        mockAxiosInstance.post.mockResolvedValue({ data: {} });

        await client.addTestsToExecution('PROJ-EXEC-1', ['PROJ-TEST-1', 'PROJ-TEST-2']);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/testexec/PROJ-EXEC-1/test', {
          add: ['PROJ-TEST-1', 'PROJ-TEST-2']
        });
      });
    });

    describe('removeTestsFromExecution', () => {
      it('should remove tests from execution', async () => {
        axios.post.mockResolvedValueOnce({ data: mockResponses.xray.authenticate });
        mockAxiosInstance.post.mockResolvedValue({ data: {} });

        await client.removeTestsFromExecution('PROJ-EXEC-1', ['PROJ-TEST-1']);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/testexec/PROJ-EXEC-1/test', {
          remove: ['PROJ-TEST-1']
        });
      });
    });

    describe('setExecutionEnvironments', () => {
      it('should set test environments', async () => {
        axios.post.mockResolvedValueOnce({ data: mockResponses.xray.authenticate });
        mockAxiosInstance.put.mockResolvedValue({ data: {} });

        await client.setExecutionEnvironments('PROJ-EXEC-1', ['Chrome', 'Firefox']);

        expect(mockAxiosInstance.put).toHaveBeenCalledWith('/testexec/PROJ-EXEC-1', {
          testEnvironments: ['Chrome', 'Firefox']
        });
      });
    });
  });

  describe('Test Set Operations', () => {
    describe('getTestsInSet', () => {
      it('should get tests in a test set', async () => {
        axios.post.mockResolvedValueOnce({ data: mockResponses.xray.authenticate });
        mockAxiosInstance.get.mockResolvedValue({ data: mockResponses.xray.testSet.tests });

        const result = await client.getTestsInSet('PROJ-TS-1');

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/testset/PROJ-TS-1/test');
        expect(result).toHaveLength(2);
      });
    });

    describe('addTestsToSet', () => {
      it('should add tests to a test set', async () => {
        axios.post.mockResolvedValueOnce({ data: mockResponses.xray.authenticate });
        mockAxiosInstance.post.mockResolvedValue({ data: {} });

        await client.addTestsToSet('PROJ-TS-1', ['PROJ-TEST-1']);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/testset/PROJ-TS-1/test', {
          add: ['PROJ-TEST-1']
        });
      });
    });
  });

  describe('Test Plan Operations', () => {
    describe('getTestPlanTests', () => {
      it('should get tests in a test plan', async () => {
        axios.post.mockResolvedValueOnce({ data: mockResponses.xray.authenticate });
        mockAxiosInstance.get.mockResolvedValue({ data: mockResponses.xray.testPlan.tests });

        const result = await client.getTestPlanTests('PROJ-TP-1');

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/testplan/PROJ-TP-1/test');
        expect(result).toHaveLength(3);
      });
    });
  });

  describe('Health Check', () => {
    describe('healthCheck', () => {
      it('should return healthy status when authenticated', async () => {
        axios.post.mockResolvedValue({ data: mockResponses.xray.authenticate });

        const result = await client.healthCheck();

        expect(result.status).toBe('healthy');
      });

      it('should return unhealthy status on error', async () => {
        axios.post.mockRejectedValue(new Error('Authentication failed'));

        const result = await client.healthCheck();

        expect(result.status).toBe('unhealthy');
        expect(result.message).toBe('Authentication failed');
      });
    });
  });
});
