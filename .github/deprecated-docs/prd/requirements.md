# Seção 2: Requisitos

**Requisitos Funcionais (FR):**

1. **FR1:** O sistema deve ser completamente renomeado de "AIOS-Method" para "AIOS-FULLSTACK", incluindo todos os artefatos, arquivos e referências internas. ✅ **Completo**
2. **FR2:** O agente `aios-master` deve possuir um workflow (`setup-environment`) capaz de configurar o ambiente de desenvolvimento para Windsurf, Cursor e Claude Code, criando e atualizando os arquivos de regras. ✅ **Completo**
3. **FR3 (MVP):** O sistema deve implementar uma camada de memória para prototipagem utilizando `LlamaIndex` com `SimpleVectorStore`. A persistência inicial será em sistema de arquivos local para acelerar o desenvolvimento e os testes dos agentes. ✅ **Completo**
4. **FR4 (Marco do MVP):** Deve existir um agente `aios-developer` (Meta-Agente) capaz de criar novos componentes do framework (agentes, tasks, workflows) e atualizar automaticamente os manifestos do sistema para manter a integridade. ✅ **Completo**
5. **FR5 (Pós-MVP):** Implementar sistema centralizado de Tools (MCP, CLI, API, Local) com Schema v2.0, suportando ferramentas simples e complexas com executable knowledge, validation system e backward compatibility 100%. ✅ **Completo**
6. **(PÓS-MVP) FR6:** Migrar a camada de memória de `LlamaIndex` para a arquitetura de produção final com **Supabase** (pgvector, RLS, checkpointing, observabilidade). 📋 **Planejado**

**Requisitos Não-Funcionais (NFR):**

1. **NFR1:** A arquitetura deve ser modular e extensível, permitindo evolução independente de componentes (agentes, tasks, tools, memory).
2. **NFR2:** O sistema deve possuir observabilidade total, com logging estruturado e telemetria para análise de performance.
3. **NFR3 (Supabase):** A persistência de estado deve ser durável quando migrada para Supabase, com RLS e backup automático.
4. **NFR4 (Supabase):** A segurança deve ser implementada em múltiplas camadas, incluindo validação de inputs, isolamento de dados e RLS no Supabase.
5. **NFR5 (Supabase):** O sistema deve ser projetado para alta performance na camada de memória, com metas de latência (P99 < 5s para similarity search) e throughput adequado para uso em produção.

**Requisitos de Compatibilidade (CR):**

1. **CR1:** A nova arquitetura deve ser implementada como uma evolução do codebase do `AIOS-Method`, mantendo a compatibilidade com seus conceitos fundamentais.
2. **CR2:** As migrações de banco de dados no Supabase devem ser reversíveis.
3. **CR3:** A estratégia de rollback (tags Git, feature flags) deve garantir que o sistema possa ser revertido para um estado estável.
