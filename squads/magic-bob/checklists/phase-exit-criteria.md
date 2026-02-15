# Phase Exit Criteria

> **Process Absolutism:** Se executor CONSEGUE avançar sem completar → processo está errado

Este checklist define critérios obrigatórios de saída para cada fase do development cycle. Nenhuma fase pode avançar para a próxima sem validar TODOS os exit criteria.

---

## 🎯 Enforcement Philosophy

**Princípio:** Zero time gaps em handoffs

- Cada fase tem **exit criteria** explícitos
- BOB valida critérios ANTES de permitir avanço
- Falha em qualquer critério → BLOQUEIA transição
- Registro de tentativas → máximo 3 por fase

---

## PHASE 1: VALIDATION (@po)

**Owner:** @po (Pax)
**Duration:** ~10 min
**Purpose:** Validate story acceptance criteria and technical feasibility

### Exit Criteria

- [ ] **EC1.1:** Story file exists and is readable
- [ ] **EC1.2:** All acceptance criteria (ACs) are defined (minimum 3)
- [ ] **EC1.3:** Technical approach validated (no obvious blockers)
- [ ] **EC1.4:** Dependencies identified (no missing prerequisites)
- [ ] **EC1.5:** Executor assigned via ExecutorAssignment module
- [ ] **EC1.6:** Estimated duration documented (in story metadata)

### Validation Code

```javascript
async validatePhase1Exit(context) {
  const story = await this._loadStory(context.storyPath);

  const checks = {
    storyExists: fs.existsSync(context.storyPath),
    hasAcceptanceCriteria: story.acceptanceCriteria?.length >= 3,
    technicalApproach: story.technicalApproach !== undefined,
    dependenciesListed: story.dependencies !== undefined,
    executorAssigned: context.executor !== undefined,
    estimatedDuration: story.estimatedDuration !== undefined,
  };

  const failed = Object.entries(checks)
    .filter(([_, passed]) => !passed)
    .map(([criterion]) => criterion);

  if (failed.length > 0) {
    return {
      canAdvance: false,
      failedCriteria: failed,
      message: `❌ PHASE 1 EXIT BLOCKED\n\nFalhou: ${failed.join(', ')}\n\nCorreção necessária antes de avançar para DEVELOPMENT.`,
    };
  }

  return { canAdvance: true };
}
```

### Failure Recovery

| Failed Criterion | Action |
|------------------|--------|
| Story não existe | Criar story via @po *create-story |
| ACs insuficientes | @po adiciona acceptance criteria |
| Bloqueadores técnicos | Resolver dependências ou abortar |
| Executor não definido | Re-executar ExecutorAssignment |

---

## PHASE 2: DEVELOPMENT (executor)

**Owner:** Executor (assigned by ExecutorAssignment)
**Duration:** ~2 hours
**Purpose:** Implement story according to ACs

### Exit Criteria

- [ ] **EC2.1:** All acceptance criteria implemented
- [ ] **EC2.2:** Code follows project coding standards
- [ ] **EC2.3:** Unit tests written (minimum 80% coverage for new code)
- [ ] **EC2.4:** No linting errors (`npm run lint` passes)
- [ ] **EC2.5:** No TypeScript errors (`npm run typecheck` passes)
- [ ] **EC2.6:** Files staged in git (`git status` shows changes)
- [ ] **EC2.7:** Story file updated with implementation notes

### Validation Code

```javascript
async validatePhase2Exit(context) {
  const lintResult = await this._runLint();
  const typecheckResult = await this._runTypecheck();
  const testCoverage = await this._getTestCoverage();
  const gitStatus = await this._getGitStatus();
  const story = await this._loadStory(context.storyPath);

  const checks = {
    acsImplemented: story.implementationStatus === 'complete',
    lintPasses: lintResult.exitCode === 0,
    typecheckPasses: typecheckResult.exitCode === 0,
    coverageOk: testCoverage.newCodeCoverage >= 80,
    filesStaged: gitStatus.staged.length > 0,
    storyUpdated: story.implementationNotes !== undefined,
  };

  const failed = Object.entries(checks)
    .filter(([_, passed]) => !passed)
    .map(([criterion]) => criterion);

  if (failed.length > 0) {
    return {
      canAdvance: false,
      failedCriteria: failed,
      phase2Attempts: context.phase2Attempts || 0,
      message: `❌ PHASE 2 EXIT BLOCKED\n\nFalhou: ${failed.join(', ')}\n\nCorreções necessárias:
      ${this._generatePhase2Fixes(failed)}`,
    };
  }

  return { canAdvance: true };
}
```

