# FinHealth Squad - Coding Standards

## Language & Framework

- **Language:** TypeScript (strict mode)
- **Runtime:** Node.js >= 18.0.0
- **Framework:** Synkra AIOS + Squads

## Style Guide

### Formatting
- **Indentation:** 2 spaces
- **Quotes:** Single quotes for strings
- **Semicolons:** Required
- **Line length:** Max 100 characters
- **Trailing commas:** Required in multiline

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | camelCase | `tissValidator.ts` |
| Classes | PascalCase | `TissValidator` |
| Interfaces | PascalCase with I prefix | `ITissGuide` |
| Functions | camelCase | `validateGuide()` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Variables | camelCase | `guiaCount` |
| Types | PascalCase | `GlosaType` |
| Enums | PascalCase | `GuiaStatus` |

### Directory Structure
```
src/
├── agents/          # Agent implementations
├── tasks/           # Task implementations
├── services/        # Business logic
├── repositories/    # Data access
├── utils/           # Utilities
├── types/           # Type definitions
└── config/          # Configuration
```

## Code Quality

### Required Tools
- ESLint with TypeScript rules
- Prettier for formatting
- Husky for pre-commit hooks

### Testing
- Framework: Vitest
- Coverage: Minimum 80% for business logic
- Required tests for: validators, calculators, parsers

### Error Handling
- Use custom error classes
- Always include error codes
- Log errors with context
- Never swallow errors silently

### Logging
- Use structured JSON logging
- Include: timestamp, level, message, context
- Log all financial operations
- Never log PII in plain text

## Git Conventions

### Commits
Follow Conventional Commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance

### Branches
- `main` - Production
- `develop` - Development
- `feature/` - New features
- `fix/` - Bug fixes
- `release/` - Release preparation

## Security

### Mandatory
- No hardcoded credentials
- Environment variables for secrets
- Input validation at boundaries
- SQL parameterized queries
- LGPD compliance for PII

### Forbidden
- `eval()` or dynamic code execution
- Direct SQL string concatenation
- Storing passwords in plain text
- Logging sensitive data
