# Story HCS-2: Health Check System Implementation

**Epic:** Health Check System (HCS)
**Story ID:** HCS-2
**Sprint:** 7-8 (Post Open-Source Launch)
**Priority:** High
**Points:** 13
**Effort:** 16 hours (estimates to be refined in HCS-1)
**Status:** Blocked by HCS-1
**Type:** Implementation

---

## User Story

**Como** desenvolvedor usando AIOS,
**Quero** executar `*health-check` a qualquer momento,
**Para que** possa diagnosticar problemas, receber sugestões de technical debt e ter problemas triviais auto-corrigidos.

---

## Objective

Implementar o sistema completo de Health Check com:
1. 5 domínios de verificação
2. Self-healing com 3 tiers
3. Relatório markdown
4. Dashboard visual
5. Modos de execução configurados (baseado em HCS-1)

---

## Acceptance Criteria

### Core Functionality

- [ ] AC2.1: Task `*health-check` executável pelo @devops
- [ ] AC2.2: Verifica os 5 domínios (Project, Local, Repo, Deploy, Services)
- [ ] AC2.3: Gera score de saúde (0-100) por domínio e geral
- [ ] AC2.4: Execução completa em menos de 60 segundos (fast mode: 10s)

### Self-Healing

- [ ] AC2.5: Auto-fix silencioso para issues triviais (Tier 1)
- [ ] AC2.6: Prompt de confirmação para issues moderados (Tier 2)
- [ ] AC2.7: Guia manual para issues críticos (Tier 3)
- [ ] AC2.8: Backups criados antes de qualquer modificação
- [ ] AC2.9: Log de todas as ações de self-healing

### Reporting

- [ ] AC2.10: Gera relatório markdown em `.aios/reports/`
- [ ] AC2.11: Relatório inclui: summary, critical issues, auto-fixed, recommendations
- [ ] AC2.12: Export JSON para dashboard

### Dashboard

- [ ] AC2.13: Dashboard visual mostra health score
- [ ] AC2.14: Cards por domínio com drill-down
- [ ] AC2.15: Trend chart de health ao longo do tempo
- [ ] AC2.16: Lista de issues com ações

### Integration

- [ ] AC2.17: Reutiliza componentes de Story 3.11
- [ ] AC2.18: Integra com CI/CD (modo definido em HCS-1)
- [ ] AC2.19: Documentação de uso completa

---

## Scope

### Domain Checks Implementation

#### Domain 1: Project Coherence 🔧

| Check ID | Check | Severity | Auto-Fix |
|----------|-------|----------|----------|
| PC-001 | `.aios/config.yaml` exists | CRITICAL | Tier 1 |
| PC-002 | Tasks ↔ Agents references valid | HIGH | Tier 3 |
| PC-003 | `coding-standards.md` exists | MEDIUM | Tier 2 |
| PC-004 | `tech-stack.md` exists | MEDIUM | Tier 2 |
| PC-005 | `source-tree.md` exists | MEDIUM | Tier 2 |
| PC-006 | No orphan files in `.aios-core/` | LOW | Tier 3 |
| PC-007 | Manifests valid YAML | HIGH | Tier 3 |
| PC-008 | Templates reference valid paths | MEDIUM | Tier 3 |

#### Domain 2: Local Environment 💻

| Check ID | Check | Severity | Auto-Fix |
|----------|-------|----------|----------|
| LE-001 | Node.js installed (version check) | CRITICAL | Tier 3 |
| LE-002 | npm/yarn available | CRITICAL | Tier 3 |
| LE-003 | Git installed and configured | CRITICAL | Tier 3 |
| LE-004 | GitHub CLI authenticated | HIGH | Tier 3 |
| LE-005 | MCPs responding | HIGH | Tier 1 |
| LE-006 | `CLAUDE.md` valid structure | MEDIUM | Tier 2 |
| LE-007 | IDE rules configured (Cursor, VS Code) | LOW | Tier 2 |
| LE-008 | Required env vars set | HIGH | Tier 3 |

#### Domain 3: Repository Health 📦

| Check ID | Check | Severity | Auto-Fix |
|----------|-------|----------|----------|
| RH-001 | GitHub Actions workflows valid | HIGH | Tier 3 |
| RH-002 | No failed workflows (last 10) | MEDIUM | Tier 3 |
| RH-003 | Branch protection on main | MEDIUM | Tier 3 |
| RH-004 | Required secrets configured | HIGH | Tier 3 |
| RH-005 | No stale PRs (>30 days) | LOW | Tier 3 |
| RH-006 | Dependencies up to date | MEDIUM | Tier 2 |
| RH-007 | No critical vulnerabilities | CRITICAL | Tier 3 |
| RH-008 | `.gitignore` complete | LOW | Tier 1 |

#### Domain 4: Deployment Environment 🚀

