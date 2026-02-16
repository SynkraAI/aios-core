/**
 * TISS Batch Generator
 * FinHealth Squad — Phase 12 (M3)
 *
 * Groups validated medical accounts by (operadora, competencia) and
 * generates TISS lote XML per ANS standard.
 *
 * Each batch = 1 XML file containing N guides for a single operator + period.
 */

import { XMLBuilder } from 'fast-xml-parser';
import Decimal from 'decimal.js';
import { format } from 'date-fns';
import { logger } from '../logger';
import type { MedicalAccount, Procedure } from '../database/supabase-client';
import type { TissBatch, BatchGroupKey, BatchConfig, DEFAULT_BATCH_CONFIG } from './types';

// Re-export default config for consumers
export { DEFAULT_BATCH_CONFIG } from './types';

const xmlBuilder = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  format: true,
});

/**
 * Group accounts by (healthInsurerId, competencia).
 * Competencia is derived from admission_date (YYYY-MM).
 */
export function groupAccountsByBatch(
  accounts: MedicalAccount[],
  procedures: Map<string, Procedure[]>,
): Map<string, { key: BatchGroupKey; accounts: MedicalAccount[]; procedures: Map<string, Procedure[]> }> {
  const groups = new Map<string, { key: BatchGroupKey; accounts: MedicalAccount[]; procedures: Map<string, Procedure[]> }>();

  for (const account of accounts) {
    if (!account.health_insurer_id) continue;

    const admDate = account.admission_date || account.created_at;
    const competencia = admDate.substring(0, 7); // YYYY-MM
    const groupKey = `${account.health_insurer_id}|${competencia}`;

    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        key: { healthInsurerId: account.health_insurer_id, competencia },
        accounts: [],
        procedures: new Map(),
      });
    }

    const group = groups.get(groupKey)!;
    group.accounts.push(account);

    const procs = procedures.get(account.id) || [];
    if (procs.length > 0) {
      group.procedures.set(account.id, procs);
    }
  }

  return groups;
}

/**
 * Generate a batch ID.
 */
export function generateBatchId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 6);
  return `batch-${ts}-${rand}`;
}

/**
 * Generate a TISS lote number (12 digits, zero-padded).
 */
export function generateLoteNumber(): string {
  const ts = Date.now().toString().slice(-10);
  const rand = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return ts + rand;
}

/**
 * Build a TISS lote XML containing multiple guides (guias SP/SADT).
 *
 * Follows ANS TISS v3.05.00 lote structure:
 *   mensagemTISS > cabecalho + prestadorParaOperadora > loteGuias > guiasTISS > guiaSP_SADT[]
 */
