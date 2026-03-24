/**
 * Error rate monitoring — scans log files for ERROR entries in a time window.
 *
 * @module monitoring/error-rate
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import type { ErrorRateReport } from './types';

/** Default logs directory. */
const DEFAULT_LOGS_DIR = 'output/logs';

/**
 * Check error rate over a time window by scanning log files.
 *
 * @param windowHours - Time window in hours (default: 24)
 * @param logsDir - Directory containing log files
 * @returns Error rate report
 */
export function checkErrorRate(
  windowHours: number = 24,
  logsDir: string = DEFAULT_LOGS_DIR,
): ErrorRateReport {
  const now = Date.now();
  const windowStart = now - windowHours * 60 * 60 * 1000;
  const errorMessages: string[] = [];

  if (!existsSync(logsDir)) {
    return {
      errorCount: 0,
      windowHours,
      rate: 0,
      topErrors: [],
      generatedAt: new Date().toISOString(),
    };
  }

  // Scan all files in the logs directory
  const files = readdirSync(logsDir).filter((f) => f.endsWith('.jsonl') || f.endsWith('.log'));

  for (const file of files) {
    const filePath = path.join(logsDir, file);
    try {
      const content = readFileSync(filePath, 'utf-8').trim();
      if (!content) continue;

      const lines = content.split('\n');
      for (const line of lines) {
        try {
          const entry = JSON.parse(line) as Record<string, unknown>;
          const level = String(entry.level ?? entry.severity ?? '').toUpperCase();
          const timestamp = entry.timestamp as string | undefined;

          if (level !== 'ERROR' && level !== 'CRITICAL') continue;
          if (!timestamp) continue;

          const entryTime = new Date(timestamp).getTime();
          if (isNaN(entryTime) || entryTime < windowStart) continue;

          const message = String(entry.message ?? entry.event ?? 'Unknown error');
          errorMessages.push(message);
        } catch {
          // Skip non-JSON lines
        }
      }
    } catch {
      // Skip unreadable files
    }
  }

  // Compute top errors (most frequent messages)
  const messageCounts = new Map<string, number>();
  for (const msg of errorMessages) {
    messageCounts.set(msg, (messageCounts.get(msg) ?? 0) + 1);
  }

  const topErrors = [...messageCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([msg, count]) => `${msg} (${count}x)`);

  return {
    errorCount: errorMessages.length,
    windowHours,
    rate: windowHours > 0 ? errorMessages.length / windowHours : 0,
    topErrors,
    generatedAt: new Date().toISOString(),
  };
}
