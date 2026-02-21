# ADR-AGF-7: Activation Architecture v3

## Status: Accepted
## Date: 2026-02-20
## Participants: Pedro Valerio, Alan Nicolas, Brad Frost, Mitchell Hashimoto
## Facilitator: @analyst (Atlas)

---

## Context

### Background

The Agent Fidelity (AGF) epic has progressed through six stories, evolving the activation architecture from SYNAPSE (8-layer Node.js engine) to SYNAPSE-Lite (4-hook bash architecture). AGF-7 investigates the optimal design for Activation Architecture v3, informed by Phase 1 research across 7 external repositories, 5 internal sources, and the complete SYNAPSE engine audit.

### 5 Critical Gaps Identified

1. **G1 — 3-Copy Divergence:** Every agent exists in 3 locations (agents/, commands/, skills/) with byte-for-byte identical bodies and only frontmatter differences. Every change must be manually replicated 3 times.

2. **G2 — Binary Context Loading:** The system offers only eager (load everything) or lazy (load nothing) — no graduated approach. This wastes tokens in FRESH sessions and starves context in DEPLETED sessions.

3. **G3 — Lost Activation Report:** The original UAP produced dynamic activation status in greetings (785 LOC). SYNAPSE-Lite reduced this to a static greeting with no runtime observability.

4. **G4 — Skill-as-Agent Confusion:** Skills are used as agent activation mechanisms, conflating task execution (single responsibility) with persona activation (persistent identity). This violates the Constitution's agent authority model.

5. **G5 — Bracket Inversion Incomplete:** Context brackets are detected (FRESH/MODERATE/DEPLETED/CRITICAL) but injection size does not scale proportionally — the core insight of ADR-AGF-3 D12 remains unimplemented.

### Phase 1+2 Findings Summary

- BMAD-METHOD (36.7k stars) proves single-source compilation to N IDE targets at scale
- claude-mem validates 3-tier progressive disclosure with ~10x token savings
- aios-stage demonstrates declarative lazy loading in production
- ADR-AGF-3: 5 of 12 decisions fully implemented, 5 partial, 2 missing
- SYNAPSE-to-Lite transition lost 10 capabilities, gained 3 new ones

---

## Decisions

### D-AGF7-1: Agent Compilation — Single YAML Source Compiled to N IDE Targets

**Decision:** Adopt a BMAD-style compilation pipeline where each agent is defined once in `.aios-core/development/agents/{id}/{id}.yaml` and compiled to IDE-specific outputs: `.claude/agents/{id}.md`, `.claude/commands/AIOS/agents/{id}.md`, `.claude/skills/{id}/SKILL.md`, and `.agents/skills/{id}/SKILL.md` (open standard).

**Rationale:**

The roundtable reached rapid consensus on this point. Pedro opened firmly: "Olha so, tres copias iguais? Isso e gap de tempo puro. Cada mudanca replicada 3 vezes manualmente e exatamente o tipo de trabalho repetitivo que deveria ser automatizado ontem. Se nao esta no YAML unico, nao aconteceu." Mitchell reinforced from IaC principles: "This is the textbook codification problem. You have desired state defined in 3 places — that guarantees configuration drift. Single source of truth, compiled to targets, is exactly how Terraform modules work. Describe intent once, tool handles the rest." Alan pushed for ROI clarity: "Pareto ao Cubo aqui — o compilador e 0.8% do esforco que elimina 51% da dor de manutencao. BMAD prova isso com 36.7k stars. Nao precisa reinventar." Brad validated with his redundancy radar: "37 button styles was a horror story. 3 identical agent copies is the same anti-pattern — DRY applies to agent definitions exactly like it applies to design tokens. One source, compiled variants, context-agnostic naming."

Pedro challenged on complexity: "Mas quanto custa manter esse compilador? Se ele quebrar, temos 3 alvos desatualizados." Mitchell countered: "Plan before apply. The compiler outputs a diff — you preview what changes before writing files. If it breaks, you have the last known-good compiled state in git. Immutability handles this." Alan closed: "Downside limitado — 500 LOC de compilador. Upside ilimitado — zero divergencia para sempre. Ratio menor que 0.05. Strong YES."

