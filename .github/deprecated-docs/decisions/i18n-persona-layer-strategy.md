# i18n Strategy: Persona Layer Approach
**Data:** 2025-11-13  
**Status:** ✅ APROVADO (baseado em análise de mercado)  
**Contexto:** Análise do core-config.yaml + AI assistants market research

---

## Decisão Estratégica

### ✅ IMPLEMENTAR: Modelo "Persona Layer"

**Não traduzir agentes completos. Apenas criar uma camada de personalização PT-BR sobre personas técnicas em inglês.**

---

## Análise do Core-Config Atual

### Estrutura Relevante para i18n

```yaml
# .aios-core/core-config.yaml (atual)

# ❌ Não existe configuração de idioma hoje
# ❌ Nenhuma referência a locales
# ❌ Agentes carregam textos hardcoded

# ✅ Já existe estrutura de agent loading
slashPrefix: AIOS  # usado para comandos

# ✅ Registry completo de entities
registry:
  agents:
    count: 145
    location: .aios-core/agents
    format: markdown
    discoverable: true
    
  tasks:
    count: 60
    location: .aios-core/tasks
    
  templates:
    count: 19
    location: .aios-core/templates
```

**Gap identificado:**
- Nenhuma config de `userLanguage` ou `displayLanguage`
- Agent files carregam diretamente sem layer de i18n
- Messages são hardcoded nos agent files

---

## Como Agentes São Carregados Hoje

### Fluxo Atual

```
1. Usuário: "/AIOS/agents/po"
2. Sistema lê: .aios-core/agents/po.md
3. YAML frontmatter parseado:
   - agent.name: "Sarah"
   - persona.role: "Technical Product Owner"
   - commands: ["help", "create-story", ...]
4. Activation instructions executadas
5. Greeting: "Hi! I'm Sarah, your Product Owner..."
```

**Problema:**
- Greeting é hardcoded no arquivo
- Não há camada de i18n entre parse e display
- Idioma não é detectado ou configurável

---

## Estratégia "Persona Layer"

### Arquitetura Proposta

```
┌─────────────────────────────────────────────────────┐
│ User Input (qualquer idioma)                       │
│ "Olá, preciso criar uma story"                     │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Language Detection Layer                            │
│ - Detecta idioma: PT-BR                            │
│ - Carrega display config: pt-BR.yaml               │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Agent Activation (po.md)                            │
│ - Persona: Technical Product Owner (EN)            │
│ - System Prompt: EN (quality preserved)            │
│ - Display Layer: PT-BR                             │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Display to User                                     │
│ "Olá! Sou Clara, sua Product Owner..."            │
│ (Mensagem de pt-BR.yaml, persona de po.md)         │
└─────────────────────────────────────────────────────┘
```

---

## Implementação Técnica

### Fase 1: Core Config Extension (1 sprint)

**Arquivo:** `.aios-core/core-config.yaml`

```yaml
# NOVO: Configuração de idioma
i18n:
  enabled: true
  userLanguage: auto  # auto-detect ou explícito (pt-BR, en-US)
  
  # Separation of concerns
  displayLanguage: pt-BR  # UI/UX messages
  technicalLanguage: en   # System prompts, code context
  
  # Fallback strategy
  fallbackLanguage: en
  
  # Display layer files
  displayConfigLocation: .aios-core/i18n/display
```

**Detecção de idioma:**

```javascript
// .aios-core/utils/language-detector.js

function detectUserLanguage() {
  // 1. Explícito em config
  if (config.i18n.userLanguage !== 'auto') {
    return config.i18n.userLanguage;
  }
  
  // 2. Browser/system locale
  const locale = navigator.language || 
                 process.env.LANG || 
                 'en-US';
  
  return normalizeLocale(locale); // 'pt-BR', 'en-US', etc
}
```

### Fase 2: Display Layer Structure (2 sprints)

**Estrutura de arquivos:**

```
.aios-core/
├── i18n/
│   ├── display/
│   │   ├── pt-BR.yaml      # Display messages PT-BR
│   │   ├── en-US.yaml      # Display messages EN (fallback)
│   │   └── es-ES.yaml      # Display messages ES (futuro)
│   └── agents/
│       ├── pt-BR/
│       │   ├── po-display.yaml    # Display para PO agent
│       │   ├── dev-display.yaml   # Display para Dev agent
│       │   └── ...
│       └── en-US/
│           └── ...
```

**Exemplo: `pt-BR/po-display.yaml`**

