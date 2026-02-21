# AGF-7 Investigation Report: Activation Architecture v3

**Date:** 2026-02-20
**Lead:** @analyst (Atlas) + @architect (Aria)
**Story:** AGF-7 — Deep Investigation + ADR
**Status:** Phase 1 Complete

---

## 1. Executive Summary

This investigation analyzed 7 external repositories, 5 internal sources, and the complete SYNAPSE engine to inform the Activation Architecture v3 design. Three critical findings emerged:

**Finding 1: The 3-copy problem is solved by compilation.** BMAD-METHOD (36.7k stars) proves that a single YAML source compiled to IDE-specific outputs eliminates file divergence at its root. All 3 agent copies in AIOS (agents/, commands/, skills/) are byte-for-byte identical except for frontmatter — confirming the duplication is unnecessary and a compiler would solve it.

**Finding 2: Progressive disclosure is the optimal context loading strategy.** claude-mem's 3-layer retrieval (compact index -> timeline -> full details) achieves ~10x token savings. Combined with aios-stage's declarative `lazyLoading` config, this replaces the binary eager-vs-lazy debate with a graduated approach. The original SYNAPSE engine's token budgets (800-2500 per bracket) were a primitive version of this concept.

**Finding 3: 10 of 12 ADR-AGF-3 decisions remain valid, but only 5 are fully implemented.** D2 (atom state reporting) and D5 (required vs enhancement atoms) were never built. D4 (activation report) regressed from UAP. D12 (bracket inversion) is partially implemented — brackets are detected but injection size doesn't scale. The transition from SYNAPSE to SYNAPSE-Lite lost 10 major capabilities while gaining 3 new ones.

---

## 2. External Repository Research

### Triage Results

| # | Repository | Stars | Rating | Key Pattern |
|---|-----------|-------|--------|-------------|
| 1 | **BMAD-METHOD** | 36.7k | **A** | YAML->compiled MD; AgentAnalyzer profiles needed handlers |
| 2 | **claude-flow** | 14.3k | **A** | Swarm orchestration; 3-tier model routing; hook signals |
| 3 | **claude-mem** | 29.6k | **A** | Progressive disclosure 3-layer (~10x token savings) |
| 4 | **aios-stage** | internal | **A** | Declarative `lazyLoading` config; `devLoadAlwaysFiles` tiers |
| 5 | **memU** | 9.6k | **B** | Proactive pre-fetching; memory-as-filesystem metaphor |
| 6 | **OpenMemory** | 3.4k | **B** | Explainable traces (waypoint graph); composite scoring |
| 7 | **CARL** | 175 | **C** | Irrelevant (RL environments, not LLM agents) |

### Deep Dive: A-Rated Repositories

#### BMAD-METHOD — Agent Compilation Pipeline

The BMAD compiler (`compiler.js`) transforms YAML agent definitions into IDE-specific markdown files. Key components:

1. **ActivationBuilder** — loads fragments from `agent-components/` with Map-based cache. Composes `<activation critical="MANDATORY">` blocks with sequential numbered `<step n="N">` patterns.
2. **AgentAnalyzer** — scans agent YAML to detect which handlers are needed (workflow, exec, tmpl, data, action). Only needed handlers are included in output. This is **lazy loading at compile time**.
3. **Party Mode** — multiple agent personas coexist in one session for collaboration.
4. **Scale-Domain-Adaptive Intelligence** — adjusts planning depth based on project complexity. Small fixes get lightweight process; enterprise systems get full ceremony.

**Applicability to AIOS:** The compiler pattern directly solves G2 (3 copies per agent). A single `.aios-core/development/agents/{id}/{id}.yaml` source could compile to `.claude/agents/{id}.md`, `.claude/commands/AIOS/agents/{id}.md`, and `.claude/skills/{id}/SKILL.md` with appropriate frontmatter for each target.

#### claude-flow — Swarm Orchestration

Key patterns:
- **3-Tier Model Routing (ADR-026):** Routes to WASM (<1ms), Haiku (~500ms), or Opus (2-5s) based on task complexity. Hook signals like `[AGENT_BOOSTER_AVAILABLE]` guide pre-activation routing.
- **Memory-First Activation:** Agents MUST `memory_search` before starting work. Ensures context is loaded before action.
- **Anti-Drift Checkpoints:** `post-task` hooks validate agent hasn't drifted from persona or task.
- **Orchestrator vs Executor Separation:** claude-flow = LEDGER (tracks state); Claude Code = EXECUTOR (writes code).

