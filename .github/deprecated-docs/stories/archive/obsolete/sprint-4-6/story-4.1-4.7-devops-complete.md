# ~~STORIES 4.1-4.7: DevOps Setup + GitHub Integration~~ ❌ OBSOLETE

> ⚠️ **STATUS: OBSOLETE** (2025-12-08)
>
> **Reason:** These stories were superseded by different implementations across Sprints 1-3.
>
> **Replacement:** [Story 5.10 - GitHub DevOps Setup for User Projects](../sprint-5/story-5.10-github-devops-user-projects.md)
>
> **What was implemented instead:**
> - GitHub CLI integration → `*environment-bootstrap` task
> - CI/CD Workflows → `.github/workflows/` (ci.yml, pr-automation.yml, release.yml)
> - CodeRabbit → `.coderabbit.yaml` (configured for AIOS-FULLSTACK)
> - DevOps Agent → @devops (Gage) instead of "Felix"
> - Quality Gates → Agent tasks + GitHub Actions
>
> **Gap identified:** User projects (Cenário 2) don't get DevOps setup automatically.
> This gap is addressed by Story 5.10.

---

**Épico:** [EPIC-S4](../../../epics/epic-s4-devops-setup.md) | **Sprint:** 4 | **Created:** 2025-01-19 | **Obsoleted:** 2025-12-08

---

## STORY 4.1: GitHub CLI Integration

**Points:** 5 | **Priority:** 🔴 Critical

### User Story
**Como** developer, **Quero** GitHub CLI integrado, **Para** automação de repo setup

### Scope
Integrate `gh` (GitHub CLI):
```bash
# Check if gh installed
$ gh --version

# AIOS commands using gh
$ aios setup-github
  → Uses gh to create repo, configure secrets, etc.
```

### Tasks (5 pts = 2 dias)
- [ ] 4.1.1: Check gh installation (1h)
- [ ] 4.1.2: Implement gh auth check (2h)
- [ ] 4.1.3: Wrap gh commands (3h)
- [ ] 4.1.4: Error handling (2h)
- [ ] 4.1.5: Test (2h)

**Total:** 10h

---

## STORY 4.2: Repository Setup Automation

**Points:** 8 | **Priority:** 🔴 Critical

### User Story
**Como** developer, **Quero** `aios setup-github`, **Para** configurar repo em < 5min

### Scope
```bash
$ aios setup-github

🚀 GitHub Repository Setup
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Checking GitHub authentication...
✓ Creating repository 'my-project'...
✓ Configuring secrets (OPENAI_API_KEY, etc.)...
✓ Setting up branch protection...
✓ Enabling GitHub Actions...
✓ Installing CodeRabbit App...

✅ Repository ready! (2 min 34s)

Next steps:
  1. Push code: git push origin main
  2. Create first PR to test Quality Gates
```

### Tasks (8 pts = 3 dias)
- [ ] 4.2.1: Implement repo creation (3h)
- [ ] 4.2.2: Configure secrets (3h)
- [ ] 4.2.3: Branch protection rules (2h)
- [ ] 4.2.4: Enable GitHub Actions (2h)
- [ ] 4.2.5: Test automation (4h)

**Total:** 14h

---

## STORY 4.3: CodeRabbit GitHub App

**Points:** 8 | **Priority:** 🔴 Critical

### User Story
**Como** developer, **Quero** CodeRabbit GitHub App, **Para** análise automática em PRs

### Scope
- Install CodeRabbit GitHub App durante `aios setup-github`
- Configure `.coderabbit.yaml`
- Test PR review automation

### Tasks (8 pts = 3 dias)
- [ ] 4.3.1: CodeRabbit App installation (4h)
- [ ] 4.3.2: Configuration file (3h)
- [ ] 4.3.3: Integration with Layer 2 (4h)
- [ ] 4.3.4: Test on real PRs (5h)

**Total:** 16h

---

## STORY 4.4: CI/CD Workflows

**Points:** 5 | **Priority:** 🟠 High

### User Story
**Como** developer, **Quero** CI/CD workflows, **Para** automação de tests + deploy

### Scope
Create `.github/workflows/`:
- `ci.yml` - Run tests on push
- `cd.yml` - Deploy on merge to main
- `pr-validation.yml` - Layer 2 validation

### Tasks (5 pts = 2 dias)
- [ ] 4.4.1: CI workflow (3h)
- [ ] 4.4.2: CD workflow (4h)
- [ ] 4.4.3: PR validation (3h)
- [ ] 4.4.4: Test workflows (3h)

**Total:** 13h

---

## STORY 4.5: Felix DevOps Agent Integration

**Points:** 5 | **Priority:** 🟠 High

### User Story
**Como** Felix (DevOps Agent), **Quero** integração com setup-github, **Para** orquestrar DevOps tasks

### Scope
Felix orchestrates:
- Repo creation
- Secret management
- CI/CD setup
- Deployment configuration

### Tasks (5 pts = 2 dias)
- [ ] 4.5.1: Felix integration (4h)
- [ ] 4.5.2: Orchestration logic (4h)
- [ ] 4.5.3: Test with Felix (3h)

**Total:** 11h

---

## STORY 4.6: Deployment Automation

**Points:** 8 | **Priority:** 🟠 High

### User Story
**Como** developer, **Quero** deployment automation, **Para** deploy em Vercel/Railway/Netlify

### Scope
Support 3 providers:
- Vercel (Next.js focus)
- Railway (backend focus)
- Netlify (static sites)

```bash
$ aios deploy --provider=vercel
$ aios deploy --provider=railway
$ aios deploy --provider=netlify
```

### Tasks (8 pts = 3 dias)
- [ ] 4.6.1: Vercel integration (5h)
- [ ] 4.6.2: Railway integration (5h)
- [ ] 4.6.3: Netlify integration (4h)
- [ ] 4.6.4: Configuration management (3h)
- [ ] 4.6.5: Test deployments (5h)

**Total:** 22h

---

## STORY 4.7: Documentation Sprint 4

**Points:** 3 | **Priority:** 🟡 Medium

### Deliverables
1. **GitHub Setup Guide** (`docs/guides/github-setup.md`)
2. **CI/CD Guide** (`docs/guides/cicd-workflows.md`)
3. **Deployment Guide** (`docs/guides/deployment-automation.md`)
4. **Felix DevOps Guide** (`docs/guides/felix-devops-agent.md`)

### Tasks (3 pts = 1 dia)
- [ ] 4.7.1: GitHub setup guide (2h)
- [ ] 4.7.2: CI/CD guide (2h)
- [ ] 4.7.3: Deployment guide (3h)
- [ ] 4.7.4: Felix guide (2h)

**Total:** 9h

---

## 🔗 Dependencies

**4.1 depends on:** None (foundation)  
**4.2 depends on:** [4.1] GitHub CLI  
**4.3 depends on:** [4.2] Repo Setup  
**4.4 depends on:** [4.2] Repo Setup  
**4.5 depends on:** [4.2] Repo Setup  
**4.6 depends on:** [4.4] CI/CD  
**4.7 depends on:** All Sprint 4 stories  

---

**Criado por:** River 🌊