### Max Attempts

**Limit:** 3 tentativas

Se 3 falhas consecutivas → Surface to human:
```
⚠️ PHASE 2 falhou 3 vezes.

Intervenção necessária:
[1] Revisar manualmente
[2] Pular story (add to backlog)
[3] Abortar sessão
```

---

## PHASE 3: SELF-HEALING (@dev + CodeRabbit)

**Owner:** @dev (Dex) com CodeRabbit CLI
**Duration:** ~30 min
**Purpose:** Auto-fix critical and high issues

### Exit Criteria

- [ ] **EC3.1:** CodeRabbit scan completed
- [ ] **EC3.2:** CRITICAL issues = 0
- [ ] **EC3.3:** HIGH issues ≤ 2 (or addressed in quality gate)
- [ ] **EC3.4:** Auto-fixes applied and committed
- [ ] **EC3.5:** Tests still passing after fixes
- [ ] **EC3.6:** Scan report saved to .aios/qa/coderabbit-report.json

### Validation Code

```javascript
async validatePhase3Exit(context) {
  const report = await this._loadCodeRabbitReport(context.storyId);

  const checks = {
    scanCompleted: report !== null,
    noCritical: report.issues.critical === 0,
    highAcceptable: report.issues.high <= 2,
    fixesApplied: report.autoFixesCount > 0 || report.issues.total === 0,
    testsPass: await this._runTests(),
    reportSaved: fs.existsSync(this._reportPath(context.storyId)),
  };

  const failed = Object.entries(checks)
    .filter(([_, passed]) => !passed)
    .map(([criterion]) => criterion);

  if (failed.length > 0) {
    // CRITICAL issues are non-negotiable
    if (report.issues.critical > 0) {
      return {
        canAdvance: false,
        failedCriteria: ['CRITICAL issues remain'],
        blocking: true,
        message: `🛑 PHASE 3 BLOQUEADO

${report.issues.critical} issue(s) CRITICAL detectados:
${this._formatIssues(report.criticalIssues)}

Auto-fix falhou. Correção manual obrigatória.`,
      };
    }

    return {
      canAdvance: false,
      failedCriteria: failed,
      message: `❌ PHASE 3 EXIT BLOCKED\n\nFalhou: ${failed.join(', ')}`,
    };
  }

  return { canAdvance: true, report };
}
```

### Failure Recovery

| Failed Criterion | Action |
|------------------|--------|
| CRITICAL issues | Manual fix obrigatório (BLOCK) |
| HIGH > 2 | Documentar para quality gate |
| Tests failing | Rollback auto-fixes, retry |
| Scan timeout | Reduce scan scope, retry |

---

## PHASE 4: QUALITY GATE (quality_gate ≠ executor)

**Owner:** Quality Gate Agent (segregated reviewer)
**Duration:** ~30 min
**Purpose:** Independent code review

### Exit Criteria

- [ ] **EC4.1:** Reviewer ≠ executor (segregation verified)
- [ ] **EC4.2:** All acceptance criteria met (verified by reviewer)
- [ ] **EC4.3:** Code quality acceptable (no major issues)
- [ ] **EC4.4:** Architecture patterns followed
- [ ] **EC4.5:** Security review passed (OWASP top 10 check)
- [ ] **EC4.6:** Review decision = APPROVED
- [ ] **EC4.7:** Feedback documented (if rejected)

### Validation Code

