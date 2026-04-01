# Task: Delegate Extraction

Route curated content to downstream squads based on purpose.

```yaml
task:
  id: delegate-extraction
  name: "Delegate to Downstream Squads"
  executor: etl-chief
  elicit: true  # Always interactive — presents delegation menu

  input:
    required:
      - curated_path: "Path to .curated.md file from curate-by-purpose"
      - purpose_id: "Selected purpose"
    optional:
      - delegation_depth: "stop | auto | manual | chain (default: prompt user)"
      - target_squad: "Override default delegation target"

  purpose_delegation_map:
    squad-building:
      chain:
        - squad: squad-creator
          task: extract-knowledge
          input_mapping:
            source_path: "{curated_path}"
          output: "Knowledge extraction artifacts"
        - squad: squad-creator
          task: extract-voice-dna
          input_mapping:
            source_path: "{curated_path}"
          output: "Voice DNA profile"
        - squad: squad-creator
          task: extract-thinking-dna
          input_mapping:
            source_path: "{curated_path}"
          output: "Thinking DNA profile"
      ask_user: null

    knowledge-base:
      chain:
        - squad: knowledge-base-builder
          task: task-analyze-content
          input_mapping:
            source_path: "{curated_path}"
          output: "Content analysis"
        - squad: knowledge-base-builder
          task: task-extract-concepts
          input_mapping:
            source_path: "{curated_path}"
          output: "Concept extraction"
      ask_user: null

    mind-cloning:
      chain:
        - squad: mind-cloning
          task: collect-sources
          input_mapping:
            source_path: "{curated_path}"
          output: "Source collection"
        - squad: squad-creator
          task: extract-voice-dna
          input_mapping:
            source_path: "{curated_path}"
          output: "Voice DNA profile"
        - squad: squad-creator
          task: extract-thinking-dna
          input_mapping:
            source_path: "{curated_path}"
          output: "Thinking DNA profile"
      ask_user: null

    icp-cloning:
      chain:
        - squad: icp-cloning
          task: collect-icp-briefing
          input_mapping:
            source_path: "{curated_path}"
          output: "ICP briefing"
      ask_user:
        - field: "target_icp_name"
          prompt: "Nome do ICP alvo?"

    content-creation:
      chain: []  # User selects specific task
      ask_user:
        - field: "target_task"
          prompt: "Qual task do content-engine?"
          options: [write-post, write-script, hook-creation, write-newsletter, batch-content]

    storytelling:
      chain: []  # User selects specific task
      ask_user:
        - field: "target_task"
          prompt: "Qual task do storytelling-masters?"
          options: [build-story-structure, engineer-personal-story, craft-persuasive-talk, design-beat-sheet, make-it-stick]

    custom:
      chain: []  # No delegation — curation only
      ask_user: null

  execution:
    steps:
      - step: 1
        name: "Resolve delegation chain"
        action: |
          Look up purpose_id in purpose_delegation_map.
          If purpose is 'custom' → skip delegation, report "Curation complete. No delegation for custom purpose."
          If chain is empty → prompt user for target task.

      - step: 2
        name: "Verify squad availability"
        action: |
          For each squad in the chain:
          1. Check: squads/{squad_name}/config.yaml exists
          2. If missing: WARN and offer options:
             a. Skip this delegation step
             b. Install squad: "aios install {squad_name}"
             c. Abort delegation

          If ALL squads missing → VETO_DELEGATION_UNAVAILABLE

      - step: 3
        name: "Present delegation depth menu"
        action: |
          If delegation_depth not pre-set, show menu via AskUserQuestion:

          ```
          ## Delegação — {purpose_label}

          Chain prevista: {squad_1} → {squad_2} → {squad_3}
          ```

          Options:
          1. "Parar aqui" — Save curated file only, no delegation
          2. "Delegação automática" (Recommended) — Execute full chain sequentially
          3. "Escolher squad manualmente" — Pick which steps to run
          4. "Chain completa + relatório" — Full chain with detailed report

      - step: 4
        name: "Collect user inputs"
        action: |
          If ask_user fields defined for this purpose:
          For each field, prompt user via AskUserQuestion.
          Cache responses for the session (don't re-ask on retry).

          Map responses into input_mapping for delegation commands.

      - step: 5
        name: "Execute delegations"
        action: |
          For each step in the resolved chain (filtered by user selection):
          1. Log: "Delegating to {squad}/{task}..."
          2. Execute: activate squad agent and run task with mapped inputs
          3. Wait for completion (timeout per config.yaml delegation settings)
          4. On success: log output path/summary
          5. On failure: log error, ask user to skip or retry (max 1 retry)
          6. On timeout: log warning, mark as TIMED_OUT, continue

          Execute sequentially (each step may depend on previous output).

      - step: 6
        name: "Validate outputs"
        action: |
          For each completed delegation:
          - Verify output files exist
          - Verify non-empty
          - Log: "✓ {squad}/{task} → {output_path}"

          For failed/skipped:
          - Log: "✗ {squad}/{task} → {reason}"

      - step: 7
        name: "Report results"
        action: |
          Display summary:
          ```
          ## Delegation Report

          Purpose: {purpose_label}
          Source: {curated_path}

          | Step | Squad | Task | Status | Output |
          |------|-------|------|--------|--------|
          | 1 | squad-creator | extract-knowledge | ✓ DONE | artifacts/... |
          | 2 | squad-creator | extract-voice-dna | ✓ DONE | voice-dna.md |
          | 3 | squad-creator | extract-thinking-dna | ✗ TIMEOUT | — |

          Completed: 2/3
          Next steps: Re-run step 3 or proceed manually.
          ```

  veto_conditions:
    - "VETO_DELEGATION_UNAVAILABLE: All target squads are not installed. Cannot delegate without downstream processors."

  output:
    format: "Delegation report + downstream outputs"
    used_by: ["wf-purpose-driven"]

  completion_criteria:
    - "User confirmed delegation depth"
    - "All available squads verified before execution"
    - "Each delegation step logged with status"
    - "Outputs validated (exist, non-empty)"
    - "Summary report displayed"
```
