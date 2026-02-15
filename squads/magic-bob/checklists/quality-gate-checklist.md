---
checklist: Quality Gate Review
description: Phase 4 quality gate checklist with segregated reviewer (quality_gate ≠ executor)
responsavel: "@bob-guardian"
atomic_layer: checklist
version: 1.0.0
---

# Quality Gate Checklist (Phase 4)

Independent code review by segregated quality_gate agent. Enforces **quality_gate ≠ executor** principle.

---

## Pre-Review Validation

### Segregation Enforcement (EC4.1)

- [ ] **QG001**: Identify executor from Phase 2
- [ ] **QG002**: Select quality_gate agent (must be ≠ executor)
- [ ] **QG003**: Validate segregation rule enforced

#### Executor → Quality Gate Mapping

```javascript
const qualityGateMapping = {
  'dev': 'architect',
  'data-engineer': 'dev',
  'architect': 'dev',
  'devops': 'architect',
  'po': 'architect',
};

function assignQualityGate(executor) {
  const qualityGate = qualityGateMapping[executor];

  if (!qualityGate) {
    throw new Error(`No quality gate mapping for executor: ${executor}`);
  }

  if (qualityGate === executor) {
    throw new Error(`VIOLATION: quality_gate cannot equal executor`);
  }

  return qualityGate;
}
```

### Story Context Loading

- [ ] **QG004**: Load story file successfully
- [ ] **QG005**: Load all acceptance criteria
- [ ] **QG006**: Load Phase 2 implementation notes
- [ ] **QG007**: Load Phase 3 CodeRabbit report (if available)

---

## Review Checklist

### 1. Acceptance Criteria (EC4.2)

**Requirement:** All acceptance criteria met and verifiable

- [ ] **AC001**: Count total acceptance criteria in story
- [ ] **AC002**: Verify each AC is addressed in implementation
- [ ] **AC003**: Validate AC completion claims with actual code
- [ ] **AC004**: Check for missed or partially implemented ACs

#### Validation Code

```javascript
async validateAcceptanceCriteria(story, implementation) {
  const acs = story.acceptanceCriteria;
  const results = [];

  for (const ac of acs) {
    const verification = await this._verifyAC(ac, implementation);
    results.push({
      ac: ac.text,
      met: verification.met,
      evidence: verification.evidence,
      notes: verification.notes,
    });
  }

  const allMet = results.every(r => r.met);

  return {
    passed: allMet,
    totalAcs: acs.length,
    metCount: results.filter(r => r.met).length,
    details: results,
    message: allMet
      ? `✓ All ${acs.length} acceptance criteria met`
      : `✗ ${results.filter(r => !r.met).length} AC(s) not met`,
  };
}
```

### 2. Code Quality (EC4.3)

**Requirement:** No major quality issues detected

- [ ] **CQ001**: Linting passes (npm run lint)
- [ ] **CQ002**: TypeScript passes (npm run typecheck)
- [ ] **CQ003**: No code smells (long functions, deep nesting)
- [ ] **CQ004**: Meaningful variable/function names
- [ ] **CQ005**: No commented-out code blocks
- [ ] **CQ006**: No debug console.log() statements left
- [ ] **CQ007**: Code follows project coding standards

#### Code Smells Detection

```javascript
async detectCodeSmells(files) {
  const smells = [];

  for (const file of files) {
    const content = await fs.readFile(file, 'utf8');

    // Check function length (> 50 lines)
    const longFunctions = this._findLongFunctions(content);
    if (longFunctions.length > 0) {
      smells.push({
        file,
        type: 'long_function',
        count: longFunctions.length,
        severity: 'medium',
      });
    }

    // Check nesting depth (> 4 levels)
    const deepNesting = this._findDeepNesting(content);
    if (deepNesting.length > 0) {
      smells.push({
        file,
        type: 'deep_nesting',
        count: deepNesting.length,
        severity: 'medium',
      });
    }

    // Check for commented code
    const commentedCode = this._findCommentedCode(content);
    if (commentedCode.length > 0) {
      smells.push({
        file,
        type: 'commented_code',
        count: commentedCode.length,
        severity: 'low',
      });
    }
  }

  return {
    passed: smells.filter(s => s.severity === 'high').length === 0,
    smells,
    message: smells.length > 0
      ? `Found ${smells.length} code smell(s)`
      : '✓ No code smells detected',
  };
}
```

### 3. Architecture Patterns (EC4.4)

**Requirement:** Follows patterns documented in architecture.md

- [ ] **AP001**: Load project architecture.md
- [ ] **AP002**: Identify patterns declared in architecture
- [ ] **AP003**: Validate implementation follows patterns
- [ ] **AP004**: Check for pattern violations or anti-patterns

