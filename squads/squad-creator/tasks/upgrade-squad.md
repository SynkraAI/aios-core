# Task: Upgrade Squad

**Task ID:** upgrade-squad
**Version:** 1.0.0
**Execution Type:** Worker
**Purpose:** Upgrade existing squads to current AIOS standards with gap analysis and automated improvements
**Orchestrator:** @squad-chief
**Mode:** Audit → Plan → Execute (with dry-run option)

**Core Philosophy:**
```
Squads evolve. Standards improve. Old squads need upgrades.
This task brings legacy squads up to current quality standards
without breaking what already works.
```

**Frameworks Used:**
- `checklists/agent-quality-gate.md` → Agent validation (800+ lines, 6 levels)
- `checklists/task-anatomy-checklist.md` → Task validation (8 fields)
- `checklists/squad-checklist.md` → Squad-level validation
- `data/quality-dimensions-framework.md` → Scoring
- `data/tier-system-framework.md` → Agent tier validation

---

## Upgrade Flow

```
INPUT (squad_name, mode)
    ↓
[PHASE 0: INVENTORY]
    → Scan all components (agents, tasks, workflows, etc.)
    → Count lines, extract metadata
    → Build component registry
    ↓
[PHASE 1: GAP ANALYSIS]
    → Compare each component against current standards
    → Score: PASS / NEEDS_UPGRADE / CRITICAL
    → Generate gap report
    ↓
[PHASE 2: UPGRADE PLAN]
    → Prioritize: Critical → High → Medium → Low
    → Estimate effort per component
    → Present plan to user (if not --auto)
    ↓
[PHASE 3: EXECUTE UPGRADES]
    → Apply improvements (or dry-run)
    → Validate each upgrade
    → Track changes
    ↓
[PHASE 4: VERIFICATION]
    → Run *validate-squad after upgrades
    → Compare before/after scores
    → Generate upgrade report
    ↓
OUTPUT: Upgrade Report + Updated Components
```

---

## Inputs

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `squad_name` | string | Yes | Name of squad to upgrade | `"copy"`, `"legal"` |
| `mode` | enum | No | Execution mode | `audit`, `plan`, `execute`, `auto` |
| `focus` | enum | No | Focus area | `agents`, `tasks`, `workflows`, `all` |
| `dry_run` | bool | No | Preview changes without applying | `true`, `false` |

### Mode Descriptions

| Mode | Description | User Interaction |
|------|-------------|------------------|
| `audit` | Only generate gap report, no changes | None (read-only) |
| `plan` | Generate report + upgrade plan | Review plan |
| `execute` | Execute plan with confirmations | Confirm each change |
| `auto` | Execute all upgrades automatically | Minimal |

---

## PHASE 0: INVENTORY

**Duration:** 1-2 minutes
**Mode:** Autonomous

### Step 0.1: Scan Squad Structure

```yaml
inventory_scan:
  actions:
    - "List all files in squads/{squad_name}/"
    - "Categorize by type: agents/, tasks/, workflows/, templates/, checklists/, data/"
    - "Count lines per file"
    - "Extract version from config.yaml"

  output_format:
    squad_name: "{name}"
    squad_version: "{version}"
    last_modified: "{date}"
    components:
      agents:
        count: N
        files:
          - name: "agent-name.md"
            lines: N
            has_voice_dna: true/false
            has_output_examples: true/false
      tasks:
        count: N
        files:
          - name: "task-name.md"
            lines: N
            has_8_fields: true/false
      workflows:
        count: N
        files: [...]
      templates:
        count: N
        files: [...]
      checklists:
        count: N
        files: [...]
      data:
        count: N
        files: [...]
```

### Step 0.2: Extract Component Metadata

For each component, extract key metadata:

