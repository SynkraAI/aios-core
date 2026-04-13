# Checkpoint Validation Checklist

Validates checkpoint integrity, Priority Architecture compliance, and INDEX↔ACTIVE sync.

---

## 1. Priority Architecture Compliance

- [ ] P1: `docs/projects/{project}/INDEX.md` was updated (OBRIGATÓRIO)
- [ ] P2: `.aiox/navigator/{project}/checkpoints/{date}-{slug}.md` saved (OPCIONAL — skip ok in emergency)
- [ ] P3: `docs/projects/ACTIVE.md` row updated (OPCIONAL — skip ok in emergency)
- [ ] No files written outside the 3 allowed paths (whitelist enforced)
- [ ] Emergency mode used ONLY when: 2º+ checkpoint in session OR `--fast` flag

---

## 2. INDEX.md Integrity (P1)

### Required Sections Present

- [ ] `**Última sessão:**` field exists and has valid timestamp (`YYYY-MM-DD às HH:MM`)
- [ ] `## Estado Atual` section exists with status indicators (✅/🔄/⏳)
- [ ] `**Próximo passo:**` field exists and is actionable
- [ ] `## Recursos do Projeto` section exists
- [ ] `## Próximas Tarefas` section exists
- [ ] `## Histórico` section exists

### Content Quality

- [ ] `**Última sessão:**` timestamp matches current session date
- [ ] `## Estado Atual` reflects real progress (not stale)
- [ ] `**Próximo passo:**` is specific (not generic like "continuar trabalho")
- [ ] `## Histórico` entries are single-line format: `- YYYY-MM-DD às HH:MM: {summary}`
- [ ] `## Histórico` has NO multi-line entries with nested bullets
- [ ] `## Histórico` has max 20 entries (older entries trimmed)

### Untouched Sections (checkpoint MUST NOT modify)

- [ ] `## Arquivos Relevantes` — unchanged (manual only)
- [ ] `## Números` — unchanged (manual only)
- [ ] `## Problemas Conhecidos` — unchanged (manual only)

---

## 3. Snapshot Integrity (P2 — Optional)

- [ ] File path matches pattern: `.aiox/navigator/{project}/checkpoints/{date}-{slug}.md`
- [ ] File is lightweight (~30 lines max)
- [ ] Contains required fields: Data, Resumo, Git SHA, Arquivos Modificados, Próximo Passo
- [ ] Snapshot is complementary to INDEX.md (not a replacement)

---

## 4. ACTIVE.md Integrity (P3)

- [ ] Project row exists in table
- [ ] Row columns match: Projeto | Status | Última sessão | Próximo passo | INDEX
- [ ] `Última sessão` matches INDEX.md timestamp
- [ ] `Próximo passo` matches INDEX.md next step
- [ ] Header `> Última atualização:` timestamp updated
- [ ] No manual edits overwritten without user confirmation

---

## 5. INDEX ↔ ACTIVE Sync

- [ ] `Última sessão` in INDEX.md == `Última sessão` in ACTIVE.md row
- [ ] `Próximo passo` in INDEX.md == `Próximo passo` in ACTIVE.md row
- [ ] Status in INDEX.md `## Estado Atual` is consistent with ACTIVE.md status emoji
- [ ] If emergency mode was used: sync deferred flag noted, `*resume-project` will catch up

---

## 6. Emergency Mode Validation

- [ ] Emergency mode triggered by valid condition (2º+ checkpoint OR --fast)
- [ ] Emergency mode did NOT run git commands (coleta mínima only)
- [ ] Only INDEX.md was written (P2 and P3 skipped)
- [ ] Output shows `P2 ⏭️ | P3 ⏭️` (deferred)
- [ ] Next `*resume-project` will sync P3

---

## 7. Veto Conditions Verified

- [ ] Project INDEX.md exists before checkpoint
- [ ] INDEX.md has required sections (`## Estado Atual`, `## Histórico`)
- [ ] Project was detected from context OR provided explicitly
- [ ] If multiple projects modified → user was asked which one
- [ ] No writes outside whitelist paths

---

## Output Example — Valid Checkpoint (Normal Mode)

```
📍 Checkpoint criado!

Projeto: storytelling-masters-fosc
Sessão: Squad completo com 12 agents, validation 8.8/10

P1 INDEX ✅ | P2 Snapshot ✅ | P3 ACTIVE ✅
```

## Output Example — Valid Checkpoint (Emergency Mode)

```
📍 Checkpoint (emergency)
Projeto: storytelling-masters-fosc
P1 INDEX ✅ | P2 ⏭️ | P3 ⏭️
⚠️ P2/P3 serão sincronizados no próximo *resume-project
```

---

*Navigator Squad - Checkpoint Validation Checklist v2.0*
