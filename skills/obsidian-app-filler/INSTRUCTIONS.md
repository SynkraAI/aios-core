# Instruções para o Claude - Obsidian App Filler

Quando o usuário executar `/preencher-app`, siga este workflow:

## Workflow de Execução

### 1. Leitura dos Dados
```javascript
// Ler arquivo de task gerado pelo skill.js
const taskPath = '.aiox/tmp/app-filler-task.json';
const taskData = JSON.parse(fs.readFileSync(taskPath, 'utf-8'));

// Extrair dados
const { filePath, prd, content } = taskData;
```

### 2. Análise do PRD

Analise o PRD e extraia:

**Metadados:**
- **prioridade**: Avalie urgência, impacto, stakeholders
  - `alta` - Crítico para negócio, urgente, alto impacto
  - `média` - Importante mas não urgente
  - `baixa` - Nice to have, pode esperar

- **complexidade**: Avalie escopo técnico, integrações, tecnologias
  - `alta` - Arquitetura complexa, múltiplas integrações, tecnologias novas
  - `média` - Arquitetura padrão, algumas integrações
  - `baixa` - Simples, poucas dependências

- **stack**: Liste principais tecnologias (Frontend, Backend, Database)

**Conteúdo:**
- Descrição clara e concisa
- 3-5 objetivos principais
- Stack tecnológica detalhada
- Requisitos funcionais (RF01, RF02, ...)
- Requisitos não-funcionais (RNF01, RNF02, ...)
- Proposta de arquitetura
- Roadmap em 3 fases (MVP, Melhorias, Evolução)
- Notas técnicas e considerações

### 3. Geração do Conteúdo

Use o template existente no arquivo e preencha:

```markdown
# {{TITLE}} (extrair do PRD ou nome do arquivo)

## 💡 Informações sobre o App

**Status atual:** `VIEW[{status}][text]`
**Andamento:** `VIEW[{andamento}][text]`
**Prioridade:** `VIEW[{prioridade}][text]`
**Complexidade:** `VIEW[{complexidade}][text]`

---

## 📋 Descrição

[1-2 parágrafos descrevendo o app, problema, solução, público-alvo]

## 🎯 Objetivos

- [ ] Objetivo 1 (específico e mensurável)
- [ ] Objetivo 2
- [ ] Objetivo 3
- [ ] Objetivo 4
- [ ] Objetivo 5

## 🛠️ Stack Tecnológica

**Frontend:** [frameworks, bibliotecas, UI components]
**Backend:** [runtime, frameworks, APIs, middleware]
**Database:** [tipo, ORM, cache, migrations]
**Infraestrutura:** [cloud provider, CI/CD, monitoring, logging]

## ✅ Requisitos Funcionais

- [ ] RF01: [Descrição clara do requisito funcional]
- [ ] RF02: [...]
- [ ] RF03: [...]
...

## 🔧 Requisitos Não-Funcionais

- [ ] RNF01: Performance - [meta específica]
- [ ] RNF02: Segurança - [requisito de segurança]
- [ ] RNF03: Escalabilidade - [meta de escala]
- [ ] RNF04: Usabilidade - [padrão UX]
- [ ] RNF05: Manutenibilidade - [padrão de código]
...

## 📐 Arquitetura

[Descrever arquitetura proposta]

**Componentes principais:**
- Component 1: [responsabilidade]
- Component 2: [responsabilidade]

**Fluxo de dados:**
1. [passo 1]
2. [passo 2]
3. [passo 3]

**Integrações:**
- [serviço 1]: [propósito]
- [serviço 2]: [propósito]

## 🚀 Roadmap

### Fase 1: MVP
- [ ] [Feature essencial 1]
- [ ] [Feature essencial 2]
- [ ] [Feature essencial 3]
...

### Fase 2: Melhorias
- [ ] [Otimização 1]
- [ ] [Feature secundária 1]
- [ ] [Feature secundária 2]
...

### Fase 3: Evolução
- [ ] [Feature avançada 1]
- [ ] [Expansão 1]
- [ ] [Inovação 1]
...

## 📝 Notas e Considerações

**Decisões técnicas:**
- [Decisão 1]: [justificativa]
- [Decisão 2]: [justificativa]

**Trade-offs:**
- [Trade-off 1]: [análise]
- [Trade-off 2]: [análise]

**Riscos:**
- [Risco 1]: [mitigação]
- [Risco 2]: [mitigação]

**Referências:**
- [Link útil 1]
- [Link útil 2]

## 🔗 Links Relacionados

- [[Nota relacionada 1]]
- [[Nota relacionada 2]]
- [Documentação externa](https://exemplo.com)
```

