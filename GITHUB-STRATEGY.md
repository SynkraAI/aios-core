# 🗂️ Estratégia de Organização GitHub - Luiz Fosc

Guia de como seus projetos estão organizados no GitHub e melhores práticas.

---

## 📊 Visão Geral Atual

### Repositórios AIOS
```
📦 luizfosc/aios-core-backup (Private)
   └─ Backup completo: framework + customizações (tools, squads, skills)

📦 luizfosc/claude-global-skills (Private)
   └─ Backup de skills globais Claude (~/.claude/skills/)

📦 luizfosc/aios-visual-context-system (Public)
   └─ Statusline para Claude Code com contexto AIOS
```

### Repositórios de Projetos
```
📦 luizfosc/garimpoai (Public)
   └─ Assistente IA para licitações públicas

📦 luizfosc/whatsapp-analytics (Private)
   └─ Dashboard de análise de conversas WhatsApp

📦 luizfosc/autoknowledge-ai (Private)
   └─ Plataforma de gestão de conhecimento

... e mais ~12 projetos pessoais
```

---

## 🎯 Estratégia de Organização

### Monorepo AIOS (Atual)
```
aios-core-backup/
├── .aios-core/          # Framework oficial
├── bin/                 # CLI
├── packages/            # Packages oficiais
├── tools/               # 🎨 SUAS TOOLS (6)
├── squads/              # 🎨 SEUS SQUADS (15)
├── .aios/skills/        # 🎨 SUAS SKILLS RUNTIME (5)
└── .claude/commands/    # 🎨 SEUS SLASH COMMANDS (79)
```

**Vantagens:**
- ✅ Tudo em um lugar
- ✅ Contexto completo preservado
- ✅ Fácil sincronizar com upstream
- ✅ Backup automático de customizações

**Quando usar:**
- Backup regular de customizações
- Desenvolvimento de tools/squads/skills
- Experimentação com framework

---

## 🚀 Estrutura Recomendada para Novos Projetos

### Apps Grandes → Repo Individual
```bash
# Criar novo repo para app
cd ~/Projects/
mkdir meu-novo-app
cd meu-novo-app
git init
gh repo create meu-novo-app --private --source=.
npx aios-core install  # Instala AIOS no projeto
git add .
git commit -m "feat: initial commit with AIOS"
git push -u origin main
```

**Exemplos:**
- `garimpoai` - App completo de licitações
- `whatsapp-analytics` - Dashboard standalone
- `autoknowledge-ai` - Plataforma SaaS

### Tools Reutilizáveis → Repo Individual (futuro)
```bash
# Se quiser compartilhar uma tool específica
cd ~/aios-core/tools/hotmart-downloader/
git init
gh repo create hotmart-downloader --public --source=.
git add .
git commit -m "feat: initial release"
git push -u origin main
```

**Quando fazer:**
- Tool está madura e testada
- Quer compartilhar com comunidade
- Precisa versionamento independente

### Squads Reutilizáveis → Repo Individual (futuro)
```bash
# Se quiser compartilhar um squad específico
cd ~/aios-core/squads/hormozi/
git init
gh repo create aios-squad-hormozi --public --source=.
git add .
git commit -m "feat: initial release - Hormozi strategies squad"
git push -u origin main
```

**Quando fazer:**
- Squad genérico e reutilizável
- Quer que outros usem
- Precisa CI/CD independente

---

## 📋 Convenções de Nomenclatura

### Repos AIOS-related
```
aios-{type}-{name}
├── aios-tool-hotmart-downloader
├── aios-squad-hormozi
├── aios-skill-prd-generator
└── aios-visual-context-system
```

### Apps/Projetos
```
{nome-descritivo}
├── garimpoai
├── whatsapp-analytics
├── autoknowledge-ai
└── roda-da-vida-ai
```

### Backups/Internos
```
{nome}-backup  ou  {nome}-private
├── aios-core-backup
├── claude-global-skills
└── luizfosc-site
```

