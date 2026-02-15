---
task: Surface Decision
responsavel: "@bob-validator"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - context: Decision context with criteria data
  - operation: Operation being evaluated
Saida: |
  - should_surface: Boolean - true if user prompt needed
  - criterion: Which criterion triggered (C001-C007)
  - message: User-facing prompt
  - bypass_allowed: Whether YOLO mode can bypass
Checklist:
  - "[ ] Evaluate all 7 surface criteria in order"
  - "[ ] Check YOLO mode configuration"
  - "[ ] Generate appropriate user message"
  - "[ ] Return surface decision with reasoning"
---

# *surface-decision

Evaluates whether BOB should interrupt for human decision using 7 surface criteria (C001-C007). Implements "measure twice, cut once" philosophy.

## Usage

```javascript
// Called internally by BOB before significant actions
const surfaceResult = bobValidator.evaluate({
  action_type: 'spawn_agent',
  estimated_cost: 8.50,
  risk_level: 'MEDIUM',
  valid_options_count: 1,
});

if (surfaceResult.should_surface) {
  const userDecision = await promptUser(surfaceResult.message);
  // Proceed based on user decision
}
```

## Surface Criteria (Evaluation Order)

Criteria are evaluated in priority order (first match wins):

### C005: Destructive Actions (HIGHEST PRIORITY)

```javascript
const destructiveActions = [
  'delete_files', 'drop_table', 'drop_database',
  'force_push', 'rm_rf', 'truncate',
  'reset_hard', 'clean_f', 'format_disk',
];

if (destructiveActions.includes(context.action_type)) {
  return {
    should_surface: true,
    criterion: 'C005',
    action: 'always_confirm',
    bypass: false, // NEVER bypassable, even in YOLO mode
    message: `⛔ AÇÃO DESTRUTIVA DETECTADA

Tipo: ${context.action_type}
Arquivos afetados: ${context.affectedFiles}

Esta ação NÃO pode ser desfeita.

Tem CERTEZA? [SIM para confirmar]`,
  };
}
```

**Bypass:** ❌ NEVER (Constitutional principle)

---

### C002: High Risk

```javascript
const riskLevel = assessRisk(context); // LOW | MEDIUM | HIGH | CRITICAL

if (riskLevel === 'HIGH' || riskLevel === 'CRITICAL') {
  return {
    should_surface: true,
    criterion: 'C002',
    action: 'present_and_ask_go_nogo',
    bypass: yoloMode !== 'ask',
    message: `⚠️ Esta operação tem risco ${riskLevel}:

${context.riskDetails}

Deseja prosseguir? [GO/NO-GO]`,
  };
}
```

**Bypass:** ✅ In `auto` or `explore` YOLO mode

---

### C004: Consecutive Errors

```javascript
const errorsInTask = countConsecutiveErrors(context.taskId);

if (errorsInTask >= 2) {
  return {
    should_surface: true,
    criterion: 'C004',
    action: 'pause_and_ask_help',
    bypass: false,
    message: `❌ Encontrei ${errorsInTask} erros consecutivos:

${errorSummary}

[1] Tentar abordagem diferente
[2] Pular esta task
[3] Parar execução`,
  };
}
```

**Bypass:** ❌ NO (prevents infinite error loops)

---

### C001: Cost Threshold

```javascript
const shouldSurface = context.estimated_cost > 5; // USD

if (shouldSurface) {
  return {
    should_surface: true,
    criterion: 'C001',
    action: 'confirm_before_proceed',
    bypass: yoloMode === 'explore',
    message: `💰 Esta operação tem custo estimado de $${context.estimated_cost}.

Deseja continuar? [SIM/NÃO]`,
  };
}
```

**Bypass:** ✅ In `explore` YOLO mode only

---

### C006: Scope Change

```javascript
const scopeExpanded = context.requestedScope > context.approvedScope;

if (scopeExpanded) {
  return {
    should_surface: true,
    criterion: 'C006',
    action: 'confirm_scope_expansion',
    bypass: yoloMode === 'explore',
    message: `📐 O escopo solicitado excede o aprovado:

Aprovado: ${context.approvedScope}
Solicitado: ${context.requestedScope}
Diferença: ${context.scopeDifference}

Confirmar expansão? [SIM/NÃO]`,
  };
}
```

**Bypass:** ✅ In `explore` YOLO mode

---

### C003: Multiple Options

```javascript
const validOptions = findValidOptions(context);

if (validOptions.length >= 2) {
  return {
    should_surface: true,
    criterion: 'C003',
    action: 'present_options_with_tradeoffs',
    bypass: false,
    message: `🔀 Encontrei ${validOptions.length} opções válidas:

${formatOptions(validOptions)}

Qual você prefere? [1-${validOptions.length}]`,
  };
}
```

**Bypass:** ❌ NO (user preference needed)

---

### C007: External Dependency

```javascript
const needsExternal = context.requiresApiKey ||
                      context.requiresPayment ||
                      context.requiresExternalService;

if (needsExternal) {
  return {
    should_surface: true,
    criterion: 'C007',
    action: 'confirm_before_proceed',
    bypass: false,
    message: `🔗 Esta operação requer dependência externa:

${context.dependencyDescription}

Deseja prosseguir? [SIM/NÃO]`,
  };
}
```

**Bypass:** ❌ NO (needs credentials/setup)

---

## Risk Assessment

```javascript
function assessRisk(operation) {
  const costRisk = operation.cost > 20 ? 'CRITICAL' :
                   operation.cost > 5 ? 'HIGH' :
                   operation.cost > 1 ? 'MEDIUM' : 'LOW';

  const technicalRisk =
    operation.isDestructive ? 'CRITICAL' :
    operation.affectsProduction ? 'HIGH' :
    operation.modifiesFiles ? 'MEDIUM' : 'LOW';

  const businessRisk =
    operation.environment === 'production' ? 'CRITICAL' :
    operation.environment === 'staging' ? 'MEDIUM' : 'LOW';

  // Return highest risk level
  return Math.max(costRisk, technicalRisk, businessRisk);
}
```

## YOLO Mode Configuration

```yaml
# ~/.aios/user-config.yaml
yolo_mode: auto  # ask | auto | explore
```

| Mode | Behavior |
|------|----------|
| `ask` | **ALWAYS surface** (safest) - All criteria trigger |
| `auto` | Bypass LOW/MEDIUM, surface HIGH/CRITICAL |
| `explore` | Bypass all **except C005** (destructive) |

**Note:** C005 (destructive) is **NEVER** bypassable.

## Implementation

```javascript
class SurfaceChecker {
  shouldSurface(context) {
    const yoloMode = this._getYoloMode();

    // Evaluate in priority order
    const criteria = [
      this._checkC005Destructive,
      this._checkC002Risk,
      this._checkC004Errors,
      this._checkC001Cost,
      this._checkC006Scope,
      this._checkC003Options,
      this._checkC007External,
    ];

    for (const check of criteria) {
      const result = check.call(this, context);
      if (result.should_surface) {
        // Check YOLO bypass
        if (result.bypass && this._canBypass(result.criterion, yoloMode)) {
          this._log(`Bypassed ${result.criterion} in ${yoloMode} mode`, 'info');
          continue;
        }
        return result;
      }
    }

    // No criteria matched → auto-execute
    return {
      should_surface: false,
      reason: 'single_clear_path',
    };
  }

  _canBypass(criterion, yoloMode) {
    if (criterion === 'C005') return false; // NEVER bypass destructive
    if (criterion === 'C004') return false; // NEVER bypass errors
    if (criterion === 'C003') return false; // NEVER bypass options
    if (criterion === 'C007') return false; // NEVER bypass external deps

    if (yoloMode === 'explore') return true; // Bypass C001, C002, C006
    if (yoloMode === 'auto' && criterion === 'C002') {
      // Only bypass MEDIUM risk in auto mode
      return context.risk_level === 'MEDIUM';
    }

    return false;
  }
}
```

## Output Examples

### C001: Cost Threshold

```
💰 Cost: $8.50 (HIGH)

Esta operação executará análise brownfield completa.
Custo estimado: $8.50 (2-4 horas de execução).

Deseja continuar? [SIM/NÃO]
```

### C002: High Risk

```
⚠️ RISCO ALTO: Esta operação fará push para main

Isto afetará todos os desenvolvedores.
Branch: main (produção)
Commits: 3 novos commits

GO/NO-GO?
```

### C005: Destructive Action

```
⛔ AÇÃO DESTRUTIVA
Tipo: drop_table
Tabela: users (1.2M registros)

ESTA AÇÃO NÃO PODE SER DESFEITA.

Tem CERTEZA? [SIM para confirmar]
```

## Related

- **Agent:** bob-validator.md
- **Data:** data/surface-criteria.yaml
- **Module:** surface-checker.js (.aios-core/core/orchestration/)

---

**Evaluation Time:** < 100ms
**False Positive Target:** < 5%
**False Negative Target:** 0% (never miss critical decisions)
