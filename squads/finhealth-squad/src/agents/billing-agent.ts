/**
 * Billing Agent Implementation
 * FinHealth Squad
 *
 * Handles TISS/SUS guide generation and validation
 */

import { AgentRuntime, TaskResult } from '../runtime/agent-runtime';
import {
  MedicalAccountRepository,
  ProcedureRepository,
  MedicalAccount,
  Procedure,
} from '../database/supabase-client';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { z } from 'zod';
import Decimal from 'decimal.js';
import { format } from 'date-fns';

// Input schemas
const ValidateTissInputSchema = z.object({
  accountId: z.string().optional(),
  xml: z.string().optional(),
  schemaVersion: z.string().default('3.05.00'),
});

const GenerateTissGuideInputSchema = z.object({
  accountId: z.string(),
  guideType: z.enum(['consulta', 'sadt', 'internacao', 'honorarios']).default('sadt'),
  insurerCode: z.string().optional(),
});

// TISS validation rules
const TISS_VALIDATION_RULES = {
  requiredFields: [
    'cabecalho',
    'prestadorParaOperadora',
    'guiaSP_SADT',
  ],
  maxDescriptionLength: 150,
  validComplexities: ['AB', 'MC', 'AC'],
  maxProceduresPerGuide: 99,
};

// TUSS procedure codes (sample)
const COMMON_TUSS_CODES: Record<string, { description: string; type: string }> = {
  '10101012': { description: 'Consulta em consultorio', type: 'consulta' },
  '40301010': { description: 'Hemograma completo', type: 'exame' },
  '40302040': { description: 'Glicose', type: 'exame' },
  '40302105': { description: 'Ureia', type: 'exame' },
  '40302113': { description: 'Creatinina', type: 'exame' },
  '41001010': { description: 'Radiografia de torax', type: 'imagem' },
};

/**
 * Billing Agent Class
 */
export class BillingAgent {
  private runtime: AgentRuntime;
  private accountRepo: MedicalAccountRepository;
  private procedureRepo: ProcedureRepository;
  private xmlParser: XMLParser;
  private xmlBuilder: XMLBuilder;

