# The BMAD-Method (Breakthrough Method of Agile (ai-driven) Development)

**BETA-V3 is the current focus of development and represents the latest iteration of the BMAD Method.** Find all V3 resources in the `BETA-V3/` directory.

#### A demo of full beta run one all of its output artifacts along with an explanation of what each file represents is avilable [here](BETA-V3/v3-demos/full-stack-app-demo/readme.md)

If you want to jump right in, here are the [Setup Instructions for V3](./BETA-V3/instruction.md) For IDE, WEB and Task setup.

## BETA-V3: Advancing AI-Driven Development

Welcome to **BETA-V3**! This version represents a significant evolution, building upon the foundations of V2 and introducing a more refined and comprehensive suite of agents, templates, checklists, and processes.

Feel free to try it out - its beta, so please know its still undergoing testing and updates and there are some significant (amazing improvements) changes.

_Previous versions (`LEGACY-V1` and `CURRENT-V2`) are available for historical reference but are no longer actively maintained._

## What's New in BETA-V3?

BETA-V3 introduces several key enhancements to streamline your AI-driven development lifecycle:

- **Enhanced Agent Roles & Phases:** The core agents (Analyst, PM, Architect) have more clearly defined operational phases, inputs, and outputs, leading to smoother transitions.
- **New Specialized Agents:**
  - **Design Architect (`4-design-architect.md`):** A dedicated agent for projects with User Interfaces, handling UI/UX Specification and Frontend Technical Architecture in distinct modes.
  - **Technical POSM (`5-posm.md`) (Product Owner & Scrum Master):** A unified agent with critical new capabilities:
    - **Master Checklist Phase:** Validates all project documentation against a comprehensive checklist (`po-master-checklist.txt`).
    - **Librarian Phase:** Decomposes large documents into a granular, indexed (`docs/index.md`) documentation ecosystem within your project's `docs/` folder, optimizing for AI agent consumption and human navigability (IDE recommended).
    - **Story Creator Phase:** Autonomously generates detailed, developer-ready story files using the granular documentation.
  - **Release Train Engineer (RTE-Agent) (`6-rte.md`):** A crucial agent for navigating significant mid-project changes (pivots, tech issues, missed requirements), analyzing impacts, and drafting necessary artifact updates.
- **Improved Agent Interaction (Easier Multi-Question Answering):** Agents now number their questions when asking multiple at once (e.g., "1., 2a., 2b."). This makes it significantly easier for users to respond to each point specifically, which is especially helpful when interacting via voice.
- **Enhanced PM Agent Flexibility (Tailored Story Granularity):** The Product Manager (PM) agent, when in PRD Generation Mode, can now operate in two distinct workflow contexts:
  - **Full Agile Team Workflow:** The PM focuses on outcome-based User Stories, leaving detailed technical elaboration to downstream Architect and Scrum Master roles.
  - **Simplified PM-to-Development Workflow:** The PM adopts a more "solution-aware" stance, producing more granularly detailed User Stories and Acceptance Criteria. This is ideal for scenarios requiring a more direct handoff to a Scrum Master and then to development, or when the Architect's role is more consultative.
