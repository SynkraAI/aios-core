#!/usr/bin/env node
'use strict';

const path = require('path');
const { AiosMcpServer } = require('../src/aios-mcp-server');

const contractPath = process.argv[2] ||
  path.join(__dirname, '..', 'contracts', 'aios-openclaw-contract.yaml');

const projectRoot = process.argv[3] || process.cwd();

async function main() {
  try {
    const server = new AiosMcpServer({ contractPath, projectRoot });
    server.create();
    await server.start();
  } catch (err) {
    process.stderr.write(`[aios-mcp-server] Fatal: ${err.message}\n`);
    process.exit(1);
  }
}

main();
