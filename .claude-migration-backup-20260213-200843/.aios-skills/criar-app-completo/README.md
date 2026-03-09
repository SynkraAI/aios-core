---
name: criar-app-completo
version: 1.0.0
trigger: "/criar-app-completo"
description: "Workflow end-to-end: Ideia → PRD → Arquivo Obsidian → App Preenchido"
category: productivity
author: "AIOS Core"
tags:
  - obsidian
  - prd
  - automation
  - workflow
  - end-to-end
---

# 🚀 Criar App Completo

**Workflow end-to-end integrado** que automatiza completamente a criação de um app no Obsidian.

## 🎯 O que faz

```
Sua Ideia
    ↓
Gera PRD profissional
    ↓
Cria arquivo no Obsidian (template)
    ↓
Preenche TODAS as seções automaticamente
    ↓
App completo pronto para desenvolvimento!
```

## ⚡ Uso Ultra Rápido

```bash
/criar-app-completo
```

**Isso é tudo!** O skill vai:
1. ✅ Fazer perguntas sobre seu app
2. ✅ Gerar PRD profissional completo
3. ✅ Criar arquivo no Obsidian
4. ✅ Preencher todas as seções
5. ✅ Configurar metadados (prioridade, complexidade)
6. ✅ Gerar roadmap em 3 fases
7. ✅ Criar checklists de requisitos
8. ✅ Propor arquitetura

**Resultado:** App completamente estruturado em minutos!

## 🔧 Como Funciona

### Passo 1: Coleta de Informações
```
📝 Criar App Completo

1️⃣  Nome do app: TaskMaster Pro
2️⃣  Que problema ele resolve? Desenvolvedores perdem tempo com task management
3️⃣  Quem é o público-alvo? Desenvolvedores full-stack
4️⃣  3 principais funcionalidades: Integração Git, Pomodoro, Code snippets
5️⃣  Existe competidor? Todoist, Linear
6️⃣  Plataforma: Web + Mobile
7️⃣  Tecnologias: React, Node.js
8️⃣  Requisitos especiais: Sincronização em tempo real
```

### Passo 2: Geração de PRD
```
🎯 Gerando PRD completo...
✓ Executive Summary gerado
✓ Problem Statement expandido
✓ Target Audience definido (3 personas)
✓ Features priorizados (MoSCoW)
✓ 18 Functional Requirements identificados
✓ 12 Non-Functional Requirements definidos
✓ Technical Stack sugerido
✓ Architecture proposta
✓ Risks & Mitigations listados
✓ Success Metrics (5 KPIs)
✓ Timeline com milestones

📄 PRD gerado: 3,500 palavras
```

### Passo 3: Criação do Arquivo
```
📂 Criando arquivo no Obsidian...
✓ Template carregado
✓ PRD inserido na seção correta
✓ Arquivo criado: /APPS para Criar/TaskMaster Pro.md
```

### Passo 4: Preenchimento Automático
```
🤖 Preenchendo seções automaticamente...
✓ Metadados YAML atualizados
  - Prioridade: alta
  - Complexidade: média
  - Stack: React, Node.js, Socket.io, MongoDB
✓ Descrição gerada (2 parágrafos)
✓ Objetivos criados (5 items)
✓ Stack Tecnológica detalhada
✓ Requisitos Funcionais (18 items)
✓ Requisitos Não-Funcionais (12 items)
✓ Arquitetura proposta
✓ Roadmap gerado (3 fases, 25 tasks)
✓ Notas técnicas adicionadas
```

### Passo 5: Resultado Final
```
✅ App criado com sucesso!

📱 TaskMaster Pro
📍 Local: /APPS para Criar/TaskMaster Pro.md

📊 Resumo:
- Prioridade: alta
- Complexidade: média
- Stack: React, Node.js, Socket.io, MongoDB
- Requisitos: 30 total (18 RF + 12 RNF)
- Roadmap: 3 fases, 25 tasks
- PRD: 3,500 palavras

✨ O app está completamente estruturado e pronto!

Próximos passos:
1. Abrir arquivo no Obsidian
2. Revisar PRD e seções geradas
3. Ajustar se necessário
4. Atualizar status para "🟡 Em andamento"
5. Começar desenvolvimento!

🎯 Visualizar no Índice: /APPS para Criar/✅ ÍNDICE DE SISTEMAS.md
```

## 🎨 Features

### ✅ PRD Profissional
- 20 seções completas
- Análise de mercado
- Personas detalhadas
- KPIs e métricas
- Riscos e mitigações

### ✅ Estrutura Completa
- YAML frontmatter configurado
- Todas as seções preenchidas
- Checklists acionáveis
- Roadmap detalhado
- Arquitetura proposta

### ✅ Inteligente
- Analisa PRD para determinar prioridade
- Calcula complexidade técnica
- Sugere stack adequada
- Identifica riscos
- Propõe arquitetura

