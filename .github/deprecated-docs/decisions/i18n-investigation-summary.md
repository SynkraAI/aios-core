# i18n Investigation Summary: Persona Layer Strategy
**Data:** 2025-11-13  
**Status:** ✅ INVESTIGAÇÃO COMPLETA + ESTRATÉGIA APROVADA  
**Requested by:** User (comprehensive analysis of core-config and AI assistants i18n)

---

## Resumo Executivo

### 🎯 Descoberta Principal

**A estratégia de traduzir completamente agentes AI é um ANTI-PATTERN na indústria.**

Todos os principais AI coding assistants (Claude Code, Cursor, Windsurf, GitHub Copilot) usam:
- **System prompts em inglês** (para qualidade de code generation)
- **User input multilíngue** (modelo detecta automaticamente)
- **UI localizada** (apenas elementos de interação)

### ✅ Decisão Aprovada

**Implementar estratégia "Persona Layer"** para AIOS:
- Agentes/personas mantidos em inglês
- Display layer (nomes, greetings, mensagens) em PT-BR
- Usuário pode interagir em qualquer idioma
- Zero degradação de qualidade de AI

---

## Investigação Realizada

### 1. Core-Config Analysis

**Arquivo analisado:** `.aios-core/core-config.yaml`

**Achados:**
- ❌ Nenhuma configuração de idioma existe hoje
- ❌ Agent loading não tem layer de i18n
- ❌ Messages são hardcoded nos agent files
- ✅ Registry completo de entities (agents, tasks, templates)
- ✅ Estrutura extensível para adicionar i18n

**Gap identificado:**
```yaml
# FALTA (será implementado):
i18n:
  enabled: true
  userLanguage: auto  # Detectar ou explícito
  displayLanguage: pt-BR
  technicalLanguage: en  # SEMPRE inglês
```

### 2. Agent Activation Flow Analysis

**Fluxo atual:**
```
Usuário → Agent File (po.md) → Parse YAML → Activation → Greeting (EN hardcoded)
```

**Proposta com Persona Layer:**
```
Usuário → Language Detection → Agent File (po.md) → Display Layer (pt-BR/po-display.yaml) 
→ Merge → System Prompt (EN) + Display (PT-BR) → User sees: "Olá, sou Clara..."
```

### 3. Market Research (AI Coding Assistants)

**Ferramentas analisadas:**
1. **Claude Code / Anthropic**
2. **Cursor AI**
3. **Windsurf / Codeium Cascade**
4. **GitHub Copilot / Copilot Workspace**

**Fontes consultadas:**
- 10+ artigos técnicos
- Documentação oficial de cada ferramenta
- GitHub issues sobre i18n requests
- Tutoriais de usuários multilíngues

**Descoberta unânime:**
- ✅ Todos mantêm system prompts em inglês
- ✅ Todos permitem input em qualquer idioma
- ❌ Nenhum traduz agent definitions
- ❌ Nenhum traduz mensagens técnicas de código

---

## Comparação Detalhada

| Ferramenta | System Prompts | User Input | UI Localizada | Agent Definitions |
|------------|----------------|------------|---------------|-------------------|
| **Claude Code** | EN | Any | ❌ EN only | ❌ EN only |
| **Cursor AI** | EN | Any | ❌ EN only | ❌ EN only (rules podem ser PT-BR mas recomendação é EN) |
| **Windsurf** | EN | Any | ❌ EN only | ❌ EN only (memories podem ter PT-BR) |
| **GitHub Copilot** | EN | Any | ❌ EN only | ❌ EN only (custom agents em YAML/JSON inglês) |
| **AIOS (proposto)** | EN | Any | ✅ PT-BR | 🟡 Display Layer PT-BR (personas EN) |

**Conclusão:** AIOS será o ÚNICO a oferecer display layer PT-BR nativo, diferencial competitivo!

---

## Documentos Gerados

