/**
 * Client Setup Pipeline for automated client setup (BSS-7.9).
 *
 * Orchestrates the full 10-step setup process triggered when a client
 * approval has `approved: true` and `approved_for_setup: true`. Each step
 * is independently tracked with timing, error handling, and graceful
 * degradation for non-critical failures.
 *
 * @module onboarding/setup/client-setup-pipeline
 */

import type { ApprovedDirection } from '../review/review-types';
import type { IntakeRecord } from '../types';
import type { ClientApproval } from '../approval/approval-types';
import type {
  SetupPipelineDeps,
  SetupStep,
  SetupStepName,
  SetupSummary,
  ClientConfig,
  ManualAction,
  SetupNotes,
  TokenFilePaths,
} from './setup-types';
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
} from './setup-types';
import { TokenFileGenerator } from './token-generator';
import { HostingConfigurator } from './hosting-configurator';
import { SetupEmailSender } from './email-sender';

/**
 * Orchestrates the full automated client setup pipeline.
 *
 * The pipeline executes 10 steps in sequence:
 * 1. Trigger check (verify approval)
 * 2. Read inputs (approved direction + intake)
 * 3. Token generation (3 DTCG files)
 * 4. Folder structure creation
 * 5. Logo copy (onboarding/ to assets/)
 * 6. Hosting configuration
 * 7. Client config write
 * 8. Email notification
 * 9. ClickUp update
 * 10. Setup summary write
 */
export class ClientSetupPipeline {
  private readonly _deps: SetupPipelineDeps;

  /**
   * Create a new ClientSetupPipeline.
   *
   * @param deps - Injected dependencies (R2, ClickUp, email, hosting).
   */
  constructor(deps: SetupPipelineDeps) {
    this._deps = deps;
  }

