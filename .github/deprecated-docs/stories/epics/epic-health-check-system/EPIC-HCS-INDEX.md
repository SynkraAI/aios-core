# Epic: Health Check System (HCS)

**Epic ID:** EPIC-HCS
**Status:** Planning
**Priority:** High
**Target:** Post Open-Source Launch (Sprint 7)
**Effort Estimate:** 20-28 hours (across 2 stories)

---

## Vision

Criar um sistema de diagnóstico completo que analisa a saúde do projeto AIOS em todas as suas camadas, identifica problemas, sugere correções de technical debt e realiza auto-healing para problemas triviais - funcionando como um "checkup médico" que pode ser executado a qualquer momento.

---

## Problem Statement

**Problema:** O AIOS é um sistema complexo com múltiplas camadas interdependentes:
- Core Config ↔ Tasks ↔ Agents
- Project Setup (coding-standards, tech-stack, source-tree)
- Local Environment (CLIs, MCPs, IDEs)
- Repository (workflows, actions, branches)
- Deployment Environments (local, staging, production)

Usuários "vibe coding" podem inadvertidamente:
- Deletar ou modificar arquivos críticos
- Quebrar paths e referências entre componentes
- Desconfiguar integrações (MCPs, IDEs)
- Pular etapas do `*bootstrap-setup`
- Criar inconsistências entre ambientes
- Deixar workflows quebrados ou desatualizados

**Solução:** Task `*health-check` que:
- Analisa todas as camadas do sistema
- Detecta problemas e inconsistências
- Sugere correções com prioridade (technical debt)
- Auto-fix silencioso para problemas triviais
- Gera relatório visual (dashboard) e arquivo markdown

---

## Strategic Alignment

### Conexões com Funcionalidades Existentes

| Componente | Conexão |
|------------|---------|
| `*bootstrap-setup` | Complementar - health-check valida o que bootstrap configura |
| Story 3.11 Quality Gates Dashboard | Reutilizar estrutura visual do dashboard |
| DevOps Agent (@devops) | Agente responsável pela execução |
| Core Config | Fonte de verdade para validações |

### Princípios Aplicados

1. **Self-Healing:** Auto-corrige problemas triviais sem intervenção
2. **Progressive Disclosure:** Mostra problemas críticos primeiro
3. **Non-Destructive:** Nunca deleta ou modifica sem confirmação (exceto triviais)
4. **Comprehensive:** Cobre todas as camadas do sistema

---

## Scope Definition

### Check Areas (5 Domínios)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AIOS Health Check System                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │  🔧 Project │  │  💻 Local   │  │  📦 Repo    │                 │
│  │  Coherence  │  │  Environment│  │  Health     │                 │
│  └─────────────┘  └─────────────┘  └─────────────┘                 │
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐                                  │
│  │  🚀 Deploy  │  │  🔗 Service │                                  │
│  │  Environ.   │  │  Integration│                                  │
│  └─────────────┘  └─────────────┘                                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### 1. Project Coherence Check 🔧
- Tasks ↔ Agents ↔ Core Config relationships
- Setup files: `coding-standards.md`, `tech-stack.md`, `source-tree.md`
- Manifests e configurações YAML
- Referências quebradas e arquivos órfãos
- Templates e checklists válidos

#### 2. Local Environment Check 💻
- CLIs instaladas (node, npm, git, gh, docker, etc.)
- MCPs configurados e respondendo
- Integração com IDEs (VS Code, Cursor, Windsurf)
- `CLAUDE.md` configurado corretamente
- Rules específicas de cada IDE (`.cursorrules`, etc.)
- Variáveis de ambiente necessárias

#### 3. Repository Health Check 📦
- GitHub Actions/Workflows status
- Branch protection rules
- Secrets configurados
- CI/CD pipeline funcionando
- PRs/Issues abandonados
- Dependências desatualizadas

#### 4. Deployment Environment Check 🚀
- Configuração: local-only vs staging/production
- Conexões com ambientes remotos
- Variáveis de ambiente por ambiente
- Health dos serviços deployados
- SSL/TLS certificates (se aplicável)

#### 5. Service Integration Check 🔗
- Backlog manager funcionando
- Memory layer (quando disponível)
- Conexões externas (GitHub API, etc.)
- MCP servers health

---

## Output Formats

### 1. Health Report (Markdown)

**Arquivo:** `.aios/reports/health-check-{timestamp}.md`

