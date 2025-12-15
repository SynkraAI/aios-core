# Story HCS-1: Investigation & Best Practices Research

**Epic:** Health Check System (HCS)
**Story ID:** HCS-1
**Sprint:** 7 (Post Open-Source Launch)
**Priority:** High
**Points:** 5
**Effort:** 8 hours
**Status:** Ready for Execution
**Type:** Investigation

---

## User Story

**Como** arquiteto do AIOS,
**Quero** investigar as melhores práticas de sistemas de health check e definir a arquitetura,
**Para** garantir que a implementação seja robusta, não-intrusiva e alinhada com padrões da indústria.

---

## Objective

Realizar investigação técnica sobre:
1. Modos de execução (manual, scheduled, event-driven)
2. Arquitetura de sistemas de health check em projetos maduros
3. Estratégias de self-healing seguras
4. Integração com CI/CD existente

---

## Investigation Areas

### 1. Execution Mode Research

**Perguntas a responder:**
- [ ] Qual a frequência ideal para cada tipo de check?
- [ ] Como projetos maduros (Kubernetes, VS Code, Terraform) implementam health checks?
- [ ] Qual o trade-off entre thoroughness vs performance?
- [ ] Como integrar com CI/CD sem criar friction?

**Candidates para avaliar:**

| Mode | Use Case | Pros | Cons |
|------|----------|------|------|
| Manual (`*health-check`) | On-demand diagnosis | User-controlled | May be forgotten |
| Pre-commit hook | Catch issues early | Immediate feedback | Slows commits |
| Scheduled CI | Regular automated | Consistent | Needs infra |
| Post-merge trigger | After changes | Smart timing | Delayed feedback |
| IDE background | Real-time | Best UX | Complex |

**Deliverable:** Recommendation matrix for execution modes

---

### 2. Industry Best Practices Research

**Projetos a estudar:**

#### Kubernetes Health Probes
```yaml
# Reference: liveness, readiness, startup probes
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 3
  periodSeconds: 3
```

**Perguntas:**
- [ ] Como K8s diferencia liveness vs readiness?
- [ ] Aplicável ao contexto AIOS?

#### VS Code Extension Health
- [ ] Como VS Code verifica extensões corrompidas?
- [ ] Self-repair mechanisms?

#### Terraform State Management
- [ ] Como Terraform detecta drift?
- [ ] Recovery strategies?

#### npm/yarn Integrity Checks
- [ ] Como package managers verificam integridade?
- [ ] Caching strategies?

**Deliverable:** Summary of applicable patterns

---

### 3. Self-Healing Architecture

**Perguntas a responder:**
- [ ] Quais fixes são seguros para auto-apply?
- [ ] Como criar backups antes de modificações?
- [ ] Como comunicar fixes ao usuário?
- [ ] Rollback strategy se fix falhar?

**Design Considerations:**

```javascript
// Self-healing decision tree
const healingStrategy = {
  TRIVIAL: {
    // Auto-fix silenciosamente
    actions: ['recreate_config', 'clear_cache', 'create_dirs'],
    backup: true,
    notify: 'log_only'
  },
  MODERATE: {
    // Auto-fix com confirmação
    actions: ['update_deps', 'fix_symlinks', 'regenerate_files'],
    backup: true,
    notify: 'prompt_user'
  },
  CRITICAL: {
    // Apenas sugerir
    actions: ['security_fix', 'breaking_change', 'data_migration'],
    backup: 'n/a',
    notify: 'manual_guide'
  }
};
```

**Deliverable:** Self-healing tier definitions and safety rules

---

### 4. Check Architecture Design

**Perguntas a responder:**
- [ ] Como estruturar checks modulares?
- [ ] Como priorizar checks (fail-fast vs complete)?
- [ ] Como cachear resultados para performance?
- [ ] Como permitir custom checks?

**Design Pattern Candidates:**

#### Pattern A: Plugin-based
```javascript
// Cada check é um plugin independente
class ProjectCoherenceCheck extends BaseCheck {
  name = 'project-coherence';
  priority = 1;

  async run(context) {
    // Implementation
  }

  async heal(issue) {
    // Self-healing
  }
}
```

#### Pattern B: Rule-based
```yaml
# Checks definidos em YAML
checks:
  - id: config-exists
    type: file-exists
    path: .aios/config.yaml
    severity: CRITICAL
    auto-fix: recreate-from-template
```

#### Pattern C: Hybrid
- Core checks em código (performance)
- Custom checks em YAML (extensibility)

**Deliverable:** Architecture Decision Record (ADR)

---

### 5. Integration Points Analysis

**Perguntas a responder:**
- [ ] Como integrar com Story 3.11 (Quality Dashboard)?
- [ ] Como reutilizar componentes visuais?
- [ ] Como compartilhar data structures?
- [ ] Como evitar duplicação de código?

**Integration Map:**

```
┌─────────────────────────────────────────────────────────────┐
│                    Shared Infrastructure                     │
├─────────────────────────────────────────────────────────────┤
│  tools/shared-dashboard/                                    │
│  ├── components/      # Shared React components             │
│  ├── hooks/           # useMetrics, useRealTime             │
│  └── styles/          # Tailwind presets                    │
├─────────────────────────────────────────────────────────────┤
│  tools/quality-dashboard/     tools/health-dashboard/       │
│  └── extends shared           └── extends shared            │
└─────────────────────────────────────────────────────────────┘
```

**Deliverable:** Integration architecture proposal

---

### 6. CLI/IDE Configuration Checks

