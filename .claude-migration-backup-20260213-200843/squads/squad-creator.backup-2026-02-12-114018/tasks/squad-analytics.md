# Task: Squad Analytics

**Task ID:** squad-analytics
**Version:** 2.0.0
**Purpose:** Generate comprehensive analytics, quality metrics, and health reports for all squads
**Orchestrator:** @squad-architect
**Mode:** Deterministic (Script-based) + Analysis
**Execution Type:** `Hybrid` (Worker script + Agent recommendations)
**Worker Script:** `scripts/squad-analytics.py`

---

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | Squad Analytics Dashboard |
| **status** | `active` |
| **responsible_executor** | Worker (script) + Agent (analysis) |
| **execution_type** | Worker |
| **input** | squads/ directory |
| **output** | Analytics report (table/json/yaml/markdown) |
| **acceptance_criteria** | Complete metrics for all squads, actionable insights |
| **quality_gate** | SC_ANA_001 |

---

## Overview

Generates a comprehensive analytics dashboard showing:

### Quantitative Metrics
- Component counts per squad (agents, tasks, workflows, templates, checklists, data, scripts)
- Line counts and depth analysis
- Quality scores per component type
- Ecosystem totals and averages

### Qualitative Metrics
- Health indicators (completeness, coverage, documentation)
- Quality gate compliance
- Agent depth scores (SC_AGT_003)
- Gap analysis and recommendations

### Comparative Analysis
- Top squads by category
- Trend analysis (if historical data available)
- Benchmark comparisons against gold standards

```
TRIGGER (*squad-analytics)
    ↓
[PHASE 1: SCAN]
    → Scan squads/ directory
    → Count all components
    → Calculate line counts
    ↓
[PHASE 2: ANALYZE]
    → Calculate quality scores
    → Identify health indicators
    → Detect gaps and issues
    ↓
[PHASE 3: COMPARE]
    → Rank squads
    → Compare to benchmarks
    → Generate recommendations
    ↓
[PHASE 4: REPORT]
    → Format output
    → Display to user
    ↓
OUTPUT: Analytics dashboard with insights
```

---

## Command Options

### Basic Options

| Option | Description | Default |
|--------|-------------|---------|
| `--format table` | ASCII table format (human-readable) | ✓ |
| `--format json` | JSON format (machine-readable) | |
| `--format yaml` | YAML format | |
| `--format markdown` | Markdown report for docs | |
| `--detailed` / `-d` | Show component names, not just counts | |
| `--verbose` / `-v` | Include line counts and quality scores | |

### Sorting Options

| Option | Description |
|--------|-------------|
| `--sort-by name` | Sort alphabetically |
| `--sort-by agents` | Sort by agent count |
| `--sort-by tasks` | Sort by task count |
| `--sort-by quality` | Sort by quality score |
| `--sort-by health` | Sort by health indicator |
| `--sort-by total` | Sort by total components (default) |

### Filter Options

| Option | Description |
|--------|-------------|
| `--squad {name}` | Analyze single squad in detail |
| `--min-quality {N}` | Only show squads with quality >= N |
| `--has-issues` | Only show squads with detected issues |
| `--gold-standard` | Only show gold standard squads |

### Analysis Options

| Option | Description |
|--------|-------------|
| `--health-check` | Run full health diagnostics |
| `--gap-analysis` | Identify missing components |
| `--recommendations` | Generate improvement suggestions |
| `--compare {squad1} {squad2}` | Side-by-side comparison |
| `--benchmark` | Compare all against gold standards |

---

## Execution Examples

### Standard Table View

```bash
*squad-analytics
```

