/**
 * Tests for Automated Client Setup (BSS-7.9).
 *
 * Covers all 10 acceptance criteria: trigger check, token generation,
 * folder structure, logo copy, hosting config, client config, email
 * notification, ClickUp update, setup summary, and error handling.
 */

import { ClientSetupPipeline } from '../setup/client-setup-pipeline';
import { TokenFileGenerator } from '../setup/token-generator';
import { HostingConfigurator } from '../setup/hosting-configurator';
import { SetupEmailSender } from '../setup/email-sender';
import {
  buildClientApprovalR2Key,
  buildApprovedDirectionR2Key,
  buildTokenR2Key,
  buildClientConfigR2Key,
  buildSetupSummaryR2Key,
  buildSetupNotesR2Key,
  buildAssetDestR2Key,
  buildIntakeR2Key,
  CLICKUP_SETUP_COMPLETE,
  CLICKUP_SETUP_COMPLETE_MESSAGE,
  CLICKUP_SETUP_FAILED_PREFIX,
} from '../setup/setup-types';

import type {
  SetupR2Client,
  SetupClickUpClient,
  SetupEmailClient,
  HostingClient,
  SetupPipelineDeps,
} from '../setup/setup-types';

import type { ApprovedDirection } from '../review/review-types';
import type { IntakeRecord } from '../types';
import type { DTCGToken, DTCGTokenGroup } from '../analysis/analysis-types';
import type { ClientApproval } from '../approval/approval-types';

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const CLIENT_ID = 'test-client-123';

const mockClientApproval: ClientApproval = {
  client_id: CLIENT_ID,
  approved: true,
  approved_at: '2026-03-23T12:00:00.000Z',
  approved_for_setup: true,
  client_name: 'Acme Corp',
  client_email: 'team@acme.com',
};

const mockApprovedDirection: ApprovedDirection = {
  client_id: CLIENT_ID,
  approved_at: '2026-03-23T11:00:00.000Z',
  onboarding_mode: 'standard' as const,
  color_palette: {
    colors: [
      { role: 'primary' as const, color: { hex: '#1A2B3C', rgb: { r: 26, g: 43, b: 60 }, hsl: { h: 210, s: 40, l: 17 } }, rationale: 'Primary' },
      { role: 'secondary' as const, color: { hex: '#4A5B6C', rgb: { r: 74, g: 91, b: 108 }, hsl: { h: 210, s: 19, l: 36 } }, rationale: 'Secondary' },
      { role: 'accent' as const, color: { hex: '#FF6B35', rgb: { r: 255, g: 107, b: 53 }, hsl: { h: 16, s: 100, l: 60 } }, rationale: 'Accent' },
      { role: 'neutral-light' as const, color: { hex: '#F5F5F5', rgb: { r: 245, g: 245, b: 245 }, hsl: { h: 0, s: 0, l: 96 } }, rationale: 'Light' },
      { role: 'neutral-dark' as const, color: { hex: '#333333', rgb: { r: 51, g: 51, b: 51 }, hsl: { h: 0, s: 0, l: 20 } }, rationale: 'Dark' },
      { role: 'background' as const, color: { hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 }, hsl: { h: 0, s: 0, l: 100 } }, rationale: 'BG' },
    ],
    generationRationale: 'Test',
  },
  typography: {
    heading: { family: 'Inter', weight: 700, style: 'normal' as const, source: 'google-fonts' as const },
    body: { family: 'Open Sans', weight: 400, style: 'normal' as const, source: 'google-fonts' as const },
    rationale: 'Modern',
  },
  moodboard_approved_keys: ['moodboard/img-001.jpg'],
  voice_definition: {
    toneScales: [{ dimension: 'Formal/Casual', leftPole: 'Formal', rightPole: 'Casual', position: 2 }],
    vocabularyGuide: { useWords: ['innovative'], avoidWords: ['cheap'] },
    communicationGuidelines: ['Be professional'],
  },
  tokens: {
    color: { primary: { $value: '#1A2B3C', $type: 'color' } },
    typography: { 'font-family-heading': { $value: 'Inter', $type: 'fontFamily' } },
  },
};

