# Add Rule

Adds a new rule to an existing SYNAPSE domain file.

---

## Purpose

Append a new rule to a domain file in `.synapse/`, auto-incrementing the rule index to maintain a valid KEY=VALUE sequence.

---

## Prerequisites

- `.synapse/manifest` exists
- Target domain exists in manifest AND as a file in `.synapse/`

---

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `domain-name` | Yes | Existing domain name (kebab-case) |
| `rule-text` | Yes | The rule text to add |

---

## Steps

### Step 1: Validate Domain Exists

1. Derive the domain key: `my-domain` -> `MY_DOMAIN`
2. Read `.synapse/manifest` and check that `{DOMAIN_KEY}_STATE` exists
3. Check that `.synapse/{domain-name}` file exists on disk

If domain not found in manifest: `Error: Domain "{domain-name}" not found in manifest. Use "create" to create it first.`

If domain file not found: `Error: Domain file ".synapse/{domain-name}" not found on disk. Manifest entry exists but file is missing.`

### Step 2: Find Next Rule Index

Read the domain file `.synapse/{domain-name}` and find all existing rules matching the pattern `{DOMAIN_KEY}_RULE_{N}=`.

Count the number of matching rules. The new rule index is `count(matching_rules)`.

This ensures sequential indices with no gaps (e.g., if rules 0 and 2 exist but 1 was deleted, there are 2 rules, so the next index is 2 — which re-fills gaps).

If no rules exist yet, start at `0`.

### Step 3: Append Rule

Append the new rule line to the domain file:

```
{DOMAIN_KEY}_RULE_{NEXT_INDEX}={rule-text}
```

Ensure there is a newline before the new rule if the file does not end with one.

### Step 4: Confirm

Display confirmation:
```
Added rule to {domain-name}:
  {DOMAIN_KEY}_RULE_{NEXT_INDEX}={rule-text}

Domain now has {TOTAL} rules.
```

---

## Validation

- [ ] Domain exists in both manifest and filesystem before adding
- [ ] Rule index auto-incremented correctly (no gaps, no duplicates)
- [ ] Rule line follows `{DOMAIN_KEY}_RULE_{N}=text` format
- [ ] Domain file remains parseable after addition

---

## Error Handling

| Error | Message |
|-------|---------|
| Domain not in manifest | `Error: Domain "{name}" not found in manifest. Use "create" to create it first.` |
| Domain file missing | `Error: Domain file ".synapse/{name}" not found on disk.` |
| Empty rule text | `Error: Rule text cannot be empty.` |
| Manifest not found | `Error: .synapse/manifest not found. SYNAPSE must be initialized first.` |

---

*Add Rule — SYNAPSE CRUD Command C3*
*Source: SYNAPSE-HOOK-SKILL-COMMAND-ANALYSIS.md section 2.3*