**Consequences:**
- Agent definitions become a single YAML schema (source of truth)
- Existing `claude-code.js` renderer is extended; new `codex.js`, `gemini.js`, `cursor.js` renderers added
- The `ide-sync` command becomes the compilation entry point
- Manual editing of compiled outputs is prohibited (compiler overwrites)
- Agent YAML schema must be documented and versioned

**Implementation (AGF-8+):**
1. Define agent YAML schema with sections: identity, commands, context-files, authority, memory-config, model-override
2. Extend `ide-sync` to compile from YAML source to N targets with appropriate frontmatter
3. Add git pre-commit hook to detect manual edits to compiled files
4. Migrate existing 10 agents from MD to YAML source format

---

### D-AGF7-2: Progressive Disclosure — 3-Tier Context Loading (DNA / Enhancement / Memory)

**Decision:** Implement 3-tier progressive context loading aligned with context brackets, replacing the binary eager/lazy model:
- **Tier 1 (DNA — always loaded):** Identity, persona, commands, authority boundaries (~200 tokens)
- **Tier 2 (Enhancement — on demand):** Collaboration rules, guide, coding standards (~500 tokens)
- **Tier 3 (Memory — when needed):** MEMORY.md, task context, story files, full rules (~1000+ tokens)

**Rationale:**

This decision generated the richest debate. Brad initiated with his Progressive Discovery framework: "This maps exactly to Atomic Design. Tier 1 is your atoms — the irreducible identity elements. Tier 2 is molecules — combinations that form working patterns. Tier 3 is organisms — the full complex context. You would never load organisms before atoms. The hierarchy is not optional." Alan agreed on structure but pushed quantification: "claude-mem proves 98% token reduction with 3-layer retrieval. Tres niveis de alavancagem: DNA e top 0.8% — carrega sempre. Enhancement e top 20% — carrega quando faz sentido. Memory e o restante — carrega quando pedido. Framework Elimina-Automatiza-Amplifica aplicado a tokens."

Pedro challenged the "on demand" trigger: "Quem decide quando Tier 2 e carregado? Se e o agente pedindo, ja perdeu tokens na requisicao. Se e automatico, qual e o gatilho? Precisa ser deterministico, nao heuristico." Mitchell proposed the solution: "Declarative config solves this. In the agent YAML, you declare `tier2_trigger: on_activation` or `tier2_trigger: on_first_task`. The hook reads the config and loads accordingly. Desired state, not imperative logic." Pedro approved: "Se esta na config, esta rastreavel. Posso auditar. Se nao esta na config, nao aconteceu."

Brad raised a scale concern: "How does this work with 1 agent? Fine. With 10 concurrent agents? That is 2000 tokens of DNA alone. With 30 agents in a squad? We need to test at scale." Alan responded: "Na pratica, maximo 2-3 agentes ativos por sessao. O bracket system ja limita isso. Mas o ponto e valido — tier loading deve ser agent-scoped, nao global."

**Consequences:**
- Agent YAML includes `context_tiers` configuration declaring what belongs in each tier
- SessionStart hook loads Tier 1 unconditionally
- Tier 2 loading is triggered by agent activation or first task assignment
- Tier 3 loading is triggered explicitly by agent request or bracket escalation
- Token costs are reported at each tier transition (observability)

**Implementation (AGF-8+):**
1. Add `context_tiers` section to agent YAML schema with file lists per tier
2. Modify `session-start.sh` to inject only Tier 1 content as additionalContext
3. Modify `user-prompt-submit.sh` to inject Tier 2 on agent activation detection
4. Add `*load-context` command for explicit Tier 3 loading
5. Report tier transitions and token costs in activation report (D-AGF7-3)

---

### D-AGF7-3: Activation Report v2 — Dynamic Activation Status Without UAP Overhead

**Decision:** Restore dynamic activation reporting via an enhanced `session-start.sh` hook that outputs structured activation status as additionalContext, plus agent frontmatter hooks for Agent mode. No Node.js dependency for the base report; optional Node.js helper for rich diagnostics.

**Rationale:**

