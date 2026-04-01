/**
 * HTML to Markdown Parser
 * Converts HTML content to clean markdown following output-format-spec.md rules
 */

import { cleanText, cleanUrl, stripHtml } from '../utils/helpers.js';

/**
 * Convert HTML to clean markdown
 * @param {string} html - Raw HTML content
 * @param {string} [baseUrl] - Base URL for resolving relative links
 * @returns {{ markdown: string, stats: { sections: number, tables: number, links: number, images: number } }}
 */
export function htmlToMarkdown(html, baseUrl = '') {
  if (!html) return { markdown: '', stats: { sections: 0, tables: 0, links: 0, images: 0 } };

  let md = html;
  const stats = { sections: 0, tables: 0, links: 0, images: 0 };

  // Remove scripts, styles, comments
  md = md.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  md = md.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  md = md.replace(/<!--[\s\S]*?-->/g, '');

  // Headings
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, content) => {
    stats.sections++;
    return `\n# ${stripInlineTags(content).trim()}\n`;
  });
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, content) => {
    stats.sections++;
    return `\n## ${stripInlineTags(content).trim()}\n`;
  });
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, content) => {
    stats.sections++;
    return `\n### ${stripInlineTags(content).trim()}\n`;
  });
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_, c) => `\n#### ${stripInlineTags(c).trim()}\n`);
  md = md.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, (_, c) => `\n##### ${stripInlineTags(c).trim()}\n`);
  md = md.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, (_, c) => `\n###### ${stripInlineTags(c).trim()}\n`);

  // Images
  md = md.replace(/<img[^>]*src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*\/?>/gi, (_, src, alt) => {
    stats.images++;
    const resolvedSrc = resolveUrl(src, baseUrl);
    return `![${alt || 'image'}](${resolvedSrc})`;
  });
  md = md.replace(/<img[^>]*alt=["']([^"']*)["'][^>]*src=["']([^"']+)["'][^>]*\/?>/gi, (_, alt, src) => {
    stats.images++;
    const resolvedSrc = resolveUrl(src, baseUrl);
    return `![${alt || 'image'}](${resolvedSrc})`;
  });
  // img without alt
  md = md.replace(/<img[^>]*src=["']([^"']+)["'][^>]*\/?>/gi, (_, src) => {
    stats.images++;
    return `![image](${resolveUrl(src, baseUrl)})`;
  });

  // Links
  md = md.replace(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => {
    stats.links++;
    const cleanedUrl = cleanUrl(resolveUrl(href, baseUrl));
    const linkText = stripInlineTags(text).trim();
    return `[${linkText}](${cleanedUrl})`;
  });

  // Bold & Italic
  md = md.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, c) => `**${c.trim()}**`);
  md = md.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, c) => `*${c.trim()}*`);

  // Code
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_, c) => `\`${c.trim()}\``);
  md = md.replace(/<pre[^>]*><code[^>]*class=["'](?:language-)?(\w+)["'][^>]*>([\s\S]*?)<\/code><\/pre>/gi,
    (_, lang, code) => `\n\`\`\`${lang}\n${decodeHtmlEntities(code.trim())}\n\`\`\`\n`);
  md = md.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_, code) =>
    `\n\`\`\`\n${decodeHtmlEntities(stripHtml(code).trim())}\n\`\`\`\n`);

  // Blockquotes
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, content) => {
    const lines = stripInlineTags(content).trim().split('\n');
    return '\n' + lines.map(l => `> ${l.trim()}`).join('\n') + '\n';
  });

  // Lists
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, content) => {
    return '\n' + content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, item) =>
      `- ${stripInlineTags(item).trim()}`
    ).trim() + '\n';
  });
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, content) => {
    let i = 0;
    return '\n' + content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, item) =>
      `${++i}. ${stripInlineTags(item).trim()}`
    ).trim() + '\n';
  });

  // Tables
  md = md.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_, tableHtml) => {
    stats.tables++;
    return '\n' + parseTable(tableHtml) + '\n';
  });

  // Paragraphs & breaks
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, content) => `\n${content.trim()}\n`);
  md = md.replace(/<hr\s*\/?>/gi, '\n---\n');

  // Remove remaining HTML tags
  md = md.replace(/<[^>]+>/g, '');

  // Decode HTML entities
  md = decodeHtmlEntities(md);

  // Clean up
  md = cleanText(md);

  return { markdown: md, stats };
}

function stripInlineTags(html) {
  return html.replace(/<[^>]+>/g, '').trim();
}

function resolveUrl(href, baseUrl) {
  if (!href || href.startsWith('http') || href.startsWith('//') || href.startsWith('mailto:')) {
    return href;
  }
  if (baseUrl) {
    try {
      return new URL(href, baseUrl).toString();
    } catch {
      return href;
    }
  }
  return href;
}

function parseTable(tableHtml) {
  const rows = [];
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;

  while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
    const cells = [];
    const cellRegex = /<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi;
    let cellMatch;
    while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
      cells.push(stripInlineTags(cellMatch[1]).trim());
    }
    if (cells.length > 0) rows.push(cells);
  }

  if (rows.length === 0) return '';

  const header = rows[0];
  const separator = header.map(() => '---');
  const dataRows = rows.slice(1);

  const lines = [
    '| ' + header.join(' | ') + ' |',
    '| ' + separator.join(' | ') + ' |',
    ...dataRows.map(r => '| ' + r.join(' | ') + ' |'),
  ];

  return lines.join('\n');
}

function decodeHtmlEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)));
}
