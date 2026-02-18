# Edit Rule

Edits or removes a rule by index in an existing SYNAPSE domain file.

---

## Purpose

Modify the text of an existing rule or delete it entirely, re-numbering remaining rules to maintain a sequential index.

---

## Prerequisites

- `.synapse/manifest` exists
- Target domain exists in manifest AND as a file in `.synapse/`
- Target rule index exists in the domain file

---

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `domain-name` | Yes | Existing domain name (kebab-case) |
| `index` | Yes | Rule index number to edit or remove |
| `new-text` | No | New rule text (omit to delete the rule) |

---

## Steps

### Step 1: Validate Domain Exists

1. Derive the domain key: `my-domain` -> `MY_DOMAIN`
2. Verify `{DOMAIN_KEY}_STATE` exists in `.synapse/manifest`
3. Verify `.synapse/{domain-name}` file exists on disk

### Step 2: Find Target Rule

Read the domain file and find the line matching `{DOMAIN_KEY}_RULE_{index}=`.

If not found: `Error: Rule index {index} not found in domain "{domain-name}". Domain has rules 0-{max}.`

### Step 3: Edit or Delete

**If new-text is provided (EDIT):**
- Replace the rule line with `{DOMAIN_KEY}_RULE_{index}={new-text}`
- Display: `Updated rule {index} in {domain-name}: {new-text}`

**If new-text is NOT provided (DELETE):**
- Remove the rule line from the file
- Re-number all remaining rules sequentially starting from 0
- Display: `Deleted rule {index} from {domain-name}. Re-numbered {count} remaining rules.`

### Step 4: Re-Number After Deletion

When a rule is deleted, re-number all remaining rules to maintain a sequential index:

**Before:**
```
MY_DOMAIN_RULE_0=First rule
MY_DOMAIN_RULE_1=Second rule  <-- DELETED
MY_DOMAIN_RULE_2=Third rule
```

**After:**
```
MY_DOMAIN_RULE_0=First rule
MY_DOMAIN_RULE_1=Third rule
```

Algorithm:
1. Collect all rule values (preserving order, excluding deleted rule)
2. Rewrite all rules with sequential indices starting from 0
3. Preserve all non-rule lines (comments, blanks) in their original positions

### Step 5: Validate

- Read back the domain file
- Verify rules are sequentially numbered (0, 1, 2, ... N) with no gaps
- Verify total rule count matches expected (original count minus 1 for delete)

---

## Validation

- [ ] Target rule exists before edit/delete
- [ ] After edit: rule text updated correctly
- [ ] After delete: remaining rules re-numbered sequentially (no gaps)
- [ ] Non-rule lines (comments, blanks) preserved
- [ ] Domain file remains parseable after modification

---

## Error Handling

| Error | Message |
|-------|---------|
| Domain not found | `Error: Domain "{name}" not found in manifest.` |
| Domain file missing | `Error: Domain file ".synapse/{name}" not found on disk.` |
| Index not found | `Error: Rule index {index} not found in domain "{name}". Domain has rules 0-{max}.` |
| Negative index | `Error: Rule index must be a non-negative integer.` |
| Edit with empty text | `Error: New rule text cannot be empty. To delete, omit the new text.` |

---

*Edit Rule — SYNAPSE CRUD Command C4*
*Source: SYNAPSE-HOOK-SKILL-COMMAND-ANALYSIS.md section 2.3*
