# Pattern Audit Checklist

**Purpose:** Validate audit results before consolidation
**Agent:** Brad (Design System Architect)
**References:** audit-codebase.md task

---

## SCAN COMPLETENESS

- [ ] All UI file types detected (React, Vue, HTML, CSS)
- [ ] Scan completed without critical errors
- [ ] Total file count matches expectations
- [ ] No permission errors blocking scan

---

## PATTERN DETECTION

### Buttons
- [ ] Button instances counted accurately
- [ ] Unique button patterns identified
- [ ] Redundancy factor calculated (instances / unique)
- [ ] Most-used buttons captured

### Colors
- [ ] Hex colors extracted (#RGB, #RRGGBB)
- [ ] RGB/RGBA colors extracted
- [ ] Total unique colors counted
- [ ] Top 10 most-used colors identified
- [ ] Redundancy factor calculated

### Spacing
- [ ] Padding values extracted
- [ ] Margin values extracted
- [ ] Unique spacing values counted

### Typography
- [ ] Font families identified
- [ ] Font sizes extracted
- [ ] Font weights counted

### Forms
- [ ] Input elements counted
- [ ] Form elements counted
- [ ] Unique patterns identified

---

## OUTPUT VALIDATION

- [ ] pattern-inventory.json generated
- [ ] JSON is valid and parseable
- [ ] All pattern types included
- [ ] Metadata complete (timestamp, scan path, file counts)
- [ ] .state.yaml created
- [ ] State file has valid YAML syntax
- [ ] Phase set to "audit_complete"

---

## METRICS VALIDATION

- [ ] Redundancy factors >1 (indicates duplication)
- [ ] Pattern counts seem reasonable (not artificially inflated)
- [ ] No zero counts for major pattern types (unless truly zero)

---

## NEXT STEPS DECISION

**If redundancy factors >3x:**
- ✅ Proceed to *consolidate
- Significant pattern reduction opportunity

**If redundancy factors <2x:**
- ⚠️ Codebase is relatively clean
- Consider if design system is worth investment

**If colors >50 or buttons >20:**
- 🚨 Major technical debt
- Strong candidate for consolidation

---

**Reviewer:** ________ **Date:** ________
**Audit Quality:** [ ] Excellent [ ] Good [ ] Needs Review

---

## Scoring

| Category | Items | Weight |
|----------|-------|--------|
| Scan Completeness | 4 | 25% |
| Pattern Detection (Buttons) | 4 | 15% |
| Pattern Detection (Colors) | 5 | 15% |
| Pattern Detection (Spacing, Typography, Forms) | 8 | 15% |
| Output Validation | 7 | 20% |
| Metrics Validation | 3 | 10% |

**Minimum passing score:** 75%
**Blocking items (MUST pass regardless of overall score):**
- Scan completed without critical errors
- pattern-inventory.json generated
- JSON is valid and parseable

### Remediation Guide

| Failed Item | Fix |
|-------------|-----|
| Permission errors blocking scan | Run scan with elevated permissions or exclude restricted directories; document exclusions in scan metadata |
| pattern-inventory.json not generated | Verify scan script completed without early termination; check output directory exists and is writable |
| Invalid JSON output | Run `node -e "JSON.parse(require('fs').readFileSync('pattern-inventory.json'))"` to locate parse error; fix malformed entries |
| Zero counts for major pattern types | Verify file type detection regex covers project conventions (e.g., .jsx vs .tsx); expand scan globs if needed |
| Metadata incomplete | Ensure scan script populates timestamp, scan path, and file counts; check template fields in scan output config |
