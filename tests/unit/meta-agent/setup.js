/**
 * Test setup for meta-agent unit tests
 */

// Increase timeout for async operations
jest.setTimeout(10000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  // Keep error for debugging
  error: console.error
};

// Mock process.env
process.env.USER = 'test-user';
process.env.NODE_ENV = 'test';

// Global test helpers
global.testHelpers = {
  /**
   * Create a mock file system structure
   */
  mockFileSystem: (structure) => {
    const fs = require('fs-extra');
    
    fs.pathExists.mockImplementation(async (path) => {
      return structure[path] !== undefined;
    });
    
    fs.readFile.mockImplementation(async (path) => {
      if (structure[path]) {
        return structure[path];
      }
      throw new Error(`ENOENT: no such file or directory, open '${path}'`);
    });
    
    fs.readJson.mockImplementation(async (path) => {
      if (structure[path]) {
        return JSON.parse(structure[path]);
      }
      throw new Error(`ENOENT: no such file or directory, open '${path}'`);
    });
  },
  
  /**
   * Create a mock inquirer prompt sequence
   */
  mockPromptSequence: (answers) => {
    const inquirer = require('inquirer');
    let callIndex = 0;
    
    inquirer.prompt.mockImplementation(() => {
      if (callIndex < answers.length) {
        return Promise.resolve(answers[callIndex++]);
      }
      throw new Error('Unexpected prompt call');
    });
  },
  
  /**
   * Wait for all promises to resolve
   */
  flushPromises: () => new Promise(resolve => setImmediate(resolve)),
  
  /**
   * Mock a successful transaction
   */
  mockSuccessfulTransaction: () => ({
    id: 'txn-test-123',
    type: 'test',
    status: 'active',
    operations: [],
    startTime: new Date().toISOString(),
    user: 'test-user',
    metadata: {}
  })
};

// Clean up after each test
afterEach(() => {
  // Clear all module mocks
  jest.clearAllMocks();
  
  // Reset console mocks
  global.console.log.mockClear();
  global.console.info.mockClear();
  global.console.warn.mockClear();
});