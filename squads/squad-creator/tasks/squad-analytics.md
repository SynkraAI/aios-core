# Task: Squad Analytics

**Task ID:** squad-analytics
**Version:** 3.0.0
**Purpose:** Generate metrics and quality analysis for squads
**Orchestrator:** @squad-chief
**Execution Type:** `Hybrid` (Script for metrics + Agent for analysis)

---

## Execution Model

```
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 1: SCRIPT (Deterministic)                                │
│  → python3 scripts/squad-analytics.py --squad {name} -l -q      │
│  → Output: Raw metrics (counts, lines, extras)                  │
│  → Cost: $0 (no LLM)                                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 2: AGENT (LLM Interpretation)                            │
│  → Read script output                                           │
│  → Analyze content quality (voice_dna, task anatomy)            │
│  → Generate recommendations                                      │
│  → Cost: LLM tokens                                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Script (squad-analytics.py)

### What Script Does (Deterministic)

| Feature | Method | Output |
|---------|--------|--------|
| File counts | `glob()` | agents: 16, tasks: 55, etc. |
| Line counts | `wc -l` equivalent | file.md: 1,234 lines |
| Extra folders | `path.exists()` | data/minds/, docs/sops/ |
| Min lines check | Numeric comparison | ✅ > 300 or ⚠️ < 300 |
| README/config exists | `file.exists()` | has_readme: true |
| Totals/averages | Math | avg: 1,814 lines |
| Sorting/filtering | Algorithm | --sort-by agents |
| Output formats | Formatting | table, json |

### Script CLI

```bash
# All squads (table)
python3 scripts/squad-analytics.py

# All squads (detailed)
python3 scripts/squad-analytics.py --detailed

# Single squad with line counts
python3 scripts/squad-analytics.py --squad hormozi --line-counts

# Single squad with quality audit (min lines check)
python3 scripts/squad-analytics.py --squad hormozi --quality-audit

# Both
python3 scripts/squad-analytics.py --squad hormozi -l -q

# JSON output
python3 scripts/squad-analytics.py --squad hormozi -l --format json
```

### Script Flags

| Flag | Short | Description |
|------|-------|-------------|
| `--squad NAME` | `-s` | Analyze single squad |
| `--line-counts` | `-l` | Show lines per file |
| `--quality-audit` | `-q` | Check against minimums (300/500) |
| `--detailed` | `-d` | Show component names |
| `--format` | | `table` (default), `json` |
| `--sort-by` | | `name`, `agents`, `tasks`, `total` |
| `--squads-path` | | Custom path to squads/ |

### Script Output Example

```
================================================================================
📊 SQUAD ANALYTICS: HORMOZI
================================================================================

📈 OVERVIEW
   Agents: 16 | Tasks: 55 | Workflows: 9
   Templates: 3 | Checklists: 45 | Data: 4
   Quality: ⭐⭐⭐

📁 EXTRA FOLDERS DETECTED
   └─ DNA Files (data/minds/): 17 files, 2,566 lines
   └─ SOPs (docs/sops/): 35 .md + 32 .yaml = 67,213 lines

📂 AGENTS (16 files, 29,025 lines, avg 1814)
   ✅ hormozi-workshop.md                       2440 lines
   ✅ hormozi-closer.md                         2408 lines
   ...

🔍 QUALITY AUDIT (AIOS Standards)
📋 AGENTS (min: 300 lines) — ✅ ALL PASS
📋 WORKFLOWS (min: 500 lines) — ⚠️ 1/9 BELOW MIN
```

---

## Phase 2: Agent (LLM Analysis)

### What Agent Does (Requires Interpretation)

| Feature | Why LLM Required | How |
|---------|------------------|-----|
| voice_dna quality | Read content, evaluate completeness | Read agent file, check sections |
| Task Anatomy compliance | Check 8 semantic fields | Parse task structure |
| Agent depth (SC_AGT_003) | Evaluate thinking depth | Analyze frameworks, examples |
| Content gap analysis | Interpret what's missing vs intentional | Compare to standards |
| Recommendations | Generate contextual suggestions | Based on findings |
| Health score | Qualitative judgment | Combine metrics + content |

### Agent Workflow

```
1. Run script: python3 scripts/squad-analytics.py --squad {name} -l -q
2. Read output (metrics)
3. IF user requests deep analysis:
   a. Read sample agents (top 3 by lines)
   b. Check for: voice_dna, output_examples, anti_patterns, handoff_to
   c. Score each dimension
