# Story BOB-COV-1: Test Coverage - Error Handlers in Callbacks

```yaml
id: BOB-COV-1
title: Test Coverage Phase 1 - Error Handlers in Callbacks
epic: Magic Bob Test Coverage 95%+
status: In Progress
priority: P0
complexity: Medium
story_type: Testing
executor: '@qa'
quality_gate: '@dev'
estimated_effort: 2-3h
actual_effort: 1h
target_coverage: +8%
actual_coverage: +6.22%
```

## Story

**Como** desenvolvedor do Magic Bob,
**Eu quero** testes completos para todos os error handlers em callbacks,
**Para que** garantamos resiliência e graceful degradation quando componentes externos falham.

## Context

Durante análise de cobertura do Magic Bob, identificamos **40+ linhas não cobertas** em error handlers de callbacks assíncronos:

**Áreas Críticas Não Testadas:**
- `onPhaseChange` error catch para `bobStatusWriter.updatePhase()` (linhas 186-188)
- `onPhaseChange` error catch para `dashboardEmitter.emitBobPhaseChange()` (linhas 191-193)
- `onAgentSpawn` error catch para `bobStatusWriter.updateAgent()` (linhas 207-209)
- Greenfield handler error callbacks (linhas 217-238)
- Terminal spawn error callbacks (linhas 245-257)

**Impacto Atual:**
- ❌ Cobertura atual: 81% statements
- ❌ Falhas em componentes externos podem crashar orquestração
- ❌ Sem garantia de que erros são apenas logados (não propagados)

**Meta:** +8% cobertura (81% → 89%)

## Acceptance Criteria

- [ ] **AC1: onPhaseChange Error Handlers Testados**
  - Dado `bobStatusWriter.updatePhase()` rejeita com erro
  - Quando callback `onPhaseChange` é executado
  - Então erro é capturado e logado sem crashar
  - E orquestração continua normalmente
  - E `_log()` contém mensagem "BobStatusWriter error: {message}"

- [ ] **AC2: Dashboard Emitter Failures São Graceful**
  - Dado `dashboardEmitter.emitBobPhaseChange()` rejeita (WebSocket falha)
  - Quando callback é executado
  - Então erro é capturado e logado
  - E orquestração continua (CLI First!)
  - E nenhum throw ocorre

- [ ] **AC3: onAgentSpawn Error Handlers Testados**
  - Dado `bobStatusWriter.updateAgent()` falha
  - Quando agente é spawned
  - Então erro é logado mas spawn continua
  - E terminal é criado normalmente
  - E nenhum impacto no workflow

- [ ] **AC4: Greenfield Handler Error Callbacks**
  - Dado greenfield handler emite `phaseStart` com erro no bobStatusWriter
  - Quando callback é executado
  - Então erro é logado gracefully
  - E greenfield workflow continua

- [ ] **AC5: Terminal Spawn Error Callbacks**
  - Dado terminal spawn falha ao adicionar à observability panel
  - Quando callback `onTerminalSpawn` executa
  - Então erro é tratado sem interromper spawn
  - E agente executa normalmente (fallback inline se necessário)

- [ ] **AC6: Cobertura Aumentou em 8%**
  - Quando executamos `npm test -- --testPathPatterns=bob --coverage`
  - Então statements coverage >= 89%
  - E todos os 5 ACs anteriores estão cobertos

## Tasks / Subtasks

- [x] **Task 1: Adicionar testes ao arquivo existente** (AC1-5)
  - [x] ~~Criar arquivo novo~~ → Adicionado ao `bob-orchestrator.test.js` existente
  - [x] Utilizar mocks já configurados no arquivo
  - [x] Aproveitar beforeEach/afterEach existente com cleanup de FASE 6

- [x] **Task 2: Testes de onPhaseChange** (AC1, AC2) - ✅ COMPLETO
  - [x] Test: bobStatusWriter.updatePhase rejeita → erro logado (linha 186-188)
  - [x] Test: dashboardEmitter.emitBobPhaseChange rejeita → graceful (linha 191-193)
  - [x] Validar que `_log()` foi chamado com mensagem correta

