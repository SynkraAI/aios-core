const MetricsTracker = require('../../../aios-core/utils/metrics-tracker');
const fs = require('fs').promises;
const path = require('path');

// Mock dependencies
jest.mock('fs').promises;
jest.mock('chalk', () => ({
  blue: jest.fn(text => text),
  gray: jest.fn(text => text),
  green: jest.fn(text => text),
  yellow: jest.fn(text => text),
  red: jest.fn(text => text)
}));

describe('MetricsTracker', () => {
  let metricsTracker;
  const testRootPath = '/test/project';
  const metricsFile = path.join(testRootPath, '.aios', 'improvement-metrics.json');

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock file system
    fs.mkdir.mockResolvedValue(undefined);
    fs.access.mockResolvedValue(undefined);
    fs.readFile.mockResolvedValue('{}');
    fs.writeFile.mockResolvedValue(undefined);
    
    metricsTracker = new MetricsTracker({ rootPath: testRootPath });
  });

  describe('initialize', () => {
    test('should create metrics directory and file', async () => {
      fs.access.mockRejectedValueOnce(new Error('Not found'));
      
      await metricsTracker.initialize();

      expect(fs.mkdir).toHaveBeenCalledWith(
        path.join(testRootPath, '.aios'),
        { recursive: true }
      );
      expect(fs.writeFile).toHaveBeenCalledWith(
        metricsFile,
        expect.stringContaining('"version": "1.0.0"')
      );
    });

    test('should not overwrite existing metrics file', async () => {
      await metricsTracker.initialize();

      expect(fs.access).toHaveBeenCalledWith(metricsFile);
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    test('should handle initialization errors gracefully', async () => {
      fs.mkdir.mockRejectedValue(new Error('Permission denied'));
      
      await metricsTracker.initialize();
      
      // Should not throw, just log error
      expect(fs.mkdir).toHaveBeenCalled();
    });
  });

  describe('recordImprovement', () => {
    const mockImprovement = {
      improvement_id: 'imp-123',
      analysis: {
        overall_score: 7.5,
        categories: {
          error_handling: { score: 8.0 },
          performance: { score: 7.0 }
        }
      },
      plan: {
        estimatedImpact: 3,
        estimatedEffort: 'medium',
        riskLevel: 'low',
        affectedFiles: ['file1.js', 'file2.js'],
        target_areas: ['error_handling']
      }
    };

    beforeEach(() => {
      fs.readFile.mockResolvedValue(JSON.stringify({
        version: '1.0.0',
        improvements: [],
        aggregates: metricsTracker.initializeAggregates(),
        trends: {}
      }));
    });

    test('should record improvement with complete data', async () => {
      await metricsTracker.recordImprovement(mockImprovement);

      const writeCall = fs.writeFile.mock.calls.find(call =>
        call[0] === metricsFile
      );
      const metrics = JSON.parse(writeCall[1]);

      expect(metrics.improvements).toHaveLength(1);
      
      const entry = metrics.improvements[0];
      expect(entry.improvement_id).toBe('imp-123');
      expect(entry.outcome).toBe('pending');
      expect(entry.measurements.baseline.overall_score).toBe(7.5);
      expect(entry.measurements.projected.impact).toBe(3);
      expect(entry.measurements.projected.files).toBe(2);
    });

    test('should update aggregates correctly', async () => {
      await metricsTracker.recordImprovement(mockImprovement);

      const writeCall = fs.writeFile.mock.calls.find(call =>
        call[0] === metricsFile
      );
      const metrics = JSON.parse(writeCall[1]);

      expect(metrics.aggregates.total_improvements).toBe(1);
      expect(metrics.aggregates.total_files_modified).toBe(2);
      expect(metrics.aggregates.improvements_by_category.error_handling).toBe(1);
    });

    test('should calculate trends', async () => {
      await metricsTracker.recordImprovement(mockImprovement);

      const writeCall = fs.writeFile.mock.calls.find(call =>
        call[0] === metricsFile
      );
      const metrics = JSON.parse(writeCall[1]);

      expect(metrics.trends).toBeDefined();
      expect(metrics.trends.success_rate).toHaveLength(5);
      expect(metrics.trends.velocity).toBeDefined();
    });

    test('should limit entries to max count', async () => {
      const existingImprovements = Array(1005).fill().map((_, i) => ({
        improvement_id: `imp-${i}`,
        timestamp: new Date(Date.now() - i * 1000).toISOString()
      }));

      fs.readFile.mockResolvedValue(JSON.stringify({
        version: '1.0.0',
        improvements: existingImprovements,
        aggregates: metricsTracker.initializeAggregates(),
        trends: {}
      }));

      await metricsTracker.recordImprovement(mockImprovement);

      const writeCall = fs.writeFile.mock.calls.find(call =>
        call[0] === metricsFile
      );
      const metrics = JSON.parse(writeCall[1]);

      expect(metrics.improvements).toHaveLength(1000); // maxEntries
    });

    test('should update hourly distribution', async () => {
      const mockDate = new Date('2023-01-01T14:30:00Z');
      jest.spyOn(Date.prototype, 'getHours').mockReturnValue(14);

      await metricsTracker.recordImprovement(mockImprovement);

      const writeCall = fs.writeFile.mock.calls.find(call =>
        call[0] === metricsFile
      );
      const metrics = JSON.parse(writeCall[1]);

      expect(metrics.aggregates.improvements_by_hour[14]).toBe(1);
    });
  });

  describe('updateOutcome', () => {
    const mockMetrics = {
      version: '1.0.0',
      improvements: [{
        improvement_id: 'imp-123',
        timestamp: '2023-01-01T10:00:00Z',
        outcome: 'pending'
      }],
      aggregates: {
        successful_improvements: 0,
        failed_improvements: 0,
        rolled_back_improvements: 0,
        total_duration_ms: 0,
        success_rate: 0
      }
    };

    beforeEach(() => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockMetrics));
    });

    test('should update improvement outcome to success', async () => {
      const outcome = {
        status: 'success',
        details: 'All tests passed'
      };

      await metricsTracker.updateOutcome('imp-123', outcome);

      const writeCall = fs.writeFile.mock.calls[0];
      const metrics = JSON.parse(writeCall[1]);
      
      const entry = metrics.improvements[0];
      expect(entry.outcome).toBe('success');
      expect(entry.outcome_details).toEqual(outcome);
      expect(entry.end_timestamp).toBeDefined();
      expect(entry.duration_ms).toBeGreaterThan(0);
      
      expect(metrics.aggregates.successful_improvements).toBe(1);
      expect(metrics.aggregates.success_rate).toBe(100);
    });

    test('should update improvement outcome to failed', async () => {
      const outcome = {
        status: 'failed',
        error: 'Tests failed'
      };

      await metricsTracker.updateOutcome('imp-123', outcome);

      const writeCall = fs.writeFile.mock.calls[0];
      const metrics = JSON.parse(writeCall[1]);
      
      expect(metrics.improvements[0].outcome).toBe('failed');
      expect(metrics.aggregates.failed_improvements).toBe(1);
      expect(metrics.aggregates.success_rate).toBe(0);
    });

    test('should update improvement outcome to rolled back', async () => {
      const outcome = {
        status: 'rolled_back',
        reason: 'Breaking changes detected'
      };

      await metricsTracker.updateOutcome('imp-123', outcome);

      const writeCall = fs.writeFile.mock.calls[0];
      const metrics = JSON.parse(writeCall[1]);
      
      expect(metrics.improvements[0].outcome).toBe('rolled_back');
      expect(metrics.aggregates.rolled_back_improvements).toBe(1);
    });

    test('should throw error for missing improvement', async () => {
      await expect(
        metricsTracker.updateOutcome('imp-missing', { status: 'success' })
      ).rejects.toThrow('Improvement not found: imp-missing');
    });

    test('should calculate duration correctly', async () => {
      const startTime = '2023-01-01T10:00:00Z';
      const endTime = '2023-01-01T10:05:30Z';
      
      const mockMetricsWithTime = {
        ...mockMetrics,
        improvements: [{
          improvement_id: 'imp-123',
          timestamp: startTime,
          outcome: 'pending'
        }]
      };

      fs.readFile.mockResolvedValue(JSON.stringify(mockMetricsWithTime));
      
      // Mock Date.now() to return the end time
      jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(endTime);

      await metricsTracker.updateOutcome('imp-123', { status: 'success' });

      const writeCall = fs.writeFile.mock.calls[0];
      const metrics = JSON.parse(writeCall[1]);
      
      expect(metrics.improvements[0].duration_ms).toBe(5.5 * 60 * 1000); // 5.5 minutes
    });
  });

  describe('getImprovementReport', () => {
    const mockEntry = {
      improvement_id: 'imp-123',
      timestamp: '2023-01-01T10:00:00Z',
      outcome: 'success',
      duration_ms: 300000, // 5 minutes
      metrics: { quality: 8.5 },
      measurements: {
        baseline: { overall_score: 7.0 },
        projected: { impact: 2, files: 3 }
      },
      plan: { target_areas: ['error_handling', 'performance'] }
    };

    beforeEach(() => {
      fs.readFile.mockResolvedValue(JSON.stringify({
        improvements: [mockEntry]
      }));
    });

    test('should generate complete improvement report', async () => {
      const report = await metricsTracker.getImprovementReport('imp-123');

      expect(report.improvement_id).toBe('imp-123');
      expect(report.outcome).toBe('success');
      expect(report.duration).toBe('300.00s');
      expect(report.metrics).toEqual({ quality: 8.5 });
      expect(report.impact_summary.scope).toBe('small'); // 3 files
      expect(report.impact_summary.areas_affected).toEqual(['error_handling', 'performance']);
    });

    test('should handle ongoing improvements', async () => {
      const ongoingEntry = { ...mockEntry, duration_ms: undefined };
      
      fs.readFile.mockResolvedValue(JSON.stringify({
        improvements: [ongoingEntry]
      }));

      const report = await metricsTracker.getImprovementReport('imp-123');

      expect(report.duration).toBe('ongoing');
    });

    test('should throw error for missing improvement', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify({
        improvements: []
      }));

      await expect(
        metricsTracker.getImprovementReport('imp-missing')
      ).rejects.toThrow('Improvement not found: imp-missing');
    });

    test('should generate recommendations based on outcome', async () => {
      const failedEntry = { ...mockEntry, outcome: 'failed' };
      
      fs.readFile.mockResolvedValue(JSON.stringify({
        improvements: [failedEntry]
      }));

      const report = await metricsTracker.getImprovementReport('imp-123');

      expect(report.recommendations).toContainEqual({
        type: 'investigation',
        message: 'Investigate failure cause and adjust validation criteria'
      });
    });
  });

  describe('getDashboard', () => {
    const mockImprovements = [
      {
        improvement_id: 'imp-1',
        timestamp: new Date().toISOString(),
        outcome: 'success',
        measurements: { projected: { impact: 5 } },
        plan: { target_areas: ['error_handling'] }
      },
      {
        improvement_id: 'imp-2',
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        outcome: 'failed',
        measurements: { projected: { impact: 2 } }
      },
      {
        improvement_id: 'imp-3',
        timestamp: new Date(Date.now() - 86400000 * 8).toISOString(), // 8 days ago
        outcome: 'success',
        measurements: { projected: { impact: 3 } }
      }
    ];

    beforeEach(() => {
      fs.readFile.mockResolvedValue(JSON.stringify({
        improvements: mockImprovements,
        aggregates: {
          success_rate: 75,
          rolled_back_improvements: 1,
          successful_improvements: 5
        },
        trends: {
          velocity: { direction: 'up', change: 25 }
        }
      }));
    });

    test('should generate dashboard for 7d period', async () => {
      const dashboard = await metricsTracker.getDashboard({ period: '7d' });

      expect(dashboard.period).toBe('7d');
      expect(dashboard.summary.total_improvements).toBe(2); // Within 7 days
      expect(dashboard.summary.successful).toBe(1);
      expect(dashboard.summary.failed).toBe(1);
      expect(dashboard.top_improvements).toHaveLength(1); // Only successful ones
    });

    test('should filter improvements by period', async () => {
      const dashboard = await metricsTracker.getDashboard({ period: '24h' });

      expect(dashboard.summary.total_improvements).toBe(1); // Only today
    });

    test('should calculate performance metrics', async () => {
      const dashboard = await metricsTracker.getDashboard();

      expect(dashboard.performance).toBeDefined();
      expect(dashboard.performance.average_duration).toBeDefined();
    });

    test('should include trend data', async () => {
      const dashboard = await metricsTracker.getDashboard();

      expect(dashboard.trends.velocity.direction).toBe('up');
    });

    test('should generate recommendations', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify({
        improvements: mockImprovements,
        aggregates: {
          success_rate: 60, // Below 70%
          rolled_back_improvements: 2,
          successful_improvements: 3
        },
        trends: { velocity: { direction: 'down', change: -60 } }
      }));

      const dashboard = await metricsTracker.getDashboard();

      expect(dashboard.recommendations).toContainEqual({
        priority: 'high',
        message: 'Success rate below 70% - review validation and testing processes'
      });
    });
  });

  describe('generateAnalytics', () => {
    const mockImprovements = [
      {
        improvement_id: 'imp-1',
        timestamp: '2023-01-15T10:00:00Z',
        outcome: 'success',
        duration_ms: 300000,
        measurements: {
          baseline: { overall_score: 7.0 },
          projected: { impact: 2 }
        },
        plan: { target_areas: ['error_handling'] }
      },
      {
        improvement_id: 'imp-2',
        timestamp: '2023-02-10T14:00:00Z',
        outcome: 'failed',
        duration_ms: 180000,
        plan: { target_areas: ['performance'] }
      }
    ];

    beforeEach(() => {
      fs.readFile.mockResolvedValue(JSON.stringify({
        improvements: mockImprovements,
        aggregates: {
          total_files_modified: 10,
          total_functions_improved: 25
        }
      }));
    });

    test('should generate comprehensive analytics', async () => {
      const analytics = await metricsTracker.generateAnalytics();

      expect(analytics.generated).toBeDefined();
      expect(analytics.improvements.total).toBe(2);
      expect(analytics.improvements.by_outcome.success).toBe(1);
      expect(analytics.improvements.by_outcome.failed).toBe(1);
      expect(analytics.improvements.by_category.error_handling).toBe(1);
      expect(analytics.improvements.by_category.performance).toBe(1);
    });

    test('should calculate performance metrics', async () => {
      const analytics = await metricsTracker.generateAnalytics();

      expect(analytics.performance.average_duration).toBe(240000); // (300000 + 180000) / 2
      expect(analytics.performance.success_rate).toBe(50); // 1 of 2 successful
    });

    test('should calculate impact metrics', async () => {
      const analytics = await metricsTracker.generateAnalytics();

      expect(analytics.impact.total_files_modified).toBe(10);
      expect(analytics.impact.total_functions_improved).toBe(25);
      expect(analytics.impact.average_improvement_score).toBe('2.00');
    });

    test('should group by month', async () => {
      const analytics = await metricsTracker.generateAnalytics();

      expect(analytics.improvements.by_month['2023-01']).toBe(1);
      expect(analytics.improvements.by_month['2023-02']).toBe(1);
    });

    test('should identify patterns', async () => {
      const analytics = await metricsTracker.generateAnalytics();

      expect(analytics.patterns.common_failures.performance).toBe(1);
      expect(analytics.patterns.success_factors).toContainEqual({
        factor: 'optimal_file_count',
        value: expect.any(Number),
        confidence: 0.7
      });
    });

    test('should generate insights', async () => {
      const analytics = await metricsTracker.generateAnalytics();

      expect(analytics.insights).toBeInstanceOf(Array);
      expect(analytics.insights[0]).toHaveProperty('type');
      expect(analytics.insights[0]).toHaveProperty('message');
    });
  });

  describe('calculation methods', () => {
    test('should calculate success rate correctly', () => {
      const improvements = [
        { outcome: 'success' },
        { outcome: 'failed' },
        { outcome: 'success' },
        { outcome: 'pending' } // Should be excluded
      ];

      const rate = metricsTracker.calculateSuccessRate(improvements);

      expect(rate).toBe(66.66666666666666); // 2 of 3 completed
    });

    test('should calculate velocity trend', () => {
      const now = Date.now();
      const improvements = [
        { timestamp: new Date(now - 15 * 24 * 60 * 60 * 1000).toISOString() }, // 15 days ago
        { timestamp: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString() }, // 10 days ago (recent)
        { timestamp: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString() },  // 5 days ago (recent)
        { timestamp: new Date(now - 45 * 24 * 60 * 60 * 1000).toISOString() }  // 45 days ago (previous)
      ];

      const trend = metricsTracker.calculateVelocityTrend(improvements);

      expect(trend.current).toBe(2); // Last 30 days
      expect(trend.previous).toBe(1); // 30-60 days ago
      expect(trend.change).toBe('100.0'); // 100% increase
      expect(trend.direction).toBe('up');
    });

    test('should calculate average duration', () => {
      const improvements = [
        { duration_ms: 300000 }, // 5 minutes
        { duration_ms: 600000 }, // 10 minutes
        { outcome: 'pending' }   // No duration - excluded
      ];

      const avgDuration = metricsTracker.calculateAverageDuration(improvements);

      expect(avgDuration).toBe(450000); // 7.5 minutes
    });

    test('should calculate velocity per day', () => {
      const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const improvements = [
        { timestamp: new Date().toISOString() },
        { timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() } // Excluded
      ];

      const velocity = metricsTracker.calculateVelocity(improvements);

      expect(velocity).toBe(2 / 7); // 2 improvements over 7 days
    });

    test('should calculate average improvement score', () => {
      const improvements = [
        {
          outcome: 'success',
          measurements: {
            baseline: { overall_score: '7.0' },
            projected: { impact: 2 }
          }
        },
        {
          outcome: 'success',
          measurements: {
            baseline: { overall_score: '8.0' },
            projected: { impact: 1 }
          }
        },
        {
          outcome: 'failed', // Excluded
          measurements: {
            baseline: { overall_score: '6.0' }
          }
        }
      ];

      const avgScore = metricsTracker.calculateAverageImprovementScore(improvements);

      expect(avgScore).toBe('1.50'); // (2 + 1) / 2
    });
  });

  describe('helper methods', () => {
    test('should get period cutoff dates correctly', () => {
      const now = new Date('2023-01-15T12:00:00Z');
      jest.spyOn(Date, 'now').mockReturnValue(now.getTime());

      expect(metricsTracker.getPeriodCutoff('24h')).toEqual(
        new Date('2023-01-14T12:00:00Z')
      );
      expect(metricsTracker.getPeriodCutoff('7d')).toEqual(
        new Date('2023-01-08T12:00:00Z')
      );
      expect(metricsTracker.getPeriodCutoff('30d')).toEqual(
        new Date('2022-12-16T12:00:00Z')
      );
      expect(metricsTracker.getPeriodCutoff('invalid')).toEqual(
        new Date(0)
      );
    });

    test('should group improvements by outcome', () => {
      const improvements = [
        { outcome: 'success' },
        { outcome: 'success' },
        { outcome: 'failed' },
        { outcome: undefined } // Should be 'pending'
      ];

      const groups = metricsTracker.groupByOutcome(improvements);

      expect(groups.success).toBe(2);
      expect(groups.failed).toBe(1);
      expect(groups.pending).toBe(1);
    });

    test('should group improvements by category', () => {
      const improvements = [
        { plan: { target_areas: ['error_handling', 'performance'] } },
        { plan: { target_areas: ['error_handling'] } },
        { plan: undefined }
      ];

      const groups = metricsTracker.groupByCategory(improvements);

      expect(groups.error_handling).toBe(2);
      expect(groups.performance).toBe(1);
    });

    test('should group improvements by month', () => {
      const improvements = [
        { timestamp: '2023-01-15T10:00:00Z' },
        { timestamp: '2023-01-20T10:00:00Z' },
        { timestamp: '2023-02-10T10:00:00Z' }
      ];

      const groups = metricsTracker.groupByMonth(improvements);

      expect(groups['2023-01']).toBe(2);
      expect(groups['2023-02']).toBe(1);
    });

    test('should initialize aggregates correctly', () => {
      const aggregates = metricsTracker.initializeAggregates();

      expect(aggregates.total_improvements).toBe(0);
      expect(aggregates.successful_improvements).toBe(0);
      expect(aggregates.failed_improvements).toBe(0);
      expect(aggregates.success_rate).toBe(0);
      expect(aggregates.improvements_by_category).toEqual({});
      expect(aggregates.improvements_by_hour).toEqual({});
    });
  });

  describe('file operations', () => {
    test('should load metrics with fallback', async () => {
      fs.readFile.mockRejectedValue(new Error('File not found'));

      const metrics = await metricsTracker.loadMetrics();

      expect(metrics.version).toBe('1.0.0');
      expect(metrics.improvements).toEqual([]);
      expect(metrics.aggregates).toBeDefined();
    });

    test('should save metrics correctly', async () => {
      const mockMetrics = {
        version: '1.0.0',
        improvements: [],
        aggregates: {}
      };

      await metricsTracker.saveMetrics(mockMetrics);

      expect(fs.writeFile).toHaveBeenCalledWith(
        metricsFile,
        JSON.stringify(mockMetrics, null, 2)
      );
    });
  });
});