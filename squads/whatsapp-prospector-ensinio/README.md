# WhatsApp Prospector Ensinio

Squad especializado em prospectar leads qualificados a partir de exports de grupos de WhatsApp, cruzando com as 67 solucoes da Ensinio (5 pilares) e gerando mensagens personalizadas de outreach para Google Sheets.

**Version:** 2.0.0 | **Entry Agent:** Atlas (prospector-chief) | **Model Tier:** haiku/sonnet/opus

---

## Pipeline

```
                                    ┌─────────────────┐
                                    │  Load KB (P2)   │
                                    │  Atlas/sonnet   │
                                    └────────┬────────┘
                                             │ parallel
┌──────────┐    ┌──────────┐    ┌────────────┴────────────┐    ┌───────────┐
│ Parse(P1)│───>│Valid.(P1b│───>│    Analyze & Score (P3) │───>│ Valid.    │
│  Cipher  │    │) Cipher  │    │      Minerva/sonnet     │    │Score(P3b)│
│  haiku   │    │  haiku   │    └─────────────────────────┘    │  Atlas   │
└──────────┘    └──────────┘                                   └────┬─────┘
                                                                    │
┌──────────────┐    ┌───────────────┐    ┌──────────────────────────┘
│ Sheets (P5)  │<───│Valid.Batch(P4b│<───│  Write Outreach (P4)
│ Atlas/sonnet │    │) Atlas/sonnet │    │  Velvet/opus
└──────────────┘    └───────────────┘    └──────────────────
```

**8 fases** | **5 quality gates** | **Retry policy** com exponential backoff

---

## Agentes

| Agente | Persona | Modelo | Papel | Tier |
|--------|---------|--------|-------|------|
| **prospector-chief** | Atlas | sonnet | Pipeline Orchestrator & Lead Qualification Chief | Orchestration |
| **chat-parser** | Cipher | haiku | WhatsApp Export Parser & Data Validator | Processing |
| **prospect-analyst** | Minerva | sonnet | Solution Fit Analyst & Lead Scorer | Analysis |
| **outreach-writer** | Velvet | opus | Personalized Outreach Copywriter | Outreach |

Todos os agentes seguem **AIOS Level 0-6 compliance** (command_loader, operational_frameworks, voice_dna, output_examples, anti_patterns, workflow_integration).

---

## Quick Start

### Pipeline Completo
```
/whatsapp-prospector-ensinio:workflows:full-pipeline
```
Inputs: `{zip_path}` (path do ZIP exportado) + `{group_name}` (nome do grupo)

### Tasks Individuais
```
/whatsapp-prospector-ensinio:tasks:parse-chat-export        # P1: Parsear ZIP WhatsApp
/whatsapp-prospector-ensinio:tasks:validate-parsed-data     # P1b: Validar dados parseados
/whatsapp-prospector-ensinio:tasks:load-ensinio-kb          # P2: Carregar KB Ensinio (5 pilares)
/whatsapp-prospector-ensinio:tasks:analyze-prospects         # P3: Analisar e scorer prospects
/whatsapp-prospector-ensinio:tasks:write-outreach            # P4: Gerar mensagens personalizadas
/whatsapp-prospector-ensinio:tasks:validate-outreach-batch   # P4b: Validar batch de mensagens
/whatsapp-prospector-ensinio:tasks:populate-sheet            # P5: Popular Google Sheets
/whatsapp-prospector-ensinio:tasks:handle-parse-errors       # Recovery: Tratar erros de parse
```

### Agentes
```
/whatsapp-prospector-ensinio:agents:prospector-chief   # Atlas - Orquestrador
/whatsapp-prospector-ensinio:agents:chat-parser        # Cipher - Parser
/whatsapp-prospector-ensinio:agents:prospect-analyst   # Minerva - Analista
/whatsapp-prospector-ensinio:agents:outreach-writer    # Velvet - Copywriter
```

---

## Pilares de Solucao Ensinio (67 features)

| Pilar | Features | Destaques |
|-------|----------|-----------|
| **1. LMS / Area de Membros** | 23 (1.1-1.23) | Vitrine streaming, comunidades, trilhas, SCORM, certificados MEC, aulas ao vivo, anamnese |
| **2. Gamificacao** | 7 (2.1-2.7) | 25 gatilhos, pontos XP, moedas virtuais, missoes, ranking, loja de recompensas |
| **3. Agentes de IA** | 11 (3.1-3.11) | Vendas 24/7, tutor, suporte, multi-canal (WhatsApp/Instagram/Messenger), follow-up |
| **4. Pagamentos Integrados** | 15 (4.1-4.15) | Multi-checkout, PIX/boleto/cartao, split, afiliados, upsell, order bump, cupons |
| **5. White Label + App + Integracoes** | 13 (5.1-5.13) | Marca propria, app iOS/Android, SSO, API REST, webhooks, Hotmart/Kiwify |