**Applicability to AIOS:** Hook signal system for pre-activation routing; anti-drift concept for D5 (required atom validation).

#### claude-mem — Progressive Disclosure Memory

Key patterns:
- **3-Layer Workflow:** Layer 1 `search` (~50-100 tokens/result) returns compact index; Layer 2 `timeline` for chronological context; Layer 3 `get_observations` for full details (~500-1000 tokens/result).
- **5 Lifecycle Hooks:** SessionStart, UserPromptSubmit, PostToolUse, Stop, SessionEnd — maps directly to SYNAPSE hooks.
- **Token Cost Visibility:** Each retrieval layer reports token cost. Users see exactly how much context they're loading.
- **Privacy Tags:** `<private>` excludes content from storage.

**Applicability to AIOS:** The progressive disclosure model is the strongest candidate for solving the eager-vs-lazy debate. Instead of loading all context upfront (eager) or nothing (lazy), load a compact summary first and expand on demand.

#### aios-stage — Sibling AIOS with Lazy Loading

Key patterns:
- **Declarative Config:** `lazyLoading.enabled: true` with `heavySections` list (`pvMindContext`, `squads`, `registry`).
- **Two-Tier Always-Load:** `devLoadAlwaysFiles` (primary) and `devLoadAlwaysFilesFallback` (Portuguese fallback).
- **Auto-Load on Activation:** `projectStatus.autoLoadOnAgentActivation: true` with `showInGreeting: true`.

**Applicability to AIOS:** Already in the ecosystem. The `lazyLoading` config pattern is production-tested and compatible.

### B-Rated Repositories

#### memU — Proactive Memory

- Hierarchical 3-layer memory (resource/item/category)
- Proactive context pre-fetching based on intent prediction
- Dual agent+monitor architecture (main agent + background MemU bot)

**Applicable concept:** Background prediction of needed context could optimize activation latency.

#### OpenMemory — Explainable Recall

- Composite scoring: salience + recency + coactivation (not just cosine similarity)
- Explainable traces via Waypoint Graph showing which nodes were recalled and why
- Adaptive decay engine per memory sector

**Applicable concept:** Explainable traces are the best model found for an Activation Report mechanism (D4).

---

## 3. Internal Sources Audit

### ADR-AGF-3 Decision Implementation Status

| Decision | Summary | Status | Notes |
|----------|---------|--------|-------|
| D1 | Progressive Enhancement 4 levels | **Yes** | All 4 levels operational (DNA, frontmatter, rules, hooks) |
| D2 | Atoms with state contract | **No** | No atom state reporting exists |
| D3 | Plan/Apply for activation | **Partial** | Simplified collect-and-persist, no plan/diff/verify phases |
| D4 | Activation Report in greeting | **Partial** | Static greeting only, no dynamic activation status |
| D5 | Required vs Enhancement atoms | **No** | No classification; agents always activate regardless |
| D6 | UserPromptSubmit agent switch | **Yes** | Regex detection + DNA re-injection working |
| D7 | DNA/Enhancement separation | **Yes** | `=== PERSONA DNA ===` and `=== ENHANCEMENT ===` markers in all files |
| D8 | PreCompact preserves DNA | **Yes** | `pre-compact-persona.sh` extracts and injects DNA |
| D9 | Memory consolidated (4->2+rules) | **Partial** | 3-target structure exists but old files still present |
| D10 | SYNAPSE dissolves to Lite | **Partial** | 4 hooks active but old engine preserved for rollback |
| D11 | Hierarchical XML with priorities | **Yes** | critical/high/medium/low priority attributes working |
| D12 | Bracket Inversion | **Partial** | Brackets detected but injection size doesn't scale |

**Summary:** 5 fully, 5 partially, 2 not implemented. All 12 remain relevant.

### Hooks Audit

**Active hooks (registered in settings.json):**

| Hook | Trigger | ADR Coverage | Gaps |
|------|---------|-------------|------|
| `session-start.sh` | SessionStart | D3 partial | Missing atom reporting (D2), plan/verify (D3), activation report (D4) |
| `user-prompt-submit.sh` | UserPromptSubmit | D6, D11, D12 partial | Missing injection scaling (D12 full), required atom validation (D5) |
| `pre-compact-persona.sh` | PreCompact | D8 complete | None |
| `stop-quality-gate.sh` | Stop | D10 partial | Missing structured quality scoring |

