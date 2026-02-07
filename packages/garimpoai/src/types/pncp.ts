// Types for PNCP API responses
// Based on live API data collected 2026-02-07

/** Bidding modality codes */
export enum Modalidade {
  DialogoCompetitivo = 2,
  Concurso = 3,
  ConcorrenciaEletronica = 4,
  ConcorrenciaPresencial = 5,
  PregaoEletronico = 6,
  PregaoPresencial = 7,
  DispensaDeLicitacao = 8,
  Inexigibilidade = 9,
  ManifestacaoDeInteresse = 10,
  PreQualificacao = 11,
  Credenciamento = 12,
}

export const MODALIDADE_NAMES: Record<Modalidade, string> = {
  [Modalidade.DialogoCompetitivo]: 'Diálogo Competitivo',
  [Modalidade.Concurso]: 'Concurso',
  [Modalidade.ConcorrenciaEletronica]: 'Concorrência Eletrônica',
  [Modalidade.ConcorrenciaPresencial]: 'Concorrência Presencial',
  [Modalidade.PregaoEletronico]: 'Pregão Eletrônico',
  [Modalidade.PregaoPresencial]: 'Pregão Presencial',
  [Modalidade.DispensaDeLicitacao]: 'Dispensa de Licitação',
  [Modalidade.Inexigibilidade]: 'Inexigibilidade',
  [Modalidade.ManifestacaoDeInteresse]: 'Manifestação de Interesse',
  [Modalidade.PreQualificacao]: 'Pré-Qualificação',
  [Modalidade.Credenciamento]: 'Credenciamento',
};

export const ALL_MODALIDADES = Object.values(Modalidade).filter(
  (v): v is Modalidade => typeof v === 'number'
);

/** Dispute mode codes */
export enum ModoDisputa {
  Aberto = 1,
  Fechado = 2,
  AbertoFechado = 3,
  DispensaComDisputa = 4,
  NaoSeAplica = 5,
}

/** Government sphere */
export enum Esfera {
  Federal = 'F',
  Estadual = 'E',
  Municipal = 'M',
  Distrital = 'D',
}

/** Government branch */
export enum Poder {
  Executivo = 'E',
  Legislativo = 'L',
  Judiciario = 'J',
  NaoSeAplica = 'N',
}

/** Purchase status */
export enum SituacaoCompra {
  DivulgadaNoPNCP = 1,
  EmAndamento = 2,
  Homologada = 3,
  RevogadaAnulada = 4,
}

/** Entity/organization in PNCP */
export interface OrgaoEntidade {
  cnpj: string;
  razaoSocial: string;
  poderId: string;
  esferaId: string;
}

/** Administrative unit */
export interface UnidadeOrgao {
  ufNome: string;
  ufSigla: string;
  codigoUnidade: string;
  municipioNome: string;
  nomeUnidade: string;
  codigoIbge: string;
}

/** Legal basis for the procurement */
export interface AmparoLegal {
  codigo: number;
  nome: string;
  descricao: string;
}

/** Single procurement record from PNCP API */
export interface ContratacaoPNCP {
  valorTotalEstimado: number | null;
  valorTotalHomologado: number | null;
  numeroControlePNCP: string;
  modalidadeId: number;
  modalidadeNome: string;
  modoDisputaId: number;
  modoDisputaNome: string;
  tipoInstrumentoConvocatorioCodigo: number;
  tipoInstrumentoConvocatorioNome: string;
  situacaoCompraId: number;
  situacaoCompraNome: string;
  anoCompra: number;
  sequencialCompra: number;
  numeroCompra: string;
  processo: string;
  objetoCompra: string;
  srp: boolean;
  dataPublicacaoPncp: string;
  dataAberturaProposta: string | null;
  dataEncerramentoProposta: string | null;
  dataInclusao: string;
  dataAtualizacao: string;
  dataAtualizacaoGlobal: string;
  linkSistemaOrigem: string | null;
  linkProcessoEletronico: string | null;
  informacaoComplementar: string | null;
  justificativaPresencial: string | null;
  usuarioNome: string;
  fontesOrcamentarias: unknown[];
  orgaoEntidade: OrgaoEntidade;
  unidadeOrgao: UnidadeOrgao;
  amparoLegal: AmparoLegal;
  orgaoSubRogado: OrgaoEntidade | null;
  unidadeSubRogada: UnidadeOrgao | null;
}

/** Paginated API response */
export interface PaginatedResponse<T> {
  data: T[];
  totalRegistros: number;
  totalPaginas: number;
  numeroPagina: number;
  paginasRestantes: number;
  empty: boolean;
}

/** Query params for /v1/contratacoes/publicacao and /atualizacao */
export interface ContratacaoQueryParams {
  dataInicial: string; // yyyyMMdd
  dataFinal: string; // yyyyMMdd
  codigoModalidadeContratacao: Modalidade;
  codigoModoDisputa?: ModoDisputa;
  uf?: string;
  codigoMunicipioIbge?: string;
  cnpj?: string;
  codigoUnidadeAdministrativa?: string;
  pagina: number;
  tamanhoPagina?: number; // 10-500, default 50
}

/** Query params for /v1/contratacoes/proposta */
export interface PropostaQueryParams {
  dataFinal: string;
  codigoModalidadeContratacao?: Modalidade;
  uf?: string;
  codigoMunicipioIbge?: string;
  cnpj?: string;
  pagina: number;
  tamanhoPagina?: number;
}

/** Contract record from PNCP */
export interface ContratoPNCP {
  numeroControlePNCP: string;
  numeroControlePncpCompra: string;
  numeroContratoEmpenho: string;
  anoContrato: number;
  sequencialContrato: number;
  processo: string;
  objetoContrato: string;
  valorInicial: number;
  valorGlobal: number;
  dataAssinatura: string;
  dataVigenciaInicio: string;
  dataVigenciaFim: string;
  dataPublicacaoPncp: string;
  niFornecedor: string;
  nomeRazaoSocialFornecedor: string;
  orgaoEntidade: OrgaoEntidade;
  unidadeOrgao: UnidadeOrgao;
}