Pedro set the bar: "O antigo UAP tinha 785 linhas e demorava 380ms. Isso e inaceitavel. Mas o atual nao mostra nada — nao sei qual agente ativou, qual bracket, nada. Preciso de rastreabilidade sem o custo." Mitchell framed it as Plan/Apply: "The activation report IS the plan output. Before Terraform applies changes, it shows you exactly what will change. SessionStart should show exactly what context was loaded, what agent is active, what bracket is current. That is the plan. The session itself is the apply."

Brad pushed for progressive disclosure in the report itself: "We are designing the report. Let us apply our own principles. Tier 1 report: agent name, bracket, branch — 3 lines. Tier 2 report: loaded files, token counts, story context — on request. We do not dump everything in the greeting." Alan agreed: "ROI: 20 linhas de bash para o report basico. 100 LOC de Node.js helper para o report rico. Downside limitado, upside de observabilidade total."

Pedro asked about Agent mode: "Quando e subagent — nao agente interativo — como reporta? Subagent nao tem greeting." Mitchell answered: "Claude Code v2.1 supports hooks in agent frontmatter. The `SubagentStart` hook fires when an Agent is spawned. Same report mechanism, different trigger." Pedro validated: "Se tem hook, tem rastreabilidade. Aprovado."

**Consequences:**
- `session-start.sh` outputs a structured activation block (agent, bracket, branch, story, loaded context count)
- Agent mode uses `SubagentStart` hook in agent frontmatter for equivalent reporting
- Report format is machine-parseable (structured text, not prose)
- Optional Node.js helper (`activation-report.js`) provides rich diagnostics (token costs, explainable traces)
- UAP code is not restored; its functionality is replicated in ~20 lines of bash

**Implementation (AGF-8+):**
1. Enhance `session-start.sh` to detect active agent, bracket, branch, and active story
2. Output structured report block as additionalContext
3. Add `hooks` section to agent frontmatter for SubagentStart trigger
4. Build optional `activation-report.js` helper for rich diagnostics (Phase 2)

---

### D-AGF7-4: 2-Mode Activation — Command (Interactive) + Agent (Autonomous)

**Decision:** Formalize exactly 2 activation modes. Eliminate skill-as-agent pattern:
- **Command Mode (Interactive):** User invokes `/aios-{agent}` or `/AIOS:agents:{agent}`. Agent persona activates inline in the current conversation. Hooks are active. No persistent memory by default.
- **Agent Mode (Autonomous):** System spawns `@{agent}` as a subagent via Task tool. Agent runs autonomously, returns result. Has persistent memory and model override via frontmatter.
- **Skills:** Single-responsibility tasks only (e.g., `/aios-devops-push`). Never used for agent activation.

**Rationale:**

Alan opened with systemic clarity: "Tres camadas de agentes: execucao, coordenacao, estrategia. Skills sao Layer 1 — execucao de tarefa unica. Agents sao Layer 2-3 — coordenacao e estrategia com identidade persistente. Misturar os dois e como usar um parafuso como martelo." Brad reinforced: "Skills-as-agent is the design system equivalent of putting organism logic inside an atom. An atom (skill) does one thing. An organism (agent) composes many things with persistent state. Mixing levels breaks the hierarchy."

Pedro challenged: "E se o usuario quiser ativar um agente via skill path? Tipo `/aios-dev` como skill? A experiencia muda?" Mitchell answered: "Workflows, not technologies. The workflow is the same: activate agent persona. The implementation differs: Command mode uses skill/command file compiled from agent YAML; Agent mode uses agents/ file. Two implementations of the same workflow, optimized for different contexts — interactive vs autonomous." Pedro pushed: "Entao o compilador gera os dois a partir da mesma YAML? O agente nao precisa saber qual modo?" Mitchell confirmed: "Exactly. The agent definition is the desired state. The compiler generates the appropriate target for each mode. The agent identity is immutable — only the activation mechanism differs."

Brad raised a naming concern: "If we keep skills as tasks only, we need to audit every existing skill that actually functions as an agent and migrate it. How many?" Alan estimated: "10 agent skills, 15-20 task skills. Migration e Pareto — migra os 10 agent skills primeiro, task skills ja estao corretos."

**Consequences:**
- Skills directory contains only single-responsibility tasks (fork skills)
- Agent activation via command/skill path is compiled from agent YAML (not manually maintained)
- Agent mode uses agents/ directory with memory+model frontmatter
- Clear naming convention: `/aios-{agent}` = command mode, `@{agent}` = agent mode, `/aios-{agent}-{task}` = skill (task)
- 10 existing agent-as-skill files are deprecated and replaced by compiler output

