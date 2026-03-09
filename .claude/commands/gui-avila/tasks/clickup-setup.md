---
task: ClickUp Setup
responsavel: gui-avila
model: sonnet
elicit: true
sla:
  target: 15-25 min
  max: 35 min
  description: "Setup guiado de ClickUp — personalizado para contexto do usuário"
Entrada: |
  - areas_vida: Áreas da vida do usuário (trabalho, pessoal, saúde, etc.)
  - projetos_ativos: Projetos em andamento
  - equipe: Tamanho da equipe (solo, 2-5, 5+)
  - experiencia_clickup: Já usa ClickUp? Nível de experiência
Saida: |
  - workspace_structure: Hierarquia Spaces → Folders → Lists personalizada
  - template_views: Views recomendadas por contexto (Board, List, Calendar, etc.)
  - automation_rules: Automações nativas do ClickUp recomendadas
  - quick_start_guide: Primeiros 3 passos para implementar HOJE
veto_conditions:
  input:
    - "Sem áreas da vida definidas → ASK: 'Quais são suas áreas? Trabalho, Saúde, Família?'"
    - "Sem projetos ativos → ASK: 'No que você está trabalhando agora?'"
  process:
    - "Usuário quer usar ClickUp para brainstorm → CORRECT: 'ClickUp é execução. Brainstorm usa Whimsical.'"
    - "Estrutura com >5 Spaces → WARN: 'Simplifica. Mais Spaces = mais bagunça'"
    - "Misturar pessoal e profissional no mesmo Space → CORRECT: 'Separa. VIDA e TRABALHO são Spaces diferentes'"
  output:
    - "Hierarquia sem lógica clara → BLOCK: 'Se você não entende a estrutura, não vai usar'"
    - "Sem automações nativas → WARN: 'ClickUp tem automações grátis, não desperdiça'"
---

# *clickup-setup

Guiar setup completo do ClickUp personalizado para o contexto do usuário.

## When to Use

- Pessoa quer começar a usar ClickUp mas não sabe como organizar
- Já usa ClickUp mas está bagunçado / subutilizado
- Quer migrar de outra ferramenta (Trello, Asana, Notion) para ClickUp
- Precisa organizar equipe com processos claros

## Workflow

### Step 1: Elicitation — Mapear Contexto

1. **"Quais são suas áreas da vida?"** — Trabalho, Saúde, Família, Finanças, etc.
2. **"Dentro de Trabalho, quais projetos ativos?"** — Listar todos
3. **"Trabalha sozinho ou tem equipe?"** — Solo vs team muda a estrutura
4. **"Já usou ClickUp antes?"** — Nível de experiência
5. **"O que mais te frustra na organização atual?"** — Pain point principal

### Step 2: Desenhar Hierarquia

Aplicar framework Gui Ávila de ClickUp:

```
WORKSPACE: [Nome do usuário]
├── Space: VIDA (pessoal)
│   ├── Folder: Saúde
│   │   └── List: Treinos, Dieta, Exames
│   ├── Folder: Finanças
│   │   └── List: Receitas, Despesas, Investimentos
│   └── Folder: [Área pessoal]
│
├── Space: [EMPRESA/TRABALHO]
│   ├── Folder: [Projeto 1]
│   │   └── List: Backlog, Doing, Review, Done
│   ├── Folder: [Projeto 2]
│   │   └── List: [Etapas do projeto]
│   └── Folder: Operacional
│       └── List: Rotinas, Reuniões, Admin
```

Regras:
- Máximo 3-5 Spaces
- Folders = Projetos ou Áreas
- Lists = Etapas ou Categorias
- NUNCA misturar pessoal com profissional no mesmo Space

### Step 3: Configurar Views

Recomendar views por contexto:
- **Board View** → Para projetos com etapas (Kanban)
- **List View** → Para tarefas operacionais / checklists
- **Calendar View** → Para deadlines e eventos
- **Dashboard** → Para visão geral do workspace

### Step 4: Automações Nativas

Sugerir automações grátis do ClickUp:
- "Quando task muda para Done → Mover para folder Concluídos"
- "Quando deadline passa → Notificar responsável"
- "Quando nova task criada → Aplicar template de subtasks"

### Step 5: Quick Start — 3 Passos para HOJE

1. Criar os Spaces principais (VIDA + TRABALHO)
2. Criar 1 Folder com 1 List e adicionar 5 tasks reais
3. Configurar Board View e mover 1 task de Backlog → Doing

## Output Example

```
📋 ClickUp Setup — [Usuário]

Cara, olha só como ficou sua estrutura:

WORKSPACE: João Marketing
├── Space: VIDA
│   ├── Folder: Saúde → List: Treinos (Board View)
│   └── Folder: Finanças → List: Controle mensal (List View)
│
├── Space: AGÊNCIA
│   ├── Folder: Cliente A → Lists: Backlog | Doing | Review | Done
│   ├── Folder: Cliente B → Lists: Backlog | Doing | Review | Done
│   └── Folder: Interno → Lists: Marketing | Admin | Financeiro

AUTOMAÇÕES:
1. Task → Done = marca data de conclusão automática
2. Nova task em Cliente = aplica template de briefing
3. Deadline -1 dia = notificação no celular

QUICK START (faça AGORA):
1. Abra ClickUp → Crie Space "AGÊNCIA"
2. Crie Folder "Cliente A" → List "Backlog"
3. Adicione 5 tasks reais do Cliente A
4. Ative Board View → Arraste 1 task para "Doing"

Pronto. Em 10 minutos você já está organizado.
Beleza? 😊
```

## Inline Checklist

- [ ] Áreas da vida mapeadas
- [ ] Projetos ativos listados
- [ ] Hierarquia desenhada (Spaces → Folders → Lists)
- [ ] Views recomendadas por contexto
- [ ] Automações nativas sugeridas
- [ ] Quick start com 3 passos implementáveis HOJE
- [ ] Estrutura respeita limite de 3-5 Spaces

## Related

- **Agent:** gui-avila (T0)
- **Next Tasks:** automation-blueprint, automation-diagnostic
- **Reference:** ClickUp documentation, Gui Ávila YouTube tutorials
