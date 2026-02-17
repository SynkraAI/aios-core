# SYNAPSE Manager

CRUD command router for managing SYNAPSE domains, rules, and star-commands.

---

## What This Command Does

When the user requests a SYNAPSE management operation (create domain, add rule, edit rule, toggle domain, create command, or suggest domain), this manager identifies the sub-command and dispatches to the appropriate task file.

---

## Sub-Command Detection

Analyze the user's request and match to one of these operations:

| Intent Keywords | Sub-Command | Task File |
|-----------------|-------------|-----------|
| "create domain", "new domain", "add domain" | **create** | `.claude/commands/synapse/tasks/create-domain.md` |
| "add rule", "new rule", "append rule" | **add** | `.claude/commands/synapse/tasks/add-rule.md` |
| "edit rule", "change rule", "remove rule", "delete rule", "update rule" | **edit** | `.claude/commands/synapse/tasks/edit-rule.md` |
| "toggle domain", "enable domain", "disable domain", "activate", "deactivate" | **toggle** | `.claude/commands/synapse/tasks/toggle-domain.md` |
| "create command", "add command", "new command", "new star-command" | **add-command** | `.claude/commands/synapse/tasks/create-command.md` |
| "suggest domain", "which domain", "where should", "best domain for" | **suggest** | `.claude/commands/synapse/tasks/suggest-domain.md` |

---

## Execution

1. **Parse the user's request** to identify the sub-command from the table above.
2. **Extract parameters** from the request (domain name, rule text, index, keywords, etc.).
3. **Read and follow** the corresponding task file from `.claude/commands/synapse/tasks/`.
4. **If no sub-command is clear**, show the help output below.

---

## Help Output

If the user's intent is unclear or they ask for help, display:

```
SYNAPSE Manager - Domain & Rule Management

Available operations:

  create <domain-name>           Create a new domain + manifest entry
  add <domain-name> "<rule>"     Add a rule to an existing domain
  edit <domain-name> <index>     Edit or remove a rule by index
  toggle <domain-name>           Toggle domain active/inactive
  add-command <command-name>     Create a new star-command
  suggest "<rule text>"          Suggest the best domain for a rule

Examples:
  *synapse create my-custom-rules
  *synapse add agent-dev "Always write tests first"
  *synapse edit agent-dev 3
  *synapse toggle agent-dev
  *synapse add-command review
  *synapse suggest "Use kebab-case for files"

Reference: .claude/commands/synapse/utils/manifest-parser-reference.md
```

---

## Error Handling

- **No `.synapse/` directory found:** Inform the user that SYNAPSE is not initialized. Domain content files must be created first (SYN-8).
- **No `.synapse/manifest` found:** Same as above — manifest is required for all operations.
- **Unknown sub-command:** Show the help output above.

---

*SYNAPSE Manager — Router for CRUD operations on `.synapse/` content.*
*Source: SYNAPSE-HOOK-SKILL-COMMAND-ANALYSIS.md section 2.3 (C1)*