```markdown
# AIOS Health Check Report

**Generated:** 2025-12-05T14:30:00Z
**Overall Score:** 87/100 🟢

## Executive Summary

| Domain | Score | Issues | Auto-Fixed |
|--------|-------|--------|------------|
| Project Coherence | 95/100 | 2 | 1 |
| Local Environment | 78/100 | 5 | 3 |
| Repository Health | 92/100 | 1 | 0 |
| Deployment | 88/100 | 2 | 1 |
| Service Integration | 82/100 | 3 | 2 |

## Critical Issues (Require Action)

### 🔴 CRITICAL-001: Missing tech-stack.md
- **Domain:** Project Coherence
- **Impact:** High - agents cannot determine technology stack
- **Fix:** Run `*bootstrap-setup` or create manually
- **Command:** `aios task bootstrap-setup --only=tech-stack`

## Auto-Fixed Issues

### ✅ FIXED-001: Recreated missing .aios/config.yaml
- **Domain:** Project Coherence
- **Action:** Created from template with defaults
- **Backup:** `.aios/backups/config.yaml.bak`

## Recommendations (Technical Debt)

### 🟡 DEBT-001: Update GitHub Actions to latest
- **Domain:** Repository Health
- **Priority:** Medium
- **Effort:** 30 min
- **Why:** actions/checkout@v3 is deprecated
```

### 2. Dashboard Visual

**Reutiliza estrutura da Story 3.11:**

```
┌─────────────────────────────────────────────────────────────────┐
│  🏥 AIOS Health Check Dashboard               [🔄 Run Check]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Overall Health: 87/100  [████████████████████░░░░] 🟢         │
│                                                                 │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐      │
│  │ 🔧 Project│ │ 💻 Local  │ │ 📦 Repo   │ │ 🚀 Deploy │      │
│  │   95/100  │ │   78/100  │ │   92/100  │ │   88/100  │      │
│  │   🟢      │ │   🟡      │ │   🟢      │ │   🟢      │      │
│  │  2 issues │ │  5 issues │ │  1 issue  │ │  2 issues │      │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘      │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  📈 Health Trend (Last 30 days)                        │   │
│  │  [Line chart showing health score over time]           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────┐  ┌───────────────────────────────┐   │
│  │  🔴 Critical (2)     │  │  ✅ Auto-Fixed (7)           │   │
│  │                      │  │                               │   │
│  │  • Missing tech-stack│  │  • Recreated config.yaml     │   │
│  │  • Broken workflow   │  │  • Fixed MCP timeout         │   │
│  │                      │  │  • Updated .gitignore        │   │
│  └──────────────────────┘  └───────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🟡 Technical Debt Suggestions (5 items)               │   │
│  │                                                         │   │
│  │  1. Update GH Actions (30min) [Fix]                    │   │
│  │  2. Add missing tests (2h) [View]                      │   │
│  │  3. Refactor deprecated API (1h) [View]                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Stories Roadmap

| Story | Nome | Descrição | Sprint | Effort | Status |
|-------|------|-----------|--------|--------|--------|
| **HCS-1** | Investigation & Best Practices | Pesquisar modos de execução, definir arquitetura | 7 | 8h | Ready |
| **HCS-2** | Implementation | Implementar checks, self-healing, reports, dashboard | 7-8 | 16h | Blocked by HCS-1 |

---

## Technical Architecture (Skeleton)

```
.aios-core/
├── health-check/
│   ├── checks/                    # Check implementations
│   │   ├── project-coherence.js   # Domain 1
│   │   ├── local-environment.js   # Domain 2
│   │   ├── repository-health.js   # Domain 3
│   │   ├── deployment-env.js      # Domain 4
│   │   └── service-integration.js # Domain 5
│   │
│   ├── healers/                   # Self-healing implementations
│   │   ├── auto-fix-registry.js   # Registry of auto-fixable issues
│   │   ├── trivial-fixes.js       # Auto-fix without confirmation
│   │   └── guided-fixes.js        # Fixes requiring confirmation
│   │
│   ├── reporters/
│   │   ├── markdown-report.js     # Generate .md report
│   │   ├── json-export.js         # Export for dashboard
│   │   └── console-summary.js     # Terminal output
│   │
│   ├── scheduler/                 # Execution modes (TBD in HCS-1)
│   │   ├── manual.js              # *health-check command
│   │   ├── ci-integration.js      # GitHub Actions hook
│   │   └── pre-commit-hook.js     # Optional pre-commit
│   │
│   └── config/
│       ├── check-rules.yaml       # Rules for each check
│       ├── severity-levels.yaml   # CRITICAL, HIGH, MEDIUM, LOW
│       └── auto-fix-whitelist.yaml # What can be auto-fixed

tools/health-dashboard/            # Extends quality-dashboard
├── src/
│   ├── components/
│   │   ├── DomainCard.jsx
│   │   ├── HealthTrendChart.jsx
│   │   ├── IssuesList.jsx
│   │   ├── AutoFixedList.jsx
│   │   └── TechDebtSuggestions.jsx
│   └── ...

