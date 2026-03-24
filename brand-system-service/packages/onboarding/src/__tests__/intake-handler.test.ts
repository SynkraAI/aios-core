/**
 * Tests for IntakeHandler — multi-step intake flow.
 *
 * Covers all ACs: form steps, validation, save/resume, ClickUp integration,
 * R2 storage, progress indicator, and confirmation summary.
 */

import { IntakeHandler, IntakeError, IntakeValidationError } from '../intake-handler';
import type { IntakeHandlerConfig, IntakeHandlerDependencies } from '../intake-handler';
import type {
  ClickUpClient,
  R2StorageClient,
  SessionStorage,
  IntakeSession,
  CompanyBasics,
  BrandPersonality,
  VisualPreference,
  AssetUpload,
  CompetitorUrls,
  DeliverableSelection,
  IntakeFormData,
} from '../types';
import { INTAKE_STEPS, MOOD_TILES } from '../index';
import { isValidUrl, validateCompetitorUrls } from '../validators/url-validator';
import { validateLogoFile } from '../validators/file-validator';
import {
  validateCompanyBasics,
  validateBrandPersonality,
  validateVisualPreferences,
  validateDeliverableSelection,
} from '../validators/form-validators';

// ---------------------------------------------------------------------------
// Mock factories
// ---------------------------------------------------------------------------

function createMockR2Client(): jest.Mocked<R2StorageClient> {
  return {
    uploadJson: jest.fn().mockResolvedValue({ key: 'mock-r2-key' }),
    uploadFile: jest.fn().mockResolvedValue({ key: 'mock-r2-file-key' }),
    getJson: jest.fn().mockResolvedValue(null),
  };
}

function createMockClickUpClient(): jest.Mocked<ClickUpClient> {
  return {
    createTask: jest.fn().mockResolvedValue({
      taskId: 'clickup-task-123',
      taskUrl: 'https://app.clickup.com/t/clickup-task-123',
    }),
    updateTask: jest.fn().mockResolvedValue({
      taskId: 'clickup-task-123',
      taskUrl: 'https://app.clickup.com/t/clickup-task-123',
    }),
  };
}

function createMockSessionStorage(): jest.Mocked<SessionStorage> {
  const store = new Map<string, IntakeSession>();
  return {
    save: jest.fn().mockImplementation(async (token: string, session: IntakeSession) => {
      store.set(token, session);
    }),
    load: jest.fn().mockImplementation(async (token: string) => {
      return store.get(token) ?? null;
    }),
    delete: jest.fn().mockImplementation(async (token: string) => {
      store.delete(token);
    }),
  };
}

function createConfig(): IntakeHandlerConfig {
  return {
    clickUpListId: 'list-abc-123',
    r2PathPrefix: 'brand-assets',
  };
}

function createHandler(
  overrides?: Partial<IntakeHandlerDependencies>,
): {
  handler: IntakeHandler;
  r2Client: jest.Mocked<R2StorageClient>;
  clickUpClient: jest.Mocked<ClickUpClient>;
  sessionStorage: jest.Mocked<SessionStorage>;
} {
  const r2Client = createMockR2Client();
  const clickUpClient = createMockClickUpClient();
  const sessionStorage = createMockSessionStorage();

  const deps: IntakeHandlerDependencies = {
    r2Client: overrides?.r2Client ?? r2Client,
    clickUpClient: overrides?.clickUpClient ?? clickUpClient,
    sessionStorage: overrides?.sessionStorage ?? sessionStorage,
  };

  const handler = new IntakeHandler(createConfig(), deps);
  return { handler, r2Client, clickUpClient, sessionStorage };
}

// ---------------------------------------------------------------------------
// Test data helpers
// ---------------------------------------------------------------------------

function validCompanyBasics(): CompanyBasics {
  return {
    companyName: 'Acme Corp',
    industry: 'Technology',
    targetAudience: 'Small businesses',
    tagline: 'Building the future',
    foundingYear: 2020,
  };
}

