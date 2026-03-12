# Evolution WhatsApp API Tool

Reusable WhatsApp messaging tool via [Evolution API](https://doc.evolution-api.com/) v2. Zero external dependencies — uses Node.js built-in `fetch`.

## Setup

```bash
cd tools/evolution-whatsapp-api
npm install  # only installs jest for testing
```

Copy `.env.example` to `.env` and fill in your credentials:

```
EVOLUTION_API_URL=https://your-evolution-api.example.com
EVOLUTION_API_KEY=your-api-key
EVOLUTION_INSTANCE=your-instance-name
```

## Usage (as a library)

```js
const { EvolutionClient } = require('../../tools/evolution-whatsapp-api');

const client = new EvolutionClient({
  baseUrl: process.env.EVOLUTION_API_URL,
  apiKey: process.env.EVOLUTION_API_KEY,
  instance: process.env.EVOLUTION_INSTANCE,
});

// Send text
await client.sendText('5511999999999', 'Hello!');

// Send text with typing delay
await client.sendText('5511999999999', 'Hello!', { delay: 2000 });

// Send media
await client.sendMedia('5511999999999', {
  mediatype: 'image',
  url: 'https://cdn.example.com/photo.jpg',
  caption: 'Check this out',
});

// Batch send with pacing
const results = await client.sendBatch(
  contacts,
  (contact) => ({ text: `Hi ${contact.name}!` }),
  {
    intervalMs: 3000,
    onProgress: (result) => console.log(result.status, result.contact.number),
  },
);
console.log(`Sent: ${results.sent}, Failed: ${results.failed}`);

// Instance management
const state = await client.getConnectionState();
await client.createInstance({ instanceName: 'new-instance' });
```

## Usage (CLI)

```bash
# Send text
node cli.js send-text 5511999999999 "Hello!"

# Send media
node cli.js send-media 5511999999999 https://cdn.example.com/file.pdf "Document title"

# Check connection
node cli.js connection-state

# Create instance
node cli.js create-instance my-new-instance
```

## Error Handling

```js
const {
  EvolutionClient,
  AuthenticationError,
  InstanceNotFoundError,
  RateLimitError,
} = require('../../tools/evolution-whatsapp-api');

try {
  await client.sendText(number, text);
} catch (err) {
  if (err instanceof AuthenticationError) {
    // 401 — bad API key
  } else if (err instanceof InstanceNotFoundError) {
    // 404 — instance doesn't exist
  } else if (err instanceof RateLimitError) {
    // 429 — too many requests (auto-retried 3x before throwing)
  }
}
```

## Features

- **Zero deps**: Uses Node.js 18+ built-in `fetch`
- **Auto-retry**: Exponential backoff on 429 and 5xx (up to 3 retries)
- **Timeout**: Configurable per-client (default 30s)
- **Batch send**: Built-in pacing with progress callback
- **Typed errors**: Specific error classes for common failures

## Guardrails

- WhatsApp Web has informal rate limits. Use `intervalMs` >= 3000 in batch sends.
- Phone numbers must be in E.164 format without the `+` (e.g., `5511999999999`).
- Evolution API must be self-hosted and properly configured.
- Never hardcode API keys — always use environment variables.

## Testing

```bash
npm test
```
