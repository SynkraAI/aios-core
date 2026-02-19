# Task: Validate Outreach Batch

## Task Anatomy
- **task_name:** validate-outreach-batch
- **status:** active
- **responsible_executor:** prospector-chief (Atlas)
- **execution_type:** Agent
- **input:**
  - Batch of outreach messages from write-outreach
  - message-quality-checklist
  - message-rules.md (anti-patterns reference)
- **output:**
  - Validation report with approved/rejected messages
  - Batch quality score
  - WhatsApp link validation results

## Action Items

### Step 1: Load Quality Standards
Load:
- `checklists/message-quality-checklist.md`
- `data/message-rules.md` (anti-patterns reference)

### Step 2: Sample Validation (if batch > 10)
If more than 10 messages in batch:
1. Validate the first 3 messages thoroughly
2. If all 3 pass → spot-check 20% of remaining
3. If any of first 3 fail → validate ALL messages

If batch <= 10: validate ALL messages.

### Step 3: Validate Each Message
For each message, check:

**BLOCKING (reject if fail):**
- [ ] Does NOT sound like AI/template
- [ ] Contains prospect's actual project/business name
- [ ] Uses correct approach (client vs partner)
- [ ] Antonio is the sender, Fosc is mentioned
- [ ] Max 5-6 short paragraphs

**WARNING (approve with note):**
- [ ] Temporal context included when needed
- [ ] CTA is soft (not pushy)
- [ ] Max 1-2 emojis
- [ ] No corporate jargon

### Step 4: Validate WhatsApp Links
For each message link:
1. Phone number starts with country code (no + in URL)
2. Message text is URL-encoded
3. Newlines encoded as `%0A`
4. Accented characters encoded (e.g., `%C3%A3` for ã)
5. Link format: `https://api.whatsapp.com/send?phone={phone}&text={encoded}`
6. No double-encoding issues

### Step 5: Generate Report
Create validation report with:
- Total messages
- Approved/rejected counts
- Rejection details with fix suggestions
- Warning details
- Link validation results
- Batch quality score

## Acceptance Criteria
- All BLOCKING checks evaluated per message
- Smart sampling applied for large batches
- WhatsApp links validated (phone format, encoding, URL structure)
- Batch quality score calculated
- Clear feedback for any rejected messages

## Veto Conditions
- **BLOCKING:** write-outreach task not completed
- **BLOCKING:** No messages in batch
- **BLOCKING:** Message quality checklist not loaded
- **WARNING:** Batch contains > 50 messages (smart sampling recommended)
- **WARNING:** Any message without WhatsApp link

## Output Example
```json
{
  "status": "PASS_WITH_WARNINGS",
  "total_messages": 23,
  "approved": 21,
  "rejected": 2,
  "warnings": 3,
  "batch_quality_score": 9.1,
  "approved_messages": [
    {
      "name": "Joao",
      "phone": "+5531999999999",
      "temperature_score": 8,
      "prospect_type": "potential_client",
      "raw_message": "Oi Joao! Tudo bem?...",
      "whatsapp_link": "https://api.whatsapp.com/send?phone=5531999999999&text=..."
    }
  ],
  "rejected_messages": [
    {
      "prospect": "Carlos",
      "reason": "Message sounds like AI template - too formal, uses bullet points",
      "fix": "Rewrite with more casual tone, remove list formatting"
    }
  ],
  "warnings_detail": [
    {
      "prospect": "Ana",
      "issue": "Missing temporal context (message from 8 months ago)",
      "suggestion": "Add line about 'vi sua mensagem ha um tempo atras'"
    }
  ],
  "link_validation": {
    "all_valid": true,
    "issues": []
  },
  "recommendation": "21/23 approved. 2 messages need rewrite by outreach-writer before proceeding."
}
```

## Input Example
```json
{
  "messages": [
    {
      "name": "Joao",
      "phone": "+5531999999999",
      "temperature_score": 8,
      "prospect_type": "potential_client",
      "raw_message": "Oi Joao! Tudo bem?\n\nMeu nome e Antonio...",
      "whatsapp_link": "https://api.whatsapp.com/send?phone=5531999999999&text=..."
    }
  ]
}
```

## Error Handling
- **All messages rejected:** HALT, escalate to user - likely a systemic issue with message rules
- **> 30% rejected:** Return batch to outreach-writer with specific feedback per message
- **Link validation failures:** Return only failed links for re-encoding

## Completion Criteria
Validation report generated with approved/rejected lists, link validation complete, batch quality score calculated
