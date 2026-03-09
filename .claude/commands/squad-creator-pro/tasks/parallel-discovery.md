# Task: Parallel Discovery

**Task ID:** parallel-discovery
**Version:** 1.0.0
**Execution Type:** Hybrid (Worker parallelization + Agent synthesis)
**Model:** Sonnet
**Haiku Eligible:** NO
**Purpose:** Run domain discovery streams in parallel and merge deterministically
**Orchestrator:** @squad-chief

## Parallel Streams

```yaml
streams:
  market_signals:
    source: web + docs
    output: market-signals.yaml

  expert_minds:
    source: mind research
    output: expert-candidates.yaml

  tooling_stack:
    source: tool registry + MCP discovery
    output: tooling-options.yaml

  risk_constraints:
    source: architecture and governance docs
    output: risks-and-vetos.yaml
```

---

## Merge Strategy

1. Normalize outputs to YAML schema.
2. Deduplicate by key and source confidence.
3. Resolve conflicts using priority: `local > primary source > secondary source`.
4. Emit `discovery-merged.yaml` and `discovery-summary.md`.

---

## Output

```yaml
discovery_bundle:
  merged_file: outputs/discovery/{domain}/discovery-merged.yaml
  summary_file: outputs/discovery/{domain}/discovery-summary.md
  confidence_score: 0-1
  unresolved_conflicts:
    - "..."
```

---

## Success Criteria

- At least 3 streams completed successfully.
- Merged output has explicit source attribution.
- No unresolved critical conflicts.
