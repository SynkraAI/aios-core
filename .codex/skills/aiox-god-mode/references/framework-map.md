# Mapa do Framework — Referência Completa de Navegação

## Sistema de Limites de 4 Camadas
- **L1 Core**: Imutáveis (`.aios-core/core/`, `bin/`)
- **L2 Templates**: Definições gerenciadas (`.aios-core/development/`)
- **L3 Config**: Configurações do projeto (`core-config.yaml`)
- **L4 Runtime**: Artefatos ativos do projeto (`docs/stories/`, `packages/`)

## Localizador de Componentes
- Agentes: `.aios-core/development/agents/`
- Tarefas: `.aios-core/development/tasks/`
- Workflows: `.aios-core/development/workflows/`

## Protocolo de Handoff
Sempre crie um artefato de handoff em `.aios/handoffs/` ao trocar de agente para preservar o estado e a intenção.
