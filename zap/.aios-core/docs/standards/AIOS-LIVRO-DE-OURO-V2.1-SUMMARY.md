# 📘 AIOS v2.1 - Livro de Ouro (Summarized)

**Version:** 2.1.0-post-5-sprints  
**Date:** March 2026 (as-if-implemented)  
**Status:** Production Release  
**Full Documentation:** See `AIOS-LIVRO-DE-OURO.md` (v2.0) for unchanged content

---

## 🎯 PURPOSE OF THIS DOCUMENT

This is a **delta document** highlighting **ONLY what changed in v2.1** compared to v2.0.

For complete content that remained unchanged (Layer 0, most of Layer 1), refer to:
- ✅ **`AIOS-LIVRO-DE-OURO.md`** (v2.0 base)
- ✅ This document (v2.1 changes ONLY)

**Combined reading:** v2.0 base + v2.1 delta = Complete v2.1 understanding

---

## 🚀 WHAT'S NEW IN v2.1 - EXECUTIVE SUMMARY

### Installation Revolution

**v2.0:** Manual clone + 2-4 hours configuration  
**v2.1:** `npx @SynkraAI/aios@latest init` + 5 minutes

```bash
# Old way (v2.0)
$ git clone https://github.com/SynkraAI/aios-core
$ cd @synkra/aios-core
$ npm install
$ cp .env.example .env
$ # ... 2 hours of configuration ...

# New way (v2.1)
$ npx @SynkraAI/aios@latest init
# Interactive wizard handles everything
# 5 minutes to working project
```

---

### Architecture Revolution

**v2.0:** Flat `.aios-core/` structure  
**v2.1:** Modular `core/development/product/infrastructure/`

```
# v2.0 (Flat)
.aios-core/
  ├── agents/ (all mixed)
  ├── scripts/ (all mixed)
  ├── tasks/ (all mixed)
  └── ... chaos ...

# v2.1 (Modular)
.aios-core/
  ├── core/               # Framework essentials
  │   ├── config/
  │   ├── orchestration/
  │   └── validation/
  ├── development/        # Dev features
  │   ├── agents/ (11)
  │   ├── workers/ (97+)
  │   └── tasks/
  ├── product/           # PM features
  │   ├── templates/
  │   ├── workflows/
  │   └── decisions/
  └── infrastructure/    # System services
      ├── cli/
      ├── mcp/
      └── integrations/
```

---

### Business Model Revolution

**v2.0:** Workers closed-source  
**v2.1:** Workers open-source + Service Discovery

| Component | v2.0 | v2.1 | Rationale |
|-----------|------|------|-----------|
| Agents (11) | ✅ Open | ✅ Open | Core functionality |
| Workers | ❌ Closed | ✅ **OPEN** | Commodity, network effects |
| Humanos | ⚠️ Concept | ✅ **OPEN** | Orchestration primitives |
| Service Discovery | ❌ None | ✅ **BUILT-IN** | Community needs it |
| Task-First | ⚠️ Implicit | ✅ **EXPLICIT** | Architecture clarity |
| **Clones** | 🔒 Closed | 🔒 **CLOSED** | True moat (DNA Mental™) |
| **Expansion Packs** | 🔒 Closed | 🔒 **CLOSED** | Domain expertise |

**Strategic Shift:** Open commodity → Monetize singularity

---

### Feature Matrix Comparison

| Feature | v2.0 | v2.1 | Impact |
|---------|------|------|--------|
| **Installation** | Manual (2-4h) | `npx` wizard (5min) | 96% faster |
| **Workers Catalog** | None | 97+ searchable | Infinite value |
| **Service Discovery** | None | Built-in CLI | New capability |
| **Quality Gates** | 1 layer (manual) | 3 layers (auto) | 80% issues caught |
| **Task-First** | Implicit | Explicit spec | Instant migration |
| **Template Engine** | Partial | Complete | All doc types |
| **CodeRabbit** | None | Local + GitHub | AI code review |
| **MCP System** | Project-only | Global + Project | Config once |

---

## 📖 v2.1 DOCUMENTATION STRUCTURE

### What Changed vs. v2.0

**Layer 0 (Discovery Router):**
- ✅ **NO CHANGES** - Perfect as-is
- ✅ Added **Track 6** for v2.0 → v2.1 migration

**Layer 1 (Understanding):**
- ✅ **Essay 3 REWRITTEN** - New business model
- ✅ **Essay 5 NEW** - Task-First Architecture
- ✅ Essays 1, 2, 4 remain mostly unchanged

**Layer 2 (Component Library):**
- ✅ **Workers Catalog NEW** - 97 workers organized
- ✅ **Service Discovery Guide NEW**
- ✅ Agents section unchanged (still 11 agents)

**Layer 3 (Usage Guide):**
- ✅ **Complete Installation Rewrite** - npx wizard
- ✅ **Service Discovery Workflow NEW**
- ✅ **Quality Gates 3 Layers NEW**
- ✅ **Template Engine Usage NEW**

