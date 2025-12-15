# Análise de Consolidação de Scripts - Sistema de Greeting

**Data:** 2025-01-17  
**Arquiteto:** Aria (Architect)  
**Objetivo:** Identificar duplicações, scripts obsoletos e oportunidades de merge antes de criar novos arquivos

---

## 📊 Inventário de Scripts Relacionados

### Scripts de Carregamento de Agente

| Script | Propósito | Status | Ação |
|--------|-----------|--------|------|
| `agent-config-loader.js` | Carrega configuração do agente (core-config.yaml sections) | ✅ Manter | **Expandir** para incluir definição completa |
| `config-loader.js` | Carrega configuração geral (legado?) | ⚠️ Duplicado | **Merge** com agent-config-loader |
| `dev-context-loader.js` | Carrega contexto específico do @dev | ✅ Manter | Específico, não duplicado |
| `session-context-loader.js` | Carrega contexto de sessão multi-agente | ✅ Manter | Core functionality |
| `agent-assignment-resolver.js` | Resolve TODOs em tasks | ✅ Manter | Diferente propósito |

### Scripts de Greeting

| Script | Propósito | Status | Ação |
|--------|-----------|--------|------|
| `greeting-builder.js` | Constrói greeting contextual | ✅ Manter | Core functionality |
| `greeting-preference-manager.js` | Gerencia preferências de greeting | ✅ Manter | Core functionality |
| `greeting-config-cli.js` | CLI para gerenciar preferências | ✅ Manter | Interface CLI útil |

### Scripts de Migração/Batch (TEMPORÁRIOS)

| Script | Propósito | Status | Ação |
|--------|-----------|--------|------|
| `batch-integrate-greeting-builder.js` | Batch update agents (Story 6.1.2.5) | ❌ **DELETAR** | Migração concluída |
| `apply-inline-greeting-all-agents.js` | Aplica greeting inline (Story 6.1.2.5-T1) | ❌ **DELETAR** | Migração concluída |
| `update-activation-instructions.js` | Atualiza STEP 3 dos agentes | ❌ **DELETAR** | Migração concluída |
| `batch-update-agents-session-context.js` | Batch update session context | ❌ **DELETAR** | Migração concluída |

### Scripts de Contexto/Status

| Script | Propósito | Status | Ação |
|--------|-----------|--------|------|
| `context-detector.js` | Detecta tipo de sessão | ✅ Manter | Core functionality |
| `project-status-loader.js` | Carrega status do projeto (git) | ✅ Manter | Core functionality |
| `git-config-detector.js` | Detecta configuração git | ✅ Manter | Core functionality |
| `workflow-navigator.js` | Navega workflows | ✅ Manter | Core functionality |

### Scripts de Teste

| Script | Propósito | Status | Ação |
|--------|-----------|--------|------|
| `test-greeting-system.js` | Testa sistema de greeting | ✅ Manter | Testes úteis |

---

## 🔍 Análise Detalhada

### 1. DUPLICAÇÃO: `config-loader.js` vs `agent-config-loader.js`

**Problema Identificado:**

**`config-loader.js` (Legado):**
```javascript
async function loadAgentConfig(agentId) {
  // Carrega seções do core-config.yaml baseado em agentRequirements
  const requiredSections = agentRequirements[agentId] || ALWAYS_LOADED;
  const config = await loadConfigSections(requiredSections);
  return config;
}
```

**`agent-config-loader.js` (Novo - Story 6.1.2.6):**
```javascript
class AgentConfigLoader {
  async load(coreConfig, options = {}) {
    // Carrega seções do core-config.yaml baseado em requirements
    // + arquivos adicionais com lazy loading
    // + performance tracking
    return { config, files, loadTime, ... };
  }
}
```

**Análise:**
- ✅ `agent-config-loader.js` é mais completo (lazy loading, performance tracking)
- ⚠️ `config-loader.js` é mais simples mas ainda usado
- ❌ **DUPLICAÇÃO**: Ambos fazem mesma coisa básica

**Decisão:** 
- ✅ **Manter `agent-config-loader.js`** (mais completo)
- ❌ **Deprecar `config-loader.js`** (marcar como deprecated, migrar usos)

**Ação:**
1. Verificar onde `config-loader.js` é usado
2. Migrar para `agent-config-loader.js`
3. Marcar `config-loader.js` como deprecated
4. Deletar após migração completa

---

### 2. EXPANSÃO: `agent-config-loader.js` precisa carregar definição completa