```yaml
agent_metadata:
  required_sections:
    - "agent:"
    - "persona:"
    - "core_principles:"
    - "commands:"
    - "voice_dna:"
    - "output_examples:"
    - "anti_patterns:"
    - "completion_criteria:"
    - "handoff_to:"

task_metadata:
  required_fields:
    - "task_name"
    - "status"
    - "responsible_executor"
    - "execution_type"
    - "input"
    - "output"
    - "action_items"
    - "acceptance_criteria"

workflow_metadata:
  required_sections:
    - "phases:"
    - "checkpoints:"
    - "outputs:"
```

**Phase 0 Output:**
```yaml
inventory:
  squad: "copy"
  version: "2.1.0"
  totals:
    agents: 25
    tasks: 45
    workflows: 3
    templates: 12
    checklists: 8
    data: 5
  component_details: [...]
```

---

## PHASE 1: GAP ANALYSIS

**Duration:** 5-10 minutes
**Mode:** Autonomous

### Step 1.1: Agent Gap Analysis

For each agent, check against `agent-quality-gate.md`:

```yaml
agent_gaps:
  checks:
    # Level 0: Loader Configuration (NEW)
    - id: "L0-001"
      check: "Has ACTIVATION-NOTICE"
      current_standard: true
      weight: blocking

    - id: "L0-002"
      check: "Has IDE-FILE-RESOLUTION"
      current_standard: true
      weight: blocking

    - id: "L0-003"
      check: "Has command_loader section"
      current_standard: true
      weight: blocking

    # Level 1: Identity
    - id: "L1-001"
      check: "agent.tier defined (1, 2, or 3)"
      current_standard: true
      weight: blocking

    - id: "L1-002"
      check: "agent.whenToUse descriptive (20+ chars)"
      current_standard: true
      weight: blocking

    # Level 2: Operational
    - id: "L2-001"
      check: "core_principles has 5-9 items"
      current_standard: true
      weight: blocking

    - id: "L2-002"
      check: "operational_frameworks has 1+ framework with steps"
      current_standard: true
      weight: recommended

    # Level 3: Voice DNA
    - id: "L3-001"
      check: "voice_dna.vocabulary.always_use has 5+ terms"
      current_standard: true
      weight: blocking

    - id: "L3-002"
      check: "voice_dna.vocabulary.never_use has 3+ terms"
      current_standard: true
      weight: blocking

    - id: "L3-003"
      check: "voice_dna.sentence_starters has 5+ patterns"
      current_standard: true
      weight: recommended

    - id: "L3-004"
      check: "voice_dna.metaphors has 3+ metaphors"
      current_standard: true
      weight: recommended

    # Level 4: Quality
    - id: "L4-001"
      check: "output_examples has 3+ complete examples"
      current_standard: true
      weight: blocking

    - id: "L4-002"
      check: "anti_patterns.never_do has 5+ items"
      current_standard: true
      weight: blocking

    - id: "L4-003"
      check: "objection_algorithms has 3+ objections"
      current_standard: true
      weight: recommended

    # Level 5: Integration
    - id: "L5-001"
      check: "handoff_to has 1+ handoffs"
      current_standard: true
      weight: blocking

    - id: "L5-002"
      check: "activation.greeting defined (50+ chars)"
      current_standard: true
      weight: blocking

    # Line Count
    - id: "LC-001"
      check: "Agent has 800+ lines"
      current_standard: 800
      weight: recommended

  scoring:
    pass: "All blocking checks pass"
    needs_upgrade: "1-3 blocking checks fail"
    critical: ">3 blocking checks fail"
```

### Step 1.2: Task Gap Analysis

For each task, check against `task-anatomy-checklist.md`:

