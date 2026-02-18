# Convert Prompt (GPT to AIOS/Claude Code)

```yaml
task:
  id: convert-prompt
  agent: prompt-architect
  mode: 1
  elicit: true
  description: "Convert a GPT/ChatGPT system prompt to AIOS/Claude Code format"
  references:
    primary: docs/architecture/master-prompt-best-practices.md
    patterns: .claude/commands/AIOS/skills/system-prompt-architect/references/gpt-to-claude-patterns.md
    template: .aios-core/product/templates/personalized-agent-template.md
  veto_conditions:
    - "No source prompt provided -- cannot convert nothing"
    - "Source prompt is already in Claude Code format -- redirect to *audit or *iterate"
```

---

## Prerequisites

- User provides a GPT/ChatGPT system prompt (as file path or pasted content)
- Read `docs/architecture/master-prompt-best-practices.md` (Sections 1.3, 1.4, 2.1-2.6, 3.1)
- Read `.claude/commands/AIOS/skills/system-prompt-architect/references/gpt-to-claude-patterns.md` (9 patterns)

---

## Pipeline (6 Steps)

### Step 1: Analyze the Source Prompt

Read the provided content. Classify each part into these dimensions:

| Dimension | What to identify |
|-----------|-----------------|
| **Role** | Persona/expertise defined |
| **Instructions** | Core behavioral rules |
| **Constraints** | Prohibitions and limits |
| **Output format** | Expected response structure |
| **Tools/Actions** | Tool usage or action patterns |
| **Examples** | Few-shot demonstrations |
| **GPT-isms** | Patterns that only work in GPT (Custom Instructions, DALL-E, Code Interpreter, memory, browsing) |

Present the analysis as a table to the user before proceeding.

### Step 2: Map GPT Patterns to Claude Code Equivalents

Read `references/gpt-to-claude-patterns.md` for the 9 documented patterns. Apply these mappings:

| GPT Pattern | Claude Code / AIOS Equivalent | Pattern # |
|-------------|-------------------------------|-----------|
| Custom Instructions | SKILL.md sections or agent YAML `persona` + `commands` | - |
| GPT Actions / plugins | MCP tools or Bash tool calls | - |
| DALL-E references | Remove (or describe desired visual output) | - |
| "Browse the web" | WebSearch / WebFetch tools | P8 |
| "Use Code Interpreter" | Bash tool | P8 |
| `#` Knowledge files | `references/` subdirectory in skill folder | - |
| Memory / context | `.claude/agent-memory/` or NOTES.md pattern (Section 5.5) | - |
| "You are ChatGPT" / "Recruited by OpenAI" | Remove -- Claude has its own identity | P7 |
| JSON mode | Explicit output format instructions | - |
| ALL CAPS emphasis | Natural language with motivation (Section 2.1, AP-3) | P1 |
| "OBEY" / compliance language | State the instruction directly (AP-3) | P9 |
| Fake credentials/awards | Domain-specific expertise description (Section 6.2) | P2 |
| CoT step-by-step | Keep but make conditional -- "when complex" (Section 1.1) | P3 |
| "What Not To Do" section | Concrete actionable anti-examples | P4 |

Log each pattern found with its code (P1-P9) for the conversion summary.

### Step 3: Restructure Using the 7-Section Order

Reorganize into the canonical structure from Section 1.3:

```
1. IDENTIDADE E PAPEL
2. CONTEXTO AMBIENTAL
3. INSTRUCOES CORE
4. FERRAMENTAS E CAPACIDADES
5. GUARDRAILS
6. FORMATO DE SAIDA
7. EXEMPLOS
```

Not all sections are required -- use what the prompt needs. This is the order when present.
Reference: Section 1.3 (order), Section 1.4 (delimiters and formatting).

### Step 4: Apply AIOS Adaptations

For each adaptation, cite the best practices section that justifies it:

| Adaptation | Reference | Example Transformation |
|------------|-----------|----------------------|
| Remove aggressive language | Section 1.4, AP-3 | `CRITICAL: You MUST...` -> `Validate input before processing -- unvalidated input can cause data corruption.` |
| Add motivation to constraints | Section 2.1 | `Never use reticencias` -> `Never use reticencias because your output will be read by a TTS engine.` |
| Add numbered options | Section 2.5 | `Ask the user what they prefer` -> `Present options as numbered list (1, 2, 3)` |
| Add uncertainty protocol | Section 4.3 | _(missing)_ -> `If unsure, say so and ask a clarifying question.` |
| Ensure tool awareness | Section 2.6 | `cat file.txt` -> `Read tool` / `find .` -> `Glob tool` |
| Positive over negative | Section 2.2 | `Don't use markdown` -> `Respond in plain prose paragraphs.` |

### Step 5: Choose Output Format

Present to user as numbered options:

```
What output format do you want?

1. SKILL.md -- Slash command (reusable capability)
2. Agent YAML -- Full AIOS agent with persona
3. Claude rule -- .claude/rules/ file (project-wide behavior)
4. Raw system prompt -- Clean markdown (API or other tools)
```

If Agent YAML is selected, use the template at `.aios-core/product/templates/personalized-agent-template.md`.

### Step 6: Present Result with Conversion Summary

Show the full converted prompt, then a summary table:

```markdown
## Conversion Summary

### Removed (GPT-specific)
| Item | Pattern Code | Reason |
|------|-------------|--------|
| {item} | P{n} | {reason from patterns doc} |

### Adapted (Structural)
| Item | Best Practices Reference | Before -> After |
|------|------------------------|----------------|
| {item} | Section {x.y} | {before} -> {after} |

### Added (AIOS patterns)
| Item | Best Practices Reference |
|------|------------------------|
| Numbered options | Section 2.5 |
| Uncertainty protocol | Section 4.3 |
| Tool awareness | Section 2.6 |
```

After presenting, follow the save protocol (see agent definition `save_protocol`).

---

## Validation

Run the conversion checklist (`.aios-core/development/checklists/prompt-architect/conversion-checklist.md`) against the output before presenting to the user.

---

## Expected Output

A complete system prompt in the chosen format (SKILL.md, Agent YAML, Claude rule, or raw), accompanied by a conversion summary documenting every change made with references to the best practices document.
