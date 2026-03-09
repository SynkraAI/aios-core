
# Task: Career Guidance

Comprehensive career guidance based on personality type.


---

## Metadata
- **task-id:** career-guidance
- **agent:** mbti-expert
- **elicit:** true
- **execution_type:** data-lookup
- **params:**
  - type: string (required) — The 4-letter type code


## Instructions

### Step 1: Load Reference Data
- `squads/mbti-expert/data/career-map.md` — Career recommendations
- `squads/mbti-expert/data/type-profiles-overview.md` — Type details
- `squads/mbti-expert/data/compatibility-matrix.md` — Workplace dynamics


### Step 2: Ask Context (if not provided)
Use AskUserQuestion:
- Current career stage (student, early career, mid-career, career change)
- Specific interests or fields being considered


### Step 3: Generate Career Report

```markdown
# Orientação Profissional: [TYPE]

## Perfil Profissional
- **Temperamento:** [Keirsey temperament] — [core drive]
- **Ambiente ideal:** [ideal work environment]
- **Motivação principal:** [what drives this type professionally]

## Carreiras Recomendadas
### Alta Compatibilidade
- [career 1] — [why it fits]
- [career 2] — [why it fits]
- [career 3] — [why it fits]

### Boa Compatibilidade
- [career 4-6 with brief justification]

### Caminhos Alternativos
- [alternative paths like entrepreneurship, freelance, etc.]

## Forças Profissionais
- [strength 1 with workplace application]
- [strength 2 with workplace application]
- [strength 3 with workplace application]

## Desafios no Trabalho
- [challenge 1 with mitigation strategy]
- [challenge 2 with mitigation strategy]

## Habilidades Naturais
[List from Cogni-MGR profiles when available]

## Limitações no Trabalho
[List from Cogni-MGR profiles when available]

## Dinâmica com Colegas
| Colega (Role) | Dinâmica Equilibrada | Risco | Dica |
|---------------|---------------------|-------|------|
| Analysts | [brief] | [brief] | [brief] |
| Diplomats | [brief] | [brief] | [brief] |
| Sentinels | [brief] | [brief] | [brief] |
| Explorers | [brief] | [brief] | [brief] |

## Contexto Brasileiro
[Reference Fellipelli statistics and Brazilian corporate culture implications]

## Próximos Passos
1. [actionable career step]
2. [skill to develop]
3. [networking approach aligned with type]
```
