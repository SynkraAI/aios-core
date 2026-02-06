---
name: architect-first
description: Guide for implementing the Architect-First development philosophy - perfect architecture, pragmatic execution, quality guaranteed by tests. Use this skill when starting new features, refactoring systems, or when architectural decisions are needed. Enforces non-negotiables like complete design/documentation before code, zero coupling, and validation by multiple perspectives before structural decisions.
---

# Architect First

## Overview

This skill embodies the "Architect-First" development philosophy: **Perfect architecture, pragmatic execution, quality guaranteed by tests**. Apply this skill when making architectural decisions, starting new features, refactoring existing systems, or when quality gates need to be enforced.

The core principle: **Architecture and documentation are non-negotiable and must precede implementation. Code quality is negotiable IF backed by tests as a safety net (escape hatch).**

## Core Philosophy

### Mantra
"Arquitetura perfeita, execução pragmática, qualidade garantida por testes"

### Quality Gates

**Non-Negotiable (STOP if violated):**
- **Architecture**: Complete design and documentation BEFORE any code
- **Documentation**: Must precede and accompany implementation
- **Capability Preservation**: Never lose capability/granularity vs previous versions
- **Zero Coupling**: Expansion packs must be independent
- **Multi-Agent Validation**: Structural decisions validated by PO/Architect/User

**Negotiable (with escape hatch):**
- **Code Style**: Acceptable if backed by tests as safety net
- **Feature Completeness**: 80% acceptable IF core use case works
- **Quick & Dirty Code**: Allowed ONLY with test plan and minimal logging

### Decision Modes

**Architect-First Mode (default):**
- Design and document completely before coding
- Map structure and pointers before proposing implementation
- Validate architecture with multiple agents/perspectives
- Externalize all mutable configurations to YAML

**Fast Mode (post-validation only):**
- Binary decisions and rapid delegation
- Activated ONLY after architectural validation is complete
- Speed through automation, not shortcuts

## Workflow Decision Tree

```
New Task/Feature Request
    ↓
┌──────────────────────────────────────┐
│ Is this a structural/architectural   │
│ decision?                            │
└──────────────────────────────────────┘
    ↓ YES                    ↓ NO
    ↓                        ↓
[Architecture Flow]    [Execution Flow]
```

### Architecture Flow (Structural Decisions)

**STOP and follow this sequence:**

1. **Map Before Modify**
   - Document current state completely
   - Identify all dependencies and touch points
   - Create architectural diagrams/flows
   - Load `references/architecture-checklist.md` for validation

2. **Multi-Agent Validation**
   - Present A/B/C options with explicit trade-offs
   - Get validation from:
     - Product Owner (business alignment)
     - Architect (technical soundness)
     - User (final decision)
   - Document decision rationale

3. **Design Documentation**
   - Complete design document BEFORE code
   - Include:
     - System architecture diagrams
     - Component interactions
     - Data flows
     - Configuration schema (YAML)
     - Integration points
   - Use templates from `assets/architecture-template.md`

4. **Gold Standard Baseline**
   - Ensure new design meets/exceeds capability baseline
   - Validate: Does this maintain ALL previous capabilities?
   - STOP if capability loss detected → restore or redesign

5. **Zero Coupling Validation**
   - Run validation script: `scripts/check_coupling.py`
   - Ensure expansion pack independence
   - No hardcoded cross-module dependencies

6. **Proceed to Implementation**
   - Now and only now: write code
   - Follow execution flow for implementation

### Execution Flow (Implementation)

1. **Pre-Implementation Checklist**
   - [ ] Architecture documented and validated?
   - [ ] Core use case clearly defined?
   - [ ] Configuration externalized to YAML?
   - [ ] Test strategy defined?
   - Use `references/pre-implementation-checklist.md`

2. **Test-Driven Safety Net**
   - Define test plan FIRST
   - Identify logging/observation points
   - Tests permit temporary imperfection (escape hatch)
   - Quality validation via: tests + logs + manual inspection

3. **Implementation Style**
   ```
   ACCEPTABLE:
   ✓ "Ugly" code WITH comprehensive tests
   ✓ 80% feature completeness IF core case works
   ✓ Quick implementation WITH test plan + logging

   REJECTED:
   ✗ "Ugly" code WITHOUT tests
   ✗ Capability loss without explicit justification
   ✗ Hardcoded mutable values (must be YAML)
   ✗ Deployment without core case working
   ```

4. **Debugging Philosophy**
   - Observational via logs (console/logging) > static analysis
   - Add strategic log points before debugging
   - Inspect actual runtime behavior
   - Validate through execution, not just reading code

