# The BMad Code Method for Pairing Human-Agentic Workflow for Product Realization and Software Development

**Breakthrough Method Agile-Ai Driven-Development (BMAD-METHOD)**

Join in on the [Community Discussion Forum](https://github.com/bmadcode/BMAD-METHOD/discussions), help contribute, evolve, and advance the ideas laid out here. This is IDE Agnostic, works great with Cursor, Cline, RooCode, CoPilot etc...! If it has an intelligent agent, this will help you tame it and keep the good vibes flowing!

Also check out [Part 1 and 2 on the BMad Code YouTube channel](https://youtu.be/JbhiLUY_V2U) - feel free to comment, like, and subscribe also for future videos and updates.

## Overview

The BMad Method is a (not so) revolutionary approach to software development that leverages AI-driven processes to accelerate and enhance the entire product development lifecycle from ideation and market fit, through agentic code implementation.

The method is meant to be tool agnostic including a workflow built into the role-prompts. It is a somewhat manual workflow that can be used in multiple ways.

It can easily be adapted to specifics of any agentic coding toolset, ide and platform.

## What is the BMad Method?

The BMad Method is a comprehensive, step-by-step approach that transforms a product idea into a fully implemented application agile prompt chain by:

1. Structuring the development process into distinct AI persona-based phases
2. Generating detailed artifacts at each phase
3. Using a sequential workflow to track progress
4. Enabling AI to code the full application based on generated specifications that are granular and detailed, setting you up for maximal success.

## Getting Started

### Prerequisites

- An AI assistant capable of using these prompts (Claude, GPT-4, Gemini, etc.)
- Optional burt HIGHLY Recommended: Access to Deep Research AI
- Basic understanding of Cursor / Cline / Roo / CoPilot Agent
- A software product or project idea you want to build with AI

### How to Use with your UI or IDE of choice

#### Gemini (Google)

- Configure a Custom Gem for each mode you want to use. For example, I recommend before even going into your IDE set up the ba, pm and ux Gems at a minimum, also potentially the architect. Especially if you intend to use deep research (which you might as well with it be so great) - you will want to make use of the custom modes in Gemini.

#### Cursor

- Ensure you have Custom Modes (Beta) turned on in your cursor options
- Create the Custom Modes for each of your intended agents, going into the advanced options to give them custom prompts (copied and modified as needed from the ./custom-mode-prompts folder)

#### RooCode

- Follow this [guide](https://publish.obsidian.md/aixplore/AI+Systems+%26+Architecture/custom-modes-quick-start) along with the prompts (copied and modified as needed from the ./custom-mode-prompts folder)

#### Other IDEs

Other IDEs do not yet seem to have the exact same way of creating custom modes - but you can still use this methodology through rules, plan/act modes, and using the mode prompts as a prompt to start a new chat session.

### Workflow

The BMad Method follows a structured workflow:

1. **BA:** If your idea is vague or very ambitious and you are not even sure what would or should be in an MVP - start with the BA. Use this as your brainstorming buddy, check the market conditions and competitor analysis, and let it help you elicit features or ideas you may have never considered. It can also help you craft a great prompt to trigger deep research mode to really get advice and analysis of your fleshed out idea. The output will be a **Project Brief** which you will feed to the PM.
2. PM: Either give the PM the Project Brief, or describe manually your project if you understand it well enough. The PM will ask you clarifying questions until it feels comfortable drafting the PRD with enough detail to enable eventual agent development. This will include a high level story breakdown and sequence. The output will be a **PRD**. You can give some platform and technical ideas to the PM if you already know them - or wait to work with the architect. If you are already sure of the platform languages and libraries you are sure you want to use, best to specify them now, or even prior to this in the project brief.
3. UX Expert: This is a special purpose agent that is good at one thing, taking the idea from the PRD and helping elicit and flesh out a prompt tuned to get great results from V0 or similar UI generators. But you can also use the UX Expert to just help flesh out more details for the PRD before we hit the architect.
4. Architect: If your project is technically complex, or you did not know all of the technical details with the PM, pull in the architect to produce an architecture document, and also ensure that it and the PRD are both in alignment. You can also push the Architect into Deep Research mode - use it to research potential alternative technologies, find if others have done similar things already (don't always need to reinvent the wheel), and maybe even suggest a whole new approach. If you do deep research, its best to take the time to understand it and ensure anything you want to use is incorporated back into the architecture draft and PRD. IF its so drastically different, you may want to go all the way back to the project brief. This is where upfront planning really plays off before we start burning up LLM agent credits!
5. PO: At this point, the PO may be unnecessary - but if you have produced a PRD, Architecture, and potentially some UX content - the PO is a good reviewer to ensure that our stories are high level but properly sequenced in the PRD - or can make updates as needed.
6. DEV: Finally we are ready for development! The Dev agent is set to work on 1 story at a time, and will create a story in draft mode for your review before starting to work on it. The story will follow the template in the ai folder and create it at /ai/stories/ following a naming convention of story-{epic}.{story}.md.
   1. Once you approve of the story, the dev will work on it and update its progress. It will use the PRD and Architecture documents as reference to draft ths stories and ensure the level of detail is in the story.
   2. It is recommended to start a new chat with each story - and potentially even after transitioning a story to In-Progress (from draft) so its starts with a clean context overhead ready to execute. But see what works best for your workflow.
   3. I always recommend having tests done with each story (ideally even follow TDD) and ensure all stories are passing in the whole project. Once they are and the story is complete - commit and push to the remote!!!

## Why no prompts folder

The separate prompts folder was removed as it was redundant to maintain that along with the custom-mode-prompts. If you are using a tool without custom modes - the prompts still work as is, you will just use the idea and paste it into the chat to set up the LLMs operations, personality and behavior.

## A note on Templates

The ai/templates are contain a prd, architecture and story template. The prd and architecture templates themselves are embedded within the custom mode itself and are not referenced - so if using the modes for PM or Architect, you will not actually need those templates. The reason for not having it reference the external file (like the dev agent does) is that generally these modes can be used outside of cursor such as in Gemini or OpenAI.

The story template is instead referenced from within the prompt so it will load the template when needed to draft an initial story. Having this as an external template makes it a bit easier to tweak the template - and the idea is that when the dev agent is working in your IDE it does not need to always have the content of the template in memory, and should always be able to reference it.

## What about rules files?

You can still augment with rules files per your specific tool to put more guardrails in place. If you are going to use multiple tools and do not want to maintain a lot of different rule sets - you can instead add rules to non rules files such as docs, or contributing.md for example. And then just have a single rule that indicates the agent should reference these files when needed. YMMV with the approach - I have found it to work well enough - especially with the embedded agent modes rules.

## Future Enhancements

1. BMad Method MCP Tool

## Contributing

Interested in improving the BMad Method? See our [contributing guidelines](CONTRIBUTING.md).

## License

[Include appropriate license information here]
