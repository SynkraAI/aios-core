const opencode = require('../../.aios-core/infrastructure/scripts/ide-sync/transformers/opencode');

describe('opencode transformer', () => {
  const sampleAgent = {
    id: 'dev',
    filename: 'dev.md',
    raw: '---\nagent:\n  name: Dex\n  whenToUse: code master\n---\n# Instructions',
    agent: {
      name: 'Dex',
      whenToUse: 'code master',
    },
    dependencies: {
      tools: ['bash'],
    },
  };

  test('should transform to OpenCode format with robust header and literal instructions', () => {
    const result = opencode.transform(sampleAgent);

    // Check Config Header (Robust, with quotes)
    expect(result).toMatch(
      /^---\ndescription: "code master"\nmode: all\ntools:\n[ ]{2}bash: true\n---/
    );

    // Check Literal Body (Should contain the original raw file including its YAML)
    expect(result).toContain('agent:\n  name: Dex');
    expect(result).toContain('# Instructions');
  });

  test('should use primary mode for aios-master', () => {
    const master = { id: 'aios-master', agent: { whenToUse: 'all' }, raw: 'raw' };
    const result = opencode.transform(master);
    expect(result).toContain('mode: primary');
  });

  test('should handle missing description with fallback', () => {
    const noDesc = { id: 'ghost', agent: {}, raw: 'raw' };
    const result = opencode.transform(noDesc);
    expect(result).toContain('description: "AIOS Agent - ghost"');
  });
});
