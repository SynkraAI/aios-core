# Navigator Agent — Project Brief

**Data:** 2026-02-15
**Analyst:** Atlas (@analyst)
**Destinatário:** @squad-creator

---

## 1. Contexto e Motivação

### Pain Point Identificado
O usuário possui extensa documentação AIOS (guias visuais em HTML) mas frequentemente:
- Perde o fio da meada em projetos complexos
- Não sabe qual comando/agente usar em cada fase
- Precisa consultar manualmente épicos/stories para retomar contexto
- Tem dificuldade em manter visão geral do progresso

### Solução Proposta
Agente **Navigator Autônomo** que:
- Mapeia automaticamente o caminho ideal para qualquer projeto
- Mantém contexto consultando épicos/stories
- Detecta fase atual automaticamente
- Orquestra outros agentes
- Gera relatórios de progresso

---

## 2. Referências de Documentação

**Fonte:** Guias AIOS completos (análise realizada)
- `/Users/luizfosc/Dropbox/Downloads/AIOS-GUIA-COMPLETO.html`
- `/Users/luizfosc/Dropbox/Downloads/AIOS-MANUAL.html`

**Conteúdo-chave:**
- Pipeline de 10 fases (Pesquisa → PRD → Arquitetura → Épicos → Stories → Dev → QA → Fix → Deploy)
- Fluxo passo a passo com comandos exatos
- Orchestration multi-chat (exemplo Vita)
- Mapeamento agente → fase

---

## 3. Especificação do Agente Navigator

### 3.1 Persona

**Nome:** Vega (ou similar)
**Archetype:** Cartógrafo/Navegador
**Icon:** 🧭 ou 🗺️
**Zodiac:** Sagitário (explorador)

**Tone:** Guia experiente, orientado, confiável
**Vocabulary:** navegar, mapear, orientar, guiar, direcionar, rastrear

**Closing signature:** "— Vega, navegando seu caminho 🧭"

### 3.2 whenToUse

```
Use para mapear roadmap de projetos novos, detectar fase atual em projetos existentes,
retomar contexto perdido, orquestrar execução multi-agente, gerar relatórios de progresso,
e criar checkpoints de estado.

NOT for: Implementação de código → Use @dev. Criação de PRDs → Use @pm.
Definição de arquitetura → Use @architect.
```

### 3.3 Comandos (9 comandos principais)

| Comando | Descrição | Categoria |
|---------|-----------|-----------|
| `*map-project` | Mapear novo projeto (entrada híbrida) | Mapping |
| `*where-am-i` | Detectar fase atual e próximos passos | Navigation |
| `*auto-navigate` | Navegação autônoma (delega próximo agente) | Orchestration |
| `*orchestrate {epic}` | Setup multi-chat orchestration | Orchestration |
| `*checkpoint` | Criar checkpoint manual de progresso | Tracking |
| `*status-report` | Gerar relatório de status completo | Reporting |
| `*update-roadmap` | Atualizar roadmap manualmente | Maintenance |
| `*resume-project {name}` | Retomar projeto existente | Navigation |
| `*show-roadmap` | Visualizar roadmap completo | Viewing |

---

## 4. Decisões Técnicas (Coletadas via AskUserQuestion)

### 4.1 Formato de Entrada
**Escolha:** Híbrido (texto livre + perguntas complementares)

**Implementação:**
- Navigator recebe descrição em texto livre
- Analisa e extrai informações automaticamente
- Faz perguntas apenas sobre gaps/ambiguidades
- Balanceado entre rapidez e completude

### 4.2 Persistência
**Escolha:** Ambos — central + local sincronizado

**Estrutura:**
```
.aios/navigator/[project-name]/
  ├── roadmap.md              # Roadmap principal
  ├── checkpoints/            # Snapshots de progresso
  │   ├── 2026-02-15-phase-2.md
  │   └── 2026-02-16-phase-4.md
  └── reports/                # Relatórios de status
      └── 2026-02-15-weekly.md

[project-root]/docs/roadmap.md  # Cópia local sincronizada
```

**Script:** `roadmap-sync.js` sincroniza automaticamente entre central e local

### 4.3 Atualização
**Escolha:** Automático via git hooks

**Implementação:**
- Git hook `post-commit` detecta mudanças em `docs/stories/*.md`
- Atualiza roadmap automaticamente se stories/épicos mudaram
- Sincroniza central ↔ local
- Cria checkpoint se fase transitou

### 4.4 Orquestração (TODAS selecionadas)

**Funcionalidades:**

