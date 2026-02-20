# Task: Analyze and Score Prospect

## Task Anatomy
- **task_name:** analyze-and-score
- **status:** active
- **responsible_executor:** prospect-analyst (Minerva)
- **execution_type:** Agent
- **input:**
  - Enriched lead data (from enrich-instagram)
  - Platform detection result (from detect-checkout-platform)
  - Ensinio KB (pillars, solutions)
  - Scoring criteria from data/scoring-criteria.md
- **output:**
  - Scored and classified prospect (JSON)
  - Temperature score 1-10
  - Client/Partner classification
  - Matching pillars and solutions

## Action Items

### Step 1: Load Context
1. Load enriched lead data (Instagram + site data)
2. Load platform detection result
3. Load Ensinio solutions KB
4. Load scoring criteria from `data/scoring-criteria.md`

### Step 2: Analyze Business Profile
Using enriched data, understand:
1. **Business type:** What do they do?
   - Instagram bio keywords
   - Site description
   - Services offered
2. **Target audience:** Who do they serve?
3. **Business model:** How do they monetize?
   - Courses/mentorias
   - Consultoria
   - Produtos digitais
4. **Current setup:** What tools are they using?
   - Checkout platform (competitor signal)
   - Site/landing page presence
   - Instagram engagement

### Step 3: Cross-Reference with Ensinio Pillars
Match their needs to Ensinio pillars:
- **LMS / Área de Membros:** Need course hosting?
- **Pagamentos:** Need checkout/payment integration?
- **Gamificação:** Want engagement features?
- **Certificados:** Need certification system?
- **Comunidade:** Building community?
- **Automações:** Need automation/email/workflows?

For each pillar match:
- Identify specific solutions that fit
- Note pain points addressed
- Rate strength of fit (1-10)

### Step 4: Detect Competitor Usage Signal
If checkout platform detected:
- **High-value competitors (Hotmart, Kiwify, Eduzz):** +2 temperature boost
  - They're already selling digital products
  - Strong signal they need integrated platform
- **Payment gateways (Pagar.me, MercadoPago):** +1 boost
  - They need checkout but may lack LMS
- **Unknown/no checkout:** No boost

### Step 5: Calculate Base Temperature Score
Start with base score:
- **9-10:** Express need for Ensinio-like solution
  - Mentions needing "plataforma de cursos"
  - Has courses but no hosting
  - Wants to leave current platform
- **7-8:** Strong fit, clear project that benefits
  - Sells digital products
  - Has checkout but needs LMS
  - Growing audience
- **5-6:** Moderate fit, some solutions apply
  - Has business but not digital-first
  - Small audience but growing
- **3-4:** Weak fit, tangential need
  - Very small operation
  - No digital products yet
- **1-2:** Very weak, minimal connection
  - Wrong niche (physical products only)
  - No monetization model

### Step 6: Apply Score Boosters
Adjust score based on enriched data:
- **Instagram followers > 10k:** +1
- **Instagram followers > 50k:** +2
- **Active posting (3+ recent posts):** +0.5
- **Checkout platform is competitor:** +1 to +2 (see Step 4)
- **Site with clear services:** +0.5
- **Target audience aligned with Ensinio:** +0.5

### Step 7: Classify Prospect Type
Determine classification:
- **potential_client:** Has business that can directly use Ensinio
  - Sells courses/mentorias
  - Has digital products
  - Needs LMS/checkout/community
- **partner:** Influencer/promoter fit for partner program
  - Large audience (10k+)
  - Engaged community
  - Could promote Ensinio to audience

### Step 8: Identify Nicho and ICP Fit
Categorize:
- **Nicho:** Marketing digital, fitness, culinária, etc.
- **ICP Fit:** How well do they match Ensinio's ideal customer?
  - **high:** Perfect fit (digital creator with products)
  - **medium:** Good fit (building digital presence)
  - **low:** Weak fit (not digital-first)

### Step 9: Extract Pain Points
Based on analysis, identify specific pain points:
- "Precisa de área de membros"
- "Quer integrar checkout com curso"
- "Paga taxas altas na plataforma atual"
- "Precisa de certificados automáticos"
- "Quer gamificar curso"

### Step 10: Generate Analysis Notes
Write 1-2 sentences summarizing:
- Why this score was assigned
- Key strengths/weaknesses
- Recommended approach

### Step 11: Output Complete Analysis
Return structured JSON with all fields.

## Acceptance Criteria
- Business profile understood from enriched data
- Ensinio pillars matched with justification
- Temperature score 1-10 with logic explained
- Prospect type classified (client vs partner)
- Competitor usage signal incorporated
- Instagram metrics factored into score
- Pain points identified
- Nicho and ICP fit determined
- Analysis notes written

## Veto Conditions
- **BLOCKING:** Enriched lead data not available
- **BLOCKING:** Ensinio KB not loaded
- **BLOCKING:** Scoring criteria not loaded
- **WARNING:** Enrichment score < 4 (insufficient data for accurate scoring)
- **WARNING:** No Instagram bio or site data (limited context)

## Output Example
```json
{
  "nome": "Maria",
  "sobrenome": "Silva",
  "phone": "+5511999887766",
  "email": "maria@silva.com",
  "instagram_username": "mariasilva",
  "instagram_followers": "12500",
  "site_url": "https://mariasilva.com.br",
  "site_summary": "Consultoria de marketing digital focada em pequenos empreendedores",
  "checkout_platform": "Hotmart",
  "nicho": "Marketing Digital",
  "icp_fit": "high",
  "temperature_score": 9,
  "prospect_type": "potential_client",
  "primary_pillar": "LMS / Área de Membros",
  "matching_pillars": ["LMS", "Pagamentos", "Certificados"],
  "matching_solutions": [
    "Área de membros para cursos",
    "Checkout integrado",
    "Certificados automáticos"
  ],
  "pain_points": [
    "Usa Hotmart mas precisa área de membros própria",
    "Quer integrar checkout com LMS",
    "Precisa certificados personalizados"
  ],
  "analysis_notes": "Forte candidata - já vende cursos na Hotmart com audiência engajada de 12k no Instagram. Precisa de plataforma integrada para consolidar LMS + checkout + certificados. ICP perfeito.",
  "score_boosters": [
    "Followers > 10k: +1",
    "Checkout competitor (Hotmart): +2",
    "Active posting: +0.5"
  ],
  "final_score_calculation": "Base 7 + boosters 3.5 = 9 (capped at 10)"
}
```

## Error Handling
- **No enriched data:** HALT and request enrich-instagram task completion
- **KB not found:** HALT and request KB loading
- **Scoring criteria missing:** HALT and request criteria file creation
- **Insufficient data for scoring:** Assign conservative score (5) with flag

## Completion Criteria
Prospect analyzed with temperature score, pillars matched, pain points identified, ready for outreach generation
