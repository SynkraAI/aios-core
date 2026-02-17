<!--
  Tradução: PT-BR
  Original: /docs/en/guides/contextual-greeting-system-guide.md
  Última sincronização: 2026-01-26
-->

# Guia do Sistema de Greeting Contextual

> 🌐 [EN](../../guides/contextual-greeting-system-guide.md) | **PT** | [ES](../../es/guides/contextual-greeting-system-guide.md)

---

**Story:** 6.1.2.5 - Contextual Agent Load System
**Status:** Componentes Implementados, Integração Pendente
**Data:** 2025-01-15

---

## Visão Geral

O Sistema de Greeting Contextual é uma melhoria de UX que torna os greetings dos agentes AIOS inteligentes e adaptativos, mostrando informações e comandos relevantes baseados no contexto da sessão.

## O Que Foi Implementado

### Componentes Core (Story 6.1.2.5)

1. **ContextDetector** (`.aios-core/core/session/context-detector.js`)
   - Detecta tipo de sessão: `new`, `existing`, ou `workflow`
   - Abordagem híbrida: histórico de conversação (preferido) + arquivo de sessão (fallback)
   - TTL de 1 hora para sessões inativas

2. **GitConfigDetector** (`.aios-core/infrastructure/scripts/git-config-detector.js`)
   - Detecta configuração do git do projeto
   - Cache com TTL de 5 minutos
   - Proteção de timeout de 1000ms

3. **GreetingBuilder** (`.aios-core/development/scripts/greeting-builder.js`)
   - Monta greetings contextuais baseados no tipo de sessão
   - Filtra comandos por visibilidade (full/quick/key)
   - Timeout de 150ms com fallback gracioso

4. **WorkflowNavigator** (`.aios-core/development/scripts/workflow-navigator.js`)
   - Detecta estado do workflow atual
   - Sugere próximos comandos baseado no estado
   - Pre-popula comandos com contexto (story path, branch)

5. **Workflow Patterns** (`.aios-core/data/workflow-patterns.yaml`)
   - 10 workflows comuns definidos
   - Transições de estado com sugestões de próximos passos
   - Padrões validados contra uso real do projeto

### Pendente (Story Futura - 6.1.4 ou 6.1.6)

**Integração com Processo de Ativação:**
- Interceptar ativação do agente (quando você digita `@dev`, `@po`, etc.)
- Chamar GreetingBuilder automaticamente
- Injetar greeting contextual no lugar do greeting padrão

## Tipos de Sessão

### 1. New Session (Sessão Nova)

**Quando:** Primeira interação ou após 1 hora de inatividade

**Características:**
- Apresentação completa (greeting archetypal)
- Descrição do papel do agente
- Status do projeto (se git configurado)
- Comandos completos (até 12 comandos com visibility=full)

**Exemplo:**
```
Dex (Builder) ready. Let's build something solid!

**Role:** Full Stack Developer specializing in clean, maintainable code

Project Status:
main
5 modified files
Last commit: feat: implement greeting system

**Available Commands:**
   - `*help`: Show all available commands
   - `*develop`: Implement story tasks
   - `*review-code`: Review code changes
   - `*run-tests`: Execute test suite
   - `*build`: Build for production
   ... (até 12 comandos)
```

### 2. Existing Session (Sessão Existente)

**Quando:** Continuando trabalho na mesma sessão

**Características:**
- Apresentação resumida (greeting named)
- Status do projeto
- Contexto atual (última ação)
- Comandos rápidos (6-8 comandos com visibility=quick)

**Exemplo:**
```
Dex (Builder) ready.

Project Status:
feature/story-6.1.2.5
3 modified files

**Last Action:** review-code

**Quick Commands:**
   - `*help`: Show help
   - `*develop`: Implement story
   - `*review-code`: Review code
   - `*run-tests`: Run tests
   - `*qa-gate`: Run quality gate
   ... (6-8 comandos mais usados)
```

### 3. Workflow Session (Sessão em Workflow)

**Quando:** No meio de um workflow ativo (ex: após validar story)

**Características:**
- Apresentação mínima (greeting minimal)
- Status condensado do projeto
- Contexto do workflow (working on X)
- **Sugestões de próximos passos** (NEW!)
- Comandos chave (3-5 comandos com visibility=key)

