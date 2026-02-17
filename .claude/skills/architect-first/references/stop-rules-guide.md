# Stop Rules Remediation Guide

When a stop rule is triggered, HALT immediately and follow the remediation steps below.

## Stop Rule 1: Capability Loss Detected

**Trigger**: New design/implementation loses functionality vs baseline.

### Symptoms
- Feature count decreased
- User workflow no longer supported
- Data/output granularity reduced
- Integration capability removed

### Remediation Steps

1. **Document the loss**
   - List specific capabilities lost
   - Compare with baseline (Gold Standard)
   - Quantify impact (users affected, use cases broken)

2. **Analyze root cause**
   - Why was capability lost?
   - Was it intentional or accidental?
   - What design decision caused the loss?

3. **Choose remediation path**

   **Option A: Restore capability**
   - Redesign to include lost functionality
   - Extend architecture to support both old and new
   - Maintain backward compatibility

   **Option B: Justify and migrate**
   - Document explicit justification for removal
   - Get multi-stakeholder approval
   - Create migration path for affected users
   - Communicate change clearly

   **Option C: Revert design**
   - Roll back to previous architecture
   - Restart design process with capability preservation in mind

4. **Validate restoration**
   - Feature comparison table shows parity
   - All baseline capabilities present
   - No user workflows broken

---

## Stop Rule 2: Structural Decision Without Multi-Agent Validation

**Trigger**: Architectural change proposed/implemented without PO/Architect/User validation.

### Symptoms
- Design document created unilaterally
- Code implementation started before approval
- Major refactoring without stakeholder review
- Module boundaries changed without validation

### Remediation Steps

1. **HALT implementation**
   - Stop all coding immediately
   - Preserve current work in feature branch
   - Document current state

2. **Prepare validation package**
   - Create architecture document
   - Present A/B/C options with trade-offs
   - Document decision rationale
   - Include impact analysis

3. **Multi-agent validation sequence**
   - **Product Owner**: Business alignment, user value, priority
   - **Architect**: Technical soundness, scalability, security
   - **User/Stakeholder**: Final decision and approval

4. **Document decision**
   - Create Architecture Decision Record (ADR)
   - Use template: `assets/adr-template.md`
   - Record context, decision, consequences
   - File in project documentation

5. **Proceed only after approval**
   - All stakeholders signed off
   - Decision documented
   - Team aligned on approach

---

## Stop Rule 3: Coupling Between Modules

**Trigger**: Dependencies detected between modules that should be independent.

### Symptoms
- Hardcoded import paths to other modules
- Direct file system references across modules
- Shared state between expansion packs
- Module A cannot run without Module B

### Remediation Steps

1. **Run coupling check**
   ```bash
   python scripts/check_coupling.py
   ```
   - Identify all coupling violations
   - Document dependency graph
   - Classify coupling type (tight/loose)

2. **Design decoupling strategy**
   - Define clean interfaces
   - Externalize cross-module references to YAML
   - Implement dependency injection
   - Create adapter/bridge patterns if needed

3. **Implement zero-coupling**
   - Remove hardcoded dependencies
   - Use configuration-based discovery
   - Implement plugin architecture if appropriate
   - Each module must be independently executable

4. **Validate independence**
   - Test each module in isolation
   - Verify configuration-based integration
   - Re-run coupling check script
   - Document integration points

---

## Stop Rule 4: Missing Architectural Documentation

**Trigger**: Implementation started without complete architectural documentation.

### Symptoms
- No architecture diagrams
- Component interactions unclear
- Data flows undocumented
- Integration points not specified

### Remediation Steps

1. **HALT implementation**
   - Stop all coding
   - Preserve work in progress
   - Switch to documentation mode

2. **Complete architecture documentation**
   - Use template: `assets/architecture-template.md`
   - Create required diagrams:
     - System architecture diagram
     - Component interaction diagram
     - Data flow diagram
     - Deployment diagram (if applicable)

3. **Document details**
   - Component responsibilities
   - API contracts
   - Data schemas
   - Configuration requirements
   - Integration points

4. **Review and validate**
   - Multi-agent validation of architecture
   - Documentation completeness check
   - Team understanding verified

5. **Resume implementation**
   - Only after documentation complete
   - Only after validation approved
   - With clear architectural guidance

---

## Stop Rule 5: Quick & Dirty Code Without Test Plan

**Trigger**: "Ugly" or rushed code written without test coverage or logging.

### Symptoms
- Code written quickly without tests
- No logging or observation points
- No debugging hooks
- Quality escape hatch abused

### Remediation Steps

1. **Acknowledge the escape hatch rules**
   - Quick code is ONLY acceptable WITH tests
   - "Ugly" code requires comprehensive test coverage
   - Temporary imperfection needs safety net

2. **Define test plan**
   - Identify test cases for current code
   - Write unit tests for critical paths
   - Add integration tests for workflows
   - Set coverage targets

3. **Add logging/observation**
   - Identify key decision points
   - Add strategic log statements
   - Include error context in logs
   - Add debugging hooks

4. **Implement tests BEFORE continuing**
   - Write tests for existing code first
   - Verify tests pass
   - Achieve minimum coverage
   - Only then continue implementation

5. **Optional: Refactor**
   - If tests provide safety net, can refactor
   - Improve code quality incrementally
   - Maintain test coverage during refactoring

---

## Stop Rule 6: Hardcoded Mutable Configuration

**Trigger**: Configuration values hardcoded in source instead of externalized to YAML.

### Symptoms
- Paths hardcoded in source files
- Thresholds as magic numbers
- API endpoints as string literals
- Module names hardcoded in imports

### Remediation Steps

1. **Identify all hardcoded values**
   - Scan code for literals
   - List all configuration points
   - Classify by mutability (will this change?)

2. **Create YAML configuration schema**
   - Use template: `assets/config-template.yaml`
   - Define structure for all config values
   - Specify defaults
   - Document each configuration option

3. **Refactor to use configuration**
   - Replace hardcoded values with config lookups
   - Implement configuration loader
   - Add configuration validation
   - Test with different configurations

4. **Document configuration**
   - Create configuration guide
   - Provide example configurations
   - Document override mechanisms
   - Include validation rules

---

## General Remediation Process

For any stop rule violation:

1. **HALT**: Stop all implementation immediately
2. **ASSESS**: Understand the violation and its scope
3. **PLAN**: Choose remediation strategy
4. **VALIDATE**: Get approval for remediation approach
5. **EXECUTE**: Implement remediation
6. **VERIFY**: Confirm stop rule no longer triggered
7. **DOCUMENT**: Record what happened and how it was fixed
8. **RESUME**: Continue with validated approach

---

## Prevention

To avoid stop rule triggers:

- **Use checklists**: `pre-implementation-checklist.md` and `architecture-checklist.md`
- **Validate early**: Multi-agent review before coding
- **Run scripts**: `check_coupling.py`, `validate_risk_mitigation.py`
- **Document first**: Architecture before implementation
- **Test always**: Define test plan before coding
- **Config everything**: YAML for all mutable values

---

## Escalation

If remediation is unclear or complex:

1. Document the situation completely
2. Present to team/stakeholders
3. Request guidance on remediation path
4. Do NOT proceed without clear resolution
5. Update this guide with new remediation patterns
