# Generate Phased Migration Strategy

> Task ID: brad-generate-migration-strategy
> Agent: Brad (Design System Architect)
> Version: 1.0.0

## Description

Create realistic 4-phase migration plan to gradually adopt design system without blocking sprints. Prioritizes high-impact patterns first, includes rollback procedures, tracks progress.

## Prerequisites

- Tokenization completed (*tokenize command run successfully)
- .state.yaml contains consolidation and token data
- Token files exist (tokens.yaml, exports)

## Workflow

### Interactive Elicitation

This task uses interactive elicitation to customize migration strategy.

1. **Assess Team Context**
   - Ask about team size and velocity
   - Current sprint length
   - Risk tolerance (conservative vs aggressive rollout)
   - Availability for migration work

2. **Review Pattern Priority**
   - Show most-used patterns (highest impact first)
   - Confirm prioritization strategy
   - Identify any must-have-first patterns

3. **Define Phase Timeline**
   - Estimate effort per phase
   - Map to sprint schedule
   - Set milestone dates
   - Confirm realistic timeline

### Steps

1. **Load Token and Consolidation Data**
   - Read .state.yaml for consolidation metrics
   - Load token locations
   - Identify pattern counts and reduction percentages
   - Validation: Tokenization phase completed

2. **Analyze Pattern Impact**
   - Calculate usage frequency for each pattern type
   - Identify highest-impact patterns (most instances)
   - Estimate migration effort per pattern
   - Prioritize by impact/effort ratio
   - Validation: Priority list created

3. **Design Phase 1: Foundation**
   - Goal: Deploy token system with zero visual changes
   - Tasks: Add token files, configure build, update CSS to use tokens
   - Risk: Low (no component changes)
   - Duration: 1 sprint
   - Validation: Phase plan defined

4. **Design Phase 2: High-Impact Patterns**
   - Goal: Replace most-used components for immediate ROI
   - Identify top 3 patterns (buttons, inputs, cards typically)
   - Calculate instances to migrate
   - Estimate effort and ROI
   - Risk: Medium
   - Duration: 2-3 sprints
   - Validation: High-impact patterns identified

5. **Design Phase 3: Long-Tail Cleanup**
   - Goal: Consolidate remaining patterns
   - List remaining components
   - Group by complexity
   - Estimate effort
   - Risk: Low (proven system exists)
   - Duration: 2-4 sprints
   - Validation: Cleanup plan created

6. **Design Phase 4: Enforcement**
   - Goal: Prevent regression
   - Add CI/CD pattern validation
   - Deprecate old components
   - Monitor adoption metrics
   - Risk: Low
   - Duration: 1 sprint
   - Validation: Enforcement strategy defined

7. **Create Component Mapping**
   - Generate old component → new component mapping
   - Document prop changes
   - Create migration snippets (find/replace patterns)
   - Validation: Complete mapping for all components

8. **Define Rollback Procedures**
   - Document rollback steps for each phase
   - Identify rollback trigger conditions
   - Ensure backups exist
   - Validation: Rollback plan documented

9. **Generate Migration Documentation**
   - Create migration-strategy.md (executive summary)
   - Create phase-specific guides (phase-1.md, phase-2.md, etc)
   - Generate component mapping file
   - Include code examples
   - Validation: Complete migration docs created

10. **Calculate ROI Timeline**
    - Estimate when ROI breakeven occurs
    - Project cumulative savings by phase
    - Show investment vs savings curve
    - Validation: ROI projection created

11. **Update State File**
    - Add migration section to .state.yaml
    - Record phase count, timeline, priorities
    - Update phase to "migration_strategy_complete"
    - Set ready_for_atlas flag
    - Validation: State updated for Atlas handoff

## Output

- **migration-strategy.md**: Executive summary with 4-phase plan
- **phase-1-foundation.md**: Detailed Phase 1 tasks
- **phase-2-high-impact.md**: Detailed Phase 2 tasks
- **phase-3-long-tail.md**: Detailed Phase 3 tasks
- **phase-4-enforcement.md**: Detailed Phase 4 tasks
- **component-mapping.json**: Old → new component map
- **migration-progress.yaml**: Progress tracking template
- **.state.yaml**: Updated with migration plan

### Output Format

