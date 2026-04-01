/**
 * YouTube Extractor — Transcript + metadata
 * Uses innertube API for transcripts (no API key needed)
 */

import { retry } from '../utils/helpers.js';
import { DEFAULTS } from '../utils/constants.js';

/**
 * Extract YouTube video transcript and metadata
 * @param {string} url - YouTube URL
 * @returns {Promise<{ transcript: string, metadata: object, method: string }>}
 */
export async function extractYoutube(url, options = {}) {
  const videoId = extractVideoId(url);
  if (!videoId) throw new Error(`Invalid YouTube URL: ${url}`);

  const timeout = options.timeout_ms || DEFAULTS.timeout_ms;
  const attempts = options.retry_attempts || DEFAULTS.retry_attempts;

  // Fetch video page for metadata
  const metadata = await retry(
    () => fetchVideoMetadata(videoId, timeout),
    attempts
  );

  // Fetch transcript
  let transcript;
  let method;
  try {
    transcript = await retry(
      () => fetchTranscript(videoId, timeout),
      attempts
    );
    method = 'youtube_captions';
  } catch {
    transcript = null;
    method = 'no_transcript';
  }

  return {
    transcript: transcript || '',
    metadata: {
      video_id: videoId,
      title: metadata.title || '',
      channel: metadata.channel || '',
      duration_seconds: metadata.duration || 0,
      published_at: metadata.published || '',
      description: metadata.description || '',
      chapters: metadata.chapters || [],
      url: `https://www.youtube.com/watch?v=${videoId}`,
    },
    method,
  };
}

function extractVideoId(url) {
  const patterns = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

async function fetchVideoMetadata(videoId, timeout) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(
      `https://www.youtube.com/watch?v=${videoId}`,
      {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AIOX-ETL/1.0)',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        },
      }
    );

    const html = await response.text();

    const title = extractFromHtml(html, /<meta\s+name="title"\s+content="([^"]+)"/i)
      || extractFromHtml(html, /<title>([^<]+)<\/title>/i)
      || '';

    const channel = extractFromHtml(html, /"ownerChannelName":"([^"]+)"/i)
      || extractFromHtml(html, /<link itemprop="name" content="([^"]+)"/i)
      || '';

    const duration = extractDuration(html);
    const published = extractFromHtml(html, /"publishDate":"([^"]+)"/i) || '';
    const description = extractFromHtml(html, /"shortDescription":"((?:[^"\\]|\\.)*)"/i) || '';
    const chapters = extractChapters(description);

    return { title: decodeEntities(title), channel, duration, published, description: cleanDescription(description), chapters };
  } finally {
    clearTimeout(timer);
  }
}

async function fetchTranscript(videoId, timeout) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    // Fetch video page to get innertube params
    const pageResponse = await fetch(
      `https://www.youtube.com/watch?v=${videoId}`,
      {
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AIOX-ETL/1.0)' },
      }
    );
    const html = await pageResponse.text();

    // Try to extract captions from ytInitialPlayerResponse
    const captionsMatch = html.match(/"captions":\s*(\{[\s\S]*?"playerCaptionsTracklistRenderer"[\s\S]*?\})\s*,\s*"/);
    if (!captionsMatch) throw new Error('No captions available');

    // Find caption track URL
    const trackMatch = html.match(/"baseUrl":"(https:\/\/www\.youtube\.com\/api\/timedtext[^"]+)"/);
    if (!trackMatch) throw new Error('No caption track URL found');

    const captionUrl = trackMatch[1].replace(/\\u0026/g, '&');
    const captionResponse = await fetch(captionUrl, { signal: controller.signal });
    const captionText = await captionResponse.text();

    // Parse XML transcript
    return parseTranscriptXml(captionText);
  } finally {
    clearTimeout(timer);
  }
}

function parseTranscriptXml(xml) {
  const segments = [];
  const regex = /<text start="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g;
  let match;

  while ((match = regex.exec(xml)) !== null) {
    const start = parseFloat(match[1]);
    const text = decodeEntities(match[2].replace(/<[^>]+>/g, '').trim());
    if (text) {
      segments.push({ start, text });
    }
  }

  return segments
    .map(s => `[${formatTimestamp(s.start)}] ${s.text}`)
    .join('\n');
}

function formatTimestamp(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function extractFromHtml(html, regex) {
  const m = html.match(regex);
  return m ? m[1] : null;
}

function extractDuration(html) {
  const match = html.match(/"lengthSeconds":"(\d+)"/);
  return match ? parseInt(match[1], 10) : 0;
}

function extractChapters(description) {
  if (!description) return [];
  const lines = description.split(/\\n|\n/);
  const chapters = [];
  for (const line of lines) {
    const m = line.match(/^(\d{1,2}:\d{2}(?::\d{2})?)\s+(.+)/);
    if (m) {
      chapters.push({ timestamp: m[1], title: m[2].trim() });
    }
  }
  return chapters;
}

function cleanDescription(desc) {
  if (!desc) return '';
  return desc
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
    .trim();
}

function decodeEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ');
}