**Finding:** 6 PreToolUse governance hooks exist on disk but may not be registered in `settings.local.json` — potentially inactive.

### 3-Copy Divergence Analysis

For 3 agents tested (po, dev, devops):

| Metric | Result |
|--------|--------|
| Body content divergence | **0%** — byte-for-byte identical |
| Only difference | Frontmatter (agents/ has memory+model+skills; commands/ has none; skills/ has name+description only) |
| Lines per agent | 300-570 |
| Maintenance cost | Every change must be replicated 3x manually |

**Conclusion:** The 3-copy problem is pure duplication with no semantic divergence. A compiler or symlink approach would eliminate maintenance burden entirely.

### Dependency Graph Epic (NOG) — Integration Opportunities

| # | Opportunity | Effort | Impact |
|---|------------|--------|--------|
| 1 | Dynamic context file selection via enriched entity registry | Medium | High |
| 2 | AST-based agent authority boundary enforcement | Medium | Medium |
| 3 | Token-aware bracket estimation (replace prompt_count heuristic) | Low | Medium |
| 4 | IDS G4 integration in activation greeting | Low | Medium |
| 5 | Cross-agent dependency awareness for handoff | High | High |

---

## 4. SYNAPSE Engine vs SYNAPSE-Lite Comparison

### Capability Status

| Status | Count | Key Examples |
|--------|-------|-------------|
| **Lost** | 10 | 8-layer pipeline, manifest/domain system, greeting builder (1400 LOC), memory bridge, diagnostics, DEVMODE, squad discovery, star-commands, workflow/task layers, token budget enforcement |
| **Simplified** | 10 | Context brackets (token->prompt-count), session manager (JSON->.env), agent injection (manifest->sed), output formatting (structured XML->flat fragments) |
| **New** | 3 | Stop quality gate, pre-compact persona DNA, env var persistence via CLAUDE_ENV_FILE |

### TOP 5 Lost Capabilities

1. **8-Layer Pipeline** — L0-L7 sequential execution with per-layer timeouts (5-20ms), deduplication, error recovery. Layers for workflow (L3), task (L4), squad (L5), star-commands (L7) have no equivalent.

2. **Manifest/Domain System** — Declarative KEY=VALUE configuration with recall keywords, exclusion lists, agent/workflow triggers. Allowed file-based rule configuration without code changes.

3. **UAP + Greeting Builder** — 785-line UAP with 3-tier loading (Critical 80ms, High 120ms, Best-effort 180ms) feeding into 1400-line GreetingBuilder producing session-aware, profile-aware, context-rich greetings.

4. **Memory Bridge (MIS)** — Bracket-aware memory retrieval: FRESH=0 tokens, MODERATE=50, DEPLETED=200, CRITICAL=1000. Agent-scoped, 15ms timeout, feature-gated.

5. **Token Budget Enforcement** — Per-bracket budgets (800-2500 tokens) with priority-based truncation. CONSTITUTION and AGENT sections protected; SUMMARY and KEYWORD removed first.

---

## 5. Patterns Worth Preserving

### From SYNAPSE Engine
- Token budget enforcement with priority-based truncation
- Layer ordering with deduplication
- Manifest-like declarative configuration
- Diagnostics/metrics (pipeline timing, load status)
- Greeting with dynamic activation status

### From SYNAPSE-Lite
- Bash simplicity (no Node.js cold start)
- CLAUDE_ENV_FILE persistence mechanism
- PreCompact persona DNA preservation
- Stop quality gate (session lifecycle governance)
- Delegation of L0/L1 to Claude Code native rules

### From External Repos
- BMAD compiler (single source -> N targets)
- claude-mem progressive disclosure (3-layer retrieval)
- aios-stage declarative lazy loading config
- claude-flow hook signals for pre-activation routing
- OpenMemory explainable traces for activation report

---

## 6. Investigation Questions Answered

### Q1: What is the optimal architecture for 2 modes (Command interactive + Agent autonomous)?

