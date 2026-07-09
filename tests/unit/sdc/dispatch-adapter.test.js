'use strict';

const { createDispatchAdapter } = require('../../../.aiox-core/core/sdc/dispatch-adapter');

describe('dispatch-adapter (C2)', () => {
  it('runs sequential in order', async () => {
    const order = [];
    const adapter = createDispatchAdapter({ mode: 'sequential' });
    const results = await adapter.runBatch(
      [{ storyId: 'A' }, { storyId: 'B' }, { storyId: 'C' }],
      async (s) => {
        order.push(s.storyId);
        return s.storyId;
      },
    );
    expect(order).toEqual(['A', 'B', 'C']);
    expect(results.map((r) => r.storyId)).toEqual(['A', 'B', 'C']);
    expect(results.every((r) => r.ok)).toBe(true);
  });

  it('parallel respects maxParallel and preserves order', async () => {
    let concurrent = 0;
    let maxSeen = 0;
    const adapter = createDispatchAdapter({ mode: 'parallel', maxParallel: 2 });
    const results = await adapter.runBatch(
      [{ storyId: '1' }, { storyId: '2' }, { storyId: '3' }, { storyId: '4' }],
      async (s) => {
        concurrent += 1;
        maxSeen = Math.max(maxSeen, concurrent);
        await new Promise((r) => setTimeout(r, 20));
        concurrent -= 1;
        return Number(s.storyId);
      },
    );
    expect(maxSeen).toBeLessThanOrEqual(2);
    expect(results.map((r) => r.result)).toEqual([1, 2, 3, 4]);
  });

  it('settles failures without throwing', async () => {
    const adapter = createDispatchAdapter({ mode: 'sequential' });
    const results = await adapter.runBatch(
      [{ storyId: 'ok' }, { storyId: 'bad' }],
      async (s) => {
        if (s.storyId === 'bad') throw new Error('boom');
        return 1;
      },
    );
    expect(results[0].ok).toBe(true);
    expect(results[1].ok).toBe(false);
    expect(results[1].error).toMatch(/boom/);
  });

  it('falls back invalid mode to sequential', async () => {
    const warnings = [];
    const adapter = createDispatchAdapter({
      mode: 'nope',
      warn: (m) => warnings.push(m),
    });
    expect(adapter.mode).toBe('sequential');
    expect(warnings.length).toBeGreaterThan(0);
  });

  it('dispatchStory wraps ok/error', async () => {
    const adapter = createDispatchAdapter();
    const ok = await adapter.dispatchStory({
      story: { storyId: 'X' },
      run: async () => 42,
    });
    expect(ok).toEqual({ storyId: 'X', ok: true, result: 42 });
  });
});
