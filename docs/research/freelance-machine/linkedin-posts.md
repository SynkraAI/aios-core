# LinkedIn Posts -- Lucas Lorenzo Savino

> 5 LinkedIn post drafts for technical thought leadership and project showcasing.
> Strategy: Position as a builder who ships, not a commentator who speculates.
> Tone: Direct, specific, no buzzword padding. Every post teaches something or shows something built.

---

## Post 1: Technical Thought Leadership -- Why Most RAG Systems Fail

**Type:** Educational / Opinion
**Goal:** Establish expertise in RAG architecture. Attract inbound leads from teams struggling with RAG quality.

---

```
Most RAG systems I see in production have the same problem:

They retrieve chunks. They stuff them into a prompt. They hope for the best.

Then the team wonders why the AI confidently cites information that is not in the source documents.

I have built RAG systems for enterprise use cases where "the AI said so" is not an acceptable answer. Here is what I learned:

1. Hybrid search is not optional. Semantic search alone misses exact matches. Keyword search alone misses intent. You need both, with configurable weighting.

2. Citations are an engineering problem, not a prompt engineering problem. You cannot just tell the LLM to "cite your sources." You need a citation extraction pipeline that traces generated text back to specific source passages.

3. Audit trails change everything. When you log the full chain -- query, retrieval, re-ranking, generation, citations -- you can actually debug why the system gave a bad answer. Without audit trails, you are guessing.

4. Chunking strategy matters more than your choice of vector database. I have seen teams spend weeks evaluating Pinecone vs. Weaviate vs. ChromaDB while using a naive 500-token fixed-size chunker. The chunking is where most quality is won or lost.

The gap in the market is not "can we build a RAG system" -- anyone can do that with a LangChain tutorial. The gap is "can we build one that is auditable, accurate, and production-grade."

That is the part I focus on.

--

Building production AI systems. Currently AI/ML Engineering Intern at Petrobras.

#RAG #AI #LLM #MachineLearning #AIEngineering
```

**Engagement hooks:**
- Opens with a pattern-interrupt ("most RAG systems have the same problem")
- Numbered list is scannable on mobile
- Each point is a mini-lesson, not a platitude
- "The AI said so is not an acceptable answer" is a quotable line
- Closes with positioning, not a sales pitch

---

## Post 2: Project Showcase -- The 3-Agent Grading System

**Type:** Build showcase / Case study
**Goal:** Demonstrate multi-agent architecture expertise with concrete results.

---

```
I built a grading system where 3 AI agents argue about your essay.

Here is how it works:

Agent 1 evaluates content accuracy and factual depth.
Agent 2 evaluates structure, coherence, and argumentation quality.
Agent 3 is the synthesis agent -- it takes the other two assessments, reconciles disagreements, and produces the final grade.

Why 3 agents instead of 1?

Because a single LLM call grading an essay is like asking one person to simultaneously evaluate grammar, factual accuracy, argument structure, and writing style. The quality degrades as you ask for more dimensions in a single pass.

With specialized agents, each one focuses on what it does best. The synthesis agent handles the hard part: what happens when Agent 1 says the content is excellent but Agent 2 says the argument structure is weak?

The engineering challenge was not the agents themselves. It was scale.

Every essay hitting 3 agents means 3x the LLM calls and 3x the database operations. So I built a caching layer that checks for previously graded similar submissions before invoking any agents.

Result: 90% reduction in database queries.

That is the difference between a system that works in a demo and a system that works when 1,000 students submit essays on the same deadline.

The lesson: multi-agent architectures are powerful, but only if you solve the infrastructure problems they create.

--

AI Agent Engineer | Computer Engineering @ [University] | AI/ML Intern @ Petrobras

#MultiAgentSystems #AIEngineering #LLM #Python #BuildInPublic
```

**Engagement hooks:**
- "3 AI agents argue about your essay" is an attention-grabbing opening
- The "why 3 instead of 1" section educates and differentiates
- The 90% metric is concrete and memorable
- "Works in a demo vs. works at scale" reinforces the production positioning
- Teaching framing ("The lesson:") adds value beyond self-promotion

---

## Post 3: Industry Insight -- The MCP Protocol and Why It Matters

**Type:** Industry analysis / Trend identification
**Goal:** Position as an early adopter and expert on an emerging standard (MCP). Attract technically sophisticated clients.

---

```
The biggest problem in AI agents right now is not intelligence. It is interoperability.

Your Claude Code agent cannot talk to your Cursor agent. Your custom LangChain pipeline does not share context with your IDE assistant. Every tool is a silo.

This is why I have been building with MCP -- the Model Context Protocol.

MCP is doing for AI agents what HTTP did for web servers: creating a standard way for tools to expose capabilities and for agents to consume them.

I built Agentbridge, a cross-IDE agent workflow orchestrator, specifically to solve this problem. The idea: define your workflow in YAML once, and any MCP-compatible agent can execute it. No vendor lock-in. No manual context transfer.

What this means in practice:

- You define a workflow: "analyze this codebase, then write tests, then review the tests"
- Any combination of AI agents can execute those steps
- Each agent exposes its capabilities via MCP servers
- The orchestrator handles routing, context passing, and state management

We are early. MCP is still evolving. But the pattern is clear: the future of AI agents is not one super-agent that does everything. It is specialized agents that collaborate through a shared protocol.

If you are building AI agents and not thinking about interoperability, you are building something that will be rewritten in 18 months.

--

Building multi-agent orchestration systems. AI/ML Engineering Intern at Petrobras.

#MCP #AIAgents #Interoperability #LLMOrchestration #FutureOfAI
```

