/**
 * Tests for Human Review Interface (BSS-7.7).
 *
 * Covers: mode detection, section reviewers, WCAG contrast,
 * data quality warning, AI draft badge, review summary, and approval.
 */

import {
  ReviewManager,
  ColorReviewer,
  TypographyReviewer,
  MoodboardReviewer,
  VoiceReviewer,
  TokenReviewer,
  ApprovalHandler,
  computeContrastPairs,
  calculateContrastRatio,
  isValidHex,
  normalizeHex,
  parseHexToRgb,
  flattenTokens,
  unflattenTokens,
  areAllSectionsSaved,
  MIN_APPROVED_MOODBOARD_IMAGES,
  AI_DRAFT_BADGE_LABEL,
  WCAG_AA_THRESHOLD,
  buildApprovedDirectionR2Key,
  buildAnalysisSummaryR2Key,
  buildDraftManifestR2Key,
  buildDataQualityReportR2Key,
  CLICKUP_READY_FOR_CLIENT_REVIEW,
} from '../review';

import type {
  ReviewR2Client,
  ReviewClickUpClient,
  ReviewSectionId,
  ReviewSectionState,
} from '../review';

import type {
  ColorPalette,
  PaletteColor,
  TypographyPairing,
  TypographyResult,
  MoodboardManifest,
  BrandVoiceDefinition,
  TokensDraft,
  AnalysisSummary,
  DTCGTokenGroup,
} from '../../analysis/analysis-types';

import type { DraftManifest, BrandVoiceDraft, MoodboardDirectionDraft } from '../../drafts/draft-types';
import type { DataQualityReport } from '../../quality/quality-types';

// ---------------------------------------------------------------------------
// Mock Factories
// ---------------------------------------------------------------------------

function createMockR2Client(store: Record<string, unknown> = {}): ReviewR2Client {
  return {
    downloadJson: jest.fn(async <T>(key: string): Promise<T | null> => {
      return (store[key] as T) ?? null;
    }),
    uploadJson: jest.fn(async (key: string, data: unknown) => {
      store[key] = data;
      return { key };
    }),
    exists: jest.fn(async (key: string) => {
      return key in store;
    }),
  };
}

function createMockClickUpClient(): ReviewClickUpClient {
  return {
    updateTaskStatus: jest.fn(async () => {}),
    addComment: jest.fn(async () => {}),
  };
}

function createColorPalette(): ColorPalette {
  return {
    colors: [
      { role: 'primary', color: { hex: '#1a73e8', rgb: { r: 26, g: 115, b: 232 }, hsl: { h: 214, s: 82, l: 51 } }, rationale: 'Primary blue' },
      { role: 'secondary', color: { hex: '#34a853', rgb: { r: 52, g: 168, b: 83 }, hsl: { h: 136, s: 53, l: 43 } }, rationale: 'Secondary green' },
      { role: 'accent', color: { hex: '#fbbc04', rgb: { r: 251, g: 188, b: 4 }, hsl: { h: 45, s: 97, l: 50 } }, rationale: 'Accent yellow' },
      { role: 'neutral-light', color: { hex: '#f8f9fa', rgb: { r: 248, g: 249, b: 250 }, hsl: { h: 210, s: 17, l: 98 } }, rationale: 'Light neutral' },
      { role: 'neutral-dark', color: { hex: '#202124', rgb: { r: 32, g: 33, b: 36 }, hsl: { h: 225, s: 6, l: 13 } }, rationale: 'Dark neutral' },
      { role: 'background', color: { hex: '#ffffff', rgb: { r: 255, g: 255, b: 255 }, hsl: { h: 0, s: 0, l: 100 } }, rationale: 'White background' },
    ],
    generationRationale: 'Test palette',
  };
}

function createTypographyResult(): TypographyResult {
  return {
    pairings: [
      {
        heading: { family: 'Roboto', weight: 700, style: 'normal', source: 'google-fonts' },
        body: { family: 'Open Sans', weight: 400, style: 'normal', source: 'google-fonts' },
        rationale: 'Clean modern pairing',
      },
      {
        heading: { family: 'Playfair Display', weight: 700, style: 'normal', source: 'google-fonts' },
        body: { family: 'Lato', weight: 400, style: 'normal', source: 'google-fonts' },
        rationale: 'Elegant serif-sans pairing',
      },
    ],
  };
}

function createMoodboardManifest(): MoodboardManifest {
  return {
    images: Array.from({ length: 8 }, (_, i) => ({
      prompt: `Moodboard image ${i}`,
      r2Key: `brand-assets/test/moodboard/${i}.jpg`,
      width: 1024,
      height: 1024,
      index: i,
    })),
    sourceKeywords: ['modern', 'clean', 'vibrant'],
    imageCount: 8,
  };
}

function createVoiceDefinition(): BrandVoiceDefinition {
  return {
    toneScales: [
      { dimension: 'Formality', leftPole: 'Formal', rightPole: 'Casual', position: 3 },
      { dimension: 'Emotion', leftPole: 'Serious', rightPole: 'Playful', position: 4 },
    ],
    vocabularyGuide: {
      useWords: ['innovative', 'reliable', 'streamlined'],
      avoidWords: ['cheap', 'basic'],
    },
    communicationGuidelines: [
      'Keep sentences concise.',
      'Use active voice.',
      'Address the reader directly.',
    ],
  };
}

function createTokensDraft(): TokensDraft {
  return {
    color: {
      primary: { $value: '#1a73e8', $type: 'color', $description: 'Primary brand color' },
      secondary: { $value: '#34a853', $type: 'color' },
    },
    typography: {
      'heading-family': { $value: 'Roboto', $type: 'fontFamily' },
      'body-family': { $value: 'Open Sans', $type: 'fontFamily' },
    },
  };
}

