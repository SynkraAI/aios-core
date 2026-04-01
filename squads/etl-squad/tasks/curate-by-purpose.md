# Task: Curate by Purpose

Score sections by relevance to selected purpose and generate curated output.

```yaml
task:
  id: curate-by-purpose
  name: "Curate Content by Purpose"
  executor: etl-chief
  elicit: true  # Always interactive — presents chapter selection menu

  input:
    required:
      - structure_analysis: "Output from analyze-structure task"
      - purpose_id: "Selected purpose (squad-building, knowledge-base, mind-cloning, icp-cloning, content-creation, storytelling, custom)"
    optional:
      - custom_description: "User description when purpose_id=custom"
      - relevance_threshold: "Minimum score to include (default: 0.4)"

  purpose_focus_areas:
    squad-building:
      focus: [framework, instruction, definition]
      keywords_boost: [framework, method, model, step, process, heuristic, rule, principle, system, strategy]
      weight_override: { content_type_match: 0.45, keyword_overlap: 0.30 }

    knowledge-base:
      focus: [definition, framework, data]
      keywords_boost: [concept, theory, definition, taxonomy, classification, principle, law, axiom]
      weight_override: { content_type_match: 0.40, keyword_overlap: 0.30 }

    mind-cloning:
      focus: [opinion, narrative, instruction]
      keywords_boost: [believe, think, always, never, experience, learned, mistake, decision, approach]
      weight_override: { content_type_match: 0.35, keyword_overlap: 0.20, cross_reference: 0.20 }

    icp-cloning:
      focus: [narrative, opinion, data]
      keywords_boost: [customer, audience, pain, problem, objection, desire, fear, frustration, dream, goal]
      weight_override: { content_type_match: 0.40, keyword_overlap: 0.30 }

    content-creation:
      focus: [narrative, opinion, framework]
      keywords_boost: [story, hook, insight, quote, analogy, metaphor, example, lesson, takeaway]
      weight_override: { content_type_match: 0.35, keyword_overlap: 0.30 }

    storytelling:
      focus: [narrative, opinion]
      keywords_boost: [story, conflict, resolution, hero, villain, journey, transformation, moment, turning, climax]
      weight_override: { content_type_match: 0.45, keyword_overlap: 0.30 }

    custom:
      focus: "derived from user description via keyword extraction"
      keywords_boost: "extracted from custom_description"
      weight_override: null  # Use defaults

  execution:
    steps:
      - step: 1
        name: "Load purpose focus areas"
        action: |
          Look up the selected purpose_id in purpose_focus_areas above.
          If custom: extract keywords from custom_description and build
          a synthetic focus config with content types inferred from keywords.

      - step: 2
        name: "Score each section"
        action: |
          For each section in structure_analysis.sections, calculate
          a relevance_score (0.0 to 1.0) using 5 weighted dimensions:

          | Dimension | Default Weight | Description |
          |-----------|---------------|-------------|
          | content_type_match | 0.40 | Section primary_type in purpose focus[] → 1.0, secondary_types overlap → 0.5, no match → 0.0 |
          | keyword_overlap | 0.25 | Jaccard similarity between section keywords and purpose keywords_boost |
          | structural_position | 0.15 | Central chapters (25%-75% of doc) → 1.0, first/last 10% → 0.3, rest → 0.6 |
          | information_density | 0.10 | (lists + tables + code_blocks) / word_count, normalized. Higher = more dense |
          | cross_reference | 0.10 | Section referenced by other high-scoring sections → bonus. Isolated → 0.0 |

          Apply weight_override from purpose if present.

          final_score = sum(dimension_score * weight for each dimension)

      - step: 3
        name: "Safety check: over-curation"
        action: |
          Count sections with score >= relevance_threshold.
          If included sections < 30% of total:
            WARN: "Only {N}% of content passes threshold. This is aggressive curation."
            Auto-adjust: lower threshold by 0.1 increments until >= 30% included.
            Report adjusted threshold to user.

          If included sections > 95%:
            WARN: "Almost everything passes — curation is too lenient."
            Suggest raising threshold by 0.1.

      - step: 4
        name: "Present chapter selection menu"
        action: |
          Display interactive table using AskUserQuestion:

          ```
          ## Relevância por Capítulo ({purpose_label})

          | # | Capítulo | Palavras | Tipo | Relevância | Status |
          |---|----------|----------|------|------------|--------|
          | 1 | Grand Slam Offers | 3,200 | framework | 92% ████▉ | INCLUIR |
          | 2 | The Value Equation | 2,800 | framework | 88% ████▍ | INCLUIR |
          | 3 | My Story | 1,500 | narrative | 35% █▊   | EXCLUIR |
          | 4 | Acknowledgements | 200 | metadata | 5% ▎     | EXCLUIR |

          Threshold atual: {threshold}
          Incluídos: {N}/{total} capítulos ({pct}% do conteúdo)
          ```

          Options:
          1. "Aceitar sugestão" (Recommended) — Use threshold-based selection as shown
          2. "Incluir tudo" — Keep all sections regardless of score
          3. "Selecionar manualmente" — User picks specific chapters
          4. "Ajustar threshold" — User provides new threshold value

      - step: 5
        name: "Generate curated output"
        action: |
          Build curated markdown with:
          1. Frontmatter preserving original + adding curation metadata:
             ```yaml
             ---
             # ... original frontmatter ...
             curation:
               purpose: "{purpose_id}"
               purpose_label: "{purpose_label}"
               threshold: 0.4
               sections_included: 8
               sections_excluded: 3
               words_included: 24500
               words_excluded: 3200
               coverage: "88%"
               curated_at: "2026-03-05"
             ---
             ```
          2. Only included sections, preserving heading hierarchy
          3. Section markers for traceability:
             `<!-- curated: section-id, score: 0.92 -->`

      - step: 6
        name: "Save curated file"
        action: |
          Save as: {original_filename}.curated.md
          in same directory as source.
          Report: "Curated output saved: {path} ({words_included} words, {coverage}% of original)"

  veto_conditions:
    - "VETO_OVER_CURATION: After auto-adjustment, still < 20% included → abort curation. Content does not match purpose."
    - "VETO_EMPTY_CURATION: 0 sections pass threshold even at minimum 0.1 → abort. No relevant content found for this purpose."

  output:
    format: "Curated markdown file + curation report"
    used_by: ["wf-purpose-driven", "delegate-extraction"]

  completion_criteria:
    - "Every section scored with 5 dimensions"
    - "User confirmed chapter selection via interactive menu"
    - "Curated .md file saved with frontmatter"
    - "No content silently dropped (every exclusion visible in menu)"
    - "Safety checks passed (no over/under curation without user consent)"
```