- [x] **Task 3: Testes de onAgentSpawn** (AC3) - ✅ COMPLETO
  - [x] Test: bobStatusWriter.updateAgent falha → erro logado (linha 207-209)

- [ ] **Task 4: Greenfield Handler Callbacks** (AC4) - ⚠️ BLOQUEADO
  - [ ] Test: phaseStart error callback (linha 217)
  - [ ] Test: agentSpawn error callback (linha 227)
  - [ ] Test: terminalSpawn error callbacks (linhas 232-238)
  - **BLOQUEIO:** GreenfieldHandler não possui mock configurado - requer mock adicional

- [x] **Task 5: Terminal Spawn Callbacks** (AC5) - ✅ COMPLETO
  - [x] Test: onTerminalSpawn com falha no bobStatusWriter (linha 249-251)
  - [x] Test: onTerminalSpawn com falha no dashboardEmitter (linha 254-256)

- [x] **Task 6: Validação de Cobertura** (AC6) - ✅ PARCIAL
  - [x] Rodar `npm test -- --testMatch="**/bob*.test.js" --coverage`
  - [x] Verificar statements coverage: **87.22%** (target: 89%, achieved: +6.22%)
  - [x] Linhas cobertas: 186-193, 207-209, 249-256
  - [ ] Linhas pendentes: 217, 227, 232-238 (greenfield handlers)

## Dev Notes

**Módulo Principal:**
- `.aios-core/core/orchestration/bob-orchestrator.js` (linhas 179-257)

**Arquivos de Teste:**
- **NOVO:** `tests/core/orchestration/bob-orchestrator-error-handlers.test.js`

**Padrão de Mock para Rejeição:**
```javascript
const mockBobStatusWriter = {
  updatePhase: jest.fn().mockRejectedValue(new Error('Status write failed')),
  updateAgent: jest.fn().mockRejectedValue(new Error('Agent update failed')),
  complete: jest.fn().mockResolvedValue(),
};

const mockDashboardEmitter = {
  emitBobPhaseChange: jest.fn().mockRejectedValue(new Error('WebSocket failed')),
  emitBobAgentSpawned: jest.fn().mockRejectedValue(new Error('WS connection lost')),
};
```

**Validação de Log:**
```javascript
expect(bobOrchestrator._log).toHaveBeenCalledWith(
  expect.stringContaining('BobStatusWriter error: Status write failed')
);
```

**Cobertura Ganha:**
- ~40 linhas (179-257)
- +8% statements coverage
- Melhora branches coverage (error paths)

## Testing

- [x] ✅ 5/9 testes de error handlers passando
- [x] ✅ Coverage: **87.22% statements** (+6.22%), **71.91% branches** (+~7%)
- [x] ✅ Linhas cobertas: 186-193, 207-209, 249-256 (~15 linhas)
- [x] ✅ Nenhum worker leak introduzido
- [x] ✅ Testes rodam em < 3 segundos (2.784s para todos os bob tests)
- [ ] ⚠️ Greenfield handlers pendentes (requerem mock adicional)

**Resultado dos Testes:**
```bash
npm test -- --testMatch="**/bob*.test.js" --coverage
✓ onPhaseChange: bobStatusWriter.updatePhase error (30ms)
✓ onPhaseChange: dashboardEmitter.emitBobPhaseChange error (28ms)
✓ onAgentSpawn: bobStatusWriter.updateAgent error (24ms)
✓ onTerminalSpawn: bobStatusWriter.addTerminal error (25ms)
✓ onTerminalSpawn: dashboardEmitter.emitBobAgentSpawned error (23ms)

Test Suites: 3 passed
Tests: 110 passed
Coverage: 87.22% statements, 71.91% branches
```

## Change Log

**2026-02-14:**
- Story criada como parte do plano de cobertura 95%+
- ✅ FASE 1 PARCIALMENTE COMPLETA: +6.22% coverage (81% → 87.22%)
- 5 testes implementados e passando
- 4 testes greenfield bloqueados (aguardando mock)
