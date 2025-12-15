# Análise Completa: Sistema de Greeting e Ativação de Agentes

**Data:** 2025-01-17  
**Agente:** Quinn (QA) + Pax (PO)  
**Contexto:** Análise após execução de `*analyze-framework` e revisão de todas as stories relacionadas

---

## 🎯 Resumo Executivo

Após análise profunda do framework e revisão de todas as stories relacionadas (6.1.1 até 6.1.6), identificamos que **o problema não é apenas o session-context-loader**, mas sim uma **falha na integração completa** entre múltiplos componentes que foram desenvolvidos de forma incremental mas nunca foram completamente integrados.

**Story 6.1.4** pode ser a solução unificadora que integra tudo de forma otimizada.

---

## 📊 Estado Atual vs Estado Esperado

### ✅ O Que Foi Implementado (e funciona):

1. **greeting-builder.js** ✅
   - Implementado na Story 6.1.2.5
   - Suporta preferências (Story 6.1.4)
   - Tem timeout de 150ms
   - Fallback para greeting simples
   - **Status:** Funcional, mas não está sendo usado pelos agentes

2. **session-context-loader.js** ✅
   - Implementado na Story 6.1.2.5
   - Carrega contexto de `.aios/session-state.json`
   - Método `formatForGreeting()` disponível
   - **Status:** Funcional, mas não está sendo usado pelos agentes

3. **project-status-loader.js** ✅
   - Implementado na Story 6.1.2.4
   - Cache de 60 segundos
   - Detecta branch, arquivos modificados, commits recentes
   - **Status:** Funcional, mas não está sendo usado pelos agentes

4. **context-detector.js** ✅
   - Implementado na Story 6.1.2.5
   - Detecta tipo de sessão (new/existing/workflow)
   - Fallback para arquivo de sessão
   - **Status:** Funcional, mas não está sendo usado pelos agentes

5. **greeting-preference-manager.js** ✅
   - Implementado na Story 6.1.4
   - Gerencia preferências (auto/minimal/named/archetypal)
   - **Status:** Funcional, mas não está sendo usado pelos agentes

### ❌ O Que Está Quebrado:

1. **Agentes não chamam greeting-builder.js**
   - STEP 3 tem instruções inline que tentam fazer tudo manualmente
   - Não há chamada ao `greeting-builder.js`
   - Resultado: Sem detecção de contexto, sem adaptação

2. **Agentes não atualizam session state**
   - Após comandos executados, session state não é atualizado
   - Resultado: Sempre detecta como "new" session

3. **Falta integração entre componentes**
   - Cada componente funciona isoladamente
   - Não há orquestração unificada
   - Resultado: Funcionalidades não se comunicam

---

## 🔍 Análise do Fluxo de Ativação

### Como os Agentes São Carregados:

Quando o usuário digita `/AIOS/agents/qa`:

1. **Claude Code lê o arquivo:**
   - `.claude/commands/AIOS/agents/qa.md` OU
   - `.aios-core/agents/qa.md` (se sincronizado)

2. **Claude Code interpreta as activation-instructions:**
   - STEP 1: Lê o arquivo completo
   - STEP 2: Adota a persona
   - **STEP 3: Executa as instruções inline** ← **AQUI ESTÁ O PROBLEMA**

3. **STEP 3 Atual (Quebrado):**
   ```yaml
   - STEP 3: |
       Generate contextual greeting using inline logic:
       
       1. Detect session type:
          - If this is first message → "new" session
          - If conversation has history → "existing" session
       
       2. Build greeting components:
          - Use greeting from persona_profile.greeting_levels.named
          - Add role description
       
       3. Get project status (use Bash tool):
          - Branch: git branch --show-current
          - Modified files: git status --short | wc -l
          - Recent commit: git log -1 --pretty=format:"%s"
       
       4. Show commands based on session type:
          - New session: Show commands with visibility ["full", "quick", "key"]
          - Existing session: Show commands with visibility ["quick", "key"]
   ```

