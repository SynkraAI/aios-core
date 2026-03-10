# Guia de Templates de Componentes — Checklists, Templates, Dados e Regras

## 1. Criação de Checklist
- **Onde Salvar**: `.aios-core/development/checklists/` ou `squads/{squad}/checklists/`
- **Schema**: Frontmatter YAML com `name`, `id`, `items`

## 2. Criação de Template
- **Onde Salvar**: `.aios-core/development/templates/`
- **Sintaxe de Variáveis**: Use `{{nome_da_variavel}}` para interpolação.

## 3. Criação de Arquivo de Dados
- **Onde Salvar**: `.aios-core/development/data/`
- **Formatos**: Registro, Heurísticas ou Padrões de Workflow.

## 4. Criação de Regra
- **Onde Salvar**: `.aios-core/development/rules/`
- **Carregamento Condicional**: Use `paths:` no frontmatter YAML para restringir onde a regra se aplica.
