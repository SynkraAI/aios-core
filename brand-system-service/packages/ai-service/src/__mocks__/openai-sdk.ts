/**
 * Mock stub for openai SDK.
 * Used by Jest moduleNameMapper when the actual SDK is not installed.
 */
class OpenAI {
  chat = {
    completions: {
      create: jest.fn(),
    },
  };

  images = {
    generate: jest.fn(),
  };

  constructor(_options: { apiKey: string }) {
    // No-op
  }
}

export default OpenAI;
