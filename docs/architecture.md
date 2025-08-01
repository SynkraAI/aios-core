# architecture.md

# AIOS-FULLSTACK - Arquitetura de Base para o MVP do AIOS (v3 Final)

## Introdução

Este documento captura o estado atual do codebase do **AIOS-FULLSTACK**, servindo como a arquitetura de referência para o desenvolvimento da **Fase 1 do AIOS-FULLSTACK (MVP até o FR4)**. Ele descreve os padrões, componentes e tecnologias existentes sobre os quais as novas funcionalidades serão construídas.

### Escopo do Documento

Documentação abrangente do framework AIOS-FULLSTACK para servir como baseline para o MVP do AIOS, que inclui: Rebranding, Workflow de Setup de IDE, Camada de Memória com LlamaIndex e o Meta-Agente `aios-developer`.

### Registro de Alterações

| Data | Versão | Descrição | Autor |
| :--- | :--- | :--- | :--- | :--- |
| 2025-07-24 | 1.0 | Geração inicial da arquitetura base. | Winston |
| 2025-07-24 | 2.0 | Estrutura de diretórios corrigida com base no input do usuário. | Winston |
| 2025-07-24 | 3.0 | Adição dos novos componentes do MVP. | Winston |

## Arquitetura de Alto Nível

### Resumo Técnico

O AIOS-FULLSTACK é um framework modular e extensível para desenvolvimento ágil orientado por IA, construído em **Node.js**. Sua arquitetura é baseada em "agentes" de IA definidos em arquivos Markdown com front matter YAML. Cada agente tem uma persona, comandos e dependências de recursos (tasks, templates, checklists) bem definidos. O sistema opera através de um CLI (`npx aios-fullstack install`) para instalação e um construtor para criar pacotes para plataformas web.

### Pilha de Tecnologia Atual

| Categoria | Tecnologia | Versão | Notas |
| ---| ---| ---| --- |
| Runtime | Node.js | \>=20.0.0 | Plataforma de execução para todos os scripts e ferramentas. |
| Linguagem de Definição | Markdown + YAML | N/A | Usado para definir agentes, tasks, e outros artefatos. |
| Gerenciador de Pacotes | npm | N/A | Gerencia as dependências do ferramental. |
| Dependências Chave | `inquirer`, `fs-extra`, `js-yaml` | Variadas | Ferramentas para o instalador CLI e o construtor. |

### Estrutura de Diretórios do Projeto

```plain
aios-fullstack/
├── README.md
├── package.json
├── aios-core/
│   ├── core-config.yaml
│   ├── agent-teams/
│   ├── agents/
│   ├── checklists/
│   ├── data/
│   ├── tasks/
│   ├── templates/
│   └── workflows/
├── common/
│   ├── tasks/
│   └── utils/
├── docs/
├── expansion-packs/
└── tools/
    ├── builders/
    ├── installer/
    └── lib/
```

### Componentes Chave (Módulos)

*   **Núcleo (****`aios-core/`****):** O coração do framework, contendo as definições para todos os `agents`, `tasks`, `workflows`, `templates`, e `checklists` que compõem a lógica do sistema.
*   **Comum (****`common/`****):** Abriga tasks e utilitários reutilizáveis que são compartilhados por múltiplos componentes do núcleo.
*   **Ferramentas (****`tools/`****):** Contém os scripts operacionais, incluindo o `installer` CLI interativo e o `web-builder` para compilar os pacotes para plataformas web.
*   **Pacotes de Expansão (****`expansion-packs/`****):** Diretório que contém módulos para estender a funcionalidade do AIOS-FULLSTACK para domínios específicos, como desenvolvimento de jogos ou DevOps.

## Novos Componentes para o MVP do AIOS

As seções a seguir descrevem as novas funcionalidades que serão construídas sobre a arquitetura base do AIOS-FULLSTACK para criar o MVP do AIOS-FULLSTACK.

### Cliente de Memória LlamaIndex (`aios-memory-client`)

*   **Propósito:** Implementar a camada de memória de prototipagem (FR3 MVP). Este componente fornecerá uma interface simples e desacoplada para os agentes registrarem e recuperarem informações, utilizando `LlamaIndex` com persistência em arquivo local.
*   **Localização no Monorepo:** `packages/aios-memory-client/`
*   **Arquitetura:**
    *   Será um pacote TypeScript independente.
    *   Exportará uma classe `MemoryClient` com métodos principais como:
        *   `addMemory(content: string, metadata: object)`: Adiciona uma nova memória, a vetoriza e a armazena.
        *   `searchMemory(query: string, filters: object)`: Realiza uma busca semântica e, em seguida, aplica a filtragem por metadados (`user`, `workspace`, `project`) no código da aplicação.
    *   A instância do `VectorStoreIndex` do LlamaIndex será gerenciada internamente por este cliente.

### Agente de Autodesenvolvimento (`aios-developer`)

*   **Propósito:** Implementar o meta-agente (FR4), a principal funcionalidade do MVP. Este agente será capaz de modificar e estender a própria base de código do AIOS.
*   **Localização no Monorepo:** `.aios-core/agents/aios-developer.md`
*   **Arquitetura:**
    *   Será um novo agente, seguindo a estrutura padrão do framework.
    *   Seus comandos (`*create-agent`, `*create-task`, etc.) acionarão tasks complexas que irão:
        1. Coletar os requisitos do usuário de forma interativa.
        2. Gerar o conteúdo do novo arquivo de componente (ex: o `.md` de um novo agente) com base em um template.
        3. **Criticamente**, o agente irá localizar e modificar programaticamente os arquivos de manifesto relevantes (ex: `agent-teams/team-all.yaml`) para registrar o novo componente, garantindo a integridade do sistema.