| Check ID | Check | Severity | Auto-Fix |
|----------|-------|----------|----------|
| DE-001 | Deployment mode detected (local/staging/prod) | INFO | N/A |
| DE-002 | Environment vars per environment | HIGH | Tier 3 |
| DE-003 | Remote connection healthy (if applicable) | HIGH | Tier 3 |
| DE-004 | SSL certificates valid (if applicable) | CRITICAL | Tier 3 |
| DE-005 | Service endpoints responding | HIGH | Tier 3 |

#### Domain 5: Service Integration 🔗

| Check ID | Check | Severity | Auto-Fix |
|----------|-------|----------|----------|
| SI-001 | Backlog manager operational | HIGH | Tier 1 |
| SI-002 | GitHub API accessible | HIGH | Tier 1 |
| SI-003 | MCP servers healthy | MEDIUM | Tier 1 |
| SI-004 | Memory layer status (if enabled) | LOW | Tier 1 |

---

## Technical Implementation

### Task Definition

**Arquivo:** `.aios-core/tasks/health-check.yaml`

```yaml
task:
  id: health-check
  name: AIOS Health Check
  description: Comprehensive system health diagnosis with self-healing
  agent: devops

  parameters:
    - name: mode
      type: enum
      options: [quick, full, domain]
      default: quick
      description: Check thoroughness level

    - name: domain
      type: enum
      options: [project, local, repo, deploy, services, all]
      default: all
      description: Specific domain to check (when mode=domain)

    - name: auto-fix
      type: boolean
      default: true
      description: Enable self-healing for trivial issues

    - name: report
      type: boolean
      default: true
      description: Generate markdown report

  outputs:
    - health-score: Overall health score (0-100)
    - report-path: Path to generated report
    - issues-count: Number of issues found
    - fixed-count: Number of auto-fixed issues
```

### Core Module Structure

```javascript
// .aios-core/health-check/index.js
const HealthCheckEngine = require('./engine');
const checks = require('./checks');
const healers = require('./healers');
const reporters = require('./reporters');

class HealthCheck {
  constructor(config) {
    this.engine = new HealthCheckEngine(config);
    this.checks = checks;
    this.healers = healers;
    this.reporters = reporters;
  }

  async run(options = {}) {
    const { mode = 'quick', domain = 'all', autoFix = true } = options;

    // 1. Select checks based on mode and domain
    const selectedChecks = this.selectChecks(mode, domain);

    // 2. Execute checks
    const results = await this.engine.runChecks(selectedChecks);

    // 3. Apply self-healing if enabled
    if (autoFix) {
      await this.healers.applyFixes(results, this.config);
    }

    // 4. Calculate scores
    const scores = this.calculateScores(results);

    // 5. Generate report
    const report = await this.reporters.generate(results, scores);

    return { results, scores, report };
  }
}

module.exports = HealthCheck;
```

### Dashboard Components

**Reutiliza de Story 3.11 + novos componentes:**

```
tools/health-dashboard/
├── src/
│   ├── components/
│   │   ├── shared/              # From quality-dashboard
│   │   │   ├── Card.jsx
│   │   │   ├── Chart.jsx
│   │   │   └── StatusBadge.jsx
│   │   ├── DomainCard.jsx       # New - domain health card
│   │   ├── HealthScore.jsx      # New - circular progress score
│   │   ├── IssuesList.jsx       # New - issues with actions
│   │   ├── AutoFixLog.jsx       # New - self-healing history
│   │   └── TechDebtList.jsx     # New - recommendations
│   ├── hooks/
│   │   ├── useHealthData.js
│   │   └── useAutoRefresh.js
│   └── pages/
│       ├── Dashboard.jsx
│       └── DomainDetail.jsx
```

---

## Tasks

### Phase 1: Core Engine (5h)

- [ ] **Task 2.1:** Implementar HealthCheckEngine base
  - [ ] 2.1.1: Check runner com parallel execution
  - [ ] 2.1.2: Result aggregation
  - [ ] 2.1.3: Score calculation

- [ ] **Task 2.2:** Implementar Domain Checks
  - [ ] 2.2.1: Project Coherence checks (8 checks)
  - [ ] 2.2.2: Local Environment checks (8 checks)
  - [ ] 2.2.3: Repository Health checks (8 checks)
  - [ ] 2.2.4: Deployment Environment checks (5 checks)
  - [ ] 2.2.5: Service Integration checks (4 checks)

### Phase 2: Self-Healing (4h)

- [ ] **Task 2.3:** Implementar Self-Healing System
  - [ ] 2.3.1: Backup manager
  - [ ] 2.3.2: Tier 1 auto-fixers (silent)
  - [ ] 2.3.3: Tier 2 fixers (with confirmation)
  - [ ] 2.3.4: Tier 3 guide generators
  - [ ] 2.3.5: Healing log persistence

### Phase 3: Reporting (3h)

- [ ] **Task 2.4:** Implementar Reporters
  - [ ] 2.4.1: Markdown report generator
  - [ ] 2.4.2: JSON export for dashboard
  - [ ] 2.4.3: Console summary output
  - [ ] 2.4.4: Historical data aggregation

