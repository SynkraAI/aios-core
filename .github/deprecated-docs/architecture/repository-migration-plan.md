# Plano de Migração Detalhado: Estrutura de Repositórios AIOS

**Data:** 2025-11-12  
**Autor:** DevOps (GitHub Repository Manager)  
**Status:** 📋 Pronto para Execução  
**Estimativa Total:** 3-4 semanas

---

## 🎯 Objetivo

Migrar `aios-fullstack` para estrutura open-source com expansion-packs separados, seguindo decisões estratégicas confirmadas.

---

## 📋 Checklist de Execução

### Fase 1: Preparação e Limpeza (Semana 1)

#### 1.1. Limpeza de Expansion-Packs ✅ DECIDIDO

**Tarefas:**
- [ ] **1.1.1** Criar backup completo do `expansion-packs/` atual
- [ ] **1.1.2** Identificar e listar todos os arquivos dos packs privados:
  - innerlens/
  - mmos-mapper/
  - aios-infrastructure-devops/
  - meeting-notes/
- [ ] **1.1.3** Verificar dependências entre packs (se algum pack privado depende de ETL/expansion-creator)
- [ ] **1.1.4** Documentar estrutura atual de `expansion-packs/`

**Arquivos a Manter (Open-Source):**
- ✅ `expansion-packs/etl/` - OPEN-SOURCE (tool público)
- ✅ `expansion-packs/expansion-creator/` - OPEN-SOURCE (comunidade cria packs)

**Arquivos a Remover (Mover para Repo Privado):**
- ❌ `expansion-packs/creator/` - PRIVADO (CreatorOS)
- ❌ `expansion-packs/innerlens/`
- ❌ `expansion-packs/mmos-mapper/`
- ❌ `expansion-packs/aios-infrastructure-devops/`
- ❌ `expansion-packs/meeting-notes/`

**Comandos:**
```bash
# Backup
cp -r expansion-packs expansion-packs.backup-$(date +%Y%m%d)

# Listar estrutura
find expansion-packs -type f | sort > expansion-packs-inventory.txt
```

---

#### 1.2. Limpeza de Workspaces ✅ DECIDIDO

**Tarefas:**
- [ ] **1.2.1** Verificar `package.json` para workspaces listados
- [ ] **1.2.2** Remover workspaces deletados de `package.json`:
  - security
  - performance
  - telemetry
- [x] **1.2.3** Marcar `memory/` como deprecated ✅ DECIDIDO
- [ ] **1.2.4** Criar arquivo `memory/DEPRECATED.md` explicando status
- [ ] **1.2.5** Atualizar `.gitignore` se necessário
- [ ] **1.2.5** Verificar referências a workspaces em código

**Arquivo:** `package.json` (linha 14-20)

**Status Atual:**
```json
"workspaces": [
  "aios-core",
  "memory",        // ⚠️ Existe mas não funciona
  "security",      // ❌ Deletado
  "performance",  // ❌ Deletado
  "telemetry"     // ❌ Deletado
]
```

**Ação:**
```json
"workspaces": [
  "aios-core"
  // memory/ removido (não funciona)
  // security/, performance/, telemetry/ já deletados
]
```

---

#### 1.3. Identificação de Ferramentas Internas vs Públicas

**Tarefas:**
- [ ] **1.3.1** Analisar `tools/` directory:
  - [ ] Identificar ferramentas públicas (installer, builders)
  - [ ] Identificar ferramentas internas (analyzers, scripts de desenvolvimento)
- [ ] **1.3.2** Analisar `scripts/` directory:
  - [ ] Listar scripts de desenvolvimento
  - [ ] Identificar scripts de análise
- [ ] **1.3.3** Criar lista de arquivos para mover para `aios-dev-tools`

**Ferramentas Públicas (Manter em `aios-fullstack`):**
- ✅ `tools/installer/` - Instalador público
- ✅ `tools/builders/` - Builders públicos
- ✅ `tools/cli.js` - CLI público
- ✅ `tools/package-builder.js` - Builder de pacotes público

**Ferramentas Internas (Mover para `aios-dev-tools`):**
- ❌ Scripts de análise (`analyze-*.js`)
- ❌ Scripts de consolidação (`consolidate-*.js`)
- ❌ Scripts de extração (`extract-*.js`)
- ❌ Scripts de geração (`generate-*.js`)
- ❌ Scripts de meta-análise (`meta-analyze.js`)

