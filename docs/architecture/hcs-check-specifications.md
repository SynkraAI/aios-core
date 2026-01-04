# HCS Check Specifications

**Version:** 1.0
**Status:** Proposed
**Created:** 2025-12-30
**Story:** HCS-1 Investigation
**Author:** @architect (Aria) via @dev (Dex)

---

## Table of Contents

- [Overview](#overview)
- [Check Architecture](#check-architecture)
- [Domain 1: Project Coherence](#domain-1-project-coherence)
- [Domain 2: Local Environment](#domain-2-local-environment)
- [Domain 3: Repository Health](#domain-3-repository-health)
- [Domain 4: Deployment Environment](#domain-4-deployment-environment)
- [Domain 5: Service Integration](#domain-5-service-integration)
- [IDE/CLI Check Matrix](#idecli-check-matrix)
- [Custom Check Extension](#custom-check-extension)
- [Performance Considerations](#performance-considerations)

---

## Overview

The Health Check System (HCS) performs diagnostic checks across 5 domains, totaling 33+ individual checks. Each check has:

- **Unique ID:** For tracking and reporting
- **Severity:** CRITICAL, HIGH, MEDIUM, LOW, INFO
- **Self-Healing Tier:** 1 (silent), 2 (prompted), 3 (manual guide), N/A
- **Mode:** quick (fast checks only), full (all checks)
- **Duration Target:** Expected execution time

### Check Count Summary

| Domain                 | Total Checks | Quick Mode | Full Mode |
| ---------------------- | ------------ | ---------- | --------- |
| Project Coherence      | 8            | 4          | 8         |
| Local Environment      | 8            | 5          | 8         |
| Repository Health      | 8            | 3          | 8         |
| Deployment Environment | 5            | 2          | 5         |
| Service Integration    | 4            | 4          | 4         |
| **Total**              | **33**       | **18**     | **33**    |

---

## Check Architecture

### Architecture Decision: Hybrid Pattern

Based on industry research, HCS uses a **hybrid architecture** combining:

1. **Code-based checks** for core functionality (performance, complex logic)
2. **YAML-based checks** for extensibility (custom checks, project-specific)

```
┌─────────────────────────────────────────────────────────────┐
│                    Health Check Engine                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐    ┌─────────────────────┐        │
│  │   Core Checks (JS)   │    │  Custom Checks (YAML) │       │
│  │                      │    │                       │       │
│  │  • Project Coherence │    │  • Project-specific   │       │
│  │  • Local Environment │    │  • Team conventions   │       │
│  │  • Repository Health │    │  • Integration tests  │       │
│  └──────────┬───────────┘    └───────────┬───────────┘       │
│             │                            │                   │
│             └────────────┬───────────────┘                   │
│                          ▼                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   Check Runner                         │  │
│  │  • Parallel execution    • Caching                    │  │
│  │  • Timeout handling      • Result aggregation         │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                   │
│                          ▼                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   Self-Healing                         │  │
│  │  Tier 1 → Auto-fix   Tier 2 → Prompt   Tier 3 → Guide │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Check Interface

```javascript
// Core check interface (JavaScript)
class BaseCheck {
  constructor(options) {
    this.id = options.id; // e.g., "PC-001"
    this.name = options.name; // Human-readable name
    this.domain = options.domain; // project | local | repo | deploy | services
    this.severity = options.severity; // CRITICAL | HIGH | MEDIUM | LOW | INFO
    this.tier = options.tier; // 1 | 2 | 3 | null
    this.mode = options.mode; // quick | full
    this.timeout = options.timeout || 5000; // ms
  }

  // Override in subclass
  async check(context) {
    // Returns { passed: boolean, message: string, details?: any }
    throw new Error('Not implemented');
  }

  // Optional: healing logic
  async heal(context) {
    return { healed: false, message: 'No auto-fix available' };
  }
}
```

```yaml
# Custom check definition (YAML)
id: CUSTOM-001
name: Team coding conventions check
domain: project
severity: LOW
tier: 3
mode: full
timeout: 3000

check:
  type: file-pattern
  pattern: 'src/**/*.ts'
  rule: no-console-log
  message: 'Console.log statements found in production code'

heal:
  type: manual-guide
  steps:
    - 'Remove console.log statements or use proper logging'
    - 'Run: eslint --fix src/'
```

---

## Domain 1: Project Coherence

**Purpose:** Verify AIOS framework files are properly configured and consistent.

### Checks

| ID     | Name                    | Severity | Tier | Mode  | Timeout | Description                                  |
| ------ | ----------------------- | -------- | ---- | ----- | ------- | -------------------------------------------- |
| PC-001 | Config exists           | CRITICAL | 1    | quick | 100ms   | `.aios/config.yaml` exists and is valid YAML |
| PC-002 | Agent references valid  | HIGH     | 3    | full  | 2s      | Tasks reference existing agents              |
| PC-003 | Coding standards exists | MEDIUM   | 2    | full  | 100ms   | `docs/framework/coding-standards.md` exists  |
| PC-004 | Tech stack exists       | MEDIUM   | 2    | full  | 100ms   | `docs/framework/tech-stack.md` exists        |
| PC-005 | Source tree exists      | MEDIUM   | 2    | full  | 100ms   | `docs/framework/source-tree.md` exists       |
| PC-006 | No orphan files         | LOW      | 3    | full  | 5s      | All files in `.aios-core/` are referenced    |
| PC-007 | Manifests valid         | HIGH     | 3    | quick | 1s      | All YAML manifests parse correctly           |
| PC-008 | Template paths valid    | MEDIUM   | 3    | full  | 2s      | Templates reference existing files           |

### Implementation Details

```javascript
// PC-001: Config exists
class ConfigExistsCheck extends BaseCheck {
  constructor() {
    super({
      id: 'PC-001',
      name: 'Config exists',
      domain: 'project',
      severity: 'CRITICAL',
      tier: 1,
      mode: 'quick',
      timeout: 100,
    });
  }

  async check(context) {
    const configPath = path.join(context.projectRoot, '.aios', 'config.yaml');

    if (!(await fs.pathExists(configPath))) {
      return {
        passed: false,
        message: '.aios/config.yaml not found',
        autoFixAvailable: true,
      };
    }

    try {
      const content = await fs.readFile(configPath, 'utf8');
      yaml.parse(content);
      return { passed: true, message: 'Config file valid' };
    } catch (error) {
      return {
        passed: false,
        message: `Invalid YAML: ${error.message}`,
        autoFixAvailable: true,
      };
    }
  }

  async heal(context) {
    const templatePath = '.aios-core/infrastructure/templates/core-config/config-template.yaml';
    const configPath = path.join(context.projectRoot, '.aios', 'config.yaml');

    await fs.ensureDir(path.dirname(configPath));
    await fs.copy(templatePath, configPath);

    return { healed: true, message: 'Recreated config from template' };
  }
}
```

---

## Domain 2: Local Environment

**Purpose:** Verify development environment is properly configured.

### Checks

| ID     | Name                 | Severity | Tier | Mode  | Timeout | Description                    |
| ------ | -------------------- | -------- | ---- | ----- | ------- | ------------------------------ |
| LE-001 | Node.js version      | CRITICAL | 3    | quick | 500ms   | Node.js 18+ installed          |
| LE-002 | Package manager      | CRITICAL | 3    | quick | 500ms   | npm/yarn/pnpm available        |
| LE-003 | Git configured       | CRITICAL | 3    | quick | 500ms   | Git installed with user config |
| LE-004 | GitHub CLI auth      | HIGH     | 3    | full  | 2s      | `gh auth status` passes        |
| LE-005 | MCPs responding      | HIGH     | 1    | quick | 5s      | MCP servers are healthy        |
| LE-006 | CLAUDE.md valid      | MEDIUM   | 2    | quick | 500ms   | Required sections present      |
| LE-007 | IDE rules configured | LOW      | 2    | full  | 1s      | VS Code/Cursor rules exist     |
| LE-008 | Env vars set         | HIGH     | 3    | full  | 500ms   | Required env vars defined      |

### Implementation Details

```javascript
// LE-001: Node.js version check
class NodeVersionCheck extends BaseCheck {
  constructor() {
    super({
      id: 'LE-001',
      name: 'Node.js version',
      domain: 'local',
      severity: 'CRITICAL',
      tier: 3,
      mode: 'quick',
      timeout: 500,
    });
  }

  async check(context) {
    try {
      const { stdout } = await execa('node', ['--version']);
      const version = stdout.trim().replace('v', '');
      const major = parseInt(version.split('.')[0], 10);

      if (major >= 18) {
        return {
          passed: true,
          message: `Node.js ${version} installed`,
          details: { version, major },
        };
      }

      return {
        passed: false,
        message: `Node.js ${version} is below minimum (18.0.0)`,
        guide: {
          title: 'Upgrade Node.js',
          steps: [
            'Visit https://nodejs.org/en/download/',
            'Download Node.js 18 LTS or later',
            'Run the installer',
            'Restart your terminal',
          ],
        },
      };
    } catch (error) {
      return {
        passed: false,
        message: 'Node.js not found',
        guide: {
          title: 'Install Node.js',
          steps: [
            'Visit https://nodejs.org/en/download/',
            'Download Node.js 18 LTS',
            'Run the installer',
            'Verify with: node --version',
          ],
        },
      };
    }
  }
}

// LE-005: MCP health check
class McpHealthCheck extends BaseCheck {
  constructor() {
    super({
      id: 'LE-005',
      name: 'MCPs responding',
      domain: 'local',
      severity: 'HIGH',
      tier: 1,
      mode: 'quick',
      timeout: 5000,
    });
  }

  async check(context) {
    const mcpConfig = await this.loadMcpConfig();
    const results = [];

    for (const [name, config] of Object.entries(mcpConfig.mcpServers || {})) {
      try {
        const healthy = await this.pingMcp(name, config);
        results.push({ name, healthy, error: null });
      } catch (error) {
        results.push({ name, healthy: false, error: error.message });
      }
    }

    const unhealthy = results.filter((r) => !r.healthy);

    if (unhealthy.length === 0) {
      return {
        passed: true,
        message: `All ${results.length} MCPs healthy`,
        details: { mcps: results },
      };
    }

    return {
      passed: false,
      message: `${unhealthy.length}/${results.length} MCPs unhealthy`,
      details: { mcps: results },
      autoFixAvailable: true,
    };
  }

  async heal(context) {
    // Attempt to restart unhealthy MCPs
    const unhealthy = context.details.mcps.filter((m) => !m.healthy);

    for (const mcp of unhealthy) {
      try {
        await this.restartMcp(mcp.name);
        console.log(`  Restarted: ${mcp.name}`);
      } catch (error) {
        console.error(`  Failed to restart ${mcp.name}: ${error.message}`);
      }
    }

    return { healed: true, message: 'Restarted unhealthy MCPs' };
  }
}
```

---

## Domain 3: Repository Health

**Purpose:** Verify Git repository and GitHub integration health.

### Checks

| ID     | Name                 | Severity | Tier | Mode  | Timeout | Description                           |
| ------ | -------------------- | -------- | ---- | ----- | ------- | ------------------------------------- |
| RH-001 | Workflows valid      | HIGH     | 3    | full  | 2s      | GitHub Actions YAML is valid          |
| RH-002 | No failed workflows  | MEDIUM   | 3    | full  | 5s      | Last 10 workflows passed              |
| RH-003 | Branch protection    | MEDIUM   | 3    | full  | 2s      | Main branch is protected              |
| RH-004 | Secrets configured   | HIGH     | 3    | full  | 2s      | Required secrets exist                |
| RH-005 | No stale PRs         | LOW      | 3    | full  | 3s      | No PRs older than 30 days             |
| RH-006 | Dependencies current | MEDIUM   | 2    | full  | 5s      | No outdated deps with security issues |
| RH-007 | No vulnerabilities   | CRITICAL | 3    | quick | 10s     | `npm audit` passes                    |
| RH-008 | Gitignore complete   | LOW      | 1    | quick | 100ms   | Required patterns in .gitignore       |

### Implementation Details

```javascript
// RH-007: Security vulnerabilities check
class VulnerabilityCheck extends BaseCheck {
  constructor() {
    super({
      id: 'RH-007',
      name: 'No vulnerabilities',
      domain: 'repository',
      severity: 'CRITICAL',
      tier: 3,
      mode: 'quick',
      timeout: 10000,
    });
  }

  async check(context) {
    try {
      const { stdout } = await execa('npm', ['audit', '--json'], {
        cwd: context.projectRoot,
      });

      const audit = JSON.parse(stdout);
      const vulnerabilities = audit.metadata?.vulnerabilities || {};

      const critical = vulnerabilities.critical || 0;
      const high = vulnerabilities.high || 0;

      if (critical === 0 && high === 0) {
        return {
          passed: true,
          message: 'No critical or high vulnerabilities',
          details: { vulnerabilities },
        };
      }

      return {
        passed: false,
        message: `Found ${critical} critical, ${high} high vulnerabilities`,
        details: { vulnerabilities, audit },
        guide: {
          title: 'Security Vulnerabilities Detected',
          steps: [
            'Run: npm audit for details',
            'Run: npm audit fix for automatic fixes',
            'For breaking changes: npm audit fix --force (use caution)',
            'Review CVE details before updating',
          ],
          urgency: critical > 0 ? 'IMMEDIATE' : 'HIGH',
        },
      };
    } catch (error) {
      return {
        passed: false,
        message: `Audit failed: ${error.message}`,
        details: { error: error.message },
      };
    }
  }
}
```

---

## Domain 4: Deployment Environment

**Purpose:** Verify deployment configuration and external environment health.

### Checks

| ID     | Name              | Severity | Tier | Mode  | Timeout | Description                         |
| ------ | ----------------- | -------- | ---- | ----- | ------- | ----------------------------------- |
| DE-001 | Deployment mode   | INFO     | N/A  | quick | 100ms   | Detect local/staging/prod           |
| DE-002 | Env vars per env  | HIGH     | 3    | full  | 500ms   | Environment-specific vars set       |
| DE-003 | Remote connection | HIGH     | 3    | full  | 5s      | Can reach deployment target         |
| DE-004 | SSL certificates  | CRITICAL | 3    | full  | 5s      | Certificates valid and not expiring |
| DE-005 | Service endpoints | HIGH     | 3    | full  | 10s     | API endpoints responding            |

### Implementation Details

```javascript
// DE-004: SSL certificate check
class SslCertificateCheck extends BaseCheck {
  constructor() {
    super({
      id: 'DE-004',
      name: 'SSL certificates',
      domain: 'deployment',
      severity: 'CRITICAL',
      tier: 3,
      mode: 'full',
      timeout: 5000,
    });
  }

  async check(context) {
    const endpoints = context.deploymentConfig?.endpoints || [];

    if (endpoints.length === 0) {
      return {
        passed: true,
        message: 'No HTTPS endpoints configured',
        details: { skipped: true },
      };
    }

    const results = [];
    const warningDays = 30; // Warn if expiring within 30 days

    for (const endpoint of endpoints) {
      if (!endpoint.startsWith('https://')) continue;

      try {
        const certInfo = await this.checkCertificate(endpoint);
        const daysUntilExpiry = Math.floor(
          (new Date(certInfo.validTo) - new Date()) / (1000 * 60 * 60 * 24)
        );

        results.push({
          endpoint,
          valid: certInfo.valid,
          validTo: certInfo.validTo,
          daysUntilExpiry,
          warning: daysUntilExpiry <= warningDays,
        });
      } catch (error) {
        results.push({
          endpoint,
          valid: false,
          error: error.message,
        });
      }
    }

    const invalid = results.filter((r) => !r.valid);
    const expiring = results.filter((r) => r.warning && r.valid);

    if (invalid.length > 0) {
      return {
        passed: false,
        message: `${invalid.length} invalid SSL certificate(s)`,
        details: { results },
        guide: {
          title: 'Invalid SSL Certificates',
          steps: [
            'Check certificate configuration',
            'Verify domain ownership',
            'Contact IT/DevOps team',
          ],
          urgency: 'IMMEDIATE',
        },
      };
    }

    if (expiring.length > 0) {
      return {
        passed: false,
        message: `${expiring.length} certificate(s) expiring soon`,
        details: { results },
        guide: {
          title: 'SSL Certificate Expiration Warning',
          steps: results
            .filter((r) => r.warning)
            .map((r) => `${r.endpoint}: Expires in ${r.daysUntilExpiry} days`),
          urgency: 'HIGH',
        },
      };
    }

    return {
      passed: true,
      message: 'All SSL certificates valid',
      details: { results },
    };
  }
}
```

---

## Domain 5: Service Integration

**Purpose:** Verify external service integrations are working.

### Checks

| ID     | Name            | Severity | Tier | Mode  | Timeout | Description                      |
| ------ | --------------- | -------- | ---- | ----- | ------- | -------------------------------- |
| SI-001 | Backlog manager | HIGH     | 1    | quick | 3s      | ClickUp/GitHub Issues accessible |
| SI-002 | GitHub API      | HIGH     | 1    | quick | 3s      | GitHub API responding            |
| SI-003 | MCP servers     | MEDIUM   | 1    | quick | 5s      | MCP servers operational          |
| SI-004 | Memory layer    | LOW      | 1    | quick | 2s      | Memory layer status (if enabled) |

### Implementation Details

```javascript
// SI-002: GitHub API check
class GitHubApiCheck extends BaseCheck {
  constructor() {
    super({
      id: 'SI-002',
      name: 'GitHub API',
      domain: 'services',
      severity: 'HIGH',
      tier: 1,
      mode: 'quick',
      timeout: 3000,
    });
  }

  async check(context) {
    try {
      const { stdout } = await execa('gh', ['api', 'user', '--jq', '.login'], {
        timeout: 3000,
      });

      return {
        passed: true,
        message: `GitHub authenticated as ${stdout.trim()}`,
        details: { user: stdout.trim() },
      };
    } catch (error) {
      if (error.message.includes('not logged in')) {
        return {
          passed: false,
          message: 'GitHub CLI not authenticated',
          guide: {
            title: 'Authenticate GitHub CLI',
            steps: [
              'Run: gh auth login',
              'Follow the prompts to authenticate',
              'Verify with: gh auth status',
            ],
          },
        };
      }

      return {
        passed: false,
        message: `GitHub API error: ${error.message}`,
        autoFixAvailable: true,
      };
    }
  }

  async heal(context) {
    // Attempt to refresh auth
    try {
      await execa('gh', ['auth', 'refresh']);
      return { healed: true, message: 'Refreshed GitHub authentication' };
    } catch (error) {
      return { healed: false, message: 'Manual re-authentication required' };
    }
  }
}
```

---

## IDE/CLI Check Matrix

### Detection Methods

| IDE/CLI         | Config File                  | Detection Method    | Validation        |
| --------------- | ---------------------------- | ------------------- | ----------------- |
| **VS Code**     | `.vscode/settings.json`      | File exists         | JSON schema       |
| **Cursor**      | `.cursorrules`               | File exists         | Content patterns  |
| **Windsurf**    | `.windsurf/rules/`           | Directory exists    | TBD               |
| **Claude Code** | `.claude/CLAUDE.md`          | File exists         | Required sections |
| **MCPs**        | `.claude.json` / `.mcp.json` | File exists         | MCP health ping   |
| **Git**         | `.gitconfig`                 | `git config --list` | Required settings |
| **GitHub CLI**  | N/A                          | `gh auth status`    | Auth check        |
| **Node.js**     | N/A                          | `node --version`    | Version >= 18     |
| **npm**         | `package.json`               | `npm --version`     | Version >= 9      |

### CLAUDE.md Validation

```javascript
// Required sections in CLAUDE.md
const requiredSections = [
  'Project Overview', // or 'AIOS-FULLSTACK Development Rules'
  'Agent System', // or 'Workflow Execution'
  'Git Conventions', // or 'Best Practices'
];

async function validateClaudeMd(content) {
  const missing = [];

  for (const section of requiredSections) {
    const pattern = new RegExp(`^#+\\s*${section}`, 'im');
    if (!pattern.test(content)) {
      // Check alternative names
      const altPattern = new RegExp(`^#+\\s*(${getAlternatives(section).join('|')})`, 'im');
      if (!altPattern.test(content)) {
        missing.push(section);
      }
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}
```

### IDE Configuration Checks

```yaml
# .aios-core/health-check/checks/ide-checks.yaml
checks:
  - id: IDE-VSCODE
    name: 'VS Code configuration'
    detection:
      - file: '.vscode/settings.json'
      - file: '.vscode/extensions.json'
    validation:
      type: json-schema
      schema: '.aios-core/schemas/vscode-settings.json'
    autoFix:
      tier: 2
      action: 'create-from-template'
      template: '.aios-core/infrastructure/templates/ide/vscode-settings.json'

  - id: IDE-CURSOR
    name: 'Cursor configuration'
    detection:
      - file: '.cursorrules'
      - directory: '.cursor/rules/'
    validation:
      type: content-pattern
      patterns:
        - 'You are'
        - 'AIOS'
    autoFix:
      tier: 2
      action: 'create-from-template'

  - id: IDE-CLAUDE
    name: 'Claude Code configuration'
    detection:
      - file: '.claude/CLAUDE.md'
    validation:
      type: section-check
      sections: ['Agent System', 'Git Conventions']
    autoFix:
      tier: 2
      action: 'merge-template'
```

---

## Custom Check Extension

### YAML-based Custom Checks

Users can define project-specific checks in `.aios/custom-checks.yaml`:

```yaml
# .aios/custom-checks.yaml
version: 1.0

checks:
  # File existence check
  - id: CUSTOM-001
    name: 'README exists'
    type: file-exists
    path: 'README.md'
    severity: MEDIUM
    tier: 2
    mode: quick
    autoFix:
      action: create-from-template
      template: '.aios-core/infrastructure/templates/project-docs/readme-template.md'

  # Content pattern check
  - id: CUSTOM-002
    name: 'No TODO comments in production'
    type: content-pattern
    glob: 'src/**/*.{js,ts}'
    pattern: 'TODO|FIXME|HACK'
    negate: true # Fail if pattern found
    severity: LOW
    tier: 3
    mode: full
    message: 'Found TODO/FIXME comments - consider resolving before release'

  # Command check
  - id: CUSTOM-003
    name: 'TypeScript compiles'
    type: command
    command: 'npm run typecheck'
    expectedExitCode: 0
    severity: HIGH
    tier: 3
    mode: full
    timeout: 30000

  # API health check
  - id: CUSTOM-004
    name: 'Internal API reachable'
    type: http-health
    url: 'https://api.internal.example.com/health'
    method: GET
    expectedStatus: 200
    timeout: 5000
    severity: HIGH
    tier: 3
    mode: full

  # JSON schema validation
  - id: CUSTOM-005
    name: 'Package.json valid'
    type: json-schema
    path: 'package.json'
    schema: '.aios-core/schemas/package-json.json'
    severity: CRITICAL
    tier: 3
    mode: quick
```

### Custom Check Types

| Type              | Description                         | Parameters                        |
| ----------------- | ----------------------------------- | --------------------------------- |
| `file-exists`     | Check if file exists                | `path`                            |
| `dir-exists`      | Check if directory exists           | `path`                            |
| `content-pattern` | Search for pattern in files         | `glob`, `pattern`, `negate`       |
| `command`         | Execute command and check exit code | `command`, `expectedExitCode`     |
| `http-health`     | HTTP endpoint health check          | `url`, `method`, `expectedStatus` |
| `json-schema`     | Validate JSON against schema        | `path`, `schema`                  |
| `yaml-valid`      | Check YAML is parseable             | `path`                            |
| `env-var`         | Check environment variable          | `name`, `pattern`                 |

---

## Performance Considerations

### Execution Order

```javascript
// Priority order for checks (fail-fast strategy)
const checkPriority = {
  CRITICAL: 1, // Run first, stop if fails
  HIGH: 2,
  MEDIUM: 3,
  LOW: 4,
  INFO: 5, // Run last, never fails
};

// Quick mode runs only priority 1-2
// Full mode runs all priorities
```

### Parallel Execution Groups

```javascript
// Checks that can run in parallel (no dependencies)
const parallelGroups = [
  // Group 1: Fast file checks
  ['PC-001', 'PC-003', 'PC-004', 'PC-005', 'RH-008'],

  // Group 2: Version checks
  ['LE-001', 'LE-002', 'LE-003'],

  // Group 3: Network checks (shared pool)
  ['LE-005', 'SI-001', 'SI-002', 'SI-003'],

  // Group 4: Expensive checks (run last)
  ['RH-007', 'PC-002', 'PC-006'],
];
```

### Caching Strategy

```javascript
const checkCache = new Map();

// Cache configuration per check type
const cacheConfig = {
  'file-exists': { ttl: 60000, key: 'path' }, // 1 min
  'content-pattern': { ttl: 300000, key: 'glob+pattern' }, // 5 min
  command: { ttl: 0 }, // No cache
  'http-health': { ttl: 30000, key: 'url' }, // 30 sec
  'node-version': { ttl: 3600000 }, // 1 hour
};
```

### Timeout Handling

```javascript
async function runCheckWithTimeout(check, context) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Check timed out')), check.timeout);
  });

  try {
    const result = await Promise.race([check.check(context), timeoutPromise]);
    return result;
  } catch (error) {
    return {
      passed: false,
      message: `Check failed: ${error.message}`,
      timedOut: error.message === 'Check timed out',
    };
  }
}
```

---

## Related Documents

- [ADR: HCS Architecture](./adr/adr-hcs-health-check-system.md)
- [HCS Execution Modes](./hcs-execution-modes.md)
- [HCS Self-Healing Specification](./hcs-self-healing-spec.md)
- [Story HCS-2: Implementation](../stories/epics/epic-health-check-system/story-hcs-2-implementation.md)

---

_Document created as part of Story HCS-1 Investigation_
