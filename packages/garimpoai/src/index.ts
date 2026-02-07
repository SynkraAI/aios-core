#!/usr/bin/env node
import { Command } from 'commander';
import { loadConfig, findConfigFile, generateDefaultConfig, saveConfig } from './config/loader';
import { initializeDb, getDb } from './database/connection';
import { Collector } from './collector/collector';
import { FilterEngine } from './filter/engine';
import { PncpClient } from './collector/pncp-client';
import { alertas } from './database/schema';
import { eq } from 'drizzle-orm';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

const VERSION = '0.1.0';

const program = new Command();

program
  .name('garimpoai')
  .description('GarimpoAI - Assistente pessoal de licitações públicas com IA conversacional')
  .version(VERSION);

// Default command (no args) = open chat
program
  .command('chat', { isDefault: true })
  .description('Abrir modo conversacional com IA')
  .action(async () => {
    const config = loadConfig();
    initializeDb(config.dataDir);

    if (!config.ia.apiKey) {
      console.log(chalk.yellow(
        '\n⚠️  Chave de API Anthropic não configurada.\n' +
        '   Configure em garimpoai.yaml ou exporte ANTHROPIC_API_KEY.\n' +
        '   Sem ela, a busca funciona mas a análise IA fica desabilitada.\n'
      ));
    }

    // Dynamic import to avoid loading chat deps when not needed
    const { startChat } = await import('./chat/repl');
    await startChat(config);
  });

program
  .command('collect')
  .description('Coletar licitações da API PNCP')
  .option('-d, --days <number>', 'Dias para coletar (default: 7)', '7')
  .option('--from <date>', 'Data inicial (YYYY-MM-DD)')
  .option('--to <date>', 'Data final (YYYY-MM-DD)')
  .action(async (opts) => {
    const config = loadConfig();
    initializeDb(config.dataDir);

    const collector = new Collector(config, (msg) => console.log(chalk.dim(msg)));

    const dataFinal = opts.to ? new Date(opts.to) : new Date();
    const dataInicial = opts.from
      ? new Date(opts.from)
      : new Date(Date.now() - parseInt(opts.days) * 24 * 60 * 60 * 1000);

    console.log(chalk.bold('\n📡 GarimpoAI - Coleta\n'));

    const result = await collector.collect({
      dataInicial,
      dataFinal,
      onProgress: (msg) => console.log(msg),
    });

    console.log(chalk.green(`\n✅ ${result.totalColetados} licitações coletadas`));
    console.log(chalk.dim(`   ${result.novos} novas | ${result.atualizados} atualizadas | ${result.erros} erros`));
    console.log(chalk.dim(`   Tempo: ${(result.duracaoMs / 1000).toFixed(1)}s\n`));
  });

