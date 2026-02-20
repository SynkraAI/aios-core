# Task: Sync to CRM

## Task Anatomy
- **task_name:** sync-to-crm
- **status:** active
- **responsible_executor:** crm-syncer (Nexus)
- **execution_type:** Agent
- **input:**
  - Complete prospect data (analysis + outreach message)
  - CRM credentials (GOHIGHLEVEL_API_KEY, GOHIGHLEVEL_LOCATION_ID)
  - Field mapping from data/crm-field-mapping.yaml
- **output:**
  - CRM sync confirmation (JSON)
  - Contact ID
  - Note ID
  - Status (created/updated)

## Action Items

### Step 1: Load Configuration
1. Load environment variables:
   - `GOHIGHLEVEL_API_KEY` (required)
   - `GOHIGHLEVEL_LOCATION_ID` (required)
2. Load field mapping from `data/crm-field-mapping.yaml`
3. Validate credentials are present

### Step 2: Search for Existing Contact
Search GoHighLevel for existing contact by phone:

```bash
curl -X GET "https://rest.gohighlevel.com/v1/contacts/search?query={phone}" \
  -H "Authorization: Bearer {GOHIGHLEVEL_API_KEY}" \
  -H "Content-Type: application/json"
```

Check response:
- If contact found → proceed to update (Step 3b)
- If not found → proceed to create (Step 3a)

### Step 3a: Create New Contact
If contact does not exist:

```bash
curl -X POST "https://rest.gohighlevel.com/v1/contacts/" \
  -H "Authorization: Bearer {GOHIGHLEVEL_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "locationId": "{GOHIGHLEVEL_LOCATION_ID}",
    "firstName": "{nome}",
    "lastName": "{sobrenome}",
    "email": "{email}",
    "phone": "{telefone}",
    "tags": ["prospect", "instagram", "ensinio-prospector"],
    "customFields": {
      "instagram_username": "{instagram_username}",
      "instagram_followers": "{instagram_followers}",
      "site_url": "{site_url}",
      "checkout_platform": "{checkout_platform}",
      "temperature_score": "{temperature_score}",
      "prospect_type": "{prospect_type}",
      "primary_pillar": "{primary_pillar}",
      "nicho": "{nicho}",
      "icp_fit": "{icp_fit}"
    }
  }'
```

### Step 3b: Update Existing Contact
If contact exists:

```bash
curl -X PUT "https://rest.gohighlevel.com/v1/contacts/{contact_id}" \
  -H "Authorization: Bearer {GOHIGHLEVEL_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "tags": ["prospect", "instagram", "ensinio-prospector"],
    "customFields": {
      "instagram_username": "{instagram_username}",
      "instagram_followers": "{instagram_followers}",
      "site_url": "{site_url}",
      "checkout_platform": "{checkout_platform}",
      "temperature_score": "{temperature_score}",
      "prospect_type": "{prospect_type}",
      "primary_pillar": "{primary_pillar}",
      "nicho": "{nicho}",
      "icp_fit": "{icp_fit}",
      "last_enrichment_date": "{current_date}"
    }
  }'
```

### Step 4: Map Fields Using crm-field-mapping.yaml
Use field mapping to map prospect data to CRM fields:

```yaml
# data/crm-field-mapping.yaml
gohighlevel:
  standard_fields:
    firstName: nome
    lastName: sobrenome
    email: email
    phone: telefone
    companyName: empresa

  custom_fields:
    instagram_username: instagram_username
    instagram_followers: instagram_followers
    instagram_bio: instagram_bio
    site_url: site_url
    site_summary: site_summary
    checkout_platform: checkout_platform
    temperature_score: temperature_score
    prospect_type: prospect_type
    primary_pillar: primary_pillar
    matching_pillars: matching_pillars
    nicho: nicho
    icp_fit: icp_fit
    enrichment_score: enrichment_score

  tags_mapping:
    score_9_10: ["hot-lead", "high-priority"]
    score_7_8: ["warm-lead", "qualified"]
    score_5_6: ["cold-lead", "nurture"]
    score_3_4: ["low-priority"]
    potential_client: ["client-prospect"]
    partner: ["partner-prospect"]
```

