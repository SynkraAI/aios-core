# Sheets Instagram Pipeline Workflow
# Google Sheets → Instagram enrichment → Analyze → Outreach → CRM → Slack → Mark Done

```yaml
name: sheets-instagram-pipeline
version: "1.0.0"
description: "Pipeline completo: Google Sheets → Instagram enrichment → Analyze → Outreach → CRM → Slack → Mark Done"

trigger:
  command: "*pipeline"
  inputs: []  # No inputs needed — reads from sheet automatically

pipeline_config:
  processing_mode: single_lead  # processes 1 lead at a time
  min_score_threshold: 3
  max_rework_iterations: 2

retry_policy:
  max_retries: 2
  backoff: exponential
  initial_delay_seconds: 5
  retryable_errors:
    - "timeout"
    - "rate_limit"
    - "temporary_unavailable"

phases:
  - id: phase-1-fetch
    name: "Fetch Lead from Sheets"
    agent: prospector-chief
    model: haiku
    task: tasks/fetch-sheets-lead.md
    timeout_minutes: 5
    inputs: []
    outputs:
      - lead_data
      - instagram_username
    veto_conditions:
      - condition: "No leads with status Fila"
        severity: BLOCKING
        action: HALT
      - condition: "Sheet inaccessible"
        severity: BLOCKING
        action: HALT
    description: |
      Buscar proximo lead com status "Fila" na planilha Google Sheets.
      Retornar dados do lead + Instagram username.
    rollback: "No rollback needed - read-only operation"

  - id: phase-2-enrich
    name: "Enrich Lead Data"
    agent: instagram-researcher
    model: sonnet
    task: tasks/enrich-instagram.md
    timeout_minutes: 15
    depends_on:
      - phase-1-fetch
    inputs:
      - lead_data
      - instagram_username
    outputs:
      - enriched_data
    quality_gate: QG-001
    sub_phases:
      - id: phase-2a-instagram
        task: "EXA company_research → Instagram profile"
        description: "Research Instagram profile via EXA"
      - id: phase-2b-site
        task: "EXA web_search → site summary"
        description: "Search for website and summarize"
      - id: phase-2c-checkout
        task: tasks/detect-checkout-platform.md
        condition: "IF checkout_url provided"
        description: "Detect checkout platform if URL available"
    veto_conditions:
      - condition: "Instagram username not found"
        severity: WARNING
        action: LOG_AND_CONTINUE
      - condition: "EXA search failed"
        severity: WARNING
        action: LOG_AND_CONTINUE
    description: |
      Enriquecer dados do lead usando Instagram + site.
      Usar EXA para pesquisa de perfil e site.
      Detectar plataforma de checkout se URL disponivel.
    rollback: "No rollback needed - enrichment is additive"

  - id: phase-3-load-kb
    name: "Load Ensinio Knowledge Base"
    agent: prospector-chief
    model: haiku
    task: tasks/load-ensinio-kb.md
    timeout_minutes: 5
    parallel_with: phase-2-enrich
    outputs:
      - ensinio_kb
    veto_conditions:
      - condition: "KB source file not found"
        severity: BLOCKING
        action: HALT
      - condition: "KB file is empty"
        severity: BLOCKING
        action: HALT
      - condition: "Not all 5 pillars detected"
        severity: WARNING
        action: LOG_AND_CONTINUE
    description: |
      Carregar e estruturar os 5 pilares de solucao Ensinio (67 features).
      Source: data/ensinio-solutions-kb.md
      Pode rodar em paralelo com enrichment.
    rollback: "No rollback needed - read-only operation"

  - id: phase-4-analyze
    name: "Analyze & Score Prospect"
    agent: prospect-analyst
    model: sonnet
    task: tasks/analyze-and-score.md
    timeout_minutes: 15
    depends_on:
      - phase-2-enrich
      - phase-3-load-kb
    inputs:
      - enriched_data
      - ensinio_kb
    outputs:
      - analysis_result
    quality_gate: QG-002
    veto_conditions:
      - condition: "Enriched data not available"
        severity: BLOCKING
        action: HALT
      - condition: "KB not loaded"
        severity: BLOCKING
        action: HALT
    description: |
      Cruzar lead enriquecido com solucoes Ensinio.
      Scoring de temperatura (1-10).
      Classificar tipo de prospect e pilar principal.
      Filtrar score >= 3.
    rollback: "Re-analyze with adjusted scoring criteria"

  - id: phase-5-outreach
    name: "Generate Outreach Message"
    agent: outreach-writer
    model: opus
    task: tasks/generate-outreach.md
    timeout_minutes: 15
    depends_on:
      - phase-4-analyze
    inputs:
      - analysis_result
    outputs:
      - outreach_message
    veto_conditions:
      - condition: "Score < min_score_threshold"
        severity: BLOCKING
        action: "SKIP outreach, go directly to phase-7 (sync to CRM with low-score tag)"
    description: |
      Escrever mensagem personalizada baseada na analise.
      Usar Opus para maximo de qualidade e personalizacao.
      Se score < 3, pular para CRM sync sem mensagem.
    rollback: "Regenerate message with different approach"

  - id: phase-6-validate
    name: "Validate Outreach Message"
    agent: prospector-chief
    model: sonnet
    task: tasks/validate-outreach.md
    timeout_minutes: 10
    depends_on:
      - phase-5-outreach
    inputs:
      - outreach_message
    outputs:
      - validated_message
    quality_gate: QG-003
    veto_conditions:
      - condition: "Message contains forbidden patterns"
        severity: BLOCKING
        action: REWORK
      - condition: "Message quality score < 7/10"
        severity: WARNING
        action: REWORK
    description: |
      Validar humanizacao e qualidade da mensagem.
      Checklist de validacao (10 pontos).
      Se FAIL, acionar rework.
    on_failure:
      rework:
        task: tasks/generate-outreach.md
        agent: outreach-writer
        max_iterations: 2
        input: outreach_message
    rollback: "Return to phase-5-outreach with validation feedback"

  - id: phase-7-crm
    name: "Sync to GoHighLevel CRM"
    agent: crm-syncer
    model: sonnet
    task: tasks/sync-to-crm.md
    timeout_minutes: 10
    depends_on:
      - phase-6-validate
    inputs:
      - analysis_result
      - validated_message
    outputs:
      - crm_confirmation
    quality_gate: QG-004
    veto_conditions:
      - condition: "CRM API not accessible"
        severity: BLOCKING
        action: HALT
      - condition: "Contact already exists in CRM"
        severity: WARNING
        action: UPDATE_EXISTING
    description: |
      Sincronizar prospect para GoHighLevel CRM.
      Criar/atualizar contato com tags e notas.
      Incluir analise completa e mensagem validada.
    rollback: "Delete created contact if pipeline fails later"

  - id: phase-8-notify
    name: "Notify Team via Slack"
    agent: crm-syncer
    model: haiku
    task: tasks/notify-team.md
    timeout_minutes: 5
    depends_on:
      - phase-7-crm
    inputs:
      - analysis_result
      - crm_confirmation
    outputs:
      - notification_confirmation
    veto_conditions:
      - condition: "Slack API not accessible"
        severity: WARNING
        action: LOG_AND_CONTINUE
    description: |
      Notificar equipe via Slack com resumo do prospect.
      Incluir score, tipo, pilar principal e link CRM.
      Falha nao bloqueia pipeline.
    rollback: "No rollback needed - notification is informational"

  - id: phase-9-mark-done
    name: "Mark Lead as Processed"
    agent: prospector-chief
    model: haiku
    task: tasks/mark-lead-done.md
    timeout_minutes: 5
    depends_on:
      - phase-8-notify
    inputs:
      - lead_data
      - crm_confirmation
    outputs:
      - sheet_update_confirmation
    quality_gate: QG-005
    veto_conditions:
      - condition: "Sheet update failed"
        severity: BLOCKING
        action: RETRY
    description: |
      Atualizar status do lead na planilha para "Processado".
      Incluir link do CRM e timestamp.
      CRITICAL: Sem esta atualizacao, lead sera reprocessado.
    rollback: "Manual intervention needed - check sheet status"

completion:
  summary: "Lead processado com sucesso!"
  report:
    - lead_name
    - score
    - prospect_type
    - primary_pillar
    - crm_contact_id
    - outreach_message_preview
    - slack_notified
    - sheet_updated
```