---

## 🔄 Workflows Comuns

### 1. Criar novo app grande
```bash
# 1. Criar diretório
cd ~/Projects/
mkdir novo-app
cd novo-app

# 2. Inicializar git + criar repo
git init
gh repo create novo-app --private --source=.

# 3. Instalar AIOS
npx aios-core install

# 4. Primeiro commit
git add .
git commit -m "feat: initial commit with AIOS"
git push -u origin main
```

### 2. Extrair tool para repo próprio
```bash
# 1. Copiar tool
cd ~/
cp -r aios-core/tools/minha-tool/ ~/aios-tool-minha-tool/
cd ~/aios-tool-minha-tool/

# 2. Criar repo
git init
gh repo create aios-tool-minha-tool --public --source=.

# 3. Preparar para publicação
# - Adicionar README.md
# - Adicionar LICENSE
# - Adicionar .gitignore
# - Adicionar exemplos

# 4. Publicar
git add .
git commit -m "feat: initial public release"
git push -u origin main

# 5. (Opcional) Manter link no monorepo
cd ~/aios-core/tools/
ln -s ~/aios-tool-minha-tool/ minha-tool
```

### 3. Backup regular
```bash
# Entrar no monorepo
cd ~/aios-core/

# Backup customizações
npm run backup:custom

# OU backup completo
npm run backup:full
```

---

## 🎨 Showcase vs Backup

### Backup (Private)
**Propósito:** Segurança, versionamento, histórico
**Visibilidade:** Private
**Exemplos:**
- `aios-core-backup`
- `claude-global-skills`
- `whatsapp-analytics`

**Quando usar:**
- Código em desenvolvimento
- Projetos pessoais/clientes
- Customizações experimentais

### Showcase (Public)
**Propósito:** Portfolio, compartilhamento, comunidade
**Visibilidade:** Public
**Exemplos:**
- `aios-visual-context-system`
- `garimpoai`
- (Futuro) `aios-tool-hotmart-downloader`

**Quando usar:**
- Código maduro e testado
- Quer feedback da comunidade
- Portfólio profissional

---

## 📊 Estrutura GitHub Ideal (Meta)

```
luizfosc/
├── AIOS Ecosystem
│   ├── aios-core-backup (Private)        # Monorepo backup
│   ├── aios-visual-context-system (Public)
│   └── (Futuro) aios-tool-* / aios-squad-*
│
├── Apps & Projects
│   ├── garimpoai (Public)
│   ├── whatsapp-analytics (Private)
│   ├── autoknowledge-ai (Private)
│   └── roda-da-vida-ai (Private)
│
└── Backups & Internals
    ├── claude-global-skills (Private)
    └── luizfosc-site (Private)
```

---

## 💡 Dicas

### ✅ FAÇA:
- Mantenha monorepo como backup principal
- Crie repo individual para apps grandes
- Use Private para experimentação
- Use Public para showcase
- Documente bem repos públicos

### ❌ NÃO FAÇA:
- Não crie repo para cada pequena tool
- Não faça fork do aios-core oficial (use git remote)
- Não commite .env ou secrets
- Não publique código de clientes

---

## 🆘 Comandos Úteis

### Listar seus repos
```bash
gh repo list --limit 100
```

### Criar novo repo
```bash
gh repo create {nome} --private --source=.
gh repo create {nome} --public --source=.
```

### Clonar repo existente
```bash
gh repo clone luizfosc/{nome}
```

### Ver info do repo
```bash
gh repo view
```

---

## 📚 Referências

- **GitHub CLI:** https://cli.github.com/
- **AIOS Backup:** `BACKUP-GUIDE.md`
- **Customizações:** `CUSTOMIZATIONS.md`
- **Seu GitHub:** https://github.com/luizfosc

---

*Última atualização: 2026-02-13*
*Criado por: @aios-master (Orion)*
