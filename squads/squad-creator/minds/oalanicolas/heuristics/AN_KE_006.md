# AN_KE_006 - Verification First

**Type:** Debugging Heuristic
**Phase:** Any (Validation)
**Agent:** @oalanicolas
**Pattern:** Physical > Theory
**Source:** CLAUDE.md - "VERIFY PHYSICALLY BEFORE THEORIZING"

## Purpose

Verificar fisicamente ANTES de teorizar. Elimina horas de debugging por suposições erradas.

## Core Principle

> "GOLDEN RULE: VERIFY PHYSICALLY BEFORE THEORIZING"
> — CLAUDE.md Debugging First Principles

Suposição é o pai de todos os bugs.

## Verification Checklist

```yaml
verification_order:
  1:
    question: "📁 File exists where code expects?"
    command: "ls -la /exact/path/"
    common_issue: "Path typo, wrong directory"

  2:
    question: "🌐 Server serves it?"
    command: "curl -I http://localhost:PORT/path"
    common_issue: "Server not running, wrong port"

  3:
    question: "👂 User repeated input 2x?"
    action: "STOP, do EXACTLY what they said"
    common_issue: "Misunderstood requirement"

  4:
    question: "✅ Tested with hard refresh?"
    command: "Cmd+Shift+R (clear cache)"
    common_issue: "Browser cache, stale assets"

  5:
    question: "🔍 Checked actual error message?"
    action: "Read FULL error, not just first line"
    common_issue: "Root cause buried in stack trace"
```

## Configuration

```yaml
AN_KE_006:
  name: "Verification First"
  phase: "any"
  agent: "@oalanicolas"

  principle: "Physical verification BEFORE theoretical debugging"

  verification_commands:
    file_exists: "ls -la {path}"
    server_responds: "curl -I {url}"
    process_running: "ps aux | grep {process}"
    port_listening: "lsof -i :{port}"
    env_set: "echo ${VAR_NAME}"
    db_connected: "psql -c 'SELECT 1'"

  decision_tree:
    - step: "Verify physical state"
      before: "ANY theoretical debugging"
    - step: "If physical state wrong"
      action: "Fix physical state first"
    - step: "If physical state correct"
      action: "Then investigate logic"

  veto_conditions:
    - condition: "debug_without_verification"
      action: "VETO - Verify physically first"
      maps_to: "AN_VC_007"
    - condition: "assume_without_checking"
      action: "VETO - Check, don't assume"
      maps_to: "AN_VC_007"
```

## Decision Tree

```
BEFORE any debugging:

1. ls -la {path}
   IF file doesn't exist → FIX PATH
   IF file exists → CONTINUE

2. curl -I {url}
   IF server doesn't respond → FIX SERVER
   IF server responds → CONTINUE

3. Check if user repeated 2x
   IF yes → STOP, do EXACTLY what they said
   IF no → CONTINUE

4. Hard refresh (Cmd+Shift+R)
   IF problem disappears → WAS CACHE
   IF problem persists → CONTINUE

5. NOW investigate logic
```

## Common Verification Scenarios

| Symptom | First Check | Common Cause |
|---------|-------------|--------------|
| "File not found" | `ls -la` | Wrong path, typo |
| "Connection refused" | `curl -I` | Server not running |
| "Not working" (vague) | Ask user to repeat | Misunderstood requirement |
| "Still showing old" | Hard refresh | Browser cache |
| "Env var undefined" | `echo $VAR` | Not exported, wrong shell |
| "DB error" | `psql -c 'SELECT 1'` | Connection, credentials |

## Anti-Patterns

```yaml
anti_patterns:
  - name: "Theory First"
    symptom: "Debuggar código antes de verificar se arquivo existe"
    cost: "Horas perdidas em suposição errada"
    fix: "ls -la PRIMEIRO"

  - name: "Assume Server Running"
    symptom: "Testar endpoint sem verificar se servidor tá up"
    cost: "Confusão, false debugging"
    fix: "curl -I PRIMEIRO"

  - name: "Ignore User Repetition"
    symptom: "Usuário repetiu 2x e você continuou no caminho errado"
    cost: "Retrabalho, frustração"
    fix: "STOP, releia, faça EXATAMENTE o que pediu"

  - name: "Skip Cache Clear"
    symptom: "Assume que mudança não funcionou sem hard refresh"
    cost: "False negatives"
    fix: "Cmd+Shift+R SEMPRE após mudança de frontend"
```

## Validation Questions

1. "Verifiquei fisicamente que o arquivo existe?"
2. "Verifiquei que o servidor responde?"
3. "Usuário repetiu algo 2x?"
4. "Fiz hard refresh?"
5. "Li o erro COMPLETO?"

## Performance Metrics

```yaml
performance:
  debugging_time_saved: "~60% when following order"
  false_assumptions_caught: "~80%"
  user_frustration_reduced: "High (stop ignoring 2x)"
```

---

**Pattern Compliance:** Physical > Theory
**Veto Mapping:** AN_VC_007 (Debug Without Verification)
**Integration:** All debugging/validation scenarios
