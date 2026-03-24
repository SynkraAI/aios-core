/**
 * Types for the Automated Client Setup pipeline (BSS-7.9).
 *
 * Defines hosting providers, setup step tracking, DI interfaces,
 * R2 key builders, and all output shapes (client config, setup summary,
 * setup notes).
 *
 * @module onboarding/setup/setup-types
 */

// ---------------------------------------------------------------------------
// Hosting Provider (AC 5)
// ---------------------------------------------------------------------------

/** Supported hosting providers for brand deliverables. */
export type HostingProvider = 'vercel' | 'netlify' | 'manual';

// ---------------------------------------------------------------------------
// Setup Step Tracking (AC 9)
// ---------------------------------------------------------------------------

/** Identifiers for each step in the setup pipeline. */
export type SetupStepName =
  | 'trigger_check'
  | 'token_generation'
  | 'folder_structure'
  | 'logo_copy'
  | 'hosting_config'
  | 'client_config'
  | 'email_notification'
  | 'clickup_update';

/** Status of a single setup step. */
export type SetupStepStatus = 'pending' | 'completed' | 'skipped' | 'failed';

/** Tracking record for a single setup step. */
export interface SetupStep {
  readonly name: SetupStepName;
  readonly status: SetupStepStatus;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly durationMs?: number;
  readonly error?: string;
  readonly skipReason?: string;
}

// ---------------------------------------------------------------------------
// Manual Action Item
// ---------------------------------------------------------------------------

/** A manual action item that requires human intervention. */
export interface ManualAction {
  readonly step: string;
  readonly instructions: string;
}

// ---------------------------------------------------------------------------
// Setup Summary (AC 9, AC 10)
// ---------------------------------------------------------------------------

/** Setup summary written to R2 after pipeline completes. */
export interface SetupSummary {
  readonly client_id: string;
  readonly status: 'completed' | 'failed' | 'partial';
  readonly setup_started_at: string;
  readonly setup_completed_at: string;
  readonly duration_ms: number;
  readonly steps_completed: SetupStep[];
  readonly steps_skipped: SetupStep[];
  readonly steps_failed: SetupStep[];
  readonly manual_actions_required: ManualAction[];
}

// ---------------------------------------------------------------------------
// Client Config (AC 6)
// ---------------------------------------------------------------------------

/** Client configuration written to R2. */
export interface ClientConfig {
  readonly client_id: string;
  readonly client_name: string;
  readonly onboarding_mode: 'standard' | 'audit_assisted';
  readonly approved_at: string;
  readonly hosting_url?: string;
  readonly token_paths: {
    readonly primitive: string;
    readonly semantic: string;
    readonly component: string;
  };
  readonly deliverables_selected: readonly string[];
}

// ---------------------------------------------------------------------------
// Setup Notes
// ---------------------------------------------------------------------------

/** Setup notes with manual action items. */
export interface SetupNotes {
  readonly manual_actions: ManualAction[];
  readonly generated_at: string;
  readonly client_id: string;
}

// ---------------------------------------------------------------------------
// Token File Paths
// ---------------------------------------------------------------------------

/** Paths to the three generated token files. */
export interface TokenFilePaths {
  readonly primitive: string;
  readonly semantic: string;
  readonly component: string;
}

// ---------------------------------------------------------------------------
// DI Interfaces
// ---------------------------------------------------------------------------

/** R2 storage client interface for the setup module. */
export interface SetupR2Client {
  downloadJson<T>(key: string): Promise<T | null>;
  uploadJson(key: string, data: unknown): Promise<{ key: string }>;
  copyObject(sourceKey: string, destinationKey: string): Promise<void>;
  listKeys(prefix: string): Promise<string[]>;
  createPlaceholder(key: string): Promise<void>;
}

/** ClickUp client interface for the setup module. */
export interface SetupClickUpClient {
  updateTaskStatus(taskId: string, status: string): Promise<void>;
  addComment(taskId: string, comment: string): Promise<void>;
}