- **IDE Tasks (`BETA-V3/tasks/`):** Self-contained instruction sets for IDE agents to perform specific one-off jobs (e.g., run checklist, create next story, shard docs) without bloating main agent definitions. [Read more below](#ide-tasks-v3-exclusive).
- **Comprehensive & Updated Templates:** New and revised templates support the expanded agent capabilities, located in `BETA-V3/templates/`.
- **Detailed Checklists:** New and updated checklists ensure quality and completeness at each stage, located in `BETA-V3/checklists/`.
- **Streamlined Workflow & Documentation Focus:** A more explicit, iterative workflow incorporating all agents, with a strong emphasis on creating and maintaining a robust, granular, and indexed documentation structure (`docs/`) to support development.
- **Clear Agent Handoffs:** Improved clarity on what each agent produces and what the subsequent agent expects as input.
- **Optimized IDE Agents:** IDE agent modes (`BETA-V3/ide-agent-modes/`) are optimized for size (<6k tokens) for broader IDE compatibility.
- **Web UI Parity:** Agent instructions and templates are designed for use in both web-based UIs (instructions and files in `BETA-V3/web-agent-modes/`) and IDE custom modes.

## Guiding Principles (V3)

- **Environment Recommendations & Workflow:**
  - **Web UI Preferred for Initial Planning (Agents 0-5):** For initial ideation, research, PRD creation, architecture design, UI/UX specification, and initial documentation validation (Analyst, PM, Architect, Design Architect, and POSM Master Checklist phase), Web UIs (Gems/Custom GPTs) are highly effective and often more cost-efficient for the iterative, conversational nature of these tasks.
  - **POSM - Librarian & Story Creator:** While the POSM's Librarian phase (document sharding and indexing) is strongly recommended for an IDE due to file system operations, the Story Creator phase _can_ be done in a Web UI. However, an IDE is often preferred for easier cross-referencing with existing `docs/` content and the eventual codebase.
  - **IDE Recommended for Execution & Specialized Tasks:** For development (Dev Agent), detailed story generation (SM Agent or POSM Story Creator in IDE), and managing significant mid-project changes (RTE-Agent), an IDE environment with custom agent modes is generally more powerful and efficient. The core recommended IDE agents, especially after initial web-based planning, are the **Dev Agent, SM/Story Creator, and RTE-Agent**.
- **Quality & Information Flow (V3 Enhancements):**
  - The **PM Agent** is tuned to produce higher quality, more detailed Epics and User Stories.
  - There's improved consistency between what the **SM Agent (or POSM in Story Creator mode)** includes in story files and what the **Dev Agent** expects. The SM focuses on embedding necessary contextual details directly into the story.
  - The **Dev Agent** is programmed to always consult standard project documents like `docs/coding-standards.md` and `docs/project-structure.md` upon starting a new story. This reduces the need to repeat this boilerplate information in every story file, keeping stories leaner and focused on the specific requirements.
- **No Rules Required (Flexibility):** Agents primarily reference project documents (PRDs, architecture docs, coding standards, etc.) rather than relying heavily on proprietary AI platform rule systems. This promotes flexibility and reduces platform lock-in.
- **Iterative & Collaborative:** The method emphasizes a step-by-step, interactive process where agents collaborate with the user, pausing for input and validation at key decision points.

## What is the BMad Method?

The BMad Method is a revolutionary approach that elevates "vibe coding" to "Vibe CEOing." It provides a structured yet flexible framework to plan, execute, and manage software projects using a team of specialized AI agents. BETA-V3 represents the latest advancement, enabling users to build faster, cheaper, and more effectively by leveraging AI from ideation through to implementation-ready developer stories.

The method is designed to be tool-agnostic in principle, with agent instructions and workflows adaptable to various AI platforms and IDEs.

Join the [Community Discussion Forum](https://github.com/bmadcode/BMAD-METHOD/discussions) to contribute and evolve these ideas.

## Custom Modes and Welcome Contributions

The BMAD community's input is invaluable! We encourage you to contribute by submitting Pull Requests for V3 custom agent modes, new templates, or checklist enhancements tailored for the `BETA-V3` system.

The Custom Agents in `BETA-V3` follow best practices for LLM prompting (e.g., clear roles, instructions, and context) ensuring they work effectively across various AI platforms.

## BETA-V3 Agent Overview

The `BETA-V3` system features a refined team of specialized AI agents (refer to `BETA-V3/web-agent-modes/` or `BETA-V3/ide-agent-modes/` for full details):

### 0. BMAD Method Advisor (`0-bmad.md`)

The primary guide to understanding and navigating the BMAD Method V3, explaining agent roles, workflows, tasks, and best practices.

### 1. Analyst (`1-analyst.md`)

Starting point for new/unclear ideas.
**Phases:** Brainstorming, Deep Research (broad market/feasibility), Project Briefing.
**Key Output:** **Project Brief**.

### 2. Product Manager (PM) (`2-pm.md`)

Transforms ideas/briefs into detailed product plans.
**Phases:** Deep Research (focused strategy validation), PRD Generation (Epics, Stories, tech assumptions using `prd-tmpl.txt` & `pm-checklist.txt`), Product Advisor.
**Key Output:** **Product Requirements Document (PRD)**.

### 3. Architect (`3-architect.md`)

Defines the overall technical blueprint.
**Phases:** Deep Research Prompt Generation, Architecture Creation (using `architecture-tmpl.txt` & `architect-checklist.txt`), Master Architect Advisory.
**Key Output:** **Technical Architecture Document**.

### 4. Design Architect (`4-design-architect.md`)

Specializes in UI/UX and frontend technical strategy.
**Modes:** UI/UX Specification (using `front-end-spec-tmpl.txt`), Frontend Architecture (using `front-end-architecture-tmpl.txt` & `frontend-architecture-checklist.txt`), AI Frontend Generation Prompt.
**Key Outputs:** **UI/UX Spec**, **Frontend Architecture Doc**.

### 5. Technical POSM (`5-posm.md`)

Ensures documentation quality and prepares for development.
**Phases:** Master Checklist (using `po-master-checklist.txt`), Librarian (creates `docs/` structure & `index.md`), Story Creator (using `story-tmpl.txt`).
**Key Outputs:** **Checklist Report**, Organized granular documentation, **Story Files**.

### 6. Release Train Engineer (RTE-Agent) (`6-rte.md`)

Manages significant mid-project changes and pivots.
**Process:** Uses `rte-checklist.md` for impact analysis, evaluates paths, drafts artifact updates.
**Key Output:** **Sprint Change Proposal** (with analysis and proposed edits).

### 7. Developer Agents (e.g., `dev-agent.md`)

(Specific prompts in `BETA-V3/ide-agent-modes/`)
Implement features based on stories, adhering to architecture and standards (`coding-standards.md`, `project-structure.md`, etc.).

## IDE Tasks (V3 Exclusive!)

Located in `BETA-V3/tasks/`, these self-contained instruction sets allow IDE agents to perform specific one-off jobs on demand, reducing the need for overly complex agent modes.

**Purpose:**

- **Reduce Agent Bloat:** Avoid adding rarely used instructions to primary agents.
- **On-Demand Functionality:** Instruct any capable IDE agent to execute a task by providing the task file content.
- **Versatility:** Handles specific functions like running checklists, creating stories, sharding documents, indexing libraries, etc.

Think of tasks as specialized mini-agents callable by your main IDE agents.

## BETA-V3 Step-by-Step Process (Typical Flow)

1.  **Analyst (`1-analyst.md`):** (Optional) -> **Project Brief**.
2.  **PM (`2-pm.md`):** Project Brief/idea -> **PRD** (Epics, Stories).
3.  **Architect (`3-architect.md`):** PRD -> **System Architecture Document**.
4.  **Design Architect (`4-design-architect.md`):** (If UI) PRD, System Arch -> **UI/UX Spec**, **Frontend Architecture Doc**.
5.  **POSM (`5-posm.md`) - Master Checklist Phase:** Validates docs -> **Master Checklist Report**.
6.  _(User/Agents apply changes based on POSM report)_.
7.  **POSM (`5-posm.md`) - Librarian Phase:** Processes updated docs -> Granular `docs/` files & `index.md`.
8.  **POSM (`5-posm.md`) - Story Creator Phase:** -> **Developer Story Files**.
9.  **Developer Agents:** Implement stories.
10. **(If major issue arises): RTE-Agent (`6-rte.md`):** -> **Sprint Change Proposal** (with proposed edits). Apply edits or handoff if replan needed.
11. **Ongoing Advisory:** Architect & PM provide continuous support.

_This is a guideline; the method is iterative._

## Tooling & Setup (BETA-V3)

- **Templates:** `BETA-V3/templates/`
- **Checklists:** `BETA-V3/checklists/`
- **Web UI Agents:** `BETA-V3/web-agent-modes/` (Use with Gemini Gems/Custom GPTs. Attach relevant templates/checklists).
- **IDE Agents:** `BETA-V3/ide-agent-modes/` (Optimized for IDE custom modes).
- **Tasks:** `BETA-V3/tasks/` (For IDE usage).
- **Instructions:** See [Setup Instructions](./BETA-V3/instruction.md) for details.

## Historical Versions (V1 & V2)

_Brief summary of V1/V2 can remain here or be moved to a separate historical doc if desired._
_(Original V2 sections like "What's New in V2?", "Full Demonstration Walkthrough" (referencing V2 demo), "No Rules Required!", "IDE Agent Integration" (referencing V2 paths), etc. would be reviewed, summarized, or removed to avoid confusion with V3)._

## License

[License](./LICENSE)

## Contributing

Interested in improving the BMAD Method BETA-V3? See our [contributing guidelines](CONTRIBUTING.md).
