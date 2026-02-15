
# Task: Quick Type Summary

Generate a concise summary card for a type.

---


## Metadata
- **task-id:** type-summary
- **agent:** mbti-expert
- **elicit:** false
- **execution_type:** data-lookup
- **params:**
  - type: string (required)


## Instructions

### Step 1: Load Data
- `squads/mbti-expert/data/type-profiles-overview.md`


### Step 2: Generate Card

```markdown
## [TYPE] — "[Nickname]"
**Role:** [role] | **Temperamento:** [temp] | **Brasil:** [%]
**Funções:** [Dom]-[Aux]-[Ter]-[Inf]

**Em uma frase:** [one-sentence essence]

**Top 3 Forças:** [s1], [s2], [s3]
**Top 3 Desafios:** [c1], [c2], [c3]

**No trabalho:** [one-liner]
**Nos relacionamentos:** [one-liner]
**Sob estresse:** [one-liner]
```
