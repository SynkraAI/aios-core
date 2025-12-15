# Contribuindo para o Synkra AIOS

> 🇺🇸 [English Version](CONTRIBUTING.md)

Obrigado pelo seu interesse em contribuir para o Synkra AIOS! Este guia vai ajudá-lo a entender nosso fluxo de trabalho de desenvolvimento e processo de validação.

## 📋 Índice

- [Começando](#começando)
- [Fluxo de Trabalho de Desenvolvimento](#fluxo-de-trabalho-de-desenvolvimento)
- [Sistema de Validação](#sistema-de-validação)
- [Processo de Pull Request](#processo-de-pull-request)
- [Padrões de Código](#padrões-de-código)
- [Requisitos de Testes](#requisitos-de-testes)
- [Desenvolvimento Orientado por Stories](#desenvolvimento-orientado-por-stories)

## Começando

### Pré-requisitos

- Node.js >=20.0.0
- npm
- GitHub CLI (`gh`)
- Git

### Configuração

1. **Faça fork e clone o repositório**

```bash
git clone https://github.com/SEU_USUARIO/aios-core.git
cd aios-core
```

2. **Instale as dependências**

```bash
npm install
```

3. **Verifique a configuração**

```bash
# Execute os testes
npm test

# Execute o linting
npm run lint

# Execute a verificação de tipos
npm run typecheck
```

## Fluxo de Trabalho de Desenvolvimento

O Synkra AIOS usa uma abordagem de desenvolvimento orientada por stories com um sistema de validação em múltiplas camadas.

### 1. Crie uma Branch de Feature

```bash
git checkout -b feature/nome-da-sua-feature
```

Convenções de nomenclatura de branches:
- `feature/` - Novas funcionalidades
- `bugfix/` - Correções de bugs
- `docs/` - Atualizações de documentação
- `refactor/` - Refatoração de código
- `test/` - Adições/melhorias de testes

### 2. Trabalhe em uma Story

Todo desenvolvimento é orientado por stories em `docs/stories/`. Veja [Desenvolvimento Orientado por Stories](#desenvolvimento-orientado-por-stories) abaixo.

### 3. Faça Commit das Alterações

Commits disparam o **hook pre-commit** que valida:
- ✅ ESLint (qualidade de código)
- ✅ TypeScript (verificação de tipos)

```bash
git add .
git commit -m "feat: adicionar nova funcionalidade [Story X.X]"
```

**Formato da Mensagem de Commit:**
```
<tipo>: <descrição> [Story X.X]

<corpo opcional>
```

Tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### 4. Faça Push das Alterações

O push dispara o **hook pre-push** que valida:
- ✅ Conclusão das checkboxes da story
- ✅ Consistência do status da story

```bash
git push origin feature/nome-da-sua-feature
```

### 5. Crie um Pull Request

```bash
gh pr create --title "feat: Adicionar nova funcionalidade" --body "Descrição das alterações"
```

O **pipeline de CI/CD** vai executar:
- ✅ Validação ESLint
- ✅ Verificação de tipos TypeScript
- ✅ Testes Jest com cobertura
- ✅ Validação de story

## Sistema de Validação

O AIOS implementa uma estratégia de **Defesa em Profundidade** com 3 camadas de validação:

### Camada 1: Pre-commit (Local - Rápida)

**Propósito:** Capturar problemas antes de serem commitados
**Performance:** <5s
**Ferramentas:**
- ESLint com cache
- Compilação incremental TypeScript

**O que verifica:**
- Consistência de estilo de código
- Erros de tipo
- Erros de sintaxe
- Problemas de import

**Pular se necessário (NÃO recomendado):**
```bash
git commit --no-verify
```

### Camada 2: Pre-push (Local - Validação de Stories)

**Propósito:** Garantir consistência da story antes do push
**Performance:** <2s
**Ferramentas:**
- Validador de checkboxes de story

**O que verifica:**
- Conclusão das checkboxes vs status
- Seções obrigatórias presentes
- Consistência de status

**Exemplo de validação:**
```yaml
status: "completed"
acceptance_criteria:
  - tasks:
    - "[x] Tarefa 1"  # Deve estar marcada
    - "[ ] Tarefa 2"  # ❌ Erro: incompleta mas status=completed
```

### Camada 3: CI/CD (Cloud - Obrigatório para Merge)

**Propósito:** Validação final antes do merge
**Performance:** ~2-5 minutos
**Plataforma:** GitHub Actions

**O que verifica:**
- Todos os erros de lint e tipo
- Suite de testes passa
- Cobertura de código ≥80%
- Validação de story
- Regras de proteção de branch

## Processo de Pull Request

### Antes de Criar o PR

1. ✅ Todos os testes passam localmente
2. ✅ Checkboxes da story correspondem ao status
3. ✅ Código segue o guia de estilo
4. ✅ Documentação atualizada

### Requisitos do PR

- **Título:** Título claro e descritivo seguindo convenções de commit
- **Descrição:** Explicar o quê e por quê (não como)
- **Referência à Story:** Link para o arquivo de story relacionado
- **Testes:** Incluir testes para nova funcionalidade
- **Documentação:** Atualizar docs relevantes

### Processo de Revisão do PR

1. **Verificações Automatizadas** - CI deve passar
2. **Revisão de Código** - Pelo menos 1 aprovação necessária
3. **Proteção de Branch** - Branch master é protegida
4. **Estratégia de Merge** - Squash and merge (histórico linear)

## Padrões de Código

### JavaScript/TypeScript

- Use recursos ES2022
- Prefira `const` sobre `let`
- Use async/await sobre promises
- Adicione comentários JSDoc para APIs públicas
- Siga o estilo de código existente

### Organização de Arquivos

```
.aios-core/
├── agents/       # Definições de agentes
├── tasks/        # Workflows de tarefas
├── workflows/    # Workflows multi-etapas
├── utils/        # Funções utilitárias
└── templates/    # Templates de arquivos

docs/
├── stories/      # Stories de desenvolvimento
├── prd/          # Requisitos de produto
└── architecture/ # Arquitetura do sistema
```

### Configuração ESLint

- Estende: `eslint:recommended`, `@typescript-eslint/recommended`
- Cache habilitado (`.eslintcache`)
- Sem console.log em código de produção (avisos)

### Configuração TypeScript

- Target: ES2022
- Modo strict habilitado
- Compilação incremental
- Módulos CommonJS

## Requisitos de Testes

### Cobertura de Testes

- **Mínimo:** 80% de cobertura (branches, funções, linhas, statements)
- **Testes Unitários:** Obrigatórios para todas as novas funções
- **Testes de Integração:** Obrigatórios para workflows
- **Arquivos de Teste:** `*.test.js` ou no diretório `tests/`

### Escrevendo Testes

```javascript
describe('MeuModulo', () => {
  it('deve fazer algo', () => {
    const resultado = minhaFuncao();
    expect(resultado).toBe(esperado);
  });
});
```

### Executando Testes

```bash
# Executar todos os testes
npm test

# Executar com cobertura
npm run test:coverage

# Modo watch
npm run test:watch

# Arquivo de teste específico
npm test -- caminho/para/teste.js
```

## Desenvolvimento Orientado por Stories

### O que é uma Story?

Stories são arquivos YAML em `docs/stories/` que definem:
- Requisitos da feature
- Critérios de aceitação
- Tarefas de implementação
- Detalhes técnicos

### Estrutura da Story

```yaml
id: "X.X"
title: "Título da Story"
status: "ready" | "in progress" | "Ready for Review" | "completed"
acceptance_criteria:
  - name: "Critério 1"
    tasks:
      - "[ ] Tarefa 1"
      - "[x] Tarefa 2"  # Marque como concluída com [x]
dev_agent_record:
  agent_model: "claude-sonnet-4-5"
  implementation_date: "2025-01-23"
```

### Trabalhando com Stories

1. **Leia a story** - Entenda os requisitos
2. **Atualize checkboxes** - Marque tarefas como concluídas `[x]`
3. **Atualize status** - Mude o status quando apropriado
4. **Atualize lista de arquivos** - Rastreie arquivos modificados
5. **Adicione notas de conclusão** - Documente decisões

### Fluxo de Status da Story

```
ready → in progress → Ready for Review → completed
```

**Regras:**
- Status `ready`: Nenhuma tarefa deve estar marcada
- Status `in progress`: Algumas tarefas marcadas
- Status `completed`: Todas as tarefas devem estar marcadas

## Problemas Comuns e Soluções

### Hook Pre-commit Falha

**Erros ESLint:**
```bash
npm run lint -- --fix  # Auto-corrigir problemas
```

**Erros TypeScript:**
```bash
npm run typecheck  # Ver todos os erros
```

### Hook Pre-push Falha

**Erros de validação de story:**
```bash
node .aios-core/utils/aios-validator.js stories  # Verificar todas as stories
```

**Corrigir inconsistências de story:**
- Garanta que checkboxes correspondam ao status
- Adicione seções obrigatórias faltantes
- Atualize dev_agent_record

### CI Falha

**Verificar logs do CI:**
```bash
gh pr checks  # Ver verificações do PR
```

**Correções comuns:**
- Rebase no master mais recente
- Corrigir falhas de teste localmente
- Aumentar cobertura de teste
- Atualizar validação de story

## Criando Squads

Quer estender o AIOS com nova funcionalidade?

Veja nosso [Guia de Squads](docs/guides/squads-guide.md) para:
- Estrutura de Squad e formato de manifesto
- Criando agentes, tarefas e workflows
- Testando e publicando seu Squad
- Diretrizes de integração

### Links Rápidos
- [Template de Squad](templates/squad/) - Comece de um template funcional
- [Exemplos de Squads](docs/guides/squad-examples/) - Aprenda com exemplos
- [Discussões de Squads](https://github.com/SynkraAI/aios-core/discussions/categories/ideas) - Compartilhe suas ideias de Squad

## Recursos Adicionais

- 📖 [Guia da Comunidade](COMMUNITY-PT.md) - Como participar da comunidade AIOS
- 📖 [Guia de Squads](docs/guides/squads-guide.md) - Crie e publique equipes de agentes IA
- 📖 [Guia de Git Workflow](docs/git-workflow-guide.md) - Documentação detalhada do workflow
- 📖 [Guia do Usuário](aios-core/user-guide.md) - Guia completo do usuário
- 📖 [Arquitetura](docs/architecture.md) - Arquitetura do sistema
- 🗺️ [Roadmap](ROADMAP-PT.md) - Veja o que está planejado e influencie nossa direção
- 💬 [GitHub Discussions](https://github.com/SynkraAI/aios-core/discussions) - Hub da comunidade

## Dúvidas?

- Abra uma [issue](https://github.com/SynkraAI/aios-core/issues)
- Inicie uma [discussão](https://github.com/SynkraAI/aios-core/discussions)
- Leia o [Guia da Comunidade](COMMUNITY-PT.md)

---

**Obrigado por contribuir para o Synkra AIOS!** 🚀
