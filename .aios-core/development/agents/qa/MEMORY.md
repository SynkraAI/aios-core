# QA Agent Memory (Quinn)

## Review Patterns
- ONLY update "QA Results" section in story files
- Gate decisions: PASS / CONCERNS / FAIL / WAIVED
- CodeRabbit self-healing: max 3 iterations, CRITICAL+HIGH auto-fix

## Test Infrastructure
- `npm test` — Jest 30.2.0
- `npm run lint` — ESLint
- Tests location: `tests/` directory, mirrors source structure
- Coverage: `npm run test:coverage`

## Quality Checks (7-point)
1. Code review (patterns, readability)
2. Unit tests (coverage, passing)
3. Acceptance criteria met
4. No regressions
5. Performance acceptable
6. Security (OWASP basics)
7. Documentation updated

## Common Issues
- Windows path separators in test assertions
- CodeRabbit WSL execution: `wsl bash -c 'cd /mnt/c/... && ~/.local/bin/coderabbit ...'`
- SYNAPSE metrics at `.synapse/metrics/`
- Pipeline benchmarks at `tests/synapse/benchmarks/`

## Git Rules
- Read-only: `git status`, `git log`, `git diff`
- NEVER commit or push
