# Enhance Workflow v2.0 - Multi-Agent Orchestration

Pipeline de enhancement com análise de determinismo, roundtable dinâmico por domínio, e validação QA.

**Fluxo:** Pre-flight → Determinism Check → Discovery → Research → Roundtable (dinâmico) → Create Epic → QA Validation

---

## Domain Roundtable Map

O roundtable é selecionado automaticamente baseado no domínio do projeto:

```yaml
domain_roundtable_map:
  # Development (default)
  code_app:
    keywords: [app, api, database, frontend, backend, feature, refactor, bug]
    agents: [architect, data-engineer, devops, ux]
    agent_files: [AIOS/agents/architect.md, AIOS/agents/data-engineer.md, AIOS/agents/devops.md, AIOS/agents/ux-design-expert.md]

  # Copywriting & Marketing
  copy_marketing:
    keywords: [copy, sales page, vsl, email sequence, headline, funnel, launch, marketing]
    agents: [copy-chief, story-chief, funnel-architect, ads-analyst]
    agent_files: [Copy/agents/copy-chief.md, Storytelling/agents/story-chief.md, CreatorOS/agents/funnel-architect.md, traffic-masters/agents/ads-analyst.md]

  # Mind Cloning (MMOS)
  mmos_minds:
    keywords: [mind, clone, persona, cognitive, behavioral, dna, emulator, personality]
    agents: [barbara-cognitive-architect, daniel-behavioral-analyst, charlie-synthesis-expert, quinn-quality-specialist]
    agent_files: [MMOS/agents/barbara-cognitive-architect.md, MMOS/agents/daniel-behavioral-analyst.md, MMOS/agents/charlie-synthesis-expert.md, MMOS/agents/quinn-quality-specialist.md]

  # Design & Brand
  design_brand:
    keywords: [design, ui, ux, brand, visual, logo, design system, component]
    agents: [design-chief, brad-frost, marty-neumeier, ux]
    agent_files: [Design/agents/design-chief.md, Design/agents/brad-frost.md, Design/agents/marty-neumeier.md, AIOS/agents/ux-design-expert.md]

  # Storytelling & Content
  storytelling_content:
    keywords: [story, narrative, content, course, curriculum, blog, video script]
    agents: [story-chief, nancy-duarte, donald-miller, content-pm]
    agent_files: [Storytelling/agents/story-chief.md, Storytelling/agents/nancy-duarte.md, Storytelling/agents/donald-miller.md, CreatorOS/agents/content-pm.md]

  # Paid Traffic & Ads
  traffic_ads:
    keywords: [ads, traffic, campaign, facebook, google ads, meta, tiktok, media buyer]
    agents: [traffic-masters-chief, ads-analyst, creative-analyst, media-buyer]
    agent_files: [traffic-masters/agents/traffic-masters-chief.md, traffic-masters/agents/ads-analyst.md, traffic-masters/agents/creative-analyst.md, traffic-masters/agents/media-buyer.md]

  # Cybersecurity
  security:
    keywords: [security, pentest, vulnerability, audit, compliance, hack, breach]
    agents: [cyber-chief, peter-kim, georgia-weidman, jim-manico]
    agent_files: [Cybersecurity/agents/cyber-chief.md, Cybersecurity/agents/peter-kim.md, Cybersecurity/agents/georgia-weidman.md, Cybersecurity/agents/jim-manico.md]

  # Legal
  legal:
    keywords: [legal, contract, compliance, lgpd, privacy, terms, lawsuit, tax]
    agents: [legal-chief, safe-counsel, lgpd-specialist, compliance-architect]
    agent_files: [Legal/agents/legal-chief.md, Legal/agents/safe-counsel.md, Legal/agents/lgpd-specialist.md, HybridOps/agents/compliance-validator.md]

  # HR & People
  hr_people:
    keywords: [hr, hiring, talent, culture, team, performance review, onboarding]
    agents: [hr-chief, talent-classifier, behavior-detector, strengths-identifier]
    agent_files: [HR/agents/hr-chief.md, HR/agents/talent-classifier.md, HR/agents/behavior-detector.md, HR/agents/strengths-identifier.md]

  # Data & Analytics
  data_analytics:
    keywords: [analytics, metrics, kpi, dashboard, data, cohort, retention, growth]
    agents: [data-chief, peter-fader, sean-ellis, avinash-kaushik]
    agent_files: [Data/agents/data-chief.md, Data/agents/peter-fader.md, Data/agents/sean-ellis.md, Data/agents/avinash-kaushik.md]

  # FinOps & Cloud Costs
  finops_cloud:
    keywords: [finops, cloud cost, aws, gcp, azure, billing, optimization, infra cost]
    agents: [finops-chief, corey-quinn, jr-storment, mike-fuller]
    agent_files: [finops/agents/finops-chief.md, finops/agents/corey-quinn.md, finops/agents/jr-storment.md, finops/agents/mike-fuller.md]

  # Process & Ops
  process_ops:
    keywords: [process, workflow, automation, clickup, sop, procedure, ops]
    agents: [process-architect, workflow-designer, qa-architect, compliance-validator]
    agent_files: [HybridOps/agents/process-architect.md, HybridOps/agents/workflow-designer.md, HybridOps/agents/qa-architect.md, HybridOps/agents/compliance-validator.md]

  # Squad & Workflow Creation
  squad_workflow:
    keywords: [squad, skill, workflow, agent, pipeline, orchestration]
    agents: [pedro-valerio, squad-architect, qa, devops]
    agent_files: [squad-creator/agents/pedro-valerio.md, squad-creator/agents/squad-architect.md, AIOS/agents/qa.md, AIOS/agents/devops.md]

  # Strategic Advisory
  advisory_strategy:
    keywords: [strategy, investment, board, advisor, pivot, fundraise, m&a]
    agents: [board-chair, ray-dalio, charlie-munger, naval-ravikant]
    agent_files: [AdvisoryBoard/agents/board-chair.md, AdvisoryBoard/agents/ray-dalio.md, AdvisoryBoard/agents/charlie-munger.md, AdvisoryBoard/agents/naval-ravikant.md]

  # Personality Analysis
  innerlens_personality:
    keywords: [innerlens, personality, profile, psychologist, fragment, identity]
    agents: [innerlens-orchestrator, psychologist, fragment-extractor, quality-assurance]
    agent_files: [InnerLens/agents/innerlens-orchestrator.md, InnerLens/agents/psychologist.md, InnerLens/agents/fragment-extractor.md, InnerLens/agents/quality-assurance.md]
```