#### Architecture Validation

```javascript
async validateArchitectureCompliance(implementation, architecture) {
  const patterns = architecture.patterns || [];
  const violations = [];

  // Check component structure
  if (patterns.includes('layered-architecture')) {
    const layerViolations = this._checkLayerBoundaries(implementation);
    violations.push(...layerViolations);
  }

  // Check naming conventions
  if (architecture.namingConventions) {
    const namingViolations = this._checkNamingConventions(
      implementation,
      architecture.namingConventions
    );
    violations.push(...namingViolations);
  }

  // Check import/export patterns
  if (architecture.importRules) {
    const importViolations = this._checkImportRules(
      implementation,
      architecture.importRules
    );
    violations.push(...importViolations);
  }

  return {
    passed: violations.length === 0,
    violations,
    message: violations.length > 0
      ? `${violations.length} architecture violation(s) found`
      : '✓ Architecture patterns followed',
  };
}
```

### 4. Security Review (EC4.5)

**Requirement:** OWASP Top 10 check passed

- [ ] **SEC001**: No SQL injection vulnerabilities
- [ ] **SEC002**: No XSS vulnerabilities
- [ ] **SEC003**: No insecure direct object references
- [ ] **SEC004**: No sensitive data exposure
- [ ] **SEC005**: No broken authentication/authorization
- [ ] **SEC006**: Input validation present
- [ ] **SEC007**: Output encoding/escaping used
- [ ] **SEC008**: No hardcoded secrets or credentials

#### OWASP Top 10 Scanner

```javascript
async scanOWASPTop10(files) {
  const vulnerabilities = [];

  for (const file of files) {
    const content = await fs.readFile(file, 'utf8');

    // A01: Broken Access Control
    const accessControlIssues = this._scanAccessControl(content);
    vulnerabilities.push(...accessControlIssues);

    // A02: Cryptographic Failures
    const cryptoIssues = this._scanCryptography(content);
    vulnerabilities.push(...cryptoIssues);

    // A03: Injection (SQL, NoSQL, Command)
    const injectionIssues = this._scanInjection(content);
    vulnerabilities.push(...injectionIssues);

    // A04: Insecure Design
    const designIssues = this._scanInsecureDesign(content);
    vulnerabilities.push(...designIssues);

    // A05: Security Misconfiguration
    const configIssues = this._scanSecurityConfig(content);
    vulnerabilities.push(...configIssues);

    // A07: XSS (A06 skipped: outdated components checked elsewhere)
    const xssIssues = this._scanXSS(content);
    vulnerabilities.push(...xssIssues);

    // A08: Software Integrity Failures
    const integrityIssues = this._scanIntegrity(content);
    vulnerabilities.push(...integrityIssues);

    // A09: Logging Failures
    const loggingIssues = this._scanLogging(content);
    vulnerabilities.push(...loggingIssues);

    // A10: SSRF
    const ssrfIssues = this._scanSSRF(content);
    vulnerabilities.push(...ssrfIssues);
  }

  const critical = vulnerabilities.filter(v => v.severity === 'CRITICAL');
  const high = vulnerabilities.filter(v => v.severity === 'HIGH');

  return {
    passed: critical.length === 0 && high.length === 0,
    vulnerabilities,
    criticalCount: critical.length,
    highCount: high.length,
    message: critical.length > 0
      ? `⛔ ${critical.length} CRITICAL security issue(s)`
      : high.length > 0
      ? `⚠️ ${high.length} HIGH security issue(s)`
      : '✓ No critical/high security issues',
  };
}
```

#### Common Security Patterns

```javascript
// ✅ APPROVED - Parameterized query
const result = await db.query('SELECT * FROM users WHERE id = ?', [userId]);

// ❌ REJECTED - SQL injection
const result = await db.query(`SELECT * FROM users WHERE id = ${userId}`);

// ✅ APPROVED - Sanitized output
const safeHtml = escapeHtml(userInput);

// ❌ REJECTED - XSS risk
const html = `<div>${userInput}</div>`;

// ✅ APPROVED - Secrets from env
const apiKey = process.env.API_KEY;

// ❌ REJECTED - Hardcoded secret
const apiKey = 'sk_live_1234567890abcdef';
```

### 5. Test Coverage (Implicit from Phase 2)

**Requirement:** Tests written and passing

- [ ] **TEST001**: Unit tests exist for new code
- [ ] **TEST002**: Test coverage ≥ 80% for new code
- [ ] **TEST003**: All tests pass (npm test)
- [ ] **TEST004**: Edge cases tested
- [ ] **TEST005**: Error paths tested

