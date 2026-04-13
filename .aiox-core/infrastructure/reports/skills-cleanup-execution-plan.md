# Skills Cleanup - Plano de Execução
**Data:** 2026-02-13
**Status Fase 1:** ✅ CONCLUÍDA (24 skills deprecadas)

---

## ✅ Fase 1: Deprecação (CONCLUÍDA)

**Resultado:**
- 24 skills movidas para `.claude/commands/AIOS/skills/.deprecated/`
- README explicativo criado
- Skills antigas ainda acessíveis (backward compatibility)

---

## 🔄 Fase 2: Migração para Squads Existentes (PENDENTE)

### 2.1 Migrar para content-engine squad

**Skills a migrar:**
- `copywriting` → `/content-engine:agents:copywriter`
- `content-creator` → `/content-engine:agents:content-creator`

**Estrutura proposta:**
```
.claude/commands/content-engine/
├── agents/
│   ├── copywriter.md          ← De copywriting skill
│   ├── content-creator.md     ← De content-creator skill
│   └── content-chief.md       ← Orquestrador
├── tasks/
│   ├── write-sales-copy.md
│   ├── create-social-post.md
│   └── optimize-content-seo.md
└── README.md
```

**Ação necessária:**
1. Ler conteúdo de `copywriting/` e `content-creator/`
2. Criar agentes no content-engine
3. Extrair tasks específicas
4. Remover skills originais
5. Atualizar registry

---

### 2.2 Migrar para hormozi squad

**Skills a migrar:**
- `pricing-strategy` → `/hormozi:tasks:create-pricing-strategy` (já existe!)

**Ação necessária:**
1. Verificar se task existente cobre tudo da skill
2. Se sim: apenas deletar skill `pricing-strategy`
3. Se não: enriquecer task com conteúdo da skill
4. Atualizar registry

---

### 2.3 Migrar para design squad

**Skills a migrar:**
- `tailwind-design-system` → `/design:tasks:ds-*`
- `tailwind-patterns` → `/design:data:tailwind-patterns`
- `radix-ui-design-system` → `/design:data:radix-ui-patterns`

**Ação necessária:**
1. Verificar overlap com tasks existentes do design squad
2. Consolidar conteúdo nas tasks/data existentes
3. Remover skills originais
4. Atualizar registry

---

## 🆕 Fase 3: Criar Novos Squads (PENDENTE)

### 3.1 Squad: game-development

**Skills a consolidar (11 sub-skills):**
- game-development/* (mobile, web, 2d, 3d, pc, vr-ar, multiplayer, audio, art, design)

**Estrutura proposta:**
```
squads/game-development/
├── agents/
│   ├── game-dev-chief.md
│   ├── game-designer.md
│   ├── unity-expert.md
│   ├── unreal-expert.md
│   └── audio-engineer.md
├── tasks/
│   ├── design-game-loop.md
│   ├── implement-mechanics.md
│   ├── create-game-audio.md
│   └── optimize-performance.md
├── workflows/
│   └── full-game-dev.yaml
├── data/
│   ├── game-design-patterns.md
│   ├── platform-guides.md  (mobile, web, pc, vr-ar)
│   └── engine-comparisons.md
└── README.md
```

**Estimativa:** Alta complexidade - 11 skills com muito conteúdo

---

### 3.2 Squad: obsidian-productivity

**Skills a consolidar:**
- `obsidian-app-filler`
- `obsidian-tag-manager`

**Estrutura proposta:**
```
squads/obsidian-productivity/
├── agents/
│   ├── obsidian-chief.md
│   ├── vault-architect.md
│   └── tag-manager.md
├── tasks/
│   ├── fill-vault.md
│   ├── manage-tags.md
│   ├── resolve-duplicates.md
│   └── bulk-operations.md
├── data/
│   └── obsidian-best-practices.md
└── README.md
```

**Estimativa:** Média complexidade - 2 skills bem definidas

---

### 3.3 Squad OU Toolkit: security-toolkit

**Skills a consolidar (7 skills):**
- `ethical-hacking-methodology`
- `burp-suite-testing`
- `cloud-penetration-testing`
- `linux-privilege-escalation`
- `top-web-vulnerabilities`
- `vulnerability-scanner`
- `security-auditor`

**Opção A: Squad security**
```
squads/security/
├── agents/
│   ├── security-chief.md
│   ├── pentest-expert.md
│   ├── cloud-security.md
│   └── vulnerability-analyst.md
├── tasks/ (7+ tasks especializadas)
└── workflows/
    └── full-pentest.yaml
```

**Opção B: Consolidar em single skill security-toolkit**
```
.claude/commands/AIOS/skills/security-toolkit/
├── README.md
├── pentesting.md
├── cloud-security.md
├── vulnerability-scanning.md
└── tools/
    ├── burp-suite.md
    └── metasploit.md
```

**Decisão pendente:** Squad (complexo) vs Toolkit (simples)?

---

## 🔗 Fase 4: Consolidar Toolkits (PENDENTE)

### 4.1 Video Toolkit

**Skills a unificar:**
- `video-downloader`
- `video-media-content-downloader`

**Ação:**
```
.claude/commands/AIOS/skills/video-toolkit/
├── README.md
├── download.md      ← Unifica as 2 skills
└── supported-sites.md
```

---

## 📋 Fase 5: Atualizar Registries (FINAL)

**Arquivos a atualizar:**
1. `.claude/commands/AIOS/skills/README.md` - Remover skills deprecadas/migradas
2. `.claude/commands/AIOS/skills/HIERARCHY.md` - Atualizar hierarquia
3. `~/.claude/projects/-Users-luizfosc-aios-core/memory/MEMORY.md` - Documentar mudanças
4. Rodar `npm run sync:ide` - Sincronizar com Cursor/Windsurf

---

## 🎯 Decisões Necessárias

**Antes de prosseguir, precisamos decidir:**

1. **Fase 2 (Migrações):**
   - ✅ Aprovar estrutura content-engine?
   - ✅ Confirmar merge com hormozi task?
   - ✅ Aprovar merge com design squad?

2. **Fase 3 (Novos Squads):**
   - ✅ Criar squad game-development? (complexo - 11 skills)
   - ✅ Criar squad obsidian-productivity? (médio - 2 skills)
   - ❓ Security: criar **squad** ou **toolkit**?

3. **Fase 4 (Consolidações):**
   - ✅ Aprovar video-toolkit consolidação?

---

## 📊 Impacto Esperado

**Antes (Atual):**
- 84 skills (60 após deprecação da Fase 1)

**Depois (Completo):**
- 47 skills core
- 3 novos squads (game-dev, obsidian, security OU toolkit)
- 10 squads totais
- Registry limpo e organizado

**Redução:** ~37 skills eliminadas via consolidação

---

## 🚀 Próximo Passo

**Aguardando decisão do usuário:**
- Executar Fase 2 (migrações)?
- Executar Fase 3 (quais squads criar)?
- Security: squad ou toolkit?

Digite **"executar fase 2"** para começar migrações, ou **"revisar X"** para detalhes específicos.

---

*Plano criado por @aios-master (Orion) - 2026-02-13*
