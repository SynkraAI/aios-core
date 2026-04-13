# 🎨 Diagramas — Referência Completa

Os 12 diagramas da talk. Cada um tem um prompt de geração pronto no **roteiro-fonte** (`Ensinio Talks - Fosc IA 2.md`).

---

## 📋 Lista dos 12 Diagramas

| # | Slide | Título | Tipo | Prioridade | Arquivo de saída |
|---|-------|--------|------|------------|------------------|
| 1 | 1.4 | De Executor para Orquestrador | Comparação lado a lado | 🟡 Média | `../imagens/01-executor-orquestrador.png` |
| 2 | 2.3 | Vibe Coding vs SDD | Split-screen | 🟡 Média | `../imagens/02-vibe-coding-vs-sdd.png` |
| 3 | 3.3 | Janela de Contexto como Mesa | Isométrico | 🟡 Média | `../imagens/03-janela-contexto.png` |
| 4 | 3.4 | Mesma IA, Pessoas Diferentes (ENTP × ISTJ) | Comparação dual | 🟡 Média | `../imagens/04-entp-vs-istj.png` |
| 5 | 3.5 | Fonte de Verdade Única | Diagrama de rede | 🟡 Média | `../imagens/05-fonte-de-verdade.png` |
| 6 | 4.1 | Pirâmide Squads > Agentes > Skills > Tools | Pirâmide 4 camadas | 🔴 Alta | `../imagens/06-piramide-hierarquia.png` |
| 7 | 4.3 | Anatomia de um MIND Clone | Anatômico | 🟡 Média | `../imagens/07-anatomia-mind.png` |
| 8 | 4.4 | ⭐ Advisor Board: Mesa Redonda Particular | Ilustração cinematográfica | 🔴 **Crítica** | `../imagens/08-advisor-board.png` |
| 9 | 5.2 | ⭐ Fluxo Ideia → Produto (SDD) | Flowchart horizontal | 🔴 **Crítica** | `../imagens/09-fluxo-ideia-produto.png` |
| 10 | 6.5 | Loop do Ping-Pong (Claude × Codex) | Diagrama circular | 🟡 Média | `../imagens/10-loop-ping-pong.png` |
| 11 | 7.1 | Timeline: Nascimento do Forge | Linha do tempo | 🔴 Alta | `../imagens/11-timeline-forge.png` |
| 12 | 7.2 | A Receita do Forge: 8 + 3 + 10 | Metáfora visual | 🔴 Alta | `../imagens/12-receita-forge-8-3-10.png` |

---

## 🎯 Ordem Recomendada de Geração

**Por quê?** O #9 e o #8 definem o estilo visual. Se esses ficarem bons, os outros herdam o mesmo look. Comece por eles.

### Tier 1 — Críticos (os 2 wow moments)
1. ⭐ **#9 — Fluxo Ideia → Produto** — principal diagrama da talk
2. ⭐ **#8 — Advisor Board** — segundo wow moment visual

### Tier 2 — Âncoras conceituais
3. **#6 — Pirâmide Hierarquia**
4. **#11 — Timeline Forge**
5. **#12 — Receita Forge 8+3+10**

### Tier 3 — Comparativos (batch rápido)
6. **#1 — Executor → Orquestrador**
7. **#2 — Vibe Coding vs SDD**
8. **#3 — Janela de Contexto**
9. **#4 — ENTP × ISTJ**
10. **#5 — Fonte de Verdade**

### Tier 4 — Secundários
11. **#7 — Anatomia MIND**
12. **#10 — Loop Ping-Pong**

---

## 🎨 Style Anchor (IMPORTANTE)

Cole essa frase **no início de cada prompt** que você enviar pro gerador de imagem. Isso força consistência visual entre os 12 diagramas.

```
STYLE ANCHOR: Editorial infographic on dark background #0a0a0a,
amber #f59e0b accents, thin white lines, Inter/Montserrat
sans-serif typography, negative space, high contrast, minimalist,
no clutter, 16:9 aspect ratio. IMPORTANT: ALL TEXT IN THE IMAGE
MUST BE IN BRAZILIAN PORTUGUESE (pt-BR) with correct accents
(acentuação), cedillas and tildes. Do NOT translate text to
English. Proper names of products, frameworks and people stay
as-is.
```

---

## 📝 Como Gerar Cada Diagrama

1. **Abra o roteiro-fonte** em Obsidian ou VS Code
2. **Localize o slide** correspondente (ex: Slide 5.2 para o #9)
3. **Copie o bloco** marcado `🎨 **[IMAGEM-DIAGRAMA] — "..."**`
4. **Cole o style anchor** acima no início
5. **Cole o prompt de geração** que vem logo abaixo no roteiro
6. **Envie pro gerador** de imagem escolhido:
   - Nano Banana (recomendado pt-BR)
   - Midjourney
   - DALL-E 3
   - AI Studio (Imagen)
7. **Valide acentuação** — se quebrou (ex: "não" virou "nao"), regenere
8. **Salve com o nome correto** na pasta `../imagens/`

---

## ⚠️ Validação Pós-Geração

Depois de gerar cada imagem, confira:

- [ ] Texto aparece corretamente (sem erros de OCR)
- [ ] Acentuação pt-BR preservada (á é í ó ú ç ã õ)
- [ ] Estilo bate com os outros diagramas (dark + amber)
- [ ] Proporção 16:9
- [ ] Legibilidade em projetor (tamanho de texto suficiente)

Se algo ficou errado, regenere com a instrução:

```
Text must include Brazilian Portuguese accents: á é í ó ú â ê ô ã õ ç.
```

---

## 🖼️ Destino das Imagens

Todas as PNGs vão pra `../imagens/` com os nomes exatos da tabela no topo. Depois, na Fase 4 do projeto, elas são copiadas pra `public/diagramas/` do app React.

---

## 🔗 Links

- [GUIA PASSO A PASSO](../GUIA-PASSO-A-PASSO.md)
- [Checklist Fase 3](../checklists/03-fase-3-diagramas.md)
- [Pasta Imagens](../imagens/)
