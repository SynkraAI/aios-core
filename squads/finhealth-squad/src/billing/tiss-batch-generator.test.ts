/**
 * TISS Batch Generator Tests
 * FinHealth Squad — Phase 12 (M3)
 */

import { describe, it, expect } from 'vitest';
import {
  groupAccountsByBatch,
  generateBatchId,
  generateLoteNumber,
  buildBatchXml,
  computeTotalAmount,
  createBatchFromGroup,
} from './tiss-batch-generator';
import type { MedicalAccount, Procedure } from '../database/supabase-client';

// ============================================================================
// Test fixtures
// ============================================================================

function createAccount(overrides: Partial<MedicalAccount> = {}): MedicalAccount {
  return {
    id: `acc-${Math.random().toString(36).substring(2, 8)}`,
    account_number: 'ACC-001',
    patient_id: 'patient-1',
    health_insurer_id: 'insurer-1',
    admission_date: '2026-02-01',
    account_type: 'sadt',
    status: 'validated',
    total_amount: 100,
    approved_amount: 0,
    glosa_amount: 0,
    paid_amount: 0,
    metadata: {},
    created_at: '2026-02-01T00:00:00Z',
    updated_at: '2026-02-01T00:00:00Z',
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
    created_at: '2026-02-01T00:00:00Z',
    ...overrides,
  };
}

// ============================================================================
// Tests
// ============================================================================

