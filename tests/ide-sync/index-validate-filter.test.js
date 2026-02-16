'use strict';

const fs = require('fs-extra');
const os = require('os');
const path = require('path');

const { commandValidate } = require('../../.aios-core/infrastructure/scripts/ide-sync/index');
const { parseAllAgents } = require('../../.aios-core/infrastructure/scripts/ide-sync/agent-parser');
const claudeTransformer = require('../../.aios-core/infrastructure/scripts/ide-sync/transformers/claude-code');
const { syncGeminiCommands } = require('../../.aios-core/infrastructure/scripts/ide-sync/gemini-commands');

describe('ide-sync commandValidate --ide filter', () => {
  let tmpRoot;
  let previousCwd;

  beforeEach(async () => {
    tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'ide-sync-validate-filter-'));
    previousCwd = process.cwd();
    process.chdir(tmpRoot);

    await fs.ensureDir(path.join(tmpRoot, '.aios-core'));
    await fs.writeFile(
      path.join(tmpRoot, '.aios-core', 'core-config.yaml'),
      [
        'ideSync:',
        '  enabled: true',
        '  source: .aios-core/development/agents',
        '  targets:',
        '    claude-code:',
        '      enabled: true',
        '      path: .claude/commands/AIOS/agents',
        '      format: full-markdown-yaml',
        '    gemini:',
        '      enabled: true',
        '      path: .gemini/rules/AIOS/agents',
        '      format: full-markdown-yaml',
        '  redirects: {}',
      ].join('\n'),
      'utf8',
    );

    await fs.copy(
      path.join(previousCwd, '.aios-core', 'development', 'agents'),
      path.join(tmpRoot, '.aios-core', 'development', 'agents'),
    );

    await fs.ensureDir(path.join(tmpRoot, '.gemini', 'rules', 'AIOS', 'agents'));
    const agents = parseAllAgents(path.join(tmpRoot, '.aios-core', 'development', 'agents'));
    for (const agent of agents) {
      const content = claudeTransformer.transform(agent);
      await fs.writeFile(
        path.join(tmpRoot, '.gemini', 'rules', 'AIOS', 'agents', agent.filename),
        content,
        'utf8',
      );
    }
    syncGeminiCommands(agents, tmpRoot, { dryRun: false });
  });

  afterEach(async () => {
    process.chdir(previousCwd);
    await fs.remove(tmpRoot);
  });

  it('validates only requested IDE when --ide is provided', async () => {
    await expect(commandValidate({ ide: 'gemini', strict: true, verbose: false })).resolves.toBeUndefined();
  });
});
