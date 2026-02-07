// Track AI usage and costs for daily limits

import { getDb } from '../database/connection';
import { iaUsage } from '../database/schema';
import { sql, eq, and } from 'drizzle-orm';

/** Get today's date as YYYY-MM-DD */
function today(): string {
  return new Date().toISOString().split('T')[0];
}

/** Record a single AI usage event */
export function recordUsage(
  dataDir: string,
  tipo: 'chat' | 'analysis',
  modelo: string,
  tokensInput: number,
  tokensOutput: number,
  custoEstimado: number
): void {
  const db = getDb(dataDir);
  db.insert(iaUsage)
    .values({
      tipo,
      modelo,
      tokensInput,
      tokensOutput,
      custoEstimado,
      data: today(),
    })
    .run();
}

/** Get today's usage stats */
export function getTodayUsage(dataDir: string): {
  totalAnalises: number;
  totalChats: number;
  tokensInput: number;
  tokensOutput: number;
  custoTotal: number;
} {
  const db = getDb(dataDir);
  const dateStr = today();

  const result = db
    .select({
      tipo: iaUsage.tipo,
      count: sql<number>`count(*)`,
      inputTokens: sql<number>`sum(tokens_input)`,
      outputTokens: sql<number>`sum(tokens_output)`,
      custo: sql<number>`sum(custo_estimado)`,
    })
    .from(iaUsage)
    .where(eq(iaUsage.data, dateStr))
    .groupBy(iaUsage.tipo)
    .all();

  let totalAnalises = 0;
  let totalChats = 0;
  let tokensInput = 0;
  let tokensOutput = 0;
  let custoTotal = 0;

  for (const row of result) {
    if (row.tipo === 'analysis') totalAnalises = row.count;
    if (row.tipo === 'chat') totalChats = row.count;
    tokensInput += row.inputTokens || 0;
    tokensOutput += row.outputTokens || 0;
    custoTotal += row.custo || 0;
  }

  return { totalAnalises, totalChats, tokensInput, tokensOutput, custoTotal };
}

/** Check if daily analysis limit has been reached */
export function isLimitReached(dataDir: string, maxPerDay: number): boolean {
  const usage = getTodayUsage(dataDir);
  return usage.totalAnalises >= maxPerDay;
}
