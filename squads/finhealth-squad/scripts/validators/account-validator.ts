/**
 * Account Validator
 * FinHealth Squad - Audit Module
 *
 * Validates hospital accounts for clinical-administrative
 * consistency and calculates glosa risk score.
 */

export interface HospitalAccount {
  id: string;
  paciente: {
    nome: string;
    idade: number;
    sexo: 'M' | 'F';
  };
  internacao?: {
    dataEntrada: Date;
    dataSaida: Date;
    tipoLeito: 'enfermaria' | 'apartamento' | 'uti' | 'semi-uti';
    cidPrincipal: string;
    cidsSecundarios: string[];
  };
  procedimentos: AccountProcedure[];
  materiais: AccountItem[];
  medicamentos: AccountItem[];
  diarias: DailyCharge[];
  valorTotal: number;
}

export interface AccountProcedure {
  codigoTuss: string;
  descricao: string;
  quantidade: number;
  valor: number;
  dataExecucao: Date;
  profissionalExecutante: string;
}

export interface AccountItem {
  codigo: string;
  descricao: string;
  quantidade: number;
  valor: number;
}

export interface DailyCharge {
  tipo: string;
  quantidade: number;
  valorUnitario: number;
}

export interface Inconsistency {
  tipo: 'clinica' | 'administrativa' | 'financeira';
  codigo: string;
  descricao: string;
  impactoFinanceiro: number;
  evidencia: string;
  recomendacao: string;
  severidade: 'baixa' | 'media' | 'alta' | 'critica';
}

export interface AuditResult {
  scoreRiscoGlosa: number;
  classificacao: 'baixo' | 'medio' | 'alto' | 'critico';
  inconsistencias: Inconsistency[];
  valorEmRisco: number;
  recomendacaoGeral: 'enviar' | 'revisar' | 'corrigir_antes' | 'bloquear';
  justificativa: string;
}

/**
 * Audit a hospital account for inconsistencies
 */
export async function auditAccount(
  conta: HospitalAccount,
  operadoraHistorico?: any
): Promise<AuditResult> {
  const inconsistencias: Inconsistency[] = [];

  // 1. Clinical analysis
  inconsistencias.push(...analyzeClinica(conta));

  // 2. Administrative analysis
  inconsistencias.push(...analyzeAdministrativa(conta));

  // 3. Financial analysis
  inconsistencias.push(...analyzeFinanceira(conta));

  // 4. Calculate risk score
  const scoreRiscoGlosa = calculateRiskScore(conta, inconsistencias, operadoraHistorico);

  // 5. Calculate value at risk
  const valorEmRisco = inconsistencias.reduce((sum, i) => sum + i.impactoFinanceiro, 0);

  // 6. Determine classification and recommendation
  const classificacao = getClassificacao(scoreRiscoGlosa);
  const recomendacaoGeral = getRecomendacao(scoreRiscoGlosa, inconsistencias);

  return {
    scoreRiscoGlosa,
    classificacao,
    inconsistencias,
    valorEmRisco,
    recomendacaoGeral,
    justificativa: generateJustificativa(inconsistencias, scoreRiscoGlosa),
  };
}

/**
 * Analyze clinical consistency
 */
