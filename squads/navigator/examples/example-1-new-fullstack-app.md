# Example 1: New Fullstack App (E-commerce Platform)

This example shows how to use Navigator to set up and navigate through a complete fullstack e-commerce project from scratch.

---

## Context

**Project:** E-commerce platform with Next.js frontend and Node.js backend
**Features:** Product catalog, shopping cart, checkout, order management
**Team:** Solo developer
**Timeline:** 8 weeks

---

## Step 1: Activate Navigator

```bash
@navigator
```

**Output:**
```
🧭 Navigator Agent ready

Available commands:
  *map-project - Map new project from description
  *where-am-i - Detect current phase
  *auto-navigate - Autonomous navigation
  ...
```

---

## Step 2: Map the Project

```bash
*map-project
```

**Navigator asks:**
```
📋 Describe your project:
```

**Your input:**
```
E-commerce platform with the following features:

Frontend:
- Next.js 14 with App Router
- Product listing with filters and search
- Shopping cart with local persistence
- Checkout flow with Stripe integration
- User authentication (email/password)

Backend:
- Node.js + Express API
- PostgreSQL database
- RESTful endpoints for products, orders, users
- JWT authentication
- Payment processing with Stripe

Tech Stack:
- Frontend: Next.js, TypeScript, Tailwind CSS, Zustand
- Backend: Node.js, Express, Prisma ORM
- Database: PostgreSQL
- Deployment: Vercel (frontend), Railway (backend)
```

**Navigator generates:**
```
✅ Roadmap generated!

📁 Saved to:
  - .aios/navigator/ecommerce-platform/roadmap.md
  - docs/roadmap.md (local copy)

📊 10 phases mapped:
  1. Pesquisa → @analyst
  2. PRD → @pm
  3. Arquitetura → @architect
  4. Épicos → @pm
  5. Stories → @sm
  6. Validação → @po
  7. Desenvolvimento → @dev
  8. QA & Testes → @qa
  9. Fix Loop → @dev
  10. Deploy → @devops

🚀 Starting point detected: Phase 1 (Pesquisa)
```

---

## Step 3: Review the Generated Roadmap

```bash
*show-roadmap
```

**Output (excerpt):**
```yaml
---
project_name: ecommerce-platform
version: 1.0.0
created_at: 2026-02-15T14:30:00Z
phases:
  - id: 1
    name: Pesquisa
    agent: "@analyst"
    icon: "🔍"
    command: "*research"
    description: "Market research, competitor analysis, user personas"
    inputs: []
    outputs:
      - "docs/research/market-analysis.md"
      - "docs/research/competitor-analysis.md"
      - "docs/research/user-personas.md"
    next_phase: 2

  - id: 2
    name: PRD
    agent: "@pm"
    icon: "📋"
    command: "*create-prd"
    description: "Product Requirements Document"
    inputs:
      - "docs/research/**/*.md"
    outputs:
      - "docs/prd/prd.yaml"
    next_phase: 3

  # ... phases 3-10
---
```

---

## Step 4: Start Phase 1 (Pesquisa)

```bash
*auto-navigate
```

**Navigator output:**
```
📍 Current Phase: 1 — Pesquisa (0% complete)
🤖 Next Agent: @analyst

🎯 Suggested command:
  @analyst *research

💡 What to do:
  1. Research e-commerce market trends
  2. Analyze competitors (Shopify, WooCommerce, etc.)
  3. Define user personas (buyers, sellers, admins)

📂 Expected outputs:
  - docs/research/market-analysis.md
  - docs/research/competitor-analysis.md
  - docs/research/user-personas.md
```

**Execute:**
```bash
@analyst
*research
```

---

## Step 5: Complete Phase 1

After @analyst completes research, check progress:

```bash
@navigator
*where-am-i
```

**Output:**
```
📍 Current Phase: 1 — Pesquisa (100% complete) ✅

📂 Outputs found:
  ✅ docs/research/market-analysis.md
  ✅ docs/research/competitor-analysis.md
  ✅ docs/research/user-personas.md

✨ Ready to advance to Phase 2
```

---

## Step 6: Create Checkpoint (Optional)

```bash
*checkpoint
```