export function buildBatchXml(
  accounts: MedicalAccount[],
  procedures: Map<string, Procedure[]>,
  options: {
    loteNumber: string;
    ansCode: string;
    schemaVersion?: string;
  },
): string {
  const now = new Date();
  const version = options.schemaVersion || '3.05.00';

  const guides = accounts.map((account, idx) => {
    const procs = procedures.get(account.id) || [];
    const guideNumber = account.tiss_guide_number || `${options.loteNumber}${(idx + 1).toString().padStart(4, '0')}`;

    return {
      cabecalhoGuia: {
        registroANS: options.ansCode,
        numeroGuiaPrestador: guideNumber,
        guiaPrincipal: guideNumber,
      },
      dadosBeneficiario: {
        numeroCarteira: account.patient_id || '',
        atendimentoRN: 'N',
      },
      dadosSolicitante: {
        contratadoSolicitante: {
          codigoPrestadorNaOperadora: '0000000000',
        },
        profissionalSolicitante: {
          nomeProfissional: 'MEDICO SOLICITANTE',
          conselhoProfissional: '1',
          numeroConselhoProfissional: '00000',
          UF: 'SP',
          CBOS: '225125',
        },
      },
      dadosAtendimento: {
        tipoAtendimento: '05',
        indicacaoAcidente: '9',
        tipoConsulta: '1',
      },
      procedimentosExecutados: {
        procedimentoExecutado: procs.map((proc, pIdx) => ({
          sequencialItem: pIdx + 1,
          dataExecucao: proc.performed_at
            ? format(new Date(proc.performed_at), 'yyyy-MM-dd')
            : format(now, 'yyyy-MM-dd'),
          horaInicial: format(now, 'HH:mm:ss'),
          horaFinal: format(now, 'HH:mm:ss'),
          procedimento: {
            codigoTabela: '22',
            codigoProcedimento: proc.tuss_code || proc.sigtap_code || '00000000',
            descricaoProcedimento: proc.description.substring(0, 150),
          },
          quantidadeExecutada: proc.quantity,
          viaAcesso: '1',
          tecnicaUtilizada: '1',
          reducaoAcrescimo: '1.00',
          valorUnitario: proc.unit_price.toFixed(2),
          valorTotal: proc.total_price.toFixed(2),
        })),
      },
      valorTotal: {
        valorProcedimentos: procs
          .reduce((sum, p) => new Decimal(sum).plus(p.total_price), new Decimal(0))
          .toFixed(2),
        valorDiarias: '0.00',
        valorTaxasAlugueis: '0.00',
        valorMateriais: '0.00',
        valorMedicamentos: '0.00',
        valorOPME: '0.00',
        valorGasesMedicinais: '0.00',
        valorTotalGeral: procs
          .reduce((sum, p) => new Decimal(sum).plus(p.total_price), new Decimal(0))
          .toFixed(2),
      },
    };
  });

  const tissData = {
    'ans:mensagemTISS': {
      '@_xmlns:ans': 'http://www.ans.gov.br/padroes/tiss/schemas',
      cabecalho: {
        identificacaoTransacao: {
          tipoTransacao: 'ENVIO_LOTE_GUIAS',
          sequencialTransacao: '1',
          dataRegistroTransacao: format(now, 'yyyy-MM-dd'),
          horaRegistroTransacao: format(now, 'HH:mm:ss'),
        },
        versaoPadrao: version,
      },
      prestadorParaOperadora: {
        loteGuias: {
          numeroLote: options.loteNumber,
          guiasTISS: {
            guiaSP_SADT: guides.length === 1 ? guides[0] : guides,
          },
        },
      },
    },
  };

  return xmlBuilder.build(tissData);
}

/**
 * Compute total amount for a set of procedures.
 */
export function computeTotalAmount(procedures: Map<string, Procedure[]>): number {
  let total = new Decimal(0);
  for (const procs of procedures.values()) {
    for (const p of procs) {
      total = total.plus(p.total_price);
    }
  }
  return total.toNumber();
}

/**
 * Create a TissBatch object from grouped data.
 */
export function createBatchFromGroup(
  groupKey: BatchGroupKey,
  accounts: MedicalAccount[],
  procedures: Map<string, Procedure[]>,
  insurerInfo: { name: string; ansCode: string },
  organizationId: string,
): TissBatch {
  const batchId = generateBatchId();
  const loteNumber = generateLoteNumber();

  const xml = buildBatchXml(accounts, procedures, {
    loteNumber,
    ansCode: insurerInfo.ansCode,
  });

  const totalAmount = computeTotalAmount(procedures);

  logger.info('[TissBatch] Batch generated', {
    batchId,
    insurer: insurerInfo.name,
    competencia: groupKey.competencia,
    guideCount: accounts.length,
    totalAmount,
  });

  return {
    id: batchId,
    organizationId,
    healthInsurerId: groupKey.healthInsurerId,
    healthInsurerName: insurerInfo.name,
    healthInsurerAnsCode: insurerInfo.ansCode,
    competencia: groupKey.competencia,
    guideCount: accounts.length,
    totalAmount,
    status: 'pending',
    xml,
    createdAt: new Date(),
  };
}