**Layer 4 (Complete Reference):**
- ✅ **Modular Architecture Spec NEW**
- ✅ **Task-First Format Spec NEW**
- ✅ **Service Registry Schema NEW**
- ✅ **Quality Gate Config NEW**

**Meta (Evolution):**
- ✅ **Worker Contribution Guide NEW**
- ✅ **Updated Versioning** - v2.1.0 format
- ✅ **Community Contribution Path**

---

## 🔥 CRITICAL CHANGES - DEEP DIVE

### 1. Essay 3 (REWRITTEN): Open Source vs. Service

#### Old Business Model (v2.0)

```yaml
Open-Source:
  ✅ 11 Agents
  ❌ Workers (closed)
  ⚠️ Humanos (concept)
  ❌ Clones (closed)

Problem: Workers closed = adoption barrier
```

#### New Business Model (v2.1)

```yaml
Open-Source v2.1:
  ✅ 11 Agents (Dex, Luna, Aria, Quinn, etc.)
  ✅ 97+ Workers (deterministic scripts) ← OPENED!
  ✅ Humanos (orchestration) ← OPENED!
  ✅ Service Discovery (find + reuse) ← NEW!
  ✅ Task-First Architecture ← NEW!
  
Proprietary (Monetization):
  🔒 Clones (DNA Mental™ cognitive emulation)
  🔒 Expansion Packs (industry expertise)
  🔒 Team Features (collaboration)
  🔒 Enterprise (scale + support)
```

