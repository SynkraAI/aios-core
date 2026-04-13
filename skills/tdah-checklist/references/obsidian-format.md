# Obsidian File Format — Spec

> Formato canônico do arquivo `✅📍 Radar de projetos.md`. Toda escrita deve seguir esta spec.

---

## Caminho do Arquivo

```
/Users/luizfosc/Library/Mobile Documents/iCloud~md~obsidian/Documents/Mente do Fosc/+/✅📍 Radar de projetos.md
```

---

## Estrutura Completa

```markdown
---
tags:
  - Checklist
  - TDAH
  - radar
data_criacao: YYYY-MM-DD HH:MM
última_atualização: YYYY-MM-DDTHH:MM:SS
total_projetos: N
total_concluídos: N
---

# 🧠 Análise Global (IA)

> _Gerada em YYYY-MM-DD HH:MM_
>
> [Parágrafo de contexto]
>
> **🎯 Foco do dia:** [projeto + justificativa]
> **🧹 Liberar carga mental:** [ação rápida]
> **⏸️ Estacionar:** [projetos para ignorar agora]

---

# Índice

🔴 Urgente
- [[✅📍 Radar de projetos#nome-projeto|nome-projeto]]

🟡 Atenção
- [[✅📍 Radar de projetos#nome-projeto|nome-projeto]]

🟢 Tranquilo
- [[✅📍 Radar de projetos#nome-projeto|nome-projeto]]

✅ Concluídos
- [[✅📍 Radar de projetos#nome-projeto|nome-projeto]]

---

# 🔴 Urgente

## nome-do-projeto
- **Urgência:** 🔴
- **Status:** [status descritivo]
- **Caminho:** `~/path/to/project`
- **Último commit:** `hash mensagem (tempo relativo)`
- **Branch:** `branch-name`
- [x] Item concluído
- [ ] Item pendente
- **📋 Análise:** [1-2 frases da IA]
- **💡 Delegação:** [sugestão ou —]

---

# 🟡 Atenção

(mesma estrutura de projetos)

---

# 🟢 Tranquilo

(mesma estrutura de projetos)

---

# ✅ Concluídos

## nome-do-projeto
- **Concluído em:** YYYY-MM-DD
- **Entrega:** [resumo de 1 linha]
- [x] Item 1
- [x] Item 2
```

---

## Regras de Formato

### Hierarquia de Headings

| Nível | Uso |
|-------|-----|
| H1 (`#`) | Seções fixas: Análise Global, Índice, 🔴 Urgente, 🟡 Atenção, 🟢 Tranquilo, ✅ Concluídos |
| H2 (`##`) | Nome de cada projeto (dentro da seção de urgência) |
| H3+ | NUNCA usar — mantém a estrutura plana e legível |

### Campos Obrigatórios por Projeto Ativo

| Campo | Sempre presente? | Atualizado pelo scanner? |
|-------|-------------------|--------------------------|
| `Urgência:` | Sim | Não (posição na seção H1 define) |
| `Status:` | Sim | Sim |
| `Caminho:` | Não (avulsos não têm) | Não |
| `Último commit:` | Não (só se tem git) | Sim |
| `Branch:` | Não (só se tem git) | Sim |
| Checkboxes | Sim (mínimo 1) | Merge aditivo |
| `📋 Análise:` | Sim | Sim (regenerada) |
| `💡 Delegação:` | Sim | Sim (regenerada) |

### Campos para Projeto Concluído

| Campo | Sempre presente? |
|-------|-------------------|
| `Concluído em:` | Sim |
| `Entrega:` | Sim |
| Checkboxes (todos `[x]`) | Sim |

### Projeto Avulso (sem código)

Quando o projeto não tem caminho de código:

```markdown
## nome-da-ideia
- **Urgência:** 🟢
- **Status:** 💡 Só ideia
- **Caminho:** —
- [ ] Próximo passo 1
- [ ] Próximo passo 2
- **📋 Análise:** —
- **💡 Delegação:** —
```

### Wikilinks no Índice

Formato do wikilink: `[[✅📍 Radar de projetos#nome-do-h2|texto-display]]`

- O `#nome-do-h2` deve corresponder EXATAMENTE ao H2 do projeto
- O `texto-display` é o nome legível
- Manter sincronizado: se um H2 muda de nome, atualizar o wikilink

### Separadores

Usar `---` (horizontal rule) entre:
- Análise Global e Índice
- Índice e primeira seção de urgência
- Entre cada seção de urgência

NÃO usar `---` entre projetos dentro da mesma seção.

---

## Template Base (para criação inicial)

Quando o arquivo não existe, criar com este template:

```markdown
---
tags:
  - Checklist
  - TDAH
  - radar
data_criacao: YYYY-MM-DD HH:MM
última_atualização: YYYY-MM-DDTHH:MM:SS
total_projetos: 0
total_concluídos: 0
---

# 🧠 Análise Global (IA)

> _Nenhum projeto no radar ainda. Use `/tdah-checklist` num projeto ou `/tdah-checklist add "nome"` pra começar._

---

# Índice

🔴 Urgente

🟡 Atenção

🟢 Tranquilo

✅ Concluídos

---

# 🔴 Urgente

---

# 🟡 Atenção

---

# 🟢 Tranquilo

---

# ✅ Concluídos
```
