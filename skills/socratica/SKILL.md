---
name: socratica
title: "Reflexão Socrática — Aprender para Nunca Mais Errar"
description: Reflexão filosófica ao final de sessão. Lê o que aconteceu, identifica por que erramos, que padrões se repetem, e gera regras duráveis para o ecossistema nunca mais repetir os mesmos erros. Filosofia do "errar rápido, aprender mais rápido".
trigger:
  - "/socratica"
  - "refletir sobre sessao"
  - "reflexao socratica"
  - "o que aprendemos"
keywords: [reflexao, socratica, aprendizado, erros, filosofia, fail-fast, learning, patterns]
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
paths:
  - "memory/reflections/**"
  - "squads/kaizen-v2/data/**"
  - ".claude/rules/**"
  - "docs/sessions/**"
user-invocable: true
effort: 3
version: "1.0.0"
last_updated: "2026-04-13"
---

# Reflexão Socrática — Aprender para Nunca Mais Errar

A IA lê o que aconteceu na sessão, reflete sobre os erros e decisões, e propõe regras duráveis para que o ecossistema nunca mais repita os mesmos padrões de falha.

Não é extração mecânica (isso é o learning-extractor). É pensamento filosófico: **por que erramos? O que isso revela? O que mudar no sistema?**

## Trigger

```text
/socratica [slug-opcional]
```

## Filosofia

Três princípios socráticos adaptados:

1. **Maiêutica invertida** — Sócrates fazia perguntas para o humano descobrir. Aqui a IA faz perguntas para si mesma sobre o que observou.
2. **Fail fast, learn faster** — Todo erro é matéria-prima. O crime não é errar, é errar a mesma coisa duas vezes.
3. **Regra > reflexão** — Reflexão bonita que não vira regra é diário de adolescente. Toda conclusão deve virar algo aplicável.

## Pipeline

```
/socratica
  │
  ├─ Fase 1: Coleta (o que aconteceu?)
  │
  ├─ Fase 2: Reflexão (por quê?)
  │
  ├─ Fase 3: Destilação (o que nunca mais repetir?)
  │
  └─ Fase 4: Consolidação (regras duráveis)
      │
      └─→ Output: memory/reflections/YYYY-MM-DD-{slug}.md
          └─→ Alimenta: /learning-extractor e kaizen-v2
```

---

## Fase 1 — Coleta: O Que Aconteceu?

Ler as fontes disponíveis da sessão, sem interpretar ainda.

### 1.1 Fontes primárias

```bash
# Commits da sessão
git log --since="today" --oneline --no-decorate

# Arquivos modificados
git diff --stat HEAD

# Daily do kaizen (se existir)
cat squads/kaizen-v2/data/intelligence/daily/$(date +%Y-%m-%d).yaml 2>/dev/null
```

### 1.2 Contexto da janela

Varrer a conversa atual e extrair:
- Erros encontrados (falhas, bugs, workarounds)
- Decisões tomadas (e as alternativas descartadas)
- Momentos de fricção (tentativa-e-erro, confusão, retrabalho)
- Correções do usuário (feedback direto, mudanças de direção)
- Surpresas (algo que funcionou diferente do esperado)

### 1.3 Memórias recentes

```bash
# Feedback recente (últimos 7 dias)
find memory/ -name "feedback_*.md" -mtime -7 2>/dev/null
```

Verificar se algum erro da sessão já tinha feedback anterior — reincidência é sinal grave.

### GATE 1

- [ ] Pelo menos 1 fonte foi lida (git log, daily, ou contexto)?
- [ ] Há material suficiente para reflexão (erros, decisões ou fricções)?

**Se não houver material**: encerrar com "Sessão limpa — nada para refletir." Não forçar reflexão.

---

## Fase 2 — Reflexão: Por Quê?

Para cada erro, decisão ou fricção identificada, aplicar os **4 eixos socráticos**:

### Eixo 1: Causalidade
> "O que realmente causou isso — a causa que você viu ou uma mais funda?"

Não aceitar a primeira resposta. Ir até a causa-raiz. Se o lint falhou, a causa não é "código errado" — é "por que o código errado foi escrito?"

### Eixo 2: Padrões
> "Isso já aconteceu antes? É a segunda vez? A terceira?"

Cruzar com:
- Feedback existente em `memory/`
- Learnings anteriores em `squads/kaizen-v2/data/learnings/`
- Patterns conhecidos em `squads/kaizen-v2/data/intelligence/patterns.yaml`

