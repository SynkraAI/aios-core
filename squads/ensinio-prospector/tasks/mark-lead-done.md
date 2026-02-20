# Task: Mark Lead Done

## Task Anatomy
- **task_name:** mark-lead-done
- **status:** active
- **responsible_executor:** prospector-chief (Atlas)
- **execution_type:** Agent
- **model_tier:** haiku
- **input:**
  - Google Sheets spreadsheet ID and sheet name
  - Row number of the processed lead
  - Enriched data to update in the sheet
- **output:**
  - Sheet update confirmation
  - Updated row details

## Action Items

### Step 1: Identify Row to Update
Use the row number captured during fetch-sheets-lead task.
The lead's row in the spreadsheet must be identified by:
- Row number (preferred, captured during fetch)
- OR search by phone/email match if row number not available

### Step 2: Update Status Column
Use MCP Google Workspace to update the Status column:

```
Tool: mcp__google-workspace__sheets_getRange
Purpose: Verify current row data before update

Tool: mcp__google-workspace__sheets_update (or equivalent)
Purpose: Update the row
```

Update the Status column value:
- **From:** "Fila"
- **To:** "Processado"

### Step 3: Update Enriched Fields
If the spreadsheet has columns for enriched data, update them:

| Column | Field | Value |
|--------|-------|-------|
| Status | Status | "Processado" |
| Instagram Username | instagram_username | "@{username}" |
| Score | temperature_score | "{score}/10" |
| Tipo | prospect_type | "client" or "partner" |
| Pilar | primary_pillar | "{pillar_name}" |
| Checkout Platform | checkout_platform | "{platform_name}" |
| Data Processamento | processed_date | "{current_date}" |

**NOTE:** Only update columns that exist in the spreadsheet. Do not add new columns without user confirmation.

### Step 4: Verify Update
Read the updated row back to confirm:
1. Status = "Processado"
2. Enriched fields populated (if columns exist)
3. No data corruption in other columns

### Step 5: Log Completion
Return confirmation object with:
- Row number updated
- Fields changed
- Timestamp
- Verification status

## Acceptance Criteria
- Lead status changed from "Fila" to "Processado"
- Enriched data columns updated (if they exist)
- Update verified by re-reading the row
- No other rows affected
- No data loss in existing columns

## Veto Conditions
- **BLOCKING:** Spreadsheet ID not provided
- **BLOCKING:** Row number not identified
- **BLOCKING:** MCP Google Workspace not authenticated
- **WARNING:** Enriched columns don't exist (skip enriched update, only update Status)
- **WARNING:** Row already has Status != "Fila" (may be duplicate processing)

## Output Example
```json
{
  "status": "updated",
  "spreadsheet_id": "1abc...xyz",
  "sheet_name": "Leads",
  "row_number": 42,
  "fields_updated": {
    "Status": "Processado",
    "Instagram Username": "@mariasilva",
    "Score": "9/10",
    "Tipo": "client",
    "Pilar": "LMS / Area de Membros",
    "Data Processamento": "2026-02-19"
  },
  "verified": true,
  "timestamp": "2026-02-19T15:35:00Z"
}
```

## Error Handling
- **Auth error:** HALT - user must re-authenticate MCP Google Workspace
- **Spreadsheet not found:** HALT - check spreadsheet ID
- **Row not found:** Search by phone/email as fallback
- **Permission denied:** HALT - check sharing permissions
- **Rate limit:** Wait 60s and retry (max 3 attempts)

## Completion Criteria
Lead row updated in Google Sheets with Status = "Processado" and enriched data fields populated. Update verified by re-reading the row.