  /**
   * Run the full setup pipeline for a client.
   *
   * @param clientId - The client identifier to set up.
   * @returns A setup summary with step-level tracking and timing.
   */
  async run(clientId: string): Promise<SetupSummary> {
    const pipelineStartedAt = new Date().toISOString();
    const stepsCompleted: SetupStep[] = [];
    const stepsSkipped: SetupStep[] = [];
    const stepsFailed: SetupStep[] = [];
    const manualActions: ManualAction[] = [];

    // -----------------------------------------------------------------------
    // Step 1: Trigger Check (AC 1)
    // -----------------------------------------------------------------------
    const triggerStep = await this._executeStep('trigger_check', async () => {
      const approval = await this._deps.r2Client.downloadJson<ClientApproval>(
        buildClientApprovalR2Key(clientId),
      );

      if (!approval) {
        throw new Error('Client approval record not found in R2');
      }

      if (!approval.approved || !approval.approved_for_setup) {
        throw new Error(
          `Client not approved for setup: approved=${String(approval.approved)}, approved_for_setup=${String(approval.approved_for_setup)}`,
        );
      }

      return approval;
    });

    this._categorizeStep(triggerStep.step, stepsCompleted, stepsSkipped, stepsFailed);

    if (triggerStep.step.status === 'failed') {
      return this._buildSummary(
        clientId,
        'failed',
        pipelineStartedAt,
        stepsCompleted,
        stepsSkipped,
        stepsFailed,
        manualActions,
      );
    }

    const approval = triggerStep.result as ClientApproval;

    // -----------------------------------------------------------------------
    // Step 2: Read Inputs
    // -----------------------------------------------------------------------
    const inputsStep = await this._executeStep('trigger_check', async () => {
      const approvedDirection = await this._deps.r2Client.downloadJson<ApprovedDirection>(
        buildApprovedDirectionR2Key(clientId),
      );

      if (!approvedDirection) {
        throw new Error('Approved direction not found in R2');
      }

      const intake = await this._deps.r2Client.downloadJson<IntakeRecord>(
        buildIntakeR2Key(clientId),
      );

      return { approvedDirection, intake };
    });

    // Note: inputsStep is tracked under trigger_check since it is part of
    // the initial data loading. We do not add a duplicate step entry.

    if (inputsStep.step.status === 'failed') {
      stepsFailed.push({
        ...inputsStep.step,
        name: 'trigger_check',
      });
      return this._buildSummary(
        clientId,
        'failed',
        pipelineStartedAt,
        stepsCompleted,
        stepsSkipped,
        stepsFailed,
        manualActions,
      );
    }

    const { approvedDirection, intake } = inputsStep.result as {
      approvedDirection: ApprovedDirection;
      intake: IntakeRecord | null;
    };

    // -----------------------------------------------------------------------
    // Step 3: Token Generation (AC 2)
    // -----------------------------------------------------------------------
    let tokenPaths: TokenFilePaths | null = null;

    const tokenStep = await this._executeStep('token_generation', async () => {
      const generator = new TokenFileGenerator();

      const primitive = generator.generatePrimitive(approvedDirection);
      const semantic = generator.generateSemantic(approvedDirection);
      const component = generator.generateComponent(approvedDirection);

      const primitiveKey = buildTokenR2Key(clientId, 'primitive');
      const semanticKey = buildTokenR2Key(clientId, 'semantic');
      const componentKey = buildTokenR2Key(clientId, 'component');

      await this._deps.r2Client.uploadJson(primitiveKey, primitive);
      await this._deps.r2Client.uploadJson(semanticKey, semantic);
      await this._deps.r2Client.uploadJson(componentKey, component);

      tokenPaths = {
        primitive: primitiveKey,
        semantic: semanticKey,
        component: componentKey,
      };

      return { primitive, semantic, component };
    });

    this._categorizeStep(tokenStep.step, stepsCompleted, stepsSkipped, stepsFailed);

    // -----------------------------------------------------------------------
    // Step 4: Folder Structure (AC 3)
    // -----------------------------------------------------------------------
    const folderStep = await this._executeStep('folder_structure', async () => {
      await this._deps.r2Client.createPlaceholder(
        `brand-assets/${clientId}/assets/.gitkeep`,
      );
      await this._deps.r2Client.createPlaceholder(
        `brand-assets/${clientId}/deliverables/.gitkeep`,
      );
    });

    this._categorizeStep(folderStep.step, stepsCompleted, stepsSkipped, stepsFailed);

    // -----------------------------------------------------------------------
    // Step 5: Logo Copy (AC 4)
    // -----------------------------------------------------------------------
    const logoCopyStep = await this._executeStep('logo_copy', async () => {
      const onboardingPrefix = `brand-assets/${clientId}/onboarding/`;
      const allKeys = await this._deps.r2Client.listKeys(onboardingPrefix);
      const logoKeys = allKeys.filter((key) => {
        const filename = key.split('/').pop() ?? '';
        return filename.startsWith('logo-');
      });

      for (const sourceKey of logoKeys) {
        const filename = sourceKey.split('/').pop() ?? '';
        const destKey = buildAssetDestR2Key(clientId, filename);
        await this._deps.r2Client.copyObject(sourceKey, destKey);
      }

      return { copiedCount: logoKeys.length };
    });

    this._categorizeStep(logoCopyStep.step, stepsCompleted, stepsSkipped, stepsFailed);

    // -----------------------------------------------------------------------
    // Step 6: Hosting Configuration (AC 5)
    // -----------------------------------------------------------------------
    let hostingUrl: string | undefined;

    const hostingStep = await this._executeStep('hosting_config', async () => {
      const configurator = new HostingConfigurator({
        hostingProvider: this._deps.hostingProvider,
        hostingClient: this._deps.hostingClient,
      });

      const result = await configurator.configure(clientId);

      if (result.url) {
        hostingUrl = result.url;
      }

      if (result.manualAction) {
        manualActions.push(result.manualAction);
      }

      return result;
    });

    this._categorizeStep(hostingStep.step, stepsCompleted, stepsSkipped, stepsFailed);

    // -----------------------------------------------------------------------
    // Step 7: Client Config (AC 6)
    // -----------------------------------------------------------------------
    const clientConfigStep = await this._executeStep('client_config', async () => {
      const clientConfig: ClientConfig = {
        client_id: clientId,
        client_name: approval.client_name ?? clientId,
        onboarding_mode: approvedDirection.onboarding_mode,
        approved_at: approval.approved_at,
        hosting_url: hostingUrl,
        token_paths: tokenPaths ?? {
          primitive: buildTokenR2Key(clientId, 'primitive'),
          semantic: buildTokenR2Key(clientId, 'semantic'),
          component: buildTokenR2Key(clientId, 'component'),
        },
        deliverables_selected: intake?.intakeData.deliverableSelection.selected ?? [],
      };

      await this._deps.r2Client.uploadJson(
        buildClientConfigR2Key(clientId),
        clientConfig,
      );

      return clientConfig;
    });

    this._categorizeStep(clientConfigStep.step, stepsCompleted, stepsSkipped, stepsFailed);

    // -----------------------------------------------------------------------
    // Step 8: Email Notification (AC 7) — non-blocking
    // -----------------------------------------------------------------------
    const emailStep = await this._executeStep('email_notification', async () => {
      if (!this._deps.emailClient || !this._deps.teamEmail) {
        return { skipped: true, reason: 'No email client or team email configured' };
      }

      const sender = new SetupEmailSender({
        emailClient: this._deps.emailClient,
      });

      const result = await sender.sendSetupNotification({
        to: this._deps.teamEmail,
        clientId,
        clientName: approval.client_name ?? clientId,
        hostingUrl,
        tokenPaths: tokenPaths ?? {
          primitive: buildTokenR2Key(clientId, 'primitive'),
          semantic: buildTokenR2Key(clientId, 'semantic'),
          component: buildTokenR2Key(clientId, 'component'),
        },
      });

      if (!result.sent) {
        throw new Error(result.error ?? 'Email send failed');
      }

      return result;
    });

    // Email failures are non-critical — mark as skipped, not failed
    if (emailStep.step.status === 'failed') {
      stepsSkipped.push({
        ...emailStep.step,
        status: 'skipped',
        skipReason: emailStep.step.error ?? 'Email notification failed',
      });
    } else if (
      emailStep.result &&
      typeof emailStep.result === 'object' &&
      'skipped' in emailStep.result
    ) {
      stepsSkipped.push({
        ...emailStep.step,
        status: 'skipped',
        skipReason: (emailStep.result as { reason: string }).reason,
      });
    } else {
      stepsCompleted.push(emailStep.step);
    }

    // -----------------------------------------------------------------------
    // Step 9: ClickUp Update (AC 8) — non-blocking
    // -----------------------------------------------------------------------
    const clickUpStep = await this._executeStep('clickup_update', async () => {
      if (!this._deps.clickUpClient || !this._deps.clickUpTaskId) {
        return { skipped: true, reason: 'No ClickUp client or task ID configured' };
      }

      await this._deps.clickUpClient.addComment(
        this._deps.clickUpTaskId,
        CLICKUP_SETUP_COMPLETE_MESSAGE,
      );

      await this._deps.clickUpClient.updateTaskStatus(
        this._deps.clickUpTaskId,
        CLICKUP_SETUP_COMPLETE,
      );

      return { skipped: false };
    });

    // ClickUp failures are non-critical — mark as skipped, not failed
    if (clickUpStep.step.status === 'failed') {
      stepsSkipped.push({
        ...clickUpStep.step,
        status: 'skipped',
        skipReason: clickUpStep.step.error ?? 'ClickUp update failed',
      });
    } else if (
      clickUpStep.result &&
      typeof clickUpStep.result === 'object' &&
      'skipped' in clickUpStep.result
    ) {
      stepsSkipped.push({
        ...clickUpStep.step,
        status: 'skipped',
        skipReason: (clickUpStep.result as { reason: string }).reason,
      });
    } else {
      stepsCompleted.push(clickUpStep.step);
    }

    // -----------------------------------------------------------------------
    // Determine overall status
    // -----------------------------------------------------------------------
    const hasCriticalFailure = stepsFailed.some((s) =>
      ['token_generation', 'client_config', 'trigger_check'].includes(s.name),
    );
    const overallStatus: SetupSummary['status'] = hasCriticalFailure
      ? 'failed'
      : stepsFailed.length > 0
        ? 'partial'
        : 'completed';

    // Write setup-notes.json if there are manual actions
    if (manualActions.length > 0) {
      const setupNotes: SetupNotes = {
        manual_actions: manualActions,
        generated_at: new Date().toISOString(),
        client_id: clientId,
      };

      try {
        await this._deps.r2Client.uploadJson(
          buildSetupNotesR2Key(clientId),
          setupNotes,
        );
      } catch {
        // Best-effort — do not fail the pipeline for notes
      }
    }

    // Post ClickUp failure comment if pipeline failed
    if (overallStatus === 'failed' && this._deps.clickUpClient && this._deps.clickUpTaskId) {
      try {
        await this._deps.clickUpClient.addComment(
          this._deps.clickUpTaskId,
          CLICKUP_SETUP_FAILED_PREFIX,
        );
      } catch {
        // Best-effort — already in failure path
      }
    }

    // -----------------------------------------------------------------------
    // Step 10: Write Setup Summary (AC 9)
    // -----------------------------------------------------------------------
    const summary = this._buildSummary(
      clientId,
      overallStatus,
      pipelineStartedAt,
      stepsCompleted,
      stepsSkipped,
      stepsFailed,
      manualActions,
    );

    try {
      await this._deps.r2Client.uploadJson(
        buildSetupSummaryR2Key(clientId),
        summary,
      );
    } catch {
      // Best-effort — summary write failure is logged but not fatal
    }

    return summary;
  }

