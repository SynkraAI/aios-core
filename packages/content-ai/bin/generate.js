#!/usr/bin/env node
import { generateImage, ConfigurationError, StabilityApiError, RateLimitError, TimeoutError } from '../stability.js';

const args = process.argv.slice(2);
let prompt = '';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--prompt' && args[i + 1]) {
    prompt = args[i + 1];
    break;
  }
}

if (!prompt) {
  process.stderr.write('Error: --prompt is required\nUsage: node packages/content-ai/bin/generate.js --prompt "your prompt here"\n');
  process.exit(1);
}

try {
  const result = await generateImage(prompt);
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
} catch (err) {
  if (err instanceof ConfigurationError) {
    process.stderr.write(`Configuration error: ${err.message}\n`);
  } else if (err instanceof RateLimitError) {
    process.stderr.write(`Rate limit exceeded: ${err.message}\n`);
  } else if (err instanceof StabilityApiError) {
    process.stderr.write(`API error (${err.statusCode}): ${err.message}\n`);
  } else if (err instanceof TimeoutError) {
    process.stderr.write(`Timeout: ${err.message}\n`);
  } else {
    process.stderr.write(`Unexpected error: ${err.message}\n`);
  }
  process.exit(1);
}
