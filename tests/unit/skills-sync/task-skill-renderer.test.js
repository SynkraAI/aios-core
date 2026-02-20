'use strict';

const {
  getTaskSkillId,
  getAgentSourceFilename,
  sanitizeDescription,
  getRequiredContextPaths,
  buildTaskSkillContent,
  buildClaudeTaskSkillContent,
} = require('../../../.aios-core/infrastructure/scripts/skills-sync/renderers/task-skill');

describe('task-skill renderer', () => {
  it('builds agent-scoped task skill ids', () => {
    expect(getTaskSkillId('build-resume', 'dev')).toBe('dev-build-resume');
    expect(getTaskSkillId('aios-task-build-resume', 'aios-dev')).toBe('dev-build-resume');
  });

  it('prevents double agent prefix in task skill ids', () => {
    expect(getTaskSkillId('dev-develop-story', 'dev')).toBe('dev-develop-story');
    expect(getTaskSkillId('po-backlog-add', 'po')).toBe('po-backlog-add');
    expect(getTaskSkillId('qa-review-build', 'qa')).toBe('qa-review-build');
  });

  it('resolves owner agent source filename', () => {
    expect(getAgentSourceFilename('dev')).toBe('dev/dev.md');
    expect(getAgentSourceFilename('master')).toBe('aios-master/aios-master.md');
  });

  it('sanitizes markdown-heavy summary text', () => {
    const cleaned = sanitizeDescription('> **Command:** `*build-resume {story-id}`');
    expect(cleaned).toBe('> Command: *build-resume {story-id}'.replace(/^>\s*/, ''));
  });

  it('renders clean frontmatter with task metadata', () => {
    const content = buildTaskSkillContent({
      id: 'build-resume',
      filename: 'build-resume.md',
      title: 'Task: Build Resume',
      summary: '> **Command:** `*build-resume {story-id}`',
      command: '*build-resume {story-id}',
      agent: 'dev',
      elicit: false,
    });

    expect(content).toContain('name: dev-build-resume');
    expect(content).toContain('description: "Command: *build-resume {story-id}"');
    expect(content).toContain('owner: "dev"');
    expect(content).toContain('source: ".aios-core/development/tasks/build-resume.md"');
    expect(content).toContain('command: "*build-resume {story-id}"');
    expect(content).toContain('## Agent Context');
    expect(content).toContain('.aios-core/development/agents/dev/dev.md');
    expect(content).toContain('## Canonical Command');
  });

  describe('buildClaudeTaskSkillContent', () => {
    it('renders context: fork and agent: in frontmatter', () => {
      const content = buildClaudeTaskSkillContent({
        id: 'build-resume',
        filename: 'build-resume.md',
        title: 'Task: Build Resume',
        summary: '> **Command:** `*build-resume {story-id}`',
        command: '*build-resume {story-id}',
        agent: 'dev',
        elicit: false,
      });

      expect(content).toContain('name: dev-build-resume');
      expect(content).toContain('context: fork');
      expect(content).toContain('agent: dev');
      expect(content).toContain('owner: "dev"');
      expect(content).toContain('source: ".aios-core/development/tasks/build-resume.md"');
      // With embed, should contain the actual task content and guardrails
      expect(content).toContain('## Guardrails');
    });

    it('embeds full task source content when file exists', () => {
      const content = buildClaudeTaskSkillContent({
        id: 'build-resume',
        filename: 'build-resume.md',
        title: 'Task: Build Resume',
        agent: 'dev',
        elicit: false,
      });

      // Should contain the actual task file content (Purpose section)
      expect(content).toContain('Resume an autonomous build');
      expect(content).toContain('## Guardrails');
    });

    it('falls back to pointer when task source file not found', () => {
      const content = buildClaudeTaskSkillContent({
        id: 'fake-task',
        filename: 'nonexistent-task.md',
        title: 'Fake Task',
        agent: 'dev',
        elicit: false,
      });

      expect(content).toContain('## Mission');
      expect(content).toContain('## Execution Protocol');
      expect(content).toContain('## Guardrails');
    });

    it('uses aios-master as agent name for master', () => {
      const content = buildClaudeTaskSkillContent({
        id: 'some-task',
        filename: 'some-task.md',
        title: 'Some Task',
        agent: 'master',
        elicit: false,
      });

      expect(content).toContain('agent: aios-master');
      expect(content).toContain('name: aios-master-some-task');
    });

    it('includes elicit interaction note in fallback mode', () => {
      const content = buildClaudeTaskSkillContent({
        id: 'elicit-task',
        filename: 'nonexistent-elicit-task.md',
        title: 'Elicit Task',
        agent: 'analyst',
        elicit: true,
      });

      expect(content).toContain('elicit=true');
      expect(content).toContain('user interaction points');
    });

    it('renders Canonical Command section in fallback mode', () => {
      const content = buildClaudeTaskSkillContent({
        id: 'fake-push',
        filename: 'nonexistent-push.md',
        title: 'Push',
        command: '*push',
        agent: 'devops',
        elicit: false,
      });

      expect(content).toContain('## Canonical Command');
      expect(content).toContain('`*push`');
    });

    it('omits Canonical Command section when no command in fallback', () => {
      const content = buildClaudeTaskSkillContent({
        id: 'no-cmd',
        filename: 'nonexistent-no-cmd.md',
        title: 'No Command',
        agent: 'dev',
        elicit: false,
      });

      expect(content).not.toContain('## Canonical Command');
    });

    it('includes required-context in frontmatter (AGF-1)', () => {
      const content = buildClaudeTaskSkillContent({
        id: 'build-resume',
        filename: 'build-resume.md',
        title: 'Task: Build Resume',
        agent: 'dev',
        elicit: false,
      });

      expect(content).toContain('required-context:');
      expect(content).toContain('.aios-core/development/agents/dev/dev.md');
      expect(content).toContain('.aios-core/development/agents/dev/MEMORY.md');
      expect(content).toContain('.aios-core/development/agents/dev/agent-context.md');
    });

    it('includes Required Context Loading in fallback mode (AGF-1)', () => {
      const content = buildClaudeTaskSkillContent({
        id: 'fake-push',
        filename: 'nonexistent-push.md',
        title: 'Push',
        agent: 'devops',
        elicit: false,
      });

      expect(content).toContain('## Required Context Loading');
      expect(content).toContain('Before execution, read these files:');
      expect(content).toContain('.aios-core/development/agents/devops/devops.md');
    });

    it('resolves master agent paths correctly in required-context (AGF-1)', () => {
      const paths = getRequiredContextPaths('master');
      expect(paths[0]).toBe('.aios-core/development/agents/aios-master/aios-master.md');
      expect(paths[1]).toBe('.aios-core/development/agents/aios-master/MEMORY.md');
      expect(paths[2]).toBe('.aios-core/development/agents/aios-master/agent-context.md');
    });
  });
});