  /**
   * Execute a single step with timing and error handling.
   *
   * @param name - The step identifier.
   * @param fn - The async function to execute.
   * @returns The step tracking record and optional result.
   */
  private async _executeStep<T>(
    name: SetupStepName,
    fn: () => Promise<T>,
  ): Promise<{ step: SetupStep; result: T | null }> {
    const startedAt = new Date().toISOString();

    try {
      const result = await fn();
      const completedAt = new Date().toISOString();
      const durationMs =
        new Date(completedAt).getTime() - new Date(startedAt).getTime();

      return {
        step: {
          name,
          status: 'completed',
          startedAt,
          completedAt,
          durationMs,
        },
        result,
      };
    } catch (error) {
      const completedAt = new Date().toISOString();
      const durationMs =
        new Date(completedAt).getTime() - new Date(startedAt).getTime();
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      return {
        step: {
          name,
          status: 'failed',
          startedAt,
          completedAt,
          durationMs,
          error: errorMessage,
        },
        result: null,
      };
    }
  }

  /**
   * Categorize a step into completed, skipped, or failed arrays.
   *
   * @param step - The step to categorize.
   * @param completed - Array of completed steps.
   * @param skipped - Array of skipped steps.
   * @param failed - Array of failed steps.
   */
  private _categorizeStep(
    step: SetupStep,
    completed: SetupStep[],
    skipped: SetupStep[],
    failed: SetupStep[],
  ): void {
    switch (step.status) {
      case 'completed':
        completed.push(step);
        break;
      case 'skipped':
        skipped.push(step);
        break;
      case 'failed':
        failed.push(step);
        break;
      default:
        break;
    }
  }

  /**
   * Build the final setup summary.
   *
   * @param clientId - The client identifier.
   * @param status - Overall pipeline status.
   * @param pipelineStartedAt - ISO timestamp of pipeline start.
   * @param stepsCompleted - Completed steps.
   * @param stepsSkipped - Skipped steps.
   * @param stepsFailed - Failed steps.
   * @param manualActions - Manual action items.
   * @returns The complete setup summary.
   */
  private _buildSummary(
    clientId: string,
    status: SetupSummary['status'],
    pipelineStartedAt: string,
    stepsCompleted: SetupStep[],
    stepsSkipped: SetupStep[],
    stepsFailed: SetupStep[],
    manualActions: ManualAction[],
  ): SetupSummary {
    const completedAt = new Date().toISOString();
    const durationMs =
      new Date(completedAt).getTime() - new Date(pipelineStartedAt).getTime();

    return {
      client_id: clientId,
      status,
      setup_started_at: pipelineStartedAt,
      setup_completed_at: completedAt,
      duration_ms: durationMs,
      steps_completed: stepsCompleted,
      steps_skipped: stepsSkipped,
      steps_failed: stepsFailed,
      manual_actions_required: manualActions,
    };
  }
}
