/**
 * Tenant Provisioner Tests
 * FinHealth Squad — Phase 12 (M2)
 */

import { describe, it, expect, vi } from 'vitest';
import { TenantProvisioner, generateSlug } from './tenant-provisioner';
import type { TenantProvisionerDeps } from './tenant-provisioner';
import type { TenantCreateInput } from './types';

// ============================================================================
// Test fixtures
// ============================================================================

function createMockDeps(overrides: Partial<TenantProvisionerDeps> = {}): TenantProvisionerDeps {
  return {
    createOrganization: vi.fn().mockResolvedValue('org-uuid-123'),
    createMember: vi.fn().mockResolvedValue(undefined),
    upsertHealthInsurers: vi.fn().mockResolvedValue(6),
    deleteOrganization: vi.fn().mockResolvedValue(undefined),
    deleteMember: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function createInput(overrides: Partial<TenantCreateInput> = {}): TenantCreateInput {
  return {
    name: 'Hospital Teste',
    type: 'hospital',
    adminUserId: 'user-uuid-456',
    ...overrides,
  };
}

// ============================================================================
// Tests
// ============================================================================

describe('TenantProvisioner', () => {
  describe('generateSlug()', () => {
    it('should generate slug from name', () => {
      expect(generateSlug('Hospital Teste LTDA')).toBe('hospital-teste-ltda');
    });

    it('should remove accents', () => {
      expect(generateSlug('Clínica São Paulo')).toBe('clinica-sao-paulo');
    });

    it('should handle special characters', () => {
      expect(generateSlug('Hospital #1 (Centro)')).toBe('hospital-1-centro');
    });

    it('should limit length to 50 chars', () => {
      const longName = 'A'.repeat(100);
      expect(generateSlug(longName).length).toBeLessThanOrEqual(50);
    });

    it('should not start or end with hyphen', () => {
      const slug = generateSlug('--Test--');
      expect(slug).not.toMatch(/^-/);
      expect(slug).not.toMatch(/-$/);
    });
  });

  describe('provision()', () => {
    it('should successfully provision a complete tenant', async () => {
      const deps = createMockDeps();
      const provisioner = new TenantProvisioner(deps);

      const result = await provisioner.provision(createInput());

      expect(result.success).toBe(true);
      expect(result.organizationId).toBe('org-uuid-123');
      expect(result.slug).toBe('hospital-teste');
      expect(result.steps).toHaveLength(5);
      expect(result.errors).toHaveLength(0);
      expect(result.durationMs).toBeGreaterThanOrEqual(0);

      // All steps should be done
      for (const step of result.steps) {
        expect(step.status).toBe('done');
      }
    });

    it('should call createOrganization with correct data', async () => {
      const deps = createMockDeps();
      const provisioner = new TenantProvisioner(deps);

      await provisioner.provision(createInput({
        name: 'UBS Centro',
        type: 'ubs',
        cnpj: '12.345.678/0001-90',
        plan: 'professional',
      }));

      expect(deps.createOrganization).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'UBS Centro',
          slug: 'ubs-centro',
          type: 'ubs',
          plan: 'professional',
          settings: expect.objectContaining({
            cnpj: '12.345.678/0001-90',
            createdVia: 'tenant-provisioner',
          }),
        }),
      );
    });

    it('should create admin member with correct role', async () => {
      const deps = createMockDeps();
      const provisioner = new TenantProvisioner(deps);

      await provisioner.provision(createInput({
        adminUserId: 'user-789',
        adminRole: 'billing',
      }));

      expect(deps.createMember).toHaveBeenCalledWith({
        organizationId: 'org-uuid-123',
        userId: 'user-789',
        role: 'billing',
      });
    });

    it('should default admin role to admin', async () => {
      const deps = createMockDeps();
      const provisioner = new TenantProvisioner(deps);

      await provisioner.provision(createInput());

      expect(deps.createMember).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'admin' }),
      );
    });

    it('should use provided slug', async () => {
      const deps = createMockDeps();
      const provisioner = new TenantProvisioner(deps);

      const result = await provisioner.provision(createInput({ slug: 'custom-slug' }));

      expect(result.slug).toBe('custom-slug');
      expect(deps.createOrganization).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'custom-slug' }),
      );
    });

    it('should seed health insurers', async () => {
      const deps = createMockDeps();
      const provisioner = new TenantProvisioner(deps);

      await provisioner.provision(createInput());

      expect(deps.upsertHealthInsurers).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ ansCode: '326305', name: 'Unimed' }),
        ]),
      );
    });

    it('should filter health insurers when defaultInsurers specified', async () => {
      const deps = createMockDeps();
      const provisioner = new TenantProvisioner(deps);

      await provisioner.provision(createInput({
        defaultInsurers: ['326305', '006246'],
      }));

      expect(deps.upsertHealthInsurers).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ ansCode: '326305' }),
          expect.objectContaining({ ansCode: '006246' }),
        ]),
      );

      // Should not include other insurers
      const call = (deps.upsertHealthInsurers as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(call).toHaveLength(2);
    });

    it('should rollback on member creation failure', async () => {
      const deps = createMockDeps({
        createMember: vi.fn().mockRejectedValue(new Error('Member creation failed')),
      });
      const provisioner = new TenantProvisioner(deps);

      const result = await provisioner.provision(createInput());

      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining('Member creation failed'));

      // Organization should be rolled back
      expect(deps.deleteOrganization).toHaveBeenCalledWith('org-uuid-123');

      // Check step statuses
      const orgStep = result.steps.find((s) => s.name === 'create-organization');
      expect(orgStep?.status).toBe('rolled-back');

      const memberStep = result.steps.find((s) => s.name === 'create-admin-member');
      expect(memberStep?.status).toBe('failed');
    });

    it('should rollback on insurer seeding failure', async () => {
      const deps = createMockDeps({
        upsertHealthInsurers: vi.fn().mockRejectedValue(new Error('DB connection lost')),
      });
      const provisioner = new TenantProvisioner(deps);

      const result = await provisioner.provision(createInput());

      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining('DB connection lost'));

      // Both org and member should be rolled back
      expect(deps.deleteOrganization).toHaveBeenCalled();
      expect(deps.deleteMember).toHaveBeenCalled();
    });

    it('should fail on organization creation error without rollback', async () => {
      const deps = createMockDeps({
        createOrganization: vi.fn().mockRejectedValue(new Error('Duplicate slug')),
      });
      const provisioner = new TenantProvisioner(deps);

      const result = await provisioner.provision(createInput());

      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining('Duplicate slug'));

      // No rollback should be attempted (nothing was created)
      expect(deps.deleteOrganization).not.toHaveBeenCalled();
      expect(deps.deleteMember).not.toHaveBeenCalled();
    });

    it('should track duration', async () => {
      const deps = createMockDeps();
      const provisioner = new TenantProvisioner(deps);

      const result = await provisioner.provision(createInput());

      expect(result.durationMs).toBeGreaterThanOrEqual(0);
      expect(result.durationMs).toBeLessThan(5000);
    });

    it('should not include rollback functions in result', async () => {
      const deps = createMockDeps();
      const provisioner = new TenantProvisioner(deps);

      const result = await provisioner.provision(createInput());

      for (const step of result.steps) {
        expect(step).not.toHaveProperty('rollback');
      }
    });

    it('should include step details in result', async () => {
      const deps = createMockDeps();
      const provisioner = new TenantProvisioner(deps);

      const result = await provisioner.provision(createInput());

      const orgStep = result.steps.find((s) => s.name === 'create-organization');
      expect(orgStep?.detail).toContain('org-uuid-123');

      const insurerStep = result.steps.find((s) => s.name === 'seed-health-insurers');
      expect(insurerStep?.detail).toContain('6');
    });
  });
});
