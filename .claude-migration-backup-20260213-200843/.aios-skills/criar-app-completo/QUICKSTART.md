# 🚀 Quick Start - Criar App Completo

Guia rápido para criar apps end-to-end: da ideia ao app estruturado no Obsidian.

## 🎯 O que faz

**Workflow completo em um único comando:**
```
Sua Ideia → PRD Profissional → Arquivo Obsidian → App Totalmente Preenchido
```

## ⚡ Uso Ultra Rápido

### Opção 1: Modo Interativo (Recomendado)

```bash
/criar-app-completo
```

O skill vai perguntar tudo que precisa e criar o app completo!

### Opção 2: Modo Silencioso (Super Rápido)

```bash
/criar-app-completo --silent "Clone do Instagram para pets"
```

Claude infere tudo automaticamente!

### Opção 3: Modo Completo (PRD Detalhado)

```bash
/criar-app-completo --mode=complete
```

Mais perguntas = PRD mais rico = App mais detalhado

## 📋 Fluxo Completo

### Passo 1: Coleta de Informações

```
🚀 Criar App Completo v1.0.0

📝 Vamos criar o PRD do seu app!

1️⃣  Nome do app: TaskMaster Pro
2️⃣  Que problema ele resolve? Desenvolvedores perdem tempo
3️⃣  Quem é o público-alvo? Desenvolvedores full-stack
4️⃣  3 principais funcionalidades: Git, Pomodoro, Snippets
5️⃣  Existe competidor? Linear, Todoist
6️⃣  Plataforma: Web + Mobile
7️⃣  Tecnologias: React, Node.js
8️⃣  Requisitos especiais? Sincronização real-time
```

### Passo 2: Geração de PRD

```
🎯 Gerando PRD completo...

✓ Executive Summary
✓ Problem Statement
✓ Target Audience (3 personas)
✓ Features (MoSCoW)
✓ Functional Requirements (18 RF)
✓ Non-Functional Requirements (12 RNF)
✓ Technical Stack
✓ Architecture
✓ Success Metrics
✓ Risks & Mitigations
✓ Timeline & Roadmap

📄 PRD: 3,500 palavras, 20 seções
```

### Passo 3: Criação no Obsidian

```
📂 Criando arquivo no Obsidian...

✓ Template carregado
✓ PRD inserido
✓ Arquivo criado: TaskMaster Pro.md

📍 /APPS para Criar/TaskMaster Pro.md
```

### Passo 4: Preenchimento Automático

```
🤖 Preenchendo app automaticamente...

✓ Metadados YAML
  - Prioridade: alta
  - Complexidade: média
  - Stack: React, Node.js, Socket.io

✓ Descrição (2 parágrafos)
✓ Objetivos (5 items)
✓ Stack Tecnológica detalhada
✓ Requisitos Funcionais (18 items)
✓ Requisitos Não-Funcionais (12 items)
✓ Arquitetura proposta
✓ Roadmap (3 fases, 25 tasks)
✓ Notas técnicas
```

### Passo 5: Resultado Final

```
✅ APP CRIADO COM SUCESSO!

📱 TaskMaster Pro
📍 /APPS para Criar/TaskMaster Pro.md

📊 Resumo:
- Prioridade: alta
- Complexidade: média
- Stack: React, Node.js, Socket.io, MongoDB
- Requisitos: 30 (18 RF + 12 RNF)
- Roadmap: 3 fases, 25 tasks
- PRD: 3,500 palavras

✨ App completamente estruturado!

Próximos passos:
1. Abrir no Obsidian
2. Revisar e ajustar
3. Atualizar status → "🟡 Em andamento"
4. Começar desenvolvimento!
```

## 🎨 Modos de Operação

### 1. Modo Rápido (Quick) - Default

**Características:**
- 8 perguntas essenciais
- PRD focado em MVP
- Geração em ~5 minutos
- 2,500-3,500 palavras

**Quando usar:**
- Validação rápida de ideia
- MVP/Protótipo
- Projetos pequenos/médios

**Comando:**
```bash
/criar-app-completo
# ou
/criar-app-completo --mode=quick
```

---

### 2. Modo Completo (Complete)

**Características:**
- 14 perguntas detalhadas
- PRD extenso e profissional
- Geração em ~15 minutos
- 4,000-6,000 palavras
- Análise competitiva incluída
- Business model canvas

**Quando usar:**
- Projetos complexos
- Apresentação para investidores
- Planejamento de longo prazo
- Produtos enterprise

**Comando:**
```bash
/criar-app-completo --mode=complete
```

**Perguntas adicionais:**
- Modelo de negócio
- Estratégia de monetização
- Tamanho de mercado
- Timeline desejado
- Budget aproximado
- Tamanho da equipe

---

