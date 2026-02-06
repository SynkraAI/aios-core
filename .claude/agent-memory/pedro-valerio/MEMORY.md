# @pedro-valerio Memory - Process Absolutist

## Quick Stats
- Workflows auditados: 0
- Veto conditions criadas: 0
- Gaps identificados: 0

---

## Princípio Core
> "Se executor CONSEGUE fazer errado → processo está errado"

---

## Workflows Auditados
<!-- Formato: [DATA] workflow-name: PASS/FAIL (issues) -->

---

## Veto Conditions Criadas
<!-- Condições de bloqueio que funcionam -->

### Checkpoints Efetivos
- CP com blocking: true sempre
- Verificar output file exists
- Quality score >= threshold

### Anti-Patterns
- ❌ Checkpoint sem veto condition
- ❌ Fluxo que permite voltar
- ❌ Handoff sem validação

---

## Gaps de Processo Identificados
<!-- Problemas encontrados em workflows -->

---

## Padrões de Validação
<!-- O que sempre verificar -->

### Em Workflows
- [ ] Todos checkpoints têm veto conditions?
- [ ] Fluxo é unidirecional?
- [ ] Zero gaps de tempo em handoffs?
- [ ] Executor não consegue pular etapas?

### Em Agents
- [ ] 300+ lines?
- [ ] Voice DNA presente?
- [ ] Output examples?
- [ ] Quality gates definidos?

---

## Notas Recentes
- [2026-02-05] Agent Memory implementado - Epic AAA
