<!--
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║                              _                                               ║
║                             | |                                              ║
║                            _| |_                                             ║
║                           |     |    PERSONAL                                ║
║                       __ /       \ __   GROWTH                               ║
║                      |  /  @   @  \  |   PLAN                                ║
║                       \/     ^     \/                                        ║
║                        \   '___'  /                                          ║
║                         \_______/                                            ║
║                             |                                                ║
║               ┌─────────────┼─────────────┐                                  ║
║               │    STEP 5   │             │                                  ║
║            ┌──┴──┐       ┌──┴──┐       ┌──┴──┐                               ║
║            │     │ STEP 4│     │       │     │                               ║
║         ┌──┴──┐  └──┬──┘  ┌──┴──┐  └──┬──┘                                  ║
║         │     │STEP 3│     │     │     │                                     ║
║      ┌──┴──┐  └──┬──┘  ┌──┴──┐  │     │                                     ║
║      │     │STEP 2│     │     │  │     │                                     ║
║   ┌──┴──┐  └──┬──┘     │     │  │     │                                     ║
║   │SEED │STEP 1│        │     │  │     │                                     ║
║   │  *  │     │         │     │  │     │                                     ║
║   └─────┘  ───┘         └─────┘  └─────┘                                     ║
║    \|/                                                                       ║
║     |    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~                            ║
║   ──┴──  ~ Evolve through the 5 Self-Aspects   ~                            ║
║   \___/  ~ Grow from seed to full bloom         ~                            ║
║          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~                            ║
║                                                                              ║
║   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   ║
║   ▓  MBTI Expert Squad  ·  Personal Growth Task  ·  Data-Lookup Engine  ▓   ║
║   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
-->

# Task: Personal Growth Plan

Generate a personalized development plan based on the 5 Self-Aspects framework.

<!-- ┌─────────────────────────────────────────────────────────────┐ -->
<!-- │                    M E T A D A T A                          │ -->
<!-- └─────────────────────────────────────────────────────────────┘ -->

---

## Metadata
- **task-id:** personal-growth
- **agent:** mbti-expert
- **elicit:** true
- **execution_type:** data-lookup
- **params:**
  - type: string (required) — The 4-letter type code
  - focus: string (optional) — Specific aspect to focus on

<!-- ┌─────────────────────────────────────────────────────────────┐ -->
<!-- │               I N S T R U C T I O N S                       │ -->
<!-- └─────────────────────────────────────────────────────────────┘ -->

## Instructions

### Step 1: Load Reference Data
- `squads/mbti-expert/data/personal-growth-framework.md` — 5 aspects framework
- `squads/mbti-expert/data/type-profiles-overview.md` — Type details
- `squads/mbti-expert/data/cognitive-functions-reference.md` — Inferior function

<!-- ─────────────────────────────────────────────────────────────── -->

### Step 2: Ask Context (if focus not specified)
Use AskUserQuestion to identify which aspect needs most attention:
- Self-Esteem, Self-Respect, Self-Confidence, Self-Evolution, Self-Responsibility

<!-- ─────────────────────────────────────────────────────────────── -->

### Step 3: Generate Growth Plan

```markdown
# Plano de Desenvolvimento Pessoal: [TYPE]

## Seu Perfil de Crescimento
- **Role:** [group] — padrões comuns de crescimento
- **Função inferior:** [function] — área de maior potencial de desenvolvimento
- **Estratégia:** [strategy based on A/T]

## Os 5 Aspectos

### 1. Autoestima (Self-Esteem)
**Equilibrada:** [type-specific balanced description]
**Sinais de desequilíbrio:** [type-specific warning signs]
**Exercício de reequilíbrio:**
[Specific exercise from source material for this type]

### 2. Autorrespeito (Self-Respect)
**Equilibrado:** [type-specific balanced description]
**Sinais de desequilíbrio:** [type-specific warning signs]
**Exercício de reequilíbrio:**
[Specific exercise from source material]

### 3. Autoconfiança (Self-Confidence)
**Equilibrada:** [type-specific balanced description]
**Sinais de desequilíbrio:** [type-specific warning signs]
**Exercício de reequilíbrio:**
[Specific exercise from source material]

### 4. Autoevolução (Self-Evolution)
**Equilibrada:** [type-specific balanced description]
**Sinais de desequilíbrio:** [type-specific warning signs]
**Exercício de reequilíbrio:**
[Specific exercise from source material]

### 5. Autorresponsabilidade (Self-Responsibility)
**Equilibrada:** [type-specific balanced description]
**Sinais de desequilíbrio:** [type-specific warning signs]
**Exercício de reequilíbrio:**
[Specific exercise from source material]

## Desenvolvimento da Função Inferior ([function])
[Specific guidance on developing the inferior function]

## Plano de Ação Semanal
- [ ] Dia 1-2: [specific daily practice]
- [ ] Dia 3-4: [specific daily practice]
- [ ] Dia 5-6: [specific daily practice]
- [ ] Dia 7: [weekly reflection exercise]

## Princípios Universais
1. Emoções são fatos — reconhecer é sabedoria, não fraqueza
2. Ação valida teoria — cresça pela prática
3. Outros são espelhos — feedback revela pontos cegos
4. Progresso, não posição — foque em "quanto avancei"
```
