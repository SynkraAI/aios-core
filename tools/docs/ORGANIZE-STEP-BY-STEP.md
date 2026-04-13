# Organização por Etapas — Todos os Projetos

Sistema gradual para organizar TODOS os projetos sem pressa.

---

## 🎯 Filosofia: Migração Gradual

**NÃO** aplicar tudo de uma vez. Organize projeto por projeto, conforme trabalha neles.

**Regra:** Quando abrir um projeto para trabalhar → aplicar estrutura → trabalhar organizado.

---

## 📋 Etapa 1: Inventário (5 min)

Descubra TODOS os seus projetos:

```bash
node tools/organize-all-projects.js --dry-run
```

**Output esperado:**
```
📊 Encontrados 23 projetos:
   ✅ Com estrutura: 3
   ⚠️  Sem estrutura: 20

📋 Projetos SEM estrutura:
   meu-saas-app
   └─ ~/CODE/Projects/meu-saas-app
      Git: ✅

   cliente-xyz
   └─ ~/CODE/Projects/cliente-xyz
      Git: ✅

   [... mais 18 projetos]
```

**O que fazer:**
- Salve essa lista em algum lugar (screenshot ou copiar)
- Identifique os **3-5 projetos que você mais trabalha**

---

## 📋 Etapa 2: Priorização (2 min)

Escolha **UM** projeto para começar. Critérios:

1. **Projeto que você vai trabalhar HOJE** (prioridade máxima)
2. Projeto que você trabalha toda semana
3. Projeto grande/importante

**Exemplo:**
- ✅ "Vou trabalhar no `meu-saas-app` hoje" → **COMECE POR ELE**
- ⏸️ "Projeto cliente-xyz está pausado" → deixar pra depois
- ⏸️ "Projeto teste-old nunca mais uso" → deletar ou arquivar

---

## 📋 Etapa 3: Aplicar no Primeiro Projeto (1 min)

```bash
# Entrar no projeto escolhido
cd ~/CODE/Projects/meu-saas-app

# Aplicar estrutura
epic-init .

# Validar
validate-org .
```

**Resultado:**
```
🎉 Estrutura criada com sucesso!

docs/
├── stories/active/
├── stories/done/
├── stories/epics/
├── sessions/
└── INDEX.md
```

---

## 📋 Etapa 4: Trabalhar Organizado (primeira vez)

Agora que o projeto tem estrutura, **USE-A imediatamente**:

### 4.1: Criar Epic para trabalho atual

```bash
# Se for trabalho grande (feature nova, refactoring)
epic 1 implementar-autenticacao

# Preencher docs/stories/epics/EPIC-01-implementar-autenticacao/EPIC-01-implementar-autenticacao-master.md
```

### 4.2: Criar Stories

```bash
story 1.1 criar-tela-login
story 1.2 adicionar-jwt
story 1.3 proteger-rotas

# Preencher cada story em docs/stories/active/
```

### 4.3: Trabalhar normalmente

- Marcar checkboxes conforme faz
- Commitar
- Mover para `done/` quando concluir

---

## 📋 Etapa 5: Repetir Gradualmente

**A cada dia/semana:**
1. Abrir projeto para trabalhar
2. Se NÃO tem estrutura → rodar `epic-init .`
3. Trabalhar organizado

**Em 2-3 semanas:** Todos os projetos ativos estarão organizados.

**Projetos inativos:** Deixe como estão. Só organize quando voltar a trabalhar neles.

---

## 🚀 Atalhos por Tipo de Projeto

### Para projetos DENTRO do aios-core

```bash
cd ~/aios-core

# Ver projetos sem estrutura
ls -d docs/projects/* | while read p; do
  if [ ! -d "$p/stories" ]; then
    echo "⚠️  $p"
  fi
done

# Aplicar em um específico
epic-init docs/projects/ensinio
```

### Para projetos em ~/CODE/Projects/

```bash
cd ~/CODE/Projects

# Ver projetos sem estrutura
ls -d */ | while read p; do
  if [ ! -d "$p/docs/stories" ]; then
    echo "⚠️  $p"
  fi
done

# Aplicar em um específico
cd meu-saas-app
epic-init .
```

---

## 📊 Acompanhar Progresso

### Criar checklist manual

```markdown
# Projetos para Organizar

- [ ] meu-saas-app (hoje!)
- [ ] cliente-xyz (esta semana)
- [ ] projeto-interno (próxima semana)
- [x] aios-core (já tem)
- [ ] app-mobile (quando voltar a trabalhar)
```

### Ou usar comando

```bash
# Ver progresso
node tools/organize-all-projects.js --dry-run

# Mostra:
# ✅ Com estrutura: 5 / 23 (22%)
# ⚠️  Sem estrutura: 18 / 23 (78%)
```

---

## 💡 Dicas

1. **Não force** — Organize conforme trabalha, não force tudo de uma vez
2. **Comece pequeno** — Um projeto por dia/semana
3. **Projetos mortos** — Delete ou arquive (não gaste tempo organizando lixo)
4. **Projetos externos** — Se recebeu projeto de cliente sem estrutura, aplique antes de começar
5. **Novos projetos** — Use `/new-project` → já vem organizado

---

## 🎯 Meta: 2-3 Semanas

**Semana 1:**
- Organizar 3-5 projetos mais ativos

**Semana 2:**
- Organizar 5-7 projetos secundários

**Semana 3:**
- Organizar resto (se ainda usar)

**Resultado:**
- 100% dos projetos ATIVOS organizados
- Projetos inativos arquivados ou deletados
- Cultura de sempre trabalhar com estrutura

---

## ✅ Checklist de Validação

Após organizar cada projeto, rodar:

```bash
validate-org .
```

Se passar 6/6 checks → projeto está **perfeitamente organizado**.

---

## 🔄 Manutenção (Futuro)

**Regra simples:**
- TODO projeto novo → `/new-project` ou `epic-init .`
- TODO projeto antigo → aplicar estrutura antes de trabalhar

Em 1 mês, você nunca mais terá projeto desorganizado.

---

**Criado:** 2026-03-14
**Filosofia:** Gradual > All-at-once
