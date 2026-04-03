/**
 * @file error-registry.test.js
 * @description Unit tests for the ErrorRegistry module.
 */

const fs = require('fs');
const path = require('path');
const ErrorRegistry = require('../../.aiox-core/monitor/error-registry');
const AIOXError = require('../../.aiox-core/utils/aiox-error');

describe('ErrorRegistry', () => {
  const logDir = path.join(process.cwd(), '.aiox', 'logs');
  const logFile = path.join(logDir, 'errors.json');

  beforeEach(() => {
    // Clear logs before each test if they exist
    if (fs.existsSync(logFile)) {
      fs.writeFileSync(logFile, JSON.stringify([], null, 2), 'utf8');
    }
  });

  afterAll(() => {
    // Cleanup is optional for local dev, but good practice
  });

  test('should initialize log directory and file', () => {
    // Trigger initialization by calling a method
    ErrorRegistry.getRecentErrors();
    
    expect(fs.existsSync(logDir)).toBe(true);
    expect(fs.existsSync(logFile)).toBe(true);
  });

  test('should log a string message as an OPERATIONAL error', () => {
    const message = 'Test simple message';
    const logged = ErrorRegistry.log(message);

    expect(logged).toBeInstanceOf(AIOXError);
    expect(logged.message).toBe(message);
    expect(logged.category).toBe('OPERATIONAL');

    const recent = ErrorRegistry.getRecentErrors(1);
    expect(recent[0].message).toBe(message);
    expect(recent[0].category).toBe('OPERATIONAL');
  });

  test('should log a native Error as a SYSTEM error', () => {
    const error = new Error('Native failure');
    const logged = ErrorRegistry.log(error);

    expect(logged.category).toBe('SYSTEM');
    expect(logged.message).toBe(error.message);
    
    const recent = ErrorRegistry.getRecentErrors(1);
    expect(recent[0].category).toBe('SYSTEM');
  });

  test('should respect silent mode when logging', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    ErrorRegistry.log('Silent error', { silent: true });
    expect(spy).not.toHaveBeenCalled();

    ErrorRegistry.log('Noisy error', { silent: false });
    expect(spy).toHaveBeenCalled();

    spy.mockRestore();
  });

  test('should limit log size to 500 entries', () => {
    // Force many logs
    for (let i = 0; i < 510; i++) {
      ErrorRegistry.log(`Error ${i}`, { silent: true });
    }

    const recent = ErrorRegistry.getRecentErrors(1000); // Try to get all
    expect(recent.length).toBeLessThanOrEqual(500);
  });
});
