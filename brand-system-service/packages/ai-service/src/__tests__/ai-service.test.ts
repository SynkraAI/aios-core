/**
 * Unit tests for AIService orchestrator.
 *
 * Tests cover (AC 9):
 * - Successful text call routing to Claude
 * - Successful image call routing to Flux
 * - Retry on 429 (3 attempts)
 * - Fallback when primary provider exhausted
 * - Model version pinned through to SDK call
 * - Credentials not in logs
 */

import { AIService } from '../ai-service';
import { AIServiceError } from '../errors';
import * as claudeProvider from '../providers/claude';
import * as openaiTextProvider from '../providers/openai-text';
import * as fluxProvider from '../providers/flux';
import * as openaiImageProvider from '../providers/openai-image';
import * as retryModule from '../retry';

import type { AITextResponse, AIImageResponse } from '../types';

// Mock providers
jest.mock('../providers/claude');
jest.mock('../providers/openai-text');
jest.mock('../providers/flux');
jest.mock('../providers/openai-image');

// Mock retry to execute immediately (no actual delays)
jest.mock('../retry', () => {
  const original = jest.requireActual('../retry') as typeof retryModule;
  return {
    ...original,
    withRetry: jest.fn(async <T>(fn: () => Promise<T>) => {
      // Simulate retry logic without delays
      const maxRetries = 3;
      let lastError: unknown;
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          return await fn();
        } catch (error) {
          lastError = error;
          if (
            error instanceof
              (jest.requireActual('../errors') as typeof import('../errors')).AIServiceError &&
            !(error as AIServiceError).retryable
          ) {
            throw error;
          }
          if (attempt >= maxRetries) throw error;
        }
      }
      throw lastError;
    }),
  };
});

const mockClaudeText = claudeProvider.generateTextWithClaude as jest.MockedFunction<
  typeof claudeProvider.generateTextWithClaude
>;
const mockOpenAIText = openaiTextProvider.generateTextWithOpenAI as jest.MockedFunction<
  typeof openaiTextProvider.generateTextWithOpenAI
>;
const mockFluxImage = fluxProvider.generateImageWithFlux as jest.MockedFunction<
  typeof fluxProvider.generateImageWithFlux
>;
const mockDalleImage = openaiImageProvider.generateImageWithDalle as jest.MockedFunction<
  typeof openaiImageProvider.generateImageWithDalle
>;