**Exemplo:**
```
Pax ready.

main | 5 modified | STORY-6.1.2.5

**Context:** Working on Story 6.1.2.5

**Story validated! Next steps:**

1. `*develop-yolo story-6.1.2.5.md` - Autonomous mode (no interruptions)
2. `*develop-interactive story-6.1.2.5.md` - Interactive mode with checkpoints
3. `*develop-preflight story-6.1.2.5.md` - Plan first, then execute

**Key Commands:**
   - `*help`: Show help
   - `*validate-story-draft`: Validate story
   - `*backlog-summary`: Quick backlog status
```

## Sistema de Visibilidade de Comandos

### Metadados de Comandos

Cada comando agora tem um atributo `visibility` que controla quando ele aparece:

```yaml
commands:
  - name: help
    visibility: [full, quick, key]  # Sempre visível
    description: "Show all available commands"

  - name: develop
    visibility: [full, quick, key]  # Comando principal
    description: "Implement story tasks"

  - name: review-code
    visibility: [full, quick]  # Usado frequentemente, mas não crítico
    description: "Review code changes"

  - name: build
    visibility: [full]  # Menos usado, só em new session
    description: "Build for production"

  - name: qa-gate
    visibility: [key]  # Crítico em workflows, mas não sempre necessário
    description: "Run quality gate"
```

### Guidelines de Categorização

**`full` (12 comandos)** - New Session
- Todos os comandos disponíveis
- Mostra capacidades completas do agente
- Ideal para descoberta

**`quick` (6-8 comandos)** - Existing Session
- Comandos usados frequentemente
- Focado em produtividade
- Remove comandos raramente usados

**`key` (3-5 comandos)** - Workflow Session
- Comandos críticos para o workflow atual
- Mínimo de distração
- Máxima eficiência

## Navegação de Workflow

### Workflows Definidos

**10 workflows comuns:**

1. **story_development** - Validate -> Develop -> QA -> Deploy
2. **epic_creation** - Create epic -> Create stories -> Validate
3. **backlog_management** - Review -> Prioritize -> Schedule
4. **architecture_review** - Analyze -> Document -> Review
5. **git_workflow** - Quality gate -> PR -> Merge
6. **database_workflow** - Design -> Migrate -> Test
7. **code_quality_workflow** - Assess -> Refactor -> Test
8. **documentation_workflow** - Research -> Document -> Sync
9. **ux_workflow** - Design -> Implement -> Validate
10. **research_workflow** - Brainstorm -> Analyze -> Document

### Transições de Estado

Cada workflow define transições entre estados com:
- **Trigger:** Comando que completa com sucesso
- **Greeting Message:** Mensagem contextual
- **Next Steps:** Sugestões de próximos comandos com args pré-populados

**Exemplo (Story Development):**

```yaml
story_development:
  transitions:
    validated:
      trigger: "validate-story-draft completed successfully"
      greeting_message: "Story validated! Ready to implement."
      next_steps:
        - command: develop-yolo
          args_template: "${story_path}"
          description: "Autonomous YOLO mode (no interruptions)"
        - command: develop-interactive
          args_template: "${story_path}"
          description: "Interactive mode with checkpoints (default)"
        - command: develop-preflight
          args_template: "${story_path}"
          description: "Plan everything upfront, then execute"
```

## Como Testar Agora

### Opção 1: Script de Teste Automático

```bash
node .aios-core/development/scripts/test-greeting-system.js
```

Este script testa os 4 cenários:
1. New session greeting (Dev)
2. Existing session greeting (Dev)
3. Workflow session greeting (PO)
4. Simple greeting fallback

### Opção 2: Teste Manual via Node REPL

```javascript
const GreetingBuilder = require('./.aios-core/development/scripts/greeting-builder');
const builder = new GreetingBuilder();

// Mock agent
const mockAgent = {
  name: 'Dex',
  icon: '',
  persona_profile: {
    greeting_levels: {
      named: 'Dex (Builder) ready!'
    }
  },
  persona: { role: 'Developer' },
  commands: [
    { name: 'help', visibility: ['full', 'quick', 'key'] }
  ]
};

// Test new session
builder.buildGreeting(mockAgent, { conversationHistory: [] })
  .then(greeting => console.log(greeting));
```

### Opção 3: Aguardar Integração Completa

