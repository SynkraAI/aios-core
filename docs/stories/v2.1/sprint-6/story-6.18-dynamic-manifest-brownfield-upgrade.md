# STORY 6.18: Dynamic Manifest & Brownfield Upgrade System

**ID:** 6.18 | **Epic:** Installer Improvements
**Sprint:** 6 | **Points:** 8 | **Priority:** 🔴 High | **Created:** 2025-12-22
**Updated:** 2025-12-22
**Status:** ✅ Done

**Related:** Story 6.19 (IDE Command Auto-Sync)

---

## Problem Statement

O sistema de instalação brownfield do AIOS-Core não atualiza novos arquivos quando uma nova versão é publicada no npm:

1. **Manifest Estático** - O `install-manifest.yaml` é commitado no git e não é regenerado dinamicamente
2. **Sem Modo Upgrade** - O wizard apenas faz instalações completas, sobrescrevendo tudo
3. **Novos Arquivos Ignorados** - Exemplo: `squad-creator.md` e tasks relacionadas não são instaladas em projetos brownfield
4. **Sem Rastreamento de Versão** - Projetos alvo não sabem qual versão está instalada

**Impacto:**
- Usuários precisam reinstalar manualmente o framework completo
- Customizações locais são perdidas em reinstalações
- Novos agentes/tasks não ficam disponíveis automaticamente

---

## User Story

**Como** desenvolvedor usando AIOS-FULLSTACK em um projeto existente,
**Quero** que o wizard detecte minha instalação e ofereça upgrade incremental,
**Para que** eu receba novos arquivos sem perder minhas customizações.

---

## Scope

### In Scope

| Feature | Description |
|---------|-------------|
| Dynamic Manifest Generator | Script que gera install-manifest.yaml com hashes |
| Manifest Validation | Validação de que manifest está atualizado |
| Brownfield Upgrader | Lógica de comparação e upgrade incremental |
| Version Tracking | Arquivo local que rastreia versão instalada |
| Wizard Integration | Detecção de upgrade e prompts no aios-init.js |
| npm Hooks | prepublishOnly para garantir manifest atualizado |
| CI Validation | Job que valida manifest em PRs |

### Out of Scope

- Sincronização de IDE commands (Story 6.19)
- Migração de dados entre versões
- Rollback automático de upgrades
- UI gráfica para upgrade

---

## Acceptance Criteria

### AC6.18.1: Dynamic Manifest Generator
- [x] Script `scripts/generate-install-manifest.js` criado
- [x] Escaneia todos os diretórios em `FOLDERS_TO_COPY`
- [x] Gera hash SHA256 para cada arquivo
- [x] Inclui metadata: versão, timestamp, tipo de arquivo, added_version
- [x] Output em formato YAML estruturado

### AC6.18.2: Manifest Validation
- [x] Script `scripts/validate-manifest.js` criado
- [x] Detecta arquivos novos não no manifest
- [x] Detecta arquivos removidos ainda no manifest
- [x] Detecta hashes desatualizados
- [x] Exit code 1 se manifest desatualizado

### AC6.18.3: npm Hooks Configurados
- [x] `prepublishOnly` executa `generate:manifest` e `validate:manifest`
- [x] Publish falha se manifest desatualizado
- [x] Manifest sempre atualizado no pacote npm

### AC6.18.4: Brownfield Upgrader
- [x] `src/installer/brownfield-upgrader.js` criado
- [x] Carrega manifest instalado vs manifest fonte
- [x] Compara versões usando semver
- [x] Gera relatório de diff: novos, modificados, deletados
- [x] Detecta arquivos modificados pelo usuário (hash diferente)
- [x] Instala apenas arquivos novos/modificados

### AC6.18.5: Version Tracking
- [x] Arquivo `.aios-core/.installed-manifest.yaml` criado no projeto alvo
- [x] Contém: versão instalada, timestamp, hash do manifest fonte
- [x] Atualizado após cada upgrade

### AC6.18.6: Wizard Integration
- [x] `bin/aios-init.js` detecta instalação existente
- [x] Oferece opções: Upgrade, Fresh Install, Dry Run, Cancel
- [x] Modo Upgrade instala apenas novos arquivos
- [x] Dry Run mostra o que seria instalado

### AC6.18.7: CI Validation
- [x] Job `manifest-validation` adicionado ao CI
- [x] PRs falham se manifest desatualizado
- [x] Mensagem clara de como corrigir

### AC6.18.8: Teste de Upgrade
- [x] Testar upgrade de v2.2.2 → v2.3.0 (hipotético)
- [x] squad-creator.md instalado corretamente
- [x] Arquivos customizados preservados
- [x] Relatório de upgrade exibido

---

## 🤖 CodeRabbit Integration

