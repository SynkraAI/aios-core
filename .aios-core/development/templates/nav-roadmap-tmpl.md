# 🗺️ Project Roadmap: {{project_name}}

**Criado:** {{created_date}}
**Última Atualização:** {{last_updated}}
**Status:** {{status}}

---

## Overview

- **Tipo de Projeto:** {{project_type}}
- **Stack:** {{tech_stack}}
- **Complexidade:** {{complexity}}
- **Estimativa:** {{estimated_duration}}

---

## Pipeline Customizado

| Fase | Agente | Comando | Status | Data |
|------|--------|---------|--------|------|
{{#phases}}
| {{id}}. {{name}} | @{{agent}} | `{{command}}` | {{status_icon}} | {{completion_date}} |
{{/phases}}

**Legenda:**
✅ Concluída | 🔄 Em Progresso | ⏳ Pendente | 🚫 Bloqueada

---

## Fase Atual: {{current_phase_name}}

**Progresso:** {{completed_stories}}/{{total_stories}} stories completas ({{completion_percentage}}%)

### ✅ Concluídas
{{#completed_phases}}
- [x] Fase {{id}}: {{name}}
{{/completed_phases}}

### 🔄 Em Progresso
{{#in_progress_phases}}
- [ ] Fase {{id}}: {{name}} ({{progress}}% completo)
  {{#active_epics}}
  - Epic: {{epic_path}}
  {{/active_epics}}
  {{#active_stories}}
  - Stories ativas: {{story_list}}
  {{/active_stories}}
{{/in_progress_phases}}

### ⏳ Pendentes
{{#pending_phases}}
- [ ] Fase {{id}}: {{name}}
{{/pending_phases}}

---

## Próximos Passos

**Agora:**
1. Agente: @{{next_agent}}
2. Comando: `{{next_command}}`
3. Input necessário: {{required_inputs}}
4. Output esperado: {{expected_outputs}}

**Depois:**
{{#subsequent_steps}}
1. {{step_description}}
{{/subsequent_steps}}

---

## Checkpoints

{{#checkpoints}}
- [{{status}}] **{{date}}** — {{description}}
{{/checkpoints}}

Ver: `.aios/navigator/{{project_name}}/checkpoints/`

---

## Context Anchors

**Documentos principais:**
{{#main_docs}}
- {{doc_type}}: `{{doc_path}}`
{{/main_docs}}

**Files recentes:** (últimas 10 modificações)
{{#recent_files}}
- {{file_path}} ({{modified_date}})
{{/recent_files}}

---

## Métricas

- **Stories totais:** {{total_stories}}
- **Stories completas:** {{completed_stories}} ({{completion_percentage}}%)
- **Commits:** {{total_commits}}
- **Último commit:** {{last_commit_time}}
- **Velocidade:** {{velocity}} stories/semana (média)

---

## Blockers

{{#blockers}}
- **{{blocker_phase}}:** {{blocker_description}}
{{/blockers}}
{{^blockers}}
_Nenhum blocker ativo no momento._
{{/blockers}}

---

**Gerado automaticamente por Navigator Agent 🧭**
**Última atualização:** {{timestamp}}