**Output:**
```
📸 Checkpoint created!

ID: cp-1-manual-20260215-143500
Path: .aios/navigator/ecommerce-platform/checkpoints/cp-1-manual-20260215-143500.json

Snapshot includes:
  - Phase: 1 (Pesquisa)
  - Completion: 100%
  - Outputs: 3 files
  - Git commit: a1b2c3d
```

---

## Step 7: Advance to Phase 2 (PRD)

```bash
*auto-navigate
```

**Output:**
```
📍 Current Phase: 2 — PRD (0% complete)
🤖 Next Agent: @pm

🎯 Suggested command:
  @pm *create-prd

💡 What to do:
  1. Review research outputs
  2. Define product features and priorities
  3. Create PRD document

📂 Expected outputs:
  - docs/prd/prd.yaml
```

**Execute:**
```bash
@pm
*create-prd
```

---

## Step 8: Continue Through Pipeline

Repeat the cycle for remaining phases:

**Phase 3:** @architect designs architecture
**Phase 4:** @pm breaks down into epics
**Phase 5:** @sm creates user stories
**Phase 6:** @po validates stories
**Phase 7:** @dev implements code
**Phase 8:** @qa runs tests
**Phase 9:** @dev fixes issues (if any)
**Phase 10:** @devops deploys to production

---

## Step 9: Track Progress Anytime

During development, check status:

```bash
@navigator
*status-report
```

**Output:**
```
📊 E-commerce Platform - Status Report
Generated: 2026-02-15 16:45:00

📍 Current Phase: 7 — Desenvolvimento (42% complete)

✅ Completed Phases:
  1. Pesquisa (100%)
  2. PRD (100%)
  3. Arquitetura (100%)
  4. Épicos (100%)
  5. Stories (100%)
  6. Validação (100%)

🔄 In Progress:
  7. Desenvolvimento (42%)
     - ✅ Story 7.1: Product listing API (done)
     - ✅ Story 7.2: Shopping cart API (done)
     - 🔄 Story 7.3: Checkout API (in progress)
     - ⏳ Story 7.4: User auth API (pending)
     - ⏳ Story 7.5: Frontend components (pending)

⏳ Pending Phases:
  8. QA & Testes
  9. Fix Loop (if needed)
  10. Deploy

🚫 Blockers: None

📅 Next Steps:
  1. Complete Story 7.3 (checkout API)
  2. Implement Story 7.4 (user auth)
  3. Build frontend components (Story 7.5)
  4. Advance to Phase 8 (QA)
```

---

## Step 10: Final Deployment

After QA passes:

```bash
@navigator
*auto-navigate
```

**Output:**
```
📍 Current Phase: 10 — Deploy (0% complete)
🤖 Next Agent: @devops

🎯 Suggested command:
  @devops *deploy

💡 What to do:
  1. Push code to GitHub
  2. Deploy frontend to Vercel
  3. Deploy backend to Railway
  4. Configure environment variables
  5. Run production smoke tests

📂 Expected outputs:
  - .github/workflows/deploy.yml
  - Production URLs in deployment log
```

---

## Final Result

```
🎉 Project Complete!

📊 Summary:
  - Total phases: 10/10 (100%)
  - Total time: 7 weeks
  - Stories completed: 34
  - Lines of code: ~15,000
  - Checkpoints created: 12

🌐 Production URLs:
  - Frontend: https://ecommerce-platform.vercel.app
  - Backend API: https://ecommerce-api.railway.app
  - Admin panel: https://admin.ecommerce-platform.vercel.app

📁 Repository:
  - https://github.com/username/ecommerce-platform
```

---

## Key Takeaways

1. **Roadmap saves time** - Clear path from research to deployment
2. **Phase detection prevents confusion** - Always know where you are
3. **Agent handoffs are smooth** - Navigator delegates to right specialist
4. **Checkpoints enable recovery** - Resume after breaks without context loss
5. **Progress tracking builds confidence** - See tangible advancement

---

## Next Steps

- Use `*orchestrate` for parallel story execution
- Create custom pipeline for different project types
- Share roadmap with stakeholders
- Archive completed project for reference

---

*Example completed on 2026-02-15 using Navigator v1.0.0*
