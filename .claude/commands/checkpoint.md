Contexto acabando ou usuário pediu checkpoint. Execute TODOS os passos abaixo SEM carregar squads/skills:

## Passo 0: Mudanças não commitadas

- Rode `git diff --stat` via Bash
- Se comando falhar (repo corrompido, sem git), continue com aviso: "⚠️ Git status indisponível — pulando verificação de mudanças."
- Se houver mudanças não commitadas:
  - **Se o agente atual é @dev:** pergunte "Quer fazer commit ou stash antes do checkpoint?"
    - Se sim, faça commit com mensagem `chore: checkpoint session` ou `git stash`
  - **Se o agente atual NÃO é @dev:** apenas registre os arquivos modificados no session file
    - Mostre: "⚠️ Existem mudanças não commitadas. Apenas @dev pode fazer commits. Registrando no session file..."

## Passo 0.5: Detectar modo de governança

Determine onde vive a governança do projeto:

1. **Se `.aios/INDEX.md` existe no cwd** → modo **HYBRID**
   - `gov_path` = `.aios/` (relativo ao cwd)
   - `index_path` = `.aios/INDEX.md`
   - `sessions_path` = `.aios/sessions/`
   - Validar INDEX.md: ler e verificar se contém "Estado Atual" ou "Status". Se vazio ou sem campos obrigatórios → PARAR com erro: "INDEX.md em `.aios/` está corrompido ou vazio. Restaure manualmente ou recrie com `/new-project`."
2. **Se cwd contém `aios-core`** → modo **CENTRALIZED**
   - Identificar projeto pelo contexto da conversa
   - `gov_path` = `docs/projects/{projeto}/`
   - `index_path` = `docs/projects/{projeto}/INDEX.md`
   - `sessions_path` = `docs/projects/{projeto}/sessions/`
3. **Se AMBOS existem** (`.aios/INDEX.md` no cwd E `docs/projects/{projeto}/INDEX.md` em aios-core) → ERRO:
   ```
   ⚠️ CONFLITO: Governança duplicada detectada.
   - `.aios/INDEX.md` existe localmente (HYBRID)
   - `docs/projects/{projeto}/INDEX.md` existe em aios-core (CENTRALIZED)
   Escolha qual usar ou delete um dos dois.
   ```
4. **Se nenhum** → perguntar ao usuário qual projeto, depois seguir como CENTRALIZED

Guarde `gov_path`, `index_path`, `sessions_path` para os passos seguintes.

## Passo 1: Identificar projeto ativo

- Rode `git log --oneline -5` via Bash
- Analise o contexto da conversa para identificar o projeto ativo
- Se trabalhou em mais de 1 projeto, pergunte qual é o foco principal
- **Em modo HYBRID:** o projeto já está identificado pelo `.aios/INDEX.md` no cwd
- **Em modo CENTRALIZED:**
  - **VALIDAR:** Verificar se `docs/projects/{projeto}/` existe
  - Se NÃO existir: pergunte "Projeto '{projeto}' não encontrado em docs/projects/. Quer criar com `/new-project`?"
  - **NUNCA** criar INDEX.md avulso sem a estrutura completa do `/new-project`
- **Aviso de cwd mismatch:** Se o modo é CENTRALIZED mas o campo **Local** do INDEX.md aponta para um diretório diferente do cwd:
  ```
  ⚠️ Você está em {cwd}, mas o projeto vive em {local}.
  Continuando — session será salva em {sessions_path}.
  ```

## Passo 2: Atualizar INDEX.md do projeto

- Leia `{index_path}`
- Se INDEX.md NÃO existir: PARAR e orientar "INDEX.md ausente. Rode `/new-project {projeto}` primeiro para criar a estrutura correta."
- Extraia o campo **Local** (se existir)
- Atualize as seções:
  - **Estado Atual**: reflita o estado real agora
  - **Última Sessão**: data/hora agora, agente/squad usado, o que foi feito (detalhado)
  - **Próximo Passo**: ação concreta para retomar
  - **Histórico**: adicione 1 linha com data e resumo

## Passo 2.5: Rastrear stories, epics e epic execution plans

Busque e documente o estado de tudo que está em andamento. O objetivo é que a próxima sessão saiba **exatamente** onde parou.

### 2.5.1 Stories ativas

1. **Buscar stories do projeto:**
   - **CENTRALIZED:** `docs/stories/active/` por arquivos que contenham o nome do projeto
   - **HYBRID:** `{gov_path}/stories/active/` (se existir) E `docs/stories/active/`
2. Para cada story encontrada:
   - Ler e contar checkboxes: `[x]` (feitos) vs `[ ]` (pendentes)
   - Extrair título e status
3. **Atualizar a story** (se trabalhou nela nesta sessão):
   - Marcar checkboxes de AC cumpridos — **NUNCA** desmarcar os já marcados
   - Adicionar à File List arquivos criados/modificados nesta sessão

### 2.5.2 Epic execution plans (@pm)

O @pm gera **epic execution plans** em YAML (`*create-epic`) que mantêm estado persistente de waves/stories. Esses YAMLs são o checkpoint nativo do PM.

1. **Buscar epic execution plan:**
   - Buscar em `docs/stories/epics/` por `EPIC-*-EXECUTION.yaml` que contenha o nome do projeto
   - **HYBRID:** buscar também em `{gov_path}/epics/`
