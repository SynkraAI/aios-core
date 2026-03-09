# Create Prompt (New System Prompt from Scratch)

```yaml
task:
  id: create-prompt
  agent: prompt-architect
  mode: 2
  elicit: true
  description: "Create a new system prompt from scratch with requirements elicitation"
  references:
    primary: docs/architecture/master-prompt-best-practices.md
    template: .aios-core/product/templates/personalized-agent-template.md
  veto_conditions:
    - "User cannot describe the purpose of the prompt -- elicit further before proceeding"
    - "Quality checklist score below 8/12 -- iterate before presenting"
```

---

## Prerequisites

- Read `docs/architecture/master-prompt-best-practices.md` (Sections 1.1, 1.3, 2.1-2.5, 4.2-4.3, 6.1-6.2)

---

## Pipeline (4 Steps)

### Step 1: Elicit Requirements

Use numbered options (Section 2.5). Present these questions one at a time or grouped if the user prefers:

```
1. What is the primary purpose of this agent/skill?
   (describe in one sentence)

2. Output format?
   1. SKILL.md (slash command)
   2. Agent YAML (AIOS agent with persona)
   3. Claude rule (.claude/rules/)
   4. Raw system prompt (API/generic)

3. Persona strategy? (Section 6.1 guidance)
   1. Full persona -- personality, tone, vocabulary
      (best for creative/open tasks)
   2. Minimal -- role definition only
      (best for analytical/factual tasks)
   3. None -- pure instructions
      (best for sub-agents and tool routing)

4. Domain expertise?
   (e.g., "Python backend", "UX design", "financial analysis")

5. Key constraints or behaviors?
   (list any must-have rules or must-avoid patterns)

6. Example interactions? (optional)
   (describe 1-2 ideal input/output pairs)
```

Record all answers before proceeding. If any critical answer is missing (questions 1, 2, 4), ask again -- do not proceed without them.

### Step 2: Draft Using the Goldilocks Zone

Follow the canonical 7-section structure (Section 1.3). Apply these principles from the best practices:

**From Section 1.1 (Goldilocks Zone):**
- Specific enough to guide behavior, flexible enough for Claude's intelligence
- Heuristics and principles, not hardcoded if-else logic (avoids AP-1)

**From Section 1.3 (Structure):**
- Use the 7-section order when sections are needed
- Not all sections required -- use what the prompt needs

**From Section 2.1 (Motivation):**
- Include 1-3 concrete examples -- format beats adjectives (avoids AP-2, AP-4)
- Motivation for every constraint -- "because..." reasoning

**From Section 2.2 (Positive Instructions):**
- Positive instructions over negations

**If persona was requested (option 1 in question 3)**, follow the 3 requirements from Section 6.2:
1. **Specific** -- aligned to domain
2. **Detailed** -- vocabulary, communication style, principles
3. **Functional** -- the persona should improve output quality, not just be decorative

**If Agent YAML format**, use the template at `.aios-core/product/templates/personalized-agent-template.md` and include:
- `agent` section (name, id, title, icon, whenToUse)
- `persona_profile` section (archetype, communication, vocabulary, greetings)
- `persona` section (role, style, identity, focus, core_principles)
- `commands` section (minimum: *help, *exit, plus domain commands)
- `dependencies` section

### Step 3: Validate Against Quality Checklist

Before presenting, run every item from `.aios-core/development/checklists/prompt-architect/quality-checklist.md`:

| # | Check | Reference | Status |
|---|-------|-----------|--------|
| 1 | Goal stated in first 3 lines | Section 1.3 item 1 | |
| 2 | Role specific and domain-aligned, not generic | Section 6.2, AP-9 | |
| 3 | Constraints as bullets with motivation | Section 2.1 | |
| 4 | Output format specified with schema or example | Section 1.3 item 6 | |
| 5 | At least 1 example included | Section 1.3 item 7, AP-4 | |
| 6 | Uncertainty protocol present | Section 4.3 | |
| 7 | Sections visually separated with headers | Section 1.4 | |
| 8 | No ALL CAPS aggressive language | Section 1.4, AP-3 | |
| 9 | Numbered options for user interaction points | Section 2.5 | |
| 10 | No GPT-specific references | Conversion patterns reference | |
| 11 | Claude Code tool awareness (Read/Write/Glob/Grep) | Section 2.6 | |
| 12 | Prompt under 500 lines if SKILL.md, under 200 for core if Agent YAML | Section 5.2 | |

**Veto condition:** If score is below 8/12, iterate internally before presenting. Fix failing items and re-validate.

### Step 4: Present with Self-Assessment

Show the draft prompt with the quality checklist results. Then offer iteration options as numbered list:

```
Quality Score: {score}/12

Options:
1. Approve as-is
2. Add more examples
3. Adjust tone/persona
4. Add more constraints
5. Simplify (reduce length)
6. Custom revision (describe what to change)
```

After user approves, follow the save protocol (see agent definition `save_protocol`).

---

## Expected Output

A complete system prompt in the chosen format, validated against the 12-item quality checklist, with a self-assessment showing how each check was addressed.
