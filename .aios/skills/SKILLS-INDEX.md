# AIOS Skills Index

Índice completo de todas as skills instaladas no sistema AIOS.

**Última atualização:** 2026-02-05

---

## 📁 Estrutura de Skills

```
.aios/skills/
├── superpowers/                    # Skills do repositório obra/superpowers
│   ├── test-driven-development/
│   ├── verification-before-completion/
│   ├── requesting-code-review/
│   └── receiving-code-review/
├── document-processing/            # Skills de processamento de documentos
│   ├── docx/
│   ├── pptx/
│   └── xlsx/
├── design-system-extractor/        # Extração de design systems de sites
└── obsidian-tag-manager/          # Gerenciamento de tags Obsidian
```

---

## 🎯 Skills por Categoria

### Quality & Testing (Superpowers Collection)

#### test-driven-development
**Origem:** obra/superpowers
**Status:** ✅ Instalado (2026-02-05)
**Descrição:** Implementa ciclo RED-GREEN-REFACTOR com metodologia test-first
**Quando usar:** Implementação de features, bugfixes, refactoring
**Ativação:** Automática quando implementando código
**Documentação:** `.aios/skills/superpowers/test-driven-development/SKILL.md`

**Princípio Core:** Write the test first. Watch it fail. Write minimal code to pass.

---

#### verification-before-completion
**Origem:** obra/superpowers
**Status:** ✅ Instalado (2026-02-05)
**Descrição:** Garante evidência antes de claims de conclusão
**Quando usar:** Antes de marcar tasks como completas, commits, PRs
**Ativação:** Automática antes de completion claims
**Documentação:** `.aios/skills/superpowers/verification-before-completion/SKILL.md`

**Princípio Core:** Evidence before claims, always.

---

### Code Review (Superpowers Collection)

#### requesting-code-review
**Origem:** obra/superpowers
**Status:** ✅ Instalado (2026-02-05)
**Descrição:** Workflow para solicitar code review sistemático
**Quando usar:** Após tasks, features, antes de merge
**Ativação:** Manual quando necessário review
**Documentação:** `.aios/skills/superpowers/requesting-code-review/SKILL.md`

**Integração:** Complementa @qa agent (Quinn)

---

#### receiving-code-review
**Origem:** obra/superpowers
**Status:** ✅ Instalado (2026-02-05)
**Descrição:** Processamento técnico rigoroso de feedback de review
**Quando usar:** Ao receber code review feedback
**Ativação:** Automática ao processar review feedback
**Documentação:** `.aios/skills/superpowers/receiving-code-review/SKILL.md`

**Princípio Core:** Verify before implementing. Technical correctness over social comfort.

---

### Planning & Workflow (Superpowers Collection)

#### brainstorming
**Origem:** obra/superpowers
**Status:** ✅ Instalado (2026-02-05 - Phase 2)
**Descrição:** Refinamento socrático de design via diálogo colaborativo
**Quando usar:** Antes de qualquer trabalho criativo, features, componentes
**Ativação:** Automática antes de creative work
**Documentação:** `.aios/skills/superpowers/brainstorming/SKILL.md`

**Processo:**
1. Understanding (uma pergunta por vez)
2. Exploring approaches (2-3 opções com trade-offs)
3. Presenting design (seções de 200-300 palavras)
4. Documentation (salvar em docs/plans/)

**Integração:** Complementa @architect (Aria) e @pm (Morgan)

---

#### writing-plans
**Origem:** obra/superpowers
**Status:** ✅ Instalado (2026-02-05 - Phase 2)
**Descrição:** Planos de implementação com micro-tasks de 2-5 minutos
**Quando usar:** Quando tem spec/requirements para task multi-step
**Ativação:** Após brainstorming, antes de implementação
**Documentação:** `.aios/skills/superpowers/writing-plans/SKILL.md`

**Granularidade:** Cada step = 2-5 minutos (write test, run test, implement, verify, commit)

**Integração:** Mais granular que TaskCreate, alimenta executing-plans

---

#### executing-plans
**Origem:** obra/superpowers
**Status:** ✅ Instalado (2026-02-05 - Phase 2)
**Descrição:** Execução em batch de planos com checkpoints de review
**Quando usar:** Quando tem plano escrito pronto para executar
**Ativação:** Referência explícita ao plano
**Documentação:** `.aios/skills/superpowers/executing-plans/SKILL.md`

**Workflow:**
1. Load e Review → 2. Execute Batch (3 tasks) → 3. Report → 4. Continue → 5. Complete

**Integração:** Usa Task tool, checkpoints humanos, alimenta finishing-a-development-branch

---

