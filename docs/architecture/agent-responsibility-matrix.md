# Agent Responsibility Matrix - Epic 3 Strategic Enhancements

**Document Version**: 1.0
**Last Updated**: 2025-10-25
**Author**: Winston (@architect) + Sarah (@po)
**Context**: Epic 3 Phase 2 - Strategic Enhancements (Stories 3.13-3.19)

---

## Executive Summary

This document defines clear responsibility boundaries for all AIOS agents, with particular focus on:
1. **GitHub DevOps Centralization** - Only @github-devops can push to remote repository
2. **Data Architecture Specialization** - @data-architect handles database/data science
3. **Branch Management Split** - @sm (local) vs @github-devops (remote)
4. **Git Operation Restrictions** - Which agents can do what with git/GitHub

**Critical Rule**: ONLY @github-devops agent can execute `git push` to remote repository.

---

## Git/GitHub Operations Matrix

### Full Operation Authority

| Operation | @github-devops | @dev | @sm | @qa | @architect | @po |
|-----------|:--------------:|:----:|:---:|:---:|:----------:|:---:|
| **git push** | ✅ ONLY | ❌ | ❌ | ❌ | ❌ | ❌ |
| **git push --force** | ✅ ONLY | ❌ | ❌ | ❌ | ❌ | ❌ |
| **gh pr create** | ✅ ONLY | ❌ | ❌ | ❌ | ❌ | ❌ |
| **gh pr merge** | ✅ ONLY | ❌ | ❌ | ❌ | ❌ | ❌ |
| **gh release create** | ✅ ONLY | ❌ | ❌ | ❌ | ❌ | ❌ |
| **git commit** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **git add** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **git checkout -b** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **git merge** (local) | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **git status** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **git log** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **git diff** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

### Enforcement Mechanism

**Multi-Layer Defense-in-Depth**:

1. **Git Pre-Push Hook** (Primary Enforcement)
   - Location: `.git/hooks/pre-push`
   - Checks: `$AIOS_ACTIVE_AGENT` environment variable
   - Action: Blocks push if agent != "github-devops"

2. **Environment Variables** (Runtime Detection)
   ```bash
   export AIOS_ACTIVE_AGENT="github-devops"
   export AIOS_GIT_PUSH_ALLOWED="true"
   ```

3. **Agent Definitions** (Documentation + Restrictions)
   - All agents have `git_restrictions` section
   - Clear `allowed_operations` and `blocked_operations` lists
   - Redirect messages point to @github-devops

4. **IDE Configuration** (UX Layer)
   ```json
   {
     "agents": {
       "dev": { "blockedOperations": ["push"] },
       "github-devops": { "allowedOperations": ["*"] }
     }
   }
   ```

---

## Agent Responsibility Boundaries

### @architect (Winston) 🏗️
**Role**: Holistic System Architect & Full-Stack Technical Leader

**Primary Scope**:
- System architecture (microservices, monolith, serverless, hybrid)
- Technology stack selection (frameworks, languages, platforms)
- Infrastructure planning (deployment, scaling, monitoring, CDN)
- API design (REST, GraphQL, tRPC, WebSocket)
- Security architecture (authentication, authorization, encryption)
- Frontend architecture (state management, routing, performance)
- Backend architecture (service boundaries, event flows, caching)
- Cross-cutting concerns (logging, monitoring, error handling)

**Git Operations**: Read-only (status, log, diff) - NO PUSH

**Delegate To**:
- **@data-architect**: Database schema design, query optimization, ETL pipelines
- **@github-devops**: Git push, PR creation, CI/CD configuration

**Retain**:
- Database technology selection from system perspective
- Data layer integration with application architecture
- Git workflow design (branching strategy)

---

### @data-architect (DataArch) 🗄️
**Role**: Database Architect & Data Science Workflow Specialist

**Primary Scope**:
- Database schema design (tables, relationships, indexes, constraints)
- Data modeling (normalization, denormalization strategies)
- Query optimization and performance tuning
- ETL pipeline design and implementation
- Data science workflow architecture
- Supabase-specific optimization (RLS policies, realtime, edge functions)
- Data governance (security, privacy, compliance)

**Git Operations**: Local commits (add, commit) - NO PUSH

**Collaborate With**:
- **@architect**: Database technology selection, data layer integration
- **@github-devops**: Push migration files after local commit

**Specialization**: Supabase expert (Row-Level Security, realtime, edge functions, storage)

---

### @dev (James) 💻
**Role**: Expert Senior Software Engineer & Implementation Specialist

**Primary Scope**:
- Code implementation from stories
- Debugging and refactoring
- Unit/integration testing
- Local git operations (add, commit, checkout, merge)
- Story task execution

**Git Operations**:
- ✅ Allowed: add, commit, status, diff, log, branch, checkout, merge (local)
- ❌ Blocked: push, gh pr create

