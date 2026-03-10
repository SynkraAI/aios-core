# Guia de Criação de Workflow — Schema e Template Completos

## Convenções de Nomeação
- Use kebab-case com extensão `.yaml`

## Schema YAML Completo
- `name`: Nome do Workflow
- `phases`: Lista de fases de execução
- `sequence`: Ordem de agentes e tarefas

## Tipos de Passos
- `task`: Executar tarefa específica de um agente
- `persona`: Trocar para a persona de um agente
- `wait`: Confirmação do usuário ou timer