```yaml
task_gaps:
  checks:
    - id: "T-001"
      check: "Has all 8 required fields"
      fields: ["task_name", "status", "responsible_executor", "execution_type", "input", "output", "action_items", "acceptance_criteria"]
      weight: blocking

    - id: "T-002"
      check: "task_name follows Verb + Object format"
      pattern: "^[A-Z][a-z]+ [A-Z]"
      weight: blocking

    - id: "T-003"
      check: "execution_type is valid enum"
      valid: ["Human", "Agent", "Hybrid", "Worker"]
      weight: blocking

    - id: "T-004"
      check: "input is array with 1+ items"
      weight: blocking

    - id: "T-005"
      check: "output is array with 1+ items"
      weight: blocking

    - id: "T-006"
      check: "action_items has 3+ concrete steps"
      weight: recommended

    - id: "T-007"
      check: "acceptance_criteria has 2+ testable criteria"
      weight: recommended

    - id: "T-008"
      check: "Complex tasks (500+ lines) have checklist reference"
      weight: recommended

  scoring:
    pass: "All blocking checks pass"
    needs_upgrade: "1-2 blocking checks fail"
    critical: ">2 blocking checks fail"
```

### Step 1.3: Workflow Gap Analysis

```yaml
workflow_gaps:
  checks:
    - id: "W-001"
      check: "Has 3+ phases"
      weight: blocking

    - id: "W-002"
      check: "Each phase has checkpoint"
      weight: blocking

    - id: "W-003"
      check: "Outputs flow between phases"
      weight: blocking

    - id: "W-004"
      check: "Quality gate before final output"
      weight: blocking

    - id: "W-005"
      check: "Has automation script (if 8+ phases)"
      weight: recommended

  scoring:
    pass: "All blocking checks pass"
    needs_upgrade: "1-2 blocking checks fail"
    critical: ">2 blocking checks fail"
```

### Step 1.4: Generate Gap Report

```yaml
gap_report_format:
  summary:
    squad: "{name}"
    overall_score: "X.X/10"
    status: "PASS | NEEDS_UPGRADE | CRITICAL"
    components_analyzed: N
    components_passing: N
    components_needing_upgrade: N
    components_critical: N

  by_category:
    agents:
      total: N
      passing: N
      needing_upgrade: N
      critical: N
      details:
        - name: "agent-name.md"
          score: "X/10"
          status: "PASS | NEEDS_UPGRADE | CRITICAL"
          gaps:
            blocking:
              - "Missing voice_dna.vocabulary.always_use"
              - "No output_examples"
            recommended:
              - "Could add more metaphors"

    tasks:
      total: N
      passing: N
      needing_upgrade: N
      critical: N
      details: [...]

    workflows:
      total: N
      passing: N
      needing_upgrade: N
      critical: N
      details: [...]

  priority_list:
    critical:
      - component: "agents/old-agent.md"
        gaps: 5
        effort: "2-3h"
    high:
      - component: "tasks/incomplete-task.md"
        gaps: 3
        effort: "1h"
    medium:
      - component: "agents/needs-polish.md"
        gaps: 2
        effort: "30m"
    low:
      - component: "templates/minor-update.md"
        gaps: 1
        effort: "15m"
```

**Phase 1 Output:**
```
📊 GAP ANALYSIS REPORT: copy

Overall Score: 6.8/10 - NEEDS_UPGRADE

| Category | Pass | Upgrade | Critical |
|----------|------|---------|----------|
| Agents | 15 | 8 | 2 |
| Tasks | 30 | 12 | 3 |
| Workflows | 2 | 1 | 0 |

Top 5 Critical Issues:  <!-- Example issues - replace with your squad -->
1. agents/{agent-1}.md - Missing Hybrid Loader structure (L0)
2. agents/{agent-2}.md - No output_examples
3. tasks/{task-1}.md - Missing 3 required fields
4. tasks/{task-2}.md - execution_type invalid
5. agents/{agent-3}.md - voice_dna incomplete

Estimated Total Effort: 12-15h
```

---

## PHASE 2: UPGRADE PLAN

**Duration:** 1-2 minutes
**Mode:** Interactive (unless --auto)

### Step 2.1: Prioritize Upgrades

