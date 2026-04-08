---
name: negotiation
description: |
  Squad de 8 elite minds reais para o pipeline completo de negociacao profissional. Desde a analise do perfil psicologico do comprador ate o fechamento estrategico, cada agente tem um framework docum...
version: 1.0.0
category: business
---

# Negotiation Squad

## Overview

Squad de 8 elite minds reais para o pipeline completo de negociacao profissional.
Desde a analise do perfil psicologico do comprador ate o fechamento estrategico,
cada agente tem um framework documentado, testado em milhares de negociacoes reais.

## Purpose

Este squad transforma qualquer negociacao em um processo estruturado e previsivel.
Em vez de "improvisar", voce usa frameworks testados por negociadores do FBI,
pesquisadores de Harvard, e profissionais que fecharam bilhoes em deals.

## When to Use This Squad

Use **negotiation** quando quiser:

- Definir e precificar seu produto/servico
- Analisar o perfil psicologico do comprador (Buyer DNA)
- Encontrar os clientes ideais (Dream 100)
- Criar planos de prospecao multi-canal
- Montar um pitch com frame control
- Conduzir discovery meetings com SPIN Selling
- Negociar termos com tactical empathy
- Fechar deals estrategicamente
- Planejar negociacoes complexas
- Lidar com objecoes especificas

## The Expert Team

```
Pipeline Phase    Expert              Framework
─────────────────────────────────────────────────────────────
Profile Buyer   → 🧠 Robert Cialdini  → 7 Principles of Influence
Find Clients    → 🎯 Chet Holmes      → Dream 100 Strategy
Prospect        → 📞 Jeb Blount       → Fanatical Prospecting
Pitch           → 🎬 Oren Klaff       → STRONG Method + Frame Control
Discover        → 🔍 Neil Rackham     → SPIN Selling (35K+ calls research)
Negotiate       → 🎯 Chris Voss       → Tactical Empathy (FBI)
Close           → ⚔️ Jim Camp          → Start With No System
Advisor         → 🕊️ William Ury       → Principled Negotiation (Harvard)
Orchestrator    → 🤝 Deal Architect    → Routes to right expert per phase
```

## What's Included

### Agents (9)
| Agent | Expert | Framework | Phase |
|-------|--------|-----------|-------|
| `negotiation-chief` | Deal Architect | Pipeline Orchestration | All |
| `robert-cialdini` | Robert Cialdini | 7 Principles of Influence | Profile |
| `chet-holmes` | Chet Holmes | Dream 100 Strategy | Find |
| `jeb-blount` | Jeb Blount | Fanatical Prospecting | Contact |
| `oren-klaff` | Oren Klaff | STRONG Method | Pitch |
| `neil-rackham` | Neil Rackham | SPIN Selling | Discover |
| `chris-voss` | Chris Voss | Tactical Empathy | Negotiate |
| `jim-camp` | Jim Camp | Start With No | Close |
| `william-ury` | William Ury | Principled Negotiation | Advisor |

### Tasks (10)
| Task | Purpose | Expert |
|------|---------|--------|
| `define-offer` | Define product/service and pricing | Chief |
| `profile-buyer` | Analyze buyer psychology | Cialdini |
| `identify-dream-clients` | Build Dream 100 prospect list | Holmes |
| `prospect-outreach` | Multi-channel prospecting plan | Blount |
| `create-pitch` | STRONG method pitch creation | Klaff |
| `spin-discovery` | Discovery session with SPIN questions | Rackham |
| `negotiate-deal` | Tactical negotiation playbook | Voss |
| `close-deal` | Strategic closing plan | Camp |
| `plan-negotiation` | Full strategy with BATNA | Ury |
| `handle-objection` | Route objection to right framework | Chief |

### Workflows (2)
| Workflow | Purpose |
|----------|---------|
| `wf-full-pipeline` | End-to-end: Define → Profile → Find → Contact → Pitch → Discover → Negotiate → Close |
| `wf-negotiate-deal` | Focused: Profile → Strategy → Negotiate → Close |

### Templates (3)
| Template | Purpose |
|----------|---------|
| `buyer-profile-tmpl` | Buyer DNA profile with influence levers |
| `negotiation-plan-tmpl` | Complete negotiation strategy document |
| `proposal-tmpl` | Professional proposal with anchoring |

### Checklists (2)
| Checklist | Purpose |
|-----------|---------|
| `deal-readiness` | 25-point readiness check before negotiation |
| `negotiation-prep` | Quick 15-minute pre-meeting prep |

## Usage Examples

### Start the Squad
```
/negotiation:negotiation-chief
```

### Quick: Handle an Active Negotiation
```
*negotiate-deal
→ Builds a Chris Voss tactical playbook with accusation audits,
  calibrated questions, labels, and Ackerman bargaining plan
```

### Full Pipeline for New Business
```
*full-pipeline
→ Guides you through all 8 phases from offer definition to closing
```

### Specific Expert for Specific Need
```
/negotiation:chris-voss     → Direct access to tactical negotiation
/negotiation:neil-rackham    → SPIN discovery session
/negotiation:oren-klaff      → Pitch creation with frame control
```

## Squad Structure

```
squads/negotiation/
├── agents/
│   ├── negotiation-chief.md     # 🤝 Orchestrator
│   ├── robert-cialdini.md       # 🧠 Buyer Psychology
│   ├── chet-holmes.md           # 🎯 Dream 100
│   ├── jeb-blount.md            # 📞 Prospecting
│   ├── oren-klaff.md            # 🎬 Pitching
│   ├── neil-rackham.md          # 🔍 SPIN Discovery
│   ├── chris-voss.md            # 🎯 Tactical Negotiation
│   ├── jim-camp.md              # ⚔️ Strategic Closing
│   └── william-ury.md           # 🕊️ Strategic Advisor
├── tasks/
│   ├── define-offer.md
│   ├── profile-buyer.md
│   ├── identify-dream-clients.md
│   ├── prospect-outreach.md
│   ├── create-pitch.md
│   ├── spin-discovery.md
│   ├── negotiate-deal.md
│   ├── close-deal.md
│   ├── plan-negotiation.md
│   └── handle-objection.md
├── workflows/
│   ├── wf-full-pipeline.yaml
│   └── wf-negotiate-deal.yaml
├── templates/
│   ├── buyer-profile-tmpl.md
│   ├── negotiation-plan-tmpl.md
│   └── proposal-tmpl.md
├── checklists/
│   ├── deal-readiness.md
│   └── negotiation-prep.md
├── config.yaml
├── squad.yaml
└── README.md
```

## Key Features

1. **Full Pipeline Coverage** — From offer definition to deal closing, every phase has a dedicated expert
2. **Buyer DNA Profiling** — Cialdini's 7 Principles analyze buyer psychology before any interaction
3. **Research-Backed** — Every framework is documented and tested (SPIN: 35K+ calls, Voss: 150+ hostage cases)
4. **Framework-Matched Objection Handling** — Routes each objection to the right expert methodology
5. **Templates & Checklists** — Ready-to-use documents for proposals, negotiation plans, and prep

## Getting Started

1. Activate: `/negotiation:negotiation-chief`
2. Start with: `*define-offer` if you have a product/service to sell
3. Or jump to: `*negotiate-deal` if you have an active negotiation
4. Or run: `*full-pipeline` for the complete end-to-end experience

---

**Ready to close better deals? Let's negotiate.**

_Version: 1.0.0_
