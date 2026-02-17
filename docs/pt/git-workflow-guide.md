<!--
  Tradução: PT-BR
  Original: /docs/en/git-workflow-guide.md
  Última sincronização: 2026-01-26
-->

# Guia de Workflow Git do AIOS

> 🌐 [EN](../git-workflow-guide.md) | **PT** | [ES](../es/git-workflow-guide.md)

---

_Story: 2.2-git-workflow-implementation.yaml_

## Índice

- [Visão Geral](#visão-geral)
- [Arquitetura de Defesa em Profundidade](#arquitetura-de-defesa-em-profundidade)
- [Camada 1: Validação Pre-commit](#camada-1-validação-pre-commit)
- [Camada 2: Validação Pre-push](#camada-2-validação-pre-push)
- [Camada 3: Pipeline CI/CD](#camada-3-pipeline-cicd)
- [Proteção de Branch](#proteção-de-branch)
- [Workflow Diário](#workflow-diário)
- [Solução de Problemas](#solução-de-problemas)
- [Dicas de Performance](#dicas-de-performance)

## Visão Geral

O Synkra AIOS implementa uma estratégia de validação de **Defesa em Profundidade** com três camadas progressivas que detectam problemas antecipadamente e garantem a qualidade do código antes do merge.

### Por Que Três Camadas?

1. **Feedback rápido** - Detecta problemas imediatamente durante o desenvolvimento
2. **Validação local** - Sem dependência de cloud para verificações básicas
3. **Validação autoritativa** - Portão final antes do merge
4. **Consistência de stories** - Garante que o desenvolvimento está alinhado com as stories

### Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                     Workflow do Desenvolvedor                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Camada 1: Hook Pre-commit (Local - <5s)                     │
│ ✓ ESLint (qualidade de código)                              │
│ ✓ TypeScript (verificação de tipos)                         │
│ ✓ Cache habilitado                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Camada 2: Hook Pre-push (Local - <2s)                       │
│ ✓ Validação de checkboxes da story                          │
│ ✓ Consistência de status                                    │
│ ✓ Seções obrigatórias                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Camada 3: GitHub Actions CI (Cloud - 2-5min)                │
│ ✓ Todas as verificações de lint/tipos                       │
│ ✓ Suíte completa de testes                                  │
│ ✓ Cobertura de código (≥80%)                                │
│ ✓ Validação de stories                                      │
│ ✓ Proteção de branch                                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                      ┌──────────────┐
                      │ Pronto para  │
                      │    Merge     │
                      └──────────────┘
```

## Arquitetura de Defesa em Profundidade

### Camada 1: Pre-commit (Local - Rápido)

**Meta de Performance:** <5 segundos
**Gatilho:** `git commit`
**Localização:** `.husky/pre-commit`

**O que valida:**

- Qualidade de código ESLint
- Verificação de tipos TypeScript
- Erros de sintaxe
- Problemas de importação

**Como funciona:**

```bash
# Acionado automaticamente no commit
git add .
git commit -m "feat: add feature"

# Executa:
# 1. ESLint com cache (.eslintcache)
# 2. Compilação incremental TypeScript (.tsbuildinfo)
```

**Benefícios:**

- ⚡ Feedback rápido (<5s)
- 💾 Cache para velocidade
- 🔒 Previne commits de código quebrado
- 🚫 Sem sintaxe inválida no histórico

### Camada 2: Pre-push (Local - Validação de Stories)

**Meta de Performance:** <2 segundos
**Gatilho:** `git push`
**Localização:** `.husky/pre-push`

**O que valida:**

- Completude de checkboxes da story vs status
- Seções obrigatórias da story presentes
- Consistência de status
- Registros do dev agent

**Como funciona:**

```bash
# Acionado automaticamente no push
git push origin feature/my-feature

# Valida todos os arquivos de story em docs/stories/
```

**Regras de Validação:**

1. **Consistência de Status:**

```yaml
# ❌ Inválido: completada mas tarefas incompletas
status: "completed"
tasks:
  - "[x] Task 1"
  - "[ ] Task 2"  # Erro!

# ✅ Válido: todas as tarefas completadas
status: "completed"
tasks:
  - "[x] Task 1"
  - "[x] Task 2"
```

2. **Seções Obrigatórias:**

- `id`
- `title`
- `description`
- `acceptance_criteria`
- `status`

3. **Fluxo de Status:**

```
ready → in progress → Ready for Review → completed
```

### Camada 3: CI/CD (Cloud - Autoritativo)

**Performance:** 2-5 minutos
**Gatilho:** Push para qualquer branch, criação de PR
**Plataforma:** GitHub Actions
**Localização:** `.github/workflows/ci.yml`

**Jobs:**

1. **ESLint** (job `lint`)
   - Executa em ambiente limpo
   - Sem dependência de cache

2. **TypeScript** (job `typecheck`)
   - Verificação completa de tipos
   - Sem compilação incremental

3. **Testes** (job `test`)
   - Suíte completa de testes
   - Relatório de cobertura
   - Limite de 80% obrigatório

4. **Validação de Stories** (job `story-validation`)
   - Todas as stories validadas
   - Consistência de status verificada

5. **Resumo de Validação** (job `validation-summary`)
   - Agrega todos os resultados
   - Bloqueia merge se algum falhar

**Monitoramento de Performance:**

- Job de performance opcional
- Mede tempos de validação
- Apenas informativo

## Camada 1: Validação Pre-commit

### Referência Rápida

```bash
# Validação manual
npm run lint
npm run typecheck

# Auto-corrigir problemas de lint
npm run lint -- --fix

# Pular hook (NÃO recomendado)
git commit --no-verify
```

### Configuração do ESLint

**Arquivo:** `.eslintrc.json`

```json
{
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "cache": true,
  "cacheLocation": ".eslintcache"
}
```

**Recursos principais:**

- Suporte a TypeScript
- Cache habilitado
- Avisa sobre console.log
- Ignora variáveis não usadas com prefixo `_`

### Configuração do TypeScript

**Arquivo:** `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "strict": true,
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo"
  }
}
```

**Recursos principais:**

- Target ES2022
- Modo strict
- Compilação incremental
- Módulos CommonJS

### Otimização de Performance

**Arquivos de Cache:**

- `.eslintcache` - Resultados do ESLint
- `.tsbuildinfo` - Dados incrementais do TypeScript

**Primeira execução:** ~10-15s (sem cache)
**Execuções subsequentes:** <5s (com cache)

**Invalidação de cache:**

- Mudanças de configuração
- Atualizações de dependências
- Exclusão de arquivos

## Camada 2: Validação Pre-push

### Referência Rápida

```bash
# Validação manual
node .aios-core/utils/aios-validator.js pre-push
node .aios-core/utils/aios-validator.js stories

# Validar story única
node .aios-core/utils/aios-validator.js story docs/stories/1.1-story.yaml

# Pular hook (NÃO recomendado)
git push --no-verify
```

### Validador de Stories

**Localização:** `.aios-core/utils/aios-validator.js`

**Recursos:**

- Saída colorida no terminal
- Indicadores de progresso
- Mensagens de erro claras
- Avisos para problemas potenciais

**Exemplo de Saída:**

```
══════════════════════════════════════════════════════════
  Validação de Story: 2.2-git-workflow-implementation.yaml
══════════════════════════════════════════════════════════

Story: 2.2 - Git Workflow com Validação Multi-Camada
Status: in progress

Progresso: 12/15 tarefas (80.0%)

✓ Validação de story passou com avisos

Aviso:
  • Considere atualizar o status para 'Ready for Review'
```

### Regras de Validação

#### 1. Formato de Checkbox

Formatos suportados:

- `[x]` - Completado (minúsculo)
- `[X]` - Completado (maiúsculo)
- `[ ]` - Incompleto

Não reconhecidos:

- `[o]`, `[*]`, `[-]` - Não contam como completos

#### 2. Consistência de Status

| Status             | Regra                             |
| ------------------ | --------------------------------- |
| `ready`            | Nenhuma tarefa deve estar marcada |
| `in progress`      | Algumas tarefas marcadas          |
| `Ready for Review` | Todas as tarefas marcadas         |
| `completed`        | Todas as tarefas marcadas         |

#### 3. Seções Obrigatórias

Todas as stories devem ter:

```yaml
id: "X.X"
title: "Título da Story"
description: "Descrição da story"
status: "ready" | "in progress" | "Ready for Review" | "completed"
acceptance_criteria:
  - name: "Critério"
    tasks:
      - "[ ] Tarefa"
```

#### 4. Registro do Dev Agent

Recomendado mas não obrigatório:

```yaml
dev_agent_record:
  agent_model: 'claude-sonnet-4-5'
  implementation_date: '2025-01-23'
```

Aviso se ausente.

### Mensagens de Erro

**Seções Obrigatórias Ausentes:**

```
✗ Seções obrigatórias ausentes: description, acceptance_criteria
```

**Inconsistência de Status:**

```
✗ Story marcada como completed mas apenas 12/15 tarefas estão marcadas
```

**Arquivo Inexistente:**

```
✗ Arquivo de story não encontrado: docs/stories/missing.yaml
```

## Camada 3: Pipeline CI/CD

### Estrutura do Workflow

**Arquivo:** `.github/workflows/ci.yml`

**Jobs:**

1. **lint** - Validação ESLint
2. **typecheck** - Verificação TypeScript
3. **test** - Testes Jest com cobertura
4. **story-validation** - Consistência de stories
5. **validation-summary** - Agregação de resultados
6. **performance** (opcional) - Métricas de performance

### Detalhes dos Jobs

#### Job ESLint

```yaml
- name: Run ESLint
  run: npm run lint
```

- Executa no Ubuntu mais recente
- Timeout: 5 minutos
- Usa cache npm
- Falha em qualquer erro de lint

#### Job TypeScript

```yaml
- name: Run TypeScript type checking
  run: npm run typecheck
```

- Executa no Ubuntu mais recente
- Timeout: 5 minutos
- Falha em erros de tipo

#### Job de Testes

```yaml
- name: Run tests with coverage
  run: npm run test:coverage
```

- Executa no Ubuntu mais recente
- Timeout: 10 minutos
- Cobertura enviada ao Codecov
- Limite de 80% de cobertura obrigatório

#### Job de Validação de Stories

```yaml
- name: Validate story checkboxes
  run: node .aios-core/utils/aios-validator.js stories
```

- Executa no Ubuntu mais recente
- Timeout: 5 minutos
- Valida todas as stories

#### Job de Resumo de Validação

```yaml
needs: [lint, typecheck, test, story-validation]
if: always()
```

- Executa após todas as validações
- Verifica status de todos os jobs
- Falha se qualquer validação falhou
- Fornece resumo

### Gatilhos do CI

**Eventos de Push:**

- Branch `master`
- Branch `develop`
- Branches `feature/**`
- Branches `bugfix/**`

**Eventos de Pull Request:**

- Contra `master`
- Contra `develop`

### Visualizando Resultados do CI

```bash
# Ver checks do PR
gh pr checks

# Ver execuções do workflow
gh run list

# Ver execução específica
gh run view <run-id>

# Re-executar jobs que falharam
gh run rerun <run-id>
```

## Proteção de Branch

### Configuração

```bash
# Executar script de setup
node scripts/setup-branch-protection.js

# Ver proteção atual
node scripts/setup-branch-protection.js --status
```

### Requisitos

- GitHub CLI (`gh`) instalado
- Autenticado no GitHub
- Acesso de admin ao repositório

### Regras de Proteção

**Proteção do Branch Master:**

1. **Checks de Status Obrigatórios:**
   - ESLint
   - TypeScript Type Checking
   - Jest Tests
   - Story Checkbox Validation

2. **Revisões de Pull Request:**
   - 1 aprovação obrigatória
   - Descarta revisões obsoletas em novos commits

3. **Regras Adicionais:**
   - Histórico linear obrigatório (apenas rebase)
   - Force pushes bloqueados
   - Exclusão de branch bloqueada
   - Regras se aplicam a administradores

### Configuração Manual

Via GitHub CLI:

```bash
# Definir checks de status obrigatórios
gh api repos/OWNER/REPO/branches/master/protection/required_status_checks \
  -X PUT \
  -f strict=true \
  -f contexts[]="ESLint" \
  -f contexts[]="TypeScript Type Checking"

# Exigir revisões de PR
gh api repos/OWNER/REPO/branches/master/protection/required_pull_request_reviews \
  -X PUT \
  -f required_approving_review_count=1

# Bloquear force pushes
gh api repos/OWNER/REPO/branches/master/protection/allow_force_pushes \
  -X DELETE
```

## Workflow Diário

### Iniciando uma Nova Feature

```bash
# 1. Atualizar master
git checkout master
git pull origin master

# 2. Criar branch de feature
git checkout -b feature/my-feature

# 3. Fazer alterações
# ... editar arquivos ...

# 4. Commit (aciona pre-commit)
git add .
git commit -m "feat: add my feature [Story X.X]"

# 5. Push (aciona pre-push)
git push origin feature/my-feature

# 6. Criar PR
gh pr create --title "feat: Add my feature" --body "Descrição"
```

### Atualizando uma Story

```bash
# 1. Abrir arquivo da story
code docs/stories/X.X-story.yaml

# 2. Marcar tarefas como completas
# Mudar: - "[ ] Tarefa"
# Para:  - "[x] Tarefa"

# 3. Atualizar status se necessário
# Mudar: status: "in progress"
# Para:  status: "Ready for Review"

# 4. Commit das atualizações da story
git add docs/stories/X.X-story.yaml
git commit -m "docs: update story X.X progress"

# 5. Push (valida story)
git push
```

### Corrigindo Falhas de Validação

**Erros de ESLint:**

```bash
# Auto-corrigir problemas
npm run lint -- --fix

# Verificar problemas restantes
npm run lint

# Commit das correções
git add .
git commit -m "style: fix lint issues"
```

**Erros de TypeScript:**

```bash
# Ver todos os erros
npm run typecheck

# Corrigir erros no código
# ... editar arquivos ...

# Verificar correção
npm run typecheck

# Commit das correções
git add .
git commit -m "fix: resolve type errors"
```

**Erros de Validação de Stories:**

```bash
# Verificar stories
node .aios-core/utils/aios-validator.js stories

# Corrigir arquivo da story
code docs/stories/X.X-story.yaml

# Verificar correção
node .aios-core/utils/aios-validator.js story docs/stories/X.X-story.yaml

# Commit da correção
git add docs/stories/
git commit -m "docs: fix story validation"
```

**Falhas de Testes:**

```bash
# Executar testes
npm test

# Executar teste específico
npm test -- path/to/test.js

# Corrigir testes que falharam
# ... editar arquivos de teste ...

# Executar com cobertura
npm run test:coverage

# Commit das correções
git add .
git commit -m "test: fix failing tests"
```

### Fazendo Merge de um Pull Request

```bash
# 1. Garantir que CI passou
gh pr checks

# 2. Obter aprovação
# (Aguardar revisão de membro do time)

# 3. Merge (squash)
gh pr merge --squash --delete-branch

# 4. Atualizar master local
git checkout master
git pull origin master
```

## Solução de Problemas

### Hook Não Está Executando

**Sintomas:** Commit funciona sem validação

**Soluções:**

1. Verificar instalação do Husky:

```bash
npm run prepare
```

2. Verificar se arquivos de hook existem:

```bash
ls -la .husky/pre-commit
ls -la .husky/pre-push
```

3. Verificar permissões de arquivo (Unix):

```bash
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
```

### Hook Pre-commit Lento

**Sintomas:** Pre-commit leva >10 segundos

**Soluções:**

1. Limpar caches:

```bash
rm .eslintcache .tsbuildinfo
git commit  # Reconstrói cache
```

2. Verificar mudanças de arquivos:

```bash
git status
# Commit de menos arquivos por vez
```

3. Atualizar dependências:

```bash
npm update
```

### Validação de Story Falha

**Sintoma:** Pre-push falha com erros de story

**Problemas Comuns:**

1. **Incompatibilidade de checkbox:**

```yaml
# Erro: Status completed mas tarefas incompletas
status: 'completed'
tasks:
  - '[x] Task 1'
  - '[ ] Task 2' # ← Corrigir isto


# Solução: Completar todas as tarefas ou mudar status
```

2. **Seções ausentes:**

```yaml
# Erro: Seções obrigatórias ausentes
id: '1.1'
title: 'Story'
# Faltando: description, acceptance_criteria, status

# Solução: Adicionar seções faltantes
```

3. **YAML inválido:**

```yaml
# Erro: Sintaxe YAML inválida
tasks:
  - "[ ] Task 1
  - "[ ] Task 2"  # ← Aspas de fechamento faltando acima

# Solução: Corrigir sintaxe YAML
```

### CI Falha mas Local Passa

**Sintomas:** CI falha mas todas as validações locais passam

**Causas Comuns:**

1. **Diferenças de cache:**

```bash
# Limpar caches locais
rm -rf node_modules .eslintcache .tsbuildinfo coverage/
npm ci
npm test
```

2. **Diferenças de ambiente:**

```bash
# Usar mesma versão de Node que o CI (18)
nvm use 18
npm test
```

3. **Arquivos não commitados:**

```bash
# Verificar mudanças não commitadas
git status

# Stash se necessário
git stash
```

### Proteção de Branch Bloqueia Merge

**Sintomas:** Não consegue fazer merge do PR mesmo com aprovações

**Verificar:**

1. **Checks obrigatórios passaram:**

```bash
gh pr checks
# Todos devem mostrar ✓
```

2. **Aprovações obrigatórias:**

```bash
gh pr view
# Verificar seção "Reviewers"
```

3. **Branch está atualizado:**

```bash
# Atualizar branch
git checkout feature-branch
git rebase master
git push --force-with-lease
```

## Dicas de Performance

### Gerenciamento de Cache

**Manter caches:**

- `.eslintcache` - Resultados do ESLint
- `.tsbuildinfo` - Info de build do TypeScript
- `coverage/` - Dados de cobertura de testes

**Adicionar ao .gitignore:**

```gitignore
.eslintcache
.tsbuildinfo
coverage/
```

### Desenvolvimento Incremental

**Melhores Práticas:**

1. **Commits pequenos:**
   - Menos arquivos = validação mais rápida
   - Mais fácil de debugar falhas

2. **Testar durante desenvolvimento:**

```bash
# Executar validação manualmente antes do commit
npm run lint
npm run typecheck
npm test
```

3. **Corrigir problemas imediatamente:**
   - Não deixe problemas acumularem
   - Mais fácil de corrigir no contexto

### Otimização do CI

**Otimizações do workflow:**

1. **Jobs paralelos** - Todas as validações executam em paralelo
2. **Timeouts de jobs** - Falha rápida em travamentos
3. **Cache** - Dependências npm em cache
4. **Jobs condicionais** - Job de performance apenas em PRs

### Performance de Validação de Stories

**Performance Atual:**

- Story única: <100ms
- Todas as stories: <2s (típico)

**Dicas de otimização:**

1. **Mantenha stories focadas** - Uma feature por story
2. **Limite contagem de tarefas** - Quebre stories grandes em menores
3. **YAML válido** - Erros de parsing atrasam validação

## Tópicos Avançados

### Pulando Validações

**Quando apropriado:**

- Hotfixes de emergência
- Mudanças apenas de documentação
- Mudanças de configuração do CI

**Como pular:**

```bash
# Pular pre-commit
git commit --no-verify

# Pular pre-push
git push --no-verify

# Pular CI (não recomendado)
# Adicione [skip ci] na mensagem de commit
git commit -m "docs: update [skip ci]"
```

**Aviso:** Pule apenas quando absolutamente necessário. Validações puladas não detectam problemas.

### Validação Customizada

**Adicionar validadores customizados:**

1. **Criar função de validação:**

```javascript
// .aios-core/utils/custom-validator.js
module.exports = async function validateCustom() {
  // Sua lógica de validação
  return { success: true, errors: [] };
};
```

2. **Adicionar ao hook:**

```bash
# .husky/pre-commit
node .aios-core/utils/aios-validator.js pre-commit
node .aios-core/utils/custom-validator.js
```

3. **Adicionar ao CI:**

```yaml
# .github/workflows/ci.yml
- name: Custom validation
  run: node .aios-core/utils/custom-validator.js
```

### Suporte a Monorepo

**Para monorepos:**

1. **Escopar validações:**

```javascript
// Validar apenas pacotes alterados
const changedFiles = execSync('git diff --name-only HEAD~1').toString();
const packages = getAffectedPackages(changedFiles);
```

2. **Validação paralela de pacotes:**

```yaml
strategy:
  matrix:
    package: [package-a, package-b, package-c]
```

## Referências

- **AIOS Validator:** [.aios-core/utils/aios-validator.js](../../.aios-core/utils/aios-validator.js)
- **CI Workflow:** [.github/workflows/ci.yml](../../.github/workflows/ci.yml)

---

**Dúvidas? Problemas?**

- [Abra uma Issue](https://github.com/SynkraAI/aios-core/issues)
- [Entre no Discord](https://discord.gg/gk8jAdXWmj)
