# Expansion Packs Structure Inventory

**Date:** 2025-11-12  
**Story:** 4.8 - Repository Open-Source Migration  
**Phase:** 1.1 - Structure Documentation

---

## Current Expansion Packs Structure

### Total Packs: 8

1. **etl** - ✅ OPEN-SOURCE (stays in `aios-fullstack`)
2. **expansion-creator** - ✅ OPEN-SOURCE (stays in `aios-fullstack`)
3. **creator** - ❌ PRIVATE (move to `aios-expansion-packs`)
4. **innerlens** - ❌ PRIVATE (move to `aios-expansion-packs`)
5. **mmos-mapper** - ❌ PRIVATE (move to `aios-expansion-packs`)
6. **aios-infrastructure-devops** - ❌ PRIVATE (move to `aios-expansion-packs`)
7. **meeting-notes** - ❌ PRIVATE (move to `aios-expansion-packs`)
8. **example-pack** - ⚠️ DECISION NEEDED (template/example - see below)

---

## Detailed Structure by Pack

### 1. ETL (Open-Source - Stays)

**Location:** `expansion-packs/etl/`

**Structure:**
```
etl/
├── agents/              # 6 agents
│   ├── data-collector.md
│   ├── document-specialist.md
│   ├── social-specialist.md
│   ├── web-specialist.md
│   ├── youtube-specialist.md
│   └── zlibrary-harvester.md
├── tasks/               # 10 tasks
│   ├── chunk-and-index.md
│   ├── collect-all-sources.md
│   ├── collect-books.md
│   ├── resume-collection.md
│   ├── social-specialist-collect-social.md
│   ├── validate-collection.md
│   ├── web-specialist-collect-blogs.md
│   ├── youtube-specialist-collect-podcasts.md
│   └── youtube-specialist-collect-youtube.md
├── checklists/
├── config/
├── config.yaml
├── data/
├── package.json
├── README.md
├── templates/
├── utils/
└── workflows/
```

**Status:** ✅ Stays in `aios-fullstack` (open-source)

---

### 2. Expansion-Creator (Open-Source - Stays)

**Location:** `expansion-packs/expansion-creator/`

**Structure:**
```
expansion-creator/
├── agents/              # 1 agent
│   └── expansion-creator.md
├── checklists/         # 1 checklist
│   └── expansion-pack-checklist.md
├── config/
├── config.yaml
├── data/               # 1 KB file
│   └── expansion-pack-kb.md
├── package.json
├── PROJECT-COMPLETION.md
├── README.md
├── tasks/              # 5 tasks
│   ├── create-expansion-agent.md
│   ├── create-expansion-pack.md
│   ├── create-expansion-task.md
│   ├── create-expansion-template.md
│   └── install-expansion-commands.md
├── templates/          # 5 templates
│   ├── expansion-agent-tmpl.md
│   ├── expansion-config-tmpl.yaml
│   ├── expansion-readme-tmpl.md
│   ├── expansion-task-tmpl.md
│   └── expansion-template-tmpl.yaml
├── user-guide.md
├── utils/
└── workflows/
```

**Status:** ✅ Stays in `aios-fullstack` (open-source, enables community contributions)

---

### 3. Creator (Private - Move)

**Location:** `expansion-packs/creator/`

**Structure:**
```
creator/
├── agents/              # 3 agents
│   ├── blog-writer.md
│   ├── content-orchestrator.md
│   └── course-architect.md
├── checklists/
├── config/
├── config.yaml
├── data/
├── package.json
├── README.md
├── tasks/               # 4 tasks
│   ├── blog-writer-generate-blog-post.md
│   ├── course-architect-continue-course.md
│   ├── course-architect-generate-course-v1-backup.md
│   └── course-architect-generate-course.md
├── templates/
├── utils/
└── workflows/
```

**Status:** ❌ Move to `aios-expansion-packs` (CreatorOS - proprietary)

---

### 4. InnerLens (Private - Move)

**Location:** `expansion-packs/innerlens/`

**Structure:**
```
innerlens/
├── agents/              # 4 agents
│   ├── fragment-extractor.md
│   ├── innerlens-orchestrator.md
│   ├── psychologist.md
│   └── quality-assurance.md
├── checklists/
├── config/
├── config.yaml
├── data/
├── package.json
├── README.md
├── tasks/               # 5 tasks
│   ├── fragment-extractor-extract-fragments.md
│   ├── psychologist-analyze-bigfive.md
│   ├── psychologist-detect-traits-quick.md
│   ├── quality-assurance-validate-mius.md
│   └── save-fragments-to-mmos.md
├── templates/
├── utils/
└── workflows/
```

**Status:** ❌ Move to `aios-expansion-packs` (proprietary)

---

### 5. MMOS-Mapper (Private - Move)