**Problema Identificado:**

`agent-config-loader.js` atualmente:
- ✅ Carrega configuração (core-config.yaml sections)
- ✅ Carrega arquivos adicionais (lazy loading)
- ❌ **NÃO carrega definição completa do agente** (agent.name, agent.icon, persona_profile, commands)

**Solução Proposta:**

**Expandir `agent-config-loader.js`** para incluir método de carregar definição completa:

```javascript
class AgentConfigLoader {
  // ... métodos existentes ...
  
  /**
   * Load complete agent definition from markdown file
   * @param {Object} options - Load options
   * @returns {Promise<Object>} Complete agent definition (agent, persona_profile, commands, etc.)
   */
  async loadAgentDefinition(options = {}) {
    const agentPath = path.join(process.cwd(), '.aios-core', 'agents', `${this.agentId}.md`);
    
    try {
      const content = await fs.readFile(agentPath, 'utf8');
      
      // Extract YAML block
      const yamlMatch = content.match(/```ya?ml\n([\s\S]*?)\n```/);
      if (!yamlMatch) {
        throw new Error(`No YAML block found in ${this.agentId}.md`);
      }
      
      const agentDef = yaml.load(yamlMatch[1]);
      
      // Validate structure
      if (!agentDef.agent || !agentDef.agent.id) {
        throw new Error(`Invalid agent definition: missing agent.id`);
      }
      
      return agentDef;
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Agent file not found: ${this.agentId}.md`);
      }
      throw error;
    }
  }
  
  /**
   * Load both config and definition (convenience method)
   * @param {Object} coreConfig - Core configuration
   * @param {Object} options - Load options
   * @returns {Promise<Object>} Combined config and definition
   */
  async loadComplete(coreConfig, options = {}) {
    const [config, definition] = await Promise.all([
      this.load(coreConfig, options),
      this.loadAgentDefinition(options)
    ]);
    
    return {
      config: config.config,
      files: config.files,
      definition: definition,
      agent: definition.agent,
      persona_profile: definition.persona_profile,
      commands: definition.commands,
      loadTime: config.loadTime
    };
  }
}
```

**Benefícios:**
- ✅ Não cria novo arquivo
- ✅ Expande funcionalidade existente
- ✅ Mantém compatibilidade (métodos antigos ainda funcionam)
- ✅ Adiciona método conveniente `loadComplete()`

---

### 3. DELETAR: Scripts de Migração Temporários

**Scripts para Deletar:**

1. **`batch-integrate-greeting-builder.js`**
   - Propósito: Batch update agents (Story 6.1.2.5)
   - Status: Migração concluída
   - Ação: ❌ **DELETAR**

2. **`apply-inline-greeting-all-agents.js`**
   - Propósito: Aplica greeting inline (Story 6.1.2.5-T1)
   - Status: Migração concluída
   - Ação: ❌ **DELETAR**

3. **`update-activation-instructions.js`**
   - Propósito: Atualiza STEP 3 dos agentes
   - Status: Migração concluída
   - Ação: ❌ **DELETAR**

4. **`batch-update-agents-session-context.js`**
   - Propósito: Batch update session context
   - Status: Migração concluída
   - Ação: ❌ **DELETAR**

**Justificativa:**
- Scripts de migração são temporários
- Migrações já foram concluídas
- Manter apenas aumenta confusão
- Histórico preservado no Git

---

### 4. MANTER: Scripts Core (Não Duplicados)

**Scripts que devem ser mantidos:**

1. ✅ **`greeting-builder.js`** - Core functionality
2. ✅ **`greeting-preference-manager.js`** - Core functionality
3. ✅ **`greeting-config-cli.js`** - Interface CLI útil
4. ✅ **`session-context-loader.js`** - Core functionality
5. ✅ **`context-detector.js`** - Core functionality
6. ✅ **`project-status-loader.js`** - Core functionality
7. ✅ **`git-config-detector.js`** - Core functionality
8. ✅ **`workflow-navigator.js`** - Core functionality
9. ✅ **`dev-context-loader.js`** - Específico para @dev, não duplicado
10. ✅ **`agent-assignment-resolver.js`** - Diferente propósito

---

## 🎯 Plano de Consolidação

### Fase 1: Expandir `agent-config-loader.js` (2 horas)

**Objetivo:** Adicionar capacidade de carregar definição completa do agente

**Mudanças:**
1. Adicionar método `loadAgentDefinition()` ao `AgentConfigLoader`
2. Adicionar método `loadComplete()` para carregar tudo junto
3. Adicionar cache para definições de agentes (5 min TTL)
4. Adicionar validação de estrutura

**Código:**
```javascript
// Adicionar ao agent-config-loader.js