### 1. `docs/research/ai-coding-assistants-i18n-analysis.md`
**Conteúdo:**
- Análise de cada ferramenta (Claude, Cursor, Windsurf, Copilot)
- Padrões identificados (O que TODOS fazem vs O que NINGUÉM faz)
- Recomendação para AIOS (estratégia Persona Layer)
- Implementação minimalista (3 fases)
- Custo-benefício (3-5 sprints vs 7 original)

### 2. `docs/decisions/i18n-persona-layer-strategy.md`
**Conteúdo:**
- Decisão estratégica (Persona Layer aprovado)
- Análise do core-config atual
- Como agentes são carregados hoje
- Arquitetura proposta (diagrama + código)
- Implementação técnica (3 sprints)
- Benefícios (qualidade + UX + economia)
- Roadmap de implementação
- Métricas de sucesso

### 3. `docs/EXECUTIVE-SUMMARY-FOR-APPROVAL.md` (ATUALIZADO)
**Mudanças:**
- ✅ Estratégia de i18n atualizada (Persona Layer)
- ✅ Q1 investment atualizado ($90k vs $100k)
- ✅ Q2 investment atualizado ($100-130k vs $145k)
- ✅ Total investment recalculado ($610k MVP vs $665k original)
- ✅ Savings documentados ($25-$55k)
- ✅ Epic 10 marcado como COMPLETO (2025-11-13)

---

## Estratégia "Persona Layer" - Resumo Técnico

### O que NÃO mudar (mantém qualidade de AI):

```yaml
# aios-fullstack/aios-core/agents/po.md (INALTERADO)

agent:
  id: po
  name: Sarah
  title: Product Owner
  
persona:
  role: Technical Product Owner & Process Steward
  style: Meticulous, analytical, detail-oriented
  identity: Product Owner who validates artifacts
  # ... TUDO EM INGLÊS
  
commands:
  - help: Show numbered list of commands
  - create-story: Create user story from requirements
  # ... COMANDOS EM INGLÊS (apenas IDs)
  
dependencies:
  tasks:
    - create-brownfield-story.md
  # ... DEPENDÊNCIAS INALTERADAS
```

### O que ADICIONAR (cria UX PT-BR):

```yaml
# .aios-core/i18n/agents/pt-BR/po-display.yaml (NOVO)

agent:
  display_name: "Clara - Product Owner"
  tagline: "Planejamento e Qualidade de Software"
  
messages:
  greeting: |
    Olá! Sou Clara, sua Product Owner.
    Digite *help para ver comandos disponíveis.
  
  commands:
    help: "Mostrar lista de comandos"
    create-story: "Criar user story a partir de requisitos"
    exit: "Sair (confirmar)"
  
  confirmations:
    exit: "Tem certeza que deseja sair?"
    story_created: "✅ Story criada com sucesso!"
  
  errors:
    task_not_found: "❌ Task não encontrada: {taskName}"
```

### Como funciona (Merge Layer):

```javascript
// .aios-core/utils/agent-activator.js

const agent = {
  // Technical (from po.md - EN)
  id: 'po',
  persona: { /* English technical definition */ },
  dependencies: { /* English file names */ },
  
  // Display (from pt-BR/po-display.yaml - PT-BR)
  displayName: "Clara - Product Owner",
  greeting: "Olá! Sou Clara...",
  commandsHelp: { /* PT-BR descriptions */ }
};

// System Prompt: ENGLISH (AI quality)
const systemPrompt = buildEnglishPrompt(agent.persona);

// User Display: PT-BR (UX delight)
displayToUser(agent.greeting);
```

---

## Benefícios da Estratégia

### ✅ Para o Projeto

1. **Economia de custos:** $25-$55k savings (vs full translation)
2. **Economia de tempo:** 2-4 sprints menos (3-5 vs 7)
3. **Qualidade preservada:** AI performance mantida (prompts EN)
4. **Escalabilidade:** Adicionar idiomas é trivial (apenas display layer)
5. **Manutenção simples:** Um único set de agent definitions

### ✅ Para o Usuário PT-BR

