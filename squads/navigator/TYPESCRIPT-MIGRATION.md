# Navigator TypeScript Migration Guide

## Status

| Script | Status | Priority |
|--------|--------|----------|
| install-hooks.js | ⏳ Planned | Low |
| doctor.js | ⏳ Planned | High |
| phase-detector.js | ⏳ Planned | High |
| checkpoint-manager.js | ⏳ Planned | Medium |
| roadmap-sync.js | ⏳ Planned | Medium |
| orchestrator.js | ⏳ Planned | Low |
| post-commit-hook.js | ⏳ Planned | Low |

**Target:** All scripts migrated to TypeScript with full type safety

## Benefits of TypeScript Migration

1. **Type Safety:** Catch bugs at compile time instead of runtime
2. **Better IDE Support:** Autocomplete, refactoring, inline documentation
3. **Maintainability:** Explicit types make code easier to understand
4. **Scalability:** Easier to refactor and extend functionality
5. **Documentation:** Types serve as inline documentation

## Prerequisites

```bash
# Install TypeScript
npm install --save-dev typescript @types/node @types/js-yaml @types/inquirer

# Initialize tsconfig.json (if not exists)
npx tsc --init
```

## Migration Process

### Step 1: Setup TypeScript Config

Create `squads/navigator/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./scripts",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["scripts/**/*.ts"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### Step 2: Rename Files

```bash
# Rename .js to .ts
mv scripts/navigator/doctor.js scripts/navigator/doctor.ts
```

### Step 3: Add Type Definitions

Example migration of `doctor.js`:

**Before (JavaScript):**
```javascript
async function checkNodeVersion() {
  try {
    const version = process.version;
    const majorVersion = parseInt(version.slice(1).split('.')[0]);

    if (majorVersion >= 18) {
      return {
        name: 'Node.js Version',
        passed: true,
        message: `✓ Node.js ${version} (>= 18.0.0)`,
      };
    }
    // ...
  } catch (error) {
    return {
      name: 'Node.js Version',
      passed: false,
      message: '✗ Could not detect Node.js version',
    };
  }
}
```

**After (TypeScript):**
```typescript
interface HealthCheckResult {
  name: string;
  passed: boolean;
  message: string;
  fix?: string;
}

async function checkNodeVersion(): Promise<HealthCheckResult> {
  try {
    const version: string = process.version;
    const majorVersion: number = parseInt(version.slice(1).split('.')[0]);

    if (majorVersion >= 18) {
      return {
        name: 'Node.js Version',
        passed: true,
        message: `✓ Node.js ${version} (>= 18.0.0)`,
      };
    } else {
      return {
        name: 'Node.js Version',
        passed: false,
        message: `✗ Node.js ${version} (requires >= 18.0.0)`,
        fix: 'Install Node.js 18 or higher from https://nodejs.org',
      };
    }
  } catch (_error: unknown) {
    return {
      name: 'Node.js Version',
      passed: false,
      message: '✗ Could not detect Node.js version',
    };
  }
}
```

### Step 4: Type External Dependencies

```typescript
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import * as inquirer from 'inquirer';

// With proper types from @types packages
```

### Step 5: Compile TypeScript

```bash
# Compile
npx tsc -p squads/navigator/tsconfig.json

# Output will be in squads/navigator/dist/
```

### Step 6: Update package.json Scripts

```json
{
  "scripts": {
    "build:navigator": "tsc -p squads/navigator/tsconfig.json",
    "watch:navigator": "tsc -p squads/navigator/tsconfig.json --watch",
    "clean:navigator": "rm -rf squads/navigator/dist"
  }
}
```

## Type Definitions for Navigator

### Common Types

```typescript
// types/navigator.ts

export interface Phase {
  id: number;
  name: string;
  agent: string;
  icon: string;
  command: string;
  description: string;
  inputs: string[];
  outputs: string[];
  next_phase: number | null;
  loop_back_to?: number;
}

export interface PipelineMap {
  phases: Phase[];
  transitions: {
    auto_advance: TransitionRule[];
    blocked: TransitionRule[];
    loop: TransitionRule[];
  };
}

export interface TransitionRule {
  condition?: string;
  action: string;
  phase?: number;
}

export interface PhaseDetectionResult extends Phase {
  completion: number;
}

