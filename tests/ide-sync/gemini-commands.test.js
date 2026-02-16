'use strict';

const fs = require('fs-extra');
const os = require('os');
const path = require('path');

const {
  commandSlugForAgent,
  menuCommandName,
  buildGeminiCommandFiles,
  syncGeminiCommands,
} = require('../../.aios-core/infrastructure/scripts/ide-sync/gemini-commands');

describe('gemini command sync', () => {
  let tmpRoot;

  beforeEach(async () => {
    tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'gemini-commands-'));
  });

  afterEach(async () => {
    await fs.remove(tmpRoot);
  });

  it('normalizes command slugs and menu names', () => {
    expect(commandSlugForAgent('aios-master')).toBe('master');
    expect(commandSlugForAgent('dev')).toBe('dev');
    expect(menuCommandName('aios-master')).toBe('/aios-master');
    expect(menuCommandName('dev')).toBe('/aios-dev');
  });

  it('builds menu + one command per agent', () => {
    const agents = [
      { id: 'dev', error: null },
      { id: 'architect', error: null },
      { id: 'qa', error: null },
    ];
    const files = buildGeminiCommandFiles(agents);

    expect(files.find((f) => f.filename === 'aios-menu.toml')).toBeDefined();
    expect(files.find((f) => f.filename === 'aios-dev.toml')).toBeDefined();
    expect(files.find((f) => f.filename === 'aios-architect.toml')).toBeDefined();
    expect(files.find((f) => f.filename === 'aios-qa.toml')).toBeDefined();
    expect(files).toHaveLength(4);
  });

  it('writes command files to .gemini/commands', () => {
    const agents = [{ id: 'dev', error: null }, { id: 'qa', error: null }];
    const result = syncGeminiCommands(agents, tmpRoot, { dryRun: false });

    expect(result.files.length).toBe(3);
    expect(fs.existsSync(path.join(tmpRoot, '.gemini', 'commands', 'aios-menu.toml'))).toBe(true);
    expect(fs.existsSync(path.join(tmpRoot, '.gemini', 'commands', 'aios-dev.toml'))).toBe(true);
    expect(fs.existsSync(path.join(tmpRoot, '.gemini', 'commands', 'aios-qa.toml'))).toBe(true);
  });
});
