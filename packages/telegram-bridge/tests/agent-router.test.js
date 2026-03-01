import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { AgentRouter } from '../src/agent-router.js';

// Mock dependencies
function createMockBotManager() {
  const sent = [];
  return {
    sendToAgent: async (agentId, message) => {
      sent.push({ agentId, message });
      return true;
    },
    sent,
    config: {
      agent_to_bot_map: {
        'aios-master': 'master',
        dev: 'dev',
        qa: 'qa',
        architect: 'architect',
        pm: 'master',
        po: 'master',
      },
    },
  };
}

function createMockRateLimiter() {
  return { execute: async (fn) => fn() };
}

function createMockFormatter() {
  return { format: (msg) => msg.content?.message || null };
}

const noopLogger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
};

describe('AgentRouter', () => {
  let router;
  let botManager;

  beforeEach(() => {
    botManager = createMockBotManager();
    router = new AgentRouter(
      botManager,
      createMockRateLimiter(),
      createMockFormatter(),
      noopLogger
    );
  });

  describe('resolveAgent()', () => {
    it('detects agent from **aios-dev:** label', () => {
      const result = router.resolveAgent({
        content: { type: 'progress', agent: 'aios-master', message: '**aios-dev:** "Ready!"' },
      });
      assert.equal(result, 'dev');
    });

    it('detects agent from Agent tool_use', () => {
      const result = router.resolveAgent({
        content: { type: 'tool_use', tool: 'Agent', agent: 'aios-master', message: 'Ping aios-qa agent' },
      });
      assert.equal(result, 'qa');
    });

    it('falls back to content.agent when no mention', () => {
      const result = router.resolveAgent({
        content: { type: 'progress', agent: 'dev', message: 'Running tests...' },
      });
      assert.equal(result, 'dev');
    });

    it('falls back to currentAgent when nothing matches', () => {
      router.currentAgent = 'qa';
      const result = router.resolveAgent({
        content: { type: 'progress', message: 'test' },
      });
      assert.equal(result, 'qa');
    });

    it('defaults to aios-master', () => {
      const result = router.resolveAgent({
        content: { type: 'progress', message: 'test' },
      });
      assert.equal(result, 'aios-master');
    });
  });

  describe('route()', () => {
    it('always sends to master bot', async () => {
      await router.route('aios-master', {
        content: { type: 'progress', agent: 'aios-master', message: 'Hello' },
      });
      assert.equal(botManager.sent.length, 1);
      assert.equal(botManager.sent[0].agentId, 'aios-master');
    });

    it('sends to both master and agent bot when agent detected', async () => {
      await router.route('dev', {
        content: { type: 'progress', agent: 'aios-master', message: '**aios-dev:** "Building..."' },
      });
      assert.equal(botManager.sent.length, 2);
      assert.equal(botManager.sent[0].agentId, 'aios-master');
      assert.equal(botManager.sent[1].agentId, 'dev');
    });

    it('tracks agent switches', async () => {
      await router.route('qa', {
        content: { type: 'agent_switch', agent: 'qa', message: 'Switching to QA' },
      });
      assert.equal(router.currentAgent, 'qa');
    });

    it('deduplicates identical messages within time window', async () => {
      await router.route('aios-master', {
        content: { type: 'progress', message: 'Same message' },
      });
      await router.route('aios-master', {
        content: { type: 'final', message: 'Same message' },
      });
      // Only first should send (second is deduped within 30s window)
      assert.equal(botManager.sent.length, 1);
    });

    it('allows different messages through', async () => {
      await router.route('aios-master', {
        content: { type: 'progress', message: 'Message A' },
      });
      await router.route('aios-master', {
        content: { type: 'progress', message: 'Message B' },
      });
      assert.equal(botManager.sent.length, 2);
    });

    it('does not send when formatter returns null', async () => {
      await router.route('dev', { content: { type: 'ack' } });
      assert.equal(botManager.sent.length, 0);
    });
  });
});
