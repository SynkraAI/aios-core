/**
 * CostLedger — Append-only ledger for AI API call cost records.
 *
 * Persists records to structured JSON files:
 *   .ai/cost-ledger/{client_id}/{YYYY-MM}.json
 *
 * Each file contains a JSON array of CostRecord entries.
 *
 * @module cost/ledger
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import type { CostRecord } from './types';

export class CostLedger {
  private readonly baseDir: string;

  /**
   * @param baseDir - Base directory for ledger files (e.g., project root).
   *                  Ledger files stored at {baseDir}/.ai/cost-ledger/
   */
  constructor(baseDir: string) {
    this.baseDir = baseDir;
  }

  /**
   * Append a cost record to the ledger file for the client and current month.
   *
   * Creates the directory and file if they do not exist.
   * Reads existing records, pushes the new one, writes back the full array.
   */
  record(costRecord: CostRecord): void {
    const date = new Date(costRecord.timestamp);
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;

    const dir = this.getLedgerDir(costRecord.clientId);
    const filePath = path.join(dir, `${monthStr}.json`);

    // Ensure directory exists
    fs.mkdirSync(dir, { recursive: true });

    // Read existing records or start fresh
    let records: CostRecord[] = [];
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        records = JSON.parse(raw) as CostRecord[];
      } catch {
        // Corrupted file — start fresh
        records = [];
      }
    }

    records.push(costRecord);
    fs.writeFileSync(filePath, JSON.stringify(records, null, 2), 'utf-8');
  }

  /**
   * Read all cost records for a client in a given year/month.
   *
   * @returns Array of CostRecord, or empty array if no file exists.
   */
  readPeriod(clientId: string, year: number, month: number): CostRecord[] {
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    const filePath = path.join(this.getLedgerDir(clientId), `${monthStr}.json`);

    if (!fs.existsSync(filePath)) {
      return [];
    }

    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw) as CostRecord[];
    } catch {
      return [];
    }
  }

  /** Resolve the ledger directory for a given client. */
  private getLedgerDir(clientId: string): string {
    return path.join(this.baseDir, '.ai', 'cost-ledger', clientId);
  }
}
