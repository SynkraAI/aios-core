// Cron-based scheduler for automated collection cycles

import cron from 'node-cron';
import { GarimpoAIConfig } from '../types/config';
import { initializeDb } from '../database/connection';
import { runPipeline, PipelineResult } from './pipeline';

export class Scheduler {
  private config: GarimpoAIConfig;
  private task: cron.ScheduledTask | null = null;
  private running = false;
  private log: (message: string) => void;
  private lastResult: PipelineResult | null = null;

  constructor(config: GarimpoAIConfig, logger?: (message: string) => void) {
    this.config = config;
    this.log = logger || console.log;
  }

  /** Build cron expression from interval minutes */
  private buildCronExpression(): string {
    const minutes = this.config.scheduler.intervalMinutes;

    if (minutes <= 0 || minutes > 1440) {
      throw new Error(`Intervalo invalido: ${minutes} minutos (deve ser entre 1 e 1440)`);
    }

    // For common intervals, use simpler cron patterns
    if (minutes === 60) return '0 * * * *'; // Every hour
    if (minutes === 30) return '*/30 * * * *'; // Every 30 min
    if (minutes === 15) return '*/15 * * * *'; // Every 15 min

    return `*/${minutes} * * * *`;
  }

  /** Start the scheduler */
  start(): void {
    if (this.task) {
      this.log('[Scheduler] Ja esta rodando');
      return;
    }

    initializeDb(this.config.dataDir);

    const cronExpr = this.buildCronExpression();
    this.log(`[Scheduler] Iniciando com intervalo de ${this.config.scheduler.intervalMinutes} min (${cronExpr})`);

    this.task = cron.schedule(cronExpr, async () => {
      if (this.running) {
        this.log('[Scheduler] Ciclo anterior ainda rodando, pulando...');
        return;
      }

      this.running = true;
      try {
        this.lastResult = await runPipeline(this.config, this.log);
      } catch (err) {
        this.log(`[Scheduler] Erro no ciclo: ${err}`);
      } finally {
        this.running = false;
      }
    });

    // Run immediately on start
    this.log('[Scheduler] Executando primeiro ciclo...');
    this.running = true;
    runPipeline(this.config, this.log)
      .then((result) => {
        this.lastResult = result;
      })
      .catch((err) => {
        this.log(`[Scheduler] Erro no primeiro ciclo: ${err}`);
      })
      .finally(() => {
        this.running = false;
      });
  }

  /** Stop the scheduler */
  stop(): void {
    if (this.task) {
      this.task.stop();
      this.task = null;
      this.log('[Scheduler] Parado');
    }
  }

  /** Check if the scheduler is running */
  isRunning(): boolean {
    return this.task !== null;
  }

  /** Get last pipeline result */
  getLastResult(): PipelineResult | null {
    return this.lastResult;
  }
}
