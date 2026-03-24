/**
 * Quality Report Logger — persists QualityReport and ABComparisonReport
 * to structured JSON files for prompt calibration analysis.
 *
 * Log location: .ai/quality-logs/{client_id}/
 *
 * @see BSS-3.4: Prompt Quality Scoring Pipeline (AC 6)
 */
import type { QualityReport, ABComparisonReport } from './types';
/**
 * ReportLogger persists quality reports as JSON files organized by client.
 */
export declare class ReportLogger {
    private readonly logBase;
    /**
     * @param logBase - Base directory for quality logs (default: .ai/quality-logs)
     */
    constructor(logBase?: string);
    /**
     * Persist a QualityReport to disk.
     *
     * File: {logBase}/{clientId}/quality-report-{contentId}-{timestamp}.json
     */
    saveReport(clientId: string, report: QualityReport): string;
    /**
     * Persist an ABComparisonReport to disk.
     *
     * File: {logBase}/{clientId}/ab-comparison-{timestamp}.json
     */
    saveABReport(report: ABComparisonReport): string;
    /**
     * Create directory recursively if it does not exist.
     */
    private ensureDirectory;
}
//# sourceMappingURL=report-logger.d.ts.map