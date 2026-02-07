import { getDb } from '../database/connection';
import { licitacoes } from '../database/schema';
import { GarimpoAIConfig } from '../types/config';
import { eq, and, gte, lte, inArray, like, sql, desc } from 'drizzle-orm';

export interface FilterParams {
  keywords?: string[];
  uf?: string[];
  modalidade?: number[];
  valorMin?: number;
  valorMax?: number;
  apenasAbertas?: boolean;
  limit?: number;
  offset?: number;
}

export interface FilterResult {
  id: number;
  numeroControlePNCP: string;
  objetoCompra: string;
  valorTotalEstimado: number | null;
  modalidadeNome: string;
  ufSigla: string | null;
  municipioNome: string | null;
  orgaoRazaoSocial: string | null;
  dataAberturaProposta: string | null;
  dataPublicacaoPncp: string | null;
  matchScore: number | null;
  analisado: boolean | null;
}

export class FilterEngine {
  private config: GarimpoAIConfig;

  constructor(config: GarimpoAIConfig) {
    this.config = config;
  }

  /** Search using FTS5 full-text search */
  searchFullText(keywords: string[], limit = 20): FilterResult[] {
    const db = getDb(this.config.dataDir);

    // Build FTS5 query: "software" OR "tecnologia"
    const ftsQuery = keywords
      .map((k) => `"${k.replace(/"/g, '""')}"`)
      .join(' OR ');

    const results = db.all<FilterResult>(sql`
      SELECT
        l.id,
        l.numero_controle_pncp as "numeroControlePNCP",
        l.objeto_compra as "objetoCompra",
        l.valor_total_estimado as "valorTotalEstimado",
        l.modalidade_nome as "modalidadeNome",
        l.uf_sigla as "ufSigla",
        l.municipio_nome as "municipioNome",
        l.orgao_razao_social as "orgaoRazaoSocial",
        l.data_abertura_proposta as "dataAberturaProposta",
        l.data_publicacao_pncp as "dataPublicacaoPncp",
        l.match_score as "matchScore",
        l.analisado
      FROM licitacoes_fts fts
      JOIN licitacoes l ON l.id = fts.rowid
      WHERE licitacoes_fts MATCH ${ftsQuery}
      ORDER BY rank
      LIMIT ${limit}
    `);

    return results;
  }

  /** Search with combined filters */
  search(params: FilterParams): FilterResult[] {
    const db = getDb(this.config.dataDir);
    const conditions: ReturnType<typeof eq>[] = [];

    // UF filter
    if (params.uf && params.uf.length > 0) {
      conditions.push(inArray(licitacoes.ufSigla, params.uf));
    }

    // Modalidade filter
    if (params.modalidade && params.modalidade.length > 0) {
      conditions.push(inArray(licitacoes.modalidadeId, params.modalidade));
    }

    // Value range
    if (params.valorMin !== undefined) {
      conditions.push(gte(licitacoes.valorTotalEstimado, params.valorMin));
    }
    if (params.valorMax !== undefined) {
      conditions.push(lte(licitacoes.valorTotalEstimado, params.valorMax));
    }

    // Only open proposals
    if (params.apenasAbertas) {
      conditions.push(gte(licitacoes.dataEncerramentoProposta, new Date().toISOString()));
    }

    // If keywords provided, use FTS + other filters
    if (params.keywords && params.keywords.length > 0) {
      const ftsResults = this.searchFullText(params.keywords, params.limit || 100);

      // Apply additional filters in-memory if needed
      let filtered = ftsResults;
      if (params.uf && params.uf.length > 0) {
        filtered = filtered.filter((r) => r.ufSigla && params.uf!.includes(r.ufSigla));
      }
      if (params.modalidade && params.modalidade.length > 0) {
        // Already handled by FTS join, but double-check
      }
      if (params.valorMin !== undefined) {
        filtered = filtered.filter(
          (r) => r.valorTotalEstimado !== null && r.valorTotalEstimado >= params.valorMin!
        );
      }
      if (params.valorMax !== undefined) {
        filtered = filtered.filter(
          (r) => r.valorTotalEstimado !== null && r.valorTotalEstimado <= params.valorMax!
        );
      }

      return filtered.slice(0, params.limit || 20);
    }

    // No keywords — use structured query
    const query = db
      .select({
        id: licitacoes.id,
        numeroControlePNCP: licitacoes.numeroControlePNCP,
        objetoCompra: licitacoes.objetoCompra,
        valorTotalEstimado: licitacoes.valorTotalEstimado,
        modalidadeNome: licitacoes.modalidadeNome,
        ufSigla: licitacoes.ufSigla,
        municipioNome: licitacoes.municipioNome,
        orgaoRazaoSocial: licitacoes.orgaoRazaoSocial,
        dataAberturaProposta: licitacoes.dataAberturaProposta,
        dataPublicacaoPncp: licitacoes.dataPublicacaoPncp,
        matchScore: licitacoes.matchScore,
        analisado: licitacoes.analisado,
      })
      .from(licitacoes)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(licitacoes.dataPublicacaoPncp))
      .limit(params.limit || 20)
      .offset(params.offset || 0);

    return query.all();
  }

  /** Run auto-filter pipeline: apply config keywords to new records */
  async autoFilter(): Promise<number> {
    if (this.config.pncp.keywords.length === 0) return 0;

    const results = this.searchFullText(this.config.pncp.keywords, 1000);
    const db = getDb(this.config.dataDir);

    let matched = 0;
    for (const result of results) {
      db.update(licitacoes)
        .set({ matched: true, matchScore: 1 })
        .where(eq(licitacoes.numeroControlePNCP, result.numeroControlePNCP))
        .run();
      matched++;
    }

    return matched;
  }

  /** Get statistics about the database */
  getStats(): {
    total: number;
    matched: number;
    analisados: number;
    porUf: Record<string, number>;
    porModalidade: Record<string, number>;
  } {
    const db = getDb(this.config.dataDir);

    const total = db
      .select({ count: sql<number>`count(*)` })
      .from(licitacoes)
      .get()?.count || 0;

    const matched = db
      .select({ count: sql<number>`count(*)` })
      .from(licitacoes)
      .where(eq(licitacoes.matched, true))
      .get()?.count || 0;

    const analisados = db
      .select({ count: sql<number>`count(*)` })
      .from(licitacoes)
      .where(eq(licitacoes.analisado, true))
      .get()?.count || 0;

    const ufRows = db.all<{ uf: string; count: number }>(sql`
      SELECT uf_sigla as uf, count(*) as count
      FROM licitacoes
      WHERE uf_sigla IS NOT NULL
      GROUP BY uf_sigla
      ORDER BY count DESC
      LIMIT 10
    `);

    const modRows = db.all<{ mod: string; count: number }>(sql`
      SELECT modalidade_nome as mod, count(*) as count
      FROM licitacoes
      GROUP BY modalidade_nome
      ORDER BY count DESC
    `);

    const porUf: Record<string, number> = {};
    for (const row of ufRows) {
      porUf[row.uf] = row.count;
    }

    const porModalidade: Record<string, number> = {};
    for (const row of modRows) {
      porModalidade[row.mod] = row.count;
    }

    return { total, matched, analisados, porUf, porModalidade };
  }
}
