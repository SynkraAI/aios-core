/**
 * Unit tests for BatchPipeline and BatchJobManager (BSS-4.6).
 *
 * Strategy: All external dependencies (TemplateEngine, CarouselEngine,
 * CopyGenerationPipeline, R2 upload) are mocked via DI constructor params.
 * No direct imports of external packages.
 */

import type {
  TokenSet,
  SocialContent,
  BatchBrief,
  PostSpec,
  CarouselBrief,
} from '../types';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('@bss/core', () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

// Mock TEMPLATE_REGISTRY with test entries
const mockComponent = jest.fn().mockReturnValue(null);
const mockRegistryGet = jest.fn();

jest.mock('../templates/index', () => ({
  TEMPLATE_REGISTRY: {
    get: (...args: unknown[]) => mockRegistryGet(...args),
  },
}));

// Mock TemplateEngine
const mockRender = jest.fn<Promise<Buffer>, [unknown]>();
jest.mock('../template-engine', () => ({
  TemplateEngine: jest.fn().mockImplementation(() => ({
    render: mockRender,
  })),
}));

// Mock CarouselEngine
const mockCarouselGenerate = jest.fn();
jest.mock('../carousel-engine', () => ({
  CarouselEngine: jest.fn().mockImplementation(() => ({
    generate: mockCarouselGenerate,
  })),
}));

// Import after mocks
import { BatchPipeline, resetBatchSequence } from '../batch-pipeline';
import { submitJob, getJobStatus, resetJobStore } from '../batch-job-manager';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function createTestTokens(): TokenSet {
  return {
    color: {
      primary: { $value: '#1a1a2e', $type: 'color' },
      secondary: { $value: '#e94560', $type: 'color' },
    },
    typography: {
      heading: {
        fontFamily: { $value: 'TestFont', $type: 'fontFamily' },
        fontSize: { $value: 32, $type: 'dimension' },
      },
    },
  };
}

function createTestContent(overrides?: Partial<SocialContent>): SocialContent {
  return {
    headline: 'Test Headline',
    body: 'Test body text for the post.',
    logoUrl: 'https://example.com/logo.png',
    variant: 'quote',
    ...overrides,
  };
}

function createTestPost(overrides?: Partial<PostSpec>): PostSpec {
  return {
    platform: 'instagram',
    format: 'feed-square',
    variant: 'quote',
    content: createTestContent(),
    ...overrides,
  };
}

function createTestBrief(overrides?: Partial<BatchBrief>): BatchBrief {
  return {
    clientId: 'test-client',
    tokens: createTestTokens(),
    posts: [createTestPost(), createTestPost({ variant: 'tip', content: createTestContent({ variant: 'tip' }) })],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('BatchPipeline', () => {
  let pipeline: BatchPipeline;

  beforeEach(() => {
    jest.clearAllMocks();
    resetBatchSequence();

    // Default mock: registry returns a template entry
    mockRegistryGet.mockImplementation((key: string) => {
      if (key.includes(':')) {
        return {
          component: mockComponent,
          spec: { platform: 'instagram', width: 1080, height: 1080, format: 'png' as const },
        };
      }
      return undefined;
    });

    // Default mock: render returns a Buffer
    mockRender.mockResolvedValue(Buffer.alloc(1024));

    pipeline = new BatchPipeline();
  });

  describe('Happy path', () => {
    it('should process a 2-post batch and return 2 assets', async () => {
      const brief = createTestBrief();

      const result = await pipeline.run(brief);

      expect(result.assetUrls).toHaveLength(0); // No R2 client → empty URLs
      expect(result.failures).toHaveLength(0);
      expect(result.report.successCount).toBe(2);
      expect(result.report.failureCount).toBe(0);
      expect(result.report.totalPosts).toBe(2);
      expect(mockRender).toHaveBeenCalledTimes(2);
    });

    it('should generate batchId in b-YYYYMMDD-NNN format', async () => {
      const brief = createTestBrief({ posts: [createTestPost()] });

      const result = await pipeline.run(brief);

      expect(result.batchId).toMatch(/^b-\d{8}-\d{3}$/);
    });

    it('should include all required fields in BatchReport', async () => {
      const brief = createTestBrief({ posts: [createTestPost()] });

      const result = await pipeline.run(brief);
      const { report } = result;

      expect(report).toHaveProperty('batchId');
      expect(report).toHaveProperty('clientId', 'test-client');
      expect(report).toHaveProperty('startedAt');
      expect(report).toHaveProperty('completedAt');
      expect(report).toHaveProperty('totalPosts', 1);
      expect(report).toHaveProperty('successCount');
      expect(report).toHaveProperty('failureCount');
      expect(report).toHaveProperty('totalCostUsd');
      expect(report).toHaveProperty('assetUrls');
      expect(report).toHaveProperty('failures');
      // Timestamps should be ISO strings
      expect(new Date(report.startedAt).toISOString()).toBe(report.startedAt);
      expect(new Date(report.completedAt).toISOString()).toBe(report.completedAt);
    });
  });

  describe('AI skip', () => {
    it('should skip AI when content has headline and body pre-filled', async () => {
      const mockCopyPipeline = {
        generate: jest.fn().mockResolvedValue({ headline: 'AI Headline', body: 'AI Body' }),
      };

      const pipelineWithAI = new BatchPipeline({ copyPipeline: mockCopyPipeline });

      const brief = createTestBrief({
        posts: [
          createTestPost({
            content: createTestContent({ headline: 'Pre-filled', body: 'Already here' }),
          }),
        ],
      });

      await pipelineWithAI.run(brief);

      expect(mockCopyPipeline.generate).not.toHaveBeenCalled();
    });

    it('should call AI when content is missing headline', async () => {
      const mockCopyPipeline = {
        generate: jest.fn().mockResolvedValue({ headline: 'AI Headline', body: 'AI Body', costUsd: 0.01 }),
      };

      const pipelineWithAI = new BatchPipeline({ copyPipeline: mockCopyPipeline });

      const contentWithoutHeadline = createTestContent({ headline: '' });
      const brief = createTestBrief({
        posts: [createTestPost({ content: contentWithoutHeadline })],
      });

      await pipelineWithAI.run(brief);

      expect(mockCopyPipeline.generate).toHaveBeenCalledTimes(1);
    });
  });

  describe('Failure isolation', () => {
    it('should continue batch when one post fails, recording the failure', async () => {
      // First render succeeds, second throws
      mockRender
        .mockResolvedValueOnce(Buffer.alloc(1024))
        .mockRejectedValueOnce(new Error('Render explosion'));

      const brief = createTestBrief();

      const result = await pipeline.run(brief);

      expect(result.failures).toHaveLength(1);
      expect(result.failures[0].postIndex).toBe(1);
      expect(result.failures[0].error).toBe('Render explosion');
      expect(result.report.failureCount).toBe(1);
      // The successful post should still be counted
      expect(result.report.successCount).toBe(1);
      expect(result.report.totalPosts).toBe(2);
    });
  });

  describe('R2 upload', () => {
    it('should call uploadAsset for each successful post when R2 is configured', async () => {
      const mockUpload = jest.fn().mockResolvedValue({
        key: 'test-client/batch/b-20260318-001/instagram/feed-square-quote-0.png',
        bucket: 'test-bucket',
        size: 1024,
      });

      const pipelineWithR2 = new BatchPipeline({
        r2Client: {},
        r2Bucket: 'test-bucket',
        uploadAsset: mockUpload,
      });

      const brief = createTestBrief({ posts: [createTestPost()] });

      const result = await pipelineWithR2.run(brief);

      expect(mockUpload).toHaveBeenCalledTimes(2); // 1 asset + 1 report
      expect(result.assetUrls).toHaveLength(1);
    });
  });

  describe('Carousel posts', () => {
    it('should use CarouselEngine for posts with carousel brief', async () => {
      const carouselBrief: CarouselBrief = {
        clientId: 'test-client',
        tokens: createTestTokens(),
        slides: [
          { type: 'cover', content: createTestContent() },
          { type: 'content', content: createTestContent() },
        ],
        platform: 'instagram',
      };

      mockCarouselGenerate.mockResolvedValue({
        buffers: [Buffer.alloc(1024)],
        slideCount: 2,
        platform: 'instagram',
        dimensions: { width: 1080, height: 1350 },
      });

      const brief = createTestBrief({
        posts: [
          createTestPost({ carousel: carouselBrief }),
        ],
      });

      const result = await pipeline.run(brief);

      expect(mockCarouselGenerate).toHaveBeenCalledTimes(1);
      expect(result.failures).toHaveLength(0);
    });
  });

  describe('Batch ID sequence', () => {
    it('should increment batch IDs across multiple runs', async () => {
      const brief = createTestBrief({ posts: [createTestPost()] });

      const result1 = await pipeline.run(brief);
      const result2 = await pipeline.run(brief);

      expect(result1.batchId).toMatch(/-001$/);
      expect(result2.batchId).toMatch(/-002$/);
    });
  });
});

describe('BatchJobManager', () => {
  beforeEach(() => {
    resetJobStore();
    resetBatchSequence();
    jest.clearAllMocks();

    mockRegistryGet.mockImplementation((key: string) => {
      if (key.includes(':')) {
        return {
          component: mockComponent,
          spec: { platform: 'instagram', width: 1080, height: 1080, format: 'png' as const },
        };
      }
      return undefined;
    });
    mockRender.mockResolvedValue(Buffer.alloc(1024));
  });

  it('should return a jobId from submitJob', () => {
    const pipeline = new BatchPipeline();
    const brief = createTestBrief({ posts: [createTestPost()] });

    const jobId = submitJob(brief, pipeline);

    expect(jobId).toBeDefined();
    expect(typeof jobId).toBe('string');
    expect(jobId).toMatch(/^job-\d+-\d{3}$/);
  });

  it('should return job status after submission', () => {
    const pipeline = new BatchPipeline();
    const brief = createTestBrief({ posts: [createTestPost()] });

    const jobId = submitJob(brief, pipeline);
    const status = getJobStatus(jobId);

    expect(status).toBeDefined();
    // Status should be queued or running (async start)
    expect(['queued', 'running']).toContain(status?.status);
  });

  it('should return undefined for unknown jobId', () => {
    const status = getJobStatus('nonexistent-job');
    expect(status).toBeUndefined();
  });

  it('should complete job with done status', async () => {
    const pipeline = new BatchPipeline();
    const brief = createTestBrief({ posts: [createTestPost()] });

    const jobId = submitJob(brief, pipeline);

    // Wait for async completion
    await new Promise((resolve) => setTimeout(resolve, 100));

    const status = getJobStatus(jobId);
    expect(status?.status).toBe('done');
    expect(status?.progress).toBe(100);
    expect(status?.result).toBeDefined();
    expect(status?.result?.batchId).toMatch(/^b-\d{8}-\d{3}$/);
  });
});
