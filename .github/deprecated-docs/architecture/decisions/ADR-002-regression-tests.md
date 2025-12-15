# ADR-002: Regression Test Suite

**Parent ADR:** [ADR-002-modular-architecture.md](./ADR-002-modular-architecture.md)
**Story:** [Story 2.1 - Module Structure Design](../../../docs/stories/v2.1/sprint-2/story-2.1-module-structure-design.md)
**Created:** 2025-11-27

## Overview

This document defines the regression test suite to validate the modular migration does not break existing functionality.

## Test Categories

### 1. CORE Module Tests

**Purpose:** Verify core framework functionality remains intact.

| Test ID | Test Name | Description | Priority |
|---------|-----------|-------------|----------|
| CORE-01 | Config Loading | Load config files from new location | P0 |
| CORE-02 | Config Caching | Verify cache hits/misses work | P1 |
| CORE-03 | Session Management | Read/write session state | P0 |
| CORE-04 | Elicitation Engine | Run interactive prompt | P0 |
| CORE-05 | YAML Validation | Validate YAML syntax | P1 |
| CORE-06 | Output Formatting | Format agent output | P1 |
| CORE-07 | Package Exports | Require main entry point | P0 |

**Test Script: `core.test.js`**

```javascript
const assert = require('assert');
const path = require('path');

describe('CORE Module', () => {
  describe('Config System', () => {
    it('CORE-01: should load config from new path', async () => {
      const { globalConfigCache } = require('../core/config/config-cache');
      assert(globalConfigCache !== undefined);
    });

    it('CORE-02: should cache loaded configs', async () => {
      const cache = require('../core/config/config-cache');
      cache.globalConfigCache.set('test', { value: 1 });
      assert.equal(cache.globalConfigCache.get('test').value, 1);
    });
  });

  describe('Session Management', () => {
    it('CORE-03: should read/write session', async () => {
      const SessionLoader = require('../core/session/context-loader');
      // Verify session operations
    });
  });

  describe('Elicitation', () => {
    it('CORE-04: should create elicitation engine', () => {
      const ElicitationEngine = require('../core/elicitation/elicitation-engine');
      const engine = new ElicitationEngine();
      assert(engine !== undefined);
    });
  });

  describe('Utilities', () => {
    it('CORE-05: should validate YAML', () => {
      const { validateYAML } = require('../core/utils/yaml-validator');
      const result = validateYAML('key: value');
      assert(result.valid === true);
    });
  });

  describe('Package Exports', () => {
    it('CORE-07: should export from main entry', () => {
      const aiosCore = require('../core');
      assert(aiosCore !== undefined);
    });
  });
});
```

### 2. DEVELOPMENT Module Tests

**Purpose:** Verify agent, task, and workflow functionality.

| Test ID | Test Name | Description | Priority |
|---------|-----------|-------------|----------|
| DEV-01 | Agent Load | Load agent definition file | P0 |
| DEV-02 | Agent Config | Parse agent YAML config | P0 |
| DEV-03 | Greeting Build | Generate agent greeting | P0 |
| DEV-04 | Task Load | Load task definition | P0 |
| DEV-05 | Workflow Load | Load workflow definition | P0 |
| DEV-06 | Team Config | Load team configuration | P1 |
| DEV-07 | Story Management | Create/update story | P0 |
| DEV-08 | Decision Log | Record decision | P1 |
| DEV-09 | Agent Exit | Run exit hooks | P1 |

**Test Script: `development.test.js`**

