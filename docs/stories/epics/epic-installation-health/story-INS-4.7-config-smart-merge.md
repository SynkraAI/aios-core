# Story INS-4.7: YAML Merger Strategy + Config Smart Merge (Phase 1)

**Epic:** Installation Health & Environment Sync (INS-4)
**Wave:** 3 — Runtime Health & Upgrade Safety (P2)
**Points:** 5
**Agents:** @dev
**Status:** Draft
**Blocked By:** —
**Created:** 2026-02-23

**Executor Assignment:**
- **executor:** @dev
- **quality_gate:** @architect
- **quality_gate_tools:** [merge correctness tests, user config preservation test, conflict warning test, npm test]

---

## Story

**As a** developer upgrading aios-core in an existing project,
**I want** my `core-config.yaml` to receive new keys from the framework while preserving my customizations,
**so that** upgrades never silently overwrite my project configuration or leave me with an outdated config missing new framework features.

### Context

The brownfield upgrader (`brownfield-upgrader.js`) uses hash comparison for `core-config.yaml`: if the user modified the file, the new version from the framework is ignored; if not modified, the framework version overwrites entirely. There is no merge — only replace-or-ignore.

The existing merger module (`packages/installer/src/merger/`) supports `.env` (env-merger.js) and `.md` (markdown-merger.js) strategies. It uses a strategy pattern via `registerStrategy`. **There is no YAML strategy** (Codex Finding C3).

**Phase 1 Scope (PM Decision):** Add new keys only + warn on conflicts. Full 3-way merge is future work.

**Phase 1 Rules:**
- Keys present in framework source but missing from user config → ADD to user config
- Keys modified by user (diff from framework default) → PRESERVE user value + log INFO
- Keys removed from source framework config → KEEP in user config + log WARN (deprecated key)
- Keys modified in BOTH source and user (conflict) → PRESERVE user value + log WARN

**Codex Finding (CRITICO C3):** Merger has no YAML strategy. Must add `yaml-merger.js` following the existing strategy pattern. Sizing increased from 3 to 5 pts.

---

## Acceptance Criteria

### AC1: YAML Merger Strategy Created
- [ ] `packages/installer/src/merger/strategies/yaml-merger.js` created following the same interface as `env-merger.js` and `markdown-merger.js`
- [ ] Strategy registered in `packages/installer/src/merger/strategies/index.js` for `.yaml` extension
- [ ] Strategy implements: `merge(sourceContent, targetContent, options) => MergeResult` using `createMergeResult(content, stats, changes)` from `packages/installer/src/merger/types.js`

### AC2: Merge Logic — Phase 1 Rules
- [ ] New keys in source (not in target) → added to target; tracked as `MergeChange` with `type: 'added'`
- [ ] Keys present in both with same value → target value preserved; tracked as `MergeChange` with `type: 'preserved'`
- [ ] Keys removed from source but present in target → kept in target; tracked as `MergeChange` with `type: 'conflict'`, `reason: 'Deprecated key — may be removed in future version'`
- [ ] Conflicts (key present in both, different values) → target wins; tracked as `MergeChange` with `type: 'conflict'`, `reason: 'Keeping user value'`
- [ ] Result is valid YAML (parseable)
- [ ] All changes returned in `MergeResult.changes` array (not a separate `warnings` array)

### AC3: Integrated with Brownfield Upgrader
- [ ] `packages/installer/src/installer/brownfield-upgrader.js` uses `yaml-merger.js` for `core-config.yaml` during upgrade
- [ ] Old behavior (hash-compare → replace or ignore) replaced by merge for `core-config.yaml` specifically
- [ ] Other files upgraded by brownfield-upgrader are unaffected

### AC4: User Config Preservation Verified
- [ ] Test: user has custom `pvMindContext.location` value → after upgrade → value preserved
- [ ] Test: framework adds new key `someNewFeature.enabled: true` → after upgrade → key present in user config
- [ ] Test: conflict → user value wins → WARN logged (not silently overwritten)

### AC5: Migration Config Compatibility
- [ ] `yaml-merger.js` respects `boundary` section — does NOT remove user-customized boundary paths
- [ ] If `migrate-config.js` runs before merger, merger receives already-migrated config (no double-migration)
- [ ] Verify integration order: migrate → merge → write

### AC6: Regression Test Coverage
- [ ] Unit tests for `yaml-merger.js`: add new keys, preserve existing, deprecation warn, conflict warn
- [ ] Integration test: full upgrade simulation with modified `core-config.yaml` → verify preservation
- [ ] Existing `packages/installer/tests/unit/merger/strategies.test.js` still passes
- [ ] `npm test` passes with zero new failures

---

## Tasks / Subtasks