**Note:** This was already validated in Phase 2 (EC2.3), but quality gate double-checks.

### 6. Documentation (EC4.4 sub-check)

**Requirement:** Code is self-documenting or has adequate comments

- [ ] **DOC001**: Complex logic has explanatory comments
- [ ] **DOC002**: Public APIs have JSDoc/TSDoc
- [ ] **DOC003**: README updated if new features added
- [ ] **DOC004**: Story file updated with implementation notes

---

## Review Decision (EC4.6)

### Decision Matrix

```javascript
async makeReviewDecision(validationResults) {
  const {
    acceptanceCriteria,
    codeQuality,
    architecture,
    security,
    tests,
  } = validationResults;

  // CRITICAL failures → auto-reject
  if (security.criticalCount > 0) {
    return {
      decision: 'REJECTED',
      reason: 'critical_security_issues',
      mustFix: security.vulnerabilities.filter(v => v.severity === 'CRITICAL'),
      message: `⛔ REJECTED: ${security.criticalCount} CRITICAL security issue(s) must be fixed`,
    };
  }

  // Acceptance criteria not met → reject
  if (!acceptanceCriteria.passed) {
    return {
      decision: 'REJECTED',
      reason: 'acceptance_criteria_not_met',
      details: acceptanceCriteria.details.filter(ac => !ac.met),
      message: `⛔ REJECTED: ${acceptanceCriteria.totalAcs - acceptanceCriteria.metCount} AC(s) not met`,
    };
  }

  // Tests failing → reject
  if (!tests.passed) {
    return {
      decision: 'REJECTED',
      reason: 'tests_failing',
      details: tests.failures,
      message: `⛔ REJECTED: ${tests.failures.length} test(s) failing`,
    };
  }

  // HIGH security issues → reject (but not critical)
  if (security.highCount > 0) {
    return {
      decision: 'REJECTED',
      reason: 'high_security_issues',
      mustFix: security.vulnerabilities.filter(v => v.severity === 'HIGH'),
      message: `⚠️ REJECTED: ${security.highCount} HIGH security issue(s) should be fixed`,
    };
  }

  // Architecture violations → reject
  if (!architecture.passed) {
    return {
      decision: 'REJECTED',
      reason: 'architecture_violations',
      details: architecture.violations,
      message: `⚠️ REJECTED: ${architecture.violations.length} architecture violation(s)`,
    };
  }

  // Code quality issues → warning, but may approve
  if (!codeQuality.passed) {
    const highSeverity = codeQuality.smells.filter(s => s.severity === 'high');

    if (highSeverity.length > 0) {
      return {
        decision: 'REJECTED',
        reason: 'code_quality_issues',
        details: highSeverity,
        message: `⚠️ REJECTED: ${highSeverity.length} high-severity code smell(s)`,
      };
    }

    // Low/medium smells → approve with feedback
    return {
      decision: 'APPROVED',
      feedback: `Approved with minor code quality suggestions: ${codeQuality.message}`,
      suggestions: codeQuality.smells,
    };
  }

  // All checks passed → approve
  return {
    decision: 'APPROVED',
    message: '✅ APPROVED: All quality gates passed',
  };
}
```

---

## Feedback Documentation (EC4.7)

**Requirement:** If rejected, document feedback clearly

- [ ] **FB001**: Identify specific issues that caused rejection
- [ ] **FB002**: Provide actionable feedback for each issue
- [ ] **FB003**: Suggest concrete fixes or improvements
- [ ] **FB004**: Update story file with review feedback

### Feedback Format

```javascript
async documentFeedback(reviewDecision, storyId) {
  const feedback = {
    story: storyId,
    reviewer: this.agentName,
    decision: reviewDecision.decision,
    timestamp: new Date().toISOString(),
    issues: [],
    suggestions: [],
  };

  // Document all issues
  if (reviewDecision.mustFix) {
    feedback.issues = reviewDecision.mustFix.map(issue => ({
      severity: issue.severity,
      type: issue.type,
      location: issue.file || issue.location,
      description: issue.description,
      suggestedFix: issue.fix || 'See documentation',
    }));
  }

  // Document improvement suggestions
  if (reviewDecision.suggestions) {
    feedback.suggestions = reviewDecision.suggestions;
  }

  // Write to story file
  await this._appendToStory(storyId, feedback);

  // Log to observability
  this._log(`Review ${reviewDecision.decision} for story ${storyId}`, 'info');

  return feedback;
}
```

### Feedback Output Example