function validBrandPersonality(): BrandPersonality {
  return {
    formalCasual: 3,
    traditionalInnovative: 4,
    seriousPlayful: 2,
    minimalExpressive: 5,
    localGlobal: 3,
  };
}

function validVisualPreference(): VisualPreference {
  return {
    selectedMoodIds: [MOOD_TILES[0].id, MOOD_TILES[1].id],
  };
}

function validAssetUpload(): AssetUpload {
  return {
    primaryLogo: {
      filename: 'logo.svg',
      mimeType: 'image/svg+xml',
      sizeBytes: 50_000,
      r2Key: 'brand-assets/acme/onboarding/logo-primary.svg',
    },
    brandColors: ['#FF5733', '#333333'],
    fontNames: ['Inter', 'Roboto'],
  };
}

function validCompetitorUrls(): CompetitorUrls {
  return {
    urls: [
      { url: 'https://competitor1.com', notes: 'Main competitor' },
      { url: 'https://competitor2.com' },
    ],
  };
}

function validDeliverableSelection(): DeliverableSelection {
  return {
    selected: ['brand-book', 'design-tokens', 'social-media-templates'],
  };
}

function validFormData(): IntakeFormData {
  return {
    companyBasics: validCompanyBasics(),
    brandPersonality: validBrandPersonality(),
    visualPreferences: validVisualPreference(),
    assetUpload: validAssetUpload(),
    competitorUrls: validCompetitorUrls(),
    deliverableSelection: validDeliverableSelection(),
  };
}

async function completeAllSteps(
  handler: IntakeHandler,
  sessionToken: string,
): Promise<IntakeSession> {
  await handler.submitStep(sessionToken, 'company-basics', validCompanyBasics());
  await handler.submitStep(sessionToken, 'brand-personality', validBrandPersonality());
  await handler.submitStep(sessionToken, 'visual-preferences', validVisualPreference());
  await handler.submitStep(sessionToken, 'asset-upload', validAssetUpload());
  await handler.submitStep(sessionToken, 'competitor-urls', validCompetitorUrls());
  return handler.submitStep(sessionToken, 'deliverable-selection', validDeliverableSelection());
}

// ===========================================================================
// Tests
// ===========================================================================

