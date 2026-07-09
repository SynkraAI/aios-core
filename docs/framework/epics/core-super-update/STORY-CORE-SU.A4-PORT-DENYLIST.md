# Story CORE-SU.A4: Port denylist CI + doctor + smoke

## Metadata

| Campo | Valor |
|-------|-------|
| Story ID | CORE-SU.A4 |
| Epic | CORE-SUPER-UPDATE |
| Wave | A |
| Status | Done |
| Architecture | [ARCHITECTURE-WAVE-A.md](./ARCHITECTURE-WAVE-A.md) §3.4 |

## Deliverables

| Artifact | Path |
|----------|------|
| Scanner | `.aiox-core/core/security/port-denylist.js` |
| CLI | `scripts/validate-port-denylist.js` → `npm run validate:port-denylist` |
| Doctor | `.aiox-core/core/doctor/checks/port-denylist.js` |
| Tests | `tests/unit/port-denylist.test.js` |

## Patterns

- `workspace/(businesses|L0-identity|…)` — product workspace (**no workspace in OSS**)
- `sinkra_` / `.sinkra/`
- `mux-adapter`, `coolify`
- Machine paths `/Users/…`, `/home/…`, `C:\Users\…`

## Definition of Done

- [x] CLI exit 0 on clean tree  
- [x] Unit tests  
- [x] Doctor check registered  
- [x] npm script  
