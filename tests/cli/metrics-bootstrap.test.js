const Module = require('module');

describe('CLI metrics bootstrap', () => {
  it('does not load metrics runtime modules during CLI creation', () => {
    const originalLoad = Module._load;
    const loads = {
      collector: 0,
      seed: 0,
    };

    Module._load = function patchedLoad(request, parent, isMain) {
      if (request === '../../../quality/metrics-collector') {
        loads.collector += 1;
        return { MetricsCollector: class MetricsCollector {} };
      }

      if (request === '../../../quality/seed-metrics') {
        loads.seed += 1;
        return {
          seedMetrics: jest.fn(),
          generateSeedData: jest.fn(),
        };
      }

      return originalLoad.call(this, request, parent, isMain);
    };

    try {
      jest.isolateModules(() => {
        const { createProgram } = require('../../.aiox-core/cli');
        const program = createProgram();
        expect(program.commands.some((command) => command.name() === 'metrics')).toBe(true);
      });
    } finally {
      Module._load = originalLoad;
    }

    expect(loads.collector).toBe(0);
    expect(loads.seed).toBe(0);
  });
});
