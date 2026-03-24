/**
 * Webhook Handler Stub — on-publish (BSS-5.6, AC-9)
 *
 * Receives a Payload `afterChange` hook event when a page is published,
 * calls CMSToStaticAdapter, and triggers StaticGenerator.generate() to
 * produce an updated static build.
 *
 * This is a STUB with TODO comments for production integration.
 * The actual deployment hook (Vercel ISR / Netlify deploy) must be
 * configured per client.
 */

import type { CMSPage, CMSGlobalConfig } from '../types';
import { CMSToStaticAdapter } from '../cms-to-static';

/**
 * Payload afterChange hook argument shape (simplified).
 */
export interface AfterChangeHookArgs {
  readonly doc: CMSPage;
  readonly previousDoc?: CMSPage;
  readonly operation: 'create' | 'update';
}

/**
 * Configuration for the on-publish webhook handler.
 */
export interface OnPublishConfig {
  readonly globalConfig: CMSGlobalConfig;
  readonly outputDir: string;
  readonly onBuildComplete?: (result: BuildResult) => Promise<void>;
}

/**
 * Result from a triggered static build.
 */
export interface BuildResult {
  readonly outputDir: string;
  readonly pageSlug: string;
  readonly template: string;
  readonly timestamp: string;
}

/**
 * Create a Payload afterChange hook handler for the Pages collection.
 *
 * Usage in payload.config.ts:
 * ```typescript
 * import { createOnPublishHook } from '@brand-system/cms';
 *
 * const onPublish = createOnPublishHook({
 *   globalConfig,
 *   outputDir: './output',
 * });
 *
 * // In Pages collection config:
 * hooks: { afterChange: [onPublish] }
 * ```
 */
export function createOnPublishHook(config: OnPublishConfig) {
  return async function onPublish(args: AfterChangeHookArgs): Promise<CMSPage> {
    const { doc, previousDoc, operation } = args;

    // Only trigger rebuild when status changes to 'published'
    const isPublishing =
      doc.status === 'published' &&
      (operation === 'create' || previousDoc?.status !== 'published');

    if (!isPublishing) {
      return doc;
    }

    // Convert CMS page to static context
    const adapter = new CMSToStaticAdapter(config.globalConfig);
    const _staticContext = adapter.convert(doc);

    // TODO: Call StaticGenerator.generate() with the static context
    // This requires importing @bss/static-generator which is not a dependency
    // of this package. In production, the consumer project wires this up.
    //
    // Example:
    // const generator = new StaticGenerator();
    // await generator.generate({
    //   clientId: config.globalConfig.clientId,
    //   type: doc.template,
    //   outputDir: config.outputDir,
    //   templateData: staticContext,
    // });

    // TODO: Trigger deployment after build
    // Option A — Vercel ISR:
    //   await fetch(`https://your-site.vercel.app/api/revalidate?path=/${doc.slug}`, {
    //     method: 'POST',
    //     headers: { 'x-revalidate-token': process.env.REVALIDATION_TOKEN },
    //   });
    //
    // Option B — Netlify deploy hook:
    //   await fetch(process.env.NETLIFY_BUILD_HOOK_URL, { method: 'POST' });
    //
    // Option C — GitHub Pages:
    //   Trigger GitHub Actions workflow via repository_dispatch event.

    const result: BuildResult = {
      outputDir: config.outputDir,
      pageSlug: doc.slug,
      template: doc.template,
      timestamp: new Date().toISOString(),
    };

    // Notify callback if provided
    if (config.onBuildComplete) {
      await config.onBuildComplete(result);
    }

    return doc;
  };
}