### Task 1: Read Existing Merger Pattern (AC1)
- [ ] 1.1 Read `packages/installer/src/merger/index.js` (71 lines) — understand entry point and `registerStrategy` API
- [ ] 1.2 Read `packages/installer/src/merger/strategies/base-merger.js` — understand interface contract
- [ ] 1.3 Read `packages/installer/src/merger/strategies/env-merger.js` — understand merge implementation pattern
- [ ] 1.4 Read `packages/installer/src/merger/strategies/markdown-merger.js` — understand section-based merge pattern
- [ ] 1.5 Read `packages/installer/src/merger/strategies/index.js` (lines 16-24) — understand strategy registration

### Task 2: Read Brownfield Upgrader (AC3)
- [ ] 2.1 Read `packages/installer/src/installer/brownfield-upgrader.js` (438 lines) — understand hash-compare logic for `core-config.yaml`
- [ ] 2.2 Read `packages/installer/src/installer/file-hasher.js` (234 lines) — understand hash comparison
- [ ] 2.3 Read `packages/installer/src/installer/manifest-signature.js` (378 lines) — understand manifest tracking
- [ ] 2.4 Identify exact lines in upgrader where `core-config.yaml` is handled — that's where the merger replaces hash-compare

### Task 3: Read Config System (AC5)
- [ ] 3.1 Read `.aios-core/core/config/merge-utils.js` (101 lines) — can this be reused in yaml-merger?
- [ ] 3.2 Read `.aios-core/core/config/migrate-config.js` (291 lines) — understand migration order
- [ ] 3.3 Confirm: migrate runs BEFORE merge during upgrade, so merger receives post-migration config

### Task 4: Implement YAML Merger Strategy (AC1, AC2)
- [ ] 4.1 Create `packages/installer/src/merger/strategies/yaml-merger.js`
- [ ] 4.2 Implement `merge(sourceContent, targetContent, options)` using `js-yaml` for parse/stringify
- [ ] 4.3 Implement Phase 1 rules: add new keys, preserve existing, warn deprecated, warn conflicts
- [ ] 4.4 Collect changes during merge as `MergeChange` objects: `{ type: 'preserved'|'updated'|'added'|'conflict', identifier: key, reason: string }`
- [ ] 4.5 Return `createMergeResult(yamlString, stats, changes)` using `createEmptyStats()` and `createMergeResult()` from `packages/installer/src/merger/types.js`
- [ ] 4.6 Register in `strategies/index.js`: `registerStrategy('.yaml', YamlMerger)`

### Task 5: Integrate with Brownfield Upgrader (AC3)
- [ ] 5.1 Modify `brownfield-upgrader.js`: for `core-config.yaml`, use `yamlMerger.merge()` instead of hash-compare
- [ ] 5.2 Log warnings collected during merge to upgrade summary
- [ ] 5.3 Ensure other files upgraded by upgrader still use original hash-compare logic (no regression)

### Task 6: Add Backup Safety (Codex Risk Mitigation)
- [ ] 6.1 Before writing merged `core-config.yaml`, save backup: `core-config.yaml.backup-{timestamp}`
- [ ] 6.2 On merge error, restore from backup
- [ ] 6.3 Document backup behavior in upgrade summary

### Task 7: Tests (AC6)
- [ ] 7.1 Unit tests for `yaml-merger.js`:
  - New key in source → added to merged output
  - Key in both → target value preserved
  - Key in target but not source → kept + WARN
  - Conflict → target wins + WARN
  - Output is valid YAML
- [ ] 7.2 Integration test: upgrade with modified `core-config.yaml` → custom values preserved
- [ ] 7.3 Verify `strategies.test.js` still passes
- [ ] 7.4 `npm test` regression check

---

## Dev Notes

### Key Files (Read These First)

| File | Lines | Purpose |
|------|-------|---------|
| `packages/installer/src/merger/strategies/env-merger.js` | — | Implementation pattern to follow |
| `packages/installer/src/merger/strategies/index.js` | lines 16-24 | Strategy registration |
| `packages/installer/src/merger/index.js` | 71 | Entry point |
| `packages/installer/src/installer/brownfield-upgrader.js` | 438 | Where to swap hash-compare for merge |
| `packages/installer/src/installer/file-hasher.js` | 234 | Hash comparison (used by upgrader) |
| `packages/installer/src/merger/strategies/base-merger.js` | — | Interface contract |
| `.aios-core/core/config/merge-utils.js` | 101 | Deep merge util — potentially reusable |

### YAML Merger Phase 1 Rules (Reference)

```
Source (framework):          Target (user):          Result:
------------------          ---------------         --------
newKey: value         +     (not present)    →      newKey: value [ADDED]
existingKey: A        +     existingKey: B    →      existingKey: B [PRESERVED, user wins]
removedKey: X         +     (only in target)  →      removedKey: X [KEPT, WARN deprecated]
conflictKey: A        +     conflictKey: B    →      conflictKey: B [WARN conflict, user wins]
```

### Merger Pattern (Follow types.js Contract)

