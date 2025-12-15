# STORY 6.3: isolated-vm macOS Compatibility Investigation

**ID:** 6.3 | **Epic:** Technical Debt / Infrastructure
**Sprint:** 6 | **Points:** 3 | **Priority:** 🟡 Medium | **Created:** 2025-12-08
**Updated:** 2025-12-08
**Status:** 📋 Ready for Development

**Backlog Reference:** ID 1733427600002

---

## Problem Statement

A biblioteca `isolated-vm` causa SIGSEGV (segmentation fault) no macOS com Node.js 18.x e 20.x:

```
SIGSEGV crash in isolated-vm library
Platform: macOS
Node versions affected: 18.x, 20.x
Node versions working: 22.x
```

**Workaround Atual:**
- macOS Node 18.x/20.x excluídos do CI matrix
- macOS Node 22.x ainda executa e passa

**Impacto:**
- Usuários macOS com Node 18.x/20.x podem ter crashes
- CI não valida compatibilidade completa com macOS
- Potencial blocker para adoção

---

## User Story

**Como** desenvolvedor usando macOS,
**Quero** que o AIOS-FULLSTACK funcione em todas as versões LTS do Node.js,
**Para que** eu possa desenvolver sem crashes ou limitações de versão.

---

## Scope

### In Scope

| Feature | Description |
|---------|-------------|
| Root Cause Analysis | Identificar módulo que depende de isolated-vm |
| Version Testing | Testar com latest isolated-vm |
| Alternative Evaluation | Avaliar vm2, quickjs, built-in vm |
| Recommendation | Documentar solução recomendada |
| CI Update | Atualizar matrix se solução encontrada |

### Out of Scope

- Reescrever sandbox system completo
- Suporte a versões não-LTS do Node.js
- Windows/Linux investigation (funciona)

---

## Acceptance Criteria

### AC6.3.1: Root Cause Identificada
- [ ] Módulo AIOS que depende de isolated-vm identificado
- [ ] Propósito do uso de isolated-vm documentado
- [ ] Stack trace do SIGSEGV capturado

### AC6.3.2: Version Testing
- [ ] Testar com `isolated-vm@latest`
- [ ] Testar com `isolated-vm@4.x` (se diferente)
- [ ] Documentar resultados em cada combinação OS/Node

### AC6.3.3: Alternatives Evaluated
- [ ] `vm2` avaliado (segurança, performance, compatibilidade)
- [ ] `quickjs` avaliado (se aplicável)
- [ ] Node.js built-in `vm` avaliado
- [ ] Tabela comparativa criada

### AC6.3.4: Recommendation Documented
- [ ] Solução recomendada documentada
- [ ] Trade-offs explicados
- [ ] Migration path se necessário

### AC6.3.5: CI Updated (se solução funcionar)
- [ ] macOS 18.x/20.x re-adicionados ao matrix
- [ ] OU documentação de limitação permanente

---

## Technical Design

### 1. Investigation Steps

```bash
# Find isolated-vm usage in codebase
grep -r "isolated-vm" --include="*.js" --include="*.json"

# Check package.json dependencies
npm ls isolated-vm

# Find which module imports it
grep -r "require.*isolated-vm" --include="*.js"
grep -r "from.*isolated-vm" --include="*.js"
```

### 2. Test Matrix

| OS | Node | isolated-vm@latest | vm2 | built-in vm |
|----|------|-------------------|-----|-------------|
| macOS | 18.x | ❌ SIGSEGV | ? | ? |
| macOS | 20.x | ❌ SIGSEGV | ? | ? |
| macOS | 22.x | ✅ Works | ? | ? |
| Ubuntu | 18.x | ✅ Works | N/A | N/A |
| Ubuntu | 20.x | ✅ Works | N/A | N/A |
| Ubuntu | 22.x | ✅ Works | N/A | N/A |

### 3. Alternative Libraries

| Library | Pros | Cons | Security |
|---------|------|------|----------|
| `isolated-vm` | True isolation, fast | macOS issues | High |
| `vm2` | Good compatibility | Deprecated? | Medium |
| `quickjs` | Lightweight | Different API | High |
| `vm` (built-in) | No deps | Not truly isolated | Low |

### 4. Potential Solutions

**Option A: Update isolated-vm**
```bash
npm update isolated-vm
# Test on macOS 18.x/20.x
```

**Option B: Replace with vm2**
```javascript
// Before
const ivm = require('isolated-vm');
// After
const { VM } = require('vm2');
```

**Option C: Use built-in vm with restrictions**
```javascript
const vm = require('vm');
const context = vm.createContext({ /* safe globals */ });
```

**Option D: Conditional loading**
```javascript
const sandbox = process.platform === 'darwin' &&
                parseInt(process.version.slice(1)) < 22
  ? require('./vm-fallback')
  : require('isolated-vm');
```

---

## Implementation Tasks

### Phase 1: Discovery (1h)
- [ ] Find all isolated-vm usages
- [ ] Understand why it's used (sandbox, security, etc.)
- [ ] Check isolated-vm GitHub issues for macOS reports

### Phase 2: Testing (1.5h)
- [ ] Test latest isolated-vm on macOS 18.x/20.x
- [ ] If still fails, test alternatives
- [ ] Document results

### Phase 3: Evaluation (1h)
- [ ] Compare alternatives on:
  - Security isolation level
  - Performance
  - API compatibility
  - Maintenance status
- [ ] Create recommendation

### Phase 4: Documentation (0.5h)
- [ ] Write findings document
- [ ] Update CI if solution works
- [ ] Create follow-up story if migration needed

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| No fix available | Medium | Document limitation, recommend Node 22.x |
| Alternative less secure | High | Evaluate security implications carefully |
| Breaking change | High | Feature flag for gradual rollout |

---

## Test Scenarios

1. **Run AIOS on macOS + Node 18.x** → Should not SIGSEGV
2. **Run AIOS on macOS + Node 20.x** → Should not SIGSEGV
3. **Sandbox execution** → Should still work securely
4. **CI matrix** → All jobs should pass

---

## Definition of Done

- [ ] Root cause documented
- [ ] At least 2 alternatives evaluated
- [ ] Recommendation documented with trade-offs
- [ ] Either:
  - CI matrix restored for macOS 18.x/20.x, OR
  - Limitation documented with workaround

---

## References

- `isolated-vm` repo: https://github.com/nicolo-ribaudo/isolated-vm
- CI workflow: `.github/workflows/cross-platform-tests.yml`
- Related issue: macOS SIGSEGV in CI
- PR #27: Workaround applied (matrix exclusion)

---

## File List

*To be updated during implementation*

| File | Action | Status |
|------|--------|--------|
| `.github/workflows/cross-platform-tests.yml` | Update matrix | 📋 Pending |
| `docs/architecture/sandbox-system.md` | Document findings | 📋 Pending |
| `package.json` | Update deps if needed | 📋 Pending |

---

*Story created by @po (Pax) - 2025-12-08*
*Backlog item: 1733427600002*
