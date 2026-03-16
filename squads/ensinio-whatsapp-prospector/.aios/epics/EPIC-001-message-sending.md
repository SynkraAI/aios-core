# EPIC-001: Message Sending Automation

**Created:** 2026-03-16
**Owner:** @prospector-chief (Atlas)
**Status:** 🟡 IN PROGRESS (0/3 stories complete)
**Priority:** P0 (CRITICAL)

---

## 🎯 **Objetivo**

Automatizar envio de mensagens via Evolution API com:
1. **Split natural** — dividir mensagens em parágrafos curtos (parecer humano)
2. **Typing simulation** — delays entre mensagens + typing indicators
3. **Checkpoint system** — salvar progresso, retomar de onde parou
4. **Sheets integration** — atualizar status automaticamente

**Success Criteria:**
- ✅ Mensagens enviadas em múltiplas partes (não blocão)
- ✅ Delay de 2-3s entre partes + typing simulation
- ✅ Sistema de checkpoint funcional (parar e retomar)
- ✅ Status no Sheets atualizado automaticamente
- ✅ Taxa de erro < 5%
- ✅ Passar no "teste humano" (3 pessoas não percebem padrão)

---

## 📊 **Stories**

| ID | Story | Status | Priority | Effort | Owner |
|----|-------|--------|----------|--------|-------|
| S1.1 | Implement Message Splitting | 🔴 TODO | P0 | 30 min | @dev |
| S1.2 | Resume from Checkpoint | 🔴 TODO | P0 | 20 min | @dev |
| S1.3 | Sheets Status Automation | 🔴 TODO | P1 | 25 min | @dev |

**Total Effort:** ~75 min (~1.5h)

---

## 📝 **Story Breakdown**

### **S1.1: Implement Message Splitting**
**Goal:** Dividir mensagens grandes em parágrafos curtos e enviar sequencialmente com delays.

**Acceptance Criteria:**
- [ ] Função `splitMessageIntoParts(message)` retorna array de partes
- [ ] Split por `\n\n` (parágrafos) OU limite de 150 chars se parágrafo muito grande
- [ ] Envio sequencial com delay 2-3s entre partes
- [ ] Usar `opts.delay` para typing simulation (random 1000-3000ms)
- [ ] Testar com 3 mensagens de exemplo
- [ ] Passar no "teste humano" (não parece IA)

**Implementation:**
```javascript
function splitMessageIntoParts(message) {
  // Split por parágrafos (dupla quebra de linha)
  let parts = message.split('\n\n').filter(p => p.trim());

  // Se algum parágrafo > 150 chars, split por frases
  parts = parts.flatMap(part => {
    if (part.length > 150) {
      return part.split(/\.\s+/).filter(s => s.trim());
    }
    return part;
  });

  return parts;
}

async function sendWithSplit(client, phone, message) {
  const parts = splitMessageIntoParts(message);

  for (let i = 0; i < parts.length; i++) {
    const delay = Math.floor(Math.random() * 2000) + 1000; // 1-3s
    await client.sendText(phone, parts[i], { delay });

    if (i < parts.length - 1) {
      await sleep(2000 + Math.random() * 1000); // 2-3s entre mensagens
    }
  }
}
```

---

### **S1.2: Resume from Checkpoint**
**Goal:** Sistema de checkpoint para salvar progresso e retomar envio de onde parou.

**Acceptance Criteria:**
- [ ] Checkpoint JSON salvo após cada envio bem-sucedido
- [ ] Arquivo: `.aios/sessions/{group-slug}-checkpoint.json`
- [ ] Contém: `{ lastSentIndex, totalSent, totalErrors, timestamp }`
- [ ] Ao retomar, ler checkpoint e filtrar apenas não enviados
- [ ] Validar que não re-envia para mesmos contatos
- [ ] Atualizar checkpoint a cada 5 envios (batch checkpoint)

