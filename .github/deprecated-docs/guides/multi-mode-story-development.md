# Multi-Mode Story Development Guide

**Version**: 1.0.0
**Last Updated**: 2025-10-31
**Story**: 3.13 - Developer Experience Enhancement

---

## Overview

AIOS now supports **3 development modes** to accommodate different developer preferences, skill levels, and story complexity:

1. **YOLO Mode** - Fast, autonomous development
2. **Interactive Mode** - Balanced, educational development _(default)_
3. **Pre-Flight Planning** - Comprehensive upfront planning

This guide helps you choose the right mode for your work.

---

## Quick Start

### Using the Default Mode (Interactive)

```bash
*develop 3.14
```

This uses **Interactive Mode** - balanced automation with decision checkpoints.

### Choosing a Specific Mode

```bash
*develop 3.14 yolo        # YOLO Mode
*develop 3.14 interactive # Interactive Mode (same as default)
*develop 3.14 preflight   # Pre-Flight Planning Mode
```

### Using Mode-Specific Commands

```bash
*develop-yolo 3.14        # Shortcut for YOLO mode
*develop-interactive 3.14 # Shortcut for Interactive mode
*develop-preflight 3.14   # Shortcut for Pre-Flight Planning mode
```

---

## Mode Comparison

| Feature | YOLO | Interactive | Pre-Flight |
|---------|------|-------------|------------|
| **User Prompts** | 0-1 | 5-10 | All upfront, 0 during execution |
| **Speed** | Fastest | Balanced | Slower upfront, faster execution |
| **Control** | Minimal | Balanced | Maximum |
| **Learning** | None | Educational | Comprehensive planning |
| **Decision Logging** | Automatic | Manual checkpoints | Complete questionnaire |
| **Best For** | Simple stories, experienced devs | Most stories, learning | Complex/ambiguous stories |

---

## YOLO Mode 🚀

### When to Use

✅ **Use YOLO Mode when**:
- You trust the agent's autonomous decisions
- The story is straightforward with clear requirements
- You're experienced with the framework
- Time is critical
- You want a decision log for later review

❌ **Don't use YOLO Mode when**:
- Story has ambiguous requirements
- Critical architectural decisions are involved
- You're learning the framework
- The story affects core systems

### How It Works

1. Agent reads the story
2. Makes all technical decisions autonomously
3. Logs every decision with rationale
4. Implements tasks sequentially
5. Runs tests and validations
6. Presents decision log summary at the end

### Example Workflow

```
🚀 YOLO Mode - Story 3.14: GitHub DevOps Agent

Analyzing story...
✓ Story analysis complete

Autonomous decisions:
├─ Decision 1: Use Octokit library (logged)
├─ Decision 2: REST API over GraphQL (logged)
└─ Decision 3: Async/await pattern (logged)

Executing tasks...
├─ Task 1: ███████████████████ 100% ✓
├─ Task 2: ███████████████████ 100% ✓
└─ Task 3: ███████████████████ 100% ✓

Running tests...
✓ All tests pass (24/24)

📝 Decision log saved: .ai/decision-log-3.14.md
✅ Story ready for review
```

### Decision Log

All autonomous decisions are logged to `.ai/decision-log-{story-id}.md`:

```markdown
## Decision 1: Library Selection for GitHub API

**Context**: Need to interact with GitHub API for PR creation
**Options Considered**:
1. Octokit.js - Official GitHub library
2. @actions/github - GitHub Actions toolkit
3. Raw REST API calls

**Decision**: Octokit.js
**Rationale**: Official library, well-maintained, type-safe
**Impact**: Adds dependency, simplifies API calls
**Timestamp**: 2025-10-31T14:23:45Z
```

---

## Interactive Mode 💬

### When to Use

✅ **Use Interactive Mode when**:
- You want balanced control and speed _(this is the default)_
- You're making technical decisions collaboratively
- You want to learn framework patterns
- The story has some complexity but is mostly clear

❌ **Don't use Interactive Mode when**:
- You need maximum speed (use YOLO)
- Requirements are very ambiguous (use Pre-Flight)
- You want zero interruption (use YOLO)

### How It Works

1. Agent reads the story and confirms understanding
2. At **decision checkpoints**, agent:
   - Explains the decision needed
   - Presents options with trade-offs
   - Asks for your choice
   - Explains why your choice is good
3. Implements tasks with educational explanations
4. Shows test results before marking tasks complete

### Decision Checkpoints

Interactive Mode prompts you at these key moments:

- **Architecture decisions** (e.g., microservices vs. monolith)
- **Library selections** (e.g., Axios vs. Fetch)
- **Algorithm choices** (e.g., BFS vs. DFS)
- **Testing approaches** (e.g., unit vs. integration tests)
- **Error handling strategies**
- **Performance optimizations**

### Example Workflow

```
💬 Interactive Mode - Story 3.15: Expansion Pack Auto Configuration

📋 Story Summary:
   - 4 tasks
   - 8 acceptance criteria
   - Estimated: 6 hours

Ready to proceed? [y/n]: y

───────────────────────────────────────
Task 1: Design configuration schema
───────────────────────────────────────

❓ Decision Checkpoint - Configuration Format

We need to choose a format for the expansion pack configuration.

Option 1: YAML
  ✓ Human-readable
  ✓ Widely used in the ecosystem
  ✓ Supports comments
  ✗ Parsing can be error-prone

Option 2: JSON
  ✓ Strict typing
  ✓ Better IDE support
  ✓ Native JavaScript parsing
  ✗ No comments allowed

Option 3: TOML
  ✓ Simple and clear
  ✓ Good for config files
  ✗ Less common in JavaScript ecosystem

Your choice? [1/2/3]: 1

✓ Great choice! YAML is perfect for configuration files.

💡 Why this works:
   - AIOS already uses YAML for core-config
   - Users are familiar with the format
   - Comments will help document expansion packs

Implementing configuration schema...
```

### Educational Explanations

Throughout development, Interactive Mode explains:

**Before decisions**: What you need to decide and why
**After decisions**: Why your choice is good for this context
**During implementation**: What the agent is doing and why

This helps you learn framework patterns and best practices.

---

## Pre-Flight Planning Mode ✈️

### When to Use

✅ **Use Pre-Flight Planning Mode when**:
- Story has ambiguous or unclear requirements
- Multiple architectural decisions are needed
- You need team consensus before development
- Story affects critical systems
- You want zero surprises during execution

❌ **Don't use Pre-Flight Planning Mode when**:
- Story is straightforward and clear
- You need speed over thoroughness
- You're okay with autonomous decisions

### How It Works

1. **Analysis Phase**: Agent identifies all ambiguities
2. **Questionnaire Phase**: Agent generates comprehensive questions
3. **Planning Phase**: You answer all questions upfront
4. **Execution Phase**: Agent implements with full context (zero additional decisions)

### Example Workflow

```
✈️ Pre-Flight Planning Mode - Story 3.16: Data Architecture Capability

🔍 Story Analysis Phase...

Found 8 ambiguities requiring decisions:
├─ Database technology choice
├─ ORM vs raw SQL
├─ Migration strategy
├─ Backup approach
├─ Testing database setup
├─ Schema validation approach
├─ Error handling strategy
└─ Performance optimization strategy

───────────────────────────────────────
📝 Pre-Flight Questionnaire
───────────────────────────────────────

Please answer all questions before development begins.

Q1: Database Technology
   a) PostgreSQL (recommended for relational data)
   b) MySQL (alternative relational)
   c) MongoDB (NoSQL alternative)

   Your choice: _____

Q2: Database Client
   a) Prisma ORM (type-safe, modern)
   b) TypeORM (feature-rich, complex)
   c) Raw SQL with pg library (maximum control)

   Your choice: _____

[... 6 more questions ...]

───────────────────────────────────────

✓ Questionnaire complete
✓ Creating execution plan...

📋 Execution Plan:
   Technology Stack:
   ├─ PostgreSQL database
   ├─ Prisma ORM
   ├─ Sequential migrations
   ├─ Daily snapshot backups
   └─ Docker PostgreSQL for testing

   Task Sequence:
   ├─ Task 1: Set up PostgreSQL with Prisma
   ├─ Task 2: Create migration system
   ├─ Task 3: Implement backup automation
   └─ Task 4: Configure testing database

   Estimated time: 8 hours

Approve plan? [y/n]: y

🚀 Executing plan with zero ambiguity...

[No additional decision prompts during execution]
```

### Benefits

- **Zero mid-development surprises** - All decisions made upfront
- **Team consensus** - Share questionnaire with team before execution
- **Thorough planning** - Forces thinking through all implications
- **Faster execution** - Once approved, execution is uninterrupted
- **Complete documentation** - Questionnaire + plan serve as decision record

---

## Choosing the Right Mode

### Decision Tree