**Reincidência = falha sistêmica.** Se um erro se repete, a regra que deveria preveni-lo ou não existe, ou não funciona.

### Eixo 3: Decisões
> "A decisão foi a certa, ou só foi conveniente?"

Para cada decisão tomada na sessão:
- Qual era a alternativa descartada?
- O que teria acontecido se escolhêssemos diferente?
- A decisão foi baseada em evidência ou em hábito?

### Eixo 4: Futuro
> "Se essa situação voltar amanhã, o que fazemos diferente?"

Esta é a pergunta mais importante. A resposta deve ser **uma regra concreta**, não uma intenção vaga.

- "Prestar mais atenção" não é resposta.
- "Adicionar gate que verifica X antes de Y" é resposta.

### Formato da reflexão

Para cada item refletido:

```markdown
### {título do erro/decisão/fricção}

**O que aconteceu**: {fato, sem julgamento}
**Por que aconteceu**: {causa-raiz, não sintoma}
**Já aconteceu antes?**: {sim/não — se sim, onde}
**O que fazer diferente**: {regra concreta e aplicável}
```

### GATE 2

- [ ] Cada reflexão tem causa-raiz (não sintoma)?
- [ ] "O que fazer diferente" é uma regra concreta (não intenção vaga)?
- [ ] Reincidências foram sinalizadas?

---

## Fase 3 — Destilação: O Que Nunca Mais Repetir?

Transformar reflexões em **regras candidatas**. Nem toda reflexão vira regra — só as que previnem reincidência real.

### Critérios para virar regra

| Critério | Vira regra? |
|----------|-------------|
| Erro que aconteceu 2+ vezes | SIM — regra urgente |
| Erro grave na primeira vez (dados perdidos, deploy quebrado) | SIM — prevenção |
| Fricção leve, primeira vez | NÃO — observar |
| Decisão que deu certo | NÃO — documentar como pattern, não como regra |
| Decisão que deu errado | DEPENDE — se for reversível, observar. Se não, regra. |

### Formato da regra candidata

```markdown
**Regra**: {o que SEMPRE/NUNCA fazer}
**Por quê**: {o que aconteceu que motivou esta regra}
**Onde aplicar**: {caminho do artefato que deve conter esta regra}
**Tipo**: feedback | rule | memory
```

### GATE 3

- [ ] Cada regra candidata tem "por quê" concreto?
- [ ] Nenhuma regra é vaga ("prestar atenção", "ser cuidadoso")?
- [ ] Regras redundantes com existentes foram fundidas, não duplicadas?

---

## Fase 4 — Consolidação

### 4.1 Gerar diário reflexivo

```bash
date "+%Y-%m-%d"
mkdir -p memory/reflections
```

Destino: `memory/reflections/YYYY-MM-DD-{slug}.md`

```markdown
---
name: reflexao-{slug}
description: Reflexão socrática sobre {tema da sessão}
type: reflection
date: YYYY-MM-DD
session_summary: {1 linha}
errors_found: N
rules_proposed: N
reincidences: N
---

# Reflexão Socrática — {Tema}

**Data**: YYYY-MM-DD
**Sessão**: {o que foi feito}

## Reflexões

{todas as reflexões da Fase 2}

## Regras Propostas

{todas as regras candidatas da Fase 3}

## Reincidências Detectadas

{lista de erros que já aconteceram antes — se nenhuma, omitir seção}
```

### 4.2 Aplicação automática

Para cada regra candidata aprovada na Fase 3:

| Tipo | Ação |
|------|------|
| `feedback` | Criar/atualizar arquivo em `memory/feedback_{slug}.md` + atualizar `MEMORY.md` |
| `rule` | Propor adição em `.claude/rules/` (não aplicar sem confirmar) |
| `memory` | Criar/atualizar em `memory/` com tipo apropriado |

**Regras tipo `rule`**: NUNCA aplicar automaticamente. Mostrar ao usuário e perguntar: "Aplicar esta regra em `.claude/rules/`?"

**Regras tipo `feedback` e `memory`**: aplicar automaticamente — são leves e reversíveis.

### 4.3 Sinalizar para o learning-extractor

Se o learning-extractor rodar depois, ele deve ler `memory/reflections/YYYY-MM-DD-{slug}.md` como fonte adicional. A integração é passiva — não precisa de hook, o learning-extractor já lê `memory/`.

### GATE 4

- [ ] Diário reflexivo criado em `memory/reflections/`?
- [ ] Feedbacks aplicados automaticamente?
- [ ] Rules propostas mostradas ao usuário (não aplicadas sozinhas)?
- [ ] `MEMORY.md` atualizado se novos feedbacks foram criados?

