const opencode = require('../../.aios-core/infrastructure/scripts/ide-sync/transformers/opencode');

describe('opencode transformer', () => {
  const sampleAgent = {
    id: 'dev',
    filename: 'dev.md',
    agent: {
      name: 'Dex',
      title: 'Developer',
      icon: '💻',
      whenToUse: 'Use for coding',
    },
    persona: {
      role: 'Software Engineer',
      style: 'Pragmatic',
    },
    core_principles: ['Write clean code', 'Test everything'],
  };

  test('should transform agent to OpenCode format with frontmatter', () => {
    const result = opencode.transform(sampleAgent);

    // Check frontmatter
    expect(result).toContain('name: "Dex"');
    expect(result).toContain('description: "Developer - Use for coding"');
    expect(result).toContain('tools: ["bash", "read", "write", "grep", "glob", "skill", "mcp"]');

    // Check content
    expect(result).toContain('# Dex');
    expect(result).toContain('💻 **Developer**');
    expect(result).toContain('Software Engineer');
    expect(result).toContain('Pragmatic');
    expect(result).toContain('Você é um agente AIOS operando no OpenCode');
    expect(result).toContain('- Write clean code');
    expect(result).toContain('- Test everything');
  });

  test('should return correct filename', () => {
    expect(opencode.getFilename(sampleAgent)).toBe('dev.md');
  });

  test('should specify correct format', () => {
    expect(opencode.format).toBe('markdown-frontmatter');
  });
});
