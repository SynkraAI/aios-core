---
description: QA Loop — Revisão iterativa automatizada de código e stories
---

# QA Loop — Revisão Iterativa

Workflow de revisão-correção automática após o gate inicial de QA.
Máximo de 5 iterações por ciclo.

## Quando Usar
- Após `@qa *gate` retornar falhas
- Quando o código precisa de revisão técnica profunda antes de deploy
- Em PRs antes do merge para main/production

## Passos do Workflow

### 1. Revisão Inicial
```
@qa *review
```
O agente QA analisa o código/story e emite um **veredito**:
- ✅ `APROVADO` — Pode prosseguir para deploy
- ⚠️ `APROVADO COM RESSALVAS` — Merge permitido, mas com observações
- ❌ `REPROVADO` — Requer correções antes do merge

### 2. Ciclo de Correção (se reprovado)
```
@dev [implementa correções apontadas pelo QA]
```
O dev corrige os pontos levantados. Máximo de 5 iterações:

```
Iteração 1: @qa *review → ❌ → @dev corrige
Iteração 2: @qa *review → ❌ → @dev corrige
Iteração 3: @qa *review → ❌ → @dev corrige
Iteração 4: @qa *review → ⚠️ → decisão do PO
Iteração 5: @qa *review → ✅ → aprovado
```

### 3. Gate Final
Após aprovação do QA:
```
@devops *push
```

## Limites e Regras
- **Máximo 5 iterações** — Se após 5 ciclos ainda houver falhas críticas, escalar para `@architect`
- **QA não corrige código** — Apenas aponta, quem corrige é o `@dev`
- **PO decide** em caso de `APROVADO COM RESSALVAS` se o prazo permite mais revisões

## Exemplo Completo
```
@sm *draft         # Scrum Master cria a story
@po *validate      # PO valida requisitos
@dev *develop      # Dev implementa
@qa *gate          # QA faz o gate inicial

# Se reprovado → QA Loop:
@qa *review        # → veredito: ❌ 2 issues críticas
@dev              # → corrige as 2 issues
@qa *review        # → veredito: ✅ aprovado

@devops *push      # Deploy
```
