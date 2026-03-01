# Cold Outreach Templates -- Lucas Lorenzo Savino

> Templates for reaching out to startups and companies that need AI help but have not posted a job.
> Strategy: Lead with their problem, not your resume. Be specific. Be brief. Earn the reply.
> Channel: Email or LinkedIn DM. Adapt tone for channel (email = slightly more formal, DM = slightly more conversational).

---

## Template 1: Startup Using AI Superficially (e.g., basic chatbot, simple API wrapper)

**Target:** Startups that have shipped a basic AI feature but clearly have not gone deep. You can tell because their product has a simple chatbot, basic text generation, or a thin wrapper around OpenAI's API.

**Subject (email):** Your [PRODUCT] AI feature could do 3x more -- here is how

---

```
Hi [NAME],

I have been using [PRODUCT NAME] and noticed your [SPECIFIC AI FEATURE -- e.g., "document summarization tool" or "AI assistant in the dashboard"].

It works, but I think you are leaving significant value on the table.

Right now it looks like a single-pass LLM call -- user input goes in, AI output comes out. No retrieval from your own data, no context persistence across sessions, no structured output for downstream use.

Here is what I would build if I had 4 weeks with your codebase:

1. **RAG layer on your knowledge base:** Instead of generic LLM responses, the AI would pull from your actual product data, documentation, or customer history. Every answer would be grounded in your data, not the model's training set.

2. **Conversation memory:** Users could have ongoing conversations where the AI remembers context, not just single-turn Q&A.

3. **Structured outputs:** The AI responses would be parseable by your frontend -- enabling dynamic UI components, not just text blocks.

I have built production RAG systems with citation tracking and audit trails, multi-agent architectures, and LLM integrations for e-commerce and enterprise use cases. Currently an AI/ML Engineering Intern at Petrobras.

Would a 15-minute call make sense to discuss whether this fits your roadmap?

Lucas
[LINKEDIN URL]
[PORTFOLIO/GITHUB URL]
```

### Why this works:
- Shows you actually used their product (immediate credibility)
- "Leaving value on the table" frames the outreach as helpful, not salesy
- The 3-point plan is specific enough to be credible but leaves room for discussion
- "4 weeks" anchors the engagement as finite and manageable
- "15-minute call" is a low-commitment ask

---

## Template 2: Startup Looking to Add AI (Job Listing or Product Roadmap Signal)

**Target:** Companies where you have seen signals they are exploring AI -- job postings for AI roles, product announcements mentioning upcoming AI features, or blog posts about AI strategy.

**Subject (email):** Saw you are hiring for AI -- I can deliver results before your hire starts

---

```
Hi [NAME],

I noticed [COMPANY] is [SIGNAL -- e.g., "hiring an AI Engineer" / "planning to add AI-powered search to your platform" / "exploring automation for your operations team"].

Here is a thought: full-time AI hires take 2-4 months to find, onboard, and make productive. I can start delivering working code this week.

I am an AI Agent Engineer specializing in multi-agent systems, RAG pipelines, and LLM orchestration. My recent builds:

- **3-agent grading system** that processes essays autonomously (90% DB query reduction via caching)
- **E-commerce ops agent** connecting Shopify + ad platforms with anomaly detection
- **Enterprise RAG system** with citations, audit trails, and hybrid search
- **Cross-IDE agent orchestrator** using MCP protocol for agent interoperability

I am not trying to replace your future hire. I am offering to build the foundation they will inherit -- production-grade code with documentation, tests, and clean architecture. When your hire starts, they hit the ground running instead of starting from zero.

Available for 20-30 hrs/week. $60-80/hr depending on complexity.

Worth a conversation?

Lucas
[LINKEDIN URL]
[PORTFOLIO/GITHUB URL]
```

### Why this works:
- Directly addresses their timing problem (hiring is slow, this is fast)
- "I can start delivering working code this week" vs. "2-4 months to hire" is a compelling contrast
- Bullet list of projects is scannable and proof-dense
- "Not trying to replace your future hire" defuses the objection before it forms
- "Build the foundation they will inherit" reframes from cost to investment
- Rate transparency eliminates guesswork

---

## Template 3: Startup Drowning in Manual Processes (Operations-Heavy Companies)

