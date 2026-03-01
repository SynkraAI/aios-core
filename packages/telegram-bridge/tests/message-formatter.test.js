import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MessageFormatter } from '../src/message-formatter.js';

describe('MessageFormatter', () => {
  const formatter = new MessageFormatter();

  describe('format()', () => {
    it('formats ack messages', () => {
      const result = formatter.format({
        content: { type: 'ack', message: 'ok' },
      });
      assert.equal(result, 'Command received, processing...');
    });

    it('formats progress messages with agent using HTML bold', () => {
      const result = formatter.format({
        content: { type: 'progress', agent: 'dev', message: 'Running tests...' },
      });
      assert.ok(result.includes('<b>@dev</b>'));
      assert.ok(result.includes('Running tests...'));
    });

    it('formats agent_switch messages with HTML', () => {
      const result = formatter.format({
        content: { type: 'agent_switch', agent: 'qa', message: 'Switching to QA' },
      });
      assert.ok(result.includes('Agent switch'));
      assert.ok(result.includes('<b>@qa</b>'));
    });

    it('formats tool_use with icon', () => {
      const result = formatter.format({
        content: { type: 'tool_use', tool: 'Bash', message: 'npm test' },
      });
      assert.ok(result.includes('[&gt;_]'));
      assert.ok(result.includes('<b>Bash</b>'));
    });

    it('formats tool_use with multiline output as pre block', () => {
      const result = formatter.format({
        content: { type: 'tool_use', tool: 'Read', message: 'line1\nline2\nline3' },
      });
      assert.ok(result.includes('<pre>'));
      assert.ok(result.includes('[R]'));
    });

    it('formats error messages with HTML bold', () => {
      const result = formatter.format({
        content: { type: 'error', message: 'Build failed' },
      });
      assert.ok(result.includes('<b>ERROR</b>'));
      assert.ok(result.includes('Build failed'));
    });

    it('formats final messages', () => {
      const result = formatter.format({
        content: { type: 'final', agent: 'dev', message: 'Done.' },
      });
      assert.ok(result.includes('<b>@dev</b>'));
      assert.ok(result.includes('Done.'));
    });

    it('returns null for empty content', () => {
      assert.equal(formatter.format({}), null);
    });
  });

  describe('HTML escaping', () => {
    it('escapes < and > in messages', () => {
      const result = formatter.format({
        content: { type: 'progress', message: 'Array<string> test' },
      });
      assert.ok(result.includes('&lt;string&gt;'));
      assert.ok(!result.includes('<string>'));
    });

    it('escapes & in messages', () => {
      const result = formatter.format({
        content: { type: 'progress', message: 'foo && bar' },
      });
      assert.ok(result.includes('&amp;&amp;'));
    });

    it('handles file paths with underscores correctly', () => {
      const result = formatter.format({
        content: { type: 'progress', message: 'Reading src/auth_service.ts' },
      });
      // Underscores should pass through without mangling
      assert.ok(result.includes('auth_service.ts'));
    });
  });

  describe('truncation', () => {
    it('truncates messages over 4000 chars', () => {
      const longMsg = 'x'.repeat(5000);
      const result = formatter.format({
        content: { type: 'progress', message: longMsg },
      });
      assert.ok(result.length <= 4000);
      assert.ok(result.includes('truncated'));
    });

    it('preserves messages under 4000 chars', () => {
      const shortMsg = 'Hello world';
      const result = formatter.format({
        content: { type: 'progress', message: shortMsg },
      });
      assert.ok(result.includes('Hello world'));
    });
  });

  describe('credential redaction', () => {
    it('redacts API tokens', () => {
      const result = formatter.format({
        content: {
          type: 'progress',
          message: 'token=fake_token_aaabbbcccdddeeefffggg111222333',
        },
      });
      assert.ok(!result.includes('aaabbbcccdddeeefffggg111222333'));
      assert.ok(result.includes('****'));
    });

    it('redacts secret keys', () => {
      const result = formatter.format({
        content: {
          type: 'progress',
          message: 'secret: "abcdefghijklmnopqrstuvwxyz"',
        },
      });
      assert.ok(!result.includes('abcdefghijklmnopqrstuvwxyz'));
    });

    it('redacts Telegram bot tokens with colons', () => {
      const result = formatter.format({
        content: {
          type: 'progress',
          message: 'token=7835398197:AAEmfIGOUnHG7YbX4ontPXjQWfWc7kGV1sc',
        },
      });
      assert.ok(!result.includes('AAEmfIGOUnHG7YbX4ontPXjQWfWc7kGV1sc'));
      assert.ok(result.includes('****'));
    });

    it('preserves non-credential text', () => {
      const result = formatter.format({
        content: { type: 'progress', message: 'All tests passed!' },
      });
      assert.ok(result.includes('All tests passed!'));
    });
  });

  describe('tool icons', () => {
    const tools = [
      ['Bash', '[&gt;_]'],
      ['Read', '[R]'],
      ['Edit', '[E]'],
      ['Write', '[W]'],
      ['Grep', '[?]'],
      ['Glob', '[*]'],
      ['Task', '[T]'],
      ['WebSearch', '[S]'],
      ['WebFetch', '[F]'],
    ];

    for (const [tool, icon] of tools) {
      it(`maps ${tool} to ${icon}`, () => {
        const result = formatter.format({
          content: { type: 'tool_use', tool, message: 'test' },
        });
        assert.ok(result.includes(icon), `Expected ${icon} in result: ${result}`);
      });
    }

    it('WebSearch and Write have different icons', () => {
      const ws = formatter.format({ content: { type: 'tool_use', tool: 'WebSearch', message: 'x' } });
      const wr = formatter.format({ content: { type: 'tool_use', tool: 'Write', message: 'x' } });
      assert.ok(ws.includes('[S]'));
      assert.ok(wr.includes('[W]'));
    });

    it('uses tool name as fallback for unknown tools', () => {
      const result = formatter.format({
        content: { type: 'tool_use', tool: 'CustomTool', message: 'test' },
      });
      assert.ok(result.includes('[CustomTool]'));
    });
  });
});
