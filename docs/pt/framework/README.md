<!--
  Tradução: PT-BR
  Original: /docs/en/framework/README.md
  Última sincronização: 2026-01-26
-->

# Documentação do Framework AIOS

> 🌐 [EN](../../framework/README.md) | **PT** | [ES](../../es/framework/README.md)

---

**Status:** Padrões Oficiais do Framework
**Criado:** 2025-01-16 (Story 6.1.2.6)
**Destino de Migração:** Q2 2026 → repositório `SynkraAI/aios-core`

---

## Visão Geral

Este diretório contém **documentação oficial do framework AIOS** que define padrões, patterns e estruturas aplicáveis em todos os projetos AIOS (greenfield e brownfield).

**Propósito**: Separar documentação de nível de framework dos detalhes específicos de implementação do projeto.

---

## Inventário de Documentação

| Documento                                      | Propósito                                                                                | Público                     |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------- |
| [**coding-standards.md**](coding-standards.md) | Padrões JavaScript/TypeScript, convenções de nomenclatura, regras de qualidade de código | Todos os desenvolvedores    |
| [**tech-stack.md**](tech-stack.md)             | Escolhas de tecnologia, frameworks, bibliotecas e padrões de ferramentas                 | Arquitetos, desenvolvedores |
| [**source-tree.md**](source-tree.md)           | Estrutura de diretórios, organização de arquivos e patterns de layout de projeto         | Todos os membros da equipe  |

---

## Aviso de Migração

**IMPORTANTE**: Estes documentos agora estão no repositório `SynkraAI/aios-core`. A migração do antigo org `aios/aios-core` foi concluída em dezembro de 2024 como parte do OSR-9 (Rebranding).

### Cronograma de Migração

- **Fase 1 (Q1 2026 - Story 6.1.2.6):** Docs do framework separados em `docs/framework/`
- **Fase 2 (Q4 2024):** Repositório migrado para `SynkraAI/aios-core` (OSR-9)
- **Fase 3 (Q3 2026):** Cópias antigas em `docs/architecture/` removidas do projeto brownfield

### Compatibilidade Retroativa

Para compatibilidade retroativa, os docs do framework permanecem acessíveis em **ambas** localizações até Q3 2026:

- **Nova localização** (preferida): `docs/framework/{nome-do-doc}.md`
- **Localização antiga** (deprecada): `docs/architecture/{nome-do-doc}.md`

**Referências**: Atualize links internos para usar `docs/framework/` para preparar para a migração.

---

## Documentação de Framework vs. Projeto

### Documentação do Framework (`docs/framework/`)

- **Escopo**: Portável entre todos os projetos AIOS
- **Exemplos**: Padrões de código, tech stack, estrutura de source tree
- **Ciclo de vida**: Vive no repositório `SynkraAI/aios-core`
- **Alterações**: Requerem aprovação em nível de framework

### Documentação do Projeto (`docs/architecture/project-decisions/`)

- **Escopo**: Específico para implementação brownfield
- **Exemplos**: Análise de decisões, revisões arquiteturais, decisões de integração
- **Ciclo de vida**: Vive no repositório do projeto permanentemente
- **Alterações**: Equipe do projeto decide

---

## Diretrizes de Uso

### Para Desenvolvedores

1. **Leia os docs do framework durante o onboarding** - Entenda os padrões AIOS
2. **Consulte durante o desenvolvimento** - Garanta conformidade com os patterns do framework
3. **Proponha alterações via PRs** - Padrões do framework evoluem com input da comunidade

### Para Arquitetos

1. **Mantenha os docs do framework** - Mantenha os padrões atuais e práticos
2. **Revise PRs para conformidade** - Garanta que o código segue os padrões documentados
3. **Planeje a migração** - Prepare-se para a separação de repositórios em Q2 2026

### Para Mantenedores do Framework AIOS

1. **Controle de versão** - Acompanhe mudanças nos padrões do framework
2. **Prontidão para migração** - Garanta que os docs estejam prontos para separação de repositórios
3. **Consistência entre projetos** - Aplique padrões uniformemente

---

**Última Atualização**: 2025-12-14
**Mantenedor**: Equipe do Framework AIOS
