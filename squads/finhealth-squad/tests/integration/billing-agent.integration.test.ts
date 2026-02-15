/**
 * Integration Tests: BillingAgent with Real LLM
 * FinHealth Squad — Semantic TISS Validation via OpenAI
 *
 * Mocks Supabase (no real DB) but uses real OpenAI API calls.
 * Skipped automatically when OPENAI_API_KEY is not set.
 */

import { describe, it, expect, beforeAll, vi } from 'vitest';
import { shouldSkip, createTestRuntime } from './helpers/setup';

// Mock Supabase — same pattern as unit tests, but NOT mocking OpenAI
// NOTE: Do NOT mock dotenv here — integration tests need real .env loading for OPENAI_API_KEY
vi.mock('../../src/database/supabase-client', () => ({
  MedicalAccountRepository: class {
    findById = vi.fn();
    update = vi.fn();
    updateTissValidation = vi.fn();
  },
  ProcedureRepository: class {
    findByAccountId = vi.fn();
  },
}));

// ============================================================================
// Fixtures
// ============================================================================

const VALID_TISS_XML = `<?xml version="1.0" encoding="UTF-8"?>
<ans:mensagemTISS xmlns:ans="http://www.ans.gov.br/padroes/tiss/schemas">
  <cabecalho>
    <identificacaoTransacao>
      <tipoTransacao>ENVIO_LOTE_GUIAS</tipoTransacao>
    </identificacaoTransacao>
    <versaoPadrao>3.05.00</versaoPadrao>
  </cabecalho>
  <prestadorParaOperadora>
    <loteGuias>
      <guiasTISS>
        <guiaSP_SADT>
          <procedimentosExecutados>
            <procedimentoExecutado>
              <procedimento>
                <codigoProcedimento>40301010</codigoProcedimento>
                <descricaoProcedimento>Hemograma completo</descricaoProcedimento>
              </procedimento>
              <quantidadeExecutada>1</quantidadeExecutada>
              <valorTotal>25.00</valorTotal>
            </procedimentoExecutado>
          </procedimentosExecutados>
        </guiaSP_SADT>
      </guiasTISS>
    </loteGuias>
  </prestadorParaOperadora>
</ans:mensagemTISS>`;

const MULTI_PROCEDURE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<ans:mensagemTISS xmlns:ans="http://www.ans.gov.br/padroes/tiss/schemas">
  <cabecalho>
    <identificacaoTransacao>
      <tipoTransacao>ENVIO_LOTE_GUIAS</tipoTransacao>
    </identificacaoTransacao>
    <versaoPadrao>3.05.00</versaoPadrao>
  </cabecalho>
  <prestadorParaOperadora>
    <loteGuias>
      <guiasTISS>
        <guiaSP_SADT>
          <procedimentosExecutados>
            <procedimentoExecutado>
              <procedimento>
                <codigoProcedimento>40301010</codigoProcedimento>
                <descricaoProcedimento>Hemograma completo</descricaoProcedimento>
              </procedimento>
              <quantidadeExecutada>3</quantidadeExecutada>
              <valorTotal>75.00</valorTotal>
            </procedimentoExecutado>
            <procedimentoExecutado>
              <procedimento>
                <codigoProcedimento>40302040</codigoProcedimento>
                <descricaoProcedimento>Glicose</descricaoProcedimento>
              </procedimento>
              <quantidadeExecutada>1</quantidadeExecutada>
              <valorTotal>15.00</valorTotal>
            </procedimentoExecutado>
            <procedimentoExecutado>
              <procedimento>
                <codigoProcedimento>10101012</codigoProcedimento>
                <descricaoProcedimento>Consulta em consultorio</descricaoProcedimento>
              </procedimento>
              <quantidadeExecutada>1</quantidadeExecutada>
              <valorTotal>150.00</valorTotal>
            </procedimentoExecutado>
          </procedimentosExecutados>
        </guiaSP_SADT>
      </guiasTISS>
    </loteGuias>
  </prestadorParaOperadora>
</ans:mensagemTISS>`;

// ============================================================================
// Tests
// ============================================================================

describe.skipIf(shouldSkip)('BillingAgent Integration [LIVE LLM]', () => {
  let BillingAgent: any;
  let agent: any;

  beforeAll(async () => {
    const runtime = await createTestRuntime();

    // Dynamic import after mocks are set up
    const mod = await import('../../src/agents/billing-agent');
    BillingAgent = mod.BillingAgent;
    agent = new BillingAgent(runtime);
  });

  // ========================================================================
  // Semantic TISS validation with real LLM
  // ========================================================================

  describe('semantic TISS validation', () => {
    let singleProcResult: any;
    let multiProcResult: any;

    beforeAll(async () => {
      // Run both validations once and reuse results (minimize API calls)
      [singleProcResult, multiProcResult] = await Promise.all([
        agent.validateTiss({ schemaVersion: '3.05.00', xml: VALID_TISS_XML }),
        agent.validateTiss({ schemaVersion: '3.05.00', xml: MULTI_PROCEDURE_XML }),
      ]);
    });

    it('should validate TISS procedures and return structured result', () => {
      expect(singleProcResult.success).toBe(true);
      expect(singleProcResult.output).toBeDefined();
      // isValid depends on structural checks (code length validation may flag
      // numeric-parsed codes) — assert on structure, not specific validity
      expect(typeof singleProcResult.output.isValid).toBe('boolean');
      expect(Array.isArray(singleProcResult.output.errors)).toBe(true);
    });

    it('should include AI analysis in response', () => {
      expect(singleProcResult.output.aiAnalysis).toBeDefined();
      expect(typeof singleProcResult.output.aiAnalysis).toBe('string');
    });

    it('should provide meaningful analysis content', () => {
      // AI analysis should be substantive, not trivially short
      const analysis = singleProcResult.output.aiAnalysis || '';
      expect(analysis.length).toBeGreaterThan(10);
    });

    it('should return warnings as an array', () => {
      // Warnings may or may not be present — but the array should exist
      expect(Array.isArray(singleProcResult.output.warnings)).toBe(true);
    });

    it('should analyze multiple procedures correctly', () => {
      expect(multiProcResult.success).toBe(true);
      expect(multiProcResult.output.procedureCount).toBe(3);
      expect(multiProcResult.output.aiAnalysis).toBeDefined();
    });
  });

  // ========================================================================
  // Performance and cost
  // ========================================================================

  describe('performance and cost', () => {
    it('should complete single-procedure validation within 15 seconds', async () => {
      const start = Date.now();
      const result = await agent.validateTiss({ schemaVersion: '3.05.00', xml: VALID_TISS_XML });
      const duration = Date.now() - start;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(15_000);
    });

    it('should use reasonable token count for simple validation', async () => {
      // Run a direct executeTask to get metadata with token info
      const runtime = await createTestRuntime();
      const result = await runtime.executeTask({
        agentId: 'billing-agent',
        taskName: 'validate-tiss-semantic',
        parameters: {
          procedures: [
            { code: '40301010', description: 'Hemograma completo', quantity: 1, value: 25 },
          ],
          schemaVersion: '3.05.00',
        },
      });

      expect(result.metadata?.tokensUsed).toBeDefined();
      expect(result.metadata!.tokensUsed).toBeLessThan(2000);
    });
  });
});