describe('TissBatchGenerator', () => {
  describe('groupAccountsByBatch()', () => {
    it('should group accounts by insurer + competencia', () => {
      const acc1 = createAccount({ id: 'a1', health_insurer_id: 'ins-1', admission_date: '2026-01-15' });
      const acc2 = createAccount({ id: 'a2', health_insurer_id: 'ins-1', admission_date: '2026-01-20' });
      const acc3 = createAccount({ id: 'a3', health_insurer_id: 'ins-2', admission_date: '2026-01-10' });
      const acc4 = createAccount({ id: 'a4', health_insurer_id: 'ins-1', admission_date: '2026-02-05' });

      const procs = new Map<string, Procedure[]>();
      procs.set('a1', [createProcedure({ medical_account_id: 'a1' })]);
      procs.set('a2', [createProcedure({ medical_account_id: 'a2' })]);
      procs.set('a3', [createProcedure({ medical_account_id: 'a3' })]);
      procs.set('a4', [createProcedure({ medical_account_id: 'a4' })]);

      const groups = groupAccountsByBatch([acc1, acc2, acc3, acc4], procs);

      // ins-1 + 2026-01, ins-2 + 2026-01, ins-1 + 2026-02
      expect(groups.size).toBe(3);

      const ins1Jan = groups.get('ins-1|2026-01');
      expect(ins1Jan).toBeDefined();
      expect(ins1Jan!.accounts).toHaveLength(2);

      const ins2Jan = groups.get('ins-2|2026-01');
      expect(ins2Jan).toBeDefined();
      expect(ins2Jan!.accounts).toHaveLength(1);

      const ins1Feb = groups.get('ins-1|2026-02');
      expect(ins1Feb).toBeDefined();
      expect(ins1Feb!.accounts).toHaveLength(1);
    });

    it('should skip accounts without health_insurer_id', () => {
      const acc1 = createAccount({ id: 'a1', health_insurer_id: 'ins-1' });
      const acc2 = createAccount({ id: 'a2', health_insurer_id: undefined });

      const groups = groupAccountsByBatch([acc1, acc2], new Map());
      expect(groups.size).toBe(1);
    });

    it('should handle empty accounts', () => {
      const groups = groupAccountsByBatch([], new Map());
      expect(groups.size).toBe(0);
    });

    it('should associate procedures with accounts in groups', () => {
      const acc1 = createAccount({ id: 'a1', health_insurer_id: 'ins-1', admission_date: '2026-01-15' });

      const procs = new Map<string, Procedure[]>();
      procs.set('a1', [
        createProcedure({ medical_account_id: 'a1', description: 'Proc A' }),
        createProcedure({ medical_account_id: 'a1', description: 'Proc B' }),
      ]);

      const groups = groupAccountsByBatch([acc1], procs);
      const group = groups.get('ins-1|2026-01')!;

      expect(group.procedures.get('a1')).toHaveLength(2);
    });
  });

  describe('generateBatchId()', () => {
    it('should generate unique IDs', () => {
      const id1 = generateBatchId();
      const id2 = generateBatchId();
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^batch-/);
    });
  });

  describe('generateLoteNumber()', () => {
    it('should generate 12-digit number', () => {
      const lote = generateLoteNumber();
      expect(lote).toHaveLength(12);
      expect(lote).toMatch(/^\d{12}$/);
    });
  });

  describe('buildBatchXml()', () => {
    it('should build valid TISS lote XML with single guide', () => {
      const account = createAccount({ id: 'a1', patient_id: 'p1', health_insurer_id: 'ins-1' });
      const procs = new Map<string, Procedure[]>();
      procs.set('a1', [
        createProcedure({ medical_account_id: 'a1', tuss_code: '40301010', description: 'Hemograma', unit_price: 25, total_price: 25 }),
      ]);

      const xml = buildBatchXml([account], procs, {
        loteNumber: '000000000001',
        ansCode: '999999',
      });

      expect(xml).toContain('mensagemTISS');
      expect(xml).toContain('ENVIO_LOTE_GUIAS');
      expect(xml).toContain('000000000001');
      expect(xml).toContain('999999');
      expect(xml).toContain('40301010');
      expect(xml).toContain('Hemograma');
      expect(xml).toContain('guiaSP_SADT');
    });

    it('should build XML with multiple guides', () => {
      const acc1 = createAccount({ id: 'a1', patient_id: 'p1' });
      const acc2 = createAccount({ id: 'a2', patient_id: 'p2' });

      const procs = new Map<string, Procedure[]>();
      procs.set('a1', [createProcedure({ medical_account_id: 'a1', description: 'Proc A' })]);
      procs.set('a2', [createProcedure({ medical_account_id: 'a2', description: 'Proc B' })]);

      const xml = buildBatchXml([acc1, acc2], procs, {
        loteNumber: '000000000002',
        ansCode: '888888',
      });

      expect(xml).toContain('Proc A');
      expect(xml).toContain('Proc B');
      expect(xml).toContain('ENVIO_LOTE_GUIAS');
    });

    it('should handle accounts with no procedures', () => {
      const account = createAccount({ id: 'a1' });
      const procs = new Map<string, Procedure[]>();

      const xml = buildBatchXml([account], procs, {
        loteNumber: '000000000003',
        ansCode: '777777',
      });

      expect(xml).toContain('mensagemTISS');
      expect(xml).toContain('guiaSP_SADT');
    });

    it('should use specified schema version', () => {
      const account = createAccount({ id: 'a1' });
      const xml = buildBatchXml([account], new Map(), {
        loteNumber: '000000000004',
        ansCode: '666666',
        schemaVersion: '4.01.00',
      });

      expect(xml).toContain('4.01.00');
    });
  });

  describe('computeTotalAmount()', () => {
    it('should sum all procedure amounts', () => {
      const procs = new Map<string, Procedure[]>();
      procs.set('a1', [
        createProcedure({ total_price: 100.50 }),
        createProcedure({ total_price: 200.25 }),
      ]);
      procs.set('a2', [
        createProcedure({ total_price: 50.00 }),
      ]);

      const total = computeTotalAmount(procs);
      expect(total).toBe(350.75);
    });

    it('should return 0 for empty procedures', () => {
      expect(computeTotalAmount(new Map())).toBe(0);
    });
  });

  describe('createBatchFromGroup()', () => {
    it('should create a complete TissBatch object', () => {
      const acc = createAccount({ id: 'a1' });
      const procs = new Map<string, Procedure[]>();
      procs.set('a1', [createProcedure({ total_price: 100 })]);

      const batch = createBatchFromGroup(
        { healthInsurerId: 'ins-1', competencia: '2026-01' },
        [acc],
        procs,
        { name: 'Unimed', ansCode: '326305' },
        'org-1',
      );

      expect(batch.id).toMatch(/^batch-/);
      expect(batch.organizationId).toBe('org-1');
      expect(batch.healthInsurerId).toBe('ins-1');
      expect(batch.healthInsurerName).toBe('Unimed');
      expect(batch.healthInsurerAnsCode).toBe('326305');
      expect(batch.competencia).toBe('2026-01');
      expect(batch.guideCount).toBe(1);
      expect(batch.totalAmount).toBe(100);
      expect(batch.status).toBe('pending');
      expect(batch.xml).toBeTruthy();
      expect(batch.createdAt).toBeInstanceOf(Date);
    });
  });
});
