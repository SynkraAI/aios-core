# 📜 Referência do Roteiro

O roteiro-fonte desta talk vive no Obsidian, na pasta "Mente do Fosc".

## 📍 Caminho Absoluto

```
/Users/luizfosc/Library/Mobile Documents/iCloud~md~obsidian/Documents/Mente do Fosc/+/Ensinio Talks - Fosc IA 2.md
```

## 📍 Caminho Relativo (home)

```
~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Mente do Fosc/+/Ensinio Talks - Fosc IA 2.md
```

## ⚠️ Fonte Única de Verdade

**Esse arquivo é o source of truth do conteúdo.** Qualquer mudança no roteiro deve ser feita lá — NÃO duplique conteúdo neste projeto. Os prompts da Fase 2 referenciam seções do roteiro, mas não copiam conteúdo pra não ficar fora de sincronia.

## 🗂️ Estrutura do Roteiro (8 Atos)

| # | Ato | Escopo |
|---|-----|--------|
| 1 | **Abertura & Hook** | Disclaimer Matrix → IA é presente → esteira → orquestrador |
| 2 | **Mão na Massa** | Demo To-Do + Eisenhower no AI Studio → Vibe Coding vs SDD |
| 3 | **O que é Framework** | Setup → arrumar casa → janela de contexto → personalização ENTP/ISTJ |
| 4 | **Hierarquia** | Squads > Agentes > Skills > Tools → MINDS → Advisor Board |
| 5 | **Processos** | PRD (80/20) → SPEC → Epics/Stories → Build |
| 6 | **Qualidade** | /catalog → /critica → Plan Mode → Pascal → Ping-Pong |
| 7 | **FORGE** | Timeline → Receita 8+3+10 → vídeo dominó → finale |
| 8 | **Encerramento** | Call back Matrix → CTA → recursos |

## 🎨 Diagramas Referenciados (12 total)

Listados em detalhes em [`diagramas/README.md`](./diagramas/README.md).

## 📦 Como Usar nos Prompts

Nos prompts da Fase 2 (`prompts/fase-2-ato-*.md`), há um bloco marcado:

```
===== COLE AQUI O CONTEÚDO DO ATO X =====
[...]
===== FIM DO CONTEÚDO =====
```

O fluxo é:
1. Abra o roteiro no Obsidian (ou VS Code).
2. Localize a seção `## 🎬 ATO X — [nome]`.
3. Copie toda a seção **até antes do próximo ATO**.
4. Cole dentro do bloco marcado no prompt da fase.
5. Copie o prompt inteiro e cole no AI Studio.

Assim você garante que o que está indo pro AI Studio é sempre a versão atual do roteiro.
