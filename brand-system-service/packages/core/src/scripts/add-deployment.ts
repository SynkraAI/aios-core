/**
 * Register a new per-client deployment configuration.
 *
 * Usage:
 *   ts-node add-deployment.ts \
 *     --clientId=acme \
 *     --platform=vercel \
 *     --siteId=prj_abc123 \
 *     --projectId=prj_xyz789 \
 *     --customDomain=brand.acme.com   # optional
 *
 * Creates `deployments/{clientId}/config.json` with a DeploymentConfig object.
 *
 * Exit codes:
 *   0 = success
 *   1 = validation or I/O error
 *
 * @module scripts/add-deployment
 */

import fs from 'node:fs';
import path from 'node:path';

const VALID_PLATFORMS = ['vercel', 'netlify', 'generic'] as const;
type DeploymentPlatform = (typeof VALID_PLATFORMS)[number];

interface DeploymentConfig {
  clientId: string;
  platform: DeploymentPlatform;
  siteId: string;
  projectId: string;
  customDomain?: string;
  deployedAt: string;
}

// ---------------------------------------------------------------------------
// Argument parsing (Node stdlib only — no external deps)
// ---------------------------------------------------------------------------

function parseArgs(argv: string[]): Record<string, string> {
  const args: Record<string, string> = {};
  for (const arg of argv) {
    const match = arg.match(/^--(\w+)=(.+)$/);
    if (match) {
      args[match[1]] = match[2];
    }
  }
  return args;
}

function requireArg(args: Record<string, string>, key: string): string {
  const value = args[key];
  if (!value) {
    throw new Error(`Missing required argument: --${key}`);
  }
  return value;
}

function validatePlatform(value: string): DeploymentPlatform {
  if (!(VALID_PLATFORMS as readonly string[]).includes(value)) {
    throw new Error(`Invalid platform "${value}". Allowed values: ${VALID_PLATFORMS.join(', ')}`);
  }
  return value as DeploymentPlatform;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  try {
    const args = parseArgs(process.argv.slice(2));

    const clientId = requireArg(args, 'clientId');
    const platform = validatePlatform(requireArg(args, 'platform'));
    const siteId = requireArg(args, 'siteId');
    const projectId = requireArg(args, 'projectId');
    const customDomain = args['customDomain'] ?? undefined;

    const config: DeploymentConfig = {
      clientId,
      platform,
      siteId,
      projectId,
      ...(customDomain ? { customDomain } : {}),
      deployedAt: new Date().toISOString(),
    };

    // Resolve deployments dir relative to project root (brand-system-service/)
    const projectRoot = path.resolve(__dirname, '..', '..', '..', '..');
    const deploymentsDir = path.join(projectRoot, 'deployments', clientId);

    fs.mkdirSync(deploymentsDir, { recursive: true });

    const configPath = path.join(deploymentsDir, 'config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');

    console.log(`Deployment config created: ${configPath}`);
    console.log(`  Client:   ${clientId}`);
    console.log(`  Platform: ${platform}`);
    console.log(`  Site ID:  ${siteId}`);
    if (customDomain) {
      console.log(`  Domain:   ${customDomain}`);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error: ${message}`);
    process.exit(1);
  }
}

main();
