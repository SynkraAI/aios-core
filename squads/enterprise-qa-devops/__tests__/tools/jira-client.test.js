/**
 * Jira Client Unit Tests
 * Enterprise QA DevOps Squad
 */

const axios = require('axios');
const { JiraClient } = require('../../tools/jira-client');
const mockResponses = require('../mocks/atlassian-responses.json');

// Mock axios
jest.mock('axios');

describe('JiraClient', () => {
  let client;
  let mockAxiosInstance;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock axios instance
    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        response: {
          use: jest.fn()
        }
      }
    };

    axios.create.mockReturnValue(mockAxiosInstance);

    // Create client
    client = new JiraClient({
      domain: 'test.atlassian.net',
      email: 'test@example.com',
      apiToken: 'test-token'
    });
  });

  describe('constructor', () => {
    it('should create client with provided options', () => {
      expect(client.domain).toBe('test.atlassian.net');
      expect(client.email).toBe('test@example.com');
      expect(client.baseUrl).toBe('https://test.atlassian.net/rest/api/3');
    });

    it('should throw error when credentials are missing', () => {
      // Clear env vars temporarily
      const originalDomain = process.env.ATLASSIAN_DOMAIN;
      delete process.env.ATLASSIAN_DOMAIN;

      expect(() => new JiraClient({ email: '', apiToken: '', domain: '' })).toThrow(
        'Jira credentials not configured'
      );

      process.env.ATLASSIAN_DOMAIN = originalDomain;
    });

    it('should use environment variables as fallback', () => {
      const envClient = new JiraClient();
      expect(envClient.domain).toBe('test.atlassian.net');
    });
  });

  describe('Issue Operations', () => {
    describe('createIssue', () => {
      it('should create an issue', async () => {
        mockAxiosInstance.post.mockResolvedValue({ data: mockResponses.jira.issue });

        const payload = {
          fields: {
            project: { key: 'PROJ' },
            summary: 'Test Issue',
            issuetype: { name: 'Task' }
          }
        };

        const result = await client.createIssue(payload);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/issue', payload);
        expect(result.key).toBe('PROJ-123');
      });
    });

    describe('getIssue', () => {
      it('should get an issue by key', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: mockResponses.jira.issue });

        const result = await client.getIssue('PROJ-123');

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/issue/PROJ-123', { params: {} });
        expect(result.fields.summary).toBe('Test Issue Summary');
      });

      it('should expand specified fields', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: mockResponses.jira.issue });

        await client.getIssue('PROJ-123', ['changelog', 'transitions']);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/issue/PROJ-123', {
          params: { expand: 'changelog,transitions' }
        });
      });
    });

    describe('updateIssue', () => {
      it('should update an issue', async () => {
        mockAxiosInstance.put.mockResolvedValue({ data: {} });

        const payload = {
          fields: { summary: 'Updated Summary' }
        };

        await client.updateIssue('PROJ-123', payload);

        expect(mockAxiosInstance.put).toHaveBeenCalledWith('/issue/PROJ-123', payload);
      });
    });

    describe('deleteIssue', () => {
      it('should delete an issue', async () => {
        mockAxiosInstance.delete.mockResolvedValue({ data: {} });

        await client.deleteIssue('PROJ-123');

        expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/issue/PROJ-123', { params: {} });
      });

      it('should delete subtasks when specified', async () => {
        mockAxiosInstance.delete.mockResolvedValue({ data: {} });

        await client.deleteIssue('PROJ-123', true);

        expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/issue/PROJ-123', {
          params: { deleteSubtasks: 'true' }
        });
      });
    });
  });

  describe('Search Operations', () => {
    describe('search', () => {
      it('should search issues with JQL', async () => {
        mockAxiosInstance.post.mockResolvedValue({ data: mockResponses.jira.search });

        const result = await client.search({ jql: 'project = PROJ' });

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/search', {
          jql: 'project = PROJ',
          maxResults: 50,
          startAt: 0,
          fields: ['summary', 'status', 'assignee', 'priority', 'issuetype']
        });
        expect(result.issues).toHaveLength(2);
      });

      it('should use custom pagination', async () => {
        mockAxiosInstance.post.mockResolvedValue({ data: mockResponses.jira.search });

        await client.search({
          jql: 'project = PROJ',
          maxResults: 10,
          startAt: 20
        });

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/search', expect.objectContaining({
          maxResults: 10,
          startAt: 20
        }));
      });
    });

    describe('searchWithJql', () => {
      it('should be a convenience wrapper for search', async () => {
        mockAxiosInstance.post.mockResolvedValue({ data: mockResponses.jira.search });

        const result = await client.searchWithJql('project = PROJ', { maxResults: 5 });

        expect(result.total).toBe(2);
      });
    });
  });

  describe('Transitions', () => {
    describe('getTransitions', () => {
      it('should get available transitions', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: mockResponses.jira.transitions });

        const result = await client.getTransitions('PROJ-123');

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/issue/PROJ-123/transitions');
        expect(result.transitions).toHaveLength(3);
      });
    });

    describe('transitionTo', () => {
      it('should transition issue to specified status', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: mockResponses.jira.transitions });
        mockAxiosInstance.post.mockResolvedValue({ data: {} });

        await client.transitionTo('PROJ-123', 'Done');

        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/issue/PROJ-123/transitions',
          { transition: { id: '31' } }
        );
      });

      it('should include comment when provided', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: mockResponses.jira.transitions });
        mockAxiosInstance.post.mockResolvedValue({ data: {} });

        await client.transitionTo('PROJ-123', 'Done', 'Closing this issue');

        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/issue/PROJ-123/transitions',
          expect.objectContaining({
            transition: { id: '31' },
            update: expect.objectContaining({
              comment: expect.any(Array)
            })
          })
        );
      });

      it('should throw error when transition not available', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: mockResponses.jira.transitions });

        await expect(client.transitionTo('PROJ-123', 'Invalid Status')).rejects.toThrow(
          'Cannot transition to "Invalid Status"'
        );
      });
    });
  });

  describe('Comments', () => {
    describe('addComment', () => {
      it('should add a comment to an issue', async () => {
        mockAxiosInstance.post.mockResolvedValue({ data: mockResponses.jira.comment });

        const result = await client.addComment('PROJ-123', 'Test comment');

        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/issue/PROJ-123/comment',
          expect.objectContaining({
            body: expect.objectContaining({
              type: 'doc',
              version: 1
            })
          })
        );
        expect(result.id).toBe('10001');
      });
    });

    describe('getComments', () => {
      it('should get comments for an issue', async () => {
        mockAxiosInstance.get.mockResolvedValue({
          data: { comments: [mockResponses.jira.comment] }
        });

        const result = await client.getComments('PROJ-123');

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/issue/PROJ-123/comment');
        expect(result.comments).toHaveLength(1);
      });
    });
  });

  describe('User Operations', () => {
    describe('searchUsers', () => {
      it('should search users by query', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: [mockResponses.jira.user] });

        const result = await client.searchUsers('test');

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/user/search', {
          params: { query: 'test' }
        });
        expect(result).toHaveLength(1);
      });
    });

    describe('getAccountId', () => {
      it('should get account ID by email', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: [mockResponses.jira.user] });

        const result = await client.getAccountId('test@example.com');

        expect(result).toBe('user-123');
      });

      it('should throw error when user not found', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: [] });

        await expect(client.getAccountId('notfound@example.com')).rejects.toThrow(
          'User not found'
        );
      });
    });
  });

  describe('Bulk Operations', () => {
    describe('bulkCreateIssues', () => {
      it('should create multiple issues', async () => {
        mockAxiosInstance.post.mockResolvedValue({
          data: {
            issues: [mockResponses.jira.issue],
            errors: []
          }
        });

        const issues = [
          { project: { key: 'PROJ' }, summary: 'Issue 1', issuetype: { name: 'Task' } },
          { project: { key: 'PROJ' }, summary: 'Issue 2', issuetype: { name: 'Task' } }
        ];

        const result = await client.bulkCreateIssues(issues);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/issue/bulk', {
          issueUpdates: issues.map(issue => ({ fields: issue }))
        });
        expect(result.issues).toBeDefined();
      });
    });
  });

  describe('Health Check', () => {
    describe('healthCheck', () => {
      it('should return healthy status when connected', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: mockResponses.jira.user });

        const result = await client.healthCheck();

        expect(result.status).toBe('healthy');
      });

      it('should return unhealthy status on error', async () => {
        mockAxiosInstance.get.mockRejectedValue(new Error('Connection failed'));

        const result = await client.healthCheck();

        expect(result.status).toBe('unhealthy');
        expect(result.message).toBe('Connection failed');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle 401 authentication errors', () => {
      const error = {
        response: {
          status: 401,
          data: { message: 'Invalid credentials' }
        }
      };

      expect(() => client.handleError(error)).toThrow('Authentication failed');
    });

    it('should handle 403 permission errors', () => {
      const error = {
        response: {
          status: 403,
          data: { message: 'Access denied' }
        }
      };

      expect(() => client.handleError(error)).toThrow('Permission denied');
    });

    it('should handle 404 not found errors', () => {
      const error = {
        response: {
          status: 404,
          data: { errorMessages: ['Issue not found'] }
        }
      };

      expect(() => client.handleError(error)).toThrow('Not found');
    });

    it('should rethrow non-response errors', () => {
      const error = new Error('Network error');

      expect(() => client.handleError(error)).toThrow('Network error');
    });
  });
});