**Implementation (AGF-8+):**
1. Audit all skills to classify as agent-activation vs task-execution
2. Agent-activation skills are replaced by compiler output from agent YAML
3. Task skills remain as-is with clear naming: `/aios-{agent}-{task}`
4. Update documentation to formalize the 2-mode model
5. Add validation to compiler that prevents skill definitions from containing agent persona content

---

### D-AGF7-5: Bracket Inversion — Token-Budget-Proportional Injection

**Decision:** Implement full bracket inversion where injection size is proportional to context depletion. As the context window fills (bracket increases), more reinforcement context is injected per prompt:
- **FRESH (prompt < 10):** DNA only (~200 tokens) — model has full conversation history
- **MODERATE (prompt 10-24):** DNA + Constitution summary (~400 tokens)
- **DEPLETED (prompt 25-39):** DNA + Constitution + Memory snippets + Active story (~800 tokens)
- **CRITICAL (prompt 40+):** DNA + Constitution + Memory + Full rules + Session summary (~1400 tokens)

**Rationale:**

Mitchell framed this as state management: "This is the classic desired state vs current state problem. At FRESH, the desired state (agent context) matches current state (full conversation memory). No changes needed. At CRITICAL, current state has drifted (model has forgotten early context). The execution plan is: inject more context to restore alignment. It is literally plan/apply for token management."

Pedro validated with process absolutism: "Isso e deterministico? Prompt count 25 sempre injeta 800 tokens?" Mitchell confirmed: "Deterministic within the bracket. Same prompt count, same injection. Idempotent." Pedro approved: "Se e deterministico e rastreavel, e um processo. Processo e lei."

Alan challenged the token values: "Os numeros — 200, 400, 800, 1400 — sao chutes ou evidencia? Preciso de dados." Brad responded: "These are starting values. Show progress, not perfection. Ship these defaults, measure actual performance across 50 sessions, then iterate based on evidence. The specific numbers matter less than the architecture being correct." Alan accepted: "Framework correto, numeros iteraveis. Testa rapido, mede, ajusta. Time-box: 2 sprints para validar."

Pedro raised an edge case: "E se o usuario faz 40 prompts mas troca de agente no prompt 35? O bracket reseta?" Mitchell answered: "Agent switch resets bracket to FRESH because the context for the new agent starts clean. The bracket tracks agent context freshness, not absolute prompt count." Pedro: "Faz sentido. Novo agente, novo estado. Imutabilidade — nao muta o bracket, substitui."

**Consequences:**
- `user-prompt-submit.sh` reads prompt count and calculates injection size from a bracket->budget lookup table
- Injection content is prioritized: DNA (always) > Constitution (MODERATE+) > Memory (DEPLETED+) > Full rules (CRITICAL)
- Default token budgets are configurable in `core-config.yaml`
- Agent switch resets bracket to FRESH
- Bracket and injection size are reported in the activation report (D-AGF7-3)

**Implementation (AGF-8+):**
1. Add bracket->budget lookup table to `core-config.yaml` with default values
2. Modify `user-prompt-submit.sh` to calculate injection size from bracket
3. Implement priority-based content selection (DNA first, then Constitution, etc.)
4. Add agent-switch detection that resets bracket counter
5. Log bracket transitions and injection sizes for observability

---

### D-AGF7-6: Schema Validation — Validate Agent Definitions at Compilation Time

**Decision:** Agent YAML definitions are validated against a JSON Schema before compilation. Invalid agents are blocked from rendering with clear, actionable error messages. Validation follows the Terraform pattern: `validate -> plan -> apply`.

**Rationale:**

Mitchell led this point: "In Terraform, `terraform validate` catches syntax and schema errors before `terraform plan` ever runs. You do not plan invalid configuration. Same here: validate the agent YAML before the compiler generates any output. Fail fast, fail early." Pedro agreed emphatically: "Validacao e o primeiro gate. Se o agente nao tem identidade definida, nao compila. Se nao tem authority boundaries, nao compila. Clareza obrigatoria — ambiguidade e o inimigo."