KB completo: `data/ensinio-solutions-kb.md`

---

## Quality Gates

| ID | Nome | Transicao | Tipo | Checklist |
|----|------|-----------|------|-----------|
| QG-001 | Parse Validation | Raw ZIP -> Structured Contacts | Blocking | `checklists/parse-validation-checklist.md` |
| QG-002 | Analysis Complete | Contacts -> Scored Prospects | Blocking | - |
| QG-002.5 | Scoring Validation | Scored -> Validated Scores | Blocking | `checklists/scoring-validation-checklist.md` |
| QG-003 | Message Quality | Draft -> Approved Message | Blocking | `checklists/message-quality-checklist.md` |
| QG-004 | Sheet Population | Approved -> Google Sheets | Blocking | - |

---

## Veto Conditions (por fase)

| Fase | Condicao | Severidade | Acao |
|------|----------|------------|------|
| P1 Parse | ZIP nao existe ou corrompido | BLOCKING | HALT |
| P1 Parse | Sem _chat.txt no ZIP | BLOCKING | HALT |
| P1b Validate | 0 contatos extraidos | BLOCKING | HALT |
| P1b Validate | < 10 mensagens nao-sistema | BLOCKING | HALT |
| P1b Validate | Phone coverage < 50% | WARNING | LOG |
| P2 KB | Arquivo KB nao encontrado | BLOCKING | HALT |
| P3 Analyze | Dados parseados indisponiveis | BLOCKING | HALT |
| P3 Analyze | KB nao carregado | BLOCKING | HALT |
| P3b Score | Score distribution uniforme | WARNING | LOG |
| P3b Score | Nenhum prospect score >= 3 | BLOCKING | HALT |
| P4 Write | Analise nao disponivel | BLOCKING | HALT |
| P4 Write | Message rules nao carregadas | BLOCKING | HALT |
| P4b Validate | Batch vazio | BLOCKING | HALT |
| P4b Validate | > 30% rejeitadas | WARNING | REWORK |
| P5 Sheet | Google Sheets inacessivel | BLOCKING | HALT |
| P5 Sheet | Sheet ja tem dados | WARNING | ASK_USER |

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

## Regras de Mensagem

- Enviada pelo **Antonio**, a pedido do **Fosc** (socio fundador da Ensinio)
- **100% humanizada** - deve parecer escrita por humano, nunca IA
- **Personalizada** com projeto/negocio real do prospect
- **Contextualizada temporalmente** (se mensagem antiga)
- **Diferenciada**: abordagem cliente potencial vs parceiro (influencer/promoter)
- Max 5-6 paragrafos curtos, max 1-2 emojis
- CTA suave (sem pressao)

Regras completas: `data/message-rules.md` | Criterios de scoring: `data/scoring-criteria.md`

---

## Estrutura de Arquivos

```
whatsapp-prospector-ensinio/
├── config.yaml                          # Configuracao do squad
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
│   ├── analyze-prospects.md             # P3: Analisar prospects
│   ├── write-outreach.md                # P4: Escrever mensagens
│   ├── validate-outreach-batch.md       # P4b: Validar batch
│   └── populate-sheet.md               # P5: Popular Sheets
├── workflows/
│   └── full-pipeline.yaml               # Pipeline completo (8 fases)
├── checklists/
│   ├── parse-validation-checklist.md    # QG-001
│   ├── scoring-validation-checklist.md  # QG-002.5
│   └── message-quality-checklist.md     # QG-003
└── data/
    ├── ensinio-solutions-kb.md          # KB v2.0 (67 features, 5 pilares)
    ├── message-rules.md                 # Regras de mensagem
    └── scoring-criteria.md              # Criterios de scoring
```

---

## Settings

| Setting | Valor |
|---------|-------|
| `google_sheets_id` | `124EQQAkmt9D7-49LbR-Jx64DhxdtCwceUQgqolk5ZFI` |
| `ensinio_kb_source` | `data/ensinio-solutions-kb.md` |
| `min_score_threshold` | 3 |
| `max_rework_iterations` | 2 |
| `batch_size` | 50 |
| `language` | pt-BR |

---

*WhatsApp Prospector Ensinio v2.0.0 - AIOS Squad*