**Answer:** Command mode should use skill/command files generated by compiler with hooks active. Agent mode should use the agents/ file with memory+model frontmatter. The key difference is: Command gets hooks (session lifecycle) but no persistent memory; Agent gets memory but no hooks. A hybrid approach where Agent mode also gets hook-injected context (via the agent definition including a hook reference) would close this gap.

### Q2: Should we adopt BMAD's compilation approach?

**Answer:** Yes — strongly recommended. The 3-copy divergence analysis confirms 0% semantic divergence across copies. A compiler from a single YAML/MD source to 3 targets (with appropriate frontmatter) would eliminate maintenance burden and guarantee consistency. BMAD's AgentAnalyzer pattern (profile what handlers are needed) could optimize compiled output size.

### Q3: How to restore Activation Report without UAP overhead?

**Answer:** Two approaches emerged:
- **Lightweight:** Enhance `session-start.sh` to output a structured activation report as additionalContext (branch, story, agent status, loaded rules count, bracket). ~20 lines of bash.
- **Rich:** Adopt OpenMemory's explainable traces pattern — report which context files were loaded, why, and token cost. Requires a Node.js helper (~100 LOC) but provides full observability.

### Q4: Which memory/context patterns improve agent loading?

**Answer:** claude-mem's progressive disclosure is the strongest pattern. Instead of eager (load everything) or lazy (load nothing), implement 3 tiers:
- **Tier 1 (always):** DNA + Identity + Commands (~200 tokens)
- **Tier 2 (on demand):** Enhancement + Collaboration + Guide (~500 tokens)
- **Tier 3 (when needed):** Memory, rules, task context (~1000+ tokens)
This maps to aios-stage's `devLoadAlwaysFiles` (Tier 1) vs `heavySections` (Tier 3).

### Q5: How does AST/dependency graph inform context loading?

**Answer:** NOG-2's enriched entity registry could replace static always-load lists with dynamic ones based on what the agent's tasks actually import. The highest-impact opportunity is token-aware bracket estimation (replace prompt_count heuristic with actual token weight calculation from the registry). Low effort, medium impact.

### Q6: Should SYNAPSE-Lite hooks evolve or be replaced?

**Answer:** Evolve. The 4-hook architecture (SessionStart, UserPromptSubmit, PreCompact, Stop) is sound and maps to claude-mem's proven lifecycle model. What's needed is:
- Richer output from SessionStart (activation report)
- Bracket-proportional injection from UserPromptSubmit (D12 full implementation)
- Optional Node.js helper for complex operations (compilation, token estimation)
- Keep bash as the primary execution engine for speed

---

## 7. Open Questions for Roundtable

1. **Compiler complexity vs symlink simplicity:** BMAD compiler is ~500 LOC. Is a compiler worth it, or should we use symlinks + frontmatter injection (simpler, less powerful)?

2. **Node.js helper vs pure bash:** Some capabilities (token estimation, compilation, diagnostics) are hard in bash. Should SYNAPSE-Lite include an optional Node.js helper, or stay pure bash?

3. **Hook signals format:** claude-flow uses `[SIGNAL_NAME]` in additionalContext. Should AIOS adopt a similar signal protocol for pre-activation routing?

4. **Memory bridge restoration:** The original MIS memory bridge was feature-gated (pro). Should AGF-8+ restore bracket-aware memory retrieval, or is Claude Code's native `memory: project` sufficient?

5. **Squad discovery:** L5 (squad scanning) was lost. With the squads/ directory pattern, should squad context be restored via a hook or via native rules?

6. **Governance hooks activation:** 6 PreToolUse hooks exist but may not be registered. Should they be activated as part of v3?

---

## Appendix A: Research Methodology

- **External repos:** WebFetch on README + key source files; rated A/B/C by relevance to 4 criteria
- **Internal sources:** Direct file reads of all hooks, agent files (3 copies x 3 agents), ADR-AGF-3, NOG stories
- **SYNAPSE engine:** Read from `C:\Users\AllFluence-User\Workspaces\AIOS\SynkraAI\aios-core` — engine.js, layers, UAP, greeting-builder, domain-loader, memory-bridge, formatter
- **Total research scope:** 7 external repos, 5 internal sources, 25+ files analyzed

---

*Investigation Report v1.0 — AGF-7 Phase 1*
*Lead: @analyst (Atlas) + @architect (Aria)*
*Epic: Agent Fidelity (AGF) — CLI First | Observability Second | UI Third*
