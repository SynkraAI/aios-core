# 🚀 Quick Start - Obsidian App Filler

Guia rápido para usar o skill de preenchimento automático de apps.

## Instalação

O skill já está instalado em `.aios/skills/obsidian-app-filler/`

## Uso Básico

### 1️⃣ Criar Nova Nota de App

No Obsidian:
1. Crie nova nota na pasta "APPS para Criar"
2. Use o template `/+Templates/Template para novo App.md`
3. Cole seu PRD completo na seção designada:

```markdown
# PRD DO APP
(Colocar aqui o PRD completo do app, que a IA irá preencher tudo abaixo automaticamente)
```````

[COLE SEU PRD AQUI - Pode ser:
- Descrição detalhada do app
- Documento de requisitos
- Ideia completa do produto
- Especificação funcional
- Qualquer texto descritivo]

```````
```

### 2️⃣ Executar o Skill

No terminal ou Claude Code:

```bash
# Opção 1: Via comando direto
/preencher-app

# Opção 2: Via AIOS CLI
npx aios-core skill obsidian-app-filler

# Opção 3: Via Node
node .aios/skills/obsidian-app-filler/skill.js
```

### 3️⃣ Fornecer Caminho do Arquivo

```
📝 Obsidian App Filler v1.0.0

📂 Caminho do arquivo .md: /Users/luizfosc/Library/Mobile Documents/iCloud~md~obsidian/Documents/Mente do Fosc/APPS para Criar/Meu App.md
```

**Dica:** Você pode arrastar o arquivo para o terminal para copiar o caminho!

### 4️⃣ Revisar e Confirmar

O skill mostrará:
- Preview do PRD extraído
- Contagem de palavras
- Solicitação de confirmação

```
📄 Preview do PRD:
App de gestão de tarefas para equipes remotas...

Deseja prosseguir com o preenchimento? (s/n): s
```

### 5️⃣ Aguardar Processamento

O Claude irá:
1. ✅ Analisar o PRD
2. ✅ Determinar prioridade e complexidade
3. ✅ Gerar descrição
4. ✅ Criar objetivos (checklist)
5. ✅ Definir stack tecnológica
6. ✅ Listar requisitos funcionais
7. ✅ Listar requisitos não-funcionais
8. ✅ Propor arquitetura
9. ✅ Criar roadmap em 3 fases
10. ✅ Adicionar notas técnicas

### 6️⃣ Revisar Resultado

Abra o arquivo no Obsidian e revise:
- Metadados YAML (prioridade, complexidade)
- Todas as seções preenchidas
- Checklists criados
- Roadmap estruturado

### 7️⃣ Ajustar se Necessário

Edite manualmente qualquer seção que precise de refinamento.

### 8️⃣ Verificar no Índice

Abra `✅ ÍNDICE DE SISTEMAS.md` para ver seu app listado automaticamente!

## Exemplo Completo

### Antes (só PRD):

```markdown
---
tags:
  - App
status: 🔴 Não iniciado
concluido: false
andamento: Aguardando definição de requisitos
prioridade:
data_criacao: 2026-02-06
data_conclusao: ""
complexidade:
---

# PRD DO APP
```````
App de delivery de comida que conecta restaurantes locais a clientes.
Features: cadastro, menu digital, carrinho, pagamento integrado,
tracking em tempo real do pedido. Stack: React Native, Node.js, MongoDB.
```````

----
👇 Desta linha para baixo, a IA preenche de acordo com o PRD.

[vazio]
```

### Depois (totalmente preenchido):

```markdown
---
tags:
  - App
status: 🔴 Não iniciado
concluido: false
andamento: Aguardando definição de requisitos
prioridade: média
data_criacao: 2026-02-06
data_conclusao: ""
complexidade: média
---

# PRD DO APP
```````
App de delivery de comida que conecta restaurantes locais a clientes.
Features: cadastro, menu digital, carrinho, pagamento integrado,
tracking em tempo real do pedido. Stack: React Native, Node.js, MongoDB.
```````

----
👇 Desta linha para baixo, a IA preenche de acordo com o PRD.

# Food Delivery App

## 💡 Informações sobre o App

**Status atual:** 🔴 Não iniciado
**Andamento:** Aguardando definição de requisitos
**Prioridade:** média
**Complexidade:** média

---

## 📋 Descrição

Plataforma mobile de delivery que conecta restaurantes locais diretamente
aos clientes finais. Permite navegação de menus, montagem de pedidos,
pagamento integrado e acompanhamento em tempo real da entrega.

## 🎯 Objetivos

- [ ] Conectar 100+ restaurantes locais na plataforma
- [ ] Oferecer experiência de pedido fluida e intuitiva
- [ ] Garantir tracking em tempo real com precisão
- [ ] Integrar pagamentos seguros (PIX, cartão)
- [ ] Alcançar 10k usuários ativos no primeiro ano

## 🛠️ Stack Tecnológica

**Frontend:** React Native, Redux, React Navigation
**Backend:** Node.js, Express, Socket.io para real-time
**Database:** MongoDB, Redis para cache
**Infraestrutura:** AWS (EC2, S3), CI/CD com GitHub Actions

[... continua com todas as seções preenchidas ...]
```

## Dicas e Truques

### 📝 PRD de Qualidade

Quanto melhor o PRD, melhor o resultado:
- ✅ Seja específico sobre funcionalidades
- ✅ Mencione tecnologias desejadas
- ✅ Descreva público-alvo
- ✅ Explique problemas que resolve
- ✅ Liste integrações necessárias

### 🔄 Iteração

Você pode:
1. Executar o skill novamente se não gostar do resultado
2. Ajustar manualmente depois
3. Mesclar conteúdo gerado com suas próprias ideias

### 💾 Backups

O skill cria backup automático:
- Arquivo: `Meu App.md.backup-1234567890`
- Localização: mesma pasta do original
- Restaurar se necessário

### 🎯 Atalhos

Adicione alias no shell:
```bash
# ~/.zshrc ou ~/.bashrc
alias preencher-app='node /caminho/para/.aios/skills/obsidian-app-filler/skill.js'
```

Uso:
```bash
preencher-app
```

## Troubleshooting

### ❌ "PRD não encontrado"
- Verifique se usou o template correto
- PRD deve estar entre ``````` (7 backticks)
- Seção deve começar com "# PRD DO APP"

### ❌ "Estrutura inválida"
- Use o template atualizado
- Não remova marcadores (👇 Desta linha...)
- Mantenha YAML frontmatter

### ❌ "Arquivo não encontrado"
- Use caminho absoluto completo
- Expanda ~ para /Users/seu-usuario
- Cole caminho correto do Obsidian

### ❌ Resultado insatisfatório
- Melhore o PRD com mais detalhes
- Execute novamente com PRD atualizado
- Ajuste manualmente depois

## Próximos Passos

Após preencher o app:
1. ✅ Revisar conteúdo gerado
2. ✅ Ajustar metadados (prioridade, complexidade)
3. ✅ Atualizar status para "🟡 Em andamento"
4. ✅ Começar implementação
5. ✅ Atualizar progresso no arquivo
6. ✅ Marcar checklists conforme avança

---

**Versão:** 1.0.0
**Dúvidas?** Veja `README.md` para documentação completa.
