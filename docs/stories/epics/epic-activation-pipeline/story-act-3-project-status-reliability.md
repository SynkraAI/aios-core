# Story ACT-3: ProjectStatusLoader Reliability Overhaul

**Epic:** [EPIC-ACT - Unified Agent Activation Pipeline](EPIC-ACT-INDEX.md)
**Status:** Ready for Review
**Priority:** High
**Complexity:** High
**Created:** 2026-02-05

---

## Executor Assignment

executor: "@dev"
quality_gate: "@architect"
quality_gate_tools: ["code-review", "performance-benchmark", "concurrency-review"]

---

## Story

**As a** developer using AIOS in multiple terminals,
**I want** the `ProjectStatusLoader` to provide real-time, accurate project status on every agent activation,
**so that** agents always see the current git state, active stories, and recent commits without stale 60-second cached data.

---

## Acceptance Criteria

1. ProjectStatusLoader invalidates cache on git state changes (via hooks or polling)
2. Multi-terminal concurrent access does not produce corrupt cache files
3. After an agent commits, the next activation shows updated status within 5 seconds
4. `getCurrentStoryInfo()` accurately detects InProgress stories without 60-second delay
5. Git post-commit hook exists that clears `.aios/project-status.yaml`
6. Worktree-aware: Each git worktree maintains its own status cache
7. Performance: Status generation completes within 100ms target
8. Unit tests cover cache invalidation, multi-terminal, and worktree scenarios

---

## 🤖 CodeRabbit Integration

### Story Type Analysis

**Primary Type**: Infrastructure / Performance
**Secondary Type(s)**: Bug Fix, Reliability
**Complexity**: High

### Specialized Agent Assignment

**Primary Agents**:
- @dev: Implementation of cache overhaul

**Supporting Agents**:
- @architect: Concurrency and file-locking design review
- @devops: Git hooks integration

### Quality Gate Tasks

- [ ] Pre-Commit (@dev): Run before marking story complete
- [ ] Pre-PR (@devops): Run before creating pull request

### Self-Healing Configuration

**Expected Self-Healing**:
- Primary Agent: @dev (light mode)
- Max Iterations: 2
- Timeout: 15 minutes
- Severity Filter: CRITICAL, HIGH

**Predicted Behavior**:
- CRITICAL issues: auto_fix (2 iterations, 15min)
- HIGH issues: document_only

### CodeRabbit Focus Areas

**Primary Focus**:
- File locking correctness for concurrent access
- Cache invalidation completeness (no stale reads)

**Secondary Focus**:
- Performance regression prevention
- Git hook portability across platforms (Windows/macOS/Linux)

---

## Tasks / Subtasks

- [x] Task 1: Implement event-driven cache invalidation (AC: 1, 3)
  - [x] 1.1 Read current cache logic in `project-status-loader.js:20-524`
  - [x] 1.2 Replace 60s TTL with git-state-change detection
  - [x] 1.3 Use file modification timestamp of `.git/HEAD`, `.git/index` as invalidation signals
  - [x] 1.4 Reduce active-session TTL to 15s, idle TTL to 60s
- [x] Task 2: Add multi-terminal file locking (AC: 2)
  - [x] 2.1 Implement atomic write for `.aios/project-status.yaml`
  - [x] 2.2 Use lock file (`.aios/project-status.lock`) with timeout
  - [x] 2.3 Add corrupted cache recovery (delete and regenerate)
  - [x] 2.4 Test: two concurrent writes produce valid YAML
- [x] Task 3: Create git post-commit hook (AC: 5)
  - [x] 3.1 Create hook script at `.aios-core/infrastructure/scripts/git-hooks/post-commit`
  - [x] 3.2 Hook clears `.aios/project-status.yaml` on commit
  - [x] 3.3 Integrate with existing husky hook setup
  - [x] 3.4 Document hook installation in activation pipeline docs
- [x] Task 4: Add worktree awareness (AC: 6)
  - [x] 4.1 Detect if running in git worktree (`git rev-parse --git-common-dir`)
  - [x] 4.2 Use worktree-specific cache path: `.aios/project-status-{worktree-hash}.yaml`
  - [x] 4.3 Test with multiple worktrees pointing to same repo
- [x] Task 5: Performance optimization (AC: 7)
  - [x] 5.1 Benchmark current status generation time
  - [x] 5.2 Ensure parallel git commands use `Promise.all()`
  - [x] 5.3 Target: <100ms for cached reads, <500ms for full regeneration
  - [x] 5.4 Add performance assertions to tests
