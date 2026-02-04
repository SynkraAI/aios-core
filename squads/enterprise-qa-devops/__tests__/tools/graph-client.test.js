/**
 * Microsoft Graph Client Unit Tests
 * Enterprise QA DevOps Squad
 */

const axios = require('axios');
const { GraphClient } = require('../../tools/graph-client');
const mockResponses = require('../mocks/graph-responses.json');

// Mock axios and msal-node
jest.mock('axios');
jest.mock('@azure/msal-node', () => ({
  ConfidentialClientApplication: jest.fn().mockImplementation(() => ({
    acquireTokenByClientCredential: jest.fn().mockResolvedValue({
      accessToken: 'mock-access-token',
      expiresOn: new Date(Date.now() + 3600000)
    })
  }))
}));

describe('GraphClient', () => {
  let client;
  let mockAxiosInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn()
    };

    axios.create.mockReturnValue(mockAxiosInstance);

    client = new GraphClient({
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      tenantId: 'test-tenant-id'
    });
  });

  describe('constructor', () => {
    it('should create client with provided options', () => {
      expect(client.clientId).toBe('test-client-id');
      expect(client.tenantId).toBe('test-tenant-id');
      expect(client.baseUrl).toBe('https://graph.microsoft.com/v1.0');
    });

    it('should throw error when credentials are missing', () => {
      const originalClientId = process.env.MS365_CLIENT_ID;
      delete process.env.MS365_CLIENT_ID;

      expect(() => new GraphClient({ clientId: '', clientSecret: '', tenantId: '' })).toThrow(
        'Microsoft 365 credentials not configured'
      );

      process.env.MS365_CLIENT_ID = originalClientId;
    });
  });

  describe('Authentication', () => {
    describe('getToken', () => {
      it('should acquire token via MSAL', async () => {
        const token = await client.getToken();

        expect(token).toBe('mock-access-token');
      });

      it('should cache token and not re-authenticate', async () => {
        await client.getToken();
        await client.getToken();

        expect(client.msalClient.acquireTokenByClientCredential).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Mail Operations', () => {
    describe('sendMail', () => {
      it('should send email', async () => {
        mockAxiosInstance.post.mockResolvedValue({ data: {} });

        const payload = {
          message: {
            subject: 'Test Subject',
            body: { contentType: 'text', content: 'Test body' },
            toRecipients: [{ emailAddress: { address: 'test@example.com' } }]
          }
        };

        await client.sendMail(payload);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/users/me/sendMail', payload);
      });

      it('should send email on behalf of another user', async () => {
        mockAxiosInstance.post.mockResolvedValue({ data: {} });

        await client.sendMail({ message: {} }, 'user@example.com');

        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/users/user@example.com/sendMail',
          expect.any(Object)
        );
      });
    });

    describe('getMessages', () => {
      it('should get messages', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: mockResponses.mail.messages });

        const result = await client.getMessages();

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/me/messages', {
          params: {
            $top: 10,
            $orderby: 'receivedDateTime desc',
            $filter: undefined
          }
        });
        expect(result.value).toHaveLength(2);
      });

      it('should apply filter', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: mockResponses.mail.messages });

        await client.getMessages('me', { filter: "from/emailAddress/address eq 'sender@example.com'" });

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/me/messages', expect.objectContaining({
          params: expect.objectContaining({
            $filter: "from/emailAddress/address eq 'sender@example.com'"
          })
        }));
      });
    });

    describe('getUnreadMessages', () => {
      it('should get unread messages', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: mockResponses.mail.messages });

        await client.getUnreadMessages('me', 5);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/me/messages', expect.objectContaining({
          params: expect.objectContaining({
            $filter: 'isRead eq false',
            $top: 5
          })
        }));
      });
    });

    describe('getMessage', () => {
      it('should get a single message', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: mockResponses.mail.message });

        const result = await client.getMessage('msg-001');

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/me/messages/msg-001');
        expect(result.subject).toBe('Test Email Subject');
      });
    });

    describe('markAsRead', () => {
      it('should mark message as read', async () => {
        mockAxiosInstance.patch.mockResolvedValue({ data: { isRead: true } });

        await client.markAsRead('msg-001');

        expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/users/me/messages/msg-001', {
          isRead: true
        });
      });
    });
  });

  describe('Calendar Operations', () => {
    describe('createEvent', () => {
      it('should create calendar event', async () => {
        mockAxiosInstance.post.mockResolvedValue({ data: mockResponses.calendar.event });

        const event = {
          subject: 'Team Meeting',
          start: { dateTime: '2026-02-05T14:00:00', timeZone: 'UTC' },
          end: { dateTime: '2026-02-05T15:00:00', timeZone: 'UTC' }
        };

        const result = await client.createEvent(event);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/users/me/events', event);
        expect(result.subject).toBe('Team Meeting');
      });
    });

    describe('getEvents', () => {
      it('should get calendar events', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: mockResponses.calendar.events });

        const result = await client.getEvents();

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/me/events', {
          params: {
            $top: 10,
            $orderby: 'start/dateTime'
          }
        });
        expect(result.value).toHaveLength(1);
      });

      it('should filter by date range', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: mockResponses.calendar.events });

        await client.getEvents('me', {
          startDateTime: '2026-02-01T00:00:00Z',
          endDateTime: '2026-02-28T23:59:59Z'
        });

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/me/events', expect.objectContaining({
          params: expect.objectContaining({
            $filter: expect.stringContaining('2026-02-01')
          })
        }));
      });
    });

    describe('getEvent', () => {
      it('should get a single event', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: mockResponses.calendar.event });

        const result = await client.getEvent('event-001');

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/me/events/event-001');
        expect(result.subject).toBe('Team Meeting');
      });
    });

    describe('updateEvent', () => {
      it('should update event', async () => {
        mockAxiosInstance.patch.mockResolvedValue({ data: mockResponses.calendar.event });

        await client.updateEvent('event-001', { subject: 'Updated Meeting' });

        expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/users/me/events/event-001', {
          subject: 'Updated Meeting'
        });
      });
    });

    describe('deleteEvent', () => {
      it('should delete event', async () => {
        mockAxiosInstance.delete.mockResolvedValue({ data: {} });

        const result = await client.deleteEvent('event-001');

        expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/users/me/events/event-001');
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Teams Operations', () => {
    describe('getJoinedTeams', () => {
      it('should get joined teams', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: mockResponses.teams.joinedTeams });

        const result = await client.getJoinedTeams();

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/me/joinedTeams');
        expect(result.value).toHaveLength(2);
      });
    });

    describe('getTeam', () => {
      it('should get team by ID', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: mockResponses.teams.team });

        const result = await client.getTeam('team-001');

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/teams/team-001');
        expect(result.displayName).toBe('QA Team');
      });
    });

    describe('getChannels', () => {
      it('should get team channels', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: mockResponses.teams.channels });

        const result = await client.getChannels('team-001');

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/teams/team-001/channels');
        expect(result.value).toHaveLength(2);
      });
    });

    describe('postChannelMessage', () => {
      it('should post message to channel', async () => {
        mockAxiosInstance.post.mockResolvedValue({ data: mockResponses.teams.message });

        const message = {
          body: {
            contentType: 'html',
            content: '<p>Test message</p>'
          }
        };

        const result = await client.postChannelMessage('team-001', 'channel-001', message);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/teams/team-001/channels/channel-001/messages',
          message
        );
        expect(result.id).toBe('msg-teams-001');
      });
    });

    describe('getChannelMessages', () => {
      it('should get channel messages', async () => {
        mockAxiosInstance.get.mockResolvedValue({
          data: { value: [mockResponses.teams.message] }
        });

        const result = await client.getChannelMessages('team-001', 'channel-001');

        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          '/teams/team-001/channels/channel-001/messages',
          { params: { $top: 20 } }
        );
      });
    });
  });

  describe('User Operations', () => {
    describe('getUser', () => {
      it('should get user by ID', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: mockResponses.users.user });

        const result = await client.getUser('user-001');

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/user-001');
        expect(result.displayName).toBe('Test User');
      });
    });

    describe('getUserByEmail', () => {
      it('should get user by email', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: mockResponses.users.search });

        const result = await client.getUserByEmail('test@example.com');

        expect(result.mail).toBe('test@example.com');
      });

      it('should throw error when user not found', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: { value: [] } });

        await expect(client.getUserByEmail('notfound@example.com')).rejects.toThrow(
          'User not found'
        );
      });
    });

    describe('searchUsers', () => {
      it('should search users', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: mockResponses.users.search });

        const result = await client.searchUsers('test');

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users', {
          params: {
            $filter: "startsWith(displayName, 'test') or startsWith(mail, 'test')"
          }
        });
      });
    });
  });

  describe('OneDrive Operations', () => {
    describe('uploadFile', () => {
      it('should upload file to OneDrive', async () => {
        mockAxiosInstance.put.mockResolvedValue({ data: mockResponses.drive.file });

        const content = Buffer.from('file content');
        const result = await client.uploadFile(content, '/Documents/test.txt');

        expect(mockAxiosInstance.put).toHaveBeenCalledWith(
          '/me/drive/root:/Documents/test.txt:/content',
          content,
          { headers: { 'Content-Type': 'application/octet-stream' } }
        );
        expect(result.name).toBe('test-file.txt');
      });

      it('should upload to specific drive', async () => {
        mockAxiosInstance.put.mockResolvedValue({ data: mockResponses.drive.file });

        await client.uploadFile(Buffer.from('content'), '/test.txt', 'drive-id');

        expect(mockAxiosInstance.put).toHaveBeenCalledWith(
          '/drives/drive-id/root:/test.txt:/content',
          expect.any(Buffer),
          expect.any(Object)
        );
      });
    });

    describe('getFile', () => {
      it('should get file metadata', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: mockResponses.drive.file });

        const result = await client.getFile('/Documents/test.txt');

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/me/drive/root:/Documents/test.txt');
        expect(result.name).toBe('test-file.txt');
      });
    });

    describe('listFolder', () => {
      it('should list folder contents', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: mockResponses.drive.folder });

        const result = await client.listFolder('/Documents');

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/me/drive/root:/Documents:/children');
        expect(result.value).toHaveLength(2);
      });
    });

    describe('createSharingLink', () => {
      it('should create sharing link', async () => {
        mockAxiosInstance.post.mockResolvedValue({ data: mockResponses.drive.sharingLink });

        const result = await client.createSharingLink('file-001');

        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/me/drive/items/file-001/createLink',
          { type: 'view', scope: 'organization' }
        );
        expect(result.link.webUrl).toBeDefined();
      });
    });
  });

  describe('Presence', () => {
    describe('getUserPresence', () => {
      it('should get user presence', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: mockResponses.presence });

        const result = await client.getUserPresence('user-001');

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/user-001/presence');
        expect(result.availability).toBe('Available');
      });
    });
  });

  describe('Health Check', () => {
    describe('healthCheck', () => {
      it('should return healthy status when connected', async () => {
        const result = await client.healthCheck();

        expect(result.status).toBe('healthy');
      });

      it('should return unhealthy status on error', async () => {
        // Create a client that will fail
        const { ConfidentialClientApplication } = require('@azure/msal-node');
        ConfidentialClientApplication.mockImplementationOnce(() => ({
          acquireTokenByClientCredential: jest.fn().mockRejectedValue(new Error('Auth failed'))
        }));

        const failingClient = new GraphClient({
          clientId: 'test',
          clientSecret: 'test',
          tenantId: 'test'
        });

        const result = await failingClient.healthCheck();

        expect(result.status).toBe('unhealthy');
      });
    });
  });
});
