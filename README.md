# Synkra AIOS: Framework Universal de Agentes IA 🚀

[![Versão NPM](https://img.shields.io/npm/v/aios-core.svg)](https://www.npmjs.com/package/aios-core)
[![Licença: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Versão Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Documentação](https://img.shields.io/badge/docs-disponível-orange.svg)](https://synkra.ai)
[![Open Source](https://img.shields.io/badge/Open%20Source-Yes-success.svg)](LICENSE)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Code of Conduct](https://img.shields.io/badge/code%20of%20conduct-Contributor%20Covenant-blue.svg)](CODE_OF_CONDUCT.md)

Framework de Desenvolvimento Auto-Modificável Alimentado por IA. Fundado em Desenvolvimento Ágil Dirigido por Agentes, oferecendo capacidades revolucionárias para desenvolvimento dirigido por IA e muito mais. Transforme qualquer domínio com expertise especializada de IA: desenvolvimento de software, entretenimento, escrita criativa, estratégia de negócios, bem-estar pessoal e muito mais.

## Visão Geral

**As Duas Inovações Chave do Synkra AIOS:**

**1. Planejamento Agêntico:** Agentes dedicados (analyst, pm, architect) colaboram com você para criar documentos de PRD e Arquitetura detalhados e consistentes. Através de engenharia avançada de prompts e refinamento com human-in-the-loop, estes agentes de planejamento produzem especificações abrangentes que vão muito além da geração genérica de tarefas de IA.

**2. Desenvolvimento Contextualizado por Engenharia:** O agente sm (Scrum Master) então transforma estes planos detalhados em histórias de desenvolvimento hiperdetalhadas que contêm tudo que o agente dev precisa - contexto completo, detalhes de implementação e orientação arquitetural incorporada diretamente nos arquivos de histórias.

Esta abordagem de duas fases elimina tanto a **inconsistência de planejamento** quanto a **perda de contexto** - os maiores problemas no desenvolvimento assistido por IA. Seu agente dev abre um arquivo de história com compreensão completa do que construir, como construir e por quê.

**📖 [Veja o fluxo de trabalho completo no Guia do Usuário](aios-core/user-guide.md)** - Fase de planejamento, ciclo de desenvolvimento e todos os papéis dos agentes

## Pré-requisitos

- Node.js >=18.0.0 (v20+ recomendado)
- npm >=9.0.0
- GitHub CLI (opcional, necessário para colaboração em equipe)

> **Problemas de instalação?** Consulte o [Guia de Troubleshooting](docs/guides/installation-troubleshooting.md)

**Guias específicos por plataforma:**
- 📖 [Guia de Instalação para macOS](docs/installation/macos.md)
- 📖 Guia de Instalação para Windows (suporte integrado)
- 📖 Guia de Instalação para Linux (suporte integrado)

## Navegação Rápida

### Entendendo o Fluxo de Trabalho AIOS

**Antes de mergulhar, revise estes diagramas críticos de fluxo de trabalho que explicam como o AIOS funciona:**

1. **[Fluxo de Planejamento (Interface Web)](aios-core/user-guide.md#the-planning-workflow-web-ui)** - Como criar documentos de PRD e Arquitetura
2. **[Ciclo Principal de Desenvolvimento (IDE)](aios-core/user-guide.md#the-core-development-cycle-ide)** - Como os agentes sm, dev e qa colaboram através de arquivos de histórias

> ⚠️ **Estes diagramas explicam 90% da confusão sobre o fluxo Synkra AIOS Agentic Agile** - Entender a criação de PRD+Arquitetura e o fluxo de trabalho sm/dev/qa e como os agentes passam notas através de arquivos de histórias é essencial - e também explica por que isto NÃO é taskmaster ou apenas um simples executor de tarefas!

### O que você gostaria de fazer?

- **[Instalar e Construir software com Equipe Ágil Full Stack de IA](#início-rápido)** → Instruções de Início Rápido
- **[Aprender como usar o AIOS](aios-core/user-guide.md)** → Guia completo do usuário e passo a passo
- **[Ver agentes IA disponíveis](#agentes-disponíveis)** → Papéis especializados para sua equipe
- **[Explorar usos não técnicos](#-além-do-desenvolvimento-de-software---squads)** → Escrita criativa, negócios, bem-estar, educação
- **[Criar meus próprios agentes IA](#criando-seu-próprio-expansion-pack)** → Construir agentes para seu domínio
- **[Navegar Squads prontos](squads/)** → Game dev, DevOps, infraestrutura e inspire-se com ideias e exemplos
- **[Hybrid-Ops 2.0 Migration Guide](docs/migration-guide.md)** → Upgrade para PV Mode com cognitive architecture executável
- **[Entender a arquitetura](docs/core-architecture.md)** → Mergulho técnico profundo
- **[Juntar-se à comunidade](https://discord.gg/gk8jAdXWmj)** → Obter ajuda e compartilhar ideias

## Importante: Mantenha Sua Instalação AIOS Atualizada

**Mantenha-se atualizado sem esforço!** Para atualizar sua instalação AIOS existente:

```bash
npx github:SynkraAI/aios-core install
```

Isto vai:

- ✅ Detectar automaticamente sua instalação existente
- ✅ Atualizar apenas os arquivos que mudaram
- ✅ Criar arquivos de backup `.bak` para quaisquer modificações customizadas
- ✅ Preservar suas configurações específicas do projeto

Isto facilita beneficiar-se das últimas melhorias, correções de bugs e novos agentes sem perder suas customizações!

## Início Rápido

### 🚀 Instalação via NPX (Recomendado)

**Instale o Synkra AIOS com um único comando:**

```bash
# Criar um novo projeto com assistente interativo moderno
npx aios-core init meu-projeto

# Ou instalar em projeto existente
cd seu-projeto
npx aios-core install

# Ou usar uma versão específica
npx aios-core@latest init meu-projeto
```

### ✨ Assistente de Instalação Moderno

O Synkra AIOS agora inclui uma experiência de instalação interativa de última geração, inspirada em ferramentas modernas como Vite e Next.js:

**Recursos do Instalador Interativo:**
- 🎨 **Interface Moderna**: Prompts coloridos e visuais com @clack/prompts
- ✅ **Validação em Tempo Real**: Feedback instantâneo sobre entradas inválidas
- 🔄 **Indicadores de Progresso**: Spinners para operações longas (cópia de arquivos, instalação de deps)
- 📦 **Seleção Multi-Componente**: Escolha quais componentes instalar com interface intuitiva
- ⚙️ **Escolha de Gerenciador de Pacotes**: Selecione entre npm, yarn ou pnpm
- ⌨️ **Suporte a Cancelamento**: Ctrl+C ou ESC para sair graciosamente a qualquer momento
- 📊 **Resumo de Instalação**: Visualize todas as configurações antes de prosseguir
- ⏱️ **Rastreamento de Duração**: Veja quanto tempo levou a instalação

**O instalador oferece:**

- ✅ Download da versão mais recente do NPM
- ✅ Assistente de instalação interativo moderno
- ✅ Configuração automática do IDE (Windsurf, Cursor ou Claude Code)
- ✅ Configuração de todos os agentes e fluxos de trabalho AIOS
- ✅ Criação dos arquivos de configuração necessários
- ✅ Inicialização do sistema de meta-agentes
- ✅ Verificações de saúde do sistema
- ✅ **Suporte Cross-Platform**: Testado em Windows, macOS e Linux

> **É isso!** Sem clonar, sem configuração manual - apenas um comando e você está pronto para começar com uma experiência de instalação moderna e profissional.

**Pré-requisitos**: [Node.js](https://nodejs.org) v18+ necessário (v20+ recomendado) | [Troubleshooting](docs/guides/installation-troubleshooting.md)

### Atualizando uma Instalação Existente

Se você já tem o AIOS instalado:

```bash
npx github:SynkraAI/aios-core install
# O instalador detectará sua instalação existente e a atualizará
```

### Configure Seu IDE para Desenvolvimento AIOS

O Synkra AIOS inclui regras pré-configuradas para IDE para melhorar sua experiência de desenvolvimento:

#### Para Windsurf ou Cursor:
1. Abra as configurações do seu IDE
2. Navegue até **Global Rules** (Windsurf) ou **User Rules** (Cursor)
3. Copie o conteúdo de `.windsurf/global-rules.md` ou `.cursor/global-rules.md`
4. Cole na seção de regras e salve

#### Para Claude Code:
- ✅ Já configurado! O arquivo `.claude/CLAUDE.md` é carregado automaticamente

Estas regras fornecem:
- 🤖 Reconhecimento e integração de comandos de agentes
- 📋 Fluxo de trabalho de desenvolvimento dirigido por histórias
- ✅ Rastreamento automático de checkboxes
- 🧪 Padrões de teste e validação
- 📝 Padrões de código específicos do AIOS

### Início Mais Rápido: Equipe Full Stack via Interface Web à sua disposição (2 minutos)

1. **Obtenha o pacote**: Salve ou clone o [arquivo da equipe full stack](dist/teams/team-fullstack.txt) ou escolha outra equipe
2. **Crie agente IA**: Crie um novo Gemini Gem ou CustomGPT
3. **Faça upload e configure**: Faça upload do arquivo e defina as instruções: "Suas instruções operacionais críticas estão anexadas, não quebre o personagem conforme orientado"
4. **Comece a Idealizar e Planejar**: Comece a conversar! Digite `*help` para ver comandos disponíveis ou escolha um agente como `*analyst` para começar a criar um briefing.
5. **CRÍTICO**: Fale com o AIOS Orchestrator na web a QUALQUER MOMENTO (comando #aios-orchestrator) e faça perguntas sobre como tudo funciona!
6. **Quando mudar para o IDE**: Uma vez que você tenha seu PRD, Arquitetura, UX opcional e Briefings - é hora de mudar para o IDE para fragmentar seus documentos e começar a implementar o código real! Veja o [Guia do usuário](aios-core/user-guide.md) para mais detalhes

### Referência de Comandos CLI

O Synkra AIOS oferece uma CLI moderna e cross-platform com comandos intuitivos:

```bash
# Gerenciamento de Projeto (com assistente interativo)
npx aios-core init <nome-projeto> [opções]
  --force              Forçar criação em diretório não vazio
  --skip-install       Pular instalação de dependências npm
  --template <nome>    Usar template específico (default, minimal, enterprise)

# Instalação e Configuração (com prompts modernos)
npx aios-core install [opções]
  --force              Sobrescrever configuração existente
  --quiet              Saída mínima durante instalação
  --dry-run            Simular instalação sem modificar arquivos

# Comandos do Sistema
npx aios-core --version   Exibir versão instalada
npx aios-core --help      Exibir ajuda detalhada
npx aios-core info        Exibir informações do sistema
npx aios-core doctor      Executar diagnósticos do sistema
npx aios-core doctor --fix Corrigir problemas detectados automaticamente

# Manutenção
npx aios-core update      Atualizar para versão mais recente
npx aios-core uninstall   Remover Synkra AIOS
```

**Recursos da CLI:**
- ✅ **Help System Abrangente**: `--help` em qualquer comando mostra documentação detalhada
- ✅ **Validação de Entrada**: Feedback imediato sobre parâmetros inválidos
- ✅ **Mensagens Coloridas**: Erros em vermelho, sucessos em verde, avisos em amarelo
- ✅ **Cross-Platform**: Funciona perfeitamente em Windows, macOS e Linux
- ✅ **Suporte a Dry-Run**: Teste instalações sem modificar arquivos

### 💡 Exemplos de Uso

#### Instalação Interativa Completa

```bash
$ npx aios-core install

🚀 Synkra AIOS Installation

◆ What is your project name?
│  my-awesome-project
│
◇ Which directory should we use?
│  ./my-awesome-project
│
◆ Choose components to install:
│  ● Core Framework (Required)
│  ● Agent System (Required)
│  ● Squads (optional)
│  ○ Example Projects (optional)
│
◇ Select package manager:
│  ● npm
│  ○ yarn
│  ○ pnpm
│
◆ Initialize Git repository?
│  Yes
│
◆ Install dependencies?
│  Yes
│
▸ Creating project directory...
▸ Copying framework files...
▸ Initializing Git repository...
▸ Installing dependencies (this may take a minute)...
▸ Configuring environment...
▸ Running post-installation setup...

✔ Installation completed successfully! (34.2s)

Next steps:
  cd my-awesome-project
  aios-core doctor     # Verify installation
  aios-core --help     # See available commands
```

#### Instalação Silenciosa (CI/CD)

```bash
# Instalação automatizada sem prompts
$ npx aios-core install --quiet --force
✔ Synkra AIOS installed successfully
```

#### Simulação de Instalação (Dry-Run)

```bash
# Testar instalação sem modificar arquivos
$ npx aios-core install --dry-run

[DRY RUN] Would create: ./my-project/
[DRY RUN] Would copy: .aios-core/ (45 files)
[DRY RUN] Would initialize: Git repository
[DRY RUN] Would install: npm dependencies
✔ Dry run completed - no files were modified
```

#### Diagnóstico do Sistema

```bash
$ npx aios-core doctor

🏥 AIOS System Diagnostics

✔ Node.js version: v20.10.0 (meets requirement: >=18.0.0)
✔ npm version: 10.2.3
✔ Git installed: version 2.43.0
✔ GitHub CLI: gh 2.40.1
✔ Synkra AIOS: v1.0.0

Configuration:
✔ .aios-core/ directory exists
✔ Agent files: 11 found
✔ Workflow files: 8 found
✔ Templates: 15 found

Dependencies:
✔ @clack/prompts: ^0.7.0
✔ commander: ^12.0.0
✔ execa: ^9.0.0
✔ fs-extra: ^11.0.0
✔ picocolors: ^1.0.0

✅ All checks passed! Your installation is healthy.
```

#### Obter Ajuda

```bash
$ npx aios-core --help

Usage: aios-core [options] [command]

Synkra AIOS: AI-Orchestrated System for Full Stack Development

Options:
  -V, --version                output the version number
  -h, --help                   display help for command

Commands:
  init <project-name>          Create new AIOS project with interactive wizard
  install [options]            Install AIOS in current directory
  info                         Display system information
  doctor [options]             Run system diagnostics and health checks
  help [command]               display help for command

Run 'aios-core <command> --help' for detailed information about each command.
```

### Alternativa: Clonar e Construir

Para contribuidores ou usuários avançados que queiram modificar o código fonte:

```bash
# Clonar o repositório
git clone https://github.com/SynkraAI/aios-core.git
cd aios-core

# Instalar dependências
npm install

# Executar o instalador
npm run install:aios
```

### Configuração Rápida para Equipe

Para membros da equipe ingressando no projeto:

```bash
# Instalar AIOS com configuração GitHub
npx github:SynkraAI/aios-core setup

# Isto vai:
# 1. Verificar/instalar GitHub CLI
# 2. Autenticar com GitHub
# 3. Executar o instalador AIOS
```

## 🌟 Além do Desenvolvimento de Software - Squads

O framework de linguagem natural do AIOS funciona em QUALQUER domínio. Os Squads fornecem agentes IA especializados para escrita criativa, estratégia de negócios, saúde e bem-estar, educação e muito mais. Além disso, os Squads podem expandir o núcleo do Synkra AIOS com funcionalidade específica que não é genérica para todos os casos. [Veja o Guia de Squads](docs/squads.md) e aprenda a criar os seus próprios!

## Agentes Disponíveis

O Synkra AIOS vem com 11 agentes especializados:

### Agentes Meta
- **aios-master** - Agente mestre de orquestração (inclui capacidades de desenvolvimento de framework)
- **aios-orchestrator** - Orquestrador de fluxo de trabalho e coordenação de equipe

### Agentes de Planejamento (Interface Web)
- **analyst** - Especialista em análise de negócios e criação de PRD
- **pm** (Product Manager) - Gerente de produto e priorização
- **architect** - Arquiteto de sistema e design técnico
- **ux-expert** - Design de experiência do usuário e usabilidade

### Agentes de Desenvolvimento (IDE)
- **sm** (Scrum Master) - Gerenciamento de sprint e criação de histórias
- **dev** - Desenvolvedor e implementação
- **qa** - Garantia de qualidade e testes
- **po** (Product Owner) - Gerenciamento de backlog e histórias

## Documentação e Recursos

### Guias Essenciais

- 📖 **[Guia do Usuário](aios-core/user-guide.md)** - Passo a passo completo desde a concepção até a conclusão do projeto
- 🏗️ **[Arquitetura Principal](docs/architecture.md)** - Mergulho técnico profundo e design do sistema
- 🚀 **[Guia de Squads](docs/squads.md)** - Estenda o AIOS para qualquer domínio além do desenvolvimento de software

### Documentação Adicional

- 🤖 **[Guia de Squads](docs/guides/squads-guide.md)** - Crie e publique equipes de agentes IA
- 📋 **[Primeiros Passos](docs/getting-started.md)** - Tutorial passo a passo para iniciantes
- 🔧 **[Solução de Problemas](docs/troubleshooting.md)** - Soluções para problemas comuns
- 🎯 **[Princípios Orientadores](docs/GUIDING-PRINCIPLES.md)** - Filosofia e melhores práticas do AIOS
- 🏛️ **[Visão Geral da Arquitetura](docs/architecture-overview.md)** - Visão detalhada da arquitetura do sistema
- ⚙️ **[Guia de Ajuste de Performance](docs/performance-tuning-guide.md)** - Otimize seu fluxo de trabalho AIOS
- 🔒 **[Melhores Práticas de Segurança](docs/security-best-practices.md)** - Segurança e proteção de dados
- 🔄 **[Guia de Migração v4.31→v1.0](docs/migration-v4.31-to-v1.0.md)** - Migração para versão cross-platform moderna
- 🔄 **[Guia de Migração (Legacy)](docs/migration-guide.md)** - Migração de versões anteriores
- 📦 **[Versionamento e Releases](docs/versioning-and-releases.md)** - Política de versões
- 🌳 **[Trabalhando no Brownfield](aios-core/working-in-the-brownfield.md)** - Integrar AIOS em projetos existentes

## 📊 Architecture Mapping & Visualization System

O Synkra AIOS v1.0.0 inclui um sistema completo de mapeamento e visualização de arquitetura construído nos Epics 2 & 3. Este sistema oferece **visibilidade total** da sua arquitetura através de múltiplos formatos e detecção automática de gaps.

### 🎯 O Que é o Sistema de Mapeamento?

Um **grafo de relacionamentos completo** de todos os componentes do framework:
- 📦 **199 entidades mapeadas** (22 agents, 67 tasks, 27 templates, 9 checklists, 12 tools, 6 workflows, 54 utils, 2 data)
- 🔗 **50 relacionamentos rastreados** (executes, uses_template, depends_on, imports, etc.)
- 🔍 **7 categorias de gaps** detectadas automaticamente
- 📈 **Auditoria trimestral** automatizada para prevenir regressões

### 🗂️ Formatos Disponíveis

O sistema exporta a arquitetura em **3 formatos complementares**:

#### 1. 🔵 **Neo4j Graph Database**

Explore a arquitetura interativamente com Neo4j:

```bash
# Localização: outputs/architecture-map/neo4j/
cd outputs/architecture-map/neo4j/

# Siga o guia de setup (Neo4j Desktop ou Docker)
cat SETUP-GUIDE.md

# Import rápido (após instalar Neo4j)
neo4j-admin database import full \
  --nodes=nodes.csv \
  --relationships=relationships.csv \
  --delimiter=',' \
  architecture-db
```

**Queries Prontos:**
- 🔍 Encontrar dependências de um componente
- 🧩 Analisar cadeias de relacionamentos
- 📊 Estatísticas de conectividade
- ⚠️ Identificar componentes isolados

Veja `sample-queries-annotated.cypher` para 13 queries prontos!

#### 2. 📐 **Mermaid Diagrams**

8 diagramas Mermaid prontos para documentação:

```bash
# Localização: outputs/architecture-map/mermaid/

synthesis-full-architecture.mmd       # Arquitetura completa
synthesis-layered-view.mmd           # Visão em camadas (agents → tasks → utils)
synthesis-critical-paths.mmd         # Caminhos críticos
synthesis-gap-visualization.mmd      # Gaps visualizados
synthesis-module-view.mmd            # Visão modular
gap-focus.mmd                        # Foco em gaps
dependency-chains.mmd                # Cadeias de dependência
ide-coverage.mmd                     # Cobertura IDE
```

**Renderize no GitHub, VSCode ou use Mermaid Live Editor!**

#### 3. 🌐 **HTML Interactive Dashboard**

Dashboard interativo (Vis.js) - funciona offline:

```bash
# Localização: outputs/architecture-map/visualization/
open outputs/architecture-map/visualization/index.html
```

**Recursos do Dashboard:**
- 🔍 Busca e filtros por tipo de entidade
- 🎨 Visualização interativa do grafo (zoom, pan, drag)
- 📊 Painel de detalhes de entidades
- 🔗 Navegação por relacionamentos
- 📈 Estatísticas em tempo real

### 🛡️ Gap Detection System

Sistema automatizado de detecção de gaps em **7 categorias**:

| Categoria          | Descrição                                     | Status  |
|--------------------|-----------------------------------------------|---------|
| Broken References  | Referências a entidades inexistentes          | 17 gaps |
| Orphaned Active    | Entidades ativas sem uso                      | 0 gaps ✅ |
| Ambiguous Relations| Relacionamentos ambíguos                      | 5 gaps  |
| Missing Docs       | Documentação faltante                         | 150 gaps|
| Deprecated Active  | Componentes deprecated ainda em uso           | 0 gaps ✅ |
| Incomplete Workflows| Workflows incompletos                        | 8 gaps  |
| Tool Validation    | Ferramentas referenciadas mas não registradas | 12 gaps |

**Total: 338 gaps rastreados** (88 Orphaned Active resolvidos no Epic 3.1!)

### 🔄 Automated Validation

**Validação contínua** em múltiplos pontos:

1. **Pre-Commit Hook** (Story 3.22)
   - Valida relacionamentos antes de cada commit
   - Detecta referências quebradas
   - Previne regressões

2. **Gap Detection Script**
   ```bash
   node outputs/architecture-map/schemas/detect-gaps.js
   ```

3. **Quarterly Audit** (Story 3.25)
   - Auditoria trimestral automatizada
   - Report de tendências (`gap-trend.json`)
   - Alertas para novos gaps

4. **Tool Reference Validation** (Story 3.21)
   ```bash
   node outputs/architecture-map/schemas/validate-tool-references.js
   ```
   - Valida ferramentas MCP/CLI/Local
   - Integração com Docker MCP Toolkit

### 📈 Epic 2 & 3 Achievements

**Epic 2 - Architecture Mapping (100% Complete):**
- ✅ 297 entidades catalogadas
- ✅ 174 relacionamentos sintetizados
- ✅ Neo4j/Mermaid/HTML exports prontos
- ✅ Gap detection implementado
- ✅ Visualização interativa funcional

**Epic 3 - Gap Remediation (62% Complete):**
- ✅ **88 Orphaned Active gaps resolvidos** (Stories 3.1.1-3.1.4)
- ✅ 54 utilities ativas documentadas em `core-config.yaml`
- ✅ 19 utilities arquivadas com rationale
- ✅ **85% token reduction** via Docker MCP Toolkit (280k → 40k tokens)
- ✅ MCP governance consolidated under DevOps Agent (Story 6.14)
- ✅ Pre-commit hooks + Quarterly audit

### 🚀 Quick Start

**1. Explore o Sistema:**
```bash
# Ver entidades e relacionamentos
cat outputs/architecture-map/MASTER-RELATIONSHIP-MAP.json | jq '.metadata'

# Detectar gaps
node outputs/architecture-map/schemas/detect-gaps.js

# Abrir dashboard
open outputs/architecture-map/visualization/index.html
```

**2. Importe no Neo4j** (opcional):
```bash
cd outputs/architecture-map/neo4j/
cat SETUP-GUIDE.md  # Siga as instruções
```

**3. Use Diagramas Mermaid:**
```bash
# Copie qualquer .mmd para sua documentação
cp outputs/architecture-map/mermaid/synthesis-layered-view.mmd docs/
```

### 📚 Documentação Adicional

- 📖 **[Neo4j Setup Guide](outputs/architecture-map/neo4j/SETUP-GUIDE.md)** - Importação completa
- 📖 **[Visualization Guide](outputs/architecture-map/VISUALIZATION-GUIDE.md)** - Como usar o dashboard
- 📖 **[Gap Detection Guide](outputs/architecture-map/schemas/README.md)** - Validação automatizada
- 📖 **[Story 2.11](docs/stories/2.11-synthesis-integration.yaml)** - Synthesis implementation
- 📖 **[Story 2.12](docs/stories/2.12-visualization-reporting.yaml)** - Visualization implementation

### 🎯 Roadmap v1.1

- [ ] Interactive Miro board export
- [ ] Real-time Neo4j updates on code changes
- [ ] VSCode extension for inline visualization

## Criando Seu Próprio Squad

Expansion packs permitem estender o AIOS para qualquer domínio. Estrutura básica:

```
squads/seu-pack/
├── config.yaml           # Configuração do pack
├── agents/              # Agentes especializados
├── tasks/               # Fluxos de trabalho de tarefas
├── templates/           # Templates de documentos
├── checklists/          # Checklists de validação
├── data/                # Base de conhecimento
├── README.md            # Documentação do pack
└── user-guide.md        # Guia do usuário
```

Veja o [Guia de Squads](docs/squads.md) para instruções detalhadas.

## Squads Disponíveis

- **aios-infrastructure-devops** - Infraestrutura e DevOps
- **expansion-creator** - Criador de Squads
- **meeting-notes** - Notas e atas de reuniões

### Squads Externos

- **[hybrid-ops](https://github.com/SynkraAI/aios-hybrid-ops-pedro-valerio)** - Operações híbridas humano-agente (repositório separado)

Explore o diretório [squads/](squads/) para mais inspiração!

## Suporte & Comunidade

- 📖 [Guia da Comunidade](COMMUNITY.md) - Como participar e contribuir
- 💬 [Discussões GitHub](https://github.com/SynkraAI/aios-core/discussions) - Hub central da comunidade
- 💡 [Processo de Features](docs/FEATURE_PROCESS.md) - Como propor novas funcionalidades
- 🐛 [Rastreador de Issues](https://github.com/SynkraAI/aios-core/issues)
- 📋 [Como Contribuir](CONTRIBUTING.md)
- 🗺️ [Roadmap](ROADMAP.md) - Veja o que estamos construindo
- 🤖 [Guia de Squads](docs/guides/squads-guide.md) - Crie equipes de agentes IA

## Git Workflow e Validação

O Synkra AIOS implementa um sistema de validação de múltiplas camadas para garantir qualidade do código e consistência:

### 🛡️ Defense in Depth - 3 Camadas de Validação

**Camada 1: Pre-commit (Local - Rápida)**
- ✅ ESLint - Qualidade de código
- ✅ TypeScript - Verificação de tipos
- ⚡ Performance: <5s
- 💾 Cache habilitado

**Camada 2: Pre-push (Local - Validação de Stories)**
- ✅ Validação de checkboxes de histórias
- ✅ Consistência de status
- ✅ Seções obrigatórias

**Camada 3: CI/CD (Cloud - Obrigatório para merge)**
- ✅ Todos os testes
- ✅ Cobertura de testes (80% mínimo)
- ✅ Validações completas
- ✅ GitHub Actions

### 📖 Documentação Detalhada

- 📋 **[Guia Completo de Git Workflow](docs/git-workflow-guide.md)** - Guia detalhado do fluxo de trabalho
- 📋 **[CONTRIBUTING.md](CONTRIBUTING.md)** - Guia de contribuição

### Comandos Disponíveis

```bash
# Validações locais
npm run lint           # ESLint
npm run typecheck      # TypeScript
npm test              # Testes
npm run test:coverage # Testes com cobertura

# Validador AIOS
node .aios-core/utils/aios-validator.js pre-commit   # Validação pre-commit
node .aios-core/utils/aios-validator.js pre-push     # Validação pre-push
node .aios-core/utils/aios-validator.js stories      # Validar todas stories
```

### Branch Protection

Configure proteção da branch master com:

```bash
node scripts/setup-branch-protection.js
```

Requer:
- GitHub CLI (gh) instalado e autenticado
- Acesso de admin ao repositório

## Contribuindo

**Estamos empolgados com contribuições e acolhemos suas ideias, melhorias e Squads!** 🎉

Para contribuir:

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaNovaFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Adicionar nova feature'`)
4. Push para a branch (`git push origin feature/MinhaNovaFeature`)
5. Abra um Pull Request

Veja também:
- 📋 [Como Contribuir com Pull Requests](docs/how-to-contribute-with-pull-requests.md)
- 📋 [Guia de Git Workflow](docs/git-workflow-guide.md)
- 📋 [Checklist de Lançamento](docs/launch-checklist.md)

## 📄 Legal

| Documento | English | Português |
|-----------|---------|-----------|
| **Licença** | [MIT License](LICENSE) | - |
| **Privacidade** | [Privacy Policy](PRIVACY.md) | [Política de Privacidade](PRIVACY-PT.md) |
| **Termos de Uso** | [Terms of Use](TERMS.md) | [Termos de Uso](TERMS-PT.md) |
| **Código de Conduta** | [Code of Conduct](CODE_OF_CONDUCT.md) | - |
| **Contribuição** | [Contributing](CONTRIBUTING.md) | - |
| **Changelog** | [Version History](CHANGELOG.md) | - |

## Reconhecimentos

[![Contributors](https://contrib.rocks/image?repo=SynkraAI/aios-core)](https://github.com/SynkraAI/aios-core/graphs/contributors)

<sub>Construído com ❤️ para a comunidade de desenvolvimento assistido por IA</sub>

---

**[⬆ Voltar ao topo](#synkra-aios-framework-universal-de-agentes-ia-)**