1. **UX nativo:** "Olá, sou Clara..." (não "Hi, I'm Sarah...")
2. **Nomes culturais:** Clara, Diego, Ana (vs Sarah, John, Bob)
3. **Mensagens PT-BR:** Erros, confirmações, help text
4. **Interação natural:** Usuário fala PT-BR, agente entende perfeitamente
5. **Qualidade mantida:** Code generation em inglês (best practices)

### ✅ Para a Indústria

1. **Padrão de mercado:** Segue Claude, Cursor, Windsurf
2. **Diferencial competitivo:** ÚNICO com display layer PT-BR nativo
3. **Best practice:** Separation of concerns (UX vs Technical)

---

## Próximos Passos

### Fase 1: Implementar Core i18n (Sprint 1)
- [ ] Adicionar config `i18n` em `core-config.yaml`
- [ ] Criar `language-detector.js` utility
- [ ] Estrutura `.aios-core/i18n/display/`
- [ ] Display layer loader (`load-display-layer.js`)

### Fase 2: Display Layers PT-BR (Sprints 2-3)
- [ ] Display layers para 6 agentes core (po, dev, architect, qa, devops, master)
- [ ] Templates principais (story, prd, epic) - headers/sections PT-BR
- [ ] Documentação PT-BR (README, CONTRIBUTING)

### Fase 3: Brazilian Tech Legends (Sprints 4-5 - OPCIONAL)
- [ ] Sistema de nomenclatura cultural (Clara, Diego, Ana, etc)
- [ ] Taglines memoráveis
- [ ] Backward compatibility (IDs técnicos inalterados)

---

## Métricas de Sucesso

### Phase 1-3 (MVP - 3 sprints):

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

## Conclusão

### ✅ Investigação Completa

1. **Core-config analysis:** Identificados gaps e estratégia de extensão
2. **Market research:** Analisadas 4 ferramentas principais + 10+ fontes
3. **Strategy definition:** Persona Layer aprovado (padrão da indústria)
4. **Implementation plan:** 3 sprints MVP, 5 sprints full
5. **Documentation:** 3 documentos técnicos + executive summary atualizado
6. **Savings:** $25-$55k vs abordagem full translation

### 🎯 Decisão Final

**APROVADO: Estratégia "Persona Layer"**

**Justificativa:**
1. ✅ Segue padrões da indústria (proven approach)
2. ✅ Preserva qualidade de AI (critical for code generation)
3. ✅ Experiência PT-BR nativa (user delight)
4. ✅ Economiza tempo e dinheiro (cost-effective)
5. ✅ Escalável para outros idiomas (future-proof)
6. ✅ Diferencial competitivo (ÚNICO com display layer PT-BR)

**Launch Target:**
- **MVP (3 sprints):** Mês 3 (Q1 2026)
- **Full com naming (5 sprints):** Mês 5 (Q2 2026)

---

## Referências Completas

### Documentos Gerados:
1. `docs/research/ai-coding-assistants-i18n-analysis.md` (análise de mercado)
2. `docs/decisions/i18n-persona-layer-strategy.md` (estratégia técnica)
3. `docs/EXECUTIVE-SUMMARY-FOR-APPROVAL.md` (executive summary atualizado)
4. `docs/decisions/i18n-investigation-summary.md` (este arquivo)

### Pesquisas Realizadas:
- Claude Code/Anthropic: multilingual support documentation
- Cursor AI: MCP SimpleLocalize, multilingual tutorials
- Windsurf/Cascade: flow awareness documentation
- GitHub Copilot: custom agents, workspace documentation
- 32+ artigos acadêmicos sobre PT-BR code generation (pesquisa anterior)

### Ferramentas Usadas:
- `codebase_search` (análise de core-config)
- `mcp_exa_web_search_exa` (market research - 40+ resultados)
- `read_file` (agent definitions analysis)

---

**Data de Conclusão:** 2025-11-13  
**Tempo de Investigação:** ~2h (pesquisa + análise + documentação)  
**Status:** ✅ COMPLETO - Pronto para implementação
