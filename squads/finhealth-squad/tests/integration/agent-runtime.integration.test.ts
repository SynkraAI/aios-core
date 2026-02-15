/**
 * Integration Tests: AgentRuntime with Real LLM
 * FinHealth Squad — Real OpenAI API Calls
 *
 * These tests make actual API calls to OpenAI gpt-4o-mini.
 * Skipped automatically when OPENAI_API_KEY is not set.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { shouldSkip, createTestRuntime, getSquadPath } from './helpers/setup';
import { AgentRuntime } from '../../src/runtime/agent-runtime';

describe.skipIf(shouldSkip)('AgentRuntime Integration [LIVE LLM]', () => {
  let runtime: AgentRuntime;

  beforeAll(async () => {
    runtime = await createTestRuntime();
  });

  // ========================================================================
  // Initialization with real agent files
  // ========================================================================

  describe('initialization', () => {
    it('should initialize with real agent definitions from disk', () => {
      const agents = runtime.listAgents();
      expect(agents.length).toBeGreaterThanOrEqual(1);
      expect(agents).toContain('billing-agent');
    });

    it('should list all expected agent IDs', () => {
      const agents = runtime.listAgents();
      expect(agents).toContain('billing-agent');
      expect(agents).toContain('auditor-agent');
      expect(agents).toContain('cashflow-agent');
    });

    it('should load agent definitions with name and role', () => {
      const agent = runtime.getAgent('billing-agent');
      expect(agent).toBeDefined();
      expect(agent!.name).toBeTruthy();
      expect(agent!.role).toBeTruthy();
      // Capabilities may be empty if the .md parser doesn't extract YAML-embedded lists
      expect(Array.isArray(agent!.capabilities)).toBe(true);
    });
  });

  // ========================================================================
  // Real LLM execution
  // ========================================================================

  describe('executeTask with real LLM', () => {
    it('should connect to OpenAI and receive a valid response', async () => {
      const result = await runtime.executeTask({
        agentId: 'billing-agent',
        taskName: 'analyze',
        parameters: { message: 'Respond with a simple JSON acknowledgment' },
      });

      expect(result.success).toBe(true);
      expect(result.output).toBeDefined();
      expect(typeof result.output).toBe('object');
    });

    it('should return valid JSON via response_format json_object', async () => {
      const result = await runtime.executeTask({
        agentId: 'billing-agent',
        taskName: 'test-json-mode',
        parameters: { test: true },
      });

      // If we got here without error, JSON parsing succeeded in the runtime
      expect(result.success).toBe(true);
      expect(result.output).not.toBeNull();
      // Output should be a parsed JSON object, not a string
      expect(typeof result.output).toBe('object');
    });

    it('should populate metadata with model, tokens, and duration', async () => {
      const result = await runtime.executeTask({
        agentId: 'billing-agent',
        taskName: 'ping',
        parameters: { message: 'hello' },
      });

      expect(result.metadata).toBeDefined();
      expect(result.metadata!.model).toBe('gpt-4o-mini');
      expect(result.metadata!.tokensUsed).toBeGreaterThan(0);
      expect(result.metadata!.duration).toBeGreaterThan(0);
      expect(result.metadata!.agent).toBe('billing-agent');
      expect(result.metadata!.task).toBe('ping');
    });

    it('should return output with expected JSON structure', async () => {
      const result = await runtime.executeTask({
        agentId: 'billing-agent',
        taskName: 'validate-structure',
        parameters: { data: 'test' },
      });

      // LLM may return success:false for vague inputs — we only care about structure
      expect(result.output).toBeDefined();
      expect(typeof result.output).toBe('object');
      // System prompt asks for: success, data, analysis, recommendations, warnings, errors
      // LLM should include at least some of these keys
      const outputKeys = Object.keys(result.output || {});
      const expectedKeys = ['success', 'data', 'analysis', 'recommendations', 'warnings', 'errors'];
      const hasAtLeastOneExpectedKey = expectedKeys.some((k) => outputKeys.includes(k));
      expect(hasAtLeastOneExpectedKey).toBe(true);
    });
  });

  // ========================================================================
  // Error handling
  // ========================================================================

  describe('error handling', () => {
    it('should return error for nonexistent agent without API call', async () => {
      const result = await runtime.executeTask({
        agentId: 'nonexistent-agent',
        taskName: 'test',
        parameters: {},
      });

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors![0]).toContain('Agent not found');
    });

    it('should handle invalid API key gracefully', async () => {
      const badRuntime = new AgentRuntime({
        squadPath: getSquadPath(),
        openaiApiKey: 'sk-invalid-key-for-testing-12345',
        model: 'gpt-4o-mini',
      });
      await badRuntime.initialize();

      const result = await badRuntime.executeTask({
        agentId: 'billing-agent',
        taskName: 'test',
        parameters: {},
      });

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });
  });
});
