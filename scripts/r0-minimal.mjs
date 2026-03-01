import { query } from '@anthropic-ai/claude-agent-sdk';
import { writeFileSync } from 'fs';

const log = (msg) => {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  process.stderr.write(line);
  writeFileSync('/tmp/r0-log.txt', line, { flag: 'a' });
};

log('Starting R0 minimal test...');

try {
  log('Creating query...');
  const q = query({
    prompt: 'Say just the word hello, nothing else.',
    options: {
      cwd: '/home/ubuntu/aios-core',
      permissionMode: 'bypassPermissions',
      model: 'claude-haiku-4-5-20251001',
      maxTurns: 1,
      allowedTools: [],
    },
  });

  log('Iterating messages...');
  for await (const msg of q) {
    log(`MSG type=${msg.type} subtype=${msg.subtype || 'none'}`);
    if (msg.type === 'system' && msg.subtype === 'init') {
      log(`Session ID: ${msg.session_id}`);
    }
    if (msg.type === 'result') {
      log(`RESULT: ${msg.result?.slice(0, 300)}`);
    }
  }
  log('Query complete.');
} catch (err) {
  log(`ERROR: ${err.message}`);
  log(`STACK: ${err.stack?.slice(0, 500)}`);
}