---

#### 1.4. Preparação Legal (MIT License)

**Tarefas:**
- [ ] **1.4.1** Criar novo arquivo `LICENSE` com MIT
- [ ] **1.4.2** Backup do LICENSE atual (`LICENSE.proprietary`)
- [ ] **1.4.3** Verificar headers de copyright em arquivos principais
- [ ] **1.4.4** Adicionar NOTICE.md se necessário (atribuições de terceiros)

**Template MIT License:**
```text
MIT License

Copyright (c) 2025 AllFluence Inc. - AIOS Framework

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

### Fase 2: Criação de Repositórios (Semana 1-2)

#### 2.1. Criar `aios-expansion-packs` (PRIVADO)

**Tarefas:**
- [ ] **2.1.1** Criar novo repositório no GitHub (privado)
- [ ] **2.1.2** Configurar estrutura inicial:
  ```
aios-expansion-packs/
├── README.md
├── LICENSE (PROPRIETARY)
├── creator/              # CreatorOS (PRIVADO)
├── innerlens/
├── mmos-mapper/
├── aios-infrastructure-devops/
├── meeting-notes/
└── hybrid-ops/
  ```
- [ ] **2.1.3** Configurar CI/CD básico
- [ ] **2.1.4** Criar `.gitignore` apropriado

**README.md Template:**
```markdown
# AIOS Expansion Packs (Private)

Expansion packs proprietários do AIOS Framework.

## Packs Disponíveis

- **creator** - CreatorOS - Content generation and creation workflows (PRIVADO)
- **innerlens** - Personality analysis and psychometric profiling
- **mmos-mapper** - Cognitive architecture mapping and AI personality cloning
- **aios-infrastructure-devops** - Infrastructure and DevOps automation
- **meeting-notes** - Meeting organization and note-taking
- **hybrid-ops** - Hybrid operations expansion pack

## Instalação

[Instruções de instalação privada]

## Licença

