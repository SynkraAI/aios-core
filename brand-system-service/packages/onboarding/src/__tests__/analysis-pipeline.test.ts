/**
 * Tests for AI Analysis Pipeline (BSS-7.6).
 *
 * Covers all 10 acceptance criteria with mocked AI service,
 * R2 client, ClickUp client, and screenshot provider.
 */

import { AnalysisPipeline } from '../analysis/analysis-pipeline';
import { CompetitorAnalyzer, containsLogoTerms } from '../analysis/competitor-analyzer';
import { ColorGenerator } from '../analysis/color-generator';
import { TypographyGenerator } from '../analysis/typography-generator';
import { MoodboardGenerator } from '../analysis/moodboard-generator';
import { VoiceGenerator } from '../analysis/voice-generator';
import { TokenDraftGenerator } from '../analysis/token-draft-generator';
import { ANALYSIS_PHASES } from '../analysis/analysis-types';
import type {
  AnalysisPipelineConfig,
  AnalysisPipelineDeps,
  PipelineProgressEvent,
  ScreenshotProvider,
  AITextProvider,
  AIVisionProvider,
  AIImageProvider,
  AnalysisR2Client,
  AnalysisClickUpClient,
} from '../analysis/analysis-types';
import type { IntakeFormData, BrandPersonality, MoodTile } from '../types';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

function createMockIntakeData(): IntakeFormData {
  return {
    companyBasics: {
      companyName: 'TestCorp',
      industry: 'Technology',
      targetAudience: 'Developers and tech professionals',
      tagline: 'Build the future',
      foundingYear: 2020,
    },
    brandPersonality: {
      formalCasual: 3,
      traditionalInnovative: 4,
      seriousPlayful: 2,
      minimalExpressive: 3,
      localGlobal: 5,
    },
    visualPreferences: {
      selectedMoodIds: ['bold-modern', 'clean-minimal'],
    },
    assetUpload: {
      primaryLogo: {
        filename: 'logo.svg',
        mimeType: 'image/svg+xml',
        sizeBytes: 5000,
        r2Key: 'brand-assets/test-client/onboarding/logo.svg',
      },
      brandColors: ['#1A2B3C', '#FF5733'],
      fontNames: ['Inter', 'Playfair Display'],
    },
    competitorUrls: {
      urls: [
        { url: 'https://competitor1.com', notes: 'Main competitor' },
        { url: 'https://competitor2.com' },
        { url: 'https://inaccessible.example.com' },
      ],
    },
    deliverableSelection: {
      selected: ['brand-book', 'design-tokens', 'social-media-templates'],
    },
  };
}

function createMockColorPaletteResponse(): string {
  return JSON.stringify({
    colors: [
      { role: 'primary', hex: '#1A73E8', rgb: { r: 26, g: 115, b: 232 }, hsl: { h: 214, s: 83, l: 51 }, rationale: 'Tech-forward blue' },
      { role: 'secondary', hex: '#34A853', rgb: { r: 52, g: 168, b: 83 }, hsl: { h: 136, s: 53, l: 43 }, rationale: 'Growth green' },
      { role: 'accent', hex: '#FF6D00', rgb: { r: 255, g: 109, b: 0 }, hsl: { h: 26, s: 100, l: 50 }, rationale: 'Bold accent' },
      { role: 'neutral-light', hex: '#F5F5F5', rgb: { r: 245, g: 245, b: 245 }, hsl: { h: 0, s: 0, l: 96 }, rationale: 'Light background' },
      { role: 'neutral-dark', hex: '#212121', rgb: { r: 33, g: 33, b: 33 }, hsl: { h: 0, s: 0, l: 13 }, rationale: 'Text color' },
      { role: 'background', hex: '#FAFAFA', rgb: { r: 250, g: 250, b: 250 }, hsl: { h: 0, s: 0, l: 98 }, rationale: 'Page background' },
    ],
    generationRationale: 'Modern tech palette with bold primary blue',
  });
}

function createMockTypographyResponse(): string {
  return JSON.stringify({
    pairings: [
      {
        heading: { family: 'Inter', weight: 700, style: 'normal' },
        body: { family: 'Source Sans 3', weight: 400, style: 'normal' },
        rationale: 'Modern geometric sans for headers — complements stated innovative brand personality',
      },
      {
        heading: { family: 'Space Grotesk', weight: 600, style: 'normal' },
        body: { family: 'IBM Plex Sans', weight: 400, style: 'normal' },
        rationale: 'Tech-forward pair with distinctive geometry',
      },
    ],
  });
}