  constructor(runtime: AgentRuntime) {
    this.runtime = runtime;
    this.accountRepo = new MedicalAccountRepository();
    this.procedureRepo = new ProcedureRepository();

    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });

    this.xmlBuilder = new XMLBuilder({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      format: true,
    });
  }

  /**
   * Validate TISS XML
   */
  async validateTiss(input: z.infer<typeof ValidateTissInputSchema>): Promise<TaskResult> {
    const validatedInput = ValidateTissInputSchema.parse(input);
    const errors: string[] = [];
    const warnings: string[] = [];

    let xml = validatedInput.xml;
    let account: MedicalAccount | null = null;

    // Load XML from account if not provided
    if (!xml && validatedInput.accountId) {
      account = await this.accountRepo.findById(validatedInput.accountId);
      if (!account) {
        return {
          success: false,
          output: null,
          errors: [`Account not found: ${validatedInput.accountId}`],
        };
      }
      xml = account.tiss_xml || '';
    }

    if (!xml) {
      return {
        success: false,
        output: null,
        errors: ['No XML provided for validation'],
      };
    }

    // Parse XML
    let parsedXml: any;
    try {
      parsedXml = this.xmlParser.parse(xml);
    } catch (e: any) {
      return {
        success: false,
        output: { isValid: false, errors: [`Invalid XML: ${e.message}`] },
        errors: [`XML parsing error: ${e.message}`],
      };
    }

    // Validate structure
    const tissData = parsedXml['ans:mensagemTISS'] || parsedXml.mensagemTISS || parsedXml;

    // Check required fields
    for (const field of TISS_VALIDATION_RULES.requiredFields) {
      if (!this.findInObject(tissData, field)) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Validate procedures
    const procedures = this.extractProcedures(tissData);

    if (procedures.length === 0) {
      warnings.push('No procedures found in TISS guide');
    }

    if (procedures.length > TISS_VALIDATION_RULES.maxProceduresPerGuide) {
      errors.push(`Too many procedures: ${procedures.length} (max: ${TISS_VALIDATION_RULES.maxProceduresPerGuide})`);
    }

    // Validate each procedure
    for (const proc of procedures) {
      if (!proc.code || proc.code.length !== 8) {
        errors.push(`Invalid procedure code: ${proc.code}`);
      }
      if (!proc.description) {
        warnings.push(`Missing description for procedure: ${proc.code}`);
      }
      if (proc.quantity <= 0) {
        errors.push(`Invalid quantity for procedure ${proc.code}: ${proc.quantity}`);
      }
    }

    // Use AI for semantic validation
    const aiResult = await this.runtime.executeTask({
      taskName: 'validate-tiss-semantic',
      agentId: 'billing-agent',
      parameters: {
        procedures,
        schemaVersion: validatedInput.schemaVersion,
      },
    });

    if (aiResult.output?.warnings) {
      warnings.push(...aiResult.output.warnings);
    }

    const isValid = errors.length === 0;

    // Update account if provided
    if (account) {
      await this.accountRepo.updateTissValidation(
        account.id,
        isValid ? 'valid' : 'invalid',
        { errors, warnings }
      );
    }

    return {
      success: true,
      output: {
        isValid,
        errors,
        warnings,
        procedureCount: procedures.length,
        aiAnalysis: aiResult.output?.analysis,
      },
    };
  }

  /**
   * Generate TISS Guide
   */
  async generateTissGuide(input: z.infer<typeof GenerateTissGuideInputSchema>): Promise<TaskResult> {
    const validatedInput = GenerateTissGuideInputSchema.parse(input);

    // Load account
    const account = await this.accountRepo.findById(validatedInput.accountId);
    if (!account) {
      return {
        success: false,
        output: null,
        errors: [`Account not found: ${validatedInput.accountId}`],
      };
    }

    // Load procedures
    const procedures = await this.procedureRepo.findByAccountId(account.id);
    if (procedures.length === 0) {
      return {
        success: false,
        output: null,
        errors: ['No procedures found for account'],
      };
    }

    // Generate guide number
    const guideNumber = this.generateGuideNumber();

    // Build TISS XML
    const xml = this.buildTissXml(account, procedures, {
      guideNumber,
      guideType: validatedInput.guideType,
    });

    // Update account
    const updatedAccount = await this.accountRepo.update(account.id, {
      tiss_guide_number: guideNumber,
      tiss_guide_type: validatedInput.guideType,
      tiss_xml: xml,
      tiss_validation_status: 'pending',
    });

    return {
      success: true,
      output: {
        guideNumber,
        guideType: validatedInput.guideType,
        xml,
        procedureCount: procedures.length,
        totalAmount: procedures.reduce((sum, p) => sum + p.total_price, 0),
        account: updatedAccount,
      },
    };
  }

  /**
   * Build TISS XML structure
   */
  private buildTissXml(
    account: MedicalAccount,
    procedures: Procedure[],
    options: { guideNumber: string; guideType: string }
  ): string {
    const now = new Date();

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
          versaoPadrao: '3.05.00',
        },
        prestadorParaOperadora: {
          loteGuias: {
            numeroLote: options.guideNumber.substring(0, 12),
            guiasTISS: {
              guiaSP_SADT: {
                cabecalhoGuia: {
                  registroANS: account.health_insurer_id || '000000',
                  numeroGuiaPrestador: options.guideNumber,
                  guiaPrincipal: options.guideNumber,
                },
                dadosAutorizacao: {
                  numeroGuiaOperadora: '',
                  dataAutorizacao: format(now, 'yyyy-MM-dd'),
                  senha: '',
                  dataValidadeSenha: format(now, 'yyyy-MM-dd'),
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
                  procedimentoExecutado: procedures.map((proc, index) => ({
                    sequencialItem: index + 1,
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
                  valorProcedimentos: procedures
                    .reduce((sum, p) => new Decimal(sum).plus(p.total_price), new Decimal(0))
                    .toFixed(2),
                  valorDiarias: '0.00',
                  valorTaxasAlugueis: '0.00',
                  valorMateriais: '0.00',
                  valorMedicamentos: '0.00',
                  valorOPME: '0.00',
                  valorGasesMedicinais: '0.00',
                  valorTotalGeral: procedures
                    .reduce((sum, p) => new Decimal(sum).plus(p.total_price), new Decimal(0))
                    .toFixed(2),
                },
              },
            },
          },
        },
      },
    };

    return this.xmlBuilder.build(tissData);
  }

  /**
   * Generate unique guide number
   */
  private generateGuideNumber(): string {
    const timestamp = Date.now().toString().slice(-10);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${timestamp}${random}`;
  }

  /**
   * Extract procedures from TISS XML data
   */
  private extractProcedures(tissData: any): Array<{
    code: string;
    description: string;
    quantity: number;
    value: number;
  }> {
    const procedures: Array<{ code: string; description: string; quantity: number; value: number }> = [];

    const findProcedures = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;

      if (obj.procedimentoExecutado) {
        const procs = Array.isArray(obj.procedimentoExecutado)
          ? obj.procedimentoExecutado
          : [obj.procedimentoExecutado];

        for (const proc of procs) {
          procedures.push({
            code: proc.procedimento?.codigoProcedimento || '',
            description: proc.procedimento?.descricaoProcedimento || '',
            quantity: parseInt(proc.quantidadeExecutada) || 1,
            value: parseFloat(proc.valorTotal) || 0,
          });
        }
      }

      for (const key of Object.keys(obj)) {
        findProcedures(obj[key]);
      }
    };

    findProcedures(tissData);
    return procedures;
  }

  /**
   * Find field in nested object
   */
  private findInObject(obj: any, field: string): any {
    if (!obj || typeof obj !== 'object') return undefined;
    if (obj[field] !== undefined) return obj[field];

    for (const key of Object.keys(obj)) {
      const result = this.findInObject(obj[key], field);
      if (result !== undefined) return result;
    }

    return undefined;
  }
}

export default BillingAgent;
