/**
 * Batch Processor Tests
 * FinHealth Squad — Phase 12 (M3)
 */

import { describe, it, expect, vi } from 'vitest';
import { BatchProcessor } from './batch-processor';
import type { BatchProcessorDeps } from './batch-processor';
import type { MedicalAccount, Procedure, HealthInsurer } from '../database/supabase-client';
import { XmlSigner } from '../crypto/xml-signer';

// ============================================================================
// Test fixtures
// ============================================================================

function createAccount(overrides: Partial<MedicalAccount> = {}): MedicalAccount {
  return {
    id: `acc-${Math.random().toString(36).substring(2, 8)}`,
    account_number: 'ACC-001',
    patient_id: 'patient-1',
    health_insurer_id: 'insurer-1',
    admission_date: '2026-01-15',
    account_type: 'sadt',
    status: 'validated',
    total_amount: 100,
    approved_amount: 0,
    glosa_amount: 0,
    paid_amount: 0,
    metadata: {},
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function createProcedure(overrides: Partial<Procedure> = {}): Procedure {
  return {
    id: `proc-${Math.random().toString(36).substring(2, 8)}`,
    medical_account_id: 'acc-1',
    tuss_code: '40301010',
    description: 'Hemograma completo',
    quantity: 1,
    unit_price: 25.00,
    total_price: 25.00,
    status: 'pending',
    metadata: {},
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function createInsurer(overrides: Partial<HealthInsurer> = {}): HealthInsurer {
  return {
    id: 'insurer-1',
    ans_code: '326305',
    name: 'Unimed',
    tiss_version: '3.05.00',
    config: {},
    active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function createMockDeps(
  accounts: MedicalAccount[] = [],
  procedures: Map<string, Procedure[]> = new Map(),
  insurer: HealthInsurer | null = createInsurer(),
): BatchProcessorDeps {
  return {
    fetchAccounts: vi.fn().mockResolvedValue(accounts),
    fetchProcedures: vi.fn().mockResolvedValue(procedures),
    fetchInsurer: vi.fn().mockResolvedValue(insurer),
  };
}

// ============================================================================
// Tests
// ============================================================================

describe('BatchProcessor', () => {
  describe('generateBatches()', () => {
    it('should return empty result when no accounts', async () => {
      const deps = createMockDeps();
      const processor = new BatchProcessor(deps);

      const result = await processor.generateBatches('org-1');

      expect(result.success).toBe(true);
      expect(result.batches).toHaveLength(0);
      expect(result.totalGuides).toBe(0);
      expect(result.totalAmount).toBe(0);
    });

    it('should generate a single batch for one insurer + period', async () => {
      const acc1 = createAccount({ id: 'a1', health_insurer_id: 'ins-1', admission_date: '2026-01-15' });
      const acc2 = createAccount({ id: 'a2', health_insurer_id: 'ins-1', admission_date: '2026-01-20' });

      const procs = new Map<string, Procedure[]>();
      procs.set('a1', [createProcedure({ medical_account_id: 'a1', total_price: 50 })]);
      procs.set('a2', [createProcedure({ medical_account_id: 'a2', total_price: 75 })]);

      const deps = createMockDeps([acc1, acc2], procs);
      const processor = new BatchProcessor(deps);

      const result = await processor.generateBatches('org-1');

      expect(result.success).toBe(true);
      expect(result.batches).toHaveLength(1);
      expect(result.batches[0].guideCount).toBe(2);
      expect(result.batches[0].totalAmount).toBe(125);
      expect(result.batches[0].competencia).toBe('2026-01');
      expect(result.batches[0].xml).toContain('mensagemTISS');
    });

    it('should generate multiple batches for different insurers', async () => {
      const acc1 = createAccount({ id: 'a1', health_insurer_id: 'ins-1', admission_date: '2026-01-15' });
      const acc2 = createAccount({ id: 'a2', health_insurer_id: 'ins-2', admission_date: '2026-01-20' });

      const procs = new Map<string, Procedure[]>();
      procs.set('a1', [createProcedure({ medical_account_id: 'a1' })]);
      procs.set('a2', [createProcedure({ medical_account_id: 'a2' })]);

      const deps: BatchProcessorDeps = {
        fetchAccounts: vi.fn().mockResolvedValue([acc1, acc2]),
        fetchProcedures: vi.fn().mockResolvedValue(procs),
        fetchInsurer: vi.fn()
          .mockResolvedValueOnce(createInsurer({ id: 'ins-1', name: 'Unimed', ans_code: '326305' }))
          .mockResolvedValueOnce(createInsurer({ id: 'ins-2', name: 'Amil', ans_code: '006246' })),
      };

      const processor = new BatchProcessor(deps);
      const result = await processor.generateBatches('org-1');

      expect(result.success).toBe(true);
      expect(result.batches).toHaveLength(2);
      expect(result.totalGuides).toBe(2);
    });

    it('should generate separate batches for different competencias', async () => {
      const acc1 = createAccount({ id: 'a1', health_insurer_id: 'ins-1', admission_date: '2026-01-15' });
      const acc2 = createAccount({ id: 'a2', health_insurer_id: 'ins-1', admission_date: '2026-02-10' });

      const procs = new Map<string, Procedure[]>();
      procs.set('a1', [createProcedure({ medical_account_id: 'a1' })]);
      procs.set('a2', [createProcedure({ medical_account_id: 'a2' })]);

      const deps = createMockDeps([acc1, acc2], procs);
      const processor = new BatchProcessor(deps);

      const result = await processor.generateBatches('org-1');

      expect(result.success).toBe(true);
      expect(result.batches).toHaveLength(2);

      const competencias = result.batches.map((b) => b.competencia).sort();
      expect(competencias).toEqual(['2026-01', '2026-02']);
    });

    it('should report error when insurer not found', async () => {
      const acc = createAccount({ id: 'a1', health_insurer_id: 'ins-missing' });
      const procs = new Map<string, Procedure[]>();
      procs.set('a1', [createProcedure({ medical_account_id: 'a1' })]);

      const deps = createMockDeps([acc], procs, null);
      const processor = new BatchProcessor(deps);

      const result = await processor.generateBatches('org-1');

      expect(result.batches).toHaveLength(0);
      expect(result.errors).toContainEqual(expect.stringContaining('not found'));
    });

    it('should split large batches respecting maxGuidesPerBatch', async () => {
      const accounts: MedicalAccount[] = [];
      const procs = new Map<string, Procedure[]>();

      for (let i = 0; i < 5; i++) {
        const acc = createAccount({
          id: `a${i}`,
          health_insurer_id: 'ins-1',
          admission_date: '2026-01-15',
        });
        accounts.push(acc);
        procs.set(`a${i}`, [createProcedure({ medical_account_id: `a${i}`, total_price: 10 })]);
      }

      const deps = createMockDeps(accounts, procs);
      const processor = new BatchProcessor(deps, { maxGuidesPerBatch: 2 });

      const result = await processor.generateBatches('org-1');

      expect(result.success).toBe(true);
      // 5 accounts / max 2 per batch = 3 batches
      expect(result.batches).toHaveLength(3);
      expect(result.totalGuides).toBe(5);
    });

    it('should pass filters to fetchAccounts', async () => {
      const deps = createMockDeps();
      const processor = new BatchProcessor(deps);

      await processor.generateBatches('org-1', { healthInsurerId: 'ins-1', competencia: '2026-01' });

      expect(deps.fetchAccounts).toHaveBeenCalledWith('org-1', {
        healthInsurerId: 'ins-1',
        competencia: '2026-01',
      });
    });
  });

  describe('signBatch()', () => {
    it('should sign a batch XML', () => {
      const deps = createMockDeps();
      const processor = new BatchProcessor(deps);

      const { certificate, privateKey, info } = XmlSigner.generateTestCertificate();

      const batch = {
        id: 'batch-test',
        organizationId: 'org-1',
        healthInsurerId: 'ins-1',
        healthInsurerName: 'Unimed',
        healthInsurerAnsCode: '326305',
        competencia: '2026-01',
        guideCount: 1,
        totalAmount: 100,
        status: 'pending' as const,
        xml: '<?xml version="1.0" encoding="UTF-8"?><root><data>Test</data></root>',
        createdAt: new Date(),
      };

      const signed = processor.signBatch(batch, privateKey, certificate, info);

      expect(signed.status).toBe('signed');
      expect(signed.signedXml).toContain('<ds:Signature');
      expect(signed.processedAt).toBeInstanceOf(Date);
    });

    it('should fail when batch has no XML', () => {
      const deps = createMockDeps();
      const processor = new BatchProcessor(deps);
      const { certificate, privateKey, info } = XmlSigner.generateTestCertificate();

      const batch = {
        id: 'batch-noxml',
        organizationId: 'org-1',
        healthInsurerId: 'ins-1',
        healthInsurerName: 'Unimed',
        healthInsurerAnsCode: '326305',
        competencia: '2026-01',
        guideCount: 0,
        totalAmount: 0,
        status: 'pending' as const,
        xml: undefined,
        createdAt: new Date(),
      };

      const result = processor.signBatch(batch, privateKey, certificate, info);

      expect(result.status).toBe('failed');
      expect(result.error).toContain('No XML');
    });
  });

  describe('signBatches()', () => {
    it('should sign multiple batches in parallel', async () => {
      const deps = createMockDeps();
      const processor = new BatchProcessor(deps, { concurrency: 2 });
      const { certificate, privateKey, info } = XmlSigner.generateTestCertificate();

      const batches = [1, 2, 3].map((i) => ({
        id: `batch-${i}`,
        organizationId: 'org-1',
        healthInsurerId: 'ins-1',
        healthInsurerName: 'Unimed',
        healthInsurerAnsCode: '326305',
        competencia: '2026-01',
        guideCount: 1,
        totalAmount: 100,
        status: 'pending' as const,
        xml: `<?xml version="1.0" encoding="UTF-8"?><root><item>Batch ${i}</item></root>`,
        createdAt: new Date(),
      }));

      const results = await processor.signBatches(batches, privateKey, certificate, info);

      expect(results).toHaveLength(3);
      for (const r of results) {
        expect(r.status).toBe('signed');
        expect(r.signedXml).toContain('<ds:Signature');
      }
    });
  });
});
