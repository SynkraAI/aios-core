#!/usr/bin/env node
'use strict';

const { EvolutionClient } = require('./index');

const USAGE = `
Usage:
  node cli.js send-text <number> <message>
  node cli.js send-media <number> <url> [caption]
  node cli.js connection-state
  node cli.js create-instance <name>

Environment variables (or .env):
  EVOLUTION_API_URL     - API base URL
  EVOLUTION_API_KEY     - API key
  EVOLUTION_INSTANCE    - Instance name

Examples:
  node cli.js send-text 5511999999999 "Olá, tudo bem?"
  node cli.js connection-state
`.trim();

async function main() {
  const [,, command, ...args] = process.argv;

  if (!command || command === '--help' || command === '-h') {
    console.log(USAGE);
    process.exit(0);
  }

  const baseUrl = process.env.EVOLUTION_API_URL;
  const apiKey = process.env.EVOLUTION_API_KEY;
  const instance = process.env.EVOLUTION_INSTANCE;

  if (!baseUrl || !apiKey || !instance) {
    console.error('Error: EVOLUTION_API_URL, EVOLUTION_API_KEY, and EVOLUTION_INSTANCE must be set.');
    process.exit(1);
  }

  const client = new EvolutionClient({ baseUrl, apiKey, instance });

  switch (command) {
    case 'send-text': {
      const [number, ...messageParts] = args;
      const message = messageParts.join(' ');
      if (!number || !message) {
        console.error('Usage: send-text <number> <message>');
        process.exit(1);
      }
      const result = await client.sendText(number, message);
      console.log(JSON.stringify(result, null, 2));
      break;
    }

    case 'send-media': {
      const [number, url, ...captionParts] = args;
      if (!number || !url) {
        console.error('Usage: send-media <number> <url> [caption]');
        process.exit(1);
      }
      const caption = captionParts.length ? captionParts.join(' ') : undefined;
      const result = await client.sendMedia(number, { url, caption });
      console.log(JSON.stringify(result, null, 2));
      break;
    }

    case 'connection-state': {
      const result = await client.getConnectionState();
      console.log(JSON.stringify(result, null, 2));
      break;
    }

    case 'create-instance': {
      const [name] = args;
      if (!name) {
        console.error('Usage: create-instance <name>');
        process.exit(1);
      }
      const result = await client.createInstance({ instanceName: name });
      console.log(JSON.stringify(result, null, 2));
      break;
    }

    default:
      console.error(`Unknown command: ${command}\n`);
      console.log(USAGE);
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
