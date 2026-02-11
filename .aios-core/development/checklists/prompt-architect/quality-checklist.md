# Prompt Quality Checklist

```yaml
checklist:
  id: prompt-quality
  version: 1.0.0
  created: 2026-02-10
  agent: prompt-architect
  purpose: "Validate system prompts meet quality standards before presenting to user"
  mode: blocking  # Score below 8/12 prevents presentation
  reference: docs/architecture/master-prompt-best-practices.md
```

---

## Quality Checks (12 items)

Derived from Sections 1-6 of the master best practices document. Each item references the specific section that defines the requirement.

```yaml
checks:
  - id: QC-01
    check: "Goal stated in first 3 lines"
    type: blocking
    reference: "Section 1.3 item 1 (Identity and Role)"
    what_to_verify: |
      The prompt's opening lines clearly state what this agent/skill does
      and what domain it operates in. A reader should understand the purpose
      within the first 3 lines without scrolling.
    pass_criteria: "Purpose is unambiguous within first 3 lines"
    fail_example: "A long preamble about AI history before stating the role"

  - id: QC-02
    check: "Role specific and domain-aligned, not generic"
    type: blocking
    reference: "Section 6.2, AP-9"
    what_to_verify: |
      The role description is specific to the domain (e.g., "Python backend
      specialist with FastAPI expertise") not generic (e.g., "helpful assistant").
      Generic personas have neutral or negative impact (Section 6.1).
    pass_criteria: "Domain, specialization, or expertise area is named"
    fail_example: '"You are a helpful and knowledgeable assistant"'

  - id: QC-03
    check: "Constraints as bullets with motivation"
    type: blocking
    reference: "Section 2.1"
    what_to_verify: |
      Key constraints are formatted as bullet points, each with a "because..."
      or equivalent explanation. The model generalizes better from motivated
      constraints than from bare rules.
    pass_criteria: "At least 50% of constraints include motivation"
    fail_example: '"Never use markdown" (no reason given)'

  - id: QC-04
    check: "Output format specified with schema or example"
    type: blocking
    reference: "Section 1.3 item 6"
    what_to_verify: |
      The expected output structure is defined through a schema, template,
      or concrete example. The model needs to know what shape the response
      should take.
    pass_criteria: "Output format section exists with concrete structure"
    fail_example: '"Respond clearly and helpfully" (no format specified)'

  - id: QC-05
    check: "At least 1 example included"
    type: blocking
    reference: "Section 1.3 item 7, AP-4"
    what_to_verify: |
      The prompt includes at least one concrete input/output example.
      Format beats adjectives -- showing is more effective than telling.
      Ideally includes an anti-example (what NOT to produce) alongside
      the positive example.
    pass_criteria: "At least 1 concrete example with input and output"
    fail_example: "Prompt with no examples section at all"

  - id: QC-06
    check: "Uncertainty protocol present"
    type: blocking
    reference: "Section 4.3"
    what_to_verify: |
      The prompt includes instruction for what to do when the model is
      unsure or lacks information. This prevents hallucination and encourages
      clarifying questions.
    pass_criteria: "Contains instruction like 'if unsure, ask' or 'when uncertain, say so'"
    fail_example: "No mention of uncertainty handling"

  - id: QC-07
    check: "Sections visually separated with headers"
    type: recommended
    reference: "Section 1.4"
    what_to_verify: |
      The prompt uses markdown headers, XML tags, YAML blocks, or other
      clear delimiters to separate logical sections. Visual separation
      improves model parsing.
    pass_criteria: "At least 3 distinct sections with visual separation"
    fail_example: "Wall of text with no headers or delimiters"

  - id: QC-08
    check: "No ALL CAPS aggressive language"
    type: blocking
    reference: "Section 1.4, AP-3"
    what_to_verify: |
      No use of ALL CAPS for emphasis in instruction text. Claude 4.6 is
      more responsive to the system prompt than previous versions --
      aggressive emphasis causes over-triggering. Section headings in
      caps are acceptable; emphasis in body text is not.
    pass_criteria: "No ALL CAPS emphasis words in body text"
    fail_example: '"CRITICAL: You MUST ALWAYS do X"'

  - id: QC-09
    check: "Numbered options for user interaction points"
    type: recommended
    reference: "Section 2.5"
    what_to_verify: |
      When the prompt defines interaction points (choices, selections,
      modes), they use numbered options format. This reduces ambiguity,
      creates explicit decision checkpoints, and facilitates logging.
    pass_criteria: "Interaction points use numbered format (1, 2, 3)"
    fail_example: '"Ask the user what they prefer" (open-ended)'

  - id: QC-10
    check: "No GPT-specific references"
    type: blocking
    reference: "references/gpt-to-claude-patterns.md"
    what_to_verify: |
      No references to GPT-specific features: Custom Instructions, DALL-E,
      Code Interpreter, ChatGPT browsing, "You are ChatGPT", "Recruited
      by OpenAI", JSON mode as a GPT feature, or GPT Actions/plugins.
    pass_criteria: "Zero GPT-specific references"
    fail_example: '"Use Code Interpreter to run the script"'

  - id: QC-11
    check: "Claude Code tool awareness"
    type: blocking
    reference: "Section 2.6"
    what_to_verify: |
      If the prompt references file operations, searches, or commands,
      it uses Claude Code native tools: Read, Write, Edit, Glob, Grep,
      Bash, WebSearch, WebFetch. Not shell equivalents like cat, find, grep.
    pass_criteria: "Tool references match Claude Code native tools"
    fail_example: '"cat the file to read it" or "use grep to search"'

  - id: QC-12
    check: "Prompt length within bounds"
    type: recommended
    reference: "Section 5.2"
    what_to_verify: |
      SKILL.md: under 500 lines
      Agent YAML core: under 200 lines (excluding documentation sections)
      Claude rule: under 100 lines
      Exceeding these limits suggests the prompt needs modularization.
    pass_criteria: "Within recommended line limits for format type"
    fail_example: "800-line SKILL.md with everything pre-loaded"
```

---

## Scoring

| Score | Result | Action |
|-------|--------|--------|
| 12/12 | Exemplary | Present to user with confidence |
| 10-11/12 | Strong | Present with notes on recommended items |
| 8-9/12 | Adequate | Present with improvement suggestions |
| 6-7/12 | Weak | Iterate internally before presenting |
| Below 6/12 | Failing | Major revision needed before presenting |

**Blocking threshold:** 8/12 minimum to present to user (all blocking items must pass).

---

## Usage

This checklist is used in two contexts:

1. **Mode 2 (Create):** Validate new prompts before presenting (Step 3)
2. **Mode 3 (Audit):** As part of the dimension scoring framework

---

**Version:** 1.0.0
**Created:** 2026-02-10
**Reference:** docs/architecture/master-prompt-best-practices.md
