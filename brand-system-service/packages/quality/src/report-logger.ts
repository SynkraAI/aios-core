/**
 * Quality Report Logger — persists QualityReport and ABComparisonReport
 * to structured JSON files for prompt calibration analysis.
 *
 * Log location: .ai/quality-logs/{client_id}/
 *
 * @see BSS-3.4: Prompt Quality Scoring Pipeline (AC 6)
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import type { QualityReport, ABComparisonReport } from './types';

/** Default base directory for quality logs. */
const DEFAULT_LOG_BASE = '.ai/quality-logs';

/**
 * ReportLogger persists quality reports as JSON files organized by client.
 */
export class ReportLogger {
  private readonly logBase: string;

  /**
   * @param logBase - Base directory for quality logs (default: .ai/quality-logs)
   */
  constructor(logBase: string = DEFAULT_LOG_BASE) {
    this.logBase = logBase;
  }

  /**
   * Persist a QualityReport to disk.
   *
   * File: {logBase}/{clientId}/quality-report-{contentId}-{timestamp}.json
   */
  saveReport(clientId: string, report: QualityReport): string {
    const dir = path.join(this.logBase, clientId);
    this.ensureDirectory(dir);

    const safeTimestamp = report.timestamp.replace(/[:.]/g, '-');
    const filename = `quality-report-${report.contentId}-${safeTimestamp}.json`;
    const filePath = path.join(dir, filename);

    fs.writeFileSync(filePath, JSON.stringify(report, null, 2), 'utf-8');

    return filePath;
  }

  /**
   * Persist an ABComparisonReport to disk.
   *
   * File: {logBase}/{clientId}/ab-comparison-{timestamp}.json
   */
  saveABReport(report: ABComparisonReport): string {
    const dir = path.join(this.logBase, report.clientId);
    this.ensureDirectory(dir);

    const safeTimestamp = report.timestamp.replace(/[:.]/g, '-');
    const filename = `ab-comparison-${safeTimestamp}.json`;
    const filePath = path.join(dir, filename);

    fs.writeFileSync(filePath, JSON.stringify(report, null, 2), 'utf-8');

    return filePath;
  }

  /**
   * Create directory recursively if it does not exist.
   */
  private ensureDirectory(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}
