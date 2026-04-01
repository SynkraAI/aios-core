# workspace-context

```yaml
task:
  name: workspace-context
  description: "Load workspace context and output routing policy for the ETL session"
  squad: etl-squad
  phase: 0
  elicit: false

input:
  required: []
  optional:
    - workspace_path: "Path to workspace root (default: cwd)"
    - reload: "false (default). true → force reload even if cached"

execution:
  workflow: null
  agents: [etl-chief]

  steps:
    - agent: etl-chief
      action: "Load source type registry"
      rules:
        - "Read data/source-type-registry.yaml"
        - "Parse all source types with their detection patterns, methods, fallbacks"
        - "Build lookup tables: url_patterns, file_extensions, api_sources"

    - agent: etl-chief
      action: "Load output format spec"
      rules:
        - "Read data/output-format-spec.md"
        - "Extract format decision flowchart"
        - "Extract naming conventions"

    - agent: etl-chief
      action: "Load workspace config"
      rules:
        - "Read etl-config.yaml if exists (optional)"
        - "  Override defaults: output_dir, chunk_size, cache_ttl, parallel"
        - "If not exists → use defaults from squad.yaml"

    - agent: etl-chief
      action: "Build routing policy"
      rules:
        - "For each source type in registry:"
        - "  Map: source_type → pipeline → output_format → destination"
        - "Store as session context (available to all subsequent commands)"
        - "Report: N source types loaded, N pipelines available"

    - agent: etl-chief
      action: "Cache context"
      rules:
        - "Store loaded context in session"
        - "Subsequent calls return cached unless reload=true"
        - "Report cache status"

output_format: text

veto_conditions:
  - "source-type-registry.yaml not found → FAIL (run *workspace-preflight first)"
  - "source-type-registry.yaml invalid YAML → FAIL with parse error"
  - "output-format-spec.md not found → FAIL"

output_example: |
  ETL Workspace Context Loaded
  ============================
  Registry:    26 source types (10 web, 12 file, 2 api, 2 structured)
  Pipelines:   10 available
  Config:      etl-config.yaml found (custom output_dir, chunk_size=800)
  Cache:       fresh load (no previous cache)

  Routing Policy Active:
    webpage        → url-to-markdown    → .md   → local
    youtube        → youtube-to-brief   → .md   → local
    pdf            → pdf-to-knowledge   → .md   → local
    spreadsheet    → spreadsheet-to-json → .yaml → local
    audio          → audio-to-transcript → .md   → local
    ...and 5 more

  Session ready. All *process commands will use this routing.

completion_criteria:
  - "source-type-registry.yaml loaded and parsed"
  - "output-format-spec.md loaded"
  - "Routing policy built and cached"
  - "Config overrides applied if etl-config.yaml exists"
```
