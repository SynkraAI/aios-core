---
name: learning-extractor
title: "Session Kaizen & Learning Extractor"
description: Analisa a sessao atual e extrai melhorias acionaveis para qualquer artefato do sistema (rules, memory, skills, agents, docs, workflows). Ativar com "aprender com sessao", "learning-extractor", "extrair aprendizados", "kaizen sessao".
trigger:
  - "/learning-extractor"
  - "aprender com sessao"
  - "extrair aprendizados"
  - "kaizen sessao"
keywords: [kaizen, learning, extraction, session-analysis, improvement, frontmatter, audit]
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, WebSearch, WebFetch
paths:
  - ".claude/rules/**"
  - ".claude/agents/**"
  - "skills/**"
  - "squads/**"
  - "docs/**"
user-invocable: true
effort: 4
version: "2.0.0"
last_updated: "2026-04-08"
---

# Learning Extractor — Session Kaizen

Analisa o que aconteceu nesta sessao, identifica pontos de melhoria em qualquer artefato envolvido (rules, memory, skills, agents, docs, workflows), e gera um relatorio acionavel salvo em `squads/kaizen-v2/data/learnings/` para revisao e aplicacao em batch.

## Trigger

```text
/learning-extractor [slug-opcional]
```

- Com slug: `squads/kaizen-v2/data/learnings/2026-04-03-db-delivery-learning.md`
- Sem slug: a skill infere o topico principal da sessao em kebab-case

## Fluxo Geral

```
Fase 0: Frontmatter Audit (obrigatoria — gera findings automaticos de gap)
  |
Fase 1: Session Scan
  |
Fase 2: Geracao de Findings
  |
Fase 2.5: Audit de Deltas (verifica quanto cada finding ja foi resolvido na sessao)
  |
Fase 3: Pesquisa Externa (sob demanda, por finding)
  |
Fase 4: Relatorio -> squads/kaizen-v2/data/learnings/YYYY-MM-DD-{slug}-learning.md
  |
[usuario revisa e edita checklist no arquivo]
  |
Fase 5: Apply em Batch (apos usuario responder "aplicar")
  |
Fase 6: Meta-Learning (a skill melhora a si mesma)
```

---

## Fase 0 — Frontmatter Audit (obrigatoria, antes do scan)

Verifica se os artefatos do ecossistema tem metadados minimos. Roda uma vez por execucao da skill. Gera findings do tipo `gap` automaticamente.

### Padrao minimo por tipo de artefato

| Tipo | Campos obrigatorios | Campos recomendados |
|------|--------------------|--------------------|
| Memory (`memory/*.md`) | `name`, `description`, `type` (frontmatter YAML) | `keywords` |
| Rules (`.claude/rules/*.md`) | `description`, `paths` (frontmatter YAML) | `alwaysApply` |
| Skills (`skills/*/SKILL.md`) | `name`, `description`, `allowed-tools` | `trigger`, `keywords`, `paths`, `version`, `last_updated` |
| Agents (`.claude/agents/*.md` ou `squads/*/agents/*.md`) | frontmatter com `name`, `role` ou `title` | `version` |
| Squads (`squads/*/README.md`) | frontmatter com `name`, `description`, `category` | `version` |

### Como auditar

1. Para os artefatos **tocados na sessao** (via git diff + contexto), verificar se tem os campos minimos
2. Para a skill que esta executando (`skills/learning-extractor/SKILL.md`), sempre verificar campos recomendados tambem
3. Para memorias **lidas na Fase 1** como fonte de analise, verificar campos minimos

### Criterio de geracao de finding

- **Falta campo obrigatorio** -> finding `gap` com prioridade **alta**
- **Falta campo recomendado** -> finding `gap` com prioridade **baixa**
- **Formato desatualizado** -> finding `friction` com prioridade **baixa**

### GATE 0 — Validacao do Frontmatter Audit

- [ ] Todos os artefatos tocados na sessao foram verificados?
- [ ] Artefatos sem campos obrigatorios geraram finding `gap`?
- [ ] A propria skill (`SKILL.md`) foi verificada?

---

## Fase 1 — Session Scan

### 1.1 Inferir slug (se nao fornecido)

Analisar o contexto da sessao e extrair o topico principal em kebab-case.

### 1.2 Contexto atual

