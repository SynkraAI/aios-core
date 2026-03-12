Início de sessão ou usuário quer retomar trabalho. Execute os passos abaixo SEM carregar squads/skills:

**Argumento opcional:** O usuário pode passar o nome do projeto direto: `/resume {projeto}`
Se `$ARGUMENTS` estiver preenchido, use-o como nome do projeto e PULE para o Passo 2.

**Validação do argumento:**
1. Verificar se `docs/projects/{argumento}/` existe (modo CENTRALIZED)
2. Se NÃO existir: verificar ACTIVE.md por link INDEX que contenha o argumento
3. Se encontrar link absoluto (ex: `~/CODE/Projects/{argumento}/.aios/INDEX.md`) → modo HYBRID
4. Se NÃO encontrar em nenhum lugar: mostrar "Projeto '{argumento}' não encontrado." e cair no Passo 1

## Passo 1: Mostrar projetos ativos (pular se argumento válido fornecido)

- Leia `docs/projects/ACTIVE.md`
- Se ACTIVE.md não existir ou estiver vazio: mostrar "Nenhum projeto ativo encontrado. Use `/new-project` para criar um." e PARAR
- Mostre todos os projetos ordenados por data da última sessão (mais recentes primeiro):

```
# | Projeto | Status | Agente/Squad | Última Sessão | INDEX
```

- Use AskUserQuestion para o usuário escolher qual projeto retomar

## Passo 2: Detectar modo de governança

Após o usuário escolher (ou usar o argumento fornecido):

**Detecção de modo:**
1. Se `docs/projects/{projeto}/INDEX.md` existe → `index_path` = `docs/projects/{projeto}/INDEX.md`, modo = **CENTRALIZED**
2. Se a row no ACTIVE.md tem link INDEX absoluto (ex: `~/CODE/Projects/.../.aios/INDEX.md`) → seguir esse path, modo = **HYBRID**
3. Se `.aios/INDEX.md` existe no cwd atual → `index_path` = `.aios/INDEX.md`, modo = **HYBRID**

Guardar `index_path`, `sessions_path`, `modo`.

## Passo 3: Carregar contexto do projeto

1. Leia `{index_path}`
   - Se não existir: mostrar "INDEX.md ausente para '{projeto}'. Rode `/new-project` para criar a estrutura." e PARAR
   - **Validar INDEX.md:** verificar se contém "Estado Atual" ou "Status". Se vazio ou corrompido: avisar "⚠️ INDEX.md corrompido. Restaure manualmente." e PARAR
2. Extraia o campo **Local** (se existir)
3. Determine `sessions_path`:
   - **CENTRALIZED:** `docs/projects/{projeto}/sessions/`
   - **HYBRID:** diretório pai de `{index_path}` + `/sessions/`
4. Verifique se existe session file recente em `{sessions_path}`
   - Se sim, leia o mais recente (por data no nome, considerar sufixos `-02`, `-03`, `-xxxx`)
   - Se falhar ao ler (arquivo corrompido/truncado): avisar "⚠️ Session file corrompido, usando apenas INDEX.md" e continuar
   - Se não houver session files, use apenas o INDEX.md
5. Se o session file lista "Arquivos para contexto", leia esses arquivos (máximo 5 primeiros)
   - Se algum arquivo não existir mais: pular e avisar "⚠️ Arquivo {path} não encontrado (pode ter sido deletado)"
   - Se houver mais de 5 listados: ler apenas os 5 primeiros e avisar "Listados mais de 5 arquivos, lendo os 5 primeiros."

## Passo 3.5: Recuperar estado de stories e epics

Se o session file contiver seção "Stories em andamento" ou "Epic":

1. **Stories:** Extrair path e progresso de cada story listada
   - Ler a story para obter estado atualizado dos checkboxes
2. **Epic execution plan:** Se o session file mencionar `*execute-epic {path}`:
   - Ler o YAML para obter wave atual e stories pendentes
   - Guardar o path para sugerir como comando de retomada
3. Se NÃO houver seção de stories/epics no session file:
   - Buscar stories ativas em `docs/stories/active/` que mencionem o projeto
   - Buscar epic plans em `docs/stories/epics/` com `EPIC-*-EXECUTION.yaml`

## Passo 4: Resumo de contexto

Apresente ao usuário de forma concisa:

```
## Projeto: {nome}
**Tipo:** {tipo, se disponível no INDEX.md}
**Status:** {estado atual}
**Modo:** {HYBRID ou CENTRALIZED}
**Última sessão:** {data} — {o que foi feito}
**Agente/Squad:** {qual estava ativo}
**Decisões já tomadas:** {lista, para não refazer}
**Próximo passo:** {ação exata}
```

Se houver **stories ativas** (do Passo 3.5), adicione:

```
**Story ativa:** `{story-file}` — {título} ({N}/{total} ACs)
  Pendentes: {lista dos ACs não marcados}
```

Se houver **epic execution plan** (do Passo 3.5), adicione:

```
**Epic:** `{epic-file}` — Wave {N}/{total} ({M} stories pendentes)
**Retomar epic:** `@pm *execute-epic {yaml-path}`
```

Se o projeto tem **Local** externo (extraído no Passo 3), adicione:

```
**Working Directory:** `{local}`
⚠️ O código deste projeto vive fora de aios-core. Considere trocar o working directory:
cd {local}
```

Adicione informação de git se disponível:

```
**Git:** branch `{branch atual}` — {N arquivos modificados, ou "limpo"}
**Última atividade:** há {X dias/horas desde a última sessão}
```

Se última sessão foi há mais de 7 dias, adicione: "⚠️ Contexto pode estar desatualizado — revise antes de continuar."

## Passo 5: Aguardar confirmação

- Pergunte: "Quer continuar com esse próximo passo, ou fazer algo diferente?"
- Se houver epic execution plan pendente, sugira: "Quer retomar o epic? Rode: `@pm *execute-epic {yaml-path}`"
- NÃO execute nada sem confirmação explícita do usuário
- Se o usuário quiser ativar um agente/squad, aí sim carregue o recurso necessário