```javascript
async validatePhase4Exit(context) {
  const review = await this._loadQualityGateReview(context.storyId);
  const executor = context.executor;
  const reviewer = context.qualityGate;

  const checks = {
    segregated: executor !== reviewer,
    acsMet: review.acceptanceCriteria.allMet === true,
    codeQuality: review.codeQualityScore >= 7,
    architectureOk: review.architectureCompliance === true,
    securityOk: review.securityIssues.length === 0,
    approved: review.decision === 'APPROVED',
    feedbackExists: review.feedback !== undefined,
  };

  const failed = Object.entries(checks)
    .filter(([_, passed]) => !passed)
    .map(([criterion]) => criterion);

  if (failed.length > 0) {
    const attempt = (context.qgAttempts || 0) + 1;

    if (attempt >= 3) {
      // Max attempts reached → surface to human
      return {
        canAdvance: false,
        failedCriteria: failed,
        maxAttemptsReached: true,
        message: `⚠️ QUALITY GATE falhou 3 vezes.

Intervenção necessária:
[1] Revisar manualmente
[2] Pular story
[3] Abortar sessão`,
      };
    }

    // Return to PHASE 2 with feedback
    return {
      canAdvance: false,
      failedCriteria: failed,
      returnToPhase: 2,
      attempt,
      message: `❌ QUALITY GATE: REJECTED (Tentativa ${attempt}/3)

${review.feedback}

Retornando para PHASE 2: DEVELOPMENT com feedback.`,
    };
  }

  return { canAdvance: true, review };
}
```

### Failure Recovery

**Max Attempts:** 3

- **Attempt 1-2:** Return to Phase 2 with feedback
- **Attempt 3:** Surface to human for decision

---

## PHASE 5: PUSH (@devops)

**Owner:** @devops (Gage)
**Duration:** ~10 min
**Purpose:** Create PR and prepare for merge

### Exit Criteria

- [ ] **EC5.1:** All changes committed to local branch
- [ ] **EC5.2:** Branch pushed to remote
- [ ] **EC5.3:** Pull Request created
- [ ] **EC5.4:** PR description includes story reference
- [ ] **EC5.5:** CI/CD checks initiated (if configured)
- [ ] **EC5.6:** PR URL recorded in session state

### Validation Code

```javascript
async validatePhase5Exit(context) {
  const gitStatus = await this._getGitStatus();
  const remoteBranch = await this._getRemoteBranch();
  const pr = await this._getPullRequest(context.storyId);

  const checks = {
    allCommitted: gitStatus.uncommitted.length === 0,
    pushed: remoteBranch !== null,
    prCreated: pr !== null,
    prHasStoryRef: pr?.body?.includes(context.storyId),
    ciInitiated: pr?.checks?.length > 0 || !this._hasCiConfig(),
    prUrlRecorded: context.sessionState.prUrl !== undefined,
  };

  const failed = Object.entries(checks)
    .filter(([_, passed]) => !passed)
    .map(([criterion]) => criterion);

  if (failed.length > 0) {
    return {
      canAdvance: false,
      failedCriteria: failed,
      message: `❌ PHASE 5 EXIT BLOCKED\n\nFalhou: ${failed.join(', ')}\n\nAção: @devops resolver issues acima.`,
    };
  }

  return { canAdvance: true, pr };
}
```

### Failure Recovery

| Failed Criterion | Action |
|------------------|--------|
| Uncommitted changes | git add + git commit |
| Push failed | Check remote auth, retry |
| PR creation failed | Verify gh CLI auth, retry |
| CI not initiated | Manual check (may be config issue) |

---

## PHASE 6: CHECKPOINT (HUMAN)

**Owner:** USER (human decision)
**Duration:** 1-5 min
**Purpose:** User decides next action

### Exit Criteria

- [ ] **EC6.1:** Checkpoint summary displayed to user
- [ ] **EC6.2:** User selected one of 4 options (GO/PAUSE/REVIEW/ABORT)
- [ ] **EC6.3:** Decision recorded in session state
- [ ] **EC6.4:** Lock status updated (released if PAUSE/ABORT)

### Validation Code

```javascript
async validatePhase6Exit(context) {
  const checkpoint = context.checkpointResult;

  const checks = {
    summaryShown: checkpoint.summaryDisplayed === true,
    decisionMade: ['GO', 'PAUSE', 'REVIEW', 'ABORT'].includes(checkpoint.decision),
    decisionRecorded: checkpoint.recordedInSession === true,
    lockUpdated: checkpoint.lockStatus !== 'unknown',
  };

  const failed = Object.entries(checks)
    .filter(([_, passed]) => !passed)
    .map(([criterion]) => criterion);

  if (failed.length > 0) {
    return {
      canAdvance: false,
      failedCriteria: failed,
      message: `❌ CHECKPOINT EXIT INVALID\n\nSistema corrupto. Reporte bug.`,
    };
  }

  // Special case: REVIEW loops back to checkpoint
  if (checkpoint.decision === 'REVIEW') {
    return {
      canAdvance: false,
      loopToCheckpoint: true,
      message: 'Retornando ao checkpoint após review.',
    };
  }

  return {
    canAdvance: true,
    nextAction: this._mapCheckpointDecision(checkpoint.decision),
  };
}
```

