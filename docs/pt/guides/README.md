<!--
  Tradução: PT-BR
  Original: /docs/en/guides/README.md
  Última sincronização: 2026-01-26
-->

# Guias AIOS

> 🌐 [EN](../../guides/README.md) | **PT** | [ES](../../es/guides/README.md)

---

Índice completo de documentação para os guias do sistema AIOS.

---

## Configuração MCP (Docker MCP Toolkit)

**Status:** Pronto para Produção
**Redução de Tokens:** 85%+ (vs MCPs diretos)
**Tempo de Setup:** 10-20 minutos

### Início Rápido

**Quer configuração MCP otimizada?**
Use o agente DevOps: `@devops` e então `*setup-mcp-docker`

### Comandos de Gerenciamento MCP

| Comando             | Descrição                                | Agente  |
| ------------------- | ---------------------------------------- | ------- |
| `*setup-mcp-docker` | Setup inicial do Docker MCP Toolkit      | @devops |
| `*search-mcp`       | Pesquisar MCPs disponíveis no catálogo   | @devops |
| `*add-mcp`          | Adicionar servidor MCP ao gateway Docker | @devops |
| `*list-mcps`        | Listar MCPs habilitados atualmente       | @devops |
| `*remove-mcp`       | Remover MCP do gateway Docker            | @devops |

### Referência de Arquitetura

| Guia                                                                              | Propósito                           | Tempo  | Público           |
| --------------------------------------------------------------------------------- | ----------------------------------- | ------ | ----------------- |
| **[Guia de Setup Global MCP](./mcp-global-setup.md)**                             | Configuração global de servidor MCP | 10 min | Todos os usuários |
| **[Gerenciamento de Chaves API MCP](../architecture/mcp-api-keys-management.md)** | Manuseio seguro de credenciais      | 10 min | DevOps            |

> **Nota:** A documentação do 1MCP foi descontinuada. O AIOS agora usa exclusivamente o Docker MCP Toolkit (Story 5.11). Documentos arquivados disponíveis em `.github/deprecated-docs/guides/`.

---

## Documentação do Framework v4.2

**Status:** Completo (Story 2.16)
**Versão:** 2.1.0
**Última Atualização:** 2025-12-17

### Arquitetura Principal

| Guia                                                                      | Propósito                               | Tempo  | Público                       |
| ------------------------------------------------------------------------- | --------------------------------------- | ------ | ----------------------------- |
| **[Arquitetura do Sistema de Módulos](../architecture/module-system.md)** | Arquitetura modular v4.2 (4 módulos)    | 15 min | Arquitetos, Desenvolvedores   |
| **[Guia de Service Discovery](./service-discovery.md)**                   | Descoberta de workers e API do registro | 10 min | Desenvolvedores               |
| **[Guia de Migração v2.0→v4.0.4](../../migration/migration-guide.md)**         | Instruções passo a passo de migração    | 20 min | Todos os usuários atualizando |

### Configuração do Sistema

| Guia                                                    | Propósito                             | Tempo  | Público           |
| ------------------------------------------------------- | ------------------------------------- | ------ | ----------------- |
| **[Guia de Quality Gates](./quality-gates.md)**         | Sistema de quality gates de 3 camadas | 15 min | QA, DevOps        |
| **[Guia do Quality Dashboard](./quality-dashboard.md)** | Visualização de métricas no dashboard | 10 min | Tech Leads, QA    |
| **[Guia de Setup Global MCP](./mcp-global-setup.md)**   | Configuração global de servidor MCP   | 10 min | Todos os usuários |

### Ferramentas de Desenvolvimento (Sprint 3)

| Guia                                              | Propósito                      | Tempo  | Público         |
| ------------------------------------------------- | ------------------------------ | ------ | --------------- |
| **[Template Engine v2](./template-engine-v2.md)** | Motor de geração de documentos | 10 min | Desenvolvedores |

### Navegação Rápida (v4)

**...entender a arquitetura de 4 módulos**
→ [`module-system.md`](../architecture/module-system.md) (15 min)

**...descobrir workers e tasks disponíveis**
→ [`service-discovery.md`](./service-discovery.md) (10 min)

**...migrar de v2.0 para v4.0.4**
→ [`migration-guide.md`](../../migration/migration-guide.md) (20 min)

**...configurar quality gates**
→ [`quality-gates.md`](./quality-gates.md) (15 min)

**...monitorar dashboard de métricas de qualidade**
→ [`quality-dashboard.md`](./quality-dashboard.md) (10 min)

**...usar o template engine**
→ [`template-engine-v2.md`](./template-engine-v2.md) (10 min)

**...configurar integração CodeRabbit**

**...configurar servidores MCP globais**
→ [`mcp-global-setup.md`](./mcp-global-setup.md) (10 min)

---

## Outros Guias

- [Guia de Referência de Agentes](../agent-reference-guide.md)
- [Guia de Workflow Git](../git-workflow-guide.md)
- [Primeiros Passos](../getting-started.md)
- [Solução de Problemas de Instalação](./installation-troubleshooting.md)
- [Solução de Problemas](../troubleshooting.md)

---

## Documentação do Sprint 3

| Documento                                           | Linhas | Status   |
| --------------------------------------------------- | ------ | -------- |
| [Guia de Quality Gates](./quality-gates.md)         | ~600   | Completo |
| [Guia do Quality Dashboard](./quality-dashboard.md) | ~350   | Completo |
| [Template Engine v2](./template-engine-v2.md)       | ~400   | Completo |
| [Integração CodeRabbit](../../guides/coderabbit/)   | ~1000  | Completo |

---

## Suporte

- **GitHub Issues:** Marque `documentation`, `guides`, `mcp`
- **Especialistas:** Veja arquivo CODEOWNERS

---

**Última Atualização:** 2025-12-17
**Versão:** 2.1 (Story 6.14)
