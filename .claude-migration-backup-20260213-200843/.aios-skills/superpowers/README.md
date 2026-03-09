# Superpowers Skills - AIOS Integration

**Source:** https://github.com/obra/superpowers
**Installed:** 2026-02-05
**Version:** Latest (main branch)

---

## Installed Skills

### 🔥 High Priority (Phase 1 - Installed 2026-02-05)

#### 1. test-driven-development
**Name:** `test-driven-development`
**Path:** `.aios/skills/superpowers/test-driven-development/`
**Description:** Use when implementing any feature or bugfix, before writing implementation code

**Core Principle:** Write the test first. Watch it fail. Write minimal code to pass.

**Iron Law:** NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST

**When to Use:**
- New features
- Bug fixes
- Refactoring
- Behavior changes

**Files:**
- `SKILL.md` - Main skill definition with RED-GREEN-REFACTOR cycle
- `testing-anti-patterns.md` - Common anti-patterns to avoid

**Integration with AIOS:**
- Complements `@qa` agent (Quinn)
- Enforces quality gates
- Aligns with Constitution Article V (Quality First)

---

#### 2. verification-before-completion
**Name:** `verification-before-completion`
**Path:** `.aios/skills/superpowers/verification-before-completion/`
**Description:** Use when about to claim work is complete, before committing or creating PRs

**Core Principle:** Evidence before claims, always.

**Iron Law:** NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE

**The Gate Function:**
1. IDENTIFY: What command proves this claim?
2. RUN: Execute the FULL command (fresh, complete)
3. READ: Full output, check exit code, count failures
4. VERIFY: Does output confirm the claim?
5. ONLY THEN: Make the claim

**Files:**
- `SKILL.md` - Verification checklist and gate function

**Integration with AIOS:**
- Enforces `TaskUpdate` accuracy
- Prevents false completion claims
- Aligns with story-driven development workflow

---

#### 3. requesting-code-review
**Name:** `requesting-code-review`
**Path:** `.aios/skills/superpowers/requesting-code-review/`
**Description:** Use when completing tasks or before merging to verify work meets requirements

**Core Principle:** Review early, review often.

**When to Request Review:**
- After each task (mandatory in subagent-driven dev)
- After completing major feature
- Before merge to main
- When stuck (optional but valuable)

**Files:**
- `SKILL.md` - Review request workflow
- `code-reviewer.md` - Subagent template for code review

**Integration with AIOS:**
- Complements `@qa` agent workflows
- Integrates with CodeRabbit (already used by @qa)
- Pre-merge quality gate

---

#### 4. receiving-code-review
**Name:** `receiving-code-review`
**Path:** `.aios/skills/superpowers/receiving-code-review/`
**Description:** Use when receiving code review feedback, before implementing suggestions

**Core Principle:** Verify before implementing. Technical correctness over social comfort.

**Response Pattern:**
1. READ: Complete feedback without reacting
2. UNDERSTAND: Restate requirement in own words (or ask)
3. VERIFY: Check against codebase reality
4. EVALUATE: Technically sound for THIS codebase?
5. RESPOND: Technical acknowledgment or reasoned pushback
6. IMPLEMENT: One item at a time, test each

**Forbidden Responses:**
- "You're absolutely right!" (explicit CLAUDE.md violation)
- "Great point!" / "Excellent feedback!" (performative)
- "Let me implement that now" (before verification)

**Files:**
- `SKILL.md` - Review reception protocol

**Integration with AIOS:**
- Aligns with Professional Objectivity principle in CLAUDE.md
- Enforces technical rigor
- Complements `requesting-code-review` skill

---

### 🟡 Medium Priority (Phase 2 - Installed 2026-02-05)

#### 5. brainstorming
**Name:** `brainstorming`
**Path:** `.aios/skills/superpowers/brainstorming/`
**Description:** Explores user intent, requirements and design before implementation via Socratic dialogue

**Core Principle:** One question at a time. Multiple choice preferred. YAGNI ruthlessly.

**When to Use:**
- Before any creative work
- Creating features
- Building components
- Adding functionality
- Modifying behavior

**The Process:**
1. Understanding the idea (one question at a time)
2. Exploring approaches (2-3 options with trade-offs)
3. Presenting the design (200-300 word sections with validation)
4. Documentation (save to `docs/plans/YYYY-MM-DD-<topic>-design.md`)
5. Implementation setup (use `writing-plans` skill next)

**Files:**
- `SKILL.md` - Brainstorming workflow and principles

**Integration with AIOS:**
- Complements @architect (Aria) and @pm (Morgan)
- Aligns with elicitation system
- Feeds into story creation via @po (Pax)

---

