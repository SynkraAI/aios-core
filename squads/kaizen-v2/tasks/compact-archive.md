---
task:
  name: compact-archive
  status: SPEC_DEFINED
  version: 1.0.0
  responsible_executor: memory-keeper
  execution_type: SCHEDULED (quarterly) | MANUAL (*archive)
  trigger:
    scheduled: "Cron: First day of quarter at 3am"
    manual: "*archive command"
---

# compact-archive

## Task Anatomy

### Input
- `data/intelligence/daily/` (all files)
- `data/intelligence/knowledge/patterns.yaml`
- `data/intelligence/archive/` (existing archived patterns)

### Output
- **Rotate dailies:** Move `daily/` files > 90 days old to `data/intelligence/archive/dailies/`
- **Delete patterns:** Remove unverified patterns with `decay < delete_threshold` (default 0.05). Verified or missing-verified patterns with `decay < delete_threshold` are archived instead (see Phase 2 precedence rules).
- **Archive patterns:** Move patterns with `delete_threshold <= decay < archive_threshold` (default 0.05-0.1) to `data/intelligence/archive/patterns.yaml.archive`
- **Keep patterns:** Patterns with `decay >= archive_threshold` (default 0.1) remain active
- **Backup:** Create `patterns.yaml.bak` before modifications
- Updated `data/intelligence/knowledge/patterns.yaml` (cleaned)

### Acceptance Criteria
- [ ] All daily files > 90 days old moved to `data/intelligence/archive/dailies/`
- [ ] All unverified patterns with `decay < delete_threshold` deleted (with audit log); verified/missing-verified patterns archived instead
- [ ] All patterns with `delete_threshold <= decay < archive_threshold` moved to `data/intelligence/archive/patterns.yaml.archive`
- [ ] `patterns.yaml.bak` created before cleanup
- [ ] patterns.yaml metadata updated (total_patterns, deleted_patterns, archived_patterns)
- [ ] Cleanup log generated with: files archived, patterns archived, patterns deleted

---

## Detailed Specification

### Phase 1: Daily Rotation
1. List all files in `data/intelligence/daily/`
2. Filter: files whose **filename date** (YYYY-MM-DD from the `YYYY-MM-DD.yaml` naming convention) is > 90 days old. Do NOT use filesystem mtime — it can be unreliable after git clone, copy, or restore operations.
3. Create `data/intelligence/archive/dailies/` if missing
4. Move filtered files to `data/intelligence/archive/dailies/YYYY-MM/`
5. Log: N files archived, date range

### Phase 2: Pattern Archive

> **Note:** Thresholds referenced below are defined in `config/config.yaml` (`delete_threshold: 0.05`, `archive_threshold: 0.1`). Always use config values as authoritative source.

1. Load `patterns.yaml`
2. Create backup: `cp data/intelligence/knowledge/patterns.yaml data/intelligence/knowledge/patterns.yaml.bak`
3. For each pattern (thresholds from config: `delete_threshold`, `archive_threshold`):
   - If `decay_score < delete_threshold` AND `verified === true`: Archive + flag `archived_verified: true` (never delete verified patterns). Flag is stored in the archived pattern's YAML entry in `patterns.yaml.archive`.
   - Else if `decay_score < delete_threshold` AND `verified === false`: Delete entirely + log to audit.log
   - Else if `decay_score < delete_threshold` AND `verified` is missing/null: Archive (do not delete) + log to audit.log with warning "missing verified field — archived as precaution"
   - Else if `delete_threshold <= decay_score < archive_threshold`: Move to `data/intelligence/archive/patterns.yaml.archive`
   - Else (`decay_score >= archive_threshold`): Keep in active patterns.yaml
4. Update metadata: total_patterns, archived_patterns, deleted_patterns
5. Log: N patterns archived, N patterns deleted

### Phase 3: Cleanup Log
Generate `data/intelligence/archive/cleanup-YYYY-MM-DD.log`:
```text
# Compact-Archive Run — YYYY-MM-DD HH:MM:SS

## Daily Files
- Files archived: N
- Date range: YYYY-MM-DD to YYYY-MM-DD
- New archive: data/intelligence/archive/dailies/YYYY-MM/

## Patterns
- Patterns archived: N
  - Archive file: data/intelligence/archive/patterns.yaml.archive (appended)
- Patterns deleted: N (decay < {delete_threshold})
  - IDs: [p001, p002, ...]
- Active patterns remain: N

## Backup
- Backup created: data/intelligence/knowledge/patterns.yaml.bak (timestamp)
- Recovery: cp data/intelligence/knowledge/patterns.yaml.bak data/intelligence/knowledge/patterns.yaml if needed

## Status: OK
```

### Constraints
- Decay decision tree (verified field determines precedence): `< delete_threshold` AND `verified: true` = archive + flag (never delete), `< delete_threshold` AND `verified: false` = delete, `< delete_threshold` AND `verified` missing/null = archive as precaution, `delete_threshold <= decay < archive_threshold` = archive, `>= archive_threshold` = keep
- Never delete patterns with `verified: true` — archive with `archived_verified: true` flag instead
- Always create backup before deletions
- Mutex: Do not execute compact-archive while reflect is in progress
- Fallback: If deletion fails, leave in active (won't harm, just cluttered)

## Veto Conditions
- "Patterns deletados sem backup prévio (patterns.yaml.bak) → ABORTAR IMEDIATAMENTE"
- "Pattern com verified: true deletado em vez de arquivado → REVERTER (patterns verificados NUNCA são deletados)"
- "Daily arquivado com base em mtime do filesystem em vez de data do filename → REDO (mtime é não-confiável após git clone)"
- "Compact-archive executado enquanto reflect está em progresso → BLOQUEAR (mutex violation)"
- "Cleanup log não gerado após operação de archive/delete → REDO fase 3"

## Success Criteria
- PASS: All old dailies archived, patterns archived/deleted correctly, backup created, log generated
- FAIL: Backup creation failed, patterns.yaml corrupted, unable to create archive dirs
- WARN: No dailies > 90 days (normal if < 3 months old), no patterns to archive (normal if active learnings)

## Error Handling
- If `data/intelligence/archive/` dirs don't exist: Create them automatically
- If `patterns.yaml.bak` fails: Abort cleanup (never delete without backup)
- If decay calc is wrong: Use conservative threshold (keep if uncertain)
- If cleanup log fails: Continue (cleanup happened, just missing audit trail)
