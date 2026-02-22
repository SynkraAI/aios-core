# Task: deconstruct

> **Perguntas de Desconstrução** | Revelar frameworks ocultos de experts

**Execution Type:** Agent

## Objetivo

Aplicar perguntas de desconstrução para extrair frameworks, heurísticas e padrões de decisão que o expert usa mas não articula explicitamente.

## Origem

Metodologia absorvida de Tim Ferriss (4-Hour series, Tools of Titans, Tribe of Mentors).

---

#### >>> CHECKPOINT: Perguntas revelam DECISÃO, não só AÇÃO <<<

```yaml
checkpoint_profundidade_perguntas:
  consult: "OBSESSIONS.clareza_compreensao_profunda"
  question: "Perguntas revelam COMO o expert DECIDE ou só O QUE faz?"
  if_decisao: "Documentar frameworks de decisão"
  if_acao: "Reformular perguntas para focar em decisão (não ação)"
  rationale: "O QUE faz = superfície. COMO decide = framework real."
```

## As 7 Perguntas Core

### 1. Rotina Matinal
> "What do you do in the first 60 minutes of your day?"

**O que revela:** Prioridades reais, não declaradas. O que fazem primeiro = o que importa mais.

### 2. Piores Recomendações
> "What are the worst recommendations in your field?"

**O que revela:** Anti-patterns, o que NÃO fazer. Mostra expertise real (sabe o que evitar).

### 3. Billboard
> "What would you put on a billboard?"

**O que revela:** Mensagem central condensada. Se só pudesse dizer UMA coisa.

### 4. Crença Contrária
> "What is something you believe that others think is insane?"

**O que revela:** Diferencial competitivo, insight único, posicionamento.

### 5. Recomeço
> "If you were starting over, what would you do differently?"

**O que revela:** Erros reais, lições aprendidas, atalhos legítimos.

### 6. Pareto
> "What's the 20% that produces 80% of results?"

**O que revela:** Alavancas principais, foco essencial, priorização.

### 7. Veto
> "What do you say NO to that most people say YES?"

**O que revela:** Limites, princípios não-negociáveis, filtros de decisão.

---

## Perguntas Complementares

### Para Aprofundar Respostas

#### >>> CHECKPOINT: Resposta traz clareza? <<<

```yaml
checkpoint_clareza_resposta:
  consult: "VALUES.clareza_radical"
  question: "Resposta traz CLAREZA sobre como o expert decide?"
  if_clareza: "Documentar com [SOURCE:]"
  if_vaga: "Aprofundar com 'Can you give me a specific example?'"
  rationale: "Resposta vaga = não extraiu nada útil."
```

- "Can you give me a specific example?"
- "When did you learn that?"
- "What was the cost of NOT doing that?"
- "How would you teach this to a beginner?"

### Para Revelar Frameworks

#### >>> CHECKPOINT: Princípios fundamentais? <<<

```yaml
checkpoint_first_principles:
  consult: "MODELS.first_principles_thinking"
  question: "Desconstruí até os PRINCÍPIOS FUNDAMENTAIS ou aceitei a superfície?"
  if_fundamental: "Framework com princípios base documentados"
  if_superficie: "Aplicar 'Por quê?' mais 3 vezes até chegar em axioma"
  rationale: "Sem princípios base = framework superficial que quebra em contexto novo."
```

- "Is there a name for this approach?"
- "Do you have a checklist or process?"
- "What are the steps in order?"
- "What's the first thing you check?"

### Para Revelar Heurísticas
- "How do you know when to apply this?"
- "What's the trigger that tells you X?"
- "What's your rule of thumb for Y?"
- "When do you break this rule?"

---

## Template de Output

```yaml
# Deconstruction: {expert_name}

## Respostas Extraídas

### 1. Rotina Matinal
- **Resposta:** "{resposta}"
- **[SOURCE: {fonte/minuto}]**
- **Framework revelado:** {se houver}

### 2. Piores Recomendações
- **Resposta:** "{resposta}"
- **[SOURCE: {fonte/minuto}]**
- **Anti-pattern:** {o que evitar}

### 3. Billboard
- **Resposta:** "{resposta}"
- **[SOURCE: {fonte/minuto}]**
- **Mensagem central:** {condensado}

### 4. Crença Contrária
- **Resposta:** "{resposta}"
- **[SOURCE: {fonte/minuto}]**
- **Diferencial:** {insight único}

### 5. Recomeço
- **Resposta:** "{resposta}"
- **[SOURCE: {fonte/minuto}]**
- **Atalho legítimo:** {o que faria diferente}

### 6. Pareto (20/80)
- **Resposta:** "{resposta}"
- **[SOURCE: {fonte/minuto}]**
- **Alavanca principal:** {foco essencial}

### 7. Veto
- **Resposta:** "{resposta}"
- **[SOURCE: {fonte/minuto}]**
- **Filtro de decisão:** {quando diz não}

## Síntese

### Frameworks Identificados
1. {framework_1}
2. {framework_2}

### Heurísticas Extraídas
1. "SE {trigger} → ENTÃO {ação}"
2. "SE {trigger} → ENTÃO {ação}"

### Anti-Patterns Documentados
1. {o que evitar}
2. {o que evitar}

### Citações Diretas (verificáveis)
1. "{citação}" [SOURCE: {fonte}]
2. "{citação}" [SOURCE: {fonte}]
```

#### >>> CHECKPOINT: Explorou caos antes de sintetizar? <<<

```yaml
checkpoint_caos_sintese:
  consult: "PARADOXES.clarity_from_chaos"
  question: "Explorei CAOS (muitas perguntas, tangentes) antes de DESTILAR (síntese)?"
  if_explorou: "Síntese rica com base ampla"
  if_filtrou_cedo: "Explorar mais — tangentes revelam surpresas"
  rationale: "Síntese sem exploração = óbvio. Síntese com exploração = insight."
```

---

## Como Aplicar

### Se tem acesso direto ao expert (entrevista)
1. Fazer as 7 perguntas em ordem
2. Gravar respostas
3. Aprofundar com perguntas complementares
4. Documentar com [SOURCE: minuto]

### Se usando conteúdo existente (podcast, livro, vídeo)
1. Buscar respostas para cada pergunta no conteúdo
2. Usar Grep/search para patterns como "I always", "I never", "biggest mistake"
3. Documentar com [SOURCE: página/minuto]
4. Marcar [INFERRED] se não encontrou resposta direta

---

## Completion Criteria

| Critério | Status |
|----------|--------|
| 7 perguntas respondidas (ou marcadas como não encontradas) | [ ] |
| Cada resposta com [SOURCE:] | [ ] |
| Pelo menos 3 frameworks identificados | [ ] |
| Pelo menos 5 heurísticas extraídas | [ ] |
| Anti-patterns documentados | [ ] |

---

*"As perguntas certas revelam o que o expert sabe mas não articula."*
