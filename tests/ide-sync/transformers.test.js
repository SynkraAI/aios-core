/**
 * Unit tests for IDE transformers
 * @story 6.19 - IDE Command Auto-Sync System
 */

const claudeCode = require('../../.aios-core/infrastructure/scripts/ide-sync/transformers/claude-code');
const claudeNative = require('../../.aios-core/infrastructure/scripts/ide-sync/claude-agents');
const claudeSkills = require('../../.aios-core/infrastructure/scripts/ide-sync/claude-skills');
const claudeCommands = require('../../.aios-core/infrastructure/scripts/ide-sync/claude-commands');
const geminiSkills = require('../../.aios-core/infrastructure/scripts/ide-sync/gemini-skills');
const githubCopilotNative = require('../../.aios-core/infrastructure/scripts/ide-sync/github-copilot-agents');
const cursor = require('../../.aios-core/infrastructure/scripts/ide-sync/transformers/cursor');
const antigravity = require('../../.aios-core/infrastructure/scripts/ide-sync/transformers/antigravity');

describe('IDE Transformers', () => {
  // Sample agent data for testing
  const sampleAgent = {
    path: '/path/to/dev.md',
    filename: 'dev/dev.md',
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
      expect(result).toContain('Synced from .aios-core/development/agents/dev/dev.md');
    });

    it('should not duplicate sync footer', () => {
      const agentWithFooter = {
        ...sampleAgent,
        raw:
          sampleAgent.raw +
          '\n---\n*AIOS Agent - Synced from .aios-core/development/agents/dev/dev.md*',
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

  describe('claude native agent transformer', () => {
    it('should generate claude native frontmatter', () => {
      const result = claudeNative.transform(sampleAgent);
      expect(result).toContain('name: dev');
      expect(result).toContain('memory: project');
      expect(result).toContain('model: sonnet');
    });

    it('should generate native filename', () => {
      expect(claudeNative.getFilename(sampleAgent)).toBe('dev.md');
    });

    it('should not include compatibility adapter pointer', () => {
      const result = claudeNative.transform(sampleAgent);
      expect(result).not.toContain('.claude/commands/AIOS/agents/dev.md');
    });

    it('should include skills array in frontmatter', () => {
      const result = claudeNative.transform(sampleAgent);
      expect(result).toContain('skills:');
      expect(result).toContain('- dev');
    });

    it('should include project-context in skills array (AGF-1)', () => {
      const result = claudeNative.transform(sampleAgent);
      expect(result).toContain('- project-context');
    });
  });

  describe('claude commands transformer', () => {
    it('should generate interactive session command', () => {
      const result = claudeCommands.transform(sampleAgent);
      expect(result).toContain('Interactive Session');
      expect(result).toContain('Activation Flow');
    });

    it('should reference source agent definition', () => {
      const result = claudeCommands.transform(sampleAgent);
      expect(result).toContain('.aios-core/development/agents/dev/dev.md');
    });

    it('should reference MEMORY.md and agent-context.md', () => {
      const result = claudeCommands.transform(sampleAgent);
      expect(result).toContain('MEMORY.md');
      expect(result).toContain('agent-context.md');
    });

    it('should include HALT instruction for interactivity', () => {
      const result = claudeCommands.transform(sampleAgent);
      expect(result).toContain('HALT and await user input');
    });

    it('should return correct filename', () => {
      expect(claudeCommands.getFilename(sampleAgent)).toBe('dev.md');
    });

    it('should preserve aios-master id in filename', () => {
      const masterAgent = { ...sampleAgent, id: 'aios-master', filename: 'aios-master/aios-master.md' };
      expect(claudeCommands.getFilename(masterAgent)).toBe('aios-master.md');
    });

    it('should have correct format identifier', () => {
      expect(claudeCommands.format).toBe('claude-command-wrapper');
    });
  });

  describe('github copilot native agent transformer', () => {
    it('should generate copilot frontmatter', () => {
      const result = githubCopilotNative.transform(sampleAgent);
      expect(result).toContain('name: aios-dev');
      expect(result).toContain('target: github-copilot');
    });

    it('should generate .agent.md filename', () => {
      expect(githubCopilotNative.getFilename(sampleAgent)).toBe('dev.agent.md');
    });
  });

  describe('claude skill transformer', () => {
    it('should generate skill content compatible with shared renderer', () => {
      const result = claudeSkills.transform(sampleAgent);
      expect(result).toContain('name: dev');
      expect(result).toContain('Activation Protocol');
    });

    it('should generate nested SKILL.md path', () => {
      expect(claudeSkills.getFilename(sampleAgent)).toBe('dev/SKILL.md');
    });
  });

  describe('gemini skill transformer', () => {
    it('should generate skill content compatible with shared renderer', () => {
      const result = geminiSkills.transform(sampleAgent);
      expect(result).toContain('name: dev');
      expect(result).toContain('Starter Commands');
    });

    it('should generate nested SKILL.md path', () => {
      expect(geminiSkills.getFilename(sampleAgent)).toBe('dev/SKILL.md');
    });
  });

  describe('all transformers', () => {
    const transformers = [
      claudeCode,
      claudeNative,
      claudeSkills,
      claudeCommands,
      geminiSkills,
      githubCopilotNative,
      cursor,
      antigravity,
    ];

    it('should handle agent with minimal data', () => {
      const minimal = {
        filename: 'minimal/minimal.md',
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
        expect(typeof filename).toBe('string');
        expect(filename.length).toBeGreaterThan(0);
        expect(filename.endsWith('.md')).toBe(true);
      }
    });

    it('should have format property', () => {
      for (const transformer of transformers) {
        expect(typeof transformer.format).toBe('string');
      }
    });
  });
});
