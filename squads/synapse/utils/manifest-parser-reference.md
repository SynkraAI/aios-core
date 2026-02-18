# SYNAPSE Manifest & Domain File Format Reference

Reference for the KEY=VALUE format used by the SYN-1 domain-loader parser.

---

## Manifest Format (`.synapse/manifest`)

The manifest is the central registry of all SYNAPSE domains. Each domain has entries with specific suffixes.

### Domain Entry Suffixes

| Suffix | Required | Values | Description |
|--------|----------|--------|-------------|
| `_STATE` | Yes | `active`, `inactive` | Whether domain rules are loaded |
| `_RECALL` | No | comma-separated keywords | Keywords that trigger domain loading via L6 |
| `_EXCLUDE` | No | comma-separated keywords | Keywords that suppress domain loading |
| `_ALWAYS_ON` | No | `true`, `false` | Domain loads on every prompt (L0, L1) |
| `_NON_NEGOTIABLE` | No | `true`, `false` | Rules cannot be overridden (L0 only) |
| `_AGENT_TRIGGER` | No | agent_id | Domain loads when agent is active (L2) |
| `_WORKFLOW_TRIGGER` | No | workflow_id | Domain loads when workflow is active (L3) |

### Global Keys

| Key | Values | Description |
|-----|--------|-------------|
| `DEVMODE` | `true`, `false` | Enable debug/development output |
| `GLOBAL_EXCLUDE` | comma-separated | Global exclusion keywords |

### Example Manifest

```ini
# SYNAPSE Manifest — Central Domain Registry
# Format: KEY=VALUE (parsed by domain-loader.js)

# Layer 0: Constitution (NON-NEGOTIABLE)
CONSTITUTION_STATE=active
CONSTITUTION_ALWAYS_ON=true
CONSTITUTION_NON_NEGOTIABLE=true

# Layer 1: Global
GLOBAL_STATE=active
GLOBAL_ALWAYS_ON=true

# Layer 1: Context brackets
CONTEXT_STATE=active
CONTEXT_ALWAYS_ON=true

# Layer 2: Agent domains
AGENT_DEV_STATE=active
AGENT_DEV_AGENT_TRIGGER=dev

AGENT_QA_STATE=active
AGENT_QA_AGENT_TRIGGER=qa

# Layer 3: Workflow domains
WORKFLOW_STORY_DEV_STATE=active
WORKFLOW_STORY_DEV_WORKFLOW_TRIGGER=story_development

# Layer 7: Star-commands
COMMANDS_STATE=active

# Global settings
DEVMODE=false
GLOBAL_EXCLUDE=
```

---

## Domain File Format (`.synapse/{domain-name}`)

Domain files contain the actual rules. Two formats are supported.

### Format 1: KEY=VALUE (Recommended)

```ini
# Domain: agent-dev
AGENT_DEV_RULE_0=Always use kebab-case for file names
AGENT_DEV_RULE_1=Follow conventional commits format
AGENT_DEV_RULE_2=Write tests for every feature
```

- Key format: `{DOMAIN_KEY}_RULE_{N}=text`
- `N` starts at 0 and auto-increments
- Domain key is UPPERCASE_SNAKE_CASE (e.g., `AGENT_DEV`)

### Format 2: Plain Text

```
# Domain: agent-dev
Always use kebab-case for file names
Follow conventional commits format
Write tests for every feature
```

- Each non-empty, non-comment line is a rule
- Auto-detected by parser (no `_RULE_\d+` pattern found)

### Parsing Rules

- Lines starting with `#` are comments (ignored)
- Empty lines are ignored
- Split on first `=` only (values may contain `=`)
- Windows CRLF and Unix LF both supported
- Malformed lines (no `=` in KEY=VALUE mode) are skipped

---

## Naming Conventions

| Context | Format | Example |
|---------|--------|---------|
| Manifest keys | UPPERCASE_SNAKE_CASE | `AGENT_DEV_STATE` |
| Domain file names | lowercase-kebab-case | `agent-dev` |
| Domain key derivation | Remove suffix, keep prefix | `AGENT_DEV_STATE` -> domain key `AGENT_DEV` |
| File name derivation | Key to kebab-case | `AGENT_DEV` -> file `agent-dev` |

---

## Star-Command Block Format (`.synapse/commands`)

```ini
[*command-name] COMMAND:
COMMANDS_CMD_COMMAND_NAME_0=First instruction
COMMANDS_CMD_COMMAND_NAME_1=Second instruction
```

- Block header: `[*command-name] COMMAND:`
- Command rules use format: `COMMANDS_{CMD_KEY}_{N}=text` (note: no `_RULE_` suffix, unlike domain rules)
- Command key derived from name: `*dev` -> `CMD_DEV`, `*quick-fix` -> `CMD_QUICK_FIX`

---

*Reference for SYN-9 CRUD commands. Source: SYN-1 domain-loader.js parser.*
