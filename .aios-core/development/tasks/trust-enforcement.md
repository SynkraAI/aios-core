<!--
## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)
- Trust checks with automatic enforcement
- Log-only violations in permissive mode
- **Best for:** Trusted agents with high track record

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**
- Explicit trust checkpoints
- Educational explanations of violations
- **Best for:** Building trust, learning compliance

### 3. Pre-Flight Planning - Comprehensive Trust Assessment
- Full trust profile analysis
- Permission matrix verification
- **Best for:** Critical operations, low-trust contexts

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: trustEnforcement()
responsável: Any Agent
responsavel_type: Protocol
atomic_layer: Infrastructure

**Entrada:**
- campo: agent_id
  tipo: string
  origem: Context
  obrigatório: true
  validação: Valid agent identifier

- campo: action_type
  tipo: string
  origem: User Input
  obrigatório: true
  validação: One of [execute, modify, delete, deploy, approve]

- campo: risk_level
  tipo: string
  origem: config/computed
  obrigatório: false
  validação: One of [low, medium, high, critical], default: medium

- campo: evidence
  tipo: array
  origem: Execution context
  obrigatório: false
  validação: Evidence artifacts for verification

**Saída:**
- campo: permission_granted
  tipo: boolean
  destino: Return value
  persistido: false

- campo: trust_report
  tipo: object
  destino: Memory
  persistido: true

- campo: violations
  tipo: array
  destino: Audit log
  persistido: true
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE action execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Agent trust profile loaded or created
    tipo: pre-condition
    verificação: Trust profile exists in memory
  - [ ] Action type is recognized
    tipo: pre-condition
    verificação: action_type in allowed types
  - [ ] Risk level assessed
    tipo: pre-condition
    verificação: risk_level computed from action context
```

---

## Protocol Steps

### Step 1: Load Trust Context

```yaml
step: 1
name: Load Trust Context
purpose: Retrieve agent's trust history and current level

actions:
  - Load agent trust profile from memory
  - Calculate current trust with decay factor
  - Retrieve relevant trust warnings
  - Load action-specific requirements

outputs:
  - trust_profile: AgentTrustProfile
  - current_trust: float (0.0-1.0)
  - trust_level: string (UNTRUSTED|MINIMAL|LOW|MODERATE|GOOD|HIGH|FULL)
  - warnings: array of past issues
```

### Step 2: Evaluate Permission Matrix

```yaml
step: 2
name: Evaluate Permission Matrix
purpose: Check if trust level permits requested action

trust_thresholds:
  execute:
    low_risk: 0.3      # MINIMAL
    medium_risk: 0.5   # MODERATE
    high_risk: 0.7     # GOOD
    critical: 0.85     # HIGH
  modify:
    low_risk: 0.4
    medium_risk: 0.6
    high_risk: 0.8
    critical: 0.9
  delete:
    low_risk: 0.5
    medium_risk: 0.7
    high_risk: 0.85
    critical: 0.95
  deploy:
    low_risk: 0.6
    medium_risk: 0.75
    high_risk: 0.9
    critical: 0.95
  approve:
    low_risk: 0.7
    medium_risk: 0.8
    high_risk: 0.9
    critical: 1.0

decision:
  if: current_trust >= threshold_for(action_type, risk_level)
  then: ALLOW with monitoring
  else: REQUIRE_APPROVAL or DENY
```

### Step 3: Mode-Aware Verification

```yaml
step: 3
name: Apply Mode-Aware Verification
purpose: Adjust verification strictness by task mode

modes:
  planning:
    require_evidence: false
    allow_speculation: true
    confidence_threshold: 0.6
    strict_mode: false

  execution:
    require_evidence: true
    require_verifiable_command: true
    confidence_threshold: 0.8
    strict_mode: true

  debugging:
    require_evidence: true
    allow_hypotheses: true
    confidence_threshold: 0.7
    strict_mode: true

  review:
    require_evidence: true
    evidence_count: 2
    confidence_threshold: 0.9
    strict_mode: true

  research:
    require_evidence: false
    allow_speculation: true
    confidence_threshold: 0.5
    strict_mode: false

auto_detection:
  - keywords: [plan, design, architect, brainstorm] → planning
  - keywords: [implement, code, write, create, build] → execution
  - keywords: [debug, fix, investigate, troubleshoot] → debugging
  - keywords: [review, audit, verify, validate] → review
  - keywords: [research, explore, learn, understand] → research
```

### Step 4: Collect Evidence (if required)

```yaml
step: 4
name: Collect Evidence
purpose: Gather verification evidence for action
condition: mode requires evidence