const mockIntakeRecord: IntakeRecord = {
  version: '1.0' as const,
  clientId: CLIENT_ID,
  sessionToken: 'session-abc',
  submittedAt: '2026-03-23T09:00:00.000Z',
  intakeData: {
    companyBasics: { companyName: 'Acme Corp', industry: 'Technology', targetAudience: 'SMBs', tagline: 'Innovation first', foundingYear: 2020 },
    brandPersonality: { formalCasual: 2, traditionalInnovative: 4, seriousPlayful: 3, minimalExpressive: 3, localGlobal: 4 },
    visualPreferences: { selectedMoodIds: ['bold-modern', 'clean-minimal'] },
    assetUpload: { primaryLogo: { filename: 'logo-primary.svg', mimeType: 'image/svg+xml', sizeBytes: 5000, r2Key: `brand-assets/${CLIENT_ID}/onboarding/logo-primary.svg` }, brandColors: ['#1A2B3C'], fontNames: ['Inter'] },
    competitorUrls: { urls: [{ url: 'https://competitor.com' }] },
    deliverableSelection: { selected: ['brand-book', 'design-tokens', 'landing-page'] },
  },
  metadata: { startedAt: '2026-03-23T08:50:00.000Z', completedAt: '2026-03-23T09:00:00.000Z', durationMinutes: 10, stepTimings: {} as Record<string, number> },
};

// ---------------------------------------------------------------------------
// Mock Factories
// ---------------------------------------------------------------------------

function createMockR2Client(store: Record<string, unknown> = {}): SetupR2Client {
  return {
    downloadJson: jest.fn(async <T>(key: string): Promise<T | null> => {
      return (store[key] as T) ?? null;
    }),
    uploadJson: jest.fn(async (key: string, data: unknown) => {
      store[key] = data;
      return { key };
    }),
    copyObject: jest.fn(async () => {}),
    listKeys: jest.fn(async () => []),
    createPlaceholder: jest.fn(async () => {}),
  };
}

function createMockClickUpClient(): SetupClickUpClient {
  return {
    updateTaskStatus: jest.fn(async () => {}),
    addComment: jest.fn(async () => {}),
  };
}

function createMockEmailClient(): SetupEmailClient {
  return {
    sendEmail: jest.fn(async () => ({ id: 'email-123' })),
  };
}

function createMockHostingClient(): HostingClient {
  return {
    createProject: jest.fn(async () => ({
      url: 'https://test-client-brand.vercel.app',
      projectId: 'proj-123',
    })),
  };
}

function createFullR2Store(): Record<string, unknown> {
  return {
    [buildClientApprovalR2Key(CLIENT_ID)]: mockClientApproval,
    [buildApprovedDirectionR2Key(CLIENT_ID)]: mockApprovedDirection,
    [buildIntakeR2Key(CLIENT_ID)]: mockIntakeRecord,
  };
}

