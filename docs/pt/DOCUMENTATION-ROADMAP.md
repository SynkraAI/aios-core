<!--
  Tradução: PT-BR
  Original: /docs/DOCUMENTATION-ROADMAP.md
  Última sincronização: 2026-01-28
-->

# Roadmap de Documentação AIOS

> 🌐 [EN](../DOCUMENTATION-ROADMAP.md) | **PT** | [ES](../es/DOCUMENTATION-ROADMAP.md)

---

**Criado:** 2026-01-26
**Status:** Ativo
**Responsável:** @devops (Gage)

---

## Resumo Executivo

Este roadmap aborda **33 documentos faltantes** identificados durante a auditoria de links da documentação.
Após análise, eles são categorizados em:

| Categoria      | Quantidade | Ação                         |
| -------------- | ---------- | ---------------------------- |
| **Criar**      | 10         | Novos documentos necessários |
| **Consolidar** | 8          | Mesclar em docs existentes   |
| **Descartar**  | 15         | Obsoletos/redundantes        |

---

## Fase 1: Alta Prioridade (Imediato)

### 1.1 Segurança e Configuração

| Documento                    | Localização             | Complexidade | Descrição                                   |
| ---------------------------- | ----------------------- | ------------ | ------------------------------------------- |
| `mcp-api-keys-management.md` | `docs/en/architecture/` | Média        | Segurança e gerenciamento de chaves API MCP |

**Esboço do conteúdo:**

- [ ] Melhores práticas de armazenamento de chaves API
- [ ] Configuração de variáveis de ambiente
- [ ] Secrets do Docker MCP Toolkit
- [ ] Considerações de segurança
- [ ] Procedimentos de rotação

### 1.2 Onboarding de Usuários

| Documento             | Localização             | Complexidade | Descrição                                 |
| --------------------- | ----------------------- | ------------ | ----------------------------------------- |
| `v4-quick-start.md` | `docs/en/installation/` | Simples      | Guia de início rápido para novos usuários |

**Esboço do conteúdo:**

- [ ] Setup em 5 minutos
- [ ] Checklist de pré-requisitos
- [ ] Primeira ativação de agente
- [ ] Passos de verificação
- [ ] Links para próximos passos

---

## Fase 2: Prioridade Média (Próximo Sprint)

### 2.1 Guias para Desenvolvedores

| Documento                         | Localização             | Complexidade | Descrição                             |
| --------------------------------- | ----------------------- | ------------ | ------------------------------------- |
| `agent-tool-integration-guide.md` | `docs/en/architecture/` | Complexa     | Como integrar ferramentas com agentes |
| `dependency-resolution-plan.md`   | `docs/en/architecture/` | Média        | Estratégia de dependência de módulos  |

### 2.2 Documentos de Planejamento

| Documento                                       | Localização        | Complexidade | Descrição                             |
| ----------------------------------------------- | ------------------ | ------------ | ------------------------------------- |
| `stories/1.8-phase-3-workflow-orchestration.md` | `docs/en/stories/` | Média        | Story do módulo de orquestração       |
| `stories/1.9-missing-pv-agents.md`              | `docs/en/stories/` | Simples      | Rastreamento de completude de agentes |

### 2.3 Documentação de Referência

| Documento              | Localização                  | Complexidade | Descrição                          |
| ---------------------- | ---------------------------- | ------------ | ---------------------------------- |
| `coderabbit/README.md` | `docs/en/guides/coderabbit/` | Simples      | Guia de configuração do CodeRabbit |

---

## Fase 3: Baixa Prioridade (Backlog)

### 3.1 Arquitetura

| Documento                              | Localização             | Complexidade | Descrição                               |
| -------------------------------------- | ----------------------- | ------------ | --------------------------------------- |
| `multi-repo-strategy.md`               | `docs/en/architecture/` | Complexa     | Organização multi-repositório           |
| `mvp-components.md`                    | `docs/en/architecture/` | Simples      | Componentes mínimos viáveis             |
| `schema-comparison-sqlite-supabase.md` | `docs/en/architecture/` | Média        | Comparação de schemas de banco de dados |

---

## Plano de Consolidação

Estes documentos devem ser **mesclados na documentação existente**:

| Documento Faltante                                | Mesclar Em                                   | Ação                                |
| ------------------------------------------------- | -------------------------------------------- | ----------------------------------- |
| `installation/migration-migration-guide.md`          | `migration-guide.md`                         | Adicionar seção v2.0→v4.0.4           |
| `migration-migration-guide.md`                       | `migration-guide.md`                         | Mesmo que acima                     |
| `coderabbit-integration-decisions.md`             | `architecture/adr/`                          | Criar novo ADR                      |
| `technical-review-greeting-system-unification.md` | `guides/contextual-greeting-system-guide.md` | Adicionar seção técnica             |
| `hybrid-ops-pv-mind-integration.md`               | `architecture/high-level-architecture.md`    | Adicionar seção de integração       |
| `repository-migration-plan.md`                    | `migration-guide.md`                         | Adicionar seção de migração de repo |
| `internal-tools-analysis.md`                      | `.aios-core/infrastructure/tools/README.md`  | Referenciar existente               |
| `.aios-core/core/registry/README.md`              | **JÁ EXISTE**                                | Nenhuma ação necessária             |

---

## Lista de Descarte

Estes documentos são **obsoletos ou redundantes** e NÃO devem ser criados:

| Documento                                            | Motivo                                                 |
| ---------------------------------------------------- | ------------------------------------------------------ |
| `architect-Squad-rearchitecture.md`                  | Coberto em `squad-improvement-recommended-approach.md` |
| `analysis/Squads-dependency-analysis.md`             | Análise pontual; sistema de squads maduro              |
| `analysis/Squads-structure-inventory.md`             | Dinâmico; melhor mantido via scripts                   |
| `analysis/subdirectory-migration-impact-analysis.md` | Migração concluída                                     |
| `analysis/tools-system-analysis-log.md`              | Logs efêmeros; sistema de ferramentas estável          |
| `analysis/tools-system-gap-analysis.md`              | Análise de gaps concluída                              |
| `tools-system-brownfield.md`                         | Incorporado na task `analyze-brownfield.md`            |
| `tools-system-handoff.md`                            | Doc de processo, não permanente                        |
| `tools-system-schema-refinement.md`                  | Refinamento concluído                                  |
| `analysis/scripts-consolidation-analysis.md`         | Scripts já consolidados                                |
| `analysis/repository-strategy-analysis.md`           | Estratégia definida no ARCHITECTURE-INDEX              |
| `SYNKRA-REBRANDING-SPECIFICATION.md`                 | Rebranding concluído                                   |
| `multi-repo-strategy-pt.md`                          | Usar estrutura `docs/pt-BR/` em vez disso              |

---

## Cronograma de Implementação

```
Semana 1 (Fase 1)
├── Dia 1-2: mcp-api-keys-management.md
└── Dia 3-4: v4-quick-start.md

Semana 2-3 (Fase 2)
├── Dia 1-3: agent-tool-integration-guide.md
├── Dia 4-5: dependency-resolution-plan.md
├── Dia 6: stories/1.8 & 1.9
└── Dia 7: coderabbit/README.md

Semana 4 (Fase 3 + Consolidação)
├── Dia 1-2: Tarefas de consolidação
├── Dia 3-4: multi-repo-strategy.md (se necessário)
└── Dia 5: mvp-components.md
```

---

## Requisitos de Tradução

Todos os novos documentos devem ser criados em **3 idiomas**:

- `docs/en/` - Inglês (primário)
- `docs/pt-BR/` - Português (Brasil)
- `docs/es/` - Espanhol

**Fluxo de tradução:**

1. Criar versão em inglês primeiro
2. Usar @dev ou agente de tradução para PT-BR e ES
3. Revisar traduções para precisão técnica

---

## Critérios de Sucesso

- [ ] Todos os documentos da Fase 1 criados e revisados
- [ ] Todos os documentos da Fase 2 criados e revisados
- [ ] Tarefas de consolidação concluídas
- [ ] Zero links quebrados na documentação
- [ ] Todos os documentos disponíveis em 3 idiomas

---

## Acompanhamento de Progresso

### Fase 1

- [ ] `mcp-api-keys-management.md` (EN/PT-BR/ES)
- [ ] `v4-quick-start.md` (EN/PT-BR/ES)

### Fase 2

- [ ] `agent-tool-integration-guide.md` (EN/PT-BR/ES)
- [ ] `dependency-resolution-plan.md` (EN/PT-BR/ES)
- [ ] `stories/1.8-phase-3-workflow-orchestration.md` (apenas EN)
- [ ] `stories/1.9-missing-pv-agents.md` (apenas EN)
- [ ] `coderabbit/README.md` (EN/PT-BR/ES)

### Fase 3

- [ ] `multi-repo-strategy.md` (EN/PT-BR/ES)
- [ ] `mvp-components.md` (EN/PT-BR/ES)
- [ ] `schema-comparison-sqlite-supabase.md` (apenas EN)

### Consolidação

- [ ] Seção de guia de migração v2.0→v4.0.4 adicionada
- [ ] ADR para decisões do CodeRabbit criado
- [ ] Seção técnica do guia do sistema de saudação adicionada

---

**Última Atualização:** 2026-01-28
**Próxima Revisão:** Após conclusão da Fase 1
