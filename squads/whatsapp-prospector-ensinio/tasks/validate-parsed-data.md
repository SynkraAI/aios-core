# Task: Validate Parsed Data

## Task Anatomy
- **task_name:** validate-parsed-data
- **status:** active
- **responsible_executor:** chat-parser (Cipher)
- **execution_type:** Hybrid (Worker checklist + Agent interpretation)
- **input:** Parsed contacts output from parse-chat-export
- **output:** Validation report (PASS/FAIL with details)

## Action Items

### Step 1: Load Checklist
Load `checklists/parse-validation-checklist.md` and evaluate each item.

### Step 2: Run BLOCKING Checks
Validate all BLOCKING items from the checklist:

1. **ZIP integrity:** Was the ZIP extracted cleanly?
2. **Chat file found:** Does `_chat.txt` exist?
3. **Non-empty:** File has content?
4. **Contacts extracted:** At least 1 valid contact?
5. **Messages parsed:** At least 10 non-system messages?
6. **System filtering:** All system message types filtered?

If ANY blocking check fails → trigger `handle-parse-errors` task.

### Step 3: Run WARNING Checks
Evaluate quality indicators:

1. **Phone coverage:** What % of contacts have phone numbers?
2. **Encoding quality:** Any garbled names?
3. **Deduplication:** Any duplicate contacts?
4. **Chronological order:** Messages in order per contact?
5. **Group metadata:** Name and date range present?

### Step 4: Generate Metrics
Calculate quality metrics from parsed data:

```json
{
  "total_contacts": 150,
  "contacts_with_phone": 98,
  "phone_coverage": "65%",
  "total_messages": 5000,
  "system_messages_filtered": 320,
  "avg_messages_per_contact": 33,
  "date_range_days": 180,
  "most_active_contacts_top5": ["Joao (145)", "Maria (98)", "Pedro (67)"]
}
```

### Step 5: Output Validation Report
Generate report with schema defined in Output Example section.

## Acceptance Criteria
- All 6 BLOCKING checks executed
- All 5 WARNING checks executed
- Quality metrics calculated accurately
- Clear PASS/FAIL verdict with justification
- If FAIL: specific failed checks and severity documented
- Actionable recommendation provided (proceed, fix, or halt)

## Veto Conditions

| Condition | Severity | Resolution |
|-----------|----------|------------|
| parse-chat-export task not completed | BLOCKING | Cannot validate data that does not exist |
| 0 contacts extracted | BLOCKING | Re-run parse-chat-export or verify ZIP content |
| < 10 non-system messages | BLOCKING | Export appears incomplete, ask user to re-export |
| Phone coverage < 50% | WARNING | Flag as quality concern, document in report |
| Duplicate contacts detected | WARNING | Flag for manual review, may affect analysis accuracy |

## Output Example

### PASS Example
```json
{
  "status": "PASS",
  "blocking_checks": { "passed": 6, "failed": 0 },
  "warning_checks": { "passed": 4, "warnings": 1 },
  "warnings": [
    "Phone coverage at 65% - 52 contacts without phone numbers"
  ],
  "metrics": {
    "total_contacts": 150,
    "contacts_with_phone": 98,
    "phone_coverage": "65%",
    "total_messages": 5000,
    "system_messages_filtered": 320,
    "avg_messages_per_contact": 33,
    "date_range_days": 180,
    "most_active_contacts_top5": ["Joao (145)", "Maria (98)", "Pedro (67)"]
  },
  "recommendation": "Proceed to analysis phase"
}
```

### FAIL Example
```json
{
  "status": "FAIL",
  "blocking_checks": { "passed": 4, "failed": 2 },
  "failed_checks": [
    { "id": "parsing_quality_2", "reason": "Only 3 non-system messages found", "severity": "BLOCKING" },
    { "id": "parsing_quality_5", "reason": "System/total ratio is 95%", "severity": "BLOCKING" }
  ],
  "recommendation": "Export appears incomplete. Ask user to re-export the chat including all messages."
}
```

## Error Handling
- **Missing input data:** HALT, report parse-chat-export task must run first
- **Malformed input JSON:** HALT, report parse-chat-export output is corrupted
- **Checklist not found:** WARN, proceed with hardcoded checks
- **Calculation errors in metrics:** Document which metrics failed, proceed with available data

## Completion Criteria
All BLOCKING checks passed (or task failed with clear report), WARNING items documented, quality metrics available for downstream tasks, clear recommendation generated: proceed or halt.
