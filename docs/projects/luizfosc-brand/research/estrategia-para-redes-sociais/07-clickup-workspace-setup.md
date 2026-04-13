# Estrutura ClickUp — Conteúdo Digital Luiz Fosc

**Data:** 2026-04-08
**Objetivo:** Definir toda a estrutura do ClickUp para gerenciar o pipeline de conteúdo multi-plataforma
**Fluxo:** CLI-driven (Opção C) — aprovar no ClickUp, processar no Claude Code

---

## 1. Visão Geral

```
Space: Luiz Fosc — Conteúdo Digital
│
├── 📁 Folder: Instagram
│   ├── 📋 List: Backlog de Ideias
│   └── 📋 List: Pipeline de Produção
│
├── 📁 Folder: LinkedIn
│   ├── 📋 List: Backlog de Ideias
│   └── 📋 List: Pipeline de Produção
│
├── 📁 Folder: YouTube
│   ├── 📋 List: Backlog de Ideias
│   └── 📋 List: Pipeline de Produção
│
└── 📁 Folder: Gestão Editorial
    ├── 📋 List: Calendário Editorial (visão mensal cross-platform)
    ├── 📋 List: Banco de Ideias (ideias soltas, sem plataforma definida)
    └── 📋 List: Acervo (podcasts, rádio, palestras para processar)
```

---

## 2. Listas e seus Propósitos

### 2.1 Backlog de Ideias (uma por plataforma)
**Para quê:** Armazenar ideias brutas de conteúdo específicas para aquela plataforma.
**Quem alimenta:** Fosc (inspirações do dia a dia), Claude Code (sugestões do calendário editorial).
**Statuses:**

| Status | Emoji | Significado |
|---|---|---|
| Ideia | 💡 | Ideia bruta, sem validação |
| Aprovada | ✅ | Fosc aprovou — pronta para ir à produção |
| Descartada | 🗑️ | Não vai ser usada (manter para histórico) |

### 2.2 Pipeline de Produção (uma por plataforma)
**Para quê:** Gerenciar o ciclo completo de uma peça de conteúdo, da escrita à publicação.
**Quem alimenta:** Tasks vêm do Backlog (quando aprovadas) ou direto do Calendário Editorial.
**Statuses:**

| Status | Emoji | Significado | Quem age |
|---|---|---|---|
| Rascunho | ✍️ | Conteúdo sendo criado (copy, roteiro) | Claude Code (via skills do Fosc) |
| Revisão | 👀 | Rascunho pronto, aguardando olho do Fosc | Fosc |
| Ajuste | 🔄 | Fosc pediu mudanças | Claude Code |
| Copy Aprovada | ✅ | Texto/roteiro aprovado pelo Fosc | Fosc |
| Design | 🎨 | Gerando arte, thumbnail, carrossel, vídeo | Claude Code (image-creator, etc.) |
| Arte em Revisão | 🖼️ | Arte pronta, Fosc precisa aprovar visual | Fosc |
| Pronto | 📦 | Tudo aprovado, pronto para agendar/publicar | — |
| Agendado | 📅 | Agendado para publicação (data definida) | Fosc |
| Publicado | 🚀 | No ar | Fosc / instagram-publisher |
| Analisado | 📊 | Métricas coletadas (7 dias após publicação) | Fosc |

### 2.3 Calendário Editorial
**Para quê:** Visão mensal de todas as plataformas juntas. Cada task representa um slot no calendário.
**Visualização:** Board view agrupado por semana OU Calendar view por data de publicação.

### 2.4 Banco de Ideias (cross-platform)
**Para quê:** Ideias que ainda não têm plataforma definida. Inspirações soltas.
**Fluxo:** Quando a ideia amadurece, mover para o Backlog da plataforma certa.

### 2.5 Acervo
**Para quê:** Inventário de gravações existentes (podcasts, rádio, palestras) para processar.
**Statuses:**

| Status | Significado |
|---|---|
| Não processado | Arquivo bruto, sem transcrição |
| Transcrito | Transcrição feita, aguardando extração |
| Extraído | Cortes e peças identificados |
| Distribuído | Peças já foram para os Backlogs das plataformas |

---

## 3. Custom Fields (aplicados a todas as listas de Pipeline)

| Campo | Tipo | Opções | Obrigatório |
|---|---|---|---|
| **Pilar** | Dropdown | Estrutura, Bastidores, Mentalidade, Provocações, Referências | Sim |
| **Formato** | Dropdown | Carrossel, Reel, Post Texto, Artigo, Vídeo Longo, Short, Story, Thread | Sim |
| **Persona** | Dropdown | Corporativo, Profissional, Realizador, Geral | Sim |
| **Hook** | Texto curto | (texto livre) | Sim |
| **CTA** | Texto curto | (texto livre) | Não |
| **Origem** | Dropdown | Novo, Acervo-Podcast, Acervo-Rádio, Acervo-Palestra, Repurpose | Sim |
| **Data de Publicação** | Data | — | Quando agendado |
| **Arquivo Local** | URL/Texto | Caminho na pasta do projeto | Quando rascunho criado |
| **Link Publicado** | URL | URL do post publicado | Quando publicado |
| **Métricas - Alcance** | Número | — | Quando analisado |
| **Métricas - Engajamento** | Número | — | Quando analisado |
| **Métricas - Salvamentos** | Número | — | Quando analisado |

---

## 4. Tags

