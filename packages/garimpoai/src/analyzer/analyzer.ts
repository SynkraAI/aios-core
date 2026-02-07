// Deep AI analysis of procurement records using Claude API

import Anthropic from '@anthropic-ai/sdk';
import { getDb } from '../database/connection';
import { licitacoes, analises } from '../database/schema';
import { GarimpoAIConfig } from '../types/config';
import { AnaliseEdital } from '../types/analysis';
import { eq } from 'drizzle-orm';
import { ANALYSIS_SYSTEM_PROMPT, buildAnalysisPrompt, estimateCost } from './prompts';
import { recordUsage, isLimitReached } from './cost-tracker';

export class Analyzer {
  private config: GarimpoAIConfig;
  private client: Anthropic;

  constructor(config: GarimpoAIConfig) {
    this.config = config;
    this.client = new Anthropic({ apiKey: config.ia.apiKey });
  }

  /** Analyze a single licitacao by its ID (numeroControlePNCP) */
  async analyze(licitacaoId: string): Promise<{
    analise: AnaliseEdital;
    cached: boolean;
    tokensUsados: number;
    custoEstimado: number;
  }> {
    const db = getDb(this.config.dataDir);

    // Check cache first
    const existing = db
      .select()
      .from(analises)
      .where(eq(analises.licitacaoId, licitacaoId))
      .get();

    if (existing) {
      return {
        analise: {
          resumo: existing.resumo,
          oQueE: existing.oQueE || '',
          documentosNecessarios: existing.documentosNecessarios
            ? JSON.parse(existing.documentosNecessarios)
            : [],
          prazoProposta: existing.prazoProposta,
          valorEstimado: existing.valorEstimado || '',
          dificuldade: (existing.dificuldade as 'facil' | 'medio' | 'dificil') || 'medio',
          justificativaDificuldade: existing.justificativaDificuldade || '',
          requisitosHabilitacao: existing.requisitosHabilitacao
            ? JSON.parse(existing.requisitosHabilitacao)
            : [],
          dicaIniciante: existing.dicaIniciante || '',
          proximoPasso: existing.proximoPasso || '',
        },
        cached: true,
        tokensUsados: existing.tokensUsados || 0,
        custoEstimado: existing.custoEstimado || 0,
      };
    }

    // Check daily limit
    if (isLimitReached(this.config.dataDir, this.config.ia.maxPerDay)) {
      throw new Error(
        `Limite diario de analises atingido (${this.config.ia.maxPerDay}). ` +
          'Aumente o limite em garimpoai.yaml (ia.maxPerDay) ou tente amanha.'
      );
    }

    // Fetch licitacao data
    const licitacao = db
      .select()
      .from(licitacoes)
      .where(eq(licitacoes.numeroControlePNCP, licitacaoId))
      .get();

    if (!licitacao) {
      throw new Error(`Licitacao ${licitacaoId} nao encontrada no banco`);
    }

    // Build data for analysis (exclude internal fields)
    const licitacaoData = {
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

    // Call Claude for deep analysis
    const model = this.config.ia.analysisModel;
    const response = await this.client.messages.create({
      model,
      max_tokens: 2048,
      system: ANALYSIS_SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: buildAnalysisPrompt(licitacaoData) },
      ],
    });

    // Extract text content
    const textBlock = response.content.find(
      (b): b is Anthropic.Messages.TextBlock => b.type === 'text'
    );

    if (!textBlock) {
      throw new Error('Resposta vazia da IA');
    }

    // Parse JSON response
    let analise: AnaliseEdital;
    try {
      // Handle potential markdown wrapping
      let jsonStr = textBlock.text.trim();
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      analise = JSON.parse(jsonStr);
    } catch {
      throw new Error(`Erro ao parsear resposta da IA: ${textBlock.text.substring(0, 200)}`);
    }

    // Calculate costs
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const totalTokens = inputTokens + outputTokens;
    const custo = estimateCost(model, inputTokens, outputTokens);

    // Save analysis to DB
    db.insert(analises)
      .values({
        licitacaoId,
        resumo: analise.resumo,
        oQueE: analise.oQueE,
        documentosNecessarios: JSON.stringify(analise.documentosNecessarios),
        prazoProposta: analise.prazoProposta,
        valorEstimado: analise.valorEstimado,
        dificuldade: analise.dificuldade,
        justificativaDificuldade: analise.justificativaDificuldade,
        requisitosHabilitacao: JSON.stringify(analise.requisitosHabilitacao),
        dicaIniciante: analise.dicaIniciante,
        proximoPasso: analise.proximoPasso,
        modelo: model,
        tokensUsados: totalTokens,
        custoEstimado: custo,
        rawResponse: textBlock.text,
      })
      .run();

    // Mark licitacao as analyzed
    db.update(licitacoes)
      .set({ analisado: true })
      .where(eq(licitacoes.numeroControlePNCP, licitacaoId))
      .run();

    // Track usage
    recordUsage(this.config.dataDir, 'analysis', model, inputTokens, outputTokens, custo);

    return {
      analise,
      cached: false,
      tokensUsados: totalTokens,
      custoEstimado: custo,
    };
  }

  /** Format analysis result as a string for tool output */
  static formatForTool(result: {
    analise: AnaliseEdital;
    cached: boolean;
    tokensUsados: number;
    custoEstimado: number;
  }): string {
    const a = result.analise;
    return JSON.stringify({
      resumo: a.resumo,
      oQueE: a.oQueE,
      documentosNecessarios: a.documentosNecessarios,
      prazoProposta: a.prazoProposta,
      valorEstimado: a.valorEstimado,
      dificuldade: a.dificuldade,
      justificativaDificuldade: a.justificativaDificuldade,
      requisitosHabilitacao: a.requisitosHabilitacao,
      dicaIniciante: a.dicaIniciante,
      proximoPasso: a.proximoPasso,
      _meta: {
        cached: result.cached,
        tokensUsados: result.tokensUsados,
        custoEstimado: `US$ ${result.custoEstimado.toFixed(4)}`,
      },
    });
  }
}
