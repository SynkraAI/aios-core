# Task: Send Email via Microsoft 365

## Metadata
```yaml
id: o365-send-email
name: Send Email
agent: o365-agent
version: 1.0.0
```

## Description

Sends an email through Microsoft 365 with optional attachments and formatting.

## Input Schema

```typescript
interface O365SendEmailInput {
  to: string | string[];     // Required: Recipient(s)
  subject: string;           // Required: Email subject
  body: string;              // Required: Email body (HTML or plain text)
  cc?: string | string[];    // Optional: CC recipients
  bcc?: string | string[];   // Optional: BCC recipients
  from?: string;             // Optional: Sender (if permitted)
  replyTo?: string;          // Optional: Reply-to address
  attachments?: Array<{      // Optional: Attachments
    name: string;
    path?: string;           // Local file path
    content?: string;        // Base64 content
    contentType?: string;
  }>;
  importance?: 'low' | 'normal' | 'high'; // Optional: Message importance
  isHtml?: boolean;          // Optional: Body is HTML (default: true)
  saveToSentItems?: boolean; // Optional: Save to sent (default: true)
}
```

## Output Schema

```typescript
interface O365SendEmailOutput {
  success: boolean;
  messageId: string;         // Message ID
  internetMessageId: string; // Internet message ID
  recipients: string[];      // Recipients sent to
  timestamp: string;         // Send timestamp
}
```

## Implementation

```javascript
async function sendO365Email(input) {
  const { GraphClient } = require('../tools/graph-client');
  const fs = require('fs');
  const path = require('path');
  const client = new GraphClient();

  // Normalize recipients
  const toRecipients = Array.isArray(input.to) ? input.to : [input.to];
  const ccRecipients = input.cc ? (Array.isArray(input.cc) ? input.cc : [input.cc]) : [];
  const bccRecipients = input.bcc ? (Array.isArray(input.bcc) ? input.bcc : [input.bcc]) : [];

  // Build message payload
  const message = {
    subject: input.subject,
    body: {
      contentType: input.isHtml !== false ? 'HTML' : 'Text',
      content: input.body
    },
    toRecipients: toRecipients.map(email => ({
      emailAddress: { address: email }
    })),
    importance: input.importance || 'normal'
  };

  // Add CC recipients
  if (ccRecipients.length > 0) {
    message.ccRecipients = ccRecipients.map(email => ({
      emailAddress: { address: email }
    }));
  }

  // Add BCC recipients
  if (bccRecipients.length > 0) {
    message.bccRecipients = bccRecipients.map(email => ({
      emailAddress: { address: email }
    }));
  }

  // Add reply-to
  if (input.replyTo) {
    message.replyTo = [{
      emailAddress: { address: input.replyTo }
    }];
  }

  // Handle attachments
  if (input.attachments && input.attachments.length > 0) {
    message.attachments = [];

    for (const attachment of input.attachments) {
      let contentBytes;

      if (attachment.path) {
        // Read from file
        const fileContent = fs.readFileSync(attachment.path);
        contentBytes = fileContent.toString('base64');
      } else if (attachment.content) {
        contentBytes = attachment.content;
      }

      message.attachments.push({
        '@odata.type': '#microsoft.graph.fileAttachment',
        name: attachment.name || path.basename(attachment.path || 'attachment'),
        contentBytes,
        contentType: attachment.contentType || 'application/octet-stream'
      });
    }
  }

  // Send the email
  const response = await client.sendMail({
    message,
    saveToSentItems: input.saveToSentItems !== false
  });

  return {
    success: true,
    messageId: response.id || 'sent',
    internetMessageId: response.internetMessageId || '',
    recipients: [...toRecipients, ...ccRecipients],
    timestamp: new Date().toISOString()
  };
}

module.exports = { sendO365Email };
```

## Usage Examples

### Simple Email
```bash
@o365 *send-email \
  --to "team@company.com" \
  --subject "Test Report Ready" \
  --body "The test report for Sprint 15 is now available."
```

### HTML Email
```bash
@o365 *send-email \
  --to "team@company.com,stakeholders@company.com" \
  --subject "Sprint 15 Test Report" \
  --importance "high" \
  --body "$(cat <<'EOF'
<h1>Sprint 15 Test Report</h1>
<p>Test execution completed successfully.</p>

<h2>Summary</h2>
<table border="1" cellpadding="8">
  <tr>
    <th>Metric</th>
    <th>Value</th>
  </tr>
  <tr>
    <td>Total Tests</td>
    <td>142</td>
  </tr>
  <tr>
    <td>Passed</td>
    <td style="color: green;">139</td>
  </tr>
  <tr>
    <td>Failed</td>
    <td style="color: red;">3</td>
  </tr>
</table>

<p><a href="https://confluence.company.com/pages/12345">View Full Report</a></p>
EOF
)"
```

