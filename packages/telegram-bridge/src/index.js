import { readFileSync } from 'node:fs';
import { readFile, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import pino from 'pino';
import 'dotenv/config';

import { BotManager } from './bot-manager.js';
import { InboxWriter } from './inbox-writer.js';
import { OutboxWatcher } from './outbox-watcher.js';
import { AgentRouter } from './agent-router.js';
import { MessageFormatter } from './message-formatter.js';
import { RateLimiter } from './rate-limiter.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.stdout.isTTY
    ? { target: 'pino/file', options: { destination: 1 } }
    : undefined,
});

/**
 * Read the session daemon's health.json for end-to-end status reporting.
 */
async function readDaemonHealth(aiosCwd) {
  try {
    const raw = await readFile(join(aiosCwd, '.aios', 'daemon', 'health.json'), 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function main() {
  // Load config
  const botsConfig = parseYaml(
    readFileSync(join(__dirname, '..', 'config', 'bots.yaml'), 'utf8')
  );

  const ownerId = parseInt(process.env.TELEGRAM_OWNER_ID, 10);
  if (!ownerId) {
    logger.fatal('TELEGRAM_OWNER_ID is required');
    process.exit(1);
  }

  const aiosCwd = process.env.AIOS_CWD || '/home/ubuntu/aios-core';

  // Initialize components
  const botManager = new BotManager(botsConfig, ownerId, logger);
  const inboxWriter = new InboxWriter(aiosCwd, logger);
  const outboxWatcher = new OutboxWatcher(aiosCwd, logger);
  const messageFormatter = new MessageFormatter();
  const rateLimiter = new RateLimiter({ tokensPerSecond: 1, burstSize: 3 });
  const agentRouter = new AgentRouter(botManager, rateLimiter, messageFormatter, logger);

  // Wire health provider for /status and /ping commands
  botManager.setHealthProvider(() => ({
    outbox: outboxWatcher.getStats(),
    daemon: null, // filled async on demand
  }));

  // Wire /track command provider
  botManager.setTrackProvider(async () => {
    const inboxBase = join(aiosCwd, '.aios', 'inbox');
    const dirs = ['pending', 'in_progress', 'processed', 'failed'];
    const lines = ['<b>Command Tracking</b>\n'];

    for (const dir of dirs) {
      try {
        const files = await readdir(join(inboxBase, dir));
        const jsonFiles = files.filter(f => f.endsWith('.json')).slice(-5);
        if (jsonFiles.length === 0) continue;

        lines.push(`<b>${dir}/</b> (${files.filter(f => f.endsWith('.json')).length})`);
        for (const f of jsonFiles) {
          try {
            const raw = await readFile(join(inboxBase, dir, f), 'utf8');
            const msg = JSON.parse(raw);
            const ago = Math.floor((Date.now() - new Date(msg.timestamp).getTime()) / 1000);
            const cmd = (msg.command || '').slice(0, 40);
            lines.push(`  ${msg.id} | ${cmd} | ${ago}s ago`);
          } catch { /* skip */ }
        }
      } catch { /* dir may not exist */ }
    }
    return lines.length > 1 ? lines.join('\n') : 'No commands found.';
  });

  // Wire digest mode
  botManager.setDigestFlushProvider(() => agentRouter.flushSuppressed());

  // Wire /agents command — reads daemon health.json
  botManager.setAgentsProvider(async () => {
    const health = await readDaemonHealth(aiosCwd);

    const lines = [];

    // --- Session info ---
    if (health) {
      const uptime = health.uptime_seconds || 0;
      const h = Math.floor(uptime / 3600);
      const m = Math.floor((uptime % 3600) / 60);
      const tokens = health.cumulative_tokens || { input: 0, output: 0 };
      const totalTokens = tokens.input + tokens.output;
      const ctxPercent = totalTokens > 0 ? Math.round((totalTokens / 200000) * 100) : 0;

      lines.push(
        `<b>Shared Session</b> (1 daemon, all agents)`,
        `State: <b>${health.state}</b> | Agent: <b>@${health.current_agent || 'none'}</b>`,
        `Uptime: ${h}h ${m}m | RAM: ${health.memory_mb}MB`,
        `Commands: ${health.commands_processed} ok, ${health.commands_failed} failed`,
        `Context: ${totalTokens.toLocaleString()} tokens (~${ctxPercent}% of 200k)`,
      );
      if (health.current_command) {
        lines.push(`Running: ${health.current_command}`);
      }
      if (health.last_error) {
        lines.push(`Last error: ${health.last_error}`);
      }
    } else {
      lines.push(`<b>Daemon:</b> offline or health.json not found`);
    }

    // --- Agent roster ---
    lines.push(``, `<b>Agent Roster</b>`);

    const agents = [
      { id: 'aios-master', name: 'Master', persona: 'AIOS Master', role: 'Orchestration' },
      { id: 'dev', name: 'Dex', persona: '@dev', role: 'Implementation' },
      { id: 'qa', name: 'Quinn', persona: '@qa', role: 'Quality gates' },
      { id: 'architect', name: 'Aria', persona: '@architect', role: 'Architecture' },
      { id: 'pm', name: 'Morgan', persona: '@pm', role: 'Product management' },
      { id: 'po', name: 'Pax', persona: '@po', role: 'Story validation' },
      { id: 'sm', name: 'River', persona: '@sm', role: 'Story creation' },
      { id: 'devops', name: 'Gage', persona: '@devops', role: 'CI/CD, git push' },
      { id: 'analyst', name: 'Alex', persona: '@analyst', role: 'Research' },
      { id: 'data-engineer', name: 'Dara', persona: '@data-engineer', role: 'Database' },
      { id: 'ux-design-expert', name: 'Uma', persona: '@ux', role: 'UX/UI' },
    ];

    const activeBots = [...botManager.bots.keys()];
    const registeredChats = [...botManager.chatIds.keys()];
    const activeAgent = health?.current_agent || 'aios-master';

    for (const agent of agents) {
      const hasBot = activeBots.includes(agent.id);
      const hasChat = registeredChats.includes(agent.id);
      const isActive = agent.id === activeAgent;
      const botMap = botsConfig.agent_to_bot_map[agent.id] || 'master';
      const botLabel = hasBot ? `bot` : `via @${botMap}`;

      const status = isActive ? '▶' : '·';
      const chatIcon = hasChat ? '✓' : '—';

      lines.push(
        `${status} <b>${agent.persona}</b> (${agent.name}) — ${agent.role}`,
        `  Bot: ${botLabel} | Chat: ${chatIcon}`,
      );
    }

    lines.push(``, `▶ = active now | ✓ = chat registered`);

    return lines.join('\n');
  });
  botManager.on('set_digest', (enabled) => {
    agentRouter.digestMode = enabled;
    logger.info({ digestMode: enabled }, 'Digest mode toggled');
  });

  // Ensure directories exist
  await inboxWriter.ensureDir();

  // Initialize bots
  await botManager.initialize();

  // Wire: user messages → inbox (prefix agent directive for observe-mode bots)
  botManager.on('user_message', async ({ text, agentId, chatId, senderId, messageId }) => {
    try {
      // If message comes from an agent bot (not master), prefix with @agent
      let command = text;
      if (agentId !== 'aios-master') {
        command = `@${agentId} ${text}`;
      }

      const id = await inboxWriter.write({
        command,
        senderId,
        messageId,
      });
      await botManager.sendToAgent(agentId, `Command received (${id}), processing...`);
    } catch (err) {
      logger.error({ err: err.message }, 'Failed to write inbox message');
      await botManager.sendToAgent(agentId, `Error: failed to queue command.`);
    }
  });

  // Wire: outbox → router → bots
  outboxWatcher.on('message', async (message) => {
    try {
      const targetAgent = agentRouter.resolveAgent(message);
      await agentRouter.route(targetAgent, message);
    } catch (err) {
      logger.error({ err: err.message, messageId: message.id }, 'Failed to route outbox message');
    }
  });

  // Start outbox watcher + cleanup timer
  await outboxWatcher.start();
  outboxWatcher.startCleanupTimer();

  // Start bot polling (non-blocking)
  botManager.startPolling();

  logger.info({ ownerId, aiosCwd, bots: [...botManager.bots.keys()] }, 'Telegram Bridge started');

  // Graceful shutdown
  const shutdown = async (signal) => {
    logger.info({ signal }, 'Shutting down...');
    await outboxWatcher.stop();
    await botManager.stopAll();
    logger.info('Shutdown complete');
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
  logger.fatal({ err: err.message }, 'Fatal error starting Telegram Bridge');
  process.exit(1);
});