evidence_types:
  - COMMAND_OUTPUT: Terminal command with output
  - TEST_RESULT: Test execution results
  - FILE_DIFF: Before/after file comparison
  - LOG_ENTRY: System log entries
  - ASSERTION: Verifiable claim with proof
  - SCREENSHOT: Visual evidence
  - API_RESPONSE: API call results

verification_commands:
  code_change:
    - git diff --staged
    - npm test (or project test command)
    - npm run lint
  deployment:
    - health check endpoint
    - smoke test suite
  database:
    - schema validation query
    - data integrity check
```

### Step 5: Record Decision and Update Profile

```yaml
step: 5
name: Record and Learn
purpose: Update trust profile based on action outcome

on_success:
  - Increment clean_sessions streak
  - Increase trust score gradually (+0.02 per success)
  - Record successful pattern for future reference

on_violation:
  - Reset clean_sessions streak
  - Decrease trust based on severity:
      low: multiply by 0.95
      medium: multiply by 0.90
      high: multiply by 0.80
      critical: multiply by 0.60
  - Record violation as anti-pattern
  - Generate remediation guidance

persistence:
  - Save updated profile to memory
  - Record audit trail entry
  - Emit trust_updated event
```

---

## Trust Behaviors

The following behaviors are monitored and enforced:

### 1. Verification Before Claim
```yaml
behavior: verification_before_claim
description: Never claim completion without verification evidence
enforcement:
  - Block "done" status without evidence
  - Require test output for code changes
  - Mandate health check for deployments
```

### 2. Loud Failure
```yaml
behavior: loud_failure
description: Failures must be explicit, never silent
enforcement:
  - No empty catch blocks
  - No silent fallbacks without logging
  - Error notifications required
```

### 3. Honest Uncertainty
```yaml
behavior: honest_uncertainty
description: Acknowledge what you don't know
enforcement:
  - Flag low-confidence claims
  - Require speculation labeling
  - Prohibit data fabrication
```

### 4. Paper Trail
```yaml
behavior: paper_trail
description: Document decisions and changes
enforcement:
  - Require commit messages
  - Log significant decisions
  - Track file modifications
```

### 5. Diligent Execution
```yaml
behavior: diligent_execution
description: Complete tasks thoroughly
enforcement:
  - Follow complete workflows
  - No partial implementations
  - Verify all acceptance criteria
```

---

## Integration Points

### Build Loop Integration
```yaml
location: .aios-core/core/execution/autonomous-build-loop.js
events:
  - Pre-subtask: trust_check_started
  - Post-check: trust_check_passed | trust_check_failed
  - On violation: permission_denied, audit_recorded

injection_point: Before executeSubtaskWithClaude()
```

### Context Injection
```yaml
location: .aios-core/core/execution/context-injector.js
additions:
  - trust_level: Current agent trust
  - allowed_operations: Based on trust
  - verification_requirements: Mode-specific
  - warnings: Past violations for this context
```

### Memory Integration
```yaml
location: .aios-core/core/memory/
new_modules:
  - trust-memory.js: Trust history and patterns
  - permission-memory.js: Cached permissions
  - audit-memory.js: Audit trail storage
```

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] Trust decision recorded in audit log
    tipo: post-condition
    verificação: Audit entry exists
  - [ ] Profile updated if action completed
    tipo: post-condition
    verificação: Profile timestamp updated
  - [ ] Evidence preserved for verification
    tipo: post-condition
    verificação: Evidence stored in memory
```

---

## Example Usage

### From Agent Context
```
@dev implement the login feature

[Trust Check]
- Agent: dev (Dex)
- Trust Level: GOOD (0.72)
- Action: execute
- Risk: medium
- Threshold: 0.5 (MODERATE)
- Result: ALLOWED

[Mode Detection]
- Task: "implement" → EXECUTION mode
- Requirements: Evidence required, strict verification

[Verification]
- [ ] Tests pass
- [ ] Lint clean
- [ ] Changes committed with message

[Trust Update]
- On success: trust += 0.02 → 0.74
- Clean streak: 4 → 5
```

### Permission Denied Example
```
@dev deploy to production

[Trust Check]
- Agent: dev (Dex)
- Trust Level: MODERATE (0.55)
- Action: deploy
- Risk: high
- Threshold: 0.9 (HIGH required)
- Result: DENIED

[Remediation]
- Current trust: 55%
- Required: 90%
- Guidance: Build trust through 7+ clean sessions
- Alternative: Request @devops approval
```