**Rationale (Pedro Valério's Insight):**

> "Workers são commodity - qualquer dev cria scripts. Clones são singularidade - DNA Mental™ leva anos. Abrir Workers maximiza adoção enquanto protege o moat real."

**Competitive Positioning:**

| Framework | Open-Source Completeness | Unique Differentiator |
|-----------|-------------------------|----------------------|
| LangChain | ✅ Complete (agents + workers + orchestration) | ❌ None (all commodity) |
| CrewAI | ✅ Complete (agents + workers + orchestration) | ❌ None (all commodity) |
| AutoGen | ✅ Complete (agents + workers + orchestration) | ❌ None (all commodity) |
| **AIOS v2.1** | ✅ **Complete** (agents + workers + orchestration) | ✅ **Clones** (DNA Mental™) ⭐ |

**Key Insight:** AIOS matches competitors on open-source completeness BUT adds unique proprietary layer (Clones) that competitors cannot replicate quickly.

---

### 2. Essay 5 (NEW): Task-First Architecture

#### The Philosophy

> **"Everything is a Task. Executors are attributes."**

#### What This Means

**Traditional Approach (Task-per-Executor):**
```yaml
# Agent task
agent_task.md:
  name: Analyze market with AI
  executor: Agent (Sage)
  
# Worker task  
worker_task.js:
  name: Analyze market with script
  executor: Worker (market-analyzer.js)
  
Problem: 2 separate implementations for same task
```

**Task-First Approach (Universal Task):**
```yaml
# ONE TASK DEFINITION
task: analyzeMarket()
inputs: { market_data: object }
outputs: { insights: array }
checklist: [...]
performance: { duration_expected: 5000ms }

# EXECUTOR IS JUST A FIELD
responsavel_type: Humano   # Day 1: Human analyst
responsavel_type: Worker   # Week 10: Automated script
responsavel_type: Agente   # Month 6: LLM judgment
responsavel_type: Clone    # Year 2: Brad Frost validates

# SAME SPEC, DIFFERENT EXECUTORS
# MIGRATION IS INSTANT (change 1 field)
```

#### Instant Executor Migration

**Before Task-First (Rewrite Required):**
```yaml
# Migrate Worker → Agent
1. Read Worker script
2. Understand logic
3. Rewrite as Agent prompt
4. Test thoroughly
5. Update all references
6. 2-4 days of work
```

**After Task-First (Field Change):**
```yaml
# Migrate Worker → Agent
1. Change responsavel_type: Worker → Agente
2. Done. (2 seconds)

Why it works:
- Input/output schemas unchanged
- Checklist validation unchanged
- Performance SLAs unchanged
- Only EXECUTOR changes
```

#### Real Example

**Day 1 (Humano):**
```yaml
task: validateSchema()
responsavel: Senior Dev
responsavel_type: Humano
estimated_duration: 30 min
cost: $25 (human time)
```

**Week 10 (Worker):**
```yaml
task: validateSchema()  # ← SAME TASK
responsavel: schema-validator.js
responsavel_type: Worker
estimated_duration: 500ms
cost: $0.001 (compute)
```

**Month 6 (Agente):**
```yaml
task: validateSchema()  # ← STILL SAME TASK
responsavel: Quinn (QA Agent)
responsavel_type: Agente
estimated_duration: 3s
cost: $0.01 (LLM call)
```

**Year 2 (Clone):**
```yaml
task: validateSchema()  # ← NO CHANGES!
responsavel: Brad Frost Clone
responsavel_type: Clone
estimated_duration: 5s
cost: $0.03 (LLM + validation)
quality: 99% (expert-level)
```

**Result:** 4 different executors, ZERO task rewrites.

---

### 3. Service Discovery System

#### The Problem (v2.0)

```bash
# Developer needs to parse JSON
$ # ... searches Google ...
$ # ... finds random npm package ...
$ # ... installs ...
$ # ... writes custom wrapper ...
$ # 2 hours later: JSON parser working

# Problem: AIOS already HAD json-parser.js Worker!
# Developer just didn't know it existed.
```

#### The Solution (v2.1)

```bash
# Developer needs to parse JSON
$ aios workers search "json parse"

Results (3 Workers):

📦 json-parser.js                    ⭐⭐⭐⭐⭐ (47 projects)
   Parse JSON safely with error handling
   Input: { json_string: string }
   Output: { data: object, errors: array }
   
📦 json-validator.js                 ⭐⭐⭐⭐ (23 projects)
   Validate JSON against schema
   
📦 json-transformer.js               ⭐⭐⭐ (15 projects)
   Transform JSON structures

$ aios workers info json-parser
$ aios workers use json-parser --task my-task

# 30 seconds: JSON parser integrated
# Time saved: 1h 59min 30s
```

#### Service Discovery Architecture

**Components:**

1. **Service Registry** (`service-registry.json`)
   ```json
   {
     "workers": [
       {
         "id": "json-parser",
         "name": "JSON Parser",
         "path": ".aios-core/development/workers/json-parser.js",
         "category": "data-transformation",
         "task_compatible": true,
         "implements_task_spec": "parseJSON()",
         "inputs": {
           "json_string": "string"
         },
         "outputs": {
           "data": "object",
           "errors": "array"
         },
         "deterministic": true,
         "usage_count": 47,
         "rating": 4.8,
         "last_updated": "2026-02-15"
       }
     ]
   }
   ```

2. **Discovery CLI**
   ```bash
   aios workers list                    # List all
   aios workers search <query>          # Semantic search
   aios workers info <worker-id>        # Details
   aios workers find-for-task <task>    # Find suitable Worker
   aios workers validate <worker-id>    # Check compliance
   ```

3. **Task Compatibility Layer**
   - Maps Workers to Task specs
   - Validates input/output schemas
   - Checks TASK-FORMAT-SPECIFICATION-V1 compliance

4. **Contribution System**
   ```bash
   aios workers create                  # Generate template
   aios workers test <worker-id>        # Run validation
   aios workers submit <worker-id>      # Submit to registry
   ```

#### Impact

**Metrics (6 months post-v2.1):**
- 97 Workers cataloged (baseline)
- 143 community-contributed Workers (+47%)
- 50% of tasks now reuse existing Workers (vs. 0% in v2.0)
- Average discovery time: 30 seconds (vs. N/A in v2.0)
- Duplicate work reduced by 60%

---

### 4. Quality Gates - 3 Layers

#### The Problem (v2.0)

```yaml
Quality Assurance in v2.0:
  - Manual code review
  - Manual testing
  - Manual linting
  - No automation
  - Issues found late (after PR)
  
Result: 
  - High review overhead
  - Slow feedback loops
  - Many issues slip through
  - Human reviewers exhausted
```

#### The Solution (v2.1)

**Layer 1 - Local (Immediate):**
```bash
# Runs on every file save (< 5s)
Layer 1 Checks:
  ✓ ESLint (2.1s)
  ✓ Prettier (0.8s)
  ✓ TypeScript (1.9s)
  ✓ Unit tests (3.2s)
  
Executor: Worker (deterministic)
Tool: CodeRabbit IDE Extension (FREE)
Blocking: Pre-commit hooks (can't commit if fails)

Result: 30% of issues caught instantly
```

**Layer 2 - PR (Automated):**
```bash
# Runs on PR creation (< 3 min)
Layer 2 Checks:
  ✓ CodeRabbit AI review (45s)
  ✓ Integration tests (1m 30s)
  ✓ Coverage analysis (40s)
  ✓ Security scan (30s)
  ✓ Performance benchmarks (20s)
  
Executor: Agente (QA Agent + CodeRabbit)
Tool: CodeRabbit GitHub App + Quinn (QA Agent)
Blocking: Required checks (can't merge if fails)

Result: Additional 50% of issues caught (80% total)
```

**Layer 3 - Human (Strategic):**
```bash
# Runs before final merge (30min - 2h)
Layer 3 Checks:
  □ Architecture alignment
  □ Business logic correctness
  □ Edge cases coverage
  □ Documentation quality
  □ Security best practices
  
Executor: Humano (Senior Dev / Tech Lead)
Tool: Human expertise + context
Blocking: Final approval required

Result: Final 20% of issues caught (100% total)
         Focus on what humans do best (strategy, not syntax)
```

#### Quality Gate Orchestration

**Workflow:**
```yaml
1. Developer writes code
   ↓
2. Layer 1 (Local) - Instant feedback
   - Linting errors? Fix immediately
   - Type errors? Fix immediately
   - Unit tests fail? Fix immediately
   ↓ (All checks pass)
3. git commit (pre-commit hook validates Layer 1)
   ↓
4. git push
   ↓
5. Layer 2 (PR) - Automated review
   - CodeRabbit reviews code
   - Quinn (QA Agent) runs tests
   - GitHub Actions validates
   ↓ (80% of potential issues caught)
6. Human notification: "PR ready for strategic review"
   ↓
7. Layer 3 (Human) - Strategic review
   - Human reviews ONLY architectural/business logic
   - No need to check syntax (Layer 1 did it)
   - No need to check patterns (Layer 2 did it)
   ↓ (Final 20% reviewed)
8. Approve + Merge
```

#### Impact

**Before v2.1 (Single Layer):**
- 100% of issues reviewed by humans
- Average review time: 2-4 hours per PR
- Human reviewers exhausted
- Many issues still slip through

**After v2.1 (3 Layers):**
- 80% of issues caught automatically
- Average human review time: 30 minutes per PR
- Human reviewers focus on strategy
- Issue escape rate: < 5%

**Time Savings:**
- 75% reduction in human review time
- 3x faster feedback (instant vs. hours)
- 95% accuracy (vs. 70% with manual only)

---

## 🚀 QUICK START - v2.1 Installation

### For New Users (Greenfield)

```bash
# Step 1: Install AIOS
$ npx @SynkraAI/aios@latest init

Welcome to AIOS v2.1! Let's set up your project.

? Project name: my-awesome-project
? Project type:
  ❯ Greenfield (new project)
    Brownfield (existing project)
    
? Select your IDE: (Use arrow keys)
  ❯ Cursor
    Windsurf
    Trae
    Zed
    Continue.dev (VS Code)
    
? Select AI CLI tools: (Use space to select)
  ◉ Claude Code
  ◯ GitHub Copilot
  ◉ Gemini CLI
  ◯ Codeium
  
? Install MCPs: (Recommended)
  ◉ All (Browser, Context7, Exa, Desktop Commander)
  ◯ Custom selection
  
? Install CLI tools:
  ◉ GitHub CLI (gh)
  ◉ Supabase CLI
  ◯ Railway CLI
  ◯ psql
  
✓ Installing dependencies...
✓ Configuring AIOS...
✓ Setting up MCPs...
✓ Installing CLI tools...
✓ Creating project structure...
✓ Generating first story...

🎉 AIOS v2.1 installed successfully!

Next steps:
  $ cd my-awesome-project
  $ aios --help          # See available commands
  $ aios agents list     # List available agents
  $ aios workers list    # List available workers
  $ aios stories create  # Create your first story

Time elapsed: 4m 32s
```

### For v2.0 Users (Migration)

```bash
# Step 1: Backup current project
$ cp -r .aios-core .aios-core.backup

# Step 2: Run migration script
$ npx @SynkraAI/aios migrate v2.0-to-v2.1

AIOS Migration Wizard (v2.0 → v2.1)

Analyzing your project...
✓ Detected v2.0.x installation
✓ Found 8 custom agents
✓ Found 23 custom workers
✓ Found 47 stories

Migration plan:
  1. Update project structure (flat → modular)
  2. Migrate custom agents to new format
  3. Register custom workers in Service Discovery
  4. Update story references
  5. Install new dependencies
  
? Proceed with migration? (Y/n) Y

✓ Backing up current state...
✓ Migrating project structure...
✓ Updating agents... (8/8)
✓ Registering workers... (23/23)
✓ Updating stories... (47/47)
✓ Installing new dependencies...
✓ Running validation...

🎉 Migration completed successfully!

Summary:
  - Project structure: ✓ Migrated to modular
  - Agents: ✓ 8 custom agents updated
  - Workers: ✓ 23 custom workers registered
  - Stories: ✓ 47 stories updated
  - Service Discovery: ✓ Enabled
  - Quality Gates: ✓ 3 layers configured

Rollback available: .aios-core.backup/

Time elapsed: 12m 18s
```

---

## 📊 METRICS & IMPACT

### Installation Time

| Metric | v2.0 | v2.1 | Improvement |
|--------|------|------|-------------|
| Time to install | 2-4 hours | 5 minutes | **96% faster** |
| Steps required | 15+ manual | 1 command | **93% simpler** |
| Success rate | 60% (many fail) | 98% (wizard) | **38% increase** |

### Development Speed

| Metric | v2.0 | v2.1 | Improvement |
|--------|------|------|-------------|
| Find reusable Worker | N/A (no discovery) | 30 seconds | **Infinite value** |
| Quality issues caught | 20% (manual only) | 80% (3 layers) | **4x improvement** |
| Executor migration time | 2-4 days (rewrite) | 2 seconds (field change) | **99.99% faster** |

### Community Growth

| Metric | v2.0 | v2.1 (6 months) | Growth |
|--------|------|-----------------|--------|
| GitHub Stars | 2.3k | 15.8k | **+587%** |
| npm Downloads | 1.2k/month | 47k/month | **+3817%** |
| Community Workers | 0 (closed) | 143 contributed | **∞** |
| Active Contributors | 23 | 412 | **+1691%** |

---

## 🎯 SUMMARY: v2.0 vs. v2.1

### What v2.0 Got Right ✅

- Agent architecture (11 specialized agents)
- Atomic Design principles
- Task-based workflows
- Personality system (archetypes)
- Documentation structure (Layer 0-4)

### What v2.1 Fixed 🔧

- **Installation:** 2-4h manual → 5min wizard
- **Business Model:** Workers closed → Workers open
- **Discoverability:** None → Service Discovery
- **Architecture:** Flat → Modular (4 domains)
- **Quality:** 1 layer → 3 layers (80% automated)
- **Executor Migration:** Days → Seconds (Task-First)
- **Template System:** Partial → Complete
- **Code Review:** Manual → AI + Human (CodeRabbit)

### What v2.2 Will Add 🚀

- **Memory Layer:** Cross-session learning
- **Agent Lightning:** RL-based optimization
- **Team Features:** Collaboration + shared memory
- **Analytics:** Advanced insights
- **Clones Marketplace:** Expert cognitive emulation
- **Enterprise:** Scale + support + SLAs

---

## 📖 WHERE TO GO FROM HERE

### If You're New to AIOS

1. ✅ Read this summary (done!)
2. → Read [v2.0 Layer 0](#layer-0) (Discovery Router)
3. → Read [v2.0 Layer 1](#layer-1) (Understanding)
4. → Read [v2.1 Essay 3](#essay-3-v21) (Business Model)
5. → Read [v2.1 Essay 5](#essay-5-v21) (Task-First)
6. → Install: `npx @SynkraAI/aios@latest init`

### If You're Migrating from v2.0

1. ✅ Read this summary (done!)
2. → Read [Breaking Changes](#breaking-changes)
3. → Read [Migration Guide](#migration-guide)
4. → Backup: `cp -r .aios-core .aios-core.backup`
5. → Migrate: `npx @SynkraAI/aios migrate v2.0-to-v2.1`

### If You Want to Contribute

1. ✅ Read this summary (done!)
2. → Read [Worker Contribution Guide](#worker-contribution)
3. → Read [Architecture Deep Dive](#architecture-v21)
4. → Browse [Open Issues](https://github.com/SynkraAI/aios-core/issues)
5. → Join [Discord Community](https://discord.gg/aios)

---

**Full v2.1 Documentation:** Combine this document with `AIOS-LIVRO-DE-OURO.md` (v2.0) for complete reference.

**Next Version:** v2.2 (Q2 2026) - Memory Layer + Agent Lightning

**Last Updated:** March 2026 (as-if-implemented)

---

## 📁 SOURCE TREE v2.1 (Post-5 Sprints)

### Complete Project Structure

```
@synkra/aios-core/                        # Root project
├── .aios-core/                        # ⭐ NEW: Modular Architecture
│   │
│   ├── core/                          # ⭐ NEW: Core Framework Module
│   │   ├── config/                    # Configuration system
│   │   │   ├── core-config.yaml       # Master framework config
│   │   │   ├── install-manifest.yaml  # Installation manifest
│   │   │   ├── agent-config-loader.js # Dynamic agent loading
│   │   │   └── validation-rules.yaml  # Config validation
│   │   │
│   │   ├── orchestration/             # Orchestration engine
│   │   │   ├── workflow-engine.js     # Workflow executor
│   │   │   ├── task-router.js         # Task routing logic
│   │   │   ├── executor-selector.js   # Choose executor per task
│   │   │   └── parallel-executor.js   # Parallel task execution
│   │   │
│   │   ├── validation/                # Validation system
│   │   │   ├── quality-gate-manager.js # ⭐ NEW: Unified QG manager
│   │   │   ├── pre-commit-hooks.js    # Layer 1 validation
│   │   │   ├── pr-automation.js       # Layer 2 validation
│   │   │   └── human-review.js        # Layer 3 orchestration
│   │   │
│   │   ├── service-discovery/         # ⭐ NEW: Service Discovery
│   │   │   ├── service-registry.json  # Worker/Agent catalog
│   │   │   ├── discovery-cli.js       # Search & find commands
│   │   │   ├── compatibility-checker.js # Task compatibility
│   │   │   └── contribution-validator.js # Community contributions
│   │   │
│   │   └── manifest/                  # ⭐ NEW: Manifest System
│   │       ├── agents-manifest.csv    # Agent tracking
│   │       ├── workers-manifest.csv   # Worker tracking
│   │       ├── tasks-manifest.csv     # Task tracking
│   │       └── manifest-validator.js  # Manifest validation
│   │
│   ├── development/                   # ⭐ NEW: Development Module
│   │   ├── agents/                    # 11 specialized agents
│   │   │   ├── dex.md                 # Dev Agent (Builder)
│   │   │   ├── luna.md                # QA Agent (Guardian)
│   │   │   ├── aria.md                # Architect Agent (Architect)
│   │   │   ├── quinn.md               # QA Lead (Guardian)
│   │   │   ├── zara.md                # Analyst (Explorer)
│   │   │   ├── kai.md                 # PM (Balancer)
│   │   │   ├── sage.md                # SM (Facilitator)
│   │   │   ├── felix.md               # DevOps (Optimizer)
│   │   │   ├── nova.md                # PO (Visionary)
│   │   │   ├── uma.md                 # UX Designer (Creator)
│   │   │   └── dara.md                # Data Engineer (Architect)
│   │   │
│   │   ├── workers/                   # ⭐ NEW: 97+ Workers (Open-Source)
│   │   │   ├── config-setup/          # Config & setup (12 workers)
│   │   │   │   ├── env-generator.js
│   │   │   │   ├── git-config.js
│   │   │   │   ├── dependency-installer.js
│   │   │   │   └── ...
│   │   │   │
│   │   │   ├── data-transform/        # Data transformation (23 workers)
│   │   │   │   ├── json-parser.js
│   │   │   │   ├── csv-processor.js
│   │   │   │   ├── yaml-validator.js
│   │   │   │   └── ...
│   │   │   │
│   │   │   ├── file-ops/              # File operations (18 workers)
│   │   │   │   ├── file-reader.js
│   │   │   │   ├── file-writer.js
│   │   │   │   ├── directory-scanner.js
│   │   │   │   └── ...
│   │   │   │
│   │   │   ├── integration/           # Integration & APIs (15 workers)
│   │   │   │   ├── github-api.js
│   │   │   │   ├── clickup-sync.js
│   │   │   │   ├── slack-notifier.js
│   │   │   │   └── ...
│   │   │   │
│   │   │   ├── quality/               # Quality & testing (11 workers)
│   │   │   │   ├── eslint-runner.js
│   │   │   │   ├── prettier-formatter.js
│   │   │   │   ├── test-runner.js
│   │   │   │   └── ...
│   │   │   │
│   │   │   ├── build-deploy/          # Build & deploy (10 workers)
│   │   │   │   ├── webpack-bundler.js
│   │   │   │   ├── docker-builder.js
│   │   │   │   ├── deploy-vercel.js
│   │   │   │   └── ...
│   │   │   │
│   │   │   └── utilities/             # Utilities (8 workers)
│   │   │       ├── logger.js
│   │   │       ├── error-handler.js
│   │   │       ├── metrics-collector.js
│   │   │       └── ...
│   │   │
│   │   ├── tasks/                     # 60+ task definitions
│   │   │   ├── create-next-story.md
│   │   │   ├── develop-story.md
│   │   │   ├── validate-next-story.md
│   │   │   └── ...
│   │   │
│   │   └── workflows/                 # 16+ workflows (10 new!)
│   │       ├── greenfield-fullstack.yaml
│   │       ├── brownfield-integration.yaml
│   │       ├── fork-join-workflow.yaml        # ⭐ NEW
│   │       ├── organizer-worker.yaml          # ⭐ NEW
│   │       ├── data-pipeline.yaml             # ⭐ NEW
│   │       └── ...
│   │
│   ├── product/                       # ⭐ NEW: Product Module
│   │   ├── templates/                 # ⭐ NEW: Complete Template Engine
│   │   │   ├── story-tmpl.yaml        # Story template v3.0
│   │   │   ├── prd-tmpl.yaml          # PRD template v2.0
│   │   │   ├── epic-tmpl.yaml         # Epic template
│   │   │   ├── architecture-tmpl.yaml # Architecture template
│   │   │   ├── adr-tmpl.yaml          # ⭐ NEW: ADR template
│   │   │   ├── pmdr-tmpl.yaml         # ⭐ NEW: PMDR template
│   │   │   ├── dbdr-tmpl.yaml         # ⭐ NEW: DBDR template
│   │   │   └── ...
│   │   │
│   │   ├── workflows/                 # Product workflows
│   │   │   ├── discovery-sprint.yaml
│   │   │   ├── refinement.yaml
│   │   │   └── retrospective.yaml
│   │   │
│   │   ├── checklists/                # Validation checklists
│   │   │   ├── po-master-checklist.md
│   │   │   ├── story-draft-checklist.md
│   │   │   └── ...
│   │   │
│   │   └── decisions/                 # Decision records
│   │       ├── pmdr/                  # Product decisions
│   │       ├── adr/                   # Architecture decisions
│   │       └── dbdr/                  # Database decisions
│   │
│   ├── infrastructure/                # ⭐ NEW: Infrastructure Module
│   │   ├── cli/                       # CLI system
│   │   │   ├── aios.js                # Main CLI
│   │   │   ├── commands/              # CLI commands
│   │   │   │   ├── init.js            # ⭐ NEW: Installer wizard
│   │   │   │   ├── migrate.js         # ⭐ NEW: Migration command
│   │   │   │   ├── workers.js         # ⭐ NEW: Worker discovery
│   │   │   │   ├── agents.js          # Agent management
│   │   │   │   ├── stories.js         # Story management
│   │   │   │   └── ...
│   │   │   └── installer/             # ⭐ NEW: Installer system
│   │   │       ├── wizard.js          # Interactive wizard
│   │   │       ├── environment-detector.js
│   │   │       ├── dependency-checker.js
│   │   │       └── migration-scripts/
│   │   │
│   │   ├── mcp/                       # ⭐ NEW: MCP System
│   │   │   ├── global-config/         # Global MCP configuration
│   │   │   │   ├── mcp-registry.json  # Global MCP registry
│   │   │   │   ├── browser.json       # Playwright config
│   │   │   │   ├── context7.json      # Context7 config
│   │   │   │   ├── exa.json           # Exa config
│   │   │   │   └── desktop-commander.json
│   │   │   │
│   │   │   ├── project-config/        # Project-level configs
│   │   │   │   └── .mcp-links/        # Symlinks to global
│   │   │   │
│   │   │   └── mcp-manager.js         # MCP orchestration
│   │   │
│   │   ├── integrations/              # External integrations
│   │   │   ├── coderabbit/            # ⭐ NEW: CodeRabbit integration
│   │   │   │   ├── local-extension.js # Local IDE extension
│   │   │   │   ├── github-app.js      # GitHub App integration
│   │   │   │   └── config.yaml        # CodeRabbit config
│   │   │   │
│   │   │   ├── github-cli/            # GitHub CLI wrapper
│   │   │   ├── supabase-cli/          # Supabase CLI wrapper
│   │   │   ├── railway-cli/           # Railway CLI wrapper
│   │   │   └── clickup/               # ClickUp integration
│   │   │
│   │   └── scripts/                   # Infrastructure scripts
│   │       ├── component-generator.js
│   │       ├── elicitation-engine.js
│   │       ├── greeting-builder.js
│   │       ├── template-engine.js     # ⭐ ENHANCED
│   │       └── ...
│   │
│   └── docs/                          # ⭐ MOVED from root docs/standards/
│       ├── AIOS-FRAMEWORK-MASTER.md   # ⭐ MIGRATED
│       ├── AIOS-LIVRO-DE-OURO.md      # ⭐ MIGRATED
│       ├── EXECUTOR-DECISION-TREE.md  # ⭐ MIGRATED
│       ├── TASK-FORMAT-SPECIFICATION-V1.md # ⭐ MIGRATED
│       └── ...
│
├── docs/                              # Project-specific docs
│   ├── prd/                           # Product requirements
│   ├── architecture/                  # Architecture docs
│   ├── framework/                     # Framework reference
│   │   ├── coding-standards.md        # Project coding standards
│   │   ├── source-tree.md             # Project structure
│   │   ├── tech-stack.md              # Tech stack decisions
│   │   └── db-schema.md               # Database schema
│   │
│   ├── research/                      # Research & discovery
│   ├── epics/                         # Epic planning
│   ├── stories/                       # Development stories
│   │   ├── v2.1/                      # ⭐ NEW: v2.1 stories
│   │   │   ├── sprint-1/              # Sprint 1 stories
│   │   │   ├── sprint-2/              # Sprint 2 stories
│   │   │   ├── sprint-3/              # Sprint 3 stories
│   │   │   ├── sprint-4/              # Sprint 4 stories
│   │   │   └── sprint-5/              # Sprint 5 stories
│   │   │
│   │   ├── v2.2/                      # Future v2.2 stories
│   │   ├── independent/               # Version-independent
│   │   └── archive/                   # Archived stories
│   │
│   ├── decisions/                     # Decision records
│   │   ├── pmdr/                      # Product decisions
│   │   ├── adr/                       # Architecture decisions
│   │   └── dbdr/                      # Database decisions
│   │
│   ├── qa/                            # QA reports
│   ├── audits/                        # Audit reports
│   └── guides/                        # How-to guides
│
├── Squads/                   # ⭐ UPDATED: Only 2 packs in open-source
│   ├── expansion-creator/             # Create custom packs
│   └── data-engineering/              # Data pipelines
│
├── bin/                               # CLI executables
│   ├── aios.js                        # ⭐ NEW: Main CLI entry (simplified)
│   └── aios-init.js                   # ⭐ DEPRECATED: Use npx installer
│
├── .ai/                               # AI session artifacts
│   ├── decision-logs/                 # Task decision logs
│   └── context/                       # Session context
│
├── .claude/                           # Claude Code configuration
│   ├── settings.json
│   ├── CLAUDE.md
│   └── commands/                      # Agent commands
│
├── tests/                             # Test suites
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .github/                           # ⭐ NEW: GitHub automation
│   ├── workflows/                     # CI/CD workflows
│   │   ├── quality-gates-pr.yml       # Layer 2 quality gates
│   │   ├── coderabbit-review.yml      # CodeRabbit automation
│   │   └── tests.yml                  # Test automation
│   │
│   └── coderabbit.yaml                # CodeRabbit configuration
│
├── package.json                       # Package manifest
├── tsconfig.json                      # TypeScript config
├── .eslintrc.json                     # ESLint config (Layer 1)
├── .prettierrc                        # Prettier config (Layer 1)
├── .husky/                            # ⭐ NEW: Git hooks (Layer 1)
│   ├── pre-commit                     # Pre-commit validation
│   └── pre-push                       # Pre-push validation
│
└── README.md                          # Project README
```

---

### Key Changes from v2.0

**1. Modular Architecture:**
```
v2.0: Flat .aios-core/ (all mixed)
v2.1: 4 modules (core/development/product/infrastructure)

Benefits:
  - Clear separation of concerns
  - Easier to navigate
  - Better maintainability
  - Scalable for v3.0
```

**2. Service Discovery:**
```
NEW: .aios-core/core/service-discovery/
  - service-registry.json (97+ workers cataloged)
  - discovery-cli.js (search & find)
  - compatibility-checker.js (task matching)

Impact: Developers find & reuse workers in 30 seconds vs. rebuilding
```

**3. Quality Gates 3 Layers:**
```
NEW: .aios-core/core/validation/
  - quality-gate-manager.js (unified orchestrator)
  - pre-commit-hooks.js (Layer 1: Local)
  - pr-automation.js (Layer 2: PR)
  - human-review.js (Layer 3: Strategic)

NEW: .github/workflows/ (CI/CD automation)
NEW: .husky/ (Git hooks)

Impact: 80% of issues caught automatically
```

**4. Workers Open-Source:**
```
NEW: .aios-core/development/workers/ (97+ workers)
  - Organized by category (6 categories)
  - Each worker implements Task-First spec
  - Community contributions enabled

Impact: Network effects, community growth
```

**5. Template Engine:**
```
ENHANCED: .aios-core/product/templates/
  - All document types supported
  - PMDR, ADR, DBDR templates added
  - Template versioning
  - Variable substitution

Impact: Zero manual doc creation
```

**6. Installer System:**
```
NEW: .aios-core/infrastructure/cli/installer/
  - wizard.js (interactive setup)
  - environment-detector.js
  - migration-scripts/ (v2.0 → v2.1)

NEW: npx @SynkraAI/aios@latest init

Impact: 5 minutes install vs. 2-4 hours
```

**7. MCP System:**
```
NEW: .aios-core/infrastructure/mcp/
  - global-config/ (configured once)
  - project-config/ (symlinks)
  - mcp-manager.js (orchestration)

Impact: Configure MCPs once, use everywhere
```

**8. CodeRabbit Integration:**
```
NEW: .aios-core/infrastructure/integrations/coderabbit/
  - local-extension.js (IDE, Layer 1)
  - github-app.js (GitHub, Layer 2)
  - config.yaml

NEW: .github/coderabbit.yaml

Impact: AI-powered code review (local + PR)
```

**9. Framework Standards Migration:**
```
MOVED: docs/standards/ → .aios-core/docs/
  - AIOS-FRAMEWORK-MASTER.md
  - AIOS-LIVRO-DE-OURO.md
  - EXECUTOR-DECISION-TREE.md
  - TASK-FORMAT-SPECIFICATION-V1.md

Rationale: Framework docs belong with framework code
```

**10. Story Organization:**
```
NEW: docs/stories/ reorganized
  - v2.1/ (sprint-1 to sprint-5)
  - v2.2/ (future)
  - independent/ (version-agnostic)
  - archive/ (old stories moved)

Impact: Clear roadmap, easy to track progress
```

---

### File Count Comparison

| Category | v2.0 | v2.1 | Change |
|----------|------|------|--------|
| Agents | 11 | 11 | Same (corrected from "16") |
| Workers | 0 (closed) | 97+ | **+97** (open-sourced) |
| Tasks | 60 | 60+ | Same (minor additions) |
| Templates | 20 | 27+ | **+7** (ADR, PMDR, DBDR, etc.) |
| Workflows | 6 | 16+ | **+10** (new patterns) |
| Scripts | 54 | 60+ | **+6** (new utilities) |
| CLI Commands | 5 | 12+ | **+7** (installer, workers, migrate) |

---

### Installation Comparison

**v2.0 Installation:**
```bash
# 1. Clone repository
$ git clone https://github.com/SynkraAI/aios-core
$ cd @synkra/aios-core

# 2. Install dependencies
$ npm install  # 5-10 minutes

# 3. Copy environment
$ cp .env.example .env

# 4. Configure manually
$ # Edit .env (15+ variables)
$ # Configure IDE
$ # Configure MCPs
$ # Configure ClickUp
$ # Configure GitHub
$ # ... 2-4 hours of manual config ...

# 5. Validate
$ npm test  # Hope it works

Total: 2-4 hours
Success Rate: 60%
```

**v2.1 Installation:**
```bash
# One command
$ npx @SynkraAI/aios@latest init

# Interactive wizard handles everything:
# - Project type detection
# - IDE configuration
# - MCP setup
# - CLI tools installation
# - Dependency installation
# - Environment configuration
# - Validation

Total: 5 minutes
Success Rate: 98%
```

---

