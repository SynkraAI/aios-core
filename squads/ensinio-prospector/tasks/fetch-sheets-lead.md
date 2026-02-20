# Task: Fetch Sheets Lead

## Task Anatomy
- **task_name:** fetch-sheets-lead
- **status:** active
- **responsible_executor:** prospector-chief (Atlas)
- **execution_type:** Agent
- **input:**
  - Google Sheets ID from settings
  - Sheet name (default: "Sheet1")
- **output:**
  - Lead data object (JSON)
  - Instagram username extracted
  - Row index for later update

## Action Items

### Step 1: Load Configuration
1. Load Google Sheets ID from squad settings
2. Confirm MCP Google Workspace is available
3. Set target sheet name (default: "Sheet1")

### Step 2: Read Sheet Data
1. Use MCP Google Workspace tool: `mcp__google-workspace__sheets_getRange`
2. Read entire sheet data
3. Locate header row (Nome, Sobrenome, Empresa, etc.)
4. Parse column positions

### Step 3: Find Next Lead
1. Iterate through rows starting from row 2
2. Find first row where Status column = "Fila"
3. If none found → return null (no leads to process)
4. Store row index for later update

### Step 4: Extract Lead Data
For the target row, extract:
- **nome:** First name
- **sobrenome:** Last name
- **empresa:** Company name
- **telefone:** Phone number
- **email:** Email address
- **instagram_url:** Instagram profile URL
- **checkout_url:** Checkout page URL
- **ticket:** Ticket/product value
- **status:** Current status (should be "Fila")

### Step 5: Extract Instagram Username
1. Parse instagram_url using regex: `instagram\.com/([^/?]+)`
2. Extract username (without @)
3. Store as `instagram_username`
4. If no Instagram URL → set username to null

### Step 6: Validate Required Fields
Check:
- [ ] Nome is present (not empty)
- [ ] At least one contact method: telefone OR email
- [ ] If telefone: must match pattern `+55` or start with digits

### Step 7: Return Lead Object
Generate complete lead data object with all fields.

## Acceptance Criteria
- Sheet successfully read via MCP Google Workspace
- First "Fila" status row located
- All columns extracted
- Instagram username parsed from URL
- Required fields validated
- Row index stored for later update

## Veto Conditions
- **BLOCKING:** Google Sheets ID not configured
- **BLOCKING:** MCP Google Workspace not available
- **BLOCKING:** Sheet inaccessible (permission error)
- **BLOCKING:** No rows with Status = "Fila"
- **WARNING:** Lead missing nome
- **WARNING:** Lead missing both telefone AND email

## Output Example
```json
{
  "row_index": 5,
  "nome": "Maria",
  "sobrenome": "Silva",
  "empresa": "Silva Consultoria",
  "telefone": "+5511999887766",
  "email": "maria@silva.com",
  "instagram_url": "https://instagram.com/mariasilva",
  "instagram_username": "mariasilva",
  "checkout_url": "https://pay.hotmart.com/X1Y2Z3",
  "ticket": "497",
  "status": "Fila"
}
```

## Error Handling
- **Sheet not found:** HALT and report error with Sheets ID
- **No "Fila" leads:** Return null gracefully (no error)
- **Invalid Instagram URL:** Continue with instagram_username = null
- **Missing required fields:** Skip lead and find next "Fila" row
- **API rate limit:** Retry with exponential backoff (max 3 attempts)

## Completion Criteria
Lead data extracted from sheet, Instagram username parsed, required fields validated, ready for enrichment
