# QA Review Checklist

> **Mental Model Applied:** Context-Driven Testing + Rapid Software Testing heuristics

## Pre-Review Setup

- [ ] Story/requirement understood and clarified
- [ ] Acceptance criteria are testable and measurable
- [ ] Test environment is available and stable
- [ ] Test data is prepared
- [ ] Access credentials are verified

## Functional Testing

### Core Functionality
- [ ] Happy path scenarios verified
- [ ] Edge cases identified and tested
- [ ] Boundary conditions validated
- [ ] Error handling behaves correctly
- [ ] Input validation works as expected

### Integration Points
- [ ] API responses match expected schema
- [ ] Database changes persist correctly
- [ ] Third-party integrations function
- [ ] Event triggers fire correctly
- [ ] Webhooks deliver payloads

### User Experience
- [ ] UI matches design specifications
- [ ] Navigation flows are intuitive
- [ ] Loading states are present
- [ ] Error messages are user-friendly
- [ ] Accessibility requirements met (WCAG)

## Non-Functional Testing

### Performance
- [ ] Page load times acceptable (<3s)
- [ ] API response times acceptable (<500ms)
- [ ] No memory leaks detected
- [ ] Resource usage is reasonable

### Security
- [ ] Authentication required where expected
- [ ] Authorization rules enforced
- [ ] Input sanitization in place
- [ ] No sensitive data in logs
- [ ] HTTPS enforced

### Compatibility
- [ ] Chrome - latest version
- [ ] Firefox - latest version
- [ ] Safari - latest version
- [ ] Mobile responsive design
- [ ] Tablet responsive design

## Test Documentation

### Test Coverage
- [ ] Test cases created in Xray
- [ ] Tests linked to requirements
- [ ] Coverage report generated
- [ ] Gaps documented

### Results Recording
- [ ] Test execution created
- [ ] All tests executed
- [ ] Failures documented with steps to reproduce
- [ ] Screenshots/evidence attached

## Bug Reporting (if issues found)

For each bug:
- [ ] Clear summary/title
- [ ] Steps to reproduce documented
- [ ] Expected vs actual result stated
- [ ] Environment details included
- [ ] Severity and priority assessed
- [ ] Screenshots/videos attached
- [ ] Linked to test case

## Sign-off

### Quality Gates
- [ ] All critical tests passed
- [ ] No blocking bugs remain
- [ ] No high-severity bugs remain
- [ ] Code coverage meets threshold (>80%)
- [ ] Performance benchmarks met

### Documentation
- [ ] Test report created in Confluence
- [ ] Stakeholders notified via Teams/Email
- [ ] Jira tickets updated with results

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| QA Lead | | | |
| Dev Lead | | | |
| Product Owner | | | |

---

## Commands

```bash
# Create test execution
@xray *create-execution --project PROJ --summary "QA Review - [Feature Name]"

# Generate coverage report
@xray *coverage-report --testPlan PROJ-100

# Create Confluence report
@confluence *from-template --template qa-review-report --space QA

# Notify team
@o365 *send-teams --channel QA-Updates --message "QA Review complete for [Feature]"
```

---

*Enterprise QA DevOps Squad - QA Review Checklist v1.0*