**Perguntas a responder:**
- [ ] Como detectar quais IDEs estão instaladas?
- [ ] Como validar CLAUDE.md em diferentes contextos?
- [ ] Como verificar MCPs sem causar timeouts?
- [ ] Como lidar com configurações específicas de OS?

**Check Matrix:**

| IDE/CLI | Config File | Validation Method |
|---------|-------------|-------------------|
| VS Code | `.vscode/settings.json` | JSON schema |
| Cursor | `.cursorrules` | Content patterns |
| Windsurf | TBD | TBD |
| Claude Code | `CLAUDE.md` | Required sections |
| MCPs | `.claude.json` | MCP health ping |
| Git | `.gitconfig` | Required settings |
| GitHub CLI | `gh auth status` | Auth check |

**Deliverable:** IDE/CLI check specifications

---

## Tasks

### Phase 1: Research (4h)

- [ ] **Task 1.1:** Estudar Kubernetes health probes (liveness, readiness, startup)
- [ ] **Task 1.2:** Analisar VS Code extension health e self-repair
- [ ] **Task 1.3:** Pesquisar npm/yarn integrity checks
- [ ] **Task 1.4:** Revisar Terraform drift detection
- [ ] **Task 1.5:** Documentar findings em comparative analysis

### Phase 2: Architecture Design (2.5h)

- [ ] **Task 2.1:** Definir execution modes recommendation
- [ ] **Task 2.2:** Desenhar check architecture (plugin vs rule-based vs hybrid)
- [ ] **Task 2.3:** Definir self-healing tiers e safety rules
- [ ] **Task 2.4:** Criar diagramas (Mermaid) da arquitetura

### Phase 3: Integration Planning (1.5h)

- [ ] **Task 3.1:** Mapear integração com Story 3.11 dashboard
- [ ] **Task 3.2:** Definir shared components approach
- [ ] **Task 3.3:** Especificar IDE/CLI checks detalhados
- [ ] **Task 3.4:** Documentar decisões e criar ADR

---

## Deliverables

### 1. Architecture Decision Record (ADR)

**Arquivo:** `docs/architecture/adr-hcs-health-check-system.md`

```markdown
# ADR: Health Check System Architecture

## Status
Proposed

## Context
[Contexto da necessidade de health check]

## Decision
[Arquitetura escolhida com justificativa]

## Consequences
[Consequências positivas e negativas]

## Alternatives Considered
[Outras opções avaliadas]
```

### 2. Execution Mode Recommendation

**Arquivo:** `docs/architecture/hcs-execution-modes.md`

Conteúdo:
- Comparative analysis of modes
- Recommended default configuration
- Optional modes for power users

### 3. Self-Healing Specification

**Arquivo:** `docs/architecture/hcs-self-healing-spec.md`

Conteúdo:
- Tier definitions (Trivial, Moderate, Critical)
- Safety rules and constraints
- Backup strategy
- Rollback procedures

### 4. Check Specifications

**Arquivo:** `docs/architecture/hcs-check-specifications.md`

Conteúdo:
- All 5 domains with specific checks
- IDE/CLI detection matrix
- Custom check extension points

### 5. Implementation Estimates

Atualizar Story HCS-2 com:
- Refined effort estimates
- Task breakdown
- Technical risks identified

---

## Acceptance Criteria

```gherkin
GIVEN the need for a Health Check System
WHEN the investigation is complete
THEN:
  - ADR documenta arquitetura escolhida
  - Execution modes estão comparados e recomendados
  - Self-healing tiers estão especificados
  - Check specifications estão detalhadas
  - Integration com Story 3.11 está mapeada
AND the team has enough information to implement HCS-2
```

---

## Dependencies

**Blocked by:**
- Nada (pode iniciar imediatamente)

**Blocks:**
- HCS-2: Implementation

---

## Definition of Done

- [ ] ADR criado e revisado
- [ ] Execution modes researched e documentados
- [ ] Self-healing specification completa
- [ ] Check specifications por domínio
- [ ] Integration architecture defined
- [ ] Story HCS-2 atualizada com estimates
- [ ] @architect validou design
- [ ] Stakeholder aprovou direção

---

## Research Sources

### Industry References
- Kubernetes Documentation: Health Probes
- VS Code Extension API: Extension Health
- Terraform Documentation: State Management
- npm Documentation: Package Integrity
- GitHub Actions: Workflow Health

### Internal References
- `docs/stories/v2.1/sprint-3/story-3.11-quality-gates-dashboard.md`
- `.aios-core/` structure
- `*bootstrap-setup` task implementation

### External Tools to Evaluate
- `doctor` patterns (Homebrew doctor, Flutter doctor)
- Linters health output (ESLint, Prettier)
- Container health checks (Docker HEALTHCHECK)

---

## Notes

### Performance Considerations

Health checks devem ser:
1. **Fast by default:** Quick checks first, expensive checks optional
2. **Cacheable:** Don't re-check unchanged areas
3. **Interruptible:** User can cancel long-running checks
4. **Parallel:** Independent checks run concurrently

### Security Considerations

- Health check não deve expor secrets em relatórios
- Self-healing não deve modificar arquivos de credenciais
- Backups devem ser criados em local seguro
- Logs devem ser sanitizados

### UX Considerations

- Progress indication para checks longos
- Clear severity indicators (🔴 🟡 🟢)
- Actionable fix instructions
- One-click fixes quando possível

---

**Criado por:** Pax (PO)
**Data:** 2025-12-05
