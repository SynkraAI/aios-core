# Release Checklist

> **Mental Model Applied:** Three Ways of DevOps (Flow, Feedback, Learning) + Antifragility

## Phase 1: Pre-Release Preparation

### Code Readiness
- [ ] All features for release are merged to main
- [ ] No work-in-progress code included
- [ ] Feature flags configured correctly
- [ ] Code freeze in effect

### Version Management
- [ ] Version number updated (semantic versioning)
- [ ] Changelog updated with all changes
- [ ] Release notes drafted
- [ ] Jira fix version created and assigned

### Dependencies
- [ ] All dependencies updated and tested
- [ ] Security vulnerabilities scanned
- [ ] License compliance verified
- [ ] No deprecated packages in use

## Phase 2: Testing Verification

### Automated Testing
- [ ] Unit tests passing (>90% pass rate)
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Performance tests within thresholds

```bash
# Run full test suite
@xray *import-junit --file test-results.xml --project PROJ --testPlan PROJ-100

# Check coverage
@xray *coverage-report --testPlan PROJ-100
```

### Manual Testing
- [ ] Smoke tests executed
- [ ] Regression tests completed
- [ ] Exploratory testing session done
- [ ] UAT sign-off obtained

### Test Results
- [ ] All critical bugs resolved
- [ ] Known issues documented
- [ ] Test report generated
- [ ] Coverage meets threshold (>85%)

## Phase 3: Infrastructure Preparation

### Environment
- [ ] Staging environment tested
- [ ] Production environment prepared
- [ ] Database migrations ready
- [ ] Rollback procedure documented

### Monitoring
- [ ] Alerts configured
- [ ] Dashboards ready
- [ ] Log aggregation working
- [ ] Health check endpoints verified

### Backup
- [ ] Database backup completed
- [ ] Configuration backup completed
- [ ] Rollback scripts tested
- [ ] Recovery procedure documented

## Phase 4: Deployment

### Go/No-Go Decision
- [ ] Test results reviewed
- [ ] Security scan passed
- [ ] Performance benchmarks met
- [ ] Stakeholder approval obtained

```bash
# Schedule go/no-go meeting
@o365 *create-event \
  --title "Release [VERSION] Go/No-Go" \
  --date "[DATE]" \
  --time "15:00" \
  --attendees '["qa@company.com", "dev@company.com", "devops@company.com"]' \
  --isOnline
```

### Deployment Execution
- [ ] Deployment window scheduled
- [ ] Team on standby
- [ ] Deployment script executed
- [ ] Database migrations applied

### Verification
- [ ] Smoke tests passed in production
- [ ] Critical paths verified
- [ ] No errors in logs
- [ ] Monitoring shows healthy state

## Phase 5: Post-Release

### Communication
- [ ] Release notes published
- [ ] Stakeholders notified
- [ ] Support team informed
- [ ] External communication sent (if applicable)

```bash
# Publish release notification
@o365 *send-teams \
  --team Engineering \
  --channel Releases \
  --message "🚀 Release [VERSION] deployed to production"

# Create Confluence release notes
@confluence *from-template \
  --template release-notes-template \
  --space PROJ \
  --title "Release [VERSION]"
```

### Documentation
- [ ] Release notes in Confluence
- [ ] API documentation updated
- [ ] User documentation updated
- [ ] Internal wiki updated

### Cleanup
- [ ] Jira version marked as released
- [ ] Old feature branches deleted
- [ ] Staging environment reset
- [ ] Temporary resources cleaned up

## Phase 6: Monitoring (First 24 Hours)

### Health Checks
- [ ] Hour 1: Initial monitoring check
- [ ] Hour 4: Extended monitoring check
- [ ] Hour 12: Half-day review
- [ ] Hour 24: Full-day review

### Metrics to Watch
- [ ] Error rates (should be <0.1%)
- [ ] Response times (should be stable)
- [ ] CPU/Memory usage (should be normal)
- [ ] User complaints (should be minimal)

### Incident Response
- [ ] On-call engineer assigned
- [ ] Escalation path defined
- [ ] Rollback decision criteria set
- [ ] Communication templates ready

## Emergency Rollback Procedure

If issues are detected:

1. **Assess** - Determine severity (P1-P4)
2. **Communicate** - Alert stakeholders
3. **Decision** - Rollback vs hotfix
4. **Execute** - Run rollback procedure
5. **Verify** - Confirm system is stable
6. **Document** - Create incident report

```bash
# Create incident
@jira *create-issue \
  --project PROJ \
  --type "Incident" \
  --summary "Release [VERSION] - Rollback Required" \
  --priority "Highest"
```

## Sign-off

| Phase | Approver | Date | Status |
|-------|----------|------|--------|
| Code Readiness | Dev Lead | | ⬜ |
| Testing | QA Lead | | ⬜ |
| Infrastructure | DevOps | | ⬜ |
| Go/No-Go | Product Owner | | ⬜ |
| Deployment | Release Manager | | ⬜ |
| Post-Release | All | | ⬜ |

---

*Enterprise QA DevOps Squad - Release Checklist v1.0*
