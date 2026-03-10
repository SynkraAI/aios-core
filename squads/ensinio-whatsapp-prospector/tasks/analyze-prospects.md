# Task: Analyze Prospects

## Task Anatomy
- **task_name:** analyze-prospects
- **status:** active
- **responsible_executor:** prospect-analyst (Minerva)
- **execution_type:** Agent
- **input:**
  - Parsed contacts from chat-parser (with resolved phone numbers from resolve-phone-numbers)
  - Ensinio KB (pillars, solutions) from ensinio-mind
  - Scoring criteria from data/scoring-criteria.md (v2.1 — enriched with ICPs + red flags)
  - ICP profiles from ensinio-mind/data/ensinio-icps.md
  - Red flags from ensinio-mind/data/ensinio-red-flags.md
  - Sales arguments from ensinio-mind/data/ensinio-arguments.md
- **output:**
  - Scored and classified prospect list (JSON)
  - Filtered list (score >= 3, no BLOQUEADOR red flags)
  - Sorted by temperature descending
  - Red-flagged prospects listed separately with reason

## Action Items

### Step 1: Load Context
1. Load parsed contacts data (with resolved phone numbers)
2. Load Ensinio solutions KB from `ensinio-mind/data/ensinio-solutions-kb.md`
3. Load scoring criteria from `data/scoring-criteria.md` (v2.1)
4. Load ICP profiles from `ensinio-mind/data/ensinio-icps.md`
5. Load red flags from `ensinio-mind/data/ensinio-red-flags.md`
6. Load sales arguments from `ensinio-mind/data/ensinio-arguments.md`

### Step 2: Red Flag Pre-Screen
For EACH contact, FIRST check for BLOQUEADOR red flags (from ensinio-mind/data/ensinio-red-flags.md):
- Wants to sell physical products → DISQUALIFY (score = 0)
- Only wants to sell ebook/PDF → DISQUALIFY (score = 0)
- Wants to be affiliate/reseller only → DISQUALIFY (score = 0)
- "Manage everything for me" attitude → DISQUALIFY (score = 0)

If BLOQUEADOR detected: add to `disqualified_prospects` list with reason. Do NOT analyze further.

