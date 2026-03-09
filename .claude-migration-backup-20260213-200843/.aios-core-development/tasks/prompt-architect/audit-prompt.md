# Audit Prompt (Evaluate Existing Prompt)

```yaml
task:
  id: audit-prompt
  agent: prompt-architect
  mode: 3
  elicit: false
  description: "Evaluate existing prompt against 10 dimensions, scan for anti-patterns, and check context rot risks"
  references:
    primary: docs/architecture/master-prompt-best-practices.md
    patterns: .claude/commands/AIOS/skills/system-prompt-architect/references/gpt-to-claude-patterns.md
  veto_conditions:
    - "No prompt provided for audit -- nothing to evaluate"
    - "Prompt is less than 5 lines -- too small for meaningful audit, suggest *create instead"
```

---

## Prerequisites

- User provides an existing system prompt (as file path or pasted content)
- Read `docs/architecture/master-prompt-best-practices.md` (all sections -- this is the scoring rubric)

---

## Pipeline (5 Steps)

### Step 1: Read the Prompt and the Best Practices Document

Load both files. The best practices doc is the scoring rubric for all 10 dimensions.

If the prompt is provided as a file path, use the Read tool to load it.
If pasted, use the content directly.

### Step 2: Score Against 10 Dimensions

Each dimension maps to a section of the best practices. Score each from 1 to 5:

| # | Dimension | Section | Score (1-5) | What to check |
|---|-----------|---------|-------------|---------------|
| 1 | **Structure** | 1.3, 1.4 | | 7-section order? Headers/delimiters? Logical flow? |
| 2 | **Goldilocks Zone** | 1.1 | | Not over-specified (AP-1) nor under-specified? Heuristics over rigid logic? |
| 3 | **Constraints with motivation** | 2.1, 2.2 | | Bullets? Positive framing? "Because..." present for key rules? |
| 4 | **Examples** | 1.3 item 7 | | At least 1-3 examples? Diverse? Anti-examples included? |
| 5 | **Output format** | 1.3 item 6 | | Schema, template, or example defined? Clear expectations? |
| 6 | **Uncertainty protocol** | 4.3 | | "If unsure, ask" instruction? Graceful degradation? |
| 7 | **Language tone** | 1.4, AP-3 | | Natural language or aggressive CAPS? Over-prompting? |
| 8 | **Interaction pattern** | 2.5, 4.2 | | Numbered options or open questions? Elicitation strategy? |
| 9 | **Platform awareness** | 2.6 | | Correct tool refs? No GPT-isms? MCP awareness if relevant? |
| 10 | **Scalability** | 5.1-5.7 | | Modular? JIT loading? Under 500 lines? Compaction strategy? |

**Scoring rubric:**
- **5** = Exemplary -- follows best practices precisely, could be used as a reference example
- **4** = Strong -- minor gaps, fundamentally sound
- **3** = Adequate -- works but has clear improvement opportunities
- **2** = Weak -- significant gaps affecting prompt quality
- **1** = Missing or harmful -- absent or actively counterproductive

### Step 3: Scan for Anti-Patterns (Section 3.1)

Check against the full catalog. For each anti-pattern found, note its severity and the specific text that triggered it:

| Code | Anti-Pattern | Severity | What to look for |
|------|-------------|----------|-----------------|
| AP-1 | Hardcoded if-else logic | High | Rigid decision trees, exhaustive case handling |
| AP-2 | Exhaustive edge case lists | Medium | Long lists trying to cover every scenario |
| AP-3 | ALL CAPS / aggressive language | High | CRITICAL, MUST, NEVER, ABSOLUTELY in emphasis (not in headings) |
| AP-4 | Missing examples | Medium | No concrete input/output demonstrations |
| AP-5 | Overlapping tool descriptions | High | Two tools that could handle the same request |
| AP-6 | Pre-loading all context | Medium | Large data dumps loaded upfront instead of JIT |
| AP-7 | Placeholder code ("// rest...") | High | Incomplete code samples |
| AP-8 | Prompt style != output style | Low | Markdown-heavy prompt when plain text output expected |
| AP-9 | Generic persona | Medium | "You are a doctor" without specialization or detail |
| AP-10 | No context rot prevention | High (long sessions) | No compaction, no memory strategy, no notes pattern |

### Step 4: Check for Context Rot Risks (Section 3.2)

Evaluate each of the four degradation types:

| Risk Type | Symptom | Present? | Evidence |
|-----------|---------|----------|----------|
| **Poisoning** | Outdated info in prompt that could mislead | | |
| **Distraction** | Irrelevant sections consuming tokens | | |
| **Confusion** | Similar/ambiguous terms or overlapping tools | | |
| **Clash** | Contradictory instructions | | |

### Step 5: Generate Audit Report

Format the output as a structured report:

```markdown
# System Prompt Audit Report

**Prompt:** [name/path]
**Date:** [date]
**Audited against:** docs/architecture/master-prompt-best-practices.md v1.0.0

## Summary
- **Overall Score:** X/50
- **Grade:** A (45-50) / B (35-44) / C (25-34) / D (15-24) / F (<15)
- **Anti-patterns found:** [AP codes]
- **Context rot risks:** [types found]
- **Quick wins:** [top 3 easy fixes]

## Dimension Scores

| # | Dimension | Score | Notes |
|---|-----------|-------|-------|
| 1 | Structure | X/5 | ... |
| 2 | Goldilocks Zone | X/5 | ... |
| 3 | Constraints + motivation | X/5 | ... |
| 4 | Examples | X/5 | ... |
| 5 | Output format | X/5 | ... |
| 6 | Uncertainty protocol | X/5 | ... |
| 7 | Language tone | X/5 | ... |
| 8 | Interaction pattern | X/5 | ... |
| 9 | Platform awareness | X/5 | ... |
| 10 | Scalability | X/5 | ... |

## Anti-Patterns Found

| Code | Severity | Location | Fix | Reference |
|------|----------|----------|-----|-----------|
| AP-X | High/Medium/Low | Line/section | Recommendation | Section X.Y |

## Context Rot Assessment

| Risk Type | Status | Evidence | Mitigation |
|-----------|--------|----------|------------|
| Poisoning | Found/Clean | ... | ... |
| Distraction | Found/Clean | ... | ... |
| Confusion | Found/Clean | ... | ... |
| Clash | Found/Clean | ... | ... |

## Recommended Actions (prioritized)

1. [Fix] -- Reference: Section X, Recommendation RY
2. [Fix] -- Reference: Section X, Recommendation RY
3. [Fix] -- Reference: Section X, Recommendation RY

## Rewritten Version (if score < 35/50)

[Full rewrite applying all recommendations -- only include if grade is D or F]
```

After presenting the report, offer:

```
What would you like to do?
1. Apply recommended fixes (*iterate)
2. Get a full rewrite (*create with these insights)
3. Save this audit report
4. Done -- no further action
```

---

## Expected Output

A structured audit report with numerical scores, anti-pattern findings, context rot assessment, and prioritized recommendations -- all grounded in specific best practices sections.
