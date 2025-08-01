# prd.md

# AIOS-FULLSTACK Brownfield Enhancement PRD

## Seção 1: Análise Introdutória do Projeto e Contexto

**Visão Geral do Projeto Existente:**

*   **Fonte da Análise:** A análise se baseia em nossa colaboração contínua, na "Pesquisa Aprofundada: Ecossistema e Arquitetura de Dados para Agentes em LangGraph" e no "Documento de Arquitetura Técnica: AIOS com LangGraph Nativo v2.0".
*   **Estado Atual do Projeto:** O projeto base é o framework `AIOS-Method`, uma metodologia de desenvolvimento ágil orientada por agentes de IA. Ele possui uma estrutura modular com agentes especializados, templates e workflows definidos.

**Análise da Documentação Disponível:**

*   A documentação existente é a própria base de código do AIOS-Method e os artefatos que criamos:
    - [x]     Documento de Arquitetura Técnica (AIOS com LangGraph Nativo v2.0)
    - [x]     Pesquisa de Ecossistema LangGraph
    - [x]     Padrões de Código e Estrutura de Diretórios (definidos na arquitetura)
    - [x]     Especificações de API (definidas como "Contratos de Eventos")
    - [x]     Documentação de Débito Técnico (implícita na decisão de evoluir o framework)

**Definição do Escopo do Aprimoramento:**

*   **Tipo de Aprimoramento:**
    - [x]     Modificação de Funcionalidade Principal
    - [x]     Integração com Novos Sistemas (Supabase, Hetzner)
    - [x]     Atualização da Pilha de Tecnologia (mudança para LangGraph nativo)
*   **Descrição do Aprimoramento:** Evoluir o `AIOS-Method` para o **AIOS-FULLSTACK**, um sistema de orquestração de agentes de IA nativo em LangGraph, com uma camada de memória persistente e compartilhada via Supabase, e capacidades de autodesenvolvimento.
*   **Avaliação de Impacto:**
    - [x]     **Impacto Maior (alterações arquitetônicas necessárias):** A mudança para LangGraph como núcleo e a introdução da memória persistente representam uma re-arquitetura fundamental do sistema.

**Metas e Contexto de Fundo:**

*   **Metas:**
    *   Criar um sistema de agentes mais resiliente e com estado durável.
    *   Habilitar a colaboração entre múltiplos usuários no mesmo projeto através de uma memória compartilhada.
    *   Aumentar a flexibilidade e o poder de orquestração com uma arquitetura nativa em grafos.
    *   Estabelecer a capacidade de o próprio framework se autodesenvolver.
*   **Contexto:** A necessidade de superar as limitações de um sistema sem estado e de aumentar a capacidade de automação e colaboração impulsiona a evolução para a arquitetura AIOS.

**Registro de Alterações:**

| Mudança | Data | Versão | Descrição | Autor |
| ---| ---| ---| ---| --- |
| Criação do PRD | 2025-07-24 | 1.0 | Rascunho inicial do documento | John (PM) |

## Seção 2: Requisitos

**Requisitos Funcionais (FR):**

1. **FR1:** O sistema deve ser completamente renomeado de "AIOS-Method" para "AIOS-FULLSTACK", incluindo todos os artefatos, arquivos e referências internas.
2. **FR2:** O agente `aios-master` deve possuir um workflow (`setup-environment`) capaz de configurar o ambiente de desenvolvimento para Windsurf, Cursor e Claude Code, criando e atualizando os arquivos de regras.
3. **FR3 (MVP):** O sistema deve implementar uma camada de memória para prototipagem utilizando `LlamaIndex` com `SimpleVectorStore`. A persistência inicial será em sistema de arquivos local para acelerar o desenvolvimento e os testes dos agentes.
4. **FR4:** Deve existir um agente `aios-developer` (Meta-Agente) capaz de criar novos componentes do framework (agentes, tasks, workflows) e atualizar automaticamente os manifestos do sistema para manter a integridade.
5. **FR5:** Deve existir um agente `aios-langgraph-expert` capaz de criar agentes complexos baseados em LangGraph.
6. **FR6:** O agente `aios-langgraph-expert` deve ser capaz de criar pontos de intervenção humana (Human-in-the-Loop) que se integram com ClickUp e WhatsApp.
7. **FR7:** O agente `aios-langgraph-expert` deve possuir um workflow para receber um JSON de workflow do n8n, interpretá-lo e reproduzi-lo como um grafo funcional em LangGraph.
8. **(PÓS-MVP) FR8:** Migrar a camada de memória de `LlamaIndex` para a arquitetura de produção final com **Supabase**.

**Requisitos Não-Funcionais (NFR):**