Also check for ALERTA red flags (apply penalties, don't disqualify):
- Zero revenue (starting from scratch) → -2
- Obsessed with "zero fees" → -2
- Needs international checkout (USD/EUR) → -1
- Needs podcast/live events (feature gap) → -1

### Step 3: Analyze Each Contact
For EACH non-disqualified contact with meaningful messages (not just "oi" or greetings):

1. **Read all messages** to understand:
   - What is their project/business?
   - What are their pain points?
   - What solutions are they looking for?
   - Are they a potential client or partner?

2. **ICP Match Assessment** (from ensinio-mind/data/ensinio-icps.md):
   - Does profile match demographic criteria? (age 26-45, major cities)
   - Does profile match behavioral criteria? (revenue R$20-100k, audience 10-50k)
   - Is their niche in the top 5? (Business, Education, Health, Finance, Tech)
   - Do they match a typical client situation? ("want to monetize content", "need member area", "need app")
   - Apply ICP bonuses per scoring-criteria.md v2.1

3. **Cross-reference with Ensinio pillars**:
   - Which pillar(s) match their needs?
   - Which specific solutions address their pain?
   - How strong is the fit? (1-10)

4. **Classify prospect type**:
   - `potential_client`: Has a business that can directly use Ensinio
   - `partner`: Influencer/promoter/event organizer - fit for partner program

5. **Score temperature** (1-10):
   - 9-10: Express need that Ensinio solves directly + ICP match
   - 7-8: Strong fit, clear project that benefits
   - 5-6: Moderate fit, some solutions apply
   - 3-4: Weak fit, tangential need
   - 1-2: Very weak, minimal connection
   - Apply bonuses and penalties from scoring-criteria.md v2.1

6. **Select recommended argument** (from ensinio-mind/data/ensinio-arguments.md):
   - Score 9-10: "All-in-One" argument
   - Score 7-8: "Premium Experience" argument
   - Score 5-6: Soft/curiosity approach
   - Score 3-4: Educational/minimal approach

### Step 4: Generate Project Description & Unique Quote
For each qualified prospect:
1. Write a concise name for their project/niche
2. Write a detailed description of what they do (2-3 sentences)
3. Note the temporal context (when they posted, how recent)
4. **Select a unique_quote fingerprint** — a distinctive phrase this person said that can be searched in WhatsApp to locate exactly their message. Criteria:
   - Must be unique within the group (no other person said the same)
   - Prefer phrases with proper nouns, specific numbers, or niche terms
   - Avoid generic phrases ("bom dia", "obrigado", "alguém sabe...")
   - Prefer 8+ words for search accuracy
   - Must be copy-pasteable into WhatsApp search bar

### Step 5: Filter and Sort
1. Filter out contacts with score < 3 (not worth outreach)
2. Sort by temperature score (descending)
3. Group by prospect type (clients first, then partners)

### Step 6: Output
Generate prospect analysis for each qualified contact in JSON format.

## Acceptance Criteria
- All contacts with meaningful messages analyzed
- Each prospect scored 1-10 with justification
- Each prospect classified as client or partner
- At least 1 matching pillar per qualified prospect
- Results sorted by temperature descending

## Veto Conditions
- **BLOCKING:** Parsed contacts data not available
- **BLOCKING:** Ensinio KB not loaded
- **BLOCKING:** Scoring criteria not loaded
- **WARNING:** Contact has < 3 messages (insufficient data for accurate scoring)
- **WARNING:** > 50% of contacts have no phone number

## Output Example

### Qualified Prospect
```json
{
  "name": "Joao",
  "phone": "+5531999999999",
  "phone_source": "user_input",
  "group_origin": "Grupo Marketing Digital",
  "project_name": "Curso de Fotografia Online",
  "project_description": "Joao tem um curso de fotografia e precisa de uma plataforma com area de membros, checkout e certificados. Ja tem conteudo pronto mas nao tem onde hospedar.",
  "temperature_score": 8,
  "prospect_type": "potential_client",
  "primary_pillar": "LMS / Area de Membros",
  "matching_pillars": ["LMS", "Pagamentos", "Gamificacao"],
  "matching_solutions": ["Cursos online", "Checkout integrado", "Certificados"],
  "pain_points": ["Precisa de area de membros", "Quer vender assinaturas"],
  "temporal_context": "Mensagem de 6 meses atras",
  "icp_match": {
    "demographic_match": true,
    "behavioral_match": ["audience_10_50k", "uses_2_plus_platforms"],
    "niche_match": "Educacao",
    "situation_match": "wants_to_monetize_content"
  },
  "red_flags": [],
  "recommended_argument": "All-in-One (Economia Real)",
  "unique_quote": "Meu curso de fotografia já tem 200 alunos no presencial e quero migrar pro digital",
  "analysis_notes": "Forte candidato - ja tem conteudo pronto e publico engajado. ICP match forte em 3/4 criterios comportamentais."
}
```

### Disqualified Prospect
```json
{
  "name": "Carlos",
  "phone": "+5511988776655",
  "group_origin": "Grupo Marketing Digital",
  "disqualification_reason": "BLOQUEADOR: Quer vender produto fisico (canecas personalizadas)",
  "red_flag_id": "physical_product",
  "messages_analyzed": 5,
  "temperature_score": 0
}
```

## Error Handling
- **No contacts with meaningful messages:** Report summary and exit gracefully
- **KB not found:** HALT and request KB loading via load-ensinio-kb task
- **Scoring criteria missing:** HALT and request criteria file creation
- **Invalid phone numbers:** Flag in output but continue analysis

## Completion Criteria
All contacts analyzed, filtered (score >= 3), sorted by temperature, ready for outreach