.aios/reports/                     # Generated reports
├── health-check-2025-12-05T14-30.md
└── health-check-latest.json
```

---

## Self-Healing Strategy

### Tier 1: Auto-Fix Silencioso (Trivial)
Problemas que podem ser corrigidos sem risco:

| Issue | Auto-Fix Action |
|-------|----------------|
| Missing `.aios/config.yaml` | Recreate from template |
| Missing `.gitignore` entries | Append standard entries |
| Expired MCP cache | Clear and reconnect |
| Missing empty directories | Create with .gitkeep |
| Outdated lock files | Regenerate |

### Tier 2: Auto-Fix com Confirmação (Moderado)
Problemas que precisam de aprovação:

| Issue | Confirmation Required |
|-------|----------------------|
| Update deprecated dependencies | Show diff, ask to proceed |
| Fix broken symlinks | Show target, ask to recreate |
| Regenerate corrupted files | Show backup location |
| Update GitHub Actions versions | Show changes |

### Tier 3: Sugestão Manual (Crítico)
Problemas que requerem intervenção humana:

| Issue | Guidance Provided |
|-------|-------------------|
| Missing core business logic | Point to documentation |
| Security vulnerabilities | Explain risk and fix steps |
| Breaking API changes | Migration guide |
| Corrupted git history | Recovery options |

---

## Execution Modes (To Be Investigated in HCS-1)

### Candidates for Investigation

1. **Manual Only** (`*health-check`)
   - Pros: Simple, user-controlled
   - Cons: May be forgotten

2. **Scheduled CI/CD**
   - Pros: Regular automated checks
   - Cons: Needs infrastructure

3. **Pre-Commit Hook**
   - Pros: Catches issues early
   - Cons: May slow commits

4. **IDE Integration**
   - Pros: Real-time feedback
   - Cons: Complex to implement

5. **Event-Driven**
   - Pros: Smart triggering (after merges, deployments)
   - Cons: Complex logic

### Research Questions for HCS-1

- What do mature projects use? (Kubernetes, VS Code, etc.)
- What's the optimal frequency for different check types?
- How to balance thoroughness vs speed?
- Integration with existing CI/CD vs new workflow?

---

## Success Metrics

| Métrica | Target | Como Medir |
|---------|--------|------------|
| Issues detected before user report | 80% | Correlation analysis |
| Auto-fix success rate | 95% | Fix attempts vs successes |
| Time to diagnose problems | -70% | Before vs after implementation |
| Technical debt visibility | 100% coverage | Debt items tracked |
| User satisfaction | 4.5/5 | Survey |

---

## Risks & Mitigations

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Auto-fix breaks something | Baixa | Alto | Always create backups, whitelist only safe fixes |
| Check takes too long | Média | Médio | Parallel execution, caching, skip unchanged |
| False positives | Média | Baixo | Tunable severity, ignore lists |
| Over-engineering | Média | Médio | Start simple, iterate based on feedback |

---

## Integration Points

### Com Quality Gates Dashboard (Story 3.11)
- Reutilizar: React + Vite + Tailwind + Chart.js
- Estender: Adicionar health-specific components
- Compartilhar: Data structure patterns

### Com DevOps Agent (@devops)
- Primary executor da task `*health-check`
- Acesso a todos os sistemas necessários
- Pode escalar para outros agentes se necessário

### Com `*bootstrap-setup`
- Health-check valida o que bootstrap configura
- Pode sugerir re-run de bootstrap para fixes
- Complementares, não substitutos

---

## Dependencies

### Bloqueado por:
- **Epic OSR** (para validar estrutura pública antes de health-check)
- **Story 3.11** (para reutilizar dashboard structure)

### Bloqueia:
- Nada (self-contained)

---

## Decision Log

| Data | Decisão | Rationale |
|------|---------|-----------|
| 2025-12-05 | Híbrido: 1 investigation + 1 implementation | Validar best practices antes de implementar |
| 2025-12-05 | Auto-fix: Tier system (silencioso + confirmação + manual) | Balancear automação com segurança |
| 2025-12-05 | Dashboard: Reutilizar Story 3.11 structure | Evitar retrabalho, manter consistência visual |
| 2025-12-05 | Agente: @devops como primary executor | Escopo alinhado com responsabilidades |

---

## Next Steps

1. **Imediato:** Criar HCS-1 Investigation Story
2. **Sprint 7:** Executar HCS-1, definir arquitetura e modos de execução
3. **Sprint 7-8:** Implementar HCS-2 (checks, self-healing, dashboard)

---

**Criado por:** Pax (PO)
**Data:** 2025-12-05
**Revisado por:** -
