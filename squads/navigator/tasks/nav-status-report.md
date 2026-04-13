---
task: Generate Status Report
responsavel: "@navigator"
responsavel_type: hybrid
model: haiku
atomic_layer: task
elicit: true
execute_first:
  script: "node squads/navigator/scripts/navigator/phase-detector.js && git log --oneline --since='1 week ago'"
  output_format: yaml
  description: "Script pre-computes: phase status, completion %, story counts, git commit history. Agent synthesizes narrative report."
input_required:
  description: "Agent receives pre-computed metrics (stories done/pending, velocity, blockers). Agent ONLY writes narrative synthesis and insights."
  fields: [phase_status, completion, stories_metrics, git_history]
gap_zero:
  veto: "GAP_ZERO_001: Agent MUST run execute_first script BEFORE any analysis. Skipping script = VETO."
Entrada: |
  - report_type: daily|weekly|custom
  - time_range: Date range for report
Saida: |
  - report_file: .aiox/navigator/[project]/reports/[date]-[type].md
Checklist:
  - "[ ] Calculate metrics (stories, commits, velocity)"
  - "[ ] Identify blockers"
  - "[ ] List completed work"
  - "[ ] List pending work"
  - "[ ] Generate report from template"
  - "[ ] Save to reports/"
veto_conditions:
  - "No roadmap exists for current project → BLOCK (run *map-project first)"
  - "No stories found in docs/stories/ → BLOCK (no data to report on)"
  - "Time range is invalid (start > end, or future dates) → BLOCK (provide valid date range)"
---

# *status-report

Generate status report (daily/weekly/custom).

## Usage

```bash
@navigator
*status-report

# Weekly report
*status-report --weekly

# Custom range
*status-report --from 2026-02-01 --to 2026-02-15
```

## Workflow

### Step 1: Determine Report Type

```
? Report type:
  1. Daily (today's activity)
  2. Weekly (last 7 days)
  3. Custom range

> 2
```

### Step 2: Calculate Metrics

```javascript
const metrics = {
  completedStories: await getCompletedStories(timeRange),
  commits: await getCommits(timeRange),
  filesModified: await getModifiedFiles(timeRange),
  velocity: calculateVelocity(completedStories, timeRange)
};
```

### Step 3: Collect Work Items

```javascript
const workItems = {
  completed: await getCompletedWork(timeRange),
  inProgress: await getInProgressWork(),
  pending: await getPendingWork()
};
```

### Step 4: Identify Blockers

```javascript
const blockers = await identifyBlockers();
```

### Step 5: Generate Report

Use template `nav-status-report-tmpl.md`:

```javascript
const report = renderTemplate('nav-status-report-tmpl.md', {
  project_name: roadmap.name,
  report_period: formatPeriod(timeRange),
  report_type: 'Weekly',
  metrics,
  workItems,
  blockers
});
```

### Step 6: Save Report

```javascript
const filename = `${dateString}-weekly.md`;
const reportPath = `.aiox/navigator/${projectName}/reports/${filename}`;
fs.writeFileSync(reportPath, report);
```

## Output

```
📊 Status Report Generated!

**Project:** E-commerce Order Management
**Period:** 2026-02-08 to 2026-02-15 (7 days)
**Type:** Weekly

**Summary:**
- Stories completed: 5 (+2 from last week)
- Commits: 24 (+8)
- Velocity: 2.5 stories/week (↑ trending up)
- Blockers: 0

**Saved to:**
.aiox/navigator/ecommerce-order-mgmt/reports/2026-02-15-weekly.md

View full report:
cat .aiox/navigator/ecommerce-order-mgmt/reports/2026-02-15-weekly.md
```

## Implementation

```javascript
async function generateStatusReport(type = 'weekly') {
  // 1. Determine time range
  const timeRange = getTimeRange(type);

  // 2. Calculate metrics
  const metrics = await calculateMetrics(timeRange);

  // 3. Collect work items
  const workItems = await collectWorkItems(timeRange);

  // 4. Identify blockers
  const blockers = await identifyBlockers();

  // 5. Generate report
  const report = await renderTemplate('nav-status-report-tmpl.md', {
    project_name: await getProjectName(),
    report_period: formatPeriod(timeRange),
    report_type: type,
    metrics,
    workItems,
    blockers
  });

  // 6. Save
  const path = await saveReport(report, type);

  return {
    reportPath: path,
    metrics
  };
}
```

## Related

- **Agent:** @navigator (Vega)
- **Template:** nav-status-report-tmpl.md
