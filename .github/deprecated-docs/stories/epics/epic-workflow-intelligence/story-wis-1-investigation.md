# Story WIS-1: Investigation & Architecture Design

**Epic:** Workflow Intelligence System (WIS)
**Story ID:** WIS-1
**Sprint:** 8 (Post Open-Source Launch)
**Priority:** High
**Points:** 5
**Effort:** 8 hours
**Status:** Ready for Execution
**Type:** Investigation

---

## User Story

**Como** arquiteto do AIOS,
**Quero** investigar a viabilidade e definir a arquitetura do Workflow Intelligence System,
**Para** garantir que a implementação seja técnicamente sólida e alinhada com os padrões existentes.

---

## Objective

Realizar investigação técnica e definir arquitetura MVP para o sistema de Workflow Intelligence, considerando:
- Integração com documentação existente (Framework Agnóstico)
- Conexão com Agent Lightning (Story 1.10)
- Viabilidade de implementação
- Custo-benefício de cada componente

---

## Investigation Areas

### 1. Workflow Registry Design

**Perguntas a responder:**
- [ ] Qual formato para definir workflows? (YAML, JSON, código)
- [ ] Como versionar workflows?
- [ ] Como validar workflows?
- [ ] Onde armazenar? (`.aios-core/`, projeto, ambos)

**Análise:**
```yaml
# Investigar estrutura ideal
workflow:
  id: string
  name: string
  version: semver
  trigger: string  # Comando ou condição
  steps:
    - task: string
      agent: string
      next: string | conditions
```

**Deliverable:** Proposta de schema para Workflow Registry

---

### 2. Context Detection

**Perguntas a responder:**
- [ ] Como detectar agente ativo atual?
- [ ] Como rastrear última task executada?
- [ ] Como analisar estado do projeto?
- [ ] Onde persistir contexto de sessão?

**Fontes de contexto:**
```
- Histórico de comandos na sessão
- Agente ativo (arquivo temporário ou memória)
- Git status (branch, changes)
- Arquivos modificados recentemente
- Project status (.aios/project-status.yaml)
```

**Deliverable:** Design do Context Analyzer

---

### 3. Suggestion Engine

**Perguntas a responder:**
- [ ] Qual algoritmo para matching de contexto → workflow?
- [ ] Como lidar com múltiplas sugestões válidas?
- [ ] Como apresentar sugestões ao usuário?
- [ ] Como receber feedback (sugestão foi útil)?

**Abordagens a avaliar:**
1. **Rule-based:** Regras explícitas de transição
2. **Pattern matching:** Match com padrões históricos
3. **ML-based:** Aprendizado com uso (futuro)

**Deliverable:** Design do Suggestion Engine

---

### 4. Integration with Framework Agnóstico

**Perguntas a responder:**
- [ ] Como mapear conceito de "Waves" para o sistema?
- [ ] Como usar Decision Tree Generator para criar decision trees de workflows?
- [ ] Como integrar com os 4 tipos de executores?

**Referências:**
- `docs/standards/AGNOSTIC-PROCESS-MAPPING-FRAMEWORK.md`
- `docs/standards/LATTICEWORK-PROCESS-MAPPING.md`
- `docs/standards/DECISION-TREE-GENERATOR-SYSTEM-PROMPT.md`

**Deliverable:** Mapeamento de conceitos existentes → WIS

---

### 5. Agent Lightning Connection

**Perguntas a responder:**
- [ ] Como reutilizar trace collection da Story 1.10?
- [ ] Como usar RL optimization para melhorar sugestões?
- [ ] Qual é o overlap de funcionalidade?
- [ ] Vale integrar ou manter separado?

**Análise de Story 1.10:**
- Trace collection (útil para pattern capture)
- RL optimization (útil para melhorar sugestões)
- LightningStore (possível usar para patterns?)

**Deliverable:** Proposta de integração com Agent Lightning

---

### 6. Pattern Learning Architecture

**Perguntas a responder:**
- [ ] Como capturar padrões de uso?
- [ ] Como validar se padrão é "bom"?
- [ ] Como separar padrões internos vs comunidade?
- [ ] Qual custo de infraestrutura para comunidade?

**Opções de armazenamento:**
```
Internal:
  - Git (local, versionado)
  - .aios/patterns/ (projeto)

Community:
  - Cloud storage (custo)
  - P2P sharing (complexo)
  - GitHub as storage (free?)
```

**Deliverable:** Architecture Decision Record (ADR) para Pattern Storage

---

## Tasks

