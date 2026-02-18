# 🚀 Guia Rápido de Backup - AIOS Core

Guia prático para fazer backup das suas customizações AIOS.

---

## ⚡ Comandos Rápidos

### Backup Completo (Framework + Customizações)
```bash
npm run backup:full
```
**Quando usar:** Sempre que fizer mudanças importantes ou terminar uma sessão de trabalho.

---

### Backup Seletivo (Só Customizações)
```bash
npm run backup:custom
```
**Quando usar:** Quando só alterou tools, squads ou skills (não mexeu no framework).

---

### Sync com Framework Oficial
```bash
npm run sync:upstream
```
**Quando usar:** Periodicamente para pegar atualizações do SynkraAI/aios-core oficial.

---

## 🔄 Workflow Recomendado

### Cenário 1: Trabalho do dia a dia
```bash
# 1. Faça suas mudanças em tools/squads/skills
# 2. Teste localmente
# 3. Backup customizações
npm run backup:custom
```

### Cenário 2: Fim de semana/sessão longa
```bash
# 1. Revisão geral de mudanças
git status

# 2. Backup completo
npm run backup:full
```

### Cenário 3: Atualizar framework oficial
```bash
# 1. ANTES: Backup suas customizações
npm run backup:full

# 2. Sync com upstream
npm run sync:upstream

# 3. Resolver conflitos (se houver)
# 4. Testar localmente
npm test

# 5. Push final
git push origin main
```

---

## 📊 Verificar Status

### Ver mudanças locais
```bash
git status
```

### Ver diff antes de commitar
```bash
git diff                    # Unstaged changes
git diff --staged          # Staged changes
```

### Ver histórico de commits
```bash
git log --oneline -10      # Últimos 10 commits
```

### Ver remotes configurados
```bash
git remote -v
# origin    → seu backup (luizfosc/aios-core-backup)
# upstream  → oficial (SynkraAI/aios-core)
```

---

## 🎯 Customizações que você possui

Ver arquivo `CUSTOMIZATIONS.md` para lista completa.

**Resumo rápido:**
- **6 tools** em `tools/`
- **15 squads** em `squads/`
- **5 skills runtime** em `.aios/skills/`
- **79 slash commands** em `.claude/commands/AIOS/skills/`

---

## 🚨 Resolução de Conflitos

### Se `backup:custom` falhar (nada para commitar):
```bash
# Normal! Significa que não há mudanças nas customizações
echo "Tudo certo, sem mudanças!"
```

### Se `sync:upstream` gerar conflitos:
```bash
# 1. Ver arquivos em conflito
git status

# 2. Resolver manualmente ou aceitar upstream
git checkout --theirs {arquivo}  # Usar versão upstream
git checkout --ours {arquivo}    # Manter sua versão

# 3. Adicionar arquivos resolvidos
git add {arquivo}

# 4. Finalizar merge
git commit -m "chore: merge upstream/main"
git push origin main
```

---

## 📚 Links Úteis

- **Seu backup:** https://github.com/luizfosc/aios-core-backup
- **Oficial:** https://github.com/SynkraAI/aios-core
- **Customizações:** Ver `CUSTOMIZATIONS.md`
- **Memory:** `~/.claude/projects/-Users-luizfosc-aios-core/memory/MEMORY.md`

---

## 💡 Dicas

✅ **FAÇA:**
- Backup antes de sync upstream
- Teste localmente antes de push
- Commit pequeno e frequente
- Use mensagens descritivas

❌ **NÃO FAÇA:**
- Push sem testar
- Editar arquivos do framework oficial
- Commitar `.env` ou secrets
- Force push sem necessidade

---

## 🆘 Precisa de Ajuda?

**Rollback último commit:**
```bash
git reset --soft HEAD~1  # Mantém mudanças
git reset --hard HEAD~1  # DESCARTA mudanças (cuidado!)
```

**Ver o que vai ser commitado:**
```bash
git diff --cached
```

**Desfazer mudanças locais (não commitadas):**
```bash
git checkout -- {arquivo}  # Arquivo específico
git reset --hard          # TUDO (cuidado!)
```

---

*Última atualização: 2026-02-13*
*Criado por: @aios-master (Orion)*