function createMockVoiceResponse(): string {
  return JSON.stringify({
    toneScales: [
      { dimension: 'Formality', leftPole: 'Very Formal', rightPole: 'Very Casual', position: 3 },
      { dimension: 'Energy', leftPole: 'Calm', rightPole: 'Energetic', position: 4 },
      { dimension: 'Humor', leftPole: 'Serious', rightPole: 'Humorous', position: 2 },
      { dimension: 'Complexity', leftPole: 'Simple', rightPole: 'Complex', position: 3 },
      { dimension: 'Warmth', leftPole: 'Cold', rightPole: 'Warm', position: 4 },
    ],
    vocabularyGuide: {
      useWords: [
        'build', 'innovate', 'create', 'launch', 'ship',
        'scale', 'optimize', 'empower', 'transform', 'accelerate',
        'streamline', 'pioneer', 'engineer', 'craft', 'iterate',
        'deploy', 'integrate', 'automate', 'evolve', 'elevate',
      ],
      avoidWords: [
        'maybe', 'try', 'hopefully', 'basically', 'just',
        'legacy', 'complex', 'difficult', 'impossible', 'cheap',
      ],
    },
    communicationGuidelines: [
      'Lead with the value delivered, not the technology used',
      'Use active voice and direct address — speak to "you", not "users"',
      'Keep sentences under 20 words for clarity',
      'Include specific metrics and outcomes when possible',
    ],
  });
}

function createMockMoodboardPromptsResponse(): string {
  return JSON.stringify({
    prompts: [
      'Abstract geometric pattern in deep blue and white, minimal tech aesthetic',
      'Modern workspace with clean desk, natural light, warm wood accents',
      'Futuristic data visualization with flowing lines and gradient blue tones',
      'Macro photography of circuit board with selective blue and green lighting',
      'Clean architectural lines of modern glass building against clear sky',
      'Abstract watercolor gradient from navy blue to teal, soft edges',
      'Minimalist product photography on white background with subtle shadows',
      'Aerial view of geometric urban landscape at golden hour',
      'Crystalline structure with blue light refraction, abstract macro',
      'Modern library interior with clean shelving and warm lighting',
    ],
  });
}

function createMockVisionResponse(): string {
  return JSON.stringify({
    dominant_colors: ['#1A73E8', '#FFFFFF', '#333333'],
    layout_style: 'grid-based minimal with hero section',
    imagery_tone: 'professional photography with tech elements',
    overall_impression: 'Clean, modern tech brand with emphasis on simplicity and trust',
  });
}

// ---------------------------------------------------------------------------
// Mock Factories
// ---------------------------------------------------------------------------

function createMockScreenshotProvider(): ScreenshotProvider {
  return {
    capture: jest.fn().mockImplementation(async (url: string) => {
      if (url.includes('inaccessible')) {
        throw new Error('Connection refused');
      }
      return Buffer.from('fake-screenshot-data');
    }),
  };
}

function createMockTextProvider(): AITextProvider {
  let callCount = 0;
  return {
    generateText: jest.fn().mockImplementation(async () => {
      callCount++;
      // Return different responses based on call order
      // The pipeline calls text generation for: colors, typography, moodboard prompts, voice
      let text: string;
      if (callCount === 1) {
        text = createMockColorPaletteResponse();
      } else if (callCount === 2) {
        text = createMockTypographyResponse();
      } else if (callCount === 3) {
        text = createMockMoodboardPromptsResponse();
      } else {
        text = createMockVoiceResponse();
      }

      return {
        text,
        provider: 'claude',
        model: 'claude-3-sonnet',
        inputTokens: 1000,
        outputTokens: 500,
        costUsd: 0.002,
        latencyMs: 1500,
      };
    }),
  };
}

function createMockVisionProvider(): AIVisionProvider {
  return {
    analyzeImage: jest.fn().mockResolvedValue({
      text: createMockVisionResponse(),
      provider: 'claude',
    }),
  };
}

function createMockImageProvider(): AIImageProvider {
  return {
    generateImage: jest.fn().mockResolvedValue({
      imageUrl: 'https://flux.example.com/generated-image.png',
      provider: 'replicate',
      model: 'flux-1.1-pro',
      costUsd: 0.04,
      latencyMs: 5000,
    }),
  };
}

function createMockR2Client(): AnalysisR2Client {
  return {
    uploadJson: jest.fn().mockImplementation(async (key: string) => ({ key })),
    uploadFile: jest.fn().mockImplementation(async (key: string) => ({ key })),
  };
}

function createMockClickUpClient(): AnalysisClickUpClient {
  return {
    addComment: jest.fn().mockResolvedValue(undefined),
  };
}

function createPipelineConfig(): AnalysisPipelineConfig {
  return {
    r2PathPrefix: 'brand-assets/test-client/onboarding',
    clientId: 'test-client',
    maxConcurrentImages: 3,
    moodboardImageCount: 10,
  };
}