**Output:**
```
════════════════════════════════════════════════════════════════════════════════
📊 AIOS SQUAD ANALYTICS DASHBOARD
Generated: 2026-02-05 | Version: 2.0.0
════════════════════════════════════════════════════════════════════════════════

📈 ECOSYSTEM SUMMARY
┌─────────────────────────────────────────────────────────────────────────────┐
│  Squads: 28    │  Agents: 176   │  Tasks: 342    │  Workflows: 64         │
│  Templates: 89 │  Checklists: 115│  Data: 156    │  Scripts: 47           │
│                                                                             │
│  Total Components: 989  │  Avg per Squad: 35.3  │  Health: 87%            │
└─────────────────────────────────────────────────────────────────────────────┘

────────────────────────────────────────────────────────────────────────────────
Squad                Agents  Tasks   WFs  Tmpls  Checks  Data  Scripts  Quality
────────────────────────────────────────────────────────────────────────────────
copy                     25     58     5    12       8     3        0   9.2 ⭐⭐⭐
squad-creator             4     22     7    14      10    12        9   9.4 ⭐⭐⭐
mmos                      8     35     8     6       5     8        2  10.0 ⭐⭐⭐
db-sage                   3     18     4     5       6    10        3   8.8 ⭐⭐⭐
legal                     6     28     3     8       6     3        0   8.5 ⭐⭐⭐
────────────────────────────────────────────────────────────────────────────────

🏆 TOP PERFORMERS
   Quality: mmos (10.0), squad-creator (9.4), copy (9.2)
   Agents: copy (25), aios-core (15), mmos (8)
   Tasks: copy (58), mmos (35), squad-creator (22)
   Coverage: squad-creator (100%), mmos (95%), copy (92%)

⚠️ ATTENTION NEEDED
   Low Coverage: {squad-x} (45%), {squad-y} (52%)
   Missing Workflows: {squad-z}
   No Checklists: {squad-w}

════════════════════════════════════════════════════════════════════════════════
```

### Detailed View with Line Counts

```bash
*squad-analytics --detailed --verbose
```

**Output includes:**
```
squad-creator            4     22     7    14      10    12        9   9.4 ⭐⭐⭐
   ├─ agents (4): 3,333 lines total
   │    ├─ squad-architect.md (1,260 lines) ✅
   │    ├─ oalanicolas.md (790 lines) ✅
   │    ├─ pedro-valerio.md (745 lines) ✅
   │    └─ sop-extractor.md (538 lines) ✅
   │
   ├─ tasks (22): 13,753 lines total
   │    ├─ validate-squad.md (1,363 lines) ✅
   │    ├─ optimize.md (1,081 lines) ✅
   │    ├─ discover-tools.md (944 lines) ✅
   │    └─ ... (+19 more)
   │
   ├─ workflows (7): 7,419 lines total
   │    ├─ wf-squad-fusion.yaml (1,684 lines) ✅
   │    └─ ... (+6 more)
   │
   └─ health: 94% | coverage: 100% | depth: 9.4/10
```

### Single Squad Deep Analysis

```bash
*squad-analytics --squad squad-creator --health-check
```

**Output:**
```
════════════════════════════════════════════════════════════════════════════════
📊 DEEP ANALYSIS: squad-creator v2.6.0
════════════════════════════════════════════════════════════════════════════════

📋 COMPONENT INVENTORY
┌──────────────┬───────┬─────────────┬─────────────────────────────────────────┐
│ Type         │ Count │ Total Lines │ Status                                  │
├──────────────┼───────┼─────────────┼─────────────────────────────────────────┤
│ Agents       │     4 │       3,333 │ ✅ All pass SC_AGT_001 (min 300 lines)  │
│ Tasks        │    22 │      13,753 │ ✅ 20/22 pass, 2 minor issues           │
│ Workflows    │     7 │       7,419 │ ✅ All have checkpoints                 │
│ Templates    │    14 │       1,500 │ ✅ Complete                             │
│ Checklists   │    10 │       2,000 │ ✅ Comprehensive coverage               │
│ Data         │    12 │       3,000 │ ✅ Frameworks documented                │
│ Scripts      │     9 │       1,500 │ ✅ Utilities present                    │
│ Docs         │    12 │       5,000 │ ✅ Excellent documentation              │
└──────────────┴───────┴─────────────┴─────────────────────────────────────────┘

🔍 HEALTH INDICATORS
┌─────────────────────────┬───────┬───────────┬────────────────────────────────┐
│ Indicator               │ Score │ Threshold │ Status                         │
├─────────────────────────┼───────┼───────────┼────────────────────────────────┤
│ Completeness            │  98%  │    80%    │ ✅ EXCELLENT                   │
│ Documentation Coverage  │ 100%  │    70%    │ ✅ EXCELLENT                   │
│ Agent Depth (SC_AGT_003)│  9.4  │    7.0    │ ✅ EXCELLENT                   │
│ Task Anatomy Compliance │  95%  │    90%    │ ✅ PASS                        │
│ Workflow Checkpoints    │ 100%  │   100%    │ ✅ PASS                        │
│ Quality Gate Compliance │  94%  │    85%    │ ✅ PASS                        │
└─────────────────────────┴───────┴───────────┴────────────────────────────────┘

📈 AGENT DEPTH ANALYSIS (SC_AGT_003)
┌───────────────────┬───────┬─────────────┬───────────┬───────────┬───────────┐
│ Agent             │ Lines │ voice_dna   │ examples  │ anti_pat  │ Score     │
├───────────────────┼───────┼─────────────┼───────────┼───────────┼───────────┤
│ squad-architect   │ 1,260 │ ✅ Complete │ ✅ 3      │ ✅ 12     │ 9.8/10    │
│ oalanicolas       │   790 │ ✅ Complete │ ✅ 3      │ ✅ 6      │ 9.5/10    │
│ pedro-valerio     │   745 │ ✅ Complete │ ✅ 3      │ ✅ 6      │ 9.3/10    │
│ sop-extractor     │   538 │ ✅ Complete │ ✅ 3      │ ✅ 12     │ 8.9/10    │
└───────────────────┴───────┴─────────────┴───────────┴───────────┴───────────┘

⚠️ MINOR ISSUES DETECTED
1. squad-analytics.md (174 lines) - Below recommended 300 lines for complex tasks
2. squad-fusion.md (141 lines) - Missing detailed validation phases

💡 RECOMMENDATIONS
1. Expand squad-analytics.md with more metrics and analysis
2. Add validation phases to squad-fusion.md
3. Consider adding behavioral_states to sop-extractor.md

════════════════════════════════════════════════════════════════════════════════
```

