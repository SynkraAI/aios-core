/**
 * Mock stub for @anthropic-ai/sdk.
 * Used by Jest moduleNameMapper when the actual SDK is not installed.
 */
class Anthropic {
  messages = {
    create: jest.fn(),
  };

  constructor(_options: { apiKey: string }) {
    // No-op
  }
}

export default Anthropic;
