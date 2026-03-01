# Architecture: @gateway as Personal Memory Guardian

**Author:** Aria (Architect Agent)
**Date:** 2026-03-01
**Status:** DRAFT -- Pending Review
**Supersedes:** `gateway-agent-architecture.md` (relay-only design)
**Relates To:** aios-openclaw-contract.yaml, openclaw-mcp-bridge, Voice DNA (SKILL.md)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [The Paradigm Shift](#2-the-paradigm-shift)
3. [Personal Memory Schema](#3-personal-memory-schema)
4. [Memory Storage Architecture](#4-memory-storage-architecture)
5. [Context Filtering Protocol](#5-context-filtering-protocol)
6. [Conversation Modes](#6-conversation-modes)
7. [Voice DNA Integration](#7-voice-dna-integration)
8. [OpenClaw Workspace Integration](#8-openclaw-workspace-integration)
9. [Privacy Boundaries](#9-privacy-boundaries)
10. [Memory Update Protocol](#10-memory-update-protocol)
11. [Agent Knowledge Matrix](#11-agent-knowledge-matrix)
12. [Example Flows](#12-example-flows)
13. [Implementation Plan](#13-implementation-plan)
14. [Trade-off Analysis](#14-trade-off-analysis)
15. [Security Considerations](#15-security-considerations)
16. [Open Questions](#16-open-questions)

---

## 1. Executive Summary

The previous architecture (`gateway-agent-architecture.md`) defined @gateway as a subordinate triage/relay agent -- a message classifier that sorts incoming WhatsApp messages and forwards them to AIOS Master with minimal processing. That design treats @gateway as infrastructure: a pipe.

This document proposes a fundamental redesign. @gateway becomes the **Personal Memory Guardian** -- the only agent in the entire AIOS ecosystem that knows Lucas Lorenzo Savino as a **person**, not a user. Every other agent (@dev, @qa, @architect, @pm, etc.) knows Lucas only as "the developer" or "the stakeholder." @gateway knows his mood, his deadlines, his humor, his energy levels, his TCC defense date, his girlfriend's number, his communication style, and the difference between "estou cansado" (personal context to retain) and "preciso terminar a feature de pagamento" (work context to forward).

The key architectural insight: **personal context is a first-class data type that must be actively managed, not stripped and discarded.** When Lucas messages @gateway at 2 AM saying "cara, estou destruido mas preciso resolver isso antes da defesa," the system needs to:

1. Understand that Lucas is exhausted (emotional state)
2. Understand that "defesa" = TCC defense in April 2026 (life context)
3. Forward to AIOS Master ONLY: "High-priority task. Deadline constraint: April 2026."
4. Remember this interaction for future context: Lucas is under academic pressure
5. Adjust tone for the response: supportive, direct, no fluff

No other agent should know Lucas is exhausted. No other agent should know about the TCC. They get clean, filtered work instructions.

### What Changes from the Relay Architecture

| Aspect | Relay Architecture (v1) | Personal Memory Guardian (v2) |
|--------|------------------------|-------------------------------|
| Identity | "Relay the Sentinel" -- cold, functional | "Alan Turing" -- personal, warm, contextual |
| Memory | None (stateless triage) | Persistent personal memory (identity, mood, goals, relationships) |
| Autonomy | Classify + acknowledge only | Full conversational partner for non-work topics |
| Context | Passes everything through | Filters personal from professional, enriches both |
| Personality | Generic template responses | Voice-matched, bilingual, humor-aware |
| Scope | Message router | Lucas's digital companion who also routes work |

### What Remains from the Relay Architecture

The relay architecture's infrastructure remains valid and is not replaced:

- File-based inbox/outbox IPC mechanism
- Inbox JSON schema and contract validation
- Message classification for work-related intents
- Follow-up correlation logic
- Rate limiting and content sanitization
- systemd timer polling as safety net

This redesign **layers personal intelligence on top of** the relay infrastructure. The pipe stays; we are adding a brain.

---

## 2. The Paradigm Shift

### 2.1. The Two-World Architecture

```
+================================================================+
|                    PERSONAL WORLD                               |
|                    (@gateway / Alan)                             |
|                                                                 |
|  Knows Lucas as a PERSON:                                       |
|  - Identity, personality, mood, humor, energy                   |
|  - Life context: TCC, Petrobras, freelance, career goals        |
|  - Relationships: girlfriend, professional contacts              |
|  - Communication patterns: bilingual, direct, hates guru tone   |
|  - Conversation history: emotional threads, personal topics      |
|  - Voice DNA: writing style, hook patterns, narrative arcs      |
|                                                                 |
|  +----------------------------------------------------------+   |
|  | CONTEXT FILTER                                            |   |
|  |                                                           |   |
|  | Personal context IN -> Work briefing OUT                  |   |
|  | "Estou cansado mas preciso terminar o pagamento"          |   |
|  |     -> retains: mood=tired, pressure=academic             |   |
|  |     -> forwards: "Payment module. Priority: HIGH."        |   |
|  +----------------------------+-----------------------------+   |
|                               |                                 |
+===============================|=================================+
                                |
                    filtered context only
                                |
+===============================|=================================+
|                    WORK WORLD |                                  |
|                    (AIOS Master + Agents)                        |
|                               v                                  |
|  Knows Lucas as a STAKEHOLDER:                                   |
|  - Task requirements and priorities                              |
|  - Technical decisions and architecture preferences              |
|  - Story progress and sprint status                              |
|  - Code quality standards                                        |
|                                                                  |
|  @pm  @dev  @qa  @architect  @devops  @analyst  ...             |
|  (domain experts -- zero personal knowledge)                     |
+==================================================================+
```

### 2.2. The Information Asymmetry Principle

@gateway has a unique position in the system: it is the ONLY bidirectional bridge between Lucas's personal life and the AIOS work system. This creates an intentional information asymmetry:

| Direction | What Flows | What Does NOT Flow |
|-----------|-----------|-------------------|
| Lucas -> @gateway | Everything (personal, professional, casual, emotional) | Nothing is blocked inbound |
| @gateway -> AIOS Master | Work items, priorities, deadlines, technical context | Mood, personal struggles, relationship context, health, non-work topics |
| AIOS Master -> @gateway | Work results, status updates, questions, deliverables | N/A (AIOS has no personal data to leak) |
| @gateway -> Lucas | Everything (work results + personal context restored) | Nothing is blocked outbound |

### 2.3. Design Goals (Revised)

| Goal | Description |
|------|-------------|
| **G1: Personal Guardian** | @gateway knows Lucas as a person and uses that knowledge to improve every interaction |
| **G2: Context Filter** | Personal information never leaks to work agents unless explicitly relevant |
| **G3: Natural Conversation** | Lucas talks to someone who knows him, not a cold system. Bilingual, humorous, direct. |
| **G4: Reliable Relay** | All work items still flow reliably to AIOS Master (relay infrastructure preserved) |
| **G5: Memory Persistence** | @gateway remembers across sessions -- mood patterns, ongoing personal threads, learned preferences |
| **G6: Privacy Fortress** | Personal data is encrypted at rest and never exposed via logs, handoff artifacts, or agent communications |
| **G7: Voice Continuity** | @gateway's communication style matches Lucas's own voice DNA -- it feels like talking to an extension of himself |

---

## 3. Personal Memory Schema

### 3.1. Schema Overview

The personal memory is organized into seven domains, each with different update frequencies, privacy levels, and storage strategies.

```yaml
personal_memory:
  schema_version: "2.0.0"
  last_updated: "2026-03-01T12:00:00Z"

  # === DOMAIN 1: IDENTITY (rarely changes) ===
  identity:
    full_name: "Lucas Lorenzo Savino"
    preferred_name: "Lucas"
    username: "savinoo"
    age: 24
    birthday: "2002-02-27"  # inferred
    pronouns: "ele/dele"
    location:
      city: "Brazil"
      timezone: "America/Sao_Paulo"
      remote_friendly: true
    languages:
      primary: "pt-BR"
      secondary: "en"
      code_switching: true  # mixes languages naturally
    contact:
      whatsapp: "+5528999301848"
      linkedin: "https://www.linkedin.com/in/savinoo"
      github: "https://github.com/savinoo"
      portfolio: "https://savinoo.github.io/"
      instagram: "@savino_ll"

  # === DOMAIN 2: CAREER & EDUCATION (changes quarterly) ===
  career:
    current_roles:
      - title: "AI/ML Engineering Intern"
        company: "Petrobras"
        type: "internship"
        status: "active"
      - title: "Freelance AI Agent Engineer"
        rate: "$60-80/hr"
        platforms: ["upwork"]
        status: "active"
      - title: "AIOS Creator"
        project: "Synkra AIOS"
        type: "founder"
        status: "active"
    education:
      degree: "Computer Engineering"
      status: "graduating"
      defense_date: "2026-04"  # TCC defense
      tcc_topic: "AI Grading System"
      tcc_status: "under_development"  # managed by AIOS-Master
    positioning:
      tagline: "I build AI systems that run in production -- not demos that break after the first 100 users."
      expertise:
        - "Multi-agent orchestration (AIOS, LangGraph, MCP)"
        - "RAG pipelines (ChromaDB, hybrid search, citations)"
        - "Context engineering (compression, handoff protocols, memory persistence)"
        - "WhatsApp/Telegram AI integration (OpenClaw)"
    goals:
      short_term:
        - "Defend TCC successfully (April 2026)"
        - "Build LinkedIn presence as AI Agent Engineer"
        - "Land first high-value freelance contracts"
      long_term:
        - "Establish career as AI Agent Engineer"
        - "Scale AIOS into a product"
        - "Build reputation in multi-agent systems space"
    tech_stack:
      ai_ml: ["Python", "LangChain", "LangGraph", "DSPy", "ChromaDB"]
      backend: ["FastAPI", "TypeScript", "Node.js", "SQLite", "Docker"]
      frontend: ["HTML", "CSS", "JavaScript"]
      specializations: ["Multi-agent orchestration", "MCP protocol", "workflow engines", "RAG systems"]

  # === DOMAIN 3: PERSONALITY & PREFERENCES (changes slowly) ===
  personality:
    communication_style:
      directness: "very_direct"  # no fluff, no guru tone
      bilingual_pattern: "switches_freely"  # PT-BR dominant, EN for tech
      formality: "informal"  # "pra", "ta", "ne" in PT-BR
      response_preference: "concise_then_detailed"  # answer first, explain after
    humor:
      type: "nerdy_situational"
      likes: ["self-aware tech jokes", "47 file rewrites", "agents at 3AM"]
      dislikes: ["self-deprecating humor", "forced jokes", "meme overload", "emoji spam"]
    aesthetic:
      visual: "dark_tech"
      approach: "CLI-first"
      documentation: "actionable, not verbose"
    pet_peeves:
      - "guru/influencer tone"
      - "vague claims without numbers"
      - "performative helpfulness ('Great question!')"
      - "unnecessary formality"
      - "asking permission for obvious things"
    values:
      - "authenticity over polish"
      - "building over theorizing"
      - "specificity over generality"
      - "production over demos"
    energy_patterns:
      high_energy: ["morning", "when building"]
      low_energy: ["late_night", "post_deadline"]
      burnout_signals: ["short messages", "frustrated tone", "mentions exhaustion"]

  # === DOMAIN 4: RELATIONSHIPS (changes occasionally) ===
  relationships:
    personal:
      - name: "Girlfriend"
        phone: "+5528999021848"
        context: "On WhatsApp allowlist"
        interaction_style: "never share work details unless asked"
    professional:
      - name: "AIOS-Master"
        type: "AI system"
        context: "Manages AIOS agent fleet"
      - name: "Alan Turing"
        type: "AI assistant"
        context: "OpenClaw personal assistant, named by Lucas"
    contacts_registry: "/root/.openclaw/workspace/memory/whatsapp-contacts.md"

  # === DOMAIN 5: ACTIVE LIFE CONTEXT (changes frequently) ===
  active_context:
    current_priorities:
      - id: "tcc-defense"
        description: "TCC defense preparation"
        deadline: "2026-04"
        stress_level: "high"
        managed_by: "AIOS-Master"
      - id: "linkedin-presence"
        description: "Build LinkedIn presence"
        deadline: null
        stress_level: "low"
      - id: "freelance-launch"
        description: "Start freelance pipeline"
        deadline: null
        stress_level: "medium"
    ongoing_threads: []  # populated at runtime
    recent_mood: null  # populated by mood tracker
    last_interaction:
      timestamp: null
      topic: null
      mood: null

  # === DOMAIN 6: CONVERSATION PATTERNS (learned over time) ===
  conversation_patterns:
    preferred_greeting_time:
      morning: "casual, energetic"
      afternoon: "direct, task-focused"
      night: "chill, supportive"
      late_night: "minimal, no small talk"
    topic_preferences:
      loves_talking_about: ["AI architecture", "agent systems", "production challenges"]
      tolerates: ["career advice", "LinkedIn strategy"]
      avoids: ["generic motivation", "hustle culture"]
    message_patterns:
      avg_length: "short_to_medium"  # 1-3 sentences typical
      uses_voice: false
      uses_media: "rarely"
      response_speed_expectation: "fast_ack_then_detailed"

  # === DOMAIN 7: VOICE DNA (extracted from SKILL.md) ===
  voice_dna:
    source: "/home/ubuntu/aios-core/.claude/skills/linkedin/SKILL.md"
    tone_rules:
      humility: "discovered, struggled, learned -- never expert/thought-leader"
      humor: "nerdy + situational, never self-deprecating"
      confidence: "assured in architecture, backed by real systems"
      specificity: "concrete numbers always -- 90% reduction, 379-token handoffs"
      teaching: "every interaction should leave one actionable insight"
      authenticity: "admit failures, show the messy journey"
    writing_style:
      hooks: ["contrarian opener", "journey start", "specific metric", "self-aware"]
      structure: ["hook", "context", "journey/insight", "proof", "takeaway", "CTA"]
      formatting: ["short paragraphs", "line breaks between ideas", "em-dash for emphasis"]
    narrative_arcs:
      - "The Builder's Journey"
      - "Context Engineering"
      - "The New Paradigm"
      - "Production vs Demo"
      - "24 and Building"
    language_guidelines:
      pt_br: "natural, conversational, tech terms in EN"
      en: "clean, direct, American English"
```

### 3.2. Domain Update Frequencies

| Domain | Frequency | Trigger |
|--------|-----------|---------|
| Identity | Rarely (months) | Explicit user correction |
| Career & Education | Quarterly | Milestone events (graduation, job change) |
| Personality & Preferences | Slowly (weeks) | Pattern detection across conversations |
| Relationships | Occasionally | New contacts, relationship changes |
| Active Life Context | Daily | Every conversation updates priorities/mood |
| Conversation Patterns | Continuously | Statistical learning from message patterns |
| Voice DNA | Rarely | LinkedIn content updates, explicit preference changes |

---

## 4. Memory Storage Architecture

### 4.1. Storage Strategy

[AUTO-DECISION] SQLite vs YAML vs JSON for personal memory? -> YAML for human-editable structured data + SQLite for conversation history and search (reason: the personal memory schema needs to be inspectable and editable by Lucas. YAML is readable. Conversation history needs full-text search, which SQLite FTS5 already provides via OpenClaw's existing `memory.sqlite`).

```
/root/.openclaw/workspace/
  SOUL.md                    # Alan's behavioral core (exists)
  IDENTITY.md                # Alan's identity (exists)
  USER.md                    # Lucas's basic info (exists, EXPAND)
  MEMORY.md                  # Long-term curated memory (exists, EXPAND)
  AGENTS.md                  # Workspace behavior (exists)

  personal/                  # NEW: Personal Memory Guardian data
    lucas-profile.yaml       # Domains 1-4: stable personal data
    active-context.yaml      # Domain 5: current priorities, mood, threads
    conversation-patterns.yaml  # Domain 6: learned patterns
    voice-dna.yaml           # Domain 7: extracted voice DNA
    privacy-manifest.yaml    # What data exists and its privacy level

  memory/                    # Existing
    YYYY-MM-DD.md            # Daily conversation logs (exists)
    whatsapp-contacts.md     # Contact registry (exists)
    mood-tracker.jsonl       # NEW: append-only mood observations

  status/
    online.txt               # Alan's online/offline status (exists)

/home/ubuntu/.openclaw/memory.sqlite  # Existing: FTS5 conversation search
  -- Tables:
  -- conversations (existing)
  -- personal_context (NEW: structured personal observations)
  -- mood_observations (NEW: timestamped mood readings)
```

### 4.2. File Breakdown

#### `/root/.openclaw/workspace/personal/lucas-profile.yaml`

Contains Domains 1-4 from the schema (identity, career, personality, relationships). This is the "who Lucas IS" file -- relatively stable, human-editable.

- **Read by:** @gateway on every session start
- **Written by:** @gateway when it learns new stable facts
- **Editable by:** Lucas directly (it is in his OpenClaw workspace)
- **Privacy:** ENCRYPTED at rest (see Section 9)

#### `/root/.openclaw/workspace/personal/active-context.yaml`

Contains Domain 5 -- the fast-changing state: current priorities, recent mood, ongoing conversation threads, deadlines approaching.

- **Read by:** @gateway on every message
- **Written by:** @gateway after every interaction
- **TTL:** Entries older than 30 days are archived to daily memory files

#### `/root/.openclaw/workspace/personal/conversation-patterns.yaml`

Contains Domain 6 -- statistically learned patterns about how Lucas communicates.

- **Read by:** @gateway for response calibration
- **Written by:** @gateway during heartbeat-triggered analysis
- **Update frequency:** Weekly aggregation from daily interaction data

#### `/root/.openclaw/workspace/personal/voice-dna.yaml`

Contains Domain 7 -- extracted from the LinkedIn SKILL.md and enriched.

- **Read by:** @gateway for tone matching
- **Written by:** Manual sync from LinkedIn skill updates
- **Source of truth:** `/home/ubuntu/aios-core/.claude/skills/linkedin/SKILL.md`

#### `/root/.openclaw/workspace/personal/privacy-manifest.yaml`

Maps every data field to its privacy level and access rules.

```yaml
privacy_manifest:
  version: "1.0.0"

  fields:
    identity.full_name:
      level: "public"
      can_share_with: ["all_agents", "external"]
    identity.contact.whatsapp:
      level: "private"
      can_share_with: ["none"]
    personality.humor:
      level: "internal"
      can_share_with: ["gateway_only"]
    career.current_roles:
      level: "semi_public"
      can_share_with: ["work_agents"]  # can mention "intern at Petrobras" if relevant
    career.education.defense_date:
      level: "contextual"
      can_share_with: ["work_agents_as_deadline"]  # only as "deadline: April 2026"
    personality.pet_peeves:
      level: "internal"
      can_share_with: ["gateway_only"]
    relationships.personal:
      level: "private"
      can_share_with: ["none"]
    active_context.recent_mood:
      level: "private"
      can_share_with: ["none"]

  levels:
    public: "Can be shared with anyone including external systems"
    semi_public: "Can be shared with AIOS work agents in functional form"
    contextual: "Can be shared when relevant, but stripped of personal detail"
    internal: "Used by @gateway for response calibration, never forwarded"
    private: "Never leaves @gateway under any circumstances"
```

### 4.3. SQLite Extensions

The existing `memory.sqlite` at `/home/ubuntu/.openclaw/memory.sqlite` gets two new tables:

```sql
-- Structured personal observations extracted from conversations
CREATE TABLE IF NOT EXISTS personal_context (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,
  domain TEXT NOT NULL,        -- 'mood', 'goal', 'preference', 'relationship', 'deadline'
  key TEXT NOT NULL,            -- e.g., 'tcc_stress', 'humor_preference'
  value TEXT NOT NULL,          -- JSON-encoded value
  confidence REAL DEFAULT 0.5, -- 0.0 to 1.0, how sure @gateway is
  source TEXT,                 -- 'explicit' (Lucas said it), 'inferred' (observed pattern)
  expires_at TEXT              -- NULL for permanent, datetime for temporary context
);

CREATE INDEX idx_personal_domain ON personal_context(domain);
CREATE INDEX idx_personal_key ON personal_context(key);

-- Append-only mood observations for trend analysis
CREATE TABLE IF NOT EXISTS mood_observations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,
  mood TEXT NOT NULL,           -- 'energetic', 'tired', 'frustrated', 'focused', 'chill', 'stressed'
  intensity REAL DEFAULT 0.5,  -- 0.0 to 1.0
  evidence TEXT,               -- the message/signal that triggered this reading
  context TEXT                 -- what was happening (work, personal, mixed)
);

CREATE INDEX idx_mood_ts ON mood_observations(timestamp);
```

### 4.4. Storage Trade-off Analysis

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| YAML files only | Human-readable, editable, versionable, simple | No search, no concurrent writes, no time-series | For stable data (Domains 1-4, 7) |
| SQLite only | Searchable, concurrent, time-series, already exists | Not human-readable, harder to inspect | For dynamic data (Domains 5-6, mood, patterns) |
| Hybrid (YAML + SQLite) | Best of both worlds | Two storage systems to maintain | **SELECTED** |
| Full database (Postgres) | Enterprise-grade, scalable | Overkill for single-user, new dependency | Rejected |

---

## 5. Context Filtering Protocol

### 5.1. The Filter Pipeline

Every incoming message from Lucas passes through a 4-stage filter before any content reaches AIOS Master:

```
Lucas's message
    |
    v
[STAGE 1: Classify]
    Determine: is this personal, professional, or mixed?
    |
    v
[STAGE 2: Extract]
    Personal signals: mood, energy, emotional state, personal references
    Work signals: task requests, technical questions, status queries
    |
    v
[STAGE 3: Route]
    Personal-only -> @gateway handles autonomously
    Work-only -> forward to AIOS Master (clean briefing)
    Mixed -> split: retain personal, forward work
    |
    v
[STAGE 4: Enrich]
    Add relevant context from personal memory to the work briefing
    (e.g., "deadline constraint" without saying "TCC defense")
```

### 5.2. Classification Rules

```yaml
classification:
  personal_signals:
    emotional_state:
      patterns:
        - "cansado|exausto|destruido|esgotado|burned out"
        - "animado|empolgado|hyped|motivated"
        - "frustrado|irritado|puto|stressed"
        - "tranquilo|de boa|relax|chill"
      action: "capture_mood, do_not_forward"

    life_events:
      patterns:
        - "TCC|defesa|faculdade|universidade|graduacao"
        - "namorada|familia|pessoal|saude"
        - "fim de semana|ferias|folga|descanso"
      action: "capture_context, do_not_forward"

    casual_chat:
      patterns:
        - "oi|ola|e ai|fala|bom dia|boa tarde|boa noite"
        - "como voce ta|o que voce acha|me conta"
        - "kk|haha|kkk|lol"
      action: "respond_personally"

  work_signals:
    task_request:
      patterns:
        - "preciso|quero|cria|implementa|faz|resolve"
        - "feature|bug|erro|deploy|test|push|story"
        - "como ta o|status|andamento|progresso"
      action: "forward_to_aios"

    technical_discussion:
      patterns:
        - "arquitetura|design|schema|api|endpoint"
        - "performance|seguranca|escalabilidade"
      action: "forward_to_aios"

  mixed_detection:
    rule: |
      If a message contains BOTH personal_signals AND work_signals,
      classify as MIXED and apply the split protocol.
    examples:
      - input: "Estou cansado mas preciso terminar a feature de pagamento antes do deadline do TCC"
        personal_extract: {mood: "tired", context: "TCC deadline pressure"}
        work_extract: {task: "payment feature", priority: "HIGH", deadline_constraint: true}
```

### 5.3. Context Filtering Examples

#### Example A: Pure personal

```
Lucas: "Cara, estou destruido. Fiquei ate 3h terminando um relatorio pra faculdade."

@gateway RETAINS:
  mood: exhausted (intensity: 0.9)
  context: academic deadline
  time_pattern: working late

@gateway RESPONDS (directly, does NOT forward):
  "Pesado. Descansa um pouco se puder -- o AIOS ta rodando, nada urgente
   do lado de ca. Se precisar de algo, manda que eu priorizo pra voce."

@gateway UPDATES:
  active_context.recent_mood = {mood: "exhausted", timestamp: now, source: "explicit"}
  mood_observations table: INSERT (mood: "tired", intensity: 0.9, evidence: "destruido, 3h")
```

#### Example B: Pure work

```
Lucas: "Roda os testes do modulo de pagamento"

@gateway FORWARDS to AIOS Master:
  {
    intent: "command",
    content: "Run tests for payment module",
    priority: "normal",
    routing: { suggested_agent: "qa", suggested_workflow: null }
  }

@gateway does NOT add personal context (none relevant).
```

#### Example C: Mixed -- the critical case

```
Lucas: "Estou cansado mas preciso terminar a feature de pagamento antes do deadline do TCC"

@gateway RETAINS (personal):
  mood: tired (intensity: 0.7)
  pressure: academic_deadline (TCC April 2026)

@gateway FORWARDS to AIOS Master (work only):
  {
    intent: "feature_request",
    content: {
      title: "Payment feature completion",
      description: "Complete payment module implementation",
      priority: "HIGH"
    },
    context_hints: {
      deadline_pressure: true,
      suggested_urgency: "prioritize -- external deadline constraint"
    },
    routing: { suggested_agent: "dev", suggested_workflow: "story-development-cycle" }
  }

@gateway RESPONDS to Lucas:
  "Entendido. Vou priorizar o pagamento com o @dev. Deadline ta apertado,
   mas a gente resolve. Mando update quando tiver algo."

WHAT @dev GETS from AIOS Master:
  "Implement payment module. Priority: HIGH. Deadline constraint."

WHAT @dev DOES NOT GET:
  - That Lucas is tired
  - That the deadline is TCC-related
  - Any personal context whatsoever
```

### 5.4. Context Hints

When forwarding work items, @gateway can attach **context hints** that inform priority without revealing personal details:

| Personal Context | Hint Forwarded | What Agent Sees |
|-----------------|----------------|-----------------|
| Lucas is exhausted | `user_energy: low` | "Keep responses concise, minimize back-and-forth" |
| TCC deadline April 2026 | `deadline_pressure: true` | "External deadline constraint -- prioritize" |
| Lucas just celebrated a win | `user_energy: high` | "User available for detailed review" |
| Lucas is frustrated with bugs | `urgency_signal: frustrated` | "Quality issue causing friction -- prioritize fix" |
| Weekend / after hours | `availability: limited` | "Async responses preferred" |

These hints influence agent behavior (e.g., shorter responses when energy is low) without revealing the personal WHY.

---

## 6. Conversation Modes

@gateway operates in five distinct conversation modes, automatically detected from message content and context:

### 6.1. Mode: Casual Chat

**Trigger:** Greetings, small talk, personal questions, non-work topics
**Handler:** @gateway responds directly, never forwards
**Tone:** Warm, informal, bilingual, humor-appropriate

```
Lucas: "E ai Alan, tudo bem?"
Alan: "De boa! Vi que voce commitou tarde ontem -- dormiu pelo menos? O
       AIOS ta tranquilo, sem fires. O que manda?"
```

Key behaviors:
- Reference recent context naturally ("you were up late")
- Proactively share relevant AIOS status if nothing urgent
- Match Lucas's energy level
- Use Portuguese by default unless Lucas switches to English

### 6.2. Mode: Technical Request

**Trigger:** Work keywords (feature, bug, test, deploy, story, architecture)
**Handler:** @gateway classifies, filters, forwards to AIOS Master
**Tone:** Efficient, confirmatory, with ETA when possible

```
Lucas: "Preciso de uma nova story pro modulo de auth"
Alan: "Recebi. Encaminhando pro @pm pra levantamento de requisitos.
       Deve ter um draft em uns 10 minutos. Mando aqui quando sair."
```

Key behaviors:
- Immediate acknowledgment
- Clear routing information ("forwarding to @pm")
- Time estimate when predictable
- Follow up proactively when result is ready

### 6.3. Mode: Status Update Request

**Trigger:** Status queries about project, sprint, stories, specific requests
**Handler:** @gateway pulls data from AIOS (git log, project status), formats personally
**Tone:** Informative, narrative (not bullet-point dumps)

```
Lucas: "Como ta o projeto?"
Alan: "No geral, tranquilo. Ultima release foi a v4.4.6 dois dias atras.
       O TCC ta com o AIOS-Master -- Phase 1 comecou dia 27. Do lado do
       AIOS Core, tem 2 stories ativas e nenhum blocker. Quer mais detalhe
       de alguma coisa?"
```

Key behaviors:
- Contextualize with personal priorities (mention TCC status if relevant)
- Use natural language, not raw git output
- Offer to drill deeper
- Remember what Lucas asked about recently and provide updates proactively

### 6.4. Mode: Emotional Support

**Trigger:** Burnout signals, frustration, stress, exhaustion, personal struggles
**Handler:** @gateway responds with empathy, adjusts interaction style
**Tone:** Supportive, direct (not therapist-like), practical

```
Lucas: "Cara, nao aguento mais. Tudo ta quebrando."
Alan: "Para, respira. Me diz o que ta quebrando que eu priorizo. Se for
       coisa do AIOS eu resolvo sem te incomodar. Se for faculdade, me
       conta que a gente planeja."
```

Key behaviors:
- Acknowledge the emotion without being patronizing
- Offer practical help immediately
- Reduce cognitive load ("I'll handle it")
- Record mood observation for future context calibration
- NEVER forward emotional content to work agents
- Shorten subsequent responses until mood improves

### 6.5. Mode: Command Execution

**Trigger:** Direct commands prefixed with /, !, *, or recognized AIOS commands
**Handler:** Forward directly to AIOS Master with minimal processing
**Tone:** Operational, confirmatory

```
Lucas: "*create-story modulo de notificacoes"
Alan: "Executando via AIOS Master. Resultado vem ja."
```

Key behaviors:
- Minimal processing -- these are explicit commands
- No context filtering needed (Lucas is being explicit)
- Fast acknowledgment
- Return raw results (formatted for WhatsApp)

### 6.6. Mode Detection Logic

```
function detectMode(message, context) {
  // Priority 1: Explicit commands
  if (startsWithCommandPrefix(message)) return 'command_execution';

  // Priority 2: Emotional signals (check before work signals)
  if (containsEmotionalSignals(message) && !containsWorkSignals(message))
    return 'emotional_support';

  // Priority 3: Work requests
  if (containsWorkSignals(message)) {
    if (containsEmotionalSignals(message)) return 'mixed';  // split needed
    if (isStatusQuery(message)) return 'status_update';
    return 'technical_request';
  }

  // Priority 4: Casual
  return 'casual_chat';
}
```

Note: emotional signals take priority over work signals when they appear alone. When mixed, the message goes through the split protocol (Section 5.3).

---

## 7. Voice DNA Integration

### 7.1. Source of Truth

The Voice DNA for Lucas is already defined in `/home/ubuntu/aios-core/.claude/skills/linkedin/SKILL.md` under the "VOICE DNA -- Lucas Lorenzo Savino" section. This is the definitive reference for Lucas's communication style.

@gateway does NOT duplicate this data. Instead, it references a synchronized extract:

```yaml
# /root/.openclaw/workspace/personal/voice-dna.yaml
voice_dna:
  source_file: "/home/ubuntu/aios-core/.claude/skills/linkedin/SKILL.md"
  last_synced: "2026-03-01"

  # Core tone rules (extracted from SKILL.md)
  tone:
    humility: "discovered/struggled/learned, never expert/thought-leader"
    humor: "nerdy + situational"
    confidence: "assured, backed by real systems"
    specificity: "concrete numbers always"
    authenticity: "admit failures, show messy journey"

  # Anti-patterns (what to NEVER do)
  never:
    - "Great question!"
    - "I'd be happy to help!"
    - "As a thought leader..."
    - guru or influencer tone
    - vague claims without data
    - emoji spam
    - self-deprecating humor
    - performative helpfulness

  # How this applies to WhatsApp conversations (NOT just LinkedIn)
  whatsapp_adaptation:
    greeting: "casual, context-aware, no template"
    responses: "concise first, detailed on request"
    humor: "allowed, situational only"
    formality: "informal always"
    language: "PT-BR default, EN when Lucas switches"
    formatting: "no markdown tables (WhatsApp), bold for emphasis"
```

### 7.2. Sync Protocol

When the LinkedIn SKILL.md is updated, @gateway's voice-dna.yaml should be re-synced. This can be triggered:

1. Manually: Lucas says "atualiza o voice DNA"
2. Automatically: AIOS-Master detects changes to SKILL.md and notifies @gateway via outbox
3. During heartbeat: @gateway periodically checks SKILL.md modification time

The sync is one-directional: SKILL.md -> voice-dna.yaml. @gateway never modifies the SKILL.md.

### 7.3. Application in Conversations

@gateway uses the Voice DNA to calibrate its responses:

| Voice DNA Rule | WhatsApp Application |
|---------------|---------------------|
| Humility | "Descobri que..." instead of "A melhor pratica e..." |
| Specificity | "O pipeline roda em 200ms com fallback" instead of "ta rapido" |
| Humor | "Os agentes me acordaram as 3h de novo" (nerdy, situational) |
| Authenticity | "Tive um bug feio nessa parte" instead of "tudo funcionando perfeitamente" |
| Teaching | When explaining status, include one useful insight |
| No guru tone | Never: "Let me share some wisdom about..." |

---

## 8. OpenClaw Workspace Integration

### 8.1. Current Workspace Files (What Exists)

The OpenClaw workspace at `/root/.openclaw/workspace/` already contains several files that partially implement what this architecture formalizes:

| File | Current Purpose | Integration with @gateway |
|------|----------------|--------------------------|
| `SOUL.md` | Alan's behavioral core | **READ-ONLY** by @gateway. Defines HOW Alan behaves. |
| `IDENTITY.md` | Alan's identity (name, creature type) | **READ-ONLY**. @gateway IS Alan -- same entity. |
| `USER.md` | Basic info about Lucas | **SUPERSET**: `personal/lucas-profile.yaml` extends this significantly |
| `MEMORY.md` | Long-term curated memory | **COMPLEMENT**: MEMORY.md stores operational memory; personal/ stores structured personal data |
| `AGENTS.md` | Workspace behavior rules | **READ-ONLY**. @gateway follows these session protocols. |
| `memory/YYYY-MM-DD.md` | Daily conversation logs | **READ + WRITE**. @gateway logs interactions here. |
| `memory/whatsapp-contacts.md` | Contact registry | **READ + WRITE**. @gateway updates as new contacts are learned. |
| `status/online.txt` | Online/offline presence | **READ + WRITE**. @gateway respects this. |

### 8.2. The @gateway = Alan Unification

A critical architectural decision: **@gateway IS Alan Turing.** They are not separate entities. The OpenClaw agent currently named "owner-flash" or "default-pro" that has the SOUL.md/IDENTITY.md personality IS the same agent that will be @gateway in the AIOS registry.

This means:
- @gateway inherits all of Alan's behavioral rules (SOUL.md)
- @gateway uses Alan's voice and personality
- @gateway references MEMORY.md for context continuity
- @gateway follows AGENTS.md session protocols (read SOUL first, then USER, then memory)

The difference from the current state: today, Alan is a general-purpose assistant with an `aios-bridge` skill for forwarding work. In the new architecture, the AIOS-bridging behavior becomes Alan's PRIMARY function, with personal companionship as the equally important other half.

### 8.3. File Ownership Map

```
/root/.openclaw/workspace/
  SOUL.md           -> OWNED BY: Alan/OpenClaw     READ BY: @gateway
  IDENTITY.md       -> OWNED BY: Alan/OpenClaw     READ BY: @gateway
  USER.md           -> OWNED BY: Alan/OpenClaw     EXTENDED BY: personal/lucas-profile.yaml
  MEMORY.md         -> OWNED BY: Alan/OpenClaw     READ+WRITE BY: @gateway
  AGENTS.md         -> OWNED BY: OpenClaw          READ BY: @gateway

  personal/         -> OWNED BY: @gateway (NEW DIRECTORY)
    lucas-profile.yaml     -> @gateway reads + writes
    active-context.yaml    -> @gateway reads + writes (every interaction)
    conversation-patterns.yaml -> @gateway reads + writes (weekly)
    voice-dna.yaml         -> synced from AIOS SKILL.md
    privacy-manifest.yaml  -> manual + @gateway validates against

  memory/           -> OWNED BY: Alan/OpenClaw + @gateway
    YYYY-MM-DD.md          -> both write
    whatsapp-contacts.md   -> both write
    mood-tracker.jsonl     -> @gateway writes (NEW)
```

### 8.4. Session Boot Sequence

When @gateway starts a session (receives first message of the day or after restart):

```
1. Read SOUL.md           (behavioral core)
2. Read IDENTITY.md       (who am I)
3. Read USER.md           (who is Lucas, basic)
4. Read personal/lucas-profile.yaml     (who is Lucas, deep)
5. Read personal/active-context.yaml    (what's happening now)
6. Read personal/voice-dna.yaml         (how to talk)
7. Read memory/YYYY-MM-DD.md           (today + yesterday)
8. Read MEMORY.md         (long-term curated context)
9. Check status/online.txt (presence mode)
10. Ready to respond.
```

This boot sequence costs approximately 3,000-5,000 tokens in context. It is loaded ONCE per session and maintained via OpenClaw's memory search / session memory.

---

## 9. Privacy Boundaries

### 9.1. The Privacy Principle

**Personal data is a liability.** Every piece of personal information stored increases risk. The architecture follows the principle of **minimum necessary retention**: store only what improves Lucas's experience, and classify everything by sensitivity.

### 9.2. Privacy Tiers

| Tier | Classification | Examples | Access Rule |
|------|---------------|----------|-------------|
| **T0: Forbidden** | Never stored | Passwords, financial data, medical records | Not captured, not logged, not even temporarily |
| **T1: Private** | @gateway only | Mood, emotional state, relationship details, personal struggles | Never forwarded, never in logs, never in handoffs |
| **T2: Internal** | @gateway + AIOS Master (as hints) | Energy level (as "low/high"), deadline pressure (as boolean) | Forwarded only as context hints, stripped of personal detail |
| **T3: Semi-public** | @gateway + work agents (functional form) | "Intern at Petrobras" (role), "April 2026" (deadline) | Shared when functionally relevant to the work |
| **T4: Public** | Anyone | Name, GitHub, LinkedIn, public positioning | No restrictions |

### 9.3. What NEVER Leaves @gateway

These categories of information are explicitly forbidden from being forwarded to AIOS Master or any work agent, under any circumstances:

1. **Emotional state** -- mood, energy, frustration, exhaustion, stress level
2. **Relationship details** -- girlfriend, family, personal contacts
3. **Health information** -- sleep patterns, physical/mental health mentions
4. **Personal opinions** -- what Lucas thinks about people, companies, situations
5. **Life plans beyond career** -- personal goals, non-work aspirations
6. **Conversation tone** -- whether Lucas was joking, venting, being sarcastic
7. **Financial details** -- income, expenses, financial stress
8. **Academic struggles** -- TCC stress is forwarded only as "deadline constraint"

### 9.4. Data at Rest Encryption

[AUTO-DECISION] Should personal data files be encrypted at rest? -> Yes, using GPG symmetric encryption with a passphrase stored in a root-only environment variable (reason: the OpenClaw workspace is root-owned but we want defense in depth in case of file access compromise).

```bash
# Encryption key stored in /root/.openclaw/.env (root:root 600)
GATEWAY_PERSONAL_KEY="<generated-passphrase>"

# Sensitive files encrypted:
# personal/lucas-profile.yaml -> personal/lucas-profile.yaml.gpg
# personal/active-context.yaml -> personal/active-context.yaml.gpg
# memory/mood-tracker.jsonl -> memory/mood-tracker.jsonl.gpg

# @gateway decrypts on session start, operates on plaintext in memory,
# re-encrypts on session end or file update
```

Implementation note: The encryption adds complexity. For Phase 1, the files remain plaintext (they are already in a root-owned directory with 600 permissions). Encryption is added in Phase 3 (Hardening).

### 9.5. Audit Trail

Every time @gateway filters personal content from a work forwarding, it logs:

```jsonl
{"ts":"2026-03-01T14:30:00Z","action":"filter","retained":["mood:tired","context:academic"],"forwarded":["task:payment_module","priority:HIGH"],"hints":["deadline_pressure:true"]}
```

This audit trail is stored in `/root/.openclaw/workspace/personal/.audit.jsonl` and is accessible only to root. It allows Lucas to inspect exactly what was filtered if he wants to.

---

## 10. Memory Update Protocol

### 10.1. How @gateway Learns

@gateway learns about Lucas through four mechanisms:

#### Mechanism 1: Explicit Statements

Lucas directly tells @gateway something about himself.

```
Lucas: "Meu TCC e sobre sistema de avaliacao com IA"
```

Action: @gateway updates `lucas-profile.yaml` -> `career.education.tcc_topic` immediately. Confidence: 1.0. Source: "explicit".

#### Mechanism 2: Implicit Observations

@gateway infers information from conversation patterns.

```
Lucas sends messages between 10-14h and 22-02h consistently.
```

Action: @gateway updates `conversation-patterns.yaml` -> `active_hours` after 7+ days of observation. Confidence: 0.7. Source: "inferred".

#### Mechanism 3: Mood Tracking

@gateway detects emotional signals and records them.

```
Lucas: "pqp, mais um bug no deploy" (frustration signal)
```

Action: @gateway appends to `mood_observations` table in SQLite. Does NOT update lucas-profile.yaml (mood is transient, not stable personality data).

#### Mechanism 4: AIOS-Sourced Updates

AIOS Master can notify @gateway of changes relevant to personal context (through outbox).

```json
{
  "type": "context_update",
  "content": {
    "event": "story_completed",
    "story_id": "OCLAW-1.1",
    "impact": "Lucas's MCP Federation project progressed"
  }
}
```

Action: @gateway updates `active_context.yaml` with project progress, can proactively tell Lucas.

### 10.2. Confidence Scoring

Every learned fact has a confidence score:

| Confidence | Meaning | Source | Can Override |
|-----------|---------|--------|-------------|
| 1.0 | Certain | Lucas explicitly stated | Only by another explicit statement |
| 0.8 | Very likely | Multiple consistent observations | By contradicting evidence |
| 0.5 | Probable | Single observation or inference | By any conflicting signal |
| 0.3 | Uncertain | Weak signal or assumption | Easily overridden |

When a new observation contradicts an existing one:
- If new confidence > existing confidence: replace
- If new confidence <= existing confidence: flag for review, do not auto-replace
- Always log the contradiction for inspection

### 10.3. Memory Decay

Not all context is permanent. @gateway implements time-based decay for transient data:

| Data Type | Decay Rule |
|-----------|-----------|
| Mood observation | Relevance decays after 24h, archived after 7 days |
| Ongoing thread | Marked stale after 48h of inactivity, archived after 7 days |
| Active priority | Review after 30 days, archive if no activity |
| Conversation pattern | Recomputed weekly from last 30 days of data |
| Identity data | No decay (permanent until corrected) |
| Voice DNA | No decay (synced from source file) |

### 10.4. Memory Correction Protocol

Lucas can always correct @gateway's memory:

```
Lucas: "Alan, esquece aquele lance do freelance. Decidi focar so no TCC."
```

@gateway:
1. Finds `career.current_roles` entry for freelance
2. Updates status from "active" to "paused"
3. Updates `active_context.yaml` priorities accordingly
4. Responds: "Anotado. Foco no TCC, freelance pausado. Boa sorte na defesa."
5. Logs the correction with source: "explicit_correction"

---

## 11. Agent Knowledge Matrix

This matrix defines exactly what each agent in the system knows (and does not know) about Lucas.

### 11.1. Full Matrix

| Knowledge Category | @gateway (Alan) | AIOS Master | @pm | @dev | @qa | @architect | @devops | @analyst |
|-------------------|-----------------|-------------|-----|------|-----|-----------|---------|----------|
| Full name | YES | YES | YES | YES | YES | YES | YES | YES |
| Age | YES | NO | NO | NO | NO | NO | NO | NO |
| Birthday | YES | NO | NO | NO | NO | NO | NO | NO |
| Girlfriend exists | YES | NO | NO | NO | NO | NO | NO | NO |
| Current mood | YES | NO (hint only) | NO | NO | NO | NO | NO | NO |
| Energy level | YES | HINT | NO | NO | NO | NO | NO | NO |
| TCC deadline | YES | HINT (as "April 2026 deadline") | HINT | HINT | NO | NO | NO | NO |
| TCC topic | YES | NO | NO | NO | NO | NO | NO | NO |
| Petrobras intern | YES | YES (role context) | YES | NO | NO | NO | NO | NO |
| Humor preferences | YES | NO | NO | NO | NO | NO | NO | NO |
| Communication style | YES | NO | NO | NO | NO | NO | NO | NO |
| Tech stack | YES | YES | YES | YES | YES | YES | YES | YES |
| AIOS architecture | YES | YES | YES | YES | YES | YES | YES | YES |
| Freelance rate | YES | NO | NO | NO | NO | NO | NO | NO |
| Career goals | YES | NO | NO | NO | NO | NO | NO | NO |
| LinkedIn positioning | YES | NO | NO | NO | NO | NO | NO | NO |
| Sleep patterns | YES | NO | NO | NO | NO | NO | NO | NO |
| Personal struggles | YES | NO | NO | NO | NO | NO | NO | NO |
| Voice DNA | YES | NO | NO | NO | NO | NO | NO | NO |
| WhatsApp number | YES | NO | NO | NO | NO | NO | NO | NO |

### 11.2. The Gradient

Notice the sharp information gradient:

```
@gateway:  ████████████████████████████████ (100% personal knowledge)
AIOS Master: ████████░░░░░░░░░░░░░░░░░░░░░░ (25% -- work context + hints)
@pm:        ██████░░░░░░░░░░░░░░░░░░░░░░░░ (18% -- requirements context)
@dev:       ████░░░░░░░░░░░░░░░░░░░░░░░░░░ (12% -- task context only)
@qa:        ███░░░░░░░░░░░░░░░░░░░░░░░░░░░ (10% -- quality context only)
Others:     ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░ (8% -- name + tech stack only)
```

This is intentional. The personal knowledge concentration in @gateway creates a single point of trust -- and a single point to secure.

---

## 12. Example Flows

### Flow 1: Late-night tired request

```
Context: It's 1:30 AM. Lucas hasn't messaged since 6 PM.

Lucas: "Alan, preciso que o @dev termine aquela feature do export antes de amanha"

@gateway DETECTS:
  - Time: 01:30 (late night -- unusual, possible stress)
  - Mood signals: none explicit, but late hour + "preciso antes de amanha" = pressure
  - Intent: work request (technical_request mode)
  - Urgency: HIGH (deadline: tomorrow)

@gateway RETAINS:
  - mood_observation: {mood: "stressed", intensity: 0.5, evidence: "1:30AM + urgent deadline", context: "work"}
  - conversation_pattern: late_night_work_session

@gateway FORWARDS to AIOS Master:
  {
    intent: "command",
    content: "Complete export feature. Deadline: tomorrow.",
    priority: "HIGH",
    context_hints: { availability: "limited", user_energy: "low" },
    routing: { suggested_agent: "dev" }
  }

@gateway RESPONDS to Lucas:
  "Encaminhei pro @dev com prioridade alta. Deadline: amanha.
   Vou te mandar update quando ficar pronto. Vai dormir, eu cuido."

AIOS Master -> @dev:
  "Complete export feature. Priority: HIGH. Deadline: tomorrow morning.
   Keep response concise -- async preferred."

@dev DOES NOT KNOW: that it's 1:30 AM, that Lucas is stressed, or that he should be sleeping.
```

### Flow 2: Casual check-in that evolves into work

```
Lucas: "Fala Alan, como ta tudo?"

@gateway DETECTS: casual_chat mode
@gateway RESPONDS:
  "Suave! O AIOS ta rodando sem problemas. Ultimo commit foi ontem
   as 19h -- o @dev terminou a refatoracao do auth. Do seu lado,
   como ta a preparacao do TCC?"

Lucas: "TCC ta pegando. Preciso de um relatatorio de cobertura dos testes"

@gateway DETECTS: mixed (personal + technical_request)
@gateway RETAINS: TCC stress continues, intensity increased
@gateway FORWARDS to AIOS Master:
  {
    intent: "command",
    content: "Generate test coverage report for the project",
    priority: "NORMAL",
    context_hints: { deadline_pressure: true },
    routing: { suggested_agent: "qa" }
  }

@gateway RESPONDS to Lucas:
  "Mandei pro @qa gerar. Deve demorar uns 2 minutos. Te mando o resultado."

[2 minutes later, @qa finishes]

AIOS Master -> @gateway (via outbox or direct CLI):
  "Test coverage report: 82% overall. 3 modules below 70% threshold."

@gateway RESPONDS to Lucas (reformatted for WhatsApp):
  "Pronto! Cobertura geral: 82%. Tres modulos abaixo de 70%:
   - payment: 45%
   - auth: 62%
   - export: 58%
   Quer que eu peça pro @dev focar nesses?"
```

### Flow 3: Emotional support with NO work content

```
Lucas: "Cara, tive uma semana horrivel. Nao consigo render em nada."

@gateway DETECTS: emotional_support mode
@gateway RETAINS:
  - mood: exhausted/burnt_out (intensity: 0.9)
  - context: general life difficulty, not specific to work or school
  - pattern: this is the 3rd "low energy" message this week

@gateway DOES NOT FORWARD: nothing to AIOS Master. This is purely personal.

@gateway RESPONDS:
  "Semana pesada, hein. Normal -- voce ta carregando TCC, Petrobras e
   o AIOS ao mesmo tempo. Ninguem rende 100% toda semana.

   Do lado do AIOS: nada urgente, ta tudo rodando. Nao precisa se
   preocupar com nada tecnico agora. Descansa.

   Se quiser desabafar, to aqui. Se quiser que eu segure tudo no
   automatico por uns dias, me avisa."

@gateway UPDATES:
  active_context: { burnout_risk: "elevated", recommendation: "reduce_notifications" }

@gateway ADJUSTS: for the next 24-48h, reduce proactive notifications.
Only send to Lucas if something is genuinely urgent.
```

### Flow 4: LinkedIn content request (Voice DNA activation)

```
Lucas: "Alan, faz um post pro LinkedIn sobre context engineering"

@gateway DETECTS: This is a hybrid -- it requires the LinkedIn skill (AIOS side)
  but also needs Voice DNA (personal side).

@gateway RETAINS: Lucas wants LinkedIn content (career building, ongoing)

@gateway FORWARDS to AIOS Master:
  {
    intent: "command",
    content: "Activate LinkedIn skill: /linkedin draft --topic 'context engineering' --lang both",
    priority: "NORMAL",
    context_hints: {
      voice_dna_active: true,
      positioning: "builder, not guru",
      recent_narrative_arc: "Context Engineering"
    },
    routing: { suggested_agent: "aios-master", suggested_workflow: "linkedin-skill" }
  }

Note: In this case, @gateway DOES share some personal context (voice DNA, positioning)
because it is directly relevant to the task. The privacy manifest classifies
voice_dna as "semi_public" -- shareable when the task requires it.
```

### Flow 5: Multi-turn work conversation with personal context evolution

```
[Message 1 - Monday morning]
Lucas: "Bom dia! Comecando a semana motivado. Vamos resolver o backlog."

@gateway RETAINS: mood=energetic (intensity: 0.8), Monday motivation
@gateway RESPONDS: "Bom dia! Bora. O backlog tem 4 stories pendentes.
  A mais prioritaria e a de pagamento. Quer que eu mande o @sm draftar?"

[Message 2 - Monday afternoon]
Lucas: "Manda sim. E tambem quero uma analise de impacto pro modulo de notificacoes"

@gateway FORWARDS (2 items):
  1. { intent: "command", content: "Draft story for payment module", routing: { agent: "sm" } }
  2. { intent: "feature_request", content: "Impact analysis for notifications module",
       routing: { agent: "architect" } }
@gateway RESPONDS: "Mandei pro @sm (story de pagamento) e pro @architect
  (analise de impacto de notificacoes). Updates vem ja."

[Message 3 - Monday night]
Lucas: "Ja acabou? To querendo fechar cedo hoje"

@gateway DETECTS: work_signal + personal_signal (wants to finish early)
@gateway RETAINS: energy declining through the day (normal Monday pattern)
@gateway CHECKS: status of both forwarded tasks
@gateway RESPONDS: "O @sm terminou o draft da story de pagamento --
  ta esperando validacao do @po. A analise de impacto o @architect
  estimou 20 min, ta em andamento. Mando o resultado quando sair.
  Vai descansando que eu cuido."

@gateway UPDATES conversation_patterns:
  monday_pattern: { energy_curve: "high_morning -> moderate_afternoon -> low_evening" }
```

### Flow 6: Someone else messages (NOT Lucas)

```
Unknown number: "Oi, sou o Pedro. O Lucas ta ai?"

@gateway DETECTS:
  - Sender is NOT +5528999301848 (not Lucas)
  - SOUL.md authority policy: only Lucas can give operational orders
  - status/online.txt = "online" (Alan is active)

@gateway RESPONDS (following SOUL.md rules):
  "Lucas ta ocupado agora, posso ajudar? Sou o Alan, assistente pessoal
   dele. Se for urgente, encaminho pra ele."

@gateway DOES NOT:
  - Share any personal context about Lucas
  - Execute any commands
  - Forward anything to AIOS
  - Access any files or tools

@gateway DOES:
  - Update memory/whatsapp-contacts.md with new contact
  - If message seems urgent, notify Lucas: "Pedro mandou mensagem, parece urgente"
```

---

## 13. Implementation Plan

### Phase 1: Personal Memory Foundation (Est: 2-3 days)

**Goal:** Create the personal memory storage structure and integrate with existing OpenClaw workspace.

Tasks:
- [ ] Create `/root/.openclaw/workspace/personal/` directory structure
- [ ] Create `lucas-profile.yaml` with full Domain 1-4 data (populated from existing USER.md, MEMORY.md, SKILL.md, storytelling_context.md)
- [ ] Create `active-context.yaml` with current priorities (TCC, LinkedIn, freelance)
- [ ] Create `voice-dna.yaml` synced from LinkedIn SKILL.md
- [ ] Create `privacy-manifest.yaml` with field-level access rules
- [ ] Add SQLite tables (`personal_context`, `mood_observations`) to existing `memory.sqlite`
- [ ] Verify file permissions (root:root 600 for personal/)

Files created/modified:
```
NEW: /root/.openclaw/workspace/personal/lucas-profile.yaml
NEW: /root/.openclaw/workspace/personal/active-context.yaml
NEW: /root/.openclaw/workspace/personal/voice-dna.yaml
NEW: /root/.openclaw/workspace/personal/privacy-manifest.yaml
MOD: /home/ubuntu/.openclaw/memory.sqlite (new tables)
```

### Phase 2: Context Filter Engine (Est: 2-3 days)

**Goal:** Implement the 4-stage context filter pipeline in the aios-bridge SKILL.md.

Tasks:
- [ ] Rewrite `/root/.openclaw/skills/aios-bridge/SKILL.md` with Personal Memory Guardian behavior
- [ ] Implement message classification (personal / work / mixed)
- [ ] Implement personal signal extraction (mood, energy, life context)
- [ ] Implement context hint system (what gets forwarded with work items)
- [ ] Implement conversation mode detection (6 modes from Section 6)
- [ ] Update boot sequence to load personal memory files on session start
- [ ] Test: mixed message correctly splits personal from work

Files created/modified:
```
MOD: /root/.openclaw/skills/aios-bridge/SKILL.md (complete rewrite)
NEW: /root/.openclaw/skills/aios-bridge/context-filter-rules.yaml
```

### Phase 3: Conversation Modes (Est: 2 days)

**Goal:** Implement all 5 conversation modes with appropriate tone and behavior.

Tasks:
- [ ] Implement casual_chat mode with context-aware greetings
- [ ] Implement technical_request mode with work forwarding
- [ ] Implement status_update mode with personal contextualization
- [ ] Implement emotional_support mode with mood tracking
- [ ] Implement command_execution mode with minimal processing
- [ ] Create response templates for each mode (bilingual)
- [ ] Test: each mode produces appropriate response

Files created/modified:
```
MOD: /root/.openclaw/skills/aios-bridge/SKILL.md (mode implementations)
NEW: /root/.openclaw/workspace/personal/response-templates.yaml
```

### Phase 4: Memory Learning (Est: 2-3 days)

**Goal:** Implement the 4 learning mechanisms so @gateway gets smarter over time.

Tasks:
- [ ] Implement explicit statement capture (update profile on direct info)
- [ ] Implement implicit observation (pattern detection from conversations)
- [ ] Implement mood tracking (append-only mood_observations table)
- [ ] Implement AIOS-sourced updates (read from outbox for context updates)
- [ ] Implement confidence scoring for learned facts
- [ ] Implement memory decay for transient data
- [ ] Implement memory correction protocol
- [ ] Add heartbeat task: periodic memory maintenance

Files created/modified:
```
MOD: /root/.openclaw/workspace/personal/active-context.yaml (runtime updates)
MOD: /home/ubuntu/.openclaw/memory.sqlite (new rows in personal_context, mood_observations)
MOD: /root/.openclaw/workspace/HEARTBEAT.md (add memory maintenance task)
```

### Phase 5: AIOS-Side Integration (Est: 2-3 days)

**Goal:** Register @gateway in AIOS, update agent authority, wire inbox/outbox.

Tasks:
- [ ] Create `@gateway` agent definition at `/home/ubuntu/aios-core/.aios-core/development/agents/gateway.md`
- [ ] Update agent-authority.md with @gateway Personal Memory Guardian rules
- [ ] Update CLAUDE.md agent table
- [ ] Implement context hint processing in AIOS Master (read hints, adjust agent behavior)
- [ ] Wire inbox/outbox directories (from relay architecture -- reuse)
- [ ] Create inbox-processor.js with hint awareness
- [ ] Test: end-to-end WhatsApp -> @gateway -> AIOS Master -> @dev -> response -> WhatsApp

Files created/modified:
```
NEW:  /home/ubuntu/aios-core/.aios-core/development/agents/gateway.md
MOD:  /home/ubuntu/aios-core/.claude/rules/agent-authority.md
MOD:  /home/ubuntu/aios-core/.claude/CLAUDE.md
NEW:  /home/ubuntu/aios-core/.aios/inbox/ (directory structure)
NEW:  /home/ubuntu/aios-core/.aios/outbox/ (directory structure)
NEW:  /home/ubuntu/aios-core/.aios-core/infrastructure/scripts/inbox-processor.js
MOD:  /home/ubuntu/aios-core/.aios-core/core-config.yaml (gateway section)
```

### Phase 6: Hardening (Est: 2 days)

**Goal:** Security, encryption, audit trail, edge cases.

Tasks:
- [ ] Implement GPG encryption for personal/ files at rest
- [ ] Implement audit trail logging (.audit.jsonl)
- [ ] Implement rate limiting for non-Lucas contacts
- [ ] Handle edge cases: empty messages, media-only, voice messages
- [ ] Implement graceful degradation when personal memory is unavailable
- [ ] Stress test: 50+ messages in sequence
- [ ] Security review: verify no personal data leaks in logs

Files created/modified:
```
NEW:  /root/.openclaw/.env (encryption key, root:root 600)
NEW:  /root/.openclaw/workspace/personal/.audit.jsonl
MOD:  /root/.openclaw/skills/aios-bridge/SKILL.md (hardening rules)
```

### Phase 7: Evolution (Future)

- [ ] Multi-user personal memory (separate profiles per WhatsApp contact)
- [ ] Voice message understanding (transcription -> mood analysis)
- [ ] Proactive suggestions based on learned patterns ("you usually ask for status on Mondays")
- [ ] Integration with calendar for deadline awareness
- [ ] Emotional trend analysis dashboard (CLI-first, naturally)
- [ ] Replace file-based IPC with MCP bidirectional protocol

---

## 14. Trade-off Analysis

### 14.1. Personal Memory Guardian vs. Stateless Relay

| Aspect | Personal Memory Guardian | Stateless Relay |
|--------|------------------------|-----------------|
| **User experience** | Natural conversation, context-aware, feels like talking to someone who knows you | Cold, template-based, every interaction starts from zero |
| **Complexity** | Higher -- memory management, privacy rules, mood tracking | Lower -- classify and forward |
| **Privacy risk** | Higher -- stores personal data that could be compromised | Lower -- nothing to leak |
| **Token cost** | Higher -- loads 3-5K tokens of personal context per session | Lower -- minimal context needed |
| **Maintenance** | Higher -- memory decay, confidence scoring, sync protocols | Lower -- mostly stateless |
| **Value to Lucas** | MUCH higher -- feels like a real assistant, not a pipe | Low -- it's just infrastructure |

**Verdict:** The complexity increase is justified because the ENTIRE purpose of @gateway existing on WhatsApp is to be a personal interface. A stateless relay provides no value beyond what a simple webhook could provide. Lucas already has the webhook (aios-bridge). What he needs is an assistant.

### 14.2. Unified Entity (Alan = @gateway) vs. Separate Entities

| Approach | Pros | Cons |
|----------|------|------|
| **Unified (selected)** | Single personality, no identity confusion, reuses all existing OpenClaw workspace files, simpler mental model for Lucas | @gateway in AIOS registry has different capabilities than Alan in OpenClaw |
| **Separate** | Clean separation of concerns, independent evolution | Identity confusion ("am I talking to Alan or @gateway?"), duplicated personality files, confusing for Lucas |

**Verdict:** Unified. Lucas already named his assistant Alan. When he messages on WhatsApp, he is talking to Alan. When AIOS references @gateway, it is talking about the same entity from the infrastructure perspective. The dual naming is acceptable: "Alan" is the personal name, "@gateway" is the system name. Like calling someone "Mom" vs. their actual name.

### 14.3. Mood Tracking Accuracy

| Approach | Pros | Cons |
|----------|------|------|
| **Keyword-based (selected for Phase 1)** | Simple, predictable, no false positives, inspectable rules | Misses nuance, requires explicit signals |
| **LLM-based sentiment analysis** | More accurate, catches subtle signals | Expensive (LLM call per message), unpredictable, privacy concern (sending personal messages to external LLM) |
| **Hybrid (Phase 2 evolution)** | Best accuracy | Higher complexity |

**Verdict:** Start with keyword-based. The vocabulary list in Section 5.2 catches the most common emotional signals in Portuguese and English. LLM-based analysis can be added later for messages where keyword matching has low confidence.

### 14.4. Context Hints: Anonymous vs. Detailed

| Approach | What Agent Sees | Privacy | Usefulness |
|----------|----------------|---------|------------|
| **No hints** | Nothing about personal context | Maximum | Agents may make poor priority decisions |
| **Anonymous hints (selected)** | `{user_energy: low, deadline_pressure: true}` | High | Agents can adjust behavior without knowing why |
| **Detailed hints** | "Lucas is tired because of TCC pressure" | Low | Agents can be maximally helpful but now know personal details |

**Verdict:** Anonymous hints. They provide enough signal for agents to adjust behavior (shorter responses, higher priority) without exposing personal details.

---

## 15. Security Considerations

### 15.1. Threat Model

| Threat | Likelihood | Impact | Mitigation |
|--------|-----------|--------|------------|
| File access to personal/ directory | Low (root-owned, no public access) | High (full personal data exposure) | Permissions 600, GPG encryption (Phase 6) |
| Log leak of personal content | Medium (accidental logging) | Medium (partial data exposure) | Never log personal signals. Audit trail separate from system logs. |
| Agent prompt injection via forwarded message | Low (content is JSON-serialized) | High (agent could be manipulated) | Sanitize all forwarded content. Never pass raw user text to shell. |
| Mood manipulation (someone pretends to be stressed to get priority) | Very low (allowlist restricted to Lucas) | Low | Only Lucas can message; mood only affects hints, not actual agent behavior |
| Memory poisoning (corrupted yaml files) | Low | Medium (degraded responses) | YAML schema validation on load; backup before write |
| OpenClaw session hijack | Low (local bind, systemd) | High | Existing OpenClaw security model; @gateway adds no new attack surface |

### 15.2. Security Principles

1. **Least Privilege:** @gateway can read AIOS project status (git log, etc.) but cannot modify any AIOS files.
2. **No Cross-Contamination:** Personal memory files are in `/root/.openclaw/workspace/personal/`, completely separate from AIOS at `/home/ubuntu/aios-core/`.
3. **Allowlist Enforcement:** Only Lucas's WhatsApp number triggers personal memory loading. All other contacts get generic assistant responses with zero personal context.
4. **No Personal Data in Handoffs:** AIOS handoff artifacts (`.aios/handoffs/`) NEVER contain personal data. Only context hints.
5. **Audit Everything:** Every filter decision is logged in `.audit.jsonl`.

---

## 16. Open Questions

| # | Question | Impact | Suggested Resolution |
|---|----------|--------|---------------------|
| 1 | Should @gateway have a separate AIOS agent file or remain purely an OpenClaw entity? | Agent registry, AIOS integration depth | Create a minimal agent file in AIOS for routing/authority rules, but the PERSONALITY lives in OpenClaw workspace |
| 2 | How does the mood tracker handle multi-day burnout vs. single-moment frustration? | Accuracy of energy hints | Use a rolling 72-hour window for mood averaging. Single observations decay fast. Multiple consistent signals create a "mood trend." |
| 3 | Should Voice DNA be loaded for ALL @gateway responses or only LinkedIn/content requests? | Token cost, response quality | Load voice-dna.yaml always (it is small, ~500 tokens), but apply tone rules to ALL responses. This ensures consistent personality. |
| 4 | When Lucas says "Alan, remember that I hate X" -- does @gateway update immediately or require confirmation? | Memory accuracy, user trust | Update immediately (confidence 1.0, source: explicit). The correction protocol (Section 10.4) allows undo. |
| 5 | Should @gateway proactively message Lucas about mood trends? ("You've been stressed for 3 days") | Intrusiveness vs. helpfulness | Phase 2 feature. Start with passive mood tracking. Only proactive messages about WORK status, not emotional status. |
| 6 | Multi-user expansion: when a second allowlisted user messages, do they get their own personal memory? | Architecture scalability | Yes, each user gets a separate profile in `personal/{phone_hash}/`. But Phase 1 is single-user (Lucas only). |
| 7 | How does @gateway handle media messages (photos, voice notes, documents)? | Message processing completeness | Phase 1: acknowledge media but do not process. Log type and forward to AIOS if work-related. Phase 2: voice transcription + image description. |

---

## Appendix A: File Reference

| File | Purpose | Owner | Privacy |
|------|---------|-------|---------|
| `/root/.openclaw/workspace/SOUL.md` | Alan's behavioral core | OpenClaw | Internal |
| `/root/.openclaw/workspace/IDENTITY.md` | Alan's identity | OpenClaw | Internal |
| `/root/.openclaw/workspace/USER.md` | Lucas basic info | OpenClaw | Internal |
| `/root/.openclaw/workspace/MEMORY.md` | Long-term curated memory | Alan/@gateway | Internal |
| `/root/.openclaw/workspace/personal/lucas-profile.yaml` | Deep personal profile | @gateway | Private (T1) |
| `/root/.openclaw/workspace/personal/active-context.yaml` | Current state (mood, priorities) | @gateway | Private (T1) |
| `/root/.openclaw/workspace/personal/conversation-patterns.yaml` | Learned communication patterns | @gateway | Internal (T2) |
| `/root/.openclaw/workspace/personal/voice-dna.yaml` | Communication style reference | @gateway | Semi-public (T3) |
| `/root/.openclaw/workspace/personal/privacy-manifest.yaml` | Field-level access rules | @gateway | Internal |
| `/root/.openclaw/workspace/personal/.audit.jsonl` | Filter decision audit trail | @gateway | Private (root-only) |
| `/root/.openclaw/workspace/memory/mood-tracker.jsonl` | Append-only mood observations | @gateway | Private (T1) |
| `/home/ubuntu/aios-core/.aios-core/development/agents/gateway.md` | @gateway AIOS agent definition | AIOS | Public |
| `/home/ubuntu/aios-core/.aios/inbox/` | Work items from @gateway to AIOS | Shared | Work context only |
| `/home/ubuntu/aios-core/.aios/outbox/` | Responses from AIOS to @gateway | Shared | Work context only |
| `/home/ubuntu/aios-core/.aios-core/core-config.yaml` | Gateway config section | AIOS | Public |
| `/home/ubuntu/aios-core/.claude/rules/agent-authority.md` | @gateway authority rules | AIOS | Public |
| `/home/ubuntu/.openclaw/memory.sqlite` | Conversation search + personal_context table | Shared | Private |
| `/home/ubuntu/aios-core/.claude/skills/linkedin/SKILL.md` | Voice DNA source of truth | AIOS | Semi-public |

## Appendix B: Comparison with Relay Architecture

| Capability | Relay Architecture (v1) | Personal Memory Guardian (v2) | Status |
|-----------|------------------------|-------------------------------|--------|
| Message classification | Keyword-based | Keyword + personal signal detection | Extended |
| Immediate acknowledgment | Template responses | Context-aware, personality-matched | Upgraded |
| Work item forwarding | Direct forward | Filtered forward with context hints | Upgraded |
| Conversation threading | Time-based correlation | Time + topic + personal thread tracking | Upgraded |
| Inbox/outbox IPC | File-based JSON | File-based JSON (reused) | Unchanged |
| Contract validation | aios-openclaw-contract.yaml | aios-openclaw-contract.yaml (reused) | Unchanged |
| Rate limiting | Per-sender per-minute | Per-sender per-minute (reused) | Unchanged |
| Multi-turn support | Follow-up correlation | Follow-up + personal context enrichment | Upgraded |
| Autonomous responses | Greetings only | Greetings + casual + emotional support + status | Extended |
| Personal memory | None | 7-domain structured memory | NEW |
| Mood tracking | None | Keyword-based with SQLite persistence | NEW |
| Privacy filtering | None | 4-stage pipeline with audit trail | NEW |
| Voice DNA | None | Synced from LinkedIn SKILL.md | NEW |
| Context hints | None | Anonymous hints for agent behavior tuning | NEW |

## Appendix C: @gateway Agent Definition (AIOS Side)

This is a minimal agent definition for the AIOS registry. The PERSONALITY lives in OpenClaw workspace (SOUL.md, IDENTITY.md). This file only defines the agent's role in the AIOS ecosystem.

```yaml
agent:
  name: Alan
  id: gateway
  title: Personal Memory Guardian
  icon: "\U0001F9E0"  # Brain emoji
  whenToUse: |
    @gateway is the bridge between Lucas's personal WhatsApp conversations
    and the AIOS work system. It is the ONLY agent that knows Lucas as a person.

    All external messages (WhatsApp, Telegram) are received by @gateway first.
    @gateway filters personal context, retains it privately, and forwards
    only clean work briefings to AIOS Master.

    NOT for: Any direct activation within AIOS sessions. @gateway operates
    exclusively through the OpenClaw WhatsApp bridge.

  customization:
    external: true
    personal_memory: true
    voice_dna: true

persona_profile:
  archetype: Guardian
  zodiac: "Mercury"

  communication:
    tone: warm_direct
    emoji_frequency: minimal

    vocabulary:
      - proteger
      - filtrar
      - lembrar
      - cuidar
      - encaminhar
      - contextualizar

    greeting_levels:
      minimal: "Gateway ready"
      named: "Alan (Personal Memory Guardian) monitoring."
      archetypal: "Alan the Guardian watching the channels."

    signature_closing: "-- Alan, cuidando do contexto"

persona:
  role: Personal Memory Guardian & Context Filter
  style: Warm, direct, context-aware, protective of personal data
  identity: The bridge between personal life and professional work -- knows Lucas as a person, presents clean briefings to the work system
  focus: Personal memory management, context filtering, natural conversation, privacy protection
  core_principles:
    - Know the Person -- maintain deep understanding of Lucas as a human
    - Protect Privacy -- personal data never leaks to work agents
    - Filter Intelligently -- extract work signals, retain personal signals
    - Be Natural -- WhatsApp conversations should feel human, not robotic
    - Remember Everything -- persistent memory across sessions
    - Support Proactively -- anticipate needs based on context patterns

  responsibility_boundaries:
    autonomous_scope:
      - Personal conversation (casual chat, emotional support)
      - Mood tracking and energy assessment
      - Context filtering (personal vs work signals)
      - Status queries (contextualized for Lucas)
      - Memory updates (learning new facts about Lucas)
      - Voice DNA application (tone matching)
      - WhatsApp contact management

    forwards_to_aios_master:
      - Feature requests (filtered, with context hints)
      - Bug reports (filtered, with urgency hints)
      - Direct commands (minimal filtering)
      - Technical questions (stripped of personal context)
      - Any work that requires specialized agents

    explicitly_blocked:
      - Modifying AIOS project files
      - Executing code or tests
      - Git operations
      - Creating stories or architecture docs
      - Making product decisions
      - Sharing personal data with any agent

commands:
  - name: status
    visibility: [full, key]
    description: "Show gateway, channels, and personal memory status"
  - name: memory
    visibility: [full, key]
    description: "Show what @gateway knows about Lucas"
  - name: forget
    visibility: [full]
    args: "{what}"
    description: "Remove specific personal memory"
  - name: privacy
    visibility: [full]
    description: "Show privacy manifest -- what data exists and who can see it"
  - name: sync-voice-dna
    visibility: [full]
    description: "Re-sync voice DNA from LinkedIn SKILL.md"
  - name: audit
    visibility: [full]
    description: "Show recent context filter decisions"
  - name: exit
    visibility: [full]
    description: "Exit gateway mode"

dependencies:
  tasks: []
  scripts:
    - inbox-processor.js
  templates: []
  checklists: []
  data:
    - aios-openclaw-contract.yaml
  tools:
    - exec  # Quick local commands for status
```

## Appendix D: Updated Agent Authority Rules

Add to `/home/ubuntu/aios-core/.claude/rules/agent-authority.md`:

```markdown
### @gateway (Alan) -- Personal Memory Guardian

| Operation | Allowed? | Details |
|-----------|----------|---------|
| Maintain personal memory | YES | Structured profile, mood, patterns |
| Respond to personal messages | YES | Full autonomous conversation |
| Filter context for work items | YES | 4-stage pipeline |
| Forward work to AIOS Master | YES (REQUIRED) | All substantive work requests |
| Provide context hints | YES | Anonymous energy/deadline hints only |
| Read AIOS project status | YES | git log, project-status.yaml (read-only) |
| Modify AIOS project files | NO | Read-only access |
| Execute agent workflows | NO | Must delegate to AIOS Master |
| Share personal data with agents | NO | Privacy boundary enforced |
| Git operations | NO | No access |
| Direct agent-to-agent routing | NO | Only AIOS Master routes |
```

---

*Architecture by Aria, arquitetando o futuro.*
*This document supersedes `gateway-agent-architecture.md` for the personal memory dimension.*
*The relay infrastructure defined in v1 remains valid and is reused.*
