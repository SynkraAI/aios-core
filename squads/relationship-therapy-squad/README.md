---
name: relationship-therapy-squad
description: |
  Squad de 11 terapeutas especializados em relacionamentos. Cada agente é um clone fiel de um especialista real do mundo — com Voice DNA, Thinking DNA e frameworks terapêuticos completos.
version: 1.0.0
category: research
---

# Relationship Therapy Squad

Squad de 11 terapeutas especializados em relacionamentos. Cada agente é um clone fiel de um especialista real do mundo — com Voice DNA, Thinking DNA e frameworks terapêuticos completos.

## Como Usar

```
@lead-therapist          # Sofia faz triagem e direciona
@lead-therapist *consult # Iniciar consulta com triagem
@lead-therapist *session # Sessão completa multi-especialista

# Acesso direto a especialistas:
@gottman                 # Conflito, comunicação, Four Horsemen
@sue-johnson             # Vínculo emocional, EFT, apego
@esther-perel            # Desejo, erotismo, infidelidade
@terry-real              # Confronto amoroso, masculinidade, RLT
@rosenberg               # Comunicação não-violenta, CNV
@amir-levine             # Estilos de apego, dating
@dr-ramani               # Narcisismo, relações tóxicas
@brene-brown             # Vulnerabilidade, vergonha, coragem
@deb-dana                # Sistema nervoso, teoria polivagal
@emily-nagoski           # Desejo sexual, sexualidade
```

## Agentes

| Agente | Persona | Especialidade | Framework Principal |
|---|---|---|---|
| @lead-therapist | Sofia | Triagem e coordenação | Triage Matrix |
| @gottman | Dr. John | Conflito e comunicação | Four Horsemen, Sound Relationship House |
| @sue-johnson | Dra. Sue | Vínculo emocional e apego | EFT, Hold Me Tight, Demon Dialogues |
| @esther-perel | Esther | Desejo e erotismo | Erotic Intelligence, Security vs Adventure |
| @terry-real | Terry | Confronto amoroso, masculinidade | RLT, 5 Losing Strategies, Adaptive Child |
| @rosenberg | Marshall | Comunicação compassiva | CNV 4 Componentes, Necessidades Universais |
| @amir-levine | Dr. Amir | Estilos de apego adulto | Secure/Anxious/Avoidant, Protest Behaviors |
| @dr-ramani | Dra. Ramani | Narcisismo e relações tóxicas | DARVO, DEEP, SHINE, Abuse Cycle |
| @brene-brown | Brene | Vulnerabilidade e vergonha | BRAVING Trust, Shame Resilience, Rumble |
| @deb-dana | Deb | Sistema nervoso | Polyvagal Ladder, Glimmers, Co-regulation |
| @emily-nagoski | Emily | Desejo sexual e sexualidade | Dual Control Model, Responsive Desire |

## Fluxo de Consulta

```
Você → Sofia (triagem) → Especialista(s) → Sofia (integração) → Plano de Ação
```

## Quando Chamar Quem

| Situação | Especialista |
|---|---|
| "Brigamos muito" | @gottman |
| "Não me sinto conectado/a" | @sue-johnson |
| "Perdemos o desejo" | @esther-perel |
| "Ele não se abre" | @terry-real |
| "Não sei como falar sobre isso" | @rosenberg |
| "Tenho medo de abandono" | @amir-levine |
| "Acho que ele/a é narcisista" | @dr-ramani |
| "Tenho vergonha de me abrir" | @brene-brown |
| "Tenho crises de ansiedade" | @deb-dana |
| "Não tenho vontade de sexo" | @emily-nagoski |

## Estrutura

```
relationship-therapy-squad/
  squad.yaml
  README.md
  agents/
    lead-therapist.md    # Sofia - Coordenadora
    gottman.md           # Dr. John - Conflito
    sue-johnson.md       # Dra. Sue - EFT
    esther-perel.md      # Esther - Desejo
    terry-real.md        # Terry - RLT
    rosenberg.md         # Marshall - CNV
    amir-levine.md       # Dr. Amir - Apego
    dr-ramani.md         # Dra. Ramani - Narcisismo
    brene-brown.md       # Brene - Vulnerabilidade
    deb-dana.md          # Deb - Polivagal
    emily-nagoski.md     # Emily - Sexualidade
  tasks/
    consult.md           # Consulta com triagem
    triage.md            # Triagem de especialista
    session.md           # Sessão completa
    assessment.md        # Avaliação relacional
  workflows/
    therapy-session.md   # Workflow da sessão
    quick-consult.md     # Consulta rápida (15 min)
    crisis-intervention.md # Intervenção em crise
  checklists/
    session-quality.md   # Qualidade da sessão (10 itens)
  templates/
    session-report.md    # Template de relatório
  data/
```

## Idioma

Todos os agentes respondem em **português (pt-BR)** por padrão.

## Baseado Em

Cada agente foi construído a partir de deep research dos especialistas reais:
- Entrevistas, podcasts e palestras transcritas
- Livros e obras publicadas
- Frameworks e metodologias documentadas
- Estilo de comunicação e vocabulário extraído (Voice DNA)
- Processo diagnóstico e modelos mentais mapeados (Thinking DNA)