Brad connected to component status: "In design systems, every component has a status: alpha, beta, stable, deprecated. Agent definitions should have the same. An alpha agent compiles with warnings. A stable agent must pass all validations. A deprecated agent compiles to a stub that says 'this agent is retired.'" Alan liked the efficiency angle: "Schema validation e Layer 1 do Elimina-Automatiza-Amplifica. Elimina agentes invalidos antes que gastem tokens. Zero waste."

Pedro pushed for specific required fields: "Quais campos sao obrigatorios?" The group converged on: `id`, `name`, `persona`, `authority`, `commands`, `context_tiers.tier1`. Optional but recommended: `memory`, `model_override`, `context_tiers.tier2`, `context_tiers.tier3`.

**Consequences:**
- Agent YAML JSON Schema is defined and versioned alongside the compiler
- `ide-sync validate` command checks all agent YAMLs before compilation
- CI pipeline includes schema validation as a gate
- Required fields: id, name, persona, authority, commands, context_tiers.tier1
- Optional fields: memory, model_override, context_tiers.tier2, context_tiers.tier3
- Component status field (alpha/beta/stable/deprecated) controls compilation behavior

**Implementation (AGF-8+):**
1. Define JSON Schema for agent YAML (based on existing agent definition patterns)
2. Add `validate` subcommand to `ide-sync`
3. Add `status` field to agent YAML with values: alpha, beta, stable, deprecated
4. Integrate validation into CI pipeline (GitHub Actions)
5. Generate human-readable validation error messages with fix suggestions

---

### D-AGF7-7: Cross-IDE Portability — Open Agent Skills Format for 26+ Platforms

**Decision:** The compiler generates Open Agent Skills format (`.agents/skills/*/SKILL.md`) alongside Claude Code native format. This enables AIOS agent definitions to work across 26+ platforms (Codex, Gemini, Cursor, Windsurf, etc.) from a single source.

**Rationale:**

Mitchell opened with his core principle: "Workflows, not technologies. The workflow is agent activation. The technology is Claude Code today, Codex or Gemini tomorrow. If your agent definitions are locked to one IDE, you have vendor lock-in. The Agent Skills standard is the cloud-agnostic layer." Alan agreed with strategic urgency: "Cenario 2027: 3 IDEs competem, cada um com suas convencoes. Se AIOS so funciona no Claude Code, perdemos 70% do mercado. Agent Skills e o hedge — funciona nos 3 cenarios. Limited losses, unlimited gains."

Pedro challenged on maintenance: "Mais um target de compilacao? Quantos cliques — quantos gaps de tempo — isso adiciona?" Brad answered: "This is exactly what a design system does. You design once, generate tokens for iOS, Android, Web. Adding a target to the compiler is incremental — the hard work is the source definition, which is already done (D-AGF7-1). Each new renderer is ~100 LOC." Mitchell confirmed: "Terraform providers work identically. Same HCL config, different providers for AWS, Azure, GCP. Adding a provider does not complicate the config — it extends reach."

Pedro demanded determinism: "O output do renderer Open Agent Skills e identico toda vez para o mesmo input?" Mitchell: "Immutable output. Same YAML in, same SKILL.md out. Versioned. Auditable." Pedro: "Entao e so mais um target no compilador. Zero gap adicional na operacao do dia-a-dia. Aprovado."

Brad added a progressive enhancement angle: "Start with Claude Code renderer (stable). Add Open Agent Skills (beta). Then Codex, Gemini as they mature. Progressive enhancement — each layer adds reach without breaking what works. Make it, show it is useful, make it official."

**Consequences:**
- Compiler generates `.agents/skills/{id}/SKILL.md` in Open Agent Skills format
- Claude Code native format (`.claude/skills/`, `.claude/agents/`, `.claude/commands/`) remains primary
- New renderers (`codex.js`, `gemini.js`, `cursor.js`) are added incrementally
- Cross-IDE output is validated against the Agent Skills specification
- Open Agent Skills format does not include AIOS-specific extensions (clean standard)

