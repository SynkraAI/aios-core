<!--
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║              ┌──────────────────────┐                             ║
║              │  ╭────╮             │                              ║
║              │  │    │  ┌────────┐ │                              ║
║              │  │ O  │  │ Name:  │ │                              ║
║              │  │/|\ │  │ Role:  │ │                              ║
║              │  │/ \ │  │ Type:  │ │                              ║
║              │  │    │  │ Fns:   │ │                              ║
║              │  ╰────╯  └────────┘ │                              ║
║              │  ┌────────────────┐ │                              ║
║              │  │ ## Strengths   │ │                              ║
║              │  │ ## Challenges  │ │                              ║
║              │  │ ## Functions   │ │                              ║
║              │  └────────────────┘ │                              ║
║              └──────────────────────┘                             ║
║                                                                   ║
║   ╭─────────────────────────────────────────────────────────╮     ║
║   │  TYPE PROFILE - Comprehensive personality blueprint     │     ║
║   │  Deep-dive into strengths, functions & growth areas     │     ║
║   ╰─────────────────────────────────────────────────────────╯     ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
-->

# Task: Complete Type Profile

Generate a comprehensive profile for a given personality type.

---

<!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
<!-- ┌─────────────────────────────────────────────────────────────┐ -->
<!-- │                        METADATA                            │ -->
<!-- └─────────────────────────────────────────────────────────────┘ -->
<!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->

## Metadata
- **task-id:** type-profile
- **agent:** mbti-expert
- **elicit:** false
- **execution_type:** data-lookup
- **params:**
  - type: string (required) -- The 4-letter type code (e.g., INTJ, ENFP)

<!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
<!-- ┌─────────────────────────────────────────────────────────────┐ -->
<!-- │                      INSTRUCTIONS                          │ -->
<!-- └─────────────────────────────────────────────────────────────┘ -->
<!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->

## Instructions

### Step 1: Validate Input
Ensure `type` is a valid 4-letter MBTI code from the 16 types.

<!-- ──────────────── Step 2: Load Data ───────────────────────── -->

### Step 2: Load Reference Data
Read the following data files:
- `squads/mbti-expert/data/type-profiles-overview.md` -- Core profile
- `squads/mbti-expert/data/cognitive-functions-reference.md` -- Function stack
- `squads/mbti-expert/data/temperaments-and-strategies.md` -- Temperament & strategy

<!-- ──────────────── Step 3: Generate Profile ────────────────── -->

### Step 3: Generate Profile

Present a structured report with these sections:

```markdown
# [TYPE] -- "[Nickname]" ([Nome PT])

## Visao Geral
- Role: [Analyst/Diplomat/Sentinel/Explorer]
- Temperamento Keirsey: [NT/NF/SJ/SP] -- [Nome]
- Estrategia (A): [Strategy name]
- Estrategia (T): [Strategy name]
- Frequencia: [% na populacao brasileira, se disponivel]

## Os 5 Aspectos de Personalidade
- **Mind:** [E/I] -- [description]
- **Energy:** [N/S] -- [description]
- **Nature:** [T/F] -- [description]
- **Tactics:** [J/P] -- [description]
- **Identity:** [A/T variants] -- [description]

## Funcoes Cognitivas (Modelo Junguiano)
| Posicao | Funcao | Descricao |
|---------|--------|-----------|
| Dominante | [XX] | [description] |
| Auxiliar | [XX] | [description] |
| Terciaria | [XX] | [description] |
| Inferior | [XX] | [description] |

## Pontos Fortes
- [strength 1]
- [strength 2]
- [strength 3]
- [strength 4]
- [strength 5]

## Areas de Desenvolvimento
- [challenge 1]
- [challenge 2]
- [challenge 3]
- [challenge 4]

## Comportamento Sob Estresse (Grip)
[Description of inferior function activation]

## Resumo
[2-3 sentence synthesis]
```

<!-- ──────────────── Step 4: Next Steps ──────────────────────── -->

### Step 4: Offer Next Steps
Suggest related commands:
- `*personal-growth [TYPE]` -- Development plan
- `*career [TYPE]` -- Career guidance
- `*compatibility [TYPE] [OTHER]` -- Relationship analysis
- `*compare [TYPE] [OTHER]` -- Side-by-side comparison