### 3. Modo Silencioso (Silent)

**Características:**
- Zero perguntas
- Claude infere tudo
- Geração em ~2 minutos
- 1,500-2,500 palavras

**Quando usar:**
- Brainstorming rápido
- Exploração de ideias
- Protótipos conceituais

**Comando:**
```bash
/criar-app-completo --silent "Sua ideia aqui"
```

**Exemplos:**
```bash
# App de delivery
/criar-app-completo --silent "App de delivery de comida com tracking real-time"

# Clone de app
/criar-app-completo --silent "Clone do Duolingo para programação"

# SaaS B2B
/criar-app-completo --silent "CRM para pequenas empresas com IA"

# Social app
/criar-app-completo --silent "Rede social para músicos colaborarem"
```

Claude irá inferir:
- Público-alvo apropriado
- Features essenciais
- Stack tecnológica adequada
- Modelo de negócio comum
- Competidores conhecidos

## 🔧 Opções Avançadas

### Especificar Template Customizado

```bash
/criar-app-completo --template="/caminho/Meu Template.md"
```

### Especificar Vault do Obsidian

```bash
/criar-app-completo --vault="/Users/nome/Obsidian Vault"
```

### Combinar Opções

```bash
/criar-app-completo --mode=complete --vault="/caminho/vault"
```

## 📊 Comparação de Modos

| Aspecto | Rápido | Completo | Silencioso |
|---------|--------|----------|------------|
| **Perguntas** | 8 | 14 | 0 |
| **Tempo** | ~5 min | ~15 min | ~2 min |
| **Palavras PRD** | 2,500-3,500 | 4,000-6,000 | 1,500-2,500 |
| **Requisitos** | 15-20 RF | 25-35 RF | 10-15 RF |
| **Personas** | 1-2 | 2-3 | 1 |
| **Análise Competitiva** | Básica | Completa | Básica |
| **Business Model** | Simples | Canvas completo | Inferido |
| **Melhor para** | MVP | Enterprise | Brainstorming |

## 🎯 Exemplos Práticos

### Exemplo 1: SaaS B2B

```bash
/criar-app-completo

Nome: DevAnalytics
Problema: CTOs não têm visibilidade de produtividade
Público: Tech Leads, Engineering Managers
Features: Git analytics, Sprint metrics, Team insights
Competidor: LinearB, Code Climate
Plataforma: Web
Tech: React, Node.js
Especial: Integrações (GitHub, GitLab, Jira)
```

**Resultado:**
- PRD 3,200 palavras
- 20 RF, 14 RNF
- Stack: React, Next.js, Node.js, PostgreSQL, Redis
- Arquitetura: Microservices com event-driven
- Timeline: MVP em 3 meses

---

### Exemplo 2: Mobile App

```bash
/criar-app-completo --mode=complete

Nome: FitBuddy
Problema: Pessoas perdem motivação ao treinar sozinhas
Público: Atletas amadores 20-35 anos
Features: Treinos guiados, Gamificação, Social feed
Competidor: Strava, Nike Training Club
Plataforma: Mobile (iOS + Android)
Tech: React Native
Especial: Offline-first, GPS tracking
Modelo: Freemium
Monetização: Premium subscription ($9.99/mês)
Market Size: 50M atletas no Brasil
Timeline: MVP em 4 meses
```

**Resultado:**
- PRD 5,800 palavras
- 28 RF, 18 RNF
- 3 personas detalhadas
- Competitive analysis completo
- Business model canvas
- Go-to-market strategy
- Pricing tiers (Free, Premium, Coach)

---

### Exemplo 3: Modo Silencioso

```bash
/criar-app-completo --silent "Clone do Airbnb para espaços de coworking"
```

**Claude infere automaticamente:**
- Público: Freelancers, startups, remote workers
- Features: Busca, Reserva, Pagamento, Reviews
- Competidores: WeWork, Regus
- Modelo: Marketplace (comissão)
- Stack: React, Node.js, PostgreSQL, Stripe
- 15 RF, 10 RNF

**Resultado:**
- PRD 2,100 palavras
- App completo no Obsidian
- Pronto para começar MVP

## 📂 Estrutura do App Gerado

Após execução, você terá:

