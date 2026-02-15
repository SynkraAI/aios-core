# GPT to Claude Code Conversion Checklist

```yaml
checklist:
  id: prompt-conversion
  version: 1.0.0
  created: 2026-02-10
  agent: prompt-architect
  purpose: "Validate GPT prompt conversion completeness"
  mode: blocking
  reference: .claude/commands/AIOS/skills/system-prompt-architect/references/gpt-to-claude-patterns.md
```

---

## Conversion Checks (12 items)

Derived from the 9 documented patterns in `references/gpt-to-claude-patterns.md` plus AIOS-specific requirements.

```yaml
checks:
  # ================================================================
  # REMOVE: GPT-specific patterns that must be eliminated
  # ================================================================

  - id: CC-01
    check: "ALL CAPS emphasis removed"
    type: blocking
    pattern: P1
    reference: "Pattern 1 in gpt-to-claude-patterns.md, Section 1.4, AP-3"
    action: "Replace with natural language. Add motivation ('because...')"
    before: "YOU MUST IDENTIFY THE CANDIDATE'S MOST IMPRESSIVE ACHIEVEMENTS"
    after: "Identify and highlight the candidate's most impressive achievements."

  - id: CC-02
    check: "Fake credentials and awards removed"
    type: blocking
    pattern: P2
    reference: "Pattern 2 in gpt-to-claude-patterns.md, Section 6.2"
    action: "Replace with specific domain expertise description"
    before: '"AWARDED THE BEST RESUME WRITER AWARD BY THE GLOBAL CAREER ASSOCIATION"'
    after: '"Expert resume writer specializing in [target industry]"'

  - id: CC-03
    check: "ChatGPT/OpenAI identity references removed"
    type: blocking
    pattern: P7
    reference: "Pattern 7 in gpt-to-claude-patterns.md"
    action: "Remove entirely or replace with domain role"
    before: '"YOU ARE AN ELITE PROMPT ENGINEER RECRUITED BY OPENAI"'
    after: '"You are a prompt engineering specialist focused on..."'

  - id: CC-04
    check: "'OBEY' and compliance language removed"
    type: blocking
    pattern: P9
    reference: "Pattern 9 in gpt-to-claude-patterns.md, AP-3"
    action: "State instructions directly without compliance demands"
    before: '"OBEY and never do:"'
    after: '"## Constraints\n- [constraint with motivation]"'

  # ================================================================
  # ADD: Claude Code / AIOS patterns that should be present
  # ================================================================

  - id: CC-05
    check: "Tool awareness added (Read, Write, Glob, Grep, WebSearch, Bash)"
    type: blocking
    pattern: P8
    reference: "Pattern 8 in gpt-to-claude-patterns.md, Section 2.6"
    action: "Replace GPT tool references with Claude Code equivalents"
    before: '"Browse the web" / "Use Code Interpreter"'
    after: '"WebSearch tool" / "Bash tool"'

  - id: CC-06
    check: "Numbered options added for interaction points"
    type: recommended
    reference: "Section 2.5"
    action: "Convert open-ended user choices to numbered options"
    before: '"Ask the user what they prefer"'
    after: '"Present options as numbered list (1, 2, 3)"'

  - id: CC-07
    check: "Uncertainty protocol added"
    type: blocking
    reference: "Section 4.3"
    action: "Add instruction for handling uncertainty"
    instruction: 'Add "If unsure, say so and ask a clarifying question."'

  - id: CC-08
    check: "Motivation added for constraints"
    type: blocking
    reference: "Section 2.1"
    action: "Add 'because...' reasoning to key constraints"
    before: '"Never use reticencias"'
    after: '"Never use reticencias because your output will be read by a TTS engine."'

  # ================================================================
  # KEEP but ADAPT: Patterns that transfer with modifications
  # ================================================================

  - id: CC-09
    check: "CoT structure kept but made conditional"
    type: recommended
    pattern: P3
    reference: "Pattern 3 in gpt-to-claude-patterns.md, Section 1.1"
    action: "Keep step-by-step reasoning but add 'when complex' qualifier"
    before: '"Always follow these 7 steps for every response"'
    after: '"Show reasoning when the problem is complex. For straightforward requests, respond directly."'

  - id: CC-10
    check: "Few-shot examples kept and enhanced with anti-examples"
    type: recommended
    pattern: P5
    reference: "Pattern 5 in gpt-to-claude-patterns.md, Section 1.3 item 7"
    action: "Keep existing examples and add anti-examples (what NOT to produce)"
    instruction: "Add ### Anti-example section alongside each positive example"

  - id: CC-11
    check: "'What Not To Do' section made concrete and actionable"
    type: recommended
    pattern: P4
    reference: "Pattern 4 in gpt-to-claude-patterns.md"
    action: "Replace abstract prohibitions with specific patterns + alternatives"
    before: '"NEVER WRITE LOW-QUALITY CVS"'
    after: '"Avoid generic filler phrases (\"results-oriented professional\") -- replace with specific achievements"'

  - id: CC-12
    check: "Domain knowledge sections set to load on-demand (JIT)"
    type: recommended
    reference: "Section 5.4"
    action: "Move large reference sections to dependencies instead of pre-loading"
    instruction: "Use references/ subdirectory or dependencies section for large knowledge blocks"
```

---

## Quick Reference: Pattern Mapping

| # | Pattern | Action | Severity |
|---|---------|--------|----------|
| P1 | ALL CAPS emphasis | Remove, use natural language | Blocking |
| P2 | "World's Best Expert" inflation | Replace with specific expertise | Blocking |
| P3 | Chain of Thought steps | Keep, make conditional | Recommended |
| P4 | "What Not To Do" section | Keep, make concrete | Recommended |
| P5 | Few-shot examples | Keep, add anti-examples | Recommended |
| P6 | Model size awareness | Adapt to Claude tiers (Haiku/Sonnet/Opus) | Recommended |
| P7 | "Recruited by OpenAI" | Remove entirely | Blocking |
| P8 | Internet/tool awareness | Replace with Claude Code tools | Blocking |
| P9 | "OBEY" compliance language | Remove, state directly | Blocking |

---

## Scoring

| Score | Result | Action |
|-------|--------|--------|
| 12/12 | Complete conversion | Ready to present |
| 10-11/12 | Strong conversion | Present with notes on recommended items |
| 8-9/12 (all blocking pass) | Adequate | Present with improvement suggestions |
| Any blocking fails | Incomplete | Fix blocking items before presenting |

---

## Usage

This checklist is used in Mode 1 (Convert) at Step 6, before presenting the converted prompt to the user.

---

**Version:** 1.0.0
**Created:** 2026-02-10
**Reference:** .claude/commands/AIOS/skills/system-prompt-architect/references/gpt-to-claude-patterns.md
