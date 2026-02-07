import { GarimpoAIConfig } from '../types/config';
import { FilterEngine } from '../filter/engine';
import { Collector } from '../collector/collector';
import { Analyzer } from '../analyzer/analyzer';
import { getTodayUsage } from '../analyzer/cost-tracker';
import { getDb, initializeDb } from '../database/connection';
import { licitacoes, alertas } from '../database/schema';
import { eq, sql } from 'drizzle-orm';
import { SearchResultReference } from '../types/chat';

/** Execute tool calls from the AI */
export class ToolExecutor {
  private config: GarimpoAIConfig;
  private filterEngine: FilterEngine;
  private analyzer: Analyzer | null;
  private lastSearchResults: SearchResultReference[] = [];

  constructor(config: GarimpoAIConfig) {
    this.config = config;
    this.filterEngine = new FilterEngine(config);
    this.analyzer = config.ia.apiKey ? new Analyzer(config) : null;
  }

  getLastSearchResults(): SearchResultReference[] {
    return this.lastSearchResults;
  }

  async execute(
    toolName: string,
    input: Record<string, unknown>
  ): Promise<string> {
    switch (toolName) {
      case 'search_licitacoes':
        return this.searchLicitacoes(input);
      case 'analyze_licitacao':
        return this.analyzeLicitacao(input);
      case 'create_alert':
        return this.createAlert(input);
      case 'get_stats':
        return this.getStats();
      case 'get_licitacao_detail':
        return this.getLicitacaoDetail(input);
      case 'run_collect':
        return this.runCollect(input);
      default:
        return JSON.stringify({ error: `Tool desconhecida: ${toolName}` });
    }
  }

  private searchLicitacoes(input: Record<string, unknown>): string {
    const results = this.filterEngine.search({
      keywords: input.keywords as string[] | undefined,
      uf: input.uf as string[] | undefined,
      modalidade: input.modalidade as number[] | undefined,
      valorMin: input.valorMin as number | undefined,
      valorMax: input.valorMax as number | undefined,
      apenasAbertas: input.apenasAbertas as boolean | undefined,
      limit: (input.limit as number) || 10,
    });

    // Save references for "analisa a terceira" type queries
    this.lastSearchResults = results.map((r, i) => ({
      index: i + 1,
      numeroControlePNCP: r.numeroControlePNCP,
      objetoCompra: r.objetoCompra,
    }));

    return JSON.stringify({
      total: results.length,
      resultados: results.map((r, i) => ({
        posicao: i + 1,
        id: r.numeroControlePNCP,
        objeto: r.objetoCompra,
        valor: r.valorTotalEstimado,
        modalidade: r.modalidadeNome,
        uf: r.ufSigla,
        municipio: r.municipioNome,
        orgao: r.orgaoRazaoSocial,
        dataAbertura: r.dataAberturaProposta,
        dataPublicacao: r.dataPublicacaoPncp,
        jaAnalisada: r.analisado,
      })),
    });
  }

  private async analyzeLicitacao(input: Record<string, unknown>): Promise<string> {
    const id = input.licitacaoId as string;

    // If analyzer is available, do deep analysis
    if (this.analyzer) {
      try {
        const result = await this.analyzer.analyze(id);
        return Analyzer.formatForTool(result);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        // Fall back to raw data if analysis fails
        return this.getLicitacaoRawData(id, msg);
      }
    }

    // No API key — return raw data for conversational analysis
    return this.getLicitacaoRawData(id);
  }

  private getLicitacaoRawData(id: string, warning?: string): string {
    const db = getDb(this.config.dataDir);
    const licitacao = db
      .select()
      .from(licitacoes)
      .where(eq(licitacoes.numeroControlePNCP, id))
      .get();

    if (!licitacao) {
      return JSON.stringify({ error: `Licitacao ${id} nao encontrada no banco` });
    }

    const data: Record<string, unknown> = {
      id: licitacao.numeroControlePNCP,
      objeto: licitacao.objetoCompra,
      valor: licitacao.valorTotalEstimado,
      modalidade: licitacao.modalidadeNome,
      modoDisputa: licitacao.modoDisputaNome,
      orgao: licitacao.orgaoRazaoSocial,
      unidade: licitacao.nomeUnidade,
      uf: licitacao.ufSigla,
      municipio: licitacao.municipioNome,
      amparoLegal: licitacao.amparoLegalNome,
      amparoLegalDescricao: licitacao.amparoLegalDescricao,
      dataPublicacao: licitacao.dataPublicacaoPncp,
      dataAbertura: licitacao.dataAberturaProposta,
      dataEncerramento: licitacao.dataEncerramentoProposta,
      linkOrigem: licitacao.linkSistemaOrigem,
      informacaoComplementar: licitacao.informacaoComplementar,
      processo: licitacao.processo,
      srp: licitacao.srp,
    };

    if (warning) {
      data._aviso = `Analise profunda falhou (${warning}). Dados brutos fornecidos.`;
    }

    return JSON.stringify(data);
  }

  private createAlert(input: Record<string, unknown>): string {
    const db = getDb(this.config.dataDir);

    const keywords = input.keywords as string[];
    const nome = `Alerta: ${keywords.join(', ')}`;

    db.insert(alertas)
      .values({
        nome,
        keywords: JSON.stringify(keywords),
        ufs: input.ufs ? JSON.stringify(input.ufs) : null,
        valorMinimo: input.valorMin as number | undefined,
        valorMaximo: input.valorMax as number | undefined,
        canal: (input.canal as string) || 'telegram',
      })
      .run();

    return JSON.stringify({
      sucesso: true,
      alerta: {
        nome,
        keywords,
        ufs: input.ufs || 'todas',
        valorMin: input.valorMin || 'sem minimo',
        valorMax: input.valorMax || 'sem maximo',
        canal: input.canal || 'telegram',
      },
    });
  }

  private getStats(): string {
    const stats = this.filterEngine.getStats();
    const iaUsage = getTodayUsage(this.config.dataDir);
    return JSON.stringify({
      ...stats,
      iaHoje: {
        analises: iaUsage.totalAnalises,
        chats: iaUsage.totalChats,
        tokensInput: iaUsage.tokensInput,
        tokensOutput: iaUsage.tokensOutput,
        custoEstimado: `US$ ${iaUsage.custoTotal.toFixed(4)}`,
        limiteAnalises: this.config.ia.maxPerDay,
      },
    });
  }

  private async getLicitacaoDetail(input: Record<string, unknown>): Promise<string> {
    return this.getLicitacaoRawData(input.licitacaoId as string);
  }

  private async runCollect(input: Record<string, unknown>): Promise<string> {
    const dias = (input.dias as number) || 7;
    const collector = new Collector(this.config);

    const result = await collector.collect({
      dataInicial: new Date(Date.now() - dias * 24 * 60 * 60 * 1000),
      dataFinal: new Date(),
    });

    // Auto-filter after collection
    const matched = await this.filterEngine.autoFilter();

    return JSON.stringify({
      coletados: result.totalColetados,
      novos: result.novos,
      atualizados: result.atualizados,
      erros: result.erros,
      tempoSegundos: (result.duracaoMs / 1000).toFixed(1),
      matched,
    });
  }
}
