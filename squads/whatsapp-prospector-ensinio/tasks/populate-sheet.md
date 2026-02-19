# Task: Populate Google Sheets

## Task Anatomy
- **task_name:** populate-sheet
- **status:** active
- **responsible_executor:** prospector-chief (Atlas)
- **execution_type:** Hybrid
- **input:**
  - Complete prospect data with messages and links
  - Google Sheets access via MCP tools
  - Spreadsheet ID: 124EQQAkmt9D7-49LbR-Jx64DhxdtCwceUQgqolk5ZFI
- **output:**
  - Populated Google Sheets
  - Summary report with distribution stats

## Action Items

### Step 1: Prepare Data
Organize all prospect data into rows matching the sheet columns:
- Column A: Nome (first name only)
- Column B: Telefone (format: +553199999-9999)
- Column C: Grupo do WhatsApp de origem
- Column D: Nome/nicho do projeto
- Column E: Explicacao detalhada do projeto
- Column F: Mensagem do WhatsApp (raw text)
- Column G: Link WhatsApp direto (with encoded message)

### Step 2: Sort Data
Order rows by temperature score (highest first) for prioritization.

### Step 3: Write Header Row
If sheet is empty, write header row in A1:G1:
```
Nome | Telefone | Grupo WhatsApp | Projeto/Nicho | Descricao do Projeto | Mensagem WhatsApp | Link Direto
```

### Step 4: Populate Rows
Write each prospect as a new row starting from row 2.
Use the Google Sheets MCP tools to write data.

### Step 5: Validate
1. Verify all rows were written correctly
2. Check that WhatsApp links in column G are clickable
3. Report total prospects added

## Acceptance Criteria
- All approved prospects written to sheet
- Data sorted by temperature (highest first)
- All 7 columns populated correctly
- WhatsApp links clickable in column G
- Summary report generated with distribution stats

## Veto Conditions
- **BLOCKING:** Outreach batch not validated (QG-003 not passed)
- **BLOCKING:** Google Sheets access not available
- **BLOCKING:** No approved messages to populate
- **WARNING:** Some rows missing WhatsApp links
- **WARNING:** Sheet already has data (append vs overwrite decision needed)

## Output Example
```yaml
summary:
  total_rows_written: 23
  sheet_url: "https://docs.google.com/spreadsheets/d/124EQQAkmt9D7-49LbR-Jx64DhxdtCwceUQgqolk5ZFI"
  temperature_distribution:
    hot_9_10: 3
    warm_7_8: 8
    moderate_5_6: 7
    cool_3_4: 5
  by_type:
    potential_client: 18
    partner: 5
  validation:
    all_links_valid: true
    all_rows_written: true
```

## Input Example
```json
{
  "prospects": [
    {
      "name": "Joao",
      "phone": "+5531999999999",
      "group_origin": "Grupo Marketing Digital",
      "project_name": "Curso de Fotografia Online",
      "project_description": "Joao tem um curso de fotografia e precisa de uma plataforma com area de membros, checkout e certificados.",
      "raw_message": "Oi Joao! Tudo bem?\n\nMeu nome e Antonio, trabalho com o Fosc...",
      "whatsapp_link": "https://api.whatsapp.com/send?phone=5531999999999&text=Oi%20Joao%21%20Tudo%20bem%3F%0A%0AMeu%20nome%20e%20Antonio...",
      "temperature_score": 8
    }
  ]
}
```

## Error Handling
- **Sheet access denied:** HALT, report permission error and ask user to share sheet
- **Row write failure:** Retry once, then skip row and report in summary
- **Invalid link detected:** Flag row in summary, do not skip (write without link)

## Completion Criteria
All qualified prospects in sheet, sorted by temperature, links validated, summary report generated