---

## Activation

Quando o usuario invocar `/enhance-workflow`, execute o fluxo completo.

---

## Phase 0: Pre-flight Check

Antes de qualquer coisa, valide:

```
PRE-FLIGHT CHECKLIST:
[ ] Diretório outputs/enhance/ existe ou pode ser criado
[ ] Contexto do projeto foi fornecido (não vazio)
[ ] Agent files necessários existem em .claude/commands/
[ ] Ferramentas externas disponíveis (exa, context7) - graceful degradation se não

Se FALHAR: Abortar com mensagem clara do que falta.
Timeout: 30s
```

---

## Phase 0.5: Determinism Analysis

**ANTES de gastar tokens com agentes**, avaliar se o enhancement pode ser resolvido deterministicamente:

```yaml
determinism_check:
  # Classificar tipo de enhancement
  types:
    rename:
      patterns: ["renomear", "rename", "mudar nome"]
      deterministic: true
      action: "sed, IDE refactor tools"

    migration:
      patterns: ["migrar", "atualizar dependências", "upgrade"]
      deterministic: true
      action: "npm update, migration scripts"

    format:
      patterns: ["formatar", "lint", "estilo de código"]
      deterministic: true
      action: "prettier, eslint --fix"

    bug_fix:
      patterns: ["corrigir", "fix", "bug", "erro"]
      deterministic: false
      action: "pipeline (requer análise)"

    feature:
      patterns: ["adicionar", "criar", "implementar", "nova feature"]
      deterministic: false
      action: "pipeline completo"

    refactor:
      patterns: ["refatorar", "melhorar código"]
      deterministic: "depends"  # AST tools se mecânico, pipeline se arquitetural

    ux:
      patterns: ["melhorar ux", "design", "interface", "experiência"]
      deterministic: false
      action: "pipeline completo"

  # Se DETERMINÍSTICO:
  # 1. Sugerir comando/script ao usuário
  # 2. Perguntar: "Executar diretamente ou forçar pipeline? [D/p]"
  # 3. Se D: executar e encerrar
  # 4. Se p: continuar com pipeline

  # Se PROBABILÍSTICO:
  # Continuar com pipeline normal
```