1. **Auto-delegar agentes**
   - Navigator identifica próxima fase do pipeline
   - Ativa automaticamente agente apropriado com comando correto
   - Exemplo: Detecta que PRD está pronto → ativa `@architect *create-full-stack-architecture`

2. **Multi-chat orchestration**
   - Gera prompts prontos para copiar em múltiplos chats Claude Code
   - Modelo: 1 SM coordenador + 3 Dev em waves paralelas
   - Baseado no exemplo Vita dos guias

3. **Checkpoints automáticos**
   - Cria snapshot do estado em cada transição de fase
   - Armazena: fase concluída, files modificados, próximos passos
   - Permite rollback se necessário

4. **Status reports**
   - Relatórios automáticos de progresso (diário/semanal configurável)
   - Formato: fase atual, % completo, blockers, próximos passos

---

## 5. Estrutura de Arquivos Necessários

### 5.1 Agente
```
.aios-core/development/agents/navigator.md
```

### 5.2 Tasks (9 arquivos)
```
.aios-core/development/tasks/
  ├── nav-map-project.md           # Mapear novo projeto
  ├── nav-detect-phase.md          # Detectar fase atual
  ├── nav-auto-navigate.md         # Navegação autônoma
  ├── nav-orchestrate.md           # Multi-chat orchestration
  ├── nav-checkpoint.md            # Criar checkpoint
  ├── nav-status-report.md         # Gerar relatório
  ├── nav-update-roadmap.md        # Atualizar roadmap
  ├── nav-where-am-i.md            # Mostrar posição
  └── nav-resume-project.md        # Retomar projeto
```

### 5.3 Templates (4 arquivos)
```
.aios-core/development/templates/
  ├── nav-roadmap-tmpl.md          # Template roadmap
  ├── nav-checkpoint-tmpl.md       # Template checkpoint
  ├── nav-status-report-tmpl.md    # Template relatório
  └── nav-orchestration-tmpl.md    # Template orchestration
```

### 5.4 Scripts (4 arquivos)
```
.aios-core/development/scripts/navigator/
  ├── roadmap-sync.js              # Sincronizar roadmaps
  ├── phase-detector.js            # Detectar fase atual
  ├── checkpoint-manager.js        # Gerenciar checkpoints
  └── orchestrator.js              # Orquestrar agentes
```

### 5.5 Data
```
.aios-core/development/data/
  └── navigator-pipeline-map.yaml   # Mapa de fases e transições
```

### 5.6 Git Hook
```
.husky/post-commit                  # Hook de atualização automática
```

---

## 6. Template do Roadmap

### Estrutura Sugerida

```markdown
# 🗺️ Project Roadmap: [Nome do Projeto]

**Criado:** [data]
**Última Atualização:** [data + hora]
**Status:** [Em Progresso / Bloqueado / Concluído]

---

## Overview

- **Tipo de Projeto:** [Greenfield / Brownfield / Hybrid]
- **Stack:** [Tech stack principal]
- **Complexidade:** [Simples / Médio / Complexo / Enterprise]
- **Estimativa:** [Semanas/Sprints previstos]

---

## Pipeline Customizado

| Fase | Agente | Comando | Status | Data |
|------|--------|---------|--------|------|
| 1. Pesquisa | @analyst | `*brainstorm` | ✅ | 2026-02-10 |
| 2. PRD | @pm | `*create-prd` | ✅ | 2026-02-11 |
| 3. Arquitetura | @architect | `*create-full-stack-architecture` | 🔄 | — |
| 4. Épicos | @pm | `*create-epic` | ⏳ | — |
| ... | ... | ... | ... | ... |

**Legenda:**
✅ Concluída | 🔄 Em Progresso | ⏳ Pendente | 🚫 Bloqueada

---

## Fase Atual: [Nome da Fase]

**Progresso:** [X/Y stories completas] (NN%)

### ✅ Concluídas
- [x] Fase 1: Pesquisa e brainstorming
- [x] Fase 2: PRD criado e validado

### 🔄 Em Progresso
- [ ] Fase 3: Arquitetura técnica (60% completo)
  - Epic: docs/stories/epic-1.md
  - Stories ativas: story-1.1.md, story-1.2.md

### ⏳ Pendentes
- [ ] Fase 4: Criação de épicos
- [ ] Fase 5: Stories detalhadas
- [ ] Fase 6-10: [...]

---

## Próximos Passos

**Agora:**
1. Agente: @architect
2. Comando: `*create-full-stack-architecture`
3. Input necessário: PRD completo em docs/prd.yaml
4. Output esperado: docs/architecture/full-stack-architecture.yaml

**Depois:**
1. @pm criar épicos
2. @sm criar stories
3. ...

---

## Checkpoints

- [x] **2026-02-10** — Fase 1 concluída (Pesquisa)
- [x] **2026-02-11** — Fase 2 concluída (PRD)
- [ ] **2026-02-15** — Fase 3 em progresso (Arquitetura)

Ver: `.aios/navigator/[project]/checkpoints/`

---

## Context Anchors

**Documentos principais:**
- PRD: `docs/prd.yaml`
- Arquitetura: `docs/architecture/full-stack-architecture.yaml`
- Épicos: `docs/stories/epic-*.md`
- Stories ativas: `docs/stories/story-*.md`

**Files recentes:** (últimas 10 modificações)
- [lista automática via git log]

---

## Métricas

- **Stories totais:** 24
- **Stories completas:** 8 (33%)
- **Commits:** 47
- **Último commit:** 2 horas atrás
- **Velocidade:** 2.5 stories/semana (média)

---

## Blockers

_Nenhum blocker ativo no momento._

---

**Gerado automaticamente por Navigator Agent 🧭**
```

