/**
 * Ambient type declarations for replicate SDK.
 * These are used when the SDK is not installed (dev/CI).
 */
declare module 'replicate' {
  class Replicate {
    constructor(options: { auth: string });
    run(
      model: `${string}/${string}`,
      options: { input: Record<string, unknown> },
    ): Promise<unknown>;
  }

  export default Replicate;
}
