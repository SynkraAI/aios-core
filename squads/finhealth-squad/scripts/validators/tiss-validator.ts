/**
 * TISS Validator
 * FinHealth Squad - Billing Module
 *
 * Validates TISS guides against ANS rules, reference tables,
 * and business rules.
 */

import { TissGuia, TissProcedimento } from '../parsers/tiss-xml-parser';

export interface ValidationError {
  campo: string;
  tipo: 'critico' | 'alerta' | 'info';
  codigo: string;
  mensagem: string;
  sugestaoCorrecao?: string;
  referenciaNormativa?: string;
}

export interface ValidationResult {
  valida: boolean;
  scoreConfianca: number;
  erros: ValidationError[];
  valorTotalCalculado: number;
  valorTotalInformado: number;
  divergenciaValor: number;
  tempoProcessamentoMs: number;
}

// Error codes
const ERROR_CODES = {
  E001: 'Campo obrigatório ausente',
  E002: 'Código TUSS inválido',
  E003: 'Código CID inválido',
  E004: 'Incompatibilidade CID-Procedimento',
  E005: 'Valor acima da tabela contratual',
  E006: 'Cobrança em duplicidade',
  E007: 'Limite de quantidade excedido',
  E008: 'Sem autorização prévia',
  E009: 'Carência não cumprida',
  E010: 'Formato de data incorreto',
};

/**
 * Validate a TISS guide completely
 */
export async function validateTissGuia(
  guia: TissGuia,
  tussTable: any[],
  operadoraRules?: any
): Promise<ValidationResult> {
  const startTime = Date.now();
  const erros: ValidationError[] = [];

  // 1. Structural validation
  erros.push(...validateStructure(guia));

  // 2. Code validation
  erros.push(...validateCodes(guia, tussTable));

  // 3. Business rules validation
  erros.push(...validateBusinessRules(guia, operadoraRules));

  // 4. Financial validation
  const { valorCalculado, errosFinanceiros } = validateFinancial(guia, tussTable);
  erros.push(...errosFinanceiros);

  // Calculate confidence score
  const scoreConfianca = calculateConfidenceScore(erros);

  return {
    valida: erros.filter(e => e.tipo === 'critico').length === 0,
    scoreConfianca,
    erros,
    valorTotalCalculado: valorCalculado,
    valorTotalInformado: guia.valorTotal,
    divergenciaValor: Math.abs(valorCalculado - guia.valorTotal),
    tempoProcessamentoMs: Date.now() - startTime,
  };
}

/**
 * Validate required fields based on guide type
 */
function validateStructure(guia: TissGuia): ValidationError[] {
  const erros: ValidationError[] = [];

  // Check required fields
  if (!guia.numeroGuia) {
    erros.push({
      campo: 'numeroGuia',
      tipo: 'critico',
      codigo: 'E001',
      mensagem: 'Número da guia é obrigatório',
      sugestaoCorrecao: 'Informar o número da guia',
    });
  }

  if (!guia.beneficiario?.numeroCarteira) {
    erros.push({
      campo: 'beneficiario.numeroCarteira',
      tipo: 'critico',
      codigo: 'E001',
      mensagem: 'Número da carteira do beneficiário é obrigatório',
    });
  }

  if (!guia.prestador?.codigoCnes) {
    erros.push({
      campo: 'prestador.codigoCnes',
      tipo: 'critico',
      codigo: 'E001',
      mensagem: 'CNES do prestador é obrigatório',
    });
  }

  if (!guia.procedimentos || guia.procedimentos.length === 0) {
    erros.push({
      campo: 'procedimentos',
      tipo: 'critico',
      codigo: 'E001',
      mensagem: 'Pelo menos um procedimento é obrigatório',
    });
  }

  return erros;
}

/**
 * Validate TUSS and CID codes against reference tables
 */
function validateCodes(guia: TissGuia, tussTable: any[]): ValidationError[] {
  const erros: ValidationError[] = [];

  for (const proc of guia.procedimentos) {
    // Validate TUSS code
    const tussEntry = tussTable.find(t => t.codigo === proc.codigoTuss);
    if (!tussEntry) {
      erros.push({
        campo: `procedimentos.${proc.codigoTuss}`,
        tipo: 'critico',
        codigo: 'E002',
        mensagem: `Código TUSS ${proc.codigoTuss} não encontrado na tabela`,
        sugestaoCorrecao: 'Verificar código na tabela TUSS vigente',
      });
    }

    // TODO: Validate CID codes
    // TODO: Validate CID x Procedure compatibility
  }

  return erros;
}

/**
 * Validate business rules
 */
function validateBusinessRules(guia: TissGuia, operadoraRules?: any): ValidationError[] {
  const erros: ValidationError[] = [];

  // Check for duplicates
  const procedimentosCounts = new Map<string, number>();
  for (const proc of guia.procedimentos) {
    const key = `${proc.codigoTuss}-${guia.dataAtendimento}`;
    procedimentosCounts.set(key, (procedimentosCounts.get(key) || 0) + 1);
  }

  for (const [key, count] of procedimentosCounts) {
    if (count > 1) {
      erros.push({
        campo: 'procedimentos',
        tipo: 'alerta',
        codigo: 'E006',
        mensagem: `Possível duplicidade: procedimento ${key.split('-')[0]} aparece ${count} vezes`,
        sugestaoCorrecao: 'Verificar se cobrança em duplicidade',
      });
    }
  }

  // TODO: Check prior authorization requirements
  // TODO: Check quantity limits
  // TODO: Check waiting period

  return erros;
}

/**
 * Validate financial values
 */
function validateFinancial(
  guia: TissGuia,
  tussTable: any[]
): { valorCalculado: number; errosFinanceiros: ValidationError[] } {
  const erros: ValidationError[] = [];
  let valorCalculado = 0;

  for (const proc of guia.procedimentos) {
    const tussEntry = tussTable.find(t => t.codigo === proc.codigoTuss);
    if (tussEntry) {
      const valorReferencia = tussEntry.valor_referencia || 0;
      const valorProcedimento = proc.valorUnitario * proc.quantidade;
      valorCalculado += valorReferencia * proc.quantidade;

      // Check if value is above reference
      if (proc.valorUnitario > valorReferencia * 1.05) {
        erros.push({
          campo: `procedimentos.${proc.codigoTuss}.valor`,
          tipo: 'alerta',
          codigo: 'E005',
          mensagem: `Valor R$ ${proc.valorUnitario} acima da referência R$ ${valorReferencia}`,
          sugestaoCorrecao: `Ajustar para valor contratual ou justificar`,
        });
      }
    }
  }

  return { valorCalculado, errosFinanceiros: erros };
}

/**
 * Calculate confidence score based on errors
 */
function calculateConfidenceScore(erros: ValidationError[]): number {
  const criticos = erros.filter(e => e.tipo === 'critico').length;
  const alertas = erros.filter(e => e.tipo === 'alerta').length;
  const infos = erros.filter(e => e.tipo === 'info').length;

  // Score decreases with errors
  let score = 100;
  score -= criticos * 25;
  score -= alertas * 10;
  score -= infos * 2;

  return Math.max(0, Math.min(100, score));
}
