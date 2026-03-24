/**
 * PageFetcher — Fetch and validate URLs for audit analysis (BSS-7.3, AC-1).
 *
 * Responsibilities:
 * - Fetch URLs with 10s timeout via AbortController
 * - Check robots.txt before fetch (NFR-9.9)
 * - Handle inaccessible URLs gracefully (HTTP errors, timeouts, rate limits)
 * - Never submit credentials or bypass authentication (CON-18)
 *
 * @module onboarding/audit/page-fetcher
 */

import type {
  HttpFetcher,
  FetchResult,
  PageAnalysis,
  HeadingEntry,
  AuditLogger,
  AuditPipelineConfig,
} from './audit-types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_TIMEOUT_MS = 10_000;

// ---------------------------------------------------------------------------
// robots.txt Checking (NFR-9.9)
// ---------------------------------------------------------------------------

/**
 * Check if a URL is allowed by the site's robots.txt.
 *
 * Parses User-agent: * rules and checks Disallow directives.
 * Returns true if allowed (or if robots.txt is inaccessible).
 */
export async function isAllowedByRobotsTxt(
  url: string,
  fetcher: HttpFetcher,
  logger?: AuditLogger,
): Promise<boolean> {
  try {
    const parsed = new URL(url);
    const robotsUrl = `${parsed.protocol}//${parsed.host}/robots.txt`;

    const result = await fetcher.fetch(robotsUrl, { timeoutMs: 5_000 });

    if (!result.ok) {
      // No robots.txt or inaccessible — assume allowed
      return true;
    }

    const robotsText = await result.text();
    return parseRobotsTxtAllows(robotsText, parsed.pathname);
  } catch (error) {
    // If robots.txt check fails, allow access (graceful degradation)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger?.warn(`robots.txt check failed for ${url}: ${errorMessage}`);
    return true;
  }
}

/**
 * Parse robots.txt content and determine if a path is allowed
 * for User-agent: * rules.
 */
export function parseRobotsTxtAllows(robotsText: string, path: string): boolean {
  const lines = robotsText.split('\n').map((line) => line.trim());

  let inWildcardAgent = false;
  const disallowedPaths: string[] = [];

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    if (lowerLine.startsWith('user-agent:')) {
      const agent = lowerLine.replace('user-agent:', '').trim();
      inWildcardAgent = agent === '*';
      continue;
    }

    if (inWildcardAgent && lowerLine.startsWith('disallow:')) {
      const disallowPath = line.replace(/^disallow:\s*/i, '').trim();
      if (disallowPath) {
        disallowedPaths.push(disallowPath);
      }
    }

    // Stop processing wildcard rules if we hit another User-agent block
    if (inWildcardAgent && lowerLine.startsWith('user-agent:')) {
      break;
    }
  }

  // Check if the path matches any disallowed pattern
  for (const disallowed of disallowedPaths) {
    if (disallowed === '/') {
      // Disallow: / means the entire site is blocked
      return false;
    }
    if (path.startsWith(disallowed)) {
      return false;
    }
  }

  return true;
}

// ---------------------------------------------------------------------------
// HTML Content Extraction (AC-2)
// ---------------------------------------------------------------------------

/** Extract the page title from HTML. */
export function extractTitle(html: string): string | undefined {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? match[1].trim() : undefined;
}

/** Extract meta description from HTML. */
export function extractMetaDescription(html: string): string | undefined {
  const match = html.match(
    /<meta\s+(?:[^>]*?\s+)?name=["']description["']\s+(?:[^>]*?\s+)?content=["']([\s\S]*?)["'][^>]*>/i,
  );
  if (match) return match[1].trim();

  // Try alternate attribute order
  const altMatch = html.match(
    /<meta\s+(?:[^>]*?\s+)?content=["']([\s\S]*?)["']\s+(?:[^>]*?\s+)?name=["']description["'][^>]*>/i,
  );
  return altMatch ? altMatch[1].trim() : undefined;
}

/** Extract headings H1-H3 from HTML (AC-2). */
export function extractHeadings(html: string): HeadingEntry[] {
  const headings: HeadingEntry[] = [];
  const regex = /<h([1-3])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1], 10) as 1 | 2 | 3;
    // Strip HTML tags from heading content
    const text = match[2].replace(/<[^>]*>/g, '').trim();
    if (text) {
      headings.push({ level, text });
    }
  }

  return headings;
}

/** Extract dominant color hex values from inline styles and CSS (AC-2). */
export function extractColors(html: string): string[] {
  const colorSet = new Set<string>();

  // Match hex colors (3, 4, 6, 8 digit)
  const hexRegex = /#(?:[0-9a-fA-F]{3,4}){1,2}\b/g;
  let hexMatch: RegExpExecArray | null;
  while ((hexMatch = hexRegex.exec(html)) !== null) {
    const normalized = normalizeHexColor(hexMatch[0]);
    if (normalized) {
      colorSet.add(normalized);
    }
  }

  // Match rgb/rgba colors
  const rgbRegex = /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/g;
  let rgbMatch: RegExpExecArray | null;
  while ((rgbMatch = rgbRegex.exec(html)) !== null) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    if (r <= 255 && g <= 255 && b <= 255) {
      const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      colorSet.add(hex.toLowerCase());
    }
  }

  // Filter out common default/transparent/white/black colors if we have enough
  const colors = Array.from(colorSet);
  return colors.slice(0, 20); // Cap at 20 to avoid noise
}