```markdown
# Migration Strategy

## Executive Summary

**Target**: Adopt design system with >80% pattern reduction
**Timeline**: 6-8 sprints (12-16 weeks)
**Risk Level**: Medium (phased approach reduces risk)
**ROI Breakeven**: Phase 2 completion (~6 weeks)

## Phase 1: Foundation (1 sprint)

**Goal**: Deploy tokens, zero visual changes

**Tasks**:
- [ ] Add token files to project (tokens.yaml, exports)
- [ ] Configure build pipeline to process tokens
- [ ] Update existing CSS to use CSS custom properties
- [ ] No component changes yet

**Success Criteria**: Tokens deployed, no visual regressions

**Rollback**: Remove token files, revert CSS

## Phase 2: High-Impact Patterns (2-3 sprints)

**Goal**: Replace most-used components for immediate ROI

**Priorities**:
1. Button (327 instances → 3 variants) - 93% reduction
2. Input (189 instances → 5 variants) - 87% reduction
3. Card (145 instances → 2 variants) - 85% reduction

**Success Criteria**: Top 3 patterns migrated, measurable velocity improvement

**Rollback**: Component-level rollback, old components still available

## Phase 3: Long-Tail Cleanup (2-4 sprints)

**Goal**: Consolidate remaining patterns

**Tasks**:
- [ ] Forms (23 variations → 5)
- [ ] Modals (12 variations → 2)
- [ ] Navigation (8 variations → 3)

**Success Criteria**: >85% overall pattern consolidation achieved

## Phase 4: Enforcement (1 sprint)

**Goal**: Prevent regression

**Tasks**:
- [ ] Add CI/CD pattern validation
- [ ] Deprecate old components
- [ ] Block non-system patterns
- [ ] Monitor adoption metrics

**Success Criteria**: System enforced, adoption sustained
```

## Success Criteria

- [ ] 4 distinct phases defined with clear goals
- [ ] Phase 1 has zero visual changes (safe foundation)
- [ ] Phase 2 prioritizes highest-impact patterns
- [ ] Each phase has success criteria and rollback plan
- [ ] Timeline is realistic for team size/velocity
- [ ] Component mapping covers all patterns
- [ ] ROI breakeven projected accurately

## Error Handling

- **No tokenization data**: Exit with message to run *tokenize first
- **Cannot estimate timeline**: Use defaults, warn user to adjust
- **Insufficient pattern data**: Recommend re-running audit
- **Team context missing**: Use conservative defaults

## Security Considerations

- Migration scripts run with user permissions only
- Validate component mapping to prevent injection
- Backup files before any automated changes
- Rollback procedures tested before execution

## Examples

### Example 1: Migration Strategy Generation

```bash
*migrate
```

Output:
```
🔍 Brad: Generating phased migration strategy...

📊 Pattern Analysis:
  - Buttons: 327 instances (highest priority)
  - Inputs: 189 instances
  - Colors: 1247 usages

🗓️ MIGRATION PLAN (4 phases, 6-8 sprints):

Phase 1: Foundation (1 sprint)
  Deploy tokens, no visual changes
  Risk: LOW

Phase 2: High-Impact (2-3 sprints)
  Migrate Button, Input, Card
  Expected ROI: $31,200/month savings
  Risk: MEDIUM

Phase 3: Long-Tail (2-4 sprints)
  Cleanup remaining 15 patterns
  Risk: LOW

Phase 4: Enforcement (1 sprint)
  CI/CD validation, prevent regression
  Risk: LOW

💰 ROI Projection:
  Investment: ~$12,000
  Breakeven: Week 6 (Phase 2 complete)
  Year 1 Savings: $374,400

✅ Migration docs saved: outputs/design-system/my-app/migration/
✅ Ready for Atlas to build components
```

### Example 2: Component Mapping

```json
{
  "buttons": {
    ".btn-primary": "Button variant='primary'",
    ".button-primary": "Button variant='primary'",
    ".btn-main": "Button variant='primary'",
    ".btn-secondary": "Button variant='secondary'",
    ".btn-danger": "Button variant='destructive'"
  },
  "props_changed": {
    "Button": {
      "old": "type='primary'",
      "new": "variant='primary'"
    }
  }
}
```

## Notes

- Phase 1 must complete before Phase 2 (foundation required)
- High-impact patterns = most instances × easiest to migrate
- Rollback gets harder as system grows - do it early if needed
- CI/CD enforcement prevents regression (Phase 4 critical)
- Timeline assumes team works on migration alongside features
- Brad says: "Phased rollout = safe rollout. No big-bang rewrites."
- After this, hand off to Atlas: *agent atlas for component building
