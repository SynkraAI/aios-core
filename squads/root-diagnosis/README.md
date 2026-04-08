---
name: root-diagnosis
description: |
  Diagnosticar antes de agir. O machado afiado corta melhor.
version: 1.0.0
category: research
---

# Root Diagnosis Squad

> Diagnosticar antes de agir. O machado afiado corta melhor.

Squad especializado em diagnosticar problemas reais — causas-raiz, adjacentes, sistemicas e dinamicas ocultas.
Baseado em 13 elite minds com frameworks documentados e skin in the game.

---

## O que faz

Identifica **causas-raiz reais** de qualquer problema usando um pipeline de 13 fases
com 14 agentes especialistas (1 orchestrator + 13 specialists). Cada fase aplica um framework
diferente, construindo uma cadeia causal verificavel do intake ate o relatorio final.
Inclui modelagem de dinamicas sistemicas (feedback loops, archetypes, leverage points)
e avaliacao de viabilidade organizacional.

**Nao resolve problemas. Diagnostica.**

---

## Quando usar

- Problema cronico que resiste a tentativas anteriores de solucao
- Suspeita de que estao tratando sintomas, nao causas
- Multiplos stakeholders com visoes divergentes sobre o problema
- Validacao pre-projeto: confirmar que o problema certo sera resolvido
- Problemas com dinamicas politicas/culturais ocultas
- Sistemas com feedback loops que perpetuam o problema

## Quando NAO usar

- Bug tecnico simples com causa obvia
- Problema ja diagnosticado, precisa apenas de execucao
- Urgencia extrema onde qualquer acao e melhor que nenhuma

---

## Quick Start

### Ativar o squad
```
/RootDiagnosis:agents:root-diagnosis-chief
```

### Diagnostico completo (13 fases, 60-120 min)
```
*diagnose
```

### Diagnostico rapido (8 fases, 35-50 min)
```
*quick-diagnosis
```

### Ativar agente individual
```
/RootDiagnosis:agents:dave-snowden     # Classificar dominio (Cynefin)
/RootDiagnosis:agents:peter-senge      # Dinamicas sistemicas (CLDs, Archetypes)
/RootDiagnosis:agents:stafford-beer    # Viabilidade organizacional (VSM)
/RootDiagnosis:agents:chris-argyris    # Auditar pressupostos
/RootDiagnosis:agents:eli-goldratt     # Diagnostico sistemico (TOC/CRT)
```

---

## Arquitetura

### Pipeline de 13 Fases

```
Phase 0:   Intake & Triage .............. root-diagnosis-chief (13 perguntas)
Phase 1:   Domain Classification ........ dave-snowden (Cynefin)
Phase 1.5: Viability Assessment ......... stafford-beer (VSM) [OPCIONAL — org/business]
Phase 2:   Cultural/Political Diagnosis . edgar-schein (Humble Inquiry) [opcional]
Phase 3:   Assumption Audit ............. chris-argyris (Ladder of Inference)
Phase 3.5: System Dynamics Diagnostic ... peter-senge (CLDs, Archetypes, Meadows)
Phase 4:   Problem Reframing ............ thomas-wedell-wedellsborg + Meadows Purpose Test
       |
       v
  [DECISION POINT 1: Metodo de diagnostico profundo]
  Complicated → Goldratt (CRT) | Complex → Checkland (SSM)
       |
Phase 5:   Deep Diagnosis ............... eli-goldratt OR peter-checkland
       |
  [DECISION POINT 2: Metodo de RCA]
  Isolavel → Kepner-Tregoe (IS/IS NOT) | Cadeia → Dean Gano (Apollo RCA)
       |
Phase 6:   Root Cause Analysis .......... kepner-tregoe OR dean-gano
Phase 7:   Evidence Quantification ...... douglas-hubbard (AIE) [opcional]
Phase 8:   Stress Test .................. gary-klein (PreMortem + Kahneman Bias Audit) [opcional]
Phase 9:   Package for Action ........... min-basadur (Simplex) [opcional]
Phase 10:  Diagnostic Report ............ root-diagnosis-chief
```

### Modos de Execucao