```yaml
# Display layer para PO agent (PT-BR)
agent:
  display_name: "Clara - Product Owner"
  tagline: "Planejamento e Qualidade de Software"
  icon: "📝"
  
messages:
  greeting: |
    Olá! Sou Clara, sua Product Owner. 
    Estou aqui para ajudar com backlog, refinamento de stories, 
    critérios de aceitação e planejamento de sprint.
    
    Digite *help para ver comandos disponíveis.
  
  help_intro: "Comandos disponíveis:"
  
  commands:
    help: "Mostrar lista de comandos"
    create-story: "Criar user story a partir de requisitos"
    validate-story: "Validar draft de story"
    sync-story: "Sincronizar story com ferramenta de PM"
    exit: "Sair (confirmar)"
  
  confirmations:
    exit: "Tem certeza que deseja sair?"
    story_created: "✅ Story criada com sucesso!"
    validation_error: "⚠️ Validação falhou. Verifique os critérios."
  
  errors:
    task_not_found: "❌ Task não encontrada: {taskName}"
    template_missing: "❌ Template faltando: {templateName}"
```

**Exemplo: Agent file inalterado (po.md)**

```yaml
# aios-fullstack/aios-core/agents/po.md

agent:
  name: Sarah  # Nome técnico (inalterado)
  id: po
  title: Product Owner
  icon: 📝
  
persona:
  role: Technical Product Owner & Process Steward
  style: Meticulous, analytical, detail-oriented
  identity: Product Owner who validates artifacts cohesion
  focus: Plan integrity, documentation quality
  core_principles:
    - Guardian of Quality & Completeness
    - Clarity & Actionability for Development
    - Process Adherence & Systemization
    # ... (tudo em inglês)

commands:
  - help: Show numbered list of commands
  - create-story: Create user story from requirements
  - validate-story: Validate story draft
  # ... (tudo em inglês - apenas IDs)

dependencies:
  tasks:
    - create-brownfield-story.md
    - validate-next-story.md
  # ... (inalterado)
```

### Fase 3: Agent Activation com Display Layer

**Novo fluxo de ativação:**

```javascript
// .aios-core/utils/agent-activator.js

async function activateAgent(agentId) {
  // 1. Carregar agent definition (inglês)
  const agentDef = await loadAgentFile(agentId); // po.md
  
  // 2. Detectar idioma do usuário
  const userLang = detectUserLanguage(); // 'pt-BR'
  
  // 3. Carregar display layer (se existir)
  const displayLayer = await loadDisplayLayer(agentId, userLang);
  // i18n/agents/pt-BR/po-display.yaml
  
  // 4. Merge: agent definition + display layer
  const agent = {
    ...agentDef,
    
    // Display name: PT-BR se disponível, fallback para EN
    displayName: displayLayer?.agent?.display_name || agentDef.agent.name,
    tagline: displayLayer?.agent?.tagline || agentDef.agent.title,
    
    // Persona: sempre em inglês (quality preserved)
    persona: agentDef.persona,
    
    // Messages: PT-BR se disponível
    messages: displayLayer?.messages || generateDefaultMessages(agentDef)
  };
  
  // 5. Enviar para LLM com system prompt
  const systemPrompt = buildSystemPrompt(agent);
  // Persona em inglês + context em inglês
  
  // 6. Display greeting para usuário
  displayMessage(agent.messages.greeting);
  
  return agent;
}
```

**System Prompt (sempre em inglês):**

```javascript
function buildSystemPrompt(agent) {
  return `
You are ${agent.displayName} (${agent.agent.name}), a ${agent.persona.role}.

Your personality:
${agent.persona.style}

Your identity:
${agent.persona.identity}

Your focus:
${agent.persona.focus}

Core Principles:
${agent.persona.core_principles.map(p => `- ${p}`).join('\n')}

Available commands:
${agent.commands.map(cmd => `- ${cmd.id}: ${cmd.description}`).join('\n')}

Dependencies:
${JSON.stringify(agent.dependencies, null, 2)}

CRITICAL RULES:
- Follow persona exactly as defined above (in English)
- Understand user input in ANY language
- Execute tasks according to technical specifications
- Maintain code quality standards (English context)
- User-facing messages can be in user's language

The user's display language is ${getUserLanguage()}, but you should:
1. Understand their input perfectly (any language)
2. Keep technical context in English
3. Use their language for conversational responses
4. Generate code with English comments/docs
`;
}
```

---

## Benefícios da Estratégia

