---
project: App PPT Ensinio Talks
status: 🟡 Em Execução
data_inicio: 2026-04-10
proprietario: Luiz Fosc
modo: CENTRALIZED
ferramenta_principal: Google AI Studio
objetivo: App interativo de slides para talk "Fosc IA" no Ensinio
---

# 🎤 App PPT Ensinio Talks — Project Index

Projeto para construir o app interativo de apresentação da talk **"Fosc Inteligência Artificial"** no Ensinio, gerado via Google AI Studio e exportado para rodar local durante a apresentação.

---

## 🎯 Objetivo

Transformar o roteiro finalizado (que vive em Obsidian) num **web app interativo de slides**, navegável por teclas, com componentes reutilizáveis, visuais consistentes e 12 diagramas gerados por IA.

**Roteiro fonte:** `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Mente do Fosc/+/Ensinio Talks - Fosc IA 2.md`

---

## 📊 Status das Fases

| # | Fase | Status | Descrição | Tempo |
|---|------|--------|-----------|-------|
| 1 | **Scaffold + Tokens** | ⬜ Pendente | Estrutura vazia + sistema de design tokens centralizado | ~30 min |
| 1b | **Auditoria de Tokens** | ⬜ Pendente | Caçar hardcodes que escaparam, garantir consistência | ~5 min ⚠️ |
| 2 | **Conteúdo** | ⬜ Pendente | 8 Atos preenchidos consumindo os tokens da Fase 1 | ~1h |
| 3 | **Diagramas** | ⬜ Pendente | 12 diagramas gerados e plugados | ~1-2h |
| 4 | **Deploy & Teste** | ⬜ Pendente | Export local, teste em projetor, PDF backup | ~30 min |

**Tempo total estimado:** ~3h até estar pronto pra subir no palco.

⚠️ **A Fase 1b é nova e crítica.** Sem ela, o AI Studio inventa um design system diferente em cada slide na Fase 2 — o anti-padrão exato que o Slide 3.5 da talk condena.

---

## 📁 Estrutura do Projeto

```
1 - App ppt Ensinio Talks/
├── INDEX.md                          ← você está aqui
├── GUIA-PASSO-A-PASSO.md             ← comece por este arquivo ⭐
├── REFERENCIA-ROTEIRO.md             ← ponteiro pro roteiro em Obsidian
│
├── checklists/                       ← acompanhe o progresso aqui
│   ├── 00-master.md                  ← visão geral de todas as fases
│   ├── 01-fase-1-scaffold.md
│   ├── 02-fase-2-conteudo.md
│   ├── 03-fase-3-diagramas.md
│   └── 04-fase-4-deploy.md
│
├── prompts/                          ← prompts prontos pra colar no AI Studio
│   ├── README.md
│   ├── fase-1-scaffold.md
│   ├── fase-1b-audit-tokens.md       ⚠️ NOVO — auditoria crítica
│   ├── fase-2-ato-1-abertura.md
│   ├── fase-2-ato-2-mao-na-massa.md
│   ├── fase-2-ato-3-framework.md
│   ├── fase-2-ato-4-hierarquia.md
│   ├── fase-2-ato-5-processos.md
│   ├── fase-2-ato-6-qualidade.md
│   ├── fase-2-ato-7-forge.md
│   └── fase-2-ato-8-encerramento.md
│
├── diagramas/                        ← info sobre os 12 diagramas + prompts
│   └── README.md
│
└── imagens/                          ← imagens geradas salvas aqui
    └── (PNGs dos diagramas)
```

---

## 🔗 Navegação Rápida

- ⭐ **[GUIA PASSO A PASSO](./GUIA-PASSO-A-PASSO.md)** — documento principal, comece aqui
- 📜 [Referência do Roteiro](./REFERENCIA-ROTEIRO.md)
- ✅ [Checklist Master](./checklists/00-master.md)
- 📋 [Pasta de Prompts](./prompts/README.md)
- 🎨 [Info dos 12 Diagramas](./diagramas/README.md)
- 🖼️ [Pasta de Imagens](./imagens/)

---

## ⚡ Próximo Passo

Abra o **[Guia Passo a Passo](./GUIA-PASSO-A-PASSO.md)** e comece pela Fase 1.

---

## 📝 Histórico

- **2026-04-10** — Projeto criado. Estrutura inicial montada com checklists, prompts e guia passo a passo.
