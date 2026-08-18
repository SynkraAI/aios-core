import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { generateImage, StabilityApiError, RateLimitError, TimeoutError, ConfigurationError } from '../stability.js';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

// Minimal PNG buffer with IHDR chunk for dimension parsing
function makePngBuffer(width = 1024, height = 1024) {
  const buf = Buffer.alloc(100);
  // PNG signature (8 bytes)
  buf[0] = 0x89; buf[1] = 0x50; buf[2] = 0x4e; buf[3] = 0x47;
  buf[4] = 0x0d; buf[5] = 0x0a; buf[6] = 0x1a; buf[7] = 0x0a;
  // IHDR chunk: length=13, type='IHDR', width (BE), height (BE)
  buf.writeUInt32BE(13, 8);
  buf[12] = 0x49; buf[13] = 0x48; buf[14] = 0x44; buf[15] = 0x52;
  buf.writeUInt32BE(width, 16);
  buf.writeUInt32BE(height, 20);
  return buf;
}

function makeSuccessResponse(width = 1024, height = 1024) {
  const png = makePngBuffer(width, height);
  return {
    ok: true,
    status: 200,
    headers: { get: () => null },
    arrayBuffer: async () => {
      const ab = new ArrayBuffer(png.length);
      new Uint8Array(ab).set(png);
      return ab;
    },
  };
}

function makeErrorResponse(status, body = '') {
  return {
    ok: false,
    status,
    headers: { get: () => null },
    text: async () => body,
  };
}

function make429Response(retryAfterSeconds = null) {
  return {
    ok: false,
    status: 429,
    headers: {
      get: (name) =>
        name.toLowerCase() === 'retry-after'
          ? (retryAfterSeconds !== null ? String(retryAfterSeconds) : null)
          : null,
    },
    text: async () => 'Rate limit exceeded',
  };
}

let savedFetch;
let savedApiKey;
let tmpDir;

describe('generateImage', () => {
  beforeEach(async () => {
    savedFetch = globalThis.fetch;
    savedApiKey = process.env.STABILITY_API_KEY;
    process.env.STABILITY_API_KEY = 'sk-test-key-123';
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'stability-test-'));
  });

  afterEach(async () => {
    globalThis.fetch = savedFetch;
    if (savedApiKey === undefined) {
      delete process.env.STABILITY_API_KEY;
    } else {
      process.env.STABILITY_API_KEY = savedApiKey;
    }
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  test('success: retorna metadados corretos e salva arquivo em disco', async () => {
    globalThis.fetch = async () => makeSuccessResponse(1024, 1024);

    const result = await generateImage('pôr do sol na praia', { outputDir: tmpDir });

    assert.equal(result.prompt, 'pôr do sol na praia');
    assert.equal(result.model, 'sd3.5-large');
    assert.equal(result.width, 1024);
    assert.equal(result.height, 1024);
    assert.ok(result.path.startsWith(tmpDir));
    assert.ok(/^image-\d{4}-\d{2}-\d{2}-\d{6}-[a-f0-9]{8}\.png$/.test(result.filename));
    assert.ok(typeof result.generatedAt === 'string');
    assert.ok(result.durationMs >= 0);

    const fileExists = await fs.access(result.path).then(() => true).catch(() => false);
    assert.ok(fileExists, 'arquivo PNG deve existir em disco');
  });

  test('ConfigurationError quando STABILITY_API_KEY está ausente', async () => {
    delete process.env.STABILITY_API_KEY;

    await assert.rejects(
      () => generateImage('test', { outputDir: tmpDir }),
      (err) => {
        assert.ok(
          err instanceof ConfigurationError,
          `esperado ConfigurationError, recebido ${err.constructor.name}`,
        );
        return true;
      },
    );
  });

  test('ConfigurationError quando prompt é vazio', async () => {
    await assert.rejects(
      () => generateImage('', { outputDir: tmpDir }),
      (err) => {
        assert.ok(
          err instanceof ConfigurationError,
          `esperado ConfigurationError, recebido ${err.constructor.name}`,
        );
        return true;
      },
    );
  });

  test('429 → aguarda Retry-After → sucesso no segundo attempt', async () => {
    let callCount = 0;
    globalThis.fetch = async () => {
      callCount++;
      if (callCount === 1) return make429Response(0);
      return makeSuccessResponse();
    };

    const result = await generateImage('test prompt', { outputDir: tmpDir });
    assert.equal(callCount, 2, 'deve realizar exatamente 2 chamadas (inicial + retry)');
    assert.ok(result.path, 'deve retornar path do arquivo gerado');
  });

  test('429 duas vezes → lança RateLimitError', async () => {
    globalThis.fetch = async () => make429Response(0);

    await assert.rejects(
      () => generateImage('test prompt', { outputDir: tmpDir }),
      (err) => {
        assert.ok(
          err instanceof RateLimitError,
          `esperado RateLimitError, recebido ${err.constructor.name}`,
        );
        return true;
      },
    );
  });

  test('500 → lança StabilityApiError sem retry', async () => {
    let callCount = 0;
    globalThis.fetch = async () => {
      callCount++;
      return makeErrorResponse(500, 'Internal Server Error');
    };

    await assert.rejects(
      () => generateImage('test prompt', { outputDir: tmpDir }),
      (err) => {
        assert.ok(
          err instanceof StabilityApiError,
          `esperado StabilityApiError, recebido ${err.constructor.name}`,
        );
        assert.equal(err.statusCode, 500);
        return true;
      },
    );
    assert.equal(callCount, 1, 'não deve fazer retry em erro 500');
  });

  test('timeout → lança TimeoutError', async () => {
    globalThis.fetch = () =>
      new Promise((_, reject) => {
        setTimeout(() => {
          const err = new Error('The operation was aborted');
          err.name = 'AbortError';
          reject(err);
        }, 50);
      });

    await assert.rejects(
      () => generateImage('test prompt', { outputDir: tmpDir }),
      (err) => {
        assert.ok(
          err instanceof TimeoutError,
          `esperado TimeoutError, recebido ${err.constructor.name}`,
        );
        return true;
      },
    );
  });

  test('diretório de output criado automaticamente se não existir', async () => {
    const deepDir = path.join(tmpDir, 'nested', 'subdir', 'images');
    globalThis.fetch = async () => makeSuccessResponse();

    const result = await generateImage('test', { outputDir: deepDir });

    const dirExists = await fs.access(deepDir).then(() => true).catch(() => false);
    assert.ok(dirExists, 'diretório aninhado deve ser criado automaticamente');
    assert.ok(result.path.startsWith(deepDir));
  });
});
