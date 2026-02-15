# Magic BOB - Coding Standards

**Extends:** `.aios-core/docs/standards/CODING-STANDARDS.md`

## BOB-Specific Standards

### 1. Orchestration Logic

**Principle:** All routing decisions MUST be deterministic (no LLM reasoning).

```javascript
// ✓ CORRETO - Pure if/else logic
function detectProjectState(projectRoot) {
  const hasPackageJson = fs.existsSync(path.join(projectRoot, 'package.json'));
  if (!hasPackageJson) {
    return ProjectState.GREENFIELD;
  }
  // ... more checks
}

// ✗ ERRADO - LLM-based decision
async function detectProjectState(projectRoot) {
  const prompt = "Analyze this project structure and tell me if it's greenfield...";
  const decision = await llm.complete(prompt);
  return decision;
}
```

### 2. Surface Criteria

**Principle:** ALWAYS evaluate surface criteria BEFORE taking action.

```javascript
// ✓ CORRETO
const surfaceResult = this.surfaceChecker.shouldSurface({
  action_type: 'spawn_agent',
  estimated_cost: calculateCost(),
  risk_level: assessRisk()
});

if (surfaceResult.should_surface) {
  return promptUser(surfaceResult.message);
}

// Proceed only after approval
await spawnAgent();
```

### 3. Session State Persistence

**Principle:** Update session state at EVERY phase transition.

```javascript
// Phase transition
await this.sessionState.recordPhaseChange(
  'development',
  storyId,
  executor
);
```

### 4. Error Handling

**Principle:** Categorize errors as recoverable vs fatal.

```javascript
try {
  await dangerousOperation();
} catch (error) {
  if (error.recoverable) {
    logger.warn('Recoverable error', { error });
    return retryOrFallback();
  } else {
    logger.error('Fatal error', { error });
    throw error;
  }
}
```

### 5. CLI First

**Principle:** Observability panel (stdout) MUST work without external dependencies.

```javascript
// ✓ CORRETO - Observability via stdout
this.observabilityPanel.start();  // Renders to stdout

// Dashboard is OPTIONAL
try {
  await this.bobStatusWriter.initialize();
} catch (error) {
  // Dashboard unavailable - degrade gracefully
  this._log('Dashboard unavailable, continuing CLI-only');
}
```

### 6. Security

**Principle:** Validate ownership before killing processes.

```javascript
// ✓ CORRETO
const uid = execSync(`ps -p ${pid} -o uid=`).toString().trim();
if (uid === process.getuid().toString()) {
  process.kill(parseInt(pid, 10), 'SIGTERM');
} else {
  this._log(`Skipping process ${pid} - not owned by current user`);
}

// ✗ ERRADO
process.kill(parseInt(pid, 10), 'SIGTERM');  // No ownership check!
```

### 7. Performance

**Principle:** Use async/parallel operations when possible.

```javascript
// ✓ CORRETO - Parallel file checks
const [hasPackageJson, hasGit, hasDocs] = await Promise.all([
  fs.promises.access(path.join(projectRoot, 'package.json')).then(() => true).catch(() => false),
  fs.promises.access(path.join(projectRoot, '.git')).then(() => true).catch(() => false),
  fs.promises.access(path.join(projectRoot, 'docs')).then(() => true).catch(() => false),
]);

// ✗ EVITAR - Sequential syscalls
const hasPackageJson = fs.existsSync(path.join(projectRoot, 'package.json'));
const hasGit = fs.existsSync(path.join(projectRoot, '.git'));
const hasDocs = fs.existsSync(path.join(projectRoot, 'docs'));
```

---

## File Organization

```
squads/magic-bob/
├── core/                     # JavaScript modules
│   ├── bob-orchestrator.js   # Main orchestrator
│   ├── *-handler.js          # State handlers
│   └── observability/        # Observability layer
├── agents/                   # Agent definitions (Markdown)
├── tasks/                    # Executable tasks (Markdown)
├── data/                     # Static data (YAML/Markdown)
└── workflows/                # Workflow definitions (YAML)
```

---

## Testing Standards

### Unit Tests

```javascript
describe('BobOrchestrator', () => {
  describe('detectProjectState()', () => {
    it('should detect GREENFIELD when no package.json', () => {
      // Test pure logic
    });

    it('should detect BROWNFIELD when code but no docs', () => {
      // Test pure logic
    });
  });
});
```

### Integration Tests

```javascript
describe('Brownfield Discovery', () => {
  it('should spawn 4 agents in parallel', async () => {
    // Test handler integration
  });
});
```

### E2E Tests

```javascript
describe('Complete Epic Cycle', () => {
  it('should orchestrate from PRD to push', async () => {
    // Test full workflow
  });
});
```

---

## Documentation Standards

### JSDoc Required

```javascript
/**
 * Detects the current project state (AC3-6)
 *
 * Decision tree implemented as pure if/else statements (AC7 — no LLM).
 *
 * @param {string} [projectRoot=this.projectRoot] - Project root directory
 * @returns {string} ProjectState enum value
 */
detectProjectState(projectRoot = this.projectRoot) {
  // Implementation
}
```

### Story References

Always reference story IDs in code:

```javascript
// Story 12.5 AC5: Track validation phase
await this._updatePhase('validation', storyId, assignment.executor);
```

---

## Commit Standards

Follow Conventional Commits:

```bash
feat(bob): implement greenfield workflow [Story 12.13]
fix(bob): resolve lock file race condition [BOB-SAFE-1]
docs(bob): update surface criteria documentation
test(bob): add integration tests for brownfield
```

---

**Reference:** `.aios-core/docs/standards/CODING-STANDARDS.md` for general AIOS standards.