function createDefaultDeps(overrides: Partial<SetupPipelineDeps> = {}): SetupPipelineDeps {
  const store = createFullR2Store();
  return {
    r2Client: createMockR2Client(store),
    clickUpClient: createMockClickUpClient(),
    clickUpTaskId: 'task-456',
    emailClient: createMockEmailClient(),
    teamEmail: 'team@acme.com',
    hostingProvider: 'vercel',
    hostingClient: createMockHostingClient(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// R2 Key Builder Tests
// ---------------------------------------------------------------------------

describe('R2 Key Builders', () => {
  it('builds correct client approval key', () => {
    expect(buildClientApprovalR2Key('abc')).toBe('brand-assets/abc/onboarding/client-approval.json');
  });

  it('builds correct approved direction key', () => {
    expect(buildApprovedDirectionR2Key('abc')).toBe('brand-assets/abc/onboarding/approved-direction.json');
  });

  it('builds correct token key', () => {
    expect(buildTokenR2Key('abc', 'primitive')).toBe('brand-assets/abc/tokens/primitive.json');
    expect(buildTokenR2Key('abc', 'semantic')).toBe('brand-assets/abc/tokens/semantic.json');
    expect(buildTokenR2Key('abc', 'component')).toBe('brand-assets/abc/tokens/component.json');
  });

  it('builds correct client config key', () => {
    expect(buildClientConfigR2Key('abc')).toBe('brand-assets/abc/client-config.json');
  });

  it('builds correct setup summary key', () => {
    expect(buildSetupSummaryR2Key('abc')).toBe('brand-assets/abc/setup-summary.json');
  });

  it('builds correct setup notes key', () => {
    expect(buildSetupNotesR2Key('abc')).toBe('brand-assets/abc/setup-notes.json');
  });

  it('builds correct asset destination key', () => {
    expect(buildAssetDestR2Key('abc', 'logo.svg')).toBe('brand-assets/abc/assets/logo.svg');
  });

  it('builds correct intake key', () => {
    expect(buildIntakeR2Key('abc')).toBe('brand-assets/abc/onboarding/intake.json');
  });
});

// ---------------------------------------------------------------------------
// TokenFileGenerator Tests
// ---------------------------------------------------------------------------

describe('TokenFileGenerator', () => {
  const generator = new TokenFileGenerator();

  describe('generatePrimitive', () => {
    it('generates primitive tokens with correct DTCG structure (AC 2)', () => {
      const result = generator.generatePrimitive(mockApprovedDirection);

      expect(result).toHaveProperty('color');
      expect(result).toHaveProperty('typography');

      // Verify color tokens
      const color = result.color as DTCGTokenGroup;
      const primary = color.primary as DTCGToken;
      expect(primary.$value).toBe('#1A2B3C');
      expect(primary.$type).toBe('color');

      const secondary = color.secondary as DTCGToken;
      expect(secondary.$value).toBe('#4A5B6C');
      expect(secondary.$type).toBe('color');

      const accent = color.accent as DTCGToken;
      expect(accent.$value).toBe('#FF6B35');
      expect(accent.$type).toBe('color');
    });

    it('includes all 6 colors from approved palette (AC 2)', () => {
      const result = generator.generatePrimitive(mockApprovedDirection);
      const color = result.color as DTCGTokenGroup;

      expect(color).toHaveProperty('primary');
      expect(color).toHaveProperty('secondary');
      expect(color).toHaveProperty('accent');
      expect(color).toHaveProperty('neutral-light');
      expect(color).toHaveProperty('neutral-dark');
      expect(color).toHaveProperty('background');
    });

    it('generates typography tokens with heading and body font families', () => {
      const result = generator.generatePrimitive(mockApprovedDirection);
      const typography = result.typography as DTCGTokenGroup;

      const headingFamily = typography['font-family-heading'] as DTCGToken;
      expect(headingFamily.$value).toBe('Inter');
      expect(headingFamily.$type).toBe('fontFamily');

      const bodyFamily = typography['font-family-body'] as DTCGToken;
      expect(bodyFamily.$value).toBe('Open Sans');
      expect(bodyFamily.$type).toBe('fontFamily');

      const fontSize = typography['font-size-base'] as DTCGToken;
      expect(fontSize.$value).toBe('16px');
      expect(fontSize.$type).toBe('dimension');

      const lineHeight = typography['line-height-base'] as DTCGToken;
      expect(lineHeight.$value).toBe(1.5);
      expect(lineHeight.$type).toBe('number');
    });

    it('token values match approved color palette hex values (AC 2)', () => {
      const result = generator.generatePrimitive(mockApprovedDirection);
      const color = result.color as DTCGTokenGroup;

      for (const paletteColor of mockApprovedDirection.color_palette.colors) {
        const token = color[paletteColor.role] as DTCGToken;
        expect(token.$value).toBe(paletteColor.color.hex);
      }
    });
  });

  describe('generateSemantic', () => {
    it('generates semantic tokens referencing approved colors', () => {
      const result = generator.generateSemantic(mockApprovedDirection);
      const color = result.color as DTCGTokenGroup;

      const brand = color.brand as DTCGTokenGroup;
      expect((brand.primary as DTCGToken).$value).toBe('#1A2B3C');
      expect((brand.secondary as DTCGToken).$value).toBe('#4A5B6C');
      expect((brand.accent as DTCGToken).$value).toBe('#FF6B35');

      const text = color.text as DTCGTokenGroup;
      expect((text.primary as DTCGToken).$value).toBe('#333333');
      expect((text.inverse as DTCGToken).$value).toBe('#F5F5F5');

      const surface = color.surface as DTCGTokenGroup;
      expect((surface.background as DTCGToken).$value).toBe('#FFFFFF');
    });

    it('generates semantic typography tokens', () => {
      const result = generator.generateSemantic(mockApprovedDirection);
      const typography = result.typography as DTCGTokenGroup;

      expect((typography.heading as DTCGToken).$value).toBe('Inter');
      expect((typography.body as DTCGToken).$value).toBe('Open Sans');
    });
  });

  describe('generateComponent', () => {
    it('generates component tokens for button, text, and card', () => {
      const result = generator.generateComponent(mockApprovedDirection);

      expect(result).toHaveProperty('button');
      expect(result).toHaveProperty('text');
      expect(result).toHaveProperty('card');

      const button = result.button as DTCGTokenGroup;
      expect((button.background as DTCGToken).$value).toBe('#1A2B3C');
      expect((button.text as DTCGToken).$value).toBe('#F5F5F5');
      expect((button.border as DTCGToken).$value).toBe('#1A2B3C');

      const card = result.card as DTCGTokenGroup;
      expect((card.background as DTCGToken).$value).toBe('#FFFFFF');
      expect((card.border as DTCGToken).$value).toBe('#F5F5F5');
    });

    it('generates component typography tokens', () => {
      const result = generator.generateComponent(mockApprovedDirection);
      const text = result.text as DTCGTokenGroup;

      const heading = text.heading as DTCGTokenGroup;
      expect((heading.fontFamily as DTCGToken).$value).toBe('Inter');
      expect((heading.color as DTCGToken).$value).toBe('#333333');

      const body = text.body as DTCGTokenGroup;
      expect((body.fontFamily as DTCGToken).$value).toBe('Open Sans');
      expect((body.color as DTCGToken).$value).toBe('#333333');
    });
  });
});

// ---------------------------------------------------------------------------
// HostingConfigurator Tests
// ---------------------------------------------------------------------------

describe('HostingConfigurator', () => {
  it('returns manual action when provider is manual (AC 5)', async () => {
    const configurator = new HostingConfigurator({
      hostingProvider: 'manual',
    });

    const result = await configurator.configure(CLIENT_ID);

    expect(result.url).toBeUndefined();
    expect(result.manualAction).toBeDefined();
    expect(result.manualAction!.step).toBe('hosting_config');
    expect(result.manualAction!.instructions).toContain('Manual hosting setup');
  });

  it('returns URL when vercel provider succeeds (AC 5)', async () => {
    const mockHosting = createMockHostingClient();
    const configurator = new HostingConfigurator({
      hostingProvider: 'vercel',
      hostingClient: mockHosting,
    });

    const result = await configurator.configure(CLIENT_ID);

    expect(result.url).toBe('https://test-client-brand.vercel.app');
    expect(result.manualAction).toBeUndefined();
    expect(mockHosting.createProject).toHaveBeenCalledWith({
      name: `${CLIENT_ID}-brand`,
      r2BucketPath: `brand-assets/${CLIENT_ID}/`,
    });
  });

  it('returns manual action on hosting API failure (AC 5, NFR-9.6)', async () => {
    const mockHosting = createMockHostingClient();
    (mockHosting.createProject as jest.Mock).mockRejectedValue(new Error('API timeout'));

    const configurator = new HostingConfigurator({
      hostingProvider: 'netlify',
      hostingClient: mockHosting,
    });

    const result = await configurator.configure(CLIENT_ID);

    expect(result.url).toBeUndefined();
    expect(result.manualAction).toBeDefined();
    expect(result.manualAction!.instructions).toContain('API timeout');
    expect(result.manualAction!.instructions).toContain('netlify');
  });

  it('returns manual action when no hosting client is provided', async () => {
    const configurator = new HostingConfigurator({
      hostingProvider: 'vercel',
    });

    const result = await configurator.configure(CLIENT_ID);

    expect(result.url).toBeUndefined();
    expect(result.manualAction).toBeDefined();
    expect(result.manualAction!.instructions).toContain('No vercel API client');
  });
});

// ---------------------------------------------------------------------------
// SetupEmailSender Tests
// ---------------------------------------------------------------------------

describe('SetupEmailSender', () => {
  it('sends email with correct content', async () => {
    const mockEmail = createMockEmailClient();
    const sender = new SetupEmailSender({ emailClient: mockEmail });

    const result = await sender.sendSetupNotification({
      to: 'team@acme.com',
      clientId: CLIENT_ID,
      clientName: 'Acme Corp',
      tokenPaths: {
        primitive: 'brand-assets/test-client-123/tokens/primitive.json',
        semantic: 'brand-assets/test-client-123/tokens/semantic.json',
        component: 'brand-assets/test-client-123/tokens/component.json',
      },
      hostingUrl: 'https://acme-brand.vercel.app',
    });

    expect(result.sent).toBe(true);
    expect(mockEmail.sendEmail).toHaveBeenCalledTimes(1);

    const call = (mockEmail.sendEmail as jest.Mock).mock.calls[0][0];
    expect(call.to).toBe('team@acme.com');
    expect(call.subject).toContain('Acme Corp');
    expect(call.html).toContain('brand-assets/test-client-123/');
    expect(call.html).toContain('https://acme-brand.vercel.app');
    expect(call.html).toContain('primitive.json');
  });

  it('returns sent: false on failure without throwing (AC 7)', async () => {
    const mockEmail = createMockEmailClient();
    (mockEmail.sendEmail as jest.Mock).mockRejectedValue(new Error('SMTP down'));

    const sender = new SetupEmailSender({ emailClient: mockEmail });

    const result = await sender.sendSetupNotification({
      to: 'team@acme.com',
      clientId: CLIENT_ID,
      clientName: 'Acme Corp',
      tokenPaths: {
        primitive: 'tokens/primitive.json',
        semantic: 'tokens/semantic.json',
        component: 'tokens/component.json',
      },
    });

    expect(result.sent).toBe(false);
    expect(result.error).toBe('SMTP down');
  });
});

// ---------------------------------------------------------------------------
// ClientSetupPipeline Tests
// ---------------------------------------------------------------------------

describe('ClientSetupPipeline', () => {
  // AC 1: Pipeline only runs when approved: true AND approved_for_setup: true
  it('AC 1: only runs when approved=true AND approved_for_setup=true', async () => {
    const deps = createDefaultDeps();
    const pipeline = new ClientSetupPipeline(deps);
    const result = await pipeline.run(CLIENT_ID);

    expect(result.status).not.toBe('failed');
    expect(result.steps_completed.length).toBeGreaterThan(0);
  });

  // AC 1: Pipeline fails when approval missing
  it('AC 1: fails gracefully when approval missing', async () => {
    const store: Record<string, unknown> = {};
    const deps = createDefaultDeps({ r2Client: createMockR2Client(store) });
    const pipeline = new ClientSetupPipeline(deps);

    const result = await pipeline.run(CLIENT_ID);

    expect(result.status).toBe('failed');
    expect(result.steps_failed.length).toBeGreaterThan(0);
    expect(result.steps_failed[0].error).toContain('not found');
  });

  // AC 1: Pipeline fails when not approved for setup
  it('AC 1: fails when approved_for_setup is false', async () => {
    const store: Record<string, unknown> = {
      [buildClientApprovalR2Key(CLIENT_ID)]: {
        ...mockClientApproval,
        approved_for_setup: false,
      },
    };
    const deps = createDefaultDeps({ r2Client: createMockR2Client(store) });
    const pipeline = new ClientSetupPipeline(deps);

    const result = await pipeline.run(CLIENT_ID);

    expect(result.status).toBe('failed');
    expect(result.steps_failed[0].error).toContain('not approved for setup');
  });

  // AC 2: Token files generated with correct DTCG structure
  it('AC 2: token files written to R2 with DTCG structure', async () => {
    const store = createFullR2Store();
    const r2Client = createMockR2Client(store);
    const deps = createDefaultDeps({ r2Client });
    const pipeline = new ClientSetupPipeline(deps);

    await pipeline.run(CLIENT_ID);

    expect(r2Client.uploadJson).toHaveBeenCalledWith(
      buildTokenR2Key(CLIENT_ID, 'primitive'),
      expect.objectContaining({ color: expect.any(Object), typography: expect.any(Object) }),
    );
    expect(r2Client.uploadJson).toHaveBeenCalledWith(
      buildTokenR2Key(CLIENT_ID, 'semantic'),
      expect.objectContaining({ color: expect.any(Object), typography: expect.any(Object) }),
    );
    expect(r2Client.uploadJson).toHaveBeenCalledWith(
      buildTokenR2Key(CLIENT_ID, 'component'),
      expect.objectContaining({ button: expect.any(Object), text: expect.any(Object), card: expect.any(Object) }),
    );
  });

  // AC 3: R2 folder structure created
  it('AC 3: creates R2 folder structure (assets/, deliverables/)', async () => {
    const store = createFullR2Store();
    const r2Client = createMockR2Client(store);
    const deps = createDefaultDeps({ r2Client });
    const pipeline = new ClientSetupPipeline(deps);

    await pipeline.run(CLIENT_ID);

    expect(r2Client.createPlaceholder).toHaveBeenCalledWith(
      `brand-assets/${CLIENT_ID}/assets/.gitkeep`,
    );
    expect(r2Client.createPlaceholder).toHaveBeenCalledWith(
      `brand-assets/${CLIENT_ID}/deliverables/.gitkeep`,
    );
  });

  // AC 4: Logo files copied from onboarding/ to assets/
  it('AC 4: copies logo files from onboarding/ to assets/', async () => {
    const store = createFullR2Store();
    const r2Client = createMockR2Client(store);
    (r2Client.listKeys as jest.Mock).mockResolvedValue([
      `brand-assets/${CLIENT_ID}/onboarding/logo-primary.svg`,
      `brand-assets/${CLIENT_ID}/onboarding/logo-secondary.png`,
      `brand-assets/${CLIENT_ID}/onboarding/intake.json`,
    ]);

    const deps = createDefaultDeps({ r2Client });
    const pipeline = new ClientSetupPipeline(deps);

    await pipeline.run(CLIENT_ID);

    // Only logo files should be copied (not intake.json)
    expect(r2Client.copyObject).toHaveBeenCalledTimes(2);
    expect(r2Client.copyObject).toHaveBeenCalledWith(
      `brand-assets/${CLIENT_ID}/onboarding/logo-primary.svg`,
      `brand-assets/${CLIENT_ID}/assets/logo-primary.svg`,
    );
    expect(r2Client.copyObject).toHaveBeenCalledWith(
      `brand-assets/${CLIENT_ID}/onboarding/logo-secondary.png`,
      `brand-assets/${CLIENT_ID}/assets/logo-secondary.png`,
    );
  });

  // AC 4: Logo copy preserves filenames
  it('AC 4: preserves logo filenames during copy', async () => {
    const store = createFullR2Store();
    const r2Client = createMockR2Client(store);
    (r2Client.listKeys as jest.Mock).mockResolvedValue([
      `brand-assets/${CLIENT_ID}/onboarding/logo-main.svg`,
    ]);

    const deps = createDefaultDeps({ r2Client });
    const pipeline = new ClientSetupPipeline(deps);

    await pipeline.run(CLIENT_ID);

    expect(r2Client.copyObject).toHaveBeenCalledWith(
      `brand-assets/${CLIENT_ID}/onboarding/logo-main.svg`,
      buildAssetDestR2Key(CLIENT_ID, 'logo-main.svg'),
    );
  });

  // AC 5: Hosting configured when provider is 'vercel'
  it('AC 5: hosting configured for vercel provider', async () => {
    const mockHosting = createMockHostingClient();
    const deps = createDefaultDeps({ hostingProvider: 'vercel', hostingClient: mockHosting });
    const pipeline = new ClientSetupPipeline(deps);

    const result = await pipeline.run(CLIENT_ID);

    expect(mockHosting.createProject).toHaveBeenCalled();
    expect(result.status).toBe('completed');
  });

  // AC 5: Manual hosting fallback
  it('AC 5: manual hosting returns manual action', async () => {
    const deps = createDefaultDeps({ hostingProvider: 'manual', hostingClient: undefined });
    const pipeline = new ClientSetupPipeline(deps);

    const result = await pipeline.run(CLIENT_ID);

    expect(result.manual_actions_required.length).toBeGreaterThan(0);
    expect(result.manual_actions_required[0].step).toBe('hosting_config');
  });

  // AC 5 + NFR-9.6: Hosting API failure fallback
  it('AC 5/NFR-9.6: hosting API failure produces manual action', async () => {
    const mockHosting = createMockHostingClient();
    (mockHosting.createProject as jest.Mock).mockRejectedValue(new Error('Deploy failed'));

    const deps = createDefaultDeps({ hostingProvider: 'netlify', hostingClient: mockHosting });
    const pipeline = new ClientSetupPipeline(deps);

    const result = await pipeline.run(CLIENT_ID);

    expect(result.manual_actions_required.length).toBeGreaterThan(0);
    expect(result.manual_actions_required[0].instructions).toContain('Deploy failed');
  });

  // AC 6: client-config.json written with all required fields
  it('AC 6: writes client-config.json with required fields', async () => {
    const store = createFullR2Store();
    const r2Client = createMockR2Client(store);
    const deps = createDefaultDeps({ r2Client });
    const pipeline = new ClientSetupPipeline(deps);

    await pipeline.run(CLIENT_ID);

    const configKey = buildClientConfigR2Key(CLIENT_ID);
    const writtenConfig = store[configKey] as Record<string, unknown>;

    expect(writtenConfig).toBeDefined();
    expect(writtenConfig.client_id).toBe(CLIENT_ID);
    expect(writtenConfig.client_name).toBe('Acme Corp');
    expect(writtenConfig.onboarding_mode).toBe('standard');
    expect(writtenConfig.approved_at).toBe('2026-03-23T12:00:00.000Z');
    expect(writtenConfig.token_paths).toBeDefined();
  });

  // AC 6: client-config includes deliverables_selected
  it('AC 6: client-config includes deliverables_selected from intake', async () => {
    const store = createFullR2Store();
    const r2Client = createMockR2Client(store);
    const deps = createDefaultDeps({ r2Client });
    const pipeline = new ClientSetupPipeline(deps);

    await pipeline.run(CLIENT_ID);

    const configKey = buildClientConfigR2Key(CLIENT_ID);
    const writtenConfig = store[configKey] as Record<string, unknown>;

    expect(writtenConfig.deliverables_selected).toEqual([
      'brand-book',
      'design-tokens',
      'landing-page',
    ]);
  });

  // AC 7: Email sent with R2 path, hosting URL, token links
  it('AC 7: sends email with R2 path, hosting URL, and token links', async () => {
    const mockEmail = createMockEmailClient();
    const deps = createDefaultDeps({ emailClient: mockEmail, teamEmail: 'team@acme.com' });
    const pipeline = new ClientSetupPipeline(deps);

    await pipeline.run(CLIENT_ID);

    expect(mockEmail.sendEmail).toHaveBeenCalledTimes(1);
    const call = (mockEmail.sendEmail as jest.Mock).mock.calls[0][0];
    expect(call.html).toContain(`brand-assets/${CLIENT_ID}/`);
    expect(call.html).toContain('primitive');
  });

  // AC 7: Email failure does not crash pipeline
  it('AC 7: email failure does not crash pipeline', async () => {
    const mockEmail = createMockEmailClient();
    (mockEmail.sendEmail as jest.Mock).mockRejectedValue(new Error('SMTP error'));

    const deps = createDefaultDeps({ emailClient: mockEmail });
    const pipeline = new ClientSetupPipeline(deps);

    const result = await pipeline.run(CLIENT_ID);

    // Pipeline should still complete (email is non-critical)
    expect(result.status).not.toBe('failed');
    expect(result.steps_skipped.some((s) => s.name === 'email_notification')).toBe(true);
  });

  // AC 8: ClickUp comment posted on completion
  it('AC 8: posts ClickUp comment on completion', async () => {
    const mockClickUp = createMockClickUpClient();
    const deps = createDefaultDeps({ clickUpClient: mockClickUp, clickUpTaskId: 'task-789' });
    const pipeline = new ClientSetupPipeline(deps);

    await pipeline.run(CLIENT_ID);

    expect(mockClickUp.addComment).toHaveBeenCalledWith(
      'task-789',
      CLICKUP_SETUP_COMPLETE_MESSAGE,
    );
  });

  // AC 8: ClickUp status updated to "Setup Complete"
  it('AC 8: updates ClickUp status to "Setup Complete"', async () => {
    const mockClickUp = createMockClickUpClient();
    const deps = createDefaultDeps({ clickUpClient: mockClickUp, clickUpTaskId: 'task-789' });
    const pipeline = new ClientSetupPipeline(deps);

    await pipeline.run(CLIENT_ID);

    expect(mockClickUp.updateTaskStatus).toHaveBeenCalledWith(
      'task-789',
      CLICKUP_SETUP_COMPLETE,
    );
  });

  // AC 9: setup-summary.json written with step durations
  it('AC 9: writes setup-summary.json with step durations', async () => {
    const store = createFullR2Store();
    const r2Client = createMockR2Client(store);
    const deps = createDefaultDeps({ r2Client });
    const pipeline = new ClientSetupPipeline(deps);

    const result = await pipeline.run(CLIENT_ID);

    expect(result.client_id).toBe(CLIENT_ID);
    expect(result.setup_started_at).toBeDefined();
    expect(result.setup_completed_at).toBeDefined();
    expect(result.duration_ms).toBeGreaterThanOrEqual(0);
    expect(result.steps_completed.length).toBeGreaterThan(0);

    // Verify step timing
    for (const step of result.steps_completed) {
      expect(step.startedAt).toBeDefined();
      expect(step.completedAt).toBeDefined();
      expect(step.durationMs).toBeGreaterThanOrEqual(0);
    }

    // Verify summary was written to R2
    const summaryKey = buildSetupSummaryR2Key(CLIENT_ID);
    expect(r2Client.uploadJson).toHaveBeenCalledWith(summaryKey, expect.any(Object));
  });

  // AC 10: Failed pipeline writes status: 'failed'
  it('AC 10: failed pipeline writes status "failed" in summary', async () => {
    const store: Record<string, unknown> = {
      [buildClientApprovalR2Key(CLIENT_ID)]: {
        ...mockClientApproval,
        approved: false,
      },
    };
    const deps = createDefaultDeps({ r2Client: createMockR2Client(store) });
    const pipeline = new ClientSetupPipeline(deps);

    const result = await pipeline.run(CLIENT_ID);

    expect(result.status).toBe('failed');
    expect(result.steps_failed.length).toBeGreaterThan(0);
  });

  // AC 10: Failed pipeline posts ClickUp failure comment
  it('AC 10: failed pipeline posts ClickUp failure comment', async () => {
    const store: Record<string, unknown> = {
      [buildClientApprovalR2Key(CLIENT_ID)]: mockClientApproval,
      [buildApprovedDirectionR2Key(CLIENT_ID)]: mockApprovedDirection,
      [buildIntakeR2Key(CLIENT_ID)]: mockIntakeRecord,
    };
    const r2Client = createMockR2Client(store);

    // Make token upload fail (critical step)
    let uploadCallCount = 0;
    (r2Client.uploadJson as jest.Mock).mockImplementation(async (key: string, data: unknown) => {
      uploadCallCount++;
      // Let downloadJson-driven calls and first few uploads succeed,
      // but fail on token uploads (4th, 5th, 6th call)
      if (key.includes('/tokens/')) {
        throw new Error('R2 write failed');
      }
      store[key] = data;
      return { key };
    });

    const mockClickUp = createMockClickUpClient();
    const deps = createDefaultDeps({ r2Client, clickUpClient: mockClickUp, clickUpTaskId: 'task-fail' });
    const pipeline = new ClientSetupPipeline(deps);

    const result = await pipeline.run(CLIENT_ID);

    expect(result.status).toBe('failed');
    expect(mockClickUp.addComment).toHaveBeenCalledWith(
      'task-fail',
      CLICKUP_SETUP_FAILED_PREFIX,
    );
  });

  // Pipeline runs without ClickUp client configured
  it('runs without ClickUp client configured', async () => {
    const deps = createDefaultDeps({
      clickUpClient: undefined,
      clickUpTaskId: undefined,
    });
    const pipeline = new ClientSetupPipeline(deps);

    const result = await pipeline.run(CLIENT_ID);

    expect(result.status).toBe('completed');
    expect(result.steps_skipped.some((s) => s.name === 'clickup_update')).toBe(true);
  });

  // Pipeline runs without email client configured
  it('runs without email client configured', async () => {
    const deps = createDefaultDeps({
      emailClient: undefined,
      teamEmail: undefined,
    });
    const pipeline = new ClientSetupPipeline(deps);

    const result = await pipeline.run(CLIENT_ID);

    expect(result.status).toBe('completed');
    expect(result.steps_skipped.some((s) => s.name === 'email_notification')).toBe(true);
  });

  // Setup-notes.json written for manual hosting actions
  it('writes setup-notes.json for manual hosting actions', async () => {
    const store = createFullR2Store();
    const r2Client = createMockR2Client(store);
    const deps = createDefaultDeps({
      r2Client,
      hostingProvider: 'manual',
      hostingClient: undefined,
    });
    const pipeline = new ClientSetupPipeline(deps);

    await pipeline.run(CLIENT_ID);

    const notesKey = buildSetupNotesR2Key(CLIENT_ID);
    expect(r2Client.uploadJson).toHaveBeenCalledWith(
      notesKey,
      expect.objectContaining({
        client_id: CLIENT_ID,
        manual_actions: expect.arrayContaining([
          expect.objectContaining({ step: 'hosting_config' }),
        ]),
      }),
    );
  });
});
