<!--
  Tradução: PT-BR
  Original: /docs/en/GUIDING-PRINCIPLES.md
  Última sincronização: 2026-01-26
-->

# Princípios Orientadores do Método AIOS

> 🌐 [EN](../GUIDING-PRINCIPLES.md) | **PT** | [ES](../es/GUIDING-PRINCIPLES.md)

---

O Método AIOS é um framework em linguagem natural para desenvolvimento de software assistido por IA. Estes princípios garantem que as contribuições mantenham a efetividade do método.

## Princípios Fundamentais

### 1. Dev Agents Devem Ser Enxutos

- **Minimize dependências do dev agent**: Agentes de desenvolvimento que trabalham em IDEs devem ter overhead de contexto mínimo
- **Reserve contexto para código**: Cada linha conta - dev agents devem focar em codificação, não em documentação
- **Web agents podem ser maiores**: Agentes de planejamento (PRD Writer, Architect) usados em UI web podem ter tarefas e dependências mais complexas
- **Arquivos pequenos, carregados sob demanda**: Múltiplos arquivos pequenos e focados são melhores que arquivos grandes com muitas ramificações

### 2. Linguagem Natural em Primeiro Lugar

- **Tudo é markdown**: Agentes, tarefas, templates - todos escritos em inglês simples
- **Sem código no core**: O framework em si não contém código de programação, apenas instruções em linguagem natural
- **Templates autocontidos**: Templates são definidos como arquivos YAML com seções estruturadas que incluem metadados, configuração de workflow e instruções detalhadas para geração de conteúdo

### 3. Design de Agents e Tasks

- **Agents definem papéis**: Cada agent é uma persona com expertise específica (ex: Frontend Developer, API Developer)
- **Tasks são procedimentos**: Instruções passo a passo que um agent segue para completar o trabalho
- **Templates são outputs**: Documentos estruturados com instruções embutidas para geração
- **Dependências importam**: Declare explicitamente apenas o que é necessário

## Diretrizes Práticas

### Quando Adicionar ao Core

- Apenas necessidades universais de desenvolvimento de software
- Não sobrecarrega contextos de dev agents
- Segue padrões existentes de agent/task/template

### Quando Criar Squads

- Necessidades específicas de domínio além do desenvolvimento de software
- Domínios não-técnicos (negócios, bem-estar, educação, criativo)
- Domínios técnicos especializados (games, infraestrutura, mobile)
- Documentação pesada ou bases de conhecimento
- Qualquer coisa que sobrecarregaria agents do core

Veja o [Visão Geral de Squads](../guides/squads-overview.md) para exemplos detalhados e ideias.

### Regras de Design de Agents

1. **Web/Planning Agents**: Podem ter contexto mais rico, múltiplas tasks, templates extensivos
2. **Dev Agents**: Dependências mínimas, focados em geração de código, conjuntos de tasks enxutos
3. **Todos os Agents**: Persona clara, expertise específica, capacidades bem definidas

### Regras de Escrita de Tasks

1. Escreva procedimentos claros passo a passo
2. Use formatação markdown para legibilidade
3. Mantenha tasks de dev agents focadas e concisas
4. Tasks de planejamento podem ser mais elaboradas
5. **Prefira múltiplas tasks pequenas a uma task grande com ramificações**
   - Em vez de uma task com muitos caminhos condicionais
   - Crie múltiplas tasks focadas que o agent pode escolher
   - Isso mantém o overhead de contexto mínimo
6. **Reutilize tasks comuns** - Não crie novas tasks de criação de documento
   - Use a task `create-doc` existente
   - Passe o template YAML apropriado com seções estruturadas
   - Isso mantém consistência e reduz duplicação

### Regras de Templates

Templates seguem a especificação do [AIOS Document Template](../../common/utils/aios-doc-template.md) usando formato YAML:

1. **Estrutura**: Templates são definidos em YAML com metadados claros, configuração de workflow e hierarquia de seções
2. **Separação de Responsabilidades**: Instruções para LLMs estão em campos `instruction`, separadas do conteúdo
3. **Reutilização**: Templates são agnósticos de agent e podem ser usados por diferentes agents
4. **Componentes Principais**:
   - Bloco `template` para metadados (id, name, version, configurações de output)
   - Bloco `workflow` para configuração de modo de interação
   - Array `sections` definindo estrutura do documento com subseções aninhadas
   - Cada seção tem campos `id`, `title` e `instruction`
5. **Recursos Avançados**:
   - Substituição de variáveis usando sintaxe `{{variable_name}}`
   - Seções condicionais com campo `condition`
   - Seções repetíveis com `repeatable: true`
   - Permissões de agent com campos `owner` e `editors`
   - Arrays de exemplos para orientação (nunca incluídos no output)
6. **Output Limpo**: Estrutura YAML garante que toda lógica de processamento permanece separada do conteúdo gerado

## Lembre-se

- O poder está na orquestração em linguagem natural, não no código
- Dev agents codificam, planning agents planejam
- Mantenha dev agents enxutos para máxima eficiência de codificação
- Starter squads lidam com domínios especializados