#### finishing-a-development-branch
**Origem:** obra/superpowers
**Status:** ✅ Instalado (2026-02-05 - Phase 2)
**Descrição:** Completar desenvolvimento com opções de merge/PR/cleanup
**Quando usar:** Implementação completa, testes passando, pronto para integração
**Ativação:** Ao final de executing-plans ou feature completa
**Documentação:** `.aios/skills/superpowers/finishing-a-development-branch/SKILL.md`

**Workflow:** Verify tests → Present options → Execute choice → Clean up

**Integração:** Complementa @devops (Gage) authority, quality gate antes de merge

---

### Document Processing

#### docx (Word Documents)
**Origem:** anthropics/skills (via AIOS)
**Status:** ✅ Instalado
**Descrição:** Criação e edição de documentos Word (.docx)
**Quando usar:** Manipulação de arquivos Word
**Documentação:** `.aios/skills/document-processing/docx/SKILL.md`

---

#### pptx (PowerPoint)
**Origem:** anthropics/skills (via AIOS)
**Status:** ✅ Instalado
**Descrição:** Geração e modificação de apresentações PowerPoint
**Quando usar:** Criação de slides e apresentações
**Documentação:** `.aios/skills/document-processing/pptx/SKILL.md`

---

#### xlsx (Excel)
**Origem:** anthropics/skills (via AIOS)
**Status:** ✅ Instalado
**Descrição:** Trabalho com planilhas Excel
**Quando usar:** Manipulação de spreadsheets
**Documentação:** `.aios/skills/document-processing/xlsx/SKILL.md`

---

### Design & Development

#### design-system-extractor
**Origem:** AIOS Core
**Status:** ✅ Instalado
**Descrição:** Extração de design tokens de websites para criar design systems
**Quando usar:** Criação de design system a partir de site existente
**Ativação:** `/AIOS:skills:design-system-extractor`
**Documentação:** `.aios/skills/design-system-extractor/INDEX.md`

**Features:**
- Análise de websites via WebFetch
- Extração de tokens (colors, typography, spacing, shadows, borders)
- Geração de package TypeScript production-ready
- Build tools (Vite, TypeScript, Vitest, ESLint)

---

### Productivity

#### obsidian-tag-manager
**Origem:** AIOS Local
**Status:** ✅ Instalado
**Descrição:** Gerenciamento avançado de tags em Obsidian vault
**Quando usar:** Organização e gerenciamento de tags Obsidian
**Documentação:** `.aios/skills/obsidian-tag-manager/skill.md`

---

## 🔄 Skills Planejadas para Instalação

### 🟢 Prioridade Baixa (Phase 3 - Conforme necessidade)

5. **using-git-worktrees** (superpowers)
   - Desenvolvimento paralelo em múltiplas branches
   - Workflow avançado

6. **PDF processing** (anthropics/skills)
   - Completar suite de document processing
   - Extração e manipulação de PDFs

---

## 📊 Estatísticas

- **Total instalado:** 12 skills
- **Superpowers collection:** 8 skills (Phase 1: 4, Phase 2: 4)
- **Document processing:** 3 skills
- **Design & Development:** 1 skill
- **Productivity:** 1 skill (local)

---

## 🔗 Quick Links

### Documentação
- **Superpowers README:** `.aios/skills/superpowers/README.md`
- **Installation Report:** `/docs/analysis/skills-installation-report.md`
- **AIOS Constitution:** `.aios-core/constitution.md`

### Repositórios Fonte
- **Superpowers:** https://github.com/obra/superpowers
- **Anthropic Skills:** https://github.com/anthropics/skills

### Skill Creation
- **Skill Creator:** `/skill-creator`
- **Template:** Disponível via skill-creator

---

## 💡 Como Usar Skills

### Ativação Automática
A maioria das skills é ativada automaticamente quando o contexto é relevante:
- `test-driven-development` → ao implementar código
- `verification-before-completion` → antes de claims de conclusão
- `receiving-code-review` → ao processar feedback

### Ativação Manual
Algumas skills requerem ativação explícita:
- `design-system-extractor` → `/AIOS:skills:design-system-extractor`
- `requesting-code-review` → Mencionar necessidade de review

### Referência em Conversa
Você pode referenciar skills diretamente:
```
"Using test-driven-development skill to implement this feature..."
"Following verification-before-completion protocol before marking as done..."
```

---

## 🛠️ Manutenção

### Atualizar Skills
```bash
# Superpowers skills
cd /tmp/superpowers
git pull
cp -r skills/* /path/to/aios/.aios/skills/superpowers/
```

### Validar Instalação
```bash
npx aios-core doctor
```

### Adicionar Nova Skill
1. Copiar para `.aios/skills/{category}/{skill-name}/`
2. Garantir que existe `SKILL.md` ou `skill.md`
3. Atualizar este índice
4. Rodar `npx aios-core doctor`

---

**Mantido por:** AIOS Core Team
**Última revisão:** 2026-02-05
**Última instalação:** 2026-02-05 (Phase 2 - 4 skills)