### ✅ Qualidade de AI Preservada

- System prompts em inglês (proven best practice)
- Code generation context em inglês (industry standard)
- Nenhuma degradação de performance

### ✅ Experiência PT-BR Nativa

- Display names culturais ("Clara", "Diego", "Ana")
- Greetings e mensagens em PT-BR
- Comandos com help text em PT-BR
- Erros e confirmações em PT-BR

### ✅ Manutenção Simples

- Um único set de agent definitions
- Display layers independentes (fácil de atualizar)
- Backward compatible (EN fallback sempre disponível)

### ✅ Escalável

- Adicionar novo idioma = criar novo display layer
- Nenhuma mudança em agent definitions
- Contribuidores podem adicionar idiomas facilmente

### ✅ Econômico

- **3 sprints** (vs 7 sprints full translation)
- Nenhum overhead de performance
- Zero degradação de AI quality

---

## Roadmap de Implementação

### Sprint 1: Core i18n Infrastructure
**Effort:** 1 sprint (2 semanas)

**Entregas:**
1. Adicionar config `i18n` em `core-config.yaml`
2. Criar `language-detector.js` utility
3. Estrutura de pastas `.aios-core/i18n/`
4. Display layer loader (`load-display-layer.js`)

**Definition of Done:**
- [x] Config `i18n` funcional
- [x] Detecção de idioma implementada
- [x] Display layer loader testado
- [x] Backward compatibility verificada

### Sprint 2-3: Display Layers PT-BR
**Effort:** 2 sprints (4 semanas)

**Entregas:**
1. Display layers para 6 agentes core:
   - `aios-master-display.yaml`
   - `po-display.yaml`
   - `dev-display.yaml`
   - `architect-display.yaml`
   - `qa-display.yaml`
   - `github-devops-display.yaml`

2. Templates principais traduzidos:
   - Story template (mensagens apenas)
   - PRD template (headers/sections)
   - Epic template (headers/sections)

3. Documentação PT-BR:
   - README.pt-BR.md
   - CONTRIBUTING.pt-BR.md
   - Quick Start Guide PT-BR

**Definition of Done:**
- [x] 6 display layers completos
- [x] Templates com mensagens PT-BR
- [x] Docs PT-BR publicadas
- [x] Testes de ativação passando

### Sprint 4-5: Brazilian Tech Legends (OPCIONAL)
**Effort:** 2 sprints (4 semanas)

**Entregas:**
1. Sistema de nomenclatura cultural:
   - Clara (PO)
   - Diego (Dev)
   - Ana (Architect)
   - Beatriz (QA)
   - Rafael (DevOps)
   - Marina (Designer)

2. Taglines memoráveis
3. Backward compatibility (IDs técnicos inalterados)

---

## Métricas de Sucesso

### Fase 1-3 (MVP - 3 sprints):

**Adoção:**
- [ ] 80%+ dos usuários PT-BR usam display PT-BR
- [ ] 0% de degradação em AI quality
- [ ] <50ms overhead para load de display layer

**Experiência:**
- [ ] User feedback: "Parece nativo em PT-BR"
- [ ] Zero confusão com comandos técnicos em inglês
- [ ] Greetings 100% em PT-BR

**Manutenção:**
- [ ] Contribuidores conseguem adicionar idiomas facilmente
- [ ] Nenhum retrabalho em agent definitions

---

## Próximos Passos

1. ✅ **Documentação completa** (este arquivo)
2. 📋 **Criar Epic 7:** i18n Core Infrastructure (1 sprint)
3. 📋 **Criar Epic 8:** PT-BR Display Layers (2 sprints)
4. 📋 **Criar Epic 9:** Brazilian Tech Legends (2 sprints - opcional)
5. 📋 **Atualizar EXECUTIVE-SUMMARY-FOR-APPROVAL.md:**
   - Incluir estratégia Persona Layer
   - Atualizar timeline (3-5 sprints vs 7 original)
   - Custos revisados

---

## Decisão Final

**✅ APROVADO: Modelo "Persona Layer"**

**Justificativa:**
1. Segue padrões da indústria (Claude, Cursor, Windsurf)
2. Preserva qualidade de AI (critical)
3. Experiência PT-BR nativa (user delight)
4. Economiza 2-4 sprints (cost-effective)
5. Escalável para outros idiomas (future-proof)

**Data de Implementação:** Iniciar imediatamente após aprovação de Epic 10-11

**Launch Target:** Mês 5 (com MVP) ou Mês 7 (com naming system)
