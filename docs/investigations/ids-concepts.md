# IDS - Incremental Development System: Conceitos Explicados

**Documento de Referência Conceitual**
**Autor:** Pedro Valério Lopez (via Mind Clone)
**Data:** 2026-02-05
**Versão:** 1.0
**Epic Reference:** Epic 13 (Stories 13.4, 13.5)

> "Humans develop incrementally; AI agents develop generationally."
> — Princípio fundamental do IDS

---

## O Problema Central

### A Diferença Entre Humanos e IAs

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   👨‍💻 DESENVOLVEDOR HUMANO         🤖 AGENTE IA (sem IDS)      │
│                                                                 │
│   "Já existe algo parecido?"       "Vou criar do zero!"        │
│          ↓                                  ↓                   │
│   Busca código existente           Gera código novo            │
│          ↓                                  ↓                   │
│   Adapta 10 linhas                 Escreve 200 linhas          │
│          ↓                                  ↓                   │
│   ✅ Reutilização                  ❌ Duplicação                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## A Solução: IDS

O **Incremental Development System** é um conjunto de ferramentas e processos que força os agentes IA a:

1. **Consultar antes de criar** - Sempre olhar o inventário primeiro
2. **Seguir uma hierarquia** - REUSE > ADAPT > CREATE
3. **Justificar decisões** - Se criar algo novo, explicar por quê
4. **Passar por portões** - Verificação em cada etapa
5. **Auto-corrigir** - Sistema detecta e corrige problemas

## REUSE > ADAPT > CREATE

| Decisão | Quando Usar | Score de Match | Ação |
|---------|-------------|----------------|------|
| **REUSE** | Já existe algo perfeito | ≥ 90% | Usa direto, sem alteração |
| **ADAPT** | Existe algo similar | 60-89% (impacto < 30%) | Modifica, com cuidado |
| **CREATE** | Não existe nada útil | < 60% | Cria novo, com justificativa obrigatória |

### A Matriz de Decisão (Técnica)

```javascript
if (relevanceScore >= 0.9) {
  return 'REUSE';  // Usa direto, sem alteração
}

if (relevanceScore >= 0.6 &&
    canAdapt >= 0.6 &&
    impactOnOthers < 30%) {
  return 'ADAPT';  // Modifica, com cuidado
}

return 'CREATE';   // Cria novo, com justificativa
```

## Entity Registry (O Inventário)

Schema por entity:

```yaml
entities:
  tasks:
    create-story:
      path: ".aios-core/development/tasks/create-story.md"
      type: "task"
      purpose: "Gera stories de desenvolvimento a partir de requisitos"
      keywords: ["story", "create", "development", "agile"]
      usedBy: ["@sm", "@po", "workflow-story-creation"]
      dependencies: ["template-story", "checklist-story"]
      adaptability:
        score: 0.7
        constraints: ["Não alterar estrutura YAML"]
        extensionPoints: ["Adicionar campos customizados"]
      checksum: "sha256:abc123..."
```

## Decision Engine (O Cérebro)

CREATE justification structure (Roundtable #4):

```javascript
{
  action: 'CREATE',
  confidence: 'low',
  justification: {
    evaluated_patterns: ['task-A', 'task-B', 'script-C'],
    rejection_reasons: {
      'task-A': 'Não suporta webhooks que eu preciso',
      'task-B': 'Específico para @pm, preciso genérico',
      'script-C': 'Performance >500ms, preciso <100ms'
    },
    new_capability: 'Task genérica com webhooks e <100ms',
    review_scheduled: '2026-03-07'
  }
}
```

## Verification Gates (Os Portões)

| Gate | Agente | Tipo | Latência | Comportamento |
|------|--------|------|----------|---------------|
| G1 | @pm | Human-in-loop | < 24h | Advisory only |
| G2 | @sm | Human-in-loop | < 24h | Advisory only |
| G3 | @po | Human-in-loop | < 4h | Soft block |
| G4 | @dev | **AUTOMÁTICO** | **< 2s** | Informational |
| G5 | @qa | **AUTOMÁTICO** | **< 30s** | Blocks merge |
| G6 | @devops | **AUTOMÁTICO** | **< 60s** | Blocks critical |

> **Roundtable #3:** Gates G4-G6 DEVEM ser automáticos. Verificação manual em runtime cria fricção inaceitável.

## Self-Healing (Auto-Cura)

### Três Categorias de Saúde

**A. Integridade de Dados:**

| Problema | Severidade | Auto-Heal? | Ação |
|----------|------------|------------|------|
| Arquivo deletado | CRITICAL | No | Avisa humano |
| Checksum errado | HIGH | Yes | Recalcula |
| Referência órfã | MEDIUM | Yes | Remove ref |
| Schema inválido | HIGH | No | Avisa humano |

**B. Integridade de Performance:**

| Problema | Threshold | Auto-Heal? | Ação |
|----------|-----------|------------|------|
| Query lenta | > 100ms | Yes | Rebuild index |
| Cache baixo | < 70% hit | Yes | Expand cache |
| Index antigo | > 1 hora | Yes | Rebuild TF-IDF |

**C. Integridade de Qualidade:**

| Problema | Critério | Auto-Heal? | Ação |
|----------|----------|------------|------|
| Near-duplicate | > 95% similar | No | Sugere merge |
| Entity stale | 90 dias sem ref | Yes | Flag archive |
| False CREATE | 60 dias, 0 reuse | No | Queue review |

## Métricas de Sucesso

### CREATE Rate Evolution

```
Mês 1-3:  50-60% CREATE (Normal - construindo registry)
Mês 4-6:  30-40% CREATE (Saudável - padrões emergindo)
Mês 7-12: 15-25% CREATE (Maduro - sistema funcionando)
Mês 12+:  <15% CREATE (Ótimo - cultura de reuso forte)
```

## Roundtable Adjustments

| # | Ajuste | Impacto |
|---|--------|---------|
| 1 | Performance SLA < 100ms | Registry rápido como Google |
| 2 | 30% Threshold calibrável | Flexibilidade para ajustar |
| 3 | G4-G6 automáticos | Zero fricção no dev |
| 4 | CREATE justification | Accountability para criações |
| 5 | CREATE rate metric | Termômetro de saúde |
| 6 | Self-healing expandido | Sistema imunológico completo |

## CLI Commands (Planned)

```bash
aios ids:query "deploy automático"   # Consultar o registry
aios ids:stats                       # Ver estatísticas
aios ids:health                      # Verificar saúde
aios ids:health --fix                # Corrigir problemas simples
aios ids:backup                      # Backup do registry
aios ids:sync                        # Forçar sync completo
```

---

*Documento criado por Pedro Valério Lopez (via Mind Clone)*
*Consolidando: Epic IDS, 6 Stories, 6 Roundtable Adjustments*
*"Se não está documentado, não existe."*
