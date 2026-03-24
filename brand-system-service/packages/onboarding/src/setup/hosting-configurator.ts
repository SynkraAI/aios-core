/**
 * Hosting Configurator for automated client setup (BSS-7.9, AC 5).
 *
 * Manages hosting provider integration (Vercel, Netlify) or generates
 * manual action instructions when no provider is available. Implements
 * NFR-9.6 graceful degradation on API failures.
 *
 * @module onboarding/setup/hosting-configurator
 */

import type { HostingProvider, HostingClient, ManualAction } from './setup-types';

/** Configuration for the HostingConfigurator. */
interface HostingConfiguratorConfig {
  readonly hostingProvider: HostingProvider;
  readonly hostingClient?: HostingClient;
}

/** Result of a hosting configuration attempt. */
export interface HostingConfigResult {
  readonly url?: string;
  readonly manualAction?: ManualAction;
}

/**
 * Configures hosting for a client's brand deliverables.
 *
 * Supports automated deployment via Vercel/Netlify or generates
 * manual setup instructions as fallback.
 */
export class HostingConfigurator {
  private readonly _hostingProvider: HostingProvider;
  private readonly _hostingClient?: HostingClient;

  /**
   * Create a new HostingConfigurator.
   *
   * @param config - Hosting provider type and optional API client.
   */
  constructor(config: HostingConfiguratorConfig) {
    this._hostingProvider = config.hostingProvider;
    this._hostingClient = config.hostingClient;
  }

  /**
   * Configure hosting for the specified client.
   *
   * - If provider is 'manual', returns a manual action with instructions.
   * - If provider is 'vercel' or 'netlify' and a hosting client exists,
   *   attempts to create a project automatically.
   * - On API failure, falls back to manual action (NFR-9.6 graceful degradation).
   *
   * @param clientId - The client identifier.
   * @returns The hosting URL or a manual action item.
   */
  async configure(clientId: string): Promise<HostingConfigResult> {
    if (this._hostingProvider === 'manual') {
      return {
        manualAction: {
          step: 'hosting_config',
          instructions:
            `Manual hosting setup required for client "${clientId}". ` +
            `Deploy the static brand assets from R2 path "brand-assets/${clientId}/" ` +
            'to your preferred hosting provider.',
        },
      };
    }

    if (!this._hostingClient) {
      return {
        manualAction: {
          step: 'hosting_config',
          instructions:
            `No ${this._hostingProvider} API client configured. ` +
            `Deploy the static brand assets from R2 path "brand-assets/${clientId}/" ` +
            `to ${this._hostingProvider} manually.`,
        },
      };
    }

    try {
      const result = await this._hostingClient.createProject({
        name: `${clientId}-brand`,
        r2BucketPath: `brand-assets/${clientId}/`,
      });
      return { url: result.url };
    } catch (error) {
      // NFR-9.6: Graceful degradation — fall back to manual action
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        manualAction: {
          step: 'hosting_config',
          instructions:
            `${this._hostingProvider} API failed: ${errorMessage}. ` +
            `Deploy the static brand assets from R2 path "brand-assets/${clientId}/" ` +
            `to ${this._hostingProvider} manually.`,
        },
      };
    }
  }
}