```
Start here
    │
    ├─ Is the story straightforward and clear?
    │   │
    │   ├─ YES → Are you experienced with AIOS?
    │   │   │
    │   │   ├─ YES → Use YOLO Mode 🚀
    │   │   └─ NO → Use Interactive Mode 💬
    │   │
    │   └─ NO → Are requirements very ambiguous?
    │       │
    │       ├─ YES → Use Pre-Flight Planning ✈️
    │       └─ NO → Use Interactive Mode 💬
    │
    └─ When in doubt → Use Interactive Mode 💬 (default)
```

### By Story Type

| Story Type | Recommended Mode | Why |
|-----------|------------------|-----|
| Bug fix (simple) | YOLO | Clear problem, clear solution |
| Bug fix (complex) | Interactive | May need debugging decisions |
| New feature (small) | YOLO or Interactive | Depends on clarity |
| New feature (large) | Pre-Flight | Many architectural decisions |
| Refactoring | Interactive | Need careful decision-making |
| Documentation | YOLO | Straightforward, low risk |
| Infrastructure | Pre-Flight | Critical decisions, team consensus |
| Experiment/Spike | YOLO | Fast iteration |

### By Developer Experience

| Experience Level | Primary Mode | Secondary Mode |
|-----------------|--------------|----------------|
| Junior | Interactive | Pre-Flight for complex stories |
| Mid-level | Interactive | YOLO for simple, Pre-Flight for complex |
| Senior | YOLO | Interactive when collaborating |
| Expert | YOLO | Pre-Flight only for critical systems |

---

## Tips and Best Practices

### General Tips

1. **Start with Interactive** - When in doubt, use the default
2. **Review Decision Logs** - Even in YOLO mode, review the decision log after completion
3. **Mix Modes** - Use different modes for different stories based on complexity
4. **Learn Patterns** - Use Interactive mode when learning new framework areas
5. **Team Alignment** - Use Pre-Flight mode when multiple stakeholders need input

### YOLO Mode Tips

- Review the decision log immediately after completion
- Use for stories you've done similar work on before
- Trust but verify - check the autonomous decisions align with your preferences
- Great for batch processing multiple simple stories

### Interactive Mode Tips

- Don't rush through decision checkpoints - they're educational
- Ask "why" questions during explanations
- Use this mode when pair programming with the agent
- Great for onboarding to new parts of the codebase

### Pre-Flight Mode Tips

- Involve the team in answering the questionnaire
- Save the questionnaire + plan for future reference
- Use for stories that will set architectural precedents
- Great for getting stakeholder buy-in before development

---

## Backward Compatibility

### Existing Commands Still Work

```bash
*develop 3.14          # Still works - uses Interactive mode (default)
```

All existing commands are preserved. The mode system is purely additive.

### Migration Path

No migration needed! Your existing workflows continue to work exactly as before.

---

## Troubleshooting

### "Invalid mode" Warning

```
⚠️ Invalid mode 'yol'. Defaulting to 'interactive'.
Valid modes: yolo, interactive, preflight
```

**Solution**: Check spelling. Valid modes are `yolo`, `interactive`, `preflight` (all lowercase).

### Development Cancelled

If you cancel during mode selection, development stops gracefully:

```
Development cancelled by user.
Story progress saved. You can resume with *develop {story-id}.
```

**Solution**: Resume with `*develop {story-id}` when ready.

### Missing Story File

```
Error: Story file not found at docs/stories/3.99.yaml
Please verify story ID and try again.
```

**Solution**: Verify the story ID exists in `docs/stories/`.

---

## Advanced Usage

### Decision Log Analysis

After YOLO mode, analyze the decision log:

```bash
cat .ai/decision-log-3.14.md
```

Look for patterns in autonomous decisions to understand the agent's reasoning.

### Custom Mode Selection in Scripts

If automating story development:

```bash
# Batch process simple stories in YOLO mode
for story in 3.14 3.15 3.16; do
  *develop-yolo $story
done
```

### Combining Modes

While you can't mix modes within a single story, you can:

1. Use Pre-Flight to generate a plan
2. Cancel before execution
3. Resume with YOLO or Interactive using the plan as reference

---

## Feedback

We're constantly improving the multi-mode system. Share your experience:

- Which mode do you use most? Why?
- What decision checkpoints are most valuable?
- What questions would improve Pre-Flight mode?

**Feedback channel**: Story comments in ClickUp or direct to Product Owner

---

## Related Documentation

- `.aios-core/tasks/develop-story.md` - Technical specification
- `.aios-core/data/mode-selection-best-practices.md` - Quick reference
- `docs/architecture/` - Framework architecture docs

---

**Last Updated**: 2025-10-31
**Story**: 3.13 - Developer Experience Enhancement
**Maintained By**: AIOS Core Team