5. **Documentation**
   - Update docs as code evolves
   - Keep short and actionable: "How to customize"
   - Include code examples
   - Document configuration options

## Heuristics (Decision Rules)

Apply these heuristics when making decisions:

1. **Gold Standard Baseline**: 22 artifacts minimum (adjust to your context)
2. **Never Lose Capability**: Accumulate, never reduce
3. **Architect Before Build**: Design/docs before code, always
4. **Zero Coupling, Max Modularity**: Independent expansion packs
5. **Config > Hardcoding**: Externalize to YAML for all mutable values
6. **Map Before Modify**: Document structure before changing it
7. **Binary Decision Post-Validation**: Fast execution after architectural validation
8. **Speed via Automation**: Not via shortcuts or cutting corners
9. **Quality Escape Hatch**: Tests permit temporary imperfection

## Stop Rules (Hard Boundaries)

**STOP immediately if detecting:**

- ⛔ **Capability loss** vs baseline
- ⛔ **Structural decision** without multi-agent validation
- ⛔ **Coupling** between modules
- ⛔ **Missing architectural documentation**
- ⛔ **Quick & dirty code** WITHOUT test plan and logs
- ⛔ **Hardcoded** mutable configuration values

When stopped, consult `references/stop-rules-guide.md` for remediation.

## Risk Mitigation

Common risks and their mitigations:

| Risk | Mitigation Strategy |
|------|-------------------|
| Excessive planning | Time-box + mandatory POC before full formalization |
| Perfectionism cascade | Rule of 3: simple pilot → 2 iterations → formalize |
| Premature configuration | Generalize only after ≥2 real scenarios |
| Context switching | Checklist of pending items at each pivot |

Use `scripts/validate_risk_mitigation.py` to check risk mitigation coverage.

## Collaboration Contract

When working with this skill, follow these collaboration patterns:

✓ **Do:**
- Present A/B/C options with explicit trade-offs
- Map structure and pointers before proposing code
- Externalize configs in YAML; nothing mutable hardcoded
- Deliver short, actionable docs ("how to customize")
- For quick code: include test plan and log points
- Document pending items when pivoting

✗ **Don't:**
- Propose code without architectural context
- Hardcode values that might change
- Skip multi-agent validation on structural changes
- Write "quick & dirty" without tests
- Make architectural decisions unilaterally

## Acceptance Criteria

### Will Accept
- ✓ "Ugly" code WITH comprehensive tests
- ✓ 80% features IF core case covered
- ✓ Large refactors that increase flexibility
- ✓ Extensive documentation if it teaches customization

### Will Reject
- ✗ "Ugly" code WITHOUT tests
- ✗ Capability loss without explicit justification
- ✗ Hardcoded mutable values
- ✗ Deployment without core case working

## Unknown Areas (For Future Refinement)

Areas not yet fully defined in the philosophy:

- Hotfix philosophy (production emergencies)
- Performance thresholds (latency/throughput minimums)
- Code duplication tolerance (when to refactor)
- Observability targets (log levels, correlation, tracing)

When encountering these areas, apply the core heuristics and document decisions for future refinement.

## Resources

### scripts/
Validation and automation scripts:
- `check_coupling.py` - Validates zero-coupling principle
- `validate_risk_mitigation.py` - Checks risk coverage
- `architecture_validator.py` - Validates architectural completeness

### references/
Detailed checklists and guides:
- `architecture-checklist.md` - Complete architecture validation checklist
- `pre-implementation-checklist.md` - Pre-coding validation
- `stop-rules-guide.md` - Remediation guide when stop rules trigger
- `testing-strategy-guide.md` - Test-driven development patterns

### assets/
Templates for consistent outputs:
- `architecture-template.md` - Standard architecture document template
- `config-template.yaml` - Configuration externalization template
- `adr-template.md` - Architecture Decision Record template

## Quick Reference

**Starting a new feature:**
1. Map current architecture (`references/architecture-checklist.md`)
2. Design with A/B/C options
3. Multi-agent validation
4. Document architecture (`assets/architecture-template.md`)
5. Define tests
6. Implement with logging
7. Validate and iterate

**Making architectural changes:**
1. STOP - Do not code yet
2. Document current state completely
3. Present options with trade-offs
4. Get PO/Architect/User validation
5. Check coupling (`scripts/check_coupling.py`)
6. Document decision (`assets/adr-template.md`)
7. Now implement

**Quick implementation (with safety net):**
1. Pre-implementation checklist
2. Define test plan
3. Add log points
4. Implement (can be "ugly")
5. Verify tests pass
6. Inspect logs
7. Refactor if needed
