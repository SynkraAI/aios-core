/**
 * CalendarExporter — Export content calendar plans to JSON and CSV (BSS-4.7).
 *
 * Supports optional R2 upload using the same DI pattern as BatchPipeline.
 * CSV follows RFC 4180 (fields with commas are quoted).
 */

import type { WeeklyPlan } from './types';

// ---------------------------------------------------------------------------
// R2 dependency interface (same DI pattern as BatchPipeline)
// ---------------------------------------------------------------------------

/** Minimal interface for R2 upload dependency injection. */
interface R2UploadDep {
  (
    client: unknown,
    bucket: string,
    clientId: string,
    folder: string,
    filename: string,
    body: Buffer,
    options?: Record<string, unknown>,
    logger?: unknown,
  ): Promise<{ key: string }>;
}

/** Dependencies for CalendarExporter R2 integration. */
export interface CalendarExporterDeps {
  readonly r2Client?: unknown;
  readonly r2Bucket?: string;
  readonly uploadAsset?: R2UploadDep;
}

// ---------------------------------------------------------------------------
// CSV helpers
// ---------------------------------------------------------------------------

/**
 * Escape a CSV field per RFC 4180.
 * If the field contains a comma, double-quote, or newline, wrap in double-quotes
 * and escape internal double-quotes by doubling them.
 */
function csvEscape(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n') || field.includes('\r')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

// ---------------------------------------------------------------------------
// CalendarExporter
// ---------------------------------------------------------------------------

export class CalendarExporter {
  private readonly deps: CalendarExporterDeps;

  constructor(deps: CalendarExporterDeps = {}) {
    this.deps = deps;
  }

  /**
   * Export weekly plans to JSON format.
   * Optionally uploads to R2 at `{clientId}/calendar/calendar.json`.
   */
  async exportJSON(
    plans: readonly WeeklyPlan[],
    clientId: string,
  ): Promise<{ content: string; r2Key?: string }> {
    const content = JSON.stringify(plans, null, 2);
    let r2Key: string | undefined;

    if (this.deps.r2Client && this.deps.r2Bucket && this.deps.uploadAsset) {
      const result = await this.deps.uploadAsset(
        this.deps.r2Client,
        this.deps.r2Bucket,
        clientId,
        'calendar',
        'calendar.json',
        Buffer.from(content, 'utf-8'),
        { contentType: 'application/json' },
      );
      r2Key = result.key;
    }

    return { content, r2Key };
  }

  /**
   * Export weekly plans to RFC 4180 CSV format.
   * Columns: Date,Platform,Pillar,Theme,Variant,AssetUrl
   * Optionally uploads to R2 at `{clientId}/calendar/calendar.csv`.
   */
  async exportCSV(
    plans: readonly WeeklyPlan[],
    clientId: string,
  ): Promise<{ content: string; r2Key?: string }> {
    const header = 'Date,Platform,Pillar,Theme,Variant,AssetUrl';
    const rows: string[] = [header];

    for (const week of plans) {
      for (const post of week.posts) {
        const row = [
          csvEscape(post.date),
          csvEscape(post.platform),
          csvEscape(post.pillar),
          csvEscape(post.contentTheme),
          csvEscape(post.variant),
          '', // AssetUrl empty — assets not yet generated
        ].join(',');
        rows.push(row);
      }
    }

    const content = rows.join('\n');
    let r2Key: string | undefined;

    if (this.deps.r2Client && this.deps.r2Bucket && this.deps.uploadAsset) {
      const result = await this.deps.uploadAsset(
        this.deps.r2Client,
        this.deps.r2Bucket,
        clientId,
        'calendar',
        'calendar.csv',
        Buffer.from(content, 'utf-8'),
        { contentType: 'text/csv' },
      );
      r2Key = result.key;
    }

    return { content, r2Key };
  }
}