function createAnalysisSummary(clientId: string): AnalysisSummary {
  return {
    version: '1.0',
    clientId,
    startedAt: '2026-03-20T10:00:00Z',
    completedAt: '2026-03-20T10:05:00Z',
    durationMs: 300000,
    phaseDurations: [],
    artifacts: {
      competitorAnalysis: `brand-assets/${clientId}/onboarding/competitor-analysis.json`,
      colorPalette: `brand-assets/${clientId}/onboarding/color-palette.json`,
      typography: `brand-assets/${clientId}/onboarding/typography.json`,
      moodboard: `brand-assets/${clientId}/onboarding/moodboard.json`,
      brandVoice: `brand-assets/${clientId}/onboarding/brand-voice.json`,
      tokensDraft: `brand-assets/${clientId}/onboarding/tokens-draft.json`,
      summary: `brand-assets/${clientId}/onboarding/analysis-summary.json`,
    },
    metadata: {
      intakeR2Key: `brand-assets/${clientId}/onboarding/intake.json`,
      competitorsAnalyzed: 3,
      competitorsSkipped: 0,
      moodboardImageCount: 8,
      pipelineVersion: '1.0',
    },
  };
}

function createDraftManifest(clientId: string): DraftManifest {
  return {
    client_id: clientId,
    generated_at: '2026-03-20T10:00:00Z',
    source_audit_version: '1.0',
    validation_status: 'pending',
    drafts: [
      { filename: 'brand-voice-draft.json', draft_type: 'brand-voice', generated_at: '2026-03-20T10:00:00Z', validation_status: 'pending' },
      { filename: 'moodboard-direction-draft.json', draft_type: 'moodboard-direction', generated_at: '2026-03-20T10:00:00Z', validation_status: 'pending' },
    ],
  };
}

function createBrandVoiceDraft(clientId: string): BrandVoiceDraft {
  return {
    _ai_draft: true,
    _requires_validation: true,
    _label: 'AI Draft - Requires Human Validation',
    _preamble: 'AI-generated draft.',
    validation_status: 'pending',
    generated_at: '2026-03-20T10:00:00Z',
    client_id: clientId,
    source_audit_version: '1.0',
    draft_type: 'brand-voice',
    tone_spectrum: [
      { dimension: 'Formality', position: 3, label: 'Balanced', description: 'Balanced tone' },
    ],
    vocabulary_examples: [
      { word: 'innovative', context: 'product description', frequency: 'frequent' },
      { word: 'cutting-edge', context: 'about page', frequency: 'occasional' },
    ],
    communication_guidelines: [
      { type: 'do', guideline: 'Be direct', rationale: 'Audience prefers clarity' },
      { type: 'dont', guideline: 'Use jargon', rationale: 'Non-technical audience' },
    ],
  };
}

function createMoodboardDirectionDraft(clientId: string): MoodboardDirectionDraft {
  return {
    _ai_draft: true,
    _requires_validation: true,
    _label: 'AI Draft - Requires Human Validation',
    _preamble: 'AI-generated draft.',
    validation_status: 'pending',
    generated_at: '2026-03-20T10:00:00Z',
    client_id: clientId,
    source_audit_version: '1.0',
    draft_type: 'moodboard-direction',
    visual_direction_tags: [
      { tag: 'modern', description: 'Modern aesthetic', derived_from: 'homepage' },
      { tag: 'clean', description: 'Clean design', derived_from: 'about page' },
      { tag: 'vibrant', description: 'Vibrant colors', derived_from: 'social media' },
      { tag: 'minimal', description: 'Minimalist layout', derived_from: 'competitor' },
      { tag: 'bold', description: 'Bold typography', derived_from: 'hero section' },
      { tag: 'organic', description: 'Organic shapes', derived_from: 'illustrations' },
      { tag: 'warm', description: 'Warm tones', derived_from: 'photography' },
      { tag: 'professional', description: 'Professional feel', derived_from: 'overall' },
    ],
    color_seeds: [
      { hex: '#1a73e8', name: 'Royal Blue', role: 'primary' },
      { hex: '#34a853', name: 'Forest Green', role: 'secondary' },
      { hex: '#fbbc04', name: 'Sunshine Yellow', role: 'accent' },
    ],
    typography_direction: [
      { category: 'heading', suggestion: 'Montserrat', rationale: 'Modern geometric sans-serif' },
      { category: 'body', suggestion: 'Source Sans Pro', rationale: 'Highly readable body text' },
    ],
  };
}

function createDataQualityReport(clientId: string, opts: { critical?: boolean; low?: boolean } = {}): DataQualityReport {
  return {
    client_id: clientId,
    generated_at: '2026-03-20T10:00:00Z',
    urls_submitted: 5,
    urls_accessible: opts.critical ? 2 : 5,
    accessibility_rate: opts.critical ? 0.4 : 1.0,
    critical_data_quality_alert: opts.critical ?? false,
    overall_confidence: opts.low ? 'low' : 'high',
    issues: [],
    workshop_focus_areas: [],
    per_url_status: [],
  };
}

// ---------------------------------------------------------------------------
// Helpers to set up a full standard mode R2 store
// ---------------------------------------------------------------------------

function createStandardModeStore(clientId: string): Record<string, unknown> {
  const summary = createAnalysisSummary(clientId);
  return {
    [buildAnalysisSummaryR2Key(clientId)]: summary,
    [summary.artifacts.colorPalette]: createColorPalette(),
    [summary.artifacts.typography]: createTypographyResult(),
    [summary.artifacts.moodboard]: createMoodboardManifest(),
    [summary.artifacts.brandVoice]: createVoiceDefinition(),
    [summary.artifacts.tokensDraft]: createTokensDraft(),
  };
}

