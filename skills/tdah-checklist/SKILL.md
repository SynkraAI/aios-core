---
name: tdah-checklist
description: "Radar pessoal de projetos para TDAH. Rastreia tudo que está em andamento, analisa urgência, sugere foco e delegação. Obsidian como fonte de verdade."
allowed-tools: [Read, Write, Edit, Glob, Grep, Bash, Agent, AskUserQuestion]
version: "1.0.0"
category: productivity
tags: [SKILL, productivity, adhd, checklist, radar]
---

# TDAH Checklist — Radar de Projetos

> Um comando. Todo o panorama. Sem perder o fio da meada.

Skill de produtividade pessoal que rastreia todos os projetos em andamento num arquivo Obsidian central. Cada invocação escaneia o estado real dos projetos (git, arquivos, stories) e atualiza o checklist com análise IA, sugestões de foco e delegação.

---

## Constantes

```yaml
OBSIDIAN_FILE: "/Users/luizfosc/Library/Mobile Documents/iCloud~md~obsidian/Documents/Mente do Fosc/+/✅📍 Radar de projetos.md"
ACTIVE_MD: "docs/projects/ACTIVE.md"
AIOS_ROOT: "/Users/luizfosc/aios-core"
```

---

## Comandos

| Comando | Descrição |
|---------|-----------|
| `/tdah-checklist` | Adiciona o projeto atual (`pwd`) ao radar. Se já existe, atualiza estado. |
| `/tdah-checklist status` | Panorama completo: escaneia TODOS os projetos, regenera análises, mostra no terminal. |
| `/tdah-checklist add "nome"` | Adiciona um projeto avulso (sem código) ao radar. Pergunta urgência e próximos passos. |
| `/tdah-checklist done <projeto>` | Propõe marcar como concluído. Pergunta ao usuário antes de mover. |
| `/tdah-checklist remove <projeto>` | Remove projeto do radar (não deleta, só para de rastrear). |
| `/tdah-checklist focus` | IA escolhe O ÚNICO projeto para focar agora. |
| `/tdah-checklist dashboard` | Abre o dashboard visual Kanban no browser (Next.js local). |
| `/tdah-checklist import` | Importa todos os projetos do ACTIVE.md de uma vez. |

---

## Fluxo Principal — `/tdah-checklist` (sem args)

### Passo 1: Detectar projeto

Detectar o projeto a partir do diretório atual (`pwd`):

```
Bash("pwd") → cwd
```

Classificar o tipo de projeto:

| Sinal | Tipo detectado |
|-------|----------------|
| `cwd` está dentro de `skills/` | Skill AIOS |
| `cwd` está dentro de `squads/` | Squad AIOS |
| `cwd` está dentro de `tools/` | Tool AIOS |
| `cwd` tem `.aiox/INDEX.md` | Projeto HYBRID |
| `cwd` tem entry em ACTIVE.md | Projeto CENTRALIZED |
| `cwd` tem `.git/` ou `package.json` | Projeto genérico |
| Nenhum dos acima | Perguntar ao usuário |

Extrair o nome do projeto a partir do nome do diretório (último segmento do path).

### Passo 2: Ler o arquivo Obsidian

```
Read(OBSIDIAN_FILE)
```

Se o arquivo não existir, criar com template base (ver `references/obsidian-format.md`).

Fazer parse do conteúdo:
- Identificar todas as seções H1 (🔴 Urgente, 🟡 Atenção, 🟢 Tranquilo, ✅ Concluídos)
- Identificar todos os projetos (H2 dentro de cada seção)
- Para cada projeto: extrair campos (Urgência, Status, Caminho, checkboxes, Análise, Delegação)
- **PRESERVAR** qualquer conteúdo adicionado manualmente pelo usuário

### Passo 3: Verificar se o projeto já está no radar

- Se o projeto JÁ EXISTE no arquivo → ir para Passo 4 (atualizar)
- Se o projeto NÃO EXISTE → ir para Passo 3b (adicionar)

#### Passo 3b: Adicionar projeto novo

Perguntar ao usuário:

```
AskUserQuestion: "Vou adicionar <nome> ao radar. Qual a urgência?
1. 🔴 Urgente — precisa de ação agora
2. 🟡 Atenção — importante mas pode esperar
3. 🟢 Tranquilo — no radar, sem pressa"
```

Default: 🟡 Atenção (se o usuário não responder ou disser "tanto faz").

Criar bloco H2 do projeto na seção correspondente com os campos preenchidos pelo scanner (Passo 4).

### Passo 4: Escanear e atualizar o projeto

Executar o módulo scanner (ver `engine/scanner.md`):

- Se o projeto tem `Caminho` definido e o path existe → escanear git + arquivos
- Se o projeto não tem `Caminho` (projeto avulso) → pular scan, manter checkboxes manuais

**Regras de merge (Obsidian é master):**

