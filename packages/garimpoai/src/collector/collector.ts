import { PncpClient } from './pncp-client';
import { getDb, initializeDb } from '../database/connection';
import { licitacoes, coletas } from '../database/schema';
import { ContratacaoPNCP, Modalidade, ALL_MODALIDADES, MODALIDADE_NAMES } from '../types/pncp';
import { GarimpoAIConfig } from '../types/config';
import { eq, sql } from 'drizzle-orm';

interface CollectResult {
  totalColetados: number;
  novos: number;
  atualizados: number;
  erros: number;
  duracaoMs: number;
  porModalidade: Record<number, number>;
}

interface CollectOptions {
  dataInicial?: Date;
  dataFinal?: Date;
  incremental?: boolean;
  onProgress?: (message: string) => void;
}

export class Collector {
  private client: PncpClient;
  private config: GarimpoAIConfig;
  private log: (message: string) => void;

  constructor(config: GarimpoAIConfig, logger?: (message: string) => void) {
    this.config = config;
    this.log = logger || (() => {});
    this.client = new PncpClient({ logger: this.log });
  }

  /** Map API response to database insert format */
  private mapToDbRecord(item: ContratacaoPNCP) {
    return {
      numeroControlePNCP: item.numeroControlePNCP,
      objetoCompra: item.objetoCompra,
      valorTotalEstimado: item.valorTotalEstimado,
      valorTotalHomologado: item.valorTotalHomologado,
      modalidadeId: item.modalidadeId,
      modalidadeNome: item.modalidadeNome,
      modoDisputaId: item.modoDisputaId,
      modoDisputaNome: item.modoDisputaNome,
      situacaoCompraId: item.situacaoCompraId,
      situacaoCompraNome: item.situacaoCompraNome,
      anoCompra: item.anoCompra,
      sequencialCompra: item.sequencialCompra,
      numeroCompra: item.numeroCompra,
      processo: item.processo,
      srp: item.srp,
      dataPublicacaoPncp: item.dataPublicacaoPncp,
      dataAberturaProposta: item.dataAberturaProposta,
      dataEncerramentoProposta: item.dataEncerramentoProposta,
      dataInclusao: item.dataInclusao,
      dataAtualizacao: item.dataAtualizacao,
      dataAtualizacaoGlobal: item.dataAtualizacaoGlobal,
      orgaoCnpj: item.orgaoEntidade.cnpj,
      orgaoRazaoSocial: item.orgaoEntidade.razaoSocial,
      orgaoPoderId: item.orgaoEntidade.poderId,
      orgaoEsferaId: item.orgaoEntidade.esferaId,
      ufSigla: item.unidadeOrgao.ufSigla,
      ufNome: item.unidadeOrgao.ufNome,
      municipioNome: item.unidadeOrgao.municipioNome,
      codigoIbge: item.unidadeOrgao.codigoIbge,
      nomeUnidade: item.unidadeOrgao.nomeUnidade,
      amparoLegalNome: item.amparoLegal?.nome,
      amparoLegalDescricao: item.amparoLegal?.descricao,
      linkSistemaOrigem: item.linkSistemaOrigem,
      linkProcessoEletronico: item.linkProcessoEletronico,
      informacaoComplementar: item.informacaoComplementar,
      rawJson: JSON.stringify(item),
    };
  }

  /** Upsert a batch of records, returns count of new vs updated */
  private async upsertBatch(
    items: ContratacaoPNCP[]
  ): Promise<{ novos: number; atualizados: number }> {
    const db = getDb(this.config.dataDir);
    let novos = 0;
    let atualizados = 0;

    for (const item of items) {
      const record = this.mapToDbRecord(item);

      // Check if exists
      const existing = db
        .select({ id: licitacoes.id })
        .from(licitacoes)
        .where(eq(licitacoes.numeroControlePNCP, record.numeroControlePNCP))
        .get();

      if (existing) {
        // Update
        db.update(licitacoes)
          .set({ ...record, atualizadoEm: sql`datetime('now')` })
          .where(eq(licitacoes.numeroControlePNCP, record.numeroControlePNCP))
          .run();
        atualizados++;
      } else {
        // Insert
        db.insert(licitacoes).values(record).run();
        novos++;
      }
    }

    return { novos, atualizados };
  }

  /** Run collection for configured modalidades and date range */
  async collect(options: CollectOptions = {}): Promise<CollectResult> {
    const startTime = Date.now();
    const dataFinal = options.dataFinal || new Date();
    const dataInicial = options.dataInicial || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Default: last 7 days

    const dataInicialStr = PncpClient.formatDate(dataInicial);
    const dataFinalStr = PncpClient.formatDate(dataFinal);

    const modalidades = this.config.pncp.modalidades.length > 0
      ? this.config.pncp.modalidades
      : ALL_MODALIDADES;

    const result: CollectResult = {
      totalColetados: 0,
      novos: 0,
      atualizados: 0,
      erros: 0,
      duracaoMs: 0,
      porModalidade: {},
    };

    // Initialize DB
    initializeDb(this.config.dataDir);

    options.onProgress?.(`Coletando licitacoes de ${dataInicialStr} a ${dataFinalStr}...`);

    for (const modalidade of modalidades) {
      const modalidadeNome = MODALIDADE_NAMES[modalidade] || `Modalidade ${modalidade}`;
      options.onProgress?.(`  ${modalidadeNome}...`);

      let modalidadeCount = 0;
      const db = getDb(this.config.dataDir);

      try {
        // Determine which UFs to query
        const ufs = this.config.pncp.ufs.length > 0
          ? this.config.pncp.ufs
          : [undefined]; // undefined = all UFs

        for (const uf of ufs) {
          for await (const page of this.client.getAllContratacoes(
            modalidade,
            dataInicialStr,
            dataFinalStr,
            uf
          )) {
            const { novos, atualizados } = await this.upsertBatch(page);
            result.novos += novos;
            result.atualizados += atualizados;
            result.totalColetados += page.length;
            modalidadeCount += page.length;
          }
        }

        result.porModalidade[modalidade] = modalidadeCount;
        options.onProgress?.(`  ${modalidadeNome}: ${modalidadeCount} registros`);

        // Log collection run
        db.insert(coletas).values({
          modalidadeId: modalidade,
          dataInicial: dataInicialStr,
          dataFinal: dataFinalStr,
          totalRegistros: modalidadeCount,
          novosRegistros: result.novos,
          sucesso: true,
        }).run();
      } catch (error) {
        result.erros++;
        const errorMsg = error instanceof Error ? error.message : String(error);
        this.log(`Erro na ${modalidadeNome}: ${errorMsg}`);
        options.onProgress?.(`  ${modalidadeNome}: ERRO - ${errorMsg}`);

        db.insert(coletas).values({
          modalidadeId: modalidade,
          dataInicial: dataInicialStr,
          dataFinal: dataFinalStr,
          sucesso: false,
          mensagemErro: errorMsg,
        }).run();
      }
    }

    result.duracaoMs = Date.now() - startTime;

    options.onProgress?.(
      `\nColeta finalizada: ${result.totalColetados} registros ` +
      `(${result.novos} novos, ${result.atualizados} atualizados) ` +
      `em ${(result.duracaoMs / 1000).toFixed(1)}s`
    );

    return result;
  }
}