Usar o que esta na janela de contexto:
- Decisoes tomadas durante a sessao
- Problemas encontrados e como foram resolvidos
- Workarounds usados
- Duvidas ou ambiguidades que surgiram
- Friccoes no processo (passos que exigiram tentativa-e-erro)

### 1.3 Git diff + log da sessao

```bash
git log --since="today" --oneline
git diff --stat HEAD
```

Identifica quais arquivos foram tocados e o que foi commitado nesta sessao.

### 1.4 Leitura direta dos artefatos relevantes

Para cada arquivo identificado nos passos 1.2 e 1.3, ler o conteudo real antes de qualquer analise.

Dominios a verificar:

| Dominio | Caminho |
|---|---|
| Regras do projeto | `.claude/rules/*.md` |
| Memory do projeto | Project memory (conforme memory protocol) |
| Skills invocadas | `skills/*/SKILL.md` |
| Agents usados | `.claude/agents/*.md`, `squads/*/agents/*.md` |
| Docs criados/consultados | `docs/**/*.md` |
| Squads referenciados | `squads/*/README.md` |
| Workflows referenciados | conforme identificado no contexto |

**Artefatos espelho**: se dois ou mais arquivos compartilham o mesmo contrato (ex: SKILL.md + commands/*.md descrevendo os mesmos comandos, ou regra global + regra de projeto), le-los em par antes de gerar findings. Inconsistencias entre artefatos espelho geram findings de `friction` automaticamente.

**Cobertura qualitativa de secoes existentes**: quando uma secao de memory ou rule JA EXISTE sobre o tema da sessao, ler o conteudo completo e verificar se o padrao documentado e CORRETO alem de PRESENTE. Uma secao incompleta ou com anti-padrao implicito gera finding `friction`.

**Regra absoluta**: nunca propor alterar um arquivo que nao foi lido primeiro (REGRA #0 READ-BEFORE-EDIT).

### 1.5 Mapeamento de Artefatos AIOS

Para cada arquivo modificado na sessao (via git diff), mapear ao dominio relevante:

| Caminho/padrao | Dominio |
|---|---|
| `.claude/rules/*.md`, `memory/*.md` | Configuracao e Politica |
| `.claude/settings.json`, hooks | Ferramentas + Configuracao |
| `squads/*/agents/*.md`, workflows | Orquestracao de Squads |
| `skills/*.md` | Skills Runtime |
| `packages/*` | Shared Packages |
| `docs/**` | Documentacao |

**Acao**: para cada dominio identificado, verificar se as mudancas da sessao respeitam as regras documentadas em `.claude/CLAUDE.md` e `.claude/rules/`. Violacoes geram finding `decision` automaticamente.

### GATE 1 — Validacao do Scan

Antes de avancar para a Fase 2, verificar:

- [ ] Pelo menos 3 artefatos do projeto foram lidos (rules, memory, skills, agents ou docs)?
- [ ] Ha contexto de sessao identificavel (git log ou contexto na janela)?

**Se qualquer item falhar**: reportar o problema e parar — nao gerar findings sem base.

---

## Fase 2 — Geracao de Findings

Cada finding segue a estrutura **causa -> acao -> resultado**.

### Taxonomia de findings

| Categoria | Quando usar |
|---|---|
| `gap` | Algo estava ausente e causou friccao ou retrabalho |
| `friction` | Existe, mas e ambiguo, incompleto ou gerou confusao |
| `pattern` | Padrao descoberto na sessao que merece ser documentado |
| `bloat` | Existe mas nao foi util, ou e redundante com outro artefato |
| `decision` | Decisao arquitetural ou de processo que deve ser capturada |

### Criterios de qualidade

Ao analisar os artefatos, verificar:

- **Responsabilidade unica**: cada artefato tem uma responsabilidade clara?
- **Auditabilidade**: causa->acao->resultado e rastreavel?
- **Taxonomia rica**: problemas sao categorizados com precisao?
- **Separacao execucao/interpretacao**: scan != analise != aplicacao?

### Fontes automaticas de findings (alem do contexto da sessao)

- **Fase 0 — Frontmatter Audit**: findings de `gap` para campos ausentes sao gerados automaticamente
- **Artefatos espelho**: inconsistencias entre dois arquivos com mesmo contrato geram `friction` automaticamente

### Regras de geracao

- Zero findings sem ancora concreta na sessao (exceto os gerados pela Fase 0)
- Cada finding cita o artefato-alvo com caminho exato
- A melhoria proposta e texto concreto e especifico ("adicionar esta secao:" com o texto) — nunca vaga ("melhorar clareza")
- A melhoria deve ser coerente com o padrao existente do artefato (ler antes de sugerir)
- Nao propor melhorias que contradizem CLAUDE.md ou as regras do projeto

### GATE 2 — Validacao de cada Finding

Antes de incluir qualquer finding no relatorio, verificar os 5 campos obrigatorios:

- [ ] **Causa**: descreve um momento concreto da sessao (nao generico)?
- [ ] **Acao**: descreve o que aconteceu de forma especifica?
- [ ] **Resultado esperado**: diz o que a melhoria previne ou habilita?
- [ ] **Artefato alvo**: tem caminho exato (nao "algum arquivo de rules")?
- [ ] **Melhoria proposta**: e texto concreto e copiavel (nao "melhorar clareza")?

**Se qualquer campo falhar**: corrigir ou descartar o finding.

---

## Fase 2.5 — Audit de Deltas (obrigatoria)

Antes de escrever o relatorio, auditar cada finding contra o trabalho ja realizado nesta sessao.

### Para cada finding gerado na Fase 2:

1. **Verificar se o artefato alvo foi modificado na sessao** (git diff + git status)

2. **Verificar se existe fix correlato em outro artefato**:
   - Ex: regra local dentro de workflow que poderia virar regra global
   - Ex: correcao inline em 1 arquivo que vira pattern reusable pra outros
   - Ex: decisao tomada na sessao que ainda nao esta documentada como memory

3. **Classificar o status**:

   | Status | Criterio | Acao |
   |---|---|---|
   | **Nao enderecado** | Nada foi feito na sessao que toque o problema | Aplicar finding integralmente |
   | **Parcialmente enderecado** | Fix localizado aplicado, mas o delta reusavel ainda falta | Manter finding + reescrever descricao: "Ja feito: X. Delta: Y." |
   | **Totalmente enderecado** | A sessao ja resolveu de forma completa e reusavel | Descartar finding do relatorio |

4. **Reescrever o finding** com secao explicita "Status atual (auditado)".

### GATE 2.5 — Validacao da auditoria

- [ ] Cada finding foi auditado contra git diff e contexto da sessao?
- [ ] Findings totalmente enderecados foram descartados?
- [ ] Findings parcialmente enderecados tem secao "Status atual" explicita?

---

## Fase 3 — Pesquisa Externa (sob demanda)

Apos gerar todos os findings, avaliar quais se beneficiariam de validacao externa.

**Quando propor pesquisa:**
- Findings `gap`, `pattern` ou `decision` de natureza tecnica ou arquitetural
- **Nunca** para `bloat` ou `friction` de processo simples

**Formato da pergunta ao usuario:**

```text
Pesquisa externa para enriquecer este finding?

[GAP] {titulo do finding}
Fontes relevantes identificadas:
  - GitHub: repositorios open source sobre {tema}
  - Anthropic docs: documentacao oficial de {area}
  - Web: boas praticas da comunidade sobre {tema}

Pesquisar? (sim / nao / depois)
```

### GATE 3 — Validacao pos-pesquisa externa

- [ ] A fonte tem URL real (nao inventada)?
- [ ] O quote e direto e relevante ao finding?
- [ ] A pesquisa reforca ou refina a melhoria — nao a contradiz?

---

## Fase 4 — Relatorio

### Obter data e hora reais

```bash
date "+%Y-%m-%d %H:%M"
```

### Garantir diretorio de learnings

```bash
mkdir -p squads/kaizen-v2/data/learnings
```

### Destino do arquivo

```
squads/kaizen-v2/data/learnings/YYYY-MM-DD-{slug}-learning.md
```

### Formato completo do relatorio

```markdown
# Session Learning — {slug}

**Data**: YYYY-MM-DD HH:MM
**Sessao**: {descricao em 1 linha do que foi feito}
**Artefatos analisados**: N
**Findings**: N total (X alta, Y media, Z baixa prioridade)

---

## Findings

### [GAP] Titulo do finding
**Causa**: momento concreto da sessao que revelou o problema
**Acao**: o que aconteceu (friccao, workaround, retrabalho, duvida)
**Resultado esperado**: o que a melhoria previne ou habilita
**Artefato alvo**: `path/to/file.md`
**Melhoria proposta**:

{texto concreto a adicionar ou alterar no artefato — copiavel diretamente}

**Fontes externas**: (se pesquisado) [Titulo](url) — "quote relevante"
**Prioridade**: alta | media | baixa

---

## Como aplicar

1. Revise os findings acima
2. **Remova do checklist abaixo** os findings que NAO quer aplicar
3. Responda `aplicar` no terminal quando estiver pronto

## Status de Aplicacao

- [ ] [GAP] Finding 1 — `path/to/file.md`
- [ ] [PATTERN] Finding 2 — `memory/x.md`
- [ ] [FRICTION] Finding 3 — `.claude/rules/y.md`
```

### GATE 4 — Validacao do Relatorio

- [ ] O arquivo de learning foi criado?
- [ ] Tem pelo menos 1 finding com todos os campos preenchidos?
- [ ] A secao "Como aplicar" e o checklist "Status de Aplicacao" estao presentes?
- [ ] O slug e kebab-case valido (sem espacos, sem acentos)?

---

## Fase 5 — Apply em Batch

Ativado quando o usuario responde `aplicar` no terminal.

### Passos

1. Ler o arquivo learning para identificar quais findings permanecem no checklist

2. Para cada finding no checklist:
   - Ler novamente o artefato alvo (REGRA #0)
   - Aplicar a melhoria proposta com edicao cirurgica (Edit), nao reescrita total
   - Marcar o finding com check no arquivo learning

3. Commit (se artefatos estao dentro do repositorio):

```bash
git add [artefatos DENTRO do repositorio modificados]
git commit -m "kaizen(session): {slug} — N improvements applied"
```

### GATE 5 — Validacao pos-apply

Para cada artefato modificado, verificar:

- [ ] Ler o arquivo modificado e confirmar que a edicao foi aplicada corretamente?
- [ ] O arquivo ainda esta valido (nao truncado, sem syntax quebrada)?
- [ ] A melhoria aplicada e coerente com o contexto existente do artefato?

---

## Fase 6 — Meta-Learning

Executada automaticamente apos a Fase 5, sem intervencao do usuario.

A skill reflete sobre sua propria execucao nesta sessao e pergunta se identificou algo para melhorar em si mesma.

### Perguntas de auto-analise

- Alguma instrucao foi ambigua ou exigiu interpretacao extra?
- Alguma fase tomou mais passos do que o esperado?
- Faltou algum criterio de analise que teria gerado um finding melhor?
- O formato do relatorio gerado foi claro e acionavel?

### Criterio de acionamento

So propor melhoria a skill se houver **evidencia concreta** da execucao desta sessao. Se nada justificar, encerrar sem proposta.

### Regras

- Maximo 1 melhoria por execucao — priorizar a mais impactante
- A melhoria deve ser coerente com o design existente da skill
- Nao adicionar complexidade desnecessaria

---

## Integracao com Kaizen v2

Esta skill complementa o ciclo de inteligencia do Kaizen v2:

```
Sessao termina -> /learning-extractor -> findings acionaveis
                                              |
                                              v
                                    squads/kaizen-v2/data/learnings/
                                              |
                                              v
                                    *reflect (overnight) -> patterns.yaml
```

Os findings do learning-extractor alimentam o pipeline de pattern extraction do Kaizen v2:
- Learnings com ancora concreta na sessao -> candidatos a patterns
- Patterns verificados (2+ ocorrencias) -> entram no briefing de sessao
- Patterns nao reusados -> decaem via forgetting curve

---

## O que esta skill NAO faz

- Nao inventa melhorias genericas sem ancora concreta na sessao
- Nao sugere alterar arquivos que nao foram relevantes na sessao
- Nao propoe nada que contradiz CLAUDE.md ou regras do projeto
- Nao aplica nada sem `aplicar` explicito do usuario
- Nao reescreve artefatos inteiros — apenas edicoes cirurgicas

---

## Fontes de Verdade

| Fonte | Papel |
|---|---|
| **Sessao atual** (contexto) | Sinal — o que gerou friccao, gap ou descoberta |
| **Artefato alvo lido** | Conteudo — base para escrever a melhoria de forma coerente |
| **CLAUDE.md + regras do projeto** | Constraint — como a melhoria deve ser escrita |
| **GitHub + Anthropic docs + Web** | Validacao externa (sob demanda, por finding) |