**Target:** E-commerce brands, agencies, or operations-heavy startups where you can see they are doing things manually that could be automated with AI.

**Subject (email):** What if [MANUAL PROCESS] ran itself every morning?

---

```
Hi [NAME],

Quick question: how many hours per week does your team spend on [SPECIFIC MANUAL PROCESS -- e.g., "pulling reports across Shopify and your ad platforms" / "manually reviewing and categorizing support tickets" / "compiling daily operations metrics"]?

I built an autonomous Daily Ops Agent for an e-commerce company that does exactly this:
- Connects to Shopify and ad platforms via API
- Pulls and cross-references data automatically every morning
- Runs anomaly detection (catches spend/revenue divergences before they get expensive)
- Generates a daily operations report with actionable recommendations
- Replaced 2+ hours of daily manual dashboard checking

The system runs on a schedule. No human needs to trigger it. When something looks wrong, it alerts the team instead of waiting for someone to notice.

I can build something similar for [COMPANY]. The first step would be a 30-minute call where I map your current workflow and identify the highest-ROI automation targets.

No charge for the initial consultation. If the ROI makes sense, I will scope a fixed-price project.

Lucas
[LINKEDIN URL]
```

### Why this works:
- Opens with a question that makes them feel the pain ("how many hours per week")
- The Daily Ops Agent is a directly relevant case study
- "2+ hours of daily manual checking replaced" is tangible ROI
- "No charge for the initial consultation" removes friction
- "Fixed-price project" reduces perceived risk vs. open-ended hourly billing
- The whole message is about their problem, not your resume

---

## Template 4: Technical Founder / CTO Exploring Agent Architectures

**Target:** Technical founders or CTOs who have been posting about AI agents, LLM architectures, or multi-agent systems. They understand the technology but need execution capacity.

**Subject (email):** Re: your post about [AI TOPIC] -- I have shipped something similar

---

```
Hi [NAME],

Saw your [POST/TWEET/ARTICLE] about [SPECIFIC TOPIC -- e.g., "the challenges of multi-agent coordination" / "building reliable RAG at scale" / "MCP protocol adoption"].

I have been building in this exact space. A few things I have shipped recently:

**Multi-agent orchestration:** 3-agent autonomous grading system with a synthesis agent that reconciles disagreements between specialized evaluators. The interesting engineering problem was the caching layer -- without it, the 3x multiplier on LLM calls made the system economically unviable at scale. Solved it with similarity-based cache lookups that cut DB queries by 90%.

**MCP-based agent orchestration:** Agentbridge -- a cross-IDE workflow orchestrator where you define agent workflows in YAML and any MCP-compatible agent can execute them. Designed around the principle that the future is specialized agents collaborating through a shared protocol, not monolithic super-agents.

**Enterprise RAG with accountability:** Hybrid search, citation extraction pipeline, full audit trails. Built for environments where "the AI said so" fails compliance review.

I would be interested in comparing notes on [SPECIFIC ASPECT OF THEIR POST]. I am also available for contract work if you need execution capacity in this area.

Either way -- enjoyed your post.

Lucas
[LINKEDIN URL]
[GITHUB URL]
```

### Why this works:
- References a specific thing they posted (not a mass message)
- Technical depth is calibrated for a technical audience (no dumbing down)
- Three project descriptions are dense with engineering details, not marketing fluff
- "Comparing notes" positions as a peer, not a supplicant
- "Also available for contract work" is the softest possible CTA -- works because the technical content already sold the competence
- "Enjoyed your post" closes with genuine engagement, not a hard sell

---

## Template 5: Agency or Consultancy Needing AI Subcontracting

**Target:** Development agencies, consulting firms, or software studios that sell AI solutions to their clients but need specialized execution capacity.

**Subject (email):** AI subcontracting -- I build, you sell, your clients win

---

