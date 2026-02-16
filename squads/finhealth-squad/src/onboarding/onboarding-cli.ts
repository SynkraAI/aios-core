/**
 * Onboarding CLI
 * FinHealth Squad — Phase 12 (M2)
 *
 * Commands:
 *   finhealth tenant create --name "Hospital X" --type hospital --admin-user <uuid> [--cnpj XX.XXX.XXX/XXXX-XX]
 *   finhealth tenant list
 *   finhealth tenant info --org <id>
 *
 * Designed as a CLI-first tool per AIOS architecture principles.
 */

import { logger } from '../logger';
import type { ProvisioningResult, OrgType } from './types';

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

// ============================================================================
// Result display
// ============================================================================

export function displayProvisioningResult(result: ProvisioningResult): void {
  print('\n=== Tenant Provisioning Result ===\n');
  print(`Status: ${result.success ? 'SUCCESS' : 'FAILED'}`);

  if (result.organizationId) {
    print(`Organization ID: ${result.organizationId}`);
  }
  if (result.slug) {
    print(`Slug: ${result.slug}`);
  }
  print(`Duration: ${result.durationMs}ms`);

  print('\n--- Steps ---');
  printTable(
    ['Step', 'Status', 'Detail'],
    result.steps.map((s) => [
      s.name,
      s.status,
      s.detail || '-',
    ]),
  );

  if (result.errors.length > 0) {
    print('\n--- Errors ---');
    for (const err of result.errors) {
      print(`  ! ${err}`);
    }
  }

  print('');
}

// ============================================================================
// CLI argument parser
// ============================================================================

export interface OnboardingCliArgs {
  command: 'create' | 'list' | 'info' | 'help';
  name?: string;
  type?: OrgType;
  cnpj?: string;
  plan?: string;
  adminUserId?: string;
  organizationId?: string;
  verbose: boolean;
}

export function parseOnboardingCliArgs(args: string[]): OnboardingCliArgs {
  const command = (args[0] || 'help') as OnboardingCliArgs['command'];
  const verbose = process.env.AIOS_DEBUG === 'true' || args.includes('--verbose');

  const result: OnboardingCliArgs = { command, verbose };

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    switch (arg) {
      case '--name':
        result.name = next;
        i++;
        break;
      case '--type':
        result.type = next as OrgType;
        i++;
        break;
      case '--cnpj':
        result.cnpj = next;
        i++;
        break;
      case '--plan':
        result.plan = next;
        i++;
        break;
      case '--admin-user':
        result.adminUserId = next;
        i++;
        break;
      case '--org':
        result.organizationId = next;
        i++;
        break;
    }
  }

  return result;
}

export function printOnboardingHelp(): void {
  print('FinHealth Tenant Onboarding CLI');
  print('');
  print('Commands:');
  print('  create --name <name> --type <hospital|ubs|clinica> --admin-user <uuid>');
  print('    [--cnpj XX.XXX.XXX/XXXX-XX] [--plan basic|professional|enterprise]');
  print('    Provision a new tenant with all defaults');
  print('');
  print('  list');
  print('    List all organizations');
  print('');
  print('  info --org <id>');
  print('    Show organization details');
  print('');
  print('Options:');
  print('  --verbose                      Enable verbose logging');
  print('');
  print('Environment:');
  print('  SUPABASE_URL                   Supabase URL');
  print('  SUPABASE_SERVICE_KEY           Supabase service role key');
  print('  AIOS_DEBUG=true                Enable debug logging');
}

/**
 * Run the onboarding CLI (entrypoint).
 */
export async function runOnboardingCli(args: string[]): Promise<void> {
  const parsed = parseOnboardingCliArgs(args);

  switch (parsed.command) {
    case 'create':
      if (!parsed.name || !parsed.type || !parsed.adminUserId) {
        print('Error: --name, --type, and --admin-user are required');
        process.exit(2);
      }
      print(`Creating tenant: ${parsed.name} (${parsed.type})`);
      print('(Requires database connection — use TenantProvisioner programmatically)');
      break;

    case 'list':
      print('Listing organizations...');
      print('(Requires database connection)');
      break;

    case 'info':
      if (!parsed.organizationId) {
        print('Error: --org is required');
        process.exit(2);
      }
      print(`Organization info: ${parsed.organizationId}`);
      print('(Requires database connection)');
      break;

    default:
      printOnboardingHelp();
      break;
  }
}

// Direct execution
if (require.main === module) {
  const args = process.argv.slice(2);
  runOnboardingCli(args).catch((err) => {
    print(`[FATAL] ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  });
}