function createAuditAssistedStore(clientId: string): Record<string, unknown> {
  return {
    [buildDraftManifestR2Key(clientId)]: createDraftManifest(clientId),
    [`brand-assets/${clientId}/onboarding/ai-drafts/brand-voice-draft.json`]: createBrandVoiceDraft(clientId),
    [`brand-assets/${clientId}/onboarding/ai-drafts/moodboard-direction-draft.json`]: createMoodboardDirectionDraft(clientId),
  };
}

// ===========================================================================
// TEST SUITES
// ===========================================================================

describe('BSS-7.7: Human Review Interface', () => {
  // =========================================================================
  // AC 1: Mode Detection
  // =========================================================================
  describe('AC 1: Mode Detection (DD-7.7-1)', () => {
    it('detects standard mode when analysis-summary.json exists', async () => {
      const clientId = 'client-std-001';
      const store = createStandardModeStore(clientId);
      const r2Client = createMockR2Client(store);
      const manager = new ReviewManager({ r2Client });

      const result = await manager.detectMode(clientId);

      expect(result.mode).toBe('standard');
      expect(result.bothExist).toBe(false);
    });

    it('detects audit-assisted mode when ai-drafts/index.json exists', async () => {
      const clientId = 'client-audit-001';
      const store = createAuditAssistedStore(clientId);
      const r2Client = createMockR2Client(store);
      const manager = new ReviewManager({ r2Client });

      const result = await manager.detectMode(clientId);

      expect(result.mode).toBe('audit_assisted');
      expect(result.bothExist).toBe(false);
    });

    it('prefers standard mode when both files exist (edge case)', async () => {
      const clientId = 'client-both-001';
      const store = {
        ...createStandardModeStore(clientId),
        ...createAuditAssistedStore(clientId),
      };
      const r2Client = createMockR2Client(store);
      const manager = new ReviewManager({ r2Client });

      const result = await manager.detectMode(clientId);

      expect(result.mode).toBe('standard');
      expect(result.bothExist).toBe(true);
      expect(result.warning).toContain('Both');
    });

    it('throws error when neither file exists', async () => {
      const r2Client = createMockR2Client({});
      const manager = new ReviewManager({ r2Client });

      await expect(manager.detectMode('no-files')).rejects.toThrow('No artifacts found');
    });
  });

  // =========================================================================
  // AC 2: Color Palette Review
  // =========================================================================
  describe('AC 2: Color Palette Review', () => {
    it('displays 6 colors with hex values and contrast ratios', () => {
      const palette = createColorPalette();
      const reviewer = new ColorReviewer(palette);
      const data = reviewer.getReviewData();

      expect(data.editedColors).toHaveLength(6);
      expect(data.contrastPairs.length).toBeGreaterThan(0);
      // 6 choose 2 = 15 pairs
      expect(data.contrastPairs).toHaveLength(15);
    });

    it('computes WCAG contrast ratios correctly', () => {
      // Black vs white should be 21:1
      const ratio = calculateContrastRatio('#000000', '#ffffff');
      expect(ratio).toBe(21);

      // Same color should be 1:1
      const sameRatio = calculateContrastRatio('#ff0000', '#ff0000');
      expect(sameRatio).toBe(1);
    });

    it('flags pairs below WCAG AA threshold (< 4.5:1)', () => {
      const palette: ColorPalette = {
        colors: [
          { role: 'primary', color: { hex: '#cccccc', rgb: { r: 204, g: 204, b: 204 }, hsl: { h: 0, s: 0, l: 80 } }, rationale: 'Light gray' },
          { role: 'background', color: { hex: '#ffffff', rgb: { r: 255, g: 255, b: 255 }, hsl: { h: 0, s: 0, l: 100 } }, rationale: 'White' },
        ],
        generationRationale: 'Test',
      };
      const reviewer = new ColorReviewer(palette);
      const data = reviewer.getReviewData();

      expect(data.hasAccessibilityWarnings).toBe(true);
      const failingPairs = reviewer.getFailingPairs();
      expect(failingPairs.length).toBeGreaterThan(0);
      expect(failingPairs[0].passesAA).toBe(false);
    });

    it('allows adjusting color via hex input', () => {
      const palette = createColorPalette();
      const reviewer = new ColorReviewer(palette);

      const updated = reviewer.updateColor('primary', '#ff0000');
      expect(updated).toBe(true);

      const data = reviewer.getReviewData();
      const primary = data.editedColors.find((c) => c.role === 'primary');
      expect(primary?.color.hex).toBe('#ff0000');
    });

    it('rejects invalid hex values', () => {
      const palette = createColorPalette();
      const reviewer = new ColorReviewer(palette);

      expect(reviewer.updateColor('primary', 'not-a-hex')).toBe(false);
      expect(reviewer.updateColor('primary', '#xyz')).toBe(false);
    });

    it('validates hex correctly', () => {
      expect(isValidHex('#ff0000')).toBe(true);
      expect(isValidHex('#FFF')).toBe(true);
      expect(isValidHex('aabbcc')).toBe(true);
      expect(isValidHex('#xyz')).toBe(false);
      expect(isValidHex('')).toBe(false);
      expect(isValidHex('#12345')).toBe(false);
    });

    it('normalizes hex to 6-digit lowercase', () => {
      expect(normalizeHex('#FFF')).toBe('#ffffff');
      expect(normalizeHex('ABC')).toBe('#aabbcc');
      expect(normalizeHex('#ff0000')).toBe('#ff0000');
    });

    it('parses hex to RGB', () => {
      const rgb = parseHexToRgb('#ff8000');
      expect(rgb).toEqual({ r: 255, g: 128, b: 0 });
    });
  });

  // =========================================================================
  // AC 3: Typography Review
  // =========================================================================
  describe('AC 3: Typography Review', () => {
    it('displays 2 pairings', () => {
      const result = createTypographyResult();
      const reviewer = new TypographyReviewer(result.pairings);
      const data = reviewer.getReviewData();

      expect(data.pairings).toHaveLength(2);
      expect(data.selectedIndex).toBeNull();
    });

    it('allows selecting 1 pairing', () => {
      const result = createTypographyResult();
      const reviewer = new TypographyReviewer(result.pairings);

      const selected = reviewer.selectPairing(0);
      expect(selected).toBe(true);

      const data = reviewer.getReviewData();
      expect(data.selectedIndex).toBe(0);

      const pairing = reviewer.getSelectedPairing();
      expect(pairing).not.toBeNull();
      expect(pairing?.heading.family).toBe('Roboto');
    });

    it('rejects invalid pairing index', () => {
      const result = createTypographyResult();
      const reviewer = new TypographyReviewer(result.pairings);

      expect(reviewer.selectPairing(-1)).toBe(false);
      expect(reviewer.selectPairing(99)).toBe(false);
    });

    it('allows adjusting font choices', () => {
      const result = createTypographyResult();
      const reviewer = new TypographyReviewer(result.pairings);

      const updated = reviewer.updateFont(0, 'heading', { family: 'Montserrat' });
      expect(updated).toBe(true);

      const data = reviewer.getReviewData();
      expect(data.pairings[0].heading.family).toBe('Montserrat');
    });

    it('throws on empty pairings', () => {
      expect(() => new TypographyReviewer([])).toThrow('At least one typography pairing');
    });
  });

  // =========================================================================
  // AC 4: Moodboard Curation
  // =========================================================================
  describe('AC 4: Moodboard Curation', () => {
    it('displays 8-12 images in a grid', () => {
      const manifest = createMoodboardManifest();
      const reviewer = new MoodboardReviewer(manifest);
      const data = reviewer.getReviewData();

      expect(data.images).toHaveLength(8);
      expect(data.images.every((i) => i.status === 'pending')).toBe(true);
    });

    it('allows approve/reject per image', () => {
      const manifest = createMoodboardManifest();
      const reviewer = new MoodboardReviewer(manifest);

      reviewer.approveImage(0);
      reviewer.rejectImage(1);

      const data = reviewer.getReviewData();
      expect(data.images[0].status).toBe('approved');
      expect(data.images[1].status).toBe('rejected');
      expect(data.approvedCount).toBe(1);
      expect(data.rejectedCount).toBe(1);
    });

    it('enforces minimum 4 approved images', () => {
      const manifest = createMoodboardManifest();
      const reviewer = new MoodboardReviewer(manifest);

      // Approve 3 — not enough
      reviewer.approveImage(0);
      reviewer.approveImage(1);
      reviewer.approveImage(2);
      expect(reviewer.meetsMinimumApproval()).toBe(false);

      // Approve 4th — enough
      reviewer.approveImage(3);
      expect(reviewer.meetsMinimumApproval()).toBe(true);
    });

    it('supports regeneration request for rejected images', () => {
      const manifest = createMoodboardManifest();
      const reviewer = new MoodboardReviewer(manifest);

      reviewer.rejectImage(5);
      const requested = reviewer.requestRegeneration(5, 'Too abstract');
      expect(requested).toBe(true);

      const data = reviewer.getReviewData();
      expect(data.regenerationRequests).toHaveLength(1);
      expect(data.regenerationRequests[0].rejectedImageIndex).toBe(5);
      expect(data.regenerationRequests[0].reason).toBe('Too abstract');
    });

    it('rejects regeneration for non-rejected images', () => {
      const manifest = createMoodboardManifest();
      const reviewer = new MoodboardReviewer(manifest);

      reviewer.approveImage(0);
      expect(reviewer.requestRegeneration(0)).toBe(false);
    });

    it('returns approved image keys', () => {
      const manifest = createMoodboardManifest();
      const reviewer = new MoodboardReviewer(manifest);

      reviewer.approveImage(0);
      reviewer.approveImage(2);
      reviewer.approveImage(4);

      const keys = reviewer.getApprovedImageKeys();
      expect(keys).toHaveLength(3);
      expect(keys).toContain('brand-assets/test/moodboard/0.jpg');
      expect(keys).toContain('brand-assets/test/moodboard/2.jpg');
      expect(keys).toContain('brand-assets/test/moodboard/4.jpg');
    });
  });

  // =========================================================================
  // AC 5: Voice Definition Review
  // =========================================================================
  describe('AC 5: Voice Definition Review', () => {
    it('displays tone spectrum, vocabulary, and guidelines', () => {
      const voice = createVoiceDefinition();
      const reviewer = new VoiceReviewer(voice);
      const data = reviewer.getReviewData();

      expect(data.toneScales).toHaveLength(2);
      expect(data.vocabularyGuide.useWords).toHaveLength(3);
      expect(data.vocabularyGuide.avoidWords).toHaveLength(2);
      expect(data.communicationGuidelines).toHaveLength(3);
    });

    it('allows inline editing of tone scale', () => {
      const voice = createVoiceDefinition();
      const reviewer = new VoiceReviewer(voice);

      const updated = reviewer.updateToneScale(0, 5);
      expect(updated).toBe(true);

      const data = reviewer.getReviewData();
      expect(data.toneScales[0].position).toBe(5);
      expect(data.isDirty).toBe(true);
    });

    it('rejects out-of-range tone scale values', () => {
      const voice = createVoiceDefinition();
      const reviewer = new VoiceReviewer(voice);

      expect(reviewer.updateToneScale(0, 0)).toBe(false);
      expect(reviewer.updateToneScale(0, 6)).toBe(false);
    });

    it('allows editing vocabulary words', () => {
      const voice = createVoiceDefinition();
      const reviewer = new VoiceReviewer(voice);

      reviewer.setUseWords(['awesome', 'great']);
      const data = reviewer.getReviewData();
      expect(data.vocabularyGuide.useWords).toEqual(['awesome', 'great']);
      expect(data.isDirty).toBe(true);
    });

    it('allows editing communication guidelines', () => {
      const voice = createVoiceDefinition();
      const reviewer = new VoiceReviewer(voice);

      reviewer.updateGuideline(0, 'Keep it short.');
      const data = reviewer.getReviewData();
      expect(data.communicationGuidelines[0]).toBe('Keep it short.');
    });

    it('allows adding and removing guidelines', () => {
      const voice = createVoiceDefinition();
      const reviewer = new VoiceReviewer(voice);

      reviewer.addGuideline('New guideline');
      expect(reviewer.getReviewData().communicationGuidelines).toHaveLength(4);

      reviewer.removeGuideline(3);
      expect(reviewer.getReviewData().communicationGuidelines).toHaveLength(3);
    });

    it('auto-saves to R2 when dirty', async () => {
      const store: Record<string, unknown> = {};
      const r2Client = createMockR2Client(store);
      const voice = createVoiceDefinition();
      const reviewer = new VoiceReviewer(voice, {
        r2Client,
        r2Key: 'brand-assets/test/voice.json',
      });

      reviewer.updateToneScale(0, 5);
      expect(reviewer.hasPendingEdits()).toBe(true);

      const saved = await reviewer.autoSave();
      expect(saved).toBe(true);
      expect(reviewer.hasPendingEdits()).toBe(false);
      expect(r2Client.uploadJson).toHaveBeenCalledWith(
        'brand-assets/test/voice.json',
        expect.objectContaining({ toneScales: expect.any(Array) })
      );
    });

    it('returns false on auto-save when not dirty', async () => {
      const voice = createVoiceDefinition();
      const reviewer = new VoiceReviewer(voice);

      const saved = await reviewer.autoSave();
      expect(saved).toBe(false);
    });

    it('cleans up timer on dispose', () => {
      const voice = createVoiceDefinition();
      const reviewer = new VoiceReviewer(voice);

      reviewer.startAutoSave();
      reviewer.dispose();
      // No error means timer was cleaned up
    });
  });

  // =========================================================================
  // AC 6: Token Draft Review
  // =========================================================================
  describe('AC 6: Token Draft Review', () => {
    it('flattens tokens into table view', () => {
      const draft = createTokensDraft();
      const reviewer = new TokenReviewer(draft);
      const data = reviewer.getReviewData();

      expect(data.flattenedTokens.length).toBeGreaterThan(0);
      const primaryToken = data.flattenedTokens.find((t) => t.path === 'color.primary');
      expect(primaryToken).toBeDefined();
      expect(primaryToken?.value).toBe('#1a73e8');
      expect(primaryToken?.type).toBe('color');
    });

    it('allows editing token values', () => {
      const draft = createTokensDraft();
      const reviewer = new TokenReviewer(draft);

      const updated = reviewer.updateTokenValue('color.primary', '#ff0000');
      expect(updated).toBe(true);

      const data = reviewer.getReviewData();
      const primary = data.flattenedTokens.find((t) => t.path === 'color.primary');
      expect(primary?.value).toBe('#ff0000');
      expect(data.hasEdits).toBe(true);
    });

    it('returns false for unknown token path', () => {
      const draft = createTokensDraft();
      const reviewer = new TokenReviewer(draft);

      expect(reviewer.updateTokenValue('color.nonexistent', '#000')).toBe(false);
    });

    it('rebuilds nested DTCG structure from edits', () => {
      const draft = createTokensDraft();
      const reviewer = new TokenReviewer(draft);

      reviewer.updateTokenValue('color.primary', '#ff0000');
      const edited = reviewer.getEditedDraft();

      expect(edited.color).toBeDefined();
      expect(edited.typography).toBeDefined();
      // Verify the edited token
      const primaryToken = edited.color['primary'] as { $value: string; $type: string };
      expect(primaryToken.$value).toBe('#ff0000');
      expect(primaryToken.$type).toBe('color');
    });

    it('saves to R2', async () => {
      const store: Record<string, unknown> = {};
      const r2Client = createMockR2Client(store);
      const draft = createTokensDraft();
      const reviewer = new TokenReviewer(draft);

      reviewer.updateTokenValue('color.primary', '#ff0000');
      const saved = await reviewer.saveTo(r2Client, 'brand-assets/test/tokens.json');

      expect(saved).toBe(true);
      expect(r2Client.uploadJson).toHaveBeenCalled();
      expect(reviewer.hasPendingEdits()).toBe(false);
    });

    it('flattens and unflattens round-trip correctly', () => {
      const group: DTCGTokenGroup = {
        primary: { $value: '#ff0000', $type: 'color', $description: 'Main color' },
        nested: {
          child: { $value: 16, $type: 'dimension' },
        },
      };

      const flat = flattenTokens(group);
      expect(flat).toHaveLength(2);
      expect(flat[0].path).toBe('primary');
      expect(flat[1].path).toBe('nested.child');

      const rebuilt = unflattenTokens(flat);
      expect((rebuilt['primary'] as { $value: string }).$value).toBe('#ff0000');
      const nested = rebuilt['nested'] as { child: { $value: number } };
      expect(nested.child.$value).toBe(16);
    });
  });

  // =========================================================================
  // AC 7: Data Quality Warning Banner
  // =========================================================================
  describe('AC 7: Data Quality Warning Banner', () => {
    it('shows banner when critical_data_quality_alert is true', async () => {
      const clientId = 'client-quality-001';
      const store = {
        ...createStandardModeStore(clientId),
        [buildDataQualityReportR2Key(clientId)]: createDataQualityReport(clientId, { critical: true }),
      };
      const r2Client = createMockR2Client(store);
      const manager = new ReviewManager({ r2Client });

      await manager.loadArtifacts(clientId);
      const state = manager.getReviewState();

      expect(state.dataQualityWarning.showBanner).toBe(true);
      expect(state.dataQualityWarning.criticalAlert).toBe(true);
    });

    it('shows banner when overall_confidence is low', async () => {
      const clientId = 'client-quality-002';
      const store = {
        ...createStandardModeStore(clientId),
        [buildDataQualityReportR2Key(clientId)]: createDataQualityReport(clientId, { low: true }),
      };
      const r2Client = createMockR2Client(store);
      const manager = new ReviewManager({ r2Client });

      await manager.loadArtifacts(clientId);
      const state = manager.getReviewState();

      expect(state.dataQualityWarning.showBanner).toBe(true);
      expect(state.dataQualityWarning.lowConfidence).toBe(true);
    });

    it('does not show banner when quality is good', async () => {
      const clientId = 'client-quality-003';
      const store = {
        ...createStandardModeStore(clientId),
        [buildDataQualityReportR2Key(clientId)]: createDataQualityReport(clientId),
      };
      const r2Client = createMockR2Client(store);
      const manager = new ReviewManager({ r2Client });

      await manager.loadArtifacts(clientId);
      const state = manager.getReviewState();

      expect(state.dataQualityWarning.showBanner).toBe(false);
    });

    it('handles missing quality report gracefully', async () => {
      const clientId = 'client-quality-004';
      const store = createStandardModeStore(clientId);
      // No data quality report in store
      const r2Client = createMockR2Client(store);
      const manager = new ReviewManager({ r2Client });

      await manager.loadArtifacts(clientId);
      const state = manager.getReviewState();

      expect(state.dataQualityWarning.showBanner).toBe(false);
    });
  });

  // =========================================================================
  // AC 8: AI Draft Badge
  // =========================================================================
  describe('AC 8: AI Draft Badge (NFR-9.7)', () => {
    it('shows AI Draft badge in audit-assisted mode', async () => {
      const clientId = 'client-badge-001';
      const store = createAuditAssistedStore(clientId);
      const r2Client = createMockR2Client(store);
      const manager = new ReviewManager({ r2Client });

      await manager.loadArtifacts(clientId);

      expect(manager.shouldShowAIDraftBadge()).toBe(true);
      expect(manager.getAIDraftBadgeLabel()).toBe(AI_DRAFT_BADGE_LABEL);
      expect(manager.getAIDraftBadgeLabel()).toBe('AI Draft - Requires Human Validation');
    });

    it('does not show AI Draft badge in standard mode', async () => {
      const clientId = 'client-badge-002';
      const store = createStandardModeStore(clientId);
      const r2Client = createMockR2Client(store);
      const manager = new ReviewManager({ r2Client });

      await manager.loadArtifacts(clientId);

      expect(manager.shouldShowAIDraftBadge()).toBe(false);
    });
  });

  // =========================================================================
  // AC 9: Review Summary + CTA
  // =========================================================================
  describe('AC 9: Review Summary + Approve CTA', () => {
    it('tracks section completion state', async () => {
      const clientId = 'client-summary-001';
      const store = createStandardModeStore(clientId);
      const r2Client = createMockR2Client(store);
      const manager = new ReviewManager({ r2Client });

      await manager.loadArtifacts(clientId);
      const state = manager.getReviewState();

      // All sections should be in_progress after loading
      for (const sectionId of Object.keys(state.sections) as ReviewSectionId[]) {
        expect(state.sections[sectionId].status).toBe('in_progress');
      }
      expect(state.allSectionsSaved).toBe(false);
    });

    it('CTA enabled only when all sections saved', async () => {
      const clientId = 'client-summary-002';
      const store = createStandardModeStore(clientId);
      const r2Client = createMockR2Client(store);
      const manager = new ReviewManager({ r2Client });

      await manager.loadArtifacts(clientId);

      // Select typography
      manager.getTypographyReviewer().selectPairing(0);
      // Approve moodboard images
      for (let i = 0; i < 5; i++) {
        manager.getMoodboardReviewer().approveImage(i);
      }

      // Save all sections
      manager.saveColorPalette();
      manager.saveTypography();
      manager.saveMoodboard();
      manager.saveVoiceDefinition();
      manager.saveTokenDraft();

      const state = manager.getReviewState();
      expect(state.allSectionsSaved).toBe(true);
    });

    it('CTA remains disabled when a section is not saved', async () => {
      const clientId = 'client-summary-003';
      const store = createStandardModeStore(clientId);
      const r2Client = createMockR2Client(store);
      const manager = new ReviewManager({ r2Client });

      await manager.loadArtifacts(clientId);

      manager.saveColorPalette();
      manager.saveVoiceDefinition();
      manager.saveTokenDraft();
      // typography and moodboard not saved

      const state = manager.getReviewState();
      expect(state.allSectionsSaved).toBe(false);
    });
  });

  // =========================================================================
  // AC 10: Approval Flow
  // =========================================================================
  describe('AC 10: Approval - writes approved-direction.json + updates ClickUp', () => {
    it('writes approved-direction.json to R2 on approval', async () => {
      const clientId = 'client-approve-001';
      const store = createStandardModeStore(clientId);
      const r2Client = createMockR2Client(store);
      const clickUpClient = createMockClickUpClient();
      const manager = new ReviewManager({
        r2Client,
        clickUpClient,
        clickUpTaskId: 'TASK-123',
      });

      await manager.loadArtifacts(clientId);

      // Complete all sections
      manager.getTypographyReviewer().selectPairing(0);
      for (let i = 0; i < 5; i++) {
        manager.getMoodboardReviewer().approveImage(i);
      }
      manager.saveColorPalette();
      manager.saveTypography();
      manager.saveMoodboard();
      manager.saveVoiceDefinition();
      manager.saveTokenDraft();

      const result = await manager.approve('Looks great!');

      expect(result.success).toBe(true);
      expect(result.approvedDirection).toBeDefined();
      expect(result.approvedDirection?.client_id).toBe(clientId);
      expect(result.approvedDirection?.onboarding_mode).toBe('standard');
      expect(result.approvedDirection?.reviewer_notes).toBe('Looks great!');
      expect(result.r2Key).toBe(buildApprovedDirectionR2Key(clientId));
    });

    it('updates ClickUp status to "Ready for Client Review"', async () => {
      const clientId = 'client-approve-002';
      const store = createStandardModeStore(clientId);
      const r2Client = createMockR2Client(store);
      const clickUpClient = createMockClickUpClient();
      const manager = new ReviewManager({
        r2Client,
        clickUpClient,
        clickUpTaskId: 'TASK-456',
      });

      await manager.loadArtifacts(clientId);

      manager.getTypographyReviewer().selectPairing(0);
      for (let i = 0; i < 5; i++) {
        manager.getMoodboardReviewer().approveImage(i);
      }
      manager.saveColorPalette();
      manager.saveTypography();
      manager.saveMoodboard();
      manager.saveVoiceDefinition();
      manager.saveTokenDraft();

      const result = await manager.approve();

      expect(result.clickUpUpdated).toBe(true);
      expect(clickUpClient.updateTaskStatus).toHaveBeenCalledWith(
        'TASK-456',
        CLICKUP_READY_FOR_CLIENT_REVIEW
      );
    });

    it('fails when not all sections are saved', async () => {
      const clientId = 'client-approve-003';
      const store = createStandardModeStore(clientId);
      const r2Client = createMockR2Client(store);
      const manager = new ReviewManager({ r2Client });

      await manager.loadArtifacts(clientId);
      // Don't save any sections

      const result = await manager.approve();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Not all sections are saved');
    });

    it('fails when no typography pairing is selected', async () => {
      const clientId = 'client-approve-004';
      const store = createStandardModeStore(clientId);
      const r2Client = createMockR2Client(store);
      const manager = new ReviewManager({ r2Client });

      await manager.loadArtifacts(clientId);

      // Save all sections without selecting typography
      manager.saveColorPalette();
      manager.saveTypography(); // Won't actually save because no selection
      for (let i = 0; i < 5; i++) {
        manager.getMoodboardReviewer().approveImage(i);
      }
      manager.saveMoodboard();
      manager.saveVoiceDefinition();
      manager.saveTokenDraft();

      // Typography not saved because no selection
      const state = manager.getReviewState();
      expect(state.sections.typography.status).not.toBe('saved');
    });

    it('fails gracefully when review not initialized', async () => {
      const r2Client = createMockR2Client({});
      const manager = new ReviewManager({ r2Client });

      const result = await manager.approve();
      expect(result.success).toBe(false);
      expect(result.error).toContain('not initialized');
    });

    it('handles ClickUp failure gracefully (R2 still succeeds)', async () => {
      const clientId = 'client-approve-005';
      const store = createStandardModeStore(clientId);
      const r2Client = createMockR2Client(store);
      const clickUpClient = createMockClickUpClient();
      (clickUpClient.updateTaskStatus as jest.Mock).mockRejectedValue(new Error('ClickUp down'));

      const manager = new ReviewManager({
        r2Client,
        clickUpClient,
        clickUpTaskId: 'TASK-789',
      });

      await manager.loadArtifacts(clientId);

      manager.getTypographyReviewer().selectPairing(0);
      for (let i = 0; i < 5; i++) {
        manager.getMoodboardReviewer().approveImage(i);
      }
      manager.saveColorPalette();
      manager.saveTypography();
      manager.saveMoodboard();
      manager.saveVoiceDefinition();
      manager.saveTokenDraft();

      const result = await manager.approve();

      expect(result.success).toBe(true);
      expect(result.clickUpUpdated).toBe(false);
    });
  });

  // =========================================================================
  // Full Audit-Assisted Mode Flow
  // =========================================================================
  describe('Full audit-assisted mode flow', () => {
    it('loads and reviews audit-assisted artifacts end-to-end', async () => {
      const clientId = 'client-audit-e2e';
      const store = createAuditAssistedStore(clientId);
      const r2Client = createMockR2Client(store);
      const manager = new ReviewManager({ r2Client });

      await manager.loadArtifacts(clientId);

      const state = manager.getReviewState();
      expect(state.mode).toBe('audit_assisted');
      expect(state.isAuditAssisted).toBe(true);
      expect(manager.shouldShowAIDraftBadge()).toBe(true);

      // Access all reviewers
      expect(manager.getColorReviewer()).toBeDefined();
      expect(manager.getTypographyReviewer()).toBeDefined();
      expect(manager.getMoodboardReviewer()).toBeDefined();
      expect(manager.getVoiceReviewer()).toBeDefined();
      expect(manager.getTokenReviewer()).toBeDefined();
    });
  });

  // =========================================================================
  // Approval Handler (standalone)
  // =========================================================================
  describe('ApprovalHandler', () => {
    it('validates sections correctly', () => {
      const sections: Record<ReviewSectionId, ReviewSectionState> = {
        color_palette: { sectionId: 'color_palette', status: 'saved', hasPendingEdits: false },
        typography: { sectionId: 'typography', status: 'saved', hasPendingEdits: false },
        moodboard: { sectionId: 'moodboard', status: 'saved', hasPendingEdits: false },
        voice_definition: { sectionId: 'voice_definition', status: 'in_progress', hasPendingEdits: true },
        token_draft: { sectionId: 'token_draft', status: 'saved', hasPendingEdits: false },
      };

      const handler = new ApprovalHandler({ r2Client: createMockR2Client() });
      const missing = handler.validateSections(sections, 5);

      expect(missing).toHaveLength(1);
      expect(missing[0]).toContain('Voice definition');
    });

    it('validates moodboard minimum count', () => {
      const sections: Record<ReviewSectionId, ReviewSectionState> = {
        color_palette: { sectionId: 'color_palette', status: 'saved', hasPendingEdits: false },
        typography: { sectionId: 'typography', status: 'saved', hasPendingEdits: false },
        moodboard: { sectionId: 'moodboard', status: 'saved', hasPendingEdits: false },
        voice_definition: { sectionId: 'voice_definition', status: 'saved', hasPendingEdits: false },
        token_draft: { sectionId: 'token_draft', status: 'saved', hasPendingEdits: false },
      };

      const handler = new ApprovalHandler({ r2Client: createMockR2Client() });
      const missing = handler.validateSections(sections, 2);

      expect(missing).toHaveLength(1);
      expect(missing[0]).toContain('4 moodboard');
    });

    it('builds correct approved direction structure', () => {
      const handler = new ApprovalHandler({ r2Client: createMockR2Client() });
      const direction = handler.buildApprovedDirection({
        clientId: 'test-client',
        mode: 'standard',
        colorPalette: createColorPalette(),
        typography: createTypographyResult().pairings[0],
        moodboardApprovedKeys: ['key1.jpg', 'key2.jpg'],
        voiceDefinition: createVoiceDefinition(),
        tokens: createTokensDraft(),
        reviewerNotes: 'Test note',
      });

      expect(direction.client_id).toBe('test-client');
      expect(direction.onboarding_mode).toBe('standard');
      expect(direction.approved_at).toBeDefined();
      expect(direction.moodboard_approved_keys).toHaveLength(2);
      expect(direction.reviewer_notes).toBe('Test note');
    });
  });

  // =========================================================================
  // R2 Key Helpers
  // =========================================================================
  describe('R2 Key Helpers', () => {
    it('builds correct R2 keys', () => {
      expect(buildApprovedDirectionR2Key('client-1')).toBe(
        'brand-assets/client-1/onboarding/approved-direction.json'
      );
      expect(buildAnalysisSummaryR2Key('client-1')).toBe(
        'brand-assets/client-1/onboarding/analysis-summary.json'
      );
      expect(buildDraftManifestR2Key('client-1')).toBe(
        'brand-assets/client-1/onboarding/ai-drafts/index.json'
      );
    });
  });

  // =========================================================================
  // WCAG Contrast Computation
  // =========================================================================
  describe('WCAG Contrast Computation', () => {
    it('computeContrastPairs generates all unique pairs', () => {
      const colors: PaletteColor[] = [
        { role: 'primary', color: { hex: '#000000', rgb: { r: 0, g: 0, b: 0 }, hsl: { h: 0, s: 0, l: 0 } }, rationale: 'Black' },
        { role: 'secondary', color: { hex: '#ffffff', rgb: { r: 255, g: 255, b: 255 }, hsl: { h: 0, s: 0, l: 100 } }, rationale: 'White' },
        { role: 'accent', color: { hex: '#ff0000', rgb: { r: 255, g: 0, b: 0 }, hsl: { h: 0, s: 100, l: 50 } }, rationale: 'Red' },
      ];

      const pairs = computeContrastPairs(colors);
      expect(pairs).toHaveLength(3); // 3 choose 2 = 3

      // Black vs White should pass AA
      const bw = pairs.find((p) => p.colorA === '#000000' && p.colorB === '#ffffff');
      expect(bw?.ratio).toBe(21);
      expect(bw?.passesAA).toBe(true);
    });

    it('correctly identifies failing AA pairs', () => {
      // Light gray on white
      const ratio = calculateContrastRatio('#c0c0c0', '#ffffff');
      expect(ratio).toBeLessThan(WCAG_AA_THRESHOLD);
    });
  });

  // =========================================================================
  // Section Reviewer Access Guards
  // =========================================================================
  describe('Reviewer access guards', () => {
    it('throws when accessing reviewers before loading artifacts', () => {
      const r2Client = createMockR2Client({});
      const manager = new ReviewManager({ r2Client });

      expect(() => manager.getColorReviewer()).toThrow('not initialized');
      expect(() => manager.getTypographyReviewer()).toThrow('not initialized');
      expect(() => manager.getMoodboardReviewer()).toThrow('not initialized');
      expect(() => manager.getVoiceReviewer()).toThrow('not initialized');
      expect(() => manager.getTokenReviewer()).toThrow('not initialized');
    });
  });

  // =========================================================================
  // Dispose
  // =========================================================================
  describe('Dispose', () => {
    it('cleans up voice auto-save on dispose', async () => {
      const clientId = 'client-dispose-001';
      const store = createStandardModeStore(clientId);
      const r2Client = createMockR2Client(store);
      const manager = new ReviewManager({ r2Client });

      await manager.loadArtifacts(clientId);
      manager.getVoiceReviewer().startAutoSave();
      manager.dispose();
      // No error thrown means cleanup succeeded
    });
  });
});
