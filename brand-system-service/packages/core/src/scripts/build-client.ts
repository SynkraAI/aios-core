/**
 * Per-client build script with output isolation.
 *
 * Usage:
 *   ts-node build-client.ts --client=acme
 *
 * Reads `deployments/{clientId}/config.json`, sets BSS_CLIENT_ID env var,
 * cleans the per-client output directory, and spawns `pnpm run -r build`.
 *
 * Exit codes:
 *   0 = build succeeded
 *   1 = error (missing config, build failure, etc.)
 *
 * @module scripts/build-client
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

interface DeploymentConfig {
  clientId: string;
  platform: string;
  siteId: string;
  projectId: string;
  customDomain?: string;
  deployedAt: string;
}

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

function getClientId(argv: string[]): string {
  for (const arg of argv) {
    const match = arg.match(/^--client=(.+)$/);
    if (match) {
      return match[1];
    }
  }
  throw new Error('Missing required argument: --client={clientId}');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  try {
    const clientId = getClientId(process.argv.slice(2));

    // Resolve project root (brand-system-service/)
    const projectRoot = path.resolve(__dirname, '..', '..', '..', '..');
    const configPath = path.join(projectRoot, 'deployments', clientId, 'config.json');

    if (!fs.existsSync(configPath)) {
      throw new Error(
        `Deployment config not found: ${configPath}\n` +
          `Run "ts-node packages/core/src/scripts/add-deployment.ts --clientId=${clientId} ..." first.`,
      );
    }

    const raw = fs.readFileSync(configPath, 'utf-8');
    let config: DeploymentConfig;
    try {
      config = JSON.parse(raw) as DeploymentConfig;
    } catch {
      throw new Error(`Failed to parse deployment config at ${configPath}`);
    }

    if (config.clientId !== clientId) {
      throw new Error(
        `Client ID mismatch: requested "${clientId}" but config has "${config.clientId}"`,
      );
    }

    // Clean per-client output directory to prevent cross-client contamination
    const outputDir = path.join(projectRoot, 'output', clientId);
    if (fs.existsSync(outputDir)) {
      console.log(`Cleaning output directory: ${outputDir}`);
      fs.rmSync(outputDir, { recursive: true, force: true });
    }
    fs.mkdirSync(outputDir, { recursive: true });

    console.log(`Building client: ${clientId}`);
    console.log(`  Platform: ${config.platform}`);
    console.log(`  Output:   ${outputDir}`);
    if (config.customDomain) {
      console.log(`  Domain:   ${config.customDomain}`);
    }

    // Spawn build with client-specific env vars
    execSync('pnpm run -r build', {
      cwd: projectRoot,
      stdio: 'inherit',
      env: {
        ...process.env,
        BSS_CLIENT_ID: clientId,
        BSS_OUTPUT_DIR: path.join('output', clientId),
      },
    });

    console.log(`Build complete for client: ${clientId}`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error: ${message}`);
    process.exit(1);
  }
}

main();
