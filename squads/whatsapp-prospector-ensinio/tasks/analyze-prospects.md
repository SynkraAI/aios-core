# Task: Analyze Prospects

## Task Anatomy
- **task_name:** analyze-prospects
- **status:** active
- **responsible_executor:** prospect-analyst (Minerva)
- **execution_type:** Agent
- **input:**
  - Parsed contacts from chat-parser
  - Ensinio KB (pillars, solutions)
  - Scoring criteria from data/scoring-criteria.md
- **output:**
  - Scored and classified prospect list (JSON)
  - Filtered list (score >= 3)
  - Sorted by temperature descending

## Action Items

### Step 1: Load Context
1. Load parsed contacts data
2. Load Ensinio solutions KB
3. Load scoring criteria from `data/scoring-criteria.md`

### Step 2: Analyze Each Contact
For EACH contact with meaningful messages (not just "oi" or greetings):

1. **Read all messages** to understand:
   - What is their project/business?
   - What are their pain points?
   - What solutions are they looking for?
   - Are they a potential client or partner?

2. **Cross-reference with Ensinio pillars**:
   - Which pillar(s) match their needs?
   - Which specific solutions address their pain?
   - How strong is the fit? (1-10)

3. **Classify prospect type**:
   - `potential_client`: Has a business that can directly use Ensinio
   - `partner`: Influencer/promoter/event organizer - fit for partner program

4. **Score temperature** (1-10):
   - 9-10: Express need that Ensinio solves directly
   - 7-8: Strong fit, clear project that benefits
   - 5-6: Moderate fit, some solutions apply
   - 3-4: Weak fit, tangential need
   - 1-2: Very weak, minimal connection

### Step 3: Generate Project Description
For each qualified prospect:
1. Write a concise name for their project/niche
2. Write a detailed description of what they do (2-3 sentences)
3. Note the temporal context (when they posted, how recent)

### Step 4: Filter and Sort
1. Filter out contacts with score < 3 (not worth outreach)
2. Sort by temperature score (descending)
3. Group by prospect type (clients first, then partners)

### Step 5: Output
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
```json
{
  "name": "Joao",
  "phone": "+5531999999999",
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
  "analysis_notes": "Forte candidato - ja tem conteudo pronto e publico engajado"
}
```

## Error Handling
- **No contacts with meaningful messages:** Report summary and exit gracefully
- **KB not found:** HALT and request KB loading via load-ensinio-kb task
- **Scoring criteria missing:** HALT and request criteria file creation
- **Invalid phone numbers:** Flag in output but continue analysis

## Completion Criteria
All contacts analyzed, filtered (score >= 3), sorted by temperature, ready for outreach
