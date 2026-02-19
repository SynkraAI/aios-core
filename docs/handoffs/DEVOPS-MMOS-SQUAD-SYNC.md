# Handoff: MMOS → aios-pro Squad Sync

**De:** @dev (Dex)
**Para:** @devops (Gage)
**Data:** 2026-02-16
**Prioridade:** Alta

---

## Objetivo

Configurar sincronização automática de squads entre o repositório MMOS (`oalanicolas/mmos`) e o repositório aios-pro (`SynkraAI/aios-pro`), mantendo a separação `private-squads/` vs `squads/`.

---

## Contexto

### Repositórios envolvidos

| Repo | Visibilidade | Branch | Papel |
|------|-------------|--------|-------|
| `oalanicolas/mmos` | Privado | `main` | Fonte — onde squads são desenvolvidos |
| `SynkraAI/aios-pro` | Privado | `main` | Destino — publicado no npm como `@aios-fullstack/pro` |

### Estrutura atual do aios-pro

```
aios-pro/
├── squads/                    # Squads INSTALÁVEIS (vão pro npm + install)
│   ├── squad-creator-pro/
│   └── mmos-squad/            # excluído do npm via .npmignore + SCAFFOLD_EXCLUDES
├── private-squads/            # Squads de DESENVOLVIMENTO (git: sim, npm: não, install: não)
│   └── README.md
├── .npmignore                 # Exclui squads/mmos-squad/ e private-squads/
└── package.json               # files[] allowlist controla o que vai pro npm
```

### Regras de publicação (3 camadas)

| Camada | Mecanismo | Controla |
|--------|-----------|----------|
| `package.json` `files[]` | Allowlist explícita | Só o que está listado vai pro npm |
| `.npmignore` | Blacklist | Backup de exclusão (private-squads/, mmos-squad) |
| `pro-scaffolder.js` `SCAFFOLD_EXCLUDES` | Array no código | `mmos-squad` nunca é copiado durante install |

### Regra de negócio

```
MMOS squads/ + private-squads/  →  aios-pro squads/ + private-squads/
                                         ↓
                              npm publish (só squads/ listados em files[])
                                         ↓
                              npx aios-core install (só squads/ menos SCAFFOLD_EXCLUDES)
```

---

## Requisitos

### R1: Estrutura no MMOS

Criar no repositório `oalanicolas/mmos`:

```
mmos/
├── squads/              # (já existe — ~40 squads)
├── private-squads/      # (CRIAR — mesma semântica do aios-pro)
│   └── README.md
```

### R2: GitHub Action — Sync squads to aios-pro

Criar workflow em `oalanicolas/mmos/.github/workflows/sync-squads-to-pro.yml` que:

1. **Trigger:** Push para `main` que toque em `squads/**` ou `private-squads/**`
2. **Ação:** Copiar APENAS `squads/` e `private-squads/` para `SynkraAI/aios-pro`
3. **Método:** Clone aios-pro → rsync/copy os diretórios → commit + push
4. **Nunca:** Deletar squads que existem APENAS no aios-pro (ex: `squad-creator-pro`)

### R3: Seleção de squads

Nem todos os 40+ squads do MMOS devem ir para o aios-pro. Usar um manifesto para controlar quais são sincronizados.

**Opção recomendada:** Arquivo `sync-manifest.yaml` na raiz do MMOS:

```yaml
# sync-manifest.yaml — Controla quais squads são sincronizados para aios-pro
sync:
  squads:
    - mmos-squad
    # Adicionar novos squads aqui quando prontos para o aios-pro
  private-squads:
    - meu-novo-squad-em-dev
    # Squads em desenvolvimento colaborativo
```

### R4: Proteção

- O workflow NÃO deve deletar squads que existem apenas no aios-pro (ex: `squad-creator-pro`)
- O workflow NÃO deve tocar em nenhum arquivo fora de `squads/` e `private-squads/` no aios-pro
- O workflow deve usar um token com acesso a ambos os repos (PAT ou GitHub App)

---

## Implementação sugerida

### Workflow: `sync-squads-to-pro.yml`

