# workspace-preflight

```yaml
task:
  name: workspace-preflight
  description: "Bootstrap and validate ETL workspace essentials before processing"
  squad: etl-squad
  phase: 0
  elicit: false

input:
  required: []
  optional:
    - workspace_path: "Path to workspace root (default: cwd)"
    - strict: "false (default) — WARN on missing optional deps. true — FAIL on any missing"

execution:
  workflow: null
  agents: [etl-chief]

  steps:
    - agent: etl-chief
      action: "Check output directory"
      rules:
        - "Verify config.storage.local_path exists (default: ./data/etl-output/)"
        - "Verify directory is writable (touch test file, remove)"
        - "If not exists → create it"
        - "If not writable → FAIL"

    - agent: etl-chief
      action: "Check data files"
      rules:
        - "Verify source-type-registry.yaml exists and is valid YAML"
        - "Verify output-format-spec.md exists"
        - "Verify etl-kb.md exists"
        - "If any missing → FAIL"

    - agent: etl-chief
      action: "Check agent files"
      rules:
        - "Verify all 6 agents exist in agents/"
        - "Verify etl-chief, extractor, parser, enricher, validator, loader"
        - "If any missing → FAIL"

    - agent: etl-chief
      action: "Check external dependencies"
      rules:
        - "Check ffmpeg/ffprobe availability (for extract-keyframes)"
        - "Check tesseract availability (for OCR)"
        - "Check whisper availability (for audio transcription)"
        - "Missing optional deps → WARN with install instructions"
        - "If strict=true → FAIL on any missing"

    - agent: etl-chief
      action: "Generate preflight report"
      rules:
        - "Summarize status per component"
        - "Overall verdict: READY / DEGRADED (warnings) / NOT READY (failures)"

output_format: text

veto_conditions:
  - "Output directory not writable → FAIL"
  - "source-type-registry.yaml missing or invalid → FAIL"
  - "Any agent file missing → FAIL"
  - "strict=true and any dependency missing → FAIL"

output_example: |
  ETL Workspace Preflight Report
  ==============================
  Output directory:    ./data/etl-output/     ✅ exists, writable
  source-type-registry: data/source-type-registry.yaml  ✅ valid (26 source types)
  output-format-spec:  data/output-format-spec.md       ✅ found
  etl-kb:              data/etl-kb.md                   ✅ found

  Agents:
    etl-chief   ✅    extractor  ✅    parser    ✅
    enricher    ✅    validator  ✅    loader    ✅

  External Dependencies:
    ffmpeg      ✅ 6.1.1    tesseract  ✅ 5.3.3
    whisper     ⚠️ not found (audio-to-transcript will fail)

  Verdict: DEGRADED (1 warning)
  Missing: whisper — install with: pip install openai-whisper

completion_criteria:
  - "All components checked and reported"
  - "Clear verdict (READY / DEGRADED / NOT READY)"
  - "Missing dependencies listed with install instructions"
  - "Output dir created if it didnt exist"
```
