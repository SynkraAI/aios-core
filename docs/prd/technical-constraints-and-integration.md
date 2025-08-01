# Seção 4: Restrições Técnicas e Requisitos de Integração

A implementação será dividida em duas fases com diferentes restrições técnicas.

### **Fase 1: Desenvolvimento do MVP (Até a conclusão do FR4)**

*   **Framework Base:** O desenvolvimento será feito utilizando a arquitetura e as ferramentas existentes do **AIOS-FULLSTACK**.
*   **Agentes:** Usaremos os agentes padrão do AIOS-FULLSTACK (`pm`, `architect`, `dev`, etc.).
*   **Memória (FR3 MVP):** A camada de memória com `LlamaIndex` será implementada como um pacote dentro da estrutura atual do AIOS-FULLSTACK.
*   **Restrições:** As restrições técnicas do AIOS-FULLSTACK atual se aplicam. Não introduziremos LangGraph, Hetzner, ou a arquitetura de microserviços nesta fase.
*   **Resultado Final da Fase:** Uma versão do framework, rebatizada como **AIOS-FULLSTACK**, que inclui o `aios-developer` (FR4) e está pronta para ser distribuída via `npx`.

### **Fase 2: Desenvolvimento Pós-MVP (Do FR5 em diante)**

*   **Framework Base:** Usaremos o **AIOS-FULLSTACK MVP** para se autodesenvolver.
*   **Refatoração do Núcleo:** Iniciaremos a implementação da visão arquitetônica final.
    *   **Pilha de Tecnologia:** Transição para **LangGraph**, **Deno**, e a infraestrutura **Supabase + Hetzner**.
    *   **Abordagem de Integração:** Implementação do **Padrão de Integração Híbrido**.
    *   **Organização de Código:** A estrutura de **Monorepo** com Turborepo será formalizada.
    *   **Implantação e Risco:** As estratégias de implantação via **GitHub Actions** e de **rollback** se aplicam totalmente a esta fase.
    *   **Migração da Memória (FR8):** O `aios-developer` será usado para construir a migração da camada de memória de `LlamaIndex` para a solução final no **Supabase**.