| Tag | Cor | Uso |
|---|---|---|
| `urgente` | 🔴 Vermelho | Conteúdo com deadline apertado |
| `evergreen` | 🟢 Verde | Conteúdo atemporal, pode publicar qualquer dia |
| `trend` | 🟡 Amarelo | Conteúdo ligado a trend/momento, tem prazo de validade |
| `serie` | 🔵 Azul | Parte de uma série (ex: "7 dias de bastidores") |
| `collab` | 🟣 Roxo | Envolve outra pessoa (entrevista, menção, parceria) |
| `acervo` | ⚪ Cinza | Derivado de gravação existente |

---

## 5. Automações do ClickUp

### 5.1 Automações dentro do Backlog

| Gatilho | Ação |
|---|---|
| Status muda para "Aprovada" | Criar task espelho no Pipeline de Produção da mesma plataforma com status "Rascunho" |

### 5.2 Automações dentro do Pipeline

| Gatilho | Ação |
|---|---|
| Status muda para "Copy Aprovada" | Mudar status automaticamente para "Design" |
| Status muda para "Pronto" | Adicionar comentário: "✅ Pronto para agendar. Defina a data de publicação." |
| Status muda para "Publicado" | Adicionar data de conclusão da task |
| Status muda para "Publicado" + 7 dias | Lembrete: "📊 Hora de coletar métricas desta peça" |

### 5.3 Automações cross-platform

| Gatilho | Ação |
|---|---|
| Task criada no Pipeline com campo "Data de Publicação" | Criar/atualizar entrada no Calendário Editorial |

---

## 6. Views Recomendadas

### Por Lista de Pipeline:
- **Board View** (padrão) — Kanban por status. Arrastar cards entre colunas.
- **Calendar View** — Ver por data de publicação. Útil para visualizar distribuição na semana.
- **Table View** — Ver todos os campos de uma vez. Útil para batch review.

### No Calendário Editorial:
- **Calendar View** (padrão) — Visão mensal com todas as plataformas.
- **Board View agrupado por Plataforma** — Ver o que vai em cada canal na semana.

### Filtros úteis salvos:
- "Para Revisar" — Status = Revisão OU Arte em Revisão
- "Próximos 7 dias" — Data de Publicação = próxima semana
- "Por Pilar" — Agrupado por pilar, para ver equilíbrio
- "Acervo não processado" — Lista Acervo, Status = Não processado

---

## 7. Fluxo Completo (CLI-driven — Opção C)

```
┌─────────────────────────────────────────────────────────┐
│                    CLICKUP                               │
│                                                          │
│  1. Fosc adiciona ideia no Backlog                       │
│  2. Fosc muda status para "Aprovada"                     │
│  3. Automação cria task no Pipeline (status: Rascunho)   │
│                                                          │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  CLAUDE CODE (CLI)                        │
│                                                          │
│  4. Fosc: "processa tasks aprovadas"                     │
│  5. Claude puxa tasks com status "Rascunho" do ClickUp   │
│  6. Fosc direciona qual skill/prompt usar                │
│  7. Claude gera conteúdo (copy, roteiro, etc.)           │
│  8. Salva arquivo local em conteudos/{plataforma}/       │
│  9. Atualiza task no ClickUp → status "Revisão"          │
│     + preenche campo "Arquivo Local"                     │
│                                                          │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                    CLICKUP                               │
│                                                          │
│  10. Fosc revisa o conteúdo                              │
│  11. Se OK → muda status para "Copy Aprovada"            │
│      Se ajuste → muda para "Ajuste" + comentário         │
│  12. Automação: "Copy Aprovada" → status "Design"        │
│                                                          │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  CLAUDE CODE (CLI)                        │
│                                                          │
│  13. Fosc: "gera artes das tasks em Design"              │
│  14. Claude gera carrossel/thumb/vídeo                   │
│  15. Salva em assets/{plataforma}/                       │
│  16. Atualiza task → status "Arte em Revisão"            │
│                                                          │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                    CLICKUP                               │
│                                                          │
│  17. Fosc aprova arte → status "Pronto"                  │
│  18. Define data de publicação → status "Agendado"       │
│  19. Publica → status "Publicado"                        │
│  20. 7 dias depois → coleta métricas → "Analisado"      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 8. Nomenclatura de Tasks

### Padrão:
```
[PLATAFORMA] Formato — Tema resumido
```

### Exemplos:
```
[IG] Carrossel — Por que ensaio 1.000 vezes o que parece espontâneo
[IG] Reel — O que acontece 5 min antes do palco
[LI] Post — O Guinness não é sobre talento
[LI] Artigo — Como construí um formato de palestra que ninguém copia
[YT] Vídeo — A estrutura por trás do recorde mundial
[YT] Short — "Não é dom, é estrutura" em 60 segundos
```

---

## 9. Checklist para Criação no ClickUp

### Passo a passo (quando API Token estiver pronto):

- [ ] Criar Space "Luiz Fosc — Conteúdo Digital"
- [ ] Criar Folder "Instagram" com 2 Lists (Backlog + Pipeline)
- [ ] Criar Folder "LinkedIn" com 2 Lists (Backlog + Pipeline)
- [ ] Criar Folder "YouTube" com 2 Lists (Backlog + Pipeline)
- [ ] Criar Folder "Gestão Editorial" com 3 Lists (Calendário + Banco de Ideias + Acervo)
- [ ] Configurar Statuses em cada List (conforme seção 2)
- [ ] Criar Custom Fields (conforme seção 3)
- [ ] Criar Tags (conforme seção 4)
- [ ] Configurar Automações (conforme seção 5)
- [ ] Criar Views salvas (conforme seção 6)
- [ ] Testar fluxo completo com 1 task de exemplo

---

*Documento gerado em 2026-04-08 — Projeto LUIZFOSC*
*Aguardando aprovação do Fosc antes de criar no ClickUp*
