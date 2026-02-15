# Story BOB-VOICE-1: Voice DNA Swipe File

```yaml
id: BOB-VOICE-1
title: Create bob-voice-swipe-file.md for consistent messaging
type: documentation
priority: P1
severity: high
executor: '@dev'
quality_gate: '@qa'
quality_gate_tools: ['code_review']
estimated_effort: 1.5h
epic: Bob Process Quality Improvements
parent: null
```

## Context

**Discovered by:** Deep analysis debate (oalanicolas - Mental DNA at 35%)
**Location:** New file `.aios-core/core/orchestration/bob-voice-swipe-file.md`

Currently, BOB's messaging lacks consistency. Messages are hardcoded throughout the codebase without a unified voice guide, leading to inconsistent tone, terminology, and user experience.

## Problem Statement

**Issue:** BOB's voice DNA is only 35% consistent across messages

**Examples of inconsistency:**
- Some messages are formal ("Orchestration failed"), others casual ("Bem-vindo de volta!")
- Mixed Portuguese/English in user-facing messages
- Inconsistent terminology (config vs configuração, story vs história)
- No standard for educational mode explanations

**Risk:**
- Poor user experience (confusing messaging)
- Hard to maintain consistent brand voice
- New contributors don't know the tone to use
- Educational mode messages feel disconnected

## Acceptance Criteria

- [x] AC1: Define BOB's core voice characteristics
- [x] AC2: Create message templates for common scenarios
- [x] AC3: Document terminology standards (PT-BR vs EN)
- [x] AC4: Provide educational mode message examples
- [x] AC5: Include veto message templates
- [x] AC6: Add do's and don'ts for messaging

## Implementation Plan

### Step 1: Define voice DNA

```markdown
# BOB Voice DNA

## Core Characteristics
- **Friendly but professional:** Approachable PM guiding team
- **Clear and concise:** No jargon, explain technical concepts simply
- **Bilingual balance:** PT-BR for user messages, EN for code/logs
- **Proactive:** Anticipates needs, suggests next steps
- **Educational:** Explains WHY, not just WHAT

## Tone by Context
- **Errors:** Helpful, solution-focused (not blame)
- **Vetos:** Firm but explanatory (safety first)
- **Success:** Encouraging, momentum-building
- **Educational:** Patient, detailed, contextual
```

### Step 2: Create message templates

Templates for:
- Onboarding messages
- Veto blocking messages
- Session resume prompts
- Error messages
- Educational explanations
- Success confirmations

### Step 3: Document terminology standards

| Concept | PT-BR User Message | EN Code/Logs | Notes |
|---------|-------------------|--------------|-------|
| Story | Story (não traduzir) | story | Mantém termo técnico |
| Epic | Epic (não traduzir) | epic | Mantém termo técnico |
| Config | Configuração | config | Traduz para usuário |
| Workflow | Workflow | workflow | Mantém termo técnico |

### Step 4: Extract current messages

Audit existing messages in:
- `bob-orchestrator.js`
- `message-formatter.js`
- `session-state.js`
- `brownfield-handler.js`
- `greenfield-handler.js`

### Step 5: Refactor inconsistent messages

Update hardcoded messages to follow voice guide:
- Standardize Portuguese for user-facing
- Ensure consistent terminology
- Add educational context where needed

## Example Messages

### Before (inconsistent):
```javascript
return {
  error: 'Orchestration failed: Unknown state',
  action: 'error'
}
```

### After (voice DNA):
```javascript
return {
  error: 'Não foi possível iniciar o processo. Estado do projeto não reconhecido.',
  action: 'error',
  educationalContext: 'BOB detecta automaticamente o estado do seu projeto (novo, existente, etc). Este erro indica um estado inesperado.'
}
```

## File List

- `.aios-core/core/orchestration/bob-voice-swipe-file.md` (created)
- `bob-orchestrator.js` (possibly modified for consistency)
- `message-formatter.js` (possibly modified)

## Definition of Done

- [x] Voice DNA documented
- [x] Message templates created
- [x] Terminology standards defined
- [x] Educational examples provided
- [x] Swipe file ready for reference
- [x] Code review approved by @qa

---

**Story created:** 2026-02-15
**Implemented by:** Orion (aios-master)
