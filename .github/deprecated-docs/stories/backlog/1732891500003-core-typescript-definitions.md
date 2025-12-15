# Backlog Item: Create TypeScript Definitions for Core Module

**ID:** 1732891500003
**Type:** Follow-up
**Priority:** Medium
**Related Story:** [2.2 - Core Module Creation](../v2.1/sprint-2/story-2.2-core-module.md)
**Created:** 2025-11-29
**Created By:** @qa (Quinn)
**Effort:** 3 hours

---

## Description

Create TypeScript type definitions (`index.d.ts`) for the Core Module as specified in ADR-002 scope. This will improve developer experience and enable type checking for consumers of the core module.

---

## Scope

Create `.aios-core/core/index.d.ts` with type definitions for all 22 exports:

### Config Subsystem
- `ConfigCache` class
- `globalConfigCache` singleton instance
- `loadAgentConfig(agentId: string): Promise<AgentConfig>`
- `loadConfigSections(sections: string[]): Promise<ConfigSection>`
- `loadMinimalConfig(): Promise<MinimalConfig>`
- `loadFullConfig(): Promise<FullConfig>`
- `preloadConfig(): Promise<void>`
- `clearConfigCache(): void`
- `getConfigPerformanceMetrics(): PerformanceMetrics`
- `agentRequirements` constant
- `ALWAYS_LOADED` constant

### Session Management
- `ContextDetector` class
- `SessionContextLoader` class

### Elicitation System
- `ElicitationEngine` class
- `ElicitationSessionManager` class
- `agentElicitationSteps` object
- `taskElicitationSteps` object
- `workflowElicitationSteps` object

### Utilities
- `PersonalizedOutputFormatter` class
- `YAMLValidator` class
- `validateYAML(content: string, type?: string): Promise<ValidationResult>`

### Metadata
- `version: string`
- `moduleName: string`

---

## Example Structure

```typescript
// index.d.ts
declare module '@aios-fullstack/core' {
  export class ConfigCache {
    get(key: string): any;
    set(key: string, value: any, ttl?: number): void;
    has(key: string): boolean;
    delete(key: string): boolean;
    clear(): void;
  }

  export const globalConfigCache: ConfigCache;

  export function loadAgentConfig(agentId: string): Promise<AgentConfig>;

  export class ElicitationEngine {
    startSession(type: string): Promise<ElicitationSession>;
    processStep(sessionId: string, input: any): Promise<StepResult>;
    completeSession(sessionId: string): Promise<void>;
  }

  export interface ValidationResult {
    valid: boolean;
    error: string | null;
    errors: ValidationError[];
    warnings: ValidationWarning[];
  }

  export function validateYAML(
    content: string,
    type?: 'general' | 'agent' | 'manifest' | 'workflow'
  ): Promise<ValidationResult>;

  export const version: string;
  export const moduleName: string;
}
```

---

## Acceptance Criteria

- [ ] `index.d.ts` created with all 22 exports typed
- [ ] Types are accurate and match runtime behavior
- [ ] JSDoc comments included for key methods
- [ ] TypeScript compilation works with `--strict` mode
- [ ] IDE autocomplete works for core module imports

---

## Implementation Notes

1. Start with interfaces for data structures
2. Add class definitions with method signatures
3. Include JSDoc for better IDE integration
4. Consider generating from JSDoc if present in source

---

## Tags

`typescript`, `core`, `dx`, `types`, `documentation`