### Phase 1: Research (3h)

- [ ] **Task 1.1:** Analisar Framework Agnóstico e extrair conceitos aplicáveis
- [ ] **Task 1.2:** Revisar Story 1.10 e identificar pontos de integração
- [ ] **Task 1.3:** Pesquisar implementações similares (VS Code suggestions, IDE features)
- [ ] **Task 1.4:** Documentar findings em ADR

### Phase 2: Design (3h)

- [ ] **Task 2.1:** Desenhar arquitetura do Workflow Registry
- [ ] **Task 2.2:** Desenhar arquitetura do Context Analyzer
- [ ] **Task 2.3:** Desenhar arquitetura do Suggestion Engine
- [ ] **Task 2.4:** Criar diagramas (Mermaid) da arquitetura

### Phase 3: Validation (2h)

- [ ] **Task 3.1:** Validar design com @architect (Aria)
- [ ] **Task 3.2:** Estimar esforço para cada componente
- [ ] **Task 3.3:** Definir MVP scope (o que entra em WIS-2/WIS-3)
- [ ] **Task 3.4:** Documentar decisões e próximos passos

---

## Deliverables

### 1. Architecture Decision Record (ADR)

**Arquivo:** `docs/architecture/adr-wis-workflow-intelligence.md`

```markdown
# ADR: Workflow Intelligence System Architecture

## Status
Proposed

## Context
[Contexto da decisão]

## Decision
[Decisão tomada]

## Consequences
[Consequências positivas e negativas]
```

### 2. Technical Design Document

**Arquivo:** `docs/architecture/wis-technical-design.md`

Conteúdo:
- Component diagrams
- Data flow diagrams
- API specifications
- Integration points

### 3. MVP Scope Definition

**Arquivo:** Atualização do `EPIC-WIS-INDEX.md`

Definir claramente:
- O que entra no MVP (WIS-2, WIS-3)
- O que fica para depois (WIS-4+)
- Dependências críticas

### 4. Effort Estimates

Atualizar stories WIS-2 a WIS-8 com:
- Estimativas refinadas de esforço
- Dependências identificadas
- Riscos técnicos

---

## Acceptance Criteria

```gherkin
GIVEN the need for a Workflow Intelligence System
WHEN the investigation is complete
THEN:
  - ADR documenta decisões arquiteturais
  - Technical Design está completo e revisado
  - MVP scope está claramente definido
  - Effort estimates estão atualizados
  - Integration points com Agent Lightning estão mapeados
AND the team has enough information to proceed with implementation
```

---

## Dependencies

**Blocked by:**
- Nada (pode iniciar imediatamente)

**Blocks:**
- WIS-2: Workflow Registry
- WIS-3: `*next` Task Universal
- Todas as outras WIS stories

---

## Definition of Done

- [ ] ADR criado e revisado
- [ ] Technical Design Document completo
- [ ] Diagramas de arquitetura criados
- [ ] MVP scope definido
- [ ] Effort estimates atualizados
- [ ] @architect (Aria) validou design
- [ ] Stakeholder aprovou direção

---

## Technical References

### Documentação Existente
- `docs/standards/AGNOSTIC-PROCESS-MAPPING-FRAMEWORK.md`
- `docs/standards/LATTICEWORK-PROCESS-MAPPING.md`
- `docs/standards/DECISION-TREE-GENERATOR-SYSTEM-PROMPT.md`
- `docs/stories/epic-1/story-1.10-enhancement-agent-lightning-integration.md`

### Conceitos-Chave do Framework Agnóstico
- **Task-First:** Tudo começa pela task
- **Waves:** Grupos de execução paralela
- **4 Executores:** Agente, Worker, Humano, Clone
- **Decision Trees:** Árvores de decisão para processos

### Inspirações Externas
- VS Code: Command palette suggestions
- JetBrains: Intention actions
- GitHub Copilot: Context-aware suggestions

---

## Notes

### Considerações de Custo

Para pattern learning com comunidade:
1. **Local-first:** Sem custo, mas sem sharing
2. **GitHub as storage:** Free, mas limitado
3. **Cloud storage:** Custo mensal, escalável
4. **P2P:** Sem custo central, mas complexo

**Recomendação inicial:** Local-first para MVP, cloud opt-in para futuro

### Considerações de Privacy

- Padrões da comunidade devem ser anônimos
- Opt-in explícito necessário
- GDPR compliance se aplicável
- Dados agregados, não individuais

---

**Criado por:** Pax (PO)
**Data:** 2025-12-05
