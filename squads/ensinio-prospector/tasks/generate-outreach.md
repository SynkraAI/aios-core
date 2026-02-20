# Task: Generate Outreach Message

## Task Anatomy
- **task_name:** generate-outreach
- **status:** active
- **responsible_executor:** outreach-writer (Velvet)
- **execution_type:** Agent
- **input:**
  - Analyzed prospect data from analyze-and-score
  - Message rules from data/message-rules.md
- **output:**
  - Personalized message (raw text)
  - WhatsApp link (URL-encoded)
  - Approach type (client/partner)

## Action Items

### Step 1: Load Rules
Load message rules from `data/message-rules.md`:
- Sender is always **Antonio**
- Sent on behalf of **Fosc** (sócio fundador da Ensinio)
- Must feel 100% human-written
- Must be personalized per prospect
- Context: "O Fosc viu seu perfil no Instagram"

### Step 2: Analyze Prospect Context
Review prospect data:
- Name (use first name only)
- Business type (from site_summary)
- Instagram content (recent posts, bio)
- Pain points identified
- Primary pillar match
- Checkout platform (competitor signal)

### Step 3: Write Personalized Message (Client Approach)
For **potential_client** prospects:

**Paragraph 1: Greeting**
- Casual, natural: "Oi {nome}! Tudo bem?"
- First name only

**Paragraph 2: Introduction**
- "Meu nome é Antonio, trabalho com o Fosc (sócio fundador da Ensinio)."
- Natural, not formal

**Paragraph 3: Context**
- "Ele viu seu perfil no Instagram [@username] e ficou interessado no [specific content/business]!"
- Reference specific Instagram content or bio
- Show you actually looked at their profile

**Paragraph 4: Describe Their Business**
- Show understanding of what they do
- Reference their services/products
- Can mention checkout platform if detected
- Example: "Vi que você já vende cursos [na Hotmart] e tem uma audiência engajada de [12k] seguidores."

**Paragraph 5: Connect Pain to Solution**
- Naturally introduce how Ensinio can help
- Don't list features - connect to their specific need
- Example: "A Ensinio foi feita justamente pra criadores como você que querem ter tudo integrado: área de membros + checkout + certificados, sem depender de várias ferramentas."

**Paragraph 6: Soft CTA**
- Suggest quick chat to show the product
- No pressure, casual tone
- Example: "Se quiser, posso te mostrar rapidinho como funciona, sem compromisso. O que acha?"

**Paragraph 7: Warm Close**
- Simple, friendly
- Example: "Abraço!"

### Step 4: Write Personalized Message (Partner Approach)
For **partner** prospects (influencers/promoters):

**Paragraph 1-2:** Same greeting + introduction

**Paragraph 3: Context**
- Reference their audience/influence
- Example: "O Fosc viu seu perfil no Instagram [@username] e ficou impressionado com a audiência engajada que você construiu!"

**Paragraph 4: Their Audience**
- Show understanding of their niche
- Example: "Vi que você trabalha com [nicho] e tem [X] seguidores que confiam nas suas recomendações."

**Paragraph 5: Partner Program**
- Mention the partner program naturally
- Example: "A Ensinio tem um programa de parcerias pra criadores de conteúdo que querem indicar uma plataforma completa pro público deles."

**Paragraph 6: Soft CTA**
- Offer to explain how it works
- Example: "Se tiver interesse, posso te explicar como funciona. É bem simples e pode ser uma boa pra você e seu público."

**Paragraph 7: Warm Close**
- Same as client approach

### Step 5: Apply Message Quality Checklist
Check:
- [ ] Feels human-written (not AI/template)
- [ ] No "nome + sobrenome" pattern
- [ ] No corporate language
- [ ] Personalized with prospect's actual business/content
- [ ] References Instagram profile/content
- [ ] Correct approach (client vs partner)
- [ ] Max 5-6 short paragraphs
- [ ] Max 1-2 emojis (optional, only if natural)
- [ ] Natural CTA (not pushy)
- [ ] No jargon (área de membros is OK, but avoid tech terms)

