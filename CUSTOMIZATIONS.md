# 🎨 AIOS Core - Customizações Locais

Este documento mapeia todas as **customizações locais** deste repositório, separando o que é código oficial do framework Synkra AIOS vs suas extensões pessoais.

---

## 📍 Repository Info

- **Origin (Backup):** `luizfosc/aios-core-backup` (Private)
- **Upstream (Oficial):** `SynkraAI/aios-core` (Source)
- **Owner:** Luiz Fosc (@luizfosc)
- **Purpose:** Backup completo do framework + customizações locais

---

## 🧩 Estrutura de Customizações

### ✅ Código Oficial (do upstream SynkraAI/aios-core)

Estes diretórios/arquivos vêm do framework oficial e devem ser **sincronizados** com upstream:

```
.aios-core/           # Core framework
bin/                  # CLI executables
packages/             # Framework packages
docs/                 # Documentação oficial (maioria)
scripts/              # Scripts do framework
tests/                # Suite de testes oficial
.claude/              # Configuração Claude Code (parcial - ver exceções)
```

### 🎨 Customizações Locais (exclusivas suas)

Estes diretórios contêm **suas criações** e devem ser **backupadas**:

#### 1. Tools (6 ferramentas)
```
tools/
├── aios-backup/              # Script de backup
├── btg-pix-batch/            # Processamento BTG PIX
├── design-system-analysis/   # Análise de design systems
├── document-processing/      # Processamento de documentos (249MB - .venv)
├── hotmart-downloader/       # Downloader Hotmart (296MB - playwright)
├── video-transcriber/        # Transcritor de vídeo
└── youtube-data-collector/   # Coletor de dados YouTube
```

**Tamanho total:** ~545MB (principalmente python .venv)

#### 2. Squads (15 squads customizados)
```
squads/
├── content-engine/           # Motor de conteúdo
├── design/                   # Squad de design
├── dopamine-learning/        # Gamificação de aprendizado
├── hormozi/                  # Estratégias Alex Hormozi
├── icp-cloning/              # Clonagem de ICP
├── knowledge-base-builder/   # Construtor de knowledge base
├── mbti-expert/              # Especialista MBTI
├── mind-cloning/             # Clonagem de personalidade
├── mind-content-updater/     # Atualizador de conteúdo
├── mmos-squad/               # Mind-mapping squad
├── squad-creator/            # Criador de squads
├── tim-ferriss/              # Metodologias Tim Ferriss
└── [backups]/                # squad-creator.backup-*
```

#### 3. Skills Runtime (5 skills)
```
.aios/skills/
├── criar-app-completo/       # Criador de apps completos
├── dashboard-generator/      # Gerador de dashboards
├── design-system-extractor/  # Extrator de design systems
├── prd-generator/            # Gerador de PRDs
└── superpowers/              # Superpoderes (9 sub-skills)
```

#### 4. Slash Commands (79 skills)
```
.claude/commands/AIOS/skills/  # 79 slash commands consolidados
```

#### 5. Outros Customizados
```
.claude/agent-memory/         # Memória de agentes
.aios/dashboard/              # Dashboard status
docs/sessions/                # Handoffs de sessão
docs/aprendizado/             # Notas de aprendizado
```

---

## 🔄 Workflow de Backup

### Setup Inicial (já configurado)
```bash
# Já está configurado!
git remote -v
# origin    https://github.com/luizfosc/aios-core-backup.git
# upstream  https://github.com/SynkraAI/aios-core.git
```

### Backup Manual (quando quiser)

**1. Backup completo (framework + customizações):**
```bash
npm run backup:full
# ou manualmente:
git add .
git commit -m "backup: $(date +%Y-%m-%d) - full snapshot"
git push origin main
```

**2. Backup seletivo (só customizações):**
```bash
npm run backup:custom
# ou manualmente:
git add tools/ squads/ .aios/skills/ .claude/commands/AIOS/skills/
git commit -m "feat: update custom tools/squads/skills - $(date +%Y-%m-%d)"
git push origin main
```

**3. Sync com framework oficial:**
```bash
npm run sync:upstream
# ou manualmente:
git fetch upstream
git merge upstream/main
git push origin main
```

---

## 📊 Estatísticas

| Tipo | Quantidade | Tamanho Aprox. |
|------|-----------|----------------|
| Tools | 6 | ~545MB |
| Squads | 15 | ~50MB |
| Skills Runtime | 5 | ~5MB |
| Slash Commands | 79 | ~2MB |
| **Total Customizações** | **105 componentes** | **~600MB** |

---

## 🎯 Regras de Ouro

1. ✅ **SEMPRE** commitar customizações antes de sync upstream
2. ✅ **NUNCA** editar diretamente arquivos do framework oficial
3. ✅ **SEMPRE** manter tools/squads/skills separados
4. ✅ **BACKUP** manual quando fizer mudanças importantes
5. ✅ **SYNC** upstream periodicamente para pegar atualizações

---

## 🚨 Arquivos Sensíveis (NUNCA commitar)

Já protegidos pelo `.gitignore`:
- `.env*` - Variáveis de ambiente
- `*token*.json`, `*secret*` - Credenciais
- `.venv/`, `__pycache__/` - Python artifacts
- `.aios/session.json` - Estado de sessão
- `.aios/project-status.yaml` - Status temporário

---

## 📚 Referências

- **Framework oficial:** https://github.com/SynkraAI/aios-core
- **Seu backup:** https://github.com/luizfosc/aios-core-backup
- **MEMORY.md:** `~/.claude/projects/-Users-luizfosc-aios-core/memory/MEMORY.md`
- **Scripts:** `scripts/backup-*.sh` (ver package.json)

---

*Última atualização: 2026-02-13*
*Mantido por: @aios-master (Orion)*
