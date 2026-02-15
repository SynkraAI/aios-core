<!--
  Tradução: PT-BR
  Original: /docs/en/guides/squads-guide.md
  Última sincronização: 2026-01-26
-->

# Guia de Desenvolvimento de Squads

> 🌐 [EN](../../guides/squads-guide.md) | **PT** | [ES](../../es/guides/squads-guide.md)

---

Guia completo para criar, validar, publicar e gerenciar Squads no AIOS.

> **AIOS Squads:** Equipes de AI agents trabalhando com você

## Índice

1. [O que é um Squad?](#o-que-é-um-squad)
2. [Início Rápido](#início-rápido)
3. [Arquitetura de Squad](#arquitetura-de-squad)
4. [Criando Squads](#criando-squads)
5. [Squad Designer](#squad-designer)
6. [Analisando e Estendendo Squads](#analisando--estendendo-squads) _(NOVO)_
7. [Validando Squads](#validando-squads)
8. [Publicação e Distribuição](#publicação--distribuição)
9. [Migração do Formato Legado](#migração-do-formato-legado)
10. [Squad Loader e Resolução](#squad-loader--resolução)
11. [Solução de Problemas](#solução-de-problemas)
12. [FAQ](#faq)

---

## O que é um Squad?

Squads são equipes modulares de agentes de IA que estendem a funcionalidade do AIOS. Cada squad é um pacote autocontido contendo:

| Componente    | Propósito                                              |
| ------------- | ------------------------------------------------------ |
| **Agents**    | Personas de IA específicas do domínio                  |
| **Tasks**     | Fluxos de trabalho executáveis (TASK-FORMAT-SPEC-V1)   |
| **Workflows** | Orquestrações de múltiplas etapas                      |
| **Config**    | Padrões de código, stack tecnológico, árvore de código |
| **Templates** | Templates de geração de documentos                     |
| **Tools**     | Integrações de ferramentas personalizadas              |

### Níveis de Distribuição

```
┌─────────────────────────────────────────────────────────────┐
│                    DISTRIBUIÇÃO DE SQUAD                     │
├─────────────────────────────────────────────────────────────┤
│  Nível 1: LOCAL        → ./squads/           (Privado)      │
│  Nível 2: AIOS-SQUADS  → github.com/SynkraAI (Público/Free) │
│  Nível 3: SYNKRA API   → api.synkra.dev      (Marketplace)  │
└─────────────────────────────────────────────────────────────┘
```

### Squads Oficiais

| Squad                                                                      | Versão | Descrição                          |
| -------------------------------------------------------------------------- | ------ | ---------------------------------- |
| [etl-squad](https://github.com/SynkraAI/aios-squads/tree/main/etl)         | 2.0.0  | Coleta e transformação de dados    |
| [creator-squad](https://github.com/SynkraAI/aios-squads/tree/main/creator) | 1.0.0  | Utilitários de geração de conteúdo |

---

## Início Rápido

### Pré-requisitos

- Node.js 18+
- Projeto AIOS inicializado (`.aios-core/` existe)
- Git para controle de versão

### Opção 1: Design Guiado (Recomendado)

```bash
# Ativar agente squad-creator
@squad-creator

# Projetar squad a partir da sua documentação
*design-squad --docs ./docs/prd/my-project.md

# Revisar recomendações, depois criar
*create-squad my-squad --from-design

# Validar antes de usar
*validate-squad my-squad
```

### Opção 2: Criação Direta

```bash
@squad-creator

# Criar com prompts interativos
*create-squad my-domain-squad

# Ou especificar template
*create-squad my-squad --template etl
```

---

## Arquitetura de Squad

### Estrutura de Diretórios

```
./squads/my-squad/
├── squad.yaml              # Manifesto (obrigatório)
├── README.md               # Documentação
├── LICENSE                 # Arquivo de licença
├── config/
│   ├── coding-standards.md # Regras de estilo de código
│   ├── tech-stack.md       # Tecnologias utilizadas
│   └── source-tree.md      # Estrutura de diretórios
├── agents/
│   └── my-agent.md         # Definições de agentes
├── tasks/
│   └── my-task.md          # Definições de tarefas (task-first!)
├── workflows/
│   └── my-workflow.yaml    # Workflows de múltiplas etapas
├── checklists/
│   └── review-checklist.md # Checklists de validação
├── templates/
│   └── report-template.md  # Templates de documentos
├── tools/
│   └── custom-tool.js      # Integrações de ferramentas personalizadas
├── scripts/
│   └── setup.js            # Scripts utilitários
└── data/
    └── reference-data.json # Arquivos de dados estáticos
```

### Manifesto do Squad (squad.yaml)

```yaml
# Campos obrigatórios
name: my-squad # kebab-case, identificador único
version: 1.0.0 # Versionamento semântico
description: O que este squad faz

# Metadados
author: Seu Nome <email@example.com>
license: MIT
slashPrefix: my # Prefixo de comando para IDE

# Compatibilidade AIOS
aios:
  minVersion: '2.1.0'
  type: squad

# Declaração de componentes
components:
  agents:
    - my-agent.md
  tasks:
    - my-task.md
  workflows: []
  checklists: []
  templates: []
  tools: []
  scripts: []

# Herança de configuração
config:
  extends: extend # extend | override | none
  coding-standards: config/coding-standards.md
  tech-stack: config/tech-stack.md
  source-tree: config/source-tree.md

# Dependências
dependencies:
  node: [] # pacotes npm
  python: [] # pacotes pip
  squads: [] # Outros squads

# Tags de descoberta
tags:
  - domain-specific
  - automation
```

### Arquitetura Task-First

Squads seguem **arquitetura task-first** onde tarefas são o ponto de entrada principal:

```
Requisição do Usuário → Task → Execução do Agent → Saída
                         ↓
                    Workflow (se múltiplas etapas)
```

Tasks devem seguir [TASK-FORMAT-SPECIFICATION-V1](../../../.aios-core/docs/standards/TASK-FORMAT-SPECIFICATION-V1.md).

---

## Criando Squads

### Usando o Agente @squad-creator

```bash
# Ativar o agente
@squad-creator

# Ver todos os comandos
*help
```

### Comandos Disponíveis

| Comando                                  | Descrição                                           |
| ---------------------------------------- | --------------------------------------------------- |
| `*create-squad {name}`                   | Criar novo squad com prompts                        |
| `*create-squad {name} --template {type}` | Criar a partir de template (basic, etl, agent-only) |
| `*create-squad {name} --from-design`     | Criar a partir de blueprint de design               |
| `*validate-squad {name}`                 | Validar estrutura do squad                          |
| `*list-squads`                           | Listar todos os squads locais                       |
| `*design-squad`                          | Projetar squad a partir de documentação             |

### Templates

| Template     | Caso de Uso                                    |
| ------------ | ---------------------------------------------- |
| `basic`      | Squad simples com um agent e task              |
| `etl`        | Extração, transformação, carregamento de dados |
| `agent-only` | Squad com agents, sem tasks                    |

### Modos de Herança de Configuração

| Modo       | Comportamento                                   |
| ---------- | ----------------------------------------------- |
| `extend`   | Adiciona regras do squad às regras core do AIOS |
| `override` | Substitui regras core pelas regras do squad     |
| `none`     | Configuração standalone                         |

---

## Squad Designer

O Squad Designer analisa sua documentação e recomenda agents e tasks.

### Uso

```bash
@squad-creator

# Design interativo
*design-squad

# Design a partir de arquivos específicos
*design-squad --docs ./docs/prd/requirements.md ./docs/specs/api.md

# Especificar contexto de domínio
*design-squad --domain casting --docs ./docs/
```

### Fluxo de Trabalho

1. **Coletar Documentação** - Fornecer PRDs, specs, requisitos
2. **Análise de Domínio** - Sistema extrai conceitos, workflows, papéis
3. **Recomendações de Agent** - Revisar agents sugeridos
4. **Recomendações de Task** - Revisar tasks sugeridas
5. **Gerar Blueprint** - Salvar em `.squad-design.yaml`
6. **Criar a partir do Blueprint** - `*create-squad my-squad --from-design`

### Formato do Blueprint

```yaml
# .squad-design.yaml
metadata:
  domain: casting
  created: 2025-12-26T10:00:00Z
  source_docs:
    - ./docs/prd/casting-system.md

recommended_agents:
  - name: casting-coordinator
    role: Coordena workflows de casting
    confidence: 0.92

recommended_tasks:
  - name: process-submission
    description: Processar submissão de ator
    agent: casting-coordinator
    confidence: 0.88
```

---

## Analisando & Estendendo Squads

Após criar um squad, você pode analisar sua estrutura e estendê-lo com novos componentes usando os comandos `*analyze-squad` e `*extend-squad`.

### Analisando Squads

```bash
@squad-creator

# Análise básica
*analyze-squad my-squad

# Incluir detalhes de arquivo
*analyze-squad my-squad --verbose

# Salvar em arquivo markdown
*analyze-squad my-squad --format markdown

# Saída como JSON
*analyze-squad my-squad --format json
```

### Saída da Análise

```
=== Análise do Squad: my-squad ===

Visão Geral
  Nome: my-squad
  Versão: 1.0.0
  Autor: Seu Nome

Componentes
  agents/ (2)
    - lead-agent.md
    - helper-agent.md
  tasks/ (3)
    - lead-agent-task1.md
    - lead-agent-task2.md
    - helper-agent-task1.md
  workflows/ (0) <- Vazio
  checklists/ (0) <- Vazio

Cobertura
  Agents: [#####-----] 50% (1/2 com tasks)
  Tasks: [########--] 80% (3 tasks)
  Diretórios: [##--------] 25% (2/8 populados)

Sugestões
  1. [!] Adicionar tasks para helper-agent (atualmente tem apenas 1)
  2. [*] Criar workflows para sequências comuns
  3. [-] Adicionar checklists para validação

Próximo: *extend-squad my-squad
```

### Estendendo Squads

Adicione novos componentes a squads existentes com atualizações automáticas do manifesto:

```bash
@squad-creator

# Modo interativo (guiado)
*extend-squad my-squad

# Modo direto - Adicionar agent
*extend-squad my-squad --add agent --name analytics-agent

# Adicionar task com vinculação de agent
*extend-squad my-squad --add task --name process-data --agent lead-agent

# Adicionar workflow com referência de story
*extend-squad my-squad --add workflow --name daily-processing --story SQS-11

# Adicionar todos os tipos de componente
*extend-squad my-squad --add template --name report-template
*extend-squad my-squad --add tool --name data-validator
*extend-squad my-squad --add checklist --name quality-checklist
*extend-squad my-squad --add script --name migration-helper
*extend-squad my-squad --add data --name config-data
```

### Fluxo Interativo de Extensão

```
@squad-creator
*extend-squad my-squad

? O que você gostaria de adicionar?
  1. Agent - Nova persona de agent
  2. Task - Nova task para um agent
  3. Workflow - Workflow de múltiplas etapas
  4. Checklist - Checklist de validação
  5. Template - Template de documento
  6. Tool - Ferramenta personalizada (JavaScript)
  7. Script - Script de automação
  8. Data - Arquivo de dados estático (YAML)

> 2

? Nome da task: process-data
? Qual agent é dono desta task?
  1. lead-agent
  2. helper-agent
> 1
? Descrição da task (opcional): Processar dados de entrada e gerar saída
? Vincular a story? (deixe em branco para pular): SQS-11

Criando task...
  Criado: tasks/lead-agent-process-data.md
  Atualizado: squad.yaml (adicionado a components.tasks)
  Validação: PASSOU

Próximos passos:
  1. Editar tasks/lead-agent-process-data.md
  2. Adicionar entrada/saída/checklist
  3. Executar: *validate-squad my-squad
```

### Tipos de Componente

| Tipo      | Diretório   | Extensão | Descrição                              |
| --------- | ----------- | -------- | -------------------------------------- |
| agent     | agents/     | .md      | Definição de persona de agent          |
| task      | tasks/      | .md      | Fluxo de trabalho executável           |
| workflow  | workflows/  | .yaml    | Orquestração de múltiplas etapas       |
| checklist | checklists/ | .md      | Checklist de validação                 |
| template  | templates/  | .md      | Template de geração de documento       |
| tool      | tools/      | .js      | Integração de ferramenta personalizada |
| script    | scripts/    | .js      | Script de automação utilitário         |
| data      | data/       | .yaml    | Configuração de dados estáticos        |

### Fluxo de Trabalho de Melhoria Contínua

```bash
# 1. Analisar estado atual
*analyze-squad my-squad

# 2. Revisar sugestões e métricas de cobertura

# 3. Adicionar componentes faltantes
*extend-squad my-squad --add task --name new-task --agent lead-agent
*extend-squad my-squad --add checklist --name quality-checklist

# 4. Re-analisar para verificar melhoria
*analyze-squad my-squad

# 5. Validar antes de usar
*validate-squad my-squad
```

### Uso Programático

```javascript
const { SquadAnalyzer } = require('./.aios-core/development/scripts/squad/squad-analyzer');
const { SquadExtender } = require('./.aios-core/development/scripts/squad/squad-extender');

// Analisar squad
const analyzer = new SquadAnalyzer({ squadsPath: './squads' });
const analysis = await analyzer.analyze('my-squad');

console.log('Cobertura:', analysis.coverage);
console.log('Sugestões:', analysis.suggestions);

// Estender squad
const extender = new SquadExtender({ squadsPath: './squads' });
const result = await extender.addComponent('my-squad', {
  type: 'task',
  name: 'new-task',
  agentId: 'lead-agent',
  description: 'Uma nova task',
  storyId: 'SQS-11',
});

console.log('Criado:', result.filePath);
console.log('Manifesto atualizado:', result.manifestUpdated);
```

---

## Validando Squads

### Validação Básica

```bash
@squad-creator
*validate-squad my-squad
```

### Modo Strict (para CI/CD)

```bash
*validate-squad my-squad --strict
```

Trata avisos como erros.

### Verificações de Validação

| Verificação                | Descrição                        |
| -------------------------- | -------------------------------- |
| **Manifest Schema**        | squad.yaml contra JSON Schema    |
| **Estrutura de Diretório** | Pastas obrigatórias existem      |
| **Formato de Task**        | Tasks seguem TASK-FORMAT-SPEC-V1 |
| **Definições de Agent**    | Agents têm campos obrigatórios   |
| **Dependências**           | Arquivos referenciados existem   |

### Saída da Validação

```
Validando squad: my-squad
═══════════════════════════

✅ Manifesto: Válido
✅ Estrutura: Completa
✅ Tasks: 3/3 válidas
✅ Agents: 2/2 válidos
⚠️ Avisos:
   - README.md está mínimo (considere expandir)

Resumo: VÁLIDO (3 avisos)
```

### Validação Programática

```javascript
const { SquadValidator } = require('./.aios-core/development/scripts/squad');

const validator = new SquadValidator({ strict: false });
const result = await validator.validate('./squads/my-squad');

console.log(result);
// { valid: true, errors: [], warnings: [...], suggestions: [...] }
```

---

## Publicação & Distribuição

### Nível 1: Local (Privado)

Squads em `./squads/` estão automaticamente disponíveis para seu projeto.

```bash
# Listar squads locais
*list-squads
```

### Nível 2: Repositório aios-squads (Público)

```bash
@squad-creator

# Validar primeiro
*validate-squad my-squad --strict

# Publicar no GitHub
*publish-squad ./squads/my-squad
```

Isso cria um PR para [SynkraAI/aios-squads](https://github.com/SynkraAI/aios-squads).

### Nível 3: Synkra Marketplace

```bash
# Configurar autenticação
export SYNKRA_API_TOKEN="your-token"

# Sincronizar com marketplace
*sync-squad-synkra ./squads/my-squad --public
```

### Baixando Squads

```bash
@squad-creator

# Listar squads disponíveis
*download-squad --list

# Baixar squad específico
*download-squad etl-squad

# Baixar versão específica
*download-squad etl-squad@2.0.0
```

---

## Migração do Formato Legado

### Detectando Squads Legados

Squads legados usam `config.yaml` em vez de `squad.yaml` e podem estar faltando:

- Campo `aios.type`
- Campo `aios.minVersion`
- Estrutura task-first

### Comando de Migração

```bash
@squad-creator

# Pré-visualizar mudanças
*migrate-squad ./squads/legacy-squad --dry-run

# Executar migração
*migrate-squad ./squads/legacy-squad

# Saída detalhada
*migrate-squad ./squads/legacy-squad --verbose
```

### Etapas da Migração

1. **Backup** - Cria `.backup/pre-migration-{timestamp}/`
2. **Renomear** - `config.yaml` → `squad.yaml`
3. **Adicionar Campos** - `aios.type`, `aios.minVersion`
4. **Reestruturar** - Organizar em layout task-first
5. **Validar** - Executar validação no squad migrado

### Rollback

```bash
# Restaurar do backup
cp -r ./squads/my-squad/.backup/pre-migration-*/. ./squads/my-squad/
```

Veja o [Guia de Migração de Squad](./squad-migration.md) para cenários detalhados.

---

## Squad Loader & Resolução

### Cadeia de Resolução

O Squad Loader resolve squads nesta ordem:

```
1. Local     → ./squads/{name}/
2. npm       → node_modules/@aios-squads/{name}/
3. Workspace → ../{name}/ (monorepo)
4. Registry  → api.synkra.dev/squads/{name}
```

### Uso Programático

```javascript
const { SquadLoader } = require('./.aios-core/development/scripts/squad');

const loader = new SquadLoader({
  squadsPath: './squads',
  verbose: false,
});

// Resolver caminho do squad
const { path, manifestPath } = await loader.resolve('my-squad');

// Carregar manifesto
const manifest = await loader.loadManifest('./squads/my-squad');

// Listar todos os squads locais
const squads = await loader.listLocal();
// [{ name: 'my-squad', path: './squads/my-squad', manifestPath: '...' }]
```

### Tratamento de Erros

```javascript
const { SquadLoader, SquadLoaderError } = require('./.aios-core/development/scripts/squad');

try {
  await loader.resolve('non-existent');
} catch (error) {
  if (error instanceof SquadLoaderError) {
    console.error(`[${error.code}] ${error.message}`);
    console.log(`Sugestão: ${error.suggestion}`);
  }
}
```

### Códigos de Erro

| Código               | Descrição                         | Solução                   |
| -------------------- | --------------------------------- | ------------------------- |
| `SQUAD_NOT_FOUND`    | Diretório do squad não encontrado | Criar com `*create-squad` |
| `MANIFEST_NOT_FOUND` | Nenhum arquivo de manifesto       | Criar `squad.yaml`        |
| `YAML_PARSE_ERROR`   | Sintaxe YAML inválida             | Use um linter YAML        |
| `PERMISSION_DENIED`  | Erro de permissão de arquivo      | Verifique `chmod 644`     |

---

## Solução de Problemas

### "Squad não encontrado"

```bash
# Verifique se o diretório squads existe
ls ./squads/

# Verificar manifesto
cat ./squads/my-squad/squad.yaml

# Verificar resolução
@squad-creator
*list-squads
```

### Erros de Validação

```bash
# Obter erros detalhados
*validate-squad my-squad --verbose

# Correções comuns:
# - name: deve ser kebab-case
# - version: deve ser semver (x.y.z)
# - aios.type: deve ser "squad"
# - aios.minVersion: deve ser semver válido
```

### Erros de Parse YAML

```bash
# Validar sintaxe YAML online ou com:
npx js-yaml ./squads/my-squad/squad.yaml
```

Problemas comuns:

- Indentação incorreta (use 2 espaços)
- Aspas faltando ao redor de caracteres especiais
- Tabs em vez de espaços

### Falhas de Migração

```bash
# Verificar se backup existe
ls ./squads/my-squad/.backup/

# Restaurar e tentar novamente
cp -r ./squads/my-squad/.backup/pre-migration-*/. ./squads/my-squad/
*migrate-squad ./squads/my-squad --verbose
```

### Erros de Publicação

```bash
# Verificar autenticação GitHub
gh auth status

# Verificar validação do squad
*validate-squad my-squad --strict

# Verificar conflitos de nome
*download-squad --list | grep my-squad
```

---

## FAQ

### Qual a diferença entre um Squad e formatos legados de squad no AIOS?

**Squads** são o padrão no AIOS 2.1+ com:

- Arquitetura task-first
- Validação JSON Schema
- Distribuição em três níveis
- Melhor ferramental (`@squad-creator`)

### Posso usar Squads de diferentes fontes juntos?

Sim. O Squad Loader resolve de múltiplas fontes. Squads locais têm precedência.

### Como atualizo um Squad publicado?

1. Atualizar versão no `squad.yaml` (semver)
2. Executar `*validate-squad --strict`
3. Re-publicar: `*publish-squad` ou `*sync-squad-synkra`

### Squads podem depender de outros Squads?

Sim, declare em `dependencies.squads`:

```yaml
dependencies:
  squads:
    - etl-squad@^2.0.0
```

### Como torno um Squad privado?

- **Nível 1**: Mantenha em `./squads/` (não comitado) - adicione ao `.gitignore`
- **Nível 3**: Sincronize com flag `--private`: `*sync-squad-synkra my-squad --private`

### Qual a versão mínima do AIOS para Squads?

Squads requerem AIOS 2.1.0+. Defina no manifesto:

```yaml
aios:
  minVersion: '2.1.0'
```

### Como testo meu Squad antes de publicar?

```bash
# 1. Validar estrutura
*validate-squad my-squad --strict

# 2. Testar localmente
@my-agent  # Ativar agent do squad
*my-task   # Executar task do squad

# 3. Executar testes do squad (se definidos)
npm test -- tests/squads/my-squad/
```

---

## Recursos Relacionados

- [TASK-FORMAT-SPECIFICATION-V1](../../../.aios-core/docs/standards/TASK-FORMAT-SPECIFICATION-V1.md)
- [Guia de Contribuição de Squads](./contributing-squads.md)
- [Guia de Migração de Squad](./squad-migration.md)
- [Referência da API de Squads](../api/squads-api.md)
- [Agente @squad-creator](../../../.aios-core/development/agents/squad-creator.md)
- [Repositório aios-squads](https://github.com/SynkraAI/aios-squads)

---

## Obtendo Ajuda

- [GitHub Discussions](https://github.com/SynkraAI/aios-core/discussions)
- [Issue Tracker](https://github.com/SynkraAI/aios-core/issues)

---

_AIOS Squads: Equipes de AI agents trabalhando com você_

**Versão:** 2.1.0 | **Atualizado:** 2025-12-26 | **Stories:** SQS-8, SQS-11
