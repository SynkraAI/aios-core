// Automated pipeline: collect → filter → analyze top matches → notify

import { GarimpoAIConfig } from '../types/config';
import { Collector } from '../collector/collector';
import { FilterEngine } from '../filter/engine';
import { Analyzer } from '../analyzer/analyzer';
import { Notifier } from '../notifier/notifier';
import { isLimitReached } from '../analyzer/cost-tracker';

export interface PipelineResult {
  coletados: number;
  novos: number;
  matched: number;
  analisados: number;
  notificacoes: { sent: number; errors: number };
  duracaoMs: number;
}

/** Run the full pipeline once */
export async function runPipeline(
  config: GarimpoAIConfig,
  logger?: (message: string) => void
): Promise<PipelineResult> {
  const log = logger || (() => {});
  const startTime = Date.now();

  log('[Pipeline] Iniciando ciclo...');

  // Step 1: Collect
  log('[Pipeline] 1/4 Coletando licitacoes...');
  const collector = new Collector(config, log);
  const collectResult = await collector.collect({
    dataInicial: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24h
    dataFinal: new Date(),
  });

  // Step 2: Filter
  log('[Pipeline] 2/4 Aplicando filtros...');
  const filterEngine = new FilterEngine(config);
  const matched = await filterEngine.autoFilter();

  // Step 3: Auto-analyze top matches (if enabled and API key available)
  let analisados = 0;
  if (config.ia.autoAnalyze && config.ia.apiKey) {
    log('[Pipeline] 3/4 Analisando top matches...');
    const topMatches = filterEngine.search({
      keywords: config.pncp.keywords,
      limit: 5, // Analyze top 5 per cycle
    });

    const analyzer = new Analyzer(config);
    for (const match of topMatches) {
      if (isLimitReached(config.dataDir, config.ia.maxPerDay)) {
        log('[Pipeline] Limite diario de analises atingido');
        break;
      }
      try {
        const result = await analyzer.analyze(match.numeroControlePNCP);
        if (!result.cached) analisados++;
      } catch (err) {
        log(`[Pipeline] Erro analisando ${match.numeroControlePNCP}: ${err}`);
      }
    }
  } else {
    log('[Pipeline] 3/4 Analise automatica desabilitada');
  }

  // Step 4: Notify
  log('[Pipeline] 4/4 Processando alertas...');
  const notifier = new Notifier(config, log);
  const notificacoes = await notifier.processAlerts();

  const duracaoMs = Date.now() - startTime;

  log(
    `[Pipeline] Ciclo concluido em ${(duracaoMs / 1000).toFixed(1)}s: ` +
      `${collectResult.totalColetados} coletados, ${matched} matched, ` +
      `${analisados} analisados, ${notificacoes.sent} notificacoes`
  );

  return {
    coletados: collectResult.totalColetados,
    novos: collectResult.novos,
    matched,
    analisados,
    notificacoes,
    duracaoMs,
  };
}