describe('IntakeHandler', () => {
  // -----------------------------------------------------------------------
  // Session Management (AC-8)
  // -----------------------------------------------------------------------

  describe('session management', () => {
    it('should start a new session with a unique token', async () => {
      const { handler } = createHandler();
      const session = await handler.startSession('acme-corp');

      expect(session.clientId).toBe('acme-corp');
      expect(session.sessionToken).toMatch(/^intake-/);
      expect(session.currentStep).toBe('company-basics');
      expect(session.completedSteps).toEqual([]);
      expect(session.partialData).toEqual({});
    });

    it('should resume an existing session', async () => {
      const { handler } = createHandler();
      const session = await handler.startSession('acme-corp');
      await handler.submitStep(session.sessionToken, 'company-basics', validCompanyBasics());

      const resumed = await handler.resumeSession(session.sessionToken);
      expect(resumed).not.toBeNull();
      expect(resumed?.clientId).toBe('acme-corp');
      expect(resumed?.completedSteps).toContain('company-basics');
      expect(resumed?.partialData.companyBasics).toEqual(validCompanyBasics());
    });

    it('should return null for unknown session token', async () => {
      const { handler } = createHandler();
      const result = await handler.resumeSession('nonexistent-token');
      expect(result).toBeNull();
    });

    it('should generate a resume URL with client_id and session_token', async () => {
      const { handler } = createHandler();
      const session = await handler.startSession('acme-corp');

      const url = handler.generateResumeUrl('https://intake.example.com', session);
      expect(url).toContain('client_id=acme-corp');
      expect(url).toContain('session_token=');
      expect(url).toStartWith('https://intake.example.com?');
    });
  });

  // -----------------------------------------------------------------------
  // Step Submission (AC-1 through AC-7)
  // -----------------------------------------------------------------------

  describe('step submission', () => {
    it('should submit Step 1: Company Basics', async () => {
      const { handler } = createHandler();
      const session = await handler.startSession('acme-corp');
      const updated = await handler.submitStep(
        session.sessionToken,
        'company-basics',
        validCompanyBasics(),
      );

      expect(updated.completedSteps).toContain('company-basics');
      expect(updated.currentStep).toBe('brand-personality');
      expect(updated.partialData.companyBasics).toEqual(validCompanyBasics());
    });

    it('should submit Step 2: Brand Personality with 5-point scales', async () => {
      const { handler } = createHandler();
      const session = await handler.startSession('acme-corp');
      await handler.submitStep(session.sessionToken, 'company-basics', validCompanyBasics());
      const updated = await handler.submitStep(
        session.sessionToken,
        'brand-personality',
        validBrandPersonality(),
      );

      expect(updated.completedSteps).toContain('brand-personality');
      expect(updated.partialData.brandPersonality?.formalCasual).toBe(3);
    });

    it('should submit Step 3: Visual Preferences with mood tile selection', async () => {
      const { handler } = createHandler();
      const session = await handler.startSession('acme-corp');
      await handler.submitStep(session.sessionToken, 'company-basics', validCompanyBasics());
      await handler.submitStep(session.sessionToken, 'brand-personality', validBrandPersonality());

      const updated = await handler.submitStep(
        session.sessionToken,
        'visual-preferences',
        validVisualPreference(),
      );

      expect(updated.completedSteps).toContain('visual-preferences');
      expect(updated.partialData.visualPreferences?.selectedMoodIds.length).toBeGreaterThanOrEqual(2);
    });

    it('should submit Step 4: Asset Upload', async () => {
      const { handler } = createHandler();
      const session = await handler.startSession('acme-corp');
      await handler.submitStep(session.sessionToken, 'company-basics', validCompanyBasics());
      await handler.submitStep(session.sessionToken, 'brand-personality', validBrandPersonality());
      await handler.submitStep(session.sessionToken, 'visual-preferences', validVisualPreference());

      const updated = await handler.submitStep(
        session.sessionToken,
        'asset-upload',
        validAssetUpload(),
      );

      expect(updated.completedSteps).toContain('asset-upload');
      expect(updated.partialData.assetUpload?.primaryLogo.filename).toBe('logo.svg');
    });

    it('should submit Step 5: Competitor URLs', async () => {
      const { handler } = createHandler();
      const session = await handler.startSession('acme-corp');
      await handler.submitStep(session.sessionToken, 'company-basics', validCompanyBasics());
      await handler.submitStep(session.sessionToken, 'brand-personality', validBrandPersonality());
      await handler.submitStep(session.sessionToken, 'visual-preferences', validVisualPreference());
      await handler.submitStep(session.sessionToken, 'asset-upload', validAssetUpload());

      const updated = await handler.submitStep(
        session.sessionToken,
        'competitor-urls',
        validCompetitorUrls(),
      );

      expect(updated.completedSteps).toContain('competitor-urls');
    });

    it('should submit Step 6: Deliverable Selection', async () => {
      const { handler } = createHandler();
      const session = await handler.startSession('acme-corp');
      const finalSession = await completeAllSteps(handler, session.sessionToken);

      expect(finalSession.completedSteps).toHaveLength(6);
      expect(finalSession.completedSteps).toEqual(
        expect.arrayContaining(INTAKE_STEPS as unknown as string[]),
      );
    });

    it('should throw IntakeError for unknown session token', async () => {
      const { handler } = createHandler();
      await expect(
        handler.submitStep('bad-token', 'company-basics', validCompanyBasics()),
      ).rejects.toThrow(IntakeError);
    });

    it('should throw IntakeValidationError for invalid step data', async () => {
      const { handler } = createHandler();
      const session = await handler.startSession('acme-corp');

      const invalidBasics = {
        companyName: '',
        industry: '',
        targetAudience: '',
        tagline: '',
        foundingYear: 0,
      };

      await expect(
        handler.submitStep(session.sessionToken, 'company-basics', invalidBasics),
      ).rejects.toThrow(IntakeValidationError);
    });
  });

  // -----------------------------------------------------------------------
  // Save-and-Resume Roundtrip (AC-8)
  // -----------------------------------------------------------------------

  describe('save-and-resume roundtrip', () => {
    it('should persist and restore all completed steps data', async () => {
      const { handler } = createHandler();
      const session = await handler.startSession('acme-corp');

      await handler.submitStep(session.sessionToken, 'company-basics', validCompanyBasics());
      await handler.submitStep(session.sessionToken, 'brand-personality', validBrandPersonality());

      const resumed = await handler.resumeSession(session.sessionToken);
      expect(resumed).not.toBeNull();
      expect(resumed?.partialData.companyBasics).toEqual(validCompanyBasics());
      expect(resumed?.partialData.brandPersonality).toEqual(validBrandPersonality());
      expect(resumed?.currentStep).toBe('visual-preferences');
      expect(resumed?.completedSteps).toEqual(['company-basics', 'brand-personality']);
    });

    it('should allow completing remaining steps after resume', async () => {
      const { handler } = createHandler();
      const session = await handler.startSession('acme-corp');

      await handler.submitStep(session.sessionToken, 'company-basics', validCompanyBasics());
      await handler.submitStep(session.sessionToken, 'brand-personality', validBrandPersonality());

      // Simulate resume
      const resumed = await handler.resumeSession(session.sessionToken);
      expect(resumed).not.toBeNull();

      // Complete remaining steps
      await handler.submitStep(session.sessionToken, 'visual-preferences', validVisualPreference());
      await handler.submitStep(session.sessionToken, 'asset-upload', validAssetUpload());
      await handler.submitStep(session.sessionToken, 'competitor-urls', validCompetitorUrls());
      const final = await handler.submitStep(
        session.sessionToken,
        'deliverable-selection',
        validDeliverableSelection(),
      );

      expect(final.completedSteps).toHaveLength(6);
    });
  });

  // -----------------------------------------------------------------------
  // Complete Submission Flow (AC-2, AC-10)
  // -----------------------------------------------------------------------

  describe('complete submission', () => {
    it('should submit successfully with R2 upload and ClickUp task', async () => {
      const { handler, r2Client, clickUpClient } = createHandler();
      const session = await handler.startSession('acme-corp');
      await completeAllSteps(handler, session.sessionToken);

      const result = await handler.submit(session.sessionToken);

      expect(result.success).toBe(true);
      expect(result.clientId).toBe('acme-corp');
      expect(result.r2Key).toBe('mock-r2-key');
      expect(result.clickUpTaskId).toBe('clickup-task-123');
      expect(result.clickUpTaskUrl).toBe('https://app.clickup.com/t/clickup-task-123');

      // Verify R2 upload was called (twice: once initial, once with ClickUp info)
      expect(r2Client.uploadJson).toHaveBeenCalledTimes(2);

      // First call uploads initial record
      const firstUploadCall = r2Client.uploadJson.mock.calls[0];
      expect(firstUploadCall[0]).toContain('acme-corp/onboarding/intake.json');
      const uploadedRecord = firstUploadCall[1] as Record<string, unknown>;
      expect(uploadedRecord).toHaveProperty('version', '1.0');
      expect(uploadedRecord).toHaveProperty('clientId', 'acme-corp');

      // ClickUp task was created
      expect(clickUpClient.createTask).toHaveBeenCalledTimes(1);
      expect(clickUpClient.createTask).toHaveBeenCalledWith(
        'list-abc-123',
        expect.objectContaining({
          name: expect.stringContaining('Acme Corp'),
        }),
      );

      // Summary includes all form data
      expect(result.summary.companyBasics.companyName).toBe('Acme Corp');
      expect(result.summary.brandPersonality.formalCasual).toBe(3);
      expect(result.summary.deliverableSelection.selected).toContain('brand-book');
    });

    it('should succeed even when ClickUp fails (graceful degradation NFR-9.6)', async () => {
      const clickUpClient = createMockClickUpClient();
      clickUpClient.createTask.mockRejectedValue(new Error('ClickUp API timeout'));

      const { handler, r2Client } = createHandler({ clickUpClient });
      const session = await handler.startSession('acme-corp');
      await completeAllSteps(handler, session.sessionToken);

      const result = await handler.submit(session.sessionToken);

      expect(result.success).toBe(true);
      expect(result.r2Key).toBe('mock-r2-key');
      expect(result.clickUpTaskId).toBeUndefined();
      expect(result.clickUpTaskUrl).toBeUndefined();

      // R2 upload was called once (no re-upload since ClickUp failed)
      expect(r2Client.uploadJson).toHaveBeenCalledTimes(1);
    });

    it('should throw when R2 upload fails', async () => {
      const r2Client = createMockR2Client();
      r2Client.uploadJson.mockRejectedValue(new Error('R2 connection failed'));

      const { handler } = createHandler({ r2Client });
      const session = await handler.startSession('acme-corp');
      await completeAllSteps(handler, session.sessionToken);

      await expect(handler.submit(session.sessionToken)).rejects.toThrow(IntakeError);
    });

    it('should throw when steps are not all completed', async () => {
      const { handler } = createHandler();
      const session = await handler.startSession('acme-corp');
      await handler.submitStep(session.sessionToken, 'company-basics', validCompanyBasics());

      await expect(handler.submit(session.sessionToken)).rejects.toThrow(
        /steps not completed/,
      );
    });

    it('should clean up session after successful submission', async () => {
      const { handler, sessionStorage } = createHandler();
      const session = await handler.startSession('acme-corp');
      await completeAllSteps(handler, session.sessionToken);
      await handler.submit(session.sessionToken);

      expect(sessionStorage.delete).toHaveBeenCalledWith(session.sessionToken);
    });
  });

  // -----------------------------------------------------------------------
  // Progress Indicator (AC-9)
  // -----------------------------------------------------------------------

  describe('progress indicator', () => {
    it('should show step 1 of 6 at start', async () => {
      const { handler } = createHandler();
      const session = await handler.startSession('acme-corp');
      const progress = handler.getProgress(session);

      expect(progress.currentStepNumber).toBe(1);
      expect(progress.totalSteps).toBe(6);
      expect(progress.currentStepId).toBe('company-basics');
      expect(progress.estimatedRemainingMinutes).toBe(15); // 6 * 2.5
    });

    it('should update progress after completing steps', async () => {
      const { handler } = createHandler();
      const session = await handler.startSession('acme-corp');
      const updated = await handler.submitStep(
        session.sessionToken,
        'company-basics',
        validCompanyBasics(),
      );

      const progress = handler.getProgress(updated);
      expect(progress.currentStepNumber).toBe(2);
      expect(progress.estimatedRemainingMinutes).toBe(12.5); // 5 * 2.5
      expect(progress.completedSteps).toContain('company-basics');
    });

    it('should show 0 remaining minutes when all steps complete', async () => {
      const { handler } = createHandler();
      const session = await handler.startSession('acme-corp');
      const finalSession = await completeAllSteps(handler, session.sessionToken);

      const progress = handler.getProgress(finalSession);
      expect(progress.estimatedRemainingMinutes).toBe(0);
      expect(progress.completedSteps).toHaveLength(6);
    });
  });

  // -----------------------------------------------------------------------
  // Confirmation Summary (AC-10)
  // -----------------------------------------------------------------------

  describe('confirmation summary', () => {
    it('should generate a complete summary of all form data', () => {
      const { handler } = createHandler();
      const summary = handler.generateSummary(validFormData());

      expect(summary.companyName).toBe('Acme Corp');
      expect(summary.industry).toBe('Technology');
      expect(summary.targetAudience).toBe('Small businesses');
      expect(summary.tagline).toBe('Building the future');
      expect(summary.foundingYear).toBe(2020);
      expect(summary.personality.formalCasual).toBe(3);
      expect(summary.selectedMoods).toHaveLength(2);
      expect(summary.primaryLogoFilename).toBe('logo.svg');
      expect(summary.brandColors).toEqual(['#FF5733', '#333333']);
      expect(summary.fontNames).toEqual(['Inter', 'Roboto']);
      expect(summary.competitorUrls).toHaveLength(2);
      expect(summary.deliverables).toContain('brand-book');
    });
  });
});