PROPRIETARY - All Rights Reserved
```

---

#### 2.2. Criar `aios-dev-tools` (PRIVADO)

**Tarefas:**
- [ ] **2.2.1** Criar novo repositório no GitHub (privado)
- [ ] **2.2.2** Configurar estrutura inicial:
  ```
  aios-dev-tools/
  ├── README.md
  ├── LICENSE (PROPRIETARY)
  ├── scripts/
  │   ├── analyzers/
  │   ├── consolidators/
  │   └── generators/
  ├── tools/
  └── workflows/
  ```
- [ ] **2.2.3** Configurar CI/CD básico
- [ ] **2.2.4** Criar `.gitignore` apropriado

---

#### 2.3. Configurar Governança de PRs

**Tarefas:**
- [ ] **2.3.1** Configurar branch protection no `aios-fullstack`:
  - Require PR reviews
  - Require PO approval for expansion-packs/creator PRs
  - Require status checks
- [ ] **2.3.2** Criar GitHub templates:
  - `expansion-pack-proposal.md` - Template para novos packs via expansion-creator
  - `expansion-pack-pr.md` - Template para PRs de packs
- [ ] **2.3.3** Configurar labels:
  - `expansion-pack`
  - `needs-po-review`
  - `approved`

---

### Fase 3: Migração de Arquivos (Semana 2-3)

#### 3.1. Migrar Expansion-Packs Privados

**Tarefas:**
- [ ] **3.1.1** Clonar `aios-expansion-packs` localmente
- [ ] **3.1.2** Copiar packs privados:
  ```bash
  cp -r aios-fullstack/expansion-packs/creator aios-expansion-packs/
  cp -r aios-fullstack/expansion-packs/innerlens aios-expansion-packs/
  cp -r aios-fullstack/expansion-packs/mmos-mapper aios-expansion-packs/
  cp -r aios-fullstack/expansion-packs/aios-infrastructure-devops aios-expansion-packs/
  cp -r aios-fullstack/expansion-packs/meeting-notes aios-expansion-packs/
  ```
- [ ] **3.1.3** Adicionar hybrid-ops (já está em repo separado, copiar ou referenciar)
- [ ] **3.1.4** Commit inicial no `aios-expansion-packs`
- [ ] **3.1.5** Push para repositório remoto

---

#### 3.2. Remover Expansion-Packs Privados do `aios-fullstack`

**Tarefas:**
- [ ] **3.2.1** Remover diretórios privados:
  ```bash
  rm -rf expansion-packs/creator
  rm -rf expansion-packs/innerlens
  rm -rf expansion-packs/mmos-mapper
  rm -rf expansion-packs/aios-infrastructure-devops
  rm -rf expansion-packs/meeting-notes
  ```
- [ ] **3.2.2** Atualizar `expansion-packs/README.md`:
  - Remover referências a packs privados
  - Adicionar seção sobre packs externos
  - Documentar processo de PR para expansion-creator
- [ ] **3.2.3** Verificar e atualizar referências em código:
  - `package.json`
  - `core-config.yaml`
  - Documentação
- [ ] **3.2.4** Commit: "Remove private expansion-packs (moved to aios-expansion-packs)"

---

#### 3.3. Migrar Ferramentas Internas

**Tarefas:**
- [ ] **3.3.1** Clonar `aios-dev-tools` localmente
- [ ] **3.3.2** Mover scripts de análise:
  ```bash
  mkdir -p aios-dev-tools/scripts/analyzers
  mv aios-fullstack/analyze-*.js aios-dev-tools/scripts/analyzers/
  ```
- [ ] **3.3.3** Mover scripts de consolidação:
  ```bash
  mkdir -p aios-dev-tools/scripts/consolidators
  mv aios-fullstack/consolidate-*.js aios-dev-tools/scripts/consolidators/
  ```
- [ ] **3.3.4** Mover outros scripts internos
- [ ] **3.3.5** Commit e push para `aios-dev-tools`
- [ ] **3.3.6** Remover scripts do `aios-fullstack`
- [ ] **3.3.7** Commit: "Remove internal dev tools (moved to aios-dev-tools)"

---

#### 3.4. Atualizar Referências e Documentação

**Tarefas:**
- [ ] **3.4.1** Atualizar `README.md` principal:
  - Explicar nova estrutura de repositórios
  - Documentar expansion-packs open-source (ETL, expansion-creator)
  - Referenciar expansion-packs privados (instalação separada)
- [ ] **3.4.2** Atualizar `CONTRIBUTING.md`:
  - Processo de PR para expansion-creator
  - Guidelines para novos expansion-packs
  - Processo de aprovação (PO)
- [ ] **3.4.3** Criar `docs/expansion-packs/INSTALLATION.md`:
  - Como instalar expansion-packs open-source
  - Como instalar expansion-packs privados (se aplicável)
- [ ] **3.4.4** Atualizar `CHANGELOG.md` com mudanças

---

### Fase 4: Preparação Open-Source (Semana 3)

#### 4.1. Documentação Open-Source

**Tarefas:**
- [ ] **4.1.1** Criar `CONTRIBUTING.md`:
  - Como contribuir
  - Processo de PR
  - Code of conduct
  - Guidelines de código
- [ ] **4.1.2** Criar `CODE_OF_CONDUCT.md`
- [ ] **4.1.3** Criar `.github/` templates:
  - `ISSUE_TEMPLATE/bug_report.md`
  - `ISSUE_TEMPLATE/feature_request.md`
  - `PULL_REQUEST_TEMPLATE.md`
  - `expansion-pack-proposal.md`
- [ ] **4.1.4** Adicionar badges ao README:
  - License (MIT)
  - Version
  - Downloads
  - Stars

---

#### 4.2. Limpeza Final

**Tarefas:**
- [ ] **4.2.1** Buscar por informações sensíveis:
  ```bash
  grep -r "TODO: Remove" .
  grep -r "FIXME: Sensitive" .
  grep -r "API_KEY" .
  grep -r "SECRET" .
  ```
- [ ] **4.2.2** Remover ou sanitizar informações sensíveis
- [ ] **4.2.3** Verificar `.env.example` (se existir)
- [ ] **4.2.4** Limpar histórico de commits se necessário (usar `git filter-branch` ou BFG)
- [ ] **4.2.5** Verificar `.gitignore` está completo

---

#### 4.3. Configuração GitHub

**Tarefas:**
- [ ] **4.3.1** Configurar GitHub Pages para docs (se aplicável)
- [ ] **4.3.2** Configurar branch protection rules:
  - `main` branch protegida
  - Require PR reviews
  - Require status checks
  - Require PO approval for expansion-packs
- [ ] **4.3.3** Configurar GitHub Actions workflows:
  - CI (test, lint, build)
  - Release automation
- [ ] **4.3.4** Configurar dependabot (se aplicável)
- [ ] **4.3.5** Configurar security alerts

---

### Fase 5: Lançamento Open-Source (Semana 4)

#### 5.1. Preparação Final

**Tarefas:**
- [ ] **5.1.1** Executar testes finais:
  ```bash
  npm test
  npm run lint
  npm run build
  ```
- [ ] **5.1.2** Verificar instalação funciona:
  ```bash
  npm pack
  npm install -g aios-fullstack-*.tgz
  ```
- [ ] **5.1.3** Criar release notes para v1.0.0-open-source
- [ ] **5.1.4** Tag release: `v1.0.0-open-source`

---

#### 5.2. Tornar Repositório Público

**Tarefas:**
- [ ] **5.2.1** Backup final antes de tornar público
- [ ] **5.2.2** Tornar repositório público no GitHub
- [ ] **5.2.3** Verificar acesso público funciona
- [ ] **5.2.4** Testar instalação via `npx` funciona

---

#### 5.3. Comunicação

**Tarefas:**
- [ ] **5.3.1** Criar post de anúncio
- [ ] **5.3.2** Publicar em redes sociais/comunidades
- [ ] **5.3.3** Atualizar website/documentação externa
- [ ] **5.3.4** Notificar colaboradores existentes

---

## 🔍 Validação e Testes

### Checklist de Validação

- [ ] Todos os expansion-packs privados removidos do `aios-fullstack`
- [ ] Apenas ETL e expansion-creator permanecem em `expansion-packs/`
- [ ] Workspaces removidos de `package.json`
- [ ] LICENSE atualizado para MIT
- [ ] Nenhuma informação sensível exposta
- [ ] Documentação atualizada
- [ ] Testes passando
- [ ] Build funcionando
- [ ] Instalação via `npx` funciona
- [ ] Repositório público acessível

---

## 📊 Riscos e Mitigações

### Risco 1: Quebra de Dependências
**Probabilidade:** MÉDIA  
**Impacto:** ALTO  
**Mitigação:**
- Criar backup completo antes de migração
- Testar cada etapa isoladamente
- Manter branch de backup até validação completa

### Risco 2: Informações Sensíveis Expostas
**Probabilidade:** BAIXA  
**Impacto:** CRÍTICO  
**Mitigação:**
- Busca abrangente por secrets antes de tornar público
- Revisar histórico de commits
- Usar ferramentas de detecção de secrets (git-secrets, truffleHog)

### Risco 3: Comunidade Confusa com Estrutura
**Probabilidade:** MÉDIA  
**Impacto:** MÉDIO  
**Mitigação:**
- Documentação clara sobre estrutura
- README explicativo
- Guias de contribuição detalhados

---

## 📅 Timeline Estimado

| Fase | Duração | Início | Fim |
|------|---------|--------|-----|
| **Fase 1: Preparação** | 1 semana | Semana 1 | Semana 1 |
| **Fase 2: Criação Repos** | 1 semana | Semana 1-2 | Semana 2 |
| **Fase 3: Migração** | 1 semana | Semana 2 | Semana 3 |
| **Fase 4: Preparação OS** | 1 semana | Semana 3 | Semana 3 |
| **Fase 5: Lançamento** | 3 dias | Semana 4 | Semana 4 |

**Total:** 3-4 semanas

---

## ✅ Critérios de Sucesso

1. ✅ `aios-fullstack` é 100% open-source (MIT)
2. ✅ Expansion-packs privados movidos para repo separado
3. ✅ ETL e expansion-creator disponíveis publicamente
4. ✅ Processo de PR para expansion-creator funcionando
5. ✅ Nenhuma informação sensível exposta
6. ✅ Documentação completa e atualizada
7. ✅ Comunidade pode contribuir facilmente
8. ✅ Instalação via `npx` funciona perfeitamente

---

**Plano criado por:** DevOps (GitHub Repository Manager)  
**Data:** 2025-11-12  
**Status:** 📋 Pronto para Execução