---

## 7. Mapa de Pipeline (navigator-pipeline-map.yaml)

```yaml
# Pipeline de 10 fases do AIOS
# Fonte: AIOS-GUIA-COMPLETO.html + AIOS-MANUAL.html

phases:
  - id: 1
    name: Pesquisa
    agent: analyst
    icon: 🔍
    command: '*brainstorm'
    description: 'Market research, competitive analysis, brainstorming'
    inputs: []
    outputs:
      - 'docs/research/market-analysis.md'
      - 'docs/research/competitive-analysis.md'
    next_phase: 2

  - id: 2
    name: PRD
    agent: pm
    icon: 📋
    command: '*create-prd'
    description: 'Product Requirements Document creation'
    inputs:
      - 'docs/research/*'
    outputs:
      - 'docs/prd.yaml'
    next_phase: 3

  - id: 3
    name: Arquitetura
    agent: architect
    icon: 🏗️
    command: '*create-full-stack-architecture'
    description: 'Technical architecture design'
    inputs:
      - 'docs/prd.yaml'
    outputs:
      - 'docs/architecture/full-stack-architecture.yaml'
    next_phase: 4

  - id: 4
    name: Épicos
    agent: pm
    icon: 📋
    command: '*create-epic'
    description: 'Epic creation and breakdown'
    inputs:
      - 'docs/prd.yaml'
      - 'docs/architecture/*.yaml'
    outputs:
      - 'docs/stories/epic-*.md'
    next_phase: 5

  - id: 5
    name: Stories
    agent: sm
    icon: 🔄
    command: '*draft'
    description: 'User story creation'
    inputs:
      - 'docs/stories/epic-*.md'
    outputs:
      - 'docs/stories/story-*.md'
    next_phase: 6

  - id: 6
    name: Validação
    agent: po
    icon: 🎯
    command: '*validate-story-draft'
    description: 'Story validation and acceptance criteria'
    inputs:
      - 'docs/stories/story-*.md'
    outputs:
      - 'Validated stories (updated)'
    next_phase: 7

  - id: 7
    name: Desenvolvimento
    agent: dev
    icon: ⚙️
    command: '*develop'
    description: 'Code implementation'
    inputs:
      - 'docs/stories/story-*.md'
    outputs:
      - 'src/**/*'
      - 'tests/**/*'
    next_phase: 8

  - id: 8
    name: QA & Testes
    agent: qa
    icon: ✅
    command: '*review'
    description: 'Quality assurance and testing'
    inputs:
      - 'src/**/*'
      - 'tests/**/*'
    outputs:
      - '.aios/qa-reports/*.md'
    next_phase: 9

  - id: 9
    name: Fix Loop
    agent: dev
    icon: 🔧
    command: '*apply-qa-fixes'
    description: 'Fix QA issues and re-test'
    inputs:
      - '.aios/qa-reports/*.md'
    outputs:
      - 'Fixed code'
    next_phase: 10
    loop_back_to: 8  # Se ainda houver issues

  - id: 10
    name: Deploy
    agent: devops
    icon: ⚡
    command: '*push'
    description: 'Git push and deployment'
    inputs:
      - 'Validated code'
    outputs:
      - 'Remote repository updated'
    next_phase: null  # Fim do pipeline

# Regras de transição
transitions:
  auto_advance:
    - condition: 'all outputs created'
      action: 'move to next_phase'

  blocked:
    - condition: 'missing inputs'
      action: 'stay in current phase, report blocker'

  loop:
    - phase: 9
      condition: 'QA issues exist'
      action: 'loop back to phase 8'
```

