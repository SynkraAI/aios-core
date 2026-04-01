/**
 * Webpage Extractor — Fetch + Readability
 * Fallback: raw HTML if Readability not available
 */

import { retry } from '../utils/helpers.js';
import { DEFAULTS } from '../utils/constants.js';

/**
 * Extract webpage content
 * @param {string} url
 * @param {object} [options]
 * @returns {Promise<{ content: string, metadata: object, method: string }>}
 */
export async function extractWebpage(url, options = {}) {
  const timeout = options.timeout_ms || DEFAULTS.timeout_ms;
  const attempts = options.retry_attempts || DEFAULTS.retry_attempts;

  return retry(async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AIOX-ETL/1.0)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      const html = await response.text();

      // Try Readability-style extraction
      const extracted = extractArticleContent(html);

      const metadata = {
        http_status: response.status,
        content_type: contentType,
        url: response.url, // final URL after redirects
        fetched_at: new Date().toISOString(),
      };

      // If extracted content is too short, return full body
      if (extracted.content.length < 100) {
        return {
          content: html,
          metadata: { ...metadata, extraction_note: 'readability returned <100 chars, using raw HTML' },
          method: 'raw_html',
        };
      }

      return {
        content: extracted.content,
        title: extracted.title,
        metadata,
        method: 'readability',
      };
    } finally {
      clearTimeout(timer);
    }
  }, attempts, options.retry_delay_ms || DEFAULTS.retry_delay_ms);
}

/**
 * Simple article content extraction (Readability-lite)
 * Extracts main content by removing nav, footer, sidebar, ads
 */
function extractArticleContent(html) {
  // Extract title
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/is);
  const title = titleMatch ? titleMatch[1].trim() : '';

  // Remove non-content elements
  let content = html
    // Remove scripts, styles, noscript
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
    // Remove nav, header, footer, aside, forms
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
    .replace(/<form[^>]*>[\s\S]*?<\/form>/gi, '')
    // Remove common ad/social containers by class/id patterns
    .replace(/<[^>]*(class|id)=["'][^"']*(sidebar|social|share|ad-|advert|cookie|banner|popup|modal|newsletter|subscribe)[^"']*["'][^>]*>[\s\S]*?<\/[^>]+>/gi, '')
    // Remove HTML comments
    .replace(/<!--[\s\S]*?-->/g, '');

  // Try to find article/main content
  const articleMatch = content.match(/<article[^>]*>([\s\S]*?)<\/article>/i)
    || content.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
    || content.match(/<div[^>]*class=["'][^"']*(content|article|post|entry)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);

  if (articleMatch) {
    content = articleMatch[1] || articleMatch[2] || content;
  }

  return { content, title };
}