### Gap Analysis

```bash
*squad-analytics --gap-analysis
```

**Output:**
```
════════════════════════════════════════════════════════════════════════════════
🔍 GAP ANALYSIS REPORT
════════════════════════════════════════════════════════════════════════════════

MISSING COMPONENTS BY SQUAD
┌────────────────────┬─────────────────────────────────────────────────────────┐
│ Squad              │ Missing Components                                      │
├────────────────────┼─────────────────────────────────────────────────────────┤
│ {squad-x}          │ ❌ No workflows, ❌ No checklists                       │
│ {squad-y}          │ ⚠️ Only 1 agent, ❌ No README                           │
│ {squad-z}          │ ⚠️ No scripts                                           │
└────────────────────┴─────────────────────────────────────────────────────────┘

ECOSYSTEM GAPS
┌─────────────────────────────────────────────────────────────────────────────┐
│ Domain Gap: No squad for "finance" domain                                   │
│ Domain Gap: No squad for "sales" domain                                     │
│ Pattern Gap: Only 3 squads have complete HITL flow                          │
└─────────────────────────────────────────────────────────────────────────────┘

PRIORITY ACTIONS
1. 🔴 HIGH: Add workflows to {squad-x}
2. 🟠 MEDIUM: Add README to {squad-y}
3. 🟡 LOW: Consider finance/sales squads
```

### Benchmark Comparison

```bash
*squad-analytics --benchmark
```

**Output:**
```
════════════════════════════════════════════════════════════════════════════════
📊 BENCHMARK COMPARISON (vs Gold Standards)
════════════════════════════════════════════════════════════════════════════════

Gold Standards: copy (9.2), mmos (10.0), db-sage (8.8)

┌────────────────────┬───────┬────────────┬────────────┬────────────┬─────────┐
│ Squad              │ Score │ vs copy    │ vs mmos    │ vs db-sage │ Status  │
├────────────────────┼───────┼────────────┼────────────┼────────────┼─────────┤
│ squad-creator      │  9.4  │ +0.2 ↑     │ -0.6 ↓     │ +0.6 ↑     │ ✅ Gold │
│ legal              │  8.5  │ -0.7 ↓     │ -1.5 ↓     │ -0.3 ↓     │ ⭐⭐⭐  │
│ {squad-x}          │  6.2  │ -3.0 ↓     │ -3.8 ↓     │ -2.6 ↓     │ ⭐      │
└────────────────────┴───────┴────────────┴────────────┴────────────┴─────────┘

IMPROVEMENT PATH TO GOLD STANDARD
{squad-x} needs:
  - Add 2 more agents (current: 1, gold avg: 8)
  - Add 3 workflows (current: 0, gold avg: 5)
  - Add checklists (current: 0, gold avg: 6)
  - Improve documentation (current: minimal, gold: comprehensive)
```