| Modo | Fases | Duracao | Confianca esperada |
|------|-------|---------|-------------------|
| **Quick** | 8 (0,1,3,3.5,4,5,6,10) | 35-50 min | 50-70% |
| **Full** | 13 (0-10 + 1.5, 3.5) | 60-120 min | 70-90% |
| **Deep** | 13 + iteracoes | 240+ min | 85-95% |

### Upgrade Path

Quick pode ser expandido para Full sem perder trabalho:
```
*diagnose --continue-from-quick {slug}
```

---

## Agentes (14)

### Orchestrator
| Agente | Papel |
|--------|-------|
| **root-diagnosis-chief** | Orquestra fluxo, compila relatorio |

### Tier 0 — Foundation (Meta-pensadores)
| Agente | Framework | Papel |
|--------|-----------|-------|
| **dave-snowden** | Cynefin | Classificar dominio do problema |
| **chris-argyris** | Ladder of Inference | Auditar pressupostos e saltos logicos |
| **stafford-beer** | Viable System Model (VSM) | Diagnosticar viabilidade organizacional [OPCIONAL] |
| **peter-senge** | System Dynamics (CLDs, Archetypes, Meadows) | Mapear dinamicas sistemicas, feedback loops, leverage points |

### Tier 1 — Masters (Metodologistas centrais)
| Agente | Framework | Papel |
|--------|-----------|-------|
| **eli-goldratt** | TOC / CRT | Diagnostico sistemico, cadeia causal |
| **kepner-tregoe** | KT Rational Process | Analise forense IS/IS NOT |
| **peter-checkland** | SSM / CATWOE | Problemas mal definidos, multiplos stakeholders |

### Tier 2 — Specialists
| Agente | Framework | Papel |
|--------|-----------|-------|
| **thomas-wedell-wedellsborg** | Frame-Reframe + Meadows Purpose Test | Desafiar enquadramento |
| **dean-gano** | Apollo RCA | Grafos causais verificaveis |
| **gary-klein** | PreMortem / CDM + Kahneman Bias Audit | Validacao cognitiva final |
| **douglas-hubbard** | AIE | Quantificar o inquantificavel |
| **edgar-schein** | Humble Inquiry | Diagnostico cultural/politico |
| **min-basadur** | Simplex CPS | Empacotar para acao |

---

## Estrutura de Arquivos

```
squads/root-diagnosis/
├── config.yaml                    # Configuracao do squad
├── README.md                      # Este arquivo
├── agents/                        # 14 agentes (1 orchestrator + 13 specialists)
│   ├── root-diagnosis-chief.md    # Orchestrator
│   ├── dave-snowden.md            # Tier 0
│   ├── chris-argyris.md           # Tier 0
│   ├── stafford-beer.md           # Tier 0 (NOVO — Phase 1.5)
│   ├── peter-senge.md             # Tier 0 (NOVO — Phase 3.5)
│   ├── eli-goldratt.md            # Tier 1
│   ├── kepner-tregoe.md           # Tier 1
│   ├── peter-checkland.md         # Tier 1
│   ├── thomas-wedell-wedellsborg.md # Tier 2
│   ├── dean-gano.md               # Tier 2
│   ├── gary-klein.md              # Tier 2
│   ├── douglas-hubbard.md         # Tier 2
│   ├── edgar-schein.md            # Tier 2
│   └── min-basadur.md             # Tier 2
├── tasks/                         # 15 tasks executaveis
│   ├── intake-triage.md           # Phase 0
│   ├── classify-domain.md         # Phase 1
│   ├── assess-viability.md        # Phase 1.5 (NOVO)
│   ├── diagnose-culture.md        # Phase 2
│   ├── audit-assumptions.md       # Phase 3
│   ├── model-system-dynamics.md   # Phase 3.5 (NOVO)
│   ├── reframe-problem.md         # Phase 4
│   ├── deep-diagnosis.md          # Phase 5
│   ├── root-cause-analysis.md     # Phase 6
│   ├── quantify-evidence.md       # Phase 7
│   ├── stress-test.md             # Phase 8
│   ├── package-for-action.md      # Phase 9
│   ├── generate-report.md         # Phase 10
│   ├── full-diagnosis.md          # Meta-task: orquestra 13 fases
│   ├── quick-diagnosis.md         # Meta-task: orquestra 8 fases
│   └── start.md                   # Entry point de onboarding
├── workflows/
│   └── wf-root-diagnosis.yaml     # Workflow central
├── templates/
│   └── diagnostic-report-tmpl.md  # Template do relatorio
├── checklists/
│   └── diagnosis-quality-gate.md  # Quality gate (22 criterios, 6 vetos)
└── data/                          # Outputs dos diagnosticos
    └── {problem-slug}/            # 1 diretorio por diagnostico
        ├── intake-brief.md
        ├── domain-classification.md
        ├── viability-assessment.md
        ├── cultural-diagnosis.md
        ├── assumption-audit.md
        ├── system-dynamics-analysis.md
        ├── reframing-analysis.md
        ├── deep-diagnosis.md
        ├── root-cause-analysis.md
        ├── evidence-quantification.md
        ├── stress-test-report.md
        ├── action-package.md
        ├── decision-log.md
        └── DIAGNOSTIC-REPORT-{slug}.md
```

