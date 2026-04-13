# Projeto: {{project_title}}

**Status:** {{status_emoji}} {{status_text}}
**Última sessão:** {{last_session_date}}  <!-- Format: YYYY-MM-DD às HH:MM -->
**Squad principal:** {{primary_squad}}

---

## Estado Atual

{{current_state}}

## Próximo Passo

{{next_step}}

## Arquivos Relevantes

### Stories
{{#stories}}
- `{{path}}` — {{description}}
{{/stories}}
{{^stories}}
- Nenhuma story encontrada
{{/stories}}

### Epics
{{#epics}}
- `{{path}}`
{{/epics}}
{{^epics}}
- Nenhum epic encontrado
{{/epics}}

### Último Checkpoint
{{#checkpoint}}
- `{{path}}`
{{/checkpoint}}
{{^checkpoint}}
- Nenhum checkpoint encontrado
{{/checkpoint}}

### Scripts do Projeto
{{#scripts}}
- `docs/projects/{{project_name}}/scripts/{{filename}}` — {{description}}
{{/scripts}}

### Squads Relacionados
{{#squads}}
- `squads/{{name}}/` — {{description}}
{{/squads}}

## Histórico

- {{last_session_date}}: Projeto criado