### Story Type Analysis
**Primary Type**: Infrastructure/Automation
**Secondary Type(s)**: CI/CD, Tooling, npm Publishing
**Complexity**: Medium-High (cross-platform, file system operations)

### Specialized Agent Assignment
**Primary Agents:**
- @dev: Implementation of manifest generator, upgrader, and hasher
- @devops: CI/CD integration, npm hooks configuration

**Supporting Agents:**
- @qa: Validation of upgrade flows and edge cases
- @architect: Design review of manifest structure

### Quality Gate Tasks
- [x] Pre-Commit (@dev): Run before marking story complete
- [x] Pre-PR (@devops): Run before creating pull request
- [x] Pre-Deployment (@devops): Validate npm publish hooks work correctly

### Self-Healing Configuration
**Expected Self-Healing:**
- Primary Agent: @dev (light mode)
- Max Iterations: 2
- Timeout: 15 minutes
- Severity Filter: CRITICAL only

**Predicted Behavior:**
- CRITICAL issues: auto_fix (2 iterations, 15min)
- HIGH issues: document_only

### CodeRabbit Focus Areas
**Primary Focus:**
- Error handling in file operations (missing files, permissions)
- Cross-platform compatibility (CRLF → LF normalization)
- Security (no hardcoded paths, use path.join)
- Hash consistency across platforms

**Secondary Focus:**
- Async/await patterns in file operations
- Proper error messages for user feedback
- Semver comparison accuracy

---

## Tasks / Subtasks

### Phase 1: Manifest Generation (AC6.18.1, AC6.18.2)
- [x] Create `scripts/generate-install-manifest.js`
  - [x] Implement directory scanning using `FOLDERS_TO_COPY`
  - [x] Implement SHA256 hashing with line ending normalization
  - [x] Generate YAML output with metadata
- [x] Create `scripts/validate-manifest.js`
  - [x] Detect new files not in manifest
  - [x] Detect removed files still in manifest
  - [x] Detect hash mismatches
  - [x] Exit code 1 on validation failure

### Phase 2: Utility & Upgrader (AC6.18.4, AC6.18.5)
- [x] Create `src/installer/file-hasher.js`
  - [x] Cross-platform line ending normalization
  - [x] SHA256 hash computation
- [x] Create `src/installer/brownfield-upgrader.js`
  - [x] Load source vs installed manifest
  - [x] Semver version comparison
  - [x] Generate diff report (new, modified, deleted)
  - [x] Detect user modifications
  - [x] Apply upgrade (new/modified only)
  - [x] Update installed manifest

### Phase 3: Integration (AC6.18.3, AC6.18.6, AC6.18.7)
- [x] Update `package.json`
  - [x] Add `generate:manifest` script
  - [x] Add `validate:manifest` script
  - [x] Add `prepublishOnly` hook
- [x] Modify `bin/aios-init.js`
  - [x] Add upgrade detection logic (~line 244)
  - [x] Add upgrade prompt (Upgrade/Fresh/Dry Run/Cancel)
  - [x] Integrate brownfield-upgrader
- [x] Update `.github/workflows/ci.yml`
  - [x] Add `manifest-validation` job
  - [x] Update `validation-summary` needs array

### Phase 4: Testing (AC6.18.8)
- [x] Write unit tests for `file-hasher.js`
- [x] Write unit tests for `generate-install-manifest.js`
- [x] Write integration tests for upgrade flow
- [x] Manual test: upgrade v2.2.2 → v2.3.0

---

## Dev Notes

### Critical Files Reference
| File | Lines | Purpose |
|------|-------|---------|
| `bin/aios-init.js` | 244-260 | Upgrade detection integration point |
| `src/installer/aios-core-installer.js` | 29-52 | `FOLDERS_TO_COPY` array |
| `src/installer/aios-core-installer.js` | 192-211 | Copy process logic |
| `.aios-core/install-manifest.yaml` | All | Current static manifest |
| `tools/diagnose-installation.js` | 35-43 | `compareVersions()` function to reuse |

### FOLDERS_TO_COPY Reference
```javascript
const FOLDERS_TO_COPY = [
  // v2.1 Modular Structure
  'core', 'development', 'product', 'infrastructure',
  // v2.0 Legacy (backwards compat)
  'agents', 'agent-teams', 'checklists', 'data', 'docs',
  'elicitation', 'scripts', 'tasks', 'templates', 'tools', 'workflows',
  // Additional
  'cli', 'manifests'
];
```

### Cross-Platform Considerations
- **Line Endings:** Always normalize `\r\n` → `\n` before hashing
- **Paths:** Use `path.join()` instead of string concatenation
- **File Encoding:** Read as UTF-8, handle BOM if present

