<!-- Tradução: PT-BR | Original: /docs/en/architecture/utility-integration-guide.md | Sincronização: 2026-01-26 -->

# Guia de Integração de Utilitários

> 🌐 [EN](../../architecture/utility-integration-guide.md) | **PT** | [ES](../../es/architecture/utility-integration-guide.md)

---

**Versão:** 1.0.0
**Criado em:** 2025-10-29
**Autores:** Sarah (@po), Winston (@architect)
**Propósito:** Definir padrões para integração de scripts utilitários no framework AIOS

---

## O que é Integração de Utilitários?

**Definição:** Integração de utilitários é o processo de tornar um script utilitário órfão **descobrível, documentado e utilizável** dentro do framework AIOS.

Um utilitário é considerado **totalmente integrado** quando:
1. ✅ **Registrado** no core-config.yaml
2. ✅ **Referenciado** por pelo menos um agente ou task
3. ✅ **Documentado** com propósito e uso
4. ✅ **Testado** para garantir que carrega sem erros
5. ✅ **Descobrível** através dos mecanismos do framework

---

## Padrões de Integração

### Padrão 1: Utilitário Auxiliar de Agente

**Quando Usar:** Utilitário fornece funções auxiliares que agentes usam diretamente

**Passos de Integração:**
1. Adicionar utilitário ao array `dependencies.utils` do agente alvo
2. Documentar propósito do utilitário no arquivo do agente
3. Registrar no core-config.yaml se ainda não estiver
4. Testar que o agente carrega com sucesso com o utilitário

**Exemplo: util-batch-creator**

```yaml
# .aios-core/agents/dev.yaml
id: dev
name: Agente de Desenvolvimento
dependencies:
  utils:
    - batch-creator  # Cria lotes de tasks relacionadas
    - code-quality-improver
```

**Arquivos Modificados:**
- `.aios-core/agents/{agent}.yaml` (adicionar a dependencies.utils)
- `.aios-core/core-config.yaml` (registrar se necessário)
- `.aios-core/utils/README.md` (documentar utilitário)

---

### Padrão 2: Utilitário de Execução de Task

**Quando Usar:** Utilitário é chamado por uma task durante execução

**Passos de Integração:**
1. Identificar ou criar task que usa o utilitário
2. Adicionar referência do utilitário na seção `execution.utils` da task
3. Documentar como a task usa o utilitário
4. Registrar no core-config.yaml se ainda não estiver
5. Testar execução da task com o utilitário

**Exemplo: util-commit-message-generator**

```yaml
# .aios-core/tasks/generate-commit-message.md
id: generate-commit-message
name: Gerar Mensagem de Commit
execution:
  utils:
    - commit-message-generator  # Utilitário principal para esta task
  steps:
    - Analisar mudanças staged
    - Gerar mensagem de commit semântica usando util
    - Apresentar mensagem ao usuário para aprovação
```

**Arquivos Modificados:**
- `.aios-core/tasks/{task}.md` (adicionar execution.utils)
- `.aios-core/agents/{agent}.yaml` (adicionar task à lista executes)
- `.aios-core/core-config.yaml` (registrar se necessário)
- `.aios-core/utils/README.md` (documentar utilitário)

---

### Padrão 3: Utilitário de Infraestrutura do Framework

**Quando Usar:** Utilitário é usado pelo framework em si, não diretamente por agentes/tasks

**Passos de Integração:**
1. Registrar no core-config.yaml na categoria apropriada
2. Documentar no utils/README.md como "utilitário de framework"
3. Adicionar à documentação do framework
4. Testar que utilitário carrega no contexto do framework

**Exemplo: util-elicitation-engine**

```yaml
# .aios-core/core-config.yaml
utils:
  framework:
    - elicitation-engine  # Usado pelo workflow de criação de agente
    - aios-validator
```

**Arquivos Modificados:**
- `.aios-core/core-config.yaml` (registrar em framework)
- `.aios-core/utils/README.md` (documentar como utilitário de framework)
- Docs do framework (se aplicável)

---

### Padrão 4: Utilitário de Documentação/Análise

**Quando Usar:** Utilitário realiza análise ou geração de documentação

**Passos de Integração:**
1. Adicionar aos utils do agente relevante (geralmente architect, qa, ou agente docs)
2. Criar ou atualizar task que usa o utilitário
3. Documentar formato de análise/saída
4. Registrar no core-config.yaml

**Exemplo: util-documentation-synchronizer**

```yaml
# .aios-core/agents/architect.yaml
dependencies:
  utils:
    - documentation-synchronizer  # Mantém docs sincronizados com código
    - dependency-analyzer
```

**Arquivos Modificados:**
- `.aios-core/agents/{agent}.yaml`
- `.aios-core/tasks/{task}.md` (se criar task)
- `.aios-core/core-config.yaml`
- `.aios-core/utils/README.md`

---

## Workflow de Integração

### Processo Padrão (para todos os padrões):

