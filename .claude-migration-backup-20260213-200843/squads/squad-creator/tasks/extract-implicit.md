# Task: extract-implicit

> **Extrator de Conhecimento Tácito** | Revelar o que foi decidido sem ser verbalizado

**Execution Type:** Agent

## Objetivo

Analisar **qualquer tipo de conteúdo** (livros, aulas, conversas, código, processos) para extrair conhecimento implícito: premissas não declaradas, heurísticas ocultas, pontos cegos estratégicos e decisões tomadas por omissão.

## Fundamentação Teórica

| Framework | Autor | Contribuição para esta Task |
|-----------|-------|----------------------------|
| **SECI Model** | Nonaka & Takeuchi | Processo de Externalization (tácito → explícito) |
| **Tacit Dimension** | Michael Polanyi | "We can know more than we can tell" |
| **How to Read a Book** | Mortimer Adler | Leitura Analítica e Sintópica |
| **Mental Models** | Shane Parrish/Farnam Street | Extração de frameworks de pensamento |
| **Feynman Technique** | Richard Feynman | Validação: explique simples ou não entendeu |

### SECI Model - Externalization

A conversão de conhecimento tácito em explícito (Externalization) requer:
- **Metáforas e analogias** - expressar o inexpressável
- **Conceitos e hipóteses** - articular intuições
- **Modelos e frameworks** - estruturar padrões

### Níveis de Leitura (Adler)

| Nível | Propósito | Pergunta Central |
|-------|-----------|------------------|
| Elementary | Entender palavras | "O que diz?" |
| Inspectional | Estrutura geral | "Sobre o que é?" |
| **Analytical** | Compreensão profunda | "O que significa?" |
| **Syntopical** | Síntese entre fontes | "Como se relaciona com X?" |

Esta task opera nos níveis **Analytical** e **Syntopical**.

---

## Tipos de Conteúdo Suportados

| Tipo | Sinais Específicos de Conhecimento Tácito |
|------|-------------------------------------------|
| **Livros** | Premissas do autor, frameworks não nomeados, vieses disciplinares |
| **Aulas/Workshops** | O que o instrutor assume que você sabe, atalhos de expert |
| **Conversas de Projeto** | Decisões por omissão, requisitos implícitos, riscos ignorados |
| **Código/Arquitetura** | Convenções não documentadas, razões de design choices |
| **Processos/SOPs** | Conhecimento tribal, "todo mundo sabe que...", edge cases |
| **Entrevistas** | Heurísticas do expert, padrões de decisão, anti-patterns vividos |

### Adaptação por Tipo

**Para Livros:**
- Foque em premissas do campo/disciplina que o autor assume
- Identifique frameworks que o autor usa mas não nomeia
- Mapeie o "círculo de competência" implícito

**Para Aulas:**
- O que o instrutor pulou por "ser óbvio"?
- Quais perguntas ele nunca fez (mas deveria)?
- Que atalhos de expert ele usa sem explicar?

**Para Projetos:**
- Que alternativas nunca foram discutidas?
- Que dependências estão assumidas?
- Que riscos ninguém menciona?

---

## Os 4 Eixos de Análise

### 1. Premissas Não Declaradas
> "Quais suposições estamos fazendo implicitamente que nunca foram questionadas ou validadas?"

**O que revela:** Fundações invisíveis do projeto. Se erradas, tudo desmorona.

#### >>> CHECKPOINTS: Clareza + Princípios fundamentais <<<

```yaml
checkpoint_clareza_premissa:
  consult: "VALUES.clareza_radical"
  question: "Premissa identificada é CLARA ou ainda nebulosa?"
  if_clara: "Classificar impacto"
  if_nebulosa: "Reformular até estar em 1 frase (Feynman)"
  rationale: "Premissa nebulosa não é extração, é mais ruído."

checkpoint_premissa_raiz:
  consult: "MODELS.first_principles_thinking"
  question: "Identifiquei as PREMISSAS por trás das premissas?"
  if_raiz: "Premissas mapeadas até a base"
  if_superficie: "Perguntar: 'O que precisa ser verdade para essa premissa existir?'"
  rationale: "Premissa de superfície é fácil. Premissa raiz é onde mora o insight."
```

**Sinais no conteúdo:**
- Frases com "obviamente", "claro que", "todo mundo sabe"
- Ausência de justificativa para escolhas fundamentais
- Saltos lógicos entre tópicos
- Conceitos usados sem definição

### 2. Heurísticas Ocultas
> "Quais regras de decisão ou atalhos mentais parecem estar guiando escolhas sem terem sido formalizados?"

**O que revela:** Como decisões estão sendo tomadas na prática (vs. teoria).

#### >>> CHECKPOINT: Formalização <<<

```yaml
checkpoint_formalizacao:
  consult: "OBSESSIONS.clareza_compreensao_profunda"
  question: "Heurística identificada tem formato SE/ENTÃO com trigger explícito?"
  if_formalizada: "Formalizar como regra de decisão"
  if_vaga: "Refinar até ter 'SE {trigger} → ENTÃO {ação}'"
  rationale: "Heurística sem trigger = observação, não regra."
```