export interface Checkpoint {
  checkpointId: string;
  filepath: string;
  phase: number;
  type: 'manual' | 'auto';
  date: string;
  description: string;
}

export interface RoadmapSyncOptions {
  direction?: 'central-to-local' | 'local-to-central' | 'bidirectional';
  force?: boolean;
}

export interface RoadmapSyncResult {
  success: boolean;
  centralPath?: string;
  localPath?: string;
  direction?: string;
  error?: string;
}

export interface HealthCheckResult {
  name: string;
  passed: boolean;
  message: string;
  fix?: string;
}

export interface ValidationResult {
  errors: string[];
  warnings: string[];
  valid: boolean;
}
```

## Migration Priority

### Phase 1 (High Priority)
- **doctor.js** → Standalone, good starter
- **phase-detector.js** → Critical logic, needs type safety

### Phase 2 (Medium Priority)
- **checkpoint-manager.js** → File operations benefit from types
- **roadmap-sync.js** → Complex sync logic needs clarity

### Phase 3 (Low Priority)
- **orchestrator.js** → Delegation logic
- **install-hooks.js** → Simple, low risk
- **post-commit-hook.js** → Git hook, minimal logic

## Testing TypeScript Code

Update test files to `.test.ts`:

```typescript
// doctor.test.ts
import { checkNodeVersion, HealthCheckResult } from '../../../squads/navigator/scripts/navigator/doctor';

describe('Navigator Doctor', () => {
  it('should return typed result', async () => {
    const result: HealthCheckResult = await checkNodeVersion();
    expect(result.passed).toBe(true);
  });
});
```

## Common Migration Patterns

### Pattern 1: Function Signatures

```typescript
// Before
async function syncRoadmap(projectName, options) {
  // ...
}

// After
async function syncRoadmap(
  projectName: string,
  options: RoadmapSyncOptions = {}
): Promise<RoadmapSyncResult> {
  // ...
}
```

### Pattern 2: Error Handling

```typescript
// Before
} catch (error) {
  return { error: error.message };
}

// After
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  return { error: message };
}
```

### Pattern 3: Optional Parameters

```typescript
// Before
function createCheckpoint(options = {}) {
  const { type = 'manual', phase } = options;
  // ...
}

// After
interface CheckpointOptions {
  type?: 'manual' | 'auto';
  phase: Phase;
  description?: string;
}

function createCheckpoint(options: CheckpointOptions): Promise<Checkpoint> {
  const { type = 'manual', phase, description } = options;
  // ...
}
```

### Pattern 4: Modules

```typescript
// Before (CommonJS)
const fs = require('fs');
module.exports = { func1, func2 };

// After (ES Modules with CommonJS compatibility)
import * as fs from 'fs';
export { func1, func2 };

// Or keep CommonJS
import fs = require('fs');
export = { func1, func2 };
```

## Build & Distribution

### Development
```bash
# Watch mode for development
npm run watch:navigator
```

### Production
```bash
# Build for distribution
npm run build:navigator

# Scripts will be in squads/navigator/dist/
```

### Update References

After migration, update references in tasks:

```markdown
<!-- Before -->
```javascript
const { detectPhase } = require('./scripts/navigator/phase-detector');
```

<!-- After -->
```typescript
import { detectPhase } from './scripts/navigator/phase-detector';
// Or compiled:
const { detectPhase } = require('./dist/navigator/phase-detector');
```
```

## Gradual Migration Strategy

1. **Week 1:** Setup TypeScript config + migrate doctor.js
2. **Week 2:** Migrate phase-detector.js + add type tests
3. **Week 3:** Migrate checkpoint-manager.js + roadmap-sync.js
4. **Week 4:** Migrate remaining scripts + full type coverage

## Benefits After Migration

- ✅ Compile-time error detection
- ✅ IDE autocomplete for all functions
- ✅ Refactoring safety (rename, extract, etc.)
- ✅ Self-documenting code via types
- ✅ Easier onboarding for new contributors

## Resources

- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/intro.html
- Node.js Types: https://www.npmjs.com/package/@types/node
- Migration Guide: https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html

---

*Navigator TypeScript Migration Guide - Sprint 3*
*Status: Planning phase - Implementation recommended for Sprint 4+*
