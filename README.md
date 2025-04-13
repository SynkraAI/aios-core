# The BMad Code Method for Pairing Human-Agentic Workflow for Product Realization and Software Development

**Breakthrough Method Agile-Ai Driven-Development (BMAD)**

Join in on the [Community Discussion Forum](https://github.com/bmadcode/BMAD-METHOD/discussions), help contribute, evolve, and advance the ideas laid out here. This is IDE Agnostic, works great with Cursor, Cline, RooCode, Augment and Aider! If it has an intelligent agent, this will help you tame it and keep the good vibes flowing!

Also check out [Part 1 on the BMad Code YouTube channel](https://youtu.be/JbhiLUY_V2U) - feel free to comment, like, and subscribe also for future videos and updates.

## Overview

The BMad Method is a revolutionary approach to software development that leverages AI-driven processes to accelerate and enhance the entire product development lifecycle. This template provides a structured framework that guides you through generating all necessary artifacts to build a complete application with AI assistance.

## What is the BMad Method?

The BMad Method is a comprehensive, step-by-step approach that transforms a product idea into a fully implemented application agile prompt chain by:

1. Structuring the development process into distinct AI persona-based phases
2. Generating detailed artifacts at each phase
3. Using a sequential workflow to track progress
4. Enabling AI to code the full application based on generated specifications that are granular and detailed, setting you up for maximal success.

## Getting Started

### Prerequisites

- An AI assistant capable of using these prompts (Claude, GPT-4, Gemini, etc.)
- Optional - Recommended: Access to Deep Research AI
- Basic understanding of Cursor / Cline / Roo / CoPilot Agent
- A software product or project idea you want to build with AI

### Workflow

The BMad Method follows a structured workflow:

1. **Idea to Documentation**: Use the prompts in order to generate all necessary project documentation
2. **Agent Rules**: Prompt Output will recommend a baseline set of rules if so desired.
3. **Kanban-style Progress Tracking**: Move generated artifacts through the folders:
   - `1-ToDo`: Sequentially ordered stories waiting to be implemented
   - `2-InProgress`: Stories currently being implemented
   - `3-Done`: Completed stories

## Prompt Sequence

The `.ai-pm/prompts` folder contains carefully crafted prompts for each phase of development.
This is for the most broadly ambitious project MVP - see the simplified prompts

1. **Research Assistant: Analysis** (`0-research-assistant.md`): Optional deep research on your product concept
2. **Business Analyst: Project Brief** (`1-business-analyst.md`): Define your product idea and MVP scope
3. **Product Manager: PRD** (`2-PM.md`): Create detailed product requirements
4. **PM/UX/UI: UI Gen Prompt** (`3-PM-UX-Ui.md`): Define comprehensive UI/UX specifications
5. **Architecture Deep Research: PRD Updates** (`4-Arch-Deep.md`): Optional deep research step for Up tp date best practice and rules generation
6. **Architect: Arch Doc** (`5-Arch.md`): Create a detailed architectural blueprint
7. **Technical Product Owner: Epic Story List** (`6-PO.md`): Break down requirements into implementable stories
8. **Technical Scrum Master: Agent Story Files** (`7-SM.md`): Transform stories into Dev Agent ready super detailed stories

There is a OPTIONAL final prompt (`8-SM-IDE.md`) - use this in your IDE with the selected agent to split up item 7 into the individual files for the ToDo folder (assuming you did not modify prompt 7 to generate the files individually within the IDE or external tool.)

## Key Benefits

- **Save Time and Money**: Predictable implementation flow with less costly rework or Agent credit burn that Vibe coding along produces
- **Consistent Documentation**: Generate comprehensive, aligned artifacts
- **AI-Optimized Workflow**: Structured Kanban Stories specifically designed for Human or AI implementation
- **Reduced Technical Debt**: Ensure architectural consistency from the start
- **Simplified Collaboration**: Clear artifacts for all stakeholders, Human and AI

## Quick How To

Recommend checking out this video series starting with [Part 1 on the BMad Code YouTube channel](https://youtu.be/JbhiLUY_V2U) and also checking the [Discussion Forum](https://github.com/bmadcode/BMAD-METHOD/discussions) in the coming days where BMad and the community hopefully will share and collaborate and give further tweaks tips and tricks!

But the **Quick and Dirt**y is:

1. Clone this project
2. Start with the first prompt in `.ai-pm/prompts/0-research-assistant.md` (or skip to 1 if research isn't needed)
3. Follow each prompt in sequence, providing output from previous steps as context to the new prompt when indicated in the current prompt
4. Once all stories are drafted by the final prompts of the SM, move generated stories through the Kanban folders as they are implemented - meaning drag the first story to InProgress, start a Agent chat and direct it to that story. Optionally, use the sample workflow (coming soon) to automate (I prefer the manual nature of dragging each item).
5. Track progress until all stories are in the `3-Done` folder

My recommendation is to take advantage of Google Gemini or ChatGPT apps, it is very economical and better in some regards.

For example with Gemini its easy to group and also create google docs from the canvas feature. I like their web interface. And it gives access to its amazing Deep Research platform, expanded NotebookLM capabilities etc.. But you can also use OpenAI, Claude, Grok or do it all also within the IDE.

If you have a subscription to one of those or even free tier access to the best models like Gemini 2.5 or OpenAIs deep research web ui - might as well take advantage of it - it can save you lots of LLM credits, and produce IMO better results for the artifacts.

Similar idea if you use the optional UX prompt, take advantage of free tier V0 or similar products to past in the produce prompt to quick start complex UI's.

Either way, ensure you are adding all of the artifacts to the .ai-pm folder (or another folder of your choice) for your new project.

## Future Enhancements

1. BMad Method Tool
2. Optional Jira Integration
3. Optional Trello Integration

## Contributing

Interested in improving the BMad Method? See our [contributing guidelines](CONTRIBUTING.md).

## License

[Include appropriate license information here]
