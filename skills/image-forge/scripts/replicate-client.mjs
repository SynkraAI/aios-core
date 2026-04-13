// image-forge — Replicate client
// Thin zero-dep wrapper over the Replicate REST API using Node's global fetch.
// Docs: https://replicate.com/docs/reference/http

'use strict';

const REPLICATE_API = 'https://api.replicate.com/v1';
const POLL_INTERVAL_MS = 2000;
const DEFAULT_TIMEOUT_MS = 180000; // 3 min per prediction

/**
 * Build the per-model input payload.
 * Replicate normalizes most Flux/Ideogram/Recraft inputs but each has quirks.
 */
function buildModelInput(model, prompt, aspectRatio, extras = {}) {
  const base = { prompt };

  if (model.startsWith('ideogram-ai/')) {
    return {
      ...base,
      aspect_ratio: aspectRatio,
      magic_prompt_option: 'Off', // keep user prompt verbatim (crucial for pt-BR)
      ...extras,
    };
  }

  if (model.startsWith('black-forest-labs/flux')) {
    return {
      ...base,
      aspect_ratio: aspectRatio,
      output_format: 'png',
      output_quality: 95,
      safety_tolerance: 5,
      ...extras,
    };
  }

  if (model.startsWith('recraft-ai/recraft')) {
    // Recraft uses explicit sizes, not ratios. Map on the fly.
    const sizeMap = {
      '16:9': '1820x1024',
      '9:16': '1024x1820',
      '1:1': '1024x1024',
      '4:3': '1365x1024',
      '3:4': '1024x1365',
    };
    return {
      ...base,
      size: sizeMap[aspectRatio] ?? '1024x1024',
      style: 'realistic_image',
      ...extras,
    };
  }

  // Unknown family — best-effort pass-through.
  return { ...base, aspect_ratio: aspectRatio, ...extras };
}

async function httpJson(url, opts, token) {
  const res = await fetch(url, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(opts?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const err = new Error(
      `Replicate ${opts?.method ?? 'GET'} ${url} → ${res.status}: ${body.slice(0, 400)}`,
    );
    err.status = res.status;
    err.body = body;
    throw err;
  }

  return res.json();
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Create a prediction, poll until it finishes, return the output URL(s).
 *
 * @param {object} params
 * @param {string} params.token          REPLICATE_API_TOKEN
 * @param {string} params.model          e.g. 'black-forest-labs/flux-1.1-pro'
 * @param {string} params.prompt
 * @param {string} params.aspectRatio    e.g. '16:9'
 * @param {object} [params.extras]       Model-specific overrides merged into input.
 * @param {number} [params.timeoutMs]    Hard timeout for this prediction.
 * @returns {Promise<{ outputUrl: string, predictionId: string, latencyMs: number }>}
 */
export async function runPrediction({
  token,
  model,
  prompt,
  aspectRatio,
  extras = {},
  timeoutMs = DEFAULT_TIMEOUT_MS,
}) {
  if (!token) {
    throw new Error('runPrediction: missing REPLICATE_API_TOKEN');
  }
  if (!model || !prompt) {
    throw new Error('runPrediction: model and prompt are required');
  }

  const input = buildModelInput(model, prompt, aspectRatio, extras);
  const startedAt = Date.now();

  // POST /models/{owner}/{name}/predictions — uses the default version.
  const createUrl = `${REPLICATE_API}/models/${model}/predictions`;
  let prediction;
  try {
    prediction = await httpJson(
      createUrl,
      { method: 'POST', body: JSON.stringify({ input }) },
      token,
    );
  } catch (err) {
    throw new Error(
      `replicate-client: failed to create prediction for ${model}: ${err.message}`,
    );
  }

  const predictionId = prediction.id;
  const pollUrl = prediction.urls?.get ?? `${REPLICATE_API}/predictions/${predictionId}`;

  // Poll until terminal state or timeout.
  while (true) {
    if (Date.now() - startedAt > timeoutMs) {
      throw new Error(
        `replicate-client: prediction ${predictionId} timed out after ${timeoutMs}ms`,
      );
    }

    const status = prediction.status;
    if (status === 'succeeded') break;
    if (status === 'failed' || status === 'canceled') {
      throw new Error(
        `replicate-client: prediction ${predictionId} ${status}: ${prediction.error ?? 'no error detail'}`,
      );
    }

    await sleep(POLL_INTERVAL_MS);
    try {
      prediction = await httpJson(pollUrl, { method: 'GET' }, token);
    } catch (err) {
      throw new Error(
        `replicate-client: failed to poll prediction ${predictionId}: ${err.message}`,
      );
    }
  }

  // `output` may be a string, an array of strings, or an object. Normalize.
  const output = prediction.output;
  let outputUrl;
  if (typeof output === 'string') {
    outputUrl = output;
  } else if (Array.isArray(output) && output.length > 0) {
    outputUrl = output[0];
  } else if (output && typeof output === 'object' && typeof output.url === 'string') {
    outputUrl = output.url;
  } else {
    throw new Error(
      `replicate-client: unexpected output shape for ${model}: ${JSON.stringify(output).slice(0, 200)}`,
    );
  }

  return {
    outputUrl,
    predictionId,
    latencyMs: Date.now() - startedAt,
  };
}

/**
 * Download a URL into a Buffer.
 */
export async function downloadBinary(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`downloadBinary: ${res.status} ${res.statusText} for ${url}`);
  }
  const arrayBuf = await res.arrayBuffer();
  return Buffer.from(arrayBuf);
}

/**
 * Retry wrapper with exponential backoff for transient failures.
 */
export async function withRetry(fn, { retries = 3, baseDelayMs = 2000, label = 'op' } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      // Non-retryable client errors
      if (err.status && err.status >= 400 && err.status < 500 && err.status !== 429) {
        throw err;
      }
      if (attempt === retries) break;
      const delay = baseDelayMs * Math.pow(2, attempt);
      process.stderr.write(
        `  ⚠️  ${label} attempt ${attempt + 1}/${retries + 1} failed: ${err.message}\n` +
          `     retrying in ${delay}ms...\n`,
      );
      await sleep(delay);
    }
  }
  throw lastErr;
}
