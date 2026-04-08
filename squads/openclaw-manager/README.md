---
name: openclaw-manager
description: |
  Camada de orquestração unificada que conecta os 3 squads OpenClaw (setup, skill-factory, ops) num pipeline E2E.
version: 1.0.0
category: development
---

# OpenClaw Manager — Fleet Orchestrator

Camada de orquestração unificada que conecta os 3 squads OpenClaw (setup, skill-factory, ops) num pipeline E2E.

## O que faz

Pipeline completo de gestão de claws: **Memory Extraction → Credentials → Setup → Skills → Go-Live → Monitoring**.

- Provisiona novos claws do zero até operacional
- Audita e remedia claws existentes (brownfield upgrade)
- Monitora saúde de toda a frota em tempo real
- Gerencia ciclo de vida de skills (criar, deployar, rastrear, aposentar)
- Operações diárias automatizadas com alertas

## Agentes

| Agente | Papel | Escopo |
|--------|-------|--------|
| `openclaw-chief` | Orquestrador | Roteia comandos, coordena pipeline E2E, delega para especialistas |
| `claw-provisioner` | Especialista | Coleta credenciais, valida conexões, executa auditoria SSH (brownfield) |
| `fleet-monitor` | Especialista | Health check de toda a frota, alertas, relatórios de status |
| `skill-ops` | Especialista | Ciclo de vida de skills — criar, deployar, inventário, aposentar |

## Comandos

| Comando | Descrição |
|---------|-----------|
| `*provision {nome}` | Provisionar novo claw E2E |
| `*upgrade {nome}` | Auditar + remediar claw existente |
| `*fleet-status` | Status de todos os claws ativos |
| `*health-check` | Health check de toda a frota |
| `*add-skill {claw} {skill}` | Adicionar skill a um claw |
| `*inventory` | Inventário de skills deployadas |
| `*daily-ops` | Operações diárias da frota |
| `*credentials {claw}` | Recoletar credenciais |

## Workflows

| Workflow | Descrição |
|----------|-----------|
| `wf-provision` | Pipeline completo: intake → credentials → setup → skills → go-live |
| `wf-brownfield-upgrade` | Auditoria SSH 6 dimensões + remediação priorizada por waves |
| `wf-daily-fleet` | Rotina diária: health check → inventory → sync → alertas → report |

## Squads Delegados

O Manager orquestra, estes squads executam:

- **openclaw-setup** — Identidade, infra, memória, sistema imunológico
- **openclaw-skill-factory** — Criação, teste e deploy de skills
- **openclaw-ops** — Operações diárias, ClickUp, sync com VPS

## Infraestrutura

- **Fleet Registry:** Supabase (`openclaw_fleet` + `openclaw_skills`)
- **Credenciais:** `~/.openclaw/{claw-name}/.env` (chmod 600, nunca em git)
- **Templates:** BOOT, AGENTS, IDENTITY, USER, SOUL, memory-extraction-prompt

## Regras Invioláveis

1. Sem credenciais validadas = sem setup (VT-OC-007)
2. Credencial hardcoded = VETO CRÍTICO (VT-OC-008)
3. Criar arquivo via heredoc no VPS = VETO — sempre local + SCP (VT-OC-009)
4. Handoff manual entre squads = VETO — tudo automatizado (VT-OC-006)
5. Claw sem SOUL.md = chatbot genérico (VT-OC-002)
