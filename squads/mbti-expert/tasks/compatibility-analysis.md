<!--
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║                        .-""""""-.                                 ║
║                      .'          '.                               ║
║                     /   O      O   \                              ║
║                    :                :                              ║
║                    |                |                              ║
║                    : ',          ,' :                              ║
║                     \  '-......-'  /                               ║
║                      '.          .'                                ║
║                  ╔═════'-.____.-'═════╗                            ║
║                  ║                    ║                            ║
║            ♥  ───╣  COMPATIBILITY     ╠───  ♥                     ║
║                  ║     ANALYSIS       ║                            ║
║                  ╚════════════════════╝                            ║
║                                                                   ║
║             ┌────────┐  ~~ <3 ~~  ┌────────┐                     ║
║             │ TYPE 1 │────────────│ TYPE 2 │                     ║
║             │  INTJ  │  connect?  │  ENFP  │                     ║
║             └────────┘            └────────┘                     ║
║                                                                   ║
║   ╭─────────────────────────────────────────────────────────╮     ║
║   │  COMPATIBILITY ANALYSIS - Deep connection dynamics      │     ║
║   │  Romantic, friendship & workplace compatibility         │     ║
║   ╰─────────────────────────────────────────────────────────╯     ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
-->

# Task: Compatibility Analysis

Deep compatibility analysis between two personality types.

---

<!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
<!-- ┌─────────────────────────────────────────────────────────────┐ -->
<!-- │                        METADATA                            │ -->
<!-- └─────────────────────────────────────────────────────────────┘ -->
<!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->

## Metadata
- **task-id:** compatibility-analysis
- **agent:** mbti-expert
- **elicit:** true
- **execution_type:** data-lookup
- **params:**
  - type1: string (required) -- First type code
  - type2: string (required) -- Second type code
  - context: string (optional) -- "romantic", "friendship", "workplace" (default: all)

<!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
<!-- ┌─────────────────────────────────────────────────────────────┐ -->
<!-- │                      INSTRUCTIONS                          │ -->
<!-- └─────────────────────────────────────────────────────────────┘ -->
<!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->

## Instructions

### Step 1: Validate Input
Ensure both types are valid 4-letter MBTI codes.

<!-- ──────────────── Step 2: Load Data ───────────────────────── -->

### Step 2: Load Reference Data
- `squads/mbti-expert/data/compatibility-matrix.md` -- Role pairings
- `squads/mbti-expert/data/type-profiles-overview.md` -- Type details
- `squads/mbti-expert/data/cognitive-functions-reference.md` -- Function dynamics

<!-- ──────────────── Step 3: Pairing Category ────────────────── -->

### Step 3: Determine Pairing Category
Identify the Role groups for both types and find the corresponding pairing:
- Same Role (e.g., Analyst-Analyst)
- Cross-Role (e.g., Analyst-Diplomat)

<!-- ──────────────── Step 4: Generate Analysis ───────────────── -->

### Step 4: Generate Analysis

```markdown
# Compatibilidade: [TYPE1] x [TYPE2]

## Perfil Rapido
| | [TYPE1] | [TYPE2] |
|---|---------|---------|
| Role | [role] | [role] |
| Temperamento | [temp] | [temp] |
| Funcoes Dom/Aux | [fn] | [fn] |

## Pontos de Conexao
- [shared traits or complementary dynamics]
- [what naturally works between these types]

## Potenciais Friccoes
- [where natural tensions exist]
- [common misunderstandings]

## Dinamica por Contexto

### Romantico
- **Equilibrado:** [description]
- **Desequilibrado:** [description]
- **Reequilibrando:** [practical advice]

### Amizade
- **Equilibrado:** [description]
- **Desequilibrado:** [description]
- **Reequilibrando:** [practical advice]

### Trabalho
- **Equilibrado:** [description]
- **Desequilibrado:** [description]
- **Reequilibrando:** [practical advice]

## Funcoes Cognitivas: Complementaridade
[Analysis of how their function stacks interact]

## Exercicios Praticos
1. [practical exercise from source material]
2. [communication tip]
3. [conflict resolution approach]

## Resumo
[Overall compatibility assessment with growth potential]
```

<!-- ──────────────── Step 5: Context Filter ──────────────────── -->

### Step 5: If context specified
Only show the relevant section (romantic, friendship, or workplace) with extra depth.

<!-- ──────────────── Step 6: Next Steps ──────────────────────── -->

### Step 6: Offer Next Steps
- `*relationship [TYPE1] [TYPE2] --context romantic` -- Deep relationship dynamics
- `*type-profile [TYPE1]` -- Full profile of first type
- `*type-profile [TYPE2]` -- Full profile of second type