4. **Problemas Identificados:**
   - ❌ Claude Code não tem acesso direto ao `conversationHistory`
   - ❌ Detecção de sessão sempre retorna "new" (não tem histórico)
   - ❌ Comandos sempre mostram visibilidade "full" (não filtra)
   - ❌ Não usa nenhum dos scripts desenvolvidos
   - ❌ Não atualiza session state após comandos

### Como Deveria Funcionar (Story 6.1.2.5):

```yaml
- STEP 3: |
    Build intelligent greeting using .aios-core/scripts/greeting-builder.js:
    
    1. Load agent definition from this file
    2. Execute: node -e "
       const GreetingBuilder = require('./.aios-core/scripts/greeting-builder');
       const SessionContextLoader = require('./.aios-core/scripts/session-context-loader');
       const builder = new GreetingBuilder();
       const sessionLoader = new SessionContextLoader();
       
       // Get session context
       const sessionContext = sessionLoader.loadContext('qa');
       
       // Build greeting with context
       const greeting = await builder.buildGreeting(agentDef, {
         conversationHistory: [], // Claude Code não tem acesso direto
         sessionType: sessionContext.sessionType,
         lastCommands: sessionContext.lastCommands,
         previousAgent: sessionContext.previousAgent
       });
       
       console.log(greeting);
     "
    3. Display the greeting returned
```

**Problema:** Claude Code não pode executar Node.js diretamente nas activation-instructions.

---

## 💡 Solução Proposta: Story 6.1.4 como Unificadora

A **Story 6.1.4** pode ser expandida para ser a solução completa que:

1. **Unifica todos os componentes**
2. **Otimiza performance**
3. **Mantém proporção correta de contexto/informações/personalização**
4. **Garante velocidade de load**

### Proposta: Story 6.1.4 Expandida

#### Objetivo Expandido:

**Como** um usuário do framework AIOS,  
**Eu quero** que os agentes usem um sistema de greeting unificado e otimizado que integre contexto de sessão, status do projeto, personalização do agente e preferências do usuário,  
**Para que** eu tenha uma experiência consistente, rápida e contextualmente relevante ao ativar qualquer agente.

#### Componentes da Solução:

**1. Wrapper Script Unificado**

Criar `.aios-core/scripts/generate-greeting.js` que:
- Orquestra todos os componentes
- Otimiza performance (paralelização, cache)
- Retorna greeting formatado pronto para exibição
- Pode ser chamado via CLI pelo Claude Code

```javascript
#!/usr/bin/env node
/**
 * Unified Greeting Generator
 * 
 * Orchestrates all greeting components:
 * - Session context (session-context-loader.js)
 * - Project status (project-status-loader.js)
 * - User preferences (greeting-preference-manager.js)
 * - Contextual adaptation (greeting-builder.js)
 * 
 * Usage: node generate-greeting.js {agent-id}
 */

const GreetingBuilder = require('./greeting-builder');
const SessionContextLoader = require('./session-context-loader');
const { loadProjectStatus } = require('./project-status-loader');

async function generateGreeting(agentId) {
  // Load agent definition
  const agentDef = loadAgentDefinition(agentId);
  
  // Parallel load of all context
  const [sessionContext, projectStatus] = await Promise.all([
    loadSessionContext(agentId),
    loadProjectStatus()
  ]);
  
  // Build unified context
  const context = {
    sessionType: sessionContext.sessionType,
    conversationHistory: [], // Not available in Claude Code
    lastCommands: sessionContext.lastCommands,
    previousAgent: sessionContext.previousAgent,
    projectStatus: projectStatus,
    sessionMessage: sessionContext.message
  };
  
  // Generate greeting
  const builder = new GreetingBuilder();
  const greeting = await builder.buildGreeting(agentDef, context);
  
  return greeting;
}

// CLI interface
if (require.main === module) {
  const agentId = process.argv[2] || 'dev';
  generateGreeting(agentId)
    .then(greeting => {
      console.log(greeting);
      process.exit(0);
    })
    .catch(error => {
      console.error('Error generating greeting:', error.message);
      process.exit(1);
    });
}

module.exports = { generateGreeting };
```

**2. Atualização dos Agentes**