```javascript
const assert = require('assert');
const fs = require('fs').promises;
const path = require('path');

describe('DEVELOPMENT Module', () => {
  describe('Agent Loading', () => {
    it('DEV-01: should load agent definition', async () => {
      const agentsDir = path.join(__dirname, '../development/agents');
      const devAgent = await fs.readFile(path.join(agentsDir, 'dev.md'), 'utf-8');
      assert(devAgent.includes('# dev'));
    });

    it('DEV-02: should parse agent config', async () => {
      const { AgentConfigLoader } = require('../development/scripts/agent-config-loader');
      const loader = new AgentConfigLoader();
      const config = await loader.loadAgent('dev');
      assert(config.agent.name === 'Dex');
    });
  });

  describe('Greeting System', () => {
    it('DEV-03: should build greeting', async () => {
      const GreetingBuilder = require('../development/scripts/greeting-builder');
      const builder = new GreetingBuilder();
      // Verify greeting generation
    });
  });

  describe('Task System', () => {
    it('DEV-04: should load task definition', async () => {
      const tasksDir = path.join(__dirname, '../development/tasks');
      const files = await fs.readdir(tasksDir);
      assert(files.length > 0);
    });
  });

  describe('Workflow System', () => {
    it('DEV-05: should load workflow', async () => {
      const workflowsDir = path.join(__dirname, '../development/workflows');
      const files = await fs.readdir(workflowsDir);
      assert(files.includes('greenfield-fullstack.yaml'));
    });
  });

  describe('Story Management', () => {
    it('DEV-07: should manage stories', async () => {
      const { StoryManager } = require('../development/scripts/story-manager');
      // Verify story operations
    });
  });
});
```

### 3. PRODUCT Module Tests

**Purpose:** Verify templates and checklists are accessible.

| Test ID | Test Name | Description | Priority |
|---------|-----------|-------------|----------|
| PROD-01 | Template Load | Load template file | P0 |
| PROD-02 | Template Render | Render template with data | P0 |
| PROD-03 | Checklist Load | Load checklist file | P0 |
| PROD-04 | Checklist Parse | Parse checklist items | P1 |
| PROD-05 | Data Files | Load PM data files | P1 |

**Test Script: `product.test.js`**

```javascript
const assert = require('assert');
const fs = require('fs').promises;
const path = require('path');
const yaml = require('yaml');

describe('PRODUCT Module', () => {
  describe('Templates', () => {
    it('PROD-01: should load template', async () => {
      const templatesDir = path.join(__dirname, '../product/templates');
      const template = await fs.readFile(
        path.join(templatesDir, 'story-tmpl.yaml'),
        'utf-8'
      );
      assert(template.length > 0);
    });

    it('PROD-02: should parse template YAML', async () => {
      const templatesDir = path.join(__dirname, '../product/templates');
      const content = await fs.readFile(
        path.join(templatesDir, 'prd-tmpl.yaml'),
        'utf-8'
      );
      const parsed = yaml.parse(content);
      assert(parsed !== null);
    });
  });

  describe('Checklists', () => {
    it('PROD-03: should load checklist', async () => {
      const checklistsDir = path.join(__dirname, '../product/checklists');
      const checklist = await fs.readFile(
        path.join(checklistsDir, 'story-dod-checklist.md'),
        'utf-8'
      );
      assert(checklist.includes('- [ ]') || checklist.includes('- [x]'));
    });
  });

  describe('Data Files', () => {
    it('PROD-05: should load PM data', async () => {
      const dataDir = path.join(__dirname, '../product/data');
      const files = await fs.readdir(dataDir);
      assert(files.length > 0);
    });
  });
});
```

### 4. INFRASTRUCTURE Module Tests

**Purpose:** Verify tools, integrations, and scripts work.

| Test ID | Test Name | Description | Priority |
|---------|-----------|-------------|----------|
| INFRA-01 | Git Wrapper | Git operations work | P0 |
| INFRA-02 | PM Adapters | Load PM adapter | P1 |
| INFRA-03 | Tool Resolver | Resolve tool config | P1 |
| INFRA-04 | Template Engine | Render templates | P0 |
| INFRA-05 | Component Gen | Generate component | P1 |
| INFRA-06 | Security Check | Run security scan | P1 |
| INFRA-07 | Test Generator | Generate test file | P2 |

**Test Script: `infrastructure.test.js`**