// ===========================================================================
// Validators Tests
// ===========================================================================

describe('URL Validator', () => {
  it('should accept valid https URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('https://www.example.com/page')).toBe(true);
    expect(isValidUrl('https://sub.domain.com/path?q=1')).toBe(true);
  });

  it('should accept valid http URLs', () => {
    expect(isValidUrl('http://example.com')).toBe(true);
  });

  it('should reject URLs without http/https', () => {
    expect(isValidUrl('ftp://example.com')).toBe(false);
    expect(isValidUrl('example.com')).toBe(false);
    expect(isValidUrl('www.example.com')).toBe(false);
  });

  it('should reject empty and invalid URLs', () => {
    expect(isValidUrl('')).toBe(false);
    expect(isValidUrl('not a url')).toBe(false);
    expect(isValidUrl('https://')).toBe(false);
    expect(isValidUrl('https://localhost')).toBe(false); // no dot in hostname
  });

  it('should validate competitor URLs collection min/max', () => {
    const tooFew = validateCompetitorUrls(['https://example.com']);
    expect(tooFew.valid).toBe(false);
    expect(tooFew.errors[0].code).toBe('MIN_URLS');

    const tooMany = validateCompetitorUrls([
      'https://a.com', 'https://b.com', 'https://c.com',
      'https://d.com', 'https://e.com', 'https://f.com',
    ]);
    expect(tooMany.valid).toBe(false);
    expect(tooMany.errors[0].code).toBe('MAX_URLS');

    const justRight = validateCompetitorUrls(['https://a.com', 'https://b.com']);
    expect(justRight.valid).toBe(true);
  });

  it('should detect duplicate URLs', () => {
    const result = validateCompetitorUrls([
      'https://example.com',
      'https://example.com/',
    ]);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'DUPLICATE_URL')).toBe(true);
  });
});

