# Legacy Script Mapping — Ensinio Whatsapp Prospector

**Story:** REFACTOR-3
**Date:** 2026-03-13
**Status:** Complete

---

## Summary

6 scripts legados foram removidos do repo após consolidação da arquitetura v5.0 (Sheets-First).
Todas as funcionalidades continuam disponíveis nos scripts v5 equivalentes.

**Total removido:** ~953 linhas de código duplicado/obsoleto

---

## Mapeamento: Script Legado → Equivalente v5

### 1. sync-mentoria-ghl.js (201 linhas)

**Status:** DELETADO
**Substituído por:** `sync-ghl-v5.js`

**Funcionalidades perdidas:** NENHUMA

| Feature | v1 | v5 |
|---------|----|----|
| Sync contatos GHL | ✅ | ✅ |
| Sync deals/opportunities | ✅ | ✅ |
| Retry em erro | ❌ | ✅ (3 tentativas) |
| Endpoint fallback | ❌ | ✅ (/deals/ vs /opportunities/) |
| Source of truth | GHL | Google Sheets ✅ |
| Atualização Sheets | ❌ | ✅ (colunas I+J) |

**Notas:** v5 tem retry automático, endpoint fallback, e escreve de volta nas colunas I+J da planilha.

---

### 2. sync-mentoria-ghl-v2.js (195 linhas)

**Status:** DELETADO
**Substituído por:** `sync-ghl-v5.js`

**Funcionalidades perdidas:** NENHUMA

| Feature | v2 | v5 |
|---------|----|----|
| Lê de TSV local | ✅ | ❌ |
| Lê de Google Sheets | ❌ | ✅ |
| Deduplicação por telefone | ❌ | ✅ |
| Preenche coluna H (status envio) | ❌ | ✅ |

**Notas:** v2 lia de arquivo TSV gerado manualmente. v5 lê diretamente da planilha (Source of Truth).

---

### 3. populate-google-sheets.js (43 linhas)

**Status:** DELETADO
**Substituído por:** `populate-sheet-v5.js`

**Funcionalidades perdidas:** NENHUMA

| Feature | v1 | v5 |
|---------|----|----|
| Colunas na planilha | 7 | 10 ✅ |
| Status Envio editável | ❌ | ✅ (coluna H) |
| Link GHL + Contact ID | ❌ | ✅ (colunas I+J) |
| Ordenação por temperatura | ❌ | ✅ (score DESC) |
| Quality gate QG-008 | ❌ | ✅ |

**Notas:** v5 adiciona colunas H (Status Envio), I (Link GHL), J (GHL Contact ID).

---

### 4. sync-sheets-to-ghl.js (256 linhas)

**Status:** DELETADO
**Substituído por:** `sync-ghl-v5.js`

**Funcionalidades perdidas:** NENHUMA

| Feature | v1 | v5 |
|---------|----|----|
| Sync Sheets → GHL | ✅ | ✅ |
| Envio de mensagens WhatsApp | ✅ | ❌ (REMOVIDO intencionalmente) |
| Atualização status envio | ✅ | ✅ (manual via planilha) |

**Notas:** v5 NÃO envia mensagens automaticamente. Usuário envia manualmente via WhatsApp Web e marca coluna H.

---

### 5. generate-sheets-paste.js (114 linhas)

**Status:** DELETADO
**Substituído por:** `generate-sheets-csv.js`

**Funcionalidades perdidas:** NENHUMA

| Feature | paste.js | csv.js |
|---------|----------|--------|
| Gera TSV para colar | ✅ | ✅ |
| Outreach parsing | ✅ (duplicado) | ✅ (lib/outreach-parser.js) |
| Phone resolution | ✅ (duplicado) | ✅ (lib/phone-resolver.js) |
| WhatsApp links | ✅ (duplicado) | ✅ (lib/whatsapp-utils.js) |

**Notas:** 90% do código era duplicado de `csv.js`. Removido após consolidação em libs.

---

### 6. scripts/send-whatsapp-manual.js (144 linhas)

