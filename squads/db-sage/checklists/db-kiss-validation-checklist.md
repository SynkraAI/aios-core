# DB KISS Validation Checklist

**Purpose:** Prevent over-engineering by validating reality BEFORE proposing any schema changes.

**When to use:** MANDATORY before any `*create-schema`, `*domain-modeling`, or schema design work.

**Pass criteria:** All checkboxes must be checked with evidence. If any step FAILs → Do not proceed with schema design.

---

## STEP 1: Reality Check

### System Status

- [ ] **System works today?**
  - Status: [ ] Yes [ ] No
  - Evidence (command that proves it works):
    ```bash

    ```
  - Output/proof:
    ```

    ```

- [ ] **Tested current functionality?**
  - Command executed:
    ```bash

    ```
  - Result: [ ] Success [ ] Failed [ ] N/A

- [ ] **Where is state stored?**
  - [ ] Filesystem (path: `___________`)
  - [ ] Memory (process/variable: `___________`)
  - [ ] Database (tables: `___________`)
  - [ ] API (endpoint: `___________`)
  - [ ] Other: `___________`

- [ ] **What breaks without a database?**
  - Answer: `___________`
  - **CRITICAL:** If answer is "nothing" or "filesystem works fine" → **STOP HERE**
    - Recommendation: Keep current approach (filesystem/memory/API)
    - Rationale: Database adds complexity without solving a real problem

---

## STEP 2: Pain Validation (ASK USER)

**MANDATORY:** You must ask the user these questions explicitly. Do not assume answers.

- [ ] **Asked user: "Do you have a problem with [system/feature] today?"**
  - User answer: `___________`
  - User exact quote: "`___________`"

- [ ] **If yes, asked: "What specifically breaks or frustrates you?"**
  - Specific pain point: `___________`
  - Impact: [ ] High [ ] Medium [ ] Low
  - Workarounds currently used: `___________`

- [ ] **Asked: "How often does this problem occur?"**
  - Frequency: [ ] Daily [ ] Weekly [ ] Monthly [ ] Rarely [ ] Once
  - Affects: [ ] All users [ ] Some users [ ] Edge case

- [ ] **GATE CHECK: If user says "No problem" or "Works fine"**
  - **STOP HERE → Recommend keeping current approach**
  - Do not proceed with schema design

---

## STEP 3: Existing Schema Check

**Before creating new tables, check what ALREADY exists.**

- [ ] **Listed all tables in current Supabase schema**
  - Command used:
    ```sql
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' ORDER BY table_name;
    ```
  - Tables found (list relevant ones):
    ```
    1. ___________
    2. ___________
    3. ___________
    ```

- [ ] **Identified tables relevant to the pain point**
  - Relevant tables:
    - `___________` - reason: `___________`
    - `___________` - reason: `___________`

- [ ] **Analyzed if existing tables can solve the pain**
  - Can existing tables solve it?: [ ] Yes [ ] No [ ] Partially
  - Why / Why not?: `___________`

- [ ] **Proposed 1-3 field additions to existing tables BEFORE new tables**
  - Option 1: Add fields to `___________`:
    ```sql
    ALTER TABLE ___________ ADD COLUMN ___________ TYPE;
    ```
  - Option 2: Add fields to `___________`:
    ```sql
    ALTER TABLE ___________ ADD COLUMN ___________ TYPE;
    ```
  - Solves pain how?: `___________`

- [ ] **If existing tables cannot solve pain, documented why**
  - Reason existing tables don't work: `___________`
  - Must be technical limitation, not preference

---

## STEP 4: Minimum Increment

**Propose the SMALLEST change that solves the validated pain.**

- [ ] **Selected minimal approach** (check one):
  - [ ] **Option 0:** No database changes needed (filesystem/script solves it)
  - [ ] **Option 1:** Add 1-3 fields to existing table (ALTER TABLE)
  - [ ] **Option 2:** Create 1 new table with 5-7 essential fields only
  - [ ] **Option 3:** Create multiple tables (requires extraordinary justification)

