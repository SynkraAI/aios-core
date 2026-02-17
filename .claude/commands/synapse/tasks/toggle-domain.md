# Toggle Domain

Toggles a SYNAPSE domain between active and inactive in the manifest.

---

## Purpose

Enable or disable a domain by changing its `_STATE` value in `.synapse/manifest`. This controls whether the domain's rules are loaded by the SYNAPSE engine. The domain file itself is NOT modified.

---

## Prerequisites

- `.synapse/manifest` exists
- Target domain exists in the manifest

---

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `domain-name` | Yes | Domain name to toggle (kebab-case) |

---

## Steps

### Step 1: Validate Domain Exists in Manifest

1. Derive the domain key: `my-domain` -> `MY_DOMAIN`
2. Read `.synapse/manifest`
3. Find the line `{DOMAIN_KEY}_STATE=active` or `{DOMAIN_KEY}_STATE=inactive`

If not found: `Error: Domain "{domain-name}" not found in manifest.`

### Step 2: Toggle State

- If current state is `active`, change to `inactive`
- If current state is `inactive`, change to `active`

**Modify ONLY the manifest file.** Do NOT modify the domain file in `.synapse/{domain-name}`.

Replace the line `{DOMAIN_KEY}_STATE={old-state}` with `{DOMAIN_KEY}_STATE={new-state}` in `.synapse/manifest`.

### Step 3: Display Result

```
Toggled domain "{domain-name}":
  {DOMAIN_KEY}_STATE: {old-state} -> {new-state}
```

### Step 4: Validate

- Read back `.synapse/manifest`
- Verify `{DOMAIN_KEY}_STATE={new-state}` is present
- Verify the domain file was NOT modified (compare timestamp or content)

---

## Validation

- [ ] Domain exists in manifest before toggle
- [ ] Only `_STATE` value changed in manifest
- [ ] Domain file (`.synapse/{domain-name}`) was NOT modified
- [ ] Previous and new state displayed to user
- [ ] Manifest remains parseable after modification

---

## Error Handling

| Error | Message |
|-------|---------|
| Domain not in manifest | `Error: Domain "{name}" not found in manifest.` |
| Manifest not found | `Error: .synapse/manifest not found. SYNAPSE must be initialized first.` |
| Invalid state value | `Error: Unexpected state value "{value}" for domain "{name}". Expected "active" or "inactive".` |

---

*Toggle Domain — SYNAPSE CRUD Command C5*
*Source: SYNAPSE-HOOK-SKILL-COMMAND-ANALYSIS.md section 2.3*
