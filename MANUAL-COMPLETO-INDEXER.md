# 📚 Universal AIOS Indexer - Manual Completo

**Guia definitivo para entender e usar o sistema de auto-indexação do AIOS**

---

## 📖 Índice

1. [O Que É Este Sistema](#o-que-é-este-sistema)
2. [O Problema Que Resolve](#o-problema-que-resolve)
3. [Como Funciona](#como-funciona)
4. [Conceitos Fundamentais](#conceitos-fundamentais)
5. [Guia de Uso Completo](#guia-de-uso-completo)
6. [Exemplos Práticos](#exemplos-práticos)
7. [Referência de Comandos](#referência-de-comandos)
8. [Arquitetura Técnica](#arquitetura-técnica)
9. [Troubleshooting](#troubleshooting)
10. [FAQ](#faq)

---

## 🎯 O Que É Este Sistema

O **Universal AIOS Indexer** é um sistema de automação que **elimina completamente o trabalho manual** de tornar seus squads, skills e tools disponíveis como slash commands no Claude Code.

### Em Uma Frase

> "Você cria um squad, skill ou tool, faz commit, e **automaticamente** fica disponível no Claude Code. Zero esforço, zero erros, zero esquecimento."

### O Que Ele Faz Automaticamente

✅ **Detecta** quando você cria/modifica squads, skills ou tools
✅ **Cria** todos os symlinks necessários automaticamente
✅ **Atualiza** documentação (MEMORY.md, tools/README.md)
✅ **Valida** estrutura e detecta problemas
✅ **Reporta** status completo de todos assets

### O Que Você NÃO Precisa Mais Fazer

❌ Criar diretórios manualmente
❌ Criar symlinks um por um
❌ Editar MEMORY.md manualmente
❌ Atualizar tools/README.md
❌ Lembrar de indexar novos assets
❌ Validar symlinks quebrados

---

## 💥 O Problema Que Resolve

### Antes: Processo Manual (30-45 minutos)

Quando você criava um novo squad manualmente, tinha que:

```bash
# 1. Criar squad (fácil)
mkdir squads/meu-squad
vim squads/meu-squad/README.md
vim squads/meu-squad/agents/chief.md

# 2. Indexar manualmente (TEDIOSO - 20+ comandos)
mkdir .claude/commands/meu-squad
mkdir .claude/commands/meu-squad/agents
mkdir .claude/commands/meu-squad/tasks
mkdir .claude/commands/meu-squad/workflows
cd .claude/commands/meu-squad
ln -s ../../../squads/meu-squad/README.md .
cd agents
ln -s ../../../../squads/meu-squad/agents/chief.md .
ln -s ../../../../squads/meu-squad/agents/specialist.md .
# ... repetir para CADA arquivo em CADA diretório ...

# 3. Atualizar MEMORY.md manualmente
vim ~/.claude/projects/.../memory/MEMORY.md
# ... editar tabela manualmente, contar agents/tasks/workflows ...

# 4. Se for tool, atualizar tools/README.md
vim tools/README.md
# ... adicionar entry manualmente ...
```

### Problemas do Processo Manual

1. **Muito tempo:** 30-45 minutos por squad completo
2. **Propenso a erros:** Symlinks com path errado, arquivos esquecidos
3. **Tedioso:** Repetir os mesmos comandos para cada arquivo
4. **Fácil esquecer:** Criar squad mas esquecer de indexar
5. **Inconsistente:** MEMORY.md e slash commands ficam desatualizados
6. **Difícil manutenção:** Adicionar um agent requer 5+ comandos

### Depois: Processo Automatizado (5 segundos)

Agora você apenas:

```bash
# 1. Criar squad
mkdir squads/meu-squad
vim squads/meu-squad/README.md
vim squads/meu-squad/agents/chief.md

# 2. Commit
git add squads/meu-squad/
git commit -m "feat: add meu-squad"

# 🎉 PRONTO!
# Hook automaticamente:
# ✅ Criou .claude/commands/meu-squad/
# ✅ Criou todos os symlinks
# ✅ Atualizou MEMORY.md
# ✅ Auto-staged arquivos modificados
# ✅ Procede com commit

# 3. Usar imediatamente
# Claude Code: /meu-squad:agents:chief
```

### Comparação Direta

| Tarefa | Antes | Depois |
|--------|-------|--------|
| **Tempo total** | 30-45 min | 5 seg |
| **Comandos manuais** | 50+ | 0 |
| **Possibilidade de erro** | Alta | Zero |
| **Esquecer de indexar** | Frequente | Impossível |
| **Atualizar docs** | Manual | Automático |

---

## 🔧 Como Funciona

### Visão Geral do Fluxo

```
┌─────────────────────────────────────────────────────────────┐
│  VOCÊ: Cria squad/skill/tool                                 │
│  ↓                                                           │
│  Faz commit normalmente                                      │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  PRE-COMMIT HOOK: Detecta mudanças automaticamente          │
│  ↓                                                           │
│  • Detecta squads/ modificado?                               │
│  • Detecta .aios/skills/ modificado?                         │
│  • Detecta tools/ modificado?                                │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  UNIVERSAL INDEXER: Executa automaticamente                 │
│  ↓                                                           │
│  1. Escaneia assets modificados                              │
│  2. Cria diretórios em .claude/commands/                     │
│  3. Cria symlinks para todos os arquivos                     │
│  4. Atualiza MEMORY.md (tabelas de squads/skills/tools)      │
│  5. Atualiza tools/README.md (se tool modificada)            │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  AUTO-STAGING: Adiciona arquivos modificados ao commit      │
│  ↓                                                           │
│  • git add .claude/commands/                                 │
│  • git add tools/README.md                                   │
│  • git add ~/.claude/projects/.../MEMORY.md                  │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  COMMIT: Procede normalmente com TUDO atualizado            │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  RESULTADO: Asset disponível IMEDIATAMENTE no Claude Code   │
│  • /meu-squad:agents:chief                                   │
│  • /AIOS:skills:minha-skill                                  │
│  • tools/README.md atualizado                                │
└─────────────────────────────────────────────────────────────┘
```

### Detalhamento de Cada Etapa

#### 1️⃣ Detecção Automática (Pre-Commit Hook)

O hook `.husky/pre-commit-squad-indexer` executa ANTES de cada commit e verifica:

```bash
# Verifica se algum desses diretórios foi modificado:
squads/              # Squads AIOS
.aios/skills/        # Skills runtime
tools/               # Ferramentas e utilitários
```

Se detectar mudanças em qualquer um desses, **automaticamente** executa o indexer.

#### 2️⃣ Escaneamento de Assets

O `universal-indexer.js` escaneia e valida:

**Para Squads:**
- ✅ Verifica se `README.md` existe (obrigatório)
- ✅ Conta agents, tasks, workflows, checklists, templates
- ✅ Lê `config.yaml` se disponível (metadata)

**Para Skills:**
- ✅ Verifica se `README.md` existe (obrigatório)
- ✅ Detecta se é single-file ou multi-file
- ✅ Lista componentes (examples, references, resources)

**Para Tools:**
- ✅ Verifica se `README.md` existe (recomendado)
- ✅ Detecta linguagem (Python, Node.js, Bash)
- ✅ Extrai descrição do README

#### 3️⃣ Criação de Symlinks

Para cada asset válido, cria estrutura completa:

**Squad:**
```
.claude/commands/meu-squad/
├── README.md → symlink to squads/meu-squad/README.md
├── agents/
│   ├── chief.md → symlink
│   └── specialist.md → symlink
├── tasks/
│   ├── task-1.md → symlink
│   └── task-2.md → symlink
└── workflows/
    └── workflow-1.md → symlink
```

**Skill:**
```
.claude/commands/AIOS/skills/minha-skill/
├── README.md → symlink to .aios/skills/minha-skill/README.md
├── examples/
│   └── example-1.md → symlink
└── references/
    └── reference-1.md → symlink
```

**Tool:**
```
tools/README.md (atualizado)

### minha-tool
- **Language:** Python
- **Description:** Auto-extraída do README
- **Path:** `tools/minha-tool/`
- **Docs:** [README](minha-tool/README.md)
```

#### 4️⃣ Atualização de Documentação

**MEMORY.md** recebe 3 tabelas auto-atualizadas:

```markdown
## Squads Indexados (2026-02-13)
| Squad | Agents | Tasks | Workflows | Local | Ativacao |
|-------|--------|-------|-----------|-------|----------|
| **meu-squad** | 2 | 5 | 1 | `.claude/commands/meu-squad/` | `/meu-squad:*` |

## Skills Indexados (2026-02-13)
| Skill | Type | Local | Ativacao |
|-------|------|-------|----------|
| **minha-skill** | Multi-file | `.aios/skills/minha-skill/` | `/AIOS:skills:minha-skill` |

## Tools Indexados (2026-02-13)
| Tool | Language | Local |
|------|----------|-------|
| **minha-tool** | Python | `tools/minha-tool/` |
```

#### 5️⃣ Auto-Staging

Após criar symlinks e atualizar docs, **automaticamente** adiciona ao commit:

```bash
git add .claude/commands/           # Novos symlinks
git add tools/README.md             # Registry atualizado
git add ~/.claude/.../MEMORY.md     # Tabelas atualizadas
```

#### 6️⃣ Disponibilidade Imediata

Assim que o commit termina, o asset está **imediatamente disponível**:

- No Claude Code, digite `/` e veja o novo squad/skill
- Use `/meu-squad:agents:chief` imediatamente
- Veja a tool em `tools/README.md`

---

## 📚 Conceitos Fundamentais

### O Que É um "Asset"?

No contexto do AIOS, um **asset** é qualquer recurso reutilizável:

1. **Squad** - Equipe especializada de agentes
2. **Skill** - Capacidade/conhecimento específico
3. **Tool** - Ferramenta ou utilitário

### O Que É "Indexação"?

**Indexação** é o processo de tornar um asset **disponível como slash command** no Claude Code.

#### Antes da Indexação
```
# Asset existe no filesystem mas NÃO aparece no Claude Code
squads/meu-squad/README.md  ← Existe
# Digitar /meu-squad no Claude Code → ❌ Não encontrado
```

#### Depois da Indexação
```
# Asset linkado em .claude/commands/ → APARECE no Claude Code
.claude/commands/meu-squad/README.md → squads/meu-squad/README.md
# Digitar /meu-squad no Claude Code → ✅ Encontrado!
```

### O Que São "Symlinks"?

**Symlink** (Symbolic Link) é um **atalho** do sistema operacional que aponta para outro arquivo.

#### Por Que Usar Symlinks?

1. **Evita duplicação** - Não precisa copiar arquivos
2. **Sincronização automática** - Mudar o original atualiza o link
3. **Economia de espaço** - Link ocupa ~10 bytes vs arquivo completo
4. **Portabilidade** - Funciona em qualquer sistema Unix/Mac/Windows

#### Exemplo Prático

```bash
# Arquivo original
squads/meu-squad/agents/chief.md  (5 KB)

# Symlink (atalho)
.claude/commands/meu-squad/agents/chief.md → ../../../squads/meu-squad/agents/chief.md  (10 bytes)

# Benefício:
# - Ocupou 10 bytes ao invés de duplicar 5 KB
# - Se editar squads/meu-squad/agents/chief.md, o link atualiza automaticamente
# - Claude Code vê o arquivo em .claude/commands/ mas lê de squads/
```

### Tipos de Assets

#### 1. Squad (Equipe Especializada)

**O Que É:**
- Conjunto de agentes que trabalham juntos
- Tem tasks (tarefas), workflows (fluxos), checklists, templates

**Estrutura Mínima:**
```
squads/meu-squad/
└── README.md  ← OBRIGATÓRIO
```

**Estrutura Completa:**
```
squads/meu-squad/
├── README.md           ← Documentação principal
├── config.yaml         ← Metadata (nome, versão, agentes)
├── agents/             ← Agentes do squad
│   ├── chief.md
│   └── specialist.md
├── tasks/              ← Tarefas executáveis
│   ├── task-1.md
│   └── task-2.md
├── workflows/          ← Fluxos multi-step
│   └── workflow-1.md
├── checklists/         ← Listas de validação
│   └── checklist-1.md
└── templates/          ← Templates reutilizáveis
    └── template-1.md
```

**Ativação no Claude Code:**
```
/meu-squad:agents:chief
/meu-squad:tasks:task-1
/meu-squad:workflows:workflow-1
```

#### 2. Skill (Capacidade Específica)

**O Que É:**
- Conhecimento ou capacidade especializada
- Pode ser usada por qualquer agente
- Carregada em runtime

**Estrutura Mínima:**
```
.aios/skills/minha-skill/
└── README.md  ← OBRIGATÓRIO
```

**Estrutura Completa:**
```
.aios/skills/minha-skill/
├── README.md           ← Documentação principal
├── examples/           ← Exemplos de uso
│   └── example-1.md
├── references/         ← Referências e links
│   └── reference-1.md
└── resources/          ← Recursos adicionais
    └── resource-1.md
```

**Ativação no Claude Code:**
```
/AIOS:skills:minha-skill
```

#### 3. Tool (Ferramenta/Utilitário)

**O Que É:**
- Script ou ferramenta executável
- Automatiza tarefas específicas
- Pode ser Python, Node.js, Bash, etc.

**Estrutura Mínima:**
```
tools/minha-tool/
└── script.py  ← Script executável
```

**Estrutura Completa:**
```
tools/minha-tool/
├── README.md           ← Documentação (recomendado)
├── script.py           ← Script principal
├── requirements.txt    ← Dependências Python
└── package.json        ← Dependências Node.js (se aplicável)
```

**Registro:**
Aparece automaticamente em `tools/README.md`:
```markdown
### minha-tool
- **Language:** Python
- **Description:** Descrição da ferramenta
- **Path:** `tools/minha-tool/`
```

### Estrutura de Diretórios do AIOS

```
aios-core/
├── squads/                      ← Squads originais (SOURCE)
│   ├── meu-squad/
│   └── outro-squad/
│
├── .aios/skills/                ← Skills runtime (SOURCE)
│   ├── minha-skill/
│   └── outra-skill/
│
├── tools/                       ← Tools e utilitários (SOURCE)
│   ├── minha-tool/
│   ├── outra-tool/
│   └── README.md               ← Registry auto-gerado
│
├── .claude/commands/            ← Slash commands (SYMLINKS)
│   ├── meu-squad/              ← Symlinks → squads/meu-squad/
│   ├── outro-squad/
│   └── AIOS/skills/
│       ├── minha-skill/        ← Symlinks → .aios/skills/minha-skill/
│       └── outra-skill/
│
└── ~/.claude/projects/.../memory/
    └── MEMORY.md               ← Tabelas auto-atualizadas
```

**Importante:**
- **SOURCE** = Onde você cria e edita
- **SYMLINKS** = Onde o Claude Code lê (links automáticos)
- **REGISTRY** = Documentação auto-gerada

---

## 🎓 Guia de Uso Completo

### Comandos Disponíveis

#### Universal Indexer (Recomendado)

```bash
# Escanear todos os assets (squads, skills, tools)
npm run index:scan

# Indexar TUDO automaticamente
npm run index:all

# Validar todos os índices
npm run index:validate

# Relatório completo
npm run index:report
```

#### Squad Indexer (Específico)

```bash
# Escanear apenas squads
npm run squad:scan

# Indexar apenas squads
npm run squad:index

# Validar apenas squads
npm run squad:validate

# Relatório de squads
npm run squad:report
```

### Workflow 1: Criar Novo Squad

#### Passo 1: Criar Estrutura

```bash
# Navegar para diretório de squads
cd ~/aios-core

# Criar squad
mkdir -p squads/vendas-squad/{agents,tasks,workflows,checklists,templates}

# Criar README.md (OBRIGATÓRIO)
cat > squads/vendas-squad/README.md <<'EOF'
# Vendas Squad

Squad especializado em estratégias de vendas e conversão.

## Agents
- **sales-chief**: Orquestrador de estratégias de vendas
- **conversion-specialist**: Especialista em otimização de conversão
- **pricing-strategist**: Especialista em pricing e monetização

## Workflows
- **wf-sales-audit**: Auditoria completa do funil de vendas
- **wf-pricing-optimization**: Otimização de pricing e ofertas
EOF

# Criar config.yaml (RECOMENDADO)
cat > squads/vendas-squad/config.yaml <<'EOF'
name: "vendas-squad"
version: "1.0.0"
title: "Vendas Squad"
description: "Squad especializado em vendas e conversão"
entry_agent: "sales-chief"
tags:
  - vendas
  - conversao
  - pricing
EOF
```

#### Passo 2: Criar Agents

```bash
# Agent principal (Chief)
cat > squads/vendas-squad/agents/sales-chief.md <<'EOF'
# Sales Chief

Orquestrador de estratégias de vendas e conversão.

## Role
Coordena análise de funil, otimização de conversão e estratégias de pricing.

## Commands
- `*audit` - Auditar funil de vendas completo
- `*optimize` - Otimizar taxas de conversão
- `*pricing` - Analisar e otimizar pricing
EOF

# Specialist 1
cat > squads/vendas-squad/agents/conversion-specialist.md <<'EOF'
# Conversion Specialist

Especialista em otimização de conversão e UX.

## Expertise
- A/B testing
- Landing page optimization
- Funnel analysis
- CRO (Conversion Rate Optimization)
EOF

# Specialist 2
cat > squads/vendas-squad/agents/pricing-strategist.md <<'EOF'
# Pricing Strategist

Especialista em estratégias de pricing e monetização.

## Expertise
- Value-based pricing
- Price psychology
- Bundling strategies
- Revenue optimization
EOF
```

#### Passo 3: Criar Tasks

```bash
cat > squads/vendas-squad/tasks/audit-sales-funnel.md <<'EOF'
# Audit Sales Funnel

Auditoria completa do funil de vendas.

## Steps
1. Analisar métricas atuais
2. Identificar gargalos
3. Calcular taxa de conversão por etapa
4. Gerar relatório com recomendações

## Output
- Relatório de auditoria completo
- Lista priorizada de melhorias
- Estimativa de impacto por melhoria
EOF
```

#### Passo 4: Criar Workflow

```bash
cat > squads/vendas-squad/workflows/wf-sales-audit.md <<'EOF'
# Workflow: Sales Audit

Auditoria completa do funil de vendas com otimizações.

## Phases

### Phase 1: Discovery
- @sales-chief analisa contexto do negócio
- @conversion-specialist audita funil atual

### Phase 2: Analysis
- @conversion-specialist identifica gargalos
- @pricing-strategist analisa pricing

### Phase 3: Recommendations
- @sales-chief consolida recomendações
- Gera relatório executivo
EOF
```

#### Passo 5: Escanear (Opcional - Ver Status)

```bash
# Ver se squad será indexado
npm run squad:scan

# Output esperado:
# ✓ vendas-squad
#   Components: 3 agents, 1 tasks, 1 workflows
```

#### Passo 6: Indexar

**Opção A: Manual**
```bash
npm run squad:index

# Output:
# ✓ Indexed vendas-squad
# ✓ Created 6 symlinks
# ✓ MEMORY.md updated
```

**Opção B: Automática (Recomendado)**
```bash
# Apenas commite - hook faz tudo automaticamente
git add squads/vendas-squad/
git commit -m "feat: add vendas squad"

# Hook automaticamente:
# - Detecta squads/ modificado
# - Indexa vendas-squad
# - Atualiza MEMORY.md
# - Auto-stages arquivos modificados
```

#### Passo 7: Usar Imediatamente

No Claude Code, digite:
```
/vendas-squad:agents:sales-chief
/vendas-squad:agents:conversion-specialist
/vendas-squad:tasks:audit-sales-funnel
/vendas-squad:workflows:wf-sales-audit
```

✅ **Pronto! Squad disponível imediatamente.**

---

### Workflow 2: Criar Nova Skill

#### Passo 1: Criar Estrutura

```bash
cd ~/aios-core

mkdir -p .aios/skills/email-marketing/{examples,references,resources}

cat > .aios/skills/email-marketing/README.md <<'EOF'
# Email Marketing Skill

Expertise completo em email marketing, automação e copywriting.

## Capabilities
- Email sequence design
- Subject line optimization
- Copy persuasivo
- Segmentação de audiência
- Automation workflows

## Usage
Use esta skill para criar campanhas de email marketing de alta conversão.
EOF
```

#### Passo 2: Adicionar Exemplos

```bash
cat > .aios/skills/email-marketing/examples/welcome-sequence.md <<'EOF'
# Welcome Email Sequence

Exemplo de sequência de boas-vindas de 5 emails.

## Email 1: Boas-vindas imediatas
**Subject:** Bem-vindo(a)! Aqui está seu primeiro passo 🎉
**Timing:** Imediato após cadastro
**Objetivo:** Confirmar cadastro e dar quick win

## Email 2: Entregar valor
**Subject:** Como [resultado desejado] em 3 passos simples
**Timing:** 1 dia depois
**Objetivo:** Educar e construir confiança

## Email 3: Social proof
**Subject:** Veja o que [nome] conseguiu em apenas 2 semanas
**Timing:** 3 dias depois
**Objetivo:** Mostrar prova social

## Email 4: Superar objeções
**Subject:** "Isso não funciona pra mim porque..."
**Timing:** 5 dias depois
**Objetivo:** Endereçar objeções comuns

## Email 5: Call to action
**Subject:** Último dia para [benefício]
**Timing:** 7 dias depois
**Objetivo:** Conversão para produto/serviço
EOF
```

#### Passo 3: Adicionar Referências

```bash
cat > .aios/skills/email-marketing/references/best-practices.md <<'EOF'
# Email Marketing Best Practices

## Subject Lines
- Mantenha entre 30-50 caracteres
- Use números quando relevante
- Crie curiosidade sem clickbait
- Personalize quando possível

## Copy
- Uma ideia por email
- Parágrafos curtos (2-3 linhas)
- Use bullet points
- CTA claro e único

## Timing
- Teste diferentes horários
- Evite segundas-feiras
- Considere timezone da audiência
EOF
```

#### Passo 4: Indexar

```bash
# Commit (hook indexa automaticamente)
git add .aios/skills/email-marketing/
git commit -m "feat: add email marketing skill"
```

#### Passo 5: Usar

```
/AIOS:skills:email-marketing
```

---

### Workflow 3: Criar Nova Tool

#### Passo 1: Criar Tool

```bash
cd ~/aios-core

mkdir tools/email-validator

cat > tools/email-validator/README.md <<'EOF'
# Email Validator

Valida lista de emails removendo inválidos e duplicatas.

## Usage
```bash
python validate.py emails.txt
```

## Features
- Valida sintaxe
- Remove duplicatas
- Detecta emails descartáveis
- Exporta CSV limpo
EOF

cat > tools/email-validator/validate.py <<'EOF'
#!/usr/bin/env python3
"""Email validator tool."""
import re
import sys

def validate_email(email):
    """Validate email syntax."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def main():
    if len(sys.argv) < 2:
        print("Usage: python validate.py <email_file>")
        return

    with open(sys.argv[1], 'r') as f:
        emails = [line.strip() for line in f]

    valid_emails = [e for e in emails if validate_email(e)]
    unique_emails = list(set(valid_emails))

    print(f"Total: {len(emails)}")
    print(f"Valid: {len(valid_emails)}")
    print(f"Unique: {len(unique_emails)}")

    with open('valid_emails.csv', 'w') as f:
        f.write('\n'.join(unique_emails))

    print("Saved to valid_emails.csv")

if __name__ == '__main__':
    main()
EOF

chmod +x tools/email-validator/validate.py
```

#### Passo 2: Adicionar Dependências (Opcional)

```bash
cat > tools/email-validator/requirements.txt <<'EOF'
# Nenhuma dependência externa necessária
EOF
```

#### Passo 3: Indexar

```bash
git add tools/email-validator/
git commit -m "feat: add email validator tool"

# Hook automaticamente:
# ✓ Registra em tools/README.md
# ✓ Atualiza MEMORY.md
```

#### Passo 4: Verificar Registry

```bash
cat tools/README.md

# Deve mostrar:
# ### email-validator
# - **Language:** Unknown
# - **Description:** Valida lista de emails...
# - **Path:** `tools/email-validator/`
# - **Docs:** [README](email-validator/README.md)
```

---

### Workflow 4: Adicionar Agent a Squad Existente

#### Cenário
Você já tem o squad `vendas-squad` e quer adicionar um novo agent.

#### Passo 1: Criar Novo Agent

```bash
cat > squads/vendas-squad/agents/email-specialist.md <<'EOF'
# Email Specialist

Especialista em email marketing e automação.

## Expertise
- Email sequences
- Copywriting persuasivo
- Automation setup
- Segmentação avançada
EOF
```

#### Passo 2: Commit

```bash
git add squads/vendas-squad/agents/email-specialist.md
git commit -m "feat(vendas-squad): add email specialist"

# Hook automaticamente:
# ✓ Detecta mudança em squads/vendas-squad/
# ✓ Re-indexa squad
# ✓ Cria symlink para email-specialist.md
# ✓ Atualiza contagem de agents em MEMORY.md
```

#### Passo 3: Usar

```
/vendas-squad:agents:email-specialist
```

✅ **Novo agent disponível imediatamente!**

---

## 🎯 Exemplos Práticos

### Exemplo 1: Squad de Marketing

```bash
# Criar estrutura
mkdir -p squads/marketing-squad/{agents,tasks,workflows}

# README
cat > squads/marketing-squad/README.md <<'EOF'
# Marketing Squad
Squad especializado em marketing digital e growth.
EOF

# Agents
cat > squads/marketing-squad/agents/growth-chief.md <<'EOF'
# Growth Chief
Orquestrador de estratégias de growth.
EOF

cat > squads/marketing-squad/agents/content-strategist.md <<'EOF'
# Content Strategist
Especialista em estratégia de conteúdo.
EOF

cat > squads/marketing-squad/agents/seo-specialist.md <<'EOF'
# SEO Specialist
Especialista em SEO e tráfego orgânico.
EOF

# Task
cat > squads/marketing-squad/tasks/content-calendar.md <<'EOF'
# Content Calendar
Gera calendário editorial mensal.
EOF

# Commit
git add squads/marketing-squad/
git commit -m "feat: add marketing squad"

# Usar
# /marketing-squad:agents:growth-chief
# /marketing-squad:agents:content-strategist
# /marketing-squad:tasks:content-calendar
```

### Exemplo 2: Skill de SEO

```bash
# Criar skill
mkdir -p .aios/skills/seo-expert/{examples,references}

cat > .aios/skills/seo-expert/README.md <<'EOF'
# SEO Expert Skill
Expertise completo em SEO on-page e off-page.
EOF

cat > .aios/skills/seo-expert/examples/meta-tags.md <<'EOF'
# Meta Tags Optimization
Exemplos de meta tags otimizadas.
EOF

cat > .aios/skills/seo-expert/references/google-guidelines.md <<'EOF'
# Google SEO Guidelines
Link para diretrizes oficiais do Google.
EOF

# Commit
git add .aios/skills/seo-expert/
git commit -m "feat: add seo expert skill"

# Usar
# /AIOS:skills:seo-expert
```

### Exemplo 3: Tool de Análise

```bash
# Criar tool
mkdir tools/keyword-analyzer

cat > tools/keyword-analyzer/README.md <<'EOF'
# Keyword Analyzer
Analisa keywords e sugere oportunidades.
EOF

cat > tools/keyword-analyzer/analyze.py <<'EOF'
#!/usr/bin/env python3
print("Analyzing keywords...")
EOF

chmod +x tools/keyword-analyzer/analyze.py

# Commit
git add tools/keyword-analyzer/
git commit -m "feat: add keyword analyzer"

# Ver registry
# cat tools/README.md
```

---

## 📖 Referência de Comandos

### NPM Scripts

| Comando | Descrição | Quando Usar |
|---------|-----------|-------------|
| `npm run index:scan` | Escaneia todos assets | Ver status geral |
| `npm run index:all` | Indexa tudo | Indexação manual completa |
| `npm run index:validate` | Valida índices | Troubleshooting |
| `npm run index:report` | Relatório completo | Auditoria geral |
| `npm run squad:scan` | Escaneia squads | Ver squads não indexados |
| `npm run squad:index` | Indexa squads | Indexar squads manualmente |
| `npm run squad:validate` | Valida squads | Verificar squads órfãos |
| `npm run squad:report` | Relatório de squads | Status de squads |

### Scripts Diretos

```bash
# Universal indexer
node scripts/universal-indexer.js --scan
node scripts/universal-indexer.js --index
node scripts/universal-indexer.js --validate
node scripts/universal-indexer.js --report

# Squad indexer
node scripts/squad-indexer.js --scan
node scripts/squad-indexer.js --index
node scripts/squad-indexer.js --validate
node scripts/squad-indexer.js --report
```

### Pre-Commit Hook

```bash
# Executar manualmente (testar)
.husky/pre-commit-squad-indexer

# Desabilitar temporariamente
git commit --no-verify -m "message"

# Re-habilitar (padrão)
git commit -m "message"
```

---

## 🏗️ Arquitetura Técnica

### Estrutura de Arquivos

```
aios-core/
├── scripts/
│   ├── universal-indexer.js      # Indexer principal
│   ├── squad-indexer.js          # Indexer de squads (legacy)
│   └── README-squad-indexer.md   # Docs técnica
│
├── .husky/
│   ├── pre-commit                # Hook entry point
│   └── pre-commit-squad-indexer  # Script de detecção
│
├── squads/                       # SOURCE: Squads
├── .aios/skills/                 # SOURCE: Skills
├── tools/                        # SOURCE: Tools
│
├── .claude/commands/             # SYMLINKS: Slash commands
│   ├── {squad-name}/
│   └── AIOS/skills/
│       └── {skill-name}/
│
└── ~/.claude/projects/.../memory/
    └── MEMORY.md                 # Tabelas auto-atualizadas
```

### Fluxo de Dados

```
1. USER ACTION
   ↓
   Cria/modifica asset em squads/, .aios/skills/, ou tools/
   ↓
2. GIT STAGE
   ↓
   git add squads/my-asset/
   ↓
3. GIT COMMIT
   ↓
   git commit -m "feat: add asset"
   ↓
4. PRE-COMMIT HOOK
   ↓
   Detecta mudanças → Executa universal-indexer.js
   ↓
5. UNIVERSAL INDEXER
   ↓
   Escaneia → Valida → Cria symlinks → Atualiza docs
   ↓
6. AUTO-STAGING
   ↓
   git add .claude/commands/ tools/README.md MEMORY.md
   ↓
7. COMMIT COMPLETO
   ↓
   Commit finalizado com tudo atualizado
   ↓
8. ASSET DISPONÍVEL
   ↓
   Claude Code: /my-asset:agents:chief
```

### Algoritmo de Detecção

```javascript
// Pseudocódigo simplificado

function detectChanges() {
  const stagedFiles = git.diff('--cached', '--name-only');

  const hasSquads = stagedFiles.some(f => f.startsWith('squads/'));
  const hasSkills = stagedFiles.some(f => f.startsWith('.aios/skills/'));
  const hasTools = stagedFiles.some(f => f.startsWith('tools/'));

  if (hasSquads || hasSkills || hasTools) {
    runUniversalIndexer();
  }
}

function runUniversalIndexer() {
  // 1. Scan
  const squads = scanSquads();
  const skills = scanSkills();
  const tools = scanTools();

  // 2. Index
  const indexedSquads = indexAssets(squads, 'squad');
  const indexedSkills = indexAssets(skills, 'skill');

  // 3. Register Tools
  updateToolsRegistry(tools);

  // 4. Update MEMORY
  updateMemory(squads, skills, tools);

  // 5. Auto-stage
  git.add('.claude/commands/');
  git.add('tools/README.md');
  git.add('~/.claude/.../MEMORY.md');
}
```

### Algoritmo de Criação de Symlinks

```javascript
function createSymlinks(asset, type) {
  const targetDir = getTargetDir(asset, type);

  // Criar diretório target
  fs.mkdirSync(targetDir, { recursive: true });

  // Symlink README
  const readmeSrc = path.join(asset.path, 'README.md');
  const readmeDst = path.join(targetDir, 'README.md');
  const relativePath = path.relative(targetDir, readmeSrc);
  fs.symlinkSync(relativePath, readmeDst);

  // Symlink componentes
  const components = ['agents', 'tasks', 'workflows', 'checklists', 'templates'];

  for (const comp of components) {
    const compDir = path.join(asset.path, comp);
    if (!fs.existsSync(compDir)) continue;

    const files = fs.readdirSync(compDir).filter(f => f.endsWith('.md'));

    for (const file of files) {
      const srcFile = path.join(compDir, file);
      const dstDir = path.join(targetDir, comp);
      fs.mkdirSync(dstDir, { recursive: true });

      const dstFile = path.join(dstDir, file);
      const relativePath = path.relative(dstDir, srcFile);
      fs.symlinkSync(relativePath, dstFile);
    }
  }
}
```

---

## 🔧 Troubleshooting

### Problema 1: Squad Não Aparece no Claude Code

**Sintomas:**
- Criou squad mas `/my-squad` não aparece ao digitar barra

**Causas Possíveis:**
1. Squad não foi indexado
2. Faltando README.md
3. Symlinks não criados

**Solução:**

```bash
# 1. Verificar se README.md existe
ls squads/my-squad/README.md

# Se não existe, criar:
cat > squads/my-squad/README.md <<'EOF'
# My Squad
Description
EOF

# 2. Escanear para ver se é detectado
npm run squad:scan

# 3. Indexar manualmente
npm run squad:index

# 4. Verificar symlinks criados
ls -la .claude/commands/my-squad/

# 5. Testar no Claude Code
# Digitar: /my-squad
```

### Problema 2: "Orphaned" Assets na Validação

**Sintomas:**
- `npm run index:validate` mostra assets "orphaned"

**O Que Significa:**
- Asset tem índice em `.claude/commands/` mas não tem source

**Causas:**
- Asset foi removido de `squads/` mas índice permaneceu
- Asset foi movido/renomeado

**Solução:**

```bash
# 1. Verificar qual asset é órfão
npm run index:validate

# Output exemplo:
# ❌ my-old-squad (orphaned)

# 2. Verificar se source existe
ls squads/my-old-squad/
# ls: squads/my-old-squad/: No such file or directory

# 3. Remover índice órfão
rm -rf .claude/commands/my-old-squad

# 4. Re-validar
npm run index:validate
# ✓ Órfão removido
```

### Problema 3: Symlink Quebrado

**Sintomas:**
- Slash command existe mas dá erro ao usar
- `npm run index:validate` mostra symlinks quebrados

**Causas:**
- Source file foi movido/renomeado/deletado
- Path do symlink está incorreto

**Solução:**

```bash
# 1. Verificar symlink
ls -la .claude/commands/my-squad/agents/chief.md

# Output:
# lrwxr-xr-x  chief.md -> ../../../../squads/my-squad/agents/chief.md (broken)

# 2. Verificar se source existe
ls squads/my-squad/agents/chief.md
# ls: No such file or directory

# 3. Re-indexar squad (recria symlinks)
npm run squad:index

# 4. Verificar symlink corrigido
ls -la .claude/commands/my-squad/agents/chief.md
# ✓ Link funcional
```

### Problema 4: Pre-Commit Hook Não Executa

**Sintomas:**
- Commit passa mas hook não roda
- Assets não indexam automaticamente

**Causas:**
1. Hook não executável
2. Hook com erro
3. Commit com `--no-verify`

**Solução:**

```bash
# 1. Verificar se hook é executável
ls -l .husky/pre-commit-squad-indexer

# Se não for executável:
chmod +x .husky/pre-commit-squad-indexer
chmod +x .husky/pre-commit

# 2. Testar hook manualmente
.husky/pre-commit-squad-indexer

# Se der erro, verificar logs e corrigir

# 3. Verificar se não usou --no-verify
# Evite: git commit --no-verify
# Use: git commit
```

### Problema 5: MEMORY.md Não Atualiza

**Sintomas:**
- Indexação funciona mas MEMORY.md não atualiza

**Causas:**
- Path do MEMORY.md incorreto
- Arquivo não existe
- Sem permissão de escrita

**Solução:**

```bash
# 1. Verificar se MEMORY.md existe
ls ~/.claude/projects/-Users-luizfosc-aios-core/memory/MEMORY.md

# 2. Se não existe, criar:
mkdir -p ~/.claude/projects/-Users-luizfosc-aios-core/memory/
cat > ~/.claude/projects/-Users-luizfosc-aios-core/memory/MEMORY.md <<'EOF'
# AIOS Core Memory
EOF

# 3. Verificar permissões
ls -l ~/.claude/projects/-Users-luizfosc-aios-core/memory/MEMORY.md

# 4. Re-indexar
npm run index:all

# 5. Verificar atualização
cat ~/.claude/projects/-Users-luizfosc-aios-core/memory/MEMORY.md | grep "Squads Indexados"
```

### Problema 6: Tool Não Aparece em tools/README.md

**Sintomas:**
- Criou tool mas não aparece no registry

**Solução:**

```bash
# 1. Verificar estrutura da tool
ls tools/my-tool/
# Deve ter pelo menos um script ou README.md

# 2. Re-indexar
npm run index:all

# 3. Verificar tools/README.md
grep "my-tool" tools/README.md

# Se não aparecer, verificar se tool tem README ou script
ls tools/my-tool/README.md
ls tools/my-tool/*.py
ls tools/my-tool/*.js
```

---

## ❓ FAQ

### 1. Posso indexar manualmente sem commit?

**Sim!**

```bash
npm run index:all
```

O pre-commit hook é apenas uma conveniência. Você pode indexar manualmente sempre que quiser.

### 2. O que acontece se eu remover um squad?

Se você remover um squad de `squads/` mas esquecer de remover o índice:

1. Squad continua aparecendo no Claude Code (symlinks órfãos)
2. `npm run index:validate` detecta como "orphaned"
3. Usar o slash command pode dar erro

**Solução:**
```bash
# Remover índice órfão
rm -rf .claude/commands/my-old-squad

# Ou re-indexar (remove órfãos automaticamente)
npm run index:all
```

### 3. Posso desabilitar o pre-commit hook?

**Temporariamente (um commit):**
```bash
git commit --no-verify -m "message"
```

**Permanentemente:**
```bash
# Comentar linha em .husky/pre-commit
vim .husky/pre-commit
# Adicionar # antes da linha:
# #.husky/pre-commit-squad-indexer
```

### 4. Como funciona a detecção de linguagem em tools?

O sistema detecta linguagem verificando:

1. **Python:** `pyproject.toml` ou `setup.py` → "Python"
2. **Node.js:** `package.json` → "Node.js"
3. **Bash:** arquivos `.sh` → "Bash"
4. **Outros:** → "Unknown"

Para melhorar detecção, adicione `package.json` ou `pyproject.toml`.

### 5. Posso ter skills com um único arquivo?

**Sim!** Skills podem ser:

**Single-file:**
```
.aios/skills/my-skill/
└── README.md
```

Indexado como:
```
.claude/commands/AIOS/skills/my-skill.md → link to README.md
```

**Multi-file:**
```
.aios/skills/my-skill/
├── README.md
└── examples/
    └── example-1.md
```

Indexado como:
```
.claude/commands/AIOS/skills/my-skill/
├── README.md → link
└── examples/
    └── example-1.md → link
```

### 6. Como adiciono um squad existente sem re-indexar tudo?

```bash
npm run squad:index
```

Isso indexa APENAS squads não indexados, sem tocar em skills/tools.

### 7. O sistema funciona no Windows?

**Sim, com limitações:**

Symlinks no Windows requerem:
- Windows 10+ com modo desenvolvedor ativado
- OU executar terminal como administrador

Alternativa: Use WSL (Windows Subsystem for Linux).

### 8. Posso mover um squad para outro diretório?

**Sim, mas precisa re-indexar:**

```bash
# Mover squad
mv squads/old-name squads/new-name

# Remover índice antigo
rm -rf .claude/commands/old-name

# Re-indexar com novo nome
npm run squad:index
```

### 9. Como sei quais assets estão indexados?

```bash
npm run index:report

# Output:
# Squads: 9 (0 unindexed)
# Skills: 5 (0 unindexed)
# Tools: 7
```

### 10. Posso ter squads com o mesmo nome?

**Não.** Nomes de squads devem ser únicos no diretório `squads/`.

Se tentar criar `squads/my-squad/` e já existe, terá conflito.

Use nomes descritivos e únicos.

---

## 📝 Checklist de Boas Práticas

### Ao Criar Squad

- [ ] Criar `README.md` (obrigatório)
- [ ] Criar `config.yaml` (recomendado)
- [ ] Usar kebab-case no nome (`meu-squad`, não `Meu Squad`)
- [ ] Documentar agents com role e commands
- [ ] Adicionar pelo menos 1 task executável
- [ ] Testar com `npm run squad:scan` antes de commit
- [ ] Commitar e verificar indexação automática

### Ao Criar Skill

- [ ] Criar `README.md` (obrigatório)
- [ ] Adicionar exemplos de uso em `examples/`
- [ ] Incluir referências em `references/`
- [ ] Usar kebab-case no nome
- [ ] Documentar capabilities claramente
- [ ] Testar com `npm run index:scan`
- [ ] Commitar e verificar indexação

### Ao Criar Tool

- [ ] Criar `README.md` (recomendado)
- [ ] Adicionar script principal executável
- [ ] Incluir `package.json` ou `pyproject.toml` para detecção de linguagem
- [ ] Documentar usage e examples
- [ ] Testar script funciona
- [ ] Commitar e verificar registry atualizado

### Manutenção

- [ ] Rodar `npm run index:validate` mensalmente
- [ ] Limpar assets órfãos quando detectados
- [ ] Manter README.md atualizados
- [ ] Verificar symlinks não quebrados
- [ ] Atualizar MEMORY.md se necessário

---

## 🎓 Resumo Final

### O Que Você Aprendeu

1. ✅ **O que é** o Universal AIOS Indexer
2. ✅ **Por que existe** (elimina trabalho manual)
3. ✅ **Como funciona** (detecção → indexação → disponibilização)
4. ✅ **Como usar** (criar → commit → usar)
5. ✅ **Como resolver problemas** (troubleshooting)

### Workflow Simplificado

```
1. CRIAR asset (squad/skill/tool)
   ↓
2. COMMIT
   ↓
3. USAR imediatamente (/) no Claude Code
```

### Comando Mais Importante

```bash
# Ver status de TUDO
npm run index:report
```

---

**Manual criado por:** @devops (Gage)
**Data:** 2026-02-13
**Versão:** 2.0.0
**Status:** Completo

— Gage, deployando com confiança 🚀
