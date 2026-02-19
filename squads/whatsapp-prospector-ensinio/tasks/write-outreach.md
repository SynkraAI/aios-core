# Task: Write Outreach Messages

## Task Anatomy
- **task_name:** write-outreach
- **status:** active
- **responsible_executor:** outreach-writer (Velvet)
- **execution_type:** Agent
- **input:**
  - Analyzed prospect data from prospect-analyst
  - Message rules from data/message-rules.md
- **output:**
  - Personalized messages with WhatsApp links (JSON)
  - URL-encoded message text
  - Valid WhatsApp links

## Action Items

### Step 1: Load Rules
Load message rules from `data/message-rules.md`:
- Sender is always Antonio
- Sent on behalf of Fosc (socio fundador da Ensinio)
- Must feel 100% human-written
- Must be personalized per prospect

### Step 2: Write Messages
For EACH qualified prospect, write a personalized WhatsApp message:

**For potential clients:**
1. Open with casual, natural greeting (first name only)
2. Introduce Antonio naturally
3. Explain that Fosc saw their message/project in the group
4. Describe THEIR project/business specifically (show you know them)
5. Connect their pain to Ensinio solution naturally
6. If message is old: contextualize temporally
7. Soft CTA: suggest a quick chat to show the product
8. Close warmly

**For partners (influencers/promoters):**
1. Open casually
2. Introduce Antonio
3. Reference their work/audience
4. Mention the partner program
5. Soft CTA: offer to explain how it works
6. Close warmly

### Step 3: Quality Check per Message
Apply message-quality-checklist:
- [ ] Feels human-written (not AI)
- [ ] No "nome + sobrenome" pattern
- [ ] No corporate language
- [ ] Personalized with prospect's actual project
- [ ] Temporal context included (if message is old)
- [ ] Correct approach (client vs partner)
- [ ] Max 5-6 short paragraphs
- [ ] Max 1-2 emojis
- [ ] Natural CTA (not pushy)

### Step 4: Generate WhatsApp Links
For each message:
1. URL-encode the message text
2. Handle special characters:
   - Newlines: `%0A`
   - Accented chars: proper UTF-8 encoding
   - Emojis: proper UTF-8 encoding
   - Spaces: `%20`
3. Build link: `https://api.whatsapp.com/send?phone={phone}&text={encoded_message}`
4. Validate the link format

### Step 5: Output
Generate JSON output for each prospect with raw message and WhatsApp link.

## Acceptance Criteria
- Each message sounds 100% human-written
- No anti-pattern violations
- WhatsApp links correctly URL-encoded
- Client/partner approach correctly applied
- Each message unique (no copy-paste between prospects)

## Veto Conditions
- **BLOCKING:** Prospect analysis data not available
- **BLOCKING:** Message rules not loaded
- **BLOCKING:** Prospect has no name or phone
- **WARNING:** Prospect has low score (< 5) - use shorter, softer message
- **WARNING:** No temporal context but messages are > 6 months old

## Output Example
```json
{
  "name": "Joao",
  "phone": "+5531999999999",
  "raw_message": "Oi Joao! Tudo bem?\n\nMeu nome e Antonio, trabalho com o Fosc (socio fundador da Ensinio). Ele viu sua mensagem no Grupo Marketing Digital sobre o seu curso de fotografia e ficou muito interessado no projeto!\n\nPelo que entendi, voce ja tem o conteudo pronto mas precisa de uma plataforma com area de membros e checkout pra vender assinaturas, certo?\n\nA Ensinio foi feita exatamente pra isso - e ja tem varios criadores de conteudo usando. Se quiser, posso te mostrar rapidinho como funciona, sem compromisso.\n\nO que acha?\n\nAbraço!",
  "whatsapp_link": "https://api.whatsapp.com/send?phone=5531999999999&text=Oi%20Joao%21%20Tudo%20bem%3F%0A%0AMeu%20nome%20e%20Antonio%2C%20trabalho%20com%20o%20Fosc%20%28socio%20fundador%20da%20Ensinio%29.%20Ele%20viu%20sua%20mensagem%20no%20Grupo%20Marketing%20Digital%20sobre%20o%20seu%20curso%20de%20fotografia%20e%20ficou%20muito%20interessado%20no%20projeto%21%0A%0APelo%20que%20entendi%2C%20voce%20ja%20tem%20o%20conteudo%20pronto%20mas%20precisa%20de%20uma%20plataforma%20com%20area%20de%20membros%20e%20checkout%20pra%20vender%20assinaturas%2C%20certo%3F%0A%0AA%20Ensinio%20foi%20feita%20exatamente%20pra%20isso%20-%20e%20ja%20tem%20varios%20criadores%20de%20conteudo%20usando.%20Se%20quiser%2C%20posso%20te%20mostrar%20rapidinho%20como%20funciona%2C%20sem%20compromisso.%0A%0AO%20que%20acha%3F%0A%0AAbraco%21",
  "approach_type": "client"
}
```

## Error Handling
- **No prospect data:** HALT and request analyze-prospects task completion
- **Message rules not found:** HALT and request rules file creation
- **URL encoding failure:** Log error, skip prospect, continue with batch
- **Missing phone number:** Skip prospect and flag in error report

## Completion Criteria
All prospects have personalized messages, quality check passed, WhatsApp links generated
