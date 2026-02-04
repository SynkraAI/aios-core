/**
 * Jest Test Setup
 * Enterprise QA DevOps Squad
 */

// Set test environment variables
process.env.ATLASSIAN_DOMAIN = 'test.atlassian.net';
process.env.ATLASSIAN_EMAIL = 'test@example.com';
process.env.ATLASSIAN_API_TOKEN = 'test-token-123';
process.env.XRAY_CLIENT_ID = 'xray-client-id';
process.env.XRAY_CLIENT_SECRET = 'xray-client-secret';
process.env.MS365_CLIENT_ID = 'ms365-client-id';
process.env.MS365_CLIENT_SECRET = 'ms365-client-secret';
process.env.MS365_TENANT_ID = 'ms365-tenant-id';

// Global test timeout
jest.setTimeout(10000);

// Suppress console during tests (optional - uncomment if needed)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
// };
