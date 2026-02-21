# AGF-7 Tech Search: Recommendations for Roundtable

## Decision Points for Roundtable

### D1: Agent Compilation (Single Source of Truth)

**Recommendation:** Adopt BMAD-style compilation with AIOS renderers.
- Source: `.aios-core/development/agents/{id}/{id}.yaml`
- Targets: `.claude/agents/`, `.claude/commands/`, `.claude/skills/`, `.agents/skills/` (open standard)
- Existing `claude-code.js` renderer extended; new `codex.js`, `gemini.js`, `cursor.js`
- **Evidence:** BMAD v6 proves this at 36.7k stars. AIOS has 0% body divergence across 3 copies — pure duplication.

### D2: Progressive Disclosure for Context Loading

**Recommendation:** 3-tier loading aligned with bracket.
- Tier 1 (always): DNA + Identity + Commands (~200 tokens)
- Tier 2 (on demand): Enhancement + Collaboration (~500 tokens)
- Tier 3 (when needed): Memory, full rules, task context (~1000+ tokens)
- **Evidence:** 98% token reduction validated by claude-mem, Anthropic Skills, and 3 independent studies.

### D3: Activation Report v2

**Recommendation:** Lightweight bash in SessionStart hook + agent frontmatter hooks.
- Format: Agent | Level | Branch | Story | Context loaded (token counts) | Bracket
- Use `SubagentStart` hook for Agent mode reporting
- **Evidence:** 89% of orgs have agent observability. Claude Code v2.1 supports hooks in agent frontmatter.

### D4: 2-Mode Activation (Eliminate Skill-as-Agent)

**Recommendation:** Command (interactive, inline) + Agent (autonomous, subagent). Eliminate skill-as-agent.
- Skills = tasks (single responsibility, self-contained)
- Agents = personas (persistent identity, memory, model override)
- **Evidence:** Agent Skills standard (26+ platforms) treats skills as tasks, not personas. AIOS constitution agrees.

### D5: Bracket Inversion (D12 Full Implementation)

**Recommendation:** Implement token-budget-proportional injection in UserPromptSubmit.
- FRESH: minimal injection (DNA only, ~200t)
- CRITICAL: maximum injection (DNA + Memory + Constitution, ~1400t)
- **Evidence:** "Models attend to only 2-5% of input tokens" — more context needed as window fills.

### D6: Schema Validation

**Recommendation:** Validate at compilation time (pre-render), not runtime.
- Agent YAML validated against schema before IDE sync renders
- Invalid agents blocked from rendering with clear error
- **Evidence:** BMAD uses pre-compilation validation. Industry practice for IaC (Terraform validate → plan → apply).

### D7: Cross-IDE Portability

**Recommendation:** Generate Open Agent Skills format alongside Claude Code format.
- `.agents/skills/*/SKILL.md` — compatible with Codex, Gemini, 26+ platforms
- `.claude/skills/*/SKILL.md` — Claude Code native (richer frontmatter)
- **Evidence:** Agent Skills standard is industry-wide. AIOS already has the skill definitions.

---

## Next Steps

1. **Roundtable** with Pedro Valerio, Alan Nicolas, Brad Frost, Mitchell Hashimoto — present these 7 decision points
2. **ADR-AGF-7** — document consensus decisions
3. **AGF-8+** — implement decisions (compiler, progressive disclosure, activation report, 2-mode, bracket inversion, schema validation, cross-IDE)

---

*Implementation is out of scope for this research. Delegate to @pm for prioritization or @dev for execution.*