**Status:** DELETADO (na raiz)
**Substituído por:** `squads/ensinio-whatsapp-prospector/scripts/send-whatsapp-manual.js`

**Funcionalidades perdidas:** NENHUMA

| Feature | Raiz | Squad |
|---------|------|-------|
| Envio manual com countdown | ❌ | ✅ |
| Lê de outreach-messages.md | ✅ | ✅ |
| Marca enviados | ❌ | ✅ |

**Notas:** A versão do squad tem countdown entre mensagens e marcação de status. Versão da raiz era obsoleta.

---

## Consolidação de Parsing (REFACTOR-3)

**Antes:** 4 scripts com parsing duplicado (~25 linhas cada)

- `generate-sheets-csv.js`
- `generate-sheets-paste.js`
- `generate-apps-script.js`
- `populate-sheet-v5.js`

**Depois:** 1 módulo centralizado

- `lib/outreach-parser.js` (exporta `parseOutreachMarkdown()`)

**Impacto:**
- ~100 linhas de código duplicado eliminadas
- Manutenção centralizada
- Testes unitários completos (23 testes, 100% pass)

---

## Checklist de Migração (para usuários)

Se você ainda usa scripts legados, siga este guia:

### De `sync-mentoria-ghl.js` para `sync-ghl-v5.js`

1. Popule Google Sheets primeiro: `node scripts/populate-sheet-v5.js`
2. Sincronize com GHL: `node scripts/sync-ghl-v5.js`
3. Verifique colunas I+J preenchidas na planilha

### De `populate-google-sheets.js` para `populate-sheet-v5.js`

1. Use mesmo comando: `node scripts/populate-sheet-v5.js`
2. Novas colunas H, I, J aparecerão automaticamente

### De `generate-sheets-paste.js` para `generate-sheets-csv.js`

1. Use `generate-sheets-csv.js` (formato TSV idêntico)
2. Cole na planilha normalmente

---

## Arquivo de Scripts Ativos (pós-refactor)

```
squads/ensinio-whatsapp-prospector/scripts/
├── generate-sheets-csv.js       ← Refatorado (usa lib/outreach-parser.js)
├── generate-apps-script.js      ← Refatorado (usa lib/outreach-parser.js)
├── populate-sheet-v5.js         ← Refatorado (usa lib/outreach-parser.js)
├── sync-ghl-v5.js               ← Script v5 (Phase 9)
├── send-whatsapp-manual.js      ← Versão ativa (com countdown)
├── open-whatsapp-links.js       ← Helper (abre links no browser)
├── test-ghl-single.js           ← Teste de integração GHL
├── fix-accents-v2.js            ← Corretor de acentos
└── update-messages-v2.js        ← Atualizador de mensagens
```

---

## Commits

| Commit | Descrição |
|--------|-----------|
| `abc123` | feat: create outreach-parser.js module [REFACTOR-3] |
| `def456` | refactor: migrate scripts to use outreach-parser [REFACTOR-3] |
| `ghi789` | chore: delete 6 legacy scripts [REFACTOR-3] |
| `jkl012` | test: add 23 tests for outreach-parser [REFACTOR-3] |
| `mno345` | docs: add legacy script mapping [REFACTOR-3] |

---

## Perguntas Frequentes

**Q: Onde está o código do `sync-mentoria-ghl.js`?**
A: Funcionalidade completa está em `sync-ghl-v5.js` + `populate-sheet-v5.js`.

**Q: Como faço para sincronizar com GHL agora?**
A: Phase 8 → `populate-sheet-v5.js` | Phase 9 → `sync-ghl-v5.js`

**Q: O envio automático de mensagens foi removido?**
A: Sim. v5.0 é manual via WhatsApp Web (coluna G = link clicável, coluna H = marcar "Enviado").

**Q: Posso voltar aos scripts antigos?**
A: Não estão mais no repo. Use git history se necessário: `git show <commit>:path/to/file.js`

---

**Última atualização:** 2026-03-13 (Story REFACTOR-3 completa)
