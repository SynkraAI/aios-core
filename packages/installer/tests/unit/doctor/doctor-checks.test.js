/**
 * Unit Tests: Doctor Check Modules
 * Story INS-4.1: aios doctor rewrite
 *
 * Tests all 12 check modules individually with mocked filesystem.
 */

const path = require('path');
const fs = require('fs');

// Mock fs for controlled test scenarios
jest.mock('fs');

const nodeVersionCheck = require('../../../../../.aios-core/core/doctor/checks/node-version');
const npmPackagesCheck = require('../../../../../.aios-core/core/doctor/checks/npm-packages');
const settingsJsonCheck = require('../../../../../.aios-core/core/doctor/checks/settings-json');
const rulesFilesCheck = require('../../../../../.aios-core/core/doctor/checks/rules-files');
const agentMemoryCheck = require('../../../../../.aios-core/core/doctor/checks/agent-memory');
const entityRegistryCheck = require('../../../../../.aios-core/core/doctor/checks/entity-registry');
const gitHooksCheck = require('../../../../../.aios-core/core/doctor/checks/git-hooks');
const coreConfigCheck = require('../../../../../.aios-core/core/doctor/checks/core-config');
const claudeMdCheck = require('../../../../../.aios-core/core/doctor/checks/claude-md');
const graphDashboardCheck = require('../../../../../.aios-core/core/doctor/checks/graph-dashboard');
const codeIntelCheck = require('../../../../../.aios-core/core/doctor/checks/code-intel');
const ideSyncCheck = require('../../../../../.aios-core/core/doctor/checks/ide-sync');

const mockContext = {
  projectRoot: '/mock/project',
  frameworkRoot: '/mock/framework',
  options: { fix: false, json: false, dryRun: false, quiet: false },
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('node-version check', () => {
  it('should PASS for current Node.js version (>=18)', async () => {
    const result = await nodeVersionCheck.run(mockContext);
    expect(result.check).toBe('node-version');
    expect(result.status).toBe('PASS');
    expect(result.message).toContain('Node.js');
  });
});

describe('npm-packages check', () => {
  it('should PASS when node_modules exists', async () => {
    fs.existsSync.mockReturnValue(true);
    const result = await npmPackagesCheck.run(mockContext);
    expect(result.status).toBe('PASS');
    expect(result.message).toBe('node_modules present');
  });

  it('should FAIL when node_modules missing', async () => {
    fs.existsSync.mockReturnValue(false);
    const result = await npmPackagesCheck.run(mockContext);
    expect(result.status).toBe('FAIL');
    expect(result.fixCommand).toBe('npm install');
  });
});

describe('settings-json check', () => {
  it('should PASS with valid settings and sufficient deny rules', async () => {
    fs.existsSync.mockReturnValue(true);
    const mockSettings = {
      permissions: {
        deny: new Array(50).fill('Edit(.aios-core/core/)'),
        allow: ['Edit(docs/)'],
      },
    };
    const coreConfig = 'boundary:\n  protected:\n    - .aios-core/core/**\n  exceptions:\n    - agents/MEMORY.md';
    fs.readFileSync.mockImplementation((p) => {
      if (p.includes('settings.json')) return JSON.stringify(mockSettings);
      if (p.includes('core-config')) return coreConfig;
      return '';
    });

    const result = await settingsJsonCheck.run(mockContext);
    expect(result.status).toBe('PASS');
    expect(result.message).toContain('50 rules');
  });

  it('should FAIL when settings.json not found', async () => {
    fs.existsSync.mockReturnValue(false);
    const result = await settingsJsonCheck.run(mockContext);
    expect(result.status).toBe('FAIL');
  });

  it('should WARN when deny rules below threshold', async () => {
    fs.existsSync.mockReturnValue(true);
    const mockSettings = { permissions: { deny: ['one'], allow: [] } };
    fs.readFileSync.mockReturnValue(JSON.stringify(mockSettings));

    const result = await settingsJsonCheck.run(mockContext);
    expect(result.status).toBe('WARN');
  });

  it('should WARN when boundary paths not covered by deny rules', async () => {
    fs.existsSync.mockReturnValue(true);
    const mockSettings = {
      permissions: {
        deny: new Array(50).fill('Edit(docs/)'),
        allow: [],
      },
    };
    const coreConfig = 'boundary:\n  protected:\n    - .aios-core/core/**\n    - bin/aios.js\n  exceptions:\n    - test';
    fs.readFileSync.mockImplementation((p) => {
      if (p.includes('settings.json')) return JSON.stringify(mockSettings);
      if (p.includes('core-config')) return coreConfig;
      return '';
    });

    const result = await settingsJsonCheck.run(mockContext);
    expect(result.status).toBe('WARN');
    expect(result.message).toContain('boundary coverage');
  });
});

describe('rules-files check', () => {
  it('should PASS when all 7 rules files exist', async () => {
    fs.existsSync.mockReturnValue(true);
    const result = await rulesFilesCheck.run(mockContext);
    expect(result.status).toBe('PASS');
    expect(result.message).toContain('7');
  });

  it('should FAIL when rules directory missing', async () => {
    fs.existsSync.mockReturnValue(false);
    const result = await rulesFilesCheck.run(mockContext);
    expect(result.status).toBe('FAIL');
  });

  it('should WARN when some rules missing', async () => {
    fs.existsSync.mockImplementation((p) => {
      // Directory exists
      if (p.endsWith('rules')) return true;
      // Most files exist except 2
      if (p.includes('agent-authority') || p.includes('workflow-execution')) return false;
      return true;
    });

    const result = await rulesFilesCheck.run(mockContext);
    expect(result.status).toBe('WARN');
    expect(result.message).toContain('Missing 2');
  });
});

describe('agent-memory check', () => {
  it('should PASS when all 10 MEMORY.md files exist', async () => {
    fs.existsSync.mockReturnValue(true);
    const result = await agentMemoryCheck.run(mockContext);
    expect(result.status).toBe('PASS');
    expect(result.message).toContain('10/10');
  });

  it('should WARN when some MEMORY.md files missing', async () => {
    fs.existsSync.mockImplementation((p) => {
      if (p.endsWith('agents')) return true;
      if (p.includes('analyst') || p.includes('ux')) return false;
      return true;
    });

    const result = await agentMemoryCheck.run(mockContext);
    expect(result.status).toBe('WARN');
    expect(result.message).toContain('8/10');
  });
});

describe('entity-registry check', () => {
  it('should PASS when registry exists and is fresh', async () => {
    fs.existsSync.mockReturnValue(true);
    fs.statSync.mockReturnValue({ mtimeMs: Date.now() - 1000 });
    fs.readFileSync.mockReturnValue('line1\nline2\nline3');

    const result = await entityRegistryCheck.run(mockContext);
    expect(result.status).toBe('PASS');
  });

  it('should FAIL when registry not found', async () => {
    fs.existsSync.mockReturnValue(false);
    const result = await entityRegistryCheck.run(mockContext);
    expect(result.status).toBe('FAIL');
  });

  it('should WARN when registry is stale (>48h)', async () => {
    fs.existsSync.mockReturnValue(true);
    fs.statSync.mockReturnValue({ mtimeMs: Date.now() - 72 * 60 * 60 * 1000 });
    fs.readFileSync.mockReturnValue('line1\nline2');

    const result = await entityRegistryCheck.run(mockContext);
    expect(result.status).toBe('WARN');
    expect(result.message).toContain('72h');
  });
});

describe('git-hooks check', () => {
  it('should PASS when both hooks exist', async () => {
    fs.existsSync.mockReturnValue(true);
    const result = await gitHooksCheck.run(mockContext);
    expect(result.status).toBe('PASS');
  });

  it('should WARN when .husky directory missing', async () => {
    fs.existsSync.mockReturnValue(false);
    const result = await gitHooksCheck.run(mockContext);
    expect(result.status).toBe('WARN');
  });
});

describe('core-config check', () => {
  it('should PASS when config has all required sections', async () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue('boundary:\n  test: true\nproject:\n  name: test\nide:\n  sync: true');

    const result = await coreConfigCheck.run(mockContext);
    expect(result.status).toBe('PASS');
  });

  it('should FAIL when config missing', async () => {
    fs.existsSync.mockReturnValue(false);
    const result = await coreConfigCheck.run(mockContext);
    expect(result.status).toBe('FAIL');
  });

  it('should FAIL when missing required sections', async () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue('project:\n  name: test');

    const result = await coreConfigCheck.run(mockContext);
    expect(result.status).toBe('FAIL');
    expect(result.message).toContain('boundary');
  });
});

