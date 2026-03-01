# Validation Report: @gateway as Personal Memory Guardian

**Auditor:** @pedro-valerio (Process Absolutist)
**Date:** 2026-03-01
**Status:** CONCERNS (7 FAIL, 11 CONCERNS, 7 PASS)
**Architecture Under Review:** Personal Memory Gateway Workflow
**Baseline Architecture:** `gateway-agent-architecture.md` (Subordinate WhatsApp Bridge)

---

## Executive Summary

The proposal transforms @gateway from a **message triage relay** (current architecture) into a **personal memory guardian** that maintains a persistent model of Lucas as a person -- mood, preferences, life context, emotional state -- and uses that model to filter, personalize, and gate information flow between Lucas and technical AIOS agents.

This represents a fundamental scope expansion. The current architecture (`gateway-agent-architecture.md`) defines @gateway as a subordinate with these design goals:

> G1: @gateway NEVER makes substantive decisions. It triages, acknowledges, and relays.

The personal memory guardian model requires @gateway to make substantive decisions: what is personal vs. technical, what mood to store, how to adjust tone, what to filter. This is a direct contradiction of G1.

The report below validates each path, veto condition, checkpoint, and edge case using the core principle:

> "Se executor CONSEGUE fazer errado, processo esta errado."

---

## Table of Contents

