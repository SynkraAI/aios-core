import { randomBytes } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { dirname, extname } from 'path';

/**
 * Generate unique job ID
 */
export function generateJobId(prefix = 'etl') {
  const hex = randomBytes(4).toString('hex');
  return `${prefix}_${hex}`;
}

/**
 * Create slug from title or URL
 */
export function slugify(text, maxLength = 50) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLength);
}

/**
 * Get today's date as YYYY-MM-DD
 */
export function dateStamp() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get ISO 8601 timestamp
 */
export function timestamp() {
  return new Date().toISOString();
}

/**
 * Estimate token count from text
 */
export function estimateTokens(text, language = 'en') {
  const wordCount = countWords(text);
  const multiplier = language === 'pt' ? 1.5 : 1.3;
  return Math.round(wordCount * multiplier);
}

/**
 * Count words in text
 */
export function countWords(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Detect language from text (simple heuristic)
 */
export function detectLanguage(text) {
  if (!text || text.length < 50) return 'unknown';
  const sample = text.slice(0, 2000).toLowerCase();

  const ptMarkers = ['que', 'para', 'com', 'uma', 'como', 'mais', 'sobre', 'esta', 'pode', 'seu'];
  const enMarkers = ['the', 'and', 'for', 'that', 'with', 'this', 'from', 'have', 'are', 'was'];

  const ptScore = ptMarkers.filter(w => new RegExp(`\\b${w}\\b`).test(sample)).length;
  const enScore = enMarkers.filter(w => new RegExp(`\\b${w}\\b`).test(sample)).length;

  if (ptScore > enScore) return 'pt';
  if (enScore > ptScore) return 'en';
  return 'en';
}

/**
 * Ensure directory exists
 */
export function ensureDir(filePath) {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

/**
 * Get file extension (lowercase, with dot)
 */
export function getExtension(filePath) {
  return extname(filePath).toLowerCase();
}

/**
 * Check if string is a URL
 */
export function isUrl(source) {
  return /^https?:\/\//i.test(source);
}

/**
 * Sleep for ms
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with delay
 */
export async function retry(fn, attempts = 3, delayMs = 1000) {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === attempts - 1) throw error;
      await sleep(delayMs);
    }
  }
}

/**
 * Strip HTML tags from string
 */
export function stripHtml(html) {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Clean text: normalize encoding, fix common issues
 */
export function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/\uFFFD/g, '')           // Remove replacement chars
    .replace(/\u0000/g, '')           // Remove null bytes
    .replace(/\r\n/g, '\n')          // Normalize line endings
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')      // Max 2 consecutive newlines
    .replace(/[\u2018\u2019]/g, "'") // Smart quotes → straight
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2013/g, '-')         // En dash
    .replace(/\u2014/g, '--')        // Em dash
    .replace(/\u2026/g, '...')       // Ellipsis
    .replace(/[ \t]+$/gm, '')        // Trailing whitespace
    .trim();
}

/**
 * Remove UTM and tracking parameters from URL
 */
export function cleanUrl(url) {
  try {
    const u = new URL(url);
    const keysToRemove = [];
    for (const key of u.searchParams.keys()) {
      if (key.startsWith('utm_') || key.startsWith('fbclid') || key.startsWith('gclid')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => u.searchParams.delete(k));
    return u.toString();
  } catch {
    return url;
  }
}

/**
 * Calculate noise ratio in text
 */
export function calculateNoiseRatio(rawLength, cleanLength) {
  if (rawLength === 0) return 0;
  return Math.round((1 - cleanLength / rawLength) * 100) / 100;
}
