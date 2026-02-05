/**
 * Appeal Generator
 * FinHealth Squad - Reconciliation Module
 *
 * Generates well-founded glosa appeals with normative
 * references and supporting documentation.
 */

export interface GlosaInfo {
  numeroGuia: string;
  numeroProtocolo?: string;
  codigoGlosa: string;
  descricaoGlosa: string;
  valorGlosado: number;
  dataGlosa: Date;
  itensGlosados: GlosaItem[];
}

export interface GlosaItem {
  codigoProcedimento: string;
  descricao: string;
  valor: number;
  motivo: string;
}

export interface GuiaOriginal {
  tipo: string;
  beneficiario: { nome: string; carteira: string };
  prestador: { nome: string; cnes: string };
  dataAtendimento: Date;
}

export interface Operadora {
  codigoAns: string;
  nome: string;
  prazoRecurso: number;
  canalRecurso: string;
}

export interface EvidenciaDisponivel {
  tipo: 'autorizacao' | 'laudo' | 'prontuario' | 'protocolo' | 'contrato';
  descricao: string;
  referencia: string;
}

export interface AppealDocument {
  numeroReferencia: string;
  dataGeracao: Date;
  prazoEnvio: Date;
  textoCompleto: string;
  resumoExecutivo: string;
  normasCitadas: NormaCitada[];
  argumentos: Argumento[];
  anexosNecessarios: Anexo[];
  probabilidadeReversao: number;
}

export interface NormaCitada {
  tipo: 'resolucao_ans' | 'lei' | 'contrato' | 'jurisprudencia';
  numero: string;
  artigo?: string;
  textoRelevante: string;
}

export interface Argumento {
  ponto: string;
  fundamentacao: string;
  evidencia?: string;
}

export interface Anexo {
  documento: string;
  disponivel: boolean;
  obrigatorio: boolean;
}

// Normative references database
const NORMAS_REFERENCIA: Record<string, NormaCitada[]> = {
  GA001: [
    {
      tipo: 'resolucao_ans',
      numero: 'RN 395/2016',
      artigo: 'Art. 3º',
      textoRelevante:
        'A operadora deve manter registro de todas as autorizações concedidas.',
    },
  ],
  GT001: [
    {
      tipo: 'resolucao_ans',
      numero: 'RN 465/2021',
      artigo: 'Anexo I',
      textoRelevante: 'Rol de Procedimentos e Eventos em Saúde.',
    },
  ],
  GF001: [
    {
      tipo: 'lei',
      numero: 'Lei 9.656/98',
      artigo: 'Art. 12',
      textoRelevante: 'São facultadas a oferta, a contratação e a vigência dos produtos...',
    },
  ],
};

/**
 * Generate a complete appeal document
 */
export async function generateAppeal(
  glosa: GlosaInfo,
  guiaOriginal: GuiaOriginal,
  operadora: Operadora,
  evidencias?: EvidenciaDisponivel[]
): Promise<AppealDocument> {
  const numeroReferencia = generateReferenceNumber();
  const dataGeracao = new Date();
  const prazoEnvio = calculateDeadline(glosa.dataGlosa, operadora.prazoRecurso);

  // Get normative references for this glosa type
  const normasCitadas = NORMAS_REFERENCIA[glosa.codigoGlosa] || [];

  // Build arguments
  const argumentos = buildArgumentos(glosa, evidencias);

  // Determine required attachments
  const anexosNecessarios = determineAnexos(glosa, evidencias);

  // Generate full text
  const textoCompleto = generateFullText(
    glosa,
    guiaOriginal,
    operadora,
    normasCitadas,
    argumentos,
    evidencias
  );

  // Calculate reversal probability
  const probabilidadeReversao = calculateReversalProbability(
    glosa,
    evidencias,
    normasCitadas
  );

  return {
    numeroReferencia,
    dataGeracao,
    prazoEnvio,
    textoCompleto,
    resumoExecutivo: generateExecutiveSummary(glosa, probabilidadeReversao),
    normasCitadas,
    argumentos,
    anexosNecessarios,
    probabilidadeReversao,
  };
}

/**
 * Generate reference number for the appeal
 */
function generateReferenceNumber(): string {
  const date = new Date();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `REC-${date.getFullYear()}-${random}`;
}

/**
 * Calculate appeal deadline
 */
function calculateDeadline(dataGlosa: Date, prazo: number): Date {
  const deadline = new Date(dataGlosa);
  deadline.setDate(deadline.getDate() + prazo);
  return deadline;
}

/**
 * Build arguments for the appeal
 */