---

## 8. Casos de Uso Esperados

### UC1: Iniciar Novo Projeto
```
Usuário: @navigator
Navigator: [greeting]
Usuário: *map-project
Navigator: Descreva seu projeto em poucas palavras.
Usuário: [descrição livre]
Navigator: [analisa, faz 2-3 perguntas complementares]
Navigator: [gera roadmap completo]
Navigator: Roadmap criado! Fase atual: Pesquisa. Próximo passo: @analyst *brainstorm
```

### UC2: Retomar Projeto Existente
```
Usuário: @navigator
Navigator: Detectei 3 projetos: 1) Vita, 2) AIOS Core, 3) Dashboard. Qual retomar?
Usuário: 1
Navigator: *where-am-i [auto-executa]
Navigator: Projeto Vita — Fase 7 (Desenvolvimento), 67% completo.
          Última atividade: 3 horas atrás (story-2.3.md).
          Próximo: @dev continuar story-2.4.md
Usuário: *auto-navigate
Navigator: [ativa @dev automaticamente com contexto]
```

### UC3: Orchestration Multi-Chat
```
Usuário: @navigator *orchestrate epic-1
Navigator: Epic 1 tem 6 stories. Estratégia: 3 waves paralelas.

          Copie os prompts abaixo em 4 chats Claude Code:

          CHAT 1 (Coordenador @sm):
          [prompt completo]

          CHAT 2 (Dev Wave 1):
          [prompt completo]

          ...
```

### UC4: Status Report Automático
```
[Git hook post-commit executa]
Navigator: [detecta que story-2.3 foi completada]
Navigator: [atualiza roadmap: story-2.3 ✅]
Navigator: [cria checkpoint-2026-02-15.md]
Navigator: [verifica se é sexta-feira → gera relatório semanal]
```

---

## 9. Requisitos Técnicos

### Dependências
- `Node.js` scripts para phase-detector, roadmap-sync, checkpoint-manager
- `YAML` parsing para ler pipeline-map e configs
- `Git` integration para hooks e detecção de mudanças
- `Glob/Grep` para buscar stories/épicos

### Integrações
- Leitura de `docs/stories/*.md` para detectar progresso
- Parsing de front-matter YAML em stories
- Git log para métricas (commits, velocity)
- Session state do AIOS para contexto

### Performance
- Phase detection deve ser <500ms
- Roadmap sync deve ser incremental (não reescrever tudo)
- Checkpoints compactados (não duplicar conteúdo)

---

## 10. Critérios de Aceite

### Must Have
- [ ] Agente Navigator criado e ativável via `@navigator`
- [ ] Comando `*map-project` funcional (entrada híbrida)
- [ ] Comando `*where-am-i` detecta fase corretamente
- [ ] Roadmap sincroniza entre central e local
- [ ] Template de roadmap completo e funcional
- [ ] Pipeline map com 10 fases configurado
- [ ] Git hook post-commit funcional

### Should Have
- [ ] Comando `*auto-navigate` delega para próximo agente
- [ ] Comando `*orchestrate` gera prompts multi-chat
- [ ] Checkpoints automáticos em transições
- [ ] Status reports gerados automaticamente

### Nice to Have
- [ ] Dashboard visual do roadmap (integração futura)
- [ ] Notificações quando fase muda
- [ ] Métricas de velocity e burndown

---

## 11. Handoff para @squad-creator

**O que fazer:**
1. Criar agente `navigator.md` seguindo padrão AIOS (persona completa em YAML)
2. Implementar 9 tasks em `.aios-core/development/tasks/nav-*.md`
3. Criar 4 templates em `.aios-core/development/templates/nav-*.md`
4. Desenvolver 4 scripts Node.js em `.aios-core/development/scripts/navigator/`
5. Criar pipeline map YAML em `.aios-core/development/data/navigator-pipeline-map.yaml`
6. Configurar git hook em `.husky/post-commit`

**Prioridade de implementação:**
1. Core: agente + map-project + where-am-i + roadmap template
2. Sync: roadmap-sync.js + git hook
3. Navigation: auto-navigate + phase-detector.js
4. Orchestration: orchestrate + orchestration template
5. Tracking: checkpoint + status-report

**Referências:**
- Padrão de agentes: `.aios-core/development/agents/pm.md`
- Padrão de tasks: `.aios-core/development/tasks/*.md`
- Scripts existentes: `.aios-core/development/scripts/*.js`

---

**Analyst:** Atlas (@analyst)
**Data:** 2026-02-15
**Status:** READY FOR IMPLEMENTATION ✅
