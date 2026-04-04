# Workflow: Template

> Projeto pré-configurado. Pula Discovery e Spec, vai direto pras stories.

---

## When to Use

- Usuário quer criar um projeto que segue um padrão conhecido (SaaS, API, landing page, CLI)
- Não quer responder perguntas de Discovery (stack, arquitetura, etc.) — o template já define
- Quer ir direto pro código com mínima cerimônia
- Quer usar um template já existente em `skills/app-builder/templates/`

---

## Pipeline

```
LIST_TEMPLATES → SELECT → CUSTOMIZE → PHASE_2 (stories) → PHASE_3 (build) → PHASE_5 (deploy)
```

Phase 0 (Discovery) e Phase 1 (Spec) são **puladas** — o template já contém stack, arquitetura e structure.

---

## Execution

### Phase T-1: List Templates

If user ran `/forge template list`:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📦 Templates Disponíveis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Glob `{AIOS_HOME}/skills/app-builder/templates/*/TEMPLATE.md`.
For each template, read frontmatter (`name`, `description`) and display:

```
  > 1. **nextjs-saas** — SaaS app com auth, billing, dashboard
  > 2. **nextjs-fullstack** — Full-stack Next.js com API routes
  > 3. **express-api** — REST API com Express + Prisma
  > 4. **python-fastapi** — Python API com FastAPI
  > 5. **react-native-app** — Mobile app com React Native
  > 6. **cli-tool** — CLI tool com Node.js + Commander
  > ... ({N} templates no total)
  > {N+1}. Digitar o nome de um template.
```

If user ran `/forge template {name}`: skip listing, go to Phase T-2 directly.

### Phase T-2: Load Template

1. Read `{AIOS_HOME}/skills/app-builder/templates/{name}/TEMPLATE.md`
2. Extract from template:
   - **Tech Stack** — framework, database, ORM, auth, deploy target
   - **Directory Structure** — folder layout
   - **Key Concepts** — architectural patterns
   - **Default stories** (if template includes them)
3. Display template summary:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📦 Template: {name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Stack: {framework} + {database} + {ORM}
  Auth: {auth method}
  Deploy: {deploy target}

  Estrutura:
  {directory structure preview}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Phase T-3: Mini-Discovery (3 perguntas)

Only 3 customization questions — not the full Discovery:

```
Vamos personalizar o template:

> 1. **Nome do projeto?** (ex: "MyApp", "dashboard-admin")
```

Wait for answer, then:

```
> 2. **Descreve o que ele faz** (1-2 frases)
```

Wait for answer, then:

```
> 3. **Algo específico pra mudar no template?**
> a. Trocar alguma tecnologia (ex: "Drizzle em vez de Prisma")
> b. Adicionar algo (ex: "preciso de WebSocket")
> c. Nada, segue como está
```

### Phase T-4: Prepare Stories

1. If template has default stories: load them as draft stories
2. If template has no default stories: @sm creates based on template structure + user's description
3. Inject template's tech stack as `tech_decisions` in state.json (with `decided_by: "template"`)
4. **Skip Phase 0 and Phase 1** — jump directly to Phase 2

### Phase T-5: Continue with Standard Pipeline

From here, execute Phase 2 (Story Factory) → Phase 3 (Build) → Phase 5 (Deploy) normally.
The template's tech stack is injected into all agent dispatches as established decisions.

---

## Agent Mapping

| Phase | Agent | Note |
|-------|-------|------|
| T-1 to T-3 | Forge (self) | Template selection and customization |
| T-4 | @sm (if stories needed) | Story creation from template |
| T-5+ | Standard agents | Normal SDC per Phase 2→3→5 |

---

## Progress Display

```
  ✅ T-1: Template selecionado ({name})
  ✅ T-2: Template carregado (stack: {stack})
  ✅ T-3: Personalização completa
  🔄 T-4: Preparando stories...
  ○ Phase 2: Story Factory
  ○ Phase 3: Build Loop
  ○ Phase 5: Deploy
```

---

## Quest Integration

| Quest World | Forge Phase | XP |
|-------------|------------|-----|
| Same as FULL_APP | Phase 2 onward | Normal XP |

Template pula Phase 0+1, então XP começa a contar a partir de Phase 2.
O quest-sync plugin identifica templates via `state.json.template.name`.

---

## Quality Gates

Same as FULL_APP mode — all quality gates apply even though Discovery and Spec were skipped.

---

## Error Recovery

- Template não encontrado: mostrar lista de templates disponíveis e pedir para escolher
- Template YAML inválido: skip e sugerir outro template
- @sm falha ao criar stories do template: fallback para criação manual (perguntar ao usuário)
- A partir de Phase 2, error recovery padrão (runner.md §4) se aplica normalmente

---

## State Management

```json
{
  "mode": "TEMPLATE",
  "template": {
    "name": "nextjs-saas",
    "source": "skills/app-builder/templates/nextjs-saas/TEMPLATE.md",
    "customizations": {
      "project_name": "MyApp",
      "description": "SaaS de gerenciamento de tarefas",
      "tech_overrides": ["drizzle instead of prisma"]
    },
    "phases_skipped": [0, 1]
  }
}
```
