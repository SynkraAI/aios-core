/**
 * Integration Test Helpers
 * FinHealth Squad — Real LLM Testing Setup
 *
 * Provides environment detection, skip logic, and shared runtime factory.
 */

import { AgentRuntime, createRuntime } from '../../../src/runtime/agent-runtime';
import * as path from 'path';
import { config } from 'dotenv';

// Load .env from squad root
config({ path: path.resolve(__dirname, '../../../.env') });

/**
 * Returns the OpenAI API key from environment, or undefined.
 */
export function getOpenAIKey(): string | undefined {
  return process.env.OPENAI_API_KEY;
}

/**
 * True when OPENAI_API_KEY is not set — use with describe.skipIf(shouldSkip).
 */
export const shouldSkip = !getOpenAIKey();

/**
 * Squad root path (for agent .md file loading).
 */
export function getSquadPath(): string {
  return path.resolve(__dirname, '../../..');
}

/**
 * Create a real, initialized AgentRuntime that makes actual OpenAI API calls.
 * Uses the real agent .md files on disk.
 */
export async function createTestRuntime(): Promise<AgentRuntime> {
  return createRuntime({
    squadPath: getSquadPath(),
    openaiApiKey: getOpenAIKey(),
    model: 'gpt-4o-mini',
    verbose: false,
  });
}
