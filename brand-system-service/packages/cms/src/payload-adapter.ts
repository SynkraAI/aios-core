/**
 * PayloadCMSAdapter (BSS-5.6, AC-3)
 *
 * Wraps the Payload CMS local API and exposes a clean interface for
 * fetching pages and global configuration. Designed to be consumed by
 * CMSToStaticAdapter for converting CMS content to static site input.
 *
 * IMPORTANT: This package requires `payload` as a peer dependency.
 * The consumer project must install Payload CMS 3.x separately.
 */

import type { CMSPage, CMSGlobalConfig, ICMSAdapter } from './types';

/**
 * Payload local API interface (subset used by the adapter).
 * Full typing comes from the `payload` package when installed.
 */
interface PayloadLocalAPI {
  find(args: {
    collection: string;
    where?: Record<string, unknown>;
    limit?: number;
    sort?: string;
  }): Promise<{ docs: unknown[]; totalDocs: number }>;
  findByID(args: {
    collection: string;
    id: string;
  }): Promise<unknown>;
  findGlobal(args: {
    slug: string;
  }): Promise<unknown>;
}

/**
 * PayloadCMSAdapter — wraps Payload local API for CMS data access.
 *
 * Usage:
 * ```typescript
 * import { getPayload } from 'payload';
 * const payload = await getPayload({ config });
 * const adapter = new PayloadCMSAdapter(payload);
 * const page = await adapter.getPage('about-us');
 * ```
 */
export class PayloadCMSAdapter implements ICMSAdapter {
  private readonly payload: PayloadLocalAPI;

  constructor(payload: PayloadLocalAPI) {
    this.payload = payload;
  }

  /**
   * Get a single page by slug.
   * @throws Error if page not found
   */
  async getPage(slug: string): Promise<CMSPage> {
    const result = await this.payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      limit: 1,
    });

    if (result.docs.length === 0) {
      throw new Error(`Page not found: "${slug}"`);
    }

    return result.docs[0] as CMSPage;
  }

  /**
   * Get all pages, sorted by most recently updated first.
   */
  async getAllPages(): Promise<CMSPage[]> {
    const result = await this.payload.find({
      collection: 'pages',
      limit: 1000,
      sort: '-updatedAt',
    });

    return result.docs as CMSPage[];
  }

  /**
   * Get the global site configuration.
   */
  async getGlobalConfig(): Promise<CMSGlobalConfig> {
    const global = await this.payload.findGlobal({
      slug: 'site-config',
    });

    return global as CMSGlobalConfig;
  }
}
