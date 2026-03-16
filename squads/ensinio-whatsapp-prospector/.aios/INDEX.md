# Ensinio WhatsApp Prospector — Project Index

**Squad Type:** HYBRID (código em `squads/ensinio-whatsapp-prospector/`, governança em `.aios/`)
**Created:** 2026-03-09
**Last Updated:** 2026-03-16
**Status:** 🟡 IN PROGRESS

---

## 📋 **O Que É?**

Squad especializado em prospectar leads qualificados a partir de exports de grupos de WhatsApp, cruzando com as 67 soluções da Ensinio (5 pilares), ICPs, red flags e gerando mensagens personalizadas de outreach.

**Pipeline v5.0 (Sheets-First):**
```
Parse → Analyze → Write Outreach → SHEETS → Evolution API → GHL Sync (opcional)
```

---

## 🎯 **Status Atual**

### **Fase Ativa:** Phase 10 - Send via Evolution API
- **Grupo:** Mentoria Renan (MENTORIA 50K)
- **Progresso:** 40/77 enviados (52% completo)
- **Blocker:** Implementar message splitting (parecer humano, não IA)

### **Último Checkpoint:** 2026-03-16 10:45
- **Session:** `.aios/sessions/2026-03-16-envio-mentoria-renan.md`
- **Próximo passo:** Implementar Story S1.1 (message splitting)

---

## 📚 **Epics Ativas**

| ID | Epic | Status | Stories | Progress |
|----|------|--------|---------|----------|
| EPIC-001 | Message Sending Automation | 🟡 IN PROGRESS | 3 | 0/3 (0%) |

**Detalhes:** `.aios/epics/EPIC-001-message-sending.md`

---

## 📝 **Stories Ativas**

| ID | Story | Status | Assignee | Epic |
|----|-------|--------|----------|------|
| S1.1 | Implement Message Splitting | 🔴 TODO | @dev | EPIC-001 |
| S1.2 | Resume from Checkpoint | 🔴 TODO | @dev | EPIC-001 |
| S1.3 | Sheets Status Automation | 🔴 TODO | @dev | EPIC-001 |

**Índice:** `docs/stories/STORIES-INDEX.md`

---

## 🔑 **Decisões Críticas**

| Data | Decisão | Impacto |
|------|---------|---------|
| 2026-03-12 | **Sheets-First Architecture (v5.0)** | Google Sheets = source of truth, não GHL. Envio manual via WhatsApp Web ou Evolution API. GHL sync = opcional. |
| 2026-03-16 | **Message Splitting Strategy** | Dividir mensagens em parágrafos curtos + typing simulation para parecer humano (não enviar blocão de texto). |
| 2026-03-16 | **Evolution API + Typing** | Usar `opts.delay` para simular digitação. Delay 2-3s entre mensagens. |

---

## 🚧 **Blockers Ativos**

| Blocker | Impacto | Owner | Status |
|---------|---------|-------|--------|
| Google Sheets MCP integration | Não consegue ler/atualizar Sheets automaticamente | @devops | 🟡 WORKAROUND (export manual TSV) |
| Message splitting não implementado | Mensagens parecem IA (blocão de texto) | @dev | 🔴 BLOCKING Story S1.1 |

---

## 📊 **Ciclos de Envio**

### **Ciclo Atual: Mentoria Renan (2026-03-16)**
- **Status:** 🟡 PAUSADO (aguardando S1.1)
- **Progresso:** 40/77 enviados (52%)
- **Checkpoint:** `.aios/sessions/2026-03-16-envio-mentoria-renan.md`
- **Próximo:** Retomar após implementar split

### **Ciclos Anteriores**
- *(nenhum ciclo completo anterior)*

---

## 📁 **Arquivos Críticos**

### **Code**
- `scripts/send-evolution-batch.js` — Script de envio via Evolution API
- `scripts/populate-sheet-v5.js` — Popular Google Sheets (Phase 9)
- `lib/parse-chat-export-impl.js` — Parser de exports WhatsApp

### **Data**
- `data/outputs/mentoria-50k/outreach-sheets-final.tsv` — 77 prospects com mensagens prontas
- `data/outputs/mentoria-50k/ghl-sync-results-v3.json` — Resultado do último GHL sync

### **Tasks**
- `tasks/send-via-evolution-api.md` — Phase 10 specification
- `tasks/populate-sheet-v5.md` — Phase 9 specification

### **Configuration**
- `.env` — Evolution API credentials
- `config.yaml` — Squad configuration

---

## 🎯 **Próximos Passos (Priority Order)**

1. **[S1.1]** Implementar message splitting (split por parágrafos + typing delay)
2. **[S1.2]** Sistema de checkpoint (salvar progresso, retomar de onde parou)
3. **[S1.3]** Atualizar Sheets status automaticamente (Coluna H)
4. **[RESUME]** Retomar envio Mentoria Renan (37 restantes)
5. **[EPIC-002]** Padronizar fluxo de envio para outros grupos

---

## 🔄 **Como Retomar Este Projeto**

Quando você disser **"continuar projeto Ensinio Prospector"**, eu vou:
1. Ler este INDEX.md
2. Ler `.aios/SNAPSHOT.md` (estado atual)
3. Ler último checkpoint em `.aios/sessions/`
4. Apresentar resumo + próximo passo

**Comando rápido:** `/ensinio-whatsapp-prospector` ou `continuar envio de mensagens`

---

## 📞 **Contatos / Stakeholders**

- **Owner:** Luiz Fosc
- **Agente Principal:** @prospector-chief (Atlas)
- **Specialists:** @chat-parser, @prospect-analyst, @outreach-writer

---

**Última atualização:** 2026-03-16 | **Próxima review:** Após S1.1 completa
