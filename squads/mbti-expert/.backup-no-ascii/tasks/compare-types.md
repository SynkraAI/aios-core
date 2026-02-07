
# Task: Compare Two Types

Side-by-side comparison of two personality types.

---


## Metadata
- **task-id:** compare-types
- **agent:** mbti-expert
- **elicit:** false
- **execution_type:** data-lookup
- **params:**
  - type1: string (required)
  - type2: string (required)


## Instructions

### Step 1: Load Reference Data
- `squads/mbti-expert/data/type-profiles-overview.md`
- `squads/mbti-expert/data/cognitive-functions-reference.md`
- `squads/mbti-expert/data/temperaments-and-strategies.md`


### Step 2: Generate Comparison Table

```markdown
# Comparacao: [TYPE1] vs. [TYPE2]

| Aspecto | [TYPE1] -- [Nickname] | [TYPE2] -- [Nickname] |
|---------|---------------------|---------------------|
| **Role** | [role] | [role] |
| **Temperamento** | [temperament] | [temperament] |
| **Mind** | [E/I + description] | [E/I + description] |
| **Energy** | [N/S + description] | [N/S + description] |
| **Nature** | [T/F + description] | [T/F + description] |
| **Tactics** | [J/P + description] | [J/P + description] |
| **Estrategia (A)** | [strategy] | [strategy] |
| **Estrategia (T)** | [strategy] | [strategy] |
| **Lideranca** | [style] | [style] |
| **Social** | [style] | [style] |
| **Comunicacao** | [style] | [style] |
| **Desequilibrio** | [main risk] | [main risk] |
| **Desafio emocional** | [main challenge] | [main challenge] |
| **No trabalho** | [style] | [style] |
| **Pai/Mae** | [style] | [style] |

## Funcoes Cognitivas
| Posicao | [TYPE1] | [TYPE2] |
|---------|---------|---------|
| Dominante | [fn] | [fn] |
| Auxiliar | [fn] | [fn] |
| Terciaria | [fn] | [fn] |
| Inferior | [fn] | [fn] |

## O que Compartilham
- [shared trait 1]
- [shared trait 2]

## Diferencas-Chave
- [key difference 1]
- [key difference 2]
- [key difference 3]

## Como Interagem
[Brief compatibility note based on their Role pairing]
```