**Registrar decisão em `.state.json`:**
```json
{
  "determinism_analysis": {
    "input": "descrição original",
    "classification": "feature",
    "is_deterministic": false,
    "suggested_action": null,
    "user_decision": "pipeline",
    "analyzed_at": "ISO8601"
  }
}
```

---

## Phase 0.7: Domain Classification

Analisar o contexto e classificar o domínio para selecionar o roundtable correto:

```
1. Extrair keywords do contexto fornecido pelo usuário
2. Fazer match com domain_roundtable_map
3. Se múltiplos matches: perguntar ao usuário qual domínio
4. Se nenhum match: usar code_app (default)
5. Registrar em .state.json: { "domain": "copy_marketing", "roundtable_agents": [...] }
```

**Apresentar ao usuário:**
```
[enhance-workflow] Domínio detectado: copy_marketing
[enhance-workflow] Roundtable team: copy-chief, story-chief, funnel-architect, ads-analyst
[enhance-workflow] Confirma? [S/n]
```

---

## Input Collection

Pergunte ao usuario (use AskUserQuestion):

1. **Projeto**: Qual projeto/feature sera enhanced?
2. **Scope**: greenfield (novo) ou brownfield (existente)?
3. **Foco**: Qual o resultado esperado?

Se contexto já fornecido, pule para Pre-flight.

---

## Setup

### Diretório de Artefatos

```
outputs/enhance/{slug}/
├── 00-INDEX.md        # Hub de navegação (criado no início)
├── .state.json        # Checkpoint state
├── .metrics.json      # Métricas de execução
└── ...artefatos...
```

### Team Creation

```
TeamCreate(team_name: "enhance-{slug}")
```

### Task Creation (com dependências)

| ID | Task | Agent | Blocked By |
|----|------|-------|------------|
| 1 | Discovery | architect | - |
| 2 | Research | analyst | 1 |
| 3 | Roundtable | {domain_agents} | 2 |
| 4 | Create Epic | pm | 3 |
| 5 | QA Validation | qa | 4 |

### Criar 00-INDEX.md inicial

```markdown
# Enhance Workflow: {project_name}

**Iniciado:** {timestamp}
**Status:** 🔄 Em progresso
**Domínio:** {domain}
**Modo:** {quick/standard/deep}

## Fases

| # | Fase | Agente | Status |
|---|------|--------|--------|
| 1 | Discovery | @architect | 🔄 |
| 2 | Research | @analyst | ⏳ |
| 3 | Roundtable | {agents} | ⏳ |
| 4 | Create Epic | @pm | ⏳ |
| 5 | QA Validation | @qa | ⏳ |

## Artefatos

_Atualizados conforme fases completam_
```

---

## Phase Execution

### Progress Indicator Pattern

Antes de cada fase, mostrar:
```
[enhance-workflow] [1/5] Discovery em andamento...
```

Após cada fase:
```
[enhance-workflow] [1/5] Discovery completo (45s)
[enhance-workflow] [2/5] Research em andamento...
```

### Checkpoint Pattern

Após cada fase completar:
1. Atualizar `.state.json` com fase completa
2. Atualizar `00-INDEX.md` com status e link
3. Salvar hash do artefato gerado

---

### Phase 1: Discovery (@architect)

**Spawn agent** com prompt incluindo Context Preamble do AIOS.

Após completar:
- Checkpoint: `{ "phases": { "discovery": { "status": "completed", "artifact_hash": "..." } } }`
- Atualizar 00-INDEX.md

---

### Phase 2: Research (@analyst)

