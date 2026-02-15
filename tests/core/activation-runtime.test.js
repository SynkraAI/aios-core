'use strict';

jest.mock('../../.aios-core/development/scripts/unified-activation-pipeline', () => ({
  UnifiedActivationPipeline: jest.fn().mockImplementation(() => ({
    activate: jest.fn(async () => ({
      greeting: 'ok',
      context: {},
      duration: 1,
      quality: 'full',
      metrics: {},
    })),
  })),
}));

const { ActivationRuntime, activateAgent } = require('../../.aios-core/development/scripts/activation-runtime');
const { UnifiedActivationPipeline } = require('../../.aios-core/development/scripts/unified-activation-pipeline');

describe('ActivationRuntime', () => {
  it('uses UnifiedActivationPipeline as canonical backend', async () => {
    const runtime = new ActivationRuntime();
    const result = await runtime.activate('dev');

    expect(UnifiedActivationPipeline).toHaveBeenCalledTimes(1);
    expect(result.greeting).toBe('ok');
  });

  it('returns greeting-only helper', async () => {
    const runtime = new ActivationRuntime();
    const greeting = await runtime.activateGreeting('qa');
    expect(greeting).toBe('ok');
  });

  it('supports one-shot activateAgent helper', async () => {
    const result = await activateAgent('architect');
    expect(result.quality).toBe('full');
  });
});