Quando a integração com o processo de ativação estiver implementada (Story 6.1.4/6.1.6), o sistema funcionará automaticamente ao ativar qualquer agente:

```
@dev              -> Greeting contextual automático
@po               -> Greeting contextual automático
@qa               -> Greeting contextual automático
```

## Arquivos Relacionados

### Scripts Core
- `.aios-core/core/session/context-detector.js` - Detecção de tipo de sessão
- `.aios-core/infrastructure/scripts/git-config-detector.js` - Detecção de git config
- `.aios-core/development/scripts/greeting-builder.js` - Montagem do greeting
- `.aios-core/development/scripts/workflow-navigator.js` - Navegação de workflow
- `.aios-core/development/scripts/agent-exit-hooks.js` - Hooks de saída (para persistência)

### Arquivos de Dados
- `.aios-core/data/workflow-patterns.yaml` - Definições de workflows

### Testes
- `tests/unit/context-detector.test.js` - 23 testes
- `tests/unit/git-config-detector.test.js` - 19 testes
- `tests/unit/greeting-builder.test.js` - 23 testes
- `tests/integration/performance.test.js` - Validação de performance

### Configuração
- `.aios-core/core-config.yaml` - Configuração global (seções git + agentIdentity)

### Agentes (Atualizados)
- `.aios-core/agents/dev.md` - Metadata de visibilidade de comandos
- `.aios-core/agents/po.md` - Metadata de visibilidade de comandos
- `.aios-core/agents/*.md` - 9 agentes restantes (atualização pendente)

## Próximos Passos

### Imediato (Corrigir Problemas de Testes)
1. Corrigir problemas de configuração de testes (1-2 horas)
2. Executar suite completa de testes
3. Executar testes de performance

### Curto Prazo (Story 6.1.4 ou 6.1.6)
1. Implementar integração com processo de ativação de agentes
2. Atualizar 9 agentes restantes com metadata de visibilidade de comandos
3. Testar com ativações reais de agentes

### Longo Prazo (Story 6.1.2.6)
1. Implementar aprendizado dinâmico de padrões de workflow
2. Adicionar priorização de comandos baseada em uso
3. Implementar dicas de colaboração entre agentes

## Métricas de Performance

**Alvo (da Story 6.1.2.5):**
- Latência P50: <100ms
- Latência P95: <130ms
- Latência P99: <150ms (limite rígido)

**Esperado (baseado em revisão de código):**
- Git config (cache hit): <5ms
- Git config (cache miss): <50ms
- Detecção de contexto: <50ms
- I/O de arquivo de sessão: <10ms
- Matching de workflow: <20ms
- **Total P99:** ~100-120ms (bem abaixo do limite)

**Otimizações:**
- Execução paralela (Promise.all)
- Cache baseado em TTL
- Proteção de timeout
- Saída antecipada em cache hit

## Compatibilidade Retroativa

**100% Compatível:**
- Agentes sem metadata de visibilidade mostram todos os comandos (max 12)
- Fallback gracioso para simple greeting em qualquer erro
- Zero breaking changes no processo de ativação
- Migração gradual (Fase 1: dev/po -> Fase 2: 9 restantes)

## FAQ

**P: Por que o greeting não está contextual quando ativo um agente agora?**
R: A integração com o processo de ativação ainda não foi implementada. Os componentes existem mas não são chamados automaticamente ainda.

**P: Quando a integração será feita?**
R: Em uma story futura (provavelmente 6.1.4 ou 6.1.6). Depende do sistema de configuração de agentes.

**P: Como posso testar agora?**
R: Use o script de teste: `node .aios-core/development/scripts/test-greeting-system.js`

**P: O que acontece se um agente não tiver metadata de visibilidade?**
R: Fallback: mostra todos os comandos (max 12). Não quebra nada.

**P: Como adiciono metadata de visibilidade nos meus comandos?**
R: Veja a seção "Sistema de Visibilidade de Comandos" acima e os exemplos nos agents dev.md e po.md.

**P: Posso desabilitar o greeting contextual?**
R: Sim, via config: `core-config.yaml` -> `agentIdentity.greeting.contextDetection: false`

---

**Documento Atualizado:** 2025-01-15
**Autor:** Quinn (QA) + Dex (Dev)
**Story:** 6.1.2.5 - Contextual Agent Load System
