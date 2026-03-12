# Pre-Implementation Checklist

Use this checklist before writing any code to ensure architectural validation is complete.

## Architecture Validation

- [ ] **Architecture documented and validated?**
  - [ ] Architecture diagrams created
  - [ ] Component interactions defined
  - [ ] Data flows mapped
  - [ ] Integration points identified
  - [ ] Multi-agent validation completed
  - [ ] Architecture Decision Record (ADR) written

## Core Use Case Definition

- [ ] **Core use case clearly defined?**
  - [ ] Primary user workflow documented
  - [ ] Success criteria specified
  - [ ] Acceptance criteria written
  - [ ] Edge cases identified
  - [ ] Error scenarios mapped

## Configuration Externalization

- [ ] **Configuration externalized to YAML?**
  - [ ] All mutable values identified
  - [ ] YAML schema defined
  - [ ] Default configuration created
  - [ ] Configuration validation rules specified
  - [ ] No hardcoded values in planned implementation
  - [ ] Configuration documentation written

## Test Strategy

- [ ] **Test strategy defined?**
  - [ ] Test plan written
  - [ ] Unit test cases identified
  - [ ] Integration test scenarios defined
  - [ ] Coverage targets set
  - [ ] Test data requirements identified

## Logging Strategy

- [ ] **Logging/observation points identified?**
  - [ ] Key decision points for logging marked
  - [ ] Log levels assigned
  - [ ] Error handling points identified
  - [ ] Debugging hooks planned
  - [ ] Monitoring requirements specified

## Dependencies

- [ ] **Dependencies validated?**
  - [ ] All required libraries/packages identified
  - [ ] Version compatibility verified
  - [ ] License compliance checked
  - [ ] Zero-coupling maintained (no hardcoded cross-module deps)

## Documentation Plan

- [ ] **Documentation plan ready?**
  - [ ] API documentation outline created
  - [ ] Usage examples planned
  - [ ] Configuration guide outline created
  - [ ] "How to customize" focus maintained

## Implementation Readiness

- [ ] **Ready to implement?**
  - [ ] All above checklist items completed
  - [ ] Team has clear understanding of architecture
  - [ ] First coding task identified
  - [ ] Code review process established

---

## Quality Escape Hatch Acknowledgment

**Remember**: Code quality is negotiable IF backed by tests.

You may proceed with:
- ✓ "Ugly" code WITH comprehensive tests
- ✓ Quick implementation WITH test plan + logging
- ✓ 80% feature completeness IF core case works

You must NOT proceed with:
- ✗ "Ugly" code WITHOUT tests
- ✗ Hardcoded mutable values
- ✗ Implementation without core case defined

---

## Stop Rules Check

Before proceeding, verify NONE of these conditions are true:

- ⛔ Capability loss vs baseline
- ⛔ Structural decision without multi-agent validation
- ⛔ Coupling between modules
- ⛔ Missing architectural documentation
- ⛔ Quick & dirty code WITHOUT test plan and logs
- ⛔ Hardcoded mutable configuration values

**If any stop rule triggered**: HALT and remediate before coding.

---

## Approval

**Pre-Implementation Checklist Completed**: [ ] YES [ ] NO

**Approved to Start Coding**: [ ] YES [ ] NO

**Approver**: _________________ Date: _______

**First Task**: _________________________________________________

**Estimated Completion**: _______