Modificar STEP 3 de todos os agentes para:

```yaml
- STEP 3: |
    Generate greeting by executing unified greeting generator:
    
    1. Execute: node .aios-core/scripts/generate-greeting.js {agent-id}
    2. Capture the output
    3. Display the greeting exactly as returned
    
    If execution fails:
    - Fallback to simple greeting: "{icon} {name} ready"
    - Show message: "Type *help to see available commands"
```

**3. Atualização de Session State**

Criar hook que atualiza session state após cada comando:

```javascript
// .aios-core/scripts/command-execution-hook.js
const SessionContextLoader = require('./session-context-loader');

function updateSessionAfterCommand(agentId, agentName, command) {
  const loader = new SessionContextLoader();
  loader.updateSession(agentId, agentName, command);
}
```

**4. Integração com Preferências**

O `greeting-builder.js` já suporta preferências (Story 6.1.4), então:
- Se preferência = "auto" → Usa detecção de contexto completa
- Se preferência = "minimal" → Sempre minimal (mais rápido)
- Se preferência = "named" → Sempre named
- Se preferência = "archetypal" → Sempre archetypal

---

## 📈 Otimizações de Performance

### Proporção Correta (Baseada na Análise):

1. **Contexto de Sessão:** 20% do tempo
   - Usa cache de arquivo (rápido)
   - Fallback se não disponível

2. **Status do Projeto:** 30% do tempo
   - Cache de 60 segundos
   - Paralelização de comandos git

3. **Personalização do Agente:** 10% do tempo
   - Carregamento de definição (já em memória)
   - Aplicação de preferências

4. **Geração do Greeting:** 40% do tempo
   - Montagem de seções
   - Filtragem de comandos
   - Formatação

### Performance Esperada:

- **Com cache:** <50ms (tudo em cache)
- **Sem cache:** <150ms (timeout protection)
- **Fallback:** <10ms (greeting simples)

---

## 🔧 Plano de Implementação

### Fase 1: Criar Wrapper Unificado (2 horas)

1. Criar `generate-greeting.js`
2. Integrar todos os componentes
3. Testar performance
4. Validar fallbacks

### Fase 2: Atualizar Agentes (3 horas)

1. Modificar STEP 3 de todos os 11 agentes
2. Adicionar fallback para greeting simples
3. Testar ativação de cada agente
4. Validar que funciona sem Node.js (fallback)

### Fase 3: Implementar Session Updates (2 horas)

1. Criar hook de atualização de sessão
2. Integrar com execução de comandos
3. Testar persistência de sessão
4. Validar detecção de workflow

### Fase 4: Testes e Validação (2 horas)

1. Testar todos os cenários:
   - New session
   - Existing session
   - Workflow session
   - Com/sem git
   - Com/sem preferências
2. Validar performance
3. Validar fallbacks
4. Documentar

**Total:** ~9 horas (1.1 dias)

---

## ✅ Critérios de Sucesso

1. ✅ Agentes usam `generate-greeting.js` via Node.js
2. ✅ Session state é atualizado após comandos
3. ✅ Detecção de sessão funciona corretamente
4. ✅ Comandos são filtrados por visibilidade
5. ✅ Performance <150ms (com timeout)
6. ✅ Fallback funciona se Node.js não disponível
7. ✅ Preferências do usuário são respeitadas
8. ✅ Proporção correta de contexto/info/personalização

---

## 🎯 Recomendação Final

**Executar Story 6.1.4 como solução unificadora:**

1. Expandir Story 6.1.4 para incluir wrapper unificado
2. Implementar todas as fases acima
3. Testar completamente
4. Documentar como solução final

**Benefícios:**
- ✅ Unifica todas as stories anteriores
- ✅ Resolve todos os problemas identificados
- ✅ Otimiza performance
- ✅ Mantém compatibilidade com fallbacks
- ✅ Respeita preferências do usuário

---

**Relatório gerado por:** Quinn (QA) + Pax (PO)  
**Status:** ✅ Análise Completa  
**Próxima Ação:** Decisão sobre execução da Story 6.1.4 expandida

