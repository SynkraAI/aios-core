/**
 * CMSToStaticAdapter (BSS-5.6, AC-8)
 *
 * Converts a CMSPage object (Payload API response) into the template variable
 * objects expected by the BSS-5.1 StaticGenerator. This is the bridge that
 * ensures even CMS-managed content produces static HTML exports.
 *
 * Supported template mappings:
 * - landing-page → LandingPageCopy-compatible context
 * - about, services, blog-post, contact, pricing, terms-privacy, 404 → StaticPageContext
 */

import type { CMSPage, CMSGlobalConfig, StaticPageContext, CMSTemplate } from './types';

/**
 * Landing page context — extends StaticPageContext with section-specific data.
 * Compatible with the LandingPageCopy interface from BSS-5.4.
 */
export interface LandingPageContext extends StaticPageContext {
  readonly hero?: {
    readonly h1: string;
    readonly subHeadline?: string;
    readonly ctaLabel?: string;
    readonly ctaUrl?: string;
  };
}

/**
 * CMSToStaticAdapter — converts CMS content to static pipeline input.
 */
export class CMSToStaticAdapter {
  private readonly globalConfig: CMSGlobalConfig;

  constructor(globalConfig: CMSGlobalConfig) {
    this.globalConfig = globalConfig;
  }

  /**
   * Convert a CMS page to the StaticPageContext expected by StaticGenerator.
   */
  toStaticContext(page: CMSPage): StaticPageContext {
    return {
      clientId: this.globalConfig.clientId,
      title: page.title,
      slug: page.slug,
      template: page.template,
      seoTitle: page.seoTitle ?? page.title,
      seoDescription: page.seoDescription ?? '',
      content: this.renderContent(page.content),
      publishedAt: page.publishedAt,
      siteName: this.globalConfig.siteName,
      siteUrl: this.globalConfig.siteUrl,
      logoUrl: this.globalConfig.logoUrl,
      primaryColor: this.globalConfig.primaryColor,
      footerText: this.globalConfig.footerText,
    };
  }

  /**
   * Convert a CMS page to a landing page context.
   * Extracts hero section data from the rich-text content if available.
   */
  toLandingPageContext(page: CMSPage): LandingPageContext {
    const baseContext = this.toStaticContext(page);

    return {
      ...baseContext,
      hero: this.extractHeroFromContent(page.content),
    };
  }

  /**
   * Convert multiple pages to static contexts (batch).
   */
  toStaticContextBatch(pages: readonly CMSPage[]): StaticPageContext[] {
    return pages.map((page) => this.toStaticContext(page));
  }

  /**
   * Get the appropriate conversion method based on template type.
   */
  convert(page: CMSPage): StaticPageContext | LandingPageContext {
    if (page.template === 'landing-page') {
      return this.toLandingPageContext(page);
    }
    return this.toStaticContext(page);
  }

  /**
   * Render Lexical rich-text JSON to HTML string.
   *
   * NOTE: In production, this should use Payload's Lexical serializer.
   * This is a simplified implementation for the integration layer.
   */
  private renderContent(content: unknown): string {
    if (!content) return '';
    if (typeof content === 'string') return content;

    // Lexical JSON root has a `root` property with `children`
    const root = content as { root?: { children?: unknown[] } };
    if (root.root?.children) {
      return this.renderLexicalNodes(root.root.children);
    }

    return JSON.stringify(content);
  }

  /**
   * Simplified Lexical node renderer.
   * Supports: paragraph, heading, text, list, listitem, link.
   */
  private renderLexicalNodes(nodes: unknown[]): string {
    return nodes
      .map((node) => {
        const n = node as Record<string, unknown>;
        const type = n['type'] as string;
        const children = n['children'] as unknown[] | undefined;
        const childHtml = children ? this.renderLexicalNodes(children) : '';

        switch (type) {
          case 'paragraph':
            return `<p>${childHtml}</p>`;
          case 'heading': {
            const tag = n['tag'] as string ?? 'h2';
            return `<${tag}>${childHtml}</${tag}>`;
          }
          case 'text':
            return this.escapeHtml(n['text'] as string ?? '');
          case 'list': {
            const listTag = n['listType'] === 'number' ? 'ol' : 'ul';
            return `<${listTag}>${childHtml}</${listTag}>`;
          }
          case 'listitem':
            return `<li>${childHtml}</li>`;
          case 'link': {
            const url = ((n['fields'] as Record<string, unknown>)?.['url'] as string) ?? '#';
            return `<a href="${this.escapeHtml(url)}">${childHtml}</a>`;
          }
          default:
            return childHtml;
        }
      })
      .join('');
  }

  /**
   * Extract hero section data from Lexical content.
   * Looks for the first heading as h1 and first paragraph as sub-headline.
   */
  private extractHeroFromContent(
    content: unknown,
  ): LandingPageContext['hero'] | undefined {
    if (!content) return undefined;

    const root = content as { root?: { children?: unknown[] } };
    if (!root.root?.children?.length) return undefined;

    const nodes = root.root.children;
    let h1 = '';
    let subHeadline = '';

    for (const node of nodes) {
      const n = node as Record<string, unknown>;
      const type = n['type'] as string;
      const children = n['children'] as unknown[] | undefined;
      const text = children ? this.renderLexicalNodes(children) : '';

      if (type === 'heading' && !h1) {
        h1 = text;
      } else if (type === 'paragraph' && h1 && !subHeadline) {
        subHeadline = text;
        break;
      }
    }

    if (!h1) return undefined;
    return { h1, subHeadline: subHeadline || undefined };
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
