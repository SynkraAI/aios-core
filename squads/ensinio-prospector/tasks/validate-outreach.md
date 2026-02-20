# Task: Validate Outreach Message

## Task Anatomy
- **task_name:** validate-outreach
- **status:** active
- **responsible_executor:** prospector-chief (Atlas)
- **execution_type:** Agent
- **input:**
  - Single outreach message from generate-outreach
  - message-quality-checklist
  - message-rules.md (anti-patterns reference)
- **output:**
  - Validation result (PASS/FAIL)
  - Specific feedback for improvements
  - Rework instructions (if FAIL)

## Action Items

### Step 1: Load Quality Standards
Load:
- `checklists/message-quality-checklist.md`
- `data/message-rules.md` (anti-patterns reference)

### Step 2: Validate Message Content
Check **BLOCKING** criteria (reject if fail):

#### Human Feel
- [ ] Does NOT sound like AI/template
- [ ] No corporate language patterns
- [ ] Natural, conversational tone
- [ ] No bullet points or structured lists
- [ ] Variation in sentence structure

#### Personalization
- [ ] Contains prospect's actual business/project details
- [ ] References specific Instagram content or bio
- [ ] Shows genuine understanding of their work
- [ ] NOT generic (could only apply to this person)

#### Approach Type
- [ ] Correct classification (client vs partner)
- [ ] Client: focuses on their business needs
- [ ] Partner: focuses on their audience/influence

#### Sender Identity
- [ ] Antonio is the sender
- [ ] Fosc is mentioned (sócio fundador da Ensinio)
- [ ] Context is Instagram profile (not group)

#### Length
- [ ] Max 5-6 short paragraphs
- [ ] Each paragraph 1-3 sentences
- [ ] Not too long (avoid wall of text)

### Step 3: Check WARNING Criteria
These are warnings, not blockers:

#### Emojis
- [ ] Max 1-2 emojis total
- [ ] Emojis feel natural (not forced)
- [ ] No emoji spam

#### CTA
- [ ] CTA is soft (not pushy)
- [ ] Offers value without pressure
- [ ] Question-based ("O que acha?") preferred

#### Jargon
- [ ] Minimal technical jargon
- [ ] "Área de membros" is OK
- [ ] Avoid: "solução", "otimizar", "conversão"

#### Name Pattern
- [ ] Uses first name only
- [ ] NO "nome + sobrenome" pattern
- [ ] Natural greeting

### Step 4: Validate WhatsApp Link
Check link structure:

#### Phone Format
- [ ] Phone number has only digits (no +)
- [ ] Includes country code (55 for Brazil)
- [ ] Correct format: `https://api.whatsapp.com/send?phone={digits}&text={encoded}`

#### URL Encoding
- [ ] Message text is URL-encoded
- [ ] Newlines encoded as `%0A`
- [ ] Spaces encoded as `%20`
- [ ] Accented characters properly encoded
  - `ã` → `%C3%A3`
  - `é` → `%C3%A9`
  - `ô` → `%C3%B4`
- [ ] Special characters encoded
  - `!` → `%21`
  - `?` → `%3F`
  - `(` → `%28`
  - `)` → `%29`

#### No Double Encoding
- [ ] Characters encoded only once
- [ ] `%` signs are part of encoding, not encoded themselves

### Step 5: Generate Validation Verdict
Based on checks:

**PASS:** All BLOCKING checks pass, <= 2 WARNING issues
**FAIL:** Any BLOCKING check fails OR > 3 WARNING issues

### Step 6: Generate Feedback (if FAIL)
For each failed check, provide:
- **Issue:** What's wrong
- **Example:** The problematic part
- **Fix:** Specific instruction for improvement

### Step 7: Determine Rework Action
If FAIL:
- First iteration: Return to outreach-writer with feedback
- Second iteration: Return with stricter feedback
- Third iteration: ESCALATE to user (manual intervention)

Max rework iterations: 2

### Step 8: Output Validation Result
Return structured validation object.

## Acceptance Criteria
- All BLOCKING checks evaluated
- All WARNING checks evaluated
- WhatsApp link validated (format, encoding)
- Clear PASS/FAIL verdict
- Specific feedback for any failures
- Rework instructions provided (if needed)

## Veto Conditions
- **BLOCKING:** No outreach message provided
- **BLOCKING:** Message quality checklist not loaded
- **BLOCKING:** Message rules not loaded
- **WARNING:** Message has no WhatsApp link

## Output Example (PASS)
```json
{
  "status": "PASS",
  "blocking_checks": {
    "human_feel": true,
    "personalization": true,
    "approach_type": true,
    "sender_identity": true,
    "length": true
  },
  "warning_checks": {
    "emojis": true,
    "cta": true,
    "jargon": true,
    "name_pattern": true
  },
  "link_validation": {
    "phone_format": true,
    "url_encoding": true,
    "no_double_encoding": true
  },
  "warnings": [],
  "recommendation": "Message approved. Ready for CRM sync."
}
```

## Output Example (FAIL)
```json
{
  "status": "FAIL",
  "blocking_checks": {
    "human_feel": false,
    "personalization": true,
    "approach_type": true,
    "sender_identity": true,
    "length": true
  },
  "warning_checks": {
    "emojis": false,
    "cta": true,
    "jargon": true,
    "name_pattern": true
  },
  "link_validation": {
    "phone_format": true,
    "url_encoding": true,
    "no_double_encoding": true
  },
  "failures": [
    {
      "check": "human_feel",
      "severity": "BLOCKING",
      "issue": "Message sounds like AI template - too formal and structured",
      "example": "Paragraph starts with 'Gostaria de apresentar...' - very corporate",
      "fix": "Rewrite with casual tone. Use 'queria te mostrar' instead of 'gostaria de apresentar'"
    }
  ],
  "warnings": [
    {
      "check": "emojis",
      "severity": "WARNING",
      "issue": "5 emojis used (max 2 recommended)",
      "suggestion": "Reduce to 1-2 emojis for more natural feel"
    }
  ],
  "recommendation": "Return to outreach-writer for rewrite. 1 BLOCKING issue, 1 WARNING. Iteration 1/2.",
  "rework_iteration": 1
}
```

## Error Handling
- **All checks fail:** Likely systemic issue - escalate immediately
- **Link validation fails:** Return specific encoding errors
- **Max iterations reached:** Escalate to user with full context

## Completion Criteria
Validation complete with clear verdict, feedback provided (if needed), ready to proceed or rework
