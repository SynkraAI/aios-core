// Notification orchestrator — matches alerts against new licitacoes and sends notifications

import { getDb } from '../database/connection';
import { alertas, notificacoesEnviadas, licitacoes } from '../database/schema';
import { GarimpoAIConfig } from '../types/config';
import { FilterEngine, FilterResult } from '../filter/engine';
import { TelegramNotifier } from './telegram';
import { EmailNotifier } from './email';
import { formatTelegramBatch, formatEmailHtml } from './templates';
import { eq, and, sql } from 'drizzle-orm';

export class Notifier {
  private config: GarimpoAIConfig;
  private telegram: TelegramNotifier | null = null;
  private email: EmailNotifier | null = null;
  private log: (message: string) => void;

  constructor(config: GarimpoAIConfig, logger?: (message: string) => void) {
    this.config = config;
    this.log = logger || (() => {});

    if (config.alertas.telegram.enabled && config.alertas.telegram.botToken) {
      this.telegram = new TelegramNotifier(config.alertas.telegram);
    }

    if (config.alertas.email.enabled && config.alertas.email.smtpHost) {
      this.email = new EmailNotifier(config.alertas.email);
    }
  }

  /** Process all active alerts and send notifications for new matches */
  async processAlerts(): Promise<{ sent: number; errors: number }> {
    const db = getDb(this.config.dataDir);
    let sent = 0;
    let errors = 0;

    // Get all active alerts
    const activeAlerts = db
      .select()
      .from(alertas)
      .where(eq(alertas.ativo, true))
      .all();

    if (activeAlerts.length === 0) {
      this.log('Nenhum alerta ativo');
      return { sent: 0, errors: 0 };
    }

    const filterEngine = new FilterEngine(this.config);

    for (const alert of activeAlerts) {
      try {
        const keywords: string[] = JSON.parse(alert.keywords);
        const ufs: string[] | undefined = alert.ufs ? JSON.parse(alert.ufs) : undefined;

        // Search for matching licitacoes
        const matches = filterEngine.search({
          keywords,
          uf: ufs,
          valorMin: alert.valorMinimo ?? undefined,
          valorMax: alert.valorMaximo ?? undefined,
          limit: 50,
        });

        // Filter out already-notified ones
        const newMatches = matches.filter((match) => {
          const alreadySent = db
            .select({ id: notificacoesEnviadas.id })
            .from(notificacoesEnviadas)
            .where(
              and(
                eq(notificacoesEnviadas.alertaId, alert.id),
                eq(notificacoesEnviadas.licitacaoId, match.numeroControlePNCP)
              )
            )
            .get();
          return !alreadySent;
        });

        if (newMatches.length === 0) {
          this.log(`Alerta "${alert.nome}": nenhuma nova licitacao`);
          continue;
        }

        this.log(`Alerta "${alert.nome}": ${newMatches.length} nova(s) licitacao(oes)`);

        // Send notifications based on channel
        const canal = alert.canal || 'telegram';

        if ((canal === 'telegram' || canal === 'ambos') && this.telegram) {
          try {
            const message = formatTelegramBatch(newMatches, alert.nome);
            await this.telegram.send(message);
            sent++;
          } catch (err) {
            this.log(`Erro Telegram para "${alert.nome}": ${err}`);
            // Try plain text fallback
            try {
              const plain = `GarimpoAI: ${newMatches.length} nova(s) licitacao(oes) para "${alert.nome}"`;
              await this.telegram!.sendPlain(plain);
              sent++;
            } catch {
              errors++;
            }
          }
        }

        if ((canal === 'email' || canal === 'ambos') && this.email) {
          try {
            const subject = `${newMatches.length} nova(s) licitacao(oes) — ${alert.nome}`;
            const html = formatEmailHtml(newMatches, alert.nome);
            await this.email.send(subject, html);
            sent++;
          } catch (err) {
            this.log(`Erro Email para "${alert.nome}": ${err}`);
            errors++;
          }
        }

        // Record sent notifications
        for (const match of newMatches) {
          db.insert(notificacoesEnviadas)
            .values({
              alertaId: alert.id,
              licitacaoId: match.numeroControlePNCP,
              canal,
            })
            .run();
        }
      } catch (err) {
        this.log(`Erro processando alerta "${alert.nome}": ${err}`);
        errors++;
      }
    }

    return { sent, errors };
  }
}
