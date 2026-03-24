/**
 * Table of Contents Generator
 *
 * Extracts H2/H3 headings from HTML content and generates
 * a nested ToC structure for blog post templates.
 *
 * Uses node-html-parser for build-time extraction.
 */

import { parse as parseHTML } from 'node-html-parser';

/**
 * A single ToC entry representing an H2 heading.
 */
export interface TocEntry {
  /** Anchor ID for the heading */
  readonly id: string;
  /** Heading text content */
  readonly text: string;
  /** Child H3 entries under this H2 */
  readonly children: TocChild[];
}

/**
 * A child ToC entry representing an H3 heading.
 */
export interface TocChild {
  /** Anchor ID for the heading */
  readonly id: string;
  /** Heading text content */
  readonly text: string;
}

/**
 * Slugify a heading text into a valid HTML id attribute.
 *
 * @param text - Heading text
 * @returns URL-safe slug
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Extract a table of contents from HTML content.
 *
 * Scans for H2 and H3 elements, generates IDs for them,
 * and returns a nested structure. Also modifies the HTML
 * to inject id attributes on headings that lack them.
 *
 * @param htmlContent - Raw HTML content string
 * @returns Object with toc entries and modified HTML with heading IDs
 */
export function generateToc(htmlContent: string): {
  toc: TocEntry[];
  html: string;
} {
  const root = parseHTML(htmlContent);
  const headings = root.querySelectorAll('h2, h3');
  const toc: TocEntry[] = [];
  let currentH2: TocEntry | null = null;

  for (const heading of headings) {
    const tagName = heading.tagName.toLowerCase();
    const text = heading.textContent.trim();

    if (!text) continue;

    // Generate or use existing id
    let id = heading.getAttribute('id');
    if (!id) {
      id = slugify(text);
      heading.setAttribute('id', id);
    }

    if (tagName === 'h2') {
      currentH2 = { id, text, children: [] };
      toc.push(currentH2);
    } else if (tagName === 'h3' && currentH2) {
      currentH2.children.push({ id, text });
    } else if (tagName === 'h3') {
      // H3 without a preceding H2 — create a top-level entry
      toc.push({ id, text, children: [] });
    }
  }

  return {
    toc,
    html: root.toString(),
  };
}
