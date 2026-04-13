# Scanner Module

> Instruções para varredura de estado de projetos. Coleta sinais de git, arquivos e metadata para atualizar o checklist.

---

## 1. Quando Escanear

- **Projeto com `Caminho` definido e path existe:** scan completo (git + arquivos)
- **Projeto com `Caminho` mas path não existe:** marcar `⚠️ Caminho não encontrado`, pular scan
- **Projeto sem `Caminho` (avulso):** pular scan — manter checkboxes manuais intactos

---

## 2. Sinais a Coletar

Para cada projeto com caminho válido, rodar em paralelo (múltiplos `Bash` calls no mesmo turno):

### Git Signals

```bash
# Último commit (hash + mensagem + tempo relativo)
git -C <path> log -1 --format="%h %s (%cr)" 2>/dev/null || echo "sem git"

# Branch atual
git -C <path> branch --show-current 2>/dev/null || echo "sem branch"

# Mudanças pendentes (uncommitted)
git -C <path> status --porcelain 2>/dev/null | wc -l | tr -d ' '

# Commits nos últimos 7 dias
git -C <path> log --since="7 days ago" --oneline 2>/dev/null | wc -l | tr -d ' '
```

### File Signals

```bash
# Verificar existência de governance files
ls <path>/.aiox/INDEX.md 2>/dev/null && echo "HYBRID" || echo "no-aios"
ls <path>/INDEX.md 2>/dev/null && echo "HAS_INDEX" || echo "no-index"
```

Além dos Bash, usar tools nativos:

```
# INDEX.md (HYBRID ou CENTRALIZED)
Read(<path>/.aiox/INDEX.md) OR Read(AIOS_ROOT/docs/projects/<name>/INDEX.md)

# Stories ativas
Glob(<stories_path>/active/*.md) → para cada: contar [x] vs [ ]

# Sessão mais recente
Glob(<sessions_path>/*.md) → pegar data do arquivo mais recente
```

---

## 3. Resolução de Caminhos Internos

Dependendo do tipo de projeto, os arquivos de governance ficam em locais diferentes:

| Tipo | INDEX.md | Stories | Sessions |
|------|----------|---------|----------|
| HYBRID (`~/CODE/...`) | `<path>/.aiox/INDEX.md` | `<path>/.aiox/stories/active/` | `<path>/.aiox/sessions/` |
| CENTRALIZED (aios-core) | `AIOS_ROOT/docs/projects/<nome>/INDEX.md` | `AIOS_ROOT/docs/stories/active/` | `AIOS_ROOT/docs/projects/<nome>/sessions/` |
| Skill | Não tem INDEX | Não tem stories | Não tem sessions |
| Squad | Não tem INDEX | Não tem stories | Não tem sessions |
| Tool | Não tem INDEX | Não tem stories | Não tem sessions |
| Genérico | Verificar se tem `.aiox/` | — | — |

Para Skills, Squads e Tools: o scan é mais simples — apenas git signals + verificar arquivos-chave (SKILL.md, README.md, package.json).

---

## 4. Extração de Status do INDEX.md

Se INDEX.md existe, extrair o campo "Status" da tabela de metadata:

```
Grep("Status", <index_path>) → extrair valor da coluna
```

Este valor substitui o campo `Status` no checklist Obsidian (dado mais fresco).

---

## 5. Contagem de Progresso

Para calcular a barra de progresso:

```
total_checks = count([ ]) + count([x])  # no bloco H2 do projeto
done_checks = count([x])
progress_pct = (done_checks / total_checks) * 100
progress_bar = "█" * (done_checks / total_checks * 10) + "░" * remaining
```

Exibir como: `Progresso: ███████░░░ 7/10 (70%)`

---

## 6. Detecção de Conclusão Automática

Se TODOS os checkboxes estão `[x]` E o scan confirma (sem pendências, sem branches abertos):

**NÃO marcar como concluído automaticamente.**

Em vez disso, adicionar nota no terminal:

```
💡 Todos os itens de <projeto> estão marcados como feitos.
   Quer marcar como concluído? Use: /tdah-checklist done <projeto>
```

---

## 7. Output do Scanner

O scanner retorna um objeto estruturado por projeto:

```yaml
project:
  name: "whatsapp-prospector"
  path: "~/CODE/Projects/whatsapp-prospector"
  type: "HYBRID"
  git:
    last_commit: "d4e5f6g feat: big ideas leandro (3 dias atrás)"
    branch: "main"
    uncommitted_changes: 0
    commits_7d: 5
  governance:
    index_status: "🔄 EM PRODUÇÃO — Pipeline Phase 5 (4/11)"
    stories_progress: "3/7 (43%)"
    last_session: "2026-03-18"
  progress:
    done: 3
    total: 7
    pct: 43
    bar: "███████░░░"
```

Este output alimenta o analyzer e a escrita no Obsidian.