**Implementation (AGF-8+):**
1. Implement `open-agent-skills.js` renderer targeting `.agents/skills/` directory
2. Validate output against Agent Skills specification
3. Add renderer to `ide-sync` pipeline after Claude Code renderers
4. Implement `codex.js` renderer as second target (Codex CLI compatibility)
5. Add `gemini.js` and `cursor.js` renderers as those platforms stabilize

---

## Roundtable Highlights

### Pedro Valerio — Process Absolutism & Traceability

Pedro consistently demanded determinism, auditability, and zero ambiguity across all 7 decisions. His most impactful contributions:

- **On D1 (Compilation):** "Se nao esta no YAML unico, nao aconteceu. Tres copias manuais e o oposto de automacao — e fabricacao de gap de tempo."
- **On D2 (Progressive Disclosure):** "Quem decide quando Tier 2 e carregado? Se nao esta na config, e heuristico. Se e heuristico, e ambiguo. Se e ambiguo, vai falhar."
- **On D5 (Bracket Inversion):** "Se e deterministico e rastreavel, e um processo. Processo e lei. Se nao e deterministico, e opiniao — e opiniao nao escala."
- **Recurring theme:** Every mechanism must be auditable, every trigger must be explicit, every output must be deterministic.

### Alan Nicolas — Strategic Leverage & ROI Framing

Alan brought quantitative rigor and strategic positioning, framing every decision through Pareto ao Cubo and risk structure:

- **On D1 (Compilation):** "Downside limitado — 500 LOC. Upside ilimitado — zero divergencia. Ratio menor que 0.05. Strong YES."
- **On D4 (2-Mode):** "Skills sao Layer 1 execucao. Agents sao Layer 2-3 coordenacao. Misturar e como usar um parafuso como martelo."
- **On D7 (Cross-IDE):** "Se AIOS so funciona no Claude Code, perdemos 70% do mercado. Agent Skills e o hedge. Limited losses, unlimited gains."
- **Recurring theme:** Every decision must pass the ROI threshold (10x) and the Taleb risk structure (downside/upside < 0.1).

### Brad Frost — Component Hierarchy & Progressive Enhancement

Brad brought systematic design thinking, constantly mapping decisions to Atomic Design principles and insisting on incremental approaches:

- **On D2 (Progressive Disclosure):** "Tier 1 is atoms — irreducible identity. Tier 2 is molecules — working combinations. Tier 3 is organisms — full context. You would never load organisms before atoms."
- **On D5 (Bracket Inversion):** "Ship these defaults, measure across 50 sessions, iterate. The numbers matter less than the architecture being correct. Show progress, not perfection."
- **On D6 (Schema Validation):** "Every component has a status: alpha, beta, stable, deprecated. Agent definitions should have the same."
- **Recurring theme:** Hierarchy is not optional. Start with atoms, build up. Ship 80%, iterate with evidence.

### Mitchell Hashimoto — IaC Patterns & Declarative State

Mitchell provided the infrastructure blueprint, mapping every decision to proven IaC patterns from Terraform and the Tao of HashiCorp:

- **On D1 (Compilation):** "Single source of truth, compiled to targets, is exactly how Terraform modules work. Describe intent once, tool handles the rest."
- **On D3 (Activation Report):** "The activation report IS the plan output. SessionStart shows what will be loaded. The session is the apply."
- **On D5 (Bracket Inversion):** "At FRESH, desired state matches current state — no changes needed. At CRITICAL, state has drifted — inject more to restore alignment. Literally plan/apply for tokens."
- **Recurring theme:** Workflows not technologies. Declarative over imperative. Plan before apply. Immutable state with versioned replacements.

---

## Roadmap for AGF-8+

### Phase 1: Foundation (AGF-8) — Estimated 2-3 sprints

| Priority | Decision | Deliverable |
|----------|----------|-------------|
| P0 | D-AGF7-1 | Agent YAML schema + compiler pipeline |
| P0 | D-AGF7-6 | Schema validation (`ide-sync validate`) |
| P1 | D-AGF7-4 | 2-mode activation (audit + migrate 10 agent skills) |

**Rationale:** The compiler is the foundation — D2, D3, D5, and D7 all depend on the agent YAML source format. Schema validation is inseparable from compilation. 2-mode activation cleans the activation surface for the new architecture.

### Phase 2: Context Intelligence (AGF-9) — Estimated 2 sprints