**Location:** `expansion-packs/mmos-mapper/`

**Structure:**
```
mmos-mapper/
├── agents/              # 7 agents
│   ├── cognitive-analyst.md
│   ├── debate.md
│   ├── emulator.md
│   ├── mind-mapper.md
│   ├── mind-pm.md
│   ├── research-specialist.md
│   └── system-prompt-architect.md
├── checklists/
├── config/
├── config.yaml
├── data/
├── package.json
├── README.md
├── tasks/               # 12 tasks
│   ├── brownfield-update.md
│   ├── cognitive-analyst-cognitive-analysis.md
│   ├── emulator-activate-clone.md
│   ├── emulator-test-fidelity.md
│   ├── execute-mmos-pipeline.md
│   ├── mind-pm-mind-validation.md
│   ├── mind-pm-viability-assessment.md
│   ├── reexecute-mind.md
│   ├── reexecute-phase.md
│   ├── research-specialist-research-collection.md
│   ├── synthesis-compilation.md
│   └── system-prompt-architect-system-prompt-creation.md
├── templates/
├── utils/
└── workflows/
```

**Status:** ❌ Move to `aios-expansion-packs` (proprietary)

**Note:** Has workflow dependency on ETL (documented, not code import)

---

### 6. AIOS-Infrastructure-DevOps (Private - Move)

**Location:** `expansion-packs/aios-infrastructure-devops/`

**Structure:**
```
aios-infrastructure-devops/
├── agents/              # 1 agent
│   └── infra-devops-platform.md
├── checklists/         # 1 checklist
│   └── infrastructure-checklist.md
├── config.yaml
├── data/               # 1 KB file
│   └── aios-kb.md
├── README.md
├── tasks/              # 2 tasks
│   ├── infra-devops-platform-review-infrastructure.md
│   └── infra-devops-platform-validate-infrastructure.md
└── templates/          # 2 templates
    ├── infrastructure-architecture-tmpl.yaml
    └── infrastructure-platform-from-arch-tmpl.yaml
```

**Status:** ❌ Move to `aios-expansion-packs` (proprietary)

---

### 7. Meeting-Notes (Private - Move)

**Location:** `expansion-packs/meeting-notes/`

**Structure:**
```
meeting-notes/
├── agents/              # 1 agent
│   └── meeting-organizer.md
├── checklists/         # 1 checklist
│   └── meeting-effectiveness-checklist.md
├── config.yaml
├── data/               # 1 KB file
│   └── meeting-best-practices.md
├── README.md
├── tasks/              # 1 task
│   └── meeting-organizer-create-meeting-notes.md
├── templates/          # 1 template
│   └── meeting-notes-template.yaml
└── VALIDATION-REPORT.md
```

**Status:** ❌ Move to `aios-expansion-packs` (proprietary)

---

### 8. Example-Pack (Decision Needed)

**Location:** `expansion-packs/example-pack/`

**Structure:**
```
example-pack/
└── tools/
    ├── api/
    ├── cli/
    ├── local/
    └── mcp/
```

**Status:** ⚠️ **DECISION NEEDED**

**Options:**
1. **Delete** - It's just an example/template
2. **Move to `aios-expansion-packs`** - Keep as reference for private packs
3. **Move to `expansion-creator`** - Use as template for community packs
4. **Keep in `aios-fullstack`** - Public example for community

**Recommendation:** Move to `expansion-creator` as a template example (Option 3)

---

## Summary Statistics

### Open-Source Packs (Stay in `aios-fullstack`)
- **ETL:** 6 agents, 10 tasks
- **Expansion-Creator:** 1 agent, 5 tasks, 5 templates

### Private Packs (Move to `aios-expansion-packs`)
- **Creator:** 3 agents, 4 tasks
- **InnerLens:** 4 agents, 5 tasks
- **MMOS-Mapper:** 7 agents, 12 tasks
- **AIOS-Infrastructure-DevOps:** 1 agent, 2 tasks, 2 templates
- **Meeting-Notes:** 1 agent, 1 task, 1 template

### Total Counts
- **Agents:** 22 total (16 private, 6 open-source)
- **Tasks:** 39 total (24 private, 15 open-source)
- **Templates:** 8 total (3 private, 5 open-source)

---

## Migration Checklist

### Packs to Move
- [ ] creator/
- [ ] innerlens/
- [ ] mmos-mapper/
- [ ] aios-infrastructure-devops/
- [ ] meeting-notes/

### Packs to Keep
- [x] etl/ (open-source)
- [x] expansion-creator/ (open-source)

### Decision Needed
- [ ] example-pack/ (recommendation: move to expansion-creator as template)

---

**Created:** 2025-11-12  
**Next Step:** Identify internal tools vs public tools in `tools/` and `scripts/`

