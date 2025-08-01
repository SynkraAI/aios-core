const ModificationHistory = require('../../../aios-core/utils/modification-history');
const GitWrapper = require('../../../aios-core/utils/git-wrapper');
const fs = require('fs').promises;
const path = require('path');

// Mock dependencies
jest.mock('../../../aios-core/utils/git-wrapper');
jest.mock('fs').promises;
jest.mock('chalk', () => ({
  red: jest.fn(text => text),
  green: jest.fn(text => text)
}));

describe('ModificationHistory', () => {
  let modificationHistory;
  let mockGit;
  const testRootPath = '/test/project';
  const historyFile = path.join(testRootPath, '.aios', 'modification-history.json');

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockGit = {
      getCurrentBranch: jest.fn().mockResolvedValue('main'),
      getDiff: jest.fn(),
      execGit: jest.fn()
    };
    
    GitWrapper.mockImplementation(() => mockGit);
    
    modificationHistory = new ModificationHistory({ rootPath: testRootPath });
  });

  describe('initialize', () => {
    test('should create history file if it does not exist', async () => {
      fs.mkdir.mockResolvedValue(undefined);
      fs.access.mockRejectedValue(new Error('File not found'));
      fs.writeFile.mockResolvedValue(undefined);

      await modificationHistory.initialize();

      expect(fs.mkdir).toHaveBeenCalledWith(
        path.dirname(historyFile),
        { recursive: true }
      );
      expect(fs.writeFile).toHaveBeenCalledWith(
        historyFile,
        expect.stringContaining('"version": "1.0.0"')
      );
    });

    test('should not create file if it already exists', async () => {
      fs.mkdir.mockResolvedValue(undefined);
      fs.access.mockResolvedValue(undefined);

      await modificationHistory.initialize();

      expect(fs.writeFile).not.toHaveBeenCalled();
    });
  });

  describe('recordModification', () => {
    test('should record new modification with generated ID', async () => {
      const mockHistory = {
        modifications: [],
        statistics: { totalModifications: 0 }
      };
      
      fs.mkdir.mockResolvedValue(undefined);
      fs.access.mockRejectedValue(new Error('Not found'));
      fs.writeFile.mockResolvedValue(undefined);
      fs.readFile.mockResolvedValue(JSON.stringify(mockHistory));
      
      const modification = {
        type: 'agent',
        target: 'test-agent',
        action: 'enhance',
        files: ['agent.md'],
        metadata: { description: 'Test enhancement' }
      };

      const id = await modificationHistory.recordModification(modification);

      expect(id).toMatch(/^mod-\d+-\w+$/);
      expect(fs.writeFile).toHaveBeenCalledWith(
        historyFile,
        expect.stringContaining('"type": "agent"')
      );
    });

    test('should include current branch and user info', async () => {
      const mockHistory = {
        modifications: [],
        statistics: { totalModifications: 0 }
      };
      
      fs.mkdir.mockResolvedValue(undefined);
      fs.access.mockRejectedValue(new Error('Not found'));
      fs.readFile.mockResolvedValue(JSON.stringify(mockHistory));
      fs.writeFile.mockImplementation((path, content) => {
        const parsed = JSON.parse(content);
        expect(parsed.modifications[0].branch).toBe('main');
        expect(parsed.modifications[0].user).toBeDefined();
        return Promise.resolve();
      });

      await modificationHistory.recordModification({
        type: 'task',
        target: 'test-task',
        action: 'update'
      });

      expect(mockGit.getCurrentBranch).toHaveBeenCalled();
    });
  });

  describe('updateModification', () => {
    test('should update existing modification', async () => {
      const mockHistory = {
        modifications: [{
          id: 'mod-123-abc',
          status: 'pending',
          timestamp: new Date().toISOString()
        }],
        statistics: {
          successfulModifications: 0,
          failedModifications: 0,
          rolledBackModifications: 0
        }
      };
      
      fs.readFile.mockResolvedValue(JSON.stringify(mockHistory));
      fs.writeFile.mockResolvedValue(undefined);

      await modificationHistory.updateModification('mod-123-abc', {
        status: 'completed',
        commit: 'abc123'
      });

      expect(fs.writeFile).toHaveBeenCalledWith(
        historyFile,
        expect.stringContaining('"status": "completed"')
      );
    });

    test('should update statistics based on status changes', async () => {
      const mockHistory = {
        modifications: [{
          id: 'mod-123-abc',
          status: 'pending'
        }],
        statistics: {
          successfulModifications: 0,
          failedModifications: 0,
          rolledBackModifications: 0
        }
      };
      
      fs.readFile.mockResolvedValue(JSON.stringify(mockHistory));
      let savedHistory;
      fs.writeFile.mockImplementation((path, content) => {
        savedHistory = JSON.parse(content);
        return Promise.resolve();
      });

      await modificationHistory.updateModification('mod-123-abc', {
        status: 'completed'
      });

      expect(savedHistory.statistics.successfulModifications).toBe(1);
    });

    test('should calculate duration for completed modifications', async () => {
      const startTime = new Date(Date.now() - 5000).toISOString();
      const mockHistory = {
        modifications: [{
          id: 'mod-123-abc',
          status: 'pending',
          timestamp: startTime
        }],
        statistics: {}
      };
      
      fs.readFile.mockResolvedValue(JSON.stringify(mockHistory));
      let savedHistory;
      fs.writeFile.mockImplementation((path, content) => {
        savedHistory = JSON.parse(content);
        return Promise.resolve();
      });

      await modificationHistory.updateModification('mod-123-abc', {
        status: 'completed'
      });

      expect(savedHistory.modifications[0].duration).toBeGreaterThan(0);
    });

    test('should throw error if modification not found', async () => {
      const mockHistory = {
        modifications: [],
        statistics: {}
      };
      
      fs.readFile.mockResolvedValue(JSON.stringify(mockHistory));

      await expect(
        modificationHistory.updateModification('non-existent', {})
      ).rejects.toThrow('Modification not found: non-existent');
    });
  });

  describe('getModifications', () => {
    const createMockModifications = () => [
      {
        id: 'mod-1',
        type: 'agent',
        target: 'agent-1',
        status: 'completed',
        user: 'user1',
        timestamp: new Date('2024-01-01').toISOString()
      },
      {
        id: 'mod-2',
        type: 'task',
        target: 'task-1',
        status: 'failed',
        user: 'user2',
        timestamp: new Date('2024-01-02').toISOString()
      },
      {
        id: 'mod-3',
        type: 'agent',
        target: 'agent-2',
        status: 'completed',
        user: 'user1',
        timestamp: new Date('2024-01-03').toISOString()
      }
    ];

    test('should return all modifications when no filter', async () => {
      const mockHistory = {
        modifications: createMockModifications()
      };
      
      fs.readFile.mockResolvedValue(JSON.stringify(mockHistory));

      const results = await modificationHistory.getModifications();

      expect(results).toHaveLength(3);
      expect(results[0].id).toBe('mod-3'); // Newest first
    });

    test('should filter by type', async () => {
      const mockHistory = {
        modifications: createMockModifications()
      };
      
      fs.readFile.mockResolvedValue(JSON.stringify(mockHistory));

      const results = await modificationHistory.getModifications({ type: 'agent' });

      expect(results).toHaveLength(2);
      expect(results.every(m => m.type === 'agent')).toBe(true);
    });

    test('should filter by status', async () => {
      const mockHistory = {
        modifications: createMockModifications()
      };
      
      fs.readFile.mockResolvedValue(JSON.stringify(mockHistory));

      const results = await modificationHistory.getModifications({ status: 'completed' });

      expect(results).toHaveLength(2);
      expect(results.every(m => m.status === 'completed')).toBe(true);
    });

    test('should filter by date range', async () => {
      const mockHistory = {
        modifications: createMockModifications()
      };
      
      fs.readFile.mockResolvedValue(JSON.stringify(mockHistory));

      const results = await modificationHistory.getModifications({
        dateFrom: '2024-01-02',
        dateTo: '2024-01-02'
      });

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('mod-2');
    });

    test('should apply limit', async () => {
      const mockHistory = {
        modifications: createMockModifications()
      };
      
      fs.readFile.mockResolvedValue(JSON.stringify(mockHistory));

      const results = await modificationHistory.getModifications({ limit: 2 });

      expect(results).toHaveLength(2);
    });
  });

  describe('getStatistics', () => {
    test('should calculate comprehensive statistics', async () => {
      const mockHistory = {
        modifications: [
          {
            type: 'agent',
            status: 'completed',
            user: 'user1',
            timestamp: new Date('2024-01-01').toISOString(),
            duration: 5000
          },
          {
            type: 'agent',
            status: 'completed',
            user: 'user1',
            timestamp: new Date('2024-01-01').toISOString(),
            duration: 3000
          },
          {
            type: 'task',
            status: 'failed',
            user: 'user2',
            timestamp: new Date('2024-01-02').toISOString()
          }
        ],
        statistics: {
          totalModifications: 3,
          successfulModifications: 2,
          failedModifications: 1,
          rolledBackModifications: 0
        }
      };
      
      fs.readFile.mockResolvedValue(JSON.stringify(mockHistory));

      const stats = await modificationHistory.getStatistics();

      expect(stats.totalModifications).toBe(3);
      expect(stats.successRate).toBe('66.67%');
      expect(stats.typeDistribution.agent).toBe(2);
      expect(stats.typeDistribution.task).toBe(1);
      expect(stats.userActivity.user1).toBe(2);
      expect(stats.averageDuration.agent).toBe(4000);
      expect(stats.mostActiveUser).toBe('user1');
      expect(stats.mostCommonType).toBe('agent');
    });
  });

  describe('getTimeline', () => {
    test('should group modifications by day', async () => {
      const mockHistory = {
        modifications: [
          {
            id: 'mod-1',
            timestamp: new Date('2024-01-01T10:00:00').toISOString(),
            type: 'agent',
            status: 'completed'
          },
          {
            id: 'mod-2',
            timestamp: new Date('2024-01-01T14:00:00').toISOString(),
            type: 'task',
            status: 'completed'
          },
          {
            id: 'mod-3',
            timestamp: new Date('2024-01-02T10:00:00').toISOString(),
            type: 'agent',
            status: 'failed'
          }
        ]
      };
      
      fs.readFile.mockResolvedValue(JSON.stringify(mockHistory));

      const timeline = await modificationHistory.getTimeline({ groupBy: 'day' });

      expect(timeline.entries).toHaveLength(2);
      expect(timeline.entries[0].date).toBe('2024-01-02');
      expect(timeline.entries[0].total).toBe(1);
      expect(timeline.entries[1].date).toBe('2024-01-01');
      expect(timeline.entries[1].total).toBe(2);
    });

    test('should support different grouping options', async () => {
      const mockHistory = {
        modifications: [
          {
            id: 'mod-1',
            timestamp: new Date('2024-01-15T10:00:00').toISOString(),
            type: 'agent',
            status: 'completed'
          }
        ]
      };
      
      fs.readFile.mockResolvedValue(JSON.stringify(mockHistory));

      const monthTimeline = await modificationHistory.getTimeline({ groupBy: 'month' });
      expect(monthTimeline.entries[0].date).toBe('2024-01');

      const hourTimeline = await modificationHistory.getTimeline({ groupBy: 'hour' });
      expect(hourTimeline.entries[0].date).toBe('2024-01-15T10');
    });
  });

  describe('generateImpactReport', () => {
    test('should generate impact report for modification', async () => {
      const mockHistory = {
        modifications: [
          {
            id: 'mod-123',
            type: 'agent',
            target: 'test-agent',
            timestamp: new Date().toISOString(),
            status: 'completed',
            files: ['agent.md', 'config.yaml'],
            commit: 'abc123'
          },
          {
            id: 'mod-124',
            type: 'agent',
            target: 'test-agent',
            timestamp: new Date().toISOString()
          },
          {
            id: 'mod-125',
            type: 'agent',
            target: 'other-agent',
            timestamp: new Date().toISOString()
          }
        ]
      };
      
      fs.readFile.mockResolvedValue(JSON.stringify(mockHistory));
      mockGit.getDiff.mockResolvedValue('+added line\n-removed line\n normal line');

      const report = await modificationHistory.generateImpactReport('mod-123');

      expect(report.modification.id).toBe('mod-123');
      expect(report.directImpact.filesModified).toBe(2);
      expect(report.gitImpact.additions).toBe(1);
      expect(report.gitImpact.deletions).toBe(1);
      expect(report.relatedModifications).toHaveLength(2);
      expect(report.relatedModifications[0].relation).toBe('same-target');
    });

    test('should handle missing modification', async () => {
      const mockHistory = {
        modifications: []
      };
      
      fs.readFile.mockResolvedValue(JSON.stringify(mockHistory));

      await expect(
        modificationHistory.generateImpactReport('non-existent')
      ).rejects.toThrow('Modification not found: non-existent');
    });
  });

  describe('exportHistory', () => {
    const mockData = {
      modifications: [
        {
          id: 'mod-1',
          type: 'agent',
          target: 'test',
          timestamp: new Date().toISOString()
        }
      ],
      statistics: {
        totalModifications: 1
      }
    };

    test('should export to JSON format', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockData));

      const exported = await modificationHistory.exportHistory({ format: 'json' });
      const parsed = JSON.parse(exported);

      expect(parsed.version).toBe('1.0.0');
      expect(parsed.modifications).toHaveLength(1);
      expect(parsed.statistics).toBeDefined();
    });

    test('should export to CSV format', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockData));

      const exported = await modificationHistory.exportHistory({ format: 'csv' });

      expect(exported).toContain('ID,Timestamp,Type,Target');
      expect(exported).toContain('mod-1');
    });

    test('should export to Markdown format', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockData));

      const exported = await modificationHistory.exportHistory({ format: 'markdown' });

      expect(exported).toContain('# Modification History Export');
      expect(exported).toContain('## Statistics');
      expect(exported).toContain('## Modifications');
      expect(exported).toContain('### mod-1');
    });
  });
});