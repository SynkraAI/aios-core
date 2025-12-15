# STORY: Project Type Detection

**ID:** STORY-1.3
**Épico:** [EPIC-S1 - Installer Híbrido Foundation](../../../epics/epic-s1-installer-foundation.md)
**Sprint:** Sprint 1
**Status:** ✅ Done (QA Gate: PASS - Quality Score 95/100)
**Points:** 3 pontos
**Priority:** 🟠 High
**Created:** 2025-01-19
**Completed:** 2025-11-21 (QA Approved by Quinn)

---

## 📊 User Story

**Como** desenvolvedor,  
**Quero** que installer detecte automaticamente se é greenfield ou brownfield,  
**Para** aplicar configuração apropriada sem precisar conhecer os termos

---

## 📚 Context & Justificativa

### Por Que Esta Story?
Detecção automática reduz friction. Installer sugere tipo baseado em arquivos existentes, user só confirma.

### Decisão do Pedro
- [Decisão 1](../../../audits/PEDRO-DECISION-LOG.md#decisão-1) - Project type detection
- [INSTALLER-HYBRID-V2-COMPLETE](../../../audits/INSTALLER-HYBRID-V2-COMPLETE.md) → "Project Type"

---

## 🤖 CodeRabbit Integration

### Story Type Analysis

**Primary Type**: Deployment  
**Secondary Type(s)**: Architecture  
**Complexity**: Medium

**Rationale**: This story implements core installer detection logic that affects deployment and project setup. It establishes architectural patterns for the installer system.

### Specialized Agent Assignment

**Primary Agents**:
- @dev: Pre-commit reviews (code quality, patterns, error handling)
- @github-devops: PR creation and deployment validation

**Supporting Agents**:
- @architect: Review integration patterns if architectural decisions needed
- @qa: Story validation and test coverage verification

### Quality Gate Tasks

- [ ] **Pre-Commit (@dev)**: Run before marking story complete
  - Focus: Code quality, error handling, cross-platform compatibility
  - Verify: All ACs met, tests passing, no hardcoded paths
  
- [ ] **Pre-PR (@github-devops)**: Run before creating pull request
  - Focus: Integration safety, backward compatibility
  - Verify: No breaking changes to existing installer flow

### CodeRabbit Focus Areas

**Primary Focus**:
- **File system operations**: Proper error handling for `fs.existsSync()`, `fs.readdirSync()`
- **Cross-platform compatibility**: Path handling works on Windows, macOS, Linux
- **Integration safety**: Detection logic integrates cleanly with Interactive Wizard (Story 1.2)
- **Error handling**: Graceful handling of permission denied, invalid paths

**Secondary Focus**:
- **Code quality**: DRY principles, maintainable code structure
- **Testing coverage**: All 4 detection scenarios covered (GREENFIELD, BROWNFIELD, EXISTING_AIOS, UNKNOWN)
- **Performance**: Synchronous fs operations acceptable (runs once during install)
- **Security**: Path validation to prevent directory traversal

---

## ✅ Acceptance Criteria

- [ ] **GIVEN** diretório vazio  
      **WHEN** installer detecta  
      **THEN** sugere "Greenfield" e cria estrutura completa

- [ ] **GIVEN** package.json existe  
      **WHEN** installer detecta  
      **THEN** sugere "Brownfield" e integra com existente

- [ ] **GIVEN** .git existe  
      **WHEN** installer detecta  
      **THEN** sugere "Brownfield" e preserva git history

- [ ] **GIVEN** .aios-core/ já existe  
      **WHEN** installer detecta  
      **THEN** pergunta se quer atualizar ou reinstalar

---

## 🔧 Implementation Details

### Target File Path
**Location**: `packages/installer/src/detection/detect-project-type.js`

**Purpose**: Exported module that provides project type detection for the installer wizard.

### Implementation Reference

```javascript
// packages/installer/src/detection/detect-project-type.js
const fs = require('fs');
const path = require('path');

/**
 * Detects the type of project in the current directory
 * @param {string} targetDir - Directory to analyze (defaults to process.cwd())
 * @returns {string} 'GREENFIELD' | 'BROWNFIELD' | 'EXISTING_AIOS' | 'UNKNOWN'
 * @throws {Error} If directory cannot be accessed
 */
function detectProjectType(targetDir = process.cwd()) {
  try {
    const hasPackageJson = fs.existsSync(path.join(targetDir, 'package.json'));
    const hasGit = fs.existsSync(path.join(targetDir, '.git'));
    const hasAiosCore = fs.existsSync(path.join(targetDir, '.aios-core'));
    const dirContents = fs.readdirSync(targetDir);
    const isEmpty = dirContents.length === 0;
    
    // Priority order: existing AIOS > empty > brownfield > unknown
    if (hasAiosCore) return 'EXISTING_AIOS';
    if (isEmpty) return 'GREENFIELD';
    if (hasPackageJson || hasGit) return 'BROWNFIELD';
    return 'UNKNOWN';
  } catch (error) {
    // Log error and throw for caller to handle
    console.error(`[detect-project-type] Error detecting project type: ${error.message}`);
    throw new Error(`Failed to detect project type: ${error.message}`);
  }
}

module.exports = { detectProjectType };
```

### Error Handling Strategy

**Permission Errors**:
- Catch `EACCES` / `EPERM` errors from fs operations
- Throw descriptive error for wizard to handle
- Wizard should display user-friendly message and allow manual selection

**Invalid Path Errors**:
- Validate `targetDir` exists before checking contents
- Handle `ENOENT` errors gracefully
- Fall back to `process.cwd()` if path invalid

**Security Considerations**:
- Use `path.join()` to prevent directory traversal
- Validate directory is within allowed scope
- Never follow symlinks without validation

---

## 📝 Dev Notes

### Architecture Context

This story is part of the **Installer Híbrido Foundation (EPIC-S1)**, which modernizes AIOS installation from a 2-4 hour manual process to a 5-minute automated `npx` command.

**Epic Goal**: Reduce installation time from 2-4 hours to < 5 minutes with 98% success rate.

### Relevant Source Tree

```
AIOS-V4/aios-fullstack/
├── bin/
│   └── aios-init.js                    # Current v2.0 installer (manual, 2-4h process)
│
├── packages/
│   └── installer/                       # NEW: Sprint 1 installer package
│       ├── package.json
│       ├── src/
│       │   ├── index.js                # Main entry point (npx command)
│       │   ├── wizard/                 # Story 1.2 - Interactive Wizard
│       │   │   └── wizard.js           # Calls detectProjectType()
│       │   ├── detection/              # THIS STORY
│       │   │   └── detect-project-type.js    # **CREATE THIS FILE**
│       │   ├── ide/                    # Story 1.4 - IDE Selection
│       │   ├── mcp/                    # Story 1.5 - MCP Installation
│       │   ├── config/                 # Story 1.6 - Environment Config
│       │   └── validation/             # Story 1.8 - Health Checks
│       └── tests/
│           └── unit/
│               └── detection/          # **CREATE THIS DIRECTORY**
│                   └── detect-project-type.test.js  # **CREATE THIS FILE**
│
├── docs/
│   ├── epics/
│   │   └── epic-s1-installer-foundation.md    # Parent epic
│   └── stories/v2.1/sprint-1/
│       ├── story-1.2-interactive-wizard-foundation.md    # Dependency
│       ├── story-1.3-project-type-detection.md          # THIS STORY
│       └── story-1.4-ide-selection.md                   # Blocked by this
```

### Integration Points

**Upstream Dependency (Story 1.2 - Interactive Wizard)**:
- The wizard (`packages/installer/src/wizard/wizard.js`) calls `detectProjectType()`
- Detection happens as **Step 2** of wizard flow (after welcome screen)
- Wizard displays detection result and asks user to confirm or override

**Integration Flow**:
```javascript
// packages/installer/src/wizard/wizard.js (Story 1.2)
const { detectProjectType } = require('../detection/detect-project-type');

async function runWizard() {
  // Step 1: Welcome screen
  await showWelcome();
  
  // Step 2: Detect project type (THIS STORY)
  const detectedType = detectProjectType();
  const confirmedType = await confirmProjectType(detectedType);
  
  // Step 3: IDE selection (Story 1.4) - uses confirmedType
  const selectedIDE = await selectIDE(confirmedType);
  // ...
}
```

**Downstream Impact (Story 1.4 - IDE Selection)**:
- IDE selection may vary based on project type
- Greenfield projects get full IDE setup
- Brownfield projects get integration guidance
- Existing AIOS installations get upgrade prompt

### Key Technical Decisions

**1. Synchronous File Operations**:
- Using `fs.existsSync()` and `fs.readdirSync()` (synchronous)
- **Justification**: Installer runs once, blocking is acceptable for simplicity
- **Alternative considered**: Async with `fs.promises` (rejected for added complexity)

**2. Detection Priority Order**:
```
1. EXISTING_AIOS (highest) - .aios-core/ exists
2. GREENFIELD - directory is empty
3. BROWNFIELD - package.json OR .git exists
4. UNKNOWN (fallback) - directory has files but no recognized markers
```

**3. Return Type**:
- Returns string enum (not TypeScript enum to keep Node.js compatibility)
- Possible values: `'GREENFIELD'`, `'BROWNFIELD'`, `'EXISTING_AIOS'`, `'UNKNOWN'`

**4. Error Handling Philosophy**:
- Detection errors are **thrown** (not returned as status)
- Wizard catches errors and provides user-friendly messages
- Allows retry or manual project type selection

### Configuration Impact

**None for this story** - Detection is read-only and deterministic. Configuration happens in downstream stories (1.4-1.6).

### Performance Expectations

- **Duration**: < 100ms (4 file checks + directory read)
- **I/O Operations**: 5 operations (3x existsSync, 1x readdirSync, 1x path resolution)
- **Memory**: Negligible (< 1MB)
- **Network**: None

### Security Considerations

**Path Traversal Prevention**:
- Always use `path.join()` to construct file paths
- Validate `targetDir` parameter if provided
- Never use string concatenation for paths

**Permission Handling**:
- Gracefully handle `EACCES` (permission denied) errors
- Display clear error message to user
- Offer manual project type selection as fallback

**Directory Scope Validation**:
- Ensure detection only reads current directory (no recursive traversal)
- Never follow symlinks automatically
- Validate directory exists before reading

### Testing

#### Test Framework
**Framework**: Jest  
**Location**: `packages/installer/tests/unit/detection/detect-project-type.test.js`

#### Test Standards

**Mocking Strategy**:
```javascript
jest.mock('fs');
const fs = require('fs');
const path = require('path');
const { detectProjectType } = require('../../../src/detection/detect-project-type');

describe('detectProjectType', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  // Test pattern for each AC...
});
```

**Test Scenarios** (map to ACs):

1. **AC #1: Empty Directory → GREENFIELD**
```javascript
test('detects GREENFIELD when directory is empty', () => {
  fs.existsSync.mockReturnValue(false); // No package.json, .git, .aios-core
  fs.readdirSync.mockReturnValue([]);    // Empty directory
  
  const result = detectProjectType('/test/empty');
  
  expect(result).toBe('GREENFIELD');
  expect(fs.existsSync).toHaveBeenCalledTimes(3);
});
```

2. **AC #2: package.json Exists → BROWNFIELD**
```javascript
test('detects BROWNFIELD when package.json exists', () => {
  fs.existsSync.mockImplementation((path) => {
    return path.includes('package.json'); // Only package.json exists
  });
  fs.readdirSync.mockReturnValue(['package.json', 'src']);
  
  const result = detectProjectType('/test/brownfield');
  
  expect(result).toBe('BROWNFIELD');
});
```

3. **AC #3: .git Exists → BROWNFIELD**
```javascript
test('detects BROWNFIELD when .git exists', () => {
  fs.existsSync.mockImplementation((path) => {
    return path.includes('.git'); // Only .git exists
  });
  fs.readdirSync.mockReturnValue(['.git', 'README.md']);
  
  const result = detectProjectType('/test/brownfield-git');
  
  expect(result).toBe('BROWNFIELD');
});
```

4. **AC #4: .aios-core Exists → EXISTING_AIOS**
```javascript
test('detects EXISTING_AIOS when .aios-core exists', () => {
  fs.existsSync.mockImplementation((path) => {
    return path.includes('.aios-core'); // .aios-core exists (priority over others)
  });
  fs.readdirSync.mockReturnValue(['.aios-core', 'package.json', '.git']);
  
  const result = detectProjectType('/test/existing');
  
  expect(result).toBe('EXISTING_AIOS');
});
```

5. **Edge Case: UNKNOWN Type**
```javascript
test('returns UNKNOWN when directory has files but no markers', () => {
  fs.existsSync.mockReturnValue(false); // No recognized markers
  fs.readdirSync.mockReturnValue(['README.md', 'index.html']);
  
  const result = detectProjectType('/test/unknown');
  
  expect(result).toBe('UNKNOWN');
});
```

6. **Error Handling: Permission Denied**
```javascript
test('throws error when directory cannot be accessed', () => {
  const permissionError = new Error('EACCES: permission denied');
  permissionError.code = 'EACCES';
  fs.existsSync.mockImplementation(() => {
    throw permissionError;
  });
  
  expect(() => detectProjectType('/test/denied')).toThrow('Failed to detect project type');
});
```

#### Test Coverage Requirements
- **Line Coverage**: > 90%
- **Branch Coverage**: 100% (all if/else paths)
- **Function Coverage**: 100%

#### Test Commands
```bash
# Run unit tests
npm test -- detect-project-type.test.js

# Run with coverage
npm test -- --coverage detect-project-type.test.js

# Run in watch mode during development
npm test -- --watch detect-project-type.test.js
```

### Documentation References

**Related Epic Documentation**:
- [EPIC-S1: Installer Híbrido Foundation](../../../epics/epic-s1-installer-foundation.md)
- [INSTALLER-HYBRID-V2-COMPLETE](../../../audits/INSTALLER-HYBRID-V2-COMPLETE.md) - Full installer proposal
- [PEDRO-DECISION-LOG](../../../audits/PEDRO-DECISION-LOG.md#decisão-1) - Project type detection decision

**Related Stories**:
- [Story 1.2: Interactive Wizard Foundation](./story-1.2-interactive-wizard-foundation.md) - Calls this detection
- [Story 1.4: IDE Selection](./story-1.4-ide-selection.md) - Uses detection result
- [Story 1.9: Error Handling & Rollback](./story-1.9-error-handling-rollback.md) - Error handling patterns

**Technical References**:
- [Node.js fs module documentation](https://nodejs.org/api/fs.html)
- [Node.js path module documentation](https://nodejs.org/api/path.html)
- [Jest mocking guide](https://jestjs.io/docs/mock-functions)

---

## 📋 Tasks Breakdown

- [ ] **Task 1.3.1**: Create detection module and implement file detection logic (2h) **(AC: #1, #2, #3, #4)**
  - [ ] Subtask 1.3.1.1: Create `packages/installer/src/detection/` directory
  - [ ] Subtask 1.3.1.2: Create `detect-project-type.js` with function signature
  - [ ] Subtask 1.3.1.3: Implement `fs.existsSync()` checks for package.json, .git, .aios-core
  - [ ] Subtask 1.3.1.4: Implement `fs.readdirSync()` check for empty directory
  - [ ] Subtask 1.3.1.5: Implement priority order logic (EXISTING_AIOS > GREENFIELD > BROWNFIELD > UNKNOWN)
  - [ ] Subtask 1.3.1.6: Add proper error handling with try-catch
  - [ ] Subtask 1.3.1.7: Add JSDoc comments for function documentation
  - [ ] Subtask 1.3.1.8: Export module for use by wizard

- [ ] **Task 1.3.2**: Integrate with Interactive Wizard (Story 1.2) (1h) **(AC: #1, #2, #3, #4)**
  - [ ] Subtask 1.3.2.1: Import `detectProjectType` in wizard.js
  - [ ] Subtask 1.3.2.2: Call detection function at Step 2 of wizard flow
  - [ ] Subtask 1.3.2.3: Display detection result to user with explanation
  - [ ] Subtask 1.3.2.4: Create confirmation prompt allowing user to override if needed
  - [ ] Subtask 1.3.2.5: Store confirmed project type in wizard state for downstream steps

- [ ] **Task 1.3.3**: Handle edge cases and error scenarios (2h) **(AC: #4)**
  - [ ] Subtask 1.3.3.1: Implement EXISTING_AIOS detection and update/reinstall prompt
  - [ ] Subtask 1.3.3.2: Handle partial .aios-core installation (missing files)
  - [ ] Subtask 1.3.3.3: Handle permission denied errors (EACCES/EPERM)
  - [ ] Subtask 1.3.3.4: Handle invalid directory path errors
  - [ ] Subtask 1.3.3.5: Implement fallback to manual project type selection on error
  - [ ] Subtask 1.3.3.6: Add logging for detection results and errors

- [ ] **Task 1.3.4**: Create comprehensive unit tests (2h) **(AC: #1, #2, #3, #4)**
  - [ ] Subtask 1.3.4.1: Create `packages/installer/tests/unit/detection/` directory
  - [ ] Subtask 1.3.4.2: Create `detect-project-type.test.js` with Jest setup
  - [ ] Subtask 1.3.4.3: Write test for AC #1 (empty directory → GREENFIELD)
  - [ ] Subtask 1.3.4.4: Write test for AC #2 (package.json → BROWNFIELD)
  - [ ] Subtask 1.3.4.5: Write test for AC #3 (.git → BROWNFIELD)
  - [ ] Subtask 1.3.4.6: Write test for AC #4 (.aios-core → EXISTING_AIOS)
  - [ ] Subtask 1.3.4.7: Write test for UNKNOWN project type (no markers)
  - [ ] Subtask 1.3.4.8: Write tests for error handling (permission denied, invalid path)
  - [ ] Subtask 1.3.4.9: Write tests for priority order (EXISTING_AIOS takes precedence)
  - [ ] Subtask 1.3.4.10: Verify test coverage > 90%

- [ ] **Task 1.3.5**: Integration testing with wizard flow (2h)
  - [ ] Subtask 1.3.5.1: Create integration test file `tests/integration/wizard-detection.test.js`
  - [ ] Subtask 1.3.5.2: Test full wizard flow with GREENFIELD detection
  - [ ] Subtask 1.3.5.3: Test full wizard flow with BROWNFIELD detection
  - [ ] Subtask 1.3.5.4: Test full wizard flow with EXISTING_AIOS detection
  - [ ] Subtask 1.3.5.5: Test user override of detection result
  - [ ] Subtask 1.3.5.6: Test error handling and fallback to manual selection
  - [ ] Subtask 1.3.5.7: Verify detection result flows correctly to Story 1.4 (IDE Selection)

**Total Estimated:** 9 horas

**Task Dependencies:**
- Task 1.3.1 must complete before 1.3.2 (wizard integration needs detection module)
- Task 1.3.2 requires Story 1.2 completion (wizard foundation must exist)
- Task 1.3.3 can run parallel with 1.3.2
- Task 1.3.4 can start after 1.3.1 completes (unit tests independent of wizard)
- Task 1.3.5 requires 1.3.1 and 1.3.2 completion (integration tests need both)

---

## 🔗 Dependencies

- **Depende De:** [STORY-1.2] - Interactive Wizard
- **Bloqueia:** [STORY-1.4] - IDE Selection

---

## 📝 Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-01-19 | 1.0 | Initial story creation | River (SM) 🌊 |
| 2025-01-20 | 1.1 | Added CodeRabbit Integration section | Pax (PO) 🎯 |
| 2025-01-20 | 1.2 | Added comprehensive Dev Notes with source tree and testing standards | Pax (PO) 🎯 |
| 2025-01-20 | 1.3 | Expanded Implementation Details with file paths and error handling | Pax (PO) 🎯 |
| 2025-01-20 | 1.4 | Broke down tasks into detailed subtasks with AC references | Pax (PO) 🎯 |
| 2025-01-20 | 1.5 | Added Change Log and documentation references | Pax (PO) 🎯 |

---

**Criado por:** River (SM) 🌊  
**Validado e Melhorado por:** Pax (PO) 🎯