**Sinais no conteúdo:**
- Padrões de "SE X, ENTÃO sempre Y"
- Rejeições rápidas sem explicação completa
- Preferências consistentes não justificadas
- "Instinto" ou "feeling" mencionados

### 3. Pontos Cegos Estratégicos
> "Quais riscos, dependências ou trade-offs críticos não foram mencionados mas são fundamentais?"

**O que revela:** O que pode matar o projeto se continuar invisível.

**Sinais no conteúdo:**
- Cenários nunca discutidos (e se X falhar?)
- Dependências de terceiros não mapeadas
- Recursos assumidos como disponíveis
- Competição/alternativas ignoradas

### 4. Decisões Implícitas
> "Quais caminhos já foram 'escolhidos' por omissão (ao não discutir alternativas)?"

**O que revela:** Portas que foram fechadas sem perceber.

**Sinais no conteúdo:**
- Alternativas nunca consideradas
- "Vamos fazer X" sem "por que não Y ou Z?"
- Escopo definido por subtração (o que ficou de fora)
- Prioridades emergentes (o que é discutido primeiro/mais)

---

## Processo de Extração

### Fase 1: Scan Inicial
1. Ler/ouvir o conteúdo completo
2. Marcar pontos de "salto lógico" ou "decisão rápida"
3. Listar conceitos usados sem definição
4. Identificar ausências óbvias (o que NÃO foi discutido)

### Fase 2: Análise Profunda
Para cada ponto identificado:
1. **Evidência:** Citar trecho específico `[SOURCE: minuto/página]`
2. **Inferência:** O que isso implica?
3. **Impacto:** CRÍTICO / ALTO / MÉDIO
4. **Pergunta:** O que deveríamos perguntar para resolver?

### Fase 3: Priorização

#### >>> CHECKPOINT: Pareto ao Cubo na priorização <<<

```yaml
checkpoint_pareto_priorizacao:
  consult: "MODELS.pareto_ao_cubo"
  question: "Top 5 críticos segue lógica Pareto (impacto exponencial primeiro)?"
  if_pareto: "Priorização válida"
  if_linear: "Reordenar: CRÍTICO que desbloqueia outros primeiro"
  rationale: "Priorizar pelo impacto exponencial, não pelo mais fácil."
```

Ordenar por:
1. Impacto se continuar invisível (CRÍTICO primeiro)
2. Facilidade de resolver (quick wins)
3. Dependências (o que desbloqueia outras coisas)

---

## Template de Output

```yaml
# Análise de Conhecimento Implícito: {projeto/aula}

## Metadata
- **Fonte:** {descrição do conteúdo analisado}
- **Data:** {data da análise}
- **Analista:** @oalanicolas

---

## 1. Premissas Não Declaradas

### P1: {nome da premissa}
- **Evidência:** "{trecho citado}" [SOURCE: {minuto/página}]
- **O que está sendo assumido:** {descrição}
- **Impacto se falsa:** [CRÍTICO/ALTO/MÉDIO]
- **Pergunta para resolver:** "{pergunta específica}"

### P2: {nome da premissa}
...

---

## 2. Heurísticas Ocultas

### H1: {nome da heurística}
- **Padrão observado:** "SE {trigger} → ENTÃO {ação}"
- **Evidência:** "{trecho citado}" [SOURCE: {minuto/página}]
- **Por que importa:** {explicação}
- **Deveria ser formalizada?** [SIM/NÃO] - {justificativa}

### H2: {nome da heurística}
...

---

## 3. Pontos Cegos Estratégicos

### PC1: {nome do ponto cego}
- **O que não foi discutido:** {descrição}
- **Evidência da ausência:** {como você sabe que falta}
- **Impacto potencial:** [CRÍTICO/ALTO/MÉDIO]
- **Cenário de risco:** "E se {situação}?"
- **Pergunta para resolver:** "{pergunta específica}"

### PC2: {nome do ponto cego}
...

---

## 4. Decisões Implícitas

### D1: {nome da decisão}
- **O que foi "escolhido" por omissão:** {descrição}
- **Alternativas não consideradas:** {lista}
- **Evidência:** "{trecho ou ausência}" [SOURCE: {minuto/página}]
- **Impacto:** [CRÍTICO/ALTO/MÉDIO]
- **Pergunta para validar:** "{pergunta específica}"

### D2: {nome da decisão}
...

---

## Síntese Executiva

### Top 5 Itens Críticos (ordenados por impacto)

| # | Tipo | Item | Impacto | Pergunta-Chave |
|---|------|------|---------|----------------|
| 1 | {P/H/PC/D} | {nome} | CRÍTICO | "{pergunta}" |
| 2 | {P/H/PC/D} | {nome} | CRÍTICO | "{pergunta}" |
| 3 | {P/H/PC/D} | {nome} | ALTO | "{pergunta}" |
| 4 | {P/H/PC/D} | {nome} | ALTO | "{pergunta}" |
| 5 | {P/H/PC/D} | {nome} | ALTO | "{pergunta}" |

### Padrões Meta-Observados
- {padrão 1 - ex: "Tendência a assumir recursos ilimitados"}
- {padrão 2 - ex: "Viés para soluções técnicas vs. processuais"}
- {padrão 3}

### Recomendação de Próximos Passos
1. {ação imediata para item mais crítico}
2. {ação para desbloquear outros}
3. {ação de prevenção futura}
```

