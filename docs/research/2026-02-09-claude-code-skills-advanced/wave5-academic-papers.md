# Wave 5: Academic Papers on Multi-Agent Software Engineering

> Deep analysis of 25+ papers (2023-2026) on multi-agent systems for software development.
> These are the scientific foundations that inform production tools like Claude Code Agent Teams.

**Date:** 2026-02-09
**Sources consulted:** 25+ papers, 15 deep-read via WebFetch
**Coverage:** Multi-agent code generation, debugging, review, benchmarks, scaling laws, self-improvement, orchestration patterns

---

## TL;DR: Top 5 Most Relevant Papers for MMOS

| # | Paper | Why It Matters for Claude Code / MMOS |
|---|-------|---------------------------------------|
| 1 | **Towards a Science of Scaling Agent Systems** (Kim et al., Dec 2025) | Quantitative proof that multi-agent HURTS sequential reasoning (39-70% degradation). Only use multi-agent for parallelizable tasks. Centralized coordination (like Claude Code's TeammateTool) is the right topology. |
| 2 | **SAGE: Skill Augmented GRPO for Self-Evolution** (Wang et al., Dec 2025) | Skill libraries + RL = 8.9% better completion with 59% fewer tokens. Direct validation of Claude Code's skills/ directory pattern. Skills should accumulate across tasks. |
| 3 | **MetaGPT** (Hong et al., ICLR 2024 Oral) | SOPs encoded as prompt sequences is exactly what MMOS agent wrappers do. Structured intermediate outputs (PRDs, designs) reduce hallucination. 2x token efficiency vs ChatDev. |
| 4 | **Self-Play SWE-RL** (Wei et al., Dec 2025) | Self-improving agents without human labels. +10.4 points on SWE-bench Verified via self-play bug injection/repair. Path toward compound learning in MMOS. |
| 5 | **Multi-Agent Collaboration via Evolving Orchestration** (Dang et al., NeurIPS 2025) | RL-trained orchestrator ("puppeteer") that dynamically sequences agents. Compact cyclic structures emerge. Validates the need for adaptive orchestration over static DAGs. |

---

## Part I: Foundational Frameworks (The "Big 4")

### 1. MetaGPT: Meta Programming for a Multi-Agent Collaborative Framework

- **Authors:** Sirui Hong, Mingchen Zhuge, Jiaqi Chen, + 12 co-authors (including Jurgen Schmidhuber)
- **Date:** Aug 2023 (arxiv); ICLR 2024 Oral (top 1.2%)
- **Link:** [arxiv.org/abs/2308.00352](https://arxiv.org/abs/2308.00352)
- **GitHub:** [github.com/FoundationAgents/MetaGPT](https://github.com/FoundationAgents/MetaGPT)

**Core Architecture:**
- Simulates a software company with 5 roles: Product Manager, Architect, Project Manager, Engineer, QA Engineer
- Assembly line paradigm (not free-form chat)
- SOPs (Standard Operating Procedures) encoded as prompt sequences
- Each role produces structured artifacts: requirements docs, system design, task decomposition, code, tests

**Quantitative Results:**

| Metric | MetaGPT | ChatDev | Improvement |
|--------|---------|---------|-------------|
| Executability (0-4) | 3.75 | 2.25 | +67% |
| Code Files Generated | 5.1 | 1.9 | +168% |
| Lines of Code | 251.4 | 77.5 | +224% |
| Tokens per Code Line | 124.3 | 248.9 | **2x more efficient** |
| Manual Revision Cost | 0.83 | 2.5 | -67% |
| HumanEval Pass@1 | 85.9% | - | - |
| MBPP Pass@1 | 87.7% | - | - |

**Key Insight:** Structured intermediate outputs (not just chat) are what make multi-agent work. The SOP approach forces agents to "show their work" at each step, enabling verification and error correction. This is exactly what MMOS does with Context Parity (state.json between agents).

**Relevance to Claude Code:**
- MetaGPT's SOP = Claude Code's SKILL.md progressive disclosure
- MetaGPT's role assignments = Claude Code's `.claude/agents/*.md`
- MetaGPT's structured artifacts = MMOS's `outputs/minds/{slug}/metadata/state.json`
- The assembly line paradigm validates Claude Code's sequential agent handoff via `/orchestrate`

---

### 2. ChatDev: Communicative Agents for Software Development

- **Authors:** Chen Qian, Wei Liu, + co-authors
- **Date:** Jul 2023 (arxiv); ACL 2024 Long Paper
- **Link:** [arxiv.org/abs/2307.07924](https://arxiv.org/abs/2307.07924)
- **GitHub:** [github.com/OpenBMB/ChatDev](https://github.com/OpenBMB/ChatDev)

**Core Architecture:**
- Chat chain divides each phase into subtasks
- 5 roles: CEO, CTO, Programmer, Reviewer, Tester
- 3 phases: Design, Coding (Code Writing + Completion), Testing (Code Review + System Testing)
- Each subtask involves exactly 2 agents (instructor + assistant) in multi-turn dialogue
- Short-term memory (within phase) + Long-term memory (across phases)

**Communicative Dehallucination:**
- Agents proactively request clarification before responding
- Role-reversal mechanism forces finer-grained information exchange
- Reduces hallucinated code by requiring concrete details before implementation

**Quantitative Results:**
- Duration: 148.21 seconds per task
- Token usage: 22,949 average
- Generated: 4.39 files, 144.35 lines of code
- Executability: 0.88 (vs MetaGPT's 0.41 on ChatDev's own benchmark)
- Won 77.08% pairwise vs GPT-Engineer, 57.08% vs MetaGPT

**Key Insight:** The 2-agent subtask pattern (instructor + assistant) is remarkably effective. Not every subtask needs the full team. ChatDev's communicative dehallucination (asking before doing) directly maps to Claude Code's permission system and HITL patterns.

**Note on contradictory benchmarks:** MetaGPT and ChatDev each report superiority on their own benchmarks. MetaGPT wins on the SoftwareDev benchmark (executability 3.75/4 vs 2.25/4), while ChatDev wins on its own evaluation suite (0.88 vs 0.41 executability). This is a known issue in the field -- benchmark design strongly favors the system it was designed for.

---

### 3. MapCoder: Multi-Agent Code Generation for Competitive Problem Solving

- **Authors:** Md. Ashraful Islam, Mohammed Eunus Ali, Md. Rizwan Parvez
- **Date:** May 2024 (arxiv); ACL 2024
- **Link:** [arxiv.org/abs/2405.11403](https://arxiv.org/abs/2405.11403)
- **GitHub:** [github.com/Md-Ashraful-Pramanik/MapCoder](https://github.com/Md-Ashraful-Pramanik/MapCoder)

**Core Architecture -- 4 Agents Mirroring Human Developer Cycle:**
1. **Retrieval Agent:** Recalls relevant examples from memory
2. **Planning Agent:** Creates algorithm plan from examples
3. **Code Generation Agent:** Implements plan as code
4. **Debugging Agent:** Tests and fixes failing code

**State-of-the-Art Results (at publication):**

| Benchmark | Pass@1 | Previous SOTA |
|-----------|--------|---------------|
| HumanEval | 93.9% | ~90% |
| MBPP | 83.1% | ~78% |
| APPS | 22.0% | - |
| CodeContests | 28.5% | - |
| xCodeEval | 45.3% | - |

**Key Insight:** The retrieval-plan-code-debug cycle is universal. Every successful multi-agent coding system implements some variant of this pipeline. The retrieval step (recalling similar problems) is what skill libraries formalize.

**Relevance:** MapCoder's retrieval agent = Claude Code's skill auto-discovery. The 4-stage cycle maps to: skill match -> plan -> implement -> test. MapCoder-Lite (follow-up) distills this into a single 7B model, showing the pattern can be internalized.

---

### 4. AgentCoder: Multi-Agent Code Generation with Iterative Testing

- **Authors:** Dong Huang, Jie M. Zhang, Michael Luck, Qingwen Bu, Yuhao Qing, Heming Cui
- **Date:** Dec 2023 (arxiv)
- **Link:** [arxiv.org/abs/2312.13010](https://arxiv.org/abs/2312.13010)
- **GitHub:** [github.com/huangd1999/AgentCoder](https://github.com/huangd1999/AgentCoder)

**Core Architecture -- 3 Specialized Agents:**
1. **Programmer Agent:** Generates code, refines based on feedback
2. **Test Designer Agent:** Creates test cases independently
3. **Test Executor Agent:** Runs code against tests, provides feedback to programmer

**Quantitative Results:**

| Config | HumanEval Pass@1 | MBPP Pass@1 | Token Overhead |
|--------|-------------------|-------------|----------------|
| AgentCoder (GPT-4) | **96.3%** | **91.8%** | 56.9K / 66.3K |
| Previous SOTA | 90.2% | 78.9% | 138.2K / 206.5K |

**Key Insight:** Separating test generation from code generation is critical. When the same agent writes both code and tests, it tests what it implemented, not what was specified. AgentCoder's independent test designer breaks this confirmation bias. Token overhead is 2-3x lower than SOTA because specialized agents need less context.

**Relevance to Claude Code:** This validates the pattern of having QA as a separate agent (MMOS's `aios-quinn.md`). The test executor feedback loop is exactly what `npm test` verification does in story-driven development. The 2-3x token efficiency gain from specialization supports Claude Code's agent delegation model.

---

## Part II: Real-World Issue Resolution

### 5. SWE-Agent: Agent-Computer Interfaces Enable Automated Software Engineering

- **Authors:** John Yang, Carlos E. Jimenez, Alexander Wettig, Kilian Lieret, Shunyu Yao, Karthik Narasimhan, Ofir Press
- **Date:** May 2024 (arxiv); NeurIPS 2024
- **Link:** [arxiv.org/abs/2405.15793](https://arxiv.org/abs/2405.15793)
- **GitHub:** [github.com/SWE-agent/SWE-agent](https://github.com/SWE-agent/SWE-agent)

**Core Innovation: Agent-Computer Interface (ACI)**
- Not multi-agent per se, but defines the interface paradigm all agents use
- Custom commands for file viewing, editing, searching (sound familiar? This IS Claude Code's tool interface)
- Carefully designed ACI improved GPT-4 Turbo from ~3.8% to 12.47% on SWE-bench
- Mini-SWE-Agent: 100-line Python agent scoring >74% on SWE-bench Verified, proving the ACI is more important than agent complexity

**Key Insight:** The interface between agent and environment matters more than the agent's internal architecture. Claude Code's tool design (Read, Write, Edit, Grep, Glob, Bash) is essentially a production-grade ACI. The 3x improvement from ACI design alone validates investing in tool quality over agent complexity.

---

### 6. MAGIS: LLM-Based Multi-Agent Framework for GitHub Issue Resolution

- **Authors:** Wei Tao, Yucheng Zhou, Yanlin Wang, Wenqiang Zhang, Hongyu Zhang, Yu Cheng
- **Date:** Mar 2024 (arxiv); NeurIPS 2024
- **Link:** [arxiv.org/abs/2403.17927](https://arxiv.org/abs/2403.17927)
- **GitHub:** [github.com/co-evolve-lab/magis](https://github.com/co-evolve-lab/magis)

**4-Agent Architecture:**
1. **Manager Agent:** Orchestrates planning, decomposes issues
2. **Repository Custodian:** Maintains codebase knowledge, identifies relevant files
3. **Developer Agent:** Generates code changes
4. **QA Engineer Agent:** Tests and validates changes

**Results:**
- Resolves 13.94% of GitHub issues on SWE-bench
- **8x improvement** over direct GPT-4 application
- NeurIPS 2024 acceptance validates the architecture

**Key Insight:** The Repository Custodian role is critical and often missing. Having an agent dedicated to understanding the existing codebase (not just generating new code) dramatically improves issue resolution. This maps to Claude Code's `Explore` agent (Haiku, read-only) and the codebase navigation tools.

**Relevance:** MAGIS's 4-agent split (Manager/Custodian/Developer/QA) is remarkably similar to MMOS's agent set. The Repository Custodian = MMOS's context parity (knowing codebase state). The 8x improvement from multi-agent over single-agent is the strongest argument for Claude Code's Agent Teams feature.

---

### 7. HyperAgent: Generalist Software Engineering Agents to Solve Coding Tasks at Scale

- **Authors:** Huy Nhat Phan, Tien N. Nguyen, Phong X. Nguyen, Nghi D. Q. Bui
- **Date:** Sep 2024 (arxiv), revised Sep 2025
- **Link:** [arxiv.org/abs/2409.16299](https://arxiv.org/abs/2409.16299)

**4-Agent Specialist Architecture:**
1. **Planner:** Strategy and task decomposition
2. **Navigator:** Repository exploration and file location
3. **Code Editor:** Implementation and modification
4. **Executor:** Verification and testing

**Results:**
- SWE-Bench-Lite: 25.01% success rate
- SWE-Bench-Verified: 31.40% success rate
- Cross-language capability (Python, Java, C, etc.)
- Outperforms specialized systems on RepoExec and Defects4J

**Key Insight:** The Planner-Navigator-Editor-Executor pipeline mirrors human developer workflow: understand -> find -> change -> verify. This 4-step loop is the minimal viable multi-agent architecture for software engineering.

---

## Part III: Code Review and Debugging

### 8. CodeCoR: LLM-Based Self-Reflective Multi-Agent Framework

- **Authors:** Ruwei Pan, Hongyu Zhang, Chao Liu
- **Date:** Jan 2025
- **Link:** [arxiv.org/abs/2501.07811](https://arxiv.org/abs/2501.07811)

**4-Agent Self-Reflective Architecture:**
1. **Prompt Agent:** Generates enhanced prompts
2. **Coding Agent:** Produces multiple code solutions
3. **Test Agent:** Creates test cases
4. **Repair Agent:** Provides fix advice for failing code

**Innovation -- Multi-output pruning:**
- Each agent generates MULTIPLE outputs, then prunes low-quality ones
- Code tested locally; failures routed to repair agent
- Final output: code passing the most generated test cases

**Results:** Average Pass@1 of 77.8% across HumanEval, HumanEval-ET, MBPP, MBPP-ET (outperforms CodeCoT and MapCoder). Token-efficient despite multi-output generation.

**Key Insight:** Generating multiple candidates and pruning is more effective than generating one and iterating. This "generate-and-select" pattern could enhance Claude Code's approach to complex tasks.

---

### 9. CodeAgent: Autonomous Communicative Agents for Code Review

- **Authors:** Xunzhu Tang, Kisub Kim, + 7 co-authors
- **Date:** Feb 2024 (arxiv); EMNLP 2024
- **Link:** [arxiv.org/abs/2402.02172](https://arxiv.org/abs/2402.02172)

**Innovation -- QA-Checker Supervisory Agent:**
- Multi-agent system for code review automation
- QA-Checker monitors conversation flow, prevents "prompt drifting"
- Evaluated on 4 tasks: inconsistency detection, vulnerability identification, style validation, revision suggestion

**Key Insight:** In multi-agent code review, conversation drift is the #1 failure mode. A supervisory agent that keeps discussions on-topic is essential. This validates the need for orchestrator oversight in Claude Code Agent Teams.

---

### 10. Enhancing LLM Code Generation: Multi-Agent Collaboration + Runtime Debugging

- **Authors:** Nazmus Ashrafi, Salah Bouktif, Mohammed Mediani
- **Date:** May 2025
- **Link:** [arxiv.org/abs/2505.02133](https://arxiv.org/abs/2505.02133)

**Methodology:**
- Systematic evaluation of multi-agent collaboration combined with runtime debugging
- Tested across 19 LLMs
- Chained system combining both strategies

**Key Insight:** Multi-agent collaboration and runtime debugging are complementary, not redundant. The combination outperforms either approach alone. This validates Claude Code's pattern of agent delegation + test execution feedback loops.

---

## Part IV: Self-Improvement and Learning

### 11. Self-Play SWE-RL: Training Superintelligent Software Agents

- **Authors:** Yuxiang Wei, Zhiqing Sun, Emily McMilin, Jonas Gehring, David Zhang, Gabriel Synnaeve, Daniel Fried, Lingming Zhang, Sida Wang
- **Date:** Dec 2025
- **Link:** [arxiv.org/abs/2512.18552](https://arxiv.org/abs/2512.18552)

**Self-Play Mechanism:**
- Single LLM trained via RL in self-play setting
- Agent iteratively injects bugs of increasing complexity, then repairs them
- Bugs specified by test patches (not natural language)
- No human-labeled issues or pre-existing tests needed
- Only requires: sandboxed repositories with source code + installed dependencies

**Results:**
- SWE-bench Verified: **+10.4 points** improvement
- SWE-bench Pro: **+7.8 points** improvement
- Consistently outperforms human-data baseline throughout training
- Generalizes to natural language issues despite training only on test-based specs

**Key Insight:** Self-play (injecting and fixing your own bugs) is a viable path to superhuman software agents without human-curated datasets. This is the academic foundation for compound learning systems like everything-claude-code's instinct evolution.

---

### 12. SWE-RL: Advancing LLM Reasoning via Reinforcement Learning on Open Software Evolution

- **Authors:** Yuxiang Wei, Olivier Duchenne, + 7 co-authors (Meta/Facebook Research)
- **Date:** Feb 2025; NeurIPS 2025
- **Link:** [arxiv.org/abs/2502.18449](https://arxiv.org/abs/2502.18449)
- **GitHub:** [github.com/facebookresearch/swe-rl](https://github.com/facebookresearch/swe-rl)

**Training Approach:**
- First to scale RL-based reasoning for real-world software engineering
- Learns from open-source software evolution data (code snapshots, changes, issues, PRs)
- Lightweight rule-based reward (similarity between ground-truth and generated solutions)
- Base model: Llama 3 -> Llama3-SWE-RL-70B

**Results:**
- **41.0% solve rate** on SWE-bench Verified (strongest for <100B models)
- Unexpected transfer: improves on 5 out-of-domain tasks (function coding, library use, code reasoning, mathematics, general language understanding)

**Key Insight:** Training on software evolution data produces generalized reasoning capabilities that transfer to non-coding tasks. Software engineering is a rich enough domain to teach general problem-solving. This suggests that MMOS's compound learning (Session Memory -> MEMORY.md -> CLAUDE.md) is directionally correct.

---

### 13. SAGE: Reinforcement Learning for Self-Improving Agent with Skill Library

- **Authors:** Jiongxiao Wang, Qiaojing Yan, + 7 co-authors
- **Date:** Dec 2025
- **Link:** [arxiv.org/abs/2512.17102](https://arxiv.org/abs/2512.17102)

**SAGE Framework:**
- Skill Augmented GRPO for self-Evolution
- **Sequential Rollout:** Deploys agents across chains of similar tasks
- Skills generated from previous tasks accumulate in library
- **Skill-integrated Reward:** Complements outcome-based rewards with skill generation/utilization rewards

**Results on AppWorld:**
- **+8.9%** Scenario Goal Completion
- **-26%** interaction steps required
- **-59%** tokens generated
- Substantially outperforms existing approaches in both accuracy AND efficiency

**Key Insight:** Skills should be a first-class reward signal, not just a side effect. Rewarding agents for creating reusable skills (not just solving the immediate task) produces better long-term performance with lower token costs. This is the strongest academic validation of Claude Code's skills/ directory pattern.

**Direct MMOS application:** MMOS should reward agents (via quality metrics) not just for task completion but for producing reusable artifacts (skills, patterns, templates) that benefit future tasks.

---

### 14. A Self-Improving Coding Agent

- **Authors:** Maxime Robeyns, Martin Szummer, Laurence Aitchison (University of Bristol)
- **Date:** Apr 2025; ICLR 2025 Workshop
- **Link:** [arxiv.org/abs/2504.15228](https://arxiv.org/abs/2504.15228)

**Mechanism:**
- Agent equipped with basic coding tools can autonomously edit ITSELF
- Uses LLM reflection to identify performance gaps, then implements code updates
- Non-gradient-based learning: no fine-tuning needed, just code self-modification

**Results:**
- Performance gains from **17% to 53%** on random subset of SWE-Bench Verified
- Additional gains on LiveCodeBench and synthetic benchmarks

**Key Insight:** Self-modification through code editing (not weight updates) is a viable learning mechanism. This is essentially what everything-claude-code's instinct evolution does: the agent edits its own configuration files to improve future performance.

---

### 15. Lessons Learned: A Multi-Agent Framework for Code LLMs to Learn and Improve

- **Authors:** Yuanzhe Liu, Ryan Deng, Tim Kaler, + 4 co-authors (MIT, IBM)
- **Date:** May 2025; NeurIPS 2025 Poster
- **Link:** [arxiv.org/abs/2505.23946](https://arxiv.org/abs/2505.23946)

**Framework: Lesson-Based Collaboration**
- **Lesson solicitation:** Extract knowledge from each agent's successes and failures
- **Lesson banking:** Store lessons in shared repository
- **Lesson selection:** Retrieve relevant lessons for new tasks

**Key Result:** A team of small LLMs with lessons learned can outperform a much larger LLM and other multi-LLM collaboration methods.

**Key Insight:** Cross-agent learning (sharing lessons) is more powerful than scaling individual agents. This directly validates MMOS's cross-session memory pattern (MEMORY.md shared between agents). The solicitation-banking-selection mechanism maps to: agent reflection -> MEMORY.md write -> MEMORY.md read by next agent.

---

## Part V: Scaling Laws and Orchestration

### 16. Towards a Science of Scaling Agent Systems

- **Authors:** Yubin Kim, Ken Gu, + 16 co-authors (CMU, MIT)
- **Date:** Dec 2025
- **Link:** [arxiv.org/abs/2512.08296](https://arxiv.org/abs/2512.08296)

**5 Architectures Evaluated:**
1. Single-Agent
2. Independent (parallel, no coordination)
3. Centralized (orchestrator routes all)
4. Decentralized (peer-to-peer)
5. Hybrid (hierarchical + lateral)

**180 Configurations, 4 Benchmarks, 3 LLM Families**

**3 Dominant Scaling Effects:**

| Effect | Finding | Implication |
|--------|---------|-------------|
| Tool-Coordination Trade-off | Tool-heavy tasks suffer from multi-agent overhead under fixed budgets | Don't multi-agent simple tool-use tasks |
| Capability Saturation | Coordination returns diminish/negative once single-agent exceeds ~45% | If one agent can handle it, DON'T add more |
| Topology-Dependent Error Amplification | Independent agents: 17.2x error amplification. Centralized: 4.4x | Always use centralized coordination, never fully independent |

**When Multi-Agent Helps vs Hurts:**

| Task Type | Best Architecture | Improvement |
|-----------|-------------------|-------------|
| Parallelizable | Centralized | **+80.8%** |
| Web navigation | Decentralized | **+9.2%** |
| Sequential reasoning | Single-agent | Multi-agent **HURTS** by **39-70%** |

**Predictive Framework:** Predicts optimal coordination strategy for 87% of held-out configurations (R^2=0.524).

**Key Insight:** Multi-agent is NOT universally better. For sequential reasoning (the most common coding task), single-agent WINS. Multi-agent should be reserved for parallelizable tasks (code review, testing, multi-file changes). This is the most important finding for Claude Code's Agent Teams design.

**MMOS Application:**
- Use single-agent for: debugging, sequential code changes, refactoring
- Use multi-agent for: large feature implementation (parallel file changes), comprehensive review, multi-concern analysis (security + performance + UX)
- Always use centralized orchestration (TeammateTool pattern), never independent agents

---

### 17. Scaling Large Language Model-based Multi-Agent Collaboration (MacNet)

- **Authors:** Chen Qian + 11 co-authors (same group as ChatDev)
- **Date:** Jun 2024 (arxiv); ICLR 2025
- **Link:** [arxiv.org/abs/2406.07155](https://arxiv.org/abs/2406.07155)

**MacNet (Multi-Agent Collaboration Network):**
- Agents organized in directed acyclic graphs (DAGs)
- Supports 1000+ agents
- Identified a **collaborative scaling law**: performance follows logistic growth as agents scale
- Collaborative emergence occurs EARLIER than traditional neural scaling emergence
- **Irregular topologies outperform regular ones**

**Key Insight:** Agent collaboration networks should NOT be rigid hierarchies. Irregular, task-adaptive topologies produce better results. The logistic growth pattern means there's a sweet spot of agent count -- adding more beyond that gives diminishing returns.

---

### 18. Multi-Agent Collaboration via Evolving Orchestration

- **Authors:** Yufan Dang, Chen Qian, + 12 co-authors
- **Date:** May 2025; NeurIPS 2025
- **Link:** [arxiv.org/abs/2505.19591](https://arxiv.org/abs/2505.19591)

**Puppeteer Paradigm:**
- Centralized orchestrator ("puppeteer") dynamically directs agents ("puppets")
- Orchestrator trained via reinforcement learning
- Adapts agent sequencing and prioritization in real-time based on task state
- Static organizational structures "struggle to adapt as task complexity and agent numbers grow"

**Key Result:** "The key improvements consistently stem from the emergence of more compact, cyclic reasoning structures under the orchestrator's evolution."

**Key Insight:** Static DAGs are insufficient. The orchestrator should learn to create cyclic reasoning patterns (agent A -> B -> A -> C -> A) rather than strictly sequential pipelines. This validates the need for adaptive orchestration in MMOS beyond the current static `/orchestrate` pattern.

---

### 19. MonoScale: Scaling Multi-Agent System with Monotonic Improvement

- **Authors:** Not specified in search results
- **Date:** Jan 2026
- **Link:** [arxiv.org/abs/2601.23219](https://arxiv.org/abs/2601.23219)

**Problem:** Naive agent pool expansion triggers performance collapse (cold-start on new agents).

**Solution:**
- Expansion-aware update framework
- Generates agent-conditioned familiarization tasks
- Harvests evidence from successes AND failures
- Distills into auditable natural-language memory for routing
- Formalizes as contextual bandit with trust-region memory updates
- Monotonic non-decreasing performance guarantee

**Results:** Agent pool expansion from 3 to 10 agents: accuracy improves from 44.84% to 55.15% on GAIA (no performance collapse).

**Key Insight:** When adding new agents/tools to a system, you need a familiarization phase where the router learns the new agent's capabilities. Simply adding agents degrades performance. This is directly relevant to MMOS's pattern of adding new squad agents.

---

### 20. A Taxonomy of Hierarchical Multi-Agent Systems

- **Authors:** David Moore
- **Date:** Aug 2025
- **Link:** [arxiv.org/abs/2508.12683](https://arxiv.org/abs/2508.12683)

**5-Axis Taxonomy:**
1. Control hierarchy
2. Information flow
3. Role and task delegation
4. Temporal layering
5. Communication structure

**4 Main Topologies:**
- Independent: aggregate isolated outputs
- Decentralized: peer-to-peer exchange
- Centralized: route through orchestrators
- Hybrid: hierarchical control + lateral communication

**Open Challenges:** Explainability, scaling to very large agent populations, safe integration of LLM agents into layered frameworks.

---

## Part VI: Benchmarks

### 21. SWE-Bench Ecosystem (2024-2026)

| Benchmark | Focus | Top Score | Key Finding |
|-----------|-------|-----------|-------------|
| **SWE-bench** (original) | Single-issue GitHub resolution | ~75%+ (2026) | Saturating for top models |
| **SWE-bench Verified** | Human-verified subset | 74.40% (Refact.ai + Claude 4 Sonnet) | Standard benchmark |
| **SWE-bench Pro** | Enterprise-level complexity | 23% (Opus 4.1 / GPT-5) | 3x harder than Verified |
| **SWE-EVO** | Long-horizon software evolution | 21% (GPT-5 + OpenHands) | Multi-step, 21 files avg, 874 tests avg |
| **Terminal-Bench** | CLI environment operation | - | Multi-step workflow recovery |
| **DPAI Arena** (JetBrains) | Full lifecycle, multi-language | - | Beyond issue-to-patch |
| **Cline Bench** | Realistic repo environments | - | Reproducible eval from project snapshots |
| **ACE-Bench** | End-to-end complex features | - | Full feature development |

**Key Finding:** There is a massive gap between isolated issue resolution (~75%) and realistic software evolution (~21%). Current agents are good at focused patches but struggle with sustained, multi-file, multi-step work. This is the primary motivation for multi-agent systems.

---

## Part VII: Surveys and Meta-Analysis

### 22. Key Surveys (2024-2025)

| Survey | Focus | Papers Reviewed | Link |
|--------|-------|-----------------|------|
| He, Treude, Lo (2024, rev. 2025) | Multi-Agent Systems for SE | Systematic review of SDLC stages | [arxiv.org/abs/2404.04834](https://arxiv.org/abs/2404.04834) |
| Dong et al. (2025) | Code Generation with LLM Agents | Single + multi-agent taxonomy | [arxiv.org/abs/2508.00083](https://arxiv.org/abs/2508.00083) |
| FudanSELab (2024, rev. 2025) | LLM-Based Agents for SE | 124 papers, SE + agent perspectives | [arxiv.org/abs/2409.02977](https://arxiv.org/abs/2409.02977) |
| Wu et al. (2025) | Benchmarks + Solutions in SE | 150+ papers, 3 paradigms | [arxiv.org/abs/2510.09721](https://arxiv.org/abs/2510.09721) |
| Cai et al. (2025) | Design Patterns for MAS in SE | 16 patterns, quality attributes | [arxiv.org/abs/2511.08475](https://arxiv.org/abs/2511.08475) |

**Cross-Survey Findings:**
- **16 design patterns** identified, with **Role-Based Cooperation** as most frequent
- **Functional Suitability** is the #1 quality attribute designers prioritize
- **Code Generation** is the most common SE task for multi-agent systems (among 10 SE tasks)
- **Improving code quality** is the most common rationale behind MAS design

---

### 23. Code in Harmony: Evaluating Multi-Agent Frameworks

- **Link:** [openreview.net/forum?id=URUMBfrHFy](https://openreview.net/forum?id=URUMBfrHFy)

**Critical Evaluation of Multi-Agent Coding Frameworks:**

| Framework | Approach | Strength | Weakness |
|-----------|----------|----------|----------|
| AgentCoder | Programmer + Test Designer + Executor cycle | Highest pass@1 (96.3% HumanEval) | Token overhead |
| CodeCoR | Multi-output pruning + repair | Token efficient, 77.8% avg | Lower absolute scores |
| MetaGPT | SOP + structured artifacts | Complex project generation | High communication cost (>$10/task) |
| ChatDev | Chat chain + dehallucination | Good executability | Simpler projects only |
| CodeSIM | Similarity-based selection | Fast | Less thorough |

**Critical Finding:** Large agent groups (MetaGPT, ChatDev) exceed $10 per HumanEval task due to serial message billing. The key design question is balancing thoroughness vs. efficiency.

---

## Part VIII: Additional Notable Papers

### 24. CodePori: Large-Scale Autonomous Software Development

- **Date:** Feb 2024
- **Link:** [arxiv.org/abs/2402.01411](https://arxiv.org/abs/2402.01411)
- 4 agents: Manager, Developer, Finalizer, Verifier
- HumanEval: 87.5%, MBPP: 86.5% Pass@1, 91% practitioner assessment

### 25. SALLMA: Software Architecture for LLM-Based Multi-Agent Systems

- **Date:** 2025
- **Link:** [robertoverdecchia.github.io/papers/SATrends_2025.pdf](https://robertoverdecchia.github.io/papers/SATrends_2025.pdf)
- Modular architecture for cloud-to-edge multi-agent orchestration

---

## Cross-Paper Pattern Synthesis

### Universal Patterns Across All Papers

**1. The 4-Stage Pipeline is Universal**

Every successful system implements some variant of:
```
Understand -> Plan -> Implement -> Verify
```

| Paper | Stage 1 | Stage 2 | Stage 3 | Stage 4 |
|-------|---------|---------|---------|---------|
| MetaGPT | Requirements | Architecture | Engineering | QA |
| ChatDev | Design | Coding | Testing | Review |
| MapCoder | Retrieval | Planning | Code Gen | Debugging |
| AgentCoder | - | - | Programming | Testing + Fixing |
| MAGIS | Manager | Custodian | Developer | QA |
| HyperAgent | Planner | Navigator | Editor | Executor |
| Claude Code | Explore | Plan | Implement | Test |

**2. Separation of Test Generation from Code Generation**

AgentCoder, CodeCoR, and MapCoder all demonstrate that independent test generation (by a separate agent) produces better results than having the coder test their own work. Improvement: 6-18% pass@1.

**3. Structured Artifacts > Free-Form Chat**

MetaGPT's SOP approach (structured intermediate outputs) consistently outperforms ChatDev's free-form chat approach on complex projects. The constraint forces precision.

**4. Centralized Orchestration > Independent Agents**

From the scaling paper: centralized coordination reduces error amplification from 17.2x to 4.4x. Every production system uses centralized orchestration.

**5. Skill/Lesson Accumulation Compounds Performance**

SAGE (+8.9% with 59% fewer tokens), Lessons Learned (small LLMs > large LLM), MapCoder (retrieval from past examples) -- all show that knowledge accumulation across tasks is the highest-leverage improvement.

**6. Self-Play and Self-Modification Work**

Self-Play SWE-RL (+10.4 on SWE-bench), Self-Improving Coding Agent (17-53% improvement), SWE-RL (41% solve rate) -- agents that learn from their own experience improve faster than those trained only on human data.

---

## Quantitative Comparison Table

### Multi-Agent Code Generation (HumanEval Pass@1)

| System | Model | Pass@1 | Year |
|--------|-------|--------|------|
| AgentCoder | GPT-4 | **96.3%** | 2023 |
| MapCoder | GPT-4 | 93.9% | 2024 |
| MetaGPT | GPT-4 | 87.7% (MBPP) | 2023 |
| CodePori | GPT-4 | 87.5% | 2024 |
| CodeCoR | GPT-3.5T | 77.8% (avg) | 2025 |

### Real-World Issue Resolution (SWE-bench Verified)

| System | Solve Rate | Year |
|--------|------------|------|
| Refact.ai + Claude 4 Sonnet | 74.40% | 2025 |
| SWE-RL (Llama3-70B) | 41.0% | 2025 |
| HyperAgent | 31.40% | 2025 |
| MAGIS | 13.94% | 2024 |
| SWE-Agent (GPT-4 Turbo) | 12.47% | 2024 |

### Multi-Agent vs Single-Agent Improvement

| Paper | Multi-Agent Gain | Context |
|-------|-----------------|---------|
| MAGIS | **8x** over direct GPT-4 | GitHub issue resolution |
| Scaling paper | **+80.8%** | Parallelizable tasks (centralized) |
| AgentCoder | **+6.1%** Pass@1 + 2.5x fewer tokens | Code generation |
| Scaling paper | **-39% to -70%** | Sequential reasoning (multi-agent HURTS) |

---

## Recommendations for MMOS

### Immediate (based on strong evidence)

1. **Adopt the 4-stage pipeline formally**
   - Map MMOS agents to: Explore (Understand) -> Plan -> Implement -> QA (Verify)
   - Each stage produces structured artifacts, not free-form chat
   - Evidence: MetaGPT, MAGIS, HyperAgent all use this pattern

2. **Separate test generation from implementation agents**
   - QA agent (quinn) should generate tests INDEPENDENTLY, not review implementer's tests
   - Evidence: AgentCoder shows 6-18% improvement from separation

3. **Use centralized orchestration only**
   - TeammateTool's centralized pattern is the right architecture
   - Never use fully independent parallel agents (17.2x error amplification)
   - Evidence: Scaling Agent Systems paper (180 configs, 4 benchmarks)

4. **Don't use multi-agent for sequential reasoning tasks**
   - Single-agent performs 39-70% BETTER on sequential tasks
   - Reserve multi-agent for: multi-file changes, parallel reviews, multi-concern analysis
   - Evidence: Scaling Agent Systems paper

### Medium-term (emerging patterns)

5. **Implement lesson solicitation-banking-selection**
   - After each agent task, extract lessons (what worked, what failed)
   - Bank in MEMORY.md with structured tags
   - Select relevant lessons for next task based on similarity
   - Evidence: Lessons Learned (NeurIPS 2025), SAGE

6. **Reward skill creation, not just task completion**
   - SAGE shows +8.9% completion with 59% fewer tokens when skill creation is rewarded
   - Add quality metrics that track: new skills created, skills reused, knowledge shared
   - Evidence: SAGE (Dec 2025)

7. **Evolving orchestration over static DAGs**
   - Current `/orchestrate` uses static sequential handoff
   - Academic evidence shows RL-trained orchestrators with cyclic patterns outperform
   - Start with heuristic adaptation (repeat agents if verification fails) before full RL
   - Evidence: Evolving Orchestration (NeurIPS 2025)

### Long-term (research frontier)

8. **Self-play for skill improvement**
   - Agents inject "bugs" in their own outputs, then learn to fix them
   - No human-labeled data needed, only sandboxed environments
   - Evidence: Self-Play SWE-RL (+10.4 on SWE-bench Verified)

9. **MonoScale-style agent onboarding**
   - When adding new agents/squads, run familiarization tasks first
   - Build natural-language memory of new agent capabilities before routing to them
   - Evidence: MonoScale (Jan 2026, monotonic improvement guarantee)

10. **Collaborative scaling law awareness**
    - Performance follows logistic growth with agent count
    - Irregular topologies outperform regular ones
    - Collaborative emergence happens earlier than neural scaling
    - Evidence: MacNet (ICLR 2025)

---

## Research Gaps Identified

1. **No papers on agent MEMORY patterns for SE** -- Most papers treat agents as stateless. Cross-session learning in software development is unstudied.

2. **No papers on agent SKILL progressive disclosure** -- Claude Code's skill auto-discovery pattern has no academic equivalent or evaluation.

3. **Cost optimization for multi-agent SE is underexplored** -- Only Code in Harmony addresses cost. Most papers ignore token economics.

4. **Long-horizon software evolution** -- SWE-EVO shows current agents drop from 65% to 21% on multi-step tasks. This is the primary unsolved problem.

5. **Human-in-the-loop multi-agent coding** -- No papers study optimal HITL integration points in multi-agent SE workflows.

6. **Multi-agent for non-Python languages** -- Nearly all benchmarks and papers focus on Python. Cross-language multi-agent coding is almost unstudied.

---

## Sources

### Primary Papers (deep-read)
- [MetaGPT - arxiv.org/abs/2308.00352](https://arxiv.org/abs/2308.00352)
- [ChatDev - arxiv.org/abs/2307.07924](https://arxiv.org/abs/2307.07924)
- [MapCoder - arxiv.org/abs/2405.11403](https://arxiv.org/abs/2405.11403)
- [AgentCoder - arxiv.org/abs/2312.13010](https://arxiv.org/abs/2312.13010)
- [SWE-Agent - arxiv.org/abs/2405.15793](https://arxiv.org/abs/2405.15793)
- [MAGIS - arxiv.org/abs/2403.17927](https://arxiv.org/abs/2403.17927)
- [HyperAgent - arxiv.org/abs/2409.16299](https://arxiv.org/abs/2409.16299)
- [CodeCoR - arxiv.org/abs/2501.07811](https://arxiv.org/abs/2501.07811)
- [CodeAgent - arxiv.org/abs/2402.02172](https://arxiv.org/abs/2402.02172)
- [Self-Play SWE-RL - arxiv.org/abs/2512.18552](https://arxiv.org/abs/2512.18552)
- [SWE-RL (Meta) - arxiv.org/abs/2502.18449](https://arxiv.org/abs/2502.18449)
- [SAGE Skill Library - arxiv.org/abs/2512.17102](https://arxiv.org/abs/2512.17102)
- [Self-Improving Coding Agent - arxiv.org/abs/2504.15228](https://arxiv.org/abs/2504.15228)
- [Lessons Learned - arxiv.org/abs/2505.23946](https://arxiv.org/abs/2505.23946)
- [Scaling Agent Systems - arxiv.org/abs/2512.08296](https://arxiv.org/abs/2512.08296)
- [MacNet Scaling - arxiv.org/abs/2406.07155](https://arxiv.org/abs/2406.07155)
- [Evolving Orchestration - arxiv.org/abs/2505.19591](https://arxiv.org/abs/2505.19591)
- [MonoScale - arxiv.org/abs/2601.23219](https://arxiv.org/abs/2601.23219)
- [MAS Design Patterns for SE - arxiv.org/abs/2511.08475](https://arxiv.org/abs/2511.08475)
- [Hierarchical MAS Taxonomy - arxiv.org/abs/2508.12683](https://arxiv.org/abs/2508.12683)

### Additional Papers (search-level analysis)
- [Code in Harmony - openreview.net/forum?id=URUMBfrHFy](https://openreview.net/forum?id=URUMBfrHFy)
- [CodePori - arxiv.org/abs/2402.01411](https://arxiv.org/abs/2402.01411)
- [Multi-Agent Code + Debugging - arxiv.org/abs/2505.02133](https://arxiv.org/abs/2505.02133)
- [SWE-EVO Benchmark - arxiv.org/abs/2512.18470](https://arxiv.org/abs/2512.18470)
- [SWE-bench Pro - arxiv.org/abs/2509.16941](https://arxiv.org/abs/2509.16941)

### Surveys
- [LLM-Based MAS for SE - arxiv.org/abs/2404.04834](https://arxiv.org/abs/2404.04834)
- [Code Gen with LLM Agents - arxiv.org/abs/2508.00083](https://arxiv.org/abs/2508.00083)
- [LLM Agents for SE (Fudan) - arxiv.org/abs/2409.02977](https://arxiv.org/abs/2409.02977)
- [Benchmarks + Solutions - arxiv.org/abs/2510.09721](https://arxiv.org/abs/2510.09721)
- [Evaluation of LLM Agents - arxiv.org/abs/2503.16416](https://arxiv.org/abs/2503.16416)
- [SALLMA Architecture - robertoverdecchia.github.io](https://robertoverdecchia.github.io/papers/SATrends_2025.pdf)