**Workflow After Story Complete**:
1. Mark story status: "Ready for Review"
2. Notify user: "Story complete. Activate @github-devops to push changes"
3. DO NOT attempt git push

---

### @sm (Bob) 🏃
**Role**: Technical Scrum Master - Story Preparation Specialist

**Primary Scope**:
- Story creation and refinement
- Epic management and breakdown
- Sprint planning assistance
- Local branch management during development
- Conflict resolution guidance (local merges)

**Git Operations**:
- ✅ Allowed: checkout -b (create feature branches), branch (list), merge (local)
- ❌ Blocked: push, gh pr create, remote branch deletion

**Branch Management Workflow**:
1. Story starts → Create local feature branch: `git checkout -b feature/X.Y-story-name`
2. Developer commits locally
3. Story complete → Notify @github-devops to push and create PR

**Note**: @sm manages LOCAL branches during development, @github-devops manages REMOTE operations

---

### @github-devops (DevOps) 🚀
**Role**: GitHub Repository Manager & DevOps Specialist

**PRIMARY AUTHORITY**: ONLY agent authorized to push to remote repository

**Exclusive Operations**:
- ✅ git push (ALL variants)
- ✅ gh pr create, gh pr merge
- ✅ gh release create
- ✅ Remote branch deletion

**Primary Scope**:
- Repository integrity and governance
- Pre-push quality gate execution (lint, test, typecheck, build)
- Semantic versioning and release management
- Pull request creation and management
- CI/CD pipeline configuration (GitHub Actions)
- Repository cleanup (stale branches, temporary files)
- Changelog generation

**Quality Gates (Mandatory Before Push)**:
- npm run lint → PASS
- npm test → PASS
- npm run typecheck → PASS
- npm run build → PASS
- Story status = "Done" or "Ready for Review"
- No uncommitted changes
- No merge conflicts
- **User confirmation required**

**Semantic Versioning Logic**:
- MAJOR (v4 → v5): Breaking changes, API redesign
- MINOR (v4.31 → v4.32): New features, backward compatible
- PATCH (v4.31.0 → v4.31.1): Bug fixes only

---

### @qa (Quinn) 🧪
**Role**: Test Architect & Quality Advisor

**Primary Scope**:
- Comprehensive test architecture review
- Quality gate decisions (PASS/CONCERNS/FAIL/WAIVED)
- Risk assessment and test strategy
- Requirements traceability
- Advisory (does not block, provides recommendations)

**Git Operations**: Read-only (status, log, diff for review) - NO COMMIT, NO PUSH

**Note**: QA reviews code but doesn't commit. @dev commits, @github-devops pushes.

---

### @po (Sarah) 📝
**Role**: Technical Product Owner & Process Steward

**Primary Scope**:
- Backlog management and story refinement
- Acceptance criteria validation
- Sprint planning and prioritization
- Process adherence and quality assurance
- Documentation ecosystem integrity

**Git Operations**: None (PO role is non-technical regarding git)

**Note**: @po validates requirements and prioritizes work, doesn't interact with git.

---

## Workflow Examples

### Scenario 1: Standard Story Development

```
1. User: "Start Story 3.14: GitHub DevOps Agent"

2. @sm activates:
   - Creates feature branch: `git checkout -b feature/3.14-github-devops-agent`
   - Hands off to @dev

3. @dev activates:
   - Implements story tasks
   - Commits locally: `git add . && git commit -m "feat: implement pre-push quality gate"`
   - Marks story: "Ready for Review"
   - Notifies user: "Story complete. Activate @github-devops to push"

4. @github-devops activates:
   - Executes *pre-push (quality gates)
   - ALL PASS → Presents summary
   - User confirms
   - Pushes: `git push -u origin feature/3.14-github-devops-agent`
   - Creates PR: `gh pr create --title "Story 3.14: GitHub DevOps Agent" --body "..."`
   - Reports: "✅ Pushed successfully. PR #123 created: https://github.com/..."
```

### Scenario 2: Database Schema Design

```
1. User: "Design database schema for user authentication"

2. @architect activates:
   - Analyzes system requirements
   - Decides: "Use Supabase for persistence"
   - Delegates: "Activating @data-architect for schema design"

3. @data-architect activates:
   - Executes *design-schema
   - Creates tables: users, sessions, auth_providers
   - Designs RLS policies for row-level security
   - Generates migration: `20251025_create_auth_schema.sql`
   - Commits locally: `git add migrations/ && git commit -m "feat: add auth schema"`
   - Notifies: "Schema designed. Activate @github-devops to push migration"

4. @github-devops activates:
   - Executes *pre-push (quality gates)
   - Pushes migration to repository
```

### Scenario 3: Release Creation

