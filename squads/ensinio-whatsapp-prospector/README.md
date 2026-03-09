# Ensinio WhatsApp Prospector

Squad especializado em prospectar leads qualificados a partir de exports de grupos de WhatsApp, cruzando com as 67 solucoes da Ensinio (5 pilares), ICPs, red flags e gerando mensagens personalizadas de outreach para Google Sheets.

**Version:** 3.0.0 | **Entry Agent:** Atlas (prospector-chief) | **Model Tier:** haiku/sonnet/opus

---

## What's New in v3.0.0

### 1. Phone Resolution (Phase 2b) — Interactive
WhatsApp exports mostram nomes de contatos salvos, nao numeros. Nova fase interativa:
- Apresenta contatos sem numero e pergunta ao usuario
- Valida formato E.164 automaticamente (`+55XXXXXXXXXXX`)
- Auto-normaliza inputs comuns (`31 99988-7766` → `+5531999887766`)
- **Phone-books PER GROUP** — "Joao" no Grupo A != "Joao" no Grupo B
- Reutiliza phone-book se o grupo ja foi processado antes

### 2. ICP + Red Flags Intelligence (ensinio-mind v1.1)
- **Red flag pre-screen:** 4 BLOQUEADORES que eliminam antes de analisar (produto fisico, so ebook, afiliado, "gerenciem tudo")
- **ICP match scoring:** Bonus por match demografico e comportamental
- **Nichos top 5:** Business, Education, Health, Finance, Tech
- **Argumentos por score:** Cada faixa de temperatura recebe o argumento ideal

### 3. Multi-Grupo Batch
- Processar multiplos ZIPs de uma vez
- Cada grupo com pipeline independente
- Consolidar numa unica planilha (3 modos: single_tab, new_tab_per_group, append)
- KB carregado uma vez e reutilizado

### 4. Scoring v2.1
- Bonus ICP (faturamento, audiencia, plataformas concorrentes)
- Penalidades red flags (-1 a -2)
- Argumento recomendado por score range
- Data sources: `ensinio-mind/data/` (ICPs, red flags, arguments, sales playbook)

---

## Pipeline (v3.0)

```
                                    ┌─────────────────┐
                                    │  Load KB (P2)   │
                                    │  Atlas/sonnet   │
                                    └────────┬────────┘
                                             │ parallel
┌──────────┐    ┌──────────┐    ┌────────────┴────────────┐
│ Parse(P1)│───>│Valid.(P1b│───>│  Resolve Phones (P2b)   │
│  Cipher  │    │) Cipher  │    │  Atlas/interactive      │
│  haiku   │    │  haiku   │    └────────────┬────────────┘
└──────────┘    └──────────┘                 │
                              ┌──────────────┴──────────────┐
                              │    Analyze & Score (P3)      │
                              │    Minerva/sonnet            │
                              │    + ICP match + Red flags   │
                              └──────────────┬───────────────┘
                                             │
┌──────────────┐    ┌───────────┐    ┌───────┴──────┐    ┌──────────────┐
│ Sheets (P5)  │<───│Valid.Batch│<───│Write Outreach│<───│Valid.Score   │
│ Atlas/sonnet │    │(P4b)Atlas │    │(P4)Velvet/   │    │(P3b) Atlas   │
└──────────────┘    └───────────┘    │    opus      │    └──────────────┘
                                     └──────────────┘
```

**9 fases** | **6 quality gates** | **Retry policy** com exponential backoff

---

## Agentes

| Agente | Persona | Modelo | Papel | Tier |
|--------|---------|--------|-------|------|
| **prospector-chief** | Atlas | sonnet | Pipeline Orchestrator & Lead Qualification Chief | Orchestration |
| **chat-parser** | Cipher | haiku | WhatsApp Export Parser & Data Validator | Processing |
| **prospect-analyst** | Minerva | sonnet | Solution Fit Analyst & Lead Scorer (+ ICP/Red Flag) | Analysis |
| **outreach-writer** | Velvet | opus | Personalized Outreach Copywriter | Outreach |

---

## Quick Start

### Pipeline Completo (1 grupo)
```
/ensinio-whatsapp-prospector:workflows:full-pipeline
```
Inputs: `{zip_path}` (path do ZIP exportado) + `{group_name}` (nome do grupo)

### Pipeline Batch (multiplos grupos)
```
/ensinio-whatsapp-prospector:workflows:batch-pipeline
```
Inputs: Array de `{zip_path, group_name}` + `{sheet_mode}` (single_tab | new_tab_per_group | append)

### Tasks Individuais
```
/ensinio-whatsapp-prospector:tasks:parse-chat-export        # P1: Parsear ZIP WhatsApp
/ensinio-whatsapp-prospector:tasks:validate-parsed-data     # P1b: Validar dados parseados
/ensinio-whatsapp-prospector:tasks:load-ensinio-kb          # P2: Carregar KB Ensinio (5 pilares)
/ensinio-whatsapp-prospector:tasks:resolve-phone-numbers    # P2b: Resolver telefones (interativo)
/ensinio-whatsapp-prospector:tasks:analyze-prospects         # P3: Analisar, ICP match, red flags, scorer
/ensinio-whatsapp-prospector:tasks:write-outreach            # P4: Gerar mensagens personalizadas
/ensinio-whatsapp-prospector:tasks:validate-outreach-batch   # P4b: Validar batch de mensagens
/ensinio-whatsapp-prospector:tasks:populate-sheet            # P5: Popular Google Sheets
/ensinio-whatsapp-prospector:tasks:handle-parse-errors       # Recovery: Tratar erros de parse
```

---

## Phone Number Format (E.164)

```
+[country_code][area_code][number]
```