### Email with Attachment
```bash
@o365 *send-email \
  --to "manager@company.com" \
  --cc "team@company.com" \
  --subject "Weekly Test Report - $(date +%Y-%m-%d)" \
  --body "<p>Please find attached the weekly test report.</p>" \
  --attachments '[{"path": "./reports/weekly-report.pdf", "name": "weekly-report.pdf"}]'
```

### Multiple Recipients
```bash
@o365 *send-email \
  --to '["qa@company.com", "dev@company.com"]' \
  --cc "pm@company.com" \
  --bcc "audit@company.com" \
  --subject "Release 1.2.0 - QA Sign-off" \
  --body "QA has signed off on Release 1.2.0. All tests passed."
```

## Email Templates

### Test Pass Notification
```html
<div style="font-family: Arial, sans-serif;">
  <h1 style="color: #28a745;">✅ Tests Passed</h1>
  <p><strong>Project:</strong> ${project}</p>
  <p><strong>Execution:</strong> ${execution_key}</p>

  <table style="border-collapse: collapse; width: 100%;">
    <tr style="background: #f5f5f5;">
      <th style="padding: 8px; text-align: left;">Metric</th>
      <th style="padding: 8px; text-align: right;">Value</th>
    </tr>
    <tr>
      <td style="padding: 8px;">Passed</td>
      <td style="padding: 8px; text-align: right; color: green;">${passed}</td>
    </tr>
    <tr>
      <td style="padding: 8px;">Failed</td>
      <td style="padding: 8px; text-align: right; color: red;">${failed}</td>
    </tr>
    <tr>
      <td style="padding: 8px;">Duration</td>
      <td style="padding: 8px; text-align: right;">${duration}</td>
    </tr>
  </table>

  <p><a href="${report_url}">View Full Report</a></p>
</div>
```

### Test Failure Alert
```html
<div style="font-family: Arial, sans-serif;">
  <h1 style="color: #dc3545;">❌ Tests Failed</h1>
  <p><strong>Immediate attention required!</strong></p>

  <h2>Failed Tests</h2>
  <ul>
    ${failed_tests_list}
  </ul>

  <h2>Actions Required</h2>
  <ol>
    <li>Review failed tests in Xray</li>
    <li>Create bug reports if new issues found</li>
    <li>Notify development team</li>
  </ol>

  <p><a href="${execution_url}" style="background: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Execution</a></p>
</div>
```

## Integration Examples

### From Xray Results
```bash
# Get Xray results and send email
results=$(@xray *coverage-report --testPlan PROJ-100 --format json)
passed=$(echo "$results" | jq '.summary.passed')
failed=$(echo "$results" | jq '.summary.failed')

@o365 *send-email \
  --to "team@company.com" \
  --subject "Test Results: $passed passed, $failed failed" \
  --body "<p>Test execution complete. <a href='...'>View Report</a></p>"
```

### CI/CD Notification
```yaml
# GitHub Actions
- name: Send Test Results Email
  if: always()
  run: |
    @o365 *send-email \
      --to "ci-notifications@company.com" \
      --subject "CI Build #${{ github.run_number }} - ${{ job.status }}" \
      --importance "${{ job.status == 'failure' && 'high' || 'normal' }}" \
      --body "<p>Build ${{ job.status }} for ${{ github.repository }}</p>"
```

## Output Example

```json
{
  "success": true,
  "messageId": "AAMkAGI2...",
  "internetMessageId": "<message-id@company.onmicrosoft.com>",
  "recipients": ["team@company.com", "stakeholders@company.com"],
  "timestamp": "2026-02-04T10:30:00.000Z"
}
```

## Error Handling

| Error Code | Description | Resolution |
|------------|-------------|------------|
| 401 | Unauthorized | Check MS365 credentials |
| 403 | Forbidden | Check Mail.Send permission |
| 400 | Bad request | Validate email addresses |
| 413 | Attachment too large | Reduce attachment size (<25MB) |

## Related Tasks

- `o365-send-teams` - Post to Teams instead
- `o365-read-inbox` - Check for replies
- `confluence-create-page` - Create linked documentation
