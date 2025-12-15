# Seção 4: Restrições Técnicas e Requisitos de Integração

A implementação será dividida em duas fases com diferentes restrições técnicas.

### **Fase 1: Desenvolvimento do MVP (Até a conclusão do FR4)**

*   **Framework Base:** O desenvolvimento será feito utilizando a arquitetura e as ferramentas existentes do **AIOS-FULLSTACK**.
*   **Agentes:** Usaremos os agentes padrão do AIOS-FULLSTACK (`pm`, `architect`, `dev`, etc.).
*   **Memória (FR3 MVP):** A camada de memória com `LlamaIndex` será implementada como um pacote dentro da estrutura atual do AIOS-FULLSTACK.
*   **Restrições:** As restrições técnicas do AIOS-FULLSTACK atual se aplicam. Não introduziremos LangGraph, Hetzner, ou a arquitetura de microserviços nesta fase.
*   **Resultado Final da Fase:** Uma versão do framework, rebatizada como **AIOS-FULLSTACK**, que inclui o `aios-developer` (FR4) e está pronta para ser distribuída via `npx`.

### **Fase 2: Desenvolvimento Pós-MVP (FR5 em diante)**

*   **Framework Base:** Usaremos o **AIOS-FULLSTACK MVP** para se autodesenvolver.
*   **Evoluções Incrementais:** Implementação de melhorias na arquitetura existente.
    *   **Sistema de Tools (FR5):** ✅ **Completo** - Sistema centralizado com Schema v2.0, 12 tools documentadas, validation system
    *   **Migração da Memória (FR6):** 📋 **Próximo** - Transição de `LlamaIndex` local para **Supabase** com pgvector
    *   **Infraestrutura:** Supabase para persistência durável, RLS para segurança, observabilidade
    *   **Organização de Código:** Manter estrutura atual modular com expansion packs
    *   **Implantação e Risco:** Estratégias de implantação via **GitHub Actions** e de **rollback**
    *   **Autodesenvolvimento:** O `aios-developer` será usado para construir/migrar componentes do framework
