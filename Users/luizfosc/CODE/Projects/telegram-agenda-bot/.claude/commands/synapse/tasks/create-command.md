# Create Command

Creates a new star-command block in the SYNAPSE commands domain file.

---

## Purpose

Add a new star-command definition to `.synapse/commands`, allowing users to define custom commands that the SYNAPSE engine's L7 layer will detect and process.

---

## Prerequisites

- `.synapse/commands` file exists
- User provides a command name and at least one rule

---

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `command-name` | Yes | Star-command name without `*` prefix (e.g., `review`) |
| `rules` | Yes | One or more instruction rules for the command (at least 1) |

---

## Steps

### Step 1: Validate Command Name

- Command name must be lowercase kebab-case (e.g., `review`, `quick-fix`)
- Allowed characters: `a-z`, `0-9`, `-`
- Must NOT start or end with `-`
- Must NOT be empty

If invalid: `Error: Command name must be lowercase kebab-case (e.g., "review"). Got: "{name}"`

### Step 2: Check for Duplicates

Read `.synapse/commands` and check if a block header `[*{command-name}]` already exists.

If it exists: `Error: Star-command "*{command-name}" already exists in .synapse/commands. Edit the file directly to modify it.`

### Step 3: Derive Command Key

Convert the command name to uppercase for rule keys:
- `review` -> `CMD_REVIEW`
- `quick-fix` -> `CMD_QUICK_FIX`

Full key prefix: `COMMANDS_{CMD_KEY}`

### Step 4: Append Command Block

Append the new command block to `.synapse/commands`:

```ini

[*{command-name}] COMMAND:
COMMANDS_{CMD_KEY}_0={first-rule}
COMMANDS_{CMD_KEY}_1={second-rule}
```

- Add a blank line before the block for readability
- Each rule is indexed starting from 0
- At least 1 rule is required

### Step 5: Validate

- Verify at least 1 rule was provided
- Read back `.synapse/commands` and verify the block header exists
- Verify rule lines follow `COMMANDS_{CMD_KEY}_{N}=text` format

### Step 6: Confirm

```
Created star-command "*{command-name}" with {count} rules.

The SYNAPSE engine's L7 layer will detect "*{command-name}" in user prompts
and inject the associated rules into the context.
```

---

## Validation

- [ ] Command name is valid kebab-case
- [ ] No duplicate command in `.synapse/commands`
- [ ] At least 1 rule provided
- [ ] Block header follows `[*{name}] COMMAND:` format
- [ ] Rule keys follow `COMMANDS_{CMD_KEY}_{N}=text` format
- [ ] `.synapse/commands` remains parseable after addition

---

## Error Handling

| Error | Message |
|-------|---------|
| Invalid name | `Error: Command name must be lowercase kebab-case (e.g., "review"). Got: "{name}"` |
| Duplicate command | `Error: Star-command "*{name}" already exists in .synapse/commands.` |
| No rules provided | `Error: At least one rule is required for a star-command.` |
| Commands file missing | `Error: .synapse/commands not found. SYNAPSE must be initialized first (SYN-8).` |

---

*Create Command — SYNAPSE CRUD Command C6*
*Source: SYNAPSE-HOOK-SKILL-COMMAND-ANALYSIS.md section 2.3, DESIGN-SYNAPSE-ENGINE.md section 15*