```markdown
## Quality Gate Review (Phase 4)

**Reviewer:** @architect (quality_gate for @dev)
**Decision:** ❌ REJECTED
**Date:** 2026-02-15T14:30:00Z

### Issues Found

1. **CRITICAL - SQL Injection** (src/auth/login.js:42)
   - User input directly concatenated into SQL query
   - Fix: Use parameterized query or ORM
   - Reference: OWASP A03:2021

2. **HIGH - Missing Input Validation** (src/api/user.js:18)
   - Email not validated before database insertion
   - Fix: Add email validation with regex or validator library
   - Reference: OWASP A04:2021

3. **AC NOT MET** - AC3: "User receives email confirmation"
   - No email sending logic found in implementation
   - Fix: Implement email sending in registration flow

### Next Steps

1. Fix CRITICAL security issue (SQL injection)
2. Add input validation
3. Implement missing AC3 (email confirmation)
4. Re-run Phase 2 → 3 → 4

**Attempt:** 1 / 3
**Return to:** PHASE 2 (DEVELOPMENT)
```

---

## Max Attempts & Surface to Human

**Max Attempts:** 3

- [ ] **MA001**: Track attempt count for current story
- [ ] **MA002**: Increment attempt on each REJECTED decision
- [ ] **MA003**: If attempt = 3 → surface to human

### Surface Message (3rd Failure)

```javascript
if (attemptCount >= 3) {
  return {
    success: false,
    action: 'surface_to_user',
    data: {
      message: `⚠️ QUALITY GATE falhou 3 vezes.

Story: ${storyId}
Reviewer: ${qualityGate}

Issues persistentes:
${formatIssues(reviewDecision.mustFix)}

O que deseja fazer?

1. 🔧 Corrigir manualmente
2. ⏭️  Pular esta story
3. 🛑 Abortar sessão

Sua escolha (1-3):`,
      options: ['manual_fix', 'skip_story', 'abort_session'],
    },
  };
}
```

---

## Output Validation

### APPROVED Decision

```javascript
{
  success: true,
  decision: 'APPROVED',
  reviewer: '@architect',
  executor: '@dev',
  segregationEnforced: true,
  allCriteriaMet: true,
  feedback: {
    message: '✅ All quality gates passed',
    minorSuggestions: [
      'Consider extracting parseUserData() to separate module'
    ],
  },
  nextPhase: 5, // PUSH
}
```

### REJECTED Decision

```javascript
{
  success: false,
  decision: 'REJECTED',
  reviewer: '@architect',
  executor: '@dev',
  segregationEnforced: true,
  reason: 'critical_security_issues',
  issues: [
    {
      severity: 'CRITICAL',
      type: 'sql_injection',
      file: 'src/auth/login.js',
      line: 42,
      fix: 'Use parameterized queries',
    }
  ],
  attemptCount: 1,
  maxAttempts: 3,
  nextAction: 'return_to_phase_2',
}
```

---

## Integration with BobOrchestrator

```javascript
async executePhase4QualityGate(context) {
  // Enforce segregation
  const executor = context.workflow.current_executor;
  const qualityGate = this.assignQualityGate(executor);

  this._log(`Quality gate: ${qualityGate} reviewing ${executor}'s work`, 'info');

  // Load story and implementation
  const story = await this._loadStory(context.storyId);
  const implementation = await this._loadImplementation(context);

  // Run all validation checks
  const validationResults = {
    acceptanceCriteria: await this.validateAcceptanceCriteria(story, implementation),
    codeQuality: await this.detectCodeSmells(implementation.files),
    architecture: await this.validateArchitectureCompliance(implementation, context.architecture),
    security: await this.scanOWASPTop10(implementation.files),
    tests: { passed: context.phase2Results.testsPassed }, // From Phase 2
  };

  // Make review decision
  const decision = await this.makeReviewDecision(validationResults);

  // Document feedback if rejected
  if (decision.decision === 'REJECTED') {
    await this.documentFeedback(decision, context.storyId);
  }

  // Check max attempts
  const attemptCount = (context.phase4Attempts || 0) + 1;

  if (decision.decision === 'REJECTED' && attemptCount >= 3) {
    return this._surfaceToHuman(context, decision);
  }

  return {
    success: decision.decision === 'APPROVED',
    decision,
    qualityGate,
    executor,
    attemptCount,
  };
}
```

---

## Related

- **Agent:** bob-guardian.md (Phase 4 reviewer)
- **Checklist:** phase-exit-criteria.md (EC4.1-EC4.7)
- **Workflow:** story-development-cycle.yaml (Phase 4 spec)
- **Module:** bob-orchestrator.js (quality gate executor)

---

**Average Review Time:** 20-30 minutes
**Max Attempts:** 3
**Segregation:** ✅ ALWAYS enforced (quality_gate ≠ executor)

**Last Updated:** 2026-02-15
