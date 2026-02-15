---
task: Brownfield Discovery
responsavel: "@bob-orchestrator"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - project_root: Path to existing codebase
  - analysis_depth: shallow | medium | deep (default: medium)
Saida: |
  - discovery_report: Comprehensive analysis of existing code
  - architecture_doc: Generated architecture.md
  - tech_debt_summary: Technical debt inventory
  - next_action: User decision prompt
Checklist:
  - "[ ] Verify project state is EXISTING_NO_DOCS"
  - "[ ] Spawn parallel analysis agents (@architect, @data-engineer, @ux-design, @devops)"
  - "[ ] Consolidate analyses into architecture.md"
  - "[ ] Generate technical debt report"
  - "[ ] Surface decision: resolve debts vs add feature"
  - "[ ] Update session state with discovery results"
---

# *brownfield-discovery

Analyzes existing codebase without AIOS documentation and generates comprehensive architecture documentation and technical debt inventory.

**PATH B:** EXISTING_NO_DOCS - Código existente sem docs AIOS

## Usage

```bash
@bob-orchestrator

*brownfield-discovery
# → Analyzes codebase and generates architecture.md

*brownfield-discovery --depth deep
# → Comprehensive analysis including dependencies and test coverage
```

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--depth` | enum | medium | Analysis depth: shallow \| medium \| deep |
| `--skip-debts` | flag | false | Skip technical debt analysis |
| `--output` | path | docs/architecture.md | Output path for architecture doc |

## Flow

```mermaid
flowchart TB
    START[Verify EXISTING_NO_DOCS] --> PHASE1[Phase 1: Parallel Analysis]
    PHASE1 --> A1[@architect: Code structure analysis]
    PHASE1 --> A2[@data-engineer: Database schema analysis]
    PHASE1 --> A3[@ux-design: UI/UX pattern analysis]
    PHASE1 --> A4[@devops: Infrastructure analysis]

    A1 --> PHASE2[Phase 2: Consolidation]
    A2 --> PHASE2
    A3 --> PHASE2
    A4 --> PHASE2

    PHASE2 --> ARCH[@architect: Generate architecture.md]
    ARCH --> DEBT[Generate tech debt report]
    DEBT --> DECISION{User Decision}

    DECISION -->|Resolve Debts| DEBTS[Create debt resolution stories]
    DECISION -->|Add Feature| FEATURE[Route to Enhancement workflow]
    DECISION -->|Both| BOTH[Prioritize backlog]
```

## Implementation

### Phase 1: Parallel Analysis (2-3 hours)

```javascript
const agents = [
  { agent: '@architect', task: 'analyze-code-structure' },
  { agent: '@data-engineer', task: 'analyze-database-schema' },
  { agent: '@ux-design', task: 'analyze-ui-patterns' },
  { agent: '@devops', task: 'analyze-infrastructure' },
];

const results = await Promise.all(
  agents.map(({ agent, task }) =>
    this.terminalSpawner.spawn(agent, task, { projectRoot })
  )
);
```

### Phase 2: Consolidation (30 min)

```javascript
const architectAnalysis = results.find(r => r.agent === '@architect');

const consolidatedDoc = await this.workflowExecutor.execute({
  agent: '@architect',
  task: 'consolidate-analyses',
  inputs: {
    codeStructure: results[0],
    databaseSchema: results[1],
    uiPatterns: results[2],
    infrastructure: results[3],
  },
  output: 'docs/architecture.md',
});
```

### Phase 3: Post-Discovery Decision

```javascript
const surfaceResult = this.surfaceChecker.shouldSurface({
  valid_options_count: 3,
  options_with_tradeoffs: {
    resolve_debts: 'Address technical debt first (safer, longer)',
    add_feature: 'Implement new feature immediately (faster, riskier)',
    both: 'Parallel track (complex, requires prioritization)',
  },
});

if (surfaceResult.should_surface) {
  return {
    action: 'post_discovery_decision',
    data: {
      message: 'Discovery completa. O que deseja fazer?',
      options: surfaceResult.options,
      context: {
        debts_found: debtSummary.count,
        critical_issues: debtSummary.critical,
      },
    },
  };
}
```

## Output Example

### Architecture Document Generated

```markdown
# Project Architecture

## Overview
- **Type:** Monolithic Express.js application
- **Database:** PostgreSQL 14
- **Frontend:** React 18 + Vite
- **Deployment:** Docker + AWS ECS

## Technical Stack
- Node.js 18.x
- Express 4.x
- Sequelize ORM
- Jest for testing

## Technical Debt Summary
- 🔴 CRITICAL (3): Hardcoded secrets, SQL injection risk, no rate limiting
- 🟡 HIGH (8): Missing tests, outdated dependencies, no monitoring
- 🟢 MEDIUM (15): Code duplication, inconsistent patterns

## Recommended Next Steps
1. Address 3 critical security issues (Story DEBT-1)
2. Add test coverage to critical paths (Story DEBT-2)
3. Implement monitoring (Story DEBT-3)
```

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `not_brownfield` | Project state is not EXISTING_NO_DOCS | Check state with *orchestrate-project |
| `analysis_timeout` | Agent analysis exceeded 4h limit | Retry with --depth shallow |
| `no_code_found` | Project directory is empty | Verify correct project root |

## Related

- **Workflow:** brownfield-discovery.yaml
- **Handler:** brownfield-handler.js
- **Agents:** @architect, @data-engineer, @ux-design, @devops

---

**Duration:** 2-4 hours (depending on codebase size)
**Cost Estimate:** $5-15 (based on codebase complexity)
