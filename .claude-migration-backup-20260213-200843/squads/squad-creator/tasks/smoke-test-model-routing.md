# Task: smoke-test-model-routing

**Command:** `*smoke-test-model-routing`
**Version:** 2.0.0
**Execution Type:** Hybrid (Worker scripts + Agent validation)
**Worker Scripts:** `scripts/model-tier-validator.cjs`, `scripts/model-usage-logger.cjs`
**Model:** `Haiku` (QUALIFIED — validation task, scripts do heavy lifting)
**Haiku Eligible:** YES — scripts handle validation, LLM only reports

## Purpose

Validate that the model routing system is functional by:
1. Running 3 haiku-tier tasks with explicit model parameter
2. Comparing behavior with/without model parameter
3. Logging results to metrics

## Veto Conditions

- [ ] VETO if model-routing.yaml doesn't exist
- [ ] VETO if outputs/metrics/ directory not writable
- [ ] VETO if Task tool doesn't support model parameter
- [ ] **VETO if preflight script not executed first (GAP ZERO)**

---

## ⛔ MANDATORY PREFLIGHT: Run Validator Script FIRST

```
EXECUTE FIRST — before ANY manual validation:

  node squads/squad-creator/scripts/model-tier-validator.cjs report > /tmp/preflight-model-routing.txt

IF the command fails → FIX the script error. Do NOT proceed manually.
IF the command succeeds → READ /tmp/preflight-model-routing.txt. Use ONLY these results.

VETO: If /tmp/preflight-model-routing.txt does not exist → BLOCK.
      Do NOT manually check model routing. Do NOT grep config files yourself.
      The script validates tier assignments faster and 100% consistently.
```

---

## Workflow

### Phase 1: Pre-flight Check (via script)

```bash
# Run comprehensive preflight via validator script
node squads/squad-creator/scripts/model-tier-validator.cjs list

# Verify metrics dir exists
ls -la outputs/metrics/

# Verify logger script exists
ls -la squads/squad-creator/scripts/model-usage-logger.cjs
```

**Gate:** All files exist → Continue. Any missing → STOP and create.

### Phase 2: Validate Task Lookup (3 samples)

For each test task, verify expected tier:

```bash
node squads/squad-creator/scripts/model-usage-logger.cjs validate qa-after-creation.md
node squads/squad-creator/scripts/model-usage-logger.cjs validate validate-squad.md
node squads/squad-creator/scripts/model-usage-logger.cjs validate extract-voice-dna.md
```

**Expected results:**
| Task | Expected Tier |
|------|---------------|
| qa-after-creation.md | haiku |
| validate-squad.md | haiku |
| extract-voice-dna.md | opus |

**Gate:** All lookups return correct tier → Continue.

### Phase 3: Execution Test (Haiku Task)

Spawn a simple haiku-tier task with explicit model parameter:

```
Task(
  subagent_type: "general-purpose",
  model: "haiku",
  description: "Test haiku routing",
  prompt: "Read squads/squad-creator/config/model-routing.yaml and count how many tasks are marked as haiku tier. Return ONLY the number."
)
```

**Expected:** Task completes successfully using Haiku model.

**Log result:**
```bash
node squads/squad-creator/scripts/model-usage-logger.cjs log smoke-test-haiku.md haiku 500 100 2000
```

### Phase 4: Comparison Test (Without model param)

Spawn same task WITHOUT model parameter:

```
Task(
  subagent_type: "general-purpose",
  description: "Test default routing",
  prompt: "Read squads/squad-creator/config/model-routing.yaml and count how many tasks are marked as sonnet tier. Return ONLY the number."
)
```

**Observe:** What model does it use? (Should default to parent/opus)

### Phase 5: Generate Report

```bash
node squads/squad-creator/scripts/model-usage-logger.cjs report
```

## Completion Criteria

- [ ] Phase 1: All pre-flight checks pass
- [ ] Phase 2: All 3 task lookups return correct tier
- [ ] Phase 3: Haiku task completes successfully
- [ ] Phase 4: Comparison shows difference (or confirms behavior)
- [ ] Phase 5: Report generated with at least 1 logged entry

## Output Example

```
============================================================
SMOKE TEST RESULTS - Model Routing
============================================================

Pre-flight: ✅ PASS (all files exist)

Task Lookup Validation:
  qa-after-creation.md → haiku ✅
  validate-squad.md → haiku ✅
  extract-voice-dna.md → opus ✅

Execution Test:
  Haiku task (with model param): ✅ Completed in 2.3s
  Default task (no model param): ⚠️ Used opus (expected behavior)

Conclusion:
  - Model parameter IS respected by Task tool
  - Without explicit model param, defaults to opus
  - ENFORCEMENT GAP: Nothing prevents forgetting model param

Recommendation:
  Model routing WORKS when used correctly.
  Need hook to ENFORCE usage (prevent forgetting).

============================================================
```

## Next Steps After Smoke Test

If smoke test PASSES:
1. Model routing capability is validated
2. Priority: Create enforcement hook
3. Start logging real task executions

If smoke test FAILS:
1. Identify failure point
2. Fix before proceeding
3. Re-run smoke test