4. IF user requests recommendations:
   a. Identify gaps from metrics
   b. Generate prioritized action items
5. Present combined report
```

### When to Use Agent Analysis

| Request | Script Only | + Agent |
|---------|:-----------:|:-------:|
| "Show me hormozi stats" | ✅ | |
| "How many agents in hormozi?" | ✅ | |
| "Is hormozi squad quality good?" | ✅ | ✅ |
| "What's missing in hormozi?" | | ✅ |
| "How can I improve hormozi?" | | ✅ |
| "Compare hormozi vs copy" | ✅ (metrics) | ✅ (quality) |

---

## Command: *squad-analytics

### Basic Usage (Script Only)

```bash
*squad-analytics                    # All squads table
*squad-analytics hormozi            # Single squad basic
*squad-analytics hormozi --detailed # With line counts
```

**Agent Action:**
```python
# Execute script
output = bash("python3 scripts/squad-analytics.py --squad {name} -l -q")
# Display output directly
print(output)
```

### Deep Analysis (Script + Agent)

```bash
*squad-analytics hormozi --analyze
*squad-analytics hormozi --recommendations
```

**Agent Action:**
```python
# 1. Execute script
metrics = bash("python3 scripts/squad-analytics.py --squad {name} -l -q --format json")

# 2. Parse JSON
data = json.loads(metrics)

# 3. Read top agents for content analysis
for agent in data["line_counts"]["agents"][:3]:
    content = read(f"squads/{name}/agents/{agent[0]}")
    # Analyze voice_dna, examples, etc.

# 4. Generate report with recommendations
```

---

## Quality Thresholds (Checked by Script)

| Component | Minimum | Rationale |
|-----------|---------|-----------|
| Agents | 300 lines | voice_dna + examples + anti_patterns |
| Workflows | 500 lines | phases + checkpoints + frameworks |
| Tasks | 100 lines | anatomy + validation |

---

## Extra Folders Detection

Script automatically detects squad-specific folders:

| Folder | Contents | Example Squad |
|--------|----------|---------------|
| `data/minds/` | DNA extraction files | hormozi |
| `docs/sops/` | Standard Operating Procedures | hormozi |
| `docs/` | Documentation | most squads |
| `pipelines/` | Pipeline code | mmos, books |

---

## Integration with Other Commands

```bash
# Update registry, then analytics
*refresh-registry && *squad-analytics

# Validate then check metrics
*validate-squad hormozi
*squad-analytics hormozi

# Export for documentation
*squad-analytics --format json > analytics.json
```

---

## Script Location

```
squads/squad-creator/scripts/squad-analytics.py
```

**Dependencies:** Python 3.8+ (stdlib only, no pip install)

---

## Changelog

### v3.0.0 (2026-02-10)
- Clear separation: Script (deterministic) vs Agent (LLM)
- Added `--squad NAME` filter
- Added `--line-counts` / `-l` flag
- Added `--quality-audit` / `-q` flag
- Added extra folders detection (data/minds/, docs/sops/)
- Removed promises that require LLM (health-check, gap-analysis, etc.)
- Those features now documented as "Agent Phase"

### v2.0.0 (2026-02-05)
- Added health indicators (moved to Agent phase)
- Added gap analysis (moved to Agent phase)
- Added recommendations (moved to Agent phase)

### v1.0.0 (2026-02-01)
- Initial release with basic counting

---

_Task Version: 3.0.0_
_Updated: 2026-02-10_
_Author: squad-chief_
