# Iterate Prompt (Diagnose and Fix Symptoms)

```yaml
task:
  id: iterate-prompt
  agent: prompt-architect
  mode: 4
  elicit: true
  description: "Diagnose a specific symptom in a working prompt and apply a minimal targeted fix"
  references:
    primary: docs/architecture/master-prompt-best-practices.md
  veto_conditions:
    - "No prompt provided -- nothing to iterate on"
    - "No symptom described -- cannot diagnose without knowing the problem"
    - "Symptom requires full rewrite -- redirect to *create instead"
```

---

## Prerequisites

- User provides an existing system prompt (as file path or pasted content)
- User describes the symptom or problem they are experiencing
- Read `docs/architecture/master-prompt-best-practices.md` (relevant sections based on symptom)

---

## Pipeline (4 Steps)

### Step 1: Understand the Symptom

Present numbered options to help the user articulate the problem:

```
What's happening that you want to change?

1. Agent ignores certain instructions
2. Output format is inconsistent
3. Agent is too verbose / too terse
4. Agent hallucinates or guesses instead of asking
5. Agent doesn't use the right tools
6. Tone/persona drifts over long conversations
7. Agent over-engineers or adds unsolicited features
8. Other (describe)
```

If the user selects "8. Other", ask them to describe the specific behavior they observe and what they expect instead.

Record both the symptom and the specific instructions/sections being affected.

### Step 2: Diagnose Using Best Practices

Map the symptom to its root cause and the best practices section that addresses it:

| Symptom | Root Cause | Fix Strategy | Reference |
|---------|-----------|-------------|-----------|
| **Ignores instructions** | Buried in long prompt, competing priorities | Move critical instruction to top AND bottom of prompt; add motivation | Section 5.1, Section 2.1 |
| **Format inconsistent** | No concrete example/schema | Add 1-3 concrete examples of expected output | Section 1.3 item 7, AP-4 |
| **Too verbose** | No length/format constraint | Add explicit format instruction with example of desired length | Section 1.3 item 6 |
| **Too terse** | Over-constrained or minimal context | Relax constraints, add detail expectations | Section 1.1 (Goldilocks) |
| **Hallucinates** | No uncertainty protocol | Add "if unsure, say so and ask a clarifying question" | Section 4.3 |
| **Wrong tools** | Ambiguous or overlapping tool descriptions | Clarify with routing table: task -> use this -> not this | Section 2.6, AP-5 |
| **Persona drift** | No anchor constraints for long sessions | Add persistent constraints block at top + bottom; add NOTES.md pattern | Section 5.5, AP-10 |
| **Over-triggers** | Aggressive CAPS/emphasis language | Soften to natural language with motivation | Section 1.4, AP-3 |
| **Over-engineers** | No scope constraint | Add anti-overengineering block (Section 3.3) | Section 3.3 |
| **Adds unsolicited features** | No explicit scope boundary | Add "do not add features not explicitly requested" with motivation | Section 3.3 |

Present the diagnosis to the user:

```markdown
## Diagnosis

**Symptom:** {user's description}
**Root cause:** {identified cause}
**Reference:** {best practices section}
**Fix strategy:** {what will change}
```

Ask user to confirm the diagnosis before applying the fix.

### Step 3: Apply Minimal Targeted Fix

Change ONLY what addresses the root cause. Show the diff clearly:

```markdown
## Changes Applied

### Change 1: {description}
**Reference:** Section {X.Y}

**Before:**
{exact text being replaced}

**After:**
{new text}

**Why:** {motivation from best practices}
```

Principles for this step:
- Minimal changes only -- do not refactor unrelated sections
- Every change must cite a best practices reference
- Show before/after for every modification
- If multiple changes are needed, present them individually and let the user approve each one

### Step 4: Suggest Validation

After applying fixes, recommend a validation plan:

```
## Validation Plan

Test the updated prompt with:

1. A representative input (the typical use case)
   - Input: {suggest based on prompt's purpose}
   - Expected: {describe expected behavior after fix}

2. The exact scenario that triggered the symptom
   - Input: {the scenario that was failing}
   - Expected: {the corrected behavior}

3. An edge case
   - Input: {suggest an edge case}
   - Expected: {describe expected handling}

If any test shows regression, rollback the change and try an alternative fix.
```

After validation, offer:

```
Next steps:
1. Save the updated prompt (follow save protocol)
2. Apply additional fixes
3. Run a full audit (*audit) to check overall quality
4. Done -- no further changes
```

---

## Memory Integration

When completing an iteration, record in `.claude/agent-memory/prompt-architect/MEMORY.md`:
- The prompt name/path
- The symptom reported
- The root cause identified
- The fix applied
- The best practices reference used

This allows future iterations on the same prompt to build on previous diagnoses.

---

## Expected Output

A minimal, targeted set of changes to an existing prompt, each with clear before/after diff, root cause diagnosis, and best practices reference. Accompanied by a validation plan.