2. Se encontrar um epic plan YAML:
   - Extrair: nome do epic, wave atual, stories completadas vs pendentes
   - **NÃO modificar o YAML** — apenas ler e documentar no session file
   - Registrar o **path do YAML** para que o próximo `/resume` possa indicar `@pm *execute-epic {path}` como comando de retomada
3. Se encontrar epic `.md` (sem YAML de execução):
   - Extrair milestone atual e progresso geral

### 2.5.3 Registrar no session file (será gravado no Passo 4)

Adicionar seção "Stories/Epics" ao session file:

```markdown
## Stories em andamento
- `{story-file}` — {título} ({N}/{total} ACs completos)
  - [x] AC feito nesta sessão: {descrição}
  - [ ] AC pendente: {descrição}

## Epic
- `{epic-file}` — {título}
- **Execution plan:** `{yaml-path}` (Wave {N}/{total}, {M} stories pendentes)
- **Para retomar:** `@pm *execute-epic {yaml-path}`
```

Se não houver stories/epics: omitir a seção.

### 2.5.4 Atualizar INDEX.md (complementar ao Passo 2)

Se houver stories ou epic ativo, adicionar/atualizar na seção "Estado Atual":

```markdown
- **Story ativa:** `{story-file}` — {progresso}
- **Epic:** `{epic-file}` — Wave {N}/{total}
```

## Passo 3: Atualizar ACTIVE.md

- Leia `docs/projects/ACTIVE.md` (SEMPRE em aios-core, independente do modo)
- Se NÃO existir, criar com header padrão:
  ```
  # Projetos Ativos

  | # | Projeto | Status | Agente/Squad | Última Sessão | INDEX |
  |---|---------|--------|-------------|---------------|-------|
  ```
- Atualize a row do projeto: status, agente/squad, última sessão, link INDEX
- Link INDEX:
  - **CENTRALIZED:** `[INDEX]({nome}/INDEX.md)`
  - **HYBRID:** `[INDEX]({path-absoluto}/.aios/INDEX.md)`
- Se o projeto não está na tabela, adicione uma nova row (calcular `max(#) + 1`)

## Passo 4: Salvar session file

**Naming:** `YYYY-MM-DD-{uuid4}.md` onde `{uuid4}` são os 4 primeiros caracteres de um UUID v4 aleatório.
- Isso evita colisões em sessões concorrentes
- Exemplo: `2026-03-11-a3f7.md`

Criar o session file em `{sessions_path}` com:

```markdown
# Session {data}

## Projeto
- **Nome:** {nome do projeto}
- **INDEX.md:** `{index_path}`
- **Modo:** {HYBRID ou CENTRALIZED}
```

Se o projeto tem **Local** externo (extraído no Passo 2), adicione:

```markdown
## Working Directory
- **Path:** `{local}`
- Arquivos do projeto real vivem neste diretório, fora de aios-core.
```

Restante do session file:

```markdown
## O que foi feito
{descrição detalhada com contexto suficiente para retomar}

## Agente/Squad em uso
{agente ou squad ativo nesta sessão}

## Arquivos para contexto (próximo Claude DEVE ler)
- `{arquivo 1}`
- `{arquivo 2}`
- `{arquivo 3}`
```

**IMPORTANTE:** Liste no máximo 5 arquivos essenciais. O `/resume` lerá até 5.

Se o projeto tem Local externo, use paths absolutos para arquivos fora de aios-core.

Se houver stories/epics (coletados no Passo 2.5), adicione:

```markdown
## Stories em andamento
- `{story-file}` — {título} ({N}/{total} ACs completos)
  - [x] AC feito nesta sessão: {descrição}
  - [ ] AC pendente: {descrição}

## Epic
- `{epic-file}` — {título} (Milestone: {atual})
```

Restante:

```markdown
## Decisões tomadas
- {decisão 1 — para não refazer}
- {decisão 2}

## Próximo passo exato
{comando ou ação específica}

## Arquivos modificados não commitados
{lista ou "Nenhum — tudo commitado"}
```

## Passo 5: Health check rápido dos instruction files

- Conte as linhas de: `~/.claude/CLAUDE.md`, `.claude/CLAUDE.md`, MEMORY.md do projeto
- Conte as linhas dos rules em `.claude/rules/` que NÃO têm frontmatter com campo `paths:`
- Some tudo = **total always-loaded**
- Se total > 500 linhas, mostre WARNING:

```
⚠️ Instruction files cresceram: {total} linhas (limite: 500)
   Rode `/audit-instructions` para diagnóstico completo.
```

- Se total <= 500, mostre apenas: `Instructions: {total}/500 linhas — OK`

## Passo 6: Confirmação

Mostre ao usuário:
- ✅/❌ INDEX.md atualizado (`{index_path}`)
- ✅/❌ ACTIVE.md atualizado
- ✅/❌ Session file salvo em `{sessions_path}{nome-arquivo}.md`
- Modo: {HYBRID ou CENTRALIZED}
- Instructions health: {total}/500

Ao final, SEMPRE mostre a dica de retomada:

```
Para retomar este projeto na próxima sessão, digite:
/resume {projeto}
```

Onde `{projeto}` é o nome do projeto (pasta em `docs/projects/` ou nome extraído do INDEX.md).