function analyzeClinica(conta: HospitalAccount): Inconsistency[] {
  const inconsistencias: Inconsistency[] = [];

  if (conta.internacao) {
    // Check length of stay vs diagnosis
    const diasInternacao = Math.ceil(
      (conta.internacao.dataSaida.getTime() - conta.internacao.dataEntrada.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // TODO: Compare with expected stay for CID
    // This would require a CID -> expected stay mapping

    // Check bed type vs severity
    // TODO: Implement severity assessment based on CID

    // Check procedure-diagnosis compatibility
    // TODO: Implement CID x TUSS compatibility check
  }

  return inconsistencias;
}

/**
 * Analyze administrative consistency
 */
function analyzeAdministrativa(conta: HospitalAccount): Inconsistency[] {
  const inconsistencias: Inconsistency[] = [];

  // Check for duplicate charges
  const procedimentosMap = new Map<string, number>();
  for (const proc of conta.procedimentos) {
    const key = `${proc.codigoTuss}-${proc.dataExecucao.toISOString().split('T')[0]}`;
    const count = (procedimentosMap.get(key) || 0) + 1;
    procedimentosMap.set(key, count);

    if (count > 1) {
      inconsistencias.push({
        tipo: 'administrativa',
        codigo: 'IA001',
        descricao: `Possível cobrança duplicada: ${proc.codigoTuss}`,
        impactoFinanceiro: proc.valor,
        evidencia: `Procedimento aparece ${count} vezes na mesma data`,
        recomendacao: 'Verificar se duplicidade é justificada',
        severidade: 'alta',
      });
    }
  }

  return inconsistencias;
}

/**
 * Analyze financial consistency
 */
function analyzeFinanceira(conta: HospitalAccount): Inconsistency[] {
  const inconsistencias: Inconsistency[] = [];

  // TODO: Compare values with reference tables
  // TODO: Check for unjustified materials/medications
  // TODO: Verify daily rates

  return inconsistencias;
}

/**
 * Calculate risk score based on multiple factors
 */
function calculateRiskScore(
  conta: HospitalAccount,
  inconsistencias: Inconsistency[],
  operadoraHistorico?: any
): number {
  let score = 0;

  // Factor: Account value (higher value = more scrutiny)
  const valorNormalizado = Math.min(conta.valorTotal / 100000, 1);
  score += valorNormalizado * 20;

  // Factor: Complexity (number of procedures)
  const complexidadeNormalizada = Math.min(conta.procedimentos.length / 50, 1);
  score += complexidadeNormalizada * 15;

  // Factor: Inconsistencies
  const inconsistenciasScore =
    inconsistencias.filter(i => i.severidade === 'critica').length * 20 +
    inconsistencias.filter(i => i.severidade === 'alta').length * 10 +
    inconsistencias.filter(i => i.severidade === 'media').length * 5 +
    inconsistencias.filter(i => i.severidade === 'baixa').length * 2;
  score += Math.min(inconsistenciasScore, 35);

  // Factor: Operator history
  if (operadoraHistorico?.taxaGlosa) {
    score += operadoraHistorico.taxaGlosa * 20;
  }

  return Math.min(Math.round(score), 100);
}

/**
 * Get classification based on score
 */
function getClassificacao(score: number): 'baixo' | 'medio' | 'alto' | 'critico' {
  if (score <= 25) return 'baixo';
  if (score <= 50) return 'medio';
  if (score <= 75) return 'alto';
  return 'critico';
}

/**
 * Get recommendation based on analysis
 */
function getRecomendacao(
  score: number,
  inconsistencias: Inconsistency[]
): 'enviar' | 'revisar' | 'corrigir_antes' | 'bloquear' {
  const criticas = inconsistencias.filter(i => i.severidade === 'critica').length;

  if (criticas > 0 || score > 75) return 'bloquear';
  if (score > 50) return 'corrigir_antes';
  if (score > 25) return 'revisar';
  return 'enviar';
}

/**
 * Generate justification text
 */
function generateJustificativa(inconsistencias: Inconsistency[], score: number): string {
  if (inconsistencias.length === 0) {
    return 'Conta sem inconsistências detectadas. Recomenda-se envio.';
  }

  const criticas = inconsistencias.filter(i => i.severidade === 'critica');
  const altas = inconsistencias.filter(i => i.severidade === 'alta');

  let texto = `Detectadas ${inconsistencias.length} inconsistências. `;
  if (criticas.length > 0) {
    texto += `${criticas.length} críticas requerem correção imediata. `;
  }
  if (altas.length > 0) {
    texto += `${altas.length} de alta severidade devem ser revisadas. `;
  }
  texto += `Score de risco: ${score}/100.`;

  return texto;
}