```yaml
prioritization_rules:
  critical:
    criteria:
      - "Blocking checks failing"
      - "Component unusable without fix"
    action: "Must fix before squad is production-ready"

  high:
    criteria:
      - "Missing required sections"
      - "Below minimum line count"
    action: "Should fix in this upgrade cycle"

  medium:
    criteria:
      - "Recommended checks failing"
      - "Quality score below 7.0"
    action: "Fix if time permits"

  low:
    criteria:
      - "Minor improvements"
      - "Style/consistency issues"
    action: "Optional polish"
```

### Step 2.2: Generate Upgrade Plan

```yaml
upgrade_plan:
  squad: "{name}"
  generated: "{timestamp}"
  total_components: N
  components_to_upgrade: N
  estimated_effort: "X-Yh"

  phases:
    - phase: 1
      name: "Critical Fixes"
      components:  # Example - replace with your squad components
        - file: "agents/{agent-1}.md"
          upgrades:
            - "Add ACTIVATION-NOTICE at top"
            - "Add IDE-FILE-RESOLUTION section"
            - "Add command_loader section"
            - "Add CRITICAL_LOADER_RULE"
          effort: "45m"
          auto_applicable: true

        - file: "tasks/{task-1}.md"
          upgrades:
            - "Add missing fields: execution_type, acceptance_criteria"
            - "Convert input/output to arrays"
          effort: "20m"
          auto_applicable: true

    - phase: 2
      name: "Required Sections"
      components:  # Example - replace with your squad components
        - file: "agents/{agent-2}.md"
          upgrades:
            - "Add output_examples section (3+ examples)"
            - "Expand voice_dna.vocabulary"
          effort: "1h"
          auto_applicable: false  # Needs research

    - phase: 3
      name: "Quality Polish"
      components:  # Example - replace with your squad components
        - file: "agents/{agent-3}.md"
          upgrades:
            - "Add metaphors to voice_dna"
            - "Add objection_algorithms"
          effort: "30m"
          auto_applicable: false
```

### Step 2.3: Present Plan for Approval

If mode != `auto`:

```
📋 UPGRADE PLAN: copy

Phase 1: Critical Fixes (Est: 1.5h)  <!-- Example - replace with your squad -->
  ├── agents/{agent-1}.md [AUTO] - Add Hybrid Loader structure
  ├── agents/{agent-2}.md [AUTO] - Add Hybrid Loader structure
  └── tasks/{task-1}.md [AUTO] - Add missing fields

Phase 2: Required Sections (Est: 3h)  <!-- Example - replace with your squad -->
  ├── agents/{agent-2}.md [MANUAL] - Add output_examples
  └── N more agents need output_examples

Phase 3: Quality Polish (Est: 2h)  <!-- Example - replace with your squad -->
  ├── agents/{agent-3}.md [MANUAL] - Add metaphors
  └── N more agents need voice_dna polish

Options:
1. Execute Phase 1 only (auto-applicable fixes)
2. Execute Phases 1-2 (with manual review)
3. Execute all phases
4. Export plan and exit
5. Cancel

Which option? [1-5]:
```

---

## PHASE 3: EXECUTE UPGRADES

**Duration:** Varies by scope
**Mode:** Interactive or Auto

### Step 3.1: Auto-Applicable Upgrades

Upgrades that can be safely automated:

```yaml
auto_upgrades:
  # Structural additions (safe to add)
  add_activation_notice:
    when: "ACTIVATION-NOTICE missing"
    action: |
      Insert at top of file:
      "ACTIVATION-NOTICE: This file contains your full agent operating guidelines..."
    safe: true

  add_ide_file_resolution:
    when: "IDE-FILE-RESOLUTION missing"
    action: |
      Insert IDE-FILE-RESOLUTION block with:
      - base_path: "squads/{squad_name}"
      - resolution_pattern based on squad structure
    safe: true

  add_command_loader:
    when: "command_loader missing"
    action: |
      Generate command_loader based on existing commands:
      - Parse commands section
      - Create loader entry for each command with dependencies
    safe: true

  add_critical_loader_rule:
    when: "CRITICAL_LOADER_RULE missing"
    action: |
      Insert standard CRITICAL_LOADER_RULE block
    safe: true

  # Field additions (safe)
  add_missing_task_fields:
    when: "Task missing required fields"
    action: |
      Add missing fields with sensible defaults:
      - status: "pending"
      - execution_type: "Agent" (default)
      - input: [] (empty array)
      - output: [] (empty array)
      - action_items: [] (empty array)
      - acceptance_criteria: [] (empty array)
    safe: true
    requires_review: true  # User should fill in values

  convert_to_array:
    when: "input/output is string instead of array"
    action: |
      Convert: "Single item" → ["Single item"]
    safe: true

  add_empty_sections:
    when: "Required section missing"
    action: |
      Add empty section with TODO comment:
      voice_dna:
        # TODO: Add vocabulary, sentence_starters, metaphors
        vocabulary:
          always_use: []
          never_use: []
    safe: true
    requires_review: true
```

### Step 3.2: Manual Upgrades

Upgrades requiring human input or research:

```yaml
manual_upgrades:
  add_output_examples:
    when: "output_examples missing or <3"
    action: |
      PAUSE and request:
      "Agent {name} needs 3+ output_examples.
       These should show real input→output patterns.
       Options:
       1. I'll generate examples based on agent's domain
       2. Skip for now (mark as TODO)
       3. You provide examples"
    requires: "Domain knowledge or research"

  expand_voice_dna:
    when: "voice_dna incomplete"
    action: |
      PAUSE and request:
      "Agent {name} needs expanded voice_dna.
       Missing: {missing_sections}
       Options:
       1. Research and generate (uses *extract-voice-dna)
       2. Skip for now (mark as TODO)
       3. You provide content"
    requires: "Source material or research"

  add_objection_algorithms:
    when: "objection_algorithms missing"
    action: |
      PAUSE and request:
      "Agent {name} needs objection_algorithms.
       These should handle common user pushback.
       Options:
       1. Generate based on domain patterns
       2. Skip for now
       3. You provide objections"
    requires: "Domain expertise"
```

### Step 3.3: Apply Upgrades

```yaml
upgrade_execution:
  for_each_upgrade:
    - step: "Backup original file"
      action: "Copy to .backup/{filename}.{timestamp}.bak"

    - step: "Apply upgrade"
      action: "Modify file according to upgrade spec"

    - step: "Validate change"
      action: "Re-run relevant checks on modified section"

    - step: "Log change"
      action: |
        Add to upgrade_log:
          file: "{filename}"
          upgrade: "{upgrade_id}"
          timestamp: "{now}"
          status: "applied | failed | skipped"
          notes: "{any issues}"

  on_failure:
    action: "Restore from backup, log failure, continue"
```

**Phase 3 Output:**
```
✅ UPGRADES APPLIED

Phase 1 Complete:  <!-- Example output - your results will vary -->
  ✅ agents/{agent-1}.md - Added Hybrid Loader structure
  ✅ agents/{agent-2}.md - Added Hybrid Loader structure
  ✅ tasks/{task-1}.md - Added missing fields

Phase 2 Partial:  <!-- Example output - your results will vary -->
  ⏭️ agents/{agent-2}.md - Skipped output_examples (TODO added)
  ✅ agents/{agent-3}.md - Generated output_examples

Changes Applied: 5
Changes Skipped: 1
Backups Created: 6
```

---

## PHASE 4: VERIFICATION

**Duration:** 2-3 minutes
**Mode:** Autonomous

### Step 4.1: Re-run Validation

```yaml
verification:
  action: "Run *validate-squad {squad_name}"
  compare:
    - "Before score vs After score"
    - "Before gaps vs After gaps"
    - "Blocking issues resolved?"
```

### Step 4.2: Generate Upgrade Report

