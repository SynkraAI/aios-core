# Task: Enrich Instagram Profile

## Task Anatomy
- **task_name:** enrich-instagram
- **status:** active
- **responsible_executor:** instagram-researcher (Scout)
- **execution_type:** Agent
- **input:**
  - Lead data with instagram_username
  - Optional site URL from lead data
- **output:**
  - Enriched data object (JSON)
  - Instagram profile data
  - Site summary and services

## Action Items

### Step 1: Validate Input
1. Confirm instagram_username is present
2. If no username → skip enrichment, return empty enrichment object
3. Confirm MCP EXA is available

### Step 2: Fetch Instagram Profile Data
1. Use EXA MCP tool: `mcp__exa__company_research_exa`
2. Query: `instagram.com/{instagram_username}`
3. Extract from results:
   - Bio text
   - Follower count (if available)
   - Recent posts (titles/topics)
   - Posting frequency
   - External link in bio

### Step 3: Parse Instagram Data
From EXA results, extract:
- **instagram_bio:** Full bio text
- **instagram_followers:** Follower count (number or "N/A")
- **recent_posts:** Array of recent post topics/titles (max 5)
- **site_url:** External link from bio (if present)

### Step 4: Fetch Site Data (if site URL found)
If site_url extracted OR provided in lead data:
1. Use EXA MCP tool: `mcp__exa__web_search_exa`
2. Query: site_url domain
3. Extract from results:
   - Company description
   - Services offered
   - Target audience
   - Business model

### Step 5: Parse Site Data
From site analysis, extract:
- **site_summary:** 2-3 sentence description of business
- **services:** Array of services/products offered
- **target_audience:** Who they serve (audience description)
- **business_model:** How they monetize (courses, consultoria, etc.)

### Step 6: Run Enrichment Quality Checklist
Check:
- [ ] Instagram bio retrieved
- [ ] At least 1 recent post topic captured
- [ ] Site URL identified (from bio or lead data)
- [ ] Site summary generated
- [ ] Services list populated
- [ ] Target audience identified

Calculate enrichment_score (1-10):
- Bio found: +2
- Followers count: +1
- Recent posts (3+): +2
- Site URL found: +1
- Site summary: +2
- Services identified: +1
- Target audience: +1

### Step 7: Return Enriched Object
Generate complete enrichment data with all fields.

## Acceptance Criteria
- Instagram profile data retrieved via EXA
- Bio, followers, recent posts extracted
- Site URL identified (bio link or provided)
- Site summary and services analyzed
- Enrichment quality score calculated
- All data structured in JSON format

## Veto Conditions
- **BLOCKING:** No instagram_username provided
- **BLOCKING:** MCP EXA not available
- **WARNING:** Instagram profile not found (private/deleted)
- **WARNING:** No site URL in bio or lead data
- **WARNING:** Site URL returns 404/500
- **WARNING:** Enrichment score < 4 (low data quality)

## Output Example
```json
{
  "instagram_bio": "Consultora de marketing digital | Ajudo empreendedores a venderem mais online | DM aberta",
  "instagram_followers": "12500",
  "recent_posts": [
    "Como criar funil de vendas que converte",
    "3 erros que fazem você perder seguidores",
    "Minha rotina de criação de conteúdo"
  ],
  "site_url": "https://mariasilva.com.br",
  "site_summary": "Consultoria de marketing digital focada em pequenos empreendedores. Oferece mentorias, cursos online e assessoria em redes sociais.",
  "services": [
    "Mentoria individual",
    "Curso de marketing digital",
    "Gestão de tráfego pago",
    "Consultoria em redes sociais"
  ],
  "target_audience": "Pequenos e médios empreendedores que querem crescer no digital",
  "business_model": "Cursos online + mentorias + consultoria",
  "enrichment_score": 9
}
```

## Error Handling
- **Instagram profile not found:** Continue with partial data (bio = "N/A")
- **EXA API timeout:** Retry once, then continue with partial data
- **Site URL unreachable:** Skip site analysis, continue with Instagram data only
- **EXA API rate limit:** Wait 30s and retry (max 2 attempts)
- **All enrichment fails:** Return minimal object with enrichment_score = 0

## Completion Criteria
Instagram profile analyzed, site data extracted (if available), enrichment score calculated, ready for analysis phase
