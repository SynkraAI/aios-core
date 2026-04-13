# 📍 Checkpoint: Fase {{phase_id}} — {{phase_name}}

**Data:** {{checkpoint_date}}
**Tipo:** {{checkpoint_type}}
**Projeto:** {{project_name}}

---

## Metadata

- **Fase ID:** {{phase_id}}
- **Fase Nome:** {{phase_name}}
- **Status da Fase:** {{phase_status}}
- **Completion:** {{completion_percentage}}%
- **Criado por:** {{created_by}}

---

## ✅ Completed Stories

{{#completed_stories}}
### {{story_id}}: {{story_title}}

- **Status:** ✅ Concluída
- **Completada em:** {{completion_date}}
- **Files modificados:** {{modified_files_count}}
- **Commits:** {{commit_count}}

**Principais mudanças:**
{{#key_changes}}
- {{change_description}}
{{/key_changes}}
{{/completed_stories}}

{{^completed_stories}}
_Nenhuma story concluída neste checkpoint._
{{/completed_stories}}

---

## 📝 Modified Files

{{#modified_files}}
- `{{file_path}}` ({{change_type}})
{{/modified_files}}

**Total:** {{total_modified_files}} arquivos

---

## 🔄 Next Phase Preview

**Próxima Fase:** {{next_phase_id}} — {{next_phase_name}}

**Preparação necessária:**
{{#preparation_items}}
- [ ] {{prep_item}}
{{/preparation_items}}

**Inputs necessários:**
{{#required_inputs}}
- {{input_description}}
{{/required_inputs}}

**Agente responsável:** @{{next_agent}}
**Comando sugerido:** `{{next_command}}`

---

## 📊 Métricas do Checkpoint

| Métrica | Valor |
|---------|-------|
| Stories concluídas | {{completed_stories_count}} |
| Files modificados | {{modified_files_count}} |
| Commits desde último checkpoint | {{commits_since_last}} |
| Dias em fase atual | {{days_in_phase}} |
| Velocity (stories/semana) | {{velocity}} |

---

## 🚨 Blockers / Issues

{{#blockers}}
- **{{blocker_type}}:** {{blocker_description}}
{{/blockers}}

{{^blockers}}
_Nenhum blocker identificado._
{{/blockers}}

---

## 💾 Restore Information

Para restaurar este checkpoint:
```bash
@navigator
*load-checkpoint {{checkpoint_id}}
```

**Checkpoint ID:** {{checkpoint_id}}
**Snapshot Path:** `.aiox/navigator/{{project_name}}/checkpoints/{{checkpoint_filename}}`

---

**Criado automaticamente por Navigator Agent 🧭**
