# The BMad Code Method

## Major Update: V2 (beta) Release

The BMad Method has undergone a significant transformation with our V2 (beta) release! The previous implementation (still available in the `LEGACY-V1` folder) has been replaced by a drastically improved workflow and agent system in the `CURRENT-V2` folder.

## What's New in V2?

- **Optimized Agent Prompts**: Completely revised agent prompts for better outputs
- **Standardized Templates**: Comprehensive set of templates for consistent document creation
- **Streamlined Workflow**: Clearer process from idea to deployment
- **Improved Agile Integration**: Better support for agile methodologies
- **Agent vs Gem Agent Distinction**: V2 has specific [gems](#custom-gems-and-gpts) (agent with embedded templates) in parity with the IDE agents.

## No Rules Required!

One of the biggest advantages of the BMad Method is that it doesn't require custom rules when using the custom agents. The dev agents and other personas are configured to automatically reference standards documents when coding. This provides two major benefits:

1. **No Platform Lock-in**: Work across any AI system without being tied to proprietary rule formats
2. **Maximum Flexibility**: Still compatible with rules-based systems like Claude or Cursor if you prefer that approach

This flexibility allows you to choose the implementation that works best for your workflow while maintaining consistent quality across your project.

## What is the BMad Method?

The BMad Method is a revolutionary approach that elevates "vibe coding" to the next level—what I call "Vibe CEOing." Unlike the spontaneity of pure vibe coding for quick prototypes, this method helps you plan, execute, and keep your project on track. Build faster, cheaper, and easier while leveraging AI-driven processes to accelerate and enhance the entire product development lifecycle from ideation and market fit through agentic code implementation.

This V2 release incorporates valuable feedback from V1 users and draws inspiration from projects like Claude's memory bank and the Taskmaster project. However, the BMad Method goes further by providing a comprehensive framework for those who want to thoroughly define and develop projects from conception to completion.

This comprehensive, step-by-step approach transforms a product idea into a fully implemented application by:

1. Structuring the development process into distinct AI persona-based phases
2. Generating detailed artifacts at each phase
3. Using a sequential workflow to track progress
4. Enabling AI to code the full application based on generated specifications

The method is tool agnostic with a workflow built into the role-prompts, making it adaptable to any agentic coding toolset, IDE, or platform.

Join the [Community Discussion Forum](https://github.com/bmadcode/BMAD-METHOD/discussions) to help contribute and evolve these ideas.

### Video Tutorials

- The legacy workflow is explained in [Part 1 and 2 on the BMad Code YouTube channel](https://youtu.be/JbhiLUY_V2U)
- A new tutorial for the V2 workflow will be coming soon - with a full end to end project build!

## Coming Soon(ish)

- A fully output of a simple and advanced project artifact files of executing the agents to build all the artifacts for a project build with prompt examples that lead to the output from the agents.
- Exploration into leveraging MCP.

## Workflow Visual Diagram

[View Diagram](./workflow-diagram.md)

## Custom Agent Overview

### Analyst (Business Analyst (BA), Research Assistant (RA), Brainstorming Coach)

The Analyst agent is a versatile entry point into the BMad Method, operating in three distinct modes: Brainstorming Coach, Deep Research, and Project Briefing. It helps transform initial ideas or vague concepts into well-defined project briefs through creative ideation techniques, market analysis, or structured requirement gathering. In Brainstorming mode, it uses proven techniques like SCAMPER and "What if" scenarios to expand possibilities. The Deep Research mode generates comprehensive research prompts to explore market needs, competitors, and target users. Finally, the Project Briefing mode collaboratively builds a structured brief document with a dedicated PM Agent Handoff Prompt section that provides strategic guidance for the next phase. This agent is ideal for users who need help refining their vision before moving to detailed product definition.

### Product Manager (PM)

### Product Owner (PO)

## Scrum Master (SM)

### Dev Agent (Dev)

## Step-by-Step Process

### Phase 0: Ideation (Optional)

1. Start with the **Business Analyst (BA)** agent if your idea is vague
2. The BA will help analyze market conditions and competitors
3. Output is a **Project Brief** used as input for the Product Manager

If you are unsure, start by saying something like the following to brainstorm with the BA with this simple goal eliciting prompt:

- I have an idea for an app I want to brainstorm with you,
- it can do (X)
- so that (y)
- for (Z) user(s)

  **Example:** 'I have an idea for an app I want to brainstorm with you, it can **help small business owners automatically** generate professional social media content, so that they can **maintain consistent online presence without hiring expensive marketing agencies**, for **time-starved entrepreneurs** who know social media is important but don't have the skills or time to create quality content daily'

### Phase 1: Product Definition

1. The **Product Manager (PM)** agent takes the project brief or your idea
2. PM creates a comprehensive Product Requirements Document (PRD) along with high level epic / story flow docs. (Separate files reduce overall context for future agents - this is in the V2+ version)
3. Initial epic breakdowns are drafted

### Phase 2: Technical Design

1. The **Architect** agent reviews the PRD and creates an architecture document and in V2 granular artifacts that optimize for LLM context space of chosen future agents!
2. Architect identifies technical dependencies and reference files
3. Optional: Use Deep Research mode for more in-depth technical exploration

### Phase 3: Refinement and Validation

1. PM, Architect, and Scrum Master collaborate to refine the plan
2. **Product Owner (PO)** validates scope, story sequence, and PRD alignment
3. Final documents are approved and indexed

### Phase 4: Story Generation

1. **Technical Scrum Master** generates each story 1 at a time for the dev to complete, (OR in Gem/GPT mode it will do all remaining stories). The output story or stories are highly detailed stories with all technical details the agent will need to keep instructional context lean - not having to search all of the larger documents bloating its context with unnecessary information.

### Phase 5: Development

1. The **Developer Agent** works on stories one at a time
2. Developer creates draft stories for review before implementation
3. Code and tests are committed, and story files are updated

### Phase 6: Review and Acceptance

1. Code reviews by a new Dev Agent or Architect
2. Functionality reviews by User/QA
3. Story marked as Done when approved

### Phase 6.5: Refactor (Optional Step)

1. Architect or Dev Agent in a new Content, or the User, refactor as needed and ensure if refactor changes structure that source tree diagrams and future implementation documents are updated as needed.
2. This is not required after most stories with properly following the phases before #5 producing a solid plan and architecture - but even the best plans can lead to the emergence of an idea for beautiful restructuring. Also, best laid plans can still lead to an agent doing less than ideal things that are better to correct.
3. Remember, the main key with refactoring at this stage is ensure all was working first, the full app and new functionality has passing tests and linting, has been committed, and pushed to the remote branch. Only then would I take on a major (or even minor refactor) in most cases. If I am doing the refactor myself, I have more trust and might do it before pushing and calling the story done. But with the agent, always lock down your working changes so you have an escape hatch to revert to!

### Phase 7: Deployment

1. Developer Agent handles deployments
2. Infrastructure as Code is used for deployment commands
3. System is updated with the new functionality

## Template Dependencies

**Important:** The agents (not gems) in this system rely on template files located in the `CURRENT-V2/docs/templates` folder. These templates should remain named as they are for proper functionality and put in your projects docs/templates folder, including:

- `architecture.md`
- `story-template.md`
- `prd.md`
- `project-brief.md`
- etc... (all of the template files)

## Custom GEMs and GPTs (Highly Recommended)

**Using Agents with Web-Based AI Interfaces (Highly recommended, save lots of money, larger context windows, deep research is a game changer)**

The [gems folder](./CURRENT-V2/gems-and-gpts/) contains agent instructions embedded with optimized web use instructions - streamlined for usage within the [Gemini Gems](https://gemini.google.com/gems/create), or [OpenAIs custom GPT's](https://chatgpt.com/gpts/editor). With both custom GPTs and Gemini Gems, you will attach the templates now instead of embedding them (as was the case with V1 of this system, that was not as easy to modify). This way, as you modify templates from the templates folder, if you want to change it in the web version just save it as a .txt extension and attach to the custom GEM or GPT.

[Detailed set up and usage instructions](./CURRENT-V2/gems-and-gpts/instruction.md) are available in the folder also.

## IDE Integration

The method works with any IDE or AI assistant with these approaches:

- **Custom Modes**: For IDEs that support custom modes (Cursor, RooCode)
- **Custom Gems**: For Gemini, create a Custom Gem for each agent
- **Direct Prompting**: For any AI assistant, use the agent prompts directly

## License

[License](./LICENSE)

## Contributing

Interested in improving the BMad Method? See our [contributing guidelines](CONTRIBUTING.md).
