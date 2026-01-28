const { syncSkills } = require('../../.aios-core/infrastructure/scripts/ide-sync/skill-converter');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

describe('skill converter', () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aios-skill-test-'));
    // Setup source tasks
    const sourceTasksDir = path.join(tempDir, '.aios-core', 'development', 'tasks');
    await fs.ensureDir(sourceTasksDir);
    await fs.writeFile(
      path.join(sourceTasksDir, 'dev-develop-story.md'),
      '# Develop Story\nThis task implements a story.'
    );
    await fs.writeFile(path.join(sourceTasksDir, 'help.md'), '# Help\nThis task provides help.');
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  test('should sync tasks to skills', async () => {
    const result = await syncSkills(tempDir);

    expect(result.success).toBe(true);
    expect(result.synced.length).toBe(2);

    // Check clean names
    const names = result.synced.map((s) => s.name);
    expect(names).toContain('develop-story');
    expect(names).toContain('help');

    // Check output files
    const skillPath = path.join(tempDir, '.opencode', 'skills', 'develop-story', 'SKILL.md');
    expect(await fs.pathExists(skillPath)).toBe(true);

    const content = await fs.readFile(skillPath, 'utf8');
    expect(content).toContain('description: "This task implements a story."');
    expect(content).toContain('# Develop-story');
  });
});
