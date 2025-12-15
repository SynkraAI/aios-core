# Epic 12: Phase 3 - Open Core Repository

**Epic ID:** Epic-12 | **Parent:** Epic-Master-AIOS-2.0 (Wave 3)
**Status:** 🟡 Blocked (depends on Epic 11 validation) | **Priority:** 🔴 Critical (BREAKING)
**Owner:** DevOps (Gage) + Architect (Aria) | **Duration:** 6 weeks | **Investment:** $22.5K
**Target:** Q3 2026, Week 1-6

---

## 📋 Summary

Create **NEW PUBLIC REPO** `aios/aios-core` (Commons Clause), migrate from `aios-fullstack` submodule, publish `@aios/core` npm package. **BREAKING:** Archive `aios-fullstack` submodule + deprecation notice. **KILL SWITCH:** <500 stars OR <50 packs → stay Phase 2.

## 🎯 Deliverables

### New Repository: `aios/aios-core` (Commons Clause)

```
aios/aios-core/
├── aios-core/
│   ├── agents/                 # 13 named agents (Dex, Quinn, Pax...)
│   ├── tasks/                  # 101+ tasks
│   ├── templates/              # 34+ templates
│   ├── i18n/                   # EN + PT-BR
│   └── ...
├── bin/                         # CLI entry
├── tools/installer/            # Installation wizard
└── README.md                    # "15-Minute Deploy"
```

## 📊 Stories

**Story 12.1:** Backup + git subtree split (1 week)
- Full backup of `aios-fullstack` submodule
- Use `git subtree split -P aios-core -b aios-core-split`
- Preserve git history

**Story 12.2:** Create aios/aios-core repo + migrate (2 weeks)
- Create repo with Commons Clause license
- Push `aios-core-split` branch
- Update all internal references

**Story 12.3:** Publish @aios/core npm package (1 week)
- Update `package.json`: `"name": "@aios/core"`
- Publish to npm: `npm publish --access public`
- Test installation: `npx @aios/core install`

**Story 12.4:** Archive aios-fullstack + deprecation (1 week)
- Add deprecation notice to README
- Archive repository on GitHub
- Create migration guide

**Story 12.5:** CI/CD migration (1 week)
- Copy 4 GitHub Actions workflows
- Update CodeRabbit config
- Test all workflows

## ⚠️ BREAKING CHANGES

- `aios-fullstack` → `@aios/core` (npm package rename)
- Submodule archived (deprecation notice)
- Users must update: `npx @aios/core install`

## ✅ Success Metrics

- **GO:** >500 GitHub stars + >50 community packs → Proceed to Epic 13 (Phase 4)
- **NO-GO:** <500 stars OR <50 packs → Stay Phase 2, iterate

---

**Last Updated:** 2025-01-14 | **Owner:** DevOps + Architect
