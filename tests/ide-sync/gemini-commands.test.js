'use strict';

const fs = require('fs-extra');
const os = require('os');
const path = require('path');

const {
  commandSlugForAgent,
  menuCommandName,
  buildAgentDescription,
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
      { id: 'dev', error: null, agent: { title: 'Developer', whenToUse: 'Implementar features' } },
      { id: 'architect', error: null, agent: { title: 'Architect', whenToUse: 'Definir arquitetura' } },
      { id: 'qa', error: null, agent: { title: 'QA', whenToUse: 'Validar qualidade' } },
    ];
    const files = buildGeminiCommandFiles(agents);

    expect(files.find((f) => f.filename === 'aios-menu.toml')).toBeDefined();
    expect(files.find((f) => f.filename === 'aios-dev.toml')).toBeDefined();
    expect(files.find((f) => f.filename === 'aios-architect.toml')).toBeDefined();
    expect(files.find((f) => f.filename === 'aios-qa.toml')).toBeDefined();
    expect(files).toHaveLength(4);
  });

  it('derives command description from agent title and whenToUse', () => {
    const files = buildGeminiCommandFiles([
      {
        id: 'dev',
        error: null,
        agent: { title: 'Full Stack Developer', whenToUse: 'Use para implementação e debugging' },
      },
    ]);

    const dev = files.find((f) => f.filename === 'aios-dev.toml');
    expect(dev.content).toContain('description = "Full Stack Developer (Use para implementação e debugging)"');
  });

  it('falls back to generic description when metadata is missing', () => {
    const files = buildGeminiCommandFiles([{ id: 'dev', error: null, agent: null }]);
    const dev = files.find((f) => f.filename === 'aios-dev.toml');
    expect(dev.content).toContain('description = "Ativar agente AIOS dev"');
  });

  it('buildAgentDescription handles multiline text', () => {
    const description = buildAgentDescription({
      id: 'architect',
      agent: {
        title: 'Architect',
        whenToUse: 'Use para arquitetura\ncomplexa em sistemas distribuídos',
      },
    });
    expect(description).toBe('Architect (Use para arquitetura complexa em sistemas distribuídos)');
  });

  it('writes command files to .gemini/commands', () => {
    const agents = [
      { id: 'dev', error: null, agent: { title: 'Developer', whenToUse: 'Implementar features' } },
      { id: 'qa', error: null, agent: { title: 'QA', whenToUse: 'Validar qualidade' } },
    ];
    const result = syncGeminiCommands(agents, tmpRoot, { dryRun: false });

    expect(result.files.length).toBe(3);
    expect(fs.existsSync(path.join(tmpRoot, '.gemini', 'commands', 'aios-menu.toml'))).toBe(true);
    expect(fs.existsSync(path.join(tmpRoot, '.gemini', 'commands', 'aios-dev.toml'))).toBe(true);
    expect(fs.existsSync(path.join(tmpRoot, '.gemini', 'commands', 'aios-qa.toml'))).toBe(true);
  });
});
