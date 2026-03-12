# Create Domain

Creates a new SYNAPSE domain file and registers it in the manifest.

---

## Purpose

Create a new custom domain in `.synapse/` with a corresponding entry in `.synapse/manifest`, allowing users to add their own rule sets to the SYNAPSE context engine.

---

## Prerequisites

- `.synapse/manifest` exists
- `.synapse/` directory exists
- User provides a domain name

---

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `domain-name` | Yes | Name for the new domain (kebab-case, lowercase) |
| `description` | No | Short description of the domain's purpose |
| `recall-keywords` | No | Comma-separated RECALL keywords for L6 matching |
| `exclude-keywords` | No | Comma-separated EXCLUDE keywords |
| `initial-rules` | No | One or more initial rules to include |

---

## Steps

### Step 1: Validate Domain Name

- Domain name MUST be lowercase kebab-case (e.g., `my-custom-rules`)
- Allowed characters: `a-z`, `0-9`, `-`
- Must NOT start or end with `-`
- Must NOT be empty

If invalid, report: `Error: Domain name must be lowercase kebab-case (e.g., "my-custom-rules"). Got: "{name}"`

### Step 2: Derive Domain Key

Convert the kebab-case name to UPPERCASE_SNAKE_CASE for use in manifest and domain file:
- `my-custom-rules` -> `MY_CUSTOM_RULES`

### Step 3: Check Uniqueness

Read `.synapse/manifest` and check if `{DOMAIN_KEY}_STATE` already exists.

If it exists, report: `Error: Domain "{domain-name}" already exists in the manifest. Use "add" to add rules to it instead.`

Check if file `.synapse/{domain-name}` already exists on the filesystem.

If it exists, report: `Error: Domain file ".synapse/{domain-name}" already exists on disk.`

### Step 4: Create Domain File

Create `.synapse/{domain-name}` using the template from `.claude/commands/synapse/templates/domain-template`:

```ini
# ==========================================
# SYNAPSE Domain: {DOMAIN_NAME}
# Created: {CURRENT_DATE}
# Description: {DESCRIPTION}
# ==========================================

# Rules
{DOMAIN_KEY}_RULE_0={FIRST_RULE_OR_PLACEHOLDER}
```

- Replace `{DOMAIN_NAME}` with the domain display name (e.g., `My Custom Rules`)
- Replace `{DOMAIN_KEY}` with the UPPERCASE_SNAKE_CASE key
- Replace `{DATE}` with current date (YYYY-MM-DD)
- Replace `{DESCRIPTION}` with user-provided description or `Custom domain`
- If user provided initial rules, add them as `{DOMAIN_KEY}_RULE_0`, `_RULE_1`, etc.
- If no initial rules, use a placeholder: `{DOMAIN_KEY}_RULE_0=Add your first rule here`

### Step 5: Add Manifest Entry

Append to `.synapse/manifest` using the template from `.claude/commands/synapse/templates/manifest-entry-template`:

```ini

# Layer 6: {domain-name}
{DOMAIN_KEY}_STATE=active
{DOMAIN_KEY}_RECALL={recall-keywords-or-empty}
{DOMAIN_KEY}_EXCLUDE={exclude-keywords-or-empty}
```

- Add a blank line before the new entry for readability
- If no RECALL keywords provided, use domain name words as defaults
- EXCLUDE is empty by default

### Step 6: Validate

- Read back the manifest and verify `{DOMAIN_KEY}_STATE=active` is present
- Read back the domain file and verify it parses correctly (has at least one rule line)

---

## Validation

- [ ] Domain file created at `.synapse/{domain-name}`
- [ ] Manifest entry added with `_STATE=active`
- [ ] Domain name is valid kebab-case
- [ ] No duplicate domain in manifest or filesystem
- [ ] Domain file follows KEY=VALUE format parseable by SYN-1

---

## Error Handling

| Error | Message |
|-------|---------|
| Invalid name | `Error: Domain name must be lowercase kebab-case (e.g., "my-custom-rules"). Got: "{name}"` |
| Domain exists (manifest) | `Error: Domain "{name}" already exists in the manifest. Use "add" to add rules to it instead.` |
| Domain exists (file) | `Error: Domain file ".synapse/{name}" already exists on disk.` |
| Manifest not found | `Error: .synapse/manifest not found. SYNAPSE must be initialized first (SYN-8).` |
| Write failure | `Error: Failed to write domain file. Check filesystem permissions.` |

---

*Create Domain — SYNAPSE CRUD Command C2*
*Source: SYNAPSE-HOOK-SKILL-COMMAND-ANALYSIS.md section 2.3*
