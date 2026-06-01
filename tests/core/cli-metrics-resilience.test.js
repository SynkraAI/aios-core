describe('CLI metrics resilience', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetModules();
  });

  it('boots the CLI even when quality metrics modules are unavailable', () => {
    jest.isolateModules(() => {
      jest.doMock('../../.aiox-core/quality/metrics-collector', () => {
        const error = new Error("Cannot find module '../../../quality/metrics-collector'");
        error.code = 'MODULE_NOT_FOUND';
        throw error;
      });
      jest.doMock('../../.aiox-core/quality/seed-metrics', () => {
        const error = new Error("Cannot find module '../../../quality/seed-metrics'");
        error.code = 'MODULE_NOT_FOUND';
        throw error;
      });

      expect(() => require('../../.aiox-core/cli')).not.toThrow();
    });
  });

  it('fails only inside metrics commands with an actionable error', async () => {
    const exitError = new Error('EXIT_1');
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(process, 'exit').mockImplementation((code) => {
      if (code === 1) {
        throw exitError;
      }

      throw new Error(`EXIT_${code}`);
    });

    await jest.isolateModulesAsync(async () => {
      jest.doMock('../../.aiox-core/quality/metrics-collector', () => {
        const error = new Error("Cannot find module '../../../quality/metrics-collector'");
        error.code = 'MODULE_NOT_FOUND';
        throw error;
      });

      const { createRecordCommand } = require('../../.aiox-core/cli/commands/metrics/record');
      const command = createRecordCommand();

      await expect(
        command.parseAsync(['node', 'record', '--layer', '1'], { from: 'node' }),
      ).rejects.toBe(exitError);
    });

    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining('Metrics support is unavailable in this installation.'),
    );
  });
});
