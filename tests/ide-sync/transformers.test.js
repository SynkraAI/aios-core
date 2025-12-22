/**
 * Unit tests for IDE transformers
 * @story 6.19 - IDE Command Auto-Sync System
 */

const claudeCode = require('../../.aios-core/infrastructure/scripts/ide-sync/transformers/claude-code');
const cursor = require('../../.aios-core/infrastructure/scripts/ide-sync/transformers/cursor');
const windsurf = require('../../.aios-core/infrastructure/scripts/ide-sync/transformers/windsurf');
const trae = require('../../.aios-core/infrastructure/scripts/ide-sync/transformers/trae');
const antigravity = require('../../.aios-core/infrastructure/scripts/ide-sync/transformers/antigravity');

describe('IDE Transformers', () => {
  // Sample agent data for testing
  const sampleAgent = {
    path: '/path/to/dev.md',
    filename: 'dev.md',
    id: 'dev',
    raw: '# dev\n\n```yaml\nagent:\n  name: Dex\n  id: dev\n```\n\nContent',
    yaml: {
      agent: {
        name: 'Dex',
        id: 'dev',
        title: 'Full Stack Developer',
        icon: '💻',
        whenToUse: 'Use for code implementation',
      },
      persona_profile: {
        archetype: 'Builder',
      },
      commands: [
        { name: 'help', visibility: ['full', 'quick', 'key'], description: 'Show help' },
        { name: 'develop', visibility: ['full', 'quick'], description: 'Develop story' },
        { name: 'debug', visibility: ['full'], description: 'Debug mode' },
        { name: 'exit', visibility: ['full', 'quick', 'key'], description: 'Exit agent' },
      ],
      dependencies: {
        tasks: ['task1.md', 'task2.md'],
        tools: ['git', 'context7'],
      },
    },
    agent: {
      name: 'Dex',
      id: 'dev',
      title: 'Full Stack Developer',
      icon: '💻',
      whenToUse: 'Use for code implementation',
    },
    persona_profile: {
      archetype: 'Builder',
    },
    commands: [
      { name: 'help', visibility: ['full', 'quick', 'key'], description: 'Show help' },
      { name: 'develop', visibility: ['full', 'quick'], description: 'Develop story' },
      { name: 'debug', visibility: ['full'], description: 'Debug mode' },
      { name: 'exit', visibility: ['full', 'quick', 'key'], description: 'Exit agent' },
    ],
    dependencies: {
      tasks: ['task1.md', 'task2.md'],
      tools: ['git', 'context7'],
    },
    sections: {
      quickCommands: '- `*help` - Show help',
      collaboration: 'Works with @qa and @sm',
      guide: 'Developer guide content',
    },
    error: null,
  };

  describe('claude-code transformer', () => {
    it('should return raw content (identity transform)', () => {
      const result = claudeCode.transform(sampleAgent);
      expect(result).toContain('# dev');
      expect(result).toContain('```yaml');
    });

    it('should add sync footer if not present', () => {
      const result = claudeCode.transform(sampleAgent);
      expect(result).toContain('Synced from .aios-core/development/agents/dev.md');
    });

    it('should not duplicate sync footer', () => {
      const agentWithFooter = {
        ...sampleAgent,
        raw: sampleAgent.raw + '\n---\n*AIOS Agent - Synced from .aios-core/development/agents/dev.md*',
      };
      const result = claudeCode.transform(agentWithFooter);
      const footerCount = (result.match(/Synced from/g) || []).length;
      expect(footerCount).toBe(1);
    });

    it('should return correct filename', () => {
      expect(claudeCode.getFilename(sampleAgent)).toBe('dev.md');
    });

    it('should have correct format identifier', () => {
      expect(claudeCode.format).toBe('full-markdown-yaml');
    });

    it('should handle agent without raw content', () => {
      const noRaw = { ...sampleAgent, raw: null };
      const result = claudeCode.transform(noRaw);
      expect(result).toContain('Dex');
      expect(result).toContain('Full Stack Developer');
    });
  });

  describe('cursor transformer', () => {
    it('should generate condensed format', () => {
      const result = cursor.transform(sampleAgent);
      expect(result).toContain('# Dex (@dev)');
      expect(result).toContain('💻 **Full Stack Developer**');
      expect(result).toContain('Builder');
    });

    it('should include whenToUse', () => {
      const result = cursor.transform(sampleAgent);
      expect(result).toContain('Use for code implementation');
    });

    it('should include Quick Commands section', () => {
      const result = cursor.transform(sampleAgent);
      expect(result).toContain('## Quick Commands');
      expect(result).toContain('*help');
      expect(result).toContain('*develop');
    });

    it('should include collaboration section', () => {
      const result = cursor.transform(sampleAgent);
      expect(result).toContain('## Collaboration');
      expect(result).toContain('@qa');
    });

    it('should add sync footer', () => {
      const result = cursor.transform(sampleAgent);
      expect(result).toContain('Synced from');
    });

    it('should have correct format identifier', () => {
      expect(cursor.format).toBe('condensed-rules');
    });
  });

  describe('windsurf transformer', () => {
    it('should generate XML-tagged format', () => {
      const result = windsurf.transform(sampleAgent);
      expect(result).toContain('<agent-identity>');
      expect(result).toContain('</agent-identity>');
      expect(result).toContain('<commands>');
      expect(result).toContain('</commands>');
    });

    it('should include agent info in identity tag', () => {
      const result = windsurf.transform(sampleAgent);
      expect(result).toContain('💻 **Dex**');
      expect(result).toContain('ID: @dev');
    });

    it('should include whenToUse in when-to-use tag', () => {
      const result = windsurf.transform(sampleAgent);
      expect(result).toContain('<when-to-use>');
      expect(result).toContain('Use for code implementation');
      expect(result).toContain('</when-to-use>');
    });

    it('should list all commands', () => {
      const result = windsurf.transform(sampleAgent);
      expect(result).toContain('*help');
      expect(result).toContain('*develop');
      expect(result).toContain('*debug');
    });

    it('should mark quick commands', () => {
      const result = windsurf.transform(sampleAgent);
      expect(result).toMatch(/\*help.*\(quick\)/);
    });

    it('should include dependencies', () => {
      const result = windsurf.transform(sampleAgent);
      expect(result).toContain('<dependencies>');
      expect(result).toContain('git');
      expect(result).toContain('context7');
    });

    it('should have correct format identifier', () => {
      expect(windsurf.format).toBe('xml-tagged-markdown');
    });
  });

  describe('trae transformer', () => {
    it('should generate project rules format', () => {
      const result = trae.transform(sampleAgent);
      expect(result).toContain('# AIOS Agent: Dex');
      expect(result).toContain('## Identity');
    });

    it('should include identity table', () => {
      const result = trae.transform(sampleAgent);
      expect(result).toContain('| ID | @dev |');
      expect(result).toContain('| Name | Dex |');
      expect(result).toContain('| Icon | 💻 |');
    });

    it('should include Core Commands section', () => {
      const result = trae.transform(sampleAgent);
      expect(result).toContain('## Core Commands');
      expect(result).toContain('*help');
      expect(result).toContain('*exit');
    });

    it('should include Quick Reference section', () => {
      const result = trae.transform(sampleAgent);
      expect(result).toContain('## Quick Reference');
    });

    it('should include All Commands section', () => {
      const result = trae.transform(sampleAgent);
      expect(result).toContain('## All Commands');
      expect(result).toContain('*debug');
    });

    it('should include Dependencies section', () => {
      const result = trae.transform(sampleAgent);
      expect(result).toContain('## Dependencies');
      expect(result).toContain('### Tasks');
      expect(result).toContain('### Tools');
    });

    it('should have correct format identifier', () => {
      expect(trae.format).toBe('project-rules');
    });
  });

  describe('antigravity transformer', () => {
    it('should generate cursor-style format', () => {
      const result = antigravity.transform(sampleAgent);
      expect(result).toContain('# Dex (@dev)');
      expect(result).toContain('💻 **Full Stack Developer**');
    });

    it('should include Quick Commands', () => {
      const result = antigravity.transform(sampleAgent);
      expect(result).toContain('## Quick Commands');
    });

    it('should include All Commands if more than quick+key', () => {
      const result = antigravity.transform(sampleAgent);
      expect(result).toContain('## All Commands');
      expect(result).toContain('*debug');
    });

    it('should have correct format identifier', () => {
      expect(antigravity.format).toBe('cursor-style');
    });
  });

  describe('all transformers', () => {
    const transformers = [claudeCode, cursor, windsurf, trae, antigravity];

    it('should handle agent with minimal data', () => {
      const minimal = {
        filename: 'minimal.md',
        id: 'minimal',
        agent: null,
        persona_profile: null,
        commands: [],
        dependencies: null,
        sections: {},
        error: null,
      };

      for (const transformer of transformers) {
        expect(() => transformer.transform(minimal)).not.toThrow();
        const result = transformer.transform(minimal);
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      }
    });

    it('should return valid filename for all', () => {
      for (const transformer of transformers) {
        const filename = transformer.getFilename(sampleAgent);
        expect(filename).toBe('dev.md');
      }
    });

    it('should have format property', () => {
      for (const transformer of transformers) {
        expect(typeof transformer.format).toBe('string');
      }
    });
  });
});