### 4. Atualização do Arquivo

**IMPORTANTE:**
- Preserve o PRD original intacto
- Atualize YAML frontmatter com metadados calculados
- Substitua apenas o conteúdo após "👇 Desta linha para baixo"
- Mantenha formatação markdown limpa

### 5. Estrutura Final

```markdown
---
tags:
  - App
status: 🔴 Não iniciado
concluido: false
andamento: Aguardando definição de requisitos
prioridade: [alta|média|baixa]
data_criacao: YYYY-MM-DD
data_conclusao: ""
complexidade: [alta|média|baixa]
---

# PRD DO APP
(Colocar aqui o PRD completo do app, que a IA irá preencher tudo abaixo automaticamente)
```````

[PRD ORIGINAL PRESERVADO]

```````

----

👇 Desta linha para baixo, a IA preenche de acordo com o PRD.

[CONTEÚDO GERADO PELO CLAUDE]
```

### 6. Validação Final

Antes de salvar, valide:
- [ ] YAML frontmatter válido
- [ ] PRD preservado
- [ ] Todas as seções preenchidas
- [ ] Checklists formatados corretamente
- [ ] Links válidos
- [ ] Markdown bem formatado

### 7. Relatório

Após salvar, gere relatório:

```
✅ Arquivo atualizado com sucesso!

Resumo:
- Título: [nome do app]
- Prioridade: [alta|média|baixa]
- Complexidade: [alta|média|baixa]
- Stack: [principais tecnologias]
- Requisitos: [X] total ([Y] RF + [Z] RNF)
- Roadmap: 3 fases, [N] tasks

Próximos passos:
1. Revisar conteúdo gerado
2. Ajustar metadados se necessário
3. Atualizar status para "🟡 Em andamento" quando iniciar
4. Verificar no Índice de Sistemas
```

## Princípios de Geração

1. **Específico**: Evite generalidades, seja concreto
2. **Acionável**: Checklists devem ser executáveis
3. **Mensurável**: Objetivos devem ter critérios claros
4. **Realista**: Baseie-se no PRD fornecido
5. **Estruturado**: Mantenha organização clara
6. **Técnico**: Use terminologia adequada
7. **Completo**: Preencha todas as seções relevantes

## Tratamento de Erros

- Se PRD vago: Preencha com [TODO: definir] e marque no relatório
- Se tecnologia não especificada: Sugira opções populares
- Se escopo incerto: Marque complexidade como "média" e adicione nota
- Se falhar: Não modifique arquivo, reporte erro e mantenha backup

## Exemplo de Análise

**PRD:**
> "App de delivery de comida que conecta restaurantes a clientes.
> Deve ter cadastro, menu, carrinho, pagamento e tracking em tempo real.
> Stack: React Native, Node.js, MongoDB."

**Análise:**
- **Prioridade:** média (app comum, mercado saturado)
- **Complexidade:** média (real-time tracking adiciona complexidade)
- **Stack:** React Native, Node.js, Express, MongoDB, Socket.io
- **RF:** ~15 requisitos (auth, menu, cart, payment, tracking, notifications)
- **RNF:** Performance (tempo real), Segurança (PCI compliance), Escalabilidade
- **Arquitetura:** Client-Server com WebSockets para tracking
- **Roadmap:**
  - MVP: Auth, Menu, Cart, Payment básico
  - Fase 2: Tracking real-time, Notifications push
  - Fase 3: ML recommendations, Analytics dashboard

---

**Versão:** 1.0.0
**Última atualização:** 2026-02-06
