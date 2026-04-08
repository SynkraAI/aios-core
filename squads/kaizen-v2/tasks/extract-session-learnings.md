---
task:
  name: extract-session-learnings
  status: SPEC_DEFINED
  version: 1.0.0
  responsible_executor: memory-keeper
  execution_type: MANUAL (*learn) | POST-REFLECT
  trigger:
    manual: "*learn command"
    automated: "Optional post-step after *reflect completes"
---

# extract-session-learnings

## Task Anatomy

### Input
- Current session conversation context
- Existing system artifacts (rules, memory, skills, agents, docs, workflows)
- `data/intelligence/daily/` recent files for cross-reference

### Output
- Session learning report saved to `data/learnings/YYYY-MM-DD-session.md`
- Report contains proposed improvements for user review before application
- Improvements only applied after explicit user approval (Phase 5 of skill)

### Acceptance Criteria
- [ ] Session analyzed across all 6 phases of the learning-extractor skill
- [ ] Quality gates passed (relevance, actionability, non-duplication)
- [ ] Report generated with proposed improvements and rationale
- [ ] User prompted to review and approve before any artifacts are modified
- [ ] Cross-referenced with existing patterns.yaml to avoid duplication

### Dependencies
- Skill `skills/learning-extractor/SKILL.md` accessible
- Session has enough context to extract learnings (non-trivial session)

### Quality Gates
- Each learning must pass: relevant + actionable + non-duplicate
- Batch validation before batch application
- Changes are reversible (can be undone via git)

---

## Detailed Specification

### Relationship to Daily Capture

| Aspect | capture-daily | extract-session-learnings |
|--------|---------------|--------------------------|
| **Focus** | What happened (facts, decisions, activity) | What to improve (rules, memory, skills) |
| **Output** | daily/YYYY-MM-DD.yaml (data) | Report with proposed changes (applied after user approval) |
| **Trigger** | Stop hook (automatic) | Manual (*learn) or post-reflect |
| **Depth** | Surface-level log | Deep analysis across 6 phases |

They are **complementary**: daily capture logs signals, learning extraction acts on them.

### Integration with Reflect Pipeline

When run as post-step after `*reflect`:
1. Reflect completes (patterns extracted, decay recalculated)
2. Learning extractor runs using reflect output + session context
3. Review report generated with proposed improvements
4. Changes are only applied later if the user explicitly approves

### Execution

Invoke the learning-extractor skill:
```
/learning-extractor
```

Output directory: `squads/kaizen-v2/data/learnings/`

## Veto Conditions
- "Trivial session (only reads/lints) → SKIP extraction (nothing to learn)"
- "Learning duplicates existing pattern in patterns.yaml → REINFORCE pattern instead of creating new rule"
- "Proposed change to L1/L2 protected files → BLOCK (requires manual review)"

## Success Criteria
- PASS: At least 1 actionable improvement proposed in review report
- SKIP: Session too trivial for meaningful extraction
- FAIL: Extraction ran but produced no actionable items despite non-trivial session
