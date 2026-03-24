/**
 * Moderation run logger.
 * @module moderation/mod-logger
 */

import * as fs from 'fs';
import * as path from 'path';
import type { ModerationResult } from './types';

/** Log entry structure. */
interface ModerationLogEntry {
  contentId: string;
  clientId: string;
  timestamp: string;
  severity: string;
  flagCount: number;
  humanReviewRequired: boolean;
  flags: Array<{
    filter: string;
    severity: string;
    matchedContent: string[];
    explanation: string;
  }>;
}

/**
 * Log a moderation run.
 *
 * @param result - Moderation result
 * @param contentId - Content identifier
 * @param clientId - Client identifier
 */
export function logModerationRun(
  result: ModerationResult,
  contentId: string,
  clientId: string,
): void {
  const logDir = path.join(process.cwd(), '.ai', 'moderation-logs', clientId);

  // Create directory if it doesn't exist
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logFile = path.join(logDir, `mod-${contentId}-${timestamp}.json`);

  const entry: ModerationLogEntry = {
    contentId,
    clientId,
    timestamp: new Date().toISOString(),
    severity: result.severity,
    flagCount: result.flags.length,
    humanReviewRequired: result.requiresHumanReview,
    flags: result.flags,
  };

  try {
    fs.writeFileSync(logFile, JSON.stringify(entry, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Failed to write moderation log: ${error}`);
  }
}
