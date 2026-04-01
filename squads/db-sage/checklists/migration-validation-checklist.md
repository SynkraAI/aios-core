# Migration Validation Checklist

**Purpose:** Validate migration results BEFORE committing changes
**Agent:** Brad (Design System Architect)
**Phase:** After running migration scripts, before git commit
**Critical:** This prevents corrupted migrations from entering codebase

---

## PRE-MIGRATION

- [ ] **Backup created** - Git stash or branch checkpoint exists
- [ ] **Dry run executed** - Script ran with `--dry-run` flag first
- [ ] **Sample reviewed** - Manually checked 3-5 sample changes look correct
- [ ] **Scope understood** - Know exactly how many files/instances will change

---

## POST-MIGRATION (CRITICAL - DO NOT SKIP)

### 1. Build Validation
- [ ] **TypeScript compiles** - `npm run build` passes with 0 errors
- [ ] **Linting passes** - `npm run lint` shows no new errors
- [ ] **No console errors** - Dev server runs without errors
- [ ] **Bundle size check** - CSS bundle didn't explode (target: <50KB for v4)

### 2. Visual Regression Check
- [ ] **Dev server running** - App loads without crashes
- [ ] **Critical pages tested** - Home, dashboard, forms, error states all render
- [ ] **Interactive states work** - Hover, focus, active states function correctly
- [ ] **Dark mode tested** (if applicable) - No broken styles in dark mode
- [ ] **Responsive tested** - Mobile/tablet breakpoints still work

### 3. Code Quality Validation

**CRITICAL: Check for line number corruption**
```bash
# Search for corrupted classes (4+ digit prefixes)
grep -r '\d{4,}(bg-|text-|border-|hover:)' src/
```

- [ ] **No line number prefixes** - No patterns like `7484border-`, `12213text-`
- [ ] **No malformed classes** - No broken className strings
- [ ] **Quotes intact** - All className strings properly quoted
- [ ] **No duplicate classes** - Migration didn't create redundant classes

### 4. Migration Report Review
- [ ] **Instance count matches** - Expected count = actual migrated count
- [ ] **No unexpected changes** - All changes were in scope
- [ ] **Mapping accurate** - Old → new mappings are semantically correct
- [ ] **Coverage complete** - No missed instances of target patterns

---

## COMMON CORRUPTION PATTERNS TO CHECK

### Pattern 1: Line Number Prefixes (HIGH RISK)
```tsx
// ❌ CORRUPTED (from Read tool output with line numbers)
className="7484border-destructive/30 7600bg-destructive/10"

// ✅ CORRECT
className="border-destructive/30 bg-destructive/10"
```

**Detection:**
```bash
grep -rE '\d{4,}(bg-|text-|border-|hover:|focus:)' src/
```

### Pattern 2: Incomplete Replacements
```tsx
// ❌ CORRUPTED (missed variant prefix)
className="hover:bg-red-500"  // Should be hover:bg-destructive

// ✅ CORRECT
className="hover:bg-destructive"
```

**Detection:**
```bash
grep -rE 'hover:(bg|text|border)-(red|green|blue|yellow)-(400|500|600)' src/
```

### Pattern 3: Context-Specific Classes
```tsx
// ❌ WRONG (broke existing semantic meaning)
className="bg-green-500"  // Was intentionally green, not "success"

// ✅ CORRECT (preserved intent)
className="bg-green-500"  // Kept as-is if contextually correct
```

**Validation:** Manual review of high-impact changes

### Pattern 4: String Concatenation Breaks
```tsx
// ❌ CORRUPTED (broken template string)
className={`border-${isError ? 'destructive' : 'border'`}  // Unclosed

// ✅ CORRECT
className={`border-${isError ? 'destructive' : 'border'}`}
```

**Detection:** TypeScript compiler errors

---

## AUTOMATED VALIDATION SCRIPT

```bash
#!/bin/bash
# Add to: scripts/validate-migration.sh

echo "🔍 Running migration validation..."

# 1. Check for line number corruption
echo "Checking for corrupted class names..."
CORRUPTED=$(grep -rE '\d{4,}(bg-|text-|border-|hover:)' src/ | wc -l)
if [ $CORRUPTED -gt 0 ]; then
  echo "❌ Found $CORRUPTED corrupted classes with line number prefixes"
  grep -rE '\d{4,}(bg-|text-|border-|hover:)' src/
  exit 1
fi
echo "✅ No corrupted classes found"

# 2. Build check
echo "Running build..."
npm run build > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "❌ Build failed"
  exit 1
fi
echo "✅ Build passed"

# 3. Lint check
echo "Running lint..."
npm run lint > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "⚠️  Lint issues found (review manually)"
fi

echo ""
echo "✅ Migration validation complete!"
echo "Safe to commit."
```

---

## IF CORRUPTION FOUND

1. **DO NOT COMMIT** - Stop immediately
2. **Run fix script** - Use `fix-corrupted-classnames.cjs` or equivalent
3. **Re-validate** - Run this checklist again
4. **Document issue** - Add to migration-pitfalls.md

---

## ROLLBACK PROCEDURE

If validation fails and fix is complex:

```bash
# 1. Stash or reset changes
git stash  # or: git reset --hard HEAD

# 2. Fix migration script
# Review script logic, add validation

# 3. Re-run with dry-run
node scripts/migrate-*.cjs --dry-run

# 4. Execute and re-validate
node scripts/migrate-*.cjs --execute
# Then run this checklist again
```

---

## COMMIT CHECKLIST

Only commit when:
- [ ] All validation steps above passed
- [ ] Visual regression test completed
- [ ] Migration report saved to docs/
- [ ] Commit message includes scope, instance count, impact
- [ ] PR/MR includes before/after screenshots (if UI changes)

---

**Brad's Note:**
This checklist exists because I fucked up in Sprint 4 by copying Read tool output (with line numbers) directly into find/replace operations. That created 274 corrupted classes across 26 files. Don't be like past Brad. Use this checklist.

**Validation Time:** 5-10 minutes (saves hours of debugging)
**Last Updated:** 2025-11-03 (after corruption incident)
