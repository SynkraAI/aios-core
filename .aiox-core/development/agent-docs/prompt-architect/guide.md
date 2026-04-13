# Prompt Architect Guide (*guide command)

## 🏛 Prompt Architect Guide

### When to Use Me

- Converting a GPT/ChatGPT system prompt to work with Claude Code
- Creating a new system prompt for an AIOS agent, skill, or rule
- Auditing an existing prompt for quality, anti-patterns, or context rot
- Fixing a specific issue with a working prompt (ignoring instructions, wrong tools, etc.)

### The Best Practices Foundation

All my work is grounded in `docs/architecture/master-prompt-best-practices.md` (663 lines, 9 sections). Key references I use:

| Reference | What It Covers |
|-----------|---------------|
| Section 1.1 | Goldilocks Zone -- balance between over and under-specification |
| Section 1.3 | 7-section canonical prompt order |
| Section 2.1 | Motivation-based constraints ("because...") |
| Section 3.1 | Anti-Patterns AP-1 through AP-10 |
| Section 3.2 | Context Rot types (poisoning, distraction, confusion, clash) |
| Section 6.2 | Three requirements for effective personas |
| R1-R9 | Prioritized recommendations for prompt improvement |

### The 4 Modes

**Mode 1 -- Convert (*convert):**
Take a GPT/ChatGPT system prompt and adapt it for Claude Code / AIOS. Uses 9 documented conversion patterns from `references/gpt-to-claude-patterns.md`. Outputs in your chosen format.

**Mode 2 -- Create (*create):**
Build a new system prompt from requirements. Uses elicitation to gather purpose, format, persona strategy, and domain. Validates against a 12-item quality checklist.

**Mode 3 -- Audit (*audit):**
Score an existing prompt against 10 dimensions (1-5 each, max 50). Scans for AP-1 to AP-10 anti-patterns and context rot risks. Generates a structured audit report with prioritized fixes.

**Mode 4 -- Iterate (*iterate):**
Diagnose a specific symptom (ignores instructions, wrong tools, too verbose, etc.), map it to root cause using best practices, and apply a minimal targeted fix with clear diff.

### Output Formats

Every mode can output in 4 formats:

1. **SKILL.md** -- Slash command for Claude Code
2. **Agent YAML** -- Full AIOS agent with persona
3. **Claude rule** -- `.claude/rules/` project-wide behavior file
4. **Raw prompt** -- Clean markdown for API or other tools

### Common Pitfalls

- Using ALL CAPS emphasis instead of natural language with motivation (AP-3)
- Creating exhaustive edge case lists instead of representative examples (AP-2)
- Hardcoding if-else logic instead of giving heuristics and principles (AP-1)
- Skipping examples entirely -- format beats adjectives (AP-4)
- Ignoring platform-specific tool awareness (Section 2.6)
- Not providing motivation for constraints -- "because..." matters (Section 2.1)

### Related Agents

- **@architect (Aria)** - System architecture, prompt modularity decisions
- **@qa (Quinn)** - Output quality validation
- **squad-creator** - Full agent operational infrastructure
