# Arquitetura de Alto Nível

## Resumo Técnico

O AIOS-FULLSTACK é um framework modular e extensível para desenvolvimento ágil orientado por IA, construído em **Node.js**. Sua arquitetura é baseada em "agentes" de IA definidos em arquivos Markdown com front matter YAML. Cada agente tem uma persona, comandos e dependências de recursos (tasks, templates, checklists) bem definidos. O sistema opera através de um CLI (`npx aios-fullstack install`) para instalação e um construtor para criar pacotes para plataformas web.

## Pilha de Tecnologia Atual

| Categoria | Tecnologia | Versão | Notas |
| ---| ---| ---| --- |
| Runtime | Node.js | \>=20.0.0 | Plataforma de execução para todos os scripts e ferramentas. |
| Linguagem de Definição | Markdown + YAML | N/A | Usado para definir agentes, tasks, e outros artefatos. |
| Gerenciador de Pacotes | npm | N/A | Gerencia as dependências do ferramental. |
| Dependências Chave | `inquirer`, `fs-extra`, `js-yaml` | Variadas | Ferramentas para o instalador CLI e o construtor. |

## Estrutura de Diretórios do Projeto

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

## Componentes Chave (Módulos)

*   **Núcleo (****`aios-core/`****):** O coração do framework, contendo as definições para todos os `agents`, `tasks`, `workflows`, `templates`, e `checklists` que compõem a lógica do sistema.
*   **Comum (****`common/`****):** Abriga tasks e utilitários reutilizáveis que são compartilhados por múltiplos componentes do núcleo.
*   **Ferramentas (****`tools/`****):** Contém os scripts operacionais, incluindo o `installer` CLI interativo e o `web-builder` para compilar os pacotes para plataformas web.
*   **Pacotes de Expansão (****`expansion-packs/`****):** Diretório que contém módulos para estender a funcionalidade do AIOS-FULLSTACK para domínios específicos, como desenvolvimento de jogos ou DevOps.
