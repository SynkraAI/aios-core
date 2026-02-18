# Checkpoint Validation Checklist

Use this checklist to validate checkpoint creation and integrity.

---

## File Existence

- [ ] Checkpoint file exists at `.aios/navigator/{project-name}/checkpoints/{checkpoint-id}.json`
- [ ] File permissions are readable (644 or similar)
- [ ] Parent directory `.aios/navigator/{project-name}/checkpoints/` exists
- [ ] No file corruption (valid JSON parse)

---

## JSON Structure

### Required Top-Level Fields

- [ ] `checkpointId` is present and non-empty
- [ ] `filepath` matches actual file location
- [ ] `phase` is a valid number (matches roadmap phase ID)
- [ ] `type` is either "manual" or "auto"
- [ ] `date` is valid ISO 8601 timestamp
- [ ] `description` explains checkpoint purpose

### Optional Fields

- [ ] `triggeredBy` indicates who/what created checkpoint (if present)
- [ ] `metadata` contains relevant context (if present)
- [ ] `git` object has commit SHA (if present)

---

## Checkpoint ID Format

- [ ] Format: `cp-{phase}-{type}-{timestamp}`
- [ ] Example: `cp-2-auto-20260215-143022`
- [ ] Components:
  - [ ] Phase number matches `phase` field
  - [ ] Type matches `type` field
  - [ ] Timestamp is parseable (YYYYMMDD-HHMMSS)

---

## Phase Validation

- [ ] Phase number exists in roadmap
- [ ] Phase number is sequential (not skipped)
- [ ] Previous phase has checkpoint (except for phase 1)
- [ ] Phase outputs exist before checkpoint creation

---

## Type-Specific Checks

### For Manual Checkpoints (`type: "manual"`)

- [ ] Description is human-readable and informative
- [ ] Created intentionally (not accidentally)
- [ ] User confirmed overwrite if previous checkpoint exists

### For Auto Checkpoints (`type: "auto"`)

- [ ] Triggered by post-commit hook or automation
- [ ] Git commit SHA recorded in metadata
- [ ] No user interaction required
- [ ] Skips if checkpoint already exists (no overwrite)

---

## Timestamp Validation

- [ ] Date format: `YYYY-MM-DDTHH:mm:ss.sssZ`
- [ ] Timestamp is reasonable (not in future)
- [ ] Matches actual file creation time (±1 minute tolerance)
- [ ] Sequential checkpoints have increasing timestamps

---

## Content Validation

### Description Quality

- [ ] Describes phase completion state
- [ ] Mentions key deliverables created
- [ ] Notes any important decisions made
- [ ] References relevant story IDs (if applicable)

### Metadata Completeness

- [ ] Includes git commit SHA (if auto checkpoint)
- [ ] Records triggering agent (if applicable)
- [ ] Captures important context for recovery

---

## Recovery Validation

- [ ] Checkpoint can be used to resume work
- [ ] Phase outputs still exist and are valid
- [ ] No missing files between checkpoint and current state
- [ ] Git history aligns with checkpoint timeline

---

## Checkpoint Chain Integrity

- [ ] No gaps in checkpoint sequence
- [ ] Each phase has at least one checkpoint (after completion)
- [ ] No duplicate checkpoints for same phase (except overwrites)
- [ ] Chain is continuous from phase 1 to current phase

---

## Integration Checks

### Post-Commit Hook

- [ ] Hook installed at `.husky/post-commit`
- [ ] Hook calls checkpoint-manager.js correctly
- [ ] Hook executes without blocking commit
- [ ] Hook logs output to `.aios/logs/hooks.log`

### Phase Detector

- [ ] Phase detector reads checkpoints correctly
- [ ] Latest checkpoint influences phase detection
- [ ] Completion percentage calculation uses checkpoints

---

## Conflict Resolution

- [ ] No conflicting checkpoints (same ID, different content)
- [ ] Overwrite confirmations logged (if manual)
- [ ] NAVIGATOR_AUTO_MODE respected (if set)
- [ ] User preferences honored (ask vs. auto)

---

## File System Safety

- [ ] Checkpoint directory has write permissions
- [ ] Disk space sufficient for checkpoint storage
- [ ] No symbolic link issues
- [ ] Path length within OS limits

---

## Cleanup Validation

- [ ] Old checkpoints archived (if retention policy exists)
- [ ] No orphaned checkpoints (phase deleted from roadmap)
- [ ] Checkpoint count reasonable (not excessive)

---

## Documentation

- [ ] Checkpoint purpose documented in description
- [ ] Special circumstances noted in metadata
- [ ] Recovery procedure understood by team
- [ ] Backup strategy in place (if critical project)

---

## Pre-Deployment Checks

- [ ] All phases have checkpoints before production
- [ ] Final checkpoint includes deployment verification
- [ ] Rollback checkpoints available
- [ ] Production environment aligns with latest checkpoint

---

## Sign-Off

- [ ] Checkpoint verified by automation or human
- [ ] Recovery tested (if critical milestone)
- [ ] Team aware of checkpoint availability
- [ ] Documentation updated

---

**Validation Date:** _______________

**Validated By:** _______________

**Checkpoint ID:** _______________

**Notes:**

---

*Navigator Squad - Checkpoint Validation Checklist v1.0*
