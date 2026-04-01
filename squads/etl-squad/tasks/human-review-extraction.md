# Task: Human Review Extraction

Interactive human review workflow for documents flagged by quality verification.

```yaml
task:
  id: human-review-extraction
  name: "Human Review for Extraction Quality"
  executor: etl-chief
  elicit: true

  description: |
    Presents documents that failed or scored conditionally in quality verification
    for human review. The reviewer can approve, reject, request re-extraction with
    specific instructions, or manually fix issues. Maintains a feedback loop that
    improves future extractions.

  input:
    required:
      - source_path: "Path to original file"
      - output_path: "Path to generated .md file"
      - quality_report: "Path to quality report from verify-extraction-quality"
    optional:
      - review_mode: "single | batch (default: single)"
      - priority: "critical | standard (default: standard)"

  execution:
    steps:
      - step: 1
        name: "Load Review Context"
        action: |
          1. Read quality report (dimensions, findings, score)
          2. Read source file metadata (type, size, pages/slides/sheets)
          3. Read output markdown (first 200 lines for preview)
          4. Identify specific problem areas from report findings
          5. Prepare side-by-side comparison samples

      - step: 2
        name: "Present Review Dashboard"
        action: |
          Display interactive review interface:

          ```
          ═══════════════════════════════════════════════════
          📋 HUMAN REVIEW — Extraction Quality
          ═══════════════════════════════════════════════════

          Source: {source_path}
          Type: {source_type} ({source_format})
          Output: {output_path}

          ┌─────────────────────────────────────────┐
          │ Quality Score: {score}/10 — {status}     │
          │                                         │
          │ Fidelity:     {fidelity}  {bar}         │
          │ Completeness: {completeness}  {bar}     │
          │ Structure:    {structure}  {bar}         │
          │ Metadata:     {metadata}  {bar}          │
          │ Readability:  {readability}  {bar}       │
          └─────────────────────────────────────────┘

          ⚠️  Problemas Encontrados:
            1. {finding_1}
            2. {finding_2}
            3. {finding_3}

          📄 Preview (primeiras 20 linhas do output):
          ─────────────────────────────────────────
          {preview_content}
          ─────────────────────────────────────────
          ```

      - step: 3
        name: "Present Review Options"
        elicit: true
        action: |
          ? O que deseja fazer com este documento?

            1. ✅ Aprovar como está
               → Aceita o output atual apesar do score baixo
               → Adiciona qa_status: APPROVED_MANUAL ao frontmatter

            2. ✅ Aprovar com nota
               → Aceita, mas registra observação para referência
               → Prompt: "Sua observação:"

            3. 🔄 Re-extrair com instruções
               → Especifica ajustes para nova tentativa
               → Prompt: "O que deve ser diferente na re-extração?"
               → Exemplos: "incluir tabelas completas", "preservar notas de rodapé"

            4. ✏️ Editar output manualmente
               → Abre o arquivo .md para edição direta
               → Após salvar: re-calcula score automaticamente

            5. ❌ Rejeitar
               → Marca como REJECTED, remove output .md
               → Registra motivo para análise futura

            6. ⏭️ Pular (batch mode)
               → Vai para próximo documento na fila
               → Mantém status NEEDS_REVIEW

      - step: 4
        name: "Execute Review Decision"
        action: |
          Based on user choice:

          APPROVE (1):
            - Update frontmatter: qa_status → APPROVED_MANUAL
            - Update qa_reviewed_by: "human"
            - Update qa_reviewed_at: {timestamp}
            - Log: "{filename} approved manually (score: {score})"

          APPROVE_WITH_NOTE (2):
            - Same as APPROVE + qa_review_note: "{user_note}"
            - Save note in quality report

          RE_EXTRACT (3):
            - Check frontmatter: qa_total_re_extractions count
            - If qa_total_re_extractions >= 5:
                → VETO: "Maximum re-extraction attempts reached (5). Approve, edit manually, or reject."
                → Do NOT allow more re-extractions
                → Return to step 3 with options 1,2,4,5 only
            - Capture user instructions
            - Re-run conversion pipeline with custom params
            - Re-run verify-extraction-quality
            - Increment qa_total_re_extractions in frontmatter
            - Return to step 2 with new results
            - Max re-extraction loops per review session: 3
            - Max total re-extractions across all sessions: 5

          MANUAL_EDIT (4):
            - Inform user: "Edit {output_path} and save."
            - Wait for confirmation: "Done editing? (y/n)"
            - Re-run verify-extraction-quality on edited file
            - Update frontmatter: qa_status → APPROVED_EDITED
            - Show new score vs previous score

          REJECT (5):
            - Prompt: "Motivo da rejeição:"
            - Move output to {output_dir}/.qa/rejected/{filename}.md
            - Save rejection reason in quality report
            - Update report: qa_status → REJECTED

          SKIP (6):
            - Keep current status (NEEDS_REVIEW)
            - Move to next file in batch queue

      - step: 5
        name: "Update Quality History"
        action: |
          Append review decision to quality history file:
          {output_dir}/.qa/review-history.yaml

          ```yaml
          reviews:
            - file: "{filename}"
              source: "{source_path}"
              original_score: 6.2
              decision: "APPROVE_WITH_NOTE"
              note: "Tabela truncada aceitável para este uso"
              reviewer: "human"
              timestamp: "2026-03-07T14:30:00"
              final_score: 6.2
          ```

      - step: 6
        name: "Batch Summary (batch mode only)"
        condition: "review_mode == 'batch'"
        action: |
          After all documents reviewed, show summary:

          ```
          ═══════════════════════════════════════════════════
          📊 REVIEW BATCH SUMMARY
          ═══════════════════════════════════════════════════

          Total reviewed: {N}
            ✅ Approved: {N} (avg score: {X})
            ✅ Approved with notes: {N}
            🔄 Re-extracted: {N} (avg improvement: +{X})
            ✏️ Manually edited: {N}
            ❌ Rejected: {N}
            ⏭️ Skipped: {N}

          Quality trend:
            Before review: avg {X}/10
            After review:  avg {Y}/10

          Remaining in queue: {N} documents
          ```

  feedback_loop:
    description: |
      Capture patterns from human review decisions to improve future extractions.
      Triggered AUTOMATICALLY after every 10 reviewed documents.

    trigger:
      type: automatic
      condition: "review_count % 10 == 0"
      action: |
        After the 10th, 20th, 30th... review decision (any type):
        1. Count review_count from review-history.yaml
        2. If divisible by 10 → auto-run feedback analysis
        3. Display: "📊 Feedback Analysis (based on {N} reviews):"
        4. Save analysis to data/review-feedback.yaml
        5. Suggest config changes if patterns detected
      owner: etl-chief
      output: "{squad_dir}/data/review-feedback.yaml"

    analysis:
      - "Most common rejection reasons → suggest new veto conditions"
      - "Most common re-extraction instructions → suggest as default params"
      - "Types with lowest scores → flag for processor improvement"
      - "Recurring structural issues → suggest checklist updates"
      - "Expired/stale queue items → flag review bottleneck"

    storage: "{squad_dir}/data/review-feedback.yaml"

  batch_queue:
    description: "Queue management for batch human review"
    source: "{output_dir}/.qa/review-queue.yaml"
    schema: |
      queue:
        - file: "report.md"
          source: "report.xlsx"
          score: 5.8
          status: NEEDS_REVIEW
          priority: standard
          findings_count: 3
          queued_at: "2026-03-07T10:00:00"
          expires_at: "2026-03-14T10:00:00"
    sort_order: "priority DESC, score ASC"
    filter: "status == NEEDS_REVIEW"
    expiration:
      max_age_days: 7
      on_expire: |
        When a queued item exceeds max_age_days without review:
        1. Update status: NEEDS_REVIEW → EXPIRED
        2. Update frontmatter: qa_status → AUTO_REJECTED_STALE
        3. Move output to {output_dir}/.qa/expired/{filename}.md
        4. Log: "WARN: {filename} expired after 7 days without review. Auto-rejected."
        5. Include in next feedback loop analysis as "unreviewed_expired"
      check_frequency: "On every *review or *qa-batch invocation"

  veto_conditions:
    - "Source file deleted → cannot review, mark as STALE"
    - "Output file deleted → cannot review, remove from queue"
    - "Quality report missing → re-run verify-extraction-quality first"

  output:
    format: |
      {
        "status": "APPROVED|APPROVED_WITH_NOTE|RE_EXTRACTED|EDITED|REJECTED|SKIPPED",
        "original_score": 5.8,
        "final_score": 7.2,
        "decision_note": "string or null",
        "re_extraction_count": 0,
        "reviewer": "human",
        "timestamp": "ISO timestamp"
      }

  completion_criteria:
    - "All queued documents reviewed or explicitly skipped"
    - "Quality history updated for each decision"
    - "Frontmatter updated for approved/edited documents"
    - "Rejected documents moved to .qa/rejected/"
    - "Batch summary displayed (if batch mode)"
```
