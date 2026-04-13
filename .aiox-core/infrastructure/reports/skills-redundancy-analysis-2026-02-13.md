# Skills Redundancy Analysis
**Data:** 2026-02-13
**Autor:** @aios-master (Orion)
**Objetivo:** Identificar skills redundantes com agentes/squads existentes

---

## Resumo Executivo

**Total de skills analisadas:** 84
**Status:**
- ✅ **MANTER:** 47 skills (56%)
- ❌ **DEPRECAR:** 24 skills (29%)
- 🔄 **MIGRAR para Squad:** 8 skills (9%)
- 🔗 **CONSOLIDAR:** 5 skills (6%)

---

## Categoria 1: DEPRECAR (24 skills)
*Skills cobertas por agentes/squads existentes*

### 🏗️ Arquitetura → @architect
| Skill | Agente Equivalente | Ação |
|-------|-------------------|------|
| `architect-first` | @architect | DEPRECAR - agente faz isso nativamente |
| `api-design-principles` | @architect | DEPRECAR - parte do domínio do arquiteto |
| `architecture-decision-records` | @architect | DEPRECAR - ADRs são responsabilidade do arquiteto |
| `monorepo-architect` | @architect | DEPRECAR - arquitetura de monorepo |

### 🗄️ Database → @data-engineer
| Skill | Agente Equivalente | Ação |
|-------|-------------------|------|
| `database-design` | @data-engineer | DEPRECAR - responsabilidade exclusiva do data-engineer |
| `cqrs-implementation` | @data-engineer + @architect | DEPRECAR - padrão arquitetural de dados |
| `event-sourcing-architect` | @data-engineer + @architect | DEPRECAR - padrão de persistência |
| `event-store-design` | @data-engineer | DEPRECAR - design de event store |
| `projection-patterns` | @data-engineer | DEPRECAR - projeções de dados |
| `saga-orchestration` | @data-engineer + @architect | DEPRECAR - orquestração de sagas |

### 🧪 QA & Debug → @qa / @dev
| Skill | Agente Equivalente | Ação |
|-------|-------------------|------|
| `production-code-audit` | @qa | DEPRECAR - auditorias são do QA |
| `systematic-debugging` | @dev + @qa | DEPRECAR - debug sistemático |
| `error-detective` | @dev + @qa | DEPRECAR - investigação de erros |
| `lint-and-validate` | @qa | DEPRECAR - validação de código |
| `error-handling-patterns` | @dev | DEPRECAR - padrões de tratamento de erro |

### 🎨 UX/UI → @ux-design-expert + design squad
| Skill | Agente Equivalente | Ação |
|-------|-------------------|------|
| `mobile-design` | @ux-design-expert | DEPRECAR - design mobile |
| `frontend-design` | @ux-design-expert | DEPRECAR - design frontend |
| `web-design-guidelines` | @ux-design-expert | DEPRECAR - guidelines web |
| `3d-web-experience` | @ux-design-expert | DEPRECAR - experiências 3D |
| `scroll-experience` | @ux-design-expert | DEPRECAR - experiências de scroll |

### 📝 Product → @pm / @analyst
| Skill | Agente Equivalente | Ação |
|-------|-------------------|------|
| `prd-generator` | @pm | DEPRECAR - PRDs são do PM |
| `competitive-landscape` | @analyst | DEPRECAR - análise competitiva |
| `market-sizing-analysis` | @analyst | DEPRECAR - análise de mercado |

### 🔧 DevOps → @devops
| Skill | Agente Equivalente | Ação |
|-------|-------------------|------|
| `git-pushing` | @devops | DEPRECAR - git ops são exclusivos do devops |

---

## Categoria 2: MIGRAR para Squad (8 skills)
*Skills complexas que merecem squad próprio*

### 🎮 Game Development → Squad Novo
```yaml
squad: game-development
reason: 11 sub-skills (mobile, web, vr-ar, 2d, 3d, pc, multiplayer, audio, art, design)
complexidade: ALTA
decisão: Criar squad game-development com especialistas
```
**Sub-skills:**
- `game-development/*` (11 sub-skills)

### 📓 Obsidian → Squad Novo
```yaml
squad: obsidian-productivity
reason: 2 skills relacionadas (app-filler, tag-manager)
complexidade: MÉDIA
decisão: Criar squad obsidian-productivity
```
**Skills:**
- `obsidian-app-filler`
- `obsidian-tag-manager`

### 💰 Pricing & Business → Integrar no hormozi squad
```yaml
squad: hormozi
reason: Overlap com pricing-strategy do hormozi
decisão: Migrar pricing-strategy pro hormozi squad
```
**Skills:**
- `pricing-strategy`

### ✍️ Copywriting → Integrar no content-engine squad
```yaml
squad: content-engine
reason: Copywriting é parte de content creation
decisão: Migrar copywriting e content-creator pro content-engine
```
**Skills:**
- `copywriting`
- `content-creator`

### 🎨 Design Systems → Já existe design squad!
```yaml
squad: design
reason: Design squad já existe com 33 tasks
decisão: Migrar tailwind-design-system, radix-ui-design-system pro design squad
```
**Skills:**
- `tailwind-design-system`
- `tailwind-patterns`
- `radix-ui-design-system`
- `design-system-extractor` (já existe no hub AIOS)

---

## Categoria 3: CONSOLIDAR (5 skills)
*Skills similares que podem ser unificadas*

