# Novos Componentes para o MVP do AIOS

As seções a seguir descrevem as novas funcionalidades que serão construídas sobre a arquitetura base do AIOS-FULLSTACK para criar o MVP do AIOS-FULLSTACK.

## Cliente de Memória LlamaIndex (`aios-memory-client`)

*   **Propósito:** Implementar a camada de memória de prototipagem (FR3 MVP). Este componente fornecerá uma interface simples e desacoplada para os agentes registrarem e recuperarem informações, utilizando `LlamaIndex` com persistência em arquivo local.
*   **Localização no Monorepo:** `packages/aios-memory-client/`
*   **Arquitetura:**
    *   Será um pacote TypeScript independente.
    *   Exportará uma classe `MemoryClient` com métodos principais como:
        *   `addMemory(content: string, metadata: object)`: Adiciona uma nova memória, a vetoriza e a armazena.
        *   `searchMemory(query: string, filters: object)`: Realiza uma busca semântica e, em seguida, aplica a filtragem por metadados (`user`, `workspace`, `project`) no código da aplicação.
    *   A instância do `VectorStoreIndex` do LlamaIndex será gerenciada internamente por este cliente.

## Agente de Autodesenvolvimento (`aios-developer`)

*   **Propósito:** Implementar o meta-agente (FR4), a principal funcionalidade do MVP. Este agente será capaz de modificar e estender a própria base de código do AIOS.
*   **Localização no Monorepo:** `.aios-core/agents/aios-developer.md`
*   **Arquitetura:**
    *   Será um novo agente, seguindo a estrutura padrão do framework.
    *   Seus comandos (`*create-agent`, `*create-task`, etc.) acionarão tasks complexas que irão:
        1. Coletar os requisitos do usuário de forma interativa.
        2. Gerar o conteúdo do novo arquivo de componente (ex: o `.md` de um novo agente) com base em um template.
        3. **Criticamente**, o agente irá localizar e modificar programaticamente os arquivos de manifesto relevantes (ex: `agent-teams/team-all.yaml`) para registrar o novo componente, garantindo a integridade do sistema.