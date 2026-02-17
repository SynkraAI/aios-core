<!--
  Tradução: PT-BR
  Original: /docs/en/meta-agent-commands.md
  Última sincronização: 2026-01-26
-->

# Referência de Comandos do Meta-Agente

> 🌐 [EN](../meta-agent-commands.md) | **PT** | [ES](../es/meta-agent-commands.md)

---

Guia de referência completo para todos os comandos do meta-agente Synkra AIOS.

## Sumário

1. [Sintaxe de Comandos](#sintaxe-de-comandos)
2. [Comandos Principais](#comandos-principais)
3. [Gerenciamento de Agentes](#gerenciamento-de-agentes)
4. [Operações de Tarefas](#operações-de-tarefas)
5. [Comandos de Workflow](#comandos-de-workflow)
6. [Geração de Código](#geração-de-código)
7. [Análise e Melhoria](#análise--melhoria)
8. [Camada de Memória](#camada-de-memória)
9. [Auto-Modificação](#auto-modificação)
10. [Comandos do Sistema](#comandos-do-sistema)
11. [Comandos Avançados](#comandos-avançados)

## Sintaxe de Comandos

Todos os comandos do meta-agente seguem este padrão:

```
*command-name [required-param] [--optional-flag value]
```

- Comandos começam com `*` (asterisco)
- Parâmetros em `[]` são obrigatórios
- Flags começam com `--` e podem ter valores
- Múltiplas flags podem ser combinadas

### Exemplos

```bash
*create-agent my-agent
*analyze-code src/app.js --depth full
*generate-tests --type unit --coverage 80
```

## Comandos Principais

### *help

Exibe todos os comandos disponíveis ou obtém ajuda para um comando específico.

```bash
*help                    # Mostra todos os comandos
*help create-agent       # Ajuda para comando específico
*help --category agents  # Comandos por categoria
```

### *status

Mostra o status atual do sistema e agentes ativos.

```bash
*status                  # Status básico
*status --detailed       # Informações detalhadas do sistema
*status --health        # Resultados de verificação de saúde
```

### *config

Visualiza ou modifica configuração.

```bash
*config                  # Ver configuração atual
*config --set ai.model gpt-4      # Definir valor de configuração
*config --reset         # Restaurar padrões
*config --export        # Exportar configuração
```

### *version

Exibe informações de versão.

```bash
*version                # Versão atual
*version --check-update # Verificar atualizações
*version --changelog    # Mostrar changelog
```

## Gerenciamento de Agentes

### *create-agent

Cria um novo agente de IA.

```bash
*create-agent <name> [options]

Options:
  --type <type>         Tipo de agente: assistant, analyzer, generator, specialist
  --template <name>     Usar template: basic, advanced, custom
  --capabilities        Construtor interativo de capacidades
  --from-file <path>    Criar a partir de definição YAML

Exemplos:
*create-agent code-reviewer --type analyzer
*create-agent api-builder --template advanced
*create-agent custom-bot --from-file agents/template.yaml
```

### *list-agents

Lista todos os agentes disponíveis.

```bash
*list-agents                      # Lista todos os agentes
*list-agents --active            # Apenas agentes ativos
*list-agents --type analyzer     # Filtrar por tipo
*list-agents --detailed          # Mostrar detalhes completos
```

### *activate

Ativa um agente para uso.

```bash
*activate <agent-name>            # Ativar um único agente
*activate agent1 agent2          # Ativar múltiplos
*activate --all                  # Ativar todos os agentes
*activate --type assistant       # Ativar por tipo
```

### *deactivate

Desativa um agente.

```bash
*deactivate <agent-name>         # Desativar um único agente
*deactivate --all               # Desativar todos os agentes
*deactivate --except agent1     # Desativar todos exceto o especificado
```

### *modify-agent

Modifica configuração de agente existente.

```bash
*modify-agent <name> [options]

Options:
  --add-capability <name>        Adicionar nova capacidade
  --remove-capability <name>     Remover capacidade
  --update-instructions         Atualizar instruções
  --version <version>           Atualizar versão
  --interactive                 Modificação interativa

Exemplos:
*modify-agent helper --add-capability translate
*modify-agent analyzer --update-instructions
*modify-agent bot --interactive
```

### *delete-agent

Remove um agente (com confirmação).

```bash
*delete-agent <name>            # Deletar um único agente
*delete-agent --force          # Pular confirmação
*delete-agent --backup         # Criar backup antes da exclusão
```

### *clone-agent

Cria uma cópia de um agente existente.

```bash
*clone-agent <source> <target>  # Clone básico
*clone-agent bot bot-v2 --modify  # Clonar e modificar
```

## Operações de Tarefas

### *create-task

Cria uma nova tarefa reutilizável.

```bash
*create-task <name> [options]

Options:
  --type <type>           Tipo de tarefa: command, automation, analysis
  --description <text>    Descrição da tarefa
  --parameters           Definir parâmetros interativamente
  --template <name>      Usar template de tarefa

Exemplos:
*create-task validate-input --type command
*create-task daily-backup --type automation
*create-task code-metrics --template analyzer
```

### *list-tasks

Lista tarefas disponíveis.

```bash
*list-tasks                     # Lista todas as tarefas
*list-tasks --type automation  # Filtrar por tipo
*list-tasks --recent          # Tarefas usadas recentemente
*list-tasks --search <query>  # Buscar tarefas
```

### *run-task

Executa uma tarefa específica.

```bash
*run-task <task-name> [params]

Exemplos:
*run-task validate-input --data "user input"
*run-task generate-report --format pdf
*run-task backup-database --incremental
```

### *schedule-task

Agenda execução de tarefa.

```bash
*schedule-task <task> <schedule>

Formatos de agendamento:
  --cron "0 0 * * *"           Expressão cron
  --every "1 hour"             Intervalo
  --at "14:30"                 Horário específico
  --on "monday,friday"         Dias específicos

Exemplos:
*schedule-task cleanup --cron "0 2 * * *"
*schedule-task report --every "6 hours"
*schedule-task backup --at "03:00" --on "sunday"
```

### *modify-task

Atualiza configuração de tarefa.

```bash
*modify-task <name> [options]

Options:
  --add-param <name>           Adicionar parâmetro
  --update-logic              Atualizar implementação
  --change-type <type>        Alterar tipo de tarefa
  --rename <new-name>         Renomear tarefa
```

## Comandos de Workflow

### *create-workflow

Cria workflow automatizado.

```bash
*create-workflow <name> [options]

Options:
  --steps                Construtor interativo de etapas
  --trigger <type>      Tipo de gatilho: manual, schedule, event
  --template <name>     Usar template de workflow
  --from-file <path>    Importar de YAML

Exemplos:
*create-workflow ci-pipeline --trigger push
*create-workflow daily-tasks --trigger "schedule:0 9 * * *"
*create-workflow deployment --template standard-deploy
```

### *list-workflows

Exibe workflows disponíveis.

```bash
*list-workflows                 # Todos os workflows
*list-workflows --active       # Em execução atualmente
*list-workflows --scheduled    # Workflows agendados
*list-workflows --failed       # Execuções com falha
```

### *run-workflow

Executa um workflow.

```bash
*run-workflow <name> [options]

Options:
  --params <json>             Parâmetros do workflow
  --skip-steps <steps>        Pular etapas específicas
  --dry-run                   Visualizar sem executar
  --force                     Forçar execução mesmo se em andamento

Exemplos:
*run-workflow deploy --params '{"env":"staging"}'
*run-workflow backup --skip-steps "upload"
*run-workflow test-suite --dry-run
```

### *stop-workflow

Para workflow em execução.

```bash
*stop-workflow <name>          # Parar workflow específico
*stop-workflow --all          # Parar todos os workflows
*stop-workflow --force        # Forçar parada
```

### *workflow-status

Verifica status de execução do workflow.

```bash
*workflow-status <name>        # Status de um único workflow
*workflow-status --all        # Status de todos os workflows
*workflow-status --history    # Histórico de execução
```

## Geração de Código

### *generate-component

Gera novos componentes com assistência de IA.

```bash
*generate-component <name> [options]

Options:
  --type <type>              Tipo de componente: react, vue, angular, web-component
  --features <list>          Funcionalidades do componente
  --style <type>             Estilização: css, scss, styled-components
  --tests                    Gerar testes
  --storybook               Gerar stories do Storybook
  --template <name>         Usar template de componente

Exemplos:
*generate-component UserProfile --type react --features "avatar,bio,stats"
*generate-component DataTable --type vue --tests --storybook
*generate-component CustomButton --template material-ui
```

### *generate-api

Gera endpoints de API.

```bash
*generate-api <resource> [options]

Options:
  --operations <list>        Operações CRUD: create,read,update,delete
  --auth                     Adicionar autenticação
  --validation              Adicionar validação de entrada
  --docs                    Gerar documentação da API
  --tests                   Gerar testes de API
  --database <type>         Tipo de banco de dados: postgres, mongodb, mysql

Exemplos:
*generate-api users --operations crud --auth --validation
*generate-api products --database mongodb --docs
*generate-api analytics --operations "read" --tests
```

### *generate-tests

Gera suítes de testes.

```bash
*generate-tests [target] [options]

Options:
  --type <type>             Tipo de teste: unit, integration, e2e
  --framework <name>        Framework de teste: jest, mocha, cypress
  --coverage <percent>      Porcentagem de cobertura alvo
  --mocks                   Gerar dados mock
  --fixtures               Gerar fixtures de teste

Exemplos:
*generate-tests src/utils/ --type unit --coverage 90
*generate-tests src/api/ --type integration --mocks
*generate-tests --type e2e --framework cypress
```

### *generate-documentation

Gera documentação.

```bash
*generate-documentation [target] [options]

Options:
  --format <type>           Formato: markdown, html, pdf
  --type <type>            Tipo de documentação: api, user-guide, technical
  --include-examples       Adicionar exemplos de código
  --diagrams              Gerar diagramas
  --toc                   Gerar sumário

Exemplos:
*generate-documentation src/ --type api --format markdown
*generate-documentation --type user-guide --include-examples
*generate-documentation components/ --diagrams --toc
```

## Análise e Melhoria

### *analyze-framework

Analisa todo o codebase.

```bash
*analyze-framework [options]

Options:
  --depth <level>          Profundidade de análise: surface, standard, deep
  --focus <areas>          Áreas de foco: performance, security, quality
  --report-format <type>   Formato: console, json, html
  --save-report <path>     Salvar relatório de análise
  --compare-previous      Comparar com análise anterior

Exemplos:
*analyze-framework --depth deep
*analyze-framework --focus "performance,security"
*analyze-framework --save-report reports/analysis.json
```

### *analyze-code

Analisa arquivos de código específicos.

```bash
*analyze-code <path> [options]

Options:
  --metrics               Mostrar métricas de código
  --complexity           Analisar complexidade
  --dependencies         Analisar dependências
  --suggestions          Obter sugestões de melhoria
  --security             Análise de segurança

Exemplos:
*analyze-code src/app.js --metrics --complexity
*analyze-code src/api/ --security --suggestions
*analyze-code package.json --dependencies
```

### *improve-code-quality

Melhora qualidade do código com assistência de IA.

```bash
*improve-code-quality <path> [options]

Options:
  --focus <aspects>        Foco: readability, performance, maintainability
  --refactor-level <level> Nível: minor, moderate, major
  --preserve-logic        Não alterar funcionalidade
  --add-comments          Adicionar comentários explicativos
  --fix-eslint           Corrigir problemas de linting

Exemplos:
*improve-code-quality src/utils.js --focus readability
*improve-code-quality src/legacy/ --refactor-level major
*improve-code-quality src/api.js --fix-eslint --add-comments
```

### *suggest-refactoring

Obtém sugestões de refatoração.

```bash
*suggest-refactoring <path> [options]

Options:
  --type <type>           Tipo de refatoração: extract, inline, rename
  --scope <level>         Escopo: function, class, module, project
  --impact-analysis      Mostrar impacto das mudanças
  --preview              Visualizar mudanças
  --auto-apply          Aplicar sugestões automaticamente

Exemplos:
*suggest-refactoring src/helpers.js --type extract
*suggest-refactoring src/models/ --scope module
*suggest-refactoring src/app.js --preview --impact-analysis
```

### *detect-patterns

Detecta padrões e anti-padrões de código.

```bash
*detect-patterns [path] [options]

Options:
  --patterns <list>       Padrões específicos para detectar
  --anti-patterns        Focar em anti-padrões
  --suggest-fixes        Sugerir melhorias de padrões
  --severity <level>     Severidade mínima: low, medium, high

Exemplos:
*detect-patterns --anti-patterns --suggest-fixes
*detect-patterns src/ --patterns "singleton,factory"
*detect-patterns --severity high
```

## Camada de Memória

### *memory

Operações da camada de memória.

```bash
*memory <operation> [options]

Operações:
  status                 Mostrar status da camada de memória
  search <query>        Busca semântica
  rebuild               Reconstruir índice de memória
  clear-cache          Limpar cache de memória
  optimize             Otimizar desempenho da memória
  export <path>        Exportar dados de memória
  import <path>        Importar dados de memória

Exemplos:
*memory status
*memory search "authentication flow"
*memory rebuild --verbose
*memory optimize --aggressive
```

### *learn

Aprende com mudanças e padrões de código.

```bash
*learn [options]

Options:
  --from <source>         Fonte: recent-changes, commits, patterns
  --period <time>         Período: "1 week", "1 month"
  --focus <areas>         Áreas de foco para aprendizado
  --update-patterns      Atualizar reconhecimento de padrões
  --save-insights        Salvar insights de aprendizado

Exemplos:
*learn --from recent-changes
*learn --from commits --period "1 week"
*learn --focus "error-handling,api-calls"
```

### *remember

Armazena informações importantes na memória.

```bash
*remember <key> <value> [options]

Options:
  --type <type>          Tipo de informação: pattern, preference, rule
  --context <context>    Contexto para a memória
  --expires <time>       Tempo de expiração
  --priority <level>     Prioridade: low, normal, high

Exemplos:
*remember coding-style "use-functional-components" --type preference
*remember api-pattern "always-validate-input" --context security
*remember temp-fix "skip-test-x" --expires "1 week"
```

### *forget

Remove informação da memória.

```bash
*forget <key>              # Esquecer chave específica
*forget --pattern <regex>  # Esquecer por padrão
*forget --older-than <time> # Esquecer memórias antigas
*forget --type <type>      # Esquecer por tipo
```

## Auto-Modificação

### *improve-self

Auto-melhoria do meta-agente.

```bash
*improve-self [options]

Options:
  --aspect <area>         Área de melhoria: speed, accuracy, features
  --based-on <data>      Baseado em: usage, feedback, analysis
  --preview              Visualizar melhorias
  --backup              Criar backup antes das mudanças
  --test-improvements   Testar melhorias antes de aplicar

Exemplos:
*improve-self --aspect accuracy --based-on feedback
*improve-self --preview --test-improvements
*improve-self --aspect features --backup
```

### *evolve

Evolui capacidades baseado no uso.

```bash
*evolve [options]

Options:
  --strategy <type>      Estratégia de evolução: conservative, balanced, aggressive
  --focus <areas>        Áreas de foco para evolução
  --generations <num>    Número de ciclos de evolução
  --fitness-metric      Definir métricas de aptidão
  --rollback-point     Criar ponto de rollback

Exemplos:
*evolve --strategy balanced
*evolve --focus "code-generation,analysis" --generations 3
*evolve --fitness-metric "task-success-rate" --rollback-point
```

### *adapt

Adapta às necessidades específicas do projeto.

```bash
*adapt [options]

Options:
  --to <context>         Adaptar a: project-type, team-style, domain
  --learn-from <source>  Aprender de: codebase, commits, reviews
  --adaptation-level     Nível: minimal, moderate, full
  --preserve <aspects>   Preservar comportamentos específicos

Exemplos:
*adapt --to project-type --learn-from codebase
*adapt --to team-style --adaptation-level moderate
*adapt --to domain --preserve "core-functions"
```

### *optimize-performance

Otimiza desempenho do meta-agente.

```bash
*optimize-performance [options]

Options:
  --target <metric>      Alvo: speed, memory, accuracy
  --profile             Fazer profile antes da otimização
  --benchmark          Executar benchmarks
  --aggressive         Otimização agressiva
  --safe-mode         Apenas otimização segura

Exemplos:
*optimize-performance --target speed --profile
*optimize-performance --target memory --safe-mode
*optimize-performance --benchmark --aggressive
```

## Comandos do Sistema

### *backup

Cria backup do sistema.

```bash
*backup [options]

Options:
  --include <items>      Itens: config, agents, memory, all
  --exclude <items>     Excluir itens específicos
  --destination <path>  Destino do backup
  --compress           Comprimir backup
  --encrypt           Criptografar backup

Exemplos:
*backup --include all --compress
*backup --include "agents,config" --destination backups/
*backup --exclude memory --encrypt
```

### *restore

Restaura de backup.

```bash
*restore <backup-file> [options]

Options:
  --items <list>        Itens específicos para restaurar
  --preview            Visualizar operação de restauração
  --force             Forçar restauração sem confirmação
  --merge             Mesclar com dados existentes

Exemplos:
*restore backups/backup-2024-01-01.zip
*restore backup.tar.gz --items "agents,config"
*restore latest-backup --preview
```

### *update

Atualiza o Synkra AIOS.

```bash
*update [options]

Options:
  --check              Apenas verificar atualizações
  --version <version>  Atualizar para versão específica
  --beta              Incluir versões beta
  --force            Forçar atualização
  --backup          Criar backup antes de atualizar

Exemplos:
*update --check
*update --version 2.0.0 --backup
*update --beta --force
```

### *uninstall

Desinstala componentes ou sistema inteiro.

```bash
*uninstall [component] [options]

Options:
  --keep-data         Manter dados do usuário
  --keep-config      Manter configuração
  --complete         Desinstalação completa
  --dry-run         Visualizar desinstalação

Exemplos:
*uninstall agent-name
*uninstall --complete --keep-data
*uninstall memory-layer --dry-run
```

### *doctor

Diagnósticos e reparo do sistema.

```bash
*doctor [options]

Options:
  --fix              Auto-corrigir problemas detectados
  --deep            Varredura profunda do sistema
  --report <path>   Salvar relatório de diagnóstico
  --component <name> Verificar componente específico

Exemplos:
*doctor
*doctor --fix
*doctor --deep --report diagnosis.json
*doctor --component memory-layer
```

## Comandos Avançados

### *export

Exporta configurações, agentes ou dados.

```bash
*export <type> [options]

Tipos:
  config              Exportar configuração
  agents             Exportar agentes
  workflows          Exportar workflows
  memory            Exportar dados de memória
  all              Exportar tudo

Options:
  --format <type>     Formato: json, yaml, archive
  --destination <path> Destino da exportação
  --include-sensitive Incluir dados sensíveis
  --pretty          Formatação legível

Exemplos:
*export config --format yaml
*export agents --destination exports/agents/
*export all --format archive --destination backup.zip
```

### *import

Importa configurações, agentes ou dados.

```bash
*import <file> [options]

Options:
  --type <type>       Tipo de importação: config, agents, workflows
  --merge            Mesclar com existente
  --replace         Substituir existente
  --validate       Validar antes de importar
  --dry-run       Visualizar importação

Exemplos:
*import agents.json --type agents --merge
*import config.yaml --replace --validate
*import backup.zip --dry-run
```

### *benchmark

Executa benchmarks de desempenho.

```bash
*benchmark [suite] [options]

Suítes:
  all               Executar todos os benchmarks
  generation       Velocidade de geração de código
  analysis        Desempenho de análise
  memory          Operações de memória
  e2e            Workflows de ponta a ponta

Options:
  --iterations <num>   Número de iterações
  --compare <baseline> Comparar com baseline
  --save-results      Salvar resultados do benchmark
  --profile          Incluir dados de profiling

Exemplos:
*benchmark all --iterations 10
*benchmark generation --compare v1.0.0
*benchmark memory --profile --save-results
```

### *debug

Operações do modo debug.

```bash
*debug <command> [options]

Comandos:
  enable              Habilitar modo debug
  disable            Desabilitar modo debug
  logs <level>       Mostrar logs de debug
  trace <operation>  Rastrear operação específica
  breakpoint <location> Definir breakpoint

Options:
  --verbose          Saída detalhada
  --filter <pattern> Filtrar saída de debug
  --save <path>     Salvar sessão de debug

Exemplos:
*debug enable --verbose
*debug logs error --filter "api"
*debug trace create-agent --save debug-session.log
```

### *plugin

Gerenciamento de plugins.

```bash
*plugin <operation> [options]

Operações:
  install <name>      Instalar plugin
  remove <name>      Remover plugin
  list              Listar plugins instalados
  search <query>    Buscar plugins disponíveis
  create <name>     Criar novo plugin

Options:
  --version <ver>     Versão do plugin
  --source <url>     Fonte do plugin
  --enable          Habilitar após instalação
  --dev            Modo de desenvolvimento

Exemplos:
*plugin install code-formatter --enable
*plugin create my-custom-plugin --dev
*plugin search "testing"
*plugin list --detailed
```

## Atalhos de Comandos

Comandos comuns têm atalhos:

```bash
*h     → *help
*s     → *status
*la    → *list-agents
*lt    → *list-tasks
*lw    → *list-workflows
*ca    → *create-agent
*ct    → *create-task
*cw    → *create-workflow
*a     → *analyze-framework
*i     → *improve-code-quality
```

## Encadeamento de Comandos

Encadeie múltiplos comandos:

```bash
# Usando && para execução sequencial
*analyze-framework && *suggest-improvements && *generate-report

# Usando pipes para fluxo de dados
*analyze-code src/ | *improve-code-quality | *generate-tests

# Usando ; para execução independente
*backup ; *update ; *doctor --fix
```

## Modo Interativo

Entre no modo interativo para comandos contínuos:

```bash
*interactive

AIOS> create-agent helper
AIOS> activate helper
AIOS> helper translate "Hello" --to spanish
AIOS> exit
```

## Variáveis de Ambiente

Controle o comportamento com variáveis de ambiente:

```bash
AIOS_AI_PROVIDER=openai          # Provedor de IA
AIOS_AI_MODEL=gpt-4             # Modelo de IA
AIOS_LOG_LEVEL=debug            # Nível de log
AIOS_TELEMETRY=disabled         # Configuração de telemetria
AIOS_TIMEOUT=30000             # Timeout de comando (ms)
AIOS_MEMORY_CACHE=true         # Cache de memória
```

## Tratamento de Erros

Respostas de erro comuns e soluções:

```bash
# Permissão negada
*sudo <command>                 # Executar com permissões elevadas

# Comando não encontrado
*help <command>                # Verificar nome correto do comando
*update                       # Atualizar para versão mais recente

# Erro de timeout
*config --set timeout 60000   # Aumentar timeout
*<command> --async           # Executar assincronamente

# Erro de memória
*memory clear-cache          # Limpar cache de memória
*optimize-performance --target memory
```

---

**Dicas Profissionais:**

1. Use `*help <command>` liberalmente - fornece exemplos detalhados
2. Auto-completar por tab funciona para comandos e parâmetros
3. Histórico de comandos disponível com setas cima/baixo
4. Use `--dry-run` para visualizar operações perigosas
5. Combine comandos com pipes e encadeamentos para workflows poderosos

Lembre-se: O meta-agente aprende com seus padrões de uso. Quanto mais você usa, melhor ele se torna em antecipar suas necessidades!
