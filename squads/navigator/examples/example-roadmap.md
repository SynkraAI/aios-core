# Example Roadmap (Annotated)

This is an annotated example of a Navigator roadmap for a SaaS project. Comments explain each section.

---

```markdown
---
# Front-matter: Project metadata
project_name: task-management-saas        # Kebab-case, used in file paths
version: 1.0.0                            # Semantic versioning
created_at: 2026-02-15T10:00:00Z         # ISO 8601 timestamp
last_updated: 2026-02-15T14:30:00Z       # Updated automatically by sync
status: in-progress                       # Options: planning, in-progress, complete
description: >
  Task management SaaS with team collaboration,
  real-time updates, and analytics dashboard.

# Phases: Complete 10-phase pipeline
phases:
  # Phase 1: Research (always first, no inputs)
  - id: 1
    name: Pesquisa                        # Phase name in Portuguese (AIOS convention)
    agent: "@analyst"                     # Agent responsible (with @ prefix)
    icon: "🔍"                           # Emoji for visual identification
    command: "*research"                  # Command to execute this phase
    description: >                        # Multi-line description
      Market research, competitor analysis,
      and user persona definition for task management space.
    inputs: []                            # Phase 1 has no inputs (user provides context)
    outputs:                              # Files that must exist for phase to be complete
      - "docs/research/market-analysis.md"
      - "docs/research/competitor-analysis.md"
      - "docs/research/user-personas.md"
    next_phase: 2                         # ID of next phase (sequential)

  # Phase 2: PRD
  - id: 2
    name: PRD
    agent: "@pm"
    icon: "📋"
    command: "*create-prd"
    description: >
      Product Requirements Document with features,
      user stories, and success metrics.
    inputs:                               # These files must exist before starting
      - "docs/research/**/*.md"          # Wildcard: all .md files in research/
    outputs:
      - "docs/prd/prd.yaml"              # Single PRD file (YAML format)
    next_phase: 3

  # Phase 3: Architecture
  - id: 3
    name: Arquitetura
    agent: "@architect"
    icon: "🏗️"
    command: "*design-architecture"
    description: >
      Technical architecture including database schema,
      API design, and infrastructure decisions.
    inputs:
      - "docs/prd/prd.yaml"              # Specific file from previous phase
    outputs:
      - "docs/architecture/system-design.yaml"
      - "docs/architecture/database-schema.yaml"
      - "docs/architecture/api-spec.yaml"
    next_phase: 4

  # Phase 4: Epics
  - id: 4
    name: Épicos
    agent: "@pm"
    icon: "📚"
    command: "*create-epics"
    description: >
      Break down PRD into epics (large features)
      with clear scope and dependencies.
    inputs:
      - "docs/prd/prd.yaml"
      - "docs/architecture/**/*.yaml"
    outputs:
      - "docs/epics/epic-*.md"           # Wildcard: multiple epic files
    next_phase: 5

  # Phase 5: Stories
  - id: 5
    name: Stories
    agent: "@sm"
    icon: "📝"
    command: "*create-stories"
    description: >
      Convert epics into detailed user stories
      with acceptance criteria and estimates.
    inputs:
      - "docs/epics/epic-*.md"
    outputs:
      - "docs/stories/story-*.md"        # Wildcard: many story files
    next_phase: 6

  # Phase 6: Validation
  - id: 6
    name: Validação
    agent: "@po"
    icon: "✅"
    command: "*validate-stories"
    description: >
      Product Owner validates all stories for
      completeness, testability, and alignment with PRD.
    inputs:
      - "docs/stories/story-*.md"
    outputs:
      - "docs/validation/validation-report.md"  # Single validation report
    next_phase: 7

  # Phase 7: Development (longest phase, story-driven)
  - id: 7
    name: Desenvolvimento
    agent: "@dev"
    icon: "💻"
    command: "*implement"
    description: >
      Code implementation of all validated stories.
      Track progress via story status in front-matter.
    inputs:
      - "docs/stories/story-*.md"
      - "docs/architecture/**/*.yaml"
    outputs:                              # Code outputs (actual implementation)
      - "src/**/*.ts"                    # Source code files
      - "tests/**/*.test.ts"             # Test files
      - "package.json"                    # Dependencies
    next_phase: 8

  # Phase 8: QA & Testing
  - id: 8
    name: QA & Testes
    agent: "@qa"
    icon: "🧪"
    command: "*test"
    description: >
      Quality assurance: unit tests, integration tests,
      E2E tests, and manual exploratory testing.
    inputs:
      - "src/**/*.ts"
      - "tests/**/*.test.ts"
      - "docs/stories/story-*.md"        # QA validates against acceptance criteria
    outputs:
      - "docs/qa/test-report.md"         # Test results report
      - "docs/qa/bug-list.md"            # List of bugs found (if any)
    next_phase: 9                         # Next is conditional (fix loop or deploy)

  # Phase 9: Fix Loop (conditional, may be skipped)
  - id: 9
    name: Fix Loop
    agent: "@dev"
    icon: "🔧"
    command: "*fix"
    description: >
      Fix bugs identified in QA phase.
      Loop back to Phase 8 for regression testing.
    inputs:
      - "docs/qa/bug-list.md"
    outputs:
      - "docs/fixes/fix-*.md"            # Fix documentation
    next_phase: 8                         # Loop back to QA! (not 10)
    loop_back_to: 8                       # Explicit loop marker

  # Phase 10: Deploy (final phase)
  - id: 10
    name: Deploy
    agent: "@devops"
    icon: "🚀"
    command: "*deploy"
    description: >
      Push code to remote, deploy to production,
      and verify deployment health.
    inputs:
      - "src/**/*.ts"
      - "docs/qa/test-report.md"         # Requires passing tests
    outputs:
      - ".github/workflows/deploy.yml"   # CI/CD pipeline
      - "docs/deployment/deployment-log.md"  # Deployment record
    next_phase: null                      # null = final phase, no next

# Transition Rules: Advanced logic for auto-navigation
transitions:
  auto_advance:                           # Automatically advance if condition met
    - condition: "phase 1 outputs exist"  # All outputs present
      action: "advance"
      phase: 2

    - condition: "phase 7 stories 100% complete"
      action: "advance"
      phase: 8

    - condition: "phase 8 tests passing, no bugs"
      action: "skip"                      # Skip phase 9 if no bugs
      phase: 10

  blocked:                                # Block if condition not met
    - condition: "phase 7 not 100% complete"
      action: "block"
      message: "Complete all stories before QA"

    - condition: "phase 8 tests failing"
      action: "block"
      message: "Fix failing tests before deploy"

  loop:                                   # Loop conditions
    - condition: "phase 8 has bugs"
      action: "loop"
      phase: 9                            # Go to fix loop
      max_iterations: 5                   # Prevent infinite loops

    - condition: "phase 9 fixes complete"
      action: "loop"
      phase: 8                            # Return to QA

# Checkpoints: Auto-checkpoint configuration
checkpoints:
  auto_create:                            # Create checkpoint automatically
    - on: "phase_complete"                # After each phase completion
      type: "auto"
    - on: "git_commit"                    # After each commit (via hook)
      type: "auto"

  manual_prompt:                          # Prompt user to create checkpoint
    - before: "destructive_operation"     # Before risky operations
    - at: "phase_boundary"                # Between phases

# Metadata: Additional configuration
metadata:
  tech_stack:
    frontend: "Next.js 14, TypeScript, Tailwind CSS"
    backend: "Node.js, Express, Prisma ORM"
    database: "PostgreSQL"
    deployment: "Vercel (frontend), Railway (backend)"

  team:
    size: 1                               # Solo developer
    timezone: "America/Sao_Paulo"

  estimates:
    total_hours: 160                      # 4 weeks × 40 hours
    phase_breakdown:
      1: 8                                # Research: 1 day
      2: 16                               # PRD: 2 days
      3: 16                               # Architecture: 2 days
      4: 8                                # Epics: 1 day
      5: 16                               # Stories: 2 days
      6: 4                                # Validation: 0.5 day
      7: 80                               # Development: 10 days (50%)
      8: 8                                # QA: 1 day
      9: 4                                # Fixes: 0.5 day
      10: 4                               # Deploy: 0.5 day
---

# Task Management SaaS - Project Roadmap

This roadmap was generated by Navigator on 2026-02-15.

## Project Overview

A modern task management SaaS platform with real-time collaboration,
analytics, and team productivity features.

**Target Users:** Small to medium teams (5-50 people)
**Business Model:** Freemium (free tier + paid plans)
**Launch Date:** Q2 2026

## Key Features

1. **Task Management**
   - Create, assign, and track tasks
   - Priorities, due dates, labels
   - Subtasks and checklists

2. **Team Collaboration**
   - Real-time updates (WebSockets)
   - Comments and mentions
   - File attachments

3. **Analytics Dashboard**
   - Team productivity metrics
   - Task completion trends
   - Time tracking

4. **Integrations**
   - Slack notifications
   - GitHub issue sync
   - Calendar integration

## Phase Details

### 1. Pesquisa (Week 1)
**Goal:** Understand market and validate idea

**Deliverables:**
- Market size analysis
- Competitor comparison (Asana, Trello, Monday.com)
- User personas (3 types: manager, developer, designer)

---

### 2. PRD (Week 2)
**Goal:** Define product scope

**Deliverables:**
- Feature prioritization (MoSCoW method)
- User stories (high-level)
- Success metrics (DAU, retention, NPS)

---

### 3. Arquitetura (Week 2-3)
**Goal:** Technical foundation

**Deliverables:**
- System design diagram
- Database schema (15 tables)
- API specification (RESTful + WebSocket)

---

### 4-6. Épicos, Stories, Validação (Week 3-4)
**Goal:** Detailed planning

**Deliverables:**
- 8 epics
- 45 user stories
- Validated by Product Owner

---

### 7. Desenvolvimento (Week 5-12)
**Goal:** Build the product

**Stories:** 45 stories × 3.5 hours = 160 hours

---

### 8-10. QA, Fixes, Deploy (Week 13-14)
**Goal:** Launch to production

**Deliverables:**
- Test coverage: 85%+
- Performance: < 200ms API response
- Deployment: Automated CI/CD

---

## Success Criteria

- ✅ All 10 phases complete
- ✅ 45/45 stories implemented
- ✅ Tests passing (85%+ coverage)
- ✅ Deployed to production
- ✅ < 2 critical bugs in production

---

## Notes

- This roadmap is version-controlled in git
- Updates sync between .aios/navigator/ and docs/
- Use `@navigator *where-am-i` to check progress
- Checkpoints auto-created after each phase

---

*Generated by Navigator v1.0.0 on 2026-02-15*
```

---

## Roadmap Anatomy

### Front-Matter Section
- **YAML format** between `---` markers
- Contains all structured data Navigator needs
- Parsed by `phase-detector.js` for logic

### Markdown Body
- Human-readable project description
- Context for stakeholders
- Not parsed by Navigator (documentation only)

### Key Patterns

**Inputs/Outputs:**
- Use glob patterns (`**/*.md`) for multiple files
- Specific paths for single files
- Navigator checks file existence to detect phase completion

**Transitions:**
- `auto_advance`: Automatically move to next phase
- `blocked`: Prevent advancement if condition fails
- `loop`: Cycle between phases (e.g., dev → QA → fixes → QA)

**Agents:**
- Always use `@` prefix
- Must match agent IDs in `.aios-core/development/agents/`

**Commands:**
- Always use `*` prefix
- Must exist in agent's task list

---

## How to Use This Roadmap

1. **Copy template** to your project
2. **Customize phases** for your tech stack
3. **Adjust outputs** to match your file structure
4. **Run Navigator** to follow the roadmap

---

*This example is a complete, production-ready roadmap template.*
