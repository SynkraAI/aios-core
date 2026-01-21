# AIOS Sync System

Sistema de sincronização para manter o AIOS atualizado em múltiplos projetos, com suporte a atualizações do repositório oficial.

## Conceito

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│   SynkraAI/aios-core           seu-user/aios-core             │
│   (upstream - oficial)          (origin - seu fork)            │
│          │                             ↑                       │
│          │  aios-update                │  git push origin      │
│          ↓                             │                       │
│        ┌─────────────────────────────────┐                     │
│        │    ~/dev/aios-core (local)      │                     │
│        │    - suas customizações         │                     │
│        │    - + atualizações oficiais    │                     │
│        └─────────────────────────────────┘                     │
│                       │                                        │
│                       │ aios-sync                              │
│                       ↓                                        │
│             seus projetos locais                               │
│             - projeto-a/.aios-core/                            │
│             - projeto-b/.aios-core/                            │
└────────────────────────────────────────────────────────────────┘
```

### Fluxo de Atualizações

```
┌──────────────┐    aios-update    ┌──────────────┐    aios-sync    ┌──────────────┐
│   Upstream   │ ───────────────→  │  aios-core   │ ──────────────→ │   Projetos   │
│   (oficial)  │                   │   (master)   │                 │   (locais)   │
└──────────────┘                   └──────────────┘                 └──────────────┘
                                          ↑
                                          │ aios-push
                                   ┌──────────────┐
                                   │  Projeto X   │
                                   │  (dev local) │
                                   └──────────────┘
```

## Instalação

```bash
cd ~/dev/aios-core
./bin/install.sh
```

Isso copia os scripts para `~/bin/` e configura as permissões.

## Scripts

### aios-push

Exporta o `.aios-core/` do projeto atual para o repositório master.

```bash
# No diretório de um projeto com AIOS
aios-push           # Executa a cópia
aios-push --dry-run # Mostra o que seria copiado
```

**Quando usar:** Após criar ou modificar algo no AIOS (task, agent, template, etc.)

### aios-sync

Propaga o repositório master para todos os projetos em `~/dev/`.

```bash
aios-sync                      # Atualiza todos os projetos
aios-sync --dry-run            # Mostra quais seriam atualizados
aios-sync --project=meu-proj   # Atualiza só um projeto específico
```

**Quando usar:** Após fazer `aios-push`, para distribuir as mudanças.

### aios-pull

Atualiza o `.aios-core/` do projeto atual a partir do master.

```bash
# No diretório de um projeto
aios-pull           # Atualiza o projeto atual
aios-pull --dry-run # Mostra as mudanças
aios-pull --force   # Instala AIOS em projeto que não tem
```

**Quando usar:** Para atualizar um projeto específico sem rodar sync completo.

### aios-update

Atualiza o `aios-core` local com as mudanças do repositório oficial (upstream).

```bash
aios-update                    # Mostra status e mudanças disponíveis
aios-update --check            # Apenas verifica, sem mostrar opções
aios-update --merge            # Faz merge do upstream/main
aios-update --tag=v3.10.0      # Atualiza para uma tag específica
```

**Quando usar:** Quando quiser incorporar novas features/fixes do AIOS oficial.

## Workflow Típico

### Cenário: Criei uma nova task no agent-factory

```bash
# 1. Está no agent-factory, criou execute-epic.md
cd ~/dev/agent-factory

# 2. Promove para o master
aios-push

# 3. (Opcional) Versiona no git
cd ~/dev/aios-core
git add . && git commit -m "Add execute-epic task"
git push  # se tiver remote

# 4. Propaga para outros projetos
aios-sync
```

### Cenário: Quero atualizar só um projeto

```bash
cd ~/dev/meu-projeto
aios-pull
```

### Cenário: Quero instalar AIOS em um projeto novo

```bash
cd ~/dev/projeto-novo
aios-pull --force
```

### Cenário: Saiu uma nova versão oficial do AIOS

```bash
# 1. Verifica o que tem de novo
aios-update

# 2. Faz merge das atualizações
aios-update --merge

# 3. Propaga para todos os projetos
aios-sync

# 4. (Opcional) Push para seu fork
cd ~/dev/aios-core
git push origin main
```

### Cenário: Quero atualizar para uma versão específica

```bash
# Atualiza para a tag v3.10.0
aios-update --tag=v3.10.0

# Propaga
aios-sync
```

## Configuração

Os scripts usam variáveis de ambiente com defaults:

| Variável | Default | Descrição |
|----------|---------|-----------|
| `AIOS_MASTER` | `~/dev/aios-core` | Caminho do repositório master |
| `AIOS_PROJECTS_DIR` | `~/dev` | Diretório onde ficam os projetos |

Para customizar, adicione ao seu `~/.bashrc` ou `~/.zshrc`:

```bash
export AIOS_MASTER="$HOME/meus-repos/aios-core"
export AIOS_PROJECTS_DIR="$HOME/projetos"
```

## Estrutura

```
aios-core/                      # Repositório oficial (fork)
├── .aios-core/                 # Framework AIOS
│   ├── development/
│   │   ├── agents/            # Definições de agentes
│   │   ├── tasks/             # Tasks executáveis
│   │   └── ...
│   ├── product/
│   │   ├── templates/         # Templates de documentos
│   │   ├── checklists/        # Checklists de qualidade
│   │   └── ...
│   └── ...
├── bin/                        # Scripts de sync (suas customizações)
│   ├── README.md              # Esta documentação
│   ├── install.sh             # Script de instalação
│   ├── aios-push              # Exporta projeto → master
│   ├── aios-sync              # Propaga master → projetos
│   ├── aios-pull              # Atualiza projeto atual
│   └── aios-update            # Atualiza do upstream oficial
├── src/                        # Código fonte do AIOS
├── packages/                   # Pacotes do monorepo
└── ...
```

## Após Formatar a Máquina

1. Clone seu fork: `git clone git@github.com:SEU-USER/aios-core.git ~/dev/aios-core`
2. Configure upstream: `git remote add upstream https://github.com/SynkraAI/aios-core.git`
3. Instale os scripts: `./bin/install.sh`
4. Pronto! Scripts disponíveis globalmente.

## Troubleshooting

### "Repositório master não encontrado"

O script espera o master em `~/dev/aios-core`. Se estiver em outro lugar:

```bash
export AIOS_MASTER="/caminho/para/aios-core"
```

### "Não encontrei .aios-core/ no diretório atual"

Você está em um projeto sem AIOS. Use `aios-pull --force` para instalar.

### Scripts não encontrados após reinstalar

Execute novamente:

```bash
cd ~/dev/aios-core
./bin/install.sh
```

### Conflitos ao fazer aios-update --merge

Se houver conflitos entre suas customizações e o upstream:

1. Resolva os arquivos conflitantes manualmente
2. `git add <arquivos>`
3. `git commit`

Ou aborte: `git merge --abort`