---

## Integração com o Ecossistema

```
Sessão termina
  │
  ├─ /socratica ← reflexão filosófica (POR QUÊ?)
  │    └─ memory/reflections/YYYY-MM-DD.md
  │    └─ memory/feedback_*.md (auto)
  │
  ├─ /learning-extractor ← extração mecânica (O QUÊ?)
  │    └─ kaizen-v2/data/learnings/YYYY-MM-DD.md
  │
  └─ kaizen-v2 *reflect ← consolidação de patterns
       └─ patterns.yaml
```

**Divisão clara**:
- `/socratica` responde **por que erramos** e gera **regras preventivas**
- `/learning-extractor` responde **o que melhorar** e gera **findings acionáveis**
- `kaizen-v2` consolida ambos em **patterns de longo prazo**

---

## Automação (Zero Intervenção Humana)

A skill roda automaticamente sem o usuário precisar acionar nada:

```
Sessão termina (Stop hook)
  └─ stop-capture.cjs captura dados
      └─ stop-flag.cjs detecta fricção → escreve pending-reflection.json

Próxima sessão inicia (SessionStart hook)
  └─ session-check.cjs lê o flag
      └─ Injeta instrução: "Execute /socratica antes de trabalho novo"

Claude executa /socratica automaticamente
  └─ Fase 1-4 (reflexão + regras)
      └─ Fase 5: Chama /learning-extractor (encadeamento)
          └─ Limpa pending-reflection.json
```

### Arquivos de automação

| Arquivo | Papel | Quando roda |
|---------|-------|-------------|
| `stop-flag.cjs` | Detecta fricção, escreve flag | Stop (via stop-capture.cjs) |
| `session-check.cjs` | Lê flag, injeta instrução | SessionStart |
| `pending-reflection.json` | Flag temporário | Auto-criado/limpo |

### Fase 5 — Encadeamento Automático

Após a Fase 4 (consolidação):

1. Chamar `/learning-extractor` passando o slug da reflexão
2. O learning-extractor lê `memory/reflections/YYYY-MM-DD-{slug}.md` como fonte adicional
3. Limpar o flag:

```bash
rm -f skills/socratica/pending-reflection.json
```

4. Informar ao usuário: "Reflexão socrática completa. X regras criadas, Y findings extraídos."

### Trigger manual

Mesmo com automação, o usuário pode rodar manualmente a qualquer momento:

```text
/socratica           # reflexão da sessão atual
/socratica deploy    # com slug específico
```

---

## O Que Esta Skill NÃO Faz

- Não faz perguntas interativas ao humano (é observacional)
- Não extrai findings mecânicos (isso é o learning-extractor)
- Não aplica regras em `.claude/rules/` sem confirmação
- Não força reflexão quando a sessão foi limpa
- Não gera reflexões genéricas ("podemos melhorar") — só concretas
- Não duplica regras que já existem em feedback/rules

---

## Exemplo de Output

```markdown
---
name: reflexao-lint-failures
description: Reflexão sobre falhas repetidas de lint na sessão
type: reflection
date: 2026-04-13
session_summary: Implementação de feature X com 3 falhas de lint
errors_found: 3
rules_proposed: 1
reincidences: 1
---

# Reflexão Socrática — Lint Failures

**Data**: 2026-04-13
**Sessão**: Implementação de feature X

## Reflexões

### Lint falhou 3 vezes por import relativo

**O que aconteceu**: Usei `../../utils` em 3 arquivos. Lint reprovou cada vez.
**Por que aconteceu**: Hábito de projeto anterior. A regra de absolute imports
existe em `.claude/rules/`, mas não foi consultada antes de codar.
**Já aconteceu antes?**: Sim — feedback_absolute-imports.md (2026-04-01)
**O que fazer diferente**: Ler as regras de import ANTES de começar a codar,
não depois do lint reclamar. Adicionar ao Checkpoint #0.

## Regras Propostas

**Regra**: Antes de implementar, ler `.claude/rules/` relacionadas ao domínio
**Por quê**: 3 falhas de lint que teriam sido evitadas com leitura prévia
**Onde aplicar**: `.claude/rules/behavioral-rules.md` (Checkpoint #0)
**Tipo**: rule

## Reincidências Detectadas

- ⚠️ Import relativo: 2ª ocorrência (1ª em 2026-04-01)
  - Regra existente não está sendo eficaz → considerar hook automático
```