1. **NFR1:** A arquitetura deve ser orientada a eventos, com o LangGraph como núcleo de orquestração.
2. **NFR2:** O sistema deve possuir observabilidade total, com integração nativa com LangSmith para tracing e telemetria para Prometheus/Grafana.
3. **NFR3:** A persistência de estado deve ser durável, utilizando o sistema de checkpointing do LangGraph para garantir a recuperação de falhas.
4. **NFR4:** A segurança deve ser implementada em múltiplas camadas, incluindo JWT, validação de workspace e RLS no Supabase.
5. **NFR5:** O sistema deve ser projetado para alta performance, com metas de latência (P99 < 5s) e throughput (1M eventos/min).

**Requisitos de Compatibilidade (CR):**

1. **CR1:** A nova arquitetura deve ser implementada como uma evolução do codebase do `AIOS-Method`, mantendo a compatibilidade com seus conceitos fundamentais.
2. **CR2:** As migrações de banco de dados no Supabase devem ser reversíveis.
3. **CR3:** A estratégia de rollback (tags Git, feature flags) deve garantir que o sistema possa ser revertido para um estado estável.

## Seção 3: Metas de Aprimoramento da Interface do Usuário

Não Aplicável (N/A) para o escopo atual.

## Seção 4: Restrições Técnicas e Requisitos de Integração

A implementação será dividida em duas fases com diferentes restrições técnicas.

#### **Fase 1: Desenvolvimento do MVP (Até a conclusão do FR4)**

*   **Framework Base:** O desenvolvimento será feito utilizando a arquitetura e as ferramentas existentes do **AIOS-FULLSTACK**.
*   **Agentes:** Usaremos os agentes padrão do AIOS-FULLSTACK (`pm`, `architect`, `dev`, etc.).
*   **Memória (FR3 MVP):** A camada de memória com `LlamaIndex` será implementada como um pacote dentro da estrutura atual do AIOS-FULLSTACK.
*   **Restrições:** As restrições técnicas do AIOS-FULLSTACK atual se aplicam. Não introduziremos LangGraph, Hetzner, ou a arquitetura de microserviços nesta fase.
*   **Resultado Final da Fase:** Uma versão do framework, rebatizada como **AIOS-FULLSTACK**, que inclui o `aios-developer` (FR4) e está pronta para ser distribuída via `npx`.

#### **Fase 2: Desenvolvimento Pós-MVP (Do FR5 em diante)**

*   **Framework Base:** Usaremos o **AIOS-FULLSTACK MVP** para se autodesenvolver.
*   **Refatoração do Núcleo:** Iniciaremos a implementação da visão arquitetônica final.
    *   **Pilha de Tecnologia:** Transição para **LangGraph**, **Deno**, e a infraestrutura **Supabase + Hetzner**.
    *   **Abordagem de Integração:** Implementação do **Padrão de Integração Híbrido**.
    *   **Organização de Código:** A estrutura de **Monorepo** com Turborepo será formalizada.
    *   **Implantação e Risco:** As estratégias de implantação via **GitHub Actions** e de **rollback** se aplicam totalmente a esta fase.
    *   **Migração da Memória (FR8):** O `aios-developer` será usado para construir a migração da camada de memória de `LlamaIndex` para a solução final no **Supabase**.

## Seção 5: Estrutura de Épicos e Estórias

*   **Épico 1: Rebranding e Fundação do AIOS-FULLSTACK**
    *   **Objetivo:** Renomear completamente o framework AIOS-Method para AIOS-FULLSTACK.
*   **Épico 2: Workflow de Configuração de Ambiente de Desenvolvimento (IDE)**
    *   **Objetivo:** Implementar a task `setup-environment` no `aios-master`.
*   **Épico 3: Camada de Memória de Prototipagem com LlamaIndex (MVP)**
    *   **Objetivo:** Implementar a camada de memória inicial usando `LlamaIndex` com persistência local.
*   **Épico 4: Agente Especialista em Autodesenvolvimento (Meta-Agente)**
    *   **Objetivo:** Construir o `aios-developer`, o agente capaz de criar e modificar os componentes internos do framework. (**_Marco de conclusão do MVP_**)
*   **Épico 5: Agente Especialista em LangGraph**
    *   **Objetivo:** Utilizar o `aios-developer` para construir o `aios-langgraph-expert`.
*   **Épico 6: Migração da Camada de Memória para Supabase (Pós-MVP)**
    *   **Objetivo:** Substituir a implementação da memória de `LlamaIndex` pela arquitetura de produção final com Supabase.

## (NOVA SEÇÃO) Plano de Lançamento (MVP)

*   **Escopo do MVP:** A primeira versão do AIOS-FULLSTACK será considerada completa após a conclusão dos Requisitos Funcionais FR1, FR2, FR3 (com LlamaIndex) e FR4.
*   **Mecanismo de Instalação:** Ao final do FR4, o projeto será empacotado e publicado, permitindo a instalação via:

```bash
npx aios-fullstack install
```

*   **Escopo Pós-MVP:** As funcionalidades subsequentes (FR5, FR6, FR7, FR8) serão desenvolvidas e lançadas em atualizações futuras.