- [x] Task 6: Add comprehensive tests (AC: 8)
  - [x] 6.1 Test: cache invalidated after git commit
  - [x] 6.2 Test: concurrent access produces valid output
  - [x] 6.3 Test: corrupted cache triggers regeneration
  - [x] 6.4 Test: worktree isolation works correctly
  - [x] 6.5 Test: getCurrentStoryInfo() returns fresh data

---

## Dev Notes

### Current Behavior

```
Agent activates → ProjectStatusLoader.loadProjectStatus()
  → Check .aios/project-status.yaml cache (60s TTL)
  → If stale: Run 5 parallel git commands + story scan
  → Cache result to .aios/project-status.yaml
```

### Problem Details

The 60-second cache means:
- After `git commit`, status shows old data for up to 60s
- After `git checkout`, branch info is wrong for up to 60s
- In multi-terminal workflows, one terminal's commit isn't reflected in another's activation
- `getCurrentStoryInfo()` may show already-completed stories

### Key Source Files

| File | Lines | Purpose |
|------|-------|---------|
| `.aios-core/infrastructure/scripts/project-status-loader.js` | 524 | Main file — cache logic, git commands, story scanning |
| `.aios/project-status.yaml` | - | Cache file (runtime, not in repo) |
| `.aios-core/infrastructure/scripts/git-config-detector.js` | 293 | Git config detection (5min cache, works fine) |

### Platform Considerations

- **Windows**: File locking via `fs.open()` with `wx` flag or `proper-lockfile` package
- **macOS/Linux**: Standard advisory file locks
- **Git hooks**: Must be executable on all platforms (use Node.js scripts, not bash)

### Testing

**Test file location:** `tests/infrastructure/project-status-loader.test.js`
**Test framework:** Jest
**Testing patterns:**
- Mock git commands with `child_process` spy
- Use temporary directories for cache file testing
- Test concurrent access with `Promise.all()` of multiple `loadProjectStatus()` calls
- Mock file system for worktree detection

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-05 | 1.0 | Story created from EPIC-ACT restructuring | @po (Pax) |
| 2026-02-06 | 2.0 | Implementation complete - all 6 tasks done, 90 tests passing | @dev (Dex) |

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References

No debug issues encountered. All 90 tests passed on first successful run.

### Completion Notes List

- Replaced fixed 60s TTL cache with event-driven invalidation using `.git/HEAD` and `.git/index` mtime fingerprinting
- Added dual TTL system: 15s active-session (when fingerprint matches), 60s idle (no fingerprint)
- Implemented multi-terminal safe cache writes via lock file with `writeFile({ flag: 'wx' })` exclusive create
- Added atomic write pattern (temp file + rename) with Windows fallback
- Added stale lock detection and cleanup (10s threshold)
- Created cross-platform git post-commit hook using Node.js (`.aios-core/infrastructure/scripts/git-hooks/post-commit.js`)
- Integrated with husky via `.husky/post-commit`
- Added worktree detection via `git rev-parse --git-dir` vs `--git-common-dir`
- Worktree-specific cache files use hash of worktree path: `project-status-{hash}.yaml`
- Added corrupted cache recovery: invalid YAML or missing `status` field triggers delete + regeneration
- Performance verified: cached reads complete in under 100ms (test assertion)
- All git commands already use `Promise.all()` for parallel execution (preserved from original)
- Test count grew from 44 to 90 (46 new tests covering all ACT-3 acceptance criteria)

### File List

| File | Action | Purpose |
|------|--------|---------|
| `.aios-core/infrastructure/scripts/project-status-loader.js` | Modified | Core reliability overhaul: fingerprint-based invalidation, locking, worktree awareness |
| `.aios-core/infrastructure/scripts/git-hooks/post-commit.js` | Created | Cross-platform Node.js post-commit hook that clears status cache |
| `.husky/post-commit` | Created | Husky hook shell wrapper that invokes post-commit.js |
| `tests/infrastructure/project-status-loader.test.js` | Modified | Expanded from 44 to 90 tests covering all AC |
| `docs/stories/epics/epic-activation-pipeline/story-act-3-project-status-reliability.md` | Modified | Story status and dev agent record updates |

---

## QA Results

**Reviewed by:** @qa (Quinn) | **Date:** 2026-02-06
**Gate Decision:** APPROVED

### Acceptance Criteria Traceability