### Phase 4: Dashboard (4h)

- [ ] **Task 2.5:** Implementar Health Dashboard
  - [ ] 2.5.1: Setup project (extend quality-dashboard)
  - [ ] 2.5.2: DomainCard component
  - [ ] 2.5.3: HealthScore circular component
  - [ ] 2.5.4: IssuesList with actions
  - [ ] 2.5.5: TechDebtList recommendations
  - [ ] 2.5.6: Auto-refresh mechanism

### Phase 5: Integration & Testing (3h)

- [ ] **Task 2.6:** Task Integration
  - [ ] 2.6.1: Create health-check.yaml task definition
  - [ ] 2.6.2: Hook into @devops agent
  - [ ] 2.6.3: CI/CD integration (based on HCS-1 decision)

- [ ] **Task 2.7:** Testing
  - [ ] 2.7.1: Unit tests for each check
  - [ ] 2.7.2: Integration tests for self-healing
  - [ ] 2.7.3: E2E tests for dashboard
  - [ ] 2.7.4: Performance benchmarks

**Total Estimated:** 19h (buffer included in 16h estimate to be refined)

---

## Data Structures

### Health Check Result

```javascript
// .aios/reports/health-check-latest.json
{
  "timestamp": "2025-12-05T14:30:00Z",
  "version": "1.0.0",
  "mode": "full",
  "duration": "45s",

  "overall": {
    "score": 87,
    "status": "healthy", // healthy | degraded | unhealthy
    "issuesCount": 10,
    "autoFixedCount": 7
  },

  "domains": {
    "project": {
      "score": 95,
      "status": "healthy",
      "checks": [
        {
          "id": "PC-001",
          "name": "Config file exists",
          "status": "passed",
          "duration": "12ms"
        },
        {
          "id": "PC-003",
          "name": "coding-standards.md exists",
          "status": "failed",
          "severity": "MEDIUM",
          "message": "File not found",
          "autoFix": {
            "available": true,
            "tier": 2,
            "action": "create-from-template"
          }
        }
      ]
    }
    // ... other domains
  },

  "autoFixed": [
    {
      "checkId": "PC-001",
      "action": "recreated-config",
      "backup": ".aios/backups/config.yaml.1701787800",
      "timestamp": "2025-12-05T14:30:05Z"
    }
  ],

  "techDebt": [
    {
      "id": "DEBT-001",
      "title": "Update GitHub Actions to v4",
      "priority": "MEDIUM",
      "effort": "30min",
      "domain": "repository",
      "checkId": "RH-006"
    }
  ],

  "history": {
    "trend": [
      { "date": "2025-12-01", "score": 82 },
      { "date": "2025-12-02", "score": 85 },
      { "date": "2025-12-05", "score": 87 }
    ]
  }
}
```

---

## Dependencies

**Blocked by:**
- HCS-1: Investigation & Best Practices (architecture decisions)
- Story 3.11: Quality Gates Dashboard (components to reuse)

**Blocks:**
- Nada (self-contained após implementação)

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] `*health-check` task funcional
- [ ] 5 domínios implementados (33+ checks)
- [ ] Self-healing funcional (3 tiers)
- [ ] Relatório markdown gerado
- [ ] Dashboard visual funcional
- [ ] Unit tests com >80% coverage
- [ ] Integration tests passando
- [ ] E2E tests passando
- [ ] Performance: quick mode <10s, full mode <60s
- [ ] Documentação de uso
- [ ] Code review aprovado
- [ ] QA validation passada

---

## Dev Notes

### Performance Optimization

```javascript
// Parallel check execution
const results = await Promise.all([
  this.runDomainChecks('project'),
  this.runDomainChecks('local'),
  this.runDomainChecks('repository'),
  this.runDomainChecks('deployment'),
  this.runDomainChecks('services')
]);

// Caching for expensive checks
const cache = new CheckCache({ ttl: 300 }); // 5 min cache
if (cache.has(checkId)) return cache.get(checkId);
```

### Security Considerations

```javascript
// Sanitize secrets before reporting
function sanitizeResult(result) {
  const sensitivePatterns = [
    /api[_-]?key/i,
    /secret/i,
    /password/i,
    /token/i
  ];

  return JSON.parse(JSON.stringify(result, (key, value) => {
    if (sensitivePatterns.some(p => p.test(key))) {
      return '[REDACTED]';
    }
    return value;
  }));
}
```

---

## Testing Strategy

| Test Type | Count | Focus |
|-----------|-------|-------|
| Unit | ~50 | Individual checks, healers |
| Integration | ~15 | Domain combinations, reporting |
| E2E | ~10 | Full workflow, dashboard |
| Performance | ~5 | Execution time benchmarks |

---

**Criado por:** Pax (PO)
**Data:** 2025-12-05
**Nota:** Estimates serão refinados após HCS-1 Investigation
