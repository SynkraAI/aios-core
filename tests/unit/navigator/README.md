# Navigator Unit Tests

This directory contains unit tests for the Navigator squad scripts.

## Test Coverage Status

| Script | Test File | Coverage | Status |
|--------|-----------|----------|--------|
| phase-detector.js | phase-detector.test.js | ~30% | 🟡 Partial |
| doctor.js | doctor.test.js | ~60% | 🟡 Partial |
| checkpoint-manager.js | - | 0% | ❌ TODO |
| roadmap-sync.js | - | 0% | ❌ TODO |
| orchestrator.js | - | 0% | ❌ TODO |
| post-commit-hook.js | - | 0% | ❌ TODO |

**Target:** 85% coverage across all scripts

## Running Tests

```bash
# Run all Navigator tests
npm test -- tests/unit/navigator

# Run specific test file
npm test -- tests/unit/navigator/doctor.test.js

# Run with coverage
npm test -- --coverage tests/unit/navigator

# Watch mode
npm test -- --watch tests/unit/navigator
```

## Test Structure

Each test file follows this structure:

```javascript
describe('ScriptName', () => {
  describe('functionName', () => {
    it('should do something specific', () => {
      // Test implementation
    });
  });
});
```

## Writing Tests for Navigator Scripts

### 1. Phase Detector Tests

**Challenges:**
- Requires file system mocking (fs)
- Needs glob pattern mocking
- Depends on story file structure

**Approach:**
```javascript
const fs = require('fs');
jest.mock('fs');

it('should detect phase 3 when architecture exists', async () => {
  fs.existsSync.mockReturnValue(true);
  // ... test implementation
});
```

### 2. Checkpoint Manager Tests

**Challenges:**
- File system operations
- Git command execution (execSync)
- Date/time handling

**Approach:**
```javascript
const { execSync } = require('child_process');
jest.mock('child_process');

it('should create checkpoint with timestamp', async () => {
  execSync.mockReturnValue('git output');
  // ... test implementation
});
```

### 3. Roadmap Sync Tests

**Challenges:**
- Bidirectional sync logic
- Conflict resolution
- User prompts (inquirer)

**Approach:**
```javascript
const inquirer = require('inquirer');
jest.mock('inquirer');

it('should resolve conflict with user input', async () => {
  inquirer.prompt.mockResolvedValue({ confirm: true });
  // ... test implementation
});
```

### 4. Doctor Tests

**Status:** ✅ Partially implemented

**Coverage:**
- ✅ checkNodeVersion
- ✅ checkGitAvailable
- ✅ checkDependencies
- ⏳ checkGitHooks (TODO)
- ⏳ checkDirectoryStructure (TODO)
- ⏳ checkPipelineMap (TODO)
- ⏳ checkScriptsExecutable (TODO)

## Test Fixtures

Create test fixtures in `tests/fixtures/navigator/`:

```
tests/fixtures/navigator/
├── mock-project/
│   ├── docs/
│   │   ├── stories/
│   │   │   ├── story-1.md (completed)
│   │   │   └── story-2.md (in-progress)
│   │   ├── prd.yaml
│   │   └── architecture/
│   │       └── full-stack.yaml
│   └── .aios/
│       └── navigator/
│           └── test-project/
│               ├── roadmap.md
│               └── checkpoints/
└── mock-pipeline-map.yaml
```

## Mocking Strategies

### File System Operations

```javascript
const fs = require('fs');
jest.mock('fs');

fs.existsSync.mockReturnValue(true);
fs.readFileSync.mockReturnValue('file content');
fs.writeFileSync.mockImplementation(() => {});
```

### Git Commands

```javascript
const { execSync } = require('child_process');
jest.mock('child_process');

execSync.mockReturnValue('git log output');
```

### Glob Patterns

```javascript
const glob = require('glob');
jest.mock('glob');

glob.sync.mockReturnValue(['story-1.md', 'story-2.md']);
```

### User Prompts

```javascript
const inquirer = require('inquirer');
jest.mock('inquirer');

inquirer.prompt.mockResolvedValue({ confirm: true });
```

## Coverage Goals

### Phase 1 (Current - Sprint 3)
- ✅ Test structure created
- ✅ Doctor tests (partial)
- ✅ Phase detector tests (skeleton)
- Target: 40% coverage

### Phase 2 (Future)
- ⏳ Checkpoint manager tests
- ⏳ Roadmap sync tests
- ⏳ Full doctor coverage
- Target: 70% coverage

### Phase 3 (Future)
- ⏳ Orchestrator tests
- ⏳ Post-commit hook tests
- ⏳ Integration tests
- Target: 85% coverage

## Integration Tests

For end-to-end testing, create integration tests in:
`tests/integration/navigator/`

Example:
```javascript
describe('Navigator End-to-End', () => {
  it('should map project and detect phase', async () => {
    // Create real test project
    // Run *map-project
    // Verify roadmap created
    // Run *where-am-i
    // Verify correct phase detected
  });
});
```

## Best Practices

1. **Isolate Tests:** Each test should be independent
2. **Mock External Dependencies:** File system, git, npm
3. **Test Edge Cases:** Empty inputs, missing files, invalid YAML
4. **Clear Assertions:** Use specific expect() statements
5. **Descriptive Names:** Test names should explain what they test
6. **Setup/Teardown:** Clean up test artifacts

## Common Patterns

### Testing Async Functions

```javascript
it('should handle async operations', async () => {
  const result = await someAsyncFunction();
  expect(result).toBe(expected);
});
```

### Testing Error Handling

```javascript
it('should throw error for invalid input', () => {
  expect(() => {
    functionThatThrows();
  }).toThrow('Expected error message');
});
```

### Testing with Timeouts

```javascript
it('should complete within timeout', async () => {
  await expect(longRunningFunction()).resolves.toBeDefined();
}, 10000); // 10 second timeout
```

## Next Steps

To achieve 85% coverage:

1. **Priority 1:** Complete doctor.js tests (5 remaining checks)
2. **Priority 2:** Add checkpoint-manager.js tests (critical path)
3. **Priority 3:** Add roadmap-sync.js tests (complex logic)
4. **Priority 4:** Add phase-detector.js full tests (with mocks)
5. **Priority 5:** Add orchestrator.js tests
6. **Priority 6:** Add post-commit-hook.js tests (integration)

## Resources

- Jest Documentation: https://jestjs.io/docs/getting-started
- Testing Best Practices: https://testingjavascript.com/
- Mocking Guide: https://jestjs.io/docs/mock-functions

---

*Navigator Test Suite - Sprint 3 Foundation*