program
  .command('search <keywords...>')
  .description('Buscar licitações por palavras-chave')
  .option('--uf <ufs...>', 'Filtrar por UF(s)')
  .option('--valor-min <number>', 'Valor mínimo')
  .option('--valor-max <number>', 'Valor máximo')
  .option('--abertas', 'Apenas com propostas abertas')
  .option('-n, --limit <number>', 'Número de resultados', '20')
  .option('--json', 'Output em JSON')
  .action((keywords: string[], opts) => {
    const config = loadConfig();
    initializeDb(config.dataDir);

    const engine = new FilterEngine(config);
    const results = engine.search({
      keywords,
      uf: opts.uf,
      valorMin: opts.valorMin ? parseFloat(opts.valorMin) : undefined,
      valorMax: opts.valorMax ? parseFloat(opts.valorMax) : undefined,
      apenasAbertas: opts.abertas,
      limit: parseInt(opts.limit),
    });

    if (opts.json) {
      console.log(JSON.stringify(results, null, 2));
      return;
    }

    if (results.length === 0) {
      console.log(chalk.yellow('\nNenhuma licitação encontrada para esses termos.\n'));
      return;
    }

    console.log(chalk.bold(`\n📋 ${results.length} licitações encontradas:\n`));

    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      const valor = r.valorTotalEstimado
        ? `R$ ${r.valorTotalEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        : 'Não informado';

      console.log(chalk.bold(`  ${i + 1}. ${r.modalidadeNome}`));
      console.log(`     ${r.objetoCompra.substring(0, 100)}${r.objetoCompra.length > 100 ? '...' : ''}`);
      console.log(chalk.dim(`     🏛️  ${r.orgaoRazaoSocial || 'N/A'} — ${r.municipioNome || ''}/${r.ufSigla || ''}`));
      console.log(chalk.dim(`     💰 ${valor} | 📅 ${r.dataAberturaProposta || 'Sem prazo'}`));
      console.log(chalk.dim(`     🔗 ${r.numeroControlePNCP}`));
      console.log();
    }
  });

program
  .command('stats')
  .description('Estatísticas da base de dados')
  .action(() => {
    const config = loadConfig();
    initializeDb(config.dataDir);

    const engine = new FilterEngine(config);
    const stats = engine.getStats();

    console.log(chalk.bold('\n📊 GarimpoAI - Estatísticas\n'));
    console.log(`  Total de licitações: ${chalk.bold(String(stats.total))}`);
    console.log(`  Matched (filtros):   ${chalk.bold(String(stats.matched))}`);
    console.log(`  Analisadas (IA):     ${chalk.bold(String(stats.analisados))}`);

    if (Object.keys(stats.porUf).length > 0) {
      console.log(chalk.bold('\n  Por UF (top 10):'));
      for (const [uf, count] of Object.entries(stats.porUf)) {
        console.log(`    ${uf}: ${count}`);
      }
    }

    if (Object.keys(stats.porModalidade).length > 0) {
      console.log(chalk.bold('\n  Por Modalidade:'));
      for (const [mod, count] of Object.entries(stats.porModalidade)) {
        console.log(`    ${mod}: ${count}`);
      }
    }
    console.log();
  });

program
  .command('analyze <id>')
  .description('Analisar uma licitação específica com IA')
  .option('--json', 'Output em JSON')
  .action(async (id: string, opts) => {
    const config = loadConfig();
    initializeDb(config.dataDir);

    if (!config.ia.apiKey) {
      console.log(chalk.red('\n❌ Chave de API Anthropic necessária para análise.\n'));
      process.exit(1);
    }

    const { Analyzer } = await import('./analyzer/analyzer');
    const analyzer = new Analyzer(config);

    console.log(chalk.dim('\n⏳ Analisando...\n'));

    try {
      const result = await analyzer.analyze(id);

      if (opts.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
      }

      const a = result.analise;
      console.log(chalk.bold.yellow('📋 Análise da Licitação\n'));
      console.log(chalk.bold('Resumo:'), a.resumo);
      console.log(chalk.bold('\nO que é:'), a.oQueE);
      console.log(chalk.bold('\nDificuldade:'), `${a.dificuldade} — ${a.justificativaDificuldade}`);
      console.log(chalk.bold('\nValor:'), a.valorEstimado);
      console.log(chalk.bold('\nPrazo:'), a.prazoProposta || 'Não informado');

      if (a.documentosNecessarios.length > 0) {
        console.log(chalk.bold('\nDocumentos necessários:'));
        for (const doc of a.documentosNecessarios) {
          console.log(`  ${doc.obrigatorio ? '✅' : '⚪'} ${doc.nome}: ${doc.descricao}`);
        }
      }

      if (a.requisitosHabilitacao.length > 0) {
        console.log(chalk.bold('\nRequisitos de habilitação:'));
        for (const req of a.requisitosHabilitacao) {
          console.log(`  • ${req}`);
        }
      }

      console.log(chalk.bold('\n💡 Dica para iniciante:'), a.dicaIniciante);
      console.log(chalk.bold('\n➡️  Próximo passo:'), a.proximoPasso);

      if (result.cached) {
        console.log(chalk.dim('\n(análise carregada do cache)'));
      } else {
        console.log(chalk.dim(`\n(${result.tokensUsados} tokens | US$ ${result.custoEstimado.toFixed(4)})`));
      }
      console.log();
    } catch (err) {
      console.log(chalk.red(`\n❌ ${err instanceof Error ? err.message : err}\n`));
      process.exit(1);
    }
  });

program
  .command('alerts')
  .description('Listar alertas configurados')
  .option('--json', 'Output em JSON')
  .action((opts) => {
    const config = loadConfig();
    initializeDb(config.dataDir);

    const db = getDb(config.dataDir);
    const allAlerts = db.select().from(alertas).all();

    if (opts.json) {
      console.log(JSON.stringify(allAlerts, null, 2));
      return;
    }

    if (allAlerts.length === 0) {
      console.log(chalk.yellow('\nNenhum alerta configurado.'));
      console.log(chalk.dim('  Use o chat para criar: "me avisa quando tiver licitação de software em SP"\n'));
      return;
    }

    console.log(chalk.bold(`\n🔔 ${allAlerts.length} alerta(s):\n`));
    for (const alert of allAlerts) {
      const status = alert.ativo ? chalk.green('ativo') : chalk.red('inativo');
      const keywords = JSON.parse(alert.keywords).join(', ');
      const ufs = alert.ufs ? JSON.parse(alert.ufs).join(', ') : 'todas';
      console.log(`  ${alert.id}. ${alert.nome} [${status}]`);
      console.log(chalk.dim(`     Keywords: ${keywords} | UFs: ${ufs} | Canal: ${alert.canal}`));
      console.log();
    }
  });

program
  .command('start')
  .description('Iniciar scheduler automático (daemon mode)')
  .action(async () => {
    const config = loadConfig();
    initializeDb(config.dataDir);

    const { Scheduler } = await import('./scheduler/scheduler');
    const scheduler = new Scheduler(config);

    console.log(chalk.bold.yellow('\n🤖 GarimpoAI — Scheduler\n'));

    // Handle graceful shutdown
    const shutdown = () => {
      console.log(chalk.dim('\nDesligando scheduler...'));
      scheduler.stop();
      process.exit(0);
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    scheduler.start();

    // Keep process alive
    console.log(chalk.dim(`Rodando a cada ${config.scheduler.intervalMinutes} minutos. Ctrl+C para parar.\n`));
  });

program
  .command('config')
  .description('Gerenciar configuração')
  .command('init')
  .description('Criar arquivo de configuração padrão')
  .action(() => {
    const defaultDir = path.join(process.env.HOME || '~', '.garimpoai');
    const configPath = path.join(defaultDir, 'garimpoai.yaml');

    if (fs.existsSync(configPath)) {
      console.log(chalk.yellow(`\n⚠️  Config já existe em: ${configPath}\n`));
      return;
    }

    if (!fs.existsSync(defaultDir)) {
      fs.mkdirSync(defaultDir, { recursive: true });
    }

    fs.writeFileSync(configPath, generateDefaultConfig(), 'utf-8');
    console.log(chalk.green(`\n✅ Config criada em: ${configPath}`));
    console.log(chalk.dim('   Edite o arquivo com suas preferências e chave de API.\n'));
  });

program.parse();