### Decision Mapping

| Decision | Next Action |
|----------|-------------|
| GO | Load next story → Phase 1 |
| PAUSE | Save session → Exit |
| REVIEW | Show progress → Loop to Phase 6 |
| ABORT | Save session → Release lock → Exit |

---

## 🔧 Implementation in BobOrchestrator

### Phase Transition Hook

```javascript
async _transitionToPhase(currentPhase, nextPhase, context) {
  // Validate current phase exit criteria
  const exitValidation = await this._validatePhaseExit(currentPhase, context);

  if (!exitValidation.canAdvance) {
    // Handle failure
    return this._handlePhaseExitFailure(currentPhase, exitValidation, context);
  }

  // Log successful exit
  this._log(`Phase ${currentPhase} exit criteria met. Advancing to ${nextPhase}.`, 'info');

  // Update session state
  await this.sessionState.recordPhaseTransition(
    currentPhase,
    nextPhase,
    exitValidation
  );

  // Proceed to next phase
  return { success: true, nextPhase };
}
```

### Exit Validation Router

```javascript
async _validatePhaseExit(phase, context) {
  switch (phase) {
    case 1:
      return this.validatePhase1Exit(context);
    case 2:
      return this.validatePhase2Exit(context);
    case 3:
      return this.validatePhase3Exit(context);
    case 4:
      return this.validatePhase4Exit(context);
    case 5:
      return this.validatePhase5Exit(context);
    case 6:
      return this.validatePhase6Exit(context);
    default:
      throw new Error(`Invalid phase: ${phase}`);
  }
}
```

### Failure Handler

```javascript
async _handlePhaseExitFailure(phase, validation, context) {
  const attempt = (context[`phase${phase}Attempts`] || 0) + 1;
  const maxAttempts = phase === 4 ? 3 : 5; // Quality gate has stricter limit

  context[`phase${phase}Attempts`] = attempt;

  if (attempt >= maxAttempts) {
    // Max attempts → surface to human
    return {
      success: false,
      action: 'surface',
      data: {
        message: `⚠️ PHASE ${phase} falhou ${maxAttempts} vezes.\n\nIntervenção necessária.`,
        options: ['Corrigir manualmente', 'Pular story', 'Abortar'],
        validation,
      },
    };
  }

  // Retry with feedback
  return {
    success: false,
    action: 'retry_phase',
    phase,
    attempt,
    feedback: validation.message,
  };
}
```

---

## 📊 Metrics & Telemetry

Track exit criteria violations:

```javascript
async _trackExitCriteriaMetric(phase, criterion, passed) {
  await this.telemetry.record({
    event: 'phase_exit_criteria',
    phase,
    criterion,
    passed,
    timestamp: new Date().toISOString(),
  });
}
```

**Dashboard Query:**
```sql
SELECT phase, criterion, COUNT(*) as failures
FROM exit_criteria_events
WHERE passed = false
GROUP BY phase, criterion
ORDER BY failures DESC;
```

---

## 🚨 Enforcement Summary

| Phase | Exit Criteria | Max Attempts | Failure Action |
|-------|---------------|--------------|----------------|
| 1 | 6 | 5 | Fix or abort |
| 2 | 7 | 5 | Retry with feedback |
| 3 | 6 | 3 | Manual fix if CRITICAL |
| 4 | 7 | 3 | Surface to human |
| 5 | 6 | 3 | @devops fix |
| 6 | 4 | N/A | Always surfaces |

---

**Process Absolutism Achieved:** Executor CANNOT advance without meeting exit criteria. Zero time gaps. Zero skipped steps.

**Last Updated:** 2026-02-15
**Related:** BOB-FLOW-2, enhancement-workflow.md
