import fs from 'node:fs/promises';
import path from 'node:path';

const STABILITY_API_URL = 'https://api.stability.ai/v2beta/stable-image/generate/sd3';
const MODEL = 'sd3.5-large';
const TIMEOUT_MS = 30_000;
const RETRY_AFTER_DEFAULT_MS = 10_000;

export class StabilityApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'StabilityApiError';
    this.statusCode = statusCode;
  }
}

export class RateLimitError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class TimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class ConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

function _validateConfig() {
  if (!process.env.STABILITY_API_KEY) {
    throw new ConfigurationError(
      'STABILITY_API_KEY environment variable is required but not set',
    );
  }
  return process.env.STABILITY_API_KEY;
}

function _buildRequestBody(prompt) {
  const body = new FormData();
  body.append('prompt', prompt);
  body.append('model', MODEL);
  body.append('aspect_ratio', '1:1');
  body.append('output_format', 'png');
  return body;
}

async function _callApi(requestBody, apiKey) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(STABILITY_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'image/*',
      },
      body: requestBody,
      signal: controller.signal,
    });
    return response;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new TimeoutError('Stability AI API did not respond within 30 seconds');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function _handleApiError(response) {
  let message = `Stability AI API error: HTTP ${response.status}`;
  try {
    const text = await response.text();
    if (text) {
      message += ` — ${text.slice(0, 200)}`;
    }
  } catch {
    // ignore read errors on error response body
  }
  throw new StabilityApiError(message, response.status);
}

async function _callWithRetry(prompt, apiKey) {
  const requestBody = _buildRequestBody(prompt);
  const response = await _callApi(requestBody, apiKey);

  if (response.status === 429) {
    const retryAfterHeader = response.headers.get('Retry-After');
    const waitMs = retryAfterHeader
      ? parseInt(retryAfterHeader, 10) * 1000
      : RETRY_AFTER_DEFAULT_MS;

    _log({ event: 'stability.rate_limit.retry', waitMs, ts: new Date().toISOString() });
    await new Promise((resolve) => setTimeout(resolve, waitMs));

    const retryBody = _buildRequestBody(prompt);
    const retryResponse = await _callApi(retryBody, apiKey);
    if (!retryResponse.ok) {
      if (retryResponse.status === 429) {
        throw new RateLimitError('Stability AI rate limit exceeded after 1 retry');
      }
      await _handleApiError(retryResponse);
    }
    return retryResponse;
  }

  if (!response.ok) {
    await _handleApiError(response);
  }

  return response;
}

async function _ensureOutputDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

function _generateFilename() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const datePart = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const timePart = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  // crypto.randomUUID() is available globally in Node 18+ (Web Crypto API)
  const shortId = crypto.randomUUID().replace(/-/g, '').slice(0, 8);
  return `image-${datePart}-${timePart}-${shortId}.png`;
}

function _parsePngDimensions(buffer) {
  // PNG IHDR: bytes 16-19 = width, 20-23 = height (big-endian uint32)
  if (buffer.length < 24) {
    return { width: 0, height: 0 };
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function _log(data) {
  console.log(JSON.stringify(data));
}

export async function generateImage(prompt, options = {}) {
  const apiKey = _validateConfig();

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    throw new ConfigurationError('prompt must be a non-empty string');
  }

  const startedAt = Date.now();

  _log({
    event: 'stability.generate.start',
    prompt: prompt.slice(0, 200),
    model: MODEL,
    aspect_ratio: '1:1',
    ts: new Date().toISOString(),
  });

  let response;
  try {
    response = await _callWithRetry(prompt, apiKey);
  } catch (err) {
    _log({
      event: 'stability.generate.error',
      errorType: err.name,
      message: err.message,
      statusCode: err.statusCode,
      ts: new Date().toISOString(),
    });
    throw err;
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const { width, height } = _parsePngDimensions(buffer);

  const outputDir = options.outputDir
    ? path.resolve(options.outputDir)
    : path.resolve(process.cwd(), 'output', 'images');
  await _ensureOutputDir(outputDir);

  const filename = _generateFilename();
  const filePath = path.join(outputDir, filename);
  await fs.writeFile(filePath, buffer);

  const durationMs = Date.now() - startedAt;
  const generatedAt = new Date().toISOString();

  _log({
    event: 'stability.generate.success',
    path: filePath,
    filename,
    durationMs,
    ts: generatedAt,
  });

  return {
    path: filePath,
    filename,
    prompt,
    model: MODEL,
    width,
    height,
    generatedAt,
    durationMs,
  };
}
