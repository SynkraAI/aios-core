# Task: Notify Team

## Task Anatomy
- **task_name:** notify-team
- **status:** active
- **responsible_executor:** crm-syncer (Nexus)
- **execution_type:** Agent
- **model_tier:** haiku
- **input:**
  - Processed prospect data (name, score, type, pillar, outreach message preview)
  - Slack webhook URL (SLACK_WEBHOOK_URL env var)
- **output:**
  - Slack notification confirmation
  - HTTP response status

## Action Items

### Step 1: Load Configuration
1. Load environment variable: `SLACK_WEBHOOK_URL` (required)
2. Validate webhook URL is present and starts with `https://hooks.slack.com/`
3. If not set: HALT with error "SLACK_WEBHOOK_URL not configured"

### Step 2: Format Slack Message
Build a Slack Block Kit message with prospect summary:

```json
{
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "🎯 Novo Lead Processado — Ensinio Prospector"
      }
    },
    {
      "type": "section",
      "fields": [
        {
          "type": "mrkdwn",
          "text": "*Nome:*\n{nome} {sobrenome}"
        },
        {
          "type": "mrkdwn",
          "text": "*Score:*\n{temperature_score}/10 ({temperature_label})"
        },
        {
          "type": "mrkdwn",
          "text": "*Tipo:*\n{prospect_type}"
        },
        {
          "type": "mrkdwn",
          "text": "*Pilar:*\n{primary_pillar}"
        },
        {
          "type": "mrkdwn",
          "text": "*Instagram:*\n@{instagram_username}"
        },
        {
          "type": "mrkdwn",
          "text": "*Checkout:*\n{checkout_platform}"
        }
      ]
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Preview da mensagem:*\n> {first_line_of_outreach}..."
      }
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "📱 Abrir WhatsApp"
          },
          "url": "{whatsapp_link}"
        }
      ]
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "Processado por Ensinio Prospector v1.0 | {timestamp}"
        }
      ]
    }
  ]
}
```

### Step 3: Temperature Label Mapping
Map score to human-readable label:
- Score 9-10: "🔥 Quente"
- Score 7-8: "🟠 Morno-Quente"
- Score 5-6: "🟡 Morno"
- Score 3-4: "🔵 Frio"
- Score 1-2: "⚪ Muito Frio"

### Step 4: Send Webhook
Send HTTP POST to Slack webhook:

```bash
curl -X POST "{SLACK_WEBHOOK_URL}" \
  -H "Content-Type: application/json" \
  -d '{slack_message_json}'
```

### Step 5: Verify Response
- 200: Success — notification sent
- 400: Bad request — check message format
- 403: Forbidden — webhook URL invalid or revoked
- 404: Not found — webhook URL incorrect
- 500: Slack server error — retry once after 5s

### Step 6: Error Notification (on pipeline failure)
If the pipeline failed at any stage, send error notification instead:

```json
{
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "⚠️ Pipeline Error — Ensinio Prospector"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Lead:* {nome}\n*Fase:* {failed_phase}\n*Erro:* {error_message}\n*Acao:* Revisar manualmente"
      }
    }
  ]
}
```

## Acceptance Criteria
- Slack notification sent with correct lead summary
- Score displayed with temperature label
- WhatsApp link button functional
- Timestamp included
- Error notifications sent when pipeline fails

## Veto Conditions
- **BLOCKING:** SLACK_WEBHOOK_URL not set
- **BLOCKING:** Webhook URL format invalid
- **WARNING:** Slack returns non-200 (retry once)
- **NON-BLOCKING:** Button URL not clickable (still send text)

## Output Example
```json
{
  "status": "sent",
  "channel": "#ensinio-prospects",
  "response_code": 200,
  "message_summary": "Lead: Maria Silva | Score: 9/10 (Quente) | Tipo: client",
  "timestamp": "2026-02-19T15:30:00Z"
}
```

## Completion Criteria
Slack notification sent with lead summary, score, type, WhatsApp link, and timestamp. Team can review and act on the lead immediately.
