# 📊 Status Report: {{project_name}}

**Período:** {{report_period}}
**Tipo:** {{report_type}}
**Gerado em:** {{generation_date}}

---

## Executive Summary

**Fase Atual:** {{current_phase}} — {{phase_name}}
**Progress:** {{completion_percentage}}% completo
**Status Geral:** {{overall_status}}

{{#summary_highlights}}
- {{highlight}}
{{/summary_highlights}}

---

## 📈 Métricas do Período

| Métrica | Valor | Variação |
|---------|-------|----------|
| Stories concluídas | {{completed_stories}} | {{stories_delta}} |
| Commits realizados | {{commits_count}} | {{commits_delta}} |
| Files modificados | {{files_modified}} | {{files_delta}} |
| Velocity (stories/semana) | {{velocity}} | {{velocity_delta}} |
| Dias ativos | {{active_days}} | — |

---

## ✅ Completed Work

### Neste Período

{{#completed_items}}
#### {{item_type}}: {{item_title}}

- **Concluído em:** {{completion_date}}
- **Responsável:** {{responsible_agent}}
- **Impact:** {{impact_level}}

**Descrição:**
{{item_description}}

{{/completed_items}}

{{^completed_items}}
_Nenhum item concluído neste período._
{{/completed_items}}

---

## 🔄 Work in Progress

{{#in_progress_items}}
### {{item_type}}: {{item_title}}

- **Status:** {{progress_percentage}}% completo
- **Iniciado em:** {{start_date}}
- **ETA:** {{estimated_completion}}
- **Responsável:** @{{responsible_agent}}

**Próximos passos:**
{{#next_steps}}
- [ ] {{step_description}}
{{/next_steps}}

{{/in_progress_items}}

{{^in_progress_items}}
_Nenhum trabalho em progresso no momento._
{{/in_progress_items}}

---

## ⏳ Pending Work

### High Priority

{{#pending_high_priority}}
- {{item_title}} (ETA: {{eta}})
{{/pending_high_priority}}

### Medium Priority

{{#pending_medium_priority}}
- {{item_title}} (ETA: {{eta}})
{{/pending_medium_priority}}

### Low Priority

{{#pending_low_priority}}
- {{item_title}}
{{/pending_low_priority}}

---

## 🚨 Blockers & Issues

{{#blockers}}
### {{blocker_severity}}: {{blocker_title}}

- **Identificado em:** {{identified_date}}
- **Impacto:** {{impact_description}}
- **Bloqueando:** {{blocked_items}}

**Ação necessária:**
{{blocker_action}}

{{/blockers}}

{{^blockers}}
✅ **Nenhum blocker ativo no momento.**
{{/blockers}}

---

## 📊 Velocity Chart

```
Semana 1: {{week1_velocity}} stories
Semana 2: {{week2_velocity}} stories
Semana 3: {{week3_velocity}} stories
Semana 4: {{week4_velocity}} stories
Média:    {{average_velocity}} stories/semana
```

**Tendência:** {{velocity_trend}}

---

## 🎯 Next Period Goals

{{#next_period_goals}}
1. {{goal_description}} (Priority: {{priority}})
{{/next_period_goals}}

---

## 📅 Upcoming Milestones

{{#upcoming_milestones}}
- **{{milestone_date}}:** {{milestone_name}} ({{days_until}} dias)
{{/upcoming_milestones}}

---

## 💡 Recommendations

{{#recommendations}}
- **{{recommendation_type}}:** {{recommendation_text}}
{{/recommendations}}

---

## 📎 Attachments

- Roadmap completo: `docs/roadmap.md`
- Checkpoints: `.aios/navigator/{{project_name}}/checkpoints/`
- Recent changes: `git log --since="{{period_start}}" --oneline`

---

**Gerado automaticamente por Navigator Agent 🧭**
**Próximo relatório:** {{next_report_date}}
