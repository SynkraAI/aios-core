/**
 * Mock stub for replicate SDK.
 * Used by Jest moduleNameMapper when the actual SDK is not installed.
 */
class Replicate {
  run = jest.fn();

  constructor(_options: { auth: string }) {
    // No-op
  }
}

export default Replicate;
