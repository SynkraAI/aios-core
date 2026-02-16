/**
 * Batch CLI
 * FinHealth Squad — Phase 12 (M3)
 *
 * Commands:
 *   finhealth batch generate --org <id> [--insurer <id>] [--competencia YYYY-MM]
 *   finhealth batch list --org <id>
 *   finhealth batch sign --batch <id> --cert <pfx-path> --pass <passphrase>
 *
 * Designed as a CLI-first tool per AIOS architecture principles.
 */

import { logger } from '../logger';
import type { TissBatch, BatchGenerateResult } from './types';

// ============================================================================
// CLI output helpers
// ============================================================================

function print(message: string): void {
  process.stdout.write(message + '\n');
}

function printTable(headers: string[], rows: string[][]): void {
  const colWidths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => (r[i] || '').length)),
  );

  const line = colWidths.map((w) => '-'.repeat(w + 2)).join('+');
  const headerRow = headers.map((h, i) => ` ${h.padEnd(colWidths[i])} `).join('|');

  print(line);
  print(headerRow);
  print(line);
  for (const row of rows) {
    print(row.map((c, i) => ` ${(c || '').padEnd(colWidths[i])} `).join('|'));
  }
  print(line);
}

function formatCurrency(amount: number): string {
  return `R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ============================================================================
// Result display
// ============================================================================

export function displayBatchResult(result: BatchGenerateResult): void {
  print('\n=== TISS Batch Generation Result ===\n');
  print(`Status: ${result.success ? 'SUCCESS' : 'FAILED'}`);
  print(`Batches: ${result.batches.length}`);
  print(`Total guides: ${result.totalGuides}`);
  print(`Total amount: ${formatCurrency(result.totalAmount)}`);

  if (result.batches.length > 0) {
    print('\n--- Batches ---');
    printTable(
      ['ID', 'Insurer', 'Competencia', 'Guides', 'Amount', 'Status'],
      result.batches.map((b) => [
        b.id,
        b.healthInsurerName,
        b.competencia,
        b.guideCount.toString(),
        formatCurrency(b.totalAmount),
        b.status,
      ]),
    );
  }

  if (result.errors.length > 0) {
    print('\n--- Errors ---');
    for (const err of result.errors) {
      print(`  ! ${err}`);
    }
  }

  print('');
}

export function displayBatchList(batches: TissBatch[]): void {
  print('\n=== TISS Batches ===\n');

  if (batches.length === 0) {
    print('  (no batches found)');
    return;
  }

  printTable(
    ['ID', 'Insurer', 'Competencia', 'Guides', 'Amount', 'Status', 'Created'],
    batches.map((b) => [
      b.id,
      b.healthInsurerName,
      b.competencia,
      b.guideCount.toString(),
      formatCurrency(b.totalAmount),
      b.status,
      b.createdAt.toISOString().split('T')[0],
    ]),
  );

  print('');
}

// ============================================================================
// CLI argument parser
// ============================================================================

export interface BatchCliArgs {
  command: 'generate' | 'list' | 'sign' | 'help';
  organizationId?: string;
  healthInsurerId?: string;
  competencia?: string;
  batchId?: string;
  certPath?: string;
  passphrase?: string;
  verbose: boolean;
}

export function parseBatchCliArgs(args: string[]): BatchCliArgs {
  const command = (args[0] || 'help') as BatchCliArgs['command'];
  const verbose = process.env.AIOS_DEBUG === 'true' || args.includes('--verbose');

  const result: BatchCliArgs = { command, verbose };

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    switch (arg) {
      case '--org':
        result.organizationId = next;
        i++;
        break;
      case '--insurer':
        result.healthInsurerId = next;
        i++;
        break;
      case '--competencia':
        result.competencia = next;
        i++;
        break;
      case '--batch':
        result.batchId = next;
        i++;
        break;
      case '--cert':
        result.certPath = next;
        i++;
        break;
      case '--pass':
        result.passphrase = next;
        i++;
        break;
    }
  }

  return result;
}

export function printBatchHelp(): void {
  print('FinHealth Batch CLI');
  print('');
  print('Commands:');
  print('  generate --org <id> [--insurer <id>] [--competencia YYYY-MM]');
  print('    Generate TISS batches from validated accounts');
  print('');
  print('  list --org <id>');
  print('    List existing batches');
  print('');
  print('  sign --batch <id> --cert <pfx-path> --pass <passphrase>');
  print('    Sign a batch with a digital certificate');
  print('');
  print('Options:');
  print('  --verbose                      Enable verbose logging');
  print('');
  print('Environment:');
  print('  AIOS_DEBUG=true                Enable debug logging');
}

/**
 * Run the batch CLI (entrypoint).
 */
export async function runBatchCli(args: string[]): Promise<void> {
  const parsed = parseBatchCliArgs(args);

  switch (parsed.command) {
    case 'generate':
      if (!parsed.organizationId) {
        print('Error: --org is required');
        process.exit(2);
      }
      print(`Generating batches for org: ${parsed.organizationId}`);
      print('(Requires database connection — use BatchProcessor programmatically)');
      break;

    case 'list':
      if (!parsed.organizationId) {
        print('Error: --org is required');
        process.exit(2);
      }
      print(`Listing batches for org: ${parsed.organizationId}`);
      print('(Requires database connection — use BatchProcessor programmatically)');
      break;

    case 'sign':
      if (!parsed.batchId || !parsed.certPath || !parsed.passphrase) {
        print('Error: --batch, --cert, and --pass are required');
        process.exit(2);
      }
      print(`Signing batch: ${parsed.batchId}`);
      print('(Requires database connection — use BatchProcessor programmatically)');
      break;

    default:
      printBatchHelp();
      break;
  }
}

// Direct execution
if (require.main === module) {
  const args = process.argv.slice(2);
  runBatchCli(args).catch((err) => {
    print(`[FATAL] ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  });
}
