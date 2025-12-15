# AIOS-FullStack Technical Debt Register

**Last Updated**: 2025-10-29
**Owner**: Development Team
**Review Frequency**: Monthly

---

## Purpose

This document tracks technical debt, code quality issues, and future improvements identified during development and QA reviews. Each item includes severity, impact assessment, and recommended timeline for resolution.

---

## Active Technical Debt

### TD-001: Pre-existing ESLint Errors in Codebase
**Identified By**: Quinn (Test Architect) during Story 2.2 QA Review
**Date Identified**: 2025-01-23
**Severity**: LOW
**Impact**: Code quality and consistency
**Status**: 🔴 OPEN

**Description**:
The codebase contains pre-existing ESLint errors that were not introduced by Story 2.2 but affect overall code quality metrics. These errors exist in various files throughout the project.

**Impact Assessment**:
- Does not affect Story 2.2 implementation functionality
- Creates noise in development workflow
- May confuse new contributors
- Affects perception of code quality

**Recommended Resolution**:
Create a cleanup story (Story 2.4 or 3.x) to systematically address ESLint errors:
1. Run `npm run lint` to identify all errors
2. Categorize by severity and fix approach
3. Use `npm run lint -- --fix` for auto-fixable issues
4. Manually fix remaining issues
5. Update ESLint config if patterns need adjustment

**Estimated Effort**: 2-3 story points
**Suggested Timeline**: Q1 2025 (before v1.0 release)
**Related Stories**: Story 2.2 (identified during QA)
**Related Gate**: docs/qa/gates/2.2-git-workflow-implementation.yml

---

### TD-002: Empty Test File Placeholders
**Identified By**: Quinn (Test Architect) during Story 2.2 QA Review
**Date Identified**: 2025-01-23
**Severity**: MEDIUM
**Impact**: Test coverage metrics and developer clarity
**Status**: 🔴 OPEN

**Description**:
Many test files exist in the codebase as empty placeholders (e.g., `*.test.js` files with no test cases). This was likely done to establish test file structure but creates confusion and affects coverage metrics.

**Impact Assessment**:
- Skews test coverage metrics (files exist but have no tests)
- Creates confusion about what is actually tested
- May lead to false sense of test coverage
- Clutters test directory structure

**Recommended Resolution**:
Create a test coverage improvement story (Story 2.5 or 3.x):
1. Audit all test files to identify empty placeholders
2. For each file, decide: populate with tests OR remove placeholder
3. Prioritize critical paths for test implementation
4. Remove placeholders that aren't needed yet
5. Document test coverage gaps in this register

**Estimated Effort**: 5-8 story points
**Suggested Timeline**: Q1 2025
**Related Stories**: Story 2.2 (identified during QA)
**Related Gate**: docs/qa/gates/2.2-git-workflow-implementation.yml

---

## Future Improvements (from Story 2.2)

### FI-001: Visual Workflow Diagrams in Documentation
**Identified By**: Quinn (Test Architect) during Story 2.2 QA Review
**Date Identified**: 2025-01-23
**Priority**: LOW
**Status**: 📋 PROPOSED

**Description**:
Add visual diagrams to documentation showing the Git workflow and 3-layer validation architecture. Current documentation is comprehensive but text-heavy.

**Benefits**:
- Faster onboarding for new developers
- Better understanding of Defense in Depth architecture
- Reduces cognitive load when learning workflow
- More engaging documentation

**Recommended Approach**:
1. Create Mermaid diagrams for:
   - Git workflow (branch → commit → push → PR → merge)
   - 3-layer validation flow (pre-commit → pre-push → CI/CD)
   - Hook execution sequence
2. Add to CONTRIBUTING.md and git-workflow-guide.md
3. Consider adding sequence diagrams for hook failures

**Estimated Effort**: 2 story points
**Suggested Timeline**: Q2 2025 (nice-to-have)
**Related Stories**: Story 2.2
**Potential Story ID**: Story 2.6 or 3.x