```
1. User: "Create v4.32.0 release"

2. @github-devops activates:
   - Executes *version-check
   - Analyzes commits since v4.31.0
   - Recommends: "MINOR version bump (new features, backward compatible)"
   - User confirms: v4.32.0
   - Executes *pre-push (quality gates)
   - Generates changelog from commits
   - Creates tag: `git tag v4.32.0`
   - Pushes: `git push && git push --tags`
   - Creates GitHub release: `gh release create v4.32.0 --title "Release v4.32.0" --notes "..."`
   - Reports: "✅ Release v4.32.0 created: https://github.com/.../releases/v4.32.0"
```

---

## Data Architecture vs System Architecture

### Comparison Matrix

| Responsibility | @architect | @data-architect |
|----------------|:----------:|:---------------:|
| **Database technology selection (system view)** | ✅ | 🤝 Collaborate |
| **Database schema design** | ❌ Delegate | ✅ Primary |
| **Query optimization** | ❌ Delegate | ✅ Primary |
| **ETL pipeline design** | ❌ Delegate | ✅ Primary |
| **API design for data access** | ✅ Primary | 🤝 Collaborate |
| **Application-level caching** | ✅ Primary | 🤝 Consult |
| **Database-specific optimizations (RLS, triggers)** | ❌ Delegate | ✅ Primary |
| **Data science workflows** | ❌ Delegate | ✅ Primary |
| **Infrastructure for database (scaling, replication)** | ✅ Primary | 🤝 Consult |

### Collaboration Pattern

**Question**: "Which database should we use?"
- **@architect answers**: System perspective (cost, deployment, team skills, infrastructure)
- **@data-architect answers**: Data perspective (query patterns, scalability, data model fit)
- **Result**: Combined recommendation

**Question**: "Design database schema"
- **@architect**: Delegates to @data-architect
- **@data-architect**: Designs schema, creates migrations
- **@architect**: Integrates schema into system (API, ORM, caching)

---

## Branch Management Responsibilities

### Local Branches (@sm during development)

**Responsibilities**:
- Create feature branches when story starts
- Manage developer's working branches
- Local branch cleanup (delete merged local branches)

**Commands**:
```bash
# @sm can execute:
git checkout -b feature/3.14-github-devops
git branch -d feature/old-branch
git merge feature/branch-to-integrate
```

### Remote Branches (@github-devops for repository)

**Responsibilities**:
- Push branches to remote
- Delete remote branches (cleanup)
- Manage release branches
- Protect main/master branch

**Commands**:
```bash
# ONLY @github-devops can execute:
git push -u origin feature/3.14-github-devops
git push origin --delete feature/old-branch
gh pr create
gh pr merge
```

---

## Implementation Checklist for Story 3.14

- [ ] **Create Git Pre-Push Hook**
  - Location: `.git/hooks/pre-push`
  - Content: Check `$AIOS_ACTIVE_AGENT`, block if != "github-devops"
  - Make executable: `chmod +x .git/hooks/pre-push`

- [ ] **Update All Agent Definitions** (DONE ✅)
  - [x] @architect - Added `git_restrictions` and collaboration boundaries
  - [x] @dev - Removed git push, added workflow redirect
  - [x] @sm - Clarified local-only branch management
  - [x] @qa - Read-only git operations
  - [x] @github-devops - Created with exclusive push authority
  - [x] @data-architect - Created with data specialization

- [ ] **Update Agent Activation Scripts**
  - Add environment variable setting: `AIOS_ACTIVE_AGENT={agent_id}`
  - Set `AIOS_GIT_PUSH_ALLOWED` appropriately

- [ ] **IDE Configuration** (.claude/settings.json)
  - Add `agents.{id}.blockedOperations` for each agent
  - Document in IDE setup guide

- [ ] **Documentation Updates**
  - [x] Agent responsibility matrix (this document)
  - [ ] Update git-workflow-guide.md
  - [ ] Update developer onboarding docs

- [ ] **Testing**
  - Test @dev attempting git push (should be blocked)
  - Test @github-devops git push (should succeed)
  - Test quality gates before push
  - Test PR creation workflow

---

## Future Considerations

### Story 3.19: Memory Layer (Conditional)
If approved after utilities audit (Story 3.17):
- Memory layer needs no git restrictions (utility, not agent)
- Integration with agents doesn't change responsibility boundaries

### Squads
If new agents added via Squads:
- **Default**: NO git push capability
- **Exception Process**: Must be explicitly approved by PO and justified
- **Enforcement**: Pre-push hook automatically blocks unless agent ID whitelisted

---

## Summary

**Key Takeaways**:
1. ✅ Only @github-devops can push to remote repository (enforced via git hooks)
2. ✅ @architect handles system architecture, @data-architect handles data layer
3. ✅ @sm manages local branches, @github-devops manages remote operations
4. ✅ Quality gates are mandatory before any push
5. ✅ All agents have clear, documented boundaries

**Enforcement**: Multi-layer (hooks + env vars + agent defs + IDE config)

**Status**: ✅ Ready for implementation in Story 3.14

---

*Document maintained by @architect (Winston) and @po (Sarah)*
*Last reviewed: 2025-10-25*