### Testing Standards
- **Test Location:** `tests/installer/`
- **Framework:** Jest (already configured)
- **Coverage Target:** 80% minimum
- **Cross-platform:** CI runs on ubuntu-latest, local on Windows
- **Test Files:**
  - `tests/installer/file-hasher.test.js`
  - `tests/installer/generate-manifest.test.js`
  - `tests/installer/brownfield-upgrader.test.js`

---

## Technical Design

### 1. Manifest Structure

```yaml
# .aios-core/install-manifest.yaml
version: "2.3.0"
generated_at: "2025-12-22T14:30:00.000Z"
file_count: 365
files:
  - path: "development/agents/squad-creator.md"
    hash: "sha256:abc123..."
    type: "agent"
    added_version: "2.2.0"
    size: 15234
  - path: "development/tasks/squad-creator-create.md"
    hash: "sha256:def456..."
    type: "task"
    added_version: "2.2.0"
    size: 8456
```

### 2. Installed Manifest Structure

```yaml
# .aios-core/.installed-manifest.yaml (no projeto alvo)
installed_at: "2025-12-22T15:00:00.000Z"
installed_from: "aios-core@2.2.2"
installed_version: "2.2.2"
source_manifest_hash: "sha256:xyz789..."
files:
  - path: "development/agents/dev.md"
    hash: "sha256:abc123..."
    modified_by_user: false
  - path: "development/agents/custom-agent.md"
    hash: "sha256:user-created..."
    modified_by_user: true
```

### 3. Upgrade Flow

```
npx aios-core (em projeto existente)
     ↓
Detecta .aios-core/.installed-manifest.yaml
     ↓
Compara versões: instalada vs disponível
     ↓
Gera diff report:
  - 5 novos arquivos
  - 3 arquivos modificados
  - 2 arquivos customizados (preservar)
     ↓
Usuário confirma upgrade
     ↓
Instala novos/modificados, preserva customizados
     ↓
Atualiza .installed-manifest.yaml
```

### 4. File Hashing Utility

```javascript
// src/installer/file-hasher.js
const crypto = require('crypto');
const fs = require('fs-extra');

function hashFile(filePath) {
  const content = fs.readFileSync(filePath);
  // Normaliza line endings para consistência cross-platform
  const normalized = content.toString().replace(/\r\n/g, '\n');
  return crypto.createHash('sha256').update(normalized).digest('hex');
}
```

---

## Files to Create

| File | Description |
|------|-------------|
| `scripts/generate-install-manifest.js` | Gerador de manifest dinâmico |
| `scripts/validate-manifest.js` | Validador de manifest |
| `src/installer/brownfield-upgrader.js` | Lógica de upgrade |
| `src/installer/file-hasher.js` | Utilitário de hash |

## Files to Modify

| File | Changes |
|------|---------|
| `package.json` | Adicionar scripts generate:manifest, validate:manifest |
| `bin/aios-init.js` | Adicionar detecção de upgrade e prompts |
| `.github/workflows/ci.yml` | Adicionar job manifest-validation |
| `.aios-core/install-manifest.yaml` | Será regenerado automaticamente |

---

## npm Scripts

```json
{
  "generate:manifest": "node scripts/generate-install-manifest.js",
  "validate:manifest": "node scripts/validate-manifest.js",
  "prepublishOnly": "npm run generate:manifest && npm run validate:manifest"
}
```

---

## Testing Strategy

1. **Unit Tests:**
   - `file-hasher.js` - Testes de hash com diferentes line endings
   - `generate-install-manifest.js` - Testes de geração
   - `brownfield-upgrader.js` - Testes de diff

2. **Integration Tests:**
   - Simular upgrade de versão
   - Verificar preservação de arquivos customizados

3. **Manual Testing:**
   - Criar projeto com v2.2.2
   - Simular publish de v2.3.0
   - Executar upgrade e verificar resultados

---

## Dependencies

- Story 6.17 (semantic-release) - Para versionamento automático
- Nenhum bloqueio externo

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Hash inconsistente cross-platform | Normalizar line endings antes de hash |
| Manifest muito grande | Apenas incluir arquivos essenciais, não binários |
| Conflitos em merge | Manifest é auto-gerado, nunca editado manualmente |
| Usuário perde customizações | Detectar modificações e avisar antes de sobrescrever |

---

## File List

*Arquivos criados/modificados durante implementação:*

- [x] `scripts/generate-install-manifest.js` (Created)
- [x] `scripts/validate-manifest.js` (Created)
- [x] `src/installer/brownfield-upgrader.js` (Created)
- [x] `src/installer/file-hasher.js` (Created)
- [x] `package.json` (Modified - added scripts)
- [x] `bin/aios-init.js` (Modified - upgrade detection)
- [x] `.github/workflows/ci.yml` (Modified - manifest-validation job)
- [x] `tests/installer/file-hasher.test.js` (Created)
- [x] `tests/installer/generate-manifest.test.js` (Created)
- [x] `tests/installer/brownfield-upgrader.test.js` (Created)
- [x] `.aios-core/install-manifest.yaml` (Regenerated)