describe('File Validator', () => {
  it('should accept valid SVG logo', () => {
    const result = validateLogoFile({
      filename: 'logo.svg',
      mimeType: 'image/svg+xml',
      sizeBytes: 50_000,
    });
    expect(result.valid).toBe(true);
  });

  it('should accept valid PNG logo', () => {
    const result = validateLogoFile({
      filename: 'logo.png',
      mimeType: 'image/png',
      sizeBytes: 5_000_000,
    });
    expect(result.valid).toBe(true);
  });

  it('should accept valid AI logo', () => {
    const result = validateLogoFile({
      filename: 'logo.ai',
      mimeType: 'application/postscript',
      sizeBytes: 2_000_000,
    });
    expect(result.valid).toBe(true);
  });

  it('should reject invalid file extension', () => {
    const result = validateLogoFile({
      filename: 'logo.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 50_000,
    });
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('INVALID_EXTENSION');
  });

  it('should reject file exceeding 10MB', () => {
    const result = validateLogoFile({
      filename: 'logo.png',
      mimeType: 'image/png',
      sizeBytes: 11 * 1024 * 1024, // 11MB
    });
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('FILE_TOO_LARGE');
  });

  it('should reject zero-size file', () => {
    const result = validateLogoFile({
      filename: 'logo.svg',
      mimeType: 'image/svg+xml',
      sizeBytes: 0,
    });
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('FILE_EMPTY');
  });

  it('should reject invalid MIME type', () => {
    const result = validateLogoFile({
      filename: 'logo.svg',
      mimeType: 'text/html',
      sizeBytes: 50_000,
    });
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('INVALID_MIME_TYPE');
  });
});

