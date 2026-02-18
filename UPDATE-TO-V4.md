# 🚀 Atualização Segura: v3.11.3 → v4.0.4

Guia passo a passo para atualizar seu AIOS local para a versão oficial mais recente.

---

## ✅ Pré-requisitos

Antes de começar, certifique-se:
- [ ] Você terminou trabalhos em andamento
- [ ] Não tem mudanças importantes não salvas
- [ ] Tem tempo (~15 minutos) para fazer com calma

---

## 📋 Checklist de Atualização

### 1️⃣ Backup Completo (OBRIGATÓRIO)
```bash
cd ~/aios-core
npm run backup:full
```

**Aguarde:** Vai aparecer confirmação do commit + push
**Verificar:** Acesse https://github.com/luizfosc/aios-core-backup para confirmar

---

### 2️⃣ Ver O Que Vai Mudar
```bash
git fetch upstream
git log HEAD..upstream/main --oneline
```

**O que esperar:**
- Lista de ~10+ commits
- Versões v4.0.0, v4.0.1, v4.0.4
- Melhorias: hooks, installer, performance, docs

---

### 3️⃣ Sincronizar com Upstream
```bash
npm run sync:upstream
```

**O que pode acontecer:**

#### ✅ Cenário 1: Merge automático (90% das vezes)
```
✔ Fetching from upstream
✔ Merging upstream/main
✔ Pushing to origin
Done! ✨
```

#### ⚠️ Cenário 2: Conflitos (raro)
```
CONFLICT (content): Merge conflict in {arquivo}
Automatic merge failed; fix conflicts and then commit the result.
```

**Se tiver conflito:**
1. Abra o arquivo indicado no VS Code
2. Procure por: `<<<<<<< HEAD` e `>>>>>>> upstream/main`
3. Escolha qual versão manter (ou misture)
4. Remova as marcações do git (`<<<<<<<`, `=======`, `>>>>>>>`)
5. Salve o arquivo
6. Continue:
```bash
git add {arquivo}
git commit -m "chore: merge upstream/main - resolve conflicts"
git push origin main
```

---

### 4️⃣ Testar Localmente
```bash
# Verificar versão
cat package.json | grep '"version"'
# Deve mostrar: "version": "4.0.4" (ou próxima)

# Rodar testes
npm test

# Verificar linting
npm run lint

# Testar CLI
npx aios-core --version
```

**Tudo passou?** ✅ Atualização concluída com sucesso!

---

### 5️⃣ Verificar Customizações
```bash
# Confirmar que suas tools/squads/skills estão intactas
ls -la tools/        # Deve listar suas 6 tools
ls -la squads/       # Deve listar seus 15 squads
ls -la .aios/skills/ # Deve listar suas 5 skills
```

---

## 📊 Novidades na v4.0.4

### v4.0.4 (Mais recente)
- 🔧 Fix: Hooks incluídos no npm package
- 🔧 Fix: Referências CLI corrigidas

### v4.0.1
- 🐛 8 bugs críticos corrigidos no installer
- 📦 Melhoria no feedback de instalação de dependências

### v4.0.0 (Major Release)
- 🚀 SYN-12: Performance benchmarks + E2E testing
- 📚 SYN-11: Documentação de skills + help
- 🧠 SYN-10: Pro Memory Bridge (feature-gated)
- 🎯 SYN-8: Domain content population

---

## 🆘 Problemas Comuns

### "error: Your local changes would be overwritten by merge"
**Solução:**
```bash
# Salvar mudanças temporariamente
git stash

# Fazer merge
npm run sync:upstream

# Recuperar mudanças
git stash pop
```

### "fatal: refusing to merge unrelated histories"
**Solução:**
```bash
git merge upstream/main --allow-unrelated-histories
```

### "Tests are failing after update"
**Solução:**
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# Rodar testes novamente
npm test
```

---

## 🔄 Rollback (Se Algo Der Errado)

### Voltar ao estado anterior
```bash
# Ver último commit
git log --oneline -5

# Voltar 1 commit (mantém mudanças)
git reset --soft HEAD~1

# Voltar 1 commit (DESCARTA mudanças)
git reset --hard HEAD~1

# Forçar push (cuidado!)
git push origin main --force
```

### Restaurar do backup
```bash
# Clonar backup do GitHub
cd ~/
mv aios-core aios-core-broken
git clone https://github.com/luizfosc/aios-core-backup.git aios-core
cd aios-core
npm install
```

---

## ✅ Checklist Final

Após atualização, confirme:
- [ ] Versão é v4.0.4 (ou próxima)
- [ ] `npm test` passa
- [ ] `npm run lint` sem erros
- [ ] Tools/squads/skills intactos
- [ ] Backup no GitHub atualizado
- [ ] CLI funciona: `npx aios-core --version`

---

## 📚 Próxima Atualização

Para manter sempre atualizado, agende:
- [ ] Revisar mensalmente (todo dia 1º?)
- [ ] Antes de projetos grandes
- [ ] Quando tiver bugs locais

**Comando rápido para checar:**
```bash
cd ~/aios-core && git fetch upstream && git log HEAD..upstream/main --oneline | wc -l
```
Se mostrar `0` → Você está atualizado! ✅
Se mostrar `5+` → Hora de atualizar! 🚀

---

*Criado em: 2026-02-13*
*Versão atual: v3.11.3*
*Versão alvo: v4.0.4*
*Por: @aios-master (Orion)*