```yaml
upgrade_report:
  header:
    squad: "{name}"
    upgrade_date: "{date}"
    upgraded_by: "Squad Architect"

  summary:
    before_score: "6.8/10"
    after_score: "8.5/10"
    improvement: "+1.7 points"
    status: "PASS | NEEDS_MORE_WORK"

  changes_made:
    total: N
    by_type:
      structural: N
      content: N
      formatting: N
    by_priority:
      critical: N
      high: N
      medium: N
      low: N

  components_upgraded:  # Example - your results will vary
    - file: "agents/{agent-1}.md"
      before: "5.2/10"
      after: "8.0/10"
      changes:
        - "Added Hybrid Loader structure"
        - "Added command_loader"

  remaining_todos:  # Example - your results will vary
    - file: "agents/{agent-2}.md"
      todo: "Add output_examples (marked with TODO)"
    - file: "agents/old-agent.md"
      todo: "Needs complete rewrite"

  recommendations:
    - "Run *extract-voice-dna on 3 agents that need output_examples"
    - "Consider deprecating agents/old-agent.md"
    - "Schedule follow-up upgrade in 2 weeks"

  backups:
    location: "squads/{squad}/.backup/"
    files: N
    restore_command: "cp .backup/{file}.bak {file}"
```

---

## Outputs

| Output | Location | Description |
|--------|----------|-------------|
| Gap Report | Console + `{squad}/docs/gap-report-{date}.md` | Full gap analysis |
| Upgrade Plan | Console | Prioritized upgrade plan |
| Upgrade Report | `{squad}/docs/upgrade-report-{date}.md` | Post-upgrade summary |
| Backups | `{squad}/.backup/` | Original files before upgrade |

---

## Usage

```bash
# Audit only (no changes)
@squad-chief
*upgrade-squad copy --mode=audit

# Generate plan
*upgrade-squad copy --mode=plan

# Execute with confirmations
*upgrade-squad copy --mode=execute

# Auto-execute all safe upgrades
*upgrade-squad copy --mode=auto

# Dry run (preview changes)
*upgrade-squad copy --mode=execute --dry-run

# Focus on specific component type
*upgrade-squad copy --focus=agents
*upgrade-squad copy --focus=tasks
```

---

## Anti-Patterns

### Never Do

- Upgrade without backup
- Auto-apply content changes (only structural)
- Skip validation after upgrades
- Ignore critical gaps
- Upgrade during active development on squad

### Always Do

- Backup before any modification
- Validate after every upgrade batch
- Document all changes in upgrade report
- Mark manual TODOs clearly
- Preserve original author intent

---

## Completion Criteria

```yaml
upgrade_complete_when:
  - "All critical gaps resolved (or documented as exceptions)"
  - "After score >= Before score + 1.0 (meaningful improvement)"
  - "No blocking checks failing"
  - "Upgrade report generated"
  - "Backups verified"

handoff_to:
  - agent: "@squad-chief"
    when: "Upgrade complete, user wants to validate"
    command: "*validate-squad {name}"

  - agent: "@oalanicolas"
    when: "Agent needs voice_dna research"
    command: "*extract-voice-dna {agent}"

  - agent: "User"
    when: "Manual TODOs remain"
    context: "Review TODO markers in upgraded files"
```

---

## Related

| Command | Purpose |
|---------|---------|
| `*validate-squad {name}` | Full validation (run after upgrade) |
| `*extract-voice-dna {name}` | Research voice DNA for agent |
| `*refresh-registry` | Update registry after upgrades |

| Reference | File |
|-----------|------|
| Agent Quality Gate | `checklists/agent-quality-gate.md` |
| Task Anatomy | `checklists/task-anatomy-checklist.md` |
| Squad Checklist | `checklists/squad-checklist.md` |

---

## Changelog

```yaml
v1.0.0 (2026-02-04):
  - Initial task creation
  - 4-phase upgrade flow
  - Auto-applicable vs manual upgrades
  - Gap analysis against current standards
  - Backup and restore capability
```

---

_Task Version: 1.0.0_
_Philosophy: Upgrade safely, validate thoroughly, document everything_
