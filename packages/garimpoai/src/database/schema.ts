import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Main table: procurement records from PNCP
export const licitacoes = sqliteTable(
  'licitacoes',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    numeroControlePNCP: text('numero_controle_pncp').notNull().unique(),
    objetoCompra: text('objeto_compra').notNull(),
    valorTotalEstimado: real('valor_total_estimado'),
    valorTotalHomologado: real('valor_total_homologado'),
    modalidadeId: integer('modalidade_id').notNull(),
    modalidadeNome: text('modalidade_nome').notNull(),
    modoDisputaId: integer('modo_disputa_id'),
    modoDisputaNome: text('modo_disputa_nome'),
    situacaoCompraId: integer('situacao_compra_id'),
    situacaoCompraNome: text('situacao_compra_nome'),
    anoCompra: integer('ano_compra').notNull(),
    sequencialCompra: integer('sequencial_compra').notNull(),
    numeroCompra: text('numero_compra'),
    processo: text('processo'),
    srp: integer('srp', { mode: 'boolean' }).default(false),

    // Dates
    dataPublicacaoPncp: text('data_publicacao_pncp'),
    dataAberturaProposta: text('data_abertura_proposta'),
    dataEncerramentoProposta: text('data_encerramento_proposta'),
    dataInclusao: text('data_inclusao'),
    dataAtualizacao: text('data_atualizacao'),
    dataAtualizacaoGlobal: text('data_atualizacao_global'),

    // Organization
    orgaoCnpj: text('orgao_cnpj').notNull(),
    orgaoRazaoSocial: text('orgao_razao_social'),
    orgaoPoderId: text('orgao_poder_id'),
    orgaoEsferaId: text('orgao_esfera_id'),

    // Location
    ufSigla: text('uf_sigla'),
    ufNome: text('uf_nome'),
    municipioNome: text('municipio_nome'),
    codigoIbge: text('codigo_ibge'),
    nomeUnidade: text('nome_unidade'),

    // Legal basis
    amparoLegalNome: text('amparo_legal_nome'),
    amparoLegalDescricao: text('amparo_legal_descricao'),

    // Links
    linkSistemaOrigem: text('link_sistema_origem'),
    linkProcessoEletronico: text('link_processo_eletronico'),
    informacaoComplementar: text('informacao_complementar'),

    // Internal tracking
    matched: integer('matched', { mode: 'boolean' }).default(false),
    matchScore: real('match_score').default(0),
    analisado: integer('analisado', { mode: 'boolean' }).default(false),
    notificado: integer('notificado', { mode: 'boolean' }).default(false),

    // Raw JSON for future use
    rawJson: text('raw_json'),

    criadoEm: text('criado_em').default(sql`(datetime('now'))`),
    atualizadoEm: text('atualizado_em').default(sql`(datetime('now'))`),
  },
  (table) => [
    index('idx_uf_sigla').on(table.ufSigla),
    index('idx_modalidade').on(table.modalidadeId),
    index('idx_data_publicacao').on(table.dataPublicacaoPncp),
    index('idx_data_abertura').on(table.dataAberturaProposta),
    index('idx_matched').on(table.matched),
    index('idx_valor').on(table.valorTotalEstimado),
    index('idx_orgao_cnpj').on(table.orgaoCnpj),
    index('idx_situacao').on(table.situacaoCompraId),
  ]
);

// AI analysis results
export const analises = sqliteTable('analises', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  licitacaoId: text('licitacao_id')
    .notNull()
    .references(() => licitacoes.numeroControlePNCP),
  resumo: text('resumo').notNull(),
  oQueE: text('o_que_e'),
  documentosNecessarios: text('documentos_necessarios'), // JSON string
  prazoProposta: text('prazo_proposta'),
  valorEstimado: text('valor_estimado'),
  dificuldade: text('dificuldade'), // facil | medio | dificil
  justificativaDificuldade: text('justificativa_dificuldade'),
  requisitosHabilitacao: text('requisitos_habilitacao'), // JSON string
  dicaIniciante: text('dica_iniciante'),
  proximoPasso: text('proximo_passo'),
  modelo: text('modelo').notNull(),
  tokensUsados: integer('tokens_usados').default(0),
  custoEstimado: real('custo_estimado').default(0),
  rawResponse: text('raw_response'), // Full AI response for debugging
  criadoEm: text('criado_em').default(sql`(datetime('now'))`),
});

// User-defined alerts
export const alertas = sqliteTable('alertas', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nome: text('nome').notNull(),
  keywords: text('keywords').notNull(), // JSON array
  ufs: text('ufs'), // JSON array
  modalidades: text('modalidades'), // JSON array
  valorMinimo: real('valor_minimo'),
  valorMaximo: real('valor_maximo'),
  canal: text('canal').notNull().default('telegram'), // telegram | email | ambos
  ativo: integer('ativo', { mode: 'boolean' }).default(true),
  criadoEm: text('criado_em').default(sql`(datetime('now'))`),
});

// Track sent notifications to avoid duplicates
export const notificacoesEnviadas = sqliteTable(
  'notificacoes_enviadas',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    alertaId: integer('alerta_id').references(() => alertas.id),
    licitacaoId: text('licitacao_id')
      .notNull()
      .references(() => licitacoes.numeroControlePNCP),
    canal: text('canal').notNull(),
    enviadoEm: text('enviado_em').default(sql`(datetime('now'))`),
  },
  (table) => [
    index('idx_notif_alerta_licitacao').on(
      table.alertaId,
      table.licitacaoId
    ),
  ]
);

// Collection run metadata
export const coletas = sqliteTable('coletas', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  modalidadeId: integer('modalidade_id').notNull(),
  dataInicial: text('data_inicial').notNull(),
  dataFinal: text('data_final').notNull(),
  totalRegistros: integer('total_registros').default(0),
  novosRegistros: integer('novos_registros').default(0),
  atualizados: integer('atualizados').default(0),
  erros: integer('erros').default(0),
  duracaoMs: integer('duracao_ms').default(0),
  sucesso: integer('sucesso', { mode: 'boolean' }).default(true),
  mensagemErro: text('mensagem_erro'),
  iniciadoEm: text('iniciado_em').default(sql`(datetime('now'))`),
  finalizadoEm: text('finalizado_em'),
});

// IA usage tracking for cost control
export const iaUsage = sqliteTable('ia_usage', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tipo: text('tipo').notNull(), // chat | analysis
  modelo: text('modelo').notNull(),
  tokensInput: integer('tokens_input').default(0),
  tokensOutput: integer('tokens_output').default(0),
  custoEstimado: real('custo_estimado').default(0),
  data: text('data').notNull(), // YYYY-MM-DD for daily tracking
  criadoEm: text('criado_em').default(sql`(datetime('now'))`),
});