```
Hi [NAME],

I work with agencies and consultancies as a specialized AI subcontractor. You handle the client relationship and project management. I handle the AI engineering.

What I build:
- **Multi-agent systems:** Autonomous agents that collaborate on complex tasks (grading, customer support, operations)
- **RAG pipelines:** Enterprise-grade retrieval with citations, audit trails, and hybrid search
- **LLM integrations:** Production-ready API layers with error handling, cost optimization, and monitoring
- **AI automation:** Workflow agents that replace manual processes (e-commerce ops, data pipelines, reporting)

How I work with agencies:
- White-label: Your brand, your client, your relationship. I am invisible.
- Documentation-first: Every system I build comes with architecture docs, API documentation, and handoff materials
- Your timeline: I scope realistically and deliver on time. If I cannot hit your deadline, I say so upfront instead of sandbagging.
- Clean handoff: Code is production-quality, tested, and documented. Your team (or your client's team) can maintain it without me.

Current stack: Python, LangChain, LangGraph, DSPy, ChromaDB, FastAPI, TypeScript, Node.js, Docker.

Rate: $60-80/hr depending on project complexity. Open to fixed-price for well-scoped projects.

If you have AI projects in your pipeline that need execution, I would like to discuss how I can support your team.

Lucas
[LINKEDIN URL]
[PORTFOLIO URL]
```

### Why this works:
- "I build, you sell, your clients win" immediately communicates the value proposition
- "White-label" and "invisible" address the agency's primary concern (client ownership)
- "Documentation-first" and "clean handoff" address the secondary concern (dependency on the contractor)
- "If I cannot hit your deadline, I say so upfront" builds trust through honesty
- Rate transparency lets them immediately assess margin viability
- This template can be sent to dozens of agencies with minimal customization

---

## Outreach Execution Playbook

### Finding Targets

| Method | Tool | What to Look For |
|--------|------|------------------|
| LinkedIn search | LinkedIn Sales Navigator (or basic search) | CTOs, Heads of Engineering, Technical Founders at startups with 10-100 employees |
| Job board mining | Upwork, Indeed, LinkedIn Jobs | Companies posting AI/ML roles (they have the need, may not have the talent yet) |
| Product Hunt | ProductHunt.com | Recently launched products with AI features that look basic |
| Twitter/X | Search for AI agent discussions | Technical founders posting about building with LLMs |
| Agency directories | Clutch, DesignRush | Development agencies listing "AI" as a service |

### Volume and Cadence

| Metric | Target |
|--------|--------|
| Outreach per day | 5-10 personalized messages |
| Response rate target | 10-15% (cold outreach baseline) |
| Follow-up cadence | Day 3, Day 7, Day 14 (then stop) |
| Time per message | 10-15 minutes (research + customization) |

### Follow-Up Templates

**Follow-up 1 (Day 3):**
```
Hi [NAME], following up on my message from [DAY]. I know inboxes are brutal -- just wanted to make sure this did not get buried. The short version: I build production AI systems (agents, RAG, automation) and I think I could help with [SPECIFIC THING]. Worth a quick call?
```

**Follow-up 2 (Day 7):**
```
Hi [NAME], last follow-up from me. If the timing is not right, no worries at all. If AI engineering needs come up in the future, I am easy to find: [LINKEDIN URL]. Wishing you and the team well.
```

**Do NOT send a third follow-up.** Two is professional. Three is annoying.

### Response Handling

| Response Type | Action |
|---------------|--------|
| "Interested, let's talk" | Schedule within 24 hours. Send calendar link immediately. |
| "Not right now" | Thank them. Ask permission to follow up in 3 months. Add to CRM. |
| "What are your rates?" | Send rates + brief scope discussion. Do not negotiate in the first message. |
| "Send me more info" | Send 1-page case study or portfolio link. Not a 20-slide deck. |
| No response | Follow-up sequence (Day 3, Day 7). Then move on. |
| "Not interested" | Thank them graciously. Move on. Never argue. |

### Tracking

Maintain a simple spreadsheet:

| Column | Purpose |
|--------|---------|
| Company | Who you contacted |
| Contact Name | Decision maker |
| Channel | Email / LinkedIn DM |
| Date Sent | When you sent the first message |
| Template Used | Which template (1-5) |
| Follow-ups Sent | 0, 1, or 2 |
| Response | None / Interested / Not Now / No |
| Next Action | Follow-up date or archive |
| Notes | Any relevant context |

### Weekly Review:
- Every Friday: review the spreadsheet
- Calculate response rate
- Identify which template performs best
- Adjust targeting if response rate is below 8%
- Double down on what is working