describe('claude-md check', () => {
  it('should PASS when all sections present', async () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(
      '## Constitution\n## Framework vs Project Boundary\n## Sistema de Agentes',
    );

    const result = await claudeMdCheck.run(mockContext);
    expect(result.status).toBe('PASS');
  });

  it('should WARN when sections missing', async () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue('## Constitution\nSome content');

    const result = await claudeMdCheck.run(mockContext);
    expect(result.status).toBe('WARN');
    expect(result.message).toContain('Missing sections');
  });
});

describe('graph-dashboard check', () => {
  it('should PASS when directory has .js files', async () => {
    fs.existsSync.mockReturnValue(true);
    fs.readdirSync.mockReturnValue(['index.js', 'cli.js']);

    const result = await graphDashboardCheck.run(mockContext);
    expect(result.status).toBe('PASS');
  });

  it('should WARN when directory missing', async () => {
    fs.existsSync.mockReturnValue(false);
    const result = await graphDashboardCheck.run(mockContext);
    expect(result.status).toBe('WARN');
  });
});

describe('code-intel check', () => {
  it('should return INFO when not configured', async () => {
    fs.existsSync.mockReturnValue(false);
    const result = await codeIntelCheck.run(mockContext);
    expect(result.status).toBe('INFO');
  });

  it('should PASS when configured in core-config', async () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue('codeIntel:\n  provider: test');

    const result = await codeIntelCheck.run(mockContext);
    expect(result.status).toBe('PASS');
  });
});

describe('ide-sync check', () => {
  it('should PASS when counts match', async () => {
    fs.existsSync.mockReturnValue(true);
    fs.readdirSync.mockImplementation((p) => {
      if (p.includes('commands')) return ['dev.md', 'qa.md'];
      return ['dev', 'qa'];
    });
    fs.statSync.mockReturnValue({ isDirectory: () => true });

    const result = await ideSyncCheck.run(mockContext);
    expect(result.status).toBe('PASS');
  });

  it('should WARN when counts mismatch', async () => {
    fs.existsSync.mockReturnValue(true);
    fs.readdirSync.mockImplementation((p) => {
      if (p.includes('commands')) return ['dev.md', 'qa.md', 'pm.md'];
      return ['dev', 'qa'];
    });
    fs.statSync.mockReturnValue({ isDirectory: () => true });

    const result = await ideSyncCheck.run(mockContext);
    expect(result.status).toBe('WARN');
  });
});