The merger module uses `MergeResult = { content, stats, changes }` from `packages/installer/src/merger/types.js`. There is NO `warnings` field — warnings/conflicts are represented as `MergeChange` objects with `type: 'conflict'` and a `reason`.

```javascript
// yaml-merger.js
const yaml = require('js-yaml');
const { createMergeResult, createEmptyStats } = require('../types');

class YamlMerger extends BaseMerger {
  merge(sourceContent, targetContent, options = {}) {
    const source = yaml.load(sourceContent);
    const target = yaml.load(targetContent);
    const stats = createEmptyStats();
    const changes = [];
    const merged = { ...target }; // start from user config

    // Add new keys from source
    for (const [key, value] of Object.entries(source)) {
      if (!(key in target)) {
        merged[key] = value;
        stats.added++;
        changes.push({ type: 'added', identifier: key, reason: 'New key from framework' });
      } else if (JSON.stringify(target[key]) !== JSON.stringify(value)) {
        // Conflict: user value wins
        stats.conflicts++;
        changes.push({ type: 'conflict', identifier: key, reason: `Keeping user value` });
      } else {
        stats.preserved++;
        changes.push({ type: 'preserved', identifier: key });
      }
    }

    // Deprecated keys (in target but not in source)
    for (const key of Object.keys(target)) {
      if (!(key in source)) {
        stats.conflicts++;
        changes.push({ type: 'conflict', identifier: key, reason: 'Deprecated — not in latest framework config' });
      }
    }

    return createMergeResult(yaml.dump(merged), stats, changes);
  }
}
```

**CRITICAL:** Return `createMergeResult(content, stats, changes)` — NOT `{ merged, warnings }`. Read `base-merger.js` to understand the actual interface contract before implementing.

### Scope Boundary: Phase 1 Only

PM explicitly scoped this to Phase 1 (add new keys + warn conflicts). Do NOT implement:
- 3-way merge (source + base + target)
- `.installed-manifest.yaml` tracking for base version
- Key deletion from user config

These are future work (Phase 2+).

### Boundary Key Warning

The `boundary` section in `core-config.yaml` has user-defined protected paths. The merger must NOT remove user-customized paths from `boundary.protected` or `boundary.exceptions`. Verify the Phase 1 rules (target wins on all existing keys) handle this correctly.

### Testing

**Test Location:** `packages/installer/tests/unit/merger/`

**Key Scenarios:**
1. New key added: source has `newFeature: { enabled: true }`, target does not → merged has `newFeature`
2. User value preserved: source has `boundary.frameworkProtection: true`, user has `false` → merged has `false`
3. Deprecated key: target has `legacyKey: value`, source does not → merged keeps `legacyKey` + warns
4. Conflict warn: both have `someKey` with different values → user value in merged + WARN message
5. Integration: upgrade with real `core-config.yaml` → user customizations preserved, new keys added

---

## CodeRabbit Integration

**Story Type:** Architecture (new merger strategy) + Integration (brownfield upgrader)
**Complexity:** High (5 pts — new strategy, merger integration, upgrade safety, backup logic)

**Quality Gates:**
- [ ] Pre-Commit (@dev): Run before marking story complete — focus on merge logic correctness
- [ ] Pre-PR (@architect): Architecture review — merger pattern consistency, upgrade safety

**Self-Healing Configuration:**
- **Mode:** light
- **Max Iterations:** 2
- **Timeout:** 15 minutes
- **Severity Filter:** CRITICAL only

**Predicted Behavior:**
- CRITICAL issues: auto_fix (up to 2 iterations)
- HIGH issues: document_only

**Focus Areas (Primary):**
- Merge correctness: user values never silently overwritten
- Backup safety: backup created before merge, restored on error
- Scope adherence: Phase 1 only (no 3-way merge)

**Focus Areas (Secondary):**
- YAML validity: merged output must be parseable by js-yaml
- Existing strategies: env-merger and markdown-merger tests still pass

---

## Dev Agent Record

### Agent Model Used
_To be filled by @dev_

### Debug Log References
_To be filled by @dev_

### Completion Notes
_To be filled by @dev_

### File List
_To be filled by @dev_

---

## QA Results
_To be filled by @qa_

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-23 | @sm (River) | Story drafted from Epic INS-4 handoff secao 3.7 + Codex Finding C3 (merger sem YAML strategy, sizing 3→5 pts) + PM decision (fase 1 only: add new keys + warn conflicts) |
| 2026-02-23 | @sm (River) | [Codex Story Review] Contrato MergeResult corrigido: merger retorna `createMergeResult(content, stats, changes)` de types.js, NAO `{ merged, warnings }`. AC1, AC2, Task 4.4, Task 4.5 e Dev Notes "Merger Pattern" atualizados. Changes sao `MergeChange` objects com `type` e `reason`, nao array `warnings` separado. |
