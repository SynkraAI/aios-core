Usuario quer criar um novo projeto. Siga os passos abaixo:

## Passo 1: Coletar informacoes
Use AskUserQuestion para perguntar:

1. **Nome do projeto** (kebab-case, ex: meu-saas-app)
2. **Descricao breve** (1 linha)
3. **Tipo** — opcoes: squad | app | mind-clone | pipeline | knowledge | research
4. **Squad/skill principal** (ou "nenhum ainda")
5. **Status inicial** — opcoes: Em andamento | Pausado

## Passo 2: Criar estrutura
Apos respostas:

1. Crie `docs/projects/{nome}/` com subpastas:
   - `research/` — pesquisas e deep research
   - `data/` — dados do projeto
   - `sessions/` — session files de checkpoint/resume
2. Adicione `.gitkeep` em cada subpasta vazia

## Passo 3: Gerar INDEX.md
Crie `docs/projects/{nome}/INDEX.md` seguindo este formato:

```markdown
# {Nome Legivel} — Project Index

## Estado Atual
- **Squad:** `{squad}` (ou "A definir")
- **Status:** {status descritivo}
- **Bloqueadores:** Nenhum

## Ultima Sessao
- **Data:** {data de hoje}
- **Agente/Squad:** {squad informado ou "Nenhum"}
- **O que foi feito:**
  1. Projeto criado

## Proximo Passo
- {baseado no tipo e descricao}

## Squads Relacionados
- `{squad}` — {descricao breve}

## Arquivos Chave
| Arquivo | Conteudo |
|---------|---------|
| INDEX.md | Este arquivo |

## Historico
| Data | Acao |
|------|------|
| {data de hoje} | Projeto criado |
```

Se o usuario informou um squad que existe em `squads/`, verifique se existe e mencione na secao "Squads Relacionados" com descricao real.

## Passo 4: Atualizar ACTIVE.md
- Leia `docs/projects/ACTIVE.md`
- Adicione uma nova row na tabela com o proximo numero sequencial
- Status emoji: 🔄 para "Em andamento", ⏸️ para "Pausado"
- Formate igual as rows existentes

## Passo 5: Confirmar
Mostre ao usuario:
- Estrutura criada (tree view)
- Path do INDEX.md
- Row adicionada no ACTIVE.md
- Pergunte: "Quer comecar a trabalhar neste projeto agora?"