```
1. ANALISAR
   ├─ Inspecionar código do utilitário para entender propósito
   ├─ Identificar categoria do utilitário (auxiliar, executor, analisador, etc.)
   └─ Determinar padrão de integração apropriado

2. MAPEAR
   ├─ Identificar agente(s) alvo que devem usar o utilitário
   ├─ Identificar ou criar task(s) que chamam o utilitário
   └─ Documentar decisão de mapeamento

3. INTEGRAR
   ├─ Adicionar referência do utilitário aos arquivos de agente/task
   ├─ Registrar no core-config.yaml (se ainda não estiver)
   └─ Documentar no utils/README.md

4. TESTAR
   ├─ Carregar utilitário para verificar que não há erros
   ├─ Carregar agente para verificar que dependência resolve
   ├─ Testar execução da task se aplicável
   └─ Executar detecção de gaps para verificar correção

5. DOCUMENTAR
   ├─ Adicionar descrição do utilitário ao README
   ├─ Documentar padrão de uso
   ├─ Anotar quais agentes/tasks o usam
   └─ Atualizar mapa de arquitetura
```

---

## Categorização de Utilitários

Utilitários devem ser categorizados para facilitar integração:

### Categoria 1: Qualidade de Código
**Propósito:** Analisar, melhorar, validar código
**Padrão:** Auxiliar de Agente (agentes dev, qa)
**Exemplos:** aios-validator, code-quality-improver, coverage-analyzer

### Categoria 2: Git/Workflow
**Propósito:** Operações git, automação de workflow
**Padrão:** Execução de Task (agentes dev, github-devops)
**Exemplos:** commit-message-generator, branch-manager, conflict-resolver

### Categoria 3: Gerenciamento de Componentes
**Propósito:** Gerar, gerenciar, buscar componentes
**Padrão:** Auxiliar de Agente + Execução de Task
**Exemplos:** component-generator, component-search, deprecation-manager

### Categoria 4: Documentação
**Propósito:** Gerar, sincronizar, analisar documentação
**Padrão:** Utilitário de Documentação (agentes architect, docs)
**Exemplos:** documentation-synchronizer, dependency-impact-analyzer

### Categoria 5: Batch/Auxiliares
**Propósito:** Operações em lote, auxiliares do framework
**Padrão:** Varia (Auxiliar de Agente ou Framework)
**Exemplos:** batch-creator, clickup-helpers, elicitation-engine

---

## Requisitos de Teste

### Para Cada Utilitário Integrado:

**1. Teste de Carga**
```javascript
// Verificar que utilitário carrega sem erros
const utility = require('.aios-core/utils/{utility-name}');
// Não deve lançar erro
```

**2. Validação de Referência**
```bash
# Verificar que referências de agente/task são válidas
node outputs/architecture-map/schemas/validate-tool-references.js
```

**3. Detecção de Gap**
```bash
# Verificar que gap foi resolvido
node outputs/architecture-map/schemas/detect-gaps.js
# Deve mostrar 0 gaps para utilitário integrado
```

**4. Teste de Integração** (se aplicável)
```javascript
// Verificar que agente carrega com dependência do utilitário
const agent = loadAgent('agent-name');
// Deve incluir utilitário nas dependências resolvidas
```

---

## Requisitos de Documentação

### Template de Entrada no utils/README.md:

```markdown
### util-{name}

**Propósito:** Descrição breve do que o utilitário faz

**Usado Por:**
- agent-{name} (para {propósito})
- task-{name} (durante {fase})

**Padrão de Integração:** {nome-do-padrão}

**Localização:** `.aios-core/utils/{name}.js`

**Exemplo de Uso:**
\`\`\`javascript
const util = require('./utils/{name}');
// Código de exemplo
\`\`\`
```

---

## Registro no core-config.yaml

### Adicionar utilitário à seção apropriada:

```yaml
utils:
  # Utilitários auxiliares de agente
  helpers:
    - batch-creator
    - code-quality-improver

  # Utilitários de execução de task
  executors:
    - commit-message-generator
    - component-generator

  # Utilitários de infraestrutura do framework
  framework:
    - elicitation-engine
    - aios-validator

  # Utilitários de análise/documentação
  analyzers:
    - documentation-synchronizer
    - dependency-analyzer
```

---

## Critérios de Sucesso

Um utilitário é integrado com sucesso quando:

✅ **Descobrível:**
- Listado no core-config.yaml
- Documentado no utils/README.md
- Referenciado por agente/task

✅ **Funcional:**
- Carrega sem erros
- Agente/task pode usá-lo
- Testes passam

✅ **Validado:**
- Detecção de gap mostra 0 gaps
- Validação de referência passa
- Testes de integração passam

✅ **Documentado:**
- Propósito claramente declarado
- Exemplos de uso fornecidos
- Padrão de integração identificado

---

## Armadilhas Comuns

❌ **Não faça:** Adicionar utilitário ao agente sem entender seu propósito
✅ **Faça:** Inspecionar código primeiro, entender funcionalidade

❌ **Não faça:** Criar nova task se task existente pode usar o utilitário
✅ **Faça:** Estender tasks existentes quando apropriado

❌ **Não faça:** Registrar sem documentar
✅ **Faça:** Sempre adicionar entrada no README

❌ **Não faça:** Pular testes
✅ **Faça:** Verificar que utilitário carrega e resolve

---

## Referência Rápida

| Padrão | Alvo | Arquivos Modificados | Teste |
|--------|------|----------------------|-------|
| Auxiliar de Agente | Agent YAML | agent.yaml, core-config, README | Carregar agente |
| Execução de Task | Task MD + Agent | task.md, agent.yaml, core-config, README | Executar task |
| Framework | Framework | core-config, README, docs | Carregar utilitário |
| Documentação | Architect/Docs | agent.yaml, core-config, README | Detecção de gap |

---

**Versão do Guia:** 1.0.0
**Última Atualização:** 2025-10-29
**Mantenedor:** Winston (@architect)