| Priority | Decision | Deliverable |
|----------|----------|-------------|
| P0 | D-AGF7-2 | 3-tier progressive disclosure in hooks |
| P0 | D-AGF7-5 | Bracket inversion with configurable budgets |
| P1 | D-AGF7-3 | Activation report v2 (bash base + optional Node.js rich) |

**Rationale:** Progressive disclosure and bracket inversion are the token efficiency gains. Activation report provides observability into the new loading strategy.

### Phase 3: Portability (AGF-10) — Estimated 1-2 sprints

| Priority | Decision | Deliverable |
|----------|----------|-------------|
| P1 | D-AGF7-7 | Open Agent Skills renderer |
| P2 | D-AGF7-7 | Codex, Gemini, Cursor renderers |

**Rationale:** Cross-IDE portability is strategic but not blocking. The compiler must be stable (Phase 1) before adding targets.

### Dependencies

```
D-AGF7-1 (Compiler) ──> D-AGF7-6 (Validation) ──> D-AGF7-2 (Progressive Disclosure)
                    ──> D-AGF7-4 (2-Mode)      ──> D-AGF7-5 (Bracket Inversion)
                    ──> D-AGF7-7 (Cross-IDE)    ──> D-AGF7-3 (Activation Report)
```

All decisions depend on D-AGF7-1 (compiler) as the foundational change that establishes the agent YAML schema.

---

## Appendix A: Relationship to ADR-AGF-3

| ADR-AGF-3 Decision | AGF-7 Successor | Status |
|---------------------|-----------------|--------|
| D1 Progressive Enhancement 4 levels | D-AGF7-2 (3-tier) | Evolved: 4 levels -> 3 tiers with bracket alignment |
| D2 Atoms with state contract | D-AGF7-6 (Schema) | Replaced: atom state -> YAML schema validation |
| D3 Plan/Apply activation | D-AGF7-3 (Report) | Evolved: plan/apply -> activation report as "plan" output |
| D4 Activation Report | D-AGF7-3 (Report v2) | Restored: lightweight bash replaces UAP |
| D5 Required vs Enhancement atoms | D-AGF7-2 (Tiers) | Subsumed: required = Tier 1, enhancement = Tier 2 |
| D6 UserPromptSubmit agent switch | D-AGF7-5 (Bracket) | Retained + enhanced with injection scaling |
| D7 DNA/Enhancement separation | D-AGF7-2 (Tiers) | Retained: maps to Tier 1/Tier 2 boundary |
| D8 PreCompact preserves DNA | — | Retained as-is (working correctly) |
| D9 Memory consolidated | D-AGF7-2 (Tier 3) | Evolved: memory becomes Tier 3 content |
| D10 SYNAPSE dissolves to Lite | — | Retained: SYNAPSE-Lite is the execution engine |
| D11 Hierarchical XML priorities | D-AGF7-5 (Bracket) | Retained: priority attributes inform injection order |
| D12 Bracket Inversion | D-AGF7-5 (Full impl) | Completed: full token-budget-proportional injection |

---

## Appendix B: External References

| Source | Pattern Adopted | Decision |
|--------|----------------|----------|
| BMAD-METHOD (36.7k stars) | YAML->compiled MD; AgentAnalyzer profiling | D-AGF7-1 |
| claude-mem (29.6k stars) | 3-layer progressive disclosure (~10x savings) | D-AGF7-2 |
| claude-flow (14.3k stars) | Hook signals; anti-drift checkpoints | D-AGF7-3, D-AGF7-5 |
| aios-stage (internal) | Declarative lazy loading config | D-AGF7-2 |
| OpenMemory (3.4k stars) | Explainable traces for activation report | D-AGF7-3 |
| Agent Skills Standard | Open format for 26+ platforms | D-AGF7-7 |
| Terraform (HashiCorp) | Validate -> Plan -> Apply pattern | D-AGF7-6 |

---

*ADR-AGF-7 v1.0 — Activation Architecture v3*
*Roundtable: Pedro Valerio, Alan Nicolas, Brad Frost, Mitchell Hashimoto*
*Facilitated by: @analyst (Atlas)*
*Epic: Agent Fidelity (AGF) -- CLI First | Observability Second | UI Third*