```javascript
const assert = require('assert');

describe('INFRASTRUCTURE Module', () => {
  describe('Git Integration', () => {
    it('INFRA-01: should create git wrapper', () => {
      const GitWrapper = require('../infrastructure/scripts/git-wrapper');
      const git = new GitWrapper();
      assert(typeof git.status === 'function');
    });
  });

  describe('PM Adapters', () => {
    it('INFRA-02: should load adapter factory', () => {
      const { getPMAdapter } = require('../infrastructure/integrations/pm-adapter-factory');
      assert(typeof getPMAdapter === 'function');
    });
  });

  describe('Tools', () => {
    it('INFRA-03: should resolve tool', async () => {
      const { resolveTool } = require('../infrastructure/scripts/tool-resolver');
      // Verify tool resolution
    });
  });

  describe('Template Engine', () => {
    it('INFRA-04: should create template engine', () => {
      const TemplateEngine = require('../infrastructure/scripts/template-engine');
      const engine = new TemplateEngine();
      assert(engine !== undefined);
    });
  });
});
```

## Smoke Tests

Quick sanity checks to run after migration:

```bash
#!/bin/bash
# smoke-test.sh

echo "🔥 Running Smoke Tests..."

# 1. Entry point loads
echo -n "1. Entry point... "
node -e "require('./.aios-core')" && echo "✅" || echo "❌"

# 2. Agent loads
echo -n "2. Agent load... "
node -e "
  const { AgentConfigLoader } = require('./.aios-core/development/scripts/agent-config-loader');
  new AgentConfigLoader().loadAgent('dev').then(() => process.exit(0)).catch(() => process.exit(1));
" && echo "✅" || echo "❌"

# 3. Template loads
echo -n "3. Template load... "
node -e "
  const fs = require('fs');
  fs.readFileSync('./.aios-core/product/templates/story-tmpl.yaml');
" && echo "✅" || echo "❌"

# 4. Checklist loads
echo -n "4. Checklist load... "
node -e "
  const fs = require('fs');
  fs.readFileSync('./.aios-core/product/checklists/story-dod-checklist.md');
" && echo "✅" || echo "❌"

# 5. Git wrapper loads
echo -n "5. Git wrapper... "
node -e "
  const GitWrapper = require('./.aios-core/infrastructure/scripts/git-wrapper');
  new GitWrapper();
" && echo "✅" || echo "❌"

echo ""
echo "Smoke tests complete!"
```

## Rollback Criteria

**Trigger Rollback If:**

| Condition | Action |
|-----------|--------|
| Any P0 test fails | Immediate rollback |
| >20% P1 tests fail | Rollback and investigate |
| Agent activation broken | Immediate rollback |
| Story management broken | Immediate rollback |
| Production errors spike | Rollback and investigate |

## Test Execution Schedule

### Pre-Migration
1. Run full test suite, record baseline
2. Run smoke tests, verify all pass
3. Document any existing failures

### During Migration
1. After each module move, run module-specific tests
2. Run smoke tests after each phase
3. Fix any failures before proceeding

### Post-Migration
1. Run full test suite
2. Compare results to baseline
3. Run smoke tests
4. Monitor for 24 hours

## CI/CD Integration

Add to GitHub Actions:

```yaml
# .github/workflows/test-modular.yml
name: Modular Migration Tests

on:
  push:
    paths:
      - '.aios-core/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: bash .aios-core/infrastructure/tests/smoke-test.sh
```

## Test Coverage Requirements

| Module | Min Coverage | Target Coverage |
|--------|-------------|-----------------|
| core | 80% | 90% |
| development | 70% | 85% |
| product | 60% | 75% |
| infrastructure | 65% | 80% |

## References

- [ADR-002 Main Document](./ADR-002-modular-architecture.md)
- [Migration Map](./ADR-002-migration-map.md)
- [Validation Plan](./ADR-002-validation-plan.md)
- [Existing Test Suite](../../../.aios-core/tests/regression-suite-v2.md)