```yaml
name: Sync Squads to aios-pro

on:
  push:
    branches: [main]
    paths:
      - 'squads/**'
      - 'private-squads/**'
      - 'sync-manifest.yaml'

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout MMOS
        uses: actions/checkout@v4
        with:
          path: mmos

      - name: Checkout aios-pro
        uses: actions/checkout@v4
        with:
          repository: SynkraAI/aios-pro
          token: ${{ secrets.AIOS_PRO_SYNC_TOKEN }}
          path: aios-pro

      - name: Read sync manifest
        id: manifest
        run: |
          cd mmos
          if [ -f sync-manifest.yaml ]; then
            # Parse squads list
            SQUADS=$(yq -r '.sync.squads[]' sync-manifest.yaml 2>/dev/null | tr '\n' ' ')
            PRIVATE=$(yq -r '.sync.private-squads[]' sync-manifest.yaml 2>/dev/null | tr '\n' ' ')
            echo "squads=$SQUADS" >> $GITHUB_OUTPUT
            echo "private=$PRIVATE" >> $GITHUB_OUTPUT
          else
            echo "squads=" >> $GITHUB_OUTPUT
            echo "private=" >> $GITHUB_OUTPUT
          fi

      - name: Sync squads
        run: |
          # Sync listed squads (additive — never delete aios-pro-only squads)
          for squad in ${{ steps.manifest.outputs.squads }}; do
            if [ -d "mmos/squads/$squad" ]; then
              echo "Syncing squad: $squad → aios-pro/squads/"
              rm -rf "aios-pro/squads/$squad"
              cp -r "mmos/squads/$squad" "aios-pro/squads/$squad"
            else
              echo "WARNING: Squad '$squad' not found in mmos/squads/"
            fi
          done

          # Sync listed private-squads
          mkdir -p aios-pro/private-squads
          for squad in ${{ steps.manifest.outputs.private }}; do
            if [ -d "mmos/private-squads/$squad" ]; then
              echo "Syncing private-squad: $squad → aios-pro/private-squads/"
              rm -rf "aios-pro/private-squads/$squad"
              cp -r "mmos/private-squads/$squad" "aios-pro/private-squads/$squad"
            elif [ -d "mmos/squads/$squad" ]; then
              echo "Syncing squad as private: $squad → aios-pro/private-squads/"
              rm -rf "aios-pro/private-squads/$squad"
              cp -r "mmos/squads/$squad" "aios-pro/private-squads/$squad"
            else
              echo "WARNING: Squad '$squad' not found"
            fi
          done

      - name: Commit and push to aios-pro
        run: |
          cd aios-pro
          git config user.name "MMOS Squad Sync"
          git config user.email "sync@synkra.ai"
          git add squads/ private-squads/
          if git diff --staged --quiet; then
            echo "No changes to sync"
          else
            CHANGED=$(git diff --staged --name-only | wc -l)
            git commit -m "chore: sync $CHANGED squad files from MMOS

            Source: oalanicolas/mmos@${{ github.sha }}
            Trigger: ${{ github.event.head_commit.message }}"
            git push
          fi
```

### Secret necessário

| Secret | Repo | Valor |
|--------|------|-------|
| `AIOS_PRO_SYNC_TOKEN` | `oalanicolas/mmos` | PAT com `repo` scope para `SynkraAI/aios-pro` |

### Manifesto inicial sugerido: `sync-manifest.yaml`

```yaml
# Quais squads do MMOS sincronizar para aios-pro
# Adicione aqui conforme squads ficam prontos

sync:
  # squads/ → aios-pro/squads/ (instaláveis via npm)
  squads:
    - mmos-squad

  # private-squads/ → aios-pro/private-squads/ (dev only, nunca no npm)
  private-squads: []
```

---

## Checklist de execução

- [ ] Criar `private-squads/README.md` no MMOS (análogo ao do aios-pro)
- [ ] Criar `sync-manifest.yaml` na raiz do MMOS
- [ ] Gerar PAT com acesso a `SynkraAI/aios-pro` (ou usar GitHub App)
- [ ] Adicionar secret `AIOS_PRO_SYNC_TOKEN` em `oalanicolas/mmos`
- [ ] Criar workflow `sync-squads-to-pro.yml` no MMOS
- [ ] Instalar `yq` no runner ou usar parser alternativo (jq + sed)
- [ ] Testar com push em `squads/mmos-squad/` e verificar sync no aios-pro
- [ ] Verificar que `squad-creator-pro` no aios-pro NÃO foi afetado
- [ ] Documentar no MMOS README a seção sobre sync

---

## Fluxo visual

```
oalanicolas/mmos (dev)          SynkraAI/aios-pro (publish)       npm / install
┌─────────────────────┐        ┌──────────────────────┐         ┌────────────────┐
│ squads/              │──sync──│ squads/              │──npm──→│ user project   │
│   mmos-squad/        │───→────│   mmos-squad/        │  pub   │   squads/      │
│   storytelling/      │        │   squad-creator-pro/ │───→────│     squad-*-pro│
│   ...40+ squads      │        │                      │        │                │
│                      │        │                      │        │ (mmos-squad    │
│ private-squads/      │──sync──│ private-squads/      │  ✗     │  EXCLUDED via  │
│   novo-squad-wip/    │───→────│   novo-squad-wip/    │  npm   │  SCAFFOLD_     │
│                      │        │                      │        │  EXCLUDES)     │
└─────────────────────┘        └──────────────────────┘         └────────────────┘
       ↑                                ↑                               ↑
  git: todos                    git: sync'd only              npm: files[] only
  npm: n/a                      npm: files[] allowlist        install: -EXCLUDES
```

---

## Notas para @devops

1. O `yq` pode não estar no runner padrão. Alternativa: `python3 -c "import yaml; ..."` ou instalar via `snap install yq`.
2. Se preferirem GitHub App em vez de PAT, o token tem validade infinita e melhor auditoria.
3. O workflow é **aditivo** — nunca deleta squads do aios-pro que não estão no manifesto. Isso protege `squad-creator-pro`.
4. Para promover um squad de `private-squads` para `squads` no aios-pro: mover no manifesto de `private-squads:` para `squads:` e fazer push.