---

## Quality Standards

- **Score minimo para entrega:** 7.0/10
- **Fases obrigatorias:** 0, 1, 3, 3.5, 4, 5, 6, 10
- **Fases opcionais:** 1.5, 2, 7, 8, 9
- **13 Quality Gates** com veto conditions por fase
- **6 Veto Conditions** bloqueantes (independente do score)

---

## Comandos do Chief

| Comando | Descricao |
|---------|-----------|
| `*diagnose` | Pipeline completo (13 fases) |
| `*quick-diagnosis` | Pipeline rapido (8 fases) |
| `*classify` | Classificar dominio (Cynefin) |
| `*viability` | Avaliacao de viabilidade organizacional (VSM) |
| `*systems` | Analise de dinamica sistemica (CLDs, Archetypes) |
| `*reframe` | Reframing do problema |
| `*rca` | Root Cause Analysis |
| `*stress-test` | PreMortem + Bias Audit do diagnostico |
| `*report` | Compilar relatorio final |
| `*status` | Ver progresso do diagnostico atual |
| `*help` | Todos os comandos |

---

## O que mudou na v1.1

| Mudanca | Tipo | Impacto |
|---------|------|---------|
| **Peter Senge** (Phase 3.5) | NOVO agente | CLDs, System Archetypes, Iceberg Model, Meadows Leverage Points |
| **Stafford Beer** (Phase 1.5) | NOVO agente | VSM (S1-S5), Requisite Variety, Recursion [OPCIONAL] |
| **Meadows Purpose Test** (Phase 4) | UPGRADE | Validacao pos-reframing: proposito declarado vs revelado |
| **Kahneman Bias Audit** (Phase 8) | UPGRADE | 8 vieses cognitivos auditados no stress test |
| **Ulrich Boundary Critique** (Phase 0) | UPGRADE | 4 perguntas sobre fronteiras e exclusoes |
| **Hollnagel Safety-II** (Phase 0) | UPGRADE | 1 pergunta sobre condicoes de sucesso |
| Pipeline | 11→13 fases | Quick: 7→8, Full: 11→13 |

---

## O que mudou na v1.2

| Mudanca | Tipo | Impacto |
|---------|------|---------|
| **Objection Algorithms** (todos 14 agentes) | NOVO | 3-4 objecoes domain-specific com respostas no voice_dna de cada expert |
| **chris-argyris.md** Example 3 | FIX | Adicionado output_example faltante (Double-Loop Learning Diagnosis) |
| **Workflow Phases 1.5/3.5** | NORMALIZE | Formato padrao com checkpoint, veto, depends_on, duration, human_review |
| **Template diagnostic-report-tmpl.md** | REORDER | 18 secoes renumeradas em ordem cronologica do pipeline (sem sub-secoes 4.5/4.6) |
| **Quality Gate checklist** | FIX | Contagem correta: B=7, C=6, Total=22 criterios. Veto V2 inclui Phase 3.5 |
| **start.md** | UPDATE | Referencias atualizadas (13 fases, 14 agentes, 8 fases quick) + secao Inputs formal |
| Versionamento | ALIGN | Todos artefatos alinhados em v1.2.0 |

---

*Root Diagnosis Squad v1.2.0 — Synkra AIOS*
*13 fases, 14 agentes, 2 decision points, 22 quality criteria, 6 veto conditions*
*"Clone minds > create bots"*