/** Normalize a hex color to 6-digit lowercase format. */
function normalizeHexColor(hex: string): string | null {
  const clean = hex.replace('#', '');

  if (clean.length === 3) {
    const expanded = clean
      .split('')
      .map((c) => c + c)
      .join('');
    return `#${expanded.toLowerCase()}`;
  }

  if (clean.length === 6) {
    return `#${clean.toLowerCase()}`;
  }

  // 4 or 8 digit (with alpha) — take only RGB part
  if (clean.length === 4) {
    const rgb = clean.slice(0, 3);
    const expanded = rgb
      .split('')
      .map((c) => c + c)
      .join('');
    return `#${expanded.toLowerCase()}`;
  }

  if (clean.length === 8) {
    return `#${clean.slice(0, 6).toLowerCase()}`;
  }

  return null;
}

/** Extract font names from CSS font-family declarations. */
export function extractFonts(html: string): string[] {
  const fontSet = new Set<string>();

  // Match font-family values including quoted strings (handles both ' and " quotes)
  const fontFamilyRegex = /font-family\s*:\s*((?:[^;{}]|"[^"]*"|'[^']*')+)/gi;
  let match: RegExpExecArray | null;

  while ((match = fontFamilyRegex.exec(html)) !== null) {
    const families = match[1].split(',').map((f) => f.trim().replace(/["']/g, ''));
    for (const family of families) {
      // Skip generic font families
      const generic = ['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'inherit', 'initial'];
      if (family && !generic.includes(family.toLowerCase())) {
        fontSet.add(family);
      }
    }
  }

  return Array.from(fontSet);
}

/** Extract visible text content from HTML (strips tags, scripts, styles). */
export function extractTextContent(html: string): string {
  // Remove script and style blocks
  let cleaned = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  cleaned = cleaned.replace(/<style[\s\S]*?<\/style>/gi, '');
  cleaned = cleaned.replace(/<noscript[\s\S]*?<\/noscript>/gi, '');

  // Remove HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, ' ');

  // Decode common HTML entities
  cleaned = cleaned
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Collapse whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}

// ---------------------------------------------------------------------------
// PageFetcher Class
// ---------------------------------------------------------------------------

/**
 * Fetches and parses web pages for audit analysis.
 *
 * Uses dependency injection for HTTP fetching to enable testing
 * without real network calls.
 */
export class PageFetcher {
  private readonly fetcher: HttpFetcher;
  private readonly config: { fetchTimeoutMs: number };
  private readonly logger?: AuditLogger;

  constructor(
    fetcher: HttpFetcher,
    config?: Partial<Pick<AuditPipelineConfig, 'fetchTimeoutMs'>>,
    logger?: AuditLogger,
  ) {
    this.fetcher = fetcher;
    this.config = { fetchTimeoutMs: config?.fetchTimeoutMs ?? DEFAULT_TIMEOUT_MS };
    this.logger = logger;
  }

  /**
   * Fetch and analyze a single URL (AC-1, AC-2).
   *
   * Returns a PageAnalysis with `accessible: false` for inaccessible URLs.
   * Never throws — errors are captured in the result.
   */
  async fetchAndAnalyze(url: string): Promise<PageAnalysis> {
    const baseResult: PageAnalysis = {
      url,
      accessible: false,
      headings: [],
      dominantColors: [],
      fontNames: [],
      imageryDescriptions: [],
      textContent: '',
      fetchedAt: new Date().toISOString(),
    };

    try {
      // Check robots.txt first (NFR-9.9)
      const allowed = await isAllowedByRobotsTxt(url, this.fetcher, this.logger);
      if (!allowed) {
        this.logger?.info(`Skipping ${url} — blocked by robots.txt`);
        return {
          ...baseResult,
          accessError: 'Blocked by robots.txt',
        };
      }

      // Fetch the page with timeout (AC-1)
      const result = await this.fetcher.fetch(url, {
        timeoutMs: this.config.fetchTimeoutMs,
      });

      // Check response status — fetch does NOT throw on HTTP errors
      if (!result.ok) {
        const errorMsg = `HTTP ${result.status} ${result.statusText}`;
        this.logger?.warn(`Inaccessible URL ${url}: ${errorMsg}`);
        return {
          ...baseResult,
          accessError: errorMsg,
        };
      }

      const html = await result.text();

      // Extract content (AC-2)
      const title = extractTitle(html);
      const metaDescription = extractMetaDescription(html);
      const headings = extractHeadings(html);
      const dominantColors = extractColors(html);
      const fontNames = extractFonts(html);
      const textContent = extractTextContent(html);

      return {
        url,
        accessible: true,
        title,
        metaDescription,
        headings,
        dominantColors,
        fontNames,
        imageryDescriptions: [], // Populated later by AI vision analysis
        textContent,
        fetchedAt: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger?.warn(`Failed to fetch ${url}: ${errorMessage}`);

      return {
        ...baseResult,
        accessError: errorMessage,
      };
    }
  }
}
