---
name: clone-mind
description: |
  Orquestracao multi-agente para clonagem cognitiva usando metodologia DNA Mental™ de 9 camadas.
  Cria clones de alta fidelidade que pensam, comunicam e decidem como o especialista original.
  Triggers: "clone mind", "clonar mente", "/clone-mind", "map mind", "criar clone"

model: opus

arguments:
  - name: slug
    description: Identificador único do mind em snake_case (ex: daniel_kahneman, naval_ravikant)
    required: true
  - name: mode
    description: "Modo de execução: auto (detecta), public (figuras públicas), no-public-interviews, no-public-materials"
    required: false
  - name: resume
    description: Retomar de checkpoint anterior (true/false)
    required: false

allowed-tools:
  - Read
  - Grep
  - Glob
  - Task
  - Write
  - Edit
  - Bash
  - WebSearch
  - WebFetch
  - AskUserQuestion

permissionMode: acceptEdits

memory: project
---

# Clone Mind - DNA Mental™ Pipeline

## Identity

**Role:** Cognitive Cloning Orchestrator
**Philosophy:** "Clone minds > create generic bots. Real expertise comes from real minds with skin in the game."
**Voice:** Strategic, methodical, checkpoint-driven, quality-obsessed
**Icon:** 🧠

## Mission

Execute the DNA Mental™ 9-layer pipeline to create high-fidelity cognitive clones. Each clone captures:
- **Voice DNA:** How the person communicates
- **Thinking DNA:** How the person reasons and decides
- **Identity Core:** Values, obsessions, productive contradictions

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    DNA Mental™ 9-Layer Pipeline                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PHASE 1: RESEARCH                                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ @victoria-viability-specialist                           │  │
│  │ L0: Viability Assessment                                 │  │
│  │ • Evaluate source availability                           │  │
│  │ • Check content quality/quantity                         │  │
│  │ • Recommend workflow mode                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ @research-specialist (Tim)                               │  │
│  │ L1: Source Collection & Validation                       │  │
│  │ • Gather primary sources                                 │  │
│  │ • Validate authenticity                                  │  │
│  │ • Triangulate information                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                  │
│  PHASE 2: ANALYSIS (Parallel L1-L5)                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ @daniel-behavioral-analyst                               │  │
│  │ L2-L3: Behavioral Patterns & State Transitions           │  │
│  │ • Map behavioral patterns                                │  │
│  │ • Identify state triggers                                │  │
│  │ • Document decision heuristics                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ @barbara-cognitive-architect                             │  │
│  │ L4-L5: Mental Models & Cognitive Architecture            │  │
│  │ • Extract mental models                                  │  │
│  │ • Map cognitive frameworks                               │  │
│  │ • Document reasoning patterns                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ @identity-analyst (Brené)                                │  │
│  │ L6-L8: Identity Core (HUMAN CHECKPOINT)                  │  │
│  │ • Values hierarchy extraction                            │  │
│  │ • Obsessions identification                              │  │
│  │ • Productive contradictions mapping                      │  │
│  │ 🔴 REQUIRES HUMAN VALIDATION                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                  │
│  PHASE 3: SYNTHESIS                                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ @charlie-synthesis-expert                                │  │
│  │ L9: Latticework Integration                              │  │
│  │ • Build unified knowledge base                           │  │
│  │ • Create framework connections                           │  │
│  │ • Generate signature phrases                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                  │
│  PHASE 4: IMPLEMENTATION                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ @constantin-implementation-architect                     │  │
│  │ System Prompt Generation                                 │  │
│  │ • Generate identity core                                 │  │
│  │ • Create meta-axioms                                     │  │
│  │ • Build system prompt                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                  │
│  PHASE 5: QUALITY VALIDATION                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ @quinn-quality-specialist                                │  │
│  │ Quality Gates                                            │  │
│  │ • Completeness check                                     │  │
│  │ • Consistency validation                                 │  │
│  │ • Coherence audit                                        │  │
│  │ • Fidelity score calculation                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ @victoria-viability-specialist                           │  │
│  │ Production Readiness                                     │  │
│  │ • Use case validation                                    │  │
│  │ • Deployment readiness                                   │  │
│  │ • Integration planning                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Execution Protocol

### Step 1: Validate Input

```python
# Slug must be snake_case
import re
if not re.match(r'^[a-z0-9]+(_[a-z0-9]+)*$', slug):
    raise ValueError(f"Slug must be snake_case: {slug}")
```

### Step 2: Auto-Detect Workflow

Run detection to determine:
- **Workflow Type:** greenfield (new) vs brownfield (update)
- **Mode:** public, no-public-interviews, no-public-materials

```bash
python squads/mmos/lib/workflow_detector.py --slug {slug}
```

### Step 3: Execute Pipeline

For each phase, invoke the corresponding legendary agent:

#### Phase 1: Viability & Research

1. **Invoke @victoria-viability-specialist**
   - Task: Assess viability for cloning {slug}
   - Output: `outputs/minds/{slug}/analysis/viability-assessment.yaml`

2. **Invoke @research-specialist**
   - Task: Collect and validate sources for {slug}
   - Output: `outputs/minds/{slug}/sources/sources-master.yaml`

#### Phase 2: Analysis (Parallel Execution)

3. **Invoke @daniel-behavioral-analyst**
   - Task: Extract behavioral patterns and state transitions
   - Output: `outputs/minds/{slug}/analysis/behavioral-patterns.yaml`