function createPipelineDeps(overrides?: Partial<AnalysisPipelineDeps>): AnalysisPipelineDeps {
  return {
    screenshotProvider: createMockScreenshotProvider(),
    textProvider: createMockTextProvider(),
    visionProvider: createMockVisionProvider(),
    imageProvider: createMockImageProvider(),
    r2Client: createMockR2Client(),
    clickUpClient: createMockClickUpClient(),
    clickUpTaskId: 'task-123',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AnalysisPipeline', () => {
  // AC 1: Pipeline reads intake.json from BSS-7.1
  describe('AC 1: Reads intake data as input', () => {
    it('accepts IntakeFormData and produces an AnalysisSummary', async () => {
      const config = createPipelineConfig();
      const deps = createPipelineDeps();
      const pipeline = new AnalysisPipeline(config, deps);
      const intakeData = createMockIntakeData();

      const result = await pipeline.run(intakeData);

      expect(result).toBeDefined();
      expect(result.version).toBe('1.0');
      expect(result.clientId).toBe('test-client');
      expect(result.startedAt).toBeTruthy();
      expect(result.completedAt).toBeTruthy();
      expect(result.durationMs).toBeGreaterThanOrEqual(0);
    });
  });

  // AC 2: Competitor screenshot analysis
  describe('AC 2: Competitor screenshot analysis', () => {
    it('skips inaccessible URLs without failing the pipeline', async () => {
      const config = createPipelineConfig();
      const deps = createPipelineDeps();
      const pipeline = new AnalysisPipeline(config, deps);
      const intakeData = createMockIntakeData();

      const result = await pipeline.run(intakeData);

      // Pipeline should succeed even with one inaccessible URL
      expect(result).toBeDefined();
      expect(result.metadata.competitorsSkipped).toBe(1);
      expect(result.metadata.competitorsAnalyzed).toBe(2);
    });

    it('calls screenshot provider for each competitor URL', async () => {
      const screenshotProvider = createMockScreenshotProvider();
      const deps = createPipelineDeps({ screenshotProvider });
      const pipeline = new AnalysisPipeline(createPipelineConfig(), deps);
      const intakeData = createMockIntakeData();

      await pipeline.run(intakeData);

      expect(screenshotProvider.capture).toHaveBeenCalledTimes(3);
      expect(screenshotProvider.capture).toHaveBeenCalledWith('https://competitor1.com');
      expect(screenshotProvider.capture).toHaveBeenCalledWith('https://competitor2.com');
      expect(screenshotProvider.capture).toHaveBeenCalledWith('https://inaccessible.example.com');
    });

    it('passes screenshots to Claude Vision for analysis', async () => {
      const visionProvider = createMockVisionProvider();
      const deps = createPipelineDeps({ visionProvider });
      const pipeline = new AnalysisPipeline(createPipelineConfig(), deps);
      const intakeData = createMockIntakeData();

      await pipeline.run(intakeData);

      // 2 successful screenshots analyzed (1 inaccessible skipped)
      expect(visionProvider.analyzeImage).toHaveBeenCalledTimes(2);
    });
  });

  // AC 3: Color palette generation
  describe('AC 3: Color palette generation', () => {
    it('generates 6 colors with hex/RGB/HSL values', async () => {
      const textProvider = createMockTextProvider();
      const deps = createPipelineDeps({ textProvider });
      const pipeline = new AnalysisPipeline(createPipelineConfig(), deps);
      const intakeData = createMockIntakeData();

      const result = await pipeline.run(intakeData);

      // Verify color palette was stored
      const r2Client = deps.r2Client as jest.Mocked<AnalysisR2Client>;
      const colorUpload = r2Client.uploadJson.mock.calls.find(
        (call) => (call[0] as string).includes('color-palette.json'),
      );
      expect(colorUpload).toBeDefined();

      const palette = colorUpload![1] as { colors: Array<{ role: string; color: { hex: string; rgb: object; hsl: object } }> };
      expect(palette.colors).toHaveLength(6);

      const roles = palette.colors.map((c) => c.role);
      expect(roles).toContain('primary');
      expect(roles).toContain('secondary');
      expect(roles).toContain('accent');
      expect(roles).toContain('neutral-light');
      expect(roles).toContain('neutral-dark');
      expect(roles).toContain('background');

      // Each color has hex/RGB/HSL
      for (const color of palette.colors) {
        expect(color.color.hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
        expect(color.color.rgb).toHaveProperty('r');
        expect(color.color.rgb).toHaveProperty('g');
        expect(color.color.rgb).toHaveProperty('b');
        expect(color.color.hsl).toHaveProperty('h');
        expect(color.color.hsl).toHaveProperty('s');
        expect(color.color.hsl).toHaveProperty('l');
      }
    });
  });

  // AC 4: Typography pairings
  describe('AC 4: Typography pairings', () => {
    it('generates 2 font pairs with heading and body', async () => {
      const deps = createPipelineDeps();
      const pipeline = new AnalysisPipeline(createPipelineConfig(), deps);
      const intakeData = createMockIntakeData();

      const result = await pipeline.run(intakeData);

      const r2Client = deps.r2Client as jest.Mocked<AnalysisR2Client>;
      const typoUpload = r2Client.uploadJson.mock.calls.find(
        (call) => (call[0] as string).includes('typography.json'),
      );
      expect(typoUpload).toBeDefined();

      const typography = typoUpload![1] as { pairings: Array<{ heading: { family: string; source: string }; body: { family: string }; rationale: string }> };
      expect(typography.pairings).toHaveLength(2);

      for (const pair of typography.pairings) {
        expect(pair.heading.family).toBeTruthy();
        expect(pair.body.family).toBeTruthy();
        expect(pair.heading.source).toBe('google-fonts');
        expect(pair.rationale).toBeTruthy();
      }
    });
  });

  // AC 5: Moodboard generation
  describe('AC 5: Moodboard generation', () => {
    it('generates images via Flux (image provider) and stores in R2', async () => {
      const imageProvider = createMockImageProvider();
      const deps = createPipelineDeps({ imageProvider });
      const pipeline = new AnalysisPipeline(createPipelineConfig(), deps);
      const intakeData = createMockIntakeData();

      await pipeline.run(intakeData);

      // Image provider should be called for each moodboard image
      expect(imageProvider.generateImage).toHaveBeenCalled();

      // All calls should use 'replicate' (Flux)
      const calls = (imageProvider.generateImage as jest.Mock).mock.calls;
      for (const call of calls) {
        expect(call[0].provider).toBe('replicate');
      }
    });

    it('stores moodboard manifest in R2', async () => {
      const deps = createPipelineDeps();
      const pipeline = new AnalysisPipeline(createPipelineConfig(), deps);
      const intakeData = createMockIntakeData();

      await pipeline.run(intakeData);

      const r2Client = deps.r2Client as jest.Mocked<AnalysisR2Client>;
      const moodboardUpload = r2Client.uploadJson.mock.calls.find(
        (call) => (call[0] as string).includes('moodboard-manifest.json'),
      );
      expect(moodboardUpload).toBeDefined();
    });
  });

  // AC 6: Brand voice definition
  describe('AC 6: Brand voice definition', () => {
    it('generates tone scales, vocabulary guide, and communication guidelines', async () => {
      const deps = createPipelineDeps();
      const pipeline = new AnalysisPipeline(createPipelineConfig(), deps);
      const intakeData = createMockIntakeData();

      await pipeline.run(intakeData);

      const r2Client = deps.r2Client as jest.Mocked<AnalysisR2Client>;
      const voiceUpload = r2Client.uploadJson.mock.calls.find(
        (call) => (call[0] as string).includes('brand-voice.json'),
      );
      expect(voiceUpload).toBeDefined();

      const voice = voiceUpload![1] as {
        toneScales: Array<{ position: number }>;
        vocabularyGuide: { useWords: string[]; avoidWords: string[] };
        communicationGuidelines: string[];
      };

      expect(voice.toneScales.length).toBeGreaterThanOrEqual(1);
      expect(voice.vocabularyGuide.useWords.length).toBeLessThanOrEqual(20);
      expect(voice.vocabularyGuide.avoidWords.length).toBeLessThanOrEqual(10);
      expect(voice.communicationGuidelines.length).toBeGreaterThanOrEqual(3);
    });
  });

  // AC 7: W3C DTCG token draft
  describe('AC 7: W3C DTCG token draft', () => {
    it('generates DTCG-formatted token JSON with color and typography tokens', async () => {
      const deps = createPipelineDeps();
      const pipeline = new AnalysisPipeline(createPipelineConfig(), deps);
      const intakeData = createMockIntakeData();

      await pipeline.run(intakeData);

      const r2Client = deps.r2Client as jest.Mocked<AnalysisR2Client>;
      const tokenUpload = r2Client.uploadJson.mock.calls.find(
        (call) => (call[0] as string).includes('tokens-draft.json'),
      );
      expect(tokenUpload).toBeDefined();

      const tokens = tokenUpload![1] as {
        color: Record<string, { $value: string; $type: string }>;
        typography: Record<string, { $value: string | number; $type: string }>;
      };

      // Color tokens
      expect(tokens.color['primary']).toBeDefined();
      expect(tokens.color['primary'].$type).toBe('color');
      expect(tokens.color['primary'].$value).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(tokens.color['secondary']).toBeDefined();
      expect(tokens.color['accent']).toBeDefined();
      expect(tokens.color['neutral-light']).toBeDefined();
      expect(tokens.color['neutral-dark']).toBeDefined();
      expect(tokens.color['background']).toBeDefined();

      // Typography tokens
      expect(tokens.typography['font-family-heading']).toBeDefined();
      expect(tokens.typography['font-family-heading'].$type).toBe('fontFamily');
      expect(tokens.typography['font-family-body']).toBeDefined();
      expect(tokens.typography['font-size-base']).toBeDefined();
      expect(tokens.typography['line-height-base']).toBeDefined();
    });
  });

  // AC 8: Progress events
  describe('AC 8: Progress events', () => {
    it('emits phase-by-phase progress events', async () => {
      const deps = createPipelineDeps();
      const pipeline = new AnalysisPipeline(createPipelineConfig(), deps);
      const intakeData = createMockIntakeData();

      const events: PipelineProgressEvent[] = [];
      const onProgress = (event: PipelineProgressEvent): void => {
        events.push(event);
      };

      await pipeline.run(intakeData, onProgress);

      // Should have in_progress + completed for each of 6 phases = 12 events
      expect(events.length).toBe(12);

      // Verify all phases are represented
      const phases = [...new Set(events.map((e) => e.phase))];
      expect(phases).toHaveLength(6);
      for (const expectedPhase of ANALYSIS_PHASES) {
        expect(phases).toContain(expectedPhase);
      }

      // Verify order: each phase has in_progress before completed
      for (const phase of ANALYSIS_PHASES) {
        const phaseEvents = events.filter((e) => e.phase === phase);
        expect(phaseEvents[0].status).toBe('in_progress');
        expect(phaseEvents[1].status).toBe('completed');
      }

      // Verify correct order of phases
      const phaseOrder = events
        .filter((e) => e.status === 'in_progress')
        .map((e) => e.phase);
      expect(phaseOrder).toEqual([
        'competitor_analysis',
        'color_palette',
        'typography',
        'moodboard',
        'voice',
        'tokens',
      ]);
    });

    it('includes timestamps on all events', async () => {
      const deps = createPipelineDeps();
      const pipeline = new AnalysisPipeline(createPipelineConfig(), deps);
      const intakeData = createMockIntakeData();

      const events: PipelineProgressEvent[] = [];
      await pipeline.run(intakeData, (e) => events.push(e));

      for (const event of events) {
        expect(event.timestamp).toBeTruthy();
        expect(new Date(event.timestamp).getTime()).not.toBeNaN();
      }
    });
  });

  // AC 9: Artifacts stored in R2 + ClickUp notification
  describe('AC 9: R2 storage and ClickUp notification', () => {
    it('stores all 7 artifacts in R2 under analysis/', async () => {
      const deps = createPipelineDeps();
      const pipeline = new AnalysisPipeline(createPipelineConfig(), deps);
      const intakeData = createMockIntakeData();

      const result = await pipeline.run(intakeData);

      const r2Client = deps.r2Client as jest.Mocked<AnalysisR2Client>;

      // Verify R2 keys for all artifacts
      expect(result.artifacts.competitorAnalysis).toContain('analysis/competitor-analysis.json');
      expect(result.artifacts.colorPalette).toContain('analysis/color-palette.json');
      expect(result.artifacts.typography).toContain('analysis/typography.json');
      expect(result.artifacts.moodboard).toContain('analysis/moodboard-manifest.json');
      expect(result.artifacts.brandVoice).toContain('analysis/brand-voice.json');
      expect(result.artifacts.tokensDraft).toContain('tokens-draft.json');
      expect(result.artifacts.summary).toContain('analysis/analysis-summary.json');

      // Verify uploadJson was called for each artifact
      const uploadKeys = r2Client.uploadJson.mock.calls.map((call) => call[0] as string);
      expect(uploadKeys.some((k) => k.includes('competitor-analysis.json'))).toBe(true);
      expect(uploadKeys.some((k) => k.includes('color-palette.json'))).toBe(true);
      expect(uploadKeys.some((k) => k.includes('typography.json'))).toBe(true);
      expect(uploadKeys.some((k) => k.includes('moodboard-manifest.json'))).toBe(true);
      expect(uploadKeys.some((k) => k.includes('brand-voice.json'))).toBe(true);
      expect(uploadKeys.some((k) => k.includes('tokens-draft.json'))).toBe(true);
      expect(uploadKeys.some((k) => k.includes('analysis-summary.json'))).toBe(true);
    });

    it('posts ClickUp comment on pipeline completion', async () => {
      const clickUpClient = createMockClickUpClient();
      const deps = createPipelineDeps({ clickUpClient, clickUpTaskId: 'task-456' });
      const pipeline = new AnalysisPipeline(createPipelineConfig(), deps);
      const intakeData = createMockIntakeData();

      await pipeline.run(intakeData);

      expect(clickUpClient.addComment).toHaveBeenCalledWith(
        'task-456',
        expect.stringContaining('AI Analysis Pipeline Complete'),
      );
    });

    it('succeeds even if ClickUp notification fails', async () => {
      const clickUpClient: AnalysisClickUpClient = {
        addComment: jest.fn().mockRejectedValue(new Error('ClickUp API down')),
      };
      const deps = createPipelineDeps({ clickUpClient, clickUpTaskId: 'task-789' });
      const pipeline = new AnalysisPipeline(createPipelineConfig(), deps);
      const intakeData = createMockIntakeData();

      const result = await pipeline.run(intakeData);

      // Pipeline should succeed despite ClickUp failure
      expect(result).toBeDefined();
      expect(result.clientId).toBe('test-client');
    });

    it('succeeds without ClickUp client configured', async () => {
      const deps = createPipelineDeps({
        clickUpClient: undefined,
        clickUpTaskId: undefined,
      });
      const pipeline = new AnalysisPipeline(createPipelineConfig(), deps);
      const intakeData = createMockIntakeData();

      const result = await pipeline.run(intakeData);
      expect(result).toBeDefined();
    });
  });

  // AC 10: Analysis summary
  describe('AC 10: Analysis summary', () => {
    it('produces analysis-summary.json with all artifact references', async () => {
      const deps = createPipelineDeps();
      const pipeline = new AnalysisPipeline(createPipelineConfig(), deps);
      const intakeData = createMockIntakeData();

      const result = await pipeline.run(intakeData);

      expect(result.version).toBe('1.0');
      expect(result.clientId).toBe('test-client');
      expect(result.startedAt).toBeTruthy();
      expect(result.completedAt).toBeTruthy();
      expect(result.durationMs).toBeGreaterThanOrEqual(0);

      // Phase durations
      expect(result.phaseDurations).toHaveLength(6);
      for (const phase of result.phaseDurations) {
        expect(phase.startedAt).toBeTruthy();
        expect(phase.completedAt).toBeTruthy();
        expect(phase.durationMs).toBeGreaterThanOrEqual(0);
        expect(phase.status).toBe('completed');
      }

      // Metadata
      expect(result.metadata.intakeR2Key).toContain('intake.json');
      expect(result.metadata.pipelineVersion).toBe('1.0.0');
      expect(typeof result.metadata.competitorsAnalyzed).toBe('number');
      expect(typeof result.metadata.competitorsSkipped).toBe('number');
      expect(typeof result.metadata.moodboardImageCount).toBe('number');

      // All artifact keys present
      expect(result.artifacts.competitorAnalysis).toBeTruthy();
      expect(result.artifacts.colorPalette).toBeTruthy();
      expect(result.artifacts.typography).toBeTruthy();
      expect(result.artifacts.moodboard).toBeTruthy();
      expect(result.artifacts.brandVoice).toBeTruthy();
      expect(result.artifacts.tokensDraft).toBeTruthy();
      expect(result.artifacts.summary).toBeTruthy();
    });
  });
});

// ---------------------------------------------------------------------------
// CompetitorAnalyzer (unit)
// ---------------------------------------------------------------------------

describe('CompetitorAnalyzer', () => {
  it('returns skipped result for inaccessible URLs', async () => {
    const screenshot: ScreenshotProvider = {
      capture: jest.fn().mockRejectedValue(new Error('Connection refused')),
    };
    const vision = createMockVisionProvider();
    const analyzer = new CompetitorAnalyzer(screenshot, vision, 'client-1');

    const result = await analyzer.analyze(['https://failing.com']);

    expect(result.analyzedCount).toBe(0);
    expect(result.skippedCount).toBe(1);
    expect(result.analyses[0].skipped).toBe(true);
    expect(result.analyses[0].skipReason).toContain('Screenshot capture failed');
  });

  it('returns skipped result when vision analysis fails', async () => {
    const screenshot: ScreenshotProvider = {
      capture: jest.fn().mockResolvedValue(Buffer.from('img')),
    };
    const vision: AIVisionProvider = {
      analyzeImage: jest.fn().mockRejectedValue(new Error('Vision API error')),
    };
    const analyzer = new CompetitorAnalyzer(screenshot, vision, 'client-1');

    const result = await analyzer.analyze(['https://example.com']);

    expect(result.analyzedCount).toBe(0);
    expect(result.skippedCount).toBe(1);
    expect(result.analyses[0].skipped).toBe(true);
    expect(result.analyses[0].skipReason).toContain('Vision analysis failed');
  });

  it('successfully analyzes accessible URLs', async () => {
    const screenshot: ScreenshotProvider = {
      capture: jest.fn().mockResolvedValue(Buffer.from('img')),
    };
    const vision = createMockVisionProvider();
    const analyzer = new CompetitorAnalyzer(screenshot, vision, 'client-1');

    const result = await analyzer.analyze(['https://example.com']);

    expect(result.analyzedCount).toBe(1);
    expect(result.skippedCount).toBe(0);
    expect(result.analyses[0].skipped).toBe(false);
    expect(result.analyses[0].dominantColors.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// containsLogoTerms (CON-15 guard)
// ---------------------------------------------------------------------------

describe('containsLogoTerms (CON-15)', () => {
  it('detects "logo" in prompt', () => {
    expect(containsLogoTerms('Generate a company logo')).toBe(true);
  });

  it('detects "logotype" in prompt', () => {
    expect(containsLogoTerms('Create a professional logotype')).toBe(true);
  });

  it('detects "wordmark" in prompt', () => {
    expect(containsLogoTerms('Design a wordmark for the brand')).toBe(true);
  });

  it('detects case-insensitive', () => {
    expect(containsLogoTerms('Create a LOGO design')).toBe(true);
  });

  it('returns false for safe prompts', () => {
    expect(containsLogoTerms('Abstract geometric pattern in blue tones')).toBe(false);
    expect(containsLogoTerms('Modern workspace photography')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// TokenDraftGenerator (unit)
// ---------------------------------------------------------------------------

describe('TokenDraftGenerator', () => {
  it('converts color palette to DTCG tokens', () => {
    const generator = new TokenDraftGenerator();
    const palette = {
      colors: [
        { role: 'primary' as const, color: { hex: '#1A73E8', rgb: { r: 26, g: 115, b: 232 }, hsl: { h: 214, s: 83, l: 51 } }, rationale: 'Blue' },
        { role: 'secondary' as const, color: { hex: '#34A853', rgb: { r: 52, g: 168, b: 83 }, hsl: { h: 136, s: 53, l: 43 } }, rationale: 'Green' },
        { role: 'accent' as const, color: { hex: '#FF6D00', rgb: { r: 255, g: 109, b: 0 }, hsl: { h: 26, s: 100, l: 50 } }, rationale: 'Orange' },
        { role: 'neutral-light' as const, color: { hex: '#F5F5F5', rgb: { r: 245, g: 245, b: 245 }, hsl: { h: 0, s: 0, l: 96 } }, rationale: 'Light' },
        { role: 'neutral-dark' as const, color: { hex: '#212121', rgb: { r: 33, g: 33, b: 33 }, hsl: { h: 0, s: 0, l: 13 } }, rationale: 'Dark' },
        { role: 'background' as const, color: { hex: '#FAFAFA', rgb: { r: 250, g: 250, b: 250 }, hsl: { h: 0, s: 0, l: 98 } }, rationale: 'Background' },
      ],
      generationRationale: 'Test palette',
    };

    const typography = {
      pairings: [
        {
          heading: { family: 'Inter', weight: 700, style: 'normal' as const, source: 'google-fonts' as const },
          body: { family: 'Source Sans 3', weight: 400, style: 'normal' as const, source: 'google-fonts' as const },
          rationale: 'Modern pair',
        },
        {
          heading: { family: 'Space Grotesk', weight: 600, style: 'normal' as const, source: 'google-fonts' as const },
          body: { family: 'IBM Plex Sans', weight: 400, style: 'normal' as const, source: 'google-fonts' as const },
          rationale: 'Alt pair',
        },
      ],
    };

    const result = generator.generate(palette, typography);

    // Color tokens
    expect(result.color['primary']).toEqual({
      $value: '#1A73E8',
      $type: 'color',
      $description: 'Blue',
    });
    expect(result.color['secondary']).toBeDefined();
    expect(result.color['accent']).toBeDefined();

    // Typography tokens (uses first pairing)
    expect(result.typography['font-family-heading']).toEqual({
      $value: 'Inter',
      $type: 'fontFamily',
      $description: expect.stringContaining('Heading font'),
    });
    expect(result.typography['font-family-body']).toEqual({
      $value: 'Source Sans 3',
      $type: 'fontFamily',
      $description: expect.stringContaining('Body font'),
    });
    expect(result.typography['font-size-base']).toBeDefined();
    expect(result.typography['line-height-base']).toBeDefined();
  });

  it('handles empty typography pairings', () => {
    const generator = new TokenDraftGenerator();
    const palette = {
      colors: [
        { role: 'primary' as const, color: { hex: '#1A73E8', rgb: { r: 26, g: 115, b: 232 }, hsl: { h: 214, s: 83, l: 51 } }, rationale: 'Blue' },
        { role: 'secondary' as const, color: { hex: '#34A853', rgb: { r: 52, g: 168, b: 83 }, hsl: { h: 136, s: 53, l: 43 } }, rationale: 'Green' },
        { role: 'accent' as const, color: { hex: '#FF6D00', rgb: { r: 255, g: 109, b: 0 }, hsl: { h: 26, s: 100, l: 50 } }, rationale: 'Orange' },
        { role: 'neutral-light' as const, color: { hex: '#F5F5F5', rgb: { r: 245, g: 245, b: 245 }, hsl: { h: 0, s: 0, l: 96 } }, rationale: 'Light' },
        { role: 'neutral-dark' as const, color: { hex: '#212121', rgb: { r: 33, g: 33, b: 33 }, hsl: { h: 0, s: 0, l: 13 } }, rationale: 'Dark' },
        { role: 'background' as const, color: { hex: '#FAFAFA', rgb: { r: 250, g: 250, b: 250 }, hsl: { h: 0, s: 0, l: 98 } }, rationale: 'Background' },
      ],
      generationRationale: 'Test palette',
    };
    const typography = { pairings: [] };

    const result = generator.generate(palette, typography);

    expect(result.color['primary']).toBeDefined();
    expect(result.typography).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// ColorGenerator (unit)
// ---------------------------------------------------------------------------

describe('ColorGenerator', () => {
  it('generates a 6-color palette with correct roles', async () => {
    const textProvider: AITextProvider = {
      generateText: jest.fn().mockResolvedValue({
        text: createMockColorPaletteResponse(),
        provider: 'claude',
        model: 'claude-3-sonnet',
        inputTokens: 500,
        outputTokens: 300,
        costUsd: 0.001,
        latencyMs: 1000,
      }),
    };

    const generator = new ColorGenerator(textProvider, 'client-1');
    const result = await generator.generate(
      { formalCasual: 3, traditionalInnovative: 4, seriousPlayful: 2, minimalExpressive: 3, localGlobal: 5 },
      { selectedMoodIds: ['bold-modern'] },
      [{ id: 'bold-modern', name: 'Bold & Modern', description: 'Bold', keywords: ['bold', 'modern'] }],
      { analyses: [], commonPatterns: { dominantColors: [], layoutStyles: [], imageryTones: [] }, analyzedCount: 0, skippedCount: 0 },
    );

    expect(result.colors).toHaveLength(6);
    const roles = result.colors.map((c) => c.role);
    expect(roles).toEqual(['primary', 'secondary', 'accent', 'neutral-light', 'neutral-dark', 'background']);
  });
});

// ---------------------------------------------------------------------------
// TypographyGenerator (unit)
// ---------------------------------------------------------------------------

describe('TypographyGenerator', () => {
  it('generates 2 font pairings', async () => {
    const textProvider: AITextProvider = {
      generateText: jest.fn().mockResolvedValue({
        text: createMockTypographyResponse(),
        provider: 'claude',
        model: 'claude-3-sonnet',
        inputTokens: 300,
        outputTokens: 200,
        costUsd: 0.001,
        latencyMs: 800,
      }),
    };

    const generator = new TypographyGenerator(textProvider, 'client-1');
    const result = await generator.generate(
      { formalCasual: 3, traditionalInnovative: 4, seriousPlayful: 2, minimalExpressive: 3, localGlobal: 5 },
      'Technology',
      'Developers',
    );

    expect(result.pairings).toHaveLength(2);
    expect(result.pairings[0].heading.source).toBe('google-fonts');
    expect(result.pairings[0].body.source).toBe('google-fonts');
  });
});

// ---------------------------------------------------------------------------
// VoiceGenerator (unit)
// ---------------------------------------------------------------------------

describe('VoiceGenerator', () => {
  it('generates voice definition with tone, vocabulary, and guidelines', async () => {
    const textProvider: AITextProvider = {
      generateText: jest.fn().mockResolvedValue({
        text: createMockVoiceResponse(),
        provider: 'claude',
        model: 'claude-3-sonnet',
        inputTokens: 400,
        outputTokens: 500,
        costUsd: 0.002,
        latencyMs: 1200,
      }),
    };

    const generator = new VoiceGenerator(textProvider, 'client-1');
    const result = await generator.generate(
      { formalCasual: 3, traditionalInnovative: 4, seriousPlayful: 2, minimalExpressive: 3, localGlobal: 5 },
      'Technology',
      'Developers',
      'TestCorp',
    );

    expect(result.toneScales.length).toBeGreaterThanOrEqual(1);
    expect(result.vocabularyGuide.useWords.length).toBe(20);
    expect(result.vocabularyGuide.avoidWords.length).toBe(10);
    expect(result.communicationGuidelines.length).toBeGreaterThanOrEqual(3);
    expect(result.communicationGuidelines.length).toBeLessThanOrEqual(5);

    // Tone scale positions should be 1-5
    for (const scale of result.toneScales) {
      expect(scale.position).toBeGreaterThanOrEqual(1);
      expect(scale.position).toBeLessThanOrEqual(5);
    }
  });
});

// ---------------------------------------------------------------------------
// MoodboardGenerator (unit)
// ---------------------------------------------------------------------------

describe('MoodboardGenerator', () => {
  it('filters out prompts containing logo terms (CON-15)', async () => {
    const promptsWithLogo = JSON.stringify({
      prompts: [
        'Abstract geometric pattern in blue',
        'Create a modern logo for the brand', // should be filtered
        'Warm sunset photography with orange tones',
        'Design a professional logotype',      // should be filtered
        'Clean architectural interior shot',
        'Modern workspace with plants',
        'Abstract gradient background',
        'Tech circuit board macro photo',
        'Mountain landscape at golden hour',
        'Urban cityscape at night',
      ],
    });

    const textProvider: AITextProvider = {
      generateText: jest.fn().mockResolvedValue({
        text: promptsWithLogo,
        provider: 'claude',
        model: 'claude-3-sonnet',
        inputTokens: 300,
        outputTokens: 400,
        costUsd: 0.001,
        latencyMs: 1000,
      }),
    };

    const imageProvider = createMockImageProvider();
    const r2Client = createMockR2Client();

    const generator = new MoodboardGenerator(
      textProvider,
      imageProvider,
      r2Client,
      'client-1',
      'brand-assets/client-1/onboarding',
      3,
      10,
    );

    const result = await generator.generate(
      [{ id: 'bold-modern', name: 'Bold & Modern', description: 'Bold', keywords: ['bold'] }],
      { analyses: [], commonPatterns: { dominantColors: [], layoutStyles: [], imageryTones: [] }, analyzedCount: 0, skippedCount: 0 },
    );

    // Should have generated images only for safe prompts (8 out of 10 — 2 filtered)
    expect(result.imageCount).toBe(8);

    // Verify no image was generated with logo prompts
    for (const img of result.images) {
      expect(containsLogoTerms(img.prompt)).toBe(false);
    }
  });
});