| Situação | Comportamento |
|----------|---------------|
| Checkbox marcada no Obsidian como `[x]` | PRESERVAR — nunca desmarcar |
| Checkbox marcada no Obsidian como `[ ]` mas scan detecta como feita | Marcar como `[x]` E perguntar: "Detectei que X parece concluído. Confirma?" |
| Item novo detectado pelo scan que não existe no Obsidian | ADICIONAR ao final da lista de checkboxes |
| Item existe no Obsidian mas não foi detectado pelo scan | PRESERVAR — pode ser item manual do usuário |
| Campo metadata (Status, Último commit, Branch) | ATUALIZAR com dados frescos do scan |
| Campo Análise | REGENERAR com análise IA atualizada |
| Campo Delegação | REGENERAR com sugestões atualizadas |
| Texto livre adicionado pelo usuário | PRESERVAR intacto |

### Passo 5: Gerar análise IA

Executar o módulo analyzer (ver `engine/analyzer.md`):

- Gerar `📋 Análise:` per-project (1-2 frases: estado, bloqueio, próxima ação)
- Gerar `💡 Delegação:` per-project (sugestão ou `—`)
- **NÃO regenerar a Análise Global** neste fluxo (só no `/tdah-checklist status`)

### Passo 6: Escrever arquivo Obsidian atualizado

Reescrever o arquivo completo com as atualizações. Seguir a spec em `references/obsidian-format.md`.

Atualizar frontmatter:
- `última_atualização`: timestamp atual
- `total_projetos`: contagem de projetos ativos (excluindo concluídos)
- `total_concluídos`: contagem de projetos na seção ✅

### Passo 7: Mostrar resumo no terminal

Exibir card do projeto atualizado:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 whatsapp-prospector
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status: 🔄 Em produção — Pipeline Phase 5 (4/11)
Branch: main
Último commit: d4e5f6g feat: big ideas leandro (3 dias atrás)

Progresso: ███████░░░ 3/7 (43%)

📋 Pipeline ativo com momentum. Foco aqui gera resultado direto.
💡 Considerar delegar copy a um copywriter profissional.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Obsidian atualizado ✓
```

---

## Fluxo — `/tdah-checklist status`

Visão panorâmica completa. Executa os passos:

1. Ler arquivo Obsidian
2. Para CADA projeto com `Caminho` definido: rodar scanner em paralelo (múltiplos `Bash` calls)
3. Atualizar todos os projetos
4. **Regenerar Análise Global (IA)** — ver `engine/analyzer.md` seção "Análise Global"
5. Escrever arquivo Obsidian atualizado
6. Mostrar panorama no terminal:

```
🧠 RADAR DE PROJETOS — 2026-04-13
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 URGENTE (2)
  whatsapp-prospector     🔄 Pipeline Phase 5 (4/11)    43%
  claude-remote-manager   ⏳ Aguardando review           80%

🟡 ATENÇÃO (3)
  luizfosc-brand          DNA Visual aprovado            50%
  content-forge-ecosystem Tier 0-2 prontos               70%
  skill-tdah-checklist    Em construção                  0%

🟢 TRANQUILO (1)
  vídeo-ensinio-talks     Gravação pendente              0%

✅ CONCLUÍDOS (1)
  designcode-ui           100%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 Foco: whatsapp-prospector — pipeline ativo, cada dia conta.
🧹 Liberar: confirmar designcode-ui como done.
⏸️ Estacionar: luizfosc-brand, content-forge.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Fluxo — `/tdah-checklist add "nome"`

Para projetos avulsos sem código (ideia, tarefa pessoal, projeto offline):

1. Perguntar urgência (🔴/🟡/🟢)
2. Perguntar: "Quais são os próximos passos? (lista separada por vírgula)"
3. Criar bloco H2 com:
   - `Urgência:` conforme escolhido
   - `Status:` 💡 Só ideia
   - `Caminho:` —
   - Checkboxes a partir dos próximos passos informados
   - `Análise:` — (será gerada no próximo `/tdah-checklist status`)
   - `Delegação:` — (será avaliada no próximo `/tdah-checklist status`)
4. Escrever no Obsidian
5. Mostrar confirmação no terminal

---

## Fluxo — `/tdah-checklist done <projeto>`

1. Ler Obsidian, localizar o projeto
2. Mostrar estado atual com checkboxes
3. Se há checkboxes pendentes (`[ ]`), avisar: "Atenção: ainda tem X itens pendentes"
4. Perguntar: "Confirma que <projeto> está concluído?"
5. Se SIM:
   - Mover bloco H2 para seção `✅ Concluídos`
   - Adicionar campo `Concluído em: YYYY-MM-DD`
   - Adicionar campo `Entrega:` com resumo de 1 linha
   - Remover campo `Urgência`
   - Atualizar contadores no frontmatter
6. Se NÃO: manter onde está, sem alteração