**Engagement hooks:**
- "Not intelligence, it is interoperability" is contrarian and attention-grabbing
- HTTP analogy makes a technical concept accessible
- Agentbridge project provides concrete proof
- "Rewritten in 18 months" creates urgency for the audience
- Positions Lucas as someone building the infrastructure layer, not just consuming APIs

---

## Post 4: Behind-the-Scenes -- What I Learned Building AI at Petrobras

**Type:** Career narrative / Credibility builder
**Goal:** Leverage the Petrobras brand for credibility. Show what working on enterprise AI actually looks like.

---

```
I am 22 and I build AI systems at one of the largest energy companies in the world.

Here is what working on production AI at Petrobras taught me that no course ever did:

1. Enterprise AI is 20% model selection and 80% data engineering.
The LLM is the easy part. Getting clean, structured, permissioned data into the system -- that is where projects succeed or die.

2. "It works on my machine" is a career-limiting statement.
If it does not run in a Docker container with defined dependencies, environment variables, and health checks, it does not work. Period.

3. Nobody cares about your model's accuracy on a benchmark.
They care: Does it save time? Does it reduce errors? Can someone who is not an engineer use it? Can we audit what it did?

4. The best AI engineers are systems engineers who happen to work with LLMs.
Understanding API design, caching, queue management, and deployment matters more than knowing the latest prompting technique.

5. Production means production.
Real users. Real data. Real consequences when it breaks. This changes how you write every line of code.

I graduate in April 2026 with a Computer Engineering degree. But the most important part of my education has been building systems that real people depend on.

--

AI/ML Engineering Intern at Petrobras | Computer Engineering

#AIEngineering #Petrobras #ProductionAI #CareerInTech #BuildInPublic
```

**Engagement hooks:**
- Age + Petrobras combination is inherently attention-grabbing
- Numbered lessons format is highly shareable
- Each point challenges common assumptions (contrarian but earned)
- "Nobody cares about your model's accuracy on a benchmark" is a quotable line
- The close ties personal narrative to professional credibility

---

## Post 5: Practical Tutorial -- Turning WhatsApp into an AI Agent Interface

**Type:** Technical tutorial / Project showcase
**Goal:** Demonstrate creative problem-solving and unconventional AI applications. High shareability.

---

```
I turned WhatsApp into a full AI agent interface.

Not a chatbot that responds with FAQ answers. An actual agent that processes files, routes to specialized AI capabilities, and maintains persistent conversation state.

Here is the architecture:

Layer 1: WhatsApp Business API integration
A persistent daemon that maintains the connection, handles auto-reconnection, and manages session state across conversations.

Layer 2: Message classification and routing
Every incoming message gets classified: Is this a question? A file to process? A command? The classifier routes to the appropriate handler.

Layer 3: Agent execution
Each handler is a specialized agent. Send a document -- it gets processed through the relevant AI pipeline. Ask a question -- it hits the knowledge base with RAG. Request a report -- the automation agent generates it.

Layer 4: Response delivery
Results flow back through WhatsApp with real-time status updates. Long-running tasks send progress notifications instead of leaving the user waiting.

Why WhatsApp?

Because the best interface is the one people already use. 2 billion monthly active users are not going to download your custom app. But they will message your WhatsApp number.

The technical challenge was reliability. WhatsApp connections drop. Sessions expire. Files fail to download. The daemon needs to handle all of this gracefully without losing context.

Building AI is one thing. Building AI that meets users where they already are -- that is a different (and harder) problem.

--

AI Agent Engineer | Building production AI systems

#WhatsApp #AIAgents #Automation #Python #TechArchitecture
```

**Engagement hooks:**
- "I turned WhatsApp into a full AI agent interface" is immediately intriguing
- The layered architecture explanation teaches while showcasing
- "2 billion monthly active users" makes the business case obvious
- The reliability section shows engineering maturity
- "Meet users where they already are" is a universally applicable insight

---

## Posting Strategy

### Frequency:
- 2-3 posts per week
- Best times: Tuesday-Thursday, 8-10 AM in your target client's timezone (EST/PST for US market)

### Content Mix:
- 40% Technical thought leadership (Posts 1, 3)
- 30% Project showcases (Posts 2, 5)
- 20% Career/credibility narratives (Post 4)
- 10% Engagement (commenting on others' posts with substantive technical insights)

### Engagement Protocol:
- Reply to every comment within 4 hours
- Ask follow-up questions in replies to keep threads alive
- When someone asks "how did you do X?" -- give a real answer, not "DM me"
- Connect with everyone who engages meaningfully

### Profile Optimization:
- Headline: "AI Agent Engineer | Multi-Agent Systems, RAG & LLM Orchestration | Building production AI at Petrobras"
- About: Adapted version of the Upwork overview
- Featured: Pin the top-performing post + link to any live projects or case studies