**Implementation:**
```javascript
const CHECKPOINT_FILE = `.aios/sessions/${groupSlug}-checkpoint.json`;

function saveCheckpoint(checkpoint) {
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(checkpoint, null, 2));
}

function loadCheckpoint() {
  if (!fs.existsSync(CHECKPOINT_FILE)) return null;
  return JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf8'));
}

async function sendBatchWithCheckpoint(contacts) {
  const checkpoint = loadCheckpoint() || { lastSentIndex: -1, totalSent: 0, totalErrors: 0 };

  for (let i = checkpoint.lastSentIndex + 1; i < contacts.length; i++) {
    const contact = contacts[i];

    try {
      await sendWithSplit(client, contact.phone, contact.message);
      checkpoint.lastSentIndex = i;
      checkpoint.totalSent++;

      if (i % 5 === 0) saveCheckpoint(checkpoint); // Checkpoint a cada 5
    } catch (error) {
      checkpoint.totalErrors++;
      saveCheckpoint(checkpoint);
      throw error;
    }
  }

  saveCheckpoint(checkpoint); // Final checkpoint
}
```

---

### **S1.3: Sheets Status Automation**
**Goal:** Integrar Google Sheets MCP para atualizar status automaticamente após cada envio.

**Acceptance Criteria:**
- [ ] Integrar Google Sheets MCP (`mcp__google_workspace__*`)
- [ ] Após cada envio bem-sucedido, atualizar Coluna H = "Enviado"
- [ ] Se erro, atualizar Coluna H = "Erro"
- [ ] Se checkpoint carregado, marcar contatos já enviados como "Enviado"
- [ ] Batch update a cada 10 envios (evitar rate limit)
- [ ] Validar que Sheets fica sincronizado com checkpoint

**Implementation:**
```javascript
// TODO: Implementar com Google Sheets MCP
// Aguardando MCP tools estarem disponíveis
// Workaround atual: Atualizar manualmente ou via script Apps Script
```

---

## 🔄 **Dependencies**

- **S1.1** → Blocker para retomar envio Mentoria Renan
- **S1.2** → Depende de S1.1 (precisa de envio funcionando primeiro)
- **S1.3** → Pode ser implementado em paralelo com S1.2

**Recomendação:** Implementar nesta ordem: S1.1 → S1.2 → S1.3

---

## 🎯 **Success Metrics**

| Métrica | Target | Medição |
|---------|--------|---------|
| **Taxa de sucesso** | > 95% | (enviados / total) * 100 |
| **Split natural** | 100% | Todas mensagens divididas em partes |
| **Checkpoint funcional** | 100% | Retomar de onde parou sem erros |
| **Sheets sincronizado** | > 98% | Status correto no Sheets |
| **Teste humano** | PASS | 3 pessoas não percebem padrão |

---

## 📋 **Testing Plan**

### **Unit Tests**
- [ ] `splitMessageIntoParts()` divide corretamente
- [ ] `saveCheckpoint()` / `loadCheckpoint()` I/O correto
- [ ] `sendWithSplit()` envia em ordem correta

### **Integration Tests**
- [ ] Envio completo de 3 mensagens com split
- [ ] Checkpoint salvo e carregado corretamente
- [ ] Sheets atualizado após envio

### **E2E Test**
- [ ] Ciclo completo: 10 prospects → split → checkpoint → sheets update

---

## 🚀 **Rollout Plan**

1. **Dev (local):** Implementar S1.1 + S1.2 + testar com 3 prospects
2. **Staging (5 prospects):** Validar split + checkpoint com grupo pequeno
3. **Production (Mentoria Renan):** Retomar envio dos 37 restantes
4. **Monitoring:** Acompanhar taxa de erro + feedback manual

---

## 📝 **Notes / Decisions**

- **2026-03-16:** Decidido que split por `\n\n` é suficiente (não precisa NLP complexo)
- **2026-03-16:** Typing delay random 1-3s para parecer mais natural
- **2026-03-16:** Checkpoint a cada 5 envios (balancear I/O vs segurança)
- **2026-03-16:** Google Sheets MCP integration em S1.3 (não blocker crítico)

---

**Next Review:** Após S1.1 completa (esperado: 2026-03-16 EOD)
