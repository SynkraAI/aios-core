---
task: Greet User
responsavel: "@basic-greeter"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - name: Name to greet (required)
  - style: formal | casual | enthusiastic (default: casual)
Saida: |
  - greeting: The greeting message
Checklist:
  - "[ ] Receive name"
  - "[ ] Apply style"
  - "[ ] Generate greeting"
---

# *greet / *hello

Generate a friendly greeting for the specified name.

## Usage

```
@basic-greeter
*greet "Alice"
*greet "Bob" --style formal
```

## Process

1. Receive the name parameter
2. Determine greeting style
3. Generate appropriate greeting
4. Return formatted message

## Output Examples

**Casual (default):**
```
Hey Alice! Great to see you!
```

**Formal:**
```
Good day, Alice. Welcome.
```

**Enthusiastic:**
```
ALICE! SO AWESOME to meet you!!!
```