/**
 * Agent definition cache (5 min TTL)
 */
const agentDefCache = new Map();

/**
 * Load complete agent definition from markdown file
 */
async loadAgentDefinition(options = {}) {
  const skipCache = options.skipCache || false;
  const cacheKey = this.agentId;
  
  // Check cache
  if (!skipCache && agentDefCache.has(cacheKey)) {
    const cached = agentDefCache.get(cacheKey);
    if (Date.now() - cached.timestamp < 5 * 60 * 1000) {
      return cached.definition;
    }
  }
  
  // Load from file
  const agentPath = path.join(process.cwd(), '.aios-core', 'agents', `${this.agentId}.md`);
  const content = await fs.readFile(agentPath, 'utf8');
  
  // Extract YAML
  const yamlMatch = content.match(/```ya?ml\n([\s\S]*?)\n```/);
  if (!yamlMatch) {
    throw new Error(`No YAML block found in ${this.agentId}.md`);
  }
  
  const agentDef = yaml.load(yamlMatch[1]);
  
  // Validate
  if (!agentDef.agent || !agentDef.agent.id) {
    throw new Error(`Invalid agent definition: missing agent.id`);
  }
  
  // Cache
  agentDefCache.set(cacheKey, {
    definition: agentDef,
    timestamp: Date.now()
  });
  
  return agentDef;
}

/**
 * Load both config and definition
 */
async loadComplete(coreConfig, options = {}) {
  const [config, definition] = await Promise.all([
    this.load(coreConfig, options),
    this.loadAgentDefinition(options)
  ]);
  
  return {
    ...config,
    definition,
    agent: definition.agent,
    persona_profile: definition.persona_profile,
    commands: definition.commands || []
  };
}
```

---

### Fase 2: Deprecar `config-loader.js` (1 hora)

**Objetivo:** Marcar como deprecated e migrar usos

**Ações:**
1. Adicionar warning no topo do arquivo:
   ```javascript
   /**
    * @deprecated Use agent-config-loader.js instead
    * This file will be removed in a future version.
    */
   ```

2. Verificar onde é usado:
   ```bash
   grep -r "require.*config-loader" .aios-core/scripts
   grep -r "from.*config-loader" .aios-core/scripts
   ```

3. Migrar usos para `agent-config-loader.js`

4. Após migração completa, deletar arquivo

---

### Fase 3: Deletar Scripts Temporários (30 min)

**Ações:**
1. Verificar que migrações foram concluídas
2. Deletar scripts de migração:
   - `batch-integrate-greeting-builder.js`
   - `apply-inline-greeting-all-agents.js`
   - `update-activation-instructions.js`
   - `batch-update-agents-session-context.js`

3. Atualizar documentação se necessário

---

### Fase 4: Criar `generate-greeting.js` Simplificado (1 hora)

**Objetivo:** Criar wrapper unificado usando `agent-config-loader.js` expandido

**Código Simplificado:**
```javascript
// .aios-core/scripts/generate-greeting.js
const GreetingBuilder = require('./greeting-builder');
const SessionContextLoader = require('./session-context-loader');
const { loadProjectStatus } = require('./project-status-loader');
const { AgentConfigLoader } = require('./agent-config-loader');
const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

async function generateGreeting(agentId) {
  const startTime = Date.now();
  
  try {
    // Load core config
    const coreConfigPath = path.join(process.cwd(), '.aios-core', 'core-config.yaml');
    const coreConfigContent = await fs.readFile(coreConfigPath, 'utf8');
    const coreConfig = yaml.load(coreConfigContent);
    
    // Load everything in parallel using expanded AgentConfigLoader
    const loader = new AgentConfigLoader(agentId);
    const [complete, sessionContext, projectStatus] = await Promise.all([
      loader.loadComplete(coreConfig), // NOVO: Carrega config + definition
      loadSessionContext(agentId),
      loadProjectStatus()
    ]);
    
    // Build unified context
    const context = {
      conversationHistory: [],
      sessionType: sessionContext.sessionType,
      projectStatus: projectStatus,
      lastCommands: sessionContext.lastCommands || [],
      previousAgent: sessionContext.previousAgent,
      sessionMessage: sessionContext.message
    };
    
    // Generate greeting
    const builder = new GreetingBuilder();
    const greeting = await builder.buildGreeting(complete.agent, context);
    
    const duration = Date.now() - startTime;
    if (duration > 100) {
      console.warn(`[generate-greeting] Slow: ${duration}ms`);
    }
    
    return greeting;
    
  } catch (error) {
    console.error('[generate-greeting] Error:', error.message);
    return generateFallbackGreeting(agentId);
  }
}

