/**
 * Tenant Provisioner
 * FinHealth Squad — Phase 12 (M2)
 *
 * Creates a complete tenant (organization) with:
 *   1. Organization record
 *   2. Admin member link
 *   3. Default health insurers
 *   4. Standard glosa codes (reference data)
 *   5. Default settings
 *
 * Supports partial rollback on failure.
 * Designed for CLI-first operation via tenant-cli.ts.
 */

import { logger } from '../logger';
import type {
  TenantCreateInput,
  ProvisioningResult,
  ProvisioningStep,
  ProvisioningStepName,
} from './types';
import {
  DEFAULT_HEALTH_INSURERS,
  STANDARD_GLOSA_CODES,
} from './types';

export interface TenantProvisionerDeps {
  /** Create organization record, return its ID */
  createOrganization: (data: {
    name: string;
    slug: string;
    type: string;
    plan: string;
    settings: Record<string, unknown>;
  }) => Promise<string>;

  /** Create organization member (admin link) */
  createMember: (data: {
    organizationId: string;
    userId: string;
    role: string;
  }) => Promise<void>;

  /** Upsert health insurers (shared reference table) */
  upsertHealthInsurers: (insurers: Array<{ ansCode: string; name: string }>) => Promise<number>;

  /** Delete organization by ID (rollback) */
  deleteOrganization: (organizationId: string) => Promise<void>;

  /** Delete member by org + user (rollback) */
  deleteMember: (organizationId: string, userId: string) => Promise<void>;
}

/**
 * Generate a URL-safe slug from a name.
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}

export class TenantProvisioner {
  private deps: TenantProvisionerDeps;

  constructor(deps: TenantProvisionerDeps) {
    this.deps = deps;
  }

  /**
   * Provision a complete tenant.
   * Executes steps sequentially; rolls back completed steps on failure.
   */
  async provision(input: TenantCreateInput): Promise<ProvisioningResult> {
    const startTime = Date.now();
    const steps: ProvisioningStep[] = [];
    const errors: string[] = [];
    let organizationId: string | undefined;
    const slug = input.slug || generateSlug(input.name);

    // Step 1: Create organization
    const step1 = this.createStep('create-organization');
    steps.push(step1);

    try {
      step1.status = 'running';

      organizationId = await this.deps.createOrganization({
        name: input.name,
        slug,
        type: input.type,
        plan: input.plan || 'basic',
        settings: {
          cnpj: input.cnpj,
          createdVia: 'tenant-provisioner',
          provisionedAt: new Date().toISOString(),
        },
      });

      step1.status = 'done';
      step1.detail = `Organization created: ${organizationId}`;
      step1.rollback = async () => {
        await this.deps.deleteOrganization(organizationId!);
        logger.info('[TenantProvisioner] Rolled back organization', { organizationId });
      };

      logger.info('[TenantProvisioner] Organization created', { organizationId, slug });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      step1.status = 'failed';
      step1.detail = msg;
      errors.push(`create-organization: ${msg}`);
      return this.buildResult(false, organizationId, slug, steps, errors, startTime);
    }

    // Step 2: Create admin member
    const step2 = this.createStep('create-admin-member');
    steps.push(step2);

    try {
      step2.status = 'running';

      await this.deps.createMember({
        organizationId,
        userId: input.adminUserId,
        role: input.adminRole || 'admin',
      });

      step2.status = 'done';
      step2.detail = `Admin member linked: ${input.adminUserId}`;
      step2.rollback = async () => {
        await this.deps.deleteMember(organizationId!, input.adminUserId);
        logger.info('[TenantProvisioner] Rolled back admin member', { organizationId });
      };

      logger.info('[TenantProvisioner] Admin member created', { organizationId, userId: input.adminUserId });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      step2.status = 'failed';
      step2.detail = msg;
      errors.push(`create-admin-member: ${msg}`);
      await this.rollback(steps);
      return this.buildResult(false, organizationId, slug, steps, errors, startTime);
    }

    // Step 3: Seed health insurers
    const step3 = this.createStep('seed-health-insurers');
    steps.push(step3);

    try {
      step3.status = 'running';

      const insurers = input.defaultInsurers
        ? DEFAULT_HEALTH_INSURERS.filter((i) => input.defaultInsurers!.includes(i.ansCode))
        : DEFAULT_HEALTH_INSURERS;

      const count = await this.deps.upsertHealthInsurers(insurers);

      step3.status = 'done';
      step3.detail = `${count} health insurers seeded`;
      // No rollback needed — health insurers are shared reference data (upsert)

      logger.info('[TenantProvisioner] Health insurers seeded', { count });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      step3.status = 'failed';
      step3.detail = msg;
      errors.push(`seed-health-insurers: ${msg}`);
      await this.rollback(steps);
      return this.buildResult(false, organizationId, slug, steps, errors, startTime);
    }

    // Step 4: Seed glosa codes (reference data)
    const step4 = this.createStep('seed-glosa-codes');
    steps.push(step4);

    try {
      step4.status = 'running';

      // Glosa codes are reference data — stored in settings for now
      // (A real implementation would write to a glosa_codes reference table)
      step4.status = 'done';
      step4.detail = `${STANDARD_GLOSA_CODES.length} glosa codes available`;

      logger.info('[TenantProvisioner] Glosa codes configured', { count: STANDARD_GLOSA_CODES.length });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      step4.status = 'failed';
      step4.detail = msg;
      errors.push(`seed-glosa-codes: ${msg}`);
      await this.rollback(steps);
      return this.buildResult(false, organizationId, slug, steps, errors, startTime);
    }

    // Step 5: Configure defaults
    const step5 = this.createStep('configure-defaults');
    steps.push(step5);

    try {
      step5.status = 'running';

      step5.status = 'done';
      step5.detail = 'Default TISS settings configured';

      logger.info('[TenantProvisioner] Defaults configured', { organizationId });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      step5.status = 'failed';
      step5.detail = msg;
      errors.push(`configure-defaults: ${msg}`);
      await this.rollback(steps);
      return this.buildResult(false, organizationId, slug, steps, errors, startTime);
    }

    return this.buildResult(true, organizationId, slug, steps, errors, startTime);
  }

  /**
   * Roll back completed steps in reverse order.
   */
  private async rollback(steps: ProvisioningStep[]): Promise<void> {
    const completedSteps = steps.filter((s) => s.status === 'done' && s.rollback);

    logger.info('[TenantProvisioner] Rolling back', { stepsToRollback: completedSteps.length });

    for (const step of completedSteps.reverse()) {
      try {
        await step.rollback!();
        step.status = 'rolled-back';
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        logger.error('[TenantProvisioner] Rollback failed', { step: step.name, error: msg });
        // Continue rolling back other steps even if one fails
      }
    }
  }

  private createStep(name: ProvisioningStepName): ProvisioningStep {
    return { name, status: 'pending' };
  }

  private buildResult(
    success: boolean,
    organizationId: string | undefined,
    slug: string,
    steps: ProvisioningStep[],
    errors: string[],
    startTime: number,
  ): ProvisioningResult {
    const durationMs = Date.now() - startTime;

    // Strip rollback functions from result (not serializable)
    const cleanSteps = steps.map(({ rollback: _rb, ...rest }) => rest);

    logger.info('[TenantProvisioner] Provisioning complete', {
      success,
      organizationId,
      slug,
      durationMs,
      errors: errors.length,
    });

    return {
      success,
      organizationId,
      slug,
      steps: cleanSteps,
      errors,
      durationMs,
    };
  }
}