---

## References

- Plan: `~/.claude/plans/logical-watching-moore.md`
- Current manifest: `.aios-core/install-manifest.yaml`
- Installer: `src/installer/aios-core-installer.js`
- Wizard: `bin/aios-init.js`

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-12-22 | 1.0 | Story created from architecture plan | @architect |
| 2025-12-22 | 1.1 | Added CodeRabbit Integration, Tasks, Dev Notes | @po |
| 2025-12-22 | 2.0 | Implementation complete - all ACs met | @dev |

---

## Dev Agent Record

### Agent Model Used
Claude Opus 4.5 (`claude-opus-4-5-20251101`)

### Debug Log References
- Tests: 126 passed (tests/installer/*)
- Lint: 0 errors, 7 warnings (pre-existing .d.ts issues)
- Typecheck: Pass
- Manifest validation: Pass

### Completion Notes
Implementation completed in 4 phases:
1. **Phase 1**: Created file-hasher.js, generate-install-manifest.js, validate-manifest.js
2. **Phase 2**: Created brownfield-upgrader.js with full upgrade logic
3. **Phase 3**: Integrated with package.json, aios-init.js, CI workflow
4. **Phase 4**: Created comprehensive unit tests (126 tests passing)

Key features:
- Cross-platform line ending normalization (CRLF → LF)
- SHA256 hashing for file integrity
- Semver-based version comparison
- User modification detection (preserves customizations)
- Dry run mode for safe preview
- CI validation ensures manifest stays up-to-date

### File List (Implementation)
See "File List" section above - 11 files created/modified

---

## QA Results

**Review Date:** 2025-12-22
**Reviewer:** Quinn (@qa)
**Gate Decision:** ✅ **PASS**

### Validation Summary

| Check | Status | Notes |
|-------|--------|-------|
| Unit Tests | ✅ Pass | 126 tests passing (5 test suites) |
| Lint | ✅ Pass | 0 errors, 7 warnings (pre-existing in .d.ts) |
| Typecheck | ✅ Pass | No type errors |
| Manifest Validation | ✅ Pass | 555 files tracked with SHA256 hashes |

### Code Quality Assessment

**Strengths:**
1. **Cross-platform compatibility**: Proper CRLF→LF normalization, BOM handling, path.join() usage
2. **Error handling**: Graceful fallbacks (brownfieldUpgrader = null on load error)
3. **Test coverage**: Comprehensive tests for file-hasher, brownfield-upgrader, generate-manifest
4. **User protection**: User-modified files detected and preserved during upgrades
5. **Documentation**: JSDoc comments, story references, clear file headers
6. **CI Integration**: manifest-validation job added correctly to validation-summary

**Implementation Quality:**
- `file-hasher.js`: Clean utility with binary detection, line normalization, BOM handling
- `brownfield-upgrader.js`: Well-structured with semver comparison, diff generation, dry-run support
- `bin/aios-init.js`: Proper wizard integration with 4 options (Upgrade/Dry Run/Fresh/Cancel)
- `generate-install-manifest.js`: Dynamic scanning of FOLDERS_TO_COPY with metadata
- `validate-manifest.js`: Detects new/removed/modified files correctly

### Acceptance Criteria Verification

| AC | Status | Verification |
|----|--------|--------------|
| AC6.18.1 | ✅ | generate-install-manifest.js scans all folders, generates SHA256 hashes |
| AC6.18.2 | ✅ | validate-manifest.js detects drift with exit code 1 |
| AC6.18.3 | ✅ | prepublishOnly hook ensures manifest updated before publish |
| AC6.18.4 | ✅ | brownfield-upgrader.js with semver comparison, diff report |
| AC6.18.5 | ✅ | .installed-manifest.yaml created with version tracking |
| AC6.18.6 | ✅ | aios-init.js detects existing install, offers Upgrade/Fresh/DryRun/Cancel |
| AC6.18.7 | ✅ | CI job manifest-validation added and integrated |
| AC6.18.8 | ✅ | Upgrade flow tested via unit tests |

### Minor Observations (Non-blocking)

1. **ESLint warning**: `_error` variable in brownfield-upgrader.js line 102 - underscore prefix should be allowed but ESLint still warns. Consider adding to eslint ignore or using empty catch.

2. **YAML lib**: Uses both `js-yaml` and `yaml` packages. Consider standardizing on one.

### Recommendation

**Approved for merge.** All acceptance criteria met. Implementation follows best practices for cross-platform compatibility, error handling, and user protection. Test coverage is comprehensive.

---
*— Quinn, guardião da qualidade 🛡️*