**Spawn agent** que lê 01-discovery.md e pesquisa.

Graceful degradation: Se falhar após 5 retries, continuar sem research (warn user).

---

### Phase 3: Roundtable (DINÂMICO)

**Spawn 4 agents em paralelo** baseado no domínio classificado.

Exemplo para `copy_marketing`:
- `rt-copy-chief` → perspectiva de copy
- `rt-story-chief` → perspectiva de storytelling
- `rt-funnel-architect` → perspectiva de funil
- `rt-ads-analyst` → perspectiva de tráfego

Cada agent lê 01-discovery.md e 02-research.md, fornece perspectiva especializada.

Após todos completarem, consolidar em `03-roundtable.md`.

---

### Phase 4: Create Epic (@pm)

**Spawn pm** que lê todos os artefatos e cria o Epic.

---

### Phase 5: QA Validation (@qa) - NOVA

**Spawn qa** para validar o Epic:

```
Você é Quinn, o QA do AIOS. Leia seu agent file em:
.claude/commands/AIOS/agents/qa.md

Execute *review no Epic gerado:

## Checklist de Validação

### Estrutura
- [ ] Epic Overview presente
- [ ] Scope (in/out) definido
- [ ] Success Metrics mensuráveis

### Stories
- [ ] Todas têm formato "Como X, quero Y, para Z"
- [ ] Acceptance criteria com checkboxes
- [ ] Story points estimados (fibonacci)
- [ ] Executor atribuído (@agent)

### Qualidade
- [ ] Definition of Done presente
- [ ] Risks and Mitigations documentados
- [ ] Technical Requirements claros

## Gate Decision

- **PASS**: Todos os critérios atendidos → Entregar ao usuário
- **CONCERNS**: >80% atendidos, não-críticos faltando → Entregar com warnings
- **FAIL**: <80% atendidos OU críticos faltando → Retry @pm (max 2x)

Salve resultado em: outputs/enhance/{slug}/05-qa-report.md
```

Se FAIL: Enviar feedback para @pm, re-spawnar, max 2 retries.
Se PASS/CONCERNS: Prosseguir para entrega.

---

## Finalizacao

1. **Atualizar 00-INDEX.md final** com todos os links e status ✅

2. **Apresentar resumo** ao usuario:
```
## Enhance Workflow Completo: {nome}

### Artefatos Gerados
- `00-INDEX.md` - Hub de navegação
- `01-discovery.md` - Análise técnica
- `02-research.md` - Pesquisa estratégica
- `03-roundtable.md` - Consenso ({domain})
- `04-epic.md` - Epic completo
- `05-qa-report.md` - Validação QA

### Epic: {titulo}
- Stories: {N} ({total} SP)
- QA Gate: {PASS/CONCERNS}
- Domínio: {domain}

### Próximos Passos
1. Revisar epic em 04-epic.md
2. Executar com /execute-epic {slug}
```

3. **Cleanup**: Shutdown agents, TeamDelete

4. **Finalizar métricas** em `.metrics.json`

---

## Modos de Execução (Futuro)

```yaml
modes:
  quick:
    phases: [discovery, epic]
    skip: [research, roundtable, qa]
    timeout: 10min

  standard:
    phases: [discovery, research, roundtable, epic, qa]
    timeout: 30min

  deep:
    phases: [discovery, research, roundtable, security_review, cost_analysis, epic, qa]
    timeout: 45min
```

---

## Retry Policy

```yaml
per_phase:
  discovery: { max_attempts: 3, on_max: fail_fast }
  research: { max_attempts: 5, on_max: graceful_skip }
  roundtable: { max_attempts: 2, on_max: continue_partial }
  epic: { max_attempts: 3, on_max: fail_with_partial }
  qa: { max_attempts: 2, on_max: deliver_with_warning }
```

---

## Notas de Implementação

- Cada agent roda em contexto isolado
- Comunicação entre fases via ARQUIVOS
- Roundtable roda em PARALELO
- Sempre use `mode: "bypassPermissions"`
- Determinism check ANTES de gastar tokens
- Domain classification ANTES de roundtable
- QA validation ANTES de entregar