#### 6. writing-plans
**Name:** `writing-plans`
**Path:** `.aios/skills/superpowers/writing-plans/`
**Description:** Create comprehensive implementation plans with bite-sized tasks (2-5 min each)

**Core Principle:** Document everything. Bite-sized tasks. DRY. YAGNI. TDD. Frequent commits.

**Task Granularity (Each step = one action):**
- "Write the failing test" - step
- "Run it to make sure it fails" - step
- "Implement minimal code to pass" - step
- "Run tests and verify pass" - step
- "Commit" - step

**Plan Structure:**
- Header with goal, architecture, tech stack
- Tasks with exact file paths
- Step-by-step instructions
- Test and verification commands
- Commit points

**Save plans to:** `docs/plans/YYYY-MM-DD-<feature-name>.md`

**Files:**
- `SKILL.md` - Plan writing guidelines and templates

**Integration with AIOS:**
- Complements TaskCreate (but more granular)
- Works with @architect and @dev
- Feeds into `executing-plans` skill
- Aligns with Story-Driven Development

---

#### 7. executing-plans
**Name:** `executing-plans`
**Path:** `.aios/skills/superpowers/executing-plans/`
**Description:** Execute implementation plans in batches with review checkpoints

**Core Principle:** Batch execution with checkpoints for architect review.

**The Process:**
1. Load and Review Plan (identify concerns)
2. Execute Batch (default: first 3 tasks)
3. Report (show implementation and verification)
4. Continue (based on feedback)
5. Complete (use `finishing-a-development-branch` skill)

**When to Stop:**
- Hit blocker mid-batch
- Plan has critical gaps
- Instruction unclear
- Verification fails repeatedly

**Files:**
- `SKILL.md` - Execution workflow

**Integration with AIOS:**
- Uses Task tool for tracking
- Batch approach complements story workflow
- Checkpoint pattern aligns with human-in-the-loop
- Integrates with @dev and @qa

---

#### 8. finishing-a-development-branch
**Name:** `finishing-a-development-branch`
**Path:** `.aios/skills/superpowers/finishing-a-development-branch/`
**Description:** Complete development work with merge/PR/cleanup options

**Core Principle:** Verify tests → Present options → Execute choice → Clean up.

**The Process:**
1. Verify Tests (must pass before options)
2. Determine Base Branch
3. Present Options:
   - Merge back to base locally
   - Push and create PR
   - Keep as-is
   - Discard work
4. Execute Choice
5. Clean Up

**Files:**
- `SKILL.md` - Completion workflow

**Integration with AIOS:**
- Complements @devops (Gage) authority for push/PR
- Enforces verification-before-completion
- Aligns with git workflow standards
- Quality gate before merge

---

## How to Use These Skills

### Activation

Skills from this collection should be invoked contextually by Claude Code when relevant to the task:

- **TDD:** Automatically active when implementing features/fixes
- **Verification:** Active before claiming completion
- **Requesting Review:** Manually triggered before merge/after major work
- **Receiving Review:** Automatically active when processing feedback

### Manual Activation (if needed)

```bash
# Reference specific skill in conversation
"Using test-driven-development skill..."
"Following verification-before-completion protocol..."
```

---

## Integration Points with AIOS

| Skill | AIOS Component | Integration |
|-------|----------------|-------------|
| test-driven-development | @qa, Quality Gates | Enforces RED-GREEN-REFACTOR |
| verification-before-completion | TaskUpdate, Story workflow | Prevents false completion |
| requesting-code-review | @qa, @devops | Pre-merge quality gate |
| receiving-code-review | All agents | Technical rigor in feedback |

---

## Philosophy Alignment

These skills align with AIOS Constitution principles:

| Skill | Constitution Article | Alignment |
|-------|---------------------|-----------|
| test-driven-development | Article V (Quality First) | MUST enforce quality |
| verification-before-completion | Article IV (No Invention) | Evidence-based claims |
| requesting-code-review | Article V (Quality First) | Systematic review |
| receiving-code-review | Professional Objectivity | Technical over emotional |

---

## Next Skills to Install (Roadmap)

### 🟢 Low Priority (Phase 3 - Pending)
- `using-git-worktrees` - Parallel development branches

---

## References

- **Source Repository:** https://github.com/obra/superpowers
- **Installation Report:** `/docs/analysis/skills-installation-report.md`
- **AIOS Constitution:** `.aios-core/constitution.md`
- **Professional Objectivity:** `.claude/CLAUDE.md`

---

**Installed by:** AIOS Core Team
**Phase 1 Installation:** 2026-02-05 (4 skills)
**Phase 2 Installation:** 2026-02-05 (4 skills)
**Total Installed:** 8 skills
**Status:** ✅ Active and Ready
