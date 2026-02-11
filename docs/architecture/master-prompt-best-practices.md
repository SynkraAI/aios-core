# Melhores Praticas para Master Prompts (System Prompts) de Agentes IA

**Autor:** Aria (Architect Agent) | **Data:** 2026-02-10
**Contexto:** Pesquisa para evolucao da arquitetura de prompts do Synkra AIOS
**Versao:** 1.0.0

---

## Sumario Executivo

Este documento compila as melhores praticas contemporaneas para design de system prompts (master prompts) para agentes IA, baseado em pesquisa de fontes primarias (Anthropic, OpenAI), pesquisa academica, e analise comparativa com a arquitetura de prompts existente do AIOS. O documento esta organizado em seis eixos: Estrutura, Tecnicas de Controle, Anti-Patterns, Elicitacao, Escalabilidade e Persona.

**Principio fundamental (Anthropic):** "Claude is already smart enough -- intelligence is not the bottleneck, context is." A qualidade do agente depende mais de como o contexto e curado do que da inteligencia bruta do modelo.

---

## Indice

1. [Estrutura de System Prompts](#1-estrutura-de-system-prompts)
2. [Tecnicas de Controle](#2-tecnicas-de-controle)
3. [Anti-Patterns](#3-anti-patterns)
4. [Elicitacao](#4-elicitacao)
5. [Escalabilidade](#5-escalabilidade)
6. [Persona](#6-persona)
7. [Analise Comparativa com AIOS](#7-analise-comparativa-com-aios)
8. [Recomendacoes](#8-recomendacoes)
9. [Fontes](#9-fontes)

---

## 1. Estrutura de System Prompts

### 1.1 A Zona Goldilocks

Anthropic define o conceito de "altitude correta" para system prompts -- o equilibrio entre dois extremos de falha:

| Extremo | Problema | Sintoma |
|---------|----------|---------|
| **Over-specification** | Logica if-else rigida hardcoded | Fragilidade, manutencao impossivel |
| **Under-specification** | Instrucoes vagas e genericas | Comportamento imprevisivel, suposicoes incorretas |
| **Goldilocks (ideal)** | Especifico o suficiente + flexivel | Heuristicas fortes, modelo usa inteligencia propria |

**Principio:** Dar ao agente heuristicas e principios para tomar boas decisoes independentemente, ao inves de logica rigida ou exemplos exaustivos.

### 1.2 Framework de Quatro Pilares (Anthropic)

A arquitetura de contexto recomendada pela Anthropic se apoia em quatro componentes:

```
1. SYSTEM PROMPT      -- Instrucoes minimas e precisas
2. TOOLS              -- Auto-contidas, sem sobreposicao
3. DATA RETRIEVAL     -- Just-In-Time, nao pre-carregada
4. LONG-HORIZON OPT   -- Compactacao, memoria estruturada, sub-agentes
```

### 1.3 Ordem Recomendada de Secoes

Baseado na convergencia entre multiplas fontes (Anthropic, OpenAI, PromptHub, agentes de producao como Cline e Bolt):

```
SYSTEM PROMPT STRUCTURE
========================

1. IDENTIDADE E PAPEL
   - Quem e o agente, qual seu dominio de atuacao
   - Limites de responsabilidade (o que NAO faz)
   - Tom e estilo de comunicacao

2. CONTEXTO AMBIENTAL
   - Sistema operacional, ferramentas disponiveis
   - Restricoes do ambiente de execucao
   - Estado atual (branch, projeto, sessao)

3. INSTRUCOES CORE (o que fazer)
   - Principios de decisao (heuristicas, nao regras rigidas)
   - Workflow primario do agente
   - Criterios de sucesso

4. FERRAMENTAS E CAPACIDADES
   - Lista de tools com descricoes claras
   - Quando usar cada tool (e quando NAO usar)
   - Formato de invocacao e exemplos

5. GUARDRAILS (o que NAO fazer)
   - Restricoes de seguranca
   - Acoes proibidas ou que requerem confirmacao
   - Limites de autonomia

6. FORMATO DE SAIDA
   - Estrutura esperada das respostas
   - Nivel de verbosidade
   - Templates quando aplicavel

7. EXEMPLOS (quando necessario)
   - Diversos e representativos (nao exaustivos)
   - Incluir exemplos positivos E negativos
   - Mostrar padroes, nao cobrir todos os casos
```

### 1.4 Formatacao e Delimitadores

| Tecnica | Quando Usar | Exemplo |
|---------|-------------|---------|
| **XML tags** | Secoes logicas, inputs do usuario | `<instructions>`, `<context>`, `<rules>` |
| **Markdown headers** | Organizacao hierarquica | `## Tools`, `### Restrictions` |
| **YAML blocks** | Configuracoes estruturadas | Metadata, parametros, definicoes |
| **Bullet lists** | Regras discretas, checklists | `- NUNCA fazer X` |
| **Tabelas** | Comparacoes, mapeamentos | Tool routing, delegacao |

**Descoberta importante (Claude 4.6):** O modelo e mais responsivo ao system prompt do que versoes anteriores. Linguagem que antes era necessaria para forcar comportamento (como "CRITICAL: You MUST...") agora pode causar over-triggering. Use linguagem mais natural: "Use this tool when..." em vez de "CRITICAL: You MUST use this tool when...".

### 1.5 Consistencia Entre Componentes

Uma pratica critica e manter consistencia entre system prompt, definicoes de tools, e outputs anteriores do modelo. Se o system prompt especifica um diretorio de trabalho, todas as tools de arquivo devem usar esse diretorio como padrao. Inconsistencias criam confusao e erros.

---

## 2. Tecnicas de Controle

### 2.1 Explicitar a Motivacao (o "Porque")

Em vez de regras secas, explique por que uma restricao existe. O modelo generaliza melhor a partir da motivacao:

```
MENOS EFICAZ:
  "NUNCA use reticencias"

MAIS EFICAZ:
  "Sua resposta sera lida por um engine text-to-speech,
   entao nunca use reticencias pois o engine nao sabe
   como pronuncia-las."
```

O modelo e inteligente o suficiente para generalizar a partir da explicacao -- ele entendera que tambem deve evitar outros simbolos problematicos para TTS.

### 2.2 Diga o Que Fazer, Nao o Que Nao Fazer

Instrucoes positivas sao mais eficazes que negacoes:

```
MENOS EFICAZ:
  "Nao use markdown na resposta"

MAIS EFICAZ:
  "Sua resposta deve ser composta de paragrafos em prosa fluida."
```

### 2.3 Modos de Operacao (Behavioral Switching)

Agentes de producao (Cline, AIOS) implementam modos que separam planejamento de execucao:

| Modo | Proposito | Comportamento |
|------|-----------|---------------|
| **PLAN MODE** | Reunir informacao, planejar | So leitura, perguntas, analise |
| **ACT MODE** | Executar acoes | Escrita, execucao, modificacao |
| **EXPLORE MODE** | Investigacao autonoma | Navegacao livre, sem modificacoes |

**Padrao AIOS:** O sistema de `PermissionMode` ja implementa cycling (ask > auto > explore) via `*yolo`, que e um bom exemplo desta tecnica.

### 2.4 Gates de Confirmacao para Acoes de Alto Risco

```
ACOES QUE REQUEREM CONFIRMACAO:
- Operacoes destrutivas (deletar, drop, rm -rf)
- Operacoes dificeis de reverter (force push, reset --hard)
- Operacoes visiveis a outros (push, PR, mensagens)

ACOES DE BAIXO RISCO (executar livremente):
- Leitura de arquivos
- Execucao de testes
- Edicoes locais reversiveis
```

**Principio (Claude 4.6):** Considere a reversibilidade e o impacto potencial das acoes. Encorage acoes locais e reversiveis, mas peca confirmacao para acoes dificeis de reverter.

### 2.5 Opcoes Numeradas (Numbered Options Protocol)

Uma das tecnicas mais eficazes para controle de fluxo em agentes interativos:

```
PADRAO:
1. Opcao A -- Descricao com contexto
2. Opcao B -- Descricao com contexto
3. Opcao C -- Descricao com contexto

"Digite o numero para selecionar."
```

**Vantagens:**
- Reduz ambiguidade na resposta do usuario
- Cria checkpoints de decisao explicitos
- Facilita logging e rastreamento
- Permite delegacao autonoma ([AUTO-DECISION] q -> decisao)

**O AIOS ja implementa isso** no `activation-instructions.yaml` com "always show as numbered options list."

### 2.6 Prioridade de Ferramentas

Estabelecer hierarquia explicita entre ferramentas previne conflitos:

```
TAREFA          | USE              | NAO USE
Ler arquivos    | Read tool        | docker-gateway
Buscar conteudo | Grep tool        | grep no bash
Web search      | WebSearch nativo | MCP externo
```

### 2.7 Controle de Autonomia vs Seguranca

O prompt de Claude 4.6 da Anthropic oferece um espectro de controle:

```
MAIS AUTONOMO (proactive action):
  "Por padrao, implemente mudancas ao inves de apenas sugeri-las.
   Se a intencao do usuario nao for clara, infira a acao mais util."

MAIS CONSERVADOR (conservative action):
  "Nao pule para implementacao a menos que claramente instruido.
   Quando a intencao for ambigua, forneca informacao e recomendacoes."
```

---

## 3. Anti-Patterns

### 3.1 Catalogo de Anti-Patterns

| # | Anti-Pattern | Por Que e Ruim | Alternativa |
|---|-------------|----------------|-------------|
| AP-1 | **Logica if-else hardcoded no prompt** | Fragil, impossivel de manter, nao escala | Dar heuristicas e principios |
| AP-2 | **Lista exaustiva de edge cases** | Consome tokens, modelo ignora apos certo ponto | Exemplos diversos e representativos |
| AP-3 | **CAPS LOCK e linguagem agressiva** | Com modelos modernos, causa over-triggering | Linguagem natural e direta |
| AP-4 | **Nomes vagos de tools** ("helper", "utils") | Modelo nao sabe quando usar | Nomes descritivos com acao (`process-pdf`, `analyze-code`) |
| AP-5 | **Tools com funcionalidade sobreposta** | Modelo escolhe errado ou fica indeciso | "Se um humano nao sabe qual tool usar, o modelo tambem nao" |
| AP-6 | **Preload de todo contexto** | Desperidicio de tokens, context rot | Just-In-Time retrieval |
| AP-7 | **Placeholders em codigo** ("// resto do codigo...") | Gera output incompleto ou quebrado | Exigir conteudo completo sempre |
| AP-8 | **Prompt que nao combina com output desejado** | Markdown no prompt gera markdown na resposta | Combinar estilo do prompt com estilo desejado |
| AP-9 | **Personas simples e genericas** ("Voce e um medico") | Performance neutra ou negativa em modelos modernos | Personas detalhadas e especificas OU sem persona |
| AP-10 | **Ignorar limpeza de contexto** | Context poisoning, distraction, confusion, clash | Compactacao ativa, memoria estruturada |

### 3.2 As Quatro Formas de Degradacao de Contexto (Context Rot)

| Tipo | Descricao | Mitigacao |
|------|-----------|-----------|
| **Context Poisoning** | Informacao incorreta/desatualizada corrompe raciocinio | Validar e atualizar periodicamente |
| **Context Distraction** | Dados irrelevantes reduzem foco | Pruning agressivo, JIT retrieval |
| **Context Confusion** | Informacoes similares criam ambiguidade | Nomeclatura clara, delimitadores |
| **Context Clash** | Instrucoes contraditorias | Hierarquia de prioridade explicita |

### 3.3 Anti-Pattern Especifico: Over-Engineering de Prompt

Claude 4.6 tem tendencia a over-engineer (criar abstracoes desnecessarias, arquivos extras, flexibilidade nao solicitada). O prompt precisa conter isso explicitamente:

```
Evite over-engineering. So faca mudancas diretamente solicitadas
ou claramente necessarias. Mantenha solucoes simples e focadas:

- Escopo: Nao adicione features nao solicitadas
- Documentacao: Nao adicione docstrings a codigo que nao mudou
- Defensividade: Nao adicione tratamento de erro para cenarios impossiveis
- Abstracoes: Nao crie helpers para operacoes que acontecem uma vez
```

---

## 4. Elicitacao

### 4.1 Elicitacao Estruturada

O conceito de elicitacao em agentes IA evoluiu significativamente com o MCP (Model Context Protocol), que formalizou o padrao de "pausar e solicitar input estruturado do usuario em runtime."

### 4.2 Padroes de Elicitacao

| Padrao | Descricao | Quando Usar |
|--------|-----------|-------------|
| **Numbered Options** | Apresentar N opcoes numeradas | Decisoes com alternativas claras |
| **Progressive Disclosure** | Comecar com pergunta ampla, detalhar conforme respostas | Coleta de requisitos complexos |
| **Confirmation Gate** | "Confirma [acao]? (s/n)" | Acoes irreversiveis |
| **Template Fill** | Apresentar template com campos a preencher | Coleta de dados estruturados |
| **Clarifying Question** | Pergunta aberta para desambiguar | Requisitos ambiguos |

### 4.3 Principios de Elicitacao Eficaz

**1. Controle do usuario sempre:**
O usuario deve sempre ter a opcao de rejeitar, cancelar, ou redirecionar. Nunca presuma consentimento.

**2. Transparencia:**
Indicar claramente que informacao esta sendo solicitada e por que.

**3. Validacao:**
Validar inputs contra schemas definidos. Um timezone deve ser valido, um booleano nao deve ser string.

**4. Degradacao graceful:**
Se o usuario recusa ou cancela, o agente deve saber prosseguir ou degradar com elegancia.

**5. Rate limiting:**
Nao bombardear o usuario com perguntas. Agrupar quando possivel.

### 4.4 O Padrao `elicit=true` do AIOS

O AIOS ja implementa um padrao sofisticado de elicitacao em suas task definitions:

```yaml
# Nas activation-instructions do AIOS:
- "MANDATORY INTERACTION RULE: Tasks with elicit=true require
   user interaction using exact specified format -
   never skip elicitation for efficiency"
```

Este padrao e forte porque:
- E declarativo (a task define se precisa de elicitacao)
- E enforced no sistema (nao depende do modelo lembrar)
- Tem formato exato especificado (consistencia)
- Tem override explicito: o modo YOLO pode bypassar com `[AUTO-DECISION]`

### 4.5 Melhoria Recomendada: Schema de Elicitacao

Para evolucao do padrao AIOS, considerar schemas JSON formais para elicitacao, alinhado com o padrao MCP:

```yaml
elicitation:
  enabled: true
  schema:
    type: object
    properties:
      option:
        type: number
        enum: [1, 2, 3]
        description: "Selecione a abordagem"
  on_reject: "degrade_gracefully"
  max_attempts: 2
```

---

## 5. Escalabilidade

### 5.1 O Problema de Prompts Crescentes

Conforme sistemas de agentes amadurecem, system prompts tendem a crescer. O AIOS `architect.md` tem 462 linhas. O CLAUDE.md do projeto tem centenas de linhas. O risco e real: prompts longos demais sofrem de context rot e o modelo pode ignorar instrucoes no meio.

### 5.2 Arquitetura Modular de Prompts

```
MODULAR PROMPT ARCHITECTURE
============================

NUCLEO (carregado sempre):
  - Identidade e papel
  - Principios core (5-7 max)
  - Restricoes criticas

MODULES (carregados sob demanda):
  - Tool descriptions
  - Task-specific instructions
  - Domain knowledge
  - Examples

DEPENDENCIES (carregados quando referenciados):
  - Templates
  - Checklists
  - Data files
```

**O AIOS ja implementa isso** com o sistema de `dependencies` no YAML do agente:
```yaml
dependencies:
  tasks: [create-doc.md, ...]
  templates: [architecture-tmpl.yaml, ...]
  checklists: [architect-checklist.md, ...]
  data: [technical-preferences.md]
```

### 5.3 Progressive Disclosure Pattern

Inspirado no sistema de Skills do Claude Code:

```
SKILL.md (overview + info critica, <500 linhas)
  |
  v (agente le quando precisa)
reference.md (detalhes, exemplos)
  |
  v (agente desce quando necessario)
scripts/ (codigo para operacoes deterministicas)
```

Previne desperdicio de tokens enquanto mantem disponibilidade.

### 5.4 Just-In-Time (JIT) vs Pre-Loading

| Estrategia | Pre-Loading | Just-In-Time |
|------------|-------------|--------------|
| **Mecanismo** | Carregar tudo no inicio | Carregar sob demanda |
| **Exemplo** | Dump completo de documentos | Tool de busca + detalhes progressivos |
| **Eficiencia** | Baixa (muitos tokens desperdicados) | Alta (so tokens necessarios) |
| **Quando usar** | Contexto pequeno e sempre relevante | Contexto grande ou seletivamente relevante |

### 5.5 Compactacao de Contexto

Para sessoes longas, a compactacao e essencial:

```
ESTRATEGIA DE COMPACTACAO:

1. Sumarizar passos intermediarios
2. Preservar decisoes arquiteturais criticas
3. Preservar bugs encontrados e suas solucoes
4. Descartar outputs de tools redundantes
5. Descartar mensagens repetidas
6. Manter NOTES.md / TODO.md persistentes

PRINCIPIO: Maximizar recall primeiro, depois melhorar precision.
```

### 5.6 Sub-Agent Architecture

Para prompts que excedem a capacidade de um unico contexto:

```
ORCHESTRATOR (contexto limpo, focado)
  |
  |-- SUB-AGENT: Research (contexto: fontes, queries)
  |-- SUB-AGENT: Analysis (contexto: dados, frameworks)
  |-- SUB-AGENT: Implementation (contexto: codigo, testes)
  |
  v
Summaries condensados (1000-2000 tokens cada)
```

**O AIOS ja implementa isso** com 24 subagents em `.claude/agents/` e 12 agentes especializados.

### 5.7 Tecnicas de Token Optimization

| Tecnica | Impacto | Complexidade |
|---------|---------|-------------|
| Prompt caching | Alto (custo e latencia) | Baixa |
| JIT retrieval | Alto (tokens) | Media |
| Compactacao | Alto (sessoes longas) | Media |
| Sub-agentes | Alto (complexidade do problema) | Alta |
| Lazy loading de secoes | Medio (tokens iniciais) | Baixa |

---

## 6. Persona

### 6.1 Quando Personas Funcionam

Pesquisa academica e pratica convergem em cenarios claros:

**EFICAZ:**
- Tasks abertas e criativas (escrita, brainstorming, conselhos)
- Alinhamento de tom e estilo (formal, tecnico, casual)
- Guardrails de seguranca (limites de comportamento)
- Engagement e experiencia do usuario

**INEFICAZ OU PREJUDICIAL:**
- Tasks baseadas em acuracia factual com modelos modernos
- Personas simples e genericas ("Voce e um medico")
- Classificacao e respostas binarias

### 6.2 Tres Requisitos para Personas Eficazes

Baseado no framework ExpertPrompting e pesquisa empirica:

| Requisito | Descricao | Exemplo |
|-----------|-----------|---------|
| **Especifica** | Alinhada ao dominio da task | "Arquiteta de sistemas distribuidos com 15 anos em fintech" |
| **Detalhada** | Descricao compreensiva | Principios, vocabulario, estilo de comunicacao, foco |
| **Automatizada** | Gerada ou refinada pelo modelo | LLM gera persona ideal para o contexto |

**Descoberta contra-intuitiva:** Personas geradas pelo LLM performam melhor que personas escritas por humanos. A persona "idiota" superou a persona "genio" em testes MMLU.

### 6.3 Anatomia de uma Persona de Agente (Padrao AIOS)

O AIOS implementa um sistema de persona rico que vale como referencia:

```yaml
# Exemplo: Aria (Architect Agent)
persona_profile:
  archetype: Visionary
  zodiac: Sagittarius
  communication:
    tone: conceptual
    emoji_frequency: low
    vocabulary: [arquitetar, conceber, visionar, projetar]
    greeting_levels:
      minimal: "architect Agent ready"
      named: "Aria (Visionary) ready"
      archetypal: "Aria the Visionary ready to envision!"
    signature_closing: "-- Aria, arquitetando o futuro"

persona:
  role: Holistic System Architect & Full-Stack Technical Leader
  style: Comprehensive, pragmatic, user-centric
  identity: Master of holistic application design
  focus: Complete systems architecture
  core_principles:
    - Holistic System Thinking
    - User Experience Drives Architecture
    - Pragmatic Technology Selection
    - Progressive Complexity
    # ... (10 principios)
```

### 6.4 Analise da Eficacia do Modelo AIOS

**Pontos fortes:**
- Persona altamente especifica e detalhada (requisitos 1 e 2 atendidos)
- Vocabulario definido cria consistencia
- Greeting levels permitem adaptacao ao contexto
- Core principles dao heuristicas, nao regras rigidas
- Responsibility boundaries definem delegacao clara

**Pontos de atencao:**
- O zodiac sign nao tem evidencia de impacto na performance
- emoji_frequency como parametro e util mas deveria ter enforcement mais claro
- Archetype (Visionary) funciona bem para tasks criativas/abertas do Architect
- Para agentes mais factuais (@qa, @data-engineer), persona pode ser menos impactante

### 6.5 Quando NAO Usar Persona

| Cenario | Recomendacao |
|---------|-------------|
| Sub-agente de execucao rapida | Sem persona (overhead desnecessario) |
| Task factual de classificacao | Sem persona ou persona minima |
| Tool routing / delegacao | Sem persona (logica pura) |
| API de producao com latencia critica | Persona minima (tokens = latencia) |

---

## 7. Analise Comparativa com AIOS

### 7.1 O Que o AIOS Ja Faz Bem

| Pratica | Status AIOS | Referencia |
|---------|-------------|------------|
| Opcoes numeradas | Implementado | `activation-instructions.yaml` |
| `elicit=true` pattern | Implementado | Task definitions |
| Persona profiles detalhados | Implementado | YAML em cada agente |
| Dependency loading | Implementado | `dependencies:` no YAML |
| Permission modes | Implementado | ask > auto > explore |
| Delegacao explicita | Implementado | `delegate_to_*` |
| Tools com restricoes | Implementado | `git_restrictions:` |
| Greeting levels adaptativos | Implementado | `greeting_levels:` |
| Sub-agent architecture | Implementado | 24 subagents + 12 agentes |
| Progressive disclosure | Implementado | Skills system |

### 7.2 Oportunidades de Melhoria

| Area | Estado Atual | Melhoria Sugerida | Prioridade |
|------|-------------|-------------------|------------|
| **Linguagem agressiva** | Usa CRITICAL/MUST/NEVER extensivamente | Reduzir para linguagem natural (Claude 4.6 nao precisa) | ALTA |
| **Comprimento do prompt** | `architect.md` = 462 linhas carregadas sempre | Separar nucleo (~100 linhas) de modules | MEDIA |
| **Explicacao do "porque"** | Muitas regras sem motivacao | Adicionar contexto/motivacao a cada restricao | MEDIA |
| **Schema de elicitacao** | `elicit=true` boolean | Evoluir para JSON Schema com validacao | BAIXA |
| **Context rot prevention** | Sem estrategia formal | Implementar compactacao + NOTES.md pattern | ALTA |
| **Consistencia cross-component** | System prompt vs tool definitions | Audit de consistencia periodico | MEDIA |
| **Exemplos** | Poucos exemplos nos prompts | Adicionar exemplos canonicos diversos | MEDIA |

### 7.3 Alinhamento com Claude 4.6

O AIOS foi majoritariamente desenvolvido para modelos anteriores. Com Claude Opus 4.6:

1. **Over-prompting de tools** -- Instrucoes como "CRITICAL: You MUST use this tool when..." agora causam over-triggering. Simplificar para "Use this tool when..."

2. **Prefilled responses** -- Nao sao mais suportados no ultimo turn do assistant. Se o AIOS usa isso em algum ponto, precisa migrar.

3. **Autonomia natural** -- Claude 4.6 e significativamente mais proativo. Prompts que encorajavam thoroughness devem ser reduzidos.

4. **Sub-agent orchestration** -- Claude 4.6 reconhece naturalmente quando delegar para sub-agentes. Pode ser necessario adicionar guardrails contra uso excessivo.

---

## 8. Recomendacoes

### 8.1 Recomendacoes de Curto Prazo (Quick Wins)

**R1. Audit de linguagem agressiva**
Substituir instancias de `CRITICAL:`, `MUST`, `NEVER` por linguagem natural com explicacao do motivo. Claude 4.6 responde melhor a contexto do que a imposicao.

**R2. Adicionar motivacao as restricoes existentes**
Para cada regra no CLAUDE.md e nos agent definitions, adicionar uma frase explicando por que a regra existe. O modelo generaliza melhor.

**R3. Revisar tool descriptions**
Garantir que "se um engenheiro humano nao consegue dizer qual tool usar numa situacao, o agente tambem nao consegue." Benchmark de clareza.

### 8.2 Recomendacoes de Medio Prazo (Evolucao)

**R4. Separar nucleo de modules nos agent definitions**
Criar uma estrutura onde o nucleo do agente (~100 linhas) e carregado sempre, e os modules (tools, examples, detailed instructions) sao carregados sob demanda.

**R5. Implementar NOTES.md pattern**
Para sessoes longas, instruir agentes a manter um arquivo de notas persistente fora do contexto principal, com progresso, decisoes e proximos passos.

**R6. Adicionar exemplos canonicos**
Para cada agente, criar 3-5 exemplos representativos (nao exaustivos) de interacoes ideais, incluindo exemplos negativos.

### 8.3 Recomendacoes de Longo Prazo (Arquitetura)

**R7. Schema formal de elicitacao**
Evoluir o `elicit=true` para um JSON Schema completo com tipos, validacao, on_reject, e max_attempts.

**R8. Estrategia de compactacao**
Definir uma politica formal de compactacao para sessoes longas: o que preservar, o que descartar, com que frequencia.

**R9. Prompt versioning**
Implementar versionamento de prompts com changelogs, permitindo rollback e A/B testing de alteracoes.

---

## 9. Fontes

### Fontes Primarias (Vendors)

- [Anthropic - Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Anthropic - Prompting Best Practices (Claude 4.6)](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices)
- [OpenAI - Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)
- [OpenAI - Best Practices for Prompt Engineering](https://help.openai.com/en/articles/6654000-best-practices-for-prompt-engineering-with-the-openai-api)

### Guias e Analises

- [IBM - The 2026 Guide to Prompt Engineering](https://www.ibm.com/think/prompt-engineering)
- [Lakera - The Ultimate Guide to Prompt Engineering in 2026](https://www.lakera.ai/blog/prompt-engineering-guide)
- [PromptHub - Prompt Engineering for AI Agents](https://www.prompthub.us/blog/prompt-engineering-for-ai-agents)
- [Claude's Context Engineering Secrets (01.me)](https://01.me/en/2025/12/context-engineering-from-claude/)
- [Context Engineering: AI Agent Optimization Guide (HowAIWorks)](https://howaiworks.ai/blog/anthropic-context-engineering-for-agents)
- [The 10-Step Prompt Structure Guide (AI Maker)](https://aimaker.substack.com/p/the-10-step-system-prompt-structure-guide-anthropic-claude)
- [The Art of Agent Prompting: Anthropic's Playbook (Medium)](https://techwithibrahim.medium.com/the-art-of-agent-prompting-lessons-from-anthropics-ai-team-e8c9ac4db3f3)
- [GetMaxim - Importance of System Prompts](https://www.getmaxim.ai/articles/the-importance-of-system-prompts-in-shaping-ai-agent-responses/)
- [Promptig Guide (Comprehensive)](https://www.promptingguide.ai/)

### Persona e Role Prompting (Pesquisa)

- [PromptHub - Role Prompting: Does Adding Personas Really Make a Difference?](https://www.prompthub.us/blog/role-prompting-does-adding-personas-to-your-prompts-really-make-a-difference)
- [Arsturn - Designing AI Personas Through Prompt Engineering](https://www.arsturn.com/blog/designing-ai-personas-insights-from-prompt-engineering)

### Seguranca e Guardrails

- [Reco AI - Adding Guardrails for AI Agents](https://www.reco.ai/hub/guardrails-for-ai-agents)
- [Datadog - LLM Guardrails Best Practices](https://www.datadoghq.com/blog/llm-guardrails-best-practices/)
- [NVIDIA - Securing Agentic AI](https://developer.nvidia.com/blog/securing-agentic-ai-how-semantic-prompt-injections-bypass-ai-guardrails/)
- [ArXiv - AI Agent Code of Conduct: Guardrail Policy-as-Prompt](https://arxiv.org/html/2509.23994v1)
- [LogRocket - Protect AI Agent from Prompt Injection](https://blog.logrocket.com/protect-ai-agent-from-prompt-injection/)

### Escalabilidade e Composicao Modular

- [Sendbird - Modular AI Prompts](https://sendbird.com/blog/ai-prompts/modular-ai-prompts)
- [NivaLabs - Prompt Chaining for AI Agents](https://medium.com/@nivalabs.ai/prompt-chaining-for-the-ai-agents-modular-reliable-and-scalable-workflows-a22d15fd5d33)
- [OptizenApp - Modular Prompting for Scale](https://optizenapp.com/ai-prompts/modular-prompting)
- [Awesome AI System Prompts (GitHub)](https://github.com/dontriskit/awesome-ai-system-prompts)

### Elicitacao

- [Glama - Elicitation in MCP](https://glama.ai/blog/2025-09-03-elicitation-in-mcp-bridging-the-human-ai-gap)
- [WorkOS - MCP Elicitation](https://workos.com/blog/mcp-elicitation)
- [FastMCP - User Elicitation](https://gofastmcp.com/servers/elicitation)
- [FKA Dev - MCP Elicitations: Standardizing Interactive AI Workflows](https://blog.fka.dev/blog/2025-01-15-mcp-elicitations-standardizing-interactive-ai-workflows/)

---

*Documento gerado por Aria (Architect Agent) como pesquisa para evolucao da arquitetura de prompts do Synkra AIOS.*
*Nao constitui implementacao -- apenas analise e recomendacoes.*
