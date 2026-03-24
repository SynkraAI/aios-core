/**
 * Tests for Client Approval Flow (BSS-7.8).
 *
 * Covers all 10 ACs: static HTML preview generation, inline CSS compliance,
 * client approval with confirmation, change requests with structured feedback,
 * ClickUp integration (non-blocking), footer disclaimer, BSS-7.9 trigger,
 * and R2 key correctness.
 */

import {
  ClientApprovalHandler,
  PreviewGenerator,
  PREVIEW_DISCLAIMER,
  APPROVAL_CONFIRMATION_TEXT,
  CLICKUP_CLIENT_APPROVED,
  CLICKUP_CHANGES_REQUESTED,
  buildClientApprovalR2Key,
  buildClientPreviewR2Key,
  buildApprovedDirectionR2Key,
} from '../approval';

import type {
  ApprovalR2Client,
  ApprovalClickUpClient,
  ClientPreviewData,
  ChangeRequest,
} from '../approval';

import type { ApprovedDirection } from '../review/review-types';

import type {
  ColorPalette,
  TypographyPairing,
  BrandVoiceDefinition,
  TokensDraft,
} from '../analysis/analysis-types';

// ---------------------------------------------------------------------------
// Mock Factories
// ---------------------------------------------------------------------------

function createMockR2Client(): ApprovalR2Client {
  return {
    downloadJson: jest.fn().mockResolvedValue(null),
    uploadJson: jest.fn().mockResolvedValue({ key: 'test-key' }),
    uploadFile: jest.fn().mockResolvedValue({ key: 'test-key' }),
  };
}

function createMockClickUpClient(): ApprovalClickUpClient {
  return {
    updateTaskStatus: jest.fn().mockResolvedValue(undefined),
    addComment: jest.fn().mockResolvedValue(undefined),
  };
}

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const TEST_CLIENT_ID = 'test-client-123';

const mockColorPalette: ColorPalette = {
  colors: [
    { role: 'primary', color: { hex: '#1A2B3C', rgb: { r: 26, g: 43, b: 60 }, hsl: { h: 210, s: 40, l: 17 } }, rationale: 'Primary brand color' },
    { role: 'secondary', color: { hex: '#4A5B6C', rgb: { r: 74, g: 91, b: 108 }, hsl: { h: 210, s: 19, l: 36 } }, rationale: 'Secondary color' },
    { role: 'accent', color: { hex: '#FF6B35', rgb: { r: 255, g: 107, b: 53 }, hsl: { h: 16, s: 100, l: 60 } }, rationale: 'Accent' },
    { role: 'neutral-light', color: { hex: '#F5F5F5', rgb: { r: 245, g: 245, b: 245 }, hsl: { h: 0, s: 0, l: 96 } }, rationale: 'Light neutral' },
    { role: 'neutral-dark', color: { hex: '#333333', rgb: { r: 51, g: 51, b: 51 }, hsl: { h: 0, s: 0, l: 20 } }, rationale: 'Dark neutral' },
    { role: 'background', color: { hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 }, hsl: { h: 0, s: 0, l: 100 } }, rationale: 'Background' },
  ],
  generationRationale: 'Test rationale',
};

const mockTypography: TypographyPairing = {
  heading: { family: 'Inter', weight: 700, style: 'normal', source: 'google-fonts' },
  body: { family: 'Open Sans', weight: 400, style: 'normal', source: 'google-fonts' },
  rationale: 'Modern pairing',
};

const mockVoiceDefinition: BrandVoiceDefinition = {
  toneScales: [
    { dimension: 'Formal/Casual', leftPole: 'Formal', rightPole: 'Casual', position: 2 },
  ],
  vocabularyGuide: {
    useWords: ['innovative', 'reliable'],
    avoidWords: ['cheap', 'basic'],
  },
  communicationGuidelines: ['Be direct and professional', 'Use active voice'],
};

const mockTokens: TokensDraft = {
  color: { primary: { $value: '#1A2B3C', $type: 'color' } },
  typography: { 'font-family-heading': { $value: 'Inter', $type: 'fontFamily' } },
};

const mockApprovedDirection: ApprovedDirection = {
  client_id: TEST_CLIENT_ID,
  approved_at: '2026-03-23T10:00:00.000Z',
  onboarding_mode: 'standard',
  color_palette: mockColorPalette,
  typography: mockTypography,
  moodboard_approved_keys: [
    'moodboard/img-001.jpg',
    'moodboard/img-002.jpg',
    'moodboard/img-003.jpg',
    'moodboard/img-004.jpg',
  ],
  voice_definition: mockVoiceDefinition,
  tokens: mockTokens,
};