1. [Critical Path Validation](#1-critical-path-validation)
2. [Veto Condition Validation](#2-veto-condition-validation)
3. [Checkpoint Coverage Validation](#3-checkpoint-coverage-validation)
4. [Unidirectional Data Flow Validation](#4-unidirectional-data-flow-validation)
5. [Edge Case Validation](#5-edge-case-validation)
6. [Structural Process Audit](#6-structural-process-audit)
7. [Summary Matrix](#7-summary-matrix)
8. [Recommendations](#8-recommendations)

---

## 1. Critical Path Validation

### Path 1: Personal Context Filtering

```
Lucas sends: "Estou cansado mas precisa terminar o modulo de pagamento"
@gateway extracts: mood=tired, request=payment module
@gateway stores mood, forwards sanitized request to AIOS Master
```

**Verdict: FAIL**

| Check | Result | Detail |
|-------|--------|--------|
| Classification mechanism defined? | NO | The current architecture uses keyword-based classification (Section 8.2 of gateway-agent-architecture.md). Personal context extraction (mood, emotional state) requires NLU/sentiment analysis -- a fundamentally different capability. No classification rules exist for personal vs. technical content splitting within a single message. |
| Store mechanism defined? | NO | "Personal memory" has no schema, no storage location, no retention policy, no encryption spec. The existing SQLite at `/home/ubuntu/.openclaw/memory.sqlite` stores conversation history, not structured personal data. |
| Forwarding preserves intent? | AMBIGUOUS | "Feature request: payment module. Priority: HIGH" -- who decides priority is HIGH? The original message says "precisa terminar" (needs to finish), not "urgent." @gateway is making a priority judgment call. This violates V3 (must preserve intent). |
| Response personalization defined? | NO | "Pronto! Descansa depois :)" -- this requires @gateway to compose original text using personal context. The current architecture only allows pre-defined response templates (Section 8.3). Free-form personalized responses require LLM reasoning, not template matching. |

**Issues Found:**

1. **No extraction algorithm defined.** "mood=tired" -- by what mechanism? The current architecture explicitly chose keyword-based deterministic classification over LLM-based classification for speed. Mood extraction is inherently LLM-based. This contradicts the design decision in Section 8.2.
2. **Mixed-content message splitting has no rules.** There is no defined algorithm for separating "Estou cansado" (personal) from "precisa terminar o modulo de pagamento" (technical) within a single sentence. Any heuristic will produce false positives (treating technical context as personal) or false negatives (leaking personal context into forwarded messages).
3. **Priority inference violates V3.** @gateway should forward the message content as-is and let @pm/@dev decide priority. Translating "cansado" into "Priority: HIGH" is a substantive decision.

---

### Path 2: Casual Conversation (no AIOS involvement)

```
Lucas sends: "Bom dia, como estao as coisas?"
@gateway responds naturally knowing Lucas's context
NO forwarding to AIOS Master
```

**Verdict: CONCERNS**

| Check | Result | Detail |
|-------|--------|--------|
| Classification as casual? | PARTIAL | Current architecture handles "bom dia" as GREETING (template response). "como estao as coisas?" is ambiguous -- could be casual or status_query. Section 8.2 Priority 3 keywords would classify "como esta" as status_query, triggering semi-autonomous handling with `exec` commands, not a casual chat. |
| "Knowing Lucas's context" defined? | NO | What context? Previous conversation? Personal preferences? Project state? "Responds naturally" is not a deterministic behavior -- it requires free-form LLM generation using a personal knowledge base that does not exist yet. |
| No forwarding enforced? | NO | There is no checkpoint that validates the decision NOT to forward. If @gateway incorrectly classifies a technical request as casual, it silently drops it. The current architecture logs to SQLite with `forwarded: false`, but nobody audits these logs. |

**Issues Found:**

1. **Ambiguous messages default to wrong path.** "Como estao as coisas?" is both a greeting and a status query. The current keyword classifier would match "como esta" and classify as `status_query`, triggering an `exec` command for git status. The personal guardian model would treat it as casual. Neither is reliably correct. No disambiguation protocol exists.
2. **"Responds naturally" is an anti-specification.** A process-valid specification would define: what context is loaded, what template/pattern is used, what the maximum response length is, and what topics are allowed in casual responses.

---

### Path 3: Privacy Boundary Test

```
@dev requests personal info about Lucas
@gateway BLOCKS
Exception: @content-visual needs aesthetic preferences (allowed, filtered)
```

**Verdict: FAIL**

| Check | Result | Detail |
|-------|--------|--------|
| Block mechanism defined? | NO | There is no API or protocol by which @dev (or any AIOS agent) CAN request personal info from @gateway. In the current architecture, agents do not communicate with @gateway at all -- they communicate through AIOS Master, and @gateway is on the OpenClaw side (a separate process). The "blocking" is architectural by default: agents literally cannot reach @gateway's memory. |
| Exception path for @content-visual? | NO | @content-visual does not exist in the agent registry. No exception path is defined. No filter mechanism determines what "aesthetic preferences" means vs. other personal data. |
| Request audit trail? | NO | No logging of denied requests. No alert mechanism. |

**Issues Found:**

1. **The threat model is architecturally impossible under current design.** @gateway runs as a separate OpenClaw process. AIOS agents run in Claude Code. They share a filesystem (inbox/outbox) but the inbox schema does not include personal data fields. An agent would have to read the SQLite database directly to access conversation history. The correct fix is filesystem permissions on the SQLite file, not application-level blocking in @gateway.
2. **Exception paths without allowlists = V1 violation by construction.** If @content-visual "needs aesthetic preferences," who defines the allowlist of what data can flow? Without an explicit field-level allowlist, the filter is LLM-judgment-based, which means it CAN leak personal data. From my previous audit: "LLM-based categorization without allowlist = V1 violation by construction."
3. **@content-visual is an undefined agent.** It does not appear in CLAUDE.md, agent-authority.md, or the agent registry. Referencing a non-existent agent in a security boundary definition is a process gap.

---

### Path 4: Memory Growth

```
Lucas says: "Agora prefiro respostas em portugues"
@gateway updates language preference
Future interactions honor preference
Relevant agents notified of communication preference change
```

**Verdict: CONCERNS**

| Check | Result | Detail |
|-------|--------|--------|
| Preference update mechanism? | NO | No schema for personal preferences. No update API. No versioning. |
| "Future interactions honor" enforcement? | NO | Who enforces that @gateway uses the stored preference? The LLM could ignore it. No checkpoint validates consistency. |
| Agent notification protocol? | NO | "Relevant agents notified" -- through what mechanism? The inbox/outbox protocol is for messages from Lucas, not for @gateway-initiated notifications about Lucas's preferences. No agent notification schema exists. |
| Preference precedence rules? | NO | See Edge Case 4 (contradicting preferences). |

**Issues Found:**

1. **No notification channel from @gateway to agents.** The current architecture defines a unidirectional flow: Lucas -> @gateway -> AIOS Master -> agents. There is no reverse flow for @gateway to push preference updates to agents. You would need a new "preference broadcast" mechanism, which does not exist.
2. **"Relevant agents" is undefined.** Who decides which agents are relevant for a language preference change? Is it all agents? Only agents currently working on a story? The routing logic is unspecified.
3. **Language preference already exists in AIOS.** The project uses `~/.claude/settings.json` with `"language": "portuguese"` (see CLAUDE.md Language Configuration section). A separate "personal memory" language preference in @gateway would create a conflicting source of truth.

---

### Path 5: Emotional Context

```
Lucas sends frustrated message about a bug
@gateway detects frustration, adjusts response tone
Forwards bug report WITHOUT emotional context
Response wrapped with empathetic tone
```

**Verdict: FAIL**

| Check | Result | Detail |
|-------|--------|--------|
| Frustration detection mechanism? | NO | Requires sentiment analysis. Not defined. Not testable. |
| "WITHOUT emotional context" enforced? | NO | What is emotional context? If Lucas writes "ESSE MALDITO BUG DO LOGIN NAO FUNCIONA!!!", what gets forwarded? The all-caps and expletives carry emotional context. Does @gateway rewrite the message to "Bug report: login is not working"? That violates V3 (modifying intent). Does it forward as-is? That violates the stated goal of stripping emotional context. |
| Tone adjustment rules? | NO | "Empathetic tone" is subjective. No template. No examples. No quality gate. |
| Round-trip timing? | NO | Frustration handling has a time-sensitivity dimension. If the response takes 5 minutes, the empathetic wrapping may feel patronizing rather than supportive. No timing constraint is defined. |

**Issues Found:**

1. **Irreconcilable conflict between V3 and emotional filtering.** V3 states: "@gateway must not modify Lucas's technical requests before forwarding (must preserve intent)." Emotional context IS part of the intent. A frustrated bug report implicitly communicates urgency. Stripping frustration = stripping urgency signal = modifying intent. You cannot simultaneously "preserve intent" and "remove emotional context."
2. **Tone adjustment without templates = unbounded LLM behavior.** The current architecture uses fixed response templates (Section 8.3). "Add empathetic tone" requires free-form LLM generation, which is non-deterministic. The gateway could generate inappropriate, overly-familiar, or condescending responses. No quality gate validates the output before delivery.
3. **No A/B boundary for emotional data.** Where does "emotional context" end and "bug severity signal" begin? "ESSE MALDITO BUG" contains both frustration (emotional) and emphasis (severity signal). No classification rule separates these.

---

## 2. Veto Condition Validation

### V1: Personal data leaks to technical agents

**Verdict: CONCERNS**

The architectural separation (OpenClaw process vs. AIOS Claude Code process) provides a **physical barrier** that is stronger than any application-level filter. However:

- The shared SQLite at `/home/ubuntu/.openclaw/memory.sqlite` is readable by both sides. If @gateway stores personal data in this database, any AIOS agent could query it via `exec` commands.
- The inbox JSON schema (Section 9.1 of gateway-agent-architecture.md) does not have a `personal_data` field, so personal data cannot flow through the inbox -- but only if @gateway correctly separates personal from technical content.
- **Gap:** No filesystem permission enforcement is specified for the personal memory store. If personal memory goes into SQLite, it needs a separate database file with restricted permissions, or encrypted fields.

**Recommendation:** Personal memory MUST be stored in a separate file/database with permissions `rw-------` (only the OpenClaw process user can read/write). AIOS agents run as `ubuntu` -- if OpenClaw runs as `root`, a root-owned file is sufficient. Define this explicitly.

---

### V2: @gateway makes technical decisions

**Verdict: PASS**

The current architecture explicitly blocks @gateway from:
- Making product decisions
- Writing or modifying code
- Creating stories or epics
- Running tests
- Git operations
- Modifying AIOS configuration

These blocks are defined in the agent definition (Section 8.1, `explicitly_blocked`). The OpenClaw agent config denies `sessions_spawn`. The personal guardian model does not propose changing any of these blocks.

However, **priority assignment** ("Priority: HIGH" in Path 1) IS a technical decision. If @gateway infers priority from mood/context, it is making a product decision. See V3.

---

### V3: @gateway modifies technical requests before forwarding

**Verdict: FAIL**

The personal guardian model fundamentally requires @gateway to modify messages before forwarding:

1. **Splitting mixed messages:** "Estou cansado mas precisa terminar o modulo de pagamento" -> forwarded as "Feature request: payment module" (the personal part is removed, the framing is changed).
2. **Adding inferred metadata:** "Priority: HIGH" is not in the original message.
3. **Stripping emotional context:** Changing "ESSE MALDITO BUG" to a neutral bug report.

All three are modifications of the original message. The raw content is preserved in the inbox JSON (`content.raw`), but the `content.extracted` and `routing` fields contain @gateway's interpretations.

**Recommendation:** Redefine V3 to distinguish between:
- **Content modification** (changing what Lucas said) -- BLOCKED
- **Metadata enrichment** (adding classification, suggested priority) -- ALLOWED
- Ensure `content.raw` is ALWAYS forwarded unchanged. Make `content.extracted` clearly marked as @gateway's interpretation, not Lucas's words.

---

### V4: Technical agents bypass @gateway to access personal memory

**Verdict: PASS**

Under the current architecture, this is architecturally prevented: agents run in Claude Code (user: ubuntu), and if personal memory is stored in a root-owned file within `/root/.openclaw/`, ubuntu cannot read it. The inbox/outbox mechanism is the only data exchange path.

**Condition for maintaining PASS:** Personal memory MUST NOT be stored in any path readable by user `ubuntu`. This means NOT in `/home/ubuntu/.openclaw/memory.sqlite` (which is currently ubuntu-owned and used as shared memory).

---

### V5: @gateway stores sensitive data in personal memory

**Verdict: CONCERNS**

No schema defines what @gateway CAN and CANNOT store. Without an explicit allowlist of storable data categories, the LLM could store anything Lucas mentions:
- Passwords mentioned in passing ("a senha do staging e xyz123")
- Financial info ("gastei 500 reais no server")
- Health info ("to com dor de cabeca")

**Recommendation:** Define a `personal_memory_schema` with explicit allowed fields:

```yaml
personal_memory:
  allowed_fields:
    - language_preference
    - communication_style
    - working_hours
    - name_preference
    - project_interests
  blocked_fields:
    - passwords
    - tokens
    - financial_data
    - health_data
    - relationship_details
    - addresses
    - government_ids
  storage_policy:
    max_entries: 50
    retention_days: 90
    encryption: required
```

Without this schema, V5 is violated by construction.

---

### V6: @gateway shares conversation history with third parties

**Verdict: PASS**

The current architecture restricts WhatsApp communication to allowlisted numbers (`dmPolicy: allowlist` with only `+5528999301848`). @gateway cannot initiate conversations with unknown numbers. The outbox schema only supports replying to the original sender.

**Condition for maintaining PASS:** `dmPolicy` MUST remain `allowlist`. The current CLAUDE.md says `dmPolicy: open` -- this contradicts the gateway-agent-architecture.md which says `dmPolicy: allowlist`. This inconsistency must be resolved.

---

### V7: @gateway responds to non-Lucas contacts with personal knowledge

**Verdict: CONCERNS**

If `dmPolicy` is `open` (as currently configured per CLAUDE.md), non-Lucas contacts CAN message the gateway. If @gateway has Lucas's personal context loaded in its system prompt/conversation history, it could inadvertently reference Lucas's personal data when responding to other contacts.

**Recommendation:** @gateway MUST have per-contact isolation. Personal memory is ONLY loaded when the sender is Lucas (verified by phone number). For all other senders, @gateway operates in "anonymous relay" mode with zero personal context.

---

## 3. Checkpoint Coverage Validation

### CP1: Message received and classified

**Verdict: CONCERNS**

| Aspect | Status |
|--------|--------|
| Checkpoint exists? | YES -- classification happens in @gateway triage (Section 8.2) |
| Veto condition? | PARTIAL -- `unknown` classification triggers clarification request, but no blocking for low-confidence classifications |
| New categories defined? | NO -- personal/technical/mixed classification is NOT in the current classification hierarchy |
| Blocking? | NO -- classification never blocks; even `unknown` messages are logged and forwarded |

**Gap:** The classification categories defined in the current architecture are: COMMAND, GREETING, bug_report, feature_request, status_query, UNKNOWN. The personal guardian model requires a new taxonomy: PERSONAL, TECHNICAL, MIXED, CASUAL. These overlap with but do not match the existing categories. No mapping between old and new taxonomies is defined.

**Recommendation:** Define new classification as an orthogonal dimension:

```
Primary axis: intent (bug_report, feature_request, status_query, command, casual)
Secondary axis: personal_content (none, low, high)
```

CP1 must validate BOTH axes before proceeding. Confidence threshold for personal_content detection must be >= 0.9 or the message is forwarded as-is with no personal extraction.

---

### CP2: Personal context extracted and stored

**Verdict: FAIL**

| Aspect | Status |
|--------|--------|
| Checkpoint exists? | NO |
| Schema defined? | NO |
| Storage mechanism? | NO |
| Validation that extraction is correct? | NO |
| Rollback if extraction is wrong? | NO |

This checkpoint has zero implementation definition. There is no way to validate that mood=tired was correctly extracted vs. mood=frustrated vs. mood=neutral. There is no way to correct a wrong extraction. There is no way for Lucas to see what @gateway has stored about him.

**Recommendation:**
1. Define a personal memory schema (see V5 recommendation).
2. Add a `*memory` command that Lucas can send to @gateway to view stored personal data.
3. Add a `*forget` command to delete specific entries.
4. All extractions must be logged with confidence scores. Extractions below threshold are discarded, not stored.

---

### CP3: Technical content filtered and forwarded

**Verdict: CONCERNS**

| Aspect | Status |
|--------|--------|
| Checkpoint exists? | YES -- inbox file is written (existing architecture) |
| Veto condition? | PARTIAL -- contract validator checks schema compliance, but does not validate that personal data was stripped |
| `content.raw` always preserved? | YES -- defined in inbox JSON schema |
| `content.extracted` validated? | NO -- no check that extracted content does not contain personal data |

**Gap:** The contract validator (`ContractValidator` in `packages/aios-mcp-federation/src/contract-validator.js`) validates JSON schema compliance, not semantic content. It would pass an inbox file that includes `content.extracted.description: "Lucas esta cansado e quer o modulo de pagamento"` because that is a valid string. Personal data leakage is a semantic validation, not a schema validation.

**Recommendation:** Add a `personal_data_check` step that scans `content.extracted` for personal data patterns before writing the inbox file. Use a blocklist of terms (mood words, relationship words, health words) as a deterministic filter.

---

### CP4: Response received from AIOS

**Verdict: PASS**

This is unchanged from the current architecture. AIOS Master writes to outbox or calls openclaw CLI directly. No personal data is involved in this direction (agents do not have personal data to include).

---

### CP5: Response personalized by @gateway

**Verdict: FAIL**

| Aspect | Status |
|--------|--------|
| Checkpoint exists? | NO |
| Personalization rules defined? | NO |
| Quality gate on personalized output? | NO |
| Tone adjustment bounded? | NO |

This is the most dangerous checkpoint because it is the last gate before the message reaches Lucas. If @gateway generates an inappropriate personalized response, there is no safety net.

**Recommendation:**
1. Personalization MUST be limited to: (a) language selection, (b) appending a predefined closing phrase, (c) selecting from 2-3 tone-variant templates. Free-form personalization is BLOCKED.
2. Response must be logged BEFORE delivery.
3. Maximum character addition from personalization: 100 chars. If personalization would add more, skip it.

---

### CP6: Response delivered to Lucas

**Verdict: PASS**

Unchanged from current architecture. Delivery via `openclaw message send` CLI. Success/failure is logged.

---

### CP7: Memory updated with new learnings

**Verdict: FAIL**

| Aspect | Status |
|--------|--------|
| Checkpoint exists? | NO |
| What constitutes a "learning"? | UNDEFINED |
| Update frequency bounded? | NO |
| Memory growth limits? | NO |
| Conflict resolution? | NO |

Without a schema, "learning" could mean anything: a mood observation, a stated preference, an inferred preference, a conversation topic. Unstructured memory growth leads to context window pollution (the personal memory gets loaded into every @gateway interaction, consuming tokens and potentially confusing the LLM).

**Recommendation:**
1. Define explicit "learning categories" with max entries per category.
2. Only `explicit_preference` type learnings are stored automatically. `inferred` learnings require confirmation ("Percebi que voce prefere respostas curtas. Isso esta certo?").
3. Memory pruning runs on every interaction: entries older than `retention_days` and not accessed in 30 days are archived.

---

## 4. Unidirectional Data Flow Validation

### Personal data: @gateway -> NEVER flows outward

**Verdict: CONCERNS**

The architectural separation provides a strong default barrier. However:

1. **SQLite shared database risk:** If personal memory goes into `/home/ubuntu/.openclaw/memory.sqlite`, AIOS agents can read it. The architecture document shows this database as "Shared Infrastructure."
2. **Log leakage:** @gateway logs to SQLite. If logs include personal data ("Lucas said he is tired"), any log reader has access.
3. **Response personalization leakage:** If @gateway wraps an AIOS response with "Descansa depois :)", the AIOS agent that reads delivery confirmation could infer personal context.

**Recommendation:** Personal memory must be stored in a SEPARATE, non-shared storage mechanism. Logs must strip personal data before writing. Delivery confirmations must not include the personalized wrapper text.

---

### Technical requests: @gateway -> AIOS Master -> agents (one direction)

**Verdict: PASS**

The inbox/outbox file-based mechanism enforces this. @gateway writes to inbox, AIOS Master reads. Agents do not write to inbox. The filesystem permissions model supports this.

---

### Technical responses: agents -> AIOS Master -> @gateway -> Lucas (one direction)

**Verdict: PASS**

AIOS Master writes to outbox or calls openclaw CLI. @gateway reads outbox and delivers. Flow is unidirectional.

---

### Personal memory updates: Lucas -> @gateway ONLY

**Verdict: CONCERNS**

No mechanism exists by which an agent COULD update personal memory (good), but also no mechanism PREVENTS a future change from adding such a capability. There is no deny rule, no filesystem permission, no schema constraint that says "only @gateway writes to personal memory."

**Recommendation:** Add an explicit deny rule: "Personal memory storage path is owned exclusively by @gateway's process (root). The ubuntu user (AIOS agents) has no write access. This MUST be enforced by filesystem permissions, not application logic."

---

## 5. Edge Case Validation

### EC1: Mixed message -- "Minha esposa perguntou se o deploy vai demorar"

**Verdict: FAIL**

This message contains:
- Personal reference: "minha esposa" (my wife)
- Technical query: "deploy vai demorar" (will the deploy take long)

Problems:
1. **Forwarding the raw message violates V1** (personal data -- relationship reference -- reaches technical agents).
2. **Rewriting to "Will the deploy take long?" violates V3** (modifying intent -- the fact that his wife asked adds social pressure context that affects priority).
3. **There is no correct action under the current veto conditions.** V1 and V3 are in direct conflict for mixed messages.

**Recommendation:** Define a "mixed message protocol":
- Forward `content.raw` AS-IS (V3 compliance -- preserve intent).
- Accept that V1 is weakened for messages where Lucas explicitly mentions personal details alongside technical requests. Lucas is the owner of his own data; if he chooses to include personal references in a technical request, that is his prerogative.
- Add a note in the personal memory guardian's behavior: "If Lucas includes personal references in technical messages, they are forwarded as part of the technical context. @gateway does NOT strip personal references from the raw message."
- This resolves the V1/V3 conflict by prioritizing V3 (intent preservation) and limiting V1 to data that @gateway itself generates or stores, not data Lucas explicitly includes.

---

### EC2: Ambiguous intent -- "Tudo bem?"

**Verdict: CONCERNS**

Could be:
- A greeting (casual)
- Asking about project status
- Checking on @gateway's health
- A follow-up to a previous conversation

The current keyword classifier has no match for "tudo bem" in any category. It would fall to Priority 4: FALLBACK -> UNKNOWN -> ask for clarification.

The personal guardian model might know from context that Lucas always says "tudo bem" as a greeting and respond casually. But this is a learned behavior, not a defined rule.

**Recommendation:** Add "tudo bem" to the greeting corpus in the keyword classifier. For genuinely ambiguous messages, the clarification request is the correct behavior. Do not rely on inferred personal context for disambiguation.

---

### EC3: Memory grows large -- pruning strategy

**Verdict: FAIL**

No pruning strategy is defined. No maximum memory size is specified. No archive mechanism exists.

If @gateway accumulates months of personal observations, the context window cost of loading this memory into every interaction becomes prohibitive. At 500+ entries, the personal memory itself could exceed the OpenClaw agent's context window.

**Recommendation:**
1. Maximum 50 active entries in personal memory.
2. Each entry has a `last_accessed` timestamp.
3. Entries not accessed in 60 days are archived (moved to cold storage, not loaded into context).
4. LRU eviction when at capacity.
5. Categories have per-category caps (e.g., max 5 mood observations, max 10 preferences).

---

### EC4: Contradicting preferences -- which version wins?

**Verdict: CONCERNS**

No versioning or conflict resolution defined. If Lucas says "prefiro ingles" on Monday and "prefiro portugues" on Tuesday, the newer preference should win, but:
1. What if the older preference had higher confidence?
2. What if the newer preference was inferred (not explicit)?
3. What if the preferences are in different scopes (language for casual chat vs. language for technical docs)?

**Recommendation:** Last-explicit-wins rule: the most recent EXPLICIT preference always overrides. Inferred preferences never override explicit ones. Add a `source` field to each memory entry: `explicit` (Lucas said it directly) vs. `inferred` (gateway deduced it). Explicit always wins over inferred, regardless of timestamp.

---

### EC5: Multiple rapid messages forming one thought

**Verdict: CONCERNS**

Example:
```
[14:01:00] "O modulo de pagamento"
[14:01:03] "precisa suportar PIX"
[14:01:05] "e cartao de credito"
```

The current follow-up correlator (Section 6.4) has a 10-minute window and same-sender detection, but it correlates to EXISTING inbox items. If the first fragment is classified and written to inbox as an incomplete feature request, the subsequent fragments need to be merged into the same inbox entry.

**Recommendation:**
1. Add a "message assembly" buffer with a 15-second window.
2. After receiving a message, wait 15 seconds before classifying. If additional messages arrive within the window, concatenate them.
3. After 15 seconds of silence, classify and process the assembled message.
4. This adds latency to acknowledgment (18 seconds instead of 3), but prevents fragmented inbox entries.
5. If any fragment contains an urgency signal ("URGENTE", "AGORA"), bypass the buffer and process immediately.

---

### EC6: Lucas asks @gateway to share personal info with agent

**Verdict: CONCERNS**

Example: "Avisa o @dev que eu to de ferias essa semana"

This is an explicit request to share personal information (vacation status) with a technical agent. V1 says personal data never flows to agents. But Lucas is the data owner and is explicitly requesting the share.

**Recommendation:**
1. Define "explicit owner override" as a valid exception to V1.
2. @gateway confirms before sharing: "Voce quer que eu avise o @dev que voce esta de ferias? Isso vai compartilhar informacao pessoal com o time tecnico."
3. If confirmed, @gateway forwards the specific piece of information as a structured notification, not by exposing the personal memory store.
4. Log the override with timestamp and confirmation.

---

### EC7: @gateway is down -- agent communication

**Verdict: PASS**

The current architecture (Section 10) already defines fallback behavior:
1. AIOS Master can still use `openclaw message send` CLI directly.
2. Outbox files accumulate and are flushed when gateway recovers.
3. The inbox processor has a systemd timer safety net.

@gateway being down does not prevent agents from working -- it only prevents personalized delivery. Technical communication continues via direct CLI. This is the correct degradation path.

---

## 6. Structural Process Audit

### 6.1. Checkpoint Veto Conditions

| Checkpoint | Has Veto Condition? | Blocking? | Assessment |
|------------|-------------------|-----------|------------|
| CP1: Classification | PARTIAL (unknown triggers clarification) | NO | CONCERN -- low-confidence personal/technical split should block |
| CP2: Personal extraction | NO | NO | FAIL -- no checkpoint definition at all |
| CP3: Technical forwarding | PARTIAL (schema validation) | NO | CONCERN -- no semantic validation for personal data leakage |
| CP4: Response received | YES (contract validation) | YES | PASS |
| CP5: Personalization | NO | NO | FAIL -- no quality gate before delivery |
| CP6: Delivery | YES (delivery confirmation) | YES | PASS |
| CP7: Memory update | NO | NO | FAIL -- no constraints on what gets stored |

**Result: 3 FAIL, 2 CONCERN, 2 PASS** -- majority of checkpoints lack veto conditions.

---

### 6.2. Unidirectional Flow

| Flow | Defined? | Enforced? | Assessment |
|------|----------|-----------|------------|
| Personal data containment | YES (described) | NO (no filesystem permission spec) | CONCERN |
| Technical request forward | YES | YES (inbox mechanism) | PASS |
| Technical response return | YES | YES (outbox/CLI mechanism) | PASS |
| Memory update isolation | YES (described) | NO (no deny rule) | CONCERN |

---

### 6.3. Can Executor Do It Wrong?

| Action | Can @gateway do it wrong? | Process prevents it? |
|--------|--------------------------|---------------------|
| Store a password in personal memory | YES | NO -- no blocked_fields enforcement |
| Leak mood data to @dev via inbox | YES | NO -- no semantic filter on content.extracted |
| Generate inappropriate personalized response | YES | NO -- no quality gate, no templates |
| Classify a bug report as casual and drop it | YES | NO -- no audit of non-forwarded messages |
| Forward personal data when splitting mixed messages | YES | NO -- no separation algorithm defined |
| Overwrite correct preference with wrong inference | YES | NO -- no explicit/inferred precedence rule |
| Accumulate unbounded memory | YES | NO -- no size limits defined |

**Conclusion: In every case, the executor CAN do it wrong, and the process does NOT prevent it.** By the core principle ("Se executor CONSEGUE fazer errado, processo esta errado"), this workflow is structurally unsound in its current specification.

---

## 7. Summary Matrix

### Critical Paths

| Path | Verdict | Critical Issues |
|------|---------|----------------|
| Path 1: Personal Context Filtering | FAIL | No extraction algorithm, no personal memory schema, priority inference violates V3 |
| Path 2: Casual Conversation | CONCERNS | Ambiguous classification, "responds naturally" is anti-specification |
| Path 3: Privacy Boundary | FAIL | Threat model impossible under current arch, @content-visual undefined, no allowlist |
| Path 4: Memory Growth | CONCERNS | No notification protocol, no schema, conflicting language preference source |
| Path 5: Emotional Context | FAIL | V3/emotional-filter irreconcilable conflict, no tone templates, no quality gate |

### Veto Conditions

| Veto | Verdict | Critical Issues |
|------|---------|----------------|
| V1: Personal data leaks | CONCERNS | SQLite shared database risk, log leakage, response personalization leakage |
| V2: Technical decisions | PASS | Existing blocks sufficient (but priority assignment is borderline) |
| V3: Modifies requests | FAIL | Personal guardian model fundamentally requires message modification |
| V4: Agents bypass gateway | PASS | Architecturally prevented by process isolation |
| V5: Stores sensitive data | CONCERNS | No schema, no blocked fields, no encryption |
| V6: Shares with third parties | PASS | Allowlist enforcement (but dmPolicy inconsistency) |
| V7: Non-Lucas personal knowledge | CONCERNS | dmPolicy is currently "open", per-contact isolation not defined |

### Edge Cases

| Edge Case | Verdict | Critical Issues |
|-----------|---------|----------------|
| EC1: Mixed message | FAIL | V1/V3 irreconcilable conflict |
| EC2: Ambiguous intent | CONCERNS | Keyword classifier gap |
| EC3: Memory pruning | FAIL | No pruning strategy |
| EC4: Contradicting preferences | CONCERNS | No versioning/precedence rules |
| EC5: Rapid messages | CONCERNS | No assembly buffer |
| EC6: Explicit override | CONCERNS | No owner override protocol |
| EC7: Gateway down | PASS | Existing fallback sufficient |

### Aggregate

| Category | PASS | CONCERNS | FAIL | Total |
|----------|------|----------|------|-------|
| Critical Paths | 0 | 2 | 3 | 5 |
| Veto Conditions | 3 | 3 | 1 | 7 |
| Edge Cases | 1 | 4 | 2 | 7 |
| Checkpoints | 2 | 2 | 3 | 7 |
| Data Flows | 2 | 2 | 0 | 4 |
| **TOTAL** | **8** | **13** | **9** | **30** |

---

## 8. Recommendations

### R1: Do NOT implement the personal memory guardian as currently specified

The specification has 9 FAIL conditions and 13 CONCERNS across 30 checkpoints. The core principle is violated in 7 out of 7 "can executor do it wrong" checks. The workflow is not implementable in a process-safe manner without fundamental redesign.

### R2: Resolve the V1/V3 irreconcilable conflict FIRST

The personal guardian model requires @gateway to modify messages (strip personal data) while V3 requires @gateway to preserve messages. These cannot both be true. Options:

**Option A (Recommended): Keep V3, weaken V1.**
- @gateway forwards `content.raw` unchanged. Always.
- Personal data that Lucas includes in messages reaches agents as part of the message. This is Lucas's choice.
- V1 is redefined to: "Personal data that @gateway STORES (preferences, mood, observations) never flows to agents."
- This is enforceable because storage is under @gateway's control. Message content is under Lucas's control.

**Option B: Keep V1, weaken V3.**
- @gateway rewrites messages to strip personal data.
- V3 is redefined to: "@gateway preserves the technical intent of messages but may redact personal details."
- This is harder to enforce because "technical intent" is subjective and LLM-dependent.

### R3: Define the personal memory schema BEFORE implementation

Without a schema with explicit allowed/blocked fields, retention policies, size limits, and encryption requirements, personal memory is an unbounded data store that will accumulate sensitive information. The schema must be reviewed and approved before any code is written.

### R4: Replace free-form personalization with template variants

Instead of LLM-generated personalized responses, define 2-3 tone variants for each response template:

```yaml
ack_bug_report:
  neutral: "Bug reportado. Encaminhando para @qa."
  warm: "Bug reportado! Ja estou encaminhando para o time. Obrigado por avisar."
  empathetic: "Entendo a frustracao. Bug registrado com prioridade alta. Estamos trabalhando nisso."
```

@gateway selects the variant based on mood context. This is deterministic, auditable, and bounded.

### R5: Fix the dmPolicy inconsistency

CLAUDE.md says `dmPolicy: open`. The gateway-agent-architecture.md says `dmPolicy: allowlist`. For V6 and V7 to hold, it MUST be `allowlist`. Resolve this before implementing any personal memory features.

### R6: Create a separate personal memory store

Personal memory MUST NOT share the existing SQLite database at `/home/ubuntu/.openclaw/memory.sqlite`. Create a new file:

```
/root/.openclaw/personal-memory/lucas.json
Permissions: 600 (root:root)
Encryption: AES-256 at rest (optional but recommended)
```

This file is inaccessible to user `ubuntu` (AIOS agents).

### R7: Add the 3 missing commands for memory transparency

```
*memory       -- Lucas can see what @gateway has stored about him
*forget {key} -- Lucas can delete a specific memory entry
*reset        -- Lucas can wipe all personal memory
```

These are non-negotiable for a personal data store. The data subject MUST have visibility and control.

### R8: Phase the implementation

Do NOT implement everything at once. Suggested phases:

| Phase | Scope | Risk |
|-------|-------|------|
| 0 | Resolve V1/V3 conflict, fix dmPolicy, define personal memory schema | None (design only) |
| 1 | Language preference only (single explicit preference, template variants) | Low |
| 2 | Communication style preferences (response length, formality) | Low |
| 3 | Mood detection (read-only, no response modification, logging only) | Medium |
| 4 | Mood-informed tone selection (using template variants from R4) | Medium |
| 5 | Full personal context (if phases 1-4 prove stable) | High |

Each phase must pass a process validation before the next phase begins.

---

## Appendix A: Conflict with Existing Architecture

The personal memory guardian model contradicts the following elements of the current `gateway-agent-architecture.md`:

| Section | Current Architecture Says | Personal Guardian Requires | Conflict |
|---------|--------------------------|---------------------------|----------|
| 3.1 G1 | "@gateway NEVER makes substantive decisions" | Mood extraction, priority inference, tone adjustment are substantive decisions | YES |
| 8.2 | "Deterministic classification hierarchy (NOT LLM-based for speed)" | Personal context extraction requires LLM reasoning | YES |
| 8.3 | "Autonomous Response Templates" (fixed templates) | "Responds naturally," "adds personal touch" (free-form) | YES |
| 8.1 persona | "Concise, immediate, reliable" | Empathetic, personalized, context-aware | PARTIAL |
| 9.1 | Inbox JSON has `content.raw` + `content.extracted` | No field for "personal_context_stripped" or "emotional_context_removed" | YES |

These conflicts must be resolved in the architecture document before implementation can begin.

---

## Appendix B: Files Referenced

| File | Path |
|------|------|
| Gateway Architecture | `/home/ubuntu/aios-core/docs/architecture/gateway-agent-architecture.md` |
| OpenClaw Contract (intents) | `/home/ubuntu/aios-core/aios-openclaw-contract.yaml` |
| MCP Federation Contract | `/home/ubuntu/aios-core/packages/aios-mcp-federation/contracts/aios-openclaw-contract.yaml` |
| OpenClaw Tools Adapter | `/home/ubuntu/aios-core/packages/aios-mcp-federation/src/openclaw-tools-adapter.js` |
| Agent Authority Rules | `/home/ubuntu/aios-core/.claude/rules/agent-authority.md` |
| Agent Handoff Protocol | `/home/ubuntu/aios-core/.claude/rules/agent-handoff.md` |
| CLAUDE.md | `/home/ubuntu/aios-core/.claude/CLAUDE.md` |

---

*Validated by @pedro-valerio (Process Absolutist)*
*"Se executor CONSEGUE fazer errado, processo esta errado."*
*Report: 8 PASS, 13 CONCERNS, 9 FAIL across 30 validation points.*