### Video Skills → Consolidar em video-toolkit
```yaml
nome: video-toolkit
consolidar: [video-downloader, video-media-content-downloader]
decisão: Unificar em single skill com sub-commands
```

### Security Skills → Consolidar em security-toolkit
```yaml
nome: security-toolkit
consolidar: [
  ethical-hacking-methodology,
  burp-suite-testing,
  cloud-penetration-testing,
  linux-privilege-escalation,
  top-web-vulnerabilities,
  vulnerability-scanner,
  security-auditor
]
decisão: Criar security-toolkit com 7 sub-módulos
```

---

## Categoria 4: MANTER (47 skills)
*Skills únicas sem equivalente em agentes/squads*

### 🛠️ Meta-Skills (ESSENCIAIS)
- ✅ `skill-creator` - Criação de skills
- ✅ `system-prompt-architect` - Arquitetura de prompts
- ✅ `prompt-engineering` - Engenharia de prompts
- ✅ `mcp-builder` - Construção de MCP servers
- ✅ `multi-agent-patterns` - Padrões de multi-agentes
- ✅ `agent-orchestration-improve-agent` - Melhoria de agentes

### 💻 Linguagens Específicas (TÉCNICAS)
- ✅ `typescript-pro`
- ✅ `python-pro`
- ✅ `cpp-pro`
- ✅ `elixir-pro`
- ✅ `julia-pro`
- ✅ `haskell-pro`

### 🚀 Frameworks Específicos (TÉCNICAS)
- ✅ `nextjs-react-expert`
- ✅ `nestjs-expert`
- ✅ `angular`
- ✅ `angular-state-management`
- ✅ `inngest`
- ✅ `n8n-mcp-tools-expert`
- ✅ `avalonia-viewmodels-zafiro`
- ✅ `minecraft-bukkit-pro`
- ✅ `unreal-engine-cpp-pro`
- ✅ `godot-gdscript-patterns`
- ✅ `salesforce-development`
- ✅ `blockchain-developer`
- ✅ `defi-protocol-templates`

### 🏗️ App Builders & Templates (UTILITÁRIAS)
- ✅ `app-builder` - 13 templates de projeto
- ✅ `browser-extension-builder`
- ✅ `dashboard-generator`
- ✅ `notion-template-business`

### 📚 Utilitários & Tools (UTILITÁRIAS)
- ✅ `tech-search` - Busca técnica
- ✅ `decision-tree-generator` - Geração de árvores de decisão
- ✅ `documentation-templates` - Templates de docs
- ✅ `progress-visualizer` - Visualização de progresso
- ✅ `automate-whatsapp` - Automação WhatsApp
- ✅ `kaizen` - Melhoria contínua
- ✅ `concise-planning` - Planejamento conciso
- ✅ `desenho-ascii` - Desenhos ASCII
- ✅ `criar-app-completo` - Criação rápida de apps

### 🏗️ Patterns & Architecture (PADRÕES)
- ✅ `code-refactoring-refactor-clean` - Refatoração
- ✅ `nx-workspace-patterns` - Padrões Nx

---

## Plano de Ação

### Fase 1: Deprecação Imediata (24 skills)
```bash
# Criar diretório de deprecated
mkdir -p .claude/commands/AIOS/skills/.deprecated

# Mover skills redundantes
mv .claude/commands/AIOS/skills/{architect-first,api-design-principles,...} \
   .claude/commands/AIOS/skills/.deprecated/
```

### Fase 2: Criação de Squads (3 novos squads)
1. **game-development squad** - 11 sub-skills de game dev
2. **obsidian-productivity squad** - 2 skills obsidian
3. **security-toolkit squad** - 7 skills de segurança

### Fase 3: Migração para Squads Existentes
1. `pricing-strategy` → hormozi squad
2. `copywriting`, `content-creator` → content-engine squad
3. `tailwind-*`, `radix-ui-*` → design squad

### Fase 4: Consolidação (2 toolkits)
1. **video-toolkit** - Unificar 2 skills de vídeo
2. **security-toolkit** - Unificar 7 skills de segurança (ou squad)

### Fase 5: Atualização de Registry
```bash
# Atualizar SKILLS-INDEX
npm run index:skills

# Atualizar HIERARCHY.md
npm run sync:hierarchy
```

---

## Impacto Esperado

### Redução de Skills
- **Antes:** 84 skills
- **Deprecadas:** -24 skills
- **Migradas:** -13 skills (viram squads/consolidadas)
- **Depois:** 47 skills core + 3 novos squads

### Benefícios
1. ✅ **Menos redundância** - Skills únicas e focadas
2. ✅ **Melhor organização** - Squads para domínios complexos
3. ✅ **Facilita descoberta** - Usuário sabe quando usar skill vs agente
4. ✅ **Reduz manutenção** - Menos arquivos duplicados

---

## Decisão Final

**Recomendação:** Executar plano de ação completo (Fases 1-5)

**Próximos passos:**
1. Confirmar com usuário (@luizfosc)
2. Executar Fase 1 (deprecação)
3. Planejar criação dos 3 novos squads (Fase 2)
4. Migrar skills para squads existentes (Fase 3)
5. Consolidar toolkits (Fase 4)
6. Atualizar registries (Fase 5)

---

*Análise gerada por @aios-master (Orion) - 2026-02-13*
