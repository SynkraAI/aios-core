<!--
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║        ___________                                                ║
║       /     O     \      .-""-.                                   ║
║      |  .------.  |    /  __  \                                   ║
║      | | ?    ? | |   | /  \ |                                    ║
║      | |  TYPE  | |   | | () |                                    ║
║      | |  ????  | |    \ \__/ /                                   ║
║      |  '------'  |    /`----'\                                   ║
║       \___________/   / /    \ \                                  ║
║            ||        '-'      '-'                                 ║
║            ||                                                     ║
║       .----''----.                                                ║
║       |  SEARCH  |    ____  ____  ____  ____                      ║
║       '----------'   | E? || N? || T? || J? |                     ║
║                      |____||____||____||____|                     ║
║                                                                   ║
║   ╭─────────────────────────────────────────────────────────╮     ║
║   │  IDENTIFY TYPE - Discover your MBTI personality type    │     ║
║   │  Interactive guided assessment through 4 dimensions     │     ║
║   ╰─────────────────────────────────────────────────────────╯     ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
-->

# Task: Identify Personality Type

Guided process to help the user discover their MBTI type.

---

<!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
<!-- ┌─────────────────────────────────────────────────────────────┐ -->
<!-- │                        METADATA                            │ -->
<!-- └─────────────────────────────────────────────────────────────┘ -->
<!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->

## Metadata
- **task-id:** identify-type
- **agent:** mbti-expert
- **elicit:** true
- **execution_type:** interactive

<!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
<!-- ┌─────────────────────────────────────────────────────────────┐ -->
<!-- │                      INSTRUCTIONS                          │ -->
<!-- └─────────────────────────────────────────────────────────────┘ -->
<!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->

## Instructions

### Step 1: Introduction
Present the following to the user:

"Vou ajuda-lo a identificar seu tipo de personalidade atraves de perguntas estruturadas.
Sao 4 dimensoes que vamos explorar, cada uma com cenarios praticos.
Nao existem respostas certas ou erradas -- apenas preferencias naturais."

<!-- ─────────────── Step 2: Dimension Assessment ─────────────── -->

### Step 2: Assess Each Dimension

For each dimension, ask 2-3 scenario-based questions. Use AskUserQuestion tool.

**Dimension 1: Mind -- Extroversao (E) vs. Introversao (I)**
Questions about:
- How they recharge energy (people vs. solitude)
- Preferred group size for socializing
- Whether they think out loud or process internally

**Dimension 2: Energy -- Intuicao (N) vs. Sensacao (S)**
Questions about:
- Whether they focus on details or big picture
- Preference for concrete facts vs. abstract possibilities
- Whether they live more in the present or think about the future

**Dimension 3: Nature -- Pensamento (T) vs. Sentimento (F)**
Questions about:
- How they make important decisions (logic vs. values/feelings)
- Response to a friend making a bad decision
- Preference for truth vs. harmony in difficult conversations

**Dimension 4: Tactics -- Julgamento (J) vs. Percepcao (P)**
Questions about:
- Preference for planning vs. spontaneity
- How they feel about open deadlines
- Whether they prefer closure or keeping options open

<!-- ─────────────────── Step 3: Determine ────────────────────── -->

### Step 3: Determine Type
Based on responses, determine the most likely type.
Present as "based on your responses, you most align with **[TYPE]**".

<!-- ──────────────── Step 4: Quick Profile ───────────────────── -->

### Step 4: Quick Profile
Load data from: `squads/mbti-expert/data/type-profiles-overview.md`
Present a brief summary of the identified type.

<!-- ─────────────── Step 5: Variant Assessment ───────────────── -->

### Step 5: Variant Assessment
Ask about Identity dimension:
- Stress resistance and self-confidence level
- Determine if -A (Assertive) or -T (Turbulent)

<!-- ───────────────── Step 6: Full Result ─────────────────────── -->

### Step 6: Full Result
Present complete result:
- Type code (e.g., INTJ-A)
- Role group (e.g., Analyst)
- Strategy (e.g., Confident Individualism)
- Brief description
- Top 3 strengths and 3 growth areas

<!-- ───────────────── Step 7: Next Steps ──────────────────────── -->

### Step 7: Next Steps
Offer:
1. `*type-profile [TYPE]` for deep analysis
2. `*personal-growth [TYPE]` for development plan
3. `*career [TYPE]` for career guidance
4. `*compatibility [TYPE] [PARTNER_TYPE]` for relationship analysis

<!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
<!-- ┌─────────────────────────────────────────────────────────────┐ -->
<!-- │                    IMPORTANT NOTES                          │ -->
<!-- └─────────────────────────────────────────────────────────────┘ -->
<!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->

## Important Notes
- This is a simplified assessment, NOT a certified MBTI administration
- Always mention that formal MBTI assessment is recommended for validation
- Types describe preferences, not abilities
- The user's self-identification matters most -- if they disagree, explore why