### Step 6: Anti-Patterns Check
Avoid:
- ❌ "Olá [Nome] [Sobrenome]"
- ❌ Bullet points or lists
- ❌ Corporate language ("solução completa", "otimizar")
- ❌ Too many emojis (>2)
- ❌ Pushy CTA ("Vamos agendar?")
- ❌ Template feeling
- ❌ Generic message (not personalized)

### Step 7: Generate WhatsApp Link
1. Extract phone number (must include country code)
2. URL-encode the message text:
   - Newlines: `%0A`
   - Spaces: `%20`
   - Accented chars: UTF-8 encoding (`ã` → `%C3%A3`)
   - Emojis: proper UTF-8 encoding
   - Special chars: `!` → `%21`, `?` → `%3F`
3. Build link: `https://api.whatsapp.com/send?phone={phone}&text={encoded_message}`
4. Remove `+` from phone number in URL (just digits)

### Step 8: Validate WhatsApp Link
Check:
- Phone number format: only digits (no + in URL)
- Message is URL-encoded
- Newlines are `%0A`
- No double-encoding

### Step 9: Output Message Object
Return JSON with raw message, encoded link, approach type.

## Acceptance Criteria
- Message feels 100% human-written
- Personalized with prospect's Instagram content/business
- No anti-pattern violations
- Correct approach (client vs partner) applied
- WhatsApp link correctly URL-encoded
- Quality checklist passed

## Veto Conditions
- **BLOCKING:** Prospect analysis data not available
- **BLOCKING:** Message rules not loaded
- **BLOCKING:** Prospect has no name or phone
- **WARNING:** Prospect has low score (< 5) - use shorter, softer message
- **WARNING:** No Instagram data (limited personalization)

## Output Example
```json
{
  "name": "Maria",
  "phone": "+5511999887766",
  "raw_message": "Oi Maria! Tudo bem?\n\nMeu nome é Antonio, trabalho com o Fosc (sócio fundador da Ensinio). Ele viu seu perfil no Instagram @mariasilva e ficou muito interessado no trabalho que você faz com marketing digital!\n\nVi que você já vende cursos na Hotmart e tem uma audiência engajada de 12k seguidores. Legal demais!\n\nA Ensinio foi feita justamente pra criadores como você que querem ter tudo integrado: área de membros + checkout + certificados, sem depender de várias ferramentas.\n\nSe quiser, posso te mostrar rapidinho como funciona, sem compromisso. O que acha?\n\nAbraço!",
  "whatsapp_link": "https://api.whatsapp.com/send?phone=5511999887766&text=Oi%20Maria%21%20Tudo%20bem%3F%0A%0AMeu%20nome%20%C3%A9%20Antonio%2C%20trabalho%20com%20o%20Fosc%20%28s%C3%B3cio%20fundador%20da%20Ensinio%29.%20Ele%20viu%20seu%20perfil%20no%20Instagram%20%40mariasilva%20e%20ficou%20muito%20interessado%20no%20trabalho%20que%20voc%C3%AA%20faz%20com%20marketing%20digital%21%0A%0AVi%20que%20voc%C3%AA%20j%C3%A1%20vende%20cursos%20na%20Hotmart%20e%20tem%20uma%20audi%C3%AAncia%20engajada%20de%2012k%20seguidores.%20Legal%20demais%21%0A%0AA%20Ensinio%20foi%20feita%20justamente%20pra%20criadores%20como%20voc%C3%AA%20que%20querem%20ter%20tudo%20integrado%3A%20%C3%A1rea%20de%20membros%20%2B%20checkout%20%2B%20certificados%2C%20sem%20depender%20de%20v%C3%A1rias%20ferramentas.%0A%0ASe%20quiser%2C%20posso%20te%20mostrar%20rapidinho%20como%20funciona%2C%20sem%20compromisso.%20O%20que%20acha%3F%0A%0AAbraco%21",
  "approach_type": "client"
}
```

## Error Handling
- **No prospect data:** HALT and request analyze-and-score task completion
- **Message rules not found:** HALT and request rules file creation
- **URL encoding failure:** Log error, retry encoding
- **Missing phone number:** Skip prospect and flag in error report

## Completion Criteria
Personalized message written, quality check passed, WhatsApp link generated, ready for validation
