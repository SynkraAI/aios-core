/**
 * ETL Squad — Constants & Defaults
 */

export const DEFAULTS = {
  timeout_ms: 30000,
  retry_attempts: 3,
  retry_delay_ms: 1000,
  chunk_size: 500,
  chunk_overlap: 50,
  min_chunk_size: 100,
  output_format: 'markdown',
  cache_enabled: true,
  cache_ttl_hours: 24,
  parallel_workers: 3,
  max_parallel: 10,
  rate_limit_ms: 1000,
};

export const QUALITY = {
  min_quality_score: 0.6,
  min_content_length: 100,
  max_noise_ratio: 0.3,
};

export const SOURCE_TYPES = {
  webpage: 'webpage',
  youtube: 'youtube',
  vimeo: 'vimeo',
  twitter: 'twitter',
  linkedin: 'linkedin',
  medium: 'medium',
  substack: 'substack',
  github: 'github',
  rss_feed: 'rss_feed',
  sitemap: 'sitemap',
  pdf: 'pdf',
  docx: 'docx',
  pptx: 'pptx',
  xlsx: 'xlsx',
  text: 'text',
  html_local: 'html_local',
  structured_data: 'structured_data',
  audio: 'audio',
  image: 'image',
  epub: 'epub',
  zip: 'zip',
};

export const PIPELINES = {
  'url-to-markdown': { phase: 1, output: 'markdown' },
  'youtube-to-brief': { phase: 1, output: 'markdown' },
  'pdf-to-knowledge': { phase: 1, output: 'markdown' },
  'spreadsheet-to-json': { phase: 2, output: 'yaml' },
  'deck-to-text': { phase: 2, output: 'markdown' },
  'audio-to-transcript': { phase: 2, output: 'markdown' },
  'image-to-text': { phase: 2, output: 'markdown' },
  'feed-to-items': { phase: 3, output: 'yaml' },
  'repo-to-context': { phase: 3, output: 'markdown' },
  'batch-urls': { phase: 3, output: 'directory' },
};

export const URL_PATTERNS = [
  { pattern: /youtube\.com\/watch|youtu\.be\//i, pipeline: 'youtube-to-brief', type: 'youtube' },
  { pattern: /github\.com\/[^/]+\/[^/]+/i, pipeline: 'repo-to-context', type: 'github' },
  { pattern: /vimeo\.com\//i, pipeline: 'youtube-to-brief', type: 'vimeo' },
  { pattern: /twitter\.com\/|x\.com\//i, pipeline: 'url-to-markdown', type: 'twitter' },
  { pattern: /linkedin\.com\/(posts|pulse)\//i, pipeline: 'url-to-markdown', type: 'linkedin' },
  { pattern: /medium\.com/i, pipeline: 'url-to-markdown', type: 'medium' },
  { pattern: /\.substack\.com/i, pipeline: 'url-to-markdown', type: 'substack' },
];

export const EXT_MAP = {
  '.pdf': { pipeline: 'pdf-to-knowledge', type: 'pdf' },
  '.epub': { pipeline: 'pdf-to-knowledge', type: 'epub' },
  '.xlsx': { pipeline: 'spreadsheet-to-json', type: 'xlsx' },
  '.xls': { pipeline: 'spreadsheet-to-json', type: 'xlsx' },
  '.csv': { pipeline: 'spreadsheet-to-json', type: 'xlsx' },
  '.tsv': { pipeline: 'spreadsheet-to-json', type: 'xlsx' },
  '.pptx': { pipeline: 'deck-to-text', type: 'pptx' },
  '.ppt': { pipeline: 'deck-to-text', type: 'pptx' },
  '.mp3': { pipeline: 'audio-to-transcript', type: 'audio' },
  '.mp4': { pipeline: 'audio-to-transcript', type: 'audio' },
  '.wav': { pipeline: 'audio-to-transcript', type: 'audio' },
  '.m4a': { pipeline: 'audio-to-transcript', type: 'audio' },
  '.ogg': { pipeline: 'audio-to-transcript', type: 'audio' },
  '.flac': { pipeline: 'audio-to-transcript', type: 'audio' },
  '.jpg': { pipeline: 'image-to-text', type: 'image' },
  '.jpeg': { pipeline: 'image-to-text', type: 'image' },
  '.png': { pipeline: 'image-to-text', type: 'image' },
  '.gif': { pipeline: 'image-to-text', type: 'image' },
  '.webp': { pipeline: 'image-to-text', type: 'image' },
  '.svg': { pipeline: 'image-to-text', type: 'image' },
  '.md': { pipeline: 'url-to-markdown', type: 'text' },
  '.txt': { pipeline: 'url-to-markdown', type: 'text' },
  '.rst': { pipeline: 'url-to-markdown', type: 'text' },
  '.html': { pipeline: 'url-to-markdown', type: 'html_local' },
  '.htm': { pipeline: 'url-to-markdown', type: 'html_local' },
  '.docx': { pipeline: 'url-to-markdown', type: 'docx' },
  '.doc': { pipeline: 'url-to-markdown', type: 'docx' },
  '.json': { pipeline: 'spreadsheet-to-json', type: 'structured_data' },
  '.yaml': { pipeline: 'spreadsheet-to-json', type: 'structured_data' },
  '.yml': { pipeline: 'spreadsheet-to-json', type: 'structured_data' },
  '.toml': { pipeline: 'spreadsheet-to-json', type: 'structured_data' },
  '.xml': { pipeline: 'feed-to-items', type: 'structured_data' },
  '.zip': { pipeline: 'batch-urls', type: 'zip' },
};

export const NOISE_PATTERNS = [
  /subscribe\s+(to\s+)?newsletter/gi,
  /share\s+(this|on)\s+(twitter|facebook|linkedin)/gi,
  /cookie\s+(policy|consent|banner)/gi,
  /related\s+(posts|articles)/gi,
  /leave\s+a\s+(comment|reply)/gi,
  /sign\s+up\s+(for|to)/gi,
  /follow\s+us\s+on/gi,
  /advertisement/gi,
  /sponsored\s+content/gi,
];