---

### FI-002: GitHub Actions Workflow End-to-End Test
**Identified By**: Quinn (Test Architect) during Story 2.2 QA Review
**Date Identified**: 2025-01-23
**Priority**: MEDIUM
**Status**: 📋 PROPOSED

**Description**:
Add end-to-end testing for the GitHub Actions CI/CD workflow. Currently, the workflow is manually reviewed but not automatically tested.

**Benefits**:
- Ensures CI/CD pipeline changes don't break validation
- Catches workflow syntax errors before merge
- Tests matrix strategy and job dependencies
- Validates parallel job execution

**Challenges**:
- Requires CI environment (can't test locally)
- May need test repository or branch
- Mock/stub considerations for actual GitHub API calls
- Execution time considerations

**Recommended Approach**:
1. Research GitHub Actions testing frameworks (act, nektos/act)
2. Create test workflow in `.github/workflows/test-ci.yml`
3. Test workflow syntax validation
4. Test job execution order
5. Consider using test repository for E2E validation

**Estimated Effort**: 5 story points
**Suggested Timeline**: Q2 2025
**Related Stories**: Story 2.2
**Potential Story ID**: Story 3.x (Phase 3 - Testing)

---

### FI-003: Branch Protection Script Production Execution
**Identified By**: Quinn (Test Architect) during Story 2.2 QA Review
**Date Identified**: 2025-01-23
**Priority**: HIGH
**Status**: 🟡 READY FOR EXECUTION

**Description**:
Execute the branch protection setup script (`scripts/setup-branch-protection.js`) in the production environment to enforce validation requirements on master branch.

**Requirements**:
- Admin access to repository
- GitHub CLI authenticated with proper permissions
- Backup of current branch protection rules (if any)
- Verification of organization membership for required checks

**Recommended Approach**:
1. Review current branch protection rules: `gh api repos/:owner/:repo/branches/master/protection`
2. Verify GitHub CLI authentication: `gh auth status`
3. Backup current rules (if any)
4. Run script: `node scripts/setup-branch-protection.js`
5. Verify rules applied: Check GitHub repository settings
6. Test by attempting to push to master without PR

**Estimated Effort**: 1 story point (execution task, not development)
**Suggested Timeline**: IMMEDIATE (part of Story 2.2 completion)
**Related Stories**: Story 2.2 (AC4)
**Action Owner**: Repository Admin / DevOps

---

### FI-004: Address Resource Gaps - Create Missing Templates
**Identified By**: Quinn (Test Architect) during Story 2.7 QA Review
**Date Identified**: 2025-10-23
**Priority**: MEDIUM
**Status**: 📋 PROPOSED

**Description**:
Story 2.7's gap detection identified 7 medium-severity resource gaps where task workflows reference templates that don't exist in `.aios-core/templates/`. These templates need to be created to complete the resource layer.

**Benefits**:
- Completes the task workflow resource layer
- Prevents broken references during task execution
- Improves system cohesion and integrity
- Enables full workflow automation without manual template creation

**Gap Details**:
- **Location**: `outputs/architecture-map/gaps/task-resource-gaps.json`
- **Count**: 7 missing templates
- **Severity**: Medium (flagged with SHOULD_CREATE relationships)
- **Impact**: Task workflows currently cannot execute fully without these templates

**Recommended Approach**:
1. Review `outputs/architecture-map/gaps/task-resource-gaps.json` for complete list
2. For each missing template:
   - Determine template structure from task workflow references
   - Create template following AIOS template standards
   - Add to `.aios-core/templates/` directory
   - Update template registry if needed
3. Re-run Story 2.7 gap detection to verify resolution
4. Update task workflows if template paths need adjustment

**Estimated Effort**: 3-5 story points (depends on template complexity)
**Suggested Timeline**: Q1 2025 (after Epic 2 Architecture Audit complete)
**Related Stories**: Story 2.7 (identified during QA)
**Related Gate**: docs/qa/gates/2.7-tasks-workflows-analysis.yml
**Potential Story ID**: Story 2.14 or 3.x

---

### FI-005: Add Unit Tests for Task Workflow Parsing Functions
**Identified By**: Quinn (Test Architect) during Story 2.7 QA Review
**Date Identified**: 2025-10-23
**Priority**: LOW
**Status**: 📋 PROPOSED

**Description**:
Story 2.7 currently has excellent integration test coverage (25/25 tests passing, 100% success rate) but lacks dedicated unit tests for individual parsing functions (extractTemplateReferences, categorizeElicitation, etc.). Unit tests would improve test granularity and debugging capability for edge cases.

**Benefits**:
- Improved test granularity at function level
- Faster debugging when edge cases fail
- Better isolation of parsing logic issues
- Easier to test error handling for malformed inputs
- Clearer test failure messages (specific function vs integration flow)

**Functions Needing Unit Tests**:
- `extractTemplateReferences()` (parse-task-workflows.js:226-266)
- `categorizeElicitation()` (parse-task-workflows.js:172-188)
- `extractTaskMetadata()` (parsing logic)
- `buildTemplateUsageMap()` (relationship building)
- `detectResourceGaps()` (gap detection logic)
- `buildTaskRelationships()` (relationship graph construction)

**Recommended Approach**:
1. Create `tests/unit/parse-task-workflows.test.js`
2. For each function:
   - Test happy path with valid input
   - Test edge cases (empty input, malformed syntax, missing fields)
   - Test error handling (invalid regex, undefined variables)
   - Test boundary conditions (very long strings, special characters)
3. Aim for 80%+ code coverage on parsing functions
4. Use Jest or similar test framework for unit testing
5. Keep integration tests as-is (they validate end-to-end flow)

**Estimated Effort**: 3 story points
**Suggested Timeline**: Q2 2025 (nice-to-have, not blocking)
**Related Stories**: Story 2.7
**Related Gate**: docs/qa/gates/2.7-tasks-workflows-analysis.yml
**Related Files**: `outputs/architecture-map/schemas/parse-task-workflows.js`
**Potential Story ID**: Story 3.x (Phase 3 - Testing Improvements)

---

### FI-006: Investigate Low Elicitation Point Count in Task Workflows
**Identified By**: Quinn (Test Architect) during Story 2.7 QA Review
**Date Identified**: 2025-10-23
**Priority**: LOW
**Status**: 📋 PROPOSED

**Description**:
Story 2.7's elicitation analysis found only 1 elicitation point total across 46 task workflows. This may indicate that most task workflows are not sufficiently interactive and lack user-guided execution opportunities.

**Current State**:
- **Total Tasks Analyzed**: 46 workflows
- **Total Elicitation Points**: 1 (categorized as user_input)
- **Location**: `outputs/architecture-map/tasks/elicitation-analysis.json`
- **Issue**: Very low ratio (2.2% of tasks have elicitation points)

**Potential Root Causes**:
1. **Detection Issue**: Parser may not be recognizing elicitation patterns correctly
2. **Documentation Issue**: Workflows may have elicitation logic but not marked explicitly
3. **Design Issue**: Workflows may be designed as fully automated (no user input)
4. **Pattern Issue**: Elicitation points may use different syntax not captured by parser

**Benefits of Resolution**:
- More interactive and user-guided workflow execution
- Better alignment with AIOS's interactive elicitation philosophy
- Improved user experience (users guide complex decisions)
- Enhanced workflow flexibility and customization

**Recommended Approach**:
**Phase 1: Investigation (2 SP)**
1. Manual review of 10 sample task workflows to identify:
   - Patterns that should be elicitation points but aren't detected
   - Workflows that are intentionally fully automated
   - New elicitation patterns not covered by parser regex
2. Review `categorizeElicitation()` function regex patterns
3. Determine: Parser issue vs Design issue

**Phase 2: Resolution (3-5 SP depending on findings)**
- **If Parser Issue**: Update regex patterns in `categorizeElicitation()`, re-run analysis
- **If Design Issue**: Create story to add elicitation points to key workflows
- **If Pattern Issue**: Document new patterns and update parser

**Estimated Effort**: 2 SP (investigation) + 3-5 SP (resolution) = 5-7 SP total
**Suggested Timeline**: Q2 2025 (after Epic 2 complete)
**Related Stories**: Story 2.7
**Related Gate**: docs/qa/gates/2.7-tasks-workflows-analysis.yml
**Related Files**:
- `outputs/architecture-map/tasks/elicitation-analysis.json`
- `outputs/architecture-map/schemas/parse-task-workflows.js:172-188`
**Potential Story ID**: Story 3.x (investigation), Story 3.x+1 (resolution)

---

### FI-007: Add CSV Parsing Library for Robust Gap Report Processing
**Identified By**: Quinn (Test Architect) during Story 3.25 QA Review
**Date Identified**: 2025-10-29
**Priority**: LOW
**Status**: 📋 PROPOSED

**Description**:
The trend report generator (`generate-trend-report.js`) currently uses manual CSV parsing with string splitting. This approach is fragile and required a bug fix during QA review when column alignment was incorrect.

**Benefits**:
- More robust CSV parsing (handles escaped commas, quotes)
- Reduces risk of parsing bugs as CSV format evolves
- Better error messages for malformed CSV
- Industry-standard library (csv-parse) is well-tested

**Recommended Approach**:
1. Add `csv-parse` package to dependencies
2. Update `loadGapBacklog()` function to use csv-parse
3. Remove manual string splitting logic
4. Add tests for edge cases (escaped commas, quotes in descriptions)

**Estimated Effort**: 0.5 SP (30-60 minutes)
**Suggested Timeline**: Next technical debt sprint (low priority)
**Related Stories**: Story 3.25
**Related Gate**: docs/qa/gates/3.25-quarterly-architecture-gap-audit.yml
**Related Files**: `outputs/architecture-map/schemas/generate-trend-report.js:39-64`

---

### FI-008: Add Unit Tests for Trend Analysis Edge Cases
**Identified By**: Quinn (Test Architect) during Story 3.25 QA Review
**Date Identified**: 2025-10-29
**Priority**: MEDIUM
**Status**: 📋 PROPOSED

**Description**:
The trend analysis script (`generate-trend-report.js`) has comprehensive functionality but no unit tests. Testing would improve confidence in:
- Delta calculation logic
- Percentage change calculation (especially with zero baseline)
- Category aggregation
- Top offenders ranking
- ASCII chart generation edge cases

**Benefits**:
- Catch regression bugs before production
- Ensure correct behavior with edge cases (zero gaps, first audit, large deltas)
- Improve maintainability for future enhancements
- Document expected behavior through tests

**Recommended Approach**:
1. Create `tests/trend-analysis.test.js`
2. Test cases for:
   - First audit (no historical data)
   - Zero gaps scenario
   - Large gap increases/decreases
   - Category aggregation with various inputs
   - Top offenders with ties
3. Mock file system operations
4. Aim for >80% code coverage

**Estimated Effort**: 2-3 SP (4-6 hours)
**Suggested Timeline**: Q1 2025 (before next quarterly audit)
**Related Stories**: Story 3.25
**Related Gate**: docs/qa/gates/3.25-quarterly-architecture-gap-audit.yml
**Related Files**: 
- `outputs/architecture-map/schemas/generate-trend-report.js` (402 lines)
- `tests/` (new test file)

---

### FI-009: Add Asciichart Library for Better Trend Visualizations
**Identified By**: James (@dev) in Story 3.25 dev_notes, confirmed by Quinn during QA Review
**Date Identified**: 2025-10-29
**Priority**: LOW
**Status**: 📋 PROPOSED

**Description**:
The current ASCII chart implementation is basic and functional but could be enhanced with the `asciichart` library for more professional visualizations. This was noted in the original dev notes for Story 3.25.

**Benefits**:
- More polished chart appearance in reports
- Better scaling for large gap counts
- Support for multiple data series (e.g., comparing categories)
- Reduced maintenance burden (library handles edge cases)

**Recommended Approach**:
1. Add `asciichart` package to dependencies
2. Replace `generateASCIIChart()` function with asciichart usage
3. Maintain same input/output format
4. Test with historical data (Q4 2025 baseline)
5. Optionally: Add color support if reports support it

**Estimated Effort**: 1 SP (2 hours)
**Suggested Timeline**: Q2 2025 (cosmetic enhancement, low priority)
**Related Stories**: Story 3.25
**Related Gate**: docs/qa/gates/3.25-quarterly-architecture-gap-audit.yml
**Related Files**: 
- `outputs/architecture-map/schemas/generate-trend-report.js:146-189` (generateASCIIChart function)
- `package.json` (add dependency)

**Dev Notes Reference**: `docs/stories/epic-3-gap-remediation/3.25-quarterly-architecture-gap-audit.yaml:310-313`

---

## Resolved Technical Debt

*(No items yet - this section will track completed debt resolution)*

---

## Debt Metrics

| Metric | Value | Target |
|--------|-------|--------|
| Active Technical Debt Items | 2 | < 5 |
| Open Future Improvements | 9 | - |
| Total Estimated Effort | 24.5-32.5 SP | < 35 SP |
| High Priority Items | 1 | < 2 |
| Medium Priority Items | 4 | - |
| Low Priority Items | 6 | - |

**Health Status**: 🟢 HEALTHY
- Debt is manageable and well-documented
- All items have clear ownership and timelines
- No critical/blocker debt items
- Future improvements are prioritized appropriately
- New items from Story 3.25 QA review properly tracked (FI-007, FI-008, FI-009)

---

## Review Schedule

### Monthly Review (Last Monday of Month)
**Participants**: Dev Lead, QA Lead, Product Owner
**Agenda**:
1. Review status of all open debt items
2. Prioritize new items identified during the month
3. Update effort estimates based on team capacity
4. Move resolved items to "Resolved" section
5. Adjust timelines if needed

### Quarterly Planning (End of Quarter)
**Participants**: Full Development Team
**Agenda**:
1. Allocate story points for debt resolution
2. Schedule debt reduction sprints
3. Set quarterly debt reduction targets
4. Review debt health metrics

---

## Contributing to This Register

### When to Add an Item
- QA review identifies code quality issues
- Developer encounters technical debt during implementation
- Code review surfaces improvement opportunities
- Performance profiling reveals optimization needs

### Item Template
```markdown
### TD-XXX: Brief Title
**Identified By**: Name/Role
**Date Identified**: YYYY-MM-DD
**Severity**: LOW|MEDIUM|HIGH|CRITICAL
**Impact**: Brief impact description
**Status**: 🔴 OPEN | 🟡 IN PROGRESS | 🟢 RESOLVED

**Description**: Full description of the debt

**Impact Assessment**: Why it matters

**Recommended Resolution**: How to fix it

**Estimated Effort**: X story points
**Suggested Timeline**: When to address
**Related Stories**: Story references
```

---

## References

- [Backlog Prioritization](./backlog-prioritization.md)
- [Story 2.2 QA Gate](./qa/gates/2.2-git-workflow-implementation.yml)
- [Story 2.2 Implementation](./stories/2.2-git-workflow-implementation.yaml)
- [CONTRIBUTING.md](../CONTRIBUTING.md)

---

*Technical Debt Register - Maintained by AIOS-FullStack Development Team*