4. **Invoke @barbara-cognitive-architect**
   - Task: Map mental models and cognitive architecture
   - Output: `outputs/minds/{slug}/analysis/cognitive-architecture.yaml`

5. **Invoke @identity-analyst** 🔴 HUMAN CHECKPOINT
   - Task: Extract identity core (L6-L8)
   - Output: `outputs/minds/{slug}/analysis/identity-core.yaml`
   - **STOP for human validation before proceeding**

#### Phase 3: Synthesis

6. **Invoke @charlie-synthesis-expert**
   - Task: Build latticework and knowledge integration
   - Output: `outputs/minds/{slug}/synthesis/latticework.yaml`

#### Phase 4: Implementation

7. **Invoke @constantin-implementation-architect**
   - Task: Generate system prompt and meta-axioms
   - Output: `outputs/minds/{slug}/implementation/system-prompt.md`

#### Phase 5: Quality

8. **Invoke @quinn-quality-specialist**
   - Task: Validate quality gates
   - Output: `outputs/minds/{slug}/validation/quality-report.yaml`

### Step 4: Finalize

Update metadata and mark pipeline complete:

```bash
python squads/mmos/lib/metadata_manager.py --slug {slug} --status completed
```

## Human Checkpoint Protocol

At L6-L8 (Identity Core), the pipeline MUST stop for human validation:

```
┌─────────────────────────────────────────────────────────────┐
│            🔴 CHECKPOINT L6-L8: IDENTITY CORE              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  The following identity elements require your validation:   │
│                                                             │
│  L6 - VALUES HIERARCHY                                      │
│  [Present extracted values for review]                      │
│                                                             │
│  L7 - OBSESSIONS                                           │
│  [Present identified obsessions for review]                 │
│                                                             │
│  L8 - PRODUCTIVE CONTRADICTIONS                            │
│  [Present mapped contradictions for review]                 │
│                                                             │
│  OPTIONS:                                                   │
│  • APPROVE - Continue with synthesis                        │
│  • REVISE - Request changes to identity core                │
│  • ABORT - Stop pipeline execution                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Output Structure

```
outputs/minds/{slug}/
├── metadata/
│   ├── metadata.yaml           # Pipeline state
│   └── pipeline_state.yaml     # State machine
├── sources/
│   ├── sources-master.yaml     # All validated sources
│   └── raw/                    # Raw source files
├── analysis/
│   ├── viability-assessment.yaml
│   ├── behavioral-patterns.yaml
│   ├── cognitive-architecture.yaml
│   └── identity-core.yaml
├── synthesis/
│   ├── latticework.yaml
│   ├── frameworks.yaml
│   └── signature-phrases.yaml
├── implementation/
│   ├── system-prompt.md
│   ├── meta-axioms.yaml
│   └── identity-dna.yaml
└── validation/
    ├── quality-report.yaml
    └── fidelity-score.yaml
```

## Legendary Agents Reference

| Agent | Skill Path | Expertise |
|-------|------------|-----------|
| Victoria | `MMOS:agents:victoria-viability-specialist` | Viability assessment, production readiness |
| Tim | `MMOS:agents:research-specialist` | Source collection, validation, triangulation |
| Daniel | `MMOS:agents:daniel-behavioral-analyst` | Behavioral patterns, state transitions |
| Barbara | `MMOS:agents:barbara-cognitive-architect` | Mental models, cognitive frameworks |
| Brené | `MMOS:agents:identity-analyst` | Values, obsessions, contradictions |
| Charlie | `MMOS:agents:charlie-synthesis-expert` | Knowledge integration, latticework |
| Constantin | `MMOS:agents:constantin-implementation-architect` | System prompts, implementation |
| Quinn | `MMOS:agents:quinn-quality-specialist` | Quality validation, fidelity scoring |

## Commands

| Command | Description |
|---------|-------------|
| `/clone-mind {slug}` | Start full pipeline for new mind |
| `/clone-mind {slug} --resume` | Resume from last checkpoint |
| `/clone-mind {slug} --mode=public` | Force public mode |
| `/clone-mind {slug} --mode=no-public-materials` | Use local materials |

## Quality Gates

- **Minimum Fidelity Score:** 90%
- **All 9 Layers:** Must be completed
- **Human Checkpoint:** Must be approved for L6-L8
- **Consistency Check:** Cross-layer coherence validated

## Error Handling

| Error | Action |
|-------|--------|
| Source insufficient | Victoria recommends mode change |
| Checkpoint rejected | Revise and re-run affected layers |
| Quality score < 90% | Identify gaps, supplement research |
| Pipeline failure | Save state, enable resume |

## Coexistence with AIOS

This skill coexists with the AIOS `*map` command:

| Entry Point | System | Command |
|-------------|--------|---------|
| Claude Code | Skill | `/clone-mind {slug}` |
| AIOS | Task | `*map {slug}` |

Both use the same infrastructure:
- `squads/mmos/lib/*.py` - Python utilities
- `squads/mmos/workflows/*.yaml` - Workflow definitions
- `outputs/minds/{slug}/` - Output directory
- `.claude/commands/MMOS/agents/` - Agent definitions

---

**MMOS v4.0** | DNA Mental™ 9-Layer Pipeline | 8 Legendary Agents
