# Task: Create Content Operating System

**Task ID:** create-content-system
**Type:** Interactive
**Agent:** Justin Welsh
**Squad:** Creator OS

---

## Purpose

Diagnosticar o estado atual do creator e desenhar um Content Operating System personalizado.

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| User profile | Genius Zone Blueprint | Yes |
| Current channels | User (diagnostic) | Yes |
| Current cadence | User (diagnostic) | Yes |
| Goals (90d) | Genius Zone Blueprint | Yes |

## Process

### Step 1: Diagnostic (if no Blueprint)
Executar as 5 perguntas diagnosticas do Justin Welsh:
1. Qual seu nicho/topico principal?
2. Que canais voce usa hoje?
3. Quantas pecas de conteudo publica por semana?
4. Tem produto digital? Qual?
5. Maior dor na criacao de conteudo?

### Step 2: Content Matrix Design
Preencher a Content Matrix 3x4 com topicos do nicho:

```
         EDUCACIONAL | INSPIRACIONAL | ENTRETENIMENTO | CONTRARIO
PESSOAL  [...]       [...]          [...]            [...]
INDUSTRIA[...]       [...]          [...]            [...]
PRODUTO  [...]       [...]          [...]            [...]
```

### Step 3: System Design
Gerar o Content Operating System:
- Cadencia semanal (posts/semana, newsletter, conteudo longo)
- Templates a usar (PAS, AIDA, Storytelling)
- Distribuicao (repurposing strategy)
- Metricas a acompanhar

### Step 4: Profile Optimization
Gerar recomendacoes para perfil LinkedIn/canal principal.

## Output

```yaml
content_system:
  nicho: "{definido}"
  canal_primario: "{definido}"
  cadencia:
    posts_semana: 5
    newsletter_semana: 1
    conteudo_longo_mes: 2
  content_matrix: "{12 celulas preenchidas}"
  frameworks: ["PAS", "AIDA", "Storytelling"]
  templates: ["{lista de templates}"]
  distribuicao:
    repurposing: "1 newsletter → 3 posts → 1 thread → 1 carrossel"
  metricas: ["{lista de metricas}"]
  profile_optimization: "{recomendacoes}"
```

## Quality Gate

- Content Matrix tem todas 12 celulas preenchidas
- Cadencia e realista para 10-20h/semana
- Templates sao actionable (nao abstratos)
- Metricas sao mensuraveis

## Dependencies

- Genius Zone Blueprint (optional but preferred)
- User availability for diagnostic questions
