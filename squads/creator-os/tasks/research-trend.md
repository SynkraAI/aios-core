# Task: Research & Identify Trends

**Task ID:** research-trend
**Type:** Autonomous
**Agent:** Tiago Forte
**Squad:** Creator OS

---

## Purpose

Pesquisar um topico, organizar usando PARA, destilar usando Progressive Summarization, e gerar content seeds prontos para escrita.

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Topic | User or pipeline | Yes |
| Depth | Config (shallow/deep) | No (default: deep) |
| Nicho context | Creator profile | No |

## Process

### Step 1: Capture
Pesquisar o topico usando WebSearch:
- 3-5 fontes primarias (artigos, estudos, relatorios)
- Dados e estatisticas recentes
- Citacoes de autoridades no assunto
- Tendencias emergentes

### Step 2: Organize (PARA)
Classificar informacao capturada:
- **Projects:** Aplicavel ao conteudo imediato
- **Areas:** Relevante para o nicho do creator
- **Resources:** Util para referencia futura

### Step 3: Distill (Progressive Summarization)
Para cada fonte:
- Layer 1: Informacao bruta capturada
- Layer 2: Trechos-chave em bold
- Layer 3: Insights criticos highlighted
- Layer 4: Resumo em 1 paragrafo proprio
- Layer 5: Content seed (angulo para conteudo)

### Step 4: Express (Content Seeds)
Gerar output pronto para Nicolas Cole:
- 5-10 insights destilados com source
- 3-5 dados/estatisticas com referencia
- 2-3 citacoes de autoridades
- 1 narrativa principal (thread condutor)
- 3-5 content seeds (titulos + angulos)

## Output

```yaml
research_output:
  topic: "{topico}"
  date: "{data}"
  insights:
    - insight: "{insight destilado}"
      source: "{fonte}"
      content_angle: "{angulo para conteudo}"
  data_points:
    - stat: "{estatistica}"
      source: "{fonte}"
  quotes:
    - quote: "{citacao}"
      author: "{autoridade}"
  narrative: "{thread condutor principal}"
  content_seeds:
    - title: "{titulo sugerido}"
      angle: "{4A angle: actionable/analytical/aspirational/anthropological}"
      format: "{post/newsletter/thread}"
```

## Quality Gate

- Minimo 5 insights com sources verificaveis
- Minimo 3 data points com referencia
- Content seeds usam 4A Framework angles
- Narrativa principal clara e unica

## Dependencies

- WebSearch access
- User nicho context (from Blueprint or diagnostic)