describe('AIService', () => {
  let service: AIService;
  let consoleLogSpy: jest.SpyInstance;

  const mockTextResponse: AITextResponse = {
    text: 'Generated text content',
    provider: 'claude',
    model: 'claude-sonnet-4-20250514',
    inputTokens: 100,
    outputTokens: 200,
    costUsd: 0.0033,
    latencyMs: 450,
  };

  const mockImageResponse: AIImageResponse = {
    imageUrl: 'https://replicate.delivery/image.png',
    provider: 'replicate',
    model: 'black-forest-labs/flux-1.1-pro',
    costUsd: 0.04,
    latencyMs: 3200,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AIService();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe('generateText', () => {
    it('should route text calls to Claude as primary provider', async () => {
      mockClaudeText.mockResolvedValue(mockTextResponse);

      const result = await service.generateText({
        prompt: 'Hello world',
        clientId: 'test-client',
      });

      expect(result.provider).toBe('claude');
      expect(result.text).toBe('Generated text content');
      expect(mockClaudeText).toHaveBeenCalledTimes(1);
      expect(mockOpenAIText).not.toHaveBeenCalled();
    });

    it('should fall back to OpenAI when Claude fails all retries', async () => {
      const retryableError = new AIServiceError('Rate limited', 'claude', 429, true);
      mockClaudeText.mockRejectedValue(retryableError);

      const openaiResponse: AITextResponse = {
        ...mockTextResponse,
        provider: 'openai',
        model: 'gpt-4o',
      };
      mockOpenAIText.mockResolvedValue(openaiResponse);

      const result = await service.generateText({
        prompt: 'Hello world',
        clientId: 'test-client',
      });

      expect(result.provider).toBe('openai');
      expect(mockOpenAIText).toHaveBeenCalledTimes(1);
    });

    it('should pass model version through to the SDK without modification (AC 4)', async () => {
      const customModel = 'claude-opus-4-5';
      mockClaudeText.mockResolvedValue({
        ...mockTextResponse,
        model: customModel,
      });

      await service.generateText({
        prompt: 'Test',
        modelVersion: customModel,
        clientId: 'test-client',
      });

      expect(mockClaudeText).toHaveBeenCalledWith(
        expect.objectContaining({ modelVersion: customModel }),
      );
    });

    it('should throw when all providers fail', async () => {
      const claudeError = new AIServiceError('Claude down', 'claude', 500, true);
      const openaiError = new AIServiceError('OpenAI down', 'openai', 500, true);
      mockClaudeText.mockRejectedValue(claudeError);
      mockOpenAIText.mockRejectedValue(openaiError);

      await expect(
        service.generateText({ prompt: 'Test', clientId: 'test-client' }),
      ).rejects.toThrow('OpenAI down');
    });
  });

  describe('generateImage', () => {
    it('should route image calls to Flux as primary provider', async () => {
      mockFluxImage.mockResolvedValue(mockImageResponse);

      const result = await service.generateImage({
        prompt: 'A beautiful landscape',
        clientId: 'test-client',
      });

      expect(result.provider).toBe('replicate');
      expect(result.imageUrl).toBe('https://replicate.delivery/image.png');
      expect(mockFluxImage).toHaveBeenCalledTimes(1);
      expect(mockDalleImage).not.toHaveBeenCalled();
    });

    it('should fall back to DALL-E when Flux fails all retries', async () => {
      const fluxError = new AIServiceError('Flux down', 'replicate', 500, true);
      mockFluxImage.mockRejectedValue(fluxError);

      const dalleResponse: AIImageResponse = {
        ...mockImageResponse,
        provider: 'dalle',
        model: 'dall-e-3',
        imageUrl: 'https://oaidalleapiprodscus.blob.core.windows.net/image.png',
      };
      mockDalleImage.mockResolvedValue(dalleResponse);

      const result = await service.generateImage({
        prompt: 'A beautiful landscape',
        clientId: 'test-client',
      });

      expect(result.provider).toBe('dalle');
      expect(mockDalleImage).toHaveBeenCalledTimes(1);
    });
  });

  describe('retry behavior', () => {
    it('should retry on 429 status code up to 3 times', async () => {
      const rateLimitError = new AIServiceError('Rate limited', 'claude', 429, true);

      // First 3 calls fail (retries inside withRetry), 4th succeeds
      let callCount = 0;
      mockClaudeText.mockImplementation(async () => {
        callCount++;
        if (callCount <= 3) throw rateLimitError;
        return mockTextResponse;
      });

      const result = await service.generateText({
        prompt: 'Test retry',
        clientId: 'test-client',
      });

      // withRetry mock retries up to 3 times (4 total attempts)
      expect(result.text).toBe('Generated text content');
      expect(callCount).toBe(4);
    });

    it('should not retry on non-retryable 4xx errors', async () => {
      const badRequestError = new AIServiceError('Bad request', 'claude', 400, false);
      mockClaudeText.mockRejectedValue(badRequestError);

      // Should fall through to OpenAI since Claude threw non-retryable
      const openaiResponse: AITextResponse = {
        ...mockTextResponse,
        provider: 'openai',
        model: 'gpt-4o',
      };
      mockOpenAIText.mockResolvedValue(openaiResponse);

      const result = await service.generateText({
        prompt: 'Test',
        clientId: 'test-client',
      });

      // Non-retryable error causes immediate fallback
      expect(result.provider).toBe('openai');
    });
  });

  describe('structured logging', () => {
    it('should never include credentials in log output', async () => {
      // Set env vars to verify they are not logged
      process.env['ANTHROPIC_API_KEY'] = 'sk-ant-secret-key-12345';
      process.env['OPENAI_API_KEY'] = 'sk-openai-secret-12345';
      process.env['REPLICATE_API_TOKEN'] = 'r8_replicate_secret_token';

      mockClaudeText.mockResolvedValue(mockTextResponse);

      await service.generateText({
        prompt: 'Test credentials',
        clientId: 'test-client',
      });

      // Check all console.log calls for credential leaks
      for (const call of consoleLogSpy.mock.calls) {
        const logOutput = typeof call[0] === 'string' ? call[0] : JSON.stringify(call[0]);
        expect(logOutput).not.toContain('sk-ant-secret-key-12345');
        expect(logOutput).not.toContain('sk-openai-secret-12345');
        expect(logOutput).not.toContain('r8_replicate_secret_token');
        expect(logOutput).not.toContain('ANTHROPIC_API_KEY');
        expect(logOutput).not.toContain('OPENAI_API_KEY');
        expect(logOutput).not.toContain('REPLICATE_API_TOKEN');
      }

      // Cleanup
      delete process.env['ANTHROPIC_API_KEY'];
      delete process.env['OPENAI_API_KEY'];
      delete process.env['REPLICATE_API_TOKEN'];
    });

    it('should emit structured log entry with all required fields', async () => {
      mockClaudeText.mockResolvedValue(mockTextResponse);

      await service.generateText({
        prompt: 'Test logging',
        clientId: 'my-client',
      });

      expect(consoleLogSpy).toHaveBeenCalled();
      const logCall = consoleLogSpy.mock.calls.find((call: unknown[]) => {
        const str = String(call[0]);
        return str.includes('AI API call');
      });

      expect(logCall).toBeDefined();
      const parsed = JSON.parse(logCall![0] as string);
      expect(parsed.data).toMatchObject({
        clientId: 'my-client',
        provider: 'claude',
        model: 'claude-sonnet-4-20250514',
        success: true,
      });
      expect(parsed.data.timestamp).toBeDefined();
      expect(parsed.data.inputTokens).toBe(100);
      expect(parsed.data.outputTokens).toBe(200);
      expect(parsed.data.costUsd).toBe(0.0033);
      expect(parsed.data.latencyMs).toBe(450);
    });
  });
});