function generateFallbackGreeting(agentId) {
  return `✅ ${agentId} Agent ready\n\nType \`*help\` to see available commands.`;
}

// CLI interface
if (require.main === module) {
  const agentId = process.argv[2];
  if (!agentId) {
    console.error('Usage: node generate-greeting.js <agent-id>');
    process.exit(1);
  }
  
  generateGreeting(agentId)
    .then(greeting => {
      console.log(greeting);
      process.exit(0);
    })
    .catch(error => {
      console.error('Fatal error:', error.message);
      console.log(generateFallbackGreeting(agentId));
      process.exit(1);
    });
}

module.exports = { generateGreeting };
```

**Benefícios:**
- ✅ Usa `agent-config-loader.js` expandido (não cria novo loader)
- ✅ Código mais simples e limpo
- ✅ Menos arquivos para manter
- ✅ Reutiliza funcionalidade existente

---

## 📋 Resumo de Ações

### ✅ Manter e Expandir

1. **`agent-config-loader.js`**
   - ✅ Manter
   - ✅ Expandir com `loadAgentDefinition()` e `loadComplete()`
   - ✅ Adicionar cache de definições

### ⚠️ Deprecar e Migrar

2. **`config-loader.js`**
   - ⚠️ Marcar como deprecated
   - ⚠️ Migrar usos para `agent-config-loader.js`
   - ❌ Deletar após migração

### ❌ Deletar

3. **Scripts de Migração Temporários:**
   - ❌ `batch-integrate-greeting-builder.js`
   - ❌ `apply-inline-greeting-all-agents.js`
   - ❌ `update-activation-instructions.js`
   - ❌ `batch-update-agents-session-context.js`

### ✅ Criar Simplificado

4. **`generate-greeting.js`**
   - ✅ Criar usando `agent-config-loader.js` expandido
   - ✅ Código simplificado
   - ✅ Menos dependências

---

## 🎯 Arquitetura Final Simplificada

```
.aios-core/scripts/
├── agent-config-loader.js          ✅ EXPANDIDO (config + definition)
├── greeting-builder.js              ✅ MANTIDO
├── greeting-preference-manager.js   ✅ MANTIDO
├── greeting-config-cli.js           ✅ MANTIDO
├── generate-greeting.js              ✅ NOVO (wrapper simplificado)
├── session-context-loader.js        ✅ MANTIDO
├── context-detector.js              ✅ MANTIDO
├── project-status-loader.js         ✅ MANTIDO
├── git-config-detector.js           ✅ MANTIDO
├── workflow-navigator.js            ✅ MANTIDO
└── dev-context-loader.js            ✅ MANTIDO (específico)
```

**Removidos:**
- ❌ `config-loader.js` (deprecated, migrado)
- ❌ `batch-integrate-greeting-builder.js` (temporário)
- ❌ `apply-inline-greeting-all-agents.js` (temporário)
- ❌ `update-activation-instructions.js` (temporário)
- ❌ `batch-update-agents-session-context.js` (temporário)

---

## ⏱️ Timeline

**Fase 1:** Expandir `agent-config-loader.js` (2h)  
**Fase 2:** Deprecar `config-loader.js` (1h)  
**Fase 3:** Deletar scripts temporários (30min)  
**Fase 4:** Criar `generate-greeting.js` simplificado (1h)

**Total:** ~4.5 horas

---

## ✅ Benefícios da Consolidação

1. **Menos Arquivos:** De 5 para 1 loader principal
2. **Menos Duplicação:** Uma única fonte de verdade
3. **Mais Simples:** Código mais fácil de entender
4. **Mais Manutenível:** Menos lugares para atualizar
5. **Melhor Performance:** Cache unificado
6. **Compatibilidade:** Métodos antigos ainda funcionam

---

**Análise realizada por:** Aria (Architect)  
**Status:** ✅ APROVADO  
**Próxima Ação:** Implementar consolidação antes de criar novos arquivos

