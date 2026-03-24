/**
 * Per-client deployment configuration.
 *
 * Stored at `deployments/{clientId}/config.json`.
 * Managed by `add-deployment.ts` CLI script.
 *
 * @module deployment/types
 */

export interface DeploymentConfig {
  clientId: string;
  platform: 'vercel' | 'netlify' | 'generic';
  siteId: string;
  projectId: string;
  customDomain?: string;
  deployedAt: string;
}

export const VALID_PLATFORMS = ['vercel', 'netlify', 'generic'] as const;

export type DeploymentPlatform = (typeof VALID_PLATFORMS)[number];