function buildArgumentos(
  glosa: GlosaInfo,
  evidencias?: EvidenciaDisponivel[]
): Argumento[] {
  const argumentos: Argumento[] = [];

  // Add argument based on glosa type
  argumentos.push({
    ponto: 'Contestação da glosa aplicada',
    fundamentacao: `A glosa código ${glosa.codigoGlosa} foi aplicada indevidamente conforme demonstrado a seguir.`,
  });

  // Add evidence-based arguments
  if (evidencias) {
    for (const evidencia of evidencias) {
      if (evidencia.tipo === 'autorizacao') {
        argumentos.push({
          ponto: 'Autorização prévia existente',
          fundamentacao:
            'O procedimento possui autorização prévia devidamente concedida pela operadora.',
          evidencia: evidencia.referencia,
        });
      }
    }
  }

  return argumentos;
}

/**
 * Determine required attachments
 */
function determineAnexos(
  glosa: GlosaInfo,
  evidencias?: EvidenciaDisponivel[]
): Anexo[] {
  const anexos: Anexo[] = [
    {
      documento: 'Cópia da guia glosada',
      disponivel: true,
      obrigatorio: true,
    },
  ];

  // Add specific attachments based on glosa type
  if (glosa.codigoGlosa.startsWith('GA')) {
    anexos.push({
      documento: 'Comprovante de autorização',
      disponivel: evidencias?.some(e => e.tipo === 'autorizacao') || false,
      obrigatorio: true,
    });
  }

  if (glosa.codigoGlosa.startsWith('GC')) {
    anexos.push({
      documento: 'Relatório médico/laudo',
      disponivel: evidencias?.some(e => e.tipo === 'laudo') || false,
      obrigatorio: true,
    });
  }

  return anexos;
}

/**
 * Generate full appeal text
 */
function generateFullText(
  glosa: GlosaInfo,
  guia: GuiaOriginal,
  operadora: Operadora,
  normas: NormaCitada[],
  argumentos: Argumento[],
  evidencias?: EvidenciaDisponivel[]
): string {
  const dataFormatada = new Date().toLocaleDateString('pt-BR');

  let texto = `RECURSO DE GLOSA

À ${operadora.nome.toUpperCase()}
REF: Guia nº ${glosa.numeroGuia}

Prezados Senhores,

Vimos, respeitosamente, interpor RECURSO contra a glosa aplicada ao procedimento abaixo relacionado:

DADOS DO ATENDIMENTO:
- Beneficiário: ${guia.beneficiario.nome}
- Carteira: ${guia.beneficiario.carteira}
- Data do atendimento: ${guia.dataAtendimento.toLocaleDateString('pt-BR')}
- Valor glosado: R$ ${glosa.valorGlosado.toFixed(2)}
- Código da glosa: ${glosa.codigoGlosa} - ${glosa.descricaoGlosa}

FUNDAMENTAÇÃO:
`;

  for (const arg of argumentos) {
    texto += `\n${arg.ponto}\n${arg.fundamentacao}\n`;
    if (arg.evidencia) {
      texto += `Evidência: ${arg.evidencia}\n`;
    }
  }

  if (normas.length > 0) {
    texto += `\nFUNDAMENTAÇÃO NORMATIVA:\n`;
    for (const norma of normas) {
      texto += `- ${norma.numero}`;
      if (norma.artigo) texto += `, ${norma.artigo}`;
      texto += `: "${norma.textoRelevante}"\n`;
    }
  }

  texto += `
Diante do exposto, requeremos a REVERSÃO INTEGRAL da glosa aplicada.

Atenciosamente,

${guia.prestador.nome}
CNES: ${guia.prestador.cnes}
${dataFormatada}
`;

  return texto;
}

/**
 * Generate executive summary
 */
function generateExecutiveSummary(glosa: GlosaInfo, probabilidade: number): string {
  return `Recurso contra glosa ${glosa.codigoGlosa} no valor de R$ ${glosa.valorGlosado.toFixed(2)}. Probabilidade de reversão estimada: ${(probabilidade * 100).toFixed(0)}%.`;
}

/**
 * Calculate reversal probability
 */
function calculateReversalProbability(
  glosa: GlosaInfo,
  evidencias?: EvidenciaDisponivel[],
  normas?: NormaCitada[]
): number {
  let probability = 0.3; // Base probability

  // Increase with evidence
  if (evidencias && evidencias.length > 0) {
    probability += 0.2 * Math.min(evidencias.length, 3);
  }

  // Increase with normative support
  if (normas && normas.length > 0) {
    probability += 0.1 * Math.min(normas.length, 2);
  }

  // Adjust by glosa type
  if (glosa.codigoGlosa.startsWith('GA')) {
    probability += 0.15; // Administrative glosas are easier to reverse
  }

  return Math.min(probability, 0.95);
}
