# Task: Handle Parse Errors

## Task Anatomy
- **task_name:** handle-parse-errors
- **status:** active
- **responsible_executor:** chat-parser (Cipher)
- **execution_type:** Agent (requires interpretation of error context)
- **input:** Error details from parse-chat-export failure
- **output:** Diagnostic report with recovery suggestions

## Action Items

### Step 1: Classify Error Type
Identify which category the error falls into:

| Error Type | Symptom | Severity |
|------------|---------|----------|
| `zip_corrupted` | Cannot extract ZIP file | BLOCKING |
| `no_chat_file` | ZIP extracted but no `_chat.txt` found | BLOCKING |
| `empty_export` | `_chat.txt` exists but is empty | BLOCKING |
| `encoding_error` | Garbled characters, mojibake | RECOVERABLE |
| `format_unknown` | Timestamps not matching known patterns | RECOVERABLE |
| `ios_format` | iOS-specific format detected (different from Android) | RECOVERABLE |
| `partial_parse` | Some messages parsed, some failed | RECOVERABLE |
| `no_contacts` | File parsed but 0 contacts extracted | BLOCKING |

### Step 2: Attempt Recovery (if RECOVERABLE)

**For `encoding_error`:**
1. Try re-reading with Latin-1 encoding
2. Try re-reading with Windows-1252
3. If still garbled, report which lines are affected

**For `format_unknown`:**
1. Sample first 10 lines of the file
2. Check for known format variations:
   - Android BR: `[DD/MM/YYYY, HH:MM:SS]`
   - Android EN: `MM/DD/YY, HH:MM`
   - iOS BR: `[DD/MM/YYYY HH:MM:SS]`
   - iOS EN: `[M/D/YY, HH:MM:SS]`
3. If pattern detected, retry with correct regex
4. If no pattern matches, output sample lines for user inspection

**For `ios_format`:**
1. Apply iOS-specific parsing rules (no brackets, different separator)
2. Retry parse with adjusted regex

**For `partial_parse`:**
1. Report success rate (X/Y messages parsed)
2. Sample 5 failed lines
3. If success rate > 70%, continue with partial data + warning
4. If success rate < 70%, HALT

### Step 3: Generate Diagnostic Report
Output diagnostic report with schema defined in Output Example section.

## Acceptance Criteria
- Error type correctly classified into one of 8 categories
- Severity level (BLOCKING or RECOVERABLE) determined
- Recovery attempted for all RECOVERABLE errors
- Recovery success/failure clearly documented
- If recovery successful: parse operation retried and results reported
- If recovery failed: clear diagnostic with sample data provided
- User action required (if any) clearly stated

## Veto Conditions

| Condition | Severity | Resolution |
|-----------|----------|------------|
| No error details available | BLOCKING | Cannot diagnose without error context |
| ZIP file completely inaccessible | BLOCKING | User must provide valid ZIP file |
| Recovery attempted but < 70% success rate | WARNING | Document partial success, flag for manual review |

## Output Example

### Unrecoverable Error
```json
{
  "error_type": "format_unknown",
  "severity": "RECOVERABLE",
  "recovery_attempted": true,
  "recovery_successful": false,
  "file_info": {
    "filename": "_chat.txt",
    "size_bytes": 1234567,
    "encoding_detected": "utf-8",
    "total_lines": 5000,
    "sample_lines": [
      "15/03/2025, 14:30 - Joao: Oi pessoal",
      "15/03/2025, 14:31 - Maria: Ola!"
    ]
  },
  "diagnosis": "Formato Android BR sem colchetes - variante rara",
  "suggested_fix": "Ajustar regex para aceitar formato sem colchetes",
  "user_action_required": "Confirmar se o export e de Android ou iOS"
}
```

### Successful Recovery
```json
{
  "error_type": "encoding_error",
  "severity": "RECOVERABLE",
  "recovery_attempted": true,
  "recovery_successful": true,
  "recovery_method": "Re-read with Latin-1 encoding",
  "result": "Parse retried successfully with 150 contacts extracted",
  "warnings": ["3 messages with unrecoverable characters were skipped"]
}
```

## Error Handling
- **Multiple errors detected:** Classify and report the most severe first
- **Recovery loop detected (same error 3x):** HALT, escalate to user
- **Unknown error type:** Classify as `unknown`, report raw error message
- **Partial recovery (some fixes worked):** Document both successes and failures

## Completion Criteria
Error classified and documented, recovery attempted if possible, clear report for user with next steps. If BLOCKING and unrecoverable: clear message about what the user needs to fix.
