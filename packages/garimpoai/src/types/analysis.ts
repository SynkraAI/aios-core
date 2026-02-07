// Types for AI analysis results

/** Difficulty level for a procurement */
export type Dificuldade = 'facil' | 'medio' | 'dificil';

/** Structured AI analysis of a procurement */
export interface AnaliseEdital {
  resumo: string;
  oQueE: string;
  documentosNecessarios: DocumentoNecessario[];
  prazoProposta: string | null;
  valorEstimado: string;
  dificuldade: Dificuldade;
  justificativaDificuldade: string;
  requisitosHabilitacao: string[];
  dicaIniciante: string;
  proximoPasso: string;
}

/** Document required for participation */
export interface DocumentoNecessario {
  nome: string;
  descricao: string;
  obrigatorio: boolean;
}

/** Stored analysis in the database */
export interface AnaliseArmazenada {
  id: number;
  licitacaoId: string; // numeroControlePNCP
  analise: AnaliseEdital;
  modelo: string;
  tokensUsados: number;
  custoEstimado: number;
  criadoEm: string;
}