| AC# | Description | Tested? | Test Name(s) | Verdict |
|-----|-------------|---------|--------------|---------|
| AC1 | Cache invalidation on git state changes (via hooks or polling) | Yes | "should return false when git fingerprint changed (ACT-3 AC1)", "should invalidate cache immediately when git state changes (AC1)", "should generate fresh status when git fingerprint changed (ACT-3 AC1)", getGitStateFingerprint tests (3) | PASS |
| AC2 | Multi-terminal concurrent access does not produce corrupt cache | Yes | _acquireLock (4 tests), _isLockStale (3 tests), _releaseLock (2 tests), saveCacheWithLock (5 tests), "should produce valid output under concurrent access (AC2)" | PASS |
| AC3 | Post-commit freshness within 5 seconds | Yes | "should show updated status within 5 seconds after commit (AC3)" -- verifies 2-second-old cache with changed fingerprint is invalidated | PASS |
| AC4 | getCurrentStoryInfo() accurately detects InProgress stories without delay | Yes | "should return fresh data without delay", "should detect status changes immediately" -- no cache between calls, always reads live file system | PASS |
| AC5 | Git post-commit hook exists that clears .aios/project-status.yaml | Yes | "post-commit hook script should exist", "husky post-commit hook should exist" -- verified via `fs.existsSync` on actual file system | PASS |
| AC6 | Worktree-aware: each git worktree maintains its own status cache | Yes | _resolveCacheFilePath (3 tests), _hashString (3 tests), "should isolate cache between worktrees" -- confirms different cache paths for different worktrees | PASS |
| AC7 | Performance: status generation completes within 100ms target | Yes | "should complete cached read within 100ms" -- asserts `elapsed < 100`, "should use Promise.all for parallel git commands" | PASS |
| AC8 | Unit tests cover cache invalidation, multi-terminal, and worktree scenarios | Yes | 90 total tests spanning all AC areas plus original 6.1.2.4 preservation | PASS |

### Test Quality Assessment

- **Coverage:** 8/8 ACs fully covered by automated tests
- **Total tests:** 90 passing in `tests/infrastructure/project-status-loader.test.js`
- **Test execution time:** 0.729s
- **Edge cases covered:**
  - Corrupted cache (invalid YAML, missing `status` field, non-object parsed value) triggers delete + regeneration
  - Stale lock detection and cleanup (10s threshold)
  - Lock file with ENOENT error -> skip locking, still write cache
  - Atomic write rename failure on Windows -> fallback to direct write + temp file cleanup
  - Git not available -> default cache path, null fingerprint
  - Missing HEAD or index file -> partial fingerprint with 0 fallback
  - No stories directory -> null story/epic
  - Non-git repository -> non-git status returned
  - Old git without `branch --show-current` -> fallback to `rev-parse --abbrev-ref HEAD`
  - Both git methods fail -> "unknown" branch
  - WorktreeManager failure -> null worktrees (graceful)
  - Concurrent `saveCacheWithLock` calls complete without error
- **Missing tests:** None critical. The concurrent access test (AC2) simulates parallelism via `Promise.all` on mock I/O. A true multi-process test would require spawning child processes, which is outside typical unit test scope but could be added as an integration test if needed.

### Code Quality

- **Error handling:** Exemplary. Every async operation has try/catch with graceful fallback. Lock acquisition failure does not block cache writes. Post-commit hook silently ignores all errors (non-critical hook). `loadProjectStatus()` returns `getDefaultStatus()` on total failure. Console warnings are used for non-critical failures.
- **Security:** No security concerns. Lock files use `process.pid` and timestamp (no sensitive data). No user input reaches file paths without sanitization. The `_hashString` function is deterministic and collision-resistant for path strings.
- **Performance:** Dual-TTL system (15s active/60s idle) is well-designed. Fingerprint-based invalidation avoids unnecessary regeneration. All 5 git commands in `generateStatus()` run in parallel via `Promise.all()`. Atomic write (temp file + rename) prevents partial-read corruption. Cached read performance assertion enforced at <100ms in test.
- **Cross-platform:** Post-commit hook uses Node.js (not shell) for Windows/macOS/Linux compatibility. Husky wrapper script (`#!/usr/bin/env sh`) delegates to the Node.js hook with `|| true` for graceful failure. Lock file uses `writeFile({ flag: 'wx' })` which is cross-platform. Windows rename fallback explicitly handled.

### Issues Found

None.

### Recommendations

None. Implementation is thorough, well-structured, and covers all 8 acceptance criteria with 90 comprehensive tests. The reliability overhaul is a significant quality improvement over the original 60-second fixed TTL approach.

---

*Epic ACT - Story ACT-3 | Created 2026-02-05 by @po (Pax)*
