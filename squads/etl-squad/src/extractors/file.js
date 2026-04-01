/**
 * File Extractor — Local files (text, markdown, HTML, structured data)
 */

import { readFileSync } from 'fs';
import { getExtension } from '../utils/helpers.js';

/**
 * Extract content from local file
 * @param {string} filePath
 * @returns {{ content: string, metadata: object, method: string }}
 */
export function extractFile(filePath) {
  const ext = getExtension(filePath);
  const rawContent = readFileSync(filePath, 'utf-8');

  const metadata = {
    file_path: filePath,
    extension: ext,
    size_bytes: Buffer.byteLength(rawContent, 'utf-8'),
    fetched_at: new Date().toISOString(),
  };

  switch (ext) {
    case '.md':
    case '.txt':
    case '.rst':
      return { content: rawContent, metadata, method: 'direct_read' };

    case '.html':
    case '.htm':
      return { content: rawContent, metadata, method: 'html_read' };

    case '.json':
      return { content: rawContent, metadata: { ...metadata, parsed: true }, method: 'json_read' };

    case '.yaml':
    case '.yml':
      return { content: rawContent, metadata: { ...metadata, parsed: true }, method: 'yaml_read' };

    case '.csv':
    case '.tsv':
      return { content: rawContent, metadata, method: 'csv_read' };

    case '.xml':
      return { content: rawContent, metadata, method: 'xml_read' };

    default:
      // Try as text
      return { content: rawContent, metadata, method: 'text_fallback' };
  }
}

/**
 * Extract PDF content using pdf-parse (if available) or basic text extraction
 * @param {string} filePath
 * @returns {Promise<{ content: string, metadata: object, method: string }>}
 */
export async function extractPdf(filePath) {
  const buffer = readFileSync(filePath);
  const metadata = {
    file_path: filePath,
    size_bytes: buffer.length,
    fetched_at: new Date().toISOString(),
  };

  try {
    // Try pdf-parse (must be installed: npm install pdf-parse)
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(buffer);

    return {
      content: data.text,
      metadata: {
        ...metadata,
        page_count: data.numpages,
        title: data.info?.Title || '',
        author: data.info?.Author || '',
        creation_date: data.info?.CreationDate || '',
      },
      method: 'pdf-parse',
    };
  } catch {
    // Fallback: basic text extraction from PDF stream
    const text = extractTextFromPdfBuffer(buffer);
    return {
      content: text,
      metadata: { ...metadata, extraction_note: 'pdf-parse not available, basic extraction used' },
      method: 'basic_pdf',
    };
  }
}

/**
 * Basic PDF text extraction (fallback when pdf-parse not installed)
 */
function extractTextFromPdfBuffer(buffer) {
  const text = buffer.toString('utf-8');
  const matches = [];
  // Extract text between BT/ET operators (basic PDF text extraction)
  const regex = /\(([^)]+)\)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const decoded = match[1]
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '')
      .replace(/\\\(/g, '(')
      .replace(/\\\)/g, ')')
      .replace(/\\\\/g, '\\');
    if (decoded.length > 2 && /[a-zA-Z]/.test(decoded)) {
      matches.push(decoded);
    }
  }
  return matches.join(' ');
}