| Type | Format | Example |
|------|--------|---------|
| BR Mobile | +55[DDD]9[XXXX][XXXX] | +5511999887766 |
| BR Landline | +55[DDD][XXXX][XXXX] | +551133445566 |
| International | +[code][number] | +1234567890 |

Auto-normalization: `31 99988-7766` → `+5531999887766`

Phone-books: `data/phone-books/{group-slug}.json` (per group, never global)

---

## Data Sources

### From this squad (data/)
| Arquivo | Conteudo |
|---------|----------|
| `scoring-criteria.md` | Criterios de scoring v2.1 (com ICP + red flags) |
| `message-rules.md` | Regras de mensagem |
| `phone-books/{slug}.json` | Phone books per group |

### From ensinio-mind (source of truth)
| Arquivo | Conteudo |
|---------|----------|
| `ensinio-solutions-kb.md` | KB completo — 5 pilares, 67+ features |
| `ensinio-icps.md` | ICP detalhado (demografico + comportamental) |
| `ensinio-red-flags.md` | 18 red flags + 4 BLOQUEADORES |
| `ensinio-arguments.md` | 3 argumentos principais + matriz de uso |
| `ensinio-sales-playbook.md` | 5 objecoes + respostas + perguntas |
| `ensinio-sales-cycle.md` | Timeline, funil, aceleradores |

---

## Quality Gates

| ID | Nome | Transicao | Tipo |
|----|------|-----------|------|
| QG-000.5 | Phone Resolution | Parsed -> Contacts with Phones | Interactive |
| QG-001 | Parse Validation | Raw ZIP -> Structured Contacts | Blocking |
| QG-002 | Analysis Complete | Contacts -> Scored Prospects | Blocking |
| QG-002.5 | Scoring Validation | Scored -> Validated Scores | Blocking |
| QG-003 | Message Quality | Draft -> Approved Message | Blocking |
| QG-004 | Sheet Population | Approved -> Google Sheets | Blocking |

---

## Red Flags (BLOQUEADORES)

| Red Flag | Sinal | Score |
|----------|-------|-------|
| Produto fisico | Vender roupas, canecas, produtos tangíveis | 0 (excluir) |
| Apenas ebook | Quer vitrine para PDF simples | 0 (excluir) |
| Afiliado/revenda | Quer revender, nao criar conteudo | 0 (excluir) |
| "Gerenciem tudo" | Quer terceirizacao total | 0 (excluir) |

---

## Output: Google Sheets

**Spreadsheet ID:** `124EQQAkmt9D7-49LbR-Jx64DhxdtCwceUQgqolk5ZFI`

| Coluna | Conteudo |
|--------|----------|
| A | Nome (primeiro nome) |
| B | Telefone (+55XXXXXXXXXXX) |
| C | Grupo do WhatsApp de origem |
| D | Nome/nicho do projeto |
| E | Explicacao detalhada do projeto |
| F | Mensagem do WhatsApp (raw text) |
| G | Link WhatsApp direto (URL-encoded) |

Ordenado por **temperature score** (mais quente primeiro).

---

## Estrutura de Arquivos

```
ensinio-whatsapp-prospector/
├── config.yaml                          # Configuracao do squad v3.0
├── README.md                            # Este arquivo
├── agents/
│   ├── prospector-chief.md              # Atlas - Orquestrador
│   ├── chat-parser.md                   # Cipher - Parser
│   ├── prospect-analyst.md              # Minerva - Analista
│   └── outreach-writer.md               # Velvet - Copywriter
├── tasks/
│   ├── parse-chat-export.md             # P1: Parse ZIP
│   ├── validate-parsed-data.md          # P1b: Validacao parse
│   ├── handle-parse-errors.md           # Recovery: Erros parse
│   ├── load-ensinio-kb.md               # P2: Carregar KB
│   ├── resolve-phone-numbers.md         # P2b: Resolver telefones (NEW v3.0)
│   ├── analyze-prospects.md             # P3: Analisar + ICP + Red Flags (UPDATED v3.0)
│   ├── write-outreach.md                # P4: Escrever mensagens
│   ├── validate-outreach-batch.md       # P4b: Validar batch
│   └── populate-sheet.md               # P5: Popular Sheets
├── workflows/
│   ├── full-pipeline.yaml               # Pipeline completo (9 fases) (UPDATED v3.0)
│   └── batch-pipeline.yaml             # Pipeline batch multi-grupo (NEW v3.0)
├── checklists/
│   ├── parse-validation-checklist.md    # QG-001
│   ├── phone-validation-checklist.md    # QG-000.5 (NEW v3.0)
│   ├── scoring-validation-checklist.md  # QG-002.5
│   └── message-quality-checklist.md     # QG-003
└── data/
    ├── ensinio-solutions-kb.md          # KB v2.0 (symlink to ensinio-mind)
    ├── message-rules.md                 # Regras de mensagem
    ├── scoring-criteria.md              # Criterios de scoring v2.1 (UPDATED v3.0)
    └── phone-books/                     # Phone books per group (NEW v3.0)
        └── {group-slug}.json            # Um arquivo por grupo
```

---

## Settings

| Setting | Valor |
|---------|-------|
| `google_sheets_id` | `124EQQAkmt9D7-49LbR-Jx64DhxdtCwceUQgqolk5ZFI` |
| `ensinio_kb_source` | `ensinio-mind/data/ensinio-solutions-kb.md` |
| `ensinio_mind_sources` | ICPs, red flags, arguments, playbook, cycle |
| `phone_books_dir` | `data/phone-books` |
| `phone_format` | E.164 |
| `default_country_code` | +55 |
| `min_score_threshold` | 3 |
| `max_rework_iterations` | 2 |
| `batch_size` | 50 |
| `language` | pt-BR |

---

*WhatsApp Prospector Ensinio v3.0.0 - AIOS Squad*