- [ ] **Defined minimal change**
  - If Option 0 (no DB):
    - Solution: `___________`
    - Command/script: `___________`

  - If Option 1 (add fields):
    - Table: `___________`
    - Fields to add (max 3):
      1. `___________` - type: `___________` - purpose: `___________`
      2. `___________` - type: `___________` - purpose: `___________`
      3. `___________` - type: `___________` - purpose: `___________`

  - If Option 2 (new table):
    - Table name: `___________`
    - Essential fields only (max 7 for MVP):
      1. `___________` - type: `___________` - purpose: `___________`
      2. `___________` - type: `___________` - purpose: `___________`
      3. `___________` - type: `___________` - purpose: `___________`

  - If Option 3 (multiple tables):
    - ⚠️  **Extraordinary justification required:**
      ```


      ```

- [ ] **How does this minimal change solve the specific pain?**
  - Before (with pain): `___________`
  - After (pain solved): `___________`
  - Query/operation enabled: `___________`

- [ ] **Avoided future-proofing and speculative features**
  - Removed features: `___________`
  - Kept only: `___________`

---

## STEP 5: Trade-Offs (Present to User)

**Never assume database is better. Let user decide.**

- [ ] **Documented filesystem approach**
  - Pros:
    - ✅ `___________`
    - ✅ `___________`
  - Cons:
    - ❌ `___________`
    - ❌ `___________`
  - Effort: [ ] 0 hours [ ] <1 hour [ ] 1-2 hours

- [ ] **Documented minimal database approach**
  - Pros:
    - ✅ `___________`
    - ✅ `___________`
  - Cons (complexity cost):
    - ❌ Migration required: `___________`
    - ❌ RLS policies needed: `___________`
    - ❌ Code changes: `___________`
  - Effort: [ ] 1-2 hours [ ] 3-5 hours [ ] 1+ day

- [ ] **Presented trade-offs to user explicitly**
  - User preference: [ ] Filesystem [ ] Database [ ] Undecided

- [ ] **Let user choose (did not assume database is automatically better)**

---

## RED FLAG CHECK

**If ANY of these are true, STOP and re-validate:**

- [ ] ⚠️  Proposing 3+ new tables without user explicitly requesting → **FAIL**
- [ ] ⚠️  Proposing 10+ new fields without validated pain point → **FAIL**
- [ ] ⚠️  Assuming analytics/tracking are needed without evidence → **FAIL**
- [ ] ⚠️  Designing for "future needs" instead of current pain → **FAIL**
- [ ] ⚠️  Did not check existing schema first → **FAIL**
- [ ] ⚠️  Over-engineering beyond the specific problem stated → **FAIL**

**If any red flag is checked → Go back to Step 1 and restart validation.**

---

## FINAL VALIDATION

- [ ] **All 5 steps completed with evidence**
- [ ] **User pain validated (not assumed)**
- [ ] **Existing schema checked**
- [ ] **Minimal approach proposed**
- [ ] **Trade-offs presented to user**
- [ ] **No red flags triggered**

**Result:**
- [ ] **PASS** → Proceed with minimal schema design
- [ ] **FAIL** → Do not proceed, recommend current approach

---

## 📋 Summary for User

**Current System Status:**
- Works: [ ] Yes [ ] No
- State storage: `___________`

**Validated Pain Point:**
- Problem: `___________`
- Frequency: `___________`

**Recommendation:**
- [ ] **Option 0:** Keep current approach (filesystem/script) - Effort: `___________`
- [ ] **Option 1:** Add 1-3 fields to existing table - Effort: `___________`
- [ ] **Option 2:** Create 1 minimal table - Effort: `___________`

**Trade-offs:**
| Approach | Pros | Cons | Effort |
|----------|------|------|--------|
| Current (no DB) | `___________` | `___________` | `___________` |
| Minimal DB | `___________` | `___________` | `___________` |

**Your Choice:** Let user decide based on priorities (simplicity vs queryability).

---

**GOLDEN RULE:** If it works today, changing it needs extraordinary justification.
