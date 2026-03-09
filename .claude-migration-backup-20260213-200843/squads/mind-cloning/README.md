# 🧬 Mind Cloning Squad

> Clone minds > create bots

Squad especializado em clonar mentes de experts através de extração sistemática de **Voice DNA** (como comunicam) e **Thinking DNA** (como pensam).

---

## Quick Start

```bash
# Ativar o agente
@mind-cloner

# Clonar uma mente (workflow completo)
*clone-mind {expert-name}

# Ou com materiais próprios (Tier 0 - máxima fidelidade)
*clone-mind {expert-name} --sources ./path/to/materials
```

---

## Workflow

```
1. *collect-sources      ← BLOCKING GATE (GO/NO-GO)
2. *extract-voice-dna    ← 8 fases (~1-2h)
3. *extract-thinking-dna ← 7 fases (~1-2h)
4. *synthesize-mind      ← Combina Voice + Thinking
5. *smoke-test           ← BLOCKING GATE (3/3 tests)
```

Fases 2 e 3 podem rodar em paralelo.

---

## Commands

| Comando | Descrição |
|---------|-----------|
| `*clone-mind` | Workflow completo (todas as fases) |
| `*collect-sources` | Coletar e validar fontes |
| `*extract-voice-dna` | Extrair Voice DNA (como comunica) |
| `*extract-thinking-dna` | Extrair Thinking DNA (como pensa) |
| `*synthesize-mind` | Sintetizar DNA completo |
| `*smoke-test` | Validar clone com 3 testes |
| `*diagnose-clone` | Diagnosticar por que clone está fraco |

---

## Output

```
outputs/minds/{mind_slug}/
├── sources_inventory.yaml    # Fontes classificadas por tier
├── voice_dna.yaml            # Vocabulário, tom, histórias, immune system
├── thinking_dna.yaml         # Frameworks, heurísticas, decision pipeline
├── mind_dna_complete.yaml    # DNA combinado + síntese
├── smoke_test_result.yaml    # Resultado dos 3 testes
└── quality_dashboard.md      # Métricas de qualidade
```

---

## Fidelity Levels

| Level | Fidelidade | Fontes | Voice | Thinking |
|-------|-----------|--------|-------|----------|
| Basic | 60-75% | Web only | 6/10 | 5/9 |
| Intermediate | 75-85% | Curated | 7/10 | 6/9 |
| Premium | 85-95% | Extensive | 9/10 | 8/9 |
| Elite | 93-97% | Crown jewel | 10/10 | 9/9 |

---

## DNA Mental 8-Layer Model

Cada mente possui 8 camadas organizadas em 3 níveis:

| Nível | Camadas | O que Captura |
|-------|---------|---------------|
| **Observable** | 1-4 | Behavioral Patterns, Communication Style, Routines, Recognition |
| **Cognitive** | 5 | Mental Models (frameworks, heurísticas) |
| **Deep Identity** | 6-8 | Values Hierarchy, Core Obsessions, Productive Paradoxes |

Clone com menos de 6/8 camadas = INCOMPLETE. Layers 6-8 são o que separa clone genérico de clone que PENSA como a pessoa.

Referência completa: `data/dna-mental-8layers.md`

---

## Diagnostics

Quando um clone está fraco, use `*diagnose-clone`:

1. Roda 6 perguntas diagnósticas
2. Identifica red flags e heurísticas violadas (AN001-AN005)
3. Gera plano de correção com causa raiz + esforço estimado

Referência completa: `data/diagnostic-framework.md`

---

## Princípios

- **40/20/40** — 40% Curadoria + 20% Prompt + 40% Refinamento
- **Triangulação** — Single source = hypothesis; three sources = pattern
- **Contradições** — Features, not bugs. Clone consistente demais = clone falso
- **Gold > Bronze** — Menos material ouro vale mais que muito material bronze

---

## Estrutura do Squad

```
squads/mind-cloning/
├── config.yaml              # Manifest
├── agents/
│   └── mind-cloner.md       # Agente Helix
├── tasks/                   # 6 tasks executáveis
├── templates/               # 5 templates de output
├── data/                    # 8 arquivos de referência
├── checklists/              # 3 quality gates
├── workflows/               # Pipeline completo
└── scripts/                 # Extensões futuras
```

---

*Mind Cloning Squad v1.1.0*
*Agente: Helix (mind-cloner)*