---

## Quality Scoring Algorithm

### Component Scores

| Component | Weight | Criteria |
|-----------|--------|----------|
| Agents | 25% | Count, lines, depth (SC_AGT_003) |
| Tasks | 20% | Count, lines, anatomy compliance |
| Workflows | 15% | Count, checkpoints, frameworks |
| Templates | 10% | Count, completeness |
| Checklists | 10% | Count, coverage |
| Data | 10% | Frameworks, knowledge base |
| Documentation | 10% | README, guides, examples |

### Health Indicators

| Indicator | Formula |
|-----------|---------|
| Completeness | (present_types / 7) × 100% |
| Coverage | (components_with_min_quality / total_components) × 100% |
| Depth | avg(agent_depth_scores) |
| Documentation | (docs_present / docs_expected) × 100% |

### Quality Tiers

| Tier | Score Range | Indicator |
|------|-------------|-----------|
| Gold Standard | 9.0 - 10.0 | ⭐⭐⭐ |
| Excellent | 8.0 - 8.9 | ⭐⭐⭐ |
| Good | 7.0 - 7.9 | ⭐⭐ |
| Basic | 5.0 - 6.9 | ⭐ |
| Work in Progress | < 5.0 | 🔨 |

---

## Output Formats

### JSON Export

```bash
*squad-analytics --format json > analytics.json
```

```json
{
  "generated": "2026-02-05T10:30:00Z",
  "version": "2.0.0",
  "ecosystem": {
    "total_squads": 28,
    "total_agents": 176,
    "total_tasks": 342,
    "total_workflows": 64,
    "health_score": 87
  },
  "squads": [
    {
      "name": "squad-creator",
      "version": "2.6.0",
      "components": {
        "agents": 4,
        "tasks": 22,
        "workflows": 7
      },
      "quality_score": 9.4,
      "health_indicators": {
        "completeness": 98,
        "coverage": 100,
        "depth": 9.4
      }
    }
  ]
}
```

### Markdown Report

```bash
*squad-analytics --format markdown > ANALYTICS.md
```

Generates a full markdown document suitable for documentation.

---

## Integration

### With refresh-registry

```bash
# Update registry first
*refresh-registry

# Then view analytics
*squad-analytics
```

### With validate-squad

```bash
# Deep validation of specific squad
*validate-squad {name}

# Quick health check via analytics
*squad-analytics --squad {name} --health-check
```

### Scheduled Reports

```bash
# Generate weekly report
*squad-analytics --format markdown > docs/weekly-analytics-$(date +%Y%m%d).md
```

---

## Script Location

```
squads/squad-creator/scripts/squad-analytics.py
```

**Dependencies:** Python 3.8+, PyYAML, tabulate

---

## Heuristics Applied

| ID | Name | Purpose |
|----|------|---------|
| SC_ANA_001 | Analytics Completeness | All squads scanned, all metrics calculated |
| SC_ANA_002 | Health Calculation | Consistent health scoring across squads |
| SC_ANA_003 | Gap Detection | Accurate identification of missing components |
| SC_ANA_004 | Recommendation Quality | Actionable, prioritized suggestions |

---

## Completion Criteria

- [ ] All squads in squads/ directory scanned
- [ ] Component counts accurate (verified by spot check)
- [ ] Quality scores calculated per algorithm
- [ ] Health indicators reflect actual state
- [ ] Gaps accurately identified
- [ ] Recommendations are actionable
- [ ] Output formatted correctly for chosen format

---

## Changelog

### v2.0.0 (2026-02-05)
- Added health indicators
- Added gap analysis
- Added benchmark comparisons
- Added agent depth scoring (SC_AGT_003)
- Added recommendation engine
- Added markdown export format
- Added single-squad deep analysis mode
- Expanded quality scoring algorithm
- Added filtering options

### v1.0.0 (2026-02-01)
- Initial release with basic counting and table output

---

_Task Version: 2.0.0_
_Created: 2026-02-01_
_Updated: 2026-02-05_
_Author: squad-architect_
