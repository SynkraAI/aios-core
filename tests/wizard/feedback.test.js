/**
 * Feedback Helpers Test Suite
 * 
 * Tests visual feedback components (spinners, progress bars, status messages)
 */

const {
  createSpinner,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showTip,
  createProgressBar,
  updateProgress,
  completeProgress,
  showWelcome,
  showCompletion,
  showSection,
  showCancellation,
  estimateTimeRemaining,
} = require('../../packages/installer/src/wizard/feedback');

// Mock ora and cli-progress
jest.mock('ora');
jest.mock('cli-progress');

// Mock console methods
const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;

beforeEach(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterEach(() => {
  console.log = originalLog;
  console.warn = originalWarn;
  console.error = originalError;
  jest.clearAllMocks();
});

describe('feedback', () => {
  describe('createSpinner', () => {
    test('creates spinner with text', () => {
      const ora = require('ora');
      ora.mockReturnValue({ start: jest.fn(), stop: jest.fn() });
      
      createSpinner('Loading...');

      expect(ora).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Loading...',
          color: 'cyan',
          spinner: 'dots',
        }),
      );
    });

    test('accepts custom options', () => {
      const ora = require('ora');
      ora.mockReturnValue({ start: jest.fn(), stop: jest.fn() });
      
      createSpinner('Loading...', { color: 'red' });

      expect(ora).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Loading...',
          color: 'red',
        }),
      );
    });
  });

  describe('Status Messages', () => {
    test('showSuccess displays success message', () => {
      showSuccess('Task complete');
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Task complete'));
    });

    test('showError displays error message', () => {
      showError('Task failed');
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Task failed'));
    });

    test('showWarning displays warning message', () => {
      showWarning('Be careful');
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Be careful'));
    });

    test('showInfo displays info message', () => {
      showInfo('Helpful information');
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Helpful information'));
    });

    test('showTip displays tip message', () => {
      showTip('Pro tip');
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Pro tip'));
    });
  });

  describe('Progress Bar', () => {
    test('createProgressBar initializes with total', () => {
      const cliProgress = require('cli-progress');
      const mockBar = {
        start: jest.fn(),
        update: jest.fn(),
        stop: jest.fn(),
      };
      cliProgress.SingleBar.mockImplementation(() => mockBar);

      createProgressBar(10);

      expect(mockBar.start).toHaveBeenCalledWith(10, 0, { task: 'Initializing...' });
    });

    test('updateProgress updates bar with task name', () => {
      const mockBar = {
        start: jest.fn(),
        update: jest.fn(),
        stop: jest.fn(),
      };

      updateProgress(mockBar, 5, 'Processing...');

      expect(mockBar.update).toHaveBeenCalledWith(5, { task: 'Processing...' });
    });

    test('completeProgress stops bar', () => {
      const mockBar = {
        start: jest.fn(),
        update: jest.fn(),
        stop: jest.fn(),
      };

      completeProgress(mockBar);

      expect(mockBar.stop).toHaveBeenCalled();
    });
  });

  describe('Welcome and Completion', () => {
    test('showWelcome displays welcome message', () => {
      showWelcome();
      expect(console.log).toHaveBeenCalled();
      // Check that multiple lines were logged (heading + info)
      expect(console.log.mock.calls.length).toBeGreaterThan(1);
    });

    test('showCompletion displays completion message', () => {
      showCompletion();
      expect(console.log).toHaveBeenCalled();
      expect(console.log.mock.calls.length).toBeGreaterThan(1);
    });

    test('showSection displays section header', () => {
      showSection('Configuration');
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Configuration'));
    });

    test('showCancellation displays cancellation message', () => {
      showCancellation();
      expect(console.log).toHaveBeenCalled();
      expect(console.log.mock.calls.some(call => 
        call[0].includes('cancelled'),
      )).toBe(true);
    });
  });

  describe('estimateTimeRemaining', () => {
    test('returns "Calculating..." for first step', () => {
      const estimate = estimateTimeRemaining(0, 10, Date.now());
      expect(estimate).toBe('Calculating...');
    });

    test('estimates seconds for short tasks', () => {
      const startTime = Date.now() - 5000; // 5 seconds ago
      const estimate = estimateTimeRemaining(5, 10, startTime);
      expect(estimate).toMatch(/~\d+s remaining/);
    });

    test('estimates minutes for long tasks', () => {
      const startTime = Date.now() - 120000; // 2 minutes ago
      const estimate = estimateTimeRemaining(2, 10, startTime);
      expect(estimate).toMatch(/~\d+m remaining/);
    });

    test('handles edge case of last step', () => {
      const startTime = Date.now() - 10000;
      const estimate = estimateTimeRemaining(10, 10, startTime);
      expect(estimate).toBe('~0s remaining');
    });
  });
});

