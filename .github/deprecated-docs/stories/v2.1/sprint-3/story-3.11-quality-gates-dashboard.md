# STORY 3.11: Quality Gates Dashboard

**ID:** 3.11 | **Epic:** [EPIC-S3](../../../epics/epic-s3-quality-templates.md)
**Sprint:** 3 | **Points:** 8 | **Priority:** 🟠 High | **Created:** 2025-01-19
**Updated:** 2025-12-03
**Status:** 📋 Draft

**Reference:** [Decisão 4 - Quality Gates](../../../audits/PEDRO-DECISION-LOG.md#decisão-4)

**Predecessor:** Stories 3.1-3.5 (All Quality Gates layers) ⏳

---

## User Story

**Como** tech lead,
**Quero** dashboard visual dos Quality Gates,
**Para que** possa monitorar métricas de qualidade em tempo real e identificar tendências.

---

## Acceptance Criteria

### Dashboard UI
- [ ] AC3.11.1: Dashboard mostra métricas das 3 layers em cards separados
- [ ] AC3.11.2: Cada layer mostra pass rate, avg time, total runs
- [ ] AC3.11.3: Layer 2 mostra breakdown de CodeRabbit + Quinn findings
- [ ] AC3.11.4: Trends chart mostra auto-catch rate ao longo do tempo
- [ ] AC3.11.5: Dashboard é responsivo (mobile-friendly)

### Data Collection
- [ ] AC3.11.6: Métricas coletadas automaticamente de runs anteriores
- [ ] AC3.11.7: Dados armazenados em JSON file (não precisa de DB)
- [ ] AC3.11.8: Histórico mantido por 30 dias

### Real-time Updates
- [ ] AC3.11.9: Dashboard atualiza sem refresh manual
- [ ] AC3.11.10: Status de saúde do CodeRabbit (local + GitHub App)

### Accessibility
- [ ] AC3.11.11: Dashboard segue WCAG 2.1 AA
- [ ] AC3.11.12: Cores com contraste adequado para daltonismo

---

## Scope

### Technology Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Frontend | React + Vite | Fast dev, familiar stack |
| Charts | Chart.js | Lightweight, accessible |
| Styling | Tailwind CSS | Rapid UI development |
| Data | JSON file | Simple, no DB required |
| Hosting | Static (local/GitHub Pages) | No server required |

### Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│  🎯 Quality Gates Dashboard                    [🔄 Refresh] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Layer 1    │  │  Layer 2    │  │  Layer 3    │         │
│  │  Pre-Commit │  │  PR Review  │  │  Human      │         │
│  │             │  │             │  │             │         │
│  │  Pass: 95%  │  │  Pass: 82%  │  │  Pass: 91%  │         │
│  │  Time: 3.2s │  │  Time: 2.1m │  │  Time: 28m  │         │
│  │  Runs: 1240 │  │  Runs: 234  │  │  Runs: 156  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  📈 Auto-Catch Rate Trend (30 days)                    ││
│  │  [Line chart showing 78% current, trending up]         ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌──────────────────────┐  ┌───────────────────────────────┐│
│  │  🤖 CodeRabbit       │  │  🔍 Quinn (QA Agent)         ││
│  │                      │  │                               ││
│  │  Local: ✅ Active    │  │  Findings: 156                ││
│  │  GitHub: ✅ Active   │  │  Top: logic, tests, criteria  ││
│  │  Findings: 234       │  │                               ││
│  │  Top: complexity,    │  │                               ││
│  │       security,      │  │                               ││
│  │       performance    │  │                               ││
│  └──────────────────────┘  └───────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Data Structure

```javascript
// .aios-core/data/quality-gates-metrics.json
{
  "lastUpdated": "2025-12-03T10:30:00Z",
  "layer1": {
    "passRate": 0.95,
    "avgTime": "3.2s",
    "totalRuns": 1240,
    "history": [
      { "date": "2025-12-01", "passRate": 0.94, "runs": 45 },
      { "date": "2025-12-02", "passRate": 0.96, "runs": 52 }
    ]
  },
  "layer2": {
    "passRate": 0.82,
    "avgTime": "2.1min",
    "totalRuns": 234,
    "autoCatchRate": 0.78,
    "coderabbit": {
      "localActive": true,
      "githubAppActive": true,
      "findingsCount": 234,
      "topIssues": ["complexity", "security", "performance"],
      "severityBreakdown": {
        "critical": 12,
        "high": 45,
        "medium": 89,
        "low": 88
      }
    },
    "quinn": {
      "findingsCount": 156,
      "topIssues": ["logic", "tests", "criteria"]
    }
  },
  "layer3": {
    "avgReviewTime": "28min",
    "approvalRate": 0.91,
    "totalReviews": 156
  },
  "trends": {
    "autoCatchRate": [
      { "date": "2025-11-03", "rate": 0.65 },
      { "date": "2025-11-10", "rate": 0.70 },
      { "date": "2025-11-17", "rate": 0.74 },
      { "date": "2025-11-24", "rate": 0.76 },
      { "date": "2025-12-01", "rate": 0.78 }
    ]
  }
}
```

---

## Tasks

### Design (4h)
- [ ] 3.11.1: Design dashboard UI
  - [ ] 3.11.1.1: Create wireframe/mockup
  - [ ] 3.11.1.2: Define color palette (accessibility-friendly)
  - [ ] 3.11.1.3: Define responsive breakpoints
  - [ ] 3.11.1.4: Get stakeholder approval on design

### Implementation (12h)
- [ ] 3.11.2: Implement data collection (5h)
  - [ ] 3.11.2.1: Create metrics collector script
  - [ ] 3.11.2.2: Hook into pre-commit runs
  - [ ] 3.11.2.3: Hook into CodeRabbit CLI output
  - [ ] 3.11.2.4: Create JSON aggregation logic
- [ ] 3.11.3: Create visualization components (5h)
  - [ ] 3.11.3.1: Layer cards component
  - [ ] 3.11.3.2: Trend line chart (Chart.js)
  - [ ] 3.11.3.3: CodeRabbit/Quinn status cards
  - [ ] 3.11.3.4: Responsive layout
- [ ] 3.11.4: Implement real-time updates (2h)
  - [ ] 3.11.4.1: File watcher for metrics.json
  - [ ] 3.11.4.2: Auto-refresh mechanism

### Deployment (3h)
- [ ] 3.11.5: Deploy dashboard
  - [ ] 3.11.5.1: Build production bundle
  - [ ] 3.11.5.2: Configure GitHub Pages (or local server)
  - [ ] 3.11.5.3: Document access URL

### Testing (5h)
- [ ] 3.11.6: Test with real data
  - [ ] 3.11.6.1: E2E tests for dashboard
  - [ ] 3.11.6.2: Accessibility audit (axe-core)
  - [ ] 3.11.6.3: Mobile responsiveness test
  - [ ] 3.11.6.4: Performance test (Lighthouse)

**Total Estimated:** 24h (~3 days)

---

## Dev Notes

### Project Location
`tools/quality-dashboard/` (new directory)

### Directory Structure
```
tools/quality-dashboard/
├── src/
│   ├── components/
│   │   ├── LayerCard.jsx
│   │   ├── TrendChart.jsx
│   │   ├── StatusCard.jsx
│   │   └── Dashboard.jsx
│   ├── hooks/
│   │   └── useMetrics.js
│   ├── App.jsx
│   └── main.jsx
├── public/
│   └── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

### Metrics Collection Script
```javascript
// .aios-core/scripts/collect-quality-metrics.js
const fs = require('fs');
const path = require('path');

class MetricsCollector {
  constructor() {
    this.metricsFile = '.aios-core/data/quality-gates-metrics.json';
  }

  async recordPreCommitRun(result) {
    const metrics = await this.load();
    metrics.layer1.totalRuns++;
    if (result.passed) {
      metrics.layer1.passRate = this.recalculatePassRate(
        metrics.layer1.passRate,
        metrics.layer1.totalRuns,
        true
      );
    }
    metrics.layer1.avgTime = this.updateAvgTime(
      metrics.layer1.avgTime,
      result.duration
    );
    await this.save(metrics);
  }

  async recordCodeRabbitRun(result) {
    // Similar for Layer 2
  }

  async recordHumanReview(result) {
    // Similar for Layer 3
  }
}

module.exports = { MetricsCollector };
```

### Testing

| Test ID | Name | Type | Priority |
|---------|------|------|----------|
| DASH-01 | Dashboard renders all 3 layer cards | E2E | P0 |
| DASH-02 | Trend chart displays correctly | E2E | P0 |
| DASH-03 | CodeRabbit status shows correct state | E2E | P0 |
| DASH-04 | Mobile layout works (375px) | E2E | P1 |
| DASH-05 | Accessibility audit passes (axe-core) | E2E | P0 |
| DASH-06 | Lighthouse performance > 90 | Performance | P1 |
| DASH-07 | Metrics collector records pre-commit | Unit | P0 |
| DASH-08 | Auto-refresh updates data | E2E | P1 |

---

## 🤖 CodeRabbit Integration

### Story Type Analysis

**Primary Type:** Frontend
**Secondary Type(s):** Infrastructure, Data Visualization
**Complexity:** High (new application with multiple components)

### Specialized Agent Assignment

**Primary Agents:**
- @dev: Full implementation
- @ux-expert: UI/UX review

**Supporting Agents:**
- @qa: E2E testing, accessibility audit

### Quality Gate Tasks

- [ ] Pre-Commit (@dev): Run DASH-01 to DASH-08 tests
- [ ] Pre-PR (@github-devops): Lighthouse audit, bundle size check
- [ ] Pre-Deployment (@github-devops): Production build validation

### Self-Healing Configuration

**Expected Self-Healing:**
- Primary Agent: @dev (light mode)
- Max Iterations: 2
- Timeout: 15 minutes
- Severity Filter: CRITICAL, HIGH

**Predicted Behavior:**
- CRITICAL issues: Auto-fix (accessibility, security)
- HIGH issues: Auto-fix (performance, responsive)

### Focus Areas

**Primary Focus:**
- Accessibility (WCAG 2.1 AA)
- Performance (Lighthouse > 90)
- Responsive design

**Secondary Focus:**
- Chart rendering correctness
- Data refresh reliability

---

## Dependencies

**Depends on:**
- Story 3.1 (Pre-Commit Hooks) ✅
- Story 3.3-3.4 (PR Automation) ⏳
- Story 3.5 (Human Review) ⏳

**Blocks:**
- Story 3.12 (Documentation Sprint 3)

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Dashboard deployed and accessible
- [ ] DASH-01 to DASH-08 tests pass
- [ ] Lighthouse score > 90
- [ ] Accessibility audit passes
- [ ] QA Review passed
- [ ] PR created and approved

---

## Dev Agent Record

_To be populated during implementation_

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-01-19 | 1.0 | Story created (in bundled file) | River |
| 2025-12-03 | 2.0 | Separated into individual story file with tech stack | Pax (@po) |

---

## QA Results

_To be populated after implementation_

---

**Created by:** River 🌊
**Validated by:** Pax 🎯 (PO)
