# Quick Start: Resumo Rápido

> **Este é um RESUMO.** Para tutorial completo com exemplos, veja [TUTORIAL-COMPLETO.md](./TUTORIAL-COMPLETO.md).
>
> **Primeira vez?** Comece por [POR-ONDE-COMECAR.md](./POR-ONDE-COMECAR.md).

---

## Pré-requisitos

- Claude Code ativo
- Projeto AIOS configurado

---

## Passo 1: Ativar o Squad Architect (30 seg)

```
@squad-creator
```

Você verá o greeting do Squad Architect. Ele está pronto para receber comandos.

---

## Passo 2: Solicitar Criação do Squad (1 min)

Simplesmente diga o que você quer:

```
Quero um squad de copywriting
```

**O que acontece:**
1. Squad Architect inicia automaticamente a pesquisa
2. NÃO pergunta "quer pesquisar?" - já vai direto
3. Executa 3-5 iterações de pesquisa com devil's advocate

---

## Passo 3: Pre-Flight (1 min)

O sistema pergunta sobre o modo de execução:

```
┌─────────────────────────────────────────────────────────────────┐
│ PRE-FLIGHT: CRIAÇÃO DE SQUAD                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Como você quer executar?                                        │
│                                                                 │
│ 🚀 YOLO    - Não tenho materiais (60-75% fidelity)             │
│ 💎 QUALITY - Tenho livros/PDFs (85-95% fidelity)               │
│ 🔀 HYBRID  - Tenho materiais de alguns experts                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Escolha:**
- **YOLO** se quer rapidez e não tem materiais
- **QUALITY** se tem livros/PDFs dos experts
- **HYBRID** se tem materiais de alguns, não de todos

---

## Passo 4: Aprovar Elite Minds (1 min)

Após a pesquisa, você vê os resultados:

```
┌─────────────────────────────────────────────────────────────────┐
│ ELITE MINDS ENCONTRADOS                                         │
├──────────────────┬──────────┬───────────────────────────────────┤
│ Mind             │ Tier     │ Framework Principal               │
├──────────────────┼──────────┼───────────────────────────────────┤
│ {expert-1}       │ Tier 0   │ {framework-1}                     │
│ {expert-2}       │ Tier 1   │ {framework-2}                     │
│ {expert-3}       │ Tier 1   │ {framework-3}                     │
│ ...              │ ...      │ ...                               │
└──────────────────┴──────────┴───────────────────────────────────┘

Criar agentes baseados nestes minds?
```

Responda **sim** para prosseguir.

---

## Passo 5: Aguardar Criação (2-3 min)

O sistema executa automaticamente:

```
✓ Coletando fontes para {expert-name}...
✓ Extraindo Voice DNA...
✓ Extraindo Thinking DNA...
✓ Rodando Smoke Tests (3/3)...
✓ Criando agent.md...

[Repetir para cada mind]

✓ Criando orchestrator...
✓ Gerando workflows...
✓ Validando squad...
✓ Gerando Quality Dashboard...
```

---

## Passo 6: Receber o Squad Pronto

```
┌─────────────────────────────────────────────────────────────────┐
│ ✅ SQUAD CRIADO: {squad-name}                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Agents: N (experts + 1 orchestrator)                            │
│ Quality Score: X.X/10                                           │
│ Fidelity Estimate: XX%                                          │
│                                                                 │
│ Ativação: @{squad-name}                                         │
│ Dashboard: squads/{squad-name}/docs/quality-dashboard.md        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Usar o Squad

```
@{squad-name}
```

Agora você tem acesso a todos os agents do squad:

```
@{squad-name}:{expert-1}  → Especialidade do expert 1
@{squad-name}:{expert-2}  → Especialidade do expert 2
@{squad-name}:{expert-3}  → Especialidade do expert 3
```

---

## Resumo do Fluxo

```
@squad-creator
      ↓
"Quero um squad de {domínio}"
      ↓
Escolher modo (YOLO/QUALITY/HYBRID)
      ↓
Aprovar elite minds
      ↓
Aguardar criação automática
      ↓
@{squad} para usar
```

---

## Comandos Úteis

| Comando | O que faz |
|---------|-----------|
| `*create-squad` | Criar novo squad (com workflow guiado) |
| `*clone-mind {name}` | Clonar um expert específico |
| `*validate-squad {name}` | Validar squad existente |
| `*quality-dashboard {name}` | Gerar dashboard de qualidade |
| `*help` | Ver todos os comandos |

---

## Próximos Passos

1. **Entender os conceitos:** Leia [CONCEPTS.md](./CONCEPTS.md)
2. **Ver diagramas:** Leia [ARCHITECTURE-DIAGRAMS.md](./ARCHITECTURE-DIAGRAMS.md)
3. **Problemas?** Leia [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## Exemplo Real: 30 Segundos

```
User: @squad-creator
Bot:  🎨 Squad Architect ready...

User: Quero um squad de {domínio}
Bot:  I'll research the best minds in {domínio}. Starting...
      [pesquisa 3-5 iterações]

Bot:  Found N elite minds. Create agents?
User: sim

Bot:  [cria automaticamente]
      ✅ Squad {squad-name} criado! Ative com @{squad-name}
```

**É isso.** Sem configuração, sem setup, sem complicação.

---

**Squad Architect | Quick Start v1.0**
*"De zero a squad em 5 minutos."*
