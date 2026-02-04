/**
 * Confluence Client Unit Tests
 * Enterprise QA DevOps Squad
 */

const axios = require('axios');
const fs = require('fs');
const { ConfluenceClient } = require('../../tools/confluence-client');
const mockResponses = require('../mocks/atlassian-responses.json');

// Mock axios and fs
jest.mock('axios');
jest.mock('fs');

describe('ConfluenceClient', () => {
  let client;
  let mockAxiosInstance;

  beforeEach(() => {
    jest.clearAllMocks();

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

    client = new ConfluenceClient({
      domain: 'test.atlassian.net',
      email: 'test@example.com',
      apiToken: 'test-token'
    });
  });

  describe('constructor', () => {
    it('should create client with provided options', () => {
      expect(client.domain).toBe('test.atlassian.net');
      expect(client.baseUrl).toBe('https://test.atlassian.net/wiki/rest/api');
    });

    it('should throw error when credentials are missing', () => {
      const originalDomain = process.env.ATLASSIAN_DOMAIN;
      delete process.env.ATLASSIAN_DOMAIN;

      expect(() => new ConfluenceClient({ domain: '', email: '', apiToken: '' })).toThrow(
        'Confluence credentials not configured'
      );

      process.env.ATLASSIAN_DOMAIN = originalDomain;
    });
  });

  describe('Content Operations', () => {
    describe('createContent', () => {
      it('should create content', async () => {
        mockAxiosInstance.post.mockResolvedValue({ data: mockResponses.confluence.content });

        const payload = {
          type: 'page',
          title: 'Test Page',
          space: { key: 'SPACE' },
          body: { storage: { value: '<p>Content</p>', representation: 'storage' } }
        };

        const result = await client.createContent(payload);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/content', payload);
        expect(result.id).toBe('12345');
      });
    });

    describe('getContentById', () => {
      it('should get content by ID', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: mockResponses.confluence.content });

        const result = await client.getContentById('12345');

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/content/12345', { params: {} });
        expect(result.title).toBe('Test Page');
      });

      it('should expand specified fields', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: mockResponses.confluence.content });

        await client.getContentById('12345', ['body.storage', 'version']);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/content/12345', {
          params: { expand: 'body.storage,version' }
        });
      });
    });

    describe('updateContent', () => {
      it('should update content', async () => {
        mockAxiosInstance.put.mockResolvedValue({ data: mockResponses.confluence.content });

        const payload = {
          type: 'page',
          title: 'Updated Title',
          version: { number: 2 }
        };

        await client.updateContent('12345', payload);

        expect(mockAxiosInstance.put).toHaveBeenCalledWith('/content/12345', payload);
      });
    });

    describe('deleteContent', () => {
      it('should delete content', async () => {
        mockAxiosInstance.delete.mockResolvedValue({ data: {} });

        await client.deleteContent('12345');

        expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/content/12345');
      });
    });
  });

  describe('Search Operations', () => {
    describe('searchContent', () => {
      it('should search with CQL', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: mockResponses.confluence.search });

        const result = await client.searchContent('space = "SPACE" AND type = "page"');

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/content/search', {
          params: {
            cql: 'space = "SPACE" AND type = "page"',
            limit: 25,
            start: 0,
            expand: 'space,version'
          }
        });
        expect(result.results).toHaveLength(1);
      });

      it('should use custom pagination', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: mockResponses.confluence.search });

        await client.searchContent('type = "page"', { limit: 10, start: 5 });

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/content/search', expect.objectContaining({
          params: expect.objectContaining({
            limit: 10,
            start: 5
          })
        }));
      });
    });

    describe('findPage', () => {
      it('should find page by space and title', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: mockResponses.confluence.search });

        const result = await client.findPage('SPACE', 'Test Page');

        expect(result.id).toBe('12345');
      });

      it('should throw error when page not found', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: { results: [] } });

        await expect(client.findPage('SPACE', 'Not Found')).rejects.toThrow(
          'Page not found: "Not Found" in space "SPACE"'
        );
      });
    });
  });

  describe('Space Operations', () => {
    describe('getSpace', () => {
      it('should get space by key', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: mockResponses.confluence.space });

        const result = await client.getSpace('SPACE');

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/space/SPACE');
        expect(result.name).toBe('Test Space');
      });
    });

    describe('getSpaces', () => {
      it('should get all spaces', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: mockResponses.confluence.spaces });

        const result = await client.getSpaces();

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/space');
        expect(result.results).toHaveLength(2);
      });
    });

    describe('getSpaceContent', () => {
      it('should get content in space', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: { results: [mockResponses.confluence.content] } });

        const result = await client.getSpaceContent('SPACE');

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/space/SPACE/content', {
          params: {
            type: 'page',
            limit: 25,
            start: 0,
            expand: 'version'
          }
        });
      });
    });
  });

  describe('Page Operations', () => {
    describe('createPage', () => {
      it('should create a page', async () => {
        mockAxiosInstance.post.mockResolvedValue({ data: mockResponses.confluence.content });

        const result = await client.createPage('SPACE', 'New Page', '<p>Content</p>');

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/content', expect.objectContaining({
          type: 'page',
          title: 'New Page',
          space: { key: 'SPACE' }
        }));
        expect(result.id).toBe('12345');
      });

      it('should create page with parent ID', async () => {
        mockAxiosInstance.post.mockResolvedValue({ data: mockResponses.confluence.content });

        await client.createPage('SPACE', 'Child Page', '<p>Content</p>', {
          parentId: '99999'
        });

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/content', expect.objectContaining({
          ancestors: [{ id: '99999' }]
        }));
      });

      it('should create page with parent title', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: mockResponses.confluence.search });
        mockAxiosInstance.post.mockResolvedValue({ data: mockResponses.confluence.content });

        await client.createPage('SPACE', 'Child Page', '<p>Content</p>', {
          parentTitle: 'Test Page'
        });

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/content', expect.objectContaining({
          ancestors: [{ id: '12345' }]
        }));
      });

      it('should add labels when specified', async () => {
        mockAxiosInstance.post.mockResolvedValueOnce({ data: mockResponses.confluence.content });
        mockAxiosInstance.post.mockResolvedValueOnce({ data: mockResponses.confluence.labels });

        await client.createPage('SPACE', 'New Page', '<p>Content</p>', {
          labels: ['test-label', 'qa']
        });

        expect(mockAxiosInstance.post).toHaveBeenCalledTimes(2);
      });
    });

    describe('updatePage', () => {
      it('should update page content', async () => {
        mockAxiosInstance.get.mockResolvedValue({
          data: { ...mockResponses.confluence.content, version: { number: 1 } }
        });
        mockAxiosInstance.put.mockResolvedValue({ data: mockResponses.confluence.content });

        await client.updatePage('12345', 'Updated Title', '<p>New content</p>');

        expect(mockAxiosInstance.put).toHaveBeenCalledWith('/content/12345', expect.objectContaining({
          title: 'Updated Title',
          version: { number: 2, message: 'Updated by AIOS' }
        }));
      });

      it('should use custom version message', async () => {
        mockAxiosInstance.get.mockResolvedValue({
          data: { ...mockResponses.confluence.content, version: { number: 5 } }
        });
        mockAxiosInstance.put.mockResolvedValue({ data: mockResponses.confluence.content });

        await client.updatePage('12345', 'Title', '<p>Content</p>', 'Custom message');

        expect(mockAxiosInstance.put).toHaveBeenCalledWith('/content/12345', expect.objectContaining({
          version: { number: 6, message: 'Custom message' }
        }));
      });
    });

    describe('appendToPage', () => {
      it('should append content to existing page', async () => {
        mockAxiosInstance.get.mockResolvedValue({
          data: {
            ...mockResponses.confluence.content,
            body: { storage: { value: '<p>Existing</p>' } },
            version: { number: 1 }
          }
        });
        mockAxiosInstance.put.mockResolvedValue({ data: mockResponses.confluence.content });

        await client.appendToPage('12345', '<p>Appended</p>');

        expect(mockAxiosInstance.put).toHaveBeenCalledWith('/content/12345', expect.objectContaining({
          body: {
            storage: {
              value: '<p>Existing</p><p>Appended</p>',
              representation: 'storage'
            }
          }
        }));
      });
    });
  });

  describe('Label Operations', () => {
    describe('getLabels', () => {
      it('should get labels for content', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: mockResponses.confluence.labels });

        const result = await client.getLabels('12345');

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/content/12345/label');
        expect(result.results).toHaveLength(2);
      });
    });

    describe('addLabels', () => {
      it('should add labels to content', async () => {
        mockAxiosInstance.post.mockResolvedValue({ data: mockResponses.confluence.labels });

        await client.addLabels('12345', ['new-label', 'another']);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/content/12345/label', [
          { prefix: 'global', name: 'new-label' },
          { prefix: 'global', name: 'another' }
        ]);
      });
    });

    describe('removeLabel', () => {
      it('should remove label from content', async () => {
        mockAxiosInstance.delete.mockResolvedValue({ data: {} });

        await client.removeLabel('12345', 'old-label');

        expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/content/12345/label/old-label');
      });
    });

    describe('removeLabels', () => {
      it('should remove multiple labels', async () => {
        mockAxiosInstance.delete.mockResolvedValue({ data: {} });

        const result = await client.removeLabels('12345', ['label1', 'label2']);

        expect(mockAxiosInstance.delete).toHaveBeenCalledTimes(2);
        expect(result).toHaveLength(2);
        expect(result[0].success).toBe(true);
      });

      it('should handle partial failures', async () => {
        mockAxiosInstance.delete.mockResolvedValueOnce({ data: {} });
        mockAxiosInstance.delete.mockRejectedValueOnce(new Error('Label not found'));

        const result = await client.removeLabels('12345', ['exists', 'missing']);

        expect(result[0].success).toBe(true);
        expect(result[1].success).toBe(false);
        expect(result[1].error).toBe('Label not found');
      });
    });
  });

  describe('Attachment Operations', () => {
    describe('getAttachments', () => {
      it('should get attachments for content', async () => {
        mockAxiosInstance.get.mockResolvedValue({
          data: { results: [{ id: 'att-1', title: 'file.pdf' }] }
        });

        const result = await client.getAttachments('12345');

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/content/12345/child/attachment');
      });
    });

    describe('addAttachment', () => {
      it('should add attachment to content', async () => {
        const mockStream = { pipe: jest.fn() };
        fs.createReadStream.mockReturnValue(mockStream);
        axios.post.mockResolvedValue({ data: { id: 'att-1' } });

        await client.addAttachment('12345', '/path/to/file.pdf');

        expect(fs.createReadStream).toHaveBeenCalledWith('/path/to/file.pdf');
      });

      it('should include comment when provided', async () => {
        const mockStream = { pipe: jest.fn() };
        fs.createReadStream.mockReturnValue(mockStream);
        axios.post.mockResolvedValue({ data: { id: 'att-1' } });

        await client.addAttachment('12345', '/path/to/file.pdf', 'Attachment comment');

        expect(axios.post).toHaveBeenCalled();
      });
    });
  });

  describe('History Operations', () => {
    describe('getContentHistory', () => {
      it('should get content history', async () => {
        mockAxiosInstance.get.mockResolvedValue({
          data: { lastUpdated: { when: '2026-02-04' } }
        });

        const result = await client.getContentHistory('12345');

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/content/12345/history');
      });
    });

    describe('getContentVersion', () => {
      it('should get specific content version', async () => {
        mockAxiosInstance.get.mockResolvedValue({
          data: { number: 5, content: {} }
        });

        await client.getContentVersion('12345', 5);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/content/12345/version/5', {
          params: { expand: 'content' }
        });
      });
    });
  });

  describe('Children/Ancestors', () => {
    describe('getChildren', () => {
      it('should get child pages', async () => {
        mockAxiosInstance.get.mockResolvedValue({
          data: { results: [{ id: 'child-1' }] }
        });

        await client.getChildren('12345');

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/content/12345/child/page');
      });

      it('should get children of specified type', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: { results: [] } });

        await client.getChildren('12345', 'comment');

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/content/12345/child/comment');
      });
    });

    describe('getAncestors', () => {
      it('should get ancestors', async () => {
        mockAxiosInstance.get.mockResolvedValue({
          data: { ancestors: [{ id: 'parent-1' }] }
        });

        const result = await client.getAncestors('12345');

        expect(result).toEqual([{ id: 'parent-1' }]);
      });
    });
  });

  describe('Health Check', () => {
    describe('healthCheck', () => {
      it('should return healthy status when connected', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: mockResponses.confluence.spaces });

        const result = await client.healthCheck();

        expect(result.status).toBe('healthy');
      });

      it('should return unhealthy status on error', async () => {
        mockAxiosInstance.get.mockRejectedValue(new Error('Connection failed'));

        const result = await client.healthCheck();

        expect(result.status).toBe('unhealthy');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle 409 conflict errors', () => {
      const error = {
        response: {
          status: 409,
          data: { message: 'Page already exists' }
        }
      };

      expect(() => client.handleError(error)).toThrow('Conflict');
    });
  });
});