### Step 5: Add Tags Based on Score/Type
Assign tags dynamically:
- Score 9-10: `["hot-lead", "high-priority"]`
- Score 7-8: `["warm-lead", "qualified"]`
- Score 5-6: `["cold-lead", "nurture"]`
- Score 3-4: `["low-priority"]`
- Type: `["client-prospect"]` or `["partner-prospect"]`
- Always: `["prospect", "instagram", "ensinio-prospector"]`

### Step 6: Add Analysis Note
Create a note with analysis details:

```bash
curl -X POST "https://rest.gohighlevel.com/v1/contacts/{contact_id}/notes" \
  -H "Authorization: Bearer {GOHIGHLEVEL_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "🎯 Ensinio Prospector Analysis\n\nScore: {temperature_score}/10\nType: {prospect_type}\nPillar: {primary_pillar}\nNicho: {nicho}\nICP Fit: {icp_fit}\n\nInstagram: @{instagram_username} ({instagram_followers} followers)\nCheckout Platform: {checkout_platform}\n\nPain Points:\n{pain_points}\n\nAnalysis Notes:\n{analysis_notes}\n\nOutreach Message:\n{raw_message}"
  }'
```

### Step 7: Confirm Sync
Check response status:
- 200/201: Success
- Extract contact_id and note_id from response
- Return confirmation object

### Step 8: Handle Errors
Implement retry logic for common errors:
- 429 (Rate Limit): Wait 60s, retry (max 3 attempts)
- 500 (Server Error): Wait 30s, retry (max 2 attempts)
- 401 (Unauthorized): HALT - invalid credentials
- 404 (Not Found): Check endpoint URL

## Acceptance Criteria
- Contact searched in GoHighLevel
- Contact created OR updated based on existence
- All fields mapped using crm-field-mapping.yaml
- Tags assigned based on score/type
- Analysis note added to contact
- Confirmation with contact_id returned

## Veto Conditions
- **BLOCKING:** GOHIGHLEVEL_API_KEY not set
- **BLOCKING:** GOHIGHLEVEL_LOCATION_ID not set
- **BLOCKING:** API returns 401 (Unauthorized)
- **WARNING:** API rate limit (retry with backoff)
- **WARNING:** 500 error (retry, then log and skip if persistent)

## Output Example
```json
{
  "status": "created",
  "contact_id": "abc123def456",
  "note_id": "note789xyz",
  "tags_applied": [
    "prospect",
    "instagram",
    "ensinio-prospector",
    "hot-lead",
    "high-priority",
    "client-prospect"
  ],
  "fields_synced": {
    "firstName": "Maria",
    "lastName": "Silva",
    "email": "maria@silva.com",
    "phone": "+5511999887766",
    "customFields": {
      "instagram_username": "mariasilva",
      "instagram_followers": "12500",
      "temperature_score": "9",
      "prospect_type": "potential_client",
      "primary_pillar": "LMS / Área de Membros",
      "nicho": "Marketing Digital",
      "icp_fit": "high"
    }
  },
  "sync_timestamp": "2026-02-19T14:30:00Z"
}
```

## Error Handling
- **401 Unauthorized:** HALT - check API key and location ID
- **429 Rate Limit:** Retry with exponential backoff (30s, 60s, 120s)
- **500 Server Error:** Retry twice, then log error and skip
- **Network timeout:** Retry once, then log and skip
- **Invalid contact data:** Log error, skip sync, flag for manual review

## Reference: Field Mapping File
The task references `data/crm-field-mapping.yaml` for field mapping configuration.

## Completion Criteria
Contact synced to GoHighLevel CRM with all enriched data, tags applied, analysis note added, confirmation received