---

## Perguntas Gatilho

### Versão Simples (para aplicar rápido)
> "Quais decisões, heurísticas ou fundamentos podemos estar deixando passar, que não foram verbalizados, mas são importantes ou fundamentais para este projeto?"

### Versão Completa (análise profunda)
> "Analise toda a conversa sobre [PROJETO] e identifique:
> 1. Premissas não declaradas
> 2. Heurísticas ocultas
> 3. Pontos cegos estratégicos
> 4. Decisões implícitas
>
> Para cada item: evidência, impacto, pergunta para resolver."

---

## Heurísticas de Detecção

### Sinais de Premissa Oculta
- "Obviamente..." / "Claro que..."
- Conceito usado sem definição
- Salto lógico entre A e C (sem B)
- Justificativa circular

### Sinais de Heurística Não Formalizada
- "Eu sempre faço X quando Y"
- Rejeição instantânea sem análise
- "Meu instinto diz..."
- Padrão repetido 3+ vezes

### Sinais de Ponto Cego
- "E se X?" nunca perguntado
- Cenário de falha não discutido
- Dependência externa não mapeada
- Competidor/alternativa ignorado

### Sinais de Decisão Implícita
- "Vamos fazer X" (sem "por que não Y?")
- Escopo por subtração
- Primeira opção = opção final
- Discussão desbalanceada (80% em um tópico)

---

## Completion Criteria

| Critério | Status |
|----------|--------|
| 4 eixos analisados (P, H, PC, D) | [ ] |
| Cada item com [SOURCE:] ou justificativa de ausência | [ ] |
| Impacto classificado (CRÍTICO/ALTO/MÉDIO) | [ ] |
| Pergunta-chave para cada item | [ ] |
| Top 5 priorizado | [ ] |
| Síntese executiva completa | [ ] |

---

## Validação: Feynman Technique

Após extrair o conhecimento implícito, valide usando Feynman Technique:

1. **Explique cada heurística extraída como se fosse para um iniciante**
2. **Se não conseguir explicar simples → você não extraiu direito**
3. **Gaps na explicação = gaps na extração**

### Checklist de Validação Feynman

| Pergunta | Se NÃO conseguir... |
|----------|---------------------|
| Consigo explicar esta premissa em 1 frase? | Premissa não está clara |
| Consigo dar 3 exemplos desta heurística? | Heurística pode ser falsa |
| Consigo explicar POR QUE este ponto cego importa? | Impacto não foi entendido |
| Consigo explicar alternativas à decisão implícita? | Decisão não foi mapeada |

---

## Meta-Heurísticas (Sempre Perguntar)

Antes de criar qualquer framework de extração, pergunte:

### 1. "Quem já faz isso bem?"
> Existe alguém que comprovadamente faz esta extração com um framework documentado?

#### >>> CHECKPOINT: Humildade antes de criar <<<

```yaml
checkpoint_humble_meta:
  consult: "PARADOXES.humble_expert"
  question: "Perguntei 'Quem já faz isso bem?' ANTES de criar framework próprio?"
  if_pesquisou: "Pesquisou referências antes de inventar"
  if_inventou: "PARAR e pesquisar frameworks existentes primeiro"
  rationale: "Expert em processo: sabe COMO extrair. Humilde: não assume que sabe TUDO."
```

**Por que importa:** Reinventar a roda é desperdício. Frameworks validados > intuição.

**Ação:** Pesquisar antes de criar. Adaptar > inventar.

### 2. "O que Polanyi/Nonaka/Adler diriam?"
> Estou fazendo Externalization correta? Estou no nível Analytical/Syntopical?

**Por que importa:** Ancoragem em teoria validada evita vieses.

### 3. "Consigo explicar para um iniciante?" (Feynman)
> Se não consigo explicar simples, não entendi.

**Por que importa:** Validação imediata de qualidade da extração.

---

## Quando Usar

- **Pós-aula/workshop:** Extrair o que o instrutor assumiu mas não disse
- **Review de projeto:** Identificar riscos ocultos antes de executar
- **Análise de conversa:** Mapear decisões que foram tomadas sem discussão
- **Auditoria de processo:** Encontrar heurísticas informais que deveriam ser SOPs
- **Leitura de livros:** Extrair frameworks que o autor usa mas não nomeia
- **Code review:** Identificar convenções não documentadas

---

## Fontes

- Nonaka, I. & Takeuchi, H. (1995). *The Knowledge-Creating Company*
- Polanyi, M. (1966). *The Tacit Dimension*
- Adler, M. & Van Doren, C. (1972). *How to Read a Book*
- Parrish, S. (2019). *The Great Mental Models*

---

*"O conhecimento mais perigoso é o que você não sabe que não sabe."*
*"Perguntas certas revelam premissas ocultas. Ausências revelam pontos cegos."*
*"We can know more than we can tell." — Michael Polanyi*