```markdown
---
tags:
  - App
status: 🔴 Não iniciado
concluido: false
andamento: Aguardando definição de requisitos
prioridade: alta
data_criacao: 2026-02-06
data_conclusao: ""
complexidade: média
stack: "React, Node.js, PostgreSQL"
---

# PRD DO APP
```````
[PRD COMPLETO - 20 SEÇÕES - 3,500 PALAVRAS]
```````

----

👇 Desta linha para baixo, a IA preenche de acordo com o PRD.

# TaskMaster Pro

## 💡 Informações sobre o App
[Metadados inline]

## 📋 Descrição
[2 parágrafos gerados]

## 🎯 Objetivos
- [ ] Objetivo 1
- [ ] Objetivo 2
...

## 🛠️ Stack Tecnológica
Frontend: React 18, Redux Toolkit
Backend: Node.js, Express
...

## ✅ Requisitos Funcionais
- [ ] RF01: ...
- [ ] RF02: ...
[18 requisitos]

## 🔧 Requisitos Não-Funcionais
- [ ] RNF01: Performance - < 2s load
...
[12 requisitos]

## 📐 Arquitetura
[Diagrama e descrição]

## 🚀 Roadmap
### Fase 1: MVP
- [ ] Task 1
...
[25 tasks totais]

## 📝 Notas e Considerações
[Decisões técnicas, trade-offs, riscos]

## 🔗 Links Relacionados
```

## 🔄 Integração com Outros Skills

### Atualizar App Existente

```bash
# Gerar novo PRD
/gerar-prd

# Usar PRD em app existente
/preencher-app /caminho/Meu App.md
```

### Workflow com Agentes

```bash
# PO cria e valida
@po /criar-app-completo

# Architect revisa
@architect revisar-arquitetura "TaskMaster Pro"

# Dev implementa
@dev implementar-mvp "TaskMaster Pro"

# DevOps faz deploy
@devops deploy "TaskMaster Pro"
```

## ⚙️ Configuração

### Configurar Vault do Obsidian

Crie `.aios/config/obsidian.json`:

```json
{
  "vaultPath": "/Users/luizfosc/Library/Mobile Documents/iCloud~md~obsidian/Documents/Mente do Fosc",
  "appsFolder": "APPS para Criar",
  "templatePath": "+Templates/Template para novo App.md"
}
```

### Customizar Template

Edite o template padrão ou crie novo:
```
/Users/luizfosc/Library/.../+Templates/Meu Template.md
```

Use com:
```bash
/criar-app-completo --template="Meu Template.md"
```

## 🎓 Best Practices

1. **Seja específico** nas respostas - Quanto mais detalhes, melhor o resultado
2. **Pesquise competidores** antes - Ajuda a definir diferencial
3. **Defina público-alvo** claramente - Personas mais precisas
4. **Pense no MVP** - O que é realmente essencial?
5. **Revise o PRD** - Sempre dê uma passada após geração
6. **Ajuste conforme necessário** - PRD é documento vivo
7. **Mantenha atualizado** - Revise ao longo do desenvolvimento

## 🛠️ Troubleshooting

### ❌ "Template não encontrado"

**Solução:**
```bash
# Especifique caminho completo
/criar-app-completo --template="/caminho/completo/template.md"

# Ou configure em .aios/config/obsidian.json
```

### ❌ "Vault não encontrado"

**Solução:**
```bash
# Especifique vault
/criar-app-completo --vault="/Users/nome/Obsidian"

# Ou configure em .aios/config/obsidian.json
```

### ❌ PRD muito genérico

**Solução:**
```bash
# Use modo completo para PRD mais rico
/criar-app-completo --mode=complete

# Ou forneça mais detalhes nas respostas
```

### ❌ Arquivo criado mas não preenchido

**Solução:**
- Verifique se o PRD foi gerado corretamente
- Execute `/preencher-app` manualmente no arquivo
- Verifique logs em `.aios/tmp/`

## 📈 Métricas

**Tempo médio por modo:**
- Rápido: 5-7 min (coleta + geração + criação)
- Completo: 15-20 min
- Silencioso: 2-3 min

**PRD gerado:**
- Rápido: 2,500-3,500 palavras
- Completo: 4,000-6,000 palavras
- Silencioso: 1,500-2,500 palavras

**App final:**
- Requisitos: 20-40 total
- Roadmap: 15-30 tasks
- Seções: 100% preenchidas

## 🚀 Próximos Passos

Após criar o app:

1. ✅ **Abrir no Obsidian**
2. ✅ **Revisar PRD e seções**
3. ✅ **Ajustar metadados** (prioridade, complexidade)
4. ✅ **Validar requisitos** com stakeholders
5. ✅ **Atualizar status** → "🟡 Em andamento"
6. ✅ **Começar desenvolvimento** - MVP first!
7. ✅ **Atualizar progresso** conforme avança
8. ✅ **Marcar checklists** concluídos
9. ✅ **Celebrar** quando completar! 🎉

## 📚 Documentação Relacionada

- **PRD Generator:** `.aios/skills/prd-generator/README.md`
- **App Filler:** `.aios/skills/obsidian-app-filler/README.md`
- **Template PRD:** `.aios/skills/prd-generator/templates/app-prd-template.md`

---

**Versão:** 1.0.0
**Dúvidas?** Consulte README.md ou execute `/help`
