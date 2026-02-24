# Task: Distill Complex Topic into Content

**Task ID:** distill-content
**Type:** Autonomous
**Agent:** Nicolas Cole
**Squad:** Creator OS

---

## Purpose

Transformar insights destilados (de Tiago Forte) ou topicos brutos em conteudo escrito pronto para publicar, usando frameworks de escrita otimizados.

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Content seeds / Topic | Tiago Forte or User | Yes |
| Format | Pipeline config or User | No (default: all) |
| Tone | User profile | No |
| Channel | Pipeline config | No (default: linkedin) |

## Process

### Step 1: Ideation (4A Framework)
Gerar 4 angulos para o topico:
- **Actionable:** Como fazer X (how-to)
- **Analytical:** Dados sobre X (numeros, tendencias)
- **Aspirational:** Visao de futuro de X
- **Anthropological:** Comportamento humano + X

### Step 2: Format Selection
Escolher formato baseado no canal e angulo:
- Actionable → Lista numerada, post LinkedIn
- Analytical → Thread com dados, newsletter
- Aspirational → Storytelling, carrossel
- Anthropological → Ensaio, post reflexivo

### Step 3: Structure (Template)
Aplicar template adequado:
- **PAS** (Pain → Agitate → Solution) para posts de conversao
- **AIDA** (Attention → Interest → Desire → Action) para posts de awareness
- **Storytelling** para posts de conexao
- **Lista** para posts educacionais

### Step 4: Write
Produzir conteudo com:
- Hook forte (para scroll no primeiro segundo)
- Rate of Revelation alto (1 revelacao por frase)
- Credibility Kicker (autoridade sem arrogancia)
- CTA claro (1 acao especifica)

### Step 5: Review (Cortar 30%)
- Eliminar redundancias
- Cada frase deve adicionar algo NOVO
- Se pode ser dito em menos palavras, cortar

## Output Types

### Atomic Essay (250 palavras) - Post LinkedIn
```
[HOOK - 1-2 frases que param o scroll]
[CORPO - 3-5 pontos, cada um com 1-2 frases]
[KICKER - frase final memoravel + CTA]
```

### Newsletter (500-1000 palavras)
```
ASSUNTO: [Numero] + [Beneficio] + [Timeframe]
1. HOOK (2-3 linhas)
2. CONTEXTO (3-5 linhas)
3. CORPO (3 pontos com exemplos)
4. CONCLUSAO (2-3 linhas)
5. CTA (1 linha)
```

### Thread (5-10 posts conectados)
```
Post 1: HOOK (contraintuitivo ou surpreendente)
Posts 2-N: Conteudo sequencial com revelacoes
Post Final: CTA + link
```

### Carrossel (7-10 slides)
```
Slide 1: Titulo impactante
Slides 2-N: 1 ideia por slide, visual
Slide Final: CTA + perfil
```

## Quality Gate

- Hook para scroll em < 2 segundos
- Rate of Revelation: cada frase adiciona algo novo
- Tamanho dentro do formato (250 palavras para post, 1000 para newsletter)
- Tom alinhado com perfil do creator (visionario, direto, pratico)

## Dependencies

- Content seeds (from Tiago Forte or direct input)
- User voice profile (from Blueprint)