### ✅ Automatizado
- Zero trabalho manual
- Workflow completo em minutos
- Backup automático
- Validações em cada etapa

## ⚙️ Configuração

### Caminho do Obsidian

Configure o caminho padrão em `.aios/config/obsidian.json`:

```json
{
  "vaultPath": "/Users/luizfosc/Library/Mobile Documents/iCloud~md~obsidian/Documents/Mente do Fosc",
  "appsFolder": "APPS para Criar",
  "templatePath": "+Templates/Template para novo App.md"
}
```

### Template Customizado

Se quiser usar template diferente:
```bash
/criar-app-completo --template="Meu Template.md"
```

## 🎯 Modos de Operação

### Modo Rápido (default)
- Perguntas essenciais (8 perguntas)
- PRD focado em MVP
- Geração rápida (~5 min)

```bash
/criar-app-completo
```

### Modo Completo
- Perguntas aprofundadas (14 perguntas)
- PRD extenso e detalhado
- Análise de mercado incluída
- Geração completa (~15 min)

```bash
/criar-app-completo --mode=complete
```

### Modo Silencioso
- Apenas ideia inicial
- Claude infere todo o resto
- Ultra rápido (~2 min)

```bash
/criar-app-completo --silent "App de delivery de comida com tracking em tempo real"
```

## 📊 Exemplos

### Exemplo 1: Modo Rápido

**Input:**
```
Nome: FitTracker
Problema: Pessoas perdem motivação ao treinar sozinhas
Público: Atletas amadores 20-35 anos
Features: Treinos guiados, Gamificação, Social feed
```

**Output:**
- PRD de 2,500 palavras
- 15 RF, 10 RNF
- Roadmap com 20 tasks
- Arquivo completo no Obsidian

### Exemplo 2: Modo Completo

**Input:**
```
Nome: DevAnalytics
Problema: CTOs não têm visibilidade de produtividade
Público: Tech Leads, Engineering Managers
Features: Git analytics, Sprint metrics, Team insights
Modelo: SaaS B2B
Monetização: Freemium + Enterprise
```

**Output:**
- PRD de 5,000 palavras
- Análise competitiva incluída
- Go-to-market strategy
- 25 RF, 15 RNF
- Business model canvas
- Arquivo completo no Obsidian

### Exemplo 3: Modo Silencioso

**Input:**
```bash
/criar-app-completo --silent "Clone do Instagram para pets"
```

**Output:**
Claude infere:
- Público: Donos de pets
- Features: Feed, Stories, Marketplace
- Monetização: Ads + Pet shops
- Gera PRD completo automaticamente

## 🔗 Integração com AIOS

### Com Agentes

```bash
# PO valida PRD antes de criar
@po /criar-app-completo

# Architect revisa arquitetura depois
@architect revisar-arquitetura "TaskMaster Pro"

# Dev implementa
@dev implementar-mvp "TaskMaster Pro"
```

### Com Outros Skills

```bash
# Gera PRD separadamente
/gerar-prd

# Usa PRD existente
/preencher-app --prd="meu-prd.md"
```

## 🛠️ Troubleshooting

### ❌ Caminho do Obsidian inválido
```bash
# Configure manualmente
echo '{"vaultPath": "/seu/caminho"}' > .aios/config/obsidian.json
```

### ❌ Template não encontrado
```bash
# Especifique template
/criar-app-completo --template="/caminho/completo/template.md"
```

### ❌ PRD muito genérico
Use modo completo para PRD mais detalhado:
```bash
/criar-app-completo --mode=complete
```

## 📈 Estatísticas

Tempo médio por modo:
- **Rápido:** 5-7 minutos
- **Completo:** 15-20 minutos
- **Silencioso:** 2-3 minutos

PRD gerado:
- **Rápido:** 2,000-3,000 palavras
- **Completo:** 4,000-6,000 palavras
- **Silencioso:** 1,500-2,500 palavras

## 🎓 Best Practices

1. **Seja específico** nas respostas
2. **Pense no problema** real do usuário
3. **Pesquise competidores** antes
4. **Defina público-alvo** claramente
5. **Revise o PRD** gerado
6. **Ajuste conforme necessário**
7. **Mantenha atualizado** ao longo do desenvolvimento

## 🚀 Próximas Features

- [ ] Integração com Linear/Jira (criar tasks automaticamente)
- [ ] Geração de mockups via Figma API
- [ ] Análise competitiva automatizada
- [ ] Estimativa de tempo/custo via ML
- [ ] Sugestão de monetização
- [ ] Market sizing automático

---

**Versão:** 1.0.0
**Última atualização:** 2026-02-06
**Autor:** AIOS Core Team

**Skills Relacionados:**
- `prd-generator` - Geração de PRDs
- `obsidian-app-filler` - Preenchimento de apps
- `@po` - Product Owner agent
