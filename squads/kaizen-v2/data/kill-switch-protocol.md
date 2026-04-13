# Kill Switch Protocol — Agent Governance

**Fonte**: Whitepaper "Orquestração Multi-Agente" (Lozano, 2026) — Cap. 11
**Referência**: `docs/research/2026-03-05-multiagent-orchestration-whitepaper/`

## Propósito

Protocolo formal para interromper agentes que entram em loops destrutivos,
consomem recursos excessivos, ou produzem outputs incorretos de forma
persistente.

## 5 Camadas de Governança (Concêntricas)

As camadas são aplicadas de dentro para fora. Se a camada interna não
resolver, escalar para a próxima.

### Camada 1: Limites (Preventiva)

Configuração estática que impede comportamento anômalo antes de ocorrer.

| Limite | Valor Recomendado | Onde Aplicar |
|--------|-------------------|--------------|
| Max iterações por task | 5 | `veto_conditions` em tasks |
| Max tokens por execução | 100K | Config do agente |
| Max arquivos modificados por commit | 100 | `.claude/rules/git-media-commits.md` |
| Max tempo de execução | 15 min | Timeout em scripts |
| Max tentativas de fix | 3 | `recovery.maxAttempts` em agent config |

### Camada 2: Gates (Reativa)

Quality gates que bloqueiam progressão se critérios não forem atendidos.

| Gate | Condição de Bloqueio | Ação |
|------|---------------------|------|
| Veto Condition | Condição de veto ativada na task | BLOQUEAR execução, notificar |
| QA Gate | FAIL no qa-gate.md | Retornar para @dev com feedback |
| Self-Critique | Checklist score < threshold | REDO step antes de avançar |
| Regression Guard | Testes falhando após mudança | ROLLBACK automático |

### Camada 3: Trilha de Auditoria (Observabilidade)

Registro completo de ações para análise post-mortem.

| Artefato | Localização | Conteúdo |
|----------|------------|----------|
| Decision Log | `.ai/decision-log-{story-id}.md` | Decisões autônomas com rationale |
| Git Log | `git log --oneline` | Histórico de commits |
| Recovery Tracker | `.aiox/recovery/attempts.json` | Tentativas de implementação |
| QA Loop Status | `qa/loop-status.json` | Iterações de review |

### Camada 4: Interrupção (Emergencial)

Mecanismos para parar agentes em execução.

| Trigger | Condição | Ação |
|---------|----------|------|
| Stuck Detection | 3 tentativas falhadas consecutivas | HALT + notificar usuário |
| Loop Detection | Mesmo erro 3x em sequência | HALT + sugerir abordagem alternativa |
| Budget Exceeded | Tokens > limite configurado | KILL processo |
| Human Interrupt | Usuário envia *stop ou *exit | Graceful shutdown |

### Camada 5: Permissões (Estrutural)

Restrições de acesso que impedem ações fora do escopo do agente.

| Agente | Permitido | Bloqueado |
|--------|-----------|-----------|
| @dev | `git add/commit/diff/log` | `git push`, `gh pr create` |
| @qa | Ler código, executar testes | Modificar código de produção |
| @sm | Criar/editar stories | Implementar código |
| @devops | `git push`, criar PRs | Modificar lógica de negócio |

Referência completa: `.claude/rules/agent-authority.md`

## Protocolo de Escalação

```text
Agente detecta problema
  → Camada 1: Limite atingido?
    → SIM: Parar automaticamente
    → NÃO: Continuar
  → Camada 2: Gate falhou?
    → SIM: Retornar ao step anterior com feedback
    → NÃO: Continuar
  → Camada 3: Registrar ação no audit trail
  → Camada 4: Loop ou stuck detectado?
    → SIM: HALT + notificar usuário
    → NÃO: Continuar
  → Camada 5: Ação está dentro do escopo?
    → SIM: Executar
    → NÃO: BLOQUEAR + redirecionar ao agente correto
```

## Aplicação no Projeto

### Agentes com Kill Switch Ativo

- **@dev em YOLO mode**: `recovery.maxAttempts = 3`, stuck detection ativo
- **QA Loop**: `maxIterations = 5`, escalação automática em BLOCKED
- **CodeRabbit Self-Healing**: `max_iterations = 2`, HALT se CRITICAL persiste
- **Build Autonomous**: Checkpoints a cada step, resume possível

### Sinais de Alerta (Monitorados pelo Kaizen)

| Sinal | Threshold | Ação |
|-------|-----------|------|
| Rework rate > 30% | 2 sprints consecutivos | Investigar causa raiz |
| QA loop > 3 iterações frequente | > 50% das stories | Revisar qualidade de stories |
| Recovery attempts > 2 por task | Média do squad | Revisar complexidade de tasks |
| Agent switching > 5x por story | Contagem por story | Revisar boundaries de agentes |

## Referências

- Whitepaper cap. 11: "Mecanismos de Qualidade e Segurança"
- Whitepaper cap. 15: "Triângulo Autonomia-Contexto-Controle"
- `.claude/rules/agent-authority.md`: Delegation Matrix
- `.claude/rules/workflow-execution.md`: Workflow execution rules