---

## Fluxo — `/tdah-checklist focus`

1. Ler Obsidian
2. Filtrar projetos 🔴 e 🟡 (excluir 🟢 e ✅)
3. Para cada projeto, avaliar:
   - Momentum: tem commits recentes? Pipeline ativo?
   - Bloqueio: está esperando algo externo?
   - Impacto: gera resultado direto (receita, entrega)?
4. Escolher O ÚNICO projeto para focar
5. Exibir:

```
🎯 FOCO AGORA: whatsapp-prospector

Por quê: Pipeline ativo com momentum. Cada dia parado = lead perdido.
Próximo passo: @copy-chief — escrever copy das mensagens.
Estimativa: ~2h de trabalho focado.

Os outros podem esperar. Foco aqui.
```

---

## Fluxo — `/tdah-checklist import`

1. Ler `docs/projects/ACTIVE.md`
2. Ler Obsidian
3. Para cada projeto em ACTIVE.md que NÃO está no Obsidian:
   - Extrair: nome, modo, status, caminho
   - Classificar urgência via `engine/semaforo.md`
   - Criar bloco H2
4. Mostrar lista de projetos que serão importados
5. Perguntar: "Importar todos? Ou quer selecionar quais?"
6. Escrever no Obsidian
7. Mostrar contagem: "Importados X projetos. Rode `/tdah-checklist status` pra ver o panorama completo."

---

## Fluxo — `/tdah-checklist remove <projeto>`

1. Ler Obsidian, localizar o projeto
2. Perguntar: "Remover <projeto> do radar? (isso não deleta nada, só para de rastrear)"
3. Se SIM: remover bloco H2 do projeto, atualizar índice e contadores
4. Se NÃO: manter

---

## Fluxo — `/tdah-checklist dashboard`

Abre o dashboard visual Kanban no browser. O dashboard é uma app Next.js local que lê/escreve direto no arquivo Obsidian, com live sync (SSE) — edições no Obsidian aparecem em tempo real no browser e vice-versa.

### Passos

1. **Verificar se já está rodando (OBRIGATÓRIO):**
   ```bash
   lsof -iTCP -sTCP:LISTEN -P | grep -i next
   ```
   - Se encontrar processo Next.js ativo → **NÃO subir outro**. Extrair a porta do processo existente e pular para o Passo 5.
   - Se não encontrar → continuar para o Passo 2.

2. **Verificar dependências:**
   ```bash
   cd ~/aios-core/skills/tdah-checklist/dashboard
   [ -d node_modules ] || npm install
   ```

3. **Alocar porta via port-manager:**
   ```bash
   eval $(node ~/aios-core/tools/port-manager.js auto tdah-dashboard)
   ```

4. **Iniciar o server em background:**
   ```bash
   cd ~/aios-core/skills/tdah-checklist/dashboard && PORT=$PORT npx next start -p $PORT &
   ```
   Aguardar o server ficar pronto (máximo 15s, checar com curl).

5. **Abrir no browser:**
   ```bash
   open "http://localhost:$PORT"
   ```

6. **Informar o usuário:**
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   📊 Dashboard TDAH aberto!
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   URL: http://localhost:{PORT}
   Sync: Obsidian ↔ Dashboard (live)
   
   Arraste projetos entre colunas para mudar urgência.
   Edições no Obsidian aparecem em tempo real.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ```
   Se já estava rodando, informar: `Dashboard já estava ativo na porta {PORT}. Abri no browser.`

### Notas
- O dashboard é **observabilidade**, não controle. Segue a filosofia CLI First.
- Todas as features da skill (`status`, `focus`, `add`, etc.) continuam funcionando 100% via CLI.
- O dashboard é um complemento visual — nunca um requisito.

---

## Regras Importantes

### Obsidian é master
O arquivo Obsidian é a fonte de verdade absoluta. Se o usuário editou algo lá (mudou urgência, adicionou checkbox, escreveu nota, moveu projeto de seção), a skill RESPEITA. A skill só adiciona/atualiza — nunca remove conteúdo que o usuário possa ter adicionado manualmente.

### Sem auto-complete
NUNCA marcar um projeto como concluído automaticamente. Sempre perguntar ao usuário. Mesmo que 100% dos checkboxes estejam marcados, o usuário decide quando "done" é "done".

### Análise honesta
A análise IA deve ser direta e útil, não genérica. Dizer "pipeline ativo, cada dia conta" é útil. Dizer "continue trabalhando neste projeto" é inútil. Se não há o que dizer, escrever `—`.

### pt-BR com acentuação completa
Todo output (terminal e Obsidian) em português brasileiro com acentuação correta. Sem exceção.

### Delegação como sugestão
Sugestões de delegação são opiniões, não ordens. O formato é: "Considerar delegar X a Y" — nunca "Delegue X". Ver `references/delegation-patterns.md` para heurísticas.
