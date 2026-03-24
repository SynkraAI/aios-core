/**
 * Automated Client Setup module (BSS-7.9).
 *
 * @module onboarding/setup
 */

// Pipeline
export { ClientSetupPipeline } from './client-setup-pipeline';

// Token Generator
export { TokenFileGenerator } from './token-generator';

// Hosting Configurator
export { HostingConfigurator } from './hosting-configurator';
export type { HostingConfigResult } from './hosting-configurator';

// Email Sender
export { SetupEmailSender } from './email-sender';
export type { SetupNotificationParams, EmailSendResult } from './email-sender';

// Types
export type {
  HostingProvider,
  SetupStepName,
  SetupStepStatus,
  SetupStep,
  ManualAction,
  SetupSummary,
  ClientConfig,
  SetupNotes,
  TokenFilePaths,
  SetupR2Client,
  SetupClickUpClient,
  SetupEmailClient,
  HostingClient,
  SetupPipelineDeps,
} from './setup-types';

// R2 Key Builders
export {
  buildClientApprovalR2Key,
  buildApprovedDirectionR2Key,
  buildTokenR2Key,
  buildClientConfigR2Key,
  buildSetupSummaryR2Key,
  buildSetupNotesR2Key,
  buildAssetDestR2Key,
  buildIntakeR2Key,
} from './setup-types';

// Constants
export {
  CLICKUP_SETUP_COMPLETE,
  CLICKUP_SETUP_COMPLETE_MESSAGE,
  CLICKUP_SETUP_FAILED_PREFIX,
} from './setup-types';
