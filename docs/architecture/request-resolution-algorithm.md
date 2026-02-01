# REQUEST-RESOLUTION Algorithm

> **Reference:** PRD Story 3.4 - Define REQUEST-RESOLUTION Algorithm

This document defines the deterministic algorithm agents use to match user requests to commands.

---

## Overview

The REQUEST-RESOLUTION system translates natural language user requests into executable agent commands. The algorithm provides predictable, consistent behavior across all agents.

---

## Matching Confidence Levels

| Level | Confidence | Description | Action |
|-------|-----------|-------------|--------|
| **Exact Match** | 100% | Command name matches exactly | Execute immediately |
| **Keyword Match** | 80% | Keywords in request match command | Execute with confirmation |
| **Semantic Match** | 60% | Intent similar to command | Request clarification |
| **No Match** | < 60% | No clear command mapping | List available commands |

---

## Algorithm Steps

### Step 1: Normalize Input

```
input = lowercase(trim(userRequest))
tokens = tokenize(input)
```

### Step 2: Exact Match (100% confidence)

Check if input matches any command name exactly:

```
FOR each command IN agent.commands:
  IF input == "*" + command.name:
    RETURN { command, confidence: 100, type: "exact" }
```

**Examples:**
- `*draft` → `draft` command (100%)
- `*create-pr` → `create-pr` command (100%)

### Step 3: Keyword Match (80% confidence)

Check if tokens contain command keywords:

```
keywords = {
  "story": ["draft", "create-story", "validate-story-draft"],
  "push": ["push", "pre-push"],
  "test": ["run-tests", "create-suite"],
  "review": ["backlog-review", "code-review"],
  "architecture": ["create-full-stack-architecture", "analyze-project-structure"],
  "research": ["perform-market-research", "research-prompt"]
}

FOR each token IN tokens:
  IF token IN keywords:
    candidates = keywords[token]
    FILTER candidates to agent.commands
    IF candidates.length == 1:
      RETURN { command: candidates[0], confidence: 80, type: "keyword" }
    ELSE IF candidates.length > 1:
      RETURN { candidates, confidence: 75, type: "ambiguous" }
```

**Examples:**
- "criar história" → tokens contain "história" → maps to "story" → `draft` command (80%)
- "fazer push" → tokens contain "push" → `push` command (80%)
- "rodar testes" → tokens contain "testes" → maps to "test" → `run-tests` command (80%)

### Step 4: Semantic Match (60% confidence)

Use fuzzy matching for intent recognition:

```
semanticPatterns = {
  "preciso de uma story": "draft",
  "quero criar algo": "create-*",
  "validar meu trabalho": "validate-*",
  "ver status": "session-info"
}

FOR each pattern IN semanticPatterns:
  IF fuzzyMatch(input, pattern) > 0.7:
    command = resolveWildcard(semanticPatterns[pattern])
    RETURN { command, confidence: 60, type: "semantic" }
```

**Examples:**
- "preciso de uma story nova" → `draft` (60%)
- "quero ver como está o projeto" → `session-info` (60%)

### Step 5: No Match

If no match found with confidence >= 60%:

```
RETURN {
  confidence: 0,
  type: "no_match",
  suggestion: "Available commands: " + listCommands(agent)
}
```

---

## Execution Thresholds

| Confidence | Action |
|------------|--------|
| **100%** | Execute immediately |
| **80-99%** | Execute (keyword match) |
| **60-79%** | Request confirmation: "Did you mean `*{command}`?" |
| **< 60%** | List available commands and ask for clarification |

---

## Priority Rules (Multiple Matches)

When multiple commands match with similar confidence:

1. **Prefer more specific command** over generic
2. **Prefer current agent's command** over delegate command
3. **Prefer higher visibility command** (`key` > `quick` > `full`)
4. **In case of tie:** Present numbered options to user

**Example:**
```
User: "criar"
Matches:
  - create-story (80%, @sm)
  - create-epic (80%, @pm)
  - create-pr (80%, @devops)

Response:
"Multiple commands match. Please select:
1. *draft (create story) - @sm
2. *create-epic - @pm
3. *create-pr - @devops"
```

---

## Cross-Agent Resolution

When a command is delegated to another agent:

1. Identify the command belongs to a different agent
2. Present delegation option to user
3. Do NOT auto-switch agents without confirmation

**Example:**
```
User (in @sm context): "push changes"

Response:
"The *push command belongs to @devops (Gage).
Would you like me to delegate to @devops?"
```

---

## Implementation Notes

### Keyword Dictionary

Each agent maintains a keyword dictionary in memory:

```yaml
# Built from command names and descriptions
keywords:
  draft: [story, história, criar, nova]
  push: [push, publicar, enviar, remote]
  help: [ajuda, comandos, help, ?]
```

### Fuzzy Matching

Use Levenshtein distance with threshold:
- Distance < 2: High confidence match
- Distance 2-4: Medium confidence match
- Distance > 4: No match

### Language Support

Algorithm supports both English and Portuguese:
- "create story" = "criar história" = `draft`
- "run tests" = "rodar testes" = `run-tests`

---

## Reference: Standard REQUEST-RESOLUTION Block

All agents must include this block in their YAML:

```yaml
REQUEST-RESOLUTION: Match user requests to your commands/dependencies flexibly
  (e.g., "draft story"→*draft→create-next-story task,
  "make a new prd" would be dependencies->tasks->create-doc combined with
  dependencies->templates->prd-tmpl.md),
  ALWAYS ask for clarification if no clear match.
```

---

## See Also

- [Command Authority Matrix](./command-authority-matrix.md)
- [Agent Development Guide](../guides/agent-development-guide.md)
- [Greeting System Architecture](./greeting-system.md)

---

*Created as part of Epic 3: Format Standardization - Story 3.4*