const mockPreviewData: ClientPreviewData = {
  clientId: TEST_CLIENT_ID,
  colorPalette: mockColorPalette,
  typography: mockTypography,
  moodboardApprovedKeys: [
    'moodboard/img-001.jpg',
    'moodboard/img-002.jpg',
    'moodboard/img-003.jpg',
    'moodboard/img-004.jpg',
  ],
  voiceDefinition: mockVoiceDefinition,
  tokens: mockTokens,
};

// ===========================================================================
// Test Suites
// ===========================================================================

describe('BSS-7.8: Client Approval Flow', () => {
  // =========================================================================
  // Preview Generator Tests
  // =========================================================================

  describe('PreviewGenerator', () => {
    let mockR2: ApprovalR2Client;
    let generator: PreviewGenerator;

    beforeEach(() => {
      mockR2 = createMockR2Client();
      generator = new PreviewGenerator(mockR2);
    });

    test('AC-1: generates static HTML preview from approved direction data', () => {
      const html = generator.generatePreview(mockPreviewData);

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html');
      expect(html).toContain('</html>');
      expect(html).toContain('Brand Direction Preview');
      expect(html).toContain(TEST_CLIENT_ID);
    });

    test('AC-2, CON-22: preview has inline CSS, no external stylesheets, no server deps', () => {
      const html = generator.generatePreview(mockPreviewData);

      // Has inline CSS in <style> block
      expect(html).toContain('<style>');
      expect(html).toContain('</style>');

      // No external CSS links
      expect(html).not.toMatch(/<link\s[^>]*rel=["']stylesheet["']/);
      // No external script tags with src
      expect(html).not.toMatch(/<script\s[^>]*src=/);
    });

    test('AC-1: preview includes color palette with hex values and roles', () => {
      const html = generator.generatePreview(mockPreviewData);

      // Check all 6 colors appear
      expect(html).toContain('#1A2B3C');
      expect(html).toContain('#4A5B6C');
      expect(html).toContain('#FF6B35');
      expect(html).toContain('#F5F5F5');
      expect(html).toContain('#333333');
      expect(html).toContain('#FFFFFF');

      // Check roles appear
      expect(html).toContain('primary');
      expect(html).toContain('secondary');
      expect(html).toContain('accent');
    });

    test('AC-1: preview includes typography samples with font names', () => {
      const html = generator.generatePreview(mockPreviewData);

      expect(html).toContain('Inter');
      expect(html).toContain('Open Sans');
      expect(html).toContain('Heading Font');
      expect(html).toContain('Body Font');
    });

    test('AC-1: preview includes moodboard image grid', () => {
      const html = generator.generatePreview(mockPreviewData);

      expect(html).toContain('moodboard/img-001.jpg');
      expect(html).toContain('moodboard/img-002.jpg');
      expect(html).toContain('moodboard/img-003.jpg');
      expect(html).toContain('moodboard/img-004.jpg');
      expect(html).toContain('Moodboard');
    });

    test('AC-1: preview includes brand voice summary', () => {
      const html = generator.generatePreview(mockPreviewData);

      expect(html).toContain('Brand Voice');
      expect(html).toContain('Formal/Casual');
      expect(html).toContain('Formal');
      expect(html).toContain('Casual');
      expect(html).toContain('innovative');
      expect(html).toContain('reliable');
      expect(html).toContain('cheap');
      expect(html).toContain('basic');
      expect(html).toContain('Be direct and professional');
      expect(html).toContain('Use active voice');
    });

    test('AC-1: preview includes token preview as swatches and font samples', () => {
      const html = generator.generatePreview(mockPreviewData);

      expect(html).toContain('Design Tokens');
      expect(html).toContain('Color Tokens');
      expect(html).toContain('Typography Tokens');
      expect(html).toContain('#1A2B3C');
      expect(html).toContain('Inter');
    });

    test('AC-8: preview includes footer disclaimer', () => {
      const html = generator.generatePreview(mockPreviewData);

      expect(html).toContain(PREVIEW_DISCLAIMER.replace(/&/g, '&amp;'));
    });

    test('preview HTML has no absolute URLs', () => {
      const html = generator.generatePreview(mockPreviewData);

      // Should not contain http:// or https:// in img src or link href
      expect(html).not.toMatch(/src=["']https?:\/\//);
      expect(html).not.toMatch(/href=["']https?:\/\//);
    });

    test('generateAndStore uploads HTML to R2 at correct key', async () => {
      const r2Key = await generator.generateAndStore(TEST_CLIENT_ID, mockPreviewData);

      expect(r2Key).toBe(`brand-assets/${TEST_CLIENT_ID}/client-preview/index.html`);
      expect(mockR2.uploadFile).toHaveBeenCalledTimes(1);
      expect(mockR2.uploadFile).toHaveBeenCalledWith(
        r2Key,
        expect.any(Buffer),
        'text/html'
      );
    });
  });

  // =========================================================================
  // ClientApprovalHandler Tests
  // =========================================================================

  describe('ClientApprovalHandler', () => {
    let mockR2: ApprovalR2Client;
    let mockClickUp: ApprovalClickUpClient;
    let handler: ClientApprovalHandler;

    beforeEach(() => {
      mockR2 = createMockR2Client();
      mockClickUp = createMockClickUpClient();
      handler = new ClientApprovalHandler({
        r2Client: mockR2,
        clickUpClient: mockClickUp,
        clickUpTaskId: 'task-abc',
      });
    });

    // -----------------------------------------------------------------------
    // loadApprovedDirection
    // -----------------------------------------------------------------------

    test('loadApprovedDirection reads correct R2 key', async () => {
      (mockR2.downloadJson as jest.Mock).mockResolvedValueOnce(mockApprovedDirection);

      const result = await handler.loadApprovedDirection(TEST_CLIENT_ID);

      expect(result).toEqual(mockApprovedDirection);
      expect(mockR2.downloadJson).toHaveBeenCalledWith(
        `brand-assets/${TEST_CLIENT_ID}/onboarding/approved-direction.json`
      );
    });

    test('loadApprovedDirection returns null when not found', async () => {
      const result = await handler.loadApprovedDirection('nonexistent');

      expect(result).toBeNull();
    });

    // -----------------------------------------------------------------------
    // generatePreviewPage
    // -----------------------------------------------------------------------

    test('generatePreviewPage stores HTML in R2 at correct key', async () => {
      (mockR2.downloadJson as jest.Mock).mockResolvedValueOnce(mockApprovedDirection);

      const result = await handler.generatePreviewPage(TEST_CLIENT_ID);

      expect(result.success).toBe(true);
      expect(result.r2Key).toBe(
        `brand-assets/${TEST_CLIENT_ID}/client-preview/index.html`
      );
      expect(mockR2.uploadFile).toHaveBeenCalledTimes(1);
    });

    test('generatePreviewPage returns error when direction not found', async () => {
      const result = await handler.generatePreviewPage('missing-client');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Approved direction not found');
    });

    // -----------------------------------------------------------------------
    // approve
    // -----------------------------------------------------------------------

    test('AC-4: approve writes client-approval.json with approved: true and approved_for_setup: true', async () => {
      const result = await handler.approve({
        clientId: TEST_CLIENT_ID,
        confirmationChecked: true,
      });

      expect(result.success).toBe(true);
      expect(mockR2.uploadJson).toHaveBeenCalledWith(
        `brand-assets/${TEST_CLIENT_ID}/onboarding/client-approval.json`,
        expect.objectContaining({
          client_id: TEST_CLIENT_ID,
          approved: true,
          approved_for_setup: true,
        })
      );
    });

    test('AC-4: approve requires confirmationChecked to be true', async () => {
      const result = await handler.approve({
        clientId: TEST_CLIENT_ID,
        confirmationChecked: false,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain(APPROVAL_CONFIRMATION_TEXT);
      expect(mockR2.uploadJson).not.toHaveBeenCalled();
    });

    test('AC-7: approve posts ClickUp comment and updates status to "Client Approved"', async () => {
      await handler.approve({
        clientId: TEST_CLIENT_ID,
        confirmationChecked: true,
      });

      expect(mockClickUp.addComment).toHaveBeenCalledWith(
        'task-abc',
        expect.stringContaining('Client approved brand direction at')
      );
      expect(mockClickUp.updateTaskStatus).toHaveBeenCalledWith(
        'task-abc',
        CLICKUP_CLIENT_APPROVED
      );
    });

    test('AC-10: approval sets approved_for_setup: true for BSS-7.9 trigger', async () => {
      const result = await handler.approve({
        clientId: TEST_CLIENT_ID,
        confirmationChecked: true,
      });

      expect(result.success).toBe(true);
      const uploadCall = (mockR2.uploadJson as jest.Mock).mock.calls[0];
      const writtenRecord = uploadCall[1];
      expect(writtenRecord.approved_for_setup).toBe(true);
    });

    test('approve includes client_name and client_email when provided', async () => {
      await handler.approve({
        clientId: TEST_CLIENT_ID,
        clientName: 'Jane Doe',
        clientEmail: 'jane@example.com',
        confirmationChecked: true,
      });

      expect(mockR2.uploadJson).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          client_name: 'Jane Doe',
          client_email: 'jane@example.com',
        })
      );
    });

    test('ClickUp failure does not fail the approval operation', async () => {
      (mockClickUp.addComment as jest.Mock).mockRejectedValueOnce(
        new Error('ClickUp API timeout')
      );

      const result = await handler.approve({
        clientId: TEST_CLIENT_ID,
        confirmationChecked: true,
      });

      expect(result.success).toBe(true);
      expect(result.clickUpUpdated).toBe(false);
    });

    test('approve without ClickUp client still succeeds', async () => {
      const handlerNoClickUp = new ClientApprovalHandler({
        r2Client: mockR2,
      });

      const result = await handlerNoClickUp.approve({
        clientId: TEST_CLIENT_ID,
        confirmationChecked: true,
      });

      expect(result.success).toBe(true);
      expect(result.clickUpUpdated).toBe(false);
    });

    // -----------------------------------------------------------------------
    // requestChanges
    // -----------------------------------------------------------------------

    test('AC-5: request changes validates at least 1 non-empty section', async () => {
      const result = await handler.requestChanges({
        clientId: TEST_CLIENT_ID,
        changeRequests: [
          { section: 'color', feedback: '' },
          { section: 'typography', feedback: '   ' },
        ],
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('At least one section must have a non-empty feedback');
    });

    test('AC-5: request changes writes client-approval.json with approved: false', async () => {
      const result = await handler.requestChanges({
        clientId: TEST_CLIENT_ID,
        changeRequests: [
          { section: 'color', feedback: 'Too dark, prefer lighter tones' },
        ],
      });

      expect(result.success).toBe(true);
      expect(mockR2.uploadJson).toHaveBeenCalledWith(
        `brand-assets/${TEST_CLIENT_ID}/onboarding/client-approval.json`,
        expect.objectContaining({
          client_id: TEST_CLIENT_ID,
          approved: false,
          approved_for_setup: false,
          change_requests: [
            { section: 'color', feedback: 'Too dark, prefer lighter tones' },
          ],
        })
      );
    });

    test('AC-6: request changes posts structured ClickUp comment per section', async () => {
      await handler.requestChanges({
        clientId: TEST_CLIENT_ID,
        changeRequests: [
          { section: 'color', feedback: 'Too dark' },
          { section: 'typography', feedback: 'Need bolder fonts' },
        ],
      });

      expect(mockClickUp.addComment).toHaveBeenCalledTimes(1);
      const comment = (mockClickUp.addComment as jest.Mock).mock.calls[0][1] as string;
      expect(comment).toContain('## Client Change Requests');
      expect(comment).toContain('### Color');
      expect(comment).toContain('Too dark');
      expect(comment).toContain('### Typography');
      expect(comment).toContain('Need bolder fonts');
    });

    test('AC-6: request changes updates ClickUp status to "Changes Requested"', async () => {
      await handler.requestChanges({
        clientId: TEST_CLIENT_ID,
        changeRequests: [
          { section: 'voice', feedback: 'Too formal' },
        ],
      });

      expect(mockClickUp.updateTaskStatus).toHaveBeenCalledWith(
        'task-abc',
        CLICKUP_CHANGES_REQUESTED
      );
    });

    test('change request with all empty sections is rejected', async () => {
      const result = await handler.requestChanges({
        clientId: TEST_CLIENT_ID,
        changeRequests: [],
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('At least one section');
    });

    test('change request formats sections correctly in ClickUp comment', () => {
      const comment = handler.formatChangeRequestComment([
        { section: 'color', feedback: 'Primary is too blue' },
        { section: 'moodboard', feedback: 'Need warmer images' },
        { section: 'other', feedback: 'Add brand pattern' },
      ]);

      expect(comment).toBe(
        '## Client Change Requests\n\n' +
        '### Color\nPrimary is too blue\n\n' +
        '### Moodboard\nNeed warmer images\n\n' +
        '### Other\nAdd brand pattern'
      );
    });

    test('ClickUp failure does not fail the change request operation', async () => {
      (mockClickUp.updateTaskStatus as jest.Mock).mockRejectedValueOnce(
        new Error('ClickUp unavailable')
      );

      const result = await handler.requestChanges({
        clientId: TEST_CLIENT_ID,
        changeRequests: [
          { section: 'color', feedback: 'Needs work' },
        ],
      });

      expect(result.success).toBe(true);
      expect(result.clickUpUpdated).toBe(false);
    });
  });

  // =========================================================================
  // R2 Key Builder Tests
  // =========================================================================

  describe('R2 Key Builders', () => {
    test('buildClientApprovalR2Key returns correct path', () => {
      expect(buildClientApprovalR2Key('abc-123')).toBe(
        'brand-assets/abc-123/onboarding/client-approval.json'
      );
    });

    test('buildClientPreviewR2Key returns correct path', () => {
      expect(buildClientPreviewR2Key('abc-123')).toBe(
        'brand-assets/abc-123/client-preview/index.html'
      );
    });

    test('buildApprovedDirectionR2Key returns correct path', () => {
      expect(buildApprovedDirectionR2Key('abc-123')).toBe(
        'brand-assets/abc-123/onboarding/approved-direction.json'
      );
    });
  });
});