/** Email client interface for the setup module. */
export interface SetupEmailClient {
  sendEmail(params: {
    to: string;
    subject: string;
    html: string;
    from?: string;
  }): Promise<{ id: string }>;
}

/** Hosting provider client interface. */
export interface HostingClient {
  createProject(params: {
    name: string;
    r2BucketPath: string;
  }): Promise<{ url: string; projectId: string }>;
}

/** Dependencies injected into the ClientSetupPipeline. */
export interface SetupPipelineDeps {
  readonly r2Client: SetupR2Client;
  readonly clickUpClient?: SetupClickUpClient;
  readonly clickUpTaskId?: string;
  readonly emailClient?: SetupEmailClient;
  readonly teamEmail?: string;
  readonly hostingProvider: HostingProvider;
  readonly hostingClient?: HostingClient;
}

// ---------------------------------------------------------------------------
// R2 Key Builders
// ---------------------------------------------------------------------------

/**
 * Build R2 key for the client approval record.
 *
 * @param clientId - The client identifier.
 * @returns The R2 key path for client-approval.json.
 */
export function buildClientApprovalR2Key(clientId: string): string {
  return `brand-assets/${clientId}/onboarding/client-approval.json`;
}

/**
 * Build R2 key for the approved direction file.
 *
 * @param clientId - The client identifier.
 * @returns The R2 key path for approved-direction.json.
 */
export function buildApprovedDirectionR2Key(clientId: string): string {
  return `brand-assets/${clientId}/onboarding/approved-direction.json`;
}

/**
 * Build R2 key for a token file.
 *
 * @param clientId - The client identifier.
 * @param type - The token type (primitive, semantic, component).
 * @returns The R2 key path for the token file.
 */
export function buildTokenR2Key(clientId: string, type: string): string {
  return `brand-assets/${clientId}/tokens/${type}.json`;
}

/**
 * Build R2 key for the client configuration file.
 *
 * @param clientId - The client identifier.
 * @returns The R2 key path for client-config.json.
 */
export function buildClientConfigR2Key(clientId: string): string {
  return `brand-assets/${clientId}/client-config.json`;
}

/**
 * Build R2 key for the setup summary file.
 *
 * @param clientId - The client identifier.
 * @returns The R2 key path for setup-summary.json.
 */
export function buildSetupSummaryR2Key(clientId: string): string {
  return `brand-assets/${clientId}/setup-summary.json`;
}

/**
 * Build R2 key for the setup notes file.
 *
 * @param clientId - The client identifier.
 * @returns The R2 key path for setup-notes.json.
 */
export function buildSetupNotesR2Key(clientId: string): string {
  return `brand-assets/${clientId}/setup-notes.json`;
}

/**
 * Build R2 key for an asset destination file.
 *
 * @param clientId - The client identifier.
 * @param filename - The asset filename.
 * @returns The R2 key path for the asset.
 */
export function buildAssetDestR2Key(clientId: string, filename: string): string {
  return `brand-assets/${clientId}/assets/${filename}`;
}

/**
 * Build R2 key for the intake record.
 *
 * @param clientId - The client identifier.
 * @returns The R2 key path for intake.json.
 */
export function buildIntakeR2Key(clientId: string): string {
  return `brand-assets/${clientId}/onboarding/intake.json`;
}

// ---------------------------------------------------------------------------
// ClickUp Constants
// ---------------------------------------------------------------------------

/** ClickUp status when automated setup is complete. */
export const CLICKUP_SETUP_COMPLETE = 'Setup Complete' as const;

/** ClickUp comment posted on successful setup. */
export const CLICKUP_SETUP_COMPLETE_MESSAGE =
  'Automated client setup complete. Client ready for brand production.' as const;

/** Prefix for ClickUp comment posted on failed setup. */
export const CLICKUP_SETUP_FAILED_PREFIX =
  'Automated setup failed — manual setup required. See setup-summary.json for details.' as const;