describe('Form Validators', () => {
  describe('Company Basics', () => {
    it('should accept valid company basics', () => {
      const result = validateCompanyBasics(validCompanyBasics());
      expect(result.valid).toBe(true);
    });

    it('should reject empty company name', () => {
      const result = validateCompanyBasics({ ...validCompanyBasics(), companyName: '' });
      expect(result.valid).toBe(false);
      expect(result.errors[0].field).toBe('companyName');
    });

    it('should reject invalid founding year', () => {
      const result = validateCompanyBasics({ ...validCompanyBasics(), foundingYear: 1799 });
      expect(result.valid).toBe(false);
      expect(result.errors[0].field).toBe('foundingYear');
    });
  });

  describe('Brand Personality', () => {
    it('should accept valid personality scales (1-5)', () => {
      const result = validateBrandPersonality(validBrandPersonality());
      expect(result.valid).toBe(true);
    });

    it('should reject out-of-range values', () => {
      const invalid = { ...validBrandPersonality(), formalCasual: 0 as never };
      const result = validateBrandPersonality(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('INVALID_SCALE_VALUE');
    });

    it('should reject non-integer values', () => {
      const invalid = { ...validBrandPersonality(), traditionalInnovative: 3.5 as never };
      const result = validateBrandPersonality(invalid);
      expect(result.valid).toBe(false);
    });
  });

  describe('Visual Preferences', () => {
    it('should accept 2-3 valid mood selections', () => {
      expect(validateVisualPreferences(validVisualPreference()).valid).toBe(true);

      const three: VisualPreference = {
        selectedMoodIds: [MOOD_TILES[0].id, MOOD_TILES[1].id, MOOD_TILES[2].id],
      };
      expect(validateVisualPreferences(three).valid).toBe(true);
    });

    it('should reject fewer than 2 selections', () => {
      const result = validateVisualPreferences({ selectedMoodIds: [MOOD_TILES[0].id] });
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('MIN_SELECTIONS');
    });

    it('should reject more than 3 selections', () => {
      const result = validateVisualPreferences({
        selectedMoodIds: [MOOD_TILES[0].id, MOOD_TILES[1].id, MOOD_TILES[2].id, MOOD_TILES[3].id],
      });
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('MAX_SELECTIONS');
    });

    it('should reject invalid mood IDs', () => {
      const result = validateVisualPreferences({
        selectedMoodIds: ['nonexistent-mood', MOOD_TILES[0].id],
      });
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('INVALID_MOOD_ID');
    });
  });

  describe('Deliverable Selection', () => {
    it('should accept at least one deliverable', () => {
      const result = validateDeliverableSelection(validDeliverableSelection());
      expect(result.valid).toBe(true);
    });

    it('should reject empty selection', () => {
      const result = validateDeliverableSelection({ selected: [] });
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('MIN_DELIVERABLES');
    });

    it('should reject invalid deliverable types', () => {
      const result = validateDeliverableSelection({
        selected: ['invalid-type' as never],
      });
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('INVALID_DELIVERABLE_TYPE');
    });
  });
});

describe('Mood Tiles', () => {
  it('should have at least 12 pre-defined mood tiles (AC-4)', () => {
    expect(MOOD_TILES.length).toBeGreaterThanOrEqual(12);
  });

  it('should have unique IDs for all mood tiles', () => {
    const ids = MOOD_TILES.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('each tile should have name, description, and keywords', () => {
    for (const tile of MOOD_TILES) {
      expect(tile.name).toBeTruthy();
      expect(tile.description).toBeTruthy();
      expect(tile.keywords.length).toBeGreaterThan(0);
    }
  });
});

// Custom matcher
expect.extend({
  toStartWith(received: string, expected: string) {
    const pass = received.startsWith(expected);
    return {
      pass,
      message: () => `expected "${received}" to start with "${expected}"`,
    };
  },
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toStartWith(expected: string): R;
    }
  }
